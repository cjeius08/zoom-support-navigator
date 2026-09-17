import { describe, expect, it } from 'vitest'
import { hashInvite, normalizeInitials, normalizeUsername, validInitials, validPassword, validUsername } from './identity'

describe('Edge Function identity helpers', () => {
  it('normalizes visible identity fields and rejects invalid formats', () => {
    expect(normalizeUsername('  Jane_01 ')).toBe('jane_01')
    expect(normalizeInitials(' ja ')).toBe('JA')
    expect(validUsername('jane.doe')).toBe(false)
    expect(validInitials('J1')).toBe(false)
    expect(validPassword('1234567')).toBe(false)
  })

  it('creates a stable non-reversible SHA-256 invite verifier', async () => {
    expect(await hashInvite('one-time-code')).toBe('3538b4902a9fad43d80819555b9849c471a422489a4f4d7eb532217195e9293d')
  })
})
