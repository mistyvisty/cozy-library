# Cozy Library

A digital library you walk around in. Pick a section, your cat
strolls over, opens the shelf, and picks a book off it. Take it to
her reading nook, and you can actually read the full text — real
public-domain books, page by page, with a chapter list and a page
indicator.

Along the way she's got company: an owl by the window who watches
what you're browsing, and a sleepy dog by the fireplace who wakes
up wagging when you finish a whole book. Feed them between
chapters, watch your plant grow the more you read, and see the
room shift with the time of day.

**Try it live:** https://stellular-donut-98ebbc.netlify.app

---

## Run it locally

**With Docker** (nothing to install but Docker):

docker compose up --build

**Without Docker** (needs Node 20+):

npm install
npm run dev

Either way, open http://localhost:5173

Other commands: npm run build (production bundle into dist/),
npm run preview (serve that bundle).

---

## What's in the library

Nine shelves: Classics, Romance, Thriller, Horror, Fantasy, Science
Fiction, Kafka, and Dostoyevsky — all real, full-length public
domain texts. A Hindi-language shelf is planned but deliberately
held back for now, since no clean public-domain source has turned
up yet (checked Gutenberg, Internet Archive, and Hindi Samay — see
CLAUDE.md for details).

---

## Stack, and why

| Piece | Why it's here |
| --- | --- |
| Vite + React + TypeScript | Instant hot reload; types catch typos in book data before the page breaks |
| Tailwind | Styles live next to the markup |
| Framer Motion | Handles walking, panel springs, and enter/exit animations |
| Zustand (+ persist) | One shared state object; a small slice survives page reloads |

---

## Where things live

src/
├── App.tsx                 header, panels, layout
├── data/books.ts            sections, books, shelf positions
├── data/book-text/*.json    the actual downloaded book text
├── store/useLibrary.ts      avatar, pets, reading state
└── components/
    ├── LibraryRoom.tsx      the scene: walls, shelves, pets, mobile layout
    ├── Bookcase.tsx         one shelf
    ├── ShelfPanel.tsx       the book list per shelf
    ├── ReadingView.tsx      the actual reading experience
    ├── Avatar.tsx           the cat
    ├── Owl.tsx / Dog.tsx / Fireplace.tsx / PawHouse.tsx
    └── Customizer.tsx       fur/eye color pickers

scripts/fetch-books.ts       one-time script that downloads and
processes the book text (doesn't run in production — the JSON
it generates is committed to the repo)
