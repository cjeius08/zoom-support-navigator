import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
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

it('shows the planned horizontal navigation and role-aware account controls', () => {
  render(<AppShell profile={{ username: 'ja_admin', initials: 'JA', role: 'creator_admin', avatar_id: 'avatar_001' }} />)

  const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })
  expect(navigation).toHaveTextContent('Home')
  expect(navigation).toHaveTextContent('Call Flow')
  expect(navigation).toHaveTextContent('Knowledge')
  expect(navigation).toHaveTextContent('Readiness Lab')
  expect(navigation).toHaveTextContent('Reports')
  expect(navigation).toHaveTextContent('Admin')
  expect(navigation).toHaveTextContent('Team Management')
  expect(navigation).toHaveTextContent('Avatar Library')
  expect(navigation).toHaveTextContent('Usage Analytics')
  expect(screen.getByRole('button', { name: /ja_admin account/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /ja_admin account/i })).toHaveTextContent('Admin')
  expect(screen.getAllByTestId('nav-icon').length).toBeGreaterThan(3)
  expect(screen.getByRole('img', { name: /Ozzie — Ogletree Support Workspace/i })).toBeInTheDocument()
})

it('keeps top navigation dropdowns in one exclusive group so menus cannot overlap', () => {
  const { container } = render(<AppShell profile={{ username: 'ja_admin', initials: 'JA', role: 'creator_admin' }} />)
  const dropdowns = [...container.querySelectorAll('details.topnav-dropdown')]

  expect(dropdowns.length).toBeGreaterThanOrEqual(3)
  dropdowns.forEach(dropdown => {
    expect(dropdown).toHaveAttribute('name', 'ozzie-primary-navigation')
  })
})

it('keeps Ozzie standalone at the top-left instead of inside a sidebar', () => {
  const { container } = render(<AppShell profile={agentProfile} />)

  const brand = container.querySelector('.ozzie-brand-dock')
  expect(brand).toBeInTheDocument()
  expect(brand.querySelector('img')).toHaveAttribute('alt', 'Ozzie — Ogletree Support Workspace')
  expect(brand.querySelector('img').getAttribute('src')).toContain('ozzie-hq.png')
  expect(container.querySelector('.sidebar')).not.toBeInTheDocument()
  expect(screen.queryByText('Tier 1 Zoom Support')).not.toBeInTheDocument()
})

it('renames Navigator to Home without changing the navigator route', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()

  render(<AppShell profile={agentProfile} onNavigate={onNavigate} currentView="navigator" />)
  const home = screen.getByRole('button', { name: 'Home' })
  expect(home).toHaveAttribute('aria-current', 'page')
  expect(screen.queryByText('Navigator')).not.toBeInTheDocument()

  await user.click(home)
  expect(onNavigate).toHaveBeenCalledWith('navigator')
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
      <div>Home page</div>
    </AppShell>,
  )
  expect(screen.queryByRole('button', { name: 'Back to previous page' })).not.toBeInTheDocument()
})

it('keeps Lead as a title without granting admin navigation', () => {
  render(<AppShell profile={{ ...agentProfile, username: 'lead_1', workspace_role: 'lead' }} />)
  expect(screen.getByRole('button', { name: /lead_1 account/i })).toHaveTextContent('Lead')
  expect(screen.queryByText('Admin Home')).not.toBeInTheDocument()
  expect(screen.queryByText('Team Management')).not.toBeInTheDocument()
  expect(screen.queryByText('Avatar Library')).not.toBeInTheDocument()
  expect(screen.queryByText('Usage Analytics')).not.toBeInTheDocument()
  expect(screen.getByRole('navigation')).toHaveTextContent('Home')
  expect(screen.getByRole('navigation')).toHaveTextContent('Training & Resources')
})

it('gives regular members direct access to My Saved Notes from Call Flow', async () => {
  const user = userEvent.setup()
  const onOpenMySavedNotes = vi.fn()
  render(<AppShell profile={agentProfile} onOpenMySavedNotes={onOpenMySavedNotes} />)

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'My Saved Notes' }))
  expect(onOpenMySavedNotes).toHaveBeenCalledWith('')
})

it('keeps updates and workspace ownership metadata available after the shell revamp', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate} />)

  expect(screen.getByText(/Workspace Lead\s+Cjei A\./i)).toBeInTheDocument()
  expect(screen.getByText(/Collaborator\s+Nina F\./i)).toBeInTheDocument()

  await user.click(screen.getByText('Knowledge'))
  await user.click(screen.getByRole('button', { name: /What’s New \/ Updates/i }))
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
    expect(toggle).toHaveAttribute('aria-controls', 'primary-navigation')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeInTheDocument()

    await user.click(screen.getByText('Knowledge'))
    await user.click(screen.getByRole('button', { name: /Training & Resources/i }))
    expect(onNavigate).toHaveBeenCalledWith('training')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  } finally {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
    window.dispatchEvent(new Event('resize'))
  }
})

