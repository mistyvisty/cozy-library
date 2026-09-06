import { useEffect, useRef, useState } from "react";

// The room's shelves/avatar/furniture are fixed pixel sizes positioned at
// percentage coordinates — that's fine down to whatever size the design was
// actually built at, but below it the outer shelves' fixed-width edges run
// past the viewport with no percentage trick to save them. Rather than
// converting every fixed size in the room to something width-relative, this
// shrinks the whole scene uniformly once the available width drops below
// `designWidth`, the same way a "fit to screen" scale works in a game — every
// child scales together, so nothing individually overflows, and the room
// keeps its true proportions (no horizontal-only squish). Never scales *up*
// past 1, so normal desktop widths are untouched.
//
// `designHeight` only matters for a *portrait* container (taller than wide)
// — a real phone, essentially never a desktop browser window. For a
// landscape-narrow container (any ordinary resized desktop window, however
// narrow), `boxHeight` is just the container's own real height and `scale`
// stays purely width-based, identical to treating the room as `h-full` —
// exactly today's desktop behavior, untouched.
//
// A portrait container needs its own fixed design height because a plain
// `h-full` box there has no real height of its own to fill: it just becomes
// whatever the container's height happens to be, which then gets shrunk by
// the same width-derived scale factor regardless of how tall that container
// actually is — so the room only ever fills that same small fraction of the
// screen no matter the device (the bug this hook used to have on phones:
// most of the screen rendered as empty space above a squeezed-in room).
// Giving the box a real fixed height and folding *that* into the scale
// calculation (`Math.min(widthScale, heightScale)`) makes the room actually
// grow to fill a portrait screen, capped only by whichever axis is tighter.
export function useFitScale(designWidth: number, designHeight: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ scale: 1, boxHeight: designHeight });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) {
        setState({ scale: 1, boxHeight: designHeight });
        return;
      }
      const widthScale = width / designWidth;
      const portrait = height > width;
      const boxHeight = portrait ? designHeight : height;
      const heightScale = portrait ? height / designHeight : Infinity;
      setState({ scale: Math.min(1, widthScale, heightScale), boxHeight });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth, designHeight]);

  return { ref, ...state };
}
