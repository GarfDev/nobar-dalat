import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";
import { trackEvent } from "~/lib/utils";

const drinks = [
  {
    id: "elo",
    category: "elo",
    bgColor: "#fce7f3", // Pink 100
    accentColor: "#db2777", // Pink 600
    image: "/images/menu-optimized/image_1.webp", // Placeholder
    shape: "blob1",
  },
  {
    id: "sac",
    category: "dau",
    bgColor: "#fae8ff", // Light Fuchsia
    accentColor: "#a21caf",
    image: "/images/menu-optimized/image_1.webp",
    shape: "blob2",
  },
  {
    id: "hoi",
    category: "dau",
    bgColor: "#f5f5f4", // Warm Grey
    accentColor: "#57534e",
    image: "/images/menu-optimized/image_2.webp",
    shape: "blob3",
  },
  {
    id: "nang",
    category: "dau",
    bgColor: "#ffedd5", // Light Orange
    accentColor: "#c2410c",
    image: "/images/menu-optimized/image_3.webp",
    shape: "blob1",
  },
  {
    id: "huyen",
    category: "dau",
    bgColor: "#fef9c3", // Light Yellow
    accentColor: "#a16207",
    image: "/images/menu-optimized/image_4.webp",
    shape: "blob2",
  },
  {
    id: "nga",
    category: "dau",
    bgColor: "#dcfce7", // Light Green
    accentColor: "#15803d",
    image: "/images/menu-optimized/image_5.webp",
    shape: "blob3",
  },
  {
    id: "khong",
    category: "dau",
    bgColor: "#e0f2fe", // Light Sky
    accentColor: "#0369a1",
    image: "/images/menu-optimized/image_6.webp",
    shape: "blob1",
  },
  {
    id: "duongdai",
    category: "nobar",
    bgColor: "#e5e7eb", // Gray 200
    accentColor: "#111827", // Gray 900
    image: "/images/menu-optimized/image_1.webp", // Placeholder
    shape: "blob2",
  },
];

const shapes = {
  blob1: "30% 70% 70% 30% / 30% 30% 70% 70%",
  blob2: "63% 37% 37% 63% / 43% 37% 63% 57%",
  blob3: "46% 54% 28% 72% / 60% 38% 62% 40%",
};

const CATEGORIES = [{ id: "elo" }, { id: "dau" }, { id: "nobar" }];

const textVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.2, // Stagger text after image
      ease: "easeOut",
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  }),
};

const imageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.4,
    },
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const DrinkInfo = ({
  drink,
  className,
  direction,
}: {
  drink: (typeof drinks)[0];
  className?: string;
  direction: number;
}) => {
  const { t } = useTranslation();
  const name = t(`drinkMenu.items.${drink.id}.name`);
  const ingredients = t(`drinkMenu.items.${drink.id}.ingredients`, {
    returnObjects: true,
  }) as string[];
  const tags = t(`drinkMenu.items.${drink.id}.tags`);

  return (
    <motion.div
      custom={direction}
      variants={textVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={cn(
        "w-full flex flex-col items-center md:items-end text-center md:text-right pointer-events-none select-none",
        className,
      )}
    >
      <h2 className="text-6xl md:text-7xl lg:text-9xl font-[100] tracking-tighter mb-4 md:mb-8 font-sans">
        {name}
      </h2>

      <div className="space-y-1 md:space-y-2 mb-4 md:mb-8">
        {ingredients.map((ing: string, i: number) => (
          <p
            key={i}
            className="text-sm md:text-base lg:text-lg font-light uppercase tracking-widest"
          >
            {ing}
          </p>
        ))}
      </div>

      <div
        className="text-white px-4 py-1 text-xs md:text-sm font-bold uppercase tracking-widest inline-block"
        style={{ backgroundColor: drink.accentColor }}
      >
        {tags}
      </div>
    </motion.div>
  );
};

const MorphingImage = ({
  drink,
  direction,
}: {
  drink: (typeof drinks)[0];
  direction: number;
}) => {
  const { t } = useTranslation();
  const [shape, setShape] = useState(
    shapes[drink.shape as keyof typeof shapes],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const keys = Object.values(shapes);
      const randomShape = keys[Math.floor(Math.random() * keys.length)];
      setShape(randomShape);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={cn(
          "w-[320px] h-[320px] md:w-[380px] md:h-[380px] lg:w-[450px] lg:h-[450px] shrink-0 shadow-2xl overflow-hidden flex items-center justify-center relative transition-all duration-700 ease-in-out",
        )}
        style={{
          backgroundColor: drink.accentColor,
          borderRadius: shape,
          transition:
            "border-radius 4s ease-in-out, background-color 0.5s ease",
        }}
      >
        <img
          src={drink.image}
          alt={t(`drinkMenu.items.${drink.id}.name`)}
          className="w-full h-full object-cover"
        />

        {/* White Text Overlay - Clipped by Shape */}
        <div
          className="hidden md:flex absolute top-1/2 left-1/2 pointer-events-none w-[calc(100vw-12rem)] min-[1344px]:w-[72rem] items-center"
          style={{ transform: "translate(calc(-75% + 6rem), -50%)" }}
        >
          <div className="w-1/2 flex items-center justify-end md:-mr-12">
            <DrinkInfo
              drink={drink}
              className="text-white"
              direction={direction}
            />
          </div>
        </div>
      </div>

      {/* Drawing overlay effect - morphing SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 transition-all duration-700 ease-in-out"
        viewBox="0 0 100 100"
        style={{
          borderRadius: shape,
          transition: "border-radius 4s ease-in-out",
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="black"
          strokeWidth="0.5"
          fill="none"
        />
      </svg>
    </>
  );
};

export function Menu() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("dau");
  const [[page, direction], setPage] = useState([0, 0]);

  // Filter drinks by category
  const filteredDrinks = drinks.filter((d) => d.category === activeCategory);

  // Wrap index based on filtered drinks
  const drinkIndex =
    ((page % filteredDrinks.length) + filteredDrinks.length) %
    filteredDrinks.length;
  const drink = filteredDrinks[drinkIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
    trackEvent("slide_menu", {
      event_category: "menu",
      event_label: activeCategory,
      direction: newDirection > 0 ? "next" : "prev",
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
      trackEvent("change_category", {
        event_category: "menu",
        event_label: categoryId,
      });
      setPage([0, 0]); // Reset to first item of new category

      // Auto-scroll to selected category button
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <motion.section
      id="menu"
      animate={{ backgroundColor: drink.bgColor }}
      transition={{ duration: 0.5 }}
      className="h-[100vh] w-[100vw] text-black relative overflow-hidden flex flex-col justify-center items-center"
    >
      {/* Category Navigation - Top */}
      <div className="absolute top-8 md:top-12 z-30 w-full flex justify-center pointer-events-none">
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-4 no-scrollbar max-w-full px-4 pointer-events-auto snap-x snap-mandatory items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`category-${cat.id}`}
              onClick={() => handleCategoryChange(cat.id)}
              className={cn(
                "relative whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-bold tracking-widest uppercase transition-all duration-300 snap-center shrink-0",
                activeCategory === cat.id
                  ? "text-white"
                  : "text-black/50 hover:text-black/80 hover:bg-black/5",
              )}
            >
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-black rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {t(`drinkMenu.categories.${cat.id}`)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Controls (Grid Layout for Alignment) */}
      <div className="absolute bottom-8 w-full px-4 grid grid-cols-3 md:hidden items-center z-20">
        <button
          type="button"
          aria-label="Previous drink"
          className="justify-self-start cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-8 h-8 text-black/80" />
        </button>

        <div className="justify-self-center flex gap-2">
          {filteredDrinks.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === drinkIndex ? "bg-black w-8" : "bg-black/20",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next drink"
          className="justify-self-end cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-8 h-8 text-black/80" />
        </button>
      </div>

      {/* Desktop Navigation Buttons */}
      <button
        type="button"
        aria-label="Previous drink"
        className="hidden md:block absolute z-20 left-10 top-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-12 h-12 text-black/80" />
      </button>
      <button
        type="button"
        aria-label="Next drink"
        className="hidden md:block absolute z-20 right-10 top-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-12 h-12 text-black/80" />
      </button>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <div
          key={`${activeCategory}-${page}`}
          className="absolute w-full h-full flex items-center justify-center px-4 pb-24 pt-16 md:px-24 md:pb-0 md:pt-0"
        >
          <div className="w-full max-w-6xl h-full md:h-[60vh] lg:h-[70vh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {/* Text Part - Black (Background) */}
            <div className="w-full md:w-1/2 flex items-center justify-end z-0 md:-mr-12">
              <DrinkInfo drink={drink} direction={direction} />
            </div>

            {/* Image Part */}
            <motion.div
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              dragDirectionLock
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="w-full md:w-1/2 h-[370px] md:h-full md:aspect-auto flex items-center justify-center relative z-10 md:-ml-12"
            >
              <MorphingImage
                key={drink.id}
                drink={drink}
                direction={direction}
              />
            </motion.div>
          </div>
        </div>
      </AnimatePresence>

      {/* Desktop Pagination Indicators */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-2 z-20">
        {filteredDrinks.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === drinkIndex ? "bg-black w-8" : "bg-black/20",
            )}
          />
        ))}
      </div>
    </motion.section>
  );
}

export default memo(Menu);
