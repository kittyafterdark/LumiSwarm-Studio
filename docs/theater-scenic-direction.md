# Theater scenic direction & scene index (Alpha.17.4)

## Saved scenery

Open Theater Settings → Theater Atelier → Stagecraft → Scenery. Story scenery follows the existing Cast timeline; Background library browses the active Cast's saved locations and shared reusable Background Assets. The picker supports search, source filters, eight results per page and a manual refresh. Missing artwork is indicated in its thumbnail. Select an image to preview it immediately on the stage. Fit (cover, contain or stretch), horizontal and vertical focus, and zoom are independent of the underlying artwork. Existing lighting, actor treatments and atmospheric effects remain available. A replacement SVG pattern becomes an overlay when a saved image is selected.

By default, a manual choice lasts until you leave the current scene. Pin it to retain it across scene boundaries while Theater is open. Return to story scenery reveals the current canonical story location. Procedural scenery and no scenery are also supported. These selections are session-local, not part of saved appearance presets or Cast storage; closing Theater resets them. The existing lighting and procedural pattern settings still belong to the look. No image files are created or changed. The catalog is limited to the first 600 valid, deduplicated background references. Generic assets without a location name are labelled by their saved folder order.

The read-only backend request uses the existing chats and images permissions and validates the active chat. A pending or stale response cannot overwrite another Theater session. Older or unavailable host services leave normal story scenery usable and show a retryable library error.

## Scene index

The backlog now groups the captured screens under their original message. The historical author name and user/character flag come from the native message API, not the currently speaking Cast actor. Select the message heading to jump to its first screen. Select the count/chevron to expand it and choose a paragraph, Cast card, CG or HTML island. Expansion is retained while Theater is open. For messages outside available metadata, the author is labelled unavailable. This is still an index of captured screens, not a full-history fetch.

## Local HTML disclosure

Theater's isolated HTML projection preserves native details/summary toggles and local checkbox/radio disclosures, including labels associated with the local input. It allows the browser's local default behavior without advancing the story. Same-screen refresh preserves compatible disclosure and scroll state; the source chat's DOM is not modified. Arbitrary scripts, event handlers, external navigation, form submission and host/regex actions remain disabled; these are not live copies of executable widgets. HTML already stripped by the host cannot be recovered. Use the original chat for actions requiring the host.

## Validation

- Compiled background catalog and grouped index fixture (`npm run test:theater:scenery`): passed 1440×900, 390×844 and 320×640. Catalog filtering/pagination, error retry, scene-local and pinned selection, fit/focus/zoom, SVG/no scenery, canonical timeline isolation, message heading and child-screen jumps, late response isolation.
- Compiled protected HTML fixture (`npm run test:theater:html`): passed all three widths with native disclosure, CSS checkbox toggle, same-screen refresh, independent source DOM, wheel/touch and blocked action checks.
- Interactive Theater: passed all three widths (320px isolated rerun). Existing inspector chrome at 320px, FX at 390px, base playback at 1440px and Stagecraft at 390px passed targeted runs; the latter two ran before the local HTML disclosure adjustment.
- Full backend contract including the new active-chat-scoped scenery request: passed. Production build and strict typecheck passed using available TypeScript 5.8.3 (package-pinned compiler unavailable).
- The older flat-backlog contrast fixture was updated to inspect the new message heading. The complete historical suite, live Lumiverse instance, actual user's HTML source and GPU performance were not tested in this batch. Chromium mock-host tests are not a live integration sign-off.
