import React from "react";
import {
  ROSE_VIEWBOX,
  STEM_PATH,
  THORN_PATHS,
  LEAF_PATHS,
  OUTER_PETAL_PATHS,
  OUTER_PETAL_ACCENT_PATHS,
  MID_PETAL_PATHS,
  INNER_PETAL_PATHS,
  SPIRAL_CENTER_PATHS,
} from "@/components/rose-paths";

export function RoseMotif({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox={ROSE_VIEWBOX}
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {/* stem */}
      <path d={STEM_PATH} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* thorns */}
      {THORN_PATHS.map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      ))}

      {/* leaves */}
      {LEAF_PATHS.map((leaf) => (
        <React.Fragment key={leaf.outline}>
          <path d={leaf.outline} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={leaf.vein} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </React.Fragment>
      ))}

      {/* bloom - outer cupped petals */}
      {OUTER_PETAL_PATHS.map(({ d, strokeWidth }) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      ))}
      {OUTER_PETAL_ACCENT_PATHS.map(({ d, strokeWidth }) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
      ))}

      {/* bloom - mid cupped petals */}
      {MID_PETAL_PATHS.map(({ d, strokeWidth }) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      ))}

      {/* bloom - inner cupped petals */}
      {INNER_PETAL_PATHS.map(({ d, strokeWidth }) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      ))}

      {/* bloom - spiral furled center */}
      <path
        d={SPIRAL_CENTER_PATHS[0].d}
        stroke="currentColor"
        strokeWidth={SPIRAL_CENTER_PATHS[0].strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d={SPIRAL_CENTER_PATHS[1].d}
        stroke="currentColor"
        strokeWidth={SPIRAL_CENTER_PATHS[1].strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
