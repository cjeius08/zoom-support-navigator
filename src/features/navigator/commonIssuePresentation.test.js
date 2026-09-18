import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

const css = fs.readFileSync(
  path.join(process.cwd(), 'src/features/navigator/commonIssueRoutes.css'),
  'utf8',
)

describe('Phase 2 common issue drawer presentation', () => {
  it('keeps the tab bar from shrinking underneath the scrollable content', () => {
    expect(css).toMatch(/\.common-issue-drawer\s+\.process-tabs\s*\{[^}]*flex\s*:\s*0\s+0\s+auto/s)
    expect(css).toMatch(/\.common-issue-drawer\s+\.drawer-content\s*\{[^}]*min-height\s*:\s*0/s)
  })

  it('shows all four route tabs without horizontal hunting on mobile', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.common-issue-drawer\s+\.process-tabs\s*\{[^}]*grid-template-columns\s*:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
    expect(css).toMatch(/\.common-issue-drawer\s+\.process-tabs\s+button\s*\{[^}]*white-space\s*:\s*normal/s)
  })
})
