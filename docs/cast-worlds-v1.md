# Cast Worlds / Curated Atelier (1.0.50)

## Usage

Open a Cast group, select **Backgrounds**, then **Add background**. Pick or upload an image through the existing image picker. Give the scene a name/key. All members of this group can share it; no expression-specific copies are required. Select Default to use it for scene presentations without an explicit scene key. Rename retains the old key as an alias. Replace changes the image under that key. Remove deletes the reference, not the underlying image. Export folder creates or extends a separate unbound Output Library folder, keeping original images and prior exports.

```html
<swarm-cast=shoto-joy background=sidewalk><font color="#72B9FF">"Let's go."</font></swarm-cast>
```

Only scene-backed presentations use backgrounds. Omitted or unknown keys resolve to the group's default if present; `background=none` opts out. With no resolved background, a neutral scene surface is displayed. The existing Cast syntax is unchanged. The selected chat's group determines lookup, not the globally last-opened workspace. Renaming preserves old packets by alias; replacing a saved asset deliberately changes all renders using that key. Source messages and swipes are never rewritten. The group prompt advertises available saved keys. Arbitrary URLs and generative prompts are not supported as background values in this phase.

## Source and migration

`docs/cast-layout-sources/{curated-cards,portrait-overlap}.html` preserve the supplied independent prototypes. `scripts/cast-curated.py` extracts trusted template fragments and scoped CSS; `scripts/cast-curated.css` adapts them for live flow, speaker tint, sizes, and the host. Run `python scripts/build-cast-presets.py` before `npm run build` to regenerate the catalog. The prototypes' sample imagery and lab controls do not ship inside the runtime CSS. Their static references are retained for reproducibility.

The 20 imported designs include two graphic panels and eight scene-backed layouts; VN Hero, Corner Pop-Out and Angled Cutout retain their existing IDs. VN Standee is retired and its stored selection resolves to Obsidian Lower-Third. There are 50 named presentations and two legacy gallery choices. Ten new overlap layouts are scene-free. Their quotes are in normal flow so long dialogue expands instead of clipping.

Scene records live on each group in `cast-library.json`, beside existing member/expression references. The existing Vacuum reference snapshot scans this file, so saved background image IDs participate in its Cast protection without introducing an untracked second store. New image references are ownership-validated on the backend. The normal Output Library folder export is a non-destructive reference copy. No Vacuum cleanup policy was changed.

## Verification and limits

Production build, strict TypeScript, full `npm test` (including the backend ownership/export and new scene contract) passed. Eight targeted Chromium suites passed: stage geometry (450 cases), Cast Worlds UI/island, remount, live stage parity, mobile modal, album management, retained materials (144 cases), retained material tint (48 cases). Expression ZIP and metadata registry contracts passed. The metadata provider contract requires an external Lumiverse core checkout and could not run here. Browser tests use a mock host; actual Lumiverse/Swarm livetesting is still required. No background generation, per-chat scene override, scene prompt recipes or portable pack folder serialization added in this phase. Background export uses the existing host image library, not a physical filesystem directory. No remote generation or cleanup occurred during testing.

## Stage blocking and background save reliability (1.0.51)

Explicit left/right selection moves the actor and asymmetric scene captions, while Auto keeps each natural arrangement. The VN Hero portrait bay is wider and scene actors are anchored independently of dialogue length. The gallery uses the same runtime CSS, with album-cover photo styles isolated to album covers.

The background manager keeps a dedicated default scene row and a scrollable modal body on phones. Scene changes are locked during the save, verified through the backend acknowledgement, and rolled back on rejection. If a response fails after the write, an authoritative read verifies the exact attempted library before reopening the manager. The ownership check uses the same owned metadata scope as the image picker, including an owned-list fallback when the individual metadata lookup is absent. No ownership bypass or destructive image operations are introduced.

Regression: `python tests/cast-curated-blocking-browser.py`, `python tests/cast-worlds-browser.py`, `python tests/cast-stage-geometry-browser.py`, `npm test`.
