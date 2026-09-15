import { insightData } from "./data";
import { periodMetric, revenueDrivers } from "./growth-insights";
import { socialUpdate, socialUpdateSource } from "./social-update";
import { formatNumber, formatPercent, formatVND, formatDecimal } from "./format";
import { buildReport } from "./reporting";
import type { DateRange } from "./types";

export function RevenueDrivers({ range }: { range: DateRange }) {
  const r = buildReport(insightData, range);
  const d = revenueDrivers(
    r.revenue.netRevenue,
    r.revenue.orders,
    r.comparisonRevenue.netRevenue,
    r.comparisonRevenue.orders,
    r.comparisonComplete,
  );
  return (
    <section className="reports-section">
      <header>
        <p>Giải thích biến động</p>
        <h2>Doanh thu thay đổi do số đơn hay giá trị đơn?</h2>
      </header>
      {d ? (
        <>
          <div className="reports-briefs">
            <article>
              <span>Do số đơn thay đổi</span>
              <h3>{formatVND(d.orderEffect)}</h3>
              <p>
                Giữ giá trị mỗi đơn bằng kỳ trước để đo phần thay đổi do số đơn.
              </p>
            </article>
            <article>
              <span>Do giá trị mỗi đơn thay đổi</span>
              <h3>{formatVND(d.ticketEffect)}</h3>
              <p>
                Giá trị mỗi đơn {formatPercent(d.aovGrowth, true)} so với kỳ
                trước.
              </p>
            </article>
            <article>
              <span>Tổng thay đổi doanh thu</span>
              <h3>
                {formatVND(
                  r.revenue.netRevenue - r.comparisonRevenue.netRevenue,
                )}
              </h3>
              <p>
                Hai phần bên trái cộng lại bằng mức thay đổi này. Đây là phân rã
                số học, không phải kết luận nguyên nhân.
              </p>
            </article>
          </div>
          <p className="reports-note">
            So với kỳ liền trước cùng số ngày. Giá trị đơn thay đổi có thể do
            giá bán, cơ cấu món, số món mỗi đơn hoặc giảm giá; hiện chưa tách
            được từng yếu tố.
          </p>
        </>
      ) : (
        <p className="reports-note">
          Cần hai kỳ đủ dữ liệu và có đơn bán để phân tích. Chọn khoảng ngắn hơn
          hoặc kỳ kết thúc muộn hơn.
        </p>
      )}
    </section>
  );
}

export function LatestSocialUpdate() {
  return (
    <section className="reports-section social-growth-panel">
      <header>
        <p>Cập nhật mới nhất · kiểm tra 15/09/2026</p>
        <h2>Social đang phát triển ra sao?</h2>
        <p>
          Meta: 01–14/09 so với 18–31/08, hai kỳ cùng 14 ngày. Phần này độc lập
          với bộ lọc lịch sử bên trên.
        </p>
      </header>
      <aside className="reports-notice">
        Meta đang báo quảng cáo bị tạm dừng do lần thanh toán gần nhất không xử
        lý được. Cần người quản lý tài khoản kiểm tra; chưa thể kết luận đây là
        nguyên nhân của biến động bên dưới.
      </aside>
      <div className="reports-briefs latest-social-grid">
        {socialUpdate.map((s) => {
          const metrics = [
            ["Lượt xem", s.views],
            ["Tương tác", s.interactions],
            ["Nhấp link", s.clicks],
            ["Theo dõi mới", s.follows],
          ] as const;
          const v = periodMetric(s.views.slice(14), s.views.slice(0, 14));
          const i = periodMetric(
            s.interactions.slice(14),
            s.interactions.slice(0, 14),
          );
          const c = periodMetric(s.clicks.slice(14), s.clicks.slice(0, 14));
          const rate = (n: number | null, d: number | null) =>
            n !== null && d ? formatDecimal((n / d) * 1000, 2) : "Chưa đủ";
          return (
            <article key={s.name}>
              <span>{s.name}</span>
              <h3>
                {v.growth !== null && v.growth < 0
                  ? "Lượt xem đang giảm"
                  : "Lượt xem đang tăng"}
              </h3>
              <div className="reports-table">
                <table>
                  <thead>
                    <tr>
                      <th>Chỉ số</th>
                      <th>01–14/09</th>
                      <th>18–31/08</th>
                      <th>Thay đổi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map(([name, a]) => {
                      const m = periodMetric(a.slice(14), a.slice(0, 14));
                      return (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{formatNumber(m.current)}</td>
                          <td>{formatNumber(m.previous)}</td>
                          <td>
                            {m.growth === null
                              ? "Chưa đủ"
                              : formatPercent(m.growth, true)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p>
                Tương tác / 1.000 lượt xem: {rate(i.current, v.current)} (trước:{" "}
                {rate(i.previous, v.previous)}). Nhấp link / 1.000 lượt xem:{" "}
                {rate(c.current, v.current)} (trước:{" "}
                {rate(c.previous, v.previous)}).
              </p>
              <p>
                {s.name === "Instagram"
                  ? "Lượt xem tăng nhẹ nhưng tương tác giảm. Nhấp link tăng từ 4 lên 47: nên xem lại các bài dẫn link hiệu quả để tìm điểm có thể lặp lại. Chưa biết các lượt nhấp có dẫn tới đặt bàn không."
                  : "Không ghi nhận nhấp link trong 14 ngày mới nhất. Kiểm tra lời kêu gọi hành động, link đặt bàn và lịch chạy quảng cáo."}
              </p>
            </article>
          );
        })}
      </div>
      <p className="reports-note">
        Theo dõi mới không phải tăng trưởng ròng: còn thiếu unfollow và tổng
        follower. Instagram thiếu một số ngày follow nên không tính tổng hay
        tăng trưởng cho chỉ số này. Lượt xem có thể lặp lại; không phải số
        người.{" "}
        <a href={socialUpdateSource} target="_blank" rel="noreferrer">
          Đối chiếu Meta Business Suite ↗
        </a>
      </p>
      <article className="reports-notice">
        <strong>
          TikTok · 7 ngày gần nhất theo TikTok Studio, đọc ngày 15/09/2026
        </strong>
        <p>
          ≈ 5,7 nghìn lượt xem (+4,7%); 164 lượt xem hồ sơ (+15,5%); 114 lượt
          thích (−5,8%); 4 bình luận (+100%); 28 lượt chia sẻ (+115,4%). So với
          7 ngày trước theo nguồn.
        </p>
        <p>
          Lượt xem tăng nhẹ, lượt chia sẻ tăng từ 13 lên 28. Đây là tăng từ nền
          nhỏ, chưa đủ để kết luận xu hướng dài hạn. Chưa có lịch sử follower
          mới để đánh giá cộng đồng tăng trưởng ròng.
        </p>
        <p>
          Không cộng với Meta vì khác kỳ đo.{" "}
          <a
            href="https://www.tiktok.com/tiktokstudio/analytics"
            target="_blank"
            rel="noreferrer"
          >
            Đối chiếu TikTok Studio ↗
          </a>
        </p>
      </article>
    </section>
  );
}
