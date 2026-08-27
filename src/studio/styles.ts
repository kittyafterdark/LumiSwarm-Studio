const STYLES = `
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
    background: color-mix(in srgb, var(--ss-panel-bg) var(--ss-surface-opacity), transparent);
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
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="lumiverse"],
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="custom"] {
    --lumiverse-accent: var(--lumiverse-primary, #7dd3fc);
  }
  .ss-shell {
    --ss-gap: 12px;
    width: 100%;
    height: min(790px, calc(100vh - 125px));
    min-height: 600px;
    display: flex;
    flex-direction: column;
    gap: var(--ss-gap);
    color: var(--lumiverse-text);
    overflow: hidden;
    font-size: 12px;
  }
  .ss-topbar {
    position: relative;
    z-index: 60;
    overflow: visible;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto auto;
    gap: 8px;
    align-items: center;
  }
  .ss-connection-wrap { position: relative; }
  .ss-connection-wrap::before {
    content: "";
    position: absolute;
    left: 11px;
    top: 50%;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ss-status-color, #f59e0b);
    transform: translateY(-50%);
    pointer-events: none;
  }
  .ss-connection { padding-left: 29px !important; }
  .ss-button,
  .ss-icon-button {
    appearance: none;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    background: var(--ss-button-bg, var(--lumiverse-fill-subtle));
    color: var(--lumiverse-text);
    border-radius: var(--lumiverse-radius, 8px);
    min-height: 34px;
    padding: 7px 12px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: border-color .15s ease, background .15s ease, transform .15s ease, opacity .15s ease;
  }
  .ss-button:hover:not(:disabled), .ss-icon-button:hover:not(:disabled) {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 68%, var(--ss-outline, var(--lumiverse-border)));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 14%, var(--ss-button-bg, var(--lumiverse-fill-subtle)));
  }
  .ss-button:active:not(:disabled), .ss-icon-button:active:not(:disabled) { transform: translateY(1px); }
  .ss-button:disabled, .ss-icon-button:disabled { cursor: not-allowed; opacity: .48; }
  .ss-button-primary {
    color: #08090d;
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 78%, white);
    border-color: transparent;
  }
  .ss-button-primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 86%, white);
    border-color: transparent;
  }
  .ss-button-danger { color: #ef7777; }
  .ss-generate.ss-button-danger {
    color: #fff;
    border-color: color-mix(in srgb, #ef4444 70%, var(--lumiverse-border));
    background: color-mix(in srgb, #ef4444 72%, var(--lumiverse-fill));
  }
  .ss-generate.ss-button-danger:hover:not(:disabled) {
    border-color: #fb7185;
    background: color-mix(in srgb, #ef4444 84%, var(--lumiverse-fill));
  }
  .ss-icon-button { min-width: 34px; padding: 6px 8px; }
  .ss-input, .ss-select, .ss-textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--lumiverse-radius, 8px);
    background: color-mix(in srgb, var(--ss-panel-bg, var(--lumiverse-fill)) 82%, #050608);
    color: var(--lumiverse-text);
    font: inherit;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  .ss-input, .ss-select { height: 34px; padding: 7px 9px; }
  .ss-textarea { padding: 9px 10px; resize: vertical; line-height: 1.45; min-height: 76px; }
  .ss-input:focus, .ss-select:focus, .ss-textarea:focus {
    border-color: var(--lumiverse-accent, #7dd3fc);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 18%, transparent);
  }
  .ss-workspace {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 306px;
    gap: var(--ss-gap);
    flex: 1;
  }
  .ss-editor {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding-right: 3px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ss-output {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-left: 1px solid var(--lumiverse-border);
    padding-left: 12px;
  }
  .ss-panel {
    border: 1px solid var(--lumiverse-border);
    background: color-mix(in srgb, var(--lumiverse-fill-subtle) 88%, transparent);
    border-radius: calc(var(--lumiverse-radius, 8px) * 1.1);
    padding: 10px;
  }
  .ss-section-head {
    min-height: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }
  .ss-section-title { display: flex; align-items: baseline; gap: 7px; min-width: 0; }
  .ss-section-title strong { font-size: 12px; letter-spacing: .01em; }
  .ss-muted { color: var(--lumiverse-text-muted); }
  .ss-dim { color: var(--lumiverse-text-dim, var(--lumiverse-text-muted)); }
  .ss-tiny { font-size: 10px; }
  .ss-prompt-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 8px; }
  .ss-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .ss-field > label { color: var(--lumiverse-text-muted); font-size: 10px; font-weight: 650; letter-spacing: .035em; text-transform: uppercase; }
  .ss-field-help { color: var(--lumiverse-text-dim, var(--lumiverse-text-muted)); font-size: 10px; min-height: 14px; margin-top: 5px; }
  .ss-controls-grid {
    display: grid;
    grid-template-columns: minmax(160px, 1.6fr) repeat(5, minmax(72px, .7fr));
    gap: 7px;
  }
  .ss-controls-grid .ss-model-field { grid-column: span 2; }
  .ss-controls-grid .ss-sampler-field, .ss-controls-grid .ss-scheduler-field { grid-column: span 2; }
  .ss-inline-actions { display: flex; gap: 6px; align-items: flex-end; }
  .ss-advanced {
    margin-top: 8px;
    border-top: 1px solid var(--lumiverse-border);
    padding-top: 7px;
  }
  .ss-advanced > summary, .ss-token-settings > summary {
    color: var(--lumiverse-text-muted);
    cursor: pointer;
    user-select: none;
    font-size: 11px;
    font-weight: 600;
  }
  .ss-advanced-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    margin-top: 9px;
    align-items: start;
  }
  .ss-advanced-grid .ss-wide { grid-column: 1 / -1; }
  .ss-advanced-grid > .ss-field:not(.ss-wide) > label {
    min-height: 24px;
    display: flex;
    align-items: flex-end;
  }
  .ss-library-tools {
    display: grid;
    grid-template-columns: minmax(150px, 1fr) 120px auto;
    gap: 7px;
    align-items: center;
  }
  .ss-library-status { margin: 7px 0 0; color: #e0a458; font-size: 10px; line-height: 1.4; }
  .ss-lora-grid {
    min-height: 132px;
    max-height: 315px;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(196px, 1fr));
    gap: 8px;
    padding: 1px 2px 2px 1px;
  }
  .ss-empty {
    grid-column: 1 / -1;
    min-height: 110px;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--lumiverse-text-muted);
    padding: 18px;
    border: 1px dashed var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
  }
  .ss-lora-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    background: var(--lumiverse-fill);
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr);
    min-height: 112px;
    transition: border-color .15s ease, transform .15s ease;
  }
  .ss-lora-card:hover { border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 52%, var(--lumiverse-border)); transform: translateY(-1px); }
  .ss-lora-preview {
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 12%, transparent), transparent),
      var(--lumiverse-fill-subtle);
  }
  .ss-lora-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ss-lora-placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: var(--lumiverse-text-dim, var(--lumiverse-text-muted)); font-size: 18px; }
  .ss-lora-body { min-width: 0; padding: 8px; display: flex; flex-direction: column; gap: 4px; }
  .ss-lora-title { font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ss-lora-author { font-size: 9px; color: var(--lumiverse-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ss-lora-desc {
    color: var(--lumiverse-text-muted);
    font-size: 9.5px;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 25px;
  }
  .ss-badges { display: flex; flex-wrap: wrap; gap: 3px; min-height: 16px; overflow: hidden; }
  .ss-badge {
    max-width: 100%;
    padding: 2px 5px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 10%, var(--lumiverse-fill-subtle));
    color: var(--lumiverse-text-muted);
    font-size: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ss-lora-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 5px; }
  .ss-weight-label { color: var(--lumiverse-text-muted); font-size: 9px; font-variant-numeric: tabular-nums; }
  .ss-add-button { min-height: 25px; padding: 3px 8px; font-size: 9.5px; }
  .ss-stack-list { display: flex; flex-direction: column; gap: 6px; }
  .ss-stack-row {
    display: grid;
    grid-template-columns: auto 34px minmax(125px, 1fr) 75px auto auto;
    align-items: center;
    gap: 7px;
    padding: 6px 7px;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    background: var(--lumiverse-fill);
  }
  .ss-stack-row[data-disabled="true"] { opacity: .58; }
  .ss-stack-preview {
    width: 34px;
    height: 34px;
    overflow: hidden;
    display: grid;
    place-items: center;
    border: 1px solid var(--lumiverse-border);
    border-radius: calc(var(--ss-control-radius, var(--lumiverse-radius, 8px)) * .8);
    color: var(--lumiverse-text-muted);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 8%, var(--lumiverse-fill-subtle));
    font-size: 12px;
  }
  .ss-stack-preview img { width: 100%; height: 100%; display: block; object-fit: cover; }
  .ss-stack-name { min-width: 0; }
  .ss-stack-name strong { display: block; font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ss-stack-name span { display: block; margin-top: 2px; color: var(--lumiverse-text-muted); font-size: 8.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ss-stack-weight { height: 29px; padding: 4px 6px; font-variant-numeric: tabular-nums; }
  .ss-trigger-toggle { display: flex; align-items: center; gap: 4px; color: var(--lumiverse-text-muted); font-size: 9px; white-space: nowrap; }
  .ss-stack-actions { display: flex; gap: 3px; }
  .ss-stack-actions .ss-icon-button { min-width: 27px; min-height: 27px; height: 27px; padding: 2px 5px; font-size: 10px; }
  .ss-generate-bar {
    position: sticky;
    bottom: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 0 1px;
    background: linear-gradient(transparent, var(--lumiverse-fill, rgba(18,18,22,.96)) 28%);
  }
  .ss-generate { min-height: 41px; min-width: 150px; font-size: 12px; }
  .ss-run-status { min-width: 0; flex: 1; color: var(--lumiverse-text-muted); font-size: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-current-preview {
    min-height: 240px;
    max-height: 410px;
    flex: 0 1 410px;
    position: relative;
    overflow: hidden;
    display: grid;
    place-items: center;
    border: 1px solid var(--lumiverse-border);
    border-radius: calc(var(--lumiverse-radius, 8px) * 1.15);
    background:
      radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 9%, transparent), transparent 50%),
      var(--lumiverse-fill-subtle);
  }
  .ss-current-preview img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .ss-current-preview img[hidden] { display: none !important; }
  .ss-favorite-button,
  .ss-library-favorite-selected {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .ss-favorite-button svg,
  .ss-library-favorite-selected svg,
  .ss-library-output-star svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-favorite-button[data-active="true"] {
    color: #ffd85e;
    border-color: color-mix(in srgb, #ffd85e 62%, var(--lumiverse-border));
    background: color-mix(in srgb, #ffd85e 12%, var(--lumiverse-fill));
  }
  .ss-favorite-button[data-active="true"] svg,
  .ss-library-output-star svg { fill: currentColor; }
  .ss-current-favorite {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 4;
    width: 34px;
    height: 34px;
    padding: 0;
    box-shadow: 0 5px 20px rgba(0,0,0,.34);
    backdrop-filter: blur(7px);
  }
  .ss-preview-empty { max-width: 190px; text-align: center; color: var(--lumiverse-text-muted); line-height: 1.55; }
  .ss-preview-empty strong { display: block; color: var(--lumiverse-text); margin-bottom: 5px; }
  .ss-preview-loading {
    position: absolute;
    inset: 0;
    display: none;
    place-items: end center;
    padding: 0 10% 16px;
    pointer-events: none;
    background: linear-gradient(transparent 58%, color-mix(in srgb, var(--lumiverse-fill) 78%, transparent));
  }
  .ss-preview-loading[data-visible="true"] { display: grid; }
  .ss-generation-progress {
    width: min(360px, 100%);
    display: grid;
    gap: 6px;
    padding: 9px 11px 8px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 35%, var(--lumiverse-border));
    border-radius: 10px;
    background: color-mix(in srgb, var(--lumiverse-fill) 91%, transparent);
    box-shadow: 0 8px 28px rgba(0,0,0,.38);
    backdrop-filter: blur(8px);
  }
  .ss-progress-track {
    height: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 13%, var(--lumiverse-fill-subtle));
  }
  .ss-progress-fill {
    display: block;
    width: var(--ss-progress, 0%);
    height: 100%;
    border-radius: inherit;
    background: var(--lumiverse-accent, #7dd3fc);
    box-shadow: 0 0 10px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 55%, transparent);
    transition: width .18s ease;
  }
  .ss-generation-progress[data-indeterminate="true"] .ss-progress-fill {
    width: 32%;
    animation: ss-progress-indeterminate 1.1s ease-in-out infinite;
  }
  .ss-progress-label {
    color: var(--lumiverse-text);
    font-size: 9.5px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  @keyframes ss-progress-indeterminate {
    0% { transform: translateX(-115%); }
    100% { transform: translateX(315%); }
  }
  .ss-output-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .ss-output-label { min-height: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9.5px; color: var(--lumiverse-text-muted); }
  .ss-history-head { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
  .ss-history-grid {
    min-height: 92px;
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-content: start;
    gap: 6px;
  }
  .ss-history-item {
    aspect-ratio: 1;
    overflow: hidden;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 7px);
    background: var(--lumiverse-fill-subtle);
    padding: 0;
    cursor: pointer;
  }
  .ss-history-item:hover { border-color: var(--lumiverse-accent, #7dd3fc); }
  .ss-history-item img { width: 100%; height: 100%; display: block; object-fit: cover; }
  .ss-token-popover {
    position: absolute;
    right: 0;
    top: 42px;
    z-index: 8;
    width: min(390px, calc(100vw - 52px));
    padding: 11px;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    background: var(--lumiverse-fill);
    box-shadow: 0 12px 38px rgba(0,0,0,.3);
  }
  .ss-config-wrap { position: relative; }
  .ss-config-button svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-settings-layer {
    position: absolute;
    inset: 0;
    z-index: 110;
    display: grid;
    place-items: center;
    padding: max(18px, env(safe-area-inset-top)) max(18px, env(safe-area-inset-right))
      max(18px, env(safe-area-inset-bottom)) max(18px, env(safe-area-inset-left));
  }
  .ss-settings-layer[hidden] { display: none; }
  .ss-settings-backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(0,0,0,.68);
    backdrop-filter: blur(7px);
  }
  .ss-settings-dialog {
    position: relative;
    width: min(1040px, calc(100% - 36px));
    height: min(760px, calc(100% - 36px));
    min-height: 460px;
    display: grid;
    grid-template-columns: 176px minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-panel-radius, var(--lumiverse-radius, 12px));
    background:
      linear-gradient(var(--ss-panel-bg, rgba(20,21,26,.98)), var(--ss-panel-bg, rgba(20,21,26,.98))),
      #090a0d;
    box-shadow: 0 28px 90px rgba(0,0,0,.72), inset 0 1px rgba(255,255,255,.04);
    backdrop-filter: blur(max(16px, var(--ss-backdrop-blur, 10px)));
  }
  .ss-settings-header {
    grid-column: 1 / -1;
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px 10px 18px;
    border-bottom: 1px solid var(--ss-outline, var(--lumiverse-border));
    background: color-mix(in srgb, var(--ss-header-bg, #13141a) 82%, transparent);
  }
  .ss-settings-title { display: grid; gap: 2px; }
  .ss-settings-title strong { font: 650 15px/1.1 Georgia, ui-serif, serif; }
  .ss-settings-title span { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-settings-tabs {
    min-width: 0;
    display: grid;
    align-content: start;
    gap: 5px;
    padding: 12px 9px;
    overflow-y: auto;
    border-right: 1px solid var(--ss-outline, var(--lumiverse-border));
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 76%, transparent);
  }
  .ss-settings-tab {
    width: 100%;
    min-height: 38px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: var(--ss-control-radius, 8px);
    background: transparent;
    color: var(--lumiverse-text-muted);
    font-size: 10px;
    text-align: left;
    cursor: pointer;
  }
  .ss-settings-tab svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-width: 1.7; }
  .ss-settings-tab:hover { color: var(--ss-text, var(--lumiverse-text)); background: color-mix(in srgb, var(--ss-button-bg, #171820) 72%, transparent); }
  .ss-settings-tab[data-active="true"] {
    color: var(--ss-text, var(--lumiverse-text));
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 34%, var(--ss-outline, var(--lumiverse-border)));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 13%, var(--ss-button-bg, #171820));
    box-shadow: inset 3px 0 var(--lumiverse-accent, #7dd3fc);
  }
  .ss-settings-content {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 18px 24px;
  }
  .ss-settings-panel { display: grid; align-content: start; gap: 14px; }
  .ss-settings-panel[hidden] { display: none; }
  .ss-config-section {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-panel-radius, var(--lumiverse-radius, 10px));
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 62%, transparent);
  }
  .ss-config-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .ss-config-section-head strong { font-size: 11px; }
  .ss-config-section-head span { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-settings-toggle {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 11px;
    border: 1px solid color-mix(in srgb, var(--ss-outline, var(--lumiverse-border)) 82%, transparent);
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-header-bg, #13141a) 52%, transparent);
    cursor: pointer;
  }
  .ss-settings-toggle-copy { min-width: 0; display: grid; gap: 4px; }
  .ss-settings-toggle-copy strong { color: var(--ss-text, var(--lumiverse-text)); font-size: 10px; }
  .ss-settings-toggle-copy span { color: var(--lumiverse-text-muted); font-size: 9px; line-height: 1.45; }
  .ss-settings-toggle input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
    pointer-events: none;
  }
  .ss-switch-track {
    position: relative;
    width: 36px;
    height: 20px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: 999px;
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 78%, transparent);
    transition: border-color .15s ease, background .15s ease;
  }
  .ss-switch-track::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--lumiverse-text-muted);
    box-shadow: 0 1px 5px rgba(0,0,0,.4);
    transition: transform .15s ease, background .15s ease;
  }
  .ss-settings-toggle input:checked + .ss-switch-track {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 70%, var(--ss-outline, var(--lumiverse-border)));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 32%, var(--ss-canvas, #090a0d));
  }
  .ss-settings-toggle input:checked + .ss-switch-track::after {
    transform: translateX(16px);
    background: var(--lumiverse-accent, #7dd3fc);
  }
  .ss-settings-toggle:focus-within { outline: 1px solid var(--lumiverse-accent, #7dd3fc); outline-offset: 2px; }
  .ss-request-mode-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .ss-request-mode-button {
    min-width: 0;
    min-height: 82px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    align-items: center;
    gap: 10px;
    padding: 11px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-header-bg, #13141a) 56%, transparent);
    color: var(--lumiverse-text-muted);
    text-align: left;
    cursor: pointer;
  }
  .ss-request-mode-button:hover { color: var(--ss-text, var(--lumiverse-text)); border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 42%, var(--ss-outline, var(--lumiverse-border))); }
  .ss-request-mode-button[data-active="true"] {
    color: var(--ss-text, var(--lumiverse-text));
    border-color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 12%, var(--ss-button-bg, #171820));
  }
  .ss-request-mode-button > span:last-child { min-width: 0; display: grid; gap: 5px; }
  .ss-request-mode-button strong { font-size: 10px; }
  .ss-request-mode-button small { color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.45; }
  .ss-request-mode-icon { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 9px; opacity: .82; }
  .ss-request-mode-icon svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.6; }
  .ss-parser-settings {
    display: grid;
    gap: 9px;
    padding: 11px;
    border: 1px dashed color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 42%, var(--ss-outline, var(--lumiverse-border)));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 5%, transparent);
  }
  .ss-parser-settings[hidden] { display: none; }
  .ss-parser-field { display: grid; grid-template-columns: minmax(120px, .42fr) minmax(0, 1fr); align-items: center; gap: 10px; color: var(--ss-text, var(--lumiverse-text)); font-size: 9px; font-weight: 650; }
  .ss-parser-field > span small { color: var(--lumiverse-text-muted); font-weight: 400; }
  .ss-parser-field .ss-select,
  .ss-parser-field .ss-input { min-width: 0; height: 32px; font-size: 9px; }
  .ss-prompt-family-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 10px;
    border: 1px solid color-mix(in srgb, var(--ss-outline, var(--lumiverse-border)) 82%, transparent);
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-header-bg, #13141a) 52%, transparent);
  }
  .ss-prompt-family-row > span { min-width: 0; display: grid; gap: 3px; }
  .ss-prompt-family-row strong { font-size: 9.5px; }
  .ss-prompt-family-row small { color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.35; }
  .ss-prompt-family-switch {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(76px, 1fr));
    gap: 3px;
    padding: 3px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: calc(var(--ss-control-radius, 8px) + 2px);
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 78%, transparent);
  }
  .ss-prompt-family-switch button {
    min-height: 28px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: var(--ss-control-radius, 8px);
    background: transparent;
    color: var(--lumiverse-text-muted);
    font: 650 9px/1 system-ui, sans-serif;
    cursor: pointer;
  }
  .ss-prompt-family-switch button:hover { color: var(--ss-text, var(--lumiverse-text)); }
  .ss-prompt-family-switch button[data-active="true"] {
    color: var(--ss-text, var(--lumiverse-text));
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 58%, transparent);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 14%, var(--ss-button-bg, #171820));
  }
  .ss-protocol-editor { min-height: 290px; resize: vertical; font: 9px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
  .ss-protocol-actions { display: flex; justify-content: flex-end; gap: 7px; }
  .ss-image-scale-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .ss-image-scale-button { min-height: 92px; display: grid; place-items: center; align-content: center; gap: 8px; }
  .ss-image-scale-button svg { width: 54px; height: 38px; fill: none; stroke: currentColor; stroke-width: 1.5; }
  .ss-image-scale-button span { font-size: 9px; }
  .ss-image-scale-button[data-active="true"] {
    color: var(--ss-text, var(--lumiverse-text));
    border-color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 12%, var(--ss-button-bg, #171820));
  }
  .ss-image-count-range {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 58px auto 58px;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    padding: 6px 8px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 72%, transparent);
  }
  .ss-config-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(150px, auto);
    align-items: center;
    gap: 10px;
    color: var(--ss-text, var(--lumiverse-text));
    font-size: 10px;
    font-weight: 650;
  }
  .ss-config-field .ss-select {
    min-width: 0;
    height: 32px;
    font-size: 10px;
  }
  .ss-image-count-range > span:first-child { color: var(--ss-text, var(--lumiverse-text)); font-size: 9px; font-weight: 650; }
  .ss-image-count-range .ss-input {
    width: 58px;
    min-width: 0;
    height: 27px;
    padding: 3px 5px;
    text-align: center;
  }
  .ss-image-count-range .ss-range-separator { color: var(--lumiverse-text-muted); font-size: 10px; }
  .ss-character-tags-editor { display: grid; gap: 6px; }
  .ss-character-tags-editor .ss-textarea {
    min-height: 72px;
    resize: vertical;
    font-size: 9px;
    line-height: 1.45;
  }
  .ss-character-tags-editor[aria-disabled="true"] { opacity: .58; }
  .ss-character-tags-actions { display: flex; justify-content: flex-end; gap: 6px; }
  .ss-tag-protocol-example {
    display: block;
    max-height: 74px;
    overflow: auto;
    white-space: pre-wrap;
    padding: 8px;
    border: 1px dashed color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 32%, var(--ss-outline, var(--lumiverse-border)));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-canvas, #090a0d) 78%, transparent);
    color: var(--lumiverse-text-muted);
    font: 8.5px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace;
  }
  img[data-swarm-studio-slot] {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    min-width: 100% !important;
    min-height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    object-fit: cover !important;
    object-position: center !important;
  }
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
  @media (hover: none) {
    figure[data-swarm-studio-image="true"] > [data-swarm-studio-inline-action] { opacity: .9; transform: none; }
  }
  .ss-config-label { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-config-theme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .ss-config-theme {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 7px;
    min-width: 0;
    font-size: 9.5px;
  }
  .ss-config-theme::before {
    content: "";
    width: 12px;
    height: 12px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: var(--ss-swatch);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--ss-swatch) 22%, transparent);
  }
  .ss-config-theme[data-active="true"] {
    color: var(--lumiverse-accent, #7dd3fc);
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 55%, var(--lumiverse-border));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 9%, var(--lumiverse-fill-subtle));
  }
  .ss-appearance-colors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .ss-color-control {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-header-bg, var(--lumiverse-fill-subtle)) 58%, transparent);
    color: var(--lumiverse-text);
    font-size: 9px;
    cursor: pointer;
  }
  .ss-color-control input[type="color"] {
    appearance: none;
    width: 22px;
    height: 22px;
    flex: 0 0 auto;
    padding: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, white 22%, var(--ss-outline, var(--lumiverse-border)));
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }
  .ss-color-control input[type="color"]::-webkit-color-swatch-wrapper { padding: 2px; }
  .ss-color-control input[type="color"]::-webkit-color-swatch { border: 0; border-radius: 50%; }
  .ss-color-control input[type="color"]::-moz-color-swatch { border: 0; border-radius: 50%; }
  .ss-color-control span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-appearance-range { display: grid; grid-template-columns: 90px minmax(0, 1fr) 42px; align-items: center; gap: 8px; }
  .ss-appearance-range label { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-appearance-range output { color: var(--lumiverse-text); font-size: 9px; text-align: right; font-variant-numeric: tabular-nums; }
  .ss-css-override {
    min-height: 126px;
    resize: vertical;
    font: 9px/1.5 ui-monospace, SFMono-Regular, Consolas, monospace;
    tab-size: 2;
  }
  .ss-config-actions { display: flex; justify-content: flex-end; gap: 6px; }
  .ss-css-guide {
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--ss-header-bg, var(--lumiverse-fill-subtle)) 48%, transparent);
  }
  .ss-css-guide summary { padding: 8px 9px; color: var(--lumiverse-text-muted); font-size: 9px; cursor: pointer; }
  .ss-css-guide pre {
    margin: 0;
    padding: 0 9px 9px;
    overflow-x: auto;
    color: var(--lumiverse-text-muted);
    font: 8px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace;
    white-space: pre-wrap;
  }
  .ss-macro-guide-grid { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 10px; padding: 0 9px 9px; }
  .ss-macro-guide-grid code { color: var(--lumiverse-accent, #7dd3fc); font: 8px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; }
  .ss-macro-guide-grid span { color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.45; }
  .ss-token-popover p { margin: 0 0 8px; color: var(--lumiverse-text-muted); line-height: 1.45; font-size: 10px; }
  .ss-token-row { display: grid; grid-template-columns: 1fr auto auto; gap: 6px; }
  .ss-token-wrap { position: relative; }
  .ss-permission-banner {
    display: none;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, #e0a458 45%, var(--lumiverse-border));
    border-radius: var(--lumiverse-radius, 8px);
    color: #e4b56f;
    background: color-mix(in srgb, #e0a458 8%, transparent);
    font-size: 10px;
  }
  .ss-permission-banner[data-visible="true"] { display: block; }
  @media (max-width: 850px) {
    .ss-shell { height: min(840px, calc(100vh - 105px)); min-height: 500px; overflow-y: auto; }
    .ss-workspace { display: flex; flex-direction: column; overflow: visible; }
    .ss-editor { overflow: visible; }
    .ss-output { border-left: 0; border-top: 1px solid var(--lumiverse-border); padding: 12px 0 0; min-height: 520px; }
    .ss-current-preview { min-height: 300px; }
    .ss-prompt-grid { grid-template-columns: 1fr; }
    .ss-controls-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ss-controls-grid .ss-model-field, .ss-controls-grid .ss-sampler-field, .ss-controls-grid .ss-scheduler-field { grid-column: span 1; }
  }
  @media (max-width: 560px) {
    .ss-topbar { grid-template-columns: minmax(0, 1fr) auto; }
    .ss-token-wrap { grid-column: 1 / -1; }
    .ss-advanced-grid { grid-template-columns: 1fr; }
    .ss-advanced-grid .ss-wide { grid-column: 1; }
    .ss-library-tools { grid-template-columns: 1fr auto; }
    .ss-library-tools .ss-select { grid-row: 2; }
    .ss-stack-row { grid-template-columns: auto 34px minmax(90px, 1fr) 68px auto; }
    .ss-stack-row > input:first-child { grid-column: 1; grid-row: 1; }
    .ss-stack-row .ss-stack-preview { grid-column: 2; grid-row: 1; }
    .ss-stack-row .ss-stack-name { grid-column: 3; grid-row: 1; }
    .ss-stack-row .ss-stack-weight { grid-column: 4; grid-row: 1; }
    .ss-stack-row .ss-stack-actions { grid-column: 5; grid-row: 1; }
    .ss-stack-row .ss-trigger-toggle { grid-column: 3 / -1; grid-row: 2; }
  }
`

