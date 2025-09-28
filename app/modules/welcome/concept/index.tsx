import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <section
      id="concept"
      className="h-[100vh] w-[100vw] bg-black flex flex-col items-center justify-center shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)]"
    >
      <motion.div>
        <AnimatePresence>
          <blockquote className="text-white text-2xl">CON CHÓ DŨNG NÓI NHIỀU</blockquote>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
