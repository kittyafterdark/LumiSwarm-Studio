# Swarm Studio for Lumiverse

Swarm Studio is a Spindle extension that puts a full SwarmUI prompting workspace inside Lumiverse without replacing Lumiverse's existing inline image controls.

It adds:

- A desktop workspace with collapsible and draggable generation, history, prompt, LoRA-library, LoRA-stack, and bottom-dock boundaries, plus an optional fullscreen mode; fullscreen, collapse states, mobile tab, and custom pane sizes survive closing Studio
- A phone-first fullscreen interface with combined Create + Prompt, Tune, LoRAs, Stack, and History tabs
- One-tap mobile **Use as init**, context-aware **Random/Current seed**, and **Append to chat** actions below the Create prompts, with **Library** beside Settings in the header
- A Lumiverse-native profile plus an automatic Custom state for component colors, panel geometry, opacity, blur, and CSS overrides
- A full appearance editor with native component color pickers, border-radius, surface-opacity and backdrop-blur sliders, plus persisted custom CSS
- A compact opaque settings panel containing appearance controls, metadata refresh, and the encrypted metadata token
- Positive and negative prompting, checkpoint selection, chain-linked aspect-ratio sizing, steps, CFG, seed, live sampler/scheduler lists, ordered Swarm preset stacking, in-app Swarm preset management, model-component overrides, and raw request JSON
- Saved SwarmUI/ComfyUI workflows presented through a focused setup modal: choose a workflow, edit the grouped parameters its author exposed, upload workflow image inputs, and generate without touching the node graph
- Context-aware orientation and seed actions that flip to the useful next state, with fixed-seed reuse from the selected output
- A multi-keyword searchable LoRA library read directly from SwarmUI's official `ListModels` API, filtered against the selected checkpoint's `compat_class`, and navigable through a persistent directory-tree sidebar built from Swarm's relative model paths
- LoRA preview images and inherited metadata: title, author, description, tags, architecture/compatibility, usage hints, trigger phrase, and default weight
- Ordered visual LoRA stacking with square metadata previews, per-item enable/disable, weights, opt-in trigger phrases, reorder controls, reusable saved stack presets, and one-click materialization of a Swarm preset into editable Studio controls
- Shareable Studio stack JSON, direct in-app application to Lumiverse Image Gen LoRA presets, and an in-Studio, progress-aware SwarmUI downloader for selected missing LoRAs or pasted/dropped Civitai and Hugging Face links
- A prompt-header generation action on desktop and a persistent mobile generation action
- Native Lumiverse expanded text editors for Studio and Quick Create positive/negative prompts, including the host's macro-aware editing tools
- An aspect-aware output stage that follows the requested dimensions and then the actual returned image
- A click-to-zoom full-size output inspector with exact submitted positive/negative prompts, used preset provenance, timing pills, render settings, LoRA stack, Swarm's saved path, **Reuse Parameters**, **Use as init image**, and **Append to chat**
- Original SwarmUI output downloads (preserving embedded image metadata when Swarm exposes the saved path) and a live `{{last_genned}}` macro for HTML artifacts and presets
- Opt-in `<swarm-image>` message tags with a required `request="generate"` marker, a server-persisted 0–6 required-image range per reply (`0–0` keeps model discretion), selectable **Multi-character / ensemble** and **Character-only / POV** composition guidance, and an optional `character="none"` scenery/object mode; completed tags begin generating without a chat-shifting progress strip, failures leave an aspect-aware retry placeholder, and finished outputs become permanent container-filling Lumiverse images while syncing back into Studio without taking over Studio's own Generate/Interrupt state
- Persistent per-image illustration actions: hover/focus on desktop or tap the visible touch overlay to regenerate with a fresh random seed using current/original settings, edit and immediately confirm the prompt in Quick Create, or open the output library; right-clicking the finished image opens the same menu, including inside nested or regex-rendered HTML through composed-path event delegation
- Automatic prompt-context cleanup that leaves stored chat and visible images untouched while replacing completed Studio figures, appended Lumiverse image Markdown, and embedded image data with short semantic breadcrumbs; only the six newest illustration descriptions remain in outbound history
- Character visual bindings stored inside Library folders: a checkpoint, base positive, base negative, and saved LoRA stack follow the character across every conversation, appear as a toggleable `Visuals: character` pill above the positive prompt, initialize the editable desktop/mobile model and stack controls when that character becomes active, and file that character's Studio outputs automatically only while the pill is enabled; disabled visuals leave new outputs Unfiled
- A dedicated **Chat Visuals** drawer page that keeps persona identity profiles, the active character's Library-backed checkpoint/positive/negative base, and its named or custom LoRA-stack snapshot in one compact place; Lumiverse's native Image Gen persona and character prompt presets can hydrate their matching visual identities, while live link indicators distinguish truly bound configurations from unsaved edits
- Prompt/profile macros for HTML and authored presets: `{{char_profile}}`, `{{user_profile}}`, `{{char_base}}`, `{{persona_base}}`, `{{swarm_negative}}`, `{{swarm_preset}}`, `{{swarm_checkpoint}}`, `{{swarm_aspect}}`, and `{{swarm_image_protocol}}`
- Auto-fit full-screen inspection with non-overlapping actions and manual zoom controls
- SwarmUI img2img through Lumiverse's provider, with local image selection, current-output selection, and a Creativity/denoise control
- A paged, chat-scoped two-column history with compact square mobile previews and per-image Reuse / Use as init / Append to chat / Delete menus
- A fullscreen searchable Lumiverse output library with an anchored `+ folder` control, horizontally scrolling folder strip, contextual Select/Clear page, Shift-range selection, conditional batch actions, collapsible chat-visual profiles, and a sticky current-folder/search/pagination rail; pages hold 30 images on desktop and 15 on mobile, and selection updates in place without snapping the mobile gallery back to the top
- iPhone-safe Output Library navigation with notch/browser-chrome padding, a non-shrinking 44px header close target, intrinsic-width containment for the long title row, and a redundant mobile Close action in the persistent bottom rail
- A full-height, negative-space drawer composition with the picture-frame emblem, disjointed corner ornaments, serif wordmark, and direct **Open Studio** / **Open Library** actions
- Lumiverse output deletion from the inspector, history menu, or bulk library selection
- Live SwarmUI/ComfyUI progress frames and a step-aware progress bar through `spindle.imageGen.generateStream()` when available, plus a persistent **Interrupt generation** action
- A draggable two-state Lumiverse float player: a square image orb and a full **Quick create** panel. Its single visible surface mounts above Lumiverse's zero-height mobile body without leaving a ghost host widget, keeps its box exactly synchronized with the 64px orb across responsive transitions, stays beneath Lumi drawers/modals, and hides while Studio is open; it survives closing Studio, generates from editable lightweight prompts, follows live previews and step progress, can append the latest output to chat, and turns its stable Generate action into Stop while rendering
- Shared float-player/Studio output and draft state, so Quick create inherits the last model, dimensions, sampler, scheduler, presets, LoRAs, workflow, init image, and overrides—and the full Studio restores them when it reopens
- The drawer’s picture-frame wall emblem reused consistently in the float player, Studio header, drawer registration, and chat input action

