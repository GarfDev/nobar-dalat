import { Branding } from "./branding";
import { Concept } from "./concept";
import "./style.css";
import { motion } from "framer-motion";
import { useRef } from "react";

export function Welcome() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="card-container">
      <motion.div className="card">
        <Branding />
      </motion.div>
      <div className="card">
        <Concept />
      </div>
    </div>
  );
}
