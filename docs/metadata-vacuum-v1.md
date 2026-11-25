# Shared Studio metadata and Vacuum preview

Current policy: [Metadata lifecycle settings](lifecycle-policy.md) supersede the earlier mandatory complete-Lumi-coverage gate. Complete-reference mode remains available; known references still protect assets. Vacuum remains preview-only.

Implemented as a non-destructive first release on 2026-11-23. Existing Lumi **Delete drafts** continues to clean Lumi records; the Vacuum never calls it or `spindle.images.delete()`. A Lumi image and a Swarm original remain separate assets.

LumiSwarm's earlier work is preserved in local commit `be6d573`. Nothing was pushed or branched. New metadata work is separate, uncommitted work on top of that checkpoint. Existing untracked screenshots/reports/manifests were left on disk and excluded from that source checkpoint.

## Metadata and identity

Both clients send a flat string map through Swarm `extra_metadata`: `studio_schema=1`, `studio_origin`, `studio_asset_id`, `studio_pipeline_id`, `studio_parent_id`, `studio_stage`, `studio_retention=candidate`, and `studio_created_at` (Unix milliseconds). Standalone also records `studio_batch_size` because a batch request can label multiple physical outputs with one job identity. Such outputs are never eligible in V1.

Stages include `general_generation`, `expression_draft`, `expression_final`, `upscale_result`, `background_removed`, `inpaint_variant`, and `inline_illustration`. Selection does not rewrite generation metadata. Current protection is reported separately. Parents refer to Studio asset IDs, never Lumi image IDs or prompt strings. Legacy sources without a known asset ID start a new lineage rather than inventing a relationship.

LumiSwarm uses `await spindle.uuid.v4()` and fails clearly when the host helper is unavailable. Standalone uses its existing application ID helper. Lumi's durable `studio-assets-v1.json` ledger serializes writes per user and retains lineage when Delete drafts removes generation records. Snapshots compute current protection from extension-owned data.

## Provider compatibility gate

The local Lumiverse source at `LumiTest/Lumiverse` passes `parameters.rawRequestOverride.extra_metadata` through `SwarmUIImageProvider.buildBody`. Both HTTP and WebSocket routes use that builder. A bare `parameters.extra_metadata` is ignored. The new contract test executes the real builder and merge helper with mock requests; no Lumiverse core file was changed.

This is **not a live generation/PNG round trip**. Direct Comfy workflow paths that bypass Swarm's generation API cannot be assumed to preserve Swarm metadata. A missing echoed asset ID leaves the path unverified. No provider change is needed for the tested Swarm request-builder path.

Swarm documents the request field in its [T2I API](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/docs/APIRoutes/T2IAPI.md), and the [metadata format](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/docs/Image%20Metadata%20Format.md) describes `sui_extra_data`.

## Using the preview

1. Pair **Vacuum preview → Connect LumiSwarm** with Lumi **Settings → Metadata → Live references**, following [the connection guide](reference-coverage.md). Fresh authenticated snapshots then arrive automatically.
2. Scan Swarm history. Manual **Export references** / JSON import remains a fallback.
3. Review candidate/protected/needs-review reasons, page through files, exclude paths, and export the full report. Exclusions and the last 20 scan summaries persist separately for each server/user/output routing scope.
4. Optional automatic scans run once when opening Library while idle, per connection scope. They only generate previews. No automatic or manual Vacuum deletion exists in V1.

The old mass-delete action now says **Review non-favorited** and opens the same safe preview. Explicit individual deletion remains an independent existing action.

History reconciliation and Vacuum use one complete folder scanner, the server's history limit, favorite mirrors, cancellation, and output-relative path validation. A visibly capped/malformed/failed scan never publishes partial candidates or prunes the index. Depth one discovers folders; direct-file consumption and six-request concurrency preserve the existing traversal behavior. Completion means the API folder walk finished without a detectable cap; Swarm has no authoritative completeness marker and can omit metadata-less entries or truncate before filtering. Filesystem completeness is a further gate before destructive cleanup. Sizes are only counted when supplied; unknown sizes stay unknown. The schema never retroactively tags old images.

## Coverage and remaining gate

