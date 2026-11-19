# Expression Studio V3

This is the production implementation of the approved V3 Expression Studio browser prototype. It replaces the former seven-column direction forms with 9:16 portrait cards, a full-size image inspector, a direction editor, stage summaries, filtering, and a responsive workflow. It uses the existing Swarm Studio CSS tokens and preserves the four real backend stages and their request/stop/cleanup behavior.

## Source map

- `src/studio/expressions.ts`: expression stage UI, inspector, direction editing and reset, card rendering, image assignment, ratio controls, and account-backed bank management.
- `src/studio/styles.ts`: single authored Expression Studio V3 ruleset. Do not stack new contradictory selectors at the end of the stylesheet.
- `src/state/expression-set.ts`: sanitizes set slots and reusable bank entries; keeps optional `bankId` with a custom slot.
- `src/backend.ts`: separate per-user `expression-bank.json` read/write requests, distinct from `expression-set.json`.
- `src/studio/controller.ts`: bank requests use the same short request timeout as set requests.
- `dist/frontend.js` and `dist/backend.js`: required compiled entry files loaded by `spindle.json`. Rebuild after source edits.

## Behavior

The 20 built-in directions remain canonical, so individual and bulk resets restore the exact defaults. Custom directions can be saved to an account-level bank, reused for another character, edited, imported or exported as `lumiswarm-expression-bank-v1` JSON, and removed from the bank without removing character slots. The account bank holds up to 150 names; the current character still allows 24 extra slots.

The dimensions selector supports six ratios, 64px slider ticks, independent numeric fields, and a lock that preserves the selected ratio. Aspect presets may use 8px precision for accurate 9:16 ratios, while the slider itself moves in 64px increments. Resulting sizes are stored in the same generation recipe as before. Existing prompt inheritance, model selection, background removal, upscale configuration, and optional publishing prefixes are unchanged.

## Verification

Run `npm run build`, `npm run typecheck`, `node tests/expression-v3-bank-contract.mjs`, and `node tests/backend-contract.mjs`. The dialog has also been exercised in Chromium at 1440px, 390px, and 320px using mocked render/backend data: six image generations, full inspector, bank reuse/persistence and reopen, direction reset, ratio linkage/unlinkage, four-stage navigation, naming example and horizontal overflow checks.

No supplied character artwork is included in production source. The local test harness uses image fixtures only.

## Mock fidelity repair

The first V3 production pass retained several legacy gallery DOM structures and did not faithfully implement the approved standalone prototype. The corrected renderer uses a dedicated `ss-expression-art` frame containing the clickable preview and floating selection/state controls, with the title, direction, and compact `Edit / Render / Attach` actions placed below the artwork. Gallery filters are a visible segmented control, and the wide desktop gallery has five portrait columns within a centered 1280px content rail (four at narrower desktop widths, three on tablet widths and two on mobile). The image inspector and live processing actions are unchanged. The header, configuration strip, and footer now follow the corresponding mockup composition.

Do not restore the previous `cardHead, preview, body, cardActions` sibling ordering, seven-column/auto-fill gallery, native select-only filtering, or forced full-width Saved image button. Put future component updates in the existing authored `.ss-expression-*` rules and change the renderer as needed. Avoid corrective override stacks and `!important` layout patches. Run `node tests/expression-v3-layout-contract.mjs` alongside the expression bank contract, and check real browser layouts with the production `src/studio/expressions.ts` renderer.

## V4 follow-up: viewport, inspector, gallery density and naming

The Expression Studio dialog now starts at the viewport top instead of using the host safe-top offset as an external gap; it fills the scaled viewport height while respecting device safe-area padding inside the header. Its title, stage navigation, overview and footer consume less vertical room. Gallery sections share a centered 1280px rail and use 5/4/3/2 columns according to viewport width.

The inspector image is absolutely contained inside a height-limited, clipped preview stage, with `object-fit: contain`; metadata and footer live in their separate layout rows. This fixes the prior grid intrinsic-size leak that allowed large source images to overlap the metadata and footer. The publish preview uses a distinct `ss-expression-naming-example` group so the name chip stays with its caption and inside the configuration strip.

Do not reintroduce safe-top as an external dialog offset, grow card width by expanding the grid to the full viewport, or switch the inspector image back to an intrinsic-sized grid item. Check `node tests/expression-v4-viewport-contract.mjs` and browser screenshots at 1700/1440/390/320px for these layout invariants.

## V5 inline direction editor

The Generate-stage card owns its direction editor. Clicking **Edit** replaces only that
card's two-line direction preview with an in-card textarea, followed by a two-button
**Save to bank / Restore** toolbar and **Save / Cancel** actions in the card's
original action row. The portrait, inspector, responsive card grid and other stages
remain unchanged. One card can be edited at a time; changing stages or gallery
filters discards the uncommitted draft. Pressing Escape cancels the draft, and
Ctrl/Cmd+Enter saves it. Focus returns to that card's Edit button on Save/Cancel.

A direction change is not persisted until **Save** is pressed. **Restore** updates
only the active draft; Cancel still preserves the previous direction. **Save to
bank** persists an independent reusable template immediately, even if the active
card edit is subsequently cancelled. Custom names update their matching bank
template. Canonical built-in names are reserved by the validator, so saving a
built-in direction creates an account-wide `Neutral variant`, `Neutral variant 2`,
etc., rather than overwriting the built-in expression itself. Repeat bank saves
in the same active set update its linked variant. The inspector no longer contains
an Edit direction action; editing stays on the card.

Authored component rules: `ss-expression-card-editing`, `ss-expression-card-editarea`,
`ss-expression-card-edit-tools`, and their button/restore SVG descendants are
adjacent to the existing card-info rules in `src/studio/styles.ts`. All colors
inherit the Studio semantic token palette, with no appended override stylesheet.

Regression tests: `node tests/expression-v5-inline-contract.mjs` and the production
Chromium harness at 1700, 1440, 768, 390 and 320px using mocked account persistence,
bank writes, image generation, inspector, and card selection. Save, Cancel,
Restore, bank creation, reload, and narrow-screen containment were exercised.
Authenticated generation still needs testing in a live Lumiverse installation.

### V6 inline editor geometry

The active direction editor rises over the lower portion of its own portrait. Its details row keeps the same footprint as a read-only card; the editor is positioned inside that row, not inserted as additional document-flow height. This preserves grid alignment when editing. An opaque, theme-token panel protects text legibility above generated art. The textarea scrolls internally rather than expanding the card. On narrow cards the regeneration action is labeled **Redo** with a full accessible name.
