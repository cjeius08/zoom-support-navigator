# Zoom Support Console Final Gap-Closing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete source-driven live-call guidance, secure JA account lifecycle controls, and the approved authenticated Console visual system without changing approved source content or the existing login/auth model.

**Architecture:** Parse the existing, hash-verified `process.text` into a lossless call-guide model consumed by `ProcessDrawer`. Route every privileged team mutation through a session-validated `admin-account` Edge Function, backed by narrowly scoped service RPCs and immutable creator-admin checks. Keep the application as React/HTML/CSS while applying the approved warm workspace and translucent graphite material system to the authenticated shell.

**Tech Stack:** React/Vite, Vitest/Testing Library, Supabase Edge Functions (Deno), Postgres RLS/RPCs, GitHub Pages.

**Spec:** `C:\Users\jabdu\.codex\attachments\6d81ae56-c192-44c9-8daa-e3ca2bb7252f\pasted-text.txt` and `C:\Users\jabdu\.codex\attachments\7791ab0e-0f7b-4ec3-9932-44eb3dd78ad0\pasted-text.txt`

## Global Constraints

- Preserve all 27 exact source process texts and `processes.source.test.js` hashes.
- Use only the dedicated Supabase project `eefpsujuvwfkpuiejtft`; never touch Medify.
- Browser code uses only the Supabase publishable key; no service-role/secret key is committed or exposed.
- Keep the approved login design unchanged except for real regressions.
- Do not invent support procedures, fake dashboard data, or unsupported Team Management capabilities.
- Keep GitHub Pages routing and deployment configuration intact.

### Task 1: Source-driven Call Guide

**Files:**
- Modify: `src/features/navigator/processText.js`, `src/features/navigator/ProcessDrawer.jsx`
- Test: `src/features/navigator/processText.test.js`, `src/features/navigator/ProcessDrawer.test.jsx`

- [ ] Add failing parser tests for numbered source steps, adjacent Sample Script blocks, source Quick Guide, important/limitation/referral sections, and a clearly labelled derived script fallback.
- [ ] Implement a pure `buildCallGuide(process)` model that preserves source order and distinguishes `source` from `derived` wording.
- [ ] Replace Quick View with Call Guide cards, copy actions, visual-tab linking, related training entries, and source-backed callouts.
- [ ] Run focused tests and source hash regression tests.

### Task 2: Secure Team Management lifecycle

**Files:**
- Create: `supabase/functions/admin-account/index.ts`
- Create via CLI/migration: `supabase/migrations/*_zoom_admin_account_actions.sql`
- Modify: `src/lib/adminApi.js`, `src/features/admin/AdminViews.jsx`
- Test: `src/lib/adminApi.test.js`, `src/features/admin/AdminViews.test.jsx`, `supabase/functions/_shared/identity.test.ts`

- [ ] Add failing frontend unit tests for creator-only controls and confirmation/validation behaviour.
- [ ] Add secure service RPCs for pending-slot invite lifecycle, profile changes, status changes, and account history deletion; only `service_role` may execute them.
- [ ] Implement the server-side creator-admin Edge Function. Validate the active session, immutable profile role/status, action payload, and self-protection before privileged Auth or RPC operations.
- [ ] Wire compact action menus/modals to the Edge Function; do not mutate protected records directly from browser queries.
- [ ] Deploy and verify changed migration/function only against `eefpsujuvwfkpuiejtft` after checks.

### Task 3: Authenticated Console visual system

**Files:**
- Modify: `src/features/shell/AppShell.jsx`, `src/features/navigator/Navigator.jsx`, `src/features/admin/AdminViews.jsx`, `src/styles.css`
- Test: `src/features/shell/AppShell.test.jsx`, `src/features/navigator/Navigator.test.jsx`

- [ ] Add failing tests for consistent SVG navigation labels, account header, compact category card affordances, and active navigation state.
- [ ] Introduce an HTML/CSS workspace background layer and graphite-glass sidebar/header/panel material system matching the approved annotated dashboard reference without mockup data.
- [ ] Replace Unicode nav glyphs with a consistent inline SVG set and enrich real category/search/process surfaces.
- [ ] Add keyboard Escape/focus-return handling to drawer and account/action dialogs.
- [ ] Capture desktop and mobile authenticated visual smoke screenshots and compare against the supplied reference.

### Task 4: Final verification and release

- [ ] Run focused tests, full `npm test`, lint, production build, `git diff --check`, and frontend secret scan.
- [ ] Run Supabase CLI/advisors relevant to the changed migration/function and verify CORS and public RLS assumptions.
- [ ] Commit only code/assets; leave supplied references and temporary QA artifacts untracked.
- [ ] Push `main`, wait for GitHub Pages, and smoke-test public assets/routes. Report private-account test limitations without requesting credentials.
