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
  expect(screen.getByRole('heading', { name: /not recognized by the device itself/i })).toBeInTheDocument()
  expect(screen.getByText(/device manufacturer or appropriate hardware support/i)).toBeInTheDocument()
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
