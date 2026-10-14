import { describe, expect, it } from 'vitest'
import { formatLastLogin } from './liveVisitorsTime'

const now = Date.parse('2026-10-15T06:00:00Z')
describe('last successful login format', () => {
  it('shows both relative elapsed time and exact localized date', () => {
    const result = formatLastLogin('2026-10-15T03:00:00Z', now)
    expect(result.relative).toBe('3 hours ago')
    expect(result.absolute).toContain('Oct 15, 2026')
  })
  it('handles short/long spans without rounding up', () => {
    expect(formatLastLogin(new Date(now - 60_000).toISOString(), now).relative).toBe('1 minute ago')
    expect(formatLastLogin(new Date(now - 8*24*60*60*1000).toISOString(), now).relative).toBe('1 week ago')
  })
  it('shows unavailable instead of guessing a timestamp', () => {
    expect(formatLastLogin(null, now)).toEqual({relative: 'Unavailable', absolute: ''})
    expect(formatLastLogin('invalid', now).relative).toBe('Unavailable')
  })
})
