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
      "Order count represents completed invoice rows, not unique guests or physical table turns.",
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
