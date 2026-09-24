import { expect, it } from 'vitest'
import {
  OGLETREE_CALL_FLOW_SOURCE,
  OGLETREE_CALL_FLOW_STEPS,
  OGLETREE_IDENTIFICATION_ITEMS,
  OGLETREE_PROBING_PROMPTS,
  OGLETREE_RESOLUTION_BRANCH,
  OGLETREE_SIMPLE_AGENT_FORMULA,
} from './ogletreeCallFlow'

it('locks the September 19 Ogletree Tier 1 call-flow source', () => {
  expect(OGLETREE_CALL_FLOW_SOURCE).toMatchObject({
    title: expect.stringMatching(/Ogletree.*Tier 1 Zoom Support.*Standard Call Flow Outline/i),
    verifiedAt: 'September 19, 2026',
  })

  expect(OGLETREE_CALL_FLOW_STEPS.map(step => step.id)).toEqual([
    'opening',
    'listen',
    'empathy',
    'assurance',
    'identify',
    'probe',
    'troubleshoot',
    'confirm',
    'recap',
    'final-check',
    'closing',
  ])
  expect(OGLETREE_CALL_FLOW_STEPS).toHaveLength(11)
  expect(OGLETREE_CALL_FLOW_STEPS[0]).toMatchObject({
    id: 'opening',
    name: 'Opening / Greeting',
    script: 'Thank you for calling Flex Arbitration Zoom Support. This is [Name]. How can I help you today?',
  })

  expect(OGLETREE_SIMPLE_AGENT_FORMULA).toEqual([
    'Greet',
    'Listen',
    'Empathize',
    'Assure',
    'Probe',
    'Troubleshoot',
    'Confirm',
    'Close',
  ])
})

it('keeps hearing status and caller impact inside early identification', () => {
  expect(OGLETREE_IDENTIFICATION_ITEMS).toEqual(expect.arrayContaining([
    'Caller name',
    'Device being used',
    'Zoom application or browser',
    'Whether the hearing has already started',
    'Whether other participants are affected',
  ]))
  expect(OGLETREE_PROBING_PROMPTS[0]).toMatch(/what you’re experiencing/i)
  expect(OGLETREE_PROBING_PROMPTS).toEqual(expect.arrayContaining([
    'Can you hear the other participants?',
    'Can they hear you?',
    'Is your camera showing an image?',
  ]))
})

it('preserves both resolution branches while keeping the current referral guardrail explicit', () => {
  expect(OGLETREE_RESOLUTION_BRANCH.resolved.path).toEqual(['Recap', 'Final Check', 'Closing'])
  expect(OGLETREE_RESOLUTION_BRANCH.unresolved.path).toEqual([
    'Explain Next Step',
    'Escalate / Document',
    'Recap',
    'Closing',
  ])
  expect(OGLETREE_RESOLUTION_BRANCH.boundaryNote).toMatch(/Scope Check \/ referral guidance/i)
  expect(OGLETREE_RESOLUTION_BRANCH.boundaryNote).toMatch(/do not promise a handoff/i)
})
