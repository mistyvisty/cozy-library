import { AnimatePresence, motion } from "framer-motion";
import type { Section } from "../data/books";

type Props = {
  section: Section | undefined;
  onTake: (bookId: string) => void;
  onClose: () => void;
};

export default function ShelfPanel({ section, onTake, onClose }: Props) {
  return (
    // Framer Motion owns the whole `transform` property on a motion.div that
    // animates y/scale, which cancels a CSS translate-x-1/2 centering class —
    // center with flex on this plain wrapper instead.
    // Extra bottom clearance below `sm` clears Netlify's free-tier badge,
    // fixed to the real viewport's bottom-right corner (see App.tsx).
    <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-4 sm:bottom-4">
      <AnimatePresence>
        {section && (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pointer-events-auto w-[min(560px,92%)] rounded-3xl bg-cream/95 p-4 shadow-2xl ring-1 ring-black/10 backdrop-blur"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl leading-tight text-ink">{section.name}</h2>
                <p className="font-body text-sm text-ink/60">{section.tagline}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-ink/10 px-3 py-1 font-body text-sm text-ink/70 transition hover:bg-ink/20"
              >
                Close
              </button>
            </div>

            <ul className="grid gap-2">
              {section.books.map((book) => (
                <li key={book.id}>
                  <button
                    onClick={() => onTake(book.id)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-white/70 p-2.5 text-left transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
                  >
                    <span
                      className="h-12 w-8 shrink-0 rounded-[3px] shadow-md"
                      style={{ background: book.spineColor }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[15px] text-ink">{book.title}</span>
                      <span className="block truncate font-body text-xs text-ink/60">
                        {book.author} · {book.year}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0 rounded-full bg-ink px-3 py-1.5 font-body text-xs font-semibold text-cream">
                      Take it
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
