-- Defense-in-depth for internal/private tables.
-- Browser roles have no direct table grants; application access goes through
-- SECURITY DEFINER/service-role paths that intentionally bypass RLS.

alter table private.zoom_auth_identities enable row level security;
alter table private.zoom_login_security enable row level security;
alter table private.zoom_admin_events enable row level security;
alter table private.zoom_invites enable row level security;
alter table private.zoom_admin_notifications enable row level security;
alter table private.zoom_readiness_questions enable row level security;
alter table private.zoom_readiness_attempts enable row level security;
alter table private.zoom_readiness_answers enable row level security;
