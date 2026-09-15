import { Link } from "react-router";
import { RevenueDrivers } from "./growth-panels";
import { calendarRange } from './growth-insights';
import { insightData } from "./data";
import { buildReport } from "./reporting";
import {
  computeOperationalMetrics,
  computeWeekdayPerformance,
} from "./computed-metrics";
import { aggregateProductRanking } from "./product-ranking";
import { formatNumber, formatPercent, formatVND, formatDate } from "./format";
import { ReportShell, reportHref, useReportRange } from "./report-shell";
import { DualTrendChart } from "./components/dual-trend-chart";
import { WeekdayPerformanceChart } from "./components/weekday-performance-chart";
import { KpiCard } from "./components/kpi-card";
import {
  buildMonthlySocialPerformance,
  summarizeMarketingMomentum,
} from "./marketing-analysis";

export function OverviewReport() {
  const { range } = useReportRange();
  const report = buildReport(insightData, range);
  const context = buildMonthlySocialPerformance(insightData.social, {start:calendarRange(range.start.slice(0,7),2).start,end:range.end});
  const months = buildMonthlySocialPerformance(insightData.social, range).map(row=>({...row,viewGrowth:row.complete.views?context.find(c=>c.month===row.month&&c.platform===row.platform)?.viewGrowth??null:null}));
  const summaries = (["instagram", "facebook"] as const).map((p) =>
    summarizeMarketingMomentum(months, p),
  );
  return (
    <ReportShell
      active="/insights"
      title="Báo cáo tổng hợp"
      description="Kết quả kinh doanh trong kỳ, diễn biến marketing và những việc cần ưu tiên."
    >
      <section className="reports-section">
        <header>
          <p>Kết quả kinh doanh</p>
          <h2>Quán bán được bao nhiêu?</h2>
        </header>
        <div className="kpi-grid">
          <KpiCard
            eyebrow="Doanh thu thuần"
            value={formatVND(report.revenue.netRevenue)}
            delta={report.revenueGrowth}
            source="POSAPP"
            accent="brass"
          />
          <KpiCard
            eyebrow="Đơn hoàn tất"
            value={formatNumber(report.revenue.orders)}
            delta={report.orderGrowth}
            source="POSAPP"
            accent="teal"
            note="Số hóa đơn; chưa xác định số khách hoặc lượt bàn."
          />
          <KpiCard
            eyebrow="Trung bình mỗi đơn"
            value={formatVND(report.revenue.averageOrderValue)}
            source="POSAPP"
            accent="brass"
          />
          <KpiCard
            eyebrow="Lợi nhuận"
            value="Chưa tính được"
            source="THIẾU CHI PHÍ"
            accent="red"
            note="Cần giá vốn, nhân sự, thuê mặt bằng và chi phí vận hành."
          />
        </div>
        <p className="reports-note">
          {report.comparisonComplete
            ? "Mức tăng/giảm so với kỳ trước có cùng số ngày: " +
              formatDate(report.comparisonRange.start) +
              "–" +
              formatDate(report.comparisonRange.end)
            : "Chưa có đủ kỳ trước cùng số ngày để so sánh tăng trưởng."}
        </p>
      </section>
      <RevenueDrivers range={range} />
      <section className="reports-section">
        <header>
          <p>Đọc nhanh</p>
          <h2>Những điều cần chú ý</h2>
        </header>
        <div className="reports-briefs">
          <article>
            <span>Tài chính</span>
            <h3>
              {formatNumber(report.revenue.orders)} đơn tạo ra{" "}
              {formatVND(report.revenue.netRevenue)}
            </h3>
            <p>
              Giảm giá chiếm {formatPercent(report.revenue.discountRate)} doanh
              thu gộp. Chưa có dữ liệu chi phí để đánh giá kết quả lãi/lỗ.
            </p>
            <Link to={reportHref("/insights/finance", range)}>
              Xem báo cáo tài chính →
            </Link>
          </article>
          <article>
            <span>Marketing</span>
            <h3>Diễn biến tháng mới nhất trong kỳ</h3>
            {summaries.map((s) => (
              <p key={s.platform}>
                {s.platform === "instagram" ? "Instagram" : "Facebook"}:{" "}
                {s.latestViewGrowth === null
                  ? "chưa đủ hai tháng đầy đủ để so sánh lượt xem"
                  : "lượt xem " +
                    formatPercent(s.latestViewGrowth, true) +
                    " so với tháng trước"}
                .
              </p>
            ))}
            <Link to={reportHref("/insights/marketing", range)}>
              Xem báo cáo marketing →
            </Link>
          </article>
          <article>
            <span>Đo lường</span>
            <h3>Chưa biết kênh nào mang khách tới quán</h3>
            <p>
              Dữ liệu social và hóa đơn chưa có mã liên kết. Cần lưu mã chiến
              dịch hoặc nguồn khách cùng từng đơn để đối chiếu.
            </p>
            <Link
              to={reportHref("/insights/marketing", range) + "#collect-next"}
            >
              Xem dữ liệu cần bổ sung →
            </Link>
          </article>
        </div>
      </section>
      <section className="reports-section">
        <header>
          <p>Ưu tiên quản trị</p>
          <h2>Ba việc cần giao người phụ trách</h2>
        </header>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Việc cần làm</th>
                <th>Phụ trách đề xuất</th>
                <th>Kết quả cần có</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chốt giá vốn và chi phí mỗi tháng</td>
                <td>Kế toán + quản lý quán</td>
                <td>Báo cáo lãi/lỗ có đối chiếu nguồn</td>
              </tr>
              <tr>
                <td>Lưu nguồn khách trên hóa đơn</td>
                <td>Marketing + thu ngân</td>
                <td>Số đơn và doanh thu theo nguồn</td>
              </tr>
              <tr>
                <td>Chốt số liệu social theo tháng</td>
                <td>Marketing</td>
                <td>Lịch sử Meta, TikTok và tổng follower</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </ReportShell>
  );
}

