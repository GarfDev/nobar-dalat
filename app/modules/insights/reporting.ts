import type {
  DateRange,
  InsightData,
  ISODate,
  Platform,
  RevenueDay,
  SocialDay,
} from "./types";

const DAY_MS = 86_400_000;

export type MetricPoint = { date: ISODate; value: number | null };

export type RevenueSummary = {
  days: number;
  grossRevenue: number;
  refunds: number;
  discounts: number;
  netRevenue: number;
  tax: number;
  orders: number;
  averageOrderValue: number | null;
  discountRate: number | null;
  cogs: number | null;
  cogsAvailable: boolean;
};

export type SocialSummary = {
  platform: Platform;
  days: number;
  views: number | null;
  audience: number | null;
  interactions: number | null;
  visits: number | null;
  linkClicks: number | null;
  follows: number | null;
};

export type InsightsReport = {
  range: DateRange;
  comparisonRange: DateRange;
  revenue: RevenueSummary;
  comparisonRevenue: RevenueSummary;
  revenueGrowth: number | null;
  orderGrowth: number | null;
  dailyRevenue: MetricPoint[];
  monthlyRevenue: Array<{ month: string; netRevenue: number; orders: number }>;
  weekdayRevenue: Array<{ weekday: number; netRevenue: number; orders: number }>;
  social: SocialSummary[];
  products: InsightData["products"];
  productCoverageExact: boolean;
  content: InsightData["content"];
  advertising: InsightData["advertising"];
  adSpend: number;
  quality: InsightData["quality"];
};

function epochDay(date: ISODate): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
}

function isoDate(day: number): ISODate {
  return new Date(day * DAY_MS).toISOString().slice(0, 10) as ISODate;
}

