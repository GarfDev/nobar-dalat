import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="concept"
      className="h-[100vh] w-[100vw] bg-[#654b2acb] text-white backdrop-blur-md flex shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)] gap-10"
    >
      <motion.div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-[480px] lg:max-w-[800px] w-full flex flex-col">
          <div className="text-2xl mb-1 lg:text-5xl font-bold text-center lg:mb-3 uppercase">
            {t("concept.title")}
          </div>
          <div className="text-2xl lg:text-5xl font-bold text-center uppercase lg:mb-5 mb-3">
            {t("concept.subtitle")}
          </div>
          <motion.div
            initial={{ opacity: 0, transform: "translateY(50px)" }}
            whileInView={{
              opacity: 1,
              transform: "translateY(0)",
              animationDelay: 0.5,
            }}
            transition={{ duration: 0.6 }}
            className="text-sm lg:text-2xl font-medium text-white text-center"
          >
            {t("concept.description")}
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
