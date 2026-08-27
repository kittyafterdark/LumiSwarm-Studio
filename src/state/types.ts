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
  protocolPrompt: string
  requestMode: "inline" | "parser"
  parserConnectionId: string
  parserModel: string
  stripUserOnlyLoraStack: boolean
  autoPrintCharacterPositive: boolean
  inlineImageScale: 100 | 75 | 50
  requiredImageMin: number
  requiredImageMax: number
  tagPromptMode: "multi" | "pov"
  tagPromptFamily: "anima" | "illustrious"
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
  metadataSource?: "swarm-path" | "studio" | "record-fallback"
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
    sourcePresetId: string
    enabled: boolean
    activeLookId: string
    looks: CharacterVisualLook[]
  } | null
  updatedAt: number
}

interface CharacterVisualLook {
  id: string
  name: string
  aliases: string[]
  outfitPrompt: string
  negativePrompt: string
  checkpoint: string
  stackPresetId: string
  stackSnapshot: StackPresetItem[]
  referenceImageId: string
  referenceImageUrl: string
  thumbnailImageId: string
  thumbnailUrl: string
  triggerWords: string[]
  notes: string
  updatedAt: number
}

interface VisualLoreIdentity {
  enabled: boolean
  entityType: "character" | "location" | "object" | "creature" | "outfit" | "style"
  aliases: string[]
  positivePrompt: string
  negativePrompt: string
  checkpointFamily: string
  checkpoint: string
  stackPresetId: string
  stackSnapshot: StackPresetItem[]
  referenceImageId: string
  referenceImageUrl: string
  preferredAspect: string
  recipe: Record<string, unknown>
  notes: string
  updatedAt: number
}

interface PersonaVisualPreset {
  id: string
  name: string
  positivePrompt: string
  sourcePresetId: string
  updatedAt: number
}

interface LumiversePromptPreset {
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
  parserConnections: any[]
  parserModels: Array<{ id: string; label: string }>
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
