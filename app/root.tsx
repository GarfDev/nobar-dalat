import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import i18next from "./i18n";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
];

function pickClientLanguage() {
  try {
    const stored = window.localStorage.getItem("i18nextLng");
    const nav = navigator.language?.split("-")[0];
    const candidate = (stored || nav || i18next.language || "en").toLowerCase();
    const base = candidate.replace("_", "-").split("-")[0];
    const supported = (i18next.options.supportedLngs || []) as string[];
    return supported.includes(base) ? base : "en";
  } catch {
    return "en";
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // Client-only: after hydration, switch to user's preferred language to avoid hydration mismatch.
  if (typeof window !== "undefined") {
    // If user is at root ("/"), push them to their language-prefixed path.
    if (window.location.pathname === "/") {
      const desired = pickClientLanguage();
      const target = `/${desired}`;
      if (window.location.pathname !== target) {
        window.history.replaceState(null, "", target);
      }
      if (i18next.language !== desired) {
        void i18next.changeLanguage(desired);
      }
    } else {
      // Otherwise just ensure i18n matches the URL-based language set by lang route
      const seg = window.location.pathname.split("/")[1]?.toLowerCase();
      if (seg === "en" || seg === "vi") {
        if (i18next.language !== seg) void i18next.changeLanguage(seg);
      }
    }
  }

  return (
    <>
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
