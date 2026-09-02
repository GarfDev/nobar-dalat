# NObar Marketing & F&B Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an unlisted `/insights` dashboard that analyzes two years of static PosApp, Facebook, and Instagram data across selectable date ranges.

**Architecture:** Normalized JSON files feed a pure TypeScript reporting engine. A standalone React Router route renders executive and detailed report sections from the engine without credentials or live API calls. Presentation components remain small, source-aware, and explicit about unavailable metrics.

**Tech Stack:** React 19, React Router 7, TypeScript 5.8, Tailwind CSS 4 plus route CSS, Lucide React, native SVG charts, Node test runner with `tsx`.

**Spec:** `docs/superpowers/specs/2026-09-01-marketing-insights-design.md`

## Global Constraints

- Work only in `/Users/garfdev/Projects/nobar-dalat/.worktrees/marketing-insights` on `codex/marketing-insights`.
- The route is `/insights`, absent from public navigation, with `noindex, nofollow` metadata.
- Static reporting coverage is exactly `2024-09-01` through `2026-08-31`.
- No API keys, credentials, cookies, account IDs, or raw downloads are committed.
- Dates are canonical `YYYY-MM-DD`; VND amounts are integer values; missing data is `null`, never an invented zero.
- Profit and margin stay unavailable while PosApp COGS is missing or uniformly zero.
- ROAS stays unavailable while attributed purchase revenue is absent.
- The UI describes correlations as directional evidence, never causation.
- Existing `/`, `/en`, and `/vi` behavior must not change.
- Follow TDD: observe each targeted test fail before adding its implementation.

---

### Task 1: Domain contracts and source validation

**Files:**
- Create: `app/modules/insights/types.ts`
- Create: `app/modules/insights/data-validation.ts`
- Create: `app/modules/insights/data-validation.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `ISODate`, `DateRange`, `RevenueDay`, `SocialDay`, `ContentItem`, `AdvertisingItem`, `ProductPerformance`, `DataQuality`.
- Produces: `assertISODate(value: string): asserts value is ISODate` and `validateInsightData(data: InsightData): DataCoverage`.

- [ ] **Step 1: Add the focused test command and failing validation tests**

Add this script to `package.json`:

```json
"test:insights": "node --import tsx --test app/modules/insights/*.test.ts"
```

Create tests covering canonical dates, duplicate platform/date rows, non-integer VND, negative orders, `null` missing metrics, and exact coverage bounds:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { assertISODate, validateInsightData } from "./data-validation";

test("accepts canonical leap-day dates", () => {
  assert.doesNotThrow(() => assertISODate("2024-02-29"));
});

test("rejects non-canonical dates", () => {
  assert.throws(() => assertISODate("01/09/2024"), /YYYY-MM-DD/);
});

test("reports exact source coverage", () => {
  const coverage = validateInsightData({
    revenue: [
      { date: "2024-09-01", grossRevenue: 100, refunds: 0, discounts: 0, netRevenue: 100, tax: 0, orders: 1, cogs: null },
      { date: "2026-08-31", grossRevenue: 200, refunds: 0, discounts: 0, netRevenue: 200, tax: 0, orders: 2, cogs: null },
    ],
    social: [], products: [], content: [], advertising: [], quality: { generatedAt: "2026-09-01", notes: [] },
  });
  assert.deepEqual(coverage.revenue, { start: "2024-09-01", end: "2026-08-31", rows: 2 });
});
```

- [ ] **Step 2: Run the tests and verify the missing-module failure**

Run: `npm run test:insights`

Expected: FAIL because `data-validation.ts` does not exist.

- [ ] **Step 3: Implement focused types and validation**

Define discriminated, source-aware records:

```ts
export type ISODate = `${number}-${number}-${number}`;
export type Platform = "facebook" | "instagram";
export type DateRange = { start: ISODate; end: ISODate };

export type RevenueDay = {
  date: ISODate;
  grossRevenue: number;
  refunds: number;
  discounts: number;
  netRevenue: number;
  tax: number;
  orders: number;
  cogs: number | null;
};

export type SocialDay = {
  date: ISODate;
  platform: Platform;
  views: number | null;
  audience: number | null;
  audienceLabel: "viewers" | "reach";
  interactions: number | null;
  visits: number | null;
  linkClicks: number | null;
  follows: number | null;
};
```

Validate dates by parsing and round-tripping UTC year/month/day. Validate uniqueness with keys `${date}:${platform}`, non-negative counts, integer currency values, and source coverage.

- [ ] **Step 4: Run validation tests and project checks**

Run: `npm run test:insights && npm run typecheck && npm run lint`

