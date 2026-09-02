import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { SocialEfficiencyRow } from "../computed-metrics";
import { formatDecimal } from "../format";

function value(rows: SocialEfficiencyRow[], metric: string, platform: "instagram" | "facebook") {
  return rows.find((row) => row.metric === metric)?.[platform] ?? null;
}

function winner(instagram: number | null, facebook: number | null) {
  if (instagram === null || facebook === null) return "Chưa đủ dữ liệu";
  if (instagram === facebook) return "Hai nền tảng ngang nhau";
  return `${instagram > facebook ? "Instagram" : "Facebook"} tốt hơn`;
}

function comparison(instagram: number | null, facebook: number | null) {
  return `IG ${formatDecimal(instagram)} · FB ${formatDecimal(facebook)}`;
}

export function SocialEfficiencyChart({ data }: { data: SocialEfficiencyRow[] }) {
  const igInteraction = value(data, "Tương tác", "instagram");
  const fbInteraction = value(data, "Tương tác", "facebook");
  const igClicks = value(data, "Nhấp link", "instagram");
  const fbClicks = value(data, "Nhấp link", "facebook");
  const igFollows = value(data, "Theo dõi", "instagram");
  const fbFollows = value(data, "Theo dõi", "facebook");

  return (
    <figure className="library-chart social-efficiency-chart" aria-label="So sánh số tương tác, lượt nhấp liên kết và lượt theo dõi tạo ra trên mỗi một nghìn lượt xem của Instagram và Facebook.">
      <div className="chart-heading"><div><p>So sánh trên cùng mẫu số</p><h3>Mỗi 1.000 lượt xem tạo ra gì?</h3></div><small>Quy đổi về 1.000 lượt xem để tránh bị đánh lừa bởi quy mô khác nhau.</small></div>
      <div className="social-answer-grid">
        <article><span>Tạo tương tác</span><strong>{winner(igInteraction, fbInteraction)}</strong><small>{comparison(igInteraction, fbInteraction)} / 1.000 lượt xem</small></article>
        <article><span>Đưa người xem tới link</span><strong>{winner(igClicks, fbClicks)}</strong><small>{comparison(igClicks, fbClicks)} / 1.000 lượt xem</small></article>
        <article><span>Tạo người theo dõi mới</span><strong>{winner(igFollows, fbFollows)}</strong><small>{comparison(igFollows, fbFollows)} / 1.000 lượt xem</small></article>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 18, right: 8, bottom: 6, left: 0 }}>
          <CartesianGrid stroke="rgba(231,225,213,.1)" vertical={false} />
          <XAxis dataKey="metric" tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} width={34} tickFormatter={(metric) => formatDecimal(Number(metric), 0)} />
          <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} labelStyle={{ color: "#e7e1d5", marginBottom: 8 }} formatter={(metric, platform) => [`${formatDecimal(Number(metric))} / 1.000 lượt xem`, platform]} />
          <Legend iconSize={8} wrapperStyle={{ color: "#aaa399", fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="instagram" name="Instagram" fill="#b64a3e" radius={[2, 2, 0, 0]} maxBarSize={44} isAnimationActive={false} />
          <Bar dataKey="facebook" name="Facebook" fill="#4d9187" radius={[2, 2, 0, 0]} maxBarSize={44} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <figcaption>Tỷ lệ follow và view có thể không phủ cùng số ngày; dùng để định hướng thử nghiệm, chưa phải số chuyển đổi thành đơn hàng.</figcaption>
    </figure>
  );
}
