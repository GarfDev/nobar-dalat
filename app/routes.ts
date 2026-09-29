import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("unlock", "routes/unlock.tsx"),
  // Keep every non-homepage page in this layout so client navigation is guarded too.
  layout("routes/protected.tsx", [
    route("expenses", "routes/expenses.tsx"),
    route("insights", "routes/insights.tsx"),
    route("insights/finance", "routes/finance-insights.tsx"),
    route("insights/marketing", "routes/marketing-insights.tsx"),
  ]),
  route(":lang", "routes/lang.tsx"),
] satisfies RouteConfig;
