import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import cn from "classnames";

export function AgeVerificationModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem("age-verified");
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("show-age-modal") === "true";
    const reset = urlParams.get("reset-age") === "true";

    if (reset) {
      localStorage.removeItem("age-verified");
    }

    if (!isVerified || forceShow || reset) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        document.body.style.overflow = "hidden";
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem("age-verified", "true");
    setIsOpen(false);
    document.body.style.overflow = "unset";
  };

  const handleReject = () => {
    window.location.href = "https://www.google.com";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      >
        {/* Background Video/Image Placeholder - Optional for future */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
        
        {/* Grain overlay for texture */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto">
          
          {/* Main Content Container */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center space-y-12 md:space-y-16 max-w-3xl"
          >
            {/* Logo/Brand Mark */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="mb-4"
            >
              <h2 className="text-sm md:text-base font-bold uppercase tracking-[0.5em] text-white/40">
                No Bar Dalat
              </h2>
            </motion.div>

            {/* Main Question */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter text-white leading-[0.9] font-['iCiel_Novecento_sans']">
                {t("age.title")}
              </h1>
              <div className="h-px w-24 bg-white/20 mx-auto" />
              <p className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-xl mx-auto">
                {t("age.warning")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-md mx-auto">
               <button
                onClick={handleVerify}
                className="group relative w-full md:w-1/2 h-14 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] overflow-hidden transition-all hover:bg-gray-200"
              >
                <span className="relative z-10">{t("age.submit")}</span>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
              </button>
              
              <button
                onClick={handleReject}
                className="group w-full md:w-1/2 h-14 border border-white/20 text-white/40 font-bold text-sm uppercase tracking-[0.2em] hover:text-white hover:border-white transition-all"
              >
                <span>Exit</span>
              </button>
            </div>
            
            <p className="text-[10px] uppercase tracking-widest text-white/20 mt-12">
              By entering, you agree to our Terms & Privacy Policy
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
