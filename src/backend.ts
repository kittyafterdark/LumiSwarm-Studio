declare const spindle: any

type JsonObject = Record<string, unknown>

interface SwarmConnection {
  id: string
  name: string
  provider: string
  api_url: string
  model: string
  is_default: boolean
  default_parameters?: Record<string, unknown>
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
  sourceUrl: string
}

interface StackPreset {
  id: string
  name: string
  items: StackPresetItem[]
  updatedAt: number
}

interface GenerationRecord {
  imageId: string
  imageUrl: string
  prompt: string
  negativePrompt: string
  resolvedPrompt: string
  resolvedNegativePrompt: string
  model: string
  parameters: JsonObject
  loras: Array<{ name: string; weight: number }>
  presets: string[]
  workflow: string
  timing: {
    totalMs: number
    prep: string
    generation: string
    source: "swarm" | "measured"
  }
  swarmPath: string
  swarmPathVerified: boolean
  initImageId: string
  initImageLabel: string
  createdAt: number
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
  group: {
    id: string
    name: string
    description: string
    open: boolean
    advanced: boolean
    canShrink: boolean
    toggles: boolean
  } | null
}

interface SwarmWorkflowDetails extends SwarmWorkflowSummary {
  parameters: SwarmWorkflowParameter[]
}

interface SwarmOptions {
  samplers: string[]
  schedulers: string[]
  presets: SwarmPreset[]
  parameters: SwarmParameter[]
  canManagePresets: boolean
  workflows: SwarmWorkflowSummary[]
  workflowError: string
}

interface OutputFolder {
  id: string
  name: string
  imageIds: string[]
  binding: OutputFolderBinding | null
  updatedAt: number
}

interface OutputFolderBinding {
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

type VisualLoreEntityType = "character" | "location" | "object" | "creature" | "outfit" | "style"

interface VisualLoreIdentity {
  enabled: boolean
  entityType: VisualLoreEntityType
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
  recipe: JsonObject
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

interface PersonaVisualBinding {
  presetId: string
  enabled: boolean
}

interface TagAutomationConfig {
  autoGenerate: boolean
  injectProtocol: boolean
  completionToast: boolean
  protocolPrompt: string
  requestMode: "inline" | "parser"
  parserConnectionId: string
  parserModel: string
  stripUserOnlyLoraStack: boolean
  autoPrintCharacterPositive: boolean
  requiredImageMin: number
  requiredImageMax: number
  promptMode: "multi" | "pov"
  promptFamily: "anima" | "illustrious"
}

interface CharacterBaseTagEntry {
  characterId: string
  tags: string
  updatedAt: number
}

type LoraDownloadJobStatus =
  | "preparing"
  | "connecting"
  | "downloading"
  | "complete"
  | "failed"
  | "cancelled"

interface LoraDownloadQueueItem {
  url: string
  name: string
  title: string
}

interface LoraDownloadJob {
  id: string
  requestId: string
  userId?: string
  connectionId: string
  items: LoraDownloadQueueItem[]
  index: number
  status: LoraDownloadJobStatus
  currentProgress: number
  overallProgress: number
  message: string
  error: string
  startedAt: number
  updatedAt: number
  cancelled: boolean
  socket: WebSocket | null
}

type TaggedImageJobStatus = "requested" | "queued" | "generating" | "ready" | "failed" | "cancelled"

interface TaggedImageJob {
  id: string
  key: string
  chatId: string
  messageId: string
  slot: string
  prompt: string
  negativePrompt: string
  aspect: string
  alt: string
  fullMatch: string
  status: TaggedImageJobStatus
  clientJobId: string
  imageId: string
  imageUrl: string
  inserted: boolean
  error: string
  ownerCharacterId: string
  createdAt: number
  updatedAt: number
  generationInput?: JsonObject
  recordHints?: JsonObject
}

interface StudioGenerationProfile {
  input: JsonObject
  recordHints: JsonObject
  updatedAt: number
}

interface SwarmProtocolContext {
  characterId: string
  characterTags: string
  characterLooks: Array<{ id: string; name: string; aliases: string[]; active: boolean; notes: string }>
  personaId: string
  personaName: string
  personaTags: string
}

interface SessionCacheEntry {
  sessionId: string
  expiresAt: number
}

const SESSION_TTL_MS = 20 * 60 * 1000
const SESSION_CACHE_LIMIT = 64
const PREVIEW_CACHE_LIMIT = 64
const STACK_PRESETS_FILE = "lora-stack-presets.json"
const GENERATION_RECORDS_FILE = "generation-records.json"
const OUTPUT_FOLDERS_FILE = "output-folders.json"
const FAVORITES_FOLDER_ID = "__swarm_studio_favorites__"
const FAVORITES_FOLDER_NAME = "Favorites"
const TAG_AUTOMATION_CONFIG_FILE = "tag-automation-config.json"
const TAGGED_IMAGE_JOBS_FILE = "tagged-image-jobs.json"
const STUDIO_GENERATION_PROFILE_FILE = "studio-generation-profile.json"
const CHARACTER_BASE_TAGS_FILE = "character-base-tags.json"
const PERSONA_VISUAL_PRESETS_FILE = "persona-visual-presets.json"
const VISUAL_LORE_NAMESPACE = "swarm_studio_visuals"
const STACK_PRESET_LIMIT = 40
const PERSONA_VISUAL_PRESET_LIMIT = 80
const GENERATION_RECORD_LIMIT = 100
const OUTPUT_FOLDER_LIMIT = 80
const TAGGED_IMAGE_JOB_LIMIT = 160
// Assistant messages may remain transient for a surprisingly long time after
// generation ends, especially when several image tags finish together.
const TAGGED_FINALIZE_RETRY_DELAYS_MS = [
  0, 250, 750, 1_500, 3_000, 5_000, 8_000, 12_000, 18_000, 25_000,
] as const
const HISTORY_PAGE_SIZE = 12
const CONTEXT_IMAGE_MEMORY_LIMIT = 6
const DEFAULT_SWARMUI_URL = "http://localhost:7801"
const NO_CHARACTER_NEGATIVE = "people, person, character, human, humanoid, crowd, girl, boy, woman, man"
const sessions = new Map<string, SessionCacheEntry>()
const previewCache = new Map<string, string>()
const loraDownloadJobs = new Map<string, LoraDownloadJob>()
const generationControllers = new Map<string, {
  controller: AbortController
  nativeStream: boolean
}>()
let legacyGenerationFallbackLogged = false
const runningTaggedJobs = new Set<string>()
const runningParserCompletions = new Set<string>()
const taggedMessageFinalizeLocks = new Map<string, Promise<void>>()
const taggedFinalizeRetries = new Map<string, Promise<boolean>>()
const taggedFinalizeMessageTargets = new Map<string, string>()
const swarmProtocolContexts = new Map<string, SwarmProtocolContext>()

const SWARM_IMAGE_PROTOCOL_BASE = `SWARM STUDIO IMAGE REQUEST PROTOCOL
Place this exact XML-like request wherever an illustration selected under the image-count instructions should appear. Attributes may be written on one line or separate lines:
<swarm-image
  request="generate"
  slot="short-stable-name"
  aspect="4:3"
  character="active"
  look="default"
  persona="none"
  alt="brief accessible description"
>
scene-specific SwarmUI prompt</swarm-image>
The request="generate" marker is required. Emit the tag only as an actual image request: never quote it, explain it, demonstrate it in visible prose, or emit an empty/partial opening tag. The tag body is a diffusion prompt, not prose for the user and not an HTML shell. Do not nest another <swarm-image> tag inside it.

LOCAL GENERATION
The tag is executed by the user's configured local SwarmUI installation and local hardware. You are not claiming to render the image yourself, calling a remote image service, or embedding a pre-existing web image. Follow the conversation's actually applicable instructions, but do not invent or quote a remote image provider's policy, capability restriction, quota, moderation rule, or refusal: no remote image provider is being invoked by this tag. When an illustration is appropriate, emit the request tag and continue the reply naturally; do not apologize that you cannot generate images, ask the user to open another tool, warn that an external image model may refuse, or replace the request with image-search instructions.

IDENTITY AND SUBJECT RULES
Never use a chat character's or persona's display name as a diffusion token. A conversational name does not teach the checkpoint appearance. character="active" selects the active character card as an available visual identity source; it does not force that source to resolve to exactly one image subject. A multi-NPC card may contribute multiple distinct visible subjects when the scene calls for them. look="formal" selects a named canonical look (omit it to use the active/default look); persona="active" independently selects the bound persona identity as a visible subject source. Follow the live identity guidance below for whether those tags are copied automatically or should be selected into the tag body. A canonical character/series tag is allowed only when explicitly supplied as a trained tag.

Resolve visible subjects from the current scene before compiling the prompt. Visible-subject count equals the number of resolved people the image must render, not the number of character cards, the persona state, or the POV state. When one card contains multiple NPC definitions, copy each selected NPC's concrete appearance and attire into that NPC's own visually anchored subject section; never flatten the card's combined identity text into one global subject. Keep automatic character-prompt printing off for multi-NPC cards so the relevant identity fragments can be selected per subject.

Treat the tag body as a small visual scene plan. Establish the exact visible-person count first, then camera, visually anchored subject sections, shared interaction, spatial relation, and environment. Each subject section owns its spatial anchor, identity/distinguishing appearance, attire, expression, pose, individual action, and gaze. Prefer image-space anchors such as left, right, foreground, background, nearest the camera, or farther from the camera; planner labels such as character 1 are not useful final diffusion phrasing.

Swarm Studio compiles eligible multi-subject scene plans into native SwarmUI <region:x,y,width,height,strength> conditioning with generous overlapping subject regions and a <region:background> environment. Do not invent coordinates or write <region:...> directives yourself. Keep shared interaction, camera, and spatial relationships in their dedicated global fields; subject-local appearance and action stay in each anchored subject field. Single-subject and ordinary POV plans remain unregionalized.

Every visible fact has exactly one owner. Subject-specific appearance, clothing, expression, pose, action, and gaze belong only to that subject. Physical contact or an action jointly performed by multiple visible subjects belongs only to shared interaction. Camera/framing facts belong only to camera. Lighting, location, furniture, weather, and background facts belong only to environment. Do not repeat one fact across sections. Keep a one-actor action on its actor and identify the recipient spatially; put a jointly performed action once in shared interaction.

persona="none" means the active persona is not visibly rendered or identity-conditioned. It does not prohibit an implied first-person observer/camera. When character="active" and persona="none", a POV scene normally contains one visible focal character; the viewer/camera is a reference point, not a second character slot. Express a focal subject's relation as looking at viewer, eye contact, leaning toward viewer, or reaching toward viewer. Do not render the viewer's face or full body unless explicitly requested; a scene-required first-person hand or arm does not add a second visible person.

character="none" means the active chat character must not be visible. Do not use character="none" merely because the scene is first-person or POV. To show the active character from the user's POV, use character="active" persona="none". When both are none, Swarm Studio keeps its scenery/no-character negative guard. Use persona="active" only when the active persona is visibly rendered. Normalize an unseen third party to looking off-screen or a direction-specific gaze instead of asking the checkpoint to render another character.

Do not emit contradictory counts such as solo with 2girls. Do not use BREAK, XML-like pseudo-scoping, or bracketed character identifiers as semantic separators. The current Studio negative prompt is applied automatically. Native SwarmUI preset syntax is <preset:exact saved preset name>; preserve it exactly. Supported aspects are 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, and 16:9. Default inline prose illustrations to 4:3 (or 3:4 for a materially better portrait); reserve phone/widescreen ratios for matching media layouts. Do not put Markdown fences around the tag.`
const DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT = `${SWARM_IMAGE_PROTOCOL_BASE}

{{swarm_dynamic_guidance}}`
const SWARM_PARSER_REQUEST_PROTOCOL_BASE = `SWARM STUDIO IMAGE PLACEMENT PROTOCOL
When an illustration should appear in the reply, place this exact lightweight XML-like request at that position. Attributes may be written on one line or separate lines:
<swarm-image
  request="parse"
  slot="short-stable-name"
  aspect="4:3"
  character="active"
  look="default"
  persona="none"
  alt="brief accessible description"
>
brief visual intent grounded in the current scene</swarm-image>

The request="parse" marker is required. The tag body is a concise visual brief for a separate local parser model, not a finished diffusion prompt and not prose for the user. Include the visible subjects, action, expression, framing, environment, and lighting without copying biographies, mannerisms, lore, or display names into the body. The local parser receives the active Studio identities, presets, checkpoint guidance, and negative prompt separately and expands this request after the reply finishes.

Use character="active" only when the active chat character appears and character="none" otherwise. Use look="saved look name" when prose clearly selects a canonical character look; otherwise omit look so the active/default look is inherited. Use persona="active" only when the active persona appears and persona="none" otherwise. Supported aspects are 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, and 16:9. Default inline prose illustrations to 4:3 (or 3:4 for a materially better portrait). Preserve the request in the exact place where the finished image belongs. Do not quote, explain, demonstrate, or wrap it in Markdown fences.`

function asRecord(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {}
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function reportBackendError(scope: string, error: unknown, details?: unknown): void {
  const message = error instanceof Error
    ? `${error.message}${error.stack ? `\n${error.stack}` : ""}`
    : String(error || "Unknown error")
  let detailText = ""
  if (details !== undefined) {
    try {
      detailText = typeof details === "string" ? details : JSON.stringify(details)
    } catch {
      detailText = String(details)
    }
  }
  const suffix = detailText ? `\nDetails: ${detailText}` : ""
  const output = `[Swarm Studio] ${scope}: ${message}${suffix}`
  try {
    spindle.log.error(output)
  } catch {
    console.error(output)
  }
}

function asNullableNumber(value: unknown): number | null {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function normalizeBaseUrl(value: string): string {
  const trimmed = String(value || "").trim().replace(/\/+$/, "") || DEFAULT_SWARMUI_URL

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error(`Invalid SwarmUI URL: ${trimmed}`)
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("SwarmUI metadata requires an HTTP or HTTPS connection URL.")
  }
  return parsed.toString().replace(/\/+$/, "")
}

function tokenKey(connectionId: string): string {
  const safeId = String(connectionId).replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 100)
  return `metadata_token.${safeId}`
}

function sessionKey(userId: string | undefined, connectionId: string, hasToken: boolean): string {
  return `${userId || "scoped"}\0${connectionId}\0${hasToken ? "token" : "anonymous"}`
}

function cookieHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  }
  if (token) headers.Cookie = `swarm_token=${token}`
  return headers
}

function pruneMap<K, V>(map: Map<K, V>, max: number): void {
  while (map.size > max) {
    const oldest = map.keys().next().value
    if (oldest === undefined) break
    map.delete(oldest)
  }
}

function parseResponseBody(response: any, operation: string): JsonObject {
  let parsed: unknown
  try {
    parsed = JSON.parse(String(response?.body || "{}"))
  } catch {
    throw new Error(`SwarmUI returned invalid JSON during ${operation}.`)
  }
  const data = asRecord(parsed)
  const error = asString(data.error)
  if (error) throw new Error(error)
  return data
}

async function corsJson(
  url: string,
  body: JsonObject,
  token: string | null,
  operation: string,
): Promise<JsonObject> {
  const response = await spindle.cors(url, {
    method: "POST",
    headers: cookieHeaders(token),
    body: JSON.stringify(body),
  })

  if (Number(response?.status) < 200 || Number(response?.status) >= 300) {
    const detail = String(response?.body || response?.statusText || "").trim().slice(0, 500)
    throw new Error(`SwarmUI ${operation} failed (${response?.status || "network error"})${detail ? `: ${detail}` : ""}`)
  }
  return parseResponseBody(response, operation)
}

async function getConnection(connectionId: string, userId?: string): Promise<SwarmConnection> {
  const connection = await spindle.imageGen.getConnection(connectionId, userId)
  if (!connection) throw new Error("The selected image generation connection no longer exists.")
  if (connection.provider !== "swarmui") {
    throw new Error(`"${connection.name}" is not a SwarmUI connection.`)
  }
  return connection as SwarmConnection
}

async function getMetadataToken(connectionId: string, userId?: string): Promise<string | null> {
  return await spindle.enclave.get(tokenKey(connectionId), userId)
}

async function getSession(
  connection: SwarmConnection,
  token: string | null,
  userId?: string,
  force = false,
): Promise<string> {
  const key = sessionKey(userId, connection.id, Boolean(token))
  const cached = sessions.get(key)
  if (!force && cached && cached.expiresAt > Date.now()) {
    sessions.delete(key)
    sessions.set(key, cached)
    return cached.sessionId
  }
  sessions.delete(key)

  const baseUrl = normalizeBaseUrl(connection.api_url)
  const data = await corsJson(
    `${baseUrl}/API/GetNewSession`,
    {},
    token,
    "session request",
  )
  const sessionId = asString(data.session_id)
  if (!sessionId) throw new Error("SwarmUI returned no session_id. Check the metadata token and server permissions.")

  sessions.set(key, { sessionId, expiresAt: Date.now() + SESSION_TTL_MS })
  pruneMap(sessions, SESSION_CACHE_LIMIT)
  return sessionId
}

async function approvedLoraDownloadUrl(value: unknown, requestedName: unknown): Promise<string> {
  const input = asString(value).trim()
  if (!input) throw new Error("Paste a Civitai or Hugging Face download URL first.")
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    throw new Error("That LoRA download URL is invalid.")
  }
  if (parsed.protocol !== "https:") throw new Error("LoRA downloads require an HTTPS URL.")
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "")
  if (host === "civitai.com" || host === "civitai.red") {
    if (/^\/api\/download\/models\/\d+/i.test(parsed.pathname)) return parsed.href
    const versionId = parsed.searchParams.get("modelVersionId")
    if (versionId && /^\d+$/.test(versionId)) {
      const download = new URL(`https://civitai.com/api/download/models/${versionId}`)
      const token = parsed.searchParams.get("token")
      if (token) download.searchParams.set("token", token)
      return download.href
    }
    const modelId = parsed.pathname.match(/^\/models\/(\d+)/i)?.[1]
    if (modelId) {
      const response = await spindle.cors(`https://civitai.com/api/v1/models/${modelId}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
      })
      if (Number(response?.status) < 200 || Number(response?.status) >= 300) {
        throw new Error(`Civitai could not resolve that model page (${response?.status || "network error"}).`)
      }
      let model: JsonObject
      try { model = asRecord(JSON.parse(String(response?.body || "{}"))) } catch {
        throw new Error("Civitai returned invalid model metadata.")
      }
      const versions = Array.isArray(model.modelVersions) ? model.modelVersions.map(asRecord) : []
      const wanted = asString(requestedName).toLowerCase().replace(/\\/g, "/").split("/").pop()?.replace(/\.[^.]+$/, "") || ""
      const matching = versions.find((version) => (Array.isArray(version.files) ? version.files : []).some((raw) => {
        const filename = asString(asRecord(raw).name).toLowerCase().replace(/\.[^.]+$/, "")
        return Boolean(wanted && filename && (filename === wanted || filename.includes(wanted) || wanted.includes(filename)))
      }))
      const resolvedVersionId = asString((matching || versions[0])?.id) || String((matching || versions[0])?.id || "")
      if (!/^\d+$/.test(resolvedVersionId)) throw new Error("Civitai did not expose a downloadable version for that model.")
      return `https://civitai.com/api/download/models/${resolvedVersionId}`
    }
    throw new Error("Use Civitai's Download button URL or a numeric Civitai model page URL.")
  }
  if (host === "huggingface.co") {
    if (!parsed.pathname.includes("/resolve/") && !parsed.pathname.includes("/blob/")) {
      throw new Error("Use a direct Hugging Face file URL containing /resolve/.")
    }
    parsed.pathname = parsed.pathname.replace("/blob/", "/resolve/")
    return parsed.href
  }
  throw new Error("Only Civitai and Hugging Face LoRA downloads are allowed here.")
}

async function publicJson(url: string, operation: string): Promise<JsonObject> {
  const response = await spindle.cors(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
  })
  if (Number(response?.status) < 200 || Number(response?.status) >= 300) {
    throw new Error(`${operation} failed (${response?.status || "network error"}).`)
  }
  try {
    return asRecord(JSON.parse(String(response?.body || "{}")))
  } catch {
    throw new Error(`${operation} returned invalid JSON.`)
  }
}

async function civitaiPreviewDataUrl(value: unknown): Promise<string> {
  const raw = asString(value).trim()
  if (!raw) return ""
  let target: URL
  try { target = new URL(raw) } catch { return "" }
  const host = target.hostname.toLowerCase()
  if (target.protocol !== "https:" || (host !== "civitai.com" && !host.endsWith(".civitai.com"))) return ""
  const response = await spindle.cors(target.href, {
    method: "GET",
    headers: { "Accept": "image/jpeg,image/png,image/webp,image/*" },
    responseType: "arraybuffer",
    mediaType: "image",
  })
  if (Number(response?.status) < 200 || Number(response?.status) >= 300 || response?.encoding !== "base64") return ""
  const mime = headerValue(response.headers, "content-type").split(";")[0].trim().toLowerCase()
  if (!new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]).has(mime)) return ""
  const body = String(response.body || "")
  if (!body || body.length > 7_500_000) return ""
  return `data:${mime};base64,${body}`
}

async function civitaiLoraDownloadMetadata(
  downloadUrl: string,
  requestedName: unknown,
): Promise<{ metadata: string; fileName: string }> {
  const parsed = new URL(downloadUrl)
  if (!parsed.hostname.toLowerCase().replace(/^www\./, "").match(/^civitai\.(?:com|red)$/)) {
    return { metadata: "", fileName: "" }
  }
  const versionId = parsed.pathname.match(/^\/api\/download\/models\/(\d+)/i)?.[1]
  if (!versionId) return { metadata: "", fileName: "" }
  const token = parsed.searchParams.get("token")
  const apiUrl = (path: string) => {
    const url = new URL(`https://civitai.com/api/v1/${path}`)
    if (token) url.searchParams.set("token", token)
    return url.href
  }
  const version = await publicJson(apiUrl(`model-versions/${versionId}`), "Civitai version metadata request")
  const modelId = String(version.modelId || "")
  if (!/^\d+$/.test(modelId)) return { metadata: "", fileName: "" }
  const model = await publicJson(apiUrl(`models/${modelId}`), "Civitai model metadata request")
  const versions = Array.isArray(model.modelVersions) ? model.modelVersions.map(asRecord) : []
  const fullVersion = versions.find((candidate) => String(candidate.id || "") === versionId) || version
  const files = Array.isArray(fullVersion.files) ? fullVersion.files.map(asRecord) : Array.isArray(version.files) ? version.files.map(asRecord) : []
  const wanted = asString(requestedName).toLowerCase().replace(/\\/g, "/").split("/").pop()?.replace(/\.[^.]+$/, "") || ""
  const safeFiles = files.filter((file) => /\.(?:safetensors|sft|gguf)$/i.test(asString(file.name)))
  const file = safeFiles.find((candidate) => {
    const filename = asString(candidate.name).toLowerCase().replace(/\.[^.]+$/, "")
    return Boolean(wanted && filename && (filename === wanted || filename.includes(wanted) || wanted.includes(filename)))
  }) || safeFiles[0] || asRecord(files[0])
  const fileName = asString(file.name).trim().slice(0, 300)
  const sourceUrl = `https://civitai.com/models/${modelId}?modelVersionId=${versionId}`
  const cleanText = (value: unknown, limit: number) => asString(value).trim().slice(0, limit)
  const modelName = cleanText(model.name, 500)
  const versionName = cleanText(fullVersion.name || version.name, 500)
  const creator = cleanText(asRecord(model.creator).username, 500)
  const trainedWords = (Array.isArray(fullVersion.trainedWords) ? fullVersion.trainedWords : Array.isArray(version.trainedWords) ? version.trainedWords : [])
    .map(asString).map((word) => word.trim()).filter(Boolean).slice(0, 128)
  const tags = (Array.isArray(model.tags) ? model.tags : [])
    .map(asString).map((tag) => tag.trim()).filter(Boolean).slice(0, 128)
  const images = (Array.isArray(fullVersion.images) ? fullVersion.images : Array.isArray(version.images) ? version.images : [])
    .map(asRecord).filter((image) => asString(image.type).toLowerCase() === "image")
  let thumbnail = ""
  try { thumbnail = await civitaiPreviewDataUrl(images[0]?.url) } catch {}
  const descriptionParts = [
    `From <a href="${sourceUrl}" target="_blank" rel="noreferrer noopener">${sourceUrl}</a>`,
    cleanText(fullVersion.description || version.description, 12_000),
    cleanText(model.description, 20_000),
  ].filter(Boolean)
  const metadata: JsonObject = {
    "modelspec.sai_model_spec": "1.0.0",
    "modelspec.title": [modelName, versionName].filter(Boolean).join(" - ") || fileName,
    "modelspec.description": descriptionParts.join("\n").slice(0, 32_000),
    "modelspec.date": cleanText(fullVersion.createdAt || version.createdAt, 200),
    "modelspec.author": creator,
    "modelspec.trigger_phrase": trainedWords.join("; "),
    "modelspec.tags": tags.join(", "),
    "modelspec.usage_hint": cleanText(fullVersion.baseModel || version.baseModel, 500),
    "modelspec.source": sourceUrl,
  }
  if (thumbnail) metadata["modelspec.thumbnail"] = thumbnail
  for (const [key, value] of Object.entries(metadata)) {
    if (value === "") delete metadata[key]
  }
  return { metadata: JSON.stringify(metadata), fileName }
}

function cleanLoraDownloadName(value: unknown, url: string): string {
  let name = asString(value).trim().replace(/\\/g, "/")
  if (!name) {
    const parsed = new URL(url)
    const civitaiId = parsed.pathname.match(/\/api\/download\/models\/(\d+)/i)?.[1]
    name = civitaiId ? `civitai-${civitaiId}` : decodeURIComponent(parsed.pathname.split("/").pop() || "downloaded-lora")
  }
  name = name.replace(/\.(?:safetensors|ckpt|pt|bin|gguf)$/i, "").replace(/^\/+|\/+$/g, "")
  if (!name || name.includes("..")) throw new Error("Choose a safe LoRA filename without parent-directory segments.")
  const cleaned = name
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9 _.,()\[\]-]+/g, "_").trim())
    .filter(Boolean)
    .join("/")
    .slice(0, 300)
  if (!cleaned) throw new Error("Choose a usable LoRA filename.")
  return cleaned
}

