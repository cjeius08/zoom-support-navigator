create or replace function public.zoom_service_admin_generate_invite(actor uuid, requested_initials text, requested_hash text)
returns table(slot_id uuid, invite_id uuid)
language plpgsql
security definer
set search_path to 'public', 'private', 'pg_catalog'
as $function$
declare existing_slot uuid;
begin
  if not exists(select 1 from public.zoom_profiles where id=actor and role='creator_admin' and status='active') then raise exception 'creator admin required'; end if;
  if upper(trim(requested_initials)) !~ '^[A-Z]{2,3}$' then raise exception 'invalid initials'; end if;
  if exists(select 1 from public.zoom_profiles where initials=upper(trim(requested_initials))) then raise exception 'initials already in use'; end if;

  select s.id into existing_slot
  from public.zoom_agent_slots s
  where s.initials=upper(trim(requested_initials))
  for update;

  if existing_slot is null then
    insert into public.zoom_agent_slots(initials,status,created_by)
    values(upper(trim(requested_initials)),'pending',actor)
    returning id into existing_slot;
  elsif exists(select 1 from public.zoom_agent_slots s where s.id=existing_slot and s.status='claimed') then
    raise exception 'initials already claimed';
  else
    update public.zoom_agent_slots s
    set status='pending',created_by=actor,updated_at=now()
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
  values(actor,'invite_generated',jsonb_build_object('initials',upper(trim(requested_initials))));
end
$function$;
