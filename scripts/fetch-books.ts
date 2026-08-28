// Downloads each book's plain text from Project Gutenberg, strips the
// license wrapper, splits it into chapters, and paginates each chapter into
// chunks that fit the reading-mode two-page spread — once, offline, by hand.
// The app never fetches at runtime: Gutendex's maintainer asked that the
// public API not take routine load, and Gutenberg's own servers don't need
// 18 requests on every visitor's page load either. Run with:
//
//   npm run fetch-books                  (all 18 books)
//   npm run fetch-books -- --only=franken,anna   (just these — for testing)

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allBooks } from "../src/data/books.ts";
import type { BookText } from "../src/data/bookText.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../src/data/book-text");

const PAGE_TARGET = 750;
const PAGE_MAX = 900;
const FALLBACK_WORDS_PER_CHAPTER = 2500;
const REQUEST_DELAY_MS = 700;

function textUrl(gutenbergId: number) {
  return `https://www.gutenberg.org/ebooks/${gutenbergId}.txt.utf-8`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Project Gutenberg's license permits redistributing this text as public
// domain specifically because the surrounding header/footer — which carries
// the trademark notice and the license terms themselves — is either kept
// fully intact or fully removed. We remove it here, so the app only ever
// ships the book's own words. Do not delete this step, and if it's ever
// changed, keep it an all-or-nothing strip: never emit a *partial* header.
function stripGutenbergWrapper(raw: string): { text: string; strippedCleanly: boolean } {
  const startMatch = raw.match(/^\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*\*\*\*\s*$/im);
  const endMatch = raw.match(/^\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK.*\*\*\*\s*$/im);
  if (!startMatch || !endMatch || startMatch.index === undefined || endMatch.index === undefined) {
    return { text: raw, strippedCleanly: false };
  }
  const start = startMatch.index + startMatch[0].length;
  const end = endMatch.index;
  return { text: raw.slice(start, end).trim(), strippedCleanly: true };
}

type RawChapter = { title: string; body: string };
type Heading = { line: number; kind: "part" | "chapter"; text: string };

// Top-level divisions above chapter level: "PART ONE", "BOOK TWO", or
// "THE SECOND EPOCH" (The Woman in White — whose table of contents lists
// these as bare "Second Epoch", ordinal-first and no "THE", but the real
// in-text headers are "THE SECOND EPOCH"; matching the ToC's form instead
// of this one was an earlier bug here — it matched the ToC, missed the
// real headers, and left every chapter mislabeled with a stale part name).
// Note there's no explicit "THE FIRST EPOCH" header in the source at all —
// chapters before the first real match are correctly left unprefixed.
const PART_OR_BOOK_RE = /^(PART|BOOK)\s+([A-Z]+)\.?\s*$/i;
const ORDINAL_EPOCH_RE = /^THE\s+(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH)\s+EPOCH\.?\s*$/i;
// Chapter headings, in the forms actually seen across these 18 books:
// "CHAPTER I." / "Chapter 1" / "CHAPTER 1. Loomings." (title text allowed
// after the number — a table of contents entry looks the same but gets
// filtered out separately, by the ToC-cluster pass, not by this regex).
const CHAPTER_ROMAN_RE = /^CHAPTER\s+([IVXLCDM]+)\.?\]?\s*.*$/i;
const CHAPTER_ARABIC_RE = /^CHAPTER\s+(\d+)\b.*$/i;
// A bare roman numeral alone on a line, with or without a trailing period
// (The Woman in White, The Time Machine, The War of the Worlds) — riskier
// in isolation since it has no "CHAPTER"/"Part" word to anchor on, but safe
// enough here because it still has to be the *entire* trimmed line, and the
// ToC-cluster pass catches the table-of-contents case the same as any other.
const BARE_ROMAN_RE = /^([IVXLCDM]+)\.?\s*$/;
// Some books (Frankenstein's framing narrative) use numbered Letters as
// their top-level structure instead of, or alongside, chapters.
const LETTER_RE = /^Letter\s+(\d+)\.?\s*$/;
// An unnumbered closing section (The Time Machine).
const EPILOGUE_RE = /^Epilogue\.?\s*$/i;

