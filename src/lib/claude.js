import { CATEGORY_NAMES } from './constants'

export async function analyzeExpense({ text, imageBase64, imageMime, apiKey }) {
  const today = new Date().toISOString().split('T')[0]
  const cats = CATEGORY_NAMES.join(', ')

  const systemPrompt = `You extract expense data from receipts or text descriptions and return ONLY a raw JSON object — no markdown, no code fences, no extra text.

Fields to return:
- description: merchant or expense name (string)
- amount: total amount in euros (number, no currency symbol)
- date: ISO date YYYY-MM-DD (use ${today} if unclear)
- category: one of [${cats}]
- notes: a brief note if useful, e.g. "work dinner" (string, can be empty)
- items: array of objects with "name" (string) and "price" (number or null). Extract EVERY line item from the receipt with its individual price. If nothing is detectable, return [].

For supermarket receipts, extract every product with its price. Item prices should sum to approximately the total.`

  const userContent = imageBase64
    ? [
        { type: 'image', source: { type: 'base64', media_type: imageMime, data: imageBase64 } },
        { type: 'text', text: `Analyze this receipt. Extract all line items with individual prices. Today is ${today}. Return ONLY raw JSON.` },
      ]
    : `Analyze this expense: "${text}"\nToday is ${today}.\nReturn ONLY raw JSON.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed.items)) parsed.items = []
  return parsed
}