const STUDIO_V3_STYLES = `
  .ss-modal-theme {
    color: var(--lumiverse-text);
    background-color: var(--lumiverse-bg, var(--lumiverse-fill)) !important;
  }
  .ss-shell {
    --ss-gap: 10px;
    --ss-generation-width: 284px;
    --ss-history-width: 244px;
    --ss-dock-height: 282px;
    --ss-prompt-height: 150px;
    --ss-library-width: 60%;
    --ss-control-radius: var(--lumiverse-radius, 8px);
    --ss-panel-radius: calc(var(--lumiverse-radius, 8px) * 1.1);
    --ss-slider-radius: 999px;
    --ss-theme-pattern: none;
    --ss-theme-pattern-size: auto;
    --ss-canvas-bg: var(--lumiverse-bg, var(--lumiverse-fill, #090a0d));
    --ss-panel-bg: var(--lumiverse-fill-subtle, #14151a);
    --ss-header-bg: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 9%, var(--ss-panel-bg));
    --ss-outline: var(--lumiverse-border, #30323a);
    --ss-button-bg: var(--lumiverse-fill-subtle, #17181e);
    --ss-surface-opacity: 96%;
    --ss-backdrop-blur: 12px;
    width: 100%;
    height: min(900px, calc(100dvh - 118px));
    min-height: min(650px, calc(100dvh - 118px));
    gap: var(--ss-gap);
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background-color: var(--ss-canvas-bg);
    background-image: var(--ss-theme-pattern);
    background-size: var(--ss-theme-pattern-size);
  }
  .ss-shell :is(.ss-button, .ss-icon-button, .ss-input, .ss-select, .ss-textarea) {
    border-radius: var(--ss-control-radius);
  }
  .ss-shell :is(.ss-generation-pane, .ss-history-pane, .ss-output-stage, .ss-prompt-panel, .ss-lora-dock, .ss-output-library, .ss-inspector-details) {
    border-radius: var(--ss-panel-radius);
  }
  .ss-shell input[type="range"] {
    appearance: none;
    height: 18px;
    border-radius: var(--ss-slider-radius);
    background: transparent;
  }
  .ss-shell input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 22%, var(--lumiverse-border));
    border-radius: var(--ss-slider-radius);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 10%, var(--lumiverse-fill-subtle));
  }
  .ss-shell input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 2px solid var(--lumiverse-fill);
    border-radius: var(--ss-slider-radius);
    background: var(--lumiverse-accent, #7dd3fc);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 58%, transparent);
  }
  .ss-shell input[type="range"]::-moz-range-track {
    height: 6px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 22%, var(--lumiverse-border));
    border-radius: var(--ss-slider-radius);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 10%, var(--lumiverse-fill-subtle));
  }
  .ss-shell input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: 2px solid var(--lumiverse-fill);
    border-radius: var(--ss-slider-radius);
    background: var(--lumiverse-accent, #7dd3fc);
  }
  .ss-topbar {
    display: grid;
    grid-template-columns: auto minmax(240px, 1fr) auto;
    gap: 8px;
    align-items: center;
    padding: 5px 6px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-control-radius);
    background: color-mix(in srgb, var(--ss-header-bg) var(--ss-surface-opacity), transparent);
    backdrop-filter: blur(var(--ss-backdrop-blur));
  }
  .ss-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: max-content;
    font-size: 13px;
    font-weight: 750;
  }
  .ss-brand svg { width: 20px; height: 20px; color: var(--lumiverse-accent, #7dd3fc); }
  .ss-brand svg { fill: currentColor; }
  .ss-top-actions { display: flex; align-items: center; gap: 6px; }
  .ss-top-actions .ss-button { white-space: nowrap; }
  .ss-header-library svg,
  .ss-mobile-prompt-tool svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-library-symbol {
    fill: none !important;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-close-studio { display: none; }
  .ss-mobile-tabs { display: none; }
  .ss-workspace {
    min-height: 0;
    display: grid;
    grid-template-columns: var(--ss-generation-width) minmax(300px, 1fr) var(--ss-history-width);
    gap: var(--ss-gap);
    flex: 1 1 0;
    overflow: hidden;
    position: relative;
    transition: grid-template-columns .2s ease;
  }
  .ss-shell.ss-generation-collapsed .ss-workspace {
    grid-template-columns: 42px minmax(300px, 1fr) var(--ss-history-width);
  }
  .ss-shell.ss-history-collapsed .ss-workspace {
    grid-template-columns: var(--ss-generation-width) minmax(300px, 1fr) 42px;
  }
  .ss-shell.ss-generation-collapsed.ss-history-collapsed .ss-workspace {
    grid-template-columns: 42px minmax(300px, 1fr) 42px;
  }
  .ss-resize-handle,
  .ss-center-resizer,
  .ss-dock-resizer,
  .ss-lora-divider {
    position: relative;
    z-index: 12;
    touch-action: none;
  }
  .ss-resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10px;
    cursor: col-resize;
  }
  .ss-resize-generation { left: calc(var(--ss-generation-width) + (var(--ss-gap) / 2) - 5px); }
  .ss-resize-history { right: calc(var(--ss-history-width) + (var(--ss-gap) / 2) - 5px); }
  .ss-resize-handle::after,
  .ss-center-resizer::after,
  .ss-dock-resizer::after,
  .ss-lora-divider::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 42%, var(--lumiverse-border));
    opacity: .18;
    transition: opacity .15s ease, box-shadow .15s ease;
  }
  .ss-resize-handle::after,
  .ss-lora-divider::after {
    top: 12px;
    bottom: 12px;
    left: 4px;
    width: 2px;
  }
  .ss-center-resizer::after,
  .ss-dock-resizer::after {
    left: 18px;
    right: 18px;
    top: 3px;
    height: 2px;
  }
  .ss-resize-handle:hover::after,
  .ss-center-resizer:hover::after,
  .ss-dock-resizer:hover::after,
  .ss-lora-divider:hover::after,
  .ss-shell.ss-is-resizing [data-resize]::after {
    opacity: .95;
    box-shadow: 0 0 10px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 45%, transparent);
  }
  .ss-shell.ss-generation-collapsed .ss-resize-generation,
  .ss-shell.ss-history-collapsed .ss-resize-history { display: none; }
  .ss-generation-pane,
  .ss-history-pane,
  .ss-output-stage,
  .ss-prompt-panel,
  .ss-lora-dock {
    border: 1px solid var(--ss-outline);
    background: color-mix(in srgb, var(--ss-panel-bg) var(--ss-surface-opacity), transparent);
    backdrop-filter: blur(var(--ss-backdrop-blur));
    border-radius: calc(var(--lumiverse-radius, 8px) * 1.1);
  }
  .ss-generation-pane,
  .ss-history-pane {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .ss-pane-head,
  .ss-dock-head {
    min-height: 39px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 7px 9px;
    border-bottom: 1px solid var(--ss-outline);
    background: color-mix(in srgb, var(--ss-header-bg) var(--ss-surface-opacity), transparent);
  }
  .ss-pane-head strong,
  .ss-dock-head strong { font-size: 11px; }
  .ss-pane-toggle { min-width: 27px; min-height: 27px; height: 27px; padding: 2px 6px; }
  .ss-pane-body {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    padding: 9px;
  }
  .ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-body,
  .ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-body,
  .ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-title,
  .ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-title {
    display: none;
  }
  .ss-shell.ss-generation-collapsed .ss-generation-pane .ss-pane-head,
  .ss-shell.ss-history-collapsed .ss-history-pane .ss-pane-head {
    justify-content: center;
    padding-inline: 5px;
    border-bottom: 0;
  }
  .ss-generation-controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  .ss-generation-controls .ss-wide { grid-column: 1 / -1; }
  .ss-generation-controls .ss-inline-actions { align-items: center; }
  .ss-generation-controls .ss-inline-actions .ss-button { flex: 1; }
  .ss-context-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
  }
  .ss-context-button svg {
    width: 15px;
    height: 15px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-preset-picker { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 6px; }
  .ss-preset-picker .ss-button[hidden] { display: none; }
  .ss-preset-manage { width: 32px; min-width: 32px; height: 32px; }
  .ss-preset-manage svg {
    width: 14px;
    height: 14px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-aspect-controls {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(110px, .8fr) minmax(130px, 1.2fr);
    gap: 8px;
  }
  .ss-size-slider-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
  }
  .ss-size-slider-row input[type="range"],
  .ss-creativity-row input[type="range"] {
    width: 100%;
    accent-color: var(--lumiverse-accent, #7dd3fc);
  }
  .ss-size-readout { min-width: 72px; text-align: right; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-custom-size {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr);
    gap: 7px;
    align-items: end;
  }
  .ss-custom-size[hidden] { display: none; }
  .ss-size-link {
    width: 30px;
    min-width: 30px;
    height: 34px;
    min-height: 34px;
    padding: 5px;
    align-self: end;
    color: var(--lumiverse-accent, #7dd3fc);
    opacity: .34;
  }
  .ss-size-link[data-linked="true"] { opacity: 1; }
  .ss-size-link svg {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-init-panel {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 8px;
    padding: 7px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 8px;
    background: color-mix(in srgb, var(--lumiverse-fill) 72%, transparent);
  }
  .ss-init-preview {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--lumiverse-border);
    border-radius: 7px;
    color: var(--lumiverse-text-dim, var(--lumiverse-text-muted));
    font-size: 9px;
  }
  .ss-init-preview img { width: 100%; height: 100%; object-fit: cover; }
  .ss-init-content { min-width: 0; display: grid; gap: 5px; }
  .ss-init-head { min-width: 0; display: flex; align-items: center; gap: 5px; overflow: hidden; }
  .ss-init-head strong { flex: 0 0 auto; }
  .ss-init-label { min-width: 0; max-width: 100%; flex: 1 1 0; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; }
  .ss-init-actions { display: flex; flex-wrap: wrap; gap: 5px; }
  .ss-init-actions .ss-button { min-height: 27px; padding: 4px 7px; }
  .ss-creativity-row { grid-column: 1 / -1; display: grid; grid-template-columns: auto minmax(0, 1fr) 30px; gap: 6px; align-items: center; font-size: 9px; color: var(--lumiverse-text-muted); }
  .ss-preset-stack {
    display: grid;
    gap: 5px;
    margin-top: 2px;
  }
  .ss-preset-empty { min-height: 42px; padding: 8px; }
  .ss-preset-row {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto auto auto;
    gap: 5px;
    align-items: center;
    padding: 5px 6px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 7px;
    background: color-mix(in srgb, var(--lumiverse-fill) 72%, transparent);
  }
  .ss-preset-row input { accent-color: var(--lumiverse-accent, #7dd3fc); }
  .ss-preset-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; }
  .ss-preset-row .ss-icon-button { min-width: 25px; min-height: 25px; height: 25px; padding: 2px 5px; }
  .ss-preset-apply { min-height: 25px; padding: 3px 7px; font-size: 9px; }
  .ss-center {
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(180px, 1fr) 8px minmax(108px, var(--ss-prompt-height));
    gap: 0;
    overflow: hidden;
  }
  .ss-center-resizer { cursor: row-resize; min-height: 8px; }
  .ss-output-stage {
    min-height: 0;
    padding: 9px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    overflow: hidden;
  }
  .ss-output-stage-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ss-output-stage-head .ss-output-actions { display: flex; }
  .ss-current-preview {
    min-height: 120px;
    max-height: none;
    flex: 0 0 auto;
    align-self: center;
    cursor: zoom-in;
  }
  .ss-current-preview img { cursor: zoom-in; }
  .ss-output-meta {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 20px;
  }
  .ss-output-label { flex: 1; }
  .ss-zoom-hint { color: var(--lumiverse-text-dim, var(--lumiverse-text-muted)); font-size: 9px; white-space: nowrap; }
  .ss-prompt-panel { padding: 8px 9px; min-height: 0; overflow-y: auto; }
  .ss-prompt-panel .ss-textarea { min-height: 70px; max-height: 150px; }
  .ss-prompt-grid { grid-template-columns: 1.25fr 1fr; }
  .ss-prompt-field-head { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 7px; }
  .ss-prompt-field-head > label { min-width: 0; }
  .ss-prompt-editor-button {
    width: 22px;
    height: 20px;
    flex: 0 0 auto;
    border-radius: 6px;
  }
  .ss-prompt-editor-button svg { width: 11px; height: 11px; }
  .ss-positive-label { display: flex; align-items: center; gap: 6px; min-width: 0; }
  .ss-active-preset-pill {
    min-width: 0;
    max-width: 210px;
    overflow: hidden;
    padding: 2px 6px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 24%, var(--ss-outline));
    border-radius: 999px;
    color: color-mix(in srgb, var(--lumiverse-accent) 58%, var(--lumiverse-text-muted));
    background: color-mix(in srgb, var(--lumiverse-accent) 7%, transparent);
    font-size: 8px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: none;
  }
  .ss-active-preset-pill[hidden] { display: none; }
  .ss-active-visual-pill {
    min-width: 0;
    max-width: 190px;
    overflow: hidden;
    padding: 2px 7px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 38%, var(--ss-outline));
    border-radius: 999px;
    color: color-mix(in srgb, var(--lumiverse-accent) 72%, var(--lumiverse-text));
    background: color-mix(in srgb, var(--lumiverse-accent) 12%, var(--ss-canvas));
    font-size: 8px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: none;
  }
  .ss-active-visual-pill[hidden] { display: none; }
  .ss-active-visual-pill[data-enabled="false"] {
    border-color: color-mix(in srgb, var(--ss-outline) 82%, #000);
    color: var(--lumiverse-text-dim, var(--lumiverse-text-muted));
    background: color-mix(in srgb, var(--ss-canvas) 92%, #000);
    opacity: .68;
  }
  .ss-prompt-head {
    min-height: 31px;
    margin: -8px -9px 7px;
    padding: 6px 9px;
    border-bottom: 1px solid var(--ss-outline);
    background: color-mix(in srgb, var(--ss-header-bg) var(--ss-surface-opacity), transparent);
  }
  .ss-prompt-status {
    min-width: 0;
    max-width: 36%;
    margin-left: auto;
    overflow: hidden;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ss-prompt-actions { display: flex; align-items: center; gap: 7px; margin-left: auto; }
  .ss-desktop-generate { min-width: 155px; min-height: 30px; height: 30px; padding-block: 4px; }
  .ss-mobile-stack-picker { display: none; }
  .ss-mobile-prompt-tools { display: none; }
  .ss-history-pane .ss-history-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: max-content;
    gap: 7px;
    overflow-y: auto;
  }
  .ss-history-card { position: relative; min-width: 0; aspect-ratio: 1; }
  .ss-history-item { width: 100%; height: 100%; aspect-ratio: auto; }
  .ss-history-menu-toggle {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 9;
    width: 25px;
    height: 25px;
    min-width: 25px;
    min-height: 25px;
    padding: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 7px;
    color: white;
    background: rgba(0,0,0,.72);
    opacity: .72;
    transition: opacity .15s ease;
  }
  .ss-history-card:hover .ss-history-menu-toggle,
  .ss-history-menu-toggle[aria-expanded="true"] { opacity: 1; }
  .ss-history-menu {
    position: absolute;
    top: 32px;
    right: 4px;
    z-index: 30;
    min-width: 112px;
    display: grid;
    gap: 3px;
    padding: 4px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 8px;
    background: color-mix(in srgb, var(--lumiverse-fill) 94%, black);
    box-shadow: 0 12px 28px rgba(0,0,0,.55);
  }
  .ss-history-menu[hidden] { display: none; }
  .ss-history-menu .ss-button { min-height: 27px; padding: 4px 7px; text-align: left; font-size: 9px; }
  .ss-history-menu .ss-button-danger { color: #ef7777; }
  .ss-history-pagination {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 5px 7px;
    border-top: 1px solid var(--lumiverse-border);
  }
  .ss-history-pagination .ss-button { min-height: 25px; padding: 3px 8px; }
  .ss-history-page-label { min-width: 62px; text-align: center; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-lora-dock {
    min-height: 0;
    flex: 0 0 var(--ss-dock-height);
    overflow: hidden;
    position: relative;
    transition: flex-basis .2s ease;
  }
  .ss-dock-resizer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    cursor: row-resize;
  }
  .ss-dock-head {
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px 0;
  }
  .ss-dock-head .ss-pane-toggle { margin-left: auto; flex: 0 0 auto; }
  .ss-lora-dock-content {
    height: calc(100% - 32px);
    display: grid;
    grid-template-columns: minmax(220px, var(--ss-library-width)) 8px minmax(240px, 1fr);
    gap: 0;
    padding: 5px 8px 8px;
  }
  .ss-lora-library,
  .ss-stack-pane {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow: hidden;
  }
  .ss-lora-library { padding-right: 6px; }
  .ss-stack-pane { padding-left: 6px; }
  .ss-lora-divider {
    cursor: col-resize;
    border-left: 1px solid color-mix(in srgb, var(--lumiverse-border) 70%, transparent);
    border-right: 1px solid color-mix(in srgb, var(--lumiverse-border) 35%, transparent);
  }
  .ss-lora-titlebar {
    min-height: 27px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .ss-lora-titlebar .ss-family-chip { margin-left: auto; }
  .ss-lora-dock .ss-section-head { min-height: 27px; margin-bottom: 0; }
  .ss-library-tools {
    grid-template-columns: minmax(180px, 1fr) auto 135px auto auto;
  }
  .ss-lora-query { min-width: 0; }
  .ss-lora-query > .ss-input { width: 100%; }
  .ss-lora-tool-icon {
    width: 31px;
    height: 31px;
    min-width: 31px;
    padding: 6px;
  }
  .ss-lora-tool-icon svg,
  .ss-lora-folder-row svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .ss-lora-tool-icon[data-active="true"] {
    color: var(--lumiverse-accent, #7dd3fc);
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 60%, var(--ss-outline));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 13%, var(--ss-button-bg));
  }
  .ss-lora-sort-wrap { position: relative; }
  .ss-lora-sort-menu {
    position: absolute;
    right: 0;
    bottom: calc(100% + 6px);
    z-index: 24;
    width: 132px;
    padding: 5px;
    display: grid;
    gap: 3px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-radius);
    background: color-mix(in srgb, var(--ss-panel-bg) 97%, black);
    box-shadow: 0 12px 30px rgba(0,0,0,.42);
  }
  .ss-lora-sort-menu[hidden] { display: none; }
  .ss-lora-sort-choice {
    min-height: 28px;
    padding: 5px 8px;
    border: 0;
    border-radius: max(4px, calc(var(--ss-radius) - 3px));
    background: transparent;
    color: var(--ss-text);
    text-align: left;
    font: inherit;
    font-size: 10px;
    cursor: pointer;
  }
  .ss-lora-sort-choice:hover,
  .ss-lora-sort-choice[data-selected="true"] {
    color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 12%, transparent);
  }
  .ss-library-tools.ss-download-open { grid-template-columns: minmax(0, 1fr); }
  .ss-library-tools.ss-download-open > :not(.ss-lora-query) { display: none; }
  .ss-lora-download-entry {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(150px, 1fr) minmax(95px, .45fr) auto auto;
    gap: 5px;
  }
  .ss-lora-download-entry[hidden] { display: none; }
  .ss-lora-download-toggle,
  .ss-lora-download-entry .ss-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }
  .ss-lora-download-toggle svg,
  .ss-lora-download-entry svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .ss-lora-download-status {
    grid-column: 1 / -1;
    min-height: 3px;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--ss-outline) 70%, transparent);
  }
  .ss-lora-download-status[hidden] { display: none; }
  .ss-lora-download-status > i {
    display: block;
    width: var(--ss-download-progress, 0%);
    height: 3px;
    background: var(--lumiverse-accent);
    transition: width .15s ease;
  }
  .ss-lora-filter {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 38%, var(--lumiverse-border));
  }
  .ss-badge-warning { color: #e0a458; background: color-mix(in srgb, #e0a458 12%, transparent); }
  .ss-family-note {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
  }
  .ss-family-chip {
    max-width: 230px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 2px 6px;
    border-radius: 999px;
    color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 10%, transparent);
  }
  .ss-lora-browser {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(140px, clamp(150px, 24%, 220px)) minmax(0, 1fr);
    gap: 6px;
    overflow: hidden;
  }
  .ss-lora-browser[data-folders-open="false"] { grid-template-columns: minmax(0, 1fr); }
  .ss-lora-folder-sidebar {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid color-mix(in srgb, var(--ss-outline) 82%, transparent);
    border-radius: var(--ss-radius);
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 7%, transparent), transparent 32%),
      color-mix(in srgb, var(--ss-panel-bg) 95%, black);
  }
  .ss-lora-folder-sidebar[hidden] { display: none; }
  .ss-lora-folder-head {
    min-height: 31px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding: 6px 7px;
    border-bottom: 1px solid color-mix(in srgb, var(--ss-outline) 65%, transparent);
  }
  .ss-lora-folder-head strong { font-size: 10px; letter-spacing: .03em; }
  .ss-lora-folder-tree {
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 5px;
  }
  .ss-lora-folder-row {
    --ss-folder-depth: 0;
    width: 100%;
    min-width: 0;
    min-height: 28px;
    display: grid;
    grid-template-columns: 15px minmax(0, 1fr) auto;
    align-items: center;
    gap: 6px;
    padding: 4px 6px 4px calc(6px + (var(--ss-folder-depth) * 12px));
    border: 1px solid transparent;
    border-radius: max(4px, calc(var(--ss-radius) - 3px));
    background: transparent;
    color: var(--ss-muted);
    font: inherit;
    font-size: 9.5px;
    text-align: left;
    cursor: pointer;
  }
  .ss-lora-folder-row span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ss-lora-folder-row small {
    color: var(--ss-dim);
    font-size: 8px;
    font-variant-numeric: tabular-nums;
  }
  .ss-lora-folder-row:hover {
    color: var(--ss-text);
    background: color-mix(in srgb, var(--ss-outline) 24%, transparent);
  }
  .ss-lora-folder-row[data-selected="true"] {
    color: var(--lumiverse-accent, #7dd3fc);
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 38%, transparent);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 11%, transparent);
  }
  .ss-lora-folder-row[data-kind="all"] svg { opacity: .72; }
  .ss-lora-grid {
    flex: 1;
    min-height: 0;
    max-height: none;
    height: 100%;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
  .ss-lora-card {
    position: relative;
    min-height: 98px;
    isolation: isolate;
  }
  .ss-lora-card:hover { z-index: 8; }
  .ss-lora-body { gap: 2px; padding: 6px 7px 31px; }
  .ss-lora-desc { -webkit-line-clamp: 1; min-height: 13px; }
  .ss-badges { max-height: 17px; flex-wrap: nowrap; }
  .ss-lora-footer {
    position: absolute;
    left: 79px;
    right: 7px;
    bottom: 6px;
    min-height: 25px;
    padding-right: 54px;
  }
  .ss-add-button {
    position: absolute;
    right: 7px;
    bottom: 6px;
    z-index: 20;
    pointer-events: auto;
    box-shadow: 0 3px 12px rgba(0,0,0,.36);
  }
  .ss-stack-head-tools {
    display: grid;
    grid-template-columns: minmax(110px, 1fr) auto auto auto;
    gap: 5px;
  }
  .ss-stack-share-tools {
    flex: 0 0 auto;
    position: sticky;
    bottom: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 5px;
    padding-top: 5px;
    border-top: 1px solid color-mix(in srgb, var(--ss-outline) 72%, transparent);
    background: var(--ss-canvas-bg);
  }
  .ss-stack-share-tools .ss-clear-stack { margin-left: auto; }
  .ss-stack-share-tools .ss-button { min-height: 27px; display: inline-flex; align-items: center; gap: 5px; padding: 4px 7px; font-size: 9px; }
  .ss-stack-share-tools svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .ss-missing-lora-modal {
    position: fixed;
    inset: 0;
    z-index: 2147483006;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgba(0,0,0,.72);
    backdrop-filter: blur(10px);
  }
  .ss-missing-lora-modal[hidden] { display: none; }
  .ss-missing-lora-card {
    width: min(560px, 96vw);
    max-height: min(720px, 88dvh);
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: 10px;
    overflow: hidden;
    padding: 14px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-panel-radius);
    background: color-mix(in srgb, var(--ss-panel-bg) 97%, #000);
    box-shadow: 0 26px 90px rgba(0,0,0,.7);
  }
  .ss-missing-lora-card header,
  .ss-missing-lora-card footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ss-missing-lora-card h3 { margin: 2px 0 0; font: 600 18px/1.1 Georgia, "Times New Roman", serif; }
  .ss-missing-lora-card p { margin: 0; font-size: 10px; line-height: 1.5; }
  .ss-missing-lora-card footer { justify-content: flex-end; }
  .ss-missing-lora-list { min-height: 0; display: grid; gap: 6px; overflow-y: auto; }
  .ss-missing-lora-row { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 7px; align-items: center; padding: 8px; border: 1px solid var(--ss-outline); border-radius: var(--ss-control-radius); }
  .ss-missing-lora-row strong,
  .ss-missing-lora-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-missing-lora-row span { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-missing-lora-row a { color: var(--lumiverse-accent); font-size: 9px; }
  .ss-stack-list {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
  }
  .ss-stack-row[data-incompatible="true"] {
    border-color: color-mix(in srgb, #e0a458 55%, var(--lumiverse-border));
  }
  .ss-stack-row[data-incompatible="true"] .ss-stack-name strong::after {
    content: " · model mismatch";
    color: #e0a458;
    font-weight: 500;
  }
  .ss-stack-row[data-missing="true"] {
    border-color: color-mix(in srgb, #ff7f8b 62%, var(--lumiverse-border));
  }
  .ss-stack-row[data-missing="true"] .ss-stack-name strong::after {
    content: " · missing";
    color: #ff8b96;
    font-weight: 600;
  }
  .ss-shell.ss-loras-collapsed .ss-lora-dock { flex-basis: 32px; }
  .ss-shell.ss-loras-collapsed .ss-dock-resizer,
  .ss-shell.ss-loras-collapsed .ss-library-tools,
  .ss-shell.ss-loras-collapsed .ss-library-status,
  .ss-shell.ss-loras-collapsed .ss-lora-grid,
  .ss-shell.ss-loras-collapsed .ss-lora-divider,
  .ss-shell.ss-loras-collapsed .ss-stack-pane,
  .ss-shell.ss-loras-collapsed .ss-lora-dock-content { display: none; }
  .ss-commandbar {
    flex: 0 0 30px;
    min-height: 30px;
    display: none;
    align-items: center;
    gap: 10px;
    padding: 3px 7px 3px 10px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 28%, var(--lumiverse-border));
    border-radius: calc(var(--lumiverse-radius, 8px) * 1.1);
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 8%, transparent), transparent 45%),
      var(--lumiverse-fill-subtle);
    box-shadow: 0 -8px 28px rgba(0,0,0,.12);
    z-index: 5;
  }
  .ss-commandbar .ss-generate {
    min-width: 190px;
    min-height: 36px;
    margin-left: auto;
  }
  .ss-mobile-generate { display: none; }
  .ss-command-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }
  .ss-run-status { flex: 1; }
  .ss-stack-summary { color: var(--lumiverse-text-dim, var(--lumiverse-text-muted)); font-size: 9px; white-space: nowrap; }
  .ss-fullscreen-layer {
    position: fixed !important;
    inset: 0 !important;
    width: auto !important;
    height: 100dvh !important;
    min-height: 0 !important;
    z-index: 2147483001;
    padding: 12px;
    background-color: var(--lumiverse-bg, var(--lumiverse-fill, #0d0d11));
  }
  .ss-fullscreen-layer .ss-close-studio { display: inline-flex; }
  .ss-inspector {
    position: fixed;
    inset: 0;
    z-index: 2147483010;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
    background: color-mix(in srgb, var(--ss-canvas-bg, var(--lumiverse-bg, #050608)) 97%, transparent);
    backdrop-filter: blur(12px);
  }
  .ss-inspector[hidden] { display: none; }
  .ss-inspector-stage {
    min-width: 0;
    min-height: 0;
    position: relative;
    overflow: auto;
    display: grid;
    place-items: center;
    padding: 58px 28px 28px;
  }
  .ss-inspector-image {
    max-width: none;
    max-height: none;
    object-fit: contain;
    transform: scale(var(--ss-image-scale, 1));
    transform-origin: center;
    transition: transform .12s ease;
  }
  .ss-inspector-toolbar {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 10px;
    background: color-mix(in srgb, var(--lumiverse-fill) 90%, transparent);
  }
  .ss-inspector-details {
    min-width: 0;
    overflow-y: auto;
    border-left: 1px solid var(--lumiverse-border);
    padding: 18px;
    background: var(--lumiverse-fill-subtle);
  }
  .ss-inspector-details-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 10px;
  }
  .ss-inspector-details-head h3 { margin: 0 0 4px; }
  .ss-inspector-details h3 { margin: 0 0 4px; font-size: 15px; }
  .ss-inspector-details h4 { margin: 18px 0 6px; font-size: 10px; color: var(--lumiverse-text-muted); text-transform: uppercase; letter-spacing: .06em; }
  .ss-inspector-copy {
    margin: 0;
    padding: 9px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 8px;
    background: var(--lumiverse-fill);
    color: var(--lumiverse-text);
    font: inherit;
    line-height: 1.5;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .ss-inspector-facts { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
  .ss-inspector-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 12px;
  }
  .ss-inspector-actions .ss-button-danger { grid-column: 1 / -1; }
  .ss-inspector-path {
    margin-top: 10px;
    padding: 8px 9px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 8px;
    color: var(--lumiverse-text-muted);
    background: var(--lumiverse-fill);
    font-size: 9px;
    overflow-wrap: anywhere;
  }
  .ss-inspector-path[hidden] { display: none; }
  .ss-inspector-path code { color: var(--lumiverse-text); font: inherit; }
  .ss-inspector-close { position: static; z-index: 2; }
  .ss-output-library {
    position: fixed;
    inset: 0;
    box-sizing: border-box;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    min-width: 0;
    min-height: 0;
    z-index: 2147483008;
    display: grid;
    grid-template-rows: minmax(62px, auto) minmax(0, 1fr);
    overflow: hidden;
    overscroll-behavior: contain;
    background: color-mix(in srgb, var(--ss-canvas-bg, var(--lumiverse-bg, #050608)) 98%, transparent);
    backdrop-filter: blur(12px);
  }
  .ss-output-library[hidden] { display: none; }
  .ss-library-landing[hidden],
  .ss-library-folder-view[hidden],
  .ss-library-modal-layer[hidden],
  .ss-library-selectbar[hidden] { display: none !important; }
  .ss-output-library[data-view="folders"] .ss-library-landing { display: block; }
  .ss-output-library[data-view="folders"] .ss-library-folder-view { display: none; }
  .ss-output-library[data-view="folder"] .ss-library-landing { display: none; }
  .ss-output-library[data-view="folder"] .ss-library-folder-view { display: grid; }
  .ss-library-head {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 10px clamp(14px, 3vw, 42px);
    border-bottom: 1px solid var(--ss-outline, var(--lumiverse-border));
    background: var(--ss-header-bg, var(--lumiverse-fill-subtle));
  }
  .ss-library-head-copy { min-width: 0; display: flex; align-items: baseline; gap: 12px; }
  .ss-library-head-copy strong { flex: 0 0 auto; font-size: 15px; }
  .ss-library-head-copy .ss-muted {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ss-library-folder-search {
    width: min(420px, 36vw);
    min-width: 220px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    padding: 0 12px;
    border: 1px solid var(--lumiverse-border);
    border-radius: 10px;
    background: color-mix(in srgb, var(--lumiverse-fill) 72%, transparent);
  }
  .ss-library-folder-search svg,
  .ss-library-folder-query svg { width: 16px; height: 16px; flex: 0 0 auto; fill: none; stroke: currentColor; }
  .ss-library-folder-search .ss-input,
  .ss-library-folder-query .ss-input { width: 100%; border: 0; background: transparent; box-shadow: none; }
  .ss-output-library[data-view="folder"] .ss-library-folder-search { display: none; }
  .ss-library-close {
    position: relative;
    z-index: 2;
    width: 44px;
    min-width: 44px;
    min-height: 44px;
    flex: 0 0 44px;
    margin-left: auto;
    touch-action: manipulation;
  }
  .ss-library-landing {
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: clamp(24px, 4vw, 52px) clamp(14px, 5vw, 72px) 24px;
  }
  .ss-library-landing-inner { width: min(1400px, 100%); min-height: 100%; display: grid; grid-template-rows: auto 1fr; gap: 24px; margin: 0 auto; }
  .ss-library-folder-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 280px));
    justify-content: center;
    align-content: start;
    gap: clamp(16px, 2vw, 28px);
  }
  .ss-library-folder-card,
  .ss-library-new-folder-card {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 246px;
    display: grid;
    grid-template-rows: 158px auto;
    overflow: hidden;
    padding: 0;
    border: 1px solid var(--lumiverse-border);
    border-radius: 14px;
    color: var(--lumiverse-text);
    background: color-mix(in srgb, var(--lumiverse-fill) 72%, transparent);
    text-align: left;
    cursor: pointer;
    transition: border-color .16s ease, transform .16s ease, box-shadow .16s ease;
  }
  .ss-library-folder-card:hover,
  .ss-library-folder-card:focus-visible,
  .ss-library-new-folder-card:hover,
  .ss-library-new-folder-card:focus-visible {
    outline: 0;
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--lumiverse-accent) 62%, var(--lumiverse-border));
    box-shadow: 0 16px 36px rgba(0,0,0,.28);
  }
  .ss-library-new-folder-card {
    place-items: center;
    align-content: center;
    grid-template-rows: auto auto auto;
    gap: 10px;
    padding: 28px 24px;
    border-style: dashed;
    border-color: color-mix(in srgb, var(--lumiverse-accent) 60%, var(--lumiverse-border));
    text-align: center;
  }
  .ss-library-new-folder-card > span:last-child { max-width: 190px; line-height: 1.45; }
  .ss-library-new-folder-icon {
    width: 68px; height: 68px; display: grid; place-items: center;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 62%, var(--lumiverse-border));
    border-radius: 50%; color: var(--lumiverse-accent);
    background: color-mix(in srgb, var(--lumiverse-accent) 10%, transparent);
  }
  .ss-library-new-folder-icon svg { width: 28px; height: 28px; fill: none; stroke: currentColor; }
  .ss-library-folder-preview {
    position: relative;
    width: 100%; height: 158px;
    display: grid; place-items: center;
    overflow: hidden;
    background: color-mix(in srgb, var(--lumiverse-fill) 90%, #000);
  }
  .ss-library-folder-preview[data-collage="true"] { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2px; }
  .ss-library-folder-preview img { width: 100%; height: 100%; min-width: 0; object-fit: cover; }
  .ss-library-folder-preview > svg { width: 44px; height: 44px; opacity: .5; }
  .ss-library-folder-badge,
  .ss-library-folder-kind {
    display: inline-flex; align-items: center; width: max-content;
    padding: 4px 8px; border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 55%, transparent);
    border-radius: 999px; color: #fff; background: color-mix(in srgb, var(--lumiverse-accent) 72%, #171022);
    box-shadow: 0 4px 16px rgba(0,0,0,.32); font-size: 8px; font-weight: 750;
  }
  .ss-library-folder-badge { position: absolute; top: 10px; left: 10px; }
  .ss-library-folder-copy { min-width: 0; display: grid; gap: 4px; padding: 13px 15px; }
  .ss-library-folder-copy strong, .ss-library-folder-copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-library-folder-note { align-self: end; justify-self: center; margin: 0; text-align: center; }
  .ss-library-folder-empty { grid-column: 1 / -1; }
  .ss-library-folder-view {
    min-width: 0; min-height: 0;
    grid-template-rows: auto auto minmax(0, 1fr);
    overflow: hidden;
  }
  .ss-library-folder-header {
    display: grid;
    gap: 14px;
    padding: 16px clamp(14px, 3vw, 42px) 18px;
    border-bottom: 1px solid var(--lumiverse-border);
    background: linear-gradient(180deg, color-mix(in srgb, var(--ss-header-bg) 82%, transparent), transparent);
  }
  .ss-library-breadcrumb { display: flex; align-items: center; gap: 9px; min-width: 0; color: var(--lumiverse-text-muted); }
  .ss-library-breadcrumb strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--lumiverse-text); }
  .ss-library-back { display: inline-flex; align-items: center; gap: 7px; padding: 5px 0; border: 0; color: var(--lumiverse-accent); background: transparent; cursor: pointer; }
  .ss-library-back svg { width: 15px; height: 15px; fill: none; stroke: currentColor; }
  .ss-library-folder-heading { display: grid; grid-template-columns: 96px minmax(180px, 1fr) auto auto; align-items: end; gap: 16px; }
  .ss-library-folder-cover { width: 96px; height: 72px; display: grid; place-items: center; overflow: hidden; border: 1px solid var(--lumiverse-border); border-radius: 11px; background: var(--lumiverse-fill); }
  .ss-library-folder-cover img { width: 100%; height: 100%; object-fit: cover; }
  .ss-library-folder-cover svg { width: 32px; height: 32px; opacity: .5; }
  .ss-library-folder-title-copy { min-width: 0; display: grid; gap: 4px; align-self: center; }
  .ss-library-folder-title-copy h2 { min-width: 0; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: clamp(20px, 2vw, 28px); line-height: 1.1; }
  .ss-library-folder-kind[hidden] { display: none; }
  .ss-library-folder-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  .ss-library-folder-actions [hidden] { display: none !important; }
  .ss-library-folder-actions .ss-button {
    min-height: 36px; display: inline-flex; flex-direction: row; align-items: center; justify-content: center;
    gap: 6px; line-height: 1; white-space: nowrap;
  }
  .ss-library-folder-actions .ss-button > span { display: inline; line-height: 1; }
  .ss-library-folder-actions svg { width: 14px; height: 14px; flex: 0 0 14px; fill: none; stroke: currentColor; }
  .ss-library-pagination { display: flex; align-items: center; gap: 6px; }
  .ss-library-folder-query { min-width: 0; display: flex; align-items: center; gap: 8px; padding: 4px 10px; border: 1px solid var(--lumiverse-border); border-radius: 9px; background: var(--lumiverse-fill); }
  .ss-library-folder-query[hidden] { display: none; }
  .ss-library-selection-actions { flex: 0 0 auto; display: flex; align-items: center; gap: 5px; padding-left: 7px; border-left: 1px solid var(--lumiverse-border); }
  .ss-library-selection-actions[hidden] { display: none; }
  .ss-library-folder-delete { color: #ef7777; }
  .ss-library-folder-delete:hover:not(:disabled) {
    border-color: color-mix(in srgb, #ef7777 65%, var(--lumiverse-border));
    background: color-mix(in srgb, #ef7777 13%, transparent);
  }
  .ss-library-selection-count { min-width: 72px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-library-selectbar { min-height: 42px; display: flex; align-items: center; gap: 7px; padding: 6px clamp(14px, 3vw, 42px); border-bottom: 1px solid var(--lumiverse-border); background: color-mix(in srgb, var(--lumiverse-fill-subtle) 72%, transparent); }
  .ss-library-select-page { min-height: 28px; padding: 4px 9px; font-size: 9px; }
  .ss-library-select-page[hidden] { display: none; }
  .ss-library-nonstarred {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
    white-space: nowrap;
    cursor: pointer;
  }
  .ss-library-nonstarred[hidden] { display: none; }
  .ss-library-nonstarred input { margin: 0; accent-color: var(--lumiverse-accent, #7dd3fc); }
  .ss-library-selectbar .ss-library-selection-actions { margin-left: auto; border-left: 0; padding-left: 0; }
  .ss-library-modal-layer { position: absolute; z-index: 20; inset: 0; display: grid; place-items: center; padding: 22px; background: rgba(3, 4, 8, .72); backdrop-filter: blur(8px); }
  .ss-library-visual-dialog { width: min(820px, 100%); max-height: min(820px, calc(100dvh - 44px)); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 35%, var(--lumiverse-border)); border-radius: 16px; background: color-mix(in srgb, var(--ss-panel-bg, var(--lumiverse-surface, #17131b)) 97%, #000); box-shadow: 0 32px 100px rgba(0,0,0,.72); }
  .ss-library-visual-dialog [hidden] { display: none !important; }
  .ss-library-visual-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--lumiverse-border); }
  .ss-library-visual-head > div { min-width: 0; display: grid; gap: 3px; }
  .ss-library-visual-head strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; }
  .ss-library-visual-body { min-height: 0; display: grid; gap: 14px; overflow-y: auto; padding: 16px 18px; }
  .ss-library-visual-section { display: grid; gap: 12px; padding: 14px; border: 1px solid var(--lumiverse-border); border-radius: 12px; background: color-mix(in srgb, var(--lumiverse-fill) 72%, transparent); }
  .ss-library-visual-section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .ss-library-visual-section-title > div { display: grid; gap: 2px; }
  .ss-library-visual-prompts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ss-library-visual-prompts .ss-textarea { min-height: 132px; resize: vertical; }
  .ss-library-visual-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ss-library-look-count { flex: 0 0 auto; color: var(--lumiverse-accent); font-size: 9px; }
  .ss-library-look-heading-actions { display: inline-flex; align-items: center; gap: 9px; }
  .ss-library-look-heading-actions .ss-button { min-height: 32px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
  .ss-library-look-heading-actions svg { width: 13px; height: 13px; flex: 0 0 13px; fill: none; stroke: currentColor; }
  .ss-library-look-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 9px; }
  .ss-library-look-card { min-width: 0; display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: center; gap: 9px; padding: 7px; border: 1px solid var(--lumiverse-border); border-radius: 10px; color: inherit; background: var(--lumiverse-fill); text-align: left; cursor: pointer; }
  .ss-library-look-card[data-active="true"] { border-color: var(--lumiverse-accent); background: color-mix(in srgb, var(--lumiverse-accent) 11%, var(--lumiverse-fill)); }
  .ss-library-look-preview { width: 56px; height: 56px; display: grid; place-items: center; overflow: hidden; border-radius: 8px; background: color-mix(in srgb, var(--lumiverse-fill) 80%, #000); }
  .ss-library-look-preview img { width: 100%; height: 100%; object-fit: cover; }
  .ss-library-look-preview svg { width: 22px; height: 22px; opacity: .45; }
  .ss-library-look-copy { min-width: 0; display: grid; gap: 3px; }
  .ss-library-look-copy > * { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-library-look-active { width: max-content; color: var(--lumiverse-accent); font-size: 8px; font-weight: 700; }
  .ss-library-look-editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ss-library-look-editor-grid .ss-textarea { min-height: 112px; }
  .ss-library-look-editor-grid .ss-library-look-wide { grid-column: 1 / -1; }
  .ss-library-look-delete { margin-right: auto; color: #ef7777; }
  .ss-library-visual-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--lumiverse-border); background: color-mix(in srgb, var(--ss-header-bg) 86%, transparent); }
  .ss-new-folder-card { width: min(520px, calc(100vw - 28px)); }
  .ss-new-folder-types { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .ss-new-folder-types label { display: flex; align-items: flex-start; gap: 8px; padding: 9px; border: 1px solid var(--lumiverse-border); border-radius: var(--ss-control-radius); background: var(--lumiverse-fill); cursor: pointer; }
  .ss-new-folder-types input { margin-top: 2px; accent-color: var(--lumiverse-accent); }
  .ss-new-folder-types span { display: grid; gap: 2px; }
  .ss-new-folder-types small { color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.35; }
  .ss-output-library-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    grid-auto-rows: max-content;
    align-content: start;
    gap: clamp(10px, 1.35vw, 18px);
    overflow-y: auto;
    overscroll-behavior-y: contain;
    -webkit-overflow-scrolling: touch;
    padding: clamp(14px, 2vw, 30px) clamp(14px, 3vw, 42px) 28px;
  }
  .ss-library-output {
    position: relative;
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--lumiverse-border);
    border-radius: 9px;
    background: var(--lumiverse-fill);
    align-self: start;
  }
  .ss-library-output[data-selected="true"] {
    border-color: var(--lumiverse-accent, #7dd3fc);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 20%, transparent);
  }
  .ss-library-output-check {
    position: absolute;
    top: 7px;
    left: 7px;
    z-index: 5;
    width: 21px;
    height: 21px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: rgba(0,0,0,.72);
    box-shadow: 0 3px 10px rgba(0,0,0,.35);
  }
  .ss-library-output-check input {
    appearance: none;
    width: 15px;
    height: 15px;
    margin: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.5);
    border-radius: 4px;
    background: rgba(8,9,12,.82);
  }
  .ss-library-output-check input::after {
    content: "✓";
    color: #071014;
    font-size: 11px;
    font-weight: 900;
    line-height: 1;
    opacity: 0;
    transform: scale(.7);
    transition: opacity .12s ease, transform .12s ease;
  }
  .ss-library-output-check input:checked {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 75%, #fff);
    background: var(--lumiverse-accent, #7dd3fc);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 24%, transparent);
  }
  .ss-library-output-check input:checked::after { opacity: 1; transform: scale(1); }
  .ss-output-library[data-selection-mode="false"] .ss-library-output-check { display: none; }
  .ss-library-output-star {
    position: absolute;
    top: 7px;
    right: 7px;
    z-index: 4;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,216,94,.52);
    border-radius: 7px;
    color: #ffd85e;
    background: rgba(0,0,0,.72);
    box-shadow: 0 3px 10px rgba(0,0,0,.35);
    pointer-events: none;
  }
  .ss-library-output-button {
    width: 100%;
    aspect-ratio: 1;
    display: block;
    padding: 0;
    border: 0;
    background: #050609;
  }
  .ss-library-output-button img { width: 100%; height: 100%; display: block; object-fit: cover; }
  .ss-library-output-meta { display: grid; gap: 5px; padding: 6px; }
  .ss-library-output-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; }
  .ss-library-output-meta :is(.ss-select, .ss-button) { width: 100%; height: 28px; min-height: 28px; padding-block: 3px; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .ss-token-popover { z-index: 30; }

  @media (max-width: 1000px) and (min-width: 721px) {
    .ss-shell {
      --ss-generation-width: 245px;
      --ss-history-width: 205px;
      --ss-library-width: 58%;
    }
    .ss-library-tools { grid-template-columns: minmax(120px, 1fr) auto 125px auto auto; }
    .ss-library-folder-heading { grid-template-columns: 80px minmax(160px, 1fr) auto; }
    .ss-library-folder-cover { width: 80px; height: 64px; }
    .ss-library-folder-actions { grid-column: 1 / -1; justify-content: flex-start; }
    .ss-library-pagination { grid-column: 3; grid-row: 1; }
  }

  @media (max-height: 800px) and (min-width: 721px) {
    .ss-shell { --ss-dock-height: 228px; --ss-prompt-height: 126px; }
    .ss-prompt-panel .ss-textarea { min-height: 56px; }
    .ss-pane-head { min-height: 35px; }
  }

  @media (max-width: 720px) {
    .ss-shell,
    .ss-shell.ss-fullscreen-layer {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483001;
      width: auto !important;
      height: 100dvh !important;
      min-height: 0 !important;
      padding: max(8px, env(safe-area-inset-top)) 8px max(7px, env(safe-area-inset-bottom));
      gap: 7px;
      background-color: var(--lumiverse-bg, var(--lumiverse-fill, #0d0d11));
    }
    .ss-topbar,
    .ss-mobile-tabs,
    .ss-commandbar { flex-shrink: 0; }
    .ss-topbar {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 6px;
    }
    .ss-brand { font-size: 12px; }
    .ss-connection-wrap { grid-column: 1 / -1; grid-row: 2; }
    .ss-top-actions { grid-column: 2; grid-row: 1; }
    .ss-top-actions [data-action="toggle-fullscreen"] { display: none; }
    .ss-close-studio { display: inline-flex; }
    .ss-settings-layer {
      padding: max(7px, env(safe-area-inset-top)) max(7px, env(safe-area-inset-right))
        max(7px, env(safe-area-inset-bottom)) max(7px, env(safe-area-inset-left));
    }
    .ss-settings-dialog {
      width: 100%;
      height: 100%;
      min-height: 0;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto minmax(0, 1fr);
      border-radius: max(10px, var(--ss-panel-radius, var(--lumiverse-radius, 12px)));
    }
    .ss-settings-header { grid-column: 1; min-height: 48px; padding: 8px 10px 8px 13px; }
    .ss-settings-title span { display: none; }
    .ss-settings-tabs {
      display: flex;
      gap: 5px;
      padding: 7px 9px;
      overflow-x: auto;
      overflow-y: hidden;
      border-right: 0;
      border-bottom: 1px solid var(--ss-outline, var(--lumiverse-border));
      scrollbar-width: none;
    }
    .ss-settings-tabs::-webkit-scrollbar { display: none; }
    .ss-settings-tab {
      width: auto;
      min-width: max-content;
      min-height: 34px;
      flex: 0 0 auto;
      padding: 7px 11px;
      border-radius: 999px;
    }
    .ss-settings-tab[data-active="true"] { box-shadow: inset 0 -2px var(--lumiverse-accent, #7dd3fc); }
    .ss-settings-content { padding: 10px 9px max(18px, env(safe-area-inset-bottom)); }
    .ss-config-section { padding: 11px; }
    .ss-config-section-head { align-items: flex-start; }
    .ss-config-section-head span { text-align: right; }
    .ss-settings-toggle { padding: 9px; }
    .ss-request-mode-grid { grid-template-columns: minmax(0, 1fr); }
    .ss-parser-field { grid-template-columns: minmax(0, 1fr); gap: 5px; }
    .ss-prompt-family-row { align-items: stretch; flex-direction: column; }
    .ss-prompt-family-switch { width: 100%; }
    .ss-protocol-editor { min-height: 250px; font-size: 8.5px; }
    .ss-image-scale-grid { grid-template-columns: repeat(3, minmax(84px, 1fr)); overflow-x: auto; }
    .ss-image-scale-button { min-height: 80px; }
    .ss-mobile-tabs {
      display: flex;
      flex: 0 0 36px;
      min-height: 36px;
      gap: 4px;
      overflow-x: auto;
      scrollbar-width: none;
      padding-bottom: 1px;
    }
    .ss-mobile-tabs::-webkit-scrollbar { display: none; }
    .ss-mobile-tab {
      min-height: 34px;
      flex: 0 0 auto;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 10px;
    }
    .ss-mobile-tab[data-active="true"] {
      color: var(--lumiverse-text);
      background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 18%, var(--lumiverse-fill-subtle));
      border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 58%, var(--lumiverse-border));
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 18%, transparent);
    }
    .ss-workspace {
      display: block !important;
      min-height: 0;
      flex: 1 1 0;
      overflow-y: auto;
    }
    .ss-center { display: contents; }
    .ss-workspace [data-mobile-panel] { display: none !important; }
    .ss-shell[data-mobile-tab="create"] [data-mobile-panel="create-output"] { display: flex !important; }
    .ss-shell[data-mobile-tab="create"] [data-mobile-panel="create-prompt"] { display: block !important; }
    .ss-shell[data-mobile-tab="generation"] [data-mobile-panel="generation"] { display: flex !important; min-height: 100%; }
    .ss-shell[data-mobile-tab="history"] [data-mobile-panel="history"] { display: flex !important; min-height: 100%; }
    .ss-resize-handle,
    .ss-center-resizer,
    .ss-dock-resizer,
    .ss-lora-divider { display: none !important; }
    .ss-generation-pane .ss-pane-title,
    .ss-history-pane .ss-pane-title { display: block !important; }
    .ss-generation-pane .ss-pane-body,
    .ss-history-pane .ss-pane-body { display: block !important; }
    .ss-pane-toggle { display: none; }
    .ss-output-stage,
    .ss-prompt-panel,
    .ss-generation-pane,
    .ss-history-pane {
      width: 100%;
      border-radius: 10px;
    }
    .ss-current-preview { min-height: 180px; flex: 0 0 auto; }
    .ss-output-stage-head .ss-output-actions { display: none; }
    .ss-prompt-grid { grid-template-columns: 1fr; }
    .ss-prompt-panel { margin-top: 7px; overflow: visible; }
    .ss-prompt-panel .ss-textarea { min-height: 112px; max-height: none; }
    .ss-prompt-head { position: relative; min-height: 38px; }
    .ss-prompt-status { display: none; }
    .ss-desktop-generate { display: none; }
    .ss-mobile-stack-picker {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--lumiverse-text-muted);
      font-size: 9px;
    }
    .ss-mobile-stack-picker .ss-select { width: min(46vw, 210px); height: 30px; }
    .ss-mobile-prompt-tools {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 8px;
    }
    .ss-mobile-prompt-tool {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-height: 34px;
      flex: 1 1 112px;
      justify-content: center;
    }
    .ss-active-preset-pill { max-width: 42vw; }
    .ss-generation-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ss-aspect-controls { grid-template-columns: 1fr; }
    .ss-custom-size { grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr); }
    .ss-history-pane .ss-history-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2.2vw;
      padding: 2.2vw;
    }
    .ss-lora-dock {
      display: none;
      min-height: 0;
      flex: 1 1 0;
      border-radius: 10px;
    }
    .ss-shell[data-mobile-tab="loras"] .ss-workspace,
    .ss-shell[data-mobile-tab="stack"] .ss-workspace { display: none !important; }
    .ss-shell[data-mobile-tab="loras"] .ss-lora-dock,
    .ss-shell[data-mobile-tab="stack"] .ss-lora-dock {
      display: block;
      flex-basis: auto;
    }
    .ss-lora-dock .ss-dock-head { display: none; }
    .ss-lora-dock-content {
      height: 100%;
      display: block;
      padding: 9px;
    }
    .ss-shell.ss-loras-collapsed .ss-lora-dock-content { display: block; padding: 9px; }
    .ss-shell.ss-loras-collapsed .ss-lora-library { display: flex; padding: 0; }
    .ss-shell.ss-loras-collapsed .ss-lora-titlebar > :not(.ss-pane-toggle) { display: flex; }
    .ss-shell.ss-loras-collapsed .ss-library-tools,
    .ss-shell.ss-loras-collapsed .ss-lora-grid { display: grid; }
    .ss-shell.ss-loras-collapsed .ss-stack-pane { display: flex; }
    .ss-lora-titlebar { min-height: 27px; gap: 5px; }
    .ss-lora-titlebar .ss-pane-toggle { display: none; }
    .ss-lora-titlebar .ss-family-chip { max-width: 42vw; }
    .ss-shell[data-mobile-tab="loras"] .ss-lora-library { display: flex; height: 100%; padding: 0; border: 0; }
    .ss-shell[data-mobile-tab="loras"] .ss-stack-pane { display: none; }
    .ss-shell[data-mobile-tab="stack"] .ss-lora-library { display: none; }
    .ss-shell[data-mobile-tab="stack"] .ss-stack-pane { display: flex; height: 100%; }
    .ss-library-tools { grid-template-columns: minmax(0, 1fr) auto 120px auto auto; }
    .ss-lora-browser,
    .ss-lora-browser[data-folders-open="false"] { grid-template-columns: minmax(0, 1fr); }
    .ss-lora-folder-sidebar {
      position: absolute;
      inset: 0 auto 0 0;
      z-index: 22;
      width: min(78vw, 290px);
      box-shadow: 16px 0 38px rgba(0,0,0,.52);
    }
    .ss-lora-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ss-lora-card { grid-template-columns: 78px minmax(0, 1fr); min-height: 120px; }
    .ss-lora-card .ss-lora-footer { left: 85px; }
    .ss-commandbar { display: flex; flex: 0 0 52px; min-height: 52px; }
    .ss-stack-summary { display: none; }
    .ss-commandbar .ss-generate { min-width: 142px; }
    .ss-mobile-generate { display: inline-flex; align-items: center; justify-content: center; }
    .ss-run-status { white-space: normal; line-height: 1.25; max-height: 30px; }
    .ss-inspector {
      grid-template-columns: 1fr;
      grid-template-rows: minmax(45dvh, 1fr) minmax(210px, 40dvh);
    }
    .ss-inspector-stage { padding: 52px 12px 16px; }
    .ss-inspector-image { max-height: none; }
    .ss-inspector-details { border-left: 0; border-top: 1px solid var(--lumiverse-border); padding: 13px; }
    .ss-output-library {
      grid-template-rows: auto minmax(0, 1fr);
      padding:
        var(--app-interactive-safe-top, env(safe-area-inset-top, 0px))
        env(safe-area-inset-right, 0px)
        max(0px, calc(env(safe-area-inset-bottom, 0px) - var(--app-keyboard-inset-bottom, 0px)))
        env(safe-area-inset-left, 0px);
    }
    html[data-ios-pwa] .ss-output-library {
      position: absolute;
      height: 100%;
      max-height: 100%;
    }
    .ss-library-head { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; padding: 7px 10px; }
    .ss-library-head-copy { display: grid; gap: 1px; }
    .ss-library-head-copy .ss-muted { font-size: 8px; }
    .ss-library-close { grid-column: 2; grid-row: 1; }
    .ss-library-folder-search { grid-column: 1 / -1; grid-row: 2; width: 100%; min-width: 0; box-sizing: border-box; margin: 0; }
    .ss-output-library[data-view="folder"] .ss-library-folder-search { display: none; }
    .ss-library-landing { padding: 14px 10px 18px; }
    .ss-library-landing-inner { gap: 16px; }
    .ss-library-folder-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .ss-library-folder-card, .ss-library-new-folder-card { min-height: 184px; grid-template-rows: 112px auto; border-radius: 11px; }
    .ss-library-new-folder-card { grid-template-rows: auto auto auto; gap: 6px; padding: 14px 10px; }
    .ss-library-new-folder-icon { width: 52px; height: 52px; }
    .ss-library-folder-preview { height: 112px; }
    .ss-library-folder-copy { padding: 9px 10px; }
    .ss-library-folder-note { padding-inline: 10px; }
    .ss-library-folder-header { gap: 10px; padding: 10px; }
    .ss-library-breadcrumb { font-size: 9px; }
    .ss-library-folder-heading { grid-template-columns: 58px minmax(0, 1fr) auto; align-items: center; gap: 10px; }
    .ss-library-folder-cover { width: 58px; height: 52px; }
    .ss-library-folder-title-copy h2 { font-size: 18px; }
    .ss-library-folder-actions { grid-column: 1 / -1; justify-content: flex-start; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .ss-library-folder-actions .ss-button { flex: 0 0 auto; }
    .ss-library-pagination { grid-column: 3; grid-row: 1; }
    .ss-library-pagination .ss-history-page-label { display: none; }
    .ss-library-folder-query { grid-column: 1 / -1; }
    .ss-library-selectbar { overflow-x: auto; padding: 6px 10px; }
    .ss-library-nonstarred { flex: 0 0 auto; }
    .ss-library-selection-actions .ss-button { padding-inline: 8px; }
    .ss-library-modal-layer { place-items: stretch; padding: max(8px, env(safe-area-inset-top)) max(8px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left)); }
    .ss-library-visual-dialog { width: 100%; max-height: 100%; border-radius: 12px; }
    .ss-library-visual-head, .ss-library-visual-footer { padding: 11px 12px; }
    .ss-library-visual-body { gap: 10px; padding: 10px; }
    .ss-library-visual-section { padding: 10px; }
    .ss-library-visual-prompts, .ss-library-visual-options { grid-template-columns: 1fr; }
    .ss-library-visual-prompts .ss-textarea { min-height: 108px; }
    .ss-library-visual-section-title { align-items: flex-start; }
    .ss-library-look-heading-actions { align-items: flex-end; flex-direction: column; }
    .ss-library-look-grid { grid-template-columns: 1fr; }
    .ss-library-look-editor-grid { grid-template-columns: 1fr; }
    .ss-library-look-editor-grid .ss-library-look-wide { grid-column: auto; }
    .ss-library-visual-footer { flex-wrap: wrap; }
    .ss-library-look-delete { margin-right: 0; }
    .ss-output-library-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: max-content;
      gap: 8px;
      padding: 10px;
    }
  }

  .ss-workflow-panel {
    grid-column: 1 / -1;
    display: grid;
    gap: 7px;
    padding: 9px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 24%, var(--ss-outline));
    border-radius: var(--ss-control-radius);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--lumiverse-accent) 7%, transparent), transparent 58%),
      color-mix(in srgb, var(--ss-panel-bg) var(--ss-surface-opacity), transparent);
  }
  .ss-workflow-picker { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 6px; align-items: end; }
  .ss-workflow-picker .ss-field { min-width: 0; }
  .ss-workflow-badge {
    min-height: 27px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-control-radius);
    color: var(--lumiverse-text-muted);
    font-size: 9px;
    white-space: nowrap;
  }
  .ss-workflow-badge[data-active="true"] {
    color: var(--lumiverse-accent);
    border-color: color-mix(in srgb, var(--lumiverse-accent) 55%, var(--ss-outline));
  }
  .ss-workflow-description { color: var(--lumiverse-text-muted); font-size: 9px; line-height: 1.45; }
  .ss-workflow-description:empty { display: none; }
  .ss-workflow-fields { display: grid; gap: 7px; }
  .ss-workflow-fields:empty { display: none; }
  .ss-workflow-group {
    border-top: 1px solid color-mix(in srgb, var(--ss-outline) 72%, transparent);
    padding-top: 7px;
  }
  .ss-workflow-group > summary {
    cursor: pointer;
    color: var(--lumiverse-text);
    font-size: 10px;
    font-weight: 700;
    list-style-position: inside;
  }
  .ss-workflow-group-description { margin: 4px 0 0; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-workflow-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    padding-top: 7px;
  }
  .ss-workflow-field { min-width: 0; display: grid; gap: 4px; align-content: start; }
  .ss-workflow-field[data-wide="true"] { grid-column: 1 / -1; }
  .ss-workflow-field-head { min-height: 17px; display: flex; align-items: center; gap: 6px; }
  .ss-workflow-field-head label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-workflow-toggle { margin: 0 0 0 auto; accent-color: var(--lumiverse-accent); }
  .ss-workflow-field[data-enabled="false"] > :not(.ss-workflow-field-head) { opacity: .42; pointer-events: none; }
  .ss-workflow-image-input { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px; }
  .ss-workflow-image-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-workflow-loading { display: flex; align-items: center; gap: 7px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-workflow-loading::before {
    content: "";
    width: 10px;
    height: 10px;
    border: 2px solid color-mix(in srgb, var(--lumiverse-accent) 22%, transparent);
    border-top-color: var(--lumiverse-accent);
    border-radius: 999px;
    animation: ss-spin .75s linear infinite;
  }
  .ss-workflow-modal {
    position: fixed;
    inset: 0;
    z-index: 2147483004;
    display: grid;
    place-items: center;
    padding: 24px;
    background: color-mix(in srgb, var(--ss-canvas-bg, var(--lumiverse-bg, #050608)) 72%, transparent);
    backdrop-filter: blur(max(10px, var(--ss-backdrop-blur, 10px)));
  }
  .ss-workflow-modal[hidden] { display: none; }
  .ss-workflow-modal-card {
    width: min(720px, 94vw);
    max-height: min(820px, 88dvh);
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    overflow: hidden;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-panel-radius, 14px);
    color: var(--ss-text-color, var(--lumiverse-text));
    background: color-mix(in srgb, var(--ss-panel-bg, var(--lumiverse-fill, #111116)) 97%, #000);
    box-shadow: 0 28px 90px rgba(0, 0, 0, .68), inset 0 1px rgba(255, 255, 255, .04);
  }
  .ss-workflow-modal-head,
  .ss-workflow-modal-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 13px 15px;
    border-color: var(--ss-outline, var(--lumiverse-border));
    background: color-mix(in srgb, var(--ss-header-bg, var(--lumiverse-fill-subtle)) 94%, #000);
  }
  .ss-workflow-modal-head { border-bottom: 1px solid; }
  .ss-workflow-modal-actions { justify-content: flex-end; border-top: 1px solid; }
  .ss-workflow-modal-title { min-width: 0; display: grid; gap: 2px; }
  .ss-workflow-modal-title strong { overflow: hidden; font: 600 18px/1.15 Georgia, "Times New Roman", serif; text-overflow: ellipsis; white-space: nowrap; }
  .ss-workflow-modal-description { padding: 11px 15px; color: var(--lumiverse-text-muted); font-size: 10px; line-height: 1.5; }
  .ss-workflow-modal .ss-workflow-fields { min-height: 0; overflow-y: auto; padding: 4px 15px 16px; }
  .ss-workflow-modal[data-role="save-preset-modal"],
  .ss-workflow-modal[data-role="preset-manager-modal"],
  .ss-workflow-modal:is([data-role="move-folder-modal"], [data-role="new-folder-modal"]) { z-index: 2147483200; }
  .ss-save-preset-fields { min-height: 0; display: grid; gap: 10px; overflow-y: auto; padding: 13px 15px 16px; }
  .ss-save-preset-basics { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 8px; }
  .ss-save-param-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
  .ss-save-param {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 7px;
    align-items: start;
    padding: 8px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-control-radius);
    background: color-mix(in srgb, var(--ss-button-bg) 54%, transparent);
  }
  .ss-save-param input { margin-top: 2px; accent-color: var(--lumiverse-accent); }
  .ss-save-param-copy { min-width: 0; display: grid; gap: 3px; }
  .ss-save-param-copy strong,
  .ss-save-param-copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-save-param-copy span { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-move-folder-list { min-height: 0; display: grid; gap: 6px; overflow-y: auto; padding: 13px 15px 16px; }
  .ss-move-folder-choice { justify-content: space-between; text-align: left; }
  .ss-preset-manager-list { min-height: 0; display: grid; gap: 7px; overflow-y: auto; padding: 13px 15px 16px; }
  .ss-preset-manager-row {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border: 1px solid var(--ss-outline);
    border-radius: var(--ss-control-radius);
    background: color-mix(in srgb, var(--ss-button-bg) 62%, transparent);
  }
  .ss-preset-manager-copy { min-width: 0; display: grid; gap: 3px; }
  .ss-preset-manager-copy strong,
  .ss-preset-manager-copy span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-preset-manager-copy span { color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-workflow-configure { width: 28px; height: 28px; padding: 6px; }
  .ss-workflow-configure svg { width: 14px; height: 14px; }

  .ss-miniplayer {
    --ss-mini-progress: 0%;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    min-width: 0;
    min-height: 0;
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) auto;
    gap: 9px;
    align-items: center;
    padding: 8px;
    overflow: hidden;
    color: var(--lumiverse-text, #f5f3f7);
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 38%, var(--lumiverse-border));
    border-radius: var(--ss-panel-radius, 14px);
    background:
      radial-gradient(circle at 8% 10%, color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 17%, transparent), transparent 44%),
      color-mix(in srgb, var(--lumiverse-fill, #151118) var(--ss-surface-opacity, 96%), transparent);
    box-shadow: 0 16px 45px rgba(0, 0, 0, .42), inset 0 1px rgba(255, 255, 255, .035);
    backdrop-filter: blur(var(--ss-backdrop-blur, 12px));
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }
  .ss-miniplayer-app-mount {
    display: contents !important;
    pointer-events: none;
  }
  .ss-miniplayer-app-surface {
    position: fixed;
    /* Above the chat canvas, below Lumi drawers, modals, and toasts. */
    z-index: 9978;
    left: 18px;
    top: 18px;
    width: 318px;
    height: 94px;
    pointer-events: auto;
    touch-action: manipulation;
  }
  .ss-miniplayer-app-surface .ss-mini-preview,
  .ss-miniplayer-app-surface .ss-mini-title { touch-action: none; }
  .ss-miniplayer[data-state="running"] {
    border-color: color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 68%, var(--lumiverse-border));
  }
  .ss-miniplayer[data-expanded="true"] {
    width: 100%;
    height: 100%;
    grid-template-columns: 82px minmax(0, 1fr) auto;
    grid-template-rows: auto minmax(0, 1fr);
    align-items: stretch;
    overflow: visible;
  }
  .ss-miniplayer[data-collapsed="true"] {
    display: grid;
    grid-template-columns: 1fr;
    place-items: center;
    width: 56px;
    height: 56px;
    aspect-ratio: 1;
    padding: 5px;
    border-radius: 18px;
  }
  .ss-miniplayer[data-collapsed="true"] .ss-mini-copy,
  .ss-miniplayer[data-collapsed="true"] .ss-mini-actions,
  .ss-miniplayer[data-collapsed="true"] .ss-mini-quick { display: none; }
  .ss-mini-preview {
    position: relative;
    width: 76px;
    height: 76px;
    display: grid;
    place-items: center;
    padding: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 32%, var(--lumiverse-border));
    border-radius: calc(var(--ss-control-radius, 9px) + 2px);
    color: var(--lumiverse-accent, var(--lumiverse-primary));
    background: color-mix(in srgb, var(--lumiverse-fill-subtle, #221b27) 88%, transparent);
    cursor: pointer;
  }
  .ss-miniplayer[data-collapsed="true"] .ss-mini-preview { width: 100%; height: 100%; border: 0; }
  .ss-mini-preview svg { width: 30px; height: 30px; fill: currentColor; stroke: none; }
  .ss-mini-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ss-mini-preview img[hidden] { display: none; }
  .ss-mini-live-dot {
    position: absolute;
    right: 6px;
    bottom: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--lumiverse-accent, var(--lumiverse-primary));
    box-shadow: 0 0 0 3px rgba(0, 0, 0, .45), 0 0 14px var(--lumiverse-accent, var(--lumiverse-primary));
    opacity: 0;
  }
  .ss-miniplayer[data-state="running"] .ss-mini-live-dot { opacity: 1; animation: ss-mini-pulse 1.2s ease-in-out infinite; }
  @keyframes ss-mini-pulse { 50% { transform: scale(.72); opacity: .55; } }
  .ss-mini-copy { min-width: 0; display: grid; gap: 5px; }
  .ss-mini-title { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 11px; font-weight: 750; }
  .ss-mini-state { color: var(--lumiverse-accent, var(--lumiverse-primary)); font-size: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  .ss-mini-status { overflow: hidden; color: var(--lumiverse-text-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .ss-mini-track { height: 4px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--lumiverse-border) 68%, transparent); }
  .ss-mini-fill { width: var(--ss-mini-progress); height: 100%; display: block; border-radius: inherit; background: var(--lumiverse-accent, var(--lumiverse-primary)); transition: width .18s ease; }
  .ss-miniplayer[data-indeterminate="true"] .ss-mini-fill { width: 38%; animation: ss-mini-indeterminate 1.1s ease-in-out infinite; }
  @keyframes ss-mini-indeterminate { 0% { transform: translateX(-115%); } 100% { transform: translateX(280%); } }
  .ss-mini-actions { display: grid; grid-template-columns: repeat(2, 26px); gap: 4px; }
  .ss-miniplayer[data-expanded="true"] .ss-mini-actions { grid-template-columns: repeat(2, 28px); align-content: start; }
  .ss-mini-button {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    padding: 0;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--ss-control-radius, 8px);
    color: var(--lumiverse-text-muted);
    background: color-mix(in srgb, var(--lumiverse-fill-subtle, #221b27) 82%, transparent);
    cursor: pointer;
  }
  .ss-mini-button:hover { color: var(--lumiverse-text); border-color: var(--lumiverse-accent, var(--lumiverse-primary)); }
  .ss-mini-button:disabled { opacity: .36; cursor: not-allowed; }
  .ss-mini-button svg { width: 13px; height: 13px; fill: currentColor; }
  .ss-mini-button .ss-library-symbol { fill: none !important; }
  .ss-mini-button[hidden] { display: none; }
  .ss-mini-quick {
    grid-column: 1 / -1;
    min-height: 0;
    display: none;
    grid-template-rows: auto minmax(64px, 1fr) auto auto;
    gap: 7px;
    padding-top: 8px;
    border-top: 1px solid color-mix(in srgb, var(--lumiverse-border) 70%, transparent);
  }
  .ss-miniplayer[data-expanded="true"] .ss-mini-quick { display: grid; }
  .ss-mini-quick-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .ss-mini-quick-head strong { font: 600 13px/1 Georgia, "Times New Roman", serif; }
  .ss-mini-quick-head span { color: var(--lumiverse-text-muted); font-size: 8px; }
  .ss-mini-editor-actions { display: flex; align-items: center; gap: 4px; }
  .ss-mini-editor-button,
  .ss-prompt-editor-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0;
    border: 1px solid transparent;
    color: var(--lumiverse-text-muted);
    background: transparent;
    cursor: pointer;
  }
  .ss-mini-editor-button { width: 28px; height: 20px; border-radius: 6px; }
  .ss-mini-editor-button:hover,
  .ss-mini-editor-button:focus-visible,
  .ss-prompt-editor-button:hover,
  .ss-prompt-editor-button:focus-visible {
    outline: 0;
    color: var(--lumiverse-accent, var(--lumiverse-primary));
    border-color: color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 42%, transparent);
    background: color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 9%, transparent);
  }
  .ss-mini-editor-button svg { width: 10px; height: 10px; }
  .ss-mini-editor-key { font-size: 7px; font-weight: 800; letter-spacing: .06em; }
  .ss-mini-prompt,
  .ss-mini-negative {
    width: 100%;
    resize: none;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--ss-control-radius, 8px);
    color: var(--lumiverse-text);
    background: color-mix(in srgb, var(--lumiverse-fill-subtle, #221b27) 90%, #000);
    font: inherit;
    line-height: 1.4;
    outline: 0;
  }
  .ss-mini-prompt { min-height: 62px; padding: 8px 9px; font-size: 10px; }
  .ss-mini-negative { height: 31px; padding: 6px 8px; font-size: 9px; }
  .ss-mini-prompt:focus,
  .ss-mini-negative:focus { border-color: var(--lumiverse-accent, var(--lumiverse-primary)); }
  .ss-mini-quick-actions { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
  .ss-mini-connection { overflow: hidden; color: var(--lumiverse-text-muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
  .ss-mini-generate {
    min-height: 31px;
    padding: 6px 13px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 55%, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    color: color-mix(in srgb, var(--lumiverse-accent-contrast, #09080b) 92%, #000);
    background: var(--lumiverse-accent, var(--lumiverse-primary));
    font-size: 9px;
    font-weight: 750;
    cursor: pointer;
  }
  .ss-mini-generate:disabled { opacity: .48; cursor: not-allowed; }
  .ss-mini-generate[data-running="true"] {
    color: #fff;
    border-color: color-mix(in srgb, #ff6f7c 70%, var(--lumiverse-border));
    background: color-mix(in srgb, #d83749 74%, var(--ss-button-bg));
  }
  .ss-mini-context-menu {
    position: fixed;
    z-index: 10020;
    width: min(210px, calc(100vw - 16px));
    display: grid;
    gap: 4px;
    padding: 6px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 34%, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 10px);
    color: var(--lumiverse-text, #f5f3f7);
    background: color-mix(in srgb, var(--lumiverse-fill, #151118) 97%, #000);
    box-shadow: 0 18px 52px rgba(0, 0, 0, .62);
    pointer-events: auto;
  }
  .ss-mini-context-menu[hidden] { display: none; }
  .ss-mini-context-action {
    min-height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 9px;
    border: 0;
    border-radius: calc(var(--ss-control-radius, 8px) - 2px);
    color: inherit;
    background: transparent;
    font: 600 10px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
  }
  .ss-mini-context-action:hover,
  .ss-mini-context-action:focus-visible { outline: 0; background: color-mix(in srgb, var(--lumiverse-accent, var(--lumiverse-primary)) 18%, transparent); }
  .ss-mini-context-action:disabled { opacity: .38; cursor: not-allowed; }
  .ss-mini-context-action svg { width: 14px; height: 14px; flex: 0 0 auto; fill: currentColor; }
  .ss-mini-context-separator { height: 1px; margin: 2px 4px; background: var(--lumiverse-border); }

  @media (max-width: 720px) {
    .ss-miniplayer[data-mobile-orb="true"],
    .ss-miniplayer[data-collapsed="true"] {
      display: grid;
      grid-template-columns: 1fr;
      place-items: center;
      width: 64px;
      height: 64px;
      max-width: 100%;
      max-height: 100%;
      box-sizing: border-box;
      aspect-ratio: 1;
      overflow: hidden;
      padding: 3px;
      border-radius: 13px;
    }
    .ss-miniplayer[data-mobile-orb="true"] .ss-mini-copy,
    .ss-miniplayer[data-mobile-orb="true"] .ss-mini-actions,
    .ss-miniplayer[data-mobile-orb="true"] .ss-mini-quick { display: none; }
    .ss-miniplayer[data-mobile-orb="true"] .ss-mini-preview { width: 100%; height: 100%; border: 0; }
    .ss-workflow-field-grid { grid-template-columns: 1fr; }
    .ss-workflow-field[data-wide="true"] { grid-column: auto; }
    .ss-workflow-picker { grid-template-columns: minmax(0, 1fr) auto; }
    .ss-workflow-configure { grid-column: 1 / -1; justify-self: end; }
    .ss-miniplayer { grid-template-columns: 58px minmax(0, 1fr) auto; padding: 6px; }
    .ss-mini-preview { width: 58px; height: 58px; }
    .ss-miniplayer[data-expanded="true"] { grid-template-columns: 60px minmax(0, 1fr) auto; }
    .ss-mini-prompt { font-size: 9px; }
    .ss-mini-negative { font-size: 8px; }
    .ss-workflow-modal { padding: 8px; place-items: stretch; }
    .ss-workflow-modal-card { width: 100%; max-height: calc(100dvh - 16px); }
    .ss-save-preset-basics,
    .ss-save-param-list { grid-template-columns: 1fr; }
  }

  @media (max-width: 470px) {
    .ss-brand span { display: none; }
    .ss-mobile-tab { padding-inline: 11px; }
    .ss-lora-grid { grid-template-columns: 1fr; }
    .ss-library-tools { grid-template-columns: minmax(0, 1fr) auto minmax(104px, 34vw) auto auto; }
    .ss-lora-download-toggle span { display: none; }
    .ss-lora-card { grid-template-columns: 96px minmax(0, 1fr); }
    .ss-lora-card .ss-lora-footer { left: 103px; }
    .ss-history-pane .ss-history-grid { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ss-command-summary { max-width: 45%; }
    .ss-commandbar .ss-generate { min-width: 0; flex: 1; }
    .ss-stack-row {
      grid-template-columns: auto 34px minmax(90px, 1fr) 67px auto;
    }
    .ss-stack-row .ss-trigger-toggle { grid-column: 3 / -1; }
  }
`
