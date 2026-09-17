create or replace function public.zoom_service_create_creator(account uuid, creator_username text, email_address text) returns boolean language plpgsql security definer set search_path=public,private,pg_catalog as $$ begin
 if exists(select 1 from public.zoom_profiles where role='creator_admin') then return false; end if;
 insert into public.zoom_profiles(id,username,initials,role,status,must_change_password) values(account,lower(trim(creator_username)),'JA','creator_admin','active',true);
 insert into private.zoom_auth_identities(user_id,internal_email) values(account,email_address);
 insert into private.zoom_login_security(user_id) values(account);
 return true;
end $$;
revoke execute on function public.zoom_service_create_creator(uuid,text,text) from anon, authenticated, public;
grant execute on function public.zoom_service_create_creator(uuid,text,text) to service_role;
