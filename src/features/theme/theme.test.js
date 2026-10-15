import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { afterEach, expect, it } from 'vitest'
import { applyTheme, normalizeTheme, readStoredTheme, storeTheme, THEME_STORAGE_KEY } from './theme'

afterEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
  document.documentElement.style.removeProperty('color-scheme')
})

it('defaults to Day Mode and migrates legacy theme preferences', () => {
  expect(normalizeTheme(null)).toBe('day')
  expect(normalizeTheme('anything-else')).toBe('day')
  expect(normalizeTheme('ozzie')).toBe('day')
  expect(normalizeTheme('alaga')).toBe('night')
  expect(readStoredTheme()).toBe('day')
})

it('stores Night Mode and applies the corresponding color scheme', () => {
  expect(storeTheme('night')).toBe('night')
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('night')
  expect(document.documentElement.dataset.theme).toBe('night')
  expect(document.documentElement.style.colorScheme).toBe('dark')
  expect(readStoredTheme()).toBe('night')
})

it('can instantly return to Day Mode from Night Mode', () => {
  storeTheme('night')
  expect(applyTheme('day')).toBe('day')
  expect(document.documentElement.dataset.theme).toBe('day')
  expect(document.documentElement.style.colorScheme).toBe('light')
})

it('preserves the approved full-detail background imagery without blurring it', () => {
  const css = readFileSync(join(cwd(), 'src/features/theme/dayNight.css'), 'utf8')
  const shell = readFileSync(join(cwd(), 'src/features/shell/AppShell.jsx'), 'utf8')
  expect(css).toMatch(/html\[data-theme="day"\] \.app-shell::before/)
  expect(css).toMatch(/html\[data-theme="night"\] \.app-shell::before/)
  expect(css).not.toMatch(/\.app-shell::(?:before|after)\s*\{[^}]*backdrop-filter:\s*blur\(/)
  expect(shell).toContain('assets/ozzie-day-office.png')
  expect(shell).toContain('assets/ozzie-night-library.png')
  expect(shell).toContain("assetUrl('assets/ozzie-hq.png')")
})
