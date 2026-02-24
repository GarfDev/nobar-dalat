import { useEffect, useState, useRef } from "react";
import { supabase } from "~/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { motion, useSpring } from "framer-motion";

type DeviceType = "mobile" | "tablet" | "desktop";

interface CursorPosition {
  x: number;
  y: number;
  deviceType: DeviceType;
  userId: string;
  color: string;
  shape: string;
  onlineAt: number;
}

const COLORS = [
  "#db2777", // Pink 600
  "#a21caf", // Purple
  "#57534e", // Warm Grey
  "#c2410c", // Orange
  "#a16207", // Yellow
  "#15803d", // Green
  "#0369a1", // Sky
  "#111827", // Gray 900
];

const SHAPES = [
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "63% 37% 37% 63% / 43% 37% 63% 57%",
  "46% 54% 28% 72% / 60% 38% 62% 40%",
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

const Cursor = ({ cursor, id }: { cursor: CursorPosition; id: string }) => {
  // Increase damping slightly to reduce oscillation when moving quickly
  const x = useSpring(0, { stiffness: 400, damping: 35 });
  const y = useSpring(0, { stiffness: 400, damping: 35 });
  const [visible, setVisible] = useState(false);

  // Queue to store incoming positions
  const positionQueue = useRef<{ x: number; y: number }[]>([]);
  const processingRef = useRef(false);

  const updateSprings = (targetX: number, targetY: number) => {
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

    const absoluteX = targetX * docWidth;
    const absoluteY = targetY * docHeight;

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const viewportX = absoluteX - scrollX;
    const viewportY = absoluteY - scrollY;

    x.set(viewportX);
    y.set(viewportY);
    setVisible(targetX >= 0 && targetY >= 0);
  };

  const processQueue = () => {
    if (positionQueue.current.length === 0) {
      processingRef.current = false;
      return;
    }

    processingRef.current = true;
    const nextPos = positionQueue.current.shift();

    if (nextPos) {
      updateSprings(nextPos.x, nextPos.y);
    }

    // Process next item after a delay matching the sender's throttle rate (20ms)
    // If queue is backing up, speed up slightly
    const delay = positionQueue.current.length > 5 ? 10 : 20;
    setTimeout(processQueue, delay);
  };

  // Add new position to queue when cursor prop updates
  useEffect(() => {
    positionQueue.current.push({ x: cursor.x, y: cursor.y });

    // If not already processing, start the loop
    if (!processingRef.current) {
      processQueue();
    }
  }, [cursor.x, cursor.y]);

  // Handle scroll/resize updates for CURRENT position
  useEffect(() => {
    const handleLayoutChange = () => {
      // We use the current spring values as base, but need to re-project them?
      // Actually, springs contain viewport coordinates.
      // If user scrolls, the viewport coordinates of the TARGET should change.
      // But since we are processing a queue, the "current target" is transient.

      // Simpler approach: Just re-process the current cursor prop as a "refresh"
      // But that might add a jump.
      // Ideally, we just update the springs to shift by scroll delta?

      // For simplicity, let's just let the next queue item correct it,
      // or if queue is empty, re-set to current cursor prop.
      if (positionQueue.current.length === 0) {
        updateSprings(cursor.x, cursor.y);
      }
    };

    window.addEventListener("scroll", handleLayoutChange);
    window.addEventListener("resize", handleLayoutChange);

    return () => {
      window.removeEventListener("scroll", handleLayoutChange);
      window.removeEventListener("resize", handleLayoutChange);
    };
  }, [cursor.x, cursor.y]); // Re-bind when cursor changes so we have latest ref

  return (
    <motion.div
      key={id}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        x,
        y,
        display: visible ? "block" : "none",
        zIndex: 9999,
      }}
    >
      <div
        className="w-4 h-4 rounded-full opacity-60 animate-pulse"
        style={{
          backgroundColor: cursor.color,
          borderRadius: cursor.shape,
          transform: "translate(-50%, -50%)",
          boxShadow: `0 0 10px ${cursor.color}`,
        }}
      />
    </motion.div>
  );
};

export function CursorSync() {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const [myDeviceType, setMyDeviceType] = useState<DeviceType>("desktop");

  // Use lazy initialization for stable IDs
  const [userId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [color] = useState(
    () => COLORS[Math.floor(Math.random() * COLORS.length)],
  );
  const [shape] = useState(
    () => SHAPES[Math.floor(Math.random() * SHAPES.length)],
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

    // Handle initial state from Presence
    channel
      .on("presence", { event: "sync" }, () => {
        const newState = channel.presenceState<CursorPosition>();
        const newCursors: Record<string, CursorPosition> = { ...cursors };

        Object.entries(newState).forEach(([key, value]) => {
          if (key === userId) return;

          const presence = value[value.length - 1];
          if (presence && presence.deviceType === myDeviceType) {
            newCursors[key] = presence;
          }
        });

        setCursors(newCursors);
      })
      // Listen for direct broadcast events for high-frequency updates
      .on("broadcast", { event: "cursor-move" }, ({ payload }) => {
        // payload: { userId, x, y }
        if (payload.userId === userId) return;

        setCursors((prev) => {
          const userCursor = prev[payload.userId];
          if (!userCursor) return prev; // Wait for presence to establish base state

          return {
            ...prev,
            [payload.userId]: {
              ...userCursor,
              x: payload.x,
              y: payload.y,
            },
          };
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            x: -1,
            y: -1,
            deviceType: myDeviceType,
            userId,
            color,
            shape,
            onlineAt,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, myDeviceType, color, shape, onlineAt, session]);

  useEffect(() => {
    if (!channelRef.current) return;

    // Use requestAnimationFrame for smoother updates
    let rafId: number;
    let lastUpdate = 0;
    const THROTTLE_MS = 20; // Increase frequency (50fps)

    const updateCursor = (x: number, y: number) => {
      const now = Date.now();
      if (now - lastUpdate < THROTTLE_MS) return;
      lastUpdate = now;

      if (channelRef.current) {
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

        const normalizedX = (x + scrollX) / docWidth;
        const normalizedY = (y + scrollY) / docHeight;

        // Broadcast movement directly (faster than Presence)
        channelRef.current.send({
          type: "broadcast",
          event: "cursor-move",
          payload: {
            userId,
            x: normalizedX,
            y: normalizedY,
          },
        });

        // Optionally update Presence occasionally for late joiners (less frequent)
        if (Math.random() < 0.05) {
          // ~1 in 20 updates
          channelRef.current.track({
            x: normalizedX,
            y: normalizedY,
            deviceType: myDeviceType,
            userId,
            color,
            shape,
            onlineAt,
          });
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        updateCursor(e.clientX, e.clientY);
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        rafId = requestAnimationFrame(() => {
          updateCursor(e.touches[0].clientX, e.touches[0].clientY);
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, [myDeviceType, userId, color, shape, onlineAt, session]); // Add session dependency to re-bind events if needed

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {Object.entries(cursors).map(([id, cursor]) => (
        <Cursor key={id} cursor={cursor} id={id} />
      ))}
    </div>
  );
}
