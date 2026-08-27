import { RoseSequence } from "@/components/rose-sequence";
import { OmertaField } from "@/components/omerta-field";

export function RoseBackground() {
  return (
    <>
      <OmertaField />
      <div className="pointer-events-none fixed inset-0 -z-10 flex items-start justify-center overflow-hidden pt-[6vh]">
        <RoseSequence
          variant="color"
          className="h-[40vh] w-auto max-w-none opacity-90"
          style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.55))" }}
        />
      </div>
    </>
  );
}
