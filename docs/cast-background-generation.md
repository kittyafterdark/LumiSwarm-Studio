# Cast background generation (1.1.0-alpha.4)

## User workflow

Open **Cast → select an album → Backgrounds**. The existing Add background (Library / upload), rename, replace, default, remove and export controls remain. **Generate** opens a scene name, packet key and environment-description editor. It is usable even with inline generation off. Job state and progress appear in the Backgrounds modal. Since alpha.7, the Generate preview has an independent scenery progress strip and the floating widget shows pending/completion/failure status. These indicators do not change the current illustration or its Append target. **Reuse asset** opens the generic Background Assets folder in the existing picker; name the same owned image under a local key in any other Cast.

Enable **Inline generation** separately in each Cast to permit model-authored background jobs. The Cast must also be deployed/injected for the chat. The opt-in defaults to false for all existing and new albums. Disable it to stop accepting new automatic requests; a queued request is checked again before rendering. An already running render is allowed to finish. Existing dialogue and saved images remain usable while the switch is off.

## Inline protocol

Example of a completed assistant reply, for an album with ID `crew` and an existing expression `shoto-neutral`:

```text
They enter the library as the last of the daylight fades.
<swarm-background=crew:library-dusk>Empty school library, wooden shelves, large west-facing windows, amber dusk lighting, wide establishing shot.</swarm-background>
<swarm-cast=shoto-neutral background=library-dusk>“It's quiet in here.”</swarm-cast>
```

The injected protocol substitutes the real album ID. The background request is separate from the speaker's dialogue. At most one new-background request is accepted per completed reply, and the same reply must use its key in a fully closed packet for a real saved expression. Requests inside code examples, comments, payloads or dialogue are not jobs. No render is triggered by history loading, a user message or streaming tokens. The backend checks the persisted assistant message and exact source content, active Cast association and its current opt-in. A short retry accommodates a late message mount; a mismatched edited source fails closed.

Subsequent packets only use `background=library-dusk`. The canonical key and rename aliases are listed in the prompt. A matching saved key or alias needs no new generation. An explicit `background=none` opts out of the scene even when there is a default. The existing stage default or neutral presentation remains the fallback while a new scene is pending. Once the image is saved, the Cast library event rehydrates existing cards referencing that key. The raw source, including the request, remains in the stored reply; the render-only transform hides the request and prompt-history compaction strips it from assistant history.

## Render isolation and optional location Lore

Backgrounds are ordinary environment-only image generation jobs, not a second character illustration. They use the effective Studio checkpoint (or default Swarm connection), basic sampling controls, a random seed and a default 16:9 canvas. The specialized prompt uses scenery/no-human tags for Anima/Illustrious and an empty establishing-shot description for MOSS/Krea. This is a prompt instruction, not a guarantee the diffusion model will never depict a person.

The normal character/persona compiler path is intentionally bypassed. Studio profile prompt and negative prompt, character/Look recipes, inherited LoRAs, preset macros, reference images, raw workflow/parameter overrides and chat/character image ownership are not carried over. This protects reusable scenery from identity leakage. To use a dedicated location style or checkpoint, configure an enabled visual identity for the location in Lore; a background request may include one explicit eligible marker such as `[[lore:entry-id]]`. The backend revalidates native activation for the original chat, requires entity type Location, then applies its model-specific prompt, negative prompt, checkpoint, aspect, configured LoRA stack and reference conditioning. Character/outfit/creature/style markers and multiple location IDs are rejected. Manual requests may use a location marker only when the selected album is assigned to the active chat. Native activation by itself does not inject anything.

## Asset lifecycle and failure handling

- Job identity is user + album + normalized scene key. Existing scenes and aliases, pending keys, and durable inline source receipts prevent unnecessary repeated renders. Background jobs are serialized per account, with a 12-job queue limit. Source receipts are bounded to the most recent 1,000 accepted inline requests. Errors remain visible in the session; a manual retry is permitted. No background-job cancellation or automatic restart recovery is implemented yet.
- On completion the ordinary generation record and permanent Studio asset provenance are saved with `studio_stage=cast_background`, `studio_cast_group` and `studio_background_key`. The returned image ID must be owned/available. No duplicate image is uploaded or copied.
- The owned image is first registered in the unbound **Background Assets** Output Library folder (stable ID `cast-background-assets`), then the same ID is registered as a scene on the original Cast. Archiving first preserves the render if the original Cast was removed, the key occupied, or the Cast reached capacity during the provider request. The existing folder/Cast reference checks protect it from Vacuum. The generated scene does not automatically become the default.
- All Cast writes use an account-scoped lock. The workspace includes its confirmed snapshot signature with full saves; a stale save is rejected rather than overwriting generated or concurrently edited data. Reload the authoritative Cast when prompted. A failed provider job never creates a phantom scene. If registration fails after rendering, check the Output Library / Background Assets before retrying. Deleting a scene reference does not delete the original image or the shared folder reference.
- Cross-Cast reuse is explicit via Reuse asset (or the normal Library picker), not automatic matching by name: two unrelated albums can both have a `library` with different artwork. The existing per-Cast Export folder action still works. Folder limit 80, folder image limit 500 and Cast scene limit 100 remain enforced; no silent eviction.

## Validation and live checklist

`npm run build`, `npm run typecheck` (or set `STUDIO_TSC` to an available TypeScript compiler), `npm test` include the mocked provider/ownership/lifecycle regressions in `tests/backend-contract.mjs`. `python tests/cast-background-generation-browser.py` exercises the compiled workspace and live narrative hydration at 1440, 390 and 320px. `python tests/cast-worlds-browser.py` exercises existing non-generative management and rendering. Tests use fixture images and mock provider/storage; they do not prove live Swarm image quality or Lumiverse event delivery timing.

Live: enable inline generation for a deployed Cast, request a new empty scene, confirm one render, open Backgrounds and verify the key, inspect Background Assets and confirm the same image ID, reuse that image in another album, then repeat the original scene. Verify no inherited actor LoRA/identity or reference conditioning and no duplicate render. Try a location Lore marker, disabled inline generation and a provider rejection. In a real Swarm run, inspect resolved provider metadata and Vacuum reference state.