Expected: tests and typecheck pass; lint has no new errors or warnings beyond the five existing `cursor-sync.tsx` warnings.

- [ ] **Step 5: Commit**

```bash
git add package.json app/modules/insights/types.ts app/modules/insights/data-validation.ts app/modules/insights/data-validation.test.ts
git commit -m "test: define insights data contracts"
```

---

### Task 2: Extract and normalize the two-year source dataset

**Files:**
- Create: `app/data/insights/revenue-daily.json`
- Create: `app/data/insights/social-daily.json`
- Create: `app/data/insights/product-performance.json`
- Create: `app/data/insights/content-performance.json`
- Create: `app/data/insights/advertising-performance.json`
- Create: `app/data/insights/data-quality.json`
- Create: `app/modules/insights/data.ts`
- Modify: `app/modules/insights/data-validation.test.ts`

**Interfaces:**
- Consumes: all record types and `validateInsightData` from Task 1.
- Produces: `insightData: InsightData` with validated, normalized static records.

- [ ] **Step 1: Write failing coverage and sanitization tests**

```ts
import { insightData } from "./data";

test("ships the full two-year reporting boundary", () => {
  const result = validateInsightData(insightData);
  assert.equal(result.revenue.start, "2024-09-01");
  assert.equal(result.revenue.end, "2026-08-31");
});

test("contains no credential-shaped keys", () => {
  const serialized = JSON.stringify(insightData);
  assert.doesNotMatch(serialized, /access[_-]?token|cookie|password|secret|bearer/i);
});

test("does not publish profit while COGS is unavailable", () => {
  assert.ok(insightData.revenue.every((row) => row.cogs === null || row.cogs > 0));
});
```

- [ ] **Step 2: Run tests and verify they fail because source files are absent**

Run: `npm run test:insights`

Expected: FAIL because `data.ts` and normalized JSON files do not exist.

- [ ] **Step 3: Export the authorized source reports**

Using the already authenticated Meta Business Suite and PosApp pages, export or read the inclusive period `2024-09-01`–`2026-08-31`:

- PosApp daily revenue/order report: date, gross revenue, refunds, discounts, net revenue, COGS, tax, order count.
- PosApp product report: product, category, quantity, revenue, discounts when available.
- Meta Facebook and Instagram daily results: views, viewers/reach, interactions, visits, link clicks, follows.
- Meta content results: publish date, platform, format, views, audience, interactions, likes, comments, shares, saves, follows, watch time, organic/paid split when available.
- Meta advertising results: date range, campaign/content label, spend, result type/count, cost per result, views, audience, tracked purchases, delivery state.

Keep downloaded raw exports outside the repository. Record source time zones, missing fields, and extraction timestamp in `data-quality.json`.

- [ ] **Step 4: Normalize into committed JSON**

Use these shapes exactly:

```json
{
  "date": "2024-09-01",
  "grossRevenue": 0,
  "refunds": 0,
  "discounts": 0,
  "netRevenue": 0,
  "tax": 0,
  "orders": 0,
  "cogs": null
}
```

```json
{
  "date": "2024-09-01",
  "platform": "instagram",
  "views": null,
  "audience": null,
  "audienceLabel": "reach",
  "interactions": null,
  "visits": null,
  "linkClicks": null,
  "follows": null
}
```

Values in the real files must come from the authenticated exports. Do not replace missing data with the example zeros; use `null` when the source does not provide a metric and add the reason to `data-quality.json`.

- [ ] **Step 5: Load and validate data at module initialization**

```ts
import advertising from "~/data/insights/advertising-performance.json";
import content from "~/data/insights/content-performance.json";
import products from "~/data/insights/product-performance.json";
import quality from "~/data/insights/data-quality.json";
import revenue from "~/data/insights/revenue-daily.json";
import social from "~/data/insights/social-daily.json";
import type { InsightData } from "./types";
import { validateInsightData } from "./data-validation";

export const insightData = { revenue, social, products, content, advertising, quality } as InsightData;
export const dataCoverage = validateInsightData(insightData);
```

- [ ] **Step 6: Run tests and inspect aggregate checksums**

Run: `npm run test:insights`

Add assertions for source-row counts, total two-year net revenue, total orders, total platform views, and total ad spend using values calculated directly from the exports. Expected: PASS with exact checksums, preventing accidental truncation.

- [ ] **Step 7: Commit**

```bash
git add app/data/insights app/modules/insights/data.ts app/modules/insights/data-validation.test.ts
git commit -m "data: add normalized two-year insights sources"
```

---

### Task 3: Reporting range and aggregation engine

