import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="concept"
      className="h-[100vh] w-[100vw] bg-black text-white flex items-center justify-center relative overflow-hidden"
    >
      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none z-0">
        <span className="text-[30vw] font-bold uppercase leading-none whitespace-nowrap">
          NO BAR
        </span>
      </div>

      <div className="max-w-4xl w-full px-6 md:px-8 flex flex-col items-center text-center z-10">
        {/* Title Group */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 md:mb-12 flex flex-col items-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-bold uppercase tracking-tighter mb-4 md:mb-6">
            {t("concept.title")}
          </h2>
          
          <motion.div 
            initial={{ height: 0 }}
            whileInView={{ height: 64 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-[1px] bg-white/40 mb-4 md:mb-6 h-8 md:h-16"
          />
          
          <h3 className="text-sm sm:text-lg md:text-2xl font-light uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/80">
            {t("concept.subtitle")}
          </h3>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative"
        >
          <p className="text-xs sm:text-sm md:text-lg font-light leading-relaxed md:leading-loose text-white/60 max-w-xl mx-auto px-4 md:px-0">
            {t("concept.description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
