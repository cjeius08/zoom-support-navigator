import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { ScriptsCommunication } from './ScriptsCommunication'
import { COMMON_ISSUE_ROUTES } from '../navigator/commonIssueRoutes'
import { SCENARIO_SCRIPTS, SCENARIO_SCRIPT_VERIFIED_AT } from './scenarioScripts'
import {
  COMMUNICATION_AVOID_PAIRS,
  COMMUNICATION_CALL_FLOW_SOURCE,
  COMMUNICATION_SECTIONS,
  COMMUNICATION_SOURCE_IDS,
  COMMUNICATION_VERIFIED_AT,
} from './communicationScripts'

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

it('locks call language to the current Ogletree call-flow stages and approved process sources', () => {
  expect(COMMUNICATION_VERIFIED_AT).toBe('September 19, 2026')
  expect(COMMUNICATION_CALL_FLOW_SOURCE).toMatch(/Ogletree.*Tier 1 Zoom Support.*Standard Call Flow Outline/i)
  expect(COMMUNICATION_SECTIONS.map(section => section.id)).toEqual([
    'opening',
    'listen',
    'empathy',
    'assurance',
    'identify',
    'probe',
    'troubleshoot',
    'confirm-resolution',
    'recap',
    'final-check',
    'closing',
  ])

  const processIds = new Set(PROCESSES.map(process => process.id))
  expect(processIds.has(COMMUNICATION_SOURCE_IDS.method)).toBe(true)
  expect(processIds.has(COMMUNICATION_SOURCE_IDS.boundaries)).toBe(true)

  for (const section of COMMUNICATION_SECTIONS) {
    expect(section.title).toBeTruthy()
    expect(section.purpose).toBeTruthy()
    expect(section.sourceProcessIds.length).toBeGreaterThan(0)
    for (const sourceId of section.sourceProcessIds) {
      expect(processIds.has(sourceId), section.id + ' points to missing approved process ' + sourceId).toBe(true)
    }
  }
})

it('starts with the official greeting and moves through listen, empathy, assurance, identification, and probing before troubleshooting', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  const opening = screen.getByRole('tabpanel', { name: 'Opening / Greeting' })
  expect(within(opening).getByText(/Thank you for calling Ogletree Zoom Support/i)).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Listen & Acknowledge' }))
  expect(screen.getByRole('tabpanel', { name: 'Listen & Acknowledge' })).toHaveTextContent(/listen first/i)

  await user.click(screen.getByRole('tab', { name: 'Empathy Statement' }))
  expect(screen.getByRole('tabpanel', { name: 'Empathy Statement' })).toHaveTextContent(/hearing/i)

  await user.click(screen.getByRole('tab', { name: 'Assure / Take Ownership' }))
  expect(screen.getByRole('tabpanel', { name: 'Assure / Take Ownership' })).toHaveTextContent(/approved checks/i)

  await user.click(screen.getByRole('tab', { name: 'Identify Caller / Hearing' }))
  const identify = screen.getByRole('tabpanel', { name: 'Identify Caller / Hearing' })
  expect(within(identify).getByText(/Has the hearing already started/i)).toBeInTheDocument()
  expect(within(identify).getByText(/other participants/i)).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Probe & Diagnose' }))
  const probe = screen.getByRole('tabpanel', { name: 'Probe & Diagnose' })
  expect(within(probe).getByText(/Can you tell me what you’re experiencing/i)).toBeInTheDocument()
  expect(within(probe).getByText(/Can you hear the other participants/i)).toBeInTheDocument()
})

it('keeps Locate Describe Guide Confirm as the troubleshooting method, not the entire call flow', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Troubleshoot' }))
  const framework = screen.getByRole('tabpanel', { name: 'Troubleshoot' })
  for (const stage of ['Locate', 'Describe', 'Guide', 'Confirm']) {
    expect(within(framework).getByText(stage, { selector: 'strong' })).toBeInTheDocument()
  }
})

it('keeps unresolved-call guardrails neutral and does not promise an escalation the team does not perform', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Avoid / Use Instead' }))
  const panel = screen.getByRole('tabpanel', { name: 'Avoid and use instead' })

  expect(within(panel).getByText('“I’ll escalate this to your Zoom administrator.”')).toBeInTheDocument()
  expect(within(panel).getByText(/Please contact your organization’s Zoom administrator or IT team/i)).toBeInTheDocument()
  expect(within(panel).getByText(/Do not promise an escalation/i)).toBeInTheDocument()
})

it('shows approved Avoid / Use Instead guardrails', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Avoid / Use Instead' }))
  const panel = screen.getByRole('tabpanel', { name: 'Avoid and use instead' })

  expect(COMMUNICATION_AVOID_PAIRS).toHaveLength(6)
  expect(within(panel).getByText('“Zoom is broken.”')).toBeInTheDocument()
  expect(within(panel).getByText(/issue is still occurring after the basic troubleshooting/i)).toBeInTheDocument()
  expect(within(panel).getByText('“The host disabled it.”')).toBeInTheDocument()
  expect(within(panel).getByText(/feature may be controlled by the meeting host/i)).toBeInTheDocument()
})

