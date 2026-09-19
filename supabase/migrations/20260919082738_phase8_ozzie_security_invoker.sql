-- Phase 8 Batch 3: make the Ozzie onboarding marker least-privilege too.

grant update (ozzie_intro_seen_at) on table public.zoom_profiles to authenticated;

drop policy if exists "users update own avatar" on public.zoom_profiles;
drop policy if exists "users update own self-service fields" on public.zoom_profiles;

create policy "users update own self-service fields"
  on public.zoom_profiles
  for update
  to authenticated
  using (((select auth.uid()) = id) and private.zoom_has_valid_access())
  with check (((select auth.uid()) = id) and private.zoom_has_valid_access());

create or replace function public.zoom_mark_ozzie_intro_seen()
returns timestamptz
language plpgsql
security invoker
set search_path = public, private, pg_temp
as $$
declare
  v_seen timestamptz := now();
  v_user uuid := auth.uid();
begin
  if v_user is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized';
  end if;

  update public.zoom_profiles
  set ozzie_intro_seen_at = coalesce(ozzie_intro_seen_at, v_seen)
  where id = v_user
  returning ozzie_intro_seen_at into v_seen;

  if not found then
    raise exception 'Profile unavailable';
  end if;

  return v_seen;
end;
$$;

revoke all on function public.zoom_mark_ozzie_intro_seen() from public, anon;
grant execute on function public.zoom_mark_ozzie_intro_seen() to authenticated;
