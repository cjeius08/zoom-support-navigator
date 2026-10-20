-- Preserve an existing authenticated session when an unrelated sign-in fails.
-- Previously the login Edge Function passed session = NULL for every incorrect
-- password, which wrote current_session_id = NULL and revoked a legitimate
-- already-signed-in agent through private.zoom_has_valid_access().
--
-- A successful sign-in still supplies a non-NULL session UUID, replacing the
-- previous one: the established single-session policy is unchanged.
-- Creator-admin deactivation and password reset continue to clear the session
-- directly through their separate privileged service functions.

create or replace function public.zoom_service_set_login_security(
  account uuid,
  failures integer,
  window_started timestamptz,
  locked timestamptz,
  session uuid
)
returns void
language sql
security definer
set search_path = public, private, pg_catalog
as $$
  update private.zoom_login_security
     set failed_attempts = failures,
         failure_window_started_at = window_started,
         locked_until = locked,
         current_session_id = coalesce(session, current_session_id),
         updated_at = now()
   where user_id = account;
$$;

revoke all on function public.zoom_service_set_login_security(uuid, integer, timestamptz, timestamptz, uuid)
  from public, anon, authenticated;
grant execute on function public.zoom_service_set_login_security(uuid, integer, timestamptz, timestamptz, uuid)
  to service_role;
