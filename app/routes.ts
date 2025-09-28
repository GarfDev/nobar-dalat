import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/carousel-content", "routes/api.carousel-content.ts"),
  route(":lang", "routes/lang.tsx"),
] satisfies RouteConfig;