function titleCase(word: string) {
  return word.charAt(0) + word.slice(1).toLowerCase();
}

function findHeadings(lines: string[]): Heading[] {
  const headings: Heading[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const partOrBookMatch = line.match(PART_OR_BOOK_RE);
    if (partOrBookMatch) {
      headings.push({ line: i, kind: "part", text: `${titleCase(partOrBookMatch[1])} ${titleCase(partOrBookMatch[2])}` });
      continue;
    }

    const epochMatch = line.match(ORDINAL_EPOCH_RE);
    if (epochMatch) {
      headings.push({ line: i, kind: "part", text: `${titleCase(epochMatch[1])} Epoch` });
      continue;
    }

    const letterMatch = line.match(LETTER_RE);
    if (letterMatch) {
      headings.push({ line: i, kind: "chapter", text: `Letter ${letterMatch[1]}` });
      continue;
    }

    if (EPILOGUE_RE.test(line)) {
      headings.push({ line: i, kind: "chapter", text: "Epilogue" });
      continue;
    }

    const romanMatch = line.match(CHAPTER_ROMAN_RE);
    const arabicMatch = line.match(CHAPTER_ARABIC_RE);
    const bareRomanMatch = line.match(BARE_ROMAN_RE);
    const chapterNum = romanMatch?.[1] ?? arabicMatch?.[1] ?? bareRomanMatch?.[1];
    if (chapterNum) {
      headings.push({ line: i, kind: "chapter", text: `Chapter ${chapterNum.toUpperCase()}` });
    }
  }
  return headings;
}

// Most Gutenberg editions open with a table of contents that lists every
// chapter by name — which, once a line is trimmed, matches the exact same
// heading regexes as a real chapter start. A ToC entry is never more than a
// few lines from its neighbour (no chapter's worth of prose between them);
// a real chapter always is. So: a run of 3+ heading-like lines packed within
// a handful of lines of each other is a ToC, not real structure — drop the
// whole run, including its last entry (which would otherwise swallow every
// word between the ToC and the real first chapter under the wrong label).
const TOC_CLUSTER_GAP = 4;
const TOC_CLUSTER_MIN_SIZE = 3;

// Dropping a ToC run from the *heading* list isn't enough on its own — the
// ToC's own text (the list of chapter names itself) is still sitting in the
// document and would otherwise leak into whatever chapter body ends up
// containing that line range. So this also reports which lines the run
// spanned, to be blanked out of the text entirely, not just de-registered
// as headings.
function dropTableOfContentsRuns(headings: Heading[]): { headings: Heading[]; excisedLines: Set<number> } {
  const keep = headings.map(() => true);
  const excisedLines = new Set<number>();
  let clusterStart = 0;
  for (let i = 1; i <= headings.length; i++) {
    const clusterBroke = i === headings.length || headings[i].line - headings[i - 1].line > TOC_CLUSTER_GAP;
    if (clusterBroke) {
      if (i - clusterStart >= TOC_CLUSTER_MIN_SIZE) {
        for (let j = clusterStart; j < i; j++) keep[j] = false;
        // Also sweep up any plain text between/around the clustered heading
        // lines (e.g. a "CONTENTS" label, dot leaders) up to the next kept
        // heading or the next blank-then-substantial-content boundary.
        const spanStart = headings[clusterStart].line;
        const spanEnd = headings[i - 1].line;
        for (let line = spanStart; line <= spanEnd; line++) excisedLines.add(line);
      }
      clusterStart = i;
    }
  }
  return { headings: headings.filter((_, i) => keep[i]), excisedLines };
}

