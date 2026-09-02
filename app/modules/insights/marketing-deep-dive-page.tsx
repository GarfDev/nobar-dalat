import { useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CircleAlert,
  Database,
  MousePointerClick,
  ScanSearch,
  Sparkles,
  Users,
} from "lucide-react";

import { cleanContentLabel } from "./content-label";
import { insightData, tiktokSnapshot } from "./data";
import { formatCompact, formatDate, formatDecimal, formatPercent } from "./format";
import {
  buildMonthlySocialPerformance,
  rankMetaContentOpportunities,
  summarizeMarketingMomentum,
  summarizeTikTokPostSignals,
  type MarketingMomentum,
  type MonthlySocialPerformance,
} from "./marketing-analysis";
import { clampRange } from "./reporting";
import type { DateRange, ISODate, Platform } from "./types";
import {
  EfficiencyTrendChart,
  MonthlyGrowthChart,
  TikTokPostSignalChart,
} from "./components/marketing-growth-charts";

const COVERAGE: DateRange = { start: "2024-09-01", end: "2026-08-31" };
const DEFAULT_RANGE: DateRange = { start: "2025-09-01", end: "2026-08-31" };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRESETS = [
  { label: "6 tháng", range: { start: "2026-03-01", end: "2026-08-31" } as DateRange },
  { label: "12 tháng", range: DEFAULT_RANGE },
  { label: "24 tháng", range: COVERAGE },
];

function readRange(params: URLSearchParams): DateRange {
  const start = params.get("from");
  const end = params.get("to");
  if (!start || !end || !DATE_PATTERN.test(start) || !DATE_PATTERN.test(end) || start > end) return DEFAULT_RANGE;
  return clampRange({ start: start as ISODate, end: end as ISODate }, COVERAGE);
}

function monthLabel(month: string | null) {
  if (!month) return "Chưa đủ dữ liệu";
  const [year, value] = month.split("-");
  return `tháng ${Number(value)}/${year}`;
}

function growthLabel(value: number | null) {
  if (value === null) return "Chưa so sánh được";
  if (Math.abs(value) < 0.0005) return "Không đổi";
  return `${value > 0 ? "+" : "−"}${formatPercent(Math.abs(value))}`;
}

function growthClass(value: number | null) {
  if (value === null) return "is-missing";
  return value >= 0 ? "is-positive" : "is-negative";
}

function platformVerdict(momentum: MarketingMomentum) {
  const views = momentum.latestViewGrowth;
  const interactions = momentum.latestInteractionGrowth;
  if (views === null || interactions === null) return "Chưa đủ hai tháng liền nhau có dữ liệu hoàn chỉnh để kết luận xu hướng.";
  if (views > 0 && interactions < 0) return "Lượt xem tăng nhưng tương tác giảm: quy mô đang mở rộng, chất lượng phản ứng đang yếu đi.";
  if (views < 0 && interactions > 0) return "Lượt xem giảm nhưng người còn lại tương tác tốt hơn: cần phục hồi phân phối mà không đổi chất nội dung.";
  if (views > 0 && interactions > 0) return "Cả lượt xem và tương tác cùng tăng: đây là tín hiệu tăng trưởng khỏe nhất trong tháng mới nhất.";
  return "Cả lượt xem và tương tác cùng giảm: cần xem lại nhịp đăng và nhóm nội dung đang phân phối.";
}

function latestRow(rows: MonthlySocialPerformance[], platform: Platform) {
  return rows.filter((row) => row.platform === platform).at(-1);
}

