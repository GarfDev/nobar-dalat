import cn from "classnames";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

export function Concept() {
  return (
    <section className="relative w-[100vw] h-[100vh] bg-primary-500">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-start justify-center text-primary-500"
        >
          <h1 className="text-5xl text-white font-light">TRONG CÁI O</h1>
          <h1 className="text-5xl text-white font-light">CÓ GÌ KHÔNG?</h1>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
