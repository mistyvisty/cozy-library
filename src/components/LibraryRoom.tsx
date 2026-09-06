import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { findBook, sections } from "../data/books";
import { useFitScale } from "../hooks/useFitScale";
import { useTimeOfDay, type Season, type TimeOfDay } from "../hooks/useTimeOfDay";
import { FIREPLACE_BOTTOM, FIREPLACE_X, HOUSE_BOTTOM, HOUSE_X, useLibrary } from "../store/useLibrary";
import PawHouse from "./PawHouse";
import Avatar from "./Avatar";
import Bookcase from "./Bookcase";
import Owl from "./Owl";
import Dog from "./Dog";
import Fireplace from "./Fireplace";

// The two shelves with a scoped reaction — not one per genre (a lot of
// one-off art for a small payoff), just these two, easy to extend later.
const REACTIONS: Record<string, "spooked" | "eyeroll"> = {
  horror: "spooked",
  romance: "eyeroll",
};

const MOTES = [12, 28, 44, 61, 77, 90];

// One row per time-of-day bucket: the wall gradient, the window's sky glass
// and celestial body, and how strongly the lamp/dust-mote glow should read
// against it. `night` reproduces the room's original always-on look byte
// for byte, so anyone who only ever opens this in the evening sees no change.
const TIME_PALETTE: Record<
  TimeOfDay,
  {
    wall: [string, string, string];
    sky: string;
    celestial: string;
    celestialGlow: string;
    isSun: boolean;
    lampOpacity: number;
    showStars: boolean;
  }
> = {
  night: {
    wall: ["#3A2C55", "#4B3B6B", "#3A2C55"],
    sky: "#22345C",
    celestial: "#FFF3E0",
    celestialGlow: "rgba(255,243,224,0.35)",
    isSun: false,
    lampOpacity: 1,
    showStars: true,
  },
  sunrise: {
    wall: ["#4A3E68", "#8A6F92", "#C79BA0"],
    sky: "#D9A6A0",
    celestial: "#FFD98E",
    celestialGlow: "rgba(255,217,142,0.45)",
    isSun: true,
    lampOpacity: 0.55,
    showStars: false,
  },
  day: {
    wall: ["#7C71A6", "#9A90C4", "#7C71A6"],
    sky: "#9CC3E0",
    celestial: "#FFF3E0",
    celestialGlow: "rgba(255,243,224,0.5)",
    isSun: true,
    lampOpacity: 0.18,
    showStars: false,
  },
  sunset: {
    wall: ["#3F3260", "#6B4B63", "#4A3556"],
    sky: "#C97456",
    celestial: "#FBC490",
    celestialGlow: "rgba(251,196,144,0.5)",
    isSun: true,
    lampOpacity: 0.75,
    showStars: false,
  },
};

// Weather is decorative and "cycled or randomized on load" per the spec, not
// tied to a real forecast — picked once per mount, weighted toward snow in
// winter and toward clear/rain the rest of the year.
type Weather = "clear" | "rain" | "snow";
function pickWeather(season: Season): Weather {
  const pool: Weather[] = season === "winter" ? ["snow", "snow", "clear"] : ["clear", "clear", "rain"];
  return pool[Math.floor(Math.random() * pool.length)];
}
const SNOWFLAKES = [8, 22, 37, 50, 64, 79, 93];
const RAINDROPS = [10, 24, 39, 53, 68, 82, 95];

// Shelves are 11% of room width apart (center to center, since section 6
// added 2 more and every shelf's x had to be renumbered — see books.ts) and
// up to 132px wide at `sm:` and above. 1350 keeps roughly the same
// absolute-pixel clearance the original 6-shelf/15%-spacing/900px layout
// verified as safe (0.11 * 1350 ≈ 0.15 * 900), extended to 8 shelves.
const ROOM_DESIGN_WIDTH = 1350;

// Only used on a portrait (phone) screen — see useFitScale's own comment.
// Picked by screenshot iteration against real device-emulation profiles,
// not derived from a formula: tall enough that the room actually fills most
// of a phone screen instead of leaving a large empty gap above it, without
// making the room itself look absurdly cavernous.
const ROOM_DESIGN_HEIGHT = 2000;

