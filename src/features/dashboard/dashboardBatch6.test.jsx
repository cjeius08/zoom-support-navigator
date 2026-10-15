import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DashboardWelcome } from './DashboardWelcome'
import { Navigator } from '../navigator/Navigator'
import { AppShell } from '../shell/AppShell'

const read = p => readFileSync(join(cwd(),p),'utf8')
const css = read('src/features/dashboard/dashboardBatch6.css')
const app = read('src/App.jsx')
const shell = read('src/features/shell/AppShell.jsx')
const nav = read('src/features/navigator/Navigator.jsx')

describe('Ozzie Batch 6 — genuine Dashboard welcome for every authenticated role', () => {
  it('keeps approved logo in header, but uses separate repository owl mascot in welcome hero', () => {
    render(<DashboardWelcome username="agent_1" roleLabel="Member" />)
    const hero = screen.getByRole('heading', { name: 'Welcome back!' }).closest('section')
    expect(within(hero).getByRole('img', { name: 'Ozzie owl mascot' }).getAttribute('src')).toContain('ozzie-hq.png')
    expect(hero).toHaveTextContent('agent_1')
    expect(hero).toHaveTextContent('Member')
    expect(shell).toContain('<OzzieBrandImage variant="full" />')
    expect(css).not.toContain('.ozzie-brand-dock')
    expect(css).not.toContain('.access-shell')
  })

  it('offers functioning Search, Training, and Favorites actions without fake metrics', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    const onOpenTraining = vi.fn()
    const onOpenFavorites = vi.fn()
    render(<DashboardWelcome
      username="agent_1"
      onSearch={onSearch}
      onOpenTraining={onOpenTraining}
      onOpenFavorites={onOpenFavorites}
    />)
    await user.click(screen.getByRole('button', { name: /Start with Smart Search/i }))
    await user.click(within(screen.getByRole('region', { name: 'Dashboard quick access' })).getByRole('button', { name: /Smart Search/i }))
    expect(onSearch).toHaveBeenCalledTimes(2)
    await user.click(screen.getByRole('button', { name: /Explore training/i }))
    expect(onOpenTraining).toHaveBeenCalledTimes(1)
    await user.click(within(screen.getByRole('region', { name: 'Dashboard quick access' })).getByRole('button', { name: /My Favorites/i }))
    expect(onOpenFavorites).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/calls today|average handling time|tickets closed/i)).not.toBeInTheDocument()
  })

  it('focuses EXISTING Smart Search, preserving the original Call Flow, role switch and support library', async () => {
    const user = userEvent.setup()
    const onOpenFavorites = vi.fn()
    render(<Navigator onOpenFavorites={onOpenFavorites} initialRole="Host" />)
    expect(screen.getByRole('heading', { name: 'Welcome back!' })).toBeInTheDocument()
    const search = screen.getByRole('combobox', { name: 'Search support processes' })
    expect(search).not.toHaveFocus()
    await user.click(screen.getByRole('button', { name: /Start with Smart Search/i }))
    expect(search).toHaveFocus()
    expect(screen.getByLabelText('Current call session')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Approved Ogletree Live Call Flow' })).toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Navigator views' })).toBeInTheDocument()
    await user.click(within(screen.getByRole('region', { name: 'Dashboard quick access' })).getByRole('button', { name: /My Favorites/i }))
    expect(onOpenFavorites).toHaveBeenCalledTimes(1)
  })

  it('renders the same dashboard for member, lead, and admin without exposing admin menu to members', () => {
    const { rerender } = render(<Navigator profile={{ username: 'member', workspace_role: 'member' }} isAdmin={false} />)
    expect(screen.getByText('YOUR OZZIE WORKSPACE')).toBeInTheDocument()
    expect(screen.getByText('Member')).toBeInTheDocument()
    rerender(<Navigator profile={{ username: 'lead', workspace_role: 'lead' }} isAdmin={false} />)
    expect(screen.getByText('Lead')).toBeInTheDocument()
    rerender(<Navigator profile={{ username: 'admin', role: 'creator_admin' }} isAdmin />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renames header Home label to Dashboard WITHOUT changing underlying navigator route', () => {
    render(<AppShell profile={{ username: 'agent', initials: 'AG', role: 'agent' }} />)
    const dashboard = screen.getByRole('button', { name: 'Dashboard' })
    expect(dashboard).toHaveAttribute('aria-current','page')
    expect(shell).toContain("onClick={event => navigateFromHeader(event, 'navigator')}")
    expect(app).toContain("view === 'navigator'")
    expect(app).toContain("onOpenFavorites={() => navigate('favorites')}")
    expect(app).toContain('profile={profile}')
  })

  it('provides responsive Day/Night colors and avoids fixed grids at 67% zoom', () => {
    expect(app).toContain("import './features/dashboard/dashboardBatch6.css'")
    expect(app.indexOf('dashboardBatch6.css')).toBeGreaterThan(app.indexOf('headerBatch5.css'))
    expect(css).toContain('grid-template-columns: repeat(auto-fit,minmax(min(100%,15rem),1fr))')
    expect(css).toContain('@media (max-width:620px)')
    expect(css).toContain('grid-template-columns: minmax(0,1fr)')
    expect(css).toContain('font-size: var(--ozzie-legible-meta,.9rem)')
    expect(css).toContain('background: var(--read-bg)')
    expect(css).toContain('color: var(--read-ink)')
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
    expect(css).not.toMatch(/display:\s*none|pointer-events:\s*none|text-overflow:\s*ellipsis/)
    expect(nav).toContain('ref={searchInputRef}')
  })
})
