import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

const loadCallNotesReport = vi.fn()
const deleteCallNoteAsAdmin = vi.fn()

vi.mock('../../lib/adminApi', () => ({
  loadCallNotesReport,
  deleteCallNoteAsAdmin,
}))

const profiles = [
  { id: 'u1', username: 'agent_one', initials: 'AO', role: 'agent', status: 'active' },
  { id: 'u2', username: 'agent_two', initials: 'AT', role: 'agent', status: 'active' },
]

const notes = [
  {
    id: 'note-follow',
    user_id: 'u1',
    caller_ref: 'CASE-101',
    device: 'Windows',
    outcome: 'Follow-Up Required',
    call_started_at: '2026-09-21T08:00:00Z',
    created_at: '2026-09-21T08:30:00Z',
    updated_at: '2026-09-21T08:30:00Z',
    expires_at: '2026-12-20T08:30:00Z',
    draft: {
      callerRef: 'CASE-101',
      device: 'Windows',
      exactIssue: 'Caller needs a callback after an account check.',
      resolutionNextSteps: 'Follow up tomorrow.',
      outcome: 'Follow-Up Required',
    },
  },
  {
    id: 'note-resolved',
    user_id: 'u2',
    caller_ref: 'CASE-202',
    device: 'Mac',
    outcome: 'Resolved',
    call_started_at: '2026-09-20T07:00:00Z',
    created_at: '2026-09-20T07:30:00Z',
    updated_at: '2026-09-20T07:30:00Z',
    expires_at: '2026-12-19T07:30:00Z',
    draft: {
      callerRef: 'CASE-202',
      device: 'Mac',
      exactIssue: 'Audio output was corrected.',
      resolutionNextSteps: 'No further action.',
      outcome: 'Resolved',
    },
  },
]

beforeEach(() => {
  vi.restoreAllMocks()
  loadCallNotesReport.mockReset()
  loadCallNotesReport.mockResolvedValue({ notes, profiles })
  deleteCallNoteAsAdmin.mockReset()
  deleteCallNoteAsAdmin.mockResolvedValue(undefined)
})

it('puts follow-up-required notes in an easy dedicated filter', async () => {
  const user = userEvent.setup()
  const { SavedNotesPage } = await import('./SavedNotesPage')
  render(<SavedNotesPage />)

  expect(await screen.findByRole('heading', { name: 'Saved Notes & Follow-Ups' })).toBeInTheDocument()
  expect(screen.getByText('CASE-101')).toBeInTheDocument()
  expect(screen.getByText('CASE-202')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Follow-Up Required/i }))
  expect(screen.getByText('CASE-101')).toBeInTheDocument()
  expect(screen.queryByText('CASE-202')).not.toBeInTheDocument()
})

it('opens prefiltered for a clicked person and allows changing the user filter', async () => {
  const user = userEvent.setup()
  const { SavedNotesPage } = await import('./SavedNotesPage')
  render(<SavedNotesPage initialUserId="u1" />)

  expect(await screen.findByText('CASE-101')).toBeInTheDocument()
  expect(screen.queryByText('CASE-202')).not.toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText('User'), 'u2')
  expect(screen.getByText('CASE-202')).toBeInTheDocument()
  expect(screen.queryByText('CASE-101')).not.toBeInTheDocument()
})

it('searches saved note fields and lets admin permanently delete a note', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  const { SavedNotesPage } = await import('./SavedNotesPage')
  render(<SavedNotesPage />)

  await screen.findByText('CASE-101')
  await user.type(screen.getByLabelText('Search saved fields'), 'audio output')
  expect(screen.getByText('CASE-202')).toBeInTheDocument()
  expect(screen.queryByText('CASE-101')).not.toBeInTheDocument()

  await user.clear(screen.getByLabelText('Search saved fields'))
  const deleteButtons = screen.getAllByRole('button', { name: 'Delete note' })
  await user.click(deleteButtons[0])

  await waitFor(() => expect(deleteCallNoteAsAdmin).toHaveBeenCalledTimes(1))
  expect(screen.queryByText('CASE-101')).not.toBeInTheDocument()
})
