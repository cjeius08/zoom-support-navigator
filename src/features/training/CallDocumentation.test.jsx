import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'

vi.mock('../../lib/callNotesApi', () => ({
  loadOwnCallNotes: vi.fn().mockResolvedValue([]),
  saveOwnCallNote: vi.fn().mockResolvedValue({ id: 'note-1', created_at: '2026-09-19T01:30:00Z', expires_at: '2026-12-18T01:30:00Z' }),
}))

import { CallDocumentation } from './CallDocumentation'
import { formatCallDocumentation } from './callDocumentationFormat'

it('formats the approved documentation fields in a copy-ready order', () => {
  const text = formatCallDocumentation({
    callerName: 'Sample Caller',
    phoneNumber: '555-0100',
    dateTime: '2026-09-19T01:30',
    callerRef: 'REF-123',
    reasonForCall: 'Audio & Video',
    device: 'Windows',
    accessContext: 'Zoom desktop app',
    exactIssue: 'Cannot hear the meeting.',
    stepsResult: 'Selected the correct speaker; test tone worked.',
    resolutionNextSteps: 'Meeting audio restored.',
    recommendedContact: '',
    outcome: 'Resolved',
  })

  expect(text).toContain('Caller Name: Sample Caller')
  expect(text).toContain('Date and Time: 2026-09-19 01:30')
  expect(text).toContain('Reason for the Call: Audio & Video')
  expect(text).toContain('Device / Platform: Windows')
  expect(text).toContain('Steps Attempted + Result: Selected the correct speaker; test tone worked.')
  expect(text).toContain('Recommended Contact (if referred): —')
  expect(text).toContain('Call Outcome: Resolved')
})

it('keeps the dock hidden until the agent opens the global tool', () => {
  render(<CallDocumentation open={false} />)
  expect(screen.queryByRole('complementary', { name: /Call Documentation/i })).not.toBeInTheDocument()
})

it('lets an agent document a call and copy the generated summary from the dock', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  render(<CallDocumentation open />)

  await user.type(screen.getByLabelText('Caller name'), 'Sample Caller')
  await user.type(screen.getByLabelText('Phone number'), '555-0100')
  await user.type(screen.getByLabelText(/Caller ref/i), 'REF-123')
  await user.selectOptions(screen.getByLabelText('Reason for the Call'), 'Audio & Video')
  await user.selectOptions(screen.getByLabelText('Device / platform'), 'Windows')
  await user.type(screen.getByLabelText(/Device and access/i), 'Zoom desktop app')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Cannot hear the meeting.')
  await user.type(screen.getByLabelText(/Steps attempted \+ result/i), 'Selected the correct speaker; test tone worked.')
  await user.type(screen.getByLabelText(/Resolution \/ next steps/i), 'Meeting audio restored.')
  await user.click(screen.getByRole('button', { name: 'Resolved' }))

  await user.click(screen.getByText('Documentation preview'))
  expect(screen.getByText(/Caller Name: Sample Caller/i)).toBeInTheDocument()
  expect(screen.getByText(/Call Outcome: Resolved/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Copy documentation' }))
  expect(writeText).toHaveBeenCalledTimes(1)
  expect(writeText.mock.calls[0][0]).toContain('Reason for the Call: Audio & Video')
  expect(writeText.mock.calls[0][0]).toContain('Exact Issue: Cannot hear the meeting.')
  expect(screen.getByRole('button', { name: 'Copied documentation' })).toBeInTheDocument()
})

it('keeps the draft when the global dock is minimized or temporarily closed', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<CallDocumentation open />)

  await user.type(screen.getByLabelText('Caller name'), 'Persistent Caller')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Persistent issue')

  rerender(<CallDocumentation open minimized />)
  expect(screen.getByLabelText('Call Documentation minimized')).toBeInTheDocument()
  expect(screen.getByText(/2 fields in draft/i)).toBeInTheDocument()
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()

  rerender(<CallDocumentation open />)
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
  expect(screen.getByLabelText(/Exact issue/i)).toHaveValue('Persistent issue')

  rerender(<CallDocumentation open={false} />)
  expect(screen.queryByLabelText('Caller name')).not.toBeInTheDocument()

  rerender(<CallDocumentation open />)
  expect(screen.getByLabelText('Caller name')).toHaveValue('Persistent Caller')
})

it('clears the temporary draft only after confirmation', async () => {
  const user = userEvent.setup()
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

  render(<CallDocumentation open />)

  await user.type(screen.getByLabelText('Caller name'), 'Sample Caller')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Test issue')
  await user.click(screen.getByRole('button', { name: 'Resolved' }))
  await user.click(screen.getByRole('button', { name: 'Clear' }))

  expect(confirm).toHaveBeenCalled()
  expect(screen.getByLabelText('Caller name')).toHaveValue('')
  expect(screen.getByLabelText(/Exact issue/i)).toHaveValue('')
  expect(screen.getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'false')

  confirm.mockRestore()
})

