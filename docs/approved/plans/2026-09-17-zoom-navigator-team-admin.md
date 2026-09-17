# Zoom Navigator Frontend Auth + Team Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the secure auth backend into the existing Navigator and give JA complete Team Management without altering support-process content.

**Architecture:** Keep `App` focused on routing/composition and isolate auth/admin behavior into feature modules. The browser stores only normal Supabase session tokens and calls Edge Functions for privileged account actions. Agent UI goes directly from login to Navigator; JA gets compact admin entry points.

**Tech Stack:** Existing frontend source after handoff, Supabase JS client, existing project test runner, React Testing Library/Vitest if React/Vite.

**Spec:** `docs/superpowers/specs/2026-09-17-zoom-navigator-team-access-design.md`

## Source Handoff Requirement

Do not start this plan until an editable current-source snapshot is available. Preserve all existing Navigator content and process behavior.

## Target Feature Structure

```text
src/
  lib/
    supabaseClient.js
    authApi.js
  features/
    auth/
      AuthGate.jsx
      LoginForm.jsx
      ActivateAccountForm.jsx
      ForcePasswordChange.jsx
      auth.test.jsx
    profile/
      MyAccount.jsx
    admin/
      AdminHome.jsx
      TeamManagement.jsx
      AgentRow.jsx
      InviteControls.jsx
      ResetPasswordDialog.jsx
      DeleteAgentDialog.jsx
      admin.test.jsx
```

### Task 1: Establish frontend baseline

**Files:** existing source only.

- [ ] Run baseline tests, lint, build, and `git diff --check` before edits.
- [ ] Capture current navigation/search/process regression tests or add a smoke test that opens the existing Navigator home/process view.
- [ ] Commit only if a baseline test had to be added.

### Task 2: Add Supabase client + auth API adapter

**Files:**
- Create `src/lib/supabaseClient.js`
- Create `src/lib/authApi.js`
- Test `src/lib/authApi.test.js`

**Interfaces:**

```js
export async function loginWithUsername(username, password)
export async function activateAccount({ initials, inviteCode, username, password })
export async function changeOwnPassword(password)
export async function getCurrentProfile()
export async function signOut()
```

- [ ] Write failing adapter tests with mocked Edge Function responses.
- [ ] Implement adapter with project URL + publishable key only.
- [ ] After `loginWithUsername`, call `supabase.auth.setSession({ access_token, refresh_token })`.
- [ ] Never place hidden email, secret key, or admin credentials in browser code.
- [ ] Run tests and commit.

### Task 3: Add auth gate and login/activation UI

**Files:** `src/features/auth/*`, integrate minimally into app shell.

- [ ] Test signed-out users see username/password form and Activate Account entry.
- [ ] Test normal login success enters Navigator directly.
- [ ] Test generic credential error does not reveal unknown usernames.
- [ ] Test deactivated/locked/session-replaced messages are distinct and actionable.
- [ ] Test activation validates 2–3 letter initials, username format, and 8-char password locally before request.
- [ ] Implement and commit.

### Task 4: Add forced password-change gate

- [ ] Test `must_change_password=true` blocks Navigator rendering.
- [ ] Test there is no Skip control.
- [ ] Test logout remains available.
- [ ] Test successful password change unlocks Navigator.
- [ ] Implement and commit.

### Task 5: Add My Account

**Behavior:** Agents see initials, username, fallback initials avatar, Change Password, Logout. Agents cannot edit username/initials.

- [ ] Add tests for allowed/forbidden controls.
- [ ] Implement password change using `changeOwnPassword`.
- [ ] Commit.

### Task 6: Add JA Admin Home + Team Management shell

**Behavior:** Agent role never receives admin routes/content; JA receives Admin Home with Team Management shortcut.

- [ ] Test route authorization by role, not hidden-button-only behavior.
- [ ] Implement Team Management list including pending, active, and deactivated users.
- [ ] Render fallback initials avatar, initials, username, and account status. Do not invent presence/last-activity data here; Plan C adds those fields once tracking exists.
- [ ] Commit.

### Task 7: Add admin account actions through one protected Edge Function

**Backend file created/extended:** `supabase/functions/admin-account/index.ts`

**Action union:**

```ts
type AdminAction =
  | { action: 'create_slot'; initials: string }
  | { action: 'generate_invite'; slot_id: string }
  | { action: 'revoke_invite'; invite_id: string }
  | { action: 'rename_initials'; user_id: string; initials: string }
  | { action: 'rename_username'; user_id: string; username: string }
  | { action: 'reset_password'; user_id: string; temporary_password: string }
  | { action: 'deactivate'; user_id: string }
  | { action: 'reactivate'; user_id: string }
  | { action: 'delete_permanently'; user_id: string; confirmation: string }
```

- [ ] Write backend tests ensuring every action rejects non-JA users.
- [ ] Create slot: enforce current initials uniqueness and 2–3 uppercase letters.
- [ ] Generate invite: revoke current active invite first, generate a new high-entropy code, store SHA-256 hash only, return raw code once.
- [ ] Rename username/initials: preserve user UUID/history.
- [ ] Reset password: Auth admin update + `must_change_password=true`.
- [ ] Deactivate/reactivate: update profile status and revoke/replace access state as specified.
- [ ] Permanent delete: require exact current username OR initials; refuse JA; remove Auth user and linked history transactionally/compensating where Auth API sits outside SQL transaction.
- [ ] Append admin events for each action.
- [ ] Deploy and commit.

### Task 8: Build Team Management controls

- [ ] Test pending slot shows Generate/Copy/Revoke/Regenerate invite controls.
- [ ] Test active user shows Edit Initials, Change Username, Reset Password, Deactivate, Delete.
- [ ] Test deactivated user shows Reactivate.
- [ ] Test username change takes effect immediately in the UI.
- [ ] Test destructive delete requires typed current initials/username and has no one-click path.
- [ ] Implement dialogs with focus return/Escape handling.
- [ ] Commit.

### Task 9: End-to-end lifecycle QA

Run a JA + sample-agent lifecycle:

```text
JA login
→ create slot CB
→ generate invite
→ activate CB
→ CB username/password login
→ CB self password change
→ JA rename CB -> CH
→ JA rename username
→ JA reset password
→ forced change
→ deactivate
→ verify blocked
→ reactivate
→ verify same credentials after password state are valid
→ delete with typed confirmation
→ verify login impossible and history deletion rule honored
```

Run test/lint/build/diff-check and commit verified fixes.
