import { describe, expect, it } from 'vitest'
import { buildUsageReport, dateRangeForPeriod } from './usageSummary'

describe('usage report ranges', () => {
  it('uses calendar quarter boundaries and an exclusive next-quarter end', () => {
    expect(dateRangeForPeriod('quarterly', { now: new Date('2026-09-24T15:30:00.000Z') })).toEqual({
      start: '2026-07-01T00:00:00.000Z',
      end: '2026-10-01T00:00:00.000Z',
    })
  })

  it('uses calendar year boundaries', () => {
    expect(dateRangeForPeriod('yearly', { now: new Date('2026-09-24T15:30:00.000Z') })).toEqual({
      start: '2026-01-01T00:00:00.000Z',
      end: '2027-01-01T00:00:00.000Z',
    })
  })
})

describe('detailed usage report', () => {
  const range = {
    start: '2026-09-01T00:00:00.000Z',
    end: '2026-10-01T00:00:00.000Z',
    nowMs: Date.parse('2026-09-24T12:00:00.000Z'),
  }
  const profiles = [
    { id: 'u1', username: 'agent_one', initials: 'AO', workspace_role: 'member' },
    { id: 'u2', username: 'agent_two', initials: 'AT', workspace_role: 'lead' },
  ]
  const events = [
    { user_id: 'u1', session_id: 's2', event_type: 'route_view', route_id: 'navigator', created_at: '2026-09-24T09:00:00.000Z' },
    { user_id: 'u1', session_id: 's2', event_type: 'navigation', route_id: 'navigator', tool_id: 'navigation', created_at: '2026-09-24T09:01:00.000Z' },
    { user_id: 'u1', session_id: 's2', event_type: 'tool_open', route_id: 'navigator', tool_id: 'search', created_at: '2026-09-24T09:02:00.000Z' },
    { user_id: 'u1', session_id: 's1', event_type: 'process_open', route_id: 'navigator', process_id: 'audio', created_at: '2026-09-22T09:00:00.000Z' },
    { user_id: 'u2', session_id: 's3', event_type: 'route_view', route_id: 'training', created_at: '2026-09-24T10:00:00.000Z' },
    { user_id: 'u1', session_id: 's2', event_type: 'tool_open', route_id: 'navigator', tool_id: 'outside-range', created_at: '2026-10-01T00:00:00.000Z' },
  ]
  const sessions = [
    { session_id: 's1', user_id: 'u1', started_at: '2026-08-31T23:00:00.000Z', ended_at: '2026-09-02T01:00:00.000Z', active_seconds: 120 },
    { session_id: 's2', user_id: 'u1', started_at: '2026-09-24T08:55:00.000Z', ended_at: null, active_seconds: 600 },
    { session_id: 's3', user_id: 'u2', started_at: '2026-09-24T09:55:00.000Z', ended_at: null, active_seconds: 300 },
    { session_id: 's4', user_id: 'u2', started_at: '2026-10-01T00:00:00.000Z', ended_at: null, active_seconds: 900 },
  ]
  const presence = [
    { user_id: 'u1', state: 'active', last_heartbeat: '2026-09-24T11:59:00.000Z', last_interaction: '2026-09-24T11:58:00.000Z' },
    { user_id: 'u2', state: 'active', last_heartbeat: '2026-09-24T11:59:00.000Z', last_interaction: '2026-09-24T11:50:00.000Z' },
  ]

  it('counts page views, feature actions, and sessions separately, including sessions that overlap the start boundary', () => {
    const report = buildUsageReport({ profiles, events, sessions, presence, ...range })
    expect(report.eventCount).toBe(5)
    expect(report.pageViews).toBe(2)
    expect(report.featureUsage).toBe(2)
    expect(report.sessionCount).toBe(3)
    expect(report.activeSeconds).toBe(1020)
    expect(report.presenceCounts).toEqual({ active: 1, idle: 1, offline: 0 })
    expect(report.byPage).toEqual([
      { id: 'navigator', count: 1 },
      { id: 'training', count: 1 },
    ])
    expect(report.byFeature).toEqual([
      { id: 'process_open', count: 1 },
      { id: 'search', count: 1 },
    ])
    expect(report.recentActivity[0].userLabel).toBe('agent_two')
  })

  it('applies member, page, and feature filters to historical metrics consistently', () => {
    const report = buildUsageReport({
      profiles, events, sessions, presence, ...range,
      memberId: 'u1', routeId: 'navigator', featureId: 'search',
    })
    expect(report.eventCount).toBe(1)
    expect(report.pageViews).toBe(0)
    expect(report.featureUsage).toBe(1)
    expect(report.sessionCount).toBe(1)
    expect(report.users.map(user => user.id)).toEqual(['u1'])
    expect(report.byFeature).toEqual([{ id: 'search', count: 1 }])
    expect(report.presenceCounts).toEqual({ active: 1, idle: 0, offline: 0 })
  })

  it('labels events whose user profile is missing as unknown without guessing', () => {
    const report = buildUsageReport({
      profiles,
      events: [{ user_id: 'deleted-user', session_id: 'deleted-session', event_type: 'tool_open', tool_id: 'search', created_at: '2026-09-24T11:00:00.000Z' }],
      sessions: [],
      presence: [],
      ...range,
    })
    expect(report.recentActivity[0].userLabel).toBe('Unknown user')
  })
})


describe('usage data integrity signals', () => {
  it('flags event rows without a matching session and excludes stale unended sessions from a later range', () => {
    const report = buildUsageReport({
      profiles: [{ id: 'u1', username: 'agent_one', initials: 'AO' }],
      events: [{
        user_id: 'u1',
        session_id: 'missing-session',
        event_type: 'tool_open',
        tool_id: 'search',
        created_at: '2026-09-24T10:00:00.000Z',
      }],
      sessions: [
        { session_id: 'old-open', user_id: 'u1', started_at: '2026-09-18T08:00:00.000Z', ended_at: null, last_interaction: '2026-09-18T09:00:00.000Z', active_seconds: 300 },
        { session_id: 'current-open', user_id: 'u1', started_at: '2026-09-24T09:00:00.000Z', ended_at: null, last_interaction: '2026-09-24T10:00:00.000Z', active_seconds: 60 },
      ],
      presence: [],
      start: '2026-09-24T00:00:00.000Z',
      end: '2026-09-25T00:00:00.000Z',
      nowMs: Date.parse('2026-09-24T10:01:00.000Z'),
    })

    expect(report.sessionCount).toBe(1)
    expect(report.unendedSessionCount).toBe(1)
    expect(report.unmatchedEventCount).toBe(1)
  })
})
