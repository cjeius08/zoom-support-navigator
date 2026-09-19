import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

const readinessApiMocks = vi.hoisted(() => ({
  getReadinessState: vi.fn(),
  startOrResumeReadiness: vi.fn(),
  checkReadinessAnswer: vi.fn(),
  submitReadinessAttempt: vi.fn(),
}))

vi.mock('../../lib/readinessApi', () => readinessApiMocks)

const shellReadinessState = {
  questionSetVersion: 'zoom_general_scenarios_v1',
  maxAttempts: 3,
  questions: [{
    id: 'join-exact-state',
    order: 1,
    type: 'Scenario',
    prompt: 'A Zoom user says they cannot get into the meeting. What is the best first move?',
    options: [
      { id: 'a', text: 'Restart the computer immediately.' },
      { id: 'b', text: 'Ask what exact Zoom screen or message appears and confirm the meeting details.' },
    ],
    locationLabel: 'Training & Resources → Scenario Scripts → Can’t Join',
    resourceTarget: { view: 'training', section: 'scripts', mode: 'scenarios', scenario: 'cant-join' },
    source: 'Scripts & Communication · Can’t Join',
  }],
  attempts: [{
    id: 'attempt-1',
    attemptNumber: 1,
    status: 'active',
    score: null,
    totalQuestions: 1,
    checkedCount: 0,
    startedAt: '2026-09-19T00:00:00Z',
    submittedAt: null,
  }],
  activeAttempt: {
    id: 'attempt-1',
    attemptNumber: 1,
    status: 'active',
    score: null,
    totalQuestions: 1,
    startedAt: '2026-09-19T00:00:00Z',
    submittedAt: null,
    answers: [],
  },
}

readinessApiMocks.getReadinessState.mockResolvedValue(shellReadinessState)

const agentProfile = { username: 'agent_1', initials: 'AG', role: 'agent', workspace_role: 'member' }

it('shows role-aware navigation and account controls', () => {
  render(<AppShell profile={{ username: 'ja_admin', initials: 'JA', role: 'creator_admin', avatar_id: 'avatar_001' }} />)
  expect(screen.getByRole('navigation')).toHaveTextContent('Team Management')
  expect(screen.getByRole('navigation')).toHaveTextContent('Usage Analytics')
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
  expect(screen.getByRole('navigation')).toHaveTextContent('Readiness Lab')
  expect(screen.getByRole('button', { name: /ja_admin/i })).toBeInTheDocument()
  expect(screen.getByText('Admin')).toBeInTheDocument()
  expect(screen.getAllByTestId('nav-icon').length).toBeGreaterThan(3)
  expect(screen.getByRole('img', { name: /Ozzie — Ogletree Support Workspace/i })).toBeInTheDocument()
})


it('keeps Ozzie inside the scrollable sidebar without the old Tier 1 label', () => {
  const { container } = render(<AppShell profile={agentProfile} />)

  const sidebar = container.querySelector('.sidebar')
  expect(sidebar.querySelector('.sidebar-brand img')).toHaveAttribute('alt', 'Ozzie — Ogletree Support Workspace')
  expect(sidebar.querySelector('.sidebar-scroll-region')).toBeInTheDocument()
  expect(screen.queryByText('Tier 1 Zoom Support')).not.toBeInTheDocument()
  expect(container.querySelector('.ozzie-header-brand')).not.toBeInTheDocument()
})

it('offers Meet Ozzie Again only when the intro video is available', async () => {
  const user = userEvent.setup()
  const onMeetOzzie = vi.fn()

  const { rerender } = render(
    <AppShell profile={agentProfile} onMeetOzzie={onMeetOzzie} canMeetOzzie />,
  )

  await user.click(screen.getByRole('button', { name: /agent_1 account/i }))
  await user.click(screen.getByRole('button', { name: 'Meet Ozzie Again' }))
  expect(onMeetOzzie).toHaveBeenCalledTimes(1)

  rerender(<AppShell profile={agentProfile} onMeetOzzie={onMeetOzzie} canMeetOzzie={false} />)
  await user.click(screen.getByRole('button', { name: /agent_1 account/i }))
  expect(screen.queryByRole('button', { name: 'Meet Ozzie Again' })).not.toBeInTheDocument()
})

