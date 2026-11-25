# Explicit character count reinforcement (1.1.0-alpha.8.2)

Optional tagged image attribute: `count="2boys, 1girl"`. The attribute describes only visible characters, not everyone present in the story. Use quoted, unweighted Booru count tags (`1boy`, `2boys`, `1girl`, `2girls`, `1other`, etc.), one tag per category, at most 20 total. The parser preserves the original attribute and must match its authored subject sections to it. No additional sidecar call is needed.

In Studio settings > Generation > Prompt composition, Explicit character count defaults to 1.5×. Choose Off, Unweighted, or a listed weight. Without the attribute, generation is unchanged.

Anima and Illustrious replace equivalent global unweighted count tags with one grouped weight, e.g. `(2boys, 1girl:1.5)`. Existing authored count weights are not multiplied or overwritten. Conflicting count tags, mismatched structured actor totals, unrecoverable invalid attributes, unknown Auto dialects and raw structured prompts are skipped with diagnostics. Subject descriptions and explicit visible-text fields are not rewritten. The helper does not enable regional conditioning or invent actor classifications. MOSS and Krea use a plain-language count; native MOSS layouts receive it in the summary caption before JSON serialization, not as a JSON prefix.

The inspector records applied or skipped reinforcement. Original-settings retry uses the current count strength preference. Weights are experimental; actual subject count and identity separation depend on the model. Compare identical seeds/settings with enhancement disabled first.

Backend contract tests cover direct provider dispatch, parser attribute preservation, count conflicts, weights, actor isolation, caption and native JSON. Studio polish browser fixtures cover the setting and unsaved protocol preservation.

Alpha.9.1: an invalid, unweighted opt-in attribute can be recovered from the structured body only if its exact Booru count agrees with every explicitly classified actor heading. Missing attributes remain opt-out; valid conflicting attributes and deliberate weights are never overridden. The inspector reports recovery. Prefer focused one/two-person shots, necessary trios, and larger ensembles only when the picture needs them. Distinct depth anchors can disambiguate repeated horizontal anchors.
