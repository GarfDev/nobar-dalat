import type { Route } from "./+types/home";
import { redirect } from "react-router";

// Import internal modules

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  // Prefer an explicit language choice, then the browser language.
  let lang = "en";
  try {
    const stored = window.localStorage.getItem("i18nextLng")?.toLowerCase().replace("_", "-").split("-")[0];
    if (stored === "vi" || stored === "en") lang = stored;
    else if (navigator.language?.split("-")[0].toLowerCase() === "vi") lang = "vi";
  } catch {
    if (typeof navigator !== "undefined" && navigator.language?.split("-")[0].toLowerCase() === "vi") lang = "vi";
  }

  url.pathname = `/${lang}`;
  throw redirect(url.toString());
}

export function meta() {
  return [
    { title: "No Bar Đà Lạt - Vietnamese identity intact" },
    { name: "description", content: "from da lat" },
  ];
}

export default function Home() {
  return null;
}
