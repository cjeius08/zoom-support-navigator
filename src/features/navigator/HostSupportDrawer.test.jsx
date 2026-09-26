import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { HostSupportDrawer } from './HostSupportDrawer'
import { HOST_GUIDED_ROUTES } from '../../data/hostGuidedRoutes'
import { HOST_ROADBLOCKS } from '../../data/arbitratorHostSupport'

it('requires Host confirmation before showing troubleshooting', async () => {
  const user = userEvent.setup()
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-waiting-room-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  expect(screen.getByText(/Confirm before proceeding/i)).toBeInTheDocument()
  expect(screen.queryByText(/Approved troubleshooting/i)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Yes' }))
  expect(screen.getByText(/Is Waiting Room enabled/i)).toBeInTheDocument()
})

it('opens a roadblock immediately when a confirmation hits a Tier 1 boundary', async () => {
  const user = userEvent.setup()
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-audio-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Others cannot hear the arbitrator' }))
  await user.click(screen.getByRole('button', { name: 'USB headset/device' }))
  await user.click(screen.getByRole('button', { name: 'No' }))

  expect(screen.getByText('Tier 1 roadblock')).toBeInTheDocument()
  const roadblockCard = screen.getByText('Tier 1 roadblock').closest('.host-roadblock-card')
  expect(within(roadblockCard).getByRole('heading', { name: /not recognized by the device itself/i })).toBeInTheDocument()
  expect(within(roadblockCard).getByText(/device manufacturer or appropriate hardware support/i)).toBeInTheDocument()
})

it('adds a direct roadblock to the existing Call Documentation handoff without changing the form', async () => {
  const user = userEvent.setup()
  const onAddToDocumentation = vi.fn()
  const roadblock = HOST_ROADBLOCKS.find(item => item.id === 'roadblock-account-permission')
  render(<HostSupportDrawer roadblock={roadblock} onClose={() => {}} onAddToDocumentation={onAddToDocumentation} />)

  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText(/Suggested agent wording/i)).toBeInTheDocument()
  await user.click(within(dialog).getByRole('button', { name: /Add roadblock to Call Documentation/i }))

  expect(onAddToDocumentation).toHaveBeenCalledTimes(1)
  expect(onAddToDocumentation.mock.calls[0][0].exactIssue).toMatch(/Zoom account, sign-in, license/i)
  expect(onAddToDocumentation.mock.calls[0][0].resolutionNextSteps).toMatch(/Suggested wording/i)
})


it('lets the agent go back after a confirmation misclick', async () => {
  const user = userEvent.setup()
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-waiting-room-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  expect(screen.getByText(/Is the arbitrator signed in with assigned credentials/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Yes' }))
  expect(screen.getByText(/Is Waiting Room enabled/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Back to previous troubleshooting step/i }))
  expect(screen.getByText(/Is the arbitrator signed in with assigned credentials/i)).toBeInTheDocument()
  expect(screen.queryByText(/Is Waiting Room enabled/i)).not.toBeInTheDocument()
})

it('returns from an immediate roadblock to the exact previous confirmation', async () => {
  const user = userEvent.setup()
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-audio-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Others cannot hear the arbitrator' }))
  await user.click(screen.getByRole('button', { name: 'USB headset/device' }))
  await user.click(screen.getByRole('button', { name: 'No' }))

  expect(screen.getByText('Tier 1 roadblock')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /Back to previous troubleshooting step/i }))

  expect(screen.getByText(/Does the computer or mobile device itself recognize/i)).toBeInTheDocument()
  expect(screen.queryByText('Tier 1 roadblock')).not.toBeInTheDocument()
})

it('keeps Back navigation when troubleshooting redirects into another Host guide', async () => {
  const user = userEvent.setup()
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-controls-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  await user.click(screen.getByRole('button', { name: 'Yes' }))
  expect(screen.getByText(/already inside the correct hearing/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'No' }))

  expect(screen.getByRole('heading', { name: /Start or join the hearing as host/i })).toBeInTheDocument()
  expect(screen.getByText(/signed in to Zoom using the assigned credentials/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Back to previous troubleshooting step/i }))
  expect(screen.getByRole('heading', { name: /Host controls are missing/i })).toBeInTheDocument()
  expect(screen.getByText(/already inside the correct hearing/i)).toBeInTheDocument()
})


it('shows the Host Common Issue suggested script with its official Zoom source', () => {
  const route = HOST_GUIDED_ROUTES.find(item => item.id === 'host-controls-guided')
  render(<HostSupportDrawer route={route} onClose={() => {}} />)

  const dialog = screen.getByRole('dialog', { name: /Host controls are missing/i })
  const scriptCard = within(dialog).getByLabelText('Suggested agent script')
  expect(within(scriptCard).getByText(/meeting host/i)).toBeInTheDocument()
  expect(within(scriptCard).getByRole('link', { name: /Verify in Zoom Support/i }))
    .toHaveAttribute('href', expect.stringContaining('KB0065164'))
  expect(within(scriptCard).getByRole('button', { name: 'Copy Script' })).toBeInTheDocument()
})
