# Cast Material Edition · per-style palette fitting (v1.0.48)

The 12 redesigned materials remain individually composed. The color recipe is
**not** a single shared tint factor: each material declares its own
`--m-surface-top` and `--m-surface-bottom` inside the canonical
`scripts/cast-material-redesign.css`. Where a quote lies on a separate inset,
that inset uses its own `--m-quote-top` and `--m-quote-bottom`.

| Material | Surface rationale | Top speaker tint | Inner text area |
| --- | --- | ---: | --- |
| VN Hero Stage | near-black lacquer, subtle scene light | 11% | dark lacquer toward 3% tint |
| Corner Pop-Out | folded ink note with lighter paper edge | 15% | 9% to 4% ink |
| Angled Cutout | angular charcoal, sharp right taper | 14% | 8% into black |
| VN Standee | restrained scenic wash | 12% | 7% to black dialogue plate |
| Tech Messenger | rich chat thread, warmer than VN | 12% | 11% to 5% thread |
| Agency Lanyard | cream laminate, not a dark card | 5% | dark 12% inset caption |
| Cyber Comms | deep green-black monitor surface | 10% | near-black monitor |
| 16-Bit RPG | midnight pixel frame | 9% | dark pixel well |
| Gothic Folio | warm ivory vellum | 4% | dark 10% ink inset |
| Mecha HUD | graphite armor, not gray-pink plate | 8% | dark metallic footer |
| Terminal Console | green-black phosphor shell | 4% | terminal-black surface |
| Cinematic Bleed | near-black matte with restrained rim | 15% | black fade across scene |

These values are intentionally *style-specific*, not a theme-neutral global
CSS filter. Speaker accents remain recognizable on frames and small marks;
the underlying dialogue color is still the authored color from the trusted
Cast caption. The soft-surface mix doesn't rewrite the dialogue text.

## Validation and screenshots

- `python tests/cast-material-tint-v48-browser.py`: 72 cases, 12 layouts ×
  3 voice colors × 2 widths (320px, 760px). Worst sampled text/surface-endpoint
  contrast: **4.84:1**. The measured colors were pink `#ed7ca8`, blue
  `#599ce3`, and orange `#ffae35`. The contrast check uses CSS computed values
  and does not claim universal contrast for arbitrary custom colors.
- `python tests/cast-material-edition-browser.py`: 216 scenarios, including
  stage sides and author colors, one image and one caption per presentation.
- `python tests/cast-stage-geometry-browser.py`: 306 gallery/side/width cases,
  long quote containment and next-paragraph flow.
- `python tests/cast-island-api-browser.py`: live-style Shadow DOM slots,
  streaming and picker smoke test.
- [Three voice colors](screenshots/cast-material-three-voices-v48.png)
- [Current 12-up material contact sheet](screenshots/cast-material-edition-current.png)
- [Original v1.0.46 contact sheet](screenshots/cast-material-edition-v46.png)

No Cast Islands parser, lifecycle, schema, crop or model-workflow changes.
