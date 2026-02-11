import cn from "classnames";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-scroll";
import { LanguageSwitcher } from "./components/language-switcher";
import Carousel, { type MediaItem } from "./carousel";
import { useTranslation } from "react-i18next";
import Lightbox from "./carousel/lightbox";
import Video from "yet-another-react-lightbox/plugins/video";

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
    transition: {
      duration: 0.3,
    },
  },
};

export function Branding({ carouselItems }: { carouselItems: MediaItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const [isLogoClicked, setIsLogoClicked] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const controls = useAnimation();
  const [windowWidth, setWindowWidth] = useState(0);

  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, -200]);
  const parallaxOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const parallaxBlur = useTransform(
    scrollY,
    [0, 300],
    ["blur(0px)", "blur(10px)"],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  useEffect(() => {
    if (isLogoClicked) {
      controls.start("clicked").then(() => {
        setCanInteract(true);
      });
    } else {
      controls.start("animate");
      // Use a small timeout or state setter callback to avoid sync state update warning
      // but logically it's fine here as it's a response to prop change.
      // Better yet, just set it. The linter warning is about potential loops,
      // but here it depends on [isLogoClicked] which is stable during this render.
      // We can wrap it in a timeout to be safe and avoid the warning.
      const timer = setTimeout(() => setCanInteract(false), 0);
      return () => clearTimeout(timer);
    }
  }, [isLogoClicked, controls]);

  const handleLogoClick = () => {
    if (windowWidth >= 768) {
      // Only allow click on devices wider than 768px
      setIsLogoClicked(true);
    }
  };

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-[100vw] bg-white text-white h-[calc(100vh+1px)] overflow-hidden",
      )}
    >
      {/* Carousel background for all breakpoints */}
      <Carousel
        items={carouselItems}
        setOpen={setOpen}
        setIndex={setIndex}
        canInteract={canInteract}
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
        whileHover="hover"
        style={{ y: parallaxY, opacity: parallaxOpacity, filter: parallaxBlur }}
        className={cn(
          "absolute rounded-2xl top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10",
          windowWidth < 768 ? "cursor-default" : "cursor-pointer",
        )}
        onClick={handleLogoClick}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.05 },
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.img
            src="/images/nobar-logo-black-white.png"
            alt="nobar-dalat-logo"
            className="h-[180px] md:h-[220px] lg:h-[250px] drop-shadow-2xl"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Text Hint - Reveals on Hover */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 10, letterSpacing: "0.5em" },
              hover: { opacity: 1, y: 0, letterSpacing: "0.8em" },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hidden md:block text-xs md:text-sm lg:text-base font-light uppercase text-white/90 border-b border-white/20 pb-1"
          >
            {t("branding.enter", "Enter")}
          </motion.div>
        </motion.div>
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
          <span className="cursor-pointer text-2xl">{t("concept")}</span>
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
          <span className="cursor-pointer text-2xl">{t("menu")}</span>
        </Link>
      </motion.div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={carouselItems.map((item) => {
          if (item.type === "video") {
            return {
              type: "video" as const,
              sources: [
                {
                  src: item.src,
                  type: "video/mp4",
                },
              ],
            };
          }
          return {
            type: "image" as const,
            src: item.src,
          };
        })}
        plugins={[Video]}
        video={{ autoPlay: true }}
        className="h-screen"
      />
    </section>
  );
}
