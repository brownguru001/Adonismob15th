"use client";

import { usePathname } from "next/navigation";
import { RoseSequence } from "@/components/rose-sequence";

// The gate ("/") is the biggest, boldest placement — a dominant hero visual.
// Login/invite get a smaller, centered treatment since it should read clean,
// not overwhelm the form.
function sizeForPath(pathname: string): string | null {
  if (pathname === "/") return "h-[64vh]";
  if (pathname.startsWith("/login") || pathname.startsWith("/invite")) return "h-[36vh]";
  return null;
}

// Lives once in the root layout, which never unmounts across navigation —
// that persistence keeps the scroll-driven rotation continuous across
// route changes on the gate/auth screens.
export function RoseBackdrop() {
  const pathname = usePathname();
  const size = sizeForPath(pathname);
  if (!size) return null;

  const isHome = pathname === "/";

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 flex justify-center overflow-hidden ${
        isHome ? "items-center" : "items-start pt-[7vh]"
      }`}
    >
      <RoseSequence
        variant="line"
        className={`${size} w-auto max-w-none`}
        style={{ filter: "sepia(0.3) saturate(0.7) brightness(1.05)" }}
      />
    </div>
  );
}
