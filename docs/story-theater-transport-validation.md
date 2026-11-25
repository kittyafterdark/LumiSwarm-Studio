# Alpha.14.2 — Theater transport polish validation

Baseline: the complete `Lumiswarm-1.1.0-alpha.14.1-CUMULATIVE.zip`. All editable files and both compiled runtime entries retained. No Lumiverse core or backend edits.

## Design and interaction

- Distinct glyphs for refreshing captured messages and regenerating the latest response. Refresh remains available in playback settings on narrow screens.
- Borderless secondary icons, filled play/pause/stop glyphs, one highlighted forward/reply action, continuous progress and compact mobile transport. Mobile targets are 44px at 351–600px and 40px at ≤350px; the narrowest header hides capture-count text and may truncate long theme names.
- Focus mode reuses the existing live command buttons rather than creating duplicate actions. Swipe arrows/counter are bare, visible on touch and discoverable by hover or keyboard focus on desktop. Active Stop is visible during generation. Reply and regenerate remain in normal chrome.
- Touch/pen taps in the story stage's left quarter go back one screen; elsewhere advances/reveals. Desktop clicks retain their previous behavior. Protected HTML islands, text selection, dragging, scrolling and pointer cancellation remain outside tap navigation; no overlay is introduced. Explicit HTML advance hint retains forward behavior.
- Theater-only mobile docked overlap actor sizing; graphic dialogue has a larger baseline before application of the existing size slider. Mobile docked Cast hints no longer cover dialogue. Regular chat and picker thumbnails unchanged.

## Validation (compiled production bundle, local Chromium fixture)

| Suite | 1440 × 900 | 390 × 844 | 320 × 640 |
|---|---|---|---|
| Live (extended transport checks) | PASS | PASS | PASS |
| Card density and bottom geometry | PASS | PASS | PASS |
| Protected HTML wheel/touch and read-only controls | PASS | PASS | PASS |
| Base Theater playback | PASS | PASS | PASS |
| Inspector/chrome including hostile palette | PASS | PASS | PASS |

Live fixture exercises distinct SVGs, unboxed controls, no mobile button overflow, one footer row, mobile settings refresh, focus mode swipe dispatch through the native-shaped mock and genuine touchscreen taps in both directions. Existing send, stream, stop, regen and reconciliation checks retained. Density fixture verifies zero-pixel Swiss Editorial strip gap and independent graphic slider. First density run caught a fixed font minimum suppressing slider adjustment; corrected by applying the slider after the baseline floor and reran all three widths successfully.

`npm run build` and strict `npm run typecheck` (installed TypeScript CLI via `STUDIO_TSC`) passed. Targeted contracts passed: cast-island-pipeline, cast-presentation, frontend, safety-scan and v27-floating-toolkit. Backend output byte-identical to Alpha.14.1. Full historical repository suite and live Lumiverse integration not rerun. Not every authored card was tested at every viewport; larger actors target overlap templates, not every composition. Browser fixtures are not a substitute for real-device QA. No new dependency or permission.
