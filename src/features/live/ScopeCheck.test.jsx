import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ScopeCheck, evaluateScope } from './ScopeCheck'

it('continues approved troubleshooting only when the issue stays inside scope', () => {
  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'steps-remain',
    authority: 'safe',
  })).toMatchObject({
    state: 'assist',
    label: 'CONTINUE APPROVED TROUBLESHOOTING',
  })
})

it('stops and refers when an immediate roadblock is selected', () => {
  expect(evaluateScope({
    category: 'host',
    troubleshooting: 'not-started',
    authority: 'safe',
  })).toMatchObject({
    state: 'refer',
    label: 'STOP + REFER',
  })

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'exhausted',
    authority: 'safe',
  })).toMatchObject({
    state: 'refer',
    title: 'Approved troubleshooting is exhausted',
  })

  expect(evaluateScope({
    category: 'basic',
    troubleshooting: 'steps-remain',
    authority: 'guess',
  })).toMatchObject({
    state: 'refer',
    title: 'The next action is outside approved authority',
  })
})

it('documents resolved calls instead of referring them', () => {
  expect(evaluateScope({
    category: 'device',
    troubleshooting: 'resolved',
    authority: 'safe',
  })).toMatchObject({
    state: 'resolved',
    label: 'RESOLVED — DOCUMENT & CLOSE',
  })
})

it('walks the agent through a live scope decision without leaving the page', async () => {
  const user = userEvent.setup()
  render(<ScopeCheck open />)

  await user.click(screen.getByRole('button', { name: /Basic Zoom setup/i }))
  await user.click(screen.getByRole('button', { name: /Approved troubleshooting steps still remain/i }))
  await user.click(screen.getByRole('button', { name: /No — next step stays inside approved scope/i }))

  expect(screen.getByText('CONTINUE APPROVED TROUBLESHOOTING')).toBeInTheDocument()
  expect(screen.getByText(/Use the relevant approved process/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Host action or meeting-owner permission/i }))
  expect(screen.getByText('STOP + REFER')).toBeInTheDocument()
  expect(screen.getByText(/A support boundary has been reached/i)).toBeInTheDocument()
  expect(screen.getByText(/do not invent a contact or promise an escalation/i)).toBeInTheDocument()
})

it('can be minimized and restored like the documentation dock', () => {
  const { rerender } = render(<ScopeCheck open />)
  expect(screen.getByRole('heading', { name: 'Scope Check' })).toBeInTheDocument()

  rerender(<ScopeCheck open minimized />)
  expect(screen.getByLabelText('Scope Check minimized')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Restore Scope Check' })).toBeInTheDocument()
})

it('keeps the approved source visible and does not promise an internal escalation', () => {
  render(<ScopeCheck open />)

  expect(screen.getByText(/Zoom Basic Support Boundaries, Decision Path & Referral Process/i)).toBeInTheDocument()
  expect(screen.queryByText(/we will escalate/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Zoom Support will fix/i)).not.toBeInTheDocument()
})
