import { createClient } from "@supabase/supabase-js";
import { categoryKey, type Expense, type ExpenseSubcategory } from "./expense-model";
import type { parseExpenseInput } from "./expense-input";

type ExpenseInput = NonNullable<ReturnType<typeof parseExpenseInput>>;

function database() {
  const url = process.env.SUPABASE_URL || process.env.VITE_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function isExpenseStoreConfigured() {
  return database() !== null;
}

function monthBounds(month: string) {
  const [year, number] = month.split("-").map(Number);
  const next = new Date(Date.UTC(year, number, 1)).toISOString().slice(0, 10);
  return { start: `${month}-01`, next };
}

export async function loadExpenseData(month: string) {
  const db = database();
  if (!db) return { configured: false as const, categories: [] as string[], subcategories: [] as ExpenseSubcategory[], expenses: [] as Expense[] };
  const { start, next } = monthBounds(month);
  const page = (offset: number) => db
    .from("expenses")
    .select("id, amount, note, spent_on, payment_method, created_at, expense_categories(name), expense_subcategories!expenses_subcategory_category_fk(name)")
    .gte("spent_on", start)
    .lt("spent_on", next)
    .order("spent_on", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + 999);
  const [categoriesResult, subcategoriesResult, firstPage] = await Promise.all([
    db.from("expense_categories").select("id, name").order("created_at"),
    db.from("expense_subcategories").select("category_id, name").order("created_at"),
    page(0),
  ]);
  if (categoriesResult.error) throw new Error("Không tải được nhóm chi. Hãy kiểm tra cấu hình bảng Supabase.");
  if (subcategoriesResult.error) throw new Error("Không tải được nhóm chi con. Hãy chạy migration mới trong Supabase.");
  if (firstPage.error) throw new Error("Không tải được chi phí. Hãy kiểm tra kết nối Supabase.");
  const categoryNames = new Map((categoriesResult.data ?? []).map((item) => [item.id, item.name]));
  const subcategories = (subcategoriesResult.data ?? []).flatMap((item) => {
    const category = categoryNames.get(item.category_id);
    return category ? [{ category, name: item.name }] : [];
  });
  const expenses: Expense[] = [];
  let offset = 0;
  let result: Awaited<ReturnType<typeof page>> = firstPage;
  while (true) {
    for (const row of result.data ?? []) {
      const relation = row.expense_categories as { name: string } | { name: string }[] | null;
      const subrelation = row.expense_subcategories as { name: string } | { name: string }[] | null;
      const category = Array.isArray(relation) ? relation[0]?.name : relation?.name;
      const subcategory = Array.isArray(subrelation) ? subrelation[0]?.name : subrelation?.name;
      expenses.push({
        id: String(row.id), amount: Number(row.amount), category: category || "Khác",
        subcategory: subcategory || "",
        note: String(row.note || ""), date: String(row.spent_on),
        paymentMethod: row.payment_method === "transfer" ? "transfer" : "cash",
        createdAt: String(row.created_at),
    });
    }
    if ((result.data?.length ?? 0) < 1000) break;
    offset += 1000;
    result = await page(offset);
    if (result.error) throw new Error("Không tải được chi phí. Hãy kiểm tra kết nối Supabase.");
  }
  return { configured: true as const, categories: (categoriesResult.data ?? []).map((item) => item.name), subcategories, expenses };
}

async function ensureCategory(name: string, db: NonNullable<ReturnType<typeof database>>) {
  const searchKey = categoryKey(name);
  const existing = await db.from("expense_categories").select("id, name").eq("search_key", searchKey).maybeSingle();
  if (existing.error) throw new Error("Không kiểm tra được nhóm chi.");
  if (existing.data) return existing.data;
  const inserted = await db.from("expense_categories").insert({ name, search_key: searchKey }).select("id, name").single();
  if (inserted.data) return inserted.data;
  // Two phones may create the same category at once; use the one that won.
  const concurrent = await db.from("expense_categories").select("id, name").eq("search_key", searchKey).maybeSingle();
  if (concurrent.data) return concurrent.data;
  throw new Error("Không tạo được nhóm chi.");
}

async function ensureSubcategory(categoryId: string, name: string, db: NonNullable<ReturnType<typeof database>>) {
  const searchKey = categoryKey(name);
  const existing = await db.from("expense_subcategories").select("id, name").eq("category_id", categoryId).eq("search_key", searchKey).maybeSingle();
  if (existing.error) throw new Error("Không kiểm tra được nhóm chi con.");
  if (existing.data) return existing.data;
  const inserted = await db.from("expense_subcategories").insert({ category_id: categoryId, name, search_key: searchKey }).select("id, name").single();
  if (inserted.data) return inserted.data;
  const concurrent = await db.from("expense_subcategories").select("id, name").eq("category_id", categoryId).eq("search_key", searchKey).maybeSingle();
  if (concurrent.data) return concurrent.data;
  throw new Error("Không tạo được nhóm chi con.");
}

export async function saveExpense(input: ExpenseInput, id?: string) {
  const db = database();
  if (!db) throw new Error("Chưa cấu hình nơi lưu dữ liệu dùng chung.");
  const category = await ensureCategory(input.category, db);
  const subcategory = input.subcategory ? await ensureSubcategory(category.id, input.subcategory, db) : null;
  const row = {
    amount: input.amount, category_id: category.id, subcategory_id: subcategory?.id ?? null, note: input.note,
    spent_on: input.date, payment_method: input.paymentMethod,
  };
  const result = id
    ? await db.from("expenses").update(row).eq("id", id).select("id").single()
    : await db.from("expenses").insert(row).select("id").single();
  if (result.error) throw new Error("Không lưu được khoản chi. Vui lòng thử lại.");
  return result.data.id as string;
}

export async function deleteExpense(id: string) {
  const db = database();
  if (!db) throw new Error("Chưa cấu hình nơi lưu dữ liệu dùng chung.");
  const result = await db.from("expenses").delete().eq("id", id).select("id").single();
  if (result.error) throw new Error("Không xóa được khoản chi. Vui lòng thử lại.");
}

export async function createExpenseCategory(name: string) {
  const db = database();
  if (!db) throw new Error("Chưa cấu hình nơi lưu dữ liệu dùng chung.");
  return ensureCategory(name, db);
}

export async function createExpenseSubcategory(categoryName: string, name: string) {
  const db = database();
  if (!db) throw new Error("Chưa cấu hình nơi lưu dữ liệu dùng chung.");
  const category = await ensureCategory(categoryName, db);
  return ensureSubcategory(category.id, name, db);
}
