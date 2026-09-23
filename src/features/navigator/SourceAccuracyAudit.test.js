import { expect, it } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { COMMON_ISSUE_ROUTES, COMMON_ISSUE_VERIFIED_AT } from './commonIssueRoutes'

const EXPECTED_PRIMARY_ARTICLES = {
  'cant-join': 'KB0060732',
  'cant-hear': 'KB0060836',
  'cant-be-heard': 'KB0060836',
  'camera-not-working': 'KB0068908',
  'waiting-entry': 'KB0061476',
  'cant-share': 'KB0060596',
  'chat': 'KB0064400',
  'meeting-controls': 'KB0062674',
  'reactions': 'KB0063323',
  'invite': 'KB0063688',
  'secure-connection': 'KB0067093',
  'bluetooth-headset': 'KB0058146',
  'transfer-device': 'KB0062024',
  'join-muted': 'KB0062614',
  'join-video-preference': 'KB0062043',
  'meeting-volume': 'KB0057968',
  'auto-computer-audio': 'KB0060983',
  'multiple-audio-input-channels': 'KB0057961',
  'participants-before-join': 'KB0083311',
}

const KNOWN_DISCREPANCY_ROUTES = new Set([
  'cant-join',
  'cant-hear',
  'cant-be-heard',
  'cant-share',
  'invite',
  'secure-connection',
])

it('locks every Common Issue to the official Zoom article verified in the Phase 2 source audit', () => {
  expect(COMMON_ISSUE_ROUTES).toHaveLength(19)
  expect(Object.keys(EXPECTED_PRIMARY_ARTICLES)).toHaveLength(19)

  for (const route of COMMON_ISSUE_ROUTES) {
    const articleId = EXPECTED_PRIMARY_ARTICLES[route.id]
    expect(articleId, 'Missing audited primary source for ' + route.id).toBeTruthy()
    expect(route.primarySource?.title, route.id + ' needs a primary-source title').toBeTruthy()
    expect(route.primarySource?.url).toContain('https://support.zoom.com/')
    expect(route.primarySource?.url).toContain('sysparm_article=' + articleId)
  }
})

it('keeps all supporting product sources on official Zoom Support and removes the stale camera FAQ citation', () => {
  for (const route of COMMON_ISSUE_ROUTES) {
    for (const source of route.supportingSources ?? []) {
      expect(source.title).toBeTruthy()
      expect(source.url).toMatch(/^https:\/\/support\.zoom\.com\//)
    }
  }

  const camera = COMMON_ISSUE_ROUTES.find(route => route.id === 'camera-not-working')
  expect(camera.supportingSources.map(source => source.url)).not.toContain(
    'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0063407',
  )
  expect(camera.supportingSources.map(source => source.title)).toContain('Testing your video')
})

it('does not silently hide known source discrepancies', () => {
  for (const route of COMMON_ISSUE_ROUTES) {
    if (KNOWN_DISCREPANCY_ROUTES.has(route.id)) {
      expect(route.discrepancy, route.id + ' must explain the known source discrepancy').toBeTruthy()
    }
  }

  const invite = COMMON_ISSUE_ROUTES.find(route => route.id === 'invite')
  expect(invite.discrepancy).toMatch(/mobile placement of Participants/i)
  expect(invite.discrepancy).toMatch(/under More/i)

  const mobileAudio = COMMON_ISSUE_ROUTES.find(route => route.id === 'cant-be-heard')
  expect(mobileAudio.discrepancy).toMatch(/Call Over Internet/i)
  expect(mobileAudio.discrepancy).toMatch(/Wifi or Cellular Data/i)

  const secure = COMMON_ISSUE_ROUTES.find(route => route.id === 'secure-connection')
  expect(secure.discrepancy).toMatch(/internal process starts with updating Zoom/i)
  expect(secure.discrepancy).toMatch(/uninstall\/reinstall earlier/i)
})

it('ensures every routed internal process ID resolves to an approved Process Guide', () => {
  const processIds = new Set(PROCESSES.map(process => process.id))

  for (const route of COMMON_ISSUE_ROUTES) {
    expect(route.processIds?.length, route.id + ' must retain internal-process traceability').toBeGreaterThan(0)
    for (const processId of route.processIds) {
      expect(processIds.has(processId), route.id + ' points to missing process ' + processId).toBe(true)
    }
  }
})

it('covers all approved Process Guides through a Common Issue route except the agent guidance method', () => {
  const routedIds = new Set(COMMON_ISSUE_ROUTES.flatMap(route => route.processIds))
  const unrouted = PROCESSES.map(process => process.id).filter(id => !routedIds.has(id))
  expect(unrouted).toEqual(['locate-describe-guide-confirm'])
})

it('records the current verification date in one auditable constant', () => {
  expect(COMMON_ISSUE_VERIFIED_AT).toBe('September 23, 2026')
})
