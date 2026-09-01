export function correlationLabel(value: number | null): string {
  if (value === null) return "Chưa đủ cặp dữ liệu";
  const strength = Math.abs(value) >= 0.7 ? "mạnh" : Math.abs(value) >= 0.4 ? "vừa" : "yếu";
  const direction = value > 0.05 ? "cùng chiều" : value < -0.05 ? "ngược chiều" : "gần như không có chiều";
  return `Mối liên hệ ${direction}, mức ${strength}`;
}

export function roasLabel(attributedRevenue: number | null): string {
  return attributedRevenue === null
    ? "Chưa có dữ liệu doanh thu quy thuộc"
    : "Có thể tính ROAS từ doanh thu quy thuộc";
}
