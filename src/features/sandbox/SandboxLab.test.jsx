import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SandboxLab } from './SandboxLab'

it('supports realistic device-specific Zoom training exploration', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  expect(screen.getByRole('heading', { name: 'Zoom Workplace Sandbox' })).toBeInTheDocument()
  expect(screen.getAllByText(/TRAINING SIMULATION/i).length).toBeGreaterThan(0)
  expect(screen.getByRole('button', { name: /Windows 11/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getAllByRole('button', { name: /Settings/i })[0])
  const settingsDialog = screen.getByRole('dialog', { name: 'Zoom Settings' })
  await user.click(within(settingsDialog).getByRole('button', { name: /Audio/i }))
  expect(within(settingsDialog).getByRole('heading', { name: 'Audio' })).toBeInTheDocument()

  await user.click(within(settingsDialog).getByRole('button', { name: 'Test Speaker' }))
  expect(within(settingsDialog).getByText(/Test tone playing/i)).toBeInTheDocument()
  await user.click(within(settingsDialog).getByRole('button', { name: 'Test Mic' }))
  expect(within(settingsDialog).getByText(/Input level moving/i)).toBeInTheDocument()
  await user.click(within(settingsDialog).getByRole('button', { name: 'Advanced' }))
  expect(within(settingsDialog).getByText(/Original sound for musicians/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close Settings' }))

  await user.click(screen.getByText('Join', { selector: 'strong' }).closest('button'))
  const joinDialog = screen.getByRole('dialog', { name: 'Join Meeting' })
  expect(within(joinDialog).getByDisplayValue('123 456 7890')).toBeInTheDocument()
  await user.click(within(joinDialog).getByRole('button', { name: 'Cancel' }))

  await user.click(screen.getByRole('button', { name: /^Schedule/i }))
  const scheduleDialog = screen.getByRole('dialog', { name: 'Schedule Meeting' })
  expect(within(scheduleDialog).getByDisplayValue('Support Training Practice')).toBeInTheDocument()
  await user.click(within(scheduleDialog).getByRole('button', { name: 'Cancel' }))

  await user.click(screen.getByRole('button', { name: /More/i }))
  expect(screen.getByRole('dialog', { name: 'More Zoom Workplace Apps' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close More Zoom Workplace Apps' }))

  await user.click(screen.getByRole('button', { name: 'ST' }))
  expect(screen.getByRole('dialog', { name: 'My Profile' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close My Profile' }))

  await user.click(screen.getByRole('button', { name: /Android/i }))
  expect(screen.getByRole('button', { name: /Android/i })).toHaveAttribute('aria-pressed', 'true')

  await user.click(screen.getByRole('button', { name: /New Meeting/i }))
  expect(screen.getByRole('dialog', { name: 'Join Audio' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Wi-Fi or Cellular Data' }))
  expect(screen.getByRole('button', { name: /Unmute/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Chat/i }))
  expect(screen.getByText('Meeting Chat')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /More/i }))
  await user.click(screen.getByRole('button', { name: /Captions/i }))
  expect(screen.getByText(/Live transcript simulation/i)).toBeInTheDocument()
})

it('lets desktop meeting controls open panels and simulate sharing', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  await user.click(screen.getByRole('button', { name: /New Meeting/i }))
  await user.click(screen.getByRole('button', { name: 'Join with Computer Audio' }))

  await user.click(screen.getByRole('button', { name: /Participants/i }))
  expect(screen.getByText('Participants (3)')).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Invite' }))
  expect(screen.getByText('Invite people')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close' }))

  await user.click(screen.getByText('Share', { selector: 'small' }).closest('button'))
  const shareDialog = screen.getByRole('dialog', { name: 'Share Screen' })
  await user.click(within(shareDialog).getByRole('button', { name: 'Window' }))
  await user.click(within(shareDialog).getByRole('button', { name: 'Share' }))
  expect(screen.getByText(/You are sharing: Window/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Stop Share' }))
  expect(screen.queryByText(/You are sharing:/i)).not.toBeInTheDocument()
})
