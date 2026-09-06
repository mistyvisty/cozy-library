import { motion } from "framer-motion";
import type { Section } from "../data/books";

type Props = {
  section: Section;
  // Where to position the case, as a % of the nearest positioned ancestor —
  // explicit rather than always reading section.x, since mobile's two-row
  // grid places each shelf at its own row-local slot, unrelated to the
  // single continuous x-axis the desktop room and the avatar's walk share.
  x: number;
  isOpen: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  onHover?: (hovering: boolean) => void;
  // Mobile's two-row shelf grid needs a much smaller card than any width
  // this component was actually built at (118/132px) — rather than hand-
  // rewrite every fixed size in here at a fraction of its value, `compact`
  // renders the exact same card at its natural size, wrapped in a CSS scale
  // transform, the same shrink-a-fixed-design-to-fit technique the room
  // itself uses (see useFitScale) — one visual source of truth, no risk of
  // the compact version silently drifting out of sync with the real one.
  compact?: boolean;
};

const NATURAL_WIDTH = 118;
// Measured directly (getBoundingClientRect, unscaled) — the card's height is
// driven by fixed padding/row/label sizes rather than anything proportional
// to width, so it doesn't casually reduce to a round number; guessing it
// instead of measuring it previously left the compact card's reserved
// layout box shorter than its actual (scaled) visual height, clipping the
// bottom row of books into whatever sits below it.
const NATURAL_HEIGHT = 179;
const COMPACT_SCALE = 0.66;

export default function Bookcase({ section, x, isOpen, isCurrent, onSelect, onHover, compact }: Props) {
  const card = (
    <motion.div
      animate={{ y: isCurrent ? -4 : 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className={`relative w-[118px] rounded-t-2xl bg-woodDeep px-2 pb-2 pt-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/30 transition group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-lamp ${
        compact ? "" : "sm:w-[132px]"
      }`}
    >
      {/* glow when you're standing here */}
      <div
        className="pointer-events-none absolute -inset-3 rounded-3xl opacity-0 blur-xl transition-opacity duration-500"
        style={{ background: section.accent, opacity: isOpen ? 0.25 : 0 }}
      />

      {[0, 1].map((row) => (
        <div key={row} className="mb-1.5 rounded-md bg-wood/70 px-1.5 pt-3">
          <div className="flex h-[46px] items-end justify-center gap-[3px]">
            {section.books.map((b, i) => (
              <div
                key={b.id + row}
                className="w-[9px] rounded-sm shadow-inner"
                style={{
                  height: `${(row === 0 ? b.spineHeight : 1.02 - b.spineHeight + 0.86) * 44}px`,
                  background: b.spineColor,
                  transform: i % 3 === 2 && row === 1 ? "rotate(6deg)" : undefined,
                }}
              />
            ))}
            {/* a couple of filler spines so shelves look full */}
            <div className="h-[38px] w-[7px] rounded-sm bg-cream/70" />
            <div className="h-[42px] w-[10px] rounded-sm bg-lamp/60" />
          </div>
          <div className="mt-1 h-[5px] rounded-sm bg-woodDeep" />
        </div>
      ))}

      {/* brass label plaque */}
      <div
        className="mx-auto -mb-1 w-fit rounded-md px-2 py-[3px] font-display text-[11px] font-semibold leading-none text-ink shadow"
        style={{ background: section.accent }}
      >
        {section.name}
      </div>
    </motion.div>
  );

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      aria-label={`Walk to the ${section.name} shelf`}
      className={
        compact
          ? "group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
          : // bottom-[25%] used to dip 1% of the room's own height into the
            // floor's own bottom-[26%] band — negligible at a few px (the
            // room's old, effectively-fixed unscaled height on any real
            // desktop window) but the same 1% swallowed the entire shelf
            // label, unclickably, once the room's fixed design height grew
            // large enough on phones for that 1% to exceed the label's own
            // rendered size. 26% removes the overlap outright rather than
            // just shrinking it back to a currently-small number that would
            // only break again at some other scale.
            "group absolute bottom-[26%] -translate-x-1/2 focus:outline-none"
      }
      style={
        compact
          ? { left: `${x}%`, top: "50%", width: NATURAL_WIDTH * COMPACT_SCALE, height: NATURAL_HEIGHT * COMPACT_SCALE }
          : { left: `${x}%` }
      }
    >
      {compact ? (
        <div style={{ width: NATURAL_WIDTH, transform: `scale(${COMPACT_SCALE})`, transformOrigin: "top left" }}>
          {card}
        </div>
      ) : (
        card
      )}
    </button>
  );
}
