import { describe, expect, it } from 'vitest'
import { PROCESSES } from '../../data/processes'
import { normalizeSearchText, searchProcesses } from './smartSearch'

function idsFor(query) {
  return searchProcesses(PROCESSES, query).slice(0, 6).map(process => process.id)
}

describe('smart support search', () => {
  it('normalizes case, apostrophes, punctuation, and whitespace', () => {
    expect(normalizeSearchText("  CAN’T   HEAR!!! ")).toBe('cant hear')
    expect(normalizeSearchText("CAN'T HEAR")).toBe('cant hear')
  })

  it('returns suggestions from the first few typed characters', () => {
    expect(searchProcesses(PROCESSES, 's').length).toBeGreaterThan(0)
    expect(searchProcesses(PROCESSES, 'ca').length).toBeGreaterThan(0)
    expect(searchProcesses(PROCESSES, 'mi').length).toBeGreaterThan(0)
  })

  it.each([
    ['cant hear', 'zoom-audio-troubleshooting'],
    ["CAN'T HEAR", 'zoom-audio-troubleshooting'],
    ['CAN’T HEAR', 'zoom-audio-troubleshooting'],
    ['cant hrar', 'zoom-audio-troubleshooting'],
    ['mic not working', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
    ['microphone issue', 'troubleshooting-speaker-or-microphone-issues-in-the-zoom-desktop-app'],
    ['camra not working', 'zoom-camera-troubleshooting-during-a-meeting'],
    ['cant jion', 'troubleshooting-when-you-cant-join-a-zoom-meeting'],
    ['bluetooh', 'using-bluetooth-headphones-with-zoom-on-android-ios'],
    ['screen share', 'sharing-your-screen-desktop-or-content-in-zoom'],
    ['share screen', 'sharing-your-screen-desktop-or-content-in-zoom'],
  ])('finds a useful process for %s', (query, expectedId) => {
    expect(idsFor(query)).toContain(expectedId)
  })

  it('keeps exact title-oriented matches ahead of broader fuzzy matches', () => {
    expect(searchProcesses(PROCESSES, 'bluetooth')[0]?.id).toBe('using-bluetooth-headphones-with-zoom-on-android-ios')
  })

  it('ignores conversational filler without losing the actual symptom', () => {
    expect(idsFor("I can't hear anyone")).toContain('zoom-audio-troubleshooting')
    expect(idsFor('caller cannot hear anybody')).toContain('zoom-audio-troubleshooting')
  })

  it('does not treat the audio verb "hear" as the proceeding word "hearing"', () => {
    const results = searchProcesses(PROCESSES, 'hear').slice(0, 8)
    expect(results.some(process => /audio|speaker|microphone/i.test(process.title))).toBe(true)
    expect(results[0]?.id).not.toBe('zoom-basic-support-boundaries-decision-path-referral-process')
  })

})
