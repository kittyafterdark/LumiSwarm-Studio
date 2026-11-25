# Wardrobe lifecycle (Alpha.17.3)

Open Cast > member > Wardrobe, select an additional outfit, then **Manage outfit** (also available in Outfit settings). Choose the scope explicitly:

| Action | Scope | Historical artwork | Future selection |
| --- | --- | --- | --- |
| Hide in this cast / Show in this cast | Current cast membership only | Preserved | Hidden or shown here only |
| Archive globally / Restore globally | All memberships of the shared character | Preserved | Archived everywhere; restoration respects local hides |
| Remove globally | All memberships of the shared character | May cease to resolve | Mappings and workshop settings removed |

The original outfit cannot be hidden, archived or removed. Hidden and archived outfits still count toward the wardrobe limit. Local hides appear under **Hidden in this cast**; global archives appear under **Archived outfits**. Show an outfit locally from the first section. A global restore returns the wardrobe to the shared collection but does not clear local hides. Existing global archives are not automatically converted to local hides. Unavailable outfits are excluded from new expression choices, prompt directories, continuity hints, workshop selection, and new card corrections. Historical packets retain their original resolution. Historical corrections can retain already selected artwork.

The visibility list belongs to a cast membership (`hiddenWardrobes`), not the shared wardrobe. Newly linked or forked memberships start with no local hides. Shared wardrobe settings, images and aliases continue to reconcile across linked casts. The Character Library can still copy a globally active outfit even when it is hidden in the source membership. If hiding an outfit used as the current starting preference, select an available replacement. Global archive/removal only changes starting preferences that reference the affected outfit; if the replacement is locally hidden in a sibling cast, its starting hint is cleared (the original remains available). Showing or restoring does not reinstate an old starting hint. Global removal prunes stale visibility keys.

All lifecycle changes use the existing optimistic RPC and library write lock. Local operations check the current membership's Genesis activity; global operations check all linked memberships. Stale confirmations fail before writes. Hiding never deletes images or output folders. An already running render may finish and leave an output image, but merging a workshop into a now-hidden or archived wardrobe is rejected. Permanent removal still requires explicit confirmation and can break historical cards; see the original guidance below.

The new field is additive and defaults to visible for old records. Back up before downgrading: older versions ignore or discard local visibility. No Lumiverse core patches or permissions required.

## Alpha.17.3 validation

- Production build and strict TypeScript passed.
- `npm run test:wardrobe:lifecycle`: local and global lifecycle, historical resolution, prompt exclusion, independent preference, fork/link isolation, invalid actions, normalized visibility and replacement fallback.
- `npm run test:wardrobe:lifecycle:ui`: compiled mock-host browser tests at 1440, 390 and 320px, including local hide/show and global restoration preserving local visibility.
- `node tests/backend-contract.mjs`: actual extension RPC with mocked host, including local hide/show, stale signature rejection, global archive/restore and retained physical files.
- Registry and workshop state and browser regressions passed at all three widths; eight additional Cast contracts passed.

Live host, real Swarm generation and the complete historical suite were not run. The previously archived global flags remain global intentionally.

## Original global lifecycle behavior (Alpha.17.2)

Open Cast > member > Wardrobe, select an additional outfit, then **Manage outfit** (also available in Outfit settings). The original/default outfit cannot be archived or removed. The dialog shows the expression count and all linked casts affected by the shared operation. If any membership uses this outfit as its preferred starting outfit, choose a replacement; otherwise unrelated preferences remain unchanged.

- **Archive outfit**: retain the outfit's image mappings, aliases, reference, settings and packet key. Historical dialogue continues resolving. The archived outfit disappears from the workshop, new prompt directory, expression moves and new outfit copying. A historical card can still retain its archived artwork. Archived rows still count toward the wardrobe limit. Select a row in Archived outfits to restore it. Restoring does not reassign preferred starting outfits.
- **Remove outfit**: explicitly acknowledge the historical-card warning and confirm. Remove only this outfit's mappings, aliases and settings from the shared character record. Image files and existing output folders are not deleted; the same image referenced by another outfit or independent fork stays registered there. Older cards may lose their artwork, and reusing the deleted packet key can make those older cards resolve to different artwork. Archive is the safe option for replay. Removed outfits cannot be restored from this screen. Subsequent Vacuum operations are independent.

The server revalidates the base library signature under the existing lock, rejects invalid actions and the default outfit, and refuses changes during linked Genesis production. The client also rejects changes to the reviewed confirmation snapshot. A workshop already open elsewhere cannot merge into an archived or removed outfit. A render already in flight may finish and leave an output image, but stale workshop writes remain guarded. The original image files are not duplicated or deleted by this operation.

Storage changes are additive: an optional `archived` flag is part of the shared wardrobe row; old records without it are active. Back up Cast data before downgrading. Older extension releases will not honor the archive flag. No host core changes or permissions were required.

## Validation

- `npm run build` and `npm run typecheck` (local TypeScript 5.8.3).
- `npm run test:wardrobe:lifecycle` and `npm run test:wardrobe:lifecycle:ui` (compiled UI with mock Cast host at 1440, 390 and 320px).
- `node tests/backend-contract.mjs` exercises the actual extension RPC with a mocked Spindle host, including linked archive/restore, stale signature rejection, original outfit protection, output folder preservation and zero image deletion calls.
- Registry, wardrobe workshop and historical wardrobe state contracts.

Live Lumiverse, actual Swarm renders and the complete historical suite were not verified in this release.
