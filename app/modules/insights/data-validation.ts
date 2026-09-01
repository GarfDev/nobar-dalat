import type {
  DataCoverage,
  InsightData,
  ISODate,
  SourceCoverage,
} from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function assertISODate(value: string): asserts value is ISODate {
  if (!ISO_DATE.test(value)) {
    throw new Error(`Date must use YYYY-MM-DD: ${value}`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Date must be a valid YYYY-MM-DD value: ${value}`);
  }
}

function assertNonNegative(value: number | null, field: string) {
  if (value !== null && (!Number.isFinite(value) || value < 0)) {
    throw new Error(`${field} must be a non-negative number or null`);
  }
}

function assertIntegerVND(value: number | null, field: string) {
  if (value !== null && (!Number.isInteger(value) || value < 0)) {
    throw new Error(`${field} must be non-negative integer VND or null`);
  }
}

function coverage(dates: ISODate[]): SourceCoverage | null {
  if (dates.length === 0) return null;
  const sorted = [...dates].sort();
  return { start: sorted[0], end: sorted.at(-1)!, rows: dates.length };
}

export function validateInsightData(data: InsightData): DataCoverage {
  const revenueDates = new Set<string>();
  for (const row of data.revenue) {
    assertISODate(row.date);
    if (revenueDates.has(row.date)) {
      throw new Error(`duplicate revenue row: ${row.date}`);
    }
    revenueDates.add(row.date);
    assertIntegerVND(row.grossRevenue, "grossRevenue");
    assertIntegerVND(row.refunds, "refunds");
    assertIntegerVND(row.discounts, "discounts");
    assertIntegerVND(row.netRevenue, "netRevenue");
    assertIntegerVND(row.tax, "tax");
    assertIntegerVND(row.cogs, "cogs");
    assertNonNegative(row.orders, "orders");
    if (!Number.isInteger(row.orders)) {
      throw new Error("orders must be a non-negative integer");
    }
  }

  const socialKeys = new Set<string>();
  for (const row of data.social) {
    assertISODate(row.date);
    const key = `${row.date}:${row.platform}`;
    if (socialKeys.has(key)) throw new Error(`duplicate social row: ${key}`);
    socialKeys.add(key);
    for (const field of [
      "views",
      "audience",
      "interactions",
      "visits",
      "linkClicks",
      "follows",
    ] as const) {
      assertNonNegative(row[field], field);
    }
  }

  for (const row of data.products) {
    assertISODate(row.startDate);
    assertISODate(row.endDate);
    assertNonNegative(row.quantity, "quantity");
    assertIntegerVND(row.revenue, "product revenue");
    assertIntegerVND(row.discounts, "product discounts");
  }

  const contentIds = new Set<string>();
  for (const row of data.content) {
    assertISODate(row.date);
    if (contentIds.has(row.id)) throw new Error(`duplicate content id: ${row.id}`);
    contentIds.add(row.id);
  }

  const advertisingIds = new Set<string>();
  for (const row of data.advertising) {
    assertISODate(row.startDate);
    assertISODate(row.endDate);
    if (advertisingIds.has(row.id)) {
      throw new Error(`duplicate advertising id: ${row.id}`);
    }
    advertisingIds.add(row.id);
    assertIntegerVND(row.spend, "ad spend");
    assertIntegerVND(row.attributedRevenue, "attributed revenue");
  }

  assertISODate(data.quality.generatedAt);

  return {
    revenue: coverage(data.revenue.map((row) => row.date)),
    social: coverage(data.social.map((row) => row.date)),
    products: coverage(
      data.products.flatMap((row) => [row.startDate, row.endDate]),
    ),
    content: coverage(data.content.map((row) => row.date)),
    advertising: coverage(
      data.advertising.flatMap((row) => [row.startDate, row.endDate]),
    ),
  };
}
