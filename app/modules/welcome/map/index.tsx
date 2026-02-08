import { motion } from "framer-motion";
import { memo, lazy, Suspense, useState, useEffect } from "react";
import {
  Loader2,
  Navigation,
  Copy,
  MapPin,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import cn from "classnames";

// Lazy load the map component to avoid SSR issues with Leaflet
const ClientMap = lazy(() => import("./client-map"));

const shapes = {
  blob1: "30% 70% 70% 30% / 30% 30% 70% 70%",
  blob2: "63% 37% 37% 63% / 43% 37% 63% 57%",
  blob3: "46% 54% 28% 72% / 60% 38% 62% 40%",
};

function MapComponent() {
  const { t } = useTranslation();
  const address = t("contact.address");
  const fullAddress = `${address}, Đà Lạt, Lâm Đồng`;
  const [copied, setCopied] = useState(false);
  const [currentShape, setCurrentShape] = useState(shapes.blob2);
  const [isOpen, setIsOpen] = useState(false);

  // Optional: Morph shape slowly for organic feel
  useEffect(() => {
    const interval = setInterval(() => {
      const keys = Object.values(shapes);
      const randomShape = keys[Math.floor(Math.random() * keys.length)];
      setCurrentShape(randomShape);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check opening hours
  useEffect(() => {
    const checkStatus = () => {
      // Create date object for current time in Vietnam (UTC+7)
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnTime = new Date(utc + 7 * 3600000);

      const day = vnTime.getDay(); // 0 is Sunday
      const hours = vnTime.getHours();
      const minutes = vnTime.getMinutes();
      const currentTime = hours * 60 + minutes;

      // Regular hours: 19:00 - 01:30 (next day)
      // Wednesday: 21:00 - 01:30 (next day)

      const isWednesday = day === 3;
      const openTime = isWednesday ? 21 * 60 : 19 * 60; // 21:00 or 19:00
      const closeTime = 1 * 60 + 30; // 01:30

      // Logic for spanning past midnight
      // If current time is between openTime and midnight OR between midnight and closeTime
      let isOpenNow = false;

      if (currentTime >= openTime) {
        // Evening before midnight
        isOpenNow = true;
      } else if (currentTime < closeTime) {
        // Early morning (after midnight)
        // Need to check if "yesterday" was a valid opening day (every day is valid)
        // If it's early Wednesday morning, we opened Tuesday at 19:00 - OK
        // If it's early Thursday morning, we opened Wednesday at 21:00 - OK
        isOpenNow = true;
      }

      setIsOpen(isOpenNow);
    };

    checkStatus();
    const timer = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.section
      id="map"
      className="h-screen w-screen bg-black text-white flex items-center justify-center p-4 md:p-8 lg:p-20 overflow-hidden"
    >
      <div className="w-full h-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 lg:gap-12 border-t border-white/20 pt-4 lg:pt-0 lg:border-none">
        {/* Left Column: Info & Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between order-2 lg:order-1 h-full py-2 lg:py-0">
          {/* Top: Header */}
          <div className="hidden md:block space-y-2">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter leading-none -ml-1">
              {t("map.title")}
            </h2>
            <div className="w-full h-px bg-white/20 my-6" />
          </div>

          {/* Middle: Details */}
          <div className="space-y-8 lg:space-y-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">
                  {t("map.addressLabel")}
                </span>
              </div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-tight">
                {address}
                <span className="block text-white/40">Đà Lạt, Lâm Đồng</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-white/50 block mb-1">
                  {t("map.statusLabel")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        isOpen ? "bg-green-400" : "bg-red-400",
                      )}
                    ></span>
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        isOpen ? "bg-green-500" : "bg-red-500",
                      )}
                    ></span>
                  </span>
                  <p className="font-mono text-sm uppercase">
                    {isOpen ? t("map.statusOpen") : t("map.statusClosed")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Actions */}
          <div className="flex flex-col gap-3 mt-8 lg:mt-0">
            <a
              href="https://maps.app.goo.gl/Po186wH5QZzYYD4Y7"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center justify-between p-6 border border-white/20 hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Navigation className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {t("map.getDirections") || "Get Directions"}
                </span>
              </div>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>

            <button
              onClick={handleCopy}
              className="group w-full flex items-center justify-between p-6 border border-white/20 hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Copy className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {copied ? t("map.copied") : t("map.copyAddress")}
                </span>
              </div>
              {copied && <Check className="w-5 h-5 text-green-500" />}
            </button>
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-8 order-1 lg:order-2 h-[35vh] md:h-[40vh] lg:h-full w-full relative flex items-center justify-center">
          <div
            className="w-full h-full md:w-[90%] md:h-[90%] bg-zinc-900 grayscale hover:grayscale-0 transition-all duration-[3000ms] ease-in-out relative overflow-hidden shadow-2xl"
            style={{
              borderRadius: currentShape,
              transition: "border-radius 5s ease-in-out, filter 0.5s ease",
            }}
          >
            <Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center text-white/20 gap-3 bg-zinc-900">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              }
            >
              <ClientMap />
            </Suspense>

            {/* Overlay Ring to emphasize shape */}
            <div
              className="absolute inset-0 pointer-events-none border-[1px] border-white/20 z-20"
              style={{
                borderRadius: currentShape,
                transition: "border-radius 5s ease-in-out",
              }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default memo(MapComponent);
