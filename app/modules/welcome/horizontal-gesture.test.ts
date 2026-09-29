import assert from "node:assert/strict";
import test from "node:test";
import { createHorizontalGestureGuard } from "./horizontal-gesture";

test("diagonal menu swipe never moves the vertical page", () => {
  const allowScroll = createHorizontalGestureGuard();
  allowScroll({
    type: "touchstart",
    inHorizontalArea: true,
    deltaX: 0,
    deltaY: 0,
  });

  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: true,
      deltaX: 4,
      deltaY: 2,
    }),
    false,
  );
  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: true,
      deltaX: 18,
      deltaY: 5,
    }),
    false,
  );
  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: true,
      deltaX: 1,
      deltaY: 7,
    }),
    false,
  );
  assert.equal(
    allowScroll({
      type: "touchend",
      inHorizontalArea: true,
      deltaX: 0,
      deltaY: 7,
    }),
    false,
  );
});

test("vertical menu swipe and touches elsewhere keep page scrolling", () => {
  const allowScroll = createHorizontalGestureGuard();
  allowScroll({
    type: "touchstart",
    inHorizontalArea: true,
    deltaX: 0,
    deltaY: 0,
  });
  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: true,
      deltaX: 2,
      deltaY: 15,
    }),
    true,
  );
  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: true,
      deltaX: 12,
      deltaY: 2,
    }),
    true,
  );
  assert.equal(
    allowScroll({
      type: "touchend",
      inHorizontalArea: true,
      deltaX: 0,
      deltaY: 2,
    }),
    true,
  );

  allowScroll({
    type: "touchstart",
    inHorizontalArea: false,
    deltaX: 0,
    deltaY: 0,
  });
  assert.equal(
    allowScroll({
      type: "touchmove",
      inHorizontalArea: false,
      deltaX: 20,
      deltaY: 5,
    }),
    true,
  );
  assert.equal(
    allowScroll({
      type: "wheel",
      inHorizontalArea: true,
      deltaX: 20,
      deltaY: 5,
    }),
    true,
  );
});
