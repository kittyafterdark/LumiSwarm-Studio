# Model-aware inline prompting (1.1.0-alpha.6)

## Scope and current status

Continues the compiler foundation on the 1.0.53 Cast Worlds baseline, with scene-scoped Visual Lore. This release supports eight concrete dialect selections plus automatic provider/checkpoint selection. It is a prerelease, not the completed 1.1.0 milestone. The ordinary image-generation workspace retains its direct manual prompt surface; see [manual Lore](manual-lore.md) for its separate selection path. Cast and Vacuum retain their asset lifecycle. Both inline and parser completion use the same injected protocol and tagged generation pipeline; Pocket's explicit visual requests also use the compiler path.

| Settings choice | Compiled representation |
| --- | --- |
| Auto (provider + checkpoint) | Query effective checkpoint architecture; fall back to checkpoint name and then Anima. |
| Anima | Hybrid tags and native spatial language; recognize an Aesthetic checkpoint name. |
| Anima Aesthetic | Hybrid, omit standalone score tags from plan metadata. |
| Anima · Regional | Explicit opt-in experimental overlapping Swarm regions. |
| Illustrious | Existing tag-dense, strong Swarm regions. |
| MOSS · Caption | Descriptive captions; no generated regions or layout JSON. |
| MOSS · Swarm BBox | Normalized object boxes converted by Swarm. |
| MOSS · Native JSON | Complete MOSS layout with centered pixel boxes and exact-text fields. |
| Krea 2 | Descriptive captions; no generated regions. |

Manual family choices remain sticky. Auto is deliberately not the migration default. Existing Anima selection now means native language; choose Anima · Regional to recover the old regional approach. Auto asks the active Swarm connection for the exact effective checkpoint using `/API/DescribeModel`. Recognized architecture/compatibility/class metadata outranks filename hints. Generic SDXL alone does not identify Illustrious training. Unknown or inaccessible metadata falls back to filename detection. Exact model paths are checked and results are cached per user, connection and checkpoint (5 minutes for a successful lookup; short failure cache). Manual choices bypass metadata discovery. Auto selects MOSS Caption, not either layout mode. Runtime provider preset/workflow overrides may still change the effective model beyond Studio's knowledge.

## Authoring-time detection (alpha.8.1)

Auto uses the currently known recipe and provider metadata before the prompt is written, not only at final dispatch. See [Auto authoring and Anima composition](auto-authoring.md) for scope, parser slots, macro refresh, limits, and the izakaya regressions.

## Protocol and pipeline

1. The LLM supplies an owned scene plan, not model-facing pixel coordinates or JSON (layout mode permits normalized box annotations). `request="generate"`, parser mode, `output="url"`, aspect and slots retain the existing envelope. `{{swarm_dynamic_guidance}}` carries per-family guidance. Known shipped sentences in saved protocols are upgraded idempotently; genuinely custom instructions are still user-owned.
2. Extract simple native preset directives before parsing so a leading token cannot hide the first field. Parse headings, ownership, camera, environment and exact visible lettering. Do not normalize comma sequences inside a structured plan.
3. Resolve character/look/style and explicitly selected, currently eligible visual lore. Resolve effective checkpoint before selecting the dialect.
4. Enrich explicitly bound subjects (with a documented single-character legacy fallback) and selected lore fields, using family-specific lore prompts where configured. Workspace style remains global. Negative prompts, LoRAs and reference conditioning are image-wide. See [identity-binding.md](identity-binding.md) and [visual-lore.md](visual-lore.md).
5. Serialize into the selected dialect; reattach existing Swarm preset directives where compatible. Native MOSS JSON finalizes only after final dimensions are resolved, and rejects prompt-mutating directives rather than corrupting the document. The compiled prompt is what Studio submits to the provider; Swarm may subsequently expand presets, triggers or workflow inputs. The original body and selected compiler are saved separately.

The inline image context menu has **Inspect request & compiled prompt**. It shows the authored body, the compiled positive and the negative prompt as selectable text, plus compiler and lore contribution diagnostics when recorded. Edit prompt in Quick Create uses the authored body, preventing accidentally recompiling a flattened diffusion prompt. Retry with original settings also retains the recorded compiler where available; this does not freeze every live identity/recipe dependency.

## Owned plan example

See [examples/rooftop.scene.txt](examples/rooftop.scene.txt) and its generated outputs. A heading such as `right woman [persona]: ...` refers to the saved persona only if `persona="active"`. `[other]` explicitly declines binding. These are internal planner markers, never emitted as model-facing labels.

## Next checkpoint

Live Swarm/Lumiverse verification, actual layout and lettering adherence, model-quality comparisons, and investigation of genuinely subject-specific LoRA/reference support. See [moss.md](moss.md). Do not infer that a deterministic compiler test measures diffusion adherence.

## Maintenance

Registry: `src/state/prompt-families.ts` (shared in both concatenated runtime builds). Parser, binding and serializers: `src/backend.ts` (`parseImageScenePlan`, `bindSceneIdentities`, `serializeScenePlan`, `buildMossLayoutDraft`, `compileMossNativeLayout`, `compileSwarmMossBoxes`, `resolveEffectiveCompiler`, `applyCharacterLayer`). Frontend protocol examples: `src/inline/protocol.ts`. `npm run build`, `npm run typecheck`, `npm test`. The backend contract dispatches actual mocked Spindle generation requests and checks source/compiled persistence and effective model selection. No GPU is needed for those tests.

For optional grouped count weighting and caption equivalents, see [Explicit character count](explicit-count.md).
