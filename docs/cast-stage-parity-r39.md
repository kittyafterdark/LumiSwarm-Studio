# v1.0.39 Cast stage parity

The v1.0.38 native-width limits fixed the **component width** but couldn't make an entire 1160px chat message disappear. Live Cast Islands intentionally remain full-width independent message blocks so that native prose is never reparented, wrapped around art, or changed.

The remaining confirmed geometry mismatch was **internal composition drift**: Manga SFX's gallery default centered the cutout, speech plate, and SFX mark, but its saved Left/Right setting independently docked those elements inside the stage. Side selection should affect where the finished composition sits in the message, not redesign the composition.

The canonical `scripts/cast-expression-sides.css` now leaves Manga SFX internals intact and retains only the side positioning of the outer `.ss-cast-design` block. `scripts/build-cast-presets.py` embeds it into both runtimes. No other preset's geometry was changed.

### Verification

- `python tests/cast-live-stage-parity-browser.py`: actual Shadow DOM CSS and a full-width message host at 1160/760/420/320px, each stage Auto/Left/Right, native narration protected, internal image/caption offsets invariant.
- `python tests/cast-stage-geometry-browser.py`: all 34 presets × 3 sides × 3 widths (306 cases), with stronger Manga SFX side-parity assertions.
- `python tests/cast-expression-sides-browser.py`, `python tests/cast-island-remount-browser.py`, `python tests/cast-album-management-browser.py` all passed.
- `npm run build` passed. Combined strict TypeScript passed using the globally installed compiler (`STUDIO_TSC=$(command -v tsc) npm run typecheck`), because local `node_modules` is absent.

### Deliberate limitation

Side alignment across a 1160px message naturally leaves negative space. Fixing that is a distinct layout decision (such as a centered scene lane); it should not be conflated with a broken CSS cap. No full-width-message restructuring or host prose mutation was attempted in this patch.
