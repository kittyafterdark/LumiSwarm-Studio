# Swarm Studio for Lumiverse

Swarm Studio is a Spindle extension that puts a full SwarmUI prompting workspace inside Lumiverse without replacing Lumiverse's existing inline image controls.

It adds:

- A desktop workspace with collapsible and draggable generation, history, prompt, LoRA-library, LoRA-stack, and bottom-dock boundaries, plus an optional fullscreen mode
- A phone-first fullscreen interface with combined Create + Prompt, Tune, LoRAs, Stack, and History tabs
- One-tap mobile **Use as init**, context-aware **Random/Current seed**, and **Append to chat** actions below the Create prompts, with **Library** beside Settings in the header
- A Lumiverse-native profile plus an automatic Custom state for component colors, panel geometry, opacity, blur, and CSS overrides
- A full appearance editor with native component color pickers, border-radius, surface-opacity and backdrop-blur sliders, plus persisted custom CSS
- A compact opaque settings panel containing appearance controls, metadata refresh, and the encrypted metadata token
- Positive and negative prompting, checkpoint selection, chain-linked aspect-ratio sizing, steps, CFG, seed, live sampler/scheduler lists, ordered Swarm preset stacking, model-component overrides, and raw request JSON
- Saved SwarmUI/ComfyUI workflows presented through a focused setup modal: choose a workflow, edit the grouped parameters its author exposed, upload workflow image inputs, and generate without touching the node graph
- Context-aware orientation and seed actions that flip to the useful next state, with fixed-seed reuse from the selected output
- A multi-keyword searchable LoRA library read directly from SwarmUI's official `ListModels` API and filtered against the selected checkpoint's `compat_class`
- LoRA preview images and inherited metadata: title, author, description, tags, architecture/compatibility, usage hints, trigger phrase, and default weight
- Ordered visual LoRA stacking with square metadata previews, per-item enable/disable, weights, opt-in trigger phrases, reorder controls, reusable saved stack presets, and extraction from enabled Swarm presets
- Shareable Studio stack JSON, Lumiverse Image Gen LoRA-preset import/export, and a missing-file handoff with Civitai source links for SwarmUI's Model Downloader
- A prompt-header generation action on desktop and a persistent mobile generation action
- An aspect-aware output stage that follows the requested dimensions and then the actual returned image
- A click-to-zoom full-size output inspector with exact submitted positive/negative prompts, used preset provenance, timing pills, render settings, LoRA stack, Swarm's saved path, **Reuse Parameters**, **Use as init image**, and **Append to chat**
- Original SwarmUI output downloads (preserving embedded image metadata when Swarm exposes the saved path) and a live `{{last_genned}}` macro for HTML artifacts and presets
- Auto-fit full-screen inspection with non-overlapping actions and manual zoom controls
- SwarmUI img2img through Lumiverse's provider, with local image selection, current-output selection, and a Creativity/denoise control
- A paged, chat-scoped two-column history with compact square mobile previews and per-image Reuse / Use as init / Append to chat / Delete menus
- A fullscreen searchable Lumiverse output library with reusable virtual folders, 30 images per desktop page, 15 per mobile page, and bulk folder/delete actions
- A full-height, negative-space drawer composition with the picture-frame emblem, disjointed corner ornaments, serif wordmark, and direct **Open Studio** / **Open Library** actions
- Lumiverse output deletion from the inspector, history menu, or bulk library selection
- Live SwarmUI/ComfyUI progress frames and a step-aware progress bar through `spindle.imageGen.generateStream()` when available, plus a persistent **Interrupt generation** action
- A draggable Lumiverse float player with collapsed, compact, and maximized **Quick create** layouts; it survives closing Studio, generates from editable lightweight prompts, follows live previews and step progress, can append the latest output to chat, and can interrupt directly
- Shared float-player/Studio output and draft state, so Quick create inherits the last model, dimensions, sampler, scheduler, presets, LoRAs, workflow, init image, and overrides—and the full Studio restores them when it reopens
- The drawer’s picture-frame wall emblem reused consistently in the float player, Studio header, drawer registration, and chat input action