it('opens Call Documentation from Call Flow without navigating away and preserves the draft', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate}><div>Current page content</div></AppShell>)

  await user.click(screen.getByText('Call Flow'))
  const toolButton = within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Call Documentation' })
  expect(toolButton).toHaveAttribute('aria-pressed', 'false')

  await user.click(toolButton)
  expect(onNavigate).not.toHaveBeenCalled()
  expect(screen.getByRole('complementary', { name: /Call Documentation/i })).toBeInTheDocument()

  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')
  await user.click(screen.getByRole('button', { name: 'Minimize Call Documentation' }))
  expect(screen.getByLabelText('Call Documentation minimized')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Restore Call Documentation' }))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')

  await user.click(screen.getByRole('button', { name: 'Close Call Documentation' }))
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Call Documentation' }))
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')

  await user.click(screen.getByText('Knowledge'))
  await user.click(screen.getByRole('button', { name: /Training & Resources/i }))
  expect(onNavigate).toHaveBeenCalledWith('training')
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
})

it('opens Scope Check as a global live tool and preserves the Documentation draft when switching tools', async () => {
  const user = userEvent.setup()
  const onNavigate = vi.fn()
  render(<AppShell profile={agentProfile} onNavigate={onNavigate}><div>Current page content</div></AppShell>)

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Call Documentation' }))
  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Scope Check' }))
  expect(onNavigate).not.toHaveBeenCalled()
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Host action or meeting-owner permission/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting not started yet/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))
  expect(screen.getByText('STOP + REFER')).toBeInTheDocument()

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Call Documentation' }))
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

it('uses the standalone brand and horizontal header on desktop', () => {
  const css = readFileSync(join(cwd(), 'src/features/shell/headerNavRevamp.css'), 'utf8')

  expect(css).toMatch(/\.app-header-brand-row\s*\{[^}]*grid-template-columns:/)
  expect(css).toMatch(/\.ozzie-brand-dock\s*\{[^}]*position:\s*relative/)
  expect(css).not.toMatch(/\.ozzie-brand-dock\s*\{[^}]*position:\s*fixed/)
  expect(css).toMatch(/\.top-navigation\s*\{[^}]*display:\s*flex[^}]*justify-content:\s*center[^}]*border-bottom:/)
  expect(css).toMatch(/\.app-main\.app-main-horizontal\s*\{[^}]*margin-left:\s*0/)
})

it('turns the horizontal navigation into a compact mobile drawer', () => {
  const css = readFileSync(join(cwd(), 'src/features/shell/headerNavRevamp.css'), 'utf8')

  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.top-navigation\s*\{[^}]*position:\s*fixed[^}]*display:\s*none/)
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.top-navigation\.open\s*\{[^}]*display:\s*grid/)
  expect(css).toMatch(/@media\s*\(max-width:\s*800px\)[\s\S]*?\.app-main\.app-main-horizontal\s*\{[^}]*margin-left:\s*0/)
})

it('progressively reflows the workspace content while the browser window is resized', () => {
  const responsiveCss = readFileSync(join(cwd(), 'src/features/shell/responsiveShell.css'), 'utf8')

  expect(responsiveCss).toMatch(/\.app-main\s*\{[^}]*min-width:\s*0[^}]*overflow-x:\s*clip/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*1100px\)[\s\S]*?\.navigator-entry-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*920px\)[\s\S]*?\.category-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/)
  expect(responsiveCss).toMatch(/@media\s*\(max-width:\s*620px\)[\s\S]*?\.category-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
})

it('keeps workspace metadata available without recreating the old sidebar footer', () => {
  const { container } = render(<AppShell profile={agentProfile} />)

  expect(container.querySelector('.workspace-meta-footer')).toBeInTheDocument()
  expect(container.querySelector('.sidebar-footer')).not.toBeInTheDocument()
  expect(screen.getByText(/Workspace Lead\s+Cjei A\./i)).toBeInTheDocument()
  expect(screen.getByText(/Collaborator\s+Nina F\./i)).toBeInTheDocument()
})

it('keeps all opened live tools available and stacks minimized tools instead of closing them', async () => {
  const user = userEvent.setup()
  render(<AppShell profile={agentProfile}><div>Current page content</div></AppShell>)

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Call Documentation' }))

  await user.click(screen.getByText('Call Flow'))
  await user.click(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('button', { name: 'Scope Check' }))

  expect(screen.getByLabelText('Call Documentation minimized')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Readiness Lab' }))

  expect(screen.getByLabelText('Call Documentation minimized')).toBeInTheDocument()
  expect(screen.getByLabelText('Scope Check minimized')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Readiness Lab' })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Restore Call Documentation' }))

  expect(screen.getByRole('heading', { name: 'Call Documentation' })).toBeInTheDocument()
  expect(screen.getByLabelText('Scope Check minimized')).toBeInTheDocument()
  expect(screen.getByLabelText('Readiness Lab minimized')).toBeInTheDocument()
})
