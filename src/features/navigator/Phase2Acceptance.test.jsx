import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { COMMON_ISSUE_ROUTES, COMMON_ISSUE_VERIFIED_AT, searchCommonIssueRoutes } from './commonIssueRoutes'
import { PROCESSES } from '../../data/processes'

afterEach(() => cleanup())

const FROZEN_ROUTE_IDS = [
  'cant-join',
  'cant-hear',
  'cant-be-heard',
  'camera-not-working',
  'waiting-entry',
  'cant-share',
  'chat',
  'meeting-controls',
  'reactions',
  'invite',
  'secure-connection',
  'bluetooth-headset',
  'transfer-device',
  'join-muted',
  'join-video-preference',
  'meeting-volume',
  'auto-computer-audio',
  'multiple-audio-input-channels',
  'participants-before-join',
]

const FROZEN_PROCESS_IDS = [
  'troubleshooting-when-you-cant-join-a-zoom-meeting',
  'adjusting-the-volume-of-a-zoom-meeting',
  'automatically-joining-meetings-with-computer-audio',
  'chatting-in-a-zoom-meeting',
  'enabling-and-managing-multiple-audio-input-channels-in-zoom',
  'joining-a-zoom-meeting',
  'locate-describe-guide-confirm',
  'muting-your-microphone-when-joining-a-zoom-meeting',
  'setting-your-video-to-stay-on-or-off-when-joining-meetings-and-webinars',
  'sharing-your-screen-desktop-or-content-in-zoom',
  'showing-and-hiding-your-video-in-a-zoom-meeting',
  'testing-your-audio-settings-for-zoom-meetings',
  'testing-your-video-in-zoom',
  'transferring-meetings-and-webinars-between-devices',
  'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
  'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
  'uninstalling-and-reinstalling-the-zoom-application',
  'using-bluetooth-headphones-with-zoom-on-android-ios',
  'using-non-verbal-feedback-and-meeting-reactions',
  'using-participant-controls-in-a-zoom-meeting',
  'viewing-participants-already-in-a-meeting-before-joining',
  'waiting-for-the-host-to-start-a-meeting-or-webinar',
  'zoom-audio-troubleshooting',
  'zoom-basic-support-boundaries-decision-path-referral-process',
  'zoom-camera-troubleshooting-during-a-meeting',
  'zoom-error-unable-to-establish-secure-connection-to-zoom',
  'zoom-meeting-controls-icons',
]

async function openFromSearch({ query, device, role }) {
  const user = userEvent.setup()
  render(<Navigator />)

  if (device) await user.click(screen.getByRole('button', { name: device }))
  if (role) await user.click(screen.getByRole('button', { name: role }))

  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, query)

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const first = within(listbox).getAllByRole('option')[0]
  await user.click(first)

  return { user, dialog: screen.getByRole('dialog') }
}

it('freezes the approved Phase 2 route inventory', () => {
  expect(COMMON_ISSUE_ROUTES.map(route => route.id)).toEqual(FROZEN_ROUTE_IDS)
  expect(COMMON_ISSUE_ROUTES).toHaveLength(19)
})

it('freezes the approved Process Guide inventory', () => {
  expect(PROCESSES.map(process => process.id)).toEqual(FROZEN_PROCESS_IDS)
  expect(PROCESSES).toHaveLength(27)
})

it('freezes the Phase 2 verification date until a new source audit is performed', () => {
  expect(COMMON_ISSUE_VERIFIED_AT).toBe('September 18, 2026')
})

it('keeps every route discoverable from at least one caller-language phrase', () => {
  for (const route of COMMON_ISSUE_ROUTES) {
    expect(route.searchPhrases?.length, route.id + ' needs caller-language search phrases').toBeGreaterThan(0)
    expect(searchCommonIssueRoutes(route.searchPhrases[0])[0]?.id, route.id + ' must rank first for its primary caller phrase').toBe(route.id)
  }
})

it('accepts a Windows participant call for no sound from search through first action and expected result', async () => {
  const { dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'I can’t hear anyone' })).toBeInTheDocument()
  expect(within(dialog).getByText(/Ask only what changes the route/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Do they see Join Audio/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Confirm they joined meeting audio/i })).toBeInTheDocument()
  expect(within(dialog).getByText(/normal microphone\/audio control instead of an unjoined-audio state/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Expected result' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Next action / boundary' })).toBeInTheDocument()
})

