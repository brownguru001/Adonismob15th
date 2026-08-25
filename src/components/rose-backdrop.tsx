"use client";

import { usePathname } from "next/navigation";
import { RoseMotif } from "@/components/rose-motif";

// A deterministic angle per route, not a random one — so the same page
// always shows the same orientation, and only navigating actually turns it.
function rotationForPath(path: string) {
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    hash = (hash * 31 + path.charCodeAt(i)) % 360;
  }
  return hash;
}

// Lives once in the root layout, which never unmounts across navigation —
// that persistence is what lets the CSS transition animate smoothly from
// the previous route's angle to the new one on every page change.
export function RoseBackdrop() {
  const pathname = usePathname();
  const rotation = rotationForPath(pathname);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
      <RoseMotif
        className="h-[140vh] w-auto text-rose opacity-[0.05]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
