import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { memo } from "react";

export function Menu() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="menu"
      className="h-[100vh] w-[100vw] bg-white text-black relative z-10 flex items-center justify-center"
    >
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">{t('menu')}</h2>
        <p>Menu content coming soon...</p>
      </div>
    </motion.section>
  );
}

export default memo(Menu);