function isUrlShapedLoraDownloadName(value: unknown): boolean {
  const name = asString(value).trim().replace(/\\/g, "/").toLowerCase()
  if (!name) return false
  if (/^https?:\/\//.test(name) || /^https?[_:/-]/.test(name)) return true
  return /^(?:www\.)?(?:civitai\.(?:com|red)|huggingface\.co)\//.test(name)
}

async function prepareLoraDownload(payload: any, userId?: string): Promise<JsonObject> {
  if (!spindle.permissions.has("cors_proxy")) {
    throw new Error("Grant the CORS Proxy permission so Studio can establish a SwarmUI download session.")
  }
  const connectionId = asString(payload?.connectionId).trim()
  const connection = await getConnection(connectionId, userId)
  const url = await approvedLoraDownloadUrl(payload?.url, payload?.name)
  let richMetadata = { metadata: "", fileName: "" }
  try {
    richMetadata = await civitaiLoraDownloadMetadata(url, payload?.name)
  } catch (error) {
    spindle.log.warn(`Could not enrich LoRA download metadata: ${error instanceof Error ? error.message : String(error)}`)
  }
  const requestedName = asString(payload?.name).trim()
  const preferredName = isUrlShapedLoraDownloadName(requestedName)
    ? richMetadata.fileName
    : requestedName || richMetadata.fileName
  const name = cleanLoraDownloadName(preferredName, url)
  const token = await getMetadataToken(connectionId, userId)
  const sessionId = await getSession(connection, token, userId)
  const baseUrl = normalizeBaseUrl(connection.api_url)
  return {
    wsUrl: `${baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:")}/API/DoModelDownloadWS`,
    sessionId,
    url,
    name,
    type: "LoRA",
    metadata: richMetadata.metadata,
  }
}

function loraDownloadJobKey(userId?: string): string {
  return userId || "__default__"
}

function loraDownloadJobView(job: LoraDownloadJob): JsonObject {
  const current = job.items[job.index] || job.items[job.items.length - 1]
  return {
    id: job.id,
    connectionId: job.connectionId,
    status: job.status,
    active: !["complete", "failed", "cancelled"].includes(job.status),
    currentIndex: Math.min(job.index + 1, job.items.length),
    total: job.items.length,
    currentName: current?.name || "",
    currentTitle: current?.title || current?.name || "",
    currentProgress: job.currentProgress,
    overallProgress: job.overallProgress,
    message: job.message,
    error: job.error,
    startedAt: job.startedAt,
    updatedAt: job.updatedAt,
  }
}

function emitLoraDownloadJob(job: LoraDownloadJob, requestId = job.requestId): void {
  if (loraDownloadJobs.get(loraDownloadJobKey(job.userId)) !== job) return
  spindle.sendToFrontend({
    type: "lora_download_status",
    requestId,
    data: loraDownloadJobView(job),
  }, job.userId)
}

function updateLoraDownloadJob(
  job: LoraDownloadJob,
  patch: Partial<Pick<
    LoraDownloadJob,
    "status" | "currentProgress" | "overallProgress" | "message" | "error"
  >>,
): void {
  Object.assign(job, patch)
  job.updatedAt = Date.now()
  emitLoraDownloadJob(job)
}

function normalizeLoraDownloadQueue(payload: any): LoraDownloadQueueItem[] {
  const source = Array.isArray(payload?.items)
    ? payload.items
    : [{ url: payload?.url, name: payload?.name, title: payload?.title }]
  const items = source.slice(0, 48).map((raw) => {
    const item = asRecord(raw)
    return {
      url: asString(item.url).trim(),
      name: asString(item.name).trim().slice(0, 500),
      title: asString(item.title).trim().slice(0, 500),
    }
  }).filter((item) => item.url)
  if (!items.length) throw new Error("Choose at least one LoRA download.")
  return items
}

function currentLoraDownloadLabel(job: LoraDownloadJob): string {
  const item = job.items[job.index]
  return item?.title || item?.name || `LoRA ${job.index + 1}`
}

function relayPreparedLoraDownload(job: LoraDownloadJob, prepared: JsonObject): Promise<void> {
  return new Promise((resolve, reject) => {
    const wsUrl = asString(prepared.wsUrl)
    if (!/^wss?:\/\//i.test(wsUrl)) {
      reject(new Error("SwarmUI returned an invalid downloader WebSocket address."))
      return
    }

    let socket: WebSocket
    try {
      socket = new WebSocket(wsUrl)
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)))
      return
    }

    job.socket = socket
    let settled = false
    const finish = (error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(connectionTimer)
      socket.removeEventListener("open", handleOpen)
      socket.removeEventListener("message", handleMessage)
      socket.removeEventListener("error", handleError)
      socket.removeEventListener("close", handleClose)
      if (job.socket === socket) job.socket = null
      try { socket.close() } catch {}
      if (error) reject(error)
      else resolve()
    }
    const handleOpen = () => {
      if (job.cancelled) {
        finish(new Error("Download cancelled."))
        return
      }
      socket.send(JSON.stringify({
        session_id: asString(prepared.sessionId),
        url: asString(prepared.url),
        type: "LoRA",
        name: asString(prepared.name),
        metadata: asString(prepared.metadata),
      }))
      updateLoraDownloadJob(job, {
        status: "downloading",
        message: `Downloading ${currentLoraDownloadLabel(job)} · ${job.index + 1}/${job.items.length}…`,
      })
    }
    const handleMessage = (event: MessageEvent) => {
      let message: any
      try { message = JSON.parse(String(event.data || "{}")) } catch { return }
      if (Number.isFinite(Number(message.current_percent))) {
        const currentProgress = Math.max(0, Math.min(1, Number(message.current_percent)))
        const overallProgress = (job.index + currentProgress) / Math.max(1, job.items.length)
        updateLoraDownloadJob(job, {
          status: "downloading",
          currentProgress,
          overallProgress,
          message: `Downloading ${currentLoraDownloadLabel(job)} · ${job.index + 1}/${job.items.length} · ${Math.round(currentProgress * 100)}%`,
        })
      }
      if (message.error) finish(new Error(asString(message.error) || "SwarmUI rejected the LoRA download."))
      else if (message.success === true) finish()
    }
    const handleError = () => finish(new Error("The Lumiverse backend could not reach SwarmUI's downloader."))
    const handleClose = () => {
      if (job.cancelled) finish(new Error("Download cancelled."))
      else finish(new Error("The SwarmUI downloader connection closed early."))
    }
    const connectionTimer = setTimeout(() => {
      finish(new Error(`Timed out connecting to SwarmUI at ${new URL(wsUrl).host}.`))
    }, 12_000)

    socket.addEventListener("open", handleOpen)
    socket.addEventListener("message", handleMessage)
    socket.addEventListener("error", handleError)
    socket.addEventListener("close", handleClose)
  })
}

async function runLoraDownloadJob(job: LoraDownloadJob): Promise<void> {
  try {
    while (job.index < job.items.length) {
      if (job.cancelled) throw new Error("Download cancelled.")
      const item = job.items[job.index]
      updateLoraDownloadJob(job, {
        status: "preparing",
        currentProgress: 0,
        overallProgress: job.index / job.items.length,
        message: `Preparing ${currentLoraDownloadLabel(job)} · ${job.index + 1}/${job.items.length}…`,
        error: "",
      })
      const prepared = await prepareLoraDownload({
        connectionId: job.connectionId,
        url: item.url,
        name: item.name,
      }, job.userId)
      if (job.cancelled) throw new Error("Download cancelled.")
      updateLoraDownloadJob(job, {
        status: "connecting",
        message: `Connecting Lumiverse to SwarmUI for ${currentLoraDownloadLabel(job)}…`,
      })
      await relayPreparedLoraDownload(job, prepared)
      job.index += 1
      job.currentProgress = 1
      job.overallProgress = job.index / job.items.length
    }
    updateLoraDownloadJob(job, {
      status: "complete",
      currentProgress: 1,
      overallProgress: 1,
      message: `${job.items.length === 1 ? "Download" : `${job.items.length} downloads`} complete · refreshing Swarm metadata…`,
      error: "",
    })
  } catch (error) {
    const cancelled = job.cancelled
    updateLoraDownloadJob(job, {
      status: cancelled ? "cancelled" : "failed",
      message: cancelled ? "LoRA download cancelled." : "LoRA download failed.",
      error: cancelled ? "" : error instanceof Error ? error.message : String(error),
    })
  } finally {
    job.socket = null
  }
}

function startLoraDownloadJob(payload: any, requestId: string, userId?: string): LoraDownloadJob {
  const key = loraDownloadJobKey(userId)
  const existing = loraDownloadJobs.get(key)
  if (existing && !["complete", "failed", "cancelled"].includes(existing.status)) {
    throw new Error("A LoRA download is already running. Cancel it before starting another.")
  }
  const connectionId = asString(payload?.connectionId).trim()
  if (!connectionId) throw new Error("Choose a SwarmUI connection first.")
  const job: LoraDownloadJob = {
    id: crypto.randomUUID(),
    requestId,
    userId,
    connectionId,
    items: normalizeLoraDownloadQueue(payload),
    index: 0,
    status: "preparing",
    currentProgress: 0,
    overallProgress: 0,
    message: "Preparing LoRA download…",
    error: "",
    startedAt: Date.now(),
    updatedAt: Date.now(),
    cancelled: false,
    socket: null,
  }
  loraDownloadJobs.set(key, job)
  emitLoraDownloadJob(job)
  void runLoraDownloadJob(job)
  return job
}

function cancelLoraDownloadJob(userId?: string): LoraDownloadJob | null {
  const job = loraDownloadJobs.get(loraDownloadJobKey(userId))
  if (!job || ["complete", "failed", "cancelled"].includes(job.status)) return job || null
  job.cancelled = true
  updateLoraDownloadJob(job, {
    status: "cancelled",
    message: "LoRA download cancelled.",
    error: "",
  })
  const socket = job.socket
  if (socket) {
    try { socket.send(JSON.stringify({ signal: "cancel" })) } catch {}
    try { socket.close() } catch {}
  }
  return job
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 40)
  }
  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 40)
  }
  return []
}

function metadataSourceUrl(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value).replace(/&amp;/gi, "&")
    const href = text.match(/href\s*=\s*["']?([^"'\s>]+)/i)?.[1]
    const direct = text.match(/https?:\/\/[^\s"'<>]+/i)?.[0]
    const candidate = href || direct
    if (!candidate) continue
    try {
      const url = new URL(candidate)
      if (url.protocol === "http:" || url.protocol === "https:") return url.href
    } catch {
      // Ignore malformed metadata links.
    }
  }
  return ""
}

function parseLora(value: unknown): LoraMetadata | null {
  const item = asRecord(value)
  const name = asString(item.name).trim()
  if (!name) return null

  const defaultWeight = asNullableNumber(item.lora_default_weight)
  return {
    name,
    title: asString(item.title).trim() || name.split("/").pop() || name,
    author: asString(item.author).trim(),
    description: asString(item.description).trim(),
    previewRef: asString(item.preview_image).trim() || null,
    architecture: asString(item.architecture).trim(),
    className: asString(item.class).trim(),
    compatClass: asString(item.compat_class).trim(),
    resolution: asString(item.resolution).trim(),
    standardWidth: asNullableNumber(item.standard_width),
    standardHeight: asNullableNumber(item.standard_height),
    license: asString(item.license).trim(),
    date: asString(item.date).trim(),
    usageHint: asString(item.usage_hint).trim(),
    triggerPhrase: asString(item.trigger_phrase).trim(),
    tags: parseTags(item.tags),
    defaultWeight: defaultWeight ?? 1,
    defaultConfinement: asNullableNumber(item.lora_default_confinement),
    local: asBoolean(item.local, true),
    timeCreated: asNullableNumber(item.time_created),
    timeModified: asNullableNumber(item.time_modified),
    hash: asString(item.hash_sha256).trim() || asString(item.hash).trim(),
    sourceUrl: metadataSourceUrl(
      item.source_url,
      item.civitai_url,
      item.source,
      item.usage_hint,
      item.description,
    ),
  }
}

function parseCheckpoint(value: unknown): CheckpointMetadata | null {
  const item = asRecord(value)
  const name = asString(item.name).trim()
  if (!name) return null
  return {
    name,
    title: asString(item.title).trim() || name.split("/").pop() || name,
    architecture: asString(item.architecture).trim(),
    className: asString(item.class).trim(),
    compatClass: asString(item.compat_class).trim(),
  }
}

async function listModelFiles(
  connection: SwarmConnection,
  token: string | null,
  subtype: "LoRA" | "Stable-Diffusion",
  userId?: string,
  forceSession = false,
): Promise<unknown[]> {
  const baseUrl = normalizeBaseUrl(connection.api_url)
  let sessionId = await getSession(connection, token, userId, forceSession)

  const request = async () => corsJson(
    `${baseUrl}/API/ListModels`,
    {
      session_id: sessionId,
      path: "",
      depth: 10,
      subtype,
      sortBy: "Name",
      allowRemote: true,
      sortReverse: false,
      dataImages: false,
    },
    token,
    `${subtype} metadata request`,
  )

  let data: JsonObject
  try {
    data = await request()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!/session|invalid/i.test(message)) throw error
    sessionId = await getSession(connection, token, userId, true)
    data = await request()
  }
  return Array.isArray(data.files) ? data.files : []
}

async function listLoras(
  connection: SwarmConnection,
  token: string | null,
  userId?: string,
  forceSession = false,
): Promise<LoraMetadata[]> {
  return (await listModelFiles(connection, token, "LoRA", userId, forceSession))
    .map(parseLora)
    .filter((item): item is LoraMetadata => Boolean(item))
}

async function listCheckpoints(
  connection: SwarmConnection,
  token: string | null,
  userId?: string,
): Promise<CheckpointMetadata[]> {
  return (await listModelFiles(connection, token, "Stable-Diffusion", userId))
    .map(parseCheckpoint)
    .filter((item): item is CheckpointMetadata => Boolean(item))
}

function stringList(value: unknown, limit = 256): string[] {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, limit)
    : []
}

function parseSwarmPreset(value: unknown): SwarmPreset | null {
  const item = asRecord(value)
  const title = asString(item.title).trim()
  if (!title) return null
  const rawMap = asRecord(item.param_map)
  const paramMap: Record<string, string> = {}
  for (const [key, raw] of Object.entries(rawMap)) {
    if (typeof raw === "string" || typeof raw === "number" || typeof raw === "boolean") {
      paramMap[key] = String(raw)
    }
  }
  return {
    title,
    description: asString(item.description).trim(),
    paramMap,
  }
}

function parseSwarmParameter(value: unknown): SwarmParameter | null {
  const item = asRecord(value)
  const id = asString(item.id).trim()
  if (!id) return null
  return {
    id,
    name: asString(item.name).trim() || id,
    type: asString(item.type).trim(),
    description: asString(item.description).trim(),
  }
}

function parseSwarmWorkflowSummary(value: unknown): SwarmWorkflowSummary | null {
  const item = asRecord(value)
  const name = asString(item.name).trim().slice(0, 500)
  if (!name) return null
  return {
    name,
    image: asString(item.image).trim().slice(0, 2_000),
    description: asString(item.description).trim().slice(0, 2_000),
    enableInSimple: asBoolean(item.enable_in_simple),
  }
}

function parseWorkflowJsonObject(value: unknown, label: string): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as JsonObject
  if (typeof value !== "string" || !value.trim()) return {}
  try {
    return asRecord(JSON.parse(value))
  } catch {
    throw new Error(`SwarmUI returned invalid ${label} JSON.`)
  }
}

function parseSwarmWorkflowParameter(value: unknown): SwarmWorkflowParameter | null {
  const item = asRecord(value)
  const id = asString(item.id).trim().slice(0, 500)
  if (!id || id === "comfyworkflowraw" || id === "comfyworkflowparammetadata") return null
  const groupValue = asRecord(item.group)
  const groupId = asString(groupValue.id).trim().slice(0, 200)
  const groupName = asString(groupValue.name).trim().slice(0, 200)
  const values = Array.isArray(item.values) ? item.values.slice(0, 2_000) : []
  return {
    id,
    name: asString(item.name).trim().slice(0, 300) || id,
    type: asString(item.type).trim().toLowerCase().slice(0, 80) || "text",
    description: asString(item.description).trim().slice(0, 2_000),
    default: item.default,
    values,
    viewType: asString(item.view_type).trim().toLowerCase().slice(0, 80),
    min: asNullableNumber(item.min),
    max: asNullableNumber(item.max),
    step: asNullableNumber(item.step),
    visible: item.visible !== false,
    toggleable: asBoolean(item.toggleable),
    advanced: asBoolean(item.advanced) || asBoolean(groupValue.advanced),
    imageAlwaysBase64: asBoolean(item.image_always_b64),
    group: groupId || groupName ? {
      id: groupId || groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 200),
      name: groupName || groupId,
      description: asString(groupValue.description).trim().slice(0, 1_000),
      open: asBoolean(groupValue.open),
      advanced: asBoolean(groupValue.advanced),
      canShrink: groupValue.can_shrink !== false,
      toggles: asBoolean(groupValue.toggles),
    } : null,
  }
}

async function listSwarmWorkflows(
  connection: SwarmConnection,
  token: string | null,
  sessionId: string,
): Promise<SwarmWorkflowSummary[]> {
  const data = await corsJson(
    `${normalizeBaseUrl(connection.api_url)}/API/ComfyListWorkflows`,
    { session_id: sessionId },
    token,
    "workflow listing request",
  )
  return (Array.isArray(data.workflows) ? data.workflows : [])
    .map(parseSwarmWorkflowSummary)
    .filter((item): item is SwarmWorkflowSummary => Boolean(item))
    .slice(0, 500)
}

async function loadSwarmWorkflow(
  connection: SwarmConnection,
  token: string | null,
  userId: string | undefined,
  requestedName: string,
): Promise<SwarmWorkflowDetails> {
  const name = requestedName.trim().slice(0, 500)
  if (!name) throw new Error("Choose a saved Swarm workflow first.")
  const sessionId = await getSession(connection, token, userId)
  const available = await listSwarmWorkflows(connection, token, sessionId)
  const summary = available.find((workflow) => workflow.name === name)
  if (!summary) throw new Error("That saved Swarm workflow is no longer available.")
  const data = await corsJson(
    `${normalizeBaseUrl(connection.api_url)}/API/ComfyReadWorkflow`,
    { session_id: sessionId, name },
    token,
    "workflow detail request",
  )
  const result = asRecord(data.result)
  const customParameters = parseWorkflowJsonObject(result.custom_params, "workflow parameter metadata")
  const parameters = Object.values(customParameters)
    .map(parseSwarmWorkflowParameter)
    .filter((item): item is SwarmWorkflowParameter => Boolean(item))
    .slice(0, 512)
  return {
    ...summary,
    image: asString(result.image).trim().slice(0, 2_000) || summary.image,
    description: asString(result.description).trim().slice(0, 2_000) || summary.description,
    enableInSimple: typeof result.enable_in_simple === "boolean"
      ? result.enable_in_simple
      : summary.enableInSimple,
    parameters,
  }
}

async function loadSwarmOptions(
  connection: SwarmConnection,
  token: string | null,
  userId?: string,
): Promise<SwarmOptions> {
  const baseUrl = normalizeBaseUrl(connection.api_url)
  const sessionId = await getSession(connection, token, userId)
  const [paramsData, userData, workflowResult] = await Promise.all([
    corsJson(
      `${baseUrl}/API/ListT2IParams`,
      { session_id: sessionId },
      token,
      "parameter options request",
    ),
    corsJson(
      `${baseUrl}/API/GetMyUserData`,
      { session_id: sessionId },
      token,
      "preset listing request",
    ),
    listSwarmWorkflows(connection, token, sessionId)
      .then((workflows) => ({ workflows, error: "" }))
      .catch((error) => ({
        workflows: [] as SwarmWorkflowSummary[],
        error: error instanceof Error ? error.message : String(error),
      })),
  ])
  const params = Array.isArray(paramsData.list) ? paramsData.list.map(asRecord) : []
  const userPermissions = stringList(userData.permissions).map((permission) => permission.toLowerCase())
  const valuesFor = (id: string) => {
    const parameter = params.find((item) => asString(item.id).toLowerCase() === id)
    return stringList(parameter?.values)
  }
  return {
    samplers: valuesFor("sampler"),
    schedulers: valuesFor("scheduler"),
    presets: (Array.isArray(userData.presets) ? userData.presets : [])
      .map(parseSwarmPreset)
      .filter((item): item is SwarmPreset => Boolean(item)),
    parameters: params
      .map(parseSwarmParameter)
      .filter((item): item is SwarmParameter => Boolean(item)),
    canManagePresets: userPermissions.includes("manage_presets"),
    workflows: workflowResult.workflows,
    workflowError: workflowResult.error,
  }
}

async function loadStackPresets(userId?: string): Promise<StackPreset[]> {
  const value = await spindle.userStorage.getJson(STACK_PRESETS_FILE, {
    fallback: [],
    userId,
  })
  return Array.isArray(value) ? value.slice(0, STACK_PRESET_LIMIT) : []
}

function cleanStackPresetItems(value: unknown, allowEmpty = true): StackPresetItem[] {
  const rawItems = Array.isArray(value) ? value : []
  if (!allowEmpty && !rawItems.length) throw new Error("Add at least one LoRA before saving a stack.")
  return rawItems.slice(0, 64).map((raw): StackPresetItem => {
    const item = asRecord(raw)
    const modelName = asString(item.name).trim().slice(0, 500)
    if (!modelName) throw new Error("A saved stack item is missing its LoRA filename.")
    const weight = Number(item.weight)
    return {
      name: modelName,
      title: asString(item.title).trim().slice(0, 200),
      weight: Number.isFinite(weight) ? Math.max(-10, Math.min(10, weight)) : 1,
      enabled: asBoolean(item.enabled, true),
      useTrigger: asBoolean(item.useTrigger, false),
      sourceUrl: metadataSourceUrl(item.sourceUrl),
    }
  })
}

function cleanStackPreset(value: unknown, existingId = ""): StackPreset {
  const input = asRecord(value)
  const name = asString(input.name).trim().slice(0, 80)
  if (!name) throw new Error("Give this LoRA stack a name.")
  const items = cleanStackPresetItems(input.items, false)
  return {
    id: existingId || crypto.randomUUID(),
    name,
    items,
    updatedAt: Date.now(),
  }
}

async function saveStackPreset(value: unknown, userId?: string): Promise<StackPreset[]> {
  const input = asRecord(value)
  const requestedId = asString(input.id).trim()
  const presets = await loadStackPresets(userId)
  const existingIndex = requestedId
    ? presets.findIndex((preset) => preset.id === requestedId)
    : presets.findIndex((preset) => preset.name.toLowerCase() === asString(input.name).trim().toLowerCase())
  const preset = cleanStackPreset(input, existingIndex >= 0 ? presets[existingIndex].id : "")
  if (existingIndex >= 0) presets.splice(existingIndex, 1)
  presets.unshift(preset)
  await spindle.userStorage.setJson(STACK_PRESETS_FILE, presets.slice(0, STACK_PRESET_LIMIT), {
    indent: 2,
    userId,
  })
  return presets.slice(0, STACK_PRESET_LIMIT)
}

async function deleteStackPreset(presetId: string, userId?: string): Promise<StackPreset[]> {
  const presets = (await loadStackPresets(userId)).filter((preset) => preset.id !== presetId)
  await spindle.userStorage.setJson(STACK_PRESETS_FILE, presets, { indent: 2, userId })
  return presets
}

function cleanPersonaVisualPresets(value: unknown): PersonaVisualPreset[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.slice(0, PERSONA_VISUAL_PRESET_LIMIT).flatMap((raw): PersonaVisualPreset[] => {
    const item = asRecord(raw)
    const id = asString(item.id).trim()
    const name = asString(item.name).trim().slice(0, 80)
    if (!id || !name || seen.has(id)) return []
    seen.add(id)
    return [{
      id,
      name,
      positivePrompt: asString(item.positivePrompt).trim().slice(0, 12_000),
      sourcePresetId: asString(item.sourcePresetId).trim().slice(0, 200),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }]
  })
}

async function loadPersonaVisualPresets(userId?: string): Promise<PersonaVisualPreset[]> {
  return cleanPersonaVisualPresets(await spindle.userStorage.getJson(PERSONA_VISUAL_PRESETS_FILE, {
    fallback: [],
    userId,
  }))
}

async function savePersonaVisualPreset(value: unknown, userId?: string): Promise<PersonaVisualPreset[]> {
  const input = asRecord(value)
  const requestedId = asString(input.id).trim()
  const name = asString(input.name).trim().slice(0, 80)
  if (!name) throw new Error("Give this persona visual profile a name.")
  const presets = await loadPersonaVisualPresets(userId)
  const existingIndex = requestedId
    ? presets.findIndex((preset) => preset.id === requestedId)
    : presets.findIndex((preset) => preset.name.toLowerCase() === name.toLowerCase())
  const preset: PersonaVisualPreset = {
    id: existingIndex >= 0 ? presets[existingIndex].id : requestedId || crypto.randomUUID(),
    name,
    positivePrompt: asString(input.positivePrompt).trim().slice(0, 12_000),
    sourcePresetId: asString(input.sourcePresetId).trim().slice(0, 200),
    updatedAt: Date.now(),
  }
  if (existingIndex >= 0) presets.splice(existingIndex, 1)
  presets.unshift(preset)
  const saved = presets.slice(0, PERSONA_VISUAL_PRESET_LIMIT)
  await spindle.userStorage.setJson(PERSONA_VISUAL_PRESETS_FILE, saved, { indent: 2, userId })
  return saved
}

async function deletePersonaVisualPreset(presetId: string, userId?: string): Promise<PersonaVisualPreset[]> {
  const cleanId = presetId.trim()
  const presets = (await loadPersonaVisualPresets(userId)).filter((preset) => preset.id !== cleanId)
  await spindle.userStorage.setJson(PERSONA_VISUAL_PRESETS_FILE, presets, { indent: 2, userId })
  if (spindle.permissions.has("personas")) {
    const activePersona = await spindle.personas.getActive(userId)
    const binding = personaVisualBinding(activePersona)
    if (activePersona?.id && binding.presetId === cleanId) {
      await updatePersonaVisualBinding(activePersona, { presetId: "", enabled: false }, userId)
    }
  }
  await refreshContextMacros(userId)
  return presets
}

function personaVisualBinding(persona: any): PersonaVisualBinding {
  const metadata = asRecord(persona?.metadata)
  const binding = asRecord(metadata.swarm_studio_visuals)
  return {
    presetId: asString(binding.presetId).trim().slice(0, 200),
    enabled: asBoolean(binding.enabled, true),
  }
}

async function updatePersonaVisualBinding(
  persona: any,
  value: unknown,
  userId?: string,
): Promise<PersonaVisualBinding> {
  if (!spindle.permissions.has("personas")) throw new Error("Grant Personas permission to bind persona visuals.")
  if (!persona?.id) throw new Error("Select a Lumiverse persona before binding a visual profile.")
  const input = asRecord(value)
  const binding: PersonaVisualBinding = {
    presetId: asString(input.presetId).trim().slice(0, 200),
    enabled: asBoolean(input.enabled, true),
  }
  if (binding.presetId && !(await loadPersonaVisualPresets(userId)).some((preset) => preset.id === binding.presetId)) {
    throw new Error("That persona visual profile no longer exists.")
  }
  await spindle.personas.update(persona.id, {
    metadata: {
      ...asRecord(persona.metadata),
      swarm_studio_visuals: binding,
    },
  }, userId)
  await refreshContextMacros(userId)
  return binding
}

function activePersonaVisualPreset(
  persona: any,
  presets: PersonaVisualPreset[],
): PersonaVisualPreset | null {
  const binding = personaVisualBinding(persona)
  if (!binding.enabled || !binding.presetId) return null
  return presets.find((preset) => preset.id === binding.presetId) || null
}

function comparableStack(items: StackPresetItem[]): string {
  return JSON.stringify(items.map((item) => ({
    name: item.name.replace(/\\/g, "/").toLowerCase(),
    weight: Math.round(item.weight * 1000) / 1000,
    enabled: item.enabled !== false,
    useTrigger: Boolean(item.useTrigger),
  })))
}

function profileStack(profile: StudioGenerationProfile | null): StackPresetItem[] {
  const hints = asRecord(profile?.recordHints)
  if (Array.isArray(hints.stack)) return cleanStackPresetItems(hints.stack)
  const parameters = asRecord(asRecord(profile?.input).parameters)
  const names = stringList(parameters.loras, 128)
  const weights = Array.isArray(parameters.loraWeights) ? parameters.loraWeights.map(Number) : []
  return names.map((name, index) => ({
    name,
    title: "",
    weight: Number.isFinite(weights[index]) ? weights[index] : 1,
    enabled: true,
    useTrigger: false,
    sourceUrl: "",
  }))
}

async function chatVisualsState(userId?: string, currentStack?: unknown): Promise<JsonObject> {
  const activeChat = spindle.permissions.has("chats") ? await spindle.chats.getActive(userId) : null
  const characterId = asString(activeChat?.character_id)
  const character = characterId && spindle.permissions.has("characters")
    ? await spindle.characters.get(characterId, userId)
    : null
  const persona = spindle.permissions.has("personas") ? await spindle.personas.getActive(userId) : null
  const personaPresets = await loadPersonaVisualPresets(userId)
  const stackPresets = await loadStackPresets(userId)
  const folders = await loadOutputFolders(userId)
  const studioProfile = await loadStudioGenerationProfile(userId)
  const suppliedStack = Array.isArray(currentStack)
    ? cleanStackPresetItems(currentStack)
    : profileStack(studioProfile)
  const stackSignature = comparableStack(suppliedStack)
  const matchedStack = stackPresets.find((preset) => comparableStack(preset.items) === stackSignature)
  let models: Array<{ id: string; label: string }> = []
  let studioConnectionId = ""
  if (spindle.permissions.has("image_gen")) {
    try {
      const connection = await connectionForTaggedProfile(studioProfile, userId)
      studioConnectionId = connection.id
      models = (await spindle.imageGen.getModels(connection.id, userId))
        .map((model: any) => ({
          id: asString(model?.id).trim(),
          label: asString(model?.label).trim(),
        }))
        .filter((model: { id: string; label: string }) => model.id)
    } catch {
      models = []
    }
  }
  return {
    activeChat: activeChat ? {
      id: asString(activeChat.id),
      name: asString(activeChat.name),
      characterId,
      characterName: asString(character?.name),
    } : null,
    activePersona: persona ? {
      id: asString(persona.id),
      name: asString(persona.name),
      description: asString(persona.description),
    } : null,
    personaPresets,
    personaBinding: personaVisualBinding(persona),
    activePersonaPreset: activePersonaVisualPreset(persona, personaPresets),
    characterFolder: folders.find((folder) => folder.binding?.characterId === characterId) || null,
    characterBasePrompt: characterId ? asString((await characterBaseTagState(characterId, userId)).tags) : "",
    models,
    studioConnectionId,
    studioModel: asString(asRecord(studioProfile?.input).model),
    stackPresets,
    studioStack: suppliedStack,
    studioStackPresetId: matchedStack?.id || "",
    studioStackCustom: suppliedStack.length > 0 && !matchedStack,
  }
}

