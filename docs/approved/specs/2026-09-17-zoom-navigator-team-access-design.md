# Zoom Navigator Team Access, Admin, Analytics, Feedback, and Profiles — Design Spec

**Date:** 2026-09-17  
**Status:** Approved product design; written spec ready for final user review before implementation planning.

## 1. Goal

Turn the existing Zoom Navigator into a secure team tool with individual username/password accounts, JA-controlled onboarding and administration, metadata-only usage analytics, presence, feedback reporting, and avatar-based profile customization.

The Zoom Navigator must use its **own Supabase project**. The Medify Support Navigator Supabase project and data must remain untouched.

The implementation must preserve the Navigator's existing process content and behavior unless a change is explicitly part of this spec. Final professional visual redesign happens after the functional system is stable.

## 2. Roles and identity

### 2.1 Permanent creator/admin

- JA is the permanent creator/admin account.
- JA signs in using a normal username and password.
- JA may change their own username and password.
- The permanent admin role must be tied to an immutable internal identity, not to the visible username or initials.
- The JA account cannot be demoted, deactivated, or deleted through normal app controls.

### 2.2 Agent

An agent may:

- Sign in using username + password.
- Use the Zoom Navigator.
- Open My Profile.
- Change their own password.
- Choose and change an avatar from the approved built-in avatar library.
- Submit feedback/issues.
- Log out.

An agent may not:

- Access Team Management.
- Access Admin Reports.
- Access other agents' usage or profile-management controls.
- Change their own initials or username.
- Generate/revoke invites.
- Activate/deactivate/delete users.

Authorization must be enforced server-side/database-side, not merely by hiding UI.

## 3. Internal user identity

Each person has one immutable internal user ID. All historical records attach to that ID rather than to username or initials.

Changing initials or username must not split or lose history.

## 4. Username rules

- Username is the normal login identifier.
- Minimum length: 3 characters.
- Allowed characters: lowercase/uppercase letters, numbers, underscore.
- No spaces, dots, or hyphens.
- Username comparison is case-insensitive.
- Usernames are globally unique among current accounts.
- JA can rename an agent's username.
- A username change takes effect immediately; the old username stops working.
- An old username becomes available for reuse after a rename or deletion.

## 5. Initials rules

- Initials are controlled by JA.
- Exactly 2–3 letters.
- Displayed/stored in uppercase normalized form.
- Initials are unique among current active/pending agent slots.
- JA may rename initials later.
- Old initials become available for reuse immediately after rename.
- Historical activity continues to belong to the immutable user ID.

## 6. Password rules

- Minimum length: 8 characters.
- No required uppercase, lowercase, number, or symbol rule beyond the minimum length.
- Passwords must never be stored or exposed as plaintext by the application.
- Agents can change their own password from My Profile / My Account.

## 7. JA-only password recovery

There is no self-service email recovery.

Flow:

1. Agent contacts JA.
2. JA opens Team Management and chooses Reset Password.
3. JA sets or generates a temporary password.
4. Account is marked `must_change_password = true`.
5. Agent signs in using the temporary password.
6. Before any Navigator access, the app requires a new password.
7. There is no Skip option.
8. After successful change, `must_change_password = false` and the agent enters the Navigator.

JA never sees the agent's final permanent password.

## 8. Username-only login architecture

The visible experience is strictly **Username + Password**. Agents do not enter an email address.

Because Supabase Auth password sign-in is based on Auth identities rather than native application usernames, the app must use a secure server-side login gateway or equivalent mapping layer. The frontend sends username/password to a protected server function, the server resolves the username to the internal Auth identity, and Supabase remains responsible for password verification/session issuance.

No service-role/secret credential may appear in the browser bundle or public repository.

## 9. Agent invite and activation flow

### 9.1 JA creates an agent slot

1. JA opens Team Management.
2. JA enters 2–3 letter initials.
3. JA creates the pending agent slot.
4. JA clicks Generate Invite Code.

### 9.2 Invite rules

- One active invite per agent slot.
- No automatic expiration.
- Invite remains valid until used or manually revoked.
- Generating a new invite automatically revokes the previous unused invite.
- Invite is single-use.
- Used or revoked invite codes cannot be reactivated.
- Invite records remain available for audit/history unless the related user is permanently deleted under the destructive-delete rules.
- Raw invite secrets should not be stored in retrievable plaintext form after generation; store a secure verifier/hash where practical.

### 9.3 Agent activation

1. Agent chooses Activate Account.
2. Agent enters assigned initials + invite code.
3. System validates the agent slot and invite.
4. Agent chooses their own username.
5. Agent chooses and confirms password.
6. Account is created and linked to the pending agent slot.
7. Invite is consumed atomically so it cannot be reused.
8. Agent proceeds to normal login / signed-in Navigator flow.