Generation goes through `spindle.imageGen.generateStream()` when the installed
Lumiverse runtime exposes it, with a clone-safe `spindle.imageGen.generate()`
fallback for older runtimes. Both paths continue to use the SwarmUI connection,
encrypted secret, persistence, and ownership behavior already managed by
Lumiverse.

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
   - `characters` — reads the active character's portable Character LoRA base tags and avatar
   - `personas` — resolves the active persona avatar and stores its selected Chat Visuals profile
   - `chat_mutation` — explicitly appends a selected output to the active chat
   - `interceptor` — optionally injects the image-tag protocol before LLM generation and cleans extension markup from prompt history
   - `ui_panels` — the persistent generation miniplayer
   - `app_manipulation` — the unclipped, draggable 64px mobile miniplayer overlay

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

If metadata access is unavailable, generation still works; restore metadata access to browse, stack, or download LoRAs through Studio.

## In-message image tags

Studio settings contains two independent, default-off controls:

- **Automatically generate completed `<swarm-image>` tags** executes image requests. When disabled, the tag becomes a lazy **Generate image** card instead of spending GPU time.
- **Teach the model the Swarm image-tag protocol** injects a short attributed system instruction. The copyable example and `{{swarm_image_protocol}}` macro remain available when this toggle is disabled, so prompt authors can place the protocol themselves.

