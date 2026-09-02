import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type RevenueRaw = string[];
type OrderRaw = {
  id: string;
  paidAt: string;
  channel: string | null;
  table: string | null;
};

type ProductRaw = {
  product: string;
  quantity: number;
  revenue: number;
};

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "app/data/insights");
const START = "2024-09-01";
const END = "2026-08-31";

// PosApp's invoice export omitted counts on 58 dates that still had revenue.
// These values were reconciled against the visible daily "Số đơn hàng" KPI.
const reconciledOrderCounts: Record<string, number> = {
  "2024-11-16": 2, "2024-11-17": 2, "2024-11-18": 4, "2024-11-19": 3,
  "2024-11-21": 3, "2024-11-22": 4, "2024-11-23": 5, "2024-11-24": 3,
  "2024-11-25": 3, "2024-11-26": 6, "2024-11-28": 2, "2024-11-29": 4,
  "2024-11-30": 1, "2024-12-01": 3, "2024-12-02": 2, "2024-12-03": 3,
  "2024-12-06": 1, "2024-12-07": 1, "2024-12-08": 4, "2024-12-09": 5,
  "2024-12-10": 2, "2024-12-11": 2, "2024-12-12": 1, "2024-12-13": 5,
  "2024-12-14": 1, "2024-12-15": 4, "2024-12-16": 2, "2024-12-17": 3,
  "2024-12-18": 3, "2024-12-19": 1, "2024-12-21": 4, "2024-12-22": 4,
  "2026-07-21": 6, "2026-07-22": 9, "2026-07-23": 8, "2026-07-24": 13,
  "2026-07-25": 9, "2026-07-26": 16, "2026-07-27": 9, "2026-07-28": 5,
  "2026-07-29": 7, "2026-07-30": 18, "2026-07-31": 17, "2026-08-01": 13,
  "2026-08-02": 12, "2026-08-03": 13, "2026-08-04": 6, "2026-08-05": 11,
  "2026-08-06": 10, "2026-08-07": 12, "2026-08-08": 14, "2026-08-09": 7,
  "2026-08-10": 11, "2026-08-11": 13, "2026-08-12": 13, "2026-08-13": 11,
  "2026-08-14": 16, "2026-08-15": 18,
};

const parseVND = (value: string) => Number(value.replaceAll(",", ""));

