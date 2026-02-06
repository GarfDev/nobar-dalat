import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import cn from "classnames";

const drinks = [
  {
    id: 'sac',
    name: 'sắc',
    ingredients: ['KABUSECHA-INFUSED VODKA', 'MATCHA — SHERRY CREAM', 'MARASCHINO', 'FERMENTED STRAWBERRY'],
    tags: 'SWEET AND SOUR',
    color: 'bg-[#7030a0]' // Purple-ish
  },
  {
    id: 'hoi',
    name: 'hỏi',
    ingredients: ['MEDIUM ROASTED COCOA BEANS', 'COCONUT RUM', 'MOUNTAIN PEPPER-INFUSED VODKA', 'CONDENSED PANDAN', 'NUTMEG — TABASCO'],
    tags: 'BOOZY - HARD - SPICY',
    color: 'bg-[#7030a0]'
  },
  {
    id: 'nang',
    name: 'nặng',
    ingredients: ['CORN-INFUSED BOURBON', 'HONEY', 'KNOB CREEK WHISKEY', 'CHOCOLATE BITTER — NUTMEG'],
    tags: 'CREAMY AND BITTER',
    color: 'bg-[#7030a0]'
  },
  {
    id: 'huyen',
    name: 'huyền',
    ingredients: ['JACKFRUIT', 'WHISKEY SHERRY', 'VANILLA — COCONUT', 'KOMBUCHA TEA', 'CO2'],
    tags: 'SWEET - CREAMY - REFRESHING',
    color: 'bg-[#7030a0]'
  },
  {
    id: 'nga',
    name: 'ngã',
    ingredients: ['FENNEL SEEDS-INFUSED WHISKEY', 'OOLONG TEA — HOPS', 'OOLONG-INFUSED GIN', 'AMARETO — ABSINTHE'],
    tags: 'SWEET AND SOUR - HERBAL - TEA',
    color: 'bg-[#7030a0]'
  },
  {
    id: 'khong',
    name: 'không',
    ingredients: ['NUTMEG-INFUSED VODKA', 'MEZCAL — MANGO — DILL', 'SHERRY CREAM — HOPS'],
    tags: 'SWEET AND SOUR - CREAMY',
    color: 'bg-[#7030a0]'
  }
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

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
      className="h-[100vh] w-[100vw] bg-white text-black relative overflow-hidden flex flex-col justify-center items-center"
    >
      {/* Navigation Buttons */}
      <div className="absolute left-4 z-20 top-1/2 -translate-y-1/2 md:left-10 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors" onClick={() => paginate(-1)}>
        <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 text-black/80" />
      </div>
      <div className="absolute right-4 z-20 top-1/2 -translate-y-1/2 md:right-10 cursor-pointer p-2 rounded-full hover:bg-black/5 transition-colors" onClick={() => paginate(1)}>
        <ChevronRight className="w-8 h-8 md:w-12 md:h-12 text-black/80" />
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
            opacity: { duration: 0.2 }
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
          className="absolute w-full h-full flex items-center justify-center px-12 md:px-24"
        >
          <div className="w-full max-w-6xl h-full md:h-[60vh] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
            
            {/* Text Part */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right z-10 md:-mr-12 pointer-events-none select-none">
              <h2 className="text-6xl md:text-9xl font-[100] tracking-tighter mb-4 md:mb-8 font-sans">
                {drink.name}
              </h2>
              
              <div className="space-y-1 md:space-y-2 mb-4 md:mb-8">
                {drink.ingredients.map((ing, i) => (
                  <p key={i} className="text-sm md:text-lg font-light uppercase tracking-widest">
                    {ing}
                  </p>
                ))}
              </div>

              <div className="bg-[#7030a0] text-white px-4 py-1 text-xs md:text-sm font-bold uppercase tracking-widest inline-block">
                {drink.tags}
              </div>
            </div>

            {/* Image Part - Placeholder for now as we don't have images */}
            <div className="w-full md:w-1/2 aspect-square md:h-full md:aspect-auto flex items-center justify-center relative z-0 md:-ml-12">
               <div className={cn("w-[280px] h-[280px] md:w-[450px] md:h-[450px] rounded-full mix-blend-multiply opacity-90 shadow-2xl flex items-center justify-center text-white/50 text-xl font-bold", drink.color)}>
                  {/* Placeholder for actual image */}
                  <span className="opacity-0">Drink Image</span>
                  {/* If real images exist: <img src={drink.image} className="w-full h-full object-contain" /> */}
               </div>
               
               {/* Drawing overlay effect (optional, mimicking the sketch style in provided images) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="0.5" fill="none" />
               </svg>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {drinks.map((_, i) => (
           <div 
             key={i} 
             className={cn("w-2 h-2 rounded-full transition-all duration-300", i === drinkIndex ? "bg-black w-8" : "bg-black/20")}
           />
        ))}
      </div>
      
    </motion.section>
  );
}

export default memo(Menu);
