import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

it('keeps workspace metadata and update history complete and newest-first', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  expect(existsSync(path)).toBe(true)

  const data = JSON.parse(readFileSync(path, 'utf8'))
  expect(data.metadata).toMatchObject({
    version: '1.0',
    effectiveDate: '2026-09-18',
    owner: 'Cjei A.',
    collaborator: 'Nina F.',
    nextReview: '2026-10-18',
  })
  expect(data.metadata.updatePolicy).toMatch(/Every shipped user-facing feature/i)
  expect(data.updates.length).toBeGreaterThanOrEqual(4)
  expect(data.updates[0].date).toBe('2026-09-19')
  expect(data.updates.slice(0, 22).map(entry => entry.id)).toEqual([
    'readiness-resume-remaining-count',
    'avatar-selected-indicator',
    'avatar-persistence-polish',
    'phase6-readiness-lab-part5-live-call',
    'phase6-readiness-lab-part4-scope-referral',
    'phase6-readiness-lab-part3-troubleshooting',
    'readiness-resource-discovery',
    'phase6-readiness-lab-part2-device-navigation',
    'readiness-persistent-attempt-history',
    'phase6-readiness-lab-part1',
    'ogletree-call-flow-alignment',
    'ogletree-support-workspace-rebrand',
    'phase6-guided-visual-lessons',
    'phase6-training-roadmap',
    'phase5-referral-handoff',
    'phase5-scope-check',
    'global-documentation-dock',
    'phase5-documentation-workspace',
    'interactive-guided-discovery',
    'phase4-scenario-expansion',
    'global-report-context',
    'updates-release-policy',
  ])

  data.updates.forEach((entry) => {
    expect(entry.id).toBeTruthy()
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(entry.title).toBeTruthy()
    expect(entry.area).toBeTruthy()
    expect(entry.changed).toBeTruthy()
    expect(Array.isArray(entry.checks)).toBe(true)
    expect(entry.checks.length).toBeGreaterThan(0)
    entry.checks.forEach((check) => expect(check).toBeTruthy())
  })

  const dates = data.updates.map((entry) => entry.date)
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
})
