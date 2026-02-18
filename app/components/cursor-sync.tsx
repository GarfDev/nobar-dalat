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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [session, setSession] = useState<any>(null);

  // Auto anonymous login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        supabase.auth.signInAnonymously().then(({ data: { session } }) => {
          setSession(session);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    if (!userId || !session) return;

    // Use a single channel name for all users
    const channel = supabase.channel("room_01", {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState<CursorPosition>();
      // console.log("Sync state:", newState);
      const newCursors: Record<string, CursorPosition> = {};

      Object.entries(newState).forEach(([key, value]) => {
        if (key === userId) return; // Skip my own cursor

        // value is an array of presence objects for this key
        // We take the last one as it's the most recent
        const presence = value[value.length - 1];

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
    });
    // Track cursor for current user immediately when subscribed
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          x: -1, // Initial position
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
      channelRef.current = null;
    };
  }, [userId, myDeviceType, color, onlineAt, session]);

  useEffect(() => {
    if (!channelRef.current) return;

    const updateCursor = throttle((x: number, y: number) => {
      if (channelRef.current) {
        // Only track if we are subscribed?
        // track() is async but we don't await it here for performance

        // Calculate relative position based on scroll
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Use document coordinates (including scroll)
        // Normalize against document size instead of window size for better sync across different scroll positions
        const docWidth = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth,
          document.body.clientWidth,
          document.documentElement.clientWidth,
        );
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        );

        channelRef.current.track({
          x: (x + scrollX) / docWidth,
          y: (y + scrollY) / docHeight,
          deviceType: myDeviceType,
          userId,
          color,
          onlineAt,
        });
      }
    }, 50);

    const handleMouseMove = (e: MouseEvent) => {
      // clientX/Y are relative to viewport
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
  }, [myDeviceType, userId, color, onlineAt, session]); // Add session dependency to re-bind events if needed

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Object.entries(cursors).map(([id, cursor]) => {
        // Convert normalized document coordinates back to viewport coordinates
        // We need to account for the current user's scroll position
        const docWidth = Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth,
          document.body.clientWidth,
          document.documentElement.clientWidth,
        );
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        );

        const absoluteX = cursor.x * docWidth;
        const absoluteY = cursor.y * docHeight;

        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        const viewportX = absoluteX - scrollX;
        const viewportY = absoluteY - scrollY;

        return (
          <div
            key={id}
            className="absolute transition-all duration-100 ease-linear"
            style={{
              left: `${viewportX}px`,
              top: `${viewportY}px`,
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
        );
      })}
    </div>
  );
}
