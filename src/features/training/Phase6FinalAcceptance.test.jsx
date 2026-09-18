import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'
import { READINESS_PARTS } from '../readiness/readinessLabData'
import { TRAINING_ROADMAP_MODULES } from './TrainingRoadmap'
import { READINESS_QUESTION_SETS } from '../../lib/readinessQuestionSets'

it('freezes the completed five-part Readiness Lab inventory', () => {
  expect(READINESS_PARTS).toHaveLength(5)
  expect(READINESS_PARTS.map(part => part.number)).toEqual([1, 2, 3, 4, 5])
  expect(READINESS_PARTS.map(part => part.id)).toEqual([
    'foundation-call-flow',
    'device-navigation',
    'troubleshooting-judgment',
    'scope-referral',
    'live-call-readiness',
  ])
  expect(READINESS_PARTS.every(part => part.status === 'available')).toBe(true)
  expect(READINESS_PARTS.every(part => Boolean(part.questionSetVersion))).toBe(true)
  expect(new Set(READINESS_PARTS.map(part => part.questionSetVersion)).size).toBe(5)
})

it('freezes the five persistent readiness question-set identifiers', () => {
  expect(READINESS_QUESTION_SETS).toEqual({
    generalScenarios: 'zoom_general_scenarios_v1',
    deviceNavigation: 'zoom_device_navigation_v1',
    troubleshootingJudgment: 'zoom_troubleshooting_judgment_v1',
    scopeReferralJudgment: 'zoom_scope_referral_judgment_v1',
    liveCallReadiness: 'zoom_live_call_readiness_v1',
  })
})

it('keeps Readiness Lab open-book without revealing the exact answer location', () => {
  const source = readFileSync(join(cwd(), 'src/features/readiness/ReadinessLab.jsx'), 'utf8')

  expect(source).toContain('Open Training &amp; Resources')
  expect(source).toContain("onOpenResource({ view: 'training' })")
  expect(source).toContain('exact answer location is intentionally not shown')
  expect(source).not.toContain('onOpenResource(question.resourceTarget)')
  expect(source).not.toContain('<strong>{question.locationLabel}</strong>')
})

it('freezes the completed Phase 6 training roadmap state', () => {
  expect(TRAINING_ROADMAP_MODULES).toHaveLength(6)

  const readiness = TRAINING_ROADMAP_MODULES.find(module => module.id === 'readiness-lab')
  expect(readiness).toMatchObject({
    number: 6,
    phase: 'Validate',
    title: 'Readiness Lab',
    status: 'complete',
    statusLabel: 'All 5 parts available',
  })

  expect(TRAINING_ROADMAP_MODULES.filter(module => module.status === 'partial')).toHaveLength(0)
})

it('keeps JA reporting wired to all five readiness parts', () => {
  const source = readFileSync(join(cwd(), 'src/lib/adminApi.js'), 'utf8')

  expect(source).toContain('READINESS_QUESTION_SETS.generalScenarios')
  expect(source).toContain('READINESS_QUESTION_SETS.deviceNavigation')
  expect(source).toContain('READINESS_QUESTION_SETS.troubleshootingJudgment')
  expect(source).toContain('READINESS_QUESTION_SETS.scopeReferralJudgment')
  expect(source).toContain('READINESS_QUESTION_SETS.liveCallReadiness')

  expect(source).toContain("number: 1, title: 'General Zoom Scenarios'")
  expect(source).toContain("number: 2, title: 'Device & Navigation Awareness'")
  expect(source).toContain("number: 3, title: 'Troubleshooting Judgment'")
  expect(source).toContain("number: 4, title: 'Scope & Referral Judgment'")
  expect(source).toContain("number: 5, title: 'Live Call Readiness'")
})

it('keeps all five readiness question migrations recorded in the repository', () => {
  const migrationFiles = [
    '20260918223800_zoom_readiness_part1_general_scenarios_baseline.sql',
    '20260918211600_zoom_readiness_part2_device_navigation.sql',
    '20260918215700_zoom_readiness_part3_troubleshooting_judgment.sql',
    '20260918220700_zoom_readiness_part4_scope_referral_judgment.sql',
    '20260918223300_zoom_readiness_part5_live_call.sql',
  ]

  const combined = migrationFiles
    .map(file => readFileSync(join(cwd(), 'supabase/migrations', file), 'utf8'))
    .join('\n')

  expect(combined).toContain('zoom_general_scenarios_v1')
  expect(combined).toContain('zoom_device_navigation_v1')
  expect(combined).toContain('zoom_troubleshooting_judgment_v1')
  expect(combined).toContain('zoom_scope_referral_judgment_v1')
  expect(combined).toContain('zoom_live_call_readiness_v1')
})
