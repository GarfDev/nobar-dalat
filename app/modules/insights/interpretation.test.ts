import assert from "node:assert/strict";
import test from "node:test";

import { correlationDecision, correlationLabel, roasLabel } from "./interpretation";

test("does not use causal language", () => {
  for (const value of [-0.8, -0.2, 0, 0.2, 0.8]) {
    assert.doesNotMatch(correlationLabel(value), /gây ra|dẫn đến|cause/i);
  }
});

test("labels missing attribution", () => {
  assert.equal(roasLabel(null), "Chưa có dữ liệu doanh thu quy thuộc");
});

test("translates weak correlation into a management conclusion", () => {
  assert.equal(correlationLabel(0.19), "Dữ liệu chưa cho thấy hai chỉ số đi cùng nhau");
  assert.match(correlationDecision(0.19), /chưa cho thấy tương tác Meta.*doanh thu.*đi cùng nhau/i);
});

test("keeps stronger signals cautious and directional", () => {
  assert.match(correlationLabel(0.5), /doanh thu cao hơn/i);
  assert.match(correlationLabel(-0.5), /doanh thu thấp hơn/i);
  assert.doesNotMatch(correlationDecision(0.8), /chắc chắn|gây ra|dẫn đến/i);
});
