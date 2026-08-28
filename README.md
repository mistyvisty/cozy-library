# Cozy Library

A digital library you walk around in. Pick a section, your avatar strolls over,
opens the shelf, and takes a book off it.

v1 is the room, the avatar, and browsing. Reading mode comes next.

---

## Run it

**With Docker** (nothing to install but Docker):

```bash
docker compose up --build
```

**Without Docker** (needs Node 20+):

```bash
npm install
npm run dev
```

Either way, open http://localhost:5173

Other commands: `npm run build` (production bundle into `dist/`),
`npm run preview` (serve that bundle).

---

## Stack, and why

| Piece | Why it's here |
| --- | --- |
| Vite + React + TypeScript | Instant hot reload; types catch typos in book data before the page breaks |
| Tailwind | Styles live next to the markup, so the room is one file to read |
| Framer Motion | Handles the walking, the panel springs, and enter/exit animations |
| Zustand | One shared state object. Simpler than Redux, no boilerplate |

---

## Where things live

```
src/
├── App.tsx                    header, panels, layout
├── index.css                  Tailwind + the keyframes (walk, bob, dust)
├── data/books.ts              sections, books, shelf positions  ← edit this first
├── store/useLibrary.ts        avatar look, position, what's open
└── components/
    ├── LibraryRoom.tsx        the scene: wall, floor, lamp, plant, avatar
    ├── Bookcase.tsx           one shelf, drawn from its section's books
    ├── ShelfPanel.tsx         the list that slides up when you arrive
    ├── Customizer.tsx         skin / hair / outfit pickers
    └── Avatar.tsx             the character, drawn entirely in SVG
```

## How the walking works

Each section in `data/books.ts` has an `x` — its position across the room as a
percentage. Clicking a shelf calls `walkTo(sectionId)`, which sets the avatar's
`x` to match. Framer Motion animates the gap, with the duration scaled to the
distance, so a long walk takes longer. When the animation finishes, `arrive()`
fires and the shelf panel opens.

To add a section, add an object to `sections` and give it a free `x`. Everything
else — the shelf, its label, its spines — draws itself from that.

## New to React? Start here

- `useLibrary()` in any component gives you the shared state. Change it with the
  actions (`walkTo`, `takeBook`) — never by assigning to it.
- Anything in `{ }` inside JSX is plain JavaScript.
- `useState` is for state only one component cares about (like whether the
  customizer is open). The store is for state the whole room cares about.

## Roadmap

1. **Reading mode** — avatar sits in an armchair, book opens, page-turn animation
2. **Real text** — pull public-domain books from the Gutendex API
3. **Progress** — bookmarks and a "currently reading" shelf (localStorage first, accounts later)
4. **More room** — armchair, fireplace, a cat that follows you
5. **Day/night** — window light shifts with the real clock
