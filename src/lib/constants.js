export const DEFAULT_CATEGORIES = {
  'Groceries':       { color: '#1D9E75', bg: '#E1F5EE', darkBg: '#0a3d2e', emoji: '🛒' },
  'Dining out':      { color: '#D85A30', bg: '#FAECE7', darkBg: '#3d1e0f', emoji: '🍽️' },
  'Transport':       { color: '#378ADD', bg: '#E6F1FB', darkBg: '#0d2a42', emoji: '🚌' },
  'Health':          { color: '#D4537E', bg: '#FBEAF0', darkBg: '#3d1525', emoji: '💊' },
  'Utilities':       { color: '#BA7517', bg: '#FAEEDA', darkBg: '#3d2a07', emoji: '💡' },
  'Entertainment':   { color: '#7F77DD', bg: '#EEEDFE', darkBg: '#1e1a42', emoji: '🎬' },
  'Shopping':        { color: '#993556', bg: '#FBEAF0', darkBg: '#3d1020', emoji: '🛍️' },
  'Travel':          { color: '#0F6E56', bg: '#E1F5EE', darkBg: '#04261e', emoji: '✈️' },
  'Subscriptions':   { color: '#534AB7', bg: '#EEEDFE', darkBg: '#1a1740', emoji: '📱' },
  'Home':            { color: '#3B6D11', bg: '#EAF3DE', darkBg: '#162805', emoji: '🏠' },
  'Sport & fitness': { color: '#5F5E5A', bg: '#F1EFE8', darkBg: '#252522', emoji: '🏃' },
  'Other':           { color: '#888780', bg: '#F1EFE8', darkBg: '#252522', emoji: '📦' },
}

// Kept for backward compatibility — code that imports CATEGORIES gets the live version
// via getCategories() below, but static imports still work for the defaults.
export const CATEGORIES = DEFAULT_CATEGORIES

export const CATEGORY_NAMES = Object.keys(DEFAULT_CATEGORIES)

export const CUSTOM_CATEGORIES_KEY = 'custom_categories_v1'

// Palette of colors to cycle through for new custom categories
export const CATEGORY_PALETTE = [
  { color: '#C2410C', bg: '#FEF3C7', darkBg: '#3d2a07', emoji: '🏷️' },
  { color: '#0369A1', bg: '#E0F2FE', darkBg: '#082f49', emoji: '🏷️' },
  { color: '#7C3AED', bg: '#EDE9FE', darkBg: '#2e1065', emoji: '🏷️' },
  { color: '#BE185D', bg: '#FCE7F3', darkBg: '#500724', emoji: '🏷️' },
  { color: '#065F46', bg: '#D1FAE5', darkBg: '#022c22', emoji: '🏷️' },
  { color: '#92400E', bg: '#FEF3C7', darkBg: '#3d2a07', emoji: '🏷️' },
  { color: '#1E40AF', bg: '#DBEAFE', darkBg: '#1e3a8a', emoji: '🏷️' },
  { color: '#6B7280', bg: '#F3F4F6', darkBg: '#1f2937', emoji: '🏷️' },
]

export const ANTHROPIC_KEY_STORAGE = 'anthropic_api_key'
export const GAPI_CLIENT_ID_STORAGE = 'google_client_id'
export const SPREADSHEET_ID_STORAGE = 'spreadsheet_id'
export const GTOKEN_STORAGE = 'gtoken'
export const EXPENSES_STORAGE = 'expenses_v4'
