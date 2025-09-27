import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

enum LANGUAGES {
  EN = "en",
  VI = "vi",
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || "en";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (language: LANGUAGES) => {
    void i18n.changeLanguage(language);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("i18nextLng", language);
      } catch {}
    }
  };

  const isENActive = mounted && current === LANGUAGES.EN;
  const isVIActive = mounted && current === LANGUAGES.VI;

  return (
    <div className="flex">
      <h5
        onClick={handleLanguageChange.bind(null, LANGUAGES.EN)}
        className={cn(
          "text-white text-2xl cursor-pointer select-none transition-all",
          isENActive ? "opacity-100" : "opacity-60",
        )}
      >
        EN
      </h5>
      <h5 className="text-white mx-2 text-2xl opacity-60 select-none">/</h5>
      <h5
        onClick={handleLanguageChange.bind(null, LANGUAGES.VI)}
        className={cn(
          "text-white text-2xl cursor-pointer select-none transition-all",
          isVIActive ? "opacity-100" : "opacity-60",
        )}
      >
        VI
      </h5>
    </div>
  );
}
