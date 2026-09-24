const safeKeys = {
  eventType: 'event_type',
  routeId: 'route_id',
  processId: 'process_id',
  categoryId: 'category_id',
  toolId: 'tool_id',
}

export const IDLE_AFTER_MS = 5 * 60 * 1000

export function createSafeEvent(input) {
  return Object.fromEntries(
    Object.entries(safeKeys)
      .filter(([key]) => typeof input[key] === 'string' && input[key].length > 0)
      .map(([key, column]) => [column, input[key]]),
  )
}

export function createSessionEventWriter(insertEvent) {
  let readySessionId = null
  let readyPromise = null

  return {
    setSessionReady(sessionId, promise) {
      readySessionId = sessionId
      readyPromise = Promise.resolve(promise)
    },
    reset(sessionId) {
      if (!sessionId || sessionId === readySessionId) {
        readySessionId = null
        readyPromise = null
      }
    },
    async track(payload) {
      const pending = readyPromise
      if (!payload?.sessionId || payload.sessionId !== readySessionId || !pending) return false
      try {
        await pending
        if (readySessionId !== payload.sessionId) return false
        await insertEvent(payload)
        return true
      } catch {
        return false
      }
    },
  }
}

export function createUsageTracker(insertEvent) {
  return {
    trackEvent(input) {
      return insertEvent(createSafeEvent(input))
    },
  }
}

export function createPresenceController({
  userId,
  sessionId,
  now = () => Date.now(),
  startSession,
  updateSession,
  writePresence,
  idleAfterMs = IDLE_AFTER_MS,
}) {
  let started = false
  let lastInteractionMs = now()
  let lastTickMs = lastInteractionMs
  let activeSeconds = 0

  const iso = value => new Date(value).toISOString()
  const stateAt = value => value - lastInteractionMs >= idleAfterMs ? 'idle' : 'active'

  async function persist(at, state = stateAt(at), endedAt = null) {
    await updateSession({
      sessionId,
      activeSeconds,
      lastInteraction: iso(lastInteractionMs),
      ...(endedAt ? { endedAt: iso(endedAt) } : {}),
    })
    await writePresence({
      userId,
      sessionId,
      state,
      lastHeartbeat: iso(at),
      lastInteraction: iso(lastInteractionMs),
    })
  }

  return {
    async start() {
      if (started) return
      const at = now()
      started = true
      lastInteractionMs = at
      lastTickMs = at
      activeSeconds = 0
      await startSession({
        userId,
        sessionId,
        startedAt: iso(at),
        lastInteraction: iso(at),
      })
      await writePresence({
        userId,
        sessionId,
        state: 'active',
        lastHeartbeat: iso(at),
        lastInteraction: iso(at),
      })
    },

    markInteraction() {
      if (!started) return
      const at = now()
      if (at - lastInteractionMs >= idleAfterMs) lastTickMs = at
      lastInteractionMs = at
    },

    async heartbeat() {
      if (!started) return
      const at = now()
      const activeUntil = lastInteractionMs + idleAfterMs
      const accrueUntil = Math.min(at, activeUntil)
      if (accrueUntil > lastTickMs) {
        activeSeconds += Math.floor((accrueUntil - lastTickMs) / 1000)
      }
      lastTickMs = at
      await persist(at)
    },

    async stop() {
      if (!started) return
      await this.heartbeat()
      const at = now()
      await persist(at, 'offline', at)
      started = false
    },

    snapshot() {
      return {
        activeSeconds,
        lastInteraction: iso(lastInteractionMs),
        state: stateAt(now()),
      }
    },
  }
}


export function createRouteViewGuard() {
  let previousRouteId = null
  return routeId => {
    if (!routeId) {
      previousRouteId = null
      return false
    }
    if (routeId === previousRouteId) return false
    previousRouteId = routeId
    return true
  }
}
