import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { AppShell } from './AppShell'

const css = readFileSync(join(cwd(), 'src/features/shell/workspaceMotion.css'), 'utf8')
const shell = readFileSync(join(cwd(), 'src/features/shell/AppShell.jsx'), 'utf8')
const app = readFileSync(join(cwd(), 'src/App.jsx'), 'utf8')

const profile = {
  username: 'transition_agent', initials: 'TA', role: 'agent',
  workspace_role: 'member', avatar_id: null,
}

it('animates real route changes without adding navigation delays or moving fixed dialogs', () => {
  expect(shell).toContain('key={currentView} className="app-main app-main-horizontal ozzie-page-enter"')
  expect(app).toContain("import './features/shell/workspaceMotion.css'")
  expect(app.indexOf("import './features/shell/workspaceMotion.css'")).toBeGreaterThan(
    app.indexOf("import './features/training/trainingReadability.css'")
  )
  expect(css).toContain('.app-shell-horizontal .app-main.ozzie-page-enter')
  expect(css).toContain('animation: ozzie-route-reveal 180ms ease-out')
  const route = css.match(/@keyframes ozzie-route-reveal\s*\{([^}]+\}[^}]+)\}/)
  expect(route?.[0]).toContain('opacity')
  expect(route?.[0]).not.toContain('transform')
  expect(css).not.toContain('pointer-events: none')
  expect(css).not.toContain('setTimeout')
})

it('keeps Call Documentation draft mounted across page transitions and Scope Check opening', () => {
  const { rerender } = render(
    <AppShell profile={profile} currentView="navigator">
      <p>Dashboard content</p>
    </AppShell>
  )
  const nav = screen.getByRole('navigation', { name: 'Primary navigation' })
  const firstMain = screen.getByRole('main')
  fireEvent.click(within(nav).getByRole('button', { name: 'Call Documentation' }))
  const caller = screen.getByLabelText('Caller name')
  fireEvent.change(caller, { target: { value: 'Existing call draft' } })
  expect(caller).toHaveValue('Existing call draft')
  rerender(
    <AppShell profile={profile} currentView="process_documents">
      <p>Process Documents content</p>
    </AppShell>
  )
  expect(screen.getByRole('main')).not.toBe(firstMain)
  expect(screen.getByText('Process Documents content')).toBeInTheDocument()
  expect(screen.getByLabelText('Caller name')).toHaveValue('Existing call draft')
  fireEvent.click(within(nav).getByRole('button', { name: 'Scope Check' }))
  expect(screen.getByLabelText('Restore Call Documentation')).toBeInTheDocument()
  fireEvent.click(screen.getByLabelText('Restore Call Documentation'))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Existing call draft')
})

it('animates tabs, dropdowns, page readers and live tools while respecting reduced-motion preference', () => {
  for (const selector of [
    '.topnav-dropdown[open]', '.documentation-dock:not(.documentation-dock-minimized)',
    '.process-drawer', '.host-support-drawer',
    '.guided-lesson-panel', '.device-walkthrough-panel',
    '.process-documents-view', '.training-section-tabs button'
  ]) expect(css).toContain(selector)
  expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  expect(css).toContain('animation: none !important')
  expect(css).toContain('transition: none !important')
  expect(readFileSync(join(cwd(), 'src/features/training/GuidedLessons.jsx'), 'utf8')).toContain('<section key={active.id} className="guided-lesson-panel"')
  expect(readFileSync(join(cwd(), 'src/features/training/DeviceWalkthroughs.jsx'), 'utf8')).toContain('key={active.id}')
  expect(readFileSync(join(cwd(), 'src/features/knowledge/ProcessDocuments.jsx'), 'utf8')).toContain('key={selected.id}')
})
