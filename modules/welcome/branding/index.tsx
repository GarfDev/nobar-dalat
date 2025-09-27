import cn from "classnames";
import { motion } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useEffect, useRef } from "react";
import { Link } from "react-scroll";
import { LanguageSwitcher } from "./components/language-switcher";

export const LOGO_DELAY = 0.5;

export function Branding() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-[100vw] bg-white h-[calc(100vh+1px)] overflow-hidden",
      )}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            delay: BASE_DELAY,
            duration: 0.8,
            ease: "easeIn",
          },
        }}
        className="absolute top-0 left-0 w-full h-full"
      >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/branding-video.mp4" type="video/mp4" />
        </video>
      </motion.div>
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
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            duration: 1,
          },
        }}
        className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
      >
        <img
          src="/images/nobar-logo-black-white.png"
          alt="nobar-dalat-logo"
          className="h-[200px] lg:h-[250px]"
        />
      </motion.div>
      {/** END MAIN LOGO TEXT */}

      <motion.div
        initial={{ transform: "translateX(100px)" }}
        animate={{
          transform: "translateY(0px)",
          transition: {
            delay: LOGO_DELAY,
            duration: 0.3,
          },
        }}
        className="absolute top-5 right-5 z-10"
      >
        <LanguageSwitcher />
      </motion.div>

      <motion.div
        initial={{ transform: "translateX(-150px)" }}
        animate={{
          transform: "translateY(0px)",
          transition: {
            delay: LOGO_DELAY,
            duration: 0.3,
          },
        }}
        className="absolute top-5 left-5 z-10"
      >
        <Link to="concept" smooth duration={500}>
          <h3 className="text-2xl">CONCEPT</h3>
        </Link>
      </motion.div>

      <motion.div
        initial={{ transform: "translateX(-150px)" }}
        animate={{
          transform: "translateY(0px)",
          transition: {
            delay: LOGO_DELAY,
            duration: 0.3,
          },
        }}
        className="absolute bottom-5 left-5 z-10"
      >
        <Link to="menu" smooth duration={500}>
          <h3 className="text-2xl">OUR MENU</h3>
        </Link>
      </motion.div>
    </section>
  );
}
