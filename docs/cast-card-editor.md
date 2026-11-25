# Card Atelier (1.1.0-alpha.7.2)

> Historical alpha.7.2 behavior. For current scope and UI, see [Member Atelier](member-atelier.md).

Open the context menu on a rendered Cast dialogue card. The editor previews the actual template, background, dialogue and actor in an isolated shadow root. Select the expression or the card itself using the toolbar or preview. The selected element has a visible outline; pointer dragging and the corner handle supplement keyboard-operable range inputs. Apply commits the draft. Close discards it. Reset previews the original card and takes effect after Apply. Shared Cast opens the existing member-wide presentation, side and crop controls instead; unapplied local edits are discarded on that transition.

## Local controls and scope

- Expression selects an existing image from the same member. It updates the expression label as well as the art. No generation or image upload occurs.
- Actor scale is 75–150%, movement is bounded to ±20% horizontally and ±15% vertically, relative to the image layer. Adjusted art is clipped at the card boundary, including decorative overflow. The original preset geometry is otherwise preserved; transparent padding in source images affects the apparent selection size.
- An optional local crop overrides the member crop, including enable/disable, position and 1–3x zoom. Templates that intentionally show the full portrait do not expose crop controls. Existing template crop constraints still apply.
- Desktop card width is 40–100% of the message area, retaining template width until explicitly changed. On narrow or coarse-pointer screens the template's own responsive width applies. The preview is limited by the editor viewport, so it may be smaller than the eventual message area.
- Edits apply only after backend confirmation. Failed saves retain the draft. The original RP packet, other cards, Cast library, generation settings and prompt compiler are not modified.

## Persistence

Overrides are stored in per-user `cast-card-overrides-<chatId>.json`, with at most 1,000 recent records per chat. Keys combine message ID, packet index, available numeric swipe ID and two hashes of the authored packet. Editing the packet creates a new identity. On hosts without swipe metadata, identical packets at the same index in the same message cannot be distinguished. Records reference saved member/expression keys, not image URLs. They are local chat preferences, not portable Cast album content or extra Vacuum asset references. Backend writes validate active chat, member and expression and serialize read-modify-write. If card identity or storage is unavailable, the shared Cast controls remain usable.

## Floating surfaces

Dock, Quick Create, easel and prompt diagnostics honor the Studio background and appearance swatches, with host theme fallbacks. The diagnostics dialog uses a centered, scrollable layout and read-only text fields. Its context menu action has a dedicated document/search SVG. Neither generation dispatch nor compiler selection is changed.

## Verification

`npm run build`, `npm run typecheck`, `node tests/backend-contract.mjs`, `python tests/cast-card-editor-browser.py` and `python tests/studio-polish-browser.py`. Browser tests use a mock host at 1440, 390 and 320px and a real scene template, covering local expression art/label, slider geometry, desktop pointer movement/resize, mobile width restrictions, crop, failed saves, independent cards, remount, swipe isolation, immutable source packets, theme and diagnostics. Live Lumiverse integration and physical-device touch behavior remain to be verified. Six older jsdom-dependent contracts could not run in the build environment because the dependency was unavailable.
