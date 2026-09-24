import { useCallback, useEffect, useMemo, useRef } from 'react'
import { createPresenceController, createRouteViewGuard } from './usageTracker'
import {
  insertUsageEvent,
  startUsageSession,
  updateUsageSession,
  writePresence,
} from './usageApi'

const HEARTBEAT_MS = 60 * 1000

function createSessionId(userId) {
  if (!userId || typeof globalThis.crypto?.randomUUID !== 'function') return null
  return globalThis.crypto.randomUUID()
}

export function useUsageTracking(userId, routeId) {
  const sessionId = useMemo(() => createSessionId(userId), [userId])
  const routeViewGuard = useRef(null)
  if (!routeViewGuard.current) routeViewGuard.current = createRouteViewGuard()

  useEffect(() => {
    if (!userId || !sessionId) return undefined

    const controller = createPresenceController({
      userId,
      sessionId,
      startSession: startUsageSession,
      updateSession: updateUsageSession,
      writePresence,
    })

    controller.start().catch(() => undefined)

    const markInteraction = () => controller.markInteraction()
    const heartbeat = () => controller.heartbeat().catch(() => undefined)

    window.addEventListener('pointerdown', markInteraction, { passive: true })
    window.addEventListener('keydown', markInteraction)
    window.addEventListener('touchstart', markInteraction, { passive: true })
    const intervalId = window.setInterval(heartbeat, HEARTBEAT_MS)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('pointerdown', markInteraction)
      window.removeEventListener('keydown', markInteraction)
      window.removeEventListener('touchstart', markInteraction)
      controller.stop().catch(() => undefined)
    }
  }, [sessionId, userId])

  const trackEvent = useCallback((input) => {
    if (!userId || !sessionId) return Promise.resolve()
    return insertUsageEvent({ userId, sessionId, input }).catch(() => undefined)
  }, [sessionId, userId])

  useEffect(() => {
    if (routeViewGuard.current(routeId)) trackEvent({ eventType: 'route_view', routeId })
  }, [routeId, trackEvent])

  return { sessionId, trackEvent }
}
