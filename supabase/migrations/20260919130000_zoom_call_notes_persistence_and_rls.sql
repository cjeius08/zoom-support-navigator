create table if not exists public.zoom_call_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.zoom_profiles(id) on delete cascade,
  caller_ref text,
  device text,
  outcome text,
  call_started_at timestamptz,
  note_text text not null,
  draft jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  constraint zoom_call_notes_caller_ref_len check (caller_ref is null or char_length(caller_ref) <= 160),
  constraint zoom_call_notes_device_len check (device is null or char_length(device) <= 80),
  constraint zoom_call_notes_outcome_len check (outcome is null or char_length(outcome) <= 120),
  constraint zoom_call_notes_note_text_len check (char_length(note_text) between 1 and 20000),
  constraint zoom_call_notes_draft_object check (jsonb_typeof(draft) = 'object'),
  constraint zoom_call_notes_draft_size check (pg_column_size(draft) <= 32768)
);

create index if not exists zoom_call_notes_user_created_idx
  on public.zoom_call_notes (user_id, created_at desc);

create index if not exists zoom_call_notes_expires_idx
  on public.zoom_call_notes (expires_at);

alter table public.zoom_call_notes enable row level security;

revoke all on table public.zoom_call_notes from anon;
grant select, insert, update, delete on table public.zoom_call_notes to authenticated;

drop policy if exists "own or admin call notes read" on public.zoom_call_notes;
create policy "own or admin call notes read"
on public.zoom_call_notes
for select
to authenticated
using (
  ((select auth.uid()) = user_id and private.zoom_has_valid_access())
  or private.zoom_is_creator_admin()
);

drop policy if exists "own call notes insert" on public.zoom_call_notes;
create policy "own call notes insert"
on public.zoom_call_notes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and private.zoom_has_valid_access()
);

drop policy if exists "own call notes update" on public.zoom_call_notes;
create policy "own call notes update"
on public.zoom_call_notes
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and private.zoom_has_valid_access()
)
with check (
  (select auth.uid()) = user_id
  and private.zoom_has_valid_access()
);

drop policy if exists "own call notes delete" on public.zoom_call_notes;
create policy "own call notes delete"
on public.zoom_call_notes
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  and private.zoom_has_valid_access()
);

create or replace function private.zoom_touch_call_note_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.zoom_touch_call_note_updated_at() from public, anon, authenticated;

drop trigger if exists zoom_call_notes_touch_updated_at on public.zoom_call_notes;
create trigger zoom_call_notes_touch_updated_at
before update on public.zoom_call_notes
for each row execute function private.zoom_touch_call_note_updated_at();
