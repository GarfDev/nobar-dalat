import type { Route } from "./+types/lang";
import { useEffect } from "react";
import { redirect, useLoaderData } from "react-router";
import i18next from "../i18n";
import { Welcome } from "../modules/welcome";
import { I18nextProvider } from "react-i18next";

const SUPPORTED = new Set(["en", "vi"]);

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const lang = (params.lang || "en").toLowerCase();
  if (!SUPPORTED.has(lang)) {
    const url = new URL(request.url);
    url.pathname = "/en";
    throw redirect(url.toString());
  }

  // Preload translation resources on the server for SSR so first render has correct language
  let resources: Record<string, any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Fallback to fetching from the dev server/static if filesystem read fails
  if (!resources) {
    try {
      const url = new URL(`/locales/${lang}/translation.json`, request.url);
      const res = await fetch(url.toString());
      if (res.ok) {
        resources = (await res.json()) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    } catch {
      // ignore
    }
  }

  if (resources) {
    i18next.addResourceBundle(lang, "translation", resources);
  }
  await i18next.changeLanguage(lang);

  const t = i18next.getFixedT(lang);
  const title = t("meta_title", "No Bar - vietnamese identity intact");
  const description = t("meta_description", "not a bar from da lat");
  const keywords = t(
    "meta_keywords",
    "nobar, da lat, restaurant, bar, vietnamese, modern, cuisine",
  );

  return { lang, resources, title, description, keywords };
}

export function meta({ data }: Route.MetaArgs) {
  const currentLang = data?.lang || "en";
  const canonicalUrl = `https://nobardalat.com/${currentLang}`;

  return [
    { title: data?.title || "Nobar - there nothing inside nothing" },
    { name: "description", content: data?.description || "from da lat" },
    { name: "keywords", content: data?.keywords },
    { name: "og:locale", content: currentLang === "vi" ? "vi_VN" : "en_US" },
    // Canonical & Hreflang
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    {
      tagName: "link",
      rel: "alternate",
      hreflang: "en",
      href: "https://nobardalat.com/en",
    },
    {
      tagName: "link",
      rel: "alternate",
      hreflang: "vi",
      href: "https://nobardalat.com/vi",
    },
    {
      tagName: "link",
      rel: "alternate",
      hreflang: "x-default",
      href: "https://nobardalat.com/en",
    },
    // Open Graph tags
    {
      property: "og:title",
      content: data?.title || "Nobar - there nothing inside nothing",
    },
    { property: "og:description", content: data?.description || "from da lat" },
    { property: "og:type", content: "website" },
    {
      property: "og:url",
      content: canonicalUrl,
    },
    {
      property: "og:image",
      content: "https://nobardalat.com/images/nobar-logo-color.png",
    },
    // Twitter Card tags
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: data?.title || "Nobar - there nothing inside nothing",
    },
    {
      name: "twitter:description",
      content: data?.description || "from da lat",
    },
    {
      name: "twitter:image",
      content: "https://nobardalat.com/images/nobar-logo-color.png",
    },
    // JSON-LD for Local Business
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Bar",
        name: "No bar Đà Lạt",
        description: data?.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: "61-63 Trương Công Định, Phường 1",
          addressLocality: "Đà Lạt",
          addressRegion: "Lâm Đồng",
          postalCode: "670000",
          addressCountry: "VN",
        },
        telephone: "+84 98 247 70 73",
        servesCuisine: "Vietnamese",
        priceRange: "$$ - $$$",
        url: "https://nobardalat.com",
        image: "https://nobardalat.com/images/nobar-logo-color.png",
        sameAs: [
          "https://www.instagram.com/nobardalat/",
          "https://www.facebook.com/nobardalat",
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "19:00",
            closes: "01:30",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Wednesday",
            opens: "21:00",
            closes: "01:30",
          },
        ],
      },
    },
  ];
}

export default function Lang() {
  const { lang, resources } = useLoaderData() as {
    lang: string;
    resources: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  useEffect(() => {
    if (i18next.language !== lang) {
      i18next.changeLanguage(lang);
    }
  }, [lang]);

  return (
    <I18nextProvider i18n={i18next}>
      <Welcome />
    </I18nextProvider>
  );
}
