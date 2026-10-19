import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'

it('puts a sourced answer before the guide results and opens approved Participant troubleshooting', () => {
  render(<Navigator initialRole="Participant" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'My microphone is not muted but no one can hear me' },
  })
  const card = screen.getByRole('region', { name: 'Verified quick answer' })
  expect(within(card).getByText('Approved next check')).toBeInTheDocument()
  expect(within(card).getByText(/select the intended microphone and test it/i)).toBeInTheDocument()
  expect(within(card).getByText(/Approved Common Issue/)).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Results for/ })).toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: /Open guided troubleshooting/ }))
  expect(screen.getByRole('dialog', { name: /They can’t hear me/i })).toBeInTheDocument()
}, 20000)

it('opens an approved Host route for missing controls, without exposing Participant-only guides', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'Why are my host controls missing?' },
  })
  const card = screen.getByRole('region', { name: 'Verified quick answer' })
  expect(within(card).getByText(/host controls are available only after/i)).toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: /Open guided troubleshooting/ }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
}, 20000)

it('never fabricates quick answers for unmatched search language', () => {
  render(<Navigator initialRole="Host" />)
  fireEvent.change(screen.getByRole('combobox', { name: 'Search support processes' }), {
    target: { value: 'arbitration billing account changes' },
  })
  expect(screen.queryByRole('region', { name: 'Verified quick answer' })).not.toBeInTheDocument()
  expect(screen.getByText(/No verified quick answer for this wording yet/)).toBeInTheDocument()
})
