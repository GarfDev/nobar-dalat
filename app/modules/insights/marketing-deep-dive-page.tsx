import {
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
import {
  ReportNavigation,
  ReportFilters,
  useReportRange,
} from "./report-shell";
import { LatestSocialUpdate } from "./growth-panels";
import { calendarRange } from "./growth-insights";
import {
  buildAttributionPlan,
  computeCommunityQuality,
} from "./computed-metrics";
import { CommunityQualityPanel } from "./components/community-quality-panel";
import { insightData, tiktokSnapshot } from "./data";
import {
  formatCompact,
  formatDate,
  formatDecimal,
  formatPercent,
  formatVND,
  formatNumber,
} from "./format";
import {
  buildMonthlySocialPerformance,
  rankMetaContentOpportunities,
  summarizeMarketingMomentum,
  summarizeTikTokPostSignals,
  type MarketingMomentum,
  type MonthlySocialPerformance,
} from "./marketing-analysis";
import type { Platform } from "./types";
import {
  EfficiencyTrendChart,
  MonthlyGrowthChart,
  TikTokPostSignalChart,
} from "./components/marketing-growth-charts";

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
  if (views === null || interactions === null)
    return "Chưa đủ hai tháng liền nhau có dữ liệu hoàn chỉnh để kết luận xu hướng.";
  if (views > 0 && interactions < 0)
    return "Lượt xem tăng nhưng tương tác giảm: quy mô đang mở rộng, chất lượng phản ứng đang yếu đi.";
  if (views < 0 && interactions > 0)
    return "Lượt xem giảm nhưng người còn lại tương tác tốt hơn: cần phục hồi phân phối mà không đổi chất nội dung.";
  if (views > 0 && interactions > 0)
    return "Lượt xem và tương tác đều tăng so với tháng trước. Xem thêm tỷ lệ tương tác để đánh giá chất lượng lượt xem.";
  if (views < 0 && interactions < 0)
    return "Lượt xem và tương tác đều giảm so với tháng trước. Cần đối chiếu với lịch đăng và lịch quảng cáo.";
  return "Có chỉ số không đổi so với tháng trước. Xem từng chỉ số để đánh giá diễn biến.";
}

function latestRow(rows: MonthlySocialPerformance[], platform: Platform) {
  return rows.filter((row) => row.platform === platform).at(-1);
}

