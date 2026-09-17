create or replace function private.zoom_protect_creator() returns trigger language plpgsql security definer set search_path=public,private,pg_catalog as $$ begin
 if old.role='creator_admin' and (tg_op='DELETE' or new.role <> 'creator_admin' or new.status <> 'active') then raise exception 'Creator admin cannot be changed, deactivated, or deleted'; end if; return coalesce(new,old); end $$;
create trigger zoom_creator_guard before update or delete on public.zoom_profiles for each row execute function private.zoom_protect_creator();
