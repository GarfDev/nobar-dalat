import assert from "node:assert/strict";
import test from "node:test";

import { correlationDecision, correlationLagSummary, correlationLabel, roasLabel } from "./interpretation";

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

test("summarizes near-identical lag results once instead of repeating four conclusions", () => {
  const summary = correlationLagSummary([
    { lag: 0, correlation: 0.3 },
    { lag: 1, correlation: 0.29 },
    { lag: 2, correlation: 0.32 },
    { lag: 3, correlation: 0.32 },
  ]);
  assert.equal(summary.title, "Không thấy khoảng thời gian nào nổi bật");
  assert.equal(summary.detail, "Cả bốn kết quả đều yếu và gần như giống nhau. Chưa thể nói khách thường mua sau 2 hay 3 ngày.");
});
