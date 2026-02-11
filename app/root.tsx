import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type { Route } from "./+types/root";
import "./app.css";
import i18next from "./i18n";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preload",
    href: "/fonts/icel-novecentosans/iCielNovecentosans-Normal.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_1.png",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_2.png",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_3.png",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_4.png",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_5.png",
  },
  {
    rel: "preload",
    as: "image",
    href: "/images/menu/image_6.png",
  },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "192x192",
    href: "/android-chrome-192x192.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "512x512",
    href: "/android-chrome-512x512.png",
  },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "manifest", href: "/site.webmanifest" },
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
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-MRG47XB3N5"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MRG47XB3N5');
            `,
          }}
        />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K7T6CHDN');`,
          }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K7T6CHDN"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
        <SpeedInsights />
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
