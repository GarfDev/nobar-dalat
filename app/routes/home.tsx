import type { Route } from "./+types/home";
import { redirect } from "react-router";

// Import internal modules
import { Welcome } from "../modules/welcome";

export async function loader({ request }: Route.LoaderArgs) {
  // For now, default to English when hitting "/" directly
  const url = new URL(request.url);
  url.pathname = "/en";
  throw redirect(url.toString());
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nobar - there nothing inside nothing" },
    { name: "description", content: "from da lat" },
  ];
}

export default function Home() {
  return <Welcome />;
}
