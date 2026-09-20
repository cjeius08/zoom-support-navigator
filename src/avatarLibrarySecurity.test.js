import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const migration = () => readFileSync('supabase/migrations/20260920160000_zoom_avatar_library.sql', 'utf8')
const edgeFunction = () => readFileSync('supabase/functions/avatar-library/index.ts', 'utf8')

it('protects avatar library reads and seeds the existing bundled catalog without wiping it', () => {
  const source = migration()
  expect(source).toMatch(/insert into public\.zoom_avatar_catalog/i)
  expect(source).toMatch(/on conflict \(id\) do nothing/i)
  expect(source).not.toMatch(/drop table public\.zoom_avatar_catalog/i)
})

it('requires the existing creator-admin authorization path for mutations', () => {
  const source = edgeFunction()
  expect(source).toMatch(/requireUser/i)
  expect(source).toMatch(/zoom_service_admin_actor_valid/i)
  expect(source).toMatch(/SUPABASE_SERVICE_ROLE_KEY|adminClient/i)
  expect(source).toMatch(/avatar_ids/i)
})
