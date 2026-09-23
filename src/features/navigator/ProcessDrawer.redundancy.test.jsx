import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
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


it('after exhausting an audio-output path, shows only conditional next symptoms and does not loop back to the same Common Issue', async () => {
  const user = userEvent.setup()
  const onOpenRoute = vi.fn()
  const process = {
    id: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    title: 'Minimal desktop audio path',
    purpose: 'Exercise symptom-aware end routing.',
    category: 'audio',
    referral: 'Refer if the approved audio path is exhausted and no documented symptom route matches.',
    visualReferences: [],
    images: [],
    text: [
      'Applies To: Windows',
      'Process / Step-by-Step Guide',
      '1. Test the selected speaker',
      'Run the approved speaker test.',
    ].join('\n'),
  }

  render(<ProcessDrawer
    process={process}
    initialDevice="Windows"
    initialRole="Host"
    initialSourceRouteId="cant-hear"
    onClose={() => {}}
    onOpenRoute={onOpenRoute}
  />)

  await user.click(screen.getByRole('button', { name: /Not resolved.*Next options/i }))

  expect(screen.getByText(/Only if the symptom now matches/i)).toBeInTheDocument()
  expect(screen.getByText(/using Bluetooth headphones/i)).toBeInTheDocument()
  expect(screen.getByText(/whole meeting is simply too loud or too quiet/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /I can’t hear anyone/i })).not.toBeInTheDocument()
  expect(screen.queryByText(/They can’t hear me/i)).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /Bluetooth connection and Zoom speaker selection/i }))
  expect(onOpenRoute).toHaveBeenCalledWith('bluetooth-headset', {
    device: 'Windows',
    role: 'Host',
  })
})

it('reports a device changed inside the Guided Process back to the shared call context', async () => {
  const user = userEvent.setup()
  const onContextChange = vi.fn()
  const process = PROCESSES.find(item => item.id === 'using-bluetooth-headphones-with-zoom-on-android-ios')

  render(<ProcessDrawer
    process={process}
    onClose={() => {}}
    onContextChange={onContextChange}
  />)

  await user.click(screen.getByRole('button', { name: 'Android' }))
  expect(onContextChange).toHaveBeenCalledWith({ device: 'Android' })

  await user.click(screen.getByRole('button', { name: 'Windows' }))
  expect(onContextChange).toHaveBeenCalledWith({ device: 'Windows' })
})

it('shows the referral boundary instead of unrelated routes when no curated next symptom applies', async () => {
  const user = userEvent.setup()
  const process = {
    id: 'transferring-meetings-and-webinars-between-devices',
    title: 'Minimal transfer path',
    purpose: 'Exercise a process with no automatic next symptom.',
    category: 'devices',
    referral: 'Refer when the approved transfer conditions are exhausted.',
    visualReferences: [],
    images: [],
    text: [
      'Applies To: Windows',
      'Process / Step-by-Step Guide',
      '1. Try the approved transfer',
      'Follow the documented transfer action.',
    ].join('\n'),
  }

  render(<ProcessDrawer process={process} initialDevice="Windows" onClose={() => {}} />)
  await user.click(screen.getByRole('button', { name: /Not resolved.*Next options/i }))

  expect(screen.getByText(/No additional approved symptom route applies automatically/i)).toBeInTheDocument()
  expect(screen.getByText(/rather than starting unrelated troubleshooting/i)).toBeInTheDocument()
  expect(screen.getByText(/When to stop \/ refer/i)).toBeInTheDocument()
})


it('previews only completed troubleshooting before explicitly handing it to Call Documentation', async () => {
  const user = userEvent.setup()
  const onAddToDocumentation = vi.fn()
  const process = {
    id: 'documentation-preview-test',
    title: 'Approved Speaker Troubleshooting',
    purpose: 'Exercise safe documentation handoff.',
    category: 'audio',
    referral: 'Refer only after the approved path is exhausted.',
    visualReferences: [],
    images: [],
    text: [
      'Applies To: Windows',
      'Process / Step-by-Step Guide',
      '1. Check the selected speaker',
      'Choose the intended Zoom speaker.',
      '2. Run Test Speaker',
      'Play the Zoom test tone.',
      '3. Check operating system audio',
      'Confirm system output only if still needed.',
    ].join('\n'),
  }

  render(<ProcessDrawer
    process={process}
    initialDevice="Windows"
    initialSourceRouteId="cant-hear"
    onClose={() => {}}
    onAddToDocumentation={onAddToDocumentation}
  />)

  await user.click(screen.getByRole('button', { name: /Not resolved.*Next step/i }))
  await user.click(screen.getByRole('button', { name: /Resolved \/ Done/i }))
  await user.click(screen.getByRole('button', { name: 'Preview documentation' }))

  const preview = screen.getByLabelText('Documentation handoff preview')
  expect(within(preview).getByText('I can’t hear anyone')).toBeInTheDocument()
  expect(within(preview).getByText(/1\. Check the selected speaker — Not resolved/i)).toBeInTheDocument()
  expect(within(preview).getByText(/2\. Run Test Speaker — Resolved/i)).toBeInTheDocument()
  expect(within(preview).queryByText(/Check operating system audio/i)).not.toBeInTheDocument()
  expect(onAddToDocumentation).not.toHaveBeenCalled()

  await user.click(within(preview).getByRole('button', { name: /Add to Call Documentation draft/i }))

  expect(onAddToDocumentation).toHaveBeenCalledTimes(1)
  expect(onAddToDocumentation.mock.calls[0][0]).toMatchObject({
    device: 'Windows',
    exactIssue: 'I can’t hear anyone',
    outcome: 'Resolved',
  })
  expect(onAddToDocumentation.mock.calls[0][0].stepsResult).not.toContain('Check operating system audio')
  expect(within(preview).getByText(/Added to draft/i)).toBeInTheDocument()
})
