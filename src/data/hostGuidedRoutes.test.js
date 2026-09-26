import { describe, expect, it } from 'vitest'
import { HOST_GUIDED_ROUTES, HOST_GUIDED_ROUTE_SOURCE_POLICY, guidedRouteById, validateHostGuidedRoutes } from './hostGuidedRoutes'

describe('host guided routes', () => {
  it('uses only the approved client + official Zoom source policy', () => {
    expect(HOST_GUIDED_ROUTE_SOURCE_POLICY.clientSource).toMatch(/Zoom Basic Support Boundaries/)
    expect(HOST_GUIDED_ROUTE_SOURCE_POLICY.zoomSourceRule).toMatch(/official Zoom Support/i)
    expect(HOST_GUIDED_ROUTE_SOURCE_POLICY.unknownRule).toMatch(/do not invent/i)
  })

  it('has confirmation gates, troubleshooting steps, scripts, and documentation handoff text', () => {
    expect(HOST_GUIDED_ROUTES.length).toBeGreaterThanOrEqual(8)
    for (const route of HOST_GUIDED_ROUTES) {
      expect(route.confirmBeforeProceeding.length, route.id).toBeGreaterThan(0)
      expect(route.steps.length, route.id).toBeGreaterThan(0)
      expect(route.scripts?.opening, route.id).toBeTruthy()
      expect(route.scripts?.resolved, route.id).toBeTruthy()
      expect(route.scripts?.boundary, route.id).toBeTruthy()
      expect(route.documentation?.resolved, route.id).toBeTruthy()
      expect(route.documentation?.roadblock, route.id).toBeTruthy()
    }
  })

  it('keeps all external product sources on official Zoom Support', () => {
    const urls = HOST_GUIDED_ROUTES.flatMap(route => route.sourceRefs?.zoom || []).map(source => source.url)
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) expect(url).toMatch(/^https:\/\/support\.zoom\.com\//)
  })

  it('does not turn generic Zoom recording capabilities into program instructions', () => {
    const recording = guidedRouteById('host-recording-guided')
    expect(recording.sourceStatus).toBe('client-rule-overrides-generic-zoom-capability')
    expect(recording.programRules.join(' ')).toMatch(/must not change required recording settings/i)
    expect(JSON.stringify(recording.steps)).not.toMatch(/click Stop recording/i)
  })

  it('validates all referenced roadblocks', () => {
    expect(validateHostGuidedRoutes()).toEqual([])
  })
})
