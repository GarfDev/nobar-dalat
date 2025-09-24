import cn from "classnames";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { BASE_DELAY } from "../constants";

export function Concept() {
  return (
    <motion.section className="relative w-[100vw] h-[100vh] bg-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              delay: BASE_DELAY,
              type: "spring",
              duration: 0.5,
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute top-[-120px] left-[-20px] rotate-3 w-[120vw] h-[200px] bg-white z-10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0,
              type: "spring",
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-start justify-center text-primary-500"
        >
          <h1 className="text-5xl font-light">TRONG CÁI O</h1>
          <h1 className="text-5xl font-light">CÓ GÌ KHÔNG?</h1>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
