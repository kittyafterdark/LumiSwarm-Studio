import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(new URL("../src/backend.ts", import.meta.url), "utf8")
const manifest = JSON.parse(await readFile(new URL("../spindle.json", import.meta.url), "utf8"))
assert.ok(manifest.permissions.includes("world_books"), "Lore requires the declared world_books permission")
assert.match(source, /case "start_lora_download"/)
assert.match(source, /case "get_lora_download_status"/)
assert.match(source, /case "cancel_lora_download"/)
assert.match(source, /DoModelDownloadWS/)
assert.match(source, /new WebSocket\(wsUrl\)/)
assert.match(source, /Only Civitai and Hugging Face LoRA downloads/)
assert.match(source, /function reportBackendError/)
assert.match(source, /spindle\.log\.error/)
assert.match(source, /reportBackendError\(`Backend request/)
assert.match(source, /case "list_parser_models"/)
assert.match(source, /case "set_output_favorite"/)
assert.match(source, /case "bulk_set_output_favorite"/)
assert.match(source, /const activatedEntryIds = new Set<string>\(\)/)
assert.match(source, /activated: activatedEntryIds\.has\(asString\(entry\?\.id\)\)/)
assert.match(source, /async function resolveVisualReferenceImage/)
assert.match(source, /parameters\.referenceImages = \[reference\]/)
assert.match(source, /parameters\.denoise = \.6/)
assert.match(source, /function normalizedTaggedPrompt\(/)
assert.match(source, /taggedAdmissionKey/ )

let frontendHandler
const sent = []
const secrets = new Map()
const userFiles = new Map()
const permissions = new Set(["image_gen", "cors_proxy", "images", "chats", "characters", "personas", "chat_mutation", "interceptor", "generation"])
let imageDeleted = false
let presetAdded = false
let presetDeleted = false
let interruptRequested = false
let appendedMessage = null
const macroDefinitions = new Map()
const macroValues = new Map()
const eventHandlers = new Map()
let interceptorHandler = null
let castRenderProcessor = null
let visualMacroHandler = null
let completionToast = ""
let downloadedSwarmUrl = ""
const relayedLoraRequests = []
let holdLoraDownload = false
let taggedGenerationCount = 0
let latestStudioMetadata = {}
const taggedGenerationInputs = []
const legacyGenerationInputs = []
const quietParserCalls = []
const taggedMessage = {
  id: "message-tag-1",
  role: "assistant",
  content: `<article><swarm-image
    request="generate"
    slot="post"
    aspect="4:5"
    alt="Street food"
  >{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image></article>`,
  metadata: {},
}
const taggedMessages = [taggedMessage]
let hiddenTaggedMessageId = ""
let taggedMessageReadMisses = 0
const activePersona = {
  id: "persona-1",
  name: "User",
  description: "1girl, short silver hair, blue eyes, black hoodie",
  image_id: "user-avatar",
  metadata: {},
}
const visualLoreEntry = {
  id: "lore-entry-1",
  world_book_id: "world-book-1",
  comment: "Victoria Manor",
  folder: "Architecture",
  tags: ["location", "historic"],
  key: ["Victoria Manor", "the manor"],
  extensions: {},
}

class MockSwarmDownloadSocket extends EventTarget {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSED = 3

  constructor(url) {
    super()
    assert.equal(url, "ws://localhost:7801/API/DoModelDownloadWS")
    this.readyState = MockSwarmDownloadSocket.CONNECTING
    queueMicrotask(() => {
      if (this.readyState !== MockSwarmDownloadSocket.CONNECTING) return
      this.readyState = MockSwarmDownloadSocket.OPEN
      this.dispatchEvent(new Event("open"))
    })
  }

  send(payload) {
    const message = JSON.parse(String(payload))
    if (message.signal === "cancel") {
      this.close()
      return
    }
    relayedLoraRequests.push(message)
    if (holdLoraDownload) return
    queueMicrotask(() => {
      if (this.readyState !== MockSwarmDownloadSocket.OPEN) return
      this.dispatchEvent(new MessageEvent("message", {
        data: JSON.stringify({ current_percent: 0.5 }),
      }))
      this.dispatchEvent(new MessageEvent("message", {
        data: JSON.stringify({ success: true }),
      }))
    })
  }

  close() {
    if (this.readyState === MockSwarmDownloadSocket.CLOSED) return
    this.readyState = MockSwarmDownloadSocket.CLOSED
    queueMicrotask(() => this.dispatchEvent(new Event("close")))
  }
}

globalThis.WebSocket = MockSwarmDownloadSocket

globalThis.spindle = {
  uuid: { v4: async () => crypto.randomUUID() },
  registerMacroInterceptor(handler) { visualMacroHandler = handler },
  registerMacro(definition) {
    macroDefinitions.set(definition.name, definition)
  },
  updateMacroValue(name, value) {
    macroValues.set(name, value)
  },
  registerInterceptor(handler) {
    interceptorHandler = handler
  },
  registerMessageContentProcessor(handler, priority) {
    assert.equal(priority,80)
    castRenderProcessor = handler
  },
  on(eventName, handler) {
    eventHandlers.set(eventName, handler)
  },
  toast: {
    success(message) {
      completionToast = message
    },
  },
  textEditor: {
    async open(options) {
      assert.equal(options.title, "Swarm Studio · Positive prompt")
      assert.equal(options.value, "ink style, portrait")
      assert.equal(options.placeholder, "Describe the image…")
      assert.equal(options.userId, "user-1")
      return { text: "ink style, portrait, expanded", cancelled: false }
    },
  },
  permissions: {
    has(permission) {
      return permissions.has(permission)
    },
  },
  imageGen: {
    async listConnections() {
      return [
        {
          id: "swarm-1",
          name: "Local Swarm",
          provider: "swarmui",
          api_url: "",
          model: "base.safetensors",
          is_default: true,
          default_parameters: { width: 768 },
        },
        { id: "other", name: "Not Swarm", provider: "openai" },
      ]
    },
    async getConnection(id) {
      if (id !== "swarm-1") return null
      return {
        id,
        name: "Local Swarm",
        provider: "swarmui",
        api_url: "",
        model: "base.safetensors",
        is_default: true,
        default_parameters: { width: 768 },
      }
    },
    async getModels() {
      return [{ id: "base.safetensors", label: "Base" }]
    },
    async generate(input) {
      latestStudioMetadata = JSON.parse(input.parameters.rawRequestOverride).extra_metadata
      legacyGenerationInputs.push(input)
      assert.equal(Object.prototype.hasOwnProperty.call(input, "signal"), false)
      assert.equal(input.owner_chat_id, "chat-1")
      assert.equal(input.owner_character_id, "char-1")
      return {
        imageDataUrl: "data:image/png;base64,TEVHQUNZ",
        imageUrl: "/api/v1/image-gen/results/image-legacy",
        imageId: "image-legacy",
        model: input.model,
        provider: "swarmui",
      }
    },
    async *generateStream(input) {
      latestStudioMetadata = JSON.parse(input.parameters.rawRequestOverride).extra_metadata
      assert.equal(input.owner_chat_id, "chat-1")
      assert.equal(input.owner_character_id, "char-1")
      assert.equal(input.signal instanceof AbortSignal, true)
      let taggedImageId = ""
      if (input.clientJobId === "studio-job-1") {
        assert.deepEqual(input.parameters.loras, ["styles/ink.safetensors"])
        assert.equal(input.parameters.referenceImages[0].mimeType, "image/png")
        assert.equal(input.parameters.denoise, 0.55)
        const rawOverride = JSON.parse(input.parameters.rawRequestOverride)
        assert.equal(rawOverride.comfyuicustomworkflow, "Portrait/Inpaint")
        assert.equal(rawOverride.comfyrawworkflowinputdecimaldenoiseb, 0.42)
        assert.equal(rawOverride.comfyrawworkflowinputimageinitc, "data:image/png;base64,QUJD")
      } else {
        taggedGenerationCount += 1
        taggedGenerationInputs.push(input)
        taggedImageId = `image-tag-${taggedGenerationCount}`
        if (input.prompt.includes("train platform")) {
          assert.match(input.prompt, /^(?:1boy, |\(1boy:1\.5\)\n)black hair, red eyes, <preset:Cinematic>, train platform, waving/)
        } else {
          assert.match(input.prompt, /^1boy, black hair, red eyes, <preset:Cinematic>, outside, city street/)
        }
        assert.match(input.prompt, /<preset:composition>/)
        assert.equal((input.prompt.match(/<preset:Cinematic>/g) || []).length, 1)
        assert.doesNotMatch(input.prompt, /\{\{swarm_preset\}\}/)
        assert.equal(input.negativePrompt, "blurry")
        assert.equal(input.parameters.seed, -1)
        assert.deepEqual(input.parameters.loras, ["styles/ink.safetensors"])
        assert.deepEqual(input.parameters.loraWeights, [0.75])
        assert.equal(input.parameters.referenceImages, undefined)
        assert.equal(input.parameters.denoise, undefined)
        const rawOverride = JSON.parse(input.parameters.rawRequestOverride)
        assert.equal(rawOverride.presets, undefined)
        assert.equal(rawOverride.comfyuicustomworkflow, "Portrait/Inpaint")
      }
      yield {
        step: 4,
        totalSteps: 20,
        preview: "data:image/jpeg;base64,UFJFVklFVw==",
      }
      return {
        imageDataUrl: "data:image/png;base64,QUJD",
        imageUrl: input.clientJobId === "studio-job-1"
          ? "/api/v1/image-gen/results/image-1"
          : `/api/v1/image-gen/results/${taggedImageId}`,
        imageId: input.clientJobId === "studio-job-1" ? "image-1" : taggedImageId,
        model: input.model,
        provider: "swarmui",
      }
    },
  },
  connections: {
    async list() {
      return [{
        id: "text-1",
        name: "Local parser",
        provider: "openai-compatible",
        model: "connection-model",
        is_default: true,
      }]
    },
  },
  generate: {
    async quiet(input, userId) {
      assert.equal(userId, "user-1", "quiet positional scope must match the authenticated caller")
      assert.equal(input.userId, "user-1", "operator-scoped quiet generation requires userId on the request")
      quietParserCalls.push(structuredClone(input))
      return {
        content: `<swarm-image
  request="generate"
  slot="parsed-scene"
  aspect="4:3"
  character="active"
  persona="none"
  alt="Train platform"
>
train⠀platform,⠀waving, <preset:composition></swarm-image>`,
      }
    },
  },
  chats: {
    async getActive() {
      return { id: "chat-1", character_id: "char-1" }
    },
    async get(chatId) {
      assert.equal(chatId, "chat-1")
      return { id: "chat-1", character_id: "char-1" }
    },
  },
  world_books: {
    async list(options, legacyUserId) {
      assert.equal(options.userId, "user-1")
      assert.equal(legacyUserId, undefined, "world_books.list() requires userId inside its options object")
      return { data: [{ id: "world-book-1", name: "Locations", folder: "Worlds" }], total: 1 }
    },
    entries: {
      async list(worldBookId, options, legacyUserId) {
        assert.equal(worldBookId, "world-book-1")
        assert.equal(options.userId, "user-1")
        assert.equal(legacyUserId, undefined, "world_books.entries.list() requires userId inside its options object")
        return { data: [structuredClone(visualLoreEntry)], total: 1 }
      },
      async get(entryId, userId) {
        assert.equal(entryId, "lore-entry-1")
        assert.equal(userId, "user-1")
        return structuredClone(visualLoreEntry)
      },
      async update(entryId, input, userId) {
        assert.equal(entryId, "lore-entry-1")
        assert.equal(userId, "user-1")
        visualLoreEntry.extensions = structuredClone(input.extensions)
        return structuredClone(visualLoreEntry)
      },
    },
    async getActivated(chatId, userId) {
      assert.equal(chatId, "chat-1")
      assert.equal(userId, "user-1")
      return [{ id: "lore-entry-1" }]
    },
  },
  characters: {
    async get(characterId) {
      assert.equal(characterId, "char-1")
      return {
        id: "char-1",
        name: "Lior",
        image_id: "char-avatar",
        extensions: {
          lumiverse_image_gen_lora: {
            version: 1,
            lora_filename: "characters/lior.safetensors",
            weight: 0.8,
            base_tags: "1girl, long brown hair, pink dress",
          },
        },
      }
    },
  },
  personas: {
    async getActive() {
      return structuredClone(activePersona)
    },
    async update(personaId, input, userId) {
      assert.equal(personaId, "persona-1")
      assert.equal(userId, "user-1")
      Object.assign(activePersona, structuredClone(input))
      return structuredClone(activePersona)
    },
  },
  chat: {
    async appendMessage(chatId, message) {
      assert.equal(chatId, "chat-1")
      assert.equal(message.role, "assistant")
      assert.match(message.content, /^!\[image\.png\]\(<\/api\/v1\/images\/image-1\?size=sm>\)$/)
      assert.equal(message.metadata.source, "swarm_studio")
      assert.equal(message.metadata.image_id, "image-1")
      appendedMessage = message
      return { id: "message-image-1" }
    },
    async getMessages(chatId) {
      assert.equal(chatId, "chat-1")
      if (hiddenTaggedMessageId && taggedMessageReadMisses > 0) {
        taggedMessageReadMisses -= 1
        return taggedMessages.filter((message) => message.id !== hiddenTaggedMessageId)
      }
      return taggedMessages
    },
    async updateMessage(chatId, messageId, patch) {
      assert.equal(chatId, "chat-1")
      const target = taggedMessages.find((message) => message.id === messageId)
      assert.ok(target)
      await new Promise((resolve) => setTimeout(resolve, 1))
      if (patch.content !== undefined) target.content = patch.content
      if (patch.swipes !== undefined) { target.swipes = [...patch.swipes]; target.content = target.swipes[target.swipe_id] }
      if (patch.metadata !== undefined) target.metadata = patch.metadata
    },
  },
  images: {
    async list(options) {
      assert.equal(options.onlyOwned, true)
      assert.equal(Number.isInteger(options.offset), true)
      assert.equal(Number.isInteger(options.limit), true)
      if (options.limit !== 200) assert.equal(options.chatId, "chat-1")
      if (imageDeleted) return { data: [], total: 0 }
      return {
        data: [{ id: "image-1", url: "/api/v1/images/image-1?size=sm", original_filename: "image.png" }],
        total: 1,
      }
    },
    async delete(imageId, userId) {
      assert.equal(imageId, "image-1")
      assert.equal(userId, "user-1")
      imageDeleted = true
      return true
    },
    async get(imageId, options) {
      assert.equal(options.specificity, "sm")
      if (imageId === "image-1") {
        assert.equal(options.onlyOwned, true)
        assert.equal(options.userId, "user-1")
        return { id: imageId, url: "/api/v1/images/image-1?size=sm", original_filename: "image.png" }
      }
      if (imageId === "char-avatar") return { id: imageId, url: "/api/v1/images/char-avatar?size=sm" }
      if (imageId === "user-avatar") return { id: imageId, url: "/api/v1/images/user-avatar?size=sm" }
      return null
    },
  },
  enclave: {
    async get(key) {
      return secrets.get(key) || null
    },
    async has(key) {
      return secrets.has(key)
    },
    async put(key, value) {
      secrets.set(key, value)
    },
    async delete(key) {
      return secrets.delete(key)
    },
  },
  userStorage: {
    async getJson(path, options = {}) {
      return userFiles.has(path) ? structuredClone(userFiles.get(path)) : structuredClone(options.fallback)
    },
    async setJson(path, value) {
      userFiles.set(path, structuredClone(value))
    },
  },
  async cors(url, options) {
    const target = new URL(url)
    if (target.hostname === "image.civitai.com") {
      assert.equal(options.responseType, "arraybuffer")
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "image/jpeg" },
        encoding: "base64",
        body: "VEhVTUJOQUlM",
      }
    }
    if (target.origin === "https://civitai.com" && target.pathname === "/api/v1/model-versions/12345") {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: 12345,
          modelId: 678,
          name: "v1.0",
          createdAt: "2026-07-22T00:00:00Z",
          baseModel: "Illustrious",
          trainedWords: ["ink style", "dramatic linework"],
          files: [{ name: "new-ink.safetensors", downloadUrl: "https://civitai.com/api/download/models/12345" }],
          images: [{ type: "image", url: "https://image.civitai.com/example.jpg" }],
        }),
      }
    }
    if (target.origin === "https://civitai.com" && target.pathname === "/api/v1/models/678") {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: 678,
          name: "New Ink",
          description: "Full model description",
          creator: { username: "Artist" },
          tags: ["style", "ink"],
          modelVersions: [{
            id: 12345,
            name: "v1.0",
            description: "Version description",
            createdAt: "2026-07-22T00:00:00Z",
            baseModel: "Illustrious",
            trainedWords: ["ink style", "dramatic linework"],
            files: [{ name: "new-ink.safetensors", downloadUrl: "https://civitai.com/api/download/models/12345" }],
            images: [{ type: "image", url: "https://image.civitai.com/example.jpg" }],
          }],
        }),
      }
    }
    assert.equal(target.origin, "http://localhost:7801")
    if (url.endsWith("/API/GetNewSession")) {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ session_id: "session-1" }),
      }
    }
    if (url.endsWith("/API/ListModels")) {
      const body = JSON.parse(options.body)
      assert.equal(body.dataImages, false)
      if (body.subtype === "Stable-Diffusion") {
        return {
          status: 200,
          statusText: "OK",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            files: [{
              name: "base.safetensors",
              title: "Base",
              architecture: "stable-diffusion-xl-v1/base",
              compat_class: "stable-diffusion-xl-v1",
              class: "checkpoint",
            }],
          }),
        }
      }
      assert.equal(body.subtype, "LoRA")
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          folders: ["styles"],
          files: [
            {
              name: "styles/ink.safetensors",
              title: "Ink Style",
              author: "Artist",
              preview_image: "/ViewSpecial/LoRA/styles/ink.safetensors",
              trigger_phrase: "ink style",
              lora_default_weight: 0.75,
              tags: ["style", "ink"],
              compat_class: "SDXL",
              local: true,
            },
          ],
        }),
      }
    }
    if (url.endsWith("/API/ListT2IParams")) {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          list: [
            { id: "prompt", name: "Prompt", type: "text" },
            { id: "negativeprompt", name: "Negative Prompt", type: "text" },
            { id: "model", name: "Model", type: "model" },
            { id: "width", name: "Width", type: "integer" },
            { id: "height", name: "Height", type: "integer" },
            { id: "steps", name: "Steps", type: "integer" },
            { id: "cfgscale", name: "CFG Scale", type: "decimal" },
            { id: "seed", name: "Seed", type: "integer" },
            { id: "sampler", name: "Sampler", type: "dropdown", values: ["euler", "dpmpp_2m_sde_gpu"] },
            { id: "scheduler", name: "Scheduler", type: "dropdown", values: ["normal", "beta57"] },
            { id: "refinerupscalemethod", name: "Refiner Upscale Method", type: "dropdown", values: ["pixel-lanczos", "model-4x-UltraSharp.pth///Model: 4x-UltraSharp.pth", "model-RealESRGAN_x4plus_anime_6B.pth///Model: Anime"] },
          ],
        }),
      }
    }
    if (url.endsWith("/API/ComfyListWorkflows")) {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workflows: [{
            name: "Portrait/Inpaint",
            image: "/imgs/model_placeholder.jpg",
            description: "A saved workflow with an exposed denoise control.",
            enable_in_simple: true,
          }],
        }),
      }
    }
    if (url.endsWith("/API/ComfyReadWorkflow")) {
      const body = JSON.parse(options.body)
      assert.equal(body.name, "Portrait/Inpaint")
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          result: {
            image: "/imgs/model_placeholder.jpg",
            description: "A saved workflow with an exposed denoise control.",
            enable_in_simple: true,
            custom_params: JSON.stringify({
              prompt: { id: "prompt", name: "Prompt", type: "text", visible: true, default: "portrait" },
              comfyrawworkflowinputdecimaldenoiseb: {
                id: "comfyrawworkflowinputdecimaldenoiseb",
                name: "Denoise",
                type: "decimal",
                description: "Workflow denoise strength",
                default: 0.55,
                min: 0,
                max: 1,
                step: 0.05,
                visible: true,
                toggleable: true,
                group: { id: "refine", name: "Refine", open: true, advanced: false, can_shrink: true, toggles: false },
              },
              comfyrawworkflowinputimageinputc: {
                id: "comfyrawworkflowinputimageinputc", name: "Source image", type: "image", image_always_b64: true, visible: true,
              },
            }),
          },
        }),
      }
    }
    if (url.endsWith("/API/GetMyUserData")) {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          permissions: ["manage_presets"],
          presets: [
            {
              title: "Cinematic",
              description: "Film look",
              param_map: {
                prompt: "cinematic lighting, ink style, portrait",
                negativeprompt: "blurry, flat lighting",
              },
            },
            ...(presetAdded && !presetDeleted ? [{
              title: "Studio Current",
              description: "Saved by contract",
              param_map: { prompt: "ink style, portrait" },
            }] : []),
          ],
        }),
      }
    }
    if (url.endsWith("/API/AddNewPreset")) {
      const body = JSON.parse(options.body)
      assert.equal(body.title, "Studio Current")
      assert.equal(body.param_map.prompt, "ink style, portrait")
      assert.equal("unknown" in body.param_map, false)
      presetAdded = true
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ success: true }),
      }
    }
    if (url.endsWith("/API/DeletePreset")) {
      const body = JSON.parse(options.body)
      assert.equal(body.session_id, "session-1")
      assert.equal(body.preset, "Studio Current")
      presetDeleted = true
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ success: true }),
      }
    }
    if (url.endsWith("/API/InterruptAll")) {
      const body = JSON.parse(options.body)
      assert.equal(body.session_id, "session-1")
      assert.equal(body.other_sessions, true)
      interruptRequested = true
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ success: true }),
      }
    }
    if (url.endsWith("/API/ListImages")) {
      const body = JSON.parse(options.body)
      assert.equal(body.sortBy, "Date")
      assert.equal(body.sortReverse, false)
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          files: [{
            src: "2026-07-19/image-1.png",
            metadata: JSON.stringify({
              sui_image_params: {
                prompt: "cinematic lighting, ink style, portrait",
                negativeprompt: "blurry, flat lighting",
                original_prompt: "ink style, portrait",
                original_negativeprompt: "blurry",
                seed: 987654321,
              },
              sui_extra_data: {
                ...latestStudioMetadata,
                prep_time: "0.22 sec",
                generation_time: "1.78 sec",
                presets_used: ["Cinematic"],
              },
            }),
          }],
        }),
      }
    }
    if (url.includes("/Output/")) {
      downloadedSwarmUrl = url
      assert.equal(options.responseType, "arraybuffer")
      assert.equal(options.mediaType, "image")
      return {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "image/png" },
        body: "QUJD",
        encoding: "base64",
      }
    }
    if (url.includes("/ViewSpecial/")) {
      assert.equal(options.responseType, "arraybuffer")
      assert.equal(options.mediaType, "image")
      return {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "image/png" },
        body: "QUJD",
        encoding: "base64",
      }
    }
    throw new Error(`Unexpected CORS request: ${url}`)
  },
  onFrontendMessage(handler) {
    frontendHandler = handler
  },
  sendToFrontend(payload, userId) {
    sent.push({ payload, userId })
  },
  log: { info() {}, warn() {} },
}

const backendModule = await import("../dist/backend.js")
// Header geometry must be read from the actual byte slice, not the recipe or
// an unrelated prefix of the underlying buffer. Verify real PNG/WebP fixtures.
{
  const read=async name=>new Uint8Array(await readFile(new URL('./fixtures/'+name,import.meta.url)))
  const png=await read('cast-portrait.png'), webp=await read('studio-avatar.webp')
  const {encodedImageDimensions}=backendModule
  assert.deepEqual(encodedImageDimensions(png,'image/png'),{width:255,height:342})
  assert.deepEqual(encodedImageDimensions(webp,'image/webp'),{width:1079,height:809})
  const wrapped=new Uint8Array(png.length+7);wrapped.set(png,7)
  assert.deepEqual(encodedImageDimensions(wrapped.subarray(7),'image/png'),{width:255,height:342})
  // Minimal JPEG marker sequence: SOI, APP0, SOF0, EOI.
  const jpg=Uint8Array.of(255,216,255,224,0,4,0,0,255,192,0,11,8,1,86,0,255,1,1,17,0,255,217)
  assert.deepEqual(encodedImageDimensions(jpg,'image/jpeg'),{width:255,height:342})
  assert.equal(encodedImageDimensions(png.subarray(0,20),'image/png'),null)
  assert.equal(encodedImageDimensions(webp.subarray(0,25),'image/webp'),null)
  assert.equal(encodedImageDimensions(jpg.subarray(0,16),'image/jpeg'),null)
  assert.equal(encodedImageDimensions(png,'image/jpeg'),null)
  const over=png.slice();new DataView(over.buffer).setUint32(16,4097)
  assert.equal(encodedImageDimensions(over,'image/png').width,4097)
}

assert.equal(typeof frontendHandler, "function")
assert.equal(macroDefinitions.get("last_genned").handler, "")
assert.equal(macroDefinitions.has("swarm_image_protocol"), true)
assert.equal(macroDefinitions.has("swarm_negative"), true)
assert.equal(macroDefinitions.has("swarm_loras"), true)
assert.equal(macroDefinitions.has("char_base"), true)
assert.equal(macroDefinitions.has("persona_base"), true)
assert.equal(macroDefinitions.has("char_tags"), false)
assert.equal(macroDefinitions.has("char_profile"), true)
assert.equal(macroDefinitions.has("user_profile"), true)
assert.match(macroValues.get("swarm_image_protocol"), /<swarm-image/)
assert.equal(typeof interceptorHandler, "function")
assert.equal(eventHandlers.has("GENERATION_ENDED"), true)

const collisionPlan = backendModule.parseImageScenePlan(`quality/meta: masterpiece, best quality, safe
visible count: solo, 2 men
scene: Two men eat together at a low restaurant table.
camera: medium two-shot, seated eye level
left man: brown eyes, black shirt, eating rice
right man: blue eyes, gray cable-knit sweater, holding chopsticks
shared interaction: eating together at the same low table
spatial relation: opposite sides of the table
environment: small Japanese restaurant, dishes and rice bowls`)
assert.ok(collisionPlan)
assert.equal(collisionPlan.subjects.length, 2)
const animaCollisionPrompt = backendModule.serializeScenePlan(
  collisionPlan,
  "anima",
  ["1boy, short black hair, brown eyes", "1boy, blond hair, blue eyes"],
)
assert.match(animaCollisionPrompt, /^masterpiece, best quality, safe\n2boys/m)
assert.match(animaCollisionPrompt, /Left: man, short black hair, brown eyes; brown eyes, black shirt, eating rice/)
assert.match(animaCollisionPrompt, /Right: man, blond hair, blue eyes; blue eyes, gray cable-knit sweater, holding chopsticks/)
assert.equal((animaCollisionPrompt.match(/eating together at the same low table/g) || []).length, 1)
assert.doesNotMatch(animaCollisionPrompt, /\bsolo\b|character 1|character 2/)
assert.doesNotMatch(animaCollisionPrompt, /<region:/)
const legacyRegional = backendModule.serializeScenePlan(collisionPlan,"anima-regional",["short black hair","blond hair"])
assert.match(legacyRegional, /<region:0,0,0\.58,1,0\.85> left man:/)
assert.match(legacyRegional, /<region:0\.42,0,0\.58,1,0\.85> right man:/)
assert.match(legacyRegional, /<region:background> small Japanese restaurant/)
const illustriousCollisionPrompt = backendModule.serializeScenePlan(
  collisionPlan,
  "illustrious",
  ["1boy, short black hair, brown eyes", "1boy, blond hair, blue eyes"],
)
assert.notEqual(illustriousCollisionPrompt, animaCollisionPrompt)
assert.match(illustriousCollisionPrompt, /2 men\nmedium two-shot, seated eye level/)
assert.match(illustriousCollisionPrompt, /left man: short black hair, brown eyes, brown eyes, black shirt, eating rice/)
assert.match(illustriousCollisionPrompt, /right man: blond hair, blue eyes, blue eyes, gray cable-knit sweater, holding chopsticks/)
assert.match(illustriousCollisionPrompt, /<region:0,0,0\.58,1,1> left man:/)
assert.match(illustriousCollisionPrompt, /<region:0\.42,0,0\.58,1,1> right man:/)
assert.match(illustriousCollisionPrompt, /<region:background> small Japanese restaurant, dishes and rice bowls/)

const threeSubjectRegions = backendModule.resolveSubjectRegions([
  { anchor: "left woman", details: "" },
  { anchor: "center man", details: "" },
  { anchor: "right woman", details: "" },
], "illustrious")
assert.deepEqual(threeSubjectRegions, [
  { x: 0, y: 0, width: 0.46, height: 1, strength: 1 },
  { x: 0.27, y: 0, width: 0.46, height: 1, strength: 1 },
  { x: 0.54, y: 0, width: 0.46, height: 1, strength: 1 },
])

const povPlan = backendModule.parseImageScenePlan(`quality/meta: masterpiece, safe
visible count: 2 people
scene: POV in a kitchen.
camera: pov, close shot
center woman: smiling, looking at the user, reaching toward the persona
environment: kitchen counter, morning light`)
assert.ok(povPlan)
const povPrompt = backendModule.serializeScenePlan(
  povPlan,
  "anima",
  ["1girl, silver hair, green eyes"],
  true,
)
assert.match(povPrompt, /\n1girl\n/)
assert.match(povPrompt, /looking at viewer, reaching toward viewer/)
assert.doesNotMatch(povPrompt, /2 people|looking at the user|toward the persona/)
assert.doesNotMatch(povPrompt, /<region:/)

async function request(type, extra = {}) {
  const requestId = `${type}-${sent.length}`
  await frontendHandler({ type, requestId, ...extra }, "user-1")
  const response = sent.findLast((entry) => entry.payload.requestId === requestId)
  assert.ok(response, `Missing response for ${type}`)
  assert.notEqual(response.payload.type, "studio_error", response.payload.error)
  return response.payload
}

const bootstrap = await request("bootstrap")
assert.equal(bootstrap.data.connections.length, 1)
assert.equal(bootstrap.data.connections[0].provider, "swarmui")
assert.equal(bootstrap.data.parserConnections.length, 1)
assert.equal(bootstrap.data.parserConnections[0].id, "text-1")
assert.equal(bootstrap.data.outputs.length, 1)
assert.equal(bootstrap.data.total, 1)
assert.equal(bootstrap.data.offset, 0)
assert.equal(bootstrap.data.limit, 12)
assert.deepEqual(bootstrap.data.stackPresets, [])
assert.equal(bootstrap.data.outputFolders.length, 1)
assert.equal(bootstrap.data.outputFolders[0].id, "__swarm_studio_favorites__")
assert.equal(bootstrap.data.tagAutomation.stripUserOnlyLoraStack, false)
assert.equal(bootstrap.data.tagAutomation.historyImageMarkers, "keep")
assert.equal(bootstrap.data.tagAutomation.autoPrintCharacterPositive, false)
assert.equal(bootstrap.data.tagAutomation.requestMode, "inline")
assert.equal(bootstrap.data.tagAutomation.parserConnectionId, "")
assert.equal(bootstrap.data.tagAutomation.parserModel, "")
assert.match(bootstrap.data.tagAutomation.protocolPrompt, /SWARM STUDIO IMAGE REQUEST PROTOCOL/)
assert.match(bootstrap.data.tagAutomation.protocolPrompt, /\{\{swarm_dynamic_guidance\}\}/)
assert.equal(bootstrap.data.characterBaseTags.characterId, "char-1")
assert.equal(bootstrap.data.characterBaseTags.characterName, "Lior")
assert.equal(bootstrap.data.characterBaseTags.source, "lumiverse")
assert.equal(bootstrap.data.characterBaseTags.tags, "1girl, long brown hair, pink dress")

const expandedPrompt = await request("open_text_editor", {
  editorId: "studio-positive",
  title: "Swarm Studio · Positive prompt",
  value: "ink style, portrait",
  placeholder: "Describe the image…",
})
assert.equal(expandedPrompt.data.editorId, "studio-positive")
assert.equal(expandedPrompt.data.text, "ink style, portrait, expanded")
assert.equal(expandedPrompt.data.cancelled, false)

const connection = await request("load_connection", { connectionId: "swarm-1" })
assert.equal(connection.data.loras.length, 1)
assert.equal(connection.data.loras[0].triggerPhrase, "ink style")

const loraDownload = await request("start_lora_download", {
  connectionId: "swarm-1",
  items: [{
    url: "https://civitai.com/api/download/models/12345",
    name: "https://civitai.red/models/2795146",
    title: "New Ink",
  }, {
    url: "https://civitai.com/api/download/models/12345",
    name: "styles/new-ink-variant.safetensors",
    title: "New Ink Variant",
  }],
})
assert.equal(loraDownload.data.status, "preparing")
assert.equal(loraDownload.data.active, true)
assert.equal(loraDownload.data.total, 2)
for (let attempt = 0; attempt < 50 && relayedLoraRequests.length < 2; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 1))
}
assert.equal(relayedLoraRequests.length, 2, "Backend did not relay the full batch to SwarmUI")
assert.equal(relayedLoraRequests[0].session_id, "session-1")
assert.equal(relayedLoraRequests[0].url, "https://civitai.com/api/download/models/12345")
assert.equal(relayedLoraRequests[0].name, "new-ink")
assert.equal(relayedLoraRequests[0].type, "LoRA")
assert.equal(relayedLoraRequests[1].name, "styles/new-ink-variant")
const loraDownloadMetadata = JSON.parse(relayedLoraRequests[0].metadata)
assert.equal(loraDownloadMetadata["modelspec.title"], "New Ink - v1.0")
assert.equal(loraDownloadMetadata["modelspec.author"], "Artist")
assert.equal(loraDownloadMetadata["modelspec.trigger_phrase"], "ink style; dramatic linework")
assert.equal(loraDownloadMetadata["modelspec.tags"], "style, ink")
assert.equal(loraDownloadMetadata["modelspec.usage_hint"], "Illustrious")
assert.equal(loraDownloadMetadata["modelspec.thumbnail"], "data:image/jpeg;base64,VEhVTUJOQUlM")
let loraDownloadStatus
for (let attempt = 0; attempt < 50; attempt += 1) {
  loraDownloadStatus = await request("get_lora_download_status")
  if (loraDownloadStatus.data.status === "complete") break
  await new Promise((resolve) => setTimeout(resolve, 1))
}
assert.equal(loraDownloadStatus.data.status, "complete")
assert.equal(loraDownloadStatus.data.active, false)
assert.equal(loraDownloadStatus.data.overallProgress, 1)
holdLoraDownload = true
const heldLoraDownload = await request("start_lora_download", {
  connectionId: "swarm-1",
  items: [{
    url: "https://huggingface.co/example/repo/resolve/main/held.safetensors",
    name: "styles/held.safetensors",
    title: "Held download",
  }],
})
assert.equal(heldLoraDownload.data.active, true)
for (let attempt = 0; attempt < 50 && relayedLoraRequests.length < 3; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 1))
}
assert.equal(relayedLoraRequests.length, 3)
const cancelledLoraDownload = await request("cancel_lora_download")
assert.equal(cancelledLoraDownload.data.status, "cancelled")
assert.equal(cancelledLoraDownload.data.active, false)
holdLoraDownload = false
assert.equal(connection.data.loras[0].defaultWeight, 0.75)
assert.equal(connection.data.checkpoints[0].compatClass, "stable-diffusion-xl-v1")
assert.deepEqual(connection.data.swarmOptions.samplers, ["euler", "dpmpp_2m_sde_gpu"])
assert.deepEqual(connection.data.swarmOptions.schedulers, ["normal", "beta57"])
assert.equal(connection.data.swarmOptions.presets[0].title, "Cinematic")
assert.equal(connection.data.swarmOptions.presets[0].paramMap.prompt, "cinematic lighting, ink style, portrait")
assert.equal(connection.data.swarmOptions.canManagePresets, true)
assert.equal(connection.data.swarmOptions.parameters.some((parameter) => parameter.id === "prompt"), true)
assert.equal(connection.data.swarmOptions.workflows[0].name, "Portrait/Inpaint")
assert.equal(connection.data.swarmOptions.workflowError, "")

const workflow = await request("load_swarm_workflow", {
  connectionId: "swarm-1",
  name: "Portrait/Inpaint",
})
assert.equal(workflow.data.name, "Portrait/Inpaint")
assert.equal(workflow.data.parameters.length, 3)
assert.equal(workflow.data.parameters[1].group.name, "Refine")
assert.equal(workflow.data.parameters[1].default, 0.55)

const savedStack = await request("save_stack_preset", {
  preset: {
    name: "Ink stack",
    items: [{
      name: "styles/ink.safetensors",
      title: "Ink Style",
      weight: 0.75,
      enabled: true,
      useTrigger: false,
    }],
  },
})
assert.equal(savedStack.data.length, 1)
assert.equal(savedStack.data[0].items[0].useTrigger, false)
assert.equal(savedStack.data[0].items[0].sourceUrl, "")

const preview = await request("preview", {
  connectionId: "swarm-1",
  name: "styles/ink.safetensors",
  previewRef: "/ViewSpecial/LoRA/styles/ink.safetensors",
})
assert.equal(preview.dataUrl, "data:image/png;base64,QUJD")

const generated = await request("generate", {
  showCompletionToast: true,
  input: {
    prompt: "ink style, portrait",
    negativePrompt: "blurry",
    connection_id: "swarm-1",
    model: "base.safetensors",
    clientJobId: "studio-job-1",
    parameters: {
      loras: ["styles/ink.safetensors"],
      loraWeights: [0.75],
      seed: -1,
      referenceImages: [{ data: "QUJD", mimeType: "image/png" }],
      denoise: 0.55,
      rawRequestOverride: JSON.stringify({
        presets: ["Cinematic"],
        comfyuicustomworkflow: "Portrait/Inpaint",
        comfyrawworkflowinputdecimaldenoiseb: 0.42,
        comfyrawworkflowinputimageinitc: "data:image/png;base64,QUJD",
      }),
    },
  },
  recordHints: {
    resolvedPrompt: "cinematic lighting, ink style, portrait",
    resolvedNegativePrompt: "blurry, flat lighting",
    presets: ["Cinematic"],
    workflow: "Portrait/Inpaint",
    initImageId: "image-source",
    initImageLabel: "source.png",
  },
})
assert.equal(generated.data.result.provider, "swarmui")
assert.equal(generated.data.outputs.length, 1)
assert.equal(generated.data.record.prompt, "ink style, portrait")
assert.equal(generated.data.record.resolvedPrompt, "cinematic lighting, ink style, portrait")
assert.equal(generated.data.record.resolvedNegativePrompt, "blurry, flat lighting")
assert.deepEqual(generated.data.record.presets, ["Cinematic"])
assert.equal(generated.data.record.workflow, "Portrait/Inpaint")
assert.equal(generated.data.record.timing.prep, "0.22 sec")
assert.equal(generated.data.record.timing.generation, "1.78 sec")
assert.equal(generated.data.record.timing.source, "swarm")
assert.equal(generated.data.record.swarmPath, "2026-07-19/image-1.png")
assert.equal(generated.data.record.swarmPathVerified, true)
assert.match(source, /const matches = parsed\.filter[\s\S]*?matches\.length !== 1/)
assert.equal(generated.data.record.initImageId, "image-source")
assert.equal(generated.data.record.initImageLabel, "source.png")
assert.equal(generated.data.record.parameters.seed, 987654321)
assert.equal("referenceImages" in generated.data.record.parameters, false)
const storedWorkflowOverride = JSON.parse(generated.data.record.parameters.rawRequestOverride)
assert.equal(storedWorkflowOverride.comfyuicustomworkflow, "Portrait/Inpaint")
assert.equal(storedWorkflowOverride.comfyrawworkflowinputimageinitc, "[workflow image omitted from history]")
assert.equal(generated.data.outputs[0].studioMetadata.imageId, "image-1")
const started = sent.find((entry) => entry.payload.type === "generation_started")
assert.equal(started.payload.clientJobId, "studio-job-1")
assert.equal(started.payload.data.connectionId, "swarm-1")
const progress = sent.find((entry) => entry.payload.type === "generation_progress")
assert.equal(progress.payload.clientJobId, "studio-job-1")
assert.equal(progress.payload.data.step, 4)
assert.equal(progress.payload.data.totalSteps, 20)
assert.equal(progress.payload.data.preview, "data:image/jpeg;base64,UFJFVklFVw==")
assert.equal(macroValues.get("last_genned"), "/api/v1/image-gen/results/image-1")
assert.equal(macroValues.get("swarm_negative"), "blurry")
assert.equal(macroValues.get("swarm_preset"), "<preset:Cinematic>")
assert.equal(macroValues.get("swarm_loras"), "<lora:styles/ink.safetensors:0.75>")
assert.equal(macroValues.get("char_base"), "1girl, long brown hair, pink dress")
assert.equal(macroValues.get("char_profile"), "/api/v1/images/char-avatar?size=sm")
assert.equal(macroValues.get("user_profile"), "/api/v1/images/user-avatar?size=sm")
assert.match(completionToast, /Swarm Studio finished/)

const getActiveChat = spindle.chats.getActive
const getProfileImage = spindle.images.get
try {
  spindle.images.get = async (id, options) => id === "alt-avatar"
    ? { id, url: "/api/v1/images/alt-avatar?size=sm" }
    : getProfileImage(id, options)
  spindle.chats.getActive = async () => ({
    ...await getActiveChat(),
    metadata: { active_avatar_id: "alt-avatar" },
  })
  await eventHandlers.get("CHARACTER_AVATAR_CHANGED")({}, "user-1")
  assert.equal(macroValues.get("char_profile"), "/api/v1/images/alt-avatar?size=sm")

  spindle.chats.getActive = async () => ({
    ...await getActiveChat(),
    metadata: { group: true, group_active_avatar_ids: { "char-1": "alt-avatar" } },
  })
  await eventHandlers.get("CHAT_SWITCHED")({}, "user-1")
  assert.equal(macroValues.get("char_profile"), "/api/v1/images/alt-avatar?size=sm")
} finally {
  spindle.chats.getActive = getActiveChat
  spindle.images.get = getProfileImage
}
await eventHandlers.get("CHARACTER_AVATAR_CHANGED")({}, "user-1")
assert.equal(macroValues.get("char_profile"), "/api/v1/images/char-avatar?size=sm")

const nativeGenerateStream = globalThis.spindle.imageGen.generateStream
delete globalThis.spindle.imageGen.generateStream
let legacyGenerated
try {
  legacyGenerated = await request("generate", {
    input: {
      prompt: "legacy compatibility portrait",
      negativePrompt: "blurry",
      connection_id: "swarm-1",
      model: "base.safetensors",
      clientJobId: "legacy-job-1",
      parameters: {
        loras: ["styles/ink.safetensors"],
        loraWeights: [0.75],
        seed: -1,
        rawRequestOverride: JSON.stringify({
          presets: ["Cinematic"],
          comfyuicustomworkflow: "Portrait/Inpaint",
        }),
      },
    },
    recordHints: {
      presets: ["Cinematic"],
      workflow: "Portrait/Inpaint",
    },
  })
} finally {
  globalThis.spindle.imageGen.generateStream = nativeGenerateStream
}
assert.equal(legacyGenerationInputs.length, 1)
assert.equal(legacyGenerated.data.result.imageId, "image-legacy")
assert.match(source, /typeof streamFactory !== "function"[\s\S]*?imageGen\.generate\(providerInput\)[\s\S]*?const generationInput = \{/)
assert.doesNotMatch(source, /imageGen\.generate\(generationInput\)/)

const tagConfig = await request("set_tag_automation", {
  config: {
    autoGenerate: true,
    injectProtocol: true,
    completionToast: false,
    stripUserOnlyLoraStack: false,
    autoPrintCharacterPositive: true,
    requiredImageMin: 2,
    requiredImageMax: 4,
    promptMode: "pov",
    promptFamily: "anima",
  },
})
assert.equal(tagConfig.data.autoGenerate, true)
assert.equal(tagConfig.data.injectProtocol, true)
assert.equal(tagConfig.data.completionToast, false)
assert.equal(tagConfig.data.stripUserOnlyLoraStack, false)
assert.equal(tagConfig.data.autoPrintCharacterPositive, true)
assert.equal(tagConfig.data.requiredImageMin, 2)
assert.equal(tagConfig.data.requiredImageMax, 4)
assert.equal(tagConfig.data.promptMode, "pov")
assert.equal(tagConfig.data.promptFamily, "anima")
assert.match(tagConfig.data.protocolPrompt, /SWARM STUDIO IMAGE REQUEST PROTOCOL/)
assert.match(tagConfig.data.protocolPrompt, /\{\{swarm_dynamic_guidance\}\}/)
assert.match(macroValues.get("swarm_image_protocol"), /between 2 and 4 complete <swarm-image> requests/)
assert.match(macroValues.get("swarm_image_protocol"), /does not satisfy any required image count/)
assert.match(macroValues.get("swarm_image_protocol"), /CHARACTER-ONLY \/ POV/)
assert.doesNotMatch(macroValues.get("swarm_image_protocol"), /\{\{swarm_dynamic_guidance\}\}/)
assert.match(macroValues.get("swarm_image_protocol"), /automatically bound/)
assert.match(macroValues.get("swarm_image_protocol"), /current Studio LoRA stack remains active/)
assert.match(macroValues.get("swarm_image_protocol"), /ANIMA SUBJECT SERIALIZER/)
assert.match(macroValues.get("swarm_image_protocol"), /viewer\/camera is a reference point, not a character slot/)
const illustriousTagConfig = await request("set_tag_automation", {
  config: { ...tagConfig.data, promptFamily: "illustrious" },
})
assert.equal(illustriousTagConfig.data.promptFamily, "illustrious")
assert.match(macroValues.get("swarm_image_protocol"), /ILLUSTRIOUS SUBJECT SERIALIZER/)
assert.doesNotMatch(macroValues.get("swarm_image_protocol"), /ANIMA SUBJECT SERIALIZER/)
await request("set_tag_automation", { config: tagConfig.data })
const characterBaseTags = await request("set_character_base_tags", {
  characterId: "char-1",
  tags: "1boy, black hair, red eyes",
})
assert.equal(characterBaseTags.data.characterId, "char-1")
assert.equal(characterBaseTags.data.characterName, "Lior")
assert.equal(characterBaseTags.data.source, "studio")
assert.equal(characterBaseTags.data.tags, "1boy, black hair, red eyes")
assert.equal(macroValues.get("char_base"), "1boy, black hair, red eyes")
assert.equal(userFiles.get("character-base-tags.json")[0].characterId, "char-1")
const personaVisuals = await request("save_persona_visual_preset", {
  preset: {
    name: "User visuals",
    positivePrompt: "1girl, silver hair, blue eyes, black hoodie",
    sourcePresetId: "lumi-preset-1",
  },
  bind: true,
  bindingEnabled: true,
})
assert.equal(personaVisuals.data.personaPresets[0].name, "User visuals")
assert.equal(personaVisuals.data.personaBinding.presetId, personaVisuals.data.personaPresets[0].id)
assert.equal(personaVisuals.data.activePersonaPreset.positivePrompt, "1girl, silver hair, blue eyes, black hoodie")
assert.equal(macroValues.get("persona_base"), "1girl, silver hair, blue eyes, black hoodie")
assert.equal(activePersona.metadata.swarm_studio_visuals.enabled, true)
const chatVisuals = await request("get_chat_visuals", {
  currentStack: [{
    name: "styles/ink.safetensors",
    title: "Ink",
    weight: 0.75,
    enabled: true,
    useTrigger: false,
  }],
})
assert.equal(chatVisuals.data.activeChat.characterName, "Lior")
assert.equal(chatVisuals.data.activePersona.name, "User")
assert.equal(chatVisuals.data.studioStack[0].name, "styles/ink.safetensors")
assert.equal(chatVisuals.data.models[0].id, "base.safetensors")
assert.equal(chatVisuals.data.studioConnectionId, "swarm-1")
assert.equal(chatVisuals.data.studioModel, "base.safetensors")
const intercepted = await interceptorHandler([
  {
    role: "assistant",
    content: taggedMessage.content,
    __isChatHistory: true,
  },
], { chatId: "chat-1" })
assert.equal(intercepted.messages[0].role, "system")
assert.match(intercepted.messages[0].content, /SWARM STUDIO IMAGE REQUEST PROTOCOL/)
assert.match(intercepted.messages[0].content, /request="generate"/)
assert.match(intercepted.messages[0].content, /Attributes may be written on one line or separate lines/)
assert.match(intercepted.messages[0].content, /<preset:Cinematic>/)
assert.match(intercepted.messages[0].content, /configured local SwarmUI installation and local hardware/)
assert.match(intercepted.messages[0].content, /IMAGE COUNT REQUIREMENT — USER-SELECTED AND MANDATORY/)
assert.match(intercepted.messages[0].content, /Emit at least 2 and no more than 4/)
assert.match(intercepted.messages[0].content, /no scene is important enough/)
assert.match(intercepted.messages[0].content, /ACTIVE CHARACTER IDENTITY/)
assert.match(intercepted.messages[0].content, /1boy, black hair, red eyes/)
assert.match(intercepted.messages[0].content, /ILLUSTRATION MODE — CHARACTER-ONLY \/ POV/)
assert.match(intercepted.messages[0].content, /current outfit, clothing removal, damage, wetness, or disarray/)
assert.match(intercepted.messages[0].content, /persona="active"/)
assert.doesNotMatch(intercepted.messages[0].content, /Use at most two image tags/)
assert.match(intercepted.messages[1].content, /\[Illustration requested: Street food\]/)

const completedFigure = `<figure data-swarm-studio-image="true" data-swarm-studio-job-id="17b19357-bfbb-42e1-bbc8-1b6df1a01c1a" data-swarm-studio-slot="tea-gambit" tabindex="0" style="position:relative;display:block;width:100%;height:100%;margin:0;"><img src="http://localhost:2004/api/v1/images/284217fc-73bf-4e8c-ac06-ae144bd4cab9" alt="A silver-haired android maid serves tea beside a triple-monitor desk" data-swarm-studio-slot="tea-gambit" data-swarm-studio-fit="cover" loading="lazy"><span data-swarm-studio-inline-action="true">↻</span></figure>`
const cleanedCompleted = await interceptorHandler([
  {
    role: "assistant",
    content: `Scene text.\n${completedFigure}\nAfter the image.`,
  },
  {
    role: "assistant",
    content: `![Swarm output](<http://localhost:2004/api/v1/images/284217fc-73bf-4e8c-ac06-ae144bd4cab9>)`,
  },
], { chatId: "chat-1" })
assert.match(cleanedCompleted.messages[1].content, /Scene text\.\n\[Generated illustration: A silver-haired android maid serves tea beside a triple-monitor desk\]\nAfter the image\./)
assert.doesNotMatch(cleanedCompleted.messages[1].content, /<figure|<img|data-swarm-studio/)
assert.equal(cleanedCompleted.messages[2].content, "[Generated illustration: Swarm output]")

const visualHistory = Array.from({ length: 12 }, (_, index) => ({
  role: "assistant", __isChatHistory: true,
  content: `Scene ${index + 1}.\n${completedFigure.replace("serves tea", `serves tea ${index + 1}`)}\nAfter the image.`,
}))
const visualHistorySnapshot = structuredClone(visualHistory)
const historyExample = { role: "system", content: "Do not emit [Generated illustration: example]." }
const readHistory = async (history) => {
  const result = await interceptorHandler([historyExample, ...history], { chatId: "chat-1" })
  const projected = Array.isArray(result) ? result : result.messages
  assert.equal(projected.find(message => message.content === historyExample.content)?.content, historyExample.content)
  return projected.filter(message => message.role === "assistant")
}
const keepPrefix = await readHistory(visualHistory.slice(0, 8))
const keepFull = await readHistory(visualHistory)
assert.equal(keepFull.length, 12)
assert.ok(keepFull.every(message => message.content.includes("[Generated illustration:")))
assert.deepEqual(keepFull.slice(0, keepPrefix.length), keepPrefix, "Appended illustrations must not evict older captions")
const stripConfig = await request("set_tag_automation", { config: { ...tagConfig.data, historyImageMarkers: "strip" } })
assert.equal(stripConfig.data.historyImageMarkers, "strip")
const stripPrefix = await readHistory(visualHistory.slice(0, 8))
const stripFull = await readHistory(visualHistory)
assert.equal(stripFull.length, 12)
assert.deepEqual(stripFull.slice(0, stripPrefix.length), stripPrefix, "Strip policy must also be prefix stable")
assert.equal(stripFull[0].content, "Scene 1.\n\nAfter the image.")
assert.ok(stripFull.every(message => !/Generated illustration|data-swarm-studio|<img/.test(message.content)))
const pending = { role: "assistant", content: 'Before.\n<swarm-image request="generate" slot="tea-gambit" alt="Tea">tea</swarm-image>\nAfter.' }
const finished = { ...pending, content: `Before.\n${completedFigure}\nAfter.` }
assert.deepEqual(await readHistory([pending]), await readHistory([finished]), "Strip mode must not change when a request becomes a generated figure")
assert.deepEqual(await readHistory([{ role: "assistant", content: completedFigure }]), [], "Image-only assistant history is omitted consistently")
assert.deepEqual(await readHistory([{ role: "assistant", content: "Before.\n[Illustration requested]\n[Embedded generated image omitted]\nAfter." }]), [{ role: "assistant", content: "Before.\n\nAfter." }])
assert.deepEqual(visualHistory, visualHistorySnapshot, "Never mutate canonical inputs")
const invalidHistoryPolicy = await request("set_tag_automation", { config: { ...tagConfig.data, historyImageMarkers: "rolling" } })
assert.equal(invalidHistoryPolicy.data.historyImageMarkers, "keep")
await request("set_tag_automation", { config: tagConfig.data })

const originalTaggedContent = taggedMessage.content
const tagMatch = originalTaggedContent.match(/<swarm-image\b([^>]*)>([\s\S]*?)<\/swarm-image>/i)
assert.ok(tagMatch)
await frontendHandler({
  type: "tag_generate",
  requestId: "tag-generate-1",
  chatId: "chat-1",
  messageId: "message-tag-1",
  fullMatch: tagMatch[0],
  attrs: { request: "generate", slot: "post", aspect: "4:5", alt: "Street food" },
  content: tagMatch[2],
}, "user-1")
const tagError = sent.find((entry) => entry.payload.requestId === "tag-generate-1" && entry.payload.type === "studio_error")
assert.equal(tagError, undefined, tagError?.payload?.error)
assert.equal(taggedGenerationCount, 1)
for (
  let attempt = 0;
  attempt < 100 && !sent.some((entry) => entry.payload.type === "tagged_generation_result");
  attempt += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 1))
}
const taggedResult = sent.find((entry) => entry.payload.type === "tagged_generation_result")
assert.ok(
  taggedResult,
  `Tagged generation did not finish in time: ${JSON.stringify(sent.slice(-12).map((entry) => entry.payload))}`,
)
const taggedReadyState = sent.find((entry) =>
  entry.payload.type === "tagged_image_job"
  && entry.payload.data?.clientJobId === taggedResult.payload.data.taggedJob.clientJobId
  && entry.payload.data?.status === "ready"
)
assert.ok(taggedReadyState)
const firstTaggedStates = sent.filter(entry => entry.payload.type === "tagged_image_job" && entry.payload.data?.id === taggedResult.payload.data.taggedJob.id)
assert.equal(firstTaggedStates[0].payload.data.status, "queued", "Automatic requests never advertise a manual Generate action")
assert.equal(firstTaggedStates.some(entry => entry.payload.data.status === "requested"), false)
assert.ok(sent.indexOf(taggedReadyState) < sent.indexOf(taggedResult))
assert.equal(taggedResult.payload.data.record.imageId, "image-tag-1")
assert.equal(taggedResult.payload.data.taggedJob.status, "ready")
const taggedReconciliation = sent.find((entry) =>
  entry.payload.type === "tagged_message_reconciled"
  && entry.payload.data.jobId === taggedResult.payload.data.taggedJob.id
)
assert.equal(taggedReconciliation.payload.data.chatId, "chat-1")
assert.equal(taggedReconciliation.payload.data.messageId, taggedMessage.id)
assert.match(taggedReconciliation.payload.data.content, /data-swarm-studio-job-id=/)
assert.match(taggedMessage.content, /<img src="\/api\/v1\/image-gen\/results\/image-tag-1"/)
assert.match(taggedMessage.content, /data-swarm-studio-slot="post"/)
assert.match(taggedMessage.content, /data-swarm-studio-fit="cover"/)
assert.match(taggedMessage.content, /object-fit:cover/)
assert.equal(taggedMessage.metadata.swarm_studio_tagged_images[0].imageId, "image-tag-1")
assert.equal(macroValues.get("last_genned"), "/api/v1/image-gen/results/image-tag-1")
const storedFoldersAfterTag = userFiles.get("output-folders.json")
const storedCharacterFolderAfterTag = storedFoldersAfterTag.find((folder) => folder.id === "character:char-1")
assert.equal(storedCharacterFolderAfterTag.name, "Lior")
assert.deepEqual(storedCharacterFolderAfterTag.imageIds, ["image-tag-1"])
assert.equal(storedCharacterFolderAfterTag.binding.type, "character")
assert.equal(storedCharacterFolderAfterTag.binding.chatId, undefined)
assert.equal(storedCharacterFolderAfterTag.binding.characterId, "char-1")
assert.equal(storedCharacterFolderAfterTag.binding.positivePrompt, "1boy, black hair, red eyes")

