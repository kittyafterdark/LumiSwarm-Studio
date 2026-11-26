# Inline reservation and ownership validation (.17.17)

## Invariants

- One automatic provider draft per reserved generation and slot. Native callbacks and token-stream callbacks can refer to the same reservation under different provisional message IDs. An unscoped callback that conflicts with an unresolved packet is deferred, not interpreted as a second request.
- New non-streaming requests require one matching raw packet on the specified saved assistant message/swipe. No global search remaps an unproved message ID to unrelated chat history.
- A terminal snapshot is evidence until a canonical read proves the owner. Unverified snapshots may be corrected; a verified owner is immutable. ID-only backend terminal events must identify a saved message with exactly one matching packet on a unique swipe. Renderer-only ID-less inference requires an ended contiguous/full stream and exactly one newly visible matching reply, or a demonstrably changed target swipe.
- A ready bitmap may retry attachment, not rendering. Unresolved reservations survive the former history limit and backend restart. A verified sibling can recover another slot after its original full reply was modified by image attachment. Removed generation receipts prevent replaying a removed image. Genuine distinct generations/swipes/slots remain independent.
- Gallery refresh never starts generation; auto-upscale remains after draft attachment. Automatic chat status ribbons stay hidden. Manual approval and genuine recovery controls are unchanged.

## Regressions

Run `npm run build`, `npm run typecheck`, `node tests/backend-contract.mjs`, `npm run test:inline:stream`, and `npm run test:inline:ownership`. The latter uses the mocked host/provider and compiled frontend to replay both the original .17.16 event trace and updated browser-captured traces. Provider call count, saved image ID, native mutations, selected swipe and attachment owner are asserted. The original investigation cases are not weakened into “no image ever attaches”: ambiguous cases must retain the first bitmap and attach it after correct terminal evidence arrives. Other fixtures cover running legacy adoption, backend restart, durable sibling ownership, stale terminal snapshots, missing source, initial swipe zero, history retention, independent turns, removal receipts and native terminal precedence.

Python Playwright and Chromium are needed for the browser tests. Set `CHROMIUM_PATH` if Chromium is not at the default path. No live provider or real chat is used. Test trace IDs and prompts are synthetic.

## Live diagnostics

Filter Lumiverse's backend/extension logs for `Swarm Studio inline` (e.g. `rg -F "Swarm Studio inline" <logfile>`). Events are `reserved`, `generation-adopted`, `reused`, `deferred`, `bitmap-saved`, `owner-verified`, and `attached`. They carry reservation/job, attempt, generation, chat/message, slot and swipe IDs where known, plus saved image IDs and deferral reasons. They contain no narrative content, prompt bodies, or bitmap data. Chat and message IDs may be redacted consistently when sharing logs. Compare `bitmap-saved` and `attached` events by job ID; an upscale is a derivative rather than another draft.

## Migration and limitations

Existing `tagged-image-jobs.json` is retained. Its rows are now durable admission receipts rather than a capped history list; storage can grow until a safe receipt-compaction policy exists. `tagged-removed-receipts.json` holds compact removal receipts. Neither file is reset or silently pruned by this update. Previously evicted/deleted rows from older versions cannot be reconstructed automatically, and historical duplicate gallery assets are not deleted or reassigned. In-memory unverified terminal candidates are bounded and need new evidence after a restart; persisted verified ownership and job/bitmap receipts survive. If ownership remains ambiguous because the host never supplies enough evidence, the bitmap is retained rather than re-rendered or attached to a guessed source. Legacy hosts without generation IDs can be conservatively deferred on matching unresolved packets. The optional automatic upscale is still not replayed on delayed attachment-only recovery after the worker has exited. Live Lumiverse/SwarmUI verification is required.
