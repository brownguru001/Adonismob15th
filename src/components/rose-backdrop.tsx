"use client";

import { usePathname } from "next/navigation";
import { RoseSequence } from "@/components/rose-sequence";

// Only the gate and the (auth) screens (sign-in, invite redemption) get
// this backdrop — the members area has its own colour version instead.
function isVoidScreen(pathname: string) {
  return pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/invite");
}

// Lives once in the root layout, which never unmounts across navigation —
// that persistence is what keeps the scroll-driven rotation continuous
// across route changes on the gate/auth screens.
export function RoseBackdrop() {
  const pathname = usePathname();
  if (!isVoidScreen(pathname)) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
      <RoseSequence
        variant="line"
        className="h-[46vh] w-auto max-w-none"
        style={{
          filter: "sepia(0.35) saturate(0.5) brightness(1.15) hue-rotate(-8deg)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
