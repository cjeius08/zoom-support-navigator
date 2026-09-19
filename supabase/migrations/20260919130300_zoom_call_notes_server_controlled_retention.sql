drop trigger if exists zoom_call_notes_touch_updated_at on public.zoom_call_notes;
drop function if exists private.zoom_touch_call_note_updated_at();

create or replace function private.zoom_enforce_call_note_server_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
    new.expires_at := now() + interval '90 days';
  else
    new.id := old.id;
    new.user_id := old.user_id;
    new.created_at := old.created_at;
    new.expires_at := old.expires_at;
    new.updated_at := now();
  end if;

  return new;
end;
$$;

revoke all on function private.zoom_enforce_call_note_server_fields() from public, anon, authenticated;

create trigger zoom_call_notes_enforce_server_fields
before insert or update on public.zoom_call_notes
for each row execute function private.zoom_enforce_call_note_server_fields();