function isoFromVietnameseDate(value: string) {
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function datesBetween(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

async function readJSON<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

async function main() {
  const rawRevenue = await readJSON<RevenueRaw[]>(
    "/tmp/nobar-posapp-revenue-raw.json",
  );
  const orders = (
    await Promise.all(
      [2024, 2025, 2026].map((year) =>
        readJSON<OrderRaw[]>(`/tmp/nobar-posapp-orders-${year}.json`),
      ),
    )
  ).flat();
  const facebook = await readJSON<unknown[]>(
    "/tmp/nobar-meta-facebook-daily.json",
  );
  const instagram = await readJSON<unknown[]>(
    "/tmp/nobar-meta-instagram-daily.json",
  );
  const content = await readJSON<unknown[]>(
    "/tmp/nobar-meta-content-top.json",
  );
  const productPeriods = [
    { year: 2024, startDate: "2024-09-01", endDate: "2024-12-31" },
    { year: 2025, startDate: "2025-01-01", endDate: "2025-12-31" },
    { year: 2026, startDate: "2026-01-01", endDate: "2026-08-31" },
  ];
  const products = (
    await Promise.all(
      productPeriods.map(async ({ year, startDate, endDate }) => {
        const rows = await readJSON<ProductRaw[]>(
          `/tmp/nobar-posapp-products-${year}.json`,
        );
        return rows.map((row) => ({
          startDate,
          endDate,
          product: row.product,
          category: null,
          quantity: row.quantity,
          revenue: row.revenue,
          discounts: null,
        }));
      }),
    )
  ).flat();

  const revenueByDate = new Map(
    rawRevenue.map((row) => [isoFromVietnameseDate(row[0]), row]),
  );
  const ordersByDate = new Map<string, number>();
  for (const order of orders) {
    const date = order.paidAt.slice(0, 10);
    if (date < START || date > END) continue;
    ordersByDate.set(date, (ordersByDate.get(date) ?? 0) + 1);
  }
  for (const [date, count] of Object.entries(reconciledOrderCounts)) {
    ordersByDate.set(date, count);
  }

  const revenue = datesBetween(START, END).map((date) => {
    const row = revenueByDate.get(date);
    return {
      date,
      grossRevenue: row ? parseVND(row[1]) : 0,
      refunds: row ? parseVND(row[2]) : 0,
      discounts: row ? parseVND(row[3]) : 0,
      netRevenue: row ? parseVND(row[4]) : 0,
      tax: row ? parseVND(row[7]) : 0,
      orders: ordersByDate.get(date) ?? 0,
      cogs: null,
    };
  });

  const quality = {
    generatedAt: "2026-09-01",
    notes: [
      "PosApp revenue contains 668 trading days; 62 missing calendar days are normalized as verified zero-sales days.",
      "Order count represents PosApp orders, not unique guests or physical table turns.",
      "The invoice export omitted counts on 58 revenue days; 390 orders on those dates were reconciled against the daily PosApp 'Số đơn hàng' KPI.",
      "Twenty-four invoice rows without a payment timestamp are excluded from date-based order counts.",
      "PosApp COGS is zero throughout the source report and is normalized to null.",
      "Meta metrics use the platform reporting boundary and may not align perfectly with Asia/Ho_Chi_Minh trading dates.",
      "Facebook views and viewers are available from 2025-08-01; earlier days are null because Meta marks the metric unavailable.",
      "Instagram visits are unavailable for the selected two-year range.",
      "Instagram follows are available from 2025-08-27 through 2026-08-30.",
      "Product totals are supplied in three source windows: Sep-Dec 2024, calendar 2025, and Jan-Aug 2026.",
      "This dataset is a static snapshot through 2026-08-31.",
    ],
    sourceTimezones: {
      posapp: "Asia/Ho_Chi_Minh",
      meta: "Platform reporting timezone",
    },
    unavailableFields: [
      "cogs",
      "profit",
      "grossMargin",
      "attributedRevenue",
      "roas",
      "uniqueGuests",
      "physicalTableTurns",
    ],
  };

  await mkdir(OUTPUT, { recursive: true });
  const files: Record<string, unknown> = {
    "revenue-daily.json": revenue,
    "social-daily.json": [...facebook, ...instagram],
    "product-performance.json": products,
    "content-performance.json": content,
    "advertising-performance.json": [
      {
        id: "messages-2026-08",
        startDate: "2026-08-27",
        endDate: "2026-08-31",
        platform: "meta",
        label: "Chào bạn mến!",
        spend: 477495,
        resultType: "Messaging conversations started",
        results: 2,
        views: 4501,
        audience: 213,
        trackedPurchases: null,
        attributedRevenue: null,
        deliveryStatus: "Not delivering",
      },
      {
        id: "local-awareness-2025-10",
        startDate: "2025-10-19",
        endDate: "2025-10-29",
        platform: "meta",
        label: "Promoting local business NObar Dalat",
        spend: 391846,
        resultType: "Reach",
        results: 32655,
        views: 67457,
        audience: 32655,
        trackedPurchases: null,
        attributedRevenue: null,
        deliveryStatus: "Completed",
      },
    ],
    "data-quality.json": quality,
  };
  await Promise.all(
    Object.entries(files).map(([name, value]) =>
      writeFile(path.join(OUTPUT, name), `${JSON.stringify(value, null, 2)}\n`),
    ),
  );

  const totals = revenue.reduce(
    (sum, row) => ({
      grossRevenue: sum.grossRevenue + row.grossRevenue,
      netRevenue: sum.netRevenue + row.netRevenue,
      orders: sum.orders + row.orders,
    }),
    { grossRevenue: 0, netRevenue: 0, orders: 0 },
  );
  console.log({ days: revenue.length, sourceRows: rawRevenue.length, ...totals });
}

await main();
