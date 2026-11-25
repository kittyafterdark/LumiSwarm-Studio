# Cast Wardrobes · alpha.10

One Cast member can hold multiple independent outfits, without duplicate people or duplicate source files. The member retains their shared identity and presentation preferences, and each wardrobe inherits the album recipe while owning its outfit prompt, reference, expression slots and workshop settings.

## Organizing an existing member

1. Open the member's Expressions page. Existing expressions initially belong to **Original outfit**. Its stable packet key is `default`. You may rename its display name to Casual, etc.
2. Choose **New outfit**, enter a name (for example Dynamight) and optional stable key (`patrol`), then describe the clothing. Save. Choose an exact outfit reference in Outfit settings when available, or choose **Use Neutral** after that expression exists.
3. Select Original outfit and choose **Move expressions…**. Select the destination and the existing expressions. Enter `patrol-` in the optional prefix field to convert `patrol-confident` to the logical expression `confident`. This does not change the underlying asset key or image ID.
4. Select the new outfit and choose Open expressions. The existing Expression Studio handles generation, reference adapters, enhancements, background removal, despill and saves for that wardrobe. One-off prompt and LoRA overrides retain their existing workshop scope.
5. Return to the original outfit to edit its own expressions. Use Member Atelier's Replace expression controls to select a different outfit and expression for an individual dialogue card.

The original outfit is always present; empty additional outfits can be removed. A populated outfit must be emptied by moving or removing its expressions before removal. Active Genesis production blocks wardrobe reorganization to avoid conflicting registration. Do not delete original image files to move expressions.

## Packets and continuity

```xml
<swarm-cast=katsuki-angry wardrobe=patrol background=agency>"Get out of the way."</swarm-cast>
<swarm-cast=katsuki-joy wardrobe=default background=kitchen>"Fine."</swarm-cast>
```

An explicit wardrobe resolves its requested logical expression or a saved alias. If unavailable, it uses Neutral **in that wardrobe**; if no Neutral is available the ordinary dialogue remains readable. A member-only explicit packet uses the selected wardrobe's configured default. Unknown wardrobes do not fall back to other outfits.

Legacy packets such as `<swarm-cast=katsuki-patrol-confident>…</swarm-cast>` retain their exact flat asset key and still render after movement. The original wardrobe's key remains `default` even when renamed. Old packets without a wardrobe are not retroactively reinterpreted as the latest outfit. The injected directory prompts the RP model to repeat the explicit wardrobe on every packet for wardrobe-enabled members, using the most recent explicit wardrobe in the supplied assistant dialogue history as a hint. It does not persist a mutable active outfit across historical messages. Individual card corrections remain per-card and swipe-aware.

## Storage, folders, and limits

Wardrobes are optional metadata on the existing Cast member; the canonical image mapping stays flat to preserve existing Edit replacements, asset protection and legacy references. Logical slots reference stable physical keys. Existing data is unchanged until a wardrobe is saved. Wardrobe-specific reference IDs and settings are independently saved. Up to 12 wardrobes and 64 expressions per wardrobe are supported for newly produced collections, within the existing library limits. Old unmapped assets are retained in the original collection instead of silently discarded.

The managed output folder for the original outfit keeps `cast:MEMBER_ID`; additional outfits use `cast:MEMBER_ID:WARDROBE_KEY`. Migration updates the known managed folder references without deleting files or touching Favorites or unrelated user folders. Old drafts and archived results are retained. Folder synchronization is best effort after the Cast save, so a full output library or storage failure may require manual organization; no Cast mappings are discarded. Native host character/persona deployment remains a flat legacy image mapping, not a separate wardrobe-aware renderer.

New Genesis member production still targets the original collection; automatic wardrobe creation is intentionally deferred. Genesis's existing saved identity is not automatically split into physical identity and clothing; if clothing is present in a member identity, move it into the appropriate outfit prompt yourself so the shared identity is truly reusable.

## Regression coverage

- `npm run build` and `npm run typecheck`
- `node tests/cast-wardrobes-contract.mjs`
- `node tests/backend-contract.mjs` (mock provider verifies distinct reference binary IDs, scoped outfit prompt and managed-folder migration)
- `python tests/cast-wardrobes-browser.py` (Chromium, 1440/390/320 px; strict save signature, create, move, reference, scoped save, fallback, local outfit correction and restoration)
- Existing Cast Genesis, Card Atelier and Cast Recipe browser fixtures.

These tests do not substitute for live Lumiverse/Swarm verification. Keep a backup of the current extension and Cast library before upgrading. Downgrading to older runtimes will not understand wardrobe metadata and should not be used to edit a wardrobe-enabled library.
