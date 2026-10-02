# Experimental Generate / Styles workspace

Branch: `experimental`. Main remains the pre-change backup.

## Source map

- Shell, controls, LoRA library and stacks: `src/studio/controller.ts` (`buildV3`). Both views keep their DOM and controller alive. Generate and Styles have separate page roots; Styles is one persistent three-column screen: collapsible Style editor, LoRA Library, and LoRA Stack. Narrow screens stack the same columns vertically.
- Styles and fixed surfaces: `src/studio/styles.ts`. Fullscreen, inspector, output library, missing-LoRA and shared workflow/dialog backdrops consume `--studio-safe-top`, derived from the host's `--app-interactive-safe-top`. Floating player/menu positions also respect it. The alias is scoped to Studio-owned surfaces, not the host root.
- Workspace geometry: local preference `swarm-studio-workspace-v2`, with lazy fallback from v1; obsolete dock height is discarded, side rails and prompts are clamped. In-flow Studio does not receive another safe-top offset.
- LoRA stacks: backend user storage `lora-stack-presets.json`; unchanged mechanical stack format.
- Live generation profile: `studio-generation-profile.json`; remains live state, separate from explicit defaults.
- Explicit defaults: `studio-defaults.json`; only stable renderer fields and checkpoint.
- Render styles: `studio-render-styles.json`; references existing stacks by ID, with optional checkpoint, recipe and prompt additions.
- Character base/look: existing output-folder visual bindings, with optional `styleId` and `generationRecipe`. Legacy records require no eager rewrite.
- Stable sanitizers and resolution: `src/state/recipes.ts`, compiled into both frontend and backend.
- Native Image Gen adapter: `src/host/image-gen.ts`.

## Resolution and ownership

Stable renderer fields resolve in this order: provider defaults, explicit Studio defaults, live settings, selected Style, character base, active look, explicit job settings. Undefined fields inherit; CFG zero is preserved. Prompt, seed, init images, outputs and arbitrary workflow overrides are never stored in a recipe or explicit default.

Studio starts with provider defaults plus explicit Studio defaults, then restores any existing in-memory draft. Saving defaults does not silently change live controls. Restore applies stable fields; reset clears the explicit defaults. Raw workflow overrides remain explicit per-job overrides. Tagged generation retains its existing aspect handling; an explicit tag aspect wins over a recipe.

Style/character stacks layer onto the existing live stack mechanism; live stack entries retain the extension's existing precedence when the same LoRA occurs twice. Missing Style/stack references leave the other settings available; the Style editor labels a missing stack. Existing missing-LoRA handling remains available.

The native host schema was checked in `C:\Lumiverse\src\services\image-gen.service.ts` and `src/routes/image-gen.routes.ts`. It has `main`, `character`, `persona` and `captioning` prompt preset kinds. The existing public import endpoint already performs ID-based upserts and preserves unrelated presets and local parser settings, so this branch requires **no Lumiverse source changes**.

Native saves send only compatible custom prompt preset fields through `/api/v1/image-gen/import`. They omit renderer settings, Swarm internals and connection configuration. Stable `lumiswarm-studio:` IDs prevent repeated saves from creating duplicates. Main saves do not activate the preset. Explicit character mirroring also uses the public character binding endpoint. Studio remains authoritative; native mirrors are snapshots refreshed only by the explicit mirror action. Editing native prompts does not write back into Studio. If binding fails after import, the UI reports partial success and retry reuses the same ID.

## Verification

Use Node 24 or newer, `npm ci`, then:

```text
npm run build
npm run typecheck
npm test
```

Typecheck assembles the same compilation units as the build. The tests cover legacy behavior, default/style persistence, sanitization, every recipe precedence layer, public native upsert/binding failures, and actual mounted DOM navigation and defaults. Native adapter tests use mocks; they do not modify a running host.

## Workspace repair

The Styles page no longer mounts the old bottom dock. The Style editor is compact, with a New action and collapsible Render Recipe summary. The Library occupies the largest column. Generate has its own persistent working-stack list, with History vertically collapsed below it by default. Both stack lists share the same state, with weight/enable/trigger controls, drag reorder and arrow controls.

Studio defaults are collapsed beside generation controls. Active character/look saves have their own contextual group, and native Image Gen prompt export is grouped separately. No global save-action strip is rendered on Styles.

The Library folder sidebar opens by default on desktop; the folder icon retracts/reopens it. The current folder and open state persist, nested folders include their descendants, and the sidebar scrolls independently. The folder picker overlays the library without resizing the card grid; on narrow screens it closes after selection.

