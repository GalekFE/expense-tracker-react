import { useState, useEffect, useRef } from 'react'
import { getItem, setItem, removeItem } from '../lib/storage'
import { createSpreadsheet, syncFromSheet } from '../lib/sheets'
import {
  GAPI_CLIENT_ID_STORAGE,
  ANTHROPIC_KEY_STORAGE,
  SPREADSHEET_ID_STORAGE,
  GTOKEN_STORAGE,
} from '../lib/constants'

export function useAuth(onSync) {
  const [accessToken, setAccessToken] = useState(() => getItem(GTOKEN_STORAGE))
  const [spreadsheetId, setSpreadsheetId] = useState(() => getItem(SPREADSHEET_ID_STORAGE))
  const [anthropicKey, setAnthropicKeyState] = useState(() => getItem(ANTHROPIC_KEY_STORAGE) || '')
  const [googleClientId, setGoogleClientIdState] = useState(() => getItem(GAPI_CLIENT_ID_STORAGE) || '')
  const [syncing, setSyncing] = useState(false)
  const tokenClientRef = useRef(null)

  const setAnthropicKey = (key) => {
    setAnthropicKeyState(key)
    setItem(ANTHROPIC_KEY_STORAGE, key)
  }

  const setGoogleClientId = (id) => {
    setGoogleClientIdState(id)
    setItem(GAPI_CLIENT_ID_STORAGE, id)
  }

  // Load Google Identity Services
  useEffect(() => {
    if (!googleClientId) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ].join(' '),
        callback: async (resp) => {
          if (resp.error) return
          const token = resp.access_token
          setAccessToken(token)
          setItem(GTOKEN_STORAGE, token)
          await handlePostAuth(token)
        },
      })
      // Auto-restore session if token exists
      if (accessToken) handlePostAuth(accessToken)
    }
    document.head.appendChild(script)
    return () => script.remove()
  }, [googleClientId])

  const handlePostAuth = async (token) => {
    setSyncing(true)
    try {
      let sheetId = getItem(SPREADSHEET_ID_STORAGE)
      if (!sheetId) {
        setSyncing(false)
        const confirmed = window.confirm(
          'No existing spreadsheet found.\n\nCreate a new one in your Google Drive?'
        )
        if (!confirmed) return
        setSyncing(true)
        sheetId = await createSpreadsheet(token)
        setSpreadsheetId(sheetId)
        setItem(SPREADSHEET_ID_STORAGE, sheetId)
      } else {
        const synced = await syncFromSheet(sheetId, token)
        if (synced.length > 0) onSync(synced)
      }
    } catch (e) {
      console.error('Auth post-setup error:', e)
    } finally {
      setSyncing(false)
    }
  }

  const signIn = () => {
    if (!googleClientId) return
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: '' })
    }
  }

  const setSpreadsheetIdManual = (id) => {
    const trimmed = id.trim()
    setSpreadsheetId(trimmed || null)
    if (trimmed) setItem(SPREADSHEET_ID_STORAGE, trimmed)
    else removeItem(SPREADSHEET_ID_STORAGE)
  }

  // Disconnect Google auth but keep the spreadsheet ID so reconnecting reuses same sheet
  const signOut = () => {
    setAccessToken(null)
    removeItem(GTOKEN_STORAGE)
    // intentionally keep SPREADSHEET_ID_STORAGE so reconnect reuses the same sheet
  }

  // Fully reset — clears sheet ID too, next connect will create a new sheet
  const forgetSheet = () => {
    setAccessToken(null)
    setSpreadsheetId(null)
    removeItem(GTOKEN_STORAGE)
    removeItem(SPREADSHEET_ID_STORAGE)
  }

  const isGoogleConnected = !!(accessToken && spreadsheetId)

  return {
    accessToken,
    spreadsheetId,
    anthropicKey,
    googleClientId,
    setAnthropicKey,
    setGoogleClientId,
    setSpreadsheetIdManual,
    signIn,
    signOut,
    forgetSheet,
    syncing,
    isGoogleConnected,
  }
}
