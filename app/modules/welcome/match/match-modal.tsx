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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-black border border-white rounded-none p-8 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-white/60 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest font-['iCiel_Novecento_sans']">
              {t("match.title")}
            </h2>
            <p className="text-white/60 text-sm mb-8 uppercase tracking-wider font-['iCiel_Novecento_sans']">
              {t("match.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-white mb-2 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
                  {t("match.name")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-black border-b border-white/30 rounded-none px-0 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-lg"
                  placeholder={t("match.namePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-2 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
                  {t("match.email")}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-black border-b border-white/30 rounded-none px-0 py-2 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-lg"
                  placeholder={t("match.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-3 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
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
                          "px-4 py-2 text-xs uppercase tracking-wider border transition-all duration-200 flex items-center gap-2 font-bold",
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white border-white/30 hover:border-white",
                        )}
                      >
                        {lang.label}
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
                {formData.languages.length === 0 && (
                  <p className="text-red-500 text-xs mt-2 uppercase tracking-wider">
                    {t("match.selectLanguage")}
                  </p>
                )}
              </div>

              {/* EULA Checkbox */}
              <div className="flex items-start gap-3 pt-4 border-t border-white/10">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    id="eula-agreement"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none border border-white/50 bg-transparent checked:bg-white checked:border-white transition-all rounded-none"
                  />
                  <Check
                    size={12}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100"
                  />
                </div>
                <div className="text-xs text-white/60 leading-relaxed uppercase tracking-wide">
                  <label
                    htmlFor="eula-agreement"
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    {t("match.eula.text")}{" "}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEula(true)}
                    className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white transition-colors ml-1 font-bold"
                  >
                    {t("match.eula.link")}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.languages.length === 0 || !agreed}
                className="w-full mt-8 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] py-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
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
