import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { SandboxLab } from './SandboxLab'

it('matches the recorded Windows Zoom reference and keeps support paths interactive', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  expect(screen.getByRole('heading', { name: 'Zoom Workplace Sandbox' })).toBeInTheDocument()
  expect(screen.getByText('TRAINING SIMULATION · NO LIVE AUDIO/VIDEO')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Windows 11/i })).toHaveAttribute('aria-pressed', 'true')

  expect(screen.getByRole('button', { name: /ZoomMate/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /New meeting/i })).toBeInTheDocument()
  expect(screen.getByText('Join', { selector: 'strong' }).closest('button')).toBeInTheDocument()
  expect(screen.getByText('Schedule', { selector: 'strong' }).closest('button')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Share screen/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /My Notes/i })).toBeInTheDocument()

  await user.click(screen.getAllByRole('button', { name: /Settings/i })[0])
  const settings = screen.getByRole('dialog', { name: 'Zoom Settings' })
  expect(within(settings).getByRole('heading', { name: 'Appearance' })).toBeInTheDocument()
  expect(within(settings).getByRole('button', { name: /Notifications & sounds/i })).toBeInTheDocument()
  expect(within(settings).getByRole('button', { name: /Recording/i })).toBeInTheDocument()
  expect(within(settings).getByRole('button', { name: /Keyboard shortcuts/i })).toBeInTheDocument()
  expect(within(settings).getByRole('button', { name: /Statistics/i })).toBeInTheDocument()
  expect(within(settings).getByRole('button', { name: /My account/i })).toBeInTheDocument()

  await user.click(within(settings).getByRole('button', { name: /Audio/i }))
  expect(within(settings).getByRole('heading', { name: 'Speaker' })).toBeInTheDocument()
  await user.click(within(settings).getByRole('button', { name: /Test speaker/i }))
  expect(within(settings).getByText(/Test tone playing/i)).toBeInTheDocument()
  await user.click(within(settings).getByRole('button', { name: /Test microphone/i }))
  expect(within(settings).getByText(/Simulated microphone input/i)).toBeInTheDocument()
  await user.click(within(settings).getByRole('button', { name: 'Advanced' }))
  expect(within(settings).getByRole('heading', { name: 'Advanced' })).toBeInTheDocument()
  expect(within(settings).getByText(/Windows system audio enhancements/i)).toBeInTheDocument()

  await user.click(within(settings).getByRole('button', { name: /Video & effects/i }))
  expect(within(settings).getByRole('button', { name: 'Backgrounds' })).toBeInTheDocument()
  await user.click(within(settings).getByRole('button', { name: 'Backgrounds' }))
  expect(within(settings).getByRole('heading', { name: 'Backgrounds' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close Settings' }))

  await user.click(screen.getByRole('button', { name: /New meeting/i }))
  const preview = screen.getByRole('dialog', { name: 'Video Preview' })
  expect(within(preview).getByText(/STAGING_ADMIN's Zoom Meeting/i)).toBeInTheDocument()
  await user.click(within(preview).getByRole('button', { name: 'Start' }))

  const audioDialog = screen.getByRole('dialog', { name: 'Join Audio' })
  await user.click(within(audioDialog).getByRole('button', { name: 'Join with Computer Audio' }))

  expect(screen.getByRole('button', { name: /Participants/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Host tools/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /More/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /End/i })).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Host tools/i }))
  expect(screen.getByText('Host tools')).toBeInTheDocument()
  expect(screen.getByText('Lock meeting')).toBeInTheDocument()
})

it('opens the recorded-style More menu and simulates sharing', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  await user.click(screen.getByRole('button', { name: /New meeting/i }))
  await user.click(screen.getByRole('button', { name: 'Start' }))
  await user.click(screen.getByRole('button', { name: 'Join with Computer Audio' }))

  await user.click(screen.getByRole('button', { name: /More/i }))
  expect(screen.getByRole('button', { name: /Breakout rooms/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Whiteboards/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Meeting info/i })).toBeInTheDocument()

  await user.click(screen.getByText('Share', { selector: 'small' }).closest('button'))
  const shareDialog = screen.getByRole('dialog', { name: 'Share Screen' })
  await user.click(within(shareDialog).getByRole('button', { name: 'Window' }))
  await user.click(within(shareDialog).getByRole('button', { name: 'Share' }))
  expect(screen.getByText(/You are sharing: Window/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Stop Share' }))
})

it('keeps macOS and Android device families navigable', async () => {
  const user = userEvent.setup()
  render(<SandboxLab />)

  await user.click(screen.getByRole('button', { name: /macOS/i }))
  await user.click(screen.getAllByRole('button', { name: /Settings/i })[0])
  const macSettings = screen.getByRole('dialog', { name: 'Zoom Settings' })
  await user.click(within(macSettings).getByRole('button', { name: /Audio/i }))
  expect(within(macSettings).getByRole('option', { name: 'MacBook Speakers' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Close Settings' }))

  await user.click(screen.getByRole('button', { name: /Android/i }))
  await user.click(screen.getByRole('button', { name: /New meeting/i }))
  expect(screen.getByRole('dialog', { name: 'Join Audio' })).toBeInTheDocument()
})
