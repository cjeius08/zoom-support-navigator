import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(cwd(), 'src/features/theme/typography.css'), 'utf8')
const app = readFileSync(join(cwd(), 'src/App.jsx'), 'utf8')

describe('Ozzie Candara typography', () => {
  it('uses Candara first with readable cross-platform system fallbacks', () => {
    expect(css).toContain('Candara, Calibri, "Segoe UI", Arial, sans-serif')
    expect(css).toContain('font-family: var(--ozzie-ui-font)')
  })

  it('applies to native controls, not only page headings', () => {
    for (const tag of ['button', 'input', 'select', 'textarea']) {
      expect(css).toMatch(new RegExp('\\b' + tag + '\\b'))
    }
    expect(css).toContain('font-family: inherit')
  })

  it('is imported after the Day/Night appearance styles and does not bundle a proprietary font', () => {
    expect(app.indexOf("import './features/theme/typography.css'"))
      .toBeGreaterThan(app.indexOf("import './features/theme/dayNight.css'"))
    expect(css).not.toMatch(/@font-face|\.woff|\.ttf|@import\s+url/)
    expect(css).not.toMatch(/\.ozzie-brand-dock\s+img/)
  })
})
