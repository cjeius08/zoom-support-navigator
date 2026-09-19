-- Batch 3: Ozzie first-login onboarding + true permanent account deletion.

alter table public.zoom_profiles
  add column if not exists ozzie_intro_seen_at timestamptz;

create or replace function public.zoom_mark_ozzie_intro_seen()
returns timestamptz
language plpgsql
security definer
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
  set ozzie_intro_seen_at = coalesce(ozzie_intro_seen_at, v_seen),
      updated_at = now()
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

-- A permanent account delete must remove the claimed agent slot too.
-- Keep the slot attached until Auth deletion succeeds, then cascade it away.
alter table public.zoom_agent_slots
  drop constraint if exists zoom_agent_slots_claimed_by_fkey;

alter table public.zoom_agent_slots
  add constraint zoom_agent_slots_claimed_by_fkey
  foreign key (claimed_by)
  references public.zoom_profiles(id)
  on delete cascade;

create or replace function public.zoom_service_admin_prepare_delete(actor uuid, target uuid, confirmation text)
returns boolean
language plpgsql
security definer
set search_path=public,private,pg_catalog
as $$
declare
  target_username text;
  target_initials text;
begin
  if not exists(
    select 1
    from public.zoom_profiles
    where id=actor and role='creator_admin' and status='active'
  ) then
    raise exception 'creator admin required';
  end if;

  select username::text, initials
    into target_username,target_initials
  from public.zoom_profiles
  where id=target and role<>'creator_admin'
  for update;

  if target_username is null then
    raise exception 'target unavailable';
  end if;

  if lower(trim(confirmation)) not in (lower(target_username),lower(target_initials)) then
    raise exception 'confirmation does not match';
  end if;

  delete from private.zoom_admin_events
  where actor_user_id=target or target_user_id=target;

  insert into private.zoom_admin_events(actor_user_id,event_type,metadata)
  values(actor,'account_delete_requested',jsonb_build_object('target',target));

  return true;
end;
$$;

revoke all on function public.zoom_service_admin_prepare_delete(uuid,uuid,text)
  from public,anon,authenticated;
grant execute on function public.zoom_service_admin_prepare_delete(uuid,uuid,text)
  to service_role;
