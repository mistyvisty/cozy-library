import { useEffect, useState } from "react";
import { sections } from "../data/books";
import { OWL_PRESETS, OWL_X, type OwlLook } from "../store/useLibrary";

type Props = {
  look: OwlLook;
  openSectionId: string | null;
  isReading: boolean; // readingPhase === "reading" — a book just opened
};

// Perched near the lamp/window, fixed in place — she doesn't walk anywhere.
// Turns her head toward whichever shelf is open, and gives a brief silent
// "hoot" beat when a book opens. Pure SVG like the cat, same reasons.
export default function Owl({ look, openSectionId, isReading }: Props) {
  const { base, marking } = OWL_PRESETS[look.fur];
  const [hoot, setHoot] = useState(false);

  useEffect(() => {
    if (!isReading) return;
    setHoot(true);
    const id = setTimeout(() => setHoot(false), 1500);
    return () => clearTimeout(id);
  }, [isReading]);

  const openSection = sections.find((s) => s.id === openSectionId);
  const facing = !openSection ? 1 : openSection.x > OWL_X ? 1 : -1;

  return (
    <div className="absolute top-[15%] z-10" style={{ left: `${OWL_X}%` }} aria-hidden="true">
      <div style={{ transform: `scaleX(${facing})`, transition: "transform 0.4s ease" }}>
        <svg viewBox="0 0 32 34" width="34" style={{ overflow: "visible" }}>
          {/* body */}
          <ellipse cx="16" cy="20" rx="11" ry="12" fill={base} />
          <ellipse cx="16" cy="23" rx="6" ry="7" fill={marking} />
          {/* ear tufts */}
          <path d="M7 10 L5 3 L11 8 Z" fill={base} />
          <path d="M25 10 L27 3 L21 8 Z" fill={base} />
          {/* eyes, blinking */}
          <g className="owlBlink" style={{ transformOrigin: "16px 16px" }}>
            <circle cx="11" cy="16" r="4" fill="#FFF8EC" />
            <circle cx="21" cy="16" r="4" fill="#FFF8EC" />
            <circle cx="11" cy="16" r="2" fill="#3A2C55" />
            <circle cx="21" cy="16" r="2" fill="#3A2C55" />
          </g>
          {/* beak */}
          <path d="M14 20 L18 20 L16 24 Z" fill="#F5C77E" />
          {/* feet on the perch */}
          <rect x="10" y="30" width="3" height="3" rx="1" fill="#F5C77E" />
          <rect x="19" y="30" width="3" height="3" rx="1" fill="#F5C77E" />
        </svg>
      </div>
      {/* a little branch to perch on */}
      <div className="mx-auto -mt-1 h-1.5 w-12 rounded-full bg-woodDeep" />
      {hoot && (
        <div className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cream/90 px-2 py-0.5 font-display text-[10px] text-ink shadow">
          hoot~
        </div>
      )}
    </div>
  );
}
