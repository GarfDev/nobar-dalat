import assert from "node:assert/strict";
import test from "node:test";

import { aggregateProductRanking } from "./product-ranking";

test("combines Bespoke and bespoke while keeping bespoke(ly) separate", () => {
  const result = aggregateProductRanking([
    { startDate: "2025-01-01", endDate: "2025-12-31", product: "Bespoke", category: null, quantity: 3, revenue: 600_000, discounts: null },
    { startDate: "2026-01-01", endDate: "2026-08-31", product: "bespoke", category: null, quantity: 2, revenue: 500_000, discounts: null },
    { startDate: "2026-01-01", endDate: "2026-08-31", product: "bespoke(ly)", category: null, quantity: 1, revenue: 300_000, discounts: null },
  ]);

  assert.deepEqual(result, [
    { product: "Bespoke", quantity: 5, revenue: 1_100_000 },
    { product: "bespoke(ly)", quantity: 1, revenue: 300_000 },
  ]);
});
