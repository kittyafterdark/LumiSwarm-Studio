# Alpha.13.5 validation

- Production bundle and strict TypeScript passed on the native-stage implementation, using the installed global compiler. No backend bundle changes, dependencies or permissions.
- New `npm run test:theater:native` passed at 1440×900, 390×844 and 320×640 using compiled code and a mocked Lumiverse host. Verified native vs authored rendering, one scenery layer, authored quote colors, scene label, active/inactive actor focus, narration persistence, rewind, bottom-dock toggle, actor toggle, SVG replacement/fallback, Frosted Reverie label and reduced default dimming/blur, narration material, stored staging preference, scene boundaries, CG hiding, original DOM preservation, no backend calls and no horizontal overflow.
- Five targeted contracts passed: Cast island pipeline, Cast presentation, frontend, safety scan and floating toolkit. The full historical suite and other browser engines were not rerun; live host compatibility and every template/override combination remain unverified. Fixture captures use illustrative sample artwork rather than a live conversation.
- Automatic staging changes scenic compositions; graphic and Codec compositions retain their authored card unless Native is explicitly selected. Missing hydrated inputs fall back. The mounted-message limitation remains. Existing explicit user dim/blur overrides may require section reset to use the new defaults.

## Previous release

# Alpha.13.4 validation

- Production bundle and strict TypeScript passed on the final source, using the installed global compiler. The backend bundle is byte-identical to Alpha.13.3. No new dependencies or permissions.
- New `npm run test:theater:chrome` passed at 1440×900, 390×844 and 320×640 on the final build. The mock fixture uses the actual compiled Theater and Cast renderer. Checks deliberately all-black story palettes, measured WCAG text/background contrast >= 4.5 for representative inspector and playback controls, fixed save-footer position, panel overflow, search, pagination, actual rendered card thumbnails, selection and empty results, four Stagecraft previews, live weather/lighting changes, slider labels, draft cancellation, desktop hover restoration, touch visibility, unboxed 44px target, backlog/gallery, unchanged original message DOM and zero backend calls. All release screenshots are compiled Chromium captures with fixture art.
- Existing base Theater regression passed at all three widths on the release candidate before the last selected-preview/pagination layout adjustment. Active text reveal and late Cast hydration checks passed. The final inspector test was rerun after that layout adjustment.
- Existing Stagecraft regression passed at all three widths during the chrome redesign. Eight-theme art-direction regression passed at 390px during development; the initial parallel desktop art-direction runner was interrupted (EPIPE), so no completed desktop art-direction suite is claimed. Five targeted Cast island pipeline, Cast presentation, frontend, safety scan and floating-toolkit contracts passed during development.
- Scope: local browser UI only. No live Lumiverse installation, complete historical `npm test` suite, or other browser engine was tested. Contrast checks cover representative controls, not a comprehensive WCAG accessibility certification. Inspector palette is intentionally stable rather than themed; playback chrome honors story colors where readable. Stagecraft previews are miniature approximations of the real stage; underlying actor and scenery semantics remain unchanged. No exhaustive audit of every combination of fifty Cast templates and custom tokens.

## Previous release

# Alpha.13.3 validation

- Production frontend rebuilt; strict TypeScript passed with the installed compiler. Backend bundle byte-identical to Alpha.13.2. No new dependencies or permissions.
- Stagecraft browser fixture passed at 1440×900, 390×844 and 320×640 on the final compiled build (`npm run test:theater:stagecraft`). Verified actual VN Cast templates, last-seen identity, expression rewind, stable narration sprite nodes, inactive filter, scene and explicit-none resets, CG hide/restore, manual clear/undo, actor toggle, all nine SVG patterns, fallback/replacement/overlay, atmosphere and lighting controls, persisted look tokens, Codec last-seen portrait, bounded invalid settings, mounted gaps, no original chat DOM edits, no backend calls, and chat-switch teardown. Screenshots are captured from the compiled application.
- Targeted Cast island pipeline, Cast presentation, frontend, safety scan and floating-toolkit contracts passed on final build.
- Existing art-direction browser suite completed successfully at all three widths during development. Existing base playback suite passed at 320px in an isolated rerun after the parallel runner was interrupted (EPIPE); its desktop/mobile checks had previously been exercised during development. The final Stagecraft suite was rerun in full after the last visual adjustments.
- No live Lumiverse installation, GPU execution, cross-browser matrix, or complete historical `npm test` suite was run. Actor staging depends on captured, hydrated artwork; not all 50 card templates were exhaustively tested for persistent actors, lighting and procedural scenery. Manual scene boundaries are session-only. Full-history playback and live LLM streaming limitations remain.

## Previous release

# Alpha.13.2 validation

- Production bundle and strict TypeScript: passed with installed global compiler.
- Targeted frontend, Cast presentation, Cast island pipeline, safety scan and floating toolkit contracts: passed.
- Existing compiled Theater regression: passed at 1440×900, 390×844 and 320×640, including source order, real Cast card, continuity, inline colors, safe HTML, late hydration, settings, gallery, autoplay, resume and teardown. Active text reveal fixtures at desktop and 390px passed.
- New `npm run test:theater:art`: all eight new looks exercised at all three viewport widths, including four screen kinds, source order, actual Cast template mapping, expression source, side, authored inline color, no source DOM edits and zero backend calls. Checks scenic density, draft cancellation, independent rain settings and bounded particles, per-chat/global scope, custom card, named library, JSON import/export and invalid-import rejection. Screenshots captured from compiled UI using fixture artwork.
- Backend bundle remains byte-for-byte identical to Alpha.13.1. No dependency or permissions changes.

## Boundaries

Mocked Lumiverse host, Chromium only. No GPU execution or live host integration verification. Not all historical suites or every existing Atelier card and adjustment combination were rerun. Seamless world scenery is restricted to compatible stages; missing override inputs retain the original card. The UI has one portrait and a signal monitor for Codec, not invented second speakers. Particle animation is decorative; no automatic weather inference. The full-history and live LLM streaming limitations remain. Host theme token lookup accepts six-digit hex values and falls back otherwise. See [Art Direction](theater-art-direction.md).
