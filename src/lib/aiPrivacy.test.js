import { describe, expect, it } from 'vitest'
import { sanitizeAiText } from './aiPrivacy'

describe('AI privacy filter', () => {
  it('redacts ordinary identifiers while preserving the support symptom', () => {
    const result = sanitizeAiText('Name: John Smith, john@example.com, phone: 09171234567 — bt connected laptop speaker')
    expect(result.blocked).toBe(false)
    expect(result.safeText).not.toContain('John Smith')
    expect(result.safeText).not.toContain('john@example.com')
    expect(result.safeText).not.toContain('09171234567')
    expect(result.safeText).toContain('bt connected laptop speaker')
    expect(result.redactions).toBeGreaterThanOrEqual(3)
  })

  it('blocks valid payment-card numbers before any provider request', () => {
    const result = sanitizeAiText('card 4111 1111 1111 1111 cant join')
    expect(result).toMatchObject({
      blocked: true,
      reason: 'payment_card',
      safeText: '[BLOCKED: PAYMENT CARD DATA]',
    })
  })

  it('blocks explicit passwords but not the phrase password not working', () => {
    expect(sanitizeAiText('password: Secret123 cant join')).toMatchObject({ blocked: true, reason: 'password' })
    expect(sanitizeAiText('meeting password not working').blocked).toBe(false)
  })

  it('keeps short shorthand and typos usable', () => {
    const result = sanitizeAiText('bt conected laptop spkr')
    expect(result).toMatchObject({ blocked: false, safeText: 'bt conected laptop spkr' })
  })
})
