import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

const loadTeam = vi.fn()
const runAdminAction = vi.fn()
vi.mock('../../lib/adminApi', () => ({ loadFeedback: vi.fn(), loadTeam, loadUsage: vi.fn(), runAdminAction }))

beforeEach(() => {
  loadTeam.mockResolvedValue([{ id: 'agent-1', username: 'agent_one', initials: 'AO', role: 'agent', status: 'active', avatar_id: null, presence: 'active' }])
  runAdminAction.mockReset()
})

it('shows creator-admin lifecycle controls through a compact action menu', async () => {
  const user = userEvent.setup()
  const { TeamManagement } = await import('./AdminViews')
  render(<TeamManagement />)
  expect(await screen.findByText('agent_one')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Manage agent_one' }))
  expect(screen.getByRole('button', { name: 'Edit Username' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Deactivate Account' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Permanently Delete' })).toBeInTheDocument()
})

it('generates an invite one time from initials', async () => {
  const user = userEvent.setup()
  runAdminAction.mockResolvedValue({ invite_code: 'ABCDEF-012345' })
  const { TeamManagement } = await import('./AdminViews')
  render(<TeamManagement />)
  await user.click(screen.getByRole('button', { name: /Add Team Member/i }))
  await user.type(screen.getByLabelText('Initials'), 'AB')
  await user.click(screen.getByRole('button', { name: 'Generate Invite' }))
  expect(await screen.findByText('ABCDEF-012345')).toBeInTheDocument()
  expect(runAdminAction).toHaveBeenCalledWith({ action: 'generate_invite', initials: 'AB' })
})

it('labels a pending member action as regeneration', async () => {
  loadTeam.mockResolvedValueOnce([{ id: 'pending-AB', initials: 'AB', pending: true, status: 'pending', role: 'agent', avatar_id: null }])
  const { TeamManagement } = await import('./AdminViews')
  render(<TeamManagement />)
  expect(await screen.findByRole('button', { name: /regenerate invite for AB/i })).toBeInTheDocument()
})
