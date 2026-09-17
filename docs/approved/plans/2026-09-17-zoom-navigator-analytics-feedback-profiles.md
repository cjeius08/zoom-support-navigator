# Zoom Navigator Analytics + Feedback + Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add metadata-only usage/presence reporting, admin alerts, contextual feedback, and built-in avatar profiles.

**Architecture:** Events are deliberately low-cardinality and content-free. A lightweight client tracker emits route/process/category/tool identifiers and interaction timestamps; server-side views/RPCs aggregate reports. Feedback stores contextual identifiers and agent-authored feedback text only. Avatar selection stores only an approved `avatar_id`.

**Tech Stack:** Supabase Postgres/RLS, Supabase Realtime optional for refresh, existing frontend, 187 static avatar PNGs.

**Spec:** `docs/superpowers/specs/2026-09-17-zoom-navigator-team-access-design.md`

## Target Tables

```text
public.zoom_usage_events
public.zoom_usage_sessions
public.zoom_presence
public.zoom_feedback_reports
public.zoom_feedback_status_history
private.zoom_admin_notifications
```

### Task 1: Add analytics/presence schema

- [ ] Create `zoom_usage_events` with: `user_id`, `session_id`, `event_type`, `route_id`, `process_id`, `category_id`, `tool_id`, `created_at`; no free-text customer content column.
- [ ] Create `zoom_usage_sessions` with started/ended/active_seconds/last_interaction.
- [ ] Create `zoom_presence` one row/user with `state`, `last_heartbeat`, `last_interaction`.
- [ ] Add RLS: agent may insert/read only own permitted rows; JA may read all.
- [ ] Add indexes on `(user_id, created_at)`, `(event_type, created_at)`, process/category/tool ids, and presence heartbeat.
- [ ] Add privacy constraint/tests to reject oversized/arbitrary JSON payloads; do not create a generic `metadata` text dump.
- [ ] Commit.

### Task 2: Add client usage tracker

**Files:**
- Create `src/features/analytics/usageTracker.js`
- Create `src/features/analytics/usePresence.js`
- Test both.

**Interfaces:**

```js
trackEvent({ eventType, routeId, processId, categoryId, toolId })
markInteraction()
startPresence()
stopPresence()
```

- [ ] Tests prove `trackEvent` has no field for raw search query, note text, clipboard text, or form values.
- [ ] Wire explicit safe events to page/process/category/Quick View/Full Process/copy-action/navigation/tool buttons.
- [ ] Never pass innerText, input values, clipboard values, or customer-entered data.
- [ ] Commit.

### Task 3: Implement active-time and presence semantics

Technical defaults from approved design:
- heartbeat roughly every 60 seconds while authenticated,
- meaningful interaction refreshes `last_interaction`,
- >5 minutes without interaction => Online Idle,
- stale/missing heartbeat => Offline,
- only recent-interaction windows accrue active seconds.

- [ ] Write tests with fake timers for Active -> Idle -> Offline.
- [ ] Write test proving an 8-hour open idle tab does not become 8 active hours.
- [ ] Aggregate active seconds server-side/session-side to avoid client double-counting.
- [ ] Commit.

### Task 4: Add admin usage queries/views

- [ ] Create `security_invoker=true` views or authenticated RPCs for daily/weekly/monthly/custom range.
- [ ] Include users with zero events using left joins from `zoom_profiles`.
- [ ] Produce team metrics: top process/page, top category, top tool/action, active time, sessions, last activity, current presence, trend.
- [ ] Produce per-user metrics with same categories.
- [ ] Add tests for zero-usage user and previous-period trend calculation.
- [ ] Commit.

### Task 5: Build JA Usage UI

- [ ] Admin Home cards: Total Users, Active Now, Online/Idle, Offline, Active Time Today, Open Feedback, Recent Alerts.
- [ ] Usage page filters: Daily, Weekly, Monthly, Custom Date Range.
- [ ] User detail panel opens from user row.
- [ ] No CSV/PDF export controls.
- [ ] Agent role cannot render or query the report.
- [ ] Commit.

### Task 6: Add admin alerts

Alert types:
- account activated,
- invite revoked/regenerated,
- temporary lockout,
- password reset,
- deactivated/reactivated,
- new feedback.

- [ ] Store notifications privately.
- [ ] JA-only RLS/read RPC.
- [ ] Add read/unread state.
- [ ] Build compact in-app alerts panel.
- [ ] Commit.

### Task 7: Add contextual Feedback system

**Schema fields:**

```text
id
reporter_user_id
type
status
route_id
process_id
category_id
page_label
what_noticed
suggested_change
created_at
updated_at
resolved_at
```

Allowed `type` values:
- `missing_information`
- `incorrect_outdated`
- `not_working`
- `ui_ux`
- `change_suggestion`

Allowed `status` values:
- `new`
- `reviewing`
- `planned`
- `resolved`
- `closed`
- `dismissed`

- [ ] Add floating/persistent Feedback button.
- [ ] Auto-fill route/process/category/page label from current Navigator context.
- [ ] Do not auto-capture screenshot, clipboard, form values, or notes.
- [ ] Agent enters only feedback text/suggested change.
- [ ] JA queue supports status changes and status history.
- [ ] “Open Page” deep-links to the stored safe route/process identifier.
- [ ] New submission creates admin alert.
- [ ] Tests cover context capture and status history.
- [ ] Commit.

### Task 8: Add 187 built-in avatars

**Assets:** prepared pack `avatar_assets_final.zip` from the approved conversation.

**Target:**

```text
public/avatars/avatar_001.png
...
public/avatars/avatar_187.png
src/features/profile/avatarCatalog.js
src/features/profile/AvatarPicker.jsx
```

- [ ] Copy all 187 individual avatar files; do not include names/text from source sheets.
- [ ] Build a static allowlist `AVATAR_IDS` for exactly 187 IDs.
- [ ] Add DB constraint/RPC validation so only allowlisted IDs can be stored.
- [ ] Build gallery with lazy images, keyboard selection, selected state, preview, Save.
- [ ] Show selected avatar in My Profile, top-right user menu, Team Management, user usage detail, and feedback reporter display.
- [ ] Test avatar change does not modify username, initials, role, or historical IDs.
- [ ] Commit.

### Task 9: Privacy verification gate

- [ ] Search database columns and event payload builders for `name`, `email`, `phone`, `meeting`, `note`, `clipboard`, `screenshot`, `password` and confirm no analytics capture path exists.
- [ ] Submit a fake support workflow containing sensitive-looking strings and verify `zoom_usage_events` contains only identifiers/timestamps.
- [ ] Verify feedback is the only place agent-authored free text is intentionally stored.
- [ ] Run Security Advisor, tests, lint, build, diff-check.
