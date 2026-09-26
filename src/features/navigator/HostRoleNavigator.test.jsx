import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { Navigator } from './Navigator'

it('defaults Home to Host / Arbitrator and hides Participant-only fastest routes', () => {
  render(<Navigator />)

  expect(screen.getByRole('button', { name: 'Host / Arbitrator' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('heading', { name: 'Fastest Host Routes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I need to start or join my hearing as host/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /I’m waiting to get in/i })).not.toBeInTheDocument()
})

it('switches back to the preserved Participant experience', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'Participant' }))
  expect(screen.getByRole('button', { name: 'Participant' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('heading', { name: 'Fastest Routes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I’m waiting to get in/i })).toBeInTheDocument()
})

it('routes Host search directly into confirmation-first troubleshooting', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, 'no host controls')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  await user.click(within(listbox).getByRole('option', { name: /I do not see my host controls/i }))

  const dialog = screen.getByRole('dialog', { name: /Host controls are missing/i })
  expect(within(dialog).getByText(/Confirm before proceeding/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/signed in with the assigned Zoom credentials/i)).toBeInTheDocument()
})

it('makes Tier 1 roadblocks directly searchable and documentation-ready', async () => {
  const user = userEvent.setup()
  const onAddToDocumentation = vi.fn()
  render(<Navigator onAddToDocumentation={onAddToDocumentation} />)

  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, 'firewall')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  await user.click(within(listbox).getByRole('option', { name: /Network, firewall, VPN, or security restriction/i }))

  const dialog = screen.getByRole('dialog', { name: /Network, firewall, VPN, or security restriction/i })
  expect(within(dialog).getByText(/Suggested agent wording/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: /Add roadblock to Call Documentation/i }))

  expect(onAddToDocumentation).toHaveBeenCalledTimes(1)
  expect(onAddToDocumentation.mock.calls[0][0].resolutionNextSteps).toMatch(/internet service provider or device\/network support/i)
})


it('shows the correct Host audio guide first for "I can’t hear anyone" and suppresses unrelated results', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, "I can't hear anyone")

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const options = within(listbox).getAllByRole('option')

  expect(options[0]).toHaveTextContent(/My microphone, speaker, or headset is not working/i)
  expect(within(listbox).queryByRole('option', { name: /I need to share my screen or allow a participant to share/i })).not.toBeInTheDocument()
  expect(within(listbox).queryByRole('option', { name: /Unable to join after approved basic joining troubleshooting/i })).not.toBeInTheDocument()
})

it.each([
  ['no sound', /My microphone, speaker, or headset is not working/i],
  ['camera not working', /My camera is not working/i],
  ["can't share screen", /I need to share my screen or allow a participant to share/i],
  ['no host controls', /I do not see my host controls/i],
  ['unstable network', /I cannot join reliably or I keep getting disconnected/i],
])('puts the expected Host guide first for %s', async (query, expectedName) => {
  const user = userEvent.setup()
  const { unmount } = render(<Navigator />)

  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, query)
  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  expect(within(listbox).getAllByRole('option')[0]).toHaveTextContent(expectedName)

  unmount()
})
