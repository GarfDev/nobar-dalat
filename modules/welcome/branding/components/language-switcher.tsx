import { useLanguageStore } from "~/store/language";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <select value={language} onChange={handleLanguageChange}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
}