**Prompt composition** selects one of two protocol shapes:

- **Multi-character / ensemble** isolates each visible subject's expression, position, action, and current outfit on its own line, then describes the shared interaction and composition once. It allows up to five visually necessary subjects and uses short natural-language supplements only for relationships that tags cannot express cleanly.
- **Character-only / POV** favors a single focal character. User interaction is framed as POV with only scene-required partial body parts, while explicit expression, camera direction, and current clothing changes stay in Danbooru-style tags.

The required-image range, automation switches, completion-toast preference, and prompt mode are stored by Lumiverse per user. Browser storage remains only a fast local mirror, so extension updates do not silently reset the selected count.

The tag body is passed to SwarmUI as scene prompt content. Native Swarm syntax is preserved. Preset names are user-defined and opaque: a saved preset literally named `Cinematic Portrait` is invoked as `<preset:Cinematic Portrait>`.

```html
<swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="A candid city-street photo"
>
character 1: outside a city food stall, ordering, smiling
character 2: beside the stall, holding a drink, amused
interaction: character 1 turns toward character 2; distinct hands and silhouettes
</swarm-image>
```

Attributes may instead remain on one line. Ordinary illustrations between prose default to 4:3 when the aspect is omitted; 3:4 is available for portrait framing. The protocol asks models to reserve 9:16 and 16:9 for layouts explicitly presented as phone or widescreen media. `character="active"` is the default and may be omitted. `character="none"` is an explicit scenery/object/establishing-shot mode: it skips the character visual positive and negative, removes that binding's LoRAs from the request, and adds a no-person/character negative guard while preserving unrelated Studio style LoRAs, presets, and generation controls. `persona="active"` opts the active persona's bound visual identity into the request; it defaults to `none`. `request="generate"` is deliberately required for streamed requests so a model mentioning a bare `<swarm-image>` token in visible prose cannot consume the later real request.

The current Studio connection, checkpoint, sampler, scheduler, workflow, LoRA stack, negative prompt, and enabled preset stack form the generation profile. Enabled presets are applied exactly once as native `<preset:exact saved name>` directives; tagged jobs remove the duplicate raw preset field before submission. A literal `{{swarm_preset}}` in a tag resolves to the same directive list without adding it twice. Scene-specific native preset directives are preserved alongside it. Init-image bytes and denoise are deliberately excluded from automatic tagged generations. An enabled character-folder visual binding contributes its base positive, base negative, and saved LoRA stack to both manual and tagged generation. Native Character LoRA `base_tags` remain a fallback when a binding has no positive base; the separately bound native Character LoRA is never injected.

The injected protocol identifies this as generation through the user's configured local SwarmUI, so the language model emits a request instead of claiming it lacks an image tool. It includes the exact active identity blocks that Studio will prepend and forbids substituting chat display names for visual tags. Two-subject requests use compact `character 1:`, `character 2:`, and `interaction:` lines so pose ownership remains clear without repeating the identity prompt. Anima-family checkpoints receive a condensed hybrid Danbooru/natural-language guide, the `safe` / `sensitive` / `nsfw` / `explicit` safety vocabulary, concrete scene-layer ordering, and a subject-action pattern for unambiguous multi-character staging.

Each request is keyed by chat, message, slot, and tag content. The streaming tag interceptor delivers complete requests once. Completions targeting the same assistant message are finalized through a per-message queue and re-read the latest message before every replacement, so two or more fast parallel generations cannot overwrite one another. Automatic generations do not mount a progress strip in chat; only an aspect-aware fallback remains when a request fails, is cancelled, or still needs explicit approval. Right-click or long-press that fallback for current-profile retry, original-profile retry, prompt editing and confirmation in Quick Create, or the output library. A completed image keeps a small per-image action overlay with the same regeneration choices, including after reload. Finished tags are frozen to their specific Lumiverse image URL rather than leaving the global `{{last_genned}}` macro in old messages.

Before a new model call, the interceptor cleans assistant history without modifying the stored conversation. Studio `<figure>` markup, appended Markdown pointing at Lumiverse-owned image URLs, and embedded image data become a compact `[Generated illustration: alt text]` breadcrumb. The six newest breadcrumbs remain available for visual continuity; older ones are removed from outbound context. This cleanup also covers assistant messages that Lumiverse does not label with its private `__isChatHistory` flag.