Double-submit/race conditions must not create duplicate accounts.

## 10. Login screen

Signed-out screen includes:

- Username
- Password
- Sign In
- Activate Account

It does not include:

- Email field
- Google sign-in
- Public open registration
- Email-based Forgot Password

## 11. Failed-login protection

- Repeated wrong passwords trigger a temporary account lock.
- Default implementation target: 5 failed attempts within 10 minutes causes a 15-minute temporary lock.
- Successful sign-in resets the failure counter.
- User-facing failure text remains generic and must not reveal whether a username exists.
- JA receives an in-app admin alert when an account is temporarily locked.

Exact thresholds may be implemented as constants/configuration so they can be changed later without redesigning the schema.

## 12. Single-session rule

Only one active session is allowed per account.

When the same account signs in elsewhere:

- The newest session becomes current.
- The prior session loses protected access and is returned to login when it next attempts protected activity/session validation.

The application should enforce this through an app-level current-session token/ID so it does not rely on a plan-specific Supabase setting.

## 13. Logout and idle behavior

- There is **no automatic idle logout**.
- A logged-in tab can remain signed in.
- Idle status and active-time accounting are separate from authentication/session validity.

## 14. Presence states

JA sees three meaningful states:

- **Active now** — signed in, heartbeat is current, and recent real interaction occurred.
- **Online · Idle** — signed in / heartbeat is current but there has been no recent real interaction.
- **Offline** — no current/still-valid presence heartbeat/session.

Recommended initial timing:

- Heartbeat approximately every 60 seconds while the app is open.
- Mark idle after roughly 5 minutes without meaningful interaction.
- Mark offline after presence heartbeat becomes stale.

The exact stale-heartbeat window can be tuned during QA.

## 15. Active-time calculation

Do not use `login time - logout time` as active time.

Active time should accrue only during periods of recent meaningful Navigator interaction. A tab that remains open in the background must not accumulate unlimited active time.

Reports display:

- Exact active duration.
- Trend compared with the previous comparable period.

## 16. Usage analytics — privacy boundary

The product owner selected broad instrumentation **within a strict metadata-only privacy boundary**.

### 16.1 Allowed event examples

- Page/process viewed
- Category opened
- Quick View opened
- Full Process opened
- Search action used
- Navigation action
- Tool/button clicked
- Copy-action button used
- Process/category/tool frequency
- Session started/ended
- Login/logout
- Presence heartbeat
- Active/idle state transitions
- Last activity
- App version / route identifier / non-sensitive UI context

### 16.2 Never collect

- Customer names
- Customer email addresses
- Customer phone numbers
- Meeting IDs or meeting passwords
- Support notes
- Typed form content
- Search terms when they may include customer/private content
- Clipboard contents
- Copied script contents
- Screenshots
- Keystrokes
- Passwords
- Sensitive/private Navigator content payloads

Usage analytics records that an action occurred, not the private data involved in the action.

## 17. JA Admin Home

Default admin landing page is a simple overview with shortcuts rather than a dense analytics wall.

Recommended summary cards:

- Total users
- Active now
- Online/Idle
- Offline
- Total active time today
- New/open feedback count
- Recent admin alerts

Primary shortcuts:

- Team Management
- Usage Analytics
- Feedback
- Admin Alerts

## 18. Team Management

Each user row should show enough information to manage the account quickly, including:

- Avatar
- Initials
- Username
- Account status
- Presence status
- Last activity
- Pending activation status where applicable

JA actions:

- Edit Initials
- Change Username
- Reset Password
- View Usage
- Deactivate
- Reactivate
- Delete Permanently
- Generate / Copy / Revoke / Regenerate invite for pending accounts

## 19. Deactivation and reactivation

### Deactivation

- Completely blocks the agent from protected Navigator access.
- Preserves account and all historical activity.
- Existing sessions must fail authorization after the next protected access/session validation.

### Reactivation

- Restores access to the same account.
- Existing username/password remains valid.
- No new invite is required.

## 20. Permanent deletion

JA is allowed to permanently delete an agent.

This is intentionally destructive and removes:

- Auth account
- App profile
- Presence/session records
- Usage events/history
- User-scoped feedback ownership/history where required by the selected all-data deletion rule
- User-specific admin notifications/security records
- Any other user-linked historical records

Confirmation requires typing the agent's current initials or username before enabling the final destructive action.

There is no undo.

The permanent JA creator/admin account cannot be deleted.

## 21. Admin Usage Reports

Visible only to JA.

### 21.1 Team-level reporting

- Most visited process/page
- Most used category
- Most used tools/actions
- Daily usage
- Weekly usage
- Monthly usage
- Custom date range
- Total active time
- Login/session count
- Last activity
- Active now / Online Idle / Offline
- Users with zero usage
- Team-level trend summaries