Library pages contain at most 60 cards. Unchanged cards and image elements are retained during stack edits and view changes; hidden-library updates are deferred until the page is shown. Search is debounced. One preview observer is retained, and responses from a previous connection are ignored. Changing search/folder resets pagination; changing pages bounds the card cache to that page.

Regression checks now include 1,200 mock LoRAs, repeated workspace/sidebar round trips, mirrored stack edits and reordered row identity, history/image identity, folder selection and paging, computed CSS visibility, unsaved Style edits and stale preview responses. Generate preview dimensions now come from CSS containment and object-fit; the output-stage ResizeObserver feedback loop and grid-column transition are removed. Live-frame tests assert that preview geometry is not rewritten. These are automated DOM/CSS checks, not a live host visual acceptance test.

## User visual acceptance

Visual testing and live Swarm/Lumiverse integration are intentionally left to the user because this repository is not connected to production. No live generation or host E2E diagnostics were run.

1. Test Generate → Styles → Generate with unsaved prompts, selected output/history, render controls, init image and a stack. Edit the working stack in both views and check narrow-layout navigation.
2. Check normal and narrow desktop layouts, the collapsed Style editor and History, and safe-top values of zero and a nonzero titlebar height. Open fullscreen, inspector, output library and dialogs; drag the floating player near the top edge.
3. Save a raw stack; create, rename, duplicate, apply and delete a Style that references it. Test deleted stack/model references. Check prompts are not repeatedly appended.
4. Save defaults, close/reopen Studio, restore and reset them. Confirm temporary prompts, seed and init image were not captured as defaults.
5. Bind a Style through character visuals, override a single recipe field on a look, and compare Studio and tagged generation. Clear the override to inherit again.
6. Save native main prompts twice and verify a single preset updates. Explicitly mirror character prompts and verify the binding, unrelated presets and active main selection. Test host-unavailable and failed-save feedback.

Do not merge into main until these visual and live integration checks are accepted.

## Thumbnail hydration diagnostic

Folder overlays now composite theme layers over an opaque backing, including transparent themes. Preview-backed cards keep the same placeholder as cards without previews. Thumbnail sources are preloaded and decoded before an instantaneous reveal; failed decodes retain the placeholder. Superseded requests, connection changes, removed cards and disposal cannot reveal a late bitmap. Preview responses patch images without invoking the library renderer.

Run `npx playwright install chromium` once, then `npm run test:browser` after building. This standalone Chromium diagnostic hydrates 60 mock LoRAs with delayed responses, holds decoded images behind a test barrier, and verifies placeholder visibility, opaque folder backing, zero library renders, zero card disconnections, retained identity and unchanged card geometry. It uses no live host or SwarmUI connection. The DOM suite separately covers failed and stale decode races.

## Mobile workspace

At 720px and below, the sole workspace navigation is the non-wrapping Create / Tune / Style / LoRAs / Stack / History strip. The provider header and navigation remain outside the scrolling content, within the existing safe-top boundary. A single breakpoint listener selects explicit persistent panes; switching tabs never rebuilds cards, prompts, rows or the Style draft. History excludes the desktop working-stack presentation. The original init-image controls move between their existing desktop Tune slot and mobile Create slot only on breakpoint changes, retaining their state and listeners.

Mobile Style uses Apply / Save / an overflow disclosure for Duplicate, Delete and Clear. Repeated headings and nested panel borders are removed; the library retains its thumbnail layout, with a minimum card width controlling one versus two columns. Desktop keeps its two workspaces and three-column composition.

`npm run test:browser` also checks six-pane isolation at 360/430/720px, initial mobile restoration, draft/node persistence, overflow actions, no horizontal page overflow, pinned navigation, safe-top and desktop restoration. Set `STUDIO_SCREENSHOT_DIR` to save mocked 430px views for review. Live host acceptance remains separate.

## Safe areas, widget refresh and request formatting

The mobile Save preset modal follows VisualViewport resize/scroll events and safe insets. Its header and footer remain outside the scrolling field list, including while the keyboard reduces the visible height. Chromium geometry checks simulate portrait, landscape, bottom safe area and keyboard panning; physical iPhone/Safari validation is still required.

Native Lumi widgets now restore the last position through `initialPosition`, save `onDragEnd` coordinates, and flush their position on pagehide, backgrounding and teardown. Host placement retains responsibility for viewport clamping. The compatibility overlay retains its existing position storage.

Injected protocols identify bracketed image-history summaries as application-generated context and prohibit emitting them for new illustrations. New images require complete tags in the configured request mode. This guidance applies to defaults, parser requests and existing saved custom protocols.
