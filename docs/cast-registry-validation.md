# Alpha.17 validation

Baseline: Alpha.16.2 cumulative extension. Both compiled Spindle entrypoints rebuilt from the ordered TypeScript sources. No host source modified.

## Verified

- `npm run build` — passed.
- Strict shared-scope TypeScript (`STUDIO_TSC` pointing to the installed compiler) — passed.
- `node tests/cast-registry-contract.mjs` — passed. Explicit identity links, unchanged historical key resolution, local direction and starting outfit hints, fork isolation, copied wardrobe asset mappings, conflicting shared edits, archive/relink.
- `python tests/cast-registry-browser.py` — passed at 1440, 390 and 320px. Actual compiled workspace with a staging-shaped RPC mock using the shared state helpers; divergent packs, outfit copy, batch link, real workshop save callback and local propagation, independent fork, uncast and restore, visible footer and no horizontal overflow.
- `node tests/backend-contract.mjs` — entire existing contract passed, including new registry tests using the actual compiled backend RPC handlers: compatibility, stale base signature, copy, linked Edit replacement, independent side, conflicting writes, uncast/relink. Expected rejection logs are part of the fixtures.
- `npm run test:cast` — seven existing Cast contracts passed.
- `node tests/wardrobe-workshop-contract.mjs` — passed.
- `python tests/wardrobe-workshop-browser.py` — passed at all three widths, including the previous false stale-wardrobe save regression.

## Not verified

Live Lumiverse installation, actual Swarm rendering, cross-device concurrency under the live host, and an end-to-end Vacuum deletion exercise. Reference protection follows the existing Cast JSON inventory, which includes the new stash; this is not a new Vacuum API. Not every historical UI suite was run. The character library screenshots are compiled UI captures with fixture artwork (the same portrait reused for mock characters). No permanent deletion, standalone uncast workshop, automatic cross-character merge, or immutable historical artwork snapshots.

## Alpha.17.1 layout follow-up

Production build, strict TypeScript and the registry state contract passed. The expanded compiled registry browser test passed at 1440, 390 and 320px, including equal desktop card heights, three equal action slots, 44px minimum action height, fixed filtered card width, disabled copy slots and all existing registry operations. No backend changes. Live host and unusually long compatible-member lists have not been visually tested.
