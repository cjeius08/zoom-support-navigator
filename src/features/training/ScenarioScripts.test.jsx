import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_ROUTES } from '../navigator/commonIssueRoutes'
import { ScriptsCommunication } from './ScriptsCommunication'
import { SCENARIO_SCRIPTS, SCENARIO_SCRIPT_VERIFIED_AT } from './scenarioScripts'

const EXPECTED_SCENARIOS = [
  'cant-join',
  'waiting-entry',
  'cant-hear',
  'cant-be-heard',
  'camera-not-working',
  'cant-share',
  'meeting-controls',
  'chat',
  'reactions',
  'bluetooth-headset',
  'secure-connection',
  'transfer-device',
  'join-muted',
  'join-video-preference',
  'meeting-volume',
  'auto-computer-audio',
  'multiple-audio-input-channels',
  'participants-before-join',
  'invite',
]

it('locks the Phase 4 Batch 3 scenario inventory to nineteen Common Issues', () => {
  expect(SCENARIO_SCRIPT_VERIFIED_AT).toBe('September 19, 2026')
  expect(SCENARIO_SCRIPTS.map(scenario => scenario.id)).toEqual(EXPECTED_SCENARIOS)
  expect(SCENARIO_SCRIPTS).toHaveLength(19)
})

it('links every scenario to an existing Common Issue and approved Process Guides', () => {
  const routes = new Map(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))
  const processIds = new Set(PROCESSES.map(process => process.id))

  for (const scenario of SCENARIO_SCRIPTS) {
    const route = routes.get(scenario.routeId)
    expect(route, 'Missing Common Issue route for ' + scenario.id).toBeTruthy()
    expect(route.confirm?.length, scenario.id + ' needs discovery questions').toBeGreaterThanOrEqual(3)
    expect(route.processIds?.length, scenario.id + ' needs process traceability').toBeGreaterThan(0)

    for (const processId of route.processIds) {
      expect(processIds.has(processId), scenario.id + ' points to missing process ' + processId).toBe(true)
    }

    expect(scenario.opening).toBeTruthy()
    expect(scenario.guidePhrase).toBeTruthy()
    expect(scenario.confirmPhrase).toBeTruthy()
    expect(scenario.boundaryPhrase).toBeTruthy()
  }
})

it('shows the scenario workspace with Can’t Join selected first', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))

  const panel = screen.getByRole('tabpanel', { name: 'Scenario scripts' })
  expect(within(panel).getByRole('tab', { name: 'Can’t Join' })).toHaveAttribute('aria-selected', 'true')
  expect(within(panel).getByRole('heading', { name: 'Can’t Join' })).toBeInTheDocument()
  expect(within(panel).getByText(/Let’s first confirm exactly where Zoom is stopping you/i)).toBeInTheDocument()
  expect(within(panel).getByRole('heading', { name: 'Guided discovery' })).toBeInTheDocument()
  expect(within(panel).getByText(/outside the meeting, or do they already see a Zoom waiting screen/i)).toBeInTheDocument()
  expect(within(panel).getByText(/Common Issue · cant-join/i)).toBeInTheDocument()
})

it('switches to the microphone scenario and surfaces the live route discovery plus first approved action', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'They Can’t Hear Me' }))

  const detail = screen.getByLabelText('They Can’t Hear Me scenario')
  expect(within(detail).getByText(/Does the Zoom microphone control show that they are muted/i)).toBeInTheDocument()
  expect(within(detail).getByText(/Unmute in Zoom if muted/i)).toBeInTheDocument()
  expect(within(detail).getByText(/Zoom shows the microphone as unmuted/i)).toBeInTheDocument()
  expect(within(detail).getByText(/Please contact your IT or device support team/i)).toBeInTheDocument()
})

it('keeps Waiting Room ownership clear without pretending basic support can admit a participant', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Waiting to Get In' }))

  const detail = screen.getByLabelText('Waiting to Get In scenario')
  expect(within(detail).getByText(/What exact waiting message is displayed/i)).toBeInTheDocument()
  expect(within(detail).getByText(/controlled by the meeting host or organizer/i)).toBeInTheDocument()
  expect(within(detail).getByText(/we cannot admit participants or start the organizer’s meeting/i)).toBeInTheDocument()
})

it('keeps participant screen-share permissions inside the host boundary', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Screen Share' }))

  const detail = screen.getByLabelText('Screen Share scenario')
  expect(within(detail).getByText(/whether the host controls the permission/i)).toBeInTheDocument()
  expect(within(detail).getByText(/we cannot bypass that permission/i)).toBeInTheDocument()
  expect(within(detail).getByText(/meeting host or organizer/i)).toBeInTheDocument()
})
