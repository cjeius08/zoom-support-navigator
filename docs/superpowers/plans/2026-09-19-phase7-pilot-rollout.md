# Phase 7 — Pilot & Rollout Plan

**Goal:** Move the completed Ogletree Support Workspace from implementation/QA into a controlled team pilot and production rollout without changing approved support content or weakening privacy/security boundaries.

**Source:** Continuation of the approved master plan and QA/rollout plan:
- Controlled team test
- Production rollout
- Final security/privacy verification

## Global guardrails

- Production Supabase project remains `eefpsujuvwfkpuiejtft` (Wagmi Support).
- Never point browser code or deployment workflows to a Medify project.
- Browser code may use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Service-role/secret keys remain server-side only.
- No real agent is deleted or destructively modified during automated pilot gates.
- Usage/presence remain metadata-only.
- Readiness Lab stays at 5 parts, 5 questions per part, max 3 attempts per part.
- Existing Navigator/process content remains frozen unless a separately approved content change is requested.

## Batch 1 — Pilot Readiness Gate

Purpose: Prove the environment is safe to enter a controlled pilot before mutating any test account.

Checks:
- Production project is active and the deploy workflow points only to Wagmi Support.
- No Medify project reference appears in browser source.
- No service-role/secret credential appears in browser source.
- All public app tables retain RLS.
- Normal agent RLS resolves to self-only profile/usage/session/presence/feedback access.
- Creator-admin retains team-level reporting access.
- Required auth/admin Edge Functions are active.
- Security Advisor has no unresolved Zoom-specific database findings.
- Full `npm test -- --run`, lint, and build pass.

No user-facing feature ships in this batch.

## Batch 2 — Disposable Agent Lifecycle Pilot

Use a clearly disposable pilot account/slot only.

Flow:
1. JA creates a pending agent slot and invite.
2. Disposable agent activates with initials + invite.
3. Agent signs in with username/password.
4. Agent selects an approved built-in avatar.
5. Agent opens Navigator, Training & Resources, and Readiness Lab.
6. Agent changes own password.
7. JA resets password and forced-change flow is verified.
8. JA deactivates and reactivates the disposable account.
9. JA permanently deletes only the disposable pilot account with confirmation.
10. Confirm linked disposable history is removed as specified.

This batch may mutate only the disposable pilot identity created for the test.

## Batch 2 result — 2026-09-19

Status: **PASS with one manual-only coverage gap.**

The disposable `pilot_qat` / `QAT` lifecycle was exercised end-to-end for activation, login, avatar persistence, self password change, forced-change/session invalidation state, deactivation, reactivation, permanent deletion, and cleanup. The live pilot also exposed and led to fixes for avatar rehydration, centering, selected-state visibility, and header sizing.

The connected automation layer does not expose Supabase Auth Admin password mutation and blocks raw temporary-password handling, so the Edge Function's actual temporary-password replacement was not automated. The same reset flow's `must_change_password` flag, session invalidation, authorization, and audit event were verified directly.

Detailed record: `docs/superpowers/plans/2026-09-19-phase7-batch2-pilot-results.md`

## Batch 3 — Controlled Team Pilot

Run with JA plus one designated non-disposable sample agent.

Flow:
- Agent uses representative Navigator processes.
- Agent completes a partial Readiness attempt and resumes it.
- Agent submits one feedback report.
- Presence transitions are observed.
- Usage metadata appears in JA reports.
- JA reviews feedback and updates status.
- JA confirms Readiness reporting by part/attempt.
- Defects are recorded and fixed in small reviewable batches.

No destructive account testing on the real sample agent.

## Batch 3 result — 2026-09-19

Status: **PASS.**

Controlled pilot agent: `cjeitest1` / CJ.

Representative Navigator and Training use increased the agent's usage/session metadata, presence remained observable, one feedback report captured the expected safe screen context, JA status/history controls worked, and the same partial Readiness Attempt 1 remained visible to both the agent and JA reporting.

The pilot exposed one Readiness resume-clarity defect: the backend preserved checked answers correctly, but the reopened UI could look like a fresh five-question set. The fix shipped during the pilot and now shows a clear resumed-attempt banner plus completed/remaining counts.

Detailed record: `docs/superpowers/plans/2026-09-19-phase7-batch3-controlled-pilot-results.md`

## Batch 4 — Production Rollout & Monitoring

- Run final full test/lint/build.
- Run Supabase Security and Performance Advisors.
- Confirm production project isolation.
- Confirm schema/function migrations are committed.
- Deploy main.
- Smoke-test JA and agent login after deployment.
- Confirm feedback, presence, usage, and Readiness reports populate.
- Record rollout defects only; new feature ideas become a separate future phase.

**Done means:** the workspace is not only code-complete, but has passed a controlled disposable lifecycle test, a real team pilot, and post-deploy smoke checks.


## Batch 4 result — 2026-09-19

Status: **PASS.**

Final rollout verified production project health, Wagmi-only deployment isolation, authenticated agent and creator-admin access boundaries, feedback/usage/presence/Readiness reporting, Supabase advisors, and full production migration parity.

The final audit found three historical Readiness migrations that existed in production but were missing as repository files. Supabase's stored migration statements were used to restore the exact applied SQL. Production and source control now match at 23 migration names out of 23.

Detailed record: `docs/superpowers/plans/2026-09-19-phase7-batch4-production-rollout-results.md`

**Phase 7 status: COMPLETE.**
