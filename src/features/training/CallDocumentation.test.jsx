import { render, screen, within } from '@testing-library/react'
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

it('lets an agent document a call and copy the generated summary', async () => {
  const user = userEvent.setup()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  render(<CallDocumentation />)

  await user.type(screen.getByLabelText('Caller name'), 'Sample Caller')
  await user.type(screen.getByLabelText('Phone number'), '555-0100')
  await user.type(screen.getByLabelText(/Caller ref/i), 'REF-123')
  await user.selectOptions(screen.getByLabelText('Device / platform'), 'Windows')
  await user.type(screen.getByLabelText(/Device and access/i), 'Zoom desktop app')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Cannot hear the meeting.')
  await user.type(screen.getByLabelText(/Steps attempted \+ result/i), 'Selected the correct speaker; test tone worked.')
  await user.type(screen.getByLabelText(/Resolution \/ next steps/i), 'Meeting audio restored.')
  await user.click(screen.getByRole('button', { name: 'Resolved' }))

  const preview = screen.getByRole('heading', { name: 'Documentation preview' }).closest('section')
  expect(within(preview).getByText(/Caller Name: Sample Caller/i)).toBeInTheDocument()
  expect(within(preview).getByText(/Call Outcome: Resolved/i)).toBeInTheDocument()

  await user.click(within(preview).getByRole('button', { name: 'Copy documentation' }))
  expect(writeText).toHaveBeenCalledTimes(1)
  expect(writeText.mock.calls[0][0]).toContain('Exact Issue: Cannot hear the meeting.')
  expect(within(preview).getByRole('button', { name: 'Copied documentation' })).toBeInTheDocument()
})

it('publishes only non-customer screen context to the global report context', async () => {
  const user = userEvent.setup()
  const onReportContextChange = vi.fn()

  render(<CallDocumentation onReportContextChange={onReportContextChange} />)

  await user.type(screen.getByLabelText('Caller name'), 'Private Caller Name')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Private case detail')
  await user.selectOptions(screen.getByLabelText('Device / platform'), 'Mac')
  await user.click(screen.getByRole('button', { name: 'Referred for Additional Assistance' }))

  const last = onReportContextChange.mock.calls.at(-1)[0]
  expect(last).toMatchObject({
    selected_tab: 'Documentation',
    current_section: 'Call outcome · Referred for Additional Assistance',
    active_device: 'Mac',
  })
  expect(JSON.stringify(last)).not.toContain('Private Caller Name')
  expect(JSON.stringify(last)).not.toContain('Private case detail')
})

it('clears the temporary draft only after confirmation', async () => {
  const user = userEvent.setup()
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

  render(<CallDocumentation />)

  await user.type(screen.getByLabelText('Caller name'), 'Sample Caller')
  await user.type(screen.getByLabelText(/Exact issue/i), 'Test issue')
  await user.click(screen.getByRole('button', { name: 'Resolved' }))
  await user.click(screen.getByRole('button', { name: 'Clear documentation' }))

  expect(confirm).toHaveBeenCalled()
  expect(screen.getByLabelText('Caller name')).toHaveValue('')
  expect(screen.getByLabelText(/Exact issue/i)).toHaveValue('')
  expect(screen.getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'false')

  confirm.mockRestore()
})

it('shows the source-backed privacy and referral framing without claiming an internal escalation', () => {
  render(<CallDocumentation />)

  expect(screen.getByText('Temporary local draft')).toBeInTheDocument()
  expect(screen.getByText(/does not save these caller details or notes/i)).toBeInTheDocument()
  expect(screen.getByText(/Zoom Basic Support Boundaries, Decision Path & Referral Process/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Referred for Additional Assistance' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Escalated/i })).not.toBeInTheDocument()
})
