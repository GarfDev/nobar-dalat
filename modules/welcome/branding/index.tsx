import cn from "classnames";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const BASE_DELAY = 1.5;

export function Branding() {
  return (
    <AnimatePresence>
      <section
        className={cn("relative w-[100vw] bg-white h-[100vh] overflow-hidden")}
      >
        <motion.video
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              delay: BASE_DELAY,
            },
          }}
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/videos/branding-video.mp4" type="video/mp4" />
        </motion.video>
        <motion.div
          initial={{ opacity: 0, transform: "blur(10px)" }}
          whileInView={{
            opacity: 0.6,
            transform: "none",
            transition: {
              delay: BASE_DELAY,
            },
          }}
          className="absolute top-0 left-0 w-full h-full bg-black opacity-60"
        />
        {/** MAIN LOGO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: {
              delay: BASE_DELAY,
              type: "spring",
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
        >
          <img
            src="/images/nobar-logo-black-white.png"
            alt="nobar-dalat-logo"
            className="h-[170px]"
          />
        </motion.div>
        {/** END MAIN LOGO TEXT */}

        {/** End section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: 1,
            transition: {
              delay: BASE_DELAY * 2,
              type: "spring",
              duration: 0.5,
              damping: 10,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
          className="absolute bottom-[-120px] left-[-20px] rotate-3 w-[120vw] h-[200px] bg-primary-500 z-10"
        />
      </section>
    </AnimatePresence>
  );
}
