export type ChartDatum = { label: string; value: number };

export function linePoints(values: number[], width: number, height: number): Array<[number, number]> {
  if (!values.length) return [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = maximum - minimum;
  return values.map((value, index) => [
    values.length === 1 ? width / 2 : (index / (values.length - 1)) * width,
    span === 0 ? height / 2 : height - ((value - minimum) / span) * height,
  ]);
}

export function summarizeSeries(series: ChartDatum[]): string {
  if (!series.length) return "Không có dữ liệu trong khoảng đã chọn.";
  const highest = series.reduce((best, item) => (item.value > best.value ? item : best));
  const lowest = series.reduce((best, item) => (item.value < best.value ? item : best));
  return `Cao nhất ${highest.label}: ${highest.value}. Thấp nhất ${lowest.label}: ${lowest.value}.`;
}

export function scatterPoints(
  values: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  padding = 0,
): Array<[number, number]> {
  if (!values.length) return [];
  const xValues = values.map(({ x }) => x);
  const yValues = values.map(({ y }) => y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const plotWidth = Math.max(width - padding * 2, 0);
  const plotHeight = Math.max(height - padding * 2, 0);
  return values.map(({ x, y }) => [
    maxX === minX ? width / 2 : padding + ((x - minX) / (maxX - minX)) * plotWidth,
    maxY === minY ? height / 2 : height - padding - ((y - minY) / (maxY - minY)) * plotHeight,
  ]);
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[midpoint] : (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}
