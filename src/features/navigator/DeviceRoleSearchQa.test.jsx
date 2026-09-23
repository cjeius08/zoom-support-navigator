import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { searchCommonIssueRoutes } from './commonIssueRoutes'

afterEach(() => cleanup())

async function openRouteWithContext({ device, role, routeName, state }) {
  const user = userEvent.setup()
  render(<Navigator />)
  await user.click(screen.getByRole('tab', { name: 'Common Issues' }))
  await user.click(screen.getByRole('button', { name: routeName }))
  const dialog = screen.getByRole('dialog')
  if (device) await user.click(within(dialog).getByRole('button', { name: device }))
  if (role) await user.click(within(dialog).getByRole('button', { name: role }))
  if (state) await user.click(within(dialog).getByRole('button', { name: new RegExp(state, 'i') }))
  return { user, dialog }
}

it('blocks a macOS-only secure-connection route when Windows is selected', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Windows',
    routeName: /Unable to establish secure connection/i,
  })

  expect(within(dialog).getByText(/does not support the selected device/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/macOS-specific/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it('recommends the approved secure-connection process when Mac is selected', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Mac',
    routeName: /Unable to establish secure connection/i,
  })

  expect(within(dialog).queryByText(/does not support the selected device/i)).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Unable to Establish Secure Connection to Zoom/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Start Guided Process/i })).toBeInTheDocument()
})

it.each([
  ['iPhone', /connect to computer audio automatically/i, /desktop-app route/i],
  ['Android', /specific audio input channels/i, /Windows and macOS desktop apps/i],
  ['Browser', /Who is already in the meeting/i, /desktop-app feature/i],
])('stops platform-specific routes from recommending an unsupported process on %s', async (device, routeName, boundaryText) => {
  const { dialog } = await openRouteWithContext({ device, routeName })
  expect(within(dialog).getByText(/does not support the selected device/i)).toBeInTheDocument()
  expect(within(dialog).getByText(boundaryText)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it('shows why a device-specific recommendation was selected without treating caller role as a routing factor', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Android',
    role: 'Host',
    routeName: /I can’t hear anyone/i,
  })

  await user.click(within(dialog).getByText('Why this route?'))

  expect(within(dialog).getByText(/Device-specific match: Android/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Host is retained as call context; caller role did not change this recommendation/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Zoom Support — Troubleshooting speaker or microphone issues on your mobile device/i)).toBeInTheDocument()
})

it('shows the exact waiting-screen state as the reason for a state-based recommendation', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /I’m waiting to get in/i,
    state: '^Waiting Room',
  })

  await user.click(within(dialog).getByText('Why this route?'))
  expect(within(dialog).getByText(/Exact screen state matched: Waiting Room/i)).toBeInTheDocument()
})

it('routes no-sound to the mobile process on iPhone and to the desktop process on Windows', async () => {
  const mobile = await openRouteWithContext({ device: 'iPhone', routeName: /I can’t hear anyone/i })
  expect(within(mobile.dialog).getByRole('heading', { name: /Mobile Device/i })).toBeInTheDocument()

  cleanup()

  const desktop = await openRouteWithContext({ device: 'Windows', routeName: /I can’t hear anyone/i })
  expect(within(desktop.dialog).getByRole('heading', { name: /Zoom Desktop App/i })).toBeInTheDocument()
})

it('carries Android from the Common Issue directly into the guided Bluetooth process', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Android',
    role: 'Participant',
    routeName: /Bluetooth headset isn’t working/i,
  })

  await user.click(within(dialog).getByRole('button', { name: /Start Guided Process/i }))
  const processDialog = screen.getByRole('dialog', { name: /Using Bluetooth Headphones/i })

  expect(within(processDialog).getByRole('button', { name: 'Android' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(processDialog).getByText(/Connect the Headphones and Join the Meeting/i)).toBeInTheDocument()
  expect(within(processDialog).queryByText(/Join with Computer Audio/i)).not.toBeInTheDocument()
})

it('keeps a device changed inside the Guided Process and the original caller role when chaining to the next Common Issue', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Android',
    role: 'Host',
    routeName: /Bluetooth headset isn’t working/i,
  })

  await user.click(within(dialog).getByRole('button', { name: /Start Guided Process/i }))
  const processDialog = screen.getByRole('dialog', { name: /Using Bluetooth Headphones/i })

  await user.click(within(processDialog).getByRole('button', { name: 'Windows' }))
  expect(within(processDialog).getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true')

  for (let index = 0; index < 12; index += 1) {
    if (within(processDialog).queryByText(/Only if the symptom now matches/i)) break
    const next = within(processDialog).queryByRole('button', { name: /Not resolved/i })
    if (!next) break
    await user.click(next)
  }

  expect(within(processDialog).getByText(/Only if the symptom now matches/i)).toBeInTheDocument()
  await user.click(within(processDialog).getByRole('button', { name: /Bluetooth is connected, but the caller still cannot hear meeting audio/i }))

  const nextDialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })
  expect(within(nextDialog).getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(nextDialog).getByRole('button', { name: 'Host' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(nextDialog).getByLabelText('Route context')).toHaveTextContent(/Windows selected/i)
})

