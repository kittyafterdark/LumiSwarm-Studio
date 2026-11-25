# Cast Genesis (1.1.0-alpha.8)

Genesis is an opt-in production orchestrator inside an existing Cast album. It does not add a new top-level workspace, temporary members, a second image generator, or a message-writing operation.

## Setup

1. Create or open the desired Cast album and use it in the current chat. Enable Cast prompt injection.
2. Choose the text sidecar connection and optional model in Studio's Protocol Prompt settings (the existing parser connection; a local OpenAI-compatible model is fine). If no connection is selected, Genesis uses the available default text connection. An explicitly selected but unavailable connection fails rather than silently switching providers.
3. Configure the Swarm connection/checkpoint and expression generation settings. The saved expression set supplies the portrait composition prefix, negative prompt and per-expression directions. A named render style supplies its recipe, style fragments and saved adapter stack. Ordinary live illustration prompts and arbitrary live character/persona adapters are not inherited. Existing member identities and explicitly bound member folders retain priority. A unique matching, activated Character or Creature Visual Lore identity can contribute its family-specific description, negative prompt, checkpoint, stack. A missing or ambiguous lore match is not guessed.
4. Open **Cast > Genesis**, enable automatic creation and save the album preferences. Choose Basics (6 expressions) or Full spread (20), Normal or Do not save, automatic or review-first, and a per-reply character limit (1–3). Defaults: disabled, Basics, Do not save, automatic approval, prompt only, one member.
5. Ensure Swarm's built-in BiRefNet background-removal workflow can run. If an enhancement workflow/model is configured for the connection, Genesis uses it. Genesis defaults to prompt-only. For compatible Anima models, optionally choose **Anima Ref · anchor to Neutral** in Genesis settings. Manual expression workflows retain their existing reference controls.

## Packet protocol

```xml
<swarm-cast=mina flag=create type=basics-pipeline expression=joy background=late-kitchen><font color="#ffc0cb">"You two are hopeless."</font></swarm-cast>
```

The only required new attribute is `flag=create`. `type=basics-pipeline` or `type=full-pipeline` is a hint for the text model; the saved user choice always determines actual production size. `expression=joy` and `background=late-kitchen` are optional. The key is a stable, case-insensitive prefix within the album. Ordinary expression keys and previously established members should continue to be used normally. A matching existing populated member does not generate another pack; an empty member retains its ID and saved identity. A new member receives a stable ID after design approval. Genesis does not attempt fuzzy name matching across different prefixes.

Completed assistant replies are validated against persisted message/swipe content, the active album, injection and explicit opt-in. Fenced code, escaped creation tags, user messages and repeated source events cannot launch jobs. The initial dialogue remains readable without artwork. Once a neutral/default image is registered, the renderer can use it; when the explicitly requested expression is ready, it takes precedence (unless the user has a card-specific expression correction). No source XML is rewritten. The same Cast hydration machinery and stable per-card identity are used by historical replies.

## Production and retention

The backend runs a serialized Genesis queue per user. It snapshots the verified story context (up to six short messages), resolves the design using the configured sidecar, and discards that context once the design is saved. The sidecar returns only `name` and `identityPrompt`. From alpha.9.4, default design guidance asks for one coherent, precisely described outfit and a brief character-specific expressive temperament (e.g. restrained expressions, composed body language, or bubbly expressions, expressive posing). Fixed emotions, facial expressions, poses and gestures remain the responsibility of the individual expression direction. Album extra instructions can refine this guidance; saved identities and already-designed jobs are not rewritten. It is skipped for a saved member identity. The base prompt and selected expression directions are reused throughout. The existing backend expression functions render each slot, optionally upscale, then remove the background. The final image must be available as a user-owned Lumi asset before registration. Completed slots are published immediately, never overwrite manually filled slots, and survive failure/cancellation.

| Mode | Swarm native draft | Custom processing workflow outputs | Final Lumi assets |
| --- | --- | --- | --- |
| Normal | Standard retention | Existing workflow behavior | Permanent |
| Do not save | `donotsave: true` for supported native renders | Existing workflow behavior; Swarm copies may remain | Permanent |

Both modes remove eligible Lumi drafts and enhancements after the corresponding final is registered. Cleanup checks Genesis provenance, ownership, folder/Cast bindings and the existing host reference audit. Referenced or unverifiable assets may remain; cleanup errors are shown in the production desk. There is no automatic deletion of external Swarm files. The immutable registry retains lineage for Vacuum. Pending job references are included in the reference snapshot. The original reference image and final image are never targets of intermediate cleanup.

