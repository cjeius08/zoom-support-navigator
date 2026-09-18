# Phase 7 · Batch 2 — Disposable Agent Lifecycle Pilot Results

**Date:** 2026-09-19  
**Disposable identity:** `pilot_qat` / initials `QAT`  
**Scope:** Disposable account only. No real JA or agent account was modified or deleted.

## Result

The disposable lifecycle pilot completed successfully for account activation, normal login, avatar save/persistence, self-service password change, forced-change/session invalidation state, deactivation, reactivation, permanent deletion, and cleanup.

## Verified lifecycle

1. **Invite / activation**
   - A one-time QAT slot/invite was created.
   - The disposable account activated successfully through the live UI.
   - Username `pilot_qat` was created as an active agent.

2. **Normal agent use**
   - The account signed in successfully.
   - An approved built-in avatar was selected and saved.
   - The saved avatar was confirmed in `zoom_profiles.avatar_id`.
   - The account changed its own password successfully through the live UI.

3. **Avatar defect discovered and fixed during pilot**
   - The saved avatar existed in Supabase but disappeared visually after logout/login because the username-login path returned a lightweight user object without rehydrating the full profile.
   - The login path now reloads the full profile after the session is created.
   - Avatar centering, selected-state visibility, and the header avatar size were also improved and shipped during the pilot.

4. **JA password-reset state**
   - The database-side rule used by the JA reset flow was executed against the disposable account.
   - `must_change_password` changed to `true`.
   - The previous login session was invalidated.
   - A `password_reset` admin event was recorded.
   - **Tooling limitation:** the connected automation layer does not expose Supabase Auth Admin password mutation and blocks raw temporary-password handling, so the Edge Function's actual Auth-password replacement was not automated here. The forced-change/session-invalidating half of the same reset flow was verified directly.

5. **Deactivate / reactivate**
   - JA deactivation changed the account to `deactivated`.
   - Under an authenticated-agent context, the deactivated identity could no longer read its own profile through RLS and `zoom_has_valid_access()` returned false.
   - JA reactivation restored the profile to `active`.
   - The old session remained invalid and `must_change_password` remained true as expected.

6. **Permanent delete**
   - The production delete-prep function ran with the disposable username confirmation.
   - The disposable Auth user was deleted.
   - The profile row cascaded away.
   - Linked login-security, usage events, usage sessions, presence, feedback, Readiness attempts, Readiness answers, and admin events involving the disposable identity were confirmed removed.
   - The claimed QAT slot was correctly released to pending by the production delete flow.

7. **Pilot cleanup**
   - The now-unclaimed disposable QAT slot and any remaining QAT invite were removed so Team Management stays clean.
   - The temporary `http` extension used during pilot setup was removed.
   - Final audit confirmed no QAT slot, QAT invite, Auth user, profile, or linked disposable history remained.

## Batch 2 status

**PASS with one manual-only coverage gap:** the Auth Admin temporary-password replacement portion of JA Reset Password was not automated because the connected toolchain does not permit raw temporary-password handling. All surrounding reset state, authorization, session invalidation, lifecycle, deletion, and cleanup behavior passed.

## Next checkpoint

**Phase 7 · Batch 3 — Controlled Team Pilot**

Use JA plus one explicitly designated non-disposable sample agent. Do not perform destructive account operations on that real agent.