Snapshots cover the extension library, favorites, folders, Looks/visual bindings, Cast, expression sets, inline jobs and image ownership fields. They report `complete=false`: the public API has no authoritative host-wide reverse-reference graph, and copy usability is verified separately by bounded full-original decoding; unchecked claims remain unverified. Unverified scope is an empty string; otherwise it uses the server/user/output routing actually returned by GetNewSession.

Consequently actual exported Lumi snapshots intentionally block candidate eligibility until coverage can be proved. The fixture tests demonstrate candidates with a deliberately complete mock snapshot. They do not establish that a real file is safe to delete. Snapshots expire after 15 minutes; finals stay protected, and only old expression drafts with an unambiguous saved direct replacement can become preview candidates. A persisted Lumi copy alone is insufficient.

Before execution can be added, resolve the precise remaining coverage limits in [the current audit](reference-coverage.md), verify the private live connection/server identity, and revalidate references, jobs, favorites, source and replacement immediately before each deletion. Recycle-bin behavior must be checked on that server. Lumi database cleanup remains separate.

## Validation

- PASS: both production builds, standalone TypeScript check and full `npm run preflight`.
- PASS: extension backend contracts; new registry/lineage/concurrent-write/deleted-draft/UUID tests; actual provider-builder passthrough test.
- PASS: standalone pure eligibility/inventory tests for collisions, caps, missing/deleted replacements, scopes, stale/changed references, active jobs, unsupported metadata and cancellation.
- PASS: mock browser UI at 1440×1000 and 390×844: former mass-delete route, import, scan, exclusion persistence, report download, reference changes, caps, cancellation, Escape and overflow; zero deletion calls and no browser errors.
- Existing FAIL: Lumi full `npm test` reaches an outdated `ctx.dom.addStyle(STYLES)` assertion in `frontend-contract.mjs`. It is also absent at `be6d573`.
- Existing FAIL: Lumi `npm run typecheck` reports the existing `Uint8Array<ArrayBufferLike>` → `BlobPart` incompatibility in `src/studio/expressions.ts:60`. Running the checkpoint frontend through the same compiler reproduces it.
- NOT RUN: live host UI/generation/PNG verification, installed Tauri runtime or real-device mobile checks; real-file cleanup is unavailable.

Run `npm run test:metadata` here (set `LUMIVERSE_SOURCE` for another core source location). Run `npm run test:vacuum` and `npm run test:vacuum-ui` in standalone. Its browser test accepts `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHANNEL`; this workstation uses LumiSwarm's installed Playwright and headless Edge. Generated browser evidence lives under standalone `test-results/vacuum-1440.png` and `vacuum-390.png`, outside source delivery.

## Intended source changes and rollback

LumiSwarm: `src/backend.ts`, `src/studio/controller.ts`, `package.json`, `tests/backend-contract.mjs`, `tests/metadata-registry-contract.mjs`, `tests/metadata-provider-contract.mjs`, this report, `SHA256SUMS.txt`, and required `dist/backend.js` / `dist/frontend.js`.

Standalone: `src/app.ts`, `src/swarm/client.ts`, `src/swarm/types.ts`, `src/expressions/studio.ts`, `src/expressions/editor.ts`, new `src/library/{provenance,inventory,vacuum}.ts`, `src/library/vacuum.css`, `package.json`, `tests/vacuum-contract.mjs`, `tests/vacuum-ui.mjs`, updated `tests/library-cleanup-ui.mjs`, and `docs/metadata-vacuum-v1.md`. Its generated `dist` is excluded from source delivery.

For rollback, first save subsequent edits. Restore only these existing paths from the Lumi checkpoint `be6d573` or standalone base `34e6435`, and remove only the new paths listed above, then rebuild. Do not reset either repository or remove `studio-assets-v1.json` / user images. No installation, commit, push, database cleanup or physical image deletion is performed by this implementation.


## Reference connection revision — 2026-11-23

The bounded coverage audit, authenticated live feed, full-original copy decoder and physical original size reads are now implemented. See [Reference coverage, live connection and original sizes](reference-coverage.md) for setup, exact API gaps/budgets, current tests, intended files and rollback. It supersedes the earlier byte-read-only/manual-exchange limitations. Incomplete coverage continues to block eligibility; no deletion capability was added.
