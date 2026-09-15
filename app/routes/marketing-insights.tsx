import { MarketingDeepDivePage } from "~/modules/insights/marketing-deep-dive-page";
import "~/modules/insights/marketing-deep-dive.css";
import "~/modules/insights/insights.css";

export function meta() {
  return [
    { title: "NObar · Báo cáo marketing" },
    { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Phân tích tăng trưởng marketing nội bộ NObar." },
  ];
}

export default function MarketingInsightsRoute() {
  return <MarketingDeepDivePage />;
}
