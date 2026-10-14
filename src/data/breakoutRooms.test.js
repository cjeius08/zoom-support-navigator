import { describe, expect, it } from 'vitest'
import { PROCESSES } from './processes'
import { PROCESS_ROLE_COVERAGE } from './supportRoleCoverage'
import { hostProcesses } from './hostExperience'
import { searchProcesses } from '../features/navigator/smartSearch'
import { buildCallGuide } from '../features/navigator/processText'

const PARTICIPATING = 'participating-in-meeting-breakout-rooms'
const MANAGING = 'managing-meeting-breakout-rooms'

const guideById = id => PROCESSES.find(guide => guide.id === id)

describe('approved breakout room guides', () => {
  it('preserves all 27 existing guides and adds exactly two under Meeting Controls', () => {
    expect(PROCESSES).toHaveLength(29)
    expect(guideById(PARTICIPATING)?.category).toBe('controls')
    expect(guideById(MANAGING)?.category).toBe('controls')
    expect(PROCESS_ROLE_COVERAGE.find(item => item.id === PARTICIPATING)).toBeTruthy()
    expect(PROCESS_ROLE_COVERAGE.find(item => item.id === MANAGING)).toBeTruthy()
  })

  it('makes both guides available through Host and Participant search', () => {
    for (const library of [PROCESSES, hostProcesses(PROCESSES)]) {
      const general = searchProcesses(library, 'breakout room').map(guide => guide.id)
      expect(general).toContain(PARTICIPATING)
      expect(general).toContain(MANAGING)
      expect(searchProcesses(library, 'create breakout room')[0]?.id).toBe(MANAGING)
      expect(searchProcesses(library, 'join breakout room')[0]?.id).toBe(PARTICIPATING)
      expect(searchProcesses(library, 'assign participants').map(guide => guide.id)).toContain(MANAGING)
    }
  })

  it('retains source-supported guides, device coverage, and permission boundaries', () => {
    const participant = guideById(PARTICIPATING)
    const host = guideById(MANAGING)
    expect(participant.sourceText).toMatch(/Ask for Help/)
    expect(participant.sourceText).toMatch(/Leave Breakout Room/)
    expect(participant.sourceText).toMatch(/Telephone Dial-In/)
    expect(host.sourceText).toMatch(/Open All Rooms/)
    expect(host.sourceText).toMatch(/Close All Rooms/)
    expect(host.sourceText).toMatch(/cannot manage meeting breakout rooms/)
    const participantCallGuide = buildCallGuide(participant)
    const hostCallGuide = buildCallGuide(host)
    expect(participantCallGuide.steps.length).toBeGreaterThan(10)
    expect(hostCallGuide.steps.length).toBeGreaterThan(10)
    expect(hostCallGuide.availablePlatforms).toEqual(expect.arrayContaining(['windows','macos','linux','web']))
    expect(hostCallGuide.availablePlatforms).not.toContain('android')
    expect(participantCallGuide.availablePlatforms).toEqual(expect.arrayContaining(['windows','macos','linux','android','ios','web']))
  })
})
