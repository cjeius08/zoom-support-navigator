import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { ProcessDrawer } from './ProcessDrawer'

it('shows one approved step at a time and stops when the issue is resolved', async () => {
  const user = userEvent.setup()
  const process = {
    id: 'test-process',
    title: 'Audio troubleshooting test process',
    purpose: 'Verify progressive live-call guidance.',
    category: 'support',
    referral: 'Refer if the approved steps are exhausted.',
    visualReferences: [],
    images: [],
    text: [
      'Process / Step-by-Step Guide',
      '1. Check audio device',
      'Open the approved audio setting.',
      'Confirm the selected audio device.',
      'Sample Script',
      'Please check the selected audio device.',
      '2. Confirm playback',
      'Run the approved playback test.',
      'Confirm the customer can hear audio.',
      'Sample Script',
      'Please confirm you can hear me.',
      'Quick Guide / Remember the Process',
      'CHECK → TEST → CONFIRM',
    ].join('\n'),
  }

  render(<ProcessDrawer process={process} onClose={() => {}} />)

  expect(screen.getByText('Check audio device')).toBeInTheDocument()
  expect(screen.queryByText('Confirm playback')).not.toBeInTheDocument()
  expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Not resolved.*Next step/i }))
  expect(screen.getByText('Confirm playback')).toBeInTheDocument()
  expect(screen.queryByText('Check audio device')).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Resolved \/ Done/i }))
  expect(screen.getByText(/Stop here/i)).toBeInTheDocument()
})

it('shows only the selected device path for Bluetooth and keeps other-device steps out of the live path', async () => {
  const user = userEvent.setup()
  const process = PROCESSES.find(item => item.id === 'using-bluetooth-headphones-with-zoom-on-android-ios')

  render(<ProcessDrawer process={process} onClose={() => {}} />)
  const dialog = screen.getByRole('dialog')

  expect(within(dialog).getByRole('button', { name: 'Android' })).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: 'Windows' })).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Android' }))

  expect(within(dialog).getByText('Connect the Headphones and Join the Meeting')).toBeInTheDocument()
  expect(within(dialog).queryByText('Join with Computer Audio')).not.toBeInTheDocument()

  const pathSelect = within(dialog).getByLabelText(/What are you trying to do/i)
  const optionText = [...pathSelect.options].map(option => option.textContent)
  expect(optionText.some(text => /Zoom-Certified Native Bluetooth Headset/i.test(text))).toBe(false)
})

it('after the last unresolved step, offers documented next routes instead of guessing another fix', async () => {
  const user = userEvent.setup()
  const process = {
    id: 'testing-your-audio-settings-for-zoom-meetings',
    title: 'Minimal routed process',
    purpose: 'Exercise unresolved routing.',
    category: 'audio',
    referral: 'Refer after approved troubleshooting is exhausted.',
    visualReferences: [],
    images: [],
    text: [
      'Applies To: Android',
      'Process / Step-by-Step Guide',
      'A. Android - Test audio',
      '1. Test audio',
      'Run the approved test.',
    ].join('\n'),
  }

  render(<ProcessDrawer process={process} onClose={() => {}} onOpenRoute={() => {}} />)
  await user.click(screen.getByRole('button', { name: /Not resolved.*Next options/i }))

  expect(screen.getByText(/Choose the closest next approved path/i)).toBeInTheDocument()
  expect(screen.getByText(/Ozzie will not guess a fix/i)).toBeInTheDocument()
  expect(screen.getAllByRole('button').some(button => /can.?t hear|hear me/i.test(button.textContent || ''))).toBe(true)
})


it('shows an explicit coverage gap instead of desktop steps when a selected mobile path is not approved', () => {
  const process = PROCESSES.find(item => item.id === 'muting-your-microphone-when-joining-a-zoom-meeting')

  render(<ProcessDrawer process={process} initialDevice="iPhone" onClose={() => {}} />)
  const dialog = screen.getByRole('dialog')

  expect(within(dialog).getByText(/No device-specific steps are approved here for iOS/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Another platform’s instructions will not be substituted/i)).toBeInTheDocument()
  expect(within(dialog).queryByText(/Open Meetings & Webinars/i)).not.toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Copy Current Path/i })).toBeDisabled()
})

it('shows the real Android screen-sharing sequence from A1-style approved source sections', () => {
  const process = PROCESSES.find(item => item.id === 'sharing-your-screen-desktop-or-content-in-zoom')

  render(<ProcessDrawer process={process} initialDevice="Android" onClose={() => {}} />)
  const dialog = screen.getByRole('dialog')

  expect(within(dialog).getByText('Open Share')).toBeInTheDocument()
  expect(within(dialog).getByText(/Step 1 of 5/i)).toBeInTheDocument()
  expect(within(dialog).queryByText('Open Screen Share')).not.toBeInTheDocument()
})


it('puts the device-matched official Zoom article first in Process Guide traceability', () => {
  const process = PROCESSES.find(item => item.id === 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device')

  render(<ProcessDrawer process={process} initialDevice="Android" onClose={() => {}} />)
  const dialog = screen.getByRole('dialog')
  const trace = within(dialog).getByText(/Source traceability/i).closest('.guide-source-trace')
  const links = within(trace).getAllByRole('link')

  expect(links[0]).toHaveTextContent(/Matched to Android/i)
  expect(links[0]).toHaveAttribute('href', expect.stringContaining('KB0066222'))
})
