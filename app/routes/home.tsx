import type { Route } from "./+types/home";

// Import internal modules
import { Welcome } from "../modules/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nobar - there nothing inside nothing" },
    { name: "description", content: "from da lat" },
  ];
}

export default function Home() {
  return <Welcome />;
}
