import { linePoints, summarizeSeries, type ChartDatum } from "../chart-model";
import { formatCompact } from "../format";

export function TrendChart({ data, label }: { data: ChartDatum[]; label: string }) {
  if (!data.length) return <div className="empty-panel">Không có dữ liệu trong khoảng đã chọn.</div>;
  const width = 900;
  const height = 250;
  const points = linePoints(data.map((item) => item.value), width, height);
  const path = points.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
  const maximum = Math.max(...data.map((item) => item.value));
  return (
    <figure className="trend-chart">
      <svg viewBox={`0 -18 ${width} ${height + 36}`} role="img" aria-label={`${label}. ${summarizeSeries(data)}`}>
        <defs>
          <linearGradient id="insights-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--brass)" stopOpacity=".32" />
            <stop offset="1" stopColor="var(--brass)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2={width} y1={(height / 4) * line} y2={(height / 4) * line} className="chart-grid" />)}
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} className="chart-area" />
        <path d={path} className="chart-line" />
        {points.map(([x, y], index) => <circle key={data[index].label} cx={x} cy={y} r="3.5"><title>{data[index].label}: {formatCompact(data[index].value)}</title></circle>)}
      </svg>
      <figcaption><span>{data[0].label}</span><strong>Đỉnh {formatCompact(maximum)}</strong><span>{data.at(-1)?.label}</span></figcaption>
    </figure>
  );
}
