create extension if not exists pgcrypto;

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  search_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  amount bigint not null check (amount > 0 and amount <= 1000000000000),
  category_id uuid not null references public.expense_categories(id),
  note text not null default '' check (char_length(note) <= 300),
  spent_on date not null,
  payment_method text not null check (payment_method in ('cash', 'transfer')),
  created_at timestamptz not null default now()
);

create index if not exists expenses_spent_on_created_at_idx
  on public.expenses (spent_on desc, created_at desc);

alter table public.expense_categories enable row level security;
alter table public.expenses enable row level security;
revoke all on table public.expense_categories, public.expenses from anon, authenticated;
grant select, insert, update, delete on table public.expense_categories, public.expenses to service_role;

insert into public.expense_categories (name, search_key) values
  ('Nguyên liệu', 'nguyen lieu'),
  ('Lương & nhân sự', 'luong & nhan su'),
  ('Điện nước', 'dien nuoc'),
  ('Mặt bằng', 'mat bang'),
  ('Vật tư', 'vat tu'),
  ('Marketing', 'marketing'),
  ('Đi lại', 'di lai'),
  ('Khác', 'khac')
on conflict (search_key) do nothing;
