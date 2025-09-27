import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <section
      id="concept"
      className="h-[100vh] w-[100vw] bg-black flex flex-col items-center justify-center shadow-2xl drop-shadow-2xl shadow-xl/30"
    >
      <motion.div>
        <AnimatePresence>
          <p className="text-white text-2xl">CON CHÓ DŨNG NÓI NHIỀU</p>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
