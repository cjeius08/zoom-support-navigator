import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const load = filename => readFileSync(join(cwd(), filename), 'utf8')
const css = load('src/features/theme/zoomReadability.css')
const readiness = load('src/features/readiness/ReadinessLab.jsx')
const app = load('src/App.jsx')

describe('Readiness Lab 67% zoom layout regression', () => {
  it('uses two parts per row inside the floating panel, not five viewport-based columns', () => {
    expect(css).toMatch(/\.readiness-lab-dock \.readiness-part-rail\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s)
    expect(css).toMatch(/\.readiness-part-rail button:last-child\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s)
    expect(css).toMatch(/\.readiness-part-rail :is\(strong,small\)\s*\{[^}]*white-space:\s*normal/s)
    expect(css).toMatch(/\.readiness-part-rail :is\(strong,small\)\s*\{[^}]*overflow-wrap:\s*break-word/s)
    expect(readiness).toContain('role="tablist"')
    expect(readiness).toContain('disabled={!available}')
  })
  it('lets the progress bar, question status and source/help card reflow without collision', () => {
    expect(css).toMatch(/\.readiness-progress > div:first-child\s*\{[^}]*flex-wrap:\s*wrap/s)
    expect(css).toMatch(/\.readiness-question > header\s*\{[^}]*flex-wrap:\s*wrap/s)
    expect(css).toMatch(/\.readiness-find-card\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s)
    expect(css).toMatch(/\.readiness-lab-dock \.readiness-question-nav\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s)
    expect(css).toContain('padding-right: 0;')
  })
  it('does not trade legibility for clipping and loads after previous theme rules', () => {
    expect(css).toMatch(/\.readiness-open-book span\s*\{[^}]*font-size:\s*var\(--ozzie-legible-body\)/s)
    expect(css).toMatch(/\.readiness-part-rail strong\s*\{[^}]*font-size:\s*var\(--ozzie-legible-body\)/s)
    expect(css).not.toContain('.readiness-part-rail strong { display: none')
    expect(app.indexOf("import './features/theme/zoomReadability.css'")).toBeGreaterThan(app.indexOf("import './pilotReadiness.css'"))
  })
})
