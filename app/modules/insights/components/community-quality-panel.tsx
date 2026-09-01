import { AtSign, Bookmark, MessageCircle, Send, Share2 } from "lucide-react";

import type { CommunityQuality } from "../computed-metrics";
import { formatDecimal, formatNumber } from "../format";

type CommunityQualityPanelProps = {
  metrics: CommunityQuality;
};

const missingSignals = [
  {
    icon: MessageCircle,
    label: "Story",
    fields: "Lượt trả lời · nhấp link · xem hết",
    action: "Xuất ảnh chụp Insights mỗi tuần, cùng một ngày và cùng khung giờ.",
  },
  {
    icon: AtSign,
    label: "Khách nhắc đến quán",
    fields: "Mention · tag · nội dung do khách đăng",
    action: "Ghi số lượng từ mục Thông báo mỗi tuần; lưu link bài để đội marketing phản hồi.",
  },
  {
    icon: Send,
    label: "Hộp thư",
    fields: "Cuộc trò chuyện mới · thời gian phản hồi",
    action: "Ghi tổng số hội thoại và thời gian phản hồi mỗi ngày; không cần lưu nội dung riêng tư.",
  },
  {
    icon: Share2,
    label: "Lan truyền",
    fields: "Repost · chia sẻ Story · nguồn chia sẻ",
    action: "Tổng hợp theo tuần và gắn với mã bài đăng để biết nội dung nào được truyền miệng.",
  },
];

export function CommunityQualityPanel({ metrics }: CommunityQualityPanelProps) {
  if (metrics.samplePosts === 0) return null;

  return (
    <section className="community-quality-panel" aria-labelledby="community-quality-title">
      <header className="community-quality-heading">
        <div>
          <span>Chất lượng tương tác</span>
          <h3 id="community-quality-title">Khách chỉ “thích”, hay thực sự muốn nhớ và giới thiệu quán?</h3>
        </div>
        <p>Mẫu {formatNumber(metrics.samplePosts)} bài nổi bật đã xác minh trong khoảng đang chọn.</p>
      </header>

      <div className="community-quality-core">
        <article className="community-quality-answer">
          <Bookmark aria-hidden="true" />
          <span>Hành động có ý định cao</span>
          <strong>{formatNumber(metrics.highIntentActions)}</strong>
          <p><b>{formatNumber(metrics.saves)} lượt lưu</b> + <b>{formatNumber(metrics.shares)} lượt chia sẻ</b></p>
          <div>
            <strong>{formatDecimal(metrics.highIntentPerThousandViews)}</strong>
            <span>lượt lưu hoặc chia sẻ / 1.000 lượt xem</span>
          </div>
          <small>Đây là tín hiệu khách muốn quay lại hoặc gửi nội dung cho người khác; có giá trị hơn một lượt thích đơn thuần.</small>
        </article>

        <div className="community-signal-list" aria-label="Các tầng chất lượng tương tác">
          <div><span>Phản ứng nhẹ</span><strong>{formatNumber(metrics.likes)} lượt thích</strong><small>Biết nội dung được chú ý</small></div>
          <div><span>Muốn nhớ / giới thiệu</span><strong>{formatNumber(metrics.highIntentActions)} lưu + chia sẻ</strong><small>{formatDecimal(metrics.highIntentPerThousandViews)} trên 1.000 lượt xem</small></div>
          <div><span>Mở hội thoại</span><strong>{formatNumber(metrics.comments)} bình luận</strong><small>{formatDecimal(metrics.conversationPerThousandViews, 2)} trên 1.000 lượt xem</small></div>
          <div><span>Giữ quan hệ</span><strong>{formatNumber(metrics.follows)} lượt theo dõi</strong><small>{formatDecimal(metrics.followPerThousandViews)} trên 1.000 lượt xem</small></div>
        </div>
      </div>

      <div className="community-missing">
        <header>
          <span>Phần còn mù</span>
          <h4>Dashboard chưa thấy các cuộc trò chuyện và nội dung khách tạo ra</h4>
          <p>Nếu không thu bốn nhóm dưới đây, đội ngũ chỉ biết bài có nhiều lượt xem chứ chưa biết cộng đồng có phản hồi, giới thiệu hay cần hỗ trợ hay không.</p>
        </header>
        <div className="community-missing-grid">
          {missingSignals.map(({ icon: Icon, label, fields, action }) => (
            <article key={label}>
              <Icon aria-hidden="true" />
              <h5>{label}</h5>
              <strong>{fields}</strong>
              <p>{action}</p>
            </article>
          ))}
        </div>
      </div>

      <footer className="community-quality-note">
        <span>Mẫu số liệu</span>
        <p>Chỉ dùng {formatNumber(metrics.samplePosts)} bài top đã xác minh, nên phù hợp để định hướng nội dung chứ chưa đại diện toàn bộ tài khoản. TikTok Studio đã đăng nhập nhưng vẫn cần file CSV theo ngày trước khi ghép vào bộ lọc thời gian.</p>
      </footer>
    </section>
  );
}