function cleanVisualWords(value: unknown, limit = 32): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\n|]+/)
      : []
  const seen = new Set<string>()
  return values.flatMap((raw): string[] => {
    const word = asString(raw).replace(/\0/g, "").trim().slice(0, 120)
    const key = word.toLowerCase()
    if (!word || seen.has(key)) return []
    seen.add(key)
    return [word]
  }).slice(0, limit)
}

function defaultCharacterLook(): CharacterVisualLook {
  return {
    id: "default",
    name: "Default",
    aliases: ["default", "usual", "normal"],
    outfitPrompt: "",
    negativePrompt: "",
    checkpoint: "",
    stackPresetId: "",
    stackSnapshot: [],
    referenceImageId: "",
    referenceImageUrl: "",
    thumbnailImageId: "",
    thumbnailUrl: "",
    triggerWords: [],
    notes: "",
    updatedAt: Date.now(),
  }
}

function cleanCharacterLooks(value: unknown): CharacterVisualLook[] {
  const source = Array.isArray(value) ? value.slice(0, 48) : []
  const seen = new Set<string>()
  const looks = source.flatMap((raw): CharacterVisualLook[] => {
    const item = asRecord(raw)
    const requestedId = asString(item.id).trim().slice(0, 120)
    const name = asString(item.name).trim().slice(0, 80)
    if (!name) return []
    const id = requestedId || (name.toLowerCase() === "default" ? "default" : crypto.randomUUID())
    if (seen.has(id)) return []
    seen.add(id)
    return [{
      id,
      name,
      aliases: cleanVisualWords(item.aliases),
      outfitPrompt: asString(item.outfitPrompt).trim().slice(0, 12_000),
      negativePrompt: asString(item.negativePrompt).trim().slice(0, 12_000),
      checkpoint: asString(item.checkpoint).trim().slice(0, 500),
      stackPresetId: asString(item.stackPresetId).trim().slice(0, 200),
      stackSnapshot: cleanStackPresetItems(item.stackSnapshot),
      referenceImageId: asString(item.referenceImageId).trim().slice(0, 200),
      referenceImageUrl: asString(item.referenceImageUrl).trim().slice(0, 2_000),
      thumbnailImageId: asString(item.thumbnailImageId).trim().slice(0, 200),
      thumbnailUrl: asString(item.thumbnailUrl).trim().slice(0, 2_000),
      triggerWords: cleanVisualWords(item.triggerWords),
      notes: asString(item.notes).trim().slice(0, 8_000),
      updatedAt: Number(item.updatedAt) || Date.now(),
    }]
  })
  if (!looks.some((look) => look.id === "default")) looks.unshift(defaultCharacterLook())
  return looks
}

function cleanVisualLoreIdentity(value: unknown): VisualLoreIdentity | null {
  const input = asRecord(value)
  const entityTypes: VisualLoreEntityType[] = ["character", "location", "object", "creature", "outfit", "style"]
  const entityType = entityTypes.includes(input.entityType as VisualLoreEntityType)
    ? input.entityType as VisualLoreEntityType
    : "location"
  const hasVisualData = input.enabled === true
    || cleanVisualWords(input.aliases).length > 0
    || Boolean(asString(input.positivePrompt).trim())
    || Boolean(asString(input.referenceImageId).trim())
  if (!hasVisualData) return null
  return {
    enabled: asBoolean(input.enabled, true),
    entityType,
    aliases: cleanVisualWords(input.aliases, 64),
    positivePrompt: asString(input.positivePrompt).trim().slice(0, 12_000),
    negativePrompt: asString(input.negativePrompt).trim().slice(0, 12_000),
    checkpointFamily: asString(input.checkpointFamily).trim().slice(0, 120),
    checkpoint: asString(input.checkpoint).trim().slice(0, 500),
    stackPresetId: asString(input.stackPresetId).trim().slice(0, 200),
    stackSnapshot: cleanStackPresetItems(input.stackSnapshot),
    referenceImageId: asString(input.referenceImageId).trim().slice(0, 200),
    referenceImageUrl: asString(input.referenceImageUrl).trim().slice(0, 2_000),
    preferredAspect: cleanAspect(input.preferredAspect) || "",
    recipe: asRecord(input.recipe),
    notes: asString(input.notes).trim().slice(0, 8_000),
    updatedAt: Number(input.updatedAt) || Date.now(),
  }
}

function cleanOutputFolders(value: unknown): OutputFolder[] {
  if (!Array.isArray(value)) {
    return [{
      id: FAVORITES_FOLDER_ID,
      name: FAVORITES_FOLDER_NAME,
      imageIds: [],
      binding: null,
      updatedAt: Date.now(),
    }]
  }
  const seen = new Set<string>()
  const parsed = value.slice(0, OUTPUT_FOLDER_LIMIT).flatMap((raw): OutputFolder[] => {
    const item = asRecord(raw)
    const id = asString(item.id).trim()
    const name = asString(item.name).trim().slice(0, 80)
    if (!id || !name || seen.has(id)) return []
    const rawBinding = asRecord(item.binding)
    const characterId = asString(rawBinding.characterId).trim().slice(0, 200)
    // v0.15.21 and earlier stored chat-scoped bindings. Their character ID is
    // enough to migrate them into a single reusable character visual folder.
    const looks = cleanCharacterLooks(rawBinding.looks)
    const requestedActiveLookId = asString(rawBinding.activeLookId).trim()
    const binding: OutputFolderBinding | null =
      (rawBinding.type === "character" || rawBinding.type === "chat") && characterId
      ? {
          type: "character",
          characterId,
          positivePrompt: asString(rawBinding.positivePrompt).trim().slice(0, 12_000),
          negativePrompt: asString(rawBinding.negativePrompt).trim().slice(0, 12_000),
          checkpoint: asString(rawBinding.checkpoint).trim().slice(0, 500),
          stackPresetId: asString(rawBinding.stackPresetId).trim().slice(0, 200),
          stackSnapshot: cleanStackPresetItems(rawBinding.stackSnapshot),
          sourcePresetId: asString(rawBinding.sourcePresetId).trim().slice(0, 200),
          enabled: asBoolean(rawBinding.enabled, true),
          activeLookId: looks.some((look) => look.id === requestedActiveLookId) ? requestedActiveLookId : "default",
          looks,
        }
      : null
    seen.add(id)
    return [{
      id,
      name,
      imageIds: [...new Set(stringList(item.imageIds, 500))],
      binding,
      updatedAt: Number(item.updatedAt) || Date.now(),
    }]
  })
  const result: OutputFolder[] = []
  const emittedCharacters = new Set<string>()
  for (const folder of parsed) {
    const legacyCharacterId = !folder.binding
      ? folder.id.match(/^character:(.+)$/)?.[1] || ""
      : ""
    const characterId = folder.binding?.characterId || legacyCharacterId
    if (!characterId) {
      result.push(folder)
      continue
    }
    if (emittedCharacters.has(characterId)) continue
    emittedCharacters.add(characterId)
    const group = parsed.filter((candidate) =>
      candidate.binding?.characterId === characterId
      || (!candidate.binding && candidate.id === `character:${characterId}`),
    )
    const bound = group
      .filter((candidate) => candidate.binding)
      .sort((left, right) => right.updatedAt - left.updatedAt)[0]
    const selected = bound || group[0]
    result.push({
      ...selected,
      id: `character:${characterId}`,
      name: bound?.name || selected.name,
      imageIds: [...new Set(group.flatMap((candidate) => candidate.imageIds))].slice(0, 500),
      binding: bound?.binding || null,
      updatedAt: Math.max(...group.map((candidate) => candidate.updatedAt)),
    })
  }
  const favorite = result.find((folder) => folder.id === FAVORITES_FOLDER_ID)
  const ordinary = result.filter((folder) => folder.id !== FAVORITES_FOLDER_ID)
  const favoritesFolder: OutputFolder = favorite
    ? {
        ...favorite,
        name: FAVORITES_FOLDER_NAME,
        binding: null,
      }
    : {
        id: FAVORITES_FOLDER_ID,
        name: FAVORITES_FOLDER_NAME,
        imageIds: [],
        binding: null,
        updatedAt: Date.now(),
      }
  return [favoritesFolder, ...ordinary.slice(0, Math.max(0, OUTPUT_FOLDER_LIMIT - 1))]
}

async function loadOutputFolders(userId?: string): Promise<OutputFolder[]> {
  return cleanOutputFolders(await spindle.userStorage.getJson(OUTPUT_FOLDERS_FILE, {
    fallback: [],
    userId,
  }))
}

async function persistOutputFolders(folders: OutputFolder[], userId?: string): Promise<OutputFolder[]> {
  const cleaned = cleanOutputFolders(folders)
  await spindle.userStorage.setJson(OUTPUT_FOLDERS_FILE, cleaned, { indent: 2, userId })
  return cleaned
}

async function createOutputFolder(name: string, bindingType: string, userId?: string): Promise<OutputFolder[]> {
  const folders = await loadOutputFolders(userId)
  let cleanName = name.trim().slice(0, 80)
  let binding: OutputFolderBinding | null = null
  if (bindingType === "character" || bindingType === "chat") {
    if (!spindle.permissions.has("chats")) throw new Error("Grant Chats permission to bind a visual folder.")
    const chat = await spindle.chats.getActive(userId)
    const chatId = asString(chat?.id).trim()
    const characterId = asString(chat?.character_id).trim()
    if (!chatId || !characterId) throw new Error("Open a character chat before creating a character visual folder.")
    if (folders.some((folder) => folder.binding?.characterId === characterId)) {
      throw new Error("This character already has a visual folder.")
    }
    let characterName = ""
    if (characterId && spindle.permissions.has("characters")) {
      characterName = asString((await spindle.characters.get(characterId, userId))?.name).trim()
    }
    if (!cleanName) cleanName = characterName.slice(0, 80) || "Character visuals"
    const tagState = await characterBaseTagState(characterId, userId)
    binding = {
      type: "character",
      characterId,
      positivePrompt: asString(tagState.tags).trim().slice(0, 12_000),
      negativePrompt: "",
      checkpoint: "",
      stackPresetId: "",
      stackSnapshot: [],
      sourcePresetId: "",
      enabled: true,
      activeLookId: "default",
      looks: [defaultCharacterLook()],
    }
    const legacy = characterId
      ? folders.find((folder) => folder.id === `character:${characterId}` && !folder.binding)
      : null
    if (legacy) {
      legacy.name = cleanName
      legacy.binding = binding
      legacy.updatedAt = Date.now()
      return persistOutputFolders(folders, userId)
    }
  }
  if (!cleanName) throw new Error("Give the output folder a name.")
  if (
    cleanName.toLowerCase() === FAVORITES_FOLDER_NAME.toLowerCase()
    || folders.some((folder) => folder.name.toLowerCase() === cleanName.toLowerCase())
  ) {
    throw new Error(`An output folder named “${cleanName}” already exists.`)
  }
  folders.unshift({
    id: binding ? `character:${binding.characterId}` : crypto.randomUUID(),
    name: cleanName,
    imageIds: [],
    binding,
    updatedAt: Date.now(),
  })
  return persistOutputFolders(folders.slice(0, OUTPUT_FOLDER_LIMIT), userId)
}

async function updateOutputFolderProfile(
  folderId: string,
  value: unknown,
  userId?: string,
): Promise<OutputFolder[]> {
  const folders = await loadOutputFolders(userId)
  const folder = folders.find((candidate) => candidate.id === folderId)
  if (!folder?.binding) throw new Error("Choose a character visual folder first.")
  const input = asRecord(value)
  const stackPresetId = asString(input.stackPresetId).trim().slice(0, 200)
  if (stackPresetId && !(await loadStackPresets(userId)).some((preset) => preset.id === stackPresetId)) {
    throw new Error("That saved LoRA stack no longer exists.")
  }
  folder.binding = {
    ...folder.binding,
    positivePrompt: asString(input.positivePrompt).trim().slice(0, 12_000),
    negativePrompt: asString(input.negativePrompt).trim().slice(0, 12_000),
    checkpoint: Object.prototype.hasOwnProperty.call(input, "checkpoint")
      ? asString(input.checkpoint).trim().slice(0, 500)
      : folder.binding.checkpoint,
    stackPresetId,
    stackSnapshot: Object.prototype.hasOwnProperty.call(input, "stackSnapshot")
      ? cleanStackPresetItems(input.stackSnapshot)
      : folder.binding.stackSnapshot,
    sourcePresetId: Object.prototype.hasOwnProperty.call(input, "sourcePresetId")
      ? asString(input.sourcePresetId).trim().slice(0, 200)
      : folder.binding.sourcePresetId,
    enabled: asBoolean(input.enabled, folder.binding.enabled),
    activeLookId: folder.binding.activeLookId,
    looks: folder.binding.looks,
  }
  folder.updatedAt = Date.now()
  const saved = await persistOutputFolders(folders, userId)
  await refreshContextMacros(userId)
  return saved
}

async function saveCharacterLook(
  folderId: string,
  value: unknown,
  activate: boolean,
  userId?: string,
): Promise<OutputFolder[]> {
  const folders = await loadOutputFolders(userId)
  const folder = folders.find((candidate) => candidate.id === folderId)
  if (!folder?.binding) throw new Error("Choose a character visual folder first.")
  const input = asRecord(value)
  const requestedId = asString(input.id).trim().slice(0, 120)
  const name = asString(input.name).trim().slice(0, 80)
  if (!name) throw new Error("Give this character look a name.")
  const existingIndex = requestedId
    ? folder.binding.looks.findIndex((look) => look.id === requestedId)
    : folder.binding.looks.findIndex((look) => look.name.toLowerCase() === name.toLowerCase())
  const id = existingIndex >= 0
    ? folder.binding.looks[existingIndex].id
    : requestedId || (name.toLowerCase() === "default" ? "default" : crypto.randomUUID())
  const stackPresetId = asString(input.stackPresetId).trim().slice(0, 200)
  const stackPreset = stackPresetId
    ? (await loadStackPresets(userId)).find((preset) => preset.id === stackPresetId)
    : null
  if (stackPresetId && !stackPreset) throw new Error("That saved LoRA stack no longer exists.")
  const look = cleanCharacterLooks([{ ...input, id, name, updatedAt: Date.now() }])
    .find((candidate) => candidate.id === id)
  if (!look) throw new Error("That character look could not be normalized.")
  look.stackPresetId = stackPreset?.id || ""
  look.stackSnapshot = stackPreset?.items || cleanStackPresetItems(input.stackSnapshot)
  if (existingIndex >= 0) folder.binding.looks.splice(existingIndex, 1)
  folder.binding.looks.push(look)
  folder.binding.looks = cleanCharacterLooks(folder.binding.looks)
  if (activate) folder.binding.activeLookId = look.id
  folder.updatedAt = Date.now()
  const saved = await persistOutputFolders(folders, userId)
  await refreshContextMacros(userId)
  return saved
}

async function selectCharacterLook(folderId: string, lookId: string, userId?: string): Promise<OutputFolder[]> {
  const folders = await loadOutputFolders(userId)
  const folder = folders.find((candidate) => candidate.id === folderId)
  if (!folder?.binding) throw new Error("Choose a character visual folder first.")
  if (!folder.binding.looks.some((look) => look.id === lookId)) throw new Error("That character look no longer exists.")
  folder.binding.activeLookId = lookId
  folder.updatedAt = Date.now()
  const saved = await persistOutputFolders(folders, userId)
  await refreshContextMacros(userId)
  return saved
}

async function deleteCharacterLook(folderId: string, lookId: string, userId?: string): Promise<OutputFolder[]> {
  if (lookId === "default") throw new Error("Default is the character's permanent fallback look.")
  const folders = await loadOutputFolders(userId)
  const folder = folders.find((candidate) => candidate.id === folderId)
  if (!folder?.binding) throw new Error("Choose a character visual folder first.")
  folder.binding.looks = cleanCharacterLooks(folder.binding.looks.filter((look) => look.id !== lookId))
  if (folder.binding.activeLookId === lookId) folder.binding.activeLookId = "default"
  folder.updatedAt = Date.now()
  const saved = await persistOutputFolders(folders, userId)
  await refreshContextMacros(userId)
  return saved
}

async function characterVisualCanonState(characterId: string, userId?: string): Promise<JsonObject> {
  if (!characterId) return { character: null, folder: null, looks: [], activeLookId: "default" }
  const character = spindle.permissions.has("characters")
    ? await spindle.characters.get(characterId, userId)
    : null
  const folders = await loadOutputFolders(userId)
  const folder = folders.find((candidate) => candidate.binding?.characterId === characterId) || null
  const stackPresets = await loadStackPresets(userId)
  let models: Array<{ id: string; label: string }> = []
  if (spindle.permissions.has("image_gen")) {
    try {
      const profile = await loadStudioGenerationProfile(userId)
      const connection = await connectionForTaggedProfile(profile, userId)
      models = (await spindle.imageGen.getModels(connection.id, userId)).map((model: any) => ({
        id: asString(model?.id),
        label: asString(model?.label) || asString(model?.id),
      })).filter((model: { id: string }) => model.id)
    } catch {
      models = []
    }
  }
  return {
    character: character ? { id: asString(character.id), name: asString(character.name), imageId: asString(character.image_id) } : null,
    folder,
    looks: folder?.binding?.looks || [],
    activeLookId: folder?.binding?.activeLookId || "default",
    stackPresets,
    models,
    badge: folder?.binding
      ? `Visuals ✓ · ${folder.binding.looks.length} look${folder.binding.looks.length === 1 ? "" : "s"}`
      : "Add visuals",
  }
}

async function ensureCharacterVisualFolderForId(characterId: string, userId?: string): Promise<OutputFolder> {
  if (!characterId) throw new Error("Choose a character first.")
  const folders = await loadOutputFolders(userId)
  const existing = folders.find((candidate) => candidate.binding?.characterId === characterId)
  if (existing?.binding) return existing
  if (!spindle.permissions.has("characters")) throw new Error("Grant Characters permission to create a visual canon.")
  const character = await spindle.characters.get(characterId, userId)
  if (!character?.id) throw new Error("That character no longer exists.")
  const tags = asString((await characterBaseTagState(characterId, userId)).tags).trim()
  const folder: OutputFolder = {
    id: `character:${characterId}`,
    name: asString(character.name).trim().slice(0, 80) || "Character visuals",
    imageIds: existing?.imageIds || [],
    binding: {
      type: "character",
      characterId,
      positivePrompt: tags,
      negativePrompt: "",
      checkpoint: "",
      stackPresetId: "",
      stackSnapshot: [],
      sourcePresetId: "",
      enabled: true,
      activeLookId: "default",
      looks: [defaultCharacterLook()],
    },
    updatedAt: Date.now(),
  }
  const next = folders.filter((candidate) => candidate.id !== folder.id)
  next.unshift(folder)
  await persistOutputFolders(next, userId)
  return folder
}

async function visualLoreState(bookId: string, entryId: string, userId?: string): Promise<JsonObject> {
  if (!spindle.permissions.has("world_books")) {
    return { available: false, books: [], entries: [], selected: null }
  }
  const listedBooks = await spindle.world_books.list({ limit: 200, offset: 0, userId })
  const books = Array.isArray(listedBooks?.data) ? listedBooks.data : []
  const selectedBookId = bookId || asString(books[0]?.id)
  const listedEntries = selectedBookId
    ? await spindle.world_books.entries.list(selectedBookId, { limit: 200, offset: 0, userId })
    : { data: [] }
  const entries = Array.isArray(listedEntries?.data) ? listedEntries.data : []
  const selectedEntryId = entryId || asString(entries[0]?.id)
  const selectedEntry = entries.find((entry: any) => asString(entry?.id) === selectedEntryId) || null
  const identity = selectedEntry
    ? cleanVisualLoreIdentity(asRecord(selectedEntry.extensions)[VISUAL_LORE_NAMESPACE])
    : null
  const activatedEntryIds = new Set<string>()
  if (spindle.permissions.has("chats")) {
    try {
      const activeChat = await spindle.chats.getActive(userId)
      if (activeChat?.id) {
        const activated = await spindle.world_books.getActivated(activeChat.id, userId)
        for (const entry of Array.isArray(activated) ? activated : []) {
          const id = asString(entry?.id || entry?.entry_id).trim()
          if (id) activatedEntryIds.add(id)
        }
      }
    } catch {
      // The editor remains usable when there is no active chat or activation
      // lookup is unavailable; only the "Activated now" grouping is omitted.
    }
  }
  const stackPresets = await loadStackPresets(userId)
  let models: Array<{ id: string; label: string }> = []
  if (spindle.permissions.has("image_gen")) {
    try {
      const profile = await loadStudioGenerationProfile(userId)
      const connection = await connectionForTaggedProfile(profile, userId)
      models = (await spindle.imageGen.getModels(connection.id, userId)).map((model: any) => ({
        id: asString(model?.id),
        label: asString(model?.label) || asString(model?.id),
      })).filter((model: { id: string }) => model.id)
    } catch {
      models = []
    }
  }
  return {
    available: true,
    books: books.map((book: any) => ({ id: asString(book?.id), name: asString(book?.name) })),
    bookId: selectedBookId,
    entries: entries.map((entry: any) => ({
      id: asString(entry?.id),
      comment: asString(entry?.comment),
      keys: stringList(entry?.key, 64),
      hasVisualIdentity: Boolean(cleanVisualLoreIdentity(asRecord(entry?.extensions)[VISUAL_LORE_NAMESPACE])),
      activated: activatedEntryIds.has(asString(entry?.id)),
    })),
    entryId: selectedEntryId,
    stackPresets,
    models,
    selected: selectedEntry ? {
      id: asString(selectedEntry.id),
      comment: asString(selectedEntry.comment),
      keys: stringList(selectedEntry.key, 64),
      identity,
    } : null,
  }
}

async function saveVisualLoreIdentity(
  bookId: string,
  entryId: string,
  value: unknown,
  userId?: string,
): Promise<JsonObject> {
  if (!spindle.permissions.has("world_books")) throw new Error("Grant World Books permission to edit Visual Lorebook identities.")
  const entry = await spindle.world_books.entries.get(entryId, userId)
  if (!entry || asString(entry.world_book_id) !== bookId) throw new Error("That lorebook entry no longer exists.")
  const identity = cleanVisualLoreIdentity({ ...asRecord(value), enabled: asRecord(value).enabled !== false, updatedAt: Date.now() })
  const extensions = { ...asRecord(entry.extensions) }
  if (identity) extensions[VISUAL_LORE_NAMESPACE] = identity
  else delete extensions[VISUAL_LORE_NAMESPACE]
  await spindle.world_books.entries.update(entryId, { extensions }, userId)
  return visualLoreState(bookId, entryId, userId)
}

async function deleteOutputFolder(folderId: string, userId?: string): Promise<OutputFolder[]> {
  if (folderId === FAVORITES_FOLDER_ID) throw new Error("Favorites is a permanent Studio folder.")
  return persistOutputFolders(
    (await loadOutputFolders(userId)).filter((folder) => folder.id !== folderId),
    userId,
  )
}

async function setOutputsFavorite(
  imageIds: string[],
  favorite: boolean,
  userId?: string,
): Promise<OutputFolder[]> {
  const cleanIds = [...new Set(imageIds.map((id) => id.trim()).filter(Boolean))].slice(0, 200)
  if (!cleanIds.length) throw new Error("Choose at least one output to favorite.")
  const folders = await loadOutputFolders(userId)
  const favorites = folders.find((folder) => folder.id === FAVORITES_FOLDER_ID)
  if (!favorites) throw new Error("The Favorites folder could not be initialized.")
  const changed = new Set(cleanIds)
  favorites.imageIds = favorite
    ? [...cleanIds, ...favorites.imageIds.filter((id) => !changed.has(id))].slice(0, 500)
    : favorites.imageIds.filter((id) => !changed.has(id))
  favorites.updatedAt = Date.now()
  return persistOutputFolders(folders, userId)
}

async function moveOutputToFolder(
  imageId: string,
  folderId: string,
  userId?: string,
): Promise<OutputFolder[]> {
  return moveOutputsToFolder([imageId], folderId, userId)
}

async function moveOutputsToFolder(
  imageIds: string[],
  folderId: string,
  userId?: string,
): Promise<OutputFolder[]> {
  const cleanIds = [...new Set(imageIds.map((id) => id.trim()).filter(Boolean))].slice(0, 200)
  if (!cleanIds.length) throw new Error("Choose at least one output before assigning a folder.")
  const folders = await loadOutputFolders(userId)
  if (folderId && !folders.some((folder) => folder.id === folderId)) {
    throw new Error("That output folder no longer exists.")
  }
  if (folderId === FAVORITES_FOLDER_ID) {
    return setOutputsFavorite(cleanIds, true, userId)
  }
  const moved = new Set(cleanIds)
  for (const folder of folders) {
    if (folder.id === FAVORITES_FOLDER_ID) continue
    folder.imageIds = folder.imageIds.filter((id) => !moved.has(id))
    if (folder.id === folderId) folder.imageIds.unshift(...cleanIds)
    folder.updatedAt = Date.now()
  }
  return persistOutputFolders(folders, userId)
}

async function loadGenerationRecords(userId?: string): Promise<GenerationRecord[]> {
  const value = await spindle.userStorage.getJson(GENERATION_RECORDS_FILE, {
    fallback: [],
    userId,
  })
  return Array.isArray(value) ? value.slice(0, GENERATION_RECORD_LIMIT) : []
}

function sanitizeRawOverrideForRecord(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return ""
  try {
    const parsed = asRecord(JSON.parse(value))
    for (const [key, entry] of Object.entries(parsed)) {
      if (typeof entry === "string" && entry.startsWith("data:image/")) {
        parsed[key] = "[workflow image omitted from history]"
      }
    }
    const serialized = JSON.stringify(parsed)
    return serialized.length <= 65_536
      ? serialized
      : "[raw override omitted from history because it exceeded 64 KB]"
  } catch {
    return value.slice(0, 65_536)
  }
}

async function saveGenerationRecord(
  result: any,
  input: JsonObject,
  hints: JsonObject,
  timing: {
    totalMs: number
    prep: string
    generation: string
    source: "swarm" | "measured"
    resolvedPrompt: string
    resolvedNegativePrompt: string
    presets: string[]
    swarmPath: string
    swarmPathVerified: boolean
    resolvedSeed: number | null
  },
  userId?: string,
): Promise<GenerationRecord> {
  const rawParameters = asRecord(input.parameters)
  const {
    referenceImages: _referenceImages,
    resolvedSourceImages: _resolvedSourceImages,
    resolvedReferenceImages: _resolvedReferenceImages,
    ...parameters
  } = rawParameters
  if (timing.resolvedSeed !== null && timing.resolvedSeed >= 0) {
    parameters.seed = Math.trunc(timing.resolvedSeed)
  }
  if (parameters.rawRequestOverride !== undefined) {
    parameters.rawRequestOverride = sanitizeRawOverrideForRecord(parameters.rawRequestOverride)
  }
  const loraNames = Array.isArray(parameters.loras)
    ? parameters.loras.map(asString).filter(Boolean).slice(0, 64)
    : []
  const loraWeights = Array.isArray(parameters.loraWeights)
    ? parameters.loraWeights.map(Number)
    : []
  const record: GenerationRecord = {
    imageId: asString(result?.imageId),
    imageUrl: asString(result?.imageUrl),
    prompt: asString(input.prompt),
    negativePrompt: asString(input.negativePrompt),
    resolvedPrompt: timing.resolvedPrompt || asString(hints.resolvedPrompt) || asString(input.prompt),
    resolvedNegativePrompt: timing.resolvedNegativePrompt
      || asString(hints.resolvedNegativePrompt)
      || asString(input.negativePrompt),
    model: asString(input.model) || asString(result?.model),
    parameters,
    loras: loraNames.map((name, index) => ({
      name,
      weight: Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1,
    })),
    presets: timing.presets.length ? timing.presets : stringList(hints.presets, 20),
    workflow: asString(hints.workflow).trim().slice(0, 500),
    timing: {
      totalMs: Math.max(0, Math.round(timing.totalMs)),
      prep: timing.prep,
      generation: timing.generation,
      source: timing.source,
    },
    swarmPath: timing.swarmPath,
    swarmPathVerified: timing.swarmPathVerified,
    initImageId: asString(hints.initImageId),
    initImageLabel: asString(hints.initImageLabel),
    createdAt: Date.now(),
  }
  const records = await loadGenerationRecords(userId)
  const deduped = records.filter((item) =>
    !record.imageId || item.imageId !== record.imageId
  )
  deduped.unshift(record)
  await spindle.userStorage.setJson(
    GENERATION_RECORDS_FILE,
    deduped.slice(0, GENERATION_RECORD_LIMIT),
    { userId },
  )
  return record
}

