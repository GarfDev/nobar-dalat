import assert from "node:assert/strict";
import test from "node:test";

import { buildManagementFindings } from "./insight-rules";
import type { InsightsReport } from "./reporting";

function reportFixture(): InsightsReport {
  return {
    range: { start: "2026-08-01", end: "2026-08-31" },
    comparisonRange: { start: "2026-07-01", end: "2026-07-31" },
    comparisonComplete: true,
    revenue: { days: 31, grossRevenue: 100, refunds: 0, discounts: 0, netRevenue: 100, tax: 0, orders: 2, averageOrderValue: 50, discountRate: 0, cogs: null, cogsAvailable: false },
    comparisonRevenue: { days: 31, grossRevenue: 90, refunds: 0, discounts: 0, netRevenue: 90, tax: 0, orders: 2, averageOrderValue: 45, discountRate: 0, cogs: null, cogsAvailable: false },
    revenueGrowth: 1 / 9,
    orderGrowth: 0,
    dailyRevenue: [], monthlyRevenue: [], weekdayRevenue: [], social: [], products: [], productCoverageExact: true, content: [],
    advertising: [{ id: "a", startDate: "2026-08-01", endDate: "2026-08-31", platform: "meta", label: "Ad", spend: 10, resultType: null, results: null, views: null, audience: null, trackedPurchases: null, attributedRevenue: null, deliveryStatus: "Not delivering" }],
    adSpend: 10,
    quality: { generatedAt: "2026-09-01", notes: [] },
  };
}

test("raises COGS as a critical data-quality action", () => {
  const findings = buildManagementFindings(reportFixture());
  assert.equal(findings[0].code, "missing-cogs");
  assert.equal(findings[0].priority, "critical");
});

test("raises failed ad delivery without inventing ROAS", () => {
  const findings = buildManagementFindings(reportFixture());
  assert.ok(findings.some((item) => item.code === "ad-billing"));
  assert.ok(findings.every((item) => !item.summary.includes("ROAS")));
});
