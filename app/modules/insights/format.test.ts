import assert from "node:assert/strict";
import test from "node:test";

import { formatCompact, formatPercent, formatVND } from "./format";

test("formats VND without fractional units", () => {
  assert.equal(formatVND(559_533_810), "559.533.810 ₫");
});

test("formats missing rates as unavailable", () => {
  assert.equal(formatPercent(null), "Chưa đủ dữ liệu");
});

test("formats compact Vietnamese counts", () => {
  assert.equal(formatCompact(18_866), "18,9 N");
});
