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
