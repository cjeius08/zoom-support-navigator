import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Navigator } from './Navigator'
import { COMMON_ISSUE_ROUTES, searchCommonIssueRoutes } from './commonIssueRoutes'
import { PROCESSES } from '../../data/processes'

it('preserves the five Fastest Routes and exposes all fifteen reviewed routes under Common Issues', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  expect(screen.getByRole('button', { name: /Can’t join the meeting/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I can’t hear anyone/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /They can’t hear me/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /My camera isn’t working/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /I’m waiting to get in/i })).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Common Issues' }))
  expect(COMMON_ISSUE_ROUTES).toHaveLength(15)
  expect(screen.getByRole('button', { name: /Can’t share my screen/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Can’t find chat \/ can’t send a message/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Can’t find a meeting control/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Raise hand \/ reactions/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Invite someone \/ copy invite link/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Unable to establish secure connection/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Bluetooth headset isn’t working/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /switch this meeting to another device/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /join with my microphone muted/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /camera on\/off when I join/i })).toBeInTheDocument()
})

it('classifies cannot-hear as an audio-output symptom before assuming connection trouble', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))

  const dialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })
  expect(within(dialog).getByText('Audio-output symptom')).toBeInTheDocument()
  expect(within(dialog).getByText(/Are they already inside the meeting/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/If the meeting itself is reconnecting, dropping, or not loading/i)).toBeInTheDocument()
})

it('keeps waiting-for-host and Waiting Room as separate meeting states', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /I’m waiting to get in/i }))

  const dialog = screen.getByRole('dialog', { name: /I’m waiting to get in/i })
  expect(within(dialog).getByRole('heading', { name: 'Waiting for host' })).toBeInTheDocument()
  expect(within(dialog).getByText(/successfully connected to Zoom/i)).toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Waiting Room' })).toBeInTheDocument()
  expect(within(dialog).getByText('Host controls admission')).toBeInTheDocument()
})

it('routes natural caller language directly to the common issue guide', async () => {
  const user = userEvent.setup()
  render(<Navigator />)
  const search = screen.getByRole('combobox', { name: 'Search support processes' })

  await user.type(search, 'they cant hear me')

  const listbox = screen.getByRole('listbox', { name: 'Search suggestions' })
  const firstOption = within(listbox).getAllByRole('option')[0]
  expect(firstOption).toHaveTextContent('They can’t hear me')
  expect(firstOption).toHaveTextContent('Common Issue')

  await user.click(firstOption)
  expect(screen.getByRole('dialog', { name: /They can’t hear me/i })).toBeInTheDocument()
})

it.each([
  ['cant share', 'cant-share'],
  ['cant find chat', 'chat'],
  ['find a meeting control', 'meeting-controls'],
  ['raise hand', 'reactions'],
  ['copy invite link', 'invite'],
  ['unable to establish secure connection', 'secure-connection'],
  ['bluetooth headset not working', 'bluetooth-headset'],
  ['switch meeting to another device', 'transfer-device'],
  ['join muted', 'join-muted'],
  ['camera off when joining', 'join-video-preference'],
])('maps %s to the reviewed Phase 2 route before process lookup', (query, routeId) => {
  expect(searchCommonIssueRoutes(query)[0]?.id).toBe(routeId)
})

it('keeps the secure-connection route Mac-specific and exposes the internal-vs-Zoom sequence discrepancy', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'secure-connection')
  expect(route.classificationNote).toMatch(/exact.*Unable to establish secure connection/i)
  expect(route.classificationNote).toMatch(/Mac/i)
  expect(route.discrepancy).toMatch(/approved internal process starts with updating Zoom/i)
  expect(route.discrepancy).toMatch(/public article presents complete uninstall\/reinstall earlier/i)
})

it('keeps join-muted separate from joining with no audio connection', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'join-muted')
  expect(route.classificationNote).toMatch(/Joining muted still connects/i)
  expect(route.classificationNote).toMatch(/Don’t connect to audio/i)
  expect(route.checks.some(check => /Keep my microphone muted/i.test(check.instruction))).toBe(true)
})

it('keeps camera join preferences explicit about default versus one-time behavior', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'join-video-preference')
  expect(route.confirm.some(question => /every meeting or only the next meeting/i.test(question))).toBe(true)
  expect(route.checks.some(check => /Keep my camera off/i.test(check.instruction))).toBe(true)
  expect(route.checks.some(check => /Turn off my video/i.test(check.instruction))).toBe(true)
})

