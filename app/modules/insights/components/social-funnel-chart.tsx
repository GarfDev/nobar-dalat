import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatCompact } from "../format";
import type { Platform } from "../types";

type FunnelDatum = { label: string; value: number | null };

export function SocialFunnelChart({ platform, data }: { platform: Platform; data: FunnelDatum[] }) {
  const chartData = data.map((item) => ({ ...item, value: item.value ?? 0 }));
  const color = platform === "instagram" ? "#b64a3e" : "#4d9187";
  return (
    <figure className={`library-chart social-funnel ${platform}`} aria-label={`Funnel ${platform}: ${data.map((item) => `${item.label} ${item.value ?? "không có"}`).join(", ")}`}>
      <header><span>{platform === "instagram" ? "IG" : "FB"}</span><div><p>{platform}</p><h3>Attention funnel</h3></div></header>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 2, right: 58, bottom: 2, left: 0 }}>
          <CartesianGrid stroke="rgba(231,225,213,.08)" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="label" width={70} tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(231,225,213,.035)" }} contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} formatter={(value) => [formatCompact(Number(value)), "Giá trị"]} />
          <Bar dataKey="value" fill={color} radius={[0, 2, 2, 0]} maxBarSize={12} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" formatter={(value) => formatCompact(Number(value))} fill="#e7e1d5" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <figcaption>Các tầng có thể khác độ phủ ngày; dùng để thấy độ rơi, không coi là cohort conversion.</figcaption>
    </figure>
  );
}
