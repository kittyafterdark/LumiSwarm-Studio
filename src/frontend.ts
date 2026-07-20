type FrontendContext = any
type StudioTheme = "lumiverse" | "moonbloom" | "sakura" | "verdant"
type AppearanceColorKey = "accent" | "canvas" | "panel" | "header" | "outline" | "button" | "text"

interface StudioAppearance {
  colors: Partial<Record<AppearanceColorKey, string>>
  radius: number | null
  opacity: number
  blur: number
  customCss: string
}

interface LoraMetadata {
  name: string
  title: string
  author: string
  description: string
  previewRef: string | null
  architecture: string
  className: string
  compatClass: string
  resolution: string
  standardWidth: number | null
  standardHeight: number | null
  license: string
  date: string
  usageHint: string
  triggerPhrase: string
  tags: string[]
  defaultWeight: number
  defaultConfinement: number | null
  local: boolean
  timeCreated: number | null
  timeModified: number | null
  hash: string
}

interface StackItem {
  lora: LoraMetadata
  weight: number
  enabled: boolean
  useTrigger: boolean
}

interface CheckpointMetadata {
  name: string
  title: string
  architecture: string
  className: string
  compatClass: string
}

interface StackPresetItem {
  name: string
  title: string
  weight: number
  enabled: boolean
  useTrigger: boolean
}

interface StackPreset {
  id: string
  name: string
  items: StackPresetItem[]
  updatedAt: number
}

interface GenerationDetails {
  prompt: string
  negativePrompt: string
  resolvedPrompt?: string
  resolvedNegativePrompt?: string
  model: string
  parameters: Record<string, unknown>
  loras: Array<{ name: string; weight: number }>
  presets?: string[]
  timing?: {
    totalMs: number
    prep: string
    generation: string
    source: "swarm" | "measured"
  }
  swarmPath?: string
  initImageId?: string
  initImageLabel?: string
  createdAt: number
}

interface CurrentImage {
  id?: string
  src: string
  url?: string
  label: string
  details?: GenerationDetails | null
}

interface SwarmPreset {
  title: string
  description: string
  paramMap: Record<string, string>
}

interface SwarmParameter {
  id: string
  name: string
  type: string
  description: string
}

interface SelectedPreset {
  title: string
  enabled: boolean
}

interface OutputFolder {
  id: string
  name: string
  imageIds: string[]
  updatedAt: number
}

interface InitImage {
  data: string
  mimeType: string
  src: string
  label: string
  imageId: string
}

interface StudioState {
  connections: any[]
  connection: any | null
  models: Array<{ id: string; label: string }>
  checkpoints: CheckpointMetadata[]
  loras: LoraMetadata[]
  stack: StackItem[]
  stackPresets: StackPreset[]
  swarmPresets: SwarmPreset[]
  swarmParameters: SwarmParameter[]
  canManagePresets: boolean
  selectedPresets: SelectedPreset[]
  samplers: string[]
  schedulers: string[]
  outputs: any[]
  outputTotal: number
  outputOffset: number
  outputLimit: number
  outputFolders: OutputFolder[]
  libraryOutputs: any[]
  activeChat: any | null
  permissions: Record<string, boolean>
  hasMetadataToken: boolean
  currentImage: CurrentImage | null
  initImage: InitImage | null
}

type ModelFamily =
  | "anima"
  | "illustrious"
  | "pony"
  | "sdxl"
  | "sd15"
  | "flux"
  | "sd3"
  | "chroma"
  | "qwen"
  | "hunyuan"
  | "unknown"

const STUDIO_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5.5h16v13H4z"/><path d="m7 15 3-3 2.2 2.2 2.3-2.8L18 15"/>
    <path d="M8 8.5h.01"/><path d="M17.5 2.8v4M15.5 4.8h4"/>
  </svg>
`

const PORTRAIT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="m10 8 2-2 2 2M12 6v7"/></svg>
`

const LANDSCAPE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="m16 10 2 2-2 2M18 12h-7"/></svg>
`

const RANDOM_SEED_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3c4 0 6 10 10 10h3M17 14l3 3-3 3M4 17h3c1.5 0 2.7-1.3 3.8-3M14 7c1-1.7 2-3 3-3h3M17 1l3 3-3 3"/><path d="M12 11.5h.01"/></svg>
`

const CURRENT_SEED_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/><path d="M17.5 3.5 20 1m-1 4h3"/></svg>
`

const LINK_SIZE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9.5"/><path d="M7.2 16.8 5.7 18.3a3.5 3.5 0 0 1-5-5l3.1-3.1a3.5 3.5 0 0 1 5 0"/><path d="m16.8 7.2 1.5-1.5a3.5 3.5 0 1 1 5 5l-3.1 3.1a3.5 3.5 0 0 1-5 0"/></svg>
`

const LIBRARY_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/><path d="m7 17 3-3 2 2 2.5-3 2.5 4"/></svg>
`

const SETTINGS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.82 2.82-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.82-2.82.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3v-4h.04A1.7 1.7 0 0 0 4.6 8.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.82-2.82.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3V3h4v.08a1.7 1.7 0 0 0 1.04 1.48 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.82 2.82-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.96 10H21v4h-.04A1.7 1.7 0 0 0 19.4 15Z"/></svg>
`