Generation itself goes through `spindle.imageGen.generate()`. That means it continues to use the SwarmUI connection, encrypted secret, persistence, and ownership behavior already managed by Lumiverse.

## Install

1. Build the extension if you are installing from source (Node.js 23.6+):

   ```sh
   npm run build
   ```

2. In Lumiverse, open **Extensions / Spindle**, install the extension folder or packaged archive, and enable it.
3. Grant these permissions:

   - `image_gen` — connections, checkpoints, and generation
   - `cors_proxy` — direct SwarmUI LoRA metadata and preview requests, including local/private-network servers
   - `images` — the extension-owned output gallery
   - `chats` — tags outputs to the active chat and character
   - `chat_mutation` — explicitly appends a selected output to the active chat
   - `ui_panels` — the persistent generation miniplayer

4. Make sure Lumiverse already has a working **SwarmUI** image generation connection.
5. Open **Swarm Studio** from its drawer tab or the chat input's Extras menu.

If the Lumiverse connection leaves its API URL blank, Swarm Studio uses
Lumiverse's SwarmUI default: `http://localhost:7801`. Any explicit connection
URL still takes precedence.

## Authentication

Lumiverse correctly does not expose the saved connection secret to extensions. Swarm Studio therefore:

- Uses Lumiverse's saved secret for actual generation.
- Tries anonymous SwarmUI metadata access first.
- If SwarmUI requires authentication for model metadata, accepts a metadata-only `swarm_token` from the modal. The token is stored per user in Lumiverse's AES-256-GCM secure enclave and is only sent to the configured SwarmUI origin.

If metadata access is unavailable, generation still works and exact LoRA filenames can be added manually.

## Metadata behavior

When a LoRA is added, Swarm Studio inherits `lora_default_weight`. Metadata
trigger phrases are disabled by default and must be enabled per stack item.
Enabled trigger phrases are prepended to the submitted prompt only if the same
phrase is not already present.

The default **Compatible only** library filter compares the selected
checkpoint's SwarmUI `compat_class` with each LoRA. If exact metadata is
missing, Swarm Studio falls back to conservative family detection for Anima,
Illustrious, Pony, SDXL, SD 1.5, Flux, SD3, Chroma, Qwen, and Hunyuan. LoRAs
with no identifiable family remain visible instead of being silently lost.

Saved LoRA stacks and recent generation details are kept in Lumiverse's scoped
per-user extension storage. Generation details are associated with the
persisted Lumiverse image ID so History can show the prompts used by recent
Swarm Studio outputs.

The stack toolbar can export a portable Studio JSON file or a valid Lumiverse
Image Gen config containing one active LoRA preset. **Import stack** accepts
either format, including configs exported by Lumiverse. If the current Swarm
library lacks a referenced filename, Studio keeps it in the stack and shows
the metadata source link when available so it can be pasted into SwarmUI's
Model Downloader. The extension does not silently trigger Swarm's WebSocket
downloader.

The inspector treats the exact prompt text sent by Studio as the authoritative
prompt record and lists the ordered Swarm presets separately as provenance.
This avoids claiming that a local reconstruction is SwarmUI's final
server-resolved prompt. Choose presets from the dropdown to add them to a
checklist, then enable, disable, or reorder them. **Reuse Parameters** restores
the submitted prompt, ordered presets, checkpoint, render settings, LoRA
stack, and the actual resolved seed reported by SwarmUI so the next render is
reproducible and presets are not accidentally applied twice.

Swarm Studio reads sampler and scheduler choices from SwarmUI's
`ListT2IParams` response and user presets from `GetMyUserData`. If those
metadata calls are unavailable, the controls fall back to common values and
generation remains available.

When `ListT2IParams` exposes a usable schema and the SwarmUI account has
`manage_presets`, **Save current** appears beside the preset selector. It saves
the current prompts and recognized render controls through SwarmUI's
`AddNewPreset` API, then selects the new preset in Studio.