Custom workflows do not universally honor native Swarm `donotsave`, and this release does not modify those workflows to suppress external files. The automated background-removal stage uses the built-in BiRefNet graph, not an arbitrary custom graph selected in an open browser workshop.

## Production desk and recovery

The Cast-local Genesis dialog lists the durable job records, proposed design (review mode), current stage, expression count, approval, stop, resume and direct member access. Review gates image production; approving a design persists approval for later retries. Resume retries missing stages/slots, reusing available owned drafts or enhancements. Restarted extension jobs show Interrupted and require explicit Resume. No historical replay silently restarts GPU work. Disabling Genesis prevents subsequent work/registration; any already dispatched provider pass may finish and retain its result in the Output Library. Deleting/renaming the original member or removing the album prevents automatic resurrection. The production budget allows at most six active/review jobs per user and up to 500 durable receipts; these limits fail closed rather than discarding replay protection. Jobs use a recipe snapshot after design resolution; a later settings change does not silently alter an already approved design.

Genesis activity shares the existing nonblocking background activity indicator in Studio and the floating widget, without replacing the ordinary artwork, Append target, or cancellation target. Real provider progress and visual consistency depend on the configured provider. No new host permissions are introduced.

## Regression coverage

- `tests/backend-contract.mjs`: persisted completed reply, disabled mode, empty-album injection, 6/20-slot production budgets, sidecar and existing identity, named style isolation, native no-save, optional configured enhancement, owned final registration, intermediate deletion, historical replay, review, failure and partial retry.
- `tests/cast-genesis-browser.py`: real compiled workspace and narrative renderer using mocked transport, settings, review/approval, progressive neutral-to-requested-expression hydration, nonblocking job activity, responsive dialog at 1440/390/320px.
- Existing Cast background and Studio polish browser regressions.

Live Lumiverse/Swarm execution, installed BiRefNet compatibility, actual GPU image quality, physical touch and extension restart recovery on the installed host still require integration verification.

## Operator-scoped sidecar compatibility (alpha.8.2)

The quiet-generation request explicitly carries the authenticated job owner's `userId` in its input, in addition to the existing positional scope argument. The ordinary parser uses the same handoff. The scope is taken from the trusted backend context, never from the creation packet or sidecar response. Sidecar errors are prefixed `Genesis design sidecar:`. Existing failed jobs can be resumed without reissuing their creation packet. The mocked worker requires explicit input and positional scope and exercises resume of the same job after a simulated operator-scoping rejection. The installed worker SDK could not be verified directly; this compatibility fix requires a live Resume check.


## Prompt-only and image geometry recovery (alpha.8.3)

Alpha.8.3 originally disabled automatic image-reference conditioning. Legacy neutral-reference preferences continue to normalize to prompt-only; the new explicit `anima-neutral` preference introduced in alpha.9.2 is described below. The processing stage still needs the owned draft image for enhancement and background removal. It reads its encoded PNG/JPEG/WebP header dimensions when available, with host metadata as the legacy fallback. Missing host dimensions no longer block valid encoded images; invalid or oversized sources still fail. Errors name the expression and stage. Resume can reuse a saved draft without repeating the design sidecar or generation.
## Live member Expressions (alpha.8.4)

Open the reserved member while Genesis works. The planned expression bank is shown in order, including queued slots and the current rendering, enhancement or removal stage. Sampling progress is shown when supplied by the provider; only registered finals replace placeholders. Stop and Resume use the same durable production job. The grid and completed image elements remain mounted across progress ticks. Visiting an album no longer writes the shared library: recent sorting tracks visits in the workspace session, and pre-existing saved timestamps remain as fallback. Actual conflicting edits still require a reload rather than overwriting newly generated assets.

## Anima Ref consistency (alpha.9.2)

Enable **Expression consistency → Anima Ref · anchor to Neutral** in the album Genesis settings before a new job. Neutral always renders from the saved identity prompt without a reference; all later slots in an Anima job use the same registered final Neutral image, including on Resume. A missing anchor fails safely rather than silently switching the identity. The adapter must be installed and compatible; non-Anima families fall back to prompt-only with a warning. Existing jobs retain their captured preferences; old neutral-reference settings do not automatically opt in. The native no-save flag is not forwarded into custom reference graphs; final Lumi outputs are retained and eligible intermediate Lumi copies are cleaned as before. Actual visual consistency and adapter compatibility require a live render.
