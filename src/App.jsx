import { useState } from 'react'
import AddScreen from './screens/AddScreen'
import ListScreen from './screens/ListScreen'
import SummaryScreen from './screens/SummaryScreen'
import SettingsScreen from './screens/SettingsScreen'
import BottomNav from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import { useExpenses } from './hooks/useExpenses'
import { useCategories } from './hooks/useCategories'
import { CategoriesContext } from './lib/CategoriesContext'
import './App.css'

const EMPTY_AUTH = {}

export default function App() {
  const [tab, setTab] = useState('add')
  const { expenses, addExpense, deleteExpense, updateExpense, replaceAll } = useExpenses(EMPTY_AUTH)
  const auth = useAuth(replaceAll)
  const categoriesHook = useCategories()

  EMPTY_AUTH.accessToken = auth.accessToken
  EMPTY_AUTH.spreadsheetId = auth.spreadsheetId

  return (
    <CategoriesContext.Provider value={categoriesHook.categories}>
    <ToastProvider>
      <div className="app">
        <header className="appHeader">
          <span className="appTitle">💸 Expenses</span>
          {auth.syncing && <span className="syncBadge">Syncing…</span>}
        </header>
        <main className="appMain">
          {tab === 'add' && (
            <AddScreen
              anthropicKey={auth.anthropicKey}
              onAdd={addExpense}
              categories={categoriesHook.categories}
              categoryNames={categoriesHook.categoryNames}
            />
          )}
          {tab === 'list' && (
            <ListScreen
              expenses={expenses}
              onDelete={deleteExpense}
              onUpdate={updateExpense}
              categories={categoriesHook.categories}
              categoryNames={categoriesHook.categoryNames}
            />
          )}
          {tab === 'summary' && (
            <SummaryScreen
              expenses={expenses}
              onDelete={deleteExpense}
              categories={categoriesHook.categories}
            />
          )}
          {tab === 'settings' && (
            <SettingsScreen
              auth={auth}
              categoriesHook={categoriesHook}
            />
          )}
        </main>
        <BottomNav activeTab={tab} onTabChange={setTab} />
      </div>
    </ToastProvider>
    </CategoriesContext.Provider>
  )
}
