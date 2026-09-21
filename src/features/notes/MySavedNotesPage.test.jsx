import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'

const loadAllOwnCallNotes = vi.fn()
vi.mock('../../lib/callNotesApi', () => ({ loadAllOwnCallNotes }))

const notes = [
  {
    id: 'follow-1',
    caller_ref: 'CASE-FOLLOW',
    device: 'Windows',
    outcome: 'Follow-Up Required',
    call_started_at: '2026-09-22T02:30:00Z',
    created_at: '2026-09-22T02:35:00Z',
    expires_at: '2026-12-21T02:35:00Z',
    draft: { callerRef: 'CASE-FOLLOW', exactIssue: 'Needs a callback', resolutionNextSteps: 'Call tomorrow', outcome: 'Follow-Up Required' },
  },
  {
    id: 'done-1',
    caller_ref: 'CASE-DONE',
    device: 'Mac',
    outcome: 'Resolved',
    call_started_at: '2026-09-21T02:30:00Z',
    created_at: '2026-09-21T02:35:00Z',
    expires_at: '2026-12-20T02:35:00Z',
    draft: { callerRef: 'CASE-DONE', exactIssue: 'Audio fixed', outcome: 'Resolved' },
  },
]

beforeEach(() => {
  loadAllOwnCallNotes.mockReset()
  loadAllOwnCallNotes.mockResolvedValue(notes)
})

it('shows a member only their saved notes with a prominent follow-up filter', async () => {
  const user = userEvent.setup()
  const { MySavedNotesPage } = await import('./MySavedNotesPage')
  render(<MySavedNotesPage />)

  expect(await screen.findByRole('heading', { name: 'My Saved Notes & Follow-Ups' })).toBeInTheDocument()
  expect(screen.getAllByText('CASE-FOLLOW').length).toBeGreaterThan(0)
  expect(screen.getAllByText('CASE-DONE').length).toBeGreaterThan(0)

  await user.click(screen.getByRole('button', { name: /Follow-Up Required/i }))
  expect(screen.getAllByText('CASE-FOLLOW').length).toBeGreaterThan(0)
  expect(screen.queryAllByText('CASE-DONE')).toHaveLength(0)
})

it('opens the selected note documentation when arriving from the saved-note card', async () => {
  const { MySavedNotesPage } = await import('./MySavedNotesPage')
  render(<MySavedNotesPage initialNoteId="follow-1" />)

  await screen.findAllByText('CASE-FOLLOW')
  const summary = screen.getAllByText('Open saved documentation')[0]
  expect(summary.closest('details')).toHaveAttribute('open')
  expect(screen.getByText(/Needs a callback/i)).toBeInTheDocument()
})
