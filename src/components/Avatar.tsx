import { FUR_PRESETS, type CatLook } from "../store/useLibrary";

type Props = {
  look: CatLook;
  walking?: boolean;
  height?: number;
  pose?: "walking" | "curious" | "sleeping";
};

// The whole character is one SVG so it stays crisp at any size and every
// part is recolourable via `look`. No sprite sheets, no image assets.
// A horizontal (landscape) viewBox — unlike the old biped's portrait one —
// since a cat's body reads left-to-right, not head-to-toe.
export default function Avatar({ look, walking = false, height = 92, pose = "walking" }: Props) {
  const { base, marking } = FUR_PRESETS[look.fur];
  const eye = look.eyeColor;
  const walk = pose === "walking";
  const sleeping = pose === "sleeping";
  const curious = pose === "curious";
  const animating = walking && walk;
  const swing = animating ? "swing" : "";

  return (
    <svg
      viewBox="0 0 72 46"
      height={height}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Your cat"
    >
      {sleeping ? (
        <>
          {/* curled into a ball, tail wrapped around */}
          <path
            d="M12 40 Q4 40 5 30 Q6 18 20 14 Q34 10 44 16 Q54 21 52 30 Q50 38 40 40 Z"
            fill={base}
          />
          {/* tail, wrapped along the front */}
          <path
            d="M12 40 Q10 28 20 24 Q28 21 30 27"
            fill="none"
            stroke={base}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* chest — the part that rises and falls while she breathes */}
          <g className="breathe" style={{ transformOrigin: "22px 32px" }}>
            <ellipse cx="20" cy="32" rx="9" ry="6" fill={marking} opacity="0.9" />
          </g>
          {/* tucked head, resting on her paws */}
          <circle cx="46" cy="24" r="11" fill={base} />
          <path d="M39 17 L42 10 L45 17 Z" fill={base} />
          <path d="M50 16 L54 10 L55 18 Z" fill={base} />
          {/* closed eyes */}
          <path d="M41 24 Q43.5 26 46 24" fill="none" stroke="#2A2038" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M49 23 Q51.5 25 54 23" fill="none" stroke="#2A2038" strokeWidth="1.3" strokeLinecap="round" />
        </>
      ) : curious ? (
        <>
          {/* sitting upright, loaf-ish */}
          <path
            d="M18 42 Q10 42 10 30 Q10 16 26 14 Q40 12 44 24 Q46 32 44 42 Z"
            fill={base}
          />
          {/* a touch of life while she waits — the same subtle breathing
              wobble the sleeping pose uses, just for the chest marking */}
          <g className="breathe" style={{ transformOrigin: "24px 36px" }}>
            <ellipse cx="24" cy="36" rx="8" ry="7" fill={marking} opacity="0.9" />
          </g>
          {/* tail curled around the front paws */}
          <path
            d="M44 40 Q54 40 54 30 Q54 22 46 21"
            fill="none"
            stroke={base}
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* front paws */}
          <rect x="16" y="38" width="7" height="6" rx="3" fill={marking} />
          <rect x="26" y="38" width="7" height="6" rx="3" fill={marking} />
          {/* head, tilted up and alert */}
          <circle cx="26" cy="16" r="12" fill={base} />
          {/* ears, perked forward */}
          <path d="M17 10 L15 1 L23 8 Z" fill={base} />
          <path d="M35 10 L39 1 L41 8 Z" fill={base} />
          <path d="M18.5 8.5 L18 4 L22 8 Z" fill={marking} opacity="0.7" />
          <path d="M34 8.5 L37.5 4 L38.5 7.5 Z" fill={marking} opacity="0.7" />
          {/* big round curious eyes */}
          <circle cx="21" cy="17" r="3.2" fill={eye} />
          <circle cx="31" cy="17" r="3.2" fill={eye} />
          <circle cx="21" cy="17" r="1.2" fill="#20182B" />
          <circle cx="31" cy="17" r="1.2" fill="#20182B" />
          {/* nose + mouth */}
          <path d="M25 21 L27 21 L26 22.5 Z" fill="#D98A97" />
          <path d="M26 22.5 Q24 24.5 22 23.5 M26 22.5 Q28 24.5 30 23.5" fill="none" stroke="#2A2038" strokeWidth="1" strokeLinecap="round" />
          {/* whiskers */}
          <path d="M13 18 L4 16 M13 20 L4 20.5 M39 18 L48 16 M39 20 L48 20.5" stroke="#2A2038" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* walking — horizontal body, two leg pairs (front/back), each
              standing in for a near+far leg to keep the gait simple. */}
          {/* back legs */}
          <g className={swing} style={{ transformOrigin: "18px 32px", animationDelay: "-0.35s" }}>
            <rect x="15" y="30" width="6" height="13" rx="3" fill={base} />
            <ellipse cx="18" cy="43" rx="4" ry="2.4" fill={marking} />
          </g>
          {/* front legs */}
          <g className={swing} style={{ transformOrigin: "50px 32px" }}>
            <rect x="47" y="30" width="6" height="13" rx="3" fill={base} />
            <ellipse cx="50" cy="43" rx="4" ry="2.4" fill={marking} />
          </g>

          {/* tail, gently swaying */}
          <path
            d="M14 28 Q2 24 4 12 Q5 4 12 2"
            fill="none"
            stroke={base}
            strokeWidth="5"
            strokeLinecap="round"
            className={animating ? "tailSway" : ""}
            style={{ transformOrigin: "14px 28px" }}
          />

          {/* body */}
          <path d="M16 30 Q12 14 34 12 Q54 11 58 24 Q60 30 54 32 Q34 38 20 34 Z" fill={base} />
          <ellipse cx="34" cy="27" rx="14" ry="6" fill={marking} opacity="0.85" />

          {/* head */}
          <circle cx="58" cy="18" r="11" fill={base} />
          {/* ears, relaxed */}
          <path d="M51 11 L49 3 L56 9 Z" fill={base} />
          <path d="M63 10 L67 2 L68 9 Z" fill={base} />
          {/* eyes */}
          <circle cx="55" cy="18" r="2.2" fill={eye} />
          <circle cx="62" cy="17.5" r="2.2" fill={eye} />
          <circle cx="55" cy="18" r="0.9" fill="#20182B" />
          <circle cx="62" cy="17.5" r="0.9" fill="#20182B" />
          {/* nose + whiskers */}
          <path d="M62 21 L64 21 L63 22.3 Z" fill="#D98A97" />
          <path d="M53 19 L45 17.5 M53 21 L45 21.5 M65 19 L72 17.5 M65 21 L72 21.5" stroke="#2A2038" strokeWidth="0.7" opacity="0.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
