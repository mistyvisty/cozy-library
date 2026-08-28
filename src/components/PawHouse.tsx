// Sits in the foreground on the rug rather than against the wall — there's
// no gap there wide enough without covering a shelf's label.
// Position (left-[35%], bottom-[4%]) must stay in sync with HOUSE_X/
// HOUSE_BOTTOM in useLibrary.ts, which is where the avatar walks to.
// Dimensions (h-14/h-3 = ~68px total) are carried over unchanged from the
// armchair this replaces — that height was specifically tuned so it can't
// grow tall enough to reach back up into the shelves' row even on a short
// window; only the visual style changes here, not the footprint.
export default function PawHouse() {
  return (
    <div className="absolute bottom-[4%] left-[35%] flex -translate-x-1/2 flex-col items-center">
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