export default function LibraryRoom() {
  const { ref: fitRef, scale, boxHeight } = useFitScale(ROOM_DESIGN_WIDTH, ROOM_DESIGN_HEIGHT);
  const {
    x,
    facing,
    isWalking,
    look,
    openSectionId,
    hoveredSectionId,
    carriedBookId,
    readingPhase,
    dogState,
    booksFinishedCount,
    walkTo,
    arrive,
    arriveAtChair,
    openBook,
    hoverSection,
    settleDog,
  } = useLibrary();
  const reduceMotion = useReducedMotion();
  const { timeOfDay, season } = useTimeOfDay();
  const palette = TIME_PALETTE[timeOfDay];
  const [weather] = useState(() => pickWeather(season));

  // A short settle beat once seated, then the book opens.
  useEffect(() => {
    if (readingPhase !== "sitting") return;
    const delay = reduceMotion ? 0 : 500;
    const id = setTimeout(openBook, delay);
    return () => clearTimeout(id);
  }, [readingPhase, reduceMotion, openBook]);

  // The dog wakes when a book is finished, then settles back to sleep a few
  // seconds later — same "settle beat" timeout pattern as the line above.
  useEffect(() => {
    if (dogState !== "awake") return;
    const delay = reduceMotion ? 0 : 4000;
    const id = setTimeout(settleDog, delay);
    return () => clearTimeout(id);
  }, [dogState, reduceMotion, settleDog]);

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
  const reactionSectionId = hoveredSectionId ?? openSectionId;
  const reaction = reactionSectionId ? REACTIONS[reactionSectionId] ?? null : null;

  // Below ROOM_DESIGN_WIDTH, the room switches from "fill whatever width is
  // available" (today's behavior, unchanged above the threshold) to "render
  // at a fixed reference width where shelves don't overlap, then shrink that
  // whole fixed layout down to fit" — scaling an already-responsive w-full
  // box would shrink it twice over, so the two modes can't share one style.
  const scaled = scale < 1;

  return (
    <div ref={fitRef} className="relative h-full w-full overflow-hidden">
      <div
        className={scaled ? "absolute left-1/2 top-1/2" : "relative h-full w-full"}
        style={
          scaled
            ? {
                width: ROOM_DESIGN_WIDTH,
                height: boxHeight,
                marginLeft: -ROOM_DESIGN_WIDTH / 2,
                marginTop: -boxHeight / 2,
                transform: `scale(${scale})`,
              }
            : undefined
        }
      >
      {/* wall — tinted per time-of-day bucket, `night` matches the room's
          original always-on gradient exactly */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ background: `linear-gradient(to bottom, ${palette.wall[0]}, ${palette.wall[1]}, ${palette.wall[2]})` }}
      />

      {/* lamplight pooling from above — fades out in full daylight, when the
          window is doing the lighting instead */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3 transition-opacity duration-1000"
        style={{
          background: "radial-gradient(60% 70% at 50% 0%, #FFD98E33, transparent 70%)",
          opacity: palette.lampOpacity,
        }}
      />

      {/* window — sun or moon depending on time of day, a snow cap in
          winter, a couple of stars only once it's actually dark out */}
      <div
        className="absolute left-[50%] top-[8%] hidden h-[110px] w-[150px] -translate-x-1/2 overflow-hidden rounded-t-full shadow-inner ring-4 ring-woodDeep transition-colors duration-1000 sm:block"
        style={{ background: palette.sky }}
      >
        {palette.showStars && (
          <>
            <span className="absolute left-4 top-4 h-1 w-1 rounded-full bg-cream/80" />
            <span className="absolute left-11 top-10 h-[3px] w-[3px] rounded-full bg-cream/60" />
            <span className="absolute left-7 top-16 h-1 w-1 rounded-full bg-cream/70" />
          </>
        )}
        <div
          className="absolute right-5 top-5 h-7 w-7 rounded-full"
          style={{ background: palette.celestial, boxShadow: `0 0 24px 8px ${palette.celestialGlow}` }}
        />
        {season === "winter" && (
          <div className="pointer-events-none absolute inset-x-0 -top-1.5 h-5 rounded-t-full bg-cream/90" />
        )}
        <div className="absolute left-1/2 top-1/2 h-1 w-full -translate-x-1/2 -translate-y-1/2 bg-woodDeep" />
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-woodDeep" />
      </div>

      {/* hanging lamp — dims along with the ambient lamplight above */}
      <div className="absolute left-[22%] top-0 flex flex-col items-center">
        <div className="h-12 w-[2px] bg-ink/50" />
        <div className="h-6 w-14 rounded-b-[28px] bg-blush shadow-lg" />
        <div
          className="h-24 w-24 rounded-full bg-lamp/20 blur-2xl transition-opacity duration-1000"
          style={{ opacity: palette.lampOpacity }}
        />
      </div>

      {/* falling snow or rain, picked once per visit */}
      {!reduceMotion &&
        weather !== "clear" &&
        (weather === "snow" ? SNOWFLAKES : RAINDROPS).map((left, i) => (
          <span
            key={left}
            className={
              weather === "snow"
                ? "snowfall pointer-events-none absolute top-0 h-1.5 w-1.5 rounded-full bg-cream/80"
                : "rainfall pointer-events-none absolute top-0 h-4 w-[2px] bg-cream/40"
            }
            style={{
              left: `${left}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: weather === "snow" ? `${6 + (i % 3)}s` : `${0.8 + (i % 3) * 0.15}s`,
            }}
          />
        ))}

      {/* dust motes — only read as lit once the lamp is actually the main
          light source, so they'd look wrong floating in full daylight */}
      {!reduceMotion &&
        timeOfDay !== "day" &&
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
          onHover={(hovering) => hoverSection(hovering ? s.id : null)}
        />
      ))}

      {/* owl, perched near the lamp/window — hoots from the moment she
          settles in ("sitting"), not once "reading" actually starts, since
          that's the instant the dim overlay covers the whole screen and
          would hide the hoot before it's ever seen */}
      <Owl
        look={look.owl}
        openSectionId={openSectionId}
        isReading={readingPhase === "sitting" || readingPhase === "reading"}
      />

      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-b from-wood to-woodDeep">
        <div className="absolute inset-x-0 top-0 h-1 bg-black/25" />
        {/* rug */}
        <div className="absolute bottom-[14%] left-1/2 h-[46%] w-[56%] -translate-x-1/2 rounded-[50%] bg-blush/25 ring-4 ring-blush/20" />
      </div>

      {/* paw house, left corner */}
      <PawHouse />

      {/* fireplace + sleepy dog, foreground rug — both declared after the
          floor div (like the paw house), since they sit deep enough into the
          floor's band that it would otherwise paint over them */}
      <Fireplace />
      <div className="absolute -translate-x-1/2" style={{ left: `${FIREPLACE_X}%`, bottom: `${FIREPLACE_BOTTOM}%` }}>
        <Dog look={look.dog} awake={dogState === "awake"} />
      </div>

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

      {/* potted plant, right corner — grows through 3 stages as more books
          get finished: a bare sprout, then the original 3-leaf plant, then a
          fuller 5-leaf version. Thresholds are a minor tunable, not a design
          risk. */}
      <div className="absolute bottom-[25%] right-[3%] hidden flex-col items-center sm:flex">
        <div className="flex items-end gap-1">
          {booksFinishedCount === 0 ? (
            <div className="h-5 w-3 origin-bottom rounded-full bg-mint" />
          ) : booksFinishedCount < 3 ? (
            <>
              <div className="h-10 w-3 origin-bottom -rotate-12 rounded-full bg-mint" />
              <div className="h-14 w-3 rounded-full bg-mint" />
              <div className="h-9 w-3 origin-bottom rotate-12 rounded-full bg-mint/80" />
            </>
          ) : (
            <>
              <div className="h-8 w-3 origin-bottom -rotate-[24deg] rounded-full bg-mint/80" />
              <div className="h-12 w-3 origin-bottom -rotate-12 rounded-full bg-mint" />
              <div className="h-16 w-3 rounded-full bg-mint" />
              <div className="h-12 w-3 origin-bottom rotate-12 rounded-full bg-mint" />
              <div className="h-8 w-3 origin-bottom rotate-[24deg] rounded-full bg-mint/80" />
            </>
          )}
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
            <Avatar
              look={look.cat}
              walking={isWalking && !reduceMotion}
              pose={pose}
              reaction={reaction}
              height={70}
            />
          </div>
          {/* shadow */}
          <div className="mt-[-4px] h-2 w-14 rounded-[50%] bg-black/35 blur-[3px]" />
        </div>
      </motion.div>
      </div>
    </div>
  );
}
