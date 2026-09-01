import { useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  CircleDollarSign,
  Database,
  Megaphone,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import { insightData } from "./data";
import { formatCompact, formatDate, formatNumber, formatPercent, formatVND } from "./format";
import { correlationLabel, roasLabel } from "./interpretation";
import { buildManagementFindings } from "./insight-rules";
import { buildReport, clampRange, laggedCorrelation, type MetricPoint } from "./reporting";
import { aggregateProductRanking } from "./product-ranking";
import type { DateRange, ISODate } from "./types";
import { KpiCard } from "./components/kpi-card";
import { TrendChart } from "./components/trend-chart";
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
  const trendData = report.monthlyRevenue.map((item) => ({
    label: item.month,
    value: item.netRevenue,
  }));
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
            <TrendChart data={trendData} label="Xu hướng doanh thu thuần theo tháng" />
            <div className="metric-strip">
              <div><span>Doanh thu gộp</span><strong>{formatVND(report.revenue.grossRevenue)}</strong></div>
              <ArrowRight aria-hidden="true" />
              <div><span>Giảm giá</span><strong>− {formatVND(report.revenue.discounts)}</strong></div>
              <ArrowRight aria-hidden="true" />
              <div><span>Doanh thu thuần</span><strong>{formatVND(report.revenue.netRevenue)}</strong></div>
              <div><span>Tỷ lệ giảm giá</span><strong>{formatPercent(report.revenue.discountRate)}</strong></div>
            </div>
            {mode === "detailed" && (
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
              {report.social.map((platform) => <article key={platform.platform} className={`platform-card ${platform.platform}`}>
                <div className="platform-heading"><span>{platform.platform === "instagram" ? "IG" : "FB"}</span><div><p>{platform.platform}</p><h3>{formatCompact(platform.views)} lượt xem</h3></div></div>
                <dl>
                  <div><dt>{platform.platform === "instagram" ? "Reach theo ngày" : "Viewers theo ngày"}</dt><dd>{formatCompact(platform.audience)}</dd></div>
                  <div><dt>Tương tác</dt><dd>{formatCompact(platform.interactions)}</dd></div>
                  <div><dt>Nhấp link</dt><dd>{formatCompact(platform.linkClicks)}</dd></div>
                  <div><dt>Theo dõi mới</dt><dd>{formatCompact(platform.follows)}</dd></div>
                  <div><dt>Lượt thăm</dt><dd>{platform.visits === null ? "Không có" : formatCompact(platform.visits)}</dd></div>
                </dl>
              </article>)}
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
              <SectionTitle index="07" kicker="Directional evidence" title="Marketing ↔ doanh thu" note="Đối chiếu tương tác Meta ngày D với doanh thu ngày D+n" />
              <div className="correlation-grid">
                {correlationRows.map((item) => <article key={item.lag}><span>D{item.lag ? `+${item.lag}` : ""}</span><strong>{item.correlation === null ? "—" : item.correlation.toFixed(2)}</strong><p>{correlationLabel(item.correlation)}</p><small>{formatNumber(item.pairs)} cặp ngày</small></article>)}
              </div>
              <div className="interpretation-panel"><BadgeInfo /><p>{strongest ? `Liên hệ tuyệt đối mạnh nhất trong kỳ nằm ở độ trễ D+${strongest.lag} (r = ${strongest.correlation?.toFixed(2)}), trên ${strongest.pairs} cặp ngày.` : "Chưa đủ dữ liệu biến thiên để đọc mối liên hệ trong kỳ."} <strong>Tương quan không chứng minh quan hệ nhân quả.</strong> Ranh giới ngày Meta có thể lệch so với ca bán hàng tại Việt Nam.</p></div>
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
            <SectionTitle index={mode === "detailed" ? "09" : "06"} kicker="Audit trail" title="Phạm vi & giới hạn dữ liệu" />
            <div className="notes-grid"><div><ReceiptText /><h3>PosApp</h3><p>01.09.2024–31.08.2026 · 730 ngày lịch · 668 ngày bán · 4.278 đơn sau đối chiếu.</p></div><div><Megaphone /><h3>Meta</h3><p>Facebook và Instagram theo múi giờ báo cáo nền tảng; độ phủ từng metric khác nhau.</p></div><div><Database /><h3>Thiếu dữ liệu</h3><p>Giá vốn, lợi nhuận, biên gộp, doanh thu quy thuộc, ROAS, khách duy nhất và vòng quay bàn.</p></div></div>
            <details><summary>Xem toàn bộ ghi chú nguồn</summary><ul>{insightData.quality.notes.map((note) => <li key={note}>{note}</li>)}</ul></details>
            <p className="snapshot-stamp">STATIC SNAPSHOT · GENERATED {insightData.quality.generatedAt} · RANGE {COVERAGE.start}—{COVERAGE.end}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
