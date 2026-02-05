import { motion } from "framer-motion";

export function Menu() {
  return (
    <motion.section
      id="menu"
      className="h-[100vh] w-[100vw] bg-[#4d2a65cb] text-white backdrop-blur-md flex shadow-[0_-25px_50px_-12px_rgb(0,0,0,0.25)] gap-10"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-white text-2xl font-bold">D</h2>
      </div>
    </motion.section>
  );
}
