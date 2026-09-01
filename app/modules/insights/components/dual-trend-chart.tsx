import { linePoints } from "../chart-model";
import { formatCompact } from "../format";

type DualTrendDatum = {
  label: string;
  primary: number;
  secondary: number;
};

export function DualTrendChart({ data }: { data: DualTrendDatum[] }) {
  if (!data.length) return <div className="empty-panel">Không có dữ liệu trong khoảng đã chọn.</div>;
  const width = 900;
  const height = 250;
  const primaryPoints = linePoints(data.map((item) => item.primary), width, height);
  const secondaryPoints = linePoints(data.map((item) => item.secondary), width, height);
  const path = (points: Array<[number, number]>) => points.map(([x, y], index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ");
  const primaryPath = path(primaryPoints);
  const secondaryPath = path(secondaryPoints);
  const peakRevenue = Math.max(...data.map((item) => item.primary));
  const peakOrders = Math.max(...data.map((item) => item.secondary));

  return (
    <figure className="trend-chart dual-trend-chart">
      <div className="chart-heading">
        <div><span className="legend-line brass" /> Doanh thu thuần</div>
        <div><span className="legend-line teal" /> Đơn hoàn tất</div>
        <small>Hai chuỗi dùng thang riêng để so sánh nhịp, không so độ cao tuyệt đối.</small>
      </div>
      <svg viewBox={`0 -18 ${width} ${height + 36}`} role="img" aria-label={`Xu hướng doanh thu và số đơn theo tháng. Đỉnh doanh thu ${formatCompact(peakRevenue)}, đỉnh số đơn ${formatCompact(peakOrders)}.`}>
        <defs>
          <linearGradient id="insights-dual-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--brass)" stopOpacity=".3" />
            <stop offset="1" stopColor="var(--brass)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2={width} y1={(height / 4) * line} y2={(height / 4) * line} className="chart-grid" />)}
        <path d={`${primaryPath} L ${width} ${height} L 0 ${height} Z`} className="chart-area dual-area" />
        <path d={primaryPath} className="chart-line" />
        <path d={secondaryPath} className="chart-line chart-line-secondary" />
        {secondaryPoints.map(([x, y], index) => <circle key={data[index].label} cx={x} cy={y} r="3" className="secondary-point" aria-label={`${data[index].label}: ${formatCompact(data[index].secondary)} đơn`} />)}
      </svg>
      <figcaption><span>{data[0].label}</span><strong>Đỉnh {formatCompact(peakRevenue)} · {formatCompact(peakOrders)} đơn</strong><span>{data.at(-1)?.label}</span></figcaption>
    </figure>
  );
}
