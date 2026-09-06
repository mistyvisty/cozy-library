import { motion } from "framer-motion";
import type { Section } from "../data/books";

type Props = {
  section: Section;
  isOpen: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  onHover?: (hovering: boolean) => void;
};

export default function Bookcase({ section, isOpen, isCurrent, onSelect, onHover }: Props) {
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      aria-label={`Walk to the ${section.name} shelf`}
      className="group absolute bottom-[25%] -translate-x-1/2 focus:outline-none"
      style={{ left: `${section.x}%` }}
    >
      {/* case */}
      <motion.div
        animate={{ y: isCurrent ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative w-[118px] rounded-t-2xl bg-woodDeep px-2 pb-2 pt-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/30 transition group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-lamp sm:w-[132px]"
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
    </button>
  );
}