async function deleteGenerationRecord(imageId: string, userId?: string): Promise<void> {
  return deleteGenerationRecords([imageId], userId)
}

async function deleteGenerationRecords(imageIds: string[], userId?: string): Promise<void> {
  const deleted = new Set(imageIds)
  const records = (await loadGenerationRecords(userId)).filter((record) => !deleted.has(record.imageId))
  await spindle.userStorage.setJson(GENERATION_RECORDS_FILE, records, { userId })
}

function parseSwarmImageMetadata(value: unknown): JsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as JsonObject
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as JsonObject
      : null
  } catch {
    return null
  }
}

function metadataString(record: JsonObject, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

function metadataNumber(record: JsonObject, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = Number(record[key])
    if (Number.isFinite(value)) return value
  }
  return null
}

async function loadLatestSwarmGenerationMetadata(
  connection: SwarmConnection,
  token: string | null,
  input: JsonObject,
  totalMs: number,
  userId?: string,
): Promise<{
  totalMs: number
  prep: string
  generation: string
  source: "swarm" | "measured"
  resolvedPrompt: string
  resolvedNegativePrompt: string
  presets: string[]
  swarmPath: string
  swarmPathVerified: boolean
  resolvedSeed: number | null
}> {
  const inputParameters = asRecord(input.parameters)
  const fallback = {
    totalMs,
    prep: "",
    generation: `${(totalMs / 1000).toFixed(2)} sec`,
    source: "measured" as const,
    resolvedPrompt: asString(input.prompt),
    resolvedNegativePrompt: asString(input.negativePrompt),
    presets: [] as string[],
    swarmPath: "",
    swarmPathVerified: false,
    resolvedSeed: metadataNumber(inputParameters, "seed"),
  }
  if (!spindle.permissions.has("cors_proxy")) return fallback

  try {
    const baseUrl = normalizeBaseUrl(connection.api_url)
    const sessionId = await getSession(connection, token, userId)
    const listing = await corsJson(
      `${baseUrl}/API/ListImages`,
      {
        session_id: sessionId,
        path: "",
        depth: 5,
        sortBy: "Date",
        // Swarm's Date order is newest-first by default. Reversing it selects
        // the oldest matching image and can attach the wrong output path.
        sortReverse: false,
      },
      token,
      "generation metadata request",
    )
    const files = Array.isArray(listing.files) ? listing.files.slice(0, 24) : []
    const parsed = files.flatMap((raw): Array<{ file: JsonObject; metadata: JsonObject }> => {
      const file = asRecord(raw)
      const metadata = parseSwarmImageMetadata(file.metadata)
      return metadata ? [{ file, metadata }] : []
    })
    if (!parsed.length) return fallback

    const requestedPrompt = asString(input.prompt).trim()
    const matched = parsed.find(({ metadata }) => {
      const params = asRecord(metadata.sui_image_params)
      const extra = asRecord(metadata.sui_extra_data)
      return [
        metadataString(params, "original_prompt", "originalprompt"),
        metadataString(params, "prompt"),
        metadataString(extra, "original_prompt", "originalprompt"),
      ].some((prompt) => requestedPrompt && prompt === requestedPrompt)
    })
    // Never borrow metadata or a file path from a merely recent image. The
    // prompt must identify this generation; otherwise the selected Lumiverse
    // image is safer than returning another job's PNG.
    if (!matched) return fallback

    const params = asRecord(matched.metadata.sui_image_params)
    const extra = asRecord(matched.metadata.sui_extra_data)
    const presetValue = extra.presets_used ?? extra.presetsused
    const presets = Array.isArray(presetValue)
      ? stringList(presetValue, 20)
      : typeof presetValue === "string"
        ? presetValue.split(/[,|]+/).map((item) => item.trim()).filter(Boolean).slice(0, 20)
        : []
    return {
      totalMs,
      prep: metadataString(extra, "prep_time", "preptime"),
      generation: metadataString(extra, "generation_time", "generationtime")
        || fallback.generation,
      source: "swarm",
      resolvedPrompt: metadataString(params, "prompt")
        || metadataString(params, "original_prompt", "originalprompt")
        || metadataString(extra, "original_prompt", "originalprompt")
        || fallback.resolvedPrompt,
      resolvedNegativePrompt: metadataString(params, "negativeprompt", "negative_prompt")
        || metadataString(params, "original_negativeprompt", "original_negative_prompt", "originalnegativeprompt")
        || metadataString(extra, "original_negative_prompt", "originalnegativeprompt")
        || fallback.resolvedNegativePrompt,
      presets,
      swarmPath: asString(matched.file.src),
      swarmPathVerified: Boolean(asString(matched.file.src)),
      resolvedSeed: metadataNumber(params, "seed") ?? fallback.resolvedSeed,
    }
  } catch (error) {
    spindle.log.warn(`Could not read SwarmUI generation metadata: ${error instanceof Error ? error.message : String(error)}`)
    return fallback
  }
}

async function loadSwarmPathGenerationMetadata(
  connection: SwarmConnection,
  token: string | null,
  swarmPath: string,
  userId?: string,
): Promise<JsonObject> {
  if (!spindle.permissions.has("cors_proxy")) throw new Error("Grant the CORS Proxy permission to read original SwarmUI metadata.")
  const normalized = swarmPath.trim().replace(/\\/g, "/").replace(/^\/+/, "")
  if (!normalized || normalized.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("This output does not have a safe SwarmUI metadata path.")
  }
  const slash = normalized.lastIndexOf("/")
  const directory = slash >= 0 ? normalized.slice(0, slash) : ""
  const baseUrl = normalizeBaseUrl(connection.api_url)
  const sessionId = await getSession(connection, token, userId)
  const listing = await corsJson(`${baseUrl}/API/ListImages`, {
    session_id: sessionId,
    path: directory,
    depth: 1,
    sortBy: "Date",
    sortReverse: false,
  }, token, "exact output metadata request")
  const files = Array.isArray(listing.files) ? listing.files : []
  const matched = files.map(asRecord).find((file) => {
    const src = asString(file.src).replace(/\\/g, "/").replace(/^\/+/, "")
    return src === normalized || src.endsWith(`/${normalized}`) || normalized.endsWith(`/${src}`)
  })
  if (!matched) throw new Error("SwarmUI no longer lists the exact saved output path.")
  const metadata = parseSwarmImageMetadata(matched.metadata)
  if (!metadata) throw new Error("The original SwarmUI output has no readable generation metadata.")
  const params = asRecord(metadata.sui_image_params)
  const extra = asRecord(metadata.sui_extra_data)
  const read = (...keys: string[]) => metadataString(params, ...keys) || metadataString(extra, ...keys)
  const number = (...keys: string[]) => metadataNumber(params, ...keys) ?? metadataNumber(extra, ...keys)
  const parameters: JsonObject = {}
  const parameterValues: Array<[string, unknown]> = [
    ["width", number("width")],
    ["height", number("height")],
    ["steps", number("steps")],
    ["cfgScale", number("cfgscale", "cfg_scale", "cfg")],
    ["seed", number("seed")],
    ["sampler", read("sampler")],
    ["scheduler", read("scheduler")],
    ["vae", read("vae")],
  ]
  for (const [key, value] of parameterValues) if (value !== null && value !== "") parameters[key] = value
  const metadataList = (value: unknown, limit: number): string[] => Array.isArray(value)
    ? stringList(value, limit)
    : asString(value).split(/[,|]+/).map((item) => item.trim()).filter(Boolean).slice(0, limit)
  const loraNames = metadataList(params.loras, 128)
  const loraWeights = Array.isArray(params.loraweights)
    ? params.loraweights.map(Number)
    : metadataList(params.loraweights, 128).map(Number)
  if (loraNames.length) {
    parameters.loras = loraNames
    parameters.loraWeights = loraNames.map((_name, index) => Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1)
  }
  const presetValue = extra.presets_used ?? extra.presetsused
  const presets = Array.isArray(presetValue)
    ? stringList(presetValue, 20)
    : asString(presetValue).split(/[,|]+/).map((item) => item.trim()).filter(Boolean).slice(0, 20)
  return {
    metadataSource: "swarm-path",
    resolvedPrompt: read("prompt", "original_prompt", "originalprompt"),
    resolvedNegativePrompt: read("negativeprompt", "negative_prompt", "original_negativeprompt", "original_negative_prompt"),
    model: read("model", "modelname") || asString(connection.model),
    parameters,
    loras: loraNames.map((name, index) => ({ name, weight: Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1 })),
    presets,
    timing: {
      prep: metadataString(extra, "prep_time", "preptime"),
      generation: metadataString(extra, "generation_time", "generationtime"),
      source: "swarm",
    },
    swarmPath: asString(matched.src) || normalized,
    swarmPathVerified: true,
  }
}

function generationKey(userId: string | undefined, clientJobId: string): string {
  return `${userId || "scoped"}\0${clientJobId}`
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error
    && (error.name === "AbortError" || /abort|interrupt|cancel/i.test(error.message))
}

async function generateWithProgress(
  input: JsonObject,
  controller: AbortController,
  clientJobId: string,
  userId?: string,
): Promise<JsonObject> {
  const streamFactory = spindle.imageGen?.generateStream
  if (typeof streamFactory !== "function") {
    if (!legacyGenerationFallbackLogged) {
      legacyGenerationFallbackLogged = true
      spindle.log.warn(
        "[Swarm Studio] Lumiverse imageGen.generateStream is unavailable; using legacy generation without AbortSignal.",
      )
    }
    // AbortSignal cannot cross the Bun/Spindle structured-clone boundary used
    // by the legacy generate API. Only the streaming API accepts it.
    return asRecord(await spindle.imageGen.generate(input))
  }

  const generationInput = {
    ...input,
    signal: controller.signal,
  }
  const iterator = await streamFactory.call(spindle.imageGen, generationInput)
  if (!iterator || typeof iterator.next !== "function") {
    throw new Error("Lumiverse returned an invalid image generation stream.")
  }

  let lastStep = 0
  let lastTotalSteps = 0
  let streamedResult: JsonObject | null = null
  while (true) {
    const next = await iterator.next()
    if (next.done) {
      const returned = asRecord(next.value)
      if (Object.keys(returned).length) return returned
      if (streamedResult) return streamedResult
      throw new Error("Lumiverse's image generation stream ended without a final result.")
    }
    const chunk = asRecord(next.value)
    const chunkData = asRecord(chunk.data)
    const nestedResult = asRecord(chunk.result)
    const dataResult = asRecord(chunkData.result)
    const resultCandidate = Object.keys(nestedResult).length
      ? nestedResult
      : Object.keys(dataResult).length
        ? dataResult
        : /done|complete|result/i.test(asString(chunk.type))
          ? (Object.keys(chunkData).length ? chunkData : chunk)
          : {}
    if (
      typeof resultCandidate.imageDataUrl === "string"
      || typeof resultCandidate.imageUrl === "string"
      || typeof resultCandidate.imageId === "string"
    ) {
      streamedResult = resultCandidate
    }
    const step = metadataNumber(chunk, "step")
      ?? metadataNumber(chunkData, "step")
      ?? lastStep
    const totalSteps = metadataNumber(chunk, "totalSteps", "total_steps")
      ?? metadataNumber(chunkData, "totalSteps", "total_steps")
      ?? lastTotalSteps
    if (step) lastStep = step
    if (totalSteps) lastTotalSteps = totalSteps
    spindle.sendToFrontend({
      type: "generation_progress",
      clientJobId,
      data: {
        step,
        totalSteps,
        preview: metadataString(chunk, "preview", "imageDataUrl", "image_data_url")
          || metadataString(chunkData, "preview", "imageDataUrl", "image_data_url"),
        nodeId: metadataString(chunk, "nodeId", "node_id")
          || metadataString(chunkData, "nodeId", "node_id"),
      },
    }, userId)
  }
}

async function interruptSwarmGeneration(
  connection: SwarmConnection,
  token: string | null,
  userId?: string,
): Promise<void> {
  if (!spindle.permissions.has("cors_proxy")) return
  try {
    const sessionId = await getSession(connection, token, userId)
    await corsJson(
      `${normalizeBaseUrl(connection.api_url)}/API/InterruptAll`,
      { session_id: sessionId, other_sessions: true },
      token,
      "generation interrupt request",
    )
  } catch (error) {
    spindle.log.warn(`Could not send SwarmUI interrupt fallback: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function headerValue(headers: unknown, name: string): string {
  const record = asRecord(headers)
  const target = name.toLowerCase()
  for (const [key, value] of Object.entries(record)) {
    if (key.toLowerCase() === target && typeof value === "string") return value
  }
  return ""
}

async function fetchPreviewDataUrl(
  connection: SwarmConnection,
  previewRef: string,
  token: string | null,
): Promise<string> {
  if (previewRef.startsWith("data:image/")) return previewRef

  const baseUrl = normalizeBaseUrl(connection.api_url)
  const base = new URL(`${baseUrl}/`)
  const target = new URL(previewRef, base)
  if (target.origin !== base.origin) {
    throw new Error("SwarmUI returned a cross-origin preview URL; only previews hosted by the configured server are allowed.")
  }

  const cacheKey = `${connection.id}\0${target.href}\0${Boolean(token)}`
  const cached = previewCache.get(cacheKey)
  if (cached) {
    previewCache.delete(cacheKey)
    previewCache.set(cacheKey, cached)
    return cached
  }

  const headers: Record<string, string> = { "Accept": "image/*" }
  if (token) headers.Cookie = `swarm_token=${token}`
  const response = await spindle.cors(target.href, {
    method: "GET",
    headers,
    responseType: "arraybuffer",
    mediaType: "image",
  })
  if (Number(response?.status) < 200 || Number(response?.status) >= 300) {
    throw new Error(`Preview request failed (${response?.status || "network error"}).`)
  }
  if (response?.encoding !== "base64") {
    throw new Error("Preview response was not returned as binary image data.")
  }

  const mime = headerValue(response.headers, "content-type").split(";")[0].trim() || "image/png"
  const dataUrl = `data:${mime};base64,${String(response.body || "")}`
  previewCache.set(cacheKey, dataUrl)
  pruneMap(previewCache, PREVIEW_CACHE_LIMIT)
  return dataUrl
}

async function fetchSwarmOutput(
  connection: SwarmConnection,
  swarmPath: string,
  token: string | null,
): Promise<{ dataUrl: string; mimeType: string; filename: string }> {
  const baseUrl = normalizeBaseUrl(connection.api_url)
  const raw = String(swarmPath || "").trim().replace(/\\/g, "/")
  if (!raw || raw.includes("?") || raw.includes("#")) {
    throw new Error("This output does not have a safe SwarmUI file path.")
  }
  let relative = raw
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/?ViewSpecial\/Output\//i, "")
    .replace(/^\/?Output\//i, "")
    .replace(/^\/+/, "")
  const segments = relative.split("/").filter(Boolean)
  if (!segments.length || segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error("SwarmUI returned an invalid output file path.")
  }
  relative = segments.map((segment) => encodeURIComponent(segment)).join("/")
  // SwarmUI serves generated files from /Output/{path}. /ViewSpecial is its
  // model/preset preview route and returns a JSON error for output paths,
  // which Lumiverse's image-only proxy correctly refuses to pass through.
  const target = `${baseUrl}/Output/${relative}`
  const headers: Record<string, string> = { "Accept": "image/*" }
  if (token) headers.Cookie = `swarm_token=${token}`
  const response = await spindle.cors(target, {
    method: "GET",
    headers,
    responseType: "arraybuffer",
    mediaType: "image",
  })
  if (Number(response?.status) < 200 || Number(response?.status) >= 300) {
    throw new Error(`SwarmUI output download failed (${response?.status || "network error"}).`)
  }
  if (response?.encoding !== "base64") {
    throw new Error("SwarmUI did not return the original output as binary image data.")
  }
  const mimeType = headerValue(response.headers, "content-type").split(";")[0].trim() || "image/png"
  return {
    dataUrl: `data:${mimeType};base64,${String(response.body || "")}`,
    mimeType,
    filename: segments[segments.length - 1].slice(0, 240) || `swarm-output-${Date.now()}.png`,
  }
}

function cleanTagAutomationConfig(value: unknown): TagAutomationConfig {
  const record = asRecord(value)
  let requiredImageMin = Math.max(0, Math.min(6, Math.trunc(Number(record.requiredImageMin) || 0)))
  let requiredImageMax = Math.max(0, Math.min(6, Math.trunc(Number(record.requiredImageMax) || 0)))
  if (requiredImageMin === 0 && requiredImageMax > 0) requiredImageMin = 1
  if (requiredImageMin > 0 && requiredImageMax === 0) requiredImageMax = requiredImageMin
  if (requiredImageMax > 0 && requiredImageMax < requiredImageMin) {
    ;[requiredImageMin, requiredImageMax] = [requiredImageMax, requiredImageMin]
  }
  const protocolPrompt = asString(record.protocolPrompt)
    .replace(/\0/g, "")
    .trim()
    .slice(0, 48_000)
  return {
    autoGenerate: record.autoGenerate === true,
    injectProtocol: record.injectProtocol === true,
    completionToast: record.completionToast === true,
    protocolPrompt: protocolPrompt || DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
    requestMode: record.requestMode === "parser" ? "parser" : "inline",
    parserConnectionId: asString(record.parserConnectionId).trim().slice(0, 200),
    parserModel: asString(record.parserModel).trim().slice(0, 300),
    stripUserOnlyLoraStack: record.stripUserOnlyLoraStack === true,
    autoPrintCharacterPositive: record.autoPrintCharacterPositive === true,
    requiredImageMin,
    requiredImageMax,
    promptMode: record.promptMode === "pov" ? "pov" : "multi",
    promptFamily: record.promptFamily === "illustrious" ? "illustrious" : "anima",
  }
}

async function loadTagAutomationConfig(userId?: string): Promise<TagAutomationConfig> {
  return cleanTagAutomationConfig(await spindle.userStorage.getJson(TAG_AUTOMATION_CONFIG_FILE, {
    fallback: {
      autoGenerate: false,
      injectProtocol: false,
      completionToast: false,
      protocolPrompt: DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
      requestMode: "inline",
      parserConnectionId: "",
      parserModel: "",
      stripUserOnlyLoraStack: false,
      autoPrintCharacterPositive: false,
      requiredImageMin: 0,
      requiredImageMax: 0,
      promptMode: "multi",
      promptFamily: "anima",
    },
    userId,
  }))
}

async function saveTagAutomationConfig(value: unknown, userId?: string): Promise<TagAutomationConfig> {
  const config = cleanTagAutomationConfig(value)
  await spindle.userStorage.setJson(TAG_AUTOMATION_CONFIG_FILE, config, { indent: 2, userId })
  spindle.updateMacroValue(
    "swarm_image_protocol",
    buildInjectedSwarmProtocol(
      await loadStudioGenerationProfile(userId),
      swarmProtocolContexts.get(protocolContextKey(userId)) || null,
      config,
    ),
  )
  return config
}

function cleanCharacterBaseTagEntries(value: unknown): CharacterBaseTagEntry[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const entries: CharacterBaseTagEntry[] = []
  for (const raw of value) {
    const record = asRecord(raw)
    const characterId = asString(record.characterId).trim().slice(0, 200)
    const tags = asString(record.tags).trim().slice(0, 12_000)
    if (!characterId || !tags || seen.has(characterId)) continue
    seen.add(characterId)
    entries.push({ characterId, tags, updatedAt: Number(record.updatedAt) || Date.now() })
    if (entries.length >= 500) break
  }
  return entries
}

async function loadCharacterBaseTagEntries(userId?: string): Promise<CharacterBaseTagEntry[]> {
  return cleanCharacterBaseTagEntries(await spindle.userStorage.getJson(CHARACTER_BASE_TAGS_FILE, {
    fallback: [],
    userId,
  }))
}

async function extensionCharacterBaseTags(characterId: string, userId?: string): Promise<string> {
  if (!characterId) return ""
  return (await loadCharacterBaseTagEntries(userId)).find((entry) => entry.characterId === characterId)?.tags || ""
}

async function characterBaseTagState(characterId: string, userId?: string): Promise<JsonObject> {
  if (!characterId || !spindle.permissions.has("characters")) {
    return { characterId: "", characterName: "", tags: "", source: "none" }
  }
  const character = await spindle.characters.get(characterId, userId)
  const extensionTags = await extensionCharacterBaseTags(characterId, userId)
  const portable = asRecord(asRecord(character?.extensions).lumiverse_image_gen_lora)
  const portableTags = asString(portable.base_tags).trim()
  return {
    characterId,
    characterName: asString(character?.name).trim(),
    tags: extensionTags || portableTags,
    source: extensionTags ? "studio" : portableTags ? "lumiverse" : "none",
  }
}

async function activeCharacterBaseTagState(userId?: string): Promise<JsonObject> {
  if (!spindle.permissions.has("chats")) return characterBaseTagState("", userId)
  const chat = await spindle.chats.getActive(userId)
  return characterBaseTagState(asString(chat?.character_id), userId)
}

async function saveCharacterBaseTags(characterId: string, tags: string, userId?: string): Promise<JsonObject> {
  if (!characterId) throw new Error("Open a character chat before saving base tags.")
  if (!spindle.permissions.has("characters")) throw new Error("Grant Characters permission to save character base tags.")
  await spindle.characters.get(characterId, userId)
  const cleanTags = tags.trim().slice(0, 12_000)
  const entries = (await loadCharacterBaseTagEntries(userId)).filter((entry) => entry.characterId !== characterId)
  if (cleanTags) entries.unshift({ characterId, tags: cleanTags, updatedAt: Date.now() })
  await spindle.userStorage.setJson(CHARACTER_BASE_TAGS_FILE, entries, { indent: 2, userId })
  const state = await characterBaseTagState(characterId, userId)
  await refreshContextMacros(userId)
  return state
}

function stableTextHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

function cleanTagSlot(value: unknown): string {
  return asString(value).trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80)
}

function cleanTaggedImageJob(value: unknown): TaggedImageJob | null {
  const record = asRecord(value)
  const id = asString(record.id).trim()
  const key = asString(record.key).trim()
  const chatId = asString(record.chatId).trim()
  const messageId = asString(record.messageId).trim()
  if (!id || !key || !chatId || !messageId) return null
  const rawStatus = asString(record.status)
  const status: TaggedImageJobStatus = ["requested", "queued", "generating", "ready", "failed", "cancelled"].includes(rawStatus)
    ? rawStatus as TaggedImageJobStatus
    : "requested"
  return {
    id,
    key,
    chatId,
    messageId,
    slot: cleanTagSlot(record.slot) || "image",
    prompt: asString(record.prompt).slice(0, 12_000),
    negativePrompt: asString(record.negativePrompt).slice(0, 12_000),
    aspect: cleanAspect(record.aspect) || "4:3",
    alt: asString(record.alt).slice(0, 300),
    fullMatch: asString(record.fullMatch).slice(0, 24_000),
    status,
    clientJobId: asString(record.clientJobId).slice(0, 120),
    imageId: asString(record.imageId).slice(0, 200),
    imageUrl: asString(record.imageUrl).slice(0, 2_000),
    inserted: record.inserted === true,
    error: asString(record.error).slice(0, 1_000),
    ownerCharacterId: asString(record.ownerCharacterId).slice(0, 200),
    createdAt: Number(record.createdAt) || Date.now(),
    updatedAt: Number(record.updatedAt) || Date.now(),
    generationInput: Object.keys(asRecord(record.generationInput)).length ? asRecord(record.generationInput) : undefined,
    recordHints: Object.keys(asRecord(record.recordHints)).length ? asRecord(record.recordHints) : undefined,
  }
}

async function loadTaggedImageJobs(userId?: string): Promise<TaggedImageJob[]> {
  const value = await spindle.userStorage.getJson(TAGGED_IMAGE_JOBS_FILE, { fallback: [], userId })
  if (!Array.isArray(value)) return []
  return value.slice(0, TAGGED_IMAGE_JOB_LIMIT).flatMap((item): TaggedImageJob[] => {
    const job = cleanTaggedImageJob(item)
    return job ? [job] : []
  })
}

async function persistTaggedImageJobs(jobs: TaggedImageJob[], userId?: string): Promise<void> {
  await spindle.userStorage.setJson(
    TAGGED_IMAGE_JOBS_FILE,
    jobs.slice(0, TAGGED_IMAGE_JOB_LIMIT),
    { indent: 2, userId },
  )
}

async function upsertTaggedImageJob(job: TaggedImageJob, userId?: string): Promise<TaggedImageJob> {
  job.updatedAt = Date.now()
  const jobs = (await loadTaggedImageJobs(userId)).filter((candidate) => candidate.id !== job.id)
  jobs.unshift(job)
  await persistTaggedImageJobs(jobs, userId)
  return job
}

function sanitizeRawOverrideForProfile(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return ""
  try {
    const parsed = asRecord(JSON.parse(value))
    for (const [key, entry] of Object.entries(parsed)) {
      if (
        (typeof entry === "string" && entry.startsWith("data:image/"))
        || /(?:init|reference).*image|image.*(?:init|reference)/i.test(key)
      ) {
        delete parsed[key]
      }
    }
    return JSON.stringify(parsed).slice(0, 65_536)
  } catch {
    return ""
  }
}

function sanitizeStudioProfile(value: unknown): StudioGenerationProfile | null {
  const record = asRecord(value)
  const rawInput = asRecord(record.input)
  if (!Object.keys(rawInput).length) return null
  const rawParameters = asRecord(rawInput.parameters)
  const {
    referenceImages: _referenceImages,
    resolvedSourceImages: _resolvedSourceImages,
    resolvedReferenceImages: _resolvedReferenceImages,
    denoise: _denoise,
    ...parameters
  } = rawParameters
  if (parameters.rawRequestOverride !== undefined) {
    const cleaned = sanitizeRawOverrideForProfile(parameters.rawRequestOverride)
    if (cleaned) parameters.rawRequestOverride = cleaned
    else delete parameters.rawRequestOverride
  }
  return {
    input: {
      prompt: asString(rawInput.prompt).slice(0, 12_000),
      negativePrompt: asString(rawInput.negativePrompt).slice(0, 12_000),
      connection_id: asString(rawInput.connection_id).slice(0, 200),
      model: asString(rawInput.model).slice(0, 500),
      parameters,
    },
    recordHints: {
      ...asRecord(record.recordHints),
      initImageId: "",
      initImageLabel: "",
    },
    updatedAt: Number(record.updatedAt) || Date.now(),
  }
}

async function loadStudioGenerationProfile(userId?: string): Promise<StudioGenerationProfile | null> {
  return sanitizeStudioProfile(await spindle.userStorage.getJson(STUDIO_GENERATION_PROFILE_FILE, {
    fallback: null,
    userId,
  }))
}

function aspectFromParameters(parameters: JsonObject): string {
  const width = Number(parameters.width)
  const height = Number(parameters.height)
  if (!(width > 0) || !(height > 0)) return ""
  const ratio = width / height
  const options: Array<[string, number]> = [
    ["1:1", 1], ["2:3", 2 / 3], ["3:2", 3 / 2], ["4:5", 4 / 5],
    ["5:4", 5 / 4], ["9:16", 9 / 16], ["16:9", 16 / 9],
  ]
  return options.reduce((best, candidate) =>
    Math.abs(candidate[1] - ratio) < Math.abs(best[1] - ratio) ? candidate : best
  )[0]
}

function studioPresetTokens(profile: StudioGenerationProfile | null): string[] {
  const hints = asRecord(profile?.recordHints)
  return stringList(hints.presets, 20)
    .map((name) => name.replace(/[<>\r\n]+/g, "").trim())
    .filter(Boolean)
    .map((name) => `<preset:${name}>`)
}

function studioLoraTokens(profile: StudioGenerationProfile | null): string[] {
  return profileStack(profile).flatMap((item) => {
    if (item.enabled === false) return []
    const name = item.name.replace(/[<>\r\n]+/g, "").replace(/\\/g, "/").trim()
    if (!name) return []
    const weight = Math.round(item.weight * 1000) / 1000
    return [`<lora:${name}:${weight}>`]
  })
}

function buildSwarmImageProtocol(
  profile: StudioGenerationProfile | null,
  context: SwarmProtocolContext | null = null,
  automation: TagAutomationConfig = cleanTagAutomationConfig(null),
): string {
  const presetTokens = studioPresetTokens(profile)
  const presetGuidance = presetTokens.length
    ? `The active Studio preset stack is force-applied once as ${presetTokens.join(", ")}. Do not repeat those directives in the tag. The {{swarm_preset}} macro expands to that exact directive list for authored prompts and templates. You may add another <preset:exact saved preset name> only when the scene specifically needs a different saved preset.`
    : `No Studio presets are currently active. The {{swarm_preset}} macro is therefore empty. You may use <preset:exact saved preset name> only when you know the exact saved SwarmUI preset needed by the scene; do not invent placeholder preset names.`
  const characterTags = asString(context?.characterTags).trim().slice(0, 8_000)
  const characterLooks = Array.isArray(context?.characterLooks) ? context.characterLooks : []
  const personaTags = asString(context?.personaTags).trim().slice(0, 8_000)
  const lookGuidance = characterLooks.length
    ? `CHARACTER LOOKS — select with look="name" when the current prose clearly calls for one; otherwise omit look to inherit the active look:\n${characterLooks.map((look) => `- ${look.name}${look.active ? " (active)" : ""}${look.aliases.length ? ` — aliases: ${look.aliases.join(", ")}` : ""}${look.notes ? ` — ${look.notes.slice(0, 240)}` : ""}`).join("\n")}`
    : "CHARACTER LOOKS — no named looks have been saved; omit the look attribute."
  const identityGuidance = [
    characterTags
      ? automation.autoPrintCharacterPositive
        ? `ACTIVE CHARACTER IDENTITY — automatically bound to the active character's subject section for character="active"; do not repeat it:\n${characterTags}`
        : `ACTIVE CHARACTER IDENTITY — available for character="active", but not automatically printed. Select only the concrete appearance tags needed for the active character's visually anchored subject section; this block may contain multiple NPC definitions:\n${characterTags}`
      : `ACTIVE CHARACTER IDENTITY — no active character visual block is configured. Use concrete appearance descriptors from context, never the display name alone.`,
    personaTags
      ? `ACTIVE PERSONA IDENTITY — bound to the persona's own subject section only for persona="active"; do not repeat it:\n${personaTags}`
      : `ACTIVE PERSONA IDENTITY — no active persona visual profile is bound. Leave persona="none" unless a visible persona has concrete appearance descriptors in context.`,
    lookGuidance,
  ].join("\n\n")
  const userOnlyStackGuidance = automation.stripUserOnlyLoraStack
    ? `USER-ONLY LORA BEHAVIOR\nWhen character="none" and persona="active", Swarm Studio removes matching character-bound LoRAs from the inherited stack.`
    : `USER-ONLY LORA BEHAVIOR\nThe current Studio LoRA stack remains active when character="none" and persona="active". Choose request tags with that inherited stack in mind.`
  const imageCountGuidance = automation.requiredImageMin > 0
    ? automation.requiredImageMin === automation.requiredImageMax
      ? `IMAGE COUNT REQUIREMENT — USER-SELECTED AND MANDATORY
The user explicitly requires exactly ${automation.requiredImageMin} complete <swarm-image> request${automation.requiredImageMin === 1 ? "" : "s"} in this reply. This overrides the default discretion about whether a moment needs visualization. Do not omit the requests by claiming that no scene is important enough, not specifically required, or better left unillustrated. Choose the strongest ${automation.requiredImageMin === 1 ? "moment" : "moments"}, emit exactly the required count, and make every request complete and distinct.`
      : `IMAGE COUNT REQUIREMENT — USER-SELECTED AND MANDATORY
The user explicitly requires between ${automation.requiredImageMin} and ${automation.requiredImageMax} complete <swarm-image> requests in this reply. This overrides the default discretion about whether a moment needs visualization. Emit at least ${automation.requiredImageMin} and no more than ${automation.requiredImageMax}. Do not omit the requests by claiming that no scene is important enough, not specifically required, or better left unillustrated. Choose the strongest moments and make every request complete and distinct.`
    : `IMAGE COUNT
No explicit image count is active. Decide whether an illustration materially improves the reply; do not emit a request merely to fill a quota.`
  const modeGuidance = automation.promptMode === "pov"
    ? `ILLUSTRATION MODE — CHARACTER-ONLY / POV
When character="active" and persona="none", compile one visible focal active character and an invisible viewer/camera. persona="none" means the persona is not visibly rendered or identity-conditioned; it does not prohibit an implied observer. The viewer/camera is a reference point, not a character slot, and does not increment visible count.

Use this owned plan order: quality/meta; visible count; scene; camera; the focal subject's anchor, identity/appearance, attire, expression, pose, individual action, and gaze; environment. For interaction with the viewer, use pov, looking at viewer, eye contact, leaning toward viewer, or reaching toward viewer. Do not render the viewer's face or full body unless explicitly requested. Scene-required partial POV body parts such as a hand or arm do not add a second visible person.

If the scene explicitly requires two or more visible characters from the active card, keep every resolved visible subject and the exact count even in a first-person composition; the invisible observer still contributes no subject slot. Give each visible character a spatially anchored subject section so the regional compiler can condition them independently.

character="none" still means the active chat character must not be visible. Never select character="none" merely because the camera is first-person. To show the active character from the user's POV, use character="active" persona="none". Normalize a gaze toward an unseen third party to looking off-screen, looking to the side, or a direction-specific gaze instead of inventing another person. If physical contact or the crop hides the focal character's face, omit face tags instead of inventing a visible expression.

The current message is authoritative for current outfit, clothing removal, damage, wetness, or disarray. Add those visible changes; otherwise rely on the injected identity's base outfit. When a face is visible, always use concrete expression tags including the relevant eyes, mouth, and brows—such as smiling, open mouth, blush, glaring, furrowed brows, or clenched teeth—rather than a vague mood.

Use specific view tags such as front view, from behind, from above, from below, and pov; combine them when useful. Fit framing to the action. Do not put negative prompts in the tag body.`
    : `ILLUSTRATION MODE — MULTI-CHARACTER / ENSEMBLE
Use no more than five visually necessary subjects. Emit a small owned scene plan in this order:
quality/meta: [quality, rating, and safety metadata]
visible count: [one exact, non-contradictory count]
scene: [one short overall scene statement]
camera: [framing, angle, perspective, focus]
left/right/foreground/background subject: [identity and distinguishing appearance], [attire], [expression], [pose], [individual action], [gaze]
shared interaction: [physical contact or action jointly performed by visible subjects, once]
spatial relation: [shared placement or distance, once]
environment: [location, furniture, weather, background, lighting, finish]

List all visually necessary subject sections resolved from the active character card first, then the active persona's section when it is visible. One active card may resolve to multiple distinct NPC subjects; character-card count does not determine visible-subject count. Never write application-level character 1 or character 2 as final diffusion phrasing. Every visible subject needs a concrete image-space or depth-space anchor wherever composition permits one: left, right, center, foreground, midground, background, nearest the camera, farther from the camera, or seated opposite the other subject.

Every visible fact has exactly one owner. Appearance, attire, expression, pose, individual action, and gaze stay inside that subject's section. A one-actor action stays on its actor and names the recipient spatially. Joint contact/action appears once in shared interaction. Camera facts appear only under camera; setting and lighting appear only under environment. Do not repeat a fact across sections. Extra incidental subjects need concrete visible descriptors and must not rely on an unknown name.

The current message is authoritative for expressions, clothing changes, and current outfit state; otherwise rely on injected identities. Use concrete facial tags—such as smiling, open mouth, blush, glaring, furrowed brows, or clenched teeth—not a vague mood. Do not include negative prompts in the tag body. Do not use BREAK, bracketed pseudo-scoping, or XML-like character wrappers.`
  const checkpointGuidance = automation.promptFamily === "illustrious"
    ? `ILLUSTRIOUS SUBJECT SERIALIZER
The user selected Illustrious prompt shaping. Keep the representation comparatively tag-dense: quality/meta first, exact subject count early, camera/composition, then one compact visually anchored token bundle per subject. Keep each subject's identity, distinguishing appearance, attire, pose, action, and gaze adjacent. Use a short natural-language clause only where tags cannot preserve spatial, action, or relationship ownership. Never flatten distinct hair, eyes, clothes, and actions into global lists. For two or more resolved subjects, the backend strongly reinforces this ownership with native overlapping SwarmUI regions; emit semantic anchors only and let the compiler choose coordinates.`
    : `ANIMA SUBJECT SERIALIZER
The user selected Anima prompt shaping. Begin with quality/rating metadata such as masterpiece, best quality, score_9, newest, and highres; use exactly one of safe, sensitive, nsfw, or explicit; then put the visible-person count early. Mix useful tags with short readable natural-language spatial subject clauses. Give each visible subject enough basic distinguishing appearance and attire to bind its identity, and keep its pose, action, and gaze in that same clause. Repeat the spatial subject label instead of relying on he, she, or they when assigning an ambiguous action or trait. Order: overall scene, camera, each anchored subject, shared interaction, spatial relation, environment/lighting. Do not force predominantly Danbooru fragments, BREAK, or pseudo-structured character wrappers. For two or more resolved subjects, the backend experimentally reinforces this ownership with native overlapping SwarmUI regions; emit semantic anchors only and let the compiler choose coordinates.`
  const dynamicGuidance = `${imageCountGuidance}\n\n${identityGuidance}\n\n${userOnlyStackGuidance}\n\n${modeGuidance}\n\n${checkpointGuidance}\n\n${presetGuidance}`
  const template = automation.protocolPrompt.trim() || DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT
  return template.includes("{{swarm_dynamic_guidance}}")
    ? template.replace(/\{\{\s*swarm_dynamic_guidance\s*\}\}/gi, dynamicGuidance)
    : template
}

function buildSwarmParserRequestProtocol(automation: TagAutomationConfig): string {
  const imageCountGuidance = automation.requiredImageMin > 0
    ? automation.requiredImageMin === automation.requiredImageMax
      ? `The user explicitly requires exactly ${automation.requiredImageMin} complete request="parse" tag${automation.requiredImageMin === 1 ? "" : "s"} in this reply.`
      : `The user explicitly requires between ${automation.requiredImageMin} and ${automation.requiredImageMax} complete request="parse" tags in this reply.`
    : "No explicit image count is active. Request an illustration only when it materially improves the reply."
  const compositionGuidance = automation.promptMode === "pov"
    ? "Favor a single focal character or POV composition. The brief must identify visible expression, current outfit changes, action, framing, setting, and lighting."
    : "Use no more than five visually necessary subjects. Briefly disambiguate each visible subject's expression, position, action, and current outfit before the shared framing and environment."
  return `${SWARM_PARSER_REQUEST_PROTOCOL_BASE}

IMAGE COUNT
${imageCountGuidance}

COMPOSITION
${compositionGuidance}`
}

function buildInjectedSwarmProtocol(
  profile: StudioGenerationProfile | null,
  context: SwarmProtocolContext | null = null,
  automation: TagAutomationConfig = cleanTagAutomationConfig(null),
): string {
  return automation.requestMode === "parser"
    ? buildSwarmParserRequestProtocol(automation)
    : buildSwarmImageProtocol(profile, context, automation)
}

function protocolContextKey(userId?: string): string {
  return userId || "__default__"
}

async function pushStudioProfileMacros(profile: StudioGenerationProfile | null, userId?: string): Promise<void> {
  const input = asRecord(profile?.input)
  const parameters = asRecord(input.parameters)
  const presetTokens = studioPresetTokens(profile).join(", ")
  const loraTokens = studioLoraTokens(profile).join(", ")
  spindle.updateMacroValue("swarm_negative", asString(input.negativePrompt))
  spindle.updateMacroValue("swarm_preset", presetTokens)
  spindle.updateMacroValue("swarm_loras", loraTokens)
  spindle.updateMacroValue("swarm_checkpoint", asString(input.model))
  spindle.updateMacroValue("swarm_aspect", aspectFromParameters(parameters))
  spindle.updateMacroValue(
    "swarm_image_protocol",
    buildInjectedSwarmProtocol(
      profile,
      swarmProtocolContexts.get(protocolContextKey(userId)) || null,
      await loadTagAutomationConfig(userId),
    ),
  )
}

async function saveStudioGenerationProfile(
  input: unknown,
  recordHints: unknown,
  userId?: string,
): Promise<StudioGenerationProfile | null> {
  const profile = sanitizeStudioProfile({ input, recordHints, updatedAt: Date.now() })
  if (!profile) return null
  await spindle.userStorage.setJson(STUDIO_GENERATION_PROFILE_FILE, profile, { indent: 2, userId })
  await pushStudioProfileMacros(profile, userId)
  return profile
}

async function imageUrlForMacro(imageId: string, userId?: string): Promise<string> {
  if (!imageId || !spindle.permissions.has("images")) return ""
  try {
    const image = await spindle.images.get(imageId, { specificity: "sm", userId })
    return asString(image?.url)
  } catch {
    return ""
  }
}

async function refreshContextMacros(userId?: string): Promise<void> {
  let character: any = null
  let persona: any = null
  if (spindle.permissions.has("chats") && spindle.permissions.has("characters")) {
    try {
      const chat = await spindle.chats.getActive(userId)
      if (chat?.character_id) character = await spindle.characters.get(chat.character_id, userId)
    } catch {
      character = null
    }
  }
  if (spindle.permissions.has("personas")) {
    try {
      persona = await spindle.personas.getActive(userId)
    } catch {
      persona = null
    }
  }
  const portable = asRecord(asRecord(character?.extensions).lumiverse_image_gen_lora)
  const characterId = asString(character?.id)
  const tags = await extensionCharacterBaseTags(characterId, userId) || asString(portable.base_tags)
  const visualFolder = characterId
    ? (await loadOutputFolders(userId)).find((folder) =>
        folder.binding?.characterId === characterId && folder.binding.enabled,
      )
    : null
  const personaPresets = await loadPersonaVisualPresets(userId)
  const personaPreset = activePersonaVisualPreset(persona, personaPresets)
  const characterTags = visualFolder?.binding?.positivePrompt || tags
  const personaTags = personaPreset?.positivePrompt || ""
  const protocolContext: SwarmProtocolContext = {
    characterId,
    characterTags,
    characterLooks: (visualFolder?.binding?.looks || []).map((look) => ({
      id: look.id,
      name: look.name,
      aliases: look.aliases,
      active: look.id === visualFolder?.binding?.activeLookId,
      notes: look.notes,
    })),
    personaId: asString(persona?.id),
    personaName: asString(persona?.name),
    personaTags,
  }
  swarmProtocolContexts.set(protocolContextKey(userId), protocolContext)
  spindle.updateMacroValue("char_base", characterTags)
  spindle.updateMacroValue("persona_base", personaTags)
  spindle.updateMacroValue("char_profile", await imageUrlForMacro(asString(character?.image_id), userId))
  spindle.updateMacroValue("user_profile", await imageUrlForMacro(asString(persona?.image_id), userId))
  spindle.updateMacroValue(
    "swarm_image_protocol",
    buildInjectedSwarmProtocol(
      await loadStudioGenerationProfile(userId),
      protocolContext,
      await loadTagAutomationConfig(userId),
    ),
  )
}

function parseTagAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const pattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(raw))) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ""
  }
  return attrs
}

