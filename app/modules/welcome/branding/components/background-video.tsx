import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { BASE_DELAY } from "../../constants";

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch(() => {
          // Autoplay could be blocked; ignore since we show a poster
        });
      }
    }
  }, []);

  return (
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
        poster="/images/nobar-logo-black-white.png"
        className="w-full h-full object-cover"
      >
        <source src="/videos/branding-video.webm" type="video/webm" />
        <source src="/videos/branding-video.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
}