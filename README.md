<div align="center">
  <img src="docs/assets/swarm-studio-emblem.svg" width="76" alt="Swarm Studio emblem" />
  <h1>Swarm Studio</h1>
  <p><strong>Your SwarmUI workspace, right inside Lumiverse.</strong></p>
  <p>Prompt, tune, stack LoRAs, browse generations, and bring images into your chats—without switching applications.</p>
  <p><code>Spindle extension</code> · <code>Lumiverse 0.15.8+</code> · <code>SwarmUI / ComfyUI workflows</code></p>
  <p><a href="#installation"><strong>Install</strong></a> · <a href="#the-studio"><strong>Explore the studio</strong></a> · <a href="#what-it-does"><strong>Features</strong></a> · <a href="#documentation"><strong>Documentation</strong></a></p>
</div>

> **Inline generation reliability (v28):** The extension converts U+2800 Braille blanks to ordinary spaces in Gem-authored inline image prompts and both outgoing SwarmUI prompt fields. Replayed generation events and identical inline callback deliveries are deduplicated; explicit regenerate/retry still produces a new job. This is an outgoing-data fix, not a rewrite of existing chat text.

> **Floating toolkit (v27):** the original satin Locket opens a six-action rail: Quick Create, Full Studio, Preview, Recent Images, Append, and More. The small pin beside the orb keeps the rail open. Right-click/long-press the **orb** for its unchanged context menu; use the **rail’s `⋯`** for a separate toolkit menu with AI Upscale, Quick Create, Gallery, pinning, and panel reset. Quick Create has a draggable header and an in-panel render-settings screen (ratio, dimensions, sampler, steps, CFG, and seed). Preview stays independently open while Quick Create is in use, including on mobile. The easel uses real generation events.

---

![Swarm Studio desktop Generate workspace with Tune inspector, output canvas, prompt composer, and LoRA stack](docs/screenshots/studio-desktop.png)

<sub>Generate workspace · Actual v4 interface captured with an offline browser fixture. Connection-dependent content is unavailable in this preview.</sub>

