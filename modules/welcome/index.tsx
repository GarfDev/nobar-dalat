import { Branding } from "./branding";
import { Concept } from "./concept";
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
        <div className="card">
          <Concept />
        </div>
      </div>
    </ReactLenis>
  );
}
