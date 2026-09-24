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
  expect(data.metadata.updatePolicy).toMatch(/User-facing features/i)
  expect(data.metadata.updatePolicy).toMatch(/Admin-only operational or administrative changes/i)
  expect(data.metadata.updatePolicy).toMatch(/Developer-only work/i)
  expect(data.updates.length).toBeGreaterThanOrEqual(4)
  expect(data.updates[0]).toMatchObject({
    id: 'ozzie-ai-assist-smart-search',
    date: '2026-09-25',
    area: 'Home / Smart Search',
    audience: 'all',
  })
  expect(data.updates[1]).toMatchObject({ id: 'admin-ozzie-ai-reports', audience: 'admin' })
  expect(data.updates[2]).toMatchObject({ id: 'flex-arbitration-zoom-support-greeting', audience: 'all' })
  expect(data.updates[3]).toMatchObject({ id: 'windows-device-sandbox-home-shortcut', audience: 'all' })
  expect(data.updates.slice(4, 7).map(entry => entry.id)).toEqual([
    'process-documents-search-normalization',
    'new-call-session-reset',
    'common-issues-smart-routing',
  ])
  expect(data.updates.map(entry => entry.id)).toEqual(expect.arrayContaining([
    'pilot-readiness-usability-pass',
    'process-documents-knowledge-library',
    'member-saved-notes-followups',
    'admin-saved-notes-management',
    'workspace-page-back-navigation',
  ]))

  data.updates.forEach((entry) => {
    expect(entry.id).toBeTruthy()
    expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(entry.title).toBeTruthy()
    expect(entry.area).toBeTruthy()
    expect(entry.changed).toBeTruthy()
    expect(['all', 'admin']).toContain(entry.audience)
    expect(Array.isArray(entry.checks)).toBe(true)
    if (entry.status === 'historical') {
      expect(entry.checks).toHaveLength(0)
    } else {
      expect(entry.checks.length).toBeGreaterThan(0)
    }
    entry.checks.forEach((check) => expect(check).toBeTruthy())
  })

  const dates = data.updates.map((entry) => entry.date)
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
})


it('keeps the September 23 guided-support changes in the user-facing change log', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const commonIssues = data.updates.find(entry => entry.id === 'common-issues-smart-routing')
  const guidedProcess = data.updates.find(entry => entry.id === 'guided-process-device-troubleshooting')

  expect(commonIssues).toMatchObject({ date: '2026-09-23', audience: 'all', area: 'Common Issues' })
  expect(commonIssues.changed).toMatch(/symptom and device/i)
  expect(guidedProcess).toMatchObject({ date: '2026-09-23', audience: 'all', area: 'Process Guides / Call Guide' })
  expect(guidedProcess.changed).toMatch(/symptom-aware end-of-path routing/i)
})


it('keeps the New Call reset visible as a user-facing safety feature', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'new-call-session-reset')
  expect(entry).toMatchObject({ audience: 'all', area: 'Home / Call Flow', date: '2026-09-23' })
  expect(entry.changed).toMatch(/Saved notes.*not deleted/i)
})


it('lists the Zoom Training Environment shortcut in the user-facing updates', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'windows-device-sandbox-home-shortcut')

  expect(entry).toMatchObject({ date: '2026-09-24', area: 'Home / Training & Resources', audience: 'all' })
  expect(entry.changed).toMatch(/launch only/i)
  expect(entry.changed).toMatch(/actions inside the external training environment are not included/i)
  expect(entry.checks.length).toBeGreaterThan(0)
})


it('lists the Flex Arbitration Zoom Support opening spiel in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'flex-arbitration-zoom-support-greeting')

  expect(entry).toMatchObject({ date: '2026-09-24', area: 'Call Flow / Call Language', audience: 'all' })
  expect(data.updates.findIndex(item => item.id === 'flex-arbitration-zoom-support-greeting')).toBeGreaterThan(0)
  expect(entry.title).toMatch(/Flex Arbitration Zoom Support/i)
  expect(entry.changed).toContain('Thank you for calling Flex Arbitration Zoom Support. This is [Name]. How can I help you today?')
  expect(entry.checks).toEqual(expect.arrayContaining([
    expect.stringMatching(/Call Language.*Opening \/ Greeting/i),
    expect.stringMatching(/Call Flow/i),
  ]))
})
