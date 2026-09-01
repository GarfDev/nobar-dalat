import { InsightsPage } from "~/modules/insights/insights-page";
import "~/modules/insights/insights.css";

export function meta() {
  return [
    { title: "NObar · Marketing & F&B Insights" },
    { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Báo cáo vận hành nội bộ NObar." },
  ];
}

export default function InsightsRoute() {
  return <InsightsPage />;
}
