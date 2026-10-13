import { useState, useEffect, useCallback } from 'react'
import styles from './Toast.module.css'

let showToastFn = null

export function useToast() {
  const show = useCallback((msg) => {
    if (showToastFn) showToastFn(msg)
  }, [])
  return { showToast: show }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    showToastFn = (msg) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
    }
    return () => { showToastFn = null }
  }, [])

  return (
    <>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          <div key={t.id} className={styles.toast}>{t.msg}</div>
        ))}
      </div>
    </>
  )
}
