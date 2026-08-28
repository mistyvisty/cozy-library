import { AnimatePresence, motion } from "framer-motion";
import {
  hairColors,
  hairStyles,
  outfitColors,
  skinTones,
  useLibrary,
} from "../store/useLibrary";

function Swatches({
  colors,
  active,
  onPick,
  label,
}: {
  colors: string[];
  active: string;
  onPick: (c: string) => void;
  label: string;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 font-body text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onPick(c)}
            aria-label={`${label}: ${c}`}
            className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-cream transition ${
              active === c ? "ring-2 ring-ink" : "ring-1 ring-black/10 hover:scale-110"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Customizer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const look = useLibrary((s) => s.look);
  const setLook = useLibrary((s) => s.setLook);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute right-4 top-16 z-40 w-[248px] rounded-3xl bg-cream/95 p-4 shadow-2xl ring-1 ring-black/10 backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Your look</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-ink/10 px-2.5 py-1 font-body text-xs text-ink/70 hover:bg-ink/20"
            >
              Done
            </button>
          </div>

          <Swatches label="Skin" colors={skinTones} active={look.skin} onPick={(skin) => setLook({ skin })} />
          <Swatches label="Hair" colors={hairColors} active={look.hair} onPick={(hair) => setLook({ hair })} />
          <Swatches label="Outfit" colors={outfitColors} active={look.outfit} onPick={(outfit) => setLook({ outfit })} />

          <p className="mb-1.5 font-body text-xs uppercase tracking-wide text-ink/50">Hair style</p>
          <div className="flex flex-wrap gap-1.5">
            {hairStyles.map((s) => (
              <button
                key={s}
                onClick={() => setLook({ hairStyle: s })}
                className={`rounded-full px-3 py-1 font-body text-xs capitalize transition ${
                  look.hairStyle === s ? "bg-ink text-cream" : "bg-ink/10 text-ink/70 hover:bg-ink/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
