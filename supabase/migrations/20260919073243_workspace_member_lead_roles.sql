alter table public.zoom_profiles
  add column if not exists workspace_role text;

update public.zoom_profiles
set workspace_role = 'member'
where workspace_role is null;

alter table public.zoom_profiles
  alter column workspace_role set default 'member',
  alter column workspace_role set not null;

alter table public.zoom_profiles
  drop constraint if exists zoom_profiles_workspace_role_check;

alter table public.zoom_profiles
  add constraint zoom_profiles_workspace_role_check
  check (workspace_role in ('member','lead'));

alter table public.zoom_agent_slots
  add column if not exists workspace_role text;

update public.zoom_agent_slots
set workspace_role = 'member'
where workspace_role is null;

alter table public.zoom_agent_slots
  alter column workspace_role set default 'member',
  alter column workspace_role set not null;

alter table public.zoom_agent_slots
  drop constraint if exists zoom_agent_slots_workspace_role_check;

alter table public.zoom_agent_slots
  add constraint zoom_agent_slots_workspace_role_check
  check (workspace_role in ('member','lead'));

create or replace function public.zoom_service_admin_generate_invite(
  actor uuid,
  requested_initials text,
  requested_hash text,
  requested_workspace_role text
)
returns table(slot_id uuid, invite_id uuid)
language plpgsql
security definer
set search_path=public,private,pg_catalog
as $$
declare
  existing_slot uuid;
  normalized_role text := lower(trim(requested_workspace_role));
begin
  if not exists(
    select 1 from public.zoom_profiles
    where id=actor and role='creator_admin' and status='active'
  ) then
    raise exception 'creator admin required';
  end if;

  if upper(trim(requested_initials)) !~ '^[A-Z]{2,3}$' then
    raise exception 'invalid initials';
  end if;

  if normalized_role not in ('member','lead') then
    raise exception 'invalid workspace role';
  end if;

  if exists(
    select 1 from public.zoom_profiles
    where initials=upper(trim(requested_initials))
  ) then
    raise exception 'initials already in use';
  end if;

  select s.id into existing_slot
  from public.zoom_agent_slots s
  where s.initials=upper(trim(requested_initials))
  for update;

  if existing_slot is null then
    insert into public.zoom_agent_slots(initials,status,created_by,workspace_role)
    values(upper(trim(requested_initials)),'pending',actor,normalized_role)
    returning id into existing_slot;
  elsif exists(
    select 1 from public.zoom_agent_slots s
    where s.id=existing_slot and s.status='claimed'
  ) then
    raise exception 'initials already claimed';
  else
    update public.zoom_agent_slots s
    set status='pending',
        created_by=actor,
        workspace_role=normalized_role,
        updated_at=now()
    where s.id=existing_slot;
  end if;

  update private.zoom_invites zi
  set state='revoked',revoked_at=now()
  where zi.slot_id=existing_slot and zi.state in ('active','claiming');

  return query
  insert into private.zoom_invites(slot_id,code_hash,state,created_by)
  values(existing_slot,requested_hash,'active',actor)
  returning private.zoom_invites.slot_id, private.zoom_invites.id;

  insert into private.zoom_admin_events(actor_user_id,event_type,metadata)
  values(
    actor,
    'invite_generated',
    jsonb_build_object(
      'initials', upper(trim(requested_initials)),
      'workspace_role', normalized_role
    )
  );
end;
$$;

create or replace function public.zoom_service_admin_generate_invite(
  actor uuid,
  requested_initials text,
  requested_hash text
)
returns table(slot_id uuid, invite_id uuid)
language sql
security definer
set search_path=public,private,pg_catalog
as $$
  select *
  from public.zoom_service_admin_generate_invite(
    actor,
    requested_initials,
    requested_hash,
    'member'
  );
$$;

create or replace function public.zoom_service_finalize_activation(
  invite uuid,
  token uuid,
  account uuid,
  internal_email text,
  requested_username text,
  requested_initials text
)
returns boolean
language plpgsql
security definer
set search_path=public,private,pg_catalog
as $$
declare
  selected_workspace_role text;
begin
  if exists(
    select 1 from public.zoom_profiles
    where username=lower(trim(requested_username))
  ) then
    return false;
  end if;

  select coalesce(s.workspace_role, 'member')
  into selected_workspace_role
  from private.zoom_invites i
  join public.zoom_agent_slots s on s.id=i.slot_id
  where i.id=invite;

  if selected_workspace_role not in ('member','lead') then
    selected_workspace_role := 'member';
  end if;

  insert into public.zoom_profiles(
    id,
    username,
    initials,
    role,
    status,
    must_change_password,
    workspace_role
  )
  values(
    account,
    lower(trim(requested_username)),
    upper(trim(requested_initials)),
    'agent',
    'active',
    false,
    selected_workspace_role
  );

  insert into private.zoom_auth_identities(user_id,internal_email)
  values(account,internal_email);

  insert into private.zoom_login_security(user_id)
  values(account);

  if not private.zoom_finalize_invite(invite,token,account) then
    raise exception 'invite finalize failed';
  end if;

  insert into private.zoom_admin_notifications(type,subject_user_id)
  values('account_activated',account);

  return true;
end;
$$;

create or replace function public.zoom_service_admin_set_workspace_role(
  actor uuid,
  target uuid,
  desired_workspace_role text
)
returns boolean
language plpgsql
security definer
set search_path=public,private,pg_catalog
as $$
declare
  normalized_role text := lower(trim(desired_workspace_role));
begin
  if not exists(
    select 1 from public.zoom_profiles
    where id=actor and role='creator_admin' and status='active'
  ) then
    raise exception 'creator admin required';
  end if;

  if normalized_role not in ('member','lead') then
    raise exception 'invalid workspace role';
  end if;

  if not exists(
    select 1 from public.zoom_profiles
    where id=target and role<>'creator_admin'
  ) then
    raise exception 'target unavailable';
  end if;

  update public.zoom_profiles
  set workspace_role=normalized_role,updated_at=now()
  where id=target;

  update public.zoom_agent_slots
  set workspace_role=normalized_role,updated_at=now()
  where claimed_by=target;

  insert into private.zoom_admin_events(actor_user_id,target_user_id,event_type,metadata)
  values(
    actor,
    target,
    'workspace_role_changed',
    jsonb_build_object('workspace_role', normalized_role)
  );

  return true;
end;
$$;

revoke all on function public.zoom_service_admin_generate_invite(uuid,text,text,text)
  from public,anon,authenticated;
revoke all on function public.zoom_service_admin_generate_invite(uuid,text,text)
  from public,anon,authenticated;
revoke all on function public.zoom_service_admin_set_workspace_role(uuid,uuid,text)
  from public,anon,authenticated;

grant execute on function public.zoom_service_admin_generate_invite(uuid,text,text,text)
  to service_role;
grant execute on function public.zoom_service_admin_generate_invite(uuid,text,text)
  to service_role;
grant execute on function public.zoom_service_admin_set_workspace_role(uuid,uuid,text)
  to service_role;