**Files:**
- Create: `app/modules/insights/reporting.ts`
- Create: `app/modules/insights/reporting.test.ts`

**Interfaces:**
- Consumes: `DateRange`, `InsightData`, and normalized records.
- Produces: `clampRange`, `previousRange`, `buildReport`, `pearsonCorrelation`, and `laggedCorrelation`.
- Produces: `InsightsReport` containing KPI totals, comparison values, series, rankings, warnings, and coverage.

- [ ] **Step 1: Write failing tests for range semantics**

```ts
test("uses inclusive range endpoints", () => {
  const report = buildReport(fixture, { start: "2026-08-30", end: "2026-08-31" });
  assert.equal(report.revenue.days, 2);
});

test("creates an equal-length preceding comparison", () => {
  assert.deepEqual(previousRange({ start: "2026-08-30", end: "2026-08-31" }), {
    start: "2026-08-28", end: "2026-08-29",
  });
});

test("returns null growth when the denominator is zero", () => {
  assert.equal(growthRate(12, 0), null);
});
```

Also test clamping, leap days, incomplete comparisons, monthly totals, weekday averages, AOV, discount rate, stable top-N rankings, and missing metrics.

- [ ] **Step 2: Run tests and verify the missing-module failure**

Run: `npm run test:insights`

Expected: FAIL because `reporting.ts` does not exist.

- [ ] **Step 3: Implement date and aggregation primitives**

Use UTC parsing for canonical reporting dates:

```ts
const DAY_MS = 86_400_000;

export function toEpochDay(date: ISODate) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

export function previousRange(range: DateRange): DateRange {
  const length = toEpochDay(range.end) - toEpochDay(range.start) + 1;
  return {
    start: fromEpochDay(toEpochDay(range.start) - length),
    end: fromEpochDay(toEpochDay(range.start) - 1),
  };
}
```

Aggregate revenue by summing; calculate daily averages after aggregation; keep platform audience metrics separate by `audienceLabel`.

- [ ] **Step 4: Implement correlation helpers with explicit lag direction**

`laggedCorrelation(marketing, revenue, 2)` must compare a marketing value on day D with revenue on day D+2. Pair only dates where both values are non-null. Return `null` for fewer than three pairs or zero variance.

- [ ] **Step 5: Run tests and checks**

Run: `npm run test:insights && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/modules/insights/reporting.ts app/modules/insights/reporting.test.ts
git commit -m "feat: add insights reporting engine"
```

---

### Task 4: Hidden route shell, state, and visual system

**Files:**
- Create: `app/routes/insights.tsx`
- Create: `app/modules/insights/insights-page.tsx`
- Create: `app/modules/insights/insights.css`
- Create: `app/modules/insights/range-controls.tsx`
- Create: `app/modules/insights/insights-navigation.tsx`
- Create: `app/modules/insights/format.ts`
- Modify: `app/routes.ts`

**Interfaces:**
- Consumes: `dataCoverage`, `insightData`, `buildReport`.
- Produces: the `/insights` route, `ReportMode = "preliminary" | "detailed"`, URL query parameters `from`, `to`, `mode`, and section anchors.

- [ ] **Step 1: Write failing route metadata and formatting tests**

Create `app/modules/insights/format.test.ts`:

```ts
test("formats VND without fractional units", () => {
  assert.equal(formatVND(559_533_810), "559.533.810 ₫");
});

test("formats missing rates as unavailable", () => {
  assert.equal(formatPercent(null), "Chưa đủ dữ liệu");
});
```

Run: `npm run test:insights`

Expected: FAIL because `format.ts` does not exist.

- [ ] **Step 2: Register the isolated route and noindex metadata**

Modify `app/routes.ts`:

```ts
export default [
  index("routes/home.tsx"),
  route("insights", "routes/insights.tsx"),
  route(":lang", "routes/lang.tsx"),
] satisfies RouteConfig;
```

The route metadata returns the title and `{ name: "robots", content: "noindex, nofollow" }`.

- [ ] **Step 3: Implement URL-backed range and mode state**

Default to trailing 90 days ending `2026-08-31`. Presets write canonical `from` and `to` parameters. Custom inputs are clamped through `clampRange`; browser back/forward restores the selection.

- [ ] **Step 4: Build the responsive shell**

Use a desktop rail and mobile overflow switcher. Keep the date controls sticky below the header. Reuse the existing local Novecento font and brand colours; do not alter global public-page styles.

- [ ] **Step 5: Run tests and build**

Run: `npm run test:insights && npm run typecheck && npm run build`

Expected: PASS and prerendered public routes remain unchanged.

