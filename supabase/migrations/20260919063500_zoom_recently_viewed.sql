-- Batch 2: per-user Recently Viewed history (max 8)
create table if not exists public.zoom_recently_viewed (
  user_id uuid not null references public.zoom_profiles(id) on delete cascade,
  item_type text not null check (item_type in ('process', 'common_issue')),
  item_id text not null check (char_length(item_id) between 1 and 160),
  viewed_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

alter table public.zoom_recently_viewed enable row level security;

drop policy if exists "own recent read" on public.zoom_recently_viewed;
create policy "own recent read"
  on public.zoom_recently_viewed
  for select
  to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

drop policy if exists "own recent delete" on public.zoom_recently_viewed;
create policy "own recent delete"
  on public.zoom_recently_viewed
  for delete
  to authenticated
  using (((select auth.uid()) = user_id) and private.zoom_has_valid_access());

revoke all on table public.zoom_recently_viewed from anon;
grant select, delete on table public.zoom_recently_viewed to authenticated;

create index if not exists zoom_recently_viewed_user_time_idx
  on public.zoom_recently_viewed(user_id, viewed_at desc);

create or replace function public.zoom_record_recent_view(
  p_item_type text,
  p_item_id text
)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null or not private.zoom_has_valid_access() then
    raise exception 'Not authorized';
  end if;

  if p_item_type not in ('process', 'common_issue') then
    raise exception 'Unsupported recent item type';
  end if;

  if p_item_id is null or char_length(p_item_id) < 1 or char_length(p_item_id) > 160 then
    raise exception 'Invalid recent item id';
  end if;

  insert into public.zoom_recently_viewed(user_id, item_type, item_id, viewed_at)
  values (v_user_id, p_item_type, p_item_id, now())
  on conflict (user_id, item_type, item_id)
  do update set viewed_at = excluded.viewed_at;

  delete from public.zoom_recently_viewed
  where user_id = v_user_id
    and (item_type, item_id) in (
      select item_type, item_id
      from public.zoom_recently_viewed
      where user_id = v_user_id
      order by viewed_at desc, item_type, item_id
      offset 8
    );
end;
$$;

revoke all on function public.zoom_record_recent_view(text, text) from public;
grant execute on function public.zoom_record_recent_view(text, text) to authenticated;
