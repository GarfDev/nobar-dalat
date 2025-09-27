import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <motion.section className="relative w-[100vw] h-[100vh] bg-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0,
              type: "spring",
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-start justify-center text-primary-500"
        >
          <h1 className="text-5xl font-light">{t("welcome.title")}</h1>
          <h1 className="text-5xl font-light">{t("welcome.subtitle")}</h1>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