const THEME_STORAGE_KEY = "swarm-studio-theme-v1"
const APPEARANCE_STORAGE_KEY = "swarm-studio-appearance-v1"
const STUDIO_THEMES: Array<{ id: StudioTheme; label: string; color: string }> = [
  { id: "lumiverse", label: "Lumiverse", color: "var(--lumiverse-primary, #7dd3fc)" },
  { id: "moonbloom", label: "Moonbloom", color: "#b789ff" },
  { id: "sakura", label: "Sakura", color: "#ff7fa8" },
  { id: "verdant", label: "Verdant", color: "#71dda5" },
]
const APPEARANCE_COLORS: Array<{ key: AppearanceColorKey; label: string; cssProperty: string }> = [
  { key: "accent", label: "Accent", cssProperty: "--lumiverse-accent" },
  { key: "button", label: "Buttons", cssProperty: "--ss-button-bg" },
  { key: "header", label: "Headers", cssProperty: "--ss-header-bg" },
  { key: "panel", label: "Panels", cssProperty: "--ss-panel-bg" },
  { key: "outline", label: "Outlines", cssProperty: "--ss-outline" },
  { key: "canvas", label: "Background", cssProperty: "--ss-canvas-bg" },
  { key: "text", label: "Text", cssProperty: "--lumiverse-text" },
]

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
  .ss-launcher-top { display: flex; align-items: center; gap: 11px; }
  .ss-launcher-mark {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 13%, transparent);
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 35%, var(--lumiverse-border));
  }
  .ss-launcher-mark svg { width: 23px; height: 23px; }
  .ss-launcher-eyebrow {
    color: var(--lumiverse-accent, #7dd3fc);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .15em;
    text-transform: uppercase;
  }
  .ss-launcher h3 { margin: 2px 0 0; font-size: 16px; }
  .ss-launcher p { margin: 13px 0 12px; color: var(--lumiverse-text-muted); font-size: 11px; line-height: 1.55; }
  .ss-launcher-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 14px; }
  .ss-launcher-chip {
    padding: 3px 7px;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 22%, var(--lumiverse-border));
    border-radius: 999px;
    color: var(--lumiverse-text-muted);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 6%, transparent);
    font-size: 8.5px;
  }
  .ss-launcher-actions { display: grid; grid-template-columns: 1fr; gap: 8px; }
  .ss-launcher-actions .ss-button {
    min-width: 0;
    min-height: 62px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    align-items: center;
    justify-content: stretch;
    gap: 10px;
    padding: 10px 12px;
    text-align: left;
  }
  .ss-launcher-actions svg { width: 23px; height: 23px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .ss-launcher-action-copy { min-width: 0; display: grid; gap: 2px; }
  .ss-launcher-action-copy strong { font-size: 11px; }
  .ss-launcher-action-copy span { overflow: hidden; color: var(--lumiverse-text-muted); font-size: 8.5px; text-overflow: ellipsis; white-space: nowrap; }
  .ss-launcher-arrow { color: var(--lumiverse-text-muted); font-size: 17px; }
  .ss-launcher-flow {
    display: grid;
    grid-template-columns: 1fr;
    gap: 7px;
    margin-top: 16px;
  }
  .ss-launcher-flow-item {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 9px;
    padding: 9px 10px;
    border-left: 2px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 55%, var(--ss-outline));
    border-radius: var(--ss-control-radius, var(--lumiverse-radius, 8px));
    background: color-mix(in srgb, var(--ss-header-bg) 72%, transparent);
  }
  .ss-launcher-flow-item > span {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--lumiverse-accent, #7dd3fc);
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 13%, transparent);
    font-size: 9px;
    font-weight: 800;
  }
  .ss-launcher-flow-item strong { display: block; font-size: 9.5px; }
  .ss-launcher-flow-item small { display: block; margin-top: 2px; color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.4; }
  .ss-launcher-theme-row {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: auto;
    padding-top: 11px;
    border-top: 1px solid color-mix(in srgb, var(--lumiverse-border) 72%, transparent);
  }
  .ss-launcher-theme-row > span { margin-right: auto; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-theme-swatch {
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
    padding: 0;
    border: 1px solid var(--lumiverse-border);
    border-radius: 50%;
    background: var(--ss-swatch);
    box-shadow: inset 0 0 0 4px var(--lumiverse-fill-subtle);
  }
  .ss-theme-swatch[data-active="true"] {
    border-color: var(--ss-swatch);
    box-shadow: inset 0 0 0 3px var(--lumiverse-fill-subtle), 0 0 0 2px color-mix(in srgb, var(--ss-swatch) 42%, transparent);
  }
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="lumiverse"] {
    --lumiverse-accent: var(--lumiverse-primary, #7dd3fc);
  }
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="moonbloom"] {
    --lumiverse-accent: #b789ff;
    --lumiverse-bg: #08050e;
    --lumiverse-fill: #120b1b;
    --lumiverse-fill-subtle: #21112f;
    --lumiverse-border: #684589;
    --lumiverse-text: #fff9ff;
    --lumiverse-text-muted: #c6b4d8;
    --ss-canvas-bg: #08050e;
    --ss-panel-bg: #150b20;
    --ss-header-bg: #2a123d;
    --ss-outline: #684589;
    --ss-button-bg: #32164a;
    --ss-control-radius: 12px;
    --ss-panel-radius: 17px;
    --ss-slider-radius: 999px;
    --ss-theme-pattern: radial-gradient(circle at 82% 12%, rgba(196,167,255,.10), transparent 28%), radial-gradient(circle, rgba(196,167,255,.13) 1px, transparent 1.3px);
    --ss-theme-pattern-size: auto, 25px 25px;
  }
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="sakura"] {
    --lumiverse-accent: #ff7fa8;
    --lumiverse-bg: #12060b;
    --lumiverse-fill: #1d0c13;
    --lumiverse-fill-subtle: #31101d;
    --lumiverse-border: #7d334d;
    --lumiverse-text: #fff7f9;
    --lumiverse-text-muted: #d4afba;
    --ss-canvas-bg: #12060b;
    --ss-panel-bg: #210c15;
    --ss-header-bg: #3a1222;
    --ss-outline: #7d334d;
    --ss-button-bg: #49152a;
    --ss-control-radius: 16px;
    --ss-panel-radius: 20px;
    --ss-slider-radius: 999px;
    --ss-theme-pattern: radial-gradient(ellipse at 8% 8%, rgba(255,159,186,.10), transparent 26%), repeating-linear-gradient(135deg, transparent 0 28px, rgba(255,159,186,.035) 28px 29px);
    --ss-theme-pattern-size: auto;
  }
  :is(.ss-shell, .ss-launcher, .ss-modal-theme)[data-theme="verdant"] {
    --lumiverse-accent: #71dda5;
    --lumiverse-bg: #06100b;
    --lumiverse-fill: #0b1a12;
    --lumiverse-fill-subtle: #123020;
    --lumiverse-border: #397b58;
    --lumiverse-text: #f2fff8;
    --lumiverse-text-muted: #a8c9b8;
    --ss-canvas-bg: #06100b;
    --ss-panel-bg: #0c1e14;
    --ss-header-bg: #153d28;
    --ss-outline: #397b58;
    --ss-button-bg: #184b30;
    --ss-control-radius: 6px;
    --ss-panel-radius: 10px;
    --ss-slider-radius: 3px;
    --ss-theme-pattern: linear-gradient(120deg, rgba(154,215,180,.04) 25%, transparent 25% 75%, rgba(154,215,180,.04) 75%), linear-gradient(30deg, rgba(154,215,180,.04) 25%, transparent 25% 75%, rgba(154,215,180,.04) 75%);
    --ss-theme-pattern-size: 34px 58px;
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
  .ss-config-popover {
    position: absolute;
    right: 0;
    top: 40px;
    z-index: 40;
    width: min(460px, calc(100vw - 28px));
    max-height: min(780px, calc(100dvh - 72px));
    overflow-y: auto;
    display: grid;
    gap: 11px;
    padding: 12px;
    border: 1px solid var(--ss-outline, var(--lumiverse-border));
    border-radius: var(--ss-panel-radius, var(--lumiverse-radius, 10px));
    background:
      linear-gradient(var(--ss-panel-bg, rgba(20,21,26,.98)), var(--ss-panel-bg, rgba(20,21,26,.98))),
      #0a0a0e;
    box-shadow: 0 18px 54px rgba(0,0,0,.68), inset 0 1px rgba(255,255,255,.035);
    backdrop-filter: blur(max(14px, var(--ss-backdrop-blur, 10px)));
  }
  .ss-config-popover[hidden] { display: none; }
  .ss-config-section { display: grid; gap: 7px; }
  .ss-config-section + .ss-config-section { padding-top: 10px; border-top: 1px solid var(--ss-outline, var(--lumiverse-border)); }
  .ss-config-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 7px; }
  .ss-config-section-head strong { font-size: 10px; }
  .ss-config-section-head span { color: var(--lumiverse-text-muted); font-size: 8.5px; }
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
  .ss-top-actions { display: flex; align-items: center; gap: 6px; }
  .ss-top-actions .ss-button { white-space: nowrap; }
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
  .ss-preset-picker { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px; }
  .ss-preset-picker .ss-button[hidden] { display: none; }
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
  .ss-init-head { display: flex; align-items: center; gap: 5px; }
  .ss-init-label { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9px; }
  .ss-init-actions { display: flex; flex-wrap: wrap; gap: 5px; }
  .ss-init-actions .ss-button { min-height: 27px; padding: 4px 7px; }
  .ss-creativity-row { display: grid; grid-template-columns: auto minmax(0, 1fr) 30px; gap: 6px; align-items: center; font-size: 9px; color: var(--lumiverse-text-muted); }
  .ss-preset-stack {
    display: grid;
    gap: 5px;
    margin-top: 2px;
  }
  .ss-preset-empty { min-height: 42px; padding: 8px; }
  .ss-preset-row {
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto auto;
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
  .ss-lora-dock-content {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(220px, var(--ss-library-width)) 8px minmax(240px, 1fr);
    gap: 0;
    padding: 9px 8px 8px;
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
  .ss-lora-titlebar .ss-pane-toggle { flex: 0 0 auto; }
  .ss-lora-dock .ss-section-head { min-height: 27px; margin-bottom: 0; }
  .ss-library-tools {
    grid-template-columns: minmax(140px, 1fr) 135px 100px auto;
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
  .ss-lora-grid {
    flex: 1;
    min-height: 0;
    max-height: none;
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
  .ss-shell.ss-loras-collapsed .ss-lora-dock { flex-basis: 32px; }
  .ss-shell.ss-loras-collapsed .ss-dock-resizer,
  .ss-shell.ss-loras-collapsed .ss-library-tools,
  .ss-shell.ss-loras-collapsed .ss-library-status,
  .ss-shell.ss-loras-collapsed .ss-lora-grid,
  .ss-shell.ss-loras-collapsed .ss-lora-divider,
  .ss-shell.ss-loras-collapsed .ss-stack-pane,
  .ss-shell.ss-loras-collapsed .ss-lora-titlebar > :not(.ss-pane-toggle) { display: none; }
  .ss-shell.ss-loras-collapsed .ss-lora-dock-content { display: block; padding: 2px 5px; }
  .ss-shell.ss-loras-collapsed .ss-lora-library { display: block; padding: 0; }
  .ss-shell.ss-loras-collapsed .ss-lora-titlebar { justify-content: flex-end; min-height: 26px; }
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
  .ss-inspector-actions [data-action="open-output-library"] {
    grid-column: 1 / -1;
    width: min(210px, 100%);
    justify-self: center;
  }
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
    z-index: 2147483008;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    grid-template-rows: 52px minmax(0, 1fr);
    background: color-mix(in srgb, var(--ss-canvas-bg, var(--lumiverse-bg, #050608)) 98%, transparent);
    backdrop-filter: blur(12px);
  }
  .ss-output-library[hidden] { display: none; }
  .ss-library-head {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-bottom: 1px solid var(--ss-outline, var(--lumiverse-border));
    background: var(--ss-header-bg, var(--lumiverse-fill-subtle));
  }
  .ss-library-head strong { font-size: 14px; }
  .ss-library-head .ss-muted { flex: 1; }
  .ss-library-folders {
    min-height: 0;
    overflow-y: auto;
    padding: 10px;
    border-right: 1px solid var(--lumiverse-border);
    background: var(--lumiverse-fill-subtle);
  }
  .ss-library-folder {
    width: 100%;
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
    margin-bottom: 5px;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: var(--lumiverse-text);
    text-align: left;
  }
  .ss-library-folder:hover,
  .ss-library-folder[data-active="true"] {
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 45%, var(--lumiverse-border));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 10%, transparent);
  }
  .ss-library-folder span:first-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ss-library-folder-tools { display: flex; gap: 5px; margin: 10px 0; }
  .ss-library-folder-tools .ss-button { flex: 1; min-width: max-content; white-space: nowrap; }
  .ss-library-main {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .ss-library-toolbar {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--lumiverse-border);
  }
  .ss-library-toolbar .ss-muted { flex: 0 0 auto; }
  .ss-library-search {
    min-width: 150px;
    max-width: 360px;
    flex: 1 1 260px;
    margin-left: auto;
  }
  .ss-library-search .ss-input { width: 100%; height: 30px; padding-block: 4px; font-size: 9.5px; }
  .ss-library-bulkbar {
    min-height: 40px;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--lumiverse-border);
    background: color-mix(in srgb, var(--lumiverse-fill-subtle) 80%, transparent);
  }
  .ss-library-bulkbar .ss-select { width: min(230px, 28vw); height: 30px; }
  .ss-library-bulkbar .ss-button { min-height: 30px; padding-block: 4px; }
  .ss-library-selection-count { min-width: 72px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-output-library-grid {
    min-height: 0;
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    grid-auto-rows: max-content;
    align-content: start;
    gap: 9px;
    overflow-y: auto;
    padding: 10px;
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
  .ss-library-output-check input { width: 14px; height: 14px; accent-color: var(--lumiverse-accent, #7dd3fc); }
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
  .ss-library-output-meta .ss-select { height: 28px; font-size: 9px; }
  .ss-token-popover { z-index: 30; }

  @media (max-width: 1000px) and (min-width: 721px) {
    .ss-shell {
      --ss-generation-width: 245px;
      --ss-history-width: 205px;
      --ss-library-width: 58%;
    }
    .ss-library-tools { grid-template-columns: minmax(120px, 1fr) 125px auto; }
    .ss-library-tools [data-role="lora-sort"] { display: none; }
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
    .ss-config-popover { position: fixed; top: 54px; right: 8px; width: calc(100vw - 16px); }
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
    .ss-library-tools { grid-template-columns: minmax(0, 1fr) 120px auto; }
    .ss-library-tools [data-role="lora-sort"] { display: none; }
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
      grid-template-columns: 1fr;
      grid-template-rows: 50px auto minmax(0, 1fr);
    }
    .ss-library-head { grid-column: 1; }
    .ss-library-folders {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 7px;
      border-right: 0;
      border-bottom: 1px solid var(--lumiverse-border);
    }
    .ss-library-folder { width: auto; min-width: max-content; margin: 0; }
    .ss-library-folder-tools { min-width: max-content; flex: 0 0 auto; margin: 0; }
    .ss-library-folder-tools .ss-button { min-width: 92px; }
    .ss-library-toolbar { flex-wrap: wrap; }
    .ss-library-search { order: 5; min-width: 100%; max-width: none; flex-basis: 100%; margin-left: 0; }
    .ss-library-bulkbar {
      overflow-x: auto;
      padding-inline: 2.2vw;
    }
    .ss-library-bulkbar > * { flex: 0 0 auto; }
    .ss-library-bulkbar .ss-select { width: 42vw; }
    .ss-output-library-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: max-content;
      gap: 2.2vw;
      padding: 2.2vw;
    }
  }

  @media (max-width: 470px) {
    .ss-brand span { display: none; }
    .ss-mobile-tab { padding-inline: 11px; }
    .ss-lora-grid { grid-template-columns: 1fr; }
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

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function storedStudioTheme(): StudioTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (STUDIO_THEMES.some((theme) => theme.id === value)) return value as StudioTheme
  } catch {
    // Storage can be disabled in hardened browser contexts.
  }
  return "lumiverse"
}

function persistStudioTheme(theme: StudioTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The active session can still use the selected theme.
  }
}

function defaultStudioAppearance(): StudioAppearance {
  return {
    colors: {},
    radius: null,
    opacity: 96,
    blur: 12,
    customCss: "",
  }
}

function normalizeHexColor(value: unknown): string | null {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color.slice(1).split("").map((part) => `${part}${part}`).join("")}`.toLowerCase()
  }
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (!rgb) return null
  return `#${rgb.slice(1, 4)
    .map((part) => clamp(Math.round(Number(part)), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`
}

function storedStudioAppearance(): StudioAppearance {
  const fallback = defaultStudioAppearance()
  try {
    const parsed = JSON.parse(window.localStorage.getItem(APPEARANCE_STORAGE_KEY) || "{}")
    const colors: StudioAppearance["colors"] = {}
    for (const { key } of APPEARANCE_COLORS) {
      const color = normalizeHexColor(parsed?.colors?.[key])
      if (color) colors[key] = color
    }
    return {
      colors,
      radius: Number.isFinite(parsed?.radius) ? clamp(Number(parsed.radius), 0, 28) : null,
      opacity: Number.isFinite(parsed?.opacity) ? clamp(Number(parsed.opacity), 45, 100) : fallback.opacity,
      blur: Number.isFinite(parsed?.blur) ? clamp(Number(parsed.blur), 0, 30) : fallback.blur,
      customCss: String(parsed?.customCss || "").slice(0, 32768),
    }
  } catch {
    return fallback
  }
}

function persistStudioAppearance(appearance: StudioAppearance): void {
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance))
  } catch {
    // The appearance still applies for the active session.
  }
}

function cloneStudioAppearance(appearance: StudioAppearance): StudioAppearance {
  return {
    ...appearance,
    colors: { ...appearance.colors },
  }
}

export function sanitizeCustomCss(value: unknown): string {
  return String(value || "")
    .slice(0, 32768)
    .replace(/@import\s+(?:url\()?[^;]+;?/gi, "/* @import removed by Swarm Studio */")
    .replace(/expression\s*\(/gi, "/* expression removed */(")
}

function applyAppearanceVariables(target: HTMLElement, appearance: StudioAppearance): void {
  for (const { key, cssProperty } of APPEARANCE_COLORS) {
    const color = appearance.colors[key]
    const properties = [
      cssProperty,
      ...(key === "canvas" ? ["--lumiverse-bg"] : []),
      ...(key === "panel" ? ["--lumiverse-fill"] : []),
      ...(key === "header" ? ["--lumiverse-fill-subtle"] : []),
      ...(key === "outline" ? ["--lumiverse-border"] : []),
    ]
    for (const property of properties) {
      if (color) target.style.setProperty(property, color)
      else target.style.removeProperty(property)
    }
  }
  target.style.setProperty("--ss-surface-opacity", `${clamp(appearance.opacity, 45, 100)}%`)
  target.style.setProperty("--ss-backdrop-blur", `${clamp(appearance.blur, 0, 30)}px`)
  if (appearance.radius === null) {
    target.style.removeProperty("--ss-control-radius")
    target.style.removeProperty("--ss-panel-radius")
    target.style.removeProperty("--ss-slider-radius")
  } else {
    const radius = clamp(appearance.radius, 0, 28)
    target.style.setProperty("--ss-control-radius", `${radius}px`)
    target.style.setProperty("--ss-panel-radius", `${Math.min(36, radius + 5)}px`)
    target.style.setProperty("--ss-slider-radius", `${radius}px`)
  }
}

function numberValue(input: HTMLInputElement, fallback: number): number {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function fitAspectWithin(
  aspect: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const safeAspect = clamp(Number(aspect) || 1, 0.1, 10)
  let width = Math.max(1, maxWidth)
  let height = width / safeAspect
  if (height > maxHeight) {
    height = Math.max(1, maxHeight)
    width = height * safeAspect
  }
  return { width, height }
}

export function matchesKeywordQuery(query: string, values: unknown[]): boolean {
  const keywords = (String(query || "").toLowerCase().match(/"[^"]+"|\S+/g) || [])
    .map((keyword) => keyword.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
  if (!keywords.length) return true
  const haystack = values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ")
  return keywords.every((keyword) => haystack.includes(keyword))
}

export function outputLibraryPageSize(viewportWidth: number): number {
  return viewportWidth <= 720 ? 15 : 30
}

const ASPECT_PRESETS: Record<string, { label: string; width: number; height: number }> = {
  "1:1": { label: "Square · 1:1", width: 1024, height: 1024 },
  "2:3": { label: "Portrait · 2:3", width: 832, height: 1216 },
  "3:2": { label: "Landscape · 3:2", width: 1216, height: 832 },
  "4:5": { label: "Portrait · 4:5", width: 896, height: 1152 },
  "5:4": { label: "Landscape · 5:4", width: 1152, height: 896 },
  "9:16": { label: "Tall · 9:16", width: 768, height: 1344 },
  "16:9": { label: "Wide · 16:9", width: 1344, height: 768 },
}

function roundModelSize(value: number): number {
  return clamp(Math.round(value / 64) * 64, 64, 4096)
}

export function dimensionsForAspect(
  aspect: string,
  scale: number,
): { width: number; height: number } {
  const preset = ASPECT_PRESETS[aspect] || ASPECT_PRESETS["1:1"]
  const factor = clamp(Number(scale) || 1024, 256, 2048) / 1024
  return {
    width: roundModelSize(preset.width * factor),
    height: roundModelSize(preset.height * factor),
  }
}

export function applyPresetPrompt(base: string, update: string): string {
  const cleanUpdate = String(update || "").trim()
  if (!cleanUpdate) return base
  return cleanUpdate
}

export function applyPresetStackPrompts(
  prompt: string,
  negativePrompt: string,
  titles: string[],
  presets: Array<{ title: string; paramMap: Record<string, string> }>,
): { prompt: string; negativePrompt: string } {
  let resolvedPrompt = prompt
  let resolvedNegative = negativePrompt
  for (const title of titles) {
    const preset = presets.find((item) => item.title === title)
    if (!preset) continue
    resolvedPrompt = applyPresetPrompt(resolvedPrompt, preset.paramMap.prompt || "")
    resolvedNegative = applyPresetPrompt(
      resolvedNegative,
      preset.paramMap.negativeprompt || preset.paramMap.negative_prompt || "",
    )
  }
  return { prompt: resolvedPrompt, negativePrompt: resolvedNegative }
}

function labelFromName(name: string): string {
  const leaf = name.split("/").pop() || name
  return leaf.replace(/\.(safetensors|ckpt|pt)$/i, "")
}

function normalizeModelName(value: string): string {
  return String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.(safetensors|ckpt|pt)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

function normalizeCompat(value: string): string {
  return String(value || "").trim().toLowerCase().replace(/[\s_.]+/g, "-")
}

export function inferModelFamily(...values: string[]): ModelFamily {
  const text = values.join(" ").toLowerCase().replace(/[_./\\-]+/g, " ")
  const compact = text.replace(/[^a-z0-9]+/g, "")
  if (/\banima\b|\banima1\b/.test(text) || (compact.includes("anima") && !compact.includes("animation"))) return "anima"
  if (/\billustrious\b|\bnoob\s*ai\b|\bwai\s*(?:nsfw|ani|illustrious)\b/.test(text)) return "illustrious"
  if (/\bpony\b|\bpdxl\b/.test(text)) return "pony"
  if (/\bflux\b/.test(text)) return "flux"
  if (/\bchroma\b/.test(text)) return "chroma"
  if (/\bstable diffusion 3\b|\bsd3\b/.test(text)) return "sd3"
  if (/\bqwen\b/.test(text)) return "qwen"
  if (/\bhunyuan\b/.test(text)) return "hunyuan"
  if (/\bsdxl\b|\bstable diffusion xl\b|\bxl 1\b/.test(text)) return "sdxl"
  if (/\bsd ?1[ ._-]?5\b|\bstable diffusion v?1\b/.test(text)) return "sd15"
  return "unknown"
}

export function modelSignalsCompatible(
  checkpointCompatValue: string,
  loraCompatValue: string,
  checkpointSignals: string[],
  loraSignals: string[],
): boolean {
  const checkpointCompat = normalizeCompat(checkpointCompatValue)
  const loraCompat = normalizeCompat(loraCompatValue)
  if (checkpointCompat && loraCompat) {
    if (checkpointCompat === loraCompat) return true
    if (checkpointCompat.startsWith("stable-diffusion-v3") && loraCompat.startsWith("stable-diffusion-v3")) return true
    if (checkpointCompat.startsWith("chroma") && loraCompat.startsWith("flux-1")) return true
    return false
  }
  const checkpointFamily = inferModelFamily(...checkpointSignals)
  const loraFamily = inferModelFamily(...loraSignals)
  if (checkpointFamily === "unknown" || loraFamily === "unknown") return true
  return checkpointFamily === loraFamily
}

function familyLabel(family: ModelFamily): string {
  const labels: Record<ModelFamily, string> = {
    anima: "Anima",
    illustrious: "Illustrious",
    pony: "Pony",
    sdxl: "SDXL",
    sd15: "SD 1.5",
    flux: "Flux",
    sd3: "SD3",
    chroma: "Chroma",
    qwen: "Qwen",
    hunyuan: "Hunyuan",
    unknown: "Unknown family",
  }
  return labels[family]
}

function manualLora(name: string, title = ""): LoraMetadata {
  return {
    name,
    title: title || labelFromName(name),
    author: "",
    description: "Manually added without SwarmUI metadata.",
    previewRef: null,
    architecture: "",
    className: "",
    compatClass: "",
    resolution: "",
    standardWidth: null,
    standardHeight: null,
    license: "",
    date: "",
    usageHint: "",
    triggerPhrase: "",
    tags: [],
    defaultWeight: 1,
    defaultConfinement: null,
    local: true,
    timeCreated: null,
    timeModified: null,
    hash: "",
  }
}

class StudioController {
  private readonly ctx: FrontendContext
  private readonly modal: any
  private readonly root: HTMLElement
  private readonly onThemeChange: (theme: StudioTheme) => void
  private readonly onAppearanceChange: (appearance: StudioAppearance) => void
  private appearance = defaultStudioAppearance()
  private appearanceControlsInitialized = false
  private readonly state: StudioState
  private previewObserver: IntersectionObserver | null = null
  private readonly previewCache = new Map<string, string>()
  private readonly requestedPreviews = new Set<string>()
  private connectionRequestId = ""
  private generating = false
  private currentJobId = ""
  private pendingGeneration: GenerationDetails | null = null
  private preGenerationImage: CurrentImage | null = null
  private imageScale = 1
  private previewAspect = 1
  private libraryFolderId = ""
  private libraryPage = 0
  private readonly librarySelection = new Set<string>()
  private outputResizeObserver: ResizeObserver | null = null
  private inspectorResizeObserver: ResizeObserver | null = null
  private stopActiveResize: (() => void) | null = null
  private disposed = false
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    const config = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    if (config && !config.hidden) {
      this.closeConfigPopover()
      event.stopPropagation()
      return
    }
    const inspector = this.root.querySelector<HTMLElement>('[data-role="inspector"]')
    if (inspector && !inspector.hidden) {
      this.closeInspector()
      event.stopPropagation()
      return
    }
    const library = this.root.querySelector<HTMLElement>('[data-role="output-library"]')
    if (library && !library.hidden) {
      this.closeOutputLibrary()
      event.stopPropagation()
      return
    }
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell?.classList.contains("ss-fullscreen-layer")) {
      this.toggleFullscreen(false)
      event.stopPropagation()
    }
  }

  constructor(
    ctx: FrontendContext,
    modal: any,
    onThemeChange: (theme: StudioTheme) => void,
    onAppearanceChange: (appearance: StudioAppearance) => void,
  ) {
    this.ctx = ctx
    this.modal = modal
    this.root = modal.root
    this.onThemeChange = onThemeChange
    this.onAppearanceChange = onAppearanceChange
    this.state = {
      connections: [],
      connection: null,
      models: [],
      checkpoints: [],
      loras: [],
      stack: [],
      stackPresets: [],
      swarmPresets: [],
      swarmParameters: [],
      canManagePresets: false,
      selectedPresets: [],
      samplers: [],
      schedulers: [],
      outputs: [],
      outputTotal: 0,
      outputOffset: 0,
      outputLimit: 12,
      outputFolders: [],
      libraryOutputs: [],
      activeChat: null,
      permissions: {},
      hasMetadataToken: false,
      currentImage: null,
      initImage: null,
    }
    this.buildV3()
    this.bind()
    if (typeof ResizeObserver !== "undefined") {
      this.outputResizeObserver = new ResizeObserver(() => this.fitPreviewToAspect())
      this.outputResizeObserver.observe(this.get<HTMLElement>('[data-role="output-stage"]'))
      this.inspectorResizeObserver = new ResizeObserver(() => this.fitInspectorToSpace())
      this.inspectorResizeObserver.observe(this.get<HTMLElement>('[data-role="inspector-stage"]'))
    }
    document.addEventListener("keydown", this.handleKeyDown, true)
    this.setRunStatus("Loading Lumiverse connections…")
    this.send("bootstrap")
  }

  dispose(): void {
    this.disposed = true
    this.previewObserver?.disconnect()
    this.previewObserver = null
    this.outputResizeObserver?.disconnect()
    this.outputResizeObserver = null
    this.inspectorResizeObserver?.disconnect()
    this.inspectorResizeObserver = null
    this.stopActiveResize?.()
    this.stopActiveResize = null
    document.removeEventListener("keydown", this.handleKeyDown, true)
  }

  setTheme(theme: StudioTheme): void {
    this.root.classList.add("ss-modal-theme")
    this.root.dataset.theme = theme
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell) shell.dataset.theme = theme
    for (const button of this.root.querySelectorAll<HTMLElement>('[data-action="set-theme"]')) {
      button.dataset.active = String(button.dataset.themeValue === theme)
    }
    this.syncAppearanceControls()
  }

  setAppearance(appearance: StudioAppearance): void {
    this.appearance = cloneStudioAppearance(appearance)
    applyAppearanceVariables(this.root, appearance)
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell) applyAppearanceVariables(shell, appearance)
    this.syncAppearanceControls()
  }

  private syncAppearanceControls(): void {
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (!shell) return
    const panel = this.root.querySelector<HTMLElement>(".ss-generation-pane")
    const header = this.root.querySelector<HTMLElement>(".ss-pane-head")
    const button = this.root.querySelector<HTMLElement>(".ss-button:not(.ss-button-primary)")
    const fallbackColors: Record<AppearanceColorKey, string> = {
      accent: "#7dd3fc",
      canvas: "#090a0d",
      panel: "#14151a",
      header: "#1b1d24",
      outline: "#343640",
      button: "#191b21",
      text: "#f4f5f7",
    }
    const sampledColors: Record<AppearanceColorKey, string | null> = {
      accent: normalizeHexColor(getComputedStyle(shell).getPropertyValue("--lumiverse-accent")),
      canvas: normalizeHexColor(getComputedStyle(shell).backgroundColor),
      panel: panel ? normalizeHexColor(getComputedStyle(panel).backgroundColor) : null,
      header: header ? normalizeHexColor(getComputedStyle(header).backgroundColor) : null,
      outline: panel ? normalizeHexColor(getComputedStyle(panel).borderTopColor) : null,
      button: button ? normalizeHexColor(getComputedStyle(button).backgroundColor) : null,
      text: normalizeHexColor(getComputedStyle(shell).color),
    }
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="appearance-color"]')) {
      const key = input.dataset.colorKey as AppearanceColorKey
      input.value = this.appearance.colors[key] || sampledColors[key] || fallbackColors[key]
      input.dataset.overridden = String(Boolean(this.appearance.colors[key]))
      input.closest<HTMLElement>(".ss-color-control")!.title = this.appearance.colors[key]
        ? `${key} override · ${input.value}`
        : `${key} inherited from the active profile · ${input.value}`
    }

    const radius = this.get<HTMLInputElement>('[data-role="appearance-radius"]')
    const inheritedRadius = Number.parseFloat(getComputedStyle(button || shell).borderRadius) || 8
    radius.value = String(this.appearance.radius ?? clamp(inheritedRadius, 0, 28))
    this.get<HTMLOutputElement>('[data-role="appearance-radius-output"]').value =
      this.appearance.radius === null ? `${Math.round(inheritedRadius)}px*` : `${Math.round(this.appearance.radius)}px`
    const opacity = this.get<HTMLInputElement>('[data-role="appearance-opacity"]')
    opacity.value = String(this.appearance.opacity)
    this.get<HTMLOutputElement>('[data-role="appearance-opacity-output"]').value = `${Math.round(this.appearance.opacity)}%`
    const blur = this.get<HTMLInputElement>('[data-role="appearance-blur"]')
    blur.value = String(this.appearance.blur)
    this.get<HTMLOutputElement>('[data-role="appearance-blur-output"]').value = `${Math.round(this.appearance.blur)}px`
    if (!this.appearanceControlsInitialized) {
      this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = this.appearance.customCss
      this.appearanceControlsInitialized = true
    }
  }

  openLibrary(): void {
    this.openOutputLibrary()
  }

  private get<T extends HTMLElement>(selector: string): T {
    const found = this.root.querySelector(selector)
    if (!found) throw new Error(`Swarm Studio UI element missing: ${selector}`)
    return found as T
  }

  private build(): void {
    this.root.innerHTML = `
      <div class="ss-shell">
        <div class="ss-topbar">
          <div class="ss-connection-wrap">
            <select class="ss-select ss-connection" data-role="connection" aria-label="SwarmUI connection">
              <option value="">Loading SwarmUI connections…</option>
            </select>
          </div>
          <button class="ss-button" data-action="refresh-metadata" title="Rescan LoRAs and their metadata">Refresh metadata</button>
          <div class="ss-token-wrap">
            <button class="ss-button" data-action="toggle-token" aria-expanded="false">Metadata token</button>
            <div class="ss-token-popover" data-role="token-popover" hidden>
              <p>Lumiverse keeps the connection secret private from extensions. If SwarmUI authentication is enabled, save the same <code>swarm_token</code> here for metadata and preview requests only. It is stored in Lumiverse's encrypted enclave.</p>
              <div class="ss-token-row">
                <input class="ss-input" data-role="metadata-token" type="password" autocomplete="off" placeholder="swarm_token value" />
                <button class="ss-button ss-button-primary" data-action="save-token">Save</button>
                <button class="ss-button ss-button-danger" data-action="clear-token">Clear</button>
              </div>
              <div class="ss-field-help" data-role="token-status">No extension metadata token saved.</div>
            </div>
          </div>
        </div>

        <div class="ss-permission-banner" data-role="permission-banner"></div>

        <div class="ss-workspace">
          <div class="ss-editor">
            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>Prompt</strong><span class="ss-muted ss-tiny">Trigger phrases can be inherited from the LoRA stack</span></div>
              </div>
              <div class="ss-prompt-grid">
                <div class="ss-field">
                  <label for="ss-positive">Positive</label>
                  <textarea id="ss-positive" class="ss-textarea" data-role="positive" placeholder="Describe the image…"></textarea>
                  <div class="ss-field-help" data-role="trigger-summary">No inherited trigger phrases.</div>
                </div>
                <div class="ss-field">
                  <label for="ss-negative">Negative</label>
                  <textarea id="ss-negative" class="ss-textarea" data-role="negative" placeholder="What should not appear…"></textarea>
                  <div class="ss-field-help">Passed through Lumiverse's SwarmUI provider.</div>
                </div>
              </div>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>Generation</strong><span class="ss-muted ss-tiny">Connection defaults are loaded first</span></div>
              </div>
              <div class="ss-controls-grid">
                <div class="ss-field ss-model-field">
                  <label>Checkpoint</label>
                  <select class="ss-select" data-role="model"><option value="">Select a connection first</option></select>
                </div>
                <div class="ss-field">
                  <label>Width</label>
                  <input class="ss-input" data-role="width" type="number" min="64" max="4096" step="64" value="1024" />
                </div>
                <div class="ss-field">
                  <label>Height</label>
                  <input class="ss-input" data-role="height" type="number" min="64" max="4096" step="64" value="1024" />
                </div>
                <div class="ss-field">
                  <label>Steps</label>
                  <input class="ss-input" data-role="steps" type="number" min="1" max="150" step="1" value="20" />
                </div>
                <div class="ss-field">
                  <label>CFG</label>
                  <input class="ss-input" data-role="cfg" type="number" min="1" max="30" step="0.5" value="7" />
                </div>
                <div class="ss-field">
                  <label>Seed</label>
                  <input class="ss-input" data-role="seed" type="number" step="1" value="-1" title="-1 uses a random seed" />
                </div>
                <div class="ss-field ss-sampler-field">
                  <label>Sampler</label>
                  <input class="ss-input" data-role="sampler" list="ss-samplers" placeholder="Connection default" />
                  <datalist id="ss-samplers">
                    <option value="euler"></option><option value="euler_ancestral"></option>
                    <option value="dpmpp_2m"></option><option value="dpmpp_2m_sde"></option>
                    <option value="dpmpp_3m_sde"></option><option value="uni_pc"></option>
                  </datalist>
                </div>
                <div class="ss-field ss-scheduler-field">
                  <label>Scheduler</label>
                  <input class="ss-input" data-role="scheduler" list="ss-schedulers" placeholder="Connection default" />
                  <datalist id="ss-schedulers">
                    <option value="normal"></option><option value="karras"></option>
                    <option value="exponential"></option><option value="sgm_uniform"></option>
                    <option value="simple"></option><option value="ddim_uniform"></option>
                  </datalist>
                </div>
                <div class="ss-inline-actions">
                  <button class="ss-icon-button" data-action="swap-size" title="Swap width and height" aria-label="Swap width and height">↔</button>
                  <button class="ss-icon-button" data-action="random-seed" title="Use a random seed" aria-label="Use random seed">✦</button>
                </div>
              </div>
              <details class="ss-advanced">
                <summary>Advanced Swarm controls</summary>
                <div class="ss-advanced-grid">
                  <div class="ss-field">
                    <label>Swarm preset(s)</label>
                    <input class="ss-input" data-role="presets" placeholder="portrait, cinematic" />
                  </div>
                  <div class="ss-field">
                    <label>VAE override</label>
                    <input class="ss-input" data-role="vae" placeholder="Built-in/default" />
                  </div>
                  <div class="ss-field">
                    <label>UNet override</label>
                    <input class="ss-input" data-role="unet" placeholder="Use checkpoint" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-L</label>
                    <input class="ss-input" data-role="clip-l" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-G</label>
                    <input class="ss-input" data-role="clip-g" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field">
                    <label>T5-XXL</label>
                    <input class="ss-input" data-role="t5" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field ss-wide">
                    <label>Raw request override (JSON)</label>
                    <textarea class="ss-textarea" data-role="raw-override" spellcheck="false" placeholder='{"refinerupscale": 1.25, "refinermethod": "PostApply"}'></textarea>
                    <div class="ss-field-help">Merged by Lumiverse after the controls above. Protected connection/model/auth fields remain protected.</div>
                  </div>
                </div>
              </details>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA library</strong><span class="ss-muted ss-tiny" data-role="lora-count">0 models</span></div>
              </div>
              <div class="ss-library-tools">
                <input class="ss-input" data-role="lora-search" type="search" placeholder="Search title, author, tag, trigger, architecture…" />
                <select class="ss-select" data-role="lora-sort" aria-label="Sort LoRAs">
                  <option value="title">Title</option>
                  <option value="name">Filename</option>
                  <option value="newest">Newest</option>
                </select>
                <button class="ss-button" data-action="manual-lora">Add filename</button>
              </div>
              <div class="ss-library-status" data-role="metadata-error" hidden></div>
              <div class="ss-lora-grid" data-role="lora-grid">
                <div class="ss-empty">Choose a SwarmUI connection to load its LoRA library.</div>
              </div>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA stack</strong><span class="ss-muted ss-tiny" data-role="stack-count">0 enabled</span></div>
                <button class="ss-button ss-button-danger" data-action="clear-stack" disabled>Clear</button>
              </div>
              <div class="ss-stack-list" data-role="stack-list">
                <div class="ss-empty">Add LoRAs above. Their metadata default weight and trigger phrase are inherited automatically.</div>
              </div>
            </section>

            <div class="ss-generate-bar">
              <button class="ss-button ss-button-primary ss-generate" data-action="generate" disabled>Generate image</button>
              <div class="ss-run-status" data-role="run-status">Waiting for a SwarmUI connection.</div>
            </div>
          </div>

          <aside class="ss-output">
            <div class="ss-section-title"><strong>Output</strong><span class="ss-muted ss-tiny">Saved by Lumiverse</span></div>
            <div class="ss-current-preview" data-role="current-preview">
              <div class="ss-preview-empty" data-role="preview-empty"><strong>No output yet</strong>Generate an image or choose one from this extension's history.</div>
              <img data-role="preview-image" alt="Generated image preview" hidden />
              <div class="ss-preview-loading" data-role="preview-loading">
                <div class="ss-generation-progress" data-role="generation-progress" data-indeterminate="true">
                  <div class="ss-progress-track"><span class="ss-progress-fill" data-role="progress-fill"></span></div>
                  <div class="ss-progress-label" data-role="progress-label">Preparing…</div>
                </div>
              </div>
            </div>
            <div class="ss-output-label" data-role="output-label">Nothing selected</div>
            <div class="ss-output-actions">
              <button class="ss-button" data-action="download-output" disabled>Download</button>
              <button class="ss-button" data-action="copy-output" disabled>Copy URL</button>
            </div>
            <div class="ss-history-head">
              <div class="ss-section-title"><strong>History</strong><span class="ss-muted ss-tiny" data-role="output-count">0</span></div>
              <button class="ss-icon-button" data-action="refresh-outputs" title="Refresh output history" aria-label="Refresh output history">↻</button>
            </div>
            <div class="ss-history-grid" data-role="history-grid">
              <div class="ss-empty">Outputs created in this chat will appear here.</div>
            </div>
          </aside>
        </div>
      </div>
    `
  }

  private buildV3(): void {
    this.root.innerHTML = `
      <div class="ss-shell" data-mobile-tab="create">
        <div class="ss-topbar">
          <div class="ss-brand">${STUDIO_ICON}<span>Swarm Studio</span></div>
          <div class="ss-connection-wrap">
            <select class="ss-select ss-connection" data-role="connection" aria-label="SwarmUI connection">
              <option value="">Loading SwarmUI connections…</option>
            </select>
          </div>
          <div class="ss-top-actions">
            <div class="ss-config-wrap">
              <button class="ss-icon-button ss-config-button" data-action="toggle-config" aria-expanded="false" title="Studio settings" aria-label="Studio settings">${SETTINGS_ICON}</button>
              <div class="ss-config-popover" data-role="config-popover" hidden>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Swarm metadata</strong><span>Models, LoRAs and previews</span></div>
                  <button class="ss-button" data-action="refresh-metadata">Refresh metadata</button>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Metadata token</strong><span data-role="token-status">No token saved</span></div>
                  <p class="ss-muted ss-tiny">Only needed when SwarmUI blocks anonymous metadata access. Lumiverse stores it encrypted.</p>
                  <div class="ss-token-row">
                    <input class="ss-input" data-role="metadata-token" type="password" autocomplete="off" placeholder="swarm_token value" />
                    <button class="ss-button ss-button-primary" data-action="save-token">Save</button>
                    <button class="ss-button ss-button-danger" data-action="clear-token">Clear</button>
                  </div>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Base profile</strong><span>Loads a distinct design language</span></div>
                  <div class="ss-config-theme-grid">
                    ${STUDIO_THEMES.map((theme) => `<button class="ss-button ss-config-theme" data-action="set-theme" data-theme-value="${theme.id}" style="--ss-swatch:${theme.color}">${theme.label}</button>`).join("")}
                  </div>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Component colors</strong><button class="ss-button ss-tiny" data-action="reset-appearance">Reset overrides</button></div>
                  <div class="ss-appearance-colors">
                    ${APPEARANCE_COLORS.map((color) => `<label class="ss-color-control"><input type="color" data-role="appearance-color" data-color-key="${color.key}" value="#7dd3fc" /><span>${color.label}</span></label>`).join("")}
                  </div>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Shape and glass</strong><span>Applied across the modal</span></div>
                  <div class="ss-appearance-range">
                    <label for="ss-radius-control">Border radius</label>
                    <input id="ss-radius-control" data-role="appearance-radius" type="range" min="0" max="28" step="1" value="8" />
                    <output data-role="appearance-radius-output">8px</output>
                  </div>
                  <div class="ss-appearance-range">
                    <label for="ss-opacity-control">Surface opacity</label>
                    <input id="ss-opacity-control" data-role="appearance-opacity" type="range" min="45" max="100" step="1" value="96" />
                    <output data-role="appearance-opacity-output">96%</output>
                  </div>
                  <div class="ss-appearance-range">
                    <label for="ss-blur-control">Backdrop blur</label>
                    <input id="ss-blur-control" data-role="appearance-blur" type="range" min="0" max="30" step="1" value="12" />
                    <output data-role="appearance-blur-output">12px</output>
                  </div>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Custom CSS</strong><span>Persisted locally · apply when ready</span></div>
                  <textarea class="ss-textarea ss-css-override" data-role="custom-css" spellcheck="false" placeholder="/* Example */
.ss-current-preview { box-shadow: 0 0 28px color-mix(in srgb, var(--lumiverse-accent) 28%, transparent); }
.ss-stack-row { border-style: dashed; }"></textarea>
                  <div class="ss-config-actions">
                    <button class="ss-button ss-button-danger" data-action="clear-custom-css">Clear</button>
                    <button class="ss-button ss-button-primary" data-action="apply-custom-css">Apply CSS</button>
                  </div>
                  <details class="ss-css-guide">
                    <summary>Stylesheet guide</summary>
                    <pre>Useful roots
.ss-shell                 whole Studio
.ss-launcher              drawer dashboard
.ss-generation-pane       generation sidebar
.ss-output-stage          current image
.ss-prompt-panel          prompt editor
.ss-lora-dock             LoRA workspace
.ss-stack-row             stacked LoRA
.ss-history-card          history image
.ss-output-library        fullscreen library
.ss-inspector             image inspector

Theme variables
--lumiverse-accent        active accent
--ss-canvas-bg            modal background
--ss-panel-bg             panel surfaces
--ss-header-bg            section headers
--ss-outline              borders
--ss-button-bg            button surfaces
--ss-control-radius       controls
--ss-panel-radius         panels
--ss-surface-opacity      panel alpha
--ss-backdrop-blur        panel blur

Use .ss-shell before a selector to keep
an override inside Studio. @import rules
are removed when CSS is applied.</pre>
                  </details>
                </section>
              </div>
            </div>
            <button class="ss-icon-button" data-action="toggle-fullscreen" title="Toggle fullscreen studio" aria-label="Toggle fullscreen studio">⛶</button>
            <button class="ss-icon-button ss-close-studio" data-action="close-studio" title="Close studio" aria-label="Close studio">×</button>
          </div>
        </div>

        <div class="ss-permission-banner" data-role="permission-banner"></div>

        <nav class="ss-mobile-tabs" aria-label="Studio sections">
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="create" data-active="true">Create</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="generation" data-active="false">Tune</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="loras" data-active="false">LoRAs</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="stack" data-active="false">Stack</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="history" data-active="false">History</button>
        </nav>

        <div class="ss-workspace">
          <aside class="ss-generation-pane" data-mobile-panel="generation">
            <div class="ss-pane-head">
              <div class="ss-pane-title"><strong>Generation</strong><div class="ss-muted ss-tiny">Model and render controls</div></div>
              <button class="ss-icon-button ss-pane-toggle" data-action="toggle-generation" title="Collapse generation sidebar" aria-label="Collapse generation sidebar">‹</button>
            </div>
            <div class="ss-pane-body">
              <div class="ss-generation-controls">
                <div class="ss-field ss-wide">
                  <label>Checkpoint</label>
                  <select class="ss-select" data-role="model"><option value="">Select a connection first</option></select>
                </div>
                <div class="ss-aspect-controls">
                  <div class="ss-field">
                    <label>Aspect ratio</label>
                    <select class="ss-select" data-role="aspect">
                      ${Object.entries(ASPECT_PRESETS).map(([value, preset]) => `<option value="${value}">${preset.label}</option>`).join("")}
                      <option value="custom">Custom / unlink</option>
                    </select>
                  </div>
                  <div class="ss-field" data-role="size-scale-field">
                    <label>Image scale</label>
                    <div class="ss-size-slider-row">
                      <input data-role="size-slider" type="range" min="256" max="2048" step="64" value="1024" />
                      <span class="ss-size-readout" data-role="size-readout">1024 × 1024</span>
                    </div>
                  </div>
                  <div class="ss-custom-size" data-role="custom-size" hidden>
                    <div class="ss-field">
                      <label>Width</label>
                      <input class="ss-input" data-role="width" type="number" min="64" max="4096" step="64" value="1024" />
                    </div>
                    <button class="ss-icon-button ss-size-link" data-action="toggle-size-link" data-role="size-link" data-linked="true" aria-pressed="true" title="Width and height are linked">${LINK_SIZE_ICON}</button>
                    <div class="ss-field">
                      <label>Height</label>
                      <input class="ss-input" data-role="height" type="number" min="64" max="4096" step="64" value="1024" />
                    </div>
                    <input data-role="link-size" type="checkbox" checked hidden />
                  </div>
                </div>
                <div class="ss-field">
                  <label>Steps</label>
                  <input class="ss-input" data-role="steps" type="number" min="1" max="150" step="1" value="20" />
                </div>
                <div class="ss-field">
                  <label>CFG</label>
                  <input class="ss-input" data-role="cfg" type="number" min="1" max="30" step="0.5" value="7" />
                </div>
                <div class="ss-field ss-wide">
                  <label>Seed</label>
                  <input class="ss-input" data-role="seed" type="number" step="1" value="-1" title="-1 uses a random seed" />
                </div>
                <div class="ss-field ss-wide">
                  <label>Sampler</label>
                  <select class="ss-select" data-role="sampler"><option value="">Connection default</option></select>
                </div>
                <div class="ss-field ss-wide">
                  <label>Scheduler</label>
                  <select class="ss-select" data-role="scheduler"><option value="">Connection default</option></select>
                </div>
                <div class="ss-inline-actions ss-wide">
                  <button class="ss-button ss-context-button" data-action="change-orientation" data-role="orientation-action" title="Change image orientation">${PORTRAIT_ICON}<span>Portrait</span></button>
                  <button class="ss-button ss-context-button" data-action="toggle-seed-mode" data-role="seed-action" title="Reuse the current output seed">${CURRENT_SEED_ICON}<span>Current seed</span></button>
                </div>
                <div class="ss-init-panel">
                  <div class="ss-init-preview" data-role="init-preview">No init</div>
                  <div class="ss-init-content">
                    <div class="ss-init-head"><strong class="ss-tiny">Init image</strong><span class="ss-init-label" data-role="init-label">Text-to-image</span></div>
                    <div class="ss-init-actions">
                      <button class="ss-button" data-action="use-current-init" disabled>Use current</button>
                      <button class="ss-button" data-action="pick-init">Choose file</button>
                      <button class="ss-button ss-button-danger" data-action="clear-init" disabled>Clear</button>
                    </div>
                    <label class="ss-creativity-row"><span>Creativity</span><input data-role="denoise" type="range" min="0" max="1" step="0.05" value="0.6" /><span data-role="denoise-label">0.60</span></label>
                  </div>
                  <input data-role="init-file" type="file" accept="image/*" hidden />
                </div>
              </div>
              <details class="ss-advanced">
                <summary>Advanced Swarm controls</summary>
                <div class="ss-advanced-grid">
                  <div class="ss-field ss-wide">
                    <label>Swarm preset stack</label>
                    <div class="ss-preset-picker">
                      <select class="ss-select" data-role="presets"><option value="">Add a preset…</option></select>
                      <button class="ss-button" data-action="add-swarm-preset" data-role="add-swarm-preset" hidden>Save current</button>
                    </div>
                    <div class="ss-preset-stack" data-role="preset-stack">
                      <div class="ss-empty ss-preset-empty">No presets selected.</div>
                    </div>
                    <div class="ss-field-help" data-role="preset-resolved">Enabled presets are applied from top to bottom.</div>
                  </div>
                  <div class="ss-field">
                    <label>VAE override</label>
                    <input class="ss-input" data-role="vae" placeholder="Built-in/default" />
                  </div>
                  <div class="ss-field">
                    <label>UNet override</label>
                    <input class="ss-input" data-role="unet" placeholder="Use checkpoint" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-L</label>
                    <input class="ss-input" data-role="clip-l" placeholder="Optional" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-G</label>
                    <input class="ss-input" data-role="clip-g" placeholder="Optional" />
                  </div>
                  <div class="ss-field">
                    <label>T5-XXL</label>
                    <input class="ss-input" data-role="t5" placeholder="Optional" />
                  </div>
                  <div class="ss-field ss-wide">
                    <label>Raw request override (JSON)</label>
                    <textarea class="ss-textarea" data-role="raw-override" spellcheck="false" placeholder='{"refinerupscale": 1.25}'></textarea>
                    <div class="ss-field-help">Merged after these controls. Protected connection, model, and authentication fields stay protected.</div>
                  </div>
                </div>
              </details>
            </div>
          </aside>

          <div class="ss-resize-handle ss-resize-generation" data-resize="generation" role="separator" aria-orientation="vertical" title="Drag to resize generation controls"></div>

          <main class="ss-center">
            <section class="ss-output-stage" data-role="output-stage" data-mobile-panel="create-output">
              <div class="ss-output-stage-head">
                <div class="ss-section-title"><strong>Current output</strong><span class="ss-muted ss-tiny">Saved by Lumiverse</span></div>
                <div class="ss-output-actions">
                  <button class="ss-button" data-action="download-output" disabled>Download</button>
                  <button class="ss-button" data-action="copy-output" disabled>Copy URL</button>
                </div>
              </div>
              <div class="ss-current-preview" data-role="current-preview" data-action="inspect-output" title="Open full-size image and generation details">
                <div class="ss-preview-empty" data-role="preview-empty"><strong>No output yet</strong>Generate an image or open one from History.</div>
                <img data-role="preview-image" alt="Generated image preview" hidden />
                <div class="ss-preview-loading" data-role="preview-loading">
                  <div class="ss-generation-progress" data-role="generation-progress" data-indeterminate="true">
                    <div class="ss-progress-track"><span class="ss-progress-fill" data-role="progress-fill"></span></div>
                    <div class="ss-progress-label" data-role="progress-label">Preparing…</div>
                  </div>
                </div>
              </div>
              <div class="ss-output-meta">
                <div class="ss-output-label" data-role="output-label">Nothing selected</div>
                <span class="ss-zoom-hint">Click image for full size + prompts</span>
              </div>
            </section>

            <div class="ss-center-resizer" data-resize="prompt" role="separator" aria-orientation="horizontal" title="Drag to resize prompt area"></div>

            <section class="ss-prompt-panel" data-mobile-panel="create-prompt">
              <div class="ss-section-head ss-prompt-head">
                <div class="ss-section-title"><strong>Prompt</strong><span class="ss-muted ss-tiny">LoRA triggers are opt-in</span></div>
                <div class="ss-prompt-status" data-role="prompt-run-status">Waiting for SwarmUI.</div>
                <div class="ss-prompt-actions">
                  <label class="ss-mobile-stack-picker">
                    <span>Stack</span>
                    <select class="ss-select" data-role="mobile-stack-preset" aria-label="Load a saved LoRA stack">
                      <option value="">Saved stacks…</option>
                    </select>
                  </label>
                  <button class="ss-button ss-button-primary ss-generate ss-desktop-generate" data-action="generate" disabled>Generate image</button>
                </div>
              </div>
              <div class="ss-prompt-grid">
                <div class="ss-field">
                  <label for="ss-positive-v3">Positive</label>
                  <textarea id="ss-positive-v3" class="ss-textarea" data-role="positive" placeholder="Describe the image…"></textarea>
                  <div class="ss-field-help" data-role="trigger-summary">No inherited trigger phrases.</div>
                </div>
                <div class="ss-field">
                  <label for="ss-negative-v3">Negative</label>
                  <textarea id="ss-negative-v3" class="ss-textarea" data-role="negative" placeholder="What should not appear…"></textarea>
                  <div class="ss-field-help">Passed through Lumiverse's SwarmUI provider.</div>
                </div>
              </div>
            </section>
          </main>

          <div class="ss-resize-handle ss-resize-history" data-resize="history" role="separator" aria-orientation="vertical" title="Drag to resize history"></div>

          <aside class="ss-history-pane" data-mobile-panel="history">
            <div class="ss-pane-head">
              <div class="ss-pane-title"><strong>History</strong><div class="ss-muted ss-tiny"><span data-role="output-count">0</span> saved outputs</div></div>
              <div>
                <button class="ss-icon-button ss-pane-toggle" data-action="open-output-library" title="Open folders and all Swarm Studio outputs" aria-label="Open output library">▦</button>
                <button class="ss-icon-button ss-pane-toggle" data-action="refresh-outputs" title="Refresh output history" aria-label="Refresh output history">↻</button>
                <button class="ss-icon-button ss-pane-toggle" data-action="toggle-history" title="Collapse history sidebar" aria-label="Collapse history sidebar">›</button>
              </div>
            </div>
            <div class="ss-pane-body ss-history-grid" data-role="history-grid">
              <div class="ss-empty">Outputs created in this chat will appear here.</div>
            </div>
            <div class="ss-history-pagination">
              <button class="ss-button" data-action="history-prev" disabled>‹</button>
              <span class="ss-history-page-label" data-role="history-page">1 / 1</span>
              <button class="ss-button" data-action="history-next" disabled>›</button>
            </div>
          </aside>
        </div>

        <section class="ss-lora-dock">
          <div class="ss-dock-resizer" data-resize="dock" role="separator" aria-orientation="horizontal" title="Drag to resize LoRA workspace"></div>
          <div class="ss-lora-dock-content">
            <section class="ss-lora-library">
              <div class="ss-lora-titlebar">
                <div class="ss-section-title"><strong>Select LoRAs</strong><span class="ss-muted ss-tiny" data-role="lora-count">0 models</span></div>
                <span class="ss-family-chip" data-role="family-chip">Waiting for checkpoint</span>
                <button class="ss-icon-button ss-pane-toggle" data-action="toggle-loras" title="Collapse LoRA workspace" aria-label="Collapse LoRA workspace">⌄</button>
              </div>
              <div class="ss-library-tools">
                <input class="ss-input" data-role="lora-search" type="search" placeholder="Search keywords, tags, triggers…" />
                <select class="ss-select ss-lora-filter" data-role="lora-filter" aria-label="LoRA compatibility filter">
                  <option value="compatible">Compatible only</option>
                  <option value="all">All model families</option>
                </select>
                <select class="ss-select" data-role="lora-sort" aria-label="Sort LoRAs">
                  <option value="title">Title</option>
                  <option value="name">Filename</option>
                  <option value="newest">Newest</option>
                </select>
                <button class="ss-button" data-action="manual-lora">Add filename</button>
              </div>
              <div class="ss-library-status" data-role="metadata-error" hidden></div>
              <div class="ss-lora-grid" data-role="lora-grid">
                <div class="ss-empty">Choose a SwarmUI connection to load its LoRA library.</div>
              </div>
            </section>

            <div class="ss-lora-divider" data-resize="lora-split" role="separator" aria-orientation="vertical" title="Drag to resize LoRA library and stack"></div>

            <section class="ss-stack-pane">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA stack</strong><span class="ss-muted ss-tiny" data-role="stack-count">0 enabled</span></div>
                <button class="ss-button ss-button-danger" data-action="clear-stack" disabled>Clear</button>
              </div>
              <div class="ss-stack-head-tools">
                <select class="ss-select" data-role="stack-preset" aria-label="Saved LoRA stacks">
                  <option value="">Saved stacks…</option>
                </select>
                <button class="ss-button" data-action="load-stack" disabled>Load</button>
                <button class="ss-button ss-button-primary" data-action="save-stack">Save</button>
                <button class="ss-button ss-button-danger" data-action="delete-stack" disabled>Delete</button>
              </div>
              <div class="ss-stack-list" data-role="stack-list">
                <div class="ss-empty">Add LoRAs from the library. Metadata triggers stay off until you enable them.</div>
              </div>
            </section>
          </div>
        </section>

        <div class="ss-commandbar">
          <div class="ss-command-summary">
            <div class="ss-run-status" data-role="run-status">Waiting for a SwarmUI connection.</div>
            <div class="ss-stack-summary" data-role="command-stack-summary">No LoRAs enabled</div>
          </div>
          <button class="ss-button ss-button-primary ss-generate ss-mobile-generate" data-action="generate" disabled>Generate image</button>
        </div>

        <div class="ss-inspector" data-role="inspector" hidden>
          <div class="ss-inspector-stage" data-role="inspector-stage">
            <div class="ss-inspector-toolbar">
              <button class="ss-icon-button" data-action="zoom-out" aria-label="Zoom out">−</button>
              <button class="ss-button" data-action="zoom-reset" data-role="zoom-label">100%</button>
              <button class="ss-icon-button" data-action="zoom-in" aria-label="Zoom in">+</button>
              <button class="ss-button" data-action="download-output">Download</button>
            </div>
            <img class="ss-inspector-image" data-role="inspector-image" alt="Full-size generated output" />
          </div>
          <aside class="ss-inspector-details">
            <div class="ss-inspector-details-head">
              <div>
                <h3 data-role="inspector-title">Generated output</h3>
                <div class="ss-muted ss-tiny">Full-size image and recorded generation settings</div>
              </div>
              <button class="ss-icon-button ss-inspector-close" data-action="close-inspector" aria-label="Close full-size image">×</button>
            </div>
            <div class="ss-inspector-facts" data-role="inspector-facts"></div>
            <div class="ss-inspector-actions">
              <button class="ss-button ss-button-primary" data-action="reuse-parameters">Reuse parameters</button>
              <button class="ss-button" data-action="use-as-init">Use as init image</button>
              <button class="ss-button" data-action="open-output-library">Output library</button>
              <button class="ss-button ss-button-danger" data-action="delete-output" disabled>Delete from Lumiverse</button>
            </div>
            <h4>Submitted positive prompt</h4>
            <p class="ss-inspector-copy" data-role="inspector-positive">Prompt metadata is unavailable for this older output.</p>
            <h4>Submitted negative prompt</h4>
            <p class="ss-inspector-copy" data-role="inspector-negative">No negative prompt recorded.</p>
            <h4>Used presets</h4>
            <p class="ss-inspector-copy" data-role="inspector-presets">No Swarm presets recorded.</p>
            <h4>LoRA stack</h4>
            <p class="ss-inspector-copy" data-role="inspector-loras">No LoRAs recorded.</p>
            <div class="ss-inspector-path" data-role="inspector-path" hidden>Saved by SwarmUI to <code data-role="inspector-path-value"></code></div>
          </aside>
        </div>

        <div class="ss-output-library" data-role="output-library" hidden>
          <header class="ss-library-head">
            <strong>Output library</strong>
            <span class="ss-muted ss-tiny">Lumiverse-owned Swarm Studio images and virtual folders</span>
            <button class="ss-icon-button" data-action="close-output-library" aria-label="Close output library">×</button>
          </header>
          <aside class="ss-library-folders" data-role="library-folders">
            <div class="ss-empty">Loading folders…</div>
          </aside>
          <main class="ss-library-main">
            <div class="ss-library-toolbar">
              <strong class="ss-tiny" data-role="library-title">All outputs</strong>
              <span class="ss-muted ss-tiny" data-role="library-count">0 images</span>
              <label class="ss-library-search">
                <input class="ss-input" data-role="library-search" type="search" placeholder="Search prompts, model, LoRAs, presets…" aria-label="Search output metadata" />
              </label>
              <button class="ss-button" data-action="library-prev" disabled>‹</button>
              <span class="ss-history-page-label" data-role="library-page">1 / 1</span>
              <button class="ss-button" data-action="library-next" disabled>›</button>
            </div>
            <div class="ss-library-bulkbar">
              <button class="ss-button" data-action="select-library-page">Select page</button>
              <span class="ss-library-selection-count" data-role="library-selection-count">0 selected</span>
              <select class="ss-select" data-role="bulk-folder" aria-label="Folder for selected outputs">
                <option value="">Move to Unfiled</option>
              </select>
              <button class="ss-button" data-action="bulk-move-outputs" disabled>Move selected</button>
              <button class="ss-button ss-button-danger" data-action="bulk-delete-outputs" disabled>Delete selected</button>
            </div>
            <div class="ss-output-library-grid" data-role="library-grid">
              <div class="ss-empty">Loading outputs…</div>
            </div>
          </main>
        </div>
      </div>
    `
  }

  private bind(): void {
    this.get<HTMLSelectElement>('[data-role="connection"]').addEventListener("change", (event) => {
      const connectionId = (event.currentTarget as HTMLSelectElement).value
      if (connectionId) this.loadConnection(connectionId)
    })
    this.get<HTMLInputElement>('[data-role="lora-search"]').addEventListener("input", () => this.renderLoras())
    this.get<HTMLInputElement>('[data-role="library-search"]').addEventListener("input", () => {
      this.libraryPage = 0
      this.renderOutputLibrary()
    })
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="appearance-color"]')) {
      input.addEventListener("input", () => {
        const key = input.dataset.colorKey as AppearanceColorKey
        if (!APPEARANCE_COLORS.some((color) => color.key === key)) return
        const next = cloneStudioAppearance(this.appearance)
        next.colors[key] = input.value
        this.onAppearanceChange(next)
      })
    }
    this.get<HTMLInputElement>('[data-role="appearance-radius"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.radius = numberValue(event.currentTarget as HTMLInputElement, 8)
      this.onAppearanceChange(next)
    })
    this.get<HTMLInputElement>('[data-role="appearance-opacity"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.opacity = numberValue(event.currentTarget as HTMLInputElement, 96)
      this.onAppearanceChange(next)
    })
    this.get<HTMLInputElement>('[data-role="appearance-blur"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.blur = numberValue(event.currentTarget as HTMLInputElement, 12)
      this.onAppearanceChange(next)
    })
    this.get<HTMLSelectElement>('[data-role="lora-sort"]').addEventListener("change", () => this.renderLoras())
    this.get<HTMLSelectElement>('[data-role="lora-filter"]').addEventListener("change", () => this.renderLoras())
    this.get<HTMLSelectElement>('[data-role="model"]').addEventListener("change", () => {
      this.updateFamilyChip()
      this.renderLoras()
      this.renderStack()
    })
    this.get<HTMLSelectElement>('[data-role="stack-preset"]').addEventListener("change", () => this.updatePresetButtons())
    this.get<HTMLSelectElement>('[data-role="mobile-stack-preset"]').addEventListener("change", (event) => {
      const presetId = (event.currentTarget as HTMLSelectElement).value
      if (presetId) this.loadStackPreset(presetId)
    })
    this.get<HTMLSelectElement>('[data-role="aspect"]').addEventListener("change", () => this.applyAspectSelection())
    this.get<HTMLInputElement>('[data-role="size-slider"]').addEventListener("input", () => this.applyAspectScale())
    this.get<HTMLInputElement>('[data-role="link-size"]').addEventListener("change", () => {
      this.updateSizeLinkControl()
      this.applyAspectSelection()
    })
    this.get<HTMLInputElement>('[data-role="seed"]').addEventListener("input", () => this.updateContextControls())
    this.get<HTMLInputElement>('[data-role="denoise"]').addEventListener("input", (event) => {
      this.get<HTMLElement>('[data-role="denoise-label"]').textContent =
        Number((event.currentTarget as HTMLInputElement).value).toFixed(2)
    })
    this.get<HTMLSelectElement>('[data-role="presets"]').addEventListener("change", (event) => {
      const select = event.currentTarget as HTMLSelectElement
      if (select.value) this.addSelectedPreset(select.value)
      select.value = ""
    })
    const updateRequestedAspect = () => this.updatePreviewAspect(
      numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
      numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
    )
    this.get<HTMLInputElement>('[data-role="width"]').addEventListener("input", (event) => {
      this.updateLinkedCustomDimension("width", Number((event.currentTarget as HTMLInputElement).value))
      updateRequestedAspect()
      this.updateSizeReadout()
      this.updateContextControls()
    })
    this.get<HTMLInputElement>('[data-role="height"]').addEventListener("input", (event) => {
      this.updateLinkedCustomDimension("height", Number((event.currentTarget as HTMLInputElement).value))
      updateRequestedAspect()
      this.updateSizeReadout()
      this.updateContextControls()
    })
    this.get<HTMLInputElement>('[data-role="init-file"]').addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement
      const file = input.files?.[0]
      input.value = ""
      if (file) void this.setInitFromBlob(file, file.name, "")
    })

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLElement
      const presetToggle = target.closest<HTMLInputElement>('[data-role="preset-enabled"]')
      if (presetToggle?.dataset.presetIndex) {
        const index = Number(presetToggle.dataset.presetIndex)
        if (this.state.selectedPresets[index]) {
          this.state.selectedPresets[index].enabled = presetToggle.checked
          this.updateResolvedPresetSummary()
        }
        return
      }
      const libraryToggle = target.closest<HTMLInputElement>('[data-role="library-output-check"]')
      if (libraryToggle?.dataset.imageId) {
        if (libraryToggle.checked) this.librarySelection.add(libraryToggle.dataset.imageId)
        else this.librarySelection.delete(libraryToggle.dataset.imageId)
        this.updateLibrarySelectionControls()
        libraryToggle.closest<HTMLElement>(".ss-library-output")!.dataset.selected = String(libraryToggle.checked)
        return
      }
      const select = (event.target as HTMLElement).closest<HTMLSelectElement>('[data-role="library-folder-select"]')
      if (select?.dataset.imageId) {
        this.send("move_output_to_folder", {
          imageId: select.dataset.imageId,
          folderId: select.value,
        })
      }
    })

    this.root.addEventListener("pointerdown", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.beginResize(handle.dataset.resize || "", event)
    })
    this.root.addEventListener("dblclick", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.resetResize(handle.dataset.resize || "")
    })

    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      if (!target.closest(".ss-config-wrap")) this.closeConfigPopover()
      if (!target.closest(".ss-history-card")) this.closeHistoryMenus()
      const button = target.closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (action === "refresh-metadata") this.refreshMetadata()
      if (action === "toggle-config") this.toggleConfigPopover(button)
      if (action === "set-theme") {
        const theme = button.dataset.themeValue
        if (STUDIO_THEMES.some((item) => item.id === theme)) this.onThemeChange(theme as StudioTheme)
      }
      if (action === "reset-appearance") {
        const next = cloneStudioAppearance(this.appearance)
        next.colors = {}
        next.radius = null
        next.opacity = 96
        next.blur = 12
        this.onAppearanceChange(next)
      }
      if (action === "apply-custom-css") {
        const next = cloneStudioAppearance(this.appearance)
        next.customCss = sanitizeCustomCss(this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value)
        this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = next.customCss
        this.onAppearanceChange(next)
        this.setRunStatus("Custom Studio CSS applied.")
      }
      if (action === "clear-custom-css") {
        const next = cloneStudioAppearance(this.appearance)
        next.customCss = ""
        this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = ""
        this.onAppearanceChange(next)
        this.setRunStatus("Custom Studio CSS cleared.")
      }
      if (action === "save-token") this.saveToken()
      if (action === "clear-token") this.clearToken()
      if (action === "close-studio") this.modal.dismiss()
      if (action === "change-orientation") this.changeOrientation()
      if (action === "toggle-seed-mode") this.toggleSeedMode()
      if (action === "toggle-size-link") this.toggleSizeLink()
      if (action === "use-current-init" || action === "use-as-init") void this.useCurrentAsInit()
      if (action === "pick-init") this.get<HTMLInputElement>('[data-role="init-file"]').click()
      if (action === "clear-init") this.clearInitImage()
      if (action === "manual-lora") this.addManualLora()
      if (action === "toggle-generation") this.togglePane("generation")
      if (action === "toggle-history") this.togglePane("history")
      if (action === "toggle-loras") this.togglePane("loras")
      if (action === "toggle-fullscreen") this.toggleFullscreen()
      if (action === "mobile-tab") this.setMobileTab(button.dataset.tab || "create")
      if (action === "clear-stack") {
        this.state.stack = []
        this.renderStack()
        this.renderLoras()
      }
      if (action === "save-stack") this.saveStackPreset()
      if (action === "load-stack") this.loadStackPreset()
      if (action === "delete-stack") this.deleteStackPreset()
      if (action === "generate") this.generate()
      if (action === "interrupt-generation") this.interruptGeneration()
      if (action === "refresh-outputs") this.refreshOutputs()
      if (action === "history-prev") this.changeHistoryPage(-1)
      if (action === "history-next") this.changeHistoryPage(1)
      if (action === "download-output") this.downloadCurrent()
      if (action === "copy-output") void this.copyCurrentUrl()
      if (action === "inspect-output") this.openInspector()
      if (action === "close-inspector") this.closeInspector()
      if (action === "reuse-parameters") this.reuseCurrentParameters()
      if (action === "delete-output") this.deleteCurrentOutput()
      if (action === "open-output-library") this.openOutputLibrary()
      if (action === "close-output-library") this.closeOutputLibrary()
      if (action === "create-output-folder") this.createOutputFolder()
      if (action === "delete-output-folder") this.deleteSelectedOutputFolder()
      if (action === "library-prev") this.changeLibraryPage(-1)
      if (action === "library-next") this.changeLibraryPage(1)
      if (action === "select-library-page") this.toggleLibraryPageSelection()
      if (action === "bulk-move-outputs") this.bulkMoveOutputs()
      if (action === "bulk-delete-outputs") this.bulkDeleteOutputs()
      if (action === "preset-up") this.moveSelectedPreset(Number(button.dataset.presetIndex), -1)
      if (action === "preset-down") this.moveSelectedPreset(Number(button.dataset.presetIndex), 1)
      if (action === "preset-remove") this.removeSelectedPreset(Number(button.dataset.presetIndex))
      if (action === "add-swarm-preset") this.addSwarmPreset()
      if (action === "library-folder") {
        this.libraryFolderId = button.dataset.folderId || ""
        this.libraryPage = 0
        this.renderOutputLibrary()
      }
      if (action === "zoom-in") this.setInspectorZoom(this.imageScale + 0.25)
      if (action === "zoom-out") this.setInspectorZoom(this.imageScale - 0.25)
      if (action === "zoom-reset") {
        this.setInspectorZoom(1)
        this.fitInspectorToSpace()
      }
    })
  }

  private send(type: string, data: Record<string, unknown> = {}): string {
    const requestId = crypto.randomUUID()
    this.ctx.sendToBackend({ type, requestId, ...data })
    return requestId
  }

  onMessage(payload: any): void {
    if (this.disposed) return
    const data = payload?.data || {}
    switch (payload?.type) {
      case "bootstrap_result":
        this.state.connections = Array.isArray(data.connections) ? data.connections : []
        this.acceptOutputPage(data)
        this.state.stackPresets = Array.isArray(data.stackPresets) ? data.stackPresets : []
        this.state.outputFolders = Array.isArray(data.outputFolders) ? data.outputFolders : []
        this.state.activeChat = data.activeChat || null
        this.state.permissions = data.permissions || {}
        this.renderPermissions()
        this.populateConnections()
        this.renderOutputs()
        this.renderStackPresets()
        break
      case "connection_result":
        if (payload.requestId !== this.connectionRequestId) return
        this.acceptConnectionData(data)
        this.setRunStatus(data.metadataError ? "Ready — LoRA metadata needs attention." : "Ready.")
        break
      case "metadata_result":
        this.state.loras = Array.isArray(data.loras) ? data.loras : []
        this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : this.state.checkpoints
        this.acceptSwarmOptions(data.swarmOptions)
        this.showMetadataError(data.metadataError || "")
        this.updateFamilyChip()
        this.renderLoras()
        this.renderStack()
        this.setRunStatus(`Metadata refreshed: ${this.state.loras.length} LoRAs.`)
        this.setConnectionStatus("ready")
        break
      case "preview_result":
        if (payload?.name && payload?.dataUrl) {
          this.previewCache.set(payload.name, payload.dataUrl)
          this.updatePreviewImages(payload.name, payload.dataUrl)
        }
        break
      case "token_saved":
      case "token_cleared":
        this.acceptConnectionData(data)
        this.get<HTMLInputElement>('[data-role="metadata-token"]').value = ""
        this.setRunStatus(payload.type === "token_saved" ? "Metadata token saved and library refreshed." : "Metadata token cleared.")
        break
      case "generation_result":
        this.generating = false
        this.currentJobId = ""
        this.setGenerating(false)
        this.acceptOutputPage(data)
        if (data.result?.imageDataUrl) {
          this.setCurrentImage({
            id: data.result.imageId || data.record?.imageId,
            src: data.result.imageDataUrl,
            url: data.result.imageUrl || data.result.imageDataUrl,
            label: `${data.result.model || "SwarmUI"} · just generated`,
            details: data.record || this.pendingGeneration,
          })
        }
        this.pendingGeneration = null
        this.preGenerationImage = null
        this.renderOutputs()
        this.setRunStatus("Generation complete. Output saved to Lumiverse.")
        break
      case "generation_progress": {
        if (!this.currentJobId || payload.clientJobId !== this.currentJobId) break
        const step = Number.isFinite(data.step) ? Number(data.step) : 0
        const totalSteps = Number.isFinite(data.totalSteps) ? Number(data.totalSteps) : 0
        if (typeof data.preview === "string" && data.preview) {
          this.showLivePreview(data.preview, step, totalSteps)
        }
        this.updateGenerationProgress(step, totalSteps)
        this.setRunStatus("Rendering in SwarmUI…")
        break
      }
      case "generation_interrupt_requested":
        if (payload.clientJobId === this.currentJobId) {
          this.setRunStatus("Interrupt requested — stopping SwarmUI…")
        }
        break
      case "generation_interrupted":
        if (!payload.clientJobId || payload.clientJobId === this.currentJobId) {
          this.generating = false
          this.currentJobId = ""
          this.pendingGeneration = null
          this.setGenerating(false)
          if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
          else this.clearCurrentImage()
          this.preGenerationImage = null
          this.setRunStatus("Generation interrupted. Your previous output is still safe.")
        }
        break
      case "swarm_preset_added":
        this.acceptSwarmOptions(data.swarmOptions)
        this.addSelectedPreset(String(data.title || ""))
        this.setRunStatus(`Saved and selected Swarm preset “${data.title}”.`)
        break
      case "outputs_result":
        this.acceptOutputPage(data)
        this.renderOutputs()
        this.setRunStatus(`History refreshed: ${this.state.outputTotal} outputs.`)
        break
      case "library_outputs_result":
        this.state.libraryOutputs = Array.isArray(data.outputs) ? data.outputs : []
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        {
          const available = new Set(this.state.libraryOutputs.map((output) => String(output.id)))
          for (const imageId of this.librarySelection) {
            if (!available.has(imageId)) this.librarySelection.delete(imageId)
          }
        }
        this.renderOutputLibrary()
        break
      case "output_folders_result":
        this.state.outputFolders = Array.isArray(data) ? data : []
        this.librarySelection.clear()
        this.renderOutputLibrary()
        this.setRunStatus("Output folders updated.")
        break
      case "output_deleted":
        this.acceptOutputPage(data)
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        this.state.libraryOutputs = this.state.libraryOutputs.filter((output) => String(output.id) !== String(data.imageId))
        this.librarySelection.delete(String(data.imageId))
        if (this.state.currentImage?.id === data.imageId) this.clearCurrentImage()
        this.closeInspector()
        this.renderOutputs()
        this.renderOutputLibrary()
        this.setRunStatus("Output deleted from Lumiverse.")
        break
      case "outputs_bulk_deleted": {
        this.acceptOutputPage(data)
        const deleted = new Set(Array.isArray(data.deletedIds) ? data.deletedIds : [])
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        this.state.libraryOutputs = this.state.libraryOutputs.filter((output) => !deleted.has(String(output.id)))
        this.librarySelection.clear()
        if (this.state.currentImage?.id && deleted.has(this.state.currentImage.id)) this.clearCurrentImage()
        this.closeInspector()
        this.renderOutputs()
        this.renderOutputLibrary()
        const failedCount = Array.isArray(data.failedIds) ? data.failedIds.length : 0
        this.setRunStatus(
          failedCount
            ? `Deleted ${deleted.size} outputs; ${failedCount} could not be deleted.`
            : `Deleted ${deleted.size} outputs from Lumiverse.`,
          failedCount > 0,
        )
        break
      }
      case "stack_presets_result":
        this.state.stackPresets = Array.isArray(data) ? data : []
        this.renderStackPresets()
        this.setRunStatus("Saved LoRA stacks updated.")
        break
      case "studio_error":
        if (payload.operation === "generate") {
          this.generating = false
          this.currentJobId = ""
          this.pendingGeneration = null
          this.setGenerating(false)
          if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
          this.preGenerationImage = null
        }
        this.setConnectionStatus("error")
        this.setRunStatus(payload.error || "Swarm Studio request failed.", true)
        if (payload.operation === "preview" && payload.name) {
          this.requestedPreviews.delete(payload.name)
        }
        break
    }
  }

  onImageGenerationEvent(type: "progress" | "complete" | "error", payload: any): void {
    if (!this.currentJobId || payload?.assetId !== this.currentJobId) return
    if (payload?.extensionIdentifier && payload.extensionIdentifier !== "swarm_studio") return

    if (type === "progress") {
      const step = Number.isFinite(payload?.step) ? Number(payload.step) : 0
      const totalSteps = Number.isFinite(payload?.totalSteps) ? Number(payload.totalSteps) : 0
      if (typeof payload?.preview === "string" && payload.preview) {
        this.showLivePreview(payload.preview, step, totalSteps)
      }
      this.updateGenerationProgress(step, totalSteps)
      this.setRunStatus("Rendering in SwarmUI…")
      return
    }

    if (type === "complete") {
      this.updateGenerationProgress(1, 1)
      this.setRunStatus("Rendering complete; Lumiverse is finalizing the full-resolution image…")
      return
    }

    this.generating = false
    this.currentJobId = ""
    this.setGenerating(false)
    if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
    this.preGenerationImage = null
    this.setRunStatus(payload?.message || "Image generation failed.", true)
  }

  private renderPermissions(): void {
    const missing: string[] = []
    if (!this.state.permissions.imageGen) missing.push("Image Generation (required)")
    if (!this.state.permissions.metadata) missing.push("CORS Proxy (LoRA metadata/previews)")
    if (!this.state.permissions.images) missing.push("Images (output history)")
    if (!this.state.permissions.chats) missing.push("Chats (chat/character ownership)")
    const banner = this.get<HTMLElement>('[data-role="permission-banner"]')
    banner.dataset.visible = String(missing.length > 0)
    banner.textContent = missing.length
      ? `Grant these extension permissions in Lumiverse for the complete studio: ${missing.join(", ")}.`
      : ""
  }

  private populateConnections(): void {
    const select = this.get<HTMLSelectElement>('[data-role="connection"]')
    select.replaceChildren()
    if (!this.state.connections.length) {
      const option = element("option", "", "No SwarmUI connections configured")
      option.value = ""
      select.appendChild(option)
      this.setConnectionStatus("error")
      this.setRunStatus("Create a SwarmUI image generation connection in Lumiverse first.", true)
      return
    }

    for (const connection of this.state.connections) {
      const option = element("option", "", `${connection.name}${connection.is_default ? " · default" : ""}`)
      option.value = connection.id
      select.appendChild(option)
    }
    const preferred = this.state.connections.find((item) => item.is_default) || this.state.connections[0]
    select.value = preferred.id
    this.loadConnection(preferred.id)
  }

  private loadConnection(connectionId: string): void {
    const connection = this.state.connections.find((item) => item.id === connectionId) || null
    this.state.connection = connection
    this.state.models = []
    this.state.checkpoints = []
    this.state.loras = []
    this.state.swarmPresets = []
    this.state.swarmParameters = []
    this.state.canManagePresets = false
    this.state.selectedPresets = []
    this.state.samplers = []
    this.state.schedulers = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.setConnectionStatus("loading")
    this.setRunStatus(`Loading ${connection?.name || "SwarmUI"} models and LoRA metadata…`)
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="generate"]')) {
      button.disabled = true
    }
    this.renderLoras()
    this.connectionRequestId = this.send("load_connection", { connectionId })
  }

  private acceptConnectionData(data: any): void {
    this.state.connection = data.connection || this.state.connection
    this.state.models = Array.isArray(data.models) ? data.models : []
    this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : []
    this.state.loras = Array.isArray(data.loras) ? data.loras : []
    this.state.hasMetadataToken = Boolean(data.hasMetadataToken)
    this.acceptSwarmOptions(data.swarmOptions)
    this.populateModels()
    this.applyConnectionDefaults()
    this.updateFamilyChip()
    this.showMetadataError(data.metadataError || "")
    this.renderLoras()
    this.renderStack()
    this.updateTokenStatus()
    this.setConnectionStatus(data.metadataError ? "warning" : "ready")
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="generate"]')) {
      button.disabled = !this.state.connection || !this.state.permissions.imageGen
    }
  }

  private acceptOutputPage(data: any): void {
    this.state.outputs = Array.isArray(data?.outputs)
      ? data.outputs
      : Array.isArray(data)
        ? data
        : []
    this.state.outputTotal = Math.max(this.state.outputs.length, Number(data?.total) || 0)
    this.state.outputOffset = Math.max(0, Number(data?.offset) || 0)
    this.state.outputLimit = Math.max(1, Number(data?.limit) || this.state.outputLimit || 12)
  }

  private acceptSwarmOptions(value: any): void {
    const previousSampler = this.root.querySelector<HTMLSelectElement>('[data-role="sampler"]')?.value || ""
    const previousScheduler = this.root.querySelector<HTMLSelectElement>('[data-role="scheduler"]')?.value || ""
    const fallbackSamplers = ["euler", "euler_ancestral", "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_3m_sde", "uni_pc"]
    const fallbackSchedulers = ["normal", "karras", "exponential", "sgm_uniform", "simple", "ddim_uniform"]
    this.state.samplers = Array.isArray(value?.samplers) && value.samplers.length
      ? value.samplers
      : fallbackSamplers
    this.state.schedulers = Array.isArray(value?.schedulers) && value.schedulers.length
      ? value.schedulers
      : fallbackSchedulers
    this.state.swarmPresets = Array.isArray(value?.presets) ? value.presets : []
    this.state.swarmParameters = Array.isArray(value?.parameters) ? value.parameters : []
    this.state.canManagePresets = Boolean(value?.canManagePresets)
    this.populateSimpleSelect("sampler", "Connection default", this.state.samplers, previousSampler)
    this.populateSimpleSelect("scheduler", "Connection default", this.state.schedulers, previousScheduler)

    const presetSelect = this.get<HTMLSelectElement>('[data-role="presets"]')
    presetSelect.replaceChildren()
    const blank = element("option", "", "Add a preset…")
    blank.value = ""
    presetSelect.appendChild(blank)
    for (const preset of this.state.swarmPresets) {
      const option = element("option", "", preset.title)
      option.value = preset.title
      option.title = preset.description
      presetSelect.appendChild(option)
    }
    presetSelect.value = ""
    const addPreset = this.get<HTMLButtonElement>('[data-role="add-swarm-preset"]')
    addPreset.hidden = !this.state.canManagePresets || !this.state.swarmParameters.length
    addPreset.title = addPreset.hidden
      ? "SwarmUI did not expose preset-management permission and a usable parameter schema."
      : "Save the current prompts and render controls as a SwarmUI preset"
    this.renderPresetStack()
  }

  private addSelectedPreset(title: string): void {
    if (!title || this.state.selectedPresets.some((preset) => preset.title === title)) return
    this.state.selectedPresets.push({ title, enabled: true })
    this.renderPresetStack()
  }

  private moveSelectedPreset(index: number, delta: number): void {
    if (!Number.isInteger(index)) return
    const target = index + delta
    if (index < 0 || target < 0 || index >= this.state.selectedPresets.length || target >= this.state.selectedPresets.length) return
    const [preset] = this.state.selectedPresets.splice(index, 1)
    this.state.selectedPresets.splice(target, 0, preset)
    this.renderPresetStack()
  }

  private removeSelectedPreset(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.state.selectedPresets.length) return
    this.state.selectedPresets.splice(index, 1)
    this.renderPresetStack()
  }

  private addSwarmPreset(): void {
    if (!this.state.connection || !this.state.canManagePresets || !this.state.swarmParameters.length) return
    const title = window.prompt("Name this SwarmUI preset:", "")?.trim()
    if (!title) return
    const description = window.prompt("Optional preset description:", "")?.trim() || ""
    const schemaIds = new Map(
      this.state.swarmParameters.map((parameter) => [parameter.id.toLowerCase(), parameter.id]),
    )
    const paramMap: Record<string, string> = {}
    const add = (id: string, value: unknown) => {
      const schemaId = schemaIds.get(id.toLowerCase())
      if (!schemaId || value === undefined || value === null || String(value).trim() === "") return
      paramMap[schemaId] = String(value)
    }
    add("prompt", this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim())
    add("negativeprompt", this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim())
    add("model", this.get<HTMLSelectElement>('[data-role="model"]').value)
    add("width", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)))
    add("height", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)))
    add("steps", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="steps"]'), 20)))
    add("cfgscale", numberValue(this.get<HTMLInputElement>('[data-role="cfg"]'), 7))
    add("seed", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1)))
    add("sampler", this.get<HTMLSelectElement>('[data-role="sampler"]').value)
    add("scheduler", this.get<HTMLSelectElement>('[data-role="scheduler"]').value)
    add("vae", this.get<HTMLInputElement>('[data-role="vae"]').value)
    add("automaticvae", this.get<HTMLInputElement>('[data-role="vae"]').value)
    add("refinermodel", this.get<HTMLInputElement>('[data-role="unet"]').value)
    if (!Object.keys(paramMap).length) {
      this.setRunStatus("SwarmUI's schema did not expose any of Studio's current controls.", true)
      return
    }
    this.send("add_swarm_preset", {
      connectionId: this.state.connection.id,
      title,
      description,
      paramMap,
    })
    this.setRunStatus(`Saving SwarmUI preset “${title}”…`)
  }

  private renderPresetStack(): void {
    const root = this.get<HTMLElement>('[data-role="preset-stack"]')
    root.replaceChildren()
    if (!this.state.selectedPresets.length) {
      root.appendChild(element("div", "ss-empty ss-preset-empty", "No presets selected."))
      this.updateResolvedPresetSummary()
      return
    }
    this.state.selectedPresets.forEach((selected, index) => {
      const row = element("div", "ss-preset-row")
      const toggle = element("input")
      toggle.type = "checkbox"
      toggle.checked = selected.enabled
      toggle.dataset.role = "preset-enabled"
      toggle.dataset.presetIndex = String(index)
      toggle.setAttribute("aria-label", `Enable ${selected.title}`)
      const name = element("span", "ss-preset-name", selected.title)
      const metadata = this.state.swarmPresets.find((preset) => preset.title === selected.title)
      name.title = metadata?.description || selected.title
      const up = element("button", "ss-icon-button", "↑")
      up.dataset.action = "preset-up"
      up.dataset.presetIndex = String(index)
      up.disabled = index === 0
      up.title = "Apply earlier"
      const down = element("button", "ss-icon-button", "↓")
      down.dataset.action = "preset-down"
      down.dataset.presetIndex = String(index)
      down.disabled = index === this.state.selectedPresets.length - 1
      down.title = "Apply later"
      const remove = element("button", "ss-icon-button ss-button-danger", "×")
      remove.dataset.action = "preset-remove"
      remove.dataset.presetIndex = String(index)
      remove.title = "Remove preset"
      row.append(toggle, name, up, down, remove)
      root.appendChild(row)
    })
    this.updateResolvedPresetSummary()
  }

  private populateSimpleSelect(
    role: string,
    blankLabel: string,
    values: string[],
    selected: string,
  ): void {
    const select = this.get<HTMLSelectElement>(`[data-role="${role}"]`)
    select.replaceChildren()
    const blank = element("option", "", blankLabel)
    blank.value = ""
    select.appendChild(blank)
    if (selected && !values.includes(selected)) {
      const current = element("option", "", `${selected} · connection`)
      current.value = selected
      select.appendChild(current)
    }
    for (const value of values) {
      const option = element("option", "", value)
      option.value = value
      select.appendChild(option)
    }
    select.value = selected
  }

  private populateModels(): void {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    select.replaceChildren()
    const connectionModel = String(this.state.connection?.model || "")
    const models = [...this.state.models]
    if (connectionModel && !models.some((model) => model.id === connectionModel)) {
      models.unshift({ id: connectionModel, label: `${connectionModel} · connection` })
    }
    if (!models.length) {
      const option = element("option", "", connectionModel || "No models returned")
      option.value = connectionModel
      select.appendChild(option)
      return
    }
    for (const model of models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      select.appendChild(option)
    }
    select.value = connectionModel || models[0].id
  }

  private applyConnectionDefaults(): void {
    const defaults = this.state.connection?.default_parameters || {}
    const assign = (role: string, key: string, fallback: unknown) => {
      const input = this.get<HTMLInputElement | HTMLSelectElement>(`[data-role="${role}"]`)
      const value = defaults[key] ?? fallback
      if (value !== undefined && value !== null) input.value = String(value)
    }
    assign("width", "width", 1024)
    assign("height", "height", 1024)
    assign("steps", "steps", 20)
    assign("cfg", "cfgScale", 7)
    assign("seed", "seed", -1)
    assign("sampler", "sampler", "")
    assign("scheduler", "scheduler", "")
    assign("vae", "vae", "")
    assign("unet", "unet", "")
    assign("clip-l", "clipLModel", "")
    assign("clip-g", "clipGModel", "")
    assign("t5", "t5XXLModel", "")
    assign("denoise", "denoise", .6)
    this.setDimensions(
      Number(defaults.width) || 1024,
      Number(defaults.height) || 1024,
    )
    this.get<HTMLElement>('[data-role="denoise-label"]').textContent =
      Number(this.get<HTMLInputElement>('[data-role="denoise"]').value || .6).toFixed(2)
    this.updateSizeLinkControl()
    this.updateContextControls()
  }

  private setDimensions(width: number, height: number): void {
    const safeWidth = roundModelSize(width)
    const safeHeight = roundModelSize(height)
    this.get<HTMLInputElement>('[data-role="width"]').value = String(safeWidth)
    this.get<HTMLInputElement>('[data-role="height"]').value = String(safeHeight)
    const ratio = safeWidth / safeHeight
    let best = ""
    let bestDistance = Number.POSITIVE_INFINITY
    for (const [key, preset] of Object.entries(ASPECT_PRESETS)) {
      const distance = Math.abs(ratio - preset.width / preset.height)
      if (distance < bestDistance) {
        best = key
        bestDistance = distance
      }
    }
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]')
    aspect.value = bestDistance <= .035 ? best : "custom"
    const preset = ASPECT_PRESETS[best]
    const scale = preset
      ? 1024 * (safeWidth >= safeHeight ? safeWidth / preset.width : safeHeight / preset.height)
      : Math.max(safeWidth, safeHeight)
    this.get<HTMLInputElement>('[data-role="size-slider"]').value = String(clamp(Math.round(scale), 256, 2048))
    this.get<HTMLElement>('[data-role="custom-size"]').hidden = aspect.value !== "custom"
    this.updateSizeReadout()
    this.updatePreviewAspect(safeWidth, safeHeight)
    this.updateContextControls()
  }

  private applyAspectSelection(): void {
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]').value
    const custom = aspect === "custom"
    this.get<HTMLElement>('[data-role="custom-size"]').hidden = !custom
    this.get<HTMLElement>('[data-role="size-scale-field"]').hidden =
      custom && !this.get<HTMLInputElement>('[data-role="link-size"]').checked
    if (!custom) this.applyAspectScale()
  }

  private toggleSizeLink(): void {
    const link = this.get<HTMLInputElement>('[data-role="link-size"]')
    link.checked = !link.checked
    this.updateSizeLinkControl()
    this.applyAspectSelection()
  }

  private updateSizeLinkControl(): void {
    const linked = this.get<HTMLInputElement>('[data-role="link-size"]').checked
    const button = this.get<HTMLButtonElement>('[data-role="size-link"]')
    button.dataset.linked = String(linked)
    button.setAttribute("aria-pressed", String(linked))
    button.title = linked
      ? "Width and height are linked; click to edit them independently"
      : "Width and height are independent; click to link them"
  }

  private applyAspectScale(): void {
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]').value
    const scale = numberValue(this.get<HTMLInputElement>('[data-role="size-slider"]'), 1024)
    if (aspect !== "custom") {
      const dimensions = dimensionsForAspect(aspect, scale)
      this.get<HTMLInputElement>('[data-role="width"]').value = String(dimensions.width)
      this.get<HTMLInputElement>('[data-role="height"]').value = String(dimensions.height)
      this.updatePreviewAspect(dimensions.width, dimensions.height)
    } else if (this.get<HTMLInputElement>('[data-role="link-size"]').checked) {
      const longest = Math.max(
        numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
        numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
      )
      const factor = longest > 0 ? scale / longest : 1
      const width = roundModelSize(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024) * factor)
      const height = roundModelSize(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024) * factor)
      this.get<HTMLInputElement>('[data-role="width"]').value = String(width)
      this.get<HTMLInputElement>('[data-role="height"]').value = String(height)
      this.updatePreviewAspect(width, height)
    }
    this.updateSizeReadout()
    this.updateContextControls()
  }

  private updateLinkedCustomDimension(axis: "width" | "height", value: number): void {
    if (
      this.get<HTMLSelectElement>('[data-role="aspect"]').value !== "custom"
      || !this.get<HTMLInputElement>('[data-role="link-size"]').checked
      || !Number.isFinite(value)
    ) return
    if (axis === "width") {
      this.get<HTMLInputElement>('[data-role="height"]').value =
        String(roundModelSize(value / this.previewAspect))
    } else {
      this.get<HTMLInputElement>('[data-role="width"]').value =
        String(roundModelSize(value * this.previewAspect))
    }
  }

  private updateSizeReadout(): void {
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    this.get<HTMLElement>('[data-role="size-readout"]').textContent = `${width} × ${height}`
  }

  private resolvedPrompts(): { prompt: string; negativePrompt: string; presets: string[] } {
    const presets = this.state.selectedPresets.filter((selected) => selected.enabled)
    const titles = presets.map((preset) => preset.title)
    return {
      prompt: this.finalPrompt(),
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim(),
      presets: titles,
    }
  }

  private updateResolvedPresetSummary(): void {
    const status = this.get<HTMLElement>('[data-role="preset-resolved"]')
    const enabled = this.state.selectedPresets.filter((preset) => preset.enabled)
    if (!enabled.length) {
      status.textContent = "No enabled Swarm presets; prompts pass through unchanged."
      return
    }
    status.textContent =
      `${enabled.length} preset${enabled.length === 1 ? "" : "s"} sent in order: ${enabled.map((preset) => preset.title).join(" → ")}. Swarm resolves their parameter maps server-side; Studio records the submitted prompt and preset names.`
  }

  private refreshMetadata(): void {
    if (!this.state.connection) return
    this.state.loras = []
    this.state.checkpoints = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.renderLoras()
    this.setConnectionStatus("loading")
    this.setRunStatus("Refreshing SwarmUI LoRA metadata…")
    this.send("refresh_metadata", { connectionId: this.state.connection.id })
  }

  private toggleConfigPopover(button: HTMLElement): void {
    const popover = this.get<HTMLElement>('[data-role="config-popover"]')
    popover.hidden = !popover.hidden
    button.setAttribute("aria-expanded", String(!popover.hidden))
  }

  private closeConfigPopover(): void {
    const popover = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    if (!popover) return
    popover.hidden = true
    this.root.querySelector<HTMLElement>('[data-action="toggle-config"]')
      ?.setAttribute("aria-expanded", "false")
  }

  private saveToken(): void {
    if (!this.state.connection) return
    const token = this.get<HTMLInputElement>('[data-role="metadata-token"]').value.trim()
    if (!token) {
      this.setRunStatus("Enter the swarm_token value before saving.", true)
      return
    }
    this.setRunStatus("Saving encrypted metadata token and testing SwarmUI…")
    this.send("save_metadata_token", { connectionId: this.state.connection.id, token })
  }

  private clearToken(): void {
    if (!this.state.connection) return
    this.setRunStatus("Clearing metadata token and retrying anonymously…")
    this.send("clear_metadata_token", { connectionId: this.state.connection.id })
  }

  private updateTokenStatus(): void {
    this.get<HTMLElement>('[data-role="token-status"]').textContent = this.state.hasMetadataToken
      ? "Encrypted token saved"
      : "Anonymous metadata"
  }

  private showMetadataError(message: string): void {
    const status = this.get<HTMLElement>('[data-role="metadata-error"]')
    status.hidden = !message
    status.textContent = message
  }

  private selectedCheckpointMetadata(): CheckpointMetadata | null {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    const selected = normalizeModelName(select.value)
    if (!selected) return null
    return this.state.checkpoints.find((item) => normalizeModelName(item.name) === selected)
      || this.state.checkpoints.find((item) => {
        const candidate = normalizeModelName(item.name)
        return candidate.endsWith(selected) || selected.endsWith(candidate)
      })
      || null
  }

  private selectedModelFamily(): ModelFamily {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    const option = select.selectedOptions[0]
    const checkpoint = this.selectedCheckpointMetadata()
    return inferModelFamily(
      checkpoint?.compatClass || "",
      checkpoint?.architecture || "",
      checkpoint?.title || "",
      checkpoint?.name || "",
      select.value,
      option?.textContent || "",
    )
  }

  private loraFamily(lora: LoraMetadata): ModelFamily {
    return inferModelFamily(
      lora.compatClass,
      lora.architecture,
      lora.name,
      lora.title,
      ...lora.tags,
    )
  }

  private isLoraCompatible(lora: LoraMetadata): boolean {
    const checkpoint = this.selectedCheckpointMetadata()
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    return modelSignalsCompatible(
      checkpoint?.compatClass || "",
      lora.compatClass,
      [
        checkpoint?.compatClass || "",
        checkpoint?.architecture || "",
        checkpoint?.title || "",
        checkpoint?.name || "",
        select.value,
        select.selectedOptions[0]?.textContent || "",
      ],
      [lora.compatClass, lora.architecture, lora.name, lora.title, ...lora.tags],
    )
  }

  private updateFamilyChip(): void {
    const checkpoint = this.selectedCheckpointMetadata()
    const family = this.selectedModelFamily()
    const exact = checkpoint?.compatClass || checkpoint?.architecture || ""
    this.get<HTMLElement>('[data-role="family-chip"]').textContent = exact
      ? `${familyLabel(family)} · ${exact}`
      : `${familyLabel(family)} · inferred`
  }

  private filteredLoras(): LoraMetadata[] {
    const query = this.get<HTMLInputElement>('[data-role="lora-search"]').value.trim().toLowerCase()
    const sort = this.get<HTMLSelectElement>('[data-role="lora-sort"]').value
    const compatibility = this.get<HTMLSelectElement>('[data-role="lora-filter"]').value
    const items = this.state.loras.filter((lora) => {
      if (compatibility === "compatible" && !this.isLoraCompatible(lora)) return false
      return matchesKeywordQuery(query, [
        lora.name,
        lora.title,
        lora.author,
        lora.description,
        lora.architecture,
        lora.className,
        lora.compatClass,
        lora.resolution,
        lora.license,
        lora.date,
        lora.usageHint,
        lora.triggerPhrase,
        lora.hash,
        this.loraFamily(lora),
        lora.local ? "local" : "remote",
        lora.tags,
      ])
    })
    return items.sort((a, b) => {
      if (sort === "newest") return (b.timeModified || b.timeCreated || 0) - (a.timeModified || a.timeCreated || 0)
      if (sort === "name") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    })
  }

  private renderLoras(): void {
    const grid = this.get<HTMLElement>('[data-role="lora-grid"]')
    this.previewObserver?.disconnect()
    grid.replaceChildren()
    const items = this.filteredLoras()
    this.get<HTMLElement>('[data-role="lora-count"]').textContent =
      `${items.length}${items.length !== this.state.loras.length ? ` of ${this.state.loras.length}` : ""} model${items.length === 1 ? "" : "s"}`
    this.updateDockSummary()

    if (!this.state.connection) {
      grid.appendChild(element("div", "ss-empty", "Choose a SwarmUI connection to load its LoRA library."))
      return
    }
    if (!items.length) {
      const compatibleOnly = this.get<HTMLSelectElement>('[data-role="lora-filter"]').value === "compatible"
      const text = this.state.loras.length
        ? compatibleOnly
          ? `No compatible LoRAs match ${familyLabel(this.selectedModelFamily())}. Switch to “All model families” to inspect everything.`
          : "No LoRAs match this search."
        : "No LoRA metadata was returned. You can still add a model by filename."
      grid.appendChild(element("div", "ss-empty", text))
      return
    }

    this.previewObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const image = entry.target as HTMLImageElement
        this.previewObserver?.unobserve(image)
        const name = image.dataset.name || ""
        const previewRef = image.dataset.previewRef || ""
        if (!name || !previewRef || this.requestedPreviews.has(name)) continue
        this.requestedPreviews.add(name)
        this.send("preview", {
          connectionId: this.state.connection?.id,
          name,
          previewRef,
        })
      }
    }, { root: grid, rootMargin: "120px" })

    for (const lora of items) grid.appendChild(this.makeLoraCard(lora))
  }

  private makeLoraCard(lora: LoraMetadata): HTMLElement {
    const card = element("article", "ss-lora-card")
    card.title = [
      lora.name,
      lora.triggerPhrase ? `Trigger: ${lora.triggerPhrase}` : "",
      lora.compatClass || lora.architecture,
      lora.usageHint,
    ].filter(Boolean).join("\n")

    const preview = element("div", "ss-lora-preview")
    const cached = this.previewCache.get(lora.name)
    if (cached) {
      const image = element("img")
      image.src = cached
      image.alt = `${lora.title} preview`
      image.dataset.loraImage = lora.name
      preview.appendChild(image)
    } else if (lora.previewRef) {
      const image = element("img")
      image.alt = ""
      image.dataset.name = lora.name
      image.dataset.previewRef = lora.previewRef
      image.dataset.loraImage = lora.name
      preview.appendChild(image)
      this.previewObserver?.observe(image)
    } else {
      preview.appendChild(element("div", "ss-lora-placeholder", "◇"))
    }

    const body = element("div", "ss-lora-body")
    body.appendChild(element("div", "ss-lora-title", lora.title || labelFromName(lora.name)))
    body.appendChild(element("div", "ss-lora-author", lora.author || lora.name))
    body.appendChild(element("div", "ss-lora-desc", lora.description || lora.usageHint || lora.triggerPhrase || "No description in SwarmUI metadata."))

    const badges = element("div", "ss-badges")
    const badgeValues = [
      lora.compatClass || lora.architecture,
      lora.triggerPhrase ? `trigger: ${lora.triggerPhrase}` : "",
      ...lora.tags.slice(0, 1),
    ].filter(Boolean).slice(0, 3)
    for (const value of badgeValues) badges.appendChild(element("span", "ss-badge", value))
    if (!this.isLoraCompatible(lora)) {
      badges.appendChild(element("span", "ss-badge ss-badge-warning", "model mismatch"))
    }
    body.appendChild(badges)

    const footer = element("div", "ss-lora-footer")
    footer.appendChild(element("span", "ss-weight-label", `default ${lora.defaultWeight.toFixed(2)}`))
    const inStack = this.state.stack.some((item) => item.lora.name === lora.name)
    const add = element("button", `ss-button ss-add-button${inStack ? "" : " ss-button-primary"}`, inStack ? "Stacked" : "Add")
    add.disabled = inStack
    add.addEventListener("click", () => this.addLora(lora))
    footer.appendChild(add)
    body.appendChild(footer)

    card.append(preview, body)
    return card
  }

  private updatePreviewImages(name: string, dataUrl: string): void {
    for (const image of this.root.querySelectorAll<HTMLImageElement>("[data-lora-image]")) {
      if (image.dataset.loraImage === name) image.src = dataUrl
    }
  }

  private addLora(lora: LoraMetadata): void {
    if (this.state.stack.some((item) => item.lora.name === lora.name)) return
    this.state.stack.push({
      lora,
      weight: clamp(Number(lora.defaultWeight) || 1, -10, 10),
      enabled: true,
      useTrigger: false,
    })
    this.renderStack()
    this.renderLoras()
  }

  private addManualLora(): void {
    const filename = window.prompt("Exact SwarmUI LoRA filename/path")
    if (!filename?.trim()) return
    const name = filename.trim()
    this.addLora(manualLora(name))
  }

  private renderStack(): void {
    const list = this.get<HTMLElement>('[data-role="stack-list"]')
    list.replaceChildren()
    if (!this.state.stack.length) {
      list.appendChild(element("div", "ss-empty", "Add LoRAs from the library. Metadata triggers stay off until you enable them."))
    } else {
      this.state.stack.forEach((item, index) => list.appendChild(this.makeStackRow(item, index)))
    }
    const enabled = this.state.stack.filter((item) => item.enabled).length
    this.get<HTMLElement>('[data-role="stack-count"]').textContent = `${enabled} enabled · ${this.state.stack.length} stacked`
    this.get<HTMLButtonElement>('[data-action="clear-stack"]').disabled = this.state.stack.length === 0
    this.get<HTMLElement>('[data-role="command-stack-summary"]').textContent = enabled
      ? `${enabled} LoRA${enabled === 1 ? "" : "s"} enabled`
      : "No LoRAs enabled"
    this.updateDockSummary()
    this.updateTriggerSummary()
  }

  private makeStackRow(item: StackItem, index: number): HTMLElement {
    const row = element("div", "ss-stack-row")
    row.dataset.disabled = String(!item.enabled)
    row.dataset.incompatible = String(!this.isLoraCompatible(item.lora))

    const enabled = element("input") as HTMLInputElement
    enabled.type = "checkbox"
    enabled.checked = item.enabled
    enabled.title = "Enable LoRA"
    enabled.addEventListener("change", () => {
      item.enabled = enabled.checked
      this.renderStack()
    })

    const preview = element("div", "ss-stack-preview")
    const cachedPreview = this.previewCache.get(item.lora.name)
    if (cachedPreview || item.lora.previewRef) {
      const image = element("img")
      image.alt = cachedPreview ? `${item.lora.title || labelFromName(item.lora.name)} preview` : ""
      image.dataset.loraImage = item.lora.name
      if (cachedPreview) {
        image.src = cachedPreview
      } else if (item.lora.previewRef) {
        image.dataset.name = item.lora.name
        image.dataset.previewRef = item.lora.previewRef
        if (!this.requestedPreviews.has(item.lora.name)) {
          this.requestedPreviews.add(item.lora.name)
          this.send("preview", {
            connectionId: this.state.connection?.id,
            name: item.lora.name,
            previewRef: item.lora.previewRef,
          })
        }
      }
      preview.appendChild(image)
    } else {
      preview.textContent = "◇"
    }

    const name = element("div", "ss-stack-name")
    name.appendChild(element("strong", "", item.lora.title || labelFromName(item.lora.name)))
    name.appendChild(element("span", "", item.lora.name))

    const weight = element("input", "ss-input ss-stack-weight") as HTMLInputElement
    weight.type = "number"
    weight.min = "-10"
    weight.max = "10"
    weight.step = "0.05"
    weight.value = String(item.weight)
    weight.title = "LoRA weight"
    weight.addEventListener("change", () => {
      item.weight = clamp(numberValue(weight, item.weight), -10, 10)
      weight.value = String(item.weight)
    })

    const trigger = element("label", "ss-trigger-toggle")
    const triggerCheckbox = element("input") as HTMLInputElement
    triggerCheckbox.type = "checkbox"
    triggerCheckbox.checked = item.useTrigger
    triggerCheckbox.disabled = !item.lora.triggerPhrase
    triggerCheckbox.addEventListener("change", () => {
      item.useTrigger = triggerCheckbox.checked
      this.updateTriggerSummary()
    })
    trigger.append(triggerCheckbox, document.createTextNode("trigger"))
    trigger.title = item.lora.triggerPhrase || "No trigger phrase in metadata"

    const actions = element("div", "ss-stack-actions")
    const up = element("button", "ss-icon-button", "↑")
    up.disabled = index === 0
    up.title = "Move up"
    up.addEventListener("click", () => this.moveStack(index, -1))
    const down = element("button", "ss-icon-button", "↓")
    down.disabled = index === this.state.stack.length - 1
    down.title = "Move down"
    down.addEventListener("click", () => this.moveStack(index, 1))
    const remove = element("button", "ss-icon-button ss-button-danger", "×")
    remove.title = "Remove"
    remove.addEventListener("click", () => {
      this.state.stack.splice(index, 1)
      this.renderStack()
      this.renderLoras()
    })
    actions.append(up, down, remove)
    row.append(enabled, preview, name, weight, trigger, actions)
    return row
  }

  private moveStack(index: number, direction: number): void {
    const target = index + direction
    if (target < 0 || target >= this.state.stack.length) return
    const [item] = this.state.stack.splice(index, 1)
    this.state.stack.splice(target, 0, item)
    this.renderStack()
  }

  private updateDockSummary(): void {
    const target = this.root.querySelector<HTMLElement>('[data-role="dock-summary"]')
    if (!target) return
    target.textContent = `${this.state.loras.length} models · ${this.state.stack.length} stacked`
  }

  private renderStackPresets(): void {
    for (const select of this.root.querySelectorAll<HTMLSelectElement>(
      '[data-role="stack-preset"], [data-role="mobile-stack-preset"]',
    )) {
      const selected = select.value
      select.replaceChildren()
      const placeholder = element("option", "", this.state.stackPresets.length ? "Saved stacks…" : "No saved stacks")
      placeholder.value = ""
      select.appendChild(placeholder)
      for (const preset of this.state.stackPresets) {
        const option = element("option", "", `${preset.name} · ${preset.items.length}`)
        option.value = preset.id
        select.appendChild(option)
      }
      if (selected && this.state.stackPresets.some((preset) => preset.id === selected)) {
        select.value = selected
      }
    }
    this.updatePresetButtons()
  }

  private updatePresetButtons(): void {
    const selected = Boolean(this.get<HTMLSelectElement>('[data-role="stack-preset"]').value)
    this.get<HTMLButtonElement>('[data-action="load-stack"]').disabled = !selected
    this.get<HTMLButtonElement>('[data-action="delete-stack"]').disabled = !selected
  }

  private saveStackPreset(): void {
    if (!this.state.stack.length) {
      this.setRunStatus("Add at least one LoRA before saving a stack.", true)
      return
    }
    const select = this.get<HTMLSelectElement>('[data-role="stack-preset"]')
    const existing = this.state.stackPresets.find((preset) => preset.id === select.value)
    const name = window.prompt("Save LoRA stack as", existing?.name || "")
    if (!name?.trim()) return
    this.send("save_stack_preset", {
      preset: {
        id: existing?.id || "",
        name: name.trim(),
        items: this.state.stack.map((item) => ({
          name: item.lora.name,
          title: item.lora.title,
          weight: item.weight,
          enabled: item.enabled,
          useTrigger: item.useTrigger,
        })),
      },
    })
    this.setRunStatus(`Saving LoRA stack “${name.trim()}”…`)
  }

  private loadStackPreset(requestedPresetId?: string): void {
    const presetId = requestedPresetId || this.get<HTMLSelectElement>('[data-role="stack-preset"]').value
    const preset = this.state.stackPresets.find((item) => item.id === presetId)
    if (!preset) return
    this.state.stack = preset.items.map((item) => {
      const lora = this.state.loras.find((candidate) => candidate.name === item.name)
        || manualLora(item.name, item.title)
      return {
        lora,
        weight: clamp(Number(item.weight) || 1, -10, 10),
        enabled: item.enabled !== false,
        useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
      }
    })
    this.renderStack()
    this.renderLoras()
    this.setRunStatus(`Loaded LoRA stack “${preset.name}”.`)
  }

  private deleteStackPreset(): void {
    const select = this.get<HTMLSelectElement>('[data-role="stack-preset"]')
    const preset = this.state.stackPresets.find((item) => item.id === select.value)
    if (!preset || !window.confirm(`Delete saved LoRA stack “${preset.name}”?`)) return
    this.send("delete_stack_preset", { presetId: preset.id })
    this.setRunStatus(`Deleting LoRA stack “${preset.name}”…`)
  }

  private togglePane(pane: "generation" | "history" | "loras"): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const className = `ss-${pane}-collapsed`
    const collapsed = shell.classList.toggle(className)
    const button = this.get<HTMLButtonElement>(`[data-action="toggle-${pane}"]`)
    if (pane === "generation") button.textContent = collapsed ? "›" : "‹"
    if (pane === "history") button.textContent = collapsed ? "‹" : "›"
    if (pane === "loras") button.textContent = collapsed ? "⌃" : "⌄"
    button.setAttribute("aria-expanded", String(!collapsed))
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private beginResize(kind: string, event: PointerEvent): void {
    if (window.matchMedia("(max-width: 720px)").matches) return
    if (!["generation", "history", "dock", "lora-split", "prompt"].includes(kind)) return
    event.preventDefault()
    this.stopActiveResize?.()
    const shell = this.get<HTMLElement>(".ss-shell")
    const previousUserSelect = document.body.style.userSelect
    shell.classList.add("ss-is-resizing")
    document.body.style.userSelect = "none"

    const move = (moveEvent: PointerEvent) => {
      this.applyResize(kind, moveEvent.clientX, moveEvent.clientY)
    }
    const stop = () => {
      document.removeEventListener("pointermove", move, true)
      document.removeEventListener("pointerup", stop, true)
      document.removeEventListener("pointercancel", stop, true)
      document.body.style.userSelect = previousUserSelect
      shell.classList.remove("ss-is-resizing")
      this.stopActiveResize = null
    }
    this.stopActiveResize = stop
    document.addEventListener("pointermove", move, true)
    document.addEventListener("pointerup", stop, true)
    document.addEventListener("pointercancel", stop, true)
  }

  private applyResize(kind: string, clientX: number, clientY: number): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    if (kind === "generation" || kind === "history") {
      const bounds = this.get<HTMLElement>(".ss-workspace").getBoundingClientRect()
      const max = Math.max(220, Math.min(520, bounds.width * 0.46))
      const width = kind === "generation"
        ? clamp(clientX - bounds.left, 180, max)
        : clamp(bounds.right - clientX, 160, max)
      shell.style.setProperty(
        kind === "generation" ? "--ss-generation-width" : "--ss-history-width",
        `${Math.round(width)}px`,
      )
    }
    if (kind === "dock") {
      const bounds = shell.getBoundingClientRect()
      const max = Math.max(190, Math.min(540, bounds.height * 0.6))
      shell.style.setProperty("--ss-dock-height", `${Math.round(clamp(bounds.bottom - clientY, 118, max))}px`)
    }
    if (kind === "lora-split") {
      const bounds = this.get<HTMLElement>(".ss-lora-dock-content").getBoundingClientRect()
      const width = clamp(clientX - bounds.left, 220, Math.max(220, bounds.width - 250))
      shell.style.setProperty("--ss-library-width", `${Math.round(width)}px`)
    }
    if (kind === "prompt") {
      const bounds = this.get<HTMLElement>(".ss-center").getBoundingClientRect()
      const max = Math.max(130, bounds.height - 180)
      shell.style.setProperty("--ss-prompt-height", `${Math.round(clamp(bounds.bottom - clientY, 105, max))}px`)
    }
    this.fitPreviewToAspect()
  }

  private resetResize(kind: string): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const properties: Record<string, string> = {
      generation: "--ss-generation-width",
      history: "--ss-history-width",
      dock: "--ss-dock-height",
      "lora-split": "--ss-library-width",
      prompt: "--ss-prompt-height",
    }
    const property = properties[kind]
    if (property) shell.style.removeProperty(property)
    this.fitPreviewToAspect()
  }

  private toggleFullscreen(force?: boolean): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const shouldEnter = force ?? !shell.classList.contains("ss-fullscreen-layer")
    shell.classList.toggle("ss-fullscreen-layer", shouldEnter)
    const button = this.get<HTMLButtonElement>('[data-action="toggle-fullscreen"]')
    button.textContent = shouldEnter ? "🗗" : "⛶"
    button.title = shouldEnter ? "Exit fullscreen studio" : "Enter fullscreen studio"
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private setMobileTab(tab: string): void {
    const allowed = new Set(["create", "generation", "loras", "stack", "history"])
    const selected = allowed.has(tab) ? tab : "create"
    const shell = this.get<HTMLElement>(".ss-shell")
    shell.dataset.mobileTab = selected
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".ss-mobile-tab")) {
      const active = button.dataset.tab === selected
      button.dataset.active = String(active)
      button.setAttribute("aria-current", active ? "page" : "false")
    }
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private openInspector(): void {
    const image = this.state.currentImage
    if (!image) return
    const inspector = this.get<HTMLElement>('[data-role="inspector"]')
    const inspectorImage = this.get<HTMLImageElement>('[data-role="inspector-image"]')
    inspectorImage.onload = () => this.fitInspectorToSpace()
    inspectorImage.src = image.url || image.src
    this.get<HTMLElement>('[data-role="inspector-title"]').textContent = image.label
    const details = image.details || null
    const parameters = details?.parameters || {}
    const facts = this.get<HTMLElement>('[data-role="inspector-facts"]')
    facts.replaceChildren()
    const factValues = [
      details?.model,
      parameters.width && parameters.height ? `${parameters.width} × ${parameters.height}` : "",
      parameters.steps ? `${parameters.steps} steps` : "",
      parameters.seed !== undefined ? `seed ${parameters.seed}` : "",
      parameters.sampler ? String(parameters.sampler) : "",
      parameters.scheduler ? String(parameters.scheduler) : "",
      details?.timing?.prep ? `${details.timing.prep} prep` : "",
      details?.timing?.generation ? `${details.timing.generation} gen` : "",
      !details?.timing?.prep && details?.timing?.totalMs
        ? `${(details.timing.totalMs / 1000).toFixed(2)} sec total`
        : "",
      details?.presets?.length ? `presets · ${details.presets.join(" → ")}` : "",
      details?.initImageLabel ? `img2img · ${details.initImageLabel}` : "",
    ].filter(Boolean)
    for (const value of factValues) facts.appendChild(element("span", "ss-badge", String(value)))
    this.get<HTMLElement>('[data-role="inspector-positive"]').textContent =
      details?.prompt || details?.resolvedPrompt || "Prompt metadata is unavailable for this older output."
    this.get<HTMLElement>('[data-role="inspector-negative"]').textContent =
      details?.negativePrompt || details?.resolvedNegativePrompt || "No negative prompt recorded."
    this.get<HTMLElement>('[data-role="inspector-presets"]').textContent = details?.presets?.length
      ? details.presets.join("\n")
      : "No Swarm presets recorded."
    this.get<HTMLElement>('[data-role="inspector-loras"]').textContent = details?.loras?.length
      ? details.loras.map((lora) => `${lora.name} · ${lora.weight}`).join("\n")
      : "No LoRAs recorded."
    const path = details?.swarmPath || ""
    this.get<HTMLElement>('[data-role="inspector-path"]').hidden = !path
    this.get<HTMLElement>('[data-role="inspector-path-value"]').textContent = path
    this.get<HTMLButtonElement>('[data-action="reuse-parameters"]').disabled = !details
    this.get<HTMLButtonElement>('[data-action="use-as-init"]').disabled = !image.src
    this.get<HTMLButtonElement>('[data-action="delete-output"]').disabled = !image.id
    inspector.hidden = false
    this.setInspectorZoom(1)
    requestAnimationFrame(() => this.fitInspectorToSpace())
  }

  private closeInspector(): void {
    this.get<HTMLElement>('[data-role="inspector"]').hidden = true
  }

  private setInspectorZoom(value: number): void {
    this.imageScale = clamp(value, 0.5, 4)
    this.get<HTMLImageElement>('[data-role="inspector-image"]').style.setProperty("--ss-image-scale", String(this.imageScale))
    this.get<HTMLElement>('[data-role="zoom-label"]').textContent =
      this.imageScale === 1 ? "Fit" : `${Math.round(this.imageScale * 100)}%`
  }

  private fitInspectorToSpace(): void {
    const inspector = this.root.querySelector<HTMLElement>('[data-role="inspector"]')
    if (!inspector || inspector.hidden) return
    const stage = this.get<HTMLElement>('[data-role="inspector-stage"]')
    const image = this.get<HTMLImageElement>('[data-role="inspector-image"]')
    const recordedWidth = Number(this.state.currentImage?.details?.parameters?.width)
    const recordedHeight = Number(this.state.currentImage?.details?.parameters?.height)
    const naturalWidth = image.naturalWidth || recordedWidth
    const naturalHeight = image.naturalHeight || recordedHeight
    if (!naturalWidth || !naturalHeight || stage.clientWidth <= 0 || stage.clientHeight <= 0) return
    const fitted = fitAspectWithin(
      naturalWidth / naturalHeight,
      Math.max(80, stage.clientWidth - 48),
      Math.max(80, stage.clientHeight - 94),
    )
    image.style.width = `${Math.round(fitted.width)}px`
    image.style.height = `${Math.round(fitted.height)}px`
  }

  private reuseCurrentParameters(): void {
    const details = this.state.currentImage?.details
    if (!details) return
    const parameters = details.parameters || {}
    this.get<HTMLTextAreaElement>('[data-role="positive"]').value =
      details.prompt || details.resolvedPrompt || ""
    this.get<HTMLTextAreaElement>('[data-role="negative"]').value =
      details.negativePrompt || details.resolvedNegativePrompt || ""
    if (details.model) {
      const model = this.get<HTMLSelectElement>('[data-role="model"]')
      if (![...model.options].some((option) => option.value === details.model)) {
        const option = element("option", "", `${details.model} · reused`)
        option.value = details.model
        model.appendChild(option)
      }
      model.value = details.model
    }
    const assign = (role: string, value: unknown) => {
      if (value === undefined || value === null) return
      const control = this.get<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-role="${role}"]`)
      if (control instanceof HTMLSelectElement && value && ![...control.options].some((option) => option.value === String(value))) {
        const option = element("option", "", `${value} · reused`)
        option.value = String(value)
        control.appendChild(option)
      }
      control.value = String(value)
    }
    this.setDimensions(Number(parameters.width) || 1024, Number(parameters.height) || 1024)
    assign("steps", parameters.steps)
    assign("cfg", parameters.cfgScale)
    assign("seed", parameters.seed)
    assign("sampler", parameters.sampler)
    assign("scheduler", parameters.scheduler)
    assign("vae", parameters.vae)
    assign("unet", parameters.unet)
    assign("clip-l", parameters.clipLModel)
    assign("clip-g", parameters.clipGModel)
    assign("t5", parameters.t5XXLModel)
    assign("raw-override", parameters.rawRequestOverride)
    this.state.selectedPresets = (details.presets || []).map((title) => ({
      title,
      enabled: true,
    }))
    this.state.stack = (details.loras || []).map((saved) => ({
      lora: this.state.loras.find((item) => item.name === saved.name) || manualLora(saved.name),
      weight: clamp(Number(saved.weight) || 1, -10, 10),
      enabled: true,
      useTrigger: false,
    }))
    this.renderStack()
    this.renderLoras()
    this.renderPresetStack()
    this.updateContextControls()
    this.closeInspector()
    this.closeOutputLibrary()
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    this.setRunStatus(`Reused prompts, locked seed ${parameters.seed ?? "as recorded"}, presets, render settings, and LoRA stack.`)
  }

  private deleteCurrentOutput(): void {
    const image = this.state.currentImage
    if (!image?.id) return
    if (!window.confirm(`Delete “${image.label}” from Lumiverse? This cannot be undone.`)) return
    this.send("delete_output", { imageId: image.id })
    this.setRunStatus(`Deleting “${image.label}”…`)
  }

  private async useCurrentAsInit(): Promise<void> {
    const image = this.state.currentImage
    if (!image?.src) return
    this.setRunStatus("Preparing the selected output for img2img…")
    try {
      const response = await fetch(image.url || image.src, { credentials: "same-origin" })
      if (!response.ok) throw new Error(`Image request failed (${response.status}).`)
      await this.setInitFromBlob(await response.blob(), image.label, image.id || "")
      this.closeInspector()
      this.closeOutputLibrary()
      if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("generation")
      this.setRunStatus(`Init image ready · creativity ${this.get<HTMLInputElement>('[data-role="denoise"]').value}.`)
    } catch (error) {
      this.setRunStatus(`Could not prepare init image: ${error instanceof Error ? error.message : String(error)}`, true)
    }
  }

  private async setInitFromBlob(blob: Blob, label: string, imageId: string): Promise<void> {
    if (!blob.type.startsWith("image/")) throw new Error("Choose an image file.")
    let prepared = blob
    try {
      const bitmap = await createImageBitmap(blob)
      const maxDimension = 1536
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      const compressed = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", .88)
      )
      if (compressed) prepared = compressed
    } catch {
      // Browsers without createImageBitmap can still pass through modest files.
    }
    if (prepared.size > 2_700_000) {
      throw new Error("The prepared init image is still too large; choose an image under roughly 3 MB.")
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(reader.error || new Error("Could not read image."))
      reader.readAsDataURL(prepared)
    })
    const comma = dataUrl.indexOf(",")
    if (comma < 0) throw new Error("Could not encode the init image.")
    this.state.initImage = {
      data: dataUrl.slice(comma + 1),
      mimeType: prepared.type || blob.type || "image/png",
      src: dataUrl,
      label,
      imageId,
    }
    this.renderInitImage()
  }

  private clearInitImage(): void {
    this.state.initImage = null
    this.renderInitImage()
    this.setRunStatus("Init image cleared; generation is text-to-image again.")
  }

  private renderInitImage(): void {
    const preview = this.get<HTMLElement>('[data-role="init-preview"]')
    const label = this.get<HTMLElement>('[data-role="init-label"]')
    const clear = this.get<HTMLButtonElement>('[data-action="clear-init"]')
    preview.replaceChildren()
    if (!this.state.initImage) {
      preview.textContent = "No init"
      label.textContent = "Text-to-image"
      clear.disabled = true
      return
    }
    const image = element("img")
    image.src = this.state.initImage.src
    image.alt = this.state.initImage.label
    preview.appendChild(image)
    label.textContent = this.state.initImage.label
    clear.disabled = false
  }

  private openOutputLibrary(): void {
    this.closeInspector()
    this.get<HTMLElement>('[data-role="output-library"]').hidden = false
    this.get<HTMLElement>('[data-role="library-grid"]').replaceChildren(
      element("div", "ss-empty", "Loading Lumiverse outputs…"),
    )
    this.send("list_library_outputs")
  }

  private closeOutputLibrary(): void {
    this.get<HTMLElement>('[data-role="output-library"]').hidden = true
    this.librarySelection.clear()
  }

  private createOutputFolder(): void {
    const name = window.prompt("Name this output folder:")
    if (!name?.trim()) return
    this.send("create_output_folder", { name: name.trim() })
  }

  private deleteSelectedOutputFolder(): void {
    const folder = this.state.outputFolders.find((item) => item.id === this.libraryFolderId)
    if (!folder || !window.confirm(`Delete folder “${folder.name}”? Its images stay in Lumiverse.`)) return
    this.send("delete_output_folder", { folderId: folder.id })
    this.libraryFolderId = ""
    this.libraryPage = 0
  }

  private changeLibraryPage(delta: number): void {
    const filtered = this.filteredLibraryOutputs()
    const pages = Math.max(1, Math.ceil(filtered.length / this.currentLibraryPageSize()))
    this.libraryPage = clamp(this.libraryPage + delta, 0, pages - 1)
    this.renderOutputLibrary()
  }

  private currentLibraryPageSize(): number {
    return outputLibraryPageSize(window.innerWidth)
  }

  private libraryPageOutputs(): any[] {
    const filtered = this.filteredLibraryOutputs()
    const pageSize = this.currentLibraryPageSize()
    return filtered.slice(
      this.libraryPage * pageSize,
      (this.libraryPage + 1) * pageSize,
    )
  }

  private toggleLibraryPageSelection(): void {
    const ids = this.libraryPageOutputs().map((output) => String(output.id))
    const allSelected = ids.length > 0 && ids.every((id) => this.librarySelection.has(id))
    for (const id of ids) {
      if (allSelected) this.librarySelection.delete(id)
      else this.librarySelection.add(id)
    }
    this.renderOutputLibrary()
  }

  private updateLibrarySelectionControls(): void {
    const selected = this.librarySelection.size
    this.get<HTMLElement>('[data-role="library-selection-count"]').textContent =
      `${selected} selected`
    this.get<HTMLButtonElement>('[data-action="bulk-move-outputs"]').disabled = selected === 0
    this.get<HTMLButtonElement>('[data-action="bulk-delete-outputs"]').disabled = selected === 0
    const pageIds = this.libraryPageOutputs().map((output) => String(output.id))
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => this.librarySelection.has(id))
    this.get<HTMLButtonElement>('[data-action="select-library-page"]').textContent =
      allPageSelected ? "Clear page" : "Select page"
  }

  private bulkMoveOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    this.send("bulk_move_outputs", {
      imageIds,
      folderId: this.get<HTMLSelectElement>('[data-role="bulk-folder"]').value,
    })
    this.setRunStatus(`Moving ${imageIds.length} selected output${imageIds.length === 1 ? "" : "s"}…`)
  }

  private bulkDeleteOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    if (!window.confirm(`Delete ${imageIds.length} selected Lumiverse output${imageIds.length === 1 ? "" : "s"}? This cannot be undone.`)) return
    this.send("bulk_delete_outputs", { imageIds })
    this.setRunStatus(`Deleting ${imageIds.length} selected output${imageIds.length === 1 ? "" : "s"}…`)
  }

  private filteredLibraryOutputs(): any[] {
    let outputs = this.state.libraryOutputs
    if (this.libraryFolderId) {
      const assigned = new Set(this.state.outputFolders.flatMap((folder) => folder.imageIds))
      if (this.libraryFolderId === "__unfiled__") {
        outputs = outputs.filter((output) => !assigned.has(String(output.id)))
      } else {
        const folder = this.state.outputFolders.find((item) => item.id === this.libraryFolderId)
        const ids = new Set(folder?.imageIds || [])
        outputs = outputs.filter((output) => ids.has(String(output.id)))
      }
    }
    const query = this.root.querySelector<HTMLInputElement>('[data-role="library-search"]')?.value || ""
    if (!query.trim()) return outputs
    return outputs.filter((output) => {
      const details = output?.studioMetadata || {}
      const parameters = details?.parameters || {}
      return matchesKeywordQuery(query, [
        output?.original_filename,
        output?.id,
        details?.prompt,
        details?.negativePrompt,
        details?.model,
        details?.presets,
        details?.loras?.flatMap((lora: any) => [lora?.name, lora?.title, lora?.weight]),
        details?.initImageLabel,
        details?.swarmPath,
        parameters?.seed,
        parameters?.sampler,
        parameters?.scheduler,
        parameters?.width,
        parameters?.height,
        parameters?.steps,
        parameters?.cfg,
      ])
    })
  }

  private renderOutputLibrary(): void {
    const folderPane = this.get<HTMLElement>('[data-role="library-folders"]')
    folderPane.replaceChildren()
    const appendFolder = (id: string, name: string, count: number) => {
      const button = element("button", "ss-library-folder")
      button.dataset.action = "library-folder"
      button.dataset.folderId = id
      button.dataset.active = String(this.libraryFolderId === id)
      button.append(element("span", "", name), element("span", "ss-muted ss-tiny", String(count)))
      folderPane.appendChild(button)
    }
    appendFolder("", "All outputs", this.state.libraryOutputs.length)
    const assigned = new Set(this.state.outputFolders.flatMap((folder) => folder.imageIds))
    appendFolder(
      "__unfiled__",
      "Unfiled",
      this.state.libraryOutputs.filter((output) => !assigned.has(String(output.id))).length,
    )
    for (const folder of this.state.outputFolders) {
      const ids = new Set(folder.imageIds)
      appendFolder(folder.id, folder.name, this.state.libraryOutputs.filter((output) => ids.has(String(output.id))).length)
    }
    const tools = element("div", "ss-library-folder-tools")
    const create = element("button", "ss-button", "New folder")
    create.dataset.action = "create-output-folder"
    const remove = element("button", "ss-button ss-button-danger", "Delete")
    remove.dataset.action = "delete-output-folder"
    remove.disabled = !this.state.outputFolders.some((folder) => folder.id === this.libraryFolderId)
    tools.append(create, remove)
    folderPane.appendChild(tools)

    const filtered = this.filteredLibraryOutputs()
    const pages = Math.max(1, Math.ceil(filtered.length / this.currentLibraryPageSize()))
    this.libraryPage = clamp(this.libraryPage, 0, pages - 1)
    const selectedFolder = this.state.outputFolders.find((folder) => folder.id === this.libraryFolderId)
    this.get<HTMLElement>('[data-role="library-title"]').textContent =
      selectedFolder?.name || (this.libraryFolderId === "__unfiled__" ? "Unfiled" : "All outputs")
    this.get<HTMLElement>('[data-role="library-count"]').textContent = `${filtered.length} image${filtered.length === 1 ? "" : "s"}`
    this.get<HTMLElement>('[data-role="library-page"]').textContent = `${this.libraryPage + 1} / ${pages}`
    this.get<HTMLButtonElement>('[data-action="library-prev"]').disabled = this.libraryPage <= 0
    this.get<HTMLButtonElement>('[data-action="library-next"]').disabled = this.libraryPage >= pages - 1
    const bulkFolder = this.get<HTMLSelectElement>('[data-role="bulk-folder"]')
    const previousBulkFolder = bulkFolder.value
    bulkFolder.replaceChildren()
    const unfiledBulk = element("option", "", "Move to Unfiled")
    unfiledBulk.value = ""
    bulkFolder.appendChild(unfiledBulk)
    for (const folder of this.state.outputFolders) {
      const option = element("option", "", `Move to ${folder.name}`)
      option.value = folder.id
      bulkFolder.appendChild(option)
    }
    bulkFolder.value = this.state.outputFolders.some((folder) => folder.id === previousBulkFolder)
      ? previousBulkFolder
      : ""

    const grid = this.get<HTMLElement>('[data-role="library-grid"]')
    grid.replaceChildren()
    const page = this.libraryPageOutputs()
    if (!page.length) {
      const query = this.get<HTMLInputElement>('[data-role="library-search"]').value.trim()
      grid.appendChild(element("div", "ss-empty", query ? "No outputs match those keywords." : "No outputs in this folder yet."))
      this.updateLibrarySelectionControls()
      return
    }
    for (const output of page) {
      const card = element("article", "ss-library-output")
      const imageId = String(output.id)
      const selected = this.librarySelection.has(imageId)
      card.dataset.selected = String(selected)
      const checkLabel = element("label", "ss-library-output-check")
      const check = element("input")
      check.type = "checkbox"
      check.checked = selected
      check.dataset.role = "library-output-check"
      check.dataset.imageId = imageId
      check.setAttribute("aria-label", `Select ${output.original_filename || `output ${imageId}`}`)
      checkLabel.appendChild(check)
      const open = element("button", "ss-library-output-button")
      const image = element("img")
      image.src = output.url
      image.alt = output.original_filename || "Generated output"
      open.appendChild(image)
      open.addEventListener("click", () => {
        this.setCurrentImage(this.outputToCurrentImage(output))
        this.openInspector()
      })
      const meta = element("div", "ss-library-output-meta")
      meta.appendChild(element("div", "ss-library-output-name", output.original_filename || `Output ${output.id}`))
      const folderSelect = element("select", "ss-select")
      folderSelect.dataset.role = "library-folder-select"
      folderSelect.dataset.imageId = String(output.id)
      const unfiled = element("option", "", "Unfiled")
      unfiled.value = ""
      folderSelect.appendChild(unfiled)
      for (const folder of this.state.outputFolders) {
        const option = element("option", "", folder.name)
        option.value = folder.id
        folderSelect.appendChild(option)
      }
      folderSelect.value = this.state.outputFolders.find((folder) => folder.imageIds.includes(String(output.id)))?.id || ""
      meta.appendChild(folderSelect)
      card.append(checkLabel, open, meta)
      grid.appendChild(card)
    }
    this.updateLibrarySelectionControls()
  }

  private inheritedTriggers(): string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const item of this.state.stack) {
      const trigger = item.lora.triggerPhrase.trim()
      const key = trigger.toLowerCase()
      if (item.enabled && item.useTrigger && trigger && !seen.has(key)) {
        seen.add(key)
        result.push(trigger)
      }
    }
    return result
  }

  private updateTriggerSummary(): void {
    const triggers = this.inheritedTriggers()
    this.get<HTMLElement>('[data-role="trigger-summary"]').textContent = triggers.length
      ? `${triggers.length} inherited: ${triggers.join(", ")}`
      : "No inherited trigger phrases."
  }

  private finalPrompt(): string {
    const prompt = this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim()
    const triggers = this.inheritedTriggers().filter((trigger) => !prompt.toLowerCase().includes(trigger.toLowerCase()))
    return [triggers.join(", "), prompt].filter(Boolean).join(", ")
  }

  private buildRawOverride(): string | undefined {
    const raw = this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value.trim()
    let parsed: Record<string, unknown> = {}
    if (raw) {
      const value = JSON.parse(raw)
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Raw request override must be a JSON object.")
      }
      parsed = value as Record<string, unknown>
    }
    const presets = this.state.selectedPresets
      .filter((preset) => preset.enabled)
      .map((preset) => preset.title)
    if (presets.length) parsed.presets = presets
    else delete parsed.presets
    return Object.keys(parsed).length ? JSON.stringify(parsed) : undefined
  }

  private generate(): void {
    if (this.generating || !this.state.connection) return
    const prompt = this.finalPrompt()
    if (!prompt) {
      this.setRunStatus("Enter a prompt or enable a LoRA trigger phrase.", true)
      return
    }

    let rawRequestOverride: string | undefined
    try {
      rawRequestOverride = this.buildRawOverride()
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : String(error), true)
      return
    }

    const enabled = this.state.stack.filter((item) => item.enabled)
    const optional = (role: string): string =>
      this.get<HTMLInputElement | HTMLSelectElement>(`[data-role="${role}"]`).value.trim()
    const parameters: Record<string, unknown> = {
      width: clamp(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024), 64, 4096),
      height: clamp(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024), 64, 4096),
      steps: clamp(numberValue(this.get<HTMLInputElement>('[data-role="steps"]'), 20), 1, 150),
      cfgScale: clamp(numberValue(this.get<HTMLInputElement>('[data-role="cfg"]'), 7), 1, 30),
      seed: Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1)),
      sampler: optional("sampler") || undefined,
      scheduler: optional("scheduler") || undefined,
      vae: optional("vae") || undefined,
      unet: optional("unet") || undefined,
      clipLModel: optional("clip-l") || undefined,
      clipGModel: optional("clip-g") || undefined,
      t5XXLModel: optional("t5") || undefined,
      loras: enabled.map((item) => item.lora.name),
      loraWeights: enabled.map((item) => item.weight),
      rawRequestOverride,
    }
    if (this.state.initImage) {
      parameters.referenceImages = [{
        data: this.state.initImage.data,
        mimeType: this.state.initImage.mimeType,
      }]
      parameters.denoise = clamp(
        numberValue(this.get<HTMLInputElement>('[data-role="denoise"]'), .6),
        0,
        1,
      )
    }

    const clientJobId = crypto.randomUUID()
    const negativePrompt = this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim()
    const model = this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model
    const resolved = this.resolvedPrompts()
    this.pendingGeneration = {
      prompt,
      negativePrompt,
      resolvedPrompt: resolved.prompt,
      resolvedNegativePrompt: resolved.negativePrompt,
      model,
      parameters,
      loras: enabled.map((item) => ({ name: item.lora.name, weight: item.weight })),
      presets: resolved.presets,
      initImageId: this.state.initImage?.imageId || "",
      initImageLabel: this.state.initImage?.label || "",
      createdAt: Date.now(),
    }
    this.preGenerationImage = this.state.currentImage
    this.generating = true
    this.currentJobId = clientJobId
    this.setGenerating(true)
    this.setRunStatus(`Generating with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`)
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    this.send("generate", {
      input: {
        prompt,
        negativePrompt: negativePrompt || undefined,
        connection_id: this.state.connection.id,
        model,
        clientJobId,
        parameters,
      },
      recordHints: {
        resolvedPrompt: resolved.prompt,
        resolvedNegativePrompt: resolved.negativePrompt,
        presets: resolved.presets,
        initImageId: this.state.initImage?.imageId || "",
        initImageLabel: this.state.initImage?.label || "",
      },
    })
  }

  private updatePreviewAspect(width: number, height: number): void {
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      this.previewAspect = clamp(width / height, 0.1, 10)
    }
    this.get<HTMLElement>('[data-role="current-preview"]').style.setProperty(
      "--ss-preview-aspect",
      String(this.previewAspect),
    )
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private fitPreviewToAspect(): void {
    if (this.disposed) return
    const stage = this.root.querySelector<HTMLElement>('[data-role="output-stage"]')
    const preview = this.root.querySelector<HTMLElement>('[data-role="current-preview"]')
    if (!stage || !preview || stage.clientWidth <= 0) return
    const availableWidth = Math.max(120, stage.clientWidth - 18)
    let maximumHeight: number

    if (window.matchMedia("(max-width: 720px)").matches) {
      maximumHeight = Math.max(190, window.innerHeight * 0.52)
    } else {
      const head = stage.querySelector<HTMLElement>(".ss-output-stage-head")
      const meta = stage.querySelector<HTMLElement>(".ss-output-meta")
      maximumHeight = Math.max(
        150,
        stage.clientHeight - (head?.offsetHeight || 0) - (meta?.offsetHeight || 0) - 34,
      )
    }

    const fitted = fitAspectWithin(this.previewAspect, availableWidth, maximumHeight)
    preview.style.width = `${Math.round(fitted.width)}px`
    preview.style.height = `${Math.round(fitted.height)}px`
  }

  private setGenerating(value: boolean): void {
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".ss-generate")) {
      button.disabled = !value && (!this.state.connection || !this.state.permissions.imageGen)
      button.dataset.action = value ? "interrupt-generation" : "generate"
      button.textContent = value ? "Interrupt generation" : "Generate image"
      button.classList.toggle("ss-button-danger", value)
      button.classList.toggle("ss-button-primary", !value)
      button.title = value ? "Stop the active SwarmUI generation" : "Generate image"
    }
    if (value) {
      this.updatePreviewAspect(
        numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
        numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
      )
      this.updateGenerationProgress(0, 0)
    }
    this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = String(value)
  }

  private updateGenerationProgress(step: number, totalSteps: number): void {
    const hasTotal = Number.isFinite(totalSteps) && totalSteps > 0
    const safeStep = hasTotal ? clamp(Number(step) || 0, 0, totalSteps) : 0
    const percentage = hasTotal ? clamp(Math.round((safeStep / totalSteps) * 100), 0, 100) : 0
    for (const progress of this.root.querySelectorAll<HTMLElement>('[data-role="generation-progress"]')) {
      progress.dataset.indeterminate = String(!hasTotal)
      progress.style.setProperty("--ss-progress", `${percentage}%`)
      const label = progress.querySelector<HTMLElement>('[data-role="progress-label"]')
      if (label) {
        label.textContent = hasTotal
          ? `${percentage}% · ${Math.round(safeStep)} / ${Math.round(totalSteps)}`
          : "Preparing generation…"
      }
    }
  }

  private interruptGeneration(): void {
    if (!this.generating || !this.currentJobId || !this.state.connection) return
    this.send("interrupt_generation", {
      clientJobId: this.currentJobId,
      connectionId: this.state.connection.id,
    })
    this.setRunStatus("Interrupt requested — stopping SwarmUI…")
  }

  private showLivePreview(src: string, step: number, totalSteps: number): void {
    const label = totalSteps > 0
      ? `Live SwarmUI preview · ${step} / ${totalSteps}`
      : "Live SwarmUI preview"
    this.state.currentImage = {
      src,
      label,
      details: this.pendingGeneration,
    }
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.onload = () => {
      if (preview.naturalWidth && preview.naturalHeight) {
        this.updatePreviewAspect(preview.naturalWidth, preview.naturalHeight)
      }
    }
    preview.src = src
    preview.hidden = false
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.updateGenerationProgress(step, totalSteps)
    this.get<HTMLElement>('[data-role="output-label"]').textContent = label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
  }

  private renderOutputs(): void {
    const grid = this.get<HTMLElement>('[data-role="history-grid"]')
    grid.replaceChildren()
    this.get<HTMLElement>('[data-role="output-count"]').textContent = String(this.state.outputTotal)
    const pages = Math.max(1, Math.ceil(this.state.outputTotal / this.state.outputLimit))
    const page = Math.min(pages, Math.floor(this.state.outputOffset / this.state.outputLimit) + 1)
    this.get<HTMLElement>('[data-role="history-page"]').textContent = `${page} / ${pages}`
    this.get<HTMLButtonElement>('[data-action="history-prev"]').disabled = this.state.outputOffset <= 0
    this.get<HTMLButtonElement>('[data-action="history-next"]').disabled =
      this.state.outputOffset + this.state.outputLimit >= this.state.outputTotal
    if (!this.state.outputs.length) {
      grid.appendChild(element("div", "ss-empty", "Outputs created in this chat will appear here."))
      return
    }
    for (const output of this.state.outputs) {
      const current = this.outputToCurrentImage(output)
      const card = element("div", "ss-history-card")
      const button = element("button", "ss-history-item")
      button.title = output.original_filename || "Generated image"
      const image = element("img")
      image.src = output.url
      image.alt = output.original_filename || "Generated image"
      button.appendChild(image)
      button.addEventListener("click", () => {
        this.closeHistoryMenus()
        this.setCurrentImage(current)
        this.openInspector()
      })
      const menuToggle = element("button", "ss-history-menu-toggle", "⋮")
      menuToggle.type = "button"
      menuToggle.setAttribute("aria-label", `Actions for ${current.label}`)
      menuToggle.setAttribute("aria-expanded", "false")
      const menu = element("div", "ss-history-menu")
      menu.hidden = true
      const menuAction = (
        label: string,
        className: string,
        handler: () => void,
        disabled = false,
      ) => {
        const action = element("button", `ss-button ${className}`, label)
        action.type = "button"
        action.disabled = disabled
        action.addEventListener("click", (event) => {
          event.stopPropagation()
          this.closeHistoryMenus()
          this.setCurrentImage(current)
          handler()
        })
        menu.appendChild(action)
      }
      menuAction("Reuse", "", () => this.reuseCurrentParameters(), !current.details)
      menuAction("Use as init", "", () => void this.useCurrentAsInit(), !current.src)
      menuAction("Delete", "ss-button-danger", () => this.deleteCurrentOutput(), !current.id)
      menuToggle.addEventListener("click", (event) => {
        event.stopPropagation()
        const shouldOpen = menu.hidden
        this.closeHistoryMenus()
        menu.hidden = !shouldOpen
        menuToggle.setAttribute("aria-expanded", String(shouldOpen))
      })
      card.append(button, menuToggle, menu)
      grid.appendChild(card)
    }
  }

  private closeHistoryMenus(): void {
    for (const menu of this.root.querySelectorAll<HTMLElement>(".ss-history-menu")) menu.hidden = true
    for (const toggle of this.root.querySelectorAll<HTMLElement>(".ss-history-menu-toggle")) {
      toggle.setAttribute("aria-expanded", "false")
    }
  }

  private refreshOutputs(offset = this.state.outputOffset): void {
    this.send("refresh_outputs", {
      offset,
      limit: this.state.outputLimit,
    })
  }

  private changeHistoryPage(delta: number): void {
    const next = Math.max(0, this.state.outputOffset + delta * this.state.outputLimit)
    if (next >= this.state.outputTotal && delta > 0) return
    this.refreshOutputs(next)
  }

  private outputToCurrentImage(output: any): CurrentImage {
    const fullUrl = typeof output.url === "string" ? output.url.replace(/\?.*$/, "") : output.url
    return {
      id: String(output.id || ""),
      src: output.url,
      url: fullUrl || output.url,
      label: output.original_filename || `Output ${output.id}`,
      details: output.studioMetadata || null,
    }
  }

  private setCurrentImage(image: CurrentImage): void {
    this.state.currentImage = image
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    const width = Number(image.details?.parameters?.width)
    const height = Number(image.details?.parameters?.height)
    if (width > 0 && height > 0) this.updatePreviewAspect(width, height)
    preview.onload = () => {
      if (preview.naturalWidth && preview.naturalHeight) {
        this.updatePreviewAspect(preview.naturalWidth, preview.naturalHeight)
      }
    }
    preview.src = image.src
    preview.hidden = false
    this.get<HTMLButtonElement>('[data-action="use-current-init"]').disabled = false
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.get<HTMLElement>('[data-role="output-label"]').textContent = image.label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = false
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = !image.url
    this.updateContextControls()
  }

  private clearCurrentImage(): void {
    this.state.currentImage = null
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.removeAttribute("src")
    preview.hidden = true
    this.get<HTMLButtonElement>('[data-action="use-current-init"]').disabled = true
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = false
    this.get<HTMLElement>('[data-role="output-label"]').textContent = "Nothing selected"
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
    this.updateContextControls()
  }

  private downloadCurrent(): void {
    if (!this.state.currentImage) return
    const anchor = document.createElement("a")
    anchor.href = this.state.currentImage.url || this.state.currentImage.src
    anchor.download = `swarm-studio-${Date.now()}.png`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  private async copyCurrentUrl(): Promise<void> {
    const url = this.state.currentImage?.url
    if (!url) return
    try {
      const absolute = url.startsWith("data:") ? url : new URL(url, window.location.href).href
      await navigator.clipboard.writeText(absolute)
      this.setRunStatus("Output URL copied.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private changeOrientation(): void {
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    const target: "portrait" | "landscape" = width >= height ? "portrait" : "landscape"
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]')
    const reciprocal: Record<string, string> = {
      "2:3": "3:2",
      "3:2": "2:3",
      "4:5": "5:4",
      "5:4": "4:5",
      "9:16": "16:9",
      "16:9": "9:16",
    }
    if (aspect.value === "1:1") {
      aspect.value = target === "portrait" ? "2:3" : "3:2"
      this.applyAspectSelection()
      return
    }
    const swappedPreset = reciprocal[aspect.value]
    if (swappedPreset) {
      aspect.value = swappedPreset
      this.applyAspectSelection()
      return
    }
    if (
      (target === "portrait" && width >= height)
      || (target === "landscape" && height >= width)
    ) {
      this.setDimensions(height, width)
    }
  }

  private toggleSeedMode(): void {
    const seed = this.get<HTMLInputElement>('[data-role="seed"]')
    if (numberValue(seed, -1) === -1) {
      const recordedSeed = Number(this.state.currentImage?.details?.parameters?.seed)
      const fallback = crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff
      seed.value = String(Number.isFinite(recordedSeed) && recordedSeed >= 0 ? Math.trunc(recordedSeed) : fallback)
    } else {
      seed.value = "-1"
    }
    this.updateContextControls()
  }

  private updateContextControls(): void {
    const orientationButton = this.root.querySelector<HTMLButtonElement>('[data-role="orientation-action"]')
    const seedButton = this.root.querySelector<HTMLButtonElement>('[data-role="seed-action"]')
    if (!orientationButton || !seedButton) return
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    const makePortrait = width >= height
    orientationButton.innerHTML = `${makePortrait ? PORTRAIT_ICON : LANDSCAPE_ICON}<span>${makePortrait ? "Portrait" : "Landscape"}</span>`
    orientationButton.title = makePortrait
      ? "Flip the current aspect ratio to portrait"
      : "Flip the current aspect ratio to landscape"

    const random = numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1) === -1
    seedButton.innerHTML = `${random ? CURRENT_SEED_ICON : RANDOM_SEED_ICON}<span>${random ? "Current seed" : "Random seed"}</span>`
    seedButton.title = random
      ? "Lock to the current output's seed (or create a fixed seed if no output is selected)"
      : "Set seed to -1 for a random generation"
  }

  private setConnectionStatus(status: "loading" | "ready" | "warning" | "error"): void {
    const colors = {
      loading: "#f59e0b",
      ready: "#4ade80",
      warning: "#e0a458",
      error: "#ef7777",
    }
    this.get<HTMLElement>(".ss-connection-wrap").style.setProperty("--ss-status-color", colors[status])
  }

  private setRunStatus(message: string, error = false): void {
    for (const status of this.root.querySelectorAll<HTMLElement>(
      '[data-role="run-status"], [data-role="prompt-run-status"]',
    )) {
      status.textContent = message
      status.style.color = error ? "#ef7777" : ""
    }
  }
}

