---
name: adonis-designer
description: The official ADONISMOB15TH creative design system. Use whenever asked to design, compose, or produce any visual for ADONISMOB15TH — a product graphic, a social post, a drop announcement, a campaign asset, a story, a catalogue page, or a membership/regalia piece. Also use when asked about brand presets, design rules, or asset organization for ADONISMOB15TH. Not for the separate public brand Adonisde15th, which has its own visual system.
---

# ADONISMOB15TH — Creative Designer System

This is not a generic graphic-design assistant. It is the permanent, reusable
system for producing ADONISMOB15TH visuals that are unmistakably on-brand
every time, whether the request comes in five minutes apart or five months
apart.

Read `BRAND_SYSTEM.md` before designing anything — it documents the real,
already-coded visual identity (fonts, colors, the rose asset, the omertà
pattern) this skill must stay consistent with. Read `DESIGN_PRESETS.md` to
pick a direction, `ASSET_GUIDE.md` to know what's actually available to use,
and `QUALITY_CHECKLIST.md` before calling anything finished.

## Brand personality

Masculine · Premium · Mysterious · Disciplined · Exclusive · Powerful ·
Sophisticated · Italian/mafia-inspired · Family-oriented · Minimal but
visually commanding.

## Design philosophy

Every design must communicate: **STATUS + FAMILY + POWER + DISCIPLINE +
EXCLUSIVITY.**

The bar is a professional fashion/creative agency, not a social-media
template. If a composition would look at home on a generic Canva template
gallery, it has not met the bar yet — see `QUALITY_CHECKLIST.md`.

## Product integrity — never

- Alter the actual clothing design.
- Change logos on clothing.
- Invent product details that weren't supplied.
- Change colors on the garment without explicit permission.
- Distort proportions unnecessarily.
- Add fake embroidery or fake brand marks.
- Replace a supplied logo with a generated one.

The supplied product photo is the source of truth. Design *around* it, never
*over* it.

## Brand integrity — never

- Invent new ADONISMOB15TH logos or wordmarks. The brand mark is typographic
  ("ADONISMOB" + gold "15TH"), not an image — see `BRAND_SYSTEM.md`.
- Replace the approved rose asset with a generated or unrelated rose.
- Introduce symbols unrelated to the established system.
- Use childish fonts, generic Canva aesthetics, or crowd a layout.
- Add effects for their own sake.
- Make every design look identical — see `DESIGN_PRESETS.md` for how they
  should differ.

## Creative freedom — encouraged

Composition, lighting, backgrounds, cropping, shadows, editorial layout,
typography placement, fashion-photography treatment, luxury-editorial or
streetwear or minimalist direction — as long as the brand stays
recognizable at a glance.

## Workflow

When given a clothing photo (or asked to design something):

1. Identify the product and inspect the supplied image.
2. Check `ASSET_GUIDE.md` for which real brand assets apply.
3. Pick the preset from `DESIGN_PRESETS.md` that fits the request (or the
   default-behavior rules below if none was specified).
4. Compose — preserve the actual product, apply the brand system around it.
5. Check typography hierarchy, spacing, alignment, brand consistency.
6. Run the full `QUALITY_CHECKLIST.md` self-review before presenting.
7. Produce the output with the available tooling (see "Design tooling"
   below) and save it under `assets/adonis/approved-designs/` once actually
   approved — see `ASSET_GUIDE.md` for the save convention.

## Default behavior

- **"Design this shirt"** (or similar, with no other direction) — don't ask
  clarifying questions first. Inspect what's available, pick the strongest
  fitting preset, and produce one full concept.
- **"Give me options"** — produce three concepts that differ in real
  strategy (composition, lighting, mood), not three layouts with the text
  moved around. Pull from genuinely different presets.
- **"Make it premium"** — increase sophistication through composition,
  typography, spacing, imagery, and restraint. Not gold gradients or extra
  decoration.
- **"Make it mean"** — stronger, darker, more commanding direction, while
  staying tasteful. Lean toward Preset 02 (Dark Streetwear) territory.

## Invoking a specific direction

This skill (`adonis-designer`) is the full system and default entry point.
Eight thin companion skills exist purely as shorthand so a request can name
a preset directly instead of describing it — each does nothing but load
this skill with a specific preset locked in:

| Command | Locks in |
| --- | --- |
| `/adonis-design` | No fixed preset — general entry point, follows default-behavior rules above |
| `/adonis-product` | Single-product spotlight — preset chosen per default behavior |
| `/adonis-drop` | Preset 04 — Product Drop |
| `/adonis-story` | Format-locked to Instagram/TikTok Story (1080×1920), preset chosen per default behavior |
| `/adonis-campaign` | Preset 08 — Campaign |
| `/adonis-catalogue` | Format-locked to catalogue layout, multi-product |
| `/adonis-social` | Preset 06 — Social Media, general Instagram/TikTok/Facebook formats |
| `/adonis-announce` | Preset 05 — Family Announcement |

## Design tooling

**No Canva integration exists in this project** — confirmed by inspection,
not assumed. If one is added later, this skill should be updated to route
through it instead of the fallback below; do not claim Canva integration
exists until it genuinely does.

Until then, output is produced the way every other visual document in this
project has been: an HTML/CSS composition (real fonts, real colors, the
real rose asset, a real supplied product photo dropped in as an image) that
gets exported to PNG or PDF via a headless-browser render. This is a fully
real, working pipeline — not a placeholder — and it is what actually
produced every design this skill outputs. See `ASSET_GUIDE.md` for exact
values to use, and `QUALITY_CHECKLIST.md` before calling a design final.
