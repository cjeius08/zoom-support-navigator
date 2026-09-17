create or replace function public.zoom_service_reserve_invite(requested_initials text, requested_hash text, token uuid)
returns table(invite_id uuid, reserved_slot_id uuid)
language sql security definer set search_path=public,private,pg_catalog
as $$ select * from private.zoom_reserve_invite(requested_initials,requested_hash,token); $$;

create or replace function public.zoom_service_finalize_activation(invite uuid, token uuid, account uuid, internal_email text, requested_username text, requested_initials text)
returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$
begin
  if exists(select 1 from public.zoom_profiles where username=lower(trim(requested_username))) then return false; end if;
  insert into public.zoom_profiles(id,username,initials,role,status,must_change_password) values(account,lower(trim(requested_username)),upper(trim(requested_initials)),'agent','active',false);
  insert into private.zoom_auth_identities(user_id,internal_email) values(account,internal_email);
  insert into private.zoom_login_security(user_id) values(account);
  if not private.zoom_finalize_invite(invite,token,account) then raise exception 'invite finalize failed'; end if;
  insert into private.zoom_admin_notifications(type,subject_user_id) values('account_activated',account);
  return true;
end $$;

create or replace function public.zoom_service_release_invite(invite uuid, token uuid)
returns boolean language sql security definer set search_path=public,private,pg_catalog
as $$ select private.zoom_release_invite(invite,token); $$;

revoke all on function public.zoom_service_reserve_invite(text,text,uuid),public.zoom_service_finalize_activation(uuid,uuid,uuid,text,text,text),public.zoom_service_release_invite(uuid,uuid) from public,anon,authenticated;
grant execute on function public.zoom_service_reserve_invite(text,text,uuid),public.zoom_service_finalize_activation(uuid,uuid,uuid,text,text,text),public.zoom_service_release_invite(uuid,uuid) to service_role;
