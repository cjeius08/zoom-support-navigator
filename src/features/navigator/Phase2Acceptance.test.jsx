import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { COMMON_ISSUE_ROUTES, COMMON_ISSUE_VERIFIED_AT, recommendedProcessForRoute, searchCommonIssueRoutes } from './commonIssueRoutes'
import { PROCESSES } from '../../data/processes'

afterEach(() => cleanup())

const FROZEN_ROUTE_IDS = [
  'cant-join','cant-hear','cant-be-heard','camera-not-working','waiting-entry',
  'cant-share','chat','meeting-controls','reactions','invite','secure-connection',
  'bluetooth-headset','transfer-device','join-muted','join-video-preference',
  'meeting-volume','auto-computer-audio','multiple-audio-input-channels','participants-before-join',
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

async function openFromSearch({ query, device, role, state }) {
  const user = userEvent.setup()
  render(<Navigator initialRole="Participant" />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })
  await user.type(search, query)
  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  await user.click(within(listbox).getAllByRole('option')[0])
  const dialog = screen.getByRole('dialog')
  if (device) await user.click(within(dialog).getByRole('button', { name: device }))
  if (role) await user.click(within(dialog).getByRole('button', { name: role }))
  if (state) await user.click(within(dialog).getByRole('button', { name: new RegExp(state, 'i') }))
  return { user, dialog }
}

it('freezes the approved route and Process Guide inventories', () => {
  expect(COMMON_ISSUE_ROUTES.map(route => route.id)).toEqual(FROZEN_ROUTE_IDS)
  expect(COMMON_ISSUE_ROUTES).toHaveLength(19)
  expect(PROCESSES.map(process => process.id)).toEqual(FROZEN_PROCESS_IDS)
  expect(PROCESSES).toHaveLength(27)
})

it('records the September 26 source-routing audit', () => {
  expect(COMMON_ISSUE_VERIFIED_AT).toBe('September 26, 2026')
})

it('keeps every route discoverable from caller language', () => {
  for (const route of COMMON_ISSUE_ROUTES) {
    expect(route.searchPhrases?.length).toBeGreaterThan(0)
    expect(searchCommonIssueRoutes(route.searchPhrases[0])[0]?.id).toBe(route.id)
  }
})

it('keeps every recommendation traceable to one of that route’s approved processes', () => {
  for (const route of COMMON_ISSUE_ROUTES) {
    const state = route.states?.[0]?.title ?? null
    const processId = recommendedProcessForRoute(route, { device: 'Windows', state })
    if (processId) expect(route.processIds).toContain(processId)
  }
})

it('routes Windows no-sound to the approved desktop audio process', async () => {
  const { dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'I can’t hear anyone' })).toBeInTheDocument()
  expect(within(dialog).getByText(/Confirm only what changes the route/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Troubleshooting Speaker or Microphone Issues in the Zoom Desktop App/i })).toBeInTheDocument()
  expect(within(dialog).getByRole('button', { name: /Start Guided Process/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/What should happen/i)).not.toBeInTheDocument()
})

it('routes Android microphone trouble to the approved mobile audio process', async () => {
  const { dialog } = await openFromSearch({ query: 'they dont hear me', device: 'Android', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'They can’t hear me' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Troubleshooting Speaker or Microphone Issues on a Mobile Device/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/Select and test the correct microphone/i)).not.toBeInTheDocument()
})

it('routes a Mac camera symptom to the approved camera process without duplicating its steps', async () => {
  const { dialog } = await openFromSearch({ query: 'camera black', device: 'Mac', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'My camera isn’t working' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Zoom Camera Troubleshooting During a Meeting/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/Select the correct camera/i)).not.toBeInTheDocument()
})

it('uses the exact Waiting Room state to route to the broader approved joining process', async () => {
  const { dialog } = await openFromSearch({ query: 'waiting room', device: 'Windows', role: 'Host', state: '^Waiting Room' })

  expect(within(dialog).getByRole('heading', { name: 'I’m waiting to get in' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Joining a Zoom Meeting/i })).toBeInTheDocument()
})

it('routes a participant screen-sharing symptom to the approved sharing process', async () => {
  const { dialog } = await openFromSearch({ query: 'cant screen share', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'Can’t share my screen' })).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: /Sharing Your Screen, Desktop, or Content in Zoom/i })).toBeInTheDocument()
  expect(within(dialog).queryByText(/Do not bypass the host restriction/i)).not.toBeInTheDocument()
})

it('accepts the macOS secure-connection route only on Mac', async () => {
  const mac = await openFromSearch({ query: 'secure conection', device: 'Mac', role: 'Participant' })
  expect(within(mac.dialog).getByRole('button', { name: /Start Guided Process/i })).toBeInTheDocument()

  cleanup()

  const windows = await openFromSearch({ query: 'secure conection', device: 'Windows', role: 'Participant' })
  expect(within(windows.dialog).getByText(/does not support the selected device/i)).toBeInTheDocument()
  expect(within(windows.dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it('keeps the join-muted distinction visible and flags the current iPhone internal-guide gap', async () => {
  const { dialog } = await openFromSearch({ query: 'mute on join', device: 'iPhone', role: 'Participant' })

  expect(within(dialog).getByText(/Joining muted still connects the caller to meeting audio/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Approved guide coverage gap/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/desktop instructions only/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it('stops unsupported Browser guidance for the pre-join participant-view feature', async () => {
  const { dialog } = await openFromSearch({ query: 'who joined already', device: 'Browser', role: 'Participant' })

  expect(within(dialog).getByRole('heading', { name: 'Who is already in the meeting?' })).toBeInTheDocument()
  expect(within(dialog).getByText(/does not support the selected device/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('button', { name: /Start Guided Process/i })).not.toBeInTheDocument()
})

it('hands the selected device into the guided process without asking twice', async () => {
  const { user, dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  await user.click(within(dialog).getByRole('button', { name: /Start Guided Process/i }))
  const processDialog = screen.getByRole('dialog', { name: /Troubleshooting Speaker or Microphone Issues in the Zoom Desktop App/i })
  expect(within(processDialog).getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true')
})

it('keeps approved processes and official sources available without forcing them into the classifier', async () => {
  const { user, dialog } = await openFromSearch({ query: 'no sound', device: 'Windows', role: 'Participant' })

  expect(within(dialog).getByRole('tab', { name: 'Find the Right Guide' })).toHaveAttribute('aria-selected', 'true')
  await user.click(within(dialog).getByRole('tab', { name: 'Full Process' }))
  expect(within(dialog).getByRole('heading', { name: 'Full Process' })).toBeInTheDocument()

  await user.click(within(dialog).getByRole('tab', { name: 'Sources' }))
  expect(within(dialog).getByRole('link', { name: /Official Zoom Support/i })).toHaveAttribute('href', expect.stringContaining('support.zoom.com'))
})