function isWithin(date: ISODate, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

function sumNullable<T>(rows: T[], read: (row: T) => number | null): number | null {
  const values = rows.map(read).filter((value): value is number => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function summarizeRevenue(rows: RevenueDay[]): RevenueSummary {
  const total = (read: (row: RevenueDay) => number) =>
    rows.reduce((sum, row) => sum + read(row), 0);
  const grossRevenue = total((row) => row.grossRevenue);
  const discounts = total((row) => row.discounts);
  const netRevenue = total((row) => row.netRevenue);
  const orders = total((row) => row.orders);
  const cogsValues = rows.map((row) => row.cogs);
  const cogsAvailable = rows.length > 0 && cogsValues.every((value) => value !== null);

  return {
    days: rows.length,
    grossRevenue,
    refunds: total((row) => row.refunds),
    discounts,
    netRevenue,
    tax: total((row) => row.tax),
    orders,
    averageOrderValue: orders === 0 ? null : netRevenue / orders,
    discountRate: grossRevenue === 0 ? null : discounts / grossRevenue,
    cogs: cogsAvailable
      ? cogsValues.reduce<number>((sum, value) => sum + (value ?? 0), 0)
      : null,
    cogsAvailable,
  };
}

function summarizeSocial(rows: SocialDay[], platform: Platform): SocialSummary {
  const platformRows = rows.filter((row) => row.platform === platform);
  return {
    platform,
    days: platformRows.length,
    views: sumNullable(platformRows, (row) => row.views),
    audience: sumNullable(platformRows, (row) => row.audience),
    interactions: sumNullable(platformRows, (row) => row.interactions),
    visits: sumNullable(platformRows, (row) => row.visits),
    linkClicks: sumNullable(platformRows, (row) => row.linkClicks),
    follows: sumNullable(platformRows, (row) => row.follows),
  };
}

export function previousRange(range: DateRange): DateRange {
  const length = epochDay(range.end) - epochDay(range.start) + 1;
  const end = epochDay(range.start) - 1;
  return { start: isoDate(end - length + 1), end: isoDate(end) };
}

export function clampRange(range: DateRange, coverage: DateRange): DateRange {
  const start = range.start < coverage.start ? coverage.start : range.start;
  const end = range.end > coverage.end ? coverage.end : range.end;
  return start <= end ? { start, end } : { start: coverage.start, end: coverage.end };
}

export function growthRate(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / previous;
}

export function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;
  const meanX = x.reduce((sum, value) => sum + value, 0) / x.length;
  const meanY = y.reduce((sum, value) => sum + value, 0) / y.length;
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let index = 0; index < x.length; index += 1) {
    const dx = x[index] - meanX;
    const dy = y[index] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  const denominator = Math.sqrt(varianceX * varianceY);
  if (denominator === 0) return null;
  const result = covariance / denominator;
  return Math.abs(result) > 1 && Math.abs(result) < 1 + Number.EPSILON * 10
    ? Math.sign(result)
    : result;
}

export function laggedCorrelation(
  marketing: MetricPoint[],
  revenue: MetricPoint[],
  lagDays: number,
): { correlation: number | null; pairs: number } {
  const revenueByDate = new Map(revenue.map((point) => [point.date, point.value]));
  const pairs = marketing.flatMap((point) => {
    const shiftedDate = isoDate(epochDay(point.date) + lagDays);
    const revenueValue = revenueByDate.get(shiftedDate);
    return point.value === null || revenueValue === null || revenueValue === undefined
      ? []
      : [[point.value, revenueValue] as const];
  });
  return {
    correlation:
      pairs.length < 3
        ? null
        : pearsonCorrelation(
            pairs.map(([marketingValue]) => marketingValue),
            pairs.map(([, revenueValue]) => revenueValue),
          ),
    pairs: pairs.length,
  };
}

export function buildReport(data: InsightData, range: DateRange): InsightsReport {
  const comparisonRange = previousRange(range);
  const revenueRows = data.revenue.filter((row) => isWithin(row.date, range));
  const comparisonRows = data.revenue.filter((row) => isWithin(row.date, comparisonRange));
  const revenue = summarizeRevenue(revenueRows);
  const comparisonRevenue = summarizeRevenue(comparisonRows);
  const socialRows = data.social.filter((row) => isWithin(row.date, range));

  const monthly = new Map<string, { netRevenue: number; orders: number }>();
  const weekdays = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    netRevenue: 0,
    orders: 0,
  }));
  for (const row of revenueRows) {
    const month = row.date.slice(0, 7);
    const current = monthly.get(month) ?? { netRevenue: 0, orders: 0 };
    current.netRevenue += row.netRevenue;
    current.orders += row.orders;
    monthly.set(month, current);
    const weekday = new Date(`${row.date}T00:00:00Z`).getUTCDay();
    weekdays[weekday].netRevenue += row.netRevenue;
    weekdays[weekday].orders += row.orders;
  }

  const products = data.products.filter(
    (item) => item.startDate >= range.start && item.endDate <= range.end,
  );
  const productCoverageExact = data.products.every(
    (item) =>
      item.endDate < range.start ||
      item.startDate > range.end ||
      (item.startDate >= range.start && item.endDate <= range.end),
  );
  const advertising = data.advertising.filter(
    (item) => item.startDate <= range.end && item.endDate >= range.start,
  );

  return {
    range,
    comparisonRange,
    revenue,
    comparisonRevenue,
    revenueGrowth: growthRate(revenue.netRevenue, comparisonRevenue.netRevenue),
    orderGrowth: growthRate(revenue.orders, comparisonRevenue.orders),
    dailyRevenue: revenueRows.map((row) => ({ date: row.date, value: row.netRevenue })),
    monthlyRevenue: [...monthly].map(([month, values]) => ({ month, ...values })),
    weekdayRevenue: weekdays,
    social: [
      summarizeSocial(socialRows, "instagram"),
      summarizeSocial(socialRows, "facebook"),
    ],
    products,
    productCoverageExact,
    content: data.content.filter((item) => isWithin(item.date, range)),
    advertising,
    adSpend: advertising.reduce((sum, item) => sum + item.spend, 0),
    quality: data.quality,
  };
}
