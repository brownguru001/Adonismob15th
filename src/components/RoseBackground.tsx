"use client";

import { useEffect, useRef } from "react";
import {
  ROSE_VIEWBOX,
  BLOOM_CENTER,
  STEM_PATH,
  THORN_PATHS,
  LEAF_PATHS,
  BLOOM_PETAL_PATHS,
} from "@/components/rose-paths";

const DEGREES_PER_PIXEL = 0.15;
const GOLD = "#C9A227";
const DARK_GREEN = "#1B4D2E";

// Same silhouette as the sign-in rose (shared path data from
// rose-paths.ts) — only the fill/stroke presentation differs here, plus
// the bloom rotates independently of the stem and leaves on scroll.
export function RoseBackground() {
  const bloomGroupRef = useRef<SVGGElement>(null);
  const rotationRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;

    if (media.matches && bloomGroupRef.current) {
      bloomGroupRef.current.style.transform = "rotate(0deg)";
    }

    function handleMotionPreferenceChange(e: MediaQueryListEvent) {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        rotationRef.current = 0;
        if (bloomGroupRef.current) bloomGroupRef.current.style.transform = "rotate(0deg)";
      }
    }

    lastScrollYRef.current = window.scrollY;

    function handleScroll() {
      if (reducedMotionRef.current || tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        lastScrollYRef.current = currentY;
        rotationRef.current = (rotationRef.current + delta * DEGREES_PER_PIXEL) % 360;
        if (bloomGroupRef.current) {
          bloomGroupRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
        tickingRef.current = false;
      });
    }

    media.addEventListener("change", handleMotionPreferenceChange);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      media.removeEventListener("change", handleMotionPreferenceChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center overflow-hidden">
      <svg viewBox={ROSE_VIEWBOX} fill="none" className="h-[140vh] w-auto opacity-[0.05]" aria-hidden="true">
        <defs>
          <linearGradient id="roseBloomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B0000" />
            <stop offset="100%" stopColor="#C41E3A" />
          </linearGradient>
        </defs>

        {/* stem and leaves stay static */}
        <g>
          <path d={STEM_PATH} stroke={DARK_GREEN} strokeWidth="3" strokeLinecap="round" />
          {THORN_PATHS.map((d) => (
            <path key={d} d={d} stroke={DARK_GREEN} strokeWidth="2.5" strokeLinecap="round" />
          ))}
          {LEAF_PATHS.map((leaf) => (
            <g key={leaf.outline}>
              <path d={leaf.outline} fill={DARK_GREEN} stroke={GOLD} strokeWidth="1.5" strokeLinejoin="round" />
              <path d={leaf.vein} stroke={GOLD} strokeWidth="1" strokeLinecap="round" />
            </g>
          ))}
        </g>

        {/* bloom only — this group rotates on scroll */}
        <g
          ref={bloomGroupRef}
          style={{ transformOrigin: `${BLOOM_CENTER.x}px ${BLOOM_CENTER.y}px`, transformBox: "view-box" }}
        >
          {BLOOM_PETAL_PATHS.map(({ d, strokeWidth }) => (
            <path
              key={d}
              d={d}
              fill="url(#roseBloomGradient)"
              stroke={GOLD}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
