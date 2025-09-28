import cn from "classnames";
import { motion, useAnimation } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useRef } from "react";
import { Link } from "react-scroll";
import { LanguageSwitcher } from "./components/language-switcher";
import Carousel from "./carousel";
import { useTranslation } from "react-i18next";
import Lightbox from "./lightbox";
import Video from "yet-another-react-lightbox/plugins/video";

import { useEffect, useState } from "react";

export const LOGO_DELAY = 0.5;

const logoVariants = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1,
    },
  },
  clicked: {
    opacity: 0,
    filter: "blur(10px)",
    scale: 0.25,
    x: "calc(100vw - 100px)",
    y: "calc(100vh - 50px)",
    transition: {
      duration: 0.3,
    },
  },
};

export function Branding() {
  const ref = useRef(null);
  const { t } = useTranslation();
  const [isLogoClicked, setIsLogoClicked] = useState(false);
  const [open, setOpen] = useState(false);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    fetch("/api/carousel-content")
      .then((res) => res.json())
      .then((data) => setCarouselItems(data.files));
  }, []);

  useEffect(() => {
    if (isLogoClicked) {
      controls.start("clicked");
    } else {
      controls.start("animate");
    }
  }, [isLogoClicked, controls]);

  const handleLogoClick = () => {
    setIsLogoClicked(true);
  };

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-[100vw] bg-white h-[calc(100vh+1px)] overflow-hidden",
      )}
    >
      {/* Carousel background for all breakpoints */}
      <Carousel
        items={carouselItems}
        setOpen={setOpen}
        setIndex={setIndex}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLogoClicked ? 0 : 0.6,
          transition: {
            delay: BASE_DELAY,
            duration: 0.5,
          },
        }}
        className="absolute top-0 left-0 w-full h-full bg-black pointer-events-none"
      />
      {/** MAIN LOGO TEXT */}
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate={controls}
        className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
        onClick={handleLogoClick}
      >
        <h1>
          <img
            src="/images/nobar-logo-black-white.png"
            alt="nobar-dalat-logo"
            className="h-[200px] lg:h-[250px]"
          />
        </h1>
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
          <span className="text-2xl">{t("concept")}</span>
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
          <span className="text-2xl">OUR MENU</span>
        </Link>
      </motion.div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={carouselItems.map((item) => ({
          type: item.type,
          sources: item.type === "video"
            ? [
                {
                  src: item.src,
                  type: "video/mp4",
                },
              ]
            : [],
          src: item.type === "image" ? item.src : undefined,
        }))}
        plugins={[Video]}
        video={{ autoPlay: true }}
        className="h-screen"
      />
    </section>
  );
}
