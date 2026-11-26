# Provider timing investigation (.17.20–.17.21)

The .17.20 build observes the existing native provider bridge. The .17.21 build also exposes those events inside Studio. Neither changes queueing, concurrency, cancellation, retries, ownership, chat writes or preview messages. Neither performs extra provider requests or storage reads. Keep the .17.19 archive as a rollback.

## Existing live evidence

Three inline reservations took 99, 158 and 203 seconds to return their draft results. The provider returns were separated by 95 seconds each. Draft attachment followed each return within 0–1 second at console timestamp resolution. All three reservations preceded LLM completion; three later derivative IDs were attached. Serial provider work is plausible, but the .17.19 trace does not establish actual sampler start times, provider acceptance, or where a 92% display paused. Five critical memory pressure warnings occurred. This is not a diagnosis of memory exhaustion or of the local network.

## Run a controlled comparison

1. Install this diagnostic build using the normal local-extension update procedure. Do not reset saved jobs, storage or chat metadata. Restart the host normally. If you start the host in PowerShell, append `2>&1 | Tee-Object -FilePath .\lumiverse-timing.log` to your usual start command. This is an example capture path, not a claim that a log already exists. If you use a launcher, copy the backend console text into a plain text file instead.
2. Choose a small reproducible CG test in a disposable chat. Warm the checkpoint once; exclude that warm-up from comparisons. Keep checkpoint, LoRA weights, resolution, sampler/scheduler, CFG, steps, VAE, previews, references and refiner settings comparable. Disable Studio's **Auto-finalize inline images** temporarily; avoid unrelated render work. Do not change memory settings in the middle of a comparison.
3. Direct SwarmUI: run one image twice, note queue/acceptance, first sampling activity and completion times, and the reported prep/generation timing (if shown). A fixed seed is useful for the direct/manual controls. Record whether Swarm was idle or busy before each submission.
4. Manual Studio: run the same configuration twice with no LLM streaming, note the same observations. Keep the seed fixed if possible. Compare the saved output's prep/gen figures to direct Swarm. Use resolved prompt and actual settings, not merely the authored prompt, when matching workflows.
5. Inline Studio: in the disposable chat, generate a reply with one illustration; then another with two or three distinct slots. Watch the actual Swarm interface while Locket says Working or appears stuck near the end. Record whether Swarm is idle, queued, sampling, decoding/saving, or already finished. Do not assume a reservation or percentage is GPU activity. Inline generation currently forces random seed (`-1`); it cannot be strictly seed-matched without changing behavior. Use matched model/workflow/settings and repeated trials; optionally use the actual saved seed in a later direct/manual control.
6. Optional: re-enable auto-finalize and repeat the multi-image run. Its distinct derivative timings can show whether upscale dispatch overlaps draft work or waits behind it. Restore your normal preferences when done.

The direct Swarm run is a control measured by you, not a request issued by this extension or script. An exact provider-start timestamp requires Swarm/host-side evidence. Neither a progress frame nor a successfully opened async iterator proves that the GPU has started sampling.

## Collect the report

**Recommended (.17.21 and later):** Open the Studio settings gear → **Diagnostics**. The backend captures events even if Studio is closed, independent of the Lumiverse console/tray log. The live view reads incrementally every three seconds only while the tab is open; Pause stops polling, not capture. Use Refresh for the latest snapshot, then Copy trace or Save trace to export the plain text. Copy can fall back to selecting the raw trace if clipboard access is blocked. The timing table shows the most recent 12 attempts, with unknown milestones shown as dashes. The saved text works with the offline summarizer below.

Capture is volatile and account-scoped: up to 1,000 events or 512 Ki characters per account, with at most eight active capture scopes. Older events roll off; the UI reports that count. Restarting the backend/extension clears the buffer, so export before restarting. Host callbacks without an authenticated account ID remain console-only, rather than risking cross-account disclosure. This is Studio's timing/inline trace, not a general Lumiverse, vectorization, memory-pressure or Swarm server log. It contains internal identifiers and slot names but not authored prompts or preview data; inspect before sharing. Direct Swarm timings must still be observed separately.


