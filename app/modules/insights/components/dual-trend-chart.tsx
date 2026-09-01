import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompact, formatNumber, formatVND } from "../format";

type DualTrendDatum = { label: string; primary: number; secondary: number };

export function DualTrendChart({ data }: { data: DualTrendDatum[] }) {
  if (!data.length) return <div className="empty-panel">Không có dữ liệu trong khoảng đã chọn.</div>;
  const peakRevenue = Math.max(...data.map((item) => item.primary));
  const peakOrders = Math.max(...data.map((item) => item.secondary));

  return (
    <figure className="library-chart dual-trend-chart" aria-label={`Xu hướng doanh thu và số đơn theo tháng. Đỉnh doanh thu ${formatCompact(peakRevenue)}, đỉnh số đơn ${formatCompact(peakOrders)}.`}>
      <div className="chart-heading"><div><p>Monthly performance</p><h3>Doanh thu và số đơn</h3></div><small>Hai trục hiển thị giá trị thật: doanh thu bên trái, số đơn bên phải.</small></div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 14, right: 8, bottom: 4, left: 0 }}>
          <defs><linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c39a55" stopOpacity={0.36} /><stop offset="1" stopColor="#c39a55" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid stroke="rgba(231,225,213,.1)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis yAxisId="revenue" tickFormatter={formatCompact} tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} width={54} />
          <YAxis yAxisId="orders" orientation="right" tickFormatter={formatNumber} tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} labelStyle={{ color: "#e7e1d5", marginBottom: 8 }} formatter={(value, name) => name === "Doanh thu thuần" ? [formatVND(Number(value)), name] : [`${formatNumber(Number(value))} đơn`, name]} />
          <Legend wrapperStyle={{ color: "#aaa399", fontSize: 11, paddingTop: 8 }} />
          <Area yAxisId="revenue" type="monotone" dataKey="primary" name="Doanh thu thuần" stroke="#c39a55" fill="url(#revenue-fill)" strokeWidth={2.5} activeDot={{ r: 4 }} isAnimationActive={false} />
          <Line yAxisId="orders" type="monotone" dataKey="secondary" name="Đơn hoàn tất" stroke="#4d9187" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 2.5, fill: "#11100e" }} activeDot={{ r: 4 }} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <figcaption><span>{data[0].label}</span><strong>Đỉnh {formatCompact(peakRevenue)} · {formatCompact(peakOrders)} đơn</strong><span>{data.at(-1)?.label}</span></figcaption>
    </figure>
  );
}
