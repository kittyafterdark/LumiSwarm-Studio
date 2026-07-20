# Swarm Studio for Lumiverse

Swarm Studio is a Spindle extension that puts a full SwarmUI prompting workspace inside Lumiverse without replacing Lumiverse's existing inline image controls.

It adds:

- A desktop workspace with collapsible and draggable generation, history, prompt, LoRA-library, LoRA-stack, and bottom-dock boundaries, plus an optional fullscreen mode
- A phone-first fullscreen interface with combined Create + Prompt, Tune, LoRAs, Stack, and History tabs
- Positive and negative prompting, checkpoint selection, linked aspect-ratio sizing, steps, CFG, seed, live sampler/scheduler lists, Swarm presets, model-component overrides, and raw request JSON
- A searchable LoRA library read directly from SwarmUI's official `ListModels` API and filtered against the selected checkpoint's `compat_class`
- LoRA preview images and inherited metadata: title, author, description, tags, architecture/compatibility, usage hints, trigger phrase, and default weight
- Ordered LoRA stacking with per-item enable/disable, weights, opt-in trigger phrases, reorder controls, and reusable saved stack presets
- A prompt-header generation action on desktop and a persistent mobile generation action
- An aspect-aware output stage that follows the requested dimensions and then the actual returned image
- A click-to-zoom full-size output inspector with resolved positive/negative prompts, preset and timing pills, render settings, LoRA stack, **Reuse Parameters**, and **Use as init image**
- SwarmUI img2img through Lumiverse's provider, with local image selection, current-output selection, and a Creativity/denoise control
- A paged, chat-scoped two-column history plus a fullscreen Lumiverse output library with reusable virtual folders
- Lumiverse output deletion and a capability-aware action that asks SwarmUI to reveal the original file in its host output folder
- Live SwarmUI/ComfyUI progress frames when Lumiverse includes the Spindle streaming bridge described below

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

4. Make sure Lumiverse already has a working **SwarmUI** image generation connection.
5. Open **Swarm Studio** from its drawer tab or the chat input's Extras menu.

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

The inspector records both the submitted prompts and, when SwarmUI exposes
them, the final prompts after a selected Swarm preset is applied. **Reuse
Parameters** restores the submitted prompt, preset, checkpoint, render
settings, and LoRA stack so the preset is not accidentally applied twice.

Swarm Studio reads sampler and scheduler choices from SwarmUI's
`ListT2IParams` response and user presets from `GetMyUserData`. If those
metadata calls are unavailable, the controls fall back to common values and
generation remains available.

For newly generated images, Swarm Studio looks up SwarmUI's saved image
metadata to display preparation time, generation time, preset names, resolved
prompts, and the original Swarm path. When those fields are unavailable, it
shows an end-to-end time measured around Lumiverse's generation call.

On mobile, saved LoRA stacks can also be loaded directly from the combined
Create tab above the positive and negative prompts.

Preview images are fetched lazily from the configured SwarmUI origin. Cross-origin preview URLs are refused.

## Init images

Choose a local image from the Generation tab or use any current/history output
from its inspector. Images are resized in the browser to a maximum dimension of
1536 pixels and sent through Lumiverse as a SwarmUI reference image. The
**Creativity** control maps to SwarmUI's img2img denoise value. The encoded init
image itself is deliberately excluded from stored generation metadata.

## Output library and folders

History is scoped to the active chat and paged in groups of 12. The output
library, opened with the grid button in History or from the inspector, can show
up to 200 recent extension-owned Lumiverse images across chats.

Folders are lightweight per-user collections stored by the extension; moving
an output into one does not move or duplicate Lumiverse's underlying image
asset. Deleting a folder leaves its images intact. **Delete from Lumiverse**
deletes the actual owned image and removes its Swarm Studio metadata and folder
assignment.

**Open Swarm folder** is available only for newly tracked outputs with a Swarm
path. It calls SwarmUI's `OpenImageFolder` endpoint and therefore also depends
on SwarmUI granting that endpoint and running somewhere with access to a file
explorer. It cannot open the Swarm host's filesystem directly from Lumiverse.

## Live generation previews

Lumiverse's built-in image sidebar already uses the provider's
`generateStream()` implementation. Stock Lumiverse currently calls the
non-streaming `provider.generate()` method for Spindle extensions, so this
package includes `patches/lumiverse-spindle-live-preview.patch`. The patch
changes that Spindle handler to:

- Prefer the same `generateStream()` implementation used by the sidebar.
- Correlate progress with the extension's `clientJobId`.
- Emit the existing `IMAGE_GEN_PROGRESS`, `IMAGE_GEN_COMPLETE`, and
  `IMAGE_GEN_ERROR` WebSocket events.
- Preserve the normal Lumiverse connection secret and image-persistence path.

Swarm Studio automatically subscribes to those job-scoped events. Without the
core patch it remains fully functional and falls back to its generating state
followed by the final image.

From the root of a Lumiverse source checkout, apply the bridge with:

```sh
git apply /path/to/swarm-studio/patches/lumiverse-spindle-live-preview.patch
```

Then rebuild/restart Lumiverse normally. The patch is intentionally limited to
the existing Spindle image-generation handler and its developer documentation.

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

The repository metadata in `spindle.json` points to
`kittyafterdark/LumiSwarm-Studio`.