Enabled Swarm presets that expose LoRA filename and weight parameters also
enable **Extract LoRAs**, which merges those references into Studio's visual
stack.

For newly generated images, Swarm Studio looks up SwarmUI's saved image
metadata to display preparation time, generation time, preset names, and the
original Swarm path. When those fields are unavailable, it shows an end-to-end
time measured around Lumiverse's generation call.

On mobile, saved LoRA stacks can also be loaded directly from the combined
Create tab above the positive and negative prompts.

Preview images are fetched lazily from the configured SwarmUI origin. Cross-origin preview URLs are refused.

## Saved Swarm workflows

Swarm Studio reads saved workflow summaries from SwarmUI's
`ComfyListWorkflows` endpoint and loads the selected workflow's exposed
`custom_params` schema through `ComfyReadWorkflow`. This mirrors SwarmUI's
**Use Workflow in Generate Tab** behavior: text, number, checkbox, dropdown,
model, and image parameters become normal Studio controls, grouped and labeled
by the workflow author. Parameters that Swarm already considers core generation
controls continue to use Studio's existing prompt, model, size, step, CFG,
sampler, scheduler, seed, LoRA, preset, and init-image fields.

Selecting a workflow opens its dedicated setup modal and automatically closes
back to the compact generation rail when finished. Studio selects the saved server-side graph with SwarmUI's
`comfyuicustomworkflow` generation parameter and submits only the exposed
values. It does not copy, rewrite, or persist the Comfy graph itself. Workflow
image fields are encoded only for the active request and redacted from saved
generation metadata. If workflow listing is unavailable, native Swarm image
generation remains usable and the workflow picker explains the isolated error.

## Init images

Choose a local image from the Generation tab or use any current/history output
from its inspector. Images are resized in the browser to a maximum dimension of
1536 pixels and sent through Lumiverse as a SwarmUI reference image. The
**Creativity** control maps to SwarmUI's img2img denoise value. The encoded init
image itself is deliberately excluded from stored generation metadata. Its
slider spans the full init-image panel, and long filenames are clamped to one
ellipsis-safe line so they cannot squeeze the generation controls.

## Output library and folders

History is scoped to the active chat and paged in groups of 12. The output
library, opened from the drawer, History, or inspector, can show up to 200
recent extension-owned Lumiverse images across chats, paged in groups of 30 on
desktop and 15 on mobile. Search matches every entered keyword across submitted
positive and negative prompts, model, LoRAs, presets, render parameters,
filename, and Swarm path; quoted phrases stay together. Select a page or
individual cards to move many outputs into a virtual folder or delete them
together.

Folders are lightweight per-user collections stored by the extension; moving
an output into one does not move or duplicate Lumiverse's underlying image
asset. Deleting a folder leaves its images intact. **Delete from Lumiverse**
deletes the actual owned image and removes its Swarm Studio metadata and folder
assignment. When Swarm exposes the generated file path in image metadata, the
inspector displays it below the recorded LoRA stack as a read-only saved-path
reference. **Download** then fetches that original Swarm file instead of the
Lumiverse display derivative, preserving embedded PNG metadata. Older outputs
without a saved Swarm path fall back to the normal Lumiverse image URL.

**Append to chat** verifies the selected image is owned by this extension and
then uses Lumiverse's scoped chat-mutation API to add it to the active chat as
an assistant image message. It is available from the output header, inspector,
and each History card's action menu.

## Themes and settings

The Lumiverse profile inherits the host's `--lumiverse-primary` value. Changing
any component color, border radius, panel opacity, backdrop blur, or custom CSS
automatically changes the profile indicator to **Custom**. Selecting
**Lumiverse** again resets those appearance overrides to the host-native
defaults.

Component colors use native browser color pickers. Radius, panel opacity, and
backdrop blur are adjustable with sliders and apply throughout the
modal—including the output library and inspector. Appearance preferences are
kept in browser-local storage.

