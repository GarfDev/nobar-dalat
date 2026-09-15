import type { DateRange, ISODate } from "./types";

export function calendarRange(month: string, count: number): DateRange {
  const [year, m] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, m - count, 1))
      .toISOString()
      .slice(0, 10) as ISODate,
    end: new Date(Date.UTC(year, m, 0)).toISOString().slice(0, 10) as ISODate,
  };
}

export function revenueDrivers(
  revenue: number,
  orders: number,
  previousRevenue: number,
  previousOrders: number,
  complete: boolean,
) {
  if (!complete || orders <= 0 || previousOrders <= 0 || previousRevenue <= 0)
    return null;
  const previousAov = previousRevenue / previousOrders;
  const aov = revenue / orders;
  return {
    orderEffect: (orders - previousOrders) * previousAov,
    ticketEffect: orders * (aov - previousAov),
    aovGrowth: (aov - previousAov) / previousAov,
  };
}

export function periodMetric(
  current: (number | null)[],
  previous: (number | null)[],
) {
  const sum = (values: (number | null)[]) =>
    values.length && values.every((v) => v !== null)
      ? values.reduce<number>((a, v) => a + (v ?? 0), 0)
      : null;
  const c = sum(current),
    p = sum(previous);
  return {
    current: c,
    previous: p,
    growth:
      c === null || p === null || p === 0 || current.length !== previous.length
        ? null
        : (c - p) / p,
  };
}
