import { EXPENSES_STORAGE } from './constants'

export function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(EXPENSES_STORAGE) || '[]')
  } catch {
    return []
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(EXPENSES_STORAGE, JSON.stringify(expenses))
}

export function getItem(key, fallback = null) {
  return localStorage.getItem(key) ?? fallback
}

export function setItem(key, value) {
  localStorage.setItem(key, value)
}

export function removeItem(key) {
  localStorage.removeItem(key)
}
