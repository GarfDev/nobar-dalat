export function correlationLabel(value: number | null): string {
  if (value === null) return "Chưa đủ dữ liệu để kết luận";
  const strength = Math.abs(value);
  if (strength < 0.2) return "Dữ liệu chưa cho thấy hai chỉ số đi cùng nhau";
  if (strength < 0.4) return value > 0
    ? "Tương tác cao thường đi cùng doanh thu nhỉnh hơn, nhưng tín hiệu còn yếu"
    : "Tương tác cao thường đi cùng doanh thu thấp hơn, nhưng tín hiệu còn yếu";
  return value > 0
    ? "Tương tác cao thường đi cùng doanh thu cao hơn"
    : "Tương tác cao thường đi cùng doanh thu thấp hơn";
}

export function correlationDecision(value: number | null): string {
  if (value === null) return "Chưa đủ dữ liệu để kiểm tra mối liên hệ giữa Meta và doanh thu.";
  const strength = Math.abs(value);
  if (strength < 0.2) return "Dữ liệu hiện chưa cho thấy tương tác Meta và doanh thu đi cùng nhau.";
  if (strength < 0.4) return "Tương tác cao thường đi cùng doanh thu nhỉnh hơn, nhưng tín hiệu còn quá yếu để quyết định ngân sách.";
  if (strength < 0.7) return "Tương tác cao thường đi cùng doanh thu cao hơn; cần gắn mã chiến dịch với đơn hàng để kiểm chứng.";
  return "Tương tác và doanh thu đi cùng nhau khá rõ trong kỳ; vẫn cần nối chiến dịch với đơn hàng trước khi đánh giá hiệu quả.";
}

export function roasLabel(attributedRevenue: number | null): string {
  return attributedRevenue === null
    ? "Chưa có dữ liệu doanh thu quy thuộc"
    : "Có thể tính ROAS từ doanh thu quy thuộc";
}
