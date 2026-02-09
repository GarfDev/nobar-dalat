import { memo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        className="h-full w-full outline-none bg-transparent font-sans"
        zoomControl={false}
        attributionControl={false}
      >
        {/* Subtle Road Network */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png"
          className="map-road-tiles"
          opacity={0.6}
        />

        {/* Street Labels */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png"
          className="map-labels-tiles"
          opacity={1}
        />

        {/* End Marker */}
        <Marker position={NO_BAR_COORDS} icon={endIcon}>
          <Tooltip
            permanent
            direction="bottom"
            offset={[0, 20]}
            className="minimal-tooltip"
          ></Tooltip>
        </Marker>
      </MapContainer>

      <style>{`
        /* Minimal Overlay */
        .map-road-tiles {
            filter: invert(100%) contrast(150%);
            mix-blend-mode: screen;
            opacity: 0.5; /* Very subtle */
        }

        .map-labels-tiles {
            filter: invert(100%) contrast(120%);
            mix-blend-mode: screen;
            opacity: 1;
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
