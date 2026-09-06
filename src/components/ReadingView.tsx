import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Book } from "../data/books";
import type { BookText } from "../data/bookText";
import { useLibrary, type PetId, type ReadingPhase } from "../store/useLibrary";

type Props = {
  book: Book | undefined;
  phase: ReadingPhase;
  onClose: () => void;
};

type Position = { chapterIdx: number; pageIdx: number };
type LoadState = "idle" | "loading" | "loaded" | "missing";

// Generated once, offline, by scripts/fetch-books.ts — see that file for why
// this is never fetched at runtime. Vite code-splits each entry, so opening
// a book only ever downloads that one book's JSON, not all 18.
const bookTextModules = import.meta.glob<{ default: BookText }>("../data/book-text/*.json");

const START: Position = { chapterIdx: 0, pageIdx: 0 };

function isTitleSpread(pos: Position) {
  return pos.chapterIdx === 0 && pos.pageIdx === 0;
}

// The very first spread pairs the existing cover-style left page with a
// single real page of text on the right, so the reader sees the book's
// identity before diving in. Every spread after that is two consecutive
// pages of running text — no page is ever reflowed to make this work, the
// title spread just "spends" one page instead of two.
// A chapter's last page is often much shorter than its neighbour (the
// leftover after greedily packing paragraphs into ~750-char pages) — CSS
// Grid stretches both page cells to match the taller one regardless, so a
// short final page would otherwise show as a big empty block under a couple
// of lines of text. Centering it, the same way the title page already is,
// reads as an intentional chapter-end rather than a rendering bug.
function getSpread(chapters: BookText["chapters"], pos: Position) {
  const chapter = chapters[pos.chapterIdx];
  if (isTitleSpread(pos)) {
    return { showTitle: true, left: null as string | null, right: chapter.pages[0] ?? null, leftIsChapterEnd: false, rightIsChapterEnd: chapter.pages.length === 1 };
  }
  const lastIdx = chapter.pages.length - 1;
  const left = chapter.pages[pos.pageIdx] ?? null;
  const right = pos.pageIdx + 1 < chapter.pages.length ? chapter.pages[pos.pageIdx + 1] : null;
  return {
    showTitle: false,
    left,
    right,
    leftIsChapterEnd: pos.pageIdx === lastIdx,
    rightIsChapterEnd: pos.pageIdx + 1 === lastIdx,
  };
}

function nextPosition(chapters: BookText["chapters"], pos: Position): Position | null {
  const consumed = isTitleSpread(pos) ? 1 : 2;
  const next = pos.pageIdx + consumed;
  if (next < chapters[pos.chapterIdx].pages.length) return { chapterIdx: pos.chapterIdx, pageIdx: next };
  if (pos.chapterIdx + 1 < chapters.length) return { chapterIdx: pos.chapterIdx + 1, pageIdx: 0 };
  return null;
}

function prevPosition(chapters: BookText["chapters"], pos: Position): Position | null {
  if (isTitleSpread(pos)) return null;
  if (pos.chapterIdx === 0 && pos.pageIdx === 1) return START;
  if (pos.pageIdx === 0) {
    const prevPages = chapters[pos.chapterIdx - 1].pages.length;
    const lastSpreadStart = Math.max(0, prevPages % 2 === 0 ? prevPages - 2 : prevPages - 1);
    return { chapterIdx: pos.chapterIdx - 1, pageIdx: lastSpreadStart };
  }
  return { chapterIdx: pos.chapterIdx, pageIdx: pos.pageIdx - 2 };
}

