import { expect, it } from 'vitest'
import { hostFastestTopics, hostProcesses, hostTopics, searchHostRoadblocks, searchHostTopics } from './hostExperience'
import { PROCESSES } from './processes'
import { HOST_ROADBLOCKS, HOST_SUPPORT_TOPICS } from './arbitratorHostSupport'

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


it.each([
  ["I can't hear anyone", 'host-audio'],
  ["caller cant hear anybody", 'host-audio'],
  ['no sound', 'host-audio'],
  ["they can't hear me", 'host-audio'],
  ['camera not working', 'host-camera'],
  ['black camera', 'host-camera'],
  ["can't share screen", 'host-screen-share'],
  ['participant cant share', 'host-screen-share'],
  ['no host controls', 'host-controls-missing'],
  ['waiting room admit participant', 'host-waiting-room'],
  ['invalid meeting id', 'host-meeting-id-passcode'],
  ['unstable network', 'host-connectivity'],
  ['zoom app issue', 'host-app-browser-basic'],
])('keeps high-risk Host symptom search precise: %s', (query, expectedId) => {
  expect(searchHostTopics(query)[0]?.id).toBe(expectedId)
})

it('does not turn an audio symptom into screen-sharing or join roadblocks', () => {
  const topics = searchHostTopics("I can't hear anyone").map(item => item.id)
  const roadblocks = searchHostRoadblocks("I can't hear anyone").map(item => item.id)

  expect(topics[0]).toBe('host-audio')
  expect(topics).not.toContain('host-screen-share')
  expect(topics).not.toContain('host-start-hearing')
  expect(roadblocks).not.toContain('roadblock-unable-to-join')
  expect(roadblocks).not.toContain('roadblock-meeting-details')
})

it('does not confuse the audio verb "hear" with the proceeding word "hearing"', () => {
  expect(searchHostTopics('hear')[0]?.id).toBe('host-audio')
  expect(searchHostTopics('hear').map(item => item.id)).not.toContain('host-start-hearing')
  expect(searchHostTopics('hear').map(item => item.id)).not.toContain('host-screen-share')
})

it('keeps every Host topic directly discoverable from its own primary search phrase', () => {
  for (const topic of HOST_SUPPORT_TOPICS) {
    expect(topic.searchPhrases?.length).toBeGreaterThan(0)
    expect(searchHostTopics(topic.searchPhrases[0])[0]?.id).toBe(topic.id)
  }
})

it('keeps every approved roadblock directly discoverable from its own primary search phrase', () => {
  for (const roadblock of HOST_ROADBLOCKS) {
    expect(roadblock.searchPhrases?.length).toBeGreaterThan(0)
    expect(searchHostRoadblocks(roadblock.searchPhrases[0])[0]?.id).toBe(roadblock.id)
  }
})
