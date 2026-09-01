import type { ContentItem, InsightData, Platform, RevenueDay, SocialDay } from "./types";

export type OperationalMetrics = {
  calendarDays: number;
  tradingDays: number;
  revenuePerTradingDay: number | null;
  ordersPerTradingDay: number | null;
  activeDayRate: number | null;
  revenueCoefficientOfVariation: number | null;
  weekendRevenueShare: number | null;
  discountPerOrder: number | null;
};

export type PlatformEfficiency = {
  comparableDays: number;
  engagementRate: number | null;
  clickThroughRate: number | null;
  followPerThousandViews: number | null;
};

export type SocialEfficiencyRow = {
  metric: string;
  instagram: number | null;
  facebook: number | null;
};

export type WeekdayPerformance = {
  weekday: number;
  activeDays: number;
  ordersPerActiveDay: number | null;
  averageOrderValue: number | null;
  netRevenue: number;
};

export type CommunityQuality = {
  samplePosts: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  follows: number;
  highIntentActions: number;
  highIntentPerThousandViews: number | null;
  conversationPerThousandViews: number | null;
  followPerThousandViews: number | null;
};

export type ReadinessDimension = {
  code: string;
  label: string;
  status: "ready" | "partial" | "missing";
  priority: "critical" | "high" | "medium";
  weight: number;
  impact: string;
  missingFields: string[];
  collectionPlan: string;
  owner: string;
  cadence: string;
};

export type DataReadiness = {
  score: number;
  dimensions: ReadinessDimension[];
  readyWeight: number;
  partialWeight: number;
  missingWeight: number;
};

export type AttributionPhase = {
  code: "campaign-code" | "posapp-api" | "meta-offline";
  step: string;
  title: string;
  timing: string;
  recommended: boolean;
  summary: string;
  actions: string[];
  outcome: string;
};

export type AttributionField = {
  key: "order_id" | "paid_at" | "net_revenue" | "promo_code" | "campaign_id" | "customer_match";
  label: string;
  source: string;
  purpose: string;
};

export type AttributionPlan = {
  status: "connected" | "not-connected";
  statusLabel: string;
  phases: AttributionPhase[];
  requiredFields: AttributionField[];
};

