import { expect, it } from 'vitest'
import { COMMON_ISSUE_ROUTES } from '../navigator/commonIssueRoutes'
import { SCENARIO_SCRIPTS } from './scenarioScripts'
import { SCENARIO_DISCOVERY, getScenarioDiscovery } from './scenarioDiscovery'

it('provides guided discovery for every Scenario Script', () => {
  const routes = new Map(COMMON_ISSUE_ROUTES.map(route => [route.id, route]))

  for (const scenario of SCENARIO_SCRIPTS) {
    const route = routes.get(scenario.routeId)
    const config = SCENARIO_DISCOVERY[scenario.id]

    expect(config, scenario.id + ' is missing guided discovery').toBeTruthy()
    expect(config.questions.length, scenario.id + ' needs discovery choices').toBeGreaterThanOrEqual(2)

    const view = getScenarioDiscovery(scenario.id, route, {})
    expect(view.questions.length).toBe(config.questions.length)
    view.questions.forEach(question => {
      expect(question.prompt).toBeTruthy()
      expect(question.options.length).toBeGreaterThanOrEqual(2)
    })
    expect(view.recommendation.state).toBe('collecting')
  }
})

it('routes a Bluetooth microphone symptom to the Zoom microphone selector', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'bluetooth-headset')
  const view = getScenarioDiscovery('bluetooth-headset', route, {
    connected: 'yes',
    symptom: 'mic',
    device: 'windows',
  })

  expect(view.recommendation).toMatchObject({
    state: 'ready',
    title: 'Select the headset as Zoom Microphone',
  })
  expect(view.recommendation.text).toMatch(/under Microphone/i)
})

it('redirects waiting states away from the failed-join path', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-join')
  const view = getScenarioDiscovery('cant-join', route, {
    state: 'waiting-room',
  })

  expect(view.recommendation).toMatchObject({
    state: 'ready',
    route: 'waiting-entry',
  })
  expect(view.recommendation.text).toMatch(/Stop treating this as a failed join/i)
})

it('keeps the secure-connection specialty route Mac-specific', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'secure-connection')
  const view = getScenarioDiscovery('secure-connection', route, {
    exact: 'yes',
    platform: 'other',
  })

  expect(view.recommendation).toMatchObject({
    state: 'ready',
    route: 'cant-join',
  })
  expect(view.recommendation.text).toMatch(/only for the exact/i)
})
