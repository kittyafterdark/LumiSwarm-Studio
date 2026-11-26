const STYLES = `

/* Swarm Studio | authored surface v6.
   Replaces the original Studio cascade. One definition per component; no appended override stratum.
   Auxiliary launcher, inline-image and mini-player components are isolated below. */
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) {
  --ss-canvas-bg: var(--lumiverse-bg, #111218);
  --ss-surface-base: var(--lumiverse-surface, var(--lumiverse-fill, #1c1d26));
  --ss-panel-bg: var(--ss-surface-base);
  --ss-header-bg: var(--ss-surface-raised, var(--lumiverse-surface-raised, var(--lumiverse-fill-subtle, #1a1b24)));
  --ss-outline: var(--lumiverse-border, #363744);
  --ss-text: var(--lumiverse-text, #f0edf8);
  --ss-muted: var(--lumiverse-text-muted, #b6b1c5);
  --ss-dim: var(--lumiverse-text-dim, var(--ss-muted));
  --ss-accent: var(--lumiverse-accent, var(--lumiverse-primary, #c1b0f5));
  --ss-violet: var(--ss-accent);
  --ss-accent-ink: var(--lumiverse-accent-contrast, var(--lumiverse-accent-text, #16121d));
  --ss-primary-bg: var(--ss-accent);
  --ss-primary-ink: var(--ss-accent-ink);
  --ss-button-ink: var(--ss-text);
  --ss-primary-hover: color-mix(in srgb, var(--ss-primary-bg) 87%, var(--ss-panel-bg));
  --ss-accent-soft: color-mix(in srgb, var(--ss-accent) 15%, var(--ss-panel-bg));
  --ss-accent-line: color-mix(in srgb, var(--ss-accent) 47%, var(--ss-outline));
  --ss-button-bg: color-mix(in srgb, var(--ss-panel-bg) 87%, var(--ss-text));
  --ss-button-hover: color-mix(in srgb, var(--ss-button-bg) 86%, var(--ss-text));
  --ss-border-subtle: color-mix(in srgb, var(--ss-outline) 76%, transparent);
  --ss-field-bg: color-mix(in srgb, var(--ss-surface-field-base, var(--ss-canvas-bg)) 94%, var(--ss-text));
  --ss-panel-hi: color-mix(in srgb, var(--ss-panel-bg) 94%, var(--ss-text));
  --ss-control-radius: 9px;
  --ss-panel-radius: 13px;
  --ss-slider-radius: 999px;
  --ss-backdrop-blur: 12px;
}
.ss-shell {
  --ss-generation-width: 358px;
  --ss-history-width: 268px;
  --ss-prompt-height: 210px;
  --ss-styles-editor-width: 340px;
  --ss-styles-stack-width: 310px;
  --ss-dock-height: 280px;
  --studio-safe-top: var(--app-interactive-safe-top, env(safe-area-inset-top, 0px));
  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  width: 100%;
  height: min(1100px, calc(var(--app-interactive-viewport-height, var(--app-scaled-viewport-height, 100dvh)) - 96px));
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  background: var(--ss-canvas-bg);
  color: var(--ss-text);
  font: 12px/1.45 Inter, 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif;
  letter-spacing: normal;
  -webkit-font-smoothing: antialiased;
}
.ss-shell[data-surface-mode='neutral'] {
  --ss-panel-bg: oklch(from var(--lumiverse-surface, var(--lumiverse-fill, #1c1d26)) l 0 h);
  --ss-header-bg: oklch(from var(--lumiverse-surface-raised, var(--lumiverse-fill-subtle, #1a1b24)) l 0 h);
  --ss-panel-hi: oklch(from color-mix(in srgb, var(--ss-panel-bg) 94%, var(--ss-text)) l 0 h);
  --ss-button-bg: oklch(from color-mix(in srgb, var(--ss-panel-bg) 87%, var(--ss-text)) l 0 h);
  --ss-field-bg: oklch(from color-mix(in srgb, var(--ss-canvas-bg) 94%, var(--ss-text)) l 0 h);
}
/* Ink mode deliberately flattens the internal fills; outlines and active accents remain visible. */
.ss-shell[data-surface-mode='flat'] {
  --ss-panel-bg: var(--ss-canvas-bg);
  --ss-header-bg: var(--ss-canvas-bg);
  --ss-panel-hi: var(--ss-canvas-bg);
  --ss-button-bg: var(--ss-canvas-bg);
  --ss-field-bg: var(--ss-canvas-bg);
  --ss-button-hover: var(--ss-accent-soft);
}
.ss-shell *, .ss-shell *::before, .ss-shell *::after { box-sizing: border-box; }
.ss-shell [hidden], .ss-shell [data-studio-page][hidden], .ss-shell [data-mobile-pane][hidden] { display: none !important; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(button, input, select, textarea) { font: inherit; color: inherit; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) button { cursor: pointer; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) button:disabled { opacity: .38; cursor: not-allowed; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(button, input, select, textarea, summary):focus-visible { outline: 2px solid var(--ss-violet); outline-offset: 2px; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(input,select,textarea) { min-width: 0; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(.ss-button,.ss-icon-button,.ss-input,.ss-select,.ss-textarea) { border-radius: var(--ss-control-radius); }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-button,
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-icon-button {
  border: 1px solid var(--ss-outline);
  background: var(--ss-button-bg);
  color: var(--ss-button-ink);
  min-height: 34px;
  padding: 7px 11px;
  display: inline-flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  text-align: center;
  transition: background .16s, border-color .16s, color .16s;
}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(.ss-button,.ss-icon-button):hover:not(:disabled) { color: var(--ss-button-ink); background: var(--ss-button-hover); border-color: var(--ss-accent-line); }
:is(.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-button-primary,
.ss-shell .ss-button-primary { background: var(--ss-primary-bg); border-color: color-mix(in srgb, var(--ss-primary-bg) 55%, var(--ss-outline)); color: var(--ss-primary-ink); font-weight: 700; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-button-primary:hover:not(:disabled) { background: var(--ss-primary-hover); color: var(--ss-primary-ink); }
/* Generate/Stop is the one primary CTA that always follows Accent, even
   when the independent Buttons swatch is customized. Use host ink as a
   fallback; modern engines choose black/white by linear sRGB luminance. */
.ss-shell .ss-button.ss-generate,.ss-shell .ss-button.ss-generate:hover:not(:disabled) { background:var(--ss-accent); color:var(--ss-accent-ink); border-color:var(--ss-accent); }
@supports (color:color(from red srgb-linear round(up, .5, 1) 0 0)) {
  .ss-shell .ss-button.ss-generate,.ss-shell .ss-button.ss-generate:hover:not(:disabled) { color:color(from var(--ss-accent) srgb-linear round(up, clamp(0, calc(0.1791288 - (r * .2126 + g * .7152 + b * .0722)), 1), 1) round(up, clamp(0, calc(0.1791288 - (r * .2126 + g * .7152 + b * .0722)), 1), 1) round(up, clamp(0, calc(0.1791288 - (r * .2126 + g * .7152 + b * .0722)), 1), 1)); }
}
@supports (color:contrast-color(red)) {
  .ss-shell .ss-button.ss-generate,.ss-shell .ss-button.ss-generate:hover:not(:disabled) { color:contrast-color(var(--ss-accent)); }
}
.ss-shell .ss-button.ss-generate:hover:not(:disabled) { box-shadow:inset 0 0 0 1px currentColor; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-button-danger { color: #e6a5b4; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-icon-button { width: 34px; padding: 7px; flex: none; }
/* Line icons are stroke-only by default. Filled logos/carets explicitly opt in via fill attributes or component rules. */
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) svg { width: 16px; height: 16px; flex: 0 0 auto; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) svg:not([fill]) { fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-field, :is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-saved-style-editor label { display: grid; gap: 7px; min-width: 0; align-content: start; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-field > label, :is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-field > span:first-child,
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-saved-style-editor label, :is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-eyebrow {
  color: var(--ss-muted); font-size: 10px; font-weight: 750; text-transform: uppercase; letter-spacing: .055em;
}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-input,:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-select,:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-textarea {
  width: 100%; min-height: 36px; padding: 8px 10px;
  background: var(--ss-field-bg); color: var(--ss-text);
  border: 1px solid var(--ss-outline); outline: none; font-size: 12px;
}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(.ss-input,.ss-select,.ss-textarea):focus { border-color: var(--ss-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ss-accent) 19%, transparent); }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-textarea { min-height: 66px; resize: vertical; line-height: 1.5; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-select { padding-right: 24px; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-select option { background: var(--ss-panel-bg); color: var(--ss-text); }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) input[type='checkbox'],:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) input[type='radio'] { accent-color: var(--ss-accent); }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) input[type='range'] { width: 100%; min-width: 0; accent-color: var(--ss-accent); cursor: pointer; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) :is(.ss-muted,.ss-field-help,.ss-tiny) { color: var(--ss-dim); }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-tiny { font-size: 10px; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-field-help { font-size: 10px; line-height: 1.5; }
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host) .ss-empty { padding: 20px 12px; color: var(--ss-dim); font-size: 12px; text-align: center; }
.ss-shell .ss-section-head,.ss-shell .ss-section-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
.ss-shell .ss-section-title strong { font-size: 12px; font-weight: 760; color: var(--ss-text); }
.ss-shell .ss-section-title span { font-size: 10px; }
.ss-shell .ss-badge, .ss-shell .ss-family-chip {
  padding: 4px 8px; border: 1px solid var(--ss-accent-line); background: var(--ss-accent-soft);
  border-radius: 100px; color: var(--ss-text); font-size: 10px; white-space: nowrap;
}
.ss-shell :is(.ss-button,.ss-icon-button,.ss-input,.ss-select,.ss-textarea)[disabled] { opacity: .48; }
.ss-shell :is(.ss-pane-body,.ss-saved-style-editor,.ss-lora-grid,.ss-stack-list,.ss-history-grid,.ss-settings-content) {
  scrollbar-width:thin; scrollbar-gutter:stable;
}
@media (hover:hover) and (forced-colors:none) {
  .ss-shell :is(.ss-pane-body,.ss-saved-style-editor,.ss-lora-grid,.ss-stack-list,.ss-history-grid,.ss-settings-content) {
    scrollbar-color:transparent transparent; transition:scrollbar-color .2s ease;
  }
  .ss-shell :is(.ss-pane-body,.ss-saved-style-editor,.ss-lora-grid,.ss-stack-list,.ss-history-grid,.ss-settings-content):is(:hover,:focus-within) {
    scrollbar-color:#494457 transparent;
  }
}
@media (prefers-reduced-motion:reduce) {
  .ss-shell :is(.ss-pane-body,.ss-saved-style-editor,.ss-lora-grid,.ss-stack-list,.ss-history-grid,.ss-settings-content) { transition:none; }
}
/* Header and workspace navigation */
.ss-topbar {
  min-height: 58px; padding: 9px 17px; display: grid; align-items: center;
  grid-template-columns: auto minmax(0,1fr) auto; gap: 14px;
  background: var(--ss-header-bg); border-bottom: 1px solid var(--ss-border-subtle); z-index: 60;
}
.ss-brand { display: inline-flex; align-items: center; gap: 10px; min-width: 0; color: var(--ss-text); font-size: 15px; font-weight: 760; letter-spacing: -.02em; }
.ss-brand > svg { width: 34px; height: 34px; padding: 7px; border: 1px solid var(--ss-accent-line); border-radius: 10px; background: var(--ss-accent-soft); color: var(--ss-accent); filter: drop-shadow(0 1px 4px #8c5eac22); }
.ss-connection-wrap { position: relative; max-width: 680px; min-width: 0; width: 100%; justify-self: center; }
.ss-connection-wrap::before { content: ''; width: 7px; height: 7px; background: var(--ss-status-color,#89849a); border-radius: 50%; position: absolute; top: 50%; left: 12px; transform: translateY(-50%); z-index: 1; box-shadow: 0 0 0 3px var(--ss-header-bg); }
.ss-shell .ss-connection { height: 35px; padding-left: 29px; background: var(--ss-panel-hi); }
.ss-top-actions { display: flex; align-items: center; gap: 6px; }
.ss-config-wrap { position: relative; }
/* Workspace tabs share their active surface with the page underneath. */
.ss-view-nav { --ss-tab-surface:var(--ss-canvas-bg); display:flex; gap:5px; align-items:end; flex:0 0 auto; height:auto; padding:6px 16px 0; border-bottom:1px solid var(--ss-accent-line); background:var(--ss-canvas-bg); }
.ss-shell .ss-view-nav .ss-button { position:relative; flex:none; min-width:96px; height:36px; min-height:0; padding:0 18px; font-size:12px; font-weight:700; white-space:nowrap; border:1px solid var(--ss-outline); border-bottom:0; border-radius:8px 8px 0 0; background:var(--ss-canvas-bg); color:var(--ss-muted); }
.ss-shell .ss-view-nav .ss-button:hover:not(:disabled) { background:var(--ss-accent-soft); color:var(--ss-text); border-color:var(--ss-accent-line); }
.ss-shell .ss-view-nav .ss-button[aria-current='page']:not(:disabled) { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-tab-surface); }
.ss-view-nav .ss-button[aria-current='page']::after { content:""; position:absolute; height:2px; inset:auto 0 -1px; background:var(--ss-tab-surface); pointer-events:none; }
.ss-permission-banner { display: none; margin: 6px 12px; padding: 8px 10px; border-radius: 9px; border: 1px solid #8a6245; color: #f5c395; background: #403020; }
.ss-permission-banner[data-visible='true'] { display: block; }
.ss-mobile-tabs { display: none; }
.ss-workspace { display: grid; grid-template-columns: minmax(0,var(--ss-generation-width)) 5px minmax(0,1fr) 5px minmax(0,var(--ss-history-width)); gap: 0; flex: 1 1 0; min-width: 0; min-height: 0; overflow: hidden; padding: 10px; }
.ss-shell.ss-generation-collapsed .ss-workspace { grid-template-columns: 38px 0 minmax(0,1fr) 5px minmax(0,var(--ss-history-width)); }
.ss-shell.ss-history-collapsed .ss-workspace { grid-template-columns: minmax(0,var(--ss-generation-width)) 5px minmax(0,1fr) 0 38px; }
.ss-shell.ss-generation-collapsed.ss-history-collapsed .ss-workspace { grid-template-columns: 38px 0 minmax(0,1fr) 0 38px; }
.ss-generation-pane,.ss-history-pane,.ss-output-stage,.ss-prompt-panel,.ss-style-column { min-width: 0; min-height: 0; border: 1px solid var(--ss-outline); border-radius: var(--ss-panel-radius); background: var(--ss-panel-bg); }
.ss-generation-pane,.ss-history-pane { display: flex; flex-direction: column; overflow: visible; }
.ss-pane-head { flex: none; min-height: 57px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 9px; border-bottom: 1px solid var(--ss-border-subtle); }
.ss-pane-title { display: grid; gap: 2px; min-width: 0; }
.ss-pane-title strong { font-size: 13px; color: var(--ss-text); font-weight: 780; }
.ss-pane-title .ss-tiny { font-size: 10px; }
.ss-pane-toggle { font-size: 19px; }
.ss-pane-body { flex: 1; min-height: 0; padding: 13px; overflow-y: auto; overflow-x: hidden; }
.ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-body,.ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-title,
.ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-title,.ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-body { display: none; }
.ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-head,.ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-head { padding: 6px 2px; justify-content: center; }
.ss-shell.ss-generation-collapsed .ss-recipe-menu { display: none; }
.ss-shell.ss-generation-collapsed .ss-pane-toggle { rotate: 180deg; }
.ss-resize-handle { width: 5px; cursor: col-resize; min-width: 0; position: relative; }
.ss-resize-handle::after { content: ''; display: block; position: absolute; inset: 20% 1px; width: 3px; border-radius: 4px; background: transparent; transition: background .16s; }
.ss-resize-handle:hover::after,.ss-shell.ss-is-resizing .ss-resize-handle::after { background: var(--ss-accent); }
.ss-center { display: grid; grid-template-rows: minmax(0,1fr) 5px minmax(155px,var(--ss-prompt-height)); min-width: 0; min-height: 0; overflow: hidden; gap: 0; padding: 0 4px; }
.ss-center-resizer { cursor: row-resize; height: 5px; position: relative; }
.ss-center-resizer:hover::after { content:''; background:var(--ss-accent); height:2px; top:1px; position:absolute; left:40%; width:20%; border-radius:5px; }
/* Tune: one inspector hierarchy, not form sections piled into each other. */
.ss-tune-header-actions { display: flex; align-items: center; gap: 7px; }
.ss-recipe-menu { position: relative; }
 .ss-recipe-menu > summary { list-style: none; width:28px; height:28px; min-height:28px; padding:3px; font-size:11px; font-weight:800; letter-spacing:1px; }
.ss-menu-dots { display:block; width:100%; line-height:1; text-align:center; letter-spacing:1.25px; }
.ss-recipe-menu > summary::-webkit-details-marker { display: none; }
.ss-recipe-menu[open] > summary { background: var(--ss-accent-soft); border-color: var(--ss-accent-line); color: var(--ss-text); }
.ss-recipe-menu-sheet { position: absolute; z-index: 125; right: -48px; top: calc(100% + 8px); width: min(295px,calc(100vw - 32px)); padding: 9px; background: var(--ss-panel-bg); border: 1px solid var(--ss-outline); border-radius: 12px; box-shadow: 0 18px 60px #0009; max-height: min(70dvh,600px); overflow-y: auto; }
.ss-menu-heading { display:flex; justify-content: space-between; color: var(--ss-text); font-size: 12px; font-weight: 750; padding: 7px 9px 11px; }
.ss-menu-heading span { font-size: 10px; color: var(--ss-dim); font-weight: 400; }
.ss-recipe-menu-sheet section { display: grid; gap: 3px; padding: 8px 6px; border-top: 1px solid var(--ss-border-subtle); }
.ss-recipe-menu-sheet h4 { color: var(--ss-muted); font-size: 9px; letter-spacing: .085em; font-weight: 800; margin: 0 0 4px; }
.ss-recipe-menu-sheet p { font-size: 10px; line-height: 1.45; color: var(--ss-muted); margin: 4px 5px 0; }
 .ss-shell .ss-menu-action { min-height: 33px; display:flex; width:100%; align-items:center; gap:9px; padding:8px 10px; border:0; border-radius:7px; color:var(--ss-text); background:transparent; text-align:left; font-size:11px; }
.ss-menu-action svg { width:14px; height:14px; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; opacity:.78; }
.ss-shell .ss-menu-action:hover:not(:disabled) { background: var(--ss-accent-soft); color: var(--ss-text); }
.ss-shell .ss-menu-action.ss-menu-danger { color: #e9a4b4; }
.ss-generation-controls { display: grid; gap: 11px; }
.ss-tune-recipe-card { padding: 13px; background: linear-gradient(125deg,var(--ss-accent-soft),var(--ss-panel-hi) 75%); border:1px solid var(--ss-accent-line); border-radius: 12px; display:flex; align-items: center; gap: 7px; min-width: 0; }
.ss-tune-recipe-identity { display: flex; align-items: center; gap: 8px; flex:1; min-width:0; }
.ss-tune-recipe-identity > span:last-child { display:grid; min-width:0; gap:2px; }
.ss-tune-orb { display:grid; place-items:center; width:31px; height:31px; color:var(--ss-accent); background:var(--ss-accent-soft); border:1px solid var(--ss-accent-line); border-radius:9px; font-size:18px; }
.ss-tune-recipe-card strong { color:var(--ss-text); font-size:12px; }
.ss-tune-recipe-card small { color:var(--ss-muted); font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ss-tune-recipe-tag { font-size:9px; color:var(--ss-accent); border:1px solid var(--ss-accent-line); background:var(--ss-accent-soft); border-radius:999px; padding:4px 7px; }
.ss-tune-divider { margin: 7px 2px 0; font-size: 9px; color: var(--ss-dim); letter-spacing: .09em; font-weight: 800; }
.ss-tune-group { border:1px solid var(--ss-outline); border-radius: 12px; background: var(--ss-panel-hi); min-width: 0; overflow:clip; }
.ss-tune-group[open] { background:var(--ss-panel-hi); border-color:var(--ss-accent-line); }
.ss-tune-group > summary { padding: 12px; list-style: none; display: flex; gap:9px; align-items:center; min-height:57px; cursor:pointer; user-select:none; border-radius:11px; }
.ss-tune-group[open] > summary { border-radius:11px 11px 0 0; }
.ss-tune-group > summary::-webkit-details-marker { display:none; }
.ss-tune-group > summary:hover { background: var(--ss-button-hover); }
.ss-tune-group-icon { display:grid; place-items:center; flex: none; width:28px; height:28px; border-radius:8px; background:var(--ss-accent-soft); border:1px solid var(--ss-accent-line); color:var(--ss-accent); font-size:15px; }
.ss-tune-group-copy { min-width:0; display:grid; flex:1; gap:3px; }
.ss-tune-group-copy strong { color:var(--ss-text); font-size:12px; font-weight:750; }
.ss-tune-group-copy small { font-size:10px; color:var(--ss-dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
 .ss-tune-chevron { color:var(--ss-muted); display:grid; place-items:center; width:16px; height:16px; flex:none; }
.ss-tune-chevron svg { width:13px; height:13px; fill:currentColor; stroke:none; transform:rotate(180deg); }
.ss-tune-group[open] > summary .ss-tune-chevron svg { transform:none; }
.ss-tune-group-body { padding: 0 12px 14px; display: grid; gap: 12px; }
.ss-tune-group-body::before { content: ''; height: 1px; background: var(--ss-border-subtle); width:100%; }
.ss-tune-group .ss-workflow-panel { display:grid; gap:7px; }
.ss-workflow-picker { display:grid; grid-template-columns: minmax(0,1fr) auto auto; align-items:end; gap:6px; }
.ss-workflow-picker .ss-field { min-width:0; }
.ss-workflow-badge { min-height:34px; display:grid; place-items:center; padding: 0 6px; border:1px solid #42654f; color:#a7dac6; background:#25362f; border-radius:7px; font-size:9px; font-weight:800; text-transform:uppercase; }
.ss-workflow-badge[data-active='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); }
.ss-workflow-description { color:var(--ss-muted); font-size:10px; line-height:1.5; }
.ss-orientation-heading { display:flex; justify-content:space-between; align-items:center; gap:9px; color:var(--ss-muted); font-size:10px; font-weight:760; text-transform:uppercase; letter-spacing:.04em; }
.ss-shell .ss-orientation-heading .ss-context-button { min-height:30px; font-size:10px; padding:5px 8px; text-transform:none; letter-spacing:0; }
.ss-tune-orientation-display { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
.ss-tune-orientation-display button { cursor:pointer; font:inherit; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:9px 3px; background:var(--ss-button-bg); border:1px solid var(--ss-outline); border-radius:9px; color:var(--ss-muted); font-size:10px; }
.ss-tune-orientation-display button::before { content:''; width:20px; height:13px; border:1.5px solid currentColor; border-radius:2px; }
.ss-tune-orientation-display .ss-orientation-square::before { width:15px;height:15px; }
.ss-tune-orientation-display .ss-orientation-portrait::before { width:12px;height:18px; }
.ss-tune-orientation-display button[data-active='true'] { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); color:var(--ss-text); }
.ss-aspect-controls { display:grid; gap:10px; }
.ss-custom-size { display:grid; grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr); gap:8px; align-items:end; }
.ss-custom-size .ss-size-link { align-self:end; height:36px; }
.ss-size-slider-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:9px; align-items:center; }
.ss-size-readout { font-size:10px; color:var(--ss-muted); white-space:nowrap; }
.ss-sampling-pair { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
.ss-sampling-pair .ss-wide { min-width:0; }
.ss-sampling-pair .ss-input[type='number'] { background:var(--ss-field-bg); font-size:15px; font-weight:760; height:39px; }
.ss-seed-actions { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
.ss-shell .ss-seed-actions .ss-button { min-height:33px; font-size:10px; padding:6px; }
.ss-seed-hint { margin-top:-7px; }
.ss-tune-group .ss-init-panel { display:grid; grid-template-columns:55px minmax(0,1fr); gap:10px; align-items:center; padding:9px; background:var(--ss-panel-hi); border:1px solid var(--ss-outline); border-radius:10px; }
.ss-init-preview { width:55px; height:60px; display:grid; place-items:center; background:var(--ss-canvas-bg); color:var(--ss-muted); border:1px dashed var(--ss-outline); border-radius:8px; overflow:hidden; }
.ss-init-preview img { width:100%; height:100%; object-fit:cover; }
.ss-init-content { min-width:0; display:grid; gap:9px; }
.ss-init-head { display:grid; gap:3px; }
.ss-init-label { font-size:10px; color:var(--ss-dim); white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
.ss-init-actions { display:flex; flex-wrap:wrap; gap:5px; }
.ss-shell .ss-init-actions .ss-button { min-height:29px; font-size:10px; padding:5px 8px; }
.ss-creativity-row { grid-column: 1 / -1; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:8px; font-size:10px; color:var(--ss-muted); }
 .ss-advanced { margin-top:11px; }
.ss-advanced-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
.ss-advanced-grid::before { grid-column:1/-1; }
.ss-advanced .ss-tune-group-icon svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.6; }
.ss-advanced-grid .ss-wide { grid-column:1 / -1; }
.ss-preset-picker { display:flex; align-items:center; gap:6px; }
.ss-preset-stack { display:grid; gap:6px; }
.ss-preset-stack :is(.ss-preset-row,.ss-selected-preset) { display:flex; align-items:center; gap:7px; border:1px solid var(--ss-outline); padding:7px; border-radius:8px; }
/* Main art canvas and prompt composer */
.ss-output-stage { display:grid; grid-template-rows:auto minmax(0,1fr) auto; overflow:hidden; padding:10px; gap:8px; }
.ss-output-stage-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.ss-output-actions { display:flex; flex-wrap:wrap; gap:6px; }
.ss-shell .ss-output-actions .ss-icon-button { width:34px; min-height:34px; padding:6px; }
.ss-output-actions svg { width:17px; height:17px; }
.ss-current-preview { position:relative; display:grid; place-items:center; min-height:0; min-width:0; overflow:hidden; border-radius:9px; border:1px solid var(--ss-outline); background:var(--ss-canvas-bg); contain:layout paint; cursor:zoom-in; }
.ss-current-preview > img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
.ss-preview-empty { display:grid; place-items:center; gap:7px; color:var(--ss-muted); text-align:center; padding:20px; font-size:11px; }
.ss-preview-empty strong { color:var(--ss-text); font-size:14px; }
.ss-preview-loading[hidden] { display:none; }
.ss-preview-loading { position:absolute; inset:auto 18px 18px; z-index:3; pointer-events:none; }
.ss-generation-progress { display:grid; gap:5px; padding:9px; border-radius:8px; background:color-mix(in srgb,var(--ss-header-bg) 94%,transparent); border:1px solid var(--ss-outline); }
.ss-progress-track { height:5px; overflow:hidden; border-radius:50px; background:var(--ss-outline); }
.ss-progress-fill { display:block; height:100%; width:0; background:var(--ss-accent); transition:width .15s; }
.ss-generation-progress[data-indeterminate='true'] .ss-progress-fill { width:35%; animation:ss-progress 1.3s linear infinite; }
@keyframes ss-progress { from {transform:translateX(-100%)} to {transform:translateX(300%)} }
.ss-progress-label { color:var(--ss-muted); font-size:10px; }
.ss-current-preview .ss-current-favorite { position:absolute; right:12px; top:12px; z-index:3; border-radius:9px; background:var(--ss-canvas-bg)d9; }
.ss-favorite-button svg { fill:none; stroke:currentColor; stroke-width:1.6; }
.ss-favorite-button[data-active='true'] svg { fill:var(--ss-accent); stroke:var(--ss-accent); }
.ss-output-meta { display:flex; justify-content:space-between; align-items:center; gap:10px; min-height:15px; }
.ss-output-label { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--ss-dim); font-size:10px; }
.ss-zoom-hint { color:var(--ss-dim); font-size:10px; white-space:nowrap; }
.ss-prompt-panel { padding:11px; display:flex; flex-direction:column; gap:9px; overflow-y:auto; }
.ss-prompt-head { flex-wrap:wrap; }
.ss-prompt-status { font-size:10px; color:var(--ss-dim); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:40%; }
.ss-prompt-actions { display:flex; align-items:center; gap:6px; }
.ss-prompt-context { display:flex; align-items:center; gap:5px; flex-wrap:wrap; min-height:22px; }
.ss-prompt-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; min-width:0; flex:1; min-height:0; }
.ss-prompt-grid .ss-field { min-height:0; }
.ss-prompt-grid .ss-textarea { min-height:74px; height:100%; resize:vertical; }
.ss-prompt-field-head { display:flex; justify-content:space-between; align-items:center; gap:6px; }
.ss-prompt-field-head label { color:var(--ss-muted); font-size:11px; font-weight:730; }
.ss-positive-label { min-width:0; display:flex; align-items:center; flex-wrap:wrap; gap:4px; }
.ss-prompt-editor-button { border:0; color:var(--ss-accent); background:transparent; padding:3px; }
.ss-active-visual-pill,.ss-active-preset-pill { border-radius:999px; background:var(--ss-accent-soft); color:var(--ss-text); border:1px solid var(--ss-accent-line); padding:3px 6px; font-size:9px; }
.ss-active-visual-pill[data-enabled]::before { content:""; display:inline-block; width:6px; height:6px; margin-inline-end:5px; border-radius:50%; background:var(--ss-accent); vertical-align:1px; }
.ss-active-visual-pill[data-enabled=false] { background:var(--ss-field-bg); color:var(--ss-muted); border-color:var(--ss-outline); border-style:dashed; }
.ss-active-visual-pill[data-enabled=false]::before { background:transparent; box-shadow:inset 0 0 0 1px currentColor; }
.ss-mobile-prompt-tools,.ss-mobile-stack-picker,.ss-mobile-label { display:none; }
.ss-commandbar { display:none; }
.ss-command-summary { display:none; }
.ss-commandbar .ss-button { min-height:33px; }
/* Side rail / ordered LoRA stack / history */
.ss-history-pane { overflow:hidden; }
.ss-working-stack { min-height:0; flex:1; display:flex; flex-direction:column; overflow:hidden; }
.ss-working-stack > .ss-section-head { flex:none; padding:12px 11px; border-bottom:1px solid var(--ss-border-subtle); }
.ss-working-stack .ss-stack-list { flex:1; overflow:auto; padding:7px; }
.ss-rail-history { border-top:1px solid var(--ss-border-subtle); flex:none; min-height:36px; max-height:55%; display:flex; flex-direction:column; overflow:hidden; }
.ss-rail-history:not([open]) { display:block; }
.ss-rail-history > summary { cursor:pointer; padding:9px 11px; list-style:none; font-size:11px; font-weight:750; color:var(--ss-muted); }
.ss-rail-history > summary::-webkit-details-marker { display:none; }
.ss-rail-history > :not(summary) { min-height:0; }
.ss-rail-history .ss-pane-head { padding:5px 10px; min-height:38px; }
.ss-rail-history .ss-history-grid { overflow-y:auto; min-height:80px; flex:1; padding:7px; }
.ss-history-card { position:relative; display:grid; gap:6px; padding:6px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-hi); }
.ss-history-card img { width:100%; height:75px; object-fit:cover; border-radius:6px; }
.ss-history-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-content:start; gap:7px; }
.ss-history-card .ss-button { min-height:27px; padding:3px 5px; font-size:10px; }
.ss-history-pagination { display:flex; align-items:center; justify-content:center; gap:9px; padding:8px; }
.ss-history-page-label { color:var(--ss-muted); font-size:10px; }
/* Each row owns two predictable tracks; narrow rails never force controls into thumbnail/name. */
/* Shared single-line LoRA stack, one real title and an overflow metadata viewer. */
.ss-stack-row { display:grid; grid-template-columns:16px 36px minmax(0,1fr) 52px 28px; grid-template-rows:36px; gap:5px; align-items:center; min-width:0; height:54px; padding:7px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-hi); }
.ss-stack-row .ss-stack-drag { grid-area:1/1; width:16px; min-height:28px; padding:0; border:0; background:transparent; font-size:16px; color:var(--ss-muted); cursor:grab; touch-action:none; user-select:none; }
.ss-stack-row .ss-stack-drag:active { cursor:grabbing; }
.ss-stack-row.ss-stack-dragging { opacity:.45; }
.ss-stack-row.ss-stack-drop-target { outline:2px solid var(--ss-accent); outline-offset:1px; }
.ss-stack-row .ss-stack-preview { grid-area:1/2; display:block; width:36px; height:36px; padding:2px; overflow:hidden; border:1px solid var(--ss-outline); border-radius:8px; background:var(--ss-field-bg); }
.ss-stack-row .ss-stack-preview img { display:block; width:100%; height:100%; object-fit:cover; border-radius:6px; }
.ss-stack-row .ss-stack-preview img[hidden] { display:none; }
.ss-stack-row .ss-stack-name { grid-area:1/3; display:block; min-width:0; overflow:hidden; }
.ss-stack-row .ss-stack-name strong { display:block; color:var(--ss-text); font-size:11px; font-weight:740; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ss-stack-row .ss-stack-weight { grid-area:1/4; width:52px; min-width:0; min-height:29px; padding:3px 2px; font-size:11px; text-align:center; }
.ss-stack-row .ss-stack-actions { grid-area:1/5; display:flex; justify-content:flex-end; min-width:0; }
.ss-stack-row .ss-stack-actions button { width:28px; min-width:28px; height:29px; min-height:29px; padding:2px; font-size:17px; }
.ss-stack-row[data-disabled='true'] .ss-stack-name { opacity:.55; }
.ss-stack-row[data-missing='true'] { border-style:dashed; }
.ss-stack-list { display:grid; gap:6px; align-content:start; min-width:0; }
.ss-visually-hidden { position:absolute; width:1px; height:1px; clip-path:inset(50%); overflow:hidden; white-space:nowrap; }
.ss-lora-meta-layer { position:absolute; inset:0; z-index:125; background:color-mix(in srgb,var(--ss-canvas-bg) 78%,transparent); backdrop-filter:blur(6px); display:grid; place-items:center; padding:15px; }
.ss-lora-meta-layer[hidden] { display:none; }
.ss-lora-meta-dialog { width:min(460px,100%); max-height:min(82%,700px); overflow:auto; padding:15px; background:var(--ss-panel-bg); color:var(--ss-text); border:1px solid var(--ss-outline); border-radius:13px; box-shadow:0 20px 90px #0009; }
.ss-lora-meta-header { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:14px; }
.ss-lora-meta-grid { display:grid; grid-template-columns:100px minmax(0,1fr); gap:10px; padding:12px 0; font-size:11px; }
.ss-lora-meta-grid dt { color:var(--ss-muted); }
.ss-lora-meta-grid dd { margin:0; overflow-wrap:anywhere; }
.ss-lora-meta-controls { display:flex; justify-content:flex-end; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--ss-outline); padding-top:12px; }
.ss-lora-meta-toggle { display:inline-flex; align-items:center; gap:6px; font-size:11px; }
/* Stack actions respond to their own pane width, not to the browser viewport. */
.ss-stack-pane { display:flex; flex-direction:column; min-width:0; min-height:0; height:100%; gap:10px; container:stack-pane / inline-size; }
.ss-stack-head-tools { display:grid; grid-template-columns:minmax(0,1fr) repeat(3,max-content); gap:6px; }
.ss-stack-head-tools .ss-select { width:100%; min-width:0; }
.ss-stack-head-tools .ss-button { min-width:0; white-space:nowrap; }
.ss-stack-share-tools { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; }
.ss-stack-share-tools .ss-button { width:100%; min-width:0; padding:6px 5px; font-size:10px; white-space:nowrap; }
.ss-stack-share-tools .ss-button svg { width:13px; height:13px; }
@container stack-pane (max-width: 425px) {
  .ss-stack-head-tools { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .ss-stack-head-tools > .ss-select { grid-column:1/-1; }
  .ss-stack-head-tools > .ss-button { width:100%; justify-content:center; padding:6px 5px; }
  .ss-stack-share-tools { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
 .ss-stack-pane > .ss-stack-list { flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; }
.ss-style-stack-column .ss-stack-row { grid-template-rows:36px; padding:7px; gap:5px; }
.ss-style-stack-column .ss-stack-list { gap:6px; }
.ss-cast-workspace{--bg:var(--ss-canvas-bg);--surface:var(--ss-panel-bg);--raised:var(--ss-panel-hi);--line:var(--ss-outline);--faint:var(--ss-border-subtle);--text:var(--ss-text);--muted:var(--ss-muted);--lilac:var(--ss-accent);--pink:var(--ss-accent);--mint:var(--lumiverse-success,var(--ss-accent));--gold:var(--ss-accent);--font:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--serif:Georgia,"Times New Roman",serif}
.ss-cast-workspace *{box-sizing:border-box}
.ss-cast-workspace{flex:1 1 0;min-height:0;min-width:0;overflow:auto;container-type:inline-size;container-name:cast-album;isolation:isolate;margin:0;background:var(--bg);color:var(--text);font:14px/1.5 var(--font)}
.ss-cast-workspace button,.ss-cast-workspace input,.ss-cast-workspace select,.ss-cast-workspace textarea{font:inherit;color:inherit}
.ss-cast-workspace button{cursor:pointer;touch-action:manipulation;border:0}
.ss-cast-workspace button:disabled{cursor:default;opacity:.45}
.ss-cast-workspace button:focus-visible,.ss-cast-workspace a:focus-visible,.ss-cast-workspace input:focus-visible,.ss-cast-workspace select:focus-visible,.ss-cast-workspace textarea:focus-visible,.ss-cast-workspace summary:focus-visible{outline:2px solid var(--lilac);outline-offset:4px}
.ss-cast-workspace h1,.ss-cast-workspace h2,.ss-cast-workspace h3,.ss-cast-workspace p{margin:0}
.ss-cast-workspace h1,.ss-cast-workspace h2,.ss-cast-workspace h3{overflow-wrap:anywhere}
.ss-cast-workspace h1{font:500 clamp(34px,4vw,49px)/1.12 var(--serif);letter-spacing:-1.5px}
.ss-cast-workspace h2{font:500 29px/1.2 var(--serif);letter-spacing:-.5px}
.ss-cast-workspace h3{font-size:15px;font-weight:600}
.ss-cast-workspace small{font-size:12px}
.ss-cast-workspace .muted{color:var(--muted)}
.ss-cast-workspace .eyebrow{font-size:10px;letter-spacing:1.8px;text-transform:uppercase;font-weight:650;color:var(--muted)}
.ss-cast-workspace .row{display:flex;align-items:center;gap:10px}
.ss-cast-workspace .spread{justify-content:space-between}
.ss-cast-workspace .wrap{flex-wrap:wrap}
.ss-cast-workspace .stack{display:flex;flex-direction:column;gap:15px}
.ss-cast-workspace .grow{flex:1;min-width:0}
.ss-cast-workspace [hidden]{display:none!important}
.ss-cast-workspace .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.ss-cast-workspace svg.icon{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.ss-cast-workspace .button{color:var(--ss-button-ink);display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:41px;padding:10px 16px;border-radius:11px;background:var(--ss-button-bg);border:1px solid var(--line);font-size:12px;font-weight:600;white-space:nowrap;transition:background .15s,transform .15s}
.ss-cast-workspace .button:hover{background:var(--ss-button-hover)}
.ss-cast-workspace .button.primary{background:var(--ss-primary-bg);color:var(--ss-primary-ink);border-color:var(--ss-primary-bg)}
.ss-cast-workspace .button.primary:hover{background:var(--ss-primary-hover)}
.ss-cast-workspace .button.ghost{background:transparent;border-color:transparent;color:var(--muted)}
.ss-cast-workspace .button.small{min-height:34px;padding:7px 10px;font-size:11px}
.ss-cast-workspace .button.danger{color:var(--lumiverse-danger,var(--ss-text))}
.ss-cast-workspace .icon-button{display:inline-grid;place-items:center;width:38px;height:38px;min-width:38px;border:1px solid var(--line);border-radius:10px;background:transparent;color:var(--muted)}
.ss-cast-workspace .icon-button:hover{background:var(--raised);color:var(--text)}
.ss-cast-workspace .text-button{background:transparent;color:var(--lilac);padding:8px 0;font-size:12px}
.ss-cast-workspace .pill{display:inline-flex;align-items:center;gap:5px;font-size:10px;line-height:1;padding:7px 9px;border-radius:7px;background:var(--ss-accent-soft);color:var(--muted);white-space:nowrap}
.ss-cast-workspace .pill.mint{background:var(--ss-accent-soft);color:var(--mint)}
.ss-cast-workspace .pill.pink{background:var(--ss-accent-soft);color:var(--pink)}
.ss-cast-workspace .pill.line{border:1px solid var(--line);background:transparent;color:var(--muted)}
.ss-cast-workspace .dot{width:5px;height:5px;border-radius:50%;background:currentColor}
.ss-cast-workspace .divider{height:1px;background:var(--faint)}
.ss-cast-workspace .cast-page{max-width:1480px;margin:auto;padding:30px 28px 48px}
.ss-cast-workspace .page-head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:24px}
.ss-cast-workspace .page-head h1{font-size:29px;letter-spacing:-.5px}
.ss-cast-workspace .page-head p{margin-top:11px;color:var(--muted);font-size:12px;max-width:500px}
.ss-cast-workspace .page-head h1 em{font-weight:400;color:var(--lilac)}
.ss-cast-workspace .page-head .eyebrow{margin-bottom:10px}
.ss-cast-workspace .album-intro{display:flex;align-items:center;gap:18px;border:1px solid var(--line);background:var(--surface);padding:15px 19px;border-radius:14px;margin-bottom:27px}
.ss-cast-workspace .intro-mark{display:grid;place-items:center;background:var(--ss-accent-soft);color:var(--lilac);width:37px;height:37px;border-radius:50%;flex:none}
.ss-cast-workspace .album-intro strong{font-size:12px;font-weight:600}
.ss-cast-workspace .album-intro p{color:var(--muted);font-size:11px;margin-top:3px}
.ss-cast-workspace .album-intro .button{margin-left:auto}
.ss-cast-workspace .toolbar{display:flex;gap:14px;align-items:center;margin-bottom:21px}
.ss-cast-workspace .search{position:relative;flex:1;max-width:330px}
.ss-cast-workspace .search>svg{position:absolute;left:13px;top:12px;color:var(--muted)}
.ss-cast-workspace input:not([type=range]),.ss-cast-workspace textarea,.ss-cast-workspace select{border:1px solid var(--line);border-radius:10px;background:var(--ss-field-bg);padding:10px 12px;min-height:42px;max-width:100%;width:100%;font-size:12px}
.ss-cast-workspace input::placeholder,.ss-cast-workspace textarea::placeholder{color:var(--muted)}
.ss-cast-workspace .search input{padding-left:39px;background:var(--surface)}
.ss-cast-workspace select{cursor:pointer}
.ss-cast-workspace textarea{resize:vertical;min-height:88px;line-height:1.6}
.ss-cast-workspace .chips{display:flex;gap:5px;flex-wrap:wrap}
.ss-cast-workspace .chip{background:transparent;border:1px solid transparent;border-radius:20px;padding:8px 12px;font-size:11px;color:var(--muted)}
.ss-cast-workspace .chip[aria-pressed=true]{background:var(--ss-accent-soft);color:var(--lilac);border-color:var(--ss-accent-line)}
.ss-cast-workspace .sort{margin-left:auto;width:auto;background:transparent;border-color:transparent;color:var(--muted);font-size:11px;padding-right:25px}
.ss-cast-workspace .album-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:21px}
.ss-cast-workspace .cast-card{min-width:0;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:10px;position:relative;transition:transform .2s,border-color .2s}
.ss-cast-workspace .cast-card:hover{transform:translateY(-4px);border-color:var(--ss-accent-line)}
.ss-cast-workspace .cover{position:relative;height:202px;border-radius:12px;background:var(--cover,#302835);overflow:hidden;display:flex;align-items:center;justify-content:center}
.ss-cast-workspace .cover:after{content:"";position:absolute;inset:12px;border:1px solid #ffffff0b;border-radius:8px;pointer-events:none}
.ss-cast-workspace .cover-number{color:#f3edf4;position:absolute;left:16px;top:12px;font:italic 12px var(--serif);opacity:.5}
.ss-cast-workspace .cover-mark{position:absolute;right:17px;bottom:13px;color:#ffffff62;font-size:22px}
.ss-cast-workspace .cover .photo{width:95px;height:130px;padding:5px 5px 22px;background:#e9e0eb;border-radius:5px;box-shadow:0 7px 19px #08060c4d;transform:rotate(-9deg);position:relative;display:flex;align-items:stretch;justify-content:center}
.ss-cast-workspace .cover .photo+.photo{margin-left:-22px;transform:rotate(8deg) translateY(7px)}
.ss-cast-workspace .cover .photo:nth-of-type(3){transform:rotate(-3deg) translateY(-3px)}
.ss-cast-workspace .cover .photo>img{width:100%;height:100%;object-fit:cover;object-position:58% 16%;border-radius:2px}
.ss-cast-workspace .cover .photo .initial-art{border-radius:2px}
.ss-cast-workspace .cover .photo:after{content:attr(data-caption);font:italic 10px var(--serif);color:#615369;position:absolute;bottom:5px;left:0;right:0;text-align:center}
.ss-cast-workspace .tape{position:absolute;top:27px;left:calc(50% - 23px);height:16px;width:47px;background:#ded0e34d;transform:rotate(-10deg);z-index:2;backdrop-filter:blur(2px)}
.ss-cast-workspace .cast-card-copy{padding:17px 10px 8px}
.ss-cast-workspace .cast-card h3{font:500 24px var(--serif);letter-spacing:-.3px;margin:0 0 6px}
.ss-cast-workspace .cast-card .desc{font-size:11px;color:var(--muted);line-height:1.6;min-height:35px;margin-bottom:16px}
.ss-cast-workspace .cast-card-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--faint);padding-top:13px;color:var(--muted);font-size:10px}
.ss-cast-workspace .active-tag{position:absolute;right:20px;top:20px;background:var(--surface);color:var(--mint);z-index:3}
.ss-cast-workspace .new-cast-card{min-height:100px;grid-column:1/-1;background:transparent;border:1px dashed var(--line);display:flex;flex-direction:row;align-items:center;justify-content:center;text-align:left;padding:22px;gap:18px;color:var(--muted);border-radius:20px}
.ss-cast-workspace .new-cast-card:hover{background:var(--ss-button-hover);border-color:var(--lilac)}
.ss-cast-workspace .plus-circle{width:49px;height:49px;border-radius:50%;background:var(--surface);border:1px solid var(--line);color:var(--lilac);display:grid;place-items:center;margin-bottom:5px}
.ss-cast-workspace .new-cast-card strong{font:500 23px var(--serif);color:var(--text)}
.ss-cast-workspace .new-cast-card p{font-size:11px;line-height:1.7;max-width:240px}
.ss-cast-workspace .library-foot{margin-top:27px;font-size:10px;color:var(--muted);display:flex;gap:8px;align-items:center}
.ss-cast-workspace .initial-art{--tone:#826d96;background:var(--tone);display:grid;place-items:center;overflow:hidden;position:relative;width:100%;height:100%;color:#fff9;font:italic 46px var(--serif)}
.ss-cast-workspace .initial-art:before{content:"";position:absolute;width:65%;height:100%;border:1px solid #ffffff18;border-radius:50%;transform:rotate(38deg)}
.ss-cast-workspace .initial-art:after{content:"\u2726";position:absolute;right:8px;top:5px;font:14px var(--serif);color:#ffffff40}
.ss-cast-workspace .portrait{width:43px;height:49px;flex:none;border-radius:11px;overflow:hidden;background:var(--surface)}
.ss-cast-workspace .portrait img{width:100%;height:100%;object-fit:cover;object-position:60% 12%}
.ss-cast-workspace .portrait .initial-art{font-size:25px}
.ss-cast-workspace .portrait.large{width:67px;height:77px;border-radius:15px}
.ss-cast-workspace .breadcrumb{display:flex;gap:10px;align-items:center;margin-bottom:23px;font-size:11px;color:var(--muted)}
.ss-cast-workspace .breadcrumb button{color:var(--muted);padding:0;background:none}
.ss-cast-workspace .breadcrumb .icon{width:13px;height:13px}
.ss-cast-workspace .workspace-head{display:flex;align-items:center;gap:18px;margin-bottom:25px}
.ss-cast-workspace .workspace-head h1{font-size:39px}
.ss-cast-workspace .workspace-head p{font-size:11px;color:var(--muted);margin-top:6px}
.ss-cast-workspace .cast-symbol{display:grid;place-items:center;width:52px;height:58px;border:1px solid var(--line);border-radius:13px;background:var(--cast-cover,#352938);color:var(--pink);font:italic 26px var(--serif);flex:none}
.ss-cast-workspace .head-actions{margin-left:auto;display:flex;gap:9px;align-items:center}
.ss-cast-workspace .workspace{display:grid;grid-template-columns:210px minmax(0,1fr);gap:26px;align-items:start}
.ss-cast-workspace .roster{padding-top:3px}
.ss-cast-workspace .roster-head{padding:0 8px 13px;display:flex;align-items:center;justify-content:space-between;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted)}
.ss-cast-workspace .roster-items{display:flex;flex-direction:column;gap:6px}
.ss-cast-workspace .member-button{display:flex;align-items:center;gap:10px;width:100%;padding:10px;text-align:left;background:transparent;border:1px solid transparent;border-radius:13px;min-height:70px}
.ss-cast-workspace .member-button:hover{background:var(--surface)}
.ss-cast-workspace .member-button[aria-pressed=true]{background:var(--ss-accent-soft);border-color:var(--ss-accent-line)}
.ss-cast-workspace .member-button strong{font-size:12px;display:block;font-weight:600}
.ss-cast-workspace .member-button small{font-size:10px;color:var(--muted);display:block;margin-top:3px}
.ss-cast-workspace .persona-mark{color:var(--pink);font-size:10px}
.ss-cast-workspace .add-member{width:100%;margin-top:12px;border-style:dashed;background:transparent;color:var(--muted);min-height:44px}
.ss-cast-workspace .roster-note{display:flex;align-items:flex-start;gap:7px;font-size:10px;line-height:1.7;color:var(--muted);padding:17px 8px}
.ss-cast-workspace .roster-note .icon{width:14px;height:14px;margin-top:2px}
.ss-cast-workspace .member-body{min-width:0}
.ss-cast-workspace .member-profile{display:flex;gap:14px;align-items:center;margin-bottom:23px}
.ss-cast-workspace .member-profile h2{font:500 27px/1.1 var(--serif);margin-bottom:9px}
.ss-cast-workspace .member-profile .icon-button{margin-left:auto}
.ss-cast-workspace .member-tabs{display:flex;gap:23px;border-bottom:1px solid var(--line);margin-bottom:24px}
.ss-cast-workspace .member-tabs button{background:transparent;padding:0 0 12px;color:var(--muted);font-size:12px;border-bottom:2px solid transparent}
.ss-cast-workspace .member-tabs button[aria-selected=true]{border-color:var(--lilac);color:var(--lilac)}
.ss-cast-workspace .section-heading{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:16px}
.ss-cast-workspace .section-heading p{font-size:10px;color:var(--muted);margin-top:4px}
.ss-cast-workspace .expression-tools{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:var(--muted);margin-bottom:13px}
.ss-cast-workspace .expression-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.ss-cast-workspace .expression-tile{padding:6px;background:var(--surface);border:1px solid var(--line);border-radius:12px;text-align:left;min-width:0}
.ss-cast-workspace .expression-portrait{height:126px;overflow:hidden;border-radius:7px;background:var(--surface);position:relative}
.ss-cast-workspace .expression-portrait img{width:100%;height:100%;object-fit:cover;object-position:58% 14%}
.ss-cast-workspace .expression-portrait .initial-art{font-size:42px}
.ss-cast-workspace .cast-expression-actions{position:absolute;top:6px;right:6px;display:flex;gap:5px;opacity:0;transform:translateY(-3px);transition:opacity .14s ease,transform .14s ease;z-index:2}
.ss-cast-workspace .expression-tile:hover .cast-expression-actions,.ss-cast-workspace .expression-tile:focus-within .cast-expression-actions{opacity:1;transform:none}
.ss-cast-workspace .cast-expression-icon{width:29px;height:29px;display:grid;place-items:center;padding:0;border:1px solid var(--ss-outline);border-radius:7px;background:var(--ss-panel-bg);color:var(--ss-text);box-shadow:0 2px 9px #0003;cursor:pointer}
.ss-cast-workspace .cast-expression-icon .icon{width:14px;height:14px}
.ss-cast-workspace .cast-expression-icon:hover{background:var(--ss-accent-soft);border-color:var(--ss-accent-line)}
.ss-cast-workspace .cast-expression-icon.danger:hover{color:var(--ss-danger,#ef929a);border-color:currentColor}
@media(hover:none){.ss-cast-workspace .cast-expression-actions{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.ss-cast-workspace .cast-expression-actions{transition:none}}
.ss-cast-workspace .caption{display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:10px;padding:8px 3px 3px}
.ss-cast-workspace .caption .icon{width:11px;height:11px;fill:var(--gold);stroke:var(--gold)}
.ss-cast-workspace .expression-add{min-height:168px;background:transparent;border:1px dashed var(--line);border-radius:12px;color:var(--muted);display:flex;flex-direction:column;gap:7px;align-items:center;justify-content:center;font-size:10px}
.ss-cast-workspace .expression-add:hover{background:var(--surface);color:var(--lilac)}
.ss-cast-workspace .set-note{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:10px;margin:15px 0}
.ss-cast-workspace .set-note svg.icon{width:13px;height:13px}
.ss-cast-workspace .use-tag{border:1px solid var(--line);border-radius:12px;padding:13px 14px;display:flex;align-items:center;gap:12px;margin-top:23px;background:var(--surface)}
.ss-cast-workspace .use-tag small{display:block;font-size:10px;color:var(--muted);margin-bottom:4px}
.ss-cast-workspace .use-tag code{color:var(--lilac);font-size:11px;overflow-wrap:anywhere}
.ss-cast-workspace .use-tag .icon-button{margin-left:auto}
.ss-cast-workspace .hint{font-size:11px;line-height:1.7;color:var(--muted)}
.ss-cast-workspace .preview-panel{min-width:0;position:sticky;top:24px;background:var(--surface);border:1px solid var(--line);border-radius:17px;overflow:hidden}
.ss-cast-workspace .preview-header{padding:16px 17px 13px;display:flex;align-items:center;justify-content:space-between;font-size:11px}
.ss-cast-workspace .preview-header .pill{font-size:9px;padding:5px 6px}
.ss-cast-workspace .preview-stage{background:var(--ss-field-bg);padding:20px 15px 23px;border-block:1px solid var(--faint);min-height:315px}
.ss-cast-workspace .chat-date{text-align:center;color:var(--muted);font-size:9px;margin-bottom:18px}
.ss-cast-workspace .chat-meta{display:flex;align-items:center;gap:7px;font-size:10px;margin-bottom:10px}
.ss-cast-workspace .chat-meta .portrait{width:25px;height:28px;border-radius:8px}
.ss-cast-workspace .chat-meta span{color:var(--muted);font-size:8px}
.ss-cast-workspace .chat-prose{font:13px/1.9 var(--serif);color:var(--muted)}
.ss-cast-workspace .story-card{display:flex;align-items:stretch;gap:11px;border:1px solid var(--line);background:var(--surface);padding:9px;border-radius:11px;margin:13px 0 12px}
.ss-cast-workspace .story-image{width:71px;height:90px;border-radius:7px;overflow:hidden;flex:none}
.ss-cast-workspace .story-image img{width:100%;height:100%;object-fit:cover;object-position:58% 12%}
.ss-cast-workspace .story-image .initial-art{font-size:34px}
.ss-cast-workspace .story-card q{font:italic 14px/1.6 var(--serif);color:var(--muted)}
.ss-cast-workspace .story-card q:before,.ss-cast-workspace .story-card q:after{content:""}
.ss-cast-workspace .preview-footer{padding:13px 16px}
.ss-cast-workspace .segmented{display:flex;background:var(--ss-field-bg);padding:3px;border-radius:8px;border:1px solid var(--line);gap:3px}
.ss-cast-workspace .segmented button{flex:1;background:transparent;border-radius:5px;color:var(--muted);padding:5px 10px;font-size:10px}
.ss-cast-workspace .segmented button[aria-pressed=true]{background:var(--raised);color:var(--text)}
.ss-cast-workspace .preview-footer p{font-size:9px;line-height:1.7;color:var(--muted);margin-top:11px}
.ss-cast-workspace .source-preview{font:11px/2 ui-monospace,monospace;color:var(--muted);word-break:break-word;white-space:pre-wrap;padding:20px 4px}
.ss-cast-workspace .source-preview mark{color:var(--lilac);background:var(--ss-accent-soft);padding:3px 1px}
.ss-cast-workspace .preview-style-link{display:flex;justify-content:space-between;align-items:center;width:100%;padding:13px 16px;background:transparent;border-bottom:1px solid var(--faint);color:var(--muted);font-size:10px}
.ss-cast-workspace .preview-style-link strong{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;font-weight:500;color:var(--lilac)}
.ss-cast-workspace .style-options{display:flex;flex-direction:column;gap:12px}
.ss-cast-workspace .member-body .preview-panel{position:static;margin-bottom:18px}
.ss-cast-workspace .style-option{background:var(--surface);border:1px solid var(--line);border-radius:13px;display:grid;grid-template-columns:120px 1fr;gap:16px;padding:12px;text-align:left;align-items:center}
.ss-cast-workspace .style-option[aria-pressed=true]{border-color:var(--lilac);background:var(--ss-accent-soft)}
.ss-cast-workspace .style-thumb{height:83px;display:grid;place-items:center;border:1px solid var(--faint);border-radius:8px;background:var(--ss-field-bg);padding:7px}
.ss-cast-workspace .mini-story{display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:5px;padding:5px;width:100%;height:65px}
.ss-cast-workspace .mini-story .portrait{width:35px;height:49px;border-radius:4px}
.ss-cast-workspace .mini-lines{flex:1}
.ss-cast-workspace .mini-lines i{height:3px;margin:5px 0;background:var(--surface);display:block;border-radius:2px}
.ss-cast-workspace .mini-lines i:nth-child(2){width:65%}
.ss-cast-workspace .mini-sticker .portrait{width:58px;height:58px;border-radius:50%;border:2px solid var(--line);transform:rotate(-7deg)}
.ss-cast-workspace .mini-portrait .portrait{height:68px;width:52px;border-radius:5px}
.ss-cast-workspace .style-option h3{font-size:12px;margin-bottom:5px}
.ss-cast-workspace .style-option p{font-size:10px;line-height:1.6;color:var(--muted)}
.ss-cast-workspace .style-option .pill{font-size:8px;padding:4px 6px;margin-left:4px}
.ss-cast-workspace .style-action{margin-top:17px;padding-top:17px;border-top:1px solid var(--faint);display:flex;align-items:center;justify-content:space-between;gap:15px}
.ss-cast-workspace .style-action p{font-size:10px;color:var(--muted);max-width:215px}
.ss-cast-workspace .field{display:flex;flex-direction:column;gap:7px;font-size:11px;color:var(--muted)}
.ss-cast-workspace .field input[type="range"]{padding:0;min-height:28px;accent-color:var(--lilac);cursor:ew-resize}
.ss-cast-workspace .field small{font-size:10px;line-height:1.6;color:var(--muted)}
.ss-cast-workspace .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.ss-cast-workspace .field-wide{grid-column:1/-1}
.ss-cast-workspace .identity-reference{padding:15px;display:flex;align-items:center;gap:14px;background:var(--surface);border:1px solid var(--line);border-radius:12px;margin-bottom:19px}
.ss-cast-workspace .identity-reference p{font-size:10px;color:var(--muted);margin-top:4px}
.ss-cast-workspace .field-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px}
.ss-cast-workspace .independent-note{padding:13px 14px;border:1px solid var(--line);background:var(--surface);border-radius:10px;display:flex;gap:10px;font-size:10px;color:var(--mint);margin-top:20px;line-height:1.7}
.ss-cast-workspace .independent-note .icon{width:15px;height:15px;margin-top:2px}
.ss-cast-workspace .empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:62px 23px;gap:12px;min-width:0}
.ss-cast-workspace .empty-stamp{width:75px;height:87px;display:grid;place-items:center;border:1px solid var(--line);background:var(--surface);color:var(--lilac);border-radius:17px;transform:rotate(-6deg);margin:0 0 13px}
.ss-cast-workspace .empty-stamp .icon{width:29px;height:29px}
.ss-cast-workspace .empty h2{font-size:28px}
.ss-cast-workspace .empty p{font-size:12px;line-height:1.8;color:var(--muted);max-width:310px}
.ss-cast-workspace .workspace-empty{grid-column:2/-1;border:1px dashed var(--line);border-radius:20px;min-height:460px;background:var(--surface)}
.ss-cast-workspace .empty-set{border:1px dashed var(--line);border-radius:15px;padding:38px 20px}
.ss-cast-workspace .empty-set h2{font-size:24px}
.ss-cast-workspace .empty-set p{font-size:11px}
.ss-cast-workspace .skeleton{min-height:360px;background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:13px;animation:ss-cast-pulse 1s infinite alternate}
.ss-cast-workspace .skeleton>div{height:190px;border-radius:12px;background:var(--raised)}
.ss-cast-workspace .skeleton:after{content:"";display:block;width:65%;height:14px;border-radius:5px;background:var(--raised);margin:30px 10px}
.ss-cast-workspace .loading-note{text-align:center;color:var(--muted);font-size:12px;padding:20px}
.ss-cast-workspace .no-results{grid-column:1/-1}
.ss-cast-workspace .view-menu{position:relative}
.ss-cast-workspace .popover{position:absolute;right:0;top:47px;min-width:170px;background:var(--surface);padding:6px;border:1px solid var(--line);border-radius:12px;z-index:10;box-shadow:0 15px 35px color-mix(in srgb,var(--ss-canvas-bg) 60%,transparent)}
.ss-cast-workspace .popover button{padding:9px 11px;background:transparent;text-align:left;border-radius:7px;width:100%;font-size:11px;display:block}
.ss-cast-workspace .popover button:hover{background:var(--ss-button-hover)}
.ss-cast-workspace .dialog{position:fixed;inset:var(--app-interactive-safe-top,0px) 0 0;margin:auto;padding:0;border:1px solid var(--line);border-radius:21px;background:var(--surface);color:var(--ss-text,#f0edf8);width:min(490px,calc(var(--app-scaled-viewport-width,100vw) - 28px));max-width:none;max-height:calc(var(--app-interactive-viewport-height,100dvh) - 38px);overflow:auto;box-shadow:0 30px 100px color-mix(in srgb,var(--ss-canvas-bg) 60%,transparent)}
.ss-cast-workspace .dialog::backdrop{background:color-mix(in srgb,var(--ss-canvas-bg) 72%,transparent);backdrop-filter:blur(7px)}
.ss-cast-workspace .dialog.wide{width:min(890px,calc(var(--app-scaled-viewport-width,100vw) - 28px))}
.ss-cast-workspace .dialog-header{display:flex;align-items:flex-start;gap:15px;justify-content:space-between;padding:24px 25px 19px;border-bottom:1px solid var(--line);background:var(--ss-header-bg)}
.ss-cast-workspace .dialog-header h2{font-size:28px;margin:5px 0}
.ss-cast-workspace .dialog-header p{font-size:11px;color:var(--muted);max-width:420px;line-height:1.7}
.ss-cast-workspace .dialog-header .icon-button{flex:none}
.ss-cast-workspace .dialog-body{padding:24px 25px}
.ss-cast-workspace .dialog-footer{padding:17px 25px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--ss-header-bg)}
.ss-cast-workspace .dialog-footer p{font-size:10px;color:var(--muted);max-width:240px;line-height:1.7}
.ss-cast-workspace .dialog-footer .actions{display:flex;gap:8px;margin-left:auto}
.ss-cast-workspace .accent-picker{display:flex;gap:9px;margin-top:3px}
.ss-cast-workspace .swatch{width:31px;height:31px;border-radius:50%;border:3px solid var(--line);outline:1px solid var(--line);background:var(--swatch)}
.ss-cast-workspace .swatch[aria-pressed=true]{outline:2px solid var(--lilac)}
.ss-cast-workspace .form-stack{display:flex;flex-direction:column;gap:18px}
.ss-cast-workspace .role-options{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ss-cast-workspace .role-options .button{min-width:0;white-space:normal}
.ss-cast-workspace .character-choice{white-space:normal;overflow-wrap:anywhere;justify-content:flex-start;text-align:left;display:flex;align-items:center;gap:11px;width:100%;min-height:56px}
.ss-cast-workspace .cast-character-avatar{position:relative;display:grid;place-items:center;flex:0 0 40px;width:40px;height:40px;overflow:hidden;border-radius:9px;border:1px solid var(--ss-outline);background:var(--ss-panel-hi);color:var(--ss-muted)}
.ss-cast-workspace .cast-character-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 20%;background:var(--ss-panel-hi)}
.ss-cast-workspace .cast-character-avatar img[hidden]{display:none}
.ss-cast-workspace .cast-character-avatar-initial{font:600 16px/1 var(--serif)}
.ss-cast-workspace .cast-character-name{min-width:0;flex:1}
.ss-cast-workspace .role-choice{padding:13px;border:1px solid var(--line);border-radius:11px;text-align:left;background:var(--surface);color:var(--muted);display:flex;gap:9px;align-items:center;font-size:11px}
.ss-cast-workspace .role-choice[aria-pressed=true]{border-color:var(--lilac);background:var(--ss-accent-soft);color:var(--text)}
.ss-cast-workspace .advanced{margin-top:20px;border-top:1px solid var(--line);padding-top:15px}
.ss-cast-workspace .advanced summary{font-size:11px;color:var(--muted);cursor:pointer}
.ss-cast-workspace .advanced .field-grid{margin-top:17px}
.ss-cast-workspace .use-tabs{display:flex;gap:5px;margin-bottom:20px;background:var(--ss-field-bg);border:1px solid var(--line);padding:4px;border-radius:10px}
.ss-cast-workspace .use-tabs button{background:transparent;flex:1;padding:9px;color:var(--muted);border-radius:7px;font-size:11px}
.ss-cast-workspace .use-tabs button[aria-selected=true]{background:var(--ss-accent-soft);color:var(--lilac)}
.ss-cast-workspace .option-card{padding:15px;background:var(--surface);border:1px solid var(--line);border-radius:12px;display:flex;gap:12px;margin-bottom:11px;cursor:pointer;align-items:flex-start}
.ss-cast-workspace .option-card input{width:16px;height:16px;min-height:16px;accent-color:var(--lilac);margin:3px 0 0;flex:none}
.ss-cast-workspace .option-card strong{display:block;font-size:12px}
.ss-cast-workspace .option-card small{display:block;font-size:10px;color:var(--muted);line-height:1.8;margin-top:4px}
.ss-cast-workspace .toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);display:flex;gap:9px;align-items:center;background:var(--surface);border:1px solid var(--line);padding:13px 19px;border-radius:13px;font-size:12px;box-shadow:0 6px 30px color-mix(in srgb,var(--ss-canvas-bg) 60%,transparent);z-index:100;max-width:calc(100vw - 30px);width:max-content}
.ss-cast-workspace .toast .icon{color:var(--mint)}
.ss-cast-workspace .flash-note{background:var(--ss-accent-soft);border:1px solid var(--line);border-radius:9px;padding:11px 13px;font-size:10px;color:var(--lilac);margin-bottom:18px;line-height:1.7}
@keyframes ss-cast-pulse{to{opacity:.5}}
@container cast-album (min-width:1450px){.ss-cast-workspace .cast-page{padding-top:48px}
.ss-cast-workspace .album-grid{gap:26px}
.ss-cast-workspace .cover{height:226px}
.ss-cast-workspace .workspace{grid-template-columns:220px minmax(0,1fr);gap:30px}
.ss-cast-workspace .expression-portrait{height:144px}
}
@container cast-album (max-width:1100px){.ss-cast-workspace .cast-page{padding:28px 25px 60px}
.ss-cast-workspace .workspace{grid-template-columns:180px minmax(0,1fr);gap:18px}
.ss-cast-workspace .member-profile h2{font-size:23px}
.ss-cast-workspace .expression-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.ss-cast-workspace .album-grid{gap:16px}
.ss-cast-workspace .cover{height:180px}
.ss-cast-workspace .cover .photo{width:79px;height:112px}
.ss-cast-workspace .toolbar{flex-wrap:wrap}
.ss-cast-workspace .search{max-width:none;min-width:200px}
.ss-cast-workspace .head-actions .button{padding-inline:11px}
.ss-cast-workspace .style-option{grid-template-columns:90px 1fr;gap:11px}
.ss-cast-workspace .style-action{flex-direction:column;align-items:flex-start}
.ss-cast-workspace .style-action p{max-width:none}
.ss-cast-workspace .style-action .button{width:100%}
}
@container cast-album (max-width:850px){.ss-cast-workspace .workspace{grid-template-columns:160px minmax(0,1fr)}
.ss-cast-workspace .preview-panel{grid-column:2;position:static;margin-top:5px}
.ss-cast-workspace .preview-stage{min-height:240px}
.ss-cast-workspace .expression-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
.ss-cast-workspace .workspace-empty{grid-column:2}
.ss-cast-workspace .album-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
.ss-cast-workspace .new-cast-card{min-height:100px}
.ss-cast-workspace .album-intro{flex-wrap:wrap}
.ss-cast-workspace .workspace-head{flex-wrap:wrap}
.ss-cast-workspace .style-option{grid-template-columns:120px 1fr}
}
@container cast-album (max-width:600px){.ss-cast-workspace .cast-page{padding:26px 17px 40px}
.ss-cast-workspace .page-head{align-items:flex-start;gap:13px;margin-bottom:24px}
.ss-cast-workspace .page-head h1{font-size:27px;letter-spacing:-.7px}
.ss-cast-workspace .page-head p{font-size:11px;max-width:230px;line-height:1.7}
.ss-cast-workspace .page-head .button{min-height:39px;padding:9px 12px;font-size:11px}
.ss-cast-workspace .page-head .button .icon{width:14px;height:14px}
.ss-cast-workspace .page-head .eyebrow{font-size:8px;letter-spacing:1.4px}
.ss-cast-workspace .album-intro{padding:12px;gap:10px;margin-bottom:23px}
.ss-cast-workspace .album-intro strong{font-size:11px}
.ss-cast-workspace .album-intro p{font-size:10px}
.ss-cast-workspace .intro-mark{width:30px;height:30px}
.ss-cast-workspace .album-intro .button{min-height:31px;padding:6px 9px;font-size:9px}
.ss-cast-workspace .toolbar{gap:9px;margin-bottom:16px}
.ss-cast-workspace .search{min-width:100%;order:0}
.ss-cast-workspace .chips{order:1;flex-wrap:nowrap;gap:2px}
.ss-cast-workspace .chip{padding:7px 9px;font-size:10px}
.ss-cast-workspace .sort{order:2;padding:5px;min-height:32px;font-size:10px;max-width:117px}
.ss-cast-workspace .album-grid{gap:14px;grid-template-columns:minmax(0,1fr)}
.ss-cast-workspace .cover{height:190px}
.ss-cast-workspace .cover .photo{height:126px;width:94px}
.ss-cast-workspace .cast-card-copy{padding:15px 10px 8px}
.ss-cast-workspace .cast-card h3{font-size:25px}
.ss-cast-workspace .cast-card .desc{min-height:0;margin-bottom:14px}
.ss-cast-workspace .new-cast-card{min-height:72px;gap:14px;flex-direction:row;text-align:left}
.ss-cast-workspace .new-cast-card .plus-circle{width:39px;height:39px}
.ss-cast-workspace .library-foot{font-size:9px;line-height:1.6}
.ss-cast-workspace .breadcrumb{margin-bottom:19px}
.ss-cast-workspace .workspace-head{gap:11px;margin-bottom:20px}
.ss-cast-workspace .cast-symbol{width:39px;height:46px;border-radius:10px;font-size:22px}
.ss-cast-workspace .workspace-head h1{font-size:31px}
.ss-cast-workspace .workspace-head p{font-size:10px}
.ss-cast-workspace .head-actions{width:100%;margin-left:0;gap:7px}
.ss-cast-workspace .head-actions .button{flex:1;min-height:39px;font-size:10px}
.ss-cast-workspace .workspace{display:flex;flex-direction:column;gap:23px}
.ss-cast-workspace .roster{width:100%;border-bottom:1px solid var(--line);padding-bottom:14px}
.ss-cast-workspace .roster-head{font-size:9px;padding:0 0 9px}
.ss-cast-workspace .roster-items{display:grid;grid-auto-flow:column;grid-auto-columns:132px;overflow:auto;padding:2px 1px 8px;gap:6px;scrollbar-width:thin}
.ss-cast-workspace .member-button{padding:8px;gap:8px;min-height:58px;border-radius:11px}
.ss-cast-workspace .member-button strong{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:78px}
.ss-cast-workspace .member-button small{font-size:8px}
.ss-cast-workspace .member-button .portrait{width:30px;height:36px;border-radius:8px}
.ss-cast-workspace .add-member{min-height:37px;font-size:10px;margin-top:5px}
.ss-cast-workspace .roster-note{display:none}
.ss-cast-workspace .member-body{width:100%}
.ss-cast-workspace .member-profile{margin-bottom:19px}
.ss-cast-workspace .member-profile .portrait.large{width:53px;height:63px;border-radius:12px}
.ss-cast-workspace .member-profile h2{font-size:25px}
.ss-cast-workspace .member-profile .pill{font-size:8px;padding:5px 6px}
.ss-cast-workspace .member-tabs{margin-bottom:22px;gap:26px}
.ss-cast-workspace .member-tabs button{font-size:11px}
.ss-cast-workspace .section-heading h3{font-size:14px}
.ss-cast-workspace .section-heading .button{font-size:10px;padding:8px 10px;min-height:35px}
.ss-cast-workspace .section-heading .button .icon{width:14px;height:14px}
.ss-cast-workspace .expression-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.ss-cast-workspace .expression-portrait{height:108px}
.ss-cast-workspace .expression-tile{padding:5px}
.ss-cast-workspace .caption{font-size:9px;padding:7px 1px 2px}
.ss-cast-workspace .expression-add{min-height:142px;font-size:9px}
.ss-cast-workspace .expression-tools{font-size:9px}
.ss-cast-workspace .use-tag code{font-size:10px}
.ss-cast-workspace .preview-panel{width:100%;margin-top:0}
.ss-cast-workspace .preview-stage{padding:19px 23px;min-height:280px}
.ss-cast-workspace .member-body .preview-stage{min-height:0;padding-block:13px}
.ss-cast-workspace .member-body .chat-date,.ss-cast-workspace .member-body .preview-footer p{display:none}
.ss-cast-workspace .member-body .preview-header{padding-block:11px}
.ss-cast-workspace .story-image{width:81px;height:100px}
.ss-cast-workspace .story-card q{font-size:15px}
.ss-cast-workspace .workspace-empty{min-height:350px;width:100%}
.ss-cast-workspace .empty{padding:40px 20px}
.ss-cast-workspace .empty h2{font-size:25px}
.ss-cast-workspace .empty p{font-size:11px}
.ss-cast-workspace .style-option{grid-template-columns:106px 1fr;gap:12px}
.ss-cast-workspace .style-option h3{font-size:11px}
.ss-cast-workspace .style-option p{font-size:9px}
.ss-cast-workspace .style-action{flex-direction:column;align-items:stretch}
.ss-cast-workspace .style-action .button{width:100%}
.ss-cast-workspace .field-grid{grid-template-columns:1fr}
.ss-cast-workspace .field-wide{grid-column:auto}
.ss-cast-workspace .dialog{max-height:calc(var(--app-interactive-viewport-height,100dvh) - 20px);border-radius:17px}
.ss-cast-workspace .dialog-header{padding:18px 18px 16px}
.ss-cast-workspace .dialog-header h2{font-size:26px}
.ss-cast-workspace .dialog-body{padding:19px 18px}
.ss-cast-workspace .dialog-footer{padding:14px 18px;flex-wrap:wrap}
.ss-cast-workspace .dialog-footer p{font-size:9px;max-width:none}
.ss-cast-workspace .dialog-footer .actions{flex:1;justify-content:flex-end}
.ss-cast-workspace .dialog-footer .button{min-height:38px;padding:9px 12px;font-size:11px}
.ss-cast-workspace .role-choice{font-size:10px;padding:11px}
.ss-cast-workspace .toast{font-size:11px;bottom:16px;padding:11px 13px}
.ss-cast-workspace .use-tabs button{font-size:10px;padding:8px 5px}
}
@media(prefers-reduced-motion:reduce){.ss-cast-workspace *,.ss-cast-workspace *:before,.ss-cast-workspace *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}

.ss-cast-workspace .cast-status{margin:0 auto;max-width:1240px;font-size:11px;color:var(--muted);padding:10px 0;overflow-wrap:anywhere}
.ss-cast-workspace .cast-warning{border:1px solid var(--line);background:var(--surface);color:var(--muted);border-radius:11px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
.ss-cast-workspace .member-button strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.ss-cast-workspace .cast-set-preferences{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0}
/* Styles workspace (editor, searchable LoRA library, and stack) */
.ss-styles-workspace { flex:1 1 0; min-width:0; min-height:0; padding:10px; display:flex; flex-direction:column; gap:9px; overflow:hidden; }
.ss-styles-header { display:flex; gap:10px; align-items:center; justify-content:space-between; padding:3px 4px; }
.ss-styles-header strong { font-size:14px; }
.ss-styles-columns { display:grid; grid-template-columns:minmax(220px,var(--ss-styles-editor-width)) 6px minmax(160px,1fr) 6px minmax(220px,var(--ss-styles-stack-width)); gap:4px; flex:1; min-height:0; min-width:0; }
.ss-styles-resizer { cursor:col-resize; min-width:6px; border-radius:6px; background:transparent; border:1px solid transparent; touch-action:none; }
.ss-styles-resizer:hover,.ss-styles-resizer:focus-visible { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-style-column { display:flex; flex-direction:column; overflow:hidden; padding:12px; gap:10px; }
.ss-styles-columns[data-collapsed='true'] { grid-template-columns:42px 6px minmax(160px,1fr) 6px minmax(220px,var(--ss-styles-stack-width)); }
.ss-styles-columns[data-collapsed='true'] .ss-style-editor-column { padding:4px; }
.ss-styles-columns[data-collapsed='true'] .ss-saved-style-editor { display:none; }
.ss-style-collapse { flex:none; }
.ss-saved-style-editor { display:flex; flex-direction:column; gap:13px; min-height:0; overflow:auto; }
.ss-style-selection { display:grid; grid-template-columns:auto minmax(0,1fr); gap:8px; align-items:end; }
.ss-style-selection p { grid-column:1/-1; margin:0; }
.ss-style-columns,.ss-style-composition { display:grid; gap:10px; }
.ss-style-composition h3 { font-size:11px; color:var(--ss-text); margin:0; }
.ss-saved-style-editor label { text-transform:none; letter-spacing:normal; font-size:11px; }
.ss-saved-style-editor label :is(.ss-input,.ss-select,.ss-textarea) { margin-top:5px; }
.ss-style-recipe { border:1px solid var(--ss-outline); border-radius:10px; padding:11px; background:var(--ss-panel-hi); }
.ss-style-recipe > summary { font-size:12px; font-weight:720; cursor:pointer; }
.ss-style-recipe > summary span { font-size:10px; display:block; margin-top:4px; color:var(--ss-muted); }
.ss-style-recipe > :not(summary) { margin-top:10px; }
.ss-recipe-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
.ss-style-footer { display:flex; flex-wrap:wrap; gap:6px; flex:none; border-top:1px solid var(--ss-border-subtle); padding-top:10px; }
.ss-style-more { position:relative; }
.ss-style-more > summary { list-style:none; width:34px; min-height:34px; font-size:17px; padding:5px; }
.ss-style-more > summary::-webkit-details-marker { display:none; }
.ss-style-more-actions { display:flex; flex-direction:column; position:absolute; bottom:calc(100% + 6px); right:0; z-index:50; min-width:180px; gap:5px; padding:8px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-bg); box-shadow:0 12px 36px #0009; }
.ss-style-more:not([open]) .ss-style-more-actions { display:none; }
.ss-style-column > :is(.ss-lora-library,.ss-stack-pane) { display:flex; flex-direction:column; flex:1; min-height:0; width:100%; padding:0; gap:10px; }
.ss-lora-library { display:flex; flex-direction:column; gap:10px; overflow:hidden; }
.ss-lora-titlebar { display:flex; gap:9px; flex-wrap:wrap; align-items:center; justify-content:space-between; }
.ss-library-tools { display:flex; flex-wrap:wrap; align-items:center; gap:7px; }
.ss-lora-query { flex:1 1 100%; min-width:0; position:relative; }
.ss-lora-query > .ss-input { width:100%; }
.ss-lora-download-entry { display:flex; flex-wrap:wrap; gap:5px; padding:8px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-panel-hi); }
.ss-lora-download-entry .ss-input { flex:1 1 180px; }
.ss-lora-download-status { height:5px; width:100%; background:var(--ss-outline); border-radius:99px; overflow:hidden; }
.ss-lora-download-status i { display:block; width:35%; height:100%; background:var(--ss-accent); }
.ss-lora-filter { flex:1; }
.ss-lora-sort-wrap { position:relative; }
.ss-lora-sort-menu { position:absolute; z-index:20; top:calc(100% + 5px); right:0; min-width:120px; padding:4px; background:var(--ss-panel-hi); border:1px solid var(--ss-outline); border-radius:9px; box-shadow:0 8px 24px #0009; }
.ss-lora-sort-choice { display:block; width:100%; border:0; background:transparent; color:var(--ss-text); padding:7px; text-align:left; border-radius:6px; }
.ss-lora-sort-choice:hover,.ss-lora-sort-choice[data-selected='true'] { background:var(--ss-accent-soft); }
.ss-lora-tool-icon { width:34px; height:34px; display:grid; place-items:center; }
.ss-lora-tool-icon svg { fill:none; stroke:currentColor; color:var(--ss-text); }
.ss-lora-browser { position:relative; display:grid; min-height:0; flex:1; grid-template-columns:minmax(0,1fr); }
.ss-lora-folder-sidebar { position:absolute; inset:0 auto 0 0; z-index:24; width:min(82%,250px); padding:11px; background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:10px; box-shadow:4px 5px 26px #0009; display:flex; flex-direction:column; }
.ss-lora-folder-head { display:flex; align-items:center; justify-content:space-between; }
.ss-lora-folder-tree { flex:1; overflow:auto; display:grid; align-content:start; gap:4px; }
.ss-lora-folder-row { display:flex; align-items:center; gap:7px; padding:7px; min-width:0; background:transparent; border:1px solid transparent; border-radius:6px; color:var(--ss-text); text-align:left; }
.ss-lora-folder-row[data-selected='true'] { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-lora-folder-row svg { flex:none; color:var(--ss-muted); }
.ss-lora-folder-row[data-selected='true'] svg { color:var(--ss-accent); }
 .ss-lora-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(175px,100%),1fr)); grid-auto-rows:max-content; gap:10px; padding:3px 5px 7px 3px; min-height:0; height:100%; overflow-y:auto; overflow-x:hidden; align-content:start; align-items:start; }
.ss-lora-card { display:flex; flex-direction:column; align-self:start; min-width:0; min-height:0; overflow:hidden; border:1px solid var(--ss-outline); border-radius:11px; background:var(--ss-panel-hi); transition:border-color .15s; }
.ss-lora-card:hover { border-color:var(--ss-accent-line); }
.ss-lora-preview { position:relative; flex:0 0 auto; height:auto; min-height:0; aspect-ratio:1.5; border-radius:9px 9px 0 0; background:var(--ss-canvas-bg); overflow:hidden; }
.ss-lora-preview img { position:absolute; inset:0; width:100%; height:100%; max-width:100%; max-height:100%; object-fit:cover; opacity:0; }
.ss-lora-preview img[data-loaded='true'] { opacity:1; }
.ss-lora-preview:has(img[data-loaded='true']) .ss-lora-placeholder { visibility:hidden; }
.ss-lora-placeholder { height:100%; display:grid; place-items:center; color:var(--ss-dim); }
.ss-lora-body { display:grid; gap:7px; padding:8px; min-width:0; align-items:center; }
.ss-lora-title { color:var(--ss-text); font-weight:730; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ss-lora-footer { display:flex; justify-content:flex-end; align-items:center; gap:6px; }
.ss-shell .ss-lora-footer .ss-add-button { width:auto; min-height:29px; height:29px; padding:0 10px; font-size:10px; font-weight:700; line-height:1; }
.ss-shell .ss-lora-footer .ss-lora-more { width:29px; min-width:29px; min-height:29px; height:29px; padding:0; font-size:17px; }
.ss-library-pagination { display:flex; justify-content:space-between; align-items:center; gap:9px; flex:none; padding-top:8px; border-top:1px solid var(--ss-border-subtle); }
/* Settings dialog, workflow overlay, inspectors, output library. */
.ss-settings-layer { position:fixed; inset:0; z-index:99990; display:grid; place-items:center; }
.ss-settings-backdrop { position:absolute; inset:0; cursor:default; border:0; background:#09090ec9; backdrop-filter:blur(8px); }
.ss-settings-dialog { position:relative; z-index:1; width:min(820px,calc(100vw - 26px)); height:min(700px,calc(100dvh - 26px)); background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:15px; box-shadow:0 24px 100px #000b; display:flex; flex-direction:column; overflow:hidden; }
.ss-settings-header { display:flex; justify-content:space-between; align-items:center; padding:18px; border-bottom:1px solid var(--ss-border-subtle); }
.ss-settings-title { display:grid; gap:3px; }
.ss-settings-title strong { font-size:17px; }
.ss-settings-title span { color:#a9a3b8; font-size:11px; }
.ss-settings-tabs { display:flex; gap:5px; padding:8px 12px; background:var(--ss-header-bg); border-bottom:1px solid var(--ss-border-subtle); }
.ss-settings-tab { display:flex; align-items:center; justify-content:center; gap:7px; flex:1; padding:9px; border:1px solid transparent; border-radius:8px; color:var(--ss-muted); background:transparent; }
.ss-settings-tab[data-active='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-text); }
.ss-settings-tab svg { fill:none; stroke:currentColor; flex:none; }
.ss-settings-tab { min-width:0; }
.ss-stage-direction [data-stage-direction-body] { display:grid; gap:12px; }
.ss-stage-direction [hidden] { display:none !important; }
.ss-stage-scope-tabs,.ss-stage-segment>div { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); gap:3px; padding:3px; background:var(--ss-field-bg,var(--ss-button-bg)); border-radius:9px; }
.ss-stage-scope-tabs button,.ss-stage-segment label span { display:flex; align-items:center; justify-content:center; text-align:center; min-height:38px; padding:5px; font-size:11px; border:0; border-radius:6px; color:var(--ss-muted); background:transparent; overflow-wrap:anywhere; }
.ss-stage-scope-tabs button[aria-pressed=true],.ss-stage-segment input:checked+span { background:var(--ss-accent-soft); color:var(--ss-text); font-weight:600; }
.ss-stage-segment { border:0; margin:0; padding:0; min-width:0; }
.ss-stage-segment legend { margin-bottom:6px; font-size:11px; font-weight:600; color:var(--ss-text); }
.ss-stage-segment label { position:relative; min-width:0; cursor:pointer; }
.ss-stage-segment input { position:absolute; opacity:0; inset:0; width:100%; height:100%; margin:0; cursor:pointer; }
.ss-stage-segment input:focus-visible+span { outline:2px solid var(--ss-accent); }
.ss-stage-toggle { display:flex; align-items:center; justify-content:space-between; gap:14px; min-height:42px; padding:4px 0; }
.ss-stage-toggle>span { display:grid; gap:3px; min-width:0; }
.ss-stage-toggle strong { font-size:12px; color:var(--ss-text); }
.ss-stage-toggle small { font-size:11px; line-height:1.45; color:var(--ss-muted); }
.ss-stage-toggle input { width:19px; height:19px; flex:none; accent-color:var(--ss-accent); }
.ss-stage-direction [data-stage-auto],.ss-stage-macros { display:grid; gap:12px; }
.ss-stage-depth { display:flex; gap:8px; align-items:center; justify-content:space-between; font-size:11px; }
.ss-stage-depth input { width:74px; min-width:0; }
.ss-stage-macros button { display:flex; justify-content:space-between; gap:4px; align-items:center; background:var(--ss-button-bg); color:var(--ss-text); border:0; border-radius:7px; padding:9px; font-size:11px; }
.ss-stage-macros code { overflow-wrap:anywhere; min-width:0; }
.ss-stage-save,.ss-stage-direction-footer { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:9px; }
.ss-stage-save button,.ss-stage-direction-footer button { min-height:40px; border:0; border-radius:8px; padding:8px 12px; background:var(--ss-button-bg); color:var(--ss-text); }
.ss-stage-save [data-stage-save] { background:var(--ss-accent-soft); color:var(--ss-text); margin-left:auto; font-weight:600; }
.ss-stage-direction-footer span { flex:1; min-width:0; font-size:11px; color:var(--ss-muted); }
.ss-stage-scope-tabs button:disabled { opacity:.45; }
@media(max-width:600px){.ss-settings-tabs .ss-settings-tab{flex-direction:column;gap:3px;line-height:1.15;text-align:center;white-space:normal}.ss-settings-tabs .ss-settings-tab svg{width:16px;height:16px}.ss-stage-scope-tabs button,.ss-stage-segment label span{font-size:10px;min-height:42px}.ss-stage-direction .ss-config-section{padding:12px}}
.ss-settings-content { flex:1; overflow:auto; padding:17px; }
.ss-settings-panel { display:grid; gap:16px; align-content:start; }
.ss-provider-diagnostics,.ss-provider-diagnostics .ss-config-section { min-width:0; }
.ss-diagnostic-tools { display:flex; flex-wrap:wrap; gap:6px; }
.ss-diagnostic-tools .ss-button { min-height:36px; }
.ss-provider-diagnostics [data-role="diagnostic-export-status"]:empty { display:none; }
.ss-diagnostic-table-wrap { max-width:100%; overflow:auto; border:1px solid var(--ss-outline); border-radius:8px; }
.ss-diagnostic-table { border-collapse:collapse; width:100%; font-size:11px; text-align:left; font-variant-numeric:tabular-nums; }
.ss-diagnostic-table :is(th,td) { padding:8px; border-bottom:1px solid var(--ss-border-subtle); vertical-align:top; white-space:nowrap; }
.ss-diagnostic-table th { color:var(--ss-muted); background:var(--ss-header-bg); font-weight:600; }
.ss-diagnostic-table tr:last-child td { border-bottom:0; }
.ss-diagnostic-raw { width:100%; min-height:200px; height:240px; resize:vertical; font-family:ui-monospace,Consolas,monospace; font-size:11px; line-height:1.5; overflow:auto; }
@media(max-width:600px) { .ss-settings-tabs { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); } .ss-diagnostic-tools .ss-button { flex:1 1 42%; } }
.ss-config-section { display:grid; gap:10px; padding:15px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-hi); }
.ss-config-section-head { display:grid; gap:3px; }
.ss-config-section-head strong { font-size:12px; }
.ss-config-section-head span { color:var(--ss-muted); font-size:10px; }
.ss-settings-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.ss-settings-help { display:grid; place-items:center; flex:none; width:32px; height:32px; padding:6px; border:0; border-radius:50%; color:var(--ss-muted); background:transparent; cursor:pointer; }
.ss-settings-help svg { width:20px; height:20px; }
.ss-settings-help:hover,.ss-settings-help[aria-expanded='true'] { color:var(--ss-accent); background:var(--ss-accent-soft); }
.ss-settings-help:focus-visible { outline:2px solid var(--ss-accent); outline-offset:2px; }
.ss-settings-help-popover { position:fixed; inset:auto; margin:0; width:min(320px,calc(100vw - 24px)); max-height:calc(100dvh - 24px); overflow:auto; padding:16px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-bg); color:var(--ss-text); box-shadow:0 12px 40px #0005; font-size:12px; line-height:1.65; }
.ss-settings-help-popover strong { font-size:12px; }
.ss-settings-help-popover p { margin:8px 0 0; color:var(--ss-muted); }

.ss-settings-toggle { position:relative; display:flex; justify-content:space-between; gap:13px; align-items:center; padding:11px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-panel-hi); cursor:pointer; }
.ss-settings-toggle-copy { display:grid; gap:3px; }
.ss-settings-toggle-copy strong { font-size:11px; }
.ss-settings-toggle-copy span { font-size:10px; color:#afa8bd; }
.ss-settings-toggle input { opacity:0; position:absolute; inset-inline-end:11px; top:50%; transform:translateY(-50%); margin:0; }
.ss-switch-track { width:35px; height:20px; flex:none; border-radius:20px; background:var(--ss-outline); position:relative; }
.ss-switch-track::after { content:''; position:absolute; top:3px; left:3px; width:14px; height:14px; background:#eeeaf3; border-radius:50%; transition:transform .15s; }
.ss-settings-toggle input:checked + .ss-switch-track { background:var(--ss-accent); }
.ss-settings-toggle input:checked + .ss-switch-track::after { transform:translateX(15px); }
.ss-request-mode-grid,.ss-appearance-colors,.ss-config-theme-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
.ss-image-scale-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
.ss-request-mode-button,.ss-image-scale-button { display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--ss-outline); border-radius:10px; color:var(--ss-text); background:var(--ss-button-bg); text-align:left; }
.ss-image-scale-button { min-width:0; flex-direction:column; gap:6px; padding:10px 3px; font-size:10px; white-space:nowrap; }
.ss-image-scale-button svg { display:block; width:clamp(35px,100%,64px); height:34px; fill:currentColor; }
.ss-request-mode-button[data-active='true'],.ss-image-scale-button[data-active='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-request-mode-button span:nth-child(2) { display:grid; gap:3px; }
.ss-request-mode-button small { color:#aba4b9; font-size:10px; }
.ss-parser-settings,.ss-parser-field,.ss-character-tags-editor { display:grid; gap:10px; }
.ss-image-count-range { display:grid; grid-template-columns:minmax(0,1fr) 58px auto 58px; align-items:center; gap:6px; }
.ss-config-field { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.ss-config-theme::before { content:''; display:block; width:12px; height:12px; background:var(--ss-swatch); border-radius:50%; }
.ss-color-control { display:flex; gap:8px; align-items:center; border:1px solid var(--ss-outline); background:var(--ss-panel-hi); padding:8px; border-radius:var(--ss-control-radius); }
.ss-color-control input[type='color'] { width:28px;height:28px;flex:none;padding:0;border:2px solid var(--ss-outline);border-radius:50%;background:transparent;overflow:hidden;cursor:pointer;appearance:none;-webkit-appearance:none; }
.ss-color-control input[type='color']::-webkit-color-swatch-wrapper { padding:0;border-radius:50%; }
.ss-color-control input[type='color']::-webkit-color-swatch { border:0;border-radius:50%; }
.ss-color-control input[type='color']::-moz-color-swatch { border:0;border-radius:50%; }
.ss-color-control input[type='color']:focus-visible { outline:2px solid var(--ss-accent);outline-offset:3px; }
.ss-appearance-range { display:grid; grid-template-columns:100px minmax(0,1fr) 38px; gap:8px; align-items:center; }
.ss-shell .ss-textarea.ss-protocol-editor { min-height:210px; font:12px/1.55 ui-monospace,monospace; }
.ss-config-actions,.ss-protocol-actions,.ss-character-tags-actions { display:flex; justify-content:flex-end; gap:7px; flex-wrap:wrap; }
.ss-css-guide,.ss-style-recipe,.ss-workflow-group { background:var(--ss-panel-hi); border:1px solid var(--ss-outline); border-radius:10px; }
.ss-css-guide > summary,.ss-workflow-group > summary { cursor:pointer; padding:10px; font-weight:650; color:var(--ss-text); }
.ss-css-guide pre { padding:12px; margin:0; overflow:auto; white-space:pre-wrap; font-size:10px; }
.ss-macro-guide-grid { display:grid; grid-template-columns:max-content minmax(0,1fr); gap:9px; padding:10px; font-size:10px; }
.ss-tag-protocol-example { border:1px dashed #675676; border-radius:8px; padding:10px; font-size:10px; overflow:auto; }
.ss-reference-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.ss-reference-dialog { position:fixed; inset:0; margin:auto; width:min(580px,calc(100vw - 24px)); max-height:calc(100dvh - 32px); padding:0; overflow:auto; border:1px solid var(--ss-outline); border-radius:16px; background:var(--ss-panel-bg); color:var(--ss-text); box-shadow:0 24px 80px #0007; }
.ss-reference-dialog::backdrop { background:#09090cbf; backdrop-filter:blur(8px); }
.ss-reference-dialog header { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:20px; border-bottom:1px solid var(--ss-outline); }
.ss-reference-dialog header span { font-size:10px; letter-spacing:.12em; color:var(--ss-accent); }
.ss-reference-dialog h2 { margin:6px 0 0; font-size:22px; }
.ss-reference-dialog form { display:grid; gap:18px; padding:20px; }
.ss-reference-dialog p { margin:0; color:var(--ss-muted); font-size:12px; line-height:1.7; overflow-wrap:anywhere; }
.ss-reference-dialog label { display:grid; gap:8px; font-size:12px; }
.ss-reference-dialog textarea { width:100%; min-height:120px; resize:vertical; padding:12px; border:1px solid var(--ss-outline); border-radius:10px; color:var(--ss-text); background:var(--ss-canvas-bg); font:12px/1.5 monospace; }
.ss-reference-dialog footer { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.ss-reference-dialog button { min-height:44px; }
.ss-reference-dialog header .ss-icon-button { width:44px; }
.ss-reference-dialog :focus-visible { outline:2px solid var(--ss-accent); outline-offset:3px; }
.ss-workflow-modal { position:absolute; inset:0; z-index:120; display:grid; place-items:center; padding:14px; background:#09090cca; backdrop-filter:blur(6px); }
.ss-workflow-modal:is([data-role="move-folder-modal"], [data-role="new-folder-modal"]) { z-index: 2147483200; }
.ss-workflow-modal-card { width:min(650px,100%); max-height:90%; overflow:auto; display:grid; gap:12px; padding:17px; border:1px solid var(--ss-outline); background:var(--ss-panel-bg); border-radius:14px; box-shadow:0 18px 70px #000b; }
.ss-workflow-modal-head { display:flex; justify-content:space-between; align-items:start; gap:10px; }
.ss-workflow-modal-title { display:grid; gap:4px; }
.ss-workflow-modal-title strong { font-size:16px; }
.ss-workflow-modal-description { color:var(--ss-muted); font-size:11px; }
.ss-workflow-modal-actions { display:flex; justify-content:flex-end; gap:8px; }
/* Swarm preset sheet | condensed parameter grid, actual values available on demand. */
.ss-workflow-modal[data-role='save-preset-modal'] .ss-workflow-modal-card {
  width:min(860px,100%); max-height:min(810px,calc(100% - 24px),calc(100dvh - 30px)); min-width:0; min-height:0;
  grid-template-rows:auto minmax(0,1fr) auto; gap:0; padding:0; overflow:hidden;
}
.ss-workflow-modal[data-role='save-preset-modal'] .ss-workflow-modal-head {
  padding:19px 22px 13px; align-items:center; border-bottom:1px solid var(--ss-border-subtle);
}
.ss-save-preset-fields {
  display:grid; grid-template-rows:auto auto minmax(0,1fr) auto; gap:0;
  min-width:0; min-height:0; overflow:hidden; padding:0 22px;
}
.ss-save-preset-basics {
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px;
  min-width:0; padding:16px 0 15px;
}
.ss-save-preset-basics .ss-field { min-width:0; }
.ss-save-preset-toolbar {
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;
  min-height:44px; border-top:1px solid var(--ss-border-subtle); border-bottom:1px solid var(--ss-border-subtle);
}
.ss-save-preset-toolbar-copy { display:flex; align-items:baseline; gap:10px; min-width:0; }
.ss-save-preset-toolbar-copy strong { font-size:12px; font-weight:740; }
.ss-save-preset-toolbar-copy span { font-size:11px; color:var(--ss-muted); font-variant-numeric:tabular-nums; }
.ss-save-preset-bulk { display:flex; align-items:center; gap:3px; }
.ss-workflow-modal[data-role='save-preset-modal'] .ss-save-preset-bulk .ss-button {
  min-height:29px; padding:4px 9px; border:0; background:transparent; color:var(--ss-muted); font-size:11px;
}
.ss-workflow-modal[data-role='save-preset-modal'] .ss-save-preset-bulk .ss-button:hover { color:var(--ss-accent); background:var(--ss-accent-soft); }
.ss-save-param-list {
  display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); grid-auto-rows:max-content;
  align-content:start; column-gap:22px; min-width:0; min-height:0;
  overflow-x:hidden; overflow-y:auto; padding:3px 0 12px; scrollbar-width:thin;
  overscroll-behavior:contain;
}
.ss-save-param {
  display:grid; grid-template-columns:minmax(0,1fr) auto; align-content:start; align-items:center;
  min-width:0; min-height:61px; border-bottom:1px solid var(--ss-border-subtle);
  color:var(--ss-text);
}
.ss-save-param:focus-within { background:var(--ss-accent-soft); }
.ss-save-param-line {
  display:grid; grid-template-columns:17px minmax(0,1fr); align-items:start; gap:9px;
  min-width:0; padding:10px 3px; cursor:pointer;
}
.ss-save-param-line input[type='checkbox'] { width:15px; height:15px; margin:2px 0 0; cursor:pointer; }
.ss-save-param-copy { display:grid; gap:3px; min-width:0; }
.ss-save-param-copy strong { color:var(--ss-text); font-size:12px; font-weight:710; line-height:1.25; }
.ss-save-param-copy > span {
  min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
  color:var(--ss-muted); font:11px/1.45 ui-monospace,Consolas,monospace;
}
.ss-save-param-expand {
  padding:3px 5px; margin-right:1px; min-width:36px; min-height:26px;
  border:0; border-radius:6px; color:var(--ss-accent); background:transparent;
  font-size:10px; cursor:pointer;
}
.ss-save-param-expand:hover { background:var(--ss-accent-soft); }
.ss-save-param-full {
  grid-column:1/-1; max-height:160px; overflow:auto; margin:0 2px 10px 26px;
  padding:9px 10px; border:1px solid var(--ss-border-subtle); border-radius:7px;
  background:var(--ss-field-bg); color:var(--ss-text); white-space:pre-wrap;
  word-break:break-word; overflow-wrap:anywhere; font:11px/1.55 ui-monospace,Consolas,monospace;
}
.ss-save-preset-note { margin:0; padding:10px 0 12px; color:var(--ss-muted); font-size:10px; line-height:1.45; }
.ss-workflow-modal[data-role='save-preset-modal'] .ss-workflow-modal-actions {
  flex:none; align-items:center; padding:12px 22px max(12px,env(safe-area-inset-bottom,0px));
  border-top:1px solid var(--ss-border-subtle);
}
/* Preset manager uses a matching quiet list, not nested bordered cards. */
.ss-preset-manager-list { display:grid; gap:0; min-width:0; max-height:min(450px,50dvh); overflow:auto; scrollbar-width:thin; }
.ss-preset-manager-row {
  display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:12px;
  min-width:0; padding:12px 2px; border-bottom:1px solid var(--ss-border-subtle);
}
.ss-preset-manager-copy { display:grid; gap:4px; min-width:0; }
.ss-preset-manager-copy strong { color:var(--ss-text); font-size:12px; overflow-wrap:anywhere; }
.ss-preset-manager-copy span { color:var(--ss-muted); font-size:11px; line-height:1.4; overflow-wrap:anywhere; }
@media(max-width:630px) {
  .ss-workflow-modal[data-role='save-preset-modal'] .ss-workflow-modal-head { padding:14px 15px 12px; }
  .ss-save-preset-fields { padding:0 15px; }
  .ss-save-preset-basics { grid-template-columns:minmax(0,1fr); gap:10px; padding:12px 0; }
  .ss-save-param-list { grid-template-columns:minmax(0,1fr); }
  .ss-workflow-modal[data-role='save-preset-modal'] .ss-workflow-modal-actions { padding:10px 15px max(10px,env(safe-area-inset-bottom,0px)); }
}
@media(max-width:365px) {
  .ss-save-preset-toolbar { align-items:flex-start; flex-direction:column; gap:1px; padding-top:7px; }
  .ss-save-preset-bulk { align-self:flex-end; }
}

.ss-workflow-fields,.ss-workflow-field-grid { display:grid; gap:10px; }
.ss-workflow-field-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
.ss-workflow-field { display:grid; gap:7px; padding:10px; background:var(--ss-panel-hi); border-radius:8px; }
.ss-workflow-field-head { display:flex; gap:7px; align-items:center; justify-content:space-between; }
/* Image Studio | Inspector lightbox and inpaint workspace. Single authored component rules. */
.ss-inspector {
  position:absolute; inset:0; z-index:120; min-height:0; min-width:0;
  display:grid; grid-template-columns:minmax(0,1fr) clamp(310px,28vw,385px);
  gap:0; background:var(--ss-canvas-bg); color:var(--ss-text);
}
.ss-inspector-stage {
  position:relative; min-width:0; min-height:0; overflow:hidden;
  display:grid; grid-template-rows:50px minmax(0,1fr) 46px;
  background:#0d0b11; color:#eae6f1;
}
.ss-inspector-topline { display:flex; justify-content:space-between; align-items:center; padding:10px clamp(14px,2vw,26px); border-bottom:1px solid #ffffff12; }
.ss-inspector-eyebrow { display:block; color:var(--ss-dim); font-size:9px; letter-spacing:.13em; text-transform:uppercase; font-weight:750; }
.ss-inspector-stage .ss-inspector-eyebrow { color:#aaa4b4; }
.ss-inspector-eyebrow span { color:#65606f; margin:0 6px; }
.ss-inspector-toolbar {
  position:absolute; z-index:4; top:64px; left:clamp(14px,2vw,26px);
  display:flex; align-items:center; gap:5px; padding:5px; border:1px solid #ffffff1b;
  border-radius:10px; background:#17141fdd; box-shadow:0 8px 30px #0006; backdrop-filter:blur(12px);
}
.ss-inspector-stage :is(.ss-button,.ss-icon-button) { color:#ddd8e9; background:transparent; border-color:transparent; min-height:30px; }
.ss-inspector-stage :is(.ss-button,.ss-icon-button):hover:not(:disabled) { color:#fff; background:#ffffff14; border-color:#ffffff18; }
.ss-inspector-stage .ss-icon-button { width:31px; }
.ss-inspector-toolbar .ss-button { padding:6px 9px; }
.ss-inspector-stage .ss-inspector-zoom-label { min-width:45px; padding-inline:5px; font-size:11px; font-variant-numeric:tabular-nums; }
.ss-inspector-divider { display:block; width:1px; height:19px; margin-inline:3px; background:#ffffff26; }
.ss-inspector-picture { min-width:0; min-height:0; overflow:hidden; display:grid; place-items:center; padding:18px; }
.ss-inspector-image { display:block; max-width:100%; max-height:100%; object-fit:contain; transform:scale(var(--ss-image-scale,1)); transform-origin:center; transition:transform .16s ease; }
.ss-inspector-image-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:8px clamp(14px,2vw,26px); border-top:1px solid #ffffff12; font-size:10px; color:#aaa4b4; }
.ss-inspector-image-foot strong { color:#e7e1ed; font-size:11px; margin-right:5px; }
.ss-inspector-image-foot .ss-button { white-space:nowrap; font-size:10px; }
.ss-inspector-details { min-width:0; min-height:0; display:flex; flex-direction:column; border-left:1px solid var(--ss-outline); background:var(--ss-panel-bg); }
.ss-inspector-details-head { flex:none; padding:24px 22px 10px; }
.ss-inspector-details-head h3 { margin:7px 0 4px; font-size:19px; font-weight:750; line-height:1.2; }
.ss-inspector-filename { margin:0; color:var(--ss-dim); font-size:10px; overflow-wrap:anywhere; line-height:1.45; }
.ss-inspector-overview-head { flex:none; padding:8px 22px 18px; }
.ss-inspector-facts { display:flex; flex-wrap:wrap; gap:6px; }
.ss-inspector-facts:empty { display:none; }
.ss-inspector-facts .ss-badge { border:1px solid var(--ss-outline); background:var(--ss-panel-hi); color:var(--ss-muted); font-size:10px; border-radius:6px; }
.ss-inspector-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; margin-top:15px; }
.ss-inspector-actions .ss-button { min-width:0; min-height:34px; font-size:11px; padding:7px 9px; display:flex; align-items:center; gap:8px; }
.ss-inspector-actions .ss-inspector-edit-entry { grid-column:1/-1; justify-content:flex-start; text-align:left; padding:9px; border-color:color-mix(in srgb,var(--ss-accent) 48%,var(--ss-outline)); background:var(--ss-accent-soft); }
.ss-inspector-tool-mark { display:grid; place-items:center; width:32px; height:32px; flex:none; color:var(--ss-accent); border-radius:7px; border:1px solid var(--ss-outline); background:var(--ss-panel-bg); }
.ss-inspector-tool-copy { flex:1; min-width:0; display:grid; gap:3px; }
.ss-inspector-tool-copy strong { color:var(--ss-text); font-size:12px; line-height:1.15; }
.ss-inspector-tool-copy small { color:var(--ss-muted); font-size:10px; line-height:1.2; font-weight:400; }
.ss-inspector-actions .ss-button svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
.ss-inspector-actions .ss-inspector-tool-arrow { color:var(--ss-muted); }
.ss-inspector-actions .ss-inspector-tool { justify-content:flex-start; text-align:left; }
.ss-inspector-tool span { min-width:0; overflow-wrap:anywhere; }
.ss-inspector-tabs { display:grid; grid-template-columns:repeat(3,1fr); gap:0; flex:none; padding:0 17px; border-top:1px solid var(--ss-outline); border-bottom:1px solid var(--ss-outline); }
.ss-inspector-tabs button { border:0; border-bottom:2px solid transparent; background:transparent; color:var(--ss-dim); min-height:42px; padding:11px 7px 9px; font-size:11px; font-weight:650; }
.ss-inspector-tabs button[aria-selected="true"] { color:var(--ss-text); border-bottom-color:var(--ss-accent); }
.ss-inspector-tabs button:hover { color:var(--ss-text); }
.ss-inspector-sidebar { min-height:0; min-width:0; flex:1; overflow:auto; scrollbar-width:thin; overscroll-behavior:contain; }
.ss-inspector-pane { display:grid; align-content:start; min-width:0; }
.ss-inspector-block { min-width:0; padding:21px 22px; border-bottom:1px solid var(--ss-outline); }
.ss-inspector-block-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:14px; }
.ss-inspector-block-head h4 { margin:0; color:var(--ss-text); font-size:11px; font-weight:750; }
.ss-inspector-block-head span { color:var(--ss-dim); font-size:9px; }
.ss-inspector-properties { display:grid; grid-template-columns:105px minmax(0,1fr); gap:12px 10px; margin:0; font-size:11px; }
.ss-inspector-properties dt { color:var(--ss-dim); }
.ss-inspector-properties dd { margin:0; font-weight:560; overflow-wrap:anywhere; }
.ss-inspector-prompt-preview { margin:0; color:var(--ss-muted); font-size:11px; line-height:1.65; display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; overflow-wrap:anywhere; }
.ss-inspector-text-button { border:0; background:transparent; color:var(--ss-accent); padding:0; font-size:10px; font-weight:700; white-space:nowrap; }
.ss-inspector-copy { margin:0; padding:0; white-space:pre-wrap; overflow-wrap:anywhere; color:var(--ss-muted); font-size:11px; line-height:1.75; user-select:text; }
.ss-inspector-send { position:relative; }
.ss-inspector-send-trigger.ss-button { width:100%; display:flex; justify-content:space-between; min-height:38px; padding-inline:12px; font-size:11px; }
.ss-inspector-send-trigger span { font-size:15px; }
.ss-inspector-send-menu { display:grid; gap:3px; margin-top:5px; padding:5px; background:var(--ss-header-bg); border:1px solid var(--ss-outline); border-radius:10px; box-shadow:0 8px 25px #0004; }
.ss-inspector-send-menu[hidden] { display:none; }
.ss-inspector-send-menu button { display:block; width:100%; padding:10px; border:0; border-radius:6px; background:transparent; text-align:left; font-size:11px; color:var(--ss-text); }
.ss-inspector-send-menu button:hover:not(:disabled) { background:var(--ss-accent-soft); }
.ss-inspector-path { font-size:10px; overflow-wrap:anywhere; }
.ss-inspector-path code { white-space:pre-wrap; overflow-wrap:anywhere; }
.ss-inspector-footer { flex:none; display:grid; grid-template-columns:1fr 1fr; gap:7px; padding:12px 17px max(12px,env(safe-area-inset-bottom,0px)); border-top:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-inspector-footer .ss-button { font-size:11px; }
/* Native avatar crop: one canvas-led editor shared by character and persona actions. */
.ss-avatar-crop {
  position:fixed; inset:0; margin:auto; padding:0; box-sizing:border-box;
  width:min(880px,calc(var(--app-scaled-viewport-width,100vw) - 36px)); max-width:none;
  max-height:calc(var(--app-interactive-viewport-height,100dvh) - 32px);
  overflow:hidden; border:1px solid var(--ss-outline); border-radius:15px;
  background:var(--ss-panel-bg); color:var(--ss-text); font:12px/1.45 Inter,'Segoe UI Variable','Segoe UI',system-ui,sans-serif;
  box-shadow:0 32px 105px #000c;
}
.ss-avatar-crop[open] { display:flex; flex-direction:column; }
.ss-avatar-crop::backdrop { background:#07070bdb; backdrop-filter:blur(9px); }
.ss-avatar-crop *, .ss-avatar-crop *::before, .ss-avatar-crop *::after { box-sizing:border-box; }
.ss-avatar-crop button, .ss-avatar-crop input { font:inherit; color:inherit; }
.ss-avatar-crop button { cursor:pointer; }
.ss-avatar-crop button:disabled { opacity:.48; cursor:not-allowed; }
.ss-avatar-crop :is(button,input,canvas):focus-visible { outline:2px solid var(--ss-accent); outline-offset:2px; }
.ss-avatar-crop-header { display:flex; flex:none; justify-content:space-between; align-items:center; gap:16px; padding:18px 22px 17px; border-bottom:1px solid var(--ss-border-subtle); background:var(--ss-header-bg); }
.ss-avatar-crop-heading { min-width:0; }
.ss-avatar-crop-eyebrow { display:block; font-size:9px; font-weight:780; text-transform:uppercase; letter-spacing:.13em; color:var(--ss-accent); }
.ss-avatar-crop-heading h2 { margin:5px 0 2px; font-size:19px; line-height:1.23; letter-spacing:-.025em; font-weight:760; }
.ss-avatar-crop-heading p { margin:0; font-size:11px; color:var(--ss-muted); }
.ss-avatar-crop .ss-avatar-crop-close { flex:none; width:31px; height:31px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-button-bg); font-size:20px; line-height:1; display:grid; place-items:center; }
.ss-avatar-crop-close:hover { background:var(--ss-button-hover); }
.ss-avatar-crop-body { display:grid; grid-template-columns:minmax(0,1.18fr) minmax(0,.82fr); min-height:0; overflow-y:auto; scrollbar-width:thin; }
.ss-avatar-crop-stage { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; min-width:0; padding:24px; background:#0d0b11; color:#ece9f3; }
.ss-avatar-crop-stage-top { display:flex; align-items:center; justify-content:space-between; width:min(100%,400px); gap:12px; font-size:10px; letter-spacing:.035em; }
.ss-avatar-crop-stage-top strong { font-weight:720; }
.ss-avatar-crop-stage-top span { color:#a6a0b5; font-size:10px; letter-spacing:.12em; }
.ss-avatar-crop-canvas-wrap { position:relative; width:min(100%,400px); padding:7px; border:1px solid #5b536b; border-radius:5px; background:#17131d; box-shadow:0 16px 60px #0009; }
.ss-avatar-crop-canvas-wrap::after { content:''; position:absolute; inset:7px; border:1px solid #ffffff83; box-shadow:inset 0 0 0 1px #0006; pointer-events:none; }
.ss-avatar-crop-canvas-wrap canvas { display:block; width:100%; height:auto; aspect-ratio:1; border-radius:2px; cursor:grab; touch-action:none; }
.ss-avatar-crop-canvas-wrap canvas:active { cursor:grabbing; }
.ss-avatar-crop-hint { width:min(100%,400px); margin:0; color:#a6a0b5; font-size:10px; text-align:center; }
.ss-avatar-crop-settings { min-width:0; padding:27px 25px 22px; display:flex; flex-direction:column; gap:24px; background:var(--ss-panel-bg); }
.ss-avatar-crop-panel-heading h3 { margin:6px 0 5px; font-size:16px; letter-spacing:-.02em; }
.ss-avatar-crop-panel-heading p { margin:0; color:var(--ss-muted); font-size:11px; line-height:1.55; }
.ss-avatar-crop-fields { display:grid; gap:24px; }
.ss-avatar-crop-field { display:grid; gap:13px; min-width:0; }
.ss-avatar-crop-field > span { display:flex; justify-content:space-between; gap:10px; align-items:baseline; }
.ss-avatar-crop-field strong { color:var(--ss-text); font-size:11px; font-weight:710; }
.ss-avatar-crop-field output { color:var(--ss-muted); font-size:10px; font-variant-numeric:tabular-nums; }
.ss-avatar-crop-field input[type='range'] { display:block; width:100%; min-width:0; margin:0; accent-color:var(--ss-accent); cursor:pointer; }
.ss-avatar-crop .ss-avatar-crop-reset { display:inline-flex; gap:7px; align-items:center; align-self:flex-start; padding:6px 0; border:0; background:transparent; color:var(--ss-accent); font-size:11px; font-weight:650; }
.ss-avatar-crop-reset:hover { text-decoration:underline; }
.ss-avatar-crop-preserved { display:flex; align-items:flex-start; gap:10px; margin-top:auto; padding:13px; border:1px solid var(--ss-border-subtle); border-radius:10px; background:var(--ss-panel-hi); }
.ss-avatar-crop-preserved > span { display:grid; place-items:center; flex:none; width:20px; height:20px; border:1px solid var(--ss-accent-line); border-radius:50%; background:var(--ss-accent-soft); color:var(--ss-accent); font-weight:800; }
.ss-avatar-crop-preserved strong { display:block; color:var(--ss-text); font-size:11px; }
.ss-avatar-crop-preserved p { margin:3px 0 0; color:var(--ss-muted); font-size:10px; line-height:1.5; }
.ss-avatar-crop-footer { display:flex; flex:none; align-items:center; justify-content:space-between; gap:14px; min-height:70px; padding:13px 22px; border-top:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-avatar-crop-status { flex:1; min-width:0; font-size:10px; color:var(--ss-dim); }
.ss-avatar-crop-actions { display:flex; gap:8px; align-items:center; justify-content:flex-end; }
.ss-avatar-crop-actions .ss-button { display:inline-flex; align-items:center; justify-content:center; min-height:36px; padding:9px 16px; border:1px solid var(--ss-outline); border-radius:8px; color:var(--ss-text); background:var(--ss-button-bg); font-size:11px; font-weight:690; }
.ss-avatar-crop-actions .ss-button:hover:not(:disabled) { background:var(--ss-button-hover); }
.ss-avatar-crop-actions .ss-button-primary { border-color:var(--ss-primary-bg); color:var(--ss-primary-ink); background:var(--ss-primary-bg); }
.ss-avatar-crop-actions .ss-button-primary:hover:not(:disabled) { background:var(--ss-primary-hover); }
/* Existing folder-delete confirmation uses the same action row, with its own compact surface. */
.ss-confirm-folder { inset:0; position:fixed; margin:auto; box-sizing:border-box; width:min(410px,calc(100vw - 32px)); max-width:none; max-height:calc(100dvh - 30px); padding:23px; border:1px solid var(--ss-outline); border-radius:13px; background:var(--ss-panel-bg); color:var(--ss-text); box-shadow:0 26px 75px #000c; font:12px/1.5 Inter,'Segoe UI',system-ui,sans-serif; }
.ss-confirm-folder::backdrop { background:#07070bcc; backdrop-filter:blur(7px); }
.ss-confirm-folder h2 { margin:0 0 12px; font-size:18px; }
.ss-confirm-folder p { margin:8px 0; color:var(--ss-muted); }
.ss-confirm-folder .ss-confirm-folder-name { color:var(--ss-text); font-weight:730; overflow-wrap:anywhere; }
.ss-confirm-folder .ss-avatar-crop-actions { margin-top:19px; }
.ss-confirm-folder .ss-button-danger { color:#f0a4b7; }
@media (max-width:680px) {
  .ss-avatar-crop { width:calc(var(--app-scaled-viewport-width,100vw) - 16px); max-height:calc(var(--app-interactive-viewport-height,100dvh) - 16px); border-radius:12px; }
  .ss-avatar-crop-header { padding:13px 15px; }
  .ss-avatar-crop-heading h2 { font-size:16px; }
  .ss-avatar-crop-heading p { font-size:10px; }
  .ss-avatar-crop-body { grid-template-columns:minmax(0,1fr); }
  .ss-avatar-crop-stage { gap:9px; padding:12px 15px 14px; }
  .ss-avatar-crop-stage-top { width:min(100%,280px); }
  .ss-avatar-crop-canvas-wrap { width:min(100%,280px); padding:5px; }
  .ss-avatar-crop-canvas-wrap::after { inset:5px; }
  .ss-avatar-crop-hint { font-size:9px; }
  .ss-avatar-crop-settings { gap:14px; padding:16px 18px 18px; }
  .ss-avatar-crop-panel-heading h3 { font-size:14px; margin:3px 0; }
  .ss-avatar-crop-panel-heading p { font-size:10px; }
  .ss-avatar-crop-fields { gap:14px; }
  .ss-avatar-crop-field { gap:6px; }
  .ss-avatar-crop-preserved { padding:10px; }
  .ss-avatar-crop-footer { display:grid; gap:9px; padding:11px 15px max(11px,env(safe-area-inset-bottom,0px)); }
  .ss-avatar-crop-actions { display:grid; grid-template-columns:1fr 1fr; }
}
/* AI upscale workbench | standalone canonical component (no duplicate inspector overrides). */
.ss-upscale-dialog {
  position:fixed; inset:0; margin:auto; box-sizing:border-box;
  width:min(1180px,calc(var(--app-scaled-viewport-width,100vw) - 36px)); max-width:none;
  height:min(790px,calc(var(--app-interactive-viewport-height,100dvh) - 36px)); max-height:none;
  padding:0; overflow:hidden; border:1px solid var(--ss-outline); border-radius:15px;
  background:var(--ss-panel-bg); color:var(--ss-text); box-shadow:0 26px 90px #000c;
}
.ss-upscale-dialog::backdrop { background:#08070cd9; backdrop-filter:blur(9px); }
.ss-upscale-dialog[open] { display:block; }
.ss-upscale-shell { height:100%; min-height:0; display:grid; grid-template-rows:auto minmax(0,1fr); }
.ss-upscale-header { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:18px 23px; border-bottom:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-upscale-header h2 { margin:5px 0 2px; line-height:1.15; font-size:19px; }
.ss-upscale-header p { color:var(--ss-dim); margin:0; font-size:11px; }
.ss-upscale-header .ss-icon-button { font-size:18px; }
.ss-upscale-body { display:grid; grid-template-columns:minmax(0,1fr) clamp(345px,36%,430px); min-width:0; min-height:0; }
.ss-upscale-stage { display:grid; grid-template-rows:auto minmax(0,1fr) auto; min-height:0; min-width:0; padding:22px 25px; background:#0e0c13; color:#eeeaf5; }
.ss-upscale-stage-kicker { display:flex; align-items:center; gap:10px; color:#b0aabc; font-size:10px; }
.ss-upscale-image-badge { padding:5px 8px; background:#282333; border:1px solid #ffffff26; border-radius:5px; color:#e1d9ee; font-weight:750; letter-spacing:.08em; font-size:9px; }
.ss-upscale-artwork { display:grid; place-items:center; min-height:0; overflow:hidden; padding:18px 0; }
.ss-upscale-artwork img { display:block; max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 10px 35px #0008; }
.ss-upscale-stage-note { margin:0; color:#ada6bc; font-size:10px; line-height:1.6; }
.ss-upscale-panel { min-height:0; min-width:0; display:flex; flex-direction:column; border-left:1px solid var(--ss-outline); }
.ss-upscale-panel-scroll { overflow:auto; flex:1; min-height:0; padding:25px 24px; scrollbar-width:thin; }
.ss-upscale-section-label { display:flex; align-items:center; gap:10px; margin-bottom:14px; color:var(--ss-text); font-size:12px; font-weight:750; }
.ss-upscale-section-label span { font-size:10px; color:var(--ss-accent); font-weight:750; }
.ss-upscale-mode-list { display:grid; gap:7px; }
.ss-upscale-mode { display:flex; align-items:center; gap:12px; padding:11px 13px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-panel-hi); cursor:pointer; }
.ss-upscale-mode[data-selected="true"] { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-upscale-mode input { flex:none; width:15px; height:15px; }
.ss-upscale-mode > span { display:grid; gap:3px; }
.ss-upscale-mode strong { font-size:11px; }
.ss-upscale-mode small { color:var(--ss-dim); font-size:10px; }
.ss-upscale-fields { display:grid; gap:13px; margin:20px 0; }
.ss-upscale-fields[hidden] { display:none; }
.ss-upscale-fields .ss-field { font-size:11px; }
.ss-upscale-tip { margin:-2px 0 0; color:var(--ss-dim); font-size:10px; line-height:1.65; }
.ss-upscale-tip code,.ss-upscale-help code { color:var(--ss-text); word-break:break-word; }
.ss-upscale-custom-title { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:11px; font-weight:700; }
.ss-upscale-custom-title .ss-button { min-height:29px; font-size:10px; }
.ss-upscale-graph.ss-textarea { min-height:170px; font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; resize:vertical; tab-size:2; }
.ss-upscale-help { display:grid; gap:7px; padding:13px 14px; background:var(--ss-panel-hi); border-left:2px solid var(--ss-accent-line); border-radius:5px; line-height:1.6; color:var(--ss-muted); font-size:10px; }
.ss-upscale-help strong { color:var(--ss-text); font-size:11px; }
.ss-upscale-remember { display:flex; align-items:center; gap:9px; margin-top:17px; color:var(--ss-muted); font-size:10px; cursor:pointer; }
.ss-upscale-footer { flex:none; display:grid; gap:12px; padding:15px 22px; border-top:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-upscale-footer > div { display:grid; grid-template-columns:1fr 1.5fr; gap:8px; }
.ss-upscale-footer .ss-button { min-height:39px; }
.ss-upscale-feedback { min-height:14px; margin:0; color:var(--ss-dim); font-size:10px; text-align:center; line-height:1.5; }
.ss-upscale-feedback[data-error="true"] { color:#efa3b4; }
@media(max-width:900px) {
  .ss-upscale-body { grid-template-columns:minmax(0,1fr) minmax(310px,45%); }
  .ss-upscale-stage { padding:16px; }
  .ss-upscale-panel-scroll { padding:17px; }
}
@media(max-width:720px) {
  .ss-upscale-dialog { width:var(--app-scaled-viewport-width,100vw); height:var(--app-interactive-viewport-height,100dvh); border-radius:0; border:0; }
  .ss-upscale-header { padding:11px 15px; }
  .ss-upscale-header h2 { font-size:16px; }
  .ss-upscale-body { grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(130px,33%) minmax(0,67%); }
  .ss-upscale-stage { padding:9px 16px; }
  .ss-upscale-artwork { padding:5px 0; }
  .ss-upscale-stage-note { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ss-upscale-panel { border-left:0; border-top:1px solid var(--ss-outline); }
  .ss-upscale-panel-scroll { padding:15px 17px; }
  .ss-upscale-mode-list { grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; }
  .ss-upscale-mode { padding:9px 7px; gap:5px; align-items:flex-start; }
  .ss-upscale-mode strong { font-size:10px; }
  .ss-upscale-mode small { display:none; }
  .ss-upscale-mode input { width:13px; height:13px; }
  .ss-upscale-fields { margin:13px 0; }
  .ss-upscale-footer { padding:9px 12px max(9px,env(safe-area-inset-bottom,0px)); gap:7px; }
  .ss-upscale-footer .ss-button { min-height:33px; }
}

/* Region editor is a real tool surface, not a second oversized settings card. */
.ss-inpaint-dialog {
  position:fixed; inset:var(--app-interactive-safe-top,0px) 0 0; margin:auto; box-sizing:border-box;
  width:calc(var(--app-scaled-viewport-width,100vw) - 30px); max-width:none;
  height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 30px); max-height:none;
  padding:0; overflow:hidden; border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius);
  background:var(--ss-panel-bg); color:var(--ss-text); box-shadow:0 28px 90px #000b;
}
.ss-inpaint-dialog[open] { display:grid; grid-template-rows:55px minmax(0,1fr); }
.ss-inpaint-dialog::backdrop { background:#08070ccd; backdrop-filter:blur(6px); }
.ss-inpaint-header { min-height:0; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 19px; border-bottom:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-inpaint-heading { min-width:0; display:grid; gap:3px; }
.ss-inpaint-eyebrow { color:var(--ss-dim); text-transform:uppercase; font-size:9px; letter-spacing:.13em; font-weight:750; }
.ss-inpaint-heading h2 { margin:0; font-size:16px; line-height:1.2; }
.ss-inpaint-body { min-width:0; min-height:0; display:grid; grid-template-columns:minmax(0,1fr) clamp(305px,28vw,370px); }
.ss-inpaint-stage { position:relative; min-width:0; min-height:0; container-type:size; background:#0d0b11; color:#eae6f1; }
.ss-inpaint-stage-label { position:absolute; top:21px; left:24px; z-index:3; display:flex; align-items:center; gap:9px; font-size:10px; color:#a7a1b5; pointer-events:none; }
.ss-inpaint-stage-label strong { color:#e8e2f2; font-size:11px; }
.ss-inpaint-viewport { display:flex; width:100%; height:100%; overflow:auto; padding:62px 63px 68px; scrollbar-width:thin; }
.ss-inpaint-surface { position:relative; flex:none; margin:auto; width:calc(min((100cqw - 126px),(100cqh - 130px) * var(--ss-inpaint-ratio)) * var(--ss-inpaint-zoom,1)); aspect-ratio:var(--ss-inpaint-ratio); box-shadow:0 12px 45px #0009; }
.ss-inpaint-surface canvas { display:block; width:100%; height:100%; }
.ss-inpaint-surface .ss-inpaint-mask { position:absolute; inset:0; opacity:.52; cursor:crosshair; touch-action:none; }
.ss-inpaint-surface .ss-inpaint-mask[data-tool="pan"] { cursor:grab; }
.ss-inpaint-surface .ss-inpaint-mask[data-tool="pan"]:active { cursor:grabbing; }
.ss-inpaint-surface .ss-inpaint-outline { position:absolute; inset:0; pointer-events:none; }
.ss-inpaint-surface[data-mask-visible="false"] .ss-inpaint-mask { opacity:0; }
.ss-inpaint-surface[data-mask-visible="false"] .ss-inpaint-outline { opacity:0; }
.ss-inpaint-mask:focus-visible { outline:2px solid var(--ss-accent); outline-offset:-2px; }
.ss-inpaint-cursor { display:none; position:absolute; aspect-ratio:1; transform:translate(-50%,-50%); box-sizing:border-box; border:1px solid white; border-radius:50%; box-shadow:0 0 0 1px black; pointer-events:none; }
.ss-inpaint-mask:is([data-tool="brush"],[data-tool="erase"]):is([data-pointer-cursor="true"],:focus-visible) ~ .ss-inpaint-cursor,
.ss-inpaint-mask[data-tool="lasso"]:focus-visible:not([data-pointer-cursor="true"]) ~ .ss-inpaint-cursor { display:block; }
.ss-inpaint-mask:is([data-tool="brush"],[data-tool="erase"])[data-pointer-cursor="true"] { cursor:none; }
.ss-inpaint-mask[data-tool="erase"] ~ .ss-inpaint-cursor { border-style:dashed; }
.ss-inpaint-mask:is([data-tool="brush"],[data-tool="erase"]) ~ .ss-inpaint-cursor[data-size-preview="true"] {display:block;}
.ss-inpaint-viewport[hidden],.ss-inpaint-result[hidden],.ss-inpaint-render-actions > [hidden] { display:none; }
.ss-inpaint-result { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:62px 63px 68px; background:#0d0b11; }
.ss-inpaint-stage[data-show-result="true"] :is(.ss-inpaint-tool-rail,.ss-inpaint-zoom-dock,.ss-inpaint-stage-label) { display:none; }
.ss-inpaint-tool-rail { position:absolute; z-index:5; top:50%; left:13px; transform:translateY(-50%); padding:6px; border:1px solid #ffffff23; border-radius:12px; background:#1a1722eb; box-shadow:0 8px 35px #0009; backdrop-filter:blur(12px); }
.ss-inpaint-tool-rail .ss-inpaint-tools { display:flex; flex-direction:column; gap:4px; }
.ss-inpaint-tools .ss-icon-button { flex:none; width:36px; min-height:36px; padding:7px; }
.ss-inpaint-tools .ss-icon-button svg { width:18px; height:18px; }
.ss-inpaint-stage :is(.ss-icon-button,.ss-button) { border-color:transparent; background:transparent; color:#cfc8df; }
.ss-inpaint-stage :is(.ss-icon-button,.ss-button):hover:not(:disabled) { background:#ffffff19; border-color:#ffffff25; color:#fff; }
.ss-inpaint-stage .ss-inpaint-tools [aria-pressed="true"] { background:#65518a8c; color:#fff; border-color:#a68cce77; }
.ss-inpaint-zoom-dock { position:absolute; z-index:5; bottom:14px; left:50%; transform:translateX(-50%); padding:4px; border:1px solid #ffffff20; border-radius:10px; background:#1a1722eb; box-shadow:0 8px 25px #0008; }
.ss-inpaint-zoom-dock .ss-inpaint-tools { display:flex; flex-direction:row; align-items:center; gap:3px; }
.ss-inpaint-zoom-value { min-width:43px; text-align:center; color:#e5dff1; font-size:11px; font-variant-numeric:tabular-nums; }
.ss-inpaint-stage-foot { position:absolute; bottom:23px; right:16px; display:flex; flex-direction:column; align-items:flex-end; max-width:130px; color:#aaa4b4; font-size:9px; pointer-events:none; overflow:hidden; }
.ss-inpaint-stage-foot span { max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-inpaint-controls { display:flex; flex-direction:column; min-width:0; min-height:0; background:var(--ss-panel-bg); border-left:1px solid var(--ss-outline); }
.ss-inpaint-settings-scroll { flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin; }
.ss-inpaint-settings-head { display:grid; gap:6px; padding:24px 23px 20px; border-bottom:1px solid var(--ss-outline); }
.ss-inpaint-settings-head h3 { margin:0; font-size:19px; line-height:1.2; }
.ss-inpaint-settings-head p { margin:0; color:var(--ss-dim); font-size:11px; }
.ss-inpaint-settings-section { display:grid; gap:13px; padding:23px; border-bottom:1px solid var(--ss-outline); }
.ss-inpaint-settings-section h4 { margin:0 0 3px; font-size:10px; color:var(--ss-accent); font-weight:750; letter-spacing:.08em; text-transform:uppercase; }
.ss-inpaint-settings-section .ss-field { color:var(--ss-text); font-size:11px; font-weight:650; }
.ss-inpaint-settings-section .ss-textarea { min-height:106px; padding:12px; font-size:11px; line-height:1.65; }
.ss-inpaint-settings-section .ss-muted { margin:0; font-size:10px; line-height:1.55; }
.ss-inpaint-range { display:grid; grid-template-columns:1fr auto; align-items:center; gap:9px; color:var(--ss-text); font-size:11px; font-weight:650; }
.ss-inpaint-range input { grid-column:1/-1; grid-row:2; width:100%; min-width:0; accent-color:var(--ss-accent); }
.ss-inpaint-range > span:last-child { font-weight:500; color:var(--ss-dim); font-variant-numeric:tabular-nums; }
.ss-inpaint-settings-foot { flex:none; display:grid; gap:9px; padding:14px 20px max(14px,env(safe-area-inset-bottom,0px)); background:var(--ss-header-bg); border-top:1px solid var(--ss-outline); }
.ss-inpaint-render-actions { display:grid; gap:8px; }
.ss-inpaint-render-actions .ss-button-primary { min-height:41px; }
.ss-inpaint-settings-foot [role="status"] { min-height:14px; margin:0; text-align:center; font-size:10px; }
@media (max-width:900px) {
  .ss-inspector { grid-template-columns:minmax(0,1fr) minmax(285px,37%); }
  .ss-inspector-overview-head { padding:8px 14px 13px; }
  .ss-inspector-details-head,.ss-inspector-block { padding-inline:14px; }
  .ss-inpaint-body { grid-template-columns:minmax(0,1fr) minmax(265px,38%); }
  .ss-inpaint-settings-head,.ss-inpaint-settings-section { padding-inline:15px; }
}
@media (max-width:720px) {
  .ss-inspector { grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(220px,48%) minmax(260px,52%); }
  .ss-inspector-stage { grid-template-rows:38px minmax(0,1fr) 30px; }
  .ss-inspector-topline { padding:5px 12px; }
  .ss-inspector-toolbar { top:46px; left:10px; padding:3px; }
  .ss-inspector-picture { padding:10px 12px; }
  .ss-inspector-image-foot { padding:3px 12px; }
  .ss-inspector-details { border-left:0; border-top:1px solid var(--ss-outline); }
  .ss-inspector-details-head { padding:10px 13px 2px; }
  .ss-inspector-details-head h3 { font-size:14px; margin:3px 0 2px; }
  .ss-inspector-overview-head { padding:5px 13px 8px; }
  .ss-inspector-actions { margin-top:6px; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
  .ss-inspector-actions .ss-inspector-edit-entry { min-height:36px; padding:5px 7px; }
  .ss-inspector-tool-mark { width:24px; height:24px; }
  .ss-inspector-tool-copy { gap:1px; }
  .ss-inspector-tool-copy strong { font-size:11px; }
  .ss-inspector-tool-copy small { font-size:9px; }
  .ss-inspector-actions .ss-inspector-tool { flex-direction:column; justify-content:center; text-align:center; min-height:42px; gap:3px; padding:4px 2px; font-size:10px; line-height:1.1; }
  .ss-inspector-tabs { padding:0 11px; }
  .ss-inspector-tabs button { min-height:33px; padding:6px; }
  .ss-inspector-block { padding:12px 14px; }
  .ss-inspector-footer { padding:8px 12px max(9px,env(safe-area-inset-bottom,0px)); }
  .ss-inpaint-dialog { width:var(--app-scaled-viewport-width,100vw); height:var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)); border:0; border-radius:0; }
  .ss-inpaint-dialog[open] { grid-template-rows:46px minmax(0,1fr); }
  .ss-inpaint-header { padding:6px 12px; }
  .ss-inpaint-heading h2 { font-size:14px; }
  .ss-inpaint-body { grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(180px,52%) minmax(210px,48%); }
  .ss-inpaint-controls { border-left:0; border-top:1px solid var(--ss-outline); }
  .ss-inpaint-viewport { padding:40px 45px 48px; }
  .ss-inpaint-surface { width:calc(min((100cqw - 90px),(100cqh - 88px) * var(--ss-inpaint-ratio)) * var(--ss-inpaint-zoom,1)); }
  .ss-inpaint-stage-label { top:7px; left:12px; }
  .ss-inpaint-tool-rail { left:6px; padding:3px; }
  .ss-inpaint-tool-rail .ss-inpaint-tools { gap:1px; }
  .ss-inpaint-tools .ss-icon-button { width:30px; min-height:30px; padding:5px; }
  .ss-inpaint-tool-rail .ss-inpaint-tools svg { width:16px; height:16px; }
  .ss-inpaint-zoom-dock { bottom:6px; }
  .ss-inpaint-stage-foot { bottom:7px; right:9px; }
  .ss-inpaint-result { padding:40px 45px 48px; }
  .ss-inpaint-settings-head { padding:11px 15px; }
  .ss-inpaint-settings-head h3 { font-size:15px; }
  .ss-inpaint-settings-section { padding:13px 15px; gap:10px; }
  .ss-inpaint-settings-foot { padding:8px 12px max(8px,env(safe-area-inset-bottom,0px)); }
}
/* Output Library | independent fixed-size thumbnails, virtual folder previews, and scrollable pages. */
.ss-output-library {
  position:absolute; inset:0; z-index:110;
  display:grid; grid-template-rows:auto minmax(0,1fr);
  min-width:0; min-height:0; overflow:hidden;
  background:var(--ss-canvas-bg); color:var(--ss-text);
}
.ss-output-library:is([data-picker='reference'],[data-picker='saved'],[data-picker='replace']) { grid-template-rows:auto auto minmax(0,1fr); }
.ss-output-library:is([data-picker='reference'],[data-picker='saved'],[data-picker='replace']) .ss-library-folder-actions > :not([data-action='toggle-library-search'],[data-action='cycle-library-preview'],[data-action='upload-library-image']) { display:none; }
.ss-output-library[data-picker-bound='true'] .ss-library-breadcrumb { display:none; }
.ss-output-library[data-view='folders'] .ss-library-folder-view,
.ss-output-library[data-view='folder'] .ss-library-landing { display:none; }
.ss-output-library[data-view='folders'] .ss-library-landing { display:block; }
.ss-output-library[data-view='folder'] .ss-library-folder-view { display:grid; }
.ss-library-head {
  min-width:0; flex:none; display:flex; align-items:center; gap:16px;
  padding:15px max(clamp(14px,2.4vw,36px),env(safe-area-inset-right,0px)) 15px max(clamp(14px,2.4vw,36px),env(safe-area-inset-left,0px)); border-bottom:1px solid var(--ss-outline);
  background:var(--ss-header-bg);
}
.ss-library-head-copy { min-width:0; flex:1; display:grid; gap:2px; }
.ss-library-head-copy strong { font-size:16px; font-weight:750; }
.ss-library-head-copy .ss-muted { min-width: 0; overflow:hidden; text-overflow: ellipsis; white-space:nowrap; }
.ss-library-folder-search,.ss-library-folder-query {
  min-width:0; width:min(350px,32vw); display:flex; align-items:center; gap:8px;
  padding:2px 10px; border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius);
  background:var(--ss-field-bg); color:var(--ss-muted);
}
.ss-library-folder-search svg,.ss-library-folder-query svg { width:15px; height:15px; }
.ss-shell .ss-library-folder-search .ss-input,.ss-shell .ss-library-folder-query .ss-input {
  flex:1; width:100%; min-height:32px; padding:4px 0;
  border:0; box-shadow:none; background:transparent;
}
.ss-output-library[data-view='folder'] .ss-library-folder-search { display:none; }
.ss-library-close { width:36px; min-width:36px; height:36px; margin:0; }
.ss-library-landing { min-width:0; min-height:0; overflow-y:auto; overscroll-behavior:contain; }
.ss-library-landing-inner { max-width:1490px; margin:0 auto; padding:clamp(16px,3vw,38px); display:grid; gap:17px; align-content:start; }
.ss-library-folder-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(min(212px,100%),1fr));
  align-content:start; gap:clamp(10px,1.3vw,18px);
}
.ss-library-folder-card,.ss-library-new-folder-card {
  appearance:none; width:100%; min-width:0; min-height:0; padding:0;
  display:grid; grid-template-rows:158px minmax(55px,auto); gap:0;
  overflow:hidden; border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius);
  color:var(--ss-text); background:var(--ss-panel-hi); text-align:left;
  transition:border-color .14s ease,background .14s ease,box-shadow .14s ease;
}
.ss-library-folder-card:hover,.ss-library-new-folder-card:hover,
.ss-library-folder-card:focus-visible,.ss-library-new-folder-card:focus-visible {
  border-color:var(--ss-accent-line); background:var(--ss-accent-soft);
  box-shadow:0 7px 24px #0003;
}
.ss-library-folder-preview {
  position:relative; width:100%; height:158px; min-width:0; min-height:0;
  display:grid; grid-template-columns:minmax(0,1fr); place-items:center;
  overflow:hidden; background:var(--ss-field-bg);
}
.ss-library-folder-preview[data-collage='true'] {
  grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-rows:repeat(2,minmax(0,1fr));
  gap:2px;
}
.ss-library-folder-preview img {
  display:block; width:100%; height:100%; min-width:0; min-height:0;
  object-fit:cover;
}
.ss-library-folder-preview > svg { width:38px; height:38px; opacity:.65; }
.ss-library-folder-badge {
  position:absolute; top:8px; left:8px; z-index:1;
  padding:4px 7px; border:1px solid var(--ss-accent-line); border-radius:999px;
  color:var(--ss-text); background:color-mix(in srgb,var(--ss-panel-bg) 86%,transparent);
  font-size:10px; font-weight:720; backdrop-filter:blur(8px);
}
.ss-library-folder-copy {
  min-width:0; display:grid; align-content:center; gap:3px; padding:10px 12px;
}
.ss-library-folder-copy strong,.ss-library-folder-copy span {
  min-width:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
}
.ss-library-folder-copy strong { font-size:12px; font-weight:750; }
.ss-library-folder-copy span { font-size:10px; }
.ss-library-new-folder-card {
  grid-template-rows:auto auto auto; place-items:center; align-content:center;
  gap:10px; padding:14px; border-style:dashed; text-align:center;
}
.ss-library-new-folder-icon {
  display:grid; place-items:center; width:54px; height:54px;
  color:var(--ss-accent); background:var(--ss-accent-soft);
  border:1px solid var(--ss-accent-line); border-radius:50%;
}
.ss-library-new-folder-icon svg { width:26px; height:26px; }
.ss-library-new-folder-card > span:last-child { max-width:185px; font-size:10px; line-height:1.4; }
.ss-library-folder-note { margin:0; padding-bottom:8px; text-align:center; }
.ss-library-folder-empty { grid-column:1/-1; }
/* Expression Studio V3. One authored ruleset, using Studio's semantic --ss-* tokens. */
.ss-expression-dialog,.ss-expression-picker {
  position:fixed; inset:0; margin:0; padding:0; border:0;
  width:var(--app-scaled-viewport-width,100vw); height:var(--app-scaled-viewport-height,100dvh);
  max-width:none; max-height:none; color:var(--ss-text); background:var(--ss-canvas-bg);
}
.ss-expression-dialog[open] { display:grid; grid-template-columns:minmax(0,1fr); grid-template-rows:auto auto minmax(0,1fr) auto; container:expression-workshop / inline-size; }
.ss-expression-dialog [hidden] { display:none !important; }
.ss-expression-dialog::backdrop,.ss-expression-picker::backdrop { background:color-mix(in srgb,var(--ss-canvas-bg) 80%,transparent); }
.ss-expression-header,.ss-expression-footer,.ss-expression-steps { padding:8px clamp(14px,2vw,30px); background:var(--ss-panel-bg); }
.ss-expression-header,.ss-expression-footer { display:flex; align-items:center; gap:14px; }
.ss-expression-header { justify-content:space-between; min-height:49px; padding-top:max(7px,env(safe-area-inset-top,0px)); border-bottom:1px solid var(--ss-border-subtle); }
.ss-expression-identity { display:flex; align-items:center; min-width:0; gap:10px; }
.ss-expression-mark { display:grid; place-items:center; width:29px; height:29px; flex:none; border:1px solid var(--ss-accent-line); border-radius:9px; background:var(--ss-accent-soft); color:var(--ss-accent); font-size:19px; }
.ss-expression-header-copy { display:grid; min-width:0; gap:3px; }
.ss-expression-header-copy small { color:var(--ss-muted); font-size:10px; }
.ss-expression-header-copy h2 { overflow:hidden; margin:0; font-size:13px; font-weight:750; white-space:nowrap; text-overflow:ellipsis; }
.ss-expression-kicker { display:block; color:var(--ss-accent); font-size:9px; font-weight:760; text-transform:uppercase; letter-spacing:.11em; }
.ss-expression-steps { display:flex; gap:8px; align-items:center; min-height:46px; padding-inline:max(16px,calc((100% - 1280px) / 2)); border-bottom:1px solid var(--ss-border-subtle); overflow-x:auto; scrollbar-width:thin; }
.ss-expression-steps .ss-expression-step { flex:1 0 150px; max-width:310px; min-width:0; display:flex; align-items:center; gap:7px; padding:5px 9px; background:transparent; border:1px solid transparent; border-radius:8px; color:var(--ss-muted); text-align:left; font-size:11px; font-weight:650; white-space:nowrap; }
.ss-expression-step:not(:last-child)::after { content:none; }
.ss-expression-step-number { width:21px; height:21px; flex:none; display:grid; place-items:center; border:1px solid var(--ss-accent-line); border-radius:7px; color:var(--ss-accent); font-size:10px; }
.ss-expression-steps .ss-expression-step[aria-current='step'] { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-expression-step[aria-current='step'] .ss-expression-step-number { color:var(--ss-primary-ink); background:var(--ss-primary-bg); border-color:var(--ss-primary-bg); }
.ss-expression-scroll { min-width:0; min-height:0; overflow-y:auto; overflow-x:hidden; scrollbar-gutter:stable; padding:16px clamp(12px,2vw,28px) 28px; }
.ss-expression-controls,.ss-expression-gallery-head,.ss-expression-cards { width:100%; max-width:1280px; margin-inline:auto; }
.ss-expression-wardrobe-shelf { display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;margin-bottom:12px;border:1px solid var(--ss-border-subtle);border-radius:12px;background:var(--ss-panel-bg); }
.ss-expression-wardrobe-copy {display:grid;gap:3px;min-width:0}.ss-expression-wardrobe-copy strong{font-size:14px;overflow-wrap:anywhere}.ss-expression-wardrobe-copy p{margin:0;font-size:11px}.ss-expression-wardrobe-actions{display:flex;gap:8px;align-items:center;min-width:0}.ss-expression-wardrobe-actions select{min-width:0;max-width:260px}.ss-expression-wardrobe-actions button{white-space:nowrap}.ss-expression-card-actions .ss-expression-card-alt{flex:0 0 auto;white-space:nowrap;padding-inline:6px}
@media(max-width:600px){.ss-expression-wardrobe-shelf{flex-wrap:wrap;gap:8px}.ss-expression-wardrobe-actions{width:100%}.ss-expression-wardrobe-actions select{flex:1;max-width:none}.ss-expression-card-actions:has(.ss-expression-card-alt){flex-wrap:wrap}.ss-expression-card-actions .ss-expression-card-alt{flex:1 0 100%}}
.ss-expression-controls { display:grid; gap:12px; margin-bottom:10px; }
.ss-expression-overview { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; }
.ss-expression-overview-copy { display:grid; gap:4px; min-width:0; }
.ss-expression-overview-copy h3 { margin:0; font-size:clamp(19px,1.65vw,23px); letter-spacing:-.035em; line-height:1.15; }
.ss-expression-overview-copy p { margin:0; font-size:11px; line-height:1.35; }
.ss-expression-count { flex:none; padding:7px 12px; border:1px solid var(--ss-outline); border-radius:999px; background:var(--ss-panel-hi); color:var(--ss-muted); font-size:11px; }
.ss-expression-config { display:flex; align-items:center; gap:12px; min-width:0; flex-wrap:wrap; padding:10px 14px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-bg); }
.ss-expression-config-divider { height:37px; width:1px; flex:none; background:var(--ss-border-subtle); }
.ss-expression-config .ss-field { flex:0 1 200px; min-width:120px; max-width:330px; }
.ss-expression-config .ss-field > span:first-child { color:var(--ss-muted); font-size:10px; }
.ss-expression-config :is(.ss-input,.ss-select,.ss-textarea) { width:100%; min-width:0; }
.ss-expression-config-method .ss-select { border:0; background:transparent; padding:0 24px 0 0; min-height:25px; font-weight:700; }
.ss-expression-config-method .ss-select:focus { box-shadow:none; }
.ss-expression-config .ss-expression-config-method { flex-basis:158px; }
.ss-expression-config .ss-expression-config-reference { flex:0 1 260px; min-width:170px; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:6px; }
.ss-expression-config-reference > span:first-child { grid-column:1/-1; }
.ss-expression-config-reference .ss-expression-reference-button { display:flex; align-items:center; gap:8px; min-width:0; text-align:left; }
.ss-expression-reference-picture { display:grid; place-items:center; flex:none; width:32px; height:32px; overflow:hidden; border:1px solid var(--ss-outline); border-radius:8px; color:var(--ss-accent); background:var(--ss-field-bg); }
.ss-expression-reference-picture :is(img,svg) { width:100%; height:100%; object-fit:cover; }
.ss-expression-reference-picture svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.6; }
.ss-expression-reference-copy { display:grid; min-width:0; gap:2px; }
.ss-expression-reference-copy strong { font-size:11px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; }
.ss-expression-reference-copy small { color:var(--ss-muted); font-size:10px; }
.ss-expression-config-model { display:grid; flex:1 1 170px; min-width:120px; max-width:360px; gap:4px; }
.ss-expression-config-model small { color:var(--ss-muted); font-size:10px; }
.ss-expression-config-model strong { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }
.ss-expression-config-model span { font-size:10px; }
.ss-expression-config-settings { margin-left:auto; }
.ss-expression-config-copy { display:grid; min-width:150px; gap:5px; }
.ss-expression-config-copy strong { font-size:12px; }
.ss-expression-config-copy p { margin:0; font-size:11px; }
.ss-expression-config > .ss-expression-model-setup { max-width:none; }
.ss-expression-naming { display:grid; grid-template-columns:minmax(0,240px) minmax(110px,1fr); align-items:end; gap:14px; flex:1 1 470px; min-width:0; }
.ss-expression-naming .ss-field { min-width:0; }
.ss-expression-naming-example { display:grid; justify-items:start; align-content:end; gap:7px; min-width:0; }
.ss-expression-naming #ss-expression-prefix-example { display:none; }
.ss-expression-naming-example > span { color:var(--ss-muted); font-size:10px; }
.ss-expression-naming code { padding:8px 12px; min-width:65px; border:1px solid var(--ss-accent-line); border-radius:8px; background:var(--ss-field-bg); color:var(--ss-accent); font:650 12px ui-monospace,monospace; }
.ss-expression-gallery-toolbar { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:12px 0 11px; flex-wrap:wrap; }
.ss-expression-gallery-left,.ss-expression-gallery-right,.ss-expression-presets { display:flex; align-items:center; flex-wrap:wrap; gap:7px; min-width:0; }
.ss-expression-filters { display:flex; flex-wrap:wrap; gap:2px; padding:3px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-field-bg); }
.ss-expression-toolbar-count { color:var(--ss-muted); font-size:10px; white-space:nowrap; }
.ss-expression-filters .ss-button { border:0; background:transparent; color:var(--ss-muted); }
.ss-expression-filters .ss-button[aria-pressed='true'] { border:1px solid var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); }
.ss-expression-gallery-right { margin-left:auto; }
.ss-expression-gallery-toolbar :is(.ss-button,.ss-select) { min-height:33px; padding:6px 10px; font-size:11px; }
.ss-expression-gallery-toolbar .ss-select { width:auto; max-width:130px; }
.ss-expression-presets { padding:3px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-field-bg); gap:3px; }
.ss-expression-presets .ss-button { border-color:transparent; background:transparent; }
.ss-expression-presets [aria-pressed='true'] { color:var(--ss-accent); background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-expression-cards { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); align-items:start; gap:12px; min-width:0; }
.ss-expression-card { position:relative; min-width:0; display:grid; grid-template-rows:auto auto auto; align-content:start; gap:0; overflow:hidden; padding:0; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-hi); }
.ss-expression-card[data-selected='true'] { border-color:var(--ss-accent-line); }
.ss-expression-art { position:relative; min-width:0; width:calc(100% - 8px); margin:4px 4px 0; aspect-ratio:9/16; border-radius:9px; overflow:hidden; background:var(--ss-canvas-bg); }
.ss-expression-card-head { position:absolute; z-index:2; inset:12px 10px auto; display:flex; align-items:start; justify-content:space-between; gap:5px; pointer-events:none; }
.ss-expression-card-head > * { pointer-events:auto; }
.ss-expression-select { display:flex; align-items:center; gap:6px; min-width:0; padding:5px 7px; border:1px solid var(--ss-outline); border-radius:7px; background:var(--ss-panel-bg); color:var(--ss-text); font-weight:600; font-size:10px; cursor:pointer; }
.ss-expression-select input { flex:none; accent-color:var(--ss-accent); }
.ss-expression-state-label { font-size:9px; color:var(--ss-muted); padding:4px 7px; border:1px solid var(--ss-outline); border-radius:999px; white-space:nowrap; background:var(--ss-panel-bg); }
.ss-expression-card[data-state='ready'] .ss-expression-state-label { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-expression-card[data-state='failed'] .ss-expression-state-label { color:var(--ss-danger); }
.ss-expression-preview { position:absolute; inset:0; width:100%; height:100%; min-width:0; display:grid; place-items:center; overflow:hidden; background:var(--ss-canvas-bg); color:var(--ss-muted); }
.ss-expression-preview img { display:block; width:100%; height:100%; object-fit:contain; object-position:center center; }
.ss-expression-preview[data-view='closeup'] img { object-fit:cover; object-position:center 0%; }
.ss-expression-preview.ss-expression-inspectable { cursor:zoom-in; }
.ss-expression-inspectable::after { content:'↗'; display:grid; place-items:center; position:absolute; right:9px; bottom:9px; width:28px; height:28px; border:1px solid var(--ss-outline); border-radius:7px; background:var(--ss-panel-bg); color:var(--ss-accent); font-size:16px; opacity:0; transition:opacity .15s; }
.ss-expression-inspectable:hover::after,.ss-expression-inspectable:focus-visible::after { opacity:1; }
.ss-expression-preview.ss-expression-inspectable:hover { outline:2px solid var(--ss-accent-line); outline-offset:-2px; }
.ss-expression-placeholder { display:grid; place-items:center; width:100%; height:100%; font-size:11px; text-align:center; background:repeating-linear-gradient(45deg,transparent,transparent 9px,color-mix(in srgb,var(--ss-outline) 18%,transparent) 9px,color-mix(in srgb,var(--ss-outline) 18%,transparent) 10px); }
.ss-expression-tile-feedback { position:absolute; z-index:2; inset:auto 8px 8px; display:grid; gap:6px; padding:8px; border:1px solid var(--ss-outline); border-radius:8px; background:var(--ss-panel-hi); color:var(--ss-text); font-size:11px; pointer-events:none; }
.ss-expression-tile-feedback progress { width:100%; height:6px; accent-color:var(--ss-accent); }
.ss-expression-card-info { display:grid; gap:6px; min-width:0; padding:12px 12px 9px; }
.ss-expression-card-title { display:flex; align-items:center; flex-wrap:wrap; gap:6px; min-width:0; }
.ss-expression-edited-tag { padding:2px 5px; border-radius:4px; color:var(--ss-accent); background:var(--ss-accent-soft); text-transform:uppercase; font-size:8px; letter-spacing:.04em; }
.ss-expression-card-info strong { text-transform:capitalize; font-size:13px; }
.ss-expression-card-info p { min-width:0; overflow:hidden; margin:0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; line-height:1.45; min-height:29px; font-size:11px; }
.ss-expression-card-editing { border-color:var(--ss-accent-line); }
/* The editor occupies the normal details row, then rises over the portrait.
   The card's height never changes, so adjacent cards remain aligned. */
.ss-expression-card-editing .ss-expression-card-info { position:relative; z-index:3; display:block; height:72px; padding:0; }
.ss-expression-card-edit-panel { position:absolute; inset:auto 0 0; display:grid; gap:6px; min-width:0; padding:12px 12px 9px; border-top:1px solid var(--ss-accent-line); border-radius:10px 10px 0 0; background:var(--ss-panel-hi); box-shadow:0 -13px 28px color-mix(in srgb,var(--ss-canvas-bg) 75%,transparent); }

.ss-expression-card-editarea { display:block; box-sizing:border-box; width:100%; min-width:0; height:112px; min-height:112px; max-height:112px; padding:9px; resize:none; overflow-y:auto; font:inherit; font-size:11px; line-height:1.5; }
.ss-expression-card-edit-tools { display:grid; grid-template-columns:minmax(0,1fr) 32px; align-items:stretch; gap:6px; min-width:0; }
.ss-expression-card-edit-tools .ss-button { min-width:0; min-height:31px; padding:5px 8px; font-size:10px; }
.ss-expression-card-edit-tools .ss-expression-card-bank { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-expression-card-edit-tools .ss-expression-card-restore { display:grid; place-items:center; padding:5px; }
.ss-expression-card-edit-tools .ss-expression-card-restore svg { width:16px; height:16px; }
.ss-expression-card-mapping { display:grid; gap:5px; min-width:0; margin-top:5px; }
.ss-expression-card-mapping span { color:var(--ss-muted); font-size:9px; }
.ss-expression-card-mapping code { padding:6px 8px; min-width:0; overflow:hidden; text-overflow:ellipsis; border:1px solid var(--ss-accent-line); border-radius:7px; color:var(--ss-accent); background:var(--ss-field-bg); font:600 11px ui-monospace,monospace; }
.ss-expression-card-actions { display:flex; align-items:center; gap:6px; min-width:0; margin:0 12px; padding:10px 0 12px; border-top:1px solid var(--ss-border-subtle); }
.ss-expression-card-actions .ss-button { flex:1 1 0; min-width:0; min-height:31px; padding:5px 8px; font-size:11px; }
.ss-expression-card-actions .ss-expression-card-render { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); color:var(--ss-accent); }
.ss-expression-card-actions .ss-expression-card-attach { flex:0 0 32px; width:32px; padding:5px; }
.ss-expression-card-actions .ss-expression-card-attach svg { width:15px; height:15px; }
.ss-expression-empty-gallery { grid-column:1/-1; padding:50px 15px; margin:0; text-align:center; border:1px dashed var(--ss-outline); border-radius:12px; color:var(--ss-muted); }
.ss-expression-footer { justify-content:space-between; flex-wrap:wrap; min-height:52px; border-top:1px solid var(--ss-border-subtle); padding-bottom:max(8px,env(safe-area-inset-bottom,0px)); }
.ss-expression-footer-identity { display:flex; align-items:center; gap:10px; flex:1 1 180px; min-width:0; }
.ss-expression-footer-mark { display:grid; place-items:center; flex:none; width:30px; height:30px; border:1px solid var(--ss-accent-line); border-radius:9px; background:var(--ss-accent-soft); color:var(--ss-accent); font-size:20px; }
.ss-expression-footer-copy { display:grid; gap:3px; min-width:0; }
.ss-expression-footer-copy > p { margin:0; font-size:11px; font-weight:700; }
.ss-expression-footer-copy > span { font-size:10px; color:var(--ss-muted); }
.ss-expression-actions { display:flex; flex-wrap:wrap; gap:7px; justify-content:flex-end; }
.ss-expression-actions .ss-button { font-size:11px; }
.ss-expression-workflow-health { flex:1 1 330px; min-width:0; display:grid; gap:7px; padding:10px 12px 12px 14px; border:1px solid var(--ss-outline); border-left:3px solid var(--ss-accent); border-radius:10px; background:var(--ss-field-bg); }
.ss-expression-workflow-health { box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ss-accent) 14%,transparent); }
.ss-expression-workflow-health > strong { color:var(--ss-text); font-size:11px; }
.ss-expression-workflow-health > p { margin:0; font-size:10px; line-height:1.6; overflow-wrap:anywhere; }
.ss-expression-model-details:not([hidden]) { display:grid; gap:7px; }
.ss-expression-upscale-check { flex:1 1 300px; align-content:center; }
.ss-expression-background-check { align-content:center; }
.ss-expression-workflow-health[data-status="checking"] { border-left-color:var(--ss-accent); }
.ss-expression-workflow-health[data-status="installed"] { border-left-color:var(--ss-accent); }
.ss-expression-workflow-health[data-status="missing"],.ss-expression-workflow-health[data-status="empty"] { border-left-color:var(--ss-warning,#dca876); box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ss-warning,#dca876) 16%,transparent); }
.ss-expression-workflow-health[data-status="unsupported"],.ss-expression-workflow-health[data-status="unavailable"],.ss-expression-workflow-health[data-status="unknown"] { border-left-color:var(--ss-outline-strong,var(--ss-outline)); }
.ss-expression-workflow-health .ss-button { min-height:29px; padding:5px 10px; font-size:10px; }
.ss-expression-workflow-health [hidden] { display:none !important; }
.ss-expression-model-actions { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.ss-expression-model-actions a { display:inline-flex; align-items:center; text-decoration:none; }
.ss-expression-config .ss-expression-background-graph { flex:1 1 300px; }
.ss-expression-background-graph .ss-textarea { width:100%; min-width:0; font-family:ui-monospace,monospace; }
.ss-expression-overlay { position:absolute; z-index:8; inset:0; display:grid; align-items:stretch; justify-content:end; isolation:isolate; }
.ss-expression-overlay-scrim { position:absolute; z-index:-1; inset:0; width:100%; padding:0; border:0; border-radius:0; background:color-mix(in srgb,var(--ss-canvas-bg) 78%,transparent); cursor:default; }
.ss-expression-overlay-panel { width:min(470px,100vw); height:100%; min-width:0; display:grid; grid-template-rows:auto minmax(0,1fr) auto; background:var(--ss-panel-bg); border-left:1px solid var(--ss-outline); box-shadow:-20px 0 50px #0005; }
.ss-expression-overlay-panel.ss-expression-overlay-wide { width:min(840px,100vw); }
.ss-expression-overlay-head { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:54px; padding:10px 18px; border-bottom:1px solid var(--ss-outline); }
.ss-expression-overlay-heading { min-width:0; display:grid; gap:4px; }
.ss-expression-overlay-head h3 { min-width:0; overflow:hidden; margin:0; font-size:14px; text-overflow:ellipsis; white-space:nowrap; }
.ss-expression-overlay-body { display:grid; align-content:start; gap:15px; min-width:0; min-height:0; overflow:auto; padding:20px; }
.ss-expression-overlay-body .ss-field { display:grid; gap:6px; min-width:0; }
.ss-expression-overlay-body :is(.ss-input,.ss-textarea,.ss-select) { width:100%; min-width:0; }
.ss-expression-overlay-body p { margin:0; }
.ss-expression-overlay-bottom { display:flex; gap:7px; justify-content:flex-end; align-items:center; flex-wrap:wrap; padding:14px 20px max(15px,env(safe-area-inset-bottom)); border-top:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-expression-checkline { display:flex; align-items:center; gap:8px; font-size:12px; }
.ss-expression-checkline input { accent-color:var(--ss-accent); }
.ss-expression-bank-list { display:grid; gap:8px; min-width:0; }
.ss-expression-bank-item { display:flex; align-items:center; gap:8px; flex-wrap:wrap; min-width:0; padding:12px; border:1px solid var(--ss-outline); border-radius:11px; background:var(--ss-panel-hi); }
.ss-expression-bank-item > div { flex:1 1 160px; min-width:0; display:grid; gap:6px; }
.ss-expression-bank-item strong { font-size:12px; }
.ss-expression-bank-item p { color:var(--ss-muted); font-size:11px; line-height:1.4; overflow-wrap:anywhere; }
.ss-expression-bank-item .ss-button { min-height:30px; font-size:10px; padding:5px 9px; }
.ss-expression-inspector-image { position:relative; display:block; min-width:0; min-height:0; height:min(62dvh,640px); overflow:hidden; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-canvas-bg); }
.ss-expression-inspector-image img { position:absolute; inset:0; display:block; width:100%; height:100%; min-width:0; min-height:0; max-width:100%; max-height:100%; padding:12px; object-fit:contain; object-position:center; box-sizing:border-box; }
.ss-expression-inspector-meta { display:grid; gap:8px; min-width:0; }
.ss-expression-inspector-meta strong { text-transform:capitalize; font-size:14px; }
.ss-expression-inspector-meta p { font-size:11px; color:var(--ss-muted); overflow-wrap:anywhere; }
.ss-expression-inspector-meta small { overflow-wrap:anywhere; color:var(--ss-muted); font-size:10px; }
.ss-expression-settings-fields { display:grid; grid-template-columns:minmax(0,1fr); align-items:start; gap:14px; min-width:0; }
.ss-expression-render-fields { display:grid; gap:14px; min-width:0; container:expression-render / inline-size; }
.ss-expression-parameters,.ss-expression-prompts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.ss-expression-prompts { grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); }
@container expression-render (min-width:540px) { .ss-expression-parameters { grid-template-columns:repeat(4,minmax(0,1fr)); } }
.ss-expression-canvas { display:grid; gap:14px; max-width:720px; width:100%; min-width:0; padding:16px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-hi); }
.ss-expression-canvas-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.ss-expression-canvas-head strong { font-size:12px; }
.ss-expression-canvas-size { color:var(--ss-muted); font:550 11px ui-monospace,monospace; }
.ss-expression-ratio-presets { display:flex; flex-wrap:wrap; gap:7px; }
.ss-expression-ratio-button { min-width:67px; min-height:63px; display:grid; justify-items:center; align-content:center; gap:7px; padding:8px; background:var(--ss-field-bg); border:1px solid var(--ss-outline); border-radius:9px; color:var(--ss-muted); font-size:10px; font-weight:650; }
.ss-expression-ratio-button:hover,.ss-expression-ratio-button[aria-pressed='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); }
.ss-expression-ratio-shape { display:block; flex:none; max-width:29px; max-height:25px; min-width:9px; min-height:9px; border:1.5px solid currentColor; border-radius:3px; }
.ss-expression-dimension-fields { display:grid; grid-template-columns:minmax(0,1fr) 36px minmax(0,1fr); align-items:end; gap:8px; }
.ss-expression-dimension-field { display:grid; gap:9px; min-width:0; }
.ss-expression-dimension-field label { display:flex; align-items:center; justify-content:space-between; gap:7px; font-size:11px; font-weight:650; }
.ss-expression-dimension-field label .ss-input { width:min(110px,62%); height:33px; padding:7px 26px 7px 9px; font-size:12px; font-variant-numeric:tabular-nums; }
.ss-expression-dimension-field label { position:relative; }
.ss-expression-unit { position:absolute; right:8px; color:var(--ss-muted); font-size:10px; pointer-events:none; }
.ss-expression-dimension-range { padding:4px 0; }
.ss-expression-dimension-range input { display:block; width:100%; margin:0; accent-color:var(--ss-accent); }
.ss-expression-size-link { display:grid; place-items:center; width:35px; height:35px; padding:0; margin-bottom:1px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-field-bg); color:var(--ss-muted); }
.ss-expression-size-link[aria-pressed='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); }
.ss-expression-size-link svg { width:17px; height:17px; }
.ss-expression-canvas > p { margin:0; font-size:10px; line-height:1.4; }
.ss-expression-inherited-size { justify-self:start; font-size:11px; }
/* Generation settings is a compact tool drawer, not the wide image inspector.
   Use the available dialog width (including host UI scale), not the viewport. */
.ss-expression-overlay-settings { grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(0,1fr); justify-content:stretch; }
.ss-expression-overlay-settings .ss-expression-overlay-panel { width:min(640px,100%); max-width:100%; min-height:0; justify-self:end; box-sizing:border-box; }
.ss-expression-overlay-settings .ss-expression-overlay-body { grid-template-columns:minmax(0,1fr); container:expression-settings / inline-size; }
.ss-expression-overlay-settings .ss-expression-canvas { max-width:none; box-sizing:border-box; }
.ss-expression-overlay-settings .ss-expression-ratio-presets { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); }
.ss-expression-overlay-settings .ss-expression-ratio-button { min-width:0; min-height:44px; display:flex; align-items:center; justify-content:center; gap:5px; padding:6px 3px; white-space:nowrap; }
.ss-shell .ss-expression-overlay-settings .ss-expression-ratio-button[aria-pressed="true"] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); }
.ss-expression-overlay-settings .ss-expression-dimension-range input { height:24px; background:transparent; }
.ss-expression-overlay-settings .ss-expression-dimension-range input::-webkit-slider-runnable-track { background:var(--ss-outline); height:4px; border-radius:4px; }
.ss-expression-overlay-settings .ss-expression-dimension-range input::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; margin-top:-7px; border-radius:50%; background:var(--ss-accent); border:2px solid var(--ss-panel-bg); box-shadow:0 0 0 1px var(--ss-accent-line); }
.ss-expression-overlay-settings .ss-expression-dimension-range input { appearance:none; -webkit-appearance:none; }
.ss-expression-overlay-settings .ss-expression-dimension-range input::-moz-range-track { background:var(--ss-outline); height:4px; border-radius:4px; }
.ss-expression-overlay-settings .ss-expression-dimension-range input::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:var(--ss-accent); border:2px solid var(--ss-panel-bg); }
.ss-expression-overlay-settings .ss-expression-parameters { grid-template-columns:repeat(2,minmax(0,1fr)); }
.ss-expression-overlay-settings .ss-expression-prompts { grid-template-columns:minmax(0,1fr); }
.ss-expression-overlay-settings .ss-expression-prompts textarea { min-height:90px; resize:vertical; }
/* Workshop-local controls and responsive floating workflow navigation. */
.ss-expression-settings-nav { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:5px; position:sticky; top:0; z-index:2; padding:5px; background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:10px; }
.ss-expression-settings-nav .ss-button { min-width:0; font-size:11px; padding:7px 3px; }
.ss-expression-settings-nav .ss-button[aria-pressed="true"] { background:var(--ss-accent-soft); color:var(--ss-accent); border-color:var(--ss-accent-line); }
.ss-expression-settings-section { display:grid; gap:10px; min-width:0; padding:12px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-bg); }
.ss-expression-settings-section > strong { font-size:13px; }
.ss-expression-settings-section > .ss-muted { line-height:1.5; }
.ss-expression-settings-section .ss-textarea { min-height:72px; resize:vertical; }
.ss-expression-lora-rows,.ss-expression-lora-row { display:grid; gap:8px; min-width:0; }
.ss-expression-lora-row { padding:10px; border:1px solid var(--ss-outline); border-radius:9px; }
.ss-expression-lora-head,.ss-expression-stack-actions { display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; }
.ss-expression-lora-head label { flex:1; min-width:0; overflow-wrap:anywhere; }
.ss-expression-lora-head .ss-button,.ss-expression-stack-actions .ss-button { font-size:10px; }
.ss-expression-lora-values { display:grid; grid-template-columns:minmax(65px,1fr) minmax(0,3fr); gap:8px; }
.ss-expression-despill-controls { display:grid; gap:8px; min-width:0; padding:10px; border:1px solid var(--ss-outline); border-radius:9px; }
.ss-expression-dialog[open] > .ss-expression-header { grid-row:1; grid-column:1; }
.ss-expression-dialog[open] > .ss-expression-steps { grid-row:2; grid-column:1; }
.ss-expression-dialog[open] > .ss-expression-scroll { grid-row:3; grid-column:1; padding-bottom:100px; }
.ss-expression-dialog[open] > .ss-expression-footer { grid-row:4; grid-column:1; }
.ss-expression-dialog[open] > .ss-expression-quick-actions { grid-row:3; grid-column:1; align-self:end; justify-self:center; z-index:5; display:flex; align-items:center; width:max-content; max-width:calc(100% - 20px); margin:0 0 10px; padding:5px; gap:4px; border:1px solid var(--ss-outline); border-radius:999px; background:var(--ss-panel-bg); box-shadow:0 5px 24px #0007; box-sizing:border-box; }
.ss-expression-quick-actions .ss-button { display:flex; align-items:center; justify-content:center; gap:6px; min-width:0; min-height:36px; border-radius:999px; padding:5px 11px; font-size:11px; white-space:nowrap; }
.ss-expression-quick-actions .ss-button svg { width:17px; height:17px; flex:none; }
.ss-expression-quick-count { padding:0 8px; color:var(--ss-muted); font-size:11px; font-variant-numeric:tabular-nums; white-space:nowrap; }
@container expression-workshop (max-width:500px) {
 .ss-expression-quick-actions .ss-button { width:40px; min-height:40px; padding:6px; }
 .ss-expression-quick-label { display:none; }
 .ss-expression-quick-count { padding:0 5px; }
}

@container expression-settings (max-width:460px) {
  .ss-expression-overlay-settings .ss-expression-ratio-presets { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .ss-expression-overlay-settings .ss-expression-dimension-fields { grid-template-columns:minmax(0,1fr) 36px; align-items:center; }
  .ss-expression-overlay-settings .ss-expression-dimension-field { grid-column:1; }
  .ss-expression-overlay-settings .ss-expression-dimension-field:first-child { grid-row:1; }
  .ss-expression-overlay-settings .ss-expression-dimension-field:last-child { grid-row:2; }
  .ss-expression-overlay-settings .ss-expression-size-link { grid-column:2; grid-row:1 / 3; }
}
@media (max-width:1350px) {
  .ss-expression-cards { grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media (max-width:1000px) {
  .ss-expression-cards { grid-template-columns:repeat(3,minmax(0,1fr)); }
  .ss-expression-config-divider { display:none; }
  .ss-expression-toolbar-count { display:none; }
}
@media (max-width:750px) {
  .ss-expression-scroll { padding-top:18px; }
  .ss-expression-steps .ss-expression-step { flex:0 0 147px; }
  .ss-expression-config { gap:10px; }
  .ss-expression-config-settings { margin-left:0; }
  .ss-expression-cards { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
}
@media (max-width:600px) {
  .ss-expression-header { min-height:55px; padding:8px 14px; }
  .ss-expression-steps { padding:7px 12px; min-height:50px; }
  .ss-expression-steps .ss-expression-step { flex:0 0 128px; min-height:34px; padding:5px 6px; font-size:10px; }
  .ss-expression-step-number { width:22px; height:22px; }
  .ss-expression-overview-copy h3 { font-size:19px; }
  .ss-expression-naming { grid-template-columns:minmax(0,1fr) minmax(90px,auto); }
  .ss-expression-count { font-size:10px; }
  .ss-expression-config { padding:12px; }
  .ss-expression-config :is(.ss-field,.ss-expression-config-reference) { flex:1 1 100%; max-width:none; }
  .ss-expression-config-model { flex:1 1 140px; }
  .ss-expression-gallery-left,.ss-expression-gallery-right { width:100%; }
  .ss-expression-gallery-right { margin-left:0; }
  .ss-expression-gallery-toolbar .ss-button { padding:6px 7px; }
  .ss-expression-cards { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
  .ss-expression-card-head { inset:8px 6px auto; }
  .ss-expression-select { font-size:10px; gap:4px; padding:4px 5px; }
  .ss-expression-select span { display:none; }
  .ss-expression-state-label { font-size:8px; padding:3px 5px; }
  .ss-expression-card-info { padding:9px 8px 7px; }
  .ss-expression-card-editing .ss-expression-card-info { height:67px; }
  .ss-expression-card-edit-panel { padding:9px 8px 7px; }
  .ss-expression-card-actions { margin:0 8px; padding:8px 0; gap:4px; }
  .ss-expression-card-actions .ss-button { font-size:10px; min-height:29px; padding:5px 4px; }
  .ss-expression-card-actions .ss-expression-card-attach { flex-basis:28px; width:28px; }
  .ss-expression-footer { padding:9px 12px max(9px,env(safe-area-inset-bottom)); }
  .ss-expression-footer-identity { flex-basis:100%; }
  .ss-expression-actions { width:100%; }
  .ss-expression-actions .ss-button { flex:1 1 auto; padding:7px; font-size:10px; }
  .ss-expression-overlay-panel { width:100vw; }
  .ss-expression-overlay-panel.ss-expression-overlay-wide { width:100vw; }
  .ss-expression-overlay-body { padding:15px; }
  .ss-expression-overlay-bottom { padding:10px 14px max(10px,env(safe-area-inset-bottom)); }
  .ss-expression-canvas { padding:12px; }
  .ss-expression-ratio-button { flex:1 1 27%; min-width:0; }
  .ss-expression-parameters { grid-template-columns:repeat(2,minmax(0,1fr)); }
}

.ss-library-folder-view {
  min-width:0; min-height:0; overflow:hidden;
  display:grid; grid-template-rows:auto auto minmax(0,1fr);
}
.ss-library-folder-header {
  display:grid; gap:12px; padding:13px clamp(12px,2.5vw,32px);
  border-bottom:1px solid var(--ss-border-subtle); background:var(--ss-header-bg);
}
.ss-library-breadcrumb { min-width:0; display:flex; align-items:center; gap:8px; color:var(--ss-dim); }
.ss-library-breadcrumb strong { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--ss-text); }
.ss-library-breadcrumb button { display:inline-flex; align-items:center; gap:5px; border:0; padding:4px 0; background:transparent; color:var(--ss-accent); }
.ss-library-breadcrumb svg { width:15px; height:15px; }
.ss-library-folder-heading {
  min-width:0; display:grid; grid-template-columns:70px minmax(0,1fr) auto auto;
  gap:13px; align-items:center;
}
.ss-library-folder-cover {
  display:grid; place-items:center; width:70px; height:65px; overflow:hidden;
  border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-field-bg);
}
.ss-library-folder-cover img { width:100%; height:100%; object-fit:cover; }
.ss-library-folder-cover svg { width:29px; height:29px; opacity:.65; }
.ss-library-folder-title-copy { min-width:0; display:grid; gap:3px; }
.ss-library-folder-title-copy h2 { min-width:0; margin:0; font-size:clamp(17px,1.6vw,23px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-library-folder-kind { width:max-content; max-width:100%; color:var(--ss-accent); font-size:10px; font-weight:700; }
.ss-library-folder-actions { display:flex; align-items:center; justify-content:flex-end; gap:6px; flex-wrap:wrap; }
.ss-library-folder-actions svg { width:14px; height:14px; }
.ss-library-folder-actions .ss-button { white-space:nowrap; }
.ss-library-pagination { display:flex; align-items:center; gap:6px; white-space:nowrap; }
.ss-library-pagination .ss-history-page-label { font-size:10px; color:var(--ss-muted); }
.ss-library-folder-query { width:100%; }
.ss-library-selectbar {
  min-width:0; display:flex; align-items:center; flex-wrap:wrap; gap:7px;
  padding:8px clamp(12px,2.5vw,32px); border-bottom:1px solid var(--ss-border-subtle);
  background:var(--ss-panel-bg);
}
.ss-library-replacebar .ss-library-replace-status { flex:1 1 165px; min-width:0; margin:0; color:var(--ss-text); overflow-wrap:anywhere; }
.ss-library-selection-count { color:var(--ss-muted); font-size:11px; white-space:nowrap; }
.ss-library-nonstarred { display:inline-flex; align-items:center; gap:6px; font-size:11px; color:var(--ss-muted); white-space:nowrap; }
.ss-library-nonstarred input { margin:0; }
.ss-library-selection-actions { margin-left:auto; display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.ss-output-library-grid {
  grid-row:3;
  min-width:0; min-height:0; display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));
  grid-auto-rows:max-content; align-content:start;
  gap:clamp(8px,1.3vw,16px); padding:clamp(10px,1.8vw,24px);
  overflow-y:auto; overscroll-behavior:contain; scrollbar-gutter:stable;
}
.ss-library-output {
  position:relative; align-self:start; min-width:0; overflow:hidden;
  border:1px solid var(--ss-outline); border-radius:10px;
  background:var(--ss-panel-hi);
}
.ss-library-output:has(.ss-library-output-button:disabled) { opacity:.58; }
.ss-library-output[data-selected='true'] { border-color:var(--ss-accent); box-shadow:0 0 0 2px var(--ss-accent-soft); }
.ss-library-output-button {
  appearance:none; width:100%; aspect-ratio:var(--ss-library-preview-ratio,1); min-height:0;
  display:block; padding:0; border:0; border-radius:0;
  background:var(--ss-field-bg); overflow:hidden;
}
.ss-library-output-button img { display:block; width:100%; height:100%; min-height:0; object-fit:var(--ss-library-preview-fit,cover); }
.ss-library-output-button:focus-visible { outline:2px solid var(--ss-accent); outline-offset:-2px; }
.ss-library-output-check {
  position:absolute; top:8px; left:8px; z-index:5;
  display:grid; place-items:center; width:25px; height:25px;
  border-radius:7px; background:#0a0b0ddc; box-shadow:0 2px 8px #0007;
}
.ss-library-output-check input { width:16px; height:16px; margin:0; cursor:pointer; accent-color:var(--ss-accent); }
.ss-output-library[data-selection-mode='false'] .ss-library-output-check { display:none; }
.ss-library-output-star {
  position:absolute; top:8px; right:8px; z-index:4;
  display:grid; place-items:center; width:27px; height:27px;
  border:1px solid #ffe18270; border-radius:8px; background:#0a0b0ddd; color:#f9d875;
  pointer-events:none;
}
.ss-library-output-star svg { width:15px; height:15px; }
.ss-library-modal-layer {
  position:absolute; inset:0; z-index:20; display:grid; place-items:center;
  padding:max(14px,env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px)); background:color-mix(in srgb,var(--ss-canvas-bg) 80%,transparent);
  backdrop-filter:blur(var(--ss-backdrop-blur));
}
/* Character Visuals Lookbook: a permanent identity rail beside one focused editor. */
.ss-library-visual-dialog {
  display:grid; grid-template-rows:auto minmax(0,1fr) auto;
  width:min(970px,100%); height:min(760px,94%); min-height:0;
  overflow:hidden; border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius);
  color:var(--ss-text); background:var(--ss-panel-bg); box-shadow:0 22px 70px #0009;
}
.ss-library-visual-head { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:15px 18px; border-bottom:1px solid var(--ss-outline); }
.ss-library-visual-head > div { min-width:0; display:grid; gap:3px; }
.ss-library-visual-head strong { font-size:15px; }
.ss-library-lookbook { display:grid; grid-template-columns:minmax(185px,218px) minmax(0,1fr); min-height:0; min-width:0; overflow:hidden; }
.ss-lookbook-rail { display:flex; flex-direction:column; gap:8px; min-width:0; min-height:0; overflow-y:auto; padding:15px 11px; border-right:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-lookbook-rail-heading,.ss-lookbook-rail-bar { color:var(--ss-muted); font-size:9px; font-weight:750; letter-spacing:.09em; }
.ss-lookbook-rail-heading { padding:0 8px 2px; }
.ss-lookbook-rail-bar { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:14px 8px 3px; }
.ss-lookbook-base,.ss-library-look-card { appearance:none; width:100%; display:grid; grid-template-columns:40px minmax(0,1fr); align-items:center; gap:8px; padding:7px; border:1px solid transparent; border-radius:11px; background:transparent; color:var(--ss-text); text-align:left; cursor:pointer; }
.ss-lookbook-base:hover,.ss-library-look-card:hover { background:var(--ss-button-hover); }
.ss-lookbook-rail[data-mode='profile'] .ss-lookbook-base,.ss-library-look-card[data-selected='true'] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-lookbook-base > span:nth-child(2) { display:grid; gap:4px; min-width:0; }
.ss-lookbook-base :is(strong,small) { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-lookbook-base strong { font-size:11px; }
.ss-lookbook-base small { color:var(--ss-muted); font-size:9px; }
.ss-lookbook-base-symbol,.ss-library-look-preview { display:grid; place-items:center; width:40px; height:40px; overflow:hidden; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-field-bg); }
.ss-lookbook-base-symbol svg,.ss-library-look-preview svg { width:21px; height:21px; color:var(--ss-accent); fill:none; stroke:currentColor; }
.ss-library-look-preview img { width:100%; height:100%; display:block; object-fit:cover; }
.ss-library-look-grid { display:grid; align-content:start; gap:5px; }
.ss-library-look-card[data-active='true']:not([data-selected='true']) { border-color:color-mix(in srgb,var(--ss-accent) 25%,transparent); }
.ss-library-look-copy { display:grid; gap:3px; min-width:0; }
.ss-library-look-copy > * { display:block; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-library-look-title { display:flex !important; align-items:baseline; gap:5px; }
.ss-library-look-title strong { min-width:0; overflow:hidden; text-overflow:ellipsis; }
.ss-library-look-copy strong { font-size:11px; }
.ss-library-look-active { color:var(--ss-accent); font-weight:740; font-size:9px; }
.ss-library-look-count { color:var(--ss-accent); white-space:nowrap; font-size:9px; letter-spacing:0; }
.ss-lookbook-new { width:100%; flex:none; margin-top:5px; }
.ss-lookbook-editor { display:grid; grid-template-rows:minmax(0,1fr); min-height:0; min-width:0; overflow:hidden; }
.ss-library-visual-body { min-height:0; min-width:0; display:grid; align-content:start; gap:15px; overflow-y:auto; scrollbar-gutter:stable; scrollbar-width:thin; padding:18px 20px; }
.ss-library-visual-section { min-width:0; display:grid; gap:13px; padding:0; border:0; background:transparent; }
.ss-library-visual-section-title { display:flex; align-items:center; justify-content:space-between; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--ss-outline); }
.ss-library-visual-section-title > div { display:grid; gap:4px; }
.ss-library-visual-section-title strong { font-size:17px; letter-spacing:-.025em; }
.ss-library-visual-prompts,.ss-library-visual-options,.ss-library-look-editor-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.ss-anima-settings {
  display:grid; gap:10px; min-width:0; padding:12px;
  border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius);
  background:var(--ss-panel-hi);
}
.ss-anima-settings .ss-anima-toggle {
  justify-self:start; gap:9px; min-height:26px; font-size:12px; font-weight:650;
  color:var(--ss-text, var(--lumiverse-text));
}
.ss-anima-settings .ss-input { width:100%; min-width:0; }
.ss-anima-actions { display:flex; align-items:center; flex-wrap:wrap; gap:6px 12px; }
.ss-anima-setup {
  display:inline-flex; align-items:center; min-height:30px; padding-inline:2px;
  color:var(--ss-accent, var(--lumiverse-accent)); text-decoration:underline; text-underline-offset:3px;
}
.ss-anima-status { margin:0; overflow-wrap:anywhere; }
.ss-anima-status:not(:empty) { margin-top:7px; }
/* Inherited render fields become a compact inspector, not six full-width rows. */
.ss-lookbook-advanced,.ss-create-init {
  min-width:0; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-hi);
}
:is(.ss-lookbook-advanced,.ss-create-init) > summary {
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  min-height:34px; padding:6px 11px; border-radius:9px; list-style:none;
  cursor:pointer; color:var(--ss-text); font-size:12px; font-weight:650;
}
:is(.ss-lookbook-advanced,.ss-create-init) > summary::-webkit-details-marker { display:none; }
:is(.ss-lookbook-advanced,.ss-create-init) > summary::after {
  content:""; width:6px; height:6px; margin-right:3px;
  border-right:2px solid var(--ss-muted); border-bottom:2px solid var(--ss-muted); transform:rotate(45deg);
}
:is(.ss-lookbook-advanced,.ss-create-init)[open] > summary {
  border-bottom:1px solid var(--ss-outline); border-radius:9px 9px 0 0;
}
:is(.ss-lookbook-advanced,.ss-create-init)[open] > summary::after { transform:rotate(225deg); }
:is(.ss-lookbook-advanced,.ss-create-init) > summary:hover { background:var(--ss-accent-soft); }
:is(.ss-lookbook-advanced,.ss-create-init) > summary:focus-visible { outline:2px solid var(--ss-accent); outline-offset:-2px; }
.ss-lookbook-advanced > .ss-lookbook-recipe { padding:10px 11px 11px; }
.ss-create-init .ss-init-panel { border:0; background:transparent; }
@media not all and (max-width: 720px) {
  .ss-create-init { display:none; }
}
.ss-lookbook-recipe { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
.ss-lookbook-recipe label { display:grid; gap:4px; min-width:0; color:var(--ss-muted); font-size:10px; text-transform:capitalize; }
.ss-lookbook-recipe label .ss-input,.ss-lookbook-recipe label .ss-select { width:100%; min-width:0; }
.ss-lookbook-style-pick { grid-column:1/-1; }
.ss-library-visual-prompts textarea { min-height:108px; }
.ss-library-look-editor-grid .ss-library-look-wide { grid-column:1/-1; }
.ss-library-visual-footer { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; padding:11px 16px; border-top:1px solid var(--ss-outline); background:var(--ss-header-bg); }
.ss-library-look-delete { margin-right:auto; }
.ss-new-folder-types { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.ss-new-folder-types label { display:flex; align-items:start; gap:8px; padding:10px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-panel-hi); }
.ss-new-folder-types small { display:block; margin-top:3px; color:var(--ss-muted); font-size:10px; }
.ss-move-folder-list { display:grid; gap:6px; }
.ss-history-menu,.ss-history-menu-popover { position:absolute; right:5px; top:28px; z-index:14; min-width:150px; padding:5px; border:1px solid var(--ss-outline); border-radius:8px; background:var(--ss-panel-hi); }
.ss-history-menu button { display:block; width:100%; padding:7px; border:0; background:none; color:var(--ss-text); text-align:left; }
/* Fullscreen modal root is portaled to body to escape host UI scaling and transformed dialogs. */
.ss-modal-theme.ss-fullscreen-root { position:fixed !important; inset:0 auto auto 0 !important; width:var(--app-scaled-viewport-width,100vw) !important; height:var(--app-scaled-viewport-height,100dvh) !important; max-width:none !important; max-height:none !important; padding:0 !important; margin:0 !important; overflow:hidden !important; transform:none !important; z-index:2147483000 !important; }
.ss-fullscreen-root .ss-shell.ss-fullscreen-layer { position:relative; inset:auto; width:100%; height:100%; min-height:0; border-radius:0; }
/* Fullscreen, theme variables and host presentation. */
.ss-shell.ss-fullscreen-layer { position:relative; z-index:9990; inset:auto; width:100%; height:100%; min-height:0; border-radius:0; }
.ss-modal-theme { background:var(--ss-canvas-bg,#15161d) !important; color:var(--ss-text,#f0edf8); }

/* Mobile navigation remains the same six persistent panes; no duplicated input state. */
@media (max-width: 1080px) and (min-width:721px) {
  .ss-shell { --ss-generation-width: 316px; --ss-history-width: 212px; }
  .ss-topbar { gap:8px; padding-inline:11px; }
  .ss-workspace { padding:7px; }
  .ss-output-stage-head { flex-wrap:wrap; }
  .ss-style-column { padding:9px; }
}
@media (max-width: 720px) {
  .ss-shell {
    position: fixed; inset: max(var(--studio-safe-top),var(--ss-modal-viewport-top,0px)) 0 0;
    width:100vw;
    height:calc(var(--ss-modal-viewport-height,100dvh) - max(0px,calc(var(--studio-safe-top) - var(--ss-modal-viewport-top,0px))));
    min-height:0; overflow:hidden; border-radius:0;
  }
  .ss-fullscreen-root .ss-shell.ss-fullscreen-layer {
    position:absolute; inset:var(--studio-safe-top) 0 0; width:100%; height:auto;
  }
  .ss-topbar { min-height:51px; height:51px; padding:7px 10px; gap:8px; grid-template-columns:auto minmax(0,1fr) auto; }
  .ss-brand > svg { width:32px; height:32px; }
  .ss-brand > span { display:none; }
  .ss-connection-wrap { max-width:none; }
  .ss-shell .ss-connection { height:33px; font-size:11px; }
  .ss-top-actions { gap:4px; }
  .ss-top-actions .ss-icon-button { width:30px; min-height:31px; }
  .ss-shell[data-studio-view='cast'] :is(.ss-mobile-tabs,.ss-commandbar) { display:none; }
  .ss-mobile-tabs { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:3px; padding:7px 7px 6px; min-height:47px; flex:none; border-bottom:1px solid var(--ss-border-subtle); background:var(--ss-header-bg); }
  .ss-mobile-tabs .ss-mobile-tab { min-width:0; min-height:31px; padding:6px 1px; background:transparent; border:1px solid transparent; border-radius:7px; color:var(--ss-muted); font-size:10px; font-weight:700; white-space:nowrap; }
  .ss-mobile-tabs .ss-mobile-tab[data-active='true'] { background:var(--ss-accent-soft); color:var(--ss-text); border-color:var(--ss-accent-line); }
  .ss-workspace { display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; flex:1 1 0; padding:0 10px 12px; gap:0; }
  .ss-shell.ss-generation-collapsed .ss-workspace,.ss-shell.ss-history-collapsed .ss-workspace { display:flex; }
  .ss-resize-handle,.ss-center-resizer,.ss-pane-toggle { display:none !important; }
  .ss-generation-pane,.ss-history-pane,.ss-output-stage,.ss-prompt-panel { border:0; border-radius:0; box-shadow:none; background:transparent; }
  .ss-generation-pane,.ss-history-pane { overflow:visible; flex:1; }
  .ss-generation-pane .ss-pane-head { min-height:60px; padding:11px 5px; border-color:#33313e; }
  .ss-generation-pane .ss-pane-body { padding:13px 0 25px; overflow:visible; flex:none; }
  .ss-recipe-menu-sheet { right:0; }
  .ss-center { display:flex; flex-direction:column; flex:1; min-height:auto; overflow:visible; padding:0; }
  /* Pane ownership: a hidden pane's empty flex parent cannot intercept taps in Tune. */
  .ss-shell:not([data-mobile-tab='create']) .ss-center { display:none; }
  .ss-shell:not([data-mobile-tab='generation']) .ss-generation-pane { display:none; }
  .ss-shell:not([data-mobile-tab='history']) .ss-history-pane { display:none; }
  .ss-output-stage { height:clamp(235px,41dvh,475px); flex:none; margin:4px 0 8px; padding:8px 0; }
  .ss-current-preview { min-height:178px; }
  .ss-output-stage-head { flex-wrap:wrap; }
  .ss-prompt-panel { padding:8px 0 18px; overflow:visible; min-height:0; gap:12px; }
  .ss-prompt-grid { display:grid; grid-template-columns:1fr; flex:none; }
  .ss-prompt-grid .ss-textarea { height:auto; min-height:104px; }
  .ss-prompt-status,.ss-desktop-generate,.ss-desktop-label { display:none !important; }
  .ss-mobile-label { display:inline; }
  .ss-mobile-prompt-tools { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; }
  .ss-mobile-prompt-tools .ss-button { min-width:0; padding:7px 4px; font-size:10px; }
  .ss-mobile-stack-picker { display:grid; gap:4px; color:#9d95ae; font-size:10px; }
  .ss-init-panel { display:grid; grid-template-columns:55px minmax(0,1fr); gap:8px; padding:9px; background:var(--ss-panel-hi); border:1px solid var(--ss-outline); border-radius:10px; }
  .ss-init-panel .ss-creativity-row { grid-column:1/-1; }
  .ss-init-group { display:none; }
  .ss-advanced-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ss-styles-workspace { display:block; flex:1 1 0; padding:0 10px 12px; overflow-y:auto; }
  .ss-styles-header,.ss-style-collapse { display:none; }
  .ss-styles-columns,.ss-styles-columns[data-collapsed='true'] { display:block; min-height:100%; }
  .ss-styles-resizer { display:none; }
  .ss-styles-columns[data-collapsed='true'] .ss-saved-style-editor { display:flex; }
  .ss-style-column { padding:11px 0; border:0; border-radius:0; background:transparent; height:auto; min-height:0; overflow:visible; }
  .ss-saved-style-editor { overflow:visible; }
   .ss-style-column > :is(.ss-lora-library,.ss-stack-pane) { overflow:visible; height:auto; }
  .ss-style-library-column { min-height:0; }
  .ss-style-library-column .ss-lora-library { min-height:420px; }
  .ss-style-library-column .ss-lora-grid { height:min(54dvh,570px); min-height:260px; overflow-y:auto; grid-auto-rows:max-content; }
  .ss-style-library-column .ss-lora-browser { overflow:visible; min-height:180px; }
  .ss-style-column .ss-lora-grid { grid-template-columns:repeat(auto-fill,minmax(min(175px,100%),1fr)); }
  .ss-style-column .ss-lora-folder-sidebar { bottom:auto; max-height:65dvh; }
  .ss-style-column .ss-lora-folder-tree { overflow-y:auto; }
  .ss-style-column .ss-stack-list { overflow:visible; }
  .ss-style-footer { flex-wrap:nowrap; align-items:start; position:relative; }
  .ss-style-footer > .ss-button { flex:1; min-height:42px; }
  .ss-style-more > summary { display:block; height:42px; min-height:42px; padding:11px 14px; font-size:17px; }
  .ss-style-more-actions { right:0; min-width:175px; }
  .ss-history-pane { padding:0; }
  .ss-working-stack { display:none; }
  .ss-history-pane .ss-rail-history { flex:1; display:flex; max-height:none; border:0; overflow:visible; }
  .ss-history-pane .ss-rail-history > summary { display:none; }
  .ss-history-pane .ss-history-grid { grid-template-columns:repeat(2,minmax(0,1fr)); overflow:visible; flex:none; }
  .ss-commandbar { display:flex; flex:none; flex-direction:column; gap:7px; position:relative; z-index:65; padding:5px 9px calc(8px + env(safe-area-inset-bottom,0px)); background:var(--ss-header-bg); border-top:1px solid var(--ss-outline); }
  .ss-commandbar .ss-generate { flex:1; min-height:38px; }
  .ss-shell:not([data-studio-view='generate'],[data-studio-view='styles']) .ss-commandbar { display:none; }
  .ss-shell [data-action='toggle-fullscreen'], .ss-shell .ss-style-column .ss-style-collapse { display:none; }
  .ss-shell[data-mobile-tab='loras'] .ss-styles-workspace { display:flex; flex-direction:column; padding-bottom:0; overflow:hidden; }
  .ss-shell[data-mobile-tab='loras'] .ss-styles-columns,
  .ss-shell[data-mobile-tab='loras'] .ss-style-library-column { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; }
  .ss-shell[data-mobile-tab='loras'] .ss-lora-library { flex:1; min-height:0; }
  .ss-shell[data-mobile-tab='loras'] .ss-lora-browser { min-height:0; }
  .ss-shell[data-mobile-tab='loras'] .ss-lora-grid { height:100%; min-height:0; }
  .ss-library-head { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; padding:10px; }
  .ss-library-head-copy { grid-column:1; grid-row:1; }
  .ss-library-close { grid-column:2; grid-row:1; }
  .ss-library-folder-search { grid-column:1/-1; grid-row:2; width:100%; }
  .ss-library-landing-inner { padding:12px; gap:12px; }
  .ss-library-folder-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
  .ss-library-folder-card { grid-template-rows:112px minmax(48px,auto); }
  .ss-library-folder-preview { height:112px; }
  .ss-library-folder-copy { padding:8px; }
  .ss-library-folder-copy strong { font-size:11px; }
  .ss-library-new-folder-card { padding:9px; gap:6px; }
  .ss-library-new-folder-icon { width:46px; height:46px; }
  .ss-library-new-folder-icon svg { width:23px; height:23px; }
  .ss-library-folder-header { padding:10px; gap:9px; }
  .ss-library-folder-heading { grid-template-columns:52px minmax(0,1fr) auto; gap:8px; }
  .ss-library-folder-cover { width:52px; height:50px; }
  .ss-library-folder-title-copy h2 { font-size:17px; }
  .ss-library-folder-actions { grid-column:1/-1; justify-content:flex-start; }
  .ss-library-folder-actions .ss-button { min-height:32px; padding:6px 8px; }
  .ss-library-pagination { grid-column:3; grid-row:1; }
  .ss-library-pagination .ss-history-page-label { display:none; }
  .ss-library-folder-query { grid-column:1/-1; }
  .ss-library-selectbar { overflow-x:auto; flex-wrap:nowrap; padding:7px 10px; }
  .ss-library-replacebar { flex-wrap:wrap; }
  .ss-library-selection-actions { flex-wrap:nowrap; margin-left:0; }
  .ss-library-selection-actions .ss-button { flex:none; }
  .ss-output-library-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; padding:10px; }
  .ss-library-modal-layer { padding:8px; }
  .ss-library-visual-dialog { width:100%; height:100%; max-height:100%; }
  .ss-library-visual-head,.ss-library-visual-footer { padding:10px; }
  .ss-library-lookbook { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); }
  .ss-lookbook-rail { flex-direction:row; align-items:center; overflow-x:auto; overflow-y:hidden; gap:6px; min-height:79px; padding:9px; border-right:0; border-bottom:1px solid var(--ss-outline); }
  .ss-lookbook-rail-heading,.ss-lookbook-rail-bar { display:none; }
  .ss-lookbook-base { flex:0 0 142px; width:142px; }
  .ss-library-look-grid { display:flex; gap:6px; flex:0 0 auto; }
  .ss-library-look-card { flex:0 0 148px; width:148px; }
  .ss-lookbook-new { margin:0; width:auto; flex:none; white-space:nowrap; }
  .ss-library-visual-body { padding:13px; }
  .ss-library-visual-prompts,.ss-library-visual-options,.ss-library-look-editor-grid { grid-template-columns:1fr; }
  .ss-lookbook-recipe { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ss-library-look-editor-grid .ss-library-look-wide { grid-column:auto; }
  .ss-settings-layer { inset:max(var(--studio-safe-top),var(--ss-modal-viewport-top,0px)) 0 0; }
  .ss-settings-backdrop { display:none; }
  .ss-settings-dialog { width:100%; height:100%; border:0; border-radius:0; }
  .ss-settings-header { padding:11px; }
  .ss-settings-tabs { gap:2px; padding:6px; }
  .ss-settings-tab { padding:8px 2px; font-size:10px; }
  .ss-settings-content { padding:10px; }
  .ss-workflow-modal { padding:8px; }
  .ss-workflow-modal-card { width:100%; max-height:calc(100dvh - 16px); }
  .ss-workflow-field-grid { grid-template-columns:1fr; }
}
@media (max-width:400px) {
  .ss-mobile-tabs { padding-inline:5px; gap:1px; }
  .ss-mobile-tabs .ss-mobile-tab { font-size:9px; }
  .ss-topbar { padding-inline:6px; gap:5px; }
  .ss-workspace { padding-inline:8px; }
  .ss-tune-group-body { padding-inline:10px; }
  .ss-prompt-actions .ss-select { max-width:150px; }
  .ss-history-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}


/* Source-aware supporting controls */
.ss-preset-manage svg { fill: none; stroke: currentColor; }
.ss-launcher .ss-button { border: 1px solid var(--ss-outline); padding: 8px 10px; border-radius: 9px; background: var(--ss-button-bg); color: var(--lumiverse-text,#f5f3f7); cursor: pointer; }
.ss-launcher .ss-button:hover { border-color: var(--lumiverse-accent,#bba7f0); }
.ss-launcher :is(.ss-input,.ss-select,.ss-textarea) { min-width:0; width:100%; background: var(--ss-panel-bg); border:1px solid var(--ss-outline); padding:9px; border-radius:8px; color:var(--lumiverse-text,#f5f3f7); }
.ss-config-section .ss-css-guide { overflow: hidden; }
.ss-visual-lorebook-host :is(.ss-button,.ss-icon-button) { background:var(--lumiverse-fill,#292933); color:var(--lumiverse-text,#f5f3f7); border:1px solid var(--lumiverse-border,#444); border-radius:8px; padding:7px; cursor:pointer; }
.ss-visual-lorebook-host :is(.ss-input,.ss-select,.ss-textarea) { background:var(--lumiverse-fill,#22232d); color:var(--lumiverse-text,#f5f3f7); border:1px solid var(--lumiverse-border,#444); border-radius:8px; padding:8px; }
html[data-ios-pwa] .ss-output-library { position: absolute; }
.ss-output-library .ss-library-landing[hidden],.ss-output-library .ss-library-folder-view[hidden] { display: none !important; }



/* Independent launcher and visual-folders editor; not the Studio workspace. */
  .ss-drawer-cards {
    --ss-canvas-bg: var(--lumiverse-bg, #090a0d);
    --ss-panel-bg: var(--lumiverse-fill-subtle, #14151a);
    --ss-header-bg: color-mix(in srgb, var(--lumiverse-primary, #7dd3fc) 9%, var(--ss-panel-bg));
    --ss-outline: var(--lumiverse-border, #30323a);
    --ss-button-bg: var(--lumiverse-fill-subtle, #17181e);
    display: grid;
    gap: 12px;
    margin: 12px;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr);
    box-sizing: border-box;
  }
  .ss-launcher {
    --ss-canvas-bg: var(--lumiverse-bg, #090a0d);
    --ss-panel-bg: var(--lumiverse-fill-subtle, #14151a);
    --ss-header-bg: color-mix(in srgb, var(--lumiverse-primary, #7dd3fc) 9%, var(--ss-panel-bg));
    --ss-outline: var(--lumiverse-border, #30323a);
    --ss-button-bg: var(--lumiverse-fill-subtle, #17181e);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-height: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 18px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-panel-radius, calc(var(--lumiverse-radius, 10px) * 1.25));
    background:
      radial-gradient(circle at 88% 2%, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 22%, transparent), transparent 38%),
      linear-gradient(145deg, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 8%, transparent), transparent 48%),
      var(--ss-canvas-bg);
    color: var(--lumiverse-text);
  }
  .ss-launcher::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: .28;
    background-image: radial-gradient(circle, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 58%, transparent) 1px, transparent 1.4px);
    background-size: 22px 22px;
    mask-image: linear-gradient(115deg, transparent 8%, black 62%, transparent);
    pointer-events: none;
  }
  .ss-launcher::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 126px;
    height: 126px;
    right: -48px;
    top: -54px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 35%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 0 18px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 4%, transparent);
    pointer-events: none;
  }
  .ss-launcher-corner {
    position: absolute;
    z-index: 1;
    width: 68px;
    height: 56px;
    color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 70%, var(--ss-outline));
    opacity: .72;
    background:
      linear-gradient(currentColor, currentColor) 0 0 / 28px 1px no-repeat,
      linear-gradient(currentColor, currentColor) 41px 0 / 18px 1px no-repeat,
      linear-gradient(currentColor, currentColor) 0 0 / 1px 20px no-repeat,
      linear-gradient(currentColor, currentColor) 0 33px / 1px 15px no-repeat;
    pointer-events: none;
  }
  .ss-launcher-corner[data-corner="tl"] { top: 18px; left: 18px; }
  .ss-launcher-corner[data-corner="tr"] { top: 18px; right: 18px; transform: rotate(90deg); }
  .ss-launcher-corner[data-corner="br"] { right: 18px; bottom: 18px; transform: rotate(180deg); }
  .ss-launcher-corner[data-corner="bl"] { bottom: 18px; left: 18px; transform: rotate(270deg); }
  .ss-launcher-center {
    width: min(430px, calc(100% - 36px));
    display: grid;
    justify-items: center;
    margin: clamp(70px, 14dvh, 150px) auto 0;
    text-align: center;
  }
  .ss-launcher-emblem {
    width: clamp(112px, 25vw, 176px);
    color: var(--lumiverse-accent, #7dd3fc);
    filter: drop-shadow(0 12px 32px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 20%, transparent));
  }
  .ss-launcher-emblem svg { width: 100%; height: auto; display: block; fill: currentColor; }
  .ss-launcher-wordmark {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-top: 25px;
    color: var(--lumiverse-text);
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: clamp(25px, 5vw, 34px);
    font-weight: 400;
    letter-spacing: .015em;
    line-height: 1;
  }
  .ss-launcher-wordmark svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: var(--lumiverse-accent, #7dd3fc);
    stroke-width: 1.35;
    stroke-linejoin: round;
  }
  .ss-launcher-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 28px;
  }
  .ss-launcher-actions .ss-button {
    min-width: 0;
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding-inline: 10px;
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 10px;
    letter-spacing: .025em;
  }
  .ss-launcher-actions .ss-button svg {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-launcher-action-content {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    display: inline-flex;
    width: max-content;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 0 auto;
  }
  .ss-launcher-action-content > svg {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    margin: 0 !important;
  }
  .ss-launcher-actions .ss-launcher-visuals-button {
    grid-column: 1 / -1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 35%, var(--ss-outline));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 8%, var(--ss-button-bg));
  }
  .ss-drawer-cards > [hidden] { display: none !important; }
  .ss-quick-visuals {
    --ss-text: var(--lumiverse-text, #f0edf8);
    --ss-accent: var(--lumiverse-accent, var(--lumiverse-primary, #c1b0f5));
    --ss-accent-line: color-mix(in srgb, var(--ss-accent) 47%, var(--ss-outline));
    --ss-accent-soft: color-mix(in srgb, var(--ss-accent) 15%, var(--ss-panel-bg));
    width: 100%; margin: 0; padding: 12px; min-width: 0; display: grid; gap: 9px;
    box-sizing: border-box; border: 1px solid var(--ss-outline);
    border-radius: var(--ss-panel-radius, calc(var(--lumiverse-radius, 10px) * 1.25));
    background: var(--ss-canvas-bg);
    color: var(--lumiverse-text, #f0edf8); font: 13px/1.4 system-ui, sans-serif;
  }
  .ss-quick-visuals *, .ss-quick-visuals *::before, .ss-quick-visuals *::after { box-sizing: border-box; }
  .ss-quick-visuals [hidden] { display: none !important; }
  .ss-quick-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
  .ss-quick-visuals .ss-quick-back { display: inline-flex; align-items: center; gap: 5px; }
  .ss-quick-back svg, .ss-quick-chevron { width: 16px; height: 16px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .ss-quick-heading { display: flex; align-items: center; gap: 12px; padding: 12px 2px 5px; }
  .ss-quick-heading::after { content: ""; height: 1px; flex: 1; background: linear-gradient(90deg,var(--ss-accent-line),transparent); }
  .ss-quick-visuals .ss-quick-refresh { display: grid; place-items: center; width: 36px; padding: 7px; }
  .ss-quick-refresh svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .ss-quick-style { font-size: 11px; color: var(--lumiverse-text-muted,#b6b1c5); overflow-wrap: anywhere; }
  .ss-quick-style:empty { display: none; }
  .ss-quick-settings { display: grid; gap: 13px; padding: 12px; }
  .ss-quick-visuals .ss-quick-widget { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0; border: 0; background: transparent; font-size: 13px; color: var(--ss-text); }
  .ss-quick-widget input:focus-visible + .ss-switch-track { outline: 2px solid var(--lumiverse-accent,#c1b0f5); outline-offset: 3px; }
  .ss-quick-scale { display: grid; gap: 7px; font-size: 12px; color: var(--lumiverse-text-muted,#b6b1c5); }
  .ss-quick-scale .ss-image-scale-grid { gap: 5px; }
  .ss-quick-visuals .ss-image-scale-button { justify-content: center; padding: 8px 2px; font-size: 10px; }
  .ss-quick-visuals .ss-image-scale-button[data-active=true] { border-color: var(--ss-accent-line); background: var(--ss-accent-soft); }
  .ss-quick-links { display: grid; gap: 6px; }
  .ss-quick-heading p { margin: 5px 0 0; font-size: 12px; color: var(--lumiverse-text-muted, #b6b1c5); }
  .ss-quick-visuals h2 { margin: 3px 0 0; font: 400 27px/1.2 Georgia, Cambria, serif; }
  .ss-quick-eyebrow { font-size: 10px; letter-spacing: .1em; color: var(--lumiverse-text-muted, #b6b1c5); }
  .ss-quick-card { border: 1px solid var(--ss-outline); border-radius: 10px; background: var(--ss-panel-bg); min-width: 0; }
  .ss-quick-card > summary { list-style: none; display: flex; align-items: center; gap: 9px; min-width: 0; padding: 12px; cursor: pointer; border-radius: 9px; }
  .ss-quick-card > summary::-webkit-details-marker { display: none; }
  .ss-quick-card > summary::marker { content: ""; }
  .ss-quick-card > summary:hover { background: color-mix(in srgb, var(--lumiverse-accent, #c1b0f5) 7%, transparent); }
  .ss-quick-summary-copy { display: grid; gap: 3px; flex: 1; min-width: 0; }
  .ss-quick-summary-copy strong { font-size: 14px; overflow-wrap: anywhere; min-width: 0; }
  .ss-quick-state { flex: none; font-size: 11px; color: var(--lumiverse-text-muted, #b6b1c5); border-radius: 6px; padding: 3px 5px; background: var(--ss-button-bg); }
  .ss-quick-chevron { color: var(--lumiverse-accent, #c1b0f5); transition: transform .15s ease; }
  .ss-quick-card[open] > summary .ss-quick-chevron { transform: rotate(90deg); }
  .ss-quick-card[open] > summary { border-bottom: 1px solid var(--ss-outline); border-radius: 9px 9px 0 0; }
  .ss-quick-body { display: grid; gap: 9px; padding: 12px; min-width: 0; }
  .ss-quick-empty { margin: 0; font-size: 12px; color: var(--lumiverse-text-muted, #b6b1c5); }
  @media (prefers-reduced-motion: reduce) { .ss-quick-chevron { transition: none; } }
  .ss-quick-fields { display: grid; gap: 8px; min-width: 0; }
  .ss-quick-visuals label { display: grid; gap: 4px; min-width: 0; font-size: 12px; color: var(--lumiverse-text-muted, #b6b1c5); }
  .ss-quick-visuals button, .ss-quick-visuals select, .ss-quick-visuals input[type=text] {
    min-width: 0; max-width: 100%; min-height: 36px; border-radius: 7px; border: 1px solid var(--ss-outline);
    padding: 7px 9px; font: 13px/1.3 system-ui, sans-serif; color: var(--lumiverse-text, #f0edf8); background: var(--ss-button-bg);
  }
  .ss-quick-visuals select, .ss-quick-visuals input[type=text] { width: 100%; }
  .ss-quick-visuals button { cursor: pointer; }
  .ss-quick-visuals button:disabled, .ss-quick-visuals select:disabled, .ss-quick-visuals input:disabled { opacity: .55; cursor: not-allowed; }
  .ss-quick-visuals :is(button,select,input,summary):focus-visible { outline: 2px solid var(--lumiverse-accent, #c1b0f5); outline-offset: 2px; }
  .ss-quick-visuals .ss-quick-toggle { display: flex; align-items: center; gap: 8px; min-height: 30px; color: var(--lumiverse-text, #f0edf8); }
  .ss-quick-toggle input { margin: 0; accent-color: var(--lumiverse-accent, #c1b0f5); width: 16px; height: 16px; }
  .ss-quick-status { margin: 0; font-size: 12px; overflow-wrap: anywhere; color: var(--lumiverse-text-muted, #b6b1c5); }
  .ss-quick-status:empty { display: none; }
  .ss-quick-status[data-error=true] { color: var(--lumiverse-danger, #f2a3a3); }
  .ss-quick-visuals .ss-quick-edit { display: flex; gap: 8px; align-items: center; justify-content: center; border-color: color-mix(in srgb, var(--lumiverse-accent, #c1b0f5) 50%, var(--ss-outline)); }
  .ss-quick-edit svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.6; }
  .ss-launcher-action-content {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    display: inline-flex;
    width: max-content;
    max-width: 100%;
    align-items: center;
    justify-content: center;
    gap: 7px;
    margin: 0 auto;
  }
  .ss-launcher-action-content > svg {
    position: static !important;
    inset: auto !important;
    transform: none !important;
    margin: 0 !important;
  }
  .ss-chat-visuals-page svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-chat-visuals-page {
    position: relative;
    z-index: 2;
    min-height: 0;
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
  }
  .ss-chat-visuals-page[hidden] { display: none; }
  .ss-chat-visuals-head,
  .ss-chat-visuals-section-head,
  .ss-chat-visuals-actions,
  .ss-chat-visuals-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ss-chat-visuals-head {
    min-height: 44px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--ss-outline);
  }
  .ss-chat-visuals-head-copy { min-width: 0; flex: 1; }
  .ss-chat-visuals-head-copy strong {
    display: block;
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 18px;
    font-weight: 500;
  }
  .ss-chat-visuals-tabs {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px;
    border: 1px solid var(--ss-outline); border-radius: 10px;
    background: color-mix(in srgb, var(--ss-canvas-bg) 72%, transparent);
  }
  .ss-chat-visuals-tab {
    min-width: 0; min-height: 32px; border: 0; border-radius: 7px; color: var(--lumiverse-text-muted);
    background: transparent; font: inherit; font-size: 9px; cursor: pointer;
  }
  .ss-chat-visuals-tab[data-active="true"] {
    color: var(--lumiverse-text); background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 18%, var(--ss-button-bg));
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 32%, transparent);
  }
  .ss-chat-visuals-scroll {
    min-height: 0;
    display: grid;
    gap: 10px;
    overflow-y: auto;
    padding: 1px 3px 8px 1px;
  }
  .ss-chat-visuals-context {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .ss-chat-visuals-panel { min-width: 0; display: grid; gap: 10px; }
  .ss-chat-visuals-panel[hidden] { display: none !important; }
  .ss-chat-visuals-chip {
    max-width: 100%;
    overflow: hidden;
    padding: 4px 8px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 24%, var(--ss-outline));
    border-radius: 999px;
    color: var(--lumiverse-text-muted);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 7%, transparent);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ss-chat-visuals-section {
    display: grid;
    gap: 9px;
    padding: 12px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-panel-radius, 10px);
    background: var(--ss-panel-bg);
  }
  .ss-chat-visuals-section-head { align-items: flex-start; }
  .ss-chat-visuals-section-head > div:first-child { min-width: 0; flex: 1; }
  .ss-chat-visuals-section-head strong { display: block; font-size: 11px; }
  .ss-chat-visuals-section-head span { display: block; margin-top: 2px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-toggle-line {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
    cursor: pointer;
    user-select: none;
  }
  .ss-toggle-line input {
    appearance: none;
    width: 30px;
    height: 17px;
    margin: 0;
    position: relative;
    flex: 0 0 auto;
    border: 1px solid color-mix(in srgb, var(--ss-outline) 88%, #fff 12%);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ss-canvas-bg) 84%, #fff 4%);
    box-shadow: inset 0 1px 3px rgba(0,0,0,.38);
    transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
  }
  .ss-toggle-line input::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--lumiverse-text-muted) 75%, #fff);
    box-shadow: 0 1px 4px rgba(0,0,0,.45);
    transition: transform .15s ease, background .15s ease;
  }
  .ss-toggle-line input:checked {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 72%, #fff 8%);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 52%, var(--ss-canvas-bg));
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 12%, transparent);
  }
  .ss-toggle-line input:checked::after {
    transform: translateX(13px);
    background: #fff;
  }
  .ss-toggle-line input:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 58%, transparent);
    outline-offset: 2px;
  }
  .ss-toggle-line input:disabled { cursor: not-allowed; opacity: .42; }
  .ss-chat-visuals-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 9px;
  }
  .ss-chat-visuals-field { min-width: 0; display: grid; gap: 5px; }
  .ss-chat-visuals-field > label {
    color: var(--lumiverse-text-muted);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .ss-chat-visuals-field .ss-textarea { min-height: 88px; resize: vertical; }
  .ss-chat-visuals-field .ss-select {
    min-width: 0;
    padding-inline: 8px 25px;
    font-size: 10px;
    text-overflow: ellipsis;
  }
  .ss-chat-visuals-field .ss-select option { font-size: 11px; }
  .ss-chat-visuals-row > :is(.ss-select, .ss-input) { min-width: 0; flex: 1; }
  .ss-chat-visuals-row .ss-icon-button { flex: 0 0 auto; }
  .ss-chat-visuals-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .ss-chat-visuals-binding-state {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-right: auto;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
    opacity: .5;
    transition: color .15s ease, opacity .15s ease;
  }
  .ss-chat-visuals-binding-state svg {
    width: 13px;
    height: 13px;
    flex: 0 0 auto;
  }
  .ss-chat-visuals-binding-state[data-state="bound"] {
    color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 88%, white);
    opacity: 1;
  }
  .ss-chat-visuals-binding-state[data-state="dirty"] {
    color: #f6c177;
    opacity: .92;
  }
  .ss-chat-visuals-status {
    color: var(--lumiverse-text-muted);
    font-size: 9px;
  }
  .ss-chat-visuals-status:empty { display: none; }
  .ss-chat-visuals-status[data-error="true"] { color: #fb7185; }
  .ss-host-visual-canon,
  .ss-visual-lorebook-host {
    box-sizing: border-box;
    height: 100%;
    min-height: 0;
    color: var(--lumiverse-text, #f5f3f7);
    background: var(--lumiverse-bg, transparent);
    font: 500 12px/1.45 Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .ss-host-visual-canon *, .ss-visual-lorebook-host * { box-sizing: border-box; }
  .ss-visual-lorebook-host svg {
    fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round;
  }
  .ss-host-visual-canon-shell { display: grid; gap: 14px; padding: 16px; min-height: 0; }
  .ss-host-continuity-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .ss-host-continuity-head > div { display: grid; gap: 2px; }
  .ss-host-look-rail { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 9px; }
  .ss-host-look-card {
    display: grid; grid-template-columns: 42px minmax(0, 1fr); align-items: center; gap: 8px; min-height: 58px;
    padding: 7px; color: inherit; text-align: left; cursor: pointer; border: 1px solid var(--lumiverse-border, rgba(255,255,255,.14));
    border-radius: 10px; background: var(--lumiverse-fill, rgba(255,255,255,.04));
  }
  .ss-host-look-card[data-selected="true"] { border-color: var(--lumiverse-primary, #a78bfa); box-shadow: 0 0 0 1px color-mix(in srgb, var(--lumiverse-primary, #a78bfa) 45%, transparent); }
  .ss-host-look-card[data-active="true"] { background: color-mix(in srgb, var(--lumiverse-primary, #a78bfa) 12%, var(--lumiverse-fill, transparent)); }
  .ss-host-look-card img, .ss-host-look-placeholder { width: 42px; height: 42px; border-radius: 8px; object-fit: cover; }
  .ss-host-look-placeholder { display: grid; place-items: center; background: color-mix(in srgb, var(--lumiverse-primary, #a78bfa) 22%, transparent); font-weight: 800; }
  .ss-host-look-card strong, .ss-host-look-card span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-host-look-form { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--lumiverse-border, rgba(255,255,255,.12)); border-radius: 12px; background: var(--lumiverse-surface, rgba(255,255,255,.025)); }
  .ss-host-continuity-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap; }
/* Manual Lore selection: shared draft tray and small top-layer provenance disclosure. */
.ss-lore-manual-tray { display:flex; flex:none; align-items:center; gap:8px; min-width:0; padding:10px 13px; background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius); }
.ss-lore-manual-tray > div { flex:1; min-width:0; display:grid; gap:3px; }
.ss-lore-manual-tray strong { font-size:12px; color:var(--ss-text); }
.ss-lore-manual-tray small { font-size:10px; color:var(--ss-muted); overflow-wrap:anywhere; }
.ss-lore-use[aria-pressed=true] { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); color:var(--ss-text); }
.ss-lore-use svg { width:15px; height:15px; flex:none; }
.ss-lore-manual-mark { color:var(--ss-accent); font-weight:700; }
.ss-lore-provenance-button { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--ss-outline); border-radius:999px; background:var(--ss-field-bg); color:var(--ss-muted); padding:4px 7px; font-size:10px; cursor:pointer; min-height:24px; }
.ss-lore-provenance-button[data-selected=true] { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); color:var(--ss-text); }
.ss-lore-provenance-button svg { width:15px; height:15px; fill:none; stroke:currentColor; stroke-width:1.5; stroke-linecap:round; stroke-linejoin:round; }
.ss-lore-provenance { position:fixed; inset:auto; margin:0; width:min(310px,calc(100vw - 16px)); max-height:min(440px,calc(100dvh - 16px)); overflow:auto; padding:15px; color:var(--ss-text); background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius); box-shadow:0 10px 30px #0006; font-size:12px; box-sizing:border-box; }
.ss-lore-provenance:popover-open { display:grid; gap:12px; }
.ss-lore-provenance-title { font:500 20px/1.15 Georgia,serif; }
.ss-lore-provenance-source { display:grid; gap:8px; }
.ss-lore-provenance-book { color:var(--ss-muted); overflow-wrap:anywhere; font-size:11px; }
.ss-lore-provenance-heading { display:flex; align-items:center; gap:7px; color:var(--ss-accent); font-size:11px; font-weight:650; }
.ss-lore-provenance-rule { flex:1; border-top:1px solid var(--ss-outline); }
.ss-lore-provenance-list { list-style:none; padding:0 0 0 8px; margin:0; display:grid; gap:5px; overflow-wrap:anywhere; }
.ss-lore-provenance-list li::before { content:"·"; color:var(--ss-muted); margin-right:7px; }
.ss-lore-provenance > .ss-button { width:100%; justify-content:center; }
@container lore-atelier (max-width:740px) {
  .ss-lore-manual-tray { flex-wrap:wrap; padding:8px; }
  .ss-lore-manual-tray > div { flex-basis:100%; }
  .ss-lore-manual-tray > button { flex:1; }
  .ss-lore-save-actions .ss-lore-use { grid-column:1/-1; }
}
/* Visual Lore Atelier: the native lorebook editor lives in Studio, not the drawer. */
.ss-lore-page { flex:1 1 0; min-height:0; min-width:0; overflow:hidden; container-type:inline-size; container-name:lore-atelier; background:var(--ss-canvas-bg); }
.ss-lore-atelier { height:100%; min-height:0; min-width:0; color:var(--ss-text); }
.ss-lore-atelier * { box-sizing:border-box; }
.ss-lore-atelier :is(h1,h2,h3,p) { margin:0; overflow-wrap:anywhere; }
.ss-visual-lore-shell { height:100%; display:flex; flex-direction:column; gap:14px; padding:clamp(12px,2cqi,24px); min-height:0; min-width:0; }
.ss-lore-overview { display:flex; align-items:center; gap:16px; justify-content:space-between; flex:none; }
.ss-lore-header { display:flex; justify-content:space-between; align-items:center; gap:12px; flex:1; min-width:0; }
.ss-lore-header h1 { font:500 clamp(25px,3.5cqi,40px)/1.1 Georgia,serif; letter-spacing:-.7px; margin:4px 0 5px; }
.ss-lore-header p,.ss-lore-section p { color:var(--ss-muted); font-size:12px; }
.ss-lore-header .ss-button { flex:none; }
.ss-lore-stats { display:flex; flex-wrap:wrap; gap:6px; flex:0 1 auto; justify-content:flex-end; }
.ss-lore-stats > span { padding:7px 11px; border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius); color:var(--ss-muted); font-size:11px; background:var(--ss-panel-bg); }
.ss-lore-stats strong { color:var(--ss-text); font-size:14px; margin-right:3px; }
.ss-visual-lore-workspace { display:grid; grid-template-columns:minmax(230px, .72fr) minmax(0,1.65fr); gap:14px; flex:1 1 0; min-height:0; min-width:0; }
.ss-lore-library,.ss-lore-editor { min-width:0; min-height:0; border:1px solid var(--ss-outline); border-radius:var(--ss-panel-radius); background:var(--ss-panel-bg); overflow:auto; overscroll-behavior:contain; }
.ss-lore-library { display:flex; flex-direction:column; gap:13px; padding:14px; }
.ss-lore-library-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; }
.ss-lore-library-head .ss-select[data-role="visual-lore-filter"] { width:auto; max-width:100%; font-size:11px; flex:0 1 140px; padding:7px 24px 7px 8px; }
.ss-lore-library h2 { font-size:16px; font-weight:650; }
.ss-visual-lore-toolbar { display:grid; gap:10px; flex:none; }
.ss-lore-atelier :is(.ss-input,.ss-select,.ss-textarea) { font-size:12px; width:100%; }
.ss-lore-atelier .ss-field > span:first-child { font-size:11px; }
.ss-visual-lore-directory { display:grid; gap:16px; align-content:start; min-width:0; }
.ss-visual-lore-group { display:grid; gap:5px; min-width:0; }
.ss-visual-lore-group-title { color:var(--ss-muted); font-size:10px; letter-spacing:.08em; text-transform:uppercase; padding:4px 2px; }
.ss-lore-folder { border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius); overflow:hidden; gap:0; }
.ss-lore-folder-toggle { display:flex; align-items:center; gap:8px; min-width:0; width:100%; padding:10px; background:var(--ss-panel-hi); color:var(--ss-text); text-align:left; border:0; }
.ss-lore-folder-toggle:hover { background:var(--ss-accent-soft); }
.ss-lore-folder-toggle strong { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; }
.ss-lore-folder-toggle svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; color:var(--ss-accent); }
.ss-lore-folder-toggle .ss-lore-folder-chevron { width:13px; color:var(--ss-muted); transition:transform .15s ease; }
.ss-lore-folder-toggle[aria-expanded=true] .ss-lore-folder-chevron { transform:rotate(90deg); }
.ss-lore-folder-count { color:var(--ss-muted); font-size:10px; }
.ss-lore-folder-entries { display:grid; gap:4px; padding:5px; border-top:1px solid var(--ss-outline); }
.ss-lore-folder-entries[hidden] { display:none; }
@media(prefers-reduced-motion:reduce) { .ss-lore-folder-chevron { transition:none; } }
.ss-visual-lore-entry { display:grid; grid-template-columns:40px minmax(0,1fr) auto; gap:9px; align-items:center; min-width:0; width:100%; padding:8px; background:transparent; border:1px solid transparent; border-radius:var(--ss-control-radius); color:var(--ss-text); text-align:left; }
.ss-visual-lore-entry:hover { background:var(--ss-panel-hi); }
.ss-visual-lore-entry[data-selected=true] { border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-lore-thumb { width:40px; height:46px; border-radius:7px; display:grid; place-items:center; position:relative; overflow:hidden; background:var(--ss-field-bg); color:var(--ss-accent); font:600 18px Georgia,serif; }
.ss-lore-thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.ss-visual-lore-entry-copy { display:grid; gap:2px; min-width:0; }
.ss-visual-lore-entry-copy > * { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-visual-lore-entry-copy strong { font-size:12px; }
.ss-visual-lore-entry-copy > span { font-size:10px; text-transform:capitalize; }
.ss-lore-badge { border:1px solid var(--ss-outline); background:var(--ss-field-bg); border-radius:6px; padding:3px 6px; color:var(--ss-muted); font-size:10px; white-space:nowrap; }
.ss-lore-badge[data-active=true] { color:var(--ss-text); background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-lore-editor { padding:0; }
.ss-visual-lore-form { display:grid; gap:0; min-width:0; }
.ss-lore-selection { display:flex; align-items:start; justify-content:space-between; gap:10px; padding:14px 20px; background:var(--ss-panel-hi); border-bottom:1px solid var(--ss-outline); }
.ss-lore-selection > div { min-width:0; }
.ss-lore-selection h2 { font:500 clamp(20px,2.5cqi,28px)/1.2 Georgia,serif; margin:5px 0; }
.ss-lore-keyline { color:var(--ss-muted); font-size:11px; overflow-wrap:anywhere; }
.ss-lore-section { display:grid; gap:10px; padding:13px 20px; border-bottom:1px solid var(--ss-border-subtle); min-width:0; }
.ss-lore-section h3 { font-size:13px; font-weight:650; }
.ss-lore-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; min-width:0; }
.ss-lore-override-fields { grid-template-columns:minmax(0,.7fr) minmax(0,1.5fr) minmax(0,1.1fr); }
.ss-lore-prompt-fields .ss-textarea { min-height:148px; }
.ss-lore-form .ss-field small,.ss-visual-lore-form .ss-field small { color:var(--ss-muted); font-size:11px; line-height:1.4; }
.ss-lore-reference { display:grid; grid-template-columns:minmax(100px,.6fr) minmax(0,1.5fr); gap:14px; align-items:start; }
.ss-lore-reference-preview { aspect-ratio:4/3; display:grid; place-items:center; background:var(--ss-field-bg); border:1px dashed var(--ss-outline); border-radius:var(--ss-control-radius); overflow:hidden; text-align:center; }
.ss-lore-reference-preview img { width:100%; height:100%; min-height:0; object-fit:contain; }
.ss-lore-reference-fields { display:grid; gap:10px; min-width:0; }
.ss-lore-reference-actions,.ss-lore-save-actions { display:flex; flex-wrap:wrap; gap:8px; }
.ss-lore-savebar { position:sticky; bottom:0; z-index:1; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:10px; padding:12px 20px; border-top:1px solid var(--ss-outline); background:var(--ss-panel-bg); }
.ss-lore-savebar .ss-toggle-line { display:flex; align-items:center; gap:7px; font-size:11px; }
.ss-lore-save-actions { margin-left:auto; }
.ss-lore-status { flex:none; font-size:12px; color:var(--ss-text); padding:8px 12px; border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius); background:var(--ss-panel-bg); overflow-wrap:anywhere; }
.ss-lore-status[data-error=true] { color:var(--lumiverse-danger,#ef9ba8); }
.ss-lore-status:empty { display:none; }
.ss-lore-editor-empty,.ss-visual-lore-state { display:grid; place-items:center; align-content:center; gap:12px; min-height:240px; padding:24px; text-align:center; color:var(--ss-muted); }
.ss-visual-lore-state { height:100%; }
.ss-visual-lore-state svg,.ss-lore-editor-empty svg { width:34px; height:34px; color:var(--ss-accent); }
.ss-visual-lore-state strong { font-size:18px; color:var(--ss-text); }
.ss-visual-lore-state span { max-width:380px; font-size:12px; }
.ss-lore-atelier .ss-lore-back.ss-button { display:none; }
/* Visuals workspace: reuse the established bindings and editor, not drawer dimensions. */
.ss-visuals-workspace { flex:1 1 0; min-height:0; min-width:0; overflow:hidden; container-type:inline-size; container-name:visuals-workspace; background:var(--ss-canvas-bg); }
.ss-visuals-workspace .ss-chat-visuals-page { gap:12px; padding:16px 20px; box-sizing:border-box; color:var(--ss-text); }
.ss-visuals-workspace .ss-chat-visuals-head { gap:12px; flex:none; padding:0 0 12px; }
.ss-visuals-workspace .ss-chat-visuals-head h1 { margin:3px 0; font:500 27px/1.15 Georgia,Cambria,serif; }
.ss-visuals-workspace .ss-chat-visuals-head p { margin:0; color:var(--ss-muted); font-size:12px; line-height:1.5; }
.ss-visuals-head-actions { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.ss-visuals-head-actions .ss-button { display:inline-flex; gap:6px; align-items:center; }
.ss-visuals-workspace .ss-chat-visuals-tabs { max-width:360px; width:100%; flex:none; }
.ss-visuals-workspace .ss-chat-visuals-tab { font-size:13px; min-height:38px; font-weight:650; }
.ss-visuals-workspace .ss-chat-visuals-scroll { flex:1 1 0; align-content:start; gap:12px; padding:0 2px 12px; scrollbar-width:thin; }
.ss-visuals-workspace .ss-chat-visuals-chip { font-size:11px; padding:6px 10px; }
.ss-visuals-workspace [data-visual-panel="character"] { grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:14px; }
.ss-visuals-character-base { display:grid; gap:14px; min-width:0; }
.ss-visuals-character-nav { display:none; }
.ss-visuals-character-nav .ss-button[aria-pressed="true"] { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-visuals-workspace .ss-chat-visuals-field .ss-select { font-size:14px; }

.ss-visuals-workspace .ss-chat-visuals-section { gap:14px; padding:18px; min-width:0; }
.ss-visuals-workspace .ss-chat-visuals-section-head strong { font-size:16px; line-height:1.3; }
.ss-visuals-workspace .ss-chat-visuals-section-head span { font-size:12px; line-height:1.45; }
.ss-visuals-workspace .ss-chat-visuals-field { gap:6px; }
.ss-visuals-workspace .ss-chat-visuals-field > :is(label,span) { font-size:12px; font-weight:650; color:var(--ss-muted); text-transform:none; letter-spacing:0; }
.ss-visuals-workspace .ss-chat-visuals-grid { gap:12px; }
.ss-visuals-workspace :is(.ss-input,.ss-select,.ss-textarea) { font-size:14px; min-width:0; width:100%; box-sizing:border-box; }
.ss-visuals-workspace :is(.ss-input,.ss-select,.ss-button,.ss-icon-button) { min-height:38px; }
.ss-visuals-workspace .ss-chat-visuals-field .ss-textarea { min-height:112px; line-height:1.5; }
.ss-visuals-workspace [data-role="persona-positive"] { min-height:160px; }
.ss-visuals-workspace .ss-chat-visuals-field .ss-select option { font-size:14px; }
.ss-visuals-workspace :is(.ss-chat-visuals-binding-state,.ss-toggle-line,.ss-tiny) { font-size:12px; }
.ss-visuals-workspace .ss-chat-visuals-section-head .ss-toggle-line { flex:none; }
.ss-visuals-workspace .ss-chat-visuals-section-head .ss-chat-visuals-binding-state { width:auto; flex:none; margin-right:0; }
.ss-visuals-workspace .ss-chat-visuals-status { flex:none; padding:8px 12px; font-size:12px; overflow-wrap:anywhere; background:var(--ss-panel-bg); border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius); }
/* Atelier surfaces: a visual shelf and a writing canvas, with secondary settings on demand. */
.ss-visuals-workspace .ss-chat-visuals-head { min-height:0; padding-bottom:8px; }
.ss-visuals-workspace .ss-chat-visuals-head-copy p { display:none; }
.ss-visuals-workspace .ss-chat-visuals-tabs { max-width:300px; flex:0 1 300px; }
.ss-visuals-workspace .ss-chat-visuals-context { display:none; }
.ss-visuals-workspace .ss-chat-visuals-section { background:color-mix(in srgb,var(--ss-panel-bg) 65%,var(--ss-canvas-bg)); border-color:var(--ss-outline); gap:12px; }
.ss-visuals-workspace .ss-chat-visuals-section-head { padding-bottom:12px; border-bottom:1px solid var(--ss-outline); }
.ss-visuals-workspace .ss-chat-visuals-section-head strong { font:500 26px/1.2 Georgia,Cambria,serif; overflow-wrap:anywhere; }
.ss-visuals-workspace .ss-visual-kicker, .ss-visual-kicker { line-height:1.4; font-size:10px; font-weight:650; letter-spacing:.13em; color:var(--ss-accent); display:block; }
.ss-visual-shelf { display:grid; gap:8px; min-width:0; }
.ss-visual-shelf-head { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.ss-visual-shelf-head > strong { font-size:12px; font-weight:650; color:var(--ss-muted); }
.ss-visuals-workspace .ss-visual-shelf-head .ss-icon-button { min-height:32px; width:32px; }
.ss-visuals-workspace .ss-visual-fallback { display:none; }
.ss-visual-card-rail { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(142px, 44%); gap:9px; overflow-x:auto; min-width:0; padding:2px 2px 8px; scrollbar-width:thin; scroll-snap-type:x proximity; }
.ss-visual-card { position:relative; display:grid; grid-template-columns:64px minmax(0,1fr); min-height:80px; text-align:left; padding:0; overflow:hidden; min-width:0; border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius,10px); color:var(--ss-text); background:var(--ss-panel-bg); cursor:pointer; scroll-snap-align:start; font:inherit; }
.ss-visual-card[aria-pressed=true] { border-color:var(--ss-accent); box-shadow:0 0 0 1px var(--ss-accent); }
.ss-visual-card:focus-visible { outline:2px solid var(--ss-accent); outline-offset:-3px; }
.ss-visual-card-art { position:relative; min-height:80px; display:grid; place-items:center; overflow:hidden; background:linear-gradient(130deg,var(--ss-accent-soft),transparent),var(--ss-canvas-bg); }
.ss-visual-card-initial { font:500 37px/1 Georgia,Cambria,serif; color:var(--ss-accent); opacity:.8; }
.ss-visual-card-art img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center 30%; }
.ss-visual-card-body { display:grid; align-content:center; gap:3px; min-width:0; padding:8px; }
.ss-visual-card-body strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
.ss-visual-card-description { color:var(--ss-muted); font-size:11px; line-height:1.35; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow-wrap:anywhere; min-height:30px; }
.ss-visual-card-active { position:absolute; bottom:4px; left:4px; color:var(--ss-text); background:var(--ss-canvas-bg); border:1px solid var(--ss-accent-line); border-radius:999px; padding:3px 7px; font-size:10px; }
.ss-visual-profile-rail { grid-auto-columns:minmax(150px,32%); }
.ss-visual-prompt-stack { display:grid; gap:10px; min-width:0; }
.ss-visuals-workspace .ss-visual-writing .ss-textarea { min-height:124px; padding:14px; border-color:var(--ss-outline); background:var(--ss-canvas-bg); line-height:1.6; font-size:14px; }
.ss-visuals-workspace .ss-visual-negative .ss-textarea { min-height:56px; height:64px; background:transparent; }
.ss-visuals-workspace .ss-visual-writing > :is(label,span) { color:var(--ss-text); }
.ss-visual-disclosure { min-width:0; border-top:1px solid var(--ss-outline); padding:0; }
.ss-visual-disclosure > summary { display:flex; align-items:center; min-height:38px; gap:8px; font-size:12px; font-weight:650; cursor:pointer; color:var(--ss-text); list-style:none; }
.ss-visual-disclosure > summary::-webkit-details-marker { display:none; }
.ss-visual-disclosure > summary::after { content:""; width:7px; height:7px; border-right:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg); margin-left:auto; margin-right:4px; flex:none; }
.ss-visual-disclosure[open] > summary::after { transform:rotate(225deg); }
.ss-visual-disclosure > :not(summary) { margin:0 0 10px; }
.ss-visual-disclosure summary span { font-size:11px; font-weight:400; color:var(--ss-muted); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-visual-helper { font-size:12px; color:var(--ss-muted); line-height:1.5; margin:0; }
.ss-visual-look-title { display:grid; gap:4px; }
.ss-visuals-workspace .ss-visual-look-title input { font:500 20px/1.3 Georgia,Cambria,serif; background:transparent; border:0; border-bottom:1px solid var(--ss-outline); border-radius:0; padding:4px 0; }
.ss-visuals-workspace .ss-visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
.ss-visuals-workspace .ss-chat-visuals-scroll { grid-template-rows:minmax(0,1fr); overflow:hidden; align-content:stretch; }
.ss-visuals-workspace .ss-chat-visuals-panel { min-height:0; height:100%; grid-template-rows:minmax(0,1fr); align-items:stretch; }
.ss-visuals-workspace [data-visual-panel="character"] { align-items:stretch; }
.ss-visuals-character-base { min-height:0; grid-template-rows:minmax(0,1fr); }
.ss-visuals-workspace .ss-chat-visuals-section { grid-template-rows:auto minmax(0,1fr) auto; min-height:0; overflow:hidden; }
.ss-visual-editor-body { min-height:0; min-width:0; display:grid; align-content:start; gap:12px; overflow-y:auto; overflow-x:hidden; scrollbar-width:thin; padding:2px 3px 4px 1px; }
.ss-visuals-workspace .ss-chat-visuals-actions { background:transparent; border-top:1px solid var(--ss-outline); padding:10px 0 2px; }
/* Persona has a directory and one compact editor, not a vacant Character column. */
.ss-visuals-workspace .ss-persona-workspace { grid-template-columns:clamp(240px,25%,340px) minmax(0,1fr); gap:14px; }
.ss-persona-directory { min-width:0; min-height:0; display:grid; grid-template-rows:auto auto minmax(0,1fr); align-content:start; gap:12px; padding:16px; border:1px solid var(--ss-outline); border-radius:var(--ss-control-radius,10px); background:var(--ss-panel-bg); overflow:hidden; }
.ss-persona-directory-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.ss-persona-directory-head h2 { margin:3px 0; font:500 23px/1.2 Georgia,Cambria,serif; color:var(--ss-text); }
.ss-persona-directory-head .ss-icon-button { width:36px; flex:none; }
.ss-persona-create { display:flex; align-items:center; justify-content:center; gap:7px; width:100%; }
.ss-persona-directory .ss-visual-profile-rail { grid-auto-flow:row; grid-auto-columns:minmax(0,1fr); grid-auto-rows:minmax(74px,auto); align-content:start; overflow-y:auto; overflow-x:hidden; min-height:0; padding:2px 3px 5px 2px; scroll-snap-type:y proximity; }
.ss-persona-directory .ss-visual-card { grid-template-columns:52px minmax(0,1fr); min-height:74px; }
.ss-persona-directory .ss-visual-card-art { min-height:74px; }
.ss-persona-directory .ss-visual-card-body strong { white-space:normal; overflow-wrap:anywhere; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.ss-persona-directory .ss-visual-card-description { min-height:0; }
.ss-visuals-workspace .ss-persona-editor { align-self:start; max-height:100%; grid-template-rows:auto minmax(0,1fr) auto; }
.ss-visuals-workspace .ss-persona-editor [data-role="persona-positive"] { min-height:180px; }
@container visuals-workspace (max-width:740px) {
  .ss-visuals-workspace .ss-persona-workspace { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); gap:10px; }
  .ss-persona-directory { grid-template-columns:minmax(0,1fr) auto; grid-template-rows:auto auto; gap:8px; padding:10px; }
  .ss-persona-directory-head { gap:6px; }
  .ss-persona-directory-head h2 { font-size:19px; }
  .ss-persona-directory-head .ss-visual-kicker { display:none; }
  .ss-persona-directory .ss-persona-create { width:auto; align-self:center; padding-inline:8px; }
  .ss-persona-directory .ss-visual-profile-rail { grid-column:1/-1; grid-auto-flow:column; grid-auto-columns:minmax(170px,48%); grid-auto-rows:auto; overflow-x:auto; overflow-y:hidden; scroll-snap-type:x proximity; }
  .ss-visuals-workspace .ss-persona-editor { align-self:stretch; }
  .ss-visuals-workspace .ss-persona-editor [data-role="persona-positive"] { min-height:120px; }
}
@container visuals-workspace (max-width:900px) {
  .ss-visuals-workspace [data-visual-panel="character"] { grid-template-columns:minmax(0,1fr); grid-template-rows:auto minmax(0,1fr); }
  .ss-visuals-character-nav { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; background:var(--ss-canvas-bg); padding:3px 0; }
  [data-character-detail="identity"] .ss-look-editor-section, [data-character-detail="looks"] .ss-visuals-character-base { display:none; }
}
@container visuals-workspace (max-width:600px) {
  .ss-visuals-workspace .ss-chat-visuals-page { padding:12px; gap:10px; }
  .ss-visuals-workspace .ss-chat-visuals-head { flex-wrap:wrap; align-items:center; }
  .ss-visuals-workspace .ss-chat-visuals-head-copy :is(.ss-eyebrow,p) { display:none; }
  .ss-visuals-head-actions { flex:none; gap:5px; }
  .ss-visuals-head-actions .ss-button { padding-inline:8px; }

  .ss-visuals-workspace .ss-chat-visuals-tabs { max-width:none; flex:0 0 100%; order:3; box-sizing:border-box; }
  .ss-visuals-workspace .ss-chat-visuals-section { padding:13px; gap:12px; }
  .ss-visuals-workspace .ss-chat-visuals-grid { grid-template-columns:minmax(0,1fr); }
  .ss-visuals-workspace .ss-chat-visuals-actions .ss-button { flex:1 1 auto; white-space:normal; }
  .ss-visuals-workspace .ss-chat-visuals-row .ss-button { white-space:normal; }
  .ss-visuals-workspace .ss-chat-visuals-section-head strong { font-size:23px; }
  .ss-visual-card-rail { grid-auto-columns:minmax(154px,48%); }
  .ss-visual-card { grid-template-columns:52px minmax(0,1fr); }
  .ss-visual-card-initial { font-size:30px; }
  .ss-visual-card-active { font-size:9px; padding:2px 4px; }
  .ss-visuals-workspace .ss-visual-writing .ss-textarea { min-height:120px; }
  .ss-visuals-workspace .ss-chat-visuals-actions { padding-bottom:6px; }
}

@container lore-atelier (max-width:740px) {
  .ss-visual-lore-shell { gap:10px; padding:12px; }
  .ss-lore-overview { display:grid; gap:10px; }
  .ss-lore-stats { justify-content:flex-start; }
  .ss-visual-lore-workspace { display:flex; flex-direction:column; }
  .ss-lore-library,.ss-lore-editor { flex:1 1 0; }
  .ss-visual-lore-shell[data-detail=false] .ss-lore-editor,.ss-visual-lore-shell[data-detail=true] .ss-lore-library { display:none; }
  .ss-visual-lore-shell[data-detail=true] .ss-lore-stats { display:none; }
  .ss-lore-atelier .ss-lore-back.ss-button { display:flex; margin:10px 12px; }
  .ss-lore-selection,.ss-lore-section { padding:14px; }
  .ss-lore-selection { flex-wrap:wrap; }
  .ss-lore-fields,.ss-lore-override-fields { grid-template-columns:minmax(0,1fr); }
  .ss-lore-prompt-fields .ss-textarea { min-height:116px; }
  .ss-lore-reference { grid-template-columns:minmax(0,1fr); }
  .ss-lore-reference-preview { aspect-ratio:16/9; max-height:200px; }
  .ss-lore-savebar { padding:10px 12px; }
  .ss-lore-save-actions { margin-left:0; width:100%; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ss-lore-save-actions .ss-button { white-space:normal; }
  .ss-lore-atelier :is(.ss-input,.ss-select,.ss-textarea) { font-size:14px; }
}
@media (max-width:720px) {
  .ss-shell:is([data-studio-view='lore'],[data-studio-view='visuals']) :is(.ss-mobile-tabs,.ss-commandbar) { display:none; }
}
  .ss-look-editor-section { border-color: color-mix(in srgb, var(--lumiverse-primary, #a78bfa) 32%, var(--lumiverse-border, transparent)); }
  @media (max-width: 720px) {
    .ss-chat-visuals-grid { grid-template-columns: 1fr; }
    .ss-chat-visuals-row { align-items: stretch; }
    .ss-chat-visuals-actions { justify-content: stretch; }
    .ss-chat-visuals-actions .ss-button { flex: 1 1 100%; }
    .ss-chat-visuals-binding-state { width: 100%; }
  }
  /* Host accent flows through naturally; explicit Studio swatches take priority. */
/* Inline generated-image ownership: retain contain-independent chat surface crops. */
img[data-swarm-studio-slot] { display: block !important; width: 100% !important; height: 100% !important; min-width: 100% !important; min-height: 100% !important; max-width: none !important; max-height: none !important; object-fit: cover !important; object-position: center !important; }
/* Existing inline image rendering (outside Studio modal). */
  figure[data-swarm-studio-image="true"] { position: relative; display: block; cursor: default; isolation: isolate; }
  html[data-swarm-studio-inline-scale="75"] figure[data-swarm-studio-image="true"] {
    width: 75% !important;
    height: auto !important;
    margin-inline: auto !important;
  }
  html[data-swarm-studio-inline-scale="50"] figure[data-swarm-studio-image="true"] {
    width: 50% !important;
    height: auto !important;
    margin-inline: auto !important;
  }
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action],.ss-url-image-action,.ss-inline-image-menu {
    --ss-inline-bg: var(--lumiverse-surface-raised,var(--lumiverse-surface,var(--lumiverse-bg-opaque,#232331)));
    --ss-inline-outline: var(--lumiverse-border,#363744);
    --ss-inline-accent: var(--lumiverse-accent,var(--lumiverse-primary,#c1b0f5));
  }
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action],.ss-url-image-action {
    position: absolute;
    z-index: 2;
    appearance: none;
    padding: 0;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--ss-inline-accent) 45%, var(--ss-inline-outline));
    border-radius: 999px;
    background: var(--ss-inline-bg);
    color: var(--lumiverse-text, #f5f5f7);
    box-shadow: 0 4px 18px rgba(0,0,0,.38);
    backdrop-filter: blur(8px);
    cursor: pointer;
    user-select: none;
  }
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action] {
    top: 8px;
    right: 8px;
    opacity: 0;
    transform: translateY(-3px);
    transition: opacity .14s ease, transform .14s ease, border-color .14s ease;
  }
  .ss-url-image-action { transform:translateX(-100%); transition:opacity .14s ease,border-color .14s ease; }
  .ss-url-image-action svg { width:15px; height:15px; }
  .ss-url-image-action:is(:hover,[aria-expanded='true']) { border-color:var(--ss-inline-accent); }
  .ss-url-image-action:focus-visible { outline:2px solid var(--ss-inline-accent); outline-offset:2px; }
  @media (hover:hover) and (pointer:fine) {
    .ss-url-image-action:not(:is([data-image-hovered],:hover,:focus-visible,[aria-expanded='true'])) {
      opacity:0; pointer-events:none;
    }
  }
  @media (prefers-reduced-motion:reduce) { .ss-url-image-action { transition:none; } }
  @media (hover:none) {
    figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action] { opacity:1; transform:none; }
  }
  figure[data-swarm-studio-image="true"]:hover > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"]:focus-within > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action][aria-expanded='true'],
  figure[data-swarm-studio-image="true"][data-state="generating"] > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"][data-state="queued"] > [data-swarm-studio-inline-action] { opacity: 1; transform: translateY(0); }
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action]:hover { border-color:var(--ss-inline-accent); }
  figure[data-swarm-studio-image="true"][data-state="generating"] > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"][data-state="queued"] > [data-swarm-studio-inline-action] { animation: ss-inline-spin 1s linear infinite; }
  @keyframes ss-inline-spin { to { rotate: 1turn; } }
  .ss-inline-image-menu {
    box-sizing:border-box; position:fixed; z-index:2147483000; display:grid; gap:2px;
    width:min(248px,calc(100vw - 16px)); max-height:calc(100dvh - var(--app-interactive-safe-top,0px) - 16px); overflow:auto;
    overscroll-behavior:contain; padding:6px; border:1px solid var(--ss-inline-outline); border-radius:12px;
    background:var(--ss-inline-bg);
    background:rgb(from var(--ss-inline-bg) r g b / 1);
    color:var(--lumiverse-text,#efedf5); box-shadow:0 16px 42px #000b; font:13px/1.35 Inter,system-ui,sans-serif;
  }
  .ss-inline-menu-title { padding:6px 9px; color:var(--lumiverse-text-muted,#b7afc3); font-size:11px; font-weight:650; }
  .ss-inline-menu-action {
    appearance:none; display:flex; align-items:center; gap:9px; min-width:0; min-height:33px; padding:6px 9px;
    border:0; border-radius:7px; text-align:left; background:transparent; color:inherit; font:inherit; font-weight:550; cursor:pointer;
  }
  .ss-inline-menu-action:is(:hover,:focus-visible) { outline:none; background:var(--lumiverse-surface-hover,color-mix(in srgb,var(--ss-inline-accent) 16%,transparent)); }
  .ss-inline-menu-action:disabled { opacity:.45; cursor:default; }
  .ss-inline-menu-action[data-danger='true'] { color:var(--lumiverse-danger,#f0aeb6); }
  .ss-inline-menu-icon { display:grid; place-items:center; width:16px; height:16px; flex:none; }
  .ss-inline-menu-icon svg { width:100%; height:100%; }
  .ss-inline-menu-icon svg:not([fill]) { fill:none; stroke:currentColor; stroke-width:1.65; stroke-linecap:round; stroke-linejoin:round; }
  .ss-inline-menu-separator { height:1px; margin:3px 5px; background:var(--ss-inline-outline); }
  @media (pointer:coarse) { .ss-inline-menu-action { min-height:40px; } }
/* Quick Create | one Locket / Action Rail / Composer design system (v18). */
  .ss-miniplayer-app-mount { display:contents !important; pointer-events:none; }
  .ss-miniplayer-app-surface { position:fixed; z-index:9978; left:18px; top:18px; width:64px; height:64px; pointer-events:auto; touch-action:manipulation; }
  .ss-miniplayer { --ss-mini-progress:0%; box-sizing:border-box; position:relative; display:flex; align-items:center; width:100%; height:100%; min-width:0; padding:6px; gap:7px; border:1px solid color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 38%,var(--lumiverse-border,#393343)); border-radius:999px; background:var(--lumiverse-fill,#1c1a24); color:var(--lumiverse-text,#efedf5); box-shadow:0 14px 35px #000a; font:11px/1.4 Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-miniplayer * { box-sizing:border-box; }
  .ss-miniplayer[data-state='running'] { border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  /* Satin Locket: use the same restrained fill/accent language as the action rail; no idle halo. */
  .ss-miniplayer[data-collapsed='true'] { display:block; padding:3px; border:2px solid color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 43%,#696476); background:var(--lumiverse-fill,#1c1a24); border-radius:50%; box-shadow:inset 0 1px 0 #ffffff1f,0 4px 12px #0006; overflow:visible; }
  .ss-miniplayer[data-collapsed='true']:hover { border-color:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 65%,#afa4be); }
  /* Only the working state receives a progress halo. The pseudo-element never covers the portrait. */
  .ss-miniplayer[data-collapsed='true'][data-state='running']::before { content:''; position:absolute; z-index:2; inset:-3px; padding:2px; border-radius:50%; pointer-events:none; background:conic-gradient(var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) var(--ss-mini-progress),transparent var(--ss-mini-progress)); -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0); mask-composite:exclude; }
  .ss-miniplayer[data-collapsed='true'][data-state='running'][data-indeterminate='true']::before { background:conic-gradient(var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 0deg 83deg,transparent 83deg 360deg); animation:ss-mini-ring-working 1.5s linear infinite; }
  @keyframes ss-mini-ring-working { to { transform:rotate(1turn); } }
  @media (prefers-reduced-motion:reduce) { .ss-miniplayer[data-collapsed='true'][data-state='running'][data-indeterminate='true']::before { animation:none; } }
  .ss-mini-preview { position:relative; display:grid; place-items:center; flex:0 0 40px; width:40px; height:40px; overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 55%,var(--lumiverse-border,#393343)); border-radius:50%; background:linear-gradient(var(--lumiverse-fill-subtle,transparent),var(--lumiverse-fill-subtle,transparent)),#29252f; color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); cursor:grab; touch-action:none; }
  .ss-miniplayer[data-collapsed='true'] .ss-mini-preview { width:100%; height:100%; border:0; border-radius:50%; box-shadow:none; }
  .ss-mini-preview svg { width:24px; height:24px; }
  .ss-mini-preview img { display:block; width:100%; height:100%; object-fit:cover; object-position:center 24%; }
  .ss-mini-preview img[hidden],.ss-mini-artwork-thumb img[hidden] { display:none; }
  .ss-mini-satellite { display:none; position:absolute; right:-9px; bottom:-5px; z-index:3; width:21px; height:21px; place-items:center; border:2px solid color-mix(in srgb,var(--lumiverse-border,#393343) 75%,#54465b); border-radius:8px; background:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 32%,#ded2e4); color:#2d2141; box-shadow:0 2px 5px #0007; transform:rotate(-10deg); pointer-events:none; }
  .ss-miniplayer[data-collapsed='true'] .ss-mini-satellite { display:grid; }
  .ss-mini-satellite svg { width:11px; height:11px; transform:rotate(10deg); fill:none; stroke:currentColor; }
  .ss-mini-live-dot { position:absolute; bottom:3px; left:3px; width:7px; height:7px; border:2px solid #15121d; border-radius:50%; background:#73e0a1; opacity:0; }
  .ss-miniplayer[data-state='running'] .ss-mini-live-dot { opacity:1; animation:ss-mini-pulse 1.1s ease-in-out infinite; }
  @keyframes ss-mini-pulse { 50% { opacity:.4; transform:scale(.8); } }
  .ss-miniplayer[data-collapsed='true'] :is(.ss-mini-actions,.ss-mini-quick,.ss-mini-rail-pin) { display:none; }
  .ss-mini-rail-pin { position:absolute; z-index:4; top:21px; right:-9px; display:grid; place-items:center; width:19px; height:21px; padding:0; border:1px solid var(--lumiverse-border,#413c4b); border-radius:7px; background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#17131d; color:var(--lumiverse-text-muted,#aaa4b4); box-shadow:0 3px 10px #0009; cursor:pointer; }
  .ss-mini-rail-pin svg { width:11px; height:11px; }
  .ss-mini-rail-pin[aria-pressed='true'] { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-rail-pin:hover,.ss-mini-rail-pin:focus-visible { outline:0; color:var(--lumiverse-text,#efedf5); box-shadow:0 0 0 2px color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 24%,transparent); }
  .ss-mini-copy { display:none; }
  .ss-miniplayer[data-collapsed='false'] { padding:6px; gap:5px; justify-content:center; border-radius:18px; background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#17151d; box-shadow:0 18px 42px #0009,inset 0 1px 0 #ffffff0b; }
  .ss-miniplayer[data-collapsed='false'] .ss-mini-preview { flex:0 0 49px; width:49px; height:49px; }
  /* Desktop rail: portrait ABOVE the actions, matching the approved doctype. */
  .ss-miniplayer[data-rail-layout='vertical'][data-collapsed='false'] { flex-direction:column; align-items:center; justify-content:flex-start; padding:6px; gap:5px; border-radius:14px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-collapsed='false'] .ss-mini-preview { flex:0 0 39px; width:39px; height:39px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-collapsed='false'] .ss-mini-actions { flex-direction:column; align-items:center; gap:4px; width:100%; }
  .ss-miniplayer[data-rail-layout='vertical'][data-collapsed='false'] .ss-mini-button { width:36px; height:34px; flex:0 0 34px; border-radius:8px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-collapsed='false'] .ss-mini-actions-divider { width:28px; height:1px; margin:3px 0; }
  /* Narrow screens keep the entire toolkit accessible in one hand-friendly horizontal row. */
  .ss-miniplayer[data-rail-layout='horizontal'][data-collapsed='false'] { gap:4px; padding:5px; }
  .ss-miniplayer[data-rail-layout='horizontal'][data-collapsed='false'] .ss-mini-preview { flex-basis:36px; width:36px; height:36px; }
  .ss-miniplayer[data-rail-layout='horizontal'][data-collapsed='false'] .ss-mini-actions { gap:3px; }
  .ss-miniplayer[data-rail-layout='horizontal'][data-collapsed='false'] .ss-mini-button { width:31px; height:34px; flex:0 0 31px; }
  .ss-miniplayer[data-rail-layout='horizontal'][data-collapsed='false'] .ss-mini-actions-divider { width:1px; height:25px; margin:0 1px; }
  .ss-mini-actions { display:flex; align-items:center; gap:5px; min-width:0; }
  .ss-mini-actions-divider { flex:none; background:var(--lumiverse-border,#413c4b); }
  .ss-mini-preview-cta[data-active='true'] { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); background:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 15%,var(--lumiverse-fill-subtle,#2c2835)); border-color:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 50%,var(--lumiverse-border,#413c4b)); }
  .ss-mini-button { display:grid; place-items:center; width:38px; height:38px; flex:0 0 38px; padding:0; border:1px solid var(--lumiverse-border,#413c4b); border-radius:10px; background:linear-gradient(var(--lumiverse-fill-subtle,transparent),var(--lumiverse-fill-subtle,transparent)),#262331; color:var(--lumiverse-text,#ebe7f1); cursor:pointer; }
  .ss-mini-compose-cta { background:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); color:var(--lumiverse-accent-contrast,#201526); border-color:transparent; }
  .ss-mini-button:hover,.ss-mini-button:focus-visible { outline:0; border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); box-shadow:0 0 0 2px color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 24%,transparent); }
  .ss-mini-button:disabled { opacity:.35; cursor:not-allowed; }
  .ss-mini-button svg { width:17px; height:17px; flex:none; fill:none; stroke:currentColor; }
  /* The filled Frame Wall sprite has fine 7px cavities on a 457px viewBox.
     A purpose-built stroke icon keeps Open Studio legible at 17px. */
  .ss-mini-studio-cta { color:var(--lumiverse-text,#eeeaf6); }
  .ss-mini-studio-cta svg { width:20px; height:20px; stroke-width:1.9; }
  .ss-mini-studio-cta:hover,.ss-mini-studio-cta:focus-visible { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-button[hidden] { display:none; }
  .ss-mini-quick { position:fixed; z-index:9978; display:grid; grid-template-rows:auto minmax(0,1fr) auto; width:370px; height:520px; min-height:0; min-width:0; overflow:hidden; border:1px solid var(--lumiverse-border,#413c4b); border-radius:14px; background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#16141d; color:var(--lumiverse-text,#efedf5); box-shadow:0 24px 60px #000b,inset 0 1px 0 #ffffff0b; font:11px/1.4 Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-mini-quick[hidden] { display:none !important; }
  .ss-mini-quick * { box-sizing:border-box; }
  .ss-mini-quick-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 13px 11px; border-bottom:1px solid var(--lumiverse-border,#413c4b); background:color-mix(in srgb,var(--lumiverse-fill,#16141d) 94%,black); }
  .ss-mini-quick-head > div:first-of-type { display:grid; gap:4px; min-width:0; flex:1; }
  .ss-mini-quick-grip { display:grid; place-items:center; flex:0 0 14px; color:var(--lumiverse-text-muted,#a6a0b2); opacity:.7; cursor:grab; }
  .ss-mini-quick-grip svg { width:10px; height:17px; }
  .ss-mini-quick-head { cursor:grab; touch-action:none; }
  .ss-mini-quick-head:active { cursor:grabbing; }
  .ss-mini-quick-head button { touch-action:manipulation; }
  .ss-mini-quick-head strong { font-size:14px; }
  .ss-mini-connection { color:var(--lumiverse-text-muted,#aba5b5); font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ss-mini-connection::before { content:'●'; color:#72d6a3; font-size:8px; padding-right:5px; }
  .ss-mini-head-actions { display:flex; gap:5px; }
  .ss-mini-head-actions .ss-mini-button { width:29px; height:29px; flex-basis:29px; }
  .ss-mini-settings-toggle[aria-pressed='true'] { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); border-color:color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 65%,var(--lumiverse-border,#413c4b)); }
  .ss-mini-quick[data-screen='settings'] .ss-mini-quick-body,.ss-mini-quick[data-screen='settings'] .ss-mini-quick-actions { display:none; }
  .ss-mini-settings-screen { display:flex; flex-direction:column; gap:13px; min-height:0; overflow:auto; padding:13px; scrollbar-width:thin; }
  .ss-mini-settings-screen[hidden],.ss-mini-settings-actions[hidden] { display:none !important; }
  .ss-mini-settings-intro { display:flex; align-items:center; gap:10px; padding:10px; border:1px solid color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 24%,var(--lumiverse-border,#413c4b)); border-radius:10px; background:color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 6%,var(--lumiverse-fill,#16141d)); }
  .ss-mini-settings-orbit { display:grid; place-items:center; flex:0 0 32px; height:32px; border-radius:9px; color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); background:color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 14%,transparent); font-size:22px; }
  .ss-mini-settings-intro div { display:grid; gap:4px; min-width:0; }
  .ss-mini-settings-intro strong { font-size:12px; }
  .ss-mini-settings-intro div span,.ss-mini-settings-note { color:var(--lumiverse-text-muted,#a7a0b1); font-size:10px; line-height:1.4; }
  .ss-mini-settings-section { display:grid; gap:10px; padding:12px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:10px; background:color-mix(in srgb,var(--lumiverse-fill,#16141d) 83%,black); }
  .ss-mini-settings-eyebrow { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); font-size:9px; font-weight:800; letter-spacing:.12em; }
  .ss-mini-settings-pair { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
  .ss-mini-settings-field { display:grid; gap:5px; min-width:0; color:var(--lumiverse-text-muted,#a7a0b1); font-size:10px; font-weight:650; }
  .ss-mini-settings-field input,.ss-mini-settings-field select { box-sizing:border-box; width:100%; min-width:0; height:34px; padding:0 9px; color:var(--lumiverse-text,#efedf5); border:1px solid var(--lumiverse-border,#413c4b); border-radius:7px; background:var(--lumiverse-fill-subtle,#282332); outline:0; font:11px/1.4 Inter,ui-sans-serif,system-ui,sans-serif; color-scheme:dark; }
  .ss-mini-settings-field :is(input,select):focus { border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-settings-seed { display:flex; gap:6px; }
  .ss-mini-settings-seed button { display:grid; place-items:center; flex:0 0 34px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:7px; color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); background:var(--lumiverse-fill-subtle,#282332); cursor:pointer; }
  .ss-mini-settings-seed button svg { width:16px; height:16px; fill:none; stroke:currentColor; }
  .ss-mini-settings-note { margin:0 2px; }
  .ss-mini-settings-actions { display:flex; gap:8px; justify-content:space-between; padding:11px 12px; border-top:1px solid var(--lumiverse-border,#413c4b); }
  .ss-mini-settings-actions button { display:flex; align-items:center; justify-content:center; gap:6px; flex:1; min-height:36px; padding:6px 10px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:8px; background:var(--lumiverse-fill-subtle,#292530); color:var(--lumiverse-text,#efedf5); cursor:pointer; font:700 10px Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-mini-settings-actions button:last-child { flex:1.35; color:var(--lumiverse-accent-contrast,#211729); background:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); border-color:transparent; }
  .ss-mini-settings-actions button svg { width:14px; height:14px; fill:none; stroke:currentColor; }
  .ss-mini-quick-body { display:flex; flex-direction:column; gap:11px; min-height:0; min-width:0; overflow:auto; padding:12px; scrollbar-width:thin; }
  .ss-mini-artwork { display:flex; align-items:center; gap:10px; padding:7px; border:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 74%,transparent); border-radius:9px; background:color-mix(in srgb,var(--lumiverse-fill,#1c1a24) 93%,black); }
  .ss-mini-artwork-thumb { flex:0 0 48px; width:48px; height:55px; display:grid; place-items:center; border-radius:7px; background:var(--lumiverse-fill-subtle,#292530); overflow:hidden; }
  .ss-mini-artwork-thumb img { display:block; width:100%; height:100%; object-fit:cover; object-position:center 23%; }
  .ss-mini-artwork-thumb svg { width:25px; height:25px; color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-artwork > div { min-width:0; display:grid; gap:5px; }
  .ss-mini-artwork strong { font-size:11px; }
  .ss-mini-artwork > div > span { color:var(--lumiverse-text-muted,#aba5b5); font-size:10px; }
  .ss-mini-field { display:grid; gap:6px; min-width:0; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--lumiverse-text-muted,#aba5b5); }
  .ss-mini-field > span { display:flex; align-items:center; justify-content:space-between; }
  .ss-mini-editor-button { display:grid; place-items:center; width:24px; height:22px; padding:0; border:0; background:transparent; color:var(--lumiverse-text-muted,#aba5b5); cursor:pointer; }
  .ss-mini-editor-button:hover { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-editor-button svg { width:14px; height:14px; fill:none; stroke:currentColor; }
  .ss-mini-prompt,.ss-mini-negative { display:block; width:100%; min-height:76px; padding:10px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:9px; background:color-mix(in srgb,var(--lumiverse-fill,#1c1a24) 90%,black); color:var(--lumiverse-text,#efedf5); outline:0; resize:vertical; font:11px/1.5 Inter,ui-sans-serif,system-ui,sans-serif; text-transform:none; letter-spacing:normal; }
  .ss-mini-prompt { height:104px; }
  .ss-mini-negative { height:80px; }
  .ss-mini-prompt:focus,.ss-mini-negative:focus { border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); }
  .ss-mini-negative-toggle { display:flex; align-items:center; align-self:flex-start; gap:5px; padding:0; border:0; background:transparent; color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); cursor:pointer; font:600 10px/1.2 Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-mini-negative-toggle svg { width:13px; height:13px; transition:transform .14s; }
  .ss-mini-quick[data-negative-open='false'] .ss-mini-negative-toggle svg { transform:rotate(-90deg); }
  .ss-mini-quick[data-negative-open='false'] .ss-mini-negative-field { display:none; }
  .ss-mini-quick-hint { display:flex; align-items:center; gap:6px; color:var(--lumiverse-text-muted,#aba5b5); font-size:10px; text-transform:none; letter-spacing:normal; }
  .ss-mini-recipe-dot { flex:0 0 6px; width:6px; height:6px; border-radius:50%; background:#6fd49d; }
  .ss-mini-quick-actions { display:grid; grid-template-columns:minmax(0,.86fr) minmax(0,1.6fr); gap:8px; padding:11px 12px; border-top:1px solid var(--lumiverse-border,#413c4b); }
  .ss-mini-append-compose,.ss-mini-generate { min-height:36px; display:flex; justify-content:center; align-items:center; gap:6px; padding:7px; border-radius:9px; font-size:10px; font-weight:750; cursor:pointer; }
  .ss-mini-append-compose { border:1px solid var(--lumiverse-border,#413c4b); background:var(--lumiverse-fill-subtle,#292530); color:var(--lumiverse-text,#efedf5); }
  .ss-mini-generate { border:1px solid var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); background:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); color:var(--lumiverse-accent-contrast,#201526); }
  .ss-mini-append-compose:disabled,.ss-mini-generate:disabled { opacity:.42; cursor:not-allowed; }
  .ss-mini-generate[data-running='true'] { background:#a83244; border-color:#d9526a; color:white; }
  .ss-mini-append-compose svg,.ss-mini-generate svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor; }
  /* Floating Easel: a separate, resizable actual-preview surface. The orb above is unchanged. */
  .ss-mini-easel { position:fixed; container: ss-easel / size; z-index:9979; display:flex; flex-direction:column; width:390px; height:550px; min-width:240px; min-height:270px; box-sizing:border-box; overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 90%,var(--lumiverse-accent,#aba5fa)); border-radius:14px; background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#111116; color:var(--lumiverse-text,#efedf5); box-shadow:0 22px 65px #000b,0 1px 0 #ffffff10 inset; font:11px/1.35 Inter,ui-sans-serif,system-ui,sans-serif; isolation:isolate; }
  .ss-mini-easel[hidden] { display:none !important; }
  .ss-mini-easel * { box-sizing:border-box; }
  .ss-mini-easel-head { display:flex; flex:none; height:47px; align-items:center; gap:9px; padding:7px 8px 7px 13px; border-bottom:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 65%,transparent); background:color-mix(in srgb,var(--lumiverse-fill,#111116) 95%,black); cursor:grab; touch-action:none; }
  .ss-mini-easel-head:active { cursor:grabbing; }
  .ss-mini-easel-accent { flex:none; width:2px; height:22px; border-radius:2px; background:var(--lumiverse-accent,var(--lumiverse-primary,#aaa5fa)); }
  .ss-mini-easel-identity { display:grid; flex:1; gap:3px; min-width:0; }
  .ss-mini-easel-identity strong { font-size:11px; font-weight:750; }
  .ss-mini-easel-identity small { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--lumiverse-text-muted,#a7a0b1); font-size:9px; }
  .ss-mini-easel-head button { flex:0 0 28px; display:flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; line-height:0; border:1px solid transparent; border-radius:7px; color:var(--lumiverse-text-muted,#a7a0b1); background:transparent; cursor:pointer; }
  .ss-mini-easel-head button:hover { color:var(--lumiverse-text,#efedf5); background:var(--lumiverse-fill-subtle,#292530); border-color:var(--lumiverse-border,#413c4b); }
  .ss-mini-easel-head button svg { display:block; width:15px; height:15px; flex:none; }
  .ss-mini-easel-stage { position:relative; flex:1; min-height:0; margin:7px 7px 0; display:grid; place-items:center; grid-template: minmax(0,1fr) / minmax(0,1fr); overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 52%,transparent); border-radius:9px; background:#09080d; }
  .ss-mini-easel-stage img { width:100%; height:100%; object-fit:contain; object-position:center center; min-width:0; min-height:0; display:block; }
  .ss-mini-easel-stage img[hidden], .ss-mini-easel-empty[hidden] { display:none; }
  .ss-mini-easel-empty { display:grid; place-content:center; justify-items:center; gap:12px; color:var(--lumiverse-text-muted,#a7a0b1); font-size:11px; }
  .ss-mini-easel-empty svg { width:44px; height:44px; opacity:.4; }
  .ss-mini-easel-tags { position:absolute; z-index:1; left:10px; right:10px; top:9px; display:flex; justify-content:space-between; gap:8px; pointer-events:none; }
  .ss-mini-easel-tags span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:5px 8px; border:1px solid #ffffff18; border-radius:6px; background:#100e18ca; backdrop-filter:blur(8px); color:#f1ecf8; font-size:9px; font-weight:730; letter-spacing:.04em; }
  .ss-mini-easel[data-state='running'] .ss-mini-easel-tags span:last-child { color:#b5b0ff; }
  .ss-mini-easel-stage-caption { position:absolute; bottom:0; left:0; right:0; padding:18px 11px 10px; background:linear-gradient(transparent,#0b0915c7); color:#e2dce7; font-size:10px; pointer-events:none; }
  .ss-mini-easel-progress { flex:none; height:2px; margin:0 7px; background:transparent; overflow:hidden; }
  .ss-mini-easel-progress > span { display:block; height:100%; width:0; background:var(--lumiverse-accent,var(--lumiverse-primary,#aaa5fa)); transition:width .2s linear; }
  .ss-mini-easel[data-state='running'][data-indeterminate='true'] .ss-mini-easel-progress > span { width:40% !important; animation:ss-mini-easel-loading 1.6s ease-in-out infinite alternate; }
  @keyframes ss-mini-easel-loading { 0% { transform:translateX(-100%); } 100% { transform:translateX(250%); } }
  .ss-mini-easel-footer { display:flex; flex:none; align-items:center; gap:5px; min-height:52px; padding:7px; }
  .ss-mini-easel-status { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding-left:5px; color:var(--lumiverse-text-muted,#a7a0b1); font-size:10px; }
  .ss-mini-easel-footer button { display:flex; align-items:center; justify-content:center; gap:6px; min-width:33px; height:32px; padding:0 9px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:7px; background:var(--lumiverse-fill-subtle,#292530); color:var(--lumiverse-text,#efedf5); cursor:pointer; font-size:10px; font-weight:650; }
  .ss-mini-easel-footer button svg { width:14px; height:14px; fill:none; stroke:currentColor; }
  .ss-mini-easel-footer button:disabled { opacity:.38; cursor:not-allowed; }
  .ss-mini-easel-footer .ss-mini-easel-generate { background:var(--lumiverse-accent,var(--lumiverse-primary,#aaa5fa)); border-color:transparent; color:var(--lumiverse-accent-contrast,#211729); }
  .ss-mini-easel-footer .ss-mini-easel-generate[data-running='true'] { background:#963446; color:white; }
  .ss-mini-easel-resize { position:absolute; z-index:3; bottom:0; right:0; width:17px; height:17px; cursor:nwse-resize; touch-action:none; background:linear-gradient(135deg,transparent 58%,color-mix(in srgb,var(--lumiverse-accent,#aaa5fa) 55%,transparent) 59%,transparent 65%); }
  @media(max-width:720px) { .ss-mini-easel { border-radius:12px; } .ss-mini-easel-footer { min-height:48px; } .ss-mini-easel-status { font-size:9px; } .ss-mini-easel-stage { margin:5px 5px 0; } }
  .ss-mini-easel-compact-status { display:none; }
  .ss-mini-easel-generate:not([data-running='true']) > svg[data-easel-stop], .ss-mini-easel-generate[data-running='true'] > svg:not([data-easel-stop]) { display:none; }
  /* Compactness follows the floating surface itself, including a short docked preview. */
  @container ss-easel (max-width:340px) or (max-height:360px) {
    .ss-mini-easel-head { height:34px; padding:3px 5px 3px 8px; gap:6px; }
    .ss-mini-easel-accent { height:14px; }
    .ss-mini-easel-identity { gap:0; }
    .ss-mini-easel-identity strong { font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ss-mini-easel-identity small { display:none; }
    .ss-mini-easel-head button { flex-basis:26px; width:26px; height:26px; }
    .ss-mini-easel-head button svg { width:13px; height:13px; }
    .ss-mini-easel-stage { margin:4px 4px 0; border-radius:6px; }
    .ss-mini-easel-tags, .ss-mini-easel-stage-caption { display:none; }
    .ss-mini-easel-progress { margin:0 4px; }
    .ss-mini-easel-footer { min-height:36px; padding:3px 12px 3px 7px; gap:3px; }
    .ss-mini-easel-status { display:none; }
    .ss-mini-easel-compact-status { display:block; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--lumiverse-text-muted,#a7a0b1); font-size:10px; }
    .ss-mini-easel-footer button { flex:0 0 28px; min-width:0; width:28px; height:28px; padding:0; border-color:transparent; background:transparent; border-radius:5px; }
    .ss-mini-easel-footer button > span { display:none; }
    .ss-mini-easel-footer button svg { width:14px; height:14px; flex:none; }
    .ss-mini-easel-footer .ss-mini-easel-generate { background:transparent; border-color:transparent; color:var(--ss-accent,var(--lumiverse-accent,var(--lumiverse-primary,#aaa5fa))); }
    .ss-mini-easel-footer .ss-mini-easel-generate[data-running='true'] { background:transparent; color:#dc7182; }
    .ss-mini-easel-footer button:not(:disabled):hover { background:var(--lumiverse-fill-subtle,#292530); }
    .ss-mini-easel :is(.ss-mini-easel-head,.ss-mini-easel-footer) button:focus-visible { outline:2px solid var(--lumiverse-accent,#aaa5fa); outline-offset:-2px; }
    @media (pointer:coarse) {
      .ss-mini-easel-head { height:40px; }
      .ss-mini-easel-head button { flex-basis:36px; width:36px; height:36px; }
      .ss-mini-easel-footer { min-height:44px; }
      .ss-mini-easel-footer button { flex-basis:36px; width:36px; height:36px; }
    }
  }
  @media (prefers-reduced-motion:reduce) { .ss-mini-easel-progress > span { transition:none; } .ss-mini-easel[data-state='running'][data-indeterminate='true'] .ss-mini-easel-progress > span { animation:none; } }
  .ss-mini-context-menu { position:fixed; z-index:2147483000; display:grid; gap:3px; width:min(228px,calc(100vw - 16px)); padding:7px; border:1px solid var(--lumiverse-border,#554b62); border-radius:13px; color:var(--lumiverse-text,#efedf5); background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#211c29; box-shadow:0 17px 46px #000d; pointer-events:auto; font:11px/1.3 Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-mini-context-menu[hidden] { display:none; }
  .ss-mini-context-action { display:flex; align-items:center; gap:9px; min-height:36px; padding:7px 9px; border:0; border-radius:8px; background:transparent; color:inherit; font:600 11px/1.25 Inter,ui-sans-serif,system-ui,sans-serif; text-align:left; cursor:pointer; }
  .ss-mini-context-action:hover,.ss-mini-context-action:focus-visible { outline:0; background:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 15%,transparent); }
  .ss-mini-context-action:disabled { opacity:.35; cursor:not-allowed; }
  .ss-mini-context-action svg { width:15px; height:15px; flex:none; fill:none; stroke:currentColor; }
  .ss-mini-context-separator { height:1px; margin:2px 4px; background:var(--lumiverse-border,#554b62); }
  .ss-mini-strip-menu { width:min(242px,calc(100vw - 16px)); border-color:color-mix(in srgb,var(--lumiverse-accent,#bfa6ef) 28%,var(--lumiverse-border,#554b62)); background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#191622; }
  .ss-mini-strip-menu-title { display:flex; align-items:center; justify-content:space-between; padding:6px 9px 8px; color:var(--lumiverse-text-muted,#a9a3b3); font-size:9px; font-weight:800; letter-spacing:.14em; }
  .ss-mini-strip-menu-title span { color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); font-size:14px; }
  .ss-mini-strip-menu .ss-mini-context-action { min-height:35px; }
  .ss-mini-strip-menu .ss-mini-context-action svg { width:16px; height:16px; }
  @media(max-width:720px) { .ss-mini-rail-pin { top:-9px; right:35px; } .ss-mini-quick { z-index:9980; } }
  @media(max-width:360px) { .ss-mini-quick-body { padding:10px; gap:10px; } .ss-mini-quick-head { padding:11px; } }


/* Cast presentation library: modal gallery, grouped by composition. */
.ss-cast-workspace .cast-open-picker{display:flex;align-items:center;gap:16px;width:100%;text-align:left;padding:15px;background:var(--surface);border:1px solid var(--ss-accent-line);border-radius:13px;color:var(--text)}
.ss-cast-workspace .cast-open-picker:hover{background:var(--ss-accent-soft)}
.ss-cast-workspace .cast-open-picker .grow{min-width:0;display:flex;flex-direction:column;gap:4px}
.ss-cast-workspace .cast-open-picker small,.ss-cast-workspace .cast-open-picker span.grow span{font-size:10px;color:var(--muted)}
.ss-cast-workspace .cast-open-picker strong{font:600 17px/1.3 var(--serif)}
.ss-cast-workspace .cast-open-picker-thumb{width:72px;height:72px;display:grid;place-items:center;overflow:hidden;background:var(--ss-field-bg);border-radius:9px;flex:none}
.ss-cast-workspace .cast-open-picker-thumb .portrait{width:55px;height:65px}
.ss-cast-workspace .cast-preset-count{font-size:10px;color:var(--muted);margin-bottom:12px}
.ss-cast-workspace .cast-preset-group{margin:0 0 23px;min-width:0}
.ss-cast-workspace .cast-preset-group-heading{display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:0 2px 9px;margin-bottom:10px;border-bottom:1px solid var(--line)}
.ss-cast-workspace .cast-preset-group-heading h3{font:600 16px/1.3 var(--serif);margin:0;color:var(--ss-text)}
.ss-cast-workspace .cast-preset-group-heading span{color:var(--muted);font-size:10px}

.ss-cast-workspace .cast-preset-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
.ss-cast-workspace .cast-preset-choice{background:var(--surface);border:1px solid var(--line);color:var(--text);border-radius:11px;padding:10px;text-align:left;min-width:0;display:flex;flex-direction:column;gap:6px;overflow:hidden}
.ss-cast-workspace .cast-preset-choice:hover{border-color:var(--ss-accent-line);background:var(--ss-accent-soft)}
.ss-cast-workspace .cast-preset-choice[aria-pressed=true]{outline:2px solid var(--ss-accent-line);outline-offset:-2px}
.ss-cast-workspace .cast-preset-preview{height:220px;width:100%;background:var(--ss-canvas-bg);color:var(--ss-text);position:relative;overflow:hidden;border:1px solid var(--ss-outline);border-radius:8px;isolation:isolate;display:block}
.ss-cast-workspace .cast-preset-scale{display:block;position:absolute;top:4px;left:50%;width:560px;transform:translateX(-50%) scale(var(--cast-preview-fit,.36));transform-origin:top center;pointer-events:none;color:var(--ss-text)}
.ss-cast-workspace .cast-preset-scale .ss-cast-design{margin:8px auto}
.ss-cast-workspace .cast-preset-title{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%}
.ss-cast-workspace .cast-preset-title strong{font:600 14px/1.3 var(--serif)}
.ss-cast-workspace .cast-preset-choice small{color:var(--muted);font-size:10px;line-height:1.5;min-height:30px}
.ss-cast-workspace .cast-preset-selected{color:var(--ss-accent);font-size:10px}
.ss-cast-workspace .cast-preset-source{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);opacity:.76}
.ss-cast-workspace .cast-preset-empty{display:block;padding:70px 30px;text-align:center;font-size:16px;color:#c7b7ca}
/* Per-member crop controls live inside the existing Studio-themed picker. */
.ss-cast-workspace .cast-picker-crop{display:grid;grid-template-columns:minmax(0,1fr) 128px minmax(150px,1fr);gap:15px;align-items:center;background:var(--ss-panel-hi);color:var(--ss-text);border:1px solid var(--ss-outline);border-radius:12px;padding:14px;margin-bottom:21px}
.ss-cast-workspace .cast-crop-info{min-width:0}
.ss-cast-workspace .cast-crop-kicker{font-size:9px;color:var(--ss-accent);font-weight:750;text-transform:uppercase;letter-spacing:.12em;margin-bottom:5px}
.ss-cast-workspace .cast-crop-info strong{font-size:13px}
.ss-cast-workspace .cast-crop-info p{font-size:10px;color:var(--ss-muted);margin:6px 0 10px;line-height:1.55}
.ss-cast-workspace .cast-crop-toggle{display:flex;align-items:center;gap:7px;font-size:10px;cursor:pointer;color:var(--ss-text)}
.ss-cast-workspace .cast-crop-toggle input{accent-color:var(--ss-accent);width:15px;height:15px}
.ss-cast-workspace .cast-crop-well{position:relative;height:124px;max-width:128px;overflow:hidden;touch-action:none;border:1px solid var(--ss-outline);border-radius:10px;background:var(--ss-canvas-bg);display:flex;align-items:center;justify-content:center;cursor:grab}
.ss-cast-workspace .cast-crop-well[data-enabled=false]{cursor:default}
.ss-cast-workspace .cast-crop-well:active{cursor:grabbing}
.ss-cast-workspace .cast-crop-well img{display:block;width:100%;height:100%;object-fit:cover;object-position:var(--cast-crop-x,50%) var(--cast-crop-y,20%);scale:var(--cast-crop-scale,1);pointer-events:none;user-select:none}
.ss-cast-workspace .cast-crop-well small{position:absolute;bottom:5px;left:4px;right:4px;padding:2px;background:color-mix(in srgb,var(--ss-panel-bg) 85%,transparent);color:var(--ss-text);text-align:center;border-radius:3px;font-size:8px;letter-spacing:.06em;pointer-events:none}
.ss-cast-workspace .cast-crop-sliders{display:flex;flex-direction:column;gap:7px}
.ss-cast-workspace .cast-crop-slider>span{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:var(--ss-text)}
.ss-cast-workspace .cast-crop-slider output{color:var(--ss-muted);font-variant-numeric:tabular-nums}
.ss-cast-workspace .cast-crop-slider input{width:100%;accent-color:var(--ss-accent)}
@media(max-width:660px){.ss-cast-workspace .cast-picker-crop{grid-template-columns:1fr 112px;gap:10px}.ss-cast-workspace .cast-crop-sliders{grid-column:1/-1}.ss-cast-workspace .cast-crop-well{height:108px}}
@container cast-album (max-width:600px){.ss-cast-workspace .cast-preset-grid{grid-template-columns:1fr}.ss-cast-workspace .cast-preset-choice{padding:9px}.ss-cast-workspace .cast-preset-preview{height:200px}}
/* Member view: the wardrobe modal owns the preview; stage side is a single
   member-wide direction, not a separate choice on every expression tile. */
.ss-cast-workspace .cast-gallery-stage{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:13px;border:1px solid var(--ss-outline);border-radius:10px;background:var(--ss-panel-hi);color:var(--ss-text);padding:13px 14px;margin:0 0 15px}
.ss-cast-workspace .cast-gallery-stage-copy{flex:1 1 240px}
.ss-cast-workspace .cast-gallery-stage-copy strong{font-size:12px}
.ss-cast-workspace .cast-gallery-stage-copy p{font-size:11px;line-height:1.5;color:var(--ss-muted);margin:5px 0 0;max-width:500px}
.ss-cast-workspace .cast-gallery-stage .cast-member-side{flex:0 1 240px}
.ss-cast-workspace .cast-member-placement{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding:14px 16px;margin-top:14px;border:1px solid var(--ss-outline);background:var(--ss-panel-hi);border-radius:12px;color:var(--ss-text)}
.ss-cast-workspace .cast-member-placement strong{font-size:12px}
.ss-cast-workspace .cast-member-placement p{font-size:11px;color:var(--ss-muted);margin:4px 0 0;max-width:380px;line-height:1.5}
.ss-cast-workspace .cast-member-side{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;border-radius:8px;background:var(--ss-field-bg);border:1px solid var(--ss-outline);min-width:190px}
.ss-cast-workspace .cast-side-choice{min-width:0;border:0;border-radius:6px;background:transparent;color:var(--ss-muted);padding:7px 10px;font-size:11px;font-weight:650;line-height:1.3;cursor:pointer}
.ss-cast-workspace .cast-side-choice[aria-pressed=true]{color:var(--ss-text);background:var(--ss-accent-soft);box-shadow:inset 0 0 0 1px var(--ss-accent-line)}
.ss-cast-workspace .cast-side-choice:hover{color:var(--ss-text)}
@container cast-album (max-width:420px){.ss-cast-workspace .expression-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}

/* Album presentation library: independent navigation and gallery scroll.
   This edits the portable album, not the personal Member Atelier layer. */
.ss-cast-workspace .dialog.wide[open][data-cast-modal="presentation"]{
 width:min(1180px,calc(var(--app-scaled-viewport-width,100vw) - 28px));
 height:min(850px,calc(var(--app-interactive-viewport-height,100dvh) - 38px));
 display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;
 container:cast-catalogue / inline-size;
}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-header{flex:none;padding:14px 20px;align-items:center}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-header h2{font-size:22px;line-height:1.2;margin:3px 0}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-header p{margin:0;line-height:1.4}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-body{display:grid;grid-template-columns:minmax(210px,250px) minmax(0,1fr);flex:1;min-height:0;padding:0;overflow:hidden}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-footer{flex:none;padding:10px 16px;min-height:52px;box-sizing:border-box}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-footer p{max-width:none;margin:0;overflow-wrap:anywhere}
.ss-cast-workspace .cast-mobile-picker-tabs,.ss-cast-workspace .cast-catalogue-select,.ss-cast-workspace .cast-catalogue-search-toggle{display:none}
.ss-cast-workspace .cast-catalogue-sidebar{min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:12px;box-sizing:border-box;border-right:1px solid var(--ss-outline);background:var(--ss-panel-bg)}
.ss-cast-workspace .cast-catalogue-heading{font:650 10px/1.4 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:var(--ss-muted);padding:5px 6px 8px}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters{display:flex;flex-direction:column;gap:3px;overflow:visible;padding:0;margin:0 0 12px}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters button{display:flex;align-items:center;justify-content:space-between;gap:8px;white-space:normal;text-align:left;border:1px solid transparent;background:transparent;border-radius:7px;min-height:32px;padding:6px 8px;font:500 11px/1.3 system-ui,sans-serif;color:var(--ss-muted)}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters button small{font-size:10px;color:var(--ss-muted);flex:none}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters button:hover{background:var(--ss-button-hover);color:var(--ss-text)}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters button[aria-pressed=true]{background:var(--ss-accent-soft);border-color:var(--ss-accent-line);color:var(--ss-text)}
.ss-cast-workspace .cast-catalogue-search{display:flex;align-items:center;gap:7px;width:100%;min-width:0;box-sizing:border-box;margin:0}
.ss-cast-workspace .cast-catalogue-search>.icon{position:static;transform:none;flex:none;margin:0}
.ss-cast-workspace .cast-catalogue-search input{padding-left:0}
.ss-cast-workspace .cast-catalogue-search input{min-width:0;width:100%;font-size:11px}
.ss-cast-workspace .cast-catalogue-settings{display:grid;gap:10px;border-top:1px solid var(--ss-outline);padding-top:12px;margin-top:12px}
.ss-cast-workspace .cast-catalogue-browse .cast-background-preview{margin:10px 0 0;min-width:0;gap:5px;font-size:11px}
.ss-cast-workspace .cast-catalogue-browse .cast-background-preview select{width:100%;min-width:0;font-size:12px}
.ss-cast-workspace .cast-catalogue-settings .field{min-width:0;margin:0;gap:5px;font-size:11px}
.ss-cast-workspace .cast-catalogue-settings select,.ss-cast-workspace .cast-catalogue-select select{width:100%;min-width:0;font-size:12px}
.ss-cast-workspace .cast-catalogue-settings .cast-gallery-stage{display:grid;gap:7px;padding:0;border:0;margin:0;background:transparent}
.ss-cast-workspace .cast-catalogue-settings .cast-gallery-stage-copy{min-width:0}
.ss-cast-workspace .cast-catalogue-settings .cast-gallery-stage-copy strong{font-size:11px}
.ss-cast-workspace .cast-catalogue-crop-toggle{display:flex;align-items:center;gap:8px;padding:8px 10px;min-height:34px;border:1px solid var(--ss-outline);background:var(--ss-field-bg);border-radius:8px;color:var(--ss-text);font-size:11px;text-align:left}
.ss-cast-workspace .cast-catalogue-crop-toggle span{flex:1}
.ss-cast-workspace .cast-catalogue-crop-toggle .icon:last-child{transition:transform .15s}
.ss-cast-workspace .cast-catalogue-crop-toggle[aria-expanded=true] .icon:last-child{transform:rotate(90deg)}
.ss-cast-workspace .cast-catalogue-crop[data-expanded=false]{display:none}
.ss-cast-workspace .cast-catalogue-crop .cast-picker-crop{grid-template-columns:minmax(0,1fr);padding:10px;gap:10px;margin:0}
.ss-cast-workspace .cast-catalogue-crop .cast-crop-well{width:100%;height:120px}
.ss-cast-workspace .cast-catalogue-crop .cast-crop-sliders{grid-column:auto;min-width:0}
.ss-cast-workspace .cast-picker-looks{min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:0 16px 16px;box-sizing:border-box}
.ss-cast-workspace .cast-catalogue-current{position:sticky;top:0;z-index:4;display:flex;gap:8px;align-items:center;justify-content:space-between;background:var(--surface);border-bottom:1px solid var(--ss-outline);padding:10px 0;margin-bottom:12px}
.ss-cast-workspace .cast-catalogue-current>div{min-width:0;display:flex;flex-direction:column;gap:2px}
.ss-cast-workspace .cast-catalogue-current small,.ss-cast-workspace .cast-catalogue-current span{font-size:10px;color:var(--ss-muted)}
.ss-cast-workspace .cast-catalogue-current strong{font:650 13px/1.25 system-ui,sans-serif;overflow-wrap:anywhere}
.ss-cast-workspace .cast-catalogue-current button{flex:none;font-size:10px;max-width:48%;white-space:normal}
.ss-cast-workspace .cast-catalogue-no-results{padding:18px;color:var(--ss-muted);font-size:12px;text-align:center}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] [hidden]{display:none!important}
@media(max-width:680px){
 .ss-cast-workspace .dialog.wide[open][data-cast-modal="presentation"]{inset:var(--app-interactive-safe-top,0px) 0 0;margin:auto 0 0;width:100%;max-width:100%;height:calc(var(--app-interactive-viewport-height,100dvh) - var(--app-interactive-safe-top,0px));max-height:calc(var(--app-interactive-viewport-height,100dvh) - var(--app-interactive-safe-top,0px));border-radius:17px 17px 0 0}
}
@container cast-catalogue (max-width:680px){
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-header{padding:10px 13px}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-header h2{font-size:19px}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-body{grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(0,1fr)}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-mobile-picker-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:8px 12px;border-bottom:1px solid var(--ss-outline);background:var(--ss-header-bg)}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-mobile-picker-tabs button{min-height:34px;display:flex;align-items:center;justify-content:center;gap:6px;font:600 12px/1.2 system-ui,sans-serif;background:var(--ss-field-bg);color:var(--ss-muted);border:1px solid var(--ss-outline);border-radius:8px}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-mobile-picker-tabs button[aria-pressed=true]{background:var(--ss-accent-soft);color:var(--ss-text);border-color:var(--ss-accent-line)}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-mobile-picker-tabs button span{font-size:10px;color:var(--ss-muted)}
 .ss-cast-workspace .cast-catalogue-sidebar{border:0;border-bottom:1px solid var(--ss-outline);padding:9px 12px;overflow:visible}
 .ss-cast-workspace .cast-catalogue-browse{display:grid;grid-template-columns:minmax(0,1fr) 36px;gap:7px;align-items:center}
 .ss-cast-workspace .cast-catalogue-search-toggle{display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--ss-outline);border-radius:8px;background:var(--ss-field-bg);color:var(--ss-text)}
 .ss-cast-workspace .cast-catalogue-search-toggle[aria-expanded=true]{border-color:var(--ss-accent-line);background:var(--ss-accent-soft)}
 .ss-cast-workspace .cast-catalogue-search{grid-column:1/-1}
 .ss-cast-workspace .cast-catalogue-browse .cast-background-preview{grid-column:1/-1;margin:0;gap:4px}
 .ss-cast-workspace .cast-catalogue-browse .cast-background-preview select{min-height:32px}
 .ss-cast-workspace .cast-catalogue-browse[data-search-open=false] .cast-catalogue-search{display:none}
 .ss-cast-workspace .cast-catalogue-heading,.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-filters{display:none}
 .ss-cast-workspace .cast-catalogue-select{display:block;margin:0;min-width:0}
 .ss-cast-workspace .cast-catalogue-select>span{display:none}
 .ss-cast-workspace .cast-catalogue-select select{min-height:36px}
 .ss-cast-workspace .cast-catalogue-settings{display:none}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .dialog-body{grid-template-rows:auto minmax(0,1fr)}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-catalogue-sidebar{overflow:auto;overscroll-behavior:contain}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-catalogue-browse,.ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-picker-looks{display:none}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-catalogue-settings{display:grid;border:0;margin:0;padding:0}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-catalogue-crop-toggle{display:none}
 .ss-cast-workspace .dialog[data-cast-mobile-view="adjust"] .cast-catalogue-crop{display:block}
 .ss-cast-workspace .cast-picker-looks{padding:0 12px 12px}
 .ss-cast-workspace .cast-catalogue-current{padding:7px 0;margin-bottom:7px}
 .ss-cast-workspace .cast-catalogue-current small{display:none}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading h3{font-size:17px}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading p{font-size:10px}
 .ss-cast-workspace .dialog[data-cast-modal="presentation"] .dialog-footer{padding:8px 12px;min-height:44px}
}

/* Catalogue: gallery first; a quiet caption row, not repeated description cards. */
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-grid{gap:14px;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-choice{padding:0;gap:0;background:var(--ss-panel-hi);border-radius:10px;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-preview{height:245px;border:0;border-bottom:1px solid var(--ss-outline);border-radius:9px 9px 0 0;background-color:var(--ss-canvas-bg);background-image:radial-gradient(var(--ss-outline) .65px,transparent .65px);background-size:14px 14px;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-title{padding:11px 12px;box-sizing:border-box;min-height:44px;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-title strong{font:650 12px/1.35 system-ui,sans-serif;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading h3{font:600 20px/1.2 var(--serif);}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading p{font-size:11px;color:var(--ss-muted);margin:5px 0 0;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading>span{white-space:nowrap;}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-choice[aria-pressed=true]{outline:0;border-color:var(--ss-accent);box-shadow:0 0 0 1px var(--ss-accent);}
.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-choice[aria-pressed=true] .cast-preset-title{background:var(--ss-accent-soft);}
@container cast-catalogue (max-width:680px){.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-grid{grid-template-columns:minmax(0,1fr);gap:12px}.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-preview{height:clamp(172px,55vw,245px)}.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-title{min-height:40px;padding:9px 11px}.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading h3{font-size:17px}.ss-cast-workspace .dialog[data-cast-modal="presentation"] .cast-preset-group-heading p{font-size:10px}}

.ss-cast-workspace .cast-background-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px;margin:12px 0;}
.ss-cast-workspace .cast-background-tile{margin:0;min-width:0;border:1px solid var(--ss-outline);border-radius:10px;overflow:hidden;background:var(--ss-panel-hi);}
.ss-cast-workspace .cast-background-tile img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--ss-canvas-bg);}
.ss-cast-workspace .cast-background-tile figcaption{display:grid;gap:7px;padding:10px;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-background-tile code{color:var(--ss-muted);font-size:11px;}
.ss-cast-workspace .cast-background-tile .row{gap:5px;flex-wrap:wrap;}
.ss-cast-workspace .cast-background-heading{align-items:flex-start;flex-wrap:wrap;}
.ss-cast-workspace .cast-background-heading>div:first-child{flex:1 1 240px;min-width:0;}
.ss-cast-workspace .cast-background-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;}
.ss-cast-workspace .cast-background-default{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px;border:1px solid var(--ss-outline);border-radius:9px;background:var(--ss-panel-hi);}
.ss-cast-workspace .cast-background-default>div{display:grid;gap:4px;min-width:0;flex:1;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-background-default small{color:var(--ss-muted);font-size:10px;}
.ss-cast-workspace .cast-background-default strong{font-size:13px;}
.ss-cast-workspace .cast-background-help{font-size:11px;line-height:1.65;color:var(--ss-muted);margin:12px 0 0;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-background-tile button[aria-pressed=true]{opacity:1;color:var(--ss-accent);border-color:var(--ss-accent-line);background:var(--ss-accent-soft);}
.ss-cast-workspace .dialog[data-cast-modal^="background"][open]{display:flex;flex-direction:column;overflow:hidden;}
.ss-cast-workspace .dialog[data-cast-modal^="background"] .dialog-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;}
.ss-cast-workspace .dialog[data-cast-modal^="background"] :is(.dialog-header,.dialog-footer){flex:none;}
.ss-cast-workspace .dialog[data-cast-modal^="background"][aria-busy=true] .dialog-footer::before{content:"Saving…";color:var(--ss-muted);font-size:11px;}
@media(max-width:600px){
 .ss-cast-workspace .cast-background-toolbar{width:100%;justify-content:stretch;}
 .ss-cast-workspace .cast-background-toolbar .button{flex:1 1 120px;justify-content:center;min-height:40px;}
 .ss-cast-workspace .cast-background-tile .row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;}
 .ss-cast-workspace .cast-background-tile .row .button{min-height:40px;justify-content:center;}
 .ss-cast-workspace .cast-background-default .button{min-height:38px;}
 .ss-cast-workspace .dialog[data-cast-modal="backgrounds"] .dialog-footer .button{margin-left:auto;}
}

/* Alpha.7: host-sized drawer, shared mobile footer, and background activity. */
.ss-studio-drawer-root { display:flex; flex-direction:column; min-height:100%; flex:1 1 auto; box-sizing:border-box; }
.ss-drawer-cards { display:flex; flex-direction:column; flex:1 0 auto; min-height:0; margin:12px; }
.ss-drawer-cards > .ss-launcher { flex:1 0 auto; min-height:0; }
.ss-launcher-center { margin-block:auto; }
.ss-cast-workspace .dialog[data-cast-modal^="background"] { box-sizing:border-box; width:min(890px,calc(var(--app-scaled-viewport-width,100vw) - 24px)); max-width:none; max-height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 24px); }
.ss-cast-workspace .dialog[data-cast-modal^="background"] .dialog-body { flex:1 1 auto; }
.ss-prompt-family-row { display:grid; grid-template-columns:minmax(0,1fr); gap:6px; }
.ss-prompt-family-row .ss-field { min-width:0; }
.ss-prompt-family-row p { margin:0; }
.ss-protocol-actions { display:grid; grid-template-columns:minmax(0,1fr) auto auto; align-items:stretch; }
.ss-protocol-actions .ss-button { min-width:0; white-space:normal; }
.ss-css-guide > summary,.ss-workflow-group > summary,.ss-style-recipe > summary,.ss-cast-workspace .advanced > summary { list-style:none; display:flex; align-items:center; gap:8px; }
.ss-css-guide > summary::-webkit-details-marker,.ss-workflow-group > summary::-webkit-details-marker,.ss-style-recipe > summary::-webkit-details-marker,.ss-cast-workspace .advanced > summary::-webkit-details-marker { display:none; }
.ss-css-guide > summary::marker,.ss-workflow-group > summary::marker,.ss-style-recipe > summary::marker,.ss-cast-workspace .advanced > summary::marker { content:""; }
.ss-css-guide:not(.ss-macro-guide) > summary::after,.ss-workflow-group > summary::after,.ss-style-recipe > summary::after,.ss-cast-workspace .advanced > summary::after { content:""; flex:none; width:7px; height:7px; border-right:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg); margin-left:auto; margin-right:4px; }
.ss-css-guide[open]:not(.ss-macro-guide) > summary::after,.ss-workflow-group[open] > summary::after,.ss-style-recipe[open] > summary::after,.ss-cast-workspace .advanced[open] > summary::after { transform:rotate(225deg); }
.ss-macro-guide > summary svg { margin-left:auto; transition:transform .15s ease; }
.ss-macro-guide[open] > summary svg { transform:rotate(180deg); }
.ss-macro-guide-grid { grid-template-columns:minmax(0,1fr); gap:4px; }
.ss-macro-guide-grid code { overflow-wrap:anywhere; color:var(--ss-accent); }
.ss-macro-guide-grid span { padding-bottom:9px; color:var(--ss-muted); }
.ss-output-stage:has(.ss-background-activity:not([hidden])) { grid-template-rows:auto minmax(0,1fr) auto auto; }
.ss-background-activity { display:flex; min-width:0; align-items:center; gap:9px; padding:7px 9px; border:1px solid var(--ss-accent-line); border-radius:8px; background:var(--ss-panel-hi); }
.ss-background-activity img { width:64px; height:40px; object-fit:cover; border-radius:5px; flex:none; }
.ss-background-activity-icon { color:var(--ss-accent); flex:none; }
.ss-background-activity[data-has-preview="true"] .ss-background-activity-icon { display:none; }
.ss-background-activity-copy { display:grid; gap:3px; min-width:0; flex:1; }
.ss-background-activity-copy strong { font-size:11px; }
.ss-background-activity-copy small { font-size:10px; color:var(--ss-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-background-activity progress { width:100%; height:4px; accent-color:var(--ss-accent); }
.ss-background-activity progress[value] { appearance:none; border:0; border-radius:3px; overflow:hidden; background:var(--ss-outline); }
.ss-background-activity progress[value]::-webkit-progress-bar { background:var(--ss-outline); }
.ss-background-activity progress[value]::-webkit-progress-value { background:var(--ss-accent); border-radius:3px; }
.ss-background-activity progress[value]::-moz-progress-bar { background:var(--ss-accent); border-radius:3px; }
.ss-background-activity[data-state="error"] { border-color:#c17d8a; }
.ss-mini-background-badge { position:absolute; right:3px; bottom:3px; min-width:16px; height:16px; padding:0 3px; border-radius:10px; display:grid; place-items:center; font:700 10px/1 system-ui; color:#16131e; background:var(--lumiverse-accent,#bfa6ef); border:1px solid #19161e; }
.ss-mini-background-badge[hidden] { display:none!important; }
.ss-mini-background-badge[data-state="ready"] { background:#87d8ad; }
.ss-mini-background-badge[data-state="error"] { background:#f2a2ae; }
.ss-miniplayer:has(.ss-mini-background-badge[data-state="generating"]) .ss-mini-preview { outline:1px solid var(--lumiverse-accent,#bfa6ef); }
@media(max-width:720px) {
  .ss-view-nav { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); padding:6px 8px 0; gap:3px; overflow:visible; }
  .ss-shell[data-studio-view='generate'] .ss-view-nav,.ss-shell[data-studio-view='styles'] .ss-view-nav { --ss-tab-surface:var(--ss-panel-bg); }
  .ss-workspace,.ss-styles-workspace { background:var(--ss-panel-bg); }
  .ss-shell .ss-view-nav .ss-button { min-width:0; padding:0 2px; font-size:clamp(9px,2.5vw,12px); }
  .ss-mobile-tabs { border:0; min-height:0; padding:0; background:transparent; }
  .ss-mobile-tabs .ss-mobile-tab { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; height:43px; padding:3px 0; }
  .ss-mobile-tabs .ss-mobile-tab svg { width:15px; height:15px; }
  .ss-shell .ss-mobile-tabs .ss-mobile-tab[data-active="true"]:not(:disabled) { background:var(--ss-accent-soft); border-color:var(--ss-accent-line); color:var(--ss-accent); }
  .ss-commandbar .ss-generate { flex:none; width:100%; }
  .ss-cast-workspace .dialog[data-cast-modal^="background"] { width:calc(var(--app-scaled-viewport-width,100vw) - 16px); max-height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 16px); }
  .ss-output-stage:has(.ss-background-activity:not([hidden])) { height:calc(clamp(235px,41dvh,475px) + 58px); }
  .ss-shell .ss-textarea.ss-protocol-editor { min-height:180px; }
  .ss-protocol-actions { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .ss-protocol-actions .ss-button-primary { grid-column:1/-1; }
}
@media(prefers-reduced-motion:reduce) { .ss-macro-guide > summary svg { transition:none; } }

/* Chat tool surfaces share Studio's Background swatch, not a baked purple underlay. */
.ss-miniplayer,.ss-miniplayer[data-collapsed='true'],.ss-miniplayer[data-collapsed='false'],
.ss-mini-quick,.ss-mini-easel,.ss-mini-context-menu,.ss-mini-strip-menu,.ss-mini-rail-pin {
  background:var(--ss-canvas-bg,var(--lumiverse-bg,#111218));
}
.ss-mini-quick-head,.ss-mini-easel-head {background:var(--ss-header-bg,color-mix(in srgb,var(--ss-canvas-bg,var(--lumiverse-bg,#111218)) 95%,var(--lumiverse-text,#eee)));}
.ss-miniplayer .ss-mini-button:not(.ss-mini-compose-cta):not([data-active='true']),.ss-mini-quick .ss-mini-button,.ss-mini-append-compose {background:var(--ss-button-bg,color-mix(in srgb,var(--ss-canvas-bg,var(--lumiverse-bg,#111218)) 91%,var(--lumiverse-text,#eee)));color:var(--ss-button-ink,var(--lumiverse-text,#eee));}
.ss-mini-artwork,.ss-mini-settings-section {background:var(--ss-panel-bg,color-mix(in srgb,var(--ss-canvas-bg,var(--lumiverse-bg,#111218)) 96%,var(--lumiverse-text,#eee)));}
.ss-mini-prompt,.ss-mini-negative,.ss-mini-settings-field :is(input,select) {background:var(--ss-field-bg,color-mix(in srgb,var(--ss-canvas-bg,var(--lumiverse-bg,#111218)) 94%,var(--lumiverse-text,#eee)));}
.ss-mini-quick[data-surface-mode='flat'] :is(.ss-mini-quick-head,.ss-mini-artwork,.ss-mini-settings-section,.ss-mini-prompt,.ss-mini-negative) {background:var(--ss-canvas-bg,var(--lumiverse-bg,#111218));}
.ss-mini-generate:not([data-running='true']),.ss-mini-compose-cta {color:var(--ss-accent-ink,var(--lumiverse-accent-contrast,#16121d));}
/* Standalone dialogs must not inherit native <dialog> positioning or the host's prose styles. */
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) {
  --ss-chat-canvas:var(--ss-canvas-bg,var(--lumiverse-bg,#111218));
  --ss-chat-ink:var(--lumiverse-text,#f0edf8);
  --ss-chat-muted:var(--lumiverse-text-muted,#a8a8ad);
  --ss-chat-outline:var(--ss-outline,var(--lumiverse-border,#38383e));
  --ss-chat-accent:var(--ss-accent,var(--lumiverse-accent,var(--lumiverse-primary,#aaa5fa)));
  --ss-chat-field:var(--ss-field-bg,color-mix(in srgb,var(--ss-chat-canvas) 94%,var(--ss-chat-ink)));
  --ss-chat-button:var(--ss-button-bg,color-mix(in srgb,var(--ss-chat-canvas) 91%,var(--ss-chat-ink)));
  position:fixed;inset:0;margin:auto;box-sizing:border-box;padding:0;
  width:min(980px,calc(var(--app-scaled-viewport-width,100vw) - 20px));max-width:none;
  max-height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 20px);
  border:1px solid var(--ss-chat-outline);border-radius:var(--ss-panel-radius,15px);background:var(--ss-chat-canvas);color:var(--ss-chat-ink);
  font:13px/1.45 Inter,system-ui,sans-serif;text-align:left;text-align-last:auto;overflow:hidden;box-shadow:0 20px 70px #0008;
}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics)::backdrop {background:#0007;backdrop-filter:blur(3px);}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) *, :is(.ss-card-editor,.ss-inline-prompt-diagnostics) *::before, :is(.ss-card-editor,.ss-inline-prompt-diagnostics) *::after {box-sizing:border-box;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) [hidden] {display:none!important;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) :is(button,select,input,textarea) {font:inherit;color:inherit;min-width:0;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) button {display:inline-flex;gap:6px;align-items:center;justify-content:center;min-height:36px;padding:7px 11px;background:var(--ss-chat-button);color:var(--ss-button-ink,var(--ss-chat-ink));border:1px solid var(--ss-chat-outline);border-radius:var(--ss-control-radius,8px);cursor:pointer;white-space:nowrap;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) button:disabled {opacity:.45;cursor:not-allowed;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) :is(button,select,input,textarea):focus-visible {outline:2px solid var(--ss-chat-accent);outline-offset:2px;}
:is(.ss-card-editor,.ss-inline-prompt-diagnostics) button svg {width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;}
.ss-card-editor[open] {display:grid;grid-template-rows:auto auto minmax(100px,1fr) auto auto;}
.ss-card-editor-head,.ss-diagnostic-heading {display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid var(--ss-chat-outline);}
.ss-card-editor-head small {display:block;font-size:10px;letter-spacing:.15em;color:var(--ss-chat-muted);}
.ss-card-editor-head strong {display:block;font-size:16px;font-weight:650;}
.ss-card-editor-head>button,.ss-diagnostic-heading>button {min-width:36px;font-size:18px;}
.ss-card-editor-tools {display:flex;gap:6px;flex-wrap:wrap;padding:9px 12px;border-bottom:1px solid var(--ss-chat-outline);}
.ss-card-editor-tools button[aria-pressed='true'] {background:color-mix(in srgb,var(--ss-chat-canvas) 85%,var(--ss-chat-accent));border-color:var(--ss-chat-accent);color:var(--ss-chat-ink);}
.ss-card-editor-shared {margin-left:auto;}
.ss-card-editor-viewport {min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;background:radial-gradient(circle,color-mix(in srgb,var(--ss-chat-muted) 27%,transparent) 1px,transparent 1px) 0 0/18px 18px,var(--ss-chat-canvas);padding:14px;}
.ss-card-editor-stage {position:relative;width:100%;margin:auto;isolation:isolate;}
.ss-card-editor-render {width:100%;}
.ss-card-selection {position:absolute;border:1.5px solid var(--ss-chat-accent);box-shadow:0 0 0 1px #0009;z-index:5;cursor:move;touch-action:none;}
.ss-card-selection[data-selection='card'] {pointer-events:none;border-style:dashed;}
.ss-card-selection::before,.ss-card-selection::after {content:'';position:absolute;top:-4px;width:7px;height:7px;background:var(--ss-chat-accent);border:1px solid var(--ss-chat-canvas);pointer-events:none;}
.ss-card-selection::before {left:-4px;}.ss-card-selection::after {right:-4px;}
.ss-card-editor .ss-card-selection-handle {position:absolute;right:-9px;bottom:-9px;width:20px;height:20px;min-height:0;padding:0;border-radius:4px;background:var(--ss-chat-accent);border:2px solid var(--ss-chat-canvas);cursor:nwse-resize;pointer-events:auto;touch-action:none;}
.ss-card-selection[data-anchor="right"] .ss-card-selection-handle {right:auto;left:-9px;cursor:nesw-resize;}
.ss-card-editor-controls {border-top:1px solid var(--ss-chat-outline);padding:10px 16px;max-height:min(30dvh,260px);overflow:auto;overscroll-behavior:contain;}
.ss-card-editor-fields {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px;align-items:center;}
.ss-card-editor-fields>label {display:grid;gap:4px;min-width:0;font-size:11px;color:var(--ss-chat-muted);}
.ss-card-editor-fields>label select {width:100%;height:35px;border:1px solid var(--ss-chat-outline);border-radius:var(--ss-control-radius,8px);background:var(--ss-chat-field);color:var(--ss-chat-ink);padding:4px 8px;}
.ss-card-slider-label {display:flex;justify-content:space-between;gap:8px;}.ss-card-slider-label output{color:var(--ss-chat-ink);font-variant-numeric:tabular-nums;}
.ss-card-editor-fields input[type='range'] {width:100%;height:24px;accent-color:var(--ss-chat-accent);margin:0;}
.ss-card-editor-fields .ss-card-editor-crop-toggle {display:flex;align-items:center;gap:7px;grid-column:1/-1;}
.ss-card-editor-crop-toggle input {accent-color:var(--ss-chat-accent);}
.ss-card-editor-crop-note {grid-column:1/-1;font-size:11px;color:var(--ss-chat-muted);margin:0;}
.ss-card-editor-crop-fields {grid-column:1/-1;border-top:1px solid var(--ss-chat-outline);padding-top:10px;}
.ss-card-editor-footer,.ss-inline-prompt-diagnostics>footer {display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 16px;border-top:1px solid var(--ss-chat-outline);}
.ss-card-editor-footer p {flex:1;margin:0;color:var(--ss-chat-muted);font-size:11px;overflow-wrap:anywhere;}
.ss-card-editor .ss-card-editor-save {background:var(--ss-chat-accent);border-color:var(--ss-chat-accent);color:var(--ss-accent-ink,var(--lumiverse-accent-contrast,#16121d));}
.ss-inline-prompt-diagnostics {width:min(680px,calc(var(--app-scaled-viewport-width,100vw) - 20px));}
.ss-inline-prompt-diagnostics[open] {display:grid;grid-template-rows:auto minmax(0,1fr) auto;}
.ss-diagnostic-heading h2 {font-size:16px;margin:0;font-weight:650;}
.ss-diagnostic-body {min-height:0;overflow:auto;padding:14px 16px;overscroll-behavior:contain;}
.ss-diagnostic-body p {margin:3px 0;overflow-wrap:anywhere;}
.ss-diagnostic-body textarea {background:var(--ss-chat-field)!important;border-color:var(--ss-chat-outline)!important;min-height:105px;}
.ss-diagnostic-body h3 {font-size:13px;}
@media(max-width:720px),(pointer:coarse) {
  .ss-card-editor-viewport {padding:9px;}
  .ss-card-editor-head,.ss-card-editor-controls,.ss-card-editor-footer {padding:9px 10px;}
  .ss-card-editor-tools {padding:7px 8px;gap:4px;}
  .ss-card-editor-tools button {font-size:11px;min-height:34px;padding:6px 8px;}
  .ss-card-editor-tools button svg {width:14px;height:14px;}
  .ss-card-editor-fields {gap:7px 12px;}
  .ss-card-editor-controls {max-height:min(32dvh,245px);}
  .ss-card-editor-footer {flex-wrap:wrap;}
  .ss-card-editor-footer p {flex-basis:100%;}
  .ss-card-editor-footer button {flex:1;}
  .ss-card-editor .ss-card-selection-handle {width:25px;height:25px;right:-12px;bottom:-12px;}
}

/* Member Atelier: one permanent canvas, one contextual drawer, two scopes. */
.ss-member-atelier[open] {display:grid;grid-template-rows:auto minmax(0,1fr) auto;width:min(1220px,calc(var(--app-scaled-viewport-width,100vw) - 20px));height:min(760px,calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 20px));}
.ss-atelier-body {display:grid;grid-template-columns:66px minmax(230px,272px) minmax(0,1fr);min-height:0;min-width:0;overflow:hidden;}
.ss-atelier-rail {display:flex;flex-direction:column;gap:12px;min-height:0;padding:12px 7px;background:color-mix(in srgb,var(--ss-chat-canvas) 94%,var(--ss-chat-ink));border-right:1px solid var(--ss-chat-outline);overflow:auto;}
.ss-atelier-tool-group {display:flex;flex-direction:column;gap:6px;align-items:stretch;}
.ss-atelier-tool-group+ .ss-atelier-tool-group {border-top:1px solid var(--ss-chat-outline);padding-top:12px;}
.ss-atelier-tool-group small {font-size:9px;letter-spacing:.045em;text-align:center;color:var(--ss-chat-muted);white-space:nowrap;}
.ss-member-atelier .ss-atelier-rail button {width:100%;min-height:42px;padding:7px;background:transparent;}
.ss-member-atelier .ss-atelier-rail button svg {width:20px;height:20px;}
.ss-member-atelier .ss-atelier-open-member {margin-top:auto;}
.ss-member-atelier button[aria-pressed='true'] {border-color:var(--ss-chat-accent);background:color-mix(in srgb,var(--ss-chat-canvas) 84%,var(--ss-chat-accent));color:var(--ss-chat-ink);}
.ss-atelier-drawer {display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--ss-chat-outline);background:color-mix(in srgb,var(--ss-chat-canvas) 97%,var(--ss-chat-ink));}
.ss-atelier-drawer-head {padding:14px 12px 10px;border-bottom:1px solid var(--ss-chat-outline);}
.ss-atelier-drawer-head strong {font-size:14px;}.ss-atelier-drawer-head p,.ss-atelier-fields>p {font-size:11px;color:var(--ss-chat-muted);margin:4px 0 0;}
.ss-member-atelier .ss-atelier-controls {padding:12px;max-height:none;min-height:0;flex:1;border-top:0;overflow:auto;}
.ss-member-atelier .ss-atelier-fields {display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start;}
.ss-atelier-fields>select,.ss-atelier-fields>input[type='search'] {height:36px;width:100%;padding:6px 8px;background:var(--ss-chat-field);border:1px solid var(--ss-chat-outline);border-radius:var(--ss-control-radius,8px);}
.ss-atelier-look-grid {display:grid;grid-template-columns:minmax(0,1fr);gap:8px;}
.ss-member-atelier .ss-atelier-look {display:grid;grid-template-columns:minmax(0,1fr);gap:6px;text-align:left;justify-items:stretch;white-space:normal;overflow:hidden;padding:6px;font-size:11px;}
.ss-atelier-look-preview {display:flex;align-items:center;justify-content:center;height:104px;overflow:hidden;background:var(--ss-chat-canvas);border:1px solid var(--ss-chat-outline);border-radius:6px;pointer-events:none;}
.ss-atelier-look-render {display:block;width:540px;flex:none;zoom:.38;pointer-events:none;}
.ss-atelier-side {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;}.ss-member-atelier .ss-atelier-side button {padding:6px 3px;font-size:11px;}
.ss-atelier-expression-grid {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.ss-member-atelier .ss-atelier-expression {display:grid;grid-template-columns:minmax(0,1fr);padding:6px;gap:5px;white-space:normal;overflow:hidden;font-size:10px;}
.ss-atelier-expression img {width:100%;height:92px;object-fit:contain;object-position:center top;background:var(--ss-chat-canvas);border-radius:5px;}
.ss-member-atelier .ss-atelier-viewport {display:flex;flex-direction:column;min-height:0;min-width:0;padding:16px;overflow:auto;}
.ss-member-atelier .ss-card-editor-stage {flex:none;margin:auto;max-width:none;}
.ss-member-atelier .ss-card-editor-render {max-width:none;}
@media(max-width:720px),(pointer:coarse) {
  .ss-member-atelier[open] {height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 20px);}
  .ss-atelier-body {grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(90px,1fr) auto minmax(100px, min(36dvh,300px));}
  .ss-member-atelier .ss-atelier-viewport {grid-row:1;padding:10px;}
  .ss-atelier-rail {grid-row:2;flex-direction:row;align-items:stretch;gap:5px;padding:5px 7px;border-right:0;border-top:1px solid var(--ss-chat-outline);border-bottom:1px solid var(--ss-chat-outline);overflow-x:auto;}
  .ss-atelier-tool-group {flex-direction:row;align-items:center;gap:4px;position:relative;padding-top:13px;}
  .ss-atelier-tool-group small {position:absolute;top:0;left:3px;font-size:9px;}
  .ss-atelier-tool-group+ .ss-atelier-tool-group {border-top:0;border-left:1px solid var(--ss-chat-outline);padding:13px 0 0 6px;}
  .ss-member-atelier .ss-atelier-rail button {width:35px;min-height:34px;padding:5px;}
  .ss-member-atelier .ss-atelier-rail button svg {width:17px;height:17px;}
  .ss-member-atelier .ss-atelier-open-member {margin-top:auto;margin-left:auto;}
  .ss-atelier-drawer {grid-row:3;border-right:0;}
  .ss-atelier-drawer-head {padding:7px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;}
  .ss-atelier-drawer-head strong {font-size:12px;}.ss-atelier-drawer-head p {font-size:10px;text-align:right;margin:0;}
  .ss-member-atelier .ss-atelier-controls {padding:8px 10px;}
  .ss-atelier-look-grid {grid-template-columns:repeat(2,minmax(0,1fr));}
  .ss-atelier-look-preview {height:74px;}.ss-atelier-look-render {zoom:.24;}
  .ss-atelier-expression-grid {grid-template-columns:repeat(3,minmax(0,1fr));}
  .ss-atelier-expression img {height:76px;}
}


/* Genesis is a Cast-local automation desk, not a new workspace. */
.ss-cast-workspace .head-actions{flex-wrap:wrap;justify-content:flex-end;}
.ss-cast-workspace [data-genesis-count]{font-size:10px;background:var(--ss-accent-soft);color:var(--ss-accent);padding:2px 5px;border-radius:7px;}
.ss-cast-workspace .dialog[data-cast-modal="genesis"][open]{display:flex;flex-direction:column;overflow:hidden;}
.ss-cast-workspace .dialog[data-cast-modal="genesis"] .dialog-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;}
.ss-cast-workspace .dialog[data-cast-modal="genesis"] :is(.dialog-header,.dialog-footer){flex:none;}
.ss-cast-workspace .cast-genesis-form{display:grid;gap:17px;}
.ss-cast-workspace .cast-genesis-hero{display:flex;align-items:center;gap:13px;padding:14px;border:1px solid var(--ss-accent-line);background:var(--ss-accent-soft);border-radius:12px;}
.ss-cast-workspace .cast-genesis-emblem,.ss-cast-workspace .cast-genesis-job-mark{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--ss-accent-line);color:var(--ss-accent);background:var(--ss-panel-hi);border-radius:12px;flex:none;}
.ss-cast-workspace .cast-genesis-emblem .icon{width:26px;height:26px;}
.ss-cast-workspace .cast-genesis-hero h3{font:500 21px/1.1 var(--serif);margin-bottom:5px;}
.ss-cast-workspace .cast-genesis-hero p,.ss-cast-workspace .cast-genesis-note p{font-size:11px;color:var(--ss-muted);line-height:1.55;}
.ss-cast-workspace .cast-genesis-toggle{flex:none;cursor:pointer;}
.ss-cast-workspace .cast-genesis-settings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.ss-cast-workspace .cast-genesis-settings>section{display:grid;gap:10px;align-content:start;padding:13px;border:1px solid var(--ss-outline);border-radius:10px;background:var(--ss-panel-hi);min-width:0;}
.ss-cast-workspace .cast-genesis-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.ss-cast-workspace .cast-genesis-choice{position:relative;display:grid;align-content:start;gap:7px;padding:10px;border:1px solid var(--ss-outline);background:var(--ss-canvas-bg);border-radius:8px;cursor:pointer;min-width:0;}
.ss-cast-workspace .cast-genesis-choice:has(input:checked){border-color:var(--ss-accent);background:var(--ss-accent-soft);}
.ss-cast-workspace .cast-genesis-choice:focus-within{outline:2px solid var(--ss-accent);outline-offset:2px;}
.ss-cast-workspace .cast-genesis-choice input{position:absolute;right:8px;top:9px;accent-color:var(--ss-accent);width:12px;height:12px;}
.ss-cast-workspace .cast-genesis-choice>span{display:flex;align-items:center;gap:5px;padding-right:12px;font-size:10px;}
.ss-cast-workspace .cast-genesis-choice .icon{width:14px;height:14px;color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-choice b{font:500 28px/1 var(--serif);color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-choice small{font-size:10px;color:var(--ss-muted);line-height:1.3;}
.ss-cast-workspace .cast-genesis-note code{white-space:normal;overflow-wrap:anywhere;color:var(--ss-accent);font-size:10px;padding:9px;border:1px solid var(--ss-outline);border-radius:6px;background:var(--ss-canvas-bg);}
.ss-cast-workspace .cast-genesis-activity{display:grid;gap:9px;margin-top:18px;}
.ss-cast-workspace [data-genesis-jobs]{display:grid;gap:8px;}
.ss-cast-workspace .cast-genesis-empty{padding:16px;display:flex;gap:12px;align-items:center;border:1px dashed var(--ss-outline);border-radius:10px;color:var(--ss-muted);}
.ss-cast-workspace .cast-genesis-empty .icon{width:26px;height:26px;color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-empty p{font-size:11px;margin-top:5px;}
.ss-cast-workspace .cast-genesis-job{border:1px solid var(--ss-outline);border-radius:10px;background:var(--ss-panel-hi);padding:11px;display:grid;gap:8px;min-width:0;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-genesis-job-head{display:flex;gap:10px;align-items:center;}
.ss-cast-workspace .cast-genesis-job-head small{display:block;font-size:10px;color:var(--ss-muted);margin-top:4px;}
.ss-cast-workspace .cast-genesis-job-count{font:500 17px var(--serif);color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-job progress{width:100%;height:5px;accent-color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-job-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;}
.ss-cast-workspace .cast-genesis-review textarea{width:100%;resize:vertical;}
.ss-cast-workspace .cast-member-genesis{display:grid;gap:10px;padding:13px;margin:0 0 12px;border:1px solid var(--ss-accent-line);border-radius:12px;background:var(--ss-panel-hi);}
.ss-cast-workspace .cast-member-genesis-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;}
.ss-cast-workspace .cast-member-genesis-head .grow{min-width:100px;}
.ss-cast-workspace .cast-member-genesis-head strong{display:block;margin-top:4px;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-member-genesis-head small{display:block;color:var(--ss-muted);font-size:10px;margin-top:3px;}
.ss-cast-workspace .cast-member-genesis progress,.ss-cast-workspace .cast-genesis-placeholder progress{width:100%;height:5px;accent-color:var(--ss-accent);}
.ss-cast-workspace .cast-genesis-slot{border-style:dashed;}
.ss-cast-workspace .cast-genesis-slot[data-slot-state="active"]{border-style:solid;border-color:var(--ss-accent);background:var(--ss-accent-soft);}
.ss-cast-workspace .cast-genesis-slot[data-slot-state="error"]{border-color:var(--ss-danger,#ef929a);}
.ss-cast-workspace .cast-genesis-placeholder{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:7px;padding:10px;text-align:center;background:var(--ss-canvas-bg);color:var(--ss-muted);}
.ss-cast-workspace .cast-genesis-slot-icon{display:grid;place-items:center;width:34px;height:34px;border:1px solid var(--ss-outline);border-radius:10px;color:var(--ss-muted);}
.ss-cast-workspace .cast-genesis-slot[data-slot-state="active"] .cast-genesis-slot-icon{color:var(--ss-accent);border-color:var(--ss-accent-line);}
.ss-cast-workspace .cast-genesis-slot-stage{font-size:11px;line-height:1.3;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-genesis-placeholder small{font-size:10px;font-variant-numeric:tabular-nums;}
.ss-cast-workspace .cast-genesis-ready-mark{margin-left:auto;color:var(--ss-accent);display:inline-flex;}
.ss-cast-workspace .cast-genesis-ready-mark .icon{width:13px;height:13px;}
@media(max-width:600px){.ss-cast-workspace .cast-member-genesis-head .cast-genesis-job-actions{flex-basis:100%;}.ss-cast-workspace .cast-member-genesis{padding:10px;}}

@media(max-width:600px){
 .ss-cast-workspace .head-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;}
 .ss-cast-workspace .head-actions .button{justify-content:center;min-width:0;}
 .ss-cast-workspace .cast-genesis-settings{grid-template-columns:minmax(0,1fr);gap:9px;}
 .ss-cast-workspace .cast-genesis-hero{gap:9px;padding:10px;}
 .ss-cast-workspace .cast-genesis-emblem{width:34px;height:34px;}
 .ss-cast-workspace .cast-genesis-hero h3{font-size:18px;}
 .ss-cast-workspace .cast-genesis-job-actions .button{flex:1 1 auto;min-height:34px;}
}

/* Keep the modal chrome fixed; only the recipe's content scrolls. */
.ss-cast-workspace .dialog[data-cast-modal="recipe"][open]{display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;width:min(940px,calc(var(--app-scaled-viewport-width,100vw) - 24px));max-width:none;max-height:calc(var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh)) - 24px);}
.ss-cast-workspace .dialog[data-cast-modal="recipe"] .dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;container-type:inline-size;container-name:cast-recipe;}
.ss-cast-workspace .dialog[data-cast-modal="recipe"] :is(.dialog-header,.dialog-footer){flex:none;}
.ss-cast-workspace .cast-recipe-form input[type=checkbox]:not(.cast-genesis-toggle input){width:15px;height:15px;min-height:15px;flex:none;padding:0;margin:0;accent-color:var(--ss-accent);}
.ss-cast-workspace .cast-recipe-grid>section>label:has(input[type=checkbox]){display:flex;align-items:center;gap:8px;font-size:12px;}
.ss-cast-workspace .cast-recipe-trigger{display:flex;align-items:center;gap:7px;}
@container cast-recipe (max-width:630px){.ss-cast-workspace .cast-recipe-grid{grid-template-columns:minmax(0,1fr);}}
.ss-cast-workspace .cast-recipe-form{display:grid;gap:14px;min-width:0;}
.ss-cast-workspace .cast-recipe-capture{display:flex;gap:12px;align-items:center;flex-wrap:wrap;}
.ss-cast-workspace .cast-recipe-capture .hint{flex:1 1 220px;margin:0;}
.ss-cast-workspace .cast-recipe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start;}
.ss-cast-workspace .cast-recipe-grid>section{padding:14px;border:1px solid var(--ss-outline);border-radius:12px;min-width:0;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-recipe-grid textarea{resize:vertical;min-height:76px;width:100%;}
.ss-cast-workspace .cast-recipe-numbers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.ss-cast-workspace .cast-recipe-canvas{display:grid;gap:10px;padding:10px;border:1px solid var(--ss-outline);border-radius:10px;min-width:0;}
.ss-cast-workspace .cast-recipe-canvas-head,.ss-cast-workspace .cast-recipe-canvas-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.ss-cast-workspace .cast-recipe-canvas-head output{font-size:11px;color:var(--ss-muted);font-variant-numeric:tabular-nums;}
.ss-cast-workspace .cast-recipe-ratios{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;}
.ss-cast-workspace .cast-recipe-ratios>.button{min-width:0;min-height:48px;display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;padding:5px;font-size:11px;}
.ss-cast-workspace .cast-recipe-ratio-shape{display:block;border:1.5px solid currentColor;border-radius:2px;}
.ss-cast-workspace .cast-recipe-canvas button[aria-pressed=true]{border-color:var(--ss-accent);background:var(--ss-accent-soft);color:var(--ss-accent);}
.ss-cast-workspace .cast-recipe-canvas-axes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;}
.ss-cast-workspace .cast-recipe-axis{display:grid;min-width:0;gap:4px;}
.ss-cast-workspace .cast-recipe-axis input[type=range]{min-height:28px;padding:0;border:none;background:transparent;accent-color:var(--ss-accent);cursor:ew-resize;}
.ss-cast-workspace .cast-recipe-canvas-actions .button{min-width:0;}
.ss-cast-workspace .cast-recipe-stack{display:grid;gap:7px;max-height:280px;overflow:auto;}
.ss-cast-workspace .cast-recipe-lora{display:grid;grid-template-columns:minmax(0,1fr) 78px;gap:6px;padding:9px;border:1px solid var(--ss-outline);border-radius:8px;align-items:center;}
.ss-cast-workspace .cast-recipe-lora>label:first-child{display:flex;gap:6px;align-items:center;min-width:0;overflow-wrap:anywhere;}
.ss-cast-workspace .cast-recipe-lora input[type=number]{min-width:0;width:100%;}
.ss-cast-workspace .cast-recipe-trigger{grid-column:1/-1;color:var(--ss-muted);font-size:11px;}
.ss-cast-workspace .cast-recipe-form [hidden]{display:none!important;}
.ss-cast-workspace .cast-recipe-form [data-recipe-bg]:not([hidden]){display:grid;gap:8px;}
@media(max-width:720px){.ss-cast-workspace .cast-recipe-grid{grid-template-columns:minmax(0,1fr);}.ss-cast-workspace .cast-recipe-grid>section{padding:10px;}.ss-cast-workspace .cast-recipe-capture>.button{width:100%;}}


/* Image Atelier: one document, native-pixel canvas, responsive tool rail. */
.ss-edit-workspace { flex:1 1 0; min-width:0; min-height:0; display:flex; flex-direction:column; overflow:hidden; container-type:inline-size; container-name:edit-atelier; background:var(--ss-canvas-bg); }
.ss-edit-header,.ss-edit-footer { display:flex; align-items:center; gap:12px; padding:13px 16px; flex:none; background:var(--ss-header-bg); }
.ss-edit-header { border-bottom:1px solid var(--ss-outline); }
.ss-edit-footer { border-top:1px solid var(--ss-outline); }
.ss-edit-mark { width:38px; height:38px; flex:none; border:1px solid var(--ss-accent-line); color:var(--ss-accent); background:var(--ss-accent-soft); border-radius:10px; display:grid; place-items:center; }
.ss-edit-mark svg { width:20px; height:20px; }
.ss-edit-heading,.ss-edit-foot-text { min-width:0; flex:1; display:grid; gap:3px; }
.ss-edit-heading strong { font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ss-edit-heading small,.ss-edit-foot-text small { font-size:10px; color:var(--ss-muted); }
.ss-edit-header-actions,.ss-edit-footer-actions { display:flex; align-items:center; gap:6px; flex:none; }
.ss-edit-workspace :is(.ss-button,.ss-icon-button) { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:34px; }
.ss-edit-workspace :is(.ss-button,.ss-icon-button) svg { width:16px; height:16px; flex:none; }
.ss-edit-body { flex:1 1 0; min-height:0; min-width:0; display:grid; grid-template-columns:54px minmax(0,1fr) 268px; overflow:hidden; }
.ss-edit-rail { background:var(--ss-header-bg); border-right:1px solid var(--ss-outline); display:flex; flex-direction:column; align-items:center; gap:6px; padding:9px 5px; overflow:auto; }
.ss-edit-rail .ss-icon-button { width:39px; height:39px; flex:none; }
.ss-edit-workspace button[data-tool][aria-pressed="true"] { color:var(--ss-accent); background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-edit-separator { height:1px; width:75%; background:var(--ss-outline); margin:4px 0; flex:none; }
.ss-edit-center { display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.ss-edit-viewport { flex:1 1 0; min-height:0; min-width:0; overflow:auto; display:flex; align-items:safe center; justify-content:safe center; padding:14px; background:radial-gradient(circle,color-mix(in srgb,var(--ss-muted) 30%,transparent) .65px,transparent 1px) 0 0/14px 14px,var(--ss-canvas-bg); }
.ss-edit-surface { position:relative; flex:none; box-shadow:0 8px 30px #0005,0 0 0 1px var(--ss-outline); background:conic-gradient(#383a41 25%,#24262c 0 50%,#383a41 0 75%,#24262c 0) 0 0/18px 18px; }
.ss-edit-viewport[data-background="black"] .ss-edit-surface { background:#08090b; }
.ss-edit-viewport[data-background="white"] .ss-edit-surface { background:#fff; }
.ss-edit-viewport[data-background="custom"] .ss-edit-surface { background:var(--ss-edit-custom,#805aaf); }
.ss-edit-surface canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
.ss-edit-surface canvas[data-edit="overlay"] { background:transparent; touch-action:none; cursor:crosshair; outline-offset:2px; }
.ss-edit-surface canvas[data-tool="hand"] { cursor:grab; }
.ss-edit-surface canvas:is([data-tool="brush"],[data-tool="erase"],[data-tool="liquify"]) { cursor:none; }
.ss-edit-brush-cursor { position:absolute; aspect-ratio:1; transform:translate(-50%,-50%); border:1px solid white; box-shadow:0 0 0 1px black; border-radius:50%; pointer-events:none; box-sizing:border-box; z-index:3; }
.ss-edit-brush-cursor[hidden] { display:none!important; }
.ss-edit-controls [data-op="selection-undo"] svg,.ss-edit-controls [data-op="selection-redo"] svg {width:13px;height:13px;flex:none;}

.ss-edit-empty { text-align:center; padding:16px; width:min(320px,100%); display:flex; flex-direction:column; gap:10px; align-items:center; }
.ss-edit-empty>span { width:60px; height:60px; display:grid; place-items:center; border:1px solid var(--ss-accent-line); background:var(--ss-accent-soft); color:var(--ss-accent); border-radius:16px; transform:rotate(-5deg); }
.ss-edit-empty>span svg { width:27px; height:27px; }
.ss-edit-empty h2 { font-size:22px; margin:7px 0 0; font-family:Georgia,serif; }
.ss-edit-empty p { color:var(--ss-muted); margin:0 0 6px; }
.ss-edit-canvasbar { min-height:43px; display:flex; align-items:center; gap:6px; flex:none; border-top:1px solid var(--ss-outline); padding:6px 10px; background:var(--ss-header-bg); }
.ss-edit-canvasbar .ss-button,.ss-edit-canvasbar .ss-icon-button { min-height:28px; height:28px; padding:0 7px; font-size:11px; }
.ss-edit-canvasbar [data-edit="zoom"] { min-width:33px; text-align:center; font-variant-numeric:tabular-nums; color:var(--ss-muted); }
.ss-edit-spacer { flex:1; }
.ss-edit-swatch-label { color:var(--ss-muted); font-size:10px; }
.ss-edit-swatch { border:1px solid var(--ss-outline); border-radius:4px; width:22px; height:22px; flex:none; }
.ss-edit-swatch[aria-pressed="true"] { outline:1px solid var(--ss-accent); outline-offset:1px; }
.ss-edit-swatch[data-bg="checker"] { background:conic-gradient(#777 25%,#333 0 50%,#777 0 75%,#333 0) 0 0/10px 10px; }
.ss-edit-swatch[data-bg="black"] { background:#050505; }.ss-edit-swatch[data-bg="white"] { background:#fff; }
.ss-edit-canvasbar input[type="color"] { width:24px; height:24px; flex:none; padding:2px; border:1px solid var(--ss-outline); border-radius:5px; background:transparent; }
.ss-edit-controls { min-width:0; min-height:0; overflow:auto; background:var(--ss-panel-bg); border-left:1px solid var(--ss-outline); padding:14px 13px; display:flex; flex-direction:column; gap:11px; }
.ss-edit-tool-head { display:flex; gap:8px; align-items:center; }
.ss-edit-tool-head .ss-edit-mark { width:32px; height:32px; }
.ss-edit-tool-head h3 { margin:0; font-size:14px; }
.ss-edit-controls small { color:var(--ss-muted); font-size:10px; }
.ss-edit-tool-head small { color:var(--ss-accent); font-size:9px; letter-spacing:.12em; font-weight:700; }
.ss-edit-controls p { color:var(--ss-muted); margin:0; font-size:11px; line-height:1.55; }
.ss-edit-controls label { display:grid; gap:6px; font-size:11px; }
.ss-edit-controls label.ss-edit-check { display:flex; align-items:center; gap:6px; }
.ss-edit-controls select { width:100%; }
.ss-edit-range>span { display:flex; justify-content:space-between; }
.ss-edit-range output { color:var(--ss-accent); font-variant-numeric:tabular-nums; }
.ss-edit-range input[type="range"] { width:100%; height:28px; accent-color:var(--ss-accent); margin:0; background:transparent; }
.ss-edit-divider { height:1px; background:var(--ss-outline); flex:none; margin:2px 0; }
.ss-edit-pair { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
/* SVG-first tool properties: compact, labeled by native tooltips and accessible names. */
.ss-edit-selection-tools { display:grid; gap:8px; min-width:0; }
.ss-edit-section-head { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px; }
.ss-edit-selection-row { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:4px; }
.ss-edit-edge-row { display:grid; grid-template-columns:minmax(0,1fr) 34px 34px; gap:6px; align-items:center; color:var(--ss-muted); font-size:11px; }
.ss-edit-controls .ss-edit-action-icon { width:100%; min-width:0; height:34px; padding:0; border:1px solid transparent; background:transparent; color:var(--ss-muted); border-radius:7px; }
.ss-edit-controls .ss-edit-action-icon:not(:disabled):hover,.ss-edit-controls .ss-edit-quiet-action:not(:disabled):hover { background:var(--ss-accent-soft); color:var(--ss-accent); border-color:var(--ss-accent-line); }
.ss-edit-controls .ss-edit-action-icon:disabled,.ss-edit-controls .ss-edit-quiet-action:disabled,.ss-edit-controls .ss-edit-clear-action:disabled { opacity:.38; }
.ss-edit-feather-row { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:end; gap:8px; }
.ss-edit-controls .ss-edit-quiet-action { background:transparent; border-color:transparent; color:var(--ss-muted); }
.ss-edit-controls .ss-edit-clear-action { justify-content:flex-start; text-align:left; background:transparent; border-color:transparent; color:var(--ss-muted); width:100%; }
.ss-edit-controls .ss-edit-clear-action:not(:disabled) { color:var(--ss-accent); background:var(--ss-accent-soft); border-color:var(--ss-accent-line); }
.ss-edit-clear-action kbd { margin-left:auto; font-size:10px; font-family:inherit; background:var(--ss-header-bg); border-radius:4px; padding:2px 5px; }
.ss-edit-controls :is(.ss-edit-action-icon,.ss-edit-quiet-action,.ss-edit-clear-action):focus-visible { outline:2px solid var(--ss-accent); outline-offset:1px; }
@media (pointer:coarse) { .ss-edit-controls .ss-edit-action-icon { min-height:44px; } .ss-edit-edge-row { grid-template-columns:minmax(0,1fr) 44px 44px; } }
.ss-edit-controls .ss-button { white-space:normal; padding:7px 8px; font-size:11px; }
.ss-edit-foot-text strong { font-size:11px; font-weight:600; white-space:normal; overflow-wrap:anywhere; }
.ss-edit-foot-text strong[data-error="true"] { color:#e79eaa; }
.ss-edit-footer-actions .ss-button { min-width:68px; }
@container edit-atelier (max-width:720px) {
 .ss-edit-body { grid-template-columns:minmax(0,1fr); grid-template-rows:minmax(110px,1fr) auto minmax(90px,30%); }
 .ss-edit-center { grid-row:1; }.ss-edit-rail { grid-row:2; display:grid; grid-template-columns:repeat(12,minmax(0,1fr)); border-right:0; border-block:1px solid var(--ss-outline); padding:5px 7px; gap:4px; }
 .ss-edit-rail .ss-icon-button { width:100%; height:36px; }.ss-edit-separator { display:none; }
 .ss-edit-controls { grid-row:3; border-left:0; padding:10px 12px; gap:9px; }
 .ss-edit-header,.ss-edit-footer { padding:8px; gap:6px; }.ss-edit-header>.ss-edit-mark{display:none;}
 .ss-edit-header-actions .ss-button { padding:0 7px; }.ss-edit-header-actions .ss-button span {display:none;}
 .ss-edit-header-actions .ss-icon-button {width:30px;min-height:32px;}.ss-edit-header-actions{gap:4px;}
 .ss-edit-footer { flex-wrap:wrap; }.ss-edit-foot-text { flex-basis:100%; }.ss-edit-footer-actions { width:100%; }.ss-edit-footer-actions .ss-button { flex:1; min-width:0; }
 .ss-edit-canvasbar {padding:4px 7px;gap:5px;}.ss-edit-swatch-label {display:none;}
}
@container edit-atelier (max-width:440px){.ss-edit-rail{grid-template-columns:repeat(6,minmax(0,1fr));}}
@container edit-atelier (max-width:350px){.ss-edit-heading strong{font-size:12px;}.ss-edit-heading small{font-size:9px;}.ss-edit-footer-actions .ss-button{font-size:10px;}.ss-edit-header-actions .ss-icon-button{width:27px;}.ss-edit-canvasbar{gap:3px;}}


/* Wardrobe rail: compact outfit swatches, independent expression collection. */
.ss-cast-workspace .cast-wardrobe{margin:0 0 22px;padding:14px;border:1px solid var(--line);border-radius:14px;display:grid;gap:12px;min-width:0}
.ss-cast-workspace .cast-wardrobe>header{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.ss-cast-workspace .cast-wardrobe h3{display:flex;align-items:center;gap:7px;font-size:13px}
.ss-cast-workspace .cast-wardrobe h3 .icon{width:17px;height:17px;color:var(--lilac)}
.ss-cast-workspace .cast-wardrobe p,.ss-cast-workspace .cast-wardrobe-foot small{color:var(--muted);font-size:10px;margin:4px 0 0;overflow-wrap:anywhere}
.ss-cast-workspace .cast-wardrobe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,170px),1fr));gap:8px}
.ss-cast-workspace .cast-wardrobe-card{display:flex;align-items:center;gap:10px;text-align:left;padding:7px;min-width:0;border:1px solid var(--line);border-radius:10px;background:transparent;color:inherit;cursor:pointer}
.ss-cast-workspace .cast-wardrobe-card[aria-pressed=true]{border-color:var(--lilac);background:color-mix(in srgb,var(--lilac) 10%,transparent)}
.ss-cast-workspace .cast-wardrobe-card strong,.ss-cast-workspace .cast-wardrobe-card small{display:block;overflow-wrap:anywhere}
.ss-cast-workspace .cast-wardrobe-card strong{font-size:12px}.ss-cast-workspace .cast-wardrobe-card small{color:var(--muted);font-size:10px;margin-top:4px}
.ss-cast-workspace .cast-wardrobe-thumb{width:52px;height:64px;flex:none;border-radius:7px;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--lilac) 7%,transparent);color:var(--muted)}
.ss-cast-workspace .cast-wardrobe-thumb img{width:100%;height:100%;object-fit:cover;object-position:50% 16%}
.ss-cast-workspace .cast-wardrobe-thumb .icon{width:24px;height:24px}
.ss-cast-workspace .cast-wardrobe-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ss-cast-workspace .cast-wardrobe-archive{border-top:1px solid var(--line);padding-top:12px;display:grid;gap:8px}
.ss-cast-workspace .cast-wardrobe-archive h4{font-size:12px;margin:0}.ss-cast-workspace .cast-wardrobe-archive h4 small{color:var(--muted);margin-left:6px}
.ss-cast-workspace .cast-wardrobe-lifecycle{gap:16px}.ss-cast-workspace .cast-wardrobe-lifecycle section{display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:10px}.ss-cast-workspace .cast-wardrobe-lifecycle h3{margin:0;font-size:13px}.ss-cast-workspace .cast-wardrobe-lifecycle p{margin:0}.ss-cast-workspace .cast-wardrobe-lifecycle section>.button{justify-self:start}.ss-cast-workspace .cast-wardrobe-confirm{display:flex;align-items:flex-start;gap:10px;line-height:1.5;font-size:12px;color:var(--ss-text);cursor:pointer;min-width:0;padding:5px 0}.ss-cast-workspace .cast-wardrobe-confirm span{min-width:0;overflow-wrap:anywhere}.ss-cast-workspace .cast-wardrobe-confirm input{appearance:none;display:grid;place-items:center;flex:none;margin:0;padding:0;width:18px;height:18px;min-height:18px;border:1px solid var(--line);border-radius:5px;background:var(--raised);accent-color:var(--lilac);cursor:pointer}.ss-cast-workspace .cast-wardrobe-confirm input:checked{background:var(--ss-primary-bg);border-color:var(--ss-primary-bg)}.ss-cast-workspace .cast-wardrobe-confirm input:checked::after{content:"";width:8px;height:5px;border-left:2px solid var(--ss-primary-ink);border-bottom:2px solid var(--ss-primary-ink);transform:translateY(-1px) rotate(-45deg)}
@media(forced-colors:active){.ss-cast-workspace .cast-wardrobe-confirm input{appearance:auto}.ss-cast-workspace .cast-wardrobe-confirm input:checked::after{display:none}}
.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"][open]{display:flex;flex-direction:column;overflow:hidden;width:min(510px,calc(var(--app-scaled-viewport-width,100vw) - 28px));max-height:calc(var(--app-interactive-viewport-height,100dvh) - 24px)}
.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] :is(.dialog-header,.dialog-footer){flex:none;padding:14px 20px}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] .dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 20px}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] .dialog-footer{flex-wrap:nowrap;gap:8px}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] .dialog-footer .button{min-height:44px;white-space:nowrap}
@container cast-album (max-width:500px){.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] :is(.dialog-header,.dialog-footer){padding:12px}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] .dialog-header h2{font-size:22px}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-lifecycle"] .dialog-body{padding:12px}.ss-cast-workspace .cast-wardrobe-lifecycle{gap:12px}}
/* Move expressions: wider gallery, fixed dialog chrome, container-aware controls. */
.ss-cast-workspace .dialog[data-cast-modal="wardrobe-move"][open]{display:flex;flex-direction:column;overflow:hidden;width:min(900px,calc(var(--app-scaled-viewport-width,100vw) - 28px));height:min(760px,calc(var(--app-interactive-viewport-height,100dvh) - 38px));container-type:inline-size;container-name:wardrobe-move}
.ss-cast-workspace .dialog[data-cast-modal="wardrobe-move"] :is(.dialog-header,.dialog-footer){flex:none;padding:14px 20px}
.ss-cast-workspace .dialog[data-cast-modal="wardrobe-move"] .dialog-body{display:flex;flex-direction:column;flex:1;min-height:0;overflow:auto;padding:16px 20px;overscroll-behavior:contain}
.ss-cast-workspace #ss-cast-wardrobe-move{flex:1;min-height:0;gap:12px}
.ss-cast-workspace .cast-wardrobe-move-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;flex:none;align-items:start}
.ss-cast-workspace .cast-wardrobe-move-fields .field{min-width:0}
.ss-cast-workspace .cast-wardrobe-move-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;flex:none;color:var(--muted);font-size:11px}
.ss-cast-workspace .cast-wardrobe-move-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;grid-auto-rows:max-content;flex:1 1 auto;min-height:120px;overflow:auto;align-content:start;padding:1px 4px 1px 1px;overscroll-behavior:contain}
.ss-cast-workspace #ss-cast-wardrobe-move>.hint{flex:none;margin:0}
@container wardrobe-move (max-width:650px){.ss-cast-workspace .cast-wardrobe-move-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@container wardrobe-move (max-width:480px){.ss-cast-workspace .cast-wardrobe-move-fields{grid-template-columns:minmax(0,1fr);gap:8px}.ss-cast-workspace .cast-wardrobe-move-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.ss-cast-workspace .dialog[data-cast-modal="wardrobe-move"] .dialog-body{padding:12px}.ss-cast-workspace #ss-cast-wardrobe-move{gap:8px}}
@container wardrobe-move (max-width:300px){.ss-cast-workspace .cast-wardrobe-move-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ss-cast-workspace .cast-wardrobe-move-tile{border:1px solid var(--line);border-radius:9px;overflow:hidden;cursor:pointer;min-width:0;display:grid;gap:4px;padding:5px}
.ss-cast-workspace .cast-wardrobe-move-tile:has(input:checked){border-color:var(--lilac);background:color-mix(in srgb,var(--lilac) 10%,transparent)}
.ss-cast-workspace .cast-wardrobe-move-tile img{width:100%;height:clamp(92px,18cqw,148px);object-fit:contain}.ss-cast-workspace .cast-wardrobe-move-tile input[type=checkbox]{width:14px;min-height:14px;flex:none;padding:0}.ss-cast-workspace .cast-wardrobe-move-tile span{display:flex;align-items:center;gap:5px;font-size:10px;overflow-wrap:anywhere}
@container cast-album (max-width:500px){.ss-cast-workspace .cast-wardrobe{padding:10px;gap:8px}.ss-cast-workspace .cast-wardrobe-grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,130px),1fr))}.ss-cast-workspace .cast-wardrobe-thumb{width:38px;height:48px}.ss-cast-workspace .cast-wardrobe>header .button{padding:6px 8px}.ss-cast-workspace .cast-wardrobe-card{gap:6px}}

/* Atmospheres: compact color direction, not a particle effects editor. */
.ss-cast-workspace .dialog[data-cast-modal="atmosphere"][open]{display:flex;flex-direction:column;overflow:hidden;width:min(960px,calc(var(--app-scaled-viewport-width,100vw) - 24px));max-width:none;max-height:calc(var(--app-interactive-viewport-height,100dvh) - 24px)}
.ss-cast-workspace .dialog[data-cast-modal="atmosphere"] .dialog-body{min-height:0;flex:1 1 auto;overflow:auto;container-type:inline-size;container-name:cast-atmosphere}
.ss-cast-workspace .dialog[data-cast-modal="atmosphere"] :is(.dialog-header,.dialog-footer){flex:none}
.ss-cast-workspace .cast-atmosphere-form{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(0,1fr);gap:18px;align-items:start}
.ss-cast-workspace .cast-atmosphere-stage,.ss-cast-workspace .cast-atmosphere-controls{display:grid;gap:12px;min-width:0}
.ss-cast-workspace .cast-atmosphere-preview{display:grid;place-items:center;min-height:200px;min-width:0;overflow:hidden;border:1px solid var(--line);border-radius:12px;padding:8px;background:radial-gradient(circle,color-mix(in srgb,var(--lilac) 16%,transparent) .6px,transparent .9px) 0 0/14px 14px}
.ss-cast-workspace .cast-atmosphere-preview .ss-cast-design{width:100%!important;margin:0!important;min-width:0}
.ss-cast-workspace .cast-atmosphere-preview .actor img{background:transparent;padding:0;border:0;border-radius:0;object-fit:contain}
.ss-cast-workspace .cast-atmosphere-palettes{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.ss-cast-workspace .cast-atmosphere-choice{position:relative;display:grid;gap:6px;align-content:start;cursor:pointer;border:1px solid var(--line);border-radius:8px;padding:5px;min-width:0;font-size:10px;text-align:center;overflow-wrap:anywhere}
.ss-cast-workspace .cast-atmosphere-choice input{position:absolute;opacity:0;inset:0;min-width:0;width:100%;height:100%;margin:0;cursor:pointer}
.ss-cast-workspace .cast-atmosphere-choice:has(input:checked){border-color:var(--lilac);background:color-mix(in srgb,var(--lilac) 13%,transparent)}
.ss-cast-workspace .cast-atmosphere-choice:focus-within{outline:2px solid var(--lilac);outline-offset:2px}
.ss-cast-workspace .cast-atmosphere-choice>span{height:28px;border-radius:4px;border:1px solid color-mix(in srgb,var(--line) 60%,transparent)}
.ss-cast-workspace .cast-atmosphere-choice strong{font-weight:600;line-height:1.2}
.ss-cast-workspace .cast-atmosphere-colors{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ss-cast-workspace .cast-atmosphere-colors[hidden]{display:none!important}
.ss-cast-workspace .cast-atmosphere-colors input{width:100%;height:36px;padding:4px}
.ss-cast-workspace .cast-atmosphere-range-label{display:flex;justify-content:space-between;gap:8px}.ss-cast-workspace .cast-atmosphere-range-label output{color:var(--lilac)}
.ss-cast-workspace .cast-atmosphere-controls input[type=range]{width:100%;accent-color:var(--lilac);padding:0;min-height:24px}
.ss-cast-workspace .cast-atmosphere-toggle{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 10px;border:1px solid var(--line);border-radius:8px;cursor:pointer;min-width:0}
.ss-cast-workspace .cast-atmosphere-toggle span{display:grid;gap:3px;min-width:0}.ss-cast-workspace .cast-atmosphere-toggle small{font-size:10px;color:var(--ss-muted);line-height:1.4}.ss-cast-workspace .cast-atmosphere-toggle input{width:16px;height:16px;min-height:16px;flex:none;accent-color:var(--lilac);padding:0}
.ss-cast-workspace .cast-atmosphere-motion{display:grid;gap:6px}.ss-cast-workspace .cast-atmosphere-form .hint{margin:0}
@container cast-atmosphere (max-width:660px){.ss-cast-workspace .cast-atmosphere-form{grid-template-columns:minmax(0,1fr)}.ss-cast-workspace .cast-atmosphere-preview{min-height:0}}
@media(min-height:650px){
 .ss-cast-workspace .dialog[data-cast-modal="atmosphere"][open]{height:min(806px,calc(var(--app-interactive-viewport-height,100dvh) - 24px))}
 @container cast-atmosphere (max-width:660px){
  .ss-cast-workspace .cast-atmosphere-form{height:100%;grid-template-rows:auto minmax(0,1fr);gap:10px;align-items:stretch;overflow:hidden}
  .ss-cast-workspace .cast-atmosphere-stage{gap:6px}
  .ss-cast-workspace .cast-atmosphere-preview{padding:5px;max-height:230px}
  .ss-cast-workspace .cast-atmosphere-preview .ss-cast-design{zoom:.60}
  .ss-cast-workspace .cast-atmosphere-controls{overflow:auto;overscroll-behavior:contain;align-content:start;padding:2px 3px 2px 0}
 }
}
@container cast-atmosphere (max-width:340px){.ss-cast-workspace .cast-atmosphere-palettes{grid-template-columns:repeat(4,minmax(0,1fr))}}

/* Shared native ranges: never inherit a text input's background or box. */
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]{appearance:none;-webkit-appearance:none;box-sizing:border-box;background:transparent!important;border:0!important;border-radius:0;padding:0!important;box-shadow:none!important;min-height:28px;height:28px;max-width:100%;cursor:ew-resize;accent-color:var(--ss-accent)}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]::-webkit-slider-runnable-track{height:4px;border:0;border-radius:4px;background:color-mix(in srgb,var(--ss-outline) 72%,var(--ss-text) 28%)}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-7px;border:2px solid var(--ss-panel-bg);border-radius:50%;background:var(--ss-accent);box-shadow:0 0 0 1px var(--ss-accent-line)}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]::-moz-range-track{height:4px;border:0;border-radius:4px;background:color-mix(in srgb,var(--ss-outline) 72%,var(--ss-text) 28%)}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]::-moz-range-thumb{width:16px;height:16px;border:2px solid var(--ss-panel-bg);border-radius:50%;background:var(--ss-accent);box-shadow:0 0 0 1px var(--ss-accent-line)}
:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]:disabled{opacity:.45;cursor:not-allowed}
@media(pointer:coarse){:is(.ss-shell,.ss-host-visual-canon,.ss-visual-lorebook-host,.ss-cast-workspace,.ss-edit-workspace,.ss-expression-overlay-settings) input[type=range]{min-height:36px}}
/* Manual scenic workshop: preview and prompt, compact inherited-render inspector. */
.ss-cast-workspace .dialog[data-cast-modal="background-generate"][open]{width:min(1040px,calc(var(--app-scaled-viewport-width,100vw) - 24px));max-height:calc(var(--app-interactive-viewport-height,100dvh) - 24px)}
.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-body{overflow:auto;min-height:0;container-type:inline-size;container-name:bg-workshop}
.ss-cast-workspace .cast-bg-workshop{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:18px;align-items:start}
.ss-cast-workspace .cast-bg-main,.ss-cast-workspace .cast-bg-settings{display:grid;gap:12px;min-width:0}
.ss-cast-workspace .cast-bg-settings{border-left:1px solid var(--ss-outline);padding-left:16px}
.ss-cast-workspace .cast-bg-workshop .field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.ss-cast-workspace .cast-bg-workshop .field{min-width:0}
.ss-cast-workspace .cast-bg-workshop :is(input,textarea,select){min-width:0;width:100%;box-sizing:border-box}
.ss-cast-workspace .cast-bg-stage{aspect-ratio:16/9;display:grid;place-items:center;overflow:hidden;background:var(--ss-canvas-bg);border-radius:12px;border:1px solid var(--ss-outline)}
.ss-cast-workspace .cast-bg-stage img{width:100%;height:100%;object-fit:contain;min-height:0;max-height:100%;display:block}
.ss-cast-workspace .cast-bg-placeholder{display:grid;gap:6px;justify-items:center;color:var(--ss-muted);text-align:center;padding:10px}
.ss-cast-workspace .cast-bg-placeholder svg{width:28px;height:28px}
.ss-cast-workspace .cast-bg-inherit{display:grid;gap:5px;background:var(--ss-panel-hi);border-radius:10px;padding:12px;overflow-wrap:anywhere}
.ss-cast-workspace .cast-bg-workshop .hint,.ss-cast-workspace .cast-bg-review-card .hint{margin:0}
.ss-cast-workspace .cast-bg-review-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:8px}
.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer [data-bg-review]{margin-left:auto;min-width:0}
.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer [data-bg-review][hidden],.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer button[hidden]{display:none!important}
.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer .cast-bg-review-actions{grid-template-columns:auto auto;gap:6px}
@media(max-width:390px){.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer{gap:4px;padding-inline:10px}.ss-cast-workspace .dialog[data-cast-modal="background-generate"] .dialog-footer .button{padding-inline:9px;min-height:44px}}
.ss-cast-workspace .cast-bg-review-card{display:grid;grid-template-columns:minmax(0,160px) minmax(0,1fr);gap:12px;align-items:center;background:var(--ss-panel-hi);padding:12px;border-radius:10px;margin:8px 0}
.ss-cast-workspace .cast-bg-review-card img{width:100%;aspect-ratio:16/9;object-fit:contain;border-radius:6px;background:var(--ss-canvas-bg)}
.ss-cast-workspace .cast-bg-review-card>div{display:grid;gap:8px;min-width:0}
@container bg-workshop (max-width:650px){.ss-cast-workspace .cast-bg-workshop{grid-template-columns:minmax(0,1fr);gap:18px}.ss-cast-workspace .cast-bg-settings{border-left:0;border-top:1px solid var(--ss-outline);padding:14px 0 0}}
@container cast-backgrounds (max-width:480px){.ss-cast-workspace .cast-bg-review-card{grid-template-columns:minmax(0,1fr)}}
/* Background gallery: quiet compact toolbar, predictable tile widths, one action rail per image. */
.ss-cast-workspace .dialog[data-cast-modal="backgrounds"][open]{width:min(1040px,calc(var(--app-scaled-viewport-width,100vw) - 24px));height:min(820px,calc(var(--app-interactive-viewport-height,100dvh) - 24px))}
.ss-cast-workspace .dialog[data-cast-modal="backgrounds"] .dialog-body{display:flex;flex-direction:column;gap:12px;min-height:0;flex:1 1 auto;overflow:auto;container-type:inline-size;container-name:cast-backgrounds}
.ss-cast-workspace .cast-background-heading{display:grid;gap:12px;flex:none}
.ss-cast-workspace .cast-background-title{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.ss-cast-workspace .cast-background-title h3,.ss-cast-workspace .cast-background-title p{margin:0}
.ss-cast-workspace .cast-background-title p{color:var(--ss-muted);font-size:11px;margin-top:4px}
.ss-cast-workspace .cast-background-toolbar{display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap;width:auto}
.ss-cast-workspace .cast-background-toolbar .button{flex:none;min-height:36px}
.ss-cast-workspace .cast-background-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ss-cast-workspace .cast-background-options .cast-background-default{padding:9px 10px;gap:6px;flex-wrap:nowrap}
.ss-cast-workspace .cast-background-grid{grid-template-columns:repeat(3,minmax(0,1fr));align-content:start;align-items:start;gap:12px;margin:0;flex:0 0 auto}
.ss-cast-workspace .cast-background-tile{min-width:0;background:var(--ss-panel-bg)}
.ss-cast-workspace .cast-background-tile.is-default{border-color:var(--ss-accent-line)}
.ss-cast-workspace .cast-background-tile figcaption{gap:6px;padding:10px}
.ss-cast-workspace .cast-background-caption{display:flex;align-items:center;gap:5px;justify-content:space-between;min-width:0}
.ss-cast-workspace .cast-background-caption strong,.ss-cast-workspace .cast-background-tile code{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ss-cast-workspace .cast-background-tag{display:inline-flex;align-items:center;gap:3px;color:var(--ss-accent);font-size:10px;white-space:nowrap;flex:none}
.ss-cast-workspace .cast-background-tag .icon{width:12px;height:12px}
.ss-cast-workspace .cast-background-actions{display:flex;align-items:center;justify-content:space-between;gap:3px;border-top:1px solid var(--ss-outline);padding-top:5px}
.ss-cast-workspace .button.cast-background-icon{display:inline-flex;align-items:center;justify-content:center;min-width:32px;min-height:32px;padding:5px;border:1px solid transparent;background:transparent;color:var(--ss-muted);flex:none}
.ss-cast-workspace .button.cast-background-icon:hover:not(:disabled){color:var(--ss-accent);background:var(--ss-accent-soft);border-color:var(--ss-accent-line)}
.ss-cast-workspace .button.cast-background-icon[data-cast-action=background-remove]:hover:not(:disabled){color:var(--ss-danger,#e6a2a2)}
.ss-cast-workspace .cast-background-help{margin:0}
.ss-cast-workspace .dialog[data-cast-modal="backgrounds"] .dialog-footer{justify-content:flex-end}
@container cast-backgrounds (max-width:780px){.ss-cast-workspace .cast-background-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container cast-backgrounds (max-width:520px){.ss-cast-workspace .cast-background-title{align-items:flex-start}.ss-cast-workspace .cast-background-toolbar{width:100%;justify-content:flex-start}.ss-cast-workspace .cast-background-toolbar .button{flex:none}.ss-cast-workspace .cast-background-options{grid-template-columns:minmax(0,1fr)}.ss-cast-workspace .cast-background-grid{grid-template-columns:minmax(0,1fr)}.ss-cast-workspace .cast-background-actions .button{min-width:40px;min-height:40px}}
@media(pointer:coarse){.ss-cast-workspace .button.cast-background-icon{min-width:40px;min-height:40px}}


/* Finalize / Render Lab. A persistent before/after stage and contextual chain editor. */
.ss-finalize-workspace{flex:1 1 0;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden;background:var(--ss-canvas-bg);container-type:inline-size;container-name:finalize}
.ss-finalize-header,.ss-finalize-footer{display:flex;align-items:center;gap:9px;padding:12px 16px;background:var(--ss-header-bg);flex:none;border-bottom:1px solid var(--ss-outline)}
.ss-finalize-footer{border-top:1px solid var(--ss-outline);border-bottom:0}.ss-finalize-heading,.ss-finalize-status{display:grid;gap:3px;flex:1;min-width:0}.ss-finalize-heading strong{font-size:15px}.ss-finalize-workspace small{color:var(--ss-muted);font-size:11px;line-height:1.4}.ss-finalize-status strong{font-size:12px;overflow-wrap:anywhere}.ss-finalize-status strong[data-error=true]{color:var(--ss-danger,#e69ca9)}
.ss-finalize-workspace :is(.ss-button,.ss-icon-button){display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:34px}.ss-finalize-workspace :is(.ss-button,.ss-icon-button) svg{width:16px;height:16px;flex:none}.ss-finalize-workspace .ss-icon-button[aria-pressed=true]{color:var(--ss-accent);border-color:var(--ss-accent-line);background:var(--ss-accent-soft)}
.ss-finalize-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(290px,340px);overflow:hidden}.ss-finalize-visual{min-height:0;min-width:0;display:flex;flex-direction:column;overflow:auto;padding:14px;gap:12px}.ss-finalize-arthead{display:flex;justify-content:space-between;gap:8px;align-items:center}.ss-finalize-arthead>div{display:grid;min-width:0;gap:4px}.ss-finalize-arthead strong{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ss-finalize-arthead small{letter-spacing:.12em;font-size:10px}
.ss-finalize-canvas{flex:1 1 240px;min-height:140px;display:grid;place-items:center;position:relative;overflow:hidden;border:1px solid var(--ss-outline);border-radius:12px;background-color:var(--ss-canvas-bg);background-image:radial-gradient(var(--ss-outline) .7px,transparent .7px);background-size:12px 12px}.ss-finalize-compare{position:absolute;inset:0;--ss-split:50%;overflow:hidden;left:50%;top:50%;right:auto;bottom:auto;width:100%;height:100%;transform:translate(-50%,-50%)}.ss-finalize-compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.ss-finalize-after{clip-path:inset(0 calc(100% - var(--ss-split)) 0 0);background:var(--ss-canvas-bg)}.ss-finalize-divider{position:absolute;left:var(--ss-split);top:0;bottom:0;width:1px;background:var(--ss-accent);pointer-events:none}.ss-finalize-divider:after{content:'↔';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:var(--ss-panel-bg);border:1px solid var(--ss-accent);color:var(--ss-accent)}
.ss-finalize-empty{text-align:center;display:grid;justify-items:center;gap:8px;padding:16px;color:var(--ss-muted)}.ss-finalize-empty>span{color:var(--ss-accent)}.ss-finalize-empty svg{width:34px;height:34px}.ss-finalize-empty h3{font-size:16px;color:var(--ss-text);margin:0}.ss-finalize-empty p{font-size:12px;margin:0 0 8px}.ss-finalize-split{display:flex;gap:10px;align-items:center}.ss-finalize-split input{flex:1;min-width:0}
.ss-finalize-panel{min-width:0;min-height:0;overflow:auto;background:var(--ss-panel-bg);border-left:1px solid var(--ss-outline);padding:12px;display:flex;flex-direction:column;gap:12px}.ss-finalize-section{display:grid;gap:9px;padding:10px;border:1px solid var(--ss-outline);border-radius:10px;background:var(--ss-header-bg);flex:none}.ss-finalize-section-title,.ss-finalize-preset-row{display:flex;align-items:center;gap:6px;justify-content:space-between}.ss-finalize-section-title strong{font-size:13px}.ss-finalize-preset-row select{flex:1;min-width:0}.ss-finalize-chain{display:grid;gap:5px}.ss-finalize-stage{display:flex;align-items:center;gap:6px;min-width:0;padding:5px;border:1px solid var(--ss-outline);border-radius:8px;background:var(--ss-panel-bg)}.ss-finalize-stage[data-selected=true]{border-color:var(--ss-accent-line);background:var(--ss-accent-soft)}.ss-finalize-stage input{flex:none;accent-color:var(--ss-accent)}.ss-finalize-stage-label{border:0;background:none;display:flex;align-items:center;gap:6px;padding:5px;min-width:0;flex:1;text-align:left;color:var(--ss-text);cursor:pointer}.ss-finalize-stage-label svg{width:16px;height:16px;color:var(--ss-accent);flex:none}.ss-finalize-stage-label span{display:grid;gap:2px;min-width:0}.ss-finalize-stage-label strong{font-size:12px;overflow-wrap:anywhere}.ss-finalize-stage-label small{font-size:10px;overflow-wrap:anywhere}.ss-finalize-stage-actions{display:flex;gap:1px;flex:none}.ss-finalize-stage-actions .ss-icon-button{width:23px;min-width:23px;min-height:27px;padding:0;background:transparent;border-color:transparent}.ss-finalize-stage-actions .ss-icon-button:not(:disabled):hover{background:var(--ss-accent-soft);border-color:var(--ss-accent-line)}
.ss-finalize-fields{border:0;padding:0;margin:0;display:grid;gap:9px;min-width:0}.ss-finalize-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ss-finalize-field{display:grid;gap:4px;font-size:11px;color:var(--ss-muted);min-width:0}.ss-finalize-field :is(input,select,textarea){width:100%;min-width:0;box-sizing:border-box}.ss-finalize-check{display:flex;align-items:center;gap:7px;font-size:11px}.ss-finalize-section p{font-size:12px;color:var(--ss-muted);margin:0;line-height:1.4}.ss-finalize-config summary,.ss-finalize-ref-tune summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;list-style:none;font-size:12px;font-weight:600}.ss-finalize-config summary::-webkit-details-marker,.ss-finalize-ref-tune summary::-webkit-details-marker{display:none}.ss-finalize-config summary svg{height:14px;width:14px}.ss-finalize-config[open] summary{margin-bottom:8px}.ss-finalize-ref-tune{border-top:1px solid var(--ss-outline);padding-top:9px;grid-column:1/-1}.ss-finalize-ref-tune[open] summary{margin-bottom:8px}.ss-finalize-capability{line-height:1.4;padding:0 4px}
.ss-finalize-strip{display:flex;gap:7px;overflow:auto;align-items:stretch;flex:none;padding:2px}.ss-finalize-thumb{border:1px solid var(--ss-outline);background:var(--ss-panel-bg);color:var(--ss-text);border-radius:8px;display:grid;gap:5px;padding:5px;width:94px;flex:none;text-align:center;cursor:pointer}.ss-finalize-thumb img{width:100%;height:64px;object-fit:contain;background:var(--ss-canvas-bg);border-radius:4px}.ss-finalize-thumb span{font-size:11px;color:var(--ss-accent)}.ss-finalize-thumb:hover{border-color:var(--ss-accent)}.ss-finalize-candidates{display:grid;gap:6px;flex:none}.ss-finalize-candidates>strong{font-size:12px}.ss-finalize-candidates>.ss-button{justify-self:start}
.ss-edit-rail button[data-tool=smart]{color:var(--ss-accent)}.ss-edit-surface canvas[data-tool=smart]{cursor:crosshair}
@container edit-atelier (min-width:441px) and (max-width:720px){.ss-edit-rail{grid-template-columns:repeat(7,minmax(0,1fr))}}
@container finalize (max-width:720px){.ss-finalize-body{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(145px,44%) minmax(0,1fr)}.ss-finalize-visual{padding:8px;gap:6px}.ss-finalize-canvas{min-height:100px}.ss-finalize-panel{border-left:0;border-top:1px solid var(--ss-outline);padding:8px;gap:8px}.ss-finalize-header,.ss-finalize-footer{padding:8px;gap:5px}.ss-finalize-header>.ss-edit-mark{display:none}.ss-finalize-header .ss-button span{display:none}.ss-finalize-footer{flex-wrap:wrap}.ss-finalize-status{flex-basis:100%}.ss-finalize-footer>.ss-button{flex:1}.ss-finalize-stage-actions .ss-icon-button{width:28px;min-height:32px}.ss-finalize-thumb{width:76px}.ss-finalize-thumb img{height:48px}}
@media(min-width:721px) and (max-width:960px){.ss-shell .ss-view-nav .ss-button{flex:1 1 0;min-width:0;padding:0 5px}}
@media(max-width:720px){.ss-shell .ss-view-nav{grid-template-columns:repeat(7,minmax(0,1fr))}.ss-shell .ss-view-nav .ss-button{font-size:clamp(8px,2.3vw,11px)}}

.ss-anima-ref-slots{display:flex;gap:5px;align-items:center;flex-wrap:wrap;margin-top:7px}.ss-anima-ref-slots .ss-button{flex:1;min-width:0;justify-content:center;font-size:11px}.ss-anima-ref-slots .ss-button svg{width:15px;height:15px;flex:none}.ss-anima-ref-slots .ss-icon-button{flex:none}.ss-anima-ref-slots .ss-button img{width:30px;height:30px;object-fit:cover;border-radius:4px}.ss-anima-ref-slots .ss-button:has(img:not([hidden])) svg{display:none}
.ss-finalize-workspace .ss-finalize-focus{display:none}
@container finalize (max-width:720px){.ss-finalize-workspace .ss-finalize-focus{display:inline-flex}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-body{grid-template-rows:minmax(0,1fr)}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-panel{display:none}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-canvas{min-height:140px}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-visual{padding:12px}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-thumb{width:100px}.ss-finalize-workspace[data-focus-preview=true] .ss-finalize-thumb img{height:90px}}

/* Cast Registry: compact visual identity cards, separate from ensemble albums. */
.ss-cast-workspace .cast-registry-toolbar{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;margin-bottom:12px}
.ss-cast-workspace .cast-registry-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));grid-auto-rows:1fr;gap:12px;align-items:stretch;margin-top:12px}
.ss-cast-workspace .cast-registry-card{min-width:0;display:flex;flex-direction:column;gap:12px;padding:14px;background:var(--surface);border:1px solid var(--line);border-radius:12px}
.ss-cast-workspace .cast-registry-card[hidden]{display:none}
.ss-cast-workspace .cast-registry-person{display:flex;align-items:center;gap:12px;min-width:0}
.ss-cast-workspace .cast-registry-person .portrait{width:62px;height:82px;flex:none;overflow:hidden;border-radius:8px}
.ss-cast-workspace .cast-registry-person .portrait img{width:100%;height:100%;object-fit:cover;object-position:center 12%}
.ss-cast-workspace .cast-registry-person strong{display:block;font-size:14px;overflow-wrap:anywhere}
.ss-cast-workspace .cast-registry-person small,.ss-cast-workspace .cast-registry-existing small{display:block;font-size:11px;color:var(--muted);line-height:1.45;overflow-wrap:anywhere}
.ss-cast-workspace .cast-registry-check{align-self:flex-start;display:grid;place-items:center;flex:none;width:30px;height:30px;cursor:pointer}
.ss-cast-workspace .cast-registry-check input{appearance:none;display:grid;place-items:center;margin:0;padding:0;width:18px;height:18px;min-height:18px;border:1px solid var(--line);border-radius:5px;background:var(--raised);accent-color:var(--lilac);cursor:pointer}
.ss-cast-workspace .cast-registry-check input:checked{background:var(--ss-primary-bg);border-color:var(--ss-primary-bg)}
.ss-cast-workspace .cast-registry-check input:checked::after{content:"";width:8px;height:5px;border-left:2px solid var(--ss-primary-ink);border-bottom:2px solid var(--ss-primary-ink);transform:translateY(-1px) rotate(-45deg)}
.ss-cast-workspace .cast-registry-check input:disabled{opacity:.38;cursor:default}
@media(forced-colors:active){.ss-cast-workspace .cast-registry-check input{appearance:auto}.ss-cast-workspace .cast-registry-check input:checked::after{display:none}}
.ss-cast-workspace .cast-registry-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-items:stretch;margin-top:auto;padding-top:10px;border-top:1px solid var(--faint)}
.ss-cast-workspace .cast-registry-actions>.button,.ss-cast-workspace .cast-registry-linked{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;min-height:52px;padding:6px 2px;border:1px solid transparent;border-radius:8px;background:var(--raised);color:var(--text);font-size:11px;font-weight:600;line-height:1.2;white-space:nowrap;text-align:center}
.ss-cast-workspace .cast-registry-actions>.button:not(:disabled):hover{background:var(--ss-button-hover);border-color:var(--line)}
.ss-cast-workspace .cast-registry-actions>.button:disabled:hover{background:var(--raised)}
.ss-cast-workspace .cast-registry-actions>.button .icon,.ss-cast-workspace .cast-registry-linked .icon{width:17px;height:17px}
.ss-cast-workspace .cast-registry-linked{color:var(--muted);background:transparent}
.ss-cast-workspace .cast-registry-linked .icon{color:var(--mint)}
.ss-cast-workspace .cast-registry-existing{display:grid;gap:6px;padding-top:8px;border-top:1px solid var(--faint)}
.ss-cast-workspace .cast-registry-existing .button{min-width:0;white-space:normal;overflow-wrap:anywhere}
.ss-cast-workspace .dialog[data-cast-modal^="registry"]{display:flex;flex-direction:column;overflow:hidden;max-height:calc(100dvh - 20px)}
.ss-cast-workspace .dialog[data-cast-modal^="registry"]:not([open]){display:none}
.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-header,.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-footer{flex:none}
.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-body{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}
@container cast-album (max-width:600px){.ss-cast-workspace .cast-registry-toolbar{grid-template-columns:minmax(0,1fr);gap:8px}.ss-cast-workspace .cast-registry-grid{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto}.ss-cast-workspace .cast-registry-card{padding:10px}.ss-cast-workspace .cast-registry-person .portrait{width:50px;height:66px}.ss-cast-workspace .page-head>.row{justify-content:flex-end}.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-header{padding:14px 16px}.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-header h2{font-size:23px}.ss-cast-workspace .dialog[data-cast-modal^="registry"] .dialog-footer{padding:10px 16px}}

`

const STUDIO_V3_STYLES = ""



