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
permissions.delete('cors_proxy');
userFiles.set('tag-automation-config.json',{autoGenerate:true,requestMode:'inline',autoFinalizeInline:false});
let renders=0;
spindle.imageGen.generateStream=async function*(input){const imageId=`audit-render-${++renders}`;return {imageId,imageUrl:`/api/v1/image-gen/results/${imageId}`,model:input.model,provider:'swarmui'}};
const realTimer=globalThis.setTimeout;
globalThis.setTimeout=(fn,delay,...args)=>realTimer(fn,delay>=250&&delay!==1000?1:delay,...args);
const tag=(slot,body='harbor at dusk')=>`<swarm-image request="generate" slot="${slot}" aspect="4:3">${body}</swarm-image>`;
const rows=()=>userFiles.get('tagged-image-jobs.json')||[];
const submit=async(messageId,raw,extra={})=>frontendHandler({type:'tag_generate',requestId:'audit-'+sent.length,chatId:'chat-1',messageId,fullMatch:raw,attrs:Object.fromEntries([...raw.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])),content:raw.slice(raw.indexOf('>')+1,raw.lastIndexOf('</swarm-image>')),...extra},'user-1');
const settle=async(g,message,raw,swipeId)=>frontendHandler({type:'settle_tagged_generation',generationId:g,chatId:'chat-1',messageId:message.id,content:raw,swipeId},'user-1');
const add=(id,content,swipes)=>{const m={id,role:'assistant',content,metadata:{},...(swipes?{swipes,swipe_id:0}:{})};taggedMessages.push(m);return m};
const summary=slot=>rows().filter(j=>j.slot===slot).map(j=>({generationId:j.generationId||null,source:j.sourceMessageId,owner:j.messageId,swipe:j.swipeId??null,status:j.status,awaiting:j.awaitingSource,inserted:j.inserted,image:j.imageId,error:j.error}));
const log=(name,slot,before)=>console.log('OWNERSHIP',name,JSON.stringify({renders:renders-before,jobs:summary(slot)}));
const pause=()=>new Promise(r=>realTimer(r,2));
async function waitFor(test,why){for(let i=0;i<250;i++){if(test())return;await pause()}assert.ok(test(),why)}
const onlyDraft=(slot,before)=>{assert.equal(renders-before,1,'Exactly one provider draft');assert.equal(summary(slot).length,1,'Exactly one reservation');return summary(slot)[0].image};
async function recover(slot,before,g,m,content,swipeId=0){
 const image=onlyDraft(slot,before);
 assert.equal(summary(slot)[0].inserted,false,'Ambiguous callback must not attach to an unproven owner');
 await settle(g,m,content,swipeId);
 await waitFor(()=>summary(slot)[0]?.inserted,'Correct proof must recover the original saved bitmap');
 assert.equal(onlyDraft(slot,before),image);assert.equal(summary(slot)[0].owner,m.id);assert.equal(summary(slot)[0].swipe,swipeId);
 assert.equal(m.swipe_id,0,'Background selection unchanged');
}
// Control: normal terminal proof, followed by gallery read and repeated unscoped native callback.
{
 const slot='audit-control',raw=tag(slot),g='control-g',before=renders;
 const m=add('control-final',raw,[raw]);
 await settle(g,m,raw,0); await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true,swipeId:0});
 await frontendHandler({type:'list_tagged_jobs',requestId:'control-list'},'user-1');await submit(m.id,raw,{isStreaming:false,swipeId:0});
 log('control',slot,before);assert.equal(renders-before,1);assert.equal(summary(slot)[0].inserted,true);
}
// Missing terminal proof + unscoped streaming callback with a different ID.
{
 const slot='audit-alias',raw=tag(slot),g='alias-g',before=renders;
 await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true});
 const m=add('alias-final',raw,[raw]);
 const run=submit(m.id,raw,{isStreaming:true});
 for(let i=0;i<100&&!rows().some(j=>j.sourceMessageId===m.id);i++)await new Promise(r=>realTimer(r,1));
 await submit(m.id,raw,{isStreaming:false,swipeId:0});await run;
 await recover(slot,before,g,m,raw);log('unscoped streaming alias then final callback',slot,before);
}
// Existing transient target resolves to another committed ID; late final callback without generation ID.
{
 const slot='audit-existing-target',raw=tag(slot),g='existing-g',before=renders;
 const old=add('existing-old','Previous reply',['Previous reply']);
 await submit(old.id,raw,{generationId:g,isStreaming:true,swipeId:0});
 const m=add('existing-final',raw,[raw]);
 await submit(m.id,raw,{isStreaming:false,swipeId:0});
 await recover(slot,before,g,m,raw);assert.equal(old.content,'Previous reply');log('existing provisional ID then new final ID without terminal proof',slot,before);
}
// Same packet on exact canonical message but wrong provisional swipe; missing terminal proof.
{
 const slot='audit-swipe-mismatch',raw=tag(slot),g='swipe-mismatch-g',before=renders;
 const m=add('swipe-mismatch-final',raw,[raw,'Other']);
 await submit(m.id,raw,{generationId:g,isStreaming:true,swipeId:1});
 await submit(m.id,raw,{isStreaming:false,swipeId:0});
 await recover(slot,before,g,m,raw);assert.equal(m.swipes[1],'Other');log('different swipe IDs without terminal proof',slot,before);
}
// Unverified terminal content may be corrected; verified ownership remains immutable.
{
 const slot='audit-stale-proof',raw=tag(slot),g='stale-g',before=renders;
 const m=add('stale-final','Actual narrative '+raw,['Actual narrative '+raw]);
 await settle(g,m,'Stale narrative '+raw,0);
 await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true,swipeId:0});
 await settle(g,m,m.content,0);
 await submit(m.id,raw,{isStreaming:false,swipeId:0});
 await waitFor(()=>summary(slot)[0]?.inserted,'Corrected terminal snapshot');onlyDraft(slot,before);log('first stale terminal proof followed by correct proof',slot,before);
}
// Non-streaming callbacks must prove a saved tag before spending GPU.
{
 const slot='audit-absent-tag',raw=tag(slot),before=renders;
 const m=add('absent-tag-final','Already edited away.',['Already edited away.']);
 await submit(m.id,raw,{isStreaming:false,swipeId:0});
 log('unscoped callback with no matching persisted source',slot,before);assert.equal(renders-before,0);assert.equal(summary(slot).length,0);assert.equal(m.content,'Already edited away.');
}
// Legitimate identical text in two independent saved messages must still render twice.
{
 const slot='audit-distinct-turns',raw=tag(slot),before=renders;
 const a=add('distinct-a',raw,[raw]),b=add('distinct-b',raw,[raw]);
 await submit(a.id,raw,{isStreaming:false,swipeId:0});await submit(b.id,raw,{isStreaming:false,swipeId:0});
 log('same packet different genuine turns',slot,before);assert.equal(renders-before,2);assert.equal(summary(slot).filter(j=>j.inserted).length,2);
}
// A host can expose its first alternative without a swipes array.
{
 const slot='audit-single-swipe',raw=tag(slot),before=renders;
 const m=add('single-swipe-final',raw);m.swipe_id=0;
 await submit(m.id,raw,{isStreaming:false,swipeId:0});
 log('legacy callback with explicit swipe zero but no swipes array',slot,before);onlyDraft(slot,before);assert.equal(summary(slot)[0].inserted,true);assert.match(m.content,/data-swarm-studio-image/);
}
// An actual upsert after exceeding the former history cap must retain old receipts.
{
 const slot='audit-evicted',raw=tag(slot),before=renders;
 await submit('evicted-provisional',raw,{generationId:'evicted-g',isStreaming:true});
 const original=rows().find(j=>j.slot===slot);
 const originalRows=structuredClone(rows());
 const fillers=Array.from({length:160},(_,i)=>({...original,id:`fill-${i}`,key:`fill-${i}`,slot:`fill-${i}`,status:'ready',inserted:true}));
 userFiles.set('tagged-image-jobs.json',[...fillers,...originalRows]);
 const manualSlot='history-cap-write',manualRaw=tag(manualSlot),manual=add('history-cap-write',manualRaw,[manualRaw]);
 userFiles.set('tag-automation-config.json',{autoGenerate:false,requestMode:'inline',autoFinalizeInline:false});
 await submit(manual.id,manualRaw,{isStreaming:false,swipeId:0});
 userFiles.set('tag-automation-config.json',{autoGenerate:true,requestMode:'inline',autoFinalizeInline:false});
 assert.ok(rows().length>160);assert.ok(rows().some(j=>j.id===original.id),'Reservation survives real persistence merge');
 const m=add('evicted-final',raw,[raw]);await submit(m.id,raw,{isStreaming:false,swipeId:0});
 await recover(slot,before,'evicted-g',m,raw);log('reservation beyond former history cap',slot,before);
 userFiles.set('tagged-image-jobs.json',rows().filter(j=>!j.id.startsWith('fill-')));
}
// Backend restart loses memory but not the reservation or its saved bitmap.
{
 const slot='audit-restart',raw=tag(slot),g='restart-g',before=renders;
 await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true});
 const m=add('restart-final',raw,[raw]);const id=onlyDraft(slot,before);
 await import('../dist/backend.js?ownership-restart');
 await submit(m.id,raw,{isStreaming:true});await submit(m.id,raw,{isStreaming:false,swipeId:0});
 assert.equal(onlyDraft(slot,before),id);assert.equal(summary(slot)[0].inserted,false);
 // Authoritative host end may contain only IDs. A raw packet on that saved
 // owner proves the reservation without relying on the provisional ID.
 eventHandlers.get('GENERATION_ENDED')({chatId:'chat-1',generationId:g,messageId:m.id,swipeId:0},'user-1');
 await waitFor(()=>summary(slot)[0]?.inserted,'ID-only host terminal after restart');assert.equal(onlyDraft(slot,before),id);
 log('backend restart + authoritative ID-only end',slot,before);
 // Removal is not permission to re-render this generation, even after restart.
 const job=rows().find(j=>j.slot===slot);
 await frontendHandler({type:'remove_tagged_image_from_chat',requestId:'remove-restart',jobId:job.id},'user-1');
 assert.equal(summary(slot).length,0);
 await import('../dist/backend.js?ownership-removal-restart');
 await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true});
 assert.equal(renders-before,1,'Removed reservation receipt survives restart');assert.equal(summary(slot).length,0);
}
// A verified owner must not change when a later, conflicting terminal event
// supplies a different existing message with identical text.
{
 const slot='audit-verified-immutable',raw=tag(slot),g='immutable-g',before=renders;
 const a=add('immutable-a',raw,[raw]),b=add('immutable-b',raw,[raw]);
 await settle(g,a,raw,0);await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true});
 assert.equal(summary(slot)[0].owner,a.id);const id=onlyDraft(slot,before);
 await settle(g,b,raw,0);await submit(b.id,raw,{generationId:g,isStreaming:false,swipeId:0});
 assert.equal(onlyDraft(slot,before),id);assert.equal(summary(slot)[0].owner,a.id);assert.equal(b.content,raw);
 log('verified owner is immutable',slot,before);
}
// A generation-aware callback can safely adopt the exact same running
// legacy reservation without overwriting its attempt or launching a second.
{
 const slot='audit-legacy-adoption',raw=tag(slot),g='legacy-adopt-g',before=renders;
 const old=add('legacy-adopt-provisional','Previous reply',['Previous reply']);
 const provider=spindle.imageGen.generateStream;let release;const gate=new Promise(r=>release=r);
 spindle.imageGen.generateStream=async function*(input){await gate;return yield* provider(input)};
 const run=submit(old.id,raw,{isStreaming:true,swipeId:0});
 try{
  await waitFor(()=>summary(slot)[0]?.status==='generating','Legacy render starts');
  await submit(old.id,raw,{generationId:g,isStreaming:true,swipeId:0});
  assert.equal(summary(slot).length,1);assert.equal(summary(slot)[0].generationId,g);assert.equal(summary(slot)[0].status,'generating');
  const m=add('legacy-adopt-final',raw,[raw]);await settle(g,m,raw,0);release();await run;
  await waitFor(()=>summary(slot)[0]?.inserted,'Adopted legacy worker follows verified owner');
  onlyDraft(slot,before);assert.equal(summary(slot)[0].owner,m.id);assert.equal(old.content,'Previous reply');
 }finally{release();await run;spindle.imageGen.generateStream=provider}
 log('running legacy alias adoption',slot,before);
}
// A proved sibling survives a backend restart, even after its first raw tag
// has been replaced by the bitmap and full terminal text can no longer match.
{
 const a='audit-durable-sibling-a',b='audit-durable-sibling-b',rawA=tag(a),rawB=tag(b),g='durable-sibling-g',before=renders;
 const full='Before '+rawA+' between '+rawB+' after';const m=add('durable-sibling-final',full,[full]);
 await settle(g,m,full,0);await submit('inline-stream:'+g,rawA,{generationId:g,isStreaming:true,swipeId:0});
 assert.equal(summary(a)[0].inserted,true);assert.match(m.content,/swarm-studio-image/);assert.ok(m.content.includes(rawB));
 await import('../dist/backend.js?ownership-sibling-restart');
 await submit('inline-stream:'+g,rawB,{generationId:g,isStreaming:true,swipeId:0});
 assert.equal(renders-before,2);assert.equal(summary(b)[0].inserted,true);assert.equal(summary(b)[0].owner,m.id);
 assert.equal(m.metadata.swarm_studio_tagged_images.length,2);
 log('durable sibling after restart',b,before);
}
// Native authoritative proof wins over a conflicting unverified renderer
// snapshot if both are received before either owner can be committed.
{
 const slot='audit-native-authority',raw=tag(slot),g='native-authority-g',before=renders;
 const wrong=add('native-authority-wrong',raw,[raw]),right=add('native-authority-right',raw,[raw]);
 await settle(g,wrong,raw,0);
 eventHandlers.get('GENERATION_ENDED')({chatId:'chat-1',generationId:g,messageId:right.id,content:raw,swipeId:0},'user-1');await pause();
 await submit('inline-stream:'+g,raw,{generationId:g,isStreaming:true,swipeId:0});
 onlyDraft(slot,before);assert.equal(summary(slot)[0].owner,right.id);assert.equal(summary(slot)[0].inserted,true);assert.equal(wrong.content,raw);
 log('native end outranks unverified renderer hint',slot,before);
}
console.log('OWNERSHIP regressions completed');
