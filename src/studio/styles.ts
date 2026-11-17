const STYLES = `
/* Swarm Studio | authored surface v6.
   Replaces the original Studio cascade. One definition per component; no appended override stratum.
   Auxiliary launcher, inline-image and mini-player components are isolated below. */
 .ss-shell {
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
.ss-shell :is(button, input, select, textarea) { font: inherit; color: inherit; }
.ss-shell button { cursor: pointer; }
.ss-shell button:disabled { opacity: .38; cursor: not-allowed; }
.ss-shell :is(button, input, select, textarea, summary):focus-visible { outline: 2px solid var(--ss-violet); outline-offset: 2px; }
.ss-shell :is(input,select,textarea) { min-width: 0; }
.ss-shell :is(.ss-button,.ss-icon-button,.ss-input,.ss-select,.ss-textarea) { border-radius: var(--ss-control-radius); }
.ss-shell .ss-button,
.ss-shell .ss-icon-button {
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
.ss-shell :is(.ss-button,.ss-icon-button):hover:not(:disabled) { color: var(--ss-button-ink); background: var(--ss-button-hover); border-color: var(--ss-accent-line); }
.ss-shell .ss-button-primary { background: var(--ss-primary-bg); border-color: color-mix(in srgb, var(--ss-primary-bg) 55%, var(--ss-outline)); color: var(--ss-primary-ink); font-weight: 700; }
.ss-shell .ss-button-primary:hover:not(:disabled) { background: var(--ss-primary-hover); color: var(--ss-primary-ink); }
.ss-shell .ss-button-danger { color: #e6a5b4; }
.ss-shell .ss-icon-button { width: 34px; padding: 7px; flex: none; }
/* Line icons are stroke-only by default. Filled logos/carets explicitly opt in via fill attributes or component rules. */
.ss-shell svg { width: 16px; height: 16px; flex: 0 0 auto; }
.ss-shell svg:not([fill]) { fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
.ss-shell .ss-field, .ss-shell .ss-saved-style-editor label { display: grid; gap: 7px; min-width: 0; align-content: start; }
.ss-shell .ss-field > label, .ss-shell .ss-field > span:first-child,
.ss-shell .ss-saved-style-editor label, .ss-shell .ss-eyebrow {
  color: var(--ss-muted); font-size: 10px; font-weight: 750; text-transform: uppercase; letter-spacing: .055em;
}
.ss-shell .ss-input,.ss-shell .ss-select,.ss-shell .ss-textarea {
  width: 100%; min-height: 36px; padding: 8px 10px;
  background: var(--ss-field-bg); color: var(--ss-text);
  border: 1px solid var(--ss-outline); outline: none; font-size: 12px;
}
.ss-shell :is(.ss-input,.ss-select,.ss-textarea):focus { border-color: var(--ss-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ss-accent) 19%, transparent); }
.ss-shell .ss-textarea { min-height: 66px; resize: vertical; line-height: 1.5; }
.ss-shell .ss-select { padding-right: 24px; }
.ss-shell .ss-select option { background: var(--ss-panel-bg); color: var(--ss-text); }
.ss-shell input[type='checkbox'],.ss-shell input[type='radio'] { accent-color: var(--ss-accent); }
.ss-shell input[type='range'] { width: 100%; min-width: 0; accent-color: var(--ss-accent); cursor: pointer; }
.ss-shell :is(.ss-muted,.ss-field-help,.ss-tiny) { color: var(--ss-dim); }
.ss-shell .ss-tiny { font-size: 10px; }
.ss-shell .ss-field-help { font-size: 10px; line-height: 1.5; }
.ss-shell .ss-empty { padding: 20px 12px; color: var(--ss-dim); font-size: 12px; text-align: center; }
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
.ss-view-nav { display: flex; gap: 20px; align-items: center; flex: 0 0 auto; height: 44px; padding: 0 19px; border-bottom: 1px solid var(--ss-border-subtle); background: var(--ss-canvas-bg); }
.ss-view-nav .ss-button { height: 100%; min-height: 0; background: transparent; border: 0; border-bottom: 2px solid transparent; border-radius: 0; font-size: 12px; font-weight: 700; padding: 0 6px; color: var(--ss-muted); }
.ss-view-nav .ss-button[aria-current='page'] { color: var(--ss-accent); border-bottom-color: var(--ss-accent); }
.ss-view-nav .ss-button:hover { background: transparent; }
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
.ss-settings-tab svg { fill:none; stroke:currentColor; }
.ss-settings-content { flex:1; overflow:auto; padding:17px; }
.ss-settings-panel { display:grid; gap:16px; align-content:start; }
.ss-config-section { display:grid; gap:10px; padding:15px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-hi); }
.ss-config-section-head { display:grid; gap:3px; }
.ss-config-section-head strong { font-size:12px; }
.ss-config-section-head span { color:var(--ss-muted); font-size:10px; }
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
.ss-protocol-editor { min-height:250px; font:11px/1.5 ui-monospace,monospace; }
.ss-config-actions,.ss-protocol-actions,.ss-character-tags-actions { display:flex; justify-content:flex-end; gap:7px; flex-wrap:wrap; }
.ss-css-guide,.ss-style-recipe,.ss-workflow-group { background:var(--ss-panel-hi); border:1px solid var(--ss-outline); border-radius:10px; }
.ss-css-guide > summary,.ss-workflow-group > summary { cursor:pointer; padding:10px; font-weight:650; color:var(--ss-text); }
.ss-css-guide pre { padding:12px; margin:0; overflow:auto; white-space:pre-wrap; font-size:10px; }
.ss-macro-guide-grid { display:grid; grid-template-columns:max-content minmax(0,1fr); gap:9px; padding:10px; font-size:10px; }
.ss-tag-protocol-example { border:1px dashed #675676; border-radius:8px; padding:10px; font-size:10px; overflow:auto; }
.ss-workflow-modal { position:absolute; inset:0; z-index:120; display:grid; place-items:center; padding:14px; background:#09090cca; backdrop-filter:blur(6px); }
.ss-workflow-modal:is([data-role="move-folder-modal"], [data-role="new-folder-modal"]) { z-index: 2147483200; }
.ss-workflow-modal-card { width:min(650px,100%); max-height:90%; overflow:auto; display:grid; gap:12px; padding:17px; border:1px solid var(--ss-outline); background:var(--ss-panel-bg); border-radius:14px; box-shadow:0 18px 70px #000b; }
.ss-workflow-modal-head { display:flex; justify-content:space-between; align-items:start; gap:10px; }
.ss-workflow-modal-title { display:grid; gap:4px; }
.ss-workflow-modal-title strong { font-size:16px; }
.ss-workflow-modal-description { color:var(--ss-muted); font-size:11px; }
.ss-workflow-modal-actions { display:flex; justify-content:flex-end; gap:8px; }
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
.ss-inspector-actions { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; margin-top:15px; }
.ss-inspector-actions .ss-button { min-width:0; font-size:10px; padding:9px 5px; }
.ss-inspector-actions [data-action='edit-region'] { grid-column:1/-1; min-height:39px; font-size:12px; }
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
  .ss-inspector-actions { margin-top:6px; grid-template-columns:repeat(4,1fr); }
  .ss-inspector-actions [data-action='edit-region'] { grid-column:1/-1; min-height:32px; }
  .ss-inspector-actions .ss-button { min-height:29px; padding:5px; }
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
.ss-output-library:is([data-picker='reference'],[data-picker='saved'],[data-picker='replace']) .ss-library-folder-actions > :not([data-action='toggle-library-search'],[data-action='cycle-library-preview']),
.ss-output-library:is([data-picker='reference'],[data-picker='saved']) .ss-library-breadcrumb { display:none; }
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
.ss-expression-dialog,.ss-expression-picker {
  position:fixed; inset:var(--app-interactive-safe-top,0px) 0 0; margin:0; padding:0; border:0;
  width:var(--app-scaled-viewport-width,100vw); height:var(--app-interactive-viewport-height,var(--app-scaled-viewport-height,100dvh));
  max-width:none; max-height:none; color:var(--ss-text); background:var(--ss-panel-bg);
}
.ss-expression-dialog[open] { display:grid; grid-template-rows:auto auto minmax(0,1fr) auto; }
.ss-expression-dialog::backdrop,.ss-expression-picker::backdrop { background:#0a0912c9; }
.ss-expression-header,.ss-expression-footer,.ss-expression-steps { padding:10px clamp(12px,3vw,32px); background:var(--ss-header-bg); }
.ss-expression-header,.ss-expression-footer { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.ss-expression-header { justify-content:space-between; border-bottom:1px solid var(--ss-outline); }
.ss-expression-header h2 { margin:0; font-size:17px; }
.ss-expression-steps {
  --ss-expression-step-gap:10px;
  display:grid; grid-template-columns:repeat(4,minmax(0,180px)); gap:var(--ss-expression-step-gap);
  border-bottom:1px solid var(--ss-outline);
}
.ss-expression-steps .ss-expression-step {
  position:relative; display:flex; align-items:center; gap:7px; min-width:0;
  padding:7px 9px; text-align:left; white-space:normal; line-height:1.2;
}
.ss-expression-step:not(:last-child)::after {
  content:""; position:absolute; inset-inline-start:calc(100% + 1px); inset-block-start:50%;
  width:var(--ss-expression-step-gap); border-top:1px solid var(--ss-outline); pointer-events:none;
}
.ss-expression-step-number {
  display:grid; place-items:center; flex:none; width:24px; height:24px;
  border:1px solid var(--ss-outline); border-radius:50%; background:var(--ss-field-bg); font-weight:700;
}
.ss-expression-steps [aria-current="step"] { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-accent-soft); font-weight:700; }
.ss-expression-step[aria-current="step"] .ss-expression-step-number {
  color:var(--ss-primary-ink); background:var(--ss-primary-bg); border-color:var(--ss-primary-bg);
}
.ss-expression-scroll { overflow:auto; scrollbar-gutter:stable; padding:14px clamp(12px,3vw,32px); }
.ss-expression-controls,.ss-expression-actions,.ss-expression-toolbar,.ss-expression-sources,.ss-expression-custom,.ss-expression-presets {
  display:flex; flex-wrap:wrap; align-items:center; gap:8px;
}
.ss-expression-controls { margin-bottom:14px; align-items:start; }
.ss-expression-controls > label,.ss-expression-sources > .ss-field { flex:1 1 180px; max-width:400px; }
.ss-expression-toolbar,.ss-expression-sources,.ss-expression-settings,.ss-expression-custom { width:100%; min-width:0; }
.ss-expression-toolbar { padding-bottom:10px; border-bottom:1px solid var(--ss-outline); }
.ss-expression-toolbar .ss-muted { font-size:11px; }
.ss-expression-presets { gap:4px; padding:3px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-field-bg); }
.ss-expression-presets .ss-button { border-color:transparent; background:transparent; }
.ss-expression-presets [aria-pressed="true"] { color:var(--ss-accent); border-color:var(--ss-accent-line); background:var(--ss-accent-soft); }
.ss-expression-custom { align-items:end; }
.ss-expression-sources { align-items:start; gap:12px; }
.ss-expression-sources > p { align-self:center; overflow-wrap:anywhere; padding:6px 0; }
.ss-expression-reference { grid-template-columns:minmax(0,1fr) auto; }
.ss-expression-reference > span { grid-column:1/-1; }
.ss-expression-reference .ss-expression-reference-button { display:flex; gap:9px; min-width:0; align-items:center; text-align:left; }
.ss-expression-reference-picture {
  display:grid; place-items:center; width:34px; height:34px; flex:none;
  border:1px solid var(--ss-outline); border-radius:6px; overflow:hidden; background:var(--ss-field-bg); color:var(--ss-accent);
}
.ss-expression-reference-picture img { width:100%; height:100%; object-fit:cover; }
.ss-expression-reference-picture svg { width:17px; height:17px; fill:none; stroke:currentColor; stroke-width:1.6; }
.ss-expression-reference-copy { min-width:0; display:grid; gap:2px; white-space:normal; }
.ss-expression-reference-copy small { color:var(--ss-muted); font-weight:400; }
.ss-expression-reference > .ss-button:last-child:not(.ss-expression-reference-button) { align-self:center; }
.ss-expression-custom > label { flex:1 1 136px; max-width:260px; }
.ss-expression-controls > .ss-expression-background-graph { flex:1 1 390px; max-width:660px; }
.ss-expression-background-graph .ss-textarea { width:100%; min-width:0; font-family:ui-monospace,monospace; }
.ss-expression-model-setup {
  flex:1 1 350px; max-width:580px; min-width:0; display:grid; gap:7px;
  padding:10px 12px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-field-bg);
}
.ss-expression-model-details:not([hidden]) { display:grid; gap:7px; }
.ss-expression-model-actions { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.ss-expression-model-actions a { display:inline-flex; align-items:center; text-decoration:none; }
.ss-expression-settings { border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-hi); }
.ss-expression-settings > summary {
  list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:10px 12px; border-radius:inherit; font-weight:650;
}
.ss-expression-settings > summary::-webkit-details-marker { display:none; }
.ss-expression-settings > summary::after {
  content:""; width:6px; height:6px; margin-right:4px;
  border:solid var(--ss-muted); border-width:0 1.5px 1.5px 0; transform:rotate(45deg);
}
.ss-expression-settings[open] > summary::after { transform:rotate(225deg); }
.ss-expression-settings-fields { display:grid; grid-template-columns:minmax(0,1fr); align-items:start; gap:12px; padding:12px; border-top:1px solid var(--ss-outline); }
.ss-expression-settings-fields > p { grid-column:1/-1; }
.ss-expression-canvas {
  display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:12px; padding:10px;
  box-sizing:border-box; width:fit-content; max-width:100%; min-width:0;
  border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-field-bg);
}
.ss-expression-canvas-preview {
  display:grid; place-items:center; gap:6px; min-width:96px; padding:8px;
  color:var(--ss-muted); font-size:11px; font-variant-numeric:tabular-nums;
}
.ss-expression-canvas-shape { box-sizing:border-box; border:1px solid var(--ss-accent-line); border-radius:3px; background:var(--ss-accent-soft); }
.ss-expression-canvas-controls { display:grid; gap:8px; min-width:0; }
.ss-expression-canvas-controls h3 { margin:0; font-size:12px; }
.ss-expression-canvas-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.ss-expression-axis { display:grid; grid-template-columns:42px minmax(0,1fr) 74px; align-items:center; gap:8px; }
.ss-expression-axis span { color:var(--ss-muted); font-size:11px; }
.ss-expression-axis input[type='range'] { margin:0; }
@media (max-width:600px) {
  .ss-expression-steps { --ss-expression-step-gap:6px; }
  .ss-expression-steps .ss-expression-step { flex-direction:column; padding:6px 4px; text-align:center; }
  .ss-expression-step:not(:last-child)::after { inset-block-start:18px; }
  .ss-expression-canvas { grid-template-columns:minmax(0,1fr); gap:6px; }
  .ss-expression-canvas-preview { grid-row:2; grid-auto-flow:column; justify-content:start; min-width:0; padding:0; }
  .ss-expression-sources > .ss-field { flex-basis:100%; }
  .ss-expression-reference { grid-template-columns:minmax(0,1fr); }
  .ss-expression-reference > .ss-button:last-child:not(.ss-expression-reference-button) { justify-self:start; }
}
.ss-expression-render-fields { display:grid; gap:10px; min-width:0; container:expression-render / inline-size; }
.ss-expression-parameters,.ss-expression-prompts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.ss-expression-prompts { grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr)); }
@container expression-render (min-width:560px) {
  .ss-expression-parameters { grid-template-columns:repeat(4,minmax(0,1fr)); }
}
@media (min-width:980px) {
  .ss-expression-settings-fields { grid-template-columns:fit-content(66%) minmax(0,1fr); }
}
.ss-expression-settings :is(.ss-input,.ss-select,.ss-textarea),.ss-expression-custom .ss-input { width:100%; min-width:0; }
.ss-expression-controls p,.ss-expression-footer p { margin:0; color:var(--ss-muted); }
.ss-expression-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr)); gap:12px; }
.ss-expression-card { min-width:0; display:grid; gap:8px; align-content:start; padding:10px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-hi); }
.ss-expression-select { display:flex; align-items:center; gap:8px; font-weight:650; text-transform:capitalize; overflow-wrap:anywhere; }
.ss-expression-select input { accent-color:var(--ss-accent); flex:none; }
.ss-expression-preview { position:relative; aspect-ratio:1; display:grid; place-items:center; min-width:0; overflow:hidden; border-radius:8px; color:var(--ss-muted); background:var(--ss-canvas-bg); }
.ss-expression-preview img { width:100%; height:100%; min-height:0; object-fit:contain; }
.ss-expression-tile-feedback {
  position:absolute; inset:auto 8px 8px; display:grid; gap:6px; padding:8px;
  border:1px solid var(--ss-outline); border-radius:8px; background:var(--ss-panel-hi); color:var(--ss-text); font-size:11px;
}
.ss-expression-tile-feedback progress { width:100%; height:6px; accent-color:var(--ss-accent); }
.ss-expression-slot-actions { display:flex; gap:6px; flex-wrap:wrap; }
.ss-expression-slot-actions .ss-button { flex:1; }
.ss-expression-card :is(.ss-select,.ss-textarea) { width:100%; min-width:0; }
.ss-expression-footer { justify-content:space-between; border-top:1px solid var(--ss-outline); padding-bottom:max(10px,env(safe-area-inset-bottom,0px)); }
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
  .ss-view-nav { display:none; }
  .ss-mobile-tabs { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:3px; padding:7px 7px 6px; min-height:47px; flex:none; border-bottom:1px solid var(--ss-border-subtle); background:var(--ss-header-bg); }
  .ss-mobile-tabs .ss-mobile-tab { min-width:0; min-height:31px; padding:6px 1px; background:transparent; border:1px solid transparent; border-radius:7px; color:var(--ss-muted); font-size:10px; font-weight:700; white-space:nowrap; }
  .ss-mobile-tabs .ss-mobile-tab[data-active='true'] { background:var(--ss-accent-soft); color:var(--ss-text); border-color:var(--ss-accent-line); }
  .ss-workspace { display:flex; flex-direction:column; overflow-y:auto; overflow-x:hidden; flex:1 1 0; padding:0 10px 66px; gap:0; }
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
  .ss-styles-workspace { display:block; flex:1 1 0; padding:0 10px 66px; overflow-y:auto; }
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
  .ss-commandbar { display:flex; position:absolute; z-index:65; bottom:0; left:0; right:0; padding:9px 12px calc(9px + env(safe-area-inset-bottom,0px)); background:color-mix(in srgb,var(--ss-header-bg) 94%,transparent); backdrop-filter:blur(12px); box-shadow:0 -7px 20px #0005; }
  .ss-commandbar .ss-generate { flex:1; min-height:38px; }
  .ss-shell:not([data-mobile-tab='create'],[data-mobile-tab='generation'],[data-mobile-tab='style'],[data-mobile-tab='stack']) .ss-commandbar { display:none; }
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
  .ss-launcher {
    --ss-canvas-bg: var(--lumiverse-bg, #090a0d);
    --ss-panel-bg: var(--lumiverse-fill-subtle, #14151a);
    --ss-header-bg: color-mix(in srgb, var(--lumiverse-primary, #7dd3fc) 9%, var(--ss-panel-bg));
    --ss-outline: var(--lumiverse-border, #30323a);
    --ss-button-bg: var(--lumiverse-fill-subtle, #17181e);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-height: clamp(520px, calc(100dvh - 118px), 920px);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 12px;
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
  .ss-launcher-actions .ss-launcher-visuals-button svg,
  .ss-chat-visuals-page svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-launcher[data-page="visuals"] .ss-launcher-center { display: none; }
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
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 4px;
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
  .ss-chat-visuals-footer {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--ss-outline);
  }
  .ss-chat-visuals-footer .ss-button { flex: 1; }
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
  .ss-host-visual-canon-shell, .ss-visual-lore-shell { display: grid; gap: 14px; padding: 16px; min-height: 0; }
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
  .ss-host-look-form, .ss-visual-lore-form { display: grid; gap: 10px; padding: 14px; border: 1px solid var(--lumiverse-border, rgba(255,255,255,.12)); border-radius: 12px; background: var(--lumiverse-surface, rgba(255,255,255,.025)); }
  .ss-host-continuity-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ss-visual-lore-toolbar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .ss-visual-lore-workspace { display: grid; grid-template-columns: minmax(220px, .75fr) minmax(320px, 1.25fr); gap: 12px; min-height: 0; }
  .ss-chat-visuals-page .ss-visual-lore-shell { padding: 0; }
  .ss-chat-visuals-page .ss-visual-lore-workspace { grid-template-columns: 1fr; }
  .ss-visual-lore-state {
    min-height: 260px; display: grid; place-items: center; align-content: center; gap: 9px; padding: 24px;
    border: 1px dashed var(--lumiverse-border, rgba(255,255,255,.14)); border-radius: 12px;
    color: var(--lumiverse-text-muted); text-align: center;
  }
  .ss-visual-lore-state svg { width: 34px; height: 34px; color: var(--lumiverse-accent, #a78bfa); }
  .ss-visual-lore-state strong { color: var(--lumiverse-text); }
  .ss-visual-lore-state span { max-width: 360px; font-size: 10px; line-height: 1.45; }
  .ss-visual-lore-state[data-error="true"] svg { color: #fb7185; }
  .ss-visual-lore-directory { display: grid; gap: 12px; padding: 10px; border: 1px solid var(--lumiverse-border, rgba(255,255,255,.12)); border-radius: 12px; }
  .ss-visual-lore-group { display: grid; gap: 6px; }
  .ss-visual-lore-group-title { padding: 2px 4px; color: var(--lumiverse-text-muted); font-size: 8px; letter-spacing: .08em; text-transform: uppercase; }
  .ss-visual-lore-entry {
    min-width: 0; display: grid; grid-template-columns: 18px minmax(0, 1fr); align-items: center; gap: 8px;
    padding: 8px; border: 1px solid transparent; border-radius: 9px; color: inherit; background: transparent; text-align: left; cursor: pointer;
  }
  .ss-visual-lore-entry:hover { background: var(--lumiverse-fill, rgba(255,255,255,.04)); }
  .ss-visual-lore-entry[data-selected="true"] { border-color: color-mix(in srgb, var(--lumiverse-accent, #a78bfa) 48%, transparent); background: color-mix(in srgb, var(--lumiverse-accent, #a78bfa) 10%, transparent); }
  .ss-visual-lore-entry[data-activated="true"] .ss-visual-lore-mark { color: #8ee6b0; }
  .ss-visual-lore-mark { color: var(--lumiverse-accent, #a78bfa); }
  .ss-visual-lore-entry-copy { min-width: 0; display: grid; gap: 2px; }
  .ss-visual-lore-entry-copy > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-visual-lore-selection-head { display: flex; justify-content: space-between; gap: 8px; }
  .ss-visual-lore-selection-head > div { display: grid; gap: 2px; }
  .ss-visual-lore-form .ss-field small { color: var(--lumiverse-text-muted); font-size: 8px; line-height: 1.35; }
  .ss-look-editor-section { border-color: color-mix(in srgb, var(--lumiverse-primary, #a78bfa) 32%, var(--lumiverse-border, transparent)); }
  @media (max-width: 720px) {
    .ss-visual-lore-toolbar, .ss-visual-lore-workspace { grid-template-columns: 1fr; }
    .ss-chat-visuals-grid { grid-template-columns: 1fr; }
    .ss-chat-visuals-row { align-items: stretch; }
    .ss-chat-visuals-field .ss-select { font-size: 9px; }
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
  .ss-mini-easel { position:fixed; z-index:9979; display:flex; flex-direction:column; width:390px; height:550px; min-width:240px; min-height:270px; box-sizing:border-box; overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 90%,var(--lumiverse-accent,#aba5fa)); border-radius:14px; background:linear-gradient(var(--lumiverse-fill,transparent),var(--lumiverse-fill,transparent)),#111116; color:var(--lumiverse-text,#efedf5); box-shadow:0 22px 65px #000b,0 1px 0 #ffffff10 inset; font:11px/1.35 Inter,ui-sans-serif,system-ui,sans-serif; isolation:isolate; }
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
  .ss-mini-easel-stage { position:relative; flex:1; min-height:0; margin:7px 7px 0; display:grid; place-items:center; overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-border,#413c4b) 52%,transparent); border-radius:9px; background:#09080d; }
  .ss-mini-easel-stage img { width:100%; height:100%; object-fit:contain; object-position:center center; }
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

`

const STUDIO_V3_STYLES = ""
