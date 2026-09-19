# Phase 7 · Batch 3 — Controlled Team Pilot Results

**Date:** 2026-09-19  
**Sample agent:** `cjeitest1` / initials `CJ`  
**Scope:** Non-destructive controlled pilot. No password reset, rename, deactivate, or delete action was performed on the sample agent.

## Baseline

Before pilot activity:
- Usage events: 20
- Usage sessions: 4
- Feedback reports: 0
- Readiness attempts: 0
- Saved avatar: `avatar_048`
- Account status: active

## Pilot activity

The sample agent:
- Opened representative Navigator/Common Issue content.
- Browsed Training & Resources.
- Opened Readiness Lab Part 1 and checked questions on Attempt 1.
- Fully closed and reopened Readiness Lab.
- Submitted one harmless pilot feedback report using the global Report an issue control.
- Remained active long enough for usage/presence heartbeat recording.

## Results

### Usage and presence
After pilot activity:
- Usage events: 26
- Usage sessions: 5
- Presence row remained active with current heartbeat data.
- This confirms representative navigation and training activity is reaching the privacy-safe usage/presence pipeline.

### Feedback
- Feedback count increased from 0 to 1.
- The report captured safe debugging context including:
  - route: Navigator
  - selected tab: Common Issues
  - page path
  - viewport dimensions
  - browser user-agent presence
  - client-reported timestamp
- JA changed the test feedback from `new` to `dismissed`.
- The feedback status history recorded `new → dismissed` and retained the JA actor.

### Readiness persistence
- CJ has one active Part 1 attempt.
- The same Attempt 1 retained checked answers in Supabase.
- At verification time, 2 of 5 questions were checked.
- JA Readiness reporting showed `cjeitest1` with the same active attempt and checked-count data.

### Pilot-discovered Readiness UX defect
The backend persisted the attempt correctly, but after fully closing and reopening the lab the presentation could make the set look like a fresh five-question run because the UI continued emphasizing the total question count.

Fix shipped during the pilot:
- reopen lands on the first unanswered question
- a visible **Resuming Attempt N** banner appears
- completed and remaining counts are shown
- current unanswered question shows the live remaining count
- checked questions remain reviewable

Production fix commit: `eaeb153c260f9deee63465845a8f9bafb0237619`

## Batch 3 status

**PASS.**

Controlled team use verified:
- representative Navigator usage
- Training & Resources usage
- usage/session/presence collection
- feedback submission with hidden context
- JA feedback status/history
- persistent partial Readiness attempt
- JA Readiness report visibility

No destructive operation was performed on the sample agent.

## Next checkpoint

**Phase 7 · Batch 4 — Production Rollout & Monitoring**

Run final release gates, Supabase advisors, deployment smoke checks, and confirm the production environment is ready for ongoing team use.
