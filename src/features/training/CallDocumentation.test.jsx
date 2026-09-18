import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { CallDocumentation, formatCallDocumentation } from './CallDocumentation'

it('formats the approved documentation fields in a copy-ready order', () => {
  const text = formatCallDocumentation({
    callerName: 'Sample Caller',
    phoneNumber: '555-0100',
    dateTime: '2026-09-19T01:30',
    callerRef: 'REF-123',
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

it('shows privacy and referral framing without claiming an internal escalation', () => {
  render(<CallDocumentation open />)

  expect(screen.getByText('Not saved by the workspace')).toBeInTheDocument()
  expect(screen.getByText(/Copy to the approved case system/i)).toBeInTheDocument()
  expect(screen.getByText(/Zoom Basic Support Boundaries, Decision Path & Referral Process/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Referred for Additional Assistance' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Escalated/i })).not.toBeInTheDocument()
})
