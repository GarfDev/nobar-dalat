import { Branding } from "./branding";
import { Concept } from "./concept";
import Contact from "./contact";
import Map from "./map";
import { Menu } from "./menu";
import "./style.css";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactLenis } from "lenis/react";
import { useRef } from "react";

export function Welcome() {
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
    [0, 0.3, 1],
    ["blur(0px)", "blur(0px)", "blur(20px)"],
  );
  const conceptOpacity = useTransform(conceptProgress, [0, 0.3, 1], [0, 0, 1]);

  // 2. Menu entering (covers Concept)
  const { scrollYProgress: menuProgress } = useScroll({
    target: menuRef,
    offset: ["start end", "start start"],
  });

  const conceptBlur = useTransform(
    menuProgress,
    [0, 0.3, 1],
    ["blur(0px)", "blur(0px)", "blur(20px)"],
  );
  const menuOpacity = useTransform(menuProgress, [0, 0.3, 1], [0, 0, 1]);

  // 3. Map entering (covers Menu)
  const { scrollYProgress: mapProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "start start"],
  });

  const menuBlur = useTransform(
    mapProgress,
    [0, 0.3, 1],
    ["blur(0px)", "blur(0px)", "blur(20px)"],
  );
  const mapOpacity = useTransform(mapProgress, [0, 0.3, 1], [0, 0, 1]);

  // 4. Contact entering (covers Map)
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ["start end", "start start"],
  });

  const mapBlur = useTransform(
    contactProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"],
  );

  return (
    <ReactLenis root options={{ lerp: 0.1, syncTouch: true }}>
      <div className="card-container snap-y snap-mandatory">
        <motion.div
          className="card snap-start snap-always"
          style={{ filter: brandingBlur, zIndex: 1 }}
        >
          <Branding />
        </motion.div>
        <motion.div
          ref={conceptRef}
          className="card snap-start snap-always"
          style={{ opacity: conceptOpacity, filter: conceptBlur, zIndex: 2 }}
        >
          <Concept />
        </motion.div>
        <motion.div
          ref={menuRef}
          className="card snap-start snap-always"
          style={{ opacity: menuOpacity, filter: menuBlur, zIndex: 3 }}
        >
          <Menu />
        </motion.div>
        <motion.div
          ref={mapRef}
          className="card snap-start snap-always"
          style={{ opacity: mapOpacity, filter: mapBlur, zIndex: 4 }}
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
