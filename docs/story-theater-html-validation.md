# Alpha.14.1 — Protected HTML islands

## Changes

- HTML uses its own visual-copy policy and isolated Shadow DOM. Authored layout tags, controls as inert visual placeholders, authored stylesheets, inherited chat variables and typography, and safe local SVG references are retained. Cast/narration styling is not applied inside HTML islands.
- The HTML projection itself is no longer inert. Nested scrolling, native wheel/touch input and text selection are available; clicks inside it never advance Theater. The explicit advance hint and playback controls remain available. Interacting pauses autoplay. Same-frame rerenders restore nested scroll offsets using element order and identity guards.
- Scripts, iframes, executable elements, action attributes, link destinations, and form targets are not copied. Controls are read-only; submission and action events are blocked. This is not a general-purpose sandbox for arbitrary unsanitized HTML: the input remains the host's sanitized render.
- The live completion gate is unchanged; ambiguous regex transformations still defer until final native render.

## Validation

- Production bundle rebuild and strict TypeScript: PASS.
- New production-bundle HTML browser regression, 1440×900, 390×844, 320×640: PASS. Checks native typography and theme variables, header geometry, SVG symbols/local references, form layout, hidden markup, stripped script/iframe/action attributes, real mouse-wheel input, real Chromium touch drag on mobile, unchanged screen index, focus mode, explicit advance hint, and unchanged host content (ignoring browser-generated empty style attributes).
- Existing live browser regression at 390px: PASS, including streaming HTML completion gate, late Cast hydration and response actions.
- Existing read-only Theater regression at 320px: PASS.
- Five targeted Cast/host contracts: PASS (Cast island pipeline, Cast model, frontend, floating toolkit, presentation catalog).
- Backend remains byte-identical to Alpha.14. No new dependencies or permissions.

## Boundaries

The phone fixture recreates the reported failure class, not the exact original HTML. Full live-host testing and exhaustive regressions remain outstanding. External stylesheets outside an island, custom elements, executable controls, arbitrary action attributes and remote SVG references are intentionally not reproduced. Same-frame scroll restoration applies when the projected element structure remains compatible; replacing a scene can reset scroll. The source archive is retained separately, and this release is cumulative.
