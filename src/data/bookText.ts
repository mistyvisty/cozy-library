// Shared between scripts/fetch-books.ts (which produces these) and
// ReadingView.tsx (which consumes them) so the two can't drift apart.
export type BookText = {
  gutenbergId: number;
  chapters: {
    title: string;
    pages: string[];
  }[];
};
