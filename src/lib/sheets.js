import { GTOKEN_STORAGE, SPREADSHEET_ID_STORAGE } from './constants'
import { getItem, setItem } from './storage'

const SPREADSHEET_NAME = 'Expense Tracker'

async function sheetsRequest(spreadsheetId, accessToken, method, path, body) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Sheets error ${res.status}`)
  }
  return res.json()
}

export async function createSpreadsheet(accessToken) {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Expenses', sheetId: 0 } },
        { properties: { title: 'Summary', sheetId: 1 } },
      ],
    }),
  })
  const data = await res.json()
  const id = data.spreadsheetId
  setItem(SPREADSHEET_ID_STORAGE, id)

  // Write headers
  await sheetsRequest(id, accessToken, 'PUT',
    '/values/Expenses!A1:G1?valueInputOption=RAW',
    { values: [['Date', 'Description', 'Category', 'Amount (€)', 'Notes', 'Items (JSON)', 'ID']] }
  )
  return id
}

export async function syncFromSheet(spreadsheetId, accessToken) {
  const data = await sheetsRequest(spreadsheetId, accessToken, 'GET', '/values/Expenses!A2:G2000')
  const rows = data.values || []
  return rows
    .filter(r => r[6])
    .map(r => ({
      date: r[0] || '',
      description: r[1] || '',
      category: r[2] || 'Other',
      amount: parseFloat(r[3]) || 0,
      notes: r[4] || '',
      items: r[5] ? JSON.parse(r[5]) : [],
      id: parseInt(r[6]) || Date.now(),
    }))
}

export async function appendExpense(spreadsheetId, accessToken, expense) {
  await sheetsRequest(
    spreadsheetId, accessToken, 'POST',
    '/values/Expenses!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    {
      values: [[
        expense.date,
        expense.description,
        expense.category,
        expense.amount,
        expense.notes || '',
        JSON.stringify(expense.items || []),
        expense.id,
      ]],
    }
  )
}

export async function deleteExpenseFromSheet(spreadsheetId, accessToken, id) {
  const data = await sheetsRequest(spreadsheetId, accessToken, 'GET', '/values/Expenses!A:G')
  const rows = data.values || []
  const rowIndex = rows.findIndex(r => r[6] == id)
  if (rowIndex < 1) return

  const info = await sheetsRequest(spreadsheetId, accessToken, 'GET', '')
  const sheetId = info.sheets[0].properties.sheetId

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    }),
  })
}

export async function updateSummarySheet(spreadsheetId, accessToken, expenses) {
  const byMonth = {}
  expenses.forEach(e => {
    const m = e.date.slice(0, 7)
    if (!byMonth[m]) byMonth[m] = { total: 0, count: 0, cats: {} }
    byMonth[m].total += parseFloat(e.amount)
    byMonth[m].count++
    byMonth[m].cats[e.category] = (byMonth[m].cats[e.category] || 0) + parseFloat(e.amount)
  })
  const rows = [['Month', 'Total (€)', 'Transactions', 'Top Category']]
  Object.entries(byMonth)
    .sort()
    .reverse()
    .forEach(([m, d]) => {
      const top = Object.entries(d.cats).sort((a, b) => b[1] - a[1])[0]
      rows.push([m, d.total.toFixed(2), d.count, top ? top[0] : ''])
    })

  await sheetsRequest(
    spreadsheetId, accessToken, 'PUT',
    `/values/Summary!A1:D${rows.length}?valueInputOption=RAW`,
    { values: rows }
  )
}
