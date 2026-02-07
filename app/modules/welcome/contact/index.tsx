import { motion, type Variants } from "framer-motion";
import { memo } from "react";
import { Instagram, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function Contact() {
  const { t } = useTranslation();

  return (
    <motion.section
      id="contact"
      className="h-[20vh] w-screen !opacity-100 !bg-black text-white flex items-center justify-center overflow-hidden"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full h-full max-w-[1920px] px-6 md:px-12 flex flex-row items-center justify-between"
      >
        {/* Left: Branding */}
        <div className="flex flex-col justify-center h-full">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tighter leading-none"
          >
            NO BAR
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-[10px] md:text-sm tracking-widest opacity-60 mt-1 uppercase"
          >
            {t("contact.tagline")}
          </motion.p>
        </div>

        {/* Right: Info Grid */}
        <div className="flex flex-col items-end gap-2 md:gap-4 text-right">
          {/* Top Row: Address & Link */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-6"
          >
            <a
              href="https://maps.app.goo.gl/Po186wH5QZzYYD4Y7"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-[10px] md:text-sm hover:opacity-100 opacity-70 transition-opacity"
            >
              <span>{t("contact.address")}</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <div className="hidden md:block w-px h-3 bg-white/20"></div>

            <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-6 text-[10px] md:text-sm opacity-70">
              <span>{t("contact.hours.daily")}</span>
              <span className="hidden md:inline text-white/20">|</span>
              <span>{t("contact.hours.wed")}</span>
            </div>
          </motion.div>

          {/* Bottom Row: Social */}
          <motion.a
            variants={itemVariants}
            href="https://www.instagram.com/nobardalat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black px-3 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-white/90 transition-colors mt-1"
          >
            <Instagram className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
              Instagram
            </span>
          </motion.a>
        </div>
      </motion.div>
    </motion.section>
  );
}

export default memo(Contact);
