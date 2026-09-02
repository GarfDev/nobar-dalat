import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { WeekdayPerformance } from "../computed-metrics";
import { formatDecimal, formatVND } from "../format";

const labels = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const shortLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function WeekdayPerformanceChart({ data }: { data: WeekdayPerformance[] }) {
  const displayOrder = new Map([1, 2, 3, 4, 5, 6, 0].map((weekday, index) => [weekday, index]));
  const chartData = data
    .filter((item) => item.activeDays > 0)
    .sort((a, b) => (displayOrder.get(a.weekday) ?? 0) - (displayOrder.get(b.weekday) ?? 0))
    .map((item) => ({ ...item, label: labels[item.weekday] }));
  if (!chartData.length) return <div className="empty-panel">Chưa có ngày bán trong khoảng đã chọn.</div>;
  const busiest = chartData.reduce((best, item) => (item.ordersPerActiveDay ?? 0) > (best.ordersPerActiveDay ?? 0) ? item : best);
  const highestTicket = chartData.reduce((best, item) => (item.averageOrderValue ?? 0) > (best.averageOrderValue ?? 0) ? item : best);

  return (
    <figure className="library-chart weekday-performance-chart" aria-label="So sánh số đơn trung bình mỗi ngày mở cửa và giá trị trung bình mỗi đơn theo thứ trong tuần.">
      <div className="chart-heading"><div><p>Nhịp bán hàng theo tuần</p><h3>Ngày nào đông đơn, ngày nào hóa đơn cao?</h3></div><small>Cột = số đơn/ngày mở cửa · Đường = giá trị trung bình/đơn</small></div>
      <div className="chart-answer-grid">
        <article><span>Nhiều đơn nhất</span><strong>{busiest.label}</strong><small>{formatDecimal(busiest.ordersPerActiveDay)} đơn / ngày mở cửa</small></article>
        <article><span>Hóa đơn cao nhất</span><strong>{highestTicket.label}</strong><small>{formatVND(highestTicket.averageOrderValue)} / đơn</small></article>
      </div>
      <ResponsiveContainer width="100%" height={330}>
        <ComposedChart data={chartData} margin={{ top: 18, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="rgba(231,225,213,.1)" vertical={false} />
          <XAxis dataKey="label" tickFormatter={(value) => shortLabels[labels.indexOf(String(value))]} tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
          <YAxis yAxisId="orders" tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} width={34} tickFormatter={(value) => formatDecimal(Number(value), 0)} />
          <YAxis yAxisId="ticket" orientation="right" tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} width={52} tickFormatter={(value) => `${formatDecimal(Number(value) / 1_000, 0)} N`} />
          <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} labelStyle={{ color: "#e7e1d5", marginBottom: 8 }} formatter={(value, name) => name === "Đơn / ngày mở cửa" ? [`${formatDecimal(Number(value))} đơn`, name] : [formatVND(Number(value)), name]} />
          <Legend iconSize={8} wrapperStyle={{ color: "#aaa399", fontSize: 11, paddingTop: 8 }} />
          <Bar yAxisId="orders" dataKey="ordersPerActiveDay" name="Đơn / ngày mở cửa" fill="#4d9187" radius={[2, 2, 0, 0]} maxBarSize={34} isAnimationActive={false} />
          <Line yAxisId="ticket" type="monotone" dataKey="averageOrderValue" name="Giá trị TB / đơn" stroke="#c39a55" strokeWidth={2.5} dot={{ r: 3, fill: "#11100e" }} activeDot={{ r: 4 }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <figcaption>“Đơn” là hóa đơn hoàn tất trong PosApp, chưa phải số khách hoặc số bàn.</figcaption>
    </figure>
  );
}
