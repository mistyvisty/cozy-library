import { create } from "zustand";
import { findSection } from "../data/books";

// If you've not used Zustand before: this is one shared object any component
// can read from. Components re-render only when the slice they read changes.

export type FurPreset = "orange" | "tuxedo" | "grey" | "cream";
export type CatLook = { fur: FurPreset; eyeColor: string };

// Every preset gets a base fur color plus a lighter "marking" (chest/belly/
// paws) — tuxedo isn't special-cased, it's just the preset whose marking
// happens to be a bold white rather than a subtle tint.
export const FUR_PRESETS: Record<FurPreset, { base: string; marking: string }> = {
  orange: { base: "#E3963E", marking: "#FBEAD2" },
  tuxedo: { base: "#2A2438", marking: "#FFF8EC" },
  grey: { base: "#9B9CA6", marking: "#F1EFE9" },
  cream: { base: "#EBD9B4", marking: "#FFF8EC" },
};
export const furPresetOrder: FurPreset[] = ["orange", "tuxedo", "grey", "cream"];
export const eyeColors = ["#7CB88A", "#E8B84B", "#6FA8D6", "#B5895A"];

// Not a shelf, so it doesn't live in data/books.ts — just a fixed walk target.
// Placed in the foreground on the rug rather than against the wall, so it
// never competes for space with the shelf row (see PawHouse.tsx, which must
// stay visually in sync with these two numbers). HOUSE_X also doubles as
// where she's left standing (at the shelf line) after closing the book, so
// it's deliberately a gap between two shelves (Romance at 27, Thriller at
// 42) rather than a shelf's own x — otherwise she'd stand on top of one.
export const HOUSE_X = 35;
export const HOUSE_BOTTOM = 4;

export type ReadingPhase = "idle" | "walkingToChair" | "sitting" | "reading";

type LibraryState = {
  look: CatLook;
  x: number; // avatar position, % of room width
  facing: 1 | -1;
  isWalking: boolean;
  destinationId: string | null; // where we're headed
  openSectionId: string | null; // whose shelf panel is showing
  carriedBookId: string | null;
  readingPhase: ReadingPhase;

  setLook: (patch: Partial<CatLook>) => void;
  walkTo: (sectionId: string) => void;
  arrive: () => void;
  closeShelf: () => void;
  takeBook: (bookId: string) => void;
  shelveBook: () => void;
  readBook: () => void;
  arriveAtChair: () => void;
  openBook: () => void;
  closeReading: () => void;
};

export const useLibrary = create<LibraryState>((set, get) => ({
  look: { fur: "orange", eyeColor: eyeColors[0] },
  x: 50,
  facing: 1,
  isWalking: false,
  destinationId: null,
  openSectionId: null,
  carriedBookId: null,
  readingPhase: "idle",

  setLook: (patch) => set((s) => ({ look: { ...s.look, ...patch } })),

  walkTo: (sectionId) => {
    const section = findSection(sectionId);
    if (!section) return;
    const { x } = get();
    if (Math.abs(section.x - x) < 0.5) {
      // Already standing there — just open the shelf.
      set({ openSectionId: sectionId, readingPhase: "idle" });
      return;
    }
    set({
      destinationId: sectionId,
      openSectionId: null,
      isWalking: true,
      facing: section.x > x ? 1 : -1,
      x: section.x,
      readingPhase: "idle",
    });
  },

  // Called when the walk animation finishes.
  arrive: () =>
    set((s) => ({
      isWalking: false,
      openSectionId: s.destinationId,
      destinationId: null,
    })),

  closeShelf: () => set({ openSectionId: null }),
  takeBook: (bookId) => set({ carriedBookId: bookId, openSectionId: null }),
  shelveBook: () => set({ carriedBookId: null }),

  readBook: () => {
    const { carriedBookId, x } = get();
    if (!carriedBookId) return;
    set({
      isWalking: true,
      facing: HOUSE_X > x ? 1 : -1,
      x: HOUSE_X,
      readingPhase: "walkingToChair",
      openSectionId: null,
    });
  },

  // Called when the walk-to-chair animation finishes.
  arriveAtChair: () => set({ isWalking: false, readingPhase: "sitting" }),

  openBook: () => set({ readingPhase: "reading" }),
  closeReading: () => set({ readingPhase: "idle" }),
}));
