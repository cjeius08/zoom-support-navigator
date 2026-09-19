import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { LiveCallFlow, LiveCallFlowDetails } from './LiveCallFlow'

it('keeps the summary card compact and uses the toggle only to request full workflow visibility', async () => {
  const user = userEvent.setup()
  const onExpandedChange = vi.fn()
  render(<LiveCallFlow expanded={false} onExpandedChange={onExpandedChange} />)

  const toggle = screen.getByRole('button', { name: /View approved call flow/i })
  expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect(toggle).toHaveTextContent('11 steps')
  expect(screen.queryByRole('table', { name: 'Live call flow' })).not.toBeInTheDocument()

  await user.click(toggle)

  expect(onExpandedChange).toHaveBeenCalledWith(true)
  expect(screen.queryByRole('table', { name: 'Live call flow' })).not.toBeInTheDocument()
})

it('renders the eleven-stage Ogletree workflow when the parent chooses to show it', () => {
  render(<LiveCallFlowDetails />)

  const table = screen.getByRole('table', { name: 'Live call flow' })
  expect(within(table).getByRole('columnheader', { name: 'Step' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Agent Action' })).toBeInTheDocument()
  expect(within(table).getByRole('columnheader', { name: 'Suggested Script' })).toBeInTheDocument()

  for (const label of [
    'Opening / Greeting',
    'Active Listening & Acknowledgment',
    'Empathy Statement',
    'Assurance / Ownership',
    'Caller & Hearing Identification',
    'Probing / Diagnostic Questions',
    'Troubleshooting',
    'Confirmation of Resolution',
    'Recap / Summary',
    'Final Check',
    'Closing Spiel',
  ]) {
    expect(within(table).getByText(label, { selector: 'th span:last-child' })).toBeInTheDocument()
  }
})

it('shows the official simple formula and the resolved versus unresolved branch', () => {
  render(<LiveCallFlowDetails />)

  const formula = screen.getByRole('region', { name: 'Simple Agent Formula' })
  expect(within(formula).getByText(/Greet → Listen → Empathize → Assure → Probe → Troubleshoot → Confirm → Close/i)).toBeInTheDocument()

  const branch = screen.getByRole('heading', { name: 'Resolved?' }).closest('section')
  expect(within(branch).getByText('YES — Resolved')).toBeInTheDocument()
  expect(within(branch).getByText(/Recap → Final Check → Closing/i)).toBeInTheDocument()
  expect(within(branch).getByText('NO — Unresolved')).toBeInTheDocument()
  expect(within(branch).getByText(/Explain Next Step → Escalate \/ Document → Recap → Closing/i)).toBeInTheDocument()
  expect(within(branch).getByText(/Use the current Scope Check \/ referral guidance/i)).toBeInTheDocument()
})

it('keeps Locate Describe Guide Confirm inside the Troubleshooting stage', () => {
  render(<LiveCallFlowDetails />)

  const method = screen.getByRole('region', { name: 'Locate Describe Guide Confirm method' })
  expect(within(method).getByText(/Use inside Step 7/i)).toBeInTheDocument()
  for (const stage of ['Locate', 'Describe', 'Guide', 'Confirm']) {
    expect(within(method).getByText(stage)).toBeInTheDocument()
  }
})

it('shows only the approved collapsible call flow and removes the context controls', () => {
  render(<LiveCallFlow />)

  expect(screen.getByRole('heading', { name: 'Live Call Flow' })).toBeInTheDocument()
  expect(screen.getByText('Approved call flow')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /View approved call flow/i })).toHaveTextContent('11 steps')

  for (const removed of ['Device', 'Caller role', 'Hearing status', 'Who is affected', 'Resolution status', 'Reset call']) {
    expect(screen.queryByText(removed)).not.toBeInTheDocument()
  }
})
