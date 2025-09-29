import { Branding } from "./branding";
import { Concept } from "./concept";
import Contact from "./contact";
import { Map } from "./menu";
import Menu from "./map";
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
