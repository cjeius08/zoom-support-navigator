import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { LiveCallFlow } from './LiveCallFlow'

it('keeps the seven-stage workflow collapsed until the agent asks to view it', async () => {
  const user = userEvent.setup()
  render(<LiveCallFlow />)

  const toggle = screen.getByRole('button', { name: /View full call flow/i })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('table', { name: 'Live call flow' })).not.toBeInTheDocument()

  await user.click(toggle)

  expect(screen.getByRole('button', { name: /Hide full call flow/i })).toHaveAttribute('aria-expanded', 'true')
  const table = screen.getByRole('table', { name: 'Live call flow' })
  expect(within(table).getByRole('columnheader', { name: 'Step' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Agent Action' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Suggested Script' })).toBeInTheDocument()

  for (const label of ['Opening', 'Acknowledgment', 'Identify', 'Resolution', 'Recap', 'Adjacent Issues', 'Closing']) {
    expect(within(table).getByRole('rowheader', { name: new RegExp('\\b' + label + '$', 'i') })).toBeInTheDocument()
  }
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