Profile macros resolve to raw values so authored HTML and display regexes remain presentation-only:

- `{{char_profile}}` / `{{user_profile}}` — authenticated avatar image URLs
- `{{char_base}}` — the active character's Studio image base tags; this avoids Lumiverse's built-in `{{char_tags}}` macro, which returns categorical character-card labels
- `{{persona_base}}` — the visual identity prompt selected for the active persona in Chat Visuals
- `{{swarm_negative}}` — current literal Studio negative prompt
- `{{swarm_preset}}` — enabled Studio presets as comma-separated native `<preset:exact saved name>` tokens
- `{{swarm_checkpoint}}` / `{{swarm_aspect}}` — current profile details
- `{{last_genned}}` — latest successful Studio output URL

The macro reference remains behind **Studio settings → In-message images**. Character and persona visuals live on the drawer's **Chat Visuals** page (with character output organization still backed by Output Library), so the settings popover stays compact.

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

The folder button beside the compact sort control opens a directory tree made
from each model's relative SwarmUI filename. **All LoRAs** spans the complete
library, **Root** shows models stored directly in the LoRA directory, and
selecting a folder includes its nested descendants while preserving keyword and
model-family filters. The selected folder, sort order, and desktop sidebar state
survive closing Studio. On mobile the same tree opens as a temporary drawer so
the card grid keeps its usable width. Folder navigation is intentionally
read-only: Swarm's metadata API does not expose a supported move/rename
operation, so Studio never mutates model files behind SwarmUI's back.

Saved LoRA stacks and recent generation details are kept in Lumiverse's scoped
per-user extension storage. Generation details are associated with the
persisted Lumiverse image ID so History can show the prompts used by recent
Swarm Studio outputs.

The stack toolbar can export a portable Studio JSON file. **Apply to Lumi**
merges the enabled stack into Lumiverse Image Gen's saved LoRA presets and
activates it in-app; reopening an already-mounted native Image Gen tab makes it
reload those saved settings. **Import stack** accepts either the portable Studio
format or a config exported by Lumiverse. If the current Swarm
library lacks a referenced filename, Studio keeps it in the stack and shows
the metadata source link when available. **Download selected** explicitly
hands checked Civitai/Hugging Face URLs to SwarmUI's permission-checked
`DoModelDownloadWS` endpoint through the Lumiverse backend, shows live progress,
downloads sequentially, and refreshes Studio metadata afterward. The backend
owns the active batch, so closing and reopening Studio recovers its current
status instead of abandoning the queue. Civitai model-page links are resolved to
the matching filename's version when possible. Before the model transfer,
Studio maps Civitai's title/version, creator, descriptions, date, trained
words, tags, base-model hint, source link, and first preview into Swarm's
ModelSpec sidecar payload; the preview is fetched once by the backend with a
strict payload-size cap and never round-trips through the remote device.
Metadata enrichment is best-effort, so
an unavailable Civitai API or preview never prevents the model itself from
downloading. Downloads never start merely
because a stack was imported.

The final model transfer runs inside Lumiverse's normal Bun backend process:
the browser or remote phone talks only to Lumiverse, while the extension backend
connects to the configured SwarmUI address (including the usual
`http://localhost:7801` default). This avoids exposing Swarm's port to mobile,
works when Lumiverse itself uses HTTPS, and keeps progress/cancellation flowing
through the ordinary extension message channel. Lumiverse's optional macOS
`sandbox` runtime mode denies backend networking; use the normal/default
`process` runtime there. Windows and Linux normal installs use the compatible
process runtime (Windows `sandbox` currently falls back to it).

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
`manage_presets`, **Save current** appears beside the preset selector. It opens
a checklist built from the current schema so prompt, model, sizing, sampling,
LoRAs, workflow, overrides, and seed can be included or omitted individually
before Studio calls SwarmUI's `AddNewPreset` API. The adjacent settings button
opens a manager where existing presets can be deleted directly through
SwarmUI's `DeletePreset` API.

