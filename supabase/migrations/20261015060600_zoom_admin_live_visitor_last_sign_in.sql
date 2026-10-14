-- Admin-only last successful login timestamps for the compact Home presence dropdown.
-- Stored timestamps come from Supabase Auth, not inferred from usage/heartbeat.
-- Never expose auth.users through a client-side table grant.
create or replace function public.zoom_admin_live_visitor_logins(requested_user_ids uuid[])
returns table(user_id uuid, last_sign_in_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
      or not (select private.zoom_is_creator_admin())
      or not (select private.zoom_has_valid_access()) then
    raise exception 'Not authorized to read team login timestamps.' using errcode = '42501';
  end if;
  if requested_user_ids is null
      or coalesce(array_length(requested_user_ids, 1), 0) > 100 then
    raise exception 'Invalid team member request.' using errcode = '22023';
  end if;
  return query
    select u.id, u.last_sign_in_at
    from auth.users as u
    join public.zoom_profiles as p on p.id = u.id
    where u.id = any(requested_user_ids)
      and p.status = 'active'
    limit 100;
end;
$$;
revoke all on function public.zoom_admin_live_visitor_logins(uuid[]) from public, anon, authenticated;
grant execute on function public.zoom_admin_live_visitor_logins(uuid[]) to authenticated;