it('accepts an Android participant microphone call without leaking desktop microphone-selection steps', async () => {
  const { dialog } = await openFromSearch({ query: 'they dont hear me', device: 'Android', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'They can’t hear me' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Check Zoom mute and any physical mute switch/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Confirm the participant joined meeting audio/i })).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Select and test the correct microphone/i })).not.toBeInTheDocument()
  expect(within(dialog).getByText(/internet-audio option shown on the device/i)).toBeInTheDocument()
})

it('accepts a Mac camera call and keeps reinstall out of the first-line guidance', async () => {
  const { dialog } = await openFromSearch({ query: 'camera black', device: 'Mac', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'My camera isn’t working' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /If video is simply off, start it/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Select the correct camera/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Confirm Zoom can access the camera/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/reinstall Zoom/i)).not.toBeInTheDocument()
})

it('accepts a Waiting Room host call and gives the owner-specific Admit action', async () => {
  const { dialog } = await openFromSearch({ query: 'waiting room', device: 'Windows', role: 'Host' })

  expect(within(dialog).getByRole('heading', { name: 'I’m waiting to get in' })).toBeInTheDocument()
  const waitingRoom = within(dialog).getByRole('heading', { name: 'Waiting Room' }).closest('article')
  expect(waitingRoom).toHaveTextContent(/Open Participants/i)
  expect(waitingRoom).toHaveTextContent(/Admit/i)
  expect(waitingRoom).not.toHaveTextContent(/Remain in the Waiting Room until the host admits you/i)
})

it('accepts a participant screen-sharing call and exposes the host-permission boundary', async () => {
  const { dialog } = await openFromSearch({ query: 'cant screen share', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'Can’t share my screen' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Confirm the host allows participant sharing/i })).toBeInTheDocument()
  expect(within(dialog).getByText(/Do not bypass the host restriction/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Start only the intended share/i })).toBeInTheDocument()
})

it('accepts the macOS secure-connection call only on the supported platform', async () => {
  const { dialog } = await openFromSearch({ query: 'secure conection', device: 'Mac', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: /Unable to establish secure connection/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/does not match the selected device/i)).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Update Zoom first when the app can still open/i })).toBeInTheDocument()
  expect(within(dialog).getByText(/approved internal process/i)).toBeInTheDocument()
})

it('accepts a mobile join-muted call while preserving the mute-vs-no-audio distinction', async () => {
  const { dialog } = await openFromSearch({ query: 'mute on join', device: 'iPhone', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: /join with my microphone muted/i })).toBeInTheDocument()
  expect(within(dialog).getByText(/Joining muted still connects the caller to meeting audio/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /For mobile, use the platform mute-on-join setting/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /For one meeting with no Zoom audio/i })).toBeInTheDocument()
})

it('accepts a pre-join participant-view request and stops unsupported Browser guidance', async () => {
  const { dialog } = await openFromSearch({ query: 'who joined already', device: 'Browser', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'Who is already in the meeting?' })).toBeInTheDocument()
  expect(within(dialog).getByText(/does not match the selected device/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/desktop-app feature/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: /Use Calendar and Invitees/i })).not.toBeInTheDocument()
})

it('carries the final call outcome back into the shared Live Call Flow context', async () => {
  const { user, dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  await user.click(within(dialog).getByRole('button', { name: 'Resolved' }))
  await user.click(within(dialog).getByRole('button', { name: 'Close common issue route' }))

  expect(screen.getByRole('button', { name: 'Resolved' })).toHaveAttribute('aria-pressed', 'true')
})

it('keeps Full Process available from the fast route without forcing the agent to read it first', async () => {
  const { user, dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('tab', { name: 'Quick Guide' })).toHaveAttribute('aria-selected', 'true')
  await user.click(within(dialog).getByRole('tab', { name: 'Full Process' }))

  expect(within(dialog).getByRole('heading', { name: 'Full Process' })).toBeInTheDocument()
  expect(within(dialog).getAllByRole('button', { name: /Open approved process/i }).length).toBeGreaterThan(0)
})
