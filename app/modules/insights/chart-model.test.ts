import assert from "node:assert/strict";
import test from "node:test";

import { linePoints, median, scatterPoints, summarizeSeries } from "./chart-model";

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

test("maps scatter values into a padded plotting area", () => {
  assert.deepEqual(
    scatterPoints(
      [
        { x: 10, y: 100 },
        { x: 20, y: 300 },
      ],
      120,
      80,
      10,
    ),
    [
      [10, 70],
      [110, 10],
    ],
  );
});

test("centers a scatter axis when all values are equal", () => {
  assert.deepEqual(scatterPoints([{ x: 5, y: 5 }], 100, 60, 10), [[50, 30]]);
});

test("calculates median for odd and even series", () => {
  assert.equal(median([9, 1, 5]), 5);
  assert.equal(median([1, 3, 8, 10]), 5.5);
  assert.equal(median([]), null);
});
