import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'

it('shows the five Phase 2 common-issue routes in caller language', () => {
  render(<Navigator />)

  expect(screen.getByRole('button', { name: /Can’t join the meeting/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I can’t hear anyone/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /They can’t hear me/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /My camera isn’t working/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I’m waiting to get in/i })).toBeInTheDocument()
})

it('classifies cannot-hear as an audio-output symptom before assuming connection trouble', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))

  const dialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })
  expect(within(dialog).getByText(/audio-output symptom/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Are they already inside the meeting/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/If the meeting itself is reconnecting, dropping, or not loading/i)).toBeInTheDocument()
})

it('keeps waiting-for-host and Waiting Room as separate meeting states', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /I’m waiting to get in/i }))

  const dialog = screen.getByRole('dialog', { name: /I’m waiting to get in/i })
  expect(within(dialog).getByRole('heading', { name: 'Waiting for host' })).toBeInTheDocument()
  expect(within(dialog).getByText(/successfully connected to Zoom/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Waiting Room' })).toBeInTheDocument()
  expect(within(dialog).getByText(/host controls admission/i)).toBeInTheDocument()
})

it('routes natural caller language directly to the common issue guide', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'they cant hear me')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const firstOption = within(listbox).getAllByRole('option')[0]
  expect(firstOption).toHaveTextContent('They can’t hear me')
  expect(firstOption).toHaveTextContent('Common Issue Route')

  await user.click(firstOption)
  expect(screen.getByRole('dialog', { name: /They can’t hear me/i })).toBeInTheDocument()
})

it('uses the Phase 1 device and role context inside a common issue route', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'Windows' }))
  await user.click(screen.getByRole('button', { name: 'Participant' }))
  await user.click(screen.getByRole('button', { name: /They can’t hear me/i }))

  const dialog = screen.getByRole('dialog', { name: /They can’t hear me/i })
  const context = within(dialog).getByLabelText('Selected call context')
  expect(context).toHaveTextContent('Windows')
  expect(context).toHaveTextContent('Participant')
})

it('keeps authoritative sources visible but secondary to the quick route', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /My camera isn’t working/i }))
  const dialog = screen.getByRole('dialog', { name: /My camera isn’t working/i })

  await user.click(within(dialog).getByRole('tab', { name: 'Sources' }))

  expect(within(dialog).getByRole('link', { name: /Official Zoom Support/i })).toHaveAttribute('href', expect.stringContaining('support.zoom.com'))
  expect(within(dialog).getByText(/Zoom Camera Troubleshooting During a Meeting/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Verified against official Zoom Support: September 18, 2026/i)).toBeInTheDocument()
})
