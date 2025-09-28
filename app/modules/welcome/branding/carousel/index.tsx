import { useEffect, useRef, useState } from "react";

type MediaItem = {
  type: "image" | "video";
  src: string;
  placeholder?: string;
  width?: number;
  height?: number;
};

function useColumnCount() {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640)
        setCount(1); // sm: 1 column on mobile
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

function useAutoTranslate(
  containerRef: { current: HTMLElement | null },
  contentRef: { current: HTMLElement | null },
  speedPxPerSec = 12,
) {
  const rafId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    lastTimeRef.current = performance.now();

    const step = (now: number) => {
      if (!containerRef.current || !contentRef.current) return;
      const dt = Math.min(now - lastTimeRef.current, 100); // clamp
      lastTimeRef.current = now;
      const inc = (speedPxPerSec * dt) / 1000;
      offsetRef.current += inc;
      const maxOffset = Math.max(
        contentRef.current.scrollHeight - containerRef.current.clientHeight,
        0,
      );
      if (offsetRef.current >= maxOffset - 1) {
        offsetRef.current = 0;
      }
      contentRef.current.style.transform = `translate3d(0, -${offsetRef.current}px, 0)`;
      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (contentRef.current) contentRef.current.style.transform = "";
      offsetRef.current = 0;
    };
  }, [containerRef, contentRef, speedPxPerSec]);

  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current || !contentRef.current) return;
      const maxOffset = Math.max(
        contentRef.current.scrollHeight - containerRef.current.clientHeight,
        0,
      );
      if (offsetRef.current > maxOffset) offsetRef.current = 0;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [containerRef, contentRef]);
}

const Carousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();
  // Replace static items with dynamic fetch from /api/carousel-content
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/carousel-content");
        const data = await res.json();
        if (!cancelled) setItems(data.files);
      } catch (e) {
        // silently ignore; empty list renders nothing
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allItems = items;

  useAutoTranslate(containerRef, contentRef, 14);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div ref={containerRef} className="masonry-scroll">
        <div
          ref={contentRef}
          style={{ columnCount: columnCount, columnGap: 0 }}
          className="w-full masonry-inner"
        >
          {allItems.map((item, idx) => {
            if (item.type === "image") {
              return (
                <ImageWithPlaceholder
                  key={`${item.src}-${idx}`}
                  src={item.src}
                  placeholder={item.placeholder}
                  alt="carousel-item"
                  width={item.width}
                  height={item.height}
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
                preload="metadata"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ImageWithPlaceholder = ({
  src,
  placeholder,
  alt,
  width,
  height,
}: {
  src: string;
  placeholder?: string;
  alt: string;
  width?: number;
  height?: number;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="masonry-item relative bg-cover bg-center"
      style={{
        aspectRatio: width && height ? `${width} / ${height}` : "auto",
        backgroundImage: `url(${placeholder})`,
        filter: isLoaded ? "none" : "blur(5px)",
        transform: isLoaded ? "scale(1)" : "scale(1.1)",
        transition: "filter 0.2s ease-out, transform 0.2s ease-out",
      }}
    >
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export default Carousel;
