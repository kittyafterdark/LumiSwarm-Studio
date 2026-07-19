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

interface GenerationRecord {
  imageId: string
  imageUrl: string
  prompt: string
  negativePrompt: string
  model: string
  parameters: JsonObject
  loras: Array<{ name: string; weight: number }>
  createdAt: number
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
const STACK_PRESET_LIMIT = 40
const GENERATION_RECORD_LIMIT = 100
const sessions = new Map<string, SessionCacheEntry>()
const previewCache = new Map<string, string>()

function asRecord(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {}
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asNullableNumber(value: unknown): number | null {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback
}

function normalizeBaseUrl(value: string): string {
  const trimmed = String(value || "").trim().replace(/\/+$/, "")
  if (!trimmed) throw new Error("This SwarmUI connection has no API URL.")

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

async function loadStackPresets(userId?: string): Promise<StackPreset[]> {
  const value = await spindle.userStorage.getJson(STACK_PRESETS_FILE, {
    fallback: [],
    userId,
  })
  return Array.isArray(value) ? value.slice(0, STACK_PRESET_LIMIT) : []
}

function cleanStackPreset(value: unknown, existingId = ""): StackPreset {
  const input = asRecord(value)
  const name = asString(input.name).trim().slice(0, 80)
  if (!name) throw new Error("Give this LoRA stack a name.")
  const rawItems = Array.isArray(input.items) ? input.items : []
  if (!rawItems.length) throw new Error("Add at least one LoRA before saving a stack.")
  const items = rawItems.slice(0, 64).map((raw): StackPresetItem => {
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
    }
  })
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

async function loadGenerationRecords(userId?: string): Promise<GenerationRecord[]> {
  const value = await spindle.userStorage.getJson(GENERATION_RECORDS_FILE, {
    fallback: [],
    userId,
  })
  return Array.isArray(value) ? value.slice(0, GENERATION_RECORD_LIMIT) : []
}

async function saveGenerationRecord(
  result: any,
  input: JsonObject,
  userId?: string,
): Promise<GenerationRecord> {
  const parameters = asRecord(input.parameters)
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
    model: asString(input.model) || asString(result?.model),
    parameters,
    loras: loraNames.map((name, index) => ({
      name,
      weight: Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1,
    })),
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

function permissionSnapshot(): Record<string, boolean> {
  return {
    imageGen: spindle.permissions.has("image_gen"),
    metadata: spindle.permissions.has("cors_proxy"),
    images: spindle.permissions.has("images"),
    chats: spindle.permissions.has("chats"),
  }
}

async function listOutputs(userId?: string, activeChat?: any): Promise<any[]> {
  if (!spindle.permissions.has("images")) return []
  const options: Record<string, unknown> = {
    onlyOwned: true,
    specificity: "sm",
    limit: 32,
    userId,
  }
  if (activeChat?.id) options.chatId = activeChat.id
  const response = await spindle.images.list(options)
  const outputs = Array.isArray(response?.data) ? response.data : []
  const records = await loadGenerationRecords(userId)
  const byId = new Map(records.filter((record) => record.imageId).map((record) => [record.imageId, record]))
  return outputs.map((output: any) => ({
    ...output,
    studioMetadata: byId.get(asString(output?.id)) || null,
  }))
}

async function bootstrap(userId?: string): Promise<JsonObject> {
  const permissions = permissionSnapshot()
  const allConnections = permissions.imageGen
    ? await spindle.imageGen.listConnections(userId)
    : []
  const connections = (Array.isArray(allConnections) ? allConnections : [])
    .filter((connection: any) => connection?.provider === "swarmui")

  const activeChat = permissions.chats
    ? await spindle.chats.getActive(userId)
    : null

  return {
    permissions,
    connections,
    activeChat,
    outputs: await listOutputs(userId, activeChat),
    stackPresets: await loadStackPresets(userId),
  }
}

async function loadConnection(connectionId: string, userId?: string): Promise<JsonObject> {
  const connection = await getConnection(connectionId, userId)
  const models = await spindle.imageGen.getModels(connectionId, userId)
  const hasMetadataToken = await spindle.enclave.has(tokenKey(connectionId), userId)

  let loras: LoraMetadata[] = []
  let checkpoints: CheckpointMetadata[] = []
  const metadataErrors: string[] = []
  if (spindle.permissions.has("cors_proxy")) {
    const token = await getMetadataToken(connectionId, userId)
    try {
      loras = await listLoras(connection, token, userId)
    } catch (error) {
      metadataErrors.push(error instanceof Error ? error.message : String(error))
    }
    try {
      checkpoints = await listCheckpoints(connection, token, userId)
    } catch (error) {
      metadataErrors.push(error instanceof Error ? error.message : String(error))
    }
  } else {
    metadataErrors.push("Grant the CORS Proxy permission to load SwarmUI model metadata and previews.")
  }

  return {
    connection,
    models: Array.isArray(models) ? models : [],
    loras,
    checkpoints,
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
        spindle.sendToFrontend({
          type: "metadata_result",
          requestId,
          data: {
            loras,
            checkpoints,
            metadataError: "",
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
        const activeChat = spindle.permissions.has("chats")
          ? await spindle.chats.getActive(userId)
          : null
        const result = await spindle.imageGen.generate({
          ...input,
          owner_chat_id: activeChat?.id || undefined,
          owner_character_id: activeChat?.character_id || undefined,
          userId,
        })
        let record: GenerationRecord | null = null
        try {
          record = await saveGenerationRecord(result, input, userId)
        } catch (error) {
          spindle.log.warn(`Could not persist Swarm Studio generation details: ${error instanceof Error ? error.message : String(error)}`)
        }
        spindle.sendToFrontend({
          type: "generation_result",
          requestId,
          data: {
            result,
            record,
            outputs: await listOutputs(userId, activeChat),
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
          data: await listOutputs(userId, activeChat),
        }, userId)
        return
      }
      default:
        throw new Error(`Unknown Swarm Studio request: ${type || "(missing type)"}`)
    }
  } catch (error) {
    spindle.sendToFrontend({
      type: "studio_error",
      requestId,
      operation: type,
      name: asString(payload?.name),
      error: error instanceof Error ? error.message : String(error),
    }, userId)
  }
}

spindle.onFrontendMessage(handleMessage)
spindle.log.info("Swarm Studio backend loaded")
