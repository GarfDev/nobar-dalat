import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMatchStore, type UserProfile } from "./store";
import cn from "classnames";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
];

export function MatchModal() {
  const { isOpen, setIsOpen, startSearching, setUserProfile } = useMatchStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    languages: [],
  });

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showEula, setShowEula] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert(t("match.eula.alert"));
      return;
    }
    setLoading(true);

    setUserProfile(formData);

    // Start searching (Supabase logic inside store)
    await startSearching();

    setLoading(false);
    setIsOpen(false);
  };

  const toggleLanguage = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(code)
        ? prev.languages.filter((l) => l !== code)
        : [...prev.languages, code],
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">
              {t("match.title")}
            </h2>
            <p className="text-white/60 text-sm mb-6">{t("match.subtitle")}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">
                  {t("match.name")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder={t("match.namePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">
                  {t("match.email")}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder={t("match.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                  {t("match.languages")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = formData.languages.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleLanguage(lang.code)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-all duration-200 flex items-center gap-2",
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white/60 border-white/20 hover:border-white/40",
                        )}
                      >
                        {lang.label}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
                {formData.languages.length === 0 && (
                  <p className="text-red-400 text-xs mt-1">
                    {t("match.selectLanguage")}
                  </p>
                )}
              </div>

              {/* EULA Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="eula-agreement"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/20 bg-transparent checked:border-white checked:bg-white transition-all"
                  />
                  <Check
                    size={12}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100"
                  />
                </div>
                <div className="text-xs text-white/60 leading-tight select-none">
                  <label htmlFor="eula-agreement" className="cursor-pointer">
                    {t("match.eula.text")}{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEula(true)}
                    className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white transition-colors"
                  >
                    {t("match.eula.link")}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.languages.length === 0 || !agreed}
                className="w-full mt-6 bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {t("match.processing")}
                  </>
                ) : (
                  t("match.submit")
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* EULA Modal */}
      <AnimatePresence>
        {showEula && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setShowEula(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <button
                onClick={() => setShowEula(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                {t("match.eula.modalTitle")}
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-white/70 leading-relaxed">
                <p>
                  <strong>{t("match.eula.content.1")}</strong>
                </p>
                <p>
                  <strong>{t("match.eula.content.2")}</strong>
                </p>
                <p>
                  <strong>{t("match.eula.content.3")}</strong>
                </p>
                <p>
                  <strong>{t("match.eula.content.4")}</strong>
                </p>
                <p>
                  <strong>{t("match.eula.content.5")}</strong>
                </p>
                <p>
                  <strong>{t("match.eula.content.6")}</strong>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setAgreed(true);
                    setShowEula(false);
                  }}
                  className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t("match.eula.agree")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
