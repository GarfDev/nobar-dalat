import cn from "classnames";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

enum LANGUAGES {
  EN = "en",
  VI = "vi",
}

function normalizeLang(lng?: string): LANGUAGES {
  const base = (lng || "en").toLowerCase().replace("_", "-").split("-")[0];
  return base === LANGUAGES.VI ? LANGUAGES.VI : LANGUAGES.EN;
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<LANGUAGES>(LANGUAGES.EN);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep current language in sync with URL first, then i18n as fallback
  useEffect(() => {
    const seg = location.pathname.split("/")[1]?.toLowerCase();
    if (seg === LANGUAGES.EN || seg === LANGUAGES.VI) {
      setCurrent(seg as LANGUAGES);
      return;
    }
    const init = normalizeLang(i18n.resolvedLanguage || i18n.language);
    setCurrent(init);
  }, [location.pathname, i18n.resolvedLanguage, i18n.language]);

  const handleLanguageChange = (language: LANGUAGES) => {
    // Route drives language; the lang route sets i18n based on the segment.
    navigate(`/${language}`);
  };

  const isENActive = mounted && current === LANGUAGES.EN;
  const isVIActive = mounted && current === LANGUAGES.VI;

  return (
    <div className="flex">
      <h5
        onClick={() => handleLanguageChange(LANGUAGES.EN)}
        className={cn(
          "text-white text-2xl cursor-pointer select-none transition-all",
          isENActive ? "opacity-100" : "opacity-60",
        )}
      >
        EN
      </h5>
      <h5 className="text-white mx-2 text-2xl opacity-60 select-none">/</h5>
      <h5
        onClick={() => handleLanguageChange(LANGUAGES.VI)}
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
