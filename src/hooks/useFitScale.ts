import { useEffect, useRef, useState } from "react";

// The room's shelves/avatar/furniture are fixed pixel sizes positioned at
// percentage coordinates — that's fine down to whatever width the design was
// actually built at, but below it the outer shelves' fixed-width edges run
// past the viewport with no percentage trick to save them. Rather than
// converting every fixed size in the room to something width-relative, this
// shrinks the whole scene uniformly once the available width drops below
// `designWidth`, the same way a "fit to screen" scale works in a game — every
// child scales together, so nothing individually overflows. Never scales
// *up* past 1, so normal desktop widths are untouched.
export function useFitScale(designWidth: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setScale(width > 0 ? Math.min(1, width / designWidth) : 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth]);

  return { ref, scale };
}
