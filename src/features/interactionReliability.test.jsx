import { cleanup, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { FeedbackPage } from './feedback/FeedbackPage'
import { TrainingResources } from './training/TrainingResources'
import { Navigator } from './navigator/Navigator'
import { AppShell } from './shell/AppShell'
import { TeamManagement } from './admin/AdminViews'
import App from '../App'

const { loadTeam, runAdminAction, getCurrentProfile, signOut } = vi.hoisted(() => ({
  loadTeam: vi.fn(),
  runAdminAction: vi.fn(),
  getCurrentProfile: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('../lib/adminApi', () => ({
  loadFeedback: vi.fn(),
  loadTeam,
  loadUsage: vi.fn(),
  updateFeedbackStatus: vi.fn(),
  runAdminAction,
}))

vi.mock('../lib/authApi', () => ({
  activateAccount: vi.fn(),
  changeOwnPassword: vi.fn(),
  getCurrentProfile,
  loginWithUsername: vi.fn(),
  signOut,
  updateOwnAvatar: vi.fn(),
}))

const agentProfile = { username: 'agent_1', initials: 'AG', role: 'agent', avatar_id: null }

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

beforeEach(() => {
  loadTeam.mockReset()
  runAdminAction.mockReset()
  getCurrentProfile.mockReset()
  signOut.mockReset()
  loadTeam.mockResolvedValue([{ id: 'agent-1', username: 'agent_one', initials: 'AO', role: 'agent', status: 'active', avatar_id: null, presence: 'active' }])
  getCurrentProfile.mockResolvedValue(agentProfile)
  signOut.mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

afterEach(() => {
  cleanup()
})

it('keeps Feedback Cancel inside the Support Console', async () => {
  const user = userEvent.setup()
  const onCancel = vi.fn()
  render(<FeedbackPage onSubmit={vi.fn()} onCancel={onCancel} />)

  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(onCancel).toHaveBeenCalledTimes(1)
})

it('opens the exact related training video requested by a process', () => {
  render(<TrainingResources initialVideoId="training-05" />)
  const dialog = screen.getByRole('dialog', { name: 'How to Join a Zoom Meeting' })
  expect(within(dialog).getByTitle('Video player: How to Join a Zoom Meeting')).toBeInTheDocument()
})


it('carries a related training selection through the full app route', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(await screen.findByRole('tab', { name: 'Process Guides' }))
  await user.click(screen.getByRole('button', { name: /Joining Meetings/i }))
  await user.click(screen.getByRole('button', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i }))
  await user.click(screen.getByRole('button', { name: 'How to Join a Zoom Meeting' }))

  const dialog = await screen.findByRole('dialog', { name: 'How to Join a Zoom Meeting' })
  expect(within(dialog).getByTitle('Video player: How to Join a Zoom Meeting')).toBeInTheDocument()
})


it('exposes exactly one main landmark in the authenticated Navigator', async () => {
  render(<App />)
  await screen.findByRole('heading', { name: /Find the next step/i })
  expect(screen.getAllByRole('main')).toHaveLength(1)
})

it('shows copy feedback only on the clicked control and reports clipboard failure inline', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  await user.click(screen.getByRole('tab', { name: 'Process Guides' }))
  await user.click(screen.getByRole('button', { name: /Joining Meetings/i }))
  await user.click(screen.getByRole('button', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i }))
  const dialog = screen.getByRole('dialog')
  const scriptButtons = within(dialog).getAllByRole('button', { name: 'Copy Script' })

  await user.click(scriptButtons[0])
  expect(within(dialog).getAllByRole('button', { name: 'Copied ✓' })).toHaveLength(1)
  expect(within(dialog).getAllByRole('button', { name: 'Copy Script' }).length).toBeGreaterThan(0)

  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Clipboard blocked'))
  await user.click(within(dialog).getByRole('button', { name: 'Copy Quick Steps' }))
  expect(await within(dialog).findByRole('button', { name: 'Copy failed' })).toBeInTheDocument()
})

it('traps focus in the process drawer and restores focus to its opener on Escape', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  await user.click(screen.getByRole('tab', { name: 'Process Guides' }))
  await user.click(screen.getByRole('button', { name: /Joining Meetings/i }))
  const opener = screen.getByRole('button', { name: /Troubleshooting When You Can’t Join a Zoom Meeting/i })
  opener.focus()
  await user.click(opener)
  const dialog = screen.getByRole('dialog')
  const close = within(dialog).getByRole('button', { name: 'Close process' })
  expect(close).toHaveFocus()

  await user.keyboard('{Shift>}{Tab}{/Shift}')
  expect(dialog).toContainElement(document.activeElement)
  expect(document.activeElement).not.toBe(opener)

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('lets the report modal close with Escape and restores focus to Report an issue', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const opener = screen.getByRole('button', { name: 'Report an issue' })
  await user.click(opener)
  expect(screen.getByRole('dialog', { name: 'Report an issue' })).toBeInTheDocument()

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: 'Report an issue' })).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('keeps profile changes recoverable with busy state, inline errors, Escape, and focus restore', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  const onPasswordChange = vi.fn(() => pending.promise)
  render(<AppShell profile={agentProfile} onPasswordChange={onPasswordChange}><div>content</div></AppShell>)

  const opener = screen.getByRole('button', { name: /agent_1 account/i })
  await user.click(opener)
  await user.click(screen.getByRole('button', { name: 'Change Password' }))
  await user.type(screen.getByLabelText('New password'), 'password123')
  await user.type(screen.getByLabelText('Confirm password'), 'password123')
  await user.click(screen.getByRole('button', { name: 'Save Password' }))

  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  pending.reject(new Error('Could not save password'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save password')
  expect(screen.getByRole('dialog', { name: 'My Profile' })).toBeInTheDocument()

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: 'My Profile' })).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('prevents duplicate admin invite submissions while the request is pending', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  runAdminAction.mockImplementation(() => pending.promise)
  render(<TeamManagement />)

  expect(await screen.findByText('agent_one')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Add Team Member' }))
  await user.type(screen.getByLabelText('Initials'), 'AB')
  await user.click(screen.getByRole('button', { name: 'Generate Invite' }))

  const busy = screen.getByRole('button', { name: 'Generating…' })
  expect(busy).toBeDisabled()
  expect(runAdminAction).toHaveBeenCalledTimes(1)
  await user.click(busy)
  expect(runAdminAction).toHaveBeenCalledTimes(1)

  pending.resolve({ invite_code: 'ABCDEF-012345' })
  await waitFor(() => expect(screen.getByText('ABCDEF-012345')).toBeInTheDocument())
})


it('prevents duplicate admin account actions while the request is pending', async () => {
  const user = userEvent.setup()
  const pending = deferred()
  runAdminAction.mockImplementation(() => pending.promise)
  render(<TeamManagement />)

  expect(await screen.findByText('agent_one')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Manage agent_one' }))
  await user.click(screen.getByRole('button', { name: 'Edit Username' }))
  const username = screen.getByLabelText('Username')
  await user.clear(username)
  await user.type(username, 'agent_two')
  await user.click(screen.getByRole('button', { name: 'Save Username' }))

  const busy = screen.getByRole('button', { name: 'Processing…' })
  expect(busy).toBeDisabled()
  expect(runAdminAction).toHaveBeenCalledTimes(1)
  await user.click(busy)
  expect(runAdminAction).toHaveBeenCalledTimes(1)

  pending.resolve({})
  await waitFor(() => expect(screen.queryByRole('dialog', { name: /Manage agent_one/i })).not.toBeInTheDocument())
})
