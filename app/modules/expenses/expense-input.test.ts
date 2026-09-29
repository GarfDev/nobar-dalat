import assert from "node:assert/strict";
import test from "node:test";
import { parseExpenseInput } from "./expense-input";

test("parses a minimal quick expense", () => {
  assert.deepEqual(parseExpenseInput(new URLSearchParams({ amount: "125.000", category: "Nguyên liệu", date: "2026-09-29", paymentMethod: "cash" })), {
    amount: 125000,
    category: "Nguyên liệu",
    subcategory: "",
    note: "",
    date: "2026-09-29",
    paymentMethod: "cash",
  });
});

test("accepts an optional subcategory and rejects one that is too long", () => {
  const input = new URLSearchParams({ amount: "50.000", category: "Nguyên liệu", subcategory: "  Trái cây  ", date: "2026-09-29", paymentMethod: "cash" });
  assert.equal(parseExpenseInput(input)?.subcategory, "Trái cây");
  input.set("subcategory", "x".repeat(61));
  assert.equal(parseExpenseInput(input), null);
});

test("rejects invalid expense fields before storage", () => {
  assert.equal(parseExpenseInput(new URLSearchParams({ amount: "0", category: "Đồ", date: "2026-09-29", paymentMethod: "cash" })), null);
  assert.equal(parseExpenseInput(new URLSearchParams({ amount: "50.000", category: "", date: "2026-09-29", paymentMethod: "cash" })), null);
  assert.equal(parseExpenseInput(new URLSearchParams({ amount: "50.000", category: "Đồ", date: "2026-02-30", paymentMethod: "cash" })), null);
  assert.equal(parseExpenseInput(new URLSearchParams({ amount: "50.000", category: "Đồ", date: "2026-09-29", paymentMethod: "card" })), null);
});
