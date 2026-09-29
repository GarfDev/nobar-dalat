import assert from "node:assert/strict";
import test from "node:test";
import {
  addCategory,
  expenseSummary,
  normalizeAmount,
  subcategoriesForCategory,
  suggestCategories,
  type Expense,
} from "./expense-model";

test("normalizes a quickly typed VND amount without changing its digits", () => {
  assert.equal(normalizeAmount("1.250.000 đ"), 1250000);
  assert.equal(normalizeAmount("0"), 0);
  assert.equal(normalizeAmount(""), 0);
});

test("category suggestions ignore Vietnamese accents and favor recent use", () => {
  const categories = ["Nguyên liệu", "Đi lại", "Điện nước"];
  const result = suggestCategories(categories, "dien", ["Điện nước", "Điện nước", "Đi lại"]);
  assert.deepEqual(result, ["Điện nước"]);
  assert.deepEqual(suggestCategories(categories, "", ["Đi lại"]), ["Đi lại", "Nguyên liệu", "Điện nước"]);
});

test("adding a category reuses an existing case and accent equivalent", () => {
  assert.deepEqual(addCategory(["Điện nước"], " dien nuoc "), {
    categories: ["Điện nước"],
    selected: "Điện nước",
  });
  assert.deepEqual(addCategory(["Điện nước"], "Vật tư"), {
    categories: ["Điện nước", "Vật tư"],
    selected: "Vật tư",
  });
});

test("subcategory choices are scoped to their parent category", () => {
  const all = [
    { category: "Nguyên liệu", name: "Trái cây" },
    { category: "Vật tư", name: "Ly thủy tinh" },
    { category: "Nguyên liệu", name: "Rượu" },
    { category: "nguyen lieu", name: "Trai cay" },
  ];
  assert.deepEqual(subcategoriesForCategory(all, "nguyen lieu"), ["Trái cây", "Rượu"]);
  assert.deepEqual(subcategoriesForCategory(all, "Đi lại"), []);
});

test("summary respects the selected month and ignores deleted expenses", () => {
  const expenses: Expense[] = [
    { id: "a", amount: 120000, category: "Nguyên liệu", subcategory: "Trái cây", note: "", date: "2026-09-29", paymentMethod: "cash", createdAt: "2026-09-29T10:00:00.000Z" },
    { id: "b", amount: 30000, category: "Đi lại", subcategory: "", note: "", date: "2026-09-28", paymentMethod: "transfer", createdAt: "2026-09-28T10:00:00.000Z" },
    { id: "c", amount: 500000, category: "Nguyên liệu", subcategory: "Rượu", note: "", date: "2026-08-29", paymentMethod: "cash", createdAt: "2026-08-29T10:00:00.000Z" },
  ];
  assert.deepEqual(expenseSummary(expenses, "2026-09"), {
    total: 150000,
    count: 2,
    byCategory: [
      { category: "Nguyên liệu", total: 120000 },
      { category: "Đi lại", total: 30000 },
    ],
  });
});
