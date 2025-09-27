import { useEffect, useMemo, useRef, useState } from "react";

type MediaItem = {
  type: "image" | "video";
  src: string;
};

function useColumnCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640)
        setCount(2); // sm
      else if (w <= 1024)
        setCount(3); // md (inclusive for iPad at 1024)
      else setCount(4); // lg+
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

function useAutoScroll(ref: { current: HTMLElement | null }, speed = 0.2) {
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Respect reduced motion
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const step = () => {
      if (!ref.current) return;
      ref.current.scrollTop += speed;
      // Loop back to start for infinite scroll effect
      if (
        ref.current.scrollTop >=
        ref.current.scrollHeight - ref.current.clientHeight - 1
      ) {
        ref.current.scrollTop = 0;
      }
      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ref, speed]);
}

const Carousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();
  // Replace static items with dynamic fetch from /api/carousel-content
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/carousel-content");
        const data = await res.json();
        const files: string[] = Array.isArray(data?.files) ? data.files : [];
        const mapped: MediaItem[] = files.map((name) => {
          const lower = name.toLowerCase();
          const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm");
          const src = `/carousel-content/${encodeURIComponent(name)}`;
          return { type: isVideo ? "video" : "image", src };
        });
        if (!cancelled) setItems(mapped);
      } catch (e) {
        // silently ignore; empty list renders nothing
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Duplicate items to ensure we have enough content to scroll
  const allItems = items;

  useAutoScroll(scrollRef, 0.25);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div ref={scrollRef} className="masonry-scroll">
        <div
          style={{ columnCount: columnCount, columnGap: 0 }}
          className="w-full"
        >
          {allItems.map((item, idx) => {
            if (item.type === "image") {
              return (
                <img
                  key={`${item.src}-${idx}`}
                  src={item.src}
                  alt="carousel-item"
                  className="masonry-item"
                  loading="lazy"
                />
              );
            }
            return (
              <video
                key={`${item.src}-${idx}`}
                src={item.src}
                className="masonry-item"
                playsInline
                autoPlay
                muted
                loop
                preload="auto"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
