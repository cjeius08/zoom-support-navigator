import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

const css = fs.readFileSync(path.join(process.cwd(), 'src/styles.css'), 'utf8')

describe('Host / Arbitrator visual QA', () => {
  it('lets the current-call bar wrap instead of squeezing caller role controls', () => {
    expect(css).toMatch(/\.navigator-session-bar\s*\{[^}]*flex-wrap\s*:\s*wrap/s)
    expect(css).toMatch(/@media\s*\(max-width:\s*820px\)[\s\S]*\.navigator-role-switch\s*\{[^}]*flex\s*:\s*1\s+0\s+100%/s)
  })

  it('turns the Host support drawer into a full-width mobile sheet', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.host-support-drawer\s*\{[^}]*width\s*:\s*100vw[^}]*max-width\s*:\s*100vw/s)
  })

  it('keeps primary Host actions large enough for touch on mobile', () => {
    expect(css).toMatch(/\.host-choice-grid button,[\s\S]*min-height\s*:\s*2\.75rem/s)
    expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.host-device-options button\s*\{[^}]*min-height\s*:\s*2\.75rem/s)
  })

  it('prevents long roadblock and script wording from overflowing the drawer', () => {
    expect(css).toMatch(/\.host-roadblock-card dd,[\s\S]*overflow-wrap\s*:\s*anywhere/s)
    expect(css).toMatch(/\.host-roadblock-script blockquote[\s\S]*overflow-wrap\s*:\s*anywhere/s)
  })
})
