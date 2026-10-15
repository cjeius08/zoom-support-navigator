import { readFileSync } from 'node:fs'
import { cwd } from 'node:process'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = path => readFileSync(join(cwd(), path), 'utf8')
const css = read('src/features/theme/linearBlueBlack.css')
const app = read('src/App.jsx')
const firstCss = read('src/features/theme/readabilityTokens.css')

function palette(mode) {
  const pattern = new RegExp('html\\[data-theme="'+mode+'"\\],\\s*html\\[data-theme="'+mode+'"\\] \\.app-shell-horizontal\\s*\\{')
  const start = css.search(pattern)
  if (start < 0) throw new Error('Missing shared '+mode+' palette')
  const body = css.slice(start,css.indexOf('\n}',start))
  return new Map([...body.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(m=>[m[1],m[2]]))
}

function luminance(hex) {
  const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
    .map(v=>v<=.04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
  return channels[0]*.2126 + channels[1]*.7152 + channels[2]*.0722
}
function contrast(a,b) {
  const x=luminance(a), y=luminance(b)
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)
}

describe('Unified Ozzie screenshot-blue Day / near-black Night theme',()=>{
  it('loads last after existing layout and does not touch the login experience',()=>{
    expect(app).toContain("import './features/theme/linearBlueBlack.css'")
    expect(app.indexOf('linearBlueBlack.css')).toBeGreaterThan(app.indexOf('headerOverlapFix.css'))
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.access-card')
    expect(css).not.toContain('assets/')
    expect(css).not.toMatch(/display:\s*none\s*!important/)
    expect(firstCss).toContain('html[data-theme="day"]')
  })
  it('defines consistently blue, fully readable Day Mode tokens',()=>{
    const day=palette('day')
    for(const k of ['--read-bg','--read-ink','--read-body','--read-muted','--read-border','--read-input','--read-selected','--read-button','--ref-blue','--dn-accent','--theme-page']) {
      expect(day.has(k),k).toBe(true)
    }
    expect(day.get('--theme-page')).toBe('#f4f8ff')
    expect(day.get('--read-bg')).toBe('#ffffff')
    expect(contrast(day.get('--read-ink'),day.get('--read-bg'))).toBeGreaterThanOrEqual(7)
    expect(contrast(day.get('--read-body'),day.get('--read-bg'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(day.get('--read-muted'),day.get('--read-input'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(day.get('--read-on-button'),day.get('--read-button'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(day.get('--read-link'),day.get('--read-bg'))).toBeGreaterThanOrEqual(4.5)
  })
  it('delivers actual near-black Night Mode, with distinct readable raised surfaces',()=>{
    const night=palette('night')
    expect(night.get('--theme-page')).toBe('#08090c')
    expect(night.get('--read-bg')).toBe('#111217')
    expect(night.get('--read-input')).toBe('#0e1015')
    expect(night.get('--theme-header')).toBe('#0e0f13')
    expect(contrast(night.get('--read-ink'),night.get('--read-bg'))).toBeGreaterThanOrEqual(7)
    expect(contrast(night.get('--read-body'),night.get('--read-bg'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(night.get('--read-muted'),night.get('--read-input'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(night.get('--read-on-button'),night.get('--read-button'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(night.get('--read-on-button'),night.get('--ref-blue'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(night.get('--read-link'),night.get('--read-bg'))).toBeGreaterThanOrEqual(4.5)
    expect(contrast(night.get('--theme-blue-ink'),night.get('--theme-blue-soft'))).toBeGreaterThanOrEqual(4.5)
    expect(night.get('--read-bg')).not.toBe(night.get('--read-soft'))
    expect(night.get('--read-input')).not.toBe(night.get('--read-soft'))
  })
  it('updates actual Current Call, Smart Search, Live Call Flow and Training surfaces',()=>{
    for(const name of ['.navigator-session-bar','.home-sandbox-launch','.smart-search-card','.live-call-flow-approved','.navigator-library','.training-card','.usage-report-panel','.feedback-form-panel','.saved-note-card','.avatar-library-card','.team-list article','.process-document-card']) {
      expect(css,name).toContain(name)
    }
    expect(css).toContain('border-left: 3px solid #1b75f5')
    expect(css).toContain('border-left: 3px solid #5795ff')
    expect(css).toContain('.navigator-role-switch button[aria-pressed="true"]')
    expect(css).toContain('.navigator-library-tabs button[aria-selected="true"]')
    expect(css).toContain('.home-appearance-toggle button[aria-pressed="true"]')
    expect(css).toContain('.home-sandbox-launch > button')
    expect(css).toContain('var(--read-button) !important')
    expect(css).not.toContain('#3e8390')
    expect(css).not.toContain('#66a5ae')
  })
  it('protects form and search contrast, focus and the portal-mounted feedback modal',()=>{
    expect(css).toContain('.global-feedback-dialog')
    expect(css).toContain('.global-feedback-context-preview')
    expect(css).toContain('.global-feedback-dialog :is(')
    expect(css).toContain('.process-drawer')
    expect(css).toContain('.readiness-lab-dock')
    expect(css).toContain('.documentation-dock')
    expect(css).toContain('color-scheme: inherit')
    expect(css).toContain('::placeholder')
    expect(css).toContain('select option')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('outline: 3px solid var(--read-ring)')
    expect(css).toContain('.danger-action')
    expect(css).toContain('color: var(--cleanup-delete-ink) !important')
  })
  it('retains distinct screenshot Dashboard hero and Feedback card treatments in black mode',()=>{
    expect(css).toContain('.dashboard-welcome-hero')
    expect(css).toContain('linear-gradient(113deg,#10151f 0%,#17243d 100%)')
    expect(css).toContain('.dashboard-feedback-card')
    expect(css).toContain('linear-gradient(115deg,#19171b,#211b18)')
    expect(css).toContain('.dashboard-update-card')
    expect(css).toContain('.dashboard-shortcut')
    expect(css).toContain('var(--read-hover)')
    expect(css).not.toContain('filter: blur(')
  })
})
