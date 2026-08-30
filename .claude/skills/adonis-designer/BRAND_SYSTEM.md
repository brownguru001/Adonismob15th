# ADONISMOB15TH — Brand System

Everything in this document is read directly from the live codebase, not
invented. Where a value is inferred rather than literal, it's marked as
such. No approved finished designs or product photography exist in the
project yet to reverse-engineer a "studied" system from — this document
codifies the real, currently-implemented visual identity instead, which is
the honest source of truth right now.

## Color

Defined in `src/app/globals.css`:

| Token | Hex | Use |
| --- | --- | --- |
| `--color-ink` | `#0a0a0a` | Primary background, near-black rather than pure black |
| `--color-ink-soft` | `#1a1512` | Secondary surface, cards, raised panels |
| `--color-bone` | `#f1e9d8` | Primary text on dark, and light-surface backgrounds |
| `--color-bone-dim` | `#e3d6b8` | Secondary/muted text on dark |
| `--color-gold` | `#ab7d2c` | The one accent — CTAs, the "15TH" in the wordmark, emphasis |
| `--color-gold-soft` | `#cba455` | Gold at lower emphasis (hover states, secondary accents) |

Gold is the single accent. It does not compete with a second bright color
anywhere in the live site — that restraint is part of what reads as
"expensive" rather than "decorated." Don't introduce a second accent hue.

## Typography

Loaded via `next/font/google` in `src/app/layout.tsx`:

- **Display: Cinzel** (weights 500/600/700/900) — a Roman/imperial-inflected
  serif. This is doing real work for the "Italian/mafia-inspired, powerful"
  personality; it is not a neutral choice and should not be swapped for a
  generic serif.
- **Body: Libre Franklin** — a clean, restrained sans. Carries information
  without competing with Cinzel for attention.

There is no third typeface anywhere in the system. Do not add one.

## The wordmark

There is no logo image file anywhere in the project. The brand mark is
coded typography, consistently: **"ADONISMOB"** in bone, immediately
followed by **"15TH"** in gold, no space, same weight — e.g.
`ADONISMOB<span class="text-gold">15TH</span>`. Reproduce this exact
pattern in designs rather than inventing a lockup, a badge, or a crest.

## The rose

`public/rose/color/frame-001.webp` through `frame-080.webp`, and the same
80 frames in `public/rose/line/` (line-art/monochrome variant). These are
real traced frames from an actual reference photo (not AI-generated), used
live on the site as a scroll-scrubbed rotating turntable. For static
designs, treat any single frame as a valid brand asset on its own — a
strong three-quarter angle (roughly frame 015–025 or 055–065 in either set)
reads best in a still composition. Use the **color** set for anything
warm/rich, the **line** set for anything restrained or pre-reveal. Never
substitute a different rose graphic or a generated one — see
`ASSET_GUIDE.md` for exact paths.

## The omertà pattern

`src/components/omerta-field.tsx` — a low-opacity, rotated, tiled SVG
pattern of the word "OMERTÀ," rendered in gold at very low opacity over
ink. This is the system's one textural/background device beyond flat color.
Use it sparingly, as a background texture only, never as a headline
element — its job is to reward a closer look, not to shout.

## Voice cues already in the live copy

- "Private platform. Not for public distribution." (footer)
- "Private access only. If you don't have an invitation, this platform
  isn't available to you." (sign-in copy)

Short, declarative, no exclamation points, no urgency language ("Don't miss
out!", "Limited time!"). Confidence reads as restraint, not enthusiasm —
carry that into any copy placed inside a design.

## Composition principles, inferred from the live layout

- Generous negative space around the wordmark and around any single hero
  element (the rose, a product) — nothing crowds the frame.
- Dark ground as the default; bone/light surfaces are used for contained
  panels (forms, cards), not as a full-bleed background.
- Gold is placed with intent — one focal use per composition (a word, a
  line, a single detail), not scattered as decoration.
- Symmetry and centered composition is the default register; asymmetric,
  editorial layouts are a deliberate choice for a specific preset (see
  Luxury Editorial and Dark Streetwear in `DESIGN_PRESETS.md`), not the
  baseline.

## What does not exist yet (be honest about this)

- No product photography.
- No finished/approved marketing designs to study or extract patterns from.
- No secondary logo mark, crest, or seal beyond the typographic wordmark.
- No Canva or other third-party design-tool integration.

Do not fabricate any of the above. When a workflow step calls for one of
these and it isn't available, say so and ask for the real asset rather than
inventing a placeholder and presenting it as final.
