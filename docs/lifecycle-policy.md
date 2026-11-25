# Metadata lifecycle policy

Current revision: independent LumiSwarm/standalone policies and explicit metadata-stage selection, described below. The earlier mandatory retention of every branch end applies only to chain mode.

Implemented 2026-11-23. Vacuum remains preview-only; no file or database deletion was added.

## Controls

Standalone Library → Tools → Vacuum preview → What to keep → Configure. Settings persist separately for each Swarm server/user/output-routing scope.

Metadata & parent chains is the default evidence policy. Lumi relay reports add positive protection and copy evidence; a missing/incomplete relay is not a global eligibility veto in this mode. The alternative Require complete Lumi coverage retains the previous stricter classifier and seven-day minimum. Neither policy treats an empty or unreadable reference registry as proof of absence.

All favorites and exclusions remain retained. Each saved branch end is a keepsake, so sibling alternatives are not discarded because another branch finished later. Known standalone project/workspace/undo/init/identity references and Lumi references protect sources. Active jobs block candidates. Files without recognized metadata remain review-only.

Selectable superseded expression stages: drafts, upscaled versions and background-removed versions. These are enabled by default. A source needs a saved child in the same pipeline/origin and an intact unambiguous lineage. All branch ends stay regardless of the stage checkbox. Cycles, missing parents, duplicate IDs/paths, batch identities, invalid timestamps and cross-pipeline parents prevent candidates. Incomplete history/scope and an incomplete standalone project audit also prevent candidates. No prompt or timestamp similarity invents an edge.

Other processing sources have separate opt-ins for upscale, inpaint and background-removal replacements, initially off. An unfavorited main generation without a replacement is manual-review-only, never a candidate just because it is unstarred. That review category is enabled by default and can be disabled to retain those outputs. The schema's actual stage name remains general_generation. Inline branch ends remain retained; chat references add protection.

Metadata-mode grace period defaults to seven days and can be configured from zero to 365 days. Use zero to inspect newly generated fixtures/jobs; it still authorizes no deletion. The stage settings act on saved outputs only and do not alter generation metadata or existing expression donotsave behavior.

## Lumi native no-save option

LumiSwarm Settings → Generation → Swarm originals → Generate without saving a Swarm original. Initially off. This merges donotsave=true into the native Swarm raw override and is carried with the existing saved generation profile. Turning it off removes that flag without dropping other raw fields. Restoring a profile restores the toggle from the raw override.

Native Swarm returns image data, which the checked Lumiverse provider accepts directly and persists through its ordinary image-generation path. Provenance records mark studio_storage=lumi_only and leave the physical Swarm path empty/unverified. No additional persistent copy is introduced. The option does not mean deleting the Lumi copy, disabling the Lumi library, or retroactively removing prior Swarm files.

Custom Comfy workflows own their save nodes. When donotsave is requested with a custom workflow, the extension reports that limitation before generation instead of claiming that a workflow will skip saving. Disable the native no-save option or change that workflow's save behavior separately. No Lumiverse core files changed.

## Verification

PASS: standalone production build and TypeScript; pure lifecycle fixtures for optional relay, incomplete reference coverage, branch keepsakes, favorites, source/stage opt-ins, cycles/collisions/missing parents, grace and main-generation review; existing strict Vacuum/lineage tests; browser policy controls/persistence and responsive UI. PASS: extension build, metadata/provider contracts including actual provider donotsave passthrough and direct data-URI acceptance, backend regressions and browser no-save label/keyboard controls. Existing extension BlobPart typecheck failure remains. Private-host no-save generation/PNG round trip and physical devices were not run.

Browser evidence is local test-results/vacuum-WIDTH.png, live-reference-WIDTH.png and lumi-no-save-WIDTH.png. It is fixture evidence, not live-file deletion validation.

## Files and rollback

Standalone: src/library/vacuum.ts, src/library/vacuum.css, src/app.ts, package.json, tests/vacuum-ui.mjs, new tests/vacuum-policy-contract.mjs, this report and links from the earlier reports. Extension: src/backend.ts, src/studio/controller.ts, required dist bundles, tests/metadata-registry-contract.mjs, tests/metadata-provider-contract.mjs, tests/reference-copies-browser.mjs, SHA256SUMS.txt and reports. Select complete-coverage mode and disable native no-save to restore the previous operating behavior without touching user data. For source rollback preserve other edits and reverse only these changes; do not reset either repository or delete projects, registries or images. No commit/push was performed.

## Independent origin policies and metadata-stage review

What to keep now has its own SVG and two independent origin panels. Each origin can use Superseded chains or Metadata stages. Switching Lumi to stages, selecting/clearing its tags or changing copy-binding protection never changes standalone choices. Legacy shared choices are inherited until an origin is changed. Every origin uses the same scoped grace/evidence settings. Complete-reference evidence mode still uses the legacy strict classifier; stage selection applies in metadata evidence mode.

Chain mode retains branch ends; metadata-stage mode explicitly includes branch ends for selected tags, with no replacement requirement. Available tags are expression_draft, expression_final, inline_illustration, general_generation, inpaint_variant, upscale_result and background_removed. Select all stages and Clear stages are scoped to their panel. Quick Create and main Studio renders currently share general_generation; inline inpaint/enhance outputs share their respective processing-stage tags. The UI does not invent route distinctions absent from saved metadata. No retroactive tagging or prompt-based grouping occurs.

The relay formerly treated all Lumi references as physical-original protection. Copy UUID references (folders, Cast, expression sets, owner bindings and inline-job records) refer to Lumi's separately stored assets and no longer blanket-protect the Swarm original in metadata mode. Protect bindings to Lumi’s stored copies is available independently for each origin, initially off. Explicit favorites, exclusions, active jobs and standalone project/workspace sources still protect. Backend audits now label explicit path matches swarm-path:<source>; these always protect. A protected claim with no classified reason also remains protected. Reload Lumi and refresh its feed to receive the new distinction. This is an explicit lifecycle policy, not proof that every persisted copy was decoded or every external dependency was inspected.

Preview candidates still require a complete scoped history walk, a complete standalone audit, unique non-batch asset/path identity and a valid age beyond the chosen grace. Chain mode additionally validates the pipeline. Stage mode does not infer a replacement from incomplete lineage: it selects an explicit tag by user policy instead. Nothing is physically deleted or removed from Lumi.

The reference connection/import/feed/checks now form the final section inside What to keep, separate from configuration expansion. Vacuum has a circle-help popover with keyboard/Escape dismissal. Configuration preserves scroll and focus when changing selections.

PASS: production builds, TypeScript standalone, policy fixtures for origin isolation, optional copy bindings, always-protected direct paths/favorites, and explicit last-output stage selection; browser select-all/clear isolation, connection placement, help and responsive layout. Existing strict and live-feed browser regressions pass. Extension metadata/provider/pairing contracts pass; existing BlobPart typecheck failure remains. Private-host preview after this revision and real devices were not tested. Evidence: standalone test-results/vacuum-origin-policy-WIDTH.png and live-reference-WIDTH.png.

Revision files: standalone src/app.ts, src/library/vacuum.ts, src/library/vacuum.css, tests/vacuum-policy-contract.mjs and tests/vacuum-ui.mjs; extension src/backend.ts, tests/metadata-registry-contract.mjs, required dist/backend.js, SHA256SUMS.txt; this report in both repositories. Source rollback must preserve all earlier uncommitted work. Select chain mode and enable copy-binding protection to restore previous operational retention. No commits or pushes.
