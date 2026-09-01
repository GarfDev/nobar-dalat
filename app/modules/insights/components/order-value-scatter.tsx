import { CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

import { median } from "../chart-model";
import { formatCompact, formatDate, formatNumber, formatVND } from "../format";
import type { ISODate } from "../types";

type ScatterDatum = { date: ISODate; orders: number; averageOrderValue: number; weekend: boolean };
type ScatterTooltipProps = { active?: boolean; payload?: Array<{ payload: ScatterDatum }> };

function ScatterTooltip({ active, payload }: ScatterTooltipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item) return null;
  return <div className="chart-tooltip"><strong>{formatDate(item.date)}</strong><span>{formatNumber(item.orders)} đơn</span><span>{formatVND(item.averageOrderValue)} / đơn</span></div>;
}

export function OrderValueScatter({ data }: { data: ScatterDatum[] }) {
  if (data.length < 2) return <div className="empty-panel">Chưa đủ ngày có đơn để dựng biểu đồ.</div>;
  const medianOrders = median(data.map((item) => item.orders)) ?? 0;
  const medianAov = median(data.map((item) => item.averageOrderValue)) ?? 0;
  const weekdays = data.filter((item) => !item.weekend);
  const weekends = data.filter((item) => item.weekend);

  return (
    <figure className="library-chart scatter-chart" aria-label={`Phân bố ${data.length} ngày bán theo số đơn và giá trị trung bình mỗi đơn.`}>
      <div className="chart-heading"><div><p>Demand × ticket size</p><h3>Đơn mỗi ngày vs giá trị đơn</h3></div><small>Đường đứt là trung vị kỳ chọn.</small></div>
      <ResponsiveContainer width="100%" height={360}>
        <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 6 }}>
          <CartesianGrid stroke="rgba(231,225,213,.1)" strokeDasharray="3 5" />
          <XAxis type="number" dataKey="orders" name="Số đơn" tick={{ fill: "#aaa399", fontSize: 10 }} tickFormatter={formatNumber} tickLine={false} axisLine={false} label={{ value: "Số đơn / ngày", position: "insideBottom", offset: -8, fill: "#777169", fontSize: 10 }} />
          <YAxis type="number" dataKey="averageOrderValue" name="Giá trị đơn" tick={{ fill: "#aaa399", fontSize: 10 }} tickFormatter={formatCompact} tickLine={false} axisLine={false} width={54} />
          <ZAxis range={[24, 24]} />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 4", stroke: "rgba(231,225,213,.3)" }} />
          <Legend iconSize={8} wrapperStyle={{ color: "#aaa399", fontSize: 11, paddingTop: 8 }} />
          <ReferenceLine x={medianOrders} stroke="rgba(231,225,213,.28)" strokeDasharray="5 5" />
          <ReferenceLine y={medianAov} stroke="rgba(231,225,213,.28)" strokeDasharray="5 5" />
          <Scatter name="Ngày thường" data={weekdays} fill="#4d9187" fillOpacity={0.62} isAnimationActive={false} />
          <Scatter name="Cuối tuần" data={weekends} fill="#c39a55" fillOpacity={0.62} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
      <figcaption><span>Trục ngang: số đơn/ngày</span><strong>Trục dọc: giá trị TB/đơn</strong></figcaption>
    </figure>
  );
}
