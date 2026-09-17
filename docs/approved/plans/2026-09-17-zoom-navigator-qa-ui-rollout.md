# Zoom Navigator QA + Premium UI + Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove security/functional correctness, apply the approved premium dark UI without behavior regressions, and roll out to the team safely.

**Architecture:** Freeze functionality first, build regression coverage around all approved flows, then restyle presentation only. Production rollout uses JA + sample agent validation before wider team access.

**Tech Stack:** Existing frontend test/build stack, Supabase Advisors, browser/manual accessibility checks.

**Spec:** `docs/superpowers/specs/2026-09-17-zoom-navigator-team-access-design.md`

### Task 1: Build the release acceptance suite

- [ ] Authentication: valid login, wrong password, unknown username non-enumeration, lockout, single-session replacement, deactivation/reactivation, self password change, JA reset, forced change.
- [ ] Invites: valid, wrong initials/code, revoked, reused, regenerate invalidates prior code, concurrent redemption.
- [ ] Authorization: agent cannot access admin/team data; JA retains authority after username change; JA cannot delete/deactivate self.
- [ ] Usage/privacy: expected metadata events only; idle time stops accruing; presence transitions correct.
- [ ] Feedback: context capture, submission, JA status changes, Open Page.
- [ ] Profiles: approved avatar selection only; identity/history unchanged.
- [ ] Delete: typed confirmation required; linked history removed; JA protected.
- [ ] Commit acceptance tests before visual redesign.

### Task 2: Run backend security review

- [ ] Supabase Security Advisor: zero unresolved Zoom-specific security findings.
- [ ] Performance Advisor: address report/event query index warnings.
- [ ] Confirm every exposed table has RLS.
- [ ] Confirm secret/service keys appear only in server environment, never bundle/source.
- [ ] Confirm Edge Function auth mode matches caller: public pre-auth only where required; user JWT for signed-in operations.
- [ ] Verify deactivated users and replaced sessions fail protected access, not just UI navigation.
- [ ] Commit verified security fixes.

### Task 3: Apply approved UI system without behavior changes

**Visual direction:**
- dark professional,
- warm textured premium,
- deep charcoal/espresso surfaces,
- bronze/champagne accent,
- subtle grain,
- strong readability,
- responsive smaller desktop/window widths,
- no neon gradients,
- no excessive glassmorphism,
- no generic AI-dashboard look.

- [ ] Freeze behavioral snapshots/tests first.
- [ ] Introduce CSS design tokens for surfaces, borders, text, accent, radius, shadow, spacing.
- [ ] Redesign login/activation screens first.
- [ ] Redesign Navigator shell/nav while preserving process markup/order.
- [ ] Redesign Team Management/Admin Reports/Feedback/Profile using same token system.
- [ ] Keep destructive actions visually distinct but not dominant.
- [ ] Commit styling separately from functional changes.

### Task 4: Responsive/accessibility regression pass

- [ ] Keyboard-only navigation through login, dialogs, admin, feedback, avatar picker.
- [ ] Visible focus for every interactive element.
- [ ] Dialog focus trap + focus restore + Escape close where safe.
- [ ] 200% zoom and 320px viewport: no lost content/actions.
- [ ] Reduced-motion preference respected.
- [ ] Form errors identify field + recovery.
- [ ] Status/toast messages use appropriate live-region semantics without excessive announcements.
- [ ] Commit fixes.

### Task 5: Controlled team test

Run with JA and one sample agent:

```text
1. JA creates slot + invite.
2. Sample agent activates.
3. Agent selects avatar.
4. Agent uses several Navigator processes.
5. Agent submits one Missing Information feedback item.
6. JA sees Active/Idle/Offline and usage events.
7. JA reviews feedback and opens reported page.
8. JA resets password; agent is forced to change it.
9. JA deactivates/reactivates.
10. JA permanently deletes a disposable sample account.
```

- [ ] Record defects only; do not redesign behavior during this gate without updating tests/spec.
- [ ] Fix blockers and rerun full suite.

### Task 6: Production rollout

- [ ] Verify production frontend points only to project `eefpsujuvwfkpuiejtft`.
- [ ] Verify Medify project URLs/keys are absent.
- [ ] Verify JA creator account and recovery path are documented privately.
- [ ] Verify at least one spare admin-safe backup/export of schema migration files exists in source control.
- [ ] Run `npm test`, `npm run lint`, `npm run build`, `git diff --check`.
- [ ] Run Supabase Security Advisor one final time.
- [ ] Deploy production frontend.
- [ ] Smoke-test JA login + one agent login after deploy.

**Done means:** every acceptance criterion in the approved spec is verified in production behavior, not only in UI mocks.
