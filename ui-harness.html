type FrontendContext = any
type StudioTheme = "lumiverse" | "custom"
type AppearanceColorKey = "accent" | "canvas" | "panel" | "header" | "outline" | "button" | "text"

interface StudioAppearance {
  colors: Partial<Record<AppearanceColorKey, string>>
  radius: number | null
  opacity: number
  blur: number
  customCss: string
}

interface StudioBehavior {
  completionToast: boolean
  widgetEnabled: boolean
  mobileQuickCreate: boolean
  tagAutoGenerate: boolean
  tagPromptInjection: boolean
  requiredImageMin: number
  requiredImageMax: number
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
  sourceUrl: string
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
  sourceUrl?: string
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
  workflow?: string
  timing?: {
    totalMs: number
    prep: string
    generation: string
    source: "swarm" | "measured"
  }
  swarmPath?: string
  swarmPathVerified?: boolean
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

interface SwarmWorkflowSummary {
  name: string
  image: string
  description: string
  enableInSimple: boolean
}

interface SwarmWorkflowGroup {
  id: string
  name: string
  description: string
  open: boolean
  advanced: boolean
  canShrink: boolean
  toggles: boolean
}

interface SwarmWorkflowParameter {
  id: string
  name: string
  type: string
  description: string
  default: unknown
  values: unknown[]
  viewType: string
  min: number | null
  max: number | null
  step: number | null
  visible: boolean
  toggleable: boolean
  advanced: boolean
  imageAlwaysBase64: boolean
  group: SwarmWorkflowGroup | null
}

interface SwarmWorkflowDetails extends SwarmWorkflowSummary {
  parameters: SwarmWorkflowParameter[]
}

interface SelectedPreset {
  title: string
  enabled: boolean
}

interface OutputFolder {
  id: string
  name: string
  imageIds: string[]
  binding: {
    type: "character"
    characterId: string
    positivePrompt: string
    negativePrompt: string
    checkpoint: string
    stackPresetId: string
    stackSnapshot: StackPresetItem[]
    enabled: boolean
  } | null
  updatedAt: number
}

interface PersonaVisualPreset {
  id: string
  name: string
  positivePrompt: string
  sourcePresetId: string
  updatedAt: number
}

interface LumiversePersonaPromptPreset {
  id: string
  name: string
  prompt: string
  negativePrompt: string
}

interface ChatVisualsState {
  activeChat: {
    id: string
    name: string
    characterId: string
    characterName: string
  } | null
  activePersona: {
    id: string
    name: string
    description: string
  } | null
  personaPresets: PersonaVisualPreset[]
  personaBinding: {
    presetId: string
    enabled: boolean
  }
  activePersonaPreset: PersonaVisualPreset | null
  characterFolder: OutputFolder | null
  characterBasePrompt: string
  models: Array<{ id: string; label: string }>
  studioConnectionId: string
  studioModel: string
  stackPresets: StackPreset[]
  studioStack: StackPresetItem[]
  studioStackPresetId: string
  studioStackCustom: boolean
}

interface InitImage {
  data: string
  mimeType: string
  src: string
  label: string
  imageId: string
}

interface WorkflowDraft {
  name: string
  values: Record<string, unknown>
  enabled: string[]
  images: Record<string, string>
}

interface StudioDraft {
  connectionId: string
  details: GenerationDetails
  stack: StackPresetItem[]
  selectedPresets: SelectedPreset[]
  workflow: WorkflowDraft | null
  initImage: InitImage | null
}

interface CharacterBaseTagState {
  characterId: string
  characterName: string
  tags: string
  source: "studio" | "lumiverse" | "none"
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
  swarmWorkflows: SwarmWorkflowSummary[]
  workflowError: string
  selectedWorkflow: SwarmWorkflowDetails | null
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
  characterBaseTags: CharacterBaseTagState
  chatVisuals: ChatVisualsState | null
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
  <svg class="ss-library-symbol" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/><path d="m7 17 3-3 2 2 2.5-3 2.5 4"/></svg>
`

const INIT_IMAGE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m6.5 16 3.5-4 2.7 3 2.3-2.5 2.5 3.5"/><circle cx="16.5" cy="8.5" r="1.5"/><path d="M12 2v5m-2-2 2 2 2-2"/></svg>
`

const APPEND_CHAT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M8 10h8m-4-4v8"/></svg>
`

const EXPORT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 17v3h16v-3"/></svg>
`

const IMPORT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 17v3h16v-3"/></svg>
`

const DOWNLOAD_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4"/><path d="M4 18h16"/></svg>
`

const SETTINGS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.82 2.82-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.96 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.82-2.82.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3v-4h.04A1.7 1.7 0 0 0 4.6 8.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.82-2.82.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3V3h4v.08a1.7 1.7 0 0 0 1.04 1.48 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.82 2.82-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.96 10H21v4h-.04A1.7 1.7 0 0 0 19.4 15Z"/></svg>
`

const SEARCH_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
`

const CHECK_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
`

const NEW_FOLDER_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v10h-17z"/><path d="M12 11v5M9.5 13.5h5"/></svg>
`

const TRASH_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 3h6l1 4H8zM7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>
`

const CHAT_VISUALS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v11H8l-3 2.5z"/><path d="M9 9h6m-6 3h4"/><path d="M18.5 2.5c.25 1.55.95 2.25 2.5 2.5-1.55.25-2.25.95-2.5 2.5-.25-1.55-.95-2.25-2.5-2.5 1.55-.25 2.25-.95 2.5-2.5Z"/></svg>
`

const PLUS_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
`

const BACK_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>
`

const EXPAND_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>
  </svg>
`

const MINIMIZE_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 8h5V3M21 8h-5V3M21 16h-5v5M3 16h5v5"/>
  </svg>
`

const FRAME_WALL_ICON = `
  <svg viewBox="0 0 457.667 457.667" fill="currentColor" aria-hidden="true">
    <path d="M116.352 141.241h108.759v-38.686H116.352v38.686Zm7-31.686h94.759v24.686h-94.759v-24.686ZM348.908 102.555v38.686h108.759v-38.686H348.908Zm101.759 31.686h-94.759v-24.686h94.759v24.686ZM348.908 277.929h108.759V149.746H348.908v128.183Zm7-121.183h94.759V270.93h-94.759V156.746ZM116.352 355.111h108.759v-38.686H116.352v38.686Zm7-31.685h94.759v24.686h-94.759v-24.686ZM232.704 355.111h224.962v-70.11H232.704v70.11Zm7-63.11h210.962v56.11H239.704v-56.11ZM0 186.087h108.759v-83.531H0v83.531Zm7-76.532h94.759v69.531H7v-69.531ZM341.463 102.555H232.704v83.531h108.759v-83.531Zm-7 76.532h-94.759v-69.531h94.759v69.531ZM341.463 194.398H232.704v83.531h108.759v-83.531Zm-7 76.531h-94.759v-69.531h94.759v69.531ZM0 355.111h108.759V194.398H0v160.713Zm7-153.713h94.759v146.713H7V201.398ZM116.352 309.189h108.759V148.476H116.352v160.713Zm7-153.713h94.759v146.713h-94.759V155.476Z"/>
  </svg>
`

const SPARKLE_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.7 5.2 2.8 8.3 8 9-5.2.7-7.3 3.8-8 9-.7-5.2-2.8-8.3-8-9 5.2-.7 7.3-3.8 8-9Z"/><path d="M19 2.5c.2 1.7.8 2.7 2.5 3-1.7.3-2.3 1.3-2.5 3-.2-1.7-.8-2.7-2.5-3 1.7-.3 2.3-1.3 2.5-3Z"/></svg>
`

const SWARM_IMAGE_PROTOCOL_EXAMPLE = `{{swarm_image_protocol}}

Example output:
<swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="Two people sharing food at a city stall"
>
character 1: smiling, holding a paper tray
character 2: amused expression, leaning closer
interaction: character 1 offers character 2 a bite, standing side by side
medium shot, city street, food stall, evening lights</swarm-image>`

const THEME_STORAGE_KEY = "swarm-studio-theme-v1"
const APPEARANCE_STORAGE_KEY = "swarm-studio-appearance-v1"
const MINIPLAYER_STORAGE_KEY = "swarm-studio-miniplayer-v1"
const MINIPLAYER_POSITION_STORAGE_KEY = "swarm-studio-miniplayer-position-v1"
const BEHAVIOR_STORAGE_KEY = "swarm-studio-behavior-v3"
const WORKSPACE_STORAGE_KEY = "swarm-studio-workspace-v1"
const WORKFLOW_CORE_PARAMETERS = new Set([
  "prompt",
  "negativeprompt",
  "model",
  "width",
  "height",
  "steps",
  "cfgscale",
  "seed",
  "sampler",
  "scheduler",
  "loras",
  "loraweights",
  "initimage",
  "initimagecreativity",
  "vae",
  "cliplmodel",
  "clipgmodel",
  "txxlmodel",
  "images",
  "aspectratio",
  "sidelength",
])
const STUDIO_THEMES: Array<{ id: StudioTheme; label: string; color: string }> = [
  { id: "lumiverse", label: "Lumiverse", color: "var(--lumiverse-primary, #7dd3fc)" },
  { id: "custom", label: "Custom", color: "var(--lumiverse-accent, #7dd3fc)" },
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
  .ss-chat-visuals-row > :is(.ss-select, .ss-input) { min-width: 0; flex: 1; }
  .ss-chat-visuals-row .ss-icon-button { flex: 0 0 auto; }
  .ss-chat-visuals-actions {
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .ss-chat-visuals-status {
    min-height: 18px;
    color: var(--lumiverse-text-muted);
    font-size: 9px;
  }
  .ss-chat-visuals-status[data-error="true"] { color: #fb7185; }
  .ss-chat-visuals-footer {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--ss-outline);
  }
  .ss-chat-visuals-footer .ss-button { flex: 1; }
  @media (max-width: 720px) {
    .ss-chat-visuals-grid { grid-template-columns: 1fr; }
    .ss-chat-visuals-row { align-items: stretch; }
    .ss-chat-visuals-actions { justify-content: stretch; }
    .ss-chat-visuals-actions .ss-button { flex: 1; }
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
  .ss-config-toggle { display: flex; align-items: center; gap: 7px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-config-toggle input { accent-color: var(--lumiverse-accent, #7dd3fc); }
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
    grid-template-columns: minmax(180px, 1fr) auto 135px 100px;
  }
  .ss-lora-query { min-width: 0; }
  .ss-lora-query > .ss-input { width: 100%; }
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
    z-index: 2147483008;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 52px 50px minmax(0, 1fr);
    background: color-mix(in srgb, var(--ss-canvas-bg, var(--lumiverse-bg, #050608)) 98%, transparent);
    backdrop-filter: blur(12px);
  }
  .ss-output-library[hidden] { display: none; }
  .ss-library-head {
    grid-column: 1;
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
    grid-row: 2;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    overflow: hidden;
    padding: 7px 9px;
    border-top: 1px solid var(--lumiverse-border);
    background: color-mix(in srgb, var(--ss-header-bg, var(--lumiverse-fill-subtle)) 94%, transparent);
    box-shadow: 0 -10px 28px rgba(0,0,0,.18);
  }
  .ss-library-folder-anchor { flex: 0 0 auto; }
  .ss-library-folder-anchor svg,
  .ss-library-tool-icon svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
  .ss-library-folder-scroll { min-width: 0; flex: 1; display: flex; align-items: center; gap: 5px; overflow-x: auto; scrollbar-width: thin; }
  .ss-library-selection-actions { flex: 0 0 auto; display: flex; align-items: center; gap: 5px; padding-left: 7px; border-left: 1px solid var(--lumiverse-border); }
  .ss-library-selection-actions[hidden] { display: none; }
  .ss-library-folder {
    width: auto;
    min-width: max-content;
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
    margin: 0;
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
  .ss-library-folder-delete { color: #ef7777; }
  .ss-library-folder-delete:hover:not(:disabled) {
    border-color: color-mix(in srgb, #ef7777 65%, var(--lumiverse-border));
    background: color-mix(in srgb, #ef7777 13%, transparent);
  }
  .ss-library-main {
    grid-row: 3;
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
  .ss-library-currentbar { flex: 0 0 auto; border-top: 1px solid var(--lumiverse-border); border-bottom: 0; background: color-mix(in srgb, var(--ss-header-bg) 90%, transparent); }
  .ss-library-toolbar .ss-muted { flex: 0 0 auto; }
  .ss-library-search {
    min-width: 150px;
    max-width: 360px;
    flex: 1 1 260px;
    margin-left: auto;
  }
  .ss-library-search[hidden] { display: none; }
  .ss-library-search .ss-input { width: 100%; height: 30px; padding-block: 4px; font-size: 9.5px; }
  .ss-library-selection-count { min-width: 72px; color: var(--lumiverse-text-muted); font-size: 9px; }
  .ss-library-selectbar { flex: 0 0 38px; min-height: 38px; display: flex; align-items: center; gap: 7px; padding: 5px 10px; border-bottom: 1px solid var(--lumiverse-border); background: color-mix(in srgb, var(--lumiverse-fill-subtle) 72%, transparent); }
  .ss-library-select-page { min-height: 28px; padding: 4px 9px; font-size: 9px; }
  .ss-library-select-page[hidden] { display: none; }
  .ss-library-selectbar .ss-library-selection-actions { margin-left: auto; border-left: 0; padding-left: 0; }
  .ss-library-visual-profile {
    flex: 0 0 auto;
    margin: 7px 10px 0;
    border: 1px solid color-mix(in srgb, var(--lumiverse-accent) 28%, var(--lumiverse-border));
    border-radius: var(--ss-control-radius, 8px);
    background: color-mix(in srgb, var(--lumiverse-accent) 5%, var(--lumiverse-fill));
  }
  .ss-library-visual-profile[hidden] { display: none; }
  .ss-library-visual-profile summary { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 10px; cursor: pointer; list-style: none; }
  .ss-library-visual-profile summary::-webkit-details-marker { display: none; }
  .ss-library-visual-profile summary > span:first-child { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
  .ss-library-visual-profile summary small { color: var(--lumiverse-text-muted); font-size: 8px; }
  .ss-library-visual-summary-meta { display: inline-flex; align-items: center; gap: 8px; color: var(--lumiverse-accent); font-size: 8px; }
  .ss-library-visual-caret { display: inline-block; color: var(--lumiverse-text); font-size: 13px; line-height: 1; transition: transform .16s ease; }
  .ss-library-visual-profile[open] .ss-library-visual-caret { transform: rotate(180deg); }
  .ss-library-visual-fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(130px, .55fr) minmax(130px, .55fr) auto; gap: 7px; align-items: end; padding: 0 10px 10px; }
  .ss-library-visual-fields .ss-textarea { min-height: 58px; max-height: 110px; resize: vertical; }
  .ss-library-visual-fields .ss-button { min-height: 32px; }
  .ss-new-folder-card { width: min(520px, calc(100vw - 28px)); }
  .ss-new-folder-types { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .ss-new-folder-types label { display: flex; align-items: flex-start; gap: 8px; padding: 9px; border: 1px solid var(--lumiverse-border); border-radius: var(--ss-control-radius); background: var(--lumiverse-fill); cursor: pointer; }
  .ss-new-folder-types input { margin-top: 2px; accent-color: var(--lumiverse-accent); }
  .ss-new-folder-types span { display: grid; gap: 2px; }
  .ss-new-folder-types small { color: var(--lumiverse-text-muted); font-size: 8.5px; line-height: 1.35; }
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
      grid-template-rows: 50px 52px minmax(0, 1fr);
    }
    .ss-library-head { grid-column: 1; }
    .ss-library-folders { padding-inline: 2.2vw; }
    .ss-library-toolbar { flex-wrap: wrap; }
    .ss-library-search { order: 5; min-width: 100%; max-width: none; flex-basis: 100%; margin-left: 0; }
    .ss-library-selection-actions .ss-button { padding-inline: 8px; }
    .ss-library-visual-fields { grid-template-columns: 1fr; }
    .ss-library-visual-profile summary > span:first-child { display: grid; gap: 2px; }
    .ss-output-library-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: max-content;
      gap: 2.2vw;
      padding: 2.2vw;
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

function createOverlayMiniplayerWidget(): any | null {
  if (!document.documentElement) return null
  const surface = element("div", "ss-miniplayer-app-surface")
  // Own this surface directly. mountApp creates a separate 48px host widget;
  // portalling the visible player out of that host left an invisible draggable
  // square behind. Lumiverse's mobile body is 0px tall with overflow: clip, so
  // the viewport-sized document element is the only unclipped neutral parent.
  document.documentElement.appendChild(surface)
  let width = 318
  let height = 94
  let x = Math.max(8, window.innerWidth - width - 18)
  let y = Math.max(8, window.innerHeight - height - 92)
  try {
    const saved = JSON.parse(window.localStorage.getItem(MINIPLAYER_POSITION_STORAGE_KEY) || "{}")
    if (Number.isFinite(saved?.x)) x = Number(saved.x)
    if (Number.isFinite(saved?.y)) y = Number(saved.y)
  } catch {
    // Start near the lower-right corner when storage is unavailable.
  }
  const place = (persist = false) => {
    x = clamp(x, 8, Math.max(8, window.innerWidth - width - 8))
    y = clamp(y, 8, Math.max(8, window.innerHeight - height - 8))
    surface.style.left = `${Math.round(x)}px`
    surface.style.top = `${Math.round(y)}px`
    if (persist) {
      try {
        window.localStorage.setItem(MINIPLAYER_POSITION_STORAGE_KEY, JSON.stringify({ x, y }))
      } catch {
        // Position persistence is a convenience, not a runtime requirement.
      }
    }
  }
  const onResize = () => place()
  window.addEventListener("resize", onResize)
  surface.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (!target.closest(".ss-mini-preview, .ss-mini-title")) return
    const startX = event.clientX
    const startY = event.clientY
    const originX = x
    const originY = y
    let moved = false
    const move = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      if (!moved && Math.hypot(dx, dy) < 5) return
      moved = true
      moveEvent.preventDefault()
      x = originX + dx
      y = originY + dy
      place()
    }
    const stop = () => {
      document.removeEventListener("pointermove", move, true)
      document.removeEventListener("pointerup", stop, true)
      document.removeEventListener("pointercancel", stop, true)
      if (moved) {
        place(true)
        surface.addEventListener("click", (clickEvent) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
        }, { capture: true, once: true })
      }
    }
    document.addEventListener("pointermove", move, true)
    document.addEventListener("pointerup", stop, true)
    document.addEventListener("pointercancel", stop, true)
  })
  place()
  return {
    root: surface,
    setSize(nextWidth: number, nextHeight: number) {
      width = Math.max(40, Math.round(nextWidth))
      height = Math.max(40, Math.round(nextHeight))
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      place()
    },
    setVisible(visible: boolean) {
      surface.hidden = !visible
    },
    isVisible() {
      return !surface.hidden
    },
    destroy() {
      window.removeEventListener("resize", onResize)
      surface.remove()
    },
  }
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

function defaultStudioBehavior(): StudioBehavior {
  return {
    completionToast: false,
    widgetEnabled: true,
    mobileQuickCreate: false,
    tagAutoGenerate: false,
    tagPromptInjection: false,
    requiredImageMin: 0,
    requiredImageMax: 0,
  }
}

export function normalizeRequiredImageRange(
  minValue: unknown,
  maxValue: unknown,
): { min: number; max: number } {
  let min = Math.max(0, Math.min(6, Math.trunc(Number(minValue) || 0)))
  let max = Math.max(0, Math.min(6, Math.trunc(Number(maxValue) || 0)))
  if (min === 0 && max > 0) min = 1
  if (min > 0 && max === 0) max = min
  if (max > 0 && max < min) [min, max] = [max, min]
  return { min, max }
}

function storedStudioBehavior(): StudioBehavior {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BEHAVIOR_STORAGE_KEY) || "{}")
    const imageRange = normalizeRequiredImageRange(parsed?.requiredImageMin, parsed?.requiredImageMax)
    return {
      completionToast: parsed?.completionToast === true,
      widgetEnabled: parsed?.widgetEnabled !== false,
      mobileQuickCreate: parsed?.mobileQuickCreate === true,
      tagAutoGenerate: parsed?.tagAutoGenerate === true,
      tagPromptInjection: parsed?.tagPromptInjection === true,
      requiredImageMin: imageRange.min,
      requiredImageMax: imageRange.max,
    }
  } catch {
    return defaultStudioBehavior()
  }
}

function persistStudioBehavior(behavior: StudioBehavior): void {
  try {
    window.localStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(behavior))
  } catch {
    // The active session can still use the selected behavior.
  }
}

function studioAppearanceIsCustom(appearance: StudioAppearance): boolean {
  return Object.keys(appearance.colors).length > 0
    || appearance.radius !== null
    || Math.round(appearance.opacity) !== 96
    || Math.round(appearance.blur) !== 12
    || Boolean(appearance.customCss.trim())
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

function safeHttpUrl(value: unknown): string {
  const candidate = String(value || "").trim()
  if (!candidate) return ""
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : ""
  } catch {
    return ""
  }
}

function downloadJson(value: unknown, filename: string): void {
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename.replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "") || "swarm-studio.json"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
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

export function isWorkflowCoreParameter(id: string): boolean {
  return WORKFLOW_CORE_PARAMETERS.has(String(id || "").toLowerCase().replace(/[^a-z0-9]+/g, ""))
}

export function outputLibraryPageSize(viewportWidth: number): number {
  return viewportWidth <= 720 ? 15 : 30
}

export function quickGenerationParameters(defaults: Record<string, unknown> = {}): Record<string, unknown> {
  const numberDefault = (key: string, fallback: number): number => {
    const value = Number(defaults[key])
    return Number.isFinite(value) ? value : fallback
  }
  return {
    width: clamp(numberDefault("width", 1024), 64, 4096),
    height: clamp(numberDefault("height", 1024), 64, 4096),
    steps: clamp(numberDefault("steps", 20), 1, 150),
    cfgScale: clamp(numberDefault("cfgScale", numberDefault("cfg_scale", 7)), 1, 30),
    seed: -1,
    sampler: String(defaults.sampler || "") || undefined,
    scheduler: String(defaults.scheduler || "") || undefined,
    loras: [],
    loraWeights: [],
  }
}

export function inheritQuickGenerationParameters(
  defaults: Record<string, unknown> = {},
  studioParameters?: Record<string, unknown> | null,
): Record<string, unknown> {
  return studioParameters ? { ...studioParameters } : quickGenerationParameters(defaults)
}

const ASPECT_PRESETS: Record<string, { label: string; width: number; height: number }> = {
  "1:1": { label: "Square · 1:1", width: 1024, height: 1024 },
  "2:3": { label: "Portrait · 2:3", width: 832, height: 1216 },
  "3:2": { label: "Landscape · 3:2", width: 1216, height: 832 },
  "3:4": { label: "Portrait · 3:4", width: 896, height: 1152 },
  "4:3": { label: "Landscape · 4:3", width: 1152, height: 896 },
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

function presetListValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  const text = String(value || "").trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean)
  } catch {
    // Older Swarm presets commonly use comma-separated lists.
  }
  return text.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean)
}

export function lorasFromSwarmPreset(paramMap: Record<string, string>): Array<{ name: string; weight: number }> {
  const normalized = new Map(
    Object.entries(paramMap || {}).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]),
  )
  const names = presetListValue(normalized.get("loras"))
  const weights = presetListValue(normalized.get("loraweights")).map(Number)
  return names.slice(0, 64).map((name, index) => ({
    name,
    weight: Number.isFinite(weights[index]) ? clamp(weights[index], -10, 10) : 1,
  }))
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

function manualLora(name: string, title = "", sourceUrl = ""): LoraMetadata {
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
    sourceUrl: safeHttpUrl(sourceUrl),
  }
}

interface StudioActivitySnapshot {
  active: boolean
  jobId: string
  connectionId: string
  preview: string
  latestImage: CurrentImage | null
  draft: StudioDraft | null
  step: number
  totalSteps: number
  status: string
}

class MiniPlayerController {
  private readonly ctx: FrontendContext
  private readonly widget: any
  private readonly root: HTMLElement
  private readonly openStudio: () => void
  private readonly openLibrary: () => void
  private readonly getStudioDraft: () => StudioDraft | null
  private readonly onBehaviorChange: (behavior: StudioBehavior) => void
  private behavior: StudioBehavior
  private studioOpen = false
  private collapsed = false
  private expanded = true
  private expectedWidth = 318
  private expectedHeight = 94
  private sizeObserver: ResizeObserver | null = null
  private observedSizeTarget: HTMLElement | null = null
  private contextMenu: HTMLElement | null = null
  private longPressTimer: number | null = null
  private suppressNextClick = false
  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    const menu = this.contextMenu
    if (menu && !menu.hidden && !menu.contains(event.target as Node)) this.closeContextMenu()
  }
  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.closeContextMenu()
  }
  private readonly onWindowResize = () => {
    // Responsive transitions can cross the mobile breakpoint after startup
    // (rotation, split-screen, browser chrome, desktop emulation). Keep the
    // controller state and its host box in lockstep with the visual orb.
    if (this.isMobileViewport() && !this.behavior.mobileQuickCreate && !this.collapsed) {
      this.setCollapsed(true)
      return
    }
    this.resizeWidget()
    this.render()
  }
  private quickConnection: any | null = null
  private quickConnections: any[] = []
  private quickCanAppend = false
  private quickPending: GenerationDetails | null = null
  private quickConfirm: ((prompt: string, negativePrompt: string) => void) | null = null
  private readonly bootstrapRequestId = crypto.randomUUID()
  private state: "idle" | "running" | "done" | "error" = "idle"
  private snapshotValue: StudioActivitySnapshot = {
    active: false,
    jobId: "",
    connectionId: "",
    preview: "",
    latestImage: null,
    draft: null,
    step: 0,
    totalSteps: 0,
    status: "Ready when inspiration hits.",
  }

  constructor(
    ctx: FrontendContext,
    widget: any,
    openStudio: () => void,
    openLibrary: () => void,
    getStudioDraft: () => StudioDraft | null,
    behavior: StudioBehavior,
    onBehaviorChange: (behavior: StudioBehavior) => void,
  ) {
    this.ctx = ctx
    this.widget = widget
    this.root = widget.root
    this.root.style.width = "100%"
    this.root.style.height = "100%"
    this.openStudio = openStudio
    this.openLibrary = openLibrary
    this.getStudioDraft = getStudioDraft
    this.onBehaviorChange = onBehaviorChange
    this.behavior = { ...behavior }
    try {
      const stored = JSON.parse(window.localStorage.getItem(MINIPLAYER_STORAGE_KEY) || "{}")
      this.collapsed = this.isMobileViewport()
        ? true
        : stored.collapsed === true
      this.expanded = !this.collapsed
    } catch {
      this.collapsed = this.isMobileViewport()
      this.expanded = !this.collapsed
    }
    this.root.innerHTML = `
      <div class="ss-miniplayer" data-role="miniplayer" data-state="idle" data-collapsed="false" data-expanded="true" data-indeterminate="false">
        <div class="ss-mini-preview" data-action="mini-open" role="button" tabindex="0" title="Open Swarm Studio" aria-label="Open Swarm Studio">
          <span data-role="mini-placeholder">${FRAME_WALL_ICON}</span>
          <img data-role="mini-image" alt="Latest Swarm Studio preview" hidden />
          <span class="ss-mini-live-dot" aria-hidden="true"></span>
        </div>
        <div class="ss-mini-copy">
          <div class="ss-mini-title"><span>Swarm Studio</span><span class="ss-mini-state" data-role="mini-state">Ready</span></div>
          <div class="ss-mini-status" data-role="mini-status">Ready when inspiration hits.</div>
          <div class="ss-mini-track"><span class="ss-mini-fill"></span></div>
        </div>
        <div class="ss-mini-actions">
          <button class="ss-mini-button" data-action="mini-append" title="Append latest output to chat" aria-label="Append latest output to chat" disabled>${APPEND_CHAT_ICON}</button>
          <button class="ss-mini-button" data-action="mini-open" title="Open Swarm Studio" aria-label="Open Swarm Studio">↗</button>
          <button class="ss-mini-button" data-action="mini-library" title="Open output library" aria-label="Open output library">${LIBRARY_ICON}</button>
          <button class="ss-mini-button" data-action="mini-collapse" title="Minimize to image" aria-label="Minimize to image">−</button>
        </div>
        <div class="ss-mini-quick" data-role="mini-quick">
          <div class="ss-mini-quick-head">
            <strong>Quick create</strong>
            <div class="ss-mini-editor-actions" aria-label="Expanded prompt editors">
              <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="positive" title="Open positive prompt in Lumiverse editor" aria-label="Expand positive prompt"><span class="ss-mini-editor-key">P</span>${EXPAND_ICON}</button>
              <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="negative" title="Open negative prompt in Lumiverse editor" aria-label="Expand negative prompt"><span class="ss-mini-editor-key">N</span>${EXPAND_ICON}</button>
            </div>
          </div>
          <textarea class="ss-mini-prompt" data-role="mini-prompt" placeholder="Describe a quick image…" aria-label="Quick image prompt"></textarea>
          <input class="ss-mini-negative" data-role="mini-negative" placeholder="Negative prompt (optional)" aria-label="Quick negative prompt" />
          <div class="ss-mini-quick-actions">
            <span class="ss-mini-connection" data-role="mini-connection">Finding Lumiverse’s SwarmUI connection…</span>
            <button class="ss-mini-generate" data-action="mini-generate" disabled>Generate quick image</button>
          </div>
        </div>
      </div>
      <div class="ss-mini-context-menu" data-role="mini-context-menu" role="menu" hidden>
        <button class="ss-mini-context-action" data-action="mini-menu-toggle" role="menuitem"><span data-role="mini-menu-size-icon">${EXPAND_ICON}</span><span data-role="mini-menu-size-label">Expand Quick Create</span></button>
        <button class="ss-mini-context-action" data-action="mini-menu-studio" role="menuitem">${FRAME_WALL_ICON}<span>Open Swarm Studio</span></button>
        <button class="ss-mini-context-action" data-action="mini-menu-library" role="menuitem">${LIBRARY_ICON}<span>Open Library</span></button>
        <span class="ss-mini-context-separator" aria-hidden="true"></span>
        <button class="ss-mini-context-action" data-action="mini-menu-hide" role="menuitem"><span aria-hidden="true">×</span><span>Hide widget</span></button>
      </div>
    `
    this.contextMenu = this.root.querySelector<HTMLElement>('[data-role="mini-context-menu"]')
    if (this.contextMenu) {
      // Lumi's native float wrapper is intentionally only as large as the
      // widget chrome. Portal the menu so a minimized 1:1 host cannot clip or
      // swallow its actions.
      this.contextMenu.remove()
      this.root.ownerDocument.documentElement.appendChild(this.contextMenu)
    }
    const handleAction = (event: Event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (this.suppressNextClick && action === "mini-open") {
        this.suppressNextClick = false
        event.preventDefault()
        event.stopPropagation()
        return
      }
      this.suppressNextClick = false
      if (action === "mini-open") this.activateWidget()
      if (action === "mini-append") this.appendLatestToChat()
      if (action === "mini-library" || action === "mini-menu-library") this.openLibrary()
      if (action === "mini-collapse") this.setCollapsed(true)
      if (action === "mini-menu-toggle") this.setCollapsed(!this.collapsed)
      if (action === "mini-menu-studio") this.openStudio()
      if (action === "mini-menu-hide") this.onBehaviorChange({ ...this.behavior, widgetEnabled: false })
      if (action === "mini-generate") {
        if (this.snapshotValue.active) this.interrupt()
        else if (this.quickConfirm) this.confirmTaggedPromptEdit()
        else this.quickGenerate()
      }
      if (action === "mini-edit-prompt") this.openPromptEditor(button.dataset.promptRole || "")
      if (action?.startsWith("mini-menu-")) this.closeContextMenu()
    }
    this.root.addEventListener("click", handleAction)
    this.contextMenu?.addEventListener("click", handleAction)
    this.root.addEventListener("keydown", (event) => {
      if (!this.collapsed || (event.key !== "Enter" && event.key !== " ")) return
      if (!(event.target as HTMLElement).closest('[data-action="mini-open"]')) return
      event.preventDefault()
      this.activateWidget()
    })
    this.root.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement
      if (!this.collapsed && target.closest("button, input, textarea, select, a, [data-action]")) {
        // Lumi's float widget makes its entire chrome draggable. Stop the
        // bubbled pointerdown for expanded controls. The collapsed preview is
        // deliberately allowed through so the only visible surface can drag.
        event.stopPropagation()
      }
      if (event.button === 0 && target.closest('[data-action="mini-open"]')) {
        this.scheduleLongPress(event)
      }
    })
    this.root.addEventListener("contextmenu", (event) => {
      if ((event.target as HTMLElement).closest("input, textarea, select")) return
      event.preventDefault()
      event.stopPropagation()
      this.showContextMenu(event.clientX, event.clientY)
    })
    document.addEventListener("pointerdown", this.onDocumentPointerDown)
    document.addEventListener("keydown", this.onDocumentKeyDown)
    window.addEventListener("resize", this.onWindowResize)
    if (typeof ResizeObserver === "function") {
      this.sizeObserver = new ResizeObserver(() => {
        if (this.studioOpen || !this.behavior.widgetEnabled) return
        const targets = this.widgetSizeTargets()
        this.observeSizeTarget(targets[targets.length - 1] || this.root)
        const mismatched = targets.some((target) => {
          const { width, height } = target.getBoundingClientRect()
          return width > 0 && height > 0
            && (Math.abs(width - this.expectedWidth) > 2 || Math.abs(height - this.expectedHeight) > 2)
        })
        if (mismatched) {
          this.applyWidgetSize(this.expectedWidth, this.expectedHeight)
        }
      })
      this.observeSizeTarget(this.root)
    }
    this.setCollapsed(this.collapsed)
    this.setBehavior(this.behavior)
    this.render()
  }

  setAppearance(appearance: StudioAppearance): void {
    applyAppearanceVariables(this.root, appearance)
    if (this.contextMenu) applyAppearanceVariables(this.contextMenu, appearance)
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
    if (this.isMobileViewport()) {
      if (!this.behavior.mobileQuickCreate && !this.collapsed) this.setCollapsed(true)
    }
    this.syncVisibility()
    this.render()
  }

  setStudioOpen(open: boolean): void {
    this.studioOpen = open
    if (open) this.closeContextMenu()
    this.syncVisibility()
  }

  snapshot(): StudioActivitySnapshot {
    return { ...this.snapshotValue }
  }

  captureDraft(draft: StudioDraft | null, syncPrompts = true): void {
    if (!draft) return
    this.snapshotValue.draft = draft
    if (syncPrompts) {
      const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
      if (prompt) prompt.value = draft.details.prompt || ""
      if (negative) negative.value = draft.details.negativePrompt || ""
    }
    this.render()
  }

  openTaggedPromptEditor(
    promptValue: string,
    negativePromptValue: string,
    onConfirm: (prompt: string, negativePrompt: string) => void,
  ): boolean {
    if (!this.behavior.widgetEnabled) return false
    if (this.isMobileViewport() && !this.behavior.mobileQuickCreate) return false
    this.setCollapsed(false)
    if (this.collapsed) return false
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
    if (!prompt || !negative) return false
    prompt.value = promptValue
    negative.value = negativePromptValue
    this.quickConfirm = onConfirm
    if (!this.snapshotValue.active) this.state = "idle"
    this.snapshotValue.status = "Review the inline prompt, then Confirm to regenerate."
    this.syncVisibility()
    this.render()
    window.requestAnimationFrame(() => {
      prompt.focus()
      prompt.setSelectionRange(prompt.value.length, prompt.value.length)
    })
    return true
  }

  bootstrap(): void {
    this.ctx.sendToBackend({ type: "bootstrap", requestId: this.bootstrapRequestId })
  }

  begin(jobId: string, connectionId: string, label = "Preparing SwarmUI generation…"): void {
    this.state = "running"
    this.snapshotValue = {
      ...this.snapshotValue,
      active: true,
      jobId,
      connectionId,
      step: 0,
      totalSteps: 0,
      status: label,
    }
    this.render()
  }

  progress(jobId: string, preview: string, step: number, totalSteps: number): void {
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    this.state = "running"
    const requestedSteps = Number(this.quickPending?.parameters?.steps || this.snapshotValue.draft?.details.parameters?.steps)
    const resolvedTotal = Number.isFinite(totalSteps) && totalSteps > 0
      ? totalSteps
      : Number.isFinite(requestedSteps) && requestedSteps > 0 ? requestedSteps : 0
    const hasTotal = resolvedTotal > 0
    const nextStep = Number.isFinite(step) ? Math.max(0, step) : 0
    const safeStep = jobId && jobId === this.snapshotValue.jobId
      ? Math.max(this.snapshotValue.step, nextStep)
      : nextStep
    this.snapshotValue = {
      ...this.snapshotValue,
      active: true,
      jobId: jobId || this.snapshotValue.jobId,
      preview: preview || this.snapshotValue.preview,
      step: hasTotal ? Math.min(safeStep, resolvedTotal) : safeStep,
      totalSteps: resolvedTotal,
      status: hasTotal
        ? `Rendering · ${Math.round(Math.min(safeStep, resolvedTotal))} / ${Math.round(resolvedTotal)}`
        : "Preparing workflow…",
    }
    this.render()
  }

  complete(jobId: string, data: any): void {
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    const imageSrc = String(data?.result?.imageDataUrl || data?.result?.imageUrl || "")
    const details = (data?.record || this.quickPending || null) as GenerationDetails | null
    const latestImage: CurrentImage | null = imageSrc ? {
      id: String(data?.result?.imageId || data?.record?.imageId || "") || undefined,
      src: imageSrc,
      url: String(data?.result?.imageUrl || imageSrc),
      label: `${String(data?.result?.model || details?.model || "SwarmUI")} · just generated`,
      details,
    } : this.snapshotValue.latestImage
    this.state = "done"
    this.snapshotValue = {
      ...this.snapshotValue,
      active: false,
      jobId: "",
      connectionId: "",
      preview: imageSrc || this.snapshotValue.preview,
      latestImage,
      step: 1,
      totalSteps: 1,
      status: "Generation complete · saved by Lumiverse",
    }
    if (latestImage?.details && this.snapshotValue.draft) {
      this.snapshotValue.draft = {
        ...this.snapshotValue.draft,
        details: latestImage.details,
      }
    }
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
    if (prompt && !prompt.value.trim() && details?.prompt) prompt.value = details.prompt
    if (negative && !negative.value.trim() && details?.negativePrompt) negative.value = details.negativePrompt
    this.quickPending = null
    this.render()
  }

  fail(jobId: string, message: string): void {
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    this.state = "error"
    this.snapshotValue = {
      ...this.snapshotValue,
      active: false,
      jobId: "",
      connectionId: "",
      step: 0,
      totalSteps: 0,
      status: message || "Generation stopped.",
    }
    this.quickPending = null
    this.render()
  }

  onMessage(payload: any): void {
    const data = payload?.data || {}
    if (payload?.type === "bootstrap_result") {
      const connections = Array.isArray(data.connections) ? data.connections : []
      const swarmConnections = connections.filter((connection: any) => String(connection?.provider || "").toLowerCase() === "swarmui")
      this.quickConnections = swarmConnections
      this.quickConnection = swarmConnections.find((connection: any) => connection?.is_default) || swarmConnections[0] || null
      this.quickCanAppend = Boolean(data.activeChat?.id && data.permissions?.chatMutation)
      this.render()
      return
    }
    if (payload?.type === "generation_started") {
      this.begin(
        String(payload.clientJobId || ""),
        String(data.connectionId || ""),
        `Preparing ${String(data.model || "SwarmUI")}…`,
      )
      return
    }
    if (payload?.type === "generation_progress") {
      this.progress(
        String(payload.clientJobId || ""),
        typeof data.preview === "string" ? data.preview : "",
        Number(data.step) || 0,
        Number(data.totalSteps) || 0,
      )
      return
    }
    if (payload?.type === "generation_result") {
      this.complete(String(payload.clientJobId || ""), data)
      return
    }
    if (payload?.type === "tagged_generation_result") {
      this.complete(String(payload.clientJobId || ""), data)
      return
    }
    if (payload?.type === "output_appended_to_chat") {
      this.snapshotValue.status = `Appended ${String(data.label || "output")} to chat`
      this.render()
      return
    }
    if (payload?.type === "text_editor_result" && String(data.editorId || "").startsWith("mini-")) {
      const role = String(data.editorId).slice(5)
      const input = role === "positive"
        ? this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
        : role === "negative"
          ? this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
          : null
      if (input && data.cancelled !== true) input.value = String(data.text || "")
      return
    }
    if (payload?.type === "generation_interrupt_requested" && payload.clientJobId === this.snapshotValue.jobId) {
      this.snapshotValue.status = "Interrupt requested…"
      this.render()
      return
    }
    if (payload?.type === "generation_interrupted") {
      this.fail(String(payload.clientJobId || ""), "Generation interrupted · previous output kept")
      return
    }
    if (payload?.type === "studio_error" && payload.operation === "generate") {
      this.fail(String(payload.clientJobId || ""), String(payload.error || "Generation failed."))
      return
    }
    if (payload?.type === "studio_error" && payload.operation === "open_text_editor") {
      this.snapshotValue.status = String(payload.error || "Could not open Lumiverse’s text editor.")
      this.render()
    }
  }

  onImageGenerationEvent(type: "progress" | "complete" | "error", payload: any): void {
    if (payload?.extensionIdentifier && payload.extensionIdentifier !== "swarm_studio") return
    const jobId = String(payload?.assetId || "")
    if (this.snapshotValue.jobId && jobId && jobId !== this.snapshotValue.jobId) return
    if (type === "progress") {
      this.progress(
        jobId,
        typeof payload?.preview === "string" ? payload.preview : "",
        Number(payload?.step) || 0,
        Number(payload?.totalSteps) || 0,
      )
    } else if (type === "complete") {
      this.snapshotValue.status = "Rendering complete · saving full resolution…"
      this.render()
    } else {
      this.fail(jobId, String(payload?.message || "Generation failed."))
    }
  }

  destroy(): void {
    this.cancelLongPress()
    document.removeEventListener("pointerdown", this.onDocumentPointerDown)
    document.removeEventListener("keydown", this.onDocumentKeyDown)
    window.removeEventListener("resize", this.onWindowResize)
    this.sizeObserver?.disconnect()
    this.contextMenu?.remove()
    this.widget.destroy()
  }

  private syncVisibility(): void {
    const visible = this.behavior.widgetEnabled && !this.studioOpen
    if (!visible) this.closeContextMenu()
    if (typeof this.widget.setVisible === "function") this.widget.setVisible(visible)
    else this.root.hidden = !visible
  }

  private interrupt(): void {
    if (!this.snapshotValue.active || !this.snapshotValue.jobId) return
    this.ctx.sendToBackend({
      type: "interrupt_generation",
      requestId: crypto.randomUUID(),
      clientJobId: this.snapshotValue.jobId,
      connectionId: this.snapshotValue.connectionId,
    })
    this.snapshotValue.status = "Interrupt requested…"
    this.render()
  }

  private openPromptEditor(role: string): void {
    const positive = role === "positive"
    const input = positive
      ? this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      : role === "negative"
        ? this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
        : null
    if (!input) return
    this.ctx.sendToBackend({
      type: "open_text_editor",
      requestId: crypto.randomUUID(),
      editorId: `mini-${role}`,
      title: positive ? "Swarm Studio · Positive prompt" : "Swarm Studio · Negative prompt",
      value: input.value,
      placeholder: input.placeholder,
    })
  }

  private isMobileViewport(): boolean {
    // Spindle extensions can execute in a host realm whose window dimensions
    // differ from the visible Lumiverse document. Read the document that owns
    // the widget so this exactly matches the CSS @media breakpoint.
    return (this.root.ownerDocument.documentElement.clientWidth || window.innerWidth) <= 720
  }

  private isMobileOrb(): boolean {
    return this.isMobileViewport() && this.collapsed
  }

  private activateWidget(): void {
    this.openStudio()
  }

  private cancelLongPress(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private scheduleLongPress(event: PointerEvent): void {
    this.cancelLongPress()
    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    let dragged = false
    const cancel = () => {
      this.cancelLongPress()
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
    }
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 7) {
        dragged = true
        this.suppressNextClick = true
        cancel()
        window.setTimeout(() => {
          if (dragged) this.suppressNextClick = false
        }, 450)
      }
    }
    const finish = (finishEvent: PointerEvent) => {
      if (finishEvent.pointerId === pointerId) cancel()
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)
    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = null
      this.suppressNextClick = true
      this.showContextMenu(startX, startY)
    }, 560)
  }

  private showContextMenu(clientX: number, clientY: number): void {
    const menu = this.contextMenu
    if (!menu) return
    const toggle = menu.querySelector<HTMLButtonElement>('[data-action="mini-menu-toggle"]')
    if (toggle) {
      const blockedOnMobile = this.collapsed && this.isMobileViewport() && !this.behavior.mobileQuickCreate
      toggle.disabled = blockedOnMobile
      toggle.title = blockedOnMobile ? "Enable Quick Create on mobile in Studio settings" : ""
      const label = toggle.querySelector<HTMLElement>('[data-role="mini-menu-size-label"]')
      const icon = toggle.querySelector<HTMLElement>('[data-role="mini-menu-size-icon"]')
      if (label) label.textContent = this.collapsed ? "Expand Quick Create" : "Minimize Quick Create"
      if (icon) icon.innerHTML = this.collapsed ? EXPAND_ICON : MINIMIZE_ICON
    }
    menu.hidden = false
    menu.style.left = "8px"
    menu.style.top = "8px"
    const bounds = menu.getBoundingClientRect()
    const viewport = this.root.ownerDocument.documentElement
    const left = clamp(clientX, 8, Math.max(8, viewport.clientWidth - bounds.width - 8))
    const top = clamp(clientY, 8, Math.max(8, viewport.clientHeight - bounds.height - 8))
    menu.style.left = `${Math.round(left)}px`
    menu.style.top = `${Math.round(top)}px`
    menu.querySelector<HTMLButtonElement>("button:not([hidden]):not(:disabled)")?.focus()
  }

  private closeContextMenu(): void {
    const menu = this.contextMenu
    if (menu) menu.hidden = true
  }

  private appendLatestToChat(): void {
    const image = this.snapshotValue.latestImage
    if (!image?.id || !this.quickCanAppend) return
    this.ctx.sendToBackend({
      type: "append_output_to_chat",
      requestId: crypto.randomUUID(),
      imageId: image.id,
      label: image.label,
    })
    this.snapshotValue.status = "Appending output to active chat…"
    this.render()
  }

  private confirmTaggedPromptEdit(): void {
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')?.value.trim() || ""
    if (!prompt) {
      this.state = "error"
      this.snapshotValue.status = "Give the inline illustration a prompt first."
      this.render()
      return
    }
    const confirm = this.quickConfirm
    if (!confirm) return
    this.quickConfirm = null
    this.state = "idle"
    this.snapshotValue.status = "Inline regeneration queued with a random seed…"
    confirm(prompt, negativePrompt)
    this.render()
  }

  private quickGenerate(): void {
    if (this.snapshotValue.active) return
    const liveDraft = this.getStudioDraft()
    if (liveDraft) this.captureDraft(liveDraft, false)
    const draft = liveDraft || this.snapshotValue.draft
    const connection = (draft?.connectionId
      ? this.quickConnections.find((candidate) => String(candidate.id) === draft.connectionId)
      : null) || this.quickConnection
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')?.value.trim() || ""
    if (!connection) {
      this.state = "error"
      this.snapshotValue.status = "No Lumiverse SwarmUI connection is available."
      this.render()
      return
    }
    if (!prompt) {
      this.state = "error"
      this.snapshotValue.status = "Give Quick create a prompt first."
      this.render()
      return
    }
    const parameters = inheritQuickGenerationParameters(
      connection.default_parameters || {},
      draft?.details.parameters,
    )
    const model = String(draft?.details.model || connection.model || "")
    const loras = Array.isArray(parameters.loras)
      ? parameters.loras.map((name) => String(name))
      : (draft?.details.loras || []).map((lora) => lora.name)
    const loraWeights = Array.isArray(parameters.loraWeights)
      ? parameters.loraWeights.map(Number)
      : (draft?.details.loras || []).map((lora) => lora.weight)
    parameters.loras = loras
    parameters.loraWeights = loraWeights
    const clientJobId = crypto.randomUUID()
    this.quickPending = {
      prompt,
      negativePrompt,
      resolvedPrompt: prompt,
      resolvedNegativePrompt: negativePrompt,
      model,
      parameters,
      loras: loras.map((name, index) => ({ name, weight: Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1 })),
      presets: draft?.details.presets || [],
      workflow: draft?.details.workflow || "",
      initImageId: draft?.details.initImageId || "",
      initImageLabel: draft?.details.initImageLabel || "",
      createdAt: Date.now(),
    }
    this.snapshotValue.draft = draft ? {
      ...draft,
      details: this.quickPending,
    } : {
      connectionId: String(connection.id || ""),
      details: this.quickPending,
      stack: [],
      selectedPresets: [],
      workflow: null,
      initImage: null,
    }
    this.begin(clientJobId, String(connection.id || ""), `Preparing quick image · ${model || "SwarmUI"}`)
    this.ctx.sendToBackend({
      type: "generate",
      requestId: crypto.randomUUID(),
      input: {
        prompt,
        negativePrompt: negativePrompt || undefined,
        connection_id: connection.id,
        model,
        clientJobId,
        parameters,
      },
      recordHints: {
        resolvedPrompt: prompt,
        resolvedNegativePrompt: negativePrompt,
        presets: draft?.details.presets || [],
        workflow: draft?.details.workflow || "",
        initImageId: draft?.details.initImageId || "",
        initImageLabel: draft?.details.initImageLabel || "",
        stack: draft?.stack || [],
        source: "miniplayer",
      },
      showCompletionToast: this.behavior.completionToast,
    })
  }

  private setCollapsed(value: boolean): void {
    if (!value && this.isMobileViewport() && !this.behavior.mobileQuickCreate) return
    this.collapsed = value
    this.expanded = !value
    try {
      window.localStorage.setItem(MINIPLAYER_STORAGE_KEY, JSON.stringify({ collapsed: value }))
    } catch {
      // The active session can still use the chosen miniplayer size.
    }
    // Resize the host before exposing the larger inner layout. On a cold
    // extension mount, Lumi may otherwise keep the first 1:1 paint while the
    // Quick Create children overflow into its eventual footprint.
    this.resizeWidget()
    const mini = this.root.querySelector<HTMLElement>('[data-role="miniplayer"]')
    if (mini) {
      mini.dataset.collapsed = String(value)
      mini.dataset.expanded = String(this.expanded)
      void mini.offsetWidth
    }
    const toggle = this.root.querySelector<HTMLButtonElement>('[data-action="mini-collapse"]')
    if (toggle) {
      toggle.textContent = "−"
      toggle.title = "Minimize to image"
      toggle.setAttribute("aria-label", toggle.title)
    }
    if (!value) {
      const liveDraft = this.getStudioDraft()
      if (liveDraft) this.captureDraft(liveDraft)
    }
    // Commit every state-derived attribute together. Without this, an expand
    // could leave data-mobile-orb="true" beside data-expanded="true" until a
    // later drag or Studio round-trip happened to render the controller.
    this.render()
  }

  private resizeWidget(): void {
    const compact = this.collapsed
    const viewportWidth = this.root.ownerDocument.documentElement.clientWidth || window.innerWidth
    const width = compact
      ? this.isMobileViewport() ? 64 : 56
      : Math.min(430, viewportWidth - 24)
    const height = compact
      ? width
      : this.isMobileViewport() ? 304 : 270
    this.expectedWidth = width
    this.expectedHeight = height
    this.applyWidgetSize(width, height)
    const expectedCompact = compact
    window.requestAnimationFrame(() => {
      if (this.collapsed !== expectedCompact) return
      this.applyWidgetSize(width, height)
    })
  }

  private applyWidgetSize(width: number, height: number): void {
    this.widget.setSize?.(width, height)
    const targets = this.widgetSizeTargets()
    for (const target of targets) {
      target.style.setProperty("width", `${width}px`, "important")
      target.style.setProperty("height", `${height}px`, "important")
    }
    this.observeSizeTarget(targets[targets.length - 1] || this.root)
  }

  private widgetSizeTargets(): HTMLElement[] {
    const targets: HTMLElement[] = [this.root]
    if (this.root.classList.contains("ss-miniplayer-app-surface")) return targets
    let current = this.root.parentElement as HTMLElement | null
    while (current && current !== this.root.ownerDocument.body && current !== this.root.ownerDocument.documentElement) {
      targets.push(current)
      if (getComputedStyle(current).position === "fixed") break
      current = current.parentElement as HTMLElement | null
    }
    return targets
  }

  private observeSizeTarget(target: HTMLElement): void {
    if (!this.sizeObserver || this.observedSizeTarget === target) return
    this.sizeObserver.disconnect()
    this.sizeObserver.observe(target)
    this.observedSizeTarget = target
  }

  private render(): void {
    const mini = this.root.querySelector<HTMLElement>('[data-role="miniplayer"]')
    if (!mini) return
    const hasTotal = this.snapshotValue.totalSteps > 0
    const percentage = hasTotal
      ? clamp(Math.round((this.snapshotValue.step / this.snapshotValue.totalSteps) * 100), 0, 100)
      : this.state === "done" ? 100 : 0
    mini.dataset.state = this.state
    const mobileOrb = this.isMobileOrb()
    mini.dataset.mobileOrb = String(mobileOrb)
    mini.dataset.collapsed = String(this.collapsed)
    mini.dataset.expanded = String(this.expanded)
    if (this.collapsed) {
      mini.dataset.action = "mini-open"
      mini.setAttribute("role", "button")
      mini.tabIndex = 0
      mini.setAttribute("aria-label", "Open Swarm Studio")
    } else {
      delete mini.dataset.action
      mini.removeAttribute("role")
      mini.removeAttribute("tabindex")
      mini.removeAttribute("aria-label")
    }
    mini.dataset.indeterminate = String(this.state === "running" && !hasTotal)
    mini.style.setProperty("--ss-mini-progress", `${percentage}%`)
    const labels = { idle: "Ready", running: "Live", done: "Done", error: "Stopped" }
    this.root.querySelector<HTMLElement>('[data-role="mini-state"]')!.textContent = labels[this.state]
    this.root.querySelector<HTMLElement>('[data-role="mini-status"]')!.textContent = this.snapshotValue.status
    const image = this.root.querySelector<HTMLImageElement>('[data-role="mini-image"]')!
    const placeholder = this.root.querySelector<HTMLElement>('[data-role="mini-placeholder"]')!
    if (this.snapshotValue.preview) {
      image.src = this.snapshotValue.preview
      image.hidden = false
      placeholder.hidden = true
    } else {
      image.hidden = true
      placeholder.hidden = false
    }
    const append = this.root.querySelector<HTMLButtonElement>('[data-action="mini-append"]')
    if (append) append.disabled = !this.quickCanAppend || !this.snapshotValue.latestImage?.id
    const quickButton = this.root.querySelector<HTMLButtonElement>('[data-action="mini-generate"]')
    if (quickButton) {
      quickButton.disabled = !this.quickConfirm && !this.snapshotValue.active && !this.quickConnection
      quickButton.dataset.running = String(this.snapshotValue.active)
      quickButton.textContent = this.snapshotValue.active
        ? "Stop generation"
        : this.quickConfirm ? "Confirm" : "Generate quick image"
    }
    const connection = this.root.querySelector<HTMLElement>('[data-role="mini-connection"]')
    if (connection) {
      connection.textContent = this.quickConnection
        ? `${String(this.quickConnection.name || "SwarmUI")} · ${String(this.quickConnection.model || "connection default")}`
        : "No Lumiverse SwarmUI connection found"
    }
  }
}

class StudioController {
  private readonly ctx: FrontendContext
  private readonly modal: any
  private readonly root: HTMLElement
  private readonly activity: MiniPlayerController | null
  private readonly onThemeChange: (theme: StudioTheme) => void
  private readonly onAppearanceChange: (appearance: StudioAppearance) => void
  private readonly onBehaviorChange: (behavior: StudioBehavior) => void
  private appearance = defaultStudioAppearance()
  private behavior: StudioBehavior
  private appearanceControlsInitialized = false
  private readonly state: StudioState
  private previewObserver: IntersectionObserver | null = null
  private readonly previewCache = new Map<string, string>()
  private readonly requestedPreviews = new Set<string>()
  private connectionRequestId = ""
  private workflowRequestId = ""
  private generating = false
  private currentJobId = ""
  private currentJobConnectionId = ""
  private progressStep = 0
  private pendingDraftRestore: StudioDraft | null = null
  private pendingTaggedPrompt: { prompt: string; negativePrompt: string } | null = null
  private pendingWorkflowRestore: WorkflowDraft | null = null
  private workflowOpenOnLoad = true
  private readonly workflowValues = new Map<string, unknown>()
  private readonly workflowEnabled = new Set<string>()
  private readonly workflowImageValues = new Map<string, string>()
  private pendingGeneration: GenerationDetails | null = null
  private preGenerationImage: CurrentImage | null = null
  private imageScale = 1
  private previewAspect = 1
  private libraryFolderId = ""
  private libraryPage = 0
  private readonly librarySelection = new Set<string>()
  private librarySelectionAnchorId = ""
  private librarySearchOpen = false
  private librarySelectionMode = false
  private hydratedVisualCharacterId = ""
  private pendingCreatedFolder: { name: string; bindingType: "unbound" | "character" } | null = null
  private missingLoras: StackPresetItem[] = []
  private loraDownloadRequestId = ""
  private loraDownloadJobId = ""
  private loraDownloadActive = false
  private handledLoraDownloadJobId = ""
  private pendingPresetParamMap: Record<string, string> = {}
  private pendingMoveImageIds: string[] = []
  private outputResizeObserver: ResizeObserver | null = null
  private inspectorResizeObserver: ResizeObserver | null = null
  private stopActiveResize: (() => void) | null = null
  private profileSyncTimer: ReturnType<typeof setTimeout> | null = null
  private disposed = false
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    const config = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    if (config && !config.hidden) {
      this.closeConfigPopover()
      event.stopPropagation()
      return
    }
    const newFolder = this.root.querySelector<HTMLElement>('[data-role="new-folder-modal"]')
    if (newFolder && !newFolder.hidden) {
      this.closeNewFolderModal()
      event.stopPropagation()
      return
    }
    const inspector = this.root.querySelector<HTMLElement>('[data-role="inspector"]')
    const workflow = this.root.querySelector<HTMLElement>('[data-role="workflow-modal"]')
    if (workflow && !workflow.hidden) {
      this.closeWorkflowSetup()
      event.stopPropagation()
      return
    }
    const savePreset = this.root.querySelector<HTMLElement>('[data-role="save-preset-modal"]')
    if (savePreset && !savePreset.hidden) {
      this.closeSavePresetModal()
      event.stopPropagation()
      return
    }
    const presetManager = this.root.querySelector<HTMLElement>('[data-role="preset-manager-modal"]')
    if (presetManager && !presetManager.hidden) {
      this.closePresetManager()
      event.stopPropagation()
      return
    }
    const moveFolder = this.root.querySelector<HTMLElement>('[data-role="move-folder-modal"]')
    if (moveFolder && !moveFolder.hidden) {
      this.closeMoveFolderModal()
      event.stopPropagation()
      return
    }
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
    const missingLoras = this.root.querySelector<HTMLElement>('[data-role="missing-lora-modal"]')
    if (missingLoras && !missingLoras.hidden) {
      this.closeMissingLoras()
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
    behavior: StudioBehavior,
    onBehaviorChange: (behavior: StudioBehavior) => void,
    activity: MiniPlayerController | null = null,
  ) {
    this.ctx = ctx
    this.modal = modal
    this.root = modal.root
    this.activity = activity
    this.onThemeChange = onThemeChange
    this.onAppearanceChange = onAppearanceChange
    this.behavior = { ...behavior }
    this.onBehaviorChange = onBehaviorChange
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
      swarmWorkflows: [],
      workflowError: "",
      selectedWorkflow: null,
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
      characterBaseTags: {
        characterId: "",
        characterName: "",
        tags: "",
        source: "none",
      },
      chatVisuals: null,
    }
    this.buildV3()
    this.restoreWorkspaceState()
    this.bind()
    if (typeof ResizeObserver !== "undefined") {
      this.outputResizeObserver = new ResizeObserver(() => this.fitPreviewToAspect())
      this.outputResizeObserver.observe(this.get<HTMLElement>('[data-role="output-stage"]'))
      this.inspectorResizeObserver = new ResizeObserver(() => this.fitInspectorToSpace())
      this.inspectorResizeObserver.observe(this.get<HTMLElement>('[data-role="inspector-stage"]'))
    }
    document.addEventListener("keydown", this.handleKeyDown, true)
    this.setRunStatus("Loading Lumiverse connections…")
    const activitySnapshot = this.activity?.snapshot()
    this.pendingDraftRestore = activitySnapshot?.draft || null
    if (activitySnapshot?.latestImage) this.setCurrentImage(activitySnapshot.latestImage)
    if (activitySnapshot?.active) {
      this.generating = true
      this.currentJobId = activitySnapshot.jobId
      this.currentJobConnectionId = activitySnapshot.connectionId
      this.setGenerating(true)
      if (activitySnapshot.preview) {
        this.showLivePreview(activitySnapshot.preview, activitySnapshot.step, activitySnapshot.totalSteps)
      } else {
        this.updateGenerationProgress(activitySnapshot.step, activitySnapshot.totalSteps)
      }
    }
    this.send("bootstrap")
    this.send("get_lora_download_status")
  }

  dispose(): void {
    this.persistWorkspaceState()
    this.syncStudioProfile()
    this.disposed = true
    if (this.profileSyncTimer) clearTimeout(this.profileSyncTimer)
    this.profileSyncTimer = null
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

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
    const toast = this.root.querySelector<HTMLInputElement>('[data-role="completion-toast"]')
    if (toast) toast.checked = this.behavior.completionToast
    const widgetEnabled = this.root.querySelector<HTMLInputElement>('[data-role="widget-enabled"]')
    if (widgetEnabled) widgetEnabled.checked = this.behavior.widgetEnabled
    const mobileQuickCreate = this.root.querySelector<HTMLInputElement>('[data-role="mobile-quick-create"]')
    if (mobileQuickCreate) mobileQuickCreate.checked = this.behavior.mobileQuickCreate
    const tagAutoGenerate = this.root.querySelector<HTMLInputElement>('[data-role="tag-auto-generate"]')
    if (tagAutoGenerate) tagAutoGenerate.checked = this.behavior.tagAutoGenerate
    const tagPromptInjection = this.root.querySelector<HTMLInputElement>('[data-role="tag-prompt-injection"]')
    if (tagPromptInjection) tagPromptInjection.checked = this.behavior.tagPromptInjection
    const requiredImageMin = this.root.querySelector<HTMLInputElement>('[data-role="required-image-min"]')
    if (requiredImageMin) requiredImageMin.value = String(this.behavior.requiredImageMin)
    const requiredImageMax = this.root.querySelector<HTMLInputElement>('[data-role="required-image-max"]')
    if (requiredImageMax) requiredImageMax.value = String(this.behavior.requiredImageMax)
  }

  exportDraft(): StudioDraft | null {
    if (!this.state.connection) return this.pendingDraftRestore
    let rawRequestOverride: string | undefined
    try {
      rawRequestOverride = this.buildRawOverride()
    } catch {
      rawRequestOverride = this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value.trim() || undefined
    }
    const enabled = this.effectiveStack().filter((item) => item.enabled)
    const parameters = this.collectGenerationParameters(rawRequestOverride, enabled)
    const prompt = this.finalPrompt()
    const negativePrompt = this.finalNegativePrompt()
    const model = this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model
    const resolved = this.resolvedPrompts()
    return {
      connectionId: String(this.state.connection.id || ""),
      details: {
        prompt,
        negativePrompt,
        resolvedPrompt: resolved.prompt,
        resolvedNegativePrompt: resolved.negativePrompt,
        model,
        parameters,
        loras: enabled.map((item) => ({ name: item.lora.name, weight: item.weight })),
        presets: resolved.presets,
        workflow: this.state.selectedWorkflow?.name || "",
        initImageId: this.state.initImage?.imageId || "",
        initImageLabel: this.state.initImage?.label || "",
        createdAt: Date.now(),
      },
      stack: this.state.stack.map((item) => ({
        name: item.lora.name,
        title: item.lora.title,
        weight: item.weight,
        enabled: item.enabled,
        useTrigger: item.useTrigger,
      })),
      selectedPresets: this.state.selectedPresets.map((preset) => ({ ...preset })),
      workflow: this.state.selectedWorkflow ? {
        name: this.state.selectedWorkflow.name,
        values: Object.fromEntries(this.workflowValues),
        enabled: [...this.workflowEnabled],
        images: Object.fromEntries(this.workflowImageValues),
      } : null,
      initImage: this.state.initImage ? { ...this.state.initImage } : null,
    }
  }

  loadTaggedPrompt(prompt: string, negativePrompt = ""): void {
    this.pendingTaggedPrompt = { prompt, negativePrompt }
    this.applyPendingTaggedPrompt()
  }

  private applyPendingTaggedPrompt(): void {
    if (!this.pendingTaggedPrompt) return
    const { prompt, negativePrompt } = this.pendingTaggedPrompt
    const positive = this.root.querySelector<HTMLTextAreaElement>('[data-role="positive"]')
    const negative = this.root.querySelector<HTMLTextAreaElement>('[data-role="negative"]')
    if (positive) positive.value = prompt
    if (negative && negativePrompt) negative.value = negativePrompt
    if (this.state.connection) this.pendingTaggedPrompt = null
    this.scheduleStudioProfileSync()
    this.setRunStatus("Loaded the tagged scene into Studio.")
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
  }

  private scheduleStudioProfileSync(): void {
    if (this.disposed) return
    if (this.profileSyncTimer) clearTimeout(this.profileSyncTimer)
    this.profileSyncTimer = setTimeout(() => {
      this.profileSyncTimer = null
      this.syncStudioProfile()
    }, 450)
  }

  private syncStudioProfile(): void {
    const draft = this.exportDraft()
    if (!draft) return
    const parameters = this.baseStudioProfileParameters(
      typeof draft.details.parameters.rawRequestOverride === "string"
        ? draft.details.parameters.rawRequestOverride
        : undefined,
    )
    if (typeof parameters.rawRequestOverride === "string") {
      try {
        const override = JSON.parse(parameters.rawRequestOverride)
        for (const [key, value] of Object.entries(override)) {
          if (
            (typeof value === "string" && value.startsWith("data:image/"))
            || /(?:init|reference).*image|image.*(?:init|reference)/i.test(key)
          ) delete override[key]
        }
        parameters.rawRequestOverride = JSON.stringify(override)
      } catch {
        delete parameters.rawRequestOverride
      }
    }
    this.send("sync_studio_profile", {
      input: {
        prompt: this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim(),
        negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim(),
        connection_id: draft.connectionId,
        model: draft.details.model,
        parameters,
      },
      recordHints: {
        resolvedPrompt: draft.details.resolvedPrompt,
        resolvedNegativePrompt: draft.details.resolvedNegativePrompt,
        presets: draft.details.presets,
        workflow: draft.details.workflow,
        stack: draft.stack,
      },
    })
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
          <div class="ss-brand">${FRAME_WALL_ICON}<span>Swarm Studio</span></div>
          <div class="ss-connection-wrap">
            <select class="ss-select ss-connection" data-role="connection" aria-label="SwarmUI connection">
              <option value="">Loading SwarmUI connections…</option>
            </select>
          </div>
          <div class="ss-top-actions">
            <button class="ss-icon-button ss-header-library" data-action="open-output-library" title="Open output library" aria-label="Open output library">${LIBRARY_ICON}</button>
            <div class="ss-config-wrap">
              <button class="ss-icon-button ss-config-button" data-action="toggle-config" aria-expanded="false" title="Studio settings" aria-label="Studio settings">${SETTINGS_ICON}</button>
              <div class="ss-config-popover" data-role="config-popover" hidden>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Swarm metadata</strong><span>Models, LoRAs and previews</span></div>
                  <button class="ss-button" data-action="refresh-metadata">Refresh metadata</button>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>Behavior</strong><span>Notifications and floating widget</span></div>
                  <label class="ss-config-toggle"><input type="checkbox" data-role="completion-toast" ${this.behavior.completionToast ? "checked" : ""} /><span>Toast when a generation finishes</span></label>
                  <label class="ss-config-toggle"><input type="checkbox" data-role="widget-enabled" ${this.behavior.widgetEnabled ? "checked" : ""} /><span>Enable floating Studio widget</span></label>
                  <label class="ss-config-toggle"><input type="checkbox" data-role="mobile-quick-create" ${this.behavior.mobileQuickCreate ? "checked" : ""} /><span>Enable Quick Create on mobile</span></label>
                  <p class="ss-muted ss-tiny">Right-click or long-press the image for Quick Create, Studio, Library, and hide actions. Mobile stays a 64px image until Quick Create is explicitly enabled.</p>
                </section>
                <section class="ss-config-section">
                  <div class="ss-config-section-head"><strong>In-message images</strong><span>Explicitly opt in</span></div>
                  <label class="ss-config-toggle"><input type="checkbox" data-role="tag-auto-generate" ${this.behavior.tagAutoGenerate ? "checked" : ""} /><span>Automatically generate completed &lt;swarm-image&gt; tags</span></label>
                  <label class="ss-config-toggle"><input type="checkbox" data-role="tag-prompt-injection" ${this.behavior.tagPromptInjection ? "checked" : ""} /><span>Teach the model the Swarm image-tag protocol</span></label>
                  <div class="ss-image-count-range">
                    <span>Required images per reply</span>
                    <input class="ss-input" type="number" min="0" max="6" step="1" inputmode="numeric" data-role="required-image-min" value="${this.behavior.requiredImageMin}" aria-label="Minimum required images" title="Minimum required images" />
                    <span class="ss-range-separator">to</span>
                    <input class="ss-input" type="number" min="0" max="6" step="1" inputmode="numeric" data-role="required-image-max" value="${this.behavior.requiredImageMax}" aria-label="Maximum required images" title="Maximum required images" />
                  </div>
                  <p class="ss-muted ss-tiny">0–0 lets the model decide. Any other range explicitly requires that many complete image requests in the reply.</p>
                  <code class="ss-tag-protocol-example">{{swarm_image_protocol}}

&lt;swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="Two people sharing food at a city stall"
&gt;
character 1: smiling, holding a paper tray
character 2: amused expression, leaning closer
interaction: character 1 offers character 2 a bite, standing side by side
medium shot, city street, food stall, evening lights&lt;/swarm-image&gt;</code>
                  <button class="ss-button" data-action="copy-tag-protocol">Copy protocol example</button>
                  <details class="ss-css-guide ss-macro-guide">
                    <summary>Macro and preset guide</summary>
                    <div class="ss-macro-guide-grid">
                      <code>{{swarm_image_protocol}}</code><span>Local-generation instructions, active identity tags, checkpoint-aware prompting guidance, and preset state.</span>
                      <code>{{swarm_preset}}</code><span>Active preset titles as exact native directives: &lt;preset:name one&gt;, &lt;preset:name two&gt;.</span>
                      <code>{{swarm_negative}}</code><span>Current Studio negative prompt.</span>
                      <code>{{char_base}}</code><span>Active character base image tags. Tagged jobs apply these automatically.</span>
                      <code>{{persona_base}}</code><span>Visual identity bound to the active persona in Chat Visuals.</span>
                      <code>{{char_profile}}</code><span>Active character avatar URL for HTML shells.</span>
                      <code>{{user_profile}}</code><span>Active persona avatar URL for HTML shells.</span>
                      <code>{{swarm_checkpoint}}</code><span>Current Studio checkpoint.</span>
                      <code>{{swarm_aspect}}</code><span>Closest named Studio aspect ratio.</span>
                      <code>{{last_genned}}</code><span>URL of the latest completed Swarm Studio image.</span>
                    </div>
                  </details>
                  <p class="ss-muted ss-tiny">With automatic generation off, tags become lazy Generate cards. Character-folder visuals, the current Studio stack, active presets, and the current negative prompt are inherited. Set <code>character="none"</code> to skip the chat character and <code>persona="active"</code> to include the bound persona. For two subjects, keep character 1, character 2, and interaction on separate compact lines. The request runs on local SwarmUI; one-line and multiline tags both work.</p>
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
                  <div class="ss-config-section-head"><strong>Profile</strong><span>Editing below activates Custom</span></div>
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
.ss-launcher              drawer composition
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
                <section class="ss-workflow-panel">
                  <div class="ss-workflow-picker">
                    <div class="ss-field">
                      <label>Generation workflow</label>
                      <select class="ss-select" data-role="workflow-select" aria-label="Saved Swarm generation workflow">
                        <option value="">Standard Swarm generation</option>
                      </select>
                    </div>
                    <span class="ss-workflow-badge" data-role="workflow-badge" data-active="false">Native</span>
                    <button class="ss-icon-button ss-workflow-configure" data-action="open-workflow-setup" title="Open workflow setup" aria-label="Open workflow setup" disabled>${EXPAND_ICON}</button>
                  </div>
                  <div class="ss-workflow-description" data-role="workflow-description">Use Swarm’s normal parameter pipeline, or select a saved Comfy workflow exposed to its Generate tab.</div>
                </section>
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
                  </div>
                  <label class="ss-creativity-row"><span>Creativity</span><input data-role="denoise" type="range" min="0" max="1" step="0.05" value="0.6" /><span data-role="denoise-label">0.60</span></label>
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
                      <button class="ss-icon-button ss-preset-manage" data-action="open-preset-manager" data-role="manage-swarm-presets" title="Manage Swarm presets" aria-label="Manage Swarm presets" hidden>${SETTINGS_ICON}</button>
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
                  <button class="ss-button" data-action="append-to-chat" disabled>Append to chat</button>
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
                  <div class="ss-prompt-field-head">
                    <div class="ss-positive-label"><label for="ss-positive-v3">Positive</label><button class="ss-active-visual-pill" data-role="active-visual-pill" data-action="toggle-active-visual" type="button" hidden></button><button class="ss-active-visual-pill" data-role="active-persona-visual-pill" data-action="toggle-active-persona-visual" type="button" hidden></button><span class="ss-active-preset-pill" data-role="active-preset-pill" hidden></span></div>
                    <button class="ss-prompt-editor-button" data-action="edit-prompt" data-prompt-role="positive" title="Open positive prompt in Lumiverse editor" aria-label="Expand positive prompt">${EXPAND_ICON}</button>
                  </div>
                  <textarea id="ss-positive-v3" class="ss-textarea" data-role="positive" placeholder="Describe the image…"></textarea>
                  <div class="ss-field-help" data-role="trigger-summary">No inherited trigger phrases.</div>
                </div>
                <div class="ss-field">
                  <div class="ss-prompt-field-head">
                    <label for="ss-negative-v3">Negative</label>
                    <button class="ss-prompt-editor-button" data-action="edit-prompt" data-prompt-role="negative" title="Open negative prompt in Lumiverse editor" aria-label="Expand negative prompt">${EXPAND_ICON}</button>
                  </div>
                  <textarea id="ss-negative-v3" class="ss-textarea" data-role="negative" placeholder="What should not appear…"></textarea>
                  <div class="ss-field-help">Passed through Lumiverse's SwarmUI provider.</div>
                </div>
              </div>
              <div class="ss-mobile-prompt-tools">
                <button class="ss-button ss-mobile-prompt-tool" data-action="use-current-init" data-role="mobile-init-action" title="Use the current output as init image" disabled>${INIT_IMAGE_ICON}<span>Use as init</span></button>
                <button class="ss-button ss-mobile-prompt-tool" data-action="toggle-seed-mode" data-role="seed-action-mobile" title="Lock or randomize the next seed">${RANDOM_SEED_ICON}<span>Random seed</span></button>
                <button class="ss-button ss-mobile-prompt-tool" data-action="append-to-chat" title="Append current output to chat" disabled>${APPEND_CHAT_ICON}<span>Append</span></button>
              </div>
            </section>
          </main>

          <div class="ss-resize-handle ss-resize-history" data-resize="history" role="separator" aria-orientation="vertical" title="Drag to resize history"></div>

          <aside class="ss-history-pane" data-mobile-panel="history">
            <div class="ss-pane-head">
              <div class="ss-pane-title"><strong>History</strong><div class="ss-muted ss-tiny"><span data-role="output-count">0</span> saved outputs</div></div>
              <div>
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
          <div class="ss-dock-head">
            <div class="ss-section-title"><strong>LoRA workspace</strong><span class="ss-muted ss-tiny" data-role="dock-summary">0 models · 0 stacked</span></div>
            <button class="ss-icon-button ss-pane-toggle" data-action="toggle-loras" title="Collapse LoRA workspace" aria-label="Collapse LoRA workspace" aria-expanded="true">⌄</button>
          </div>
          <div class="ss-lora-dock-content">
            <section class="ss-lora-library">
              <div class="ss-lora-titlebar">
                <div class="ss-section-title"><strong>Select LoRAs</strong><span class="ss-muted ss-tiny" data-role="lora-count">0 models</span></div>
                <span class="ss-family-chip" data-role="family-chip">Waiting for checkpoint</span>
              </div>
              <div class="ss-library-tools">
                <div class="ss-lora-query">
                  <input class="ss-input" data-role="lora-search" type="search" placeholder="Search keywords, tags, triggers…" />
                  <div class="ss-lora-download-entry" data-role="lora-download-entry" hidden>
                    <input class="ss-input" data-role="lora-download-url" type="url" inputmode="url" placeholder="Paste or drop a Civitai / Hugging Face download URL…" />
                    <input class="ss-input" data-role="lora-download-name" placeholder="Optional save name" />
                    <button class="ss-button ss-button-primary" data-action="start-lora-download" title="Download into SwarmUI">${DOWNLOAD_ICON}<span>Start</span></button>
                    <button class="ss-button" data-action="cancel-lora-download" title="Close downloader">×</button>
                  </div>
                  <div class="ss-lora-download-status" data-role="lora-download-progress" hidden><i></i></div>
                </div>
                <button class="ss-button ss-lora-download-toggle" data-action="toggle-lora-download">${DOWNLOAD_ICON}<span>Download</span></button>
                <select class="ss-select ss-lora-filter" data-role="lora-filter" aria-label="LoRA compatibility filter">
                  <option value="compatible">Compatible only</option>
                  <option value="all">All model families</option>
                </select>
                <select class="ss-select" data-role="lora-sort" aria-label="Sort LoRAs">
                  <option value="title">Title</option>
                  <option value="name">Filename</option>
                  <option value="newest">Newest</option>
                </select>
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
              <div class="ss-stack-share-tools">
                <button class="ss-button" data-action="import-stack" title="Import a shared LoRA stack JSON file">${IMPORT_ICON}<span>Import</span></button>
                <button class="ss-button" data-action="export-stack" title="Export the current LoRA stack as shareable JSON">${EXPORT_ICON}<span>Export</span></button>
                <button class="ss-button" data-action="apply-lumi-stack" title="Merge this stack into Lumiverse Image Gen and activate it">${EXPORT_ICON}<span>Apply to Lumi</span></button>
                <button class="ss-button ss-button-danger ss-clear-stack" data-action="clear-stack" disabled>Clear</button>
                <input data-role="stack-import-file" type="file" accept="application/json,.json" hidden />
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

        <div class="ss-workflow-modal" data-role="workflow-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-workflow-modal-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title">
                <span class="ss-eyebrow">ComfyUI · Saved workflow</span>
                <strong id="ss-workflow-modal-title" data-role="workflow-modal-title">Workflow setup</strong>
              </div>
              <button class="ss-icon-button" data-action="close-workflow-setup" aria-label="Close workflow setup">×</button>
            </header>
            <div class="ss-workflow-modal-description" data-role="workflow-modal-description">Exposed workflow parameters appear here.</div>
            <div class="ss-workflow-fields" data-role="workflow-fields"></div>
            <footer class="ss-workflow-modal-actions">
              <button class="ss-button" data-action="use-standard-workflow">Use standard generation</button>
              <button class="ss-button ss-button-primary" data-action="close-workflow-setup">Done</button>
            </footer>
          </section>
        </div>

        <div class="ss-missing-lora-modal" data-role="missing-lora-modal" hidden>
          <section class="ss-missing-lora-card" role="dialog" aria-modal="true" aria-labelledby="ss-missing-lora-title">
            <header><div><span class="ss-eyebrow">SHARED STACK</span><h3 id="ss-missing-lora-title">Missing LoRAs</h3></div><button class="ss-icon-button" data-action="close-missing-loras" aria-label="Close missing LoRA popup">×</button></header>
            <p class="ss-muted">Choose LoRAs with direct Civitai or Hugging Face download links. SwarmUI handles credentials, paths, metadata, and duplicate protection.</p>
            <div class="ss-missing-lora-list" data-role="missing-lora-list"></div>
            <footer><span class="ss-muted ss-tiny" data-role="missing-lora-download-status"></span><button class="ss-button" data-action="copy-missing-loras">Copy list</button><button class="ss-button ss-button-primary" data-action="download-missing-loras">Download selected</button><button class="ss-button" data-action="close-missing-loras">Done</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="save-preset-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-save-preset-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">SWARM PRESET</span><strong id="ss-save-preset-title">Choose what to save</strong></div>
              <button class="ss-icon-button" data-action="close-save-preset" aria-label="Close save preset popup">×</button>
            </header>
            <div class="ss-save-preset-fields">
              <div class="ss-save-preset-basics">
                <label class="ss-field"><span>Name</span><input class="ss-input" data-role="save-preset-name" maxlength="120" placeholder="Preset name" /></label>
                <label class="ss-field"><span>Description</span><input class="ss-input" data-role="save-preset-description" maxlength="500" placeholder="Optional description" /></label>
              </div>
              <div class="ss-muted ss-tiny">Only checked values are written to SwarmUI. Seed starts unchecked so a reusable preset does not freeze one composition by accident.</div>
              <div class="ss-save-param-list" data-role="save-preset-fields"></div>
            </div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-save-preset">Cancel</button><button class="ss-button ss-button-primary" data-action="confirm-save-preset">Save preset</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="preset-manager-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-preset-manager-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">SWARM PRESETS</span><strong id="ss-preset-manager-title">Manage presets</strong></div>
              <button class="ss-icon-button" data-action="close-preset-manager" aria-label="Close preset manager">×</button>
            </header>
            <div class="ss-workflow-modal-description">These are stored by SwarmUI. Deleting one removes it from this Swarm account and from Studio’s active preset stack.</div>
            <div class="ss-preset-manager-list" data-role="preset-manager-list"></div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button ss-button-primary" data-action="close-preset-manager">Done</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="move-folder-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-move-folder-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">OUTPUT LIBRARY</span><strong id="ss-move-folder-title">Move outputs</strong></div>
              <button class="ss-icon-button" data-action="close-move-folder" aria-label="Close move popup">×</button>
            </header>
            <div class="ss-workflow-modal-description" data-role="move-folder-description">Choose a destination.</div>
            <div class="ss-move-folder-list" data-role="move-folder-list"></div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-move-folder">Cancel</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="new-folder-modal" hidden>
          <section class="ss-workflow-modal-card ss-new-folder-card" role="dialog" aria-modal="true" aria-labelledby="ss-new-folder-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">OUTPUT LIBRARY</span><strong id="ss-new-folder-title">Create folder</strong></div>
              <button class="ss-icon-button" data-action="close-new-folder" aria-label="Close new folder popup">×</button>
            </header>
            <label class="ss-field"><span>Name</span><input class="ss-input" data-role="new-folder-name" maxlength="80" placeholder="Folder name" /></label>
            <div class="ss-new-folder-types">
              <label><input type="radio" name="ss-new-folder-type" data-role="new-folder-type" value="unbound" checked /><span><strong>Unbound</strong><small>A simple library folder.</small></span></label>
              <label><input type="radio" name="ss-new-folder-type" data-role="new-folder-type" value="character" /><span><strong>Character folder</strong><small>Reuse prompts and a LoRA stack anywhere this character is active.</small></span></label>
            </div>
            <p class="ss-muted ss-tiny" data-role="new-folder-chat-hint">Character folders follow the active character across conversations.</p>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-new-folder">Cancel</button><button class="ss-button ss-button-primary" data-action="confirm-new-folder">Create folder</button></footer>
          </section>
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
              <button class="ss-button" data-action="append-to-chat" disabled>Append to chat</button>
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

        <div class="ss-output-library" data-role="output-library" data-selection-mode="false" hidden>
          <header class="ss-library-head">
            <strong>Output library</strong>
            <span class="ss-muted ss-tiny">Lumiverse-owned Swarm Studio images and virtual folders</span>
            <button class="ss-icon-button" data-action="close-output-library" aria-label="Close output library">×</button>
          </header>
          <aside class="ss-library-folders" data-role="library-folders">
            <div class="ss-empty">Loading folders…</div>
          </aside>
          <main class="ss-library-main">
            <details class="ss-library-visual-profile" data-role="library-visual-profile" hidden>
              <summary><span><strong data-role="visual-profile-title">Character visuals</strong><small>Positive · negative · checkpoint · LoRA stack</small></span><span class="ss-library-visual-summary-meta"><span data-role="visual-profile-state">Active</span><span class="ss-library-visual-caret" aria-hidden="true">∨</span></span></summary>
              <div class="ss-library-visual-fields">
                <label class="ss-field"><span>Positive base</span><textarea class="ss-textarea" data-role="visual-positive" placeholder="Character identity and consistent visual tags…"></textarea></label>
                <label class="ss-field"><span>Negative base</span><textarea class="ss-textarea" data-role="visual-negative" placeholder="Things to consistently avoid…"></textarea></label>
                <label class="ss-field"><span>Checkpoint</span><select class="ss-select" data-role="visual-checkpoint"><option value="">Use current Studio checkpoint</option></select></label>
                <label class="ss-field"><span>Base LoRA stack</span><select class="ss-select" data-role="visual-stack"><option value="">No bound stack</option></select></label>
                <button class="ss-button ss-button-primary" data-action="save-visual-profile">Save visual binding</button>
              </div>
            </details>
            <div class="ss-library-selectbar">
              <button class="ss-icon-button ss-library-tool-icon" data-action="toggle-library-selection" title="Select outputs" aria-label="Select outputs">${CHECK_ICON}</button>
              <span class="ss-library-selection-count" data-role="library-selection-count">Select</span>
              <button class="ss-button ss-library-select-page" data-action="select-library-page" data-role="library-select-page" hidden>Select page</button>
              <div class="ss-library-selection-actions" data-role="library-selection-actions" hidden>
                <button class="ss-button" data-action="bulk-move-outputs">Move…</button>
                <button class="ss-button ss-button-danger" data-action="bulk-delete-outputs">Delete</button>
              </div>
            </div>
            <div class="ss-output-library-grid" data-role="library-grid">
              <div class="ss-empty">Loading outputs…</div>
            </div>
            <div class="ss-library-toolbar ss-library-currentbar">
              <strong class="ss-tiny" data-role="library-title">All outputs</strong>
              <span class="ss-muted ss-tiny" data-role="library-count">0 images</span>
              <label class="ss-library-search" data-role="library-search-wrap" hidden>
                <input class="ss-input" data-role="library-search" type="search" placeholder="Search prompts, model, LoRAs, presets…" aria-label="Search output metadata" />
              </label>
              <button class="ss-button" data-action="library-prev" disabled>‹</button>
              <span class="ss-history-page-label" data-role="library-page">1 / 1</span>
              <button class="ss-button" data-action="library-next" disabled>›</button>
              <button class="ss-icon-button ss-library-tool-icon" data-action="toggle-library-search" title="Search this folder" aria-label="Search this folder">${SEARCH_ICON}</button>
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
    const downloadUrl = this.get<HTMLInputElement>('[data-role="lora-download-url"]')
    downloadUrl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault()
        this.startManualLoraDownload()
      }
    })
    downloadUrl.addEventListener("dragover", (event) => event.preventDefault())
    downloadUrl.addEventListener("drop", (event) => {
      event.preventDefault()
      const value = event.dataTransfer?.getData("text/uri-list") || event.dataTransfer?.getData("text/plain") || ""
      if (value.trim()) downloadUrl.value = value.trim().split(/\r?\n/)[0]
    })
    for (const details of this.root.querySelectorAll<HTMLDetailsElement>("details.ss-advanced, details.ss-library-visual-profile")) {
      details.addEventListener("toggle", () => this.persistWorkspaceState())
    }
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
    this.get<HTMLInputElement>('[data-role="completion-toast"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        completionToast: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="widget-enabled"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        widgetEnabled: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="mobile-quick-create"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        mobileQuickCreate: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="tag-auto-generate"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        tagAutoGenerate: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="tag-prompt-injection"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        tagPromptInjection: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    const updateRequiredImageRange = () => {
      const range = normalizeRequiredImageRange(
        this.get<HTMLInputElement>('[data-role="required-image-min"]').value,
        this.get<HTMLInputElement>('[data-role="required-image-max"]').value,
      )
      this.onBehaviorChange({
        ...this.behavior,
        requiredImageMin: range.min,
        requiredImageMax: range.max,
      })
    }
    this.get<HTMLInputElement>('[data-role="required-image-min"]').addEventListener("change", updateRequiredImageRange)
    this.get<HTMLInputElement>('[data-role="required-image-max"]').addEventListener("change", updateRequiredImageRange)
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
    this.get<HTMLSelectElement>('[data-role="workflow-select"]').addEventListener("change", (event) => {
      this.selectWorkflow((event.currentTarget as HTMLSelectElement).value)
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
    this.get<HTMLInputElement>('[data-role="stack-import-file"]').addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement
      const file = input.files?.[0]
      input.value = ""
      if (file) void this.importStackFile(file)
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
    })

    this.root.addEventListener("pointerdown", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.beginResize(handle.dataset.resize || "", event)
    })
    this.root.addEventListener("dblclick", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.resetResize(handle.dataset.resize || "")
    })

    const scheduleProfileFromControl = (event: Event) => {
      const target = event.target as HTMLElement
      const role = target.dataset.role || ""
      if (
        /search|appearance|metadata-token|custom-css|library-output-check/.test(role)
        || target.closest('[data-role="config-popover"]')
      ) return
      this.scheduleStudioProfileSync()
    }
    this.root.addEventListener("input", scheduleProfileFromControl)
    this.root.addEventListener("change", scheduleProfileFromControl)

    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const libraryToggle = target.closest<HTMLInputElement>('[data-role="library-output-check"]')
      if (libraryToggle?.dataset.imageId) {
        this.setLibrarySelection(
          libraryToggle.dataset.imageId,
          libraryToggle.checked,
          event.shiftKey,
        )
        this.syncVisibleLibrarySelection()
        event.stopPropagation()
        return
      }
      if (!target.closest(".ss-config-wrap")) this.closeConfigPopover()
      if (!target.closest(".ss-history-card")) this.closeHistoryMenus()
      const button = target.closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (action === "refresh-metadata") this.refreshMetadata()
      if (action === "toggle-config") this.toggleConfigPopover(button)
      if (action === "copy-tag-protocol") void this.copyTagProtocol()
      if (action === "save-character-base-tags") this.saveCharacterBaseTags()
      if (action === "clear-character-base-tags") this.clearCharacterBaseTags()
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
      if (action === "random-seed-mobile") this.useRandomSeed()
      if (action === "toggle-size-link") this.toggleSizeLink()
      if (action === "open-workflow-setup") this.openWorkflowSetup()
      if (action === "close-workflow-setup") this.closeWorkflowSetup()
      if (action === "use-standard-workflow") {
        this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
        this.selectWorkflow("")
      }
      if (action === "use-current-init" || action === "use-as-init") void this.useCurrentAsInit()
      if (action === "pick-init") this.get<HTMLInputElement>('[data-role="init-file"]').click()
      if (action === "clear-init") this.clearInitImage()
      if (action === "toggle-lora-download") this.toggleLoraDownloader()
      if (action === "start-lora-download") this.startManualLoraDownload()
      if (action === "cancel-lora-download") this.cancelLoraDownload()
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
      if (action === "export-stack") this.exportStack()
      if (action === "import-stack") this.get<HTMLInputElement>('[data-role="stack-import-file"]').click()
      if (action === "apply-lumi-stack") void this.applyLumiverseStack()
      if (action === "close-missing-loras") this.closeMissingLoras()
      if (action === "copy-missing-loras") void this.copyMissingLoras()
      if (action === "download-missing-loras") this.downloadSelectedMissingLoras()
      if (action === "close-save-preset") this.closeSavePresetModal()
      if (action === "confirm-save-preset") this.confirmSavePreset()
      if (action === "open-preset-manager") this.openPresetManager()
      if (action === "close-preset-manager") this.closePresetManager()
      if (action === "delete-swarm-preset") this.deleteSwarmPreset(button.dataset.presetTitle || "")
      if (action === "close-move-folder") this.closeMoveFolderModal()
      if (action === "move-folder-choice") this.confirmMoveFolder(button.dataset.folderId || "")
      if (action === "edit-prompt") this.openPromptEditor(button.dataset.promptRole || "")
      if (action === "generate") this.generate()
      if (action === "interrupt-generation") this.interruptGeneration()
      if (action === "refresh-outputs") this.refreshOutputs()
      if (action === "history-prev") this.changeHistoryPage(-1)
      if (action === "history-next") this.changeHistoryPage(1)
      if (action === "download-output") this.downloadCurrent()
      if (action === "copy-output") void this.copyCurrentUrl()
      if (action === "append-to-chat") this.appendCurrentToChat()
      if (action === "inspect-output") this.openInspector()
      if (action === "close-inspector") this.closeInspector()
      if (action === "reuse-parameters") this.reuseCurrentParameters()
      if (action === "delete-output") this.deleteCurrentOutput()
      if (action === "open-output-library") this.openOutputLibrary()
      if (action === "close-output-library") this.closeOutputLibrary()
      if (action === "create-output-folder") this.openNewFolderModal()
      if (action === "close-new-folder") this.closeNewFolderModal()
      if (action === "confirm-new-folder") this.createOutputFolder()
      if (action === "delete-output-folder") this.deleteSelectedOutputFolder()
      if (action === "toggle-library-search") this.toggleLibrarySearch()
      if (action === "toggle-library-selection") this.toggleLibrarySelectionMode()
      if (action === "save-visual-profile") this.saveVisualProfile()
      if (action === "toggle-active-visual") this.toggleActiveVisualBinding()
      if (action === "toggle-active-persona-visual") this.toggleActivePersonaVisual()
      if (action === "library-prev") this.changeLibraryPage(-1)
      if (action === "library-next") this.changeLibraryPage(1)
      if (action === "select-library-page") this.toggleLibraryPageSelection()
      if (action === "bulk-move-outputs") this.bulkMoveOutputs()
      if (action === "bulk-delete-outputs") this.bulkDeleteOutputs()
      if (action === "preset-up") this.moveSelectedPreset(Number(button.dataset.presetIndex), -1)
      if (action === "preset-down") this.moveSelectedPreset(Number(button.dataset.presetIndex), 1)
      if (action === "preset-apply") this.applySelectedPreset(Number(button.dataset.presetIndex))
      if (action === "preset-remove") this.removeSelectedPreset(Number(button.dataset.presetIndex))
      if (action === "add-swarm-preset") this.openSavePresetModal()
      if (action === "move-library-output" && button.dataset.imageId) this.openMoveFolderModal([button.dataset.imageId])
      if (action === "library-folder") {
        this.libraryFolderId = button.dataset.folderId || ""
        this.libraryPage = 0
        this.librarySelectionAnchorId = ""
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

  private openPromptEditor(role: string): void {
    if (role !== "positive" && role !== "negative") return
    const input = this.get<HTMLTextAreaElement>(`[data-role="${role}"]`)
    this.send("open_text_editor", {
      editorId: `studio-${role}`,
      title: role === "positive" ? "Swarm Studio · Positive prompt" : "Swarm Studio · Negative prompt",
      value: input.value,
      placeholder: input.placeholder,
    })
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
        this.state.chatVisuals = data.chatVisuals || null
        this.acceptCharacterBaseTags(data.characterBaseTags)
        this.renderPermissions()
        this.populateConnections()
        this.renderOutputs()
        this.renderStackPresets()
        this.hydrateActiveVisualStack()
        this.updateActiveVisualPill()
        this.updateActivePersonaVisualPill()
        break
      case "chat_visuals_result":
        this.state.chatVisuals = data as ChatVisualsState
        this.state.outputFolders = data.characterFolder
          ? [
              ...this.state.outputFolders.filter((folder) => folder.id !== data.characterFolder.id),
              data.characterFolder,
            ]
          : this.state.outputFolders
        this.state.stackPresets = Array.isArray(data.stackPresets) ? data.stackPresets : this.state.stackPresets
        this.renderStackPresets()
        this.hydratedVisualCharacterId = ""
        this.hydrateActiveVisualStack(true)
        this.updateActiveVisualPill()
        this.updateActivePersonaVisualPill()
        this.updateTriggerSummary()
        break
      case "character_base_tags_result":
        this.acceptCharacterBaseTags(data)
        this.setRunStatus(
          this.state.characterBaseTags.source === "studio"
            ? `Saved base tags for ${this.state.characterBaseTags.characterName || "this character"}.`
            : this.state.characterBaseTags.source === "lumiverse"
              ? "Studio tags cleared; using Lumiverse's native base tags as a fallback."
              : "Character base tags cleared.",
        )
        break
      case "connection_result":
        if (payload.requestId !== this.connectionRequestId) return
        this.acceptConnectionData(data)
        this.send("get_lora_download_status")
        this.applyPendingTaggedPrompt()
        this.setRunStatus(data.metadataError ? "Ready — LoRA metadata needs attention." : "Ready.")
        this.scheduleStudioProfileSync()
        break
      case "metadata_result":
        this.state.loras = Array.isArray(data.loras) ? data.loras : []
        this.state.stack = this.state.stack.map((item) => ({
          ...item,
          lora: this.installedLora(item.lora.name) || item.lora,
        }))
        this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))
        this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : this.state.checkpoints
        this.acceptSwarmOptions(data.swarmOptions)
        this.showMetadataError(data.metadataError || "")
        this.updateFamilyChip()
        this.renderLoras()
        this.renderStack()
        if (!this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden) {
          if (this.missingLoras.length) this.showMissingLoras()
          else this.closeMissingLoras()
        }
        this.setRunStatus(`Metadata refreshed: ${this.state.loras.length} LoRAs.`)
        this.setConnectionStatus("ready")
        break
      case "lora_download_status": {
        const jobId = String(data.id || "")
        if (!jobId) break
        const status = String(data.status || "")
        const active = data.active === true
        const progress = Number.isFinite(Number(data.overallProgress)) ? Number(data.overallProgress) : 0
        const error = String(data.error || "")
        const message = [String(data.message || ""), error].filter(Boolean).join(" ")
        this.loraDownloadJobId = jobId
        this.loraDownloadActive = active
        if (active) this.toggleLoraDownloader(true, false)
        this.setLoraDownloadStatus(message, status === "failed", progress)
        if (status === "complete" && this.handledLoraDownloadJobId !== jobId) {
          this.get<HTMLInputElement>('[data-role="lora-download-url"]').value = ""
          this.get<HTMLInputElement>('[data-role="lora-download-name"]').value = ""
          if (this.state.connection?.id === String(data.connectionId || "")) {
            this.handledLoraDownloadJobId = jobId
            this.send("refresh_metadata", { connectionId: this.state.connection.id })
          }
        }
        break
      }
        break
      case "preview_result":
        if (payload?.name && payload?.dataUrl) {
          this.previewCache.set(payload.name, payload.dataUrl)
          this.updatePreviewImages(payload.name, payload.dataUrl)
        }
        break
      case "text_editor_result": {
        const editorId = String(data.editorId || "")
        if (!editorId.startsWith("studio-") || data.cancelled === true) break
        const role = editorId.slice(7)
        if (role !== "positive" && role !== "negative") break
        this.get<HTMLTextAreaElement>(`[data-role="${role}"]`).value = String(data.text || "")
        this.activity?.captureDraft(this.exportDraft())
        break
      }
      case "swarm_output_download": {
        const dataUrl = String(data.dataUrl || "")
        if (!dataUrl.startsWith("data:image/")) {
          this.setRunStatus("SwarmUI did not return a downloadable image.", true)
          break
        }
        const anchor = document.createElement("a")
        anchor.href = dataUrl
        anchor.download = String(data.filename || `swarm-output-${Date.now()}.png`)
          .replace(/[^a-z0-9_.-]+/gi, "-")
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        this.setRunStatus("Downloaded the original SwarmUI output with embedded metadata.")
        break
      }
      case "swarm_workflow_result":
        if (payload.requestId !== this.workflowRequestId) break
        this.workflowRequestId = ""
        this.state.selectedWorkflow = data as SwarmWorkflowDetails
        this.initializeWorkflowValues(this.state.selectedWorkflow)
        if (this.pendingWorkflowRestore?.name === this.state.selectedWorkflow.name) {
          for (const [key, value] of Object.entries(this.pendingWorkflowRestore.values)) {
            this.workflowValues.set(key, value)
          }
          this.workflowEnabled.clear()
          for (const key of this.pendingWorkflowRestore.enabled) this.workflowEnabled.add(key)
          this.workflowImageValues.clear()
          for (const [key, value] of Object.entries(this.pendingWorkflowRestore.images)) {
            this.workflowImageValues.set(key, value)
          }
        }
        this.pendingWorkflowRestore = null
        this.renderWorkflowControls()
        if (this.workflowOpenOnLoad) this.openWorkflowSetup()
        this.workflowOpenOnLoad = true
        this.setRunStatus(`Loaded workflow “${this.state.selectedWorkflow.name}”.`)
        break
      case "generation_started":
        if (!this.currentJobId || payload.clientJobId === this.currentJobId) {
          this.generating = true
          this.currentJobId = String(payload.clientJobId || this.currentJobId)
          this.currentJobConnectionId = String(data.connectionId || this.currentJobConnectionId)
          this.setGenerating(true)
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
        this.currentJobConnectionId = ""
        this.setGenerating(false)
        this.acceptOutputPage(data)
        if (Array.isArray(data.outputFolders)) this.state.outputFolders = data.outputFolders
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
        this.updateActiveVisualPill()
        this.setRunStatus("Generation complete. Output saved to Lumiverse.")
        break
      case "tagged_generation_result": {
        this.acceptOutputPage(data)
        if (Array.isArray(data.outputFolders)) this.state.outputFolders = data.outputFolders
        const imageSrc = String(data.result?.imageDataUrl || data.result?.imageUrl || data.record?.imageUrl || "")
        if (imageSrc) {
          this.setCurrentImage({
            id: data.result?.imageId || data.record?.imageId,
            src: imageSrc,
            url: data.result?.imageUrl || data.record?.imageUrl || imageSrc,
            label: `${data.result?.model || data.record?.model || "SwarmUI"} · message illustration`,
            details: data.record || null,
          })
        }
        this.renderOutputs()
        this.updateActiveVisualPill()
        this.setRunStatus("Message illustration complete. Output synced to Studio.")
        break
      }
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
          this.currentJobConnectionId = ""
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
      case "swarm_preset_deleted": {
        const title = String(data.title || "")
        this.state.selectedPresets = this.state.selectedPresets.filter((preset) => preset.title !== title)
        this.acceptSwarmOptions(data.swarmOptions)
        this.renderPresetManager()
        this.setRunStatus(`Deleted Swarm preset “${title}”.`)
        break
      }
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
        this.updateActiveVisualPill()
        this.renderOutputLibrary()
        break
      case "output_folders_result":
        this.state.outputFolders = Array.isArray(data) ? data : []
        if (this.pendingCreatedFolder) {
          const pending = this.pendingCreatedFolder
          const created = pending.bindingType === "character"
            ? this.activeVisualFolder()
            : this.state.outputFolders.find((folder) => folder.name.toLowerCase() === pending.name.toLowerCase())
          if (created) this.libraryFolderId = created.id
          this.pendingCreatedFolder = null
        }
        this.librarySelection.clear()
        this.librarySelectionMode = false
        this.renderOutputLibrary()
        this.updateActiveVisualPill()
        this.setRunStatus("Output folders updated.")
        break
      case "output_appended_to_chat":
        this.setRunStatus(`Appended “${data.label || "output"}” to the active Lumiverse chat.`)
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
        this.hydrateActiveVisualStack()
        if (!this.get<HTMLElement>('[data-role="output-library"]').hidden) this.renderOutputLibrary()
        this.updateActiveVisualPill()
        this.setRunStatus("Saved LoRA stacks updated.")
        break
      case "studio_error":
        if (payload.operation === "start_lora_download") {
          this.loraDownloadRequestId = ""
          this.loraDownloadActive = false
          this.setLoraDownloadStatus(payload.error || "SwarmUI could not start that download.", true)
        }
        if (payload.operation === "create_output_folder") this.pendingCreatedFolder = null
        if (payload.operation === "load_swarm_workflow") {
          this.workflowRequestId = ""
          this.state.selectedWorkflow = null
          this.workflowValues.clear()
          this.workflowEnabled.clear()
          this.workflowImageValues.clear()
          this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
          this.renderWorkflowControls()
        }
        if (payload.operation === "generate") {
          this.generating = false
          this.currentJobId = ""
          this.currentJobConnectionId = ""
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
    this.currentJobConnectionId = ""
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
    if (!this.state.permissions.chatMutation) missing.push("Chat Mutation (append outputs to chat)")
    const banner = this.get<HTMLElement>('[data-role="permission-banner"]')
    banner.dataset.visible = String(missing.length > 0)
    banner.textContent = missing.length
      ? `Grant these extension permissions in Lumiverse for the complete studio: ${missing.join(", ")}.`
      : ""
    this.updateAppendControls()
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
    const preferred = this.state.connections.find((item) => item.id === this.pendingDraftRestore?.connectionId)
      || this.state.connections.find((item) => item.is_default)
      || this.state.connections[0]
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
    this.state.swarmWorkflows = []
    this.state.workflowError = ""
    this.state.selectedWorkflow = null
    this.workflowRequestId = ""
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
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
    this.populateWorkflowSelect()
    this.renderWorkflowControls()
    this.connectionRequestId = this.send("load_connection", { connectionId })
  }

  private acceptConnectionData(data: any): void {
    this.state.connection = data.connection || this.state.connection
    this.state.models = Array.isArray(data.models) ? data.models : []
    this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : []
    this.state.loras = Array.isArray(data.loras) ? data.loras : []
    this.state.stack = this.state.stack.map((item) => ({
      ...item,
      lora: this.installedLora(item.lora.name) || item.lora,
    }))
    this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))
    this.state.hasMetadataToken = Boolean(data.hasMetadataToken)
    this.acceptSwarmOptions(data.swarmOptions)
    this.populateModels()
    this.applyConnectionDefaults()
    if (this.pendingDraftRestore && (!this.pendingDraftRestore.connectionId || this.pendingDraftRestore.connectionId === this.state.connection?.id)) {
      const draft = this.pendingDraftRestore
      this.pendingDraftRestore = null
      this.restoreDraft(draft)
    }
    this.hydrateActiveVisualStack(true)
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
    this.state.swarmWorkflows = Array.isArray(value?.workflows) ? value.workflows : []
    this.state.workflowError = String(value?.workflowError || "")
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
    const managePresets = this.get<HTMLButtonElement>('[data-role="manage-swarm-presets"]')
    managePresets.hidden = !this.state.canManagePresets
    managePresets.disabled = !this.state.swarmPresets.length
    managePresets.title = !this.state.canManagePresets
      ? "Your SwarmUI account cannot manage presets."
      : this.state.swarmPresets.length
        ? "Rename or delete SwarmUI presets"
        : "No SwarmUI presets to manage yet"
    this.populateWorkflowSelect()
    this.renderPresetStack()
  }

  private populateWorkflowSelect(): void {
    const select = this.get<HTMLSelectElement>('[data-role="workflow-select"]')
    const selectedName = this.state.selectedWorkflow?.name || ""
    select.replaceChildren()
    const standard = element("option", "", "Standard Swarm generation")
    standard.value = ""
    select.appendChild(standard)
    for (const workflow of this.state.swarmWorkflows) {
      const option = element("option", "", workflow.name)
      option.value = workflow.name
      option.title = workflow.description || "Saved Swarm Comfy workflow"
      select.appendChild(option)
    }
    if (selectedName && this.state.swarmWorkflows.some((workflow) => workflow.name === selectedName)) {
      select.value = selectedName
    } else {
      if (selectedName) {
        this.state.selectedWorkflow = null
        this.workflowValues.clear()
        this.workflowEnabled.clear()
        this.workflowImageValues.clear()
      }
      select.value = ""
    }
    this.renderWorkflowControls()
  }

  private selectWorkflow(name: string, openOnLoad = true, restore: WorkflowDraft | null = null): void {
    this.workflowRequestId = ""
    this.workflowOpenOnLoad = openOnLoad
    this.pendingWorkflowRestore = restore
    this.state.selectedWorkflow = null
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
    if (!name) {
      this.pendingWorkflowRestore = null
      this.workflowOpenOnLoad = true
      this.closeWorkflowSetup()
      this.renderWorkflowControls()
      this.setRunStatus("Using Swarm’s standard generation pipeline.")
      return
    }
    if (!this.state.connection || !this.state.swarmWorkflows.some((workflow) => workflow.name === name)) {
      this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
      this.renderWorkflowControls()
      return
    }
    const summary = this.state.swarmWorkflows.find((workflow) => workflow.name === name)!
    const badge = this.get<HTMLElement>('[data-role="workflow-badge"]')
    badge.dataset.active = "true"
    badge.textContent = "Loading…"
    this.get<HTMLElement>('[data-role="workflow-description"]').textContent = summary.description || "Loading workflow controls from SwarmUI…"
    this.get<HTMLElement>('[data-role="workflow-modal-title"]').textContent = summary.name
    this.get<HTMLElement>('[data-role="workflow-modal-description"]').textContent = summary.description || "Loading exposed workflow parameters from SwarmUI…"
    const fields = this.get<HTMLElement>('[data-role="workflow-fields"]')
    fields.replaceChildren(element("div", "ss-workflow-loading", "Reading exposed workflow parameters…"))
    this.workflowRequestId = this.send("load_swarm_workflow", {
      connectionId: this.state.connection.id,
      name,
    })
  }

  private initializeWorkflowValues(workflow: SwarmWorkflowDetails): void {
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
    for (const parameter of workflow.parameters) {
      if (parameter.default !== undefined && parameter.default !== null) {
        this.workflowValues.set(parameter.id, parameter.default)
      }
      if (parameter.toggleable) this.workflowEnabled.add(parameter.id)
    }
  }

  private renderWorkflowControls(): void {
    const workflow = this.state.selectedWorkflow
    const badge = this.get<HTMLElement>('[data-role="workflow-badge"]')
    const description = this.get<HTMLElement>('[data-role="workflow-description"]')
    const configure = this.get<HTMLButtonElement>('[data-action="open-workflow-setup"]')
    const modalTitle = this.get<HTMLElement>('[data-role="workflow-modal-title"]')
    const modalDescription = this.get<HTMLElement>('[data-role="workflow-modal-description"]')
    const root = this.get<HTMLElement>('[data-role="workflow-fields"]')
    root.replaceChildren()
    if (!workflow) {
      configure.disabled = true
      modalTitle.textContent = "Workflow setup"
      modalDescription.textContent = "Select a saved SwarmUI workflow to edit the controls its author exposed."
      badge.dataset.active = "false"
      badge.textContent = "Native"
      description.textContent = this.state.workflowError
        ? `Standard generation. Saved workflows unavailable: ${this.state.workflowError}`
        : "Use Swarm’s normal parameter pipeline, or select a saved Comfy workflow exposed to its Generate tab."
      return
    }

    configure.disabled = false
    modalTitle.textContent = workflow.name
    badge.dataset.active = "true"
    const customParameters = workflow.parameters.filter((parameter) => parameter.visible && !isWorkflowCoreParameter(parameter.id))
    badge.textContent = `Comfy · ${customParameters.length} extra`
    description.textContent = workflow.description
      || "Studio’s normal controls feed the recognized workflow inputs; workflow-specific inputs appear below."
    modalDescription.textContent = workflow.description
      || "Studio’s normal controls feed recognized roles. Only workflow-specific controls are listed below."

    if (!customParameters.length) {
      root.appendChild(element("div", "ss-empty", "This workflow uses Studio’s existing prompt and generation controls."))
      return
    }

    const groups = new Map<string, { group: SwarmWorkflowGroup | null; parameters: SwarmWorkflowParameter[] }>()
    for (const parameter of customParameters) {
      const key = parameter.group?.id || (parameter.advanced ? "__advanced" : "__workflow")
      const current = groups.get(key) || { group: parameter.group, parameters: [] }
      current.parameters.push(parameter)
      groups.set(key, current)
    }
    for (const [key, entry] of groups) {
      const details = element("details", "ss-workflow-group")
      details.open = entry.group?.open === true || (!entry.group?.advanced && key !== "__advanced")
      const summary = element(
        "summary",
        "",
        entry.group?.name || (key === "__advanced" ? "Advanced workflow controls" : "Workflow controls"),
      )
      details.appendChild(summary)
      if (entry.group?.description) {
        details.appendChild(element("p", "ss-workflow-group-description", entry.group.description))
      }
      const grid = element("div", "ss-workflow-field-grid")
      for (const parameter of entry.parameters) grid.appendChild(this.createWorkflowField(parameter))
      details.appendChild(grid)
      root.appendChild(details)
    }
  }

  private openWorkflowSetup(): void {
    if (!this.state.selectedWorkflow) return
    const modal = this.get<HTMLElement>('[data-role="workflow-modal"]')
    modal.hidden = false
    requestAnimationFrame(() => modal.querySelector<HTMLButtonElement>('[data-action="close-workflow-setup"]')?.focus())
  }

  private closeWorkflowSetup(): void {
    const modal = this.root.querySelector<HTMLElement>('[data-role="workflow-modal"]')
    if (modal) modal.hidden = true
  }

  private createWorkflowField(parameter: SwarmWorkflowParameter): HTMLElement {
    const field = element("div", "ss-workflow-field")
    const wide = parameter.type === "image" || parameter.viewType === "prompt" || parameter.viewType === "big"
    field.dataset.wide = String(wide)
    field.dataset.enabled = String(!parameter.toggleable || this.workflowEnabled.has(parameter.id))
    const head = element("div", "ss-workflow-field-head")
    const label = element("label", "", parameter.name || parameter.id)
    label.title = parameter.description || parameter.id
    head.appendChild(label)
    if (parameter.toggleable) {
      const toggle = element("input", "ss-workflow-toggle")
      toggle.type = "checkbox"
      toggle.checked = this.workflowEnabled.has(parameter.id)
      toggle.title = `Include ${parameter.name || parameter.id}`
      toggle.setAttribute("aria-label", toggle.title)
      toggle.addEventListener("change", () => {
        if (toggle.checked) this.workflowEnabled.add(parameter.id)
        else this.workflowEnabled.delete(parameter.id)
        field.dataset.enabled = String(toggle.checked)
      })
      head.appendChild(toggle)
    }
    field.appendChild(head)

    const currentValue = this.workflowValues.get(parameter.id) ?? parameter.default ?? ""
    const type = parameter.type.toLowerCase()
    if (type === "image") {
      const input = element("input", "ss-input")
      input.type = "file"
      input.accept = "image/*"
      input.addEventListener("change", () => {
        const file = input.files?.[0]
        if (!file) {
          this.workflowImageValues.delete(parameter.id)
          return
        }
        if (!file.type.startsWith("image/") || file.size > 4_000_000) {
          input.value = ""
          this.workflowImageValues.delete(parameter.id)
          this.setRunStatus("Workflow images must be image files under 4 MB.", true)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          this.workflowImageValues.set(parameter.id, String(reader.result || ""))
          this.setRunStatus(`Workflow image ready · ${file.name}`)
        }
        reader.onerror = () => this.setRunStatus(`Could not read ${file.name}.`, true)
        reader.readAsDataURL(file)
      })
      field.appendChild(input)
    } else if ((type === "dropdown" || type === "model") && parameter.values.length) {
      const select = element("select", "ss-select")
      const choices = parameter.values.map((value) => String(Array.isArray(value) ? value[0] : value))
      const defaultString = String(currentValue)
      if (defaultString && !choices.includes(defaultString)) choices.unshift(defaultString)
      for (const choice of choices) {
        const option = element("option", "", choice)
        option.value = choice
        select.appendChild(option)
      }
      select.value = defaultString || choices[0] || ""
      this.workflowValues.set(parameter.id, select.value)
      select.addEventListener("change", () => this.workflowValues.set(parameter.id, select.value))
      field.appendChild(select)
    } else if (type === "boolean") {
      const input = element("input")
      input.type = "checkbox"
      input.checked = currentValue === true || String(currentValue).toLowerCase() === "true"
      this.workflowValues.set(parameter.id, input.checked)
      input.addEventListener("change", () => this.workflowValues.set(parameter.id, input.checked))
      field.appendChild(input)
    } else if (type === "integer" || type === "decimal") {
      const input = element("input", "ss-input")
      input.type = "number"
      if (parameter.min !== null) input.min = String(parameter.min)
      if (parameter.max !== null) input.max = String(parameter.max)
      input.step = String(parameter.step && parameter.step > 0 ? parameter.step : type === "integer" ? 1 : .01)
      input.value = Number.isFinite(Number(currentValue)) ? String(currentValue) : "0"
      this.workflowValues.set(parameter.id, Number(input.value))
      input.addEventListener("input", () => {
        const value = Number(input.value)
        if (Number.isFinite(value)) this.workflowValues.set(parameter.id, type === "integer" ? Math.trunc(value) : value)
      })
      field.appendChild(input)
    } else if (parameter.viewType === "prompt" || parameter.viewType === "big") {
      const input = element("textarea", "ss-textarea")
      input.value = String(currentValue)
      input.addEventListener("input", () => this.workflowValues.set(parameter.id, input.value))
      field.appendChild(input)
    } else {
      const input = element("input", "ss-input")
      input.value = String(currentValue)
      input.addEventListener("input", () => this.workflowValues.set(parameter.id, input.value))
      field.appendChild(input)
    }
    if (parameter.description) field.appendChild(element("div", "ss-field-help", parameter.description))
    return field
  }

  private workflowRawOverrides(): Record<string, unknown> {
    const workflow = this.state.selectedWorkflow
    if (!workflow) return {}
    const result: Record<string, unknown> = { comfyuicustomworkflow: workflow.name }
    for (const parameter of workflow.parameters) {
      if (!parameter.visible || isWorkflowCoreParameter(parameter.id)) continue
      if (parameter.toggleable && !this.workflowEnabled.has(parameter.id)) continue
      if (parameter.type === "image") {
        const imageValue = this.workflowImageValues.get(parameter.id)
        if (imageValue) result[parameter.id] = imageValue
        continue
      }
      let value = this.workflowValues.get(parameter.id)
      if (typeof value === "string") value = value.slice(0, 65_536)
      if (typeof value === "number") {
        if (!Number.isFinite(value)) continue
        if (parameter.min !== null) value = Math.max(parameter.min, value)
        if (parameter.max !== null) value = Math.min(parameter.max, value)
        if (parameter.type === "integer") value = Math.trunc(value)
      }
      if (value !== undefined && value !== null) result[parameter.id] = value
    }
    return result
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

  private buildCurrentPresetParamMap(): Record<string, string> {
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
    const enabledLoras = this.state.stack.filter((item) => item.enabled)
    if (enabledLoras.length) {
      add("loras", JSON.stringify(enabledLoras.map((item) => item.lora.name)))
      add("loraweights", JSON.stringify(enabledLoras.map((item) => clamp(Number(item.weight) || 1, -10, 10))))
    }
    if (this.state.selectedWorkflow) add("comfyuicustomworkflow", this.state.selectedWorkflow.name)
    return paramMap
  }

  private openSavePresetModal(): void {
    if (!this.state.connection || !this.state.canManagePresets || !this.state.swarmParameters.length) return
    this.pendingPresetParamMap = this.buildCurrentPresetParamMap()
    if (!Object.keys(this.pendingPresetParamMap).length) {
      this.setRunStatus("SwarmUI's schema did not expose any of Studio's current controls.", true)
      return
    }
    this.get<HTMLInputElement>('[data-role="save-preset-name"]').value = ""
    this.get<HTMLInputElement>('[data-role="save-preset-description"]').value = ""
    const fields = this.get<HTMLElement>('[data-role="save-preset-fields"]')
    fields.replaceChildren()
    const schemaById = new Map(this.state.swarmParameters.map((parameter) => [parameter.id, parameter]))
    for (const [id, value] of Object.entries(this.pendingPresetParamMap)) {
      const parameter = schemaById.get(id)
      const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, "")
      const label = element("label", "ss-save-param")
      const checkbox = element("input")
      checkbox.type = "checkbox"
      checkbox.checked = normalized !== "seed"
      checkbox.dataset.role = "save-preset-param"
      checkbox.dataset.paramId = id
      const copy = element("span", "ss-save-param-copy")
      copy.append(
        element("strong", "", parameter?.name || id),
        element("span", "", String(value).length > 120 ? `${String(value).slice(0, 117)}…` : String(value)),
      )
      label.append(checkbox, copy)
      fields.appendChild(label)
    }
    this.get<HTMLElement>('[data-role="save-preset-modal"]').hidden = false
    this.get<HTMLInputElement>('[data-role="save-preset-name"]').focus()
  }

  private closeSavePresetModal(): void {
    this.get<HTMLElement>('[data-role="save-preset-modal"]').hidden = true
    this.pendingPresetParamMap = {}
  }

  private openPresetManager(): void {
    if (!this.state.connection || !this.state.canManagePresets) return
    this.renderPresetManager()
    this.get<HTMLElement>('[data-role="preset-manager-modal"]').hidden = false
  }

  private closePresetManager(): void {
    this.get<HTMLElement>('[data-role="preset-manager-modal"]').hidden = true
  }

  private renderPresetManager(): void {
    const list = this.get<HTMLElement>('[data-role="preset-manager-list"]')
    list.replaceChildren()
    if (!this.state.swarmPresets.length) {
      list.appendChild(element("div", "ss-empty", "No SwarmUI presets on this connection."))
      return
    }
    for (const preset of this.state.swarmPresets) {
      const row = element("div", "ss-preset-manager-row")
      const copy = element("div", "ss-preset-manager-copy")
      copy.append(
        element("strong", "", preset.title),
        element("span", "", preset.description || "No description"),
      )
      const remove = element("button", "ss-button ss-button-danger", "Delete")
      remove.dataset.action = "delete-swarm-preset"
      remove.dataset.presetTitle = preset.title
      remove.title = `Delete ${preset.title} from SwarmUI`
      row.append(copy, remove)
      list.appendChild(row)
    }
  }

  private deleteSwarmPreset(title: string): void {
    const preset = this.state.swarmPresets.find((candidate) => candidate.title === title)
    if (!preset || !this.state.connection || !this.state.canManagePresets) return
    if (!window.confirm(`Delete Swarm preset “${preset.title}”? This cannot be undone.`)) return
    this.send("delete_swarm_preset", {
      connectionId: this.state.connection.id,
      title: preset.title,
    })
    this.setRunStatus(`Deleting Swarm preset “${preset.title}”…`)
  }

  private confirmSavePreset(): void {
    if (!this.state.connection || !this.state.canManagePresets) return
    const title = this.get<HTMLInputElement>('[data-role="save-preset-name"]').value.trim()
    if (!title) {
      this.setRunStatus("Give the Swarm preset a name first.", true)
      return
    }
    const description = this.get<HTMLInputElement>('[data-role="save-preset-description"]').value.trim()
    const paramMap: Record<string, string> = {}
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="save-preset-param"]')) {
      const id = input.dataset.paramId || ""
      if (input.checked && id && this.pendingPresetParamMap[id] !== undefined) paramMap[id] = this.pendingPresetParamMap[id]
    }
    if (!Object.keys(paramMap).length) {
      this.setRunStatus("Choose at least one value to save in the preset.", true)
      return
    }
    this.send("add_swarm_preset", {
      connectionId: this.state.connection.id,
      title,
      description,
      paramMap,
    })
    this.closeSavePresetModal()
    this.setRunStatus(`Saving SwarmUI preset “${title}”…`)
  }

  private applySelectedPreset(index: number): void {
    const selected = this.state.selectedPresets[index]
    const preset = selected && this.state.swarmPresets.find((candidate) => candidate.title === selected.title)
    if (!preset) return
    const normalized = new Map(
      Object.entries(preset.paramMap).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), { key, value }]),
    )
    const take = (...ids: string[]): string => {
      for (const id of ids) {
        const value = normalized.get(id.toLowerCase().replace(/[^a-z0-9]/g, ""))?.value
        if (value !== undefined) return String(value)
      }
      return ""
    }
    const setInput = (role: string, value: string) => {
      if (!value) return
      this.get<HTMLInputElement>(`[data-role="${role}"]`).value = value
    }
    const setSelect = (role: string, value: string) => {
      if (!value) return
      const select = this.get<HTMLSelectElement>(`[data-role="${role}"]`)
      if (![...select.options].some((option) => option.value === value)) {
        const option = element("option", "", `${value} · preset`)
        option.value = value
        select.appendChild(option)
      }
      select.value = value
    }
    setInput("positive", take("prompt"))
    setInput("negative", take("negativeprompt", "negative_prompt"))
    setSelect("model", take("model"))
    setInput("width", take("width"))
    setInput("height", take("height"))
    setInput("steps", take("steps"))
    setInput("cfg", take("cfgscale", "cfg"))
    setInput("seed", take("seed"))
    setSelect("sampler", take("sampler"))
    setSelect("scheduler", take("scheduler"))
    setInput("vae", take("vae", "automaticvae"))
    setInput("unet", take("refinermodel", "unet"))

    const extracted = lorasFromSwarmPreset(preset.paramMap)
    for (const candidate of extracted) {
      const installed = this.installedLora(candidate.name)
      const existing = this.state.stack.find((item) => this.sameLoraName(item.lora.name, candidate.name))
      if (existing) {
        if (installed) existing.lora = installed
        existing.weight = candidate.weight
        existing.enabled = true
      } else {
        const lora = installed || manualLora(candidate.name)
        this.state.stack.push({ lora, weight: candidate.weight, enabled: true, useTrigger: false })
      }
    }
    this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))

    const handled = new Set([
      "prompt", "negativeprompt", "model", "width", "height", "steps", "cfgscale", "cfg", "seed",
      "sampler", "scheduler", "vae", "automaticvae", "refinermodel", "unet", "loras", "loraweights",
    ])
    let raw: Record<string, unknown> = {}
    try {
      raw = JSON.parse(this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value || "{}")
    } catch {
      raw = {}
    }
    for (const [key, value] of Object.entries(preset.paramMap)) {
      if (!handled.has(key.toLowerCase().replace(/[^a-z0-9]/g, ""))) raw[key] = value
    }
    this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value = Object.keys(raw).length ? JSON.stringify(raw, null, 2) : ""
    this.state.selectedPresets.splice(index, 1)
    this.get<HTMLSelectElement>('[data-role="aspect"]').value = "custom"
    this.renderPresetStack()
    this.renderStack()
    this.renderLoras()
    this.updatePreviewAspect(
      numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
      numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
    )
    this.updateContextControls()
    this.setRunStatus(`Applied “${preset.title}” to Studio and removed it from the preset stack${extracted.length ? ` · ${extracted.length} LoRA${extracted.length === 1 ? "" : "s"} moved into the LoRA stack` : ""}.`)
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
      const apply = element("button", "ss-button ss-preset-apply", "Apply")
      apply.dataset.action = "preset-apply"
      apply.dataset.presetIndex = String(index)
      apply.disabled = !metadata
      apply.title = "Apply these values to Studio, then remove this preset to prevent duplicate LoRA weights"
      const remove = element("button", "ss-icon-button ss-button-danger", "×")
      remove.dataset.action = "preset-remove"
      remove.dataset.presetIndex = String(index)
      remove.title = "Remove preset"
      row.append(toggle, name, up, down, apply, remove)
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
      negativePrompt: this.finalNegativePrompt(),
      presets: titles,
    }
  }

  private updateResolvedPresetSummary(): void {
    const status = this.get<HTMLElement>('[data-role="preset-resolved"]')
    const pill = this.get<HTMLElement>('[data-role="active-preset-pill"]')
    const enabled = this.state.selectedPresets.filter((preset) => preset.enabled)
    if (!enabled.length) {
      status.textContent = "No enabled Swarm presets; prompts pass through unchanged."
      pill.hidden = true
      pill.textContent = ""
      return
    }
    pill.hidden = false
    pill.textContent = enabled.length === 1 ? enabled[0].title : `${enabled.length} presets`
    pill.title = enabled.map((preset) => preset.title).join(" → ")
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

  private async copyTagProtocol(): Promise<void> {
    try {
      await navigator.clipboard.writeText(SWARM_IMAGE_PROTOCOL_EXAMPLE)
      this.setRunStatus("Swarm image-tag protocol copied.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private acceptCharacterBaseTags(value: any): void {
    const source = value?.source === "studio" || value?.source === "lumiverse"
      ? value.source
      : "none"
    this.state.characterBaseTags = {
      characterId: String(value?.characterId || ""),
      characterName: String(value?.characterName || ""),
      tags: String(value?.tags || ""),
      source,
    }
    const editor = this.root.querySelector<HTMLElement>('[data-role="character-base-tags-editor"]')
    const input = this.root.querySelector<HTMLTextAreaElement>('[data-role="character-base-tags"]')
    const status = this.root.querySelector<HTMLElement>('[data-role="character-base-tags-status"]')
    const canEdit = Boolean(this.state.characterBaseTags.characterId && this.state.permissions?.characters !== false)
    if (editor) editor.setAttribute("aria-disabled", String(!canEdit))
    if (input) {
      input.disabled = !canEdit
      input.value = this.state.characterBaseTags.tags
    }
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(
      '[data-action="save-character-base-tags"], [data-action="clear-character-base-tags"]',
    )) button.disabled = !canEdit
    if (status) {
      status.textContent = !canEdit
        ? "Open a character chat"
        : this.state.characterBaseTags.source === "studio"
          ? `${this.state.characterBaseTags.characterName || "Character"} · Studio`
          : this.state.characterBaseTags.source === "lumiverse"
            ? `${this.state.characterBaseTags.characterName || "Character"} · Lumiverse fallback`
            : `${this.state.characterBaseTags.characterName || "Character"} · not set`
    }
  }

  private saveCharacterBaseTags(): void {
    const state = this.state.characterBaseTags
    if (!state.characterId) {
      this.setRunStatus("Open a character chat before saving base tags.", true)
      return
    }
    const tags = this.get<HTMLTextAreaElement>('[data-role="character-base-tags"]').value
    this.send("set_character_base_tags", { characterId: state.characterId, tags })
    this.setRunStatus(`Saving base tags for ${state.characterName || "this character"}…`)
  }

  private clearCharacterBaseTags(): void {
    const state = this.state.characterBaseTags
    if (!state.characterId) return
    this.get<HTMLTextAreaElement>('[data-role="character-base-tags"]').value = ""
    this.send("set_character_base_tags", { characterId: state.characterId, tags: "" })
    this.setRunStatus(`Clearing Studio base tags for ${state.characterName || "this character"}…`)
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

  private toggleLoraDownloader(force?: boolean, focus = true): void {
    const search = this.get<HTMLInputElement>('[data-role="lora-search"]')
    const entry = this.get<HTMLElement>('[data-role="lora-download-entry"]')
    const shouldOpen = force ?? entry.hidden
    if (!shouldOpen && this.loraDownloadActive) {
      this.cancelLoraDownload()
      return
    }
    entry.hidden = !shouldOpen
    search.hidden = shouldOpen
    entry.closest(".ss-library-tools")?.classList.toggle("ss-download-open", shouldOpen)
    const toggle = this.get<HTMLButtonElement>('[data-action="toggle-lora-download"]')
    toggle.dataset.active = String(shouldOpen)
    toggle.querySelector("span")!.textContent = shouldOpen ? "Searching" : "Download"
    if (shouldOpen && focus) this.get<HTMLInputElement>('[data-role="lora-download-url"]').focus()
  }

  private startManualLoraDownload(): void {
    const url = this.get<HTMLInputElement>('[data-role="lora-download-url"]').value.trim()
    const name = this.get<HTMLInputElement>('[data-role="lora-download-name"]').value.trim()
    if (!url || !this.state.connection) {
      this.setLoraDownloadStatus(url ? "Choose a SwarmUI connection first." : "Paste a download URL first.", true)
      return
    }
    this.startLoraDownloadBatch([{ name, title: name, sourceUrl: url, weight: 1, enabled: true, useTrigger: false }])
  }

  private downloadSelectedMissingLoras(): void {
    const selected = [...this.root.querySelectorAll<HTMLInputElement>('[data-role="missing-lora-download"]:checked')]
      .map((input) => this.missingLoras[Number(input.dataset.index)])
      .filter((item): item is StackPresetItem => Boolean(item?.sourceUrl))
    if (!selected.length) {
      this.setLoraDownloadStatus("Select at least one LoRA with a source URL.", true)
      return
    }
    this.startLoraDownloadBatch(selected)
  }

  private startLoraDownloadBatch(items: StackPresetItem[]): void {
    if (!items.length || !this.state.connection) return
    if (this.loraDownloadActive) {
      this.setLoraDownloadStatus("A LoRA download is already running. Cancel it before starting another.", true)
      return
    }
    this.loraDownloadActive = true
    this.setLoraDownloadStatus(`Preparing ${items.length === 1 ? items[0].title || labelFromName(items[0].name) : `${items.length} LoRA downloads`}…`, false, 0)
    this.loraDownloadRequestId = this.send("start_lora_download", {
      connectionId: this.state.connection.id,
      items: items.map((item) => ({
        url: item.sourceUrl,
        name: item.name,
        title: item.title || labelFromName(item.name),
      })),
    })
  }

  private cancelLoraDownload(): void {
    this.loraDownloadRequestId = ""
    if (this.loraDownloadActive) this.send("cancel_lora_download", { jobId: this.loraDownloadJobId })
    this.loraDownloadActive = false
    this.setLoraDownloadStatus("", false)
    this.toggleLoraDownloader(false)
  }

  private setLoraDownloadStatus(message: string, error = false, progress = 0): void {
    const bar = this.get<HTMLElement>('[data-role="lora-download-progress"]')
    bar.hidden = !message
    bar.style.setProperty("--ss-download-progress", `${Math.round(clamp(progress, 0, 1) * 100)}%`)
    bar.title = message
    const modalStatus = this.root.querySelector<HTMLElement>('[data-role="missing-lora-download-status"]')
    if (modalStatus) {
      modalStatus.textContent = message
      modalStatus.style.color = error ? "#ff8b96" : ""
    }
    if (message) this.setRunStatus(message, error)
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
    const installed = Boolean(this.installedLora(item.lora.name))
    row.dataset.disabled = String(!item.enabled)
    row.dataset.missing = String(!installed)
    row.dataset.incompatible = String(installed && !this.isLoraCompatible(item.lora))

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

  private setStackPresetSelection(presetId: string): void {
    for (const select of this.root.querySelectorAll<HTMLSelectElement>(
      '[data-role="stack-preset"], [data-role="mobile-stack-preset"]',
    )) {
      select.value = [...select.options].some((option) => option.value === presetId) ? presetId : ""
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
          sourceUrl: item.lora.sourceUrl,
        })),
      },
    })
    this.setRunStatus(`Saving LoRA stack “${name.trim()}”…`)
  }

  private loadStackPreset(requestedPresetId?: string, announce = true): void {
    const presetId = requestedPresetId || this.get<HTMLSelectElement>('[data-role="stack-preset"]').value
    const preset = this.state.stackPresets.find((item) => item.id === presetId)
    if (!preset) return
    this.state.stack = preset.items.map((item) => {
      const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
      return {
        lora,
        weight: clamp(Number(item.weight) || 1, -10, 10),
        enabled: item.enabled !== false,
        useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
      }
    })
    this.setStackPresetSelection(preset.id)
    this.renderStack()
    this.renderLoras()
    if (announce) this.setRunStatus(`Loaded LoRA stack “${preset.name}”.`)
  }

  private stackName(): string {
    const selectedId = this.get<HTMLSelectElement>('[data-role="stack-preset"]').value
    return this.state.stackPresets.find((preset) => preset.id === selectedId)?.name || "Swarm Studio stack"
  }

  private stackExportItems(): StackPresetItem[] {
    return this.state.stack.map((item) => ({
      name: item.lora.name,
      title: item.lora.title,
      weight: clamp(Number(item.weight) || 1, -10, 10),
      enabled: item.enabled,
      useTrigger: Boolean(item.useTrigger),
      sourceUrl: safeHttpUrl(item.lora.sourceUrl),
    }))
  }

  private exportStack(): void {
    if (!this.state.stack.length) {
      this.setRunStatus("Add at least one LoRA before exporting a stack.", true)
      return
    }
    const name = this.stackName()
    downloadJson({
      version: 1,
      type: "swarm_studio_lora_stack",
      exported_at: Math.floor(Date.now() / 1000),
      stack: { name, items: this.stackExportItems() },
    }, `${name}-swarm-studio.json`)
    this.setRunStatus(`Exported LoRA stack “${name}”.`)
  }

  private async applyLumiverseStack(): Promise<void> {
    const enabled = this.state.stack.filter((item) => item.enabled)
    if (!enabled.length) {
      this.setRunStatus("Enable at least one LoRA before applying this stack to Lumiverse Image Gen.", true)
      return
    }
    const name = this.stackName()
    const baseTags = enabled
      .filter((item) => item.useTrigger && item.lora.triggerPhrase)
      .map((item) => item.lora.triggerPhrase.trim())
      .filter(Boolean)
      .join(", ")
    const button = this.get<HTMLButtonElement>('[data-action="apply-lumi-stack"]')
    button.disabled = true
    this.setRunStatus(`Applying “${name}” to Lumiverse Image Gen…`)
    try {
      const exportResponse = await fetch("/api/v1/image-gen/export", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          include_settings: true,
          include_presets: false,
          include_connections: false,
          include_parameters: false,
        }),
      })
      const exported = await exportResponse.json().catch(() => ({}))
      if (!exportResponse.ok) throw new Error(String(exported?.error || `Could not read Lumiverse Image Gen settings (${exportResponse.status}).`))
      const existing = Array.isArray(exported?.settings?.loraPresets) ? exported.settings.loraPresets : []
      const sameName = existing.find((preset: any) => String(preset?.name || "").trim().toLowerCase() === name.trim().toLowerCase())
      const id = String(sameName?.id || `swarm-studio-${crypto.randomUUID()}`)
      const nextPreset = {
        id,
        name,
        loras: enabled.map((item) => ({
          lora_name: item.lora.name,
          weight_model: clamp(Number(item.weight) || 1, -10, 10),
          weight_clip: clamp(Number(item.weight) || 1, -10, 10),
        })),
        ...(baseTags ? { base_tags: baseTags } : {}),
      }
      const merged = existing.filter((preset: any) => String(preset?.id || "") !== id && String(preset?.name || "").trim().toLowerCase() !== name.trim().toLowerCase())
      merged.push(nextPreset)
      const importResponse = await fetch("/api/v1/image-gen/import", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          version: 1,
          type: "lumiverse_image_gen_config",
          exported_at: Math.floor(Date.now() / 1000),
          settings: { loraPresets: merged, activeLoraPresetId: id },
        }),
      })
      const imported = await importResponse.json().catch(() => ({}))
      if (!importResponse.ok) throw new Error(String(imported?.error || `Lumiverse rejected the stack (${importResponse.status}).`))
      this.setRunStatus(`Applied and activated “${name}” in Lumiverse Image Gen. Reopen the native tab if it was already open so it reloads the saved settings.`)
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : "Could not apply this stack to Lumiverse Image Gen.", true)
    } finally {
      button.disabled = false
    }
  }

  private importedStackPayload(payload: unknown): { name: string; items: StackPresetItem[] } {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("The selected file is not a JSON object.")
    }
    const record = payload as Record<string, any>
    let name = "Imported LoRA stack"
    let rawItems: any[] = []
    if (record.type === "swarm_studio_lora_stack") {
      const stack = record.stack && typeof record.stack === "object" ? record.stack : {}
      name = String(stack.name || name).trim().slice(0, 80) || name
      rawItems = Array.isArray(stack.items) ? stack.items : []
    } else {
      const settings = record.settings && typeof record.settings === "object" ? record.settings : record
      const presets = Array.isArray(settings.loraPresets)
        ? settings.loraPresets
        : Array.isArray(record.loraPresets)
          ? record.loraPresets
          : []
      const activeId = String(settings.activeLoraPresetId || record.activeLoraPresetId || "")
      const loraPreset = presets.find((preset: any) => String(preset?.id || "") === activeId) || presets[0]
        || (Array.isArray(record.loras) ? record : null)
      if (loraPreset) {
        name = String(loraPreset.name || name).trim().slice(0, 80) || name
        rawItems = Array.isArray(loraPreset.loras) ? loraPreset.loras : []
      } else if (Array.isArray(record.items)) {
        name = String(record.name || name).trim().slice(0, 80) || name
        rawItems = record.items
      }
    }
    if (!rawItems.length) throw new Error("No LoRAs were found in that stack or Lumiverse Image Gen config.")
    const items = rawItems.slice(0, 64).map((raw, index): StackPresetItem => {
      const nameValue = String(raw?.name || raw?.lora_name || "").trim().slice(0, 500)
      if (!nameValue) throw new Error(`LoRA entry ${index + 1} is missing its filename.`)
      const weightValue = Number(raw?.weight ?? raw?.weight_model)
      return {
        name: nameValue,
        title: String(raw?.title || "").trim().slice(0, 200),
        weight: Number.isFinite(weightValue) ? clamp(weightValue, -10, 10) : 1,
        enabled: raw?.enabled !== false,
        useTrigger: Boolean(raw?.useTrigger),
        sourceUrl: safeHttpUrl(raw?.sourceUrl || raw?.source_url || raw?.civitai_url),
      }
    })
    return { name, items }
  }

  private async importStackFile(file: File): Promise<void> {
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("Stack files must be 2 MB or smaller.")
      const imported = this.importedStackPayload(JSON.parse(await file.text()))
      this.state.stack = imported.items.map((item) => {
        const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
        return {
          lora,
          weight: item.weight,
          enabled: item.enabled,
          useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
        }
      })
      this.missingLoras = imported.items.filter((item) => !this.installedLora(item.name))
      this.renderStack()
      this.renderLoras()
      this.setRunStatus(`Imported “${imported.name}” with ${imported.items.length} LoRA${imported.items.length === 1 ? "" : "s"}.`)
      if (this.missingLoras.length) this.showMissingLoras()
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : "Could not import that LoRA stack.", true)
    }
  }

  private normalizedLoraName(name: string): string {
    return String(name || "")
      .trim()
      .replace(/^<lora:/i, "")
      .replace(/:[+-]?(?:\d+(?:\.\d*)?|\.\d+)>$/i, "")
      .replace(/>$/, "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .toLowerCase()
  }

  private loraNameParts(name: string): { full: string; stem: string; base: string; baseStem: string } {
    const full = this.normalizedLoraName(name)
    const stem = full.replace(/\.(?:safetensors|ckpt|pt|pth|bin)$/i, "")
    const base = full.split("/").pop() || full
    const baseStem = base.replace(/\.(?:safetensors|ckpt|pt|pth|bin)$/i, "")
    return { full, stem, base, baseStem }
  }

  private loraMatchScore(left: string, right: string): number {
    const a = this.loraNameParts(left)
    const b = this.loraNameParts(right)
    if (!a.full || !b.full) return 0
    if (a.full === b.full) return 100
    if (a.stem === b.stem) return 80
    if (a.base === b.base) return 60
    if (a.baseStem === b.baseStem) return 40
    return 0
  }

  private sameLoraName(left: string, right: string): boolean {
    return this.loraMatchScore(left, right) > 0
  }

  private installedLora(name: string): LoraMetadata | null {
    let bestScore = 0
    let best: LoraMetadata[] = []
    for (const item of this.state.loras) {
      const score = this.loraMatchScore(name, item.name)
      if (score > bestScore) {
        bestScore = score
        best = [item]
      } else if (score > 0 && score === bestScore) {
        best.push(item)
      }
    }
    return bestScore > 0 && best.length === 1 ? best[0] : null
  }

  private showMissingLoras(): void {
    const list = this.get<HTMLElement>('[data-role="missing-lora-list"]')
    list.replaceChildren()
    this.missingLoras.forEach((item, index) => {
      const row = element("div", "ss-missing-lora-row")
      const select = element("input") as HTMLInputElement
      select.type = "checkbox"
      select.dataset.role = "missing-lora-download"
      select.dataset.index = String(index)
      const details = element("div")
      details.append(element("strong", "", item.title || labelFromName(item.name)), element("span", "", item.name))
      const sourceUrl = safeHttpUrl(item.sourceUrl)
      select.checked = Boolean(sourceUrl)
      select.disabled = !sourceUrl
      row.append(select, details)
      if (sourceUrl) {
        const link = element("a", "", "Source ↗") as HTMLAnchorElement
        link.href = sourceUrl
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        row.appendChild(link)
      } else {
        row.appendChild(element("span", "", "No source URL"))
      }
      list.appendChild(row)
    })
    this.setLoraDownloadStatus("", false)
    this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden = false
  }

  private closeMissingLoras(): void {
    this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden = true
  }

  private async copyMissingLoras(): Promise<void> {
    if (!this.missingLoras.length) return
    const text = this.missingLoras
      .map((item) => `${item.name}${safeHttpUrl(item.sourceUrl) ? `\t${safeHttpUrl(item.sourceUrl)}` : ""}`)
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      this.setRunStatus("Missing LoRA filenames and source links copied for SwarmUI’s Model Downloader.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private deleteStackPreset(): void {
    const select = this.get<HTMLSelectElement>('[data-role="stack-preset"]')
    const preset = this.state.stackPresets.find((item) => item.id === select.value)
    if (!preset || !window.confirm(`Delete saved LoRA stack “${preset.name}”?`)) return
    this.send("delete_stack_preset", { presetId: preset.id })
    this.setRunStatus(`Deleting LoRA stack “${preset.name}”…`)
  }

  private restoreWorkspaceState(): void {
    let state: any = {}
    try { state = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || "{}") } catch {}
    const shell = this.get<HTMLElement>(".ss-shell")
    shell.classList.toggle("ss-generation-collapsed", state?.collapsed?.generation === true)
    shell.classList.toggle("ss-history-collapsed", state?.collapsed?.history === true)
    shell.classList.toggle("ss-loras-collapsed", state?.collapsed?.loras === true)
    shell.classList.toggle("ss-fullscreen-layer", state?.fullscreen === true)
    const advanced = this.root.querySelector<HTMLDetailsElement>("details.ss-advanced")
    if (advanced) advanced.open = state?.details?.advanced === true
    const visual = this.root.querySelector<HTMLDetailsElement>('details[data-role="library-visual-profile"]')
    if (visual) visual.open = state?.details?.visual === true
    const sizes: Record<string, string> = {
      generationWidth: "--ss-generation-width",
      historyWidth: "--ss-history-width",
      dockHeight: "--ss-dock-height",
      libraryWidth: "--ss-library-width",
      promptHeight: "--ss-prompt-height",
    }
    for (const [key, property] of Object.entries(sizes)) {
      const value = Number(state?.sizes?.[key])
      if (Number.isFinite(value) && value >= 50 && value <= 2400) shell.style.setProperty(property, `${Math.round(value)}px`)
    }
    this.setMobileTab(typeof state?.mobileTab === "string" ? state.mobileTab : "create")
    this.updateWorkspaceButtons()
  }

  private persistWorkspaceState(): void {
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (!shell) return
    const size = (property: string): number | null => {
      const value = Number.parseFloat(shell.style.getPropertyValue(property))
      return Number.isFinite(value) ? Math.round(value) : null
    }
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
        fullscreen: shell.classList.contains("ss-fullscreen-layer"),
        mobileTab: shell.dataset.mobileTab || "create",
        collapsed: {
          generation: shell.classList.contains("ss-generation-collapsed"),
          history: shell.classList.contains("ss-history-collapsed"),
          loras: shell.classList.contains("ss-loras-collapsed"),
        },
        details: {
          advanced: this.root.querySelector<HTMLDetailsElement>("details.ss-advanced")?.open === true,
          visual: this.root.querySelector<HTMLDetailsElement>('details[data-role="library-visual-profile"]')?.open === true,
        },
        sizes: {
          generationWidth: size("--ss-generation-width"),
          historyWidth: size("--ss-history-width"),
          dockHeight: size("--ss-dock-height"),
          libraryWidth: size("--ss-library-width"),
          promptHeight: size("--ss-prompt-height"),
        },
      }))
    } catch {}
  }

  private updateWorkspaceButtons(): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const generation = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-generation"]')
    const history = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-history"]')
    const loras = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-loras"]')
    const fullscreen = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-fullscreen"]')
    const generationCollapsed = shell.classList.contains("ss-generation-collapsed")
    const historyCollapsed = shell.classList.contains("ss-history-collapsed")
    const lorasCollapsed = shell.classList.contains("ss-loras-collapsed")
    const isFullscreen = shell.classList.contains("ss-fullscreen-layer")
    if (generation) { generation.textContent = generationCollapsed ? "›" : "‹"; generation.setAttribute("aria-expanded", String(!generationCollapsed)) }
    if (history) { history.textContent = historyCollapsed ? "‹" : "›"; history.setAttribute("aria-expanded", String(!historyCollapsed)) }
    if (loras) { loras.textContent = lorasCollapsed ? "⌃" : "⌄"; loras.setAttribute("aria-expanded", String(!lorasCollapsed)) }
    if (fullscreen) { fullscreen.textContent = isFullscreen ? "🗗" : "⛶"; fullscreen.title = isFullscreen ? "Exit fullscreen studio" : "Enter fullscreen studio" }
  }

  private togglePane(pane: "generation" | "history" | "loras"): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const className = `ss-${pane}-collapsed`
    const collapsed = shell.classList.toggle(className)
    void collapsed
    this.updateWorkspaceButtons()
    this.persistWorkspaceState()
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
      this.persistWorkspaceState()
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
    this.persistWorkspaceState()
    this.fitPreviewToAspect()
  }

  private toggleFullscreen(force?: boolean): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const shouldEnter = force ?? !shell.classList.contains("ss-fullscreen-layer")
    shell.classList.toggle("ss-fullscreen-layer", shouldEnter)
    this.updateWorkspaceButtons()
    this.persistWorkspaceState()
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
    this.persistWorkspaceState()
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
      details?.workflow ? `workflow · ${details.workflow}` : "",
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
    const path = details?.swarmPathVerified ? details.swarmPath || "" : ""
    this.get<HTMLElement>('[data-role="inspector-path"]').hidden = !path
    this.get<HTMLElement>('[data-role="inspector-path-value"]').textContent = path
    this.get<HTMLButtonElement>('[data-action="reuse-parameters"]').disabled = !details
    this.get<HTMLButtonElement>('[data-action="use-as-init"]').disabled = !image.src
    this.get<HTMLButtonElement>('[data-action="delete-output"]').disabled = !image.id
    this.updateAppendControls()
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

  private restoreDraft(draft: StudioDraft): void {
    this.applyGenerationDetails(draft.details, draft, false)
    this.setRunStatus("Restored the previous Studio model, presets, LoRAs, workflow, sampler, scheduler, and render controls.")
  }

  private applyGenerationDetails(
    details: GenerationDetails,
    draft: StudioDraft | null = null,
    closeOverlays = true,
  ): void {
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
    const workflowDraft = draft?.workflow || null
    const workflowName = workflowDraft?.name || details.workflow || ""
    if (workflowName && this.state.swarmWorkflows.some((workflow) => workflow.name === workflowName)) {
      const workflowSelect = this.get<HTMLSelectElement>('[data-role="workflow-select"]')
      workflowSelect.value = workflowName
      this.selectWorkflow(workflowName, closeOverlays, workflowDraft)
    } else {
      this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
      this.selectWorkflow("")
    }
    this.state.selectedPresets = draft
      ? draft.selectedPresets.map((preset) => ({ ...preset }))
      : (details.presets || []).map((title) => ({ title, enabled: true }))
    this.state.stack = draft
      ? draft.stack.map((saved) => {
          const lora = this.state.loras.find((item) => item.name === saved.name) || manualLora(saved.name, saved.title)
          return {
            lora,
            weight: clamp(Number(saved.weight) || 1, -10, 10),
            enabled: saved.enabled !== false,
            useTrigger: Boolean(saved.useTrigger && lora.triggerPhrase),
          }
        })
      : (details.loras || []).map((saved) => ({
          lora: this.state.loras.find((item) => item.name === saved.name) || manualLora(saved.name),
          weight: clamp(Number(saved.weight) || 1, -10, 10),
          enabled: true,
          useTrigger: false,
        }))
    if (draft) {
      this.state.initImage = draft.initImage ? { ...draft.initImage } : null
      this.renderInitImage()
    }
    this.renderStack()
    this.renderLoras()
    this.renderPresetStack()
    this.updateContextControls()
    if (closeOverlays) {
      this.closeInspector()
      this.closeOutputLibrary()
      if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    }
  }

  private reuseCurrentParameters(): void {
    const details = this.state.currentImage?.details
    if (!details) return
    this.applyGenerationDetails(details)
    const parameters = details.parameters || {}
    this.setRunStatus(`Reused prompts, locked seed ${parameters.seed ?? "as recorded"}, presets, render settings, and LoRA stack.`)
  }

  private deleteCurrentOutput(): void {
    const image = this.state.currentImage
    if (!image?.id) return
    if (!window.confirm(`Delete “${image.label}” from Lumiverse? This cannot be undone.`)) return
    this.send("delete_output", { imageId: image.id })
    this.setRunStatus(`Deleting “${image.label}”…`)
  }

  private appendCurrentToChat(): void {
    const image = this.state.currentImage
    if (!image?.id || !this.state.activeChat?.id) return
    this.setRunStatus(`Appending “${image.label}” to the active Lumiverse chat…`)
    this.send("append_output_to_chat", { imageId: image.id, label: image.label })
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
    const activeFolder = this.activeVisualFolder()
    if (!this.libraryFolderId && activeFolder) this.libraryFolderId = activeFolder.id
    this.get<HTMLElement>('[data-role="output-library"]').hidden = false
    this.get<HTMLElement>('[data-role="library-grid"]').replaceChildren(
      element("div", "ss-empty", "Loading Lumiverse outputs…"),
    )
    this.send("list_library_outputs")
  }

  private closeOutputLibrary(): void {
    this.get<HTMLElement>('[data-role="output-library"]').hidden = true
    this.librarySelection.clear()
    this.librarySelectionMode = false
    this.closeNewFolderModal()
  }

  private openNewFolderModal(): void {
    const name = this.get<HTMLInputElement>('[data-role="new-folder-name"]')
    name.value = ""
    const unbound = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"][value="unbound"]')
    if (unbound) unbound.checked = true
    const chat = this.state.activeChat
    const characterId = String(chat?.character_id || "")
    this.get<HTMLElement>('[data-role="new-folder-chat-hint"]').textContent = chat?.id
      ? "Character folder will follow the active character across every conversation and inherit their current base tags."
      : "Open a character chat before choosing Character folder."
    const characterOption = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"][value="character"]')
    if (characterOption) characterOption.disabled = !chat?.id || !characterId
    this.get<HTMLElement>('[data-role="new-folder-modal"]').hidden = false
    window.setTimeout(() => name.focus(), 0)
  }

  private closeNewFolderModal(): void {
    const modal = this.root.querySelector<HTMLElement>('[data-role="new-folder-modal"]')
    if (modal) modal.hidden = true
  }

  private createOutputFolder(): void {
    const name = this.get<HTMLInputElement>('[data-role="new-folder-name"]').value.trim()
    const bindingType = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"]:checked')?.value === "character"
      ? "character"
      : "unbound"
    if (!name && bindingType === "unbound") {
      this.setRunStatus("Give the unbound folder a name.", true)
      return
    }
    this.pendingCreatedFolder = { name, bindingType }
    this.send("create_output_folder", { name, bindingType })
    this.closeNewFolderModal()
    this.setRunStatus(bindingType === "character" ? "Creating character visual folder…" : `Creating folder “${name}”…`)
  }

  private toggleLibrarySearch(): void {
    this.librarySearchOpen = !this.librarySearchOpen
    const wrap = this.get<HTMLElement>('[data-role="library-search-wrap"]')
    wrap.hidden = !this.librarySearchOpen
    const input = this.get<HTMLInputElement>('[data-role="library-search"]')
    if (this.librarySearchOpen) window.setTimeout(() => input.focus(), 0)
    else if (input.value) {
      input.value = ""
      this.libraryPage = 0
      this.renderOutputLibrary()
    }
  }

  private toggleLibrarySelectionMode(): void {
    this.librarySelectionMode = !this.librarySelectionMode
    this.librarySelectionAnchorId = ""
    if (!this.librarySelectionMode) this.librarySelection.clear()
    this.renderOutputLibrary()
  }

  private activeVisualFolder(): OutputFolder | null {
    const characterId = String(this.state.activeChat?.character_id || "")
    if (!characterId) return null
    return this.state.outputFolders.find((folder) =>
      folder.binding?.type === "character" && folder.binding.characterId === characterId,
    ) || null
  }

  private hydrateActiveVisualStack(force = false): boolean {
    const folder = this.activeVisualFolder()
    const binding = folder?.binding
    if (!folder || !binding?.enabled || this.pendingDraftRestore) return false
    if (!force && this.hydratedVisualCharacterId === binding.characterId) {
      this.setStackPresetSelection(binding.stackPresetId)
      return false
    }

    let checkpointLoaded = !binding.checkpoint
    if (binding.checkpoint) {
      const modelSelect = this.get<HTMLSelectElement>('[data-role="model"]')
      const normalized = normalizeModelName(binding.checkpoint)
      const matchingOption = [...modelSelect.options].find((option) => {
        const candidate = normalizeModelName(option.value)
        return candidate === normalized || candidate.endsWith(normalized) || normalized.endsWith(candidate)
      })
      if (matchingOption) {
        modelSelect.value = matchingOption.value
        checkpointLoaded = true
        this.updateFamilyChip()
        this.renderLoras()
        this.renderStack()
      }
    }

    const preset = this.state.stackPresets.find((candidate) => candidate.id === binding.stackPresetId)
    const items = preset?.items?.length ? preset.items : binding.stackSnapshot || []
    if (items.length) {
      this.state.stack = items.map((item) => {
        const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
        return {
          lora,
          weight: clamp(Number(item.weight) || 1, -10, 10),
          enabled: item.enabled !== false,
          useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
        }
      })
      this.setStackPresetSelection(preset?.id || "")
      this.renderStack()
      this.renderLoras()
    }

    if (!checkpointLoaded) {
      if (this.state.models.length) {
        this.setRunStatus(`“${binding.checkpoint}” from ${folder.name} is not available on this SwarmUI connection.`, true)
      }
      return items.length
    }

    this.hydratedVisualCharacterId = binding.characterId
    const loadedParts = [
      binding.checkpoint ? `checkpoint “${binding.checkpoint}”` : "",
      preset ? `stack “${preset.name}”` : items.length ? "Custom stack" : "",
    ].filter(Boolean)
    if (loadedParts.length) {
      this.setRunStatus(`Loaded ${loadedParts.join(" and ")} from ${folder.name} visuals.`)
    }
    return loadedParts.length > 0
  }

  private saveVisualProfile(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) return
    const selectedStackValue = this.get<HTMLSelectElement>('[data-role="visual-stack"]').value
    const selectedStackId = selectedStackValue === "__custom__" ? "" : selectedStackValue
    const selectedStack = this.state.stackPresets.find((preset) => preset.id === selectedStackId)
    const profile = {
      positivePrompt: this.get<HTMLTextAreaElement>('[data-role="visual-positive"]').value,
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="visual-negative"]').value,
      checkpoint: this.get<HTMLSelectElement>('[data-role="visual-checkpoint"]').value,
      stackPresetId: selectedStackId,
      stackSnapshot: selectedStack?.items || (selectedStackValue === "__custom__" ? folder.binding.stackSnapshot : []),
      enabled: folder.binding.enabled,
    }
    folder.binding = { ...folder.binding, ...profile }
    this.send("update_output_folder_profile", { folderId: folder.id, profile })
    if (folder.binding.characterId === String(this.state.activeChat?.character_id || "")) {
      this.hydratedVisualCharacterId = ""
      this.hydrateActiveVisualStack(true)
    }
    this.updateActiveVisualPill()
    this.updateTriggerSummary()
    this.scheduleStudioProfileSync()
    this.setRunStatus(`Saving visual binding for “${folder.name}”…`)
  }

  private toggleActiveVisualBinding(): void {
    const folder = this.activeVisualFolder()
    if (!folder?.binding) return
    const enabled = !folder.binding.enabled
    folder.binding = { ...folder.binding, enabled }
    this.send("update_output_folder_profile", {
      folderId: folder.id,
      profile: { ...folder.binding, enabled },
    })
    this.updateActiveVisualPill()
    this.updateTriggerSummary()
    this.scheduleStudioProfileSync()
    if (!this.get<HTMLElement>('[data-role="output-library"]').hidden) this.renderOutputLibrary()
    this.setRunStatus(`${folder.name} visuals ${enabled ? "enabled" : "disabled"}.`)
  }

  private updateActiveVisualPill(): void {
    const pill = this.root.querySelector<HTMLButtonElement>('[data-role="active-visual-pill"]')
    if (!pill) return
    const folder = this.activeVisualFolder()
    pill.hidden = !folder?.binding
    if (!folder?.binding) return
    pill.textContent = `Visuals: ${folder.name}`
    pill.dataset.enabled = String(folder.binding.enabled)
    pill.title = folder.binding.enabled
      ? `Using “${folder.name}” character visuals. Click to disable them for this character.`
      : `“${folder.name}” character visuals are disabled. Click to enable.`
  }

  private toggleActivePersonaVisual(): void {
    const visuals = this.state.chatVisuals
    const presetId = visuals?.personaBinding?.presetId || ""
    if (!visuals?.activePersona || !presetId) return
    const enabled = visuals.personaBinding.enabled === false
    visuals.personaBinding = { presetId, enabled }
    this.send("bind_persona_visual_preset", {
      binding: visuals.personaBinding,
      currentStack: this.stackExportItems(),
    })
    this.updateActivePersonaVisualPill()
    this.scheduleStudioProfileSync()
    this.setRunStatus(`${visuals.activePersona.name} persona visuals ${enabled ? "enabled" : "disabled"}.`)
  }

  private updateActivePersonaVisualPill(): void {
    const pill = this.root.querySelector<HTMLButtonElement>('[data-role="active-persona-visual-pill"]')
    if (!pill) return
    const visuals = this.state.chatVisuals
    const preset = visuals?.personaPresets?.find((candidate) =>
      candidate.id === visuals.personaBinding?.presetId,
    ) || null
    pill.hidden = !visuals?.activePersona || !preset
    if (!visuals?.activePersona || !preset) return
    pill.textContent = `Persona: ${visuals.activePersona.name}`
    pill.dataset.enabled = String(visuals.personaBinding.enabled !== false)
    pill.title = visuals.personaBinding.enabled !== false
      ? `Using persona visual profile “${preset.name}”. Click to disable it.`
      : `Persona visual profile “${preset.name}” is disabled. Click to enable.`
  }

  private renderVisualProfile(): void {
    const panel = this.get<HTMLDetailsElement>('[data-role="library-visual-profile"]')
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    panel.hidden = !folder?.binding
    if (!folder?.binding) return
    this.get<HTMLElement>('[data-role="visual-profile-title"]').textContent = `${folder.name} visuals`
    this.get<HTMLElement>('[data-role="visual-profile-state"]').textContent = folder.binding.enabled ? "Active" : "Disabled"
    this.get<HTMLTextAreaElement>('[data-role="visual-positive"]').value = folder.binding.positivePrompt
    this.get<HTMLTextAreaElement>('[data-role="visual-negative"]').value = folder.binding.negativePrompt
    const checkpoint = this.get<HTMLSelectElement>('[data-role="visual-checkpoint"]')
    checkpoint.replaceChildren()
    const current = element("option", "", "Use current Studio checkpoint")
    current.value = ""
    checkpoint.appendChild(current)
    if (folder.binding.checkpoint && !this.state.models.some((model) => model.id === folder.binding?.checkpoint)) {
      const retained = element("option", "", `${folder.binding.checkpoint} · saved`)
      retained.value = folder.binding.checkpoint
      checkpoint.appendChild(retained)
    }
    for (const model of this.state.models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    checkpoint.value = folder.binding.checkpoint || ""
    const stack = this.get<HTMLSelectElement>('[data-role="visual-stack"]')
    stack.replaceChildren()
    const none = element("option", "", "No bound stack")
    none.value = ""
    stack.appendChild(none)
    for (const preset of this.state.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = preset.id
      stack.appendChild(option)
    }
    if (folder.binding.stackSnapshot?.length && !folder.binding.stackPresetId) {
      const custom = element("option", "", `Custom snapshot · ${folder.binding.stackSnapshot.length}`)
      custom.value = "__custom__"
      stack.appendChild(custom)
    }
    stack.value = this.state.stackPresets.some((preset) => preset.id === folder.binding?.stackPresetId)
      ? folder.binding.stackPresetId
      : folder.binding.stackSnapshot?.length
        ? "__custom__"
      : ""
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
    this.librarySelectionAnchorId = ""
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
    this.librarySelectionAnchorId = ids.at(-1) || ""
    this.syncVisibleLibrarySelection()
  }

  private setLibrarySelection(imageId: string, selected: boolean, extendRange: boolean): void {
    const pageIds = this.libraryPageOutputs().map((output) => String(output.id))
    const anchorIndex = pageIds.indexOf(this.librarySelectionAnchorId)
    const currentIndex = pageIds.indexOf(imageId)
    if (extendRange && anchorIndex >= 0 && currentIndex >= 0) {
      const start = Math.min(anchorIndex, currentIndex)
      const end = Math.max(anchorIndex, currentIndex)
      for (const id of pageIds.slice(start, end + 1)) {
        if (selected) this.librarySelection.add(id)
        else this.librarySelection.delete(id)
      }
    } else if (selected) {
      this.librarySelection.add(imageId)
    } else {
      this.librarySelection.delete(imageId)
    }
    this.librarySelectionAnchorId = imageId
  }

  private updateLibrarySelectionControls(): void {
    const selected = this.librarySelection.size
    const library = this.get<HTMLElement>('[data-role="output-library"]')
    library.dataset.selectionMode = String(this.librarySelectionMode)
    this.get<HTMLElement>('[data-role="library-selection-count"]').textContent =
      this.librarySelectionMode ? `${selected} selected` : "Select"
    const pageIds = this.libraryPageOutputs().map((output) => String(output.id))
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => this.librarySelection.has(id))
    const selectPage = this.get<HTMLButtonElement>('[data-role="library-select-page"]')
    selectPage.hidden = !this.librarySelectionMode
    selectPage.disabled = pageIds.length === 0
    selectPage.textContent = allPageSelected ? "Clear page" : "Select page"
    this.get<HTMLElement>('[data-role="library-selection-actions"]').hidden = selected === 0
  }

  private syncVisibleLibrarySelection(): void {
    for (const check of this.root.querySelectorAll<HTMLInputElement>(
      '[data-role="library-output-check"]',
    )) {
      const imageId = check.dataset.imageId || ""
      const selected = this.librarySelection.has(imageId)
      check.checked = selected
      const card = check.closest<HTMLElement>(".ss-library-output")
      if (card) card.dataset.selected = String(selected)
    }
    this.updateLibrarySelectionControls()
  }

  private bulkMoveOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    this.openMoveFolderModal(imageIds)
  }

  private openMoveFolderModal(imageIds: string[]): void {
    this.pendingMoveImageIds = [...new Set(imageIds.map(String).filter(Boolean))]
    if (!this.pendingMoveImageIds.length) return
    this.get<HTMLElement>('[data-role="move-folder-description"]').textContent =
      `Move ${this.pendingMoveImageIds.length} output${this.pendingMoveImageIds.length === 1 ? "" : "s"} to:`
    const list = this.get<HTMLElement>('[data-role="move-folder-list"]')
    list.replaceChildren()
    const addChoice = (folderId: string, label: string, count = "") => {
      const button = element("button", "ss-button ss-move-folder-choice")
      button.dataset.action = "move-folder-choice"
      button.dataset.folderId = folderId
      button.append(element("span", "", label), element("span", "ss-muted ss-tiny", count))
      list.appendChild(button)
    }
    addChoice("", "Unfiled")
    for (const folder of this.state.outputFolders) addChoice(folder.id, folder.name, `${folder.imageIds.length} images`)
    this.get<HTMLElement>('[data-role="move-folder-modal"]').hidden = false
  }

  private closeMoveFolderModal(): void {
    this.get<HTMLElement>('[data-role="move-folder-modal"]').hidden = true
    this.pendingMoveImageIds = []
  }

  private confirmMoveFolder(folderId: string): void {
    const imageIds = [...this.pendingMoveImageIds]
    if (!imageIds.length) return
    this.send("bulk_move_outputs", { imageIds, folderId })
    this.closeMoveFolderModal()
    this.setRunStatus(`Moving ${imageIds.length} output${imageIds.length === 1 ? "" : "s"}…`)
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

  private renderLibraryFolderStrip(): void {
    const folderPane = this.get<HTMLElement>('[data-role="library-folders"]')
    folderPane.replaceChildren()
    const create = element("button", "ss-icon-button ss-library-folder-anchor")
    create.dataset.action = "create-output-folder"
    create.title = "Create output folder"
    create.setAttribute("aria-label", "Create output folder")
    create.innerHTML = NEW_FOLDER_ICON
    const scroll = element("div", "ss-library-folder-scroll")
    const appendFolder = (id: string, name: string, count: number) => {
      const button = element("button", "ss-library-folder")
      button.dataset.action = "library-folder"
      button.dataset.folderId = id
      button.dataset.active = String(this.libraryFolderId === id)
      button.append(element("span", "", name), element("span", "ss-muted ss-tiny", String(count)))
      scroll.appendChild(button)
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
      appendFolder(
        folder.id,
        folder.binding ? `✦ ${folder.name}` : folder.name,
        this.state.libraryOutputs.filter((output) => ids.has(String(output.id))).length,
      )
    }
    folderPane.append(create, scroll)
    if (this.state.outputFolders.some((folder) => folder.id === this.libraryFolderId)) {
      const remove = element("button", "ss-icon-button ss-library-folder-anchor ss-button-danger ss-library-folder-delete")
      remove.dataset.action = "delete-output-folder"
      remove.title = "Delete selected folder"
      remove.setAttribute("aria-label", "Delete selected folder")
      remove.innerHTML = TRASH_ICON
      folderPane.appendChild(remove)
    }
  }

  private renderOutputLibrary(): void {
    this.renderLibraryFolderStrip()
    this.renderVisualProfile()
    this.get<HTMLElement>('[data-role="output-library"]').dataset.selectionMode = String(this.librarySelectionMode)

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
      open.addEventListener("click", (event) => {
        if (this.librarySelectionMode) {
          this.setLibrarySelection(imageId, !this.librarySelection.has(imageId), event.shiftKey)
          this.syncVisibleLibrarySelection()
          return
        }
        this.setCurrentImage(this.outputToCurrentImage(output))
        this.openInspector()
      })
      const meta = element("div", "ss-library-output-meta")
      meta.appendChild(element("div", "ss-library-output-name", output.original_filename || `Output ${output.id}`))
      card.append(checkLabel, open, meta)
      grid.appendChild(card)
    }
    this.updateLibrarySelectionControls()
  }

  private inheritedTriggers(): string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const item of this.effectiveStack()) {
      const trigger = item.lora.triggerPhrase.trim()
      const key = trigger.toLowerCase()
      if (item.enabled && item.useTrigger && trigger && !seen.has(key)) {
        seen.add(key)
        result.push(trigger)
      }
    }
    return result
  }

  private effectiveStack(): StackItem[] {
    const folder = this.activeVisualFolder()
    const preset = folder?.binding?.enabled && folder.binding.stackPresetId
      ? this.state.stackPresets.find((candidate) => candidate.id === folder.binding?.stackPresetId)
      : null
    const merged = new Map<string, StackItem>()
    const boundItems = preset?.items?.length
      ? preset.items
      : folder?.binding?.enabled
        ? folder.binding.stackSnapshot || []
        : []
    for (const item of boundItems) {
      const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
      merged.set(normalizeModelName(item.name), {
        lora,
        weight: clamp(Number(item.weight) || 1, -10, 10),
        enabled: item.enabled !== false,
        useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
      })
    }
    for (const item of this.state.stack) merged.set(normalizeModelName(item.lora.name), item)
    return [...merged.values()]
  }

  private updateTriggerSummary(): void {
    const triggers = this.inheritedTriggers()
    this.get<HTMLElement>('[data-role="trigger-summary"]').textContent = triggers.length
      ? `${triggers.length} inherited: ${triggers.join(", ")}`
      : "No inherited trigger phrases."
  }

  private finalPrompt(): string {
    const prompt = this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim()
    const folder = this.activeVisualFolder()
    const visual = folder?.binding?.enabled ? folder.binding.positivePrompt.trim() : ""
    const chatVisuals = this.state.chatVisuals
    const personaPreset = chatVisuals?.personaBinding?.enabled !== false
      ? chatVisuals?.personaPresets?.find((candidate) => candidate.id === chatVisuals.personaBinding.presetId)
      : null
    const personaVisual = personaPreset?.positivePrompt.trim() || ""
    let layeredPrompt = prompt
    for (const layer of [visual, personaVisual]) {
      if (layer && !layeredPrompt.toLowerCase().includes(layer.toLowerCase())) {
        layeredPrompt = [layer, layeredPrompt].filter(Boolean).join(", ")
      }
    }
    const triggers = this.inheritedTriggers().filter((trigger) => !layeredPrompt.toLowerCase().includes(trigger.toLowerCase()))
    return [triggers.join(", "), layeredPrompt].filter(Boolean).join(", ")
  }

  private finalNegativePrompt(): string {
    const prompt = this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim()
    const folder = this.activeVisualFolder()
    const visual = folder?.binding?.enabled ? folder.binding.negativePrompt.trim() : ""
    if (!visual || prompt.toLowerCase().includes(visual.toLowerCase())) return prompt
    return [visual, prompt].filter(Boolean).join(", ")
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
    Object.assign(parsed, this.workflowRawOverrides())
    return Object.keys(parsed).length ? JSON.stringify(parsed) : undefined
  }

  private collectGenerationParameters(
    rawRequestOverride: string | undefined,
    enabled = this.effectiveStack().filter((item) => item.enabled),
  ): Record<string, unknown> {
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
    return parameters
  }

  private baseStudioProfileParameters(rawRequestOverride: string | undefined): Record<string, unknown> {
    const parameters = this.collectGenerationParameters(
      rawRequestOverride,
      this.state.stack.filter((item) => item.enabled),
    )
    delete parameters.referenceImages
    delete parameters.resolvedSourceImages
    delete parameters.resolvedReferenceImages
    delete parameters.denoise
    return parameters
  }

  private generate(): void {
    if (this.generating || !this.state.connection) return
    const selectedWorkflowName = this.get<HTMLSelectElement>('[data-role="workflow-select"]').value
    if (selectedWorkflowName && this.state.selectedWorkflow?.name !== selectedWorkflowName) {
      this.setRunStatus("Wait for the selected workflow controls to finish loading.", true)
      return
    }
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

    const enabled = this.effectiveStack().filter((item) => item.enabled)
    const parameters = this.collectGenerationParameters(rawRequestOverride, enabled)

    const model = this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model
    const clientJobId = crypto.randomUUID()
    const negativePrompt = this.finalNegativePrompt()
    const profileInput = {
      prompt: this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim(),
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim(),
      connection_id: this.state.connection.id,
      model,
      parameters: this.baseStudioProfileParameters(rawRequestOverride),
    }
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
      workflow: this.state.selectedWorkflow?.name || "",
      initImageId: this.state.initImage?.imageId || "",
      initImageLabel: this.state.initImage?.label || "",
      createdAt: Date.now(),
    }
    this.preGenerationImage = this.state.currentImage
    this.activity?.captureDraft(this.exportDraft())
    this.generating = true
    this.currentJobId = clientJobId
    this.currentJobConnectionId = this.state.connection.id
    this.activity?.begin(
      clientJobId,
      this.state.connection.id,
      this.state.selectedWorkflow
        ? `Preparing workflow · ${this.state.selectedWorkflow.name}`
        : `Preparing ${model || "SwarmUI"}…`,
    )
    this.setGenerating(true)
    this.setRunStatus(this.state.selectedWorkflow
      ? `Running workflow “${this.state.selectedWorkflow.name}” with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`
      : `Generating with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`)
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    this.send("generate", {
      profileInput,
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
        workflow: this.state.selectedWorkflow?.name || "",
        initImageId: this.state.initImage?.imageId || "",
        initImageLabel: this.state.initImage?.label || "",
        stack: this.stackExportItems(),
      },
      showCompletionToast: this.behavior.completionToast,
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
      this.progressStep = 0
      this.updatePreviewAspect(
        numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
        numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
      )
      this.updateGenerationProgress(0, 0)
    }
    this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = String(value)
  }

  private updateGenerationProgress(step: number, totalSteps: number): void {
    const requestedSteps = Number(this.pendingGeneration?.parameters?.steps)
    const resolvedTotal = Number.isFinite(totalSteps) && totalSteps > 0
      ? totalSteps
      : Number.isFinite(requestedSteps) && requestedSteps > 0 ? requestedSteps : 0
    const hasTotal = resolvedTotal > 0
    const nextStep = Number.isFinite(step) ? Math.max(0, Number(step)) : 0
    if (this.generating && hasTotal) this.progressStep = Math.max(this.progressStep, Math.min(nextStep, resolvedTotal))
    else if (hasTotal) this.progressStep = Math.min(nextStep, resolvedTotal)
    const safeStep = hasTotal ? clamp(this.progressStep, 0, resolvedTotal) : 0
    const percentage = hasTotal ? clamp(Math.round((safeStep / resolvedTotal) * 100), 0, 100) : 0
    for (const progress of this.root.querySelectorAll<HTMLElement>('[data-role="generation-progress"]')) {
      progress.dataset.indeterminate = String(!hasTotal)
      progress.style.setProperty("--ss-progress", `${percentage}%`)
      const label = progress.querySelector<HTMLElement>('[data-role="progress-label"]')
      if (label) {
        label.textContent = hasTotal
          ? `${percentage}% · ${Math.round(safeStep)} / ${Math.round(resolvedTotal)}`
          : "Preparing generation…"
      }
    }
  }

  private interruptGeneration(): void {
    if (!this.generating || !this.currentJobId) return
    this.send("interrupt_generation", {
      clientJobId: this.currentJobId,
      connectionId: this.currentJobConnectionId || this.state.connection?.id || "",
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
      menuAction(
        "Append to chat",
        "",
        () => this.appendCurrentToChat(),
        !current.id || !this.state.activeChat?.id || !this.state.permissions.chatMutation,
      )
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
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="use-current-init"]')) {
      button.disabled = false
    }
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.get<HTMLElement>('[data-role="output-label"]').textContent = image.label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = false
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = !image.url
    this.updateAppendControls()
    this.updateContextControls()
  }

  private clearCurrentImage(): void {
    this.state.currentImage = null
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.removeAttribute("src")
    preview.hidden = true
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="use-current-init"]')) {
      button.disabled = true
    }
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = false
    this.get<HTMLElement>('[data-role="output-label"]').textContent = "Nothing selected"
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
    this.updateAppendControls()
    this.updateContextControls()
  }

  private updateAppendControls(): void {
    const enabled = Boolean(
      this.state.currentImage?.id
      && this.state.activeChat?.id
      && this.state.permissions.chatMutation,
    )
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="append-to-chat"]')) {
      button.disabled = !enabled
      button.title = enabled
        ? "Insert this Lumiverse-owned output into the active chat"
        : "Requires an active chat, a saved output, and Chat Mutation permission"
    }
  }

  private downloadCurrent(): void {
    if (!this.state.currentImage) return
    const details = this.state.currentImage.details
    const swarmPath = details?.swarmPathVerified ? details.swarmPath : ""
    if (swarmPath && this.state.connection?.id) {
      this.send("download_swarm_output", {
        connectionId: this.state.connection.id,
        swarmPath,
      })
      this.setRunStatus("Fetching the original SwarmUI output…")
      return
    }
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
      "3:4": "4:3",
      "4:3": "3:4",
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

  private useRandomSeed(): void {
    this.get<HTMLInputElement>('[data-role="seed"]').value = "-1"
    this.updateContextControls()
    this.setRunStatus("Random seed enabled for the next generation.")
  }

  private updateContextControls(): void {
    const orientationButton = this.root.querySelector<HTMLButtonElement>('[data-role="orientation-action"]')
    const seedButtons = this.root.querySelectorAll<HTMLButtonElement>('[data-role="seed-action"], [data-role="seed-action-mobile"]')
    if (!orientationButton || !seedButtons.length) return
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    const makePortrait = width >= height
    orientationButton.innerHTML = `${makePortrait ? PORTRAIT_ICON : LANDSCAPE_ICON}<span>${makePortrait ? "Portrait" : "Landscape"}</span>`
    orientationButton.title = makePortrait
      ? "Flip the current aspect ratio to portrait"
      : "Flip the current aspect ratio to landscape"

    const random = numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1) === -1
    for (const seedButton of seedButtons) {
      seedButton.innerHTML = `${random ? CURRENT_SEED_ICON : RANDOM_SEED_ICON}<span>${random ? "Current seed" : "Random seed"}</span>`
      seedButton.title = random
        ? "Lock to the current output's seed (or create a fixed seed if no output is selected)"
        : "Set seed to -1 for a random generation"
    }
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

interface TaggedImageJobView {
  id: string
  key: string
  chatId: string
  messageId: string
  slot: string
  prompt: string
  negativePrompt: string
  aspect: string
  alt: string
  status: "requested" | "queued" | "generating" | "ready" | "failed" | "cancelled"
  clientJobId: string
  imageId: string
  imageUrl: string
  inserted: boolean
  error: string
}

function widgetEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function widgetKeyHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

class TaggedImageController {
  private readonly ctx: FrontendContext
  private readonly openStudioWithPrompt: (prompt: string, negativePrompt: string) => void
  private readonly openQuickCreateWithPrompt: (
    prompt: string,
    negativePrompt: string,
    onConfirm: (prompt: string, negativePrompt: string) => void,
  ) => boolean
  private readonly openLibrary: () => void
  private behavior: StudioBehavior
  private readonly jobs = new Map<string, TaggedImageJobView>()
  private readonly tagPayloads = new Map<string, any>()
  private readonly tagFingerprints = new Map<string, string>()
  private readonly cleanups = new Map<string, () => void>()
  private readonly handleInlineClick = (event: MouseEvent) => {
    const action = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-swarm-studio-inline-action]')
    if (!action) return
    const inline = this.inlineJobFromTarget(action)
    if (!inline) return
    event.preventDefault()
    event.stopPropagation()
    void this.showJobMenu(inline.job, event.clientX, event.clientY)
  }
  private readonly handleInlineContextMenu = (event: MouseEvent) => {
    const inline = this.inlineJobFromTarget(event.target as HTMLElement | null)
    if (!inline) return
    event.preventDefault()
    event.stopPropagation()
    void this.showJobMenu(inline.job, event.clientX, event.clientY)
  }
  private readonly handleInlineKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    const action = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-swarm-studio-inline-action]')
    if (!action) return
    const inline = this.inlineJobFromTarget(action)
    if (!inline) return
    event.preventDefault()
    void this.showJobMenu(inline.job, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2))
  }

  constructor(
    ctx: FrontendContext,
    behavior: StudioBehavior,
    openStudioWithPrompt: (prompt: string, negativePrompt: string) => void,
    openQuickCreateWithPrompt: (
      prompt: string,
      negativePrompt: string,
      onConfirm: (prompt: string, negativePrompt: string) => void,
    ) => boolean,
    openLibrary: () => void,
  ) {
    this.ctx = ctx
    this.behavior = { ...behavior }
    this.openStudioWithPrompt = openStudioWithPrompt
    this.openQuickCreateWithPrompt = openQuickCreateWithPrompt
    this.openLibrary = openLibrary
    document.addEventListener("click", this.handleInlineClick, true)
    document.addEventListener("contextmenu", this.handleInlineContextMenu, true)
    document.addEventListener("keydown", this.handleInlineKeyDown, true)
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
  }

  handleTag(payload: any): void {
    if (!payload?.chatId || !payload?.messageId || payload?.isUser) return
    const slot = String(payload?.attrs?.slot || `image-${widgetKeyHash(String(payload.fullMatch || payload.content)).slice(0, 6)}`)
      .replace(/[^a-z0-9_-]+/gi, "-")
      .slice(0, 80)
    const lookup = this.lookupKey(String(payload.chatId), String(payload.messageId), slot)
    this.tagPayloads.set(lookup, { ...payload, slot })
    const fingerprint = widgetKeyHash(String(payload.fullMatch || payload.content || ""))
    if (this.tagFingerprints.get(lookup) === fingerprint) return
    this.tagFingerprints.set(lookup, fingerprint)
    for (const [id, existing] of this.jobs) {
      if (this.lookupKey(existing.chatId, existing.messageId, existing.slot) !== lookup) continue
      this.remove(existing)
      this.jobs.delete(id)
    }
    const optimistic: TaggedImageJobView = {
      id: `pending-${widgetKeyHash(`${lookup}:${fingerprint}`)}`,
      key: lookup,
      chatId: String(payload.chatId),
      messageId: String(payload.messageId),
      slot,
      prompt: String(payload.content || "").trim(),
      negativePrompt: "",
      aspect: String(payload?.attrs?.aspect || ""),
      alt: String(payload?.attrs?.alt || ""),
      status: this.behavior.tagAutoGenerate ? "queued" : "requested",
      clientJobId: "",
      imageId: "",
      imageUrl: "",
      inserted: false,
      error: "",
    }
    this.jobs.set(optimistic.id, optimistic)
    this.render(optimistic)
    this.ctx.sendToBackend({
      type: "tag_generate",
      requestId: crypto.randomUUID(),
      chatId: payload.chatId,
      messageId: payload.messageId,
      fullMatch: payload.fullMatch,
      attrs: payload.attrs,
      content: payload.content,
      isStreaming: payload.isStreaming === true,
    })
  }

  onMessage(payload: any): void {
    if (payload?.type === "tagged_image_jobs_result") {
      const jobs = Array.isArray(payload.data) ? payload.data as TaggedImageJobView[] : []
      for (const job of jobs) {
        if (!job?.id || !job?.messageId) continue
        this.jobs.set(job.id, job)
        if (!job.inserted && !this.inlineFigureForJob(job.id)) this.render(job)
      }
      return
    }
    if (payload?.type === "tagged_image_job") {
      const job = payload.data as TaggedImageJobView
      if (!job?.id || !job?.messageId) return
      for (const [id, candidate] of this.jobs) {
        if (id.startsWith("pending-") && this.lookupKey(candidate.chatId, candidate.messageId, candidate.slot) === this.lookupKey(job.chatId, job.messageId, job.slot)) {
          this.jobs.delete(id)
        }
      }
      const previous = this.jobs.get(job.id)
      const next = { ...previous, ...job }
      this.jobs.set(job.id, next)
      const inlineFigure = this.inlineFigureForJob(next.id)
      if (inlineFigure) {
        inlineFigure.dataset.state = next.inserted ? "ready" : next.status
        this.remove(next)
      } else if (next.status === "ready" && next.inserted) {
        this.remove(next)
      } else {
        this.render(next)
      }
      return
    }
  }

  destroy(): void {
    document.removeEventListener("click", this.handleInlineClick, true)
    document.removeEventListener("contextmenu", this.handleInlineContextMenu, true)
    document.removeEventListener("keydown", this.handleInlineKeyDown, true)
    for (const cleanup of this.cleanups.values()) cleanup()
    this.cleanups.clear()
    this.jobs.clear()
    this.tagPayloads.clear()
    this.tagFingerprints.clear()
  }

  private lookupKey(chatId: string, messageId: string, slot: string): string {
    return `${chatId}:${messageId}:${slot}`
  }

  private widgetId(job: TaggedImageJobView): string {
    return `swarm-studio-image-${widgetKeyHash(this.lookupKey(job.chatId, job.messageId, job.slot))}`
  }

  private inlineFigureForJob(jobId: string): HTMLElement | null {
    for (const figure of document.querySelectorAll<HTMLElement>('figure[data-swarm-studio-image="true"]')) {
      if (figure.dataset.swarmStudioJobId === jobId) return figure
    }
    return null
  }

  private inlineJobFromTarget(target: HTMLElement | null): { figure: HTMLElement; job: TaggedImageJobView } | null {
    const figure = target?.closest<HTMLElement>('figure[data-swarm-studio-image="true"][data-swarm-studio-job-id]')
    const jobId = figure?.dataset.swarmStudioJobId || ""
    if (!figure || !jobId) return null
    const known = this.jobs.get(jobId)
    if (known) return { figure, job: known }
    return {
      figure,
      job: {
        id: jobId,
        key: "",
        chatId: "",
        messageId: "",
        slot: figure.dataset.swarmStudioSlot || "image",
        prompt: "",
        negativePrompt: "",
        aspect: "",
        alt: figure.querySelector<HTMLImageElement>("img")?.alt || "Generated illustration",
        status: "ready",
        clientJobId: "",
        imageId: "",
        imageUrl: figure.querySelector<HTMLImageElement>("img")?.src || "",
        inserted: true,
        error: "",
      },
    }
  }

  private remove(job: TaggedImageJobView): void {
    const id = this.widgetId(job)
    this.cleanups.get(id)?.()
    this.cleanups.delete(id)
  }

  private render(job: TaggedImageJobView): void {
    const widgetId = this.widgetId(job)
    this.cleanups.get(widgetId)?.()
    const labels: Record<TaggedImageJobView["status"], string> = {
      requested: "Illustration requested",
      queued: "Queued for SwarmUI",
      generating: "Rendering in SwarmUI",
      ready: "Finishing illustration",
      failed: "Illustration unavailable",
      cancelled: "Illustration stopped",
    }
    const action = job.status === "requested"
      ? `<button data-action="generate">Generate image</button>`
      : job.status === "failed" || job.status === "cancelled"
        ? `<button data-action="retry">Retry</button>`
        : ""
    const busy = job.status === "queued" || job.status === "generating" || job.status === "ready"
    const visual = busy
      ? `<div class="emblem"><i class="spinner" aria-label="Generating"></i></div>`
      : `<div class="emblem">${FRAME_WALL_ICON}</div>`
    const error = job.error ? `<p class="error">${widgetEscape(job.error)}</p>` : ""
    const html = `
      <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; color: var(--lumiverse-text, #f5f5f7); background: transparent; }
        .card { position: relative; display: grid; grid-template-columns: 54px minmax(0,1fr) auto; gap: 11px; align-items: center; min-height: 68px; padding: 8px 9px; border: 1px solid color-mix(in srgb, var(--lumiverse-accent, #b994ff) 28%, var(--lumiverse-border, #35313f)); border-radius: var(--lumiverse-radius, 12px); background: linear-gradient(115deg, color-mix(in srgb, var(--lumiverse-accent, #b994ff) 9%, var(--lumiverse-fill, #111116)), var(--lumiverse-fill, #111116)); overflow: hidden; }
        .emblem { width: 54px; height: 54px; border-radius: calc(var(--lumiverse-radius, 12px) * .72); border: 1px solid var(--lumiverse-border, #35313f); background: var(--lumiverse-fill-subtle, #191820); }
        .emblem { display: grid; place-items: center; color: var(--lumiverse-accent, #b994ff); }
        .emblem svg { width: 28px; height: 28px; fill: currentColor; }
        .spinner { width: 22px; height: 22px; border: 2px solid color-mix(in srgb, currentColor 22%, transparent); border-top-color: currentColor; border-radius: 50%; animation: spin .85s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .copy { min-width: 0; }
        strong { display: block; font: 600 12px/1.2 Georgia, ui-serif, serif; letter-spacing: .01em; }
        p { margin: 4px 0 0; color: var(--lumiverse-text-muted, #aaa6b1); font-size: 10px; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .error { color: #ff9caa; white-space: normal; }
        .actions { display: flex; align-items: center; gap: 5px; }
        button { min-height: 30px; padding: 0 10px; border: 1px solid var(--lumiverse-border, #35313f); border-radius: calc(var(--lumiverse-radius, 12px) * .65); background: var(--lumiverse-fill-subtle, #191820); color: var(--lumiverse-text, #f5f5f7); font: 600 10px/1 system-ui, sans-serif; cursor: pointer; }
        button:hover { border-color: var(--lumiverse-accent, #b994ff); }
        .menu { width: 30px; padding: 0; font-size: 16px; }
        @media (max-width: 480px) { .card { grid-template-columns: 46px minmax(0,1fr) auto; gap: 8px; } .emblem { width:46px;height:46px; } button:not(.menu) { padding: 0 8px; } }
      </style>
      <div class="card" id="card">
        ${visual}
        <div class="copy"><strong>${widgetEscape(labels[job.status])}</strong><p>${widgetEscape(job.alt || job.prompt || job.slot)}</p>${error}</div>
        <div class="actions">${action}<button class="menu" data-action="menu" aria-label="Illustration actions">⋯</button></div>
      </div>
      <script>
        const send = (type) => window.spindleSandbox.postMessage({ type })
        document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => send(button.dataset.action)))
        const card = document.getElementById('card')
        card.addEventListener('contextmenu', (event) => { event.preventDefault(); send('menu') })
        let timer = null
        card.addEventListener('touchstart', () => { timer = setTimeout(() => send('menu'), 520) }, { passive: true })
        card.addEventListener('touchmove', () => { clearTimeout(timer); timer = null }, { passive: true })
        card.addEventListener('touchend', () => { clearTimeout(timer); timer = null })
      </script>`
    const cleanup = this.ctx.messages.renderWidget({ messageId: job.messageId, widgetId, html }, (message: any) => {
      void this.handleWidgetAction(job, String(message?.type || ""))
    })
    this.cleanups.set(widgetId, cleanup)
  }

  private async handleWidgetAction(job: TaggedImageJobView, action: string): Promise<void> {
    if (action === "generate" || action === "retry") {
      this.retry(job, "current")
      return
    }
    if (action !== "menu") return
    await this.showJobMenu(job, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2))
  }

  private async showJobMenu(job: TaggedImageJobView, x: number, y: number): Promise<void> {
    const result = await this.ctx.ui.showContextMenu({
      position: { x: Math.max(8, Math.round(x)), y: Math.max(8, Math.round(y)) },
      items: [
        { key: "retry-current", label: job.inserted ? "Regenerate with current Studio settings" : job.status === "requested" ? "Generate with current Studio settings" : "Retry with current Studio settings" },
        { key: "retry-original", label: "Retry with original settings", disabled: !job.clientJobId },
        { key: "edit", label: "Edit prompt in Quick Create", disabled: !job.prompt && !this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot)) },
        { key: "divider", label: "", type: "divider" },
        { key: "studio", label: "Open Swarm Studio" },
        { key: "library", label: "Open output library" },
      ],
    })
    if (result.selectedKey === "retry-current") this.retry(job, "current")
    if (result.selectedKey === "retry-original") this.retry(job, "original")
    if (result.selectedKey === "edit") {
      const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot))
      const prompt = String(tag?.content || job.prompt)
      const opened = this.openQuickCreateWithPrompt(prompt, job.negativePrompt, (editedPrompt, editedNegative) => {
        this.retry(job, "current", {
          prompt: editedPrompt,
          negativePrompt: editedNegative,
        })
      })
      if (!opened) this.openStudioWithPrompt(prompt, job.negativePrompt)
    }
    if (result.selectedKey === "studio") this.openStudioWithPrompt("", "")
    if (result.selectedKey === "library") this.openLibrary()
  }

  private retry(
    job: TaggedImageJobView,
    retryMode: "current" | "original",
    overrides?: { prompt: string; negativePrompt: string },
  ): void {
    const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot))
    job.status = "queued"
    job.error = ""
    const inlineFigure = this.inlineFigureForJob(job.id)
    if (inlineFigure) inlineFigure.dataset.state = "queued"
    else this.render(job)
    if (overrides) {
      this.ctx.sendToBackend({
        type: "retry_tagged_job",
        requestId: crypto.randomUUID(),
        jobId: job.id,
        retryMode,
        promptOverride: overrides.prompt,
        negativePromptOverride: overrides.negativePrompt,
      })
      return
    }
    if (tag) {
      this.ctx.sendToBackend({
        type: "tag_generate",
        requestId: crypto.randomUUID(),
        chatId: tag.chatId,
        messageId: tag.messageId,
        fullMatch: tag.fullMatch,
        attrs: tag.attrs,
        content: tag.content,
        force: true,
        retryMode,
      })
      return
    }
    this.ctx.sendToBackend({
      type: "retry_tagged_job",
      requestId: crypto.randomUUID(),
      jobId: job.id,
      retryMode,
    })
  }
}

class ChatVisualsController {
  private readonly ctx: FrontendContext
  private readonly launcher: HTMLElement
  private readonly getCurrentStack: () => StackPresetItem[] | null
  private readonly openStudio: () => void
  private readonly openLibrary: () => void
  private readonly page: HTMLElement
  private data: ChatVisualsState | null = null
  private selectedPersonaPresetId = ""
  private selectedStackValue = ""
  private importedSourcePresetId = ""
  private lumiversePersonaPresets: LumiversePersonaPromptPreset[] = []
  private lumiversePresetLoadToken = 0

  constructor(
    ctx: FrontendContext,
    launcher: HTMLElement,
    getCurrentStack: () => StackPresetItem[] | null,
    openStudio: () => void,
    openLibrary: () => void,
  ) {
    this.ctx = ctx
    this.launcher = launcher
    this.getCurrentStack = getCurrentStack
    this.openStudio = openStudio
    this.openLibrary = openLibrary
    this.page = element("section", "ss-chat-visuals-page")
    this.page.hidden = true
    this.page.innerHTML = `
      <div class="ss-chat-visuals-head">
        <button class="ss-icon-button" data-action="visuals-back" title="Back to Swarm Studio" aria-label="Back">${BACK_ICON}</button>
        <div class="ss-chat-visuals-head-copy">
          <strong>Chat Visuals</strong>
          <span class="ss-muted ss-tiny">Bind image identity without crowding the generation modal.</span>
        </div>
        <button class="ss-icon-button" data-action="visuals-refresh" title="Refresh active chat context" aria-label="Refresh">↻</button>
      </div>
      <div class="ss-chat-visuals-scroll">
        <div class="ss-chat-visuals-context" data-role="visuals-context"></div>

        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Persona</strong><span data-role="persona-caption">The active Lumiverse persona can own a reusable image identity.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="persona-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-persona-profile">Visual profile</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-persona-profile" class="ss-select" data-role="persona-visual-preset"></select>
              <button class="ss-icon-button" data-action="new-persona-visual" title="Create a persona visual profile" aria-label="Create persona visual profile">${PLUS_ICON}</button>
              <button class="ss-icon-button ss-button-danger" data-action="delete-persona-visual" title="Delete selected persona visual profile" aria-label="Delete persona visual profile">${TRASH_ICON}</button>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-lumi-preset">Lumiverse Image Gen persona preset</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-lumi-preset" class="ss-select" data-role="lumiverse-persona-preset"><option value="">Loading persona presets…</option></select>
              <button class="ss-button" data-action="import-persona-prompt">Use preset</button>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-persona-positive">Positive identity prompt</label>
            <textarea id="ss-chat-persona-positive" class="ss-textarea" data-role="persona-positive" placeholder="Visual traits for the active persona…"></textarea>
          </div>
          <div class="ss-chat-visuals-actions">
            <button class="ss-button ss-button-primary" data-action="save-persona-visual">Save &amp; bind to active persona</button>
          </div>
        </section>

        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Character folder</strong><span data-role="character-folder-caption">Creates the Library folder and keeps these prompts synchronized with it.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="character-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-chat-visuals-grid">
            <div class="ss-chat-visuals-field">
              <label for="ss-chat-character-positive">Positive base</label>
              <textarea id="ss-chat-character-positive" class="ss-textarea" data-role="character-positive" placeholder="Stable visual identity for the active character…"></textarea>
            </div>
            <div class="ss-chat-visuals-field">
              <label for="ss-chat-character-negative">Negative base</label>
              <textarea id="ss-chat-character-negative" class="ss-textarea" data-role="character-negative" placeholder="Things to consistently avoid…"></textarea>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-character-checkpoint">Checkpoint</label>
            <select id="ss-chat-character-checkpoint" class="ss-select" data-role="character-checkpoint"><option value="">Use current Studio checkpoint</option></select>
          </div>
        </section>

        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Character LoRA stack</strong><span>Saved presets remain named; edited Studio state is stored as a real Custom snapshot.</span></div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-stack">Stack source</label>
            <select id="ss-chat-stack" class="ss-select" data-role="character-stack"></select>
          </div>
          <div class="ss-muted ss-tiny" data-role="character-stack-caption"></div>
          <div class="ss-chat-visuals-actions">
            <button class="ss-button ss-button-primary" data-action="save-character-visuals">Save character visuals</button>
          </div>
        </section>

        <div class="ss-chat-visuals-status" data-role="chat-visuals-status">Open a chat to configure its active character.</div>
      </div>
      <div class="ss-chat-visuals-footer">
        <button class="ss-button ss-button-primary" data-action="visuals-open-studio">Open Studio</button>
        <button class="ss-button" data-action="visuals-open-library">${LIBRARY_ICON} Library</button>
      </div>
    `
    launcher.appendChild(this.page)
    this.page.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
      const action = button?.dataset.action || ""
      if (action === "visuals-back") this.hide()
      if (action === "visuals-refresh") this.refresh()
      if (action === "new-persona-visual") this.createPersonaVisual()
      if (action === "delete-persona-visual") this.deletePersonaVisual()
      if (action === "import-persona-prompt") this.importPersonaPrompt()
      if (action === "save-persona-visual") this.savePersonaVisual()
      if (action === "save-character-visuals") this.saveCharacterVisuals()
      if (action === "visuals-open-studio") this.openStudio()
      if (action === "visuals-open-library") this.openLibrary()
    })
    this.page.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement
      if (target.dataset.role === "persona-visual-preset") {
        this.selectedPersonaPresetId = target.value
        this.renderPersonaEditor()
      }
      if (target.dataset.role === "lumiverse-persona-preset") {
        this.importedSourcePresetId = target.value
        this.importPersonaPrompt()
      }
      if (target.dataset.role === "character-stack") this.selectedStackValue = target.value
    })
  }

  show(): void {
    this.launcher.dataset.page = "visuals"
    this.page.hidden = false
    this.refresh()
  }

  hide(): void {
    this.launcher.dataset.page = "home"
    this.page.hidden = true
  }

  refresh(): void {
    this.setStatus("Reading the active chat, persona, Library folder, and Studio stack…")
    this.send("get_chat_visuals", { currentStack: this.getCurrentStack() })
  }

  onMessage(payload: any): void {
    if (payload?.type === "chat_visuals_result") {
      this.data = payload.data as ChatVisualsState
      this.selectedPersonaPresetId = this.data.personaBinding?.presetId
        || this.data.personaPresets?.[0]?.id
        || ""
      this.selectedStackValue = this.defaultStackSelection()
      this.render()
      this.setStatus("Chat visual bindings are synchronized.")
      void this.hydrateLumiversePersonaPresets()
      return
    }
    if (payload?.type === "studio_error" && [
      "get_chat_visuals",
      "save_persona_visual_preset",
      "delete_persona_visual_preset",
      "bind_persona_visual_preset",
      "save_chat_visuals",
    ].includes(String(payload.operation || ""))) {
      this.setStatus(String(payload.error || "Could not update Chat Visuals."), true)
    }
  }

  destroy(): void {
    this.page.remove()
  }

  private get<T extends HTMLElement>(role: string): T {
    const node = this.page.querySelector<T>(`[data-role="${role}"]`)
    if (!node) throw new Error(`Chat Visuals element missing: ${role}`)
    return node
  }

  private send(type: string, data: Record<string, unknown> = {}): void {
    this.ctx.sendToBackend({ type, requestId: crypto.randomUUID(), ...data })
  }

  private setStatus(message: string, error = false): void {
    const status = this.get<HTMLElement>("chat-visuals-status")
    status.textContent = message
    status.dataset.error = String(error)
  }

  private render(): void {
    if (!this.data) return
    const context = this.get<HTMLElement>("visuals-context")
    context.replaceChildren()
    context.append(
      element("span", "ss-chat-visuals-chip", this.data.activeChat
        ? `Character · ${this.data.activeChat.characterName || this.data.activeChat.name || "active chat"}`
        : "No active character chat"),
      element("span", "ss-chat-visuals-chip", this.data.activePersona
        ? `Persona · ${this.data.activePersona.name}`
        : "No active persona"),
    )

    const personaSelect = this.get<HTMLSelectElement>("persona-visual-preset")
    personaSelect.replaceChildren()
    const noPersonaProfile = element("option", "", this.data.personaPresets.length
      ? "Choose a visual profile…"
      : "No persona visual profiles yet")
    noPersonaProfile.value = ""
    personaSelect.appendChild(noPersonaProfile)
    for (const preset of this.data.personaPresets) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      personaSelect.appendChild(option)
    }
    personaSelect.value = this.data.personaPresets.some((preset) => preset.id === this.selectedPersonaPresetId)
      ? this.selectedPersonaPresetId
      : ""
    this.get<HTMLInputElement>("persona-visual-enabled").checked = this.data.personaBinding?.enabled !== false
    this.get<HTMLInputElement>("persona-visual-enabled").disabled = !this.data.activePersona
    this.get<HTMLElement>("persona-caption").textContent = this.data.activePersona
      ? `Binding target: ${this.data.activePersona.name}`
      : "Select a Lumiverse persona to bind an image identity."

    this.renderPersonaEditor()
    this.renderLumiversePersonaPresets()

    const folder = this.data.characterFolder
    this.get<HTMLElement>("character-folder-caption").textContent = folder
      ? `${folder.name} · synchronized with Output Library`
      : this.data.activeChat
        ? `No folder yet · saving creates “${this.data.activeChat.characterName || "Character"}”`
        : "Open a character chat to create a visual folder."
    this.get<HTMLTextAreaElement>("character-positive").value = folder?.binding?.positivePrompt || this.data.characterBasePrompt || ""
    this.get<HTMLTextAreaElement>("character-negative").value = folder?.binding?.negativePrompt || ""
    this.get<HTMLInputElement>("character-visual-enabled").checked = folder?.binding?.enabled !== false
    this.get<HTMLInputElement>("character-visual-enabled").disabled = !this.data.activeChat
    const checkpoint = this.get<HTMLSelectElement>("character-checkpoint")
    checkpoint.replaceChildren()
    const currentModel = folder?.binding?.checkpoint || this.data.studioModel || ""
    const models = Array.isArray(this.data.models) ? this.data.models : []
    const current = element("option", "", currentModel ? "Use current Studio checkpoint" : "No checkpoint selected")
    current.value = ""
    checkpoint.appendChild(current)
    if (currentModel && !models.some((model) => model.id === currentModel)) {
      const retained = element("option", "", `${currentModel} · saved`)
      retained.value = currentModel
      checkpoint.appendChild(retained)
    }
    for (const model of models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    checkpoint.value = folder?.binding?.checkpoint || ""

    const stack = this.get<HTMLSelectElement>("character-stack")
    stack.replaceChildren()
    const none = element("option", "", "No bound stack")
    none.value = ""
    stack.appendChild(none)
    if (this.data.studioStack.length) {
      const current = element(
        "option",
        "",
        this.data.studioStackCustom
          ? `Current Studio · Custom · ${this.data.studioStack.length}`
          : `${this.data.stackPresets.find((preset) => preset.id === this.data?.studioStackPresetId)?.name || "Current Studio"} · ${this.data.studioStack.length}`,
      )
      current.value = "__studio__"
      stack.appendChild(current)
    }
    if (folder?.binding?.stackSnapshot?.length && !folder.binding.stackPresetId) {
      const bound = element("option", "", `Bound Custom snapshot · ${folder.binding.stackSnapshot.length}`)
      bound.value = "__bound_custom__"
      stack.appendChild(bound)
    }
    for (const preset of this.data.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = `preset:${preset.id}`
      stack.appendChild(option)
    }
    stack.value = [...stack.options].some((option) => option.value === this.selectedStackValue)
      ? this.selectedStackValue
      : ""
    this.get<HTMLElement>("character-stack-caption").textContent = stack.value === "__studio__"
      ? this.data.studioStackCustom
        ? "Saving will capture this edited Studio stack as Custom."
        : "Saving will bind the matching named stack."
      : stack.value === "__bound_custom__"
        ? "Keeping the custom snapshot already bound to this character."
        : stack.value.startsWith("preset:")
          ? "This named saved stack will load with the character."
          : "No character-specific LoRAs will be inherited."
  }

  private renderPersonaEditor(): void {
    if (!this.data) return
    const preset = this.data.personaPresets.find((candidate) => candidate.id === this.selectedPersonaPresetId)
    this.get<HTMLTextAreaElement>("persona-positive").value = preset?.positivePrompt || ""
    this.importedSourcePresetId = preset?.sourcePresetId || ""
    this.renderLumiversePersonaPresets()
  }

  private renderLumiversePersonaPresets(): void {
    const select = this.get<HTMLSelectElement>("lumiverse-persona-preset")
    select.replaceChildren()
    const blank = element("option", "", this.lumiversePersonaPresets.length
      ? "Choose Image Gen persona preset…"
      : "No Image Gen persona presets")
    blank.value = ""
    select.appendChild(blank)
    for (const preset of this.lumiversePersonaPresets) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      select.appendChild(option)
    }
    select.value = this.lumiversePersonaPresets.some((preset) => preset.id === this.importedSourcePresetId)
      ? this.importedSourcePresetId
      : ""
  }

  private async hydrateLumiversePersonaPresets(): Promise<void> {
    const token = ++this.lumiversePresetLoadToken
    try {
      const exportResponse = await fetch("/api/v1/image-gen/export", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          include_settings: false,
          include_presets: true,
          include_connections: false,
          include_parameters: false,
        }),
      })
      const exported = await exportResponse.json().catch(() => ({}))
      if (!exportResponse.ok) {
        throw new Error(String(exported?.error || `Could not read Lumiverse Image Gen presets (${exportResponse.status}).`))
      }
      const presets = (Array.isArray(exported?.presets) ? exported.presets : [])
        .filter((preset: any) => String(preset?.kind || "main") === "persona")
        .map((preset: any): LumiversePersonaPromptPreset => ({
          id: String(preset?.id || "").trim(),
          name: String(preset?.name || "").trim(),
          prompt: String(preset?.prompt || "").trim(),
          negativePrompt: String(preset?.negativePrompt || "").trim(),
        }))
        .filter((preset: LumiversePersonaPromptPreset) => preset.id && preset.name)
      if (token !== this.lumiversePresetLoadToken) return
      this.lumiversePersonaPresets = presets

      let nativeBindingId = ""
      const personaId = this.data?.activePersona?.id || ""
      if (personaId) {
        const bindingResponse = await fetch(`/api/v1/image-gen/preset-bindings/persona/${encodeURIComponent(personaId)}`, {
          credentials: "include",
          headers: { "Accept": "application/json" },
        })
        if (bindingResponse.ok) {
          const binding = await bindingResponse.json().catch(() => ({}))
          nativeBindingId = String(binding?.preset_id || "")
        }
      }
      if (token !== this.lumiversePresetLoadToken) return
      this.renderLumiversePersonaPresets()
      if (
        !this.selectedPersonaPresetId
        && !this.importedSourcePresetId
        && presets.some((preset) => preset.id === nativeBindingId)
      ) {
        this.importedSourcePresetId = nativeBindingId
        this.renderLumiversePersonaPresets()
        this.importPersonaPrompt(false)
      }
    } catch (error) {
      if (token !== this.lumiversePresetLoadToken) return
      this.lumiversePersonaPresets = []
      this.renderLumiversePersonaPresets()
      this.setStatus(error instanceof Error ? error.message : "Could not read Lumiverse Image Gen persona presets.", true)
    }
  }

  private defaultStackSelection(): string {
    if (!this.data) return ""
    if (this.data.studioStack.length) return "__studio__"
    const binding = this.data.characterFolder?.binding
    if (binding?.stackPresetId) return `preset:${binding.stackPresetId}`
    if (binding?.stackSnapshot?.length) return "__bound_custom__"
    return ""
  }

  private createPersonaVisual(): void {
    if (!this.data?.activePersona) {
      this.setStatus("Select a Lumiverse persona first.", true)
      return
    }
    const name = window.prompt("New persona visual profile", `${this.data.activePersona.name} visuals`)
    if (!name?.trim()) return
    this.send("save_persona_visual_preset", {
      preset: {
        name: name.trim(),
        positivePrompt: this.get<HTMLTextAreaElement>("persona-positive").value,
        sourcePresetId: this.importedSourcePresetId,
      },
      bind: true,
      bindingEnabled: this.get<HTMLInputElement>("persona-visual-enabled").checked,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Creating and binding “${name.trim()}”…`)
  }

  private savePersonaVisual(): void {
    if (!this.data?.activePersona) {
      this.setStatus("Select a Lumiverse persona first.", true)
      return
    }
    const selected = this.data.personaPresets.find((preset) => preset.id === this.selectedPersonaPresetId)
    if (!selected) {
      this.createPersonaVisual()
      return
    }
    this.send("save_persona_visual_preset", {
      preset: {
        ...selected,
        positivePrompt: this.get<HTMLTextAreaElement>("persona-positive").value,
        sourcePresetId: this.importedSourcePresetId || selected.sourcePresetId,
      },
      bind: true,
      bindingEnabled: this.get<HTMLInputElement>("persona-visual-enabled").checked,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Saving and binding “${selected.name}”…`)
  }

  private deletePersonaVisual(): void {
    const selected = this.data?.personaPresets.find((preset) => preset.id === this.selectedPersonaPresetId)
    if (!selected || !window.confirm(`Delete persona visual profile “${selected.name}”?`)) return
    this.send("delete_persona_visual_preset", {
      presetId: selected.id,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Deleting “${selected.name}”…`)
  }

  private importPersonaPrompt(announce = true): void {
    const presetId = this.get<HTMLSelectElement>("lumiverse-persona-preset").value
      || this.importedSourcePresetId
    const preset = this.lumiversePersonaPresets.find((candidate) => candidate.id === presetId)
    if (!preset) {
      this.setStatus("Choose a Lumiverse preset first.", true)
      return
    }
    this.importedSourcePresetId = preset.id
    this.get<HTMLSelectElement>("lumiverse-persona-preset").value = preset.id
    this.get<HTMLTextAreaElement>("persona-positive").value = preset.prompt
    if (announce) {
      this.setStatus(
        preset.prompt
          ? `Loaded “${preset.name}” from Lumiverse Image Gen. Review it, then save and bind.`
          : `“${preset.name}” has no positive prompt yet; enter the persona identity manually.`,
        !preset.prompt,
      )
    }
  }

  private saveCharacterVisuals(): void {
    if (!this.data?.activeChat) {
      this.setStatus("Open a character chat first.", true)
      return
    }
    const value = this.get<HTMLSelectElement>("character-stack").value
    let stackPresetId = ""
    let stackSnapshot: StackPresetItem[] = []
    if (value === "__studio__") {
      stackPresetId = this.data.studioStackCustom ? "" : this.data.studioStackPresetId
      stackSnapshot = this.data.studioStack
    } else if (value === "__bound_custom__") {
      stackSnapshot = this.data.characterFolder?.binding?.stackSnapshot || []
    } else if (value.startsWith("preset:")) {
      stackPresetId = value.slice("preset:".length)
    }
    this.send("save_chat_visuals", {
      folderName: this.data.activeChat.characterName || "Character visuals",
      positivePrompt: this.get<HTMLTextAreaElement>("character-positive").value,
      negativePrompt: this.get<HTMLTextAreaElement>("character-negative").value,
      checkpoint: this.get<HTMLSelectElement>("character-checkpoint").value,
      stackPresetId,
      stackSnapshot,
      enabled: this.get<HTMLInputElement>("character-visual-enabled").checked,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(this.data.characterFolder ? "Saving character visuals…" : "Creating and binding the character folder…")
  }
}

let activeStudio: StudioController | null = null
let activeModal: any | null = null

export function setup(ctx: FrontendContext): () => void {
  const removeStyle = ctx.dom.addStyle(`${STYLES}\n${STUDIO_V3_STYLES}`)
  let currentTheme = storedStudioTheme()
  let appearance = storedStudioAppearance()
  let behavior = storedStudioBehavior()
  appearance.customCss = sanitizeCustomCss(appearance.customCss)
  if (studioAppearanceIsCustom(appearance)) currentTheme = "custom"
  let launcher: HTMLElement | null = null
  let miniplayer: MiniPlayerController | null = null
  let taggedImages: TaggedImageController | null = null
  let chatVisuals: ChatVisualsController | null = null
  let removeCustomStyle: (() => void) | null = appearance.customCss
    ? ctx.dom.addStyle(appearance.customCss)
    : null

  const setThemeState = (theme: StudioTheme) => {
    currentTheme = theme
    persistStudioTheme(theme)
    if (launcher) launcher.dataset.theme = theme
    activeStudio?.setTheme(theme)
  }

  const updateAppearance = (next: StudioAppearance) => {
    appearance = cloneStudioAppearance(next)
    appearance.customCss = sanitizeCustomCss(appearance.customCss)
    setThemeState(studioAppearanceIsCustom(appearance) ? "custom" : "lumiverse")
    persistStudioAppearance(appearance)
    if (launcher) applyAppearanceVariables(launcher, appearance)
    miniplayer?.setAppearance(appearance)
    activeStudio?.setAppearance(appearance)
    removeCustomStyle?.()
    removeCustomStyle = appearance.customCss ? ctx.dom.addStyle(appearance.customCss) : null
  }

  const selectTheme = (theme: StudioTheme) => {
    if (theme === "lumiverse") appearance = defaultStudioAppearance()
    setThemeState(theme)
    updateAppearance(appearance)
  }

  const updateBehavior = (next: StudioBehavior) => {
    behavior = { ...next }
    persistStudioBehavior(behavior)
    miniplayer?.setBehavior(behavior)
    activeStudio?.setBehavior(behavior)
    taggedImages?.setBehavior(behavior)
    ctx.sendToBackend({
      type: "set_tag_automation",
      requestId: crypto.randomUUID(),
      config: {
        autoGenerate: behavior.tagAutoGenerate,
        injectProtocol: behavior.tagPromptInjection,
        completionToast: behavior.completionToast,
        requiredImageMin: behavior.requiredImageMin,
        requiredImageMax: behavior.requiredImageMax,
      },
    })
  }

  const openStudio = (initialView: "studio" | "library" = "studio") => {
    if (activeModal) {
      if (initialView === "library") activeStudio?.openLibrary()
      return
    }
    miniplayer?.setStudioOpen(true)
    let modal: any
    try {
      modal = ctx.ui.showModal({
        title: "Swarm Studio",
        width: 1440,
        maxHeight: 980,
        persistent: false,
      })
    } catch (error) {
      miniplayer?.setStudioOpen(false)
      throw error
    }
    activeModal = modal
    activeStudio = new StudioController(
      ctx,
      modal,
      selectTheme,
      updateAppearance,
      behavior,
      updateBehavior,
      miniplayer,
    )
    activeStudio.setAppearance(appearance)
    activeStudio.setTheme(currentTheme)
    activeStudio.setBehavior(behavior)
    if (initialView === "library") activeStudio.openLibrary()
    modal.onDismiss(() => {
      miniplayer?.captureDraft(activeStudio?.exportDraft() || null)
      activeStudio?.dispose()
      activeStudio = null
      activeModal = null
      miniplayer?.setStudioOpen(false)
      chatVisuals?.refresh()
    })
  }

  const openStudioWithTaggedPrompt = (prompt: string, negativePrompt: string) => {
    openStudio("studio")
    if (prompt) activeStudio?.loadTaggedPrompt(prompt, negativePrompt)
  }

  taggedImages = new TaggedImageController(
    ctx,
    behavior,
    openStudioWithTaggedPrompt,
    (prompt, negativePrompt, onConfirm) =>
      miniplayer?.openTaggedPromptEditor(prompt, negativePrompt, onConfirm) === true,
    () => openStudio("library"),
  )
  ctx.sendToBackend({
    type: "set_tag_automation",
    requestId: crypto.randomUUID(),
    config: {
      autoGenerate: behavior.tagAutoGenerate,
      injectProtocol: behavior.tagPromptInjection,
      completionToast: behavior.completionToast,
      requiredImageMin: behavior.requiredImageMin,
      requiredImageMax: behavior.requiredImageMax,
    },
  })
  const unregisterTagInterceptor = ctx.messages.registerTagInterceptor(
    { tagName: "swarm-image", attrs: { request: "generate" }, removeFromMessage: true },
    (payload: any) => taggedImages?.handleTag(payload),
  )

  if (typeof document !== "undefined") {
    try {
      const mobile = (document.documentElement.clientWidth || window.innerWidth) <= 720
      // Prefer Lumiverse's own float-widget layer. It naturally sits below
      // drawers/modals and survives app tab transitions. The direct overlay is
      // only a compatibility fallback for hosts without createFloatWidget.
      const widget = (typeof ctx.ui.createFloatWidget === "function"
        ? ctx.ui.createFloatWidget({
            width: mobile ? 64 : 318,
            height: mobile ? 64 : 94,
            snapToEdge: true,
            tooltip: "Swarm Studio miniplayer",
            chromeless: true,
          })
        : null) || createOverlayMiniplayerWidget()
      if (!widget) throw new Error("No supported miniplayer surface")
      miniplayer = new MiniPlayerController(
        ctx,
        widget,
        () => openStudio("studio"),
        () => openStudio("library"),
        () => activeStudio?.exportDraft() || null,
        behavior,
        updateBehavior,
      )
      miniplayer.setAppearance(appearance)
    } catch {
      miniplayer = null
    }
  }

  const drawer = ctx.ui.registerDrawerTab({
    id: "swarm-studio",
    title: "Swarm Studio",
    shortName: "Swarm",
    headerTitle: "Swarm Studio",
    description: "Open the metadata-aware SwarmUI prompt and LoRA studio",
    keywords: ["image", "generation", "lora", "swarmui", "prompt", "studio"],
    iconSvg: FRAME_WALL_ICON,
  })
  launcher = element("div", "ss-launcher")
  launcher.dataset.page = "home"
  launcher.dataset.theme = currentTheme
  applyAppearanceVariables(launcher, appearance)
  for (const corner of ["tl", "tr", "br", "bl"]) {
    const ornament = element("span", "ss-launcher-corner")
    ornament.dataset.corner = corner
    launcher.appendChild(ornament)
  }
  const launcherCenter = element("div", "ss-launcher-center")
  const emblem = element("div", "ss-launcher-emblem")
  emblem.innerHTML = FRAME_WALL_ICON
  const wordmark = element("div", "ss-launcher-wordmark")
  wordmark.appendChild(document.createTextNode("Swarm Studio"))
  const sparkle = element("span")
  sparkle.innerHTML = SPARKLE_ICON
  wordmark.appendChild(sparkle)
  const launcherActions = element("div", "ss-launcher-actions")
  const launchButton = element("button", "ss-button ss-button-primary", "Open Studio")
  launchButton.addEventListener("click", () => openStudio("studio"))
  const libraryButton = element("button", "ss-button")
  libraryButton.innerHTML = `${LIBRARY_ICON}<span>Open Library</span>`
  libraryButton.addEventListener("click", () => openStudio("library"))
  const visualsButton = element("button", "ss-button ss-launcher-visuals-button")
  visualsButton.innerHTML = `${CHAT_VISUALS_ICON}<span>Chat Visuals</span>`
  visualsButton.addEventListener("click", () => chatVisuals?.show())
  launcherActions.append(launchButton, libraryButton, visualsButton)
  launcherCenter.append(emblem, wordmark, launcherActions)
  launcher.appendChild(launcherCenter)
  chatVisuals = new ChatVisualsController(
    ctx,
    launcher,
    () => activeStudio?.exportDraft()?.stack || miniplayer?.snapshot()?.draft?.stack || null,
    () => openStudio("studio"),
    () => openStudio("library"),
  )
  drawer.root.appendChild(launcher)

  const inputAction = ctx.ui.registerInputBarAction({
    id: "open-swarm-studio",
    label: "Open Swarm Studio",
    iconSvg: FRAME_WALL_ICON,
    enabled: true,
  })
  const removeActionClick = inputAction.onClick(() => openStudio("studio"))
  const unsubscribeMessages = ctx.onBackendMessage((payload: any) => {
    miniplayer?.onMessage(payload)
    activeStudio?.onMessage(payload)
    taggedImages?.onMessage(payload)
    chatVisuals?.onMessage(payload)
  })
  ctx.sendToBackend({
    type: "list_tagged_jobs",
    requestId: crypto.randomUUID(),
  })
  const unsubscribeProgress = ctx.events.on("IMAGE_GEN_PROGRESS", (payload: any) => {
    miniplayer?.onImageGenerationEvent("progress", payload)
    activeStudio?.onImageGenerationEvent("progress", payload)
  })
  const unsubscribeComplete = ctx.events.on("IMAGE_GEN_COMPLETE", (payload: any) => {
    miniplayer?.onImageGenerationEvent("complete", payload)
    activeStudio?.onImageGenerationEvent("complete", payload)
  })
  const unsubscribeError = ctx.events.on("IMAGE_GEN_ERROR", (payload: any) => {
    miniplayer?.onImageGenerationEvent("error", payload)
    activeStudio?.onImageGenerationEvent("error", payload)
  })
  miniplayer?.bootstrap()

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
    unregisterTagInterceptor()
    taggedImages?.destroy()
    taggedImages = null
    chatVisuals?.destroy()
    chatVisuals = null
    miniplayer?.destroy()
    miniplayer = null
    removeCustomStyle?.()
    removeStyle()
  }
}
