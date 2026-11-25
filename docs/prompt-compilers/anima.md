# Anima

## Upstream conventions

The [CircleStone Labs model card](https://huggingface.co/circlestone-labs/Anima) describes a hybrid of Booru tags and descriptive captions. Ordinary tags use lowercase and spaces; preserve the underscore in score tags. Prefer Gelbooru's vocabulary in conflicting cases. Put metadata before count and character/series/artist/general tags in a tag-heavy prompt. Artist tags use `@`. Describe visible traits even when a known character is named; prose uses ordinary capitalization. Use established canonical name order (often surname first for Japanese character tags), not a mechanical name reversal. The `ye-pop` and `deviantart` dataset markers are optional first-line style routes.

Base accepts optional score metadata. Aesthetic was trained without quality tags and upstream discourages `score_*` on both sides. Studio drops standalone score tokens from structured Aesthetic **positive metadata**, not from a saved negative recipe or deliberately authored raw prompt; review those recipes separately. Turbo uses the native hybrid compiler; no sampling settings are changed by this feature.

## Studio decisions

Native spatial headings (`Left:`, `Right:`, `Center:`) are a readable convention, not a special Anima parser instruction. Describe appearance and action locally and use separate overall framing/environment. Optional experimental regions remain available as Anima · Regional. Studio escapes simple literal parenthetical qualifiers in saved character/persona base tags, leaving existing escapes and numeric weights alone. Explicit trained trigger spelling is preserved; avoid bulk underscore/case rewriting of mixed prose or LoRA tokens. The LLM is instructed to escape qualifiers in its authored tags; Studio cannot verify every canonical name or artist spelling.

No claim that native language always outperforms Swarm regions. Compare with identical seed/model/recipe where possible.
