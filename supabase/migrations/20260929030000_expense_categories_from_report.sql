-- Match the cafe's expense headings while keeping older expense records intact.

-- Reuse the salary row so its existing subcategories stay attached.
update public.expense_categories
set name = 'Lương Sơn + Dũng', search_key = 'luong son + dung'
where search_key = 'luong & nhan su'
  and not exists (
    select 1 from public.expense_categories
    where search_key = 'luong son + dung'
  );

insert into public.expense_categories (name, search_key) values
  ('Chi phí rượu', 'chi phi ruou'),
  ('Chi phí CCDC, NVL', 'chi phi ccdc, nvl'),
  ('Chi phí cố định', 'chi phi co dinh'),
  ('Lương Sơn + Dũng', 'luong son + dung'),
  ('Tái đầu tư', 'tai dau tu'),
  ('Chi ngoài nhóm', 'chi ngoai nhom')
on conflict (search_key) do update set name = excluded.name;

-- Keep the two one-off items as choices under the catch-all category.
insert into public.expense_subcategories (category_id, name, search_key)
select category.id, item.name, item.search_key
from public.expense_categories as category
cross join (values
  ('Chuyển khoản cho Du', 'chuyen khoan cho du'),
  ('Góp đóng thuế', 'gop dong thue')
) as item(name, search_key)
where category.search_key = 'chi ngoai nhom'
on conflict (category_id, search_key) do nothing;

-- Legacy rows remain for historical expenses. Quick entry hides their keys.
