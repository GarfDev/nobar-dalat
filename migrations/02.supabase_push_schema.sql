-- Table: push_subscriptions
-- Stores Web Push subscriptions for users
create table public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.match_pool(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one subscription per user (simplified for MVP, in reality user might have multiple devices)
  constraint unique_user_subscription unique (user_id)
);

-- Policy to allow anyone to insert (since we don't have auth)
alter table public.push_subscriptions enable row level security;

create policy "Enable insert for all users"
on public.push_subscriptions
for insert
with check (true);