const customCharacterVisuals = await request("save_chat_visuals", {
  positivePrompt: "1boy, black hair, red eyes",
  negativePrompt: "wrong eye color",
  checkpoint: "base.safetensors",
  sourcePresetId: "lumi-character-preset-1",
  stackPresetId: "",
  stackSnapshot: [{
    name: "styles/ink.safetensors",
    title: "Ink",
    weight: 0.61,
    enabled: true,
    useTrigger: false,
  }],
  enabled: true,
})
assert.equal(customCharacterVisuals.data.characterFolder.binding.stackPresetId, "")
assert.equal(customCharacterVisuals.data.characterFolder.binding.stackSnapshot[0].weight, 0.61)
assert.equal(customCharacterVisuals.data.characterFolder.binding.negativePrompt, "wrong eye color")
assert.equal(customCharacterVisuals.data.characterFolder.binding.checkpoint, "base.safetensors")
assert.equal(customCharacterVisuals.data.characterFolder.binding.sourcePresetId, "lumi-character-preset-1")

assert.equal(typeof visualMacroHandler, "function")
const composePocket = async (scene, purpose="scene", characterId="char-1", options={}) => JSON.parse(decodeURIComponent(await visualMacroHandler({template:`{{swarm_visual_request::${encodeURIComponent(JSON.stringify({chatId:"chat-1",characterId,scene,purpose,...options}))}}}`,userId:"user-1"})))
const resolvedPocket=await composePocket("A fresh scene by the window")
assert.match(resolvedPocket.prompt,/fresh scene by the window/)
assert.match(resolvedPocket.prompt,/black hair, red eyes/)
assert.equal(resolvedPocket.model,"base.safetensors")
assert.equal(resolvedPocket.parameters.rawRequestOverride?.includes("AnimaRefAdapter") ?? false, false)

const folderReference = "data:image/png;base64,Zm9sZGVy"
const lookReference = "data:image/png;base64,bG9vaw=="
const updateAdapter = (animaReference, animaReferenceUrl = folderReference) => request("update_output_folder_profile", {
  folderId: "character:char-1",
  profile: { ...customCharacterVisuals.data.characterFolder.binding, animaReference, animaReferenceUrl },
})
const saveAdapterLook = (animaReference, referenceImageUrl) => request("save_character_look", {
  characterId: "char-1", activate: true,
  look: { id: "default", name: "Default", animaReference, referenceImageUrl },
})
const previousAdapterProfile = userFiles.get("studio-generation-profile.json")
await updateAdapter(true)
await assert.rejects(() => composePocket("Conflicting custom workflow"), /Clear the selected Swarm workflow/)
userFiles.set("studio-generation-profile.json", {
  ...previousAdapterProfile,
  input: { ...previousAdapterProfile.input, parameters: { ...previousAdapterProfile.input.parameters, rawRequestOverride: "{}" } },
})
const adaptedFolder = await composePocket("A fresh scene by the window")
const graph = JSON.parse(JSON.parse(adaptedFolder.parameters.rawRequestOverride).comfyworkflowraw)
const findNode = (type) => Object.entries(graph).find(([, node]) => node.class_type === type)
const [adapterId, adapter] = findNode("AnimaRefAdapter")
assert.deepEqual(adaptedFolder.parameters.referenceImages, [{ data: "Zm9sZGVy", mimeType: "image/png" }])
assert.equal(findNode("SwarmLoadImageB64")[1].inputs.image_base64, "${init_image}")
assert.equal(adapter.inputs.lora_name, "anima_ref_adapter_v2_r64.safetensors")
assert.deepEqual(adapter.inputs.model, [findNode("LoraLoader")[0], 0])
assert.equal(findNode("LoraLoader")[1].inputs.strength_model, 0.61)
assert.deepEqual(findNode("KSampler")[1].inputs.model, [adapterId, 0])
assert.deepEqual(findNode("KSampler")[1].inputs.latent_image, [findNode("EmptyLatentImage")[0], 0])
assert.equal(findNode("EmptyLatentImage")[1].inputs.width, "%%_COMFYFIXME_${width}_ENDFIXME_%%")
assert.equal(findNode("KSampler")[1].inputs.denoise, 1)

await saveAdapterLook("inherit", lookReference)
assert.deepEqual((await composePocket("Look reference")).parameters.referenceImages, [{ data: "bG9vaw==", mimeType: "image/png" }])
// A native upload is visible to the user but not tagged to this extension.
// Thumbnail and public-result URL locators must never go through the proxy.
{
  const get = spindle.images.get, read = spindle.images.readBinary, cors = spindle.cors
  const original = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64"))
  const reads = [], lookups = []
  try {
    spindle.images.get = async (id, options) => {
      if (!['native-upload','hidden-reference','thumb-only'].includes(id)) return get(id,options)
      assert.equal(options.userId, 'user-1'); assert.equal(options.onlyOwned,false)
      lookups.push([id,options.specificity])
      if (id === 'hidden-reference' || id === 'thumb-only' && options.specificity === 'full') return null
      return {id, mime_type:'image/png', url:`/api/v1/images/${id}?size=sm`, owner_extension_identifier:null}
    }
    spindle.images.readBinary = async (id,userId) => {assert.equal(userId,'user-1');assert.notEqual(id,'hidden-reference');reads.push(id);return original}
    spindle.cors = async (url,options) => {assert.doesNotMatch(url,/\/api\/v1\/(?:images|image-gen\/results)\//);return cors(url,options)}
    for (const url of ['/api/v1/images/native-upload?size=sm','https://lumi.example/api/v1/images/native-upload?size=lg','/api/v1/image-gen/results/native-upload','/api/v1/images/thumb-only?size=sm']) {
      await saveAdapterLook('on',url)
      assert.deepEqual((await composePocket('Scoped reference')).parameters.referenceImages,[{mimeType:'image/png',data:Buffer.from(original).toString('base64')}])
    }
    assert.deepEqual(reads,['native-upload','native-upload','native-upload','thumb-only'])
    assert.ok(lookups.some(([id,size])=>id==='thumb-only'&&size==='sm'))
    await saveAdapterLook('on','/api/v1/images/hidden-reference?size=sm')
    await assert.rejects(()=>composePocket('Inaccessible reference'),/accessible Anima reference/)
    assert.equal(reads.length,4)
    // External URL conditioning remains supported by the existing proxy.
    await saveAdapterLook('on','https://image.civitai.com/example.jpg')
    assert.deepEqual((await composePocket('External reference')).parameters.referenceImages,[{mimeType:'image/jpeg',data:'VEhVTUJOQUlM'}])
  } finally { spindle.images.get=get;spindle.images.readBinary=read;spindle.cors=cors;await saveAdapterLook('inherit',lookReference) }
}
await saveAdapterLook("off", lookReference)
const ordinaryLook = await composePocket("Standard look")
assert.equal(ordinaryLook.parameters.rawRequestOverride?.includes("AnimaRefAdapter") ?? false, false)
assert.equal(ordinaryLook.parameters.denoise, 0.6)
await updateAdapter(false)
await saveAdapterLook("on", lookReference)
assert.match((await composePocket("Explicit look opt-in")).parameters.rawRequestOverride, /AnimaRefAdapter/)
await saveAdapterLook("on", "")
await updateAdapter(false, "")
await assert.rejects(() => composePocket("Missing reference"), /Add an accessible Anima reference image URL/)
await saveAdapterLook("inherit", "")
userFiles.set("studio-generation-profile.json", previousAdapterProfile)

assert.deepEqual(resolvedPocket.parameters.loras,["styles/ink.safetensors"])
assert.deepEqual(resolvedPocket.parameters.loraWeights,[0.61])
const pocketPositiveOff=await composePocket("A plain identity test","scene","char-1",{includeCharacterPositive:false})
assert.doesNotMatch(pocketPositiveOff.prompt,/black hair, red eyes/)
const pocketPositiveOn=await composePocket("A plain identity test","scene","char-1",{includeCharacterPositive:true})
assert.match(pocketPositiveOn.prompt,/black hair, red eyes/)
const isolatedPocket=await composePocket("A fresh cartoon sticker","message")
assert.doesNotMatch(isolatedPocket.prompt,/black hair, red eyes/)
assert.deepEqual(isolatedPocket.parameters.loras,[])
await assert.rejects(()=>composePocket("scene","scene","wrong-character"),/character changed/)

const savedFormalLook = await request("save_character_look", {
  characterId: "char-1",
  activate: true,
  look: {
    name: "Formal",
    aliases: ["evening wear", "black tie"],
    outfitPrompt: "tailored black tuxedo, white dress shirt",
    negativePrompt: "casual clothes",
    checkpoint: "formal-portrait.safetensors",
    stackSnapshot: [{
      name: "wardrobe/formal.safetensors",
      title: "Formal wardrobe",
      weight: 0.72,
      enabled: true,
      useTrigger: false,
    }],
    triggerWords: ["formalwear"],
    referenceImageId: "formal-reference",
    thumbnailImageId: "formal-thumbnail",
    notes: "Canonical evening look",
  },
})
const formalLook = savedFormalLook.data.looks.find((look) => look.name === "Formal")
assert.ok(formalLook)
assert.equal(savedFormalLook.data.activeLookId, formalLook.id)
assert.deepEqual(formalLook.aliases, ["evening wear", "black tie"])
assert.equal(formalLook.stackSnapshot[0].weight, 0.72)
assert.match(savedFormalLook.data.badge, /2 looks/)
const previousPocketImageGet=spindle.images.get
spindle.images.get=async(id,options)=>{if(id==="formal-reference"){assert.equal(options.userId,"user-1");assert.equal(options.onlyOwned,false);assert.equal(options.specificity,"full");return {url:"data:image/png;base64,aGVsbG8="}}return previousPocketImageGet(id,options)}
let resolvedLookPocket
try{resolvedLookPocket=await composePocket("A fresh evening portrait")}finally{spindle.images.get=previousPocketImageGet}
assert.deepEqual(resolvedLookPocket.parameters.referenceImages,[{data:"aGVsbG8=",mimeType:"image/png"}])

assert.equal(resolvedLookPocket.model,"formal-portrait.safetensors")
assert.match(resolvedLookPocket.prompt,/tailored black tuxedo/)
assert.ok(resolvedLookPocket.parameters.loras.includes("wardrobe/formal.safetensors"))
assert.doesNotMatch(resolvedLookPocket.prompt,/old sticker prompt/)


const selectedDefaultLook = await request("select_character_look", {
  characterId: "char-1",
  lookId: "default",
})
assert.equal(selectedDefaultLook.data.activeLookId, "default")
const deletedFormalLook = await request("delete_character_look", {
  characterId: "char-1",
  lookId: formalLook.id,
})
assert.equal(deletedFormalLook.data.looks.some((look) => look.id === formalLook.id), false)
assert.equal(deletedFormalLook.data.looks[0].id, "default")

const visualFolders = await request("update_output_folder_profile", {
  folderId: storedCharacterFolderAfterTag.id,
  profile: {
    positivePrompt: "1boy, red eyes, black hair, signature coat",
    negativePrompt: "wrong eye color",
    checkpoint: "base.safetensors",
    stackPresetId: savedStack.data[0].id,
    enabled: false,
  },
})
const updatedVisualFolder = visualFolders.data.find((folder) => folder.id === storedCharacterFolderAfterTag.id)
assert.equal(updatedVisualFolder.binding.positivePrompt, "1boy, red eyes, black hair, signature coat")
assert.equal(updatedVisualFolder.binding.negativePrompt, "wrong eye color")
assert.equal(updatedVisualFolder.binding.checkpoint, "base.safetensors")
assert.equal(updatedVisualFolder.binding.stackPresetId, savedStack.data[0].id)
assert.equal(updatedVisualFolder.binding.enabled, false)

await frontendHandler({
  type: "retry_tagged_job",
  requestId: "retry-tagged-edited",
  jobId: taggedResult.payload.data.taggedJob.id,
  retryMode: "current",
  promptOverride: "{{swarm_preset}}, train platform, waving, <preset:composition>",
  negativePromptOverride: "blurry",
}, "user-1")
assert.equal(taggedGenerationCount, 2, "edited inline regeneration should run exactly once")
assert.equal(taggedGenerationInputs[1].parameters.seed, -1)
assert.match(taggedGenerationInputs[1].prompt, /train platform, waving/)
assert.match(taggedMessage.content, /image-tag-2/)
assert.match(source, /\(\?\:\(\?!<swarm-image\\b\)\[\\s\\S\]\)\*\?/)

const multiTaggedMessage = {
  id: "message-tag-multi",
  role: "assistant",
  content: `<article><swarm-image request="generate" slot="first" aspect="4:3" alt="First">{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image><p>Between.</p><swarm-image request="generate" slot="second" aspect="4:3" alt="Second">{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image></article>`,
  metadata: {},
}
taggedMessages.push(multiTaggedMessage)
const multiMatches = [...multiTaggedMessage.content.matchAll(/<swarm-image\b([^>]*)>([\s\S]*?)<\/swarm-image>/gi)]
assert.equal(multiMatches.length, 2)
await Promise.all(multiMatches.map((match, index) => frontendHandler({
  type: "tag_generate",
  requestId: `tag-generate-multi-${index}`,
  chatId: "chat-1",
  messageId: multiTaggedMessage.id,
  fullMatch: match[0],
  attrs: { request: "generate", slot: index === 0 ? "first" : "second", aspect: "4:3", alt: index === 0 ? "First" : "Second" },
  content: match[2],
}, "user-1")))
assert.equal(taggedGenerationCount, 4)
assert.equal((multiTaggedMessage.content.match(/data-swarm-studio-image="true"/g) || []).length, 2)
assert.equal((multiTaggedMessage.content.match(/data-swarm-studio-inline-action="true"/g) || []).length, 2)
assert.doesNotMatch(multiTaggedMessage.content, /<swarm-image\b/i)
assert.equal(multiTaggedMessage.metadata.swarm_studio_tagged_images.length, 2)
const foldersAfterDisabledVisualGenerations = userFiles.get("output-folders.json")
assert.deepEqual(
  foldersAfterDisabledVisualGenerations.find((folder) => folder.id === "character:char-1").imageIds,
  ["image-tag-1"],
  "disabled character visuals must leave newly generated images Unfiled",
)

const delayedTaggedMessage = {
  id: "message-tag-delayed",
  role: "assistant",
  content: `<article><swarm-image request="generate" slot="delayed" aspect="4:3" alt="Delayed attachment">{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image></article>`,
  metadata: {},
}
taggedMessages.push(delayedTaggedMessage)
const delayedMatch = delayedTaggedMessage.content.match(/<swarm-image\b([^>]*)>([\s\S]*?)<\/swarm-image>/i)
assert.ok(delayedMatch)
hiddenTaggedMessageId = delayedTaggedMessage.id
taggedMessageReadMisses = 2
await frontendHandler({
  type: "tag_generate",
  requestId: "tag-generate-delayed",
  chatId: "chat-1",
  messageId: delayedTaggedMessage.id,
  fullMatch: delayedMatch[0],
  attrs: { request: "generate", slot: "delayed", aspect: "4:3", alt: "Delayed attachment" },
  content: delayedMatch[2],
}, "user-1")
hiddenTaggedMessageId = ""
assert.equal(taggedMessageReadMisses, 0, "attachment finalization should retry until the chat message becomes available")
assert.match(delayedTaggedMessage.content, /data-swarm-studio-image="true"/)
assert.doesNotMatch(delayedTaggedMessage.content, /<swarm-image\b/i)
const delayedTaggedResult = sent.filter((entry) => entry.payload.type === "tagged_generation_result").at(-1)
assert.equal(delayedTaggedResult.payload.data.record.imageId, "image-tag-5")
assert.ok(sent.some((entry) =>
  entry.payload.type === "tagged_message_reconciled"
  && entry.payload.data.jobId === delayedTaggedResult.payload.data.taggedJob.id
))

const remappedTaggedMessage = {
  id: "message-tag-final",
  role: "assistant",
  content: `<article><swarm-image request="generate" slot="remapped" aspect="4:3" alt="Remapped attachment">{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image></article>`,
  metadata: {},
}
taggedMessages.push(remappedTaggedMessage)
const remappedMatch = remappedTaggedMessage.content.match(/<swarm-image\b([^>]*)>([\s\S]*?)<\/swarm-image>/i)
assert.ok(remappedMatch)
await frontendHandler({
  type: "tag_generate",
  requestId: "tag-generate-remapped",
  chatId: "chat-1",
  messageId: "message-tag-transient",
  fullMatch: remappedMatch[0],
  attrs: { request: "generate", slot: "remapped", aspect: "4:3", alt: "Remapped attachment" },
  content: remappedMatch[2],
}, "user-1")
for (
  let attempt = 0;
  attempt < 100 && !remappedTaggedMessage.content.includes('data-swarm-studio-image="true"');
  attempt += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 1))
}
assert.equal(taggedGenerationCount, 6)
assert.match(remappedTaggedMessage.content, /data-swarm-studio-image="true"/)
assert.doesNotMatch(remappedTaggedMessage.content, /<swarm-image\b/i)
const remappedReconciliation = sent.filter((entry) =>
  entry.payload.type === "tagged_message_reconciled"
  && entry.payload.data.messageId === remappedTaggedMessage.id
).at(-1)
assert.ok(remappedReconciliation, "the backend should remap a transient streaming message ID without frontend assistance")
const remappedJobState = sent.filter((entry) =>
  entry.payload.type === "tagged_image_job"
  && entry.payload.data.messageId === remappedTaggedMessage.id
  && entry.payload.data.inserted === true
).at(-1)
assert.ok(remappedJobState)
assert.match(remappedJobState.payload.data.tagFingerprint, /^[a-z0-9]+$/)
await frontendHandler({type:"tag_generate",requestId:"remapped-tag-replay",chatId:"chat-1",messageId:remappedTaggedMessage.id,fullMatch:remappedMatch[0],attrs:{request:"generate",slot:"remapped",aspect:"4:3",alt:"Remapped attachment"},content:remappedMatch[2]}, "user-1")
assert.equal(taggedGenerationCount, 6, "Replaying a tag after message-ID remapping reuses its completed job")

const removedInlineImage = await request("remove_tagged_image_from_chat", {
  jobId: remappedJobState.payload.data.id,
})
assert.equal(removedInlineImage.type, "tagged_image_removed")
assert.equal(removedInlineImage.data.messageId, remappedTaggedMessage.id)
assert.doesNotMatch(removedInlineImage.data.content, /data-swarm-studio-image="true"/)
assert.doesNotMatch(remappedTaggedMessage.content, /data-swarm-studio-image="true"/)
assert.equal(remappedTaggedMessage.metadata.swarm_studio_tagged_images.length, 0)
assert.equal(
  userFiles.get("tagged-image-jobs.json").some((job) => job.id === remappedJobState.payload.data.id),
  false,
)
assert.equal(
  userFiles.get("generation-records.json").some((record) => record.imageId === "image-tag-6"),
  true,
  "removing an inline image must preserve its Lumiverse Library output",
)

