import { DOG_PRESETS, type DogLook } from "../store/useLibrary";

type Props = { look: DogLook; awake: boolean };

// A soft dark outline (not black) on every shape, even where fill colors
// repeat, so the curled sleeping pose reads as "body + head + ear + tail"
// instead of one blob — that ambiguity was the whole problem with the first
// version of this component.
const OUTLINE = "#2A2038";

// Curled asleep by the fireplace by default; wakes and wags when a book is
// finished (see useLibrary's notifyBookFinished/settleDog). Pure SVG, same
// {base, marking} recoloring convention as the cat and owl.
export default function Dog({ look, awake }: Props) {
  const { base, marking } = DOG_PRESETS[look.fur];
  const outline = { stroke: OUTLINE, strokeOpacity: 0.2, strokeWidth: 0.75 };
  // Ears and the curled tail are the same base color as the body they sit
  // against, so an outline alone doesn't separate them where they overlap —
  // darkening them a notch (vs. tinting, which would need a second color per
  // preset) reads as shading and keeps the {base, marking} preset shape.
  const shaded = { filter: "brightness(0.75)" };

  return (
    <div className="relative" aria-hidden="true">
      <svg viewBox="0 0 48 30" width="60" style={{ overflow: "visible" }}>
        {awake ? (
          <>
            {/* tail, wagging behind the haunches */}
            <path
              d="M6 22 Q0 13 6 6"
              fill="none"
              stroke={base}
              strokeWidth="4.5"
              strokeLinecap="round"
              className="tailSway"
              style={{ transformOrigin: "6px 22px" }}
            />
            {/* body, sitting up */}
            <ellipse cx="20" cy="21" rx="13" ry="8" fill={base} {...outline} />
            <ellipse cx="16" cy="23" rx="6.5" ry="4.5" fill={marking} />
            {/* front paws */}
            <rect x="12" y="26" width="3.5" height="4" rx="1.5" fill={base} {...outline} />
            <rect x="19" y="26" width="3.5" height="4" rx="1.5" fill={base} {...outline} />
            {/* head */}
            <circle cx="33" cy="11" r="7.5" fill={base} {...outline} />
            {/* floppy ear, hanging past the jaw — darkened, not just outlined,
                so it reads against the head even though both share `base`;
                sized to clearly clear the head's own silhouette rather than
                mostly overlapping it (a smaller ear read as a dark smudge) */}
            <path d="M28 5.5 Q19 7 19 15 Q19.5 21 26 22 Q29 22 28 16 Q28.5 10 28 5.5 Z" fill={base} style={shaded} {...outline} />
            {/* muzzle, protruding clear of the head */}
            <ellipse cx="40" cy="14" rx="5" ry="3.8" fill={marking} {...outline} />
            <circle cx="44.5" cy="13.3" r="1.3" fill={OUTLINE} />
            <path d="M41 17 Q43.3 18.8 45.5 16.5" fill="none" stroke={OUTLINE} strokeWidth="1" strokeLinecap="round" />
            <circle cx="35" cy="9" r="1.4" fill={OUTLINE} />
            <circle cx="35.4" cy="8.6" r="0.4" fill="#fff" opacity="0.8" />
          </>
        ) : (
          <>
            {/* curled body */}
            <path
              d="M8 26 Q1 26 1 18 Q1 9 12 7 Q26 3 34 10 Q39 14 36 19 Q30 24 18 25 Q12 26 8 26 Z"
              fill={base}
              {...outline}
            />
            {/* tail, curling on top of the body — drawn as a darkened stroke
                over the silhouette rather than tucked behind it, since a
                same-color tail hidden under the opaque body path is
                invisible regardless of curl shape */}
            <path
              d="M9 25 Q2 24 3 17 Q4 11 11 9"
              fill="none"
              stroke={base}
              strokeWidth="4"
              strokeLinecap="round"
              style={shaded}
            />
            <circle cx="11" cy="9" r="1.6" fill={marking} style={shaded} />
            {/* head, tucked toward the tail */}
            <circle cx="35" cy="12" r="7.5" fill={base} {...outline} />
            {/* floppy ear, drooping past the head's own edge so it reads as
                a separate flap rather than disappearing into the head */}
            <path d="M30 5 Q21 6 20 14 Q20 20 26 22 Q29.5 22.5 30 17 Q31 10 30 5 Z" fill={base} style={shaded} {...outline} />
            {/* muzzle, pointed down toward the curl */}
            <ellipse cx="29" cy="17.5" rx="4.5" ry="3.5" fill={marking} transform="rotate(20 29 17.5)" {...outline} />
            <circle cx="25.4" cy="19" r="1.1" fill={OUTLINE} />
            {/* closed eye */}
            <path d="M31 10 Q33 11.5 35 10" fill="none" stroke={OUTLINE} strokeWidth="1" strokeLinecap="round" />
          </>
        )}
      </svg>
      {!awake && <div className="zzz pointer-events-none absolute -top-1 right-1 font-display text-xs text-cream/70">z</div>}
    </div>
  );
}
