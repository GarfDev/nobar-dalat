import advertising from "~/data/insights/advertising-performance.json";
import content from "~/data/insights/content-performance.json";
import products from "~/data/insights/product-performance.json";
import quality from "~/data/insights/data-quality.json";
import revenue from "~/data/insights/revenue-daily.json";
import social from "~/data/insights/social-daily.json";
import tiktok from "~/data/insights/tiktok-snapshot.json";

import { validateInsightData } from "./data-validation";
import type { InsightData, TikTokSnapshot } from "./types";

export const insightData = {
  revenue,
  social,
  products,
  content,
  advertising,
  quality,
} as InsightData;

export const dataCoverage = validateInsightData(insightData);
export const tiktokSnapshot = tiktok as TikTokSnapshot;
