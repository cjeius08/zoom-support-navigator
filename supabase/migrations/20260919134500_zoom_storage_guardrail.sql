create table if not exists public.zoom_storage_guardrail (
  singleton_key boolean primary key default true check (singleton_key),
  database_bytes bigint not null check (database_bytes >= 0),
  limit_bytes bigint not null default 524288000 check (limit_bytes > 0),
  status text not null check (status in ('safe','warning','critical','urgent','limit_reached')),
  checked_at timestamptz not null default now()
);

alter table public.zoom_storage_guardrail enable row level security;

revoke all on table public.zoom_storage_guardrail from anon, authenticated;
grant select on table public.zoom_storage_guardrail to authenticated;

drop policy if exists "creator admin reads storage guardrail" on public.zoom_storage_guardrail;
create policy "creator admin reads storage guardrail"
on public.zoom_storage_guardrail
for select
to authenticated
using (private.zoom_is_creator_admin());

insert into public.zoom_storage_guardrail (singleton_key, database_bytes, limit_bytes, status, checked_at)
select
  true,
  pg_database_size(current_database()),
  524288000,
  case
    when pg_database_size(current_database()) >= 524288000 then 'limit_reached'
    when pg_database_size(current_database()) >= 498073600 then 'urgent'
    when pg_database_size(current_database()) >= 445644800 then 'critical'
    when pg_database_size(current_database()) >= 367001600 then 'warning'
    else 'safe'
  end,
  now()
on conflict (singleton_key) do update set
  database_bytes = excluded.database_bytes,
  limit_bytes = excluded.limit_bytes,
  status = excluded.status,
  checked_at = excluded.checked_at;

do $$
declare existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'zoom_storage_guardrail_refresh'
  limit 1;
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end
$$;

select cron.schedule(
  'zoom_storage_guardrail_refresh',
  '17 * * * *',
  $job$
    insert into public.zoom_storage_guardrail (singleton_key, database_bytes, limit_bytes, status, checked_at)
    select
      true,
      pg_database_size(current_database()),
      524288000,
      case
        when pg_database_size(current_database()) >= 524288000 then 'limit_reached'
        when pg_database_size(current_database()) >= 498073600 then 'urgent'
        when pg_database_size(current_database()) >= 445644800 then 'critical'
        when pg_database_size(current_database()) >= 367001600 then 'warning'
        else 'safe'
      end,
      now()
    on conflict (singleton_key) do update set
      database_bytes = excluded.database_bytes,
      limit_bytes = excluded.limit_bytes,
      status = excluded.status,
      checked_at = excluded.checked_at;
  $job$
);
