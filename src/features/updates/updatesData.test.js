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
  // New releases can be prepended without invalidating historical entries.
  // Keep the newest announcements visible, while verifying the earlier
  // sequence and all previous records are still preserved.
  expect(data.updates.slice(0, 4)).toEqual([
    expect.objectContaining({ id: 'batch-13-answer-first-and-compact-callflow-classic-fallback', date: '2026-10-19', audience: 'all' }),
    expect.objectContaining({ id: 'batch-12-official-brand-login-and-release-quality', date: '2026-10-16', audience: 'all' }),
    expect.objectContaining({ id: 'batch-11-searchable-updates-and-dashboard-release-links', date: '2026-10-16', audience: 'all' }),
    expect.objectContaining({ id: 'batch-10-global-command-center', date: '2026-10-16', audience: 'all' }),
  ])
  expect(data.updates.slice(4, 7)).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'ozzie-workspace-complete-uiux-revamp', date: '2026-10-16', audience: 'all' }),
    expect.objectContaining({ id: 'ozzie-dashboard-home-experience-refresh', date: '2026-10-16', audience: 'all' }),
    expect.objectContaining({ id: 'ozzie-navigation-accessibility-polish', date: '2026-10-16', audience: 'all' }),
  ]))
  const establishedHistory = [
    'ozzie-2-day-night-modes',
    'admin-home-live-visitors',
    'flex-hub-source-import-process-documents',
    'flex-hub-agent-reference-videos',
    'meeting-breakout-room-process-guides',
    'smart-search-relevance-hardening',
    'common-issue-scripts-process-roadblocks',
    'troubleshooting-back-navigation',
    'host-arbitrator-guided-support',
    'host-roadblocks-referral-alignment',
    'faq-roadblock-matrix-support-reference',
    'flex-arbitration-zoom-support-greeting',
    'windows-device-sandbox-home-shortcut',
    'process-documents-search-normalization',
    'new-call-session-reset',
    'common-issues-smart-routing',
  ]
  const historicalIds = data.updates.map(entry => entry.id)
  const historicalIndexes = establishedHistory.map(id => historicalIds.indexOf(id))
  expect(historicalIndexes.every(index => index >= 0)).toBe(true)
  expect(historicalIndexes).toEqual([...historicalIndexes].sort((a, b) => a - b))
  expect(data.updates.find(entry => entry.id === 'ozzie-2-day-night-modes'))
    .toMatchObject({ date: '2026-10-15', audience: 'all' })
  expect(data.updates.find(entry => entry.id === 'admin-home-live-visitors'))
    .toMatchObject({ date: '2026-10-15', audience: 'admin' })
  expect(data.updates.find(entry => entry.id === 'flex-hub-source-import-process-documents'))
    .toMatchObject({ date: '2026-10-14', audience: 'all' })
  expect(data.updates.find(entry => entry.id === 'flex-hub-agent-reference-videos'))
    .toMatchObject({ date: '2026-10-14', audience: 'all' })
  expect(data.updates.find(entry => entry.id === 'meeting-breakout-room-process-guides'))
    .toMatchObject({ date: '2026-10-14', audience: 'all' })
  expect(data.updates.find(entry => entry.id === 'smart-search-relevance-hardening'))
    .toMatchObject({ date: '2026-09-26', audience: 'all' })
  expect(data.updates.find(entry => entry.id === 'faq-roadblock-matrix-support-reference'))
    .toMatchObject({
      date: '2026-09-25',
      area: 'Home / Agent Reference',
      audience: 'all',
      status: 'historical',
    })
  expect(data.updates.map(entry => entry.id)).toEqual(expect.arrayContaining([
    'troubleshooting-back-navigation',
    'host-arbitrator-guided-support',
    'host-roadblocks-referral-alignment',
    'faq-roadblock-matrix-support-reference',
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


it('keeps the initial September 25 FAQ and Roadblock Matrix entry as historical after the September 26 revision', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'faq-roadblock-matrix-support-reference')

  expect(entry).toMatchObject({ date: '2026-09-25', area: 'Home / Agent Reference', audience: 'all', status: 'historical' })
  expect(entry.changed).toMatch(/Roadblock Matrix/i)
  expect(entry.changed).toMatch(/revised on September 26/i)
  expect(entry.checks).toHaveLength(0)
})

it('lists the September 26 Host / Arbitrator support rebuild in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'host-arbitrator-guided-support')

  expect(entry).toMatchObject({ date: '2026-09-26', area: 'Home / Host & Arbitrator Support', audience: 'all' })
  expect(entry.changed).toMatch(/Host \/ Arbitrator is now the default caller role/i)
  expect(entry.changed).toMatch(/Participant experience remains available/i)
  expect(entry.changed).toMatch(/confirmation-first guided troubleshooting/i)
  expect(entry.checks.length).toBeGreaterThanOrEqual(5)
})