it('copies the current Ogletree opening without changing the wording', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  const opening = screen.getByRole('tabpanel', { name: 'Opening / Greeting' })
  const firstCard = within(opening).getByText(/Thank you for calling Ogletree Zoom Support/i).closest('article')
  await user.click(within(firstCard).getByRole('button', { name: 'Copy phrase' }))

  expect(within(firstCard).getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  expect(screen.queryByText(/Copy failed/i)).not.toBeInTheDocument()
})

it('keeps the agent self-check aligned to the full call flow', () => {
  render(<ScriptsCommunication />)

  expect(screen.getByRole('heading', { name: 'Agent self-check' })).toBeInTheDocument()
  expect(screen.getByText(/let the caller explain the concern before troubleshooting/i)).toBeInTheDocument()
  expect(screen.getByText(/hearing status/i)).toBeInTheDocument()
  expect(screen.getByText(/Did I give only one troubleshooting instruction at a time/i)).toBeInTheDocument()
  expect(screen.getByText(/recap the result or next step/i)).toBeInTheDocument()
})

it('locks Phase 4 Batch 3 specialized scenario scripts to existing Common Issue routes', () => {
  expect(SCENARIO_SCRIPT_VERIFIED_AT).toBe('September 19, 2026')
  expect(SCENARIO_SCRIPTS).toHaveLength(19)

  const specializedIds = [
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

  const routeIds = new Set(COMMON_ISSUE_ROUTES.map(route => route.id))
  const scenarioById = new Map(SCENARIO_SCRIPTS.map(scenario => [scenario.id, scenario]))

  for (const id of specializedIds) {
    const scenario = scenarioById.get(id)
    expect(scenario, 'missing specialized scenario ' + id).toBeTruthy()
    expect(routeIds.has(scenario.routeId), id + ' points to a missing Common Issue route').toBe(true)
    expect(scenario.opening).toBeTruthy()
    expect(scenario.guidePhrase).toBeTruthy()
    expect(scenario.confirmPhrase).toBeTruthy()
    expect(scenario.boundaryPhrase).toBeTruthy()
  }
})

it('renders the specialized scenario using the existing live-call card pattern', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Bluetooth Headset' }))

  const panel = screen.getByRole('region', { name: 'Bluetooth Headset scenario' })
  expect(within(panel).getByText('Opening line')).toBeInTheDocument()
  expect(within(panel).getByText('Guided discovery')).toBeInTheDocument()
  expect(within(panel).getByText('Next-step phrasing')).toBeInTheDocument()
  expect(within(panel).getByText('Verify the result')).toBeInTheDocument()
  expect(within(panel).getByText('When basic support stops')).toBeInTheDocument()
  expect(within(panel).getByText(/same device running Zoom/i)).toBeInTheDocument()

  await user.click(within(panel).getByRole('button', { name: 'Connected to this device' }))
  await user.click(within(panel).getByRole('button', { name: 'They can’t hear me' }))
  await user.click(within(panel).getByRole('button', { name: 'Windows' }))

  expect(within(panel).getByText('Select the headset as Zoom Microphone')).toBeInTheDocument()
  expect(within(panel).getByText(/choose the Bluetooth headset under Microphone/i)).toBeInTheDocument()
})

it('can open a roadmap-targeted communication mode and call-flow stage', () => {
  const { rerender } = render(<ScriptsCommunication initialMode="language" initialSectionId="opening" />)

  expect(screen.getByRole('tab', { name: 'Call Language' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel', { name: 'Opening / Greeting' })).toBeInTheDocument()

  rerender(<ScriptsCommunication initialMode="language" initialSectionId="troubleshoot" />)
  expect(screen.getByRole('tabpanel', { name: 'Troubleshoot' })).toBeInTheDocument()

  rerender(<ScriptsCommunication initialMode="avoid" />)
  expect(screen.getByRole('tab', { name: 'Avoid / Use Instead' })).toHaveAttribute('aria-selected', 'true')

  rerender(<ScriptsCommunication initialMode="scenarios" />)
  expect(screen.getByRole('tab', { name: 'Scenario Scripts' })).toHaveAttribute('aria-selected', 'true')
})

it('can open the exact scenario requested by a guided lesson', () => {
  render(<ScriptsCommunication initialMode="scenarios" initialScenarioId="waiting-entry" />)

  expect(screen.getByRole('tab', { name: 'Scenario Scripts' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Waiting to Get In' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('region', { name: 'Waiting to Get In scenario' })).toBeInTheDocument()
})