- [ ] **Step 6: Commit**

```bash
git add app/routes.ts app/routes/insights.tsx app/modules/insights/insights-page.tsx app/modules/insights/insights.css app/modules/insights/range-controls.tsx app/modules/insights/insights-navigation.tsx app/modules/insights/format.ts app/modules/insights/format.test.ts
git commit -m "feat: add hidden insights route shell"
```

---

### Task 5: Executive, revenue, and product reports

**Files:**
- Create: `app/modules/insights/components/kpi-card.tsx`
- Create: `app/modules/insights/components/trend-chart.tsx`
- Create: `app/modules/insights/components/breakdown-chart.tsx`
- Create: `app/modules/insights/components/report-table.tsx`
- Create: `app/modules/insights/components/insight-callout.tsx`
- Create: `app/modules/insights/sections/overview-section.tsx`
- Create: `app/modules/insights/sections/revenue-section.tsx`
- Create: `app/modules/insights/sections/products-section.tsx`
- Modify: `app/modules/insights/insights-page.tsx`
- Modify: `app/modules/insights/insights.css`

**Interfaces:**
- Consumes: `InsightsReport`, `ReportMode`, and formatting helpers.
- Produces: accessible SVG charts, exact-value tables, overview/revenue/product sections.

- [ ] **Step 1: Add deterministic chart-model tests**

Test pure helpers that convert a series to SVG points and produce a text summary:

```ts
test("maps a flat series to the vertical midpoint", () => {
  assert.deepEqual(linePoints([5, 5], 100, 40), [[0, 20], [100, 20]]);
});

test("summarizes extrema", () => {
  assert.match(summarizeSeries([{ label: "Jul", value: 10 }, { label: "Aug", value: 15 }]), /Aug.*15/);
});
```

- [ ] **Step 2: Implement reusable report primitives**

Each KPI card shows label, formatted value, comparison delta, source label, and an optional warning. Charts use SVG plus a visually hidden text summary. Tables use semantic `table`, `th scope`, and aligned numeric columns.

- [ ] **Step 3: Implement the preliminary overview**

Show net revenue, orders, AOV, discount rate, platform views/interactions, period comparison, three priority alerts, and a concise source-aware summary. In preliminary mode omit supporting tables.

- [ ] **Step 4: Implement detailed revenue and product sections**

Revenue includes daily/monthly trend, weekday averages, top/weak dates, and gross-to-net bridge. Products includes rankings and category contribution when supplied; otherwise render the explicit source-missing panel.

- [ ] **Step 5: Verify range consistency**

For 7-day, 90-day, and full-range selections, compare displayed totals against `buildReport` results in the browser. Expected: every visible total matches the engine and changing mode does not change totals.

- [ ] **Step 6: Run checks and commit**

Run: `npm run test:insights && npm run typecheck && npm run lint && npm run build`

```bash
git add app/modules/insights
git commit -m "feat: add core F&B performance reports"
```

---

### Task 6: Marketing, content, advertising, and relationship reports

**Files:**
- Create: `app/modules/insights/sections/marketing-section.tsx`
- Create: `app/modules/insights/sections/content-section.tsx`
- Create: `app/modules/insights/sections/advertising-section.tsx`
- Create: `app/modules/insights/sections/relationship-section.tsx`
- Modify: `app/modules/insights/insights-page.tsx`
- Modify: `app/modules/insights/insights.css`

**Interfaces:**
- Consumes: platform-specific report slices, content/ad rankings, lagged correlations, and data-quality warnings.
- Produces: four detailed report sections with metric-specific caveats.

- [ ] **Step 1: Write interpretation tests**

Add a pure `correlationLabel` helper and tests:

```ts
test("does not use causal language", () => {
  for (const value of [-0.8, -0.2, 0, 0.2, 0.8]) {
    assert.doesNotMatch(correlationLabel(value), /gây ra|dẫn đến|cause/i);
  }
});

test("labels missing attribution", () => {
  assert.equal(roasLabel(null), "Chưa có dữ liệu doanh thu quy thuộc");
});
```

- [ ] **Step 2: Implement platform-separated marketing scorecards**

Render Facebook viewers and Instagram reach with their original labels. Show interactions, visits, clicks, follows, engagement denominator, and time series without summing unlike audience metrics.

- [ ] **Step 3: Implement content and advertising rankings**

Content supports rankings by views and interactions, format filters, organic/paid splits when present, and reusable-pattern callouts. Advertising shows spend, results, cost per result, delivery/payment warnings, and an unavailable ROAS state.

- [ ] **Step 4: Implement relationship analysis**

