-- Keep Recently Viewed writes behind the validated RPC.
revoke all on table public.zoom_recently_viewed from authenticated;
grant select, delete on table public.zoom_recently_viewed to authenticated;
