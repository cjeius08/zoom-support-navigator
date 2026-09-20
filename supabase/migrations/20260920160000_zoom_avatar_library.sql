-- Extend the existing avatar catalog with the bundled assets shipped by this
-- build. The catalog and storage bucket are created by the existing avatar
-- library migrations; this migration must remain additive and preserve rows.

alter table public.zoom_profiles
  drop constraint if exists zoom_avatar_id;

alter table public.zoom_profiles
  add constraint zoom_avatar_id
  check (avatar_id is null or avatar_id ~ '^avatar_[A-Za-z0-9-]{1,96}$');

insert into public.zoom_avatar_catalog (id, source, storage_path, original_filename)
select
  format('avatar_%s', lpad(index_value::text, 3, '0')),
  'static',
  null,
  null
from generate_series(1, 187) as generated(index_value)
where index_value not between 151 and 177
on conflict (id) do nothing;