it('uses the Phase 1 device and role context inside a common issue route', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'Windows' }))
  await user.click(screen.getByRole('button', { name: 'Participant' }))
  await user.click(screen.getByRole('button', { name: /They can’t hear me/i }))

  const dialog = screen.getByRole('dialog', { name: /They can’t hear me/i })
  const context = within(dialog).getByLabelText('Selected call context')
  expect(context).toHaveTextContent('Windows')
  expect(context).toHaveTextContent('Participant')
})

it('keeps authoritative sources visible but secondary to the quick route', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /My camera isn’t working/i }))
  const dialog = screen.getByRole('dialog', { name: /My camera isn’t working/i })

  await user.click(within(dialog).getByRole('tab', { name: 'Sources' }))

  expect(within(dialog).getByRole('link', { name: /Official Zoom Support/i })).toHaveAttribute('href', expect.stringContaining('support.zoom.com'))
  expect(within(dialog).getByText(/Zoom Camera Troubleshooting During a Meeting/i)).toBeInTheDocument()
  expect(within(dialog).getByText(/Verified against official Zoom Support: September 18, 2026/i)).toBeInTheDocument()
})


it('keeps every Phase 2 route traceable to existing approved processes and official Zoom sources', () => {
  const approvedIds = new Set(PROCESSES.map(process => process.id))

  for (const route of COMMON_ISSUE_ROUTES) {
    expect(route.processIds.length).toBeGreaterThan(0)
    route.processIds.forEach(id => expect(approvedIds.has(id)).toBe(true))
    expect(route.primarySource.url).toMatch(/^https:\/\/support\.zoom\.com\//)
    ;(route.supportingSources ?? []).forEach(source => expect(source.url).toMatch(/^https:\/\/support\.zoom\.com\//))
  }
})

it('routes the caller phrase "I cant hear you" to audio output rather than guessing connection trouble', () => {
  const matches = searchCommonIssueRoutes('I cant hear you')
  expect(matches[0]?.id).toBe('cant-hear')
  expect(matches[0]?.classification).toBe('Audio-output symptom')
})


it('keeps the microphone route from skipping meeting audio without pretending Zoom uses one universal mobile label', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-be-heard')
  expect(route.confirm.some(question => /Join Audio|connected to meeting audio/i.test(question))).toBe(true)
  expect(route.checks.some(check => /internet-audio option shown on the device/i.test(check.instruction))).toBe(true)
  expect(route.discrepancy).toMatch(/current official Zoom Support articles/i)
  expect(route.discrepancy).toMatch(/Call Over Internet/i)
  expect(route.discrepancy).toMatch(/Wifi or Cellular Data/i)
})

it('uses the same label-safe rule for the cannot-hear mobile audio path', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-hear')
  expect(route.checks.some(check => /internet-audio option shown on the device/i.test(check.instruction))).toBe(true)
  expect(route.discrepancy).toMatch(/current official Zoom Support articles/i)
})


it('uses Zoom’s documented manual join address instead of an alternate hostname', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-join')
  const routeText = route.checks.map(check => check.instruction).join(' ')
  expect(routeText).toContain('zoom.us/join')
  expect(routeText).not.toContain('join.zoom.us')
})


it('does not show desktop-only audio settings to an iPhone caller', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'iPhone' }))
  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))

  const dialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })
  expect(within(dialog).queryByRole('heading', { name: 'Test and select the Zoom speaker' })).not.toBeInTheDocument()
  expect(within(dialog).getByRole('heading', { name: 'Confirm they joined meeting audio' })).toBeInTheDocument()
})

it('shows desktop-only audio settings when Windows is the selected device', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: 'Windows' }))
  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))

  const dialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })
  expect(within(dialog).getByRole('heading', { name: 'Test and select the Zoom speaker' })).toBeInTheDocument()
})

it('prompts for device context before exposing device-specific checks', async () => {
  const user = userEvent.setup()
  render(<Navigator />)

  await user.click(screen.getByRole('button', { name: /I can’t hear anyone/i }))
  const dialog = screen.getByRole('dialog', { name: /I can’t hear anyone/i })

  expect(within(dialog).getByText(/Select the caller’s device in Live Call Flow/i)).toBeInTheDocument()
  expect(within(dialog).queryByRole('heading', { name: 'Test and select the Zoom speaker' })).not.toBeInTheDocument()
})
