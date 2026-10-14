import { describe, expect, it } from 'vitest'
import { buildLiveVisitorSnapshot, visitorPage, visitorRole } from './liveVisitorsData'

const now = Date.parse('2026-10-15T00:00:00.000Z')
const iso = millis => new Date(now - millis).toISOString()
const profiles = [
  { id: 'one', username: 'Jon', initials: 'JA', role: 'agent', workspace_role: 'member' },
  { id: 'two', username: 'Lead', initials: 'LL', role: 'agent', workspace_role: 'lead' },
  { id: 'three', username: 'Admin', initials: 'AD', role: 'creator_admin' },
]
const presence = [
  { user_id: 'one', session_id: 's1', state: 'active', last_heartbeat: iso(20_000), last_interaction: iso(10_000) },
  { user_id: 'two', session_id: 's2', state: 'active', last_heartbeat: iso(20_000), last_interaction: iso(350_000) },
  { user_id: 'three', session_id: 's3', state: 'active', last_heartbeat: iso(250_000), last_interaction: iso(5_000) },
]
describe('admin live visitors snapshot', () => {
  it('counts distinct recent active users and moves idle or stale to separate states', () => {
    const result = buildLiveVisitorSnapshot({ profiles, presence: [...presence, presence[0]], nowMs: now })
    expect(result.activeCount).toBe(1)
    expect(result.active.map(x => x.id)).toEqual(['one'])
    expect(result.idle.map(x => x.id)).toEqual(['two'])
  })
  it('shows role and latest route from the current session only', () => {
    const events = [
      { user_id: 'one', session_id: 's1', route_id: 'navigator' },
      { user_id: 'one', session_id: 'stale-session', route_id: 'admin' },
      { user_id: 'two', session_id: 's2', route_id: 'training' },
    ]
    const result = buildLiveVisitorSnapshot({ profiles, presence, events, nowMs: now })
    expect(result.active[0]).toMatchObject({ initials: 'JA', role: 'Agent', page: 'Home' })
    expect(result.idle[0]).toMatchObject({ role: 'Lead', page: 'Training & Resources' })
    expect(visitorPage('not-a-route')).toBe('Page not available')
    expect(visitorRole(profiles[2])).toBe('Admin')
  })
  it('does not count offline presence or phantom users', () => {
    const result = buildLiveVisitorSnapshot({profiles, presence:[{...presence[0],state:'offline'}, {user_id:'unknown',session_id:'x',state:'active',last_heartbeat:iso(0),last_interaction:iso(0)}], nowMs:now})
    expect(result.activeCount).toBe(0)
  })
})
