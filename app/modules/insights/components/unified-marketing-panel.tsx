import { BarChart3, Clock3, MapPin, Search, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { TikTokTopPostSummary, UnifiedMarketingRow } from "../computed-metrics";
import { formatCompact, formatDate, formatDecimal, formatNumber, formatPercent } from "../format";
import type { MarketingPlatform, TikTokSnapshot } from "../types";

type UnifiedMarketingPanelProps = {
  rows: UnifiedMarketingRow[];
  tiktok: TikTokSnapshot;
  tiktokSummary: TikTokTopPostSummary;
  metaRangeLabel: string;
};

const platformMeta: Record<MarketingPlatform, { label: string; short: string; color: string }> = {
  instagram: { label: "Instagram", short: "IG", color: "#b64a3e" },
  facebook: { label: "Facebook", short: "FB", color: "#4d9187" },
  tiktok: { label: "TikTok", short: "TT", color: "#d6f6f1" },
};

function approximate(value: number, isApproximate: boolean) {
  return `${isApproximate ? "≈ " : ""}${formatCompact(value)}`;
}

function postBadge(id: string, summary: TikTokTopPostSummary) {
  const badges = [];
  if (summary.bestRetentionPostId === id) badges.push("Giữ người xem tốt nhất");
  if (summary.mostSavedPostId === id) badges.push("Được lưu nhiều nhất");
  if (summary.bestFollowerConversionPostId === id) badges.push("Tạo follower tốt nhất");
  return badges.join(" · ");
}

export function UnifiedMarketingPanel({ rows, tiktok, tiktokSummary, metaRangeLabel }: UnifiedMarketingPanelProps) {
  const chartRows = rows.map((row) => ({
    ...row,
    label: platformMeta[row.platform].label,
    color: platformMeta[row.platform].color,
  }));
  const strongest = chartRows
    .filter((row) => row.actionsPerThousandViews !== null)
    .sort((a, b) => (b.actionsPerThousandViews ?? 0) - (a.actionsPerThousandViews ?? 0))[0];

  return (
    <div className="unified-marketing">
      <header className="marketing-thesis">
        <div><Sparkles aria-hidden="true" /><span>Kết luận đa kênh</span></div>
        <h3>TikTok đang tạo phản ứng mạnh; Instagram giữ quy mô Meta; Facebook kéo người xem tới link tốt hơn.</h3>
        <p>Đọc từng kênh theo đúng vai trò. Chưa có mã nối sang hóa đơn nên đây là hiệu suất tạo chú ý và hành động, không phải doanh thu do marketing tạo ra.</p>
      </header>

      <div className="channel-ledger">
        {rows.map((row) => {
          const meta = platformMeta[row.platform];
          return (
            <article key={row.platform} className={`channel-row channel-${row.platform}`}>
              <div className="channel-identity"><span>{meta.short}</span><div><h3>{meta.label}</h3><small>{row.scope === "fixed-snapshot" ? "02.09.2025–01.09.2026" : metaRangeLabel}</small></div></div>
              <dl>
                <div><dt>Lượt xem</dt><dd>{approximate(row.views, row.approximate)}</dd></div>
                <div><dt>Hành động</dt><dd>{row.actions === null ? "—" : approximate(row.actions, row.approximate)}</dd></div>
                <div><dt>Trên 1.000 lượt xem</dt><dd>{formatDecimal(row.actionsPerThousandViews)}</dd></div>
              </dl>
              <p>{row.platform === "tiktok" ? "Like + bình luận + chia sẻ · số tổng được TikTok làm tròn" : "Tương tác do Meta cung cấp · theo khoảng ngày đang chọn"}</p>
            </article>
          );
        })}
      </div>

      <div className="marketing-chart-grid">
        <figure className="library-chart channel-efficiency-chart" aria-label="So sánh hành động tạo ra trên mỗi một nghìn lượt xem giữa Instagram, Facebook và TikTok.">
          <div className="chart-heading"><div><p>Hiệu suất chú ý</p><h3>1.000 lượt xem tạo ra bao nhiêu hành động?</h3></div><small>Đặt ba kênh về cùng mẫu số để nhìn hiệu suất thay vì chỉ nhìn quy mô.</small></div>
          <div className="chart-verdict"><BarChart3 aria-hidden="true" /><p><strong>{strongest?.label ?? "Chưa đủ dữ liệu"}</strong> đang có tỷ lệ hành động cao nhất trong dữ liệu hiện có.</p></div>
          <ResponsiveContainer width="100%" height={275}>
            <BarChart data={chartRows} margin={{ top: 18, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="rgba(231,225,213,.1)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#aaa399", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#777169", fontSize: 9 }} tickLine={false} axisLine={false} width={34} />
              <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} formatter={(value) => [`${formatDecimal(Number(value))} / 1.000 lượt xem`, "Hành động"]} />
              <Bar dataKey="actionsPerThousandViews" radius={[2, 2, 0, 0]} maxBarSize={62} isAnimationActive={false}>
                {chartRows.map((row) => <Cell key={row.platform} fill={row.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <figcaption>TikTok tính like + bình luận + chia sẻ; Meta dùng chỉ số tương tác của nền tảng. So sánh mang tính định hướng vì định nghĩa và kỳ dữ liệu khác nhau.</figcaption>
        </figure>

        <figure className="library-chart tiktok-discovery-chart" aria-label="Tỷ trọng nguồn tạo lượt xem TikTok trong 365 ngày.">
          <div className="chart-heading"><div><p>TikTok discovery</p><h3>Khách tìm thấy NObar từ đâu?</h3></div><small>Snapshot 365 ngày, cập nhật {formatDate(tiktok.updatedAt)}.</small></div>
          <div className="discovery-answer"><Search aria-hidden="true" /><div><strong>{formatPercent(tiktok.trafficSources.find((item) => item.source === "Tìm kiếm")?.share ?? null)} đến từ tìm kiếm</strong><p>Đã có nhu cầu chủ động, nhưng phần lớn lượt xem vẫn phụ thuộc đề xuất For You.</p></div></div>
          <div className="discovery-visual">
            <ResponsiveContainer width="48%" height={230}>
              <PieChart>
                <Pie data={tiktok.trafficSources} dataKey="share" nameKey="source" innerRadius={56} outerRadius={88} paddingAngle={2} stroke="none" isAnimationActive={false}>
                  {tiktok.trafficSources.map((item, index) => <Cell key={item.source} fill={["#d6f6f1", "#c39a55", "#b64a3e", "#4d9187"][index]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#171512", border: "1px solid rgba(231,225,213,.22)", borderRadius: 2, fontSize: 12 }} formatter={(value) => [formatPercent(Number(value)), "Tỷ trọng"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="discovery-legend">{tiktok.trafficSources.map((item, index) => <div key={item.source}><i style={{ background: ["#d6f6f1", "#c39a55", "#b64a3e", "#4d9187"][index] }} /><span>{item.source}</span><strong>{formatPercent(item.share)}</strong></div>)}</div>
          </div>
          <figcaption>For You giúp mở rộng tệp; Search và trang cá nhân phản ánh người xem có chủ đích hơn.</figcaption>
        </figure>
      </div>

      <section className="tiktok-content-ledger" aria-labelledby="tiktok-content-title">
        <header><div><span>TikTok · 3 video dẫn đầu</span><h3 id="tiktok-content-title">Video nào đáng học lại?</h3></div><p>Chỉ số tương tác chi tiết lấy trực tiếp từ từng video; lượt xem vẫn là số làm tròn của TikTok Studio.</p></header>
        <div className="tiktok-post-list">
          {tiktok.topPosts.map((post, index) => (
            <article key={post.id}>
              <div className="tiktok-post-rank"><span>{String(index + 1).padStart(2, "0")}</span><time>{formatDate(post.date)}</time></div>
              <div className="tiktok-post-copy"><h4>{post.label}</h4><small>{postBadge(post.id, tiktokSummary)}</small></div>
              <dl>
                <div><dt>Lượt xem</dt><dd>≈ {formatCompact(post.views)}</dd></div>
                <div><dt>Lưu / chia sẻ</dt><dd>{formatNumber(post.saves)} / {formatNumber(post.shares)}</dd></div>
                <div><dt>Xem TB / độ dài</dt><dd>{formatDecimal(post.averageWatchSeconds, 2)}s / {post.durationSeconds}s</dd></div>
                <div><dt>Xem hết</dt><dd>{formatPercent(post.completionRate)}</dd></div>
                <div><dt>Follower mới</dt><dd>{formatNumber(post.newFollowers)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="tiktok-action-note"><Clock3 aria-hidden="true" /><p><strong>Việc nên thử:</strong> giữ cách kể chuyện dài hơn của video 28.10.2025 để tăng follower, đồng thời học cấu trúc dễ lưu/chia sẻ của video 30.05.2026. Mục tiêu đầu tiên là cải thiện 2 giây mở đầu vì cả ba video đều mất nhiều người xem rất sớm.</p></div>
      </section>

      <aside className="google-review-slot">
        <MapPin aria-hidden="true" />
        <div><span>Nguồn tiếp theo</span><h3>Google Maps Reviews</h3><p>Đã xác định đúng địa điểm NObar. Đang chờ quyền Business Profile để thêm điểm review, review mới, tỷ lệ phản hồi và chủ đề khách khen/chê.</p></div>
        <strong>Chờ kết nối</strong>
      </aside>
    </div>
  );
}
