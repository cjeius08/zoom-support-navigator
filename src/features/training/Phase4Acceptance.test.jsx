import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_ROUTES } from '../navigator/commonIssueRoutes'
import { TrainingResources } from './TrainingResources'
import { ScriptsCommunication } from './ScriptsCommunication'
import { SCENARIO_DISCOVERY, getScenarioDiscovery } from './scenarioDiscovery'
import { SCENARIO_SCRIPTS, SCENARIO_SCRIPT_VERIFIED_AT } from './scenarioScripts'
import {
  COMMUNICATION_AVOID_PAIRS,
  COMMUNICATION_SECTIONS,
  COMMUNICATION_SELF_CHECK,
} from './communicationScripts'

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

it('freezes the complete Phase 4 inventory and approved traceability', () => {
  expect(SCENARIO_SCRIPT_VERIFIED_AT).toBe('September 19, 2026')
  expect(SCENARIO_SCRIPTS).toHaveLength(19)
  expect(new Set(SCENARIO_SCRIPTS.map(item => item.id)).size).toBe(19)
  expect(COMMUNICATION_SECTIONS).toHaveLength(7)
  expect(COMMUNICATION_AVOID_PAIRS).toHaveLength(6)
  expect(COMMUNICATION_SELF_CHECK.length).toBeGreaterThanOrEqual(3)

  const routes = new Map(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))
  const processIds = new Set(PROCESSES.map(process => process.id))

  for (const scenario of SCENARIO_SCRIPTS) {
    const route = routes.get(scenario.routeId)
    expect(route, scenario.id + ' must keep a linked Common Issue route').toBeTruthy()
    expect(route.confirm?.length, scenario.id + ' must retain discovery prompts').toBeGreaterThanOrEqual(3)
    expect(route.checks?.length, scenario.id + ' must retain approved route checks').toBeGreaterThan(0)
    expect(route.processIds?.length, scenario.id + ' must retain source traceability').toBeGreaterThan(0)

    for (const processId of route.processIds) {
      expect(processIds.has(processId), scenario.id + ' references missing process ' + processId).toBe(true)
    }

    expect(scenario.opening).toBeTruthy()
    expect(scenario.guidePhrase).toBeTruthy()
    expect(scenario.confirmPhrase).toBeTruthy()
    expect(scenario.boundaryPhrase).toBeTruthy()
  }
})

it('freezes guided discovery coverage for every Phase 4 scenario', () => {
  const routes = new Map(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))
  const scenarioIds = SCENARIO_SCRIPTS.map(scenario => scenario.id)

  expect(Object.keys(SCENARIO_DISCOVERY).sort()).toEqual([...scenarioIds].sort())

  for (const scenario of SCENARIO_SCRIPTS) {
    const route = routes.get(scenario.routeId)
    const config = SCENARIO_DISCOVERY[scenario.id]
    expect(config.questions.length).toBeGreaterThanOrEqual(2)

    const questionIds = config.questions.map(question => question.id)
    expect(new Set(questionIds).size, scenario.id + ' has duplicate discovery question ids').toBe(questionIds.length)

    for (const question of config.questions) {
      expect(route.confirm[question.promptIndex], scenario.id + ' discovery prompt must map to approved route wording').toBeTruthy()
      expect(question.options.length).toBeGreaterThanOrEqual(2)
      expect(new Set(question.options.map(option => option.value)).size).toBe(question.options.length)
      question.options.forEach(option => expect(option.label).toBeTruthy())
    }

    const initial = getScenarioDiscovery(scenario.id, route, {})
    expect(initial.recommendation.state).toBe('collecting')
  }
})

it('keeps guided discovery interactive, resettable, and isolated between scenarios', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Bluetooth Headset' }))

  let detail = screen.getByLabelText('Bluetooth Headset scenario')
  const reset = within(detail).getByRole('button', { name: 'Reset answers' })
  expect(reset).toBeDisabled()

  await user.click(within(detail).getByRole('button', { name: 'Connected to this device' }))
  await user.click(within(detail).getByRole('button', { name: 'They can’t hear me' }))
  await user.click(within(detail).getByRole('button', { name: 'Windows' }))

  expect(reset).toBeEnabled()
  expect(within(detail).getByText('Select the headset as Zoom Microphone')).toBeInTheDocument()

  await user.click(reset)
  expect(within(detail).getByText(/Keep discovering/i)).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Secure Connection Error' }))
  expect(screen.getByLabelText('Secure Connection Error scenario')).toBeInTheDocument()

  await user.click(screen.getByRole('tab', { name: 'Bluetooth Headset' }))
  detail = screen.getByLabelText('Bluetooth Headset scenario')
  expect(within(detail).getByRole('button', { name: 'Reset answers' })).toBeDisabled()
  expect(within(detail).queryByText('Select the headset as Zoom Microphone')).not.toBeInTheDocument()
})

it('keeps scenario copy actions scoped to the phrase the agent clicked', async () => {
  const user = userEvent.setup()
  render(<ScriptsCommunication />)

  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Join Muted' }))

  const detail = screen.getByLabelText('Join Muted scenario')
  const openingCard = within(detail).getByRole('heading', { name: 'Opening line' }).closest('article')
  const guideCard = within(detail).getByRole('heading', { name: 'Next-step phrasing' }).closest('article')

  await user.click(within(openingCard).getByRole('button', { name: 'Copy phrase' }))

  expect(within(openingCard).getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  expect(within(guideCard).getByRole('button', { name: 'Copy phrase' })).toBeInTheDocument()
  expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
})

it('keeps global report context on the exact active Phase 4 scenario', async () => {
  const user = userEvent.setup()
  const onReportContextChange = vi.fn()
  render(<TrainingResources onReportContextChange={onReportContextChange} />)

  await user.click(screen.getByRole('tab', { name: 'Scripts & Communication' }))
  await user.click(screen.getByRole('tab', { name: 'Scenario Scripts' }))
  await user.click(screen.getByRole('tab', { name: 'Invite / Copy Link' }))

  expect(onReportContextChange).toHaveBeenLastCalledWith(expect.objectContaining({
    selected_tab: 'Scenario Scripts',
    current_section: 'Invite / Copy Link',
  }))
})

it('keeps Phase 4 usable on narrow screens without losing guided discovery controls', () => {
  const css = readFileSync(join(cwd(), 'src/styles.css'), 'utf8')

  expect(css).toMatch(/@media\s*\(max-width:\s*850px\)[\s\S]*?\.scenario-script-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
  expect(css).toMatch(/@media\s*\(max-width:\s*650px\)[\s\S]*?\.scenario-discovery-heading\s*\{[^}]*flex-direction:\s*column/)
  expect(css).toMatch(/\.scenario-discovery-options button\[aria-pressed="true"\]/)
  expect(css).toMatch(/\.scenario-discovery-options button:focus-visible/)
})