function parseSwarmImageTags(content: string): Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> {
  const tags: Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> = []
  // Match innermost complete requests. A model occasionally mentions a bare
  // <swarm-image> token before emitting the real request; a naive lazy regex
  // then swallows the whole explanation through the real closing tag.
  const pattern = /<swarm-image\b([^>]*)>((?:(?!<swarm-image\b)[\s\S])*?)<\/swarm-image\s*>/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(content)) && tags.length < 6) {
    const attrs = parseTagAttributes(match[1])
    const strict = attrs.request?.toLowerCase() === "generate"
    const legacy = !attrs.request && Boolean(attrs.slot && (attrs.aspect || attrs.alt))
    if (strict || legacy) tags.push({ fullMatch: match[0], attrs, content: match[2] })
  }
  return tags
}

function parseSwarmParserRequests(content: string): Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> {
  return parseSwarmImageTagsByRequest(content, "parse")
}

function parseSwarmImageTagsByRequest(
  content: string,
  request: string,
): Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> {
  const tags: Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> = []
  const pattern = /<swarm-image\b([^>]*)>((?:(?!<swarm-image\b)[\s\S])*?)<\/swarm-image\s*>/gi
  let match: RegExpExecArray | null
  while ((match = pattern.exec(content)) && tags.length < 6) {
    const attrs = parseTagAttributes(match[1])
    if (attrs.request?.toLowerCase() === request) {
      tags.push({ fullMatch: match[0], attrs, content: match[2] })
    }
  }
  return tags
}

function parserCompletionInstruction(
  profile: StudioGenerationProfile | null,
  context: SwarmProtocolContext | null,
  automation: TagAutomationConfig,
): string {
  return `You are Swarm Studio's local image-request parser. Convert every request="parse" tag in the user message into exactly one complete request="generate" tag.

Return only the completed tags, in the same order, with no prose or Markdown fences. Preserve each tag's slot, aspect, character, look, persona, and alt attributes exactly. Expand only the body into a compact, checkpoint-appropriate diffusion prompt. Do not copy biographies, personality, backstory, or conversational display names. Do not invent additional images or omit an input request.

The completed tags must follow this Studio protocol and its live identity/preset guidance:

${buildSwarmImageProtocol(profile, context, automation)}`
}

async function completeParserImageRequests(payload: any, userId?: string): Promise<void> {
  const config = await loadTagAutomationConfig(userId)
  if (!config.injectProtocol || config.requestMode !== "parser") return
  const chatId = asString(payload?.chatId).trim()
  const messageId = asString(payload?.messageId).trim()
  const content = asString(payload?.content)
  const requests = parseSwarmParserRequests(content)
  if (!chatId || !messageId || !requests.length) return

  const completionKey = asString(payload?.generationId).trim() || `${chatId}:${messageId}:${stableTextHash(content)}`
  if (runningParserCompletions.has(completionKey)) return
  runningParserCompletions.add(completionKey)

  try {
    if (!spindle.permissions.has("generation")) {
      throw new Error("Grant the Generation permission to use a parser model for inline image requests.")
    }
    const listed = await spindle.connections.list(userId)
    const connections = Array.isArray(listed) ? listed : []
    const connection = connections.find((candidate: any) => asString(candidate?.id) === config.parserConnectionId)
      || connections.find((candidate: any) => candidate?.is_default)
      || connections[0]
    if (!connection?.id) throw new Error("Choose a Lumiverse text connection for the Swarm Studio parser.")

    const profile = await loadStudioGenerationProfile(userId)
    const context = swarmProtocolContexts.get(protocolContextKey(userId)) || null
    const response = await spindle.generate.quiet({
      connection_id: connection.id,
      messages: [
        { role: "system", content: parserCompletionInstruction(profile, context, config) },
        { role: "user", content: requests.map((request) => request.fullMatch).join("\n\n") },
      ],
      parameters: {
        temperature: 0.2,
        ...(config.parserModel ? { model: config.parserModel } : {}),
      },
      reasoning: { source: "off" },
    }, userId)
    const completedTags = parseSwarmImageTags(asString(response?.content))
    if (completedTags.length !== requests.length) {
      throw new Error(`The parser returned ${completedTags.length} completed image request${completedTags.length === 1 ? "" : "s"} for ${requests.length} placed request${requests.length === 1 ? "" : "s"}.`)
    }

    let completedContent = content
    for (let index = 0; index < requests.length; index++) {
      const request = requests[index]
      const bySlot = completedTags.find((tag) =>
        asString(tag.attrs.slot) && asString(tag.attrs.slot) === asString(request.attrs.slot),
      )
      const completed = bySlot || completedTags[index]
      completed.attrs.slot = asString(request.attrs.slot)
      completed.attrs.aspect = asString(request.attrs.aspect)
      completed.attrs.character = asString(request.attrs.character)
      completed.attrs.look = asString(request.attrs.look)
      completed.attrs.persona = asString(request.attrs.persona)
      completed.attrs.alt = asString(request.attrs.alt)
      const replacement = `<swarm-image
  request="generate"
  slot="${completed.attrs.slot.replace(/"/g, "&quot;")}"
  aspect="${(cleanAspect(completed.attrs.aspect) || "4:3").replace(/"/g, "")}"
  character="${completed.attrs.character === "none" ? "none" : "active"}"
  ${completed.attrs.look ? `look="${completed.attrs.look.replace(/"/g, "&quot;")}"` : ""}
  persona="${completed.attrs.persona === "active" ? "active" : "none"}"
  alt="${completed.attrs.alt.replace(/"/g, "&quot;")}"
