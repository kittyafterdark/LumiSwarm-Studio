# Studio Edit · alpha.9.2

Edit is a persistent workspace beside Lore. Open an image from the Library, upload a PNG/JPEG/WebP directly, open the current output/inspector, or use **Edit artwork** on a Cast expression/background. Inline illustrations have an **Open in Edit** context action. Changing Studio tabs keeps the working document open; closing Studio or opening another image discards unsaved edits after confirmation where the workspace handles that action.

## Local tools

- **Magic wand:** click opaque or partially transparent pixels of a similar color; tolerance 0–100 uses RGB distance with an alpha tolerance. Connected pixels only uses four-neighbor flood fill; uncheck it to select matching colors across the image. Replace/Add/Subtract modes, Shift to add, Alt to subtract. Fully transparent pixels are excluded. Clear to transparency only modifies alpha; it never paints a black/white background.
- **Lasso and rectangle:** drag a selection; Grow/Shrink changes the mask by one pixel, Feather softens it (up to 12 pixels), Invert and Deselect refine it. Select a region before cropping. Selection Undo and Redo restore the selection mask without changing the artwork. Pixel changes clear the selection history. Eraser strokes remove alpha; pixel undo/redo restores artwork.
- **Brush / eraser:** paint with a chosen solid color or erase alpha. The ring previews the brush diameter under the pointer and while adjusting size; the existing Inpaint mask editor also previews size.
- **Liquify · Push:** drag to locally warp color and alpha together, with adjustable size and strength. Undo restores the prior pixels in one step per drag. This is a basic push warp, not a full mesh-based Liquify suite.
- **Despill:** reduces excess green or blue near alpha boundaries or inside the selection without changing alpha. Use cautiously on intentionally colored clothing, hair or accessories.
- **Crop & transform:** crop to selection bounding box, rotate 90° or flip horizontally. Fit, zoom and Pan change only the view. Checkerboard, black, white and custom preview backgrounds are not included in the exported image.
- **PNG / Save copy:** download the current PNG or upload a new extension-owned image. The original is never overwritten. Contextual replacement changes only the intended Cast expression/background or attached inline image, with stale-source checks. Existing artwork references and original files remain protected; cleanup remains a separate Vacuum decision.

## Existing AI tools

Background removal invokes the existing built-in BiRefNet graph, with stop/progress support. Upscale and Inpaint open the existing configuration/mask dialogs using the working image. If necessary, the current canvas is saved first so the provider can access a real asset. Select **Use variant in Edit** after an inpaint run. The mask editor receives the selected region rescaled to its own working dimensions. AI outputs are saved derivatives; accepting a result adds a pixel undo step rather than overwriting the source. These tools require Images and Image Generation permissions and a compatible active SwarmUI connection/workflow. If an image is not extension-owned, save a copy first before using the AI tools. Provider behavior and available models still depend on the installation.

## Boundaries

Native pixel tools preserve dimensions (unless explicitly cropped/rotated), up to 16,777,216 pixels and 8192 px per side. PNG uploads use the existing 7.5 million data-URL character budget (approximately 5.6 MB encoded binary); larger edited images can be downloaded as PNG without resampling. GPU tools retain their existing processing limits (4096 px source side for enhancement/background removal; inpaint scales to its existing 2048 px working canvas). Results beyond the local canvas cap remain in the Library rather than being resized to fit. Undo uses bounded in-memory snapshots (up to 16 prior states and approximately 96 MiB of history); no persistent document history or layers. Selection history is separate, session-local and bounded (up to 12 masks and approximately 32 MiB per history stack). Pixel changes reset selection history. A deleted source pixel cannot be reconstructed without an original or AI edit. For local processing, undo/redo operates on pixels; saving a reverted document creates a fresh derivative if necessary.

Local assets carry `local_edit` / `edit` provenance, have no claimed external Swarm file, and inherit the source's existing virtual folder when present. Replacement validates the exact current target rather than rewriting the entire Cast library; copies remain saved if replacement fails. The current host SDK must support extension-owned image uploads; if unavailable, use PNG download. No direct deletion or expanded Vacuum privileges.

## Tests

- `node tests/studio-edit-contract.mjs` (pixel-level selection, alpha and despill).
- `node tests/backend-contract.mjs` (new scoped upload, provenance, Cast replacement and conflict fixture plus existing contracts).
- `python tests/studio-edit-browser.py` (Playwright/Chromium and Pillow: real frontend with local image fixture and mocked SDK/provider; 1440, 390 and 320px, native output pixels, undo/redo, tabs, contextual Cast replacement, background result, AI upscale return, and inpaint mask transfer).

Run `npm run build` and strict typecheck before testing. Real Lumiverse upload/Swarm processing should be smoke-tested on the live installation before relying on the AI tools for production.
