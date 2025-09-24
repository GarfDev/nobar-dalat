import cn from "classnames";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

export function Branding() {
  return (
    <AnimatePresence>
      <section
        className={cn("relative w-[100vw] bg-white h-[100vh] overflow-hidden")}
      >
        {/** MAIN LOGO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
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
          className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500"
        >
          <img
            src="/images/nobar-logo.png"
            alt="Nobar Lo"
            className="h-[290px]"
          />

          {/* <h1 className="text-5xl font-light">TRONG</h1>
          <h1 className="text-6xl font-light">CÁI</h1>
          <h1 className="text-9xl font-light">O</h1>
          <h1 className="text-6xl font-light">KHÔNG</h1>
          <h1 className="text-6xl font-light">CÓ</h1>
          <h1 className="text-6xl font-light">GÌ</h1> */}
        </motion.div>
        {/** END MAIN LOGO TEXT */}

        {/** End section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              delay: 0.7,
              type: "spring",
              duration: 0.5,
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute bottom-[-120px] left-[-20px] rotate-3 w-[120vw] h-[200px] bg-primary-500"
        />
      </section>
    </AnimatePresence>
  );
}
