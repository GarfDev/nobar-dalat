export type PaymentMethod = "cash" | "transfer";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  subcategory: string;
  note: string;
  date: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export type ExpenseSubcategory = { category: string; name: string };

export const DEFAULT_CATEGORIES = [
  "Nguyên liệu",
  "Lương & nhân sự",
  "Điện nước",
  "Mặt bằng",
  "Vật tư",
  "Marketing",
  "Đi lại",
  "Khác",
];

export function categoryKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

export function normalizeAmount(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function addCategory(categories: string[], input: string) {
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return { categories, selected: "" };
  const existing = categories.find((category) => categoryKey(category) === categoryKey(name));
  if (existing) return { categories, selected: existing };
  return { categories: [...categories, name], selected: name };
}

export function suggestCategories(categories: string[], query: string, recent: string[] = []) {
  const key = categoryKey(query);
  const rank = new Map<string, number>();
  recent.forEach((name, index) => {
    const normalized = categoryKey(name);
    if (!rank.has(normalized)) rank.set(normalized, index);
  });
  return categories
    .filter((name) => categoryKey(name).includes(key))
    .map((name, index) => ({ name, index, recent: rank.get(categoryKey(name)) ?? Infinity }))
    .sort((a, b) => a.recent - b.recent || a.index - b.index)
    .map(({ name }) => name);
}

export function subcategoriesForCategory(subcategories: ExpenseSubcategory[], category: string) {
  const parentKey = categoryKey(category);
  if (!parentKey) return [];
  const seen = new Set<string>();
  return subcategories
    .filter((item) => {
      const key = categoryKey(item.name);
      if (categoryKey(item.category) !== parentKey || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((item) => item.name);
}

export function expenseSummary(expenses: Expense[], month: string) {
  const filtered = expenses.filter((expense) => expense.date.startsWith(month));
  const totals = new Map<string, number>();
  for (const expense of filtered) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }
  return {
    total: filtered.reduce((sum, expense) => sum + expense.amount, 0),
    count: filtered.length,
    byCategory: [...totals.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
  };
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}
