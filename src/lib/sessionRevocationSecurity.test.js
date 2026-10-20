import { expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

// Static guard until migration is applied and tested against an actual
// Supabase development database; never claim that CI applied SQL to production.
it('keeps the existing RLS session after a failed login, but replaces it after successful login', () => {
  const migration = readFileSync('supabase/migrations/20261020010000_keep_active_session_after_failed_login.sql', 'utf8')
  expect(migration).toMatch(/create or replace function public\.zoom_service_set_login_security\(/i)
  expect(migration).toMatch(/current_session_id\s*=\s*coalesce\(session,\s*current_session_id\)/i)
  expect(migration).toMatch(/revoke all on function public\.zoom_service_set_login_security[\s\S]*?from public, anon, authenticated/i)
  expect(migration).toMatch(/grant execute on function public\.zoom_service_set_login_security[\s\S]*?to service_role/i)
  const original = readFileSync('supabase/migrations/20260917042211_zoom_identity_foundation.sql', 'utf8')
  expect(original).toContain("s.current_session_id::text = auth.jwt()->>'session_id'")
})

it('rejects valid sign-in responses if the server cannot store the active session ID', () => {
  const source = readFileSync('supabase/functions/login/index.ts', 'utf8')
  expect(source).toContain('const { error: sessionWriteError } = await admin.rpc')
  expect(source).toContain('if (sessionWriteError) return json(')
  expect(source).toContain('503, request')
})

it('keeps intentional administrator revocation separate from failed login handling', () => {
  const actions = readFileSync('supabase/migrations/20260917103137_zoom_admin_account_actions.sql', 'utf8')
  expect(actions).toContain("if desired_status='deactivated' then update private.zoom_login_security set current_session_id=null")
  expect(actions).toContain("update private.zoom_login_security set current_session_id=null,updated_at=now() where user_id=target;")
})
