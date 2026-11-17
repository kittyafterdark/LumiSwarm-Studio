# Floating toolkit + artwork easel (v26)

This is the real extension integration of the v2 interface study, not a new demo backend.

- The original satin Locket is unchanged: click to open/close the toolkit, right-click/long press for its original four-option menu. Mobile Quick Create still uses the existing opt-in setting.
- The rail offers Quick Create (single prompt composer), Full Studio, optional Preview, Recent Images (opens Studio's real Output Library), Append, and More. No redundant Compose/Quick Create button.
- Quick Create is detached into a slender portal beside the rail; it inherits prompts/model/recipe and uses the existing generate/interrupt actions. Hiding its negative prompt shrinks that panel rather than enlarging/shrinking Lumi's native float.
- Preview is a second portal; it displays the actual last preview frame or output (contained, never cropped), real step progress if available, and append/gallery/generate/stop actions. If the provider sends no intermediate preview frames it shows the latest available image until final output is returned: there is deliberately no fake baking animation.
- Drag the easel by its header, resize from the lower-right corner. The layout persists in the browser's local storage (`swarm-studio-easel-layout-v1`). Collapsing the locket closes Preview; reopening the rail does not force Preview open. On narrow mobile screens, Quick Create temporarily hides Preview to avoid overlapping panels.
- Context menu, mobile opt-in, orb progress ring, and backend event protocol remain intact. Both new portals are removed on extension teardown and hide during full Studio navigation.

## Tests

Run `npm ci`, `npm run build`, `npm run typecheck`, `npm test`. On a machine with Python Playwright and Chromium, run `python tests/v26-floating-easel-browser.py`, `python tests/v21-quick-composer-browser.py` and `python tests/v22-satin-locket-browser.py`.

The v26 browser test exercises 320/390/900/1440px views, actual mocked backend generation, synced orb/easel output, resizing, Quick Create state preservation, Full Studio and Output Library navigation, and overlapping mobile panel prevention. It is not a live SwarmUI service or Lumiverse-host acceptance test; verify real provider preview cadence and native host stacking in the installed app.
