import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LibraryRoom from "./components/LibraryRoom";
import ShelfPanel from "./components/ShelfPanel";
import Customizer from "./components/Customizer";
import ReadingView from "./components/ReadingView";
import { useLibrary } from "./store/useLibrary";
import { findBook, findSection } from "./data/books";

export default function App() {
  const [customizing, setCustomizing] = useState(false);
  const {
    openSectionId,
    carriedBookId,
    readingPhase,
    closeShelf,
    takeBook,
    shelveBook,
    readBook,
    closeReading,
  } = useLibrary();

  const openSection = findSection(openSectionId);
  const carried = findBook(carriedBookId);

  return (
    <div className="flex h-dvh flex-col bg-ink font-body text-cream">
      <header className="flex items-center justify-between px-5 py-3">
        <div>
          <h1 className="font-display text-2xl leading-none text-cream">Cozy Library</h1>
          <p className="font-body text-xs text-cream/50">Pick a shelf. She'll walk over.</p>
        </div>
        <button
          onClick={() => setCustomizing((v) => !v)}
          className="rounded-full bg-cream/10 px-4 py-2 font-body text-sm text-cream transition hover:bg-cream/20"
        >
          Your look
        </button>
      </header>

      <main className="relative mx-auto w-full max-w-6xl flex-1 overflow-hidden rounded-t-[32px] ring-1 ring-white/5">
        <LibraryRoom />

        <ShelfPanel section={openSection} onTake={takeBook} onClose={closeShelf} />
        <Customizer open={customizing} onClose={() => setCustomizing(false)} />
        <ReadingView book={carried} phase={readingPhase} onClose={closeReading} />

        {/* what she's carrying */}
        {/* Framer Motion owns the whole `transform` property on a motion element
            that animates y, which cancels a CSS translate-x-1/2 centering class —
            center with flex on this plain wrapper instead. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <AnimatePresence>
            {carried && readingPhase === "idle" && (
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="pointer-events-auto w-[min(460px,92%)] rounded-3xl bg-cream/95 p-4 text-ink shadow-2xl"
              >
                <div className="flex gap-3">
                  <div
                    className="h-20 w-14 shrink-0 rounded-[4px] shadow-lg"
                    style={{ background: carried.spineColor }}
                  />
                  <div className="min-w-0">
                    <h2 className="font-display text-lg leading-tight">{carried.title}</h2>
                    <p className="font-body text-xs text-ink/60">
                      {carried.author} · {carried.year}
                    </p>
                    <p className="mt-1.5 font-body text-sm text-ink/75">{carried.blurb}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={shelveBook}
                    className="rounded-full bg-ink/10 px-4 py-1.5 font-body text-sm text-ink/70 transition hover:bg-ink/20"
                  >
                    Put it back
                  </button>
                  <button
                    onClick={readBook}
                    className="rounded-full bg-ink/80 px-4 py-1.5 font-body text-sm text-cream transition hover:bg-ink/90"
                  >
                    Read it
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
