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

import { insightData, tiktokSnapshot } from "./data";
import { formatCompact, formatDate, formatDecimal, formatNumber, formatPercent, formatVND } from "./format";
import { correlationLagSummary, roasLabel } from "./interpretation";
import { buildManagementFindings } from "./insight-rules";
import { buildAttributionPlan, buildDataReadiness, buildUnifiedMarketingRows, computeCommunityQuality, computeOperationalMetrics, computePlatformEfficiency, computeWeekdayPerformance, summarizeTikTokTopPosts } from "./computed-metrics";
import { buildReport, clampRange, laggedCorrelation, type MetricPoint } from "./reporting";
import { aggregateProductRanking } from "./product-ranking";
import type { DateRange, ISODate } from "./types";
import { KpiCard } from "./components/kpi-card";
import { DualTrendChart } from "./components/dual-trend-chart";
import { WeekdayPerformanceChart } from "./components/weekday-performance-chart";
import { InsightsNavigation } from "./insights-navigation";
import { RangeControls, type ReportMode } from "./range-controls";
import { cleanContentLabel } from "./content-label";
import { CorrelationLagChart } from "./components/correlation-lag-chart";
import { CommunityQualityPanel } from "./components/community-quality-panel";
import { UnifiedMarketingPanel } from "./components/unified-marketing-panel";

