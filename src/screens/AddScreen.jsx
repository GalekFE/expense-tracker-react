import { useState, useRef } from 'react'
import { CATEGORY_NAMES, CATEGORIES } from '../lib/constants'
import { analyzeExpense } from '../lib/claude'
import CategoryBadge from '../components/CategoryBadge'
import { useToast } from '../components/Toast'
import styles from './AddScreen.module.css'

export default function AddScreen({ onAdd, anthropicKey }) {
  const [mode, setMode] = useState('ai') // 'ai' | 'manual'

  // AI mode state
  const [uploadedFile, setUploadedFile] = useState(null) // { name, base64, mime }
  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [preview, setPreview] = useState(null) // analyzed result
  const [editFields, setEditFields] = useState({})
  const fileInputRef = useRef()

  // Manual mode state
  const [manual, setManual] = useState({
    description: '', amount: '', date: new Date().toISOString().split('T')[0],
    category: 'Other', notes: '',
  })
  const [manualItems, setManualItems] = useState([])

  const { showToast } = useToast()

  // ── File handling ─────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUploadedFile({
        name: file.name,
        base64: ev.target.result.split(',')[1],
        mime: file.type || 'image/jpeg',
      })
    }
    reader.readAsDataURL(file)
  }

  // ── AI analyze ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!text.trim() && !uploadedFile) { showToast('Add a photo or description first'); return }
    if (!anthropicKey) { showToast('Add your Anthropic API key in Settings first'); return }

    setAnalyzing(true)
    try {
      const result = await analyzeExpense({
        text: text.trim(),
        imageBase64: uploadedFile?.base64,
        imageMime: uploadedFile?.mime,
        apiKey: anthropicKey,
      })
      setPreview(result)
      setEditFields({
        description: result.description || '',
        amount: result.amount || '',
        date: result.date || new Date().toISOString().split('T')[0],
        category: result.category || 'Other',
      })
    } catch (err) {
      showToast(`Analysis failed: ${err.message}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConfirmAI = () => {
    const amt = parseFloat(editFields.amount)
    if (!editFields.description || isNaN(amt) || !editFields.date) {
      showToast('Fill in description, amount and date')
      return
    }
    onAdd({
      id: Date.now(),
      description: editFields.description,
      amount: amt,
      date: editFields.date,
      category: editFields.category,
      notes: preview?.notes || '',
      items: preview?.items || [],
    })
    showToast(`Saved: ${editFields.description} — €${amt.toFixed(2)}`)
    resetAI()
  }

  const resetAI = () => {
    setUploadedFile(null)
    setText('')
    setPreview(null)
    setEditFields({})
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Manual submit ─────────────────────────────────────────────────────
  const handleConfirmManual = () => {
    const amt = parseFloat(manual.amount)
    if (!manual.description || isNaN(amt) || !manual.date) {
      showToast('Fill in description, amount and date')
      return
    }
    const items = manualItems
      .filter(i => i.name.trim())
      .map(i => ({ name: i.name.trim(), price: parseFloat(i.price) || null }))

    onAdd({
      id: Date.now(),
      description: manual.description,
      amount: amt,
      date: manual.date,
      category: manual.category,
      notes: manual.notes,
      items,
    })
    showToast(`Saved: ${manual.description} — €${amt.toFixed(2)}`)
    setManual({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Other', notes: '' })
    setManualItems([])
  }

  const addManualItem = () => {
    setManualItems(prev => [...prev, { id: Date.now(), name: '', price: '' }])
  }

  const updateManualItem = (id, field, val) => {
    setManualItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  }

  const removeManualItem = (id) => {
    setManualItems(prev => prev.filter(i => i.id !== id))
  }

  const catOptions = CATEGORY_NAMES.map(c => (
    <option key={c} value={c}>{CATEGORIES[c].emoji} {c}</option>
  ))

  return (
    <div className={styles.screen}>
      {/* Mode toggle */}
      <div className={styles.toggle}>
        <button className={`${styles.toggleBtn} ${mode === 'ai' ? styles.active : ''}`} onClick={() => setMode('ai')}>
          ✦ AI analyze
        </button>
        <button className={`${styles.toggleBtn} ${mode === 'manual' ? styles.active : ''}`} onClick={() => setMode('manual')}>
          ✎ Manual entry
        </button>
      </div>

      {/* ── AI mode ──────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Receipt or photo</div>
            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedFile ? (
                <>
                  <div className={styles.uploadIcon}>✓</div>
                  <div className={styles.uploadName}>{uploadedFile.name}</div>
                  <div className={styles.uploadHint}>Tap to change</div>
                </>
              ) : (
                <>
                  <svg className={styles.uploadSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <div className={styles.uploadLabel}>Take a photo or upload receipt</div>
                  <div className={styles.uploadHint}>JPG, PNG, PDF</div>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" capture="environment" style={{ display: 'none' }} onChange={handleFile} />

            <div className={styles.divider}>or describe it</div>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`e.g. "Carrefour 34.20€ — milk, pasta, cheese" or "Netflix 13.99€"`}
              rows={3}
            />

            <button
              className={styles.primaryBtn}
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{ marginTop: 12 }}
            >
              {analyzing ? (
                <><span className={styles.spinner} /> Analyzing receipt…</>
              ) : 'Analyze with AI'}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Review & confirm</div>

              <div className={styles.previewRows}>
                <PreviewRow label="Description" value={preview.description} />
                <PreviewRow label="Amount" value={`€${parseFloat(preview.amount || 0).toFixed(2)}`} />
                <PreviewRow label="Date" value={preview.date} />
                <PreviewRow label="Category" value={<CategoryBadge category={preview.category} />} />
                {preview.items?.length > 0 && (
                  <PreviewRow label="Items found" value={<span className={styles.itemsBadge}>{preview.items.length} items</span>} />
                )}
              </div>

              {preview.items?.length > 0 && (
                <div className={styles.itemsSection}>
                  <div className={styles.cardTitle}>Items breakdown</div>
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr><th>Item</th><th>Price</th></tr>
                    </thead>
                    <tbody>
                      {preview.items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>
                          <td>{item.price != null ? `€${parseFloat(item.price).toFixed(2)}` : '—'}</td>
                        </tr>
                      ))}
                      <tr className={styles.totalRow}>
                        <td>Total</td>
                        <td>€{parseFloat(preview.amount || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className={styles.editSection}>
                <div className={styles.cardTitle}>Edit if needed</div>
                <div className={styles.fieldGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Description</label>
                    <input type="text" value={editFields.description || ''} onChange={e => setEditFields(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Amount (€)</label>
                    <input type="number" step="0.01" min="0" value={editFields.amount || ''} onChange={e => setEditFields(p => ({ ...p, amount: e.target.value }))} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Date</label>
                    <input type="date" value={editFields.date || ''} onChange={e => setEditFields(p => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Category</label>
                    <select value={editFields.category || 'Other'} onChange={e => setEditFields(p => ({ ...p, category: e.target.value }))}>
                      {catOptions}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.btnRow}>
                <button className={styles.secondaryBtn} onClick={resetAI}>Cancel</button>
                <button className={styles.primaryBtn} onClick={handleConfirmAI}>Save expense</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Manual mode ─────────────────────────────────────────────── */}
      {mode === 'manual' && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Expense details</div>
          <div className={styles.fieldGrid}>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Description</label>
              <input type="text" placeholder="e.g. Carrefour, Netflix, Pharmacy…" value={manual.description} onChange={e => setManual(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Amount (€)</label>
              <input type="number" step="0.01" min="0" placeholder="0.00" value={manual.amount} onChange={e => setManual(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date</label>
              <input type="date" value={manual.date} onChange={e => setManual(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Category</label>
              <select value={manual.category} onChange={e => setManual(p => ({ ...p, category: e.target.value }))}>
                {catOptions}
              </select>
            </div>
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Notes (optional)</label>
              <input type="text" placeholder="e.g. work dinner, monthly subscription…" value={manual.notes} onChange={e => setManual(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>

          {/* Manual items */}
          <div className={styles.manualItemsHeader}>
            <label className={styles.fieldLabel}>Items (optional)</label>
            <button className={styles.addItemBtn} onClick={addManualItem}>+ Add item</button>
          </div>
          {manualItems.map(item => (
            <div key={item.id} className={styles.manualItemRow}>
              <input type="text" placeholder="Item name" value={item.name} onChange={e => updateManualItem(item.id, 'name', e.target.value)} style={{ flex: 1 }} />
              <input type="number" placeholder="€" step="0.01" min="0" value={item.price} onChange={e => updateManualItem(item.id, 'price', e.target.value)} style={{ width: 80 }} />
              <button className={styles.removeItemBtn} onClick={() => removeManualItem(item.id)}>×</button>
            </div>
          ))}

          <button className={styles.primaryBtn} onClick={handleConfirmManual} style={{ marginTop: 20 }}>
            Save expense
          </button>
        </div>
      )}
    </div>
  )
}

function PreviewRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--border)', fontSize: 14 }}>
      <span style={{ color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  )
}
