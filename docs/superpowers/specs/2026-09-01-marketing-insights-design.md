# NObar Marketing & F&B Insights — Design Specification

**Date:** 2026-09-01  
**Base:** `origin/main`  
**Route:** `/insights`  
**Reporting coverage:** 2024-09-01 through 2026-08-31

## 1. Purpose

Create an unlisted management reporting page for NObar Đà Lạt. The page combines PosApp sales data with Facebook and Instagram performance so the owner can review the business at a glance, investigate details, compare arbitrary date ranges, and turn findings into operating actions.

The page is intentionally absent from public navigation. It has no password or account gate, so anyone who knows the URL can view it. No API keys, credentials, or live account connections will be shipped to the browser.

## 2. Success criteria

- The page supports any start/end date within the complete two-year dataset.
- Presets cover 7 days, 30 days, 90 days, year to date, trailing 12 months, and the full dataset.
- Every headline metric recalculates when the selected range changes.
- The user can switch between a concise executive report and detailed business reports without leaving the route.
- Revenue and Meta metrics remain visibly distinguished; the interface never implies that social activity caused sales.
- Missing or unreliable source fields are labelled instead of being treated as zero-quality facts.
- The route is responsive, keyboard-usable, and readable on mobile and desktop.
- The existing public website and its language routes remain unchanged.

## 3. Scope

### Included

1. **Executive overview**
   - Net and gross revenue
   - Orders and average order value
   - Discounts and discount rate
   - Period-over-period revenue and order growth
   - Facebook and Instagram views, audience, interactions, visits, link clicks, and follows
   - High-priority alerts and a short management summary

2. **Revenue report**
   - Daily, weekly, and monthly trends
   - Comparison with the immediately preceding range of equal length
   - Performance by day of week
   - Best and weakest trading days
   - Gross revenue, refunds, discounts, net revenue, tax, and order count

3. **Product and sales-mix report**
   - Top products by quantity and revenue when PosApp exports provide those fields
   - Category contribution and concentration
   - Discount contribution by item/category when available
   - Explicit unavailable state when source detail is missing

4. **Marketing report**
   - Facebook and Instagram scorecards
   - Daily/monthly trends for views, audience, interactions, visits, link clicks, and follows
   - Engagement and conversion-proxy rates using clearly stated denominators
   - Platform comparison without combining unlike metrics

5. **Content report**
   - Top content by views and by interactions
   - Post type, publish date, organic/paid split when available, watch time, saves, shares, and follows
   - Content-pattern observations and recommended repeatable formats

6. **Advertising report**
   - Spend, results, cost per result, delivery status, and tracked purchases
   - Tracking and billing warnings
   - No ROAS claim when purchase attribution is absent

7. **Marketing-to-revenue relationship**
   - Same-day and lagged correlations between daily marketing activity and net revenue
   - Clear wording that correlation is directional evidence, not causation
   - Time-zone/source-alignment note

8. **Management actions**
   - Prioritized findings
   - 30/60/90-day action plan
   - Data-quality checklist for COGS, attribution, and campaign tracking

### Excluded from the first version

- Live Meta or PosApp API synchronization
- Authentication or role-based access
- Editing source data from the dashboard
- Forecasting, automated budget allocation, or AI-generated decisions
- True gross margin, contribution margin, or profit calculations until valid COGS data exists
- Labour, inventory wastage, table turnover, and customer-retention reports unless their source data is supplied

## 4. Information architecture

The route uses a compact left rail on desktop and a horizontal section switcher on mobile:

1. Overview
2. Revenue
3. Products
4. Marketing
5. Content
6. Advertising
7. Relationship
8. Action plan
9. Data notes

The date-range control stays visible near the top. The selected range and comparison range are displayed in plain language. A “Sơ bộ / Chi tiết” switch changes information density: the preliminary view shows headline cards, core charts, alerts, and conclusions; the detailed view reveals supporting tables and secondary metrics.

## 5. Data architecture

### Source files

Static normalized data will live under `app/data/insights/`:

- `revenue-daily.json`: one row per local trading date
- `product-performance.json`: product/category aggregates with reporting dates where available
- `social-daily.json`: one row per date and platform
- `content-performance.json`: one row per content item
- `advertising-performance.json`: one row per campaign/ad or reporting item
- `data-quality.json`: coverage, source timestamps, unavailable fields, and warnings

No credentials, cookies, tokens, or downloaded raw files will be committed.

### Normalization

- Canonical date format: `YYYY-MM-DD`
- Currency: integer Vietnamese đồng
- Percentages: decimal values in data, formatted in the UI
- Platform: `facebook` or `instagram`
- Missing values: `null`; zero is reserved for a verified numeric zero
- PosApp dates are treated as `Asia/Ho_Chi_Minh`
- Meta dates retain their reported platform boundary and carry a time-zone caveat