it('shows a Back control on workspace pages and calls the previous-page handler', async () => {
  const user = userEvent.setup()
  const onBack = vi.fn()

  const { rerender } = render(
    <AppShell profile={agentProfile} currentView="training" canGoBack onBack={onBack}>
      <div>Training page</div>
    </AppShell>,
  )

  const back = screen.getByRole('button', { name: 'Back to previous page' })
  expect(back).toBeEnabled()
  await user.click(back)
  expect(onBack).toHaveBeenCalledTimes(1)

  rerender(
    <AppShell profile={agentProfile} currentView="navigator" canGoBack={false} onBack={onBack}>
      <div>Navigator page</div>
    </AppShell>,
  )
  expect(screen.getByRole('button', { name: 'Back to previous page' })).toBeDisabled()
})

it('does not render admin navigation for agents', () => {
  render(<AppShell profile={agentProfile} />)
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
})

it('exposes What’s New and workspace ownership metadata to all agents', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  const { container } = render(<AppShell profile={agentProfile} onNavigate={onNavigate} />)

  expect(screen.getByRole('navigation')).toHaveTextContent('What’s New / Updates')
  expect(screen.getByText(/Workspace Lead\s+Cjei A\./i)).toBeInTheDocument()
  expect(screen.getByText(/Collaborator\s+Nina F\./i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'What’s New / Updates' }))
  expect(onNavigate).toHaveBeenCalledWith('updates')
  expect(container.querySelector('.console-version-chip')).not.toBeInTheDocument()
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

  await user.click(screen.getByRole('button', { name: 'Restore Call Documentation' }))
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


it('opens Scope Check as a global live tool and preserves the Documentation draft when switching tools', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate}><div>Current page content</div></AppShell>)

  await user.click(screen.getByRole('button', { name: 'Call Documentation' }))
  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')

  await user.click(screen.getByRole('button', { name: 'Scope Check' }))
  expect(onNavigate).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Scope Check' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Host action or meeting-owner permission/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting not started yet/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))
  expect(screen.getByText('STOP + REFER')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Call Documentation' }))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
})

it('opens Readiness Lab as a global live tool and keeps it open while the agent searches resources', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  const onOpenReadinessResource = vi.fn()
  render(<AppShell
    profile={agentProfile}
    onNavigate={onNavigate}
    onOpenReadinessResource={onOpenReadinessResource}
  ><div>Current page content</div></AppShell>)

  const labButton = screen.getByRole('button', { name: 'Readiness Lab' })
  await user.click(labButton)

  expect(labButton).toHaveAttribute('aria-pressed', 'true')
  expect(onNavigate).not.toHaveBeenCalled()
  expect(screen.getByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()

  const choice = await screen.findByRole('radio', { name: /Ask what exact Zoom screen/i })
  await user.click(choice)
  await user.click(screen.getByRole('button', { name: 'Open Training & Resources' }))

  expect(onOpenReadinessResource).toHaveBeenCalledWith({ view: 'training' })
  expect(screen.getByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /Ask what exact Zoom screen/i })).toHaveAttribute('aria-checked', 'true')

  await user.click(screen.getByRole('button', { name: 'Minimize Readiness Lab' }))
  expect(screen.getByLabelText('Readiness Lab minimized')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Restore Readiness Lab' }))
  expect(screen.getByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()
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

it('keeps the workspace title horizontal and removes nonessential header text on compact screens', () => {
  const accessibilityCss = readFileSync(join(cwd(), 'src/accessibility-ui.css'), 'utf8')
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')
  expect(accessibilityCss).toMatch(/\.console-brand\s*\{[^}]*flex-direction:\s*row/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.header-context,[\s\S]*?\.account-menu \.account-copy\s*\{[^}]*display:\s*none/)
})
