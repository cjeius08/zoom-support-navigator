import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { searchCommonIssueRoutes } from './commonIssueRoutes'

afterEach(() => cleanup())

async function openRouteWithContext({ device, role, routeName }) {
  const user = userEvent.setup()
  render(<Navigator />)
  if (device) await user.click(screen.getByRole('button', { name: device }))
  if (role) await user.click(screen.getByRole('button', { name: role }))
  await user.click(screen.getByRole('button', { name: routeName }))
  return { user, dialog: screen.getByRole('dialog') }
}

it('blocks the macOS secure-connection steps when Windows is selected', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Windows',
    routeName: /Unable to establish secure connection/i,
  })

  expect(within(dialog).getByText(/does not match the selected device/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/macOS-specific/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Update Zoom first/i })).not.toBeInTheDocument()
})

it('shows the secure-connection recovery path when Mac is selected', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Mac',
    routeName: /Unable to establish secure connection/i,
  })

  expect(within(dialog).queryByText(/does not match the selected device/i)).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Update Zoom first/i })).toBeInTheDocument()
})

it.each([
  ['iPhone', /connect to computer audio automatically/i, /desktop-app route/i],
  ['Android', /specific audio input channels/i, /Windows and macOS desktop apps/i],
  ['Browser', /Who is already in the meeting/i, /desktop-app feature/i],
])('stops platform-specific routes from leaking onto %s', async (device, routeName, boundaryText) => {
  const { dialog } = await openRouteWithContext({ device, routeName })
  expect(within(dialog).getByText(/does not match the selected device/i)).toBeInTheDocument()
  expect(within(dialog).getByText(boundaryText)).toBeInTheDocument()
  expect(within(dialog).queryByText('Guide one step at a time')).not.toBeInTheDocument()
})

it('shows only the mobile mute-on-join default to an iPhone caller', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'iPhone',
    routeName: /join with my microphone muted/i,
  })

  expect(within(dialog).getByRole('heading', { name: /For mobile, use the platform mute-on-join setting/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /For every desktop meeting/i })).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /For one meeting with no Zoom audio/i })).toBeInTheDocument()
})

it('shows only the desktop mute-on-join default to a Windows caller', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Windows',
    routeName: /join with my microphone muted/i,
  })

  expect(within(dialog).getByRole('heading', { name: /For every desktop meeting/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /For mobile/i })).not.toBeInTheDocument()
})

it('shows the mobile camera preference and hides the desktop default on Android', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Android',
    routeName: /camera on\/off when I join/i,
  })

  expect(within(dialog).getByRole('heading', { name: /Set the mobile default/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Set the desktop default/i })).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Change only the next meeting/i })).toBeInTheDocument()
})

it('keeps Windows-only Volume Mixer away from Mac callers', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Mac',
    routeName: /meeting is too loud/i,
  })

  expect(within(dialog).getByRole('heading', { name: /Adjust Zoom speaker volume on desktop/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Test Speaker/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Windows only/i })).not.toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /mobile device controls/i })).not.toBeInTheDocument()
})

it('shows mobile device volume instead of desktop Audio Settings on iPhone', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'iPhone',
    routeName: /meeting is too loud/i,
  })

  expect(within(dialog).getByRole('heading', { name: /mobile device controls/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Zoom speaker volume on desktop/i })).not.toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Test Speaker/i })).not.toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Windows only/i })).not.toBeInTheDocument()
})

it('shows desktop Bluetooth selection on Mac and hides the mobile Bluetooth path', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Mac',
    routeName: /Bluetooth headset isn’t working/i,
  })

  expect(within(dialog).getByRole('heading', { name: /Select the headset as both speaker and microphone/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /mobile Bluetooth audio path/i })).not.toBeInTheDocument()
})

it('shows the mobile Bluetooth path on Android and hides desktop device selection', async () => {
  const { dialog } = await openRouteWithContext({
    device: 'Android',
    routeName: /Bluetooth headset isn’t working/i,
  })

  expect(within(dialog).getByRole('heading', { name: /mobile Bluetooth audio path/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Select the headset as both speaker and microphone/i })).not.toBeInTheDocument()
})

it('hides participant-only screen-share permission guidance from a Host caller', async () => {
  const { dialog } = await openRouteWithContext({
    role: 'Host',
    routeName: /Can’t share my screen/i,
  })

  expect(within(dialog).queryByRole('heading', { name: /host allows participant sharing/i })).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Locate Share/i })).toBeInTheDocument()
})

it('shows participant screen-share permission guidance to a Participant caller', async () => {
  const { dialog } = await openRouteWithContext({
    role: 'Participant',
    routeName: /Can’t share my screen/i,
  })

  expect(within(dialog).getByRole('heading', { name: /host allows participant sharing/i })).toBeInTheDocument()
})

it('asks for caller role before exposing participant-only screen-share guidance', async () => {
  const { dialog } = await openRouteWithContext({
    routeName: /Can’t share my screen/i,
  })

  expect(within(dialog).getByText(/Select Host or Participant in Live Call Flow/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /host allows participant sharing/i })).not.toBeInTheDocument()
})

it('changes Waiting Room next action based on Host vs Participant role', async () => {
  const host = await openRouteWithContext({ role: 'Host', routeName: /I’m waiting to get in/i })
  const hostWaitingRoom = within(host.dialog).getByRole('heading', { name: 'Waiting Room' }).closest('article')
  expect(hostWaitingRoom).toHaveTextContent(/Open Participants/i)
  expect(hostWaitingRoom).toHaveTextContent(/Admit/i)

  cleanup()

  const participant = await openRouteWithContext({ role: 'Participant', routeName: /I’m waiting to get in/i })
  const participantWaitingRoom = within(participant.dialog).getByRole('heading', { name: 'Waiting Room' }).closest('article')
  expect(participantWaitingRoom).toHaveTextContent(/Remain in the Waiting Room/i)
  expect(participantWaitingRoom).not.toHaveTextContent(/Admit all/i)
})

it('gives a Host a start-meeting action instead of telling them to wait for themselves', async () => {
  const { dialog } = await openRouteWithContext({ role: 'Host', routeName: /I’m waiting to get in/i })
  const waitingForHost = within(dialog).getByRole('heading', { name: 'Waiting for host' }).closest('article')
  expect(waitingForHost).toHaveTextContent(/start the scheduled meeting/i)
  expect(waitingForHost).toHaveTextContent(/correct Zoom account/i)
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