const COVERAGE: DateRange = { start: "2024-09-01", end: "2026-08-31" };
const DEFAULT_RANGE: DateRange = { start: "2026-06-03", end: "2026-08-31" };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  const unifiedMarketingRows = buildUnifiedMarketingRows(
    report.social.map((platform) => {
      const engagementRate = platformEfficiency[platform.platform].engagementRate;
      return {
        ...platform,
        actionsPerThousandViews: engagementRate === null ? null : engagementRate * 1_000,
      };
    }),
    tiktokSnapshot,
  );
  const tiktokSummary = summarizeTikTokTopPosts(tiktokSnapshot.topPosts);
  const readiness = buildDataReadiness(insightData);
  const attributionPlan = buildAttributionPlan(insightData);
  const trendData = report.monthlyRevenue.map((item) => ({
    label: item.month,
    primary: item.netRevenue,
    secondary: item.orders,
  }));
  const weekdayPerformance = computeWeekdayPerformance(selectedRevenueRows);
  const bestDays = [...insightData.revenue]
    .filter((row) => row.date >= range.start && row.date <= range.end)
    .sort((a, b) => b.netRevenue - a.netRevenue)
    .slice(0, 5);
  const productRanking = aggregateProductRanking(report.products).slice(0, 10);
  const contentRanking = [...report.content]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .map((item) => ({ ...item, displayLabel: cleanContentLabel(item.label).replace(/\s+/g, " ") }));
  const communityQuality = computeCommunityQuality(report.content);
  const dailyMarketing = new Map<string, number>();
  for (const row of insightData.social.filter((item) => item.date >= range.start && item.date <= range.end)) {
    dailyMarketing.set(row.date, (dailyMarketing.get(row.date) ?? 0) + (row.interactions ?? 0));
  }
  const marketingSeries: MetricPoint[] = [...dailyMarketing].map(([date, value]) => ({ date: date as ISODate, value }));
  const correlationRows = [0, 1, 2, 3].map((lag) => ({
    lag,
    ...laggedCorrelation(marketingSeries, report.dailyRevenue, lag),
  }));
  const lagSummary = correlationLagSummary(correlationRows);

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
              <KpiCard eyebrow="Tương tác Meta" value={formatCompact(socialTotals.interactions)} source="META" accent="red" note={`${formatCompact(socialTotals.views)} lượt xem có dữ liệu`} />
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
                <WeekdayPerformanceChart data={weekdayPerformance} />
                <div className="table-panel top-days-table">
                  <h3>5 ngày doanh thu cao nhất</h3>
                  <div className="table-scroll"><table><thead><tr><th scope="col">Ngày</th><th scope="col">Đơn</th><th scope="col">Doanh thu thuần</th><th scope="col">TB / đơn</th></tr></thead><tbody>
                    {bestDays.map((row) => <tr key={row.date}><td>{formatDate(row.date)}</td><td>{formatNumber(row.orders)}</td><td>{formatVND(row.netRevenue)}</td><td>{formatVND(row.orders ? row.netRevenue / row.orders : null)}</td></tr>)}
                  </tbody></table></div>
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
            <SectionTitle index="04" kicker="Tình hình marketing" title="Một bức tranh, ba kênh" note="Instagram + Facebook theo khoảng đang chọn · TikTok là snapshot 365 ngày gần nhất" />
            <UnifiedMarketingPanel
              rows={unifiedMarketingRows}
              tiktok={tiktokSnapshot}
              tiktokSummary={tiktokSummary}
              metaRangeLabel={`${formatDate(range.start)}–${formatDate(range.end)}`}
              marketingHref={`/insights/marketing?from=${range.start}&to=${range.end}`}
            />
          </section>

          {mode === "detailed" && <>
            <section id="content" className="report-section">
              <SectionTitle index="05" kicker="Creative performance" title="Nội dung nổi bật" note="Danh sách top 10 đã xác minh từ Meta, không phải toàn bộ bài đăng" />
              {contentRanking.length ? <div className="content-grid">{contentRanking.map((item, index) => <article key={item.id}>
                <div><span>#{index + 1} · {item.platform}</span><time>{formatDate(item.date)}</time></div>
                <h3>{item.displayLabel.slice(0, 112)}{item.displayLabel.length > 112 ? "…" : ""}</h3>
                <dl><div><dt>Lượt xem</dt><dd>{formatNumber(item.views)}</dd></div><div><dt>Tương tác</dt><dd>{formatNumber(item.interactions)}</dd></div><div><dt>Paid views</dt><dd>{formatNumber(item.paidViews)}</dd></div></dl>
                <footer><span>{item.format}</span>{item.paidViews && item.views ? <em>{formatPercent(item.paidViews / item.views)} paid</em> : <em>organic / chưa tách</em>}</footer>
              </article>)}</div> : <div className="empty-panel">Không có nội dung top đã xác minh trong khoảng này.</div>}
              <CommunityQualityPanel metrics={communityQuality} />
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
                <h3>{lagSummary.title}</h3>
                <p>{lagSummary.detail}</p>
              </article>
              <CorrelationLagChart data={correlationRows} />
              <div className="interpretation-panel"><BadgeInfo /><div><strong>Điều quan trọng cần nhớ</strong><p>Biểu đồ chỉ cho biết hai chỉ số có hay tăng giảm cùng nhau hay không. <strong>Nó không chứng minh marketing làm doanh thu tăng.</strong></p></div></div>
              <div className="attribution-playbook">
                <header className="attribution-heading">
                  <div>
                    <span>Cách có câu trả lời chính xác hơn</span>
                    <h3>Nối Meta → mã chiến dịch → hóa đơn PosApp</h3>
                    <p>Thay vì đoán từ hai đường số liệu theo ngày, hãy để mỗi hóa đơn mang theo dấu vết của chiến dịch đã đưa khách đến quán.</p>
                  </div>
                  <strong className={`attribution-status ${attributionPlan.status}`}>{attributionPlan.statusLabel}</strong>
                </header>

                <div className="attribution-phases">
                  {attributionPlan.phases.map((phase) => (
                    <article key={phase.code} className={phase.recommended ? "is-recommended" : undefined}>
                      <div className="phase-top">
                        <span>{phase.step}</span>
                        <small>{phase.timing}</small>
                      </div>
                      <h4>{phase.title}</h4>
                      <p>{phase.summary}</p>
                      <ul>{phase.actions.map((action) => <li key={action}>{action}</li>)}</ul>
                      <footer><strong>Kết quả:</strong> {phase.outcome}</footer>
                    </article>
                  ))}
                </div>

                <div className="attribution-fields">
                  <div className="attribution-fields-copy">
                    <span>Dữ liệu tối thiểu cần giữ</span>
                    <h4>6 trường để nối đúng chiến dịch với đúng hóa đơn</h4>
                    <p>Ưu tiên bốn trường đầu. Thông tin khách chỉ dùng khi khách đã đồng ý; không cần thu thông tin này để bắt đầu đo bằng mã chiến dịch.</p>
                  </div>
                  <div className="attribution-field-list">
                    {attributionPlan.requiredFields.map((field) => (
                      <div key={field.key}>
                        <strong>{field.label}</strong>
                        <span>{field.source}</span>
                        <small>{field.purpose}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="attribution-rule">
                  <BadgeInfo />
                  <div>
                    <strong>Khi nào dashboard được phép hiện “doanh thu từ marketing”?</strong>
                    <p>Khi mọi chiến dịch có mã riêng, thu ngân nhập mã đều đặn, hóa đơn không trùng và dữ liệu được cập nhật ít nhất mỗi tuần. Trước đó, phần tương quan phía trên chỉ nên dùng như tín hiệu tham khảo.</p>
                  </div>
                </div>

                <p className="attribution-sources">Cơ sở triển khai: <a href="https://posapp.vn/tich-hop-erp-pos" target="_blank" rel="noreferrer">Open API PosApp</a> · <a href="https://posapp.vn/phan-mem-tich-diem-khach" target="_blank" rel="noreferrer">voucher và CRM PosApp</a> · <a href="https://www.facebookblueprint.com/student/page/532230-upload-offline-event-data" target="_blank" rel="noreferrer">giao dịch offline trên Meta</a></p>
              </div>
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
