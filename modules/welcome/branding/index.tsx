import cn from "classnames";
import { motion } from "framer-motion";
import { BASE_DELAY } from "../constants";
import { useEffect, useRef } from "react";

export const LOGO_DELAY = 0.5;

export function Branding() {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-[100vw] bg-white h-[calc(100vh+1px)] overflow-hidden",
      )}
    >
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transition: {
            delay: BASE_DELAY,
            duration: 0.8,
            ease: "easeIn",
          },
        }}
        className="absolute top-0 left-0 w-full h-full"
      >
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          loop
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/branding-video.mp4" type="video/mp4" />
          <source src="/videos/branding-video.webm" type="video/webm" />
        </video>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.6,
          transition: {
            delay: BASE_DELAY,
            duration: 0.5,
          },
        }}
        className="absolute top-0 left-0 w-full h-full bg-black opacity-60"
      />
      {/** MAIN LOGO TEXT */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: 0,
          transition: {
            delay: LOGO_DELAY,
            duration: 1,
          },
        }}
        className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
      >
        <img
          src="/images/nobar-logo-black-white.png"
          alt="nobar-dalat-logo"
          className="h-[170px]"
        />
      </motion.div>
      {/** END MAIN LOGO TEXT */}

      {/** SEC LOGO TEXT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          transition: {
            delay: LOGO_DELAY,
            duration: 1,
          },
        }}
        className="absolute top-0 bottom-0 left-0 right-0 m-[auto] w-fit h-fit flex flex-col items-center justify-center text-primary-500 z-10"
      >
        <img
          src="/images/nobar-logo-color.png"
          alt="nobar-dalat-logo"
          className="h-[170px]"
        />
      </motion.div>
      {/** END SEC LOGO TEXT */}
    </section>
  );
}
