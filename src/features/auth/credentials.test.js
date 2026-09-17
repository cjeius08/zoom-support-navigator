import { describe, expect, it } from 'vitest'
import { validateActivation, validateCredentials } from './credentials'

describe('credential validation', () => {
  it('normalizes a valid username and rejects passwords below eight characters', () => {
    expect(validateCredentials('  Jane_01 ', '1234567')).toEqual({
      username: 'jane_01',
      errors: { password: 'Password must be at least 8 characters.' },
    })
  })

  it('rejects an activation confirmation that differs from the password', () => {
    expect(validateActivation({ initials: 'ab', username: 'agent_1', password: 'password8', confirmPassword: 'password9' }).errors)
      .toEqual({ confirmPassword: 'Passwords do not match.' })
  })
})
