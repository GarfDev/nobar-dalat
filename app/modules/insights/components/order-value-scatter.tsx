import { median, scatterPoints } from "../chart-model";
import { formatDate, formatVND } from "../format";
import type { ISODate } from "../types";

type ScatterDatum = {
  date: ISODate;
  orders: number;
  averageOrderValue: number;
  weekend: boolean;
};

export function OrderValueScatter({ data }: { data: ScatterDatum[] }) {
  if (data.length < 2) return <div className="empty-panel">Chưa đủ ngày có đơn để dựng biểu đồ.</div>;
  const width = 560;
  const height = 320;
  const padding = 30;
  const values = data.map((item) => ({ x: item.orders, y: item.averageOrderValue }));
  const medianOrders = median(data.map((item) => item.orders)) ?? 0;
  const medianAov = median(data.map((item) => item.averageOrderValue)) ?? 0;
  const points = scatterPoints([...values, { x: medianOrders, y: medianAov }], width, height, padding);
  const [medianX, medianY] = points.at(-1) ?? [width / 2, height / 2];

  return (
    <figure className="scatter-chart">
      <header><div><p>Demand × ticket size</p><h3>Đơn mỗi ngày vs giá trị đơn</h3></div><div className="scatter-legend"><span><i className="weekday" /> T2–T5</span><span><i className="weekend" /> T6–CN</span></div></header>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Phân bố ${data.length} ngày bán theo số đơn và giá trị trung bình mỗi đơn.`}>
        <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} className="scatter-field" />
        <line x1={medianX} x2={medianX} y1={padding} y2={height - padding} className="scatter-median" />
        <line x1={padding} x2={width - padding} y1={medianY} y2={medianY} className="scatter-median" />
        {points.slice(0, -1).map(([x, y], index) => <circle key={data[index].date} cx={x} cy={y} r="2.4" className={data[index].weekend ? "weekend-point" : "weekday-point"} aria-label={`${formatDate(data[index].date)} · ${data[index].orders} đơn · ${formatVND(data[index].averageOrderValue)}`} />)}
      </svg>
      <figcaption><span>Trục ngang: số đơn/ngày</span><strong>Đường đứt: trung vị kỳ chọn</strong><span>Trục dọc: giá trị TB/đơn</span></figcaption>
    </figure>
  );
}
