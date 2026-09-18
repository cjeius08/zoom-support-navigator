import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LiveCallFlow, LiveCallFlowDetails } from './LiveCallFlow'

it('keeps the summary card compact and uses the toggle only to request full workflow visibility', async () => {
  const user = userEvent.setup()
  const onExpandedChange = vi.fn()
  render(<LiveCallFlow expanded={false} onExpandedChange={onExpandedChange} />)

  const toggle = screen.getByRole('button', { name: /View full call flow/i })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('table', { name: 'Live call flow' })).not.toBeInTheDocument()

  await user.click(toggle)

  expect(onExpandedChange).toHaveBeenCalledWith(true)
  expect(screen.queryByRole('table', { name: 'Live call flow' })).not.toBeInTheDocument()
})

it('renders the seven-stage detailed workflow when the parent chooses to show it', () => {
  render(<LiveCallFlowDetails />)

  const table = screen.getByRole('table', { name: 'Live call flow' })
  expect(within(table).getByRole('columnheader', { name: 'Step' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Agent Action' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Suggested Script' })).toBeInTheDocument()

  for (const label of ['Opening', 'Acknowledgment', 'Identify', 'Resolution', 'Recap', 'Adjacent Issues', 'Closing']) {
    expect(within(table).getByRole('rowheader', { name: new RegExp('\\b' + label + '$', 'i') })).toBeInTheDocument()
  }
})


it('shows the approved Locate Describe Guide Confirm method in the detailed workflow', () => {
  render(<LiveCallFlowDetails />)

  const method = screen.getByRole('region', { name: 'Locate Describe Guide Confirm method' })
  for (const stage of ['Locate', 'Describe', 'Guide', 'Confirm']) {
    expect(within(method).getByText(stage)).toBeInTheDocument()
  }
  expect(within(method).getByText(/Do not move to the next instruction until the caller confirms/i)).toBeInTheDocument()
})

it('captures device, caller role, and resolution status with clear pressed states', async () => {
  const user = userEvent.setup()
  render(<LiveCallFlow />)

  await user.click(screen.getByRole('button', { name: 'Windows' }))
  await user.click(screen.getByRole('button', { name: 'Participant' }))
  await user.click(screen.getByRole('button', { name: 'Resolved' }))

  expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Participant' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'true')
})

it('resets the live call context for the next caller', async () => {
  const user = userEvent.setup()
  render(<LiveCallFlow />)

  await user.click(screen.getByRole('button', { name: 'Mac' }))
  await user.click(screen.getByRole('button', { name: 'Host' }))
  await user.click(screen.getByRole('button', { name: 'Escalation Needed' }))
  await user.click(screen.getByRole('button', { name: 'Reset call' }))

  expect(screen.getByRole('button', { name: 'Mac' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Host' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Escalation Needed' })).toHaveAttribute('aria-pressed', 'false')
})
