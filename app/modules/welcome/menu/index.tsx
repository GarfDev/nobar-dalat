import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";

const drinks = [
  {
    id: "sac",
    name: "sắc",
    ingredients: [
      "KABUSECHA-INFUSED VODKA",
      "MATCHA — SHERRY CREAM",
      "MARASCHINO",
      "FERMENTED STRAWBERRY",
    ],
    tags: "SWEET AND SOUR",
    bgColor: "#fae8ff", // Light Fuchsia
    accentColor: "#a21caf",
    image: "/images/menu/image_1.png",
  },
  {
    id: "hoi",
    name: "hỏi",
    ingredients: [
      "MEDIUM ROASTED COCOA BEANS",
      "COCONUT RUM",
      "MOUNTAIN PEPPER-INFUSED VODKA",
      "CONDENSED PANDAN",
      "NUTMEG — TABASCO",
    ],
    tags: "BOOZY - HARD - SPICY",
    bgColor: "#f5f5f4", // Warm Grey
    accentColor: "#57534e",
    image: "/images/menu/image_2.png",
  },
  {
    id: "nang",
    name: "nặng",
    ingredients: [
      "CORN-INFUSED BOURBON",
      "HONEY",
      "KNOB CREEK WHISKEY",
      "CHOCOLATE BITTER — NUTMEG",
    ],
    tags: "CREAMY AND BITTER",
    bgColor: "#ffedd5", // Light Orange
    accentColor: "#c2410c",
    image: "/images/menu/image_3.png",
  },
  {
    id: "huyen",
    name: "huyền",
    ingredients: [
      "JACKFRUIT",
      "WHISKEY SHERRY",
      "VANILLA — COCONUT",
      "KOMBUCHA TEA",
      "CO2",
    ],
    tags: "SWEET - CREAMY - REFRESHING",
    bgColor: "#fef9c3", // Light Yellow
    accentColor: "#a16207",
    image: "/images/menu/image_4.png",
  },
  {
    id: "nga",
    name: "ngã",
    ingredients: [
      "FENNEL SEEDS-INFUSED WHISKEY",
      "OOLONG TEA — HOPS",
      "OOLONG-INFUSED GIN",
      "AMARETO — ABSINTHE",
    ],
    tags: "SWEET AND SOUR - HERBAL - TEA",
    bgColor: "#dcfce7", // Light Green
    accentColor: "#15803d",
    image: "/images/menu/image_5.png",
  },
  {
    id: "khong",
    name: "không",
    ingredients: [
      "NUTMEG-INFUSED VODKA",
      "MEZCAL — MANGO — DILL",
      "SHERRY CREAM — HOPS",
    ],
    tags: "SWEET AND SOUR - CREAMY",
    bgColor: "#e0f2fe", // Light Sky
    accentColor: "#0369a1",
    image: "/images/menu/image_6.png",
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const DrinkInfo = ({
  drink,
  className,
}: {
  drink: (typeof drinks)[0];
  className?: string;
}) => (
  <div
    className={cn(
      "w-full flex flex-col items-center md:items-end text-center md:text-right pointer-events-none select-none",
      className,
    )}
  >
    <h2 className="text-6xl md:text-9xl font-[100] tracking-tighter mb-4 md:mb-8 font-sans">
      {drink.name}
    </h2>

    <div className="space-y-1 md:space-y-2 mb-4 md:mb-8">
      {drink.ingredients.map((ing: string, i: number) => (
        <p
          key={i}
          className="text-sm md:text-lg font-light uppercase tracking-widest"
        >
          {ing}
        </p>
      ))}
    </div>

    <div
      className="text-white px-4 py-1 text-xs md:text-sm font-bold uppercase tracking-widest inline-block"
      style={{ backgroundColor: drink.accentColor }}
    >
      {drink.tags}
    </div>
  </div>
);

export function Menu() {
  const { t } = useTranslation();
  const [[page, direction], setPage] = useState([0, 0]);

  // Wrap index
  const drinkIndex = ((page % drinks.length) + drinks.length) % drinks.length;
  const drink = drinks[drinkIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <motion.section
      id="menu"
      animate={{ backgroundColor: drink.bgColor }}
      transition={{ duration: 0.5 }}
      className="h-[100vh] w-[100vw] text-black relative overflow-hidden flex flex-col justify-center items-center"
    >
      {/* Mobile Controls (Grid Layout for Alignment) */}
      <div className="absolute bottom-8 w-full px-4 grid grid-cols-3 md:hidden items-center z-20">
        <div
          className="justify-self-start cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
          onClick={() => paginate(-1)}
        >
          <ChevronLeft className="w-8 h-8 text-black/80" />
        </div>

        <div className="justify-self-center flex gap-2">
          {drinks.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                i === drinkIndex ? "bg-black w-8" : "bg-black/20",
              )}
            />
          ))}
        </div>

        <div
          className="justify-self-end cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
          onClick={() => paginate(1)}
        >
          <ChevronRight className="w-8 h-8 text-black/80" />
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div
        className="hidden md:block absolute z-20 left-10 top-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-12 h-12 text-black/80" />
      </div>
      <div
        className="hidden md:block absolute z-20 right-10 top-1/2 -translate-y-1/2 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-12 h-12 text-black/80" />
      </div>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute w-full h-full flex items-center justify-center px-4 pb-24 md:px-24 md:pb-0"
        >
          <div className="w-full max-w-6xl h-full md:h-[60vh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            {/* Text Part - Black (Background) */}
            <div className="w-full md:w-1/2 flex items-center justify-end z-0 md:-mr-12">
              <DrinkInfo drink={drink} />
            </div>

            {/* Image Part */}
            <div className="w-full md:w-1/2 h-[320px] md:h-full md:aspect-auto flex items-center justify-center relative z-10 md:-ml-12">
              <div
                className={cn(
                  "w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full shadow-2xl overflow-hidden flex items-center justify-center relative",
                )}
                style={{ backgroundColor: drink.accentColor }}
              >
                <img
                  src={drink.image}
                  alt={drink.name}
                  className="w-full h-full object-cover"
                />

                {/* White Text Overlay - Clipped by Circle */}
                <div className="hidden md:flex absolute top-0 items-center justify-end h-full pointer-events-none w-[calc(50vw-96px)] min-[1344px]:w-[576px] left-[calc(465px-75vw)] min-[1344px]:left-[-543px]">
                  <div className="w-full">
                    {/* Inner container with same padding/structure as Text Part */}
                    <DrinkInfo drink={drink} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Drawing overlay effect */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="black"
                  strokeWidth="0.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Pagination Indicators */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 gap-2 z-20">
        {drinks.map((_, i) => (
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