Each selected Swarm preset has an **Apply** action. It copies the preset's known
values into the editable Studio controls, moves any LoRA filename/weight pairs
into the visual stack, preserves unknown values as raw overrides, and removes
the applied preset from the outgoing preset list so LoRA weights cannot be sent
twice. Preset and imported-stack filenames are reconciled against installed
LoRAs by normalized full path, extensionless path, basename, and extensionless
basename. A weak basename match is used only when it resolves to one installed
model, so local metadata is inherited without guessing across duplicates.

For newly generated images, Swarm Studio looks up SwarmUI's saved image
metadata to display preparation time, generation time, preset names, and the
original Swarm path. When those fields are unavailable, it shows an end-to-end
time measured around Lumiverse's generation call.

On mobile, saved LoRA stacks can also be loaded directly from the combined
Create tab above the positive and negative prompts. When the active chat has an
enabled visual binding, its saved stack is loaded once into the normal editable
LoRA workspace and selected in both stack selectors. Subsequent manual edits
are left alone rather than being overwritten on every folder refresh.

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
library, opened from the Studio header, drawer, or inspector, walks Lumiverse's
paginated image API to show all extension-owned images across chats, 30 at a
time on desktop and 15 on mobile. Its layout is header, folder strip, selection
row, gallery, then a sticky current-folder rail containing image count,
pagination, and an on-demand search icon. The `+ folder` SVG stays anchored at
the left while folder chips scroll. Search matches every entered keyword across
submitted positive and negative prompts, model, LoRAs, presets, render
parameters, filename, and Swarm path; quoted phrases stay together. The
checkmark enters selection mode, and **Move** / **Delete** appear only after an
image is selected.

New folders can be unbound collections or bound to the active character. A
character folder exposes a collapsible visual strip with base positive, base
negative, and a saved LoRA-stack selector. Its pill above Studio's positive
prompt can be tapped to disable or re-enable all three layers without deleting
their settings or the gallery. Manual and tagged generations for that character
are filed into the same folder across conversations. Older chat-bound folders
are migrated by character ID and duplicate galleries are merged. Duplicate LoRA filenames are normalized; the ordinary
Studio stack wins when it intentionally overrides a bound-stack item.

Folders remain lightweight per-user collections stored by the extension;
moving an output into one does not move or duplicate Lumiverse's underlying
image asset. Deleting a folder leaves its images intact. **Delete from Lumiverse**
deletes the actual owned image and removes its Swarm Studio metadata and folder
assignment. When Swarm exposes the generated file path in image metadata, the
inspector displays it below the recorded LoRA stack as a read-only saved-path
reference. **Download** fetches that original Swarm file only when the path was
verified for the selected generation, preserving embedded PNG metadata. Older
or unverified outputs fall back to the selected Lumiverse image URL rather than
risk returning a different file from Swarm's output folder.

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
opaque gear panel. Completion toasts are off by default and can be opted into
from its Behavior section. That section also enables or disables the floating
widget and independently opts mobile into the full Quick Create panel.

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
if the Studio modal is closed. Its square image state shows the latest streamed
preview; expanding it reveals step-aware progress, workflow/model status, and
**Quick create**. After Studio has been opened, Quick create inherits its full
in-memory draft—including the connection, model, size, seed, sampler, scheduler,
presets, LoRAs, workflow inputs, init image, and raw overrides—while its lightweight
positive and negative fields replace only the prompt text. Before a Studio draft
exists, it uses Lumiverse's default SwarmUI connection defaults. The stop control
targets the active client job; clicking the preview reopens Studio with the same
live or completed output and draft already restored. Size preferences are stored
locally, while generation state and draft data stay in memory only for the
current Lumiverse session.
On mobile, the extension keeps a Lumiverse app-overlay lifecycle mount but
portals the visible miniplayer surface to the document root, so the collapsed
widget remains a complete 64 × 64 square instead of inheriting either the host's
native float-widget cap or a nested app-root clip. Mobile Quick Create is opt-in;
otherwise the widget stays in its square image state. If app-overlay permission
is unavailable, Studio falls back to Lumiverse's float widget. Interactive Quick Create controls
reserve pointer focus from the drag surface. Desktop collapsed mode remains
56 × 56. Right-click or long-press either state for **Expand Quick Create** or
**Minimize Quick Create**, depending on its current state, alongside
**Open Swarm Studio**, **Open Library**, and **Hide widget** actions.

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
