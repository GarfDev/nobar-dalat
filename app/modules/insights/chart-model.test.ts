import assert from "node:assert/strict";
import test from "node:test";

import { linePoints, summarizeSeries } from "./chart-model";

test("maps a flat series to the vertical midpoint", () => {
  assert.deepEqual(linePoints([5, 5], 100, 40), [
    [0, 20],
    [100, 20],
  ]);
});

test("summarizes extrema", () => {
  assert.match(
    summarizeSeries([
      { label: "Thg 7", value: 10 },
      { label: "Thg 8", value: 15 },
    ]),
    /Thg 8.*15/,
  );
});
