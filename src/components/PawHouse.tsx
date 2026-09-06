import { HOUSE_BOTTOM, HOUSE_X } from "../store/useLibrary";

type Props = {
  // Defaults reproduce the desktop room's placement exactly (see HOUSE_X's
  // own comment) — the mobile layout passes its own coordinates, since its
  // floor is a self-contained zone rather than one shared percentage axis
  // with the shelf row.
  x?: number;
  bottomPct?: number;
};

// Sits in the foreground on the rug rather than against the wall — there's
// no gap there wide enough without covering a shelf's label. Defaults read
// straight from HOUSE_X/HOUSE_BOTTOM in useLibrary.ts (where the avatar
// walks to) instead of duplicating the numbers here — section 6's shelf
// renumbering once changed HOUSE_X without this file being updated to
// match, silently drawing the house in the wrong spot for a while.
// Dimensions (h-14/h-3 = ~68px total) are carried over unchanged from the
// armchair this replaces — that height was specifically tuned so it can't
// grow tall enough to reach back up into the shelves' row even on a short
// window; only the visual style changes here, not the footprint.
export default function PawHouse({ x = HOUSE_X, bottomPct = HOUSE_BOTTOM }: Props) {
  return (
    <div
      className="absolute flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${x}%`, bottom: `${bottomPct}%` }}
    >
      <div className="relative flex h-14 w-24 items-end justify-center rounded-t-full bg-blush/80 shadow-lg">
        {/* arched doorway */}
        <div className="h-9 w-8 rounded-t-full bg-woodDeep/90" />
        {/* a peek of cushion inside */}
        <div className="absolute bottom-1 h-2.5 w-6 rounded-full bg-lamp/70" />
      </div>
      <div className="h-3 w-28 rounded-b-md bg-woodDeep" />
    </div>
  );
}
