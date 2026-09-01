const links = [
  ["overview", "Tổng quan"],
  ["revenue", "Doanh thu & đơn"],
  ["products", "Sản phẩm"],
  ["marketing", "Mạng xã hội"],
  ["content", "Nội dung"],
  ["advertising", "Quảng cáo"],
  ["relationship", "Liên hệ dữ liệu"],
  ["actions", "Kế hoạch"],
  ["data-notes", "Ghi chú dữ liệu"],
];

export function InsightsNavigation() {
  return (
    <nav className="insights-nav" aria-label="Mục báo cáo">
      <p>Report index</p>
      {links.map(([id, label], index) => (
        <a href={`#${id}`} key={id}>
          <span>{String(index + 1).padStart(2, "0")}</span>{label}
        </a>
      ))}
    </nav>
  );
}
