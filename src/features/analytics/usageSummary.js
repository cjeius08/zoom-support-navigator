export const PRESENCE_STALE_MS = 2 * 60 * 1000
export const PRESENCE_IDLE_MS = 5 * 60 * 1000

function parseTime(value) {
  const parsed = value ? Date.parse(value) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

export function derivePresenceState(presence, nowMs = Date.now()) {
  if (!presence || presence.state === 'offline') return 'offline'
  const heartbeat = parseTime(presence.last_heartbeat)
  if (heartbeat === null || nowMs - heartbeat > PRESENCE_STALE_MS) return 'offline'
  const interaction = parseTime(presence.last_interaction)
  if (interaction === null || nowMs - interaction > PRESENCE_IDLE_MS) return 'idle'
  return 'active'
}

function localDayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function dateRangeForPeriod(period, { customStart = '', customEnd = '', now = new Date() } = {}) {
  let start
  let end

  if (period === 'weekly') {
    start = localDayStart(now)
    const mondayOffset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - mondayOffset)
    end = new Date(start)
    end.setDate(end.getDate() + 7)
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  } else if (period === 'custom' && customStart && customEnd) {
    start = new Date(`${customStart}T00:00:00`)
    end = new Date(`${customEnd}T00:00:00`)
    end.setDate(end.getDate() + 1)
  } else {
    start = localDayStart(now)
    end = new Date(start)
    end.setDate(end.getDate() + 1)
  }

  return { start: start.toISOString(), end: end.toISOString() }
}

function topValue(items, key) {
  const counts = new Map()
  items.forEach(item => {
    const value = item[key]
    if (!value) return
    counts.set(value, (counts.get(value) || 0) + 1)
  })
  let winner = null
  let count = 0
  counts.forEach((valueCount, value) => {
    if (valueCount > count) {
      winner = value
      count = valueCount
    }
  })
  return winner
}

function withinRange(value, startMs, endMs) {
  const time = parseTime(value)
  return time !== null && time >= startMs && time < endMs
}

function sessionOverlaps(session, startMs, endMs) {
  const started = parseTime(session.started_at)
  const ended = parseTime(session.ended_at)
  return started !== null && started < endMs && (ended === null || ended >= startMs)
}

export function buildUsageSummary({
  profiles = [],
  events = [],
  sessions = [],
  presence = [],
  start,
  end,
  nowMs = Date.now(),
}) {
  const startMs = parseTime(start) ?? 0
  const endMs = parseTime(end) ?? Number.MAX_SAFE_INTEGER
  const filteredEvents = events.filter(event => withinRange(event.created_at, startMs, endMs))
  const filteredSessions = sessions.filter(session => sessionOverlaps(session, startMs, endMs))
  const presenceByUser = new Map(presence.map(item => [item.user_id, item]))

  const users = profiles.map(profile => {
    const userEvents = filteredEvents.filter(event => event.user_id === profile.id)
    const userSessions = filteredSessions.filter(session => session.user_id === profile.id)
    const activeSeconds = userSessions.reduce((total, session) => total + Math.max(0, Number(session.active_seconds) || 0), 0)

    return {
      ...profile,
      presence: derivePresenceState(presenceByUser.get(profile.id), nowMs),
      activeSeconds,
      sessions: userSessions.length,
      events: userEvents.length,
      topProcess: topValue(userEvents, 'process_id'),
      topCategory: topValue(userEvents, 'category_id'),
      topTool: topValue(userEvents, 'tool_id'),
    }
  })

  return {
    totalUsers: users.length,
    active: users.filter(user => user.presence === 'active').length,
    idle: users.filter(user => user.presence === 'idle').length,
    offline: users.filter(user => user.presence === 'offline').length,
    activeSeconds: users.reduce((total, user) => total + user.activeSeconds, 0),
    eventCount: filteredEvents.length,
    users,
  }
}

export function formatActiveDuration(seconds) {
  const totalMinutes = Math.floor((Number(seconds) || 0) / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