it('lists the September 26 roadblock and referral alignment in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'host-roadblocks-referral-alignment')

  expect(entry).toMatchObject({ date: '2026-09-26', area: 'Home / Roadblocks & Escalation', audience: 'all' })
  expect(entry.changed).toMatch(/Alaga escalation path/i)
  expect(entry.changed).toMatch(/welcome-email credential contact/i)
  expect(entry.changed).toMatch(/network\/firewall\/VPN/i)
  expect(entry.checks.length).toBeGreaterThanOrEqual(5)
})

it('lists the September 26 troubleshooting Back navigation in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'troubleshooting-back-navigation')

  expect(entry).toMatchObject({ date: '2026-09-26', area: 'Home / Troubleshooting Navigation', audience: 'all' })
  expect(entry.changed).toMatch(/persistent ← Back control/i)
  expect(entry.changed).toMatch(/recover from a misclick/i)
  expect(entry.changed).toMatch(/Tier 1 roadblocks/i)
  expect(entry.checks.length).toBeGreaterThanOrEqual(5)
})


it('lists the September 26 Common Issue scripts and Process roadblock guidance in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'common-issue-scripts-process-roadblocks')

  expect(entry).toMatchObject({ date: '2026-09-26', area: 'Common Issues / Process Guides', audience: 'all' })
  expect(entry.changed).toMatch(/Suggested Agent Script/i)
  expect(entry.changed).toMatch(/official Zoom Support article/i)
  expect(entry.changed).toMatch(/possible Tier 1 roadblocks/i)
  expect(entry.changed).toMatch(/does not select a roadblock automatically/i)
  expect(entry.checks.length).toBeGreaterThanOrEqual(5)
})


it('lists the September 26 Smart Search safety fix in What’s New', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const entry = data.updates.find(item => item.id === 'smart-search-relevance-hardening')

  expect(entry).toMatchObject({ date: '2026-09-26', area: 'Home / Smart Search', audience: 'all' })
  expect(entry.changed).toMatch(/unrelated troubleshooting or roadblock results/i)
  expect(entry.changed).toMatch(/hear.*hearing/i)
  expect(entry.changed).toMatch(/every meaningful symptom term/i)
  expect(entry.checks.length).toBeGreaterThanOrEqual(5)
})

it('publishes Batch 10 and Batch 11 to both Member and Admin update feeds without duplicates', () => {
  const path = join(cwd(), 'src/features/updates/updatesData.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const ids = data.updates.map(item => item.id)
  expect(new Set(ids).size).toBe(ids.length)
  for (const id of [
    'batch-10-global-command-center',
    'batch-11-searchable-updates-and-dashboard-release-links',
  ]) {
    const entry = data.updates.find(item => item.id === id)
    expect(entry).toMatchObject({ date: '2026-10-16', audience: 'all' })
    expect(entry.changed.length).toBeGreaterThan(100)
    expect(entry.checks.length).toBeGreaterThanOrEqual(3)
    expect(ids.indexOf(id)).toBeLessThan(5)
  }
  expect(data.updates.find(item => item.id === 'batch-10-global-command-center').changed)
    .toMatch(/Ctrl\+K/)
  expect(data.updates.find(item => item.id === 'batch-11-searchable-updates-and-dashboard-release-links').changed)
    .toMatch(/release history/i)
})

it('keeps Batch 12 user-facing login and branding announcements visible', () => {
  const data = JSON.parse(readFileSync(join(cwd(), 'src/features/updates/updatesData.json'), 'utf8'))
  const entry = data.updates.find(item => item.id === 'batch-12-official-brand-login-and-release-quality')
  expect(entry).toMatchObject({ audience: 'all', date: '2026-10-16' })
  expect(entry.changed).toMatch(/Username and Password/i)
  expect(entry.changed).toMatch(/FOR OGLETREE/i)
  expect(entry.checks.some(check => /Sign In/.test(check))).toBe(true)
})