### 21.2 User detail

JA can click an individual user and view that user's:

- Active time
- Session count
- Most visited processes/pages
- Most used categories
- Most used tools/actions
- Activity trend
- Last activity
- Current presence status

### 21.3 Export

No CSV or PDF export in the initial version.

## 22. Admin alerts

In-app alerts only; no email alerts.

Examples:

- New agent activated
- Invite revoked/regenerated
- Account temporarily locked after failed sign-ins
- Password reset performed
- User deactivated/reactivated
- New feedback submitted

## 23. Feedback and Issue Reporting

This is a permanent product feature, not branded as beta feedback.

### 23.1 Agent experience

A persistent, unobtrusive **Feedback** / **Report an Issue** control is available throughout the Navigator.

When opened, the form automatically captures the current non-sensitive page context such as:

- Route/page ID
- Category
- Process ID/title
- App version
- Reporter user ID/initials
- Submission timestamp

Agent selects a type:

- Missing Information
- Incorrect / Outdated Information
- Something Isn't Working
- UI / UX Issue
- Change / Suggestion

Fields:

- **What did you notice?**
- **What should be changed?** (optional)

No screenshot/file attachments in the initial version to reduce accidental capture of customer/private data.

### 23.2 JA feedback queue

JA can view all reports with:

- Reporter
- Avatar
- Submitted time
- Exact page/process context
- Feedback type
- Description
- Suggested change
- Status

Statuses:

- New
- Reviewing
- Planned
- Resolved
- Closed
- Dismissed / Not Applicable

JA can use **Open Page** to jump to the relevant Navigator location.

Status changes retain a lightweight status-history/audit record.

## 24. Profile and avatar customization

### 24.1 My Profile

Agent sees:

- Selected avatar
- Initials
- Username
- Change Avatar
- Change Password
- Logout

Agents cannot edit their own initials or username.

### 24.2 Avatar library

- Use only approved built-in avatar assets bundled with the website.
- No personal photo upload in the initial version.
- Current prepared avatar set contains 187 separated avatar images.
- Source-sheet names such as David/Kai/Omar/etc. are not part of the avatar files or user-visible identity.
- Database stores only an avatar identifier such as `avatar_037`, not image binary data.
- Avatar may be changed any time.

Avatar appears in:

- My Profile
- Account menu
- Team Management
- User detail / usage view
- Feedback reports

Avatar is cosmetic only and does not affect identity, authorization, or historical linkage.

## 25. Data model — logical design

Exact SQL names may change during implementation, but the schema should separate responsibilities clearly.

### `profiles`

- `id` — internal/Auth user ID
- `username_normalized`
- `initials`
- `role`
- `status` / `is_active`
- `avatar_id`
- `must_change_password`
- `current_session_id`
- timestamps

### `agent_slots` / `agent_initials`

- pending/assigned initials
- activation state
- linked user ID once claimed
- timestamps

### `invite_codes`

- ID
- agent slot / initials link
- secure code verifier/hash
- created by
- created at
- used at / used by
- revoked at / revoked by

No expiry column is required for product behavior unless retained nullable for future use.

### `auth_security`

- user/username mapping
- failed-attempt window/counter
- temporary lock-until timestamp
- security timestamps

### `usage_events`

Metadata-only event stream:

- user ID
- session ID
- event type
- page/process/category/tool identifiers
- timestamp
- safe non-sensitive metadata

### `usage_sessions`

- user ID
- session ID
- start/end
- accumulated active time
- last activity
- current/ended state

### `presence`

- user ID
- session ID
- last heartbeat
- last meaningful interaction
- computed/derivable presence state

### `admin_events`

Audit/security history for privileged actions such as:

- invite create/revoke/regenerate
- username/initial changes
- password reset
- deactivate/reactivate
- permanent delete attempt/completion where appropriate

### `admin_notifications`

JA-visible in-app notifications.

### `feedback_reports`

- ID
- reporter user ID
- type
- page/process/category context
- report text
- requested/suggested change text
- status
- created/updated timestamps

### `feedback_status_history`

- feedback ID
- previous/new status
- changed by
- timestamp

## 26. Security architecture

- Dedicated Zoom Supabase project.
- Frontend contains only the Supabase project URL and publishable/public client key.
- Never expose `service_role`, secret key, database password, or privileged admin credential in browser code.
- Enable RLS on every exposed table.
- Do not rely on client-editable user metadata for authorization.
- Privileged account-management actions run through protected server-side functions/Edge Functions.
- Every privileged function verifies the authenticated caller is the permanent JA creator/admin before performing the action.
- Agent policies restrict access to the agent's own allowed rows only.
- Deactivation and session validation are enforced server-side/database-side in addition to UI route guards.
- Security-definer functions, if genuinely necessary, must be tightly scoped, placed outside exposed schemas where practical, validate `auth.uid()`, and have explicit execute permissions.

