import assert from "node:assert/strict";
import test from "node:test";

import { median } from "./chart-model";

test("calculates median for odd and even series", () => {
  assert.equal(median([9, 1, 5]), 5);
  assert.equal(median([1, 3, 8, 10]), 5.5);
  assert.equal(median([]), null);
});
