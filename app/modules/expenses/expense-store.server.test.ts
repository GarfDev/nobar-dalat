import assert from "node:assert/strict";
import test from "node:test";
import { saveExpense } from "./expense-store.server";

test("saving a new subcategory associates it with the selected parent", async () => {
  const oldUrl = process.env.SUPABASE_URL;
  const oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const oldFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
  const posted: Array<{ table: string; body: Record<string, unknown> }> = [];

  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init);
    const table = new URL(request.url).pathname.split("/").pop() || "";
    const body = request.method === "POST" ? await request.json() as Record<string, unknown> : null;
    if (body) posted.push({ table, body });
    const data = table === "expense_categories" ? [{ id: "category-id", name: "Nguyên liệu" }]
      : table === "expense_subcategories" && request.method === "GET" ? []
      : table === "expense_subcategories" ? [{ id: "subcategory-id", name: "Trái cây" }]
      : [{ id: "expense-id" }];
    const single = request.headers.get("accept")?.includes("vnd.pgrst.object");
    return new Response(JSON.stringify(single ? data[0] : data), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const id = await saveExpense({ amount: 75000, category: "Nguyên liệu", subcategory: "Trái cây", note: "", date: "2026-09-29", paymentMethod: "cash" });
    assert.equal(id, "expense-id");
    assert.deepEqual(posted, [
      { table: "expense_subcategories", body: { category_id: "category-id", name: "Trái cây", search_key: "trai cay" } },
      { table: "expenses", body: { amount: 75000, category_id: "category-id", subcategory_id: "subcategory-id", note: "", spent_on: "2026-09-29", payment_method: "cash" } },
    ]);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
  }
});