## 27. Error handling

The UI should provide clear but non-sensitive errors.

Examples:

- Generic wrong-login message.
- Username unavailable.
- Initials unavailable.
- Invite invalid/revoked/already used.
- Account temporarily locked.
- Account deactivated.
- Session replaced by a newer login.
- Feedback submission failed / retry.

Privileged actions should be idempotent where practical and must not leave partial user/account state when a multi-step operation fails.

## 28. Testing requirements

Testing must cover at minimum:

### Authentication

- Valid username/password login
- Wrong password
- Unknown username without username-existence leak
- Temporary lockout
- Single-session replacement
- Deactivated-account denial
- Reactivation
- Self password change
- JA reset password
- Forced password change after reset

### Invites

- Valid activation
- Wrong initials
- Wrong code
- Revoked code
- Reused code
- Regenerated code invalidates old code
- Concurrent/double redemption

### Authorization

- Agent cannot access Team Management
- Agent cannot access Admin Usage
- Agent cannot access other agents' data
- JA retains admin authority after username change
- JA cannot delete/deactivate self through normal controls

### Usage/privacy

- Expected metadata events are created
- Active-time does not continue indefinitely while idle
- Presence transitions Active → Idle → Offline correctly
- Event payloads do not contain customer/private content

### Feedback

- Current page/process context captured correctly
- Agent can submit
- JA can review/status-change/open relevant page
- Status history recorded

### Profiles

- Avatar can be selected and changed
- Only approved avatar IDs accepted
- Avatar change does not affect identity/history

### Destructive deletion

- Confirmation required
- User and selected all-history records are deleted
- JA account cannot be deleted

## 29. UI direction

Final redesign occurs only after functional QA passes.

Approved direction:

- Dark professional theme
- Warm textured premium character
- Deep charcoal / espresso surfaces
- Warm bronze/champagne accents
- Subtle texture/grain
- Strong readability and hierarchy
- Responsive at smaller desktop/window widths
- Avoid neon gradients, excessive glassmorphism, icon clutter, and generic AI-dashboard styling

Agent login should be simple and premium. After normal login, agent goes directly into Zoom Navigator rather than through a dashboard.

## 30. Implementation order

1. Confirm current Zoom Navigator repository/project location and baseline tests/build.
2. Configure dedicated Supabase connection.
3. Create schema/RLS foundation.
4. Implement username/password login gateway and JA creator/admin identity.
5. Implement session validation and logout.
6. Implement agent slots + invite activation.
7. Implement self password change and JA password reset/forced change.
8. Implement Team Management edits, deactivate/reactivate, permanent deletion.
9. Implement failed-login protection and one-session rule.
10. Implement usage event tracking and active-time accounting.
11. Implement presence states.
12. Implement JA Admin Home and Usage Reports.
13. Implement in-app admin alerts.
14. Implement Feedback / Issue Reporting.
15. Add profile/avatar gallery using the prepared 187 assets.
16. Run functional, authorization, privacy, and destructive-action QA.
17. Controlled team testing with JA + sample agent(s).
18. Final professional UI/UX redesign without changing approved behavior.
19. Production rollout.

## 31. Acceptance criteria

The feature set is ready for functional rollout when all of the following are true:

- JA can create an agent slot and generate/revoke/regenerate a one-time invite.
- Agent can activate using initials + invite and choose username/password.
- Normal login requires username/password only.
- Username/initial changes preserve history.
- JA can reset passwords; reset forces the agent to set a new password.
- Agent can change their own password.
- Deactivation blocks protected access while preserving history.
- Reactivation restores same-account access.
- Permanent delete removes the user and all selected linked history after typed confirmation.
- Only one active session per user is honored.
- Failed-login temporary lock works.
- Agent goes directly to the Navigator after login.
- JA can see Active / Online Idle / Offline states.
- JA can see daily/weekly/monthly/custom-range metadata-only usage and per-user breakdowns.
- Users with zero usage are visible.
- Agents cannot access admin/team reports.
- Feedback automatically captures page/process context and is visible/manageable by JA.
- Agent can select from the built-in avatar library and change avatar later.
- No sensitive customer content is stored in analytics.
- No privileged Supabase key is present in public frontend code.
- Medify Supabase remains untouched.

## 32. Explicitly deferred

Not part of the initial implementation unless separately approved later:

- User-uploaded personal profile photos
- Feedback screenshot/file attachments
- Email-based password recovery
- Email notifications
- CSV/PDF usage export
- AI-generated support recommendations inside the Navigator
- Final theme/redesign before core functional QA is complete