From the extracted diagnostic source directory (Bun or Node installed; no npm dependencies required):

```powershell
bun scripts/summarize-provider-timing.mjs "C:\path\to\lumiverse-timing.log"
```

`node` can replace `bun`. Send the JSON output and your direct Swarm timings, or simply paste the relevant console lines. The report prints only run aliases, recognized stage categories, timing/count fields and outcome; no chat/message/slot/image IDs, prompts, URLs or preview bytes. The raw `[Swarm Studio inline]` and `[Swarm Studio timing]` events still contain internal identifiers for correlation. Existing general host/error logs may contain other details; inspect them before sharing. The tool is read-only and never connects to Swarm. UTF-8 and PowerShell UTF-16LE BOM files are supported. Missing timing fields are `null`, never guessed. Offsets share the first recognized event in a single clock domain; mixed-clock logs have no offsets. The script can read .17.19 logs but cannot invent missing provider timestamps.

## Timing boundaries

| Event / report field | Interpretation |
| --- | --- |
| `reserved`, `prepare-start`, `prepare-complete` | Inline admission and preparation, correlated by job and attempt ID. |
| `manual-prepare-start`, `manual-prepare-complete` | Manual profile/context/reference preparation before the shared wrapper. |
| `derivative-prepare-start`, `derivative-prepare-complete` | Source image read/encode, workflow preparation and record lookup. Parent image ties this work to the draft. |
| `metadata-start`, `metadata-ready` | Existing provenance preparation; asset ID matches the generated output's metadata. |
| `provider-dispatch` | Extension is about to call native `imageGen.generateStream` (or legacy `generate`). Does not imply a network send or Swarm acceptance; a lazy stream may initiate work on first read. |
| `provider-stream-open`, `provider-first-event` | Native iterator received; first iterator result observed. A terminal-only stream may have no intermediate events. |
| `provider-first-progress`, `provider-first-preview`, `provider-near-end` | First explicit numerical progress, first nonempty preview, and first observed progress at or above 90%. Near-end progress can refer to one node, not the entire workflow. |
| `provider-summary` | Terminal success/error/abort; first/last progress, event counts, longest completed read and event gap, largest synchronous progress forwarding call, last explicit progress to end. These are extension-boundary durations, not GPU durations. Pending reads that never return have no measured completion gap. |
| `swarm-reported-timing` | Numeric prep/gen values from already retrieved, exact-asset-matched metadata only. Absent if metadata unavailable or not in a recognized seconds format. |
| `provider-returned`, `bitmap-saved`, `attached`, `manual-result-published` | Result receipt, durable inline receipt, chat mutation, or manual send to frontend. Send return is not a browser-render acknowledgement. |

Interpret the three tests together:

- Direct and manual/inline are similarly slow: investigate provider/model/hardware first.
- Long pre-dispatch interval: investigate Studio preparation, storage and reference reads.
- Prompt dispatch but long first-progress wait: inspect provider/host queue and actual sampler activity; this duration includes prep and transport.
- Swarm already finished but Studio has not returned: inspect native stream delivery/host result persistence, including large image transfer. A 92% progress value alone proves neither decoding nor completion.
- Backend progresses while Locket does not: inspect frontend delivery and active-attempt handoff separately. `max_forward_call_s` measures only synchronous invocation, not host-to-browser delivery.
- Returned bitmap but slow attachment: use existing ownership diagnostics, without changing the generation scheduler.

## Validation

`npm run build`, `npm run typecheck`, `npm run test:provider:timing` and the existing inline ownership replay/browser fixtures. The compiled backend fixture delays the final result after 23/25 steps, tests preview-only events, validates no extra terminal read, cancellation, legacy transport, errors and failing log sinks. The existing three-draft and automatic-upscale fixtures also assert isolated attempt timing and parent IDs. The offline report tests interleaving, partial logs, old console-only timestamps, UTF-16 and redaction. These tests validate the instrumentation, not your machine's GPU performance.