export function MarketingDeepDivePage() {
  const { range } = useReportRange();
  const campaigns = insightData.advertising.filter(
    (c) => c.startDate <= range.end && c.endDate >= range.start,
  );
  const attribution = buildAttributionPlan(insightData);
  const monthlyContext = buildMonthlySocialPerformance(insightData.social, {
    start: calendarRange(range.start.slice(0, 7), 2).start,
    end: range.end,
  });
  const monthly = buildMonthlySocialPerformance(insightData.social, range).map(
    (row) => {
      const context = monthlyContext.find(
        (c) => c.month === row.month && c.platform === row.platform,
      );
      return {
        ...row,
        viewGrowth: row.complete.views ? (context?.viewGrowth ?? null) : null,
        interactionGrowth: row.complete.interactions
          ? (context?.interactionGrowth ?? null)
          : null,
      };
    },
  );
  const instagramMomentum = summarizeMarketingMomentum(monthly, "instagram");
  const facebookMomentum = summarizeMarketingMomentum(monthly, "facebook");
  const latestInstagram = latestRow(monthly, "instagram");
  const latestFacebook = latestRow(monthly, "facebook");
  const tiktokSignals = summarizeTikTokPostSignals(tiktokSnapshot.topPosts);
  const contentOpportunities = rankMetaContentOpportunities(
    insightData.content.filter(
      (item) => item.date >= range.start && item.date <= range.end,
    ),
  ).slice(0, 5);
  const selectedSocial = insightData.social.filter(
    (row) => row.date >= range.start && row.date <= range.end,
  );
  const sum = (field: "views" | "interactions" | "linkClicks" | "follows") =>
    selectedSocial.reduce((total, row) => total + (row[field] ?? 0), 0);
  const totals = {
    views: sum("views"),
    interactions: sum("interactions"),
    clicks: sum("linkClicks"),
    follows: sum("follows"),
  };

  const collectionPlan = [
    {
      priority: "Làm ngay",
      source: "Meta + TikTok",
      title: "Chụp tổng follower cuối mỗi tháng",
      fields: "Ngày chốt, kênh, tổng follower, follower mới, unfollow",
      answer:
        "Biết quy mô cộng đồng thực sự tăng bao nhiêu, thay vì chỉ cộng lượt follow mới.",
      cadence: "Ngày cuối tháng",
    },
    {
      priority: "Làm ngay",
      source: "TikTok Studio",
      title: "Xuất số liệu từng ngày và từng video",
      fields:
        "Video ID, ngày đăng, view, like, comment, share, save, watch time, follower mới",
      answer:
        "Vẽ được tăng trưởng TikTok theo tháng và biết format nào giữ người xem.",
      cadence: "Mỗi tháng",
    },
    {
      priority: "Tiếp theo",
      source: "Instagram + Facebook",
      title: "Lưu toàn bộ nội dung, không chỉ top 10",
      fields:
        "Content ID, format, organic/paid view, reach, comment, share, save, click, follow",
      answer:
        "So sánh công bằng nội dung organic với nội dung được chạy quảng cáo.",
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
      fields:
        "Order ID, campaign/content ID, mã QR hoặc ưu đãi, doanh thu thuần",
      answer:
        "Biết marketing mang về bao nhiêu đơn và doanh thu; lúc đó mới tính được ROAS.",
      cadence: "Mỗi đơn",
    },
    {
      priority: "Bổ sung",
      source: "Google Business Profile",
      title: "Lưu lịch sử review và phản hồi",
      fields:
        "Ngày review, số sao, nội dung, chủ đề, đã phản hồi, thời gian phản hồi",
      answer:
        "Theo dõi danh tiếng địa điểm và vấn đề trải nghiệm khách nhắc lại nhiều lần.",
      cadence: "Hàng tuần",
    },
  ];

  return (
    <main className="marketing-deep-dive">
      <ReportNavigation active="/insights/marketing" range={range} />
      <a className="marketing-skip" href="#monthly-growth">
        Đi tới biểu đồ tăng trưởng
      </a>
      <header className="marketing-hero">
        <div className="marketing-hero-grid">
          <div>
            <p className="marketing-eyebrow">
              NObar · {formatDate(range.start)}–{formatDate(range.end)}
            </p>
            <h1>Báo cáo marketing</h1>
          </div>
          <div className="marketing-hero-copy">
            <p>
              Tách riêng ba câu hỏi: có thêm người xem không, người xem có hành
              động không, và hành động đó đã nối được tới lượt ghé quán chưa.
            </p>
            <strong>
              Lịch sử tháng chốt 31/08/2026 · Cập nhật Meta đến 14/09 và TikTok đọc 15/09 ở mục mới nhất
            </strong>
          </div>
        </div>
      </header>

      <ReportFilters />
      <LatestSocialUpdate />
      <section className="reports-section social-growth-panel">
        <header>
          <p>Lịch sử theo tháng · kỳ đang chọn</p>
          <h2>Kênh nào tăng, tăng ở chỉ số nào?</h2>
          <p>
            So với tháng liền trước, kể cả khi tháng đối chiếu nằm ngoài bộ lọc.
            Chỉ hiển thị số tháng đầy đủ; thiếu dữ liệu không được coi là 0.
          </p>
        </header>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Tháng / kênh</th>
                <th>Lượt xem / tăng trưởng</th>
                <th>Tương tác / tăng trưởng</th>
                <th>Nhấp link</th>
                <th>Follow mới</th>
                <th>Tương tác / 1.000 view</th>
                <th>Nhấp link / 1.000 view</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.month + m.platform}>
                  <td>
                    {monthLabel(m.month)}
                    <br />
                    {m.platform === "instagram" ? "Instagram" : "Facebook"}
                  </td>
                  <td>
                    {formatNumber(m.complete.views ? m.views : null)}
                    <br />
                    {growthLabel(m.viewGrowth)}
                  </td>
                  <td>
                    {formatNumber(
                      m.complete.interactions ? m.interactions : null,
                    )}
                    <br />
                    {growthLabel(m.interactionGrowth)}
                  </td>
                  <td>
                    {formatNumber(m.complete.linkClicks ? m.linkClicks : null)}
                  </td>
                  <td>{formatNumber(m.complete.follows ? m.follows : null)}</td>
                  <td>
                    {formatDecimal(
                      m.complete.views && m.complete.interactions
                        ? m.interactionPerThousandViews
                        : null,
                    )}
                  </td>
                  <td>
                    {formatDecimal(
                      m.complete.views && m.complete.linkClicks
                        ? m.clicksPerThousandViews
                        : null,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="reports-note">
          Follow mới chỉ là số lượt bắt đầu theo dõi, chưa trừ unfollow. Chưa có
          tổng follower cuối tháng để đo tốc độ tăng quy mô cộng đồng.
        </p>
      </section>

      <section className="marketing-answer" aria-labelledby="answer-title">
        <div className="answer-mark">
          <Sparkles />
          <span>Kết luận hiện tại</span>
        </div>
        <div>
          <h2 id="answer-title">
            Meta có dữ liệu tăng trưởng theo tháng. TikTok chưa có lịch sử
            tháng.
          </h2>
          <p>
            Instagram và Facebook đủ để theo dõi lượt xem, tương tác và nhấp
            link. TikTok hiện chỉ cho biết tổng 365 ngày và 3 video nổi bật, nên
            chưa thể nói tháng nào TikTok tăng hay giảm.
          </p>
        </div>
      </section>

      <section
        className="channel-momentum"
        aria-label="Tình hình mới nhất theo kênh"
      >
        {[
          {
            name: "Instagram",
            momentum: instagramMomentum,
            latest: latestInstagram,
            className: "instagram",
          },
          {
            name: "Facebook",
            momentum: facebookMomentum,
            latest: latestFacebook,
            className: "facebook",
          },
        ].map(({ name, momentum, latest, className }) => (
          <article key={name} className={className}>
            <header>
              <span>{name}</span>
              <small>Tháng mới nhất: {monthLabel(momentum.latestMonth)}</small>
            </header>
            <div className="momentum-numbers">
              <div>
                <span>Lượt xem</span>
                <strong>{formatCompact(latest?.views ?? null)}</strong>
                <em className={growthClass(momentum.latestViewGrowth)}>
                  {growthLabel(momentum.latestViewGrowth)} so với tháng trước
                </em>
              </div>
              <div>
                <span>Tương tác</span>
                <strong>{formatCompact(latest?.interactions ?? null)}</strong>
                <em className={growthClass(momentum.latestInteractionGrowth)}>
                  {growthLabel(momentum.latestInteractionGrowth)} so với tháng
                  trước
                </em>
              </div>
            </div>
            <p>{platformVerdict(momentum)}</p>
            <footer>
              Đỉnh lượt xem: {monthLabel(momentum.strongestViewMonth)} · Đỉnh
              tương tác: {monthLabel(momentum.strongestInteractionMonth)}
            </footer>
          </article>
        ))}
      </section>

      <section className="signal-runway" aria-labelledby="runway-title">
        <header>
          <span>Đường đi từ nội dung tới doanh thu</span>
          <h2 id="runway-title">Đang đo được tới đâu?</h2>
        </header>
        <div className="runway-track">
          <article>
            <BarChart3 />
            <span>Được xem</span>
            <strong>{formatCompact(totals.views)}</strong>
            <small>Có dữ liệu theo ngày</small>
          </article>
          <article>
            <Sparkles />
            <span>Có phản ứng</span>
            <strong>{formatCompact(totals.interactions)}</strong>
            <small>Tổng tương tác Meta có dữ liệu</small>
          </article>
          <article>
            <MousePointerClick />
            <span>Tìm hiểu thêm</span>
            <strong>{formatCompact(totals.clicks)}</strong>
            <small>Nhấp link Meta</small>
          </article>
          <article>
            <Users />
            <span>Theo dõi mới</span>
            <strong>{formatCompact(totals.follows)}</strong>
            <small>Một phần kỳ có dữ liệu</small>
          </article>
          <article className="is-gap">
            <CircleAlert />
            <span>Ghé quán / mua hàng</span>
            <strong>Chưa nối</strong>
            <small>Thiếu campaign ID trên hóa đơn</small>
          </article>
        </div>
        <p className="reports-note">
          Các số tổng có độ phủ khác nhau và có thể đếm nhiều hành động của cùng
          một người; chưa phải phễu chuyển đổi khách hàng.
        </p>
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
            <li>
              <strong>Nhìn lượt xem:</strong> kênh có được phân phối rộng hơn
              không?
            </li>
            <li>
              <strong>Nhìn tương tác / 1.000 view:</strong> lượng người xem mới
              có phản ứng không?
            </li>
            <li>
              <strong>Nhìn nhấp link và follow:</strong> có dấu hiệu muốn tìm
              hiểu thêm không?
            </li>
          </ol>
          <p>
            Không dùng các chart này để kết luận doanh thu tăng nhờ social; dữ
            liệu hiện chưa nối tới hóa đơn.
          </p>
        </aside>
      </section>

      <section className="marketing-section content-opportunity">
        <header className="section-copy">
          <span>Meta · mẫu 10 nội dung nổi bật</span>
          <h2>Nội dung nào tạo hành động có giá trị?</h2>
          <p>
            Xếp theo lượt lưu + chia sẻ + follower mới trên 1.000 lượt xem, thay
            vì xếp theo view thô.
          </p>
        </header>
        <div className="content-opportunity-list">
          {!contentOpportunities.length && (
            <p>
              Chưa có bài nổi bật được thu thập trong khoảng này. Đổi khoảng
              ngày để xem mẫu hiện có.
            </p>
          )}
          {contentOpportunities.map((item, index) => (
            <article key={item.id}>
              <span className="content-rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <small>
                  {item.platform} · {item.format} · {formatDate(item.date)}
                </small>
                <h3>{cleanContentLabel(item.label).slice(0, 110)}</h3>
              </div>
              <dl>
                <div>
                  <dt>Hành động giá trị / 1.000 view</dt>
                  <dd>{formatDecimal(item.intentPerThousandViews)}</dd>
                </div>
                <div>
                  <dt>Lượt xem</dt>
                  <dd>{formatCompact(item.views)}</dd>
                </div>
                <div>
                  <dt>Tỷ trọng paid view</dt>
                  <dd>
                    {item.paidViewShare === null
                      ? "Chưa tách"
                      : formatPercent(item.paidViewShare)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <p className="sample-warning">
          Đây chỉ là mẫu 10 bài nổi bật đã thu thập, không đại diện cho toàn bộ
          nội dung đã đăng.
        </p>
      </section>

      <section className="marketing-section tiktok-deep-dive">
        <div className="tiktok-context">
          <span>TikTok · snapshot 365 ngày</span>
          <h2>
            ≈ {formatCompact(tiktokSnapshot.totals.videoViews)} lượt xem trong
            kỳ cố định 365 ngày.
          </h2>
          <p>
            02/09/2025–01/09/2026 · Số liệu TikTok giữ nguyên khi đổi bộ lọc.
            Chưa có dữ liệu ngày để phân tích theo khoảng chọn.
          </p>
          <p>
            {formatPercent(
              tiktokSnapshot.trafficSources.find(
                (item) => item.source === "For You",
              )?.share ?? null,
            )}{" "}
            lượt xem đến từ For You;{" "}
            {formatPercent(
              tiktokSnapshot.trafficSources.find(
                (item) => item.source === "Tìm kiếm",
              )?.share ?? null,
            )}{" "}
            đến từ tìm kiếm. Điều này cho thấy TikTok vừa tạo khám phá, vừa bắt
            được một phần nhu cầu chủ động.
          </p>
          <div>
            <strong>{formatCompact(tiktokSnapshot.totals.profileViews)}</strong>
            <span>lượt xem trang cá nhân</span>
          </div>
        </div>
        <TikTokPostSignalChart rows={tiktokSignals} />
      </section>

      <section className="marketing-section">
        <header className="section-copy">
          <span>Bình luận, chia sẻ & lưu bài</span>
          <h2>Chất lượng tương tác cộng đồng</h2>
          <p>
            Phân tích trên các bài Meta đã thu thập trong kỳ. Story, tag, repost
            và inbox còn thiếu.
          </p>
        </header>
        <CommunityQualityPanel
          metrics={computeCommunityQuality(
            insightData.content.filter(
              (c) => c.date >= range.start && c.date <= range.end,
            ),
          )}
        />
        {!contentOpportunities.length && (
          <p>Chưa có mẫu nội dung trong kỳ để tổng hợp tương tác cộng đồng.</p>
        )}
      </section>
      <section className="marketing-section">
        <header className="section-copy">
          <span>Quảng cáo</span>
          <h2>Chiến dịch và kết quả ghi nhận</h2>
          <p>
            Mỗi dòng giữ nguyên kỳ nguồn. Chiến dịch giao một phần khoảng chọn
            vẫn hiển thị toàn bộ chi phí của chiến dịch, chưa thể phân bổ theo
            ngày.
          </p>
        </header>
        {campaigns.length ? (
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Chiến dịch</th>
                  <th>Kỳ nguồn</th>
                  <th>Chi phí</th>
                  <th>Kết quả nguồn</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.label}
                      <br />
                      <small>{c.deliveryStatus}</small>
                    </td>
                    <td>
                      {formatDate(c.startDate)}–{formatDate(c.endDate)}
                    </td>
                    <td>{formatVND(c.spend)}</td>
                    <td>
                      {formatNumber(c.results)} {c.resultType}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Không có chiến dịch đã thu thập giao với khoảng ngày đang chọn.</p>
        )}
        <p className="reports-note">
          Chưa có doanh thu quy thuộc để tính ROAS hoặc chi phí thu hút một
          khách mua hàng.
        </p>
      </section>
      <section className="marketing-section">
        <header className="section-copy">
          <span>Từ chiến dịch tới hóa đơn</span>
          <h2>Đo được marketing mang về bao nhiêu đơn</h2>
          <p>
            {attribution.statusLabel}. Bắt đầu từ mã chiến dịch được lưu cùng
            hóa đơn.
          </p>
        </header>
        <div className="reports-briefs">
          {attribution.phases.map((p) => (
            <article key={p.code}>
              <span>{p.timing}</span>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <p>{p.outcome}</p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="marketing-section collection-section"
        id="collect-next"
      >
        <header className="section-copy">
          <span>Kế hoạch thu hoạch dữ liệu</span>
          <h2>Thu thêm gì để dashboard trả lời được câu hỏi khó hơn?</h2>
          <p>
            Mỗi dòng dưới đây gắn trực tiếp với một quyết định marketing, không
            thu thập chỉ để “có nhiều data”.
          </p>
        </header>
        <div
          className="collection-table"
          role="table"
          aria-label="Kế hoạch thu thập dữ liệu marketing"
        >
          {collectionPlan.map((item, index) => (
            <article role="row" key={item.title}>
              <span className="collection-order">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="collection-main">
                <small>
                  {item.priority} · {item.source}
                </small>
                <h3>{item.title}</h3>
                <p>{item.answer}</p>
              </div>
              <div className="collection-fields">
                <span>Cần lưu</span>
                <p>{item.fields}</p>
              </div>
              <strong>{item.cadence}</strong>
            </article>
          ))}
        </div>
      </section>

      <footer className="marketing-footer">
        <Database />
        <div>
          <strong>Phạm vi kết luận</strong>
          <p>
            Meta có dữ liệu ngày trong tối đa 24 tháng, nhưng một số trường bắt
            đầu muộn hơn. TikTok là snapshot 02.09.2025–01.09.2026. Google
            Reviews và dữ liệu quy thuộc hóa đơn chưa có trong bộ dữ liệu hiện
            tại.
          </p>
        </div>
        <a href="#monthly-growth">
          Xem lại tăng trưởng <ArrowUpRight />
        </a>
      </footer>
    </main>
  );
}
