import { FinanceReport } from "~/modules/insights/business-reports";
import "~/modules/insights/insights.css";
export function meta() { return [{ title: "NObar · Báo cáo tài chính" }, { name: "robots", content: "noindex, nofollow" }]; }
export default function FinanceRoute() { return <FinanceReport />; }

