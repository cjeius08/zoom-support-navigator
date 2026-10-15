import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const load = path => readFileSync(join(cwd(), path), 'utf8')
const css = load('src/features/theme/workspaceBatch1.css')
const tokens = load('src/features/theme/readabilityTokens.css')
const zoom = load('src/features/theme/zoomReadability.css')
const app = load('src/App.jsx')

function token(theme, key) {
  const themeBlock = tokens.match(new RegExp('html\\[data-theme="' + theme + '"\\]\\s*\\{([\\s\\S]*?)\\}'))?.[1]
  expect(themeBlock).toBeTruthy()
  const value = themeBlock.match(new RegExp(key + ':\\s*(#[\\da-fA-F]{6})'))?.[1]
  expect(value).toBeTruthy()
  return value
}
function luminance(hex) {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = channels.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722
}
function ratio(a, b) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05)
}

describe('Ozzie UI Batch 1 — authenticated Day/Night', () => {
  it('loads after the existing font/zoom readability safeguards', () => {
    expect(app).toContain("import './features/theme/workspaceBatch1.css'")
    expect(app.indexOf("workspaceBatch1.css")).toBeGreaterThan(app.indexOf("zoomReadability.css"))
    expect(zoom).toContain('.readiness-lab-dock .readiness-part-rail')
  })

  it('keeps the login background but removes the photo layer for EVERY signed-in page', () => {
    expect(css).toContain('.app-shell.app-shell-horizontal')
    expect(css).toMatch(/\.app-shell\.app-shell-horizontal::before,[\s\S]*\.app-shell\.app-shell-horizontal::after\s*\{[^}]*display:\s*none\s*!important/s)
    expect(css).not.toMatch(/\.access-shell|\.access-card|\.ozzie-brand-dock|--workspace-image/)
    expect(css).not.toContain('[data-view="navigator"]')
    expect(css).toContain('background: var(--ozzie-bg-page) !important')
  })

  it('has legible Day/Night foreground, body and link colors on card surfaces', () => {
    for (const theme of ['day', 'night']) {
      const bg = token(theme, '--read-bg')
      for (const label of ['--read-ink', '--read-body', '--read-muted', '--read-link']) {
        expect(ratio(bg, token(theme, label)), theme + ' ' + label).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  it('covers the screens in Batch 1 without changing any user workflow', () => {
    for (const target of [
      '.feedback-form-panel',
      '.usage-data-integrity',
      '.usage-overview-highlights > div',
      '.usage-presence-summary > div',
      '.team-list article',
      '.saved-note-card',
      '.saved-notes-filter-card',
      '.avatar-library-upload-group',
      '.avatar-library-panel',
      '.avatar-library-card',
      '.avatar-library-card-id',
      '.avatar-file-picker',
      '.update-card',
      '.console-metadata > div',
    ]) {
      expect(css, target).toContain(target)
    }
    expect(css).not.toMatch(/\bgrid-template-columns\s*:/)
    expect(css).not.toMatch(/display:\s*none\s*!important;[\s\S]*display:\s*none\s*!important;/)
  })

  it('keeps primary/destructive, disabled and focus appearances distinct', () => {
    expect(css).toContain('--batch-danger-bg')
    expect(css).toContain('.avatar-library-card .danger-action')
    expect(css).toContain('.saved-note-card > footer .danger-action')
    expect(css).toContain('.dialog-actions button:not([type="button"])')
    expect(css).toContain(':disabled')
    expect(css).toContain(':focus-visible')
    expect(css).not.toMatch(/pointer-events:\s*none\s*!important/)
  })
})
