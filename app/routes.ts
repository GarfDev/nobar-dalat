import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":lang", "routes/lang.tsx"),
] satisfies RouteConfig;
