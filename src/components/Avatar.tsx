import type { AvatarLook } from "../store/useLibrary";

type Props = {
  look: AvatarLook;
  walking?: boolean;
  carryingColor?: string | null;
  height?: number;
};

// The whole character is one SVG so it stays crisp at any size and every part
// is recolourable. Legs and arms swing via CSS classes (see index.css).
export default function Avatar({ look, walking = false, carryingColor = null, height = 150 }: Props) {
  const { skin, hair, hairStyle, outfit } = look;
  const swing = walking ? "swing" : "";

  return (
    <svg
      viewBox="0 0 44 78"
      height={height}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Your reader"
    >
      {/* legs */}
      <g className={swing} style={{ transformOrigin: "18px 56px" }}>
        <rect x="15" y="54" width="6" height="17" rx="3" fill={skin} />
        <rect x="14" y="68" width="8" height="5" rx="2.5" fill="#4A3A66" />
      </g>
      <g className={swing} style={{ transformOrigin: "26px 56px", animationDelay: "-0.35s" }}>
        <rect x="23" y="54" width="6" height="17" rx="3" fill={skin} />
        <rect x="22" y="68" width="8" height="5" rx="2.5" fill="#4A3A66" />
      </g>

      {/* body */}
      <path
        d="M11 40 Q11 32 22 32 Q33 32 33 40 L34 58 Q22 62 10 58 Z"
        fill={outfit}
      />
      {/* collar */}
      <path d="M17 33 Q22 38 27 33" fill="none" stroke="#00000022" strokeWidth="1.5" />

      {/* arms */}
      <g className={swing} style={{ transformOrigin: "12px 40px", animationDelay: "-0.35s" }}>
        <rect x="8" y="38" width="5.5" height="16" rx="2.75" fill={outfit} />
        <circle cx="10.7" cy="55" r="3" fill={skin} />
      </g>
      <g className={swing} style={{ transformOrigin: "32px 40px" }}>
        <rect x="30.5" y="38" width="5.5" height="16" rx="2.75" fill={outfit} />
        <circle cx="33.2" cy="55" r="3" fill={skin} />
      </g>

      {/* carried book, tucked against the chest */}
      {carryingColor && (
        <g className="hug">
          <rect x="14" y="44" width="16" height="12" rx="2" fill={carryingColor} />
          <rect x="14" y="44" width="3.5" height="12" rx="1.5" fill="#00000033" />
          <rect x="19" y="47" width="8" height="1.4" rx="0.7" fill="#ffffff66" />
          <rect x="19" y="50" width="6" height="1.4" rx="0.7" fill="#ffffff44" />
        </g>
      )}

      {/* head */}
      <circle cx="22" cy="20" r="14" fill={skin} />

      {/* hair, back layer */}
      {hairStyle === "bob" && <path d="M7 20 Q7 4 22 4 Q37 4 37 20 L37 30 Q30 24 22 24 Q14 24 7 30 Z" fill={hair} />}
      {hairStyle === "curls" && (
        <g fill={hair}>
          <circle cx="10" cy="16" r="7" />
          <circle cx="34" cy="16" r="7" />
          <circle cx="14" cy="26" r="6" />
          <circle cx="30" cy="26" r="6" />
        </g>
      )}
      {hairStyle === "bun" && <circle cx="22" cy="3" r="6" fill={hair} />}

      {/* hair, front fringe */}
      <path
        d="M8 19 Q8 5 22 5 Q36 5 36 19 Q32 12 22 12 Q12 12 8 19 Z"
        fill={hair}
      />

      {/* face */}
      <circle cx="16.5" cy="21" r="1.6" fill="#2A2038" />
      <circle cx="27.5" cy="21" r="1.6" fill="#2A2038" />
      <circle cx="12.5" cy="24.5" r="2.2" fill={"#F5A3B0"} opacity="0.55" />
      <circle cx="31.5" cy="24.5" r="2.2" fill={"#F5A3B0"} opacity="0.55" />
      <path d="M19.5 25.5 Q22 28 24.5 25.5" fill="none" stroke="#2A2038" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
