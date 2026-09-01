import assert from "node:assert/strict";
import test from "node:test";

import { assertISODate, validateInsightData } from "./data-validation";
import { insightData } from "./data";
import type { InsightData } from "./types";

const emptyData = (): InsightData => ({
  revenue: [],
  social: [],
  products: [],
  content: [],
  advertising: [],
  quality: { generatedAt: "2026-09-01", notes: [] },
});

test("accepts canonical leap-day dates", () => {
  assert.doesNotThrow(() => assertISODate("2024-02-29"));
});

test("rejects non-canonical dates", () => {
  assert.throws(() => assertISODate("01/09/2024"), /YYYY-MM-DD/);
  assert.throws(() => assertISODate("2025-02-29"), /YYYY-MM-DD/);
});

test("reports exact source coverage", () => {
  const data = emptyData();
  data.revenue = [
    {
      date: "2024-09-01",
      grossRevenue: 100,
      refunds: 0,
      discounts: 0,
      netRevenue: 100,
      tax: 0,
      orders: 1,
      cogs: null,
    },
    {
      date: "2026-08-31",
      grossRevenue: 200,
      refunds: 0,
      discounts: 0,
      netRevenue: 200,
      tax: 0,
      orders: 2,
      cogs: null,
    },
  ];

  assert.deepEqual(validateInsightData(data).revenue, {
    start: "2024-09-01",
    end: "2026-08-31",
    rows: 2,
  });
});

test("rejects duplicate platform dates", () => {
  const data = emptyData();
  const row = {
    date: "2026-08-31" as const,
    platform: "facebook" as const,
    views: 10,
    audience: 5,
    audienceLabel: "viewers" as const,
    interactions: 1,
    visits: 1,
    linkClicks: 0,
    follows: 0,
  };
  data.social = [row, row];
  assert.throws(() => validateInsightData(data), /duplicate social row/);
});

test("rejects fractional VND and negative counts", () => {
  const data = emptyData();
  data.revenue = [
    {
      date: "2026-08-31",
      grossRevenue: 100.5,
      refunds: 0,
      discounts: 0,
      netRevenue: 100,
      tax: 0,
      orders: -1,
      cogs: null,
    },
  ];
  assert.throws(() => validateInsightData(data), /integer VND|non-negative/);
});

test("accepts null for unavailable social metrics", () => {
  const data = emptyData();
  data.social = [
    {
      date: "2026-08-31",
      platform: "instagram",
      views: null,
      audience: null,
      audienceLabel: "reach",
      interactions: null,
      visits: null,
      linkClicks: null,
      follows: null,
    },
  ];
  assert.doesNotThrow(() => validateInsightData(data));
});

test("ships the full two-year reporting boundary", () => {
  const result = validateInsightData(insightData);
  assert.deepEqual(result.revenue, {
    start: "2024-09-01",
    end: "2026-08-31",
    rows: 730,
  });
});

test("contains no credential-shaped keys", () => {
  assert.doesNotMatch(
    JSON.stringify(insightData),
    /access[_-]?token|cookie|password|secret|bearer/i,
  );
});

test("does not publish profit while COGS is unavailable", () => {
  assert.ok(
    insightData.revenue.every((row) => row.cogs === null || row.cogs > 0),
  );
});

test("keeps the reconciled PosApp order count", () => {
  assert.equal(
    insightData.revenue.reduce((sum, row) => sum + row.orders, 0),
    4_278,
  );
  assert.equal(
    insightData.revenue.find((row) => row.date === "2026-07-26")?.orders,
    16,
  );
});

test("keeps Meta source checksums and coverage gaps", () => {
  const instagram = insightData.social.filter(
    (row) => row.platform === "instagram",
  );
  const facebook = insightData.social.filter(
    (row) => row.platform === "facebook",
  );
  assert.equal(instagram.length, 730);
  assert.equal(facebook.length, 730);
  assert.equal(
    instagram.reduce((sum, row) => sum + (row.views ?? 0), 0),
    393_862,
  );
  assert.equal(
    facebook.reduce((sum, row) => sum + (row.interactions ?? 0), 0),
    2_420,
  );
  assert.equal(facebook[0].views, null);
  assert.equal(
    facebook.find((row) => row.date === "2025-08-01")?.views,
    255,
  );
});

test("ships verified content, product, and advertising summaries", () => {
  assert.equal(insightData.content.length, 10);
  assert.equal(insightData.content[0].views, 28_504);
  assert.equal(insightData.products.length, 420);
  assert.equal(
    insightData.advertising.reduce((sum, row) => sum + row.spend, 0),
    869_341,
  );
});
