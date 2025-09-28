import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// Remix-style shared i18n configuration
export const i18nConfig = {
  supportedLngs: ["en", "vi"],
  fallbackLng: "en",
  defaultNS: "translation",
  react: { useSuspense: false },
};

const isBrowser = typeof window !== "undefined";

// Initialize i18next in all environments so react-i18next has an instance.
// Only attach HttpBackend in the browser to avoid SSR network fetches/hangs.
if (isBrowser) {
  i18next.use(HttpBackend);
}

void i18next.use(initReactI18next).init({
  ...i18nConfig,
  // Use a fixed language during SSR and initial hydration to prevent mismatches.
  lng: i18nConfig.fallbackLng,
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
  },
  interpolation: { escapeValue: false },
});

export default i18next;
