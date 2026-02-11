import type { Route } from "./+types/home";
import { redirect } from "react-router";

// Import internal modules
import { Welcome } from "../modules/welcome";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);

  // Detect browser language
  let lang = "en";
  if (typeof navigator !== "undefined" && navigator.language) {
    const browserLang = navigator.language.split("-")[0].toLowerCase();
    if (browserLang === "vi") {
      lang = "vi";
    }
  }

  url.pathname = `/${lang}`;
  throw redirect(url.toString());
}

export function meta() {
  return [
    { title: "Nobar - Vietnamese identity intact" },
    { name: "description", content: "from da lat" },
  ];
}

export default function Home() {
  return <Welcome />;
}
