create extension if not exists pg_cron;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'zoom_call_notes_retention'
  limit 1;

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end
$$;

select cron.schedule(
  'zoom_call_notes_retention',
  '17 3 * * *',
  $$delete from public.zoom_call_notes where expires_at <= now();$$
);
