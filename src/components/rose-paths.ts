// Single source of truth for the rose artwork's geometry. Both the
// line-art sign-in/gate rose (rose-motif.tsx) and the filled members
// rose (RoseBackground.tsx) import from here rather than each defining
// their own path data, so the two can never draw different flowers —
// only their fill/stroke presentation differs.

export const ROSE_VIEWBOX = "0 0 420 820";

// Roughly the center of the petal cluster below, used as the pivot
// point for anything that rotates just the bloom.
export const BLOOM_CENTER = { x: 213, y: 190 };

export const STEM_PATH = "M214 780C204 660 246 560 224 460C206 380 176 340 190 260";

export const THORN_PATHS = [
  "M206 690L178 672M206 690L182 706",
  "M228 560L258 548M228 560L256 578",
  "M198 420L170 406M198 420L172 438",
];

export const LEAF_PATHS = [
  {
    outline: "M222 620C258 612 286 630 300 662C264 668 232 656 222 620Z",
    vein: "M232 626C252 636 268 650 278 656",
  },
  {
    outline: "M206 500C170 494 142 512 128 544C164 550 196 536 206 500Z",
    vein: "M196 506C176 516 160 530 150 536",
  },
];

// Bloom petals, outer ring to innermost furl — stroke widths preserved
// from the original line-art so the two renderings stay proportionate.
export const OUTER_PETAL_PATHS = [
  { d: "M212 250C154 258 104 226 96 172C98 152 116 140 138 144C170 150 194 178 202 214", strokeWidth: 3 },
  { d: "M214 250C272 258 322 226 330 172C328 152 310 140 288 144C256 150 232 178 224 214", strokeWidth: 3 },
];

export const OUTER_PETAL_ACCENT_PATHS = [
  { d: "M124 168C150 170 176 188 192 212", strokeWidth: 1.5 },
  { d: "M302 168C276 170 250 188 234 212", strokeWidth: 1.5 },
];

export const MID_PETAL_PATHS = [
  { d: "M210 218C168 220 132 196 122 156C126 138 144 128 164 134C190 142 206 166 212 196", strokeWidth: 2.5 },
  { d: "M216 218C258 220 294 196 304 156C300 138 282 128 262 134C236 142 220 166 214 196", strokeWidth: 2.5 },
];

export const INNER_PETAL_PATHS = [
  { d: "M208 186C178 186 152 168 144 140C148 126 162 118 178 124C196 132 206 150 210 172", strokeWidth: 2.5 },
  { d: "M218 186C248 186 274 168 282 140C278 126 264 118 248 124C230 132 220 150 216 172", strokeWidth: 2.5 },
];

export const SPIRAL_CENTER_PATHS = [
  { d: "M213 168C192 164 178 146 182 124C202 122 218 134 222 154C224 138 238 128 254 130C256 148 244 164 224 168", strokeWidth: 2 },
  { d: "M213 150C202 146 196 134 200 122C212 122 220 132 220 144", strokeWidth: 1.5 },
];

// All bloom (petal) paths in one list — the grouping used by anything
// that needs to rotate "the bloom" as a single unit.
export const BLOOM_PETAL_PATHS = [
  ...OUTER_PETAL_PATHS,
  ...OUTER_PETAL_ACCENT_PATHS,
  ...MID_PETAL_PATHS,
  ...INNER_PETAL_PATHS,
  ...SPIRAL_CENTER_PATHS,
];
