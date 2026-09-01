import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDataReadiness,
  computeOperationalMetrics,
  computePlatformEfficiency,
  computeWeekdayPerformance,
} from "./computed-metrics";
import { insightData } from "./data";
import type { RevenueDay, SocialDay } from "./types";

test("computes operating-day efficiency without treating closed days as service days", () => {
  const rows: RevenueDay[] = [
    { date: "2026-08-28", grossRevenue: 100, refunds: 0, discounts: 0, netRevenue: 100, tax: 0, orders: 1, cogs: null },
    { date: "2026-08-29", grossRevenue: 220, refunds: 0, discounts: 20, netRevenue: 200, tax: 0, orders: 2, cogs: null },
    { date: "2026-08-30", grossRevenue: 0, refunds: 0, discounts: 0, netRevenue: 0, tax: 0, orders: 0, cogs: null },
  ];
  const metrics = computeOperationalMetrics(rows);
  assert.equal(metrics.tradingDays, 2);
  assert.equal(metrics.revenuePerTradingDay, 150);
  assert.equal(metrics.ordersPerTradingDay, 1.5);
  assert.equal(metrics.activeDayRate, 2 / 3);
  assert.equal(metrics.revenueCoefficientOfVariation, 1 / 3);
  assert.equal(metrics.discountPerOrder, 20 / 3);
});

test("uses only comparable social rows for rate denominators", () => {
  const rows: SocialDay[] = [
    { date: "2026-08-28", platform: "instagram", views: 100, audience: 50, audienceLabel: "reach", interactions: 5, visits: null, linkClicks: 2, follows: 1 },
    { date: "2026-08-29", platform: "instagram", views: null, audience: null, audienceLabel: "reach", interactions: 99, visits: null, linkClicks: 99, follows: 99 },
  ];
  assert.deepEqual(computePlatformEfficiency(rows, "instagram"), {
    comparableDays: 1,
    engagementRate: 0.05,
    clickThroughRate: 0.02,
    followPerThousandViews: 10,
  });
});

test("summarizes weekday demand using active days and paid orders", () => {
  const rows: RevenueDay[] = [
    { date: "2026-08-21", grossRevenue: 1_000, refunds: 0, discounts: 0, netRevenue: 1_000, tax: 0, orders: 2, cogs: null },
    { date: "2026-08-28", grossRevenue: 3_000, refunds: 0, discounts: 0, netRevenue: 3_000, tax: 0, orders: 3, cogs: null },
    { date: "2026-08-29", grossRevenue: 4_000, refunds: 0, discounts: 0, netRevenue: 4_000, tax: 0, orders: 2, cogs: null },
  ];
  const friday = computeWeekdayPerformance(rows).find((item) => item.weekday === 5);
  assert.deepEqual(friday, {
    weekday: 5,
    activeDays: 2,
    ordersPerActiveDay: 2.5,
    averageOrderValue: 800,
    netRevenue: 4_000,
  });
});

test("scores current collection readiness and prioritizes unit economics", () => {
  const readiness = buildDataReadiness(insightData);
  assert.equal(readiness.score, 30);
  assert.equal(readiness.dimensions[0].code, "unit-economics");
  assert.equal(readiness.dimensions[0].priority, "critical");
});
