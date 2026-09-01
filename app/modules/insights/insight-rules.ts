import type { InsightsReport } from "./reporting";

export type ManagementFinding = {
  code: string;
  priority: "critical" | "high" | "medium";
  confidence: "high" | "medium" | "low";
  summary: string;
  evidence: string;
  action: string;
  source: string;
};

const priorityOrder = { critical: 0, high: 1, medium: 2 } as const;

export function buildManagementFindings(report: InsightsReport): ManagementFinding[] {
  const findings: ManagementFinding[] = [];
  if (!report.revenue.cogsAvailable) {
    findings.push({
      code: "missing-cogs",
      priority: "critical",
      confidence: "high",
      summary: "Thiếu giá vốn nên chưa thể quản trị lợi nhuận.",
      evidence: "PosApp trả giá vốn bằng 0 trong toàn nguồn và đã được chuẩn hóa thành chưa có dữ liệu.",
      action: "Thiết lập giá vốn nguyên liệu và công thức cho từng món trước kỳ đánh giá tiếp theo.",
      source: "PosApp",
    });
  }
  if (report.advertising.some((item) => /not delivering|failed|payment/i.test(item.deliveryStatus))) {
    findings.push({
      code: "ad-billing",
      priority: "high",
      confidence: "high",
      summary: "Phân phối quảng cáo có dấu hiệu gián đoạn.",
      evidence: "Ít nhất một quảng cáo giao khoảng chọn có trạng thái không phân phối.",
      action: "Kiểm tra phương thức thanh toán và xác nhận chiến dịch phân phối lại bình thường.",
      source: "Meta",
    });
  }
  if (report.advertising.some((item) => item.attributedRevenue === null)) {
    findings.push({
      code: "missing-attribution",
      priority: "high",
      confidence: "high",
      summary: "Chưa nối được chi tiêu quảng cáo với đơn tại quầy.",
      evidence: "Nguồn quảng cáo không có doanh thu hoặc giao dịch quy thuộc.",
      action: "Dùng UTM, mã ưu đãi riêng và trường ghi nhận nguồn trên đơn PosApp.",
      source: "Meta + PosApp",
    });
  }
  if (!report.productCoverageExact) {
    findings.push({
      code: "product-window",
      priority: "medium",
      confidence: "high",
      summary: "Khoảng chọn không khớp kỳ tổng hợp sản phẩm.",
      evidence: "Sản phẩm chỉ được xuất theo ba cửa sổ nguồn cố định.",
      action: "Xuất thêm báo cáo sản phẩm theo tháng để phân tích linh hoạt hơn.",
      source: "PosApp",
    });
  }
  return findings.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}