let activeStudio: StudioController | null = null
let activeModal: any | null = null

export function setup(ctx: FrontendContext): () => void {
  const removeStyle = ctx.dom.addStyle(`${STYLES}\n${STUDIO_V3_STYLES}`)
  let currentTheme = storedStudioTheme()
  let appearance = storedStudioAppearance()
  appearance.customCss = sanitizeCustomCss(appearance.customCss)
  let launcher: HTMLElement | null = null
  let removeCustomStyle: (() => void) | null = appearance.customCss
    ? ctx.dom.addStyle(appearance.customCss)
    : null

  const updateAppearance = (next: StudioAppearance) => {
    appearance = cloneStudioAppearance(next)
    appearance.customCss = sanitizeCustomCss(appearance.customCss)
    persistStudioAppearance(appearance)
    if (launcher) applyAppearanceVariables(launcher, appearance)
    activeStudio?.setAppearance(appearance)
    removeCustomStyle?.()
    removeCustomStyle = appearance.customCss ? ctx.dom.addStyle(appearance.customCss) : null
  }

  const selectTheme = (theme: StudioTheme) => {
    currentTheme = theme
    persistStudioTheme(theme)
    appearance.colors = {}
    appearance.radius = null
    if (launcher) {
      launcher.dataset.theme = theme
      for (const swatch of launcher.querySelectorAll<HTMLElement>("[data-theme-choice]")) {
        swatch.dataset.active = String(swatch.dataset.themeChoice === theme)
      }
    }
    activeStudio?.setTheme(theme)
    updateAppearance(appearance)
  }

  const openStudio = (initialView: "studio" | "library" = "studio") => {
    if (activeModal) {
      if (initialView === "library") activeStudio?.openLibrary()
      return
    }
    const modal = ctx.ui.showModal({
      title: "Swarm Studio",
      width: 1440,
      maxHeight: 980,
      persistent: false,
    })
    activeModal = modal
    activeStudio = new StudioController(ctx, modal, selectTheme, updateAppearance)
    activeStudio.setAppearance(appearance)
    activeStudio.setTheme(currentTheme)
    if (initialView === "library") activeStudio.openLibrary()
    modal.onDismiss(() => {
      activeStudio?.dispose()
      activeStudio = null
      activeModal = null
    })
  }

  const drawer = ctx.ui.registerDrawerTab({
    id: "swarm-studio",
    title: "Swarm Studio",
    shortName: "Swarm",
    headerTitle: "Swarm Studio",
    description: "Open the metadata-aware SwarmUI prompt and LoRA studio",
    keywords: ["image", "generation", "lora", "swarmui", "prompt", "studio"],
    iconSvg: STUDIO_ICON,
  })
  launcher = element("div", "ss-launcher")
  launcher.dataset.theme = currentTheme
  applyAppearanceVariables(launcher, appearance)
  const launcherTop = element("div", "ss-launcher-top")
  const mark = element("div", "ss-launcher-mark")
  mark.innerHTML = STUDIO_ICON
  const launcherTitle = element("div")
  launcherTitle.append(
    element("div", "ss-launcher-eyebrow", "Local image atelier"),
    element("h3", "", "Imagine with SwarmUI"),
  )
  launcherTop.append(mark, launcherTitle)
  launcher.appendChild(launcherTop)
  launcher.appendChild(element("p", "", "Prompt, stack LoRAs, inspect live generations, and organize every Lumiverse-owned output from one quiet little workspace."))
  const chips = element("div", "ss-launcher-chips")
  for (const label of ["Prompt studio", "LoRA stacks", "Output folders"]) {
    chips.appendChild(element("span", "ss-launcher-chip", label))
  }
  launcher.appendChild(chips)
  const launcherActions = element("div", "ss-launcher-actions")
  const launchButton = element("button", "ss-button ss-button-primary")
  launchButton.innerHTML = `${STUDIO_ICON}<span class="ss-launcher-action-copy"><strong>Open Studio</strong><span>Compose, tune, stack, and generate</span></span><span class="ss-launcher-arrow">›</span>`
  launchButton.addEventListener("click", () => openStudio("studio"))
  const libraryButton = element("button", "ss-button")
  libraryButton.innerHTML = `${LIBRARY_ICON}<span class="ss-launcher-action-copy"><strong>Output Library</strong><span>Search metadata, folders, reuse, and cleanup</span></span><span class="ss-launcher-arrow">›</span>`
  libraryButton.addEventListener("click", () => openStudio("library"))
  launcherActions.append(launchButton, libraryButton)
  launcher.appendChild(launcherActions)
  const flow = element("div", "ss-launcher-flow")
  const flowItems = [
    ["01", "Compose", "Prompt with presets, img2img, and model-aware controls."],
    ["02", "Layer", "Browse visual metadata and build reusable LoRA stacks."],
    ["03", "Keep", "Inspect, reuse, search, folder, or delete Lumiverse outputs."],
  ]
  for (const [number, title, copy] of flowItems) {
    const item = element("div", "ss-launcher-flow-item")
    const body = element("div")
    body.append(element("strong", "", title), element("small", "", copy))
    item.append(element("span", "", number), body)
    flow.appendChild(item)
  }
  launcher.appendChild(flow)
  const themeRow = element("div", "ss-launcher-theme-row")
  themeRow.appendChild(element("span", "", "Workspace mood"))
  for (const theme of STUDIO_THEMES) {
    const swatch = element("button", "ss-theme-swatch")
    swatch.dataset.themeChoice = theme.id
    swatch.dataset.active = String(theme.id === currentTheme)
    swatch.style.setProperty("--ss-swatch", theme.color)
    swatch.title = theme.label
    swatch.setAttribute("aria-label", `Use ${theme.label} theme`)
    swatch.addEventListener("click", () => selectTheme(theme.id))
    themeRow.appendChild(swatch)
  }
  launcher.appendChild(themeRow)
  drawer.root.appendChild(launcher)

  const inputAction = ctx.ui.registerInputBarAction({
    id: "open-swarm-studio",
    label: "Open Swarm Studio",
    iconSvg: STUDIO_ICON,
    enabled: true,
  })
  const removeActionClick = inputAction.onClick(() => openStudio("studio"))
  const unsubscribeMessages = ctx.onBackendMessage((payload: any) => activeStudio?.onMessage(payload))
  const unsubscribeProgress = ctx.events.on("IMAGE_GEN_PROGRESS", (payload: any) => activeStudio?.onImageGenerationEvent("progress", payload))
  const unsubscribeComplete = ctx.events.on("IMAGE_GEN_COMPLETE", (payload: any) => activeStudio?.onImageGenerationEvent("complete", payload))
  const unsubscribeError = ctx.events.on("IMAGE_GEN_ERROR", (payload: any) => activeStudio?.onImageGenerationEvent("error", payload))

  return () => {
    activeStudio?.dispose()
    activeModal?.dismiss()
    activeStudio = null
    activeModal = null
    unsubscribeMessages()
    unsubscribeProgress()
    unsubscribeComplete()
    unsubscribeError()
    removeActionClick()
    inputAction.destroy()
    drawer.destroy()
    removeCustomStyle?.()
    removeStyle()
  }
}
