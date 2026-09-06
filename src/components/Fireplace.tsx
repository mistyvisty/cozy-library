// On the foreground rug, like the paw house (there's no shelf gap wide
// enough for a back-wall fixture — see FIREPLACE_X's comment in
// useLibrary.ts). Plain Tailwind shapes, matching the plant/paw-house
// convention (SVG is reserved for the animals). Position (left-[62%],
// bottom-[4%]) must stay in sync with FIREPLACE_X/FIREPLACE_BOTTOM in
// useLibrary.ts, which is where the dog sits too.
export default function Fireplace() {
  return (
    <div className="absolute bottom-[4%] left-[62%] flex -translate-x-1/2 flex-col items-center">
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
