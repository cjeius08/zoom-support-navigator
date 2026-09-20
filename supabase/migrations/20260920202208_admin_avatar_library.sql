create table if not exists public.zoom_avatar_catalog (
  id text primary key,
  source text not null check (source in ('static','storage')),
  storage_path text,
  original_filename text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint zoom_avatar_catalog_storage_path_check check (
    (source = 'static' and storage_path is null) or
    (source = 'storage' and storage_path is not null)
  )
);

alter table public.zoom_avatar_catalog enable row level security;

grant select, insert, delete on public.zoom_avatar_catalog to authenticated;

drop policy if exists "valid users read avatar catalog" on public.zoom_avatar_catalog;
create policy "valid users read avatar catalog"
on public.zoom_avatar_catalog
for select
to authenticated
using (private.zoom_has_valid_access());

drop policy if exists "creator admin inserts avatars" on public.zoom_avatar_catalog;
create policy "creator admin inserts avatars"
on public.zoom_avatar_catalog
for insert
to authenticated
with check (
  private.zoom_is_creator_admin()
  and source = 'storage'
  and created_by = (select auth.uid())
);

drop policy if exists "creator admin deletes avatars" on public.zoom_avatar_catalog;
create policy "creator admin deletes avatars"
on public.zoom_avatar_catalog
for delete
to authenticated
using (private.zoom_is_creator_admin());

insert into public.zoom_avatar_catalog (id, source)
select 'avatar_' || lpad(n::text, 3, '0'), 'static'
from generate_series(1, 103) as n
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'zoom_profiles_avatar_id_catalog_fkey'
  ) then
    alter table public.zoom_profiles
      add constraint zoom_profiles_avatar_id_catalog_fkey
      foreign key (avatar_id)
      references public.zoom_avatar_catalog(id)
      on delete set null;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'zoom-avatars',
  'zoom-avatars',
  true,
  5242880,
  array['image/webp','image/png','image/jpeg']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "creator admin lists avatar objects" on storage.objects;
create policy "creator admin lists avatar objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'zoom-avatars'
  and private.zoom_is_creator_admin()
);

drop policy if exists "creator admin uploads avatar objects" on storage.objects;
create policy "creator admin uploads avatar objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'zoom-avatars'
  and private.zoom_is_creator_admin()
);

drop policy if exists "creator admin deletes avatar objects" on storage.objects;
create policy "creator admin deletes avatar objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'zoom-avatars'
  and private.zoom_is_creator_admin()
);
