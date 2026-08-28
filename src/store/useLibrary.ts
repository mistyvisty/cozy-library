import { create } from "zustand";
import { findSection } from "../data/books";

// If you've not used Zustand before: this is one shared object any component
// can read from. Components re-render only when the slice they read changes.

export type AvatarLook = {
  skin: string;
  hair: string;
  hairStyle: "bun" | "bob" | "curls" | "short";
  outfit: string;
};

export const skinTones = ["#F3D2B3", "#E5B18A", "#C98B60", "#9C6440", "#6E4326"];
export const hairColors = ["#3A2A2A", "#7A4B2A", "#C9873F", "#E2E0D6", "#8A6FB0", "#D77FA1"];
export const outfitColors = ["#9FD8BE", "#F5A3B0", "#8FB8F0", "#F5C77E", "#C4A7E7"];
export const hairStyles: AvatarLook["hairStyle"][] = ["bun", "bob", "curls", "short"];

type LibraryState = {
  look: AvatarLook;
  x: number; // avatar position, % of room width
  facing: 1 | -1;
  isWalking: boolean;
  destinationId: string | null; // where we're headed
  openSectionId: string | null; // whose shelf panel is showing
  carriedBookId: string | null;

  setLook: (patch: Partial<AvatarLook>) => void;
  walkTo: (sectionId: string) => void;
  arrive: () => void;
  closeShelf: () => void;
  takeBook: (bookId: string) => void;
  shelveBook: () => void;
};

export const useLibrary = create<LibraryState>((set, get) => ({
  look: { skin: skinTones[1], hair: hairColors[1], hairStyle: "bun", outfit: outfitColors[0] },
  x: 50,
  facing: 1,
  isWalking: false,
  destinationId: null,
  openSectionId: null,
  carriedBookId: null,

  setLook: (patch) => set((s) => ({ look: { ...s.look, ...patch } })),

  walkTo: (sectionId) => {
    const section = findSection(sectionId);
    if (!section) return;
    const { x } = get();
    if (Math.abs(section.x - x) < 0.5) {
      // Already standing there — just open the shelf.
      set({ openSectionId: sectionId });
      return;
    }
    set({
      destinationId: sectionId,
      openSectionId: null,
      isWalking: true,
      facing: section.x > x ? 1 : -1,
      x: section.x,
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
}));
