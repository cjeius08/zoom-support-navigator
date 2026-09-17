create extension if not exists citext;
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;

create table public.zoom_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique check (username::text ~ '^[A-Za-z0-9_]{3,}$'),
  initials text not null unique check (initials ~ '^[A-Z]{2,3}$'),
  role text not null check (role in ('creator_admin','agent')),
  status text not null default 'active' check (status in ('active','deactivated')),
  must_change_password boolean not null default false,
  avatar_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.zoom_agent_slots (
 id uuid primary key default gen_random_uuid(), initials text not null unique check (initials ~ '^[A-Z]{2,3}$'),
 status text not null default 'pending' check (status in ('pending','claimed','disabled')),
 claimed_by uuid references public.zoom_profiles(id) on delete set null, created_by uuid references auth.users(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table private.zoom_auth_identities (user_id uuid primary key references auth.users(id) on delete cascade, internal_email citext not null unique, created_at timestamptz not null default now());
create table private.zoom_login_security (user_id uuid primary key references auth.users(id) on delete cascade, failed_attempts integer not null default 0 check (failed_attempts >= 0), failure_window_started_at timestamptz, locked_until timestamptz, current_session_id uuid, updated_at timestamptz not null default now());
create table private.zoom_admin_events (id bigint generated always as identity primary key, actor_user_id uuid references auth.users(id) on delete set null, target_user_id uuid references auth.users(id) on delete set null, event_type text not null, metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 4096), created_at timestamptz not null default now());

create or replace function private.zoom_has_valid_access() returns boolean language sql stable security definer set search_path = public, private, pg_catalog as $$
  select exists (select 1 from public.zoom_profiles p join private.zoom_login_security s on s.user_id=p.id where p.id=auth.uid() and p.status='active' and s.current_session_id::text = auth.jwt()->>'session_id');
$$;
create or replace function private.zoom_is_creator_admin() returns boolean language sql stable security definer set search_path = public, private, pg_catalog as $$
 select private.zoom_has_valid_access() and exists(select 1 from public.zoom_profiles where id=auth.uid() and role='creator_admin' and status='active');
$$;
revoke all on all tables in schema private from public;
revoke all on function private.zoom_has_valid_access() from public;
revoke all on function private.zoom_is_creator_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.zoom_has_valid_access(), private.zoom_is_creator_admin() to authenticated;
alter table public.zoom_profiles enable row level security;
alter table public.zoom_agent_slots enable row level security;
create policy "self or JA reads profiles" on public.zoom_profiles for select to authenticated using ((auth.uid()=id and private.zoom_has_valid_access()) or private.zoom_is_creator_admin());
create policy "JA manages slots" on public.zoom_agent_slots for all to authenticated using (private.zoom_is_creator_admin()) with check (private.zoom_is_creator_admin());
