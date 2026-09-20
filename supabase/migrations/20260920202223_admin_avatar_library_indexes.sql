create index if not exists zoom_avatar_catalog_created_by_idx
  on public.zoom_avatar_catalog(created_by);

create index if not exists zoom_profiles_avatar_id_idx
  on public.zoom_profiles(avatar_id);
