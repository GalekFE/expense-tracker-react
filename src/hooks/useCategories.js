import { useState, useCallback } from 'react'
import { DEFAULT_CATEGORIES, CUSTOM_CATEGORIES_KEY, CATEGORY_PALETTE } from '../lib/constants'

function loadCategories() {
  try {
    const stored = localStorage.getItem(CUSTOM_CATEGORIES_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return DEFAULT_CATEGORIES
}

function saveCategories(cats) {
  try { localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(cats)) } catch {}
}

export function useCategories() {
  const [categories, setCategories] = useState(loadCategories)

  const addCategory = useCallback((name, emoji) => {
    setCategories(prev => {
      if (prev[name]) return prev
      const idx = Object.keys(prev).length % CATEGORY_PALETTE.length
      const style = { ...CATEGORY_PALETTE[idx], emoji: emoji || '🏷️' }
      const next = { ...prev, [name]: style }
      saveCategories(next)
      return next
    })
  }, [])

  const deleteCategory = useCallback((name) => {
    if (DEFAULT_CATEGORIES[name]) return // can't delete built-ins
    setCategories(prev => {
      const next = { ...prev }
      delete next[name]
      saveCategories(next)
      return next
    })
  }, [])

  const updateCategory = useCallback((oldName, newName, emoji) => {
    setCategories(prev => {
      const entry = prev[oldName]
      if (!entry) return prev
      const next = { ...prev }
      if (oldName !== newName) delete next[oldName]
      next[newName] = { ...entry, emoji: emoji || entry.emoji }
      saveCategories(next)
      return next
    })
  }, [])

  const categoryNames = Object.keys(categories)

  return { categories, categoryNames, addCategory, deleteCategory, updateCategory }
}
