create or replace function public.zoom_service_admin_actor_valid(actor uuid, session uuid)
returns boolean language sql stable security definer set search_path=public,private,pg_catalog as $$
  select exists (
    select 1 from public.zoom_profiles p
    join private.zoom_login_security s on s.user_id=p.id
    where p.id=actor and p.role='creator_admin' and p.status='active' and s.current_session_id=session
  );
$$;

create or replace function public.zoom_service_admin_generate_invite(actor uuid, requested_initials text, requested_hash text)
returns table(slot_id uuid, invite_id uuid) language plpgsql security definer set search_path=public,private,pg_catalog as $$
declare existing_slot uuid;
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if upper(trim(requested_initials)) !~ '^[A-Z]{2,3}$' then raise exception 'invalid initials'; end if;
  if exists(select 1 from public.zoom_profiles where initials=upper(trim(requested_initials))) then raise exception 'initials already in use'; end if;
  select id into existing_slot from public.zoom_agent_slots where initials=upper(trim(requested_initials)) for update;
  if existing_slot is null then
    insert into public.zoom_agent_slots(initials,status,created_by) values(upper(trim(requested_initials)),'pending',actor) returning id into existing_slot;
  elsif exists(select 1 from public.zoom_agent_slots where id=existing_slot and status='claimed') then
    raise exception 'initials already claimed';
  else
    update public.zoom_agent_slots set status='pending',created_by=actor,updated_at=now() where id=existing_slot;
  end if;
  update private.zoom_invites set state='revoked',revoked_at=now() where slot_id=existing_slot and state in ('active','claiming');
  return query insert into private.zoom_invites(slot_id,code_hash,state,created_by) values(existing_slot,requested_hash,'active',actor) returning existing_slot,id;
  insert into private.zoom_admin_events(actor_user_id,event_type,metadata) values(actor,'invite_generated',jsonb_build_object('initials',upper(trim(requested_initials))));
end $$;

create or replace function public.zoom_service_admin_rename_username(actor uuid, target uuid, requested_username text)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if lower(trim(requested_username)) !~ '^[a-z0-9_]{3,}$' then raise exception 'invalid username'; end if;
  if exists(select 1 from public.zoom_profiles where username=lower(trim(requested_username)) and id<>target) then raise exception 'username already in use'; end if;
  if not exists(select 1 from public.zoom_profiles where id=target and role<>'creator_admin') then raise exception 'target unavailable'; end if;
  update public.zoom_profiles set username=lower(trim(requested_username)),updated_at=now() where id=target;
  insert into private.zoom_admin_events(actor_user_id,target_user_id,event_type) values(actor,target,'username_renamed');
  return true;
end $$;

create or replace function public.zoom_service_admin_rename_initials(actor uuid, target uuid, requested_initials text)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if upper(trim(requested_initials)) !~ '^[A-Z]{2,3}$' then raise exception 'invalid initials'; end if;
  if exists(select 1 from public.zoom_profiles where initials=upper(trim(requested_initials)) and id<>target) or exists(select 1 from public.zoom_agent_slots where initials=upper(trim(requested_initials)) and claimed_by<>target) then raise exception 'initials already in use'; end if;
  if not exists(select 1 from public.zoom_profiles where id=target and role<>'creator_admin') then raise exception 'target unavailable'; end if;
  update public.zoom_profiles set initials=upper(trim(requested_initials)),updated_at=now() where id=target;
  update public.zoom_agent_slots set initials=upper(trim(requested_initials)),updated_at=now() where claimed_by=target;
  insert into private.zoom_admin_events(actor_user_id,target_user_id,event_type) values(actor,target,'initials_renamed');
  return true;
end $$;

create or replace function public.zoom_service_admin_set_status(actor uuid, target uuid, desired_status text)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if desired_status not in ('active','deactivated') then raise exception 'invalid status'; end if;
  if not exists(select 1 from public.zoom_profiles where id=target and role<>'creator_admin') then raise exception 'target unavailable'; end if;
  update public.zoom_profiles set status=desired_status,updated_at=now() where id=target;
  if desired_status='deactivated' then update private.zoom_login_security set current_session_id=null,updated_at=now() where user_id=target; end if;
  insert into private.zoom_admin_events(actor_user_id,target_user_id,event_type) values(actor,target,case when desired_status='active' then 'account_reactivated' else 'account_deactivated' end);
  return true;
end $$;

create or replace function public.zoom_service_admin_mark_password_reset(actor uuid, target uuid)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if not exists(select 1 from public.zoom_profiles where id=target and role<>'creator_admin') then raise exception 'target unavailable'; end if;
  update public.zoom_profiles set must_change_password=true,updated_at=now() where id=target;
  update private.zoom_login_security set current_session_id=null,updated_at=now() where user_id=target;
  insert into private.zoom_admin_events(actor_user_id,target_user_id,event_type) values(actor,target,'password_reset');
  return true;
end $$;

create or replace function public.zoom_service_admin_prepare_delete(actor uuid, target uuid, confirmation text)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
declare target_username text; target_initials text;
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  select username::text,initials into target_username,target_initials from public.zoom_profiles where id=target and role<>'creator_admin' for update;
  if target_username is null then raise exception 'target unavailable'; end if;
  if lower(trim(confirmation)) not in (lower(target_username),lower(target_initials)) then raise exception 'confirmation does not match'; end if;
  delete from private.zoom_admin_events where actor_user_id=target or target_user_id=target;
  delete from private.zoom_invites where slot_id in (select id from public.zoom_agent_slots where claimed_by=target);
  update public.zoom_agent_slots set status='pending',claimed_by=null,updated_at=now() where claimed_by=target;
  insert into private.zoom_admin_events(actor_user_id,event_type,metadata) values(actor,'account_deleted',jsonb_build_object('target',target));
  return true;
end $$;

revoke all on function public.zoom_service_admin_actor_valid(uuid,uuid), public.zoom_service_admin_generate_invite(uuid,text,text), public.zoom_service_admin_rename_username(uuid,uuid,text), public.zoom_service_admin_rename_initials(uuid,uuid,text), public.zoom_service_admin_set_status(uuid,uuid,text), public.zoom_service_admin_mark_password_reset(uuid,uuid), public.zoom_service_admin_prepare_delete(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.zoom_service_admin_actor_valid(uuid,uuid), public.zoom_service_admin_generate_invite(uuid,text,text), public.zoom_service_admin_rename_username(uuid,uuid,text), public.zoom_service_admin_rename_initials(uuid,uuid,text), public.zoom_service_admin_set_status(uuid,uuid,text), public.zoom_service_admin_mark_password_reset(uuid,uuid), public.zoom_service_admin_prepare_delete(uuid,uuid,text) to service_role;
