import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Concept() {
  const { t } = useTranslation();

  return (
    <section
      id="concept"
      className="h-[100vh] w-[100vw] bg-black flex shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)] gap-10"
    >
      <motion.div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-[380px] lg:max-w-[800px] w-full flex flex-col">
          <div className="text-4xl lg:text-6xl font-light text-center lg:mb-3 uppercase">
            Tính Việt Vẹn Nguyên
          </div>
          <div className="text-4xl lg:text-6xl font-light text-center uppercase mb-5">
            Giao Thoa Thời Đại
          </div>
          <motion.div
            initial={{ opacity: 0, transform: "translateY(50px)" }}
            whileInView={{
              opacity: 1,
              transform: "translateY(0)",
              animationDelay: 0.5,
            }}
            transition={{ duration: 0.6 }}
            className="text-md lg:text-2xl font-medium text-white text-center"
          >
            Trên hành trình mang di sản Việt gặp gỡ tinh thần đương đại. Hương
            vị cũ được tái hiện, trong hình hài của thời đại.
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
