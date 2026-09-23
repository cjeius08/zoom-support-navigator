import { expect, it } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { approvedEndPathsForProcess, COMMON_ISSUE_ROUTES, COMMON_ISSUE_VERIFIED_AT, orderedSourcesForRoute, routeDecisionExplanation } from './commonIssueRoutes'

const EXPECTED_PRIMARY_ARTICLES = {
  'cant-join': 'KB0068749',
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


it('keeps Can’t Join steps in the order of the approved Process Document', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-join')
  const process = PROCESSES.find(item => item.id === 'troubleshooting-when-you-cant-join-a-zoom-meeting')

  expect(route.checks.map(check => check.title)).toEqual(process.steps)
  expect(route.checks[0].instruction).toMatch(/browser-based joining is unsuccessful.*install.*Zoom Workplace desktop app/i)
  expect(route.checks[1].instruction).toMatch(/already installed.*still cannot join.*uninstall.*reinstall/i)
  expect(route.checks[2].instruction).toMatch(/Meeting ID.*passcode.*host/i)
  expect(route.checks[3].instruction).toMatch(/invalid.*contact the host/i)
})

it('keeps Can’t Join anchored to the troubleshooting article named by the approved Process Document', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-join')
  expect(route.primarySource.title).toMatch(/Troubleshooting when you can’t join/i)
  expect(route.primarySource.url).toContain('KB0068749')
  expect(route.supportingSources.some(source => source.url.includes('KB0060732'))).toBe(true)
})

it('records known internal-guide coverage gaps instead of cross-platform substitutions', () => {
  const invite = COMMON_ISSUE_ROUTES.find(item => item.id === 'invite')
  const joinMuted = COMMON_ISSUE_ROUTES.find(item => item.id === 'join-muted')
  const volume = COMMON_ISSUE_ROUTES.find(item => item.id === 'meeting-volume')

  expect(invite.guideCoverageNotes.Windows).toMatch(/not desktop invitation controls/i)
  expect(joinMuted.guideCoverageNotes.iPhone).toMatch(/desktop instructions only/i)
  expect(volume.guideCoverageNotes.Android).toMatch(/detailed Guided Process steps are desktop-only/i)
})


it('prioritizes the official Zoom article that matches the selected device and approved process', () => {
  const cantHear = COMMON_ISSUE_ROUTES.find(route => route.id === 'cant-hear')
  const camera = COMMON_ISSUE_ROUTES.find(route => route.id === 'camera-not-working')
  const cantJoin = COMMON_ISSUE_ROUTES.find(route => route.id === 'cant-join')

  expect(orderedSourcesForRoute(cantHear, {
    device: 'Android',
    processId: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
  })[0].url).toContain('KB0066222')

  expect(orderedSourcesForRoute(cantHear, {
    device: 'Windows',
    processId: 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
  })[0].url).toContain('KB0060836')

  expect(orderedSourcesForRoute(camera, {
    device: 'Android',
    processId: 'testing-your-video-in-zoom',
  })[0].url).toContain('KB0061836')

  expect(orderedSourcesForRoute(cantJoin, {
    device: 'Windows',
    processId: 'troubleshooting-when-you-cant-join-a-zoom-meeting',
  })[0].url).toContain('KB0068749')

  expect(orderedSourcesForRoute(cantJoin, {
    device: 'Android',
    processId: 'joining-a-zoom-meeting',
  })[0].url).toContain('KB0060732')
})

it('prioritizes the official Zoom article that matches an exact meeting-entry state', () => {
  const waiting = COMMON_ISSUE_ROUTES.find(route => route.id === 'waiting-entry')

  expect(orderedSourcesForRoute(waiting, { state: 'Waiting Room' })[0].url).toContain('KB0063329')
  expect(orderedSourcesForRoute(waiting, { state: 'Waiting for host' })[0].url).toContain('KB0061476')
})


it('keeps exhausted audio routing symptom-aware and prevents loops back to the originating Common Issue', () => {
  const next = approvedEndPathsForProcess(
    'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    { sourceRouteId: 'cant-hear', device: 'Windows' },
  )

  expect(next.map(item => item.route.id)).toEqual(['bluetooth-headset', 'meeting-volume'])
  expect(next.map(item => item.route.id)).not.toContain('cant-hear')
  expect(next.every(item => item.condition && item.reason)).toBe(true)
})

it('keeps Bluetooth end paths split by the remaining speaker-versus-microphone symptom', () => {
  const next = approvedEndPathsForProcess(
    'using-bluetooth-headphones-with-zoom-on-android-ios',
    { sourceRouteId: 'bluetooth-headset', device: 'Android' },
  )

  expect(next.map(item => item.route.id)).toEqual(['cant-hear', 'cant-be-heard'])
  expect(next.find(item => item.route.id === 'cant-hear').condition).toMatch(/cannot hear meeting audio/i)
  expect(next.find(item => item.route.id === 'cant-be-heard').condition).toMatch(/cannot hear the caller/i)
})

it('filters device-specific end paths instead of offering unsupported next routes', () => {
  const android = approvedEndPathsForProcess(
    'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
    { sourceRouteId: 'cant-be-heard', device: 'Android' },
  )
  const windows = approvedEndPathsForProcess(
    'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app',
    { sourceRouteId: 'cant-be-heard', device: 'Windows' },
  )

  expect(android.map(item => item.route.id)).toEqual(['bluetooth-headset'])
  expect(windows.map(item => item.route.id)).toEqual(['bluetooth-headset', 'multiple-audio-input-channels'])
})


it('explains device-specific Common Issue routing without implying caller role caused the recommendation', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'cant-hear')
  const explanation = routeDecisionExplanation(route, {
    device: 'Android',
    role: 'Host',
    processId: 'troubleshooting-speaker-or-microphone-issues-on-a-mobile-device',
  })

  expect(explanation.matchReason).toMatch(/Device-specific match: Android/i)
  expect(explanation.matchReason).toMatch(/different approved guide/i)
  expect(explanation.contextNote).toMatch(/Host is retained as call context/i)
  expect(explanation.contextNote).toMatch(/did not change this recommendation/i)
  expect(explanation.sourceTitle).toMatch(/mobile device/i)
})

it('explains exact waiting-screen state routing as the decision basis', () => {
  const route = COMMON_ISSUE_ROUTES.find(item => item.id === 'waiting-entry')
  const explanation = routeDecisionExplanation(route, {
    device: 'Windows',
    state: 'Waiting Room',
    processId: 'joining-a-zoom-meeting',
  })

  expect(explanation.matchReason).toBe('Exact screen state matched: Waiting Room.')
  expect(explanation.sourceTitle).toMatch(/Waiting Room/i)
})
