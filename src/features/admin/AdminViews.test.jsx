import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

const loadTeam = vi.fn()
const loadUsage = vi.fn()
const loadFeedback = vi.fn()
const loadReadinessReport = vi.fn()
const updateFeedbackStatus = vi.fn()
const runAdminAction = vi.fn()
vi.mock('../../lib/adminApi', () => ({ loadFeedback, loadTeam, loadUsage, loadReadinessReport, updateFeedbackStatus, runAdminAction }))

beforeEach(() => {
  loadUsage.mockReset()
  loadFeedback.mockReset()
  loadReadinessReport.mockReset()
  loadReadinessReport.mockResolvedValue({ parts: [] })
  updateFeedbackStatus.mockReset()
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


it('shows accurate presence and zero-usage users across usage periods', async () => {
  const now = new Date()
  const recent = now.toISOString()
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString()
  loadUsage.mockResolvedValue({
    profiles: [
      { id: 'u1', username: 'active_agent', initials: 'AA', status: 'active' },
      { id: 'u2', username: 'idle_agent', initials: 'IA', status: 'active' },
      { id: 'u3', username: 'zero_agent', initials: 'ZA', status: 'active' },
    ],
    events: [
      { user_id: 'u1', event_type: 'process_open', process_id: 'audio-one', category_id: 'audio', tool_id: null, created_at: recent },
    ],
    sessions: [
      { session_id: 's1', user_id: 'u1', started_at: recent, ended_at: null, active_seconds: 600, last_interaction: recent },
    ],
    presence: [
      { user_id: 'u1', state: 'active', last_heartbeat: recent, last_interaction: recent },
      { user_id: 'u2', state: 'active', last_heartbeat: recent, last_interaction: tenMinutesAgo },
    ],
  })

  const { UsageAnalytics } = await import('./AdminViews')
  render(<UsageAnalytics />)

  expect(await screen.findByLabelText('Total Users: 3')).toBeInTheDocument()
  expect(screen.getByLabelText('Active Now: 1')).toBeInTheDocument()
  expect(screen.getByLabelText('Idle: 1')).toBeInTheDocument()
  expect(screen.getByLabelText('Offline: 1')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Daily' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Weekly' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Monthly' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  expect(screen.getByText('zero_agent')).toBeInTheDocument()
})

it('lets JA update feedback status, see history, and open the stored page', async () => {
  const user = userEvent.setup()
  const onOpenPage = vi.fn()
  loadFeedback.mockResolvedValue([{
    id: 'feedback-1',
    type: 'ui_ux',
    status: 'new',
    route_id: 'navigator',
    process_id: 'zoom-audio-troubleshooting',
    category_id: 'audio',
    page_label: 'Navigator',
    what_noticed: 'The route needs review.',
    suggested_change: null,
    created_at: new Date().toISOString(),
    history: [{ previous_status: 'new', new_status: 'reviewing', created_at: new Date().toISOString() }],
  }])
  updateFeedbackStatus.mockResolvedValue({ id: 'feedback-1', status: 'reviewing' })

  const { FeedbackQueue } = await import('./AdminViews')
  render(<FeedbackQueue onOpenPage={onOpenPage} />)

  expect(await screen.findByText('The route needs review.')).toBeInTheDocument()
  expect(screen.getByText(/new → reviewing/i)).toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText('Status for feedback feedback-1'), 'reviewing')
  expect(updateFeedbackStatus).toHaveBeenCalledWith('feedback-1', 'reviewing')

  await user.click(screen.getByRole('button', { name: 'Open Page' }))
  expect(onOpenPage).toHaveBeenCalledWith(expect.objectContaining({
    route_id: 'navigator',
    process_id: 'zoom-audio-troubleshooting',
  }))
})


it('shows Readiness Lab attempt history separately with scores and incorrect answers', async () => {
  const now = new Date().toISOString()
  loadUsage.mockResolvedValue({
    profiles: [{ id: 'u1', username: 'agent_one', initials: 'AO', role: 'agent', status: 'active' }],
    events: [],
    sessions: [],
    presence: [],
  })
  loadReadinessReport.mockResolvedValue({
    parts: [{
      id: 'foundation-call-flow',
      title: 'General Zoom Scenarios',
      questionSetVersion: 'zoom_general_scenarios_v1',
      maxAttempts: 3,
      users: [{
        id: 'u1',
        username: 'agent_one',
        initials: 'AO',
        role: 'agent',
        status: 'active',
        attempts: [
        {
          id: 'attempt-1',
          attemptNumber: 1,
          status: 'submitted',
          score: 3,
          totalQuestions: 5,
          checkedCount: 5,
          startedAt: now,
          submittedAt: now,
          incorrectAnswers: [{
            questionId: 'cant-hear-output',
            prompt: 'A user cannot hear anyone. What should the agent investigate first?',
            selectedOptionId: 'b',
            selectedAnswer: 'Check microphone input.',
            correctOptionId: 'a',
            correctAnswer: 'Check speaker output.',
            checkedAt: now,
          }],
        },
        {
          id: 'attempt-2',
          attemptNumber: 2,
          status: 'active',
          score: null,
          totalQuestions: 5,
          checkedCount: 2,
          startedAt: now,
          submittedAt: null,
          incorrectAnswers: [],
          },
        ],
      }],
    }, {
      id: 'device-navigation',
      title: 'Device & Navigation Awareness',
      questionSetVersion: 'zoom_device_navigation_v1',
      maxAttempts: 3,
      users: [{
        id: 'u1',
        username: 'agent_one',
        initials: 'AO',
        role: 'agent',
        status: 'active',
        attempts: [],
      }],
    }],
  })

  const { UsageAnalytics } = await import('./AdminViews')
  render(<UsageAnalytics />)

  expect(await screen.findByRole('heading', { name: 'Readiness Lab Report' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'General Zoom Scenarios' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Device & Navigation Awareness' })).toBeInTheDocument()
  expect(screen.getByText('Attempt 1')).toBeInTheDocument()
  expect(screen.getByText('Score 3/5')).toBeInTheDocument()
  expect(screen.getByText('Attempt 2')).toBeInTheDocument()
  expect(screen.getByText('2/5 checked · In progress')).toBeInTheDocument()
  expect(screen.getByText(/Check microphone input/i)).toBeInTheDocument()
  expect(screen.getByText(/Check speaker output/i)).toBeInTheDocument()
})
