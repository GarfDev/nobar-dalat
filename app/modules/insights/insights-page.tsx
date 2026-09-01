import { useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  CircleDollarSign,
  Database,
  Gauge,
  Megaphone,
  ReceiptText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { insightData } from "./data";
import { formatCompact, formatDate, formatDecimal, formatNumber, formatPercent, formatVND } from "./format";
import { correlationDecision, correlationLabel, roasLabel } from "./interpretation";
import { buildManagementFindings } from "./insight-rules";
import { buildDataReadiness, computeOperationalMetrics, computePlatformEfficiency } from "./computed-metrics";
import { buildReport, clampRange, laggedCorrelation, type MetricPoint } from "./reporting";
import { aggregateProductRanking } from "./product-ranking";
import type { DateRange, ISODate } from "./types";
import { KpiCard } from "./components/kpi-card";
import { DualTrendChart } from "./components/dual-trend-chart";
import { OrderValueScatter } from "./components/order-value-scatter";
import { SocialFunnelChart } from "./components/social-funnel-chart";
import { InsightsNavigation } from "./insights-navigation";
import { RangeControls, type ReportMode } from "./range-controls";

const COVERAGE: DateRange = { start: "2024-09-01", end: "2026-08-31" };
const DEFAULT_RANGE: DateRange = { start: "2026-06-03", end: "2026-08-31" };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const weekdayLabels = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

function readRange(params: URLSearchParams): DateRange {
  const start = params.get("from");
  const end = params.get("to");
  if (!start || !end || !DATE_PATTERN.test(start) || !DATE_PATTERN.test(end) || start > end) return DEFAULT_RANGE;
  return clampRange({ start: start as ISODate, end: end as ISODate }, COVERAGE);
}

function SectionTitle({ index, kicker, title, note }: { index: string; kicker: string; title: string; note?: string }) {
  return (
    <header className="section-title">
      <span className="section-number">{index}</span>
      <div><p>{kicker}</p><h2>{title}</h2>{note && <small>{note}</small>}</div>
    </header>
  );
}

function sourceTag(label: string) {
  return <span className="source-tag">{label}</span>;
}

export function InsightsPage() {
  const [params, setParams] = useSearchParams();
  const range = readRange(params);
  const mode: ReportMode = params.get("mode") === "preliminary" ? "preliminary" : "detailed";
  const report = buildReport(insightData, range);
  const findings = buildManagementFindings(report);

  const setRange = (nextRange: DateRange) => {
    const safe = clampRange(nextRange, COVERAGE);
    setParams((current) => {
      current.set("from", safe.start);
      current.set("to", safe.end);
      current.set("mode", mode);
      return current;
    });
  };
  const setMode = (nextMode: ReportMode) => {
    setParams((current) => {
      current.set("from", range.start);
      current.set("to", range.end);
      current.set("mode", nextMode);
      return current;
    });
  };

  const socialTotals = report.social.reduce(
    (totals, platform) => ({
      views: totals.views + (platform.views ?? 0),
      interactions: totals.interactions + (platform.interactions ?? 0),
      clicks: totals.clicks + (platform.linkClicks ?? 0),
    }),
    { views: 0, interactions: 0, clicks: 0 },
  );
  const selectedRevenueRows = insightData.revenue.filter(
    (row) => row.date >= range.start && row.date <= range.end,
  );
  const selectedSocialRows = insightData.social.filter(
    (row) => row.date >= range.start && row.date <= range.end,
  );
  const operating = computeOperationalMetrics(selectedRevenueRows);
  const platformEfficiency = {
    instagram: computePlatformEfficiency(selectedSocialRows, "instagram"),
    facebook: computePlatformEfficiency(selectedSocialRows, "facebook"),
  };
  const readiness = buildDataReadiness(insightData);
  const trendData = report.monthlyRevenue.map((item) => ({
    label: item.month,
    primary: item.netRevenue,
    secondary: item.orders,
  }));
  const orderValueScatter = selectedRevenueRows
    .filter((row) => row.orders > 0)
    .map((row) => {
      const weekday = new Date(`${row.date}T00:00:00Z`).getUTCDay();
      return {
        date: row.date,
        orders: row.orders,
        averageOrderValue: row.netRevenue / row.orders,
        weekend: weekday === 0 || weekday >= 5,
      };
    });
  const bestDays = [...insightData.revenue]
    .filter((row) => row.date >= range.start && row.date <= range.end)
    .sort((a, b) => b.netRevenue - a.netRevenue)
    .slice(0, 5);
  const productRanking = aggregateProductRanking(report.products).slice(0, 10);
  const contentRanking = [...report.content].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  const dailyMarketing = new Map<string, number>();
  for (const row of insightData.social.filter((item) => item.date >= range.start && item.date <= range.end)) {
    dailyMarketing.set(row.date, (dailyMarketing.get(row.date) ?? 0) + (row.interactions ?? 0));
  }
  const marketingSeries: MetricPoint[] = [...dailyMarketing].map(([date, value]) => ({ date: date as ISODate, value }));
  const correlationRows = [0, 1, 2, 3].map((lag) => ({
    lag,
    ...laggedCorrelation(marketingSeries, report.dailyRevenue, lag),
  }));
  const strongest = correlationRows
    .filter((item) => item.correlation !== null)
    .sort((a, b) => Math.abs(b.correlation ?? 0) - Math.abs(a.correlation ?? 0))[0];
  const strongestLevel = !strongest || strongest.correlation === null
    ? null
    : Math.abs(strongest.correlation) < 0.2
      ? "rất yếu"
      : Math.abs(strongest.correlation) < 0.4
        ? "yếu"
        : Math.abs(strongest.correlation) < 0.7
          ? "đáng chú ý"
          : "mạnh";

  return (
    <main className="insights-page">
      <a className="skip-link" href="#overview">Bỏ qua đến nội dung báo cáo</a>
      <header className="insights-hero">
        <div className="hero-mark" aria-hidden="true"><span>NO</span><i /></div>
        <div className="hero-copy">
          <p className="eyebrow">Internal performance ledger · Snapshot 01.09.2026</p>
          <h1>Marketing<br /><em>&amp;</em> F&amp;B Insights</h1>
          <p className="hero-deck">Một trang đọc nhanh cho quản lý NObar: từ sự chú ý trên mạng xã hội đến đơn hoàn tất và doanh thu tại quầy.</p>
        </div>
        <div className="hero-period">
          <span>Kỳ báo cáo</span>
          <strong>{formatDate(range.start)}</strong>
          <i />
          <strong>{formatDate(range.end)}</strong>
          <small>Dữ liệu tĩnh · 2 năm</small>
        </div>
      </header>

      <RangeControls range={range} mode={mode} onRange={setRange} onMode={setMode} />

      <div className="insights-layout">
        <InsightsNavigation />
        <div className="report-body">
          <section id="overview" className="report-section overview-section">
            <SectionTitle index="01" kicker="Báo cáo sơ bộ" title="Tín hiệu chính của kỳ" note={report.comparisonComplete ? `So sánh với ${formatDate(report.comparisonRange.start)}–${formatDate(report.comparisonRange.end)}` : "Kỳ trước nằm ngoài độ phủ; không tính mức tăng trưởng."} />
            <div className="kpi-grid">
              <KpiCard eyebrow="Doanh thu thuần" value={formatVND(report.revenue.netRevenue)} delta={report.revenueGrowth} source="POSAPP" accent="brass" />
              <KpiCard eyebrow="Đơn hoàn tất" value={formatNumber(report.revenue.orders)} delta={report.orderGrowth} source="POSAPP" accent="teal" note="Chỉ số gần nhất với lượt bàn; không phải số khách hay vòng quay bàn." />
              <KpiCard eyebrow="Giá trị TB / đơn" value={formatVND(report.revenue.averageOrderValue)} source="POSAPP" accent="brass" />
              <KpiCard eyebrow="Tương tác social" value={formatCompact(socialTotals.interactions)} source="META" accent="red" note={`${formatCompact(socialTotals.views)} lượt xem có dữ liệu`} />
            </div>
            <div className="computed-block">
              <header><Gauge size={17} /><span>Computed decision metrics</span><small>Tính từ nguồn đã chuẩn hóa trong kỳ chọn</small></header>
              <div className="computed-grid">
                <article><span>Doanh thu / ngày mở cửa</span><strong>{formatVND(operating.revenuePerTradingDay)}</strong><small>Net revenue ÷ {operating.tradingDays} ngày có bán</small></article>
                <article><span>Đơn / ngày mở cửa</span><strong>{formatDecimal(operating.ordersPerTradingDay)}</strong><small>{formatNumber(report.revenue.orders)} đơn ÷ {operating.tradingDays} ngày có bán</small></article>
                <article><span>Tỷ lệ ngày hoạt động</span><strong>{formatPercent(operating.activeDayRate)}</strong><small>{operating.tradingDays}/{operating.calendarDays} ngày lịch</small></article>
                <article><span>Độ biến động doanh thu</span><strong>{formatPercent(operating.revenueCoefficientOfVariation)}</strong><small>CV trên ngày có bán · {operating.revenueCoefficientOfVariation !== null && operating.revenueCoefficientOfVariation < .5 ? "tương đối ổn định" : "cần theo dõi biến động"}</small></article>
                <article><span>Tỷ trọng T6–CN</span><strong>{formatPercent(operating.weekendRevenueShare)}</strong><small>Doanh thu cuối tuần ÷ doanh thu kỳ</small></article>
                <article><span>Giảm giá / đơn</span><strong>{formatVND(operating.discountPerOrder)}</strong><small>Tổng giảm giá ÷ đơn hoàn tất</small></article>
              </div>
            </div>
            <div className="executive-grid">
              <article className="summary-card">
                <span className="card-label"><Sparkles size={16} /> Tóm tắt điều hành</span>
                <p>Trong kỳ, NObar ghi nhận <strong>{formatNumber(report.revenue.orders)} đơn hoàn tất</strong>, tạo ra <strong>{formatVND(report.revenue.netRevenue)}</strong>. Mỗi đơn trung bình đạt <strong>{formatVND(report.revenue.averageOrderValue)}</strong>.</p>
                <p>Meta ghi nhận <strong>{formatCompact(socialTotals.interactions)} tương tác</strong> và <strong>{formatCompact(socialTotals.clicks)} lượt nhấp liên kết</strong>. Hai nguồn chưa có mã quy thuộc chung, vì vậy chưa thể kết luận marketing tạo ra bao nhiêu đơn.</p>
              </article>
              <div className="alert-stack">
                {findings.slice(0, 2).map((finding) => <article key={finding.code}><AlertTriangle /><div><strong>{finding.summary}</strong><p>{finding.action}</p></div></article>)}
                <article><BadgeInfo /><div><strong>“Lượt bàn” là số đơn</strong><p>4.278 đơn trong toàn kỳ sau đối chiếu; không phải số khách hay vòng quay bàn vật lý.</p></div></article>
              </div>
            </div>
          </section>

          <section id="revenue" className="report-section">
            <SectionTitle index="02" kicker="PosApp · vận hành" title="Doanh thu & đơn hàng" note="Doanh thu theo ngày thanh toán, múi giờ Asia/Ho_Chi_Minh" />
            <div className="section-toolbar">{sourceTag("POSAPP · 730 NGÀY")}<span>{report.revenue.days} ngày trong lựa chọn</span></div>
            <DualTrendChart data={trendData} />
            <div className="metric-strip">
              <div><span>Doanh thu gộp</span><strong>{formatVND(report.revenue.grossRevenue)}</strong></div>
              <ArrowRight aria-hidden="true" />
              <div><span>Giảm giá</span><strong>− {formatVND(report.revenue.discounts)}</strong></div>
              <ArrowRight aria-hidden="true" />
              <div><span>Doanh thu thuần</span><strong>{formatVND(report.revenue.netRevenue)}</strong></div>
              <div><span>Tỷ lệ giảm giá</span><strong>{formatPercent(report.revenue.discountRate)}</strong></div>
            </div>
            {mode === "detailed" && (
              <>
                <OrderValueScatter data={orderValueScatter} />
                <div className="two-column">
                  <div className="table-panel">
                    <h3>5 ngày doanh thu cao nhất</h3>
                    <div className="table-scroll"><table><thead><tr><th scope="col">Ngày</th><th scope="col">Đơn</th><th scope="col">Doanh thu thuần</th><th scope="col">TB / đơn</th></tr></thead><tbody>
                      {bestDays.map((row) => <tr key={row.date}><td>{formatDate(row.date)}</td><td>{formatNumber(row.orders)}</td><td>{formatVND(row.netRevenue)}</td><td>{formatVND(row.orders ? row.netRevenue / row.orders : null)}</td></tr>)}
                    </tbody></table></div>
                  </div>
                  <div className="weekday-panel">
                    <h3>Nhịp theo thứ</h3>
                    {report.weekdayRevenue.map((row) => {
                      const max = Math.max(...report.weekdayRevenue.map((day) => day.netRevenue), 1);
                      return <div className="bar-row" key={row.weekday}><span>{weekdayLabels[row.weekday]}</span><i style={{ width: `${(row.netRevenue / max) * 100}%` }} /><strong>{formatCompact(row.netRevenue)}</strong></div>;
                    })}
                  </div>
                </div>
              </>
            )}
          </section>

          <section id="products" className="report-section">
            <SectionTitle index="03" kicker="Menu intelligence" title="Hiệu suất sản phẩm" note="Nguồn chỉ có ba kỳ tổng hợp; không nội suy cho khoảng ngày lẻ" />
            {!report.productCoverageExact || productRanking.length === 0 ? (
              <div className="missing-panel"><Database /><div><h3>Khoảng chọn chưa khớp kỳ sản phẩm</h3><p>Chọn Năm 2026, 12 tháng phù hợp một phần, hoặc Toàn bộ để xem bảng xếp hạng chính xác. PosApp cung cấp sản phẩm theo Sep–Dec 2024, năm 2025 và Jan–Aug 2026.</p></div></div>
            ) : (
              <div className="ranking-list">
                {productRanking.map((item, index) => <div key={item.product}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.product}</strong><i><b style={{ width: `${(item.revenue / productRanking[0].revenue) * 100}%` }} /></i><small>{formatNumber(item.quantity)} món</small><em>{formatVND(item.revenue)}</em></div>)}
              </div>
            )}
          </section>

          <section id="marketing" className="report-section">
            <SectionTitle index="04" kicker="Meta · organic" title="Sức khỏe mạng xã hội" note="Không cộng Facebook viewers với Instagram reach thành một chỉ số khán giả duy nhất" />
            <div className="platform-grid">
              {report.social.map((platform) => {
                const efficiency = platformEfficiency[platform.platform];
                return <article key={platform.platform} className={`platform-card ${platform.platform}`}>
                <div className="platform-heading"><span>{platform.platform === "instagram" ? "IG" : "FB"}</span><div><p>{platform.platform}</p><h3>{formatCompact(platform.views)} lượt xem</h3></div></div>
                <dl>
                  <div><dt>{platform.platform === "instagram" ? "Reach theo ngày" : "Viewers theo ngày"}</dt><dd>{formatCompact(platform.audience)}</dd></div>
                  <div><dt>Tương tác</dt><dd>{formatCompact(platform.interactions)}</dd></div>
                  <div><dt>Nhấp link</dt><dd>{formatCompact(platform.linkClicks)}</dd></div>
                  <div><dt>Theo dõi mới</dt><dd>{formatCompact(platform.follows)}</dd></div>
                  <div><dt>Lượt thăm</dt><dd>{platform.visits === null ? "Không có" : formatCompact(platform.visits)}</dd></div>
                  <div><dt>Interaction / view</dt><dd>{formatPercent(efficiency.engagementRate)}</dd></div>
                  <div><dt>Click-through / view</dt><dd>{formatPercent(efficiency.clickThroughRate)}</dd></div>
                  <div><dt>Follow / 1.000 views</dt><dd>{formatDecimal(efficiency.followPerThousandViews)}</dd></div>
                  <div><dt>Mẫu so sánh được</dt><dd>{formatNumber(efficiency.comparableDays)} ngày</dd></div>
                </dl>
              </article>})}
            </div>
            <div className="social-funnel-grid">
              {report.social.map((platform) => <SocialFunnelChart key={platform.platform} platform={platform.platform} data={[
                { label: "Lượt xem", value: platform.views },
                { label: "Tương tác", value: platform.interactions },
                { label: "Nhấp link", value: platform.linkClicks },
                { label: "Theo dõi", value: platform.follows },
              ]} />)}
            </div>
            <p className="footnote">Facebook views/viewers chỉ có từ 01.08.2025. Instagram visits không được nguồn cung cấp; follows chỉ có từ 27.08.2025 đến 30.08.2026.</p>
          </section>

          {mode === "detailed" && <>
            <section id="content" className="report-section">
              <SectionTitle index="05" kicker="Creative performance" title="Nội dung nổi bật" note="Danh sách top 10 đã xác minh từ Meta, không phải toàn bộ bài đăng" />
              {contentRanking.length ? <div className="content-grid">{contentRanking.map((item, index) => <article key={item.id}>
                <div><span>#{index + 1} · {item.platform}</span><time>{formatDate(item.date)}</time></div>
                <h3>{item.label.replace(/\s+/g, " ").slice(0, 112)}{item.label.length > 112 ? "…" : ""}</h3>
                <dl><div><dt>Lượt xem</dt><dd>{formatNumber(item.views)}</dd></div><div><dt>Tương tác</dt><dd>{formatNumber(item.interactions)}</dd></div><div><dt>Paid views</dt><dd>{formatNumber(item.paidViews)}</dd></div></dl>
                <footer><span>{item.format}</span>{item.paidViews && item.views ? <em>{formatPercent(item.paidViews / item.views)} paid</em> : <em>organic / chưa tách</em>}</footer>
              </article>)}</div> : <div className="empty-panel">Không có nội dung top đã xác minh trong khoảng này.</div>}
            </section>

            <section id="advertising" className="report-section">
              <SectionTitle index="06" kicker="Paid media" title="Quảng cáo & quy thuộc" note="ROAS chỉ hiển thị khi có doanh thu quy thuộc" />
              <div className="ad-summary"><CircleDollarSign /><div><span>Chi tiêu trong các chiến dịch giao khoảng chọn</span><strong>{formatVND(report.adSpend)}</strong></div><div><span>ROAS</span><strong>{roasLabel(report.advertising.some((item) => item.attributedRevenue !== null) ? 0 : null)}</strong></div></div>
              <div className="table-panel"><div className="table-scroll"><table><thead><tr><th scope="col">Chiến dịch</th><th scope="col">Kỳ</th><th scope="col">Chi tiêu</th><th scope="col">Kết quả</th><th scope="col">Trạng thái</th></tr></thead><tbody>
                {report.advertising.map((item) => <tr key={item.id}><td>{item.label}</td><td>{formatDate(item.startDate)}–{formatDate(item.endDate)}</td><td>{formatVND(item.spend)}</td><td>{formatNumber(item.results)} {item.resultType ?? ""}</td><td><span className={item.deliveryStatus.toLowerCase().includes("not") ? "status-bad" : "status-good"}>{item.deliveryStatus}</span></td></tr>)}
              </tbody></table></div></div>
              {!report.advertising.length && <div className="empty-panel">Không có chiến dịch giao khoảng ngày đã chọn.</div>}
            </section>

            <section id="relationship" className="report-section">
              <SectionTitle index="07" kicker="Câu hỏi kinh doanh" title="Tương tác Meta có đi cùng doanh thu?" note="So sánh lượng tương tác mỗi ngày với doanh thu cùng ngày và 1–3 ngày sau" />
              <article className="relationship-summary">
                <span>Kết luận ngắn</span>
                <h3>{correlationDecision(strongest?.correlation ?? null)}</h3>
                <p>{strongest ? `Tín hiệu cao nhất xuất hiện ${strongest.lag === 0 ? "ngay trong ngày" : `sau ${strongest.lag} ngày`}, ở mức ${strongestLevel} (r = ${strongest.correlation?.toFixed(2)}).` : "Khoảng chọn chưa có đủ ngày để thực hiện phép so sánh."}</p>
              </article>
              <div className="correlation-grid">
                {correlationRows.map((item) => <article key={item.lag}><span>{item.lag === 0 ? "Cùng ngày" : `Sau ${item.lag} ngày`}</span><small className="correlation-code">Mức liên hệ (r)</small><strong>{item.correlation === null ? "—" : item.correlation.toFixed(2)}</strong><p>{correlationLabel(item.correlation)}</p><small>Dựa trên {formatNumber(item.pairs)} ngày có đủ dữ liệu</small></article>)}
              </div>
              <div className="interpretation-panel"><BadgeInfo /><div><strong>Cách đọc “hệ số r”</strong><p>Con số này chạy từ −1 đến +1. Càng gần 0 thì hai chỉ số càng ít đi cùng nhau; càng gần 1 hoặc −1 thì mối liên hệ càng rõ. <strong>Đây không phải bằng chứng rằng marketing làm doanh thu tăng hoặc giảm.</strong></p></div></div>
            </section>
          </>}

          <section id="actions" className="report-section action-section">
            <SectionTitle index={mode === "detailed" ? "08" : "05"} kicker="Management playbook" title="Kế hoạch 30 / 60 / 90 ngày" />
            <div className="action-grid">
              <article><span>30</span><small>ngày</small><h3>Sửa nền đo lường</h3><ul><li>Xử lý cảnh báo thanh toán Meta và xác nhận phân phối.</li><li>Nhập giá vốn món để mở báo cáo lợi nhuận.</li><li>Gắn mã ưu đãi / UTM với đơn PosApp.</li></ul></article>
              <article><span>60</span><small>ngày</small><h3>Lặp lại tín hiệu tốt</h3><ul><li>Thử lại reel/carousel có nhiều lượt lưu và chia sẻ.</li><li>Chạy ưu đãi có mã riêng theo nội dung.</li><li>So sánh phản hồi theo thứ và khung giờ.</li></ul></article>
              <article><span>90</span><small>ngày</small><h3>Ra quyết định ngân sách</h3><ul><li>Đánh giá marketing-to-order khi đủ dữ liệu quy thuộc.</li><li>Tối ưu menu theo doanh thu, số lượng và biên gộp.</li><li>Chỉ đặt quy tắc ngân sách khi ROAS đáng tin cậy.</li></ul></article>
            </div>
          </section>

          <section id="data-notes" className="report-section data-notes">
            <SectionTitle index={mode === "detailed" ? "09" : "06"} kicker="Data readiness audit" title="Chúng ta đang thiếu dữ liệu gì?" note="Điểm readiness đo khả năng ra quyết định, không đánh giá hiệu suất đội ngũ" />
            <div className="readiness-hero">
              <div className="readiness-score"><span>{readiness.score}</span><small>/100</small></div>
              <div className="readiness-copy"><p>Khả năng đo lường hiện tại</p><h3>Đủ nhìn xu hướng, chưa đủ quản trị lợi nhuận và tăng trưởng.</h3><p>Nguồn hiện có trả lời tốt “đã bán bao nhiêu”, nhưng chưa trả lời đáng tin cậy “lãi bao nhiêu”, “marketing tạo ra đơn nào”, “mỗi bàn/khách hiệu quả ra sao”.</p></div>
              <div className="readiness-legend"><span><i className="ready" /> Sẵn sàng {readiness.readyWeight}%</span><span><i className="partial" /> Một phần {readiness.partialWeight}%</span><span><i className="missing" /> Thiếu {readiness.missingWeight}%</span></div>
            </div>
            <div className="readiness-list">
              {readiness.dimensions.map((dimension, index) => <article key={dimension.code}>
                <div className="readiness-rank">{String(index + 1).padStart(2, "0")}</div>
                <div className="readiness-main"><div><h3>{dimension.label}</h3><span className={`readiness-status ${dimension.status}`}>{dimension.status === "ready" ? "Sẵn sàng" : dimension.status === "partial" ? "Một phần" : "Đang thiếu"}</span><span className={`priority-${dimension.priority}`}>{dimension.priority}</span></div><p>{dimension.impact}</p><small><strong>Cần thu:</strong> {dimension.missingFields.length ? dimension.missingFields.join(" · ") : "Không bổ sung trường mới"}</small></div>
                <div className="readiness-action"><p>{dimension.collectionPlan}</p><small>{dimension.owner} · {dimension.cadence}</small></div>
              </article>)}
            </div>
            <div className="collection-priority">
              <ShieldAlert />
              <div><span>Ba việc nên làm trước</span><ol><li>Chuẩn hóa recipe + giá vốn nguyên liệu theo món.</li><li>Bắt buộc table ID, số khách, giờ mở/đóng và nguồn đơn.</li><li>Nối campaign/content → UTM hoặc promo code → order ID.</li></ol></div>
            </div>
            <div className="notes-grid"><div><ReceiptText /><h3>PosApp</h3><p>01.09.2024–31.08.2026 · 730 ngày lịch · 668 ngày bán · 4.278 đơn sau đối chiếu.</p></div><div><Megaphone /><h3>Meta</h3><p>Facebook và Instagram theo múi giờ báo cáo nền tảng; độ phủ từng metric khác nhau.</p></div><div><Database /><h3>Thiếu dữ liệu</h3><p>Giá vốn, lợi nhuận, biên gộp, doanh thu quy thuộc, ROAS, khách duy nhất và vòng quay bàn.</p></div></div>
            <details><summary>Xem toàn bộ ghi chú nguồn</summary><ul>{insightData.quality.notes.map((note) => <li key={note}>{note}</li>)}</ul></details>
            <p className="snapshot-stamp">STATIC SNAPSHOT · GENERATED {insightData.quality.generatedAt} · RANGE {COVERAGE.start}—{COVERAGE.end}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
