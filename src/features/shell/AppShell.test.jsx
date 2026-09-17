import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

const agentProfile = { username: 'agent_1', initials: 'AG', role: 'agent' }

it('shows role-aware navigation and account controls', () => {
  render(<AppShell profile={{ username: 'ja_admin', initials: 'JA', role: 'creator_admin', avatar_id: 'avatar_001' }} />)
  expect(screen.getByRole('navigation')).toHaveTextContent('Team Management')
  expect(screen.getByRole('navigation')).toHaveTextContent('Usage Analytics')
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
  expect(screen.getByRole('button', { name: /ja_admin/i })).toBeInTheDocument()
  expect(screen.getAllByTestId('nav-icon').length).toBeGreaterThan(3)
  expect(screen.getByTestId('console-brand-icon')).toHaveAttribute('aria-hidden', 'true')
})

it('does not render admin navigation for agents', () => {
  render(<AppShell profile={agentProfile} />)
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
})

it('exposes What’s New and console ownership metadata to all agents', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate} />)

  expect(screen.getByRole('navigation')).toHaveTextContent('What’s New / Updates')
  expect(screen.getByText(/Owner\s+Cjei A\./i)).toBeInTheDocument()
  expect(screen.getByText(/Collaborator\s+Nina F\./i)).toBeInTheDocument()

  const versionChip = screen.getByRole('button', { name: /Console v1\.0.*Updated Sep 18/i })
  await user.click(versionChip)
  expect(onNavigate).toHaveBeenCalledWith('updates')
})

it('exposes mobile navigation state and closes it after navigation', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate} />)

  const toggle = screen.getByRole('button', { name: 'Toggle navigation' })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(toggle).toHaveAttribute('aria-controls', 'primary-sidebar')

  await user.click(toggle)
  expect(toggle).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('button', { name: 'Close navigation' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Training & Resources' }))
  expect(onNavigate).toHaveBeenCalledWith('training')
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

it('uses the tablet breakpoint for the authenticated sidebar without leaving a closed-sidebar sliver', () => {
  const baseCss = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  const css = `${baseCss}\n${responsiveCss}`
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.menu-toggle\s*\{[^}]*display:/)
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar\s*\{[^}]*translateX\(calc\(-100%\s*-\s*1rem\)\)/)
})

it('keeps the console brand horizontal and removes nonessential header text on compact screens', () => {
  const accessibilityCss = readFileSync(join(cwd(), 'src/accessibility-ui.css'), 'utf8')
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  expect(accessibilityCss).toMatch(/\.console-brand\s*\{[^}]*flex-direction:\s*row/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.header-context,[\s\S]*?\.account-menu \.account-copy\s*\{[^}]*display:\s*none/)
})