export function FinanceReport() {
  const { range } = useReportRange();
  const report = buildReport(insightData, range);
  const rows = insightData.revenue.filter(
    (r) => r.date >= range.start && r.date <= range.end,
  );
  const operating = computeOperationalMetrics(rows);
  const products = aggregateProductRanking(report.products);
  return (
    <ReportShell
      active="/insights/finance"
      title="Báo cáo tài chính"
      description="Doanh thu, đơn hàng, giảm giá và cơ cấu bán hàng; kèm tình trạng dữ liệu chi phí và lợi nhuận."
    >
      <aside className="reports-notice">
        <strong>Hiện có dữ liệu bán hàng từ PosApp.</strong>
        <p>
          Chưa có đủ giá vốn, chi phí hoạt động, công nợ và tiền thu/chi. Báo
          cáo lãi/lỗ và dòng tiền đang chờ các nguồn này.
        </p>
      </aside>
      <section className="reports-section">
        <header>
          <p>Bán hàng trong kỳ</p>
          <h2>Doanh thu và giá trị đơn</h2>
        </header>
        <div className="kpi-grid">
          <KpiCard
            eyebrow="Doanh thu thuần"
            value={formatVND(report.revenue.netRevenue)}
            delta={report.revenueGrowth}
            source="POSAPP"
            accent="brass"
          />
          <KpiCard
            eyebrow="Đơn hoàn tất"
            value={formatNumber(report.revenue.orders)}
            source="POSAPP"
            accent="teal"
          />
          <KpiCard
            eyebrow="Trung bình mỗi đơn"
            value={formatVND(report.revenue.averageOrderValue)}
            source="POSAPP"
            accent="brass"
          />
          <KpiCard
            eyebrow="Doanh thu / ngày có bán"
            value={formatVND(operating.revenuePerTradingDay)}
            source="POSAPP"
            accent="teal"
            note={operating.tradingDays + " ngày có bán trong kỳ."}
          />
        </div>
        <p className="reports-note">
          {report.comparisonComplete
            ? "So sánh doanh thu với kỳ trước cùng số ngày: " +
              formatDate(report.comparisonRange.start) +
              "–" +
              formatDate(report.comparisonRange.end)
            : "Không có đủ dữ liệu kỳ trước cùng số ngày để tính tăng trưởng."}
        </p>
      </section>
      <RevenueDrivers range={range} />
      <section className="reports-section">
        <header>
          <p>Diễn biến bán hàng</p>
          <h2>Doanh thu theo tháng</h2>
          <p>
            Tháng đầu hoặc cuối có thể chỉ gồm các ngày được chọn. Không dùng
            tổng tháng lẻ để so sánh tăng trưởng.
          </p>
        </header>
        <DualTrendChart
          data={report.monthlyRevenue.map((m) => ({
            label: m.month,
            primary: m.netRevenue,
            secondary: m.orders,
          }))}
        />
        <details className="reports-details">
          <summary>Xem số liệu từng tháng</summary>
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Doanh thu thuần</th>
                  <th>Đơn</th>
                  <th>Trung bình / đơn</th>
                </tr>
              </thead>
              <tbody>
                {report.monthlyRevenue.map((m) => (
                  <tr key={m.month}>
                    <td>{m.month}</td>
                    <td>{formatVND(m.netRevenue)}</td>
                    <td>{formatNumber(m.orders)}</td>
                    <td>
                      {formatVND(m.orders ? m.netRevenue / m.orders : null)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="reports-section">
        <header>
          <p>Đối chiếu bán hàng</p>
          <h2>Doanh thu, giảm giá và hoàn trả</h2>
        </header>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Chỉ tiêu</th>
                <th>Giá trị trong kỳ</th>
                <th>Cách đọc</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Doanh thu gộp</td>
                <td>{formatVND(report.revenue.grossRevenue)}</td>
                <td>Theo trường doanh thu gộp của PosApp</td>
              </tr>
              <tr>
                <td>Giảm giá</td>
                <td>{formatVND(report.revenue.discounts)}</td>
                <td>
                  {formatPercent(report.revenue.discountRate)} doanh thu gộp
                </td>
              </tr>
              <tr>
                <td>Hoàn trả</td>
                <td>{formatVND(report.revenue.refunds)}</td>
                <td>Theo dữ liệu hoàn trả đã xuất</td>
              </tr>
              <tr>
                <td>Doanh thu thuần</td>
                <td>{formatVND(report.revenue.netRevenue)}</td>
                <td>
                  Giữ số thuần nguồn PosApp; không suy thành tiền thực thu
                </td>
              </tr>
              <tr>
                <td>Thuế ghi nhận</td>
                <td>{formatVND(report.revenue.tax)}</td>
                <td>Trường thuế trong nguồn, chưa có tờ khai để đối chiếu</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="reports-section">
        <header>
          <p>Nhịp bán hàng</p>
          <h2>Hiệu suất theo ngày trong tuần</h2>
        </header>
        <WeekdayPerformanceChart data={computeWeekdayPerformance(rows)} />
      </section>
      <section className="reports-section">
        <header>
          <p>Cơ cấu doanh thu</p>
          <h2>Sản phẩm đóng góp</h2>
          <p>
            Số liệu sản phẩm chỉ có ba kỳ: 09–12/2024, cả năm 2025 và
            01–08/2026.
          </p>
        </header>
        {report.productCoverageExact && products.length ? (
          <details className="reports-details">
            <summary>Xem {products.length} sản phẩm theo doanh thu</summary>
            <p className="reports-note">
              Số lượng đang giữ nguyên theo nguồn. Có giá trị bất thường (như
              Highball, cao ila) cần đối chiếu lại bản xuất PosApp trước khi
              dùng để tính giá bán trung bình hay giá vốn.
            </p>
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng theo nguồn — chưa đối chiếu</th>
                    <th>Doanh thu theo nguồn sản phẩm</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.product}>
                      <td>{p.product}</td>
                      <td>{formatNumber(p.quantity)}</td>
                      <td>{formatVND(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ) : (
          <aside className="reports-notice">
            Khoảng chọn chưa khớp các kỳ sản phẩm. Chọn 24 tháng để xem toàn bộ
            dữ liệu sản phẩm, hoặc chọn đúng một kỳ nguồn phía trên.
          </aside>
        )}
      </section>
      <section className="reports-section">
        <header>
          <p>Hoàn thiện báo cáo tài chính</p>
          <h2>Còn thiếu gì để biết lãi/lỗ và dòng tiền?</h2>
        </header>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Báo cáo</th>
                <th>Trạng thái</th>
                <th>Dữ liệu cần bổ sung</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Giá vốn & lợi nhuận gộp</td>
                <td>Chưa tính được</td>
                <td>Định lượng món, giá nhập, tồn kho và hao hụt theo kỳ</td>
              </tr>
              <tr>
                <td>Lợi nhuận hoạt động</td>
                <td>Chưa tính được</td>
                <td>
                  Giá vốn, lương, thuê mặt bằng, điện nước, marketing và chi phí
                  khác
                </td>
              </tr>
              <tr>
                <td>Dòng tiền</td>
                <td>Chưa tính được</td>
                <td>
                  Số dư đầu/cuối kỳ, giao dịch ngân hàng và thu/chi tiền mặt
                </td>
              </tr>
              <tr>
                <td>Công nợ & tài sản</td>
                <td>Chưa có dữ liệu</td>
                <td>Phải thu, phải trả, vay, tài sản và khấu hao</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="reports-note">
          Giá vốn bằng 0 trong nguồn được đánh dấu thiếu dữ liệu. Không dùng số
          0 đó để tính lợi nhuận.
        </p>
      </section>
    </ReportShell>
  );
}