>
${completed.content.trim()}</swarm-image>`
      completedContent = completedContent.replace(request.fullMatch, replacement)
    }

    await spindle.chat.updateMessage(chatId, messageId, { content: completedContent }, userId)
    const generatedTags = parseSwarmImageTags(completedContent)
    for (const tag of generatedTags) {
      await requestTaggedImageGeneration({
        chatId,
        messageId,
        fullMatch: tag.fullMatch,
        attrs: tag.attrs,
        content: tag.content,
        isStreaming: false,
      }, userId)
    }
    spindle.sendToFrontend({
      type: "parser_completion_result",
      data: { chatId, messageId, count: generatedTags.length },
    }, userId)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[Swarm Studio] Parser-model image completion failed.", error)
    spindle.sendToFrontend({
      type: "parser_completion_error",
      error: message,
      data: { chatId, messageId },
    }, userId)
  } finally {
    runningParserCompletions.delete(completionKey)
  }
}

function cleanAspect(value: unknown): string {
  const aspect = asString(value).trim()
  return ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9"].includes(aspect) ? aspect : ""
}

function applyAspectToParameters(parameters: JsonObject, aspect: string): void {
  const clean = cleanAspect(aspect)
  if (!clean) return
  const [x, y] = clean.split(":").map(Number)
  const currentWidth = Math.max(64, Number(parameters.width) || 1024)
  const currentHeight = Math.max(64, Number(parameters.height) || 1024)
  const area = Math.max(64 * 64, currentWidth * currentHeight)
  const ratio = x / y
  const round64 = (value: number) => Math.max(64, Math.min(4096, Math.round(value / 64) * 64))
  parameters.width = round64(Math.sqrt(area * ratio))
  parameters.height = round64(Math.sqrt(area / ratio))
}

async function connectionForTaggedProfile(profile: StudioGenerationProfile | null, userId?: string): Promise<SwarmConnection> {
  const connectionId = asString(asRecord(profile?.input).connection_id)
  if (connectionId) return getConnection(connectionId, userId)
  const connections = (await spindle.imageGen.listConnections(userId))
    .filter((connection: any) => asString(connection?.provider).toLowerCase() === "swarmui")
  const connection = connections.find((candidate: any) => candidate?.is_default) || connections[0]
  if (!connection) throw new Error("Configure a SwarmUI image generation connection before generating tagged images.")
  return connection as SwarmConnection
}

function removeTaggedPresetOverride(parameters: JsonObject): void {
  for (const key of Object.keys(parameters)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === "presets") delete parameters[key]
  }
  if (typeof parameters.rawRequestOverride !== "string") return
  try {
    const override = asRecord(JSON.parse(parameters.rawRequestOverride))
    for (const key of Object.keys(override)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === "presets") delete override[key]
    }
    if (Object.keys(override).length) parameters.rawRequestOverride = JSON.stringify(override)
    else delete parameters.rawRequestOverride
  } catch {
    // Sanitized Studio profiles only retain valid JSON overrides. If an older
    // profile somehow contains malformed data, omit it from unattended jobs.
    delete parameters.rawRequestOverride
  }
}

function applyStudioPresetLayer(scenePrompt: string, profile: StudioGenerationProfile | null): string {
  const tokens = studioPresetTokens(profile)
  const tokenList = tokens.join(", ")
  let prompt = scenePrompt.replace(/\{\{\s*swarm_preset\s*\}\}/gi, tokenList).trim()
  const lower = prompt.toLowerCase()
  const missing = tokens.filter((token) => !lower.includes(token.toLowerCase()))
  if (missing.length) prompt = `${missing.join(", ")}, ${prompt}`
  return prompt.replace(/(?:\s*,\s*){2,}/g, ", ").replace(/^\s*,\s*|\s*,\s*$/g, "").trim()
}

async function resolveVisualReferenceImage(
  referenceImageId: string,
  referenceImageUrl: string,
  userId?: string,
): Promise<{ data: string; mimeType: string } | null> {
  let source = ""
  if (referenceImageId && spindle.permissions.has("images")) {
    const image = await spindle.images.get(referenceImageId, { onlyOwned: true, specificity: "sm", userId })
    source = asString(image?.url).trim()
  }
  if (!source) source = asString(referenceImageUrl).trim()
  const embedded = source.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/=]+)$/i)
  if (embedded) {
    return embedded[2].length <= 7_500_000
      ? { data: embedded[2], mimeType: embedded[1].toLowerCase().replace("image/jpg", "image/jpeg") }
      : null
  }
  if (!source || !spindle.permissions.has("cors_proxy")) return null
  if (!/^https?:\/\//i.test(source) && !source.startsWith("/api/")) return null
  const response = await spindle.cors(source, {
    method: "GET",
    headers: { "Accept": "image/jpeg,image/png,image/webp,image/*" },
    responseType: "arraybuffer",
    mediaType: "image",
  })
  if (Number(response?.status) < 200 || Number(response?.status) >= 300 || response?.encoding !== "base64") return null
  const mimeType = headerValue(response.headers, "content-type").split(";")[0].trim().toLowerCase().replace("image/jpg", "image/jpeg")
  if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(mimeType)) return null
  const data = String(response.body || "")
  return data && data.length <= 7_500_000 ? { data, mimeType } : null
}

type ScenePromptFamily = "anima" | "illustrious"

export interface SubjectRegion {
  x: number
  y: number
  width: number
  height: number
  strength: number
}

export interface PromptCompilerCapabilities {
  regionalConditioning: boolean
  regionalConditioningStrength: "strong" | "experimental"
}

interface ImageSceneSubject {
  anchor: string
  details: string
  region?: SubjectRegion
}

interface ImageScenePlan {
  metadata: string
  visibleCount: string
  scene: string
  camera: string
  subjects: ImageSceneSubject[]
  sharedInteraction: string
  spatialRelation: string
  environment: string
  remainder: string[]
}

export function normalizePovLanguage(value: string): string {
  return value
    .replace(/\blooking\s+at\s+(?:the\s+)?(?:user|persona|viewer character)\b/gi, "looking at viewer")
    .replace(/\b(?:gaze\s+directed\s+at|gazing\s+at)\s+(?:the\s+)?(?:user|persona)\b/gi, "gaze directed at viewer")
    .replace(/\b(?:reaching|leaning)\s+(?:for|toward|towards)\s+(?:the\s+)?(?:user|persona)\b/gi, (match) =>
      /^leaning/i.test(match) ? "leaning toward viewer" : "reaching toward viewer",
    )
    .replace(/\blooking\s+at\s+(?:another|an unseen|a hidden)\s+(?:character|person)\b/gi, "looking off-screen")
}

function isVisualSubjectAnchor(value: string): boolean {
  const label = value.trim().toLowerCase()
  if (!label || label.length > 100) return false
  return /\b(?:left|right|center|foreground|midground|background|nearest\s+(?:to\s+)?(?:the\s+)?camera|farther\s+from\s+(?:the\s+)?camera|opposite)\b/.test(label)
}

export function parseImageScenePlan(value: string): ImageScenePlan | null {
  const plan: ImageScenePlan = {
    metadata: "",
    visibleCount: "",
    scene: "",
    camera: "",
    subjects: [],
    sharedInteraction: "",
    spatialRelation: "",
    environment: "",
    remainder: [],
  }
  let recognized = 0
  for (const rawLine of value.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const field = line.match(/^(quality\s*\/\s*meta|quality|metadata|visible\s+count|scene|camera|shared\s+interaction|spatial\s+relation|environment)\s*:\s*(.*)$/i)
    if (field) {
      const key = field[1].toLowerCase().replace(/\s+/g, "")
      const content = field[2].trim()
      if (/^(?:quality\/?meta|quality|metadata)$/.test(key)) plan.metadata = content
      else if (key === "visiblecount") plan.visibleCount = content
      else if (key === "scene") plan.scene = content
      else if (key === "camera") plan.camera = content
      else if (key === "sharedinteraction") plan.sharedInteraction = content
      else if (key === "spatialrelation") plan.spatialRelation = content
      else if (key === "environment") plan.environment = content
      recognized += 1
      continue
    }
    const plannedSubject = line.match(/^(?:subject|character)\s+\d+\s*\[([^\]]+)\]\s*:\s*(.*)$/i)
    if (plannedSubject && isVisualSubjectAnchor(plannedSubject[1])) {
      plan.subjects.push({ anchor: plannedSubject[1].trim(), details: plannedSubject[2].trim() })
      recognized += 1
      continue
    }
    const anchoredSubject = line.match(/^([^:]{1,100})\s*:\s*(.*)$/)
    if (anchoredSubject && isVisualSubjectAnchor(anchoredSubject[1])) {
      plan.subjects.push({ anchor: anchoredSubject[1].trim(), details: anchoredSubject[2].trim() })
      recognized += 1
      continue
    }
    plan.remainder.push(line)
  }
  return plan.subjects.length > 0 && recognized >= 2 ? plan : null
}

function visibleCountNumber(value: string): number {
  const explicitPeople = [...value.matchAll(/\b(\d+)\s*(?:girls?|boys?|women|woman|men|man|persons?|people)\b/gi)]
  if (explicitPeople.length) return explicitPeople.reduce((sum, match) => sum + Number(match[1] || 0), 0)
  const word = value.toLowerCase().match(/\b(one|two|three|four|five)\b/)
  return word ? ({ one: 1, two: 2, three: 3, four: 4, five: 5 } as Record<string, number>)[word[1]] : 0
}

function normalizedVisibleCount(value: string, subjectCount: number, forceSingle: boolean): string {
  const target = forceSingle ? 1 : subjectCount
  const cleaned = value
    .replace(target > 1 ? /(?:^|,\s*)solo(?:\s*,|$)/gi : /$^/, "")
    .replace(/\s*,\s*,+/g, ", ")
    .replace(/^\s*,\s*|\s*,\s*$/g, "")
    .trim()
  if (target <= 0) return cleaned
  const declared = visibleCountNumber(cleaned)
  if (!cleaned || (declared > 0 && declared !== target)) return `${target} ${target === 1 ? "person" : "people"}`
  return cleaned
}

function identityPromptForSubject(value: string, ensemble: boolean): string {
  if (!value) return ""
  const parts = value
    .split(/\s*,\s*|\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !ensemble || !/^(?:solo|1\s*(?:girl|boy|woman|man|person))$/i.test(part))
  return [...new Set(parts.map((part) => part.toLowerCase()))]
    .map((key) => parts.find((part) => part.toLowerCase() === key) || "")
    .filter(Boolean)
    .join(", ")
}

function animaSubjectAnchor(value: string): string {
  const anchor = value.trim().replace(/^(?:the\s+)/i, "")
  const side = anchor.match(/^(left|right)\s+(.+)$/i)
  if (side) return `The ${side[2]} on the ${side[1].toLowerCase()}`
  const depth = anchor.match(/^(foreground|midground|background)\s+(.+)$/i)
  if (depth) return `The ${depth[2]} in the ${depth[1].toLowerCase()}`
  return `The ${anchor}`
}

function promptCompilerCapabilities(family: ScenePromptFamily): PromptCompilerCapabilities {
  return family === "illustrious"
    ? { regionalConditioning: true, regionalConditioningStrength: "strong" }
    : { regionalConditioning: true, regionalConditioningStrength: "experimental" }
}

function clampRegionValue(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

function anchorSide(value: string): "left" | "center" | "right" | "" {
  const anchor = value.toLowerCase()
  if (/\bleft\b/.test(anchor)) return "left"
  if (/\bright\b/.test(anchor)) return "right"
  if (/\bcenter\b|\bmiddle\b/.test(anchor)) return "center"
  return ""
}

export function resolveSubjectRegions(subjects: ImageSceneSubject[], family: ScenePromptFamily): SubjectRegion[] {
  const count = subjects.length
  if (count < 2) return []
  const capabilities = promptCompilerCapabilities(family)
  if (!capabilities.regionalConditioning) return []
  const width = count === 2 ? 0.58 : count === 3 ? 0.46 : count === 4 ? 0.38 : 0.32
  const strength = capabilities.regionalConditioningStrength === "strong" ? 1 : 0.85
  const fallbackX = (index: number) => count === 1 ? 0 : index * (1 - width) / (count - 1)
  const occupiedSides = new Set(subjects.map((subject) => anchorSide(subject.anchor)).filter(Boolean))
  return subjects.map((subject, index) => {
    const side = anchorSide(subject.anchor)
    let x = fallbackX(index)
    if (side === "left") x = 0
    else if (side === "right") x = 1 - width
    else if (side === "center") x = (1 - width) / 2
    else if (count === 2 && occupiedSides.has("left")) x = 1 - width
    else if (count === 2 && occupiedSides.has("right")) x = 0
    return {
      x: clampRegionValue(x),
      y: 0,
      width: clampRegionValue(width),
      height: 1,
      strength,
    }
  })
}

function regionDirective(region: SubjectRegion): string {
  return `<region:${region.x},${region.y},${region.width},${region.height},${region.strength}>`
}

export function serializeScenePlan(
  plan: ImageScenePlan,
  family: ScenePromptFamily,
  identityPrompts: string[],
  forceSingleVisibleSubject = false,
): string {
  const ensemble = plan.subjects.length > 1
  const subjects = plan.subjects.map((subject, index) => {
    const identity = identityPromptForSubject(identityPrompts[index] || "", ensemble)
    const details = normalizePovLanguage(subject.details)
    return { ...subject, details: [identity, details].filter(Boolean).join(family === "anima" ? "; " : ", ") }
  })
  const visibleCount = normalizedVisibleCount(plan.visibleCount, subjects.length, forceSingleVisibleSubject)
  const regions = forceSingleVisibleSubject ? [] : resolveSubjectRegions(subjects, family)
  if (regions.length === subjects.length) {
    const globalPrompt = family === "illustrious"
      ? [
          plan.metadata,
          visibleCount,
          plan.camera,
          plan.scene,
          ...plan.remainder,
          normalizePovLanguage(plan.sharedInteraction),
          plan.spatialRelation,
        ]
      : [
          plan.metadata,
          visibleCount,
          plan.scene,
          plan.camera ? `Camera: ${plan.camera}` : "",
          ...plan.remainder,
          plan.sharedInteraction ? `Together: ${normalizePovLanguage(plan.sharedInteraction)}` : "",
          plan.spatialRelation ? `Spatial relation: ${plan.spatialRelation}` : "",
        ]
    const regionalSubjects = subjects.map((subject, index) => {
      const anchor = family === "anima" ? animaSubjectAnchor(subject.anchor) : subject.anchor
      return `${regionDirective(regions[index])} ${anchor}: ${subject.details}`
    })
    const background = plan.environment ? `<region:background> ${plan.environment}` : ""
    return [...globalPrompt, ...regionalSubjects, background].filter(Boolean).join("\n")
  }
  if (family === "illustrious") {
    return [
      plan.metadata,
      visibleCount,
      plan.camera,
      plan.scene,
      ...plan.remainder,
      ...subjects.map((subject) => [subject.anchor, subject.details].filter(Boolean).join(", ")),
      normalizePovLanguage(plan.sharedInteraction),
      plan.spatialRelation,
      plan.environment,
    ].filter(Boolean).join("\n")
  }
  return [
    plan.metadata,
    visibleCount,
    plan.scene,
    plan.camera ? `Camera: ${plan.camera}` : "",
    ...plan.remainder,
    ...subjects.map((subject) => `${animaSubjectAnchor(subject.anchor)}: ${subject.details}`),
    plan.sharedInteraction ? `Together: ${normalizePovLanguage(plan.sharedInteraction)}` : "",
    plan.spatialRelation ? `Spatial relation: ${plan.spatialRelation}` : "",
    plan.environment,
  ].filter(Boolean).join("\n")
}

async function applyCharacterLayer(
  chatId: string,
  scenePrompt: string,
  includeCharacter = true,
  includePersona = false,
  automation: TagAutomationConfig = cleanTagAutomationConfig(null),
  requestedLook = "",
  userId?: string,
): Promise<{ prompt: string; negativePrompt: string; checkpoint: string; preferredAspect: string; stack: StackPresetItem[]; excludedLoras: string[]; characterId: string; characterName: string; lookId: string; lookName: string; visualLoreEntryIds: string[]; referenceImageId: string; referenceImageUrl: string }> {
  const chat = spindle.permissions.has("chats") ? await spindle.chats.get(chatId, userId) : null
  const characterId = asString(chat?.character_id)
  const visualFolder = (await loadOutputFolders(userId)).find((folder) =>
    folder.binding?.type === "character" && folder.binding.characterId === characterId && folder.binding.enabled,
  )
  const stackPresets = await loadStackPresets(userId)
  const savedStack = visualFolder?.binding?.stackPresetId
    ? stackPresets.find((preset) => preset.id === visualFolder.binding?.stackPresetId)?.items || []
    : []
  const visualStack = savedStack.length
    ? savedStack
    : visualFolder?.binding?.stackSnapshot || []
  const looks = visualFolder?.binding?.looks || []
  const lookQuery = requestedLook.trim().toLowerCase()
  const sceneLower = scenePrompt.toLowerCase()
  const matchesLook = (look: CharacterVisualLook): boolean => {
    const signals = [look.id, look.name, ...look.aliases].map((value) => value.trim().toLowerCase()).filter(Boolean)
    return lookQuery
      ? signals.includes(lookQuery)
      : signals.some((signal) => signal !== "default" && new RegExp(`(?:^|[^a-z0-9])${signal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-z0-9])`, "i").test(sceneLower))
  }
  const activeLook = includeCharacter
    ? looks.find(matchesLook)
      || looks.find((look) => look.id === visualFolder?.binding?.activeLookId)
      || looks.find((look) => look.id === "default")
      || null
    : null
  const activeLookStackPreset = activeLook?.stackPresetId
    ? stackPresets.find((preset) => preset.id === activeLook.stackPresetId)?.items || []
    : []
  const lookStack = activeLookStackPreset.length ? activeLookStackPreset : activeLook?.stackSnapshot || []
  const character = characterId && spindle.permissions.has("characters")
    ? await spindle.characters.get(characterId, userId)
    : null
  const portable = asRecord(asRecord(character?.extensions).lumiverse_image_gen_lora)
  const characterBase = includeCharacter
    ? (
        visualFolder?.binding?.positivePrompt
        || await extensionCharacterBaseTags(characterId, userId)
        || asString(portable.base_tags)
      ).trim()
    : ""
  const persona = includePersona && spindle.permissions.has("personas")
    ? await spindle.personas.getActive(userId)
    : null
  const personaPresets = persona ? await loadPersonaVisualPresets(userId) : []
  const personaPreset = activePersonaVisualPreset(persona, personaPresets)
  const personaBase = includePersona
    ? (personaPreset?.positivePrompt || "").trim()
    : ""

  const visualLore: Array<{ entryId: string; identity: VisualLoreIdentity }> = []
  if (spindle.permissions.has("world_books") && chatId) {
    try {
      const activated = await spindle.world_books.getActivated(chatId, userId)
      for (const activation of Array.isArray(activated) ? activated.slice(0, 24) : []) {
        const entryId = asString(activation?.id)
        if (!entryId) continue
        const entry = await spindle.world_books.entries.get(entryId, userId)
        const identity = cleanVisualLoreIdentity(asRecord(entry?.extensions)[VISUAL_LORE_NAMESPACE])
        if (identity?.enabled) visualLore.push({ entryId, identity })
      }
    } catch (error) {
      spindle.log.warn(`Could not resolve Visual Lorebook identities: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const lorePositive = visualLore.map((item) => item.identity.positivePrompt).filter(Boolean)
  const lookPositive = activeLook?.outfitPrompt.trim() || ""
  const lookTriggers = activeLook?.triggerWords.filter((word) => !sceneLower.includes(word.toLowerCase())) || []

  let prompt = scenePrompt
    .replace(/\{\{\s*char_base\s*\}\}/gi, characterBase)
    .replace(/\{\{\s*persona_base\s*\}\}/gi, personaBase)
    .trim()
  const contains = (value: string) => Boolean(value && prompt.toLowerCase().includes(value.toLowerCase()))
  const characterLayers = [
    automation.autoPrintCharacterPositive ? characterBase : "",
    lookPositive,
    ...lookTriggers,
  ].filter((layer) => layer && !contains(layer))
  const personaLayers = [personaBase].filter((layer) => layer && !contains(layer))
  const identityPrompts = [
    ...(includeCharacter ? [characterLayers.join(", ")] : []),
    ...(includePersona ? [personaLayers.join(", ")] : []),
  ]
  const scenePlan = parseImageScenePlan(prompt)
  if (scenePlan) {
    const forceSingleVisibleSubject = scenePlan.subjects.length === 1 && includeCharacter && !includePersona && (
      automation.promptMode === "pov"
      || /\b(?:pov|first[- ]person)\b/i.test([scenePlan.scene, scenePlan.camera, ...scenePlan.remainder].join(" "))
    )
    prompt = serializeScenePlan(scenePlan, automation.promptFamily, identityPrompts, forceSingleVisibleSubject)
    for (const unboundIdentity of identityPrompts.slice(scenePlan.subjects.length).filter(Boolean)) {
      prompt = [unboundIdentity, prompt].filter(Boolean).join(", ")
    }
  } else {
    if (characterBase && personaBase) {
      const identityLines = [
        automation.autoPrintCharacterPositive && !contains(characterBase)
          ? `active character identity: ${characterBase}`
          : "",
        !contains(personaBase) ? `active persona identity: ${personaBase}` : "",
      ].filter(Boolean)
      prompt = [...identityLines, prompt].filter(Boolean).join("\n")
    } else if (characterBase && automation.autoPrintCharacterPositive && !contains(characterBase)) {
      prompt = [characterBase, prompt].filter(Boolean).join(", ")
    } else if (personaBase && !contains(personaBase)) {
      prompt = [personaBase, prompt].filter(Boolean).join(", ")
    }
    for (const layer of [lookPositive, ...lookTriggers]) {
      if (layer && !contains(layer)) prompt = [layer, prompt].filter(Boolean).join(", ")
    }
    if (includeCharacter && !includePersona && (
      automation.promptMode === "pov" || /\b(?:pov|first[- ]person)\b/i.test(prompt)
    )) {
      prompt = normalizePovLanguage(prompt)
    }
  }
  for (const layer of lorePositive) {
    if (layer && !contains(layer)) prompt = [layer, prompt].filter(Boolean).join(", ")
  }
  prompt = prompt.replace(/(?:\s*,\s*){2,}/g, ", ").replace(/^\s*,\s*|\s*,\s*$/g, "").trim()
  const loreNegative = visualLore.map((item) => item.identity.negativePrompt).filter(Boolean)
  const negativeLayers = [
    includeCharacter ? visualFolder?.binding?.negativePrompt || "" : includePersona ? "" : NO_CHARACTER_NEGATIVE,
    activeLook?.negativePrompt || "",
    ...loreNegative,
  ].filter(Boolean)
  const mergedStack = new Map<string, StackPresetItem>()
  for (const item of [...visualStack, ...lookStack]) mergedStack.set(item.name.toLowerCase(), item)
  for (const item of visualLore) {
    const presetItems = item.identity.stackPresetId
      ? stackPresets.find((preset) => preset.id === item.identity.stackPresetId)?.items || []
      : []
    for (const stackItem of presetItems.length ? presetItems : item.identity.stackSnapshot) {
      mergedStack.set(stackItem.name.toLowerCase(), stackItem)
    }
  }
  return {
    prompt,
    negativePrompt: [...new Set(negativeLayers)].join(", "),
    checkpoint: includeCharacter
      ? activeLook?.checkpoint || visualFolder?.binding?.checkpoint || visualLore.find((item) => item.identity.checkpoint)?.identity.checkpoint || ""
      : visualLore.find((item) => item.identity.checkpoint)?.identity.checkpoint || "",
    preferredAspect: visualLore.find((item) => item.identity.preferredAspect)?.identity.preferredAspect || "",
    stack: includeCharacter || visualLore.length ? [...mergedStack.values()] : [],
    excludedLoras: includeCharacter || !automation.stripUserOnlyLoraStack
      ? []
      : visualStack.map((item) => item.name),
    characterId: includeCharacter ? characterId : "",
    characterName: includeCharacter
      ? asString(character?.name).trim() || visualFolder?.name || ""
      : "",
    lookId: activeLook?.id || "",
    lookName: activeLook?.name || "",
    visualLoreEntryIds: visualLore.map((item) => item.entryId),
    referenceImageId: activeLook?.referenceImageId || visualLore.find((item) => item.identity.referenceImageId)?.identity.referenceImageId || "",
    referenceImageUrl: activeLook?.referenceImageUrl || visualLore.find((item) => item.identity.referenceImageUrl)?.identity.referenceImageUrl || "",
  }
}

async function ensureCharacterOutputFolder(
  characterId: string,
  characterName: string,
  imageId: string,
  userId?: string,
): Promise<void> {
  if (!characterId || !characterName || !imageId) return
  const folders = await loadOutputFolders(userId)
  const characterFolder = folders.find((candidate) => candidate.binding?.characterId === characterId)
  // The Visuals pill controls both prompt inheritance and automatic filing.
  // A disabled binding leaves new images Unfiled instead of quietly adding
  // them to a folder the user explicitly switched off.
  if (characterFolder?.binding && !characterFolder.binding.enabled) return
  const inheritedTags = asString((await characterBaseTagState(characterId, userId)).tags).trim()
  const folderId = `character:${characterId}`
  let folder = characterFolder
    || folders.find((candidate) => candidate.id === folderId && !candidate.binding)
  if (!folder) {
    folder = {
      id: folderId,
      name: characterName.slice(0, 80),
      imageIds: [],
      binding: {
        type: "character",
        characterId,
        positivePrompt: inheritedTags,
        negativePrompt: "",
        checkpoint: "",
        stackPresetId: "",
        stackSnapshot: [],
        sourcePresetId: "",
        enabled: true,
        activeLookId: "default",
        looks: [defaultCharacterLook()],
      },
      updatedAt: Date.now(),
    }
    folders.unshift(folder)
  }
  if (!folder.binding) {
    folder.binding = {
      type: "character",
      characterId,
      positivePrompt: inheritedTags,
      negativePrompt: "",
      checkpoint: "",
      stackPresetId: "",
      stackSnapshot: [],
      sourcePresetId: "",
      enabled: true,
      activeLookId: "default",
      looks: [defaultCharacterLook()],
    }
  }
  if (folder.id === folderId && folder.name === characterName.slice(0, 80)) {
    folder.name = characterName.slice(0, 80)
  }
  folder.imageIds = [imageId, ...folder.imageIds.filter((id) => id !== imageId)].slice(0, 500)
  folder.updatedAt = Date.now()
  await persistOutputFolders(folders, userId)
}

function taggedJobPublic(job: TaggedImageJob): JsonObject {
  return {
    id: job.id,
    key: job.key,
    tagFingerprint: stableTextHash(job.fullMatch),
    chatId: job.chatId,
    messageId: job.messageId,
    slot: job.slot,
    prompt: job.prompt,
    negativePrompt: job.negativePrompt,
    aspect: job.aspect,
    alt: job.alt,
    status: job.status,
    clientJobId: job.clientJobId,
    imageId: job.imageId,
    imageUrl: job.imageUrl,
    inserted: job.inserted,
    error: job.error,
    ownerCharacterId: job.ownerCharacterId,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

function sendTaggedJobState(job: TaggedImageJob, userId?: string): void {
  spindle.sendToFrontend({ type: "tagged_image_job", data: taggedJobPublic(job) }, userId)
}

function sendTaggedMessageReconciliation(job: TaggedImageJob, content: string, userId?: string): void {
  spindle.sendToFrontend({
    type: "tagged_message_reconciled",
    data: {
      jobId: job.id,
      chatId: job.chatId,
      messageId: job.messageId,
      content,
    },
  }, userId)
}

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function withTaggedMessageFinalizeLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = taggedMessageFinalizeLocks.get(key) || Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  const current = previous.catch(() => {}).then(() => gate)
  taggedMessageFinalizeLocks.set(key, current)
  await previous.catch(() => {})
  try {
    return await task()
  } finally {
    release()
    if (taggedMessageFinalizeLocks.get(key) === current) taggedMessageFinalizeLocks.delete(key)
  }
}

function replaceTaggedImagePlaceholder(content: string, job: TaggedImageJob, markup: string): { content: string; replaced: boolean } {
  if (job.fullMatch && content.includes(job.fullMatch)) {
    return { content: content.replace(job.fullMatch, markup), replaced: true }
  }
  const tagPattern = /<swarm-image\b([^>]*)>((?:(?!<swarm-image\b)[\s\S])*?)<\/swarm-image\s*>/gi
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(content))) {
    if (cleanTagSlot(parseTagAttributes(match[1]).slot) !== job.slot) continue
    return {
      content: `${content.slice(0, match.index)}${markup}${content.slice(match.index + match[0].length)}`,
      replaced: true,
    }
  }
  const existingFigure = new RegExp(
    `<figure\\b[^>]*data-swarm-studio-job-id="${escapeRegex(job.id)}"[^>]*>[\\s\\S]*?<\\/figure>`,
    "i",
  )
  if (existingFigure.test(content)) {
    return { content: content.replace(existingFigure, markup), replaced: true }
  }
  return { content, replaced: false }
}

