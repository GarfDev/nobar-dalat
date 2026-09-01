import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatDecimal } from "../format";

type CorrelationRow = { lag: number; correlation: number | null; pairs: number };

export function CorrelationLagChart({ data }: { data: CorrelationRow[] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: item.lag === 0 ? "Cùng ngày" : `Sau ${item.lag} ngày`,
    strength: item.correlation === null ? null : Math.abs(item.correlation),
  }));
  const available = chartData.filter((item) => item.strength !== null);
  const values = available.map((item) => item.strength ?? 0);
  const spread = values.length ? Math.max(...values) - Math.min(...values) : null;

  return (
    <figure className="library-chart correlation-lag-chart" aria-label="So sánh mức liên hệ giữa tương tác Meta và doanh thu cùng ngày hoặc sau một đến ba ngày.">
      <div className="chart-heading">
        <div><p>So sánh thời điểm</p><h3>Có khoảng trễ nào khác biệt rõ không?</h3></div>
        <small>Thanh càng dài thì hai chỉ số càng hay tăng giảm cùng nhau.</small>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 52, bottom: 12, left: 8 }}>
          <CartesianGrid stroke="rgba(231,225,213,.1)" horizontal={false} />
          <XAxis type="number" domain={[0, 1]} ticks={[0, 0.5, 1]} tick={{ fill: "#777169", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(value) => value === 0 ? "Không thấy" : value === 1 ? "Rất rõ" : "Trung bình"} />
          <YAxis type="category" dataKey="label" tick={{ fill: "#e7e1d5", fontSize: 11 }} tickLine={false} axisLine={false} width={82} />
          <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} labelStyle={{ color: "#e7e1d5", marginBottom: 8 }} formatter={(value) => [`${formatDecimal(Number(value), 2)} · mức yếu`, "Mức liên hệ"]} />
          <Bar dataKey="strength" name="Mức liên hệ" radius={[0, 2, 2, 0]} maxBarSize={22} isAnimationActive={false} label={{ position: "right", fill: "#e7e1d5", fontSize: 11, formatter: (value: unknown) => formatDecimal(Number(value), 2) }}>
            {chartData.map((item) => <Cell key={item.lag} fill="#c39a55" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <figcaption>{spread === null ? "Chưa đủ dữ liệu để so sánh." : `Chênh lệch cao nhất chỉ ${formatDecimal(spread, 2)} điểm; chưa đủ để chọn một khoảng trễ.`}</figcaption>
    </figure>
  );
}
