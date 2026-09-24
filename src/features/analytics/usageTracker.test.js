import { describe, expect, it } from 'vitest'
import * as tracker from './usageTracker'

describe('safe analytics events', () => {
  it('keeps only approved identifiers when a UI caller supplies private input', () => {
    expect(tracker.createSafeEvent({
      eventType: 'search_used', routeId: 'navigator', processId: 'account-access', categoryId: 'account', toolId: 'search',
      searchQuery: 'Jane Smith meeting 123-456-7890', clipboard: 'secret',
    })).toEqual({ event_type: 'search_used', route_id: 'navigator', process_id: 'account-access', category_id: 'account', tool_id: 'search' })
  })
})


describe('presence and active-time semantics', () => {
  it('caps active time after five idle minutes and finishes offline', async () => {
    expect(typeof tracker.createPresenceController).toBe('function')

    let now = Date.parse('2026-09-18T00:00:00.000Z')
    const sessionWrites = []
    const presenceWrites = []
    const controller = tracker.createPresenceController({
      userId: 'user-1',
      sessionId: 'session-1',
      now: () => now,
      startSession: async payload => sessionWrites.push({ kind: 'start', ...payload }),
      updateSession: async payload => sessionWrites.push({ kind: 'update', ...payload }),
      writePresence: async payload => presenceWrites.push(payload),
    })

    await controller.start()
    now += 4 * 60 * 1000
    await controller.heartbeat()
    expect(sessionWrites.at(-1).activeSeconds).toBe(240)
    expect(presenceWrites.at(-1).state).toBe('active')

    now += 4 * 60 * 60 * 1000
    await controller.heartbeat()
    expect(sessionWrites.at(-1).activeSeconds).toBe(300)
    expect(presenceWrites.at(-1).state).toBe('idle')

    await controller.stop()
    expect(presenceWrites.at(-1).state).toBe('offline')
  })
})


describe('route view de-duplication', () => {
  it('records one route view per route transition, including a return visit, and resets on logout', () => {
    expect(typeof tracker.createRouteViewGuard).toBe('function')
    const shouldTrack = tracker.createRouteViewGuard()

    expect(shouldTrack('navigator')).toBe(true)
    expect(shouldTrack('navigator')).toBe(false)
    expect(shouldTrack('training')).toBe(true)
    expect(shouldTrack('navigator')).toBe(true)
    expect(shouldTrack(null)).toBe(false)
    expect(shouldTrack('navigator')).toBe(true)
  })
})


describe('usage events wait for their session record', () => {
  it('inserts an event only after the matching session start has completed', async () => {
    let resolveStart
    const sessionReady = new Promise(resolve => { resolveStart = resolve })
    const inserted = []
    const writer = tracker.createSessionEventWriter(async payload => inserted.push(payload))
    writer.setSessionReady('session-1', sessionReady)

    const pending = writer.track({
      userId: 'user-1',
      sessionId: 'session-1',
      input: { eventType: 'route_view', routeId: 'navigator' },
    })
    await Promise.resolve()
    expect(inserted).toEqual([])

    resolveStart()
    await expect(pending).resolves.toBe(true)
    expect(inserted).toEqual([{
      userId: 'user-1',
      sessionId: 'session-1',
      input: { eventType: 'route_view', routeId: 'navigator' },
    }])
  })

  it('does not write an event when its session start fails', async () => {
    const inserted = []
    const writer = tracker.createSessionEventWriter(async payload => inserted.push(payload))
    const sessionReady = Promise.reject(new Error('session insert failed'))
    writer.setSessionReady('session-1', sessionReady)

    await expect(writer.track({ userId: 'user-1', sessionId: 'session-1', input: { eventType: 'route_view' } })).resolves.toBe(false)
    expect(inserted).toEqual([])
  })
})

  it('keeps a queued event when the same session is re-armed after an effect replay', async () => {
    let resolveFirstStart
    const firstStart = new Promise(resolve => { resolveFirstStart = resolve })
    const inserted = []
    const writer = tracker.createSessionEventWriter(async payload => inserted.push(payload))
    writer.setSessionReady('session-1', firstStart)

    const pending = writer.track({ userId: 'user-1', sessionId: 'session-1', input: { eventType: 'route_view' } })
    writer.reset('session-1')
    writer.setSessionReady('session-1', Promise.resolve())
    resolveFirstStart()

    await expect(pending).resolves.toBe(true)
    expect(inserted).toHaveLength(1)
  })
