import { useEffect, useState } from 'react'
import CategoryBadge from './CategoryBadge'
import styles from './ExpenseModal.module.css'

function emptyItem() {
  return { id: Date.now() + Math.random(), name: '', price: '' }
}

export default function ExpenseModal({ expense, onClose, onDelete, onUpdate, categories, categoryNames }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [items, setItems] = useState([])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    setEditing(false)
    if (expense) {
      setForm({
        description: expense.description || '',
        amount: expense.amount || '',
        date: expense.date || '',
        category: expense.category || '',
        notes: expense.notes || '',
      })
      setItems((expense.items || []).map(it => ({ ...it, id: Math.random() })))
    }
  }, [expense])

  if (!expense) return null
  const hasItems = expense.items && expense.items.length > 0

  function handleSave() {
    if (!form.description.trim() || !form.amount || !form.date) return
    const cleanItems = items
      .filter(i => i.name.trim())
      .map(i => ({ name: i.name.trim(), price: i.price !== '' ? parseFloat(i.price) : null }))
    onUpdate({
      ...expense,
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category || expense.category,
      notes: form.notes.trim(),
      items: cleanItems,
    })
    onClose()
  }

  function addItem() {
    setItems(prev => [...prev, emptyItem()])
  }

  function updateItem(id, field, val) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i))
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (editing) {
    const cats = categoryNames && categoryNames.length ? categoryNames : Object.keys(categories || {})
    return (
      <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div className={styles.sheet}>
          <div className={styles.handle} />
          <button className={styles.close} onClick={onClose}>×</button>

          <div className={styles.editTitle}>Edit expense</div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Description</label>
            <input
              className={`input ${styles.field}`}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What was this for?"
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Amount (€)</label>
              <input
                className={`input ${styles.field}`}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Date</label>
              <input
                className={`input ${styles.field}`}
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Category</label>
            <select
              className={`input ${styles.field}`}
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {cats.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Notes (optional)</label>
            <input
              className={`input ${styles.field}`}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional notes"
            />
          </div>

          {/* Items */}
          <div className={styles.itemsEditHeader}>
            <label className={styles.fieldLabel}>Items</label>
            <button className={styles.addItemBtn} onClick={addItem}>+ Add item</button>
          </div>
          {items.length === 0 && (
            <div className={styles.noItemsHint}>No items — tap "+ Add item" to add a breakdown</div>
          )}
          {items.map(item => (
            <div key={item.id} className={styles.itemEditRow}>
              <input
                className={`input ${styles.itemNameInput}`}
                placeholder="Item name"
                value={item.name}
                onChange={e => updateItem(item.id, 'name', e.target.value)}
              />
              <input
                className={`input ${styles.itemPriceInput}`}
                type="number"
                placeholder="€"
                step="0.01"
                min="0"
                value={item.price}
                onChange={e => updateItem(item.id, 'price', e.target.value)}
              />
              <button className={styles.removeItemBtn} onClick={() => removeItem(item.id)}>×</button>
            </div>
          ))}

          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>Save changes</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <button className={styles.close} onClick={onClose}>×</button>

        <div className={styles.header}>
          <div className={styles.title}>{expense.description}</div>
          <div className={styles.meta}>
            <span className={styles.date}>{expense.date}</span>
            <CategoryBadge category={expense.category} size="sm" />
          </div>
          <div className={styles.amount}>€{parseFloat(expense.amount).toFixed(2)}</div>
        </div>

        {expense.notes && (
          <p className={styles.notes}>{expense.notes}</p>
        )}

        {hasItems ? (
          <div className={styles.itemsSection}>
            <div className={styles.sectionLabel}>Items breakdown</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {expense.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.price != null ? `€${parseFloat(item.price).toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td>Total</td>
                  <td>€{parseFloat(expense.amount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noItems}>No item breakdown recorded</p>
        )}

        <div className={styles.actionRow}>
          <button className={styles.editBtn} onClick={() => setEditing(true)}>
            ✏️ Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => {
              if (window.confirm('Delete this expense?')) {
                onDelete(expense.id)
                onClose()
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
