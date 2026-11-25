# Reference coverage, live connection and original sizes

Current policy: [Metadata lifecycle settings](lifecycle-policy.md) supersede the earlier mandatory complete-Lumi-coverage gate. Complete-reference mode remains available; known references still protect assets. Vacuum remains preview-only.

Implemented on 2026-11-23 across LumiSwarm Studio and standalone Swarm Studio. This is a read-only reference feed and non-destructive Vacuum preview. It never deletes a Lumi record or Swarm original. Existing Lumi **Delete drafts** remains independent. No Lumiverse core changes, branch changes, commits or pushes were made for this revision.

## Connect the two Studios

1. Reload the rebuilt LumiSwarm extension and the standalone app/server so both have this revision.
2. In standalone, connect to Swarm, then open **Library → Tools → Vacuum preview → Connect LumiSwarm**.
3. Check **Studio address reachable from Lumiverse**, then choose **Create pairing code**. Use a LAN address/hostname if Lumiverse runs on a different computer. In native Studio the receiver supplies its own port. No firewall settings are changed.
4. In LumiSwarm, open **Settings → Metadata → Live references**, paste the code, verify the displayed receiver address and choose **Connect**.
5. Return to Vacuum. The feed refreshes automatically; **Check connection** checks immediately. Scan history and open **Reference checks** for per-source results. Import/export remains a fallback.
6. Filter the archive, then choose **Read matching file sizes**. This measures all matching rows, including subsequent pages, without fetching image bodies.

Lumi publishes every 60 seconds while its extension backend is running. Opening the Lumi UI restores a saved pairing. Standalone polls every 15 seconds while Vacuum is open. Feed acceptance requires generation within 120 seconds, allows at most five seconds of future clock skew and rejects replayed timestamps. Live evidence expires after 150 seconds without receipt. An offline backend, failed audit, stale feed or changed Swarm routing never becomes absence-of-reference evidence.

Receiver credentials expire after 30 days. Restarting standalone's server/native process resets the receiver and requires a new pairing. **Revoke connection** in standalone invalidates the credential immediately; **Disconnect** in Lumi stops publication and removes its saved credential. Re-pairing rotates credentials. The pairing code is a secret; it is not included in reports or logged. It is held transiently in the standalone UI and stored only in Lumi's enclave, with non-secret receiver configuration in user storage.

## Authentication and deployment boundary

Lumi uses the public `spindle.cors` backend API to POST snapshots with a random 256-bit bearer credential. The receiver binds the first accepted Lumi account and the exact Swarm server/user/output-routing tuple. It rejects another account, another publication envelope scope, stale/replayed input, malformed claims and revoked credentials. Per-asset saved scopes are retained as reference evidence even when they differ; they never establish cleanup identity. Unknown-scope claims remain explicit blockers. No Lumi login/session token goes to standalone, and standalone cannot write to Lumi through this connection.

The browser receiver is a Vite server/preview plugin. Receiver administration and snapshot reads use Studio's same-origin, HttpOnly, SameSite session cookie and origin checks. This is the existing trusted-Studio-host access boundary, not a new password login for the web app: someone who can access the Studio web host can obtain a Studio session. Preserve any deployment authentication in front of that host. A static-only deployment has no receiver; JSON import remains available.

Native Studio starts a bounded HTTP push-only receiver when pairing is requested, on an ephemeral IPv4 port. Its state/pair/revoke actions use Tauri IPC, not network administration endpoints. The listener has four workers, bounded headers/body, socket deadlines and a 20 MB body limit. It serves no image files. It currently supports HTTP addresses only; the browser receiver can use its host's HTTPS. Both ends recheck authorization after reading the body so revocation also invalidates an in-flight publication.

## Coverage audit

These are current-account, public-API reads. A successful source check means the returned fields were inspected, not that Lumiverse supplied a universal reverse-reference graph. Reports contain source labels/counts/statuses and asset claims, not full message text, generation requests, persona bodies or image bytes. Output paths can contain prompt-derived filenames.

| Source | Inspected | Exact limit or gap |
| --- | --- | --- |
| LumiSwarm library/favorites/folders/Looks | Persisted image IDs, ownership fields, folder members and visual bindings | Only returned library rows; partial library reads are reported. A deleted Lumi record remains separate from the saved Swarm original. |
| Cast and expressions | Extension-owned Cast library, expression sets/bank, persona visual presets and generation profile | Private data owned by another extension is inaccessible. Encoded/custom workflow dependencies are not interpreted. |
| Inline jobs | Persisted job references and active job state | External image consumers and jobs in other clients are inaccessible. |
| Characters/Looks | Public character listing with system/container characters requested, returned detail and gallery when APIs exist | Omitted DTO fields cannot be inspected. Missing permission/API, denial, page/time budgets are reported. |
| Personas | Public list and returned detail, plus extension-owned visual presets | Other accounts and omitted fields are inaccessible. |
| Chats, including groups | Public current-account chat list/detail; full returned messages, all returned swipes and extras | Other accounts are inaccessible. For lean-capable hosts `light=false`, `includeExtra=true`, `ownMetadataOnly=false`; otherwise the default full DTO is used. A bounded pass can be partial. |
| Standalone browser projects | Read-only IndexedDB project records, variants/earlier stages and current unsaved project | Only this browser origin/profile. Missing database is treated as empty without creating it; unknown schema/read failure blocks completeness. |
| Standalone saved projects | Recursive `Projects/Expressions` JSON in this Studio root, including takes/variants/earlier stages | Symlinks, unreadable/broken files, unknown schemas and budget limits are reported as incomplete. Other project roots and other browser profiles are outside scope. |
| Standalone live sources | Current init image, identities, expression project, Editor undo/source and inpaint sources | Rechecked for each review; external applications and already-closed unsaved sessions are outside scope. The expression bank contains image-free templates. |
| Shared Swarm root | Exact scoped paths, metadata IDs, favorites and history inventory | Public APIs cannot prove that other Lumi accounts, other clients or external files do not depend on an original. Swarm API scan completion is not filesystem completeness. |

