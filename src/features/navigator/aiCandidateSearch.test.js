import { describe, expect, it } from 'vitest'
import { buildApprovedAiSources, queryTokens } from './aiCandidateSearch'

describe('Ozzie AI approved candidate search', () => {
  it('prioritizes the approved Bluetooth route for clear Bluetooth shorthand', () => {
    const { routes } = buildApprovedAiSources('bt connected laptop speaker')
    expect(routes[0]?.id).toBe('bluetooth-headset')
    expect(routes.map(route => route.id)).toContain('cant-hear')
  })

  it('keeps broad audio requests broad enough for clarification', () => {
    const { routes } = buildApprovedAiSources('audio issue')
    const ids = routes.map(route => route.id)
    expect(ids).toContain('cant-hear')
    expect(ids).toContain('cant-be-heard')
  })

  it('does not manufacture candidates for unrelated text', () => {
    const result = buildApprovedAiSources('purple elephant invoice')
    expect(result.routes).toHaveLength(0)
    expect(result.processes).toHaveLength(0)
  })

  it('normalizes common live-call shorthand', () => {
    expect(queryTokens('bt spkr conected')).toEqual(['bluetooth', 'speaker', 'connected'])
  })
})
