import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { expect, it } from 'vitest'

const persistence = readFileSync(
  join(cwd(), 'supabase/migrations/20260918203339_zoom_readiness_lab_persistence.sql'),
  'utf8',
)
const raceHardening = readFileSync(
  join(cwd(), 'supabase/migrations/20260918204135_zoom_readiness_answer_race_hardening.sql'),
  'utf8',
)
const indexHardening = readFileSync(
  join(cwd(), 'supabase/migrations/20260918204345_zoom_readiness_index_hardening.sql'),
  'utf8',
)

it('locks Readiness Lab attempts to three and one active attempt per user/version', () => {
  expect(persistence).toMatch(/attempt_number integer not null check \(attempt_number between 1 and 3\)/i)
  expect(persistence).toMatch(/unique \(user_id, question_set_version, attempt_number\)/i)
  expect(persistence).toMatch(/create unique index zoom_readiness_one_active_attempt_idx[\s\S]*where status = 'active'/i)
  expect(persistence).toMatch(/if v_attempt_count >= 3 then/i)
  expect(persistence).toMatch(/pg_advisory_xact_lock/i)
})

it('keeps the question bank and attempt rows private from direct browser access', () => {
  for (const table of ['zoom_readiness_questions', 'zoom_readiness_attempts', 'zoom_readiness_answers']) {
    expect(persistence).toMatch(new RegExp(`revoke all on table private\\.${table} from public, anon, authenticated`, 'i'))
  }
  expect(persistence).toMatch(/revoke all on function public\.zoom_readiness_get_state\(text\) from public, anon/i)
  expect(persistence).toMatch(/grant execute on function public\.zoom_readiness_get_state\(text\) to authenticated/i)
  expect(persistence).toMatch(/private\.zoom_has_valid_access\(\)/i)
  expect(persistence).toMatch(/private\.zoom_is_creator_admin\(\)/i)
})

it('makes each checked question immutable and safe under simultaneous tabs', () => {
  expect(persistence).toMatch(/unique \(attempt_id, question_id\)/i)
  expect(raceHardening).toMatch(/on conflict \(attempt_id, question_id\) do nothing/i)
  expect(raceHardening).toMatch(/where attempt_id = p_attempt_id[\s\S]*and question_id = p_question_id/i)
  expect(raceHardening).not.toMatch(/do update/i)
})

it('requires all checked answers and calculates submitted score on the server', () => {
  expect(persistence).toMatch(/select count\(\*\), count\(\*\) filter \(where is_correct\)/i)
  expect(persistence).toMatch(/if v_checked <> v_total then[\s\S]*Attempt incomplete/i)
  expect(persistence).toMatch(/set status = 'submitted',[\s\S]*score = v_score,[\s\S]*submitted_at = now\(\)/i)
})

it('keeps readiness foreign-key lookups covered by indexes', () => {
  expect(indexHardening).toMatch(/zoom_readiness_answers_user_id_idx/i)
  expect(indexHardening).toMatch(/zoom_readiness_answers_question_idx/i)
})
