# Zoom Support Navigator Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Deliver the approved Zoom Support Navigator in a new React/Vite repository, using only Supabase project `eefpsujuvwfkpuiejtft`.

**Architecture:** The approved specification in `docs/approved/specs/2026-09-17-zoom-navigator-team-access-design.md` remains authoritative. This execution index orders its four approved implementation plans while adding greenfield scaffolding and an explicit source-content gate.

**Tech Stack:** React 18, Vite, JavaScript, Vitest, React Testing Library, Supabase JS, Supabase Edge Functions (Deno/TypeScript), Postgres migrations/RLS.

## Global constraints

- Never connect to, migrate, or reuse any Medify Supabase project.
- Browser code contains only the Zoom project URL and publishable key.
- No support-process content may be invented; copy must come from an accessible Zoom reference/source handoff.
- Use test-first implementation for behavior; configuration and generated asset manifests are exceptions.
- Apply the dark warm premium visual system only after functional/security tests are green.

## Execution sequence

### Task 1: Establish the greenfield baseline

- [ ] Create the Vite/React test, lint, build, environment, Git, and Supabase configuration.
- [ ] Add a failing Navigator-content repository test that prevents shipping invented process data.
- [ ] Record the reference/source and avatar-asset gates in the README.
- [ ] Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.

### Task 2: Execute approved Plan A — Foundation + Authentication Backend

- [ ] Follow every task in `docs/approved/plans/2026-09-17-zoom-navigator-foundation-auth.md` using TDD.
- [ ] Link Supabase only to `eefpsujuvwfkpuiejtft`, apply migrations, deploy functions when CLI authentication is available, and run database/security checks.

### Task 3: Execute approved Plan B — Frontend Auth + Team Management

- [ ] Follow every task in `docs/approved/plans/2026-09-17-zoom-navigator-team-admin.md` using TDD.
- [ ] Implement around the source-backed Navigator shell; do not fabricate missing processes.

### Task 4: Execute approved Plan C — Analytics, Feedback, and Profiles

- [ ] Follow every task in `docs/approved/plans/2026-09-17-zoom-navigator-analytics-feedback-profiles.md` using TDD.
- [ ] Keep analytics identifiers-only and add the exact approved avatar bundle when supplied.

### Task 5: Execute approved Plan D — QA, UI, and rollout preparation

- [ ] Follow every task in `docs/approved/plans/2026-09-17-zoom-navigator-qa-ui-rollout.md`.
- [ ] Apply the approved visual system only after the functional test gates pass.
- [ ] Run full tests, lint, production build, diff check, and applicable Supabase Advisor checks.
