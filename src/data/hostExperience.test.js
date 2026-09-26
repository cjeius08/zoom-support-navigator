import { expect, it } from 'vitest'
import { hostFastestTopics, hostProcesses, hostTopics, searchHostRoadblocks, searchHostTopics } from './hostExperience'
import { PROCESSES } from './processes'
import { HOST_SUPPORT_TOPICS } from './arbitratorHostSupport'

it('keeps Host fastest routes arbitrator-focused', () => {
  const ids = hostFastestTopics().map(item => item.id)
  expect(ids).toContain('host-start-hearing')
  expect(ids).toContain('host-controls-missing')
  expect(ids).not.toContain('waiting-entry')
})

it.each([
  ['cant share', 'host-screen-share'],
  ['mic not working', 'host-audio'],
  ['no host controls', 'host-controls-missing'],
  ['meeting id not working', 'host-meeting-id-passcode'],
  ['chat', 'host-basic-controls'],
  ['unstable network', 'host-connectivity'],
  ['zoom app issue', 'host-app-browser-basic'],
])('searches Host issues from caller language: %s', (query, expectedId) => {
  expect(searchHostTopics(query)[0]?.id).toBe(expectedId)
})

it.each([
  ['firewall', 'roadblock-network-security'],
  ['locked setting', 'roadblock-account-permission'],
  ['reschedule hearing', 'roadblock-proceeding-decision'],
  ['stop recording', 'roadblock-proceeding-policy'],
])('searches roadblocks directly: %s', (query, expectedId) => {
  expect(searchHostRoadblocks(query)[0]?.id).toBe(expectedId)
})

it('hides participant-only and review-gap processes from Host mode', () => {
  const ids = new Set(hostProcesses(PROCESSES).map(item => item.id))
  expect(ids.has('using-participant-controls-in-a-zoom-meeting')).toBe(false)
  expect(ids.has('waiting-for-the-host-to-start-a-meeting-or-webinar')).toBe(false)
  expect(ids.has('enabling-and-managing-multiple-audio-input-channels-in-zoom')).toBe(false)
  expect(ids.has('testing-your-audio-settings-for-zoom-meetings')).toBe(true)
})


it('keeps stale referral imports out of the Host Process Guide surface', () => {
  const visible = hostProcesses(PROCESSES)
  const combined = visible.map(process => [process.text, process.sourceText, process.referral].filter(Boolean).join('\n')).join('\n')
  expect(combined).not.toMatch(/odflexmassarbs@ogletreedeakins\.com/i)
  expect(combined).not.toMatch(/please contact your organization.?s IT/i)
  expect(combined).not.toMatch(/Zoom administrator/i)
  expect(combined).not.toMatch(/CONTACT IT/i)
})


it('has a guided Host route for every approved Host support topic', () => {
  expect(hostTopics().map(item => item.id).sort()).toEqual(HOST_SUPPORT_TOPICS.map(item => item.id).sort())
})
