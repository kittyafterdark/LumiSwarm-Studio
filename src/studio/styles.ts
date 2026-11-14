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
.ss-shell :is(.ss-pane-body,.ss-saved-style-editor,.ss-lora-grid,.ss-stack-list,.ss-history-grid,.ss-settings-content) { scrollbar-width: thin; scrollbar-color: #494457 transparent; }
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
.ss-shell .ss-output-actions .ss-button { font-size:10px; min-height:30px; padding:6px 9px; }
.ss-current-preview { position:relative; display:grid; place-items:center; min-height:0; min-width:0; overflow:hidden; border-radius:9px; border:1px solid var(--ss-outline); background:var(--ss-canvas-bg); contain:layout paint; cursor:zoom-in; }
.ss-current-preview > img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
.ss-preview-empty { display:grid; place-items:center; gap:7px; color:var(--ss-muted); text-align:center; padding:20px; font-size:11px; }
.ss-preview-empty strong { color:var(--ss-text); font-size:14px; }
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
.ss-settings-toggle { display:flex; justify-content:space-between; gap:13px; align-items:center; padding:11px; border:1px solid var(--ss-outline); border-radius:9px; background:var(--ss-panel-hi); cursor:pointer; }
.ss-settings-toggle-copy { display:grid; gap:3px; }
.ss-settings-toggle-copy strong { font-size:11px; }
.ss-settings-toggle-copy span { font-size:10px; color:#afa8bd; }
.ss-settings-toggle input { opacity:0; position:absolute; }
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
.ss-inspector { position:absolute; inset:0; z-index:100; display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,310px); gap:9px; padding:9px; background:var(--ss-canvas-bg); }
.ss-inspector-stage { position:relative; overflow:hidden; background:var(--ss-canvas-bg); display:grid; place-items:center; border-radius:12px; }
.ss-inspector-toolbar { position:absolute; top:12px; left:12px; display:flex; flex-wrap:wrap; gap:5px; z-index:10; }
.ss-inspector-image { max-width:100%; max-height:100%; object-fit:contain; }
.ss-inspector-details { min-height:0; overflow:auto; display:grid; align-content:start; gap:12px; padding:15px; border:1px solid var(--ss-outline); border-radius:12px; background:var(--ss-panel-bg); }
.ss-inspector-details-head { display:flex; align-items:start; justify-content:space-between; gap:8px; }
.ss-inspector-details-head h3 { margin:0; font-size:16px; }
.ss-inspector-facts { display:flex; flex-wrap:wrap; gap:5px; }
.ss-inspector-actions { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.ss-inspector-details h4 { margin:5px 0 0; font-size:11px; }
.ss-inspector-copy { margin:0; border:1px solid var(--ss-outline); background:var(--ss-header-bg); border-radius:8px; padding:10px; white-space:pre-wrap; overflow-wrap:anywhere; font-size:11px; }
.ss-inspector-path { font-size:10px; color:var(--ss-muted); overflow-wrap:anywhere; }
.ss-set-as-group { grid-column:1 / -1; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:center; gap:8px; padding:12px; border:1px solid var(--ss-outline); border-radius:10px; background:var(--ss-panel-hi); }
.ss-set-as-group .ss-set-as-label { grid-column:1 / -1; font-size:14px; font-weight:680; color:var(--ss-text); line-height:1.4; }
.ss-set-as-group .ss-button { min-height:40px; font-size:14px; line-height:1.4; }
/* Output Library | independent fixed-size thumbnails, virtual folder previews, and scrollable pages. */
.ss-output-library {
  position:absolute; inset:0; z-index:110;
  display:grid; grid-template-rows:auto minmax(0,1fr);
  min-width:0; min-height:0; overflow:hidden;
  background:var(--ss-canvas-bg); color:var(--ss-text);
}
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
.ss-library-selection-count { color:var(--ss-muted); font-size:11px; white-space:nowrap; }
.ss-library-nonstarred { display:inline-flex; align-items:center; gap:6px; font-size:11px; color:var(--ss-muted); white-space:nowrap; }
.ss-library-nonstarred input { margin:0; }
.ss-library-selection-actions { margin-left:auto; display:flex; align-items:center; flex-wrap:wrap; gap:6px; }
.ss-output-library-grid {
  min-width:0; min-height:0; display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(190px,100%),1fr));
  grid-auto-rows:max-content; align-content:start;
  gap:clamp(8px,1.3vw,16px); padding:clamp(10px,1.8vw,24px);
  overflow-y:auto; overscroll-behavior:contain;
}
.ss-library-output {
  position:relative; align-self:start; min-width:0; overflow:hidden;
  border:1px solid var(--ss-outline); border-radius:10px;
  background:var(--ss-panel-hi);
}
.ss-library-output[data-selected='true'] { border-color:var(--ss-accent); box-shadow:0 0 0 2px var(--ss-accent-soft); }
.ss-library-output-button {
  appearance:none; width:100%; aspect-ratio:1; min-height:0;
  display:block; padding:0; border:0; border-radius:0;
  background:var(--ss-field-bg); overflow:hidden;
}
.ss-library-output-button img { display:block; width:100%; height:100%; min-height:0; object-fit:cover; }
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
.ss-library-look-copy strong { font-size:11px; }
.ss-library-look-active { color:var(--ss-accent); font-weight:740; font-size:9px; }
.ss-library-look-count { color:var(--ss-accent); white-space:nowrap; font-size:9px; letter-spacing:0; }
.ss-lookbook-new { width:100%; flex:none; margin-top:5px; }
.ss-lookbook-editor { display:grid; grid-template-rows:minmax(0,1fr); min-height:0; min-width:0; overflow:hidden; }
.ss-library-visual-body { min-height:0; min-width:0; display:grid; align-content:start; gap:15px; overflow-y:auto; padding:18px 20px; }
.ss-library-visual-section { min-width:0; display:grid; gap:13px; padding:0; border:0; background:transparent; }
.ss-library-visual-section-title { display:flex; align-items:center; justify-content:space-between; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--ss-outline); }
.ss-library-visual-section-title > div { display:grid; gap:4px; }
.ss-library-visual-section-title strong { font-size:17px; letter-spacing:-.025em; }
.ss-library-visual-prompts,.ss-library-visual-options,.ss-library-look-editor-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
/* Inherited render fields become a compact inspector, not six full-width rows. */
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
.ss-shell[data-studio-view='styles'] .ss-commandbar .ss-generate { display:none; }
/* Mobile navigation remains the same six persistent panes; no duplicated input state. */
@media (max-width: 1080px) and (min-width:721px) {
  .ss-shell { --ss-generation-width: 316px; --ss-history-width: 212px; }
  .ss-topbar { gap:8px; padding-inline:11px; }
  .ss-workspace { padding:7px; }
  .ss-output-stage-head { flex-wrap:wrap; }
  .ss-style-column { padding:9px; }
}
@media (max-width: 720px) {
  .ss-shell, .ss-shell.ss-fullscreen-layer {
    position: fixed; inset: max(var(--studio-safe-top),var(--ss-modal-viewport-top,0px)) 0 0;
    width:100vw;
    height:calc(var(--ss-modal-viewport-height,100dvh) - max(0px,calc(var(--studio-safe-top) - var(--ss-modal-viewport-top,0px))));
    min-height:0; overflow:hidden; border-radius:0;
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
  .ss-shell:not([data-mobile-tab='create']) .ss-commandbar .ss-generate { display:none; }
  .ss-shell[data-mobile-tab='create'] .ss-commandbar .ss-generate { display:inline-flex; }
  .ss-inspector { grid-template-columns:1fr; grid-template-rows:minmax(230px,1fr) minmax(200px,45%); padding:6px; }
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
  .ss-settings-dialog { width:100vw; height:100%; border-radius:0; }
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
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action] {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 2;
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #b994ff) 45%, var(--lumiverse-border, #35313f));
    border-radius: 999px;
    background: color-mix(in srgb, var(--lumiverse-fill, #111116) 88%, transparent);
    color: var(--lumiverse-text, #f5f5f7);
    box-shadow: 0 4px 18px rgba(0,0,0,.38);
    backdrop-filter: blur(8px);
    opacity: 0;
    transform: translateY(-3px);
    transition: opacity .14s ease, transform .14s ease, border-color .14s ease;
    cursor: pointer;
    user-select: none;
  }
  figure[data-swarm-studio-image="true"]:hover > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"]:focus-within > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"][data-state="generating"] > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"][data-state="queued"] > [data-swarm-studio-inline-action] { opacity: 1; transform: translateY(0); }
  figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action]:hover { border-color: var(--lumiverse-accent, #b994ff); }
  figure[data-swarm-studio-image="true"][data-state="generating"] > [data-swarm-studio-inline-action],
  figure[data-swarm-studio-image="true"][data-state="queued"] > [data-swarm-studio-inline-action] { animation: ss-inline-spin 1s linear infinite; }
  @keyframes ss-inline-spin { to { rotate: 1turn; } }
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
  .ss-mini-preview { position:relative; display:grid; place-items:center; flex:0 0 40px; width:40px; height:40px; overflow:hidden; border:1px solid color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 55%,var(--lumiverse-border,#393343)); border-radius:50%; background:var(--lumiverse-fill-subtle,#29252f); color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); cursor:pointer; touch-action:none; }
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
  .ss-miniplayer[data-collapsed='true'] :is(.ss-mini-actions,.ss-mini-quick) { display:none; }
  .ss-mini-copy { display:none; }
  .ss-miniplayer[data-quick-view='rail'][data-collapsed='false'] { padding:6px; gap:5px; justify-content:center; border-radius:20px; }
  .ss-miniplayer[data-quick-view='rail'][data-collapsed='false'] .ss-mini-preview { flex:0 0 49px; width:49px; height:49px; }
  /* Desktop rail: portrait ABOVE the actions, matching the approved doctype. */
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] { flex-direction:column; align-items:center; justify-content:flex-start; padding:8px 7px; gap:8px; border-radius:18px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-preview { flex:0 0 45px; width:45px; height:45px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-actions { flex-direction:column; align-items:center; gap:8px; width:100%; }
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-button { width:44px; height:41px; flex:0 0 41px; border-radius:10px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-button:nth-child(2) { position:relative; margin-top:8px; }
  .ss-miniplayer[data-rail-layout='vertical'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-button:nth-child(2)::before { content:''; position:absolute; top:-9px; left:2px; right:2px; height:1px; background:var(--lumiverse-border,#413c4b); pointer-events:none; }
  /* Narrow screens retain the horizontal hand-friendly rail. */
  .ss-miniplayer[data-rail-layout='horizontal'][data-quick-view='rail'][data-collapsed='false'] .ss-mini-button { width:35px; height:35px; flex-basis:35px; }
  .ss-mini-actions { display:flex; align-items:center; gap:5px; min-width:0; }
  .ss-mini-button { display:grid; place-items:center; width:38px; height:38px; flex:0 0 38px; padding:0; border:1px solid var(--lumiverse-border,#413c4b); border-radius:10px; background:var(--lumiverse-fill-subtle,#2c2835); color:var(--lumiverse-text,#ebe7f1); cursor:pointer; }
  .ss-mini-compose-cta { background:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); color:var(--lumiverse-accent-contrast,#201526); border-color:transparent; }
  .ss-mini-button:hover,.ss-mini-button:focus-visible { outline:0; border-color:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); box-shadow:0 0 0 2px color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 24%,transparent); }
  .ss-mini-button:disabled { opacity:.35; cursor:not-allowed; }
  .ss-mini-button svg { width:17px; height:17px; flex:none; fill:none; stroke:currentColor; }
  .ss-mini-button[hidden] { display:none; }
  .ss-miniplayer[data-quick-view='composer'][data-collapsed='false'] { display:block; padding:0; overflow:hidden; border-radius:16px; }
  .ss-miniplayer[data-quick-view='composer'][data-collapsed='false'] :is(.ss-mini-preview,.ss-mini-actions) { display:none; }
  .ss-mini-quick { display:none; width:100%; height:100%; min-height:0; min-width:0; }
  .ss-miniplayer[data-quick-view='composer'][data-collapsed='false'] .ss-mini-quick { display:grid; grid-template-rows:auto minmax(0,1fr) auto; }
  .ss-mini-quick-head { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:13px 13px 11px; border-bottom:1px solid var(--lumiverse-border,#413c4b); background:var(--lumiverse-fill-subtle,#292530); }
  .ss-mini-quick-head > div:first-child { display:grid; gap:4px; min-width:0; }
  .ss-mini-quick-head strong { font-size:14px; }
  .ss-mini-connection { color:var(--lumiverse-text-muted,#aba5b5); font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .ss-mini-connection::before { content:'●'; color:#72d6a3; font-size:8px; padding-right:5px; }
  .ss-mini-head-actions { display:flex; gap:5px; }
  .ss-mini-head-actions .ss-mini-button { width:29px; height:29px; flex-basis:29px; }
  .ss-mini-quick-body { display:flex; flex-direction:column; gap:12px; min-height:0; min-width:0; overflow:auto; padding:13px; scrollbar-width:thin; }
  .ss-mini-artwork { display:flex; align-items:center; gap:11px; padding:8px; border:1px solid var(--lumiverse-border,#413c4b); border-radius:11px; background:color-mix(in srgb,var(--lumiverse-fill,#1c1a24) 90%,black); }
  .ss-mini-artwork-thumb { flex:0 0 55px; width:55px; height:65px; display:grid; place-items:center; border-radius:8px; background:var(--lumiverse-fill-subtle,#292530); overflow:hidden; }
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
  .ss-miniplayer[data-negative-open='false'] .ss-mini-negative-toggle svg { transform:rotate(-90deg); }
  .ss-miniplayer[data-negative-open='false'] .ss-mini-negative-field { display:none; }
  .ss-mini-quick-hint { display:flex; align-items:center; gap:6px; color:var(--lumiverse-text-muted,#aba5b5); font-size:10px; text-transform:none; letter-spacing:normal; }
  .ss-mini-recipe-dot { flex:0 0 6px; width:6px; height:6px; border-radius:50%; background:#6fd49d; }
  .ss-mini-quick-actions { display:grid; grid-template-columns:minmax(0,.86fr) minmax(0,1.6fr); gap:8px; padding:11px 12px; border-top:1px solid var(--lumiverse-border,#413c4b); }
  .ss-mini-append-compose,.ss-mini-generate { min-height:36px; display:flex; justify-content:center; align-items:center; gap:6px; padding:7px; border-radius:9px; font-size:10px; font-weight:750; cursor:pointer; }
  .ss-mini-append-compose { border:1px solid var(--lumiverse-border,#413c4b); background:var(--lumiverse-fill-subtle,#292530); color:var(--lumiverse-text,#efedf5); }
  .ss-mini-generate { border:1px solid var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); background:var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)); color:var(--lumiverse-accent-contrast,#201526); }
  .ss-mini-append-compose:disabled,.ss-mini-generate:disabled { opacity:.42; cursor:not-allowed; }
  .ss-mini-generate[data-running='true'] { background:#a83244; border-color:#d9526a; color:white; }
  .ss-mini-append-compose svg,.ss-mini-generate svg { width:16px; height:16px; flex:none; fill:none; stroke:currentColor; }
  .ss-mini-context-menu { position:fixed; z-index:2147483000; display:grid; gap:3px; width:min(228px,calc(100vw - 16px)); padding:7px; border:1px solid var(--lumiverse-border,#554b62); border-radius:13px; color:var(--lumiverse-text,#efedf5); background:var(--lumiverse-fill,#211c29); box-shadow:0 17px 46px #000d; pointer-events:auto; font:11px/1.3 Inter,ui-sans-serif,system-ui,sans-serif; }
  .ss-mini-context-menu[hidden] { display:none; }
  .ss-mini-context-action { display:flex; align-items:center; gap:9px; min-height:36px; padding:7px 9px; border:0; border-radius:8px; background:transparent; color:inherit; font:600 11px/1.25 Inter,ui-sans-serif,system-ui,sans-serif; text-align:left; cursor:pointer; }
  .ss-mini-context-action:hover,.ss-mini-context-action:focus-visible { outline:0; background:color-mix(in srgb,var(--lumiverse-accent,var(--lumiverse-primary,#bfa6ef)) 15%,transparent); }
  .ss-mini-context-action:disabled { opacity:.35; cursor:not-allowed; }
  .ss-mini-context-action svg { width:15px; height:15px; flex:none; fill:none; stroke:currentColor; }
  .ss-mini-context-separator { height:1px; margin:2px 4px; background:var(--lumiverse-border,#554b62); }
  @media(max-width:360px) { .ss-mini-quick-body { padding:10px; gap:10px; } .ss-mini-quick-head { padding:11px; } }

`

const STUDIO_V3_STYLES = ""
