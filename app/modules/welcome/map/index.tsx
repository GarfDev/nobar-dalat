import { motion } from "framer-motion";
import { memo, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load the map component to avoid SSR issues with Leaflet
const ClientMap = lazy(() => import("./client-map"));

function MapComponent() {
  return (
    <motion.section
      id="map"
      className="h-[100vh] w-[100vw] relative z-0 bg-transparent backdrop-blur-md"
    >
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center text-white/20 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading Map...</span>
          </div>
        }
      >
        <ClientMap />
      </Suspense>
    </motion.section>
  );
}

export default memo(MapComponent);
