type FrontendContext = any

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

interface StudioState {
  connections: any[]
  connection: any | null
  models: Array<{ id: string; label: string }>
  loras: LoraMetadata[]
  stack: StackItem[]
  outputs: any[]
  activeChat: any | null
  permissions: Record<string, boolean>
  hasMetadataToken: boolean
  currentImage: { src: string; url?: string; label: string } | null
}

const STUDIO_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5.5h16v13H4z"/><path d="m7 15 3-3 2.2 2.2 2.3-2.8L18 15"/>
    <path d="M8 8.5h.01"/><path d="M17.5 2.8v4M15.5 4.8h4"/>
  </svg>
`

const STYLES = `
  .ss-launcher {
    margin: 12px;
    padding: 18px;
    border: 1px solid var(--lumiverse-border);
    border-radius: calc(var(--lumiverse-radius, 10px) * 1.25);
    background:
      radial-gradient(circle at 85% 0%, color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 18%, transparent), transparent 42%),
      var(--lumiverse-fill-subtle);
    color: var(--lumiverse-text);
  }
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
  .ss-launcher h3 { margin: 13px 0 5px; font-size: 15px; }
  .ss-launcher p { margin: 0 0 14px; color: var(--lumiverse-text-muted); font-size: 12px; line-height: 1.55; }
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
    border: 1px solid var(--lumiverse-border);
    background: var(--lumiverse-fill-subtle);
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
    border-color: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 60%, var(--lumiverse-border));
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 8%, var(--lumiverse-fill-subtle));
  }
  .ss-button:active:not(:disabled), .ss-icon-button:active:not(:disabled) { transform: translateY(1px); }
  .ss-button:disabled, .ss-icon-button:disabled { cursor: not-allowed; opacity: .48; }
  .ss-button-primary {
    color: var(--lumiverse-accent-text, #06131d);
    background: var(--lumiverse-accent, #7dd3fc);
    border-color: transparent;
  }
  .ss-button-primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 86%, white);
    border-color: transparent;
  }
  .ss-button-danger { color: #ef7777; }
  .ss-icon-button { min-width: 34px; padding: 6px 8px; }
  .ss-input, .ss-select, .ss-textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    background: var(--lumiverse-fill);
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
  }
  .ss-advanced-grid .ss-wide { grid-column: 1 / -1; }
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
    grid-template-columns: auto minmax(125px, 1fr) 75px auto auto;
    align-items: center;
    gap: 7px;
    padding: 6px 7px;
    border: 1px solid var(--lumiverse-border);
    border-radius: var(--lumiverse-radius, 8px);
    background: var(--lumiverse-fill);
  }
  .ss-stack-row[data-disabled="true"] { opacity: .58; }
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
  .ss-preview-empty { max-width: 190px; text-align: center; color: var(--lumiverse-text-muted); line-height: 1.55; }
  .ss-preview-empty strong { display: block; color: var(--lumiverse-text); margin-bottom: 5px; }
  .ss-preview-loading {
    position: absolute;
    inset: 0;
    display: none;
    place-items: center;
    background: color-mix(in srgb, var(--lumiverse-fill) 70%, transparent);
    backdrop-filter: blur(4px);
  }
  .ss-preview-loading[data-visible="true"] { display: grid; }
  .ss-spinner {
    width: 25px;
    height: 25px;
    border: 2px solid color-mix(in srgb, var(--lumiverse-accent, #7dd3fc) 24%, transparent);
    border-top-color: var(--lumiverse-accent, #7dd3fc);
    border-radius: 50%;
    animation: ss-spin .8s linear infinite;
  }
  @keyframes ss-spin { to { transform: rotate(360deg); } }
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
    .ss-stack-row { grid-template-columns: auto minmax(90px, 1fr) 68px auto; }
    .ss-stack-row .ss-trigger-toggle { grid-column: 2 / -1; }
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

function numberValue(input: HTMLInputElement, fallback: number): number {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function labelFromName(name: string): string {
  const leaf = name.split("/").pop() || name
  return leaf.replace(/\.(safetensors|ckpt|pt)$/i, "")
}

class StudioController {
  private readonly ctx: FrontendContext
  private readonly modal: any
  private readonly root: HTMLElement
  private readonly state: StudioState
  private previewObserver: IntersectionObserver | null = null
  private readonly previewCache = new Map<string, string>()
  private readonly requestedPreviews = new Set<string>()
  private connectionRequestId = ""
  private generating = false
  private currentJobId = ""
  private disposed = false

  constructor(ctx: FrontendContext, modal: any) {
    this.ctx = ctx
    this.modal = modal
    this.root = modal.root
    this.state = {
      connections: [],
      connection: null,
      models: [],
      loras: [],
      stack: [],
      outputs: [],
      activeChat: null,
      permissions: {},
      hasMetadataToken: false,
      currentImage: null,
    }
    this.build()
    this.bind()
    this.setRunStatus("Loading Lumiverse connections…")
    this.send("bootstrap")
  }

  dispose(): void {
    this.disposed = true
    this.previewObserver?.disconnect()
    this.previewObserver = null
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
              <div class="ss-preview-loading" data-role="preview-loading"><div class="ss-spinner" aria-label="Generating"></div></div>
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

  private bind(): void {
    this.get<HTMLSelectElement>('[data-role="connection"]').addEventListener("change", (event) => {
      const connectionId = (event.currentTarget as HTMLSelectElement).value
      if (connectionId) this.loadConnection(connectionId)
    })
    this.get<HTMLInputElement>('[data-role="lora-search"]').addEventListener("input", () => this.renderLoras())
    this.get<HTMLSelectElement>('[data-role="lora-sort"]').addEventListener("change", () => this.renderLoras())

    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const button = target.closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (action === "refresh-metadata") this.refreshMetadata()
      if (action === "toggle-token") this.toggleTokenPopover(button)
      if (action === "save-token") this.saveToken()
      if (action === "clear-token") this.clearToken()
      if (action === "swap-size") this.swapSize()
      if (action === "random-seed") this.get<HTMLInputElement>('[data-role="seed"]').value = "-1"
      if (action === "manual-lora") this.addManualLora()
      if (action === "clear-stack") {
        this.state.stack = []
        this.renderStack()
        this.renderLoras()
      }
      if (action === "generate") this.generate()
      if (action === "refresh-outputs") this.send("refresh_outputs")
      if (action === "download-output") this.downloadCurrent()
      if (action === "copy-output") void this.copyCurrentUrl()
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
        this.state.outputs = Array.isArray(data.outputs) ? data.outputs : []
        this.state.activeChat = data.activeChat || null
        this.state.permissions = data.permissions || {}
        this.renderPermissions()
        this.populateConnections()
        this.renderOutputs()
        break
      case "connection_result":
        if (payload.requestId !== this.connectionRequestId) return
        this.acceptConnectionData(data)
        this.setRunStatus(data.metadataError ? "Ready — LoRA metadata needs attention." : "Ready.")
        break
      case "metadata_result":
        this.state.loras = Array.isArray(data.loras) ? data.loras : []
        this.showMetadataError(data.metadataError || "")
        this.renderLoras()
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
        this.state.outputs = Array.isArray(data.outputs) ? data.outputs : []
        if (data.result?.imageDataUrl) {
          this.setCurrentImage({
            src: data.result.imageDataUrl,
            url: data.result.imageUrl || data.result.imageDataUrl,
            label: `${data.result.model || "SwarmUI"} · just generated`,
          })
        }
        this.renderOutputs()
        this.setRunStatus("Generation complete. Output saved to Lumiverse.")
        break
      case "outputs_result":
        this.state.outputs = Array.isArray(data) ? data : []
        this.renderOutputs()
        this.setRunStatus(`History refreshed: ${this.state.outputs.length} outputs.`)
        break
      case "studio_error":
        if (payload.operation === "generate") {
          this.generating = false
          this.currentJobId = ""
          this.setGenerating(false)
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
      const progress = totalSteps > 0
        ? `Rendering ${step} / ${totalSteps} · ${Math.round((step / totalSteps) * 100)}%`
        : "Rendering live preview…"
      this.setRunStatus(progress)
      return
    }

    if (type === "complete") {
      this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = "false"
      this.setRunStatus("Rendering complete; Lumiverse is finalizing the full-resolution image…")
      return
    }

    this.generating = false
    this.currentJobId = ""
    this.setGenerating(false)
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
    this.state.loras = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.setConnectionStatus("loading")
    this.setRunStatus(`Loading ${connection?.name || "SwarmUI"} models and LoRA metadata…`)
    this.get<HTMLButtonElement>('[data-action="generate"]').disabled = true
    this.renderLoras()
    this.connectionRequestId = this.send("load_connection", { connectionId })
  }

  private acceptConnectionData(data: any): void {
    this.state.connection = data.connection || this.state.connection
    this.state.models = Array.isArray(data.models) ? data.models : []
    this.state.loras = Array.isArray(data.loras) ? data.loras : []
    this.state.hasMetadataToken = Boolean(data.hasMetadataToken)
    this.populateModels()
    this.applyConnectionDefaults()
    this.showMetadataError(data.metadataError || "")
    this.renderLoras()
    this.updateTokenStatus()
    this.setConnectionStatus(data.metadataError ? "warning" : "ready")
    this.get<HTMLButtonElement>('[data-action="generate"]').disabled = !this.state.connection || !this.state.permissions.imageGen
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
      const input = this.get<HTMLInputElement>(`[data-role="${role}"]`)
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
  }

  private refreshMetadata(): void {
    if (!this.state.connection) return
    this.state.loras = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.renderLoras()
    this.setConnectionStatus("loading")
    this.setRunStatus("Refreshing SwarmUI LoRA metadata…")
    this.send("refresh_metadata", { connectionId: this.state.connection.id })
  }

  private toggleTokenPopover(button: HTMLElement): void {
    const popover = this.get<HTMLElement>('[data-role="token-popover"]')
    popover.hidden = !popover.hidden
    button.setAttribute("aria-expanded", String(!popover.hidden))
    if (!popover.hidden) this.get<HTMLInputElement>('[data-role="metadata-token"]').focus()
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
      ? "An encrypted metadata token is saved for this connection."
      : "No extension metadata token saved; metadata requests are anonymous."
  }

  private showMetadataError(message: string): void {
    const status = this.get<HTMLElement>('[data-role="metadata-error"]')
    status.hidden = !message
    status.textContent = message
  }

  private filteredLoras(): LoraMetadata[] {
    const query = this.get<HTMLInputElement>('[data-role="lora-search"]').value.trim().toLowerCase()
    const sort = this.get<HTMLSelectElement>('[data-role="lora-sort"]').value
    const items = this.state.loras.filter((lora) => {
      if (!query) return true
      return [
        lora.name,
        lora.title,
        lora.author,
        lora.description,
        lora.architecture,
        lora.className,
        lora.compatClass,
        lora.triggerPhrase,
        ...lora.tags,
      ].join(" ").toLowerCase().includes(query)
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

    if (!this.state.connection) {
      grid.appendChild(element("div", "ss-empty", "Choose a SwarmUI connection to load its LoRA library."))
      return
    }
    if (!items.length) {
      const text = this.state.loras.length
        ? "No LoRAs match this search."
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
      useTrigger: Boolean(lora.triggerPhrase),
    })
    this.renderStack()
    this.renderLoras()
  }

  private addManualLora(): void {
    const filename = window.prompt("Exact SwarmUI LoRA filename/path")
    if (!filename?.trim()) return
    const name = filename.trim()
    this.addLora({
      name,
      title: labelFromName(name),
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
    })
  }

  private renderStack(): void {
    const list = this.get<HTMLElement>('[data-role="stack-list"]')
    list.replaceChildren()
    if (!this.state.stack.length) {
      list.appendChild(element("div", "ss-empty", "Add LoRAs above. Their metadata default weight and trigger phrase are inherited automatically."))
    } else {
      this.state.stack.forEach((item, index) => list.appendChild(this.makeStackRow(item, index)))
    }
    const enabled = this.state.stack.filter((item) => item.enabled).length
    this.get<HTMLElement>('[data-role="stack-count"]').textContent = `${enabled} enabled · ${this.state.stack.length} stacked`
    this.get<HTMLButtonElement>('[data-action="clear-stack"]').disabled = this.state.stack.length === 0
    this.updateTriggerSummary()
  }

  private makeStackRow(item: StackItem, index: number): HTMLElement {
    const row = element("div", "ss-stack-row")
    row.dataset.disabled = String(!item.enabled)

    const enabled = element("input") as HTMLInputElement
    enabled.type = "checkbox"
    enabled.checked = item.enabled
    enabled.title = "Enable LoRA"
    enabled.addEventListener("change", () => {
      item.enabled = enabled.checked
      this.renderStack()
    })

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
    row.append(enabled, name, weight, trigger, actions)
    return row
  }

  private moveStack(index: number, direction: number): void {
    const target = index + direction
    if (target < 0 || target >= this.state.stack.length) return
    const [item] = this.state.stack.splice(index, 1)
    this.state.stack.splice(target, 0, item)
    this.renderStack()
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
    const presets = this.get<HTMLInputElement>('[data-role="presets"]').value
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
    if (presets.length) parsed.presets = presets
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
    const optional = (role: string): string => this.get<HTMLInputElement>(`[data-role="${role}"]`).value.trim()
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

    const clientJobId = crypto.randomUUID()
    this.generating = true
    this.currentJobId = clientJobId
    this.setGenerating(true)
    this.setRunStatus(`Generating with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`)
    this.send("generate", {
      input: {
        prompt,
        negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim() || undefined,
        connection_id: this.state.connection.id,
        model: this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model,
        clientJobId,
        parameters,
      },
    })
  }

  private setGenerating(value: boolean): void {
    const button = this.get<HTMLButtonElement>('[data-action="generate"]')
    button.disabled = value || !this.state.connection || !this.state.permissions.imageGen
    button.textContent = value ? "Generating…" : "Generate image"
    this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = String(value)
  }

  private showLivePreview(src: string, step: number, totalSteps: number): void {
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.src = src
    preview.hidden = false
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = "false"
    this.get<HTMLElement>('[data-role="output-label"]').textContent = totalSteps > 0
      ? `Live SwarmUI preview · ${step} / ${totalSteps}`
      : "Live SwarmUI preview"
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
  }

  private renderOutputs(): void {
    const grid = this.get<HTMLElement>('[data-role="history-grid"]')
    grid.replaceChildren()
    this.get<HTMLElement>('[data-role="output-count"]').textContent = String(this.state.outputs.length)
    if (!this.state.outputs.length) {
      grid.appendChild(element("div", "ss-empty", "Outputs created in this chat will appear here."))
      return
    }
    for (const output of this.state.outputs) {
      const button = element("button", "ss-history-item")
      button.title = output.original_filename || "Generated image"
      const image = element("img")
      image.src = output.url
      image.alt = output.original_filename || "Generated image"
      button.appendChild(image)
      button.addEventListener("click", () => {
        const fullUrl = typeof output.url === "string" ? output.url.replace(/\?.*$/, "") : output.url
        this.setCurrentImage({
          src: output.url,
          url: fullUrl || output.url,
          label: output.original_filename || `Output ${output.id}`,
        })
      })
      grid.appendChild(button)
    }
  }

  private setCurrentImage(image: { src: string; url?: string; label: string }): void {
    this.state.currentImage = image
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.src = image.src
    preview.hidden = false
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.get<HTMLElement>('[data-role="output-label"]').textContent = image.label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = false
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = !image.url
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

  private swapSize(): void {
    const width = this.get<HTMLInputElement>('[data-role="width"]')
    const height = this.get<HTMLInputElement>('[data-role="height"]')
    const oldWidth = width.value
    width.value = height.value
    height.value = oldWidth
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
    const status = this.get<HTMLElement>('[data-role="run-status"]')
    status.textContent = message
    status.style.color = error ? "#ef7777" : ""
  }
}

let activeStudio: StudioController | null = null
let activeModal: any | null = null

export function setup(ctx: FrontendContext): () => void {
  const removeStyle = ctx.dom.addStyle(STYLES)

  const openStudio = () => {
    if (activeModal) return
    const modal = ctx.ui.showModal({
      title: "Swarm Studio",
      width: 1120,
      maxHeight: 880,
      persistent: false,
    })
    activeModal = modal
    activeStudio = new StudioController(ctx, modal)
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
  const launcher = element("div", "ss-launcher")
  const mark = element("div", "ss-launcher-mark")
  mark.innerHTML = STUDIO_ICON
  launcher.appendChild(mark)
  launcher.appendChild(element("h3", "", "Swarm Studio"))
  launcher.appendChild(element("p", "", "Build a complete SwarmUI request with metadata-aware LoRA previews, inherited triggers, weighted stacking, advanced parameters, and saved outputs."))
  const launchButton = element("button", "ss-button ss-button-primary", "Open prompting studio")
  launchButton.addEventListener("click", openStudio)
  launcher.appendChild(launchButton)
  drawer.root.appendChild(launcher)

  const inputAction = ctx.ui.registerInputBarAction({
    id: "open-swarm-studio",
    label: "Open Swarm Studio",
    iconSvg: STUDIO_ICON,
    enabled: true,
  })
  const removeActionClick = inputAction.onClick(openStudio)
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
    removeStyle()
  }
}
