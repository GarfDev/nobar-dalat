import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAttributionPlan,
  buildDataReadiness,
  computeCommunityQuality,
  computeOperationalMetrics,
  computePlatformEfficiency,
  buildSocialEfficiencyRows,
  computeWeekdayPerformance,
} from "./computed-metrics";
import { insightData } from "./data";
import type { ContentItem, RevenueDay, SocialDay } from "./types";

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

test("compares social platforms on actions per thousand views", () => {
  const rows = buildSocialEfficiencyRows({
    instagram: { comparableDays: 10, engagementRate: 0.015, clickThroughRate: 0.001, followPerThousandViews: 2.8 },
    facebook: { comparableDays: 10, engagementRate: 0.005, clickThroughRate: 0.002, followPerThousandViews: 0.9 },
  });
  assert.deepEqual(rows, [
    { metric: "Tương tác", instagram: 15, facebook: 5 },
    { metric: "Nhấp link", instagram: 1, facebook: 2 },
    { metric: "Theo dõi", instagram: 2.8, facebook: 0.9 },
  ]);
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

test("builds an actionable Meta to PosApp attribution plan from current data gaps", () => {
  const plan = buildAttributionPlan(insightData);
  assert.equal(plan.status, "not-connected");
  assert.equal(plan.statusLabel, "Chưa nối Meta với từng hóa đơn PosApp");
  assert.equal(plan.phases[0].code, "campaign-code");
  assert.equal(plan.phases[0].recommended, true);
  assert.deepEqual(
    plan.requiredFields.map((field) => field.key),
    ["order_id", "paid_at", "net_revenue", "promo_code", "campaign_id", "customer_match"],
  );
});

test("separates high-intent community actions from lightweight likes", () => {
  const base = {
    date: "2026-08-28",
    platform: "instagram",
    format: "reel",
    audience: null,
    interactions: null,
    averageWatchSeconds: null,
    paidViews: null,
  } as const;
  const rows: ContentItem[] = [
    { ...base, id: "one", label: "One", views: 1_000, likes: 80, comments: 5, shares: 20, saves: 30, follows: 10 },
    { ...base, id: "two", label: "Two", views: 500, likes: null, comments: null, shares: 5, saves: null, follows: 5 },
  ];
  assert.deepEqual(computeCommunityQuality(rows), {
    samplePosts: 2,
    views: 1_500,
    likes: 80,
    comments: 5,
    shares: 25,
    saves: 30,
    follows: 15,
    highIntentActions: 55,
    highIntentPerThousandViews: 55 / 1.5,
    conversationPerThousandViews: 5 / 1.5,
    followPerThousandViews: 10,
  });
});

test("flags story, UGC, repost and inbox signals as a partial collection gap", () => {
  const dimension = buildDataReadiness(insightData).dimensions.find((item) => item.code === "community-signals");
  assert.equal(dimension?.status, "partial");
  assert.deepEqual(dimension?.missingFields, [
    "story_replies",
    "story_link_taps",
    "mentions",
    "tags",
    "reposts",
    "dm_starts",
    "response_minutes",
    "sentiment",
  ]);
});
