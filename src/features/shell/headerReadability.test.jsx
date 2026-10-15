import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const base = cwd()
const css = readFileSync(join(base, 'src/features/shell/headerReadability.css'), 'utf8')
const foundation = readFileSync(join(base, 'src/features/theme/foundation.css'), 'utf8')
const app = readFileSync(join(base, 'src/App.jsx'), 'utf8')
const shell = readFileSync(join(base, 'src/features/shell/AppShell.jsx'), 'utf8')
const colors = {
  day: { fg:'#173249', bg:'#f1f6f7' },
  night: { fg:'#f1f6f7', bg:'#172630' },
}
function luminance(hex) {
  const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
  const mapped=channels.map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4)
  return mapped[0]*.2126+mapped[1]*.7152+mapped[2]*.0722
}
function ratio(a,b) {
  const x=luminance(a),y=luminance(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}

describe('Ozzie 2.0 header & global token checkpoint', () => {
  it('exposes complete semantic Day and Night tokens, without restyling cards', () => {
    const tokens=['--ozzie-bg-page','--ozzie-bg-card','--ozzie-bg-card-soft','--ozzie-text-primary','--ozzie-text-body','--ozzie-text-muted','--ozzie-border','--ozzie-accent','--ozzie-accent-hover']
    for(const token of tokens) expect(foundation.split(token+':').length-1).toBe(2)
    expect(css).not.toMatch(/\.smart-search-card|\.route-card|\.process-card|\.documentation-dock|\.report-panel|\.readiness-question/)
    expect(app.indexOf("import './features/shell/headerReadability.css'")).toBeGreaterThan(app.indexOf("import './features/theme/dayNight.css'"))
  })
  it('provides readable nav foreground and header surfaces in both themes', () => {
    for (const [theme,values] of Object.entries(colors)) {
      expect(foundation).toContain('html[data-theme="'+theme+'"]')
      expect(ratio(values.fg,values.bg)).toBeGreaterThanOrEqual(7)
    }
    expect(css).toContain('.topnav-menu')
    expect(css).toContain('.account-menu')
    expect(css).toContain('.topnav-link.active')
    expect(css).toContain('background: var(--ozzie-nav-surface)')
    expect(css).toContain('color: var(--ozzie-text-primary)')
    expect(css).toContain('backdrop-filter: none')
  })
  it('keeps official full logo source and original centered desktop + mobile navigation', () => {
    expect(shell).toContain('<OzzieBrandImage variant="full" />')
    expect(css).toContain('width: 11.6rem')
    expect(css).toContain('width: min(100%, 7.6rem)')
    expect(css).toContain('width: 5.55rem')
    const layout=readFileSync(join(base,'src/features/shell/headerNavRevamp.css'),'utf8')
    expect(layout).toMatch(/\.top-navigation\s*\{[^}]*justify-content:\s*center/)
    expect(layout).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.top-navigation\s*\{[^}]*position:\s*fixed/)
  })
  it('retains Candara as the primary UI font, including header controls', () => {
    const type=readFileSync(join(base,'src/features/theme/typography.css'),'utf8')
    expect(type).toContain('Candara, Calibri, "Segoe UI", Arial, sans-serif')
    expect(css).toContain('font-family: var(--ozzie-ui-font)')
  })
})