const originalOutput = await request("download_swarm_output", {
  connectionId: "swarm-1",
  swarmPath: generated.data.record.swarmPath,
})
assert.equal(originalOutput.data.dataUrl, "data:image/png;base64,QUJD")
assert.equal(originalOutput.data.filename, "image-1.png")
assert.equal(downloadedSwarmUrl, "http://localhost:7801/Output/2026-07-19/image-1.png")
assert.match(source, /Supported aspects are 1:1, 2:3, 3:2, 3:4, 4:3/)
assert.match(source, /Default inline prose illustrations to 4:3/)
assert.match(source, /aspect: cleanAspect\(attrs\.aspect\) \|\| "4:3"/)
assert.match(source, /character="active"/)
assert.match(source, /character="none" means the active chat character must not be visible/)
assert.match(source, /character="active" selects the active character card as an available visual identity source/)
assert.match(source, /One active card may resolve to multiple distinct NPC subjects/)
assert.match(source, /const NO_CHARACTER_NEGATIVE = "people, person, character/)
assert.match(source, /const includeCharacter = !\["none", "off", "false", "no", "0"\]\.includes\(characterMode\)/)
assert.match(source, /excludedLoras: includeCharacter \|\| !automation\.stripUserOnlyLoraStack[\s\S]*?\? \[\][\s\S]*?: visualStack\.map\(\(item\) => item\.name\)/)
assert.match(source, /if \(excluded\.has\(name\.toLowerCase\(\)\)\) return/)
assert.match(source, /LOCAL GENERATION/)
assert.match(source, /configured local SwarmUI installation and local hardware/)
assert.match(source, /Never use a chat character's or persona's display name as a diffusion token/)
assert.match(source, /ANIMA SUBJECT SERIALIZER/)
assert.match(source, /ILLUSTRIOUS SUBJECT SERIALIZER/)
assert.match(source, /<region:x,y,width,height,strength>/)
assert.match(source, /resolveSubjectRegions/)
assert.match(source, /<region:background>/)
assert.match(source, /scenePlan\.subjects\.length === 1 && includeCharacter && !includePersona/)
assert.match(source, /invisible observer still contributes no subject slot/)
assert.match(source, /MULTI-CHARACTER \/ ENSEMBLE/)
assert.match(source, /CHARACTER-ONLY \/ POV/)
assert.match(source, /safe, sensitive, nsfw, or explicit/)
assert.match(source, /folder\.binding\?\.characterId === characterId/)
assert.match(source, /type: "character"/)
assert.match(source, /rawBinding\.type === "character" \|\| rawBinding\.type === "chat"/)
assert.match(source, /const taggedMessageFinalizeLocks = new Map<string, Promise<void>>\(\)/)
assert.match(source, /const taggedFinalizeRetries = new Map<string, Promise<boolean>>\(\)/)
assert.match(source, /TAGGED_FINALIZE_RETRY_DELAYS_MS/)
assert.match(source, /withTaggedMessageFinalizeLock\(lockKey/)
assert.match(source, /finalizeTaggedImageJobWithRetry\(job, userId\)/)
assert.match(source, /type: "tagged_message_reconciled"/)
assert.match(source, /replaceTaggedImagePlaceholder\(content, job, markup,/)
assert.match(source, /data-swarm-studio-image="true"/)
assert.match(source, /data-swarm-studio-inline-action="true"/)
assert.match(source, /case "list_tagged_jobs"/)
assert.match(source, /case "retry_tagged_job"/)
assert.match(source, /case "retry_tagged_attachment"/)
assert.match(source, /case "remove_tagged_image_from_chat"/)
assert.match(source, /personaPreset\?\.positivePrompt \|\| ""/)
assert.doesNotMatch(source, /personaPreset\?\.positivePrompt \|\| asString\(persona\?\.description\)/)
assert.match(source, /if \(characterFolder\?\.binding && !characterFolder\.binding\.enabled\) return/)
assert.match(source, /folder\.binding\?\.characterId === characterId && folder\.binding\.enabled/)

const createdPreset = await request("add_swarm_preset", {
  connectionId: "swarm-1",
  title: "Studio Current",
  description: "Saved by contract",
  paramMap: {
    prompt: "ink style, portrait",
    width: 768,
    unknown: "must be discarded",
  },
})
assert.equal(createdPreset.data.title, "Studio Current")
assert.equal(createdPreset.data.swarmOptions.presets.some((preset) => preset.title === "Studio Current"), true)

const deletedPreset = await request("delete_swarm_preset", {
  connectionId: "swarm-1",
  title: "Studio Current",
})
assert.equal(deletedPreset.data.title, "Studio Current")
assert.equal(deletedPreset.data.swarmOptions.presets.some((preset) => preset.title === "Studio Current"), false)
assert.equal(presetDeleted, true)

const interrupted = await request("interrupt_generation", {
  connectionId: "swarm-1",
  clientJobId: "already-finished-job",
})
assert.equal(interrupted.data.interrupted, false)
assert.equal(interruptRequested, false, "Unknown jobs must not interrupt unrelated SwarmUI sessions")

const page = await request("refresh_outputs", { offset: 12, limit: 12 })
assert.equal(page.data.offset, 12)
assert.equal(page.data.limit, 12)

const currentFolders = userFiles.get("output-folders.json")
const currentCharacterFolder = currentFolders.find((folder) => folder.id === "character:char-1")
const currentFavoritesFolder = currentFolders.find((folder) => folder.id === "__swarm_studio_favorites__")
userFiles.set("output-folders.json", [
  currentFavoritesFolder,
  currentCharacterFolder,
  {
    id: "legacy-chat-folder",
    name: "Lior old chat",
    imageIds: ["legacy-chat-image"],
    binding: {
      type: "chat",
      chatId: "chat-older",
      characterId: "char-1",
      positivePrompt: "outdated visual tags",
      negativePrompt: "",
      stackPresetId: "",
      enabled: true,
    },
    updatedAt: 1,
  },
])
const migratedLibrary = await request("list_library_outputs")
const migratedCharacterFolder = migratedLibrary.data.folders.find((folder) => folder.id === "character:char-1")
assert.equal(migratedCharacterFolder.binding.type, "character")
assert.equal(migratedCharacterFolder.binding.chatId, undefined)
assert.deepEqual(migratedCharacterFolder.imageIds, ["image-tag-1", "legacy-chat-image"])

const createdFolders = await request("create_output_folder", { name: "Archive" })
const favoriteFolder = createdFolders.data.find((folder) => folder.id === "__swarm_studio_favorites__")
const archiveFolder = createdFolders.data.find((folder) => folder.name === "Archive")
assert.equal(favoriteFolder.name, "Favorites")
assert.equal(favoriteFolder.binding, null)
assert.equal(archiveFolder.binding, null)
const folderId = archiveFolder.id

const movedFolders = await request("move_output_to_folder", {
  imageId: "image-1",
  folderId,
})
assert.deepEqual(movedFolders.data.find((folder) => folder.id === folderId).imageIds, ["image-1"])

const starred = await request("set_output_favorite", {
  imageId: "image-1",
  favorite: true,
})
assert.deepEqual(
  starred.data.folders.find((folder) => folder.id === "__swarm_studio_favorites__").imageIds,
  ["image-1"],
)
assert.deepEqual(starred.data.folders.find((folder) => folder.id === folderId).imageIds, ["image-1"])

const library = await request("list_library_outputs")
assert.equal(library.data.outputs.length, 1)
assert.equal(library.data.folders[0].name, "Favorites")

const unstarred = await request("bulk_set_output_favorite", {
  imageIds: ["image-1"],
  favorite: false,
})
assert.deepEqual(
  unstarred.data.folders.find((folder) => folder.id === "__swarm_studio_favorites__").imageIds,
  [],
)

const bulkMoved = await request("bulk_move_outputs", {
  imageIds: ["image-1"],
  folderId: "__swarm_studio_favorites__",
})
assert.deepEqual(
  bulkMoved.data.find((folder) => folder.id === "__swarm_studio_favorites__").imageIds,
  ["image-1"],
)
assert.deepEqual(bulkMoved.data.find((folder) => folder.id === folderId).imageIds, ["image-1"])

const appended = await request("append_output_to_chat", {
  imageId: "image-1",
  label: "image.png",
})
assert.equal(appended.data.messageId, "message-image-1")
assert.equal(appended.data.imageId, "image-1")
assert.ok(appendedMessage)

const deleted = await request("bulk_delete_outputs", { imageIds: ["image-1"] })
assert.deepEqual(deleted.data.deletedIds, ["image-1"])
assert.deepEqual(deleted.data.failedIds, [])
assert.equal(deleted.data.outputs.length, 0)
assert.ok(deleted.data.folders.every((folder) => !folder.imageIds.includes("image-1")))

assert.match(source, /TAGGED_FINALIZE_RETRY_DELAYS_MS[\s\S]*?25_000/)
assert.match(source, /taggedFinalizeMessageTargets/)
assert.match(source, /finalMessageId = asString\(payload\?\.messageId\)\.trim\(\)/)
assert.match(source, /job\.messageId = finalMessageId/)
assert.match(source, /SWARM STUDIO IMAGE PLACEMENT PROTOCOL/)
assert.match(source, /spindle\.connections\.list\(userId\)/)
assert.match(source, /spindle\.generate\.quiet\(/)
assert.match(source, /config\.parserModel \? \{ model: config\.parserModel \}/)
assert.match(source, /spindle\.on\("GENERATION_ENDED"/)
assert.match(source, /const legacy = !attrs\.request/)

const parserModels = await request("list_parser_models", { connectionId: "text-1" })
assert.equal(parserModels.data.connectionId, "text-1")
assert.deepEqual(parserModels.data.models, [{ id: "connection-model", label: "connection-model" }])

const parserConfig = await request("set_tag_automation", {
  config: {
    autoGenerate: true,
    injectProtocol: true,
    requestMode: "parser",
    parserConnectionId: "text-1",
    parserModel: "parser-override",
    autoPrintCharacterPositive: true,
  },
})
assert.equal(parserConfig.data.requestMode, "parser")
assert.equal(parserConfig.data.parserConnectionId, "text-1")
assert.equal(parserConfig.data.parserModel, "parser-override")
assert.match(macroValues.get("swarm_image_protocol"), /request="parse"/)
assert.match(macroValues.get("swarm_image_protocol"), /historical context only, never an output format/)
assert.doesNotMatch(macroValues.get("swarm_image_protocol"), /request="generate"/)

taggedMessages.push({
  id: "message-parser-1",
  role: "assistant",
  content: `Before.<swarm-image
    request="parse"
    slot="parsed-scene"
    aspect="4:3"
    character="active"
    persona="none"
    alt="Train platform"
    count="1boy"
  >a⠀character⠀waving at a train platform</swarm-image>After.`,
  metadata: {},
})
eventHandlers.get("GENERATION_ENDED")({
  generationId: "generation-parser-1",
  chatId: "chat-1",
  messageId: "message-parser-1",
  content: taggedMessages.at(-1).content,
}, "user-1")
for (let attempt = 0; attempt < 100 && !quietParserCalls.length; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2))
}
for (let attempt = 0; attempt < 100 && !taggedMessages.at(-1).content.includes("data-swarm-studio-image"); attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 2))
}
assert.equal(quietParserCalls.length, 1)
assert.equal(quietParserCalls[0].connection_id, "text-1")
assert.equal(quietParserCalls[0].parameters.model, "parser-override")
assert.match(quietParserCalls[0].messages[0].content, /local image-request parser/)
assert.match(quietParserCalls[0].messages[1].content, /a character waving at a train platform/)
assert.doesNotMatch(quietParserCalls[0].messages[1].content, /\u2800/, "Parser must never receive Braille blanks from model tags")
assert.match(taggedMessages.at(-1).content, /^Before\.<figure/)
assert.match(taggedMessages.at(-1).content, /<\/figure>After\.$/)
assert.doesNotMatch(taggedGenerationInputs.at(-1).prompt, /\u2800/, "Parser output Braille blanks must not reach SwarmUI")
assert.match(taggedGenerationInputs.at(-1).prompt, /\(1boy:1\.5\)/, "Parser must preserve the optional authored count through provider dispatch")
// A late lifecycle replay with a *different* generationId must not pay Gem
// to parse the old request again after the source message was replaced.
const parserReplayCount = quietParserCalls.length
eventHandlers.get("GENERATION_ENDED")({
  generationId: "generation-parser-1-replayed",
  chatId: "chat-1",
  messageId: "message-parser-1",
  content: `Before.<swarm-image
    request="parse"
    slot="parsed-scene"
    aspect="4:3"
    character="active"
    persona="none"
    alt="Train platform"
    count="1boy"
  >a⠀character⠀waving at a train platform</swarm-image>After.`,
}, "user-1")
await new Promise(resolve=>setTimeout(resolve,15))
assert.equal(quietParserCalls.length, parserReplayCount, "Replayed GENERATION_ENDED must not invoke the parser again")

assert.equal((await request("get_visual_lore")).data.available, false, "Permission denial must remain explicit")
permissions.add("world_books")
const visualLore = await request("get_visual_lore")
assert.equal(visualLore.data.available, true)
assert.equal(visualLore.data.bookId, "world-book-1")
assert.equal(visualLore.data.entries[0].id, "lore-entry-1")
assert.equal(visualLore.data.entries[0].activated, true)
assert.equal(visualLore.data.entries[0].hasVisualIdentity, false)
assert.equal(visualLore.data.books[0].folder, "Worlds")
assert.equal(visualLore.data.entries[0].folder, "Architecture")
assert.deepEqual(visualLore.data.entries[0].tags, ["location", "historic"])
assert.equal(visualLore.data.selected.folder, "Architecture")
assert.deepEqual(visualLore.data.selected.tags, ["location", "historic"])
visualLoreEntry.extensions.unrelated_extension = { retained: true }
const loreSaved = await request("save_visual_lore", { bookId: "world-book-1", entryId: "lore-entry-1", identity: {
  enabled: false, entityType: "location", aliases: ["winter estate"], positivePrompt: "stone arches", negativePrompt: "neon", referenceImageId: "reference-1", stackPresetId: "old-stack", stackSnapshot: [{name:"legacy.safetensors",weight:0.7}], recipe: {steps:24}, notes:"keep the arches", modelPrompts: {moss:{positivePrompt:"A stone manor",negativePrompt:""}, auto:{positivePrompt:"ignored"}, krea:{positivePrompt:"",negativePrompt:""}}
} })
assert.equal(loreSaved.data.entries[0].activated, true)
assert.equal(loreSaved.data.entries[0].visualEnabled, false)
assert.equal(loreSaved.data.entries[0].entityType, "location")
assert.deepEqual(loreSaved.data.entries[0].aliases, ["winter estate"])
assert.equal(loreSaved.data.entries[0].referenceImageId, "reference-1")
assert.equal(loreSaved.data.selected.identity.stackSnapshot[0].name, "legacy.safetensors")
assert.deepEqual(loreSaved.data.selected.identity.recipe, {steps:24})
assert.deepEqual(loreSaved.data.selected.identity.modelPrompts, {moss:{positivePrompt:"A stone manor",negativePrompt:""}})
assert.deepEqual(visualLoreEntry.extensions.unrelated_extension, {retained:true})
assert.equal((await request("get_visual_lore", {bookId:"missing",entryId:"missing"})).data.entryId, "lore-entry-1")
// Exercise a real paginated provider shape, including a selected entry beyond 200.
{
  const listBooks = spindle.world_books.list
  const listEntries = spindle.world_books.entries.list
  const books = [{id:"world-book-1",name:"Locations",folder:"Worlds"},...Array.from({length:204},(_,i)=>({id:`book-extra-${i}`,name:`Book ${i}`,folder:"Archive"}))]
  const records = [visualLoreEntry,...Array.from({length:205},(_,i)=>({id:`entry-extra-${i}`,world_book_id:"world-book-1",comment:`location | Place ${i}`,key:[`place ${i}`],folder:i<200?"Early":"Late",tags:["location"],extensions:{}}))]
  const bookOffsets=[], entryOffsets=[]
  spindle.world_books.list=async options=>{assert.equal(options.userId,"user-1");bookOffsets.push(options.offset);return {data:books.slice(options.offset,options.offset+options.limit),total:books.length}}
  spindle.world_books.entries.list=async (id,options)=>{assert.equal(id,"world-book-1");assert.equal(options.userId,"user-1");entryOffsets.push(options.offset);return {data:records.slice(options.offset,options.offset+options.limit),total:records.length}}
  try {
    const big = (await request("get_visual_lore",{bookId:"world-book-1",entryId:"entry-extra-204"})).data
    assert.equal(big.books.length,205); assert.equal(big.entries.length,206)
    assert.deepEqual(bookOffsets,[0,200]);assert.deepEqual(entryOffsets,[0,200])
    assert.equal(big.selected.id,"entry-extra-204");assert.equal(big.selected.folder,"Late")
  } finally {spindle.world_books.list=listBooks;spindle.world_books.entries.list=listEntries}
}
// Restore fixture to avoid modifying later tagged-generation expectations.
visualLoreEntry.extensions = {}


console.log("backend contract: ok")

// Explicit render persistence stays independent from live profiles and stacks.
const defaultsSaved = await request('save_studio_defaults', { defaults: { version: 1, width: 832, steps: 26, cfg: 0, seed: 42, prompt: 'temporary' } })
assert.deepEqual(defaultsSaved.data.defaults, { version: 1, width: 832, steps: 26, cfg: 0 })
assert.deepEqual((await request('bootstrap')).data.renderSettings.defaults, defaultsSaved.data.defaults)
let renderSaved = await request('save_render_style', { style: { id: 'render-test', name: 'Soft', loraStackId: 'deleted-stack', recipe: { steps: 22, seed: 9 } } })
assert.equal(renderSaved.data.styles[0].loraStackId, 'deleted-stack')
assert.deepEqual(renderSaved.data.styles[0].recipe, { steps: 22 })
renderSaved = await request('save_render_style', { style: { ...renderSaved.data.styles[0], name: 'Renamed' } })
assert.equal(renderSaved.data.styles.length, 1)
assert.equal(renderSaved.data.styles[0].name, 'Renamed')
await request('save_render_style', { style: { ...renderSaved.data.styles[0], id: 'render-copy' } })
assert.equal((await request('bootstrap')).data.renderSettings.styles.length, 2)
assert.equal((await request('delete_render_style', { id: 'render-test' })).data.styles.length, 1)
await request('delete_render_style', { id: 'render-copy' })
assert.equal((await request('save_studio_defaults', { defaults: null })).data.defaults, null)
userFiles.set('studio-render-styles.json', [null, { id: 'bad' }])
userFiles.set('studio-defaults.json', 'invalid')
assert.deepEqual((await request('bootstrap')).data.renderSettings, { defaults: null, styles: [] })
console.log('render persistence contract: ok')

await request("set_tag_automation", { config: { requestMode: "inline", injectProtocol: true, protocolPrompt: "CUSTOM LEGACY PROTOCOL" } })
assert.match(macroValues.get("swarm_image_protocol"), /CUSTOM LEGACY PROTOCOL/)
assert.match(macroValues.get("swarm_image_protocol"), /output="url"/, "Saved custom protocols also expose the output contract")
assert.match(macroValues.get("swarm_image_protocol"), /Do not copy, imitate, or emit those markers/)
console.log("history-marker guidance survives saved custom protocols: ok")

// Stop must finish our wait even when preparation or the provider ignores abort.
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve}}
const bounded=async promise=>{let timeout;try{return await Promise.race([promise,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Cancellation did not release the waiter')),1000)})])}finally{clearTimeout(timeout)}}
const originalStream=spindle.imageGen.generateStream,originalGenerate=spindle.imageGen.generate,originalSetJson=spindle.userStorage.setJson
for(const phase of ['prepare','factory','next','legacy']) {
  const entered=deferred(),late=deferred(),id=`stop-${phase}`
  let calls=0
  spindle.imageGen.generateStream=()=>{calls++;if(phase==='factory'){entered.resolve();return late.promise}return {next(){entered.resolve();return late.promise}}}
  spindle.userStorage.setJson=async(file,...args)=>{if(phase==='prepare' && file==='studio-generation-profile.json'){entered.resolve();await late.promise}return originalSetJson.call(spindle.userStorage,file,...args)}
  if(phase==='legacy'){delete spindle.imageGen.generateStream;spindle.imageGen.generate=()=>{calls++;entered.resolve();return late.promise}}
  const running=frontendHandler({type:'generate',requestId:`request-${id}`,input:{connection_id:'swarm-1',clientJobId:id,model:'base.safetensors',prompt:'cancellation fixture',parameters:{}}},'user-1')
  await bounded(entered.promise)
  const ack=await request('interrupt_generation',{clientJobId:id,connectionId:'swarm-1'})
  assert.equal(ack.data.waitingStopped,true)
  assert.equal(ack.data.interrupted,true)
  await bounded(running)
  assert.ok(sent.some(entry=>entry.payload.type==='generation_interrupted' && entry.payload.clientJobId===id))
  const count=sent.filter(entry=>entry.payload.type==='generation_result' && entry.payload.clientJobId===id).length
  late.resolve(phase==='factory'?{next:async()=>({done:true,value:{imageId:'too-late'}})}:{done:true,value:{imageId:'too-late'}})
  await new Promise(resolve=>setTimeout(resolve,0))
  assert.equal(sent.filter(entry=>entry.payload.type==='generation_result' && entry.payload.clientJobId===id).length,count,'Late result must not complete a stopped job')
  if(phase==='prepare')assert.equal(calls,0,'A stopped preparation must never begin generation')
  spindle.imageGen.generateStream=originalStream;spindle.imageGen.generate=originalGenerate;spindle.userStorage.setJson=originalSetJson
}
const earlyId='stop-before-start'
await request('interrupt_generation',{clientJobId:earlyId,connectionId:'swarm-1'})
const beforeEarly=sent.length
await frontendHandler({type:'generate',requestId:'early-request',input:{connection_id:'swarm-1',clientJobId:earlyId,model:'base.safetensors',prompt:'fixture',parameters:{}}},'user-1')
assert.ok(sent.slice(beforeEarly).some(entry=>entry.payload.type==='generation_interrupted'))
assert.ok(!sent.slice(beforeEarly).some(entry=>entry.payload.type==='generation_started'),'Reordered Stop prevents preparation from starting')
console.log('stop during preparation, stalled stream creation/read, legacy generation and reordered requests: ok')

// Stop is durable even when the original controller has gone away.
const savedFixture=structuredClone(userFiles.get('tagged-image-jobs.json').find(job=>job.status==='ready'))
assert.ok(savedFixture)
const stoppedFixture={...savedFixture,id:'durable-stop',key:'durable-stop',clientJobId:'durable-attempt',status:'generating',inserted:false,imageId:'',imageUrl:''}
userFiles.get('tagged-image-jobs.json').push(stoppedFixture)
await request('interrupt_generation',{clientJobId:'durable-attempt'})
for(let i=0;i<2;i++){const snapshot=await request('list_tagged_jobs');assert.equal(snapshot.data.find(job=>job.id==='durable-stop').status,'cancelled','Leave/return does not revive a stopped job')}
const orphan={...stoppedFixture,id:'orphan',key:'orphan',clientJobId:'orphan-attempt',status:'generating'}
userFiles.get('tagged-image-jobs.json').push(orphan)
const recoveredJobs=await request('list_tagged_jobs')
assert.equal(recoveredJobs.data.find(job=>job.id==='orphan').status,'failed','Lost worker is recoverable failure rather than eternal loading')
assert.equal(recoveredJobs.data.find(job=>job.id===savedFixture.id).status,'ready','Completed images survive reconciliation')
// A public terminal stream event is enough, even if a subsequent read would stall.
let reads=0
spindle.imageGen.generateStream=()=>({next(){reads++;return reads===1?Promise.resolve({done:false,value:{type:'done',result:{imageId:'terminal-result',imageUrl:'/api/v1/image-gen/results/terminal-result'}}}):new Promise(()=>{})}})
await bounded(frontendHandler({type:'generate',requestId:'terminal-stream',input:{connection_id:'swarm-1',clientJobId:'terminal-stream',model:'base.safetensors',prompt:'fixture',parameters:{}}},'user-1'))
assert.equal(reads,1,'No read after terminal stream event')
assert.ok(sent.some(entry=>entry.payload.type==='generation_result' && entry.payload.clientJobId==='terminal-stream'))
spindle.imageGen.generateStream=originalStream
console.log('persistent Stop, orphaned job reconciliation and terminal stream events: ok')

// Stop after the bitmap completes, while optional metadata is still pending.
const savedCors=spindle.cors,metadataEntered=deferred(),metadataLate=deferred()
spindle.cors=async(url,...args)=>{if(String(url).endsWith('/API/ListImages')){metadataEntered.resolve();await metadataLate.promise}return savedCors.call(spindle,url,...args)}
spindle.imageGen.generateStream=()=>({next:async()=>({done:true,value:{imageId:'metadata-stopped',imageUrl:'/api/v1/image-gen/results/metadata-stopped'}})})
const metadataRun=frontendHandler({type:'tag_generate',requestId:'metadata-race',force:true,chatId:'chat-1',messageId:taggedMessage.id,fullMatch:'<swarm-image request="generate" slot="metadata-race">fixture</swarm-image>',attrs:{request:'generate',slot:'metadata-race',aspect:'4:3'},content:'fixture'},'user-1')
await bounded(metadataEntered.promise)
const metadataJob=userFiles.get('tagged-image-jobs.json').find(job=>job.slot==='metadata-race')
const activeSnapshot=await request('list_tagged_jobs')
assert.equal(activeSnapshot.data.find(job=>job.id===metadataJob.id).status,'generating','Recovery preserves a live worker')
const metadataAck=await request('interrupt_generation',{clientJobId:metadataJob.clientJobId})
assert.equal(metadataAck.data.interrupted,true,'Abort controller remains registered through postprocessing')
await bounded(metadataRun)
metadataLate.resolve();await new Promise(resolve=>setTimeout(resolve,0))
const cancelledSnapshot=await request('list_tagged_jobs')
assert.equal(cancelledSnapshot.data.find(job=>job.id===metadataJob.id).status,'cancelled','Late metadata cannot revive cancelled job')
assert.ok(!sent.some(entry=>entry.payload.type==='tagged_generation_result' && entry.payload.clientJobId===metadataJob.clientJobId))
spindle.cors=savedCors;spindle.imageGen.generateStream=originalStream
console.log('post-bitmap metadata Stop and late completion race: ok')

// Optional metadata cannot hold an otherwise finished generation indefinitely.
const normalTimeout=globalThis.setTimeout,timeoutCors=spindle.cors
globalThis.setTimeout=(callback,delay,...args)=>normalTimeout(callback,delay===8000?0:delay,...args)
spindle.cors=(url,...args)=>String(url).endsWith('/API/ListImages')?new Promise(()=>{}):timeoutCors.call(spindle,url,...args)
spindle.imageGen.generateStream=()=>({next:async()=>({done:true,value:{imageId:'metadata-timeout',imageUrl:'/api/v1/image-gen/results/metadata-timeout'}})})
try {
 await bounded(frontendHandler({type:'generate',requestId:'metadata-timeout',input:{connection_id:'swarm-1',clientJobId:'metadata-timeout',model:'base.safetensors',prompt:'fixture',parameters:{}}},'user-1'))
 assert.ok(sent.some(entry=>entry.payload.type==='generation_result' && entry.payload.clientJobId==='metadata-timeout'),'Metadata timeout uses safe measured fallback')
} finally {globalThis.setTimeout=normalTimeout;spindle.cors=timeoutCors;spindle.imageGen.generateStream=originalStream}
console.log('optional metadata deadline preserves final image: ok')

// URL-only output owns the generated URL; the caller owns all presentation.
await request('set_tag_automation', {config:{autoGenerate:true,requestMode:'inline',injectProtocol:true,protocolPrompt:''}})
assert.match(macroValues.get('swarm_image_protocol'), /output="url"/)
const urlInputs=[]
let urlSequence=0
spindle.imageGen.generateStream=async function* (input) {
  urlInputs.push(structuredClone({...input,signal:undefined}))
  const imageId=`url-result-${++urlSequence}`
  return {imageId,imageUrl:`/api/v1/image-gen/results/${imageId}`}
}
const urlTag='<swarm-image request="generate" output="url" slot="broadcast" aspect="16:9" alt="Harbor">harbor at dusk</swarm-image>'
const inlineTag='<swarm-image request="generate" slot="ordinary" aspect="4:3">ordinary portrait</swarm-image>'
const authoredPrefix='<section class="television"><header>Evening news</header><img class="photo" alt="Harbor" src=\''
const authoredSuffix='\'><footer>Live</footer></section>'
const urlMessage={id:'url-authored',role:'assistant',content:authoredPrefix+urlTag+authoredSuffix+inlineTag,metadata:{caller:'preserved'}}
taggedMessages.push(urlMessage)
const submitUrl=async(message,fullMatch=urlTag,extra={})=> {
  const attrs=Object.fromEntries([...fullMatch.matchAll(/([\w-]+)="([^"]*)"/g)].map(match=>[match[1],match[2]]))
  const content=fullMatch.slice(fullMatch.indexOf('>')+1,fullMatch.lastIndexOf('</swarm-image>'))
  await frontendHandler({type:'tag_generate',requestId:`url-request-${sent.length}`,force:true,chatId:'chat-1',messageId:message.id,fullMatch,attrs,content,...extra},'user-1')
  return userFiles.get('tagged-image-jobs.json').find(job=>job.fullMatch===fullMatch && job.messageId===message.id)
}
let urlJob=await submitUrl(urlMessage)
assert.equal(urlJob.status,'ready')
assert.equal(urlJob.output,'url')
assert.equal(urlJob.inserted,true)
assert.equal(urlMessage.content,authoredPrefix+urlJob.imageUrl+authoredSuffix+inlineTag)
assert.equal(urlMessage.metadata.caller,'preserved')
assert.equal(urlMessage.metadata.swarm_studio_tagged_images[0].output,'url')
assert.doesNotMatch(urlMessage.content, /<figure|data-swarm-studio|style=/)
assert.equal(urlInputs[0].parameters.width > urlInputs[0].parameters.height,true)
const inlineJob=await submitUrl(urlMessage,inlineTag)
assert.equal(inlineJob.output,'inline','Existing requests retain Studio rendering')
assert.ok(urlMessage.content.startsWith(authoredPrefix+urlJob.imageUrl+authoredSuffix+'<figure'))
assert.equal(urlMessage.metadata.swarm_studio_tagged_images.length,2)
const beforeDuplicate=urlSequence
await submitUrl(urlMessage,urlTag,{force:false})
assert.equal(urlSequence,beforeDuplicate,'Repeated deliveries attach the same URL without regenerating')
assert.equal((urlMessage.content.match(/class="photo"/g)||[]).length,1)
const oldUrl=urlJob.imageUrl
await frontendHandler({type:'retry_tagged_job',requestId:'url-retry',jobId:urlJob.id,retryMode:'original'},'user-1')
urlJob=userFiles.get('tagged-image-jobs.json').find(job=>job.id===urlJob.id)
assert.equal(urlJob.output,'url')
assert.notEqual(urlJob.imageUrl,oldUrl)
assert.ok(urlMessage.content.startsWith(authoredPrefix+urlJob.imageUrl+authoredSuffix+'<figure'))
assert.equal(urlMessage.content.includes(oldUrl),false,'Retry replaces the previous URL instead of appending another image')
const restoredUrlJob=(await request('list_tagged_jobs')).data.find(job=>job.id===urlJob.id)
assert.equal(restoredUrlJob.output,'url','Persisted/public jobs retain their output contract')
const removedUrl=await request('remove_tagged_image_from_chat',{jobId:urlJob.id})
assert.ok(removedUrl.data.content.startsWith(authoredPrefix+authoredSuffix+'<figure'))
assert.equal(urlMessage.metadata.swarm_studio_tagged_images.length,1)
assert.equal(urlMessage.metadata.swarm_studio_tagged_images[0].jobId,inlineJob.id)

// Plain URLs, Markdown destinations, remapped message IDs, and safe removal.
for (const [id,prefix,suffix] of [['url-plain','',''],['url-markdown','![Harbor](',')']]) {
  const message={id,role:'assistant',content:prefix+urlTag+suffix,metadata:{}}
  taggedMessages.push(message)
  const job=await submitUrl(message,urlTag,{messageId:`streaming-${id}`})
  const saved=userFiles.get('tagged-image-jobs.json').find(item=>item.slot==='broadcast' && item.messageId===id)
  assert.ok(saved)
  assert.equal(saved.output,'url')
  assert.equal(message.content,prefix+saved.imageUrl+suffix)
  if(id==='url-plain') {
    message.content+=` ${saved.imageUrl}`
    const unchanged=message.content
    const requestId='ambiguous-url-removal'
    await frontendHandler({type:'remove_tagged_image_from_chat',requestId,jobId:saved.id},'user-1')
    assert.equal(sent.find(entry=>entry.payload.requestId===requestId).payload.type,'studio_error')
    assert.equal(message.content,unchanged,'Ambiguous URLs must not remove another image')
    message.content=`${saved.imageUrl}-edited`
    await frontendHandler({type:'remove_tagged_image_from_chat',requestId:'edited-url-removal',jobId:saved.id},'user-1')
    assert.equal(sent.find(entry=>entry.payload.requestId==='edited-url-removal').payload.type,'studio_error')
    assert.equal(message.content,`${saved.imageUrl}-edited`,'A saved URL must not match only the prefix of an edited URL')
  }
}

// Parser output attributes are owned by the original request, even if the model omits them.
await request('set_tag_automation',{config:{requestMode:'parser',injectProtocol:true,autoGenerate:true}})
assert.match(macroValues.get('swarm_image_protocol'),/output="url"/)
assert.doesNotMatch(macroValues.get('swarm_image_protocol'),/request="generate"/)
const parserUrlTag=urlTag.replace('request="generate"','request="parse"')
const parserUrlMessage={id:'url-parser',role:'assistant',content:authoredPrefix+parserUrlTag+authoredSuffix,metadata:{}}
taggedMessages.push(parserUrlMessage)
eventHandlers.get('GENERATION_ENDED')({generationId:'url-parser-generation',chatId:'chat-1',messageId:parserUrlMessage.id,content:parserUrlMessage.content},'user-1')
for(let i=0;i<200 && !parserUrlMessage.metadata?.swarm_studio_tagged_images?.length;i++)await new Promise(resolve=>setTimeout(resolve,2))
const parsedUrlJob=userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===parserUrlMessage.id)
assert.equal(parsedUrlJob?.status,'ready')
assert.equal(parsedUrlJob.output,'url')
assert.equal(parserUrlMessage.content,authoredPrefix+parsedUrlJob.imageUrl+authoredSuffix)
assert.match(quietParserCalls.at(-1).messages[0].content,/alt, and output attributes exactly/)
// Actual provider dispatch of grouped ensemble count, not just helper output.
await request('set_tag_automation',{config:{requestMode:'inline',promptFamily:'anima',countStrength:1.5}})
const trioTag='<swarm-image request="generate" slot="weighted-trio" character="active" persona="none" count="2boys, 1girl">quality/meta: masterpiece, safe\nvisible count: 2boys, 1girl\nscene: three friends around a table\ncamera: wide shot\nleft man [other]: white hair\ncenter man [other]: blond hair\nright woman [other]: pink skin, yellow horns\nenvironment: izakaya</swarm-image>'
const trioMessage={id:'weighted-trio-dispatch',role:'assistant',content:trioTag,metadata:{}}
taggedMessages.push(trioMessage)
const trioJob=await submitUrl(trioMessage,trioTag)
assert.equal(trioJob.status,'ready',trioJob.error)
assert.equal((urlInputs.at(-1).prompt.match(/\(2boys, 1girl:1\.5\)/g)||[]).length,1,urlInputs.at(-1).prompt)
assert.ok(trioJob.compilerDiagnostics.some(d=>d.includes('Explicit count:')))
// The inspector body can be correct while an unquoted attribute gets truncated.
for(const [slot,attribute,expected] of [['recovered-trio','count=2boys, 1girl',true],['recovered-five','count="5"',true],['count-omitted','',false],['count-conflict','count="1boy, 2girls"',false]]){
 let tag=trioTag.replace('weighted-trio',slot).replace('count="2boys, 1girl"',attribute)
 if(slot==='recovered-five')tag=tag.replace('visible count: 2boys, 1girl','visible count: 4boys, 1girl').replace('left man [other]','left foreground man [other]').replace('center man [other]','left midground man [other]').replace('right woman [other]','right foreground woman [other]').replace('environment: izakaya','right midground man [other]: red hair\nright background man [other]: black hair\nenvironment: izakaya')
 const message={id:slot+'-dispatch',role:'assistant',content:tag,metadata:{}}
 taggedMessages.push(message)
 const job=await submitUrl(message,tag);assert.equal(job.status,'ready',job.error)
 const weight=slot==='recovered-five'?'(4boys, 1girl:1.5)':'(2boys, 1girl:1.5)'
 assert.equal(urlInputs.at(-1).prompt.includes(weight),expected,slot)
 if(expected)assert.ok(job.compilerDiagnostics.some(d=>d.includes('Recovered malformed count attribute')),slot)
 if(slot==='recovered-five')assert.ok(!job.compilerDiagnostics.some(d=>d.includes('share a horizontal anchor')))
}
// Parser completion must retain a malformed original opt-in, not the parser's own attribute.
await request('set_tag_automation',{config:{requestMode:'parser',promptFamily:'anima',countStrength:1.5,autoGenerate:true,injectProtocol:true}})
{
 const previous=spindle.generate.quiet
 const tag=trioTag.replace('weighted-trio','parser-recovered-count').replace('request="generate"','request="parse"').replace('count="2boys, 1girl"','count="3"')
 const completed=trioTag.replace('weighted-trio','parser-recovered-count').replace('count="2boys, 1girl"','count="1boy"')
 const message={id:'parser-recovered-count',role:'assistant',content:tag,metadata:{}};taggedMessages.push(message)
 try {
  spindle.generate.quiet=async()=>({content:completed})
  eventHandlers.get('GENERATION_ENDED')({generationId:message.id,chatId:'chat-1',messageId:message.id,content:tag},'user-1')
  for(let i=0;i<200&&!message.metadata?.swarm_studio_tagged_images?.length;i++)await new Promise(resolve=>setTimeout(resolve,5))
  const job=userFiles.get('tagged-image-jobs.json').find(j=>j.messageId===message.id)
  assert.equal(job?.status,'ready',job?.error);assert.match(job.fullMatch,/count="3"/)
  assert.match(urlInputs.at(-1).prompt,/\(2boys, 1girl:1\.5\)/);assert.ok(job.compilerDiagnostics.some(d=>d.includes('Recovered malformed count attribute')))
 }finally{spindle.generate.quiet=previous}
}
await request('set_tag_automation',{config:{requestMode:'parser',promptFamily:'auto'}})
// Automatic generation disabled: only the server requests manual approval.
await request('set_tag_automation',{config:{autoGenerate:false}})
const manualTag=urlTag.replace('slot="broadcast"','slot="manual-background"')
const manualMessage={id:'manual-background',role:'assistant',content:manualTag,metadata:{}}
taggedMessages.push(manualMessage)
const beforeManual=urlSequence
let manualJob=await submitUrl(manualMessage,manualTag,{force:false})
assert.equal(manualJob.status,'requested')
assert.equal(urlSequence,beforeManual,'Manual requests do not spend generation work')
const forceStart=sent.length
manualJob=await submitUrl(manualMessage,manualTag)
assert.equal(manualJob.status,'ready')
assert.equal(manualJob.inserted,true)
assert.equal(sent.slice(forceStart).some(entry=>entry.payload.type==='tagged_image_job' && entry.payload.data?.status==='requested'),false,'Explicit Generate runs quietly after approval')
// A restarted backend resumes a saved ready job without generating it again.
const resumedFixture=structuredClone(manualJob)
resumedFixture.inserted=false
resumedFixture.error=''
manualMessage.content=manualTag
manualMessage.metadata={}
userFiles.set('tagged-image-jobs.json',userFiles.get('tagged-image-jobs.json').map(job=>job.id===resumedFixture.id?resumedFixture:job))
const beforeResume=urlSequence
await request('list_tagged_jobs')
for(let i=0;i<100 && manualMessage.content.includes('<swarm-image');i++)await new Promise(resolve=>setTimeout(resolve,2))
assert.equal(manualMessage.content,resumedFixture.imageUrl,'Foreground recovery resumes background attachment')
assert.equal(urlSequence,beforeResume,'Attachment recovery never regenerates the bitmap')
// Foreground recovery can arrive while a queued job is still being persisted.
const queuedEntered=deferred(),queuedRelease=deferred(),beforeQueuedSet=spindle.userStorage.setJson
const queuedTag=urlTag.replace('slot="broadcast"','slot="queued-background"')
const queuedMessage={id:'queued-background',role:'assistant',content:queuedTag,metadata:{}}
taggedMessages.push(queuedMessage)
let heldQueued=false
spindle.userStorage.setJson=async(file,value,...args)=> {
 const result=await beforeQueuedSet.call(spindle.userStorage,file,value,...args)
 if(!heldQueued && file==='tagged-image-jobs.json' && value.some(job=>job.slot==='queued-background' && job.status==='queued')) {
  heldQueued=true;queuedEntered.resolve();await queuedRelease.promise
 }
 return result
}
try {
 const queuedRun=submitUrl(queuedMessage,queuedTag)
 await bounded(queuedEntered.promise)
 const queuedSnapshot=await request('list_tagged_jobs')
 assert.equal(queuedSnapshot.data.find(job=>job.slot==='queued-background').status,'queued','An in-flight request is not mistaken for a lost worker')
 queuedRelease.resolve()
 assert.equal((await bounded(queuedRun)).inserted,true)
} finally {queuedRelease.resolve();spindle.userStorage.setJson=beforeQueuedSet}
spindle.imageGen.generateStream=originalStream
console.log('URL output: authored HTML, plain URL, Markdown, parser, retry, duplicate delivery, persistence, remapping and removal: ok')

{
  const previousGet = spindle.images.get
  const replacement = { id: "library-replacement", url: "/api/v1/images/library-replacement", original_filename: "replacement.png" }
  spindle.images.get = async (id, options) => {
    assert.equal(options.onlyOwned, true)
    assert.equal(options.specificity, "full")
    assert.equal(options.userId, "user-1")
    if (id === replacement.id) return replacement
    if (id === parsedUrlJob.imageId) return { id, url: parsedUrlJob.imageUrl }
    return null
  }
  try {
    const source = await request("load_inline_edit_source", { jobId: parsedUrlJob.id, imageId: parsedUrlJob.imageId })
    assert.equal(source.data.id, parsedUrlJob.imageId)
    assert.equal(source.data.url, parsedUrlJob.imageUrl)
    assert.ok(source.data.details?.prompt)

    for (const recorded of [parsedUrlJob, inlineJob]) {
      const message = taggedMessages.find(item => item.id === recorded.messageId)
      const before = message.content
      const replace = (imageId = recorded.imageId, replacementId = replacement.id) => request("select_inline_variant", {
        action: "replace", jobId: recorded.id, imageId, replacementId,
      })
      await assert.rejects(() => replace(recorded.imageId, "not-owned"), /Lumiverse-owned/)
      assert.equal(message.content, before)
      if (recorded.output === "url") {
        message.content += " " + recorded.imageUrl
        await assert.rejects(() => replace(), /ambiguous/)
        assert.equal(message.content, before + " " + recorded.imageUrl)
        message.content = before
      }
      await replace()
      const stored = message.metadata.swarm_studio_tagged_images.find(item => item.jobId === recorded.id)
      assert.equal(stored.imageId, replacement.id)
      assert.equal(stored.imageUrl, replacement.url)
      assert.equal(stored.output, recorded.output)
      assert.equal(message.content, before.replace(recorded.imageUrl, replacement.url))
      await assert.rejects(() => replace(), /currently attached/)
      const refreshed = (await request("list_tagged_jobs")).data.find(item => item.id === recorded.id)
      assert.equal(refreshed.imageId, replacement.id)
      assert.equal(refreshed.draftImageId, "")
      assert.equal(refreshed.finalImageId, "")
    }
  } finally { spindle.images.get = previousGet }
}
console.log("inline replacement: owned image, authored URL preservation, stale attachment checks and refreshed job state: ok")

// A failed Quick Create regeneration must not revoke tools for a surviving
// committed image. Exercise real request dispatch and legacy snapshot recovery.
{
  const stream = spindle.imageGen.generateStream, get = spindle.images.get
  let sequence = 0
  try {
    for (const output of ['inline','url']) {
      const tag = `<swarm-image request="generate" slot="retry-retain-${output}" output="${output}">portrait</swarm-image>`
      const message = {id:`retry-retain-${output}`,role:'assistant',content:tag,metadata:{}}
      taggedMessages.push(message)
      spindle.imageGen.generateStream = async function* () {const imageId=`retained-${++sequence}`; return {imageId,imageUrl:`/api/v1/images/${imageId}`}}
      const initial = structuredClone(await submitUrl(message,tag))
      assert.equal(initial.inserted,true)
      const committed = message.content
      spindle.imageGen.generateStream = async function* () {throw Error('Fixture retry failed')}
      await frontendHandler({type:'retry_tagged_job',requestId:`failed-retry-${output}`,jobId:initial.id,retryMode:'current',promptOverride:'new portrait'},'user-1')
      const persisted = userFiles.get('tagged-image-jobs.json').find(job=>job.id===initial.id)
      assert.equal(persisted.status,'ready');assert.equal(persisted.inserted,true);assert.equal(persisted.imageId,initial.imageId)
      assert.match(persisted.error,/Fixture retry failed/);assert.equal(message.content,committed)
      const legacy = {...persisted,status:'failed',inserted:false,imageId:'uncommitted-result',imageUrl:'/api/v1/images/uncommitted-result',draftImage:undefined,finalImage:undefined}
      userFiles.set('tagged-image-jobs.json',userFiles.get('tagged-image-jobs.json').map(job=>job.id===initial.id?structuredClone(legacy):job))
      const snapshot=await request('list_tagged_jobs')
      const recovered=snapshot.data.find(job=>job.id===initial.id)
      assert.equal(recovered.status,'ready');assert.equal(recovered.inserted,true);assert.equal(recovered.imageId,initial.imageId)
      assert.equal(userFiles.get('tagged-image-jobs.json').find(job=>job.id===initial.id).status,'failed','Legacy snapshot recovery is read only')
      spindle.images.get=async(id,options)=>{
        if(id===initial.imageId||id==='retained-replacement')return {id,url:`/api/v1/images/${id}`}
        return get(id,options)
      }
      const edit=await request('load_inline_edit_source',{jobId:initial.id,imageId:initial.imageId})
      assert.equal(edit.data.id,initial.imageId)
      await assert.rejects(()=>request('load_inline_edit_source',{jobId:initial.id,imageId:legacy.imageId}),/currently attached/)
      message.content=committed.replace(initial.imageUrl,'/api/v1/images/unrelated')
      const mismatched=(await request('list_tagged_jobs')).data.find(job=>job.id===initial.id)
      assert.equal(mismatched.status,'failed','Marker alone cannot establish an attachment')
      await assert.rejects(()=>request('load_inline_edit_source',{jobId:initial.id,imageId:initial.imageId}),/currently attached/)
      message.content=committed+committed
      assert.equal((await request('list_tagged_jobs')).data.find(job=>job.id===initial.id).inserted,false,'Ambiguous attachment is not recovered')
      message.content=committed
      await request('select_inline_variant',{jobId:initial.id,imageId:initial.imageId,action:'replace',replacementId:'retained-replacement'})
      assert.equal(message.content,committed.replace(initial.imageUrl,'/api/v1/images/retained-replacement'))
      assert.equal(userFiles.get('tagged-image-jobs.json').find(job=>job.id===initial.id).inserted,true)
    }
  } finally {spindle.imageGen.generateStream=stream;spindle.images.get=get}
}
console.log('inline retry attachment recovery: live failed rerender, legacy job, exact source verification, ambiguity, edit and replacement: ok')


// A message can be swiped while its image or quiet parser is still running.
await request('set_tag_automation',{config:{autoGenerate:true,requestMode:'inline'}})
const beforeSwipeStream=spindle.imageGen.generateStream
let swipeSequence=0,swipeEntered=deferred(),swipeRelease=deferred(),holdSwipe=true
spindle.imageGen.generateStream=async function* () {
 if(holdSwipe){swipeEntered.resolve();await swipeRelease.promise}
 const imageId=`swipe-result-${++swipeSequence}`
 return {imageId,imageUrl:`/api/v1/image-gen/results/${imageId}`}
}
const swipeTag=urlTag.replace('slot="broadcast"','slot="swipe-source"')
const otherSwipe='Alternative answer: no illustration requested.'
const swipeMessage={id:'swipe-background',role:'assistant',content:swipeTag,swipe_id:0,swipes:[swipeTag,otherSwipe],metadata:{unrelated:true}}
taggedMessages.push(swipeMessage)
const swipeRun=submitUrl(swipeMessage,swipeTag)
await bounded(swipeEntered.promise)
swipeMessage.swipe_id=1;swipeMessage.content=otherSwipe
swipeRelease.resolve()
const swipeJob=await bounded(swipeRun)
assert.equal(swipeJob.swipeId,0)
assert.equal(swipeJob.inserted,true)
assert.equal(swipeMessage.content,otherSwipe,'Background completion never moves or overwrites the selected swipe')
assert.equal(swipeMessage.swipes[0],swipeJob.imageUrl,'The image is saved on its owning alternative')
assert.equal(swipeMessage.swipe_id,1)
assert.equal(swipeMessage.metadata.unrelated,true)
await request('remove_tagged_image_from_chat',{jobId:swipeJob.id})
assert.equal(swipeMessage.swipes[0],'')
assert.equal(swipeMessage.content,otherSwipe,'Removal also preserves the selected alternative')

// Identical requests on two alternatives must own separate jobs and images.
holdSwipe=false
const twinMessage={id:'swipe-twins',role:'assistant',content:swipeTag,swipe_id:0,swipes:[swipeTag,swipeTag],metadata:{}}
taggedMessages.push(twinMessage)
const twinA=await submitUrl(twinMessage,swipeTag,{swipeId:0})
twinMessage.swipe_id=1;twinMessage.content=twinMessage.swipes[1]
const twinB=await submitUrl(twinMessage,swipeTag,{swipeId:1})
assert.notEqual(twinA.id,twinB.id)
assert.notEqual(twinA.imageUrl,twinB.imageUrl)
assert.deepEqual(twinMessage.swipes,[twinA.imageUrl,twinB.imageUrl])

// Editing away a request must not redirect its late bitmap to another message
// or to a newly authored request which happens to reuse the same slot.
const deletedTag=swipeTag.replace('slot="swipe-source"','slot="edited-source"')
const editedMessage={id:'edited-background',role:'assistant',content:deletedTag,metadata:{}}
taggedMessages.push(editedMessage)
swipeEntered=deferred();swipeRelease=deferred();holdSwipe=true
const editedRun=submitUrl(editedMessage,deletedTag)
await bounded(swipeEntered.promise)
const changedTag=deletedTag.replace('harbor at dusk','a different scene')
editedMessage.content=changedTag
const copiedMessage={id:'copied-source',role:'assistant',content:deletedTag,metadata:{}}
taggedMessages.push(copiedMessage)
const swipeTimeout=globalThis.setTimeout
globalThis.setTimeout=(fn,delay,...args)=>swipeTimeout(fn,delay>=250 && delay!==1000?0:delay,...args)
swipeRelease.resolve()
try {
 const editedJob=await bounded(editedRun)
 assert.equal(editedJob.inserted,false)
 assert.match(editedJob.error,/attachment|attach/)
 assert.equal(editedMessage.content,changedTag,'Changed requests stay untouched')
 assert.equal(copiedMessage.content,deletedTag,'Another matching message cannot steal the result')
} finally {globalThis.setTimeout=swipeTimeout;holdSwipe=false}

// Quiet parser completion performs the same source-bound merge.
await request('set_tag_automation',{config:{requestMode:'parser',injectProtocol:true,autoGenerate:true}})
const beforeQuiet=spindle.generate.quiet,quietSwipeEntered=deferred(),quietSwipeRelease=deferred()
spindle.generate.quiet=async()=>{quietSwipeEntered.resolve();await quietSwipeRelease.promise;return {content:swipeTag}}
const quietTag=swipeTag.replace('request="generate"','request="parse"')
const quietMessage={id:'parser-swipe-background',role:'assistant',content:quietTag,swipe_id:0,swipes:[quietTag,otherSwipe],metadata:{}}
taggedMessages.push(quietMessage)
eventHandlers.get('GENERATION_ENDED')({generationId:'parser-swipe',chatId:'chat-1',messageId:quietMessage.id,content:quietTag},'user-1')
await bounded(quietSwipeEntered.promise)
quietMessage.swipe_id=1;quietMessage.content=otherSwipe
quietSwipeRelease.resolve()
for(let i=0;i<200 && !quietMessage.swipes[0].startsWith('/api/');i++)await new Promise(resolve=>setTimeout(resolve,2))
assert.match(quietMessage.swipes[0],/^\/api\/v1\/image-gen\/results\/swipe-result-/)
assert.equal(quietMessage.content,otherSwipe)
assert.equal(quietMessage.swipe_id,1)
spindle.generate.quiet=beforeQuiet
// A bitmap can beat the text commit; only a saved reply may bind its swipe.
const streamedTag=swipeTag.replace('slot="swipe-source"','slot="streamed-source"')
const streamedMessage={id:'streamed-background',role:'assistant',content:otherSwipe,swipe_id:0,swipes:[otherSwipe,streamedTag],metadata:{}}
taggedMessages.push(streamedMessage)
const streamedRun=submitUrl(streamedMessage,streamedTag,{isStreaming:true})
let streamedReady
for(let i=0;i<200;i++) {
 streamedReady=userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===streamedMessage.id && job.status==='ready')
 if(streamedReady)break
 await new Promise(resolve=>setTimeout(resolve,2))
}
assert.ok(streamedReady)
assert.equal(streamedMessage.swipes[1],streamedTag,'Fast image completion waits for the saved text source')
eventHandlers.get('GENERATION_ENDED')({generationId:'streamed-source-done',chatId:'chat-1',messageId:streamedMessage.id,content:streamedTag},'user-1')
const streamedJob=await bounded(streamedRun)
assert.equal(streamedJob.swipeId,1)
assert.equal(streamedJob.inserted,true)
assert.equal(streamedMessage.content,otherSwipe)
assert.equal(streamedMessage.swipes[1],streamedJob.imageUrl)
const beforeStreamedReplay=swipeSequence
await submitUrl(streamedMessage,streamedTag,{force:false})
assert.equal(swipeSequence,beforeStreamedReplay,'Replaying a completed swipe request without a visible source tag never regenerates')
// Streaming fallback uses generation identity before the native reply exists.
// Two completed images must survive concurrent writes and attach to the exact
// saved alternative, even when the terminal event precedes the native read.
await request('set_tag_automation',{config:{requestMode:'inline',autoGenerate:true,autoFinalizeInline:false}})
const gRace='two-cg-stream', tempOwner={id:'inline-stream:'+gRace}
const raceTagA=swipeTag.replace('swipe-source','race-first')
const raceTagB=inlineTag.replace('ordinary','race-second')
const raceContent='Before. '+raceTagA+' Between. '+raceTagB+' After.'
const raceStart=swipeSequence
const raceRuns=Promise.all([submitUrl(tempOwner,raceTagA,{force:false,isStreaming:true,generationId:gRace,swipeId:1}),submitUrl(tempOwner,raceTagB,{force:false,isStreaming:true,generationId:gRace,swipeId:1})])
const raceJobs=()=>userFiles.get('tagged-image-jobs.json').filter(job=>job.generationId===gRace)
async function waitRace(predicate,label){for(let i=0;i<500;i++){if(predicate())return;await new Promise(r=>setTimeout(r,10))}assert.fail(label)}
await waitRace(()=>raceJobs().length===2&&raceJobs().every(j=>j.status==='ready'),'Both images generated while the LLM was still streaming')
assert.equal(swipeSequence,raceStart+2)
assert.ok(raceJobs().every(j=>!j.inserted&&j.awaitingSource))
const raceTerminal={generationId:gRace,chatId:'chat-1',messageId:'race-final',content:raceContent,swipeId:1}
eventHandlers.get('GENERATION_ENDED')(raceTerminal,'user-1')
const raceSettlement=frontendHandler({type:'settle_tagged_generation',requestId:'race-settle',...raceTerminal},'user-1')
await new Promise(r=>setTimeout(r,50))
const raceMessage={id:'race-final',role:'assistant',content:otherSwipe,swipe_id:0,swipes:[otherSwipe,raceContent],metadata:{keep:'yes'}}
taggedMessages.push(raceMessage)
await waitRace(()=>raceJobs().length===2&&raceJobs().every(j=>j.inserted),'Both CGs attached after delayed native save')
await raceRuns;await raceSettlement
const [raceA,raceB]=[raceTagA,raceTagB].map(tag=>raceJobs().find(j=>j.fullMatch===tag))
assert.equal(raceMessage.content,otherSwipe)
assert.ok(raceMessage.swipes[1].startsWith('Before. '+raceA.imageUrl+' Between. <figure'))
assert.ok(raceMessage.swipes[1].includes(raceB.imageUrl)&&raceMessage.swipes[1].endsWith(' After.'))
assert.equal(raceMessage.metadata.swarm_studio_tagged_images.length,2)
assert.equal(raceMessage.metadata.keep,'yes')
assert.ok(raceJobs().every(j=>j.messageId===raceMessage.id&&j.swipeId===1))
assert.ok(sent.some(e=>e.payload.type==='tagged_message_reconciled'&&e.payload.data.messageId===raceMessage.id&&e.payload.data.previousContent===raceContent))
await submitUrl(raceMessage,raceTagA,{force:false,generationId:gRace,swipeId:1})
assert.equal(swipeSequence,raceStart+2,'Native interceptor replay cannot launch a third image')
// Terminal proof can arrive before the queued job is persisted at all.
const earlyTag=swipeTag.replace('swipe-source','early-proof'),earlyGen='early-proof-stream'
const earlyMessage={id:'early-proof-final',role:'assistant',content:earlyTag,swipe_id:0,swipes:[earlyTag],metadata:{}}
taggedMessages.push(earlyMessage)
await frontendHandler({type:'settle_tagged_generation',requestId:'early-proof',generationId:earlyGen,chatId:'chat-1',messageId:earlyMessage.id,content:earlyTag,swipeId:0},'user-1')
await submitUrl({id:'inline-stream:'+earlyGen},earlyTag,{force:false,isStreaming:true,generationId:earlyGen,swipeId:0})
assert.ok(userFiles.get('tagged-image-jobs.json').some(j=>j.generationId===earlyGen&&j.inserted&&j.messageId===earlyMessage.id))
assert.match(earlyMessage.content,/swipe-result-/)
// A long reply can outlive the whole ordinary attachment retry budget.
const longGen='long-reply-stream',longTag=swipeTag.replace('swipe-source','long-reply'),longOwner={id:'inline-stream:'+longGen}
const longTimeout=globalThis.setTimeout
let longJob
try {
 globalThis.setTimeout=(fn,delay,...args)=>longTimeout(fn,delay>=250&&delay!==1000?0:delay,...args)
 longJob=await bounded(submitUrl(longOwner,longTag,{force:false,isStreaming:true,generationId:longGen,swipeId:0}))
} finally {globalThis.setTimeout=longTimeout}
assert.equal(longJob.status,'ready');assert.equal(longJob.inserted,false);assert.equal(longJob.error,'')
// The first alternative may be represented by content alone, without swipes.
const longMessage={id:'long-reply-final',role:'assistant',content:longTag,metadata:{}}
taggedMessages.push(longMessage)
const beforeLongAttach=swipeSequence
await frontendHandler({type:'settle_tagged_generation',requestId:'long-proof',generationId:longGen,chatId:'chat-1',messageId:longMessage.id,content:longTag,swipeId:0},'user-1')
await waitRace(()=>userFiles.get('tagged-image-jobs.json').some(j=>j.generationId===longGen&&j.inserted),'Late terminal event resumes saved image')
assert.equal(longMessage.content,longJob.imageUrl);assert.equal(swipeSequence,beforeLongAttach)
// A second owner notification carrying the same generation cannot dispatch a
// duplicate while the first request is still being stored.
const repeatGen='parallel-replay',repeatTag=swipeTag.replace('swipe-source','parallel-replay')
const repeatMessage={id:'repeat-final',role:'assistant',content:repeatTag,swipe_id:0,swipes:[repeatTag],metadata:{}}
taggedMessages.push(repeatMessage)
const repeatBefore=swipeSequence
const repeatRuns=Promise.all([submitUrl({id:'inline-stream:'+repeatGen},repeatTag,{force:false,isStreaming:true,generationId:repeatGen}),submitUrl(repeatMessage,repeatTag,{force:false,isStreaming:true,generationId:repeatGen})])
await waitRace(()=>userFiles.get('tagged-image-jobs.json').some(j=>j.generationId===repeatGen&&j.status==='ready'),'First replay request ready')
await frontendHandler({type:'settle_tagged_generation',requestId:'repeat-proof',generationId:repeatGen,chatId:'chat-1',messageId:repeatMessage.id,content:repeatTag,swipeId:0},'user-1')
await repeatRuns
assert.equal(swipeSequence,repeatBefore+1)
assert.equal(userFiles.get('tagged-image-jobs.json').filter(j=>j.generationId===repeatGen).length,1)
// Adversarial mixed transport: early token, reordered attribute interceptor,
// unscoped final callback BEFORE terminal proof, same body in two slots,
// conflicting same-slot replay, and repeated notifications AFTER attachment.
{
 const gen='slot-authority-race', owner={id:'inline-stream:'+gen}
 const tagOne=swipeTag.replace('swipe-source','authority-one')
 const tagTwo=swipeTag.replace('swipe-source','authority-two')
 const formatted=tagOne.replace('request="generate" output="url"','output="url"   request="generate"')
 assert.notEqual(formatted,tagOne)
 const finalText=formatted+' Between. '+tagTwo
 const msg={id:'authority-final',role:'assistant',content:otherSwipe,swipe_id:0,swipes:[otherSwipe,finalText],metadata:{}}
 const before=swipeSequence
 const first=submitUrl(owner,tagOne,{force:false,isStreaming:true,generationId:gen,swipeId:1})
 await waitRace(()=>userFiles.get('tagged-image-jobs.json').some(j=>j.generationId===gen&&j.status==='ready'),'First render precedes final text')
 taggedMessages.push(msg)
 await submitUrl(msg,formatted,{force:false,swipeId:1}) // no generation ID yet
 await submitUrl(msg,formatted,{force:false,isStreaming:true,generationId:gen,swipeId:1})
 await submitUrl(msg,tagOne.replace('harbor at dusk','conflicting scene'),{force:false,isStreaming:true,generationId:gen,swipeId:1})
 assert.equal(swipeSequence,before+1,'Mixed deliveries may not spend a second render for a reserved slot')
 const second=submitUrl(owner,tagTwo,{force:false,isStreaming:true,generationId:gen,swipeId:1})
 await waitRace(()=>userFiles.get('tagged-image-jobs.json').filter(j=>j.generationId===gen&&j.status==='ready').length===2,'A distinct slot with identical prompt still renders')
 const update=spindle.chat.updateMessage;let mutations=0
 spindle.chat.updateMessage=async(...args)=>{if(args[1]===msg.id)mutations++;return update.apply(spindle.chat,args)}
 try {
  const terminal={generationId:gen,chatId:'chat-1',messageId:msg.id,swipeId:1,content:finalText}
  await Promise.all([frontendHandler({type:'settle_tagged_generation',...terminal},'user-1'),frontendHandler({type:'settle_tagged_generation',...terminal},'user-1')])
  await Promise.all([first,second])
  const rows=()=>userFiles.get('tagged-image-jobs.json').filter(j=>j.generationId===gen)
  await waitRace(()=>rows().length===2&&rows().every(j=>j.inserted),'Canonical formatted source resolves both images')
  assert.equal(mutations,2)
  await Promise.all([submitUrl(msg,formatted,{force:false,swipeId:1}),submitUrl(owner,tagOne,{force:false,isStreaming:true,swipeId:1}),submitUrl(msg,tagTwo,{force:true,generationId:gen,swipeId:1})])
  assert.equal(swipeSequence,before+2,'Late alias, unscoped and force replays do not regenerate')
  assert.equal(mutations,2,'Replay never rewrites a committed message')
  assert.equal(msg.content,otherSwipe);assert.equal(msg.swipe_id,0)
  assert.equal(msg.metadata.swarm_studio_tagged_images.length,2)
 } finally {spindle.chat.updateMessage=update}
 // Same message, same packet, new generation and new swipe remains independent.
 const newGen='slot-authority-new-swipe';msg.swipes.push(tagOne)
 const newRun=submitUrl({id:'inline-stream:'+newGen},tagOne,{force:false,isStreaming:true,generationId:newGen,swipeId:2})
 await waitRace(()=>userFiles.get('tagged-image-jobs.json').some(j=>j.generationId===newGen&&j.status==='ready'),'New swipe renders independently')
 await frontendHandler({type:'settle_tagged_generation',generationId:newGen,chatId:'chat-1',messageId:msg.id,swipeId:2,content:tagOne},'user-1')
 await newRun
 assert.equal(swipeSequence,before+3);assert.match(msg.swipes[2],/^\/api\//);assert.equal(msg.content,otherSwipe)
 const newJob=userFiles.get('tagged-image-jobs.json').find(j=>j.generationId===newGen)
 const retry={type:'retry_tagged_job',jobId:newJob.id,retryMode:'current',requestId:'authority-manual-retry'}
 await frontendHandler(retry,'user-1');assert.equal(swipeSequence,before+4,'Explicit regeneration remains available')
 await frontendHandler(retry,'user-1');assert.equal(swipeSequence,before+4,'Completed retry receipt cannot regenerate again')
 await submitUrl(msg,tagOne,{force:false,generationId:newGen,swipeId:2});assert.equal(swipeSequence,before+4,'Original packet receipt remains valid after regeneration')
}
console.log('inline authority: mixed transport, format variants, distinct slots, conflicting slot replay, idempotent attachment and new swipe: ok')
console.log('inline stream: concurrent provider results, delayed native commit, generation remapping, replay, early terminal proof: ok')
spindle.imageGen.generateStream=beforeSwipeStream
console.log('swipe ownership: background generation/parser/removal, identical alternatives, edited requests, and ambiguous message remapping: ok')
const originalInpaintStream = spindle.imageGen.generateStream
const savedInpaintProfile = structuredClone(userFiles.get("studio-generation-profile.json"))
await request("move_output_to_folder", { imageId: "image-1", folderId: "character:char-1" })
const sourceFolderBeforeInpaint = userFiles.get("output-folders.json").find(folder => folder.id !== "__swarm_studio_favorites__" && folder.imageIds.includes("image-1"))
assert.ok(sourceFolderBeforeInpaint, "The source belongs to a regular output folder")
let inpaintCalls = 0
spindle.imageGen.generateStream = async function* (input) {
  inpaintCalls++
  assert.equal(input.prompt, "Change the sleeve")
  assert.deepEqual(input.parameters.referenceImages, [{ data: "c291cmNl", mimeType: "image/png" }])
  assert.equal(input.parameters.denoise, 0.6)
  assert.equal(input.parameters.width, 512)
  assert.equal(input.parameters.height, 768)
  const { extra_metadata, ...inpaintOverride } = JSON.parse(input.parameters.rawRequestOverride)
  assert.equal(extra_metadata.studio_stage, "inpaint_variant")
  assert.deepEqual(inpaintOverride, {
    maskimage: "data:image/png;base64,bWFzaw==", maskblur: 12, initimagerecompositemask: true,
  })
  return { imageId: "inpaint-variant", imageUrl: "/api/v1/image-gen/results/inpaint-variant" }
}
const edit = {
  input: { clientJobId: "inpaint-fixture", connection_id: "swarm-1", model: "base.safetensors", prompt: "Change the sleeve",
    parameters: { width: 512, height: 768, denoise: 0.6, rawRequestOverride: '{"comfyuicustomworkflow":"Other"}' } },
  inpaint: { sourceImageId: "image-1", source: "data:image/png;base64,c291cmNl", mask: "data:image/png;base64,bWFzaw==", feather: 12 },
  recordHints: { initImageId: "image-1", initImageLabel: "source.png" },
}
try {
  const result = await request("generate", edit)
  assert.equal(result.data.record.initImageId, "image-1")
  assert.equal(result.data.record.imageId, "inpaint-variant")
  assert.equal(result.data.record.parameters.referenceImages, undefined)
  assert.doesNotMatch(JSON.stringify(result.data.record), /bWFzaw==|c291cmNl/)
  assert.deepEqual(userFiles.get("studio-generation-profile.json"), savedInpaintProfile)
  const folder = result.data.outputFolders.find(item => item.id === sourceFolderBeforeInpaint.id)
  assert.ok(folder.imageIds.includes("image-1") && folder.imageIds.includes("inpaint-variant"))
  await assert.rejects(() => request("generate", {
    ...edit, input: { ...edit.input, clientJobId: "invalid-inpaint-fixture" },
    inpaint: { ...edit.inpaint, mask: "https://example.invalid/image.png" },
  }), /source image or region mask/)
  assert.equal(inpaintCalls, 1)
} finally {
  spindle.imageGen.generateStream = originalInpaintStream
}
console.log("native masked render, source folder, history hygiene and rejected mask: ok")

const previousUpscaleGet = spindle.images.get
const previousUpscaleRead = spindle.images.readBinary
let upscaleCount = 0
let beforeUpscaleReturn = () => {}
const upscaleTag = '<swarm-image request="generate" slot="finalize-test">a portrait to finalize</swarm-image>'
const upscaleMessage = { id: "upscale-message", role: "assistant", content: upscaleTag, swipe_id: 0, swipes: [upscaleTag, "Other reply"], metadata: {} }
taggedMessages.push(upscaleMessage)
spindle.imageGen.generateStream = async function* () {
  return { imageId: "draft-fixture", imageUrl: "/api/v1/image-gen/results/draft-fixture" }
}
const draft = await submitUrl(upscaleMessage, upscaleTag, { swipeId: 0 })
spindle.images.get = async (id, options) => {
  if (id !== draft.imageId) return previousUpscaleGet(id, options)
  assert.equal(options.onlyOwned, true)
  assert.equal(options.specificity, "full")
  return { id, mime_type: "image/png", width: 512, height: 384 }
}
spindle.images.readBinary = async id => {
  assert.equal(id, draft.imageId)
  return Uint8Array.of(1, 2, 3)
}
spindle.imageGen.generateStream = async function* (input) {
  assert.deepEqual(input.parameters.referenceImages, [{ data: "AQID", mimeType: "image/png" }])
  const graph = JSON.parse(JSON.parse(input.parameters.rawRequestOverride).comfyworkflowraw)
  if (graph["2"].class_type === "UpscaleModelLoader") {
    assert.equal(graph["2"].inputs.model_name, "RealESRGAN_x4plus_anime_6B.pth")
    assert.equal(graph["3"].class_type, "ImageUpscaleWithModel")
    assert.equal(graph["4"].inputs.width, 1024)
    assert.equal(graph["4"].inputs.height, 768)
  } else {
    assert.equal(graph["2"].class_type, "ImageScaleBy")
    assert.equal(graph["2"].inputs.scale_by, 2)
    assert.equal(graph["2"].inputs.upscale_method, "lanczos")
  }
  beforeUpscaleReturn()
  return { imageId: `upscale-fixture-${++upscaleCount}` }
}
try {
  const options = await request("load_upscale_options", { connectionId: "swarm-1" })
  assert.deepEqual(options.data.models, ["4x-UltraSharp.pth", "RealESRGAN_x4plus_anime_6B.pth"])
  assert.equal(options.data.recommended, "RealESRGAN_x4plus_anime_6B.pth")
  assert.equal(options.data.workflows[0].name, "Portrait/Inpaint")
  const upscaleSettings = { mode: "model", factor: 2, model: options.data.recommended, workflow: "", imageParam: "", graph: "" }
  const standalone = await request("upscale_output", { imageId: draft.imageId, connectionId: "swarm-1", settings: upscaleSettings })
  assert.equal(standalone.data.record.initImageId, draft.imageId)
  assert.equal(standalone.data.record.workflow, "2× AI · RealESRGAN_x4plus_anime_6B.pth")
  assert.equal((await request("load_upscale_options", { connectionId: "swarm-1" })).data.settings.model, upscaleSettings.model)
  assert.equal(standalone.data.record.parameters.width, 1024)
  assert.match(upscaleMessage.content, /draft-fixture/)
  const select = (action, imageId = draft.imageId) => request("select_inline_variant", { action, imageId, jobId: draft.id })
  const upscaleStream = spindle.imageGen.generateStream
  const upscaleEntered = deferred()
  const lateUpscale = deferred()
  spindle.imageGen.generateStream = async function* () {
    upscaleEntered.resolve()
    return await lateUpscale.promise
  }
  const cancelledUpscale = select("finalize")
  await bounded(upscaleEntered.promise)
  await frontendHandler({ type: "cancel_inline_upscale", jobId: draft.id }, "user-1")
  await bounded(cancelledUpscale)
  lateUpscale.resolve({ imageId: "cancelled-upscale-must-not-attach" })
  assert.match(upscaleMessage.content, /draft-fixture/)
  spindle.imageGen.generateStream = upscaleStream
  beforeUpscaleReturn = () => { upscaleMessage.swipe_id = 1; upscaleMessage.content = "Other reply" }
  await select("finalize")
  assert.match(upscaleMessage.swipes[0], /draft-fixture/)
  assert.equal(upscaleMessage.content, "Other reply")
  upscaleMessage.swipe_id = 0
  upscaleMessage.content = upscaleMessage.swipes[0]
  await select("final")
  assert.match(upscaleMessage.content, /upscale-fixture-2/)
  await assert.rejects(() => select("finalize"), /currently attached/)
  await select("draft", "upscale-fixture-2")
  assert.match(upscaleMessage.content, /draft-fixture/)
  await select("final")
  assert.match(upscaleMessage.content, /upscale-fixture-2/)
  assert.equal(upscaleCount, 2, "Switching versions reuses the saved upscale")
  spindle.imageGen.generateStream = async function* (input) {
    const override = JSON.parse(input.parameters.rawRequestOverride)
    if (override.comfyworkflowraw) {
      const graph = JSON.parse(override.comfyworkflowraw)
      assert.equal(graph["1"].inputs.image_base64, "${init_image}")
      assert.equal(graph["3"].inputs.filename_prefix, "${prefix}")
    } else {
      assert.equal(override.comfyuicustomworkflow, "Portrait/Inpaint")
      assert.equal(override.comfyrawworkflowinputimageinputc, "data:image/png;base64,AQID")
    }
    return { imageId: `upscale-fixture-${++upscaleCount}` }
  }
  const json = JSON.stringify({
    "1": { class_type: "SwarmLoadImageB64", inputs: { image_base64: "overwritten" } },
    "2": { class_type: "ImageScaleBy", inputs: { image: ["1", 0], upscale_method: "nearest-exact", scale_by: 2 } },
    "3": { class_type: "SaveImage", inputs: { images: ["2", 0], filename_prefix: "any" } },
  })
  const customSettings = { mode: "custom", factor: 2, model: "", workflow: "", imageParam: "", graph: json }
  const custom = await request("upscale_output", { imageId: draft.imageId, connectionId: "swarm-1", settings: customSettings })
  assert.equal(custom.data.record.workflow, "Custom Comfy upscale")
  const saved = await request("upscale_output", { imageId: draft.imageId, connectionId: "swarm-1",
    settings: { ...customSettings, mode: "saved", workflow: "Portrait/Inpaint", imageParam: "comfyrawworkflowinputimageinputc", graph: "" } })
  assert.equal(saved.data.record.workflow, "Saved Comfy upscale · Portrait/Inpaint")
  const missing = await request("load_upscale_workflow", { connectionId: "swarm-1", name: "Portrait/Inpaint" })
  assert.equal(missing.data.parameters[2].type, "image")
  const invalidRequestId = "upscale-bad-model"
  await frontendHandler({ type: "upscale_output", requestId: invalidRequestId, imageId: draft.imageId,
    connectionId: "swarm-1", settings: { ...customSettings, mode: "model", model: "not-installed.pth" } }, "user-1")
  assert.equal(sent.find(entry => entry.payload.requestId === invalidRequestId)?.payload.type, "studio_error")
  assert.match(sent.find(entry => entry.payload.requestId === invalidRequestId)?.payload.error, /not installed/)
} finally {
  spindle.imageGen.generateStream = beforeSwipeStream
  spindle.images.get = previousUpscaleGet
  spindle.images.readBinary = previousUpscaleRead
}
console.log("upscale graph, draft/final round trip and swipe-safe completion: ok")


// V28 regression: one clientJobId can cross the provider boundary only once.
// Normalization is applied at the shared stream/legacy sink, not to the editor.
{
  const nativeStream = spindle.imageGen.generateStream
  const nativeGenerate = spindle.imageGen.generate
  const fixture = {type:"generate",input:{connection_id:"swarm-1",clientJobId:"v28-same-job",model:"base.safetensors",prompt:"portrait⠀with⠀braille",negativePrompt:"keep⠀negative",parameters:{}}}
  const entered = deferred()
  const release = deferred()
  const providerInputs = []
  try {
    spindle.imageGen.generateStream = input => {
      providerInputs.push(input)
      entered.resolve()
      return {next: () => release.promise}
    }
    const first = frontendHandler({...fixture,requestId:"v28-first"},"user-1")
    await bounded(entered.promise)
    await bounded(frontendHandler({...fixture,requestId:"v28-same-id-during"},"user-1"))
    assert.equal(providerInputs.length,1,"Duplicate in-flight job must not issue a second provider call")
    assert.equal(providerInputs[0].prompt,"portrait with braille")
    assert.equal(providerInputs[0].negativePrompt,"keep negative","Negative prompt must be normalized too")
    release.resolve({done:true,value:{imageId:"v28-image",imageUrl:"/api/v1/image-gen/results/v28-image"}})
    await bounded(first)
    const resultsBefore = sent.filter(e=>e.payload.type==="generation_result" && e.payload.clientJobId==="v28-same-job").length
    await bounded(frontendHandler({...fixture,requestId:"v28-same-id-ended"},"user-1"))
    assert.equal(providerInputs.length,1,"Completed job replay must not issue another provider call")
    assert.equal(sent.filter(e=>e.payload.type==="generation_result" && e.payload.clientJobId==="v28-same-job").length,resultsBefore)

    delete spindle.imageGen.generateStream
    spindle.imageGen.generate = async input => {
      assert.equal(input.prompt,"legacy with braille")
      assert.equal(input.negativePrompt,"leave this")
      return {imageId:"v28-legacy",imageUrl:"/api/v1/image-gen/results/v28-legacy"}
    }
    await bounded(frontendHandler({type:"generate",requestId:"v28-legacy-normalization",input:{connection_id:"swarm-1",clientJobId:"v28-legacy-normalization",model:"base.safetensors",prompt:"legacy⠀with⠀braille",negativePrompt:"leave⠀this",parameters:{}}},"user-1"))
  } finally {
    spindle.imageGen.generateStream = nativeStream
    spindle.imageGen.generate = nativeGenerate
  }
}
console.log("v28: braille normalization and same-ID in-flight/completed deduplication: ok")

// Two near-simultaneous tag callbacks must reuse one persisted image job.
{
  const nativeStream = spindle.imageGen.generateStream
  const fullMatch = '<swarm-image request="generate" slot="v28-race" aspect="4:3">{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition></swarm-image>'
  const msg = {id:"v28-tag-race-message",role:"assistant",content:fullMatch,metadata:{}}
  taggedMessages.push(msg)
  let providerCalls = 0
  try {
    spindle.imageGen.generateStream = async function* () {
      providerCalls++
      return {imageId:"v28-tag-race-image",imageUrl:"/api/v1/image-gen/results/v28-tag-race-image"}
    }
    const makePayload = index => ({type:"tag_generate",requestId:`v28-tag-race-${index}`,chatId:"chat-1",messageId:msg.id,fullMatch,attrs:{request:"generate",slot:"v28-race",aspect:"4:3"},content:"{{swarm_preset}}, outside, city street, food stall, smiling, <preset:composition>",isStreaming:false})
    await bounded(Promise.all([frontendHandler(makePayload(1),"user-1"),frontendHandler(makePayload(2),"user-1")]))
    assert.equal(providerCalls,1,"Concurrent identical tag callbacks must make one image request")
    assert.equal(userFiles.get("tagged-image-jobs.json").filter(job=>job.messageId===msg.id).length,1,"Tag race must persist one job")
  } finally {
    spindle.imageGen.generateStream = nativeStream
  }
}
console.log("v28: concurrent image-tag creation is serialized: ok")

{
  const originalExpressionsStream = spindle.imageGen.generateStream
  const originalExpressionsGet = spindle.images.get
  const originalExpressionsRead = spindle.images.readBinary
  const originalExpressionsCors = spindle.cors
  const calls = []
  try {
    spindle.imageGen.generateStream = async function* (input) {
      calls.push({ ...input, signal: undefined })
      yield { type: "progress", data: { step: 8, totalSteps: 24, preview: "data:image/png;base64,AQID" } }
      return { imageId: `expression-fixture-${calls.length}` }
    }
    const defaults = (await request("load_expression_set")).data
    assert.equal(defaults.selected.length, 6)
    assert.equal(defaults.slots.length, 20)
    await request("save_expression_set", { settings: {
      selected: ["neutral", "wistful", "missing"],
      slots: [{ label: "Wistful", direction: "distant eyes and a soft smile" }],
      generation: { recipe: { width: 832, height: 1024, steps: 24, cfg: 0, scheduler: "karras" }, prefix: "standing, looking at viewer", negative: "hands in front of face" },
    } })
    const saved = (await request("load_expression_set")).data
    assert.deepEqual(saved.selected, ["neutral", "wistful"])
    assert.deepEqual(saved.slots.at(-1), { label: "Wistful", direction: "distant eyes and a soft smile" })
    // The reusable custom-direction bank is stored per account, independently
    // from the character expression set and its selected slots.
    const initialBank = (await request("load_expression_bank")).data
    assert.deepEqual(initialBank, [])
    await request("save_expression_bank", { templates: [
      { id: "stoic-1", label: "Stoic", direction: "unreadable gaze" },
      { id: "bad", label: "neutral", direction: "must not replace built-ins" },
      { id: "duplicate", label: "stoic", direction: "duplicate template" },
    ] })
    const savedBank = (await request("load_expression_bank")).data
    assert.deepEqual(savedBank, [{ id: "stoic-1", label: "Stoic", direction: "unreadable gaze" }])
    const base = { folderId: "character:char-1", connectionId: "swarm-1", model: "anima-base.safetensors", direction: "furrowed brows" }
    const plain = await request("render_folder_expression", base)
    assert.equal(plain.data.id, "expression-fixture-1")
    assert.match(calls[0].prompt, /head and shoulders portrait.*furrowed brows/)
    assert.equal(calls[0].owner_character_id, "char-1")
    assert.equal(calls[0].parameters.seed, -1)
    assert.equal(JSON.parse(calls[0].parameters.rawRequestOverride).extra_metadata.studio_stage, "expression_draft")
    const renderProgress = sent.filter(entry => entry.payload.requestId === plain.requestId && entry.payload.type === "folder_expression_progress")
    assert.equal(renderProgress.length, 1)
    assert.equal(renderProgress[0].userId, "user-1")
    assert.deepEqual(renderProgress[0].payload.data, { step: 8, totalSteps: 24, preview: "data:image/png;base64,AQID", nodeId: "" })
    spindle.images.get = async (id, options) => id === plain.data.id
      ? (assert.equal(options.onlyOwned, false), { id, url: "data:image/png;base64,AQID" })
      : id === "unrelated-output" ? null : originalExpressionsGet(id, options)
    await request("render_folder_expression", { ...base, family: "anima", referenceId: plain.data.id, generation: saved.generation })
    assert.match(calls[1].prompt, /^standing, looking at viewer,.+furrowed brows$/)
    assert.doesNotMatch(calls[1].prompt, /head and shoulders portrait/)
    assert.match(calls[1].negativePrompt, /^hands in front of face/)
    for (const [key, value] of Object.entries({ width: 832, height: 1024, steps: 24, cfgScale: 0, scheduler: "karras" })) {
      assert.equal(calls[1].parameters[key], value)
    }
    assert.match(calls[1].parameters.rawRequestOverride, /AnimaRefAdapter/)
    assert.equal(calls[1].parameters.referenceImages[0].data, "AQID")
    await assert.rejects(() => request("render_folder_expression", { ...base, family: "anima", referenceId: "unrelated-output" }), /saved image visible to your account/)
    assert.equal(calls.length, 2)

    spindle.images.get = async (id, options) => id === plain.data.id
      ? { id, mime_type: "image/png", width: 512, height: 512 }
      : originalExpressionsGet(id, options)
    spindle.images.readBinary = async () => Uint8Array.of(1, 2, 3)
    const source = { ...base, imageId: plain.data.id }
    const graphs = []
    spindle.imageGen.generateStream = async function* (input) {
      graphs.push(JSON.parse(JSON.parse(input.parameters.rawRequestOverride).comfyworkflowraw))
      assert.equal(input.parameters.referenceImages[0].data, "AQID")
      return { imageId: "background-fixture-" + graphs.length }
    }
    await request("process_folder_expression", { ...source, action: "remove-background" })
    assert.equal(graphs[0]["1"].class_type, "SwarmLoadImageB64")
    assert.equal(graphs[0]["2"].inputs.bg_removal_name, "birefnet.safetensors")
    assert.deepEqual(graphs[0]["4"].inputs.mask, ["3", 0])
    assert.deepEqual(graphs[0]["5"].inputs, { image: ["1", 0], alpha: ["4", 0] })
    assert.deepEqual(graphs[0]["6"].inputs.images, ["5", 0])
    const graph = JSON.stringify({ "8": { class_type: "LoadImage", inputs: { image: "placeholder.png" } },
      "9": { class_type: "SaveImage", inputs: { images: ["8", 0], filename_prefix: "old" } } })
    await request("process_folder_expression", { ...source, action: "remove-background", backgroundMode: "custom", graph })
    assert.deepEqual(graphs[1]["8"], { class_type: "SwarmLoadImageB64", inputs: { image_base64: "${init_image}" } })
    assert.deepEqual(graphs[1]["9"].inputs.images, ["8", 0])
    assert.equal(graphs[1]["9"].inputs.filename_prefix, "${prefix}")
    for (const [spec, status] of [
      [{ LoadBackgroundRemovalModel: { input: { required: { bg_removal_name: [["birefnet.safetensors"]] } } } }, "installed"],
      [{ LoadBackgroundRemovalModel: { input: { required: { bg_removal_name: ["COMBO", { options: [] }] } } } }, "missing"],
      [{}, "unsupported"],
    ]) {
      spindle.cors = async (url, options) => {
        assert.match(url, /\/ComfyBackendDirect\/object_info\/LoadBackgroundRemovalModel$/)
        assert.equal(options.method, "GET")
        return { status: 200, body: JSON.stringify(spec) }
      }
      assert.equal((await request("check_expression_background_model", base)).data.status, status)
    }
    spindle.cors = originalExpressionsCors
    const storedUpscale = userFiles.get("studio-upscale-settings.json")
    userFiles.set("studio-upscale-settings.json", { ...storedUpscale, "swarm-1": { mode: "model", model: "4x-UltraSharp.pth", factor: 2 } })
    const enhanceOptions = (await request("load_expression_enhance_options", base)).data
    assert.equal(enhanceOptions.mode, "model")
    await request("process_folder_expression", { ...source, action: "enhance", factor: 4 })
    assert.equal(graphs[2]["4"].inputs.width, 2048)
    assert.equal(graphs[2]["4"].inputs.height, 2048)
    assert.deepEqual((await request("load_expression_enhance_options", base)).data, enhanceOptions)
    // Expressions Maker's ribbon checks the *selected* model, not merely
    // whether any upscaler exists on the connected SwarmUI backend.
    const checkUpscale = async () => (await request("check_expression_upscale_model", base)).data
    assert.deepEqual(await checkUpscale(), { status: "installed", mode: "model", model: "4x-UltraSharp.pth", available: 2 })
    userFiles.set("studio-upscale-settings.json", { ...storedUpscale, "swarm-1": { mode: "model", model: "missing-model.pth", factor: 2 } })
    assert.deepEqual(await checkUpscale(), { status: "missing", mode: "model", model: "missing-model.pth", available: 2 })
    const upscaleCors = spindle.cors
    spindle.cors = async (url) => {
      assert.match(url, /\/API\/ListT2IParams$/)
      return { status: 200, body: JSON.stringify({ list: [{ id: "refinerupscalemethod", values: ["pixel-lanczos"] }] }) }
    }
    assert.deepEqual(await checkUpscale(), { status: "empty", mode: "model", model: "missing-model.pth", available: 0 })
    spindle.cors = async () => { throw new Error("Backend offline") }
    assert.deepEqual(await checkUpscale(), { status: "unavailable", mode: "model", model: "missing-model.pth" })
    spindle.cors = upscaleCors
    userFiles.set("studio-upscale-settings.json", { ...storedUpscale, "swarm-1": { mode: "model", model: "", factor: 2 } })
    assert.equal((await checkUpscale()).status, "unconfigured")
    userFiles.set("studio-upscale-settings.json", { ...storedUpscale, "swarm-1": { mode: "saved", workflow: "Portrait/Inpaint", imageParam: "image", factor: 2 } })
    assert.deepEqual(await checkUpscale(), { status: "workflow", mode: "saved", model: "" })
    userFiles.set("studio-upscale-settings.json", { ...storedUpscale, "swarm-1": { mode: "custom", graph: '{"1":{}}', factor: 2 } })
    assert.deepEqual(await checkUpscale(), { status: "workflow", mode: "custom", model: "" })
    userFiles.set("studio-upscale-settings.json", storedUpscale)
    const stages = [
      ["generate", { ...base, type: "render_folder_expression" }],
      ["enhance", { ...source, type: "process_folder_expression", action: "enhance" }],
      ["background", { ...source, type: "process_folder_expression", action: "remove-background",
        workflow: "Portrait/Inpaint", imageParam: "comfyrawworkflowinputimageinputc" }],
    ]
    for (const [stage, fields] of stages) {
      const entered = deferred(), late = deferred()
      const requestId = `stop-expression-${stage}`
      let signal
      spindle.imageGen.generateStream = input => {
        signal = input.signal
        return { next() { entered.resolve(); return late.promise } }
      }
      const pending = frontendHandler({ ...fields, requestId }, "user-1")
      await bounded(entered.promise)
      await frontendHandler({ type: "stop_folder_expression", requestId }, "other-user")
      assert.equal(signal.aborted, false, "Stop is scoped to the submitting user")
      await frontendHandler({ type: "stop_folder_expression", requestId }, "user-1")
      await bounded(pending)
      assert.equal(signal.aborted, true)
      late.resolve({ done: true, value: { imageId: requestId } })
      assert.deepEqual(sent.filter(entry => entry.payload.requestId === requestId).map(entry => entry.payload.type), ["folder_expression_stopped"])
      assert.ok(!userFiles.get("generation-records.json").some(record => record.imageId === requestId))
    }
    spindle.imageGen.generateStream = () => assert.fail("A stop received first must prevent a render")
    const early = "stop-expression-before-render"
    await frontendHandler({ type: "stop_folder_expression", requestId: early }, "user-1")
    await bounded(frontendHandler({ ...base, type: "render_folder_expression", requestId: early }, "user-1"))
    assert.equal(sent.find(entry => entry.payload.requestId === early)?.payload.type, "folder_expression_stopped")
  } finally {
    spindle.imageGen.generateStream = originalExpressionsStream
    spindle.images.get = originalExpressionsGet
    spindle.images.readBinary = originalExpressionsRead
    spindle.cors = originalExpressionsCors
  }
}
console.log("character expression generation, owned references, Anima workflow and scoped cancellation: ok")

// Cast uses account-scoped extension storage before any host deployment.
{
  const library = {version:1,activeGroupId:'cast-test',inject:true,groups:[{id:'cast-test',name:'Night shift'}],members:[{id:'mina',groupId:'cast-test',name:'Mina',prefix:'Mina',role:'persona',presentation:'portrait',folderId:'',images:{joy:{id:'cast-joy'}}}]}
  await request('save_cast_library',{library})
  const loaded = await request('load_cast_library')
  assert.equal(loaded.data.members[0].images.joy.url,'/api/v1/images/cast-joy')
  const result = await interceptorHandler([{role:'user',content:'Continue'}],{userId:'user-1',generationId:'cast-generation'})
  assert.match(JSON.stringify(result),/SWARM STUDIO CAST/)
  assert.match(JSON.stringify(result),/Color all spoken dialogue consistently by speaker, both inside and outside Cast packets/)
  assert.match(JSON.stringify(result),/Mina-joy/)
  activePersona.metadata.preserved_cast_test = "keep"
  await request('assign_cast_persona',{memberId:'mina'})
  assert.equal(activePersona.metadata.swarm_studio_cast.mappings.joy,'cast-joy')
  assert.equal(activePersona.metadata.preserved_cast_test,'keep')
  await request('save_cast_library',{library:{}}) // Group switch while the model is generating.
  const originalGet=spindle.chat.getMessages, originalUpdate=spindle.chat.updateMessage
  const message={id:'cast-message',content:'Mina laughs. <swarm-cast=Mina-joy>',swipe_id:0,swipes:['Mina laughs. <swarm-cast=Mina-joy>','other swipe']}
  const writes=[]
  spindle.chat.getMessages=async()=>[structuredClone(message)]
  spindle.chat.updateMessage=async(...args)=>writes.push(args)
  try {
    eventHandlers.get('GENERATION_ENDED')({generationId:'cast-generation',chatId:'cast-chat',messageId:message.id,content:message.content},'user-1')
    for(let i=0;i<20 && !writes.length;i++) await new Promise(resolve=>setTimeout(resolve,5))
    assert.equal(writes.length,0,"Cast tags remain editable source; live display must not permanently rewrite swipes")
    assert.equal(message.swipes[1],"other swipe")
    message.content='An edited reply'
    eventHandlers.get('GENERATION_ENDED')({chatId:'cast-chat',messageId:message.id,content:'Mina laughs. <swarm-cast=Mina-joy>'},'user-1')
    await new Promise(resolve=>setTimeout(resolve,30))
    assert.equal(writes.length,0,'An edited/switched reply must not be overwritten')
  } finally {spindle.chat.getMessages=originalGet;spindle.chat.updateMessage=originalUpdate}
  await request('save_cast_library',{library:{}})
}
console.log('Cast backend: storage, prompt injection, inline completion, user scope and stale reply protection PASS')

// Targeted chat quick-picker side updates must not overwrite other Cast members.
{
  const group='side-isolation'
  const library={version:2,activeGroupId:group,groups:[{id:group,name:'Side test',defaultPresentation:'chapter-tab'}],
    members:[
      {id:'shoto',groupId:group,name:'Shoto',prefix:'Shoto',presentationSide:'left',images:{neutral:{id:'shoto-neutral'}}},
      {id:'katsuki',groupId:group,name:'Katsuki',prefix:'Katsuki',presentationSide:'right',images:{neutral:{id:'katsuki-neutral'}}},
    ]}
  await request('save_cast_library',{library})
  await request('set_cast_side',{memberId:'shoto',side:'right'})
  let updated=(await request('load_cast_library')).data
  assert.equal(updated.members.find(m=>m.id==='shoto').presentationSide,'right')
  assert.equal(updated.members.find(m=>m.id==='katsuki').presentationSide,'right')
  assert.deepEqual(Object.keys(updated.members.find(m=>m.id==='katsuki').images),['neutral'])
  await request('set_cast_side',{memberId:'shoto',side:'auto'})
  updated=(await request('load_cast_library')).data
  assert.equal(updated.members.find(m=>m.id==='shoto').presentationSide,'auto')
  assert.equal(updated.members.find(m=>m.id==='katsuki').presentationSide,'right')
  await request('save_cast_library',{library:{}})
}
console.log('Cast quick picker side save PASS: targeted member, independent members, images and Auto reset')

// Card-specific edits are independent from shared Cast defaults and source text.
{
  const library={activeGroupId:'card-test',chatGroups:{'chat-1':'card-test'},groups:[{id:'card-test',name:'Card test',defaultPresentation:'afterglow-cinema'}],members:[{id:'actor',groupId:'card-test',name:'Actor',prefix:'actor',images:{neutral:{id:'neutral-img'},joy:{id:'joy-img'}}}]}
  await request('save_cast_library',{library})
  const before=structuredClone(userFiles.get('cast-library.json'))
  const chatId='chat-1',key='message-one:0:0:abc:xyz',other='message-one:1:0:abc:xyz'
  const override={memberId:'actor',expression:'joy',scale:99,x:-999,y:999,width:300,crop:{enabled:true,x:-50,y:500,zoom:9}}
  const saved=await request('set_cast_card_override',{chatId,key,override})
  assert.deepEqual(saved.override,{memberId:'actor',expression:'joy',scale:1.5,x:-20,y:15,width:100,crop:{enabled:true,x:0,y:100,zoom:3}})
  await request('set_cast_card_override',{chatId,key:other,override:{...override,expression:'neutral'}})
  const stored=(await request('load_cast_card_overrides',{chatId})).data
  assert.equal(stored[key].expression,'joy');assert.equal(stored[other].expression,'neutral')
  assert.deepEqual(userFiles.get('cast-library.json'),before)
  const reject=async(type,data)=>{const requestId=`card-reject-${sent.length}`;await frontendHandler({type,requestId,...data},'user-1');assert.equal(sent.findLast(x=>x.payload.requestId===requestId).payload.type,'studio_error')}
  await reject('set_cast_card_override',{chatId,key,override:{...override,expression:'missing'}})
  await reject('set_cast_card_override',{chatId,key,override:{...override,memberId:'other-cast'}})
  await reject('set_cast_card_override',{chatId,key:'../../not-a-key',override})
  await reject('set_cast_card_override',{chatId:'another-chat',key,override})
  await reject('load_cast_card_overrides',{chatId:'another-chat'})
  assert.deepEqual((await request('load_cast_card_overrides',{chatId})).data,stored)
  // A correction before member adoption keeps legacy geometry; adoption then
  // supersedes all old geometry without changing the portable member record.
  const legacy=await request('set_cast_card_override',{chatId,key,memberId:'actor',expressionOnly:true,override:{memberId:'actor',expression:'neutral',scale:1,x:0,y:0,width:null,crop:null}})
  assert.equal(legacy.override.scale,1.5)
  assert.equal(legacy.override.expression,'neutral')
  const pref=await request('set_cast_member_preference',{chatId,memberId:'actor',preference:{presentation:'vn-hero',side:'left',scale:4,x:80,y:-60,width:20,expression:'joy'}})
  assert.deepEqual(pref.preference,{presentation:'vn-hero',side:'left',scale:1.5,x:20,y:-15,width:40})
  assert.deepEqual((await request('load_cast_card_overrides',{chatId})).preferences.actor,pref.preference)
  const getActiveChat=spindle.chats.getActive
  try{
    spindle.chats.getActive=async()=>({...await getActiveChat(),'id':'chat-2'})
    const across=await request('load_cast_card_overrides',{chatId:'chat-2'})
    assert.deepEqual(across.preferences.actor,pref.preference)
    assert.equal(across.data[key],undefined)
  }finally{spindle.chats.getActive=getActiveChat}
  assert.equal(Object.keys(userFiles.get('cast-member-preferences.json')).length,1)
  await reject('set_cast_member_preference',{chatId,memberId:'other-cast',preference:{scale:1.2}})
  await reject('set_cast_member_preference',{chatId:'another-chat',memberId:'actor',preference:{}})
  await reject('set_cast_card_override',{chatId,key,memberId:'other-cast',expressionOnly:true,override:null})
  const updatedPref=await request('set_cast_member_preference',{chatId,memberId:'actor',preference:{scale:1.2}})
  assert.deepEqual(updatedPref.preference,{scale:1.2})
  assert.equal(Object.keys(userFiles.get('cast-member-preferences.json')).length,1)
  const local=await request('set_cast_card_override',{chatId,key,memberId:'actor',expressionOnly:true,override:{...override,expression:'joy'}})
  assert.deepEqual(local.override,{memberId:'actor',expression:'joy',scale:1,x:0,y:0,width:null,crop:null})
  const reverted=await request('set_cast_member_preference',{chatId,memberId:'actor',preference:{presentation:'inherit',side:'auto',scale:1,x:0,y:0}})
  assert.deepEqual(reverted.preference,{})
  assert.deepEqual((await request('load_cast_card_overrides',{chatId})).preferences.actor,{})
  assert.equal((await request('load_cast_card_overrides',{chatId})).data[key].expression,'joy')
  assert.deepEqual(userFiles.get('cast-library.json'),before)
  await request('set_cast_card_override',{chatId,key,memberId:'actor',expressionOnly:true,override:null})
  assert.equal((await request('load_cast_card_overrides',{chatId})).data[key],undefined)
  assert.equal((await request('load_cast_card_overrides',{chatId})).data[other].expression,'neutral')
  await request('set_cast_card_override',{chatId,key:other,override:null})
  await request('save_cast_library',{library:{}})
}
console.log('Cast Atelier backend PASS: bounded geometry, member-wide preferences, legacy migration, cross-chat scope, expression corrections, validation and reset')

// Independent Cast members generate into their own unlinked folder, even without a character/card.
{
 const originalStream=spindle.imageGen.generateStream, originalGet=spindle.images.get
 const inputs=[]
 const independent={version:2,activeGroupId:'independent-group',inject:true,chatGroups:{'chat-1':'independent-group','chat-other':''},groups:[{id:'independent-group',name:'Independent ensemble',defaultPresentation:'story',inject:true}],members:[{id:'independent-member',groupId:'independent-group',name:'Ada',prefix:'Ada',identityPrompt:'silver braids, green jacket',referenceImageId:'independent-reference',presentation:'inherit',images:{}}]}
 try{
  spindle.images.get=async(id)=>['independent-reference','independent-output'].includes(id)?{id,mime_type:'image/png',width:768,height:768}:originalGet(id)
  spindle.imageGen.generateStream=async function*(input){inputs.push(input);return{imageId:'independent-output',imageUrl:'/api/v1/images/independent-output'}}
  await request('save_cast_library',{library:independent})
  await request('set_cast_recipe',{groupId:'independent-group',recipe:{connectionId:'swarm-1',checkpoint:'anima-base.safetensors',generation:{recipe:{width:640,height:960,steps:32},prefix:'album framing'},stack:[{name:'album-style.safetensors',weight:.85,enabled:true,useTrigger:true,trigger:'album trigger'}]}})
  const atmosphereBefore=structuredClone(userFiles.get('cast-library.json'));const atmosphereResult=await request('set_cast_atmosphere',{groupId:'independent-group',settings:{enabled:true,intensity:82,actor:45,colorA:'#aabbcc',colorB:'bad; CSS',transitions:true}});const atmosphereAfter=atmosphereResult.data.library;assert.equal(atmosphereAfter.groups[0].atmosphere.intensity,82);assert.equal(atmosphereAfter.groups[0].atmosphere.colorB,'#354768');assert.equal(atmosphereAfter.groups[0].atmosphere.animations,false);assert.equal(JSON.stringify(atmosphereAfter.members),JSON.stringify(atmosphereBefore.members));assert.deepEqual(atmosphereAfter.groups[0].recipe,atmosphereBefore.groups[0].recipe);assert.deepEqual(atmosphereAfter.groups[0].backgrounds,atmosphereBefore.groups[0].backgrounds);
  const result=await request('render_folder_expression',{castMemberId:'independent-member',connectionId:'swarm-1',direction:'bright eyes, joyful smile',family:'',generation:{prefix:'head and shoulders portrait, <preset:Alien Stage>, @qmeng_ci @VIVINOS',negative:'',recipe:{}}})
  assert.equal(result.data.id,'independent-output')
  assert.match(inputs[0].prompt,/silver braids, green jacket/)
  assert.match(inputs[0].prompt,/album trigger/);assert.match(inputs[0].prompt,/head and shoulders portrait/);assert.ok(inputs[0].prompt.includes('<preset:Alien Stage>, @qmeng_ci @VIVINOS'));assert.deepEqual(inputs[0].parameters.loras,['album-style.safetensors']);assert.deepEqual(inputs[0].parameters.loraWeights,[.85]);assert.equal(inputs[0].parameters.width,640)
  assert.equal(inputs[0].owner_character_id,undefined)
  const workshopBase={castMemberId:'independent-member',connectionId:'swarm-1',direction:'smiling',family:'',generation:{prefix:'workshop framing',negative:'shared exclusion',recipe:{steps:40}}}
  await request('render_folder_expression',{...workshopBase,renderOverrides:{checkpoint:'alternate.safetensors',identity:'custom pink hair',outfit:'blue hoodie',identityNegative:'extra exclusion',stack:[{name:'workshop.safetensors',weight:.72,enabled:true,useTrigger:true,trigger:'style cue'},{name:'disabled.safetensors',weight:1,enabled:false,useTrigger:true,trigger:'must not appear'}]}})
  assert.equal(inputs[1].model,'alternate.safetensors');assert.match(inputs[1].prompt,/workshop framing, style cue, custom pink hair, blue hoodie, smiling/);assert.doesNotMatch(inputs[1].prompt,/album trigger|silver braids|must not appear/);assert.equal(inputs[1].negativePrompt,'shared exclusion, extra exclusion');assert.deepEqual(inputs[1].parameters.loras,['workshop.safetensors']);assert.deepEqual(inputs[1].parameters.loraWeights,[.72]);assert.equal(inputs[1].parameters.steps,40)
  await request('render_folder_expression',{...workshopBase,renderOverrides:{identity:'',outfit:'',identityNegative:'',stack:[]}})
  assert.equal(inputs[2].prompt,'workshop framing, smiling');assert.deepEqual(inputs[2].parameters.loras,[]);assert.equal(inputs[2].negativePrompt,'shared exclusion')
  await request('render_folder_expression',workshopBase)
  assert.match(inputs[3].prompt,/album trigger, silver braids, green jacket/);assert.deepEqual(inputs[3].parameters.loras,['album-style.safetensors'])
  const folders=userFiles.get('output-folders.json')
  const ownedFolder=folders.find(folder=>folder.id==='cast:independent-member')
  assert.ok(ownedFolder);assert.equal(ownedFolder.binding,null);assert.ok(ownedFolder.imageIds.includes('independent-output'))
  independent.members[0].images={joy:{id:'independent-output'}}
  await request('save_cast_library',{library:independent})
  const exported=await request('export_cast_folder',{groupId:'independent-group'})
  assert.equal(exported.data.count,1)
  const allFolders=userFiles.get('output-folders.json')
  assert.equal(allFolders.find(folder=>folder.id==='cast-group:independent-group').binding,null)
  assert.ok(allFolders.find(folder=>folder.id==='cast:independent-member').imageIds.includes('independent-output'),'Export must not remove the original member asset')
  const otherChat=await interceptorHandler([{role:'user',content:'Continue'}],{userId:'user-1',chatId:'chat-other'})
  assert.doesNotMatch(JSON.stringify(otherChat),/SWARM STUDIO CAST/)
 }finally{spindle.imageGen.generateStream=originalStream;spindle.images.get=originalGet;await request('save_cast_library',{library:{}})}
}
console.log('Independent Cast backend PASS: member-owned identity, unlinked generation folder, copied export, retained originals and chat-specific prompt isolation')

// End-to-end manual expression reference: native uploads are account-visible,
// not extension-owned. Reject invisible assets before reading or dispatching.
{
 const get=spindle.images.get, read=spindle.images.readBinary, cors=spindle.cors, stream=spindle.imageGen.generateStream
 const original=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64'))
 const inputs=[], reads=[]
 try {
  await request('save_cast_library',{library:{groups:[{id:'ref-cast',name:'Reference Cast'}],members:[{id:'ref-member',groupId:'ref-cast',name:'Reference member',prefix:'ref',identityPrompt:'pink hair',referenceImageId:'native-reference',images:{}}]}})
  spindle.images.get=async(id,options)=>{
   if(!['native-reference','denied-reference','huge-reference','wrong-format'].includes(id))return get(id,options)
   assert.equal(options.userId,'user-1');assert.equal(options.onlyOwned,false)
   if(id==='denied-reference')return null
   return {id,mime_type:id==='wrong-format'?'video/mp4':'image/png',url:`/api/v1/images/${id}?size=sm`,owner_extension_identifier:null}
  }
  spindle.images.readBinary=async(id,userId)=>{assert.equal(userId,'user-1');assert.notEqual(id,'denied-reference');reads.push(id);return id==='huge-reference'?new Uint8Array(5_625_001):id==='wrong-format'?Uint8Array.of(1,2,3):original}
  spindle.cors=async(url,options)=>{
   assert.doesNotMatch(url,/\/api\/v1\/images\//)
   if(url.endsWith('/API/ListT2IParams'))return {status:200,body:JSON.stringify({list:[{id:'useipadapter',values:['PLUS (fixture)']}]})}
   return cors(url,options)
  }
  spindle.imageGen.generateStream=async function*(input){inputs.push(input);return {imageId:'scoped-ref-output-'+inputs.length}}
  const base={castMemberId:'ref-member',connectionId:'swarm-1',model:'anima-base.safetensors',direction:'neutral expression'}
  await request('render_folder_expression',{...base,family:'anima'})
  assert.deepEqual(inputs[0].parameters.referenceImages,[{mimeType:'image/png',data:Buffer.from(original).toString('base64')}])
  assert.match(inputs[0].parameters.rawRequestOverride,/AnimaRefAdapter/)
  // A folder-bound workshop may also reference an explicitly uploaded asset
  // without moving the source into its output folder.
  await request('render_folder_expression',{...base,castMemberId:undefined,folderId:'character:char-1',referenceId:'native-reference',family:'anima'})
  assert.deepEqual(inputs[1].parameters.referenceImages,inputs[0].parameters.referenceImages)
  await request('render_folder_expression',{...base,family:'illustrious'})
  assert.equal(JSON.parse(inputs[2].parameters.rawRequestOverride).promptimages,'data:image/png;base64,'+Buffer.from(original).toString('base64'))
  await assert.rejects(()=>request('render_folder_expression',{...base,family:'anima',referenceId:'denied-reference'}),/saved image visible to your account/)
  await assert.rejects(()=>request('render_folder_expression',{...base,family:'anima',referenceId:'huge-reference'}),/reference image is too large/)
  await assert.rejects(()=>request('render_folder_expression',{...base,family:'anima',referenceId:'wrong-format'}),/PNG, JPEG or WebP reference/)
  assert.equal(inputs.length,3)
  assert.ok(!reads.includes('denied-reference'))
  const before=reads.length
  await request('render_folder_expression',{...base,family:'',referenceId:'denied-reference'})
  assert.equal(reads.length,before,'Prompt only must ignore stale reference IDs')
  assert.equal(inputs[3].parameters.referenceImages,undefined)
 } finally {spindle.images.get=get;spindle.images.readBinary=read;spindle.cors=cors;spindle.imageGen.generateStream=stream;await request('save_cast_library',{library:{}})}
}
console.log('Account-scoped reference upload, original binary, adapter transports, size and access rejection, prompt-only isolation: ok')
// An outfit's reference and prompt must stay isolated from the other outfits,
// including when the same logical expression exists in both collections.
{
 const stream=spindle.imageGen.generateStream, get=spindle.images.get, read=spindle.images.readBinary
 const inputs=[],reads=[]; const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64'))
 const group='wardrobe-test-group',member='wardrobe-test-member'
 const raw={groups:[{id:group,name:'BNHA'}],members:[{id:member,groupId:group,name:'Actor',prefix:'actor',identityPrompt:'blond hair',referenceImageId:'casual-reference',images:{neutral:{id:'casual-art'},'patrol-neutral':{id:'patrol-art'}}}]}
 try{
  await request('save_cast_library',{library:raw});const old=userFiles.get('output-folders.json')||[];userFiles.set('output-folders.json',[...old,{id:`cast:${member}`,name:'Actor',imageIds:['casual-art','patrol-art','old-draft'],binding:null},{id:'wardrobe-user-folder',name:'Keep my references',imageIds:['patrol-art'],binding:null}]);
  raw.members[0].wardrobes=[{key:'default',name:'Casual',outfitPrompt:'black t-shirt',referenceImageId:'casual-reference',slots:{neutral:'neutral'}},{key:'patrol',name:'Patrol',outfitPrompt:'orange hero suit',referenceImageId:'patrol-reference',slots:{neutral:'patrol-neutral'}}]
  await request('save_cast_library',{library:raw});const folders=userFiles.get('output-folders.json');assert.ok(folders.find(x=>x.id===`cast:${member}:patrol`).imageIds.includes('patrol-art'));assert.ok(!folders.find(x=>x.id===`cast:${member}`).imageIds.includes('patrol-art'));assert.ok(folders.find(x=>x.id===`cast:${member}`).imageIds.includes('old-draft'));assert.ok(folders.find(x=>x.id==='wardrobe-user-folder').imageIds.includes('patrol-art'))
  spindle.images.get=async(id,opts)=>['casual-reference','patrol-reference'].includes(id)?{id,mime_type:'image/png',url:`/api/v1/images/${id}`} :get(id,opts)
  spindle.images.readBinary=async(id,userId)=>{assert.equal(userId,'user-1');reads.push(id);return png}
  spindle.imageGen.generateStream=async function*(input){inputs.push(input);return {imageId:'wardrobe-test-render-'+inputs.length}}
  const base={castMemberId:member,connectionId:'swarm-1',model:'anima-base.safetensors',direction:'angry expression',family:'anima'}
  await request('render_folder_expression',{...base,wardrobeKey:'patrol'});assert.match(inputs[0].prompt,/blond hair, orange hero suit, angry expression/);assert.doesNotMatch(inputs[0].prompt,/black t-shirt/);assert.deepEqual(reads,['patrol-reference']);assert.match(inputs[0].parameters.rawRequestOverride,/AnimaRefAdapter/)
  await request('render_folder_expression',{...base,wardrobeKey:'default'});assert.match(inputs[1].prompt,/black t-shirt/);assert.deepEqual(reads,['patrol-reference','casual-reference'])
  await request('render_folder_expression',{...base,wardrobeKey:'patrol',referenceId:''});assert.equal(inputs[2].parameters.referenceImages,undefined);assert.equal(reads.length,2)
  await assert.rejects(()=>request('render_folder_expression',{...base,wardrobeKey:'missing'}),/wardrobe no longer exists/)
  assert.ok(userFiles.get('output-folders.json').find(x=>x.id===`cast:${member}:patrol`).imageIds.includes('wardrobe-test-render-1'))
 }finally{spindle.imageGen.generateStream=stream;spindle.images.get=get;spindle.images.readBinary=read;await request('save_cast_library',{library:{}})}
}
console.log('Cast wardrobes: scoped render and reference dispatch, managed folder migration, no cross-outfit fallback: ok')



// The v2 Island path must NEVER modify saved chat or swipes on load.
// It replaces only the *render* projection, leaving the source immutable.
{
 const originalGet=spindle.chat.getMessages,originalUpdate=spindle.chat.updateMessage
 const html='<span data-swarm-cast="Mina-joy" style="display:inline-flex;gap:12px;"><span><img src="/api/v1/images/cast-joy" alt="Mina"></span><span style="font-style:italic;line-height:1.7;">“Hello.”</span></span>'
 const assistant={id:'legacy-cast',is_user:false,content:html,swipe_id:0,swipes:[html,'Other swipe']}
 const user={id:'user-cast-example',is_user:true,content:html}
 const code={id:'assistant-code-example',is_user:false,content:'```html\n'+html+'\n```'}
 const writes=[]
 spindle.chat.getMessages=async()=>structuredClone([assistant,user,code])
 spindle.chat.updateMessage=async(chatId,id,patch,userId)=>{writes.push({chatId,id,patch,userId})}
 try{
  await request('load_cast_library')
  assert.equal(writes.length,0,'Loading Cast may not rewrite any saved message')
  assert.equal(assistant.content,html)
  const roles=await request('load_cast_roles',{chatId:'chat-1',ids:[assistant.id,user.id,code.id]})
  assert.deepEqual(roles.roles,{'legacy-cast':true,'user-cast-example':false,'assistant-code-example':true})
  assert.equal(roles.sources['legacy-cast'],html,'Saved source remains original')
  assert.equal(typeof castRenderProcessor,'function','Supported pre-render API hook is registered')
  const packet='<swarm-cast=Mina-joy><font color="#599CE3">"Hello."</font></swarm-cast>'
  const transformed=await castRenderProcessor({origin:'render',content:'Before '+packet+' after.',isUser:false,extra:{role:'assistant'}})
  const stageRaw='<font⠀color="#599ce3">"Earlier dialogue."</font>\n\n⠀[[scene:⠀izakaya-booth]]\n[[lighting: golden-hour]]\n\n'+packet
  const stageRender=await castRenderProcessor({origin:'render',content:stageRaw,isUser:false,extra:{role:'assistant'}})
  assert.equal((stageRender.content.match(/data-ss-stage-cue=/g)||[]).length,2,'Real backend render hook must consume braille-spaced consecutive directions')
  assert.match(stageRender.content,/data-ss-cast-slot="1"/)
  assert.doesNotMatch(stageRender.content,/\[\[(?:scene|lighting):/)
  assert.equal(await castRenderProcessor({origin:'render',content:stageRender.content,isUser:false,extra:{role:'assistant'}}),undefined)

  assert.match(transformed.content,/data-ss-cast-slot="1"/)
  assert.ok(transformed.content.startsWith('Before ')&&transformed.content.endsWith(' after.'))
  assert.equal((await castRenderProcessor({origin:'render',content:transformed.content,isUser:false,extra:{role:'assistant'}})),undefined,'Render transform must be idempotent')
  assert.equal(await castRenderProcessor({origin:'update',content:packet,isUser:false}),undefined,'No write-time mutation')
  assert.equal(await castRenderProcessor({origin:'render',content:packet,isUser:true,extra:{role:'user'}}),undefined,'User content is excluded')
  assert.equal(await castRenderProcessor({origin:'render',content:packet,isUser:false,extra:{role:'system'}}),undefined,'System content is excluded')
  assert.equal(writes.length,0,'The render hook must never mutate the database')
 }finally{spindle.chat.getMessages=originalGet;spindle.chat.updateMessage=originalUpdate}
}
console.log('Cast Islands backend PASS: pre-render API, original chat/swipe preservation, idempotence, user guard')

// Scene assets are group references, never implicit generation or destructive moves.
{
 const originalGet=spindle.images.get, originalList=spindle.images.list, calls=[]
 const library={activeGroupId:'world-group',groups:[{id:'world-group',name:'Worlds',defaultBackground:'plaza',backgrounds:[{key:'plaza',id:'world1',name:'Plaza'}]}],members:[]}
 try{
  spindle.images.get=async(id,opts)=>{calls.push({id,opts});return id==='world1'&&opts.specificity==='sm'?{id,mime_type:'image/png',width:1024,height:576}:id==='world2'||id==='unowned-world'?null:originalGet(id,opts)}
  // Picker can list an owned image even when its individual lookup is absent.
  spindle.images.list=async(opts)=>{assert.equal(opts.onlyOwned,true);assert.equal(opts.userId,'user-1');assert.equal(opts.specificity,'sm');return {data:[{id:'world2',url:'/api/v1/images/world2'}],total:1}}
  const saved=await request('save_cast_library',{library})
  assert.equal(saved.data.groups[0].backgrounds[0].id,'world1')
  assert.ok(calls.some(c=>c.id==='world1'&&c.opts.onlyOwned&&c.opts.userId==='user-1'))
  assert.equal((await request('export_cast_background_folder',{groupId:'world-group'})).data.count,1)
  library.groups[0].backgrounds=[{key:'plaza',id:'world2',name:'Plaza',aliases:['sidewalk']}]
  await request('save_cast_library',{library})
  await request('export_cast_background_folder',{groupId:'world-group'})
  const folder=()=>userFiles.get('output-folders.json').find(f=>f.id==='cast-backgrounds:world-group')
  assert.deepEqual(folder().imageIds,['world1','world2'])
  library.groups[0].backgrounds=[{key:'plaza',id:'unowned-world',name:'Plaza'}]
  await frontendHandler({type:'save_cast_library',requestId:'world-ownership-reject',library},'user-1')
  assert.equal(sent.findLast(e=>e.payload.requestId==='world-ownership-reject').payload.type,'studio_error')
  assert.equal((await request('load_cast_library')).data.groups[0].backgrounds[0].id,'world2')
  library.groups[0].backgrounds=[]
  await request('save_cast_library',{library})
  assert.deepEqual(folder().imageIds,['world1','world2'])
 }finally{spindle.images.get=originalGet;spindle.images.list=originalList;await request('save_cast_library',{library:{}})}
}
console.log('Cast Worlds backend PASS: owned references, export merge, rejection, non-destructive removal')

// Theater scenery is a read-only union of active-Cast locations and shared assets.
{
 const oldCast=structuredClone(userFiles.get('cast-library.json')),oldFolders=structuredClone(userFiles.get('output-folders.json'));
 try{
  userFiles.set('cast-library.json',{version:2,activeGroupId:'other',chatGroups:{'chat-1':'scenery'},groups:[{id:'scenery',name:'Scenery cast',backgrounds:[{key:'hallway',id:'hall',name:'Hallway'},{key:'library',id:'library',name:'Library'}]},{id:'other',name:'Other cast',backgrounds:[{key:'forest',id:'forest',name:'Forest'},{key:'private',id:'other-only',name:'Other only'}]}],members:[]});
  userFiles.set('output-folders.json',[{id:'cast-background-assets',name:'Background Assets',imageIds:['hall','forest','generic','bad/id'],binding:null},{id:'unrelated',name:'Other images',imageIds:['unrelated'],binding:null}]);
  const beforeCast=structuredClone(userFiles.get('cast-library.json')),beforeFolders=structuredClone(userFiles.get('output-folders.json'));
  const response=await request('load_theater_scenery',{chatId:'chat-1'});assert.equal(response.type,'theater_scenery_result');assert.equal(response.data.castName,'Scenery cast');assert.deepEqual(response.data.assets,[{id:'hall',name:'Hallway',location:true,shared:true},{id:'library',name:'Library',location:true,shared:false},{id:'forest',name:'Forest',location:false,shared:true},{id:'generic',name:'Background 3',location:false,shared:true}]);
  assert.deepEqual(userFiles.get('cast-library.json'),beforeCast);assert.deepEqual(userFiles.get('output-folders.json'),beforeFolders);
  await frontendHandler({type:'load_theater_scenery',requestId:'wrong-scenery-chat',chatId:'chat-other'},'user-1');assert.equal(sent.findLast(e=>e.payload.requestId==='wrong-scenery-chat').payload.type,'studio_error');
 }finally{userFiles.set('cast-library.json',oldCast);userFiles.set('output-folders.json',oldFolders)}
}
console.log('Theater scenery backend PASS: active cast, shared asset union, no writes, stale chat rejection')


// 1.1 compiler: exercise actual tag request -> recipe -> provider, not only pure serializers.
{
 const {parseImageScenePlan,bindSceneIdentities,serializeScenePlan,escapeIdentityQualifiers,resolvePromptFamily,upgradePromptProtocol,parseLayoutBox,buildMossLayoutDraft,compileMossNativeLayout,compileSwarmMossBoxes}=backendModule
 const exampleRoot=new URL('../docs/prompt-compilers/examples/',import.meta.url)
 const scene=(await readFile(new URL('rooftop.scene.txt',exampleRoot),'utf8')).trim()
 const plan=parseImageScenePlan(scene)
 assert.deepEqual(plan.subjects.map(s=>s.owner),['persona','other','character'])
 const ownership={character:'black hair, red eyes',persona:'silver hair, blue eyes'}
 assert.deepEqual(bindSceneIdentities(plan,ownership,true,true),[ownership.persona,'',ownership.character])
 assert.deepEqual(bindSceneIdentities(plan,ownership,true,false),['','',ownership.character])
 const unmarked=parseImageScenePlan(scene.replace(/ \[(character|persona|other)\]/g,''))
 assert.deepEqual(bindSceneIdentities(unmarked,ownership,true,true),['','',''])
 const duplicates=parseImageScenePlan(scene.replace('[other]','[persona]'))
 assert.deepEqual(bindSceneIdentities(duplicates,ownership,true,true),['','',ownership.character])
 const escaped=String.raw`sakura \(naruto\), (red eyes:1.3), TRIGGER_X, rin \(fate\)`
 assert.equal(escapeIdentityQualifiers('sakura (naruto), (red eyes:1.3), TRIGGER_X, '+String.raw`rin \(fate\)`),escaped)
 assert.equal(escapeIdentityQualifiers(escaped),escaped)
 assert.equal(resolvePromptFamily('auto','diffusion_models/MOSS-Image-Base.safetensors'),'moss')
 assert.equal(resolvePromptFamily('auto','Krea_2_Turbo.safetensors'),'krea')
 assert.equal(resolvePromptFamily('auto','anima_aesthetic_v1.safetensors'),'anima-aesthetic')
 assert.equal(resolvePromptFamily('illustrious','anima_aesthetic_v1.safetensors'),'illustrious')
 assert.equal(resolvePromptFamily('auto','anima_aesthetic_v1.safetensors',{architecture:'moss-image'}),'moss')
 assert.equal(resolvePromptFamily('auto','renamed.safetensors',{compatClass:'krea-2'}),'krea')
 assert.equal(resolvePromptFamily('auto','renamed_aesthetic.safetensors',{architecture:'anima'}),'anima-aesthetic')
 assert.equal(resolvePromptFamily('anima','renamed.safetensors',{architecture:'moss-image'}),'anima')
 assert.equal(resolvePromptFamily('auto','illustrious.safetensors',{architecture:'stable-diffusion-xl-v1/base'}),'illustrious')
 for(const value of ['0,0,0,1','0,0,1.1,1','NaN,0,1,1','0,,1,1','0,1,1,0','0,0,1,1,1']) assert.equal(parseLayoutBox(value),null)
 assert.deepEqual(parseLayoutBox('0.05, .1, 0.48, 1'),[.05,.1,.48,1])
 const layoutScene=[
  'quality/meta: score_9, editorial illustration', 'visible count: 2 people', 'scene: Two adults on a rooftop.', 'camera: medium shot',
  'right woman [persona] [box .52,.1,.95,.95]: holding a book',
  'left man [character] [box .05,.1,.48,.95]: smiling',
  'object box [.44,.68,.56,.84]: a red cup',
  'text box [.1,.01,.9,.08]: '+JSON.stringify({caption:'White heading',text:'OPEN, "TODAY"\n第二行'}),
  'environment: rooftop at dusk',
 ].join('\n')
 const layoutPlan=parseImageScenePlan(layoutScene)
 assert.deepEqual(layoutPlan.subjects.map(s=>s.owner),['persona','character'])
 assert.deepEqual(layoutPlan.subjects[0].box,[.52,.1,.95,.95])
 const draft=buildMossLayoutDraft(layoutPlan,'moss-layout',bindSceneIdentities(layoutPlan,ownership,true,true))
 const json=JSON.parse(compileMossNativeLayout(draft,1280,960))
 assert.equal(json.bbox_format,'yxyx');assert.equal(json.bbox_coord_space,'abs_centralized')
 assert.deepEqual(json.items[0].bbox,[-384,25,432,576])
 assert.deepEqual(json.items[1].bbox,[-384,-576,432,-25])
 assert.match(json.items[0].caption,/silver hair/);assert.doesNotMatch(json.items[0].caption,/black hair/)
 assert.equal(json.items[3].text,'OPEN, "TODAY"\n第二行');assert.equal(json.items[3].label,'text')
 assert.doesNotMatch(json.summary.caption,/score_9/)
 assert.throws(()=>compileMossNativeLayout(draft,1025,768),/aligned/)
 assert.throws(()=>buildMossLayoutDraft(parseImageScenePlan(layoutScene.replace('.52,.1,.95,.95','1,0,0,1')),'moss-layout',[]),/Invalid layout/)
 const swarm=compileSwarmMossBoxes(draft)
 assert.match(swarm,/<bbox\[0.52,0.1,0.95,0.95\]:right woman:/)
 assert.equal((swarm.match(/<bbox\[/g)||[]).length,3)
 assert.match(swarm,/Exact lettering:/)
 for (const [file,content] of [['rooftop.layout.scene.txt',layoutScene],['rooftop.moss-layout.json',JSON.stringify(json,null,2)],['rooftop.moss-bbox.txt',swarm]]) {
   const path=new URL(file,exampleRoot)
   if (process.env.UPDATE_PROMPT_EXAMPLES==='1') await (await import('node:fs/promises')).writeFile(path,content+'\n')
   else assert.equal((await readFile(path,'utf8')).trim(),content)
 }
 const ambiguous=buildMossLayoutDraft(parseImageScenePlan('scene: Two people\nleft man [other]: tall\nleft woman [other]: smiling'),'moss-layout',[])
 assert.equal(ambiguous.items.length,0);assert.match(ambiguous.caption,/left woman: smiling/)

 const old='Treat the tag body as a small visual scene plan.'
 assert.equal(upgradePromptProtocol(upgradePromptProtocol(old)),upgradePromptProtocol(old))
 for (const family of ['anima','anima-aesthetic','anima-regional','illustrious','moss','krea']) {
   const compiled=serializeScenePlan(plan,family,bindSceneIdentities(plan,ownership,true,true))
   const exampleFile=new URL(`rooftop.${family}.txt`,exampleRoot)
   if (process.env.UPDATE_PROMPT_EXAMPLES==='1') await (await import('node:fs/promises')).writeFile(exampleFile,compiled+'\n')
   else assert.equal((await readFile(exampleFile,'utf8')).trimEnd(),compiled)
   assert.doesNotMatch(compiled,/\[(character|persona|other)\]/)
   assert.match(compiled,/HELLO,, WORLD/)
   assert.match(compiled,/silver hair, blue eyes/)
   assert.match(compiled,/black hair, red eyes/)
   if (family==='anima-regional'||family==='illustrious') assert.match(compiled,/<region:/)
   else assert.doesNotMatch(compiled,/<region:/)
   if (['anima-aesthetic','moss','krea'].includes(family)) assert.doesNotMatch(compiled,/score_9/)
 }
 const nativeStream=spindle.imageGen.generateStream
 const savedFiles=new Map([...userFiles].map(([k,v])=>[k,structuredClone(v)]))
 const sentInputs=[]
 try {
  spindle.imageGen.generateStream=async function*(input){sentInputs.push(structuredClone({...input,signal:undefined}));return {imageId:`compiler-image-${sentInputs.length}`,imageUrl:`/api/v1/images/compiler-image-${sentInputs.length}`}}
  const previousConfig=userFiles.get('tag-automation-config.json')||{}
  // Independent fixture: earlier tests deliberately alter the workspace and folders.
  userFiles.set('studio-generation-profile.json',{input:{connection_id:'swarm-1',model:'anima-base.safetensors',prompt:'',negativePrompt:'',parameters:{width:1024,height:768}},recordHints:{presets:['Cinematic']},updatedAt:Date.now()})
  const fixtureFolder={id:'character:char-1',name:'Lior',imageIds:[],binding:{type:'character',characterId:'char-1',enabled:true,positivePrompt:'1boy, black hair, red eyes, sakura (naruto)',checkpoint:'',looks:[]}}
  userFiles.set('output-folders.json',[fixtureFolder])
  let index=0
  const generate=async(family,body,persona='active',character='active',expectedError)=>{
    await request('set_tag_automation',{config:{...previousConfig,autoGenerate:true,autoPrintCharacterPositive:true,promptFamily:family,promptMode:'multi',requestMode:'inline',injectProtocol:true}})
    const slot=`compiler-${++index}`
    const fullMatch=`<swarm-image request="generate" slot="${slot}" aspect="4:3" character="${character}" persona="${persona}">${body}</swarm-image>`
    const msg={id:`compiler-message-${index}`,role:'assistant',content:fullMatch,metadata:{}}
    taggedMessages.push(msg)
    const before=sentInputs.length
    await bounded(frontendHandler({type:'tag_generate',requestId:slot,chatId:'chat-1',messageId:msg.id,fullMatch,attrs:{request:'generate',slot,aspect:'4:3',character,persona},content:body,isStreaming:false},'user-1'))
    if (expectedError) {
      assert.equal(sentInputs.length,before,`${family} must reject before provider dispatch`)
      const failed=userFiles.get('tagged-image-jobs.json').find(j=>j.messageId===msg.id)
      assert.equal(failed.status,'failed');assert.match(failed.error,expectedError)
      return ''
    }
    assert.equal(sentInputs.length,before+1,`${family} must dispatch exactly one request`)
    const persisted=userFiles.get('tagged-image-jobs.json').find(j=>j.messageId===msg.id)
    assert.ok(persisted)
    assert.equal(persisted.sourcePrompt,body)
    assert.equal(persisted.prompt,sentInputs.at(-1).prompt)
    assert.ok(persisted.promptCompiler)
    return sentInputs.at(-1).prompt
  }
  const compiled=await generate('anima',scene)
  assert.match(compiled,/^Right: woman, [^\n]*silver hair/m)
  assert.doesNotMatch(compiled,/^Left:[^\n]*silver hair/m)
  assert.doesNotMatch(compiled,/^Center:[^\n]*silver hair/m)
  assert.match(compiled,/HELLO,, WORLD/)
  assert.match(compiled,/score_9/)
  assert.ok(compiled.split('\n').find(line=>line.startsWith('Left:')).includes(String.raw`sakura \(naruto\)`))
  assert.doesNotMatch(compiled,/quality\/meta:|\[persona\]|<region:/)
  assert.equal((compiled.match(/<preset:Cinematic>/g)||[]).length,1)
  for (const filename of ['izakaya-foreground.scene.txt','izakaya-background.scene.txt']) {
    const body=(await readFile(new URL('../docs/prompt-compilers/examples/'+filename,import.meta.url),'utf8')).trim()
    const prompt=await generate('anima',body,'none','active')
    assert.match(prompt,/^2boys, 1girl$/m)
    const diagnostics=userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`).compilerDiagnostics.join(' ')
    assert.match(diagnostics,/camera prioritizes two actors/);assert.match(diagnostics,/share a horizontal anchor/)
  }
  const invisible=await generate('anima',scene.replace('right woman [persona]: waving, looking at the left man','right woman [other]: waving').replace('3 people','3 people'))
  assert.doesNotMatch(invisible,/silver hair, blue eyes, black hoodie/)
  const raw=await generate('anima','An empty rooftop at sunset','active','none')
  assert.doesNotMatch(raw,/silver hair, blue eyes, black hoodie/)
  const moss=await generate('moss',scene)
  assert.match(moss,/Visible text: The sign reads "HELLO,, WORLD"/)
  assert.doesNotMatch(moss,/score_9|<region:/)
  const krea=await generate('krea',scene)
  assert.doesNotMatch(krea,/score_9|<region:/)
  // A character look's checkpoint outranks the workspace model for compiler selection.
  const originalProfile=userFiles.get('studio-generation-profile.json')
  userFiles.set('studio-generation-profile.json',{...originalProfile,input:{...originalProfile.input,model:'anima_aesthetic_v1.safetensors'}})
  const auto=await generate('auto',scene,'none','none')
  assert.doesNotMatch(auto,/score_9/)
  assert.equal(sentInputs.at(-1).model,'anima_aesthetic_v1.safetensors')
  userFiles.set('output-folders.json',[{...fixtureFolder,binding:{...fixtureFolder.binding,checkpoint:'MOSS-Image-Base.safetensors'}}])
  const effective=await generate('auto',scene,'none','active')
  assert.equal(sentInputs.at(-1).model,'MOSS-Image-Base.safetensors')
  assert.match(effective,/Visible subjects:/)
  assert.doesNotMatch(effective,/score_9|<region:/)
  assert.equal(userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`).promptCompiler,'moss')
  // Swarm BBox preserves native preset expansion; the native full document
  // deliberately refuses presets and raw workflows that could mutate its size/prompt.
  const bbox=await generate('moss-bbox',layoutScene)
  assert.match(bbox,/<preset:Cinematic>/);assert.match(bbox,/<bbox\[0.52,0.1,0.95,0.95\]:right woman:/)
  assert.doesNotMatch(bbox,/\[persona\]|\[box /)
  await generate('moss-layout',layoutScene,'active','active',/preset directives/)
  const layoutProfile={...originalProfile,recordHints:{presets:[]},input:{...originalProfile.input,model:'MOSS-Image-Base.safetensors',parameters:{width:1280,height:960,loras:['layout-art.safetensors'],loraWeights:[.7]}}}
  userFiles.set('studio-generation-profile.json',layoutProfile)
  const nativeJson=await generate('moss-layout',layoutScene)
  const actual=JSON.parse(nativeJson), dimensions=sentInputs.at(-1).parameters
  assert.equal(actual.items[3].text,'OPEN, "TODAY"\n第二行')
  assert.deepEqual(actual.items[0].bbox,[-.4*dimensions.height,Math.floor(.52*dimensions.width)-dimensions.width/2,Math.ceil(.95*dimensions.height)-dimensions.height/2,Math.ceil(.95*dimensions.width)-dimensions.width/2])
  assert.ok(dimensions.loras.includes('layout-art.safetensors'));assert.equal(dimensions.loraWeights[dimensions.loras.indexOf('layout-art.safetensors')],.7)
  assert.doesNotMatch(nativeJson,/\[persona\]|\[character\]|<preset:|<bbox\[/)
  const layoutJob=userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`)
  assert.match(layoutJob.compilerDiagnostics.join(' '),/Native MOSS JSON/)
  const beforeRetry=sentInputs.length
  await bounded(frontendHandler({type:'retry_tagged_job',requestId:'layout-retry',jobId:layoutJob.id,retryMode:'original'},'user-1'))
  assert.equal(sentInputs.length,beforeRetry+1);assert.deepEqual(JSON.parse(sentInputs.at(-1).prompt),actual)
  await generate('moss-layout',layoutScene.replace('.52,.1,.95,.95','1,0,0,1'),'active','active',/Invalid layout/)
  userFiles.set('studio-generation-profile.json',{...layoutProfile,input:{...layoutProfile.input,parameters:{...layoutProfile.input.parameters,rawRequestOverride:'{"width":768}'}}})
  await generate('moss-layout',layoutScene,'active','active',/standard prompt path/)
  userFiles.set('studio-generation-profile.json',layoutProfile)
  userFiles.set('studio-generation-profile.json',{...layoutProfile,input:{...layoutProfile.input,parameters:{...layoutProfile.input.parameters,rawRequestOverride:'{"donotsave":true}'}}})
  const safeOverride=await generate('moss-layout',layoutScene)
  assert.equal(JSON.parse(safeOverride).items[3].text,actual.items[3].text)
  assert.equal(JSON.parse(sentInputs.at(-1).parameters.rawRequestOverride).donotsave,true)
  userFiles.set('studio-generation-profile.json',layoutProfile)
  const fallback=await generate('moss-layout','Empty library at dusk','none','none')
  assert.equal(fallback,'Empty library at dusk')
  // Metadata must be requested for the recipe checkpoint, not the workspace model.
  const originalCors=spindle.cors, described=[]
  try {
    spindle.cors=async function(url,options){
      if(!url.endsWith('/API/DescribeModel'))return originalCors.call(this,url,options)
      const request=JSON.parse(options.body);described.push(request.modelName)
      assert.equal(request.subtype,'Stable-Diffusion');assert.ok(request.session_id)
      return {status:200,body:JSON.stringify({model:{name:request.modelName,architecture:'moss-image',compat_class:'moss-image'}})}
    }
    userFiles.set('studio-generation-profile.json',originalProfile)
    userFiles.set('output-folders.json',[{...fixtureFolder,binding:{...fixtureFolder.binding,checkpoint:'custom/renamed-finetune.safetensors'}}])
    const metadataPrompt=await generate('auto',scene,'none','active')
    assert.match(metadataPrompt,/Visible subjects:/);assert.equal(sentInputs.at(-1).model,'custom/renamed-finetune.safetensors')
    assert.deepEqual(described,['custom/renamed-finetune.safetensors'])
    assert.match(userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`).compilerDiagnostics.join(' '),/provider architecture moss-image/)
    await generate('auto',scene,'none','active');assert.equal(described.length,1,'Metadata lookup is cached by exact connection and model')
    const manual=await generate('anima',scene,'none','active');assert.match(manual,/^Left:/m);assert.equal(described.length,1)
    spindle.cors=async function(url,options){
      if(!url.endsWith('/API/DescribeModel'))return originalCors.call(this,url,options)
      return {status:200,body:JSON.stringify({model:{name:'wrong-folder/renamed.safetensors',architecture:'moss-image'}})}
    }
    userFiles.set('output-folders.json',[{...fixtureFolder,binding:{...fixtureFolder.binding,checkpoint:'different-folder/anima-renamed.safetensors'}}])
    const mismatched=await generate('auto',scene,'none','active');assert.match(mismatched,/^Left:/m)
    assert.match(userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`).compilerDiagnostics.join(' '),/checkpoint-name fallback/)
  } finally {spindle.cors=originalCors}
  console.log('MOSS layout PASS: native JSON, exact text, canvas conversion, Swarm BBox presets, guarded overrides, retry, ambiguity, exact effective architecture, cache and fallback')
  // Native activation is eligibility, never a blanket prompt/recipe contribution.
  const getActivated=spindle.world_books.getActivated, getEntry=spindle.world_books.entries.get
  const native=(id,type,fields={})=>({id,comment:`Lore ${id}`,extensions:{swarm_studio_visuals:{enabled:true,entityType:type,positivePrompt:`${id}-shared`,...fields}}})
  const records=[
    native('actor','character',{positivePrompt:'sakura (naruto), LORE_ACTOR',modelPrompts:{moss:{positivePrompt:'MOSS_ACTOR',negativePrompt:'MOSS_NEG'},anima:{positivePrompt:'sakura (naruto), ANIMA_ACTOR',negativePrompt:'ANIMA_NEG'}},stackSnapshot:[{name:'actor-lora.safetensors',weight:.6}]}),
    native('coat','outfit',{positivePrompt:'NAVY_COAT'}),
    native('place','location',{positivePrompt:'STONE_LIBRARY',checkpoint:'MOSS-Image-Base.safetensors',preferredAspect:'16:9',negativePrompt:'NEON_NEG'}),
    native('other-place','location',{positivePrompt:'OTHER_PLACE',checkpoint:'Krea_2.safetensors'}),
    native('past','location',{positivePrompt:'ABSENT_CASTLE',checkpoint:'wrong-checkpoint.safetensors',negativePrompt:'ABSENT_NEG',referenceImageId:'absent-ref',stackSnapshot:[{name:'absent-lora.safetensors',weight:.9}]}),
    native('disabled','character',{enabled:false,positivePrompt:'DISABLED_ACTOR'}),
    native('inactive','character',{positivePrompt:'INACTIVE_ACTOR'}),
    native('art','style',{positivePrompt:'INK_STYLE'}),
    native('prop','object',{positivePrompt:'BRASS_KEY',stackSnapshot:[{name:'actor-lora.safetensors',weight:.9}]}),
  ]
  let activeIds=records.filter(r=>r.id!=='inactive').map(r=>r.id)
  const reads=[]
  spindle.world_books.getActivated=async (chatId,userId)=>{assert.equal(chatId,'chat-1');assert.equal(userId,'user-1');return activeIds.map(id=>({entry_id:id}))}
  spindle.world_books.entries.get=async(id,userId)=>{assert.equal(userId,'user-1');reads.push(id);assert.ok(activeIds.includes(id),'Must never fetch an inactive or arbitrary lore entry');return structuredClone(records.find(r=>r.id===id))}
  try {
    userFiles.set('output-folders.json',[fixtureFolder])
    userFiles.set('studio-generation-profile.json',originalProfile)
    const noLore=await generate('auto',scene,'none','none')
    assert.doesNotMatch(noLore,/ABSENT_CASTLE|STONE_LIBRARY|ANIMA_ACTOR/)
    assert.equal(sentInputs.at(-1).model,'anima-base.safetensors')
    assert.doesNotMatch(sentInputs.at(-1).negativePrompt,/ABSENT_NEG|NEON_NEG/)
    assert.ok(!(sentInputs.at(-1).parameters.loras||[]).includes('absent-lora.safetensors'))
    assert.ok(!sentInputs.at(-1).parameters.referenceImages?.length)
    const marked=scene.replace('Three people', 'Three people').replace('right woman [persona]:','right woman [other]: [[lore:actor]] [[lore:coat]]').replace('environment:', 'environment: [[lore:place]]').replace('scene:', 'scene: [[lore:art]]')
    const selected=await generate('auto',marked,'none','none')
    assert.equal(sentInputs.at(-1).model,'MOSS-Image-Base.safetensors')
    assert.match(selected,/^right woman: [^\n]*MOSS_ACTOR[^\n]*NAVY_COAT/im)
    assert.doesNotMatch(selected,/^left man:[^\n]*MOSS_ACTOR/im)
    assert.match(selected,/STONE_LIBRARY/);assert.match(selected,/INK_STYLE/)
    assert.doesNotMatch(selected,/ABSENT_CASTLE|ANIMA_ACTOR|\[\[lore:/)
    assert.match(sentInputs.at(-1).negativePrompt,/MOSS_NEG/)
    assert.match(sentInputs.at(-1).negativePrompt,/NEON_NEG/)
    assert.ok(sentInputs.at(-1).parameters.loras.includes('actor-lora.safetensors'))
    assert.equal(sentInputs.at(-1).parameters.width,sentInputs.at(-1).parameters.height*4/3)
    const report=()=>userFiles.get('tagged-image-jobs.json').find(job=>job.messageId===`compiler-message-${index}`).loreDiagnostics.join('\n')
    assert.match(report(),/Selected Lore actor.*right woman/)
    assert.match(report(),/positive moss; negative moss/)
    assert.match(report(),/whole image|image-wide/)
    assert.match(report(),/explicit request aspect takes precedence/)
    userFiles.set('studio-generation-profile.json',{...originalProfile,recordHints:{presets:[]}})
    const loreLayout=JSON.parse(await generate('moss-layout',marked,'none','none'))
    assert.match(loreLayout.items.find(item=>item.caption.startsWith('right woman:')).caption,/MOSS_ACTOR.*NAVY_COAT/)
    assert.doesNotMatch(loreLayout.items.find(item=>item.caption.startsWith('left man:')).caption,/MOSS_ACTOR/)
    assert.match(loreLayout.summary.caption,/STONE_LIBRARY/)
    assert.doesNotMatch(JSON.stringify(loreLayout),/ABSENT_CASTLE|\[\[lore:/)
    userFiles.set('studio-generation-profile.json',originalProfile)
    const loreInjected=await interceptorHandler([{role:'user',content:'Show the library'}],{userId:'user-1',chatId:'chat-1'})
    assert.match(loreInjected.messages[0].content,/\[\[lore:actor\]\]/)
    assert.match(macroValues.get('swarm_image_protocol'),/\[\[lore:actor\]\]/)
    assert.doesNotMatch(macroValues.get('swarm_image_protocol'),/\[\[lore:(?:disabled|inactive)\]\]/)
    const conflict=await generate('anima',marked.replace('[[lore:place]]','[[lore:place]] [[lore:other-place]]').replace('[[lore:coat]]','[[lore:coat]] [[lore:prop]]'),'none','none')
    assert.equal(sentInputs.at(-1).model,'anima-base.safetensors')
    assert.match(conflict,/ANIMA_ACTOR/); assert.match(conflict,/BRASS_KEY/)
    assert.ok(conflict.includes(String.raw`sakura \(naruto\)`))
    assert.match(report(),/conflicting lore checkpoint/);assert.match(report(),/conflicting lore LoRA weights/)
    assert.ok(!(sentInputs.at(-1).parameters.loras||[]).includes('actor-lora.safetensors'))
    const invalid=await generate('anima',scene.replace('right woman [persona]:','right woman [persona]: [[lore:actor]] [[lore:disabled]] [[lore:inactive]] [[lore:unknown]]').replace('camera:', 'camera: [[lore:coat]]').replace('environment:', 'environment: [[lore:actor]] [[lore:art]]'),'none','none')
    assert.doesNotMatch(invalid,/ANIMA_ACTOR|NAVY_COAT|INK_STYLE|DISABLED_ACTOR|INACTIVE_ACTOR|\[\[lore:/)
    assert.match(report(),/ambiguous or unsupported marker placement/);assert.match(report(),/not an enabled, activated/)
    const rawLore=await generate('anima','Rooftop at dusk [[lore:past]]','none','none')
    assert.doesNotMatch(rawLore,/ABSENT_CASTLE|\[\[lore:/);assert.equal(sentInputs.at(-1).model,'anima-base.safetensors')
    activeIds=activeIds.filter(id=>id!=='actor')
    const refreshed=await interceptorHandler([{role:'system',content:loreInjected.messages[0].content}],{userId:'user-1',chatId:'chat-1'})
    assert.ok(Array.isArray(refreshed))
    assert.doesNotMatch(refreshed[0].content,/\[\[lore:actor\]\]/)
    assert.match(refreshed[0].content,/\[\[lore:place\]\]/)
    const deactivated=await generate('anima',marked.replace('[[lore:place]]',''),'none','none')
    assert.doesNotMatch(deactivated,/ANIMA_ACTOR/);assert.match(report(),/Skipped actor: not an enabled, activated/)
    assert.ok(!reads.includes('inactive')&&!reads.includes('unknown'))
  } finally { spindle.world_books.getActivated=getActivated;spindle.world_books.entries.get=getEntry }
  console.log('Scoped lore PASS: actual tagged provider dispatch, activation recheck, owner/field scope, model overrides, checkpoint and LoRA conflicts, no global leakage, persisted diagnostics')
 } finally {
  spindle.imageGen.generateStream=nativeStream
  userFiles.clear();for (const [k,v] of savedFiles) userFiles.set(k,v)
 }
}
console.log('1.1 compiler PASS: owner markers, duplicate and missing owners, literal escaping, six dialects, real mocked tag generation, saved raw/compiled prompts, effective checkpoint')

// Quick access is a narrow persisted mutation, not a second identity editor.
{
  const stored = new Map([...userFiles].map(([key, value]) => [key, structuredClone(value)]))
  const personaBefore = structuredClone(activePersona)
  try {
    const quick = await request('get_quick_visuals')
    assert.equal(quick.type, 'quick_visuals_result')
    assert.deepEqual(quick.data.models, [])
    const context = {chatId: quick.data.activeChat.id, characterId: quick.data.activeChat.characterId, personaId: quick.data.activePersona.id}
    const originalFolders = structuredClone(userFiles.get('output-folders.json'))
    const styledFolders = structuredClone(originalFolders)
    const styled = styledFolders.find(f=>f.binding?.characterId===context.characterId)
    if(styled) {
      styled.binding.styleId='quick-base-style'
      const look=styled.binding.looks.find(l=>l.id===styled.binding.activeLookId)
      if(look) look.styleId='quick-look-style'
      userFiles.set('studio-render-styles.json',[{id:'quick-base-style',name:'Base ink'},{id:'quick-look-style',name:'Look watercolor'}])
      userFiles.set('output-folders.json',styledFolders)
      assert.equal((await request('get_quick_visuals')).data.characterStyleName,look?'Look watercolor':'Base ink')
    }
    const automation = structuredClone(userFiles.get('tag-automation-config.json'))
    const originalMode = await request('set_tag_automation',{config:{...automation,promptMode:'multi',requestMode:'parser',parserModel:'saved-parser',promptFamily:'moss'}})
    const narrowMode = await request('set_tag_prompt_mode',{promptMode:'pov'})
    assert.deepEqual(narrowMode.data,{...originalMode.data,promptMode:'pov'},'Quick composition preserves other parser settings')
    userFiles.set('output-folders.json',originalFolders)
    userFiles.set('output-folders.json', originalFolders.filter(f=>f.binding?.characterId!==context.characterId))
    const created = await request('set_quick_visuals',{...context,action:'bind-character'})
    assert.equal(created.data.characterFolder.binding.characterId,context.characterId)
    assert.equal(created.data.characterFolder.binding.activeLookId,'default')
    userFiles.set('output-folders.json',originalFolders)
    const bound = await request('set_quick_visuals', {...context, action:'bind-character'})
    const before = structuredClone(bound.data.characterFolder.binding)
    const paused = await request('set_quick_visuals', {...context, action:'character-enabled',enabled:false})
    assert.deepEqual(paused.data.characterFolder.binding,{...before,enabled:false})
    const currentStack = [{name:'quick/ink.safetensors', title:'Ink',weight:.72,enabled:true,useTrigger:true,sourceUrl:''}]
    const saved = await request('set_quick_visuals', {action:'save-stack',name:'Quick access test',currentStack})
    const preset = saved.data.stackPresets.find(x=>x.name==='Quick access test')
    assert.ok(preset)
    const attached = await request('set_quick_visuals',{...context,action:'stack',presetId:preset.id})
    assert.deepEqual(attached.data.characterFolder.binding,{...before,enabled:false,stackPresetId:preset.id,stackSnapshot:preset.items})
    const custom = await request('set_quick_visuals',{...context,action:'stack-current',currentStack:[{...currentStack[0],weight:.35}]})
    assert.equal(custom.data.characterFolder.binding.stackPresetId,'')
    assert.equal(custom.data.characterFolder.binding.stackSnapshot[0].weight,.35)
    const look = custom.data.characterFolder.binding.looks.at(-1)
    const selected = await request('set_quick_visuals',{...context,action:'look',lookId:look.id})
    assert.deepEqual(selected.data.characterFolder.binding,{...custom.data.characterFolder.binding,activeLookId:look.id})
    const profile = selected.data.personaPresets[0]
    assert.ok(profile)
    const personaResult = await request('set_quick_visuals',{...context,action:'persona',presetId:profile.id,enabled:false})
    assert.deepEqual(personaResult.data.personaBinding,{presetId:profile.id,enabled:false})
    const preserved = structuredClone(userFiles.get('output-folders.json'))
    for (const [id, fields] of [['quick-stale-chat',{...context,chatId:'different',action:'character-enabled',enabled:true}],['quick-stale-persona',{...context,personaId:'different',action:'persona',presetId:profile.id,enabled:true}],['quick-missing-preset',{...context,action:'stack',presetId:'nonexistent'}],['quick-duplicate-name',{action:'save-stack',name:'quick access TEST',currentStack}]]) {
      await frontendHandler({type:'set_quick_visuals',requestId:id,...fields},'user-1')
      assert.equal(sent.findLast(x=>x.payload.requestId===id)?.payload.type,'studio_error')
    }
    assert.deepEqual(userFiles.get('output-folders.json'),preserved)
    assert.equal(activePersona.metadata.swarm_studio_visuals.enabled,false)
  } finally {
    userFiles.clear(); for (const [key,value] of stored) userFiles.set(key,value)
    Object.assign(activePersona,personaBefore)
  }
}
console.log('Quick access PASS: targeted binding, saved/current stack, persona, stale context and duplicate rejection')

// Cast background generation is an isolated, opt-in environment-only job.
{
  const savedFiles = new Map([...userFiles].map(([key,value])=>[key,structuredClone(value)]))
  const oldStream=spindle.imageGen.generateStream,oldGet=spindle.images.get,oldActivated=spindle.world_books.getActivated,oldEntry=spindle.world_books.entries.get
  const oldPermissions=new Set(permissions),inputs=[],owned=new Set()
  let hold=null,fail=false
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))
  const wait=async(predicate,label)=>{for(let i=0;i<300;i++){if(predicate())return;await delay(10)}assert.fail(label)}
  const group='bg-test',other='bg-reuse'
  const library={version:2,activeGroupId:group,inject:true,chatGroups:{'chat-1':group},groups:[{id:group,name:'Scene generation',inject:true,defaultPresentation:'vn-hero'},{id:other,name:'Other cast'}],members:[{id:'bg-character',groupId:group,name:'Actor',prefix:'Actor',identityPrompt:'NEVER_ACTOR',images:{neutral:{id:'bg-portrait'}}}]}
  const read=()=>userFiles.get('cast-library.json'),scenes=()=>read().groups.find(g=>g.id===group)?.backgrounds||[]
  const assets=()=>userFiles.get('output-folders.json').find(f=>f.id==='cast-background-assets')
  const job=(key,status)=>sent.some(x=>x.payload.type==='cast_background_job'&&x.payload.data.key===key&&x.payload.data.status===status)
  const generate=(key,prompt='Quiet rooftop at dusk')=>request('generate_cast_background',{groupId:group,key,name:key,prompt})
  const reply=(key,body='Empty school library',role='assistant',contentOverride)=>{
    const content=contentOverride||`Outside. <swarm-background=${group}:${key}>${body}</swarm-background> <swarm-cast=Actor-neutral background=${key}>“Hello.”</swarm-cast>`
    const message={id:`bg-message-${key}`,role,content,metadata:{}};taggedMessages.push(message)
    const payload={generationId:`bg-gen-${key}`,chatId:'chat-1',messageId:message.id,content}
    return {message,payload,emit:()=>eventHandlers.get('GENERATION_ENDED')(payload,'user-1')}
  }
  try {
    permissions.add('world_books');permissions.delete('cors_proxy')
    userFiles.set('studio-generation-profile.json',{input:{connection_id:'swarm-1',model:'anima-base.safetensors',prompt:'NEVER_PROFILE',negativePrompt:'NEVER_PROFILE_NEG',parameters:{width:1024,height:1024,steps:28,cfgScale:5,loras:['actor-only.safetensors'],loraWeights:[.8],rawRequestOverride:'{"presets":["Character preset"],"comfyuicustomworkflow":"Character graph"}'}},recordHints:{presets:['Character preset']}})
    userFiles.set('output-folders.json',[])
    await request('save_cast_library',{library})
    const dormant=await interceptorHandler([{role:'user',content:'Continue'}],{userId:'user-1',chatId:'chat-1'})
    assert.doesNotMatch(JSON.stringify(dormant),/<swarm-background=/)
    spindle.images.get=async(id,options)=>owned.has(id)?{id,url:`/api/v1/images/${id}`} : oldGet(id,options)
    spindle.imageGen.generateStream=async function*(input){
      inputs.push(input);yield {step:2,totalSteps:8,preview:'data:image/png;base64,AQID'};if(hold)await hold
      if(fail)throw new Error('mock provider failed')
      const id=`background-owned-${inputs.length}`;owned.add(id)
      return {imageId:id,imageUrl:`/api/v1/images/${id}`,model:input.model}
    }
    const disabled=reply('disabled');disabled.emit();await delay(50);assert.equal(inputs.length,0)
    await request('save_cast_library',{library:{...read(),groups:read().groups.map(g=>g.id===group?{...g,generateBackgrounds:true}:g)}})
    const enabled=await interceptorHandler([{role:'user',content:'Continue'}],{userId:'user-1',chatId:'chat-1'})
    assert.match(JSON.stringify(enabled),/<swarm-background=bg-test:new-scene-key>/)
    const first=reply('rooftop','Empty rooftop at sunset');let release;hold=new Promise(resolve=>{release=resolve})
    first.emit();first.emit();await wait(()=>inputs.length===1,'Inline render did not start')
    assert.match(inputs[0].prompt,/no humans|No people/i);assert.match(inputs[0].prompt,/Empty rooftop at sunset/)
    assert.doesNotMatch(inputs[0].prompt,/NEVER|<preset:|Actor/);assert.doesNotMatch(inputs[0].negativePrompt,/NEVER/)
    assert.equal(inputs[0].owner_character_id,undefined);assert.equal(inputs[0].owner_chat_id,undefined)
    assert.equal(inputs[0].parameters.loras,undefined);assert.equal(inputs[0].parameters.referenceImages,undefined)
    assert.equal(inputs[0].parameters.steps,28);assert.equal(inputs[0].parameters.seed,-1)
    assert.ok(inputs[0].parameters.width>inputs[0].parameters.height)
    const metadata=JSON.parse(inputs[0].parameters.rawRequestOverride).extra_metadata
    assert.equal(metadata.studio_stage,'cast_background');assert.equal(metadata.studio_cast_group,group);assert.equal(metadata.studio_background_key,'rooftop')
    assert.deepEqual(Object.keys(JSON.parse(inputs[0].parameters.rawRequestOverride)),['extra_metadata'])
    assert.equal((await generate('rooftop')).data.status,'pending')
    await wait(()=>sent.some(x=>x.payload.type==='cast_background_job'&&x.payload.data.key==='rooftop'&&x.payload.data.preview==='data:image/png;base64,AQID'),'Background preview event missing')
    const pendingBackgrounds=(await request('list_cast_background_jobs',{})).data
    assert.ok(pendingBackgrounds.some(x=>x.groupId===group&&x.key==='rooftop'&&x.step===2&&x.totalSteps===8));assert.ok(pendingBackgrounds.every(x=>!x.preview),'Snapshot should not retain live preview payloads')
    const stale=structuredClone(read())
    await request('set_cast_side',{memberId:'bg-character',side:'right'})
    release();hold=null
    await wait(()=>scenes().length===1&&job('rooftop','ready'),'Background was not saved')
    assert.equal(sent.findLast(x=>x.payload.type==='cast_background_job'&&x.payload.data.key==='rooftop'&&x.payload.data.status==='ready').payload.data.imageId,scenes()[0].id)
    assert.ok(!(await request('list_cast_background_jobs',{})).data.some(x=>x.groupId===group&&x.key==='rooftop'))
    assert.equal(read().members[0].presentationSide,'right');assert.equal(scenes()[0].id,assets().imageIds[0]);assert.equal(assets().binding,null)
    assert.equal(read().groups[0].defaultBackground,'','Generating must not change existing default')
    assert.equal(first.message.content,first.payload.content,'Saved dialogue source remains untouched')
    const rendered=castRenderProcessor({origin:'render',isUser:false,content:first.message.content})
    assert.ok(rendered.content.includes('data-ss-cast-background="rooftop"'));assert.doesNotMatch(rendered.content,/Empty rooftop at sunset|swarm-background=/)
    await frontendHandler({type:'save_cast_library',requestId:'stale-bg-save',library:stale,baseSignature:JSON.stringify(stale)},'user-1')
    assert.equal(sent.findLast(x=>x.payload.requestId==='stale-bg-save')?.payload.type,'studio_error');assert.equal(scenes().length,1)
    first.emit();await delay(30);assert.equal(inputs.length,1);assert.equal((await generate('rooftop')).data.status,'exists')
    // Reuse from the same unbound library without rendering another file.
    const reused=structuredClone(read());reused.groups.find(g=>g.id===other).backgrounds=[{key:'roof',name:'Shared roof',id:assets().imageIds[0],aliases:[]}]
    await request('save_cast_library',{library:reused});assert.equal(read().groups[1].backgrounds[0].id,scenes()[0].id)
    // Exact source, role, matching expression, request count, and code fencing.
    const staleReply=reply('stale');staleReply.message.content='Edited';staleReply.emit()
    reply('user','Empty scene','user').emit()
    reply('wrong','', 'assistant',`<swarm-background=${other}:wrong>Empty room</swarm-background> <swarm-cast=Actor-neutral background=wrong>Hi</swarm-cast>`).emit()
    reply('bad-expression','','assistant',`<swarm-background=${group}:bad-expression>Empty room</swarm-background> <swarm-cast=Actor-invented background=bad-expression>Hi</swarm-cast>`).emit()
    reply('fenced','','assistant',`\`\`\`<swarm-background=${group}:fenced>Empty room</swarm-background>\`\`\` <swarm-cast=Actor-neutral background=fenced>Hi</swarm-cast>`).emit()
    reply('missing-use','','assistant',`<swarm-background=${group}:missing-use>Empty room</swarm-background>`).emit()
    await delay(60);assert.equal(inputs.length,1)
    // Location-specific overrides are permitted; character lore is never applied.
    spindle.world_books.getActivated=async()=>[{id:'bg-place'},{id:'bg-actor'}]
    spindle.world_books.entries.get=async id=>({id,extensions:{swarm_studio_visuals:{enabled:true,entityType:id==='bg-place'?'location':'character',positivePrompt:'NEVER_SHARED',modelPrompts:{moss:{positivePrompt:'MOSS_LIBRARY',negativePrompt:'NEON'}} ,checkpoint:'MOSS-Image-Base.safetensors',stackSnapshot:[{name:'location-art.safetensors',weight:.6}]}}})
    await request('set_tag_automation',{config:{...userFiles.get('tag-automation-config.json'),promptFamily:'auto'}})
    await generate('library','Quiet aisles [[lore:bg-place]]');await wait(()=>job('library','ready'),'Location generation did not finish')
    assert.equal(inputs.at(-1).model,'MOSS-Image-Base.safetensors');assert.match(inputs.at(-1).prompt,/MOSS_LIBRARY/);assert.doesNotMatch(inputs.at(-1).prompt,/NEVER_SHARED|\[\[lore:/);assert.deepEqual(inputs.at(-1).parameters.loras,['location-art.safetensors'])
    await generate('actor-lore','Empty room [[lore:bg-actor]]');await wait(()=>job('actor-lore','error'),'Non-location lore should be rejected');assert.equal(inputs.length,2)
    // Failed automatic render gets a durable receipt; a manual retry is allowed.
    fail=true;const failure=reply('failed','Empty hall');failure.emit();await wait(()=>job('failed','error'),'Expected failed job');assert.equal(scenes().length,2)
    failure.emit();await delay(50);assert.equal(inputs.length,3);fail=false
    await generate('failed','Empty hall');await wait(()=>job('failed','ready'),'Manual retry failed');assert.equal(scenes().length,3)
    // Cast removed while provider runs: archive the asset instead of resurrecting the group.
    hold=new Promise(resolve=>{release=resolve});await generate('orphan','Empty garden');await wait(()=>inputs.length===5,'Render not started')
    await request('save_cast_library',{library:{...read(),activeGroupId:other,groups:read().groups.filter(g=>g.id!==group),members:[],chatGroups:{'chat-1':other}}})
    release();hold=null;await wait(()=>job('orphan','error'),'Expected removed Cast error');assert.ok(assets().imageIds.includes('background-owned-5'));assert.ok(!read().groups.some(g=>g.id===group))
    assert.ok(userFiles.get('studio-assets-v1.json').some(x=>x.imageId==='background-owned-5'&&x.metadata.studio_stage==='cast_background'))
    // Stage Direction can request a location in narration with no Cast packet,
    // even for a Cast whose legacy inline injection/generation is disabled.
    const stageLoad=(await request('load_stage_direction')).data
    const stageConfig={...stageLoad.global,mode:'auto',scenery:true,generate:true}
    await request('save_stage_direction',{scope:'global',expected:stageLoad.global,config:stageConfig})
    const standalone=(key,extra='')=>`<swarm-background=${other}:${key}>Empty hall at dawn</swarm-background>\n\n[[scene: ${key}]]\n\nThe hall was empty.${extra}`
    reply('stage-protected','','assistant',`<div>${standalone('stage-protected')}</div>`).emit()
    reply('stage-missing-cue','','assistant',`<swarm-background=${other}:stage-missing-cue>Empty hall</swarm-background>`).emit()
    await delay(50);assert.equal(inputs.length,5)
    const narrated=reply('stage-narration','','assistant',standalone('stage-narration'));narrated.emit();narrated.emit();await wait(()=>job('stage-narration','ready'),'Standalone Stage Direction background did not finish')
    assert.equal(inputs.length,6);assert.ok(read().groups.find(g=>g.id===other).backgrounds.some(b=>b.key==='stage-narration'));assert.equal(narrated.message.content,narrated.payload.content)
    assert.ok(castRenderProcessor({origin:'render',isUser:false,content:narrated.message.content}).content.includes('data-ss-stage-cue'))
    const stageAfter=(await request('load_stage_direction')).data
    await request('save_stage_direction',{scope:'global',expected:stageAfter.global,config:{...stageAfter.global,generate:false}})
    reply('stage-disabled','','assistant',standalone('stage-disabled')).emit();await delay(50);assert.equal(inputs.length,6)
    // Manual-only workshop: no premature registration, veto, retry, stale approval.
    const inherited=(await request('load_cast_background_settings')).data
    assert.equal(inherited.model,'anima-base.safetensors');assert.equal(inherited.recipe.steps,28)
    assert.ok(inherited.recipe.width>inherited.recipe.height)
    const draft=(settings={})=>request('generate_cast_background',{groupId:other,key:'manual-review',name:'Review me',prompt:'Empty restaurant',review:true,settings})
    const review=async()=>{await wait(()=>sent.some(x=>x.payload.type==='cast_background_job'&&x.payload.data.key==='manual-review'&&x.payload.data.status==='review'),'No manual review');return (await request('list_cast_background_jobs')).data.find(x=>x.groupId===other&&x.key==='manual-review')}
    const approve=(candidateId,action)=>request('review_cast_background',{groupId:other,key:'manual-review',candidateId,action})
    const backgrounds=()=>read().groups.find(g=>g.id===other).backgrounds
    await draft({recipe:{width:768,height:512,steps:43,cfg:3.2,sampler:'euler',scheduler:'normal'},checkpoint:'manual-anima.safetensors',seed:123,negative:'no clutter',aspect:'16:9'})
    let candidate=await review();assert.equal(candidate.status,'review');assert.ok(candidate.candidateId)
    assert.equal(inputs.at(-1).model,'manual-anima.safetensors');assert.equal(inputs.at(-1).parameters.width,768);assert.equal(inputs.at(-1).parameters.height,512);assert.equal(inputs.at(-1).parameters.steps,43);assert.equal(inputs.at(-1).parameters.cfgScale,3.2);assert.equal(inputs.at(-1).parameters.seed,123);assert.match(inputs.at(-1).negativePrompt,/no clutter/);assert.equal(inputs.at(-1).parameters.loras,undefined)
    assert.ok(!backgrounds().some(bg=>bg.key==='manual-review'));assert.ok(!assets().imageIds.includes(candidate.imageId));assert.equal((await draft()).data.status,'review')
    const oldCandidate=candidate.candidateId,rejectedImage=candidate.imageId
    await approve(oldCandidate,'veto');assert.ok(!assets().imageIds.includes(rejectedImage));assert.ok(owned.has(rejectedImage));assert.ok(!backgrounds().some(bg=>bg.key==='manual-review'))
    await draft();await wait(()=>sent.filter(x=>x.payload.type==='cast_background_job'&&x.payload.data.key==='manual-review'&&x.payload.data.status==='review').length===2,'Retry did not finish');candidate=await review();assert.notEqual(candidate.candidateId,oldCandidate)
    assert.equal(inputs.at(-1).parameters.steps,28);assert.equal(inputs.at(-1).parameters.seed,-1)
    await assert.rejects(()=>approve(oldCandidate,'accept'),/no longer awaiting review/)
    await approve(candidate.candidateId,'accept');assert.ok(backgrounds().some(bg=>bg.key==='manual-review'&&bg.id===candidate.imageId));assert.ok(assets().imageIds.includes(candidate.imageId));assert.ok(!assets().imageIds.includes(rejectedImage));assert.ok(!(await request('list_cast_background_jobs')).data.some(x=>x.key==='manual-review'))
    await assert.rejects(()=>approve(candidate.candidateId,'accept'),/no longer awaiting review/)
    await assert.rejects(()=>draft({recipe:{width:1024}}),/both canvas dimensions/)
    userFiles.set('lora-stack-presets.json',[{id:'scenic-stack',name:'Scenic stack',items:[{name:'environment.safetensors',weight:.7,enabled:true},{name:'disabled.safetensors',weight:.5,enabled:false}]}])
    const queued=key=>request('generate_cast_background',{groupId:other,key,name:key,prompt:'Empty room',review:true,settings:{stackId:'scenic-stack'}})
    hold=new Promise(resolve=>{release=resolve});const beforeQueue=inputs.length
    await queued('manual-hold');await wait(()=>inputs.length===beforeQueue+1,'Manual queue did not start')
    await queued('manual-snapshot');const profile=userFiles.get('studio-generation-profile.json');profile.input.parameters.steps=99;userFiles.set('studio-generation-profile.json',profile);userFiles.set('lora-stack-presets.json',[])
    release();hold=null;await wait(()=>job('manual-snapshot','review'),'Queued manual snapshot did not finish')
    assert.equal(inputs.at(-1).parameters.steps,28);assert.deepEqual(inputs.at(-1).parameters.loras,['environment.safetensors']);assert.deepEqual(inputs.at(-1).parameters.loraWeights,[.7])
    const held=(await request('list_cast_background_jobs')).data.filter(x=>['manual-hold','manual-snapshot'].includes(x.key));assert.equal(held.length,2)
    for(const job of held)await request('review_cast_background',{groupId:other,key:job.key,candidateId:job.candidateId,action:'veto'})

    console.log('Manual background review PASS: inherited settings, isolated overrides, preview gate, veto, retry, stale approval and accepted library references')


  }finally{
    spindle.imageGen.generateStream=oldStream;spindle.images.get=oldGet;spindle.world_books.getActivated=oldActivated;spindle.world_books.entries.get=oldEntry
    permissions.clear();for(const p of oldPermissions)permissions.add(p)
    userFiles.clear();for(const [k,v] of savedFiles)userFiles.set(k,v)
  }
}
console.log('Cast background generation PASS: opt-in, source validation, pending/replay dedup, isolated provider payload, location lore, same-ID shared assets, concurrent edits, failure retry and deleted Cast retention')

// Manual Lore is an explicit Studio-only selection, independent of native activation.
{
  const savedFiles = structuredClone(userFiles), savedPermissions = new Set(permissions)
  const oldStream = spindle.imageGen.generateStream, oldGet = spindle.world_books.entries.get, oldList = spindle.world_books.list, oldActive = spindle.world_books.getActivated
  const inputs = []
  const books = [{id:'manual-book',name:'Sekaiichi Hatsukoi'},{id:'manual-book-2',name:'Other world'}]
  const entries = {
    library:{id:'library',world_book_id:'manual-book',comment:'The library',extensions:{swarm_studio_visuals:{enabled:true,entityType:'location',positivePrompt:'SHARED_LIBRARY',modelPrompts:{moss:{positivePrompt:'MOSS_LIBRARY',negativePrompt:'NO_NEON'}},checkpoint:'never-override.safetensors',preferredAspect:'16:9',referenceImageId:'do-not-inherit',stackSnapshot:[{name:'scene.safetensors',weight:.6},{name:'conflict.safetensors',weight:.7},{name:'existing.safetensors',weight:.9}]}}},
    ritsu:{id:'ritsu',world_book_id:'manual-book-2',comment:'Ritsu',extensions:{swarm_studio_visuals:{enabled:true,entityType:'character',positivePrompt:'RITSU_VISIBLE',negativePrompt:'NO_HAT',stackSnapshot:[{name:'conflict.safetensors',weight:.4}]}}},
  }
  const selection=[{bookId:'manual-book',entryId:'library',name:'UNTRUSTED'},{bookId:'manual-book-2',entryId:'ritsu'},{bookId:'manual-book',entryId:'library'}]
  try {
    permissions.add('world_books');permissions.delete('cors_proxy')
    userFiles.set('output-folders.json',[])
    spindle.world_books.list=async options=>{assert.equal(options.userId,'user-1');return {data:books,total:books.length}}
    spindle.world_books.entries.get=async (id,userId)=>{assert.equal(userId,'user-1');return structuredClone(entries[id])}
    spindle.world_books.getActivated=async()=>{throw new Error('Manual selection must not use activation')}
    spindle.imageGen.generateStream=async function*(input){inputs.push(input);yield {step:1,totalSteps:2};return {imageId:`manual-output-${inputs.length}`,imageUrl:`/api/v1/images/manual-output-${inputs.length}`,model:input.model}}
    await request('set_tag_automation',{config:{...userFiles.get('tag-automation-config.json'),promptFamily:'auto'}})
    const base={prompt:'A quiet study session',negativePrompt:'blurry',connection_id:'swarm-1',model:'MOSS-Image-Base.safetensors',parameters:{width:832,height:1024,loras:['existing.safetensors'],loraWeights:[.3]}}
    const response=await request('generate',{input:{...structuredClone(base),clientJobId:'manual-lore-ok'},profileInput:structuredClone(base),manualLore:selection})
    assert.equal(inputs.length,1)
    assert.match(inputs[0].prompt,/A quiet study session\nMOSS_LIBRARY\nRITSU_VISIBLE/)
    assert.doesNotMatch(inputs[0].prompt,/SHARED_LIBRARY|UNTRUSTED/)
    assert.match(inputs[0].negativePrompt,/blurry, NO_NEON, NO_HAT/)
    assert.deepEqual(inputs[0].parameters.loras,['existing.safetensors','scene.safetensors']);assert.deepEqual(inputs[0].parameters.loraWeights,[.3,.6])
    assert.equal(inputs[0].model,base.model);assert.equal(inputs[0].parameters.width,832);assert.equal(inputs[0].parameters.referenceImages,undefined)
    assert.equal(response.data.record.manualLore.length,2);assert.equal(response.data.record.manualLore[0].bookName,'Sekaiichi Hatsukoi');assert.equal(response.data.record.manualLore[0].name,'The library')
    assert.match(response.data.record.manualLoreDiagnostics.join('\n'),/Skipped conflicting Lore LoRA weights/)
    assert.equal(userFiles.get('studio-generation-profile.json').input.prompt,base.prompt)
    assert.deepEqual(userFiles.get('studio-generation-profile.json').input.parameters.loras,['existing.safetensors'])
    assert.equal(userFiles.get('generation-records.json')[0].manualLore[1].name,'Ritsu')
    const reject=async (job,selected,patch={})=>{await frontendHandler({type:'generate',requestId:job,input:{...structuredClone(base),...patch,clientJobId:job},manualLore:selected},'user-1');assert.equal(sent.findLast(x=>x.payload.requestId===job).payload.type,'studio_error');assert.equal(inputs.length,1)}
    await reject('manual-lore-cross-book',[{bookId:'manual-book-2',entryId:'library'}])
    await reject('manual-lore-raw',selection,{parameters:{rawRequestOverride:'{"prompt":"override"}'}})
    await reject('manual-lore-layout',selection,{prompt:'{"summary":{}}'})
    entries.library.extensions.swarm_studio_visuals.enabled=false
    await reject('manual-lore-disabled',selection)
    permissions.delete('world_books');await reject('manual-lore-permission',selection)
    // No selection: the same normal generation route still works and does not inherit Lore.
    const noLore=await request('generate',{input:{...structuredClone(base),clientJobId:'manual-lore-none'},manualLore:[]})
    assert.equal(inputs.length,2);assert.equal(inputs[1].prompt,base.prompt);assert.equal(noLore.data.record.manualLore,undefined)
  } finally {
    spindle.imageGen.generateStream=oldStream;spindle.world_books.entries.get=oldGet;spindle.world_books.list=oldList;spindle.world_books.getActivated=oldActive
    permissions.clear();for(const p of savedPermissions)permissions.add(p)
    userFiles.clear();for(const [k,v] of savedFiles)userFiles.set(k,v)
  }
}
console.log('Manual Lore PASS: explicit cross-book selection, authoritative model prompts and provenance, conflict precedence, profile isolation, stale/disabled/permission rejection and JSON protection')

// Genesis exercises the actual provider/sidecar/processing/storage path, not a
// mocked orchestrator. Every derivative is an owned Lumi image with provenance.
{
  const savedFiles=structuredClone(userFiles),savedPermissions=new Set(permissions)
  const old={stream:spindle.imageGen.generateStream,get:spindle.images.get,read:spindle.images.readBinary,delete:spindle.images.delete,quiet:spindle.generate.quiet}
  const inputs=[],designs=[],owned=new Map(),deleted=[];let fail=false,denyDesignOnce=true,invalidDraftOnce=true
  const png=new Uint8Array(await readFile(new URL("./fixtures/cast-portrait.png",import.meta.url)))
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))
  const rows=()=>userFiles.get('cast-genesis-jobs.json')||[]
  const job=key=>rows().find(item=>item.key===key)
  const wait=async(predicate,label)=>{for(let i=0;i<800;i++){if(predicate())return;await delay(10)}assert.fail(label+': '+JSON.stringify(rows()))}
  const member=key=>userFiles.get('cast-library.json').members.find(m=>m.prefix===key)
  const group='genesis-crew',settings={enabled:true,pipeline:'basics',retention:'final',approval:'auto',reference:'neutral',limit:1} // legacy preference must normalize to prompt-only
  const emit=(id,content,role='assistant')=>{const message={id:'genesis-'+id,role,content,metadata:{}};taggedMessages.push(message);const payload={chatId:'chat-1',messageId:message.id,content,generationId:message.id};const fire=()=>eventHandlers.get('GENERATION_ENDED')(payload,'user-1');fire();return {message,fire}}
  const packet=key=>`<swarm-cast=${key} flag=create type=full-pipeline expression=joy><font color="pink">"Hello!"</font></swarm-cast>`
  try{
    permissions.delete('world_books');permissions.delete('cors_proxy')
    userFiles.set('output-folders.json',[]);userFiles.set('studio-upscale-settings.json',{});userFiles.delete('expression-set.json');userFiles.delete('cast-genesis-jobs.json')
    userFiles.set('studio-generation-profile.json',{input:{connection_id:'swarm-1',model:'anima-base.safetensors',parameters:{width:768,height:768,steps:24}}})
    await request('set_tag_automation',{config:{...userFiles.get('tag-automation-config.json'),mode:'direct',injectProtocol:false,parserConnectionId:'text-1',promptFamily:'anima'}})
    await request('save_cast_library',{library:{version:2,activeGroupId:group,chatGroups:{'chat-1':group},groups:[{id:group,name:'Genesis crew',inject:true}],members:[]}})
    spindle.generate.quiet=async (input,userId)=>{assert.equal(userId,"user-1");assert.equal(input.userId,"user-1","Genesis must send explicit scope to the quiet worker");if(denyDesignOnce){denyDesignOnce=false;throw new Error('userId is required for operator-scoped extensions')}designs.push(structuredClone(input));const key=JSON.parse(input.messages.at(-1).content).characterKey;return {content:JSON.stringify({name:key==='mina'?'Mina Ashido':key,identityPrompt:'adult character, pink hair, cream sweater'})}}
    spindle.images.get=async (id,options)=>owned.get(id)||old.get(id,options)
    spindle.images.readBinary=async id=>{assert.ok(owned.has(id));if(invalidDraftOnce){invalidDraftOnce=false;return Uint8Array.of(1,2,3)}return png}
    spindle.images.delete=async id=>{assert.ok(owned.has(id));deleted.push(id);owned.delete(id);return true}
    spindle.imageGen.generateStream=async function*(input){assert.equal(input.userId,'user-1','Genesis provider requests require explicit scope');inputs.push(structuredClone(input));yield {step:2,totalSteps:8};const metadata=JSON.parse(input.parameters.rawRequestOverride).extra_metadata;if(fail&&metadata.studio_stage==='background_removed'){fail=false;throw new Error('fixture removal failure')};const id=`genesis-owned-${String(inputs.length).padStart(4,'0')}-asset`;owned.set(id,{id,url:`/api/v1/images/${id}`,mime_type:'image/png',width:null,height:null});return {imageId:id,imageUrl:`/api/v1/images/${id}`,model:input.model}}
    emit('disabled',packet('disabled'));await delay(50);assert.equal(inputs.length,0)
    await request('set_cast_genesis_settings',{groupId:group,settings})
    assert.equal(userFiles.get('cast-library.json').groups.find(g=>g.id===group).genesis.reference,'prompt')
    const prompt=await interceptorHandler([{role:'user',content:'Continue'}],{userId:'user-1',chatId:'chat-1'})
    assert.match(JSON.stringify(prompt),/flag=create type=basics-pipeline/)
    const albumRecipe={version:1,connectionId:'swarm-1',checkpoint:'anima-base.safetensors',family:'anima',generation:{recipe:{width:640,height:960,steps:36,cfg:4},prefix:'solo, cowboy shot, ALBUM STYLE, <preset:Alien Stage>, @qmeng_ci @VIVINOS',negative:'ALBUM NEGATIVE'},appearance:'ADULT CASUAL WARDROBE',sidecarInstructions:'USE ONE FIXED OUTFIT',stack:[{name:'house-style.safetensors',weight:.75,enabled:true,useTrigger:true,trigger:'HOUSE TRIGGER'},{name:'disabled.safetensors',weight:1,enabled:false}],enhance:false,background:{mode:'builtin'}}
    await request('set_cast_recipe',{groupId:group,recipe:albumRecipe})
    const first=emit('first',packet('mina')+' '+packet('over-budget'));first.fire()
    await wait(()=>job('mina')?.status==='error','Expected simulated sidecar failure')
    assert.match(job('mina').error,/Genesis design sidecar: userId is required/)
    const originalGenesisId=job('mina').id;assert.equal(inputs.length,0);assert.equal(member('mina'),undefined)
    assert.equal(job('mina').castRecipe.stack[0].weight,.75)
    await request('set_cast_recipe',{groupId:group,recipe:{...albumRecipe,sidecarInstructions:'CHANGED AFTER QUEUE',stack:[{name:'other-style.safetensors',weight:1}]}})
    await delay(30);await request('control_cast_genesis_job',{id:originalGenesisId,action:'retry'})
    await wait(()=>job('mina')?.status==='error','Expected missing-dimensions failure on unreadable draft')
    assert.match(job('mina').error,/Removing background · neutral: Source image dimensions/)
    const initialMember=member('mina').id, initialDraft=job('mina').intermediates.neutral.draft
    assert.ok(owned.has(initialDraft));assert.equal(inputs.length,1);assert.equal(designs.length,1)
    assert.match(designs[0].messages[0].content,/Choose one coherent outfit/)
    assert.match(designs[0].messages[0].content,/restrained expressions, composed body language/)
    assert.match(designs[0].messages[0].content,/bubbly expressions, expressive posing/)
    assert.match(designs[0].messages[0].content,/Do not specify a fixed facial expression, emotion, gesture or pose/)
    assert.doesNotMatch(inputs[0].prompt,/bubbly expressions, expressive posing/,'Sidecar guidance must not be appended directly to the diffusion prompt')
    assert.match(designs[0].messages[0].content,/ADULT CASUAL WARDROBE/);assert.match(designs[0].messages[0].content,/USE ONE FIXED OUTFIT/);assert.doesNotMatch(designs[0].messages[0].content,/CHANGED AFTER QUEUE/)
    assert.match(inputs[0].prompt,/ALBUM STYLE/);assert.match(inputs[0].prompt,/HOUSE TRIGGER/);assert.doesNotMatch(inputs[0].prompt,/USE ONE FIXED OUTFIT/);assert.equal(inputs[0].negativePrompt,'ALBUM NEGATIVE');assert.deepEqual(inputs[0].parameters.loras,['house-style.safetensors']);assert.deepEqual(inputs[0].parameters.loraWeights,[.75]);assert.equal(inputs[0].parameters.width,640);assert.equal(inputs[0].parameters.height,960);assert.equal(inputs[0].parameters.steps,36)
    // A queued alpha.8.2 job may still carry the old reference preference.
    const legacy=structuredClone(rows());legacy[0].settings.reference='neutral';userFiles.set('cast-genesis-jobs.json',legacy)
    await delay(30);await request('control_cast_genesis_job',{id:originalGenesisId,action:'retry'})
    await wait(()=>job('mina')?.status==='ready'||job('mina')?.status==='error','Genesis failed to finish')
    assert.equal(member('mina').id,initialMember);assert.equal(job('mina').settings.reference,'prompt')
    assert.ok(deleted.includes(initialDraft),'The original draft was reused then cleaned')
    assert.equal(job('mina').id,originalGenesisId)
    assert.equal(job('mina').status,'ready',job('mina').error);assert.equal(job('mina').completed,6);
    const published=await request('list_cast_genesis_jobs');assert.deepEqual(published.data.find(item=>item.id===originalGenesisId).slots,['neutral','joy','sadness','anger','surprise','fear']);assert.equal(designs.length,1);assert.equal(inputs.length,12);assert.equal(rows().length,1)
    assert.equal(designs[0].connection_id,'text-1');assert.match(designs[0].messages.at(-1).content,/Mina|mina/)
    assert.equal(member('mina').name,'Mina Ashido');assert.equal(Object.keys(member('mina').images).length,6)
    assert.equal(deleted.length,6);assert.equal(owned.size,6);assert.equal(userFiles.get('output-folders.json').find(x=>x.id===`cast:${member('mina').id}`).imageIds.length,6)
    for(const input of inputs){const override=JSON.parse(input.parameters.rawRequestOverride);assert.ok(override.extra_metadata.studio_genesis_job);if(override.extra_metadata.studio_stage==='expression_draft'){assert.equal(override.donotsave,true);assert.match(input.prompt,/pink hair/);assert.ok(input.prompt.includes('<preset:Alien Stage>, @qmeng_ci @VIVINOS'));assert.ok(!input.parameters.referenceImages?.length);assert.ok(!override.promptimages&&!override.useipadapter&&!override.comfyworkflowraw)}else{assert.equal(override.donotsave,undefined);assert.match(override.comfyworkflowraw,/birefnet/);assert.equal(input.parameters.width,255);assert.equal(input.parameters.height,342)}}
    assert.ok(Object.values(member('mina').images).every(image=>owned.has(image.id)));assert.equal(first.message.content,packet('mina')+' '+packet('over-budget'))
    const transformed=castRenderProcessor({origin:'render',isUser:false,content:first.message.content});assert.match(transformed.content,/data-ss-cast-requested-expression="joy"/);assert.match(transformed.content,/&quot;Hello!&quot;/)
    first.fire();emit('again',packet('mina'));emit('fenced','```\n'+packet('fenced'));emit('user',packet('user'),'user');await delay(80);assert.equal(inputs.length,12);assert.equal(rows().length,1)
    await request('set_cast_recipe',{groupId:group,recipe:null})
    await request('set_cast_genesis_settings',{groupId:group,settings:{...settings,approval:'review',retention:'normal'}})
    emit('review',packet('kirishima'));await wait(()=>job('kirishima')?.status==='review','Missing review state');assert.equal(inputs.length,12);assert.equal(member('kirishima'),undefined)
    fail=true;await request('control_cast_genesis_job',{id:job('kirishima').id,action:'approve'});await wait(()=>job('kirishima')?.status==='error','Missing processing failure');assert.equal(inputs.length,14)
    const partialId=member('kirishima').id,draft=job('kirishima').intermediates.neutral.draft;assert.ok(owned.has(draft));assert.equal(Object.keys(member('kirishima').images).length,0)
    await request('control_cast_genesis_job',{id:job('kirishima').id,action:'retry'});await wait(()=>job('kirishima')?.status==='ready'||job('kirishima')?.status==='error','Resume did not finish');assert.equal(job('kirishima').status,'ready',job('kirishima').error);assert.equal(member('kirishima').id,partialId);assert.equal(designs.length,2);assert.equal(inputs.length,25);assert.ok(!owned.has(draft));assert.equal(owned.size,12)
    assert.equal(JSON.parse(inputs[12].parameters.rawRequestOverride).donotsave,undefined)
    assert.ok((await request('list_cast_genesis_activity')).data.every(x=>x.status==='ready'))
    // An existing empty member keeps its identity. Full selection and configured
    // enhancement are honored without asking the sidecar to redesign them.
    const library=structuredClone(userFiles.get('cast-library.json'))
    library.members.push({id:'existing-member',groupId:group,prefix:'momo',name:'Momo',identityPrompt:'saved identity, dark hair',images:{}})
    await request('save_cast_library',{library})
    await request('set_cast_genesis_settings',{groupId:group,settings:{...settings,pipeline:'full'}})
    userFiles.set('studio-upscale-settings.json',{'swarm-1':{mode:'custom',graph:JSON.stringify({'1':{class_type:'SwarmLoadImageB64',inputs:{image_base64:'${init_image}'}},'2':{class_type:'SaveImage',inputs:{images:['1',0],filename_prefix:'old'}}})}})
    userFiles.set('studio-render-styles.json',[{id:'genesis-style',name:'Ink',positiveAppend:'approved ink style',negativeAppend:'no blur',loraStackId:''}])
    userFiles.set('studio-generation-profile.json',{input:{connection_id:'swarm-1',model:'anima-base.safetensors',prompt:'UNRELATED_ILLUSTRATION',parameters:{width:768,height:768,steps:24,loras:['unrelated.safetensors'],loraWeights:[.8]}},recordHints:{styleId:'genesis-style'}})
    emit('full','<swarm-cast=momo flag=create type=basics-pipeline>"Hello."</swarm-cast>')
    await wait(()=>job('momo')?.status==='ready'||job('momo')?.status==='error','Full production did not finish')
    assert.equal(job('momo').status,'ready',job('momo').error);assert.equal(job('momo').completed,20);assert.equal(member('momo').id,'existing-member');assert.equal(designs.length,2);assert.equal(inputs.length,85);assert.equal(owned.size,32)
    const full=inputs.slice(25),drafts=full.filter(x=>JSON.parse(x.parameters.rawRequestOverride).extra_metadata.studio_stage==='expression_draft')
    assert.equal(drafts.length,20);assert.ok(drafts.every(x=>x.prompt.includes('saved identity')&&x.prompt.includes('approved ink style')&&!x.prompt.includes('UNRELATED_ILLUSTRATION')&&x.negativePrompt.includes('no blur')&&!x.parameters.loras.includes('unrelated.safetensors')))
    assert.ok(full.filter(x=>JSON.parse(x.parameters.rawRequestOverride).extra_metadata.studio_stage==='upscale_result').length===20)
    assert.equal(Object.keys(member('momo').images).length,20)
    // New opt-in: neutral is prompt-only, all following drafts use the same registered
    // neutral binary. Do not reuse a deleted intermediate or silently switch on Resume.
    userFiles.set('studio-upscale-settings.json',{})
    await request('set_cast_recipe',{groupId:group,recipe:albumRecipe})
    await request('set_cast_genesis_settings',{groupId:group,settings:{...settings,reference:'anima-neutral'}})
    assert.equal(userFiles.get('cast-library.json').groups.find(g=>g.id===group).genesis.reference,'anima-neutral')
    const start=inputs.length
    emit('anchor',packet('anchor'))
    await wait(()=>job('anchor')?.status==='ready'||job('anchor')?.status==='error','Reference production did not finish')
    assert.equal(job('anchor').status,'ready',job('anchor').error);assert.equal(job('anchor').completed,6)
    const anchorId=member('anchor').images.neutral.id
    assert.equal(job('anchor').neutralReferenceId,anchorId);assert.ok(owned.has(anchorId));assert.equal(inputs.length-start,12)
    const anchored=inputs.slice(start).filter(x=>JSON.parse(x.parameters.rawRequestOverride).extra_metadata.studio_stage==='expression_draft')
    assert.equal(anchored.length,6);assert.ok(!anchored[0].parameters.referenceImages?.length)
    assert.equal(JSON.parse(anchored[0].parameters.rawRequestOverride).donotsave,true)
    for(const input of anchored.slice(1)){
      assert.ok(input.parameters.referenceImages?.length===1)
      const raw=JSON.parse(input.parameters.rawRequestOverride)
      assert.match(raw.comfyworkflowraw,/AnimaRefAdapter/);assert.equal(raw.donotsave,undefined)
      assert.ok(input.prompt.includes('pink hair'));assert.ok(input.prompt.includes('ALBUM STYLE'))
    }
    assert.equal(Object.keys(member('anchor').images).length,6);assert.ok(Object.values(member('anchor').images).every(im=>owned.has(im.id)))
    const oldId=member('mina').id,oldImages=Object.values(member('mina').images).map(x=>x.id)
    await request('remove_cast_member',{groupId:group,memberId:oldId})
    assert.equal(member('mina'),undefined);assert.ok(oldImages.every(id=>owned.has(id)));assert.ok(member('momo').images.neutral)
    await request('set_cast_genesis_settings',{groupId:group,settings:{...settings,approval:'review'}})
    first.fire();await delay(60);assert.equal(rows().filter(x=>x.key==='mina').length,1,'Original reply cannot recreate removed member')
    emit('recreate',packet('mina'));await wait(()=>rows().filter(x=>x.key==='mina').some(x=>x.status==='review'),'Fresh reply can recreate removed character')
    assert.equal(rows().filter(x=>x.key==='mina').length,2);assert.equal(member('mina'),undefined);assert.ok(oldImages.every(id=>owned.has(id)))
  }finally{spindle.imageGen.generateStream=old.stream;spindle.images.get=old.get;spindle.images.readBinary=old.read;spindle.images.delete=old.delete;spindle.generate.quiet=old.quiet;permissions.clear();for(const p of savedPermissions)permissions.add(p);userFiles.clear();for(const [k,v]of savedFiles)userFiles.set(k,v)}
}
console.log('Cast Genesis PASS: empty-album protocol, opt-in, sidecar, user budget, final-only cleanup, immutable reply, replay exclusion, review, failure and durable retry')

// Auto authoring must resolve the same dialect as dispatch; an already expanded
// macro must not leave yesterday's checkpoint guidance in today's RP prompt.
{
  const saved=structuredClone(userFiles), previousCors=spindle.cors, previousQuiet=spindle.generate.quiet
  const lookups=[], calls=[]
  const profile=model=>({input:{connection_id:'swarm-1',model,parameters:{width:832,height:640}},recordHints:{},updatedAt:Date.now()})
  const fixtureFolder={id:'character:char-1',name:'Lior',imageIds:[],binding:{type:'character',characterId:'char-1',enabled:true,positivePrompt:'1boy, black hair',looks:[]}}
  const config={promptFamily:'auto',requestMode:'inline',promptMode:'multi',autoGenerate:false,injectProtocol:true,parserConnectionId:'text-1'}
  const ctx={userId:'user-1',chatId:'chat-1'}
  const prompt=async messages=>{const result=await interceptorHandler(messages||[{role:'user',content:'Continue'}],ctx);return Array.isArray(result)?result.map(m=>m.content).join('\n'):result.messages.map(m=>m.content).join('\n')}
  try{
    spindle.cors=async function(url,options){
      if(!url.endsWith('/API/DescribeModel'))return previousCors.call(this,url,options)
      const {modelName}=JSON.parse(options.body);lookups.push(modelName)
      const architecture=modelName.includes('renamed-moss')?'moss-image':modelName.includes('renamed-anime')?'anima':modelName.includes('renamed-krea')?'krea-2':'stable-diffusion-xl-v1/base'
      return {status:200,body:JSON.stringify({model:{name:modelName,architecture}})}
    }
    userFiles.set('output-folders.json',[fixtureFolder]);userFiles.set('studio-generation-profile.json',profile('AutoFixtures/renamed-anime.safetensors'))
    await request('set_tag_automation',{config})
    const anima=await prompt();assert.match(anima,/ANIMA SUBJECT SERIALIZER/);assert.match(anima,/2boys, 1girl/);assert.match(anima,/Gelbooru/);assert.doesNotMatch(anima,/AUTO SUBJECT SERIALIZER/)
    assert.equal(lookups.filter(x=>x==='AutoFixtures/renamed-anime.safetensors').length,1)
    const expanded=macroValues.get('swarm_image_protocol')
    userFiles.set('studio-generation-profile.json',profile('AutoFixtures/renamed-moss.safetensors'))
    const refreshed=await prompt([{role:'system',content:'Custom surrounding instructions\n'+expanded+'\nCustom footer'}])
    assert.match(refreshed,/MOSS · CAPTION SUBJECT SERIALIZER/);assert.doesNotMatch(refreshed,/ANIMA SUBJECT SERIALIZER/);assert.match(refreshed,/Custom surrounding instructions/);assert.match(refreshed,/Custom footer/)
    userFiles.set('studio-generation-profile.json',profile('AutoFixtures/unknown.safetensors'));assert.match(await prompt(),/AUTO SUBJECT SERIALIZER/)
    userFiles.set('studio-generation-profile.json',profile('AutoFixtures/anima_aesthetic.safetensors'));assert.match(await prompt(),/Aesthetic needs no quality score tags/)
    userFiles.set('studio-generation-profile.json',profile('AutoFixtures/renamed-krea.safetensors'));assert.match(await prompt(),/KREA 2 SUBJECT SERIALIZER/)
    userFiles.set('studio-generation-profile.json',profile('AutoFixtures/renamed-anime.safetensors'))
    userFiles.set('output-folders.json',[{...fixtureFolder,binding:{...fixtureFolder.binding,checkpoint:'AutoFixtures/renamed-moss.safetensors'}}])
    assert.match(await prompt(),/MOSS · CAPTION SUBJECT SERIALIZER/)
    await request('set_tag_automation',{config:{...config,promptFamily:'anima-regional'}});assert.match(await prompt(),/Experimental Swarm regions are enabled/)
    // Parser mode leaves the RP placement instruction light, then resolves each
    // requested slot using the known character inclusion/recipe.
    await request('set_tag_automation',{config:{...config,requestMode:'parser'}})
    assert.doesNotMatch(await prompt(),/ANIMA SUBJECT SERIALIZER|MOSS · CAPTION SUBJECT SERIALIZER/)
    spindle.generate.quiet=async(input,userId)=>{assert.equal(userId,'user-1');assert.equal(input.userId,'user-1');calls.push(structuredClone(input));return {content:'<swarm-image request="generate" slot="auto-actor">A person.</swarm-image><swarm-image request="generate" slot="auto-place">An empty room.</swarm-image>'}}
    const content='<swarm-image request="parse" slot="auto-actor" character="active" persona="none">A person.</swarm-image><swarm-image request="parse" slot="auto-place" character="none" persona="none">An empty room.</swarm-image>'
    const msg={id:'auto-authoring-parser',role:'assistant',content,metadata:{}};taggedMessages.push(msg)
    eventHandlers.get('GENERATION_ENDED')({chatId:'chat-1',messageId:msg.id,generationId:msg.id,content},'user-1')
    for(let attempt=0;attempt<200&&!sent.some(item=>item.payload.type==='parser_completion_result'&&item.payload.data?.messageId===msg.id);attempt++)await new Promise(resolve=>setTimeout(resolve,10))
    assert.equal(calls.length,1);const instructions=calls[0].messages[0].content
    assert.match(instructions,/PER-REQUEST COMPILER GUIDANCE/);assert.match(instructions,/slot auto-actor:\nBEGIN STUDIO COMPILER GUIDANCE\nMOSS · CAPTION SUBJECT SERIALIZER/);assert.match(instructions,/slot auto-place:\nBEGIN STUDIO COMPILER GUIDANCE\nANIMA SUBJECT SERIALIZER/)
    assert.ok(sent.some(item=>item.payload.type==='parser_completion_result'&&item.payload.data?.messageId===msg.id))
  }finally{spindle.cors=previousCors;spindle.generate.quiet=previousQuiet;userFiles.clear();for(const [k,v] of saved)userFiles.set(k,v)}
}
console.log('Auto authoring PASS: provider-first guidance, cached resolution, changed checkpoint and expanded macro refresh, unknown fallback, Aesthetic, manual override, and mixed parser slot dialects')

// Reconstructed owned scene plans from the live izakaya CG metadata. These are
// not claimed to be the original authored packet (only final metadata survived).
{
  for (const filename of ['izakaya-foreground.scene.txt','izakaya-background.scene.txt']) {
    const source=(await readFile(new URL('../docs/prompt-compilers/examples/'+filename,import.meta.url),'utf8')).trim()
    const plan=backendModule.parseImageScenePlan(source);assert.equal(plan.subjects.length,3)
    const compiled=backendModule.serializeScenePlan(plan,'anima',[])
    assert.match(compiled,/^2boys, 1girl$/m);assert.ok(compiled.includes(String.raw`Todoroki Shoto_\(My Hero Academia\)`));assert.ok(compiled.includes('(amber lantern:1.2)'))
    const mina=compiled.split('\n').find(line=>line.includes('yellow horns'));assert.ok(mina);assert.match(mina,/pink skin/)
    assert.equal((compiled.match(/yellow horns/g)||[]).length,1);assert.doesNotMatch(compiled,/^Left: subject,/m)
    assert.equal(backendModule.serializeScenePlan(plan,'moss',[]).includes('Todoroki Shoto_(My Hero Academia)'),true)
  }
}
console.log('Izakaya composition PASS: precise counts from explicit headings, authored qualifiers protected, explicit weights preserved, traits stay in their authored subject, caption dialect unchanged')

// Optional explicit count: use grouped native weighting, not identity inference.
{
  const {parseExplicitCount,applyExplicitCount,parseImageScenePlan,serializeScenePlan,buildMossLayoutDraft,compileMossNativeLayout}=backendModule
  assert.equal(parseExplicitCount('1girl, 2boys').tags,'2boys, 1girl')
  for(const invalid of ['3','2boys, 1girl:1.5','2boy','1girls','1boy, 2boys','2boys, <lora:thing>','21boys','0girls','1girl,'])assert.equal(parseExplicitCount(invalid),null,invalid)
  const scene='quality/meta: masterpiece, best quality, safe\nvisible count: 2boys, 1girl\nscene: Three characters around a table.\ncamera: medium wide three-shot\nleft man [other]: blond hair, red eyes, (black shirt:1.2)\ncenter man [other]: two-tone hair, heterochromia\nright woman [other]: pink skin, yellow horns\nenvironment: izakaya, amber lighting'
  const plan=parseImageScenePlan(scene)
  for(const family of ['anima','anima-aesthetic','anima-regional','illustrious']){
    const before=serializeScenePlan(plan,family,[])
    const result=applyExplicitCount(before,'2boys, 1girl',1.5,family,plan)
    assert.equal((result.prompt.match(/\(2boys, 1girl:1\.5\)/g)||[]).length,1,family)
    assert.equal((result.prompt.match(/2boys/g)||[]).length,1,family)
    assert.ok(result.prompt.includes('(black shirt:1.2)'))
    assert.ok(result.prompt.includes('yellow horns'))
    assert.match(result.diagnostic,/Explicit count/)
    assert.equal(applyExplicitCount(before,'2boys',1.5,family,plan).prompt,before)
    assert.equal(applyExplicitCount(before,'2boys, 1girl',0,family,plan).prompt,before)
  }
  const original=serializeScenePlan(plan,'anima',[])
  for(const malformed of ['2boys,','3','2boys 1girl','']){
    const recovered=applyExplicitCount(original,malformed,1.5,'anima',plan)
    assert.match(recovered.prompt,/\(2boys, 1girl:1\.5\)/);assert.match(recovered.diagnostic,/Recovered malformed/)
  }
  for(const bad of [undefined,'(2boys, 1girl:1.2)','2boys, <preset:foo>','1boy, 2girls'])assert.equal(applyExplicitCount(original,bad,1.5,'anima',plan).prompt,original)
  const contradictory=parseImageScenePlan(scene.replace('right woman','right man'))
  assert.equal(applyExplicitCount(original,'3',1.5,'anima',contradictory).prompt,original)
  const incomplete=parseImageScenePlan(scene.replace('right woman [other]: pink skin, yellow horns\n',''))
  assert.equal(applyExplicitCount(original,'3',1.5,'anima',incomplete).prompt,original)
  const raw='masterpiece, 2boys, 1girl, (red hair, blue eyes:1.2), <preset:foo,bar>, izakaya' 
  const result=applyExplicitCount(raw,'2boys, 1girl',1.5,'anima')
  assert.match(result.prompt,/\(2boys, 1girl:1\.5\)/);assert.ok(result.prompt.includes('(red hair, blue eyes:1.2)'));assert.ok(result.prompt.includes('<preset:foo,bar>'))
  for(const raw of ['(2boys, 1girl:1.3), izakaya','(2boys:1.2), 1girl, izakaya','1boy, 2girls, izakaya','solo, izakaya'])assert.equal(applyExplicitCount(raw,'2boys, 1girl',1.5,'anima').prompt,raw)
  const caption=applyExplicitCount(serializeScenePlan(plan,'krea',[]),'2boys, 1girl',1.5,'krea',plan)
  assert.match(caption.prompt,/Exactly 3 visible characters: 2 male characters, 1 female character/);assert.doesNotMatch(caption.prompt,/:1\.5\)/)
  const layout=buildMossLayoutDraft(plan,'moss-layout',[])
  layout.caption=applyExplicitCount(layout.caption,'2boys, 1girl',1.5,'moss-layout',plan).prompt
  const native=JSON.parse(compileMossNativeLayout(layout,832,640))
  assert.match(native.summary.caption,/Exactly 3 visible characters/);assert.equal(native.items.length,3)
  const rawJson='{"summary":{"caption":"hello"},"items":[]}'
  assert.equal(applyExplicitCount(rawJson,'1boy',1.5,'moss-layout').prompt,rawJson)
}
console.log('Explicit count PASS: strict validation, grouped weights, actor isolation, authored weight preservation, conflicting counts, off, caption and native JSON')

// Studio Edit saves a distinct extension-owned PNG, never overwrites source bytes,
// and replaces only the exact reference the editor originally opened.
{
 const originalGet=spindle.images.get,originalList=spindle.images.list,originalUpload=spindle.images.uploadFromDataUrl,originalDelete=spindle.images.delete
 const libraryBefore=structuredClone(userFiles.get('cast-library.json')), images=new Map([['edit-source',{id:'edit-source',owner_chat_id:'chat-1'}],['other-expression',{id:'other-expression'}]])
 const png='data:image/png;base64,'+(await readFile(new URL('./fixtures/cast-portrait.png',import.meta.url))).toString('base64')
 let uploads=0
 try{
  spindle.images.get=async(id,options)=>{assert.equal(options.userId,'user-1');return images.get(id)||null}
  spindle.images.list=async options=>{assert.equal(options.userId,'user-1');assert.equal(options.onlyOwned,true);return {data:[...images.values()],total:images.size}}
  spindle.images.uploadFromDataUrl=async(data,options)=>{assert.equal(data,png);assert.equal(options.userId,'user-1');assert.equal(options.owner_chat_id,'chat-1');assert.match(options.originalFilename,/edit\.png$/);const id=`edited-${++uploads}`;const image={id};images.set(id,image);return image}
  spindle.images.delete=async()=>{throw new Error('Editor must never delete images')}
  await request('save_cast_library',{library:{groups:[{id:'edit-group',name:'Edit',backgrounds:[{key:'scene',id:'edit-source',name:'Scene'}]}],members:[{id:'edit-member',groupId:'edit-group',name:'Actor',prefix:'actor',images:{neutral:{id:'edit-source',url:'/api/v1/images/edit-source'}}},{id:'edit-other',groupId:'edit-group',name:'Other',prefix:'other',images:{neutral:{id:'other-expression',url:'/api/v1/images/other-expression'}}}]}})
  const result=(await request('save_local_edit',{png,sourceId:'edit-source',label:'Actor'})).data
  assert.equal(result.id,'edited-1');assert.equal(result.record.studioMetadata.studio_storage,'lumi_only');assert.equal(result.record.studioMetadata.studio_stage,'local_edit');assert.equal(result.record.swarmPathVerified,false)
  assert.ok(result.record.parameters.width>0&&result.record.parameters.height>0)
  await request('replace_cast_edit',{memberId:'edit-member',expression:'neutral',sourceId:'edit-source',imageId:result.id})
  const current=()=>userFiles.get('cast-library.json')
  assert.equal(current().members.find(m=>m.id==='edit-member').images.neutral.id,result.id)
  assert.equal(current().members.find(m=>m.id==='edit-other').images.neutral.id,'other-expression')
  const second=(await request('save_local_edit',{png,sourceId:'edit-source',label:'Actor'})).data
  await assert.rejects(request('replace_cast_edit',{memberId:'edit-member',expression:'neutral',sourceId:'edit-source',imageId:second.id}),/changed while you were editing/)
  assert.equal(current().members.find(m=>m.id==='edit-member').images.neutral.id,result.id)
  await request('replace_cast_edit',{groupId:'edit-group',backgroundKey:'scene',sourceId:'edit-source',imageId:second.id})
  assert.equal(current().groups[0].backgrounds[0].id,second.id)
  await assert.rejects(request('save_local_edit',{png,sourceId:'unknown',label:'No access'}),/no longer available/)
  assert.equal(uploads,2);assert.ok(images.has('edit-source'));assert.ok(images.has('edited-1'));assert.ok(images.has('edited-2'))
 }finally{spindle.images.get=originalGet;spindle.images.list=originalList;spindle.images.uploadFromDataUrl=originalUpload;spindle.images.delete=originalDelete;userFiles.set('cast-library.json',libraryBefore)}
}
console.log('Studio Edit backend PASS: scoped PNG upload, local provenance, exact Cast expression/background replacement, stale edit rejection and original retention')

// Alpha.12: run the real RPC and provider graph path with scoped, decodable
// source images. No GPU required; every derivative gets an independent ID.
{
 const png=await readFile(new URL('./fixtures/cast-portrait.png',import.meta.url));const images=new Map([['post-source',{id:'post-source',mime_type:'image/png'}]])
 const saved={get:spindle.images.get,read:spindle.images.readBinary,cors:spindle.cors,stream:spindle.imageGen.generateStream,delete:spindle.images.delete}
 const calls=[];const fields=(keys)=>Object.fromEntries(keys.map(k=>[k,['STRING',{default:''}]]));const nodeInfo={
  DownloadAndLoadSAM2Model:{input:{required:{...fields(['segmentor','precision']),model:[['sam2.1_hiera_small.safetensors']],device:[['cuda','cpu']]}}},
  Sam2Segmentation:{input:{required:fields(['image','sam2_model','coordinates_positive','keep_model_loaded'])}},MaskToImage:{input:{required:fields(['mask'])}},
  AnimaRefAdapter:{input:{required:fields(['model','vae','image','ref_guidance']),optional:fields(['ref_end'])}},
  UltralyticsDetectorProvider:{input:{required:{model_name:[['bbox/face_yolov8m.pt','bbox/hand_yolov8s.pt']]}}},
  FaceDetailer:{input:{required:fields(['image','bbox_detector','model','clip','vae','positive','negative','denoise','seed','steps','cfg','sampler_name','scheduler','guide_size','max_size','bbox_threshold','bbox_dilation','bbox_crop_factor','feather','cycle'])}},
  LoadBackgroundRemovalModel:{input:{required:{bg_removal_name:[['birefnet.safetensors']]}}},
 }
 try{
  spindle.images.get=async(id,opts)=>{assert.equal(opts.userId,'user-1');if(!images.has(id))return null;return images.get(id)}
  spindle.images.readBinary=async(id,userId)=>{assert.equal(userId,'user-1');assert.ok(images.has(id));return png}
  spindle.images.delete=async()=>assert.fail('postproduction must not delete the original or candidates')
  spindle.cors=async function(url,options){const node=url.match(/\/object_info\/([^/?]+)$/)?.[1];if(node)return {status:200,body:JSON.stringify(nodeInfo[node]?{[node]:nodeInfo[node]}:{})};if(url.endsWith('/API/DescribeModel')){const name=JSON.parse(options.body).modelName;return {status:200,body:JSON.stringify({model:{name,architecture:'anima-v1/base',compat_class:'anima-v1'}})}}return saved.cors.call(this,url,options)}
  spindle.imageGen.generateStream=async function*(input){assert.equal(input.userId,'user-1');assert.ok(input.parameters.referenceImages[0].data);assert.equal(input.parameters.animaRefGuidance,undefined);calls.push(input);yield {type:'progress',step:2,totalSteps:4};const id=`post-output-${calls.length}`;images.set(id,{id,mime_type:'image/png'});return {imageId:id,imageUrl:`/api/v1/images/${id}`}}
  const caps=(await request('postproduction_capabilities',{connectionId:'swarm-1'})).data;assert.equal(caps.reference,true);assert.equal(caps.referenceEnd,true);assert.equal(caps.samModels.length,1);assert.equal(caps.detectors.length,2);assert.equal(caps.background,'installed');assert.ok(caps.upscalers.length)
  const config={model:'postproduction-anima.safetensors',prompt:'anime portrait, blue eyes',negativePrompt:'blurry',parameters:{sampler:'euler',scheduler:'simple',loras:['line.safetensors'],loraWeights:[.7],rawRequestOverride:'{"untrusted":true}'}}
  const base={imageId:'post-source',connectionId:'swarm-1',config,workspaceId:'fixture-workspace'}
  const stage=async(stage,extra={})=>(await request('finalize_stage',{...base,...extra,stage})).data
  const first=await stage({kind:'refine',scale:1.5,creativity:.2,steps:50,seed:42,cfg:3.5});assert.equal(first.record.initImageId,'post-source');assert.equal(first.record.studioMetadata.studio_stage,'refinement_result');assert.equal(calls[0].parameters.denoise,.2);assert.equal(calls[0].parameters.seed,42);assert.equal(calls[0].parameters.cfgScale,3.5);assert.equal(JSON.parse(calls[0].parameters.rawRequestOverride).untrusted,undefined)
  const second=await stage({kind:'refine',reference:true,guidance:2.75,end:.6,creativity:.25,steps:40,seed:42,cfg:5},{imageId:first.id});assert.equal(second.record.initImageId,first.id);assert.equal(second.record.studioMetadata.studio_parent_id,first.record.studioMetadata.studio_asset_id)
  const graph=(i)=>Object.values(JSON.parse(JSON.parse(calls[i].parameters.rawRequestOverride).comfyworkflowraw));const ref=graph(1).find(n=>n.class_type==='AnimaRefAdapter');assert.equal(ref.inputs.ref_guidance,2.75);assert.equal(ref.inputs.ref_end,.6);assert.equal(graph(1).find(n=>n.class_type==='KSampler').inputs.denoise,.25);assert.ok(graph(1).some(n=>n.class_type==='VAEEncode'));assert.ok(!graph(1).some(n=>n.class_type==='EmptyLatentImage'))
  const detail=await stage({kind:'detail',detector:'bbox/hand_yolov8s.pt',creativity:.3,seed:42,detailGuide:640,detailMax:1280,detailThreshold:.45,detailCrop:2,detailFeather:8,detailCycles:2,detailPrompt:'detailed eyes',detailNegative:'muddy eyes'},{imageId:second.id});assert.equal(detail.record.studioMetadata.studio_stage,'detailer_result');assert.equal(graph(2).find(n=>n.class_type==='UltralyticsDetectorProvider').inputs.model_name,'bbox/hand_yolov8s.pt');assert.equal(graph(2).find(n=>n.class_type==='FaceDetailer').inputs.denoise,.3);const d=graph(2).find(n=>n.class_type==='FaceDetailer').inputs;assert.equal(d.guide_size,640);assert.equal(d.max_size,1280);assert.equal(d.bbox_threshold,.45);assert.equal(d.bbox_crop_factor,2);assert.equal(d.feather,8);assert.equal(d.cycle,2);assert.equal(calls[2].prompt,'detailed eyes');assert.equal(calls[2].negativePrompt,'muddy eyes')
  const upscale=await stage({kind:'upscale',model:caps.upscalers[0],scale:2},{imageId:detail.id});assert.equal(upscale.record.initImageId,detail.id);assert.ok(graph(3).some(n=>n.class_type==='UpscaleModelLoader'))
  const cutout=await stage({kind:'cutout'},{imageId:upscale.id});assert.equal(cutout.record.studioMetadata.studio_stage,'background_removed');assert.ok(graph(4).some(n=>n.class_type==='JoinImageWithAlpha'))
  const mask=(await request('smart_selection',{...base,model:caps.samModels[0],device:'cpu',x:50,y:80})).data;assert.equal(mask.record.studioMetadata.studio_stage,'selection_mask');assert.equal(graph(5).find(n=>n.class_type==='DownloadAndLoadSAM2Model').inputs.precision,'fp32');assert.deepEqual(JSON.parse(graph(5).find(n=>n.class_type==='Sam2Segmentation').inputs.coordinates_positive),[{x:50,y:80}]);assert.equal(mask.record.initImageId,'post-source')
  const before=calls.length;await assert.rejects(stage({kind:'refine'},{imageId:'not-owned'}),/not available/);await assert.rejects(stage({kind:'detail',detector:'not-installed'}),/available detector/);await assert.rejects(request('smart_selection',{...base,model:caps.samModels[0],x:-1,y:3}),/outside/);assert.equal(calls.length,before)
  const beforeRecipes=(await request('finalize_recipes')).data;const recipe={name:'Fixture finishing',stages:[{kind:'refine',creativity:.2},{kind:'cutout',enabled:false}]};const recipes=(await request('save_finalize_recipe',{recipe})).data;assert.equal(recipes[0].name,recipe.name);assert.equal(recipes[0].stages[1].enabled,false);assert.deepEqual((await request('delete_finalize_recipe',{name:recipe.name})).data,beforeRecipes)
  assert.equal(images.size,7);assert.ok(images.has('post-source'))
  const manualInput={connection_id:'swarm-1',model:config.model,prompt:'anime portrait',negativePrompt:'blurry',studioSurface:'main_studio',parameters:{width:768,height:768,steps:30,cfgScale:3.5,animaRefGuidance:3.25,animaRefEnd:.7}}
  await request('generate',{manualAnimaReference:{id:'post-source'},input:{...manualInput,clientJobId:'post-manual-a'}})
  const manualGraph=graph(6),manualRef=manualGraph.find(n=>n.class_type==='AnimaRefAdapter');assert.equal(manualRef.inputs.ref_guidance,3.25);assert.equal(manualRef.inputs.ref_end,.7);assert.ok(manualGraph.some(n=>n.class_type==='EmptyLatentImage'));assert.match(manualGraph.find(n=>n.class_type==='KSampler').inputs.cfg,/cfg_scale/);assert.equal(calls[6].parameters.cfgScale,3.5)
  await request('generate',{manualAnimaReference:{ids:['post-source',first.id],url:'data:image/png;base64,'+png.toString('base64')},input:{...manualInput,clientJobId:'post-manual-pair'}});assert.ok(graph(7).some(n=>n.class_type==='AnimaRefAdapter'))
  await assert.rejects(request('generate',{manualAnimaReference:{id:'not-owned'},input:{...manualInput,clientJobId:'post-manual-denied'}}),/valid saved reference/);assert.equal(calls.length,8)
  await frontendHandler({type:'finalize_protect',workspaceId:'fixture-workspace',release:true},'user-1')
 }finally{spindle.images.get=saved.get;spindle.images.readBinary=saved.read;spindle.cors=saved.cors;spindle.imageGen.generateStream=saved.stream;spindle.images.delete=saved.delete}
}
console.log('Alpha.12 backend PASS: live-capability mock, native and reference img2img, detector graph, upscale, cutout, SAM2 coordinates, source ownership, recipe persistence and derivative lineage')

// Alpha.17: exercise the real RPC, optimistic locks, shared artwork writes and
// archive restoration. All image IDs are owned fixture references, not copies.
{
 const saved=structuredClone(userFiles),originalGet=spindle.images.get
 try{
  spindle.images.get=async(id,options)=>['registry-casual','registry-recovery','registry-edited','registry-other'].includes(id)?{id,mime_type:'image/png'}:originalGet(id,options)
  const source={id:'registry-source',groupId:'registry-broad',name:'Actor',prefix:'actor',images:{neutral:{id:'registry-casual'},'recovery-neutral':{id:'registry-recovery'}},wardrobes:[{key:'default',name:'Everyday',slots:{neutral:'neutral'}},{key:'recovery',name:'Recovery',slots:{neutral:'recovery-neutral'}}]}
  const target={id:'registry-target',groupId:'registry-duo',name:'Actor',prefix:'actor',images:{neutral:{id:'registry-casual'}},presentation:'portrait',presentationSide:'right'}
  const other={id:'registry-other-member',groupId:'registry-third',name:'Other version',prefix:'actor',images:{neutral:{id:'registry-other'}}}
  await request('save_cast_library',{library:{groups:[{id:'registry-broad',name:'Broad'},{id:'registry-duo',name:'Duo'},{id:'registry-third',name:'Third'}],members:[source,target,other]}})
  const read=()=>userFiles.get('cast-library.json'),base=()=>JSON.stringify(read()),member=id=>read().members.find(m=>m.id===id)
  const stale=base()
  await request('cast_registry_attach',{sourceIds:[source.id],groupId:target.groupId,targetId:target.id,baseSignature:stale})
  assert.equal(member(target.id).registryId,source.id);assert.equal(member(target.id).presentation,'portrait');assert.equal(member(target.id).presentationSide,'right');assert.equal(member(target.id).images['recovery-neutral'].id,'registry-recovery')
  await assert.rejects(()=>request('cast_registry_copy_outfit',{sourceId:source.id,sourceKey:'recovery',targetId:other.id,name:'Recovery',baseSignature:stale}),/changed while/)
  await request('cast_registry_copy_outfit',{sourceId:source.id,sourceKey:'recovery',targetId:other.id,name:'Recovery',baseSignature:base()})
  assert.equal(member(other.id).images.neutral.id,'registry-other');assert.ok(Object.values(member(other.id).images).some(im=>im.id==='registry-recovery'))
  await request('replace_cast_edit',{memberId:target.id,expression:'neutral',sourceId:'registry-casual',imageId:'registry-edited'})
  assert.equal(member(source.id).images.neutral.id,'registry-edited');assert.equal(member(target.id).images.neutral.id,'registry-edited');assert.equal(member(other.id).images.neutral.id,'registry-other')
  await request('set_cast_side',{memberId:target.id,side:'left'});assert.equal(member(target.id).presentationSide,'left');assert.equal(member(source.id).presentationSide,'auto')
  const edited=structuredClone(read());edited.members.find(m=>m.id===target.id).identityPrompt='shared identity';await request('save_cast_library',{library:edited,baseSignature:base()});assert.equal(member(source.id).identityPrompt,'shared identity')
  const conflicting=structuredClone(read());conflicting.members.find(m=>m.id===target.id).identityPrompt='one';conflicting.members.find(m=>m.id===source.id).identityPrompt='two';const before=base();await assert.rejects(()=>request('save_cast_library',{library:conflicting,baseSignature:before}),/Conflicting edits/);assert.equal(base(),before)
  const wardrobeSignature=base();const oldDelete=spindle.images.delete;let deleteCalls=0
  try{
    spindle.images.delete=async()=>{deleteCalls++;throw new Error("Wardrobe operations must not delete files")}
    await assert.rejects(()=>request('cast_wardrobe_lifecycle',{memberId:source.id,key:'default',action:'remove',baseSignature:wardrobeSignature}),/additional outfit/)
    await request('cast_wardrobe_lifecycle',{memberId:source.id,key:'recovery',action:'hide',baseSignature:wardrobeSignature})
    assert.deepEqual(member(source.id).hiddenWardrobes,['recovery']);assert.equal(member(target.id).hiddenWardrobes,undefined);assert.equal(member(source.id).wardrobes[1].archived,undefined);assert.equal(member(target.id).images['recovery-neutral'].id,'registry-recovery')
    await assert.rejects(()=>request('cast_wardrobe_lifecycle',{memberId:source.id,key:'recovery',action:'unhide',baseSignature:wardrobeSignature}),/changed while/)
    await request('cast_wardrobe_lifecycle',{memberId:source.id,key:'recovery',action:'archive',baseSignature:base()})
    assert.equal(member(source.id).wardrobes[1].archived,true);assert.equal(member(target.id).wardrobes[1].archived,true);assert.equal(member(target.id).images['recovery-neutral'].id,'registry-recovery')
    await assert.rejects(()=>request('cast_wardrobe_lifecycle',{memberId:source.id,key:'recovery',action:'remove',baseSignature:wardrobeSignature}),/changed while/)
    await request('cast_wardrobe_lifecycle',{memberId:target.id,key:'recovery',action:'restore',baseSignature:base()})
    assert.equal(member(source.id).wardrobes[1].archived,undefined);assert.equal(member(target.id).wardrobes[1].archived,undefined)
    assert.deepEqual(member(source.id).hiddenWardrobes,['recovery']);assert.equal(member(target.id).hiddenWardrobes,undefined)
    await request('cast_wardrobe_lifecycle',{memberId:source.id,key:'recovery',action:'unhide',baseSignature:base()})
    assert.equal(member(source.id).hiddenWardrobes,undefined);assert.equal(member(target.id).hiddenWardrobes,undefined)
    const beforeFolders=structuredClone(userFiles.get('output-folders.json'))
    await request('cast_wardrobe_lifecycle',{memberId:other.id,key:'recovery',action:'remove',baseSignature:base()})
    assert.equal(member(other.id).wardrobes.length,1);assert.equal(member(other.id).images.neutral.id,'registry-other');assert.equal(member(source.id).images['recovery-neutral'].id,'registry-recovery')
    const beforeFolder=beforeFolders?.find(f=>f.id===`cast:${other.id}:recovery`);assert.ok(beforeFolder?.imageIds.includes('registry-recovery'))
    assert.deepEqual(userFiles.get('output-folders.json').find(f=>f.id===beforeFolder.id),beforeFolder)
    assert.equal(deleteCalls,0)
  }finally{spindle.images.delete=oldDelete}
  await request('remove_cast_member',{groupId:source.groupId,memberId:source.id});assert.equal(member(source.id),undefined);assert.equal(member(target.id).images['recovery-neutral'].id,'registry-recovery')
  await request('remove_cast_member',{groupId:target.groupId,memberId:target.id});const archived=read().stash.find(m=>m.registryId===source.id);assert.ok(archived);assert.equal(archived.images.neutral.id,'registry-edited');assert.equal(archived.groupId,'')
  await request('cast_registry_attach',{sourceIds:[archived.id],groupId:source.groupId,baseSignature:base()});assert.ok(read().members.some(m=>m.registryId===source.id&&m.groupId===source.groupId));assert.ok(!read().stash?.some(m=>m.registryId===source.id))
 }finally{spindle.images.get=originalGet;userFiles.clear();for(const [k,v] of saved)userFiles.set(k,v)}
}
console.log('Alpha.17 backend PASS: shared registry RPC, scoped artwork propagation, independent staging, stale and conflicting save rejection, copy outfit, archive and restore')

// Stage Direction integration: persisted overrides, prompt placement, macro
// expansion in the actual chat scope, raw history preservation and cache prefix.
{
 const saved=structuredClone(userFiles)
 try {
  userFiles.delete('stage-direction.json');userFiles.set('tag-automation-config.json',{injectProtocol:false,historyImageMarkers:'strip'})
  userFiles.set('cast-library.json',{activeGroupId:'stage-test',chatGroups:{'chat-1':'stage-test','other-chat':'stage-other'},groups:[{id:'stage-test',name:'Stage',inject:false,backgrounds:[{key:'kitchen',id:'stage-bg',name:'Kitchen'}]},{id:'stage-other',name:'Other',inject:false,backgrounds:[{key:'forest',id:'other-bg',name:'Forest'}]}],members:[]})
  const initial=(await request('load_stage_direction')).data;assert.equal(initial.global.mode,'off');assert.equal(initial.groupId,'stage-test')
  const raw={role:'assistant',__isChatHistory:true,content:'[[scene: kitchen]]\n[[lighting: moonlight]]\n[[atmosphere: rain]]\n\nQuiet.'}, history=[{role:'system',content:'Preset'},{role:'user',__isChatHistory:true,content:'Hello'},raw,{role:'system',content:'Tail'}]
  const prompt=async (messages=history,chatId='chat-1')=>{const r=await interceptorHandler(messages,{chatId,userId:'user-1'});return Array.isArray(r)?r:r.messages}
  assert.ok(!(await prompt()).some(m=>m.content.includes('SWARM STUDIO STAGE DIRECTION')))
  const enabled=(await request('save_stage_direction',{scope:'global',expected:initial.global,config:{...initial.global,mode:'auto',generate:true}})).data
  const first=await prompt();assert.equal(first[0].content,'Preset');assert.match(first[1].content,/SWARM STUDIO STAGE DIRECTION/);assert.match(first[1].content,/kitchen/);assert.match(first[1].content,/swarm-background=stage-test:/);assert.equal(first[1].role,'system');assert.doesNotMatch(first[3].content,/\[\[/);assert.match(raw.content,/\[\[scene:/)
  const extended=await prompt([...history.slice(0,-1),{role:'assistant',__isChatHistory:true,content:'[[lighting: dawn]]\n\nMorning.'},history.at(-1)]);assert.deepEqual(extended.slice(0,4),first.slice(0,4),'Earlier prompt prefix changed on append')
  const scoped=(await request('save_stage_direction',{scope:'cast',chatId:'chat-1',groupId:'stage-test',expected:null,config:{...enabled.global,mode:'auto',position:'depth',depth:1,role:'user',continuity:true,generate:false}})).data
  const deep=await prompt();assert.equal(deep[2].role,'user');assert.match(deep[2].content,/SWARM STUDIO STAGE DIRECTION/);assert.match(deep.at(-2).content,/STAGE CONTINUITY.*scene=kitchen; lighting=moonlight; weather=rain/);assert.doesNotMatch(deep[2].content,/swarm-background=/)
  assert.match((await prompt(history,'other-chat'))[1].content,/forest/)
  const chat=(await request('save_stage_direction',{scope:'chat',chatId:'chat-1',groupId:'stage-test',expected:null,config:{...scoped.cast,mode:'macro'}})).data
  assert.ok(!(await prompt()).some(m=>m.content.includes('SWARM STUDIO STAGE DIRECTION')))
  const expanded=await visualMacroHandler({template:'{{swarm_stage_protocol}}',phase:'prompt',env:{chat:{id:'chat-1'}},userId:'user-1'});assert.match(expanded.text,/SWARM STUDIO STAGE DIRECTION/);assert.match(expanded.text,/kitchen/)
  const other=await visualMacroHandler({template:'{{swarm_stage_locations}}',phase:'prompt',env:{chat:{id:'other-chat'}},userId:'user-1'});assert.match(other.text,/forest/);assert.doesNotMatch(other.text,/kitchen/)
  const macroPrompt=await prompt([{role:'system',content:expanded.text},...history]);assert.equal(macroPrompt.filter(m=>m.content.includes('SWARM STUDIO STAGE DIRECTION')).length,1)
  const clear=(await request('save_stage_direction',{scope:'chat',chatId:'chat-1',groupId:'stage-test',expected:chat.chat,inherit:true})).data;assert.equal(clear.chat,null);assert.ok((await prompt()).some(m=>m.content.includes('SWARM STUDIO STAGE DIRECTION')))
  await assert.rejects(request('save_stage_direction',{scope:'cast',chatId:'chat-1',groupId:'wrong',expected:null,config:enabled.global}),/active chat or Cast changed/)
  await assert.rejects(request('save_stage_direction',{scope:'global',expected:initial.global,config:initial.global}),/changed elsewhere/)
 } finally {userFiles.clear();for(const [k,v] of saved)userFiles.set(k,v)}
}
console.log('Stage Direction backend PASS: independent narration backgrounds, scoped RPCs, prefix stability, macros, placement and stale-write protection')
