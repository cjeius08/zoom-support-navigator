import { expect, it } from 'vitest'
import { buildGuidedDocumentationPreview } from './guidedDocumentation'

const process = {
  id: 'audio-test',
  title: 'Approved Audio Test Guide',
}

const route = {
  id: 'cant-hear',
  title: 'I can’t hear anyone',
}

const steps = [
  { title: 'Check the selected speaker' },
  { title: 'Run Test Speaker' },
  { title: 'Confirm meeting audio' },
]

it('documents only the steps actually reached before resolution', () => {
  const preview = buildGuidedDocumentationPreview({
    process,
    sourceRoute: route,
    device: 'Windows',
    steps,
    currentStepIndex: 1,
    outcome: 'resolved',
  })

  expect(preview.device).toBe('Windows')
  expect(preview.exactIssue).toBe('I can’t hear anyone')
  expect(preview.stepsResult).toContain('1. Check the selected speaker — Not resolved')
  expect(preview.stepsResult).toContain('2. Run Test Speaker — Resolved')
  expect(preview.stepsResult).not.toContain('Confirm meeting audio')
  expect(preview.outcome).toBe('Resolved')
  expect(preview.meta.attemptedStepCount).toBe(2)
})

it('documents every attempted step as unresolved when the approved path is exhausted', () => {
  const preview = buildGuidedDocumentationPreview({
    process,
    sourceRoute: route,
    device: 'Android',
    steps,
    currentStepIndex: 2,
    outcome: 'exhausted',
  })

  expect(preview.device).toBe('Android')
  expect(preview.stepsResult).toContain('1. Check the selected speaker — Not resolved')
  expect(preview.stepsResult).toContain('2. Run Test Speaker — Not resolved')
  expect(preview.stepsResult).toContain('3. Confirm meeting audio — Not resolved')
  expect(preview.resolutionNextSteps).toMatch(/Next action is not yet selected/i)
  expect(preview.outcome).toBe('')
})

it('does not invent an exact caller symptom when a Process Guide was opened directly', () => {
  const preview = buildGuidedDocumentationPreview({
    process,
    sourceRoute: null,
    device: 'iPhone',
    steps,
    currentStepIndex: 0,
    outcome: 'resolved',
  })

  expect(preview.device).toBe('iPhone / iPad')
  expect(preview.exactIssue).toBe('')
  expect(preview.stepsResult).toContain('Approved guide used: Approved Audio Test Guide')
})

it('does not produce a documentation handoff while troubleshooting is still active', () => {
  expect(buildGuidedDocumentationPreview({
    process,
    sourceRoute: route,
    steps,
    currentStepIndex: 0,
    outcome: 'active',
  })).toBeNull()
})
