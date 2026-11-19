# SwarmUI preset modal layout recovery

The preset save dialog and adjacent preset manager rendered dynamic content using classes that were absent from the authored Studio CSS. Inputs used shared styling but the parameter list, checkboxes, name/value pairs, and manager rows collapsed into unbounded inline content. This is pre-existing in the original uploaded extension, not an Expression V3 regression.

## Changes

- Added single authored, Studio-theme-token-based styles for the save dialog checklist and preset manager rows.
- Kept the name and description fields visible above a bounded scrollable list; the dialog's footer stays reachable.
- Long model and LoRA values wrap/clamp gracefully; hovering a row's value exposes its complete original content as a browser tooltip.
- Kept existing seed-off-by-default and selected-parameters-only behavior.
- Added a regression contract in `tests/swarm-preset-modal-contract.mjs`.

## Verification

- Build, TypeScript check, frontend/backend contracts, safety scan, regression contract.
- Chromium with a mocked 27-field SwarmUI schema, including long LoRA strings, at widths 1440, 650, 390, 320. Checked no horizontal overflow, scroll containment, footer accessibility, seed default, checkbox selection, and the exact outgoing `add_swarm_preset` parameter map.

No live SwarmUI account was used for the browser test.

## Compact parameter-sheet follow-up

The first recovery used vertically stacked bordered cards and wasted space. The corrected save modal has a two-column desktop parameter sheet (single column on narrow screens), understated row separators, bulk selection with a live selected count, and on-demand full-value disclosures. Details are visually collapsed only; the original complete parameter values remain in `pendingPresetParamMap` and are never copied from text previews during save. Seed remains unchecked initially; Select all can include it only by user action. The constrained scroll region is between the name/description fields and the fixed save footer.

The authored styles belong to the existing `.ss-workflow-modal` section of `src/studio/styles.ts`. Keep one base declaration for each component selector. `tests/swarm-preset-modal-contract.mjs` guards layout structure, account/save semantics, and no truncated payload. Browser verification uses the actual compiled controller with a mock Swarm parameter schema, including lengthy LoRA values and 320px screen widths.
