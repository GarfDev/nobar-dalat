import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReport,
  clampRange,
  growthRate,
  laggedCorrelation,
  pearsonCorrelation,
  previousRange,
} from "./reporting";
import type { InsightData } from "./types";

const fixture: InsightData = {
  revenue: [
    { date: "2026-08-28", grossRevenue: 50, refunds: 0, discounts: 0, netRevenue: 50, tax: 5, orders: 1, cogs: null },
    { date: "2026-08-29", grossRevenue: 100, refunds: 0, discounts: 10, netRevenue: 90, tax: 9, orders: 2, cogs: null },
    { date: "2026-08-30", grossRevenue: 220, refunds: 0, discounts: 20, netRevenue: 200, tax: 20, orders: 4, cogs: null },
    { date: "2026-08-31", grossRevenue: 330, refunds: 0, discounts: 30, netRevenue: 300, tax: 30, orders: 5, cogs: null },
  ],
  social: [
    { date: "2026-08-28", platform: "facebook", views: 1, audience: 1, audienceLabel: "viewers", interactions: 1, visits: 1, linkClicks: 0, follows: 0 },
    { date: "2026-08-29", platform: "facebook", views: 2, audience: 2, audienceLabel: "viewers", interactions: 2, visits: 1, linkClicks: 0, follows: 0 },
    { date: "2026-08-30", platform: "facebook", views: 3, audience: 3, audienceLabel: "viewers", interactions: 3, visits: 1, linkClicks: 1, follows: 1 },
    { date: "2026-08-31", platform: "facebook", views: 4, audience: 4, audienceLabel: "viewers", interactions: 4, visits: 1, linkClicks: 1, follows: 1 },
  ],
  products: [],
  content: [],
  advertising: [],
  quality: { generatedAt: "2026-09-01", notes: [] },
};

test("uses inclusive range endpoints", () => {
  const report = buildReport(fixture, {
    start: "2026-08-30",
    end: "2026-08-31",
  });
  assert.equal(report.revenue.days, 2);
  assert.equal(report.revenue.netRevenue, 500);
});

test("creates an equal-length preceding comparison", () => {
  assert.deepEqual(
    previousRange({ start: "2026-08-30", end: "2026-08-31" }),
    { start: "2026-08-28", end: "2026-08-29" },
  );
});

test("clamps both endpoints to available coverage", () => {
  assert.deepEqual(
    clampRange(
      { start: "2020-01-01", end: "2030-01-01" },
      { start: "2024-09-01", end: "2026-08-31" },
    ),
    { start: "2024-09-01", end: "2026-08-31" },
  );
});

test("returns null growth when the denominator is zero", () => {
  assert.equal(growthRate(12, 0), null);
  assert.equal(growthRate(15, 10), 0.5);
});

test("calculates AOV and discount rate from aggregates", () => {
  const report = buildReport(fixture, {
    start: "2026-08-30",
    end: "2026-08-31",
  });
  assert.equal(report.revenue.orders, 9);
  assert.equal(report.revenue.averageOrderValue, 500 / 9);
  assert.equal(report.revenue.discountRate, 50 / 550);
  assert.equal(report.revenue.cogsAvailable, false);
});

test("does not compare against an incomplete preceding period", () => {
  const report = buildReport(fixture, {
    start: "2026-08-28",
    end: "2026-08-31",
  });
  assert.equal(report.comparisonComplete, false);
  assert.equal(report.revenueGrowth, null);
  assert.equal(report.orderGrowth, null);
});

test("calculates perfect positive and negative Pearson correlation", () => {
  assert.equal(pearsonCorrelation([1, 2, 3], [2, 4, 6]), 1);
  assert.equal(pearsonCorrelation([1, 2, 3], [6, 4, 2]), -1);
  assert.equal(pearsonCorrelation([1, 1, 1], [2, 3, 4]), null);
});

test("aligns a marketing value on D with revenue on D plus lag", () => {
  const marketing = [
    { date: "2026-08-28" as const, value: 1 },
    { date: "2026-08-29" as const, value: 2 },
    { date: "2026-08-30" as const, value: 3 },
  ];
  const revenue = [
    { date: "2026-08-29" as const, value: 10 },
    { date: "2026-08-30" as const, value: 20 },
    { date: "2026-08-31" as const, value: 30 },
  ];
  assert.deepEqual(laggedCorrelation(marketing, revenue, 1), {
    correlation: 1,
    pairs: 3,
  });
});

test("returns null correlation for fewer than three complete pairs", () => {
  assert.deepEqual(
    laggedCorrelation(
      [{ date: "2026-08-30", value: 1 }],
      [{ date: "2026-08-31", value: 2 }],
      1,
    ),
    { correlation: null, pairs: 1 },
  );
});
