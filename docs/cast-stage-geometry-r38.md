# Cast wardrobe stage geometry audit · v1.0.38

## Diagnosis

The Studio presentation gallery previously fitted all previews into a **560px native stage**, scaling the entire stage uniformly. Live Cast expression islands were rendered at full size. Some looks were designed for compact panels and used child alignment rules that separated artwork from caption when the stage grew. Manga SFX was the clearest failure: Auto centered the image and card, while Left/Right docked the figure and caption toward opposite edges.

## Correction

All 34 named presets now have a canonical `CAST_PRESENTATION_STAGE_WIDTHS` dimension used by both the chat renderer and gallery fitting logic. The three approved Atelier designs and the full cinematic cutscene retain 560px stages. Other looks use per-preset widths between 420px and 550px. The original templates, dialogue color handling and image crops remain unchanged. `scripts/build-cast-presets.py` generates the runtime mapping and CSS, while `scripts/cast-expression-sides.css` owns presentation-side behavior.

Manga SFX has a 420px stage, with aligned/overlapping figure and card for Auto/Left/Right. The `?!` decoration follows the selected side of the figure. The caption remains native-sized, not thumbnail-upscaled.

## Evidence and verification

- Real Chromium screenshot: `docs/screenshots/cast-stage-geometry-manga-sfx.png` (three side variants)
- Browser geometry matrix: `tests/cast-stage-geometry-browser.py`, **306 layout/side/width scenarios**, including mobile long speech and following prose
- Persistence and existing Cast Islands: `tests/cast-album-management-browser.py`, `tests/cast-expression-sides-browser.py`, `tests/cast-island-remount-browser.py`
- TypeScript and compiled frontend/backend succeeded. Core Cast Node tests succeeded. Full test chain stopped at the absent environment `jsdom` package, not at a Cast assertion.

## Limitations

These are browser-tested mock Lumiverse message widths, not screenshots from the user's installed chat theme. Preset width caps intentionally differ by composition; truly cinematic/full-width pieces are not forced into a compact card. No modification was made to Cast's streaming parser or native narrative DOM placement.