Host API audit: at most five pages of 100 records per source, with a shared 15-second budget and two-second read deadlines. Lean message reads use 200 per page, at most 100 pages per chat. Limits or errors produce partial checks. The disk project walk is limited to 10,000 files/folders, 256 MB and 15 seconds; browser/native request waits are bounded at 20 seconds and scan cancellation stops awaiting them. Auditing does not create, rewrite or index project files. URL matching respects the Swarm origin/base path, user/output routing and Studio relay; encoded spaces/brackets resolve to the same inventory path.

`complete` deliberately remains `false` because other accounts, private extension storage, omitted fields, encoded dependencies and external clients cannot be ruled out. Those are precise access/model limits, not a reason to label the supported checks unavailable. Existing favorites/finals/grace periods/lineage/collision safeguards remain. No automatic deletion is enabled.

API evidence was inspected locally in Lumiverse `src/spindle/worker-runtime.ts`, `worker-host.ts`, `worker-host-content-api.ts` and their chat/gallery tests. The image service's authenticated `/api/v1/images/<id>` route returns the original when no size query is supplied. Core source was read only.

## Usable Lumi copies

The backend byte-reads at most 25 persisted originals within 15 seconds and records byte counts/dimensions. That alone leaves `usableCopyVerified=false`.

When the Lumi frontend is available, it fetches the authenticated same-origin original image route, rejects redirects, checks the actual byte count and uses the browser image decoder. Positive dimensions must match known library dimensions, with a 36-megapixel ceiling. Only a matching account/request/asset/image proof can update a publication to `decoded-original`. Publication waits at most 14 seconds; the frontend budgets 12 images, 12 seconds, 50 MB per image and 96 MB total. Buffers/object URLs are released; no new persistent image copies are created. A missing frontend or exceeded budget leaves byte-only/unverified claims. Manual export also uses the original decoder.

This is evidence of current usability, not an assertion that all copies were checked or that the original's embedded metadata is redundant. Full reference coverage remains a separate gate.

## Original file sizes

Sizes come from HEAD against each exact, scoped Swarm image route using the existing Swarm authentication. Only successful image responses with an unencoded safe integer Content-Length count. Redirects, missing headers, non-images, errors and unsupported HEAD stay unknown; there is no GET fallback. Four requests run concurrently with eight-second request deadlines, cancellation and scope-change rejection. Candidate totals count only eligible rows; measured archive totals and unknown counts are shown separately. Lumi copy byte counts are never substituted for physical Swarm original size.

## Validation and evidence

PASS: both production builds; standalone TypeScript and full preflight; existing Vacuum and lifecycle pure/browser regressions; reference service tests for account/scope/freshness/replay/revocation, read-only recursive projects and encoded paths; native Rust receiver tests including an actual local HTTP exchange; extension backend, metadata/provider and pairing contracts.

PASS: fixture-backed Edge browser flows at 1440, 782, 390 and 320 px widths for the real authenticated feed without imports, saved-project protection, audit display, HEAD sizes, revocation and overflow. Extension browser tests cover original decoding, corruption, byte mismatch, redirects, host UUID capability, pairing, Escape and mobile layout. Screenshots are local `test-results/live-reference-WIDTH.png` and `test-results/lumi-reference-link-WIDTH.png`, excluded from source delivery.

Existing FAIL: extension typecheck still reports the previously reproduced BlobPart incompatibility in `src/studio/expressions.ts:60`; no new errors remain. The full extension suite has an existing outdated frontend style-registration assertion. These are not reported as passing.

NOT RUN: pairing against the user's installed private Lumiverse/Swarm runtime, installed native UI and real mobile devices. Attempts to HEAD the supplied live Swarm file could not connect to the server, so live server HEAD support is unverified. Fixture HTTP exchanges and native receiver tests are not a substitute for that check. The user previously supplied embedded metadata proving generation/upscale/background-removal lineage; no new image generation or deletion was performed here.

Run `npm run test:references` and `npm run test:references-ui` in either repository. Standalone browser tests accept `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_CHANNEL`; this workstation uses LumiSwarm's Playwright installation and headless Edge. Run native tests with `cargo test --offline --lib lumi_bridge::tests` in `src-tauri`.