Swarm Studio adds a full image-generation workspace to [Lumiverse](https://github.com/prolix-oc/Lumiverse) using the SwarmUI connection you already configure there. It **does not replace** Lumiverse's native inline image tools or take ownership of your saved connection secret.

## The studio

### Generate: the controls you need, where you need them

A three-part workspace keeps the **Tune** inspector, current output and prompt composer, and **LoRA stack** in view. Tune groups the real controls by task rather than presenting one endless settings form:

- **Model & workflow** — checkpoint selection, standard Swarm generation, and saved ComfyUI workflow parameters.
- **Canvas & size** — orientation presets, aspect ratios, linked dimensions, and scale.
- **Sampling & quality** — steps, CFG, seed, sampler, and scheduler.
- **Image-to-image & Advanced Swarm** — init images, denoise/creativity, preset stacks, model overrides, and raw request JSON when you need them.

The little **⋯** menu collects Studio defaults, character recipe actions, and Lumiverse prompt exports without burying the everyday controls beneath them. It preserves their different save/restore behavior.

### Styles: reusable looks and a real LoRA library

![Swarm Studio Styles workspace with saved style editor, searchable LoRA browser and stack controls](docs/screenshots/studio-styles.png)

<sub>Styles workspace · The LoRA library and the active stack stay separate, so browsing never silently changes your generation.</sub>

Build named Styles with positive and negative prompt additions, optional render settings, and a selected LoRA stack. Browse compatible LoRAs, inspect metadata and previews, enable or reorder weights, opt into trigger phrases, and import/export shareable stacks. You can apply a stack to Lumiverse Image Gen as well.

### Output Library: your generations, properly organized

![Output Library folder landing with fixed-size preview cards and a 2×2 image collage](docs/screenshots/v10-library-folders-desktop.png)

<sub>Output Library v10 · Offline browser fixture with 1,435 simulated outputs. Your own images and folders appear in the live extension.</sub>

The library keeps every original saved image in Lumiverse. Browse **All outputs**, **Unfiled**, **Favorites**, and virtual character or custom folders with bounded cover previews. Open a folder for a paginated, independently scrollable thumbnail grid; image details, favorites, bulk selection, and character Looks remain accessible. At phone widths, folder cards and image thumbnails use a two-column layout.

### Phone-sized without throwing away your work

<table>
  <tr>
    <td align="center" width="50%"><img src="docs/screenshots/mobile-tune.png" width="330" alt="Mobile Tune tab with model and canvas controls" /></td>
    <td align="center" width="50%"><img src="docs/screenshots/mobile-recipe-actions.png" width="330" alt="Mobile Tune with compact Recipe actions menu open" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Tune on mobile</b><br />Compact cards, tappable controls, and preserved draft state.</sub></td>
    <td align="center"><sub><b>Recipe actions</b><br />Save and restore operations without an accordion maze.</sub></td>
  </tr>
</table>

The mobile studio uses **six persistent tabs:** **Create · Tune · Style · LoRAs · Stack · History**. Switching tabs preserves prompt drafts, loaded LoRAs, and other in-progress settings. The image-to-image picker lives in **Create** on narrow screens, and Generate remains within easy reach.

## What it does

| Create & iterate | Keep images organized | Bring visuals into Lumiverse |
| --- | --- | --- |
| Positive/negative prompts, checkpoints, sampler, scheduler, CFG, seed and aspect controls | Chat-scoped history, output details, reuse parameters, favorites and folders | Append finished images to chat, per-character visual bindings, named Looks and Visuals controls |
| Live previews and interrupt support when Lumiverse exposes streaming | Full-size inspection, verified Swarm-path downloads when available, original metadata preservation | Optional `<swarm-image>` message tags, one-pass or parser-model image requests |
| img2img and saved SwarmUI/ComfyUI workflows | Searchable LoRA library, weighted stacks and portable JSON | Quick Create floating player, Lumiverse Image Gen stack handoff, `{{last_genned}}` macro |

The Studio also includes metadata-aware LoRA downloading, stack presets, native prompt editors, customizable appearance, and visual lore integration on supported Lumiverse builds. For the precise behavior and integration requirements, see the [full feature reference](docs/feature-reference.md).

## Installation

**Before you start:** You need Lumiverse **0.15.8 or newer**, a working **SwarmUI image-generation connection** in Lumiverse, and permission to enable a Spindle extension. ComfyUI workflows are accessed through SwarmUI's saved workflow interface; a separate direct ComfyUI connection isn't required for Studio.

1. In Lumiverse, open **Extensions / Spindle** and install Swarm Studio from its GitHub source or an extension archive/folder.
2. Enable **Swarm Studio** and approve the requested permissions. The manifest lists them in [`spindle.json`](spindle.json).
3. Confirm your existing **SwarmUI** connection works in Lumiverse. When no explicit URL is set, Lumiverse's default is `http://localhost:7801`.
4. Open **Swarm Studio** from its drawer entry or the chat input's **Extras** menu. Pick a checkpoint, enter a prompt, and generate.

**Using a source ZIP?** The package includes the compiled `dist/frontend.js` and `dist/backend.js` expected by Spindle; you do **not** need to build it just to install it. For a manual replacement, back up the existing extension directory and extract the complete source over it. Restart/reload Lumiverse as appropriate for your installation.

If a previous GitHub-source installation failed partway through, stop Lumiverse and remove the incomplete `data/extensions/swarm_studio` directory before retrying. See [GitHub source installation notes](docs/feature-reference.md#github-source-installation).

## A few useful details

**Generation and authentication.** Image creation continues through Lumiverse's SwarmUI provider. Streaming uses `spindle.imageGen.generateStream()` when available, with a non-streaming fallback. Lumiverse's connection secret is never exposed to the extension; if SwarmUI restricts *metadata* access, Studio supports a separate encrypted metadata-only token in Settings.

**Connected features vary.** LoRA previews, checkpoints, saved presets, workflows, and original-file downloads depend on the APIs and metadata your SwarmUI server exposes. Character-editor Visuals integration and automatic in-message image interception require the corresponding Lumiverse host capabilities. Core Studio generation remains available when optional integrations are missing.

**No surprise downloads.** Importing a LoRA stack does not automatically download its missing models; transfers require an explicit action.

### AI Upscale workbench (v25)

**One-time setup:** SwarmUI needs a running ComfyUI backend (usually **Server → Backends → ComfyUI Self-Starting**), and your SwarmUI account must be allowed to run dynamic Comfy workflows. To use the recommended **AI upscaler** mode, place an actual super-resolution model file such as [RealESRGAN_x4plus_anime_6B.pth](https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth) (anime illustrations) or [4x-UltraSharp.pth](https://huggingface.co/Runware/upscaler/resolve/main/4x-UltraSharp.pth) (general illustrations) in **`<SwarmUI model root>/upscale_models/`**. The model root is configured in SwarmUI's model path settings; check it rather than guessing your install path. Restart/refresh SwarmUI's ComfyUI backend so it sees the newly installed model. Studio does **not** silently download or install checkpoints.

Open a saved PNG/JPEG/WebP in **Studio → Output inspector → AI Upscale**. The new workbench offers three paths:

- **AI upscaler (recommended):** Discovers models actually installed through SwarmUI's `ListT2IParams`, recommends an anime-specific model if one is present, and defaults to **2×** output. Select **3×** or **4×** as needed. The pipeline executes `SwarmLoadImageB64 → UpscaleModelLoader → ImageUpscaleWithModel → ImageScale → SaveImage`. The final `ImageScale` step only resizes the *AI-enhanced* result to the exact desired dimensions; enhancement itself runs through the selected model. No fake model fallback to Lanczos.
- **Saved workflow:** Lists saved SwarmUI Comfy workflows and lets you choose an explicitly **exposed image input**. The saved workflow decides its own enhancement steps and final output dimensions; Studio sends the source image to that exposed input. Your SwarmUI account needs permission to read and execute saved workflows.
- **Custom graph:** Paste or import a **ComfyUI API-format** JSON graph (not Comfy's visual/UI-layout export). It must have exactly one `SwarmLoadImageB64` input node and one `SaveImage` output node; Studio injects the saved image and output filename prefix. All graph nodes must be installed and permitted on your own ComfyUI backend. Graphs are limited to 128 KB / 150 nodes.

Choose **Remember this setup** to save your recipe per SwarmUI connection. Studio preserves the original image and saves a new result to the Output Library, normally beside the source in its folder. Owned input images must be no larger than 4096 px on either axis. Model-mode outputs are capped at 8192 px on either axis and at 36 megapixels; custom workflows have their own dimensions and VRAM requirements. Lumiverse must grant the extension **Images**, **Image Generation**, and (for discovery/validation) **CORS Proxy** permissions. The live generation uses Lumiverse's existing image-gen provider connection, not a separate ComfyUI URL.

**Compatibility note:** The separate inline chat-image *Finalize* action now reuses a remembered AI upscale recipe when one exists. Older installations without a saved AI recipe retain their previous 2× Lanczos inline-finalize behavior; the Output Inspector's **AI Upscale** button never substitutes Lanczos for a missing model. If discovery shows no models, verify the file location, restart/refresh SwarmUI, and reopen the workbench.

## Documentation

| Guide | What's inside |
| --- | --- |
| [Full feature & technical reference](docs/feature-reference.md) | Image-tag protocols, authentication, LoRA downloading, character looks, output library, macros, workflow parameters, and runtime behavior |
| [Studio workspace architecture](docs/experimental-studio.md) | Source map, mobile pane ownership, host integration, and browser diagnostic notes |
| [v4 redesign notes](REDESIGN_V4_README.md) | What changed in the source-aware visual rebuild and which checks were run |
| [Changelog](CHANGELOG.md) | Detailed feature and compatibility history |

## Development

The checked-in bundles are the runtime entrypoints. **When editing source**, rebuild them before packaging or committing:

```sh
# Node.js 23.6+ for the source build
npm run build

# For development/testing, install the declared dev dependencies
npm install
npm test
npm run typecheck
```

The package has no runtime dependencies. The optional browser suite is `npm run test:browser`; interactive UI diagnostics may require a configured Chromium/Playwright environment and suitable host fixtures. Debug messages use the `[Swarm Studio]` prefix in browser and Lumiverse server consoles.

---

<div align="center">

**Built for the space between a generation and the story it belongs to.**

<sub>Swarm Studio is a Lumiverse extension. SwarmUI and Lumiverse are separate projects.</sub>

</div>
