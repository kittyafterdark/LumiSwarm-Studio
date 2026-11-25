# Alpha 17.11: Cast overlap refinement

## Composition and materials

The eight amended existing presets retain their IDs, the existing Cast/Member Atelier presentation selection and stage-side behavior, a single tracked actor and a single dialogue node. No new storage schema or generation operations are introduced.

- Shonen Burst: native stage cap 680px (previously 520px), reduced art allocation, safe flexible dialogue width, jagged decorative background layers that do not clip speech, asymmetric speed lines and a stacked overlap below 430px.
- Manga SFX: native cap 560px (previously 420px), wide growing speech plate, stable internal composition across stage sides and an ink-contrast-aware local material.
- Anime OVA: native cap 560px (previously 460px), opaque readable tape metadata, inverse-contrast speaker/expression tag and dedicated subtitle matte; uncolored dialogue retains the preset's original ink.
- Cyber Telemetry Plaque: fixed phosphor-accented instrument shell with chamfered frame, segmented metadata, inset dialogue field and decorative telemetry rail. The rail is an ornament, not a signal readout.
- Pill Capsule Dock: neutral capsule with circular medallion using the active wardrobe's default expression, with fallback to the current artwork if unavailable. This is a decorative CSS image, not another actor or dialogue participant. Theater custom overrides propagate the available local default-image path. Old cards without it fall back to their active expression.
- Origami Fold Ribbon: folded returns, creased name/expression tab and separate reading field.
- Washi Tape Strip and Stamped Paper Scrap: paper grain, fixed warm paper stock and tape/perforation details; bright authored ink switches to neutral dark stock, not a speaker-tinted wash.

Materia Frosted Plaque, Obsidian Lower-Third, Halftone Burst Notch, Swiss Editorial Strip and Subtitle Laser Beam retain their previous visual treatments. All 50 existing presentation IDs remain. The source generator continues to own the canonical presentation module; `scripts/cast-overlap-refinement.css` supplies the new decorative treatments. The original authored color is not rewritten. A neutral light/dark material is chosen for explicit 3/6-digit RGB ink; other color formats continue to use the template default classification. Older cards already mounted in the host may need a refresh/re-render.

## Validation

- Production build and strict TypeScript passed using the available global compiler.
- 43 of 49 existing npm contract commands passed independently. Six were blocked by unavailable jsdom, not executed assertions.
- Cast stage geometry: 450 cases (50 templates × 3 stage sides × 3 widths), including long mobile dialogue.
- New compiled Shadow DOM overlap regression: 216 layout combinations (8 templates × 3 widths × 3 sides × 3 colors), each with short and long dialogue, exact ink, width/containment, one actor/one quote, and default medallion/ Theater override checks.
- Wardrobe contract includes explicit non-default wardrobe, historical asset key, and default wardrobe capsule avatar assertions.
- Existing live-sized Shadow DOM stage-parity browser test passed after updating the intentional 560px cap and fixing its stale module-to-script conversion (the frontend now has top-level exported functions).
- Theater density passed at 1440, 390 and 320px. Crop focal-point assertions and image-bay zoom containment passed, but the final tech-messenger screenshot inequality assertion fails identically on the unmodified 17.10 baseline. That unrelated issue is not changed here.
- Review sheets were captured from compiled Chromium with fixture expression artwork, not a real live Lumiverse conversation. No live provider/GPU behavior or actual user dialogue was required or tested.

Run the new test: `npm run test:cast:overlap`. To save review images, set `CAST_OVERLAP_SCREENSHOTS` to an output directory before running it.
