# Expressions Maker · Upscaler model preflight · v1.0.42

In Expression Studio, the Enhance step displays a compact Upscaler model status ribbon with a Check model button. It reads the saved AI Upscale settings for the current SwarmUI connection and compares the **exact selected model** against SwarmUI's currently reported model registry. It does not assume that a file on disk is loaded or choose a substitute model.

| State | Meaning |
| --- | --- |
| installed | The configured upscaler is listed by this SwarmUI backend. |
| missing | Upscaler name is configured, but this backend lists other models. |
| empty | No upscale models are reported in the model list. |
| unconfigured | The connection has no saved AI upscale model/workflow. |
| unavailable | The check could not query the backend. This is *not* proof of a missing model. |
| workflow | A saved or custom graph is configured; model verification belongs to its nodes and cannot be reduced to one selected upscaler. |

The preflight is advisory, independent of image selection, and does not edit saved upscale settings or install/download any model. To configure an upscaler, open AI Upscale from a saved Output Library image, choose an installed model and remember the connection setup.

## Regression

- `node tests/expression-upscale-ribbon-contract.mjs`
- `node tests/backend-contract.mjs` (configured/missing/empty/unknown/unconfigured/workflows)
- `python tests/expression-upscale-ribbon-browser.py` (actual compiled UI on mobile and desktop, status refresh and expression preservation)
- `STUDIO_TSC=/path/to/tsc npm run typecheck`
- `npm run build`

The snapshot under `docs/screenshots/` is from a mocked SwarmUI backend, not from an actual model installation.
