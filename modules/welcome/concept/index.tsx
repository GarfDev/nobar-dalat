import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <section
      id="concept"
      className="h-[100vh] w-[100vw] bg-white flex flex-col items-center justify-center"
    >
      <motion.div>
        <AnimatePresence></AnimatePresence>
      </motion.div>
    </section>
  );
}
