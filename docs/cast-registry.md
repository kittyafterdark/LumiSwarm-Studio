# Character library / Cast Registry

Alpha.17 separates reusable character artwork from individual ensemble direction while retaining the existing Cast member and packet interfaces.

## Reuse characters

Open **Cast → Character library**, or **Link from library** from a cast roster. Select the destination cast. Search by character name, source cast or outfit. Each card shows the saved outfits, expression count and casts using that identity.

- **Link**: add a membership referring to the same character. Shared identity, expression assets, wardrobe definitions, references and saved workshop overrides reconcile across memberships. Select several cards and choose **Link selected** to add them as a batch.
- **Fork**: create a new independent character with the existing settings and artwork references as a starting point. Future edits do not propagate. No physical image is duplicated. The new packet prefix is allocated without overlapping existing member prefixes.
- **Link [existing member]**: if the destination already has a compatible member, link into that membership without changing its ID, packet prefix, presentation, crop or stage side. Compatibility is strict: all its old image keys, wardrobe keys and mapped expression/alias/fallback artwork must remain available with the same IDs. A link adopts the selected source's shared identity and settings. It never silently matches characters by name.
- **Copy outfit**: for incompatible independently created characters, choose the source outfit, destination member and a unique name. The destination gets a new wardrobe with the source's artwork references, logical expression names, aliases, settings and reference. All existing destination packet and physical expression keys remain untouched. Later changes are independent unless the destination has its own shared links.

Example: if the broad ensemble owns Recovery and the existing duo has its own Everyday collection, select the duo as destination. Use **Copy outfit → Recovery → existing duo member** if the two expression packs differ. If the duo member is compatible, **Link [existing member]** instead makes all future wardrobe additions shared. A normal **Link** creates a separate membership, not an implicit replacement.

## What is shared?

Character name, identity prompt, linked folder/source character reference, default reference, expression assets and default mappings, wardrobe collection, per-wardrobe reference and saved expression workshop settings. All linked members reuse the same saved image IDs.

What stays local: membership ID, packet prefix, role, presentation, side, crop, existing chat/card overrides and the optional preferred starting outfit. A Cast Recipe remains an album-level fallback; it is not automatically replaced when a member is linked. Saved wardrobe-level workshop overrides are shared.

In Cast → Expressions, select a populated wardrobe and use **Use as starting outfit** to set a per-membership prompt hint. It does not rewrite old packets, force a wardrobe change during an established scene, or override the most recently established outfit in the supplied chat history. Toggle it again to clear it. Chat-specific styling and explicit wardrobe packets work as before.

## Uncast characters

Removing a member removes its membership. If another linked membership remains, its identity remains there. When the last membership disappears (including deleting an entire cast), the character becomes **Uncast · kept in library**. Link it to a cast to work on it again. This release does not provide permanent deletion from the character library or a standalone uncast Expression Studio.

## Compatibility and persistence

Existing version-2 albums open without migration prompts. Member IDs are still the identifiers used by chat preferences, Genesis and expression jobs; no existing member is automatically linked to another. Shared identities use an optional registry key and materialized membership projections in the same user-owned Cast JSON. Writes reconcile shared data under the existing library lock and reject stale or incompatible edits. The uncast stash is in the same JSON, so the existing Studio/Vacuum reference inventory includes it. Managed folder references may appear per membership; they are not additional image files.

Removing a membership or changing a chat's active cast can still make old packets unavailable in that cast, just as before. Replacing a shared expression's artwork updates cards that resolve to that key. This is not a historical immutable artwork snapshot system. The current 200 active membership and 200 uncast record limits apply; the wardrobe and slot limits remain unchanged.

Back up extension user data before updating, as usual. Downgrading to a version that does not understand registry links or the uncast stash may discard the new metadata on subsequent saves. No Lumiverse core changes, permissions or external dependencies are required.
