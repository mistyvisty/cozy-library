import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { findBook, sections } from "../data/books";
import { HOUSE_BOTTOM, HOUSE_X, useLibrary } from "../store/useLibrary";
import PawHouse from "./PawHouse";
import Avatar from "./Avatar";
import Bookcase from "./Bookcase";

const MOTES = [12, 28, 44, 61, 77, 90];

export default function LibraryRoom() {
  const {
    x,
    facing,
    isWalking,
    look,
    openSectionId,
    carriedBookId,
    readingPhase,
    walkTo,
    arrive,
    arriveAtChair,
    openBook,
  } = useLibrary();
  const reduceMotion = useReducedMotion();

  // A short settle beat once seated, then the book opens.
  useEffect(() => {
    if (readingPhase !== "sitting") return;
    const delay = reduceMotion ? 0 : 500;
    const id = setTimeout(openBook, delay);
    return () => clearTimeout(id);
  }, [readingPhase, reduceMotion, openBook]);

  // Work out how long the walk should take, based on how far we're going.
  const prevX = useRef(x);
  const distance = Math.abs(x - prevX.current);
  useEffect(() => {
    prevX.current = x;
  }, [x]);
  const duration = reduceMotion ? 0 : Math.max(0.5, distance * 0.045);

  const carried = findBook(carriedBookId);

  // She stands at the shelf line to browse, but steps forward onto the rug
  // to sleep — the paw house lives in the foreground, not against the wall.
  const AVATAR_BOTTOM = 24;
  const bottomPct = readingPhase === "idle" ? AVATAR_BOTTOM : HOUSE_BOTTOM;

  // walking whenever she's actually moving (to a shelf or to the paw house);
  // otherwise curious while idle/browsing/carrying, or asleep once she's
  // settled in to read — there's no fourth pose for plain idle standing, so
  // curious covers that too.
  const pose = isWalking ? "walking" : readingPhase === "idle" ? "curious" : "sleeping";

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

      {/* paw house, left corner */}
      <PawHouse />

      {/* the book, resting open beside her while she sleeps — purely
          decorative, doesn't need to track the real current page, which is
          entirely ReadingView's job */}
      {readingPhase !== "idle" && carried && (
        <div
          className="absolute z-10"
          style={{ left: `${HOUSE_X + 9}%`, bottom: `${HOUSE_BOTTOM}%` }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 16" width="36" style={{ overflow: "visible" }}>
            <path d="M12 3 L1 5 L1 14 L12 12 Z" fill={carried.spineColor} />
            <path d="M12 3 L23 5 L23 14 L12 12 Z" fill={carried.spineColor} opacity="0.85" />
            <path d="M1 5 L12 3 L23 5" fill="none" stroke="#00000022" strokeWidth="0.5" />
          </svg>
        </div>
      )}

      {/* potted plant, right corner */}
      <div className="absolute bottom-[25%] right-[3%] hidden flex-col items-center sm:flex">
        <div className="flex items-end gap-1">
          <div className="h-10 w-3 origin-bottom -rotate-12 rounded-full bg-mint" />
          <div className="h-14 w-3 rounded-full bg-mint" />
          <div className="h-9 w-3 origin-bottom rotate-12 rounded-full bg-mint/80" />
        </div>
        <div className="h-10 w-14 rounded-b-2xl bg-blush/80" />
      </div>

      {/* the reader */}
      <motion.div
        className="absolute z-20 -translate-x-1/2"
        animate={{ left: `${x}%`, bottom: `${bottomPct}%` }}
        transition={{ duration, ease: "easeInOut" }}
        onAnimationComplete={() => {
          if (!isWalking) return;
          if (readingPhase === "walkingToChair") arriveAtChair();
          else arrive();
        }}
        style={{ left: `${x}%`, bottom: `${bottomPct}%` }}
      >
        <div className="relative flex flex-col items-center">
          <div
            className={isWalking && !reduceMotion ? "bob" : ""}
            style={{ transform: `scaleX(${facing})` }}
          >
            <Avatar look={look} walking={isWalking && !reduceMotion} pose={pose} height={70} />
          </div>
          {/* shadow */}
          <div className="mt-[-4px] h-2 w-14 rounded-[50%] bg-black/35 blur-[3px]" />
        </div>
      </motion.div>
    </div>
  );
}
