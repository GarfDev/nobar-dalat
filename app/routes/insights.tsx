import { OverviewReport } from "~/modules/insights/business-reports";
import "~/modules/insights/insights.css";

export function meta() {
  return [
    { title: "NObar · Báo cáo tổng hợp" },
    { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Báo cáo vận hành nội bộ NObar." },
  ];
}

export default function InsightsRoute() {
  return <OverviewReport />;
}
