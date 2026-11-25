# Alpha.12 release validation

- Production build: passed.
- Strict TypeScript: passed with installed global TypeScript 5.8.3 via `STUDIO_TSC`; repository's pinned local compiler was not installed.
- Contract and safety scripts: 43 passed, 7 environment-blocked, out of 50. The metadata registry/reference-link fixtures now include Genesis and Finalize protection bindings, and both pass.
- Real compiled frontend, mocked host/provider: postproduction at 1440, 390 and 320 px; Edit regressions at all three widths. Manual A/B image picker and actual composite JPEG verified at 1440 px. No live GPU calls.
- Backend fixture: real RPC handlers and generation transport for native/ref-assisted refinement, detector tuning and prompt overrides, upscale, cutout, SAM2, single and composite manual Anima references; user scope, parent linkage, invalid source rejection, persisted recipes, reference snapshot claims.
- Archive: original entries preserved, manifest regenerated, source and compiled dist included.

## Script outcomes

| Script | Result |
|---|---|
| `backend-contract.mjs` | Pass |
| `cast-atmospheres-contract.mjs` | Pass |
| `cast-contract.mjs` | Pass |
| `cast-envelope-contract.mjs` | Pass |
| `cast-expression-sides-contract.mjs` | Pass |
| `cast-island-pipeline-contract.mjs` | Pass |
| `cast-presentation-contract.mjs` | Pass |
| `cast-wardrobe-r6-contract.mjs` | Pass |
| `cast-wardrobe-r7-contract.mjs` | Pass |
| `cast-wardrobe-r8-contract.mjs` | Pass |
| `cast-wardrobes-contract.mjs` | Pass |
| `cast-worlds-contract.mjs` | Pass |
| `character-image-actions-contract.mjs` | Pass |
| `expression-background-matrix-contract.mjs` | Pass |
| `expression-upscale-ribbon-contract.mjs` | Pass |
| `expression-v3-bank-contract.mjs` | Pass |
| `expression-v3-layout-contract.mjs` | Pass |
| `expression-v4-viewport-contract.mjs` | Pass |
| `expression-v5-inline-contract.mjs` | Pass |
| `expression-v6-editor-overlap-contract.mjs` | Pass |
| `expression-zip-contract.mjs` | Pass |
| `frontend-contract.mjs` | Pass |
| `inline-lifecycle-contract.mjs` | Blocked: missing jsdom |
| `live-redesign-v5-contract.mjs` | Blocked: missing jsdom |
| `metadata-provider-contract.mjs` | Blocked: missing separate Lumiverse provider checkout |
| `metadata-registry-contract.mjs` | Pass |
| `native-image-gen-contract.mjs` | Pass |
| `postproduction-contract.mjs` | Pass |
| `recipes-contract.mjs` | Pass |
| `reference-link-contract.mjs` | Pass |
| `resume-contract.mjs` | Blocked: missing jsdom |
| `safety-scan.mjs` | Pass |
| `studio-dom-contract.mjs` | Blocked: missing jsdom |
| `studio-edit-contract.mjs` | Pass |
| `swarm-preset-modal-contract.mjs` | Pass |
| `tune-redesign-contract.mjs` | Blocked: missing jsdom |
| `v17-quick-lookbook-contract.mjs` | Pass |
| `v18-quick-create-contract.mjs` | Pass |
| `v19-vertical-rail-contract.mjs` | Pass |
| `v21-quick-composer-contract.mjs` | Pass |
| `v22-satin-locket-contract.mjs` | Pass |
| `v23-image-studio-contract.mjs` | Pass |
| `v24-avatar-crop-contract.mjs` | Pass |
| `v25-ai-upscale-contract.mjs` | Pass |
| `v26-floating-easel-contract.mjs` | Pass |
| `v27-floating-toolkit-contract.mjs` | Pass |
| `v9-theme-contract.mjs` | Pass |
| `widget-position-contract.mjs` | Blocked: missing jsdom |
| `workflow-health-contract.mjs` | Pass |
| `workspace-contract.mjs` | Pass |

Live SDK, Swarm node graph execution, real model results and cancellation propagation still require a real installation. Browser fixtures use a supplied portrait, synthetic masks and simulated provider responses; they do not establish image-generation quality.
