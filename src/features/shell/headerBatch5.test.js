import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { describe, expect, it } from 'vitest'

const read = p => readFileSync(join(cwd(),p),'utf8')
const css = read('src/features/shell/headerBatch5.css')
const app = read('src/App.jsx')
const shell = read('src/features/shell/AppShell.jsx')
const base = read('src/features/shell/headerNavRevamp.css')

describe('Batch 5 premium Ozzie header refinement',()=>{
  it('loads after previous workspace UI batches and keeps approved logo and navigation position',()=>{
    expect(app).toContain("import './features/shell/headerBatch5.css'")
    expect(app.indexOf('headerBatch5.css')).toBeGreaterThan(app.indexOf('workspaceBatch4.css'))
    expect(shell).toContain('<OzzieBrandImage variant="full" />')
    expect(base).toContain('.app-header.app-header-horizontal')
    expect(base).toContain('left: 50%')
    expect(shell).toContain('className="account-menu"')
    expect(css).not.toContain('.access-shell')
    expect(css).not.toContain('.navigator-entry-grid')
    expect(css).not.toContain('.readiness-lab-dock')
  })

  it('uses understated motion, contained active bars and honors reduced motion',()=>{
    expect(css).toContain('animation: ozzie-b5-header-drift 36s ease-in-out infinite alternate !important')
    expect(css).toContain('@keyframes ozzie-b5-header-drift')
    expect(css).toContain('bottom: .17rem')
    expect(css).toContain('background: var(--read-ring)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation: none !important/s)
    expect(css).not.toMatch(/filter:\s*blur|transform:\s*scale/)
  })

  it('exposes a current-page indicator for all role-appropriate submenu destinations',()=>{
    const routes = [
      'my_saved_notes','favorites','process_documents','flex_hub','training','updates',
      'feedback','usage','feedback_queue','admin','saved_notes','team','avatar_library'
    ]
    for(const route of routes) {
      expect(shell, route).toContain("aria-current={currentView === '"+route+"' ? 'page' : undefined}")
    }
    expect(shell).toContain("currentView === 'navigator' ? 'page' : undefined")
    expect(css).toContain('.topnav-menu > button[aria-current="page"]')
    expect(css).toContain('box-shadow: inset 3px 0 0 var(--read-ring)')
    expect(shell).toContain('{isAdmin && <NavDropdown label="Admin"')
    expect(shell).toContain('{isAdmin && <button type="button" aria-label="Usage Analytics"')
  })

  it('matches CSS mobile breakpoint and touch devices to visible/hidden navigation state',()=>{
    expect(css).toContain('@media (max-width: 800px), (hover: none) and (pointer: coarse)')
    expect(shell).toContain('window.innerWidth <= 800')
    expect(shell).toContain("window.matchMedia?.('(hover: none) and (pointer: coarse)')")
    expect(shell).toContain("pointerQuery?.addEventListener?.('change', updateCompactNav)")
    expect(shell).toContain("pointerQuery?.removeEventListener?.('change', updateCompactNav)")
    expect(shell).toContain('inert={compactNav && !open ? true : undefined}')
    expect(shell).toContain('aria-expanded={open}')
    expect(css).toContain('.topnav-link.active')
    expect(css).toContain('content: none')
  })

  it('keeps normal and selected UI readable in both themes at 67% zoom',()=>{
    for(const token of [
      'var(--read-ink)','var(--read-body)','var(--read-border)',
      'var(--read-bg)','var(--read-hover)','var(--read-selected)',
      'var(--ozzie-legible-meta,.9rem)'
    ]) expect(css,token).toContain(token)
    expect(css).toContain('.topnav-menu strong')
    expect(css).toContain('.topnav-menu small')
    expect(css).toContain('overflow-wrap: break-word')
    expect(css).toContain('white-space: normal')
    expect(css).toContain('width: min(23rem, calc(100vw - 1.75rem))')
    expect(css).not.toContain('display: none !important')
    expect(css).not.toContain('pointer-events: none')
  })
})
