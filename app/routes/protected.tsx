import type { Route } from "./+types/protected";
import { Outlet } from "react-router";
import { checkAccess } from "~/lib/access.server";

export async function loader({ request }: Route.LoaderArgs) {
  const response = await checkAccess(request);
  if (response) throw response;
  return null;
}

export default function ProtectedRoute() {
  return <Outlet />;
}
