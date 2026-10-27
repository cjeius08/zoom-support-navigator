import { describe, expect, it } from 'vitest'
import { FAQ_ITEMS } from '../../data/supportReference'
import { routeById } from './commonIssueRoutes'
import { hostTopics } from '../../data/hostExperience'
import { approvedQuickAnswer } from './answerFirst'

describe('approved Answer-First search pilot', () => {
  it('answers unmuted microphone questions using the correct approved next check for each role', () => {
    const text = 'The microphone is unmuted but participants still cannot hear the arbitrator'
    const host = approvedQuickAnswer(text, { role: 'Host' })
    expect(host.id).toBe('host-unmuted-mic')
    expect(host.answer).toBe(hostTopics().find(item => item.id === 'host-audio').steps[1].instruction)
    expect(host.guide).toEqual({ kind: 'host', id: 'host-audio' })

    const participant = approvedQuickAnswer('My microphone is not muted but no one can hear me', { role: 'Participant' })
    expect(participant.id).toBe('participant-unmuted-mic')
    expect(participant.answer).toBe(routeById('cant-be-heard').checks[2].instruction)
    expect(participant.guide).toEqual({ kind: 'route', id: 'cant-be-heard' })
  })

  it('returns a different first check for microphone vs speaker symptoms', () => {
    const mic = approvedQuickAnswer('They cant hear me', { role: 'Participant' })
    const speaker = approvedQuickAnswer('I cant hear anyone', { role: 'Participant' })
    expect(mic.id).toBe('participant-mic-first-check')
    expect(mic.answer).toBe(routeById('cant-be-heard').checks[0].instruction)
    expect(speaker.id).toBe('participant-speaker-check')
    expect(speaker.answer).toBe(routeById('cant-hear').checks[0].instruction)
    expect(mic.answer).not.toBe(speaker.answer)
  })

  it('prioritizes selecting the intended camera when the preview is wrong', () => {
    const text = "Before the hearing, the arbitrator's camera preview shows the wrong camera"
    const host = approvedQuickAnswer(text, { role: 'Host' })
    expect(host.id).toBe('host-wrong-camera')
    expect(host.answer).toBe(hostTopics().find(item => item.id === 'host-camera').steps[0].instruction)

    const participant = approvedQuickAnswer('The camera preview shows the wrong camera', { role: 'Participant' })
    expect(participant.id).toBe('participant-wrong-camera')
    expect(participant.answer).toBe(routeById('camera-not-working').checks[1].instruction)
  })

  it('uses exact approved Host FAQ wording and never exposes it to Participant quick answers', () => {
    const controls = approvedQuickAnswer('Why are my host controls missing?', { role: 'Host' })
    expect(controls.answer).toBe(FAQ_ITEMS.find(item => item.label === 'Host Controls').answer)
    expect(controls.guide).toEqual({ kind: 'host', id: 'host-controls-missing' })
    expect(approvedQuickAnswer('Why are my host controls missing?', { role: 'Participant' })).toBeNull()

    const recording = approvedQuickAnswer('Can I turn off automatic recording?', { role: 'Host' })
    expect(recording.answer).toBe(FAQ_ITEMS.find(item => item.label === 'Recording').answer)
    expect(recording.guide).toEqual({ kind: 'faq', id: 'Recording' })
    expect(approvedQuickAnswer('Can I turn off automatic recording?', { role: 'Participant' })).toBeNull()
  })

  it('does not confuse stopping recording during a break with auto-recording policy', () => {
    expect(approvedQuickAnswer('Can we pause recording during a break?', { role: 'Host' }).confirmation).toMatch(/program-owner confirmation/)
    expect(approvedQuickAnswer('Can we stop recording during a break?', { role: 'Host' }).answer).toMatch(/must remain active/)
  })

  it('asks for the exact join error rather than prescribing an unverified generic fix', () => {
    const answer = approvedQuickAnswer('I cant get into my Zoom meeting', { role: 'Participant' })
    expect(answer.id).toBe('participant-join-diagnostic')
    expect(answer.answer).toBe(routeById('cant-join').confirm[0])
    expect(approvedQuickAnswer('I am stuck in the Waiting Room', { role: 'Participant' })).toBeNull()
  })

  it('returns no confident quick answer for unknown requests or partial input', () => {
    expect(approvedQuickAnswer('xyz', { role: 'Host' })).toBeNull()
    expect(approvedQuickAnswer('Tell me how to change billing settings', { role: 'Host' })).toBeNull()
    expect(approvedQuickAnswer('wrong microphone cable', { role: 'Participant' })).toBeNull()
  })
})