export default function ReadingView({ book, phase, onClose }: Props) {
  const reduceMotion = useReducedMotion();
  const show = phase === "reading" && !!book;
  const fade = { duration: reduceMotion ? 0 : 0.3 };

  const [text, setText] = useState<BookText | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [pos, setPos] = useState<Position>(START);
  const [showChapterList, setShowChapterList] = useState(false);

  // Fresh start every time a book is opened — no bookmarks yet (roadmap).
  useEffect(() => {
    if (!show || !book) return;
    setPos(START);
    setShowChapterList(false);
    setLoadState("loading");
    const loader = bookTextModules[`../data/book-text/${book.id}.json`];
    if (!loader) {
      setLoadState("missing");
      return;
    }
    let cancelled = false;
    loader().then((mod) => {
      if (cancelled) return;
      setText(mod.default);
      setLoadState("loaded");
    });
    return () => {
      cancelled = true;
    };
  }, [show, book?.id]);

  function close() {
    setShowChapterList(false);
    onClose();
  }

  // Esc always closes, even if the mouse never finds the button — a
  // must given the whole overlay used to be able to render taller than
  // the viewport with no way to scroll down to the close button at all.
  useEffect(() => {
    if (!show) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [show]);

  return (
    <AnimatePresence>
      {show && book && (
        <>
          <motion.div
            key="dim"
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onClick={close}
          />
          {/* Fixed to the real viewport, not just `main` — `main` has
              overflow-hidden and its own box excludes the header, so
              anchoring here instead of `absolute` means the card's max-height
              (in dvh, below) is never at the mercy of an ancestor clipping it
              before its own internal scroll can kick in.
              Framer Motion owns the whole `transform` property on any motion.div
              that animates scale/x/y, which silently cancels a CSS translate-x/y
              centering class — center with flex on a plain wrapper instead. */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
            <motion.div
              key="spread"
              className="pointer-events-auto w-full sm:w-[min(760px,92%)]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 220, damping: 24, delay: 0.12 }
              }
            >
              {loadState !== "loaded" || !text ? (
                <BlurbFallback book={book} loading={loadState === "loading"} onClose={close} />
              ) : (
                <Spread
                  book={book}
                  text={text}
                  pos={pos}
                  setPos={setPos}
                  showChapterList={showChapterList}
                  setShowChapterList={setShowChapterList}
                  onClose={close}
                />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Spread({
  book,
  text,
  pos,
  setPos,
  showChapterList,
  setShowChapterList,
  onClose,
}: {
  book: Book;
  text: BookText;
  pos: Position;
  setPos: (p: Position) => void;
  showChapterList: boolean;
  setShowChapterList: (v: boolean) => void;
  onClose: () => void;
}) {
  const { chapters } = text;
  const { showTitle, left, right, leftIsChapterEnd, rightIsChapterEnd } = getSpread(chapters, pos);
  const chapter = chapters[pos.chapterIdx];
  const pageNum = showTitle ? 1 : pos.pageIdx + 1;

  const next = nextPosition(chapters, pos);
  const prev = prevPosition(chapters, pos);
  const atEnd = next === null;

  // Wakes the sleepy dog (and, later, grows the plant) — fires once, the
  // moment a spread with no further pages is actually reached, not on the
  // click that would have gone nowhere (Next is already disabled by then).
  useEffect(() => {
    if (atEnd) useLibrary.getState().notifyBookFinished();
  }, [atEnd]);

  // The feed prompt, likewise, fires once per forward crossing into a new
  // chapter — not on Previous back into one already read, and not once per
  // page within the same chapter.
  const prevChapterIdx = useRef(pos.chapterIdx);
  useEffect(() => {
    if (pos.chapterIdx > prevChapterIdx.current) {
      useLibrary.getState().notifyChapterFinished();
    }
    prevChapterIdx.current = pos.chapterIdx;
  }, [pos.chapterIdx]);

  return (
    <div className="relative flex h-[560px] max-h-[85dvh] flex-col overflow-hidden rounded-2xl bg-ink/10 shadow-2xl">
      <FeedBanner />
      {/* Fixed height (max-height still applies on short windows, whichever is
          smaller wins) — pages used to size the card to their own content, so
          the whole modal visibly grew and shrank on every Next/Previous click.
          The pages scroll internally if a spread is ever taller than the
          available space (a very short window, or an unusually long page) —
          the controls bar below is a separate flex sibling, never inside
          this scroll area, so it can't be pushed off-screen. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px overflow-y-auto sm:grid-cols-2">
        {/* left page */}
        <div className="flex flex-col bg-cream/95 p-6">
          {showTitle ? (
            <div className="m-auto flex flex-col items-center gap-3 text-center">
              <div className="h-28 w-20 rounded-[4px] shadow-lg" style={{ background: book.spineColor }} />
              <h2 className="font-display text-xl leading-tight text-ink">{book.title}</h2>
              <p className="font-body text-sm text-ink/60">
                {book.author} · {book.year}
              </p>
            </div>
          ) : (
            <p
              className={`whitespace-pre-line font-body text-[15px] leading-relaxed text-ink/85 ${leftIsChapterEnd ? "m-auto text-center" : ""}`}
            >
              {left}
            </p>
          )}
        </div>
        {/* right page */}
        <div className="flex flex-col bg-cream/95 p-6">
          {right ? (
            <p
              className={`whitespace-pre-line font-body text-[15px] leading-relaxed text-ink/85 ${rightIsChapterEnd ? "m-auto text-center" : ""}`}
            >
              {right}
            </p>
          ) : (
            <p className="m-auto font-display text-sm text-ink/40">The End</p>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-ink/10 bg-cream/95 px-4 py-2.5">
        <button
          onClick={onClose}
          className="rounded-full bg-ink/10 px-3 py-1 font-body text-xs text-ink/70 transition hover:bg-ink/20"
        >
          Close
        </button>
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => setShowChapterList(!showChapterList)}
            className="font-body text-xs text-ink/60 underline decoration-ink/30 underline-offset-2 hover:text-ink"
          >
            {chapter.title} · Page {pageNum} of {chapter.pages.length}
          </button>
          <AnimatePresence>
            {showChapterList && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-1/2 z-10 mb-2 max-h-64 w-56 -translate-x-1/2 overflow-y-auto rounded-xl bg-cream p-2 text-left shadow-xl ring-1 ring-ink/10"
              >
                {chapters.map((c, i) => (
                  <button
                    key={`${c.title}-${i}`}
                    onClick={() => {
                      setPos({ chapterIdx: i, pageIdx: 0 });
                      setShowChapterList(false);
                    }}
                    className={`block w-full truncate rounded-lg px-2.5 py-1.5 text-left font-body text-xs transition hover:bg-ink/10 ${
                      i === pos.chapterIdx ? "font-semibold text-ink" : "text-ink/70"
                    }`}
                  >
                    {c.title}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => prev && setPos(prev)}
            disabled={!prev}
            className="rounded-full bg-ink/10 px-3 py-1 font-body text-xs text-ink/70 transition hover:bg-ink/20 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <button
            onClick={() => next && setPos(next)}
            disabled={!next}
            className="rounded-full bg-ink px-3 py-1 font-body text-xs text-cream transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const PET_EMOJI: Record<PetId, string> = { cat: "🐱", owl: "🦉", dog: "🐶" };
const PET_NAME: Record<PetId, string> = { cat: "The cat", owl: "The owl", dog: "The dog" };
// Reuses each pet's existing animation vocabulary rather than inventing a
// new keyframe per pet — tailSway already reads as a wag, and spin/hop are
// the only two genuinely new ones needed.
const HAPPY_TEXT: Record<PetId, string> = { cat: "purrs happily!", owl: "hoots happily!", dog: "wags happily!" };
const HAPPY_CLASS: Record<PetId, string> = { cat: "spin", owl: "hop", dog: "tailSway" };

// Shows when a chapter finishes ("hungryPet" wants feeding) and briefly
// again with a happy animation right after feeding — sits inside the
// reading card itself, not the dimmed room behind it, since that's barely
// visible during reading and easy to miss a reaction in.
function FeedBanner() {
  const feedPrompt = useLibrary((s) => s.feedPrompt);
  const hungryPet = useLibrary((s) => s.hungryPet);
  const happyPet = useLibrary((s) => s.happyPet);
  const feedPet = useLibrary((s) => s.feedPet);
  const clearHappyPet = useLibrary((s) => s.clearHappyPet);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!happyPet) return;
    const id = setTimeout(clearHappyPet, 1600);
    return () => clearTimeout(id);
  }, [happyPet, clearHappyPet]);

  const show = feedPrompt || !!happyPet;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          className="absolute inset-x-4 top-3 z-10 flex items-center justify-between gap-3 rounded-xl bg-cream px-3 py-2 shadow-lg ring-1 ring-ink/10"
        >
          {happyPet ? (
            <span className="font-body text-sm text-ink/80">
              <span className={`inline-block ${reduceMotion ? "" : HAPPY_CLASS[happyPet]}`}>
                {PET_EMOJI[happyPet]}
              </span>{" "}
              {PET_NAME[happyPet]} {HAPPY_TEXT[happyPet]}
            </span>
          ) : (
            <>
              <span className="font-body text-sm text-ink/80">
                {PET_EMOJI[hungryPet]} {PET_NAME[hungryPet]} is hungry.
              </span>
              <button
                onClick={feedPet}
                className="shrink-0 rounded-full bg-ink px-3 py-1 font-body text-xs text-cream transition hover:bg-ink/90"
              >
                Feed
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Shown while a book's text is still loading, and for any book that hasn't
// been through `npm run fetch-books` yet — never a hard failure.
function BlurbFallback({ book, loading, onClose }: { book: Book; loading: boolean; onClose: () => void }) {
  return (
    <div className="grid h-[560px] max-h-[85dvh] grid-cols-1 gap-px overflow-y-auto rounded-2xl bg-ink/10 shadow-2xl sm:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-3 bg-cream/95 p-6 text-center">
        <div className="h-28 w-20 rounded-[4px] shadow-lg" style={{ background: book.spineColor }} />
        <h2 className="font-display text-xl leading-tight text-ink">{book.title}</h2>
        <p className="font-body text-sm text-ink/60">
          {book.author} · {book.year}
        </p>
      </div>
      <div className="flex flex-col bg-cream/95 p-6">
        <p className="font-body text-base leading-relaxed text-ink/80">
          {loading ? "Opening the book…" : book.blurb}
        </p>
        <button
          onClick={onClose}
          className="mt-auto self-end rounded-full bg-ink/10 px-4 py-1.5 font-body text-sm text-ink/70 transition hover:bg-ink/20"
        >
          Close the book
        </button>
      </div>
    </div>
  );
}