## Revision files and rollback

Extension changes: `src/backend.ts`, `src/host/setup.ts`, new `src/host/reference-copies.ts`, `src/studio/controller.ts`, `src/studio/styles.ts`, `scripts/frontend-sources.mjs`, `package.json`, `tests/metadata-registry-contract.mjs`, new `tests/reference-link-contract.mjs` and `tests/reference-copies-browser.mjs`, both metadata/reference reports, `SHA256SUMS.txt` and required `dist/backend.js` / `dist/frontend.js`.

Standalone changes: `src/app.ts`, `src/library/vacuum.ts`, `src/library/vacuum.css`, new `src/library/{file-size,local-references,reference-connection}.ts`, `src/swarm/client.ts`, `src/runtime/index.ts`, `src/expressions/studio.ts`, `src/expressions/editor.ts`, `scripts/expression-projects.mjs`, new `scripts/lumi-bridge.mjs`, `vite.config.ts`, `src-tauri/{Cargo.toml,Cargo.lock,src/lib.rs}`, new `src-tauri/src/lumi_bridge.rs`, `package.json`, `tests/vacuum-ui.mjs`, new `tests/reference-services-contract.mjs` and `tests/reference-live-ui.mjs`, both metadata/reference reports. Generated standalone dist and test evidence remain excluded.

To disable the feature, revoke in standalone and disconnect in Lumi; manual snapshots still work. Before source rollback, preserve all existing edits. Revert only this revision's changes, remove only its new files, and rebuild. Do not reset either repository to its original base: earlier uncommitted metadata, Vacuum and version-review work must be retained. Do not remove user projects, asset ledgers, generation records or images. Lumi's earlier local preservation checkpoint remains `be6d573`; this revision was not committed or pushed.

## Metadata settings placement

Reference controls now live in Settings → Metadata under Studio references. History retains its output refresh control. Studio references and Metadata debug each have a circle-help button with a themed popover, keyboard activation, outside-click dismissal and Escape that preserves the settings panel. Browser checks at 782, 390 and 320 px passed, including opening the pairing dialog from Metadata. Extension build passed; the existing BlobPart typecheck failure remains. This UI revision changes controller/styles, the required frontend bundle, reference browser test, setup wording and integrity entries. Restore only these UI edits after preserving subsequent work to undo the placement change.

## Pairing API and dialog correction

Corrected the reference credential write to the actual public spindle.enclave.put(key, value, userId) API; set does not exist. The previous mock incorrectly exposed set too. Existing metadata-token code and the checked Lumiverse worker runtime both use put. Being behind on core commits does not explain this invalid call. Explicit fixed positioning, inset and automatic margins now center the connection dialog under host resets. Build, corrected pairing contracts and real-browser tests at 782/390/320 passed, including centering with global/dialog margin resets. Installed private-host pairing remains unverified. Changes: backend/styles, required bundles, both reference tests, this report and checksums; rollback only these corrections after preserving later work.

## Preserve claims across connection-address differences

Removed a publication filter that silently discarded registered assets whose saved scope differed from the receiver scope. Lumi using a Tailscale hostname while standalone uses loopback produced this mismatch. The feed now preserves each claim’s original scope, reports registered/matching/unknown/conflicting counts and saved scopes under Reference checks → Swarm connection scope, and shows a specific connection-conflict reason for matching unreferenced assets. Known references still conservatively protect originals; a mismatch never becomes permission to delete or an automatic server-alias mapping.

Use the same Swarm URL, user and output routing in both Studios and create a new pairing code. The receiver-address field is independent of the Swarm server URL. Existing ledger entries are not rewritten; assets from older scopes remain explicit conflicts until separately verified. No expressions need regeneration to preserve the existing claims.

PASS: builds, publisher test with mixed saved scopes, authenticated Node receiver retention, conservative scope-conflict/reference tests and native receiver tests. NOT RUN: private-host live re-pairing. Revision files: extension backend, required backend bundle, reference-link contract, this report and checksums; standalone vacuum classifier, Node/native receivers, reference-service and Vacuum contracts, this report. Roll back only this revision after preserving other uncommitted work.

## Diagnose live/manual count divergence

Manual export containing claims while the receiver reports zero is not proof of a current URL mismatch. The live path now reports its last successfully published count in Lumi, reports rejected counts and HTTP status, and refuses to publish an empty success when Spindle getJson returns its fallback for an unreadable/missing asset registry. A valid empty registry is still representable. No registry, saved scope or reference is rewritten. Standalone keeps a newer manual snapshot instead of replacing it with older live state. The live-only failure on the installed private host remains unconfirmed; compare Lumi Refresh now status and the receiver scope-audit row. Regression contracts cover rejected publication, missing registry and preservation of a newer 18-claim import.

Changes: extension backend/controller, required bundles, reference-link contract and checksums; standalone app and live-reference UI test; both reports. Prior BlobPart typecheck failure remains. Roll back only these diagnostics/freshness guards after preserving other work; do not remove images or ledgers. No commits/pushes/deletions.
