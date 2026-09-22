export const THEMES = Object.freeze({
  OZZIE: 'ozzie',
  ALAGA: 'alaga',
  TEAL: 'teal',
  ALPINE: 'alpine',
})

export const THEME_STORAGE_KEY = 'ozzie-workspace-theme'

export function normalizeTheme(value) {
  return [THEMES.ALAGA, THEMES.TEAL, THEMES.ALPINE].includes(value) ? value : THEMES.OZZIE
}

export function readStoredTheme() {
  if (typeof window === 'undefined') return THEMES.OZZIE
  try {
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return THEMES.OZZIE
  }
}

export function applyTheme(value) {
  const theme = normalizeTheme(value)
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme
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
