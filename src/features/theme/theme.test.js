import { afterEach, expect, it } from 'vitest'
import { applyTheme, normalizeTheme, readStoredTheme, storeTheme, THEME_STORAGE_KEY } from './theme'

afterEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
})

it('falls back to Ozzie Original for missing or invalid preferences', () => {
  expect(normalizeTheme(null)).toBe('ozzie')
  expect(normalizeTheme('anything-else')).toBe('ozzie')
  expect(readStoredTheme()).toBe('ozzie')
})

it('stores and applies the Alaga color theme without changing product identity data', () => {
  expect(storeTheme('alaga')).toBe('alaga')
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('alaga')
  expect(document.documentElement.dataset.theme).toBe('alaga')
  expect(readStoredTheme()).toBe('alaga')
})

it('can instantly return to Ozzie Original', () => {
  storeTheme('alaga')
  expect(applyTheme('ozzie')).toBe('ozzie')
  expect(document.documentElement.dataset.theme).toBe('ozzie')
})
