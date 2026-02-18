import { useEffect, useState, useRef } from "react";
import { supabase } from "~/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

type DeviceType = "mobile" | "tablet" | "desktop";

interface CursorPosition {
  x: number;
  y: number;
  deviceType: DeviceType;
  userId: string;
  color: string;
  onlineAt: number;
}

const COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F333FF",
  "#33FFF5",
  "#FF33A8",
  "#FF8F33",
  "#8F33FF",
  "#33FF8F",
  "#FF3333",
];

const getDeviceType = (width: number): DeviceType => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

// Simple throttle function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function CursorSync() {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const [myDeviceType, setMyDeviceType] = useState<DeviceType>("desktop");

  // Use lazy initialization for stable IDs
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [color] = useState(
    () => COLORS[Math.floor(Math.random() * COLORS.length)],
  );
  const [onlineAt] = useState(() => Date.now());

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Initialize device type on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line
      setMyDeviceType(getDeviceType(window.innerWidth));

      const handleResize = () => {
        setMyDeviceType(getDeviceType(window.innerWidth));
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<CursorPosition>();
        const newCursors: Record<string, CursorPosition> = {};

        // console.log("Presence sync:", newState);

        Object.entries(newState).forEach(([key, value]) => {
          if (key === userId) return; // Skip my own cursor

          // value is an array of presence objects for this key
          const presence = value[0];

          if (presence && presence.deviceType === myDeviceType) {
            newCursors[key] = presence;
          }
        });

        // Limit to 10 cursors
        const limitedCursors: Record<string, CursorPosition> = {};
        const sortedKeys = Object.keys(newCursors)
          .sort((a, b) => newCursors[a].onlineAt - newCursors[b].onlineAt)
          .slice(0, 10);

        sortedKeys.forEach((key) => {
          limitedCursors[key] = newCursors[key];
        });

        setCursors(limitedCursors);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Initial track
          await channel.track({
            x: -1, // Initial position off-screen
            y: -1,
            deviceType: myDeviceType,
            userId,
            color,
            onlineAt,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, myDeviceType, color]); // Re-subscribe if device type changes to ensure correct metadata

  useEffect(() => {
    if (!channelRef.current) return;

    const updateCursor = throttle((x: number, y: number) => {
      if (channelRef.current) {
        // Only track if we are subscribed?
        // track() is async but we don't await it here for performance
        channelRef.current.track({
          x: x / window.innerWidth, // Normalize to 0-1
          y: y / window.innerHeight, // Normalize to 0-1
          deviceType: myDeviceType,
          userId,
          color,
          onlineAt,
        });
      }
    }, 50);

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateCursor(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [myDeviceType, userId, color]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Object.entries(cursors).map(([id, cursor]) => (
        <div
          key={id}
          className="absolute transition-all duration-100 ease-linear"
          style={{
            left: `${cursor.x * 100}%`,
            top: `${cursor.y * 100}%`,
            display: cursor.x < 0 || cursor.y < 0 ? "none" : "block", // Hide if off-screen
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: cursor.color }}
            className="drop-shadow-md"
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19179L17.9416 17.4697L7.53113 17.4697L7.40059 17.5886L5.65376 12.3673Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <div
            className="absolute left-4 top-4 rounded px-2 py-1 text-xs text-white font-bold whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            User {id.substring(0, 4)}
          </div>
        </div>
      ))}
    </div>
  );
}
