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
  const conceptRef = useRef(null);
  const mapRef = useRef(null);
  const menuRef = useRef(null);
  const contactRef = useRef(null);

  // 1. Concept entering (covers Branding)
  const { scrollYProgress: conceptProgress } = useScroll({
    target: conceptRef,
    offset: ["start end", "start start"],
  });

  const brandingBlur = useTransform(
    conceptProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"],
  );
  const conceptOpacity = useTransform(conceptProgress, [0, 1], [0, 1]);

  // 2. Map entering (covers Concept)
  const { scrollYProgress: mapProgress } = useScroll({
    target: mapRef,
    offset: ["start end", "start start"],
  });

  const conceptBlur = useTransform(
    mapProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"],
  );
  const mapOpacity = useTransform(mapProgress, [0, 1], [0, 1]);

  // 3. Menu entering (covers Map)
  const { scrollYProgress: menuProgress } = useScroll({
    target: menuRef,
    offset: ["start end", "start start"],
  });

  const mapBlur = useTransform(
    menuProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"],
  );
  const menuOpacity = useTransform(menuProgress, [0, 1], [0, 1]);

  // 4. Contact entering (covers Menu)
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ["start end", "start start"],
  });

  const menuBlur = useTransform(
    contactProgress,
    [0, 1],
    ["blur(0px)", "blur(20px)"],
  );
  const contactOpacity = useTransform(contactProgress, [0, 1], [0, 1]);

  return (
    <ReactLenis root options={{ lerp: 0.05, syncTouch: true }}>
      <div className="card-container snap-y snap-mandatory">
        <motion.div
          className="card snap-start"
          style={{ filter: brandingBlur, zIndex: 1 }}
        >
          <Branding />
        </motion.div>
        <motion.div
          ref={conceptRef}
          className="card snap-start"
          style={{ opacity: conceptOpacity, filter: conceptBlur, zIndex: 2 }}
        >
          <Concept />
        </motion.div>
        <motion.div
          ref={mapRef}
          className="card snap-start"
          style={{ opacity: mapOpacity, filter: mapBlur, zIndex: 3 }}
        >
          <Map />
        </motion.div>
        <motion.div
          ref={menuRef}
          className="card snap-start"
          style={{ opacity: menuOpacity, filter: menuBlur, zIndex: 4 }}
        >
          <Menu />
        </motion.div>
        <motion.div
          ref={contactRef}
          className="card snap-start"
          style={{ opacity: contactOpacity, zIndex: 5 }}
        >
          <Contact />
        </motion.div>
      </div>
    </ReactLenis>
  );
}
