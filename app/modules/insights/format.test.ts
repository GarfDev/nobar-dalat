import assert from "node:assert/strict";
import test from "node:test";

import { formatCompact, formatDecimal, formatPercent, formatVND } from "./format";

test("formats VND without fractional units", () => {
  assert.equal(formatVND(559_533_810), "559.533.810 ₫");
});

test("formats missing rates as unavailable", () => {
  assert.equal(formatPercent(null), "Chưa đủ dữ liệu");
});

test("formats compact Vietnamese counts", () => {
  assert.equal(formatCompact(18_866), "18,9 nghìn");
  assert.equal(formatCompact(1_250_000), "1,3 triệu");
});

test("formats computed ratios with controlled precision", () => {
  assert.equal(formatDecimal(12.345), "12,3");
  assert.equal(formatDecimal(null), "Chưa đủ dữ liệu");
});
