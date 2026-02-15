-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: match_pool
-- Stores users looking for a match
create table public.match_pool (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  languages text[] not null,
  status text check (status in ('waiting', 'matched', 'cancelled')) default 'waiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  matched_with_id uuid -- ID of the user they are matched with
);

-- Table: messages
-- Stores chat messages between matched users
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid not null references public.match_pool(id),
  receiver_id uuid not null references public.match_pool(id),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Realtime
alter publication supabase_realtime add table public.match_pool;
alter publication supabase_realtime add table public.messages;

-- Create a function to find a match
create or replace function find_match(user_id uuid, user_languages text[])
returns table (matched_user_id uuid)
language plpgsql
as $$
declare
  match_id uuid;
begin
  -- Find a user who is waiting and shares at least one language
  select id into match_id
  from match_pool
  where status = 'waiting'
  and id != user_id
  and languages && user_languages -- Overlap operator for arrays
  order by created_at asc
  limit 1
  for update skip locked; -- Prevent race conditions

  if match_id is not null then
    -- Update both users to matched
    update match_pool
    set status = 'matched', matched_with_id = match_id
    where id = user_id;

    update match_pool
    set status = 'matched', matched_with_id = user_id
    where id = match_id;
    
    return query select match_id;
  end if;

  return;
end;
$$;
