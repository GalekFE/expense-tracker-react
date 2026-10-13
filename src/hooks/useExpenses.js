import { useState, useCallback } from 'react'
import { loadExpenses, saveExpenses } from '../lib/storage'
import { appendExpense, deleteExpenseFromSheet, updateSummarySheet } from '../lib/sheets'

export function useExpenses(auth) {
  const [expenses, setExpenses] = useState(() => loadExpenses())

  const addExpense = useCallback(async (expense) => {
    const newExpenses = [...expenses, expense]
    setExpenses(newExpenses)
    saveExpenses(newExpenses)
    if (auth.accessToken && auth.spreadsheetId) {
      try {
        await appendExpense(auth.spreadsheetId, auth.accessToken, expense)
        await updateSummarySheet(auth.spreadsheetId, auth.accessToken, newExpenses)
      } catch (e) {
        console.error('Sheets sync error:', e)
      }
    }
  }, [expenses, auth])

  const deleteExpense = useCallback(async (id) => {
    const newExpenses = expenses.filter(e => e.id !== id)
    setExpenses(newExpenses)
    saveExpenses(newExpenses)
    if (auth.accessToken && auth.spreadsheetId) {
      try {
        await deleteExpenseFromSheet(auth.spreadsheetId, auth.accessToken, id)
        await updateSummarySheet(auth.spreadsheetId, auth.accessToken, newExpenses)
      } catch (e) {
        console.error('Sheets delete error:', e)
      }
    }
  }, [expenses, auth])

  const replaceAll = useCallback((newExpenses) => {
    setExpenses(newExpenses)
    saveExpenses(newExpenses)
  }, [])

  return { expenses, addExpense, deleteExpense, replaceAll }
}
