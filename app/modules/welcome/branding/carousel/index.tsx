import { useEffect, useRef, useState } from "react";
import cn from "classnames";

export type MediaItem = {
  type: "image" | "video";
  src: string;
  originalSrc?: string;
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
      else if (w <= 770)
        setCount(2); // md (inclusive for iPad at 1024)
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
  enabled: boolean,
) {
  const offsetRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (contentRef.current) {
        contentRef.current.style.transform = "translateY(0px)";
      }
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    // Initialize time reference
    lastFrameTimeRef.current = performance.now();

    let animationFrameId: number;
    const animate = (now: number) => {
      if (containerRef.current && contentRef.current) {
        const deltaMs = now - lastFrameTimeRef.current;
        // Limit deltaMs to prevent large jumps if tab was inactive
        const safeDeltaMs = Math.min(deltaMs, 50);

        const deltaPx = (safeDeltaMs / 1000) * speedPxPerSec;
        offsetRef.current += deltaPx;

        // Ensure we have a valid height before doing modulo arithmetic
        if (contentRef.current.scrollHeight > 0) {
          const singleContentHeight = contentRef.current.scrollHeight / 2;

          if (singleContentHeight > 0) {
            const transformOffset = offsetRef.current % singleContentHeight;
            // Use translate3d for hardware acceleration
            contentRef.current.style.transform = `translate3d(0, -${transformOffset}px, 0)`;
          }
        }
      }
      lastFrameTimeRef.current = now;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef, contentRef, speedPxPerSec, enabled]);
}

const Carousel = ({
  items,
  setOpen,
  setIndex,
  canInteract,
}: {
  items: MediaItem[];
  setOpen: (open: boolean) => void;
  setIndex: (index: number) => void;
  canInteract: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();
  const isMobile = columnCount === 1;

  const allItems = [...items];

  // Increase speed for mobile (20px/s) vs desktop (14px/s)
  const speed = isMobile ? 20 : 14;

  useAutoTranslate(containerRef, contentRef, speed, true);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (isMobile) {
        container.style.userSelect = "none";
      } else {
        container.style.userSelect = "auto";
      }
    }
  }, [isMobile]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", {
        "pointer-events-none": isMobile,
      })}
    >
      <div
        ref={containerRef}
        className={cn("masonry-scroll", {
          "pointer-events-none": !canInteract,
        })}
      >
        <div
          ref={contentRef}
          style={{ columnCount: columnCount, columnGap: 0 }}
          className="w-full masonry-inner"
        >
          {allItems.map((item, idx) => {
            const handleItemClick = () => {
              setOpen(true);
              setIndex(idx % items.length);
            };

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
                  onClick={handleItemClick}
                  loading={idx < columnCount * 2 ? "eager" : "lazy"}
                  canInteract={canInteract}
                />
              );
            }
            return (
              <div
                key={`${item.src}-${idx}`}
                className={cn(
                  "masonry-item relative cursor-pointer break-inside-avoid mb-0 block",
                  (isMobile || !canInteract) && "pointer-events-none",
                )}
                onClick={handleItemClick}
              >
                <video
                  src={item.src}
                  className="w-full h-auto object-cover video-zoom block"
                  playsInline
                  autoPlay
                  muted
                  loop
                  preload="metadata"
                />
              </div>
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
  onClick,
  loading,
  canInteract = true,
}: {
  src: string;
  placeholder?: string;
  alt: string;
  width?: number;
  height?: number;
  onClick: () => void;
  loading?: "eager" | "lazy";
  canInteract?: boolean;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={cn(
        "masonry-item relative cursor-pointer overflow-hidden bg-cover bg-center break-inside-avoid mb-0 block",
        canInteract ? "pointer-events-auto" : "pointer-events-none",
      )}
      style={{
        aspectRatio: width && height ? `${width} / ${height}` : "auto",
        backgroundImage: `url(${placeholder})`,
      }}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
        loading={loading || "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        data-loaded={isLoaded}
      />
    </div>
  );
};

export default Carousel;
