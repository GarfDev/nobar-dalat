import type { Route } from "./+types/lang";
import { useEffect } from "react";
import { redirect, useLoaderData } from "react-router";
import i18next from "../i18n";
import { Welcome } from "../modules/welcome";
import { I18nextProvider } from "react-i18next";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const SUPPORTED = new Set(["en", "vi"]);

export async function loader({ params, request }: Route.LoaderArgs) {
  const lang = (params.lang || "en").toLowerCase();
  if (!SUPPORTED.has(lang)) {
    const url = new URL(request.url);
    url.pathname = "/en";
    throw redirect(url.toString());
  }

  // Preload translation resources on the server for SSR so first render has correct language
  let resources: Record<string, any> | undefined;
  try {
    const fileUrl = new URL(`../../public/locales/${lang}/translation.json`, import.meta.url);
    const filePath = fileURLToPath(fileUrl);
    const json = await readFile(filePath, "utf-8");
    resources = JSON.parse(json) as Record<string, any>;
  } catch {
    // Fallback to fetching from the dev server/static if filesystem read fails
    try {
      const url = new URL(`/locales/${lang}/translation.json`, request.url);
      const res = await fetch(url.toString());
      if (res.ok) {
        resources = (await res.json()) as Record<string, any>;
      }
    } catch {}
  }

  const t = await i18next.getFixedT(lang);
  const title = t("meta_title", "Nobar - there nothing inside nothing");
  const description = t("meta_description", "from da lat");

  return { lang, resources, title, description };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.title || "Nobar - there nothing inside nothing" },
    { name: "description", content: data?.description || "from da lat" },
    { name: "og:locale", content: data?.lang === "vi" ? "vi_VN" : "en_US" },
    {
      name: "keywords",
      content: "nobar, da lat, restaurant, bar, vietnamese, modern, cuisine",
    },
    // Open Graph tags
    { property: "og:title", content: data?.title || "Nobar - there nothing inside nothing" },
    { property: "og:description", content: data?.description || "from da lat" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `https://nobardalat.com/${data?.lang || "en"}` },
    { property: "og:image", content: "https://nobardalat.com/images/nobar-logo-color.png" },
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: data?.title || "Nobar - there nothing inside nothing" },
    { name: "twitter:description", content: data?.description || "from da lat" },
    { name: "twitter:image", content: "https://nobardalat.com/images/nobar-logo-color.png" },
    // JSON-LD for Local Business
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "name": "Nobar Đà Lạt",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "23/1 Đống Đa, Phường 3",
          "addressLocality": "Đà Lạt",
          "addressRegion": "Lâm Đồng",
          "postalCode": "670000",
          "addressCountry": "VN"
        },
        "telephone": "+84 98 247 70 73",
        "servesCuisine": "Vietnamese",
        "priceRange": "$$ - $$$$ ",
        "url": "https://nobardalat.com",
        "image": "https://nobardalat.com/images/nobar-logo-color.png",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "17:00",
            "closes": "23:00"
          }
        ]
      }
    }
  ];
}

export default function LangRoute() {
  const { lang, resources } = useLoaderData<typeof loader>();

  // Create a per-route i18n instance configured to the requested language
  const i18nForRoute = i18next.cloneInstance({ lng: lang, initImmediate: false });
  if (resources) {
    // Ensure SSR has the translation bundle immediately
    try {
      i18nForRoute.addResourceBundle(lang, "translation", resources, true, true);
    } catch {}
  }

  // Sync global instance after mount for non-context consumers (defensive)
  useEffect(() => {
    if (i18next.language !== lang) {
      void i18next.changeLanguage(lang);
      try {
        window.localStorage.setItem("i18nextLng", lang);
      } catch {}
    }
  }, [lang]);

  return (
    <I18nextProvider i18n={i18nForRoute}>
      <Welcome />
    </I18nextProvider>
  );
}
