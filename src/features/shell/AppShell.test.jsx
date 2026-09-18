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
  expect(screen.queryByRole('img', { name: 'OGCon' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Support Workspace')).toHaveTextContent('Support Workspace')
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

  const versionChip = screen.getByRole('button', { name: /Console v1\.0.*Updated Sep 19/i })
  await user.click(versionChip)
  expect(onNavigate).toHaveBeenCalledWith('updates')
})

it('exposes mobile navigation state and closes it after navigation', async () => {
  const originalWidth = window.innerWidth
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
  window.dispatchEvent(new Event('resize'))
  try {
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
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    window.dispatchEvent(new Event('resize'))
  }
})


it('opens Call Documentation as a global dock without navigating away and preserves the draft', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate}><div>Current page content</div></AppShell>)

  const toolButton = screen.getByRole('button', { name: 'Call Documentation' })
  expect(toolButton).toHaveAttribute('aria-pressed', 'false')

  await user.click(toolButton)
  expect(onNavigate).not.toHaveBeenCalled()
  expect(toolButton).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('complementary', { name: /Call Documentation/i })).toBeInTheDocument()

  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')
  await user.click(screen.getByRole('button', { name: 'Minimize Call Documentation' }))
  expect(screen.getByLabelText('Call Documentation minimized')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Call Documentation/i }))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')

  await user.click(screen.getByRole('button', { name: 'Close Call Documentation' }))
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()
  expect(toolButton).toHaveAttribute('aria-pressed', 'false')

  await user.click(toolButton)
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')

  await user.click(screen.getByRole('button', { name: 'Training & Resources' }))
  expect(onNavigate).toHaveBeenCalledWith('training')
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
})

it('uses the tablet breakpoint for the authenticated sidebar without leaving a closed-sidebar sliver', () => {
  const baseCss = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  const css = `${baseCss}\n${responsiveCss}`
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.menu-toggle\s*\{[^}]*display:/)
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar\s*\{[^}]*translateX\(calc\(-100%\s*-\s*1rem\)\)/)
})

it('progressively reflows the workspace while the browser window is resized', () => {
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')

  expect(responsiveCss).toMatch(/\.app-main\s*\{[^}]*min-width:\s*0[^}]*overflow-x:\s*clip/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*1100px\)[\s\S]*?\.navigator-entry-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*1100px\)[\s\S]*?\.agent-workflow\s*\{[^}]*flex-direction:\s*column/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*920px\)[\s\S]*?\.category-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*920px\)[\s\S]*?\.agent-workflow ol\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.category-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.agent-workflow ol\s*\{[^}]*grid-template-columns:\s*1fr/)
})

it('keeps admin navigation scrollable while console metadata stays visible in short mobile drawers', () => {
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')

  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar\s*\{[^}]*overflow:\s*hidden/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar\s*>\s*div:first-child\s*\{[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.sidebar-footer\s*\{[^}]*flex:\s*0\s+0\s+auto/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.console-meta-mini span\s*\{[^}]*overflow-wrap:\s*anywhere/)
})

it('keeps the sidebar footer visible when a wide browser window has limited vertical space', () => {
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  const globalCss = responsiveCss.split('@media')[0]

  expect(globalCss).toMatch(/\.sidebar\s*\{[^}]*overflow:\s*hidden/)
  expect(globalCss).toMatch(/\.sidebar\s*>\s*div:first-child\s*\{[^}]*flex:\s*1\s+1\s+auto[^}]*min-height:\s*0[^}]*overflow-y:\s*auto/)
  expect(globalCss).toMatch(/\.sidebar-footer\s*\{[^}]*flex:\s*0\s+0\s+auto/)
  expect(globalCss).toMatch(/\.console-meta-mini span\s*\{[^}]*overflow-wrap:\s*anywhere/)
})

it('keeps the neutral workspace title horizontal and removes nonessential header text on compact screens', () => {
  const accessibilityCss = readFileSync(join(cwd(), 'src/accessibility-ui.css'), 'utf8')
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  expect(accessibilityCss).toMatch(/\.console-brand\s*\{[^}]*flex-direction:\s*row/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.header-context,[\s\S]*?\.account-menu \.account-copy\s*\{[^}]*display:\s*none/)
})
