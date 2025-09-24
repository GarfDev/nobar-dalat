import cn from "classnames";
import { motion, useScroll, useTransform } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useRef } from "react";

export function Branding() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className={cn("relative w-[100vw] bg-white h-[100vh] overflow-hidden")}
    >
      <motion.video
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            delay: BASE_DELAY,
            duration: 0.5,
          },
        }}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/branding-video.mp4" type="video/mp4" />
      </motion.video>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.6,
          transition: {
            delay: BASE_DELAY,
            duration: 0.5,
          },
        }}
        className="absolute top-0 left-0 w-full h-full bg-black opacity-60"
      />
      {/** MAIN LOGO TEXT */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
      >
        <img
          src="/images/nobar-logo-black-white.png"
          alt="nobar-dalat-logo"
          className="h-[170px]"
        />
      </motion.div>
      {/** END MAIN LOGO TEXT */}
    </section>
  );
}
