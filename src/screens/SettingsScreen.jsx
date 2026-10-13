import { useState } from 'react'
import { useToast } from '../components/Toast'
import { DEFAULT_CATEGORIES } from '../lib/constants'
import styles from './SettingsScreen.module.css'

export default function SettingsScreen({ auth, categoriesHook }) {
  const {
    accessToken, spreadsheetId, anthropicKey, googleClientId,
    setAnthropicKey, setGoogleClientId, setSpreadsheetIdManual,
    signIn, signOut, forgetSheet, syncing, isGoogleConnected
  } = auth

  const { categories, addCategory, deleteCategory, updateCategory } = categoriesHook || {}

  const { showToast } = useToast()
  const [keyDraft, setKeyDraft] = useState(anthropicKey || '')
  const [cidDraft, setCidDraft] = useState(googleClientId || '')
  const [sheetDraft, setSheetDraft] = useState(spreadsheetId || '')

  // Category add form
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('')
  // Category editing
  const [editingCat, setEditingCat] = useState(null) // name of category being edited
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')

  function saveKey() {
    const trimmed = keyDraft.trim()
    setAnthropicKey(trimmed)
    showToast(trimmed ? 'API key saved ✓' : 'API key cleared')
  }

  function saveCid() {
    const trimmed = cidDraft.trim()
    setGoogleClientId(trimmed)
    showToast(trimmed ? 'Client ID saved ✓' : 'Client ID cleared')
  }

  function saveSheet() {
    const trimmed = sheetDraft.trim()
    setSpreadsheetIdManual(trimmed)
    showToast(trimmed ? 'Spreadsheet ID saved ✓' : 'Spreadsheet ID cleared')
  }

  function handleSignOut() {
    if (window.confirm('Disconnect Google? Your spreadsheet link and local expenses will stay — reconnecting will sync to the same sheet.')) {
      signOut()
      showToast('Disconnected from Google')
    }
  }

  function handleForgetSheet() {
    if (window.confirm('Forget this spreadsheet? Next time you connect, a brand new sheet will be created.')) {
      forgetSheet()
      setSheetDraft('')
      showToast('Sheet forgotten — will create a new one on next connect')
    }
  }

  function handleAddCategory() {
    const name = newCatName.trim()
    if (!name) return
    if (categories && categories[name]) {
      showToast('Category already exists')
      return
    }
    addCategory(name, newCatEmoji.trim() || '🏷️')
    setNewCatName('')
    setNewCatEmoji('')
    showToast(`Category "${name}" added`)
  }

  function handleDeleteCategory(name) {
    if (window.confirm(`Delete category "${name}"? Existing expenses won't be affected.`)) {
      deleteCategory(name)
      showToast(`Category "${name}" deleted`)
    }
  }

  function startEdit(name) {
    setEditingCat(name)
    setEditName(name)
    setEditEmoji(categories[name]?.emoji || '')
  }

  function saveEdit() {
    const newName = editName.trim()
    if (!newName) return
    updateCategory(editingCat, newName, editEmoji.trim() || categories[editingCat]?.emoji)
    setEditingCat(null)
    showToast('Category updated ✓')
  }

  const customCats = categories ? Object.keys(categories).filter(name => !DEFAULT_CATEGORIES[name]) : []
  const defaultCats = categories ? Object.keys(categories).filter(name => DEFAULT_CATEGORIES[name]) : []

  return (
    <div className={styles.screen}>

      {/* Claude API */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Claude AI</div>
        <div className={styles.card}>
          <div className={styles.inputRow}>
            <span className={styles.inputLabel}>API Key</span>
            <div className={styles.inputWrap}>
              <input
                type="password"
                value={keyDraft}
                onChange={e => setKeyDraft(e.target.value)}
                placeholder="sk-ant-..."
                className="input"
              />
              <button className={styles.saveBtn} onClick={saveKey}>Save</button>
            </div>
          </div>
        </div>
        <div className={styles.hint}>
          Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a>. Used only in your browser — never sent to any server.
        </div>
      </div>

      {/* Google Sheets */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Google Sheets sync</div>
        <div className={styles.card}>
          <div className={styles.inputRow}>
            <span className={styles.inputLabel}>Client ID</span>
            <div className={styles.inputWrap}>
              <input
                type="text"
                value={cidDraft}
                onChange={e => setCidDraft(e.target.value)}
                placeholder="xxx.apps.googleusercontent.com"
                className="input"
              />
              <button className={styles.saveBtn} onClick={saveCid}>Save</button>
            </div>
          </div>
          {/* Spreadsheet ID — paste existing or leave blank to auto-create */}
          <div className={styles.inputRow}>
            <span className={styles.inputLabel}>Sheet ID</span>
            <div className={styles.inputWrap}>
              <input
                type="text"
                value={sheetDraft}
                onChange={e => setSheetDraft(e.target.value)}
                placeholder="Paste existing ID, or leave blank to auto-create"
                className="input"
              />
              <button className={styles.saveBtn} onClick={saveSheet}>Save</button>
            </div>
          </div>

          <div className={styles.row}>
            <span className={styles.rowIcon}>🔗</span>
            <div className={styles.rowBody}>
              <div className={styles.rowLabel}>Google Account</div>
              <div className={styles.rowSub}>
                {isGoogleConnected ? 'Connected · syncing enabled' : 'Not connected · local only'}
              </div>
            </div>
            <div className={styles.rowAction}>
              {isGoogleConnected
                ? <button className={`${styles.pill} ${styles.pillRed}`} onClick={handleSignOut}>Disconnect</button>
                : <button className={`${styles.pill} ${styles.pillGray}`} onClick={signIn} disabled={!googleClientId}>Connect</button>
              }
            </div>
          </div>

          {spreadsheetId && (
            <div className={styles.row}>
              <span className={styles.rowIcon}>📊</span>
              <div className={styles.rowBody}>
                <div className={styles.rowLabel}>Spreadsheet</div>
                <div className={styles.rowSub}>{spreadsheetId}</div>
              </div>
              <div className={styles.rowAction} style={{ display: 'flex', gap: 6 }}>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.pill} ${styles.pillGreen}`}
                  style={{ textDecoration: 'none' }}
                >
                  Open
                </a>
                <button
                  className={`${styles.pill} ${styles.pillGray}`}
                  onClick={handleForgetSheet}
                  title="Forget this sheet — next connect will create a new one"
                >
                  Forget
                </button>
              </div>
            </div>
          )}
        </div>
        <div className={styles.hint}>
          Paste an existing spreadsheet ID to reuse it, or leave blank to auto-create a new one on first connect. Disconnecting keeps your sheet linked — use "Forget" to start fresh.
        </div>
      </div>

      {/* Categories */}
      {categoriesHook && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Categories</div>

          {/* Add new category */}
          <div className={styles.card}>
            <div className={styles.catAddRow}>
              <input
                className={`input ${styles.catEmojiInput}`}
                value={newCatEmoji}
                onChange={e => setNewCatEmoji(e.target.value)}
                placeholder="🏷️"
                maxLength={4}
              />
              <input
                className={`input ${styles.catNameInput}`}
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="New category name"
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              />
              <button className={styles.catAddBtn} onClick={handleAddCategory} disabled={!newCatName.trim()}>
                Add
              </button>
            </div>
          </div>

          {/* Custom categories */}
          {customCats.length > 0 && (
            <>
              <div className={styles.catSectionLabel}>Custom</div>
              <div className={styles.card}>
                {customCats.map((name, i) => {
                  const cat = categories[name]
                  const isEditing = editingCat === name
                  return (
                    <div key={name} className={`${styles.catRow} ${i < customCats.length - 1 ? styles.catRowBorder : ''}`}>
                      {isEditing ? (
                        <div className={styles.catEditInline}>
                          <input
                            className={`input ${styles.catEmojiInput}`}
                            value={editEmoji}
                            onChange={e => setEditEmoji(e.target.value)}
                            maxLength={4}
                          />
                          <input
                            className={`input ${styles.catNameInput}`}
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          />
                          <button className={styles.catSaveBtn} onClick={saveEdit}>Save</button>
                          <button className={styles.catCancelBtn} onClick={() => setEditingCat(null)}>✕</button>
                        </div>
                      ) : (
                        <>
                          <span className={styles.catEmoji}>{cat.emoji}</span>
                          <span className={styles.catName}>{name}</span>
                          <div className={styles.catActions}>
                            <button className={styles.catEditBtn} onClick={() => startEdit(name)}>Edit</button>
                            <button className={styles.catDeleteBtn} onClick={() => handleDeleteCategory(name)}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Default categories (can edit emoji/name but not delete) */}
          <div className={styles.catSectionLabel}>Default</div>
          <div className={styles.card}>
            {defaultCats.map((name, i) => {
              const cat = categories[name]
              const isEditing = editingCat === name
              return (
                <div key={name} className={`${styles.catRow} ${i < defaultCats.length - 1 ? styles.catRowBorder : ''}`}>
                  {isEditing ? (
                    <div className={styles.catEditInline}>
                      <input
                        className={`input ${styles.catEmojiInput}`}
                        value={editEmoji}
                        onChange={e => setEditEmoji(e.target.value)}
                        maxLength={4}
                      />
                      <input
                        className={`input ${styles.catNameInput}`}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                      />
                      <button className={styles.catSaveBtn} onClick={saveEdit}>Save</button>
                      <button className={styles.catCancelBtn} onClick={() => setEditingCat(null)}>✕</button>
                    </div>
                  ) : (
                    <>
                      <span className={styles.catEmoji}>{cat.emoji}</span>
                      <span className={styles.catName}>{name}</span>
                      <div className={styles.catActions}>
                        <button className={styles.catEditBtn} onClick={() => startEdit(name)}>Edit</button>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          <div className={styles.hint}>Default categories can be renamed but not deleted.</div>
        </div>
      )}

      {/* Status */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Status</div>
        <div className={styles.card}>
          <div className={styles.row}>
            <span className={styles.rowIcon}>🤖</span>
            <div className={styles.rowBody}>
              <div className={styles.rowLabel}>AI analysis</div>
            </div>
            <div className={styles.rowAction}>
              <span className={`${styles.pill} ${anthropicKey ? styles.pillGreen : styles.pillGray}`}>
                {anthropicKey ? 'Ready' : 'No key'}
              </span>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.rowIcon}>☁️</span>
            <div className={styles.rowBody}>
              <div className={styles.rowLabel}>Cloud sync</div>
            </div>
            <div className={styles.rowAction}>
              <span className={`${styles.pill} ${isGoogleConnected ? styles.pillGreen : styles.pillGray}`}>
                {syncing ? 'Syncing…' : isGoogleConnected ? 'Active' : 'Off'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
