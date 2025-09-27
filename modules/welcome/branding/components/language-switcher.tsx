import cn from "classnames";
import { useLanguageStore } from "~/store/language";

enum LANGUAGES {
  EN = "en",
  VI = "vi",
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (language: LANGUAGES) => {
    setLanguage(language);
  };

  return (
    <div className="flex">
      <h5
        onClick={handleLanguageChange.bind(null, LANGUAGES.EN)}
        className={cn(
          "text-white text-2xl cursor-pointer",
          language === LANGUAGES.EN ? "opacity-100" : "opacity-60",
        )}
      >
        EN
      </h5>
      <h5 className="text-white mx-2 text-2xl opacity-60">/</h5>
      <h5
        onClick={handleLanguageChange.bind(null, LANGUAGES.VI)}
        className={cn(
          "text-white text-2xl cursor-pointer",
          language === LANGUAGES.VI ? "opacity-100" : "opacity-60",
        )}
      >
        VI
      </h5>
    </div>
  );
}
