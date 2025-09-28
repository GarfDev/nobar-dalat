import cn from "classnames";
import { motion } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useRef } from "react";
import { Link } from "react-scroll";
import { LanguageSwitcher } from "./components/language-switcher";
import Carousel from "./carousel";

export const LOGO_DELAY = 0.5;

export function Branding() {
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-[100vw] bg-white h-[calc(100vh+1px)] overflow-hidden",
      )}
    >
      {/* Carousel background for all breakpoints */}
      <Carousel />

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
