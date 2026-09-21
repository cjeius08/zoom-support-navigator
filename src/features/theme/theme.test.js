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


it('keeps Alaga color-only while covering major workspace surfaces', () => {
  const css = readFileSync(join(cwd(), 'src/features/theme/themeSystem.css'), 'utf8')

  expect(css).toContain('var(--login-workspace-image)')
  expect(css).toContain('var(--workspace-image)')
  expect(css).toMatch(/html\[data-theme="alaga"\] \.training-section-tabs button\[aria-selected="true"\]/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.readiness-progress-track i/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.updates-version-pill/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.avatar-library-panel/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.documentation-dock \.documentation-copy/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.navigator-library-tabs button\[aria-selected="true"\]/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.route-card/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.common-issue-step-number/)
  expect(css).toMatch(/html\[data-theme="alaga"\] \.common-issue-context-options button\[aria-pressed="true"\]/)
  expect(css).not.toMatch(/html\[data-theme="alaga"\][\s\S]*?\.ozzie-brand-dock img\s*\{[^}]*display\s*:/)
})
