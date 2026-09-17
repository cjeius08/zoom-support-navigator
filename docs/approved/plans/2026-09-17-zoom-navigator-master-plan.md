# Zoom Navigator Team Access Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Zoom Support Navigator into a secure team tool with username/password login, JA-controlled onboarding and administration, metadata-only analytics/presence, feedback reporting, and built-in avatar profiles.

**Architecture:** Keep the existing Navigator content/behavior intact and add a dedicated Supabase backend around it. Use Supabase Auth with hidden internal email identities, a username-to-auth gateway in Edge Functions, RLS-protected data tables, and server-only admin operations. Split work into four independently testable plans so each slice can be reviewed before the next one begins.

**Tech Stack:** Existing Zoom Navigator frontend (source handoff required), Supabase Postgres 17, Supabase Auth, Supabase Edge Functions (Deno/TypeScript), `@supabase/server`, `@supabase/supabase-js@2`, Vitest/React Testing Library if the exported frontend is React/Vite.

**Spec:** `docs/superpowers/specs/2026-09-17-zoom-navigator-team-access-design.md`

## Global Constraints

- Dedicated Supabase project only: `eefpsujuvwfkpuiejtft` (`Wagmi Support`, `ap-southeast-1`).
- Medify Support Navigator project/data must remain untouched.
- JA is the immutable creator/admin identity.
- Normal login UX is username + password only.
- Usernames: minimum 3 chars, letters/numbers/underscore only, case-insensitive, reusable after rename/delete.
- Initials: exactly 2–3 letters, uppercase, reusable after rename.
- Passwords: minimum 8 characters; no additional composition rule.
- Invite codes do not expire automatically; one active code per pending agent slot; codes are one-time use and revocable.
- JA-only password reset forces password change on next login.
- One active session per account.
- No inactivity auto-logout.
- Presence states: Active / Online Idle / Offline.
- Usage analytics are metadata-only. Never store customer names, emails, phones, meeting IDs/passwords, support notes, typed form contents, clipboard contents, copied contents, screenshots, keystrokes, or passwords.
- Agents cannot access Team Management, Admin Reports, or other users' data.
- Permanent delete removes the agent account and linked usage/history after typed confirmation; JA cannot be deleted.
- Feedback captures page/process context but no screenshots or attachments in v1.
- Profile images are selected only from the prepared 187 built-in avatars.
- Final dark/warm premium UI redesign occurs only after functional/security QA passes.
- No privileged Supabase key in frontend code. Frontend uses only the project URL + publishable key.
- All exposed tables have RLS enabled and least-privilege grants.

## Confirmed Current State

- Supabase project `eefpsujuvwfkpuiejtft` is ACTIVE_HEALTHY on Postgres 17.
- `public` and `private` currently contain no application tables.
- The project currently has zero Edge Functions.
- The current frontend is a ChatGPT Site projection named `Zoom Support Navigator` at `https://zoom-support-navigator.cjeius08.chatgpt.site`.
- The Site projection cannot be materialized/exported through the available Files tool in this session.
- No Zoom Navigator GitHub repository is currently visible in the connected GitHub account.
- Therefore backend work can start independently, but frontend integration requires an editable source handoff/repository before UI code can be modified.

---

## Execution Order

### Plan A — Foundation + Authentication Backend

File: `docs/superpowers/plans/2026-09-17-zoom-navigator-foundation-auth.md`

Delivers:
- Database schema foundation.
- RLS/security helpers.
- Username login gateway.
- Agent activation by initials + invite.
- JA creator bootstrap.
- Forced password-change state.
- Single-session enforcement data model.
- Login lockout data model and behavior.

**Release gate:** backend integration tests pass; no frontend required yet.

### Plan B — Frontend Auth + Team Management

File: `docs/superpowers/plans/2026-09-17-zoom-navigator-team-admin.md`

Delivers:
- Login/activation screens.
- Session bootstrap/logout.
- Forced password-change screen.
- My Account password change.
- JA Team Management.
- Edit initials/username.
- Reset password.
- Deactivate/reactivate/delete.
- Invite generate/copy/revoke/regenerate.

**Release gate:** JA + one sample agent can complete the full lifecycle end-to-end.

### Plan C — Analytics + Presence + Feedback + Profiles

File: `docs/superpowers/plans/2026-09-17-zoom-navigator-analytics-feedback-profiles.md`

Delivers:
- Metadata event tracking.
- Active-time accounting.
- Active / Idle / Offline presence.
- Admin Home and Usage Reports.
- Zero-usage users.
- Admin alerts.
- Feedback queue/status history.
- 187-avatar profile gallery.

**Release gate:** privacy tests, report calculations, feedback flow, and profile/avatar tests pass.

### Plan D — QA + Premium UI + Rollout

File: `docs/superpowers/plans/2026-09-17-zoom-navigator-qa-ui-rollout.md`

Delivers:
- Authorization/destructive-action QA.
- Browser/responsive/accessibility regression pass.
- Dark warm textured professional redesign.
- Controlled team test.
- Production rollout checklist.

**Release gate:** all acceptance criteria in the approved spec pass.

---

## Source Handoff Gate

Before Plan B begins, obtain an editable source snapshot of the current Zoom Support Navigator. Acceptable handoffs:

1. A GitHub repository containing the current site source, or
2. A ZIP/source export uploaded into this chat, or
3. An editable project workspace exposed to the implementation agent.

Do **not** rebuild the Navigator content from the rendered Site text. Preserve the original source/content structure once available.

## Verification Command Set

Once a repo exists, standard project gates are:

```bash
npm test
npm run lint
npm run build
git diff --check
```

For Supabase backend changes:

```bash
supabase --version
supabase db advisors
supabase migration list --local
```

When using the connected Supabase project rather than local CLI, run Security Advisor and Performance Advisor after schema/function changes and execute read-back SQL checks for each migration.

## Commit Strategy

Use small commits aligned to reviewable tasks, for example:

```text
chore: establish zoom navigator source baseline
feat: add zoom auth schema and rls
feat: add username login gateway
feat: add invite account activation
feat: add team management actions
feat: add metadata usage tracking
feat: add admin usage reports
feat: add feedback workflow
feat: add avatar profiles
style: apply premium navigator theme
test: add end-to-end account lifecycle coverage
```

Do not combine backend security changes and visual redesign into the same commit.