// Checked by hand across all 18 books: text before the first detected
// heading is, without exception, Gutenberg/transcriber front matter — a
// title page, a dedication, a transcriber's note, or a table of contents
// whose entries carry a title (e.g. "CHAPTER 1. Loomings.") and so never
// match the chapter regexes as headings in the first place, leaving their
// raw text sitting here unless something else accounts for it. So the
// default is to drop it. The one real exception found (Frankenstein's
// framing Letters) turned out to have its own proper heading pattern
// (`LETTER_RE` above) once looked for — the fix belongs in the matcher, not
// in a generic catch-all "keep it just in case" bucket, which is exactly
// what produced 13 books full of junk "Beginning" chapters on the first
// pass. This constant only controls the review-log threshold below, not
// whether the text is kept — it never is, automatically.
const MIN_LEADING_WORDS_TO_FLAG = 30;

function splitIntoChapters(text: string): { chapters: RawChapter[]; usedFallback: boolean; leadingWordsDropped: number } {
  const rawLines = text.split("\n");
  const { headings, excisedLines } = dropTableOfContentsRuns(findHeadings(rawLines));
  const lines = rawLines.map((l, i) => (excisedLines.has(i) ? "" : l));

  const headingIndexes: { line: number; label: string }[] = [];
  let currentPart: string | null = null;
  for (const h of headings) {
    if (h.kind === "part") {
      currentPart = h.text;
      continue;
    }
    headingIndexes.push({ line: h.line, label: currentPart ? `${currentPart} — ${h.text}` : h.text });
  }

  if (headingIndexes.length === 0) {
    return { chapters: fallbackSplit(text), usedFallback: true, leadingWordsDropped: 0 };
  }

  const chapters: RawChapter[] = [];

  const leading = lines.slice(0, headingIndexes[0].line).join("\n").trim();
  const leadingWordsDropped = leading ? leading.split(/\s+/).filter(Boolean).length : 0;

  for (let i = 0; i < headingIndexes.length; i++) {
    const { line: startLine, label } = headingIndexes[i];
    const endLine = i + 1 < headingIndexes.length ? headingIndexes[i + 1].line : lines.length;
    const body = lines.slice(startLine + 1, endLine).join("\n").trim();
    if (body) chapters.push({ title: label, body });
  }
  return { chapters: dedupeChapterTitles(chapters), usedFallback: false, leadingWordsDropped };
}

// A book whose numbering restarts mid-part (The Woman in White resets its
// roman numerals every time the narrator changes, which this script doesn't
// otherwise track) can produce two real, different chapters with the same
// label. Rather than parse every book's internal narrator/section structure
// to avoid it, just guarantee labels are unique after the fact — every
// chapter still has its own correct, ordered content either way, but an
// ambiguous label would make the chapter-list jump feature unusable.
function dedupeChapterTitles(chapters: RawChapter[]): RawChapter[] {
  const seen = new Map<string, number>();
  return chapters.map((c) => {
    const count = (seen.get(c.title) ?? 0) + 1;
    seen.set(c.title, count);
    return count === 1 ? c : { ...c, title: `${c.title} (${count})` };
  });
}

// Safety net only — an arbitrary word-count split cuts mid-scene and
// mislabels chapters. Any book that lands here should be treated as a bug
// in the heading matcher above, not a shippable result: find the book's
// real heading format and extend splitIntoChapters to cover it instead.
function fallbackSplit(text: string): RawChapter[] {
  const words = text.split(/\s+/);
  const chapters: RawChapter[] = [];
  for (let i = 0; i < words.length; i += FALLBACK_WORDS_PER_CHAPTER) {
    chapters.push({
      title: `Chapter ${chapters.length + 1}`,
      body: words.slice(i, i + FALLBACK_WORDS_PER_CHAPTER).join(" "),
    });
  }
  return chapters;
}

