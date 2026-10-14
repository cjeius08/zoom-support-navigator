import { derivePresenceState } from './usageSummary'

// Reuse the existing heartbeat (60 s), inactivity (5 min) and stale threshold (2 min).
// One zoom_presence record exists per user, so multiple open tabs cannot inflate the count.
const PAGE_NAMES = {
  navigator: 'Home',
  favorites: 'My Favorites',
  process_documents: 'Process Documents',
  flex_hub: 'Flex Arbitration Hub',
  training: 'Training & Resources',
  updates: "What's New",
  feedback: 'Feedback',
  admin: 'Admin',
  team: 'Team',
  usage: 'Usage Analytics',
  avatar_library: 'Avatar Library',
  saved_notes: 'Saved Notes',
  my_saved_notes: 'My Saved Notes',
  feedback_queue: 'Feedback Queue',
  readiness: 'Readiness Lab',
  reports: 'Reports',
}

export function visitorRole(profile) {
  if (profile?.role === 'creator_admin') return 'Admin'
  if (profile?.workspace_role === 'lead') return 'Lead'
  return 'Agent'
}

export function visitorPage(routeId) {
  return PAGE_NAMES[routeId] || 'Page not available'
}

export function buildLiveVisitorSnapshot({ profiles = [], presence = [], events = [], lastLogins = [], nowMs = Date.now() }) {
  const byUser = new Map(profiles.map(profile => [profile.id, profile]))
  const loginByUser = new Map(lastLogins.map(entry => [entry.user_id, entry.last_sign_in_at]))
  const latestBySession = new Map()
  // The query is descending; only route-view events from the current session are displayed.
  for (const event of events) {
    if (event.event_type && event.event_type !== 'route_view') continue
    const key = event.session_id + ':' + event.user_id
    if (!latestBySession.has(key)) latestBySession.set(key, event.route_id)
  }

  const active = []
  const idle = []
  const seenUsers = new Set()
  for (const row of presence) {
    if (!row?.user_id || seenUsers.has(row.user_id)) continue
    seenUsers.add(row.user_id)
    const state = derivePresenceState(row, nowMs)
    if (state === 'offline') continue
    const profile = byUser.get(row.user_id)
    if (!profile) continue
    const person = {
      id: row.user_id,
      initials: profile.initials || '—',
      username: profile.username || profile.initials || 'Team member',
      role: visitorRole(profile),
      page: visitorPage(latestBySession.get(row.session_id + ':' + row.user_id)),
      state,
      lastInteraction: row.last_interaction,
      lastLoginAt: loginByUser.get(row.user_id) || null,
    }
    ;(state === 'active' ? active : idle).push(person)
  }
  const sort = (a, b) => a.username.localeCompare(b.username)
  return { active: active.sort(sort), idle: idle.sort(sort), activeCount: active.length }
}
