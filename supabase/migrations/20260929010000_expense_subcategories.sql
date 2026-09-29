create table if not exists public.expense_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories(id),
  name text not null check (char_length(name) between 1 and 60),
  search_key text not null,
  created_at timestamptz not null default now(),
  unique (category_id, search_key),
  unique (id, category_id)
);

alter table public.expense_subcategories enable row level security;
revoke all on table public.expense_subcategories from anon, authenticated;
grant select, insert, update, delete on table public.expense_subcategories to service_role;

alter table public.expenses
  add column if not exists subcategory_id uuid references public.expense_subcategories(id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'expenses_subcategory_category_fk') then
    alter table public.expenses
      add constraint expenses_subcategory_category_fk
      foreign key (subcategory_id, category_id)
      references public.expense_subcategories(id, category_id);
  end if;
end $$;

create index if not exists expense_subcategories_category_id_idx
  on public.expense_subcategories (category_id, created_at);
