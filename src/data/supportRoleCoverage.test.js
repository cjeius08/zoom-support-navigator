import { describe, expect, it } from 'vitest'
import { COMMON_ISSUE_ROUTES } from '../features/navigator/commonIssueRoutes'
import { PROCESSES } from './processes'
import {
  COMMON_ISSUE_ROLE_COVERAGE,
  PROCESS_ROLE_COVERAGE,
  ROADBLOCK_ROLE_COVERAGE,
} from './supportRoleCoverage'

describe('Host / Participant coverage audit', () => {
  it('classifies every current Common Issue before role-aware routing is enabled', () => {
    const audited = new Set(COMMON_ISSUE_ROLE_COVERAGE.map(item => item.id))
    expect(audited.size).toBe(COMMON_ISSUE_ROUTES.length)
    for (const route of COMMON_ISSUE_ROUTES) expect(audited.has(route.id), route.id).toBe(true)
  })

  it('classifies every current Process Guide before role-aware routing is enabled', () => {
    const audited = new Set(PROCESS_ROLE_COVERAGE.map(item => item.id))
    expect(audited.size).toBe(PROCESSES.length)
    for (const process of PROCESSES) expect(audited.has(process.id), process.id).toBe(true)
  })

  it('keeps all approved roadblocks searchable and available as an immediate exit', () => {
    expect(ROADBLOCK_ROLE_COVERAGE.length).toBeGreaterThan(0)
    for (const roadblock of ROADBLOCK_ROLE_COVERAGE) {
      expect(roadblock.searchable, roadblock.label).toBe(true)
      expect(roadblock.immediateExitAllowed, roadblock.label).toBe(true)
    }
  })

  it('does not silently promote specialized multiple-input-channel guidance into Host basic support', () => {
    const issue = COMMON_ISSUE_ROLE_COVERAGE.find(item => item.id === 'multiple-audio-input-channels')
    expect(issue?.classification).toBe('review-gap')
    expect(issue?.reviewReason).toMatch(/specialized Zoom audio feature/i)
  })
})
