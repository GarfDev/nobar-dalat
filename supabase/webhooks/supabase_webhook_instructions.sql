-- Create a trigger to call the Edge Function on new message
create extension if not exists "pg_net";

-- Note: You usually create triggers via the Supabase Dashboard or using `pg_net` / `supabase_functions` extension.
-- This SQL assumes you are using Supabase's native webhook feature or pg_net.
-- Here is the simplified logic for documentation purposes.

-- Trigger for New Messages
create trigger "on_new_message"
after insert on public.messages
for each row
execute function supabase_functions.http_request(
  'https://kvcaqnarrtzbwxmhhifn.supabase.co/functions/v1/push',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

-- NOTE: The above SQL is pseudo-code for how triggers work internally in Supabase.
-- The recommended way is to go to Supabase Dashboard > Database > Webhooks
-- 1. Name: push-notification
-- 2. Table: public.messages
-- 3. Events: INSERT
-- 4. Type: HTTP Request
-- 5. URL: https://kvcaqnarrtzbwxmhhifn.supabase.co/functions/v1/push
-- 6. Method: POST
-- 7. Headers: Content-Type: application/json, Authorization: Bearer [SERVICE_ROLE_KEY]
