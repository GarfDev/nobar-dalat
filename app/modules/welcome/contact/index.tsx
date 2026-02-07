import { motion } from "framer-motion";
import { memo } from "react";
import { Instagram, ArrowUpRight } from "lucide-react";

function Contact() {
  return (
    <motion.section
      id="contact"
      className="h-[20vh] w-screen !opacity-100 !bg-black text-white flex items-center justify-center overflow-hidden"
    >
      <div className="w-full h-full max-w-[1920px] px-6 md:px-12 flex flex-row items-center justify-between">
        {/* Left: Branding */}
        <div className="flex flex-col justify-center h-full">
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold uppercase tracking-tighter leading-none">
            NO BAR
          </h2>
          <p className="text-[10px] md:text-sm tracking-widest opacity-60 mt-1 uppercase">
            quán đêm | rượu và bạn
          </p>
        </div>

        {/* Right: Info Grid */}
        <div className="flex flex-col items-end gap-2 md:gap-4 text-right">
          {/* Top Row: Address & Link */}
          <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-6">
            <a
              href="https://maps.app.goo.gl/nobardalat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-[10px] md:text-sm hover:opacity-100 opacity-70 transition-opacity"
            >
              <span>61-63 Trương Công Định</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <div className="hidden md:block w-px h-3 bg-white/20"></div>

            <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-6 text-[10px] md:text-sm opacity-70">
              <span>19:00 - 01:30 Daily</span>
              <span className="hidden md:inline text-white/20">|</span>
              <span>Wed from 21:00</span>
            </div>
          </div>

          {/* Bottom Row: Social */}
          <a
            href="https://www.instagram.com/nobardalat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-black px-3 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-white/90 transition-colors mt-1"
          >
            <Instagram className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
              Instagram
            </span>
          </a>
        </div>
      </div>
    </motion.section>
  );
}

export default memo(Contact);
