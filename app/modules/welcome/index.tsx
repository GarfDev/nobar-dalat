import { Branding } from "./branding";
import { Concept } from "./concept";
import Contact from "./contact";
import Map from "./map";
import { Menu } from "./menu";
import "./style.css";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { useRef, useEffect, type ElementRef } from "react";
import type { MediaItem } from "./branding/carousel";

const BLUR_INPUT_RANGE = [0, 0.45, 0.85];
const OPACITY_INPUT_RANGE = [0, 0.25, 0.8];

export function Welcome({ carouselItems }: { carouselItems: MediaItem[] }) {
  const conceptRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // 1. Concept entering (covers Branding)
  const { scrollYProgress: conceptProgress } = useScroll({
    target: conceptRef,
    offset: ["start end", "start start"],
  });

  const brandingBlur = useTransform(
    conceptProgress,
    BLUR_INPUT_RANGE,
    ["blur(0px)", "blur(0px)", "blur(8px)"],
  );
  const conceptOpacity = useTransform(
    conceptProgress,
    OPACITY_INPUT_RANGE,
    [0, 0, 1],
  );

  // 2. Menu entering (covers Concept)
  const { scrollYProgress: menuProgress } = useScroll({
    target: menuRef,
    offset: ["start end", "start start"],
  });

  const conceptBlur = useTransform(
    menuProgress,
    BLUR_INPUT_RANGE,
    ["blur(0px)", "blur(0px)", "blur(8px)"],
  );
  const menuOpacity = useTransform(menuProgress, OPACITY_INPUT_RANGE, [0, 0, 1]);

  // 3. Map entering (covers Menu)
  const { scrollYProgress: mapProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "start start"],
  });

  const menuBlur = useTransform(
    mapProgress,
    BLUR_INPUT_RANGE,
    ["blur(0px)", "blur(0px)", "blur(8px)"],
  );
  const mapOpacity = useTransform(mapProgress, OPACITY_INPUT_RANGE, [0, 0, 1]);
  const mapPointerEvents = useTransform(
    mapProgress,
    [0, 0.8, 0.8001],
    ["none", "none", "auto"],
  );

  // 4. Contact entering (covers Map)
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ["start end", "start start"],
  });

  const mapBlur = useTransform(
    contactProgress,
    [0, 0.85],
    ["blur(0px)", "blur(8px)"],
  );

  // Better approach: Get the instance and set up a listener
  const lenisRef = useRef<ElementRef<typeof ReactLenis>>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    let timeout: NodeJS.Timeout;

    const onScroll = () => {
      clearTimeout(timeout);
      // Wait for scroll to stop
      timeout = setTimeout(() => {
        const vh = window.innerHeight;
        const current = lenis.scroll;
        const target = Math.round(current / vh) * vh;

        // Only snap if we are not already close enough (avoid micro-jitters)
        if (Math.abs(current - target) > 5) {
          lenis.scrollTo(target, {
            duration: 1.5,
            lock: true,
            onComplete: () => {
              lenis.stop();
              setTimeout(() => {
                lenis.start();
              }, 500);
            },
          });
        }
      }, 150); // Adjust delay as needed
    };

    lenis.on("scroll", onScroll);

    return () => {
      lenis.off("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.5,
      }}
    >
      <div className="card-container">
        <motion.div
          className="card snap-start snap-always"
          style={{ filter: brandingBlur, willChange: "filter, opacity", zIndex: 1 }}
        >
          <Branding carouselItems={carouselItems} />
        </motion.div>
        <motion.div
          ref={conceptRef}
          className="card snap-start snap-always"
          style={{ opacity: conceptOpacity, filter: conceptBlur, willChange: "filter, opacity", zIndex: 2 }}
        >
          <Concept />
        </motion.div>
        <motion.div
          ref={menuRef}
          className="card snap-start snap-always"
          style={{ opacity: menuOpacity, filter: menuBlur, willChange: "filter, opacity", zIndex: 3 }}
        >
          <Menu />
        </motion.div>
        <motion.div
          ref={mapRef}
          className="card snap-start snap-always"
          style={{
            opacity: mapOpacity,
            filter: mapBlur,
            pointerEvents: mapPointerEvents,
            willChange: "filter, opacity",
            zIndex: 4,
          }}
        >
          <Map />
        </motion.div>
        <motion.div
          ref={contactRef}
          className="snap-end snap-always h-[20vh] w-full relative"
          style={{ zIndex: 5 }}
        >
          <Contact />
        </motion.div>
      </div>
    </ReactLenis>
  );
}
