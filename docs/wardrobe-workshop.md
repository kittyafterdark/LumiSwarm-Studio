# Wardrobe Workshop & Cue Cleanup (Alpha.16)

Open a Cast member in Expression Studio. The appearance-set selector above the expression gallery selects the workshop, not the current story outfit. Choose **+ New set**, enter the name and outfit prompt, and select a starting point:

- **Fresh sheet:** inherit the expression definitions (including custom directions, excluding numbered alts) and Cast rendering recipe, without artwork.
- **Copy workshop settings:** start empty with the source wardrobe's saved rendering settings and expression definitions.
- **Duplicate sheet:** copy settings and existing artwork references into a new wardrobe with independent physical slot keys. Image files are shared until you generate or attach replacements.

Reference inheritance is an explicit checkbox, off by default. Select an outfit-appropriate reference before rendering with image conditioning. The Generation Settings override is persisted with the selected wardrobe, including checkpoint, identity/outfit overrides, LoRA stack and reference method. Generating, enhancing and removing backgrounds remains scoped to this sheet. Switching saves first, and is unavailable while a job is running. A failed save prevents switching; reopen if the underlying wardrobe changed elsewhere.

## Alternate expressions

Use **+ Alt** on a populated expression to create an independent empty named slot, e.g. `joy-alt-1`. Edit its direction, render or attach an image, then enhance/cut out as usual. The original slot is unchanged. The new slot is also available through the existing Cast expression picker and explicit wardrobe-aware packets. No automatic random selection or variant promotion is introduced. Alternates use the existing custom slot budget. Redo still replaces the selected slot's image; historical packets referencing that slot can show the replacement.

Use the normal wardrobe-aware Cast packet or existing story controls to choose the desired outfit. Opening an outfit for editing does not change historical packet wardrobe keys. New sheets use the existing 12-wardrobe limit; custom expressions/alternates share the existing slot limit.

## Stage FX cleanup

Use the standalone syntax from [Stage FX](theater-fx.md), with blank lines before and after the cue. The host message-content processor replaces valid standalone assistant cues with invisible data markers for display. Theater reads those markers in sequence. The outgoing prompt interceptor removes valid standalone cues from assistant history. Code blocks, HTML islands, packet bodies and incomplete/malformed directives are not treated as cues by this cleanup. Canonical stored messages remain intact so raw exports and future replay retain the original direction. No user regex is required; a regex deleting the raw cue or the hidden marker can defeat this behavior. Host permissions and hook availability apply. This is not a new persistent message metadata store or a Lumiverse core patch.
