import { useState, useRef, useEffect } from 'react'
import CategoryBadge from '../components/CategoryBadge'
import ExpenseModal from '../components/ExpenseModal'
import styles from './ListScreen.module.css'

function getMonthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : 'Unknown'
}

function formatMonthLabel(monthKey) {
  if (monthKey === 'Unknown') return 'Unknown date'
  const [year, month] = monthKey.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleString('default', { month: 'long', year: 'numeric' })
}

function getCurrentMonthKey() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function ListScreen({ expenses, onDelete, onUpdate, categories, categoryNames }) {
  const [selectedCats, setSelectedCats] = useState([]) // empty = All
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const currentMonth = getCurrentMonthKey()
  const [openMonths, setOpenMonths] = useState({ [currentMonth]: true })
  const drawerRef = useRef(null)

  // Close drawer when clicking outside
  useEffect(() => {
    if (!drawerOpen) return
    function handle(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [drawerOpen])

  // All categories that appear in expenses
  const usedCats = [...new Set(expenses.map(e => e.category))].sort()

  function toggleCat(cat) {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function clearFilter() {
    setSelectedCats([])
    setDrawerOpen(false)
  }

  const filtered = (selectedCats.length === 0
    ? expenses
    : expenses.filter(e => selectedCats.includes(e.category))
  ).slice().sort((a, b) => b.date.localeCompare(a.date))

  // Group by month
  const groups = []
  const seenMonths = {}
  filtered.forEach(exp => {
    const key = getMonthKey(exp.date)
    if (!seenMonths[key]) {
      seenMonths[key] = []
      groups.push({ key, items: seenMonths[key] })
    }
    seenMonths[key].push(exp)
  })

  function toggleMonth(key) {
    setOpenMonths(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const activeCount = selectedCats.length

  return (
    <div className={styles.screen}>
      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.activeTags}>
          {activeCount === 0 ? (
            <span className={styles.allLabel}>All categories</span>
          ) : (
            selectedCats.map(cat => (
              <button
                key={cat}
                className={styles.activeTag}
                onClick={() => toggleCat(cat)}
              >
                {categories?.[cat]?.emoji} {cat} ×
              </button>
            ))
          )}
        </div>
        <div className={styles.filterBtnWrap} ref={drawerRef}>
          <button
            className={`${styles.filterBtn} ${activeCount > 0 ? styles.filterBtnActive : ''}`}
            onClick={() => setDrawerOpen(o => !o)}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 3h14v1.5L9 10v5l-2-1V10L1 4.5V3z"/>
            </svg>
            Filter{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>

          {drawerOpen && (
            <div className={styles.drawer}>
              <div className={styles.drawerHeader}>
                <span className={styles.drawerTitle}>Filter by category</span>
                {activeCount > 0 && (
                  <button className={styles.clearBtn} onClick={clearFilter}>Clear all</button>
                )}
              </div>
              <div className={styles.drawerList}>
                {usedCats.map(cat => {
                  const c = categories?.[cat]
                  const active = selectedCats.includes(cat)
                  return (
                    <button
                      key={cat}
                      className={`${styles.drawerItem} ${active ? styles.drawerItemActive : ''}`}
                      onClick={() => toggleCat(cat)}
                    >
                      <span className={styles.drawerEmoji}>{c?.emoji || '📦'}</span>
                      <span className={styles.drawerCatName}>{cat}</span>
                      {active && <span className={styles.drawerCheck}>✓</span>}
                    </button>
                  )
                })}
              </div>
              <button className={styles.drawerDone} onClick={() => setDrawerOpen(false)}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🧾</div>
          <div className={styles.emptyText}>No expenses yet</div>
        </div>
      ) : (
        <div className={styles.groups}>
          {groups.map(({ key, items }) => {
            const isOpen = openMonths[key] !== false
            const monthTotal = items.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
            return (
              <div key={key} className={styles.monthGroup}>
                <button
                  className={styles.monthHeader}
                  onClick={() => toggleMonth(key)}
                >
                  <span className={styles.monthArrow}>{isOpen ? '▾' : '▸'}</span>
                  <span className={styles.monthLabel}>{formatMonthLabel(key)}</span>
                  <span className={styles.monthTotal}>€{monthTotal.toFixed(2)}</span>
                </button>
                {isOpen && (
                  <div className={styles.list}>
                    {items.map(expense => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        categories={categories}
                        onTap={() => setSelected(expense)}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ExpenseModal
        expense={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => { onDelete(id); setSelected(null) }}
        onUpdate={(updated) => { onUpdate(updated); setSelected(null) }}
        categories={categories}
        categoryNames={categoryNames}
      />
    </div>
  )
}

function ExpenseRow({ expense, onTap, onDelete, categories }) {
  const cat = (categories && categories[expense.category]) || (categories && categories['Other']) || {}
  const itemCount = expense.items?.length

  return (
    <div className={styles.row} onClick={onTap}>
      <div className={styles.icon} style={{ background: cat.bg || '#f0f0f0' }}>
        {cat.emoji || '📦'}
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{expense.description}</div>
        <div className={styles.meta}>
          <CategoryBadge category={expense.category} size="sm" />
          <span>{expense.date}</span>
          {itemCount > 0 && <span className={styles.itemsBadge}>{itemCount} items</span>}
          {expense.notes && <span className={styles.notes}>{expense.notes}</span>}
        </div>
      </div>
      <div className={styles.amount}>€{parseFloat(expense.amount).toFixed(2)}</div>
      <button
        className={styles.delBtn}
        onClick={e => {
          e.stopPropagation()
          if (window.confirm('Delete this expense?')) onDelete(expense.id)
        }}
      >
        ×
      </button>
    </div>
  )
}
