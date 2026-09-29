-- Only the server's Supabase service role may read or update this password hash.
create table if not exists public.private_access (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.private_access enable row level security;
revoke all on table public.private_access from anon, authenticated;
grant select, insert, update on table public.private_access to service_role;
