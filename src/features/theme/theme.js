// Day / Night replaces the legacy Ozzie Original and Alaga appearance choices.
// Existing stored values migrate automatically without touching workspace data.
export const THEMES = Object.freeze({
  DAY: 'day',
  NIGHT: 'night',
})

export const THEME_STORAGE_KEY = 'ozzie-workspace-theme'

export function normalizeTheme(value) {
  if (value === THEMES.NIGHT || value === 'alaga') return THEMES.NIGHT
  return THEMES.DAY
}

export function readStoredTheme() {
  if (typeof window === 'undefined') return THEMES.DAY
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return THEMES.DAY
  }
}

export function applyTheme(value) {
  const theme = normalizeTheme(value)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === THEMES.NIGHT ? 'dark' : 'light'
  }
  return theme
}

export function storeTheme(value) {
  const theme = normalizeTheme(value)
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Theme still applies for the current session when storage is unavailable.
    }
  }
  applyTheme(theme)
  return theme
}