function normalizedTaggedPrompt(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function taggedMessageMatchScore(message: any, job: TaggedImageJob): number {
  const role = asString(message?.role).trim().toLowerCase()
  if (role && role !== "assistant") return 0
  const content = asString(message?.content)
  if (!content) return 0
  if (content.includes(`data-swarm-studio-job-id="${job.id}"`)) return 4
  if (job.fullMatch && content.includes(job.fullMatch)) return 3

  const sourceTag = parseSwarmImageTags(job.fullMatch)[0]
  const sourcePrompt = normalizedTaggedPrompt(sourceTag?.content || "")
  if (!sourcePrompt) return 0
  for (const tag of parseSwarmImageTags(content)) {
    if (cleanTagSlot(tag.attrs.slot) !== job.slot) continue
    if (normalizedTaggedPrompt(tag.content) === sourcePrompt) return 2
  }
  return 0
}

function findTaggedMessageTarget(messages: any[], job: TaggedImageJob): any | null {
  const direct = messages.find((message: any) => asString(message?.id) === job.messageId)
  if (direct && taggedMessageMatchScore(direct, job) > 0) return direct

  let best: any | null = null
  let bestScore = 0
  for (const message of messages) {
    const score = taggedMessageMatchScore(message, job)
    if (score >= bestScore && score > 0) {
      best = message
      bestScore = score
    }
  }
  return best
}

async function removeTaggedImageFromChat(
  job: TaggedImageJob,
  userId?: string,
): Promise<{ messageId: string; content: string }> {
  if (!spindle.permissions.has("chat_mutation")) {
    throw new Error("Grant Chat Mutation permission to remove inline images from chat.")
  }
  const initialMessages = await spindle.chat.getMessages(job.chatId)
  const initialTarget = findTaggedMessageTarget(initialMessages, job)
  const initialMessageId = asString(initialTarget?.id)
  if (!initialTarget || !initialMessageId) {
    throw new Error("The chat message containing that image no longer exists.")
  }
  const lockKey = `${userId || "default"}:${job.chatId}:${initialMessageId}`
  return withTaggedMessageFinalizeLock(lockKey, async () => {
    const messages = await spindle.chat.getMessages(job.chatId)
    const target = findTaggedMessageTarget(messages, job)
    const messageId = asString(target?.id)
    if (!target || !messageId) {
      throw new Error("The chat message containing that image no longer exists.")
    }
    const content = asString(target.content)
    const escapedJobId = escapeRegex(job.id)
    const figurePattern = new RegExp(
      `<figure\\b(?=[^>]*data-swarm-studio-job-id=(?:"${escapedJobId}"|'${escapedJobId}'))[^>]*>[\\s\\S]*?<\\/figure>`,
      "i",
    )
    if (!figurePattern.test(content)) {
      throw new Error("That inline image is no longer attached to the chat message.")
    }
    const nextContent = content.replace(figurePattern, "")
    const metadata = asRecord(target.metadata)
    const taggedImages = Array.isArray(metadata.swarm_studio_tagged_images)
      ? metadata.swarm_studio_tagged_images.filter((item: any) => asString(item?.jobId) !== job.id)
      : []
    await spindle.chat.updateMessage(job.chatId, messageId, {
      content: nextContent,
      metadata: {
        ...metadata,
        swarm_studio_tagged_images: taggedImages,
      },
    })
    await persistTaggedImageJobs(
      (await loadTaggedImageJobs(userId)).filter((candidate) => candidate.id !== job.id),
      userId,
    )
    taggedFinalizeRetries.delete(job.id)
    taggedFinalizeMessageTargets.delete(job.id)
    return { messageId, content: nextContent }
  })
}

async function finalizeTaggedImageJob(job: TaggedImageJob, userId?: string): Promise<boolean> {
  if (!job.imageUrl || !spindle.permissions.has("chat_mutation")) return false
  const initialMessages = await spindle.chat.getMessages(job.chatId)
  const initialTarget = findTaggedMessageTarget(initialMessages, job)
  if (!initialTarget) return false
  const initialMessageId = asString(initialTarget?.id)
  if (!initialMessageId) return false
  if (initialMessageId !== job.messageId) {
    job.messageId = initialMessageId
    job.key = `${job.chatId}:${job.messageId}:${job.slot}`
  }
  const lockKey = `${userId || "default"}:${job.chatId}:${job.messageId}`
  return withTaggedMessageFinalizeLock(lockKey, async () => {
    const messages = await spindle.chat.getMessages(job.chatId)
    const target = findTaggedMessageTarget(messages, job)
    const targetMessageId = asString(target?.id)
    if (targetMessageId && targetMessageId !== job.messageId) {
      job.messageId = targetMessageId
      job.key = `${job.chatId}:${job.messageId}:${job.slot}`
    }
    const content = asString(target?.content)
    if (!target || !job.messageId) return false
    const alt = job.alt || `Generated illustration for ${job.slot}`
    const markup = `<figure data-swarm-studio-image="true" data-swarm-studio-job-id="${escapeHtmlAttribute(job.id)}" data-swarm-studio-slot="${escapeHtmlAttribute(job.slot)}" tabindex="0" style="position:relative;display:block;width:100%;height:100%;margin:0;"><img src="${escapeHtmlAttribute(job.imageUrl)}" alt="${escapeHtmlAttribute(alt)}" data-swarm-studio-slot="${escapeHtmlAttribute(job.slot)}" data-swarm-studio-fit="cover" loading="lazy" style="display:block;width:100%;height:100%;min-width:100%;min-height:100%;max-width:none;max-height:none;object-fit:cover;object-position:center;"><span data-swarm-studio-inline-action="true" tabindex="0" role="button" aria-label="Illustration actions">↻</span></figure>`
    const replacement = replaceTaggedImagePlaceholder(content, job, markup)
    if (!replacement.replaced) {
      if (content.includes(`data-swarm-studio-job-id="${job.id}"`)) {
        job.inserted = true
        job.error = ""
        await upsertTaggedImageJob(job, userId)
        sendTaggedJobState(job, userId)
        sendTaggedMessageReconciliation(job, content, userId)
        return true
      }
      return false
    }
    const metadata = asRecord(target.metadata)
    const previous = Array.isArray(metadata.swarm_studio_tagged_images)
      ? metadata.swarm_studio_tagged_images.filter((item: any) => asString(item?.jobId) !== job.id)
      : []
    await spindle.chat.updateMessage(job.chatId, job.messageId, {
      content: replacement.content,
      metadata: {
        ...metadata,
        swarm_studio_tagged_images: [...previous, {
          jobId: job.id,
          slot: job.slot,
          prompt: job.prompt,
          negativePrompt: job.negativePrompt,
          imageId: job.imageId,
          imageUrl: job.imageUrl,
          createdAt: job.updatedAt,
        }],
      },
    })
    job.inserted = true
    job.error = ""
    await upsertTaggedImageJob(job, userId)
    sendTaggedJobState(job, userId)
    sendTaggedMessageReconciliation(job, replacement.content, userId)
    return true
  })
}

async function finalizeTaggedImageJobWithRetry(job: TaggedImageJob, userId?: string): Promise<boolean> {
  const active = taggedFinalizeRetries.get(job.id)
  if (active) return active

  const task = (async () => {
    let lastError = ""
    job.error = ""
    for (const delayMs of TAGGED_FINALIZE_RETRY_DELAYS_MS) {
      if (delayMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, delayMs))
      }
      if (job.status !== "ready" || !job.imageUrl) return false
      try {
        const targetMessageId = taggedFinalizeMessageTargets.get(job.id)
        if (targetMessageId && targetMessageId !== job.messageId) {
          job.messageId = targetMessageId
          job.key = `${job.chatId}:${job.messageId}:${job.slot}`
        }
        if (await finalizeTaggedImageJob(job, userId)) {
          taggedFinalizeMessageTargets.delete(job.id)
          return true
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }

    job.inserted = false
    job.error = lastError
      ? `Image generated, but Lumiverse could not attach it to the chat yet: ${lastError}`
      : "Image generated, but the chat message was not ready for attachment. Use Attach image to try again."
    await upsertTaggedImageJob(job, userId)
    sendTaggedJobState(job, userId)
    return false
  })()

  taggedFinalizeRetries.set(job.id, task)
  void task.finally(() => {
    if (taggedFinalizeRetries.get(job.id) === task) taggedFinalizeRetries.delete(job.id)
  }).catch(() => {})
  return task
}

interface TaggedImageRetryOverrides {
  prompt?: string
  negativePrompt?: string
}

function replaceTaggedImagePrompt(fullMatch: string, prompt: string): string {
  return fullMatch.replace(
    /(<swarm-image\b[^>]*>)[\s\S]*?(<\/swarm-image\s*>)/i,
    (_match, opening, closing) => `${opening}\n${prompt}\n${closing}`,
  )
}

async function runTaggedImageJob(
  job: TaggedImageJob,
  useOriginalProfile: boolean,
  userId?: string,
  overrides: TaggedImageRetryOverrides = {},
): Promise<void> {
  if (runningTaggedJobs.has(job.id)) return
  runningTaggedJobs.add(job.id)
  try {
    const storedProfile = await loadStudioGenerationProfile(userId)
    const profile = useOriginalProfile && job.generationInput
      ? sanitizeStudioProfile({ input: job.generationInput, recordHints: job.recordHints, updatedAt: job.updatedAt })
      : storedProfile
    const connection = await connectionForTaggedProfile(profile, userId)
    const profileInput = asRecord(profile?.input)
    const input: JsonObject = {
      ...profileInput,
      connection_id: connection.id,
      model: asString(profileInput.model) || connection.model,
      parameters: { ...asRecord(connection.default_parameters), ...asRecord(profileInput.parameters) },
    }
    const parameters = asRecord(input.parameters)
    applyAspectToParameters(parameters, job.aspect || "4:3")
    removeTaggedPresetOverride(parameters)
    // Every in-chat retry should produce a new candidate, even when the
    // source Studio profile or the original job happened to store a fixed seed.
    parameters.seed = -1
    const originalTag = parseSwarmImageTags(job.fullMatch)[0]
    const originalScenePrompt = overrides.prompt?.trim() || originalTag?.content.trim() || job.prompt
    const presetPrompt = applyStudioPresetLayer(originalScenePrompt, profile)
    const characterMode = asString(originalTag?.attrs.character).trim().toLowerCase()
    const includeCharacter = !["none", "off", "false", "no", "0"].includes(characterMode)
    const personaMode = asString(originalTag?.attrs.persona).trim().toLowerCase()
    const includePersona = ["active", "on", "true", "yes", "1"].includes(personaMode)
    const automation = await loadTagAutomationConfig(userId)
    const characterLayer = await applyCharacterLayer(
      job.chatId,
      presetPrompt,
      includeCharacter,
      includePersona,
      automation,
      asString(originalTag?.attrs.look),
      userId,
    )
    if (!asString(originalTag?.attrs.aspect).trim() && characterLayer.preferredAspect) {
      job.aspect = characterLayer.preferredAspect
      applyAspectToParameters(parameters, characterLayer.preferredAspect)
    }
    if (characterLayer.checkpoint) input.model = characterLayer.checkpoint
    if (characterLayer.referenceImageId || characterLayer.referenceImageUrl) {
      try {
        const reference = await resolveVisualReferenceImage(
          characterLayer.referenceImageId,
          characterLayer.referenceImageUrl,
          userId,
        )
        if (reference) {
          parameters.referenceImages = [reference]
          if (!Number.isFinite(Number(parameters.denoise))) parameters.denoise = .6
        } else {
          spindle.log.warn("A Character Look or Visual Lore reference image could not be resolved; continuing without reference conditioning.")
        }
      } catch (error) {
        spindle.log.warn(`Could not prepare visual reference conditioning: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    input.prompt = characterLayer.prompt
    const profileNegative = overrides.negativePrompt !== undefined
      ? asString(overrides.negativePrompt).trim()
      : asString(profileInput.negativePrompt).trim()
    const visualNegative = characterLayer.negativePrompt.trim()
    input.negativePrompt = visualNegative && !profileNegative.toLowerCase().includes(visualNegative.toLowerCase())
      ? [visualNegative, profileNegative].filter(Boolean).join(", ")
      : profileNegative
    if (characterLayer.stack.length || characterLayer.excludedLoras.length) {
      const existingNames = stringList(parameters.loras, 128)
      const existingWeights = Array.isArray(parameters.loraWeights) ? parameters.loraWeights.map(Number) : []
      const excluded = new Set(characterLayer.excludedLoras.map((name) => name.toLowerCase()))
      const merged = new Map<string, { name: string; weight: number }>()
      for (const item of characterLayer.stack.filter((item) => item.enabled !== false)) {
        merged.set(item.name.toLowerCase(), { name: item.name, weight: item.weight })
      }
      existingNames.forEach((name, index) => {
        if (excluded.has(name.toLowerCase())) return
        merged.set(name.toLowerCase(), {
          name,
          weight: Number.isFinite(existingWeights[index]) ? existingWeights[index] : 1,
        })
      })
      parameters.loras = [...merged.values()].map((item) => item.name)
      parameters.loraWeights = [...merged.values()].map((item) => item.weight)
    }
    input.parameters = parameters
    input.clientJobId = crypto.randomUUID()
    job.prompt = characterLayer.prompt
    job.negativePrompt = asString(input.negativePrompt)
    job.ownerCharacterId = characterLayer.characterId
    job.clientJobId = asString(input.clientJobId)
    job.generationInput = sanitizeStudioProfile({ input, recordHints: profile?.recordHints, updatedAt: Date.now() })?.input
    job.recordHints = asRecord(profile?.recordHints)
    job.status = "generating"
    job.error = ""
    job.inserted = false
    await upsertTaggedImageJob(job, userId)
    sendTaggedJobState(job, userId)

    const controller = new AbortController()
    const controllerKey = generationKey(userId, job.clientJobId)
    generationControllers.set(controllerKey, {
      controller,
      nativeStream: typeof spindle.imageGen?.generateStream === "function",
    })
    const startedAt = Date.now()
    let result: JsonObject
    try {
      result = await generateWithProgress({
        ...input,
        owner_chat_id: job.chatId,
        owner_character_id: characterLayer.characterId || undefined,
        userId,
      }, controller, job.clientJobId, userId)
    } finally {
      if (generationControllers.get(controllerKey)?.controller === controller) {
        generationControllers.delete(controllerKey)
      }
    }
    const timing = await loadLatestSwarmGenerationMetadata(
      connection,
      spindle.permissions.has("cors_proxy") ? await getMetadataToken(connection.id, userId) : null,
      input,
      Date.now() - startedAt,
      userId,
    )
    const record = await saveGenerationRecord(result, input, {
      ...asRecord(profile?.recordHints),
      source: "message-tag",
    }, timing, userId)
    job.imageId = record.imageId || asString(result.imageId)
    job.imageUrl = record.imageUrl || asString(result.imageUrl)
    if (!job.imageUrl && job.imageId) job.imageUrl = `/api/v1/image-gen/results/${encodeURIComponent(job.imageId)}`
    if (!job.imageUrl) throw new Error("Lumiverse completed the image job without returning a saved image URL.")
    job.status = "ready"
    job.error = ""
    await upsertTaggedImageJob(job, userId)
    // A completed tagged job is a terminal lifecycle event in its own right.
    // Broadcast it before the richer result payload so every frontend surface
    // can retire its progress UI even if result delivery is delayed or arrives
    // out of order with an earlier progress/list message.
    sendTaggedJobState(job, userId)
    spindle.updateMacroValue("last_genned", job.imageUrl)
    await ensureCharacterOutputFolder(characterLayer.characterId, characterLayer.characterName, job.imageId, userId)
    const taggedChat = spindle.permissions.has("chats")
      ? await spindle.chats.get(job.chatId, userId)
      : { id: job.chatId }
    const outputPage = await listOutputs(userId, taggedChat)
    spindle.sendToFrontend({
      type: "tagged_generation_result",
      clientJobId: job.clientJobId,
      data: {
        result,
        record,
        taggedJob: taggedJobPublic(job),
        outputFolders: await loadOutputFolders(userId),
        ...outputPage,
      },
    }, userId)
    const inserted = await finalizeTaggedImageJobWithRetry(job, userId)
    if (inserted && automation.completionToast && typeof spindle.toast?.success === "function") {
      spindle.toast.success(`Swarm Studio attached ${job.alt || "an illustration"}.`)
    }
  } catch (error) {
    job.status = isAbortError(error) ? "cancelled" : "failed"
    job.error = error instanceof Error ? error.message : String(error)
    reportBackendError("Tagged image generation failed", error, {
      jobId: job.id,
      chatId: job.chatId,
      messageId: job.messageId,
      slot: job.slot,
    })
    await upsertTaggedImageJob(job, userId)
    sendTaggedJobState(job, userId)
  } finally {
    runningTaggedJobs.delete(job.id)
  }
}

async function requestTaggedImageGeneration(payload: any, userId?: string): Promise<TaggedImageJob> {
  if (!spindle.permissions.has("image_gen")) throw new Error("Grant Image Generation permission to use Swarm image tags.")
  if (!spindle.permissions.has("chat_mutation")) throw new Error("Grant Chat Mutation permission to attach generated images to messages.")
  const chatId = asString(payload?.chatId).trim()
  const messageId = asString(payload?.messageId).trim()
  const fullMatch = asString(payload?.fullMatch).slice(0, 24_000)
  const attrs = asRecord(payload?.attrs)
  const scenePrompt = asString(payload?.content).trim().slice(0, 12_000)
  const strictRequest = asString(attrs.request).toLowerCase() === "generate"
  const compatibleLegacyRequest = Boolean(asString(attrs.slot) && (asString(attrs.aspect) || asString(attrs.alt)))
  if (!strictRequest && !compatibleLegacyRequest) {
    throw new Error("Ignored a Swarm image tag that was missing request=\"generate\" and the legacy slot/aspect metadata.")
  }
  if (!chatId || !messageId || !fullMatch || !scenePrompt) {
    throw new Error("The Swarm image tag is missing its chat, message, or prompt content.")
  }
  const slot = cleanTagSlot(attrs.slot) || `image-${stableTextHash(fullMatch).slice(0, 6)}`
  const key = `${chatId}:${messageId}:${slot}:${stableTextHash(fullMatch)}`
  const force = payload?.force === true
  const useOriginalProfile = asString(payload?.retryMode) === "original"
  const jobs = await loadTaggedImageJobs(userId)
  let job = jobs.find((candidate) => candidate.key === key)
  if (job) {
    job.fullMatch = fullMatch
    if (job.status === "ready") await finalizeTaggedImageJobWithRetry(job, userId)
    if (!force || job.status === "generating") {
      sendTaggedJobState(job, userId)
      return job
    }
    job.status = "queued"
    job.error = ""
    job.imageId = ""
    job.imageUrl = ""
    job.inserted = false
    await upsertTaggedImageJob(job, userId)
  } else {
    job = {
      id: crypto.randomUUID(),
      key,
      chatId,
      messageId,
      slot,
      prompt: scenePrompt,
      negativePrompt: "",
      aspect: cleanAspect(attrs.aspect) || "4:3",
      alt: asString(attrs.alt).trim().slice(0, 300),
      fullMatch,
      status: "requested",
      clientJobId: "",
      imageId: "",
      imageUrl: "",
      inserted: false,
      error: "",
      ownerCharacterId: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await upsertTaggedImageJob(job, userId)
  }
  sendTaggedJobState(job, userId)
  const config = await loadTagAutomationConfig(userId)
  if (config.autoGenerate || force) await runTaggedImageJob(job, useOriginalProfile, userId)
  return job
}

async function retryTaggedImageGeneration(
  jobId: string,
  retryMode: string,
  overrides: TaggedImageRetryOverrides = {},
  userId?: string,
): Promise<TaggedImageJob> {
  const job = (await loadTaggedImageJobs(userId)).find((candidate) => candidate.id === jobId)
  if (!job) throw new Error("That inline illustration job is no longer available.")
  if (runningTaggedJobs.has(job.id) || job.status === "generating") {
    sendTaggedJobState(job, userId)
    return job
  }
  job.status = "queued"
  job.error = ""
  job.inserted = false
  if (overrides.prompt !== undefined) {
    const prompt = asString(overrides.prompt).trim().slice(0, 12_000)
    if (!prompt) throw new Error("Give the inline illustration a prompt before regenerating it.")
    job.fullMatch = replaceTaggedImagePrompt(job.fullMatch, prompt)
    job.prompt = prompt
    overrides.prompt = prompt
  }
  await upsertTaggedImageJob(job, userId)
  sendTaggedJobState(job, userId)
  await runTaggedImageJob(job, retryMode === "original", userId, overrides)
  return job
}

function compactPromptImageLabel(value: unknown, fallback = "generated image"): string {
  const label = asString(value)
    .replace(/&(?:quot|apos|#39|lt|gt|amp);/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[\[\]\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240)
  return label || fallback
}

function imageAltFromMarkup(markup: string, fallback = "generated image"): string {
  const match = markup.match(/<img\b[^>]*\balt\s*=\s*(["'])([\s\S]*?)\1/i)
  return compactPromptImageLabel(match?.[2], fallback)
}

function isStoredLumiverseImageUrl(value: string): boolean {
  const url = value.trim().replace(/^<|>$/g, "")
  return /^data:image\//i.test(url)
    || /\/api\/v1\/images\/[a-z0-9-]+(?:[?#].*)?$/i.test(url)
    || /\/api\/v1\/image-gen\/results\/[a-z0-9-]+(?:[?#].*)?$/i.test(url)
}

function cleanGeneratedMarkupForPrompt(content: string): string {
  return content
    .replace(/<swarm-image\b([^>]*)>([\s\S]*?)<\/swarm-image\s*>/gi, (_match, rawAttrs, prompt) => {
      const attrs = parseTagAttributes(rawAttrs)
      return `[Illustration requested${attrs.alt ? `: ${compactPromptImageLabel(attrs.alt)}` : ""}]`
    })
    .replace(
      /<figure\b(?=[^>]*\bdata-swarm-studio-image\s*=\s*(["'])true\1)[^>]*>[\s\S]*?<\/figure\s*>/gi,
      (markup) => `[Generated illustration: ${imageAltFromMarkup(markup)}]`,
    )
    .replace(
      /<img\b(?=[^>]*\bdata-swarm-studio-slot\s*=\s*(["'])[^"']+\1)[^>]*>/gi,
      (markup) => `[Generated illustration: ${imageAltFromMarkup(markup)}]`,
    )
    .replace(
      /!\[([^\]\r\n]*)\]\(\s*(?:<([^>\r\n]+)>|([^\s)\r\n]+))(?:\s+["'][^"'\r\n]*["'])?\s*\)/gi,
      (markup, alt, bracketedUrl, plainUrl) => isStoredLumiverseImageUrl(asString(bracketedUrl || plainUrl))
        ? `[Generated illustration: ${compactPromptImageLabel(alt)}]`
        : markup,
    )
    .replace(
      /<img\b[^>]*\bsrc\s*=\s*(["'])([\s\S]*?)\1[^>]*>/gi,
      (markup, _quote, url) => isStoredLumiverseImageUrl(asString(url))
        ? `[Generated illustration: ${imageAltFromMarkup(markup)}]`
        : markup,
    )
    .replace(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/gi, "[Embedded generated image omitted]")
}

function compactGeneratedIllustrationHistory(messages: any[]): any[] {
  let remaining = CONTEXT_IMAGE_MEMORY_LIMIT
  const marker = /\[(?:Generated illustration|Illustration requested)(?:: [^\]\r\n]{0,240})?\]/gi
  return [...messages].reverse().map((message) => {
    if (typeof message?.content !== "string") return message
    const matches = [...message.content.matchAll(marker)]
    if (!matches.length) return message
    let content = message.content
    for (const match of matches.reverse()) {
      const index = match.index ?? -1
      if (index < 0) continue
      if (remaining > 0) {
        remaining -= 1
        continue
      }
      content = `${content.slice(0, index)}${content.slice(index + match[0].length)}`
    }
    return {
      ...message,
      content: content.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
    }
  }).reverse().filter((message) => {
    if (asString(message?.role).toLowerCase() !== "assistant") return true
    return typeof message?.content !== "string" || Boolean(message.content.trim())
  })
}

async function taggedImagePromptInterceptor(messages: any[], context: any): Promise<any> {
  const userId = asString(context?.userId) || undefined
  const cleaned = compactGeneratedIllustrationHistory(messages.map((message) => {
    const role = asString(message?.role).toLowerCase()
    if (typeof message?.content !== "string" || (!message?.__isChatHistory && role !== "assistant")) return message
    return { ...message, content: cleanGeneratedMarkupForPrompt(message.content) }
  }))
  const config = await loadTagAutomationConfig(userId)
  if (!config.injectProtocol) return cleaned
  if (cleaned.some((message) => typeof message?.content === "string" && message.content.includes("SWARM STUDIO IMAGE "))) {
    return cleaned
  }
  await refreshContextMacros(userId)
  const injected = {
    role: "system",
    content: buildInjectedSwarmProtocol(
      await loadStudioGenerationProfile(userId),
      swarmProtocolContexts.get(protocolContextKey(userId)) || null,
      config,
    ),
  }
  return {
    messages: [injected, ...cleaned],
    breakdown: [{ messageIndex: 0, name: "Swarm Studio image tags" }],
  }
}

function permissionSnapshot(): Record<string, boolean> {
  return {
    imageGen: spindle.permissions.has("image_gen"),
    metadata: spindle.permissions.has("cors_proxy"),
    images: spindle.permissions.has("images"),
    chats: spindle.permissions.has("chats"),
    characters: spindle.permissions.has("characters"),
    personas: spindle.permissions.has("personas"),
    chatMutation: spindle.permissions.has("chat_mutation"),
    interceptor: spindle.permissions.has("interceptor"),
    generation: spindle.permissions.has("generation"),
  }
}

function markdownImageMessage(label: string, url: string): string {
  const safeLabel = (label || "Swarm Studio output")
    .replace(/[\[\]\r\n]+/g, " ")
    .trim()
    .slice(0, 160) || "Swarm Studio output"
  const safeUrl = url.replace(/[<>\r\n]/g, (value) => encodeURIComponent(value))
  return `![${safeLabel}](<${safeUrl}>)`
}

async function listOutputs(
  userId?: string,
  activeChat?: any,
  offset = 0,
  limit = HISTORY_PAGE_SIZE,
  allChats = false,
): Promise<{ outputs: any[]; total: number; offset: number; limit: number }> {
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit) || HISTORY_PAGE_SIZE))
  const safeOffset = Math.max(0, Math.trunc(offset) || 0)
  if (!spindle.permissions.has("images")) {
    return { outputs: [], total: 0, offset: safeOffset, limit: safeLimit }
  }
  const options: Record<string, unknown> = {
    onlyOwned: true,
    specificity: "sm",
    limit: safeLimit,
    offset: safeOffset,
    userId,
  }
  if (!allChats && activeChat?.id) options.chatId = activeChat.id
  const response = await spindle.images.list(options)
  const outputs = Array.isArray(response?.data) ? response.data : []
  const records = await loadGenerationRecords(userId)
  const byId = new Map(records.filter((record) => record.imageId).map((record) => [record.imageId, record]))
  return {
    outputs: outputs.map((output: any) => ({
      ...output,
      studioMetadata: byId.get(asString(output?.id)) || null,
    })),
    total: Math.max(outputs.length, Number(response?.total) || 0),
    offset: safeOffset,
    limit: safeLimit,
  }
}

async function listLibraryOutputs(userId?: string): Promise<{
  outputs: any[]
  total: number
  folders: OutputFolder[]
}> {
  const outputs: any[] = []
  let offset = 0
  let total = 0
  // The image service caps each call at 200. Walk every page so the library
  // itself is not silently capped at the first 200 owned outputs.
  for (let pageIndex = 0; pageIndex < 100; pageIndex++) {
    const page = await listOutputs(userId, null, offset, 200, true)
    outputs.push(...page.outputs)
    total = Math.max(total, page.total)
    offset += page.outputs.length
    if (!page.outputs.length || page.outputs.length < page.limit || offset >= total) break
  }
  return {
    outputs,
    total: Math.max(total, outputs.length),
    folders: await loadOutputFolders(userId),
  }
}

function collectConnectionModels(value: unknown, models: Map<string, string>, depth = 0): void {
  if (depth > 3 || value === null || value === undefined) return
  if (typeof value === "string") {
    const id = value.trim()
    if (id) models.set(id, models.get(id) || id)
    return
  }
  if (Array.isArray(value)) {
    for (const entry of value.slice(0, 2_000)) collectConnectionModels(entry, models, depth + 1)
    return
  }
  const record = asRecord(value)
  const id = asString(record.id || record.model || record.value).trim()
  const label = asString(record.label || record.name || record.title).trim()
  if (id) models.set(id, label || models.get(id) || id)
  for (const key of ["models", "model_list", "modelList", "available_models", "availableModels"]) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      collectConnectionModels(record[key], models, depth + 1)
    }
  }
}

async function listParserModels(connectionId: string, userId?: string): Promise<{
  connectionId: string
  models: Array<{ id: string; label: string }>
  live: boolean
}> {
  if (!spindle.permissions.has("generation")) {
    throw new Error("Grant Generation permission to list parser models.")
  }
  const listed = await spindle.connections.list(userId)
  const connections = Array.isArray(listed) ? listed : []
  const connection = connections.find((candidate: any) => asString(candidate?.id) === connectionId)
    || connections.find((candidate: any) => candidate?.is_default)
    || connections[0]
  if (!connection?.id) return { connectionId: "", models: [], live: false }

  const models = new Map<string, string>()
  let live = false
  const liveList = spindle.connections?.getModels
    || spindle.connections?.models
    || spindle.connections?.listModels
  if (typeof liveList === "function") {
    try {
      collectConnectionModels(await liveList.call(spindle.connections, connection.id, userId), models)
      live = models.size > 0
    } catch (error) {
      reportBackendError("Could not load the parser connection's live model list", error, {
        connectionId: connection.id,
        connectionName: connection.name,
      })
    }
  }
  collectConnectionModels(connection.model, models)
  collectConnectionModels(connection.metadata, models)
  return {
    connectionId: asString(connection.id),
    models: [...models].map(([id, label]) => ({ id, label })),
    live,
  }
}

async function bootstrap(userId?: string): Promise<JsonObject> {
  const permissions = permissionSnapshot()
  const profile = await loadStudioGenerationProfile(userId)
  await pushStudioProfileMacros(profile, userId)
  await refreshContextMacros(userId)
  const allConnections = permissions.imageGen
    ? await spindle.imageGen.listConnections(userId)
    : []
  const connections = (Array.isArray(allConnections) ? allConnections : [])
    .filter((connection: any) => connection?.provider === "swarmui")
  let parserConnections: any[] = []
  if (permissions.generation) {
    try {
      const listed = await spindle.connections.list(userId)
      parserConnections = Array.isArray(listed) ? listed : []
    } catch (error) {
      reportBackendError("Could not list parser connections", error)
      spindle.log.warn(`Could not list parser connections: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const activeChat = permissions.chats
    ? await spindle.chats.getActive(userId)
    : null
  const outputPage = await listOutputs(userId, activeChat)

  return {
    permissions,
    connections,
    parserConnections,
    activeChat,
    ...outputPage,
    stackPresets: await loadStackPresets(userId),
    outputFolders: await loadOutputFolders(userId),
    tagAutomation: await loadTagAutomationConfig(userId),
    characterBaseTags: await characterBaseTagState(asString(activeChat?.character_id), userId),
    chatVisuals: await chatVisualsState(userId),
  }
}

async function loadConnection(connectionId: string, userId?: string): Promise<JsonObject> {
  const connection = await getConnection(connectionId, userId)
  const models = await spindle.imageGen.getModels(connectionId, userId)
  const hasMetadataToken = await spindle.enclave.has(tokenKey(connectionId), userId)

  let loras: LoraMetadata[] = []
  let checkpoints: CheckpointMetadata[] = []
  let swarmOptions: SwarmOptions = {
    samplers: [],
    schedulers: [],
    presets: [],
    parameters: [],
    canManagePresets: false,
    workflows: [],
    workflowError: "",
  }
  const metadataErrors: string[] = []
  if (spindle.permissions.has("cors_proxy")) {
    const token = await getMetadataToken(connectionId, userId)
    try {
      loras = await listLoras(connection, token, userId)
    } catch (error) {
      reportBackendError("Could not load SwarmUI LoRA metadata", error, { connectionId })
      metadataErrors.push(error instanceof Error ? error.message : String(error))
    }
    try {
      checkpoints = await listCheckpoints(connection, token, userId)
    } catch (error) {
      reportBackendError("Could not load SwarmUI checkpoint metadata", error, { connectionId })
      metadataErrors.push(error instanceof Error ? error.message : String(error))
    }
    try {
      swarmOptions = await loadSwarmOptions(connection, token, userId)
    } catch (error) {
      reportBackendError("Could not load SwarmUI generation controls", error, { connectionId })
      metadataErrors.push(`Swarm controls: ${error instanceof Error ? error.message : String(error)}`)
    }
  } else {
    metadataErrors.push("Grant the CORS Proxy permission to load SwarmUI model metadata and previews.")
  }

  return {
    connection,
    models: Array.isArray(models) ? models : [],
    loras,
    checkpoints,
    swarmOptions,
    metadataError: metadataErrors.join(" "),
    hasMetadataToken,
  }
}

async function handleMessage(payload: any, userId?: string): Promise<void> {
  const type = asString(payload?.type)
  const requestId = asString(payload?.requestId)
  try {
    switch (type) {
      case "bootstrap": {
        spindle.sendToFrontend({
          type: "bootstrap_result",
          requestId,
          data: await bootstrap(userId),
        }, userId)
        return
      }
      case "list_parser_models": {
        spindle.sendToFrontend({
          type: "parser_models_result",
          requestId,
          data: await listParserModels(asString(payload?.connectionId), userId),
        }, userId)
        return
      }
      case "set_tag_automation": {
        const config = await saveTagAutomationConfig(payload?.config, userId)
        spindle.sendToFrontend({
          type: "tag_automation_result",
          requestId,
          data: config,
        }, userId)
        return
      }
      case "set_character_base_tags": {
        const data = await saveCharacterBaseTags(
          asString(payload?.characterId).trim(),
          asString(payload?.tags),
          userId,
        )
        spindle.sendToFrontend({
          type: "character_base_tags_result",
          requestId,
          data,
        }, userId)
        return
      }
      case "sync_studio_profile": {
        const profile = await saveStudioGenerationProfile(payload?.input, payload?.recordHints, userId)
        spindle.sendToFrontend({
          type: "studio_profile_synced",
          requestId,
          data: { updatedAt: profile?.updatedAt || 0 },
        }, userId)
        return
      }
      case "get_chat_visuals": {
        spindle.sendToFrontend({
          type: "chat_visuals_result",
          requestId,
          data: await chatVisualsState(userId, payload?.currentStack),
        }, userId)
        return
      }
      case "get_character_visual_canon": {
        spindle.sendToFrontend({
          type: "character_visual_canon_result",
          requestId,
          data: await characterVisualCanonState(asString(payload?.characterId).trim(), userId),
        }, userId)
        return
      }
      case "save_character_look": {
        const characterId = asString(payload?.characterId).trim()
        const folder = await ensureCharacterVisualFolderForId(characterId, userId)
        await saveCharacterLook(folder.id, payload?.look, payload?.activate !== false, userId)
        spindle.sendToFrontend({
          type: "character_visual_canon_result",
          requestId,
          data: await characterVisualCanonState(characterId, userId),
        }, userId)
        return
      }
      case "select_character_look": {
        const characterId = asString(payload?.characterId).trim()
        const folder = await ensureCharacterVisualFolderForId(characterId, userId)
        await selectCharacterLook(folder.id, asString(payload?.lookId).trim(), userId)
        spindle.sendToFrontend({
          type: "character_visual_canon_result",
          requestId,
          data: await characterVisualCanonState(characterId, userId),
        }, userId)
        return
      }
      case "delete_character_look": {
        const characterId = asString(payload?.characterId).trim()
        const folder = await ensureCharacterVisualFolderForId(characterId, userId)
        await deleteCharacterLook(folder.id, asString(payload?.lookId).trim(), userId)
        spindle.sendToFrontend({
          type: "character_visual_canon_result",
          requestId,
          data: await characterVisualCanonState(characterId, userId),
        }, userId)
        return
      }
      case "get_visual_lore": {
        spindle.sendToFrontend({
          type: "visual_lore_result",
          requestId,
          data: await visualLoreState(asString(payload?.bookId), asString(payload?.entryId), userId),
        }, userId)
        return
      }
      case "save_visual_lore": {
        spindle.sendToFrontend({
          type: "visual_lore_result",
          requestId,
          data: await saveVisualLoreIdentity(
            asString(payload?.bookId),
            asString(payload?.entryId),
            payload?.identity,
            userId,
          ),
        }, userId)
        return
      }
      case "save_persona_visual_preset": {
        const presets = await savePersonaVisualPreset(payload?.preset, userId)
        const requested = asRecord(payload?.preset)
        const selected = presets.find((preset) =>
          preset.id === asString(requested.id).trim()
          || preset.name.toLowerCase() === asString(requested.name).trim().toLowerCase(),
        )
        if (payload?.bind === true && selected) {
          const persona = spindle.permissions.has("personas")
            ? await spindle.personas.getActive(userId)
            : null
          await updatePersonaVisualBinding(persona, {
            presetId: selected.id,
            enabled: asBoolean(payload?.bindingEnabled, true),
          }, userId)
        }
        spindle.sendToFrontend({
          type: "chat_visuals_result",
          requestId,
          data: await chatVisualsState(userId, payload?.currentStack),
        }, userId)
        return
      }
      case "delete_persona_visual_preset": {
        await deletePersonaVisualPreset(asString(payload?.presetId), userId)
        spindle.sendToFrontend({
          type: "chat_visuals_result",
          requestId,
          data: await chatVisualsState(userId, payload?.currentStack),
        }, userId)
        return
      }
      case "bind_persona_visual_preset": {
        const persona = spindle.permissions.has("personas")
          ? await spindle.personas.getActive(userId)
          : null
        await updatePersonaVisualBinding(persona, payload?.binding, userId)
        spindle.sendToFrontend({
          type: "chat_visuals_result",
          requestId,
          data: await chatVisualsState(userId, payload?.currentStack),
        }, userId)
        return
      }
      case "save_chat_visuals": {
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        const characterId = asString(activeChat?.character_id)
        if (!characterId) throw new Error("Open a character chat before saving character visuals.")
        let folders = await loadOutputFolders(userId)
        let folder = folders.find((candidate) => candidate.binding?.characterId === characterId)
        if (!folder) {
          folders = await createOutputFolder(asString(payload?.folderName), "character", userId)
          folder = folders.find((candidate) => candidate.binding?.characterId === characterId)
        }
        if (!folder?.binding) throw new Error("Lumiverse could not create this character's visual folder.")
        const requestedStackId = asString(payload?.stackPresetId).trim()
        const stackPreset = requestedStackId
          ? (await loadStackPresets(userId)).find((preset) => preset.id === requestedStackId)
          : null
        await updateOutputFolderProfile(folder.id, {
          positivePrompt: asString(payload?.positivePrompt),
          negativePrompt: asString(payload?.negativePrompt),
          checkpoint: asString(payload?.checkpoint),
          sourcePresetId: asString(payload?.sourcePresetId),
          stackPresetId: stackPreset?.id || "",
          stackSnapshot: stackPreset?.items || cleanStackPresetItems(payload?.stackSnapshot),
          enabled: asBoolean(payload?.enabled, true),
        }, userId)
        spindle.sendToFrontend({
          type: "chat_visuals_result",
          requestId,
          data: await chatVisualsState(userId, payload?.currentStack),
        }, userId)
        return
      }
      case "tag_generate": {
        await requestTaggedImageGeneration(payload, userId)
        return
      }
      case "list_tagged_jobs": {
        spindle.sendToFrontend({
          type: "tagged_image_jobs_result",
          requestId,
          data: (await loadTaggedImageJobs(userId)).map(taggedJobPublic),
        }, userId)
        return
      }
      case "retry_tagged_job": {
        const overrides: TaggedImageRetryOverrides = {}
        if (Object.prototype.hasOwnProperty.call(payload, "promptOverride")) {
          overrides.prompt = asString(payload?.promptOverride)
        }
        if (Object.prototype.hasOwnProperty.call(payload, "negativePromptOverride")) {
          overrides.negativePrompt = asString(payload?.negativePromptOverride)
        }
        await retryTaggedImageGeneration(
          asString(payload?.jobId).trim(),
          asString(payload?.retryMode).trim(),
          overrides,
          userId,
        )
        return
      }
      case "retry_tagged_attachment": {
        const jobId = asString(payload?.jobId).trim()
        const job = (await loadTaggedImageJobs(userId)).find((candidate) => candidate.id === jobId)
        if (!job) throw new Error("That inline image job no longer exists.")
        if (job.status !== "ready" || !job.imageUrl) {
          throw new Error("The image must finish generating before it can be attached.")
        }
        const finalMessageId = asString(payload?.messageId).trim()
        if (finalMessageId && finalMessageId !== job.messageId) {
          taggedFinalizeMessageTargets.set(job.id, finalMessageId)
          job.messageId = finalMessageId
          job.key = `${job.chatId}:${job.messageId}:${job.slot}`
          await upsertTaggedImageJob(job, userId)
        }
        await finalizeTaggedImageJobWithRetry(job, userId)
        return
      }
      case "remove_tagged_image_from_chat": {
        const jobId = asString(payload?.jobId).trim()
        const job = (await loadTaggedImageJobs(userId)).find((candidate) => candidate.id === jobId)
        if (!job) throw new Error("That inline image job no longer exists.")
        const removed = await removeTaggedImageFromChat(job, userId)
        spindle.sendToFrontend({
          type: "tagged_image_removed",
          requestId,
          data: {
            jobId: job.id,
            chatId: job.chatId,
            messageId: removed.messageId,
            content: removed.content,
          },
        }, userId)
        return
      }
      case "load_connection": {
        const connectionId = asString(payload?.connectionId)
        spindle.sendToFrontend({
          type: "connection_result",
          requestId,
          data: await loadConnection(connectionId, userId),
        }, userId)
        return
      }
      case "refresh_metadata": {
        const connectionId = asString(payload?.connectionId)
        const connection = await getConnection(connectionId, userId)
        const token = await getMetadataToken(connectionId, userId)
        const key = sessionKey(userId, connectionId, Boolean(token))
        sessions.delete(key)
        const loras = await listLoras(connection, token, userId, true)
        const checkpoints = await listCheckpoints(connection, token, userId)
        const swarmOptions = await loadSwarmOptions(connection, token, userId)
        spindle.sendToFrontend({
          type: "metadata_result",
          requestId,
          data: {
            loras,
            checkpoints,
            swarmOptions,
            metadataError: "",
          },
        }, userId)
        return
      }
      case "start_lora_download": {
        startLoraDownloadJob(payload, requestId, userId)
        return
      }
      case "get_lora_download_status": {
        const job = loraDownloadJobs.get(loraDownloadJobKey(userId))
        spindle.sendToFrontend({
          type: "lora_download_status",
          requestId,
          data: job ? loraDownloadJobView(job) : null,
        }, userId)
        return
      }
      case "cancel_lora_download": {
        const job = cancelLoraDownloadJob(userId)
        spindle.sendToFrontend({
          type: "lora_download_status",
          requestId,
          data: job ? loraDownloadJobView(job) : null,
        }, userId)
        return
      }
      case "open_text_editor": {
        if (typeof spindle.textEditor?.open !== "function") {
          throw new Error("This Lumiverse build does not expose the expanded text editor.")
        }
        const editorId = asString(payload?.editorId).trim().slice(0, 80)
        if (!editorId) throw new Error("No prompt editor target was supplied.")
        const result = await spindle.textEditor.open({
          title: asString(payload?.title).trim().slice(0, 120) || "Swarm Studio prompt",
          value: asString(payload?.value).slice(0, 200_000),
          placeholder: asString(payload?.placeholder).slice(0, 500),
          userId,
        })
        spindle.sendToFrontend({
          type: "text_editor_result",
          requestId,
          data: {
            editorId,
            text: asString(result?.text),
            cancelled: result?.cancelled === true,
          },
        }, userId)
        return
      }
      case "preview": {
        const connectionId = asString(payload?.connectionId)
        const previewRef = asString(payload?.previewRef)
        const connection = await getConnection(connectionId, userId)
        const dataUrl = await fetchPreviewDataUrl(
          connection,
          previewRef,
          await getMetadataToken(connectionId, userId),
        )
        spindle.sendToFrontend({
          type: "preview_result",
          requestId,
          name: asString(payload?.name),
          dataUrl,
        }, userId)
        return
      }
      case "download_swarm_output": {
        if (!spindle.permissions.has("cors_proxy")) {
          throw new Error("Grant the CORS Proxy permission to download the original SwarmUI output.")
        }
        const connectionId = asString(payload?.connectionId)
        const connection = await getConnection(connectionId, userId)
        spindle.sendToFrontend({
          type: "swarm_output_download",
          requestId,
          data: await fetchSwarmOutput(
            connection,
            asString(payload?.swarmPath),
            await getMetadataToken(connectionId, userId),
          ),
        }, userId)
        return
      }
      case "resolve_output_metadata": {
        const imageId = asString(payload?.imageId).trim()
        const record = (await loadGenerationRecords(userId)).find((candidate) => candidate.imageId === imageId)
        if (!record?.swarmPathVerified || !record.swarmPath) {
          throw new Error("This output has no verified SwarmUI path metadata.")
        }
        const connectionId = asString(payload?.connectionId)
        const connection = await getConnection(connectionId, userId)
        const exact = await loadSwarmPathGenerationMetadata(
          connection,
          await getMetadataToken(connectionId, userId),
          record.swarmPath,
          userId,
        )
        spindle.sendToFrontend({
          type: "output_metadata_result",
          requestId,
          data: {
            imageId,
            details: {
              ...record,
              ...exact,
              parameters: { ...record.parameters, ...asRecord(exact.parameters) },
              timing: { ...record.timing, ...asRecord(exact.timing) },
              resolvedPrompt: asString(exact.resolvedPrompt) || record.resolvedPrompt,
              resolvedNegativePrompt: asString(exact.resolvedNegativePrompt) || record.resolvedNegativePrompt,
            },
          },
        }, userId)
        return
      }
      case "load_swarm_workflow": {
        if (!spindle.permissions.has("cors_proxy")) {
          throw new Error("Grant the CORS Proxy permission to load saved Swarm workflows.")
        }
        const connectionId = asString(payload?.connectionId)
        const connection = await getConnection(connectionId, userId)
        const token = await getMetadataToken(connectionId, userId)
        spindle.sendToFrontend({
          type: "swarm_workflow_result",
          requestId,
          data: await loadSwarmWorkflow(
            connection,
            token,
            userId,
            asString(payload?.name),
          ),
        }, userId)
        return
      }
      case "save_metadata_token": {
        const connectionId = asString(payload?.connectionId)
        const token = asString(payload?.token).trim()
        if (!token) throw new Error("Enter a Swarm metadata token first.")
        await getConnection(connectionId, userId)
        await spindle.enclave.put(tokenKey(connectionId), token, userId)
        sessions.clear()
        previewCache.clear()
        spindle.sendToFrontend({
          type: "token_saved",
          requestId,
          data: await loadConnection(connectionId, userId),
        }, userId)
        return
      }
      case "clear_metadata_token": {
        const connectionId = asString(payload?.connectionId)
        await spindle.enclave.delete(tokenKey(connectionId), userId)
        sessions.clear()
        previewCache.clear()
        spindle.sendToFrontend({
          type: "token_cleared",
          requestId,
          data: await loadConnection(connectionId, userId),
        }, userId)
        return
      }
      case "generate": {
        if (!spindle.permissions.has("image_gen")) {
          throw new Error("Grant the Image Generation permission to generate.")
        }
        const input = asRecord(payload?.input)
        await saveStudioGenerationProfile(
          Object.keys(asRecord(payload?.profileInput)).length ? payload.profileInput : input,
          payload?.recordHints,
          userId,
        )
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        const connection = await getConnection(asString(input.connection_id), userId)
        const token = spindle.permissions.has("cors_proxy")
          ? await getMetadataToken(connection.id, userId)
          : null
        const clientJobId = asString(input.clientJobId).trim() || crypto.randomUUID()
        const controllerKey = generationKey(userId, clientJobId)
        const controller = new AbortController()
        const controllerEntry = {
          controller,
          nativeStream: typeof spindle.imageGen?.generateStream === "function",
        }
        generationControllers.set(controllerKey, controllerEntry)
        spindle.sendToFrontend({
          type: "generation_started",
          clientJobId,
          data: {
            connectionId: connection.id,
            model: asString(input.model) || connection.model,
          },
        }, userId)
        const startedAt = Date.now()
        let result: JsonObject
        try {
          result = await generateWithProgress({
            ...input,
            clientJobId,
            owner_chat_id: activeChat?.id || undefined,
            owner_character_id: activeChat?.character_id || undefined,
            userId,
          }, controller, clientJobId, userId)
        } catch (error) {
          if (isAbortError(error) || controller.signal.aborted) {
            spindle.sendToFrontend({
              type: "generation_interrupted",
              requestId,
              clientJobId,
            }, userId)
            return
          }
          throw error
        } finally {
          if (generationControllers.get(controllerKey)?.controller === controller) {
            generationControllers.delete(controllerKey)
          }
        }
        const totalMs = Date.now() - startedAt
        const timing = await loadLatestSwarmGenerationMetadata(
          connection,
          token,
          input,
          totalMs,
          userId,
        )
        let record: GenerationRecord | null = null
        try {
          record = await saveGenerationRecord(
            result,
            input,
            asRecord(payload?.recordHints),
            timing,
            userId,
          )
        } catch (error) {
          spindle.log.warn(`Could not persist Swarm Studio generation details: ${error instanceof Error ? error.message : String(error)}`)
        }
        if (record?.imageId && activeChat?.character_id) {
          const characterId = asString(activeChat.character_id)
          const visualFolder = (await loadOutputFolders(userId)).find((folder) =>
            folder.binding?.characterId === characterId && folder.binding.enabled,
          )
          if (visualFolder) await moveOutputToFolder(record.imageId, visualFolder.id, userId)
        }
        const outputPage = await listOutputs(userId, activeChat)
        spindle.sendToFrontend({
          type: "generation_result",
          requestId,
          clientJobId,
          data: {
            result,
            record,
            outputFolders: await loadOutputFolders(userId),
            ...outputPage,
          },
        }, userId)
        const latestUrl = record?.imageUrl || asString(result.imageUrl)
        if (latestUrl) spindle.updateMacroValue("last_genned", latestUrl)
        // Completion notifications are intentionally opt-in. Older clients that
        // omit the flag must stay quiet instead of inheriting the former default.
        if (payload?.showCompletionToast === true && typeof spindle.toast?.success === "function") {
          spindle.toast.success(`Swarm Studio finished ${record?.model || asString(result.model) || "your image"}.`)
        }
        return
      }
      case "interrupt_generation": {
        const clientJobId = asString(payload?.clientJobId).trim()
        if (!clientJobId) throw new Error("No active generation was supplied.")
        const controllerEntry = generationControllers.get(generationKey(userId, clientJobId))
        controllerEntry?.controller.abort("Interrupted from Swarm Studio")
        const connectionId = asString(payload?.connectionId)
        if (connectionId && !controllerEntry?.nativeStream) {
          const connection = await getConnection(connectionId, userId)
          const token = spindle.permissions.has("cors_proxy")
            ? await getMetadataToken(connection.id, userId)
            : null
          await interruptSwarmGeneration(connection, token, userId)
        }
        spindle.sendToFrontend({
          type: "generation_interrupt_requested",
          requestId,
          clientJobId,
          data: { interrupted: Boolean(controllerEntry) },
        }, userId)
        return
      }
      case "add_swarm_preset": {
        const connectionId = asString(payload?.connectionId)
        const title = asString(payload?.title).trim().slice(0, 100)
        if (!title) throw new Error("Give the Swarm preset a name.")
        const connection = await getConnection(connectionId, userId)
        const token = await getMetadataToken(connectionId, userId)
        const options = await loadSwarmOptions(connection, token, userId)
        if (!options.canManagePresets) {
          throw new Error("Your SwarmUI account does not have permission to manage presets.")
        }
        const allowed = new Set(options.parameters.map((parameter) => parameter.id.toLowerCase()))
        const requestedMap = asRecord(payload?.paramMap)
        const paramMap: Record<string, string> = {}
        for (const [key, value] of Object.entries(requestedMap)) {
          if (!allowed.has(key.toLowerCase())) continue
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            paramMap[key] = String(value)
          }
        }
        if (!Object.keys(paramMap).length) {
          throw new Error("SwarmUI's schema did not expose any saveable parameters.")
        }
        const sessionId = await getSession(connection, token, userId)
        const response = await corsJson(
          `${normalizeBaseUrl(connection.api_url)}/API/AddNewPreset`,
          {
            session_id: sessionId,
            title,
            description: asString(payload?.description).trim().slice(0, 500),
            param_map: paramMap,
            is_edit: false,
            is_starred: false,
          },
          token,
          "preset creation request",
        )
        const presetFailure = asString(response.preset_fail).trim()
        if (presetFailure) throw new Error(presetFailure)
        spindle.sendToFrontend({
          type: "swarm_preset_added",
          requestId,
          data: {
            title,
            swarmOptions: await loadSwarmOptions(connection, token, userId),
          },
        }, userId)
        return
      }
      case "delete_swarm_preset": {
        const connectionId = asString(payload?.connectionId)
        const title = asString(payload?.title).trim().slice(0, 100)
        if (!title) throw new Error("Choose a Swarm preset to delete.")
        const connection = await getConnection(connectionId, userId)
        const token = await getMetadataToken(connectionId, userId)
        const options = await loadSwarmOptions(connection, token, userId)
        if (!options.canManagePresets) {
          throw new Error("Your SwarmUI account does not have permission to manage presets.")
        }
        if (!options.presets.some((preset) => preset.title === title)) {
          throw new Error(`Swarm preset “${title}” no longer exists.`)
        }
        const sessionId = await getSession(connection, token, userId)
        const response = await corsJson(
          `${normalizeBaseUrl(connection.api_url)}/API/DeletePreset`,
          { session_id: sessionId, preset: title },
          token,
          "preset deletion request",
        )
        if (!asBoolean(response.success, false)) {
          throw new Error(`SwarmUI could not delete preset “${title}”.`)
        }
        spindle.sendToFrontend({
          type: "swarm_preset_deleted",
          requestId,
          data: {
            title,
            swarmOptions: await loadSwarmOptions(connection, token, userId),
          },
        }, userId)
        return
      }
      case "save_stack_preset": {
        spindle.sendToFrontend({
          type: "stack_presets_result",
          requestId,
          data: await saveStackPreset(payload?.preset, userId),
        }, userId)
        return
      }
      case "delete_stack_preset": {
        spindle.sendToFrontend({
          type: "stack_presets_result",
          requestId,
          data: await deleteStackPreset(asString(payload?.presetId), userId),
        }, userId)
        return
      }
      case "refresh_outputs": {
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        spindle.sendToFrontend({
          type: "outputs_result",
          requestId,
          data: await listOutputs(
            userId,
            activeChat,
            Number(payload?.offset) || 0,
            Number(payload?.limit) || HISTORY_PAGE_SIZE,
          ),
        }, userId)
        return
      }
      case "list_library_outputs": {
        spindle.sendToFrontend({
          type: "library_outputs_result",
          requestId,
          data: await listLibraryOutputs(userId),
        }, userId)
        return
      }
      case "append_output_to_chat": {
        if (!spindle.permissions.has("chat_mutation")) {
          throw new Error("Grant the Chat Mutation permission to append outputs to chat.")
        }
        if (!spindle.permissions.has("images") || !spindle.permissions.has("chats")) {
          throw new Error("Images and Chats permissions are required to append an output.")
        }
        const imageId = asString(payload?.imageId).trim()
        if (!imageId) throw new Error("Choose a saved Lumiverse output first.")
        const activeChat = await spindle.chats.getActive(userId)
        if (!activeChat?.id) throw new Error("Open a Lumiverse chat before appending an output.")
        const image = await spindle.images.get(imageId, {
          onlyOwned: true,
          specificity: "sm",
          userId,
        })
        if (!image) throw new Error("That Lumiverse-owned output could not be found.")
        const imageUrl = asString(image.url).trim()
        if (!imageUrl) throw new Error("Lumiverse did not expose a usable URL for that output.")
        const label = asString(payload?.label).trim()
          || asString(image.original_filename).trim()
          || "Swarm Studio output"
        const result = await spindle.chat.appendMessage(activeChat.id, {
          role: "assistant",
          content: markdownImageMessage(label, imageUrl),
          metadata: {
            source: "swarm_studio",
            image_id: imageId,
          },
        })
        spindle.sendToFrontend({
          type: "output_appended_to_chat",
          requestId,
          data: { imageId, label, messageId: result?.id || "" },
        }, userId)
        return
      }
      case "create_output_folder": {
        const folders = await createOutputFolder(
          asString(payload?.name),
          asString(payload?.bindingType),
          userId,
        )
        spindle.sendToFrontend({
          type: "output_folders_result",
          requestId,
          data: folders,
        }, userId)
        return
      }
      case "update_output_folder_profile": {
        const folders = await updateOutputFolderProfile(
          asString(payload?.folderId),
          payload?.profile,
          userId,
        )
        spindle.sendToFrontend({
          type: "output_folders_result",
          requestId,
          data: folders,
        }, userId)
        return
      }
      case "delete_output_folder": {
        const folders = await deleteOutputFolder(asString(payload?.folderId), userId)
        spindle.sendToFrontend({
          type: "output_folders_result",
          requestId,
          data: folders,
        }, userId)
        return
      }
      case "move_output_to_folder": {
        const folders = await moveOutputToFolder(
          asString(payload?.imageId),
          asString(payload?.folderId),
          userId,
        )
        spindle.sendToFrontend({
          type: "output_folders_result",
          requestId,
          data: folders,
        }, userId)
        return
      }
      case "bulk_move_outputs": {
        const folders = await moveOutputsToFolder(
          stringList(payload?.imageIds, 200),
          asString(payload?.folderId),
          userId,
        )
        spindle.sendToFrontend({
          type: "output_folders_result",
          requestId,
          data: folders,
        }, userId)
        return
      }
      case "set_output_favorite":
      case "bulk_set_output_favorite": {
        const imageIds = type === "set_output_favorite"
          ? [asString(payload?.imageId)]
          : stringList(payload?.imageIds, 200)
        const favorite = payload?.favorite !== false
        spindle.sendToFrontend({
          type: "output_favorites_result",
          requestId,
          data: {
            imageIds,
            favorite,
            folders: await setOutputsFavorite(imageIds, favorite, userId),
          },
        }, userId)
        return
      }
      case "delete_output": {
        if (!spindle.permissions.has("images")) {
          throw new Error("Grant the Images permission to delete Lumiverse outputs.")
        }
        const imageId = asString(payload?.imageId)
        if (!imageId) throw new Error("Choose an output to delete.")
        const deleted = await spindle.images.delete(imageId, userId)
        if (!deleted) throw new Error("Lumiverse could not delete that output.")
        await deleteGenerationRecord(imageId, userId)
        await moveOutputToFolder(imageId, "", userId)
        const folders = await setOutputsFavorite([imageId], false, userId)
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        spindle.sendToFrontend({
          type: "output_deleted",
          requestId,
          data: {
            imageId,
            folders,
            ...(await listOutputs(userId, activeChat)),
          },
        }, userId)
        return
      }
      case "bulk_delete_outputs": {
        if (!spindle.permissions.has("images")) {
          throw new Error("Grant the Images permission to delete Lumiverse outputs.")
        }
        const imageIds = stringList(payload?.imageIds, 200)
        if (!imageIds.length) throw new Error("Select at least one output to delete.")
        const deletedIds: string[] = []
        const failedIds: string[] = []
        for (const imageId of imageIds) {
          try {
            if (await spindle.images.delete(imageId, userId)) deletedIds.push(imageId)
            else failedIds.push(imageId)
          } catch (error) {
            reportBackendError("Could not delete a selected Lumiverse output", error, { imageId })
            failedIds.push(imageId)
          }
        }
        if (deletedIds.length) await deleteGenerationRecords(deletedIds, userId)
        let folders = await loadOutputFolders(userId)
        if (deletedIds.length) {
          await moveOutputsToFolder(deletedIds, "", userId)
          folders = await setOutputsFavorite(deletedIds, false, userId)
        }
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        spindle.sendToFrontend({
          type: "outputs_bulk_deleted",
          requestId,
          data: {
            deletedIds,
            failedIds,
            folders,
            ...(await listOutputs(userId, activeChat)),
          },
        }, userId)
        return
      }
      default:
        throw new Error(`Unknown Swarm Studio request: ${type || "(missing type)"}`)
    }
  } catch (error) {
    reportBackendError(`Backend request “${type || "(missing type)"}” failed`, error, {
      requestId,
      clientJobId: asString(payload?.clientJobId) || asString(asRecord(payload?.input).clientJobId),
    })
    spindle.sendToFrontend({
      type: "studio_error",
      requestId,
      operation: type,
      name: asString(payload?.name),
      clientJobId: asString(payload?.clientJobId) || asString(asRecord(payload?.input).clientJobId),
      error: error instanceof Error ? error.message : String(error),
    }, userId)
  }
}

spindle.onFrontendMessage(handleMessage)
for (const macro of [
  {
    name: "last_genned",
    description: "URL of the most recent image generated by Swarm Studio. Useful in HTML artifacts and presets.",
  },
  {
    name: "swarm_image_protocol",
    description: "Opt-in instruction block teaching the model how to request in-message Swarm Studio illustrations.",
  },
  {
    name: "swarm_negative",
    description: "The literal negative prompt from the current Swarm Studio generation profile.",
  },
  {
    name: "swarm_preset",
    description: "The current Studio preset stack rendered as native SwarmUI <preset:name> tokens.",
  },
  {
    name: "swarm_loras",
    description: "The enabled Studio LoRA stack rendered as native SwarmUI <lora:filename:weight> tokens.",
  },
  {
    name: "swarm_checkpoint",
    description: "The checkpoint selected in the current Swarm Studio generation profile.",
  },
  {
    name: "swarm_aspect",
    description: "The closest named aspect ratio in the current Swarm Studio generation profile.",
  },
  {
    name: "char_base",
    description: "Effective base image tags from the active character's Swarm Studio visual folder.",
  },
  {
    name: "persona_base",
    description: "Effective base image tags from the visual profile bound to the active Lumiverse persona.",
  },
  {
    name: "char_profile",
    description: "Lumiverse image URL for the active chat character's profile picture.",
  },
  {
    name: "user_profile",
    description: "Lumiverse image URL for the active persona's profile picture.",
  },
]) {
  spindle.registerMacro({
    name: macro.name,
    category: "extension:swarm_studio",
    description: macro.description,
    returnType: "string",
    handler: "",
  })
  spindle.updateMacroValue(macro.name, macro.name === "swarm_image_protocol" ? buildInjectedSwarmProtocol(null) : "")
}

spindle.registerInterceptor(taggedImagePromptInterceptor, 90)

if (spindle.permissions.has("generation")) {
  spindle.on("GENERATION_ENDED", (payload: any, userId?: string) => {
    void completeParserImageRequests(payload, userId)
  })
}

for (const eventName of ["CHAT_SWITCHED", "PERSONA_CHANGED", "CHARACTER_AVATAR_CHANGED"]) {
  spindle.on(eventName, async (_payload: any, userId?: string) => {
    try {
      await refreshContextMacros(userId)
    } catch (error) {
      spindle.log.warn(`Could not refresh Swarm Studio context macros: ${error instanceof Error ? error.message : String(error)}`)
    }
  })
}
spindle.log.info("Swarm Studio backend loaded")
