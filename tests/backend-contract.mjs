import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(new URL("../src/backend.ts", import.meta.url), "utf8")
assert.match(source, /case "start_lora_download"/)
assert.match(source, /case "get_lora_download_status"/)
assert.match(source, /case "cancel_lora_download"/)
assert.match(source, /DoModelDownloadWS/)
assert.match(source, /new WebSocket\(wsUrl\)/)
assert.match(source, /Only Civitai and Hugging Face LoRA downloads/)

let frontendHandler
const sent = []
const secrets = new Map()
const userFiles = new Map()
const permissions = new Set(["image_gen", "cors_proxy", "images", "chats", "characters", "personas", "chat_mutation", "interceptor"])
let imageDeleted = false
let presetAdded = false
let presetDeleted = false
let interruptRequested = false
let appendedMessage = null
const macroDefinitions = new Map()
const macroValues = new Map()
const eventHandlers = new Map()
let interceptorHandler = null
let completionToast = ""
let downloadedSwarmUrl = ""
const relayedLoraRequests = []
let holdLoraDownload = false
let taggedGenerationCount = 0
const taggedGenerationInputs = []
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
const activePersona = {
  id: "persona-1",
  name: "User",
  description: "1girl, short silver hair, blue eyes, black hoodie",
  image_id: "user-avatar",
  metadata: {},
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
  registerMacro(definition) {
    macroDefinitions.set(definition.name, definition)
  },
  updateMacroValue(name, value) {
    macroValues.set(name, value)
  },
  registerInterceptor(handler) {
    interceptorHandler = handler
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
    async *generateStream(input) {
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
          assert.match(input.prompt, /^1boy, black hair, red eyes, <preset:Cinematic>, train platform, waving/)
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
  chats: {
    async getActive() {
      return { id: "chat-1", character_id: "char-1" }
    },
    async get(chatId) {
      assert.equal(chatId, "chat-1")
      return { id: "chat-1", character_id: "char-1" }
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
      return taggedMessages
    },
    async updateMessage(chatId, messageId, patch) {
      assert.equal(chatId, "chat-1")
      const target = taggedMessages.find((message) => message.id === messageId)
      assert.ok(target)
      await new Promise((resolve) => setTimeout(resolve, 1))
      target.content = patch.content
      target.metadata = patch.metadata
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

await import("../dist/backend.js")
assert.equal(typeof frontendHandler, "function")
assert.equal(macroDefinitions.get("last_genned").handler, "")
assert.equal(macroDefinitions.has("swarm_image_protocol"), true)
assert.equal(macroDefinitions.has("swarm_negative"), true)
assert.equal(macroDefinitions.has("char_base"), true)
assert.equal(macroDefinitions.has("persona_base"), true)
assert.equal(macroDefinitions.has("char_tags"), false)
assert.equal(macroDefinitions.has("char_profile"), true)
assert.equal(macroDefinitions.has("user_profile"), true)
assert.match(macroValues.get("swarm_image_protocol"), /<swarm-image/)
assert.equal(typeof interceptorHandler, "function")
assert.equal(eventHandlers.has("GENERATION_ENDED"), false)

async function request(type, extra = {}) {
  const requestId = `${type}-${sent.length}`
  await frontendHandler({ type, requestId, ...extra }, "user-1")
  const response = sent.find((entry) => entry.payload.requestId === requestId)
  assert.ok(response, `Missing response for ${type}`)
  assert.notEqual(response.payload.type, "studio_error", response.payload.error)
  return response.payload
}

const bootstrap = await request("bootstrap")
assert.equal(bootstrap.data.connections.length, 1)
assert.equal(bootstrap.data.connections[0].provider, "swarmui")
assert.equal(bootstrap.data.outputs.length, 1)
assert.equal(bootstrap.data.total, 1)
assert.equal(bootstrap.data.offset, 0)
assert.equal(bootstrap.data.limit, 12)
assert.deepEqual(bootstrap.data.stackPresets, [])
assert.deepEqual(bootstrap.data.outputFolders, [])
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
assert.equal(workflow.data.parameters.length, 2)
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
assert.match(source, /const matched = parsed\.find[\s\S]*?if \(!matched\) return fallback/)
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
assert.equal(macroValues.get("char_base"), "1girl, long brown hair, pink dress")
assert.equal(macroValues.get("char_profile"), "/api/v1/images/char-avatar?size=sm")
assert.equal(macroValues.get("user_profile"), "/api/v1/images/user-avatar?size=sm")
assert.match(completionToast, /Swarm Studio finished/)

const tagConfig = await request("set_tag_automation", {
  config: {
    autoGenerate: true,
    injectProtocol: true,
    completionToast: false,
    requiredImageMin: 2,
    requiredImageMax: 4,
    promptMode: "pov",
  },
})
assert.deepEqual(tagConfig.data, {
  autoGenerate: true,
  injectProtocol: true,
  completionToast: false,
  requiredImageMin: 2,
  requiredImageMax: 4,
  promptMode: "pov",
})
assert.match(macroValues.get("swarm_image_protocol"), /between 2 and 4 complete <swarm-image> requests/)
assert.match(macroValues.get("swarm_image_protocol"), /CHARACTER-ONLY \/ POV/)
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
assert.match(intercepted.messages[0].content, /CHARACTER 1 IDENTITY/)
assert.match(intercepted.messages[0].content, /1boy, black hair, red eyes/)
assert.match(intercepted.messages[0].content, /ILLUSTRATION MODE — CHARACTER-ONLY \/ POV/)
assert.match(intercepted.messages[0].content, /current outfit, clothing removal, damage, wetness, or disarray/)
assert.match(intercepted.messages[0].content, /persona="active"/)
assert.doesNotMatch(intercepted.messages[0].content, /Use at most two image tags/)
assert.match(intercepted.messages[1].content, /\[Illustration requested: Street food\]/)

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
const taggedResult = sent.find((entry) => entry.payload.type === "tagged_generation_result")
assert.equal(taggedResult.payload.data.record.imageId, "image-tag-1")
assert.equal(taggedResult.payload.data.taggedJob.status, "ready")
assert.match(taggedMessage.content, /<img src="\/api\/v1\/image-gen\/results\/image-tag-1"/)
assert.match(taggedMessage.content, /data-swarm-studio-slot="post"/)
assert.match(taggedMessage.content, /data-swarm-studio-fit="cover"/)
assert.match(taggedMessage.content, /object-fit:cover/)
assert.equal(taggedMessage.metadata.swarm_studio_tagged_images[0].imageId, "image-tag-1")
assert.equal(macroValues.get("last_genned"), "/api/v1/image-gen/results/image-tag-1")
const storedFoldersAfterTag = userFiles.get("output-folders.json")
assert.equal(storedFoldersAfterTag[0].id, "character:char-1")
assert.equal(storedFoldersAfterTag[0].name, "Lior")
assert.deepEqual(storedFoldersAfterTag[0].imageIds, ["image-tag-1"])
assert.equal(storedFoldersAfterTag[0].binding.type, "character")
assert.equal(storedFoldersAfterTag[0].binding.chatId, undefined)
assert.equal(storedFoldersAfterTag[0].binding.characterId, "char-1")
assert.equal(storedFoldersAfterTag[0].binding.positivePrompt, "1boy, black hair, red eyes")

const customCharacterVisuals = await request("save_chat_visuals", {
  positivePrompt: "1boy, black hair, red eyes",
  negativePrompt: "wrong eye color",
  checkpoint: "base.safetensors",
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

const visualFolders = await request("update_output_folder_profile", {
  folderId: storedFoldersAfterTag[0].id,
  profile: {
    positivePrompt: "1boy, red eyes, black hair, signature coat",
    negativePrompt: "wrong eye color",
    checkpoint: "base.safetensors",
    stackPresetId: savedStack.data[0].id,
    enabled: false,
  },
})
assert.equal(visualFolders.data[0].binding.positivePrompt, "1boy, red eyes, black hair, signature coat")
assert.equal(visualFolders.data[0].binding.negativePrompt, "wrong eye color")
assert.equal(visualFolders.data[0].binding.checkpoint, "base.safetensors")
assert.equal(visualFolders.data[0].binding.stackPresetId, savedStack.data[0].id)
assert.equal(visualFolders.data[0].binding.enabled, false)

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
  foldersAfterDisabledVisualGenerations[0].imageIds,
  ["image-tag-1"],
  "disabled character visuals must leave newly generated images Unfiled",
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
assert.match(source, /Use character="none" when the active chat character should not appear/)
assert.match(source, /const NO_CHARACTER_NEGATIVE = "people, person, character/)
assert.match(source, /const includeCharacter = !\["none", "off", "false", "no", "0"\]\.includes\(characterMode\)/)
assert.match(source, /excludedLoras: includeCharacter \? \[\] : visualStack\.map\(\(item\) => item\.name\)/)
assert.match(source, /if \(excluded\.has\(name\.toLowerCase\(\)\)\) return/)
assert.match(source, /LOCAL GENERATION/)
assert.match(source, /configured local SwarmUI installation and local hardware/)
assert.match(source, /Never use a chat character's or persona's display name as a diffusion token/)
assert.match(source, /ANIMA PROMPT SHAPE/)
assert.match(source, /MULTI-CHARACTER \/ ENSEMBLE/)
assert.match(source, /CHARACTER-ONLY \/ POV/)
assert.match(source, /safe, sensitive, nsfw, or explicit/)
assert.match(source, /folder\.binding\?\.characterId === characterId/)
assert.match(source, /type: "character"/)
assert.match(source, /rawBinding\.type === "character" \|\| rawBinding\.type === "chat"/)
assert.match(source, /const taggedMessageFinalizeLocks = new Map<string, Promise<void>>\(\)/)
assert.match(source, /withTaggedMessageFinalizeLock\(lockKey/)
assert.match(source, /replaceTaggedImagePlaceholder\(content, job, markup\)/)
assert.match(source, /data-swarm-studio-image="true"/)
assert.match(source, /data-swarm-studio-inline-action="true"/)
assert.match(source, /case "list_tagged_jobs"/)
assert.match(source, /case "retry_tagged_job"/)
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
assert.equal(interruptRequested, true)

const page = await request("refresh_outputs", { offset: 12, limit: 12 })
assert.equal(page.data.offset, 12)
assert.equal(page.data.limit, 12)

const currentCharacterFolder = userFiles.get("output-folders.json")[0]
userFiles.set("output-folders.json", [
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

const createdFolders = await request("create_output_folder", { name: "Favorites" })
assert.equal(createdFolders.data[0].name, "Favorites")
assert.equal(createdFolders.data[0].binding, null)
const folderId = createdFolders.data[0].id

const movedFolders = await request("move_output_to_folder", {
  imageId: "image-1",
  folderId,
})
assert.deepEqual(movedFolders.data[0].imageIds, ["image-1"])

const library = await request("list_library_outputs")
assert.equal(library.data.outputs.length, 1)
assert.equal(library.data.folders[0].name, "Favorites")

const bulkMoved = await request("bulk_move_outputs", {
  imageIds: ["image-1"],
  folderId,
})
assert.deepEqual(bulkMoved.data[0].imageIds, ["image-1"])

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
assert.deepEqual(deleted.data.folders[0].imageIds, [])

console.log("backend contract: ok")
