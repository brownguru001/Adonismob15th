// Low-opacity tiled wordmark behind the member area's rose, purely
// decorative — a repeating watermark, not real page content.
export function OmertaField() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1000 2200"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="omertaTile"
          width="230"
          height="150"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-9)"
        >
          <text
            x="0"
            y="60"
            className="font-display"
            fontSize="34"
            fontWeight="600"
            fill="var(--color-gold)"
            fillOpacity="0.06"
            letterSpacing="2"
          >
            omertà
          </text>
        </pattern>
      </defs>
      <rect width="1000" height="2200" fill="url(#omertaTile)" />
    </svg>
  );
}
