"use client";

import { useEffect, useRef } from "react";

const FRAME_COUNT = 80;
const DEGREES_PER_PIXEL = 0.12;

export type RoseVariant = "line" | "color";

function framePath(variant: RoseVariant, index: number) {
  const n = String(index + 1).padStart(3, "0");
  return `/rose/${variant}/frame-${n}.webp`;
}

// Scroll-scrubbed turntable: each scroll pixel steps through frames captured
// from the real rotating reference footage (public/rose/{line,color}) rather
// than a flat shape being transformed, so the motion reads as an actual
// object turning. Scrolling up steps the frame index forward (spins right);
// scrolling down steps it back (spins left).
export function RoseSequence({
  variant,
  className,
  style,
}: {
  variant: RoseVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const posRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const tickingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function currentIndex() {
      return ((Math.round(posRef.current) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
    }

    function draw() {
      const img = imagesRef.current[currentIndex()];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx!.drawImage(img, 0, 0, canvas!.width, canvas!.height);
      }
    }

    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = draw;
      img.src = framePath(variant, i);
      images.push(img);
    }
    imagesRef.current = images;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;

    let pendingDelta = 0;

    function step() {
      tickingRef.current = false;
      if (!reducedMotionRef.current) {
        // scroll up (delta < 0) -> spin right (index increases)
        // scroll down (delta > 0) -> spin left (index decreases)
        posRef.current += -pendingDelta * DEGREES_PER_PIXEL;
      }
      pendingDelta = 0;
      draw();
    }

    function queue(delta: number) {
      pendingDelta += delta;
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(step);
    }

    // Wheel/trackpad drives this directly (works even on short pages that
    // never actually scroll, e.g. the sign-in gate); touch drags are read
    // as finger movement since touchscreens don't emit wheel events.
    function handleWheel(e: WheelEvent) {
      queue(e.deltaY);
    }

    function handleTouchStart(e: TouchEvent) {
      lastTouchYRef.current = e.touches[0]?.clientY ?? 0;
    }

    function handleTouchMove(e: TouchEvent) {
      const y = e.touches[0]?.clientY ?? lastTouchYRef.current;
      queue(lastTouchYRef.current - y);
      lastTouchYRef.current = y;
    }

    function handleMotionChange(e: MediaQueryListEvent) {
      reducedMotionRef.current = e.matches;
    }

    media.addEventListener("change", handleMotionChange);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      media.removeEventListener("change", handleMotionChange);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={860}
      aria-hidden="true"
      className={className}
      style={style}
    />
  );
}
