import { motion } from "framer-motion";
import { memo } from "react";

function Contact() {
  return (
    <motion.section
      id="contact"
      className="h-[20vh] w-screen !opacity-100 !bg-[#000000] text-white flex flex-col items-center justify-center gap-6 p-8"
    >
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg md:text-xl font-light italic">
          No Bar - quán đêm | rượu và bạn
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 text-sm md:text-base">
        <p className="flex items-center gap-2">
          <span>🥢</span>
          <span>19:00 - 01:30 mỗi ngày | thứ tư từ 21:00</span>
        </p>
        <p className="flex items-center gap-2">
          <span>🥢</span>
          <span>61-63 Trương Công Định, Đà Lạt</span>
        </p>
      </div>
    </motion.section>
  );
}

export default memo(Contact);
