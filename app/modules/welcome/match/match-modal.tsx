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
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showEula, setShowEula] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert(t("match.eula.alert"));
      return;
    }
    if (!privacyAgreed) {
      alert(t("match.privacy.alert"));
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
            className="relative w-full max-w-md bg-black border border-white rounded-none p-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-white/60 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-widest font-['iCiel_Novecento_sans']">
              {t("match.title")}
            </h2>
            <p className="text-white/60 text-xs mb-6 uppercase tracking-wider font-['iCiel_Novecento_sans']">
              {t("match.subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white mb-1 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
                    {t("match.name")}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-black border-b border-white/30 rounded-none px-0 py-1.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-sm"
                    placeholder={t("match.namePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white mb-1 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
                    {t("match.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-black border-b border-white/30 rounded-none px-0 py-1.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white transition-colors text-sm"
                    placeholder={t("match.emailPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white mb-2 uppercase tracking-[0.2em] font-['iCiel_Novecento_sans']">
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
                          "px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 font-bold",
                          isSelected
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white border-white/30 hover:border-white",
                        )}
                      >
                        {lang.label}
                        {isSelected && <Check size={10} />}
                      </button>
                    );
                  })}
                </div>
                {formData.languages.length === 0 && (
                  <p className="text-red-500 text-[10px] mt-1 uppercase tracking-wider">
                    {t("match.selectLanguage")}
                  </p>
                )}
              </div>

              {/* Checkboxes Group */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* EULA Checkbox */}
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="eula-agreement"
                      required
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer h-3.5 w-3.5 cursor-pointer appearance-none border border-white/50 bg-transparent checked:bg-white checked:border-white transition-all rounded-none"
                    />
                    <Check
                      size={10}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100"
                    />
                  </div>
                  <div className="text-[10px] text-white/60 leading-relaxed uppercase tracking-wide">
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

                {/* Privacy Checkbox */}
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="privacy-agreement"
                      required
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="peer h-3.5 w-3.5 cursor-pointer appearance-none border border-white/50 bg-transparent checked:bg-white checked:border-white transition-all rounded-none"
                    />
                    <Check
                      size={10}
                      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100"
                    />
                  </div>
                  <div className="text-[10px] text-white/60 leading-relaxed uppercase tracking-wide">
                    <label
                      htmlFor="privacy-agreement"
                      className="cursor-pointer hover:text-white transition-colors"
                    >
                      {t("match.privacy.text")}{" "}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white transition-colors ml-1 font-bold"
                    >
                      {t("match.privacy.link")}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  formData.languages.length === 0 ||
                  !agreed ||
                  !privacyAgreed
                }
                className="w-full mt-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] py-3 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
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
      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setShowPrivacy(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-black border border-white rounded-none p-8 shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden max-h-[80vh] flex flex-col"
            >
              <button
                onClick={() => setShowPrivacy(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-white mb-6 uppercase tracking-widest font-['iCiel_Novecento_sans']">
                {t("match.privacy.modalTitle")}
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm text-white/70 leading-relaxed font-sans">
                <p>
                  <strong>{t("match.privacy.content.1")}</strong>
                </p>
                <p>
                  <strong>{t("match.privacy.content.2")}</strong>
                </p>
                <p>
                  <strong>{t("match.privacy.content.3")}</strong>
                </p>
                <p>
                  <strong>{t("match.privacy.content.4")}</strong>
                </p>
                <p>
                  <strong>{t("match.privacy.content.5")}</strong>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    setPrivacyAgreed(true);
                    setShowPrivacy(false);
                  }}
                  className="bg-white text-black font-bold px-6 py-2 rounded-none hover:bg-gray-200 transition-colors uppercase tracking-wider"
                >
                  {t("match.privacy.agree")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
