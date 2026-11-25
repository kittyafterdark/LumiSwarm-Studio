# Alpha.12 — Postproduction

Finalize is a manual, non-destructive finishing workspace. It reuses the extension's normal image-generation transport and image library rather than creating a second asset store. No change to existing automated Genesis, inline CG, expression or background pipelines is required.

## Getting started

1. Open **Finalize** from Studio's workspace tabs, or send an image from Inspect or Edit. The source must be a saved, owned Lumiverse image. An unsaved Edit canvas is saved as a new copy first.
2. Choose the current image or another library output. The original generation record supplies checkpoint, prompts, sampling context and LoRAs where available. For imported artwork, use Generate settings or enter a checkpoint and prompt in Render context. Raw custom workflows and presets are deliberately not inherited.
3. Choose a starter recipe or add stages. Use arrows to reorder the chain, toggle stages, and select the stage row for its parameters. Up to eight stages per recipe. Save recipe stores only stage configuration, not the artwork or raw provider payload.
4. Refresh provider capabilities after installing nodes or changing the connection. Select installed models and detectors. Run Finalize. Completed stages are saved independently and available as thumbnails. Compare original vs current result using the split slider (0 = original, 100 = result), or open a derivative in Edit.
5. Stop cancels the current stage and leaves accepted results in Library. A failed stage can be retried, edited or disabled before continuing. Reset returns to the source without deleting any outputs. The chain cannot be reordered after it has begun; reset to start a new order.

## Stage types

| Stage | Behavior |
|---|---|
| Refinement | Native img2img with resolution multiplier, denoise/creativity, steps, text CFG and fixed seed. Optional Anima reference guidance uses the current stage input as both initial latent source and adapter reference. |
| AI upscale | Existing model-based Swarm upscale transport; choose an installed upscaler and 2–4×. |
| Detailer | Impact FaceDetailer using an installed Ultralytics detector. Built-in graph currently supports Anima and Illustrious checkpoints; select detector and tune steps, CFG, denoise, seed and supported crop controls. Optional positive/negative prompts override the stage context, otherwise it inherits that context. |
| Background removal | Existing BiRefNet workflow. Must be detected on the selected provider. |
| Despill | Existing local Edit green/blue despill operation on a new saved PNG. No provider call. |

Four starter recipes: Illustration polish, Expression finishing, Environment polish, Surgical correction. These are starting configurations, not universal model-quality prescriptions. Select compatible upscalers and detectors before running their stages. Refinement is a redraw, so identity preservation is not guaranteed; low creativity and reference assistance can help but are model-dependent.

## Render Lab

Open the flask tool when the next enabled stage is Refinement. Compare two to four distinct, valid values of creativity, steps, text CFG, reference guidance or guidance end (the last two require reference mode). Every candidate uses the same incoming saved image and the same explicit seed, not the prior candidate. The accepted candidate advances the chain and updates the recipe's chosen value; continue with the remaining stages or save your recipe. Candidates are separate saved images and can be removed manually through normal Library/Vacuum tools. On mobile, the artwork and candidate strip automatically get more room after comparison.

## Reference conditioning in Generate

**Tune → Sampling & quality → Anima reference conditioning**: choose independent reference guidance (default 4.5) and guidance end (default 1.0, optional adapter input). Text CFG remains independent. The existing character folder / active Look binding is used when no manual reference is chosen. Choose a saved reference in A or B to override the binding for manual text-to-image, or choose both to build a single left/right composite JPEG. Describe A then B in the prompt. This is one shared adapter input, not independent per-character adapters or guaranteed spatial identity binding. Manual reference selection is session-local. Clear restores automatic binding. Manual references with init images are rejected; use Finalize's reference-assisted refinement for that path.

A provider with no `ref_end` input accepts the legacy default only. Non-default end requires a compatible adapter; no unsupported value is silently forwarded. The default and supported range are Studio policy, not a promise of optimum diffusion settings.

## Smart Selection in Edit

Select the Smart Selection tool (SAM2). Choose an available SAM2 model and device, then click the subject. The backend receives one positive point in original-image pixel coordinates and returns a grayscale mask saved as an auditable derivative. Edit applies the mask to its existing replace/add/subtract selection state and history. Modifier keys and selection mode continue to work; multiple clicks combine or subtract separate masks. Undo, feather, invert, delete pixels and mask transfer to Inpaint remain existing Edit operations. The source pixels are unchanged unless you explicitly use a pixel operation. A wrong-size mask is rejected rather than stretched. Segmentation is currently point based; no text prompt, automatic multi-object detector, or persistent SAM session is claimed.

## Provider requirements

Provider capability discovery queries the selected SwarmUI connection's `/ComfyBackendDirect/object_info/<node>` endpoint using the existing CORS proxy and metadata authentication. It does not install plugins or models. Check that the following nodes and model lists are visible on the actual selected backend:

- [ComfyUI Anima Ref Adapter](https://github.com/ArcAnima/ComfyUI-Anima-Ref-Adapter): `AnimaRefAdapter`; compatible Anima model/adapter files. The reference end field is version-dependent. A/B composite uses the single-image transport.
- [ComfyUI segment anything 2](https://github.com/kijai/ComfyUI-segment-anything-2): `DownloadAndLoadSAM2Model`, `Sam2Segmentation` and the standard `MaskToImage`; supported model/device choices. The provider's loader may download its model if not already available.
- [Impact Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack) and [Impact Subpack](https://github.com/ltdrdata/ComfyUI-Impact-Subpack): `FaceDetailer`, `UltralyticsDetectorProvider` and installed detector weights. Face, hand and eye choices depend on the actual detector inventory. Crop guidance, max size, threshold, dilation, crop factor, feather and cycles are offered only when exposed by the installed node. The backend also checks unsupported requested values.
- Existing upscale and BiRefNet workflows are reused.

Discovery is not proof that the installed graph can execute. A multi-backend Swarm installation can route a job differently from the node inventory; check provider errors and installed models. No live Swarm GPU or installed Lumiverse SDK was available for Alpha.12 verification. Real image quality, exact node-pack compatibility, alpha preservation in diffusion passes and actual provider cancellation need live verification. Provider-side input must be readable PNG/JPEG/WebP up to 4096px per side, 16MP and 5.6 MB; very large intermediate upscales may need to be the last GPU stage. Local despill has its own Edit limits.

## Asset and lifecycle behavior

- Every GPU result is a new owned image and generation record with a parent asset reference. Local despill is a new derivative too. No silent replacement of the original, Cast expression, or inline message.
- While Finalize is open, account-scoped workspace leases protect source and produced derivatives from the reference snapshot used by Vacuum. Leases refresh every two minutes, expire after 30 minutes and are released on close; a backend restart clears in-memory leases. Favorite or attach artwork for longer-term protection. The original is not automatically deleted. Unchosen candidates remain in Library.
- This is a frontend-orchestrated chain with independently cancellable backend stages, not a durable server queue. Switching Studio tabs retains the workspace. Closing Studio aborts in-flight work; completed results remain. Saved recipes persist per account, but running chains and selected sources do not survive a reload or restart.
- Genesis, Expression Studio, dynamic background and inline automatic finishing are not wired to these recipes yet; the operations can be reused in a future integration.

## Validation

`npm run test:postproduction` runs recipe validation and the actual backend RPC contract against an in-memory owned-image/provider fixture. `npm run test:postproduction-ui` runs the compiled frontend with Python Playwright, Pillow and Chromium (set `CHROMIUM_PATH` if needed). The mock proves transport, graph construction, state and lineage, not diffusion output quality. See the release validation notes for exact suite results.
