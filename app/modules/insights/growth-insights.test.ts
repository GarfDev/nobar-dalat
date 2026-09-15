import test from "node:test";
import assert from "node:assert/strict";
import { calendarRange, revenueDrivers, periodMetric } from "./growth-insights";

test("calendar presets cross year and include the whole anchor month", () => {
  assert.deepEqual(calendarRange("2026-02", 3), {
    start: "2025-12-01",
    end: "2026-02-28",
  });
  assert.deepEqual(calendarRange("2024-02", 1), {
    start: "2024-02-01",
    end: "2024-02-29",
  });
});
test("revenue change decomposes exactly into order and ticket effects", () => {
  assert.deepEqual(revenueDrivers(1200, 12, 800, 10, true), {
    orderEffect: 160,
    ticketEffect: 240,
    aovGrowth: 0.25,
  });
  assert.equal(revenueDrivers(1200, 12, 800, 10, false), null);
  assert.equal(revenueDrivers(1200, 12, 0, 0, true), null);
});
test("growth requires both complete periods and nonzero baseline", () => {
  assert.deepEqual(periodMetric([10, 20], [5, 10]), {
    current: 30,
    previous: 15,
    growth: 1,
  });
  assert.deepEqual(periodMetric([10, null], [5, 10]), {
    current: null,
    previous: 15,
    growth: null,
  });
  assert.equal(periodMetric([10], [0]).growth, null);
});
