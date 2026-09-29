# Experimental Generate / Styles workspace

Branch: `experimental/studio-styles-defaults`. Main remains the pre-change backup.

## Source map

- Shell, controls, LoRA library and stacks: `src/studio/controller.ts` (`buildV3`). Both views keep their DOM and controller alive.
- Styles and fixed surfaces: `src/studio/styles.ts`. Fullscreen, inspector, output library, missing-LoRA and shared workflow/dialog backdrops consume `--studio-safe-top`, derived from the host's `--app-interactive-safe-top`. Floating player/menu positions also respect it.
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

## User visual acceptance

Visual testing and live Swarm/Lumiverse integration are intentionally left to the user because this repository is not connected to production. No live generation or host E2E diagnostics were run.

1. Test Generate → Styles → Generate with unsaved prompts, selected output/history, render controls, init image and a stack. Check both Manage and the narrow-layout navigation.
2. Check normal and narrow desktop layouts, collapsed rails, and safe-top values of zero and a nonzero titlebar height. Open fullscreen, inspector, output library and dialogs; drag the floating player near the top edge.
3. Save a raw stack; create, rename, duplicate, apply and delete a Style that references it. Test deleted stack/model references. Check prompts are not repeatedly appended.
4. Save defaults, close/reopen Studio, restore and reset them. Confirm temporary prompts, seed and init image were not captured as defaults.
5. Bind a Style through character visuals, override a single recipe field on a look, and compare Studio and tagged generation. Clear the override to inherit again.
6. Save native main prompts twice and verify a single preset updates. Explicitly mirror character prompts and verify the binding, unrelated presets and active main selection. Test host-unavailable and failed-save feedback.

Do not merge into main until these visual and live integration checks are accepted.
