import { expect, it } from 'vitest'
import { allowedOrigin } from './cors'

it('returns only allowlisted development and production origins', () => {
  const allowlist = 'http://127.0.0.1:5173,http://localhost:5173,https://navigator.example.com'
  expect(allowedOrigin('http://127.0.0.1:5173', allowlist)).toBe('http://127.0.0.1:5173')
  expect(allowedOrigin('https://attacker.example', allowlist)).toBeNull()
})
