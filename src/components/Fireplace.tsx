import { FIREPLACE_BOTTOM, FIREPLACE_X } from "../store/useLibrary";

type Props = {
  // Defaults reproduce the desktop room's placement exactly — the mobile
  // layout passes its own coordinates, since its floor is a self-contained
  // zone rather than one shared percentage axis with the shelf row.
  x?: number;
  bottomPct?: number;
};

// On the foreground rug, like the paw house (there's no shelf gap wide
// enough for a back-wall fixture — see FIREPLACE_X's comment in
// useLibrary.ts). Plain Tailwind shapes, matching the plant/paw-house
// convention (SVG is reserved for the animals). Defaults read straight from
// FIREPLACE_X/FIREPLACE_BOTTOM (where the dog sits too) instead of
// duplicating the numbers here — see PawHouse.tsx's comment for why that
// duplication is worth avoiding.
export default function Fireplace({ x = FIREPLACE_X, bottomPct = FIREPLACE_BOTTOM }: Props) {
  return (
    <div
      className="absolute flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${x}%`, bottom: `${bottomPct}%` }}
    >
      {/* mantel shelf */}
      <div className="h-2 w-28 rounded-sm bg-woodDeep shadow-md" />
      {/* frame */}
      <div className="flex h-16 w-24 items-end justify-center bg-woodDeep/90 p-2.5">
        {/* firebox opening */}
        <div className="flex h-11 w-16 items-end justify-center overflow-hidden rounded-t-md bg-ink">
          <div className="mb-1 flex items-end gap-1">
            <div className="flame h-4 w-1.5 rounded-full bg-lamp" />
            <div className="flame h-6 w-2 rounded-full bg-blush" style={{ animationDelay: "-0.4s" }} />
            <div className="flame h-3.5 w-1.5 rounded-full bg-lamp" style={{ animationDelay: "-0.8s" }} />
          </div>
        </div>
      </div>
      {/* hearth base */}
      <div className="h-2 w-28 rounded-sm bg-woodDeep shadow-md" />
    </div>
  );
}
