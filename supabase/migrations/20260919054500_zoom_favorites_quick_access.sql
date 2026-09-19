-- Batch 1: per-user Favorites / Quick Access
create table if not exists public.zoom_favorites (
  user_id uuid not null references public.zoom_profiles(id) on delete cascade,
  item_type text not null check (item_type in ('process', 'common_issue')),
  item_id text not null check (char_length(item_id) between 1 and 160),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

alter table public.zoom_favorites enable row level security;

drop policy if exists "own favorites read" on public.zoom_favorites;
create policy "own favorites read"
  on public.zoom_favorites
  for select
  to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own favorites insert" on public.zoom_favorites;
create policy "own favorites insert"
  on public.zoom_favorites
  for insert
  to authenticated
  with check (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own favorites delete" on public.zoom_favorites;
create policy "own favorites delete"
  on public.zoom_favorites
  for delete
  to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

revoke all on table public.zoom_favorites from anon;
grant select, insert, delete on table public.zoom_favorites to authenticated;

create index if not exists zoom_favorites_user_created_idx
  on public.zoom_favorites(user_id, created_at desc);
