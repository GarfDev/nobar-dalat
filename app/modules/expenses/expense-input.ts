import { normalizeAmount, type PaymentMethod } from "./expense-model";

type Fields = Pick<FormData, "get"> | Pick<URLSearchParams, "get">;

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export function parseExpenseInput(fields: Fields) {
  const amount = normalizeAmount(String(fields.get("amount") ?? ""));
  const category = String(fields.get("category") ?? "").trim().replace(/\s+/g, " ");
  const subcategory = String(fields.get("subcategory") ?? "").trim().replace(/\s+/g, " ");
  const note = String(fields.get("note") ?? "").trim();
  const date = String(fields.get("date") ?? "");
  const paymentMethod = String(fields.get("paymentMethod") ?? "");
  if (
    !Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000_000_000 ||
    !category || category.length > 60 || subcategory.length > 60 || note.length > 300 || !validDate(date) ||
    !(["cash", "transfer"] as string[]).includes(paymentMethod)
  ) return null;
  return { amount, category, subcategory, note, date, paymentMethod: paymentMethod as PaymentMethod };
}
