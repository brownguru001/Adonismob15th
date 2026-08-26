import { RoseSequence } from "@/components/rose-sequence";
import { OmertaField } from "@/components/omerta-field";

export function RoseBackground() {
  return (
    <>
      <OmertaField />
      <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <RoseSequence
          variant="color"
          className="h-[52vh] w-auto max-w-none"
          style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.55))" }}
        />
      </div>
    </>
  );
}
