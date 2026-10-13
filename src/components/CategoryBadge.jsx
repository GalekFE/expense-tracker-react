import { useLiveCategories } from '../lib/CategoriesContext'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import styles from './CategoryBadge.module.css'

export default function CategoryBadge({ category, size = 'md' }) {
  const cats = useLiveCategories()
  const cat = cats[category] || cats['Other'] || DEFAULT_CATEGORIES['Other']
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: cat.bg, color: cat.color }}
    >
      {cat.emoji} {category}
    </span>
  )
}