Show same-day and 1/2/3-day lag correlations, sample size, strongest absolute relationship, source time-zone caveat, and the sentence “Tương quan không chứng minh quan hệ nhân quả.”

- [ ] **Step 5: Run tests and commit**

Run: `npm run test:insights && npm run typecheck && npm run lint`

```bash
git add app/modules/insights
git commit -m "feat: add marketing performance reports"
```

---

### Task 7: Management actions and data-quality reporting

**Files:**
- Create: `app/modules/insights/sections/action-plan-section.tsx`
- Create: `app/modules/insights/sections/data-notes-section.tsx`
- Create: `app/modules/insights/insight-rules.ts`
- Create: `app/modules/insights/insight-rules.test.ts`
- Modify: `app/modules/insights/insights-page.tsx`

**Interfaces:**
- Consumes: `InsightsReport` and `DataQuality`.
- Produces: `buildManagementFindings(report): ManagementFinding[]` and `buildActionPlan(report): ActionItem[]`.

- [ ] **Step 1: Write failing priority-rule tests**

```ts
test("raises COGS as a critical data-quality action", () => {
  const findings = buildManagementFindings(reportWithMissingCogs);
  assert.equal(findings[0].code, "missing-cogs");
  assert.equal(findings[0].priority, "critical");
});

test("raises failed ad billing without inventing ROAS", () => {
  const findings = buildManagementFindings(reportWithFailedBilling);
  assert.ok(findings.some((item) => item.code === "ad-billing"));
  assert.ok(findings.every((item) => !item.summary.includes("ROAS")));
});
```

- [ ] **Step 2: Implement deterministic findings**

Rules return evidence, confidence (`high`, `medium`, `low`), source, and suggested action. Prioritize missing COGS and broken campaign tracking before optimization recommendations.

- [ ] **Step 3: Build the 30/60/90-day plan**

- 30 days: repair ad billing/tracking, capture COGS, establish weekly KPI review.
- 60 days: repeat top content formats, run tagged offers, compare weekday/daypart response.
- 90 days: evaluate campaign-to-order evidence, update product mix, and set budget rules only where attribution is reliable.

Tie every generated action to evidence in the selected range; label organization-wide data hygiene actions as persistent.

- [ ] **Step 4: Build data notes**

Show source coverage, extraction date, time zones, unavailable fields, metric definitions, and the static-refresh procedure.

- [ ] **Step 5: Run tests and commit**

Run: `npm run test:insights && npm run typecheck && npm run lint`

```bash
git add app/modules/insights
git commit -m "feat: add management findings and action plan"
```

---

### Task 8: Responsive browser QA and completion cleanup

**Files:**
- Modify: `app/modules/insights/insights.css`
- Modify: dashboard files only when QA exposes a defect
- Delete after verification: `docs/superpowers/specs/2026-09-01-marketing-insights-design.md`

**Interfaces:**
- Consumes: completed `/insights` route.
- Produces: verified desktop/mobile dashboard and a clean branch without the temporary spec.

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm run test:insights
npm run typecheck
npm run lint
npm run build
```

Expected: all tests, typecheck, and build pass; lint contains no new warnings beyond the five existing `cursor-sync.tsx` warnings.

- [ ] **Step 2: Start the production-like local app**

Run `npm run dev -- --host 127.0.0.1` and open `/insights` in the in-app browser.

- [ ] **Step 3: Verify route isolation and indexing**

Confirm `/`, `/vi`, and `/en` remain visually/functionally unchanged; `/insights` is not linked from them; page head includes `noindex, nofollow`.

- [ ] **Step 4: Verify all ranges and modes**

Check 7 days, 30 days, 90 days, year to date, 12 months, full range, and a custom range. Confirm URL state, comparison labels, totals, empty states, and preliminary/detail mode.

- [ ] **Step 5: Complete visual and accessibility review**

Capture and inspect every report section at desktop width and the full page at mobile width. Confirm no clipped text, overlapping controls, invisible focus, colour-only meaning, unreadable charts, or horizontal page overflow.

- [ ] **Step 6: Delete the approved temporary spec**

Delete only `docs/superpowers/specs/2026-09-01-marketing-insights-design.md` after all verification passes, as requested by the user. Keep this implementation plan as the audit trail.

- [ ] **Step 7: Commit cleanup and final fixes**

```bash
git add -A
git commit -m "chore: finalize marketing insights dashboard"
```

- [ ] **Step 8: Confirm final branch state**

Run: `git status --short --branch && git log --oneline --decorate -8`

Expected: clean worktree on `codex/marketing-insights`, with the dashboard commits based on `origin/main` and no design spec remaining.

