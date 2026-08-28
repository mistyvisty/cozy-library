import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { findBook, sections } from "../data/books";
import { useLibrary } from "../store/useLibrary";
import Avatar from "./Avatar";
import Bookcase from "./Bookcase";

const MOTES = [12, 28, 44, 61, 77, 90];

export default function LibraryRoom() {
  const { x, facing, isWalking, look, openSectionId, carriedBookId, walkTo, arrive } =
    useLibrary();
  const reduceMotion = useReducedMotion();

  // Work out how long the walk should take, based on how far we're going.
  const prevX = useRef(x);
  const distance = Math.abs(x - prevX.current);
  useEffect(() => {
    prevX.current = x;
  }, [x]);
  const duration = reduceMotion ? 0 : Math.max(0.5, distance * 0.045);

  const carried = findBook(carriedBookId);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* wall */}
      <div className="absolute inset-0 bg-gradient-to-b from-wallDeep via-wall to-wallDeep" />

      {/* lamplight pooling from above */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{ background: "radial-gradient(60% 70% at 50% 0%, #FFD98E33, transparent 70%)" }}
      />

      {/* window with a moon */}
      <div className="absolute left-[50%] top-[8%] hidden h-[110px] w-[150px] -translate-x-1/2 rounded-t-full bg-[#22345C] shadow-inner ring-4 ring-woodDeep sm:block">
        <div className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 bg-woodDeep" />
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-woodDeep" />
        <div className="absolute right-5 top-5 h-7 w-7 rounded-full bg-cream/90 shadow-[0_0_24px_8px_rgba(255,243,224,0.35)]" />
      </div>

      {/* hanging lamp */}
      <div className="absolute left-[22%] top-0 flex flex-col items-center">
        <div className="h-12 w-[2px] bg-ink/50" />
        <div className="h-6 w-14 rounded-b-[28px] bg-blush shadow-lg" />
        <div className="h-24 w-24 rounded-full bg-lamp/20 blur-2xl" />
      </div>

      {/* dust motes */}
      {!reduceMotion &&
        MOTES.map((left, i) => (
          <span
            key={left}
            className="mote pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-lamp/50"
            style={{ left: `${left}%`, top: `${20 + i * 8}%`, animationDelay: `${i * 1.4}s` }}
          />
        ))}

      {/* shelves */}
      {sections.map((s) => (
        <Bookcase
          key={s.id}
          section={s}
          isOpen={openSectionId === s.id}
          isCurrent={Math.abs(s.x - x) < 0.5}
          onSelect={() => walkTo(s.id)}
        />
      ))}

      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-b from-wood to-woodDeep">
        <div className="absolute inset-x-0 top-0 h-1 bg-black/25" />
        {/* rug */}
        <div className="absolute bottom-[14%] left-1/2 h-[46%] w-[56%] -translate-x-1/2 rounded-[50%] bg-blush/25 ring-4 ring-blush/20" />
      </div>

      {/* potted plant, right corner */}
      <div className="absolute bottom-[24%] right-[3%] hidden flex-col items-center sm:flex">
        <div className="flex items-end gap-1">
          <div className="h-10 w-3 origin-bottom -rotate-12 rounded-full bg-mint" />
          <div className="h-14 w-3 rounded-full bg-mint" />
          <div className="h-9 w-3 origin-bottom rotate-12 rounded-full bg-mint/80" />
        </div>
        <div className="h-10 w-14 rounded-b-2xl bg-blush/80" />
      </div>

      {/* the reader */}
      <motion.div
        className="absolute bottom-[22%] z-20 -translate-x-1/2"
        animate={{ left: `${x}%` }}
        transition={{ duration, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (isWalking) arrive();
        }}
        style={{ left: `${x}%` }}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={isWalking && !reduceMotion ? "bob" : ""}
            style={{ transform: `scaleX(${facing})` }}
          >
            <Avatar
              look={look}
              walking={isWalking && !reduceMotion}
              carryingColor={carried?.spineColor ?? null}
              height={140}
            />
          </div>
          {/* shadow */}
          <div className="mt-[-6px] h-2.5 w-16 rounded-[50%] bg-black/35 blur-[3px]" />
        </div>
      </motion.div>
    </div>
  );
}
