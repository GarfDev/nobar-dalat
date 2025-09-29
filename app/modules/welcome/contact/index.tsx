import { motion } from "framer-motion";
import { memo } from "react";

function Contact() {
  return (
    <motion.section
      id="concept"
      className="h-[20vh] w-[100vw] bg-[#000000da] text-white backdrop-blur-md flex shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)] gap-10"
    >
      Day la cai contact
    </motion.section>
  );
}

export default memo(Contact);
