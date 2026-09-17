revoke execute on function public.zoom_service_login_lookup(text), public.zoom_service_set_login_security(uuid,integer,timestamptz,timestamptz,uuid) from anon, authenticated, public;
grant execute on function public.zoom_service_login_lookup(text), public.zoom_service_set_login_security(uuid,integer,timestamptz,timestamptz,uuid) to service_role;
