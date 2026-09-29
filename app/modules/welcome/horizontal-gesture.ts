export type GestureSample = {
  type: string;
  inHorizontalArea: boolean;
  deltaX: number;
  deltaY: number;
};

export function createHorizontalGestureGuard() {
  let inHorizontalArea = false;
  let direction: "horizontal" | "vertical" | null = null;
  let x = 0;
  let y = 0;

  return (sample: GestureSample) => {
    if (sample.type === "touchstart") {
      inHorizontalArea = sample.inHorizontalArea;
      direction = null;
      x = 0;
      y = 0;
      return true;
    }

    if (!sample.type.startsWith("touch") || !inHorizontalArea) return true;

    if (sample.type === "touchend") {
      const allowScroll = direction !== "horizontal";
      inHorizontalArea = false;
      return allowScroll;
    }

    if (sample.type !== "touchmove") return true;

    x += sample.deltaX;
    y += sample.deltaY;
    if (!direction && Math.hypot(x, y) >= 8) {
      direction = Math.abs(x) > Math.abs(y) ? "horizontal" : "vertical";
    }

    return direction === "vertical";
  };
}
