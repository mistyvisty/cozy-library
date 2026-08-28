import { AnimatePresence, motion } from "framer-motion";
import { FUR_PRESETS, eyeColors, furPresetOrder, useLibrary, type FurPreset } from "../store/useLibrary";

function Swatches<T extends string>({
  options,
  colorFor,
  active,
  onPick,
  label,
}: {
  options: T[];
  colorFor: (o: T) => string;
  active: T;
  onPick: (o: T) => void;
  label: string;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 font-body text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onPick(o)}
            aria-label={`${label}: ${o}`}
            className={`h-7 w-7 rounded-full capitalize ring-offset-2 ring-offset-cream transition ${
              active === o ? "ring-2 ring-ink" : "ring-1 ring-black/10 hover:scale-110"
            }`}
            style={{ background: colorFor(o) }}
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

          <Swatches<FurPreset>
            label="Fur"
            options={furPresetOrder}
            colorFor={(f) => FUR_PRESETS[f].base}
            active={look.fur}
            onPick={(fur) => setLook({ fur })}
          />
          <Swatches
            label="Eyes"
            options={eyeColors}
            colorFor={(c) => c}
            active={look.eyeColor}
            onPick={(eyeColor) => setLook({ eyeColor })}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