// Gutenberg's plain text hard-wraps every line at ~70 characters — a
// formatting artifact of the file format, not a real line break. Left
// alone, it renders as a paragraph of short, choppy lines instead of prose
// that flows to fill its container. Collapse the internal wraps back into
// spaces; a real paragraph break (a blank line) is handled separately by
// the split below and is left alone.
function reflow(paragraph: string): string {
  return paragraph.replace(/\s*\r?\n\s*/g, " ").trim();
}

function paginate(body: string): string[] {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => reflow(p))
    .filter(Boolean);

  const pages: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length > PAGE_MAX && current) {
      pages.push(current);
      current = para;
    } else {
      current = candidate;
    }
  }
  if (current) pages.push(current);
  return pages.length ? pages : [body];
}

function parseOnlyFlag(): string[] | null {
  const arg = process.argv.find((a) => a.startsWith("--only="));
  if (!arg) return null;
  return arg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const only = parseOnlyFlag();
  const books = only ? allBooks.filter((b) => only.includes(b.id)) : allBooks;
  if (only) {
    const missing = only.filter((id) => !allBooks.some((b) => b.id === id));
    if (missing.length) console.warn(`Unknown book id(s), skipping: ${missing.join(", ")}`);
  }

  const summary: string[] = [];
  const failed: string[] = [];
  const fellBackToArbitrarySplit: string[] = [];
  const droppedNotableLeadingContent: string[] = [];

  for (const book of books) {
    process.stdout.write(`${book.id.padEnd(12)} fetching...\r`);
    let raw: string;
    try {
      const res = await fetch(textUrl(book.gutenbergId), {
        headers: { "User-Agent": "cozy-library-fetch-books/1.0 (personal hobby project, run manually and rarely)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = await res.text();
    } catch (err) {
      console.log(`${book.id.padEnd(12)} FAILED: ${String(err)}`);
      failed.push(book.id);
      await sleep(REQUEST_DELAY_MS);
      continue;
    }

    const { text: stripped, strippedCleanly } = stripGutenbergWrapper(raw);
    if (!strippedCleanly) {
      console.warn(`${book.id.padEnd(12)} WARNING: could not find Gutenberg START/END markers — using full raw text`);
    }

    const { chapters: rawChapters, usedFallback, leadingWordsDropped } = splitIntoChapters(stripped);
    if (usedFallback) fellBackToArbitrarySplit.push(book.id);
    if (leadingWordsDropped >= MIN_LEADING_WORDS_TO_FLAG) {
      droppedNotableLeadingContent.push(`${book.id} (${leadingWordsDropped} words)`);
    }

    const chapters = rawChapters.map((c) => ({ title: c.title, pages: paginate(c.body) }));
    const totalPages = chapters.reduce((n, c) => n + c.pages.length, 0);

    const bookText: BookText = { gutenbergId: book.gutenbergId, chapters };
    await writeFile(path.join(OUT_DIR, `${book.id}.json`), JSON.stringify(bookText, null, 2));

    const flags = usedFallback ? " [FALLBACK SPLIT]" : "";
    const line = `${book.id.padEnd(12)} ${String(chapters.length).padStart(3)} chapters, ${String(totalPages).padStart(4)} pages${flags}`;
    console.log(line);
    summary.push(line);

    await sleep(REQUEST_DELAY_MS);
  }

  console.log("\n--- summary ---");
  summary.forEach((l) => console.log(l));
  if (fellBackToArbitrarySplit.length) {
    console.log(`\nFell back to arbitrary word-count split (needs a real heading fix, not acceptable as-is): ${fellBackToArbitrarySplit.join(", ")}`);
  }
  if (droppedNotableLeadingContent.length) {
    console.log(`\nDropped a notable amount of text before the first detected heading (title page / dedication / table of contents, presumed — verify none of it was real narrative): ${droppedNotableLeadingContent.join(", ")}`);
  }
  if (failed.length) {
    console.log(`\nFailed to fetch (rerun to retry): ${failed.join(", ")}`);
    process.exitCode = 1;
  }
}

main();
