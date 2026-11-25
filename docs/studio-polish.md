# Studio polish (1.1.0-alpha.7 / alpha.7.1)

## Navigation and responsive surfaces

The decorative drawer is a separate screen, with its available panel height determining the entrance card height. The Visuals shortcut still switches to the existing controls page. Library uses a folder icon; Studio uses a mosaic icon. Mobile workspaces have outlined top tabs; Generate and Styles share the bottom tool navigation and the Generate/Stop control. Cast, Visuals, and Lore keep their independent layouts. The footer participates in the shell flex layout, not an absolute overlay. Workspace switches keep the existing DOM nodes and drafts intact.

Cast background dialogs use the host's `--app-scaled-viewport-width` and `--app-interactive-viewport-height` variables (with viewport-unit fallbacks) and a separate scrollable body. Desktop width is capped at 890 CSS pixels; mobile expands to the available width with a small gutter. Live Lumiverse host sizing may vary by host version/theme.

Alpha.7.1 shares the connected tab styling on desktop, with compact left-aligned tabs there and equal-width tabs on mobile. The active tab joins the actual page surface. Generate/Stop is deliberately exempt from the Buttons swatch and follows Accent; its black/white ink follows linear sRGB luminance (or native `contrast-color` where available). Older engines fall back to the existing accent ink token. Hover keeps the fill and adds an inset outline; disabled state remains intact. No generation behavior changed.

## Background generation feedback

The existing `cast_background_job` event remains the authoritative lifecycle notification. A `list_cast_background_jobs` request returns only the current user's public in-memory job states, not transient previews. Streaming provider preview data is forwarded with progress notifications; the UI accepts PNG/JPEG/WebP data URLs and keeps the last valid live preview for a rendering job. After registration, the ready event carries the owned image ID. Clients retrieve the image via the existing image endpoint. If there is no streamed preview, queued/rendering text and available steps still appear.

Studio's Generate preview has a distinct scenery strip. The widget orb shows the number of pending background jobs and a terminal check/error mark; the quick composer and easel also describe the current background status. When multiple jobs exist, the active rendering job takes priority over queued jobs. The most recent terminal result remains until a new background job or reload. Opening Studio can hydrate from the widget's in-memory activity and the backend's queue snapshot. Previously observed live events take priority over a late snapshot for the same scene. The normal illustration current image, draft, Append target, generation and cancellation state are not changed by background activity. No new job cancellation or restart recovery is introduced. The completed background asset remains in the existing Cast and Background Assets lifecycle; the background manager remains the authoritative place to manage saved scenes.

## Protocol editor

The grouped prompt-family selector retains all nine alpha.6 choices and gives contextual guidance, including Native JSON compatibility restrictions. Changing the selected family updates the setting without discarding unsaved protocol edits. Reset edits the draft; Save current applies it. Copy example still uses the chosen compiler. Macro reference remains a keyboard-operable native details element, styled with an SVG chevron rather than a native triangle. The CSS/workflow/recipe and Cast advanced disclosures also hide native markers and use chevrons.

## Verification

- `npm run build` and `STUDIO_TSC=<global typescript/bin/tsc> npm run typecheck` (local dependencies were not available in the build environment).
- Backend contract checks streamed background previews, current job snapshots and final owned image IDs in its mocked provider path. Frontend and workspace contracts retain draft and view invariants.
- `python tests/studio-polish-browser.py`: compiled frontend at 1440, 390 and 320px with mocked host/provider; all six tools, footer geometry and visibility, tab state, queue/multiple-job lifecycle, concurrent illustration controls, late snapshots, widget reopen, family selection, unsaved protocol, chevrons and simulated 75% host UI scale.
- Existing manual Lore, Cast background and drawer browser suites at the same three widths, plus floating toolkit regression.
- Six jsdom-dependent tests remain unexecuted because the dependency was unavailable in this environment; all 35 other tests from the npm test chain passed individually. Actual Lumiverse zoom/scale and Swarm streaming remain live verification items.
