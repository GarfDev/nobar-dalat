import { memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Navigation, ArrowRight } from "lucide-react";

// Minimal Dot Icon
const createMinimalIcon = (color: string, pulse: boolean = false) => {
  return L.divIcon({
    className: "minimal-marker",
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<div class="absolute w-8 h-8 bg-${color}-500/30 rounded-full animate-ping"></div>` : ''}
        <div class="relative w-3 h-3 bg-${color}-500 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-black"></div>
      </div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6], // Center
  });
};

// Start: Simple White Circle (like "Nhà Hát Hòa Bình" in example)
const startIcon = L.divIcon({
  className: "minimal-marker-start",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-4 h-4 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.3)]"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// End: Large Logo Marker (like "Gemination" in example)
const endIcon = L.divIcon({
  className: "minimal-marker-end",
  html: `
    <div class="relative w-full h-full flex items-center justify-center">
      <div class="w-12 h-12 bg-[#1a1a1a] p-2 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center overflow-hidden">
        <img src="/images/nobar-logo-black-white.png" class="w-full h-full object-contain p-1.5 block" alt="Nobar Logo" />
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});


const NO_BAR_COORDS: [number, number] = [11.9441271, 108.434335];


function ClientMap() {
  return (
    <>
      <MapContainer
        center={[11.9436, 108.4355]}
        zoom={17}
        scrollWheelZoom={false}
        className="h-full w-full outline-none bg-transparent font-sans"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Subtle Road Network */}
        <TileLayer
           url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
           className="map-road-tiles"
           opacity={0.3} 
        />

        {/* Street Labels */}
        <TileLayer
           url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png"
           className="map-labels-tiles"
           opacity={0.8}
        />

      
        
        <ZoomControl position="bottomright" />      

        {/* End Marker */}
        <Marker position={NO_BAR_COORDS} icon={endIcon}>
           <Tooltip 
            permanent 
            direction="bottom" 
            offset={[0, 20]} 
            className="minimal-tooltip"
          >
          </Tooltip>
        </Marker>

      </MapContainer>

      {/* Minimal Overlay */}
      <div className="absolute bottom-10 left-10 z-[1000] pointer-events-none group">
        <a 
            href="https://www.google.com/maps/dir/?api=1&origin=Rạp+Hòa+Bình+Đà+Lạt&destination=NO+bar+-+a+modern+cocktails+in+Da+Lat"
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto flex items-center gap-4 text-white/80 hover:text-white transition-colors cursor-pointer"
        >
            <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Navigation</span>
                <span className="text-sm font-light tracking-wide border-b border-white/20 pb-1">Get Directions</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-sm group-hover:bg-white/10 transition-all">
                <ArrowRight className="w-4 h-4" />
            </div>
        </a>
      </div>
      
      {/* Global Styles */}
      <style>{`
        .leaflet-container {
            background: transparent !important;
        }
        
        .map-road-tiles {
            filter: invert(100%) contrast(150%);
            mix-blend-mode: screen;
            opacity: 0.2; /* Very subtle */
        }

        .map-labels-tiles {
            filter: invert(100%) contrast(120%);
            mix-blend-mode: screen;
            opacity: 0.8;
            font-weight: bold;
        }

        /* Transparent Tooltips */
        .minimal-tooltip {
            background: transparent;
            border: none;
            box-shadow: none;
            font-family: inherit;
        }
        .minimal-tooltip::before {
            display: none; /* Hide triangle */
        }
      `}</style>
    </>
  );
}

export default memo(ClientMap);
