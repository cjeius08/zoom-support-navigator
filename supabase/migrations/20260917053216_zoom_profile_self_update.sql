create policy "users update own avatar" on public.zoom_profiles
  for update to authenticated
  using (auth.uid() = id and private.zoom_has_valid_access())
  with check (auth.uid() = id and private.zoom_has_valid_access());
