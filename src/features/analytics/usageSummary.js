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
  } else if (period === 'quarterly') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
    start = new Date(now.getFullYear(), quarterStartMonth, 1)
    end = new Date(now.getFullYear(), quarterStartMonth + 3, 1)
  } else if (period === 'yearly') {
    start = new Date(now.getFullYear(), 0, 1)
    end = new Date(now.getFullYear() + 1, 0, 1)
  } else if (period === 'custom') {
    if (!customStart || !customEnd || customStart > customEnd) return { start: '', end: '' }
    start = new Date(`${customStart}T00:00:00`)
    end = new Date(`${customEnd}T00:00:00`)
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return { start: '', end: '' }
    end.setDate(end.getDate() + 1)
  } else {
    start = localDayStart(now)
    end = new Date(start)
    end.setDate(end.getDate() + 1)
  }

  return { start: start.toISOString(), end: end.toISOString() }
}

function withinRange(value, startMs, endMs) {
  const time = parseTime(value)
  return time !== null && time >= startMs && time < endMs
}

export function sessionOverlapsRange(session, startMs, endMs) {
  const started = parseTime(session.started_at)
  const ended = parseTime(session.ended_at) ?? parseTime(session.last_interaction)
  return started !== null && ended !== null && started < endMs && ended >= startMs
}

function eventMatchesFeature(event, featureId) {
  if (!featureId) return true
  if (featureId.startsWith('tool:')) return event.tool_id === featureId.slice(5)
  if (featureId.startsWith('event:')) return event.event_type === featureId.slice(6)
  return event.tool_id === featureId || event.event_type === featureId
}

function eventFeatureId(event) {
  return event.tool_id || event.event_type || ''
}

function orderedCounts(counts) {
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
}

function timeBucketSettings(period, startMs, endMs) {
  if (period === 'daily') return 'hour'
  if (period === 'weekly' || period === 'monthly') return 'day'
  if (period === 'quarterly') return 'week'
  if (period === 'yearly') return 'month'
  const days = (endMs - startMs) / (24 * 60 * 60 * 1000)
  if (days <= 2) return 'hour'
  if (days <= 45) return 'day'
  if (days <= 200) return 'week'
  return 'month'
}

function advanceBucket(date, unit) {
  const next = new Date(date)
  if (unit === 'hour') next.setHours(next.getHours() + 1)
  else if (unit === 'day') next.setDate(next.getDate() + 1)
  else if (unit === 'week') next.setDate(next.getDate() + 7)
  else next.setMonth(next.getMonth() + 1)
  return next
}

