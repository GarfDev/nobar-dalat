import { useEffect, useRef, useState } from "react";

type MediaItem = {
  type: "image" | "video";
  src: string;
  placeholder?: string;
  width?: number;
  height?: number;
  alt?: string;
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
  speedPxPerSec: number,
) {
  const offsetRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    let animationFrameId: number;
    const animate = (now: number) => {
      if (!containerRef.current || !contentRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const deltaMs = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const deltaPx = (deltaMs / 1000) * speedPxPerSec;
      offsetRef.current += deltaPx;

      const singleContentHeight = contentRef.current.scrollHeight / 2;

      if (singleContentHeight > 0) {
        const transformOffset = offsetRef.current % singleContentHeight;
        contentRef.current.style.transform = `translateY(-${transformOffset}px)`;
      } else {
        contentRef.current.style.transform = `translateY(0px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [containerRef, contentRef, speedPxPerSec]);
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

  const allItems = [...items];

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
                  alt={
                    item.alt ||
                    "A photo from the Nobar Đà Lạt restaurant and bar"
                  }
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
