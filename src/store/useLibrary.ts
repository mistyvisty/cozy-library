import { create } from "zustand";
import { persist } from "zustand/middleware";
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

// Same {base, marking} preset pattern as the cat, one small table per pet.
export type OwlPreset = "brown" | "grey";
export type OwlLook = { fur: OwlPreset };
export const OWL_PRESETS: Record<OwlPreset, { base: string; marking: string }> = {
  brown: { base: "#8B6544", marking: "#E4D2AE" },
  grey: { base: "#8B93A0", marking: "#E7EAF0" },
};
export const owlPresetOrder: OwlPreset[] = ["brown", "grey"];

export type DogPreset = "brown" | "white";
export type DogLook = { fur: DogPreset };
export const DOG_PRESETS: Record<DogPreset, { base: string; marking: string }> = {
  brown: { base: "#A9713F", marking: "#F1E3CC" },
  white: { base: "#EDE7DC", marking: "#C9BBA3" },
};
export const dogPresetOrder: DogPreset[] = ["brown", "white"];

export type PetLooks = { cat: CatLook; owl: OwlLook; dog: DogLook };

// Not a shelf, so it doesn't live in data/books.ts — just a fixed walk target.
// Placed in the foreground on the rug rather than against the wall, so it
// never competes for space with the shelf row (see PawHouse.tsx, which must
// stay visually in sync with these two numbers). HOUSE_X also doubles as
// where she's left standing (at the shelf line) after closing the book, so
// it's deliberately a gap between two shelves rather than a shelf's own x —
// otherwise she'd stand on top of one. Section 6 renumbered every shelf's x
// (see books.ts) twice — once for the initial 8-shelf spacing, again to pull
// the whole row in from the room's right edge so it stopped overlapping the
// potted plant — landing here at 23.5, still the midpoint of the same
// Romance/Thriller gap it always occupied.
export const HOUSE_X = 23.5;
export const HOUSE_BOTTOM = 4;

// The dog's fireplace. Originally planned as a back-wall fixture in a shelf
// gap, like the window — turned out there's no such gap: shelves are close
// enough together at any reference width that there's only a few px of
// clearance between any two (the same constraint that pushed the paw house
// onto the foreground rug in the first place). So the fireplace joins it
// there instead, at a different x so the two don't collide. Moved along with
// section 6's shelf renumbering to 45.5, still the midpoint of the
// Horror/Fantasy gap it always occupied.
export const FIREPLACE_X = 45.5;
export const FIREPLACE_BOTTOM = 4;

// The owl's perch — fixed, upper-middle-right, clear of the window (x=50,
// hidden below `sm`) and the hanging lamp (x=22).
export const OWL_X = 60;

export type ReadingPhase = "idle" | "walkingToChair" | "sitting" | "reading";
export type DogState = "asleep" | "awake";
export type PetId = "cat" | "owl" | "dog";
const PET_ROTATION: PetId[] = ["cat", "owl", "dog"];

type LibraryState = {
  look: PetLooks;
  x: number; // avatar position, % of room width
  facing: 1 | -1;
  isWalking: boolean;
  destinationId: string | null; // where we're headed
  openSectionId: string | null; // whose shelf panel is showing
  hoveredSectionId: string | null; // for the cat's genre reactions
  carriedBookId: string | null;
  readingPhase: ReadingPhase;
  dogState: DogState;
  hungryPet: PetId;
  feedPrompt: boolean;
  happyPet: PetId | null; // brief happy-animation beat after feeding
  booksFinishedCount: number; // drives the plant's growth stage; persisted

  setLook: <P extends keyof PetLooks>(pet: P, patch: Partial<PetLooks[P]>) => void;
  walkTo: (sectionId: string) => void;
  arrive: () => void;
  closeShelf: () => void;
  hoverSection: (sectionId: string | null) => void;
  takeBook: (bookId: string) => void;
  shelveBook: () => void;
  readBook: () => void;
  arriveAtChair: () => void;
  openBook: () => void;
  closeReading: () => void;
  notifyBookFinished: () => void;
  settleDog: () => void;
  notifyChapterFinished: () => void;
  feedPet: () => void;
  clearHappyPet: () => void;
};

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
  look: {
    cat: { fur: "orange", eyeColor: eyeColors[0] },
    owl: { fur: "brown" },
    dog: { fur: "brown" },
  },
  x: 50,
  facing: 1,
  isWalking: false,
  destinationId: null,
  openSectionId: null,
  hoveredSectionId: null,
  carriedBookId: null,
  readingPhase: "idle",
  dogState: "asleep",
  hungryPet: "cat",
  feedPrompt: false,
  happyPet: null,
  booksFinishedCount: 0,

  setLook: (pet, patch) => set((s) => ({ look: { ...s.look, [pet]: { ...s.look[pet], ...patch } } })),
  hoverSection: (sectionId) => set({ hoveredSectionId: sectionId }),

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

  // Called by ReadingView when `nextPosition` returns null (the very last
  // page of the book). The dog wakes; Dog.tsx settles it back to sleep with
  // its own timeout, the same "settle beat" pattern LibraryRoom already uses
  // for the walk-to-chair -> sitting transition, rather than a store timer.
  // Same event grows the plant a stage — one "book finished" moment, two
  // independent consumers.
  notifyBookFinished: () =>
    set((s) => ({ dogState: "awake", booksFinishedCount: s.booksFinishedCount + 1 })),
  settleDog: () => set({ dogState: "asleep" }),

  // Called by ReadingView whenever a spread crosses into a new chapter.
  // Doesn't re-show the prompt if one's already up (finishing several short
  // chapters in a row while ignoring the prompt shouldn't stack banners).
  notifyChapterFinished: () =>
    set((s) => (s.feedPrompt ? s : { feedPrompt: true })),

  feedPet: () =>
    set((s) => {
      const fed = s.hungryPet;
      const next = PET_ROTATION[(PET_ROTATION.indexOf(fed) + 1) % PET_ROTATION.length];
      return { feedPrompt: false, hungryPet: next, happyPet: fed };
    }),
  clearHappyPet: () => set({ happyPet: null }),
    }),
    {
      name: "cozy-library",
      // Only what should survive a reload: the look customization and
      // reading progress. Position, walking/reading phase, and pet mood are
      // all mid-scene state — resuming those after a fresh load (e.g.
      // "reopen the reading modal mid-walk") wouldn't make sense, so they
      // intentionally reset to their defaults instead.
      partialize: (state) => ({ look: state.look, booksFinishedCount: state.booksFinishedCount }),
    }
  )
);
