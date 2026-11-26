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
spindle.imageGen.generateStream=async function*(input){const imageId=`replay-render-${++renders}`;return {imageId,imageUrl:`/api/v1/image-gen/results/${imageId}`,model:input.model,provider:'swarmui'}};
const realTimer=globalThis.setTimeout;
globalThis.setTimeout=(fn,delay,...args)=>realTimer(fn,delay>=250&&delay!==1000?1:delay,...args);
const pause=()=>new Promise(r=>realTimer(r,2));
const rows=()=>userFiles.get('tagged-image-jobs.json')||[];
const traces=JSON.parse(await readFile(new URL(process.argv[2] || './inline-investigation-traces.json', import.meta.url),'utf8'));
for(const c of traces){
 const final=structuredClone(c.rows.find(m=>m.id.startsWith('final-')));
 const before=renders; const initial=c.rows.filter(m=>m.id.startsWith('old-')||c.kind==='missing-terminal-wrong-swipe');
 if(c.kind==='idless-existing-new-swipe'){const prior=structuredClone(final);prior.swipe_id=0;prior.swipes=[prior.swipes[0]];prior.content=prior.swipes[0];initial.push(prior);}
 taggedMessages.push(...initial);
 // Let the first provider request finish before the eventual native save; this
 // is deliberately the reported "first render finished, not attached" case.
 for(const rpc of c.sent.slice(0,c.early))await frontendHandler(rpc,'user-1');
 const first=rows().filter(j=>j.slot===c.slot).map(j=>({id:j.id,image:j.imageId,inserted:j.inserted,awaiting:j.awaitingSource}));
 if(c.kind==='idless-existing-new-swipe')Object.assign(initial[0],structuredClone(final));
 else taggedMessages.push(...c.rows.filter(m=>!initial.includes(m)));
 // Native gallery and foreground recovery must not commission a second GPU job.
 await frontendHandler({type:'list_library_outputs',requestId:'audit-gallery'},'user-1');
 await frontendHandler({type:'refresh_outputs',requestId:'audit-refresh'},'user-1');
 await frontendHandler({type:'list_tagged_jobs',requestId:'audit-recovery'},'user-1');
 const afterGallery=renders-before;
 if(c.kind==='saved-source-rewrite')eventHandlers.get('GENERATION_ENDED')({chatId:'chat-1',generationId:c.slot,messageId:final.id,content:c.sent[0].fullMatch},'user-1');
 const tail=c.sent.slice(c.early);
 for(let i=0;i<tail.length;i++){
  const rpc=tail[i];
  if(rpc.type==='tag_generate'&&rpc.isStreaming&&!rpc.generationId&&tail[i+1]?.type==='tag_generate'){
    const run=frontendHandler(rpc,'user-1');
    for(let n=0;n<100&&!rows().some(j=>j.sourceMessageId===rpc.messageId&&j.slot===c.slot);n++)await pause();
    await frontendHandler(tail[++i],'user-1');await run;
  }else await frontendHandler(rpc,'user-1');
 }
 // Let asynchronous settlement retry and native commit finish.
 for(let i=0;i<80;i++)await pause();
 const snapshot=()=>rows().filter(j=>j.slot===c.slot).map(j=>({generationId:j.generationId||null,source:j.sourceMessageId,owner:j.messageId,swipe:j.swipeId??null,status:j.status,awaiting:j.awaitingSource,inserted:j.inserted,image:j.imageId,error:j.error}));
 const jobs=snapshot();
 console.log('REPLAY',c.kind,JSON.stringify({first,afterGallery,renders:renders-before,jobs}));
 assert.equal(afterGallery,1,'Library/recovery did not start a new image');
 assert.equal(renders-before,1,'No subsequent automatic callback commissions a second provider draft');
 assert.equal(jobs.length,1);assert.equal(jobs[0].image,first[0].image);
 const canonical=taggedMessages.find(m=>m.id===final.id);
 const hasProof=c.kind==='saved-source-rewrite'||tail.some(rpc=>rpc.type==='settle_tagged_generation'&&rpc.messageId===final.id&&rpc.content===final.content);
 assert.equal(jobs[0].inserted,hasProof,'Only verified evidence may attach');
 if(!hasProof){
   // Missing/contradictory evidence is deliberately not guessed. Deliver the
   // actual authoritative terminal event later, as in live delayed recovery.
   eventHandlers.get('GENERATION_ENDED')({chatId:'chat-1',generationId:c.slot,messageId:final.id,content:final.content,swipeId:final.swipe_id},'user-1');
   for(let i=0;i<250&&!snapshot()[0]?.inserted;i++)await pause();
 }
 const recovered=snapshot();assert.equal(recovered.length,1);assert.equal(recovered[0].inserted,true);assert.equal(recovered[0].owner,final.id);assert.equal(recovered[0].image,first[0].image);assert.equal(renders-before,1);
 assert.equal(canonical.swipe_id,final.swipe_id);assert.match(canonical.content,/data-swarm-studio-image/);
 if(c.kind==='missing-terminal-wrong-swipe')assert.equal(canonical.swipes[1],'Other');
 if(c.kind==='idless-existing-new-swipe')assert.equal(canonical.swipes[0],'Previous reply');
 if(c.kind==='idless-ambiguous-two-matches')assert.equal(taggedMessages.find(m=>m.id==='extra-'+c.kind).content,final.content);
 if(c.kind==='wrong-owner-id-only')assert.equal(taggedMessages.find(m=>m.id.startsWith('old-')).content,'Previous reply');
 console.log('RECOVERED',c.kind,recovered[0].image);
}
console.log('REPLAY all cases passed');