export function MarketingDeepDivePage() {
  const [params, setParams] = useSearchParams();
  const range = readRange(params);
  const monthly = buildMonthlySocialPerformance(insightData.social, range);
  const instagramMomentum = summarizeMarketingMomentum(monthly, "instagram");
  const facebookMomentum = summarizeMarketingMomentum(monthly, "facebook");
  const latestInstagram = latestRow(monthly, "instagram");
  const latestFacebook = latestRow(monthly, "facebook");
  const tiktokSignals = summarizeTikTokPostSignals(tiktokSnapshot.topPosts);
  const contentOpportunities = rankMetaContentOpportunities(
    insightData.content.filter((item) => item.date >= range.start && item.date <= range.end),
  ).slice(0, 5);
  const selectedSocial = insightData.social.filter((row) => row.date >= range.start && row.date <= range.end);
  const sum = (field: "views" | "interactions" | "linkClicks" | "follows") =>
    selectedSocial.reduce((total, row) => total + (row[field] ?? 0), 0);
  const totals = {
    views: sum("views"),
    interactions: sum("interactions"),
    clicks: sum("linkClicks"),
    follows: sum("follows"),
  };

  const setRange = (next: DateRange) => {
    const safe = clampRange(next, COVERAGE);
    setParams({ from: safe.start, to: safe.end });
  };

  const collectionPlan = [
    {
      priority: "Làm ngay",
      source: "Meta + TikTok",
      title: "Chụp tổng follower cuối mỗi tháng",
      fields: "Ngày chốt, kênh, tổng follower, follower mới, unfollow",
      answer: "Biết quy mô cộng đồng thực sự tăng bao nhiêu, thay vì chỉ cộng lượt follow mới.",
      cadence: "Ngày cuối tháng",
    },
    {
      priority: "Làm ngay",
      source: "TikTok Studio",
      title: "Xuất số liệu từng ngày và từng video",
      fields: "Video ID, ngày đăng, view, like, comment, share, save, watch time, follower mới",
      answer: "Vẽ được tăng trưởng TikTok theo tháng và biết format nào giữ người xem.",
      cadence: "Mỗi tháng",
    },
    {
      priority: "Tiếp theo",
      source: "Instagram + Facebook",
      title: "Lưu toàn bộ nội dung, không chỉ top 10",
      fields: "Content ID, format, organic/paid view, reach, comment, share, save, click, follow",
      answer: "So sánh công bằng nội dung organic với nội dung được chạy quảng cáo.",
      cadence: "Hàng tuần",
    },
    {
      priority: "Tiếp theo",
      source: "Inbox + cộng đồng",
      title: "Ghi nhận comment, story tag, repost và tin nhắn",
      fields: "Loại hành động, content ID, chủ đề, phản hồi, thời gian trả lời",
      answer: "Biết nội dung nào tạo hội thoại, UGC và ý định đặt bàn thật.",
      cadence: "Hàng tuần",
    },
    {
      priority: "Quan trọng",
      source: "PosApp + chiến dịch",
      title: "Gắn mã chiến dịch vào hóa đơn",
      fields: "Order ID, campaign/content ID, mã QR hoặc ưu đãi, doanh thu thuần",
      answer: "Biết marketing mang về bao nhiêu đơn và doanh thu; lúc đó mới tính được ROAS.",
      cadence: "Mỗi đơn",
    },
    {
      priority: "Bổ sung",
      source: "Google Business Profile",
      title: "Lưu lịch sử review và phản hồi",
      fields: "Ngày review, số sao, nội dung, chủ đề, đã phản hồi, thời gian phản hồi",
      answer: "Theo dõi danh tiếng địa điểm và vấn đề trải nghiệm khách nhắc lại nhiều lần.",
      cadence: "Hàng tuần",
    },
  ];

  return (
    <main className="marketing-deep-dive">
      <a className="marketing-skip" href="#monthly-growth">Đi tới biểu đồ tăng trưởng</a>
      <header className="marketing-hero">
        <nav aria-label="Điều hướng báo cáo">
          <a href={`/insights?from=${range.start}&to=${range.end}&mode=detailed`}><ArrowLeft /> Dashboard tổng</a>
          <span>NObar · Marketing room</span>
        </nav>
        <div className="marketing-hero-grid">
          <div>
            <p className="marketing-eyebrow">Marketing deep dive · {formatDate(range.start)}–{formatDate(range.end)}</p>
            <h1>Marketing đang<br /><em>tăng ở đâu?</em></h1>
          </div>
          <div className="marketing-hero-copy">
            <p>Tách riêng ba câu hỏi: có thêm người xem không, người xem có hành động không, và hành động đó đã nối được tới lượt ghé quán chưa.</p>
            <strong>Hiện trả lời tốt 2/3 câu hỏi.</strong>
          </div>
        </div>
      </header>

      <div className="marketing-controls" aria-label="Chọn khoảng phân tích">
        <div>{PRESETS.map((preset) => <button type="button" key={preset.label} className={preset.range.start === range.start && preset.range.end === range.end ? "is-active" : ""} onClick={() => setRange(preset.range)}>{preset.label}</button>)}</div>
        <div className="marketing-date-fields">
          <label>Từ<input type="date" min={COVERAGE.start} max={range.end} value={range.start} onChange={(event) => setRange({ ...range, start: event.target.value as ISODate })} /></label>
          <label>Đến<input type="date" min={range.start} max={COVERAGE.end} value={range.end} onChange={(event) => setRange({ ...range, end: event.target.value as ISODate })} /></label>
        </div>
      </div>

      <section className="marketing-answer" aria-labelledby="answer-title">
        <div className="answer-mark"><Sparkles /><span>Kết luận hiện tại</span></div>
        <div><h2 id="answer-title">Meta có dữ liệu tăng trưởng theo tháng. TikTok chưa có lịch sử tháng.</h2><p>Instagram và Facebook đủ để theo dõi lượt xem, tương tác và nhấp link. TikTok hiện chỉ cho biết tổng 365 ngày và 3 video nổi bật, nên chưa thể nói tháng nào TikTok tăng hay giảm.</p></div>
      </section>

      <section className="channel-momentum" aria-label="Tình hình mới nhất theo kênh">
        {[
          { name: "Instagram", momentum: instagramMomentum, latest: latestInstagram, className: "instagram" },
          { name: "Facebook", momentum: facebookMomentum, latest: latestFacebook, className: "facebook" },
        ].map(({ name, momentum, latest, className }) => (
          <article key={name} className={className}>
            <header><span>{name}</span><small>Tháng mới nhất: {monthLabel(momentum.latestMonth)}</small></header>
            <div className="momentum-numbers">
              <div><span>Lượt xem</span><strong>{formatCompact(latest?.views ?? null)}</strong><em className={growthClass(momentum.latestViewGrowth)}>{growthLabel(momentum.latestViewGrowth)} so với tháng trước</em></div>
              <div><span>Tương tác</span><strong>{formatCompact(latest?.interactions ?? null)}</strong><em className={growthClass(momentum.latestInteractionGrowth)}>{growthLabel(momentum.latestInteractionGrowth)} so với tháng trước</em></div>
            </div>
            <p>{platformVerdict(momentum)}</p>
            <footer>Đỉnh lượt xem: {monthLabel(momentum.strongestViewMonth)} · Đỉnh tương tác: {monthLabel(momentum.strongestInteractionMonth)}</footer>
          </article>
        ))}
      </section>

      <section className="signal-runway" aria-labelledby="runway-title">
        <header><span>Đường đi từ nội dung tới doanh thu</span><h2 id="runway-title">Đang đo được tới đâu?</h2></header>
        <div className="runway-track">
          <article><BarChart3 /><span>Được xem</span><strong>{formatCompact(totals.views)}</strong><small>Có dữ liệu theo ngày</small></article>
          <article><Sparkles /><span>Có phản ứng</span><strong>{formatCompact(totals.interactions)}</strong><small>{formatDecimal(totals.views ? totals.interactions * 1_000 / totals.views : null)} / 1.000 view</small></article>
          <article><MousePointerClick /><span>Tìm hiểu thêm</span><strong>{formatCompact(totals.clicks)}</strong><small>Nhấp link Meta</small></article>
          <article><Users /><span>Theo dõi mới</span><strong>{formatCompact(totals.follows)}</strong><small>Một phần kỳ có dữ liệu</small></article>
          <article className="is-gap"><CircleAlert /><span>Ghé quán / mua hàng</span><strong>Chưa nối</strong><small>Thiếu campaign ID trên hóa đơn</small></article>
        </div>
      </section>

      <section id="monthly-growth" className="marketing-section">
        <MonthlyGrowthChart rows={monthly} />
      </section>

      <section className="marketing-section chart-pair">
        <EfficiencyTrendChart rows={monthly} />
        <aside className="reading-guide">
          <ScanSearch />
          <span>Cách đọc hai chart</span>
          <h2>Tăng quy mô chưa chắc là tăng chất lượng.</h2>
          <ol>
            <li><strong>Nhìn lượt xem:</strong> kênh có được phân phối rộng hơn không?</li>
            <li><strong>Nhìn tương tác / 1.000 view:</strong> lượng người xem mới có phản ứng không?</li>
            <li><strong>Nhìn nhấp link và follow:</strong> có dấu hiệu muốn tìm hiểu thêm không?</li>
          </ol>
          <p>Không dùng các chart này để kết luận doanh thu tăng nhờ social; dữ liệu hiện chưa nối tới hóa đơn.</p>
        </aside>
      </section>

      <section className="marketing-section content-opportunity">
        <header className="section-copy"><span>Meta · mẫu 10 nội dung nổi bật</span><h2>Nội dung nào tạo hành động có giá trị?</h2><p>Xếp theo lượt lưu + chia sẻ + follower mới trên 1.000 lượt xem, thay vì xếp theo view thô.</p></header>
        <div className="content-opportunity-list">
          {contentOpportunities.map((item, index) => (
            <article key={item.id}>
              <span className="content-rank">{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.platform} · {item.format} · {formatDate(item.date)}</small><h3>{cleanContentLabel(item.label).slice(0, 110)}</h3></div>
              <dl><div><dt>Hành động giá trị / 1.000 view</dt><dd>{formatDecimal(item.intentPerThousandViews)}</dd></div><div><dt>Lượt xem</dt><dd>{formatCompact(item.views)}</dd></div><div><dt>Tỷ trọng paid view</dt><dd>{item.paidViewShare === null ? "Chưa tách" : formatPercent(item.paidViewShare)}</dd></div></dl>
            </article>
          ))}
        </div>
        <p className="sample-warning">Đây chỉ là mẫu 10 bài nổi bật đã thu thập, không đại diện cho toàn bộ nội dung đã đăng.</p>
      </section>

      <section className="marketing-section tiktok-deep-dive">
        <div className="tiktok-context">
          <span>TikTok · snapshot 365 ngày</span>
          <h2>280,7 nghìn lượt xem, nhưng chưa có đường tăng trưởng theo tháng.</h2>
          <p>{formatPercent(tiktokSnapshot.trafficSources.find((item) => item.source === "For You")?.share ?? null)} lượt xem đến từ For You; {formatPercent(tiktokSnapshot.trafficSources.find((item) => item.source === "Tìm kiếm")?.share ?? null)} đến từ tìm kiếm. Điều này cho thấy TikTok vừa tạo khám phá, vừa bắt được một phần nhu cầu chủ động.</p>
          <div><strong>{formatCompact(tiktokSnapshot.totals.profileViews)}</strong><span>lượt xem trang cá nhân</span></div>
        </div>
        <TikTokPostSignalChart rows={tiktokSignals} />
      </section>

      <section className="marketing-section collection-section" id="collect-next">
        <header className="section-copy"><span>Kế hoạch thu hoạch dữ liệu</span><h2>Thu thêm gì để dashboard trả lời được câu hỏi khó hơn?</h2><p>Mỗi dòng dưới đây gắn trực tiếp với một quyết định marketing, không thu thập chỉ để “có nhiều data”.</p></header>
        <div className="collection-table" role="table" aria-label="Kế hoạch thu thập dữ liệu marketing">
          {collectionPlan.map((item, index) => (
            <article role="row" key={item.title}>
              <span className="collection-order">{String(index + 1).padStart(2, "0")}</span>
              <div className="collection-main"><small>{item.priority} · {item.source}</small><h3>{item.title}</h3><p>{item.answer}</p></div>
              <div className="collection-fields"><span>Cần lưu</span><p>{item.fields}</p></div>
              <strong>{item.cadence}</strong>
            </article>
          ))}
        </div>
      </section>

      <footer className="marketing-footer">
        <Database /><div><strong>Phạm vi kết luận</strong><p>Meta có dữ liệu ngày trong tối đa 24 tháng, nhưng một số trường bắt đầu muộn hơn. TikTok là snapshot 02.09.2025–01.09.2026. Google Reviews và dữ liệu quy thuộc hóa đơn chưa có trong bộ dữ liệu hiện tại.</p></div>
        <a href="#monthly-growth">Xem lại tăng trưởng <ArrowUpRight /></a>
      </footer>
    </main>
  );
}
