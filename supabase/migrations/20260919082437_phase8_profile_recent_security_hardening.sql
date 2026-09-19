-- Phase 8 Batch 3: least-privilege hardening for profile self-service and Recently Viewed.

-- Profiles are readable through RLS, but normal users only need to directly
-- mutate their own avatar. All other account fields are changed by protected
-- service-role/admin flows.
revoke all privileges on table public.zoom_profiles from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.zoom_profiles from authenticated;

grant select on table public.zoom_profiles to authenticated;
grant update (avatar_id) on table public.zoom_profiles to authenticated;

-- Recently Viewed should never be callable anonymously.
revoke all on function public.zoom_record_recent_view(text, text) from public, anon;

-- Let the authenticated caller perform the recent-view upsert under RLS so the
-- RPC no longer needs SECURITY DEFINER.
drop policy if exists "own recent insert" on public.zoom_recently_viewed;
create policy "own recent insert"
  on public.zoom_recently_viewed
  for insert
  to authenticated
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own recent update" on public.zoom_recently_viewed;
create policy "own recent update"
  on public.zoom_recently_viewed
  for update
  to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access())
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

grant insert, update on table public.zoom_recently_viewed to authenticated;

create or replace function public.zoom_record_recent_view(
  p_item_type text,
  p_item_id text
)
returns void
language plpgsql
security invoker
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized';
  end if;

  if p_item_type not in ('process', 'common_issue') then
    raise exception 'Unsupported recent item type';
  end if;

  if p_item_id is null or char_length(p_item_id) < 1 or char_length(p_item_id) > 160 then
    raise exception 'Invalid recent item id';
  end if;

  insert into public.zoom_recently_viewed(user_id, item_type, item_id, viewed_at)
  values (v_user_id, p_item_type, p_item_id, now())
  on conflict (user_id, item_type, item_id)
  do update set viewed_at = excluded.viewed_at;

  delete from public.zoom_recently_viewed
  where user_id = v_user_id
    and (item_type, item_id) in (
      select item_type, item_id
      from public.zoom_recently_viewed
      where user_id = v_user_id
      order by viewed_at desc, item_type, item_id
      offset 8
    );
end;
$$;

revoke all on function public.zoom_record_recent_view(text, text) from public, anon;
grant execute on function public.zoom_record_recent_view(text, text) to authenticated;
