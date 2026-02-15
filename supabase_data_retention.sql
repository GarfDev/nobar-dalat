-- Enable the pg_cron extension (requires Supabase project setting to be enabled)
-- In Supabase, you can enable this in Database > Extensions
create extension if not exists pg_cron;

-- Create a function to delete old user data
create or replace function delete_old_match_data()
returns void as $$
begin
  -- Delete users from match_pool who are older than 7 days
  delete from public.match_pool
  where created_at < now() - interval '7 days';
  
  -- Cascading delete should handle messages and push_subscriptions if foreign keys are set up correctly
  -- If not, delete them manually:
  -- delete from public.messages where created_at < now() - interval '7 days';
end;
$$ language plpgsql;

-- Schedule the job to run every day at midnight
select cron.schedule(
  'delete-old-data-daily', -- job name
  '0 0 * * *',             -- cron schedule (midnight daily)
  'select delete_old_match_data()'
);

-- Note: If pg_cron is not available on your plan, you can use an Edge Function triggered by a scheduled webhook (e.g., GitHub Actions or a cron service).
