import { Branding } from "./branding";
import { Concept } from "./concept";
import Contact from "./contact";
import { Map } from "./map";
import Menu from "./menu";
import "./style.css";
import { motion } from "framer-motion";
import { ReactLenis } from "lenis/react";

export function Welcome() {
  return (
    <ReactLenis root>
      <div className="card-container">
        <motion.div className="card">
          <Branding />
        </motion.div>
        <motion.div className="card">
          <Concept />
        </motion.div>
        <motion.div className="card">
          <Map />
        </motion.div>
        <motion.div className="card">
          <Menu />
        </motion.div>
        <motion.div className="card">
          <Contact />
        </motion.div>
      </div>
    </ReactLenis>
  );
}
