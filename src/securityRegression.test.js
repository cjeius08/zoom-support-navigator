import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

function migration(name) {
  return readFileSync(join(cwd(), 'supabase/migrations', name), 'utf8')
}

it('keeps direct profile self-service limited to avatar and Ozzie state', () => {
  const profileHardening = migration('20260919082437_phase8_profile_recent_security_hardening.sql')
  const ozzieHardening = migration('20260919082738_phase8_ozzie_security_invoker.sql')

  expect(profileHardening).toMatch(/revoke all privileges on table public\.zoom_profiles from anon/i)
  expect(profileHardening).toMatch(/revoke insert, update, delete, truncate, references, trigger[\s\S]*?zoom_profiles from authenticated/i)
  expect(profileHardening).toMatch(/grant update \(avatar_id\) on table public\.zoom_profiles to authenticated/i)
  expect(ozzieHardening).toMatch(/grant update \(ozzie_intro_seen_at\) on table public\.zoom_profiles to authenticated/i)

  expect(profileHardening).not.toMatch(/grant update \([^)]*role/i)
  expect(profileHardening).not.toMatch(/grant update \([^)]*status/i)
  expect(profileHardening).not.toMatch(/grant update \([^)]*workspace_role/i)
})

it('keeps Favorites and Recently Viewed scoped to the signed-in owner', () => {
  const favorites = migration('20260919054500_zoom_favorites_quick_access.sql')
  const recentBase = migration('20260919063500_zoom_recently_viewed.sql')
  const recentHardening = migration('20260919082437_phase8_profile_recent_security_hardening.sql')

  expect(favorites).toMatch(/own favorites read[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
  expect(favorites).toMatch(/own favorites insert[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
  expect(favorites).toMatch(/own favorites delete[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)

  expect(recentBase).toMatch(/own recent read[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
  expect(recentBase).toMatch(/own recent delete[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
  expect(recentHardening).toMatch(/own recent insert[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
  expect(recentHardening).toMatch(/own recent update[\s\S]*?auth\.uid\(\)[\s\S]*?user_id/i)
})

it('keeps recent-view and Ozzie RPCs invoker-scoped and unavailable to anonymous users', () => {
  const recent = migration('20260919082437_phase8_profile_recent_security_hardening.sql')
  const ozzie = migration('20260919082738_phase8_ozzie_security_invoker.sql')

  expect(recent).toMatch(/zoom_record_recent_view[\s\S]*?security invoker/i)
  expect(recent).toMatch(/revoke all on function public\.zoom_record_recent_view\(text, text\) from public, anon/i)
  expect(recent).toMatch(/grant execute on function public\.zoom_record_recent_view\(text, text\) to authenticated/i)

  expect(ozzie).toMatch(/zoom_mark_ozzie_intro_seen[\s\S]*?security invoker/i)
  expect(ozzie).toMatch(/revoke all on function public\.zoom_mark_ozzie_intro_seen\(\) from public, anon/i)
  expect(ozzie).toMatch(/grant execute on function public\.zoom_mark_ozzie_intro_seen\(\) to authenticated/i)
})

it('keeps Lead title-only and admin mutations service-role protected', () => {
  const roles = migration('20260919073243_workspace_member_lead_roles.sql')
  const readiness = migration('20260919073720_readiness_report_workspace_roles.sql')

  expect(roles).toMatch(/check \(workspace_role in \('member','lead'\)\)/i)
  expect(roles).toMatch(/revoke all on function public\.zoom_service_admin_set_workspace_role\(uuid,uuid,text\)[\s\S]*?authenticated/i)
  expect(roles).toMatch(/grant execute on function public\.zoom_service_admin_set_workspace_role\(uuid,uuid,text\)[\s\S]*?service_role/i)
  expect(readiness).toContain('private.zoom_is_creator_admin()')
})