### Range engine

A pure reporting module will:

1. Validate and clamp the requested range to available coverage.
2. Filter all datasets using inclusive start/end dates.
3. Create an equal-length immediately preceding comparison range when data exists.
4. Aggregate totals, weighted rates, daily/monthly series, and rankings.
5. Return structured results to presentation components.

Calculations remain outside React components so they can be unit tested independently.

## 6. Metric definitions

- **Net revenue:** PosApp net revenue after discount/refund according to the export.
- **Average order value:** net revenue divided by valid order count.
- **Discount rate:** discount divided by gross revenue.
- **Period growth:** `(current - comparison) / comparison`; unavailable when comparison is zero or incomplete.
- **Engagement rate:** interactions divided by the platform audience metric used for that card; the exact denominator is labelled.
- **Link action rate:** link clicks divided by views, used only as a directional proxy.
- **Cost per result:** ad spend divided by tracked results.
- **ROAS:** omitted unless attributed purchase revenue is present.
- **Profit/margin:** unavailable while COGS is absent or recorded as zero across the source period.

## 7. Visual direction

The dashboard should feel like an internal hospitality control room rather than a generic SaaS template. It will reuse NObar’s existing typography and dark brand atmosphere, with warm cream surfaces, red/orange accents for emphasis, and restrained green/red status colours.

- Dense but calm data hierarchy
- Large headline figures with concise Vietnamese labels
- Line/area charts for time series, bars for rankings and weekday comparison
- Tables used only where exact values matter
- Tooltips and captions explain unusual metrics and limitations
- Charts must include text summaries so meaning is not colour-dependent

## 8. Components and boundaries

- `InsightsRoute`: route shell, metadata, and noindex directives
- `RangeControls`: presets, custom dates, preliminary/detail mode
- `InsightsNavigation`: section navigation and mobile switcher
- `KpiCard`: value, comparison, source, and warning state
- `TrendChart`: accessible revenue or social time series
- `BreakdownChart`: weekday, platform, category, or content ranking
- `ReportTable`: sortable exact-value detail
- `InsightCallout`: finding, evidence, confidence, and suggested action
- `DataQualityPanel`: coverage and source limitations
- `reporting.ts`: filtering, comparison periods, aggregations, rankings, and correlation helpers
- `types.ts`: normalized source and computed-report contracts

No dashboard component imports account clients or network credentials.

## 9. Error and empty states

- Invalid date ranges are corrected and explained inline.
- Ranges outside coverage are clamped to the nearest available dates.
- Partial comparison periods show “không đủ dữ liệu so sánh”.
- Missing product, COGS, or attribution data produces a clear unavailable panel, never a misleading zero.
- Charts with no rows render an explanatory empty state.
- Data parsing failures fail the route visibly in development and fall back to a compact data-error panel in production.

## 10. Privacy, discoverability, and indexing

- The route is not linked from the public site.
- Page metadata includes `robots: noindex, nofollow`.
- The route is excluded from sitemap/navigation generation if those are added later.
- This is obscurity, not access control. The UI includes a small internal-use notice, and the implementation avoids exposing raw account identifiers or credentials.

## 11. Testing and verification

### Unit tests

- Inclusive date filtering and preset boundaries
- Equal-length comparison ranges
- Monthly and weekday aggregation
- AOV and discount-rate calculations
- Missing/zero denominator handling
- Ranking stability and tie handling
- Correlation and lag alignment

### Route/component verification

- `/insights` renders independently from `/:lang`
- The route is absent from visible navigation
- Every section responds to preset and custom date changes
- Preliminary/detail mode changes density without changing totals
- Empty/unavailable states are accessible
- `noindex, nofollow` metadata is present

### Project baseline

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Browser checks at desktop and mobile widths
- Screenshot review for all report sections and at least three date ranges

## 12. Initial known limitations

- PosApp currently reports COGS as zero, so profit and margin are not trustworthy.
- Existing Meta advertising data does not contain reliable purchase attribution, so ROAS cannot be reported.
- Meta and PosApp may use different day boundaries; lagged relationships must be interpreted cautiously.
- The first release is a static snapshot through 2026-08-31. Updating it requires replacing normalized data files and rebuilding the site.

## 13. Delivery sequence

1. Extract and normalize the two-year PosApp and Meta datasets.
2. Add types, validation, and reporting calculations with tests.
3. Build the hidden route shell and range controls.
4. Implement the preliminary overview.
5. Implement detailed report sections.
6. Add findings, data-quality notes, and 30/60/90-day actions.
7. Run project tests, build, responsive browser QA, and visual review.

