export type ISODate = `${number}-${number}-${number}`;
export type Platform = "facebook" | "instagram";
export type MarketingPlatform = Platform | "tiktok";
export type DateRange = { start: ISODate; end: ISODate };

export type RevenueDay = {
  date: ISODate;
  grossRevenue: number;
  refunds: number;
  discounts: number;
  netRevenue: number;
  tax: number;
  orders: number;
  cogs: number | null;
};

export type SocialDay = {
  date: ISODate;
  platform: Platform;
  views: number | null;
  audience: number | null;
  audienceLabel: "viewers" | "reach";
  interactions: number | null;
  visits: number | null;
  linkClicks: number | null;
  follows: number | null;
};

export type ProductPerformance = {
  startDate: ISODate;
  endDate: ISODate;
  product: string;
  category: string | null;
  quantity: number;
  revenue: number;
  discounts: number | null;
};

export type ContentItem = {
  id: string;
  date: ISODate;
  platform: Platform;
  format: "post" | "carousel" | "reel" | "story" | "other";
  label: string;
  views: number | null;
  audience: number | null;
  interactions: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  follows: number | null;
  averageWatchSeconds: number | null;
  paidViews: number | null;
};

export type AdvertisingItem = {
  id: string;
  startDate: ISODate;
  endDate: ISODate;
  platform: Platform | "meta";
  label: string;
  spend: number;
  resultType: string | null;
  results: number | null;
  views: number | null;
  audience: number | null;
  trackedPurchases: number | null;
  attributedRevenue: number | null;
  deliveryStatus: string;
};

export type DataQuality = {
  generatedAt: ISODate;
  notes: string[];
  sourceTimezones?: Record<string, string>;
  unavailableFields?: string[];
};

export type InsightData = {
  revenue: RevenueDay[];
  social: SocialDay[];
  products: ProductPerformance[];
  content: ContentItem[];
  advertising: AdvertisingItem[];
  quality: DataQuality;
};

export type SourceCoverage = {
  start: ISODate;
  end: ISODate;
  rows: number;
};

export type DataCoverage = {
  revenue: SourceCoverage | null;
  social: SourceCoverage | null;
  products: SourceCoverage | null;
  content: SourceCoverage | null;
  advertising: SourceCoverage | null;
};

export type TikTokPostSnapshot = {
  id: string;
  date: ISODate;
  label: string;
  durationSeconds: number;
  views: number;
  viewsApproximate: boolean;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  averageWatchSeconds: number;
  completionRate: number;
  newFollowers: number;
};

export type TikTokSnapshot = {
  period: DateRange;
  updatedAt: ISODate;
  approximateTotals: boolean;
  totals: {
    videoViews: number;
    profileViews: number;
    likes: number;
    comments: number;
    shares: number;
  };
  trafficSources: Array<{ source: string; share: number }>;
  topPosts: TikTokPostSnapshot[];
};
