import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCompact, formatDecimal, formatPercent } from "../format";
import type { MonthlySocialPerformance, TikTokPostSignal } from "../marketing-analysis";

type MetricKey = "views" | "interactions" | "linkClicks" | "follows";

const metrics: Array<{ key: MetricKey; label: string; explanation: string }> = [
  { key: "views", label: "Lượt xem", explanation: "Quy mô nội dung được xem trong từng tháng" },
  { key: "interactions", label: "Tương tác", explanation: "Tổng hành động tương tác Meta ghi nhận" },
  { key: "linkClicks", label: "Nhấp link", explanation: "Tín hiệu người xem muốn tìm hiểu thêm hoặc ghé quán" },
  { key: "follows", label: "Follower mới", explanation: "Số lượt theo dõi mới, không phải tổng follower cuối tháng" },
];

function monthLabel(month: string) {
  const [year, value] = month.split("-");
  return `T${value}/${year.slice(2)}`;
}

function chartRows(rows: MonthlySocialPerformance[], metric: MetricKey) {
  const months = [...new Set(rows.map((row) => row.month))];
  return months.map((month) => {
    const instagram = rows.find((row) => row.month === month && row.platform === "instagram");
    const facebook = rows.find((row) => row.month === month && row.platform === "facebook");
    return {
      month,
      label: monthLabel(month),
      instagram: instagram?.complete[metric] ? instagram[metric] : null,
      facebook: facebook?.complete[metric] ? facebook[metric] : null,
    };
  });
}

export function MonthlyGrowthChart({ rows }: { rows: MonthlySocialPerformance[] }) {
  const [metric, setMetric] = useState<MetricKey>("views");
  const selected = metrics.find((item) => item.key === metric) ?? metrics[0];
  const data = chartRows(rows, metric);

  return (
    <figure className="marketing-chart marketing-growth-chart">
      <header className="marketing-chart-heading">
        <div><span>Tăng trưởng theo tháng</span><h2>{selected.label} đang đi lên hay đi xuống?</h2></div>
        <p>{selected.explanation}. Điểm bị ngắt nghĩa là nguồn không phủ đủ cả tháng.</p>
      </header>
      <div className="metric-tabs" role="group" aria-label="Chọn chỉ số theo dõi">
        {metrics.map((item) => (
          <button key={item.key} type="button" className={metric === item.key ? "is-active" : ""} aria-pressed={metric === item.key} onClick={() => setMetric(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 26, right: 18, bottom: 8, left: 6 }}>
          <CartesianGrid stroke="rgba(237,233,224,.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8f8a81", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#8f8a81", fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => formatCompact(Number(value))} />
          <Tooltip contentStyle={{ background: "#161715", border: "1px solid rgba(237,233,224,.2)", fontSize: 12 }} formatter={(value, name) => [formatCompact(Number(value)), name]} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: "#a7a198" }} />
          <Line connectNulls={false} type="monotone" dataKey="instagram" name="Instagram" stroke="#d66a59" strokeWidth={3} dot={{ r: 3, fill: "#111210", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          <Line connectNulls={false} type="monotone" dataKey="facebook" name="Facebook" stroke="#69aaa1" strokeWidth={3} dot={{ r: 3, fill: "#111210", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <figcaption>So sánh tháng liền trước chỉ xuất hiện khi cả hai tháng có đủ ngày dữ liệu cho chỉ số đang xem.</figcaption>
    </figure>
  );
}

export function EfficiencyTrendChart({ rows }: { rows: MonthlySocialPerformance[] }) {
  const data = [...new Set(rows.map((row) => row.month))].map((month) => {
    const instagram = rows.find((row) => row.month === month && row.platform === "instagram");
    const facebook = rows.find((row) => row.month === month && row.platform === "facebook");
    return {
      month,
      label: monthLabel(month),
      instagram: instagram?.complete.views && instagram.complete.interactions ? instagram.interactionPerThousandViews : null,
      facebook: facebook?.complete.views && facebook.complete.interactions ? facebook.interactionPerThousandViews : null,
    };
  });

  return (
    <figure className="marketing-chart efficiency-trend-chart">
      <header className="marketing-chart-heading">
        <div><span>Chất lượng lượt xem</span><h2>1.000 lượt xem tạo được bao nhiêu tương tác?</h2></div>
        <p>Nếu lượt xem tăng nhưng đường này giảm, nội dung đang mở rộng quy mô mà chưa giữ được chất lượng phản ứng.</p>
      </header>
      <ResponsiveContainer width="100%" height={310}>
        <LineChart data={data} margin={{ top: 24, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="rgba(237,233,224,.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#8f8a81", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#8f8a81", fontSize: 10 }} tickLine={false} axisLine={false} width={42} tickFormatter={(value) => formatDecimal(Number(value), 0)} />
          <Tooltip contentStyle={{ background: "#161715", border: "1px solid rgba(237,233,224,.2)", fontSize: 12 }} formatter={(value, name) => [`${formatDecimal(Number(value))} / 1.000`, name]} />
          <Line connectNulls={false} type="monotone" dataKey="instagram" name="Instagram" stroke="#d66a59" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line connectNulls={false} type="monotone" dataKey="facebook" name="Facebook" stroke="#69aaa1" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
      <figcaption>Đây là tỷ lệ tương tác trên lượt xem, không phải tỷ lệ người xem trở thành khách tại quán.</figcaption>
    </figure>
  );
}

export function TikTokPostSignalChart({ rows }: { rows: TikTokPostSignal[] }) {
  const data = rows.map(({ id, ...row }, index) => ({
    ...row,
    postId: id,
    name: `Video ${index + 1}`,
  }));

  return (
    <figure className="marketing-chart tiktok-signal-chart">
      <header className="marketing-chart-heading">
        <div><span>TikTok · 3 video có dữ liệu chi tiết</span><h2>Video tạo giá trị sau lượt xem</h2></div>
        <p>Quy đổi về 1.000 lượt xem để video nhiều view không tự động thắng.</p>
      </header>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 24, right: 12, bottom: 6, left: 0 }}>
          <CartesianGrid stroke="rgba(237,233,224,.09)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#a7a198", fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#8f8a81", fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
          <Tooltip contentStyle={{ background: "#161715", border: "1px solid rgba(237,233,224,.2)", fontSize: 12 }} formatter={(value, name) => [`${formatDecimal(Number(value))} / 1.000 lượt xem`, name]} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: "#a7a198" }} />
          <Bar dataKey="saveSharePerThousandViews" name="Lưu + chia sẻ" fill="#c7a05a" radius={[2, 2, 0, 0]} maxBarSize={46} isAnimationActive={false} />
          <Bar dataKey="followersPerThousandViews" name="Follower mới" fill="#d7f4ef" radius={[2, 2, 0, 0]} maxBarSize={46} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <div className="tiktok-chart-notes">
        {data.map((row) => <article key={row.postId}><strong>{row.name}</strong><span>{row.label}</span><small>Giữ người xem TB {formatPercent(row.averageRetentionRate)} · xem hết {formatPercent(row.completionRate)}</small></article>)}
      </div>
    </figure>
  );
}
