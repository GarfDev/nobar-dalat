import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Map() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="concept"
      className="h-[100vh] w-[100vw] bg-[#59267bda] flex shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)] gap-10"
    >
      asdfasdf
    </motion.section>
  );
}
