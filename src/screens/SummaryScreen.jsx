import { useState } from 'react'
import { useLiveCategories } from '../lib/CategoriesContext'
import ExpenseModal from '../components/ExpenseModal'
import styles from './SummaryScreen.module.css'

export default function SummaryScreen({ expenses, onDelete, categories: categoriesProp }) {
  const ctxCategories = useLiveCategories()
  const CATEGORIES = categoriesProp || ctxCategories
  const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse()
  const cur = new Date().toISOString().slice(0, 7)
  const allMonths = months.includes(cur) ? months : [cur, ...months]

  const [month, setMonth] = useState(allMonths[0] || cur)
  const [selected, setSelected] = useState(null)

  const filtered = expenses.filter(e => e.date.startsWith(month))
  const total = filtered.reduce((s, e) => s + parseFloat(e.amount), 0)
  const count = filtered.length

  const byCategory = {}
  filtered.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount)
  })
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const topCat = sortedCats[0]

  const top5 = filtered.slice().sort((a, b) => b.amount - a.amount).slice(0, 5)

  const monthLabel = (m) => {
    const [y, mo] = m.split('-')
    return new Date(y, mo - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  return (
    <div className={styles.screen}>
      {/* Month picker */}
      <div className={styles.monthRow}>
        <label className={styles.monthLabel}>Month</label>
        <select value={month} onChange={e => setMonth(e.target.value)} className={styles.monthSelect}>
          {allMonths.map(m => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
      </div>

      {/* Metric cards */}
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Total spent</div>
          <div className={styles.metricValue}>€{total.toFixed(2)}</div>
          <div className={styles.metricSub}>{count} transaction{count !== 1 ? 's' : ''}</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Average</div>
          <div className={styles.metricValue}>€{count ? (total / count).toFixed(2) : '0.00'}</div>
          <div className={styles.metricSub}>per transaction</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Categories</div>
          <div className={styles.metricValue}>{Object.keys(byCategory).length}</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Top category</div>
          <div className={styles.metricValue} style={{ fontSize: 16, marginTop: 2 }}>{topCat ? topCat[0] : '—'}</div>
          <div className={styles.metricSub}>{topCat ? `€${topCat[1].toFixed(2)}` : ''}</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📊</div>
          <div>No data for this month</div>
        </div>
      ) : (
        <>
          {/* Category breakdown */}
          <div className={styles.sectionTitle}>By category</div>
          <div className={styles.catList}>
            {sortedCats.map(([cat, amt]) => {
              const pct = total > 0 ? (amt / total) * 100 : 0
              const c = CATEGORIES[cat] || CATEGORIES['Other']
              return (
                <div key={cat} className={styles.catRow}>
                  <span className={styles.catIcon}>{c.emoji}</span>
                  <span className={styles.catName}>{cat}</span>
                  <div className={styles.barWrap}>
                    <div className={styles.bar} style={{ width: `${pct.toFixed(1)}%`, background: c.color }} />
                  </div>
                  <span className={styles.catAmt}>€{amt.toFixed(2)}</span>
                </div>
              )
            })}
          </div>

          {/* Top expenses */}
          <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Top expenses</div>
          <div className={styles.topList}>
            {top5.map(expense => {
              const cat = CATEGORIES[expense.category] || CATEGORIES['Other']
              return (
                <div key={expense.id} className={styles.topRow} onClick={() => setSelected(expense)}>
                  <div className={styles.topIcon} style={{ background: cat.bg }}>{cat.emoji}</div>
                  <div className={styles.topBody}>
                    <div className={styles.topName}>{expense.description}</div>
                    <div className={styles.topDate}>{expense.date}</div>
                  </div>
                  <div className={styles.topAmt}>€{parseFloat(expense.amount).toFixed(2)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <ExpenseModal
        expense={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => { onDelete(id); setSelected(null) }}
      />
    </div>
  )
}
