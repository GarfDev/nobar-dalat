import assert from "node:assert/strict";
import test from "node:test";

import { correlationLabel, roasLabel } from "./interpretation";

test("does not use causal language", () => {
  for (const value of [-0.8, -0.2, 0, 0.2, 0.8]) {
    assert.doesNotMatch(correlationLabel(value), /gây ra|dẫn đến|cause/i);
  }
});

test("labels missing attribution", () => {
  assert.equal(roasLabel(null), "Chưa có dữ liệu doanh thu quy thuộc");
});