function bucketLabel(date, unit) {
  if (unit === 'hour') return date.toLocaleTimeString([], { hour: 'numeric' })
  if (unit === 'day') return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  if (unit === 'week') return `Week of ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
  return date.toLocaleDateString([], { month: 'short', year: 'numeric' })
}

function buildActivityBuckets(events, startMs, endMs, period) {
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs >= endMs) return []
  const unit = timeBucketSettings(period, startMs, endMs)
  const first = new Date(startMs)
  if (unit === 'hour') first.setMinutes(0, 0, 0)
  else if (unit === 'day' || unit === 'week') {
    first.setHours(0, 0, 0, 0)
    if (unit === 'week') first.setDate(first.getDate() - ((first.getDay() + 6) % 7))
  } else {
    first.setDate(1)
    first.setHours(0, 0, 0, 0)
  }

  const buckets = []
  let cursor = first
  for (let index = 0; cursor.getTime() < endMs && index < 500; index += 1) {
    const next = advanceBucket(cursor, unit)
    const bucketStart = Math.max(cursor.getTime(), startMs)
    const bucketEnd = Math.min(next.getTime(), endMs)
    buckets.push({
      id: String(bucketStart),
      startMs: bucketStart,
      endMs: bucketEnd,
      start: new Date(bucketStart).toISOString(),
      end: new Date(bucketEnd).toISOString(),
      label: bucketLabel(cursor, unit),
      count: 0,
    })
    cursor = next
  }
  events.forEach(event => {
    const time = parseTime(event.created_at)
    if (time === null) return
    let low = 0
    let high = buckets.length - 1
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      const bucket = buckets[middle]
      if (time < bucket.startMs) high = middle - 1
      else if (time >= bucket.endMs) low = middle + 1
      else {
        bucket.count += 1
        break
      }
    }
  })
  return buckets.map(({ startMs: bucketStart, endMs: bucketEnd, ...bucket }) => ({ ...bucket, start: new Date(bucketStart).toISOString(), end: new Date(bucketEnd).toISOString() }))
}

export function buildUsageReport({
  profiles = [],
  events = [],
  sessions = [],
  presence = [],
  start,
  end,
  nowMs = Date.now(),
  memberId = '',
  routeId = '',
  featureId = '',
  period = 'custom',
}) {
  const startMs = parseTime(start) ?? Number.NEGATIVE_INFINITY
  const endMs = parseTime(end) ?? Number.POSITIVE_INFINITY
  const filteredEvents = events.filter(event =>
    withinRange(event.created_at, startMs, endMs)
    && (!memberId || event.user_id === memberId)
    && (!routeId || event.route_id === routeId)
    && eventMatchesFeature(event, featureId),
  )
  const matchedSessionIds = new Set(filteredEvents.map(event => event.session_id).filter(Boolean))
  const hasActivityFilter = Boolean(routeId || featureId)
  const filteredSessions = sessions.filter(session =>
    sessionOverlapsRange(session, startMs, endMs)
    && (!memberId || session.user_id === memberId)
    && (!hasActivityFilter || matchedSessionIds.has(session.session_id)),
  )

  const eventsByUser = new Map()
  filteredEvents.forEach(event => {
    const items = eventsByUser.get(event.user_id) || []
    items.push(event)
    eventsByUser.set(event.user_id, items)
  })
  const sessionsByUser = new Map()
  filteredSessions.forEach(session => {
    const items = sessionsByUser.get(session.user_id) || []
    items.push(session)
    sessionsByUser.set(session.user_id, items)
  })

  const profileById = new Map(profiles.map(profile => [profile.id, profile]))
  const livePresence = new Map(presence.map(item => [item.user_id, item]))
  const activeIds = new Set([...eventsByUser.keys(), ...sessionsByUser.keys()])
  const sessionKeys = new Set(filteredSessions.map(session => `${session.user_id}:${session.session_id}`))
  const unmatchedEventCount = filteredEvents.filter(event =>
    !event.session_id || !sessionKeys.has(`${event.user_id}:${event.session_id}`),
  ).length
  const unendedSessionCount = filteredSessions.filter(session => !session.ended_at).length
  const visibleProfiles = profiles.filter(profile => {
    if (memberId && profile.id !== memberId) return false
    if (hasActivityFilter && !activeIds.has(profile.id)) return false
    return true
  })

  const users = visibleProfiles.map(profile => {
    const userEvents = eventsByUser.get(profile.id) || []
    const userSessions = sessionsByUser.get(profile.id) || []
    const userPresence = livePresence.get(profile.id)
    const activeSeconds = userSessions.reduce(
      (total, session) => total + Math.max(0, Number(session.active_seconds) || 0),
      0,
    )
    const featureEvents = userEvents.filter(event => event.event_type !== 'route_view' && event.event_type !== 'navigation')

    return {
      ...profile,
      presence: derivePresenceState(userPresence, nowMs),
      presenceLastInteraction: userPresence?.last_interaction || null,
      activeSeconds,
      sessions: userSessions.length,
      events: userEvents.length,
      pageViews: userEvents.filter(event => event.event_type === 'route_view').length,
      featureUsage: featureEvents.length,
      topProcess: topValue(userEvents, 'process_id'),
      topCategory: topValue(userEvents, 'category_id'),
      topTool: topValue(featureEvents, 'tool_id'),
    }
  })

  const featureEvents = filteredEvents.filter(event => event.event_type !== 'route_view' && event.event_type !== 'navigation')
  const pageCounts = new Map()
  filteredEvents.forEach(event => {
    if (event.event_type !== 'route_view' || !event.route_id) return
    pageCounts.set(event.route_id, (pageCounts.get(event.route_id) || 0) + 1)
  })
  const featureCounts = new Map()
  featureEvents.forEach(event => {
    const id = eventFeatureId(event)
    if (id) featureCounts.set(id, (featureCounts.get(id) || 0) + 1)
  })
  const recentActivity = [...filteredEvents]
    .sort((a, b) => (parseTime(b.created_at) || 0) - (parseTime(a.created_at) || 0))
    .slice(0, 30)
    .map(event => {
      const profile = profileById.get(event.user_id)
      return {
        ...event,
        userLabel: profile?.username || profile?.initials || 'Unknown user',
        userRole: profile ? (profile.role === 'creator_admin' ? 'Admin' : profile.workspace_role === 'lead' ? 'Lead' : 'Member') : 'Unknown',
        actionLabel: String(event.event_type || 'unknown').replaceAll('_', ' '),
        featureLabel: event.tool_id || event.process_id || event.category_id || '—',
      }
    })

  const eventTimes = filteredEvents.map(event => parseTime(event.created_at)).filter(Number.isFinite)
  const startForChart = Number.isFinite(startMs)
    ? startMs
    : eventTimes.reduce((minimum, time) => Math.min(minimum, time), Number.POSITIVE_INFINITY)
  const endForChart = Number.isFinite(endMs)
    ? endMs
    : eventTimes.reduce((maximum, time) => Math.max(maximum, time), Number.NEGATIVE_INFINITY) + 1
  const activityBuckets = Number.isFinite(startForChart) && Number.isFinite(endForChart)
    ? buildActivityBuckets(filteredEvents, startForChart, endForChart, period)
    : []
  const presenceCounts = {
    active: users.filter(user => user.presence === 'active').length,
    idle: users.filter(user => user.presence === 'idle').length,
    offline: users.filter(user => user.presence === 'offline').length,
  }
  const latestEventMs = filteredEvents.reduce((latest, event) => Math.max(latest, parseTime(event.created_at) || 0), 0)
  const activeTimeNote = 'Active seconds are stored as whole-session totals. Sessions overlapping this date range are included in full, so this total can include active time outside the selected dates.'

  return {
    totalUsers: users.length,
    active: presenceCounts.active,
    idle: presenceCounts.idle,
    offline: presenceCounts.offline,
    activeSeconds: users.reduce((total, user) => total + user.activeSeconds, 0),
    activeTimeNote,
    eventCount: filteredEvents.length,
    pageViews: filteredEvents.filter(event => event.event_type === 'route_view').length,
    featureUsage: featureEvents.length,
    sessionCount: filteredSessions.length,
    unmatchedEventCount,
    unendedSessionCount,
    latestEventAt: latestEventMs ? new Date(latestEventMs).toISOString() : null,
    activityBuckets,
    byPage: orderedCounts(pageCounts),
    byFeature: orderedCounts(featureCounts),
    recentActivity,
    users,
    presenceCounts,
  }
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

export function buildUsageSummary(input) {
  return buildUsageReport(input)
}

export function formatActiveDuration(seconds) {
  const totalMinutes = Math.floor((Number(seconds) || 0) / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