function safeDivide(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

export function buildAttributionPlan(data: InsightData): AttributionPlan {
  const unavailable = new Set(data.quality.unavailableFields ?? []);
  const connected = !unavailable.has("attributedRevenue");
  return {
    status: connected ? "connected" : "not-connected",
    statusLabel: connected ? "Đã có doanh thu theo chiến dịch" : "Chưa nối Meta với từng hóa đơn PosApp",
    phases: [
      {
        code: "campaign-code",
        step: "01",
        title: "Gắn mã riêng cho từng chiến dịch",
        timing: "Có thể bắt đầu tuần này",
        recommended: true,
        summary: "Mỗi bài quảng cáo hoặc chiến dịch có một mã dễ đọc, ví dụ IGREEL01 hoặc FBADS01.",
        actions: [
          "Đưa mã vào nội dung, tin nhắn, QR hoặc ưu đãi.",
          "Thu ngân áp mã đó vào đúng hóa đơn trên PosApp.",
          "Cuối tuần đối chiếu số đơn và doanh thu theo từng mã.",
        ],
        outcome: "Biết chiến dịch nào tạo đơn trực tiếp mà chưa cần tích hợp kỹ thuật.",
      },
      {
        code: "posapp-api",
        step: "02",
        title: "Tự động lấy hóa đơn từ PosApp",
        timing: "Sau khi quy trình nhập mã đã ổn",
        recommended: false,
        summary: "Dùng Open API hoặc webhook của PosApp để lấy hóa đơn, doanh thu và mã ưu đãi vào cùng bảng dữ liệu.",
        actions: [
          "Giữ mã hóa đơn duy nhất và thời gian thanh toán.",
          "Lưu doanh thu thuần cùng mã chiến dịch trên đơn.",
          "Ghép mã chiến dịch với campaign ID hoặc content ID của Meta.",
        ],
        outcome: "Dashboard tự cập nhật số đơn và doanh thu do từng chiến dịch mang về.",
      },
      {
        code: "meta-offline",
        step: "03",
        title: "Gửi giao dịch tại quầy về Meta",
        timing: "Chỉ làm sau khi dữ liệu đơn sạch",
        recommended: false,
        summary: "Gửi giao dịch hoàn tất vào Events Manager để Meta đối chiếu người đã xem hoặc nhấp quảng cáo trước khi mua tại quầy.",
        actions: [
          "Dùng mã hóa đơn để tránh gửi trùng giao dịch.",
          "Chỉ dùng thông tin khách đã đồng ý và băm dữ liệu trước khi chia sẻ.",
          "Theo dõi số sự kiện nhận được và tỷ lệ đối chiếu trong Meta.",
        ],
        outcome: "Có thêm doanh thu quy thuộc và ROAS offline để tối ưu quảng cáo.",
      },
    ],
    requiredFields: [
      { key: "order_id", label: "Mã hóa đơn", source: "PosApp", purpose: "Nhận diện một đơn và chống ghi trùng" },
      { key: "paid_at", label: "Thời gian thanh toán", source: "PosApp", purpose: "Đối chiếu đúng thời điểm chiến dịch" },
      { key: "net_revenue", label: "Doanh thu thuần", source: "PosApp", purpose: "Tính doanh thu và ROAS" },
      { key: "promo_code", label: "Mã chiến dịch / ưu đãi", source: "Thu ngân + PosApp", purpose: "Cầu nối trực tiếp từ Meta sang hóa đơn" },
      { key: "campaign_id", label: "Mã chiến dịch / nội dung Meta", source: "Meta", purpose: "Biết quảng cáo hoặc bài nào tạo đơn" },
      { key: "customer_match", label: "SĐT hoặc email đã băm (không bắt buộc)", source: "PosApp CRM", purpose: "Tăng khả năng Meta đối chiếu giao dịch offline" },
    ],
  };
}

export function computeCommunityQuality(rows: ContentItem[]): CommunityQuality {
  const total = (key: "views" | "likes" | "comments" | "shares" | "saves" | "follows") =>
    rows.reduce((sum, row) => sum + (row[key] ?? 0), 0);
  const views = total("views");
  const likes = total("likes");
  const comments = total("comments");
  const shares = total("shares");
  const saves = total("saves");
  const follows = total("follows");
  const highIntentActions = shares + saves;
  return {
    samplePosts: rows.length,
    views,
    likes,
    comments,
    shares,
    saves,
    follows,
    highIntentActions,
    highIntentPerThousandViews: views ? (highIntentActions / views) * 1_000 : null,
    conversationPerThousandViews: views ? (comments / views) * 1_000 : null,
    followPerThousandViews: views ? (follows / views) * 1_000 : null,
  };
}

export function computeOperationalMetrics(rows: RevenueDay[]): OperationalMetrics {
  const tradingRows = rows.filter((row) => row.netRevenue > 0 || row.orders > 0);
  const netRevenue = rows.reduce((sum, row) => sum + row.netRevenue, 0);
  const orders = rows.reduce((sum, row) => sum + row.orders, 0);
  const discounts = rows.reduce((sum, row) => sum + row.discounts, 0);
  const mean = safeDivide(netRevenue, tradingRows.length);
  const standardDeviation = mean === null
    ? null
    : Math.sqrt(
        tradingRows.reduce((sum, row) => sum + (row.netRevenue - mean) ** 2, 0) /
          tradingRows.length,
      );
  const weekendRevenue = rows
    .filter((row) => [0, 5, 6].includes(new Date(`${row.date}T00:00:00Z`).getUTCDay()))
    .reduce((sum, row) => sum + row.netRevenue, 0);

  return {
    calendarDays: rows.length,
    tradingDays: tradingRows.length,
    revenuePerTradingDay: safeDivide(netRevenue, tradingRows.length),
    ordersPerTradingDay: safeDivide(orders, tradingRows.length),
    activeDayRate: safeDivide(tradingRows.length, rows.length),
    revenueCoefficientOfVariation:
      mean === null || standardDeviation === null ? null : safeDivide(standardDeviation, mean),
    weekendRevenueShare: safeDivide(weekendRevenue, netRevenue),
    discountPerOrder: safeDivide(discounts, orders),
  };
}

export function computePlatformEfficiency(rows: SocialDay[], platform: Platform): PlatformEfficiency {
  const platformRows = rows.filter((row) => row.platform === platform && (row.views ?? 0) > 0);
  const comparable = platformRows.filter((row) => row.interactions !== null);
  const comparableViews = comparable.reduce((sum, row) => sum + (row.views ?? 0), 0);
  const interactions = comparable.reduce((sum, row) => sum + (row.interactions ?? 0), 0);
  const clickRows = platformRows.filter((row) => row.linkClicks !== null);
  const clickViews = clickRows.reduce((sum, row) => sum + (row.views ?? 0), 0);
  const clicks = clickRows.reduce((sum, row) => sum + (row.linkClicks ?? 0), 0);
  const followRows = platformRows.filter((row) => row.follows !== null);
  const followViews = followRows.reduce((sum, row) => sum + (row.views ?? 0), 0);
  const follows = followRows.reduce((sum, row) => sum + (row.follows ?? 0), 0);

  return {
    comparableDays: comparable.length,
    engagementRate: safeDivide(interactions, comparableViews),
    clickThroughRate: safeDivide(clicks, clickViews),
    followPerThousandViews:
      followViews === 0 ? null : (follows / followViews) * 1_000,
  };
}

export function buildSocialEfficiencyRows(platforms: Record<Platform, PlatformEfficiency>): SocialEfficiencyRow[] {
  const perThousand = (value: number | null) => value === null ? null : value * 1_000;
  return [
    { metric: "Tương tác", instagram: perThousand(platforms.instagram.engagementRate), facebook: perThousand(platforms.facebook.engagementRate) },
    { metric: "Nhấp link", instagram: perThousand(platforms.instagram.clickThroughRate), facebook: perThousand(platforms.facebook.clickThroughRate) },
    { metric: "Theo dõi", instagram: platforms.instagram.followPerThousandViews, facebook: platforms.facebook.followPerThousandViews },
  ];
}

export function computeWeekdayPerformance(rows: RevenueDay[]): WeekdayPerformance[] {
  return Array.from({ length: 7 }, (_, weekday) => {
    const activeRows = rows.filter(
      (row) => row.orders > 0 && new Date(`${row.date}T00:00:00Z`).getUTCDay() === weekday,
    );
    const orders = activeRows.reduce((sum, row) => sum + row.orders, 0);
    const netRevenue = activeRows.reduce((sum, row) => sum + row.netRevenue, 0);
    return {
      weekday,
      activeDays: activeRows.length,
      ordersPerActiveDay: safeDivide(orders, activeRows.length),
      averageOrderValue: safeDivide(netRevenue, orders),
      netRevenue,
    };
  });
}

export function buildDataReadiness(data: InsightData): DataReadiness {
  const unavailable = new Set(data.quality.unavailableFields ?? []);
  const dimensions: ReadinessDimension[] = [
    {
      code: "unit-economics", label: "Giá vốn & biên món", status: unavailable.has("cogs") ? "missing" : "ready", priority: "critical", weight: 15,
      impact: "Không biết món nào thật sự tạo lợi nhuận hoặc nên điều chỉnh giá.",
      missingFields: ["recipe_id", "ingredient_cost", "waste_cost", "gross_margin"],
      collectionPlan: "Chuẩn hóa công thức và giá nhập; đẩy giá vốn món vào PosApp.", owner: "Bar + Kế toán", cadence: "Mỗi lần đổi giá nhập",
    },
    {
      code: "attribution", label: "Marketing → đơn hàng", status: unavailable.has("attributedRevenue") ? "missing" : "partial", priority: "critical", weight: 15,
      impact: "Không tính được CAC, doanh thu quy thuộc hay hiệu quả ngân sách.",
      missingFields: ["utm_campaign", "content_id", "promo_code", "order_source"],
      collectionPlan: "Dùng UTM/mã ưu đãi riêng và bắt buộc chọn nguồn trên đơn.", owner: "Marketing + Thu ngân", cadence: "Mỗi chiến dịch / mỗi đơn",
    },
    {
      code: "guest-table", label: "Khách & vòng quay bàn", status: unavailable.has("physicalTableTurns") ? "missing" : "partial", priority: "critical", weight: 10,
      impact: "Không biết khách/bàn, thời gian sử dụng bàn và doanh thu trên ghế.",
      missingFields: ["table_id", "party_size", "seat_count", "opened_at", "closed_at"],
      collectionPlan: "Bắt buộc chọn bàn, số khách và giữ thời điểm mở/đóng bill.", owner: "Vận hành", cadence: "Mỗi đơn",
    },
    {
      code: "order-integrity", label: "Tính toàn vẹn đơn", status: data.revenue.length ? "partial" : "missing", priority: "high", weight: 10,
      impact: "Một số ngày phải đối chiếu thủ công; AOV theo ngày dễ sai nếu thiếu timestamp.",
      missingFields: ["created_at", "paid_at", "order_status", "channel"],
      collectionPlan: "Xuất order-level cố định với ID và kiểm tra created/paid timestamp.", owner: "Vận hành + Data", cadence: "Hàng ngày",
    },
    {
      code: "product-taxonomy", label: "Danh mục sản phẩm", status: data.products.length ? "partial" : "missing", priority: "high", weight: 10,
      impact: "Tên trùng/khác hoa thường làm phân mảnh doanh thu sản phẩm.",
      missingFields: ["product_id", "canonical_name", "category", "recipe_id"],
      collectionPlan: "Dùng ID ổn định, tên chuẩn và nhóm menu bắt buộc.", owner: "Bar manager", cadence: "Khi tạo/sửa món",
    },
    {
      code: "social-coverage", label: "Độ phủ social", status: data.social.length ? "partial" : "missing", priority: "high", weight: 5,
      impact: "Metric có cửa sổ khác nhau nên tỷ lệ dài hạn không hoàn toàn đồng nhất.",
      missingFields: ["metric_coverage_start", "organic_views", "paid_views", "post_id"],
      collectionPlan: "Lưu snapshot theo ngày với ID nội dung và cờ organic/paid.", owner: "Marketing", cadence: "Hàng tuần",
    },
    {
      code: "community-signals", label: "Story, hội thoại & UGC", status: data.content.some((item) => item.comments !== null || item.shares !== null || item.saves !== null) ? "partial" : "missing", priority: "high", weight: 5,
      impact: "Chưa biết nội dung nào tạo hội thoại, truyền miệng, lượt khách tag quán hoặc yêu cầu cần phản hồi.",
      missingFields: ["story_replies", "story_link_taps", "mentions", "tags", "reposts", "dm_starts", "response_minutes", "sentiment"],
      collectionPlan: "Chụp số liệu Story hàng tuần; tổng hợp mention/tag/repost và log thời gian phản hồi inbox, không lưu nội dung riêng tư của khách.", owner: "Marketing + Community", cadence: "Hàng ngày / hàng tuần",
    },
    {
      code: "ad-conversion", label: "Chuyển đổi quảng cáo", status: unavailable.has("attributedRevenue") ? "missing" : "partial", priority: "high", weight: 5,
      impact: "Chỉ có spend/result; chưa có purchase và attributed revenue.",
      missingFields: ["campaign_id", "ad_id", "purchase", "attributed_revenue"],
      collectionPlan: "Thiết kế conversion offline hoặc map mã ưu đãi về campaign.", owner: "Marketing", cadence: "Mỗi chiến dịch",
    },
    {
      code: "customer", label: "Khách quay lại", status: unavailable.has("uniqueGuests") ? "missing" : "partial", priority: "medium", weight: 5,
      impact: "Không tính được repeat rate, tần suất ghé hay LTV.",
      missingFields: ["customer_id", "first_visit", "visit_count", "consent"],
      collectionPlan: "Thu số điện thoại/ID có đồng ý và nối vào hóa đơn.", owner: "CRM + Vận hành", cadence: "Mỗi khách đồng ý",
    },
    {
      code: "labor-inventory", label: "Nhân sự & hao hụt", status: "missing", priority: "medium", weight: 5,
      impact: "Không đo được doanh thu/giờ công, waste và hiệu quả tồn kho.",
      missingFields: ["labor_hours", "labor_cost", "waste_qty", "stock_variance"],
      collectionPlan: "Kết nối lịch ca với chấm công; ghi waste và kiểm kê định kỳ.", owner: "Quản lý ca + Kho", cadence: "Theo ca / hàng tuần",
    },
    {
      code: "revenue", label: "Doanh thu theo ngày", status: data.revenue.length ? "ready" : "missing", priority: "medium", weight: 15,
      impact: "Đủ để theo dõi xu hướng doanh thu, giảm giá và ngày bán.",
      missingFields: [], collectionPlan: "Duy trì snapshot và checksum hiện tại.", owner: "Kế toán", cadence: "Hàng ngày",
    },
  ];
  const statusValue = { ready: 1, partial: 0.5, missing: 0 } as const;
  const score = dimensions.reduce((sum, item) => sum + item.weight * statusValue[item.status], 0);
  return {
    score,
    dimensions,
    readyWeight: dimensions.filter((item) => item.status === "ready").reduce((sum, item) => sum + item.weight, 0),
    partialWeight: dimensions.filter((item) => item.status === "partial").reduce((sum, item) => sum + item.weight, 0),
    missingWeight: dimensions.filter((item) => item.status === "missing").reduce((sum, item) => sum + item.weight, 0),
  };
}
