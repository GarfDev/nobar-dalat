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
      if (containerRef.current && contentRef.current) {
        const deltaMs = now - lastFrameTimeRef.current;
        const deltaPx = (deltaMs / 1000) * speedPxPerSec;
        offsetRef.current += deltaPx;

        const singleContentHeight = contentRef.current.scrollHeight / 2;

        if (singleContentHeight > 0) {
          const transformOffset = offsetRef.current % singleContentHeight;
          contentRef.current.style.transform = `translateY(-${transformOffset}px)`;
        } else {
          contentRef.current.style.transform = `translateY(0px)`;
        }
      }
      lastFrameTimeRef.current = now;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [containerRef, contentRef, speedPxPerSec]);
}

const Carousel = ({
  items,
  setOpen,
  setIndex,
}: {
  items: MediaItem[];
  setOpen: (open: boolean) => void;
  setIndex: (index: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();

  const allItems = [...items];

  useAutoTranslate(containerRef, contentRef, 14);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="masonry-scroll">
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
                />
              );
            }
            return (
              <video
                key={`${item.src}-${idx}`}
                src={item.src}
                className="masonry-item cursor-pointer"
                playsInline
                autoPlay
                muted
                loop
                preload="metadata"
                onClick={handleItemClick}
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
  onClick,
  loading,
}: {
  src: string;
  placeholder?: string;
  alt: string;
  width?: number;
  height?: number;
  onClick: () => void;
  loading?: "eager" | "lazy";
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className="masonry-item pointer-events-auto relative cursor-pointer overflow-hidden bg-cover bg-center"
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
