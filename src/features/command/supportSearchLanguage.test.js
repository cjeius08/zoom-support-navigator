import { describe, expect, it } from 'vitest'
import { normalizeSupportQuery } from './supportSearchLanguage'
import { approvedQuickAnswer } from '../navigator/answerFirst'

describe('safe conversational / Taglish search normalization', () => {
  it.each([
    ['pano download transcript', 'download transcript'],
    ['di nila ako marinig', 'cant hear me'],
    ['di ko marinig yung arbitrator', 'cant hear anyone arbitrator'],
    ['hindi makapasok sa hearing', 'cant join hearing'],
    ['no host controls', 'no host controls'],
    ['recording during breaks', 'recording during breaks'],
  ])('normalizes %s without changing policy meaning', (phrase, expected) => {
    expect(normalizeSupportQuery(phrase)).toBe(expected)
  })

  it('keeps speaker vs microphone answers correctly separated', () => {
    const mic = approvedQuickAnswer(normalizeSupportQuery('di nila ako marinig'), {role:'Participant'})
    const speaker = approvedQuickAnswer(normalizeSupportQuery('di ko marinig yung arbitrator'), {role:'Participant'})
    expect(mic?.id).toBe('participant-mic-first-check')
    expect(speaker?.id).toBe('participant-speaker-check')
  })

  it('does not invent answers for unverified caller requests', () => {
    expect(approvedQuickAnswer(normalizeSupportQuery('pano download transcript'), {role:'Host'})).toBeNull()
  })
})
