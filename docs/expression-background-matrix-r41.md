# Background removal model paths (v1.0.41)

Studio's built-in **BiRefNet** mode uses the ComfyUI `LoadBackgroundRemovalModel` node with `birefnet.safetensors`.

## Install paths

- Direct ComfyUI installation: select `ComfyUI/models/background_removal`, or its `models` parent (Studio will use or create the `background_removal` child).
- Stability Matrix shared models: select `StabilityMatrix/Models/BackgroundRemoval` directly, or the `Models` parent if it already contains the `BackgroundRemoval` category. (Your actual Stability Matrix data location can differ.)
- If both naming conventions exist in the parent directory, Studio refuses to guess; select the intended final folder instead.
- For an empty, capitalized `Models` root, create/select `BackgroundRemoval` explicitly. Do not accidentally create `background_removal` under the Stability Matrix library.

**Install on this device** uses the browser's File System Access API. It writes on the device running the browser, *not* to a remote server's disk. The **Download weights** link is manual; users must place the file into the directory the connected backend reads.

## Connection and readiness

`Check model` queries the connected backend's `ComfyBackendDirect/object_info/LoadBackgroundRemovalModel` to see if the node actually offers `birefnet.safetensors`. A successful local write does **not** imply this remote/runtime check will succeed. Ensure Stability Matrix's shared-folder mappings apply to the Comfy backend Swarm is actually using (Configuration/`extra_model_paths.yaml` or Symlink sharing), refresh/restart that backend if needed, and check again.

SwarmUI's `/API/ListModels` returns models and folders registered under Swarm's own model subtypes; it is not an unrestricted server filesystem directory API and is not used as a substitute for ComfyUI's background-removal loader choices.

Regression: `node tests/expression-background-matrix-contract.mjs` mocks the native directory picker, file handles, writes, and existing model detection. Backend's existing `tests/backend-contract.mjs` covers the Comfy node-list check.
