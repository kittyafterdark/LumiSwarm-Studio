# Scene-scoped Visual Lore (alpha.3)

## The contract

Native lore activation establishes eligibility; it does not establish visibility. An enabled saved visual identity can contribute only when explicitly selected in a structured tagged scene plan and still activated in the request chat at generation time. No arbitrary entry lookup or positional binding is performed. This is a deliberate change from earlier blanket injection, including raw Pocket requests. Normal manual Studio generation does not acquire automatic lore injection. Explicit manual selection is documented separately in [Manual Lore](manual-lore.md).

The inline planner receives a catalog of eligible IDs, names, types and aliases, not all saved visual prompt blocks. The catalog considers up to 128 activated IDs; the library itself is not capped at 128. Local parser placement briefs may name visible entities to help the completion model disambiguate them; the completion model receives a fresh catalog. Delimited catalogs in already expanded inline macros are refreshed by the interceptor. Generation rechecks explicitly requested IDs against native activation, independent of the planner catalog cap. Failed or unauthorized lookups do not grant eligibility.

## Example scene plan

Illustrative IDs only; use the exact markers supplied in the injected catalog. These markers are internal, not user-facing prompt syntax required by the editor.

```text
visible count: 2boys
scene: Two men study at a table. [[lore:ink-style]]
left man [other]: [[lore:ritsu]] [[lore:uniform]] reading a book.
right man [character]: taking notes.
environment: high school library, evening. [[lore:school-library]]
```

| Entity type | Allowed positive-prompt target |
| --- | --- |
| Character, creature, outfit | One visible subject's details |
| Location | Environment |
| Object | Subject details or environment |
| Style | Scene |

Unknown, disabled or inactive IDs, unsupported field placement, unavailable character/persona owners, and markers assigned to multiple different targets are rejected. Repeating an ID within the same field is deduplicated. Complete markers are removed before serialization even when rejected. A raw unstructured request cannot select lore. The model still chooses the depicted subjects; a valid but mistaken marker is possible. No heuristic guesses from a chat mention or alias are used to force injection.

## Model overrides

`swarm_studio_visuals.modelPrompts` optionally maps a resolved compiler family to `positivePrompt` and `negativePrompt`. Known families: `anima`, `anima-aesthetic`, `anima-regional`, `illustrious`, `moss`, `krea`. Each field independently selects the exact nonempty family override, then Anima base for its variants, then the shared field. Auto resolves the final recipe checkpoint before selecting the model override; existing name-based detection limitations remain. Older identities work without migration. Clear an override to inherit the shared field again.

## Recipe boundaries

Positive fragments follow the scene field. Negative prompts, LoRA weights, checkpoint, canvas aspect and reference images are not subject-isolated in the current provider pipeline. Only selected lore can propose these image-wide settings. Character recipe checkpoint, explicit aspect, existing character reference and existing recipe LoRA weights take precedence. Conflicting lore checkpoint/aspect/reference choices and conflicting lore weights for the same LoRA are skipped, not resolved by list order. Reference ID/URL are kept as a pair. Existing workspace style and normal recipe behavior remain in place. Diffusion attention may still mix traits even when text ownership is correct.

## Inspect and test

Open an inline image's **Inspect request & compiled prompt**. The lore section reports selected or skipped IDs, targets, prompt fallback source, and relevant whole-image conflicts/conditioning. Older jobs without this field report that it was not recorded. Retrying a request rechecks current eligibility, rather than freezing old native activation.

For a live smoke test, configure an enabled visual location and a visible NPC outfit in Lore. Trigger both native entries. Ask for an image in a different location, then one depicting the configured location and outfit. Compare the source request, compiled prompt and lore diagnostics. If an entry is eligible but omitted by the planner, it contributes nothing; inspect the source marker first. If a marker is present but rejected, inspect the diagnostic reason. Do not use a generated image alone to diagnose a compiler failure.

The backend contract dispatches actual mocked tagged requests and verifies provider input, absent lore across all recipe fields, owner/field placement, override selection, conflicting recipe values, deactivation, macro catalog refresh and persisted diagnostics. The browser contract exercises the actual compiled editor, including saved model overrides and failed saves. These are deterministic pipeline tests, not live provider or model-quality tests.

## Remaining work

MOSS layout modes inherit the MOSS Caption override; subject Lore is enriched before box serialization. True subject-specific LoRA/reference conditioning remains future work. The current implementation does not claim regional adapter isolation.
