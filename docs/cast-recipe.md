# Cast Recipe (1.1.0-alpha.8.6)

An optional album-level rendering recipe for permanent Cast expressions. No new generation engine or new expression workshop is involved.

## Set up a house style

1. Configure your preferred Swarm connection, checkpoint, sampling settings and LoRA stack in Studio.
2. Open the Cast album and select **Recipe**. Select **Capture current Studio settings** or copy a saved Studio stack. Capturing does not import the current illustration's authored prompt, scene, seed, reference, or character/persona binding. It copies the selected named style's prompt append and the configured stack; review the LoRA list and disable character-specific adapters you do not want on all members.
3. Adjust dimensions and framing for expressions (for example 640 × 960 and cowboy shot rather than a landscape CG). Enter shared negative exclusions if desired. LoRA weights and trigger toggles are editable. Model availability and potential compatibility warnings depend on the loaded metadata for the recipe's connection.
4. Add **Album appearance guidance** and **Extra model instructions**. Both inform the Genesis character-design sidecar, not the RP authoring protocol or the diffusion prompt directly. Example: “Adult post-canon characters in casual clothing. Select one coherent outfit per member. Use recognizable canonical appearance tags and describe stable visual identity and a short character-specific expressive temperament, not a fixed pose, emotion, scenery, or dialogue.” The sidecar still returns the existing `{name, identityPrompt}` structure. Existing saved identities bypass the sidecar. **Add example instructions** appends optional outfit and temperament guidance to the existing Extra model instructions without replacing it; the example is not saved until Save recipe. For example, use `mild expressions, calm body language` for a reserved character or `bubbly expressions, expressive posing` for an energetic character. Do not copy a particular facial expression or pose from the current scene.
5. Set enhancement and background removal preferences. Genesis can use built-in BiRefNet or a saved background-removal workflow with a named image input selected from the workflow metadata. Save the recipe. Turning off the recipe and saving restores the prior inheritance path; it does not delete existing art.

## Recipe controls

- Choose 1:1, 3:4, 2:3, 9:16, 4:3 or 16:9. Width and height sliders use 64 px increments; linked resizing preserves the selected aspect ratio approximately, with 8 px rounding and 64–4096 px bounds. Unlink for independent exact values. Use inherited size clears both stored dimensions. The displayed inherited size is a preview based on available Studio defaults or the expression fallback; provider defaults can still vary.
- Sampler and scheduler use the active connection's advertised choices. A saved selection remains available even if the current list does not contain it. Inherit removes the explicit override. The saved connection is shown by its display name, not its identifier.
- Select a saved background workflow and its exposed image input by name. Inputs are loaded for the recipe connection; the selector keeps the actual input identifier internally. Existing unverified inputs are preserved if discovery fails; a new workflow requires an advertised input before saving. Reload inputs retries discovery.

## Inheritance and lifecycle

- Genesis copies the optional album recipe when a new job is queued. Later changes to the saved stack, album recipe or current CG do not alter that copy. Blank recipe parameters can still inherit provider/Studio defaults; configured enhancement is resolved when the design is prepared. Legacy member bindings and explicit visual Lore can contribute character-specific settings. Genesis defaults to prompt-only, with an explicit optional Anima Ref anchor setting in Genesis for compatible models.
- Manual Expression Studio opens from the album recipe, with editable generation controls and optional supported reference adapters. Existing member identity and slot directions remain in use. The album stack is combined with member/look bindings. Editing a run does not change the album recipe.
- Normal / Do not save remains a Genesis preference, separate from the album's recipe. Final Lumiverse expressions and Cast membership are retained in either mode. Custom provider workflows may write Swarm-side intermediates.
- Existing members and queued jobs are not regenerated or reconfigured automatically. If you want to try the new recipe on an existing member, regenerate selected expressions in the manual workshop. If you deliberately remove a Genesis member, a fresh completed creation request can create them again once the former job is terminal. Replaying the original request cannot do so.

## Safe Cast writes

The frontend keeps the authoritative saved-library signature separate from its UI-projected dirty-state signature. Members may be stored in an interleaved order while the UI groups them by album; this is not a concurrent edit. Genuine stale bulk writes still fail rather than replacing other assets. Reload waits for pending saves and discards the local draft after confirmation.

Member removal uses a dedicated, scoped backend mutation under the Cast library lock. It does not rewrite other members, remove generated files, delete virtual folders, or touch already deployed assets. Active Genesis work must still verify its original member before registering new expressions. If that member is removed, it cannot silently recreate or register into another member; an in-flight provider output may remain in the Output Library. Stop active production before deliberately deleting a member if you want to avoid further provider work.

## Validation

- `npm run build`, strict `npm run typecheck`, 35 runnable contract suites. Six suites require jsdom, unavailable in the test environment.
- `node tests/backend-contract.mjs`: captured recipe, explicit scope, saved style and weight inheritance, separate sidecar instructions, immutable queued snapshot across retry, scoped deletion and fresh-request versus replay behavior.
- `python tests/cast-recipe-browser.py`: real compiled workspace with strict mocked storage at 1440, 390 and 320 px. Includes interleaved groups, genuine stale-write rejection, reload, deletion concurrent with another member's registration, recipe capture/edit/save and manual workshop handoff.
- Existing Genesis hydration, background jobs and Cast album management browser regressions passed. Actual diffusion aesthetics, host adapter compatibility, and the live installation's original stale-save symptom remain to be verified.

## Native Swarm preset prefixes

In Recipe and manual Expression Studio settings, use **Insert Swarm preset** to add an exact `<preset:Name>` directive to the shared positive prefix. Combine directives with typed style tags, including escaped parenthetical qualifiers and `@artist` tokens. The picker prevents duplicate insertion; remove a directive by editing the prefix. Presets are listed only when metadata for the effective connection is loaded; you can still type directives manually. Native presets may affect other provider parameters and their contents remain managed by Swarm, not snapshotted by Cast. A manual workshop edit applies only to that run. Genesis retains the prefix text from its queued recipe.
