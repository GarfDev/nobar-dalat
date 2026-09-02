import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("insights", "routes/insights.tsx"),
  route("insights/marketing", "routes/marketing-insights.tsx"),
  route(":lang", "routes/lang.tsx"),
] satisfies RouteConfig;
