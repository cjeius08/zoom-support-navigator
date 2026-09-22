import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
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

it('stores and applies the Alaga workspace appearance without changing product identity data', () => {
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


it('supports a full Alaga layout preset while preserving Ozzie branding and major workspace coverage', () => {
  const css = readFileSync(join(cwd(), 'src/features/theme/themeSystem.css'), 'utf8')

  expect(css).toContain('var(--login-workspace-image)')
  expect(css).toContain('var(--workspace-image)')
  expect(css).toMatch(/html\[data-theme="alaga"\] \.app-header\.app-header-horizontal/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.alaga-layout-hero/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.alaga-layout-summary-grid/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.live-call-workflow-panel/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.sandbox-hero/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.admin-account-overview/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.saved-notes-filter-card/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.training-card/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.ozzie-brand-dock img/)
  expect(css).toContain('filter: none !important')
})