The settings panel also includes a persisted custom CSS editor and a compact
guide to useful selectors and variables. CSS is inserted as stylesheet text,
not HTML; `@import` rules are removed. Prefix selectors with `.ss-shell` to
keep overrides inside the Studio, or use `.ss-launcher` to style its drawer
composition. Its dot field, broken corner ornaments, picture-frame glyph, and
sparkle are static CSS or inline SVG, with no animated or fetched assets.
Metadata refresh and the optional encrypted `swarm_token` live in this same
opaque gear panel. Its Behavior section can enable or disable completion toasts
and choose whether a desktop floating-widget tap opens Studio or Quick Create.

## Live generation previews and interruption

Swarm Studio prefers Lumiverse's `spindle.imageGen.generateStream()` API. It
consumes each provider progress chunk (`step`, `totalSteps`, and `preview`) and
uses the async generator's return value as the normal persisted result. The
Generate button becomes **Interrupt generation** while a job is active; its
AbortSignal stops the exact Spindle stream. On legacy no-stream Lumiverse
builds, SwarmUI's user-scoped `InterruptAll` route is the compatibility
fallback and may also stop another SwarmUI job running for the same user.

Older Lumiverse builds without `spindle.imageGen.generateStream()` still work
through `spindle.imageGen.generate()`. The included
`patches/lumiverse-spindle-live-preview.patch` remains available only for those
legacy builds; it emits the job-scoped events Studio already understands:

```sh
git apply /path/to/swarm-studio/patches/lumiverse-spindle-live-preview.patch
```

Then rebuild/restart Lumiverse normally. Do not apply the patch when the native
Spindle stream hook is already present.

While a generation is active, the Lumiverse float player remains visible even
if the Studio modal is closed. Its compact layout shows the latest streamed
preview, step-aware progress, and current workflow/model status. Maximize it for
**Quick create**. After Studio has been opened, Quick create inherits its full
in-memory draft—including the connection, model, size, seed, sampler, scheduler,
presets, LoRAs, workflow inputs, init image, and raw overrides—while its compact
positive and negative fields replace only the prompt text. Before a Studio draft
exists, it uses Lumiverse's default SwarmUI connection defaults. The stop control
targets the active client job; clicking the preview reopens Studio with the same
live or completed output and draft already restored. Size preferences are stored
locally, while generation state and draft data stay in memory only for the
current Lumiverse session.
On mobile, collapsed mode matches Lumiverse's native 40 × 40 float-widget cap;
the complete border-box is rendered inside that cap, its preview exposes a
visible reopen glyph, and its tap is reserved from the host drag gesture.
Interactive Quick Create controls likewise reserve pointer focus from the
widget drag surface. Desktop collapsed mode remains 56 × 56. Right-clicking the
collapsed preview also reopens Studio.

After every successful generation, `{{last_genned}}` resolves to the latest
Lumiverse-owned output URL. This is intended for image URLs in HTML artifacts,
presets, and other Lumiverse macro-aware text; it is session-live and updates
again on the next Studio or Quick Create generation.

## GitHub source installation

Keep `package.json` as valid JSON at the repository root and commit the compiled
`dist/backend.js` and `dist/frontend.js` files. Lumiverse will install the
dependency-free package and use the tracked prebuilt bundle.

If an earlier source install failed during dependency installation, stop
Lumiverse and remove its incomplete `data/extensions/swarm_studio` directory
before retrying. The failed clone may otherwise leave stale files behind.

## Development

The project intentionally has no runtime dependencies. Its build script uses
Node's built-in TypeScript type stripper, so it does not need a package install.

```sh
npm run build
```

Lumiverse checkouts that include `scripts/e2e-diagnostics` can also run the
signed-in generic Spindle diagnostics against `swarm_studio`. Provision that
tool's own `.env` intentionally, install its isolated Playwright dependencies,
and use `SPINDLE_EXTENSION_FILTER=swarm_studio`; credentials are never read or
stored by this extension.

The repository metadata in `spindle.json` points to
`kittyafterdark/LumiSwarm-Studio`.
