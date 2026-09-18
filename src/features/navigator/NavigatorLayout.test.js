import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

const css = fs.readFileSync(path.join(process.cwd(), 'src/styles.css'), 'utf8')
const liveCallCss = fs.readFileSync(path.join(process.cwd(), 'src/features/navigator/liveCallFlow.css'), 'utf8')

describe('compact Navigator workspace presentation', () => {
  it('uses a wider Smart Search column beside a narrower Live Call Flow column', () => {
    expect(css).toMatch(/\.navigator-top-workspace\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-columns\s*:\s*minmax\(0,\s*3fr\)\s+minmax\(22rem,\s*2fr\)/s)
  })

  it('stacks the top workspace at narrower widths', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*1050px\)[\s\S]*\.navigator-top-workspace\s*\{[^}]*grid-template-columns\s*:\s*1fr/s)
  })

  it('keeps Smart Search overflow visible so autocomplete is not clipped', () => {
    expect(css).toMatch(/\.smart-search-card\s*\{[^}]*overflow\s*:\s*visible/s)
  })

  it('keeps expanded workflow steps readable inside the compact Live Call Flow card', () => {
    expect(liveCallCss).toMatch(/container-type\s*:\s*inline-size/)
    expect(liveCallCss).toMatch(/@container\s*\(max-width:\s*38rem\)/)
  })
})