it('sends a saved-note Open action to the dedicated saved notes page', async () => {
  const callNotesApi = await import('../../lib/callNotesApi')
  callNotesApi.loadOwnCallNotes.mockResolvedValueOnce([{
    id: 'note-follow',
    caller_ref: 'CASE-OPEN',
    device: 'Windows',
    outcome: 'Follow-Up Required',
    created_at: '2026-09-22T02:30:00Z',
    expires_at: '2026-12-21T02:30:00Z',
    draft: { callerRef: 'CASE-OPEN', outcome: 'Follow-Up Required' },
  }])
  const user = userEvent.setup()
  const onOpenSavedNotes = vi.fn()
  render(<CallDocumentation open onOpenSavedNotes={onOpenSavedNotes} />)

  await user.click(await screen.findByText(/Saved notes \(1\)/i))
  await user.click(screen.getByRole('button', { name: 'Open' }))
  expect(onOpenSavedNotes).toHaveBeenCalledWith('note-follow')
})

it('shows the approved reporting options without duplicate or misspelled dispositions', () => {
  render(<CallDocumentation open />)

  expect(screen.getByText(/Protected workspace note · retained for 90 days/i)).toBeInTheDocument()
  expect(screen.getByText(/Workspace Admin can review, manage, and delete saved notes for reporting and follow-up/i)).toBeInTheDocument()
  expect(screen.getByText(/Do not enter passwords, full payment card numbers, government IDs/i)).toBeInTheDocument()
  expect(screen.getByText(/Zoom Basic Support Boundaries, Decision Path & Referral Process/i)).toBeInTheDocument()
  expect(screen.getByLabelText('Reason for the Call')).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'Join & Access' })).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'Disconnected / Dropped Call' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Referred for Additional Assistance' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Not Resolved | Escalated' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Callback | Resolved' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Callback | Not Resolved' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Dropped Call' })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Resolved' })).toHaveLength(1)
})


it('merges an explicit Guided Process handoff into the draft without overwriting caller details or auto-saving', async () => {
  const api = await import('../../lib/callNotesApi')
  api.saveOwnCallNote.mockClear()
  const user = userEvent.setup()
  const onPrefillApplied = vi.fn()

  const { rerender } = render(<CallDocumentation open onPrefillApplied={onPrefillApplied} />)

  await user.type(screen.getByLabelText('Caller name'), 'Existing Caller')
  await user.type(screen.getByLabelText(/Caller ref/i), 'CASE-77')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Caller wording already captured.')
  await user.type(screen.getByLabelText(/Steps attempted \+ result/i), 'Manual step already documented.')

  rerender(<CallDocumentation
    open
    onPrefillApplied={onPrefillApplied}
    prefill={{
      id: 'guided-handoff-1',
      device: 'Windows',
      exactIssue: 'I can’t hear anyone',
      stepsResult: 'Approved guide used: Speaker Guide\n1. Check speaker — Resolved',
      resolutionNextSteps: 'Resolved on approved step: Check speaker.',
      outcome: 'Resolved',
    }}
  />)

  expect(screen.getByLabelText('Caller name')).toHaveValue('Existing Caller')
  expect(screen.getByLabelText(/Caller ref/i)).toHaveValue('CASE-77')
  expect(screen.getByLabelText(/Exact issue/i)).toHaveValue('Caller wording already captured.')
  expect(screen.getByLabelText('Device / platform')).toHaveValue('Windows')
  expect(screen.getByLabelText(/Steps attempted \+ result/i).value).toContain('Manual step already documented.')
  expect(screen.getByLabelText(/Steps attempted \+ result/i).value).toContain('Approved guide used: Speaker Guide')
  expect(screen.getByLabelText(/Resolution \/ next steps/i)).toHaveValue('Resolved on approved step: Check speaker.')
  expect(screen.getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText(/Guided troubleshooting added to this draft. Review it before saving/i)).toBeInTheDocument()
  expect(onPrefillApplied).toHaveBeenCalledWith('guided-handoff-1')
  expect(api.saveOwnCallNote).not.toHaveBeenCalled()
})


it('clears only the current unsaved documentation state when a New Call reset is confirmed', async () => {
  const api = await import('../../lib/callNotesApi')
  api.saveOwnCallNote.mockClear()
  const user = userEvent.setup()
  const { rerender } = render(<CallDocumentation open resetToken={0} />)

  await user.type(screen.getByLabelText('Caller name'), 'Previous Caller')
  await user.type(screen.getByLabelText(/Caller ref/i), 'PREV-101')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Previous call issue')
  expect(screen.getByLabelText('Caller name')).toHaveValue('Previous Caller')

  rerender(<CallDocumentation open resetToken={1} />)

  expect(screen.getByLabelText('Caller name')).toHaveValue('')
  expect(screen.getByLabelText(/Caller ref/i)).toHaveValue('')
  expect(screen.getByLabelText(/Exact issue/i)).toHaveValue('')
  expect(screen.getByLabelText('Device / platform')).toHaveValue('')
  expect(api.saveOwnCallNote).not.toHaveBeenCalled()
})