it('keeps caller role as context without turning Common Issues into a second troubleshooting tree', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /Can’t share my screen/i,
  })

  const context = within(dialog).getByLabelText('Route context')
  expect(context).toHaveTextContent('Participant')
  expect(within(dialog).getByRole('heading', { name: /Sharing Your Screen, Desktop, or Content in Zoom/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/Guide one step at a time/i)).not.toBeInTheDocument()
})

it('uses the exact waiting state to choose the next approved process', async () => {
  const waiting = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /I’m waiting to get in/i,
    state: '^Waiting for host',
  })
  expect(within(waiting.dialog).getByRole('heading', { name: /Waiting for the Host to Start/i })).toBeInTheDocument()

  cleanup()

  const room = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /I’m waiting to get in/i,
    state: '^Waiting Room',
  })
  expect(within(room.dialog).getByRole('heading', { name: /Joining a Zoom Meeting/i })).toBeInTheDocument()
})


it('makes a device change immediately visible when it changes the recommended process', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /I can’t hear anyone/i,
  })

  const context = within(dialog).getByLabelText('Route context')
  expect(context).toHaveTextContent(/Windows selected · recommended guide updated/i)
  expect(within(dialog).getByText(/This device changes the recommended approved Process Guide/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Zoom Desktop App/i })).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Android' }))

  expect(context).toHaveTextContent(/Android selected · recommended guide updated/i)
  expect(within(dialog).getByRole('heading', { name: /Mobile Device/i })).toBeInTheDocument()
})

it('shows a clear selected-device confirmation even when the approved process title stays the same', async () => {
  const { user, dialog } = await openRouteWithContext({
    device: 'Mac',
    role: 'Participant',
    routeName: /Bluetooth headset isn’t working/i,
  })

  expect(within(dialog).getByText(/same approved Process Guide across supported devices/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Mac' })).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Android' }))

  expect(within(dialog).getByRole('heading', { name: 'Android' })).toBeInTheDocument()
  expect(within(dialog).getByLabelText('Route context')).toHaveTextContent(/Android path selected/i)
})


it('routes mobile camera trouble to the approved mobile-capable video test process', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Android',
    role: 'Participant',
    routeName: /My camera isn’t working/i,
  })

  expect(within(dialog).getByRole('heading', { name: /Testing Your Video in Zoom/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Start Guided Process/i })).toBeInTheDocument()
})

it('routes mobile and Web meeting controls to the approved participant-controls process', async () => {
  const mobile = await openRouteWithContext({
    device: 'iPhone',
    role: 'Participant',
    routeName: /Can’t find a meeting control/i,
  })
  expect(within(mobile.dialog).getByRole('heading', { name: /Using Participant Controls in a Zoom Meeting/i })).toBeInTheDocument()

  cleanup()

  const web = await openRouteWithContext({
    device: 'Browser',
    role: 'Participant',
    routeName: /Can’t find a meeting control/i,
  })
  expect(within(web.dialog).getByRole('heading', { name: /Using Participant Controls in a Zoom Meeting/i })).toBeInTheDocument()
})

it('flags desktop invite controls as an approved-guide coverage gap instead of routing to the mobile/Web process', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Windows',
    role: 'Participant',
    routeName: /Invite someone \/ copy invite link/i,
  })

  expect(within(dialog).getByText(/Approved guide coverage gap/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/not desktop invitation controls/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it.each([
  ['iPhone', /join with my microphone muted/i, /desktop instructions only/i],
  ['Android', /meeting is too loud \/ too quiet/i, /detailed Guided Process steps are desktop-only/i],
])('shows an approved-guide coverage gap for %s when the internal document lacks that device path', async (device, routeName, noteText) => {
  const { dialog } = await openRouteWithContext({ device, routeName })
  expect(within(dialog).getByText(/Approved guide coverage gap/i)).toBeInTheDocument()
  expect(within(dialog).getByText(noteText)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it.each([
  ['cant jion', 'cant-join'],
  ['no sound', 'cant-hear'],
  ['i cant hear you', 'cant-hear'],
  ['they dont hear me', 'cant-be-heard'],
  ['mic not working', 'cant-be-heard'],
  ['camera black', 'camera-not-working'],
  ['camra not working', 'camera-not-working'],
  ['waiting room', 'waiting-entry'],
  ['host hasnt started', 'waiting-entry'],
  ['cant screen share', 'cant-share'],
  ['share button missing', 'cant-share'],
  ['where is chat', 'chat'],
  ['cant message', 'chat'],
  ['where are controls', 'meeting-controls'],
  ['raise my hand', 'reactions'],
  ['invite person', 'invite'],
  ['secure conection', 'secure-connection'],
  ['airpods not working', 'bluetooth-headset'],
  ['move meeting to phone', 'transfer-device'],
  ['mute on join', 'join-muted'],
  ['video off on join', 'join-video-preference'],
  ['zoom too quiet', 'meeting-volume'],
  ['skip audio prompt', 'auto-computer-audio'],
  ['choose microphone channel', 'multiple-audio-input-channels'],
  ['who joined already', 'participants-before-join'],
])('routes caller shorthand/typo %s to %s first', (query, routeId) => {
  expect(searchCommonIssueRoutes(query)[0]?.id).toBe(routeId)
})
