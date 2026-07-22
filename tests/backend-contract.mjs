import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const source = await readFile(new URL("../src/backend.ts", import.meta.url), "utf8")

let frontendHandler
const sent = []
const secrets = new Map()
const userFiles = new Map()
const permissions = new Set([
  "image_gen",
  "cors_proxy",
  "images",
  "chats",
  "chat_mutation",
  "characters",
  "presets",
  "app_manipulation",
])
let imageDeleted = false
let presetAdded = false
let presetDeleted = false
let interruptRequested = false
let appendedMessage = null
let macroDefinition = null
let macroValue = ""
let completionToast = ""
let downloadedSwarmUrl = ""
let avatarUpdate = null
let appliedPalette = null

globalThis.spindle = {
  registerMacro(definition) {
    macroDefinition = definition
  },
  updateMacroValue(name, value) {
    assert.equal(name, "last_genned")
    macroValue = value
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
      assert.deepEqual(input.parameters.loras, ["styles/ink.safetensors"])
      assert.equal(input.parameters.referenceImages[0].mimeType, "image/png")
      assert.equal(input.parameters.denoise, 0.55)
      assert.equal(input.owner_chat_id, "chat-1")
      assert.equal(input.owner_character_id, "char-1")
      assert.equal(input.clientJobId, "studio-job-1")
      assert.equal(input.signal instanceof AbortSignal, true)
      const rawOverride = JSON.parse(input.parameters.rawRequestOverride)
      assert.equal(rawOverride.comfyuicustomworkflow, "Portrait/Inpaint")
      assert.equal(rawOverride.comfyrawworkflowinputdecimaldenoiseb, 0.42)
      assert.equal(rawOverride.comfyrawworkflowinputimageinitc, "data:image/png;base64,QUJD")
      yield {
        step: 4,
        totalSteps: 20,
        preview: "data:image/jpeg;base64,UFJFVklFVw==",
      }
      return {
        imageDataUrl: "data:image/png;base64,QUJD",
        imageUrl: "/api/v1/image-gen/results/image-1",
        imageId: "image-1",
        model: input.model,
        provider: "swarmui",
      }
    },
  },
  chats: {
    async getActive() {
      return { id: "chat-1", character_id: "char-1" }
    },
  },
  characters: {
    async get(characterId, userId) {
      assert.equal(characterId, "char-1")
      assert.equal(userId, "user-1")
      return {
        id: "char-1",
        name: "Mira",
        image_id: "avatar-1",
        extensions: {
          swarm_studio: {
            visualBible: {
              canonicalPrompt: "waist-length black hair, red eyes",
              preferredCheckpoint: "base.safetensors",
            },
          },
        },
      }
    },
    async setAvatar(characterId, input, userId) {
      assert.equal(characterId, "char-1")
      assert.equal(userId, "user-1")
      assert.equal(input.mime_type, "image/png")
      assert.equal(input.filename, "mira-output.png")
      assert.deepEqual([...input.data], [65, 66, 67])
      avatarUpdate = input
      return { id: "char-1", name: "Mira", image_id: "avatar-2" }
    },
  },
  chat: {
    async getMessages(chatId) {
      assert.equal(chatId, "chat-1")
      return [{ id: "turn-42", role: "user", content: "Show me the scene." }]
    },
    async appendMessage(chatId, message) {
      assert.equal(chatId, "chat-1")
      assert.equal(message.role, "assistant")
      assert.match(message.content, /^!\[image\.png\]\(<\/api\/v1\/images\/image-1\?size=sm>\)$/)
      assert.equal(message.metadata.source, "swarm_studio")
      assert.equal(message.metadata.image_id, "image-1")
      appendedMessage = message
      return { id: "message-image-1" }
    },
  },
  images: {
    async list(options) {
      assert.equal(options.onlyOwned, true)
      assert.equal(Number.isInteger(options.offset), true)
      assert.equal(Number.isInteger(options.limit), true)
      if (options.characterId) {
        assert.equal(options.characterId, "char-1")
        return {
          data: [{ id: "image-1", url: "/api/v1/images/image-1?size=sm", original_filename: "image.png" }],
          total: 1,
        }
      }
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
      assert.equal(imageId, "image-1")
      assert.equal(options.onlyOwned, true)
      assert.equal(options.specificity, "sm")
      assert.equal(options.userId, "user-1")
      return { id: imageId, url: "/api/v1/images/image-1?size=sm", original_filename: "image.png" }
    },
  },
  theme: {
    async extractColors(imageId, userId) {
      assert.equal(imageId, "image-1")
      assert.equal(userId, "user-1")
      return { dominantHsl: { h: 292, s: 63, l: 58 } }
    },
    async applyPalette(palette, userId) {
      assert.equal(userId, "user-1")
      appliedPalette = palette
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
    assert.equal(new URL(url).origin, "http://localhost:7801")
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
assert.equal(macroDefinition.name, "last_genned")
assert.equal(macroDefinition.handler, "")

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
assert.equal(bootstrap.data.activeCharacter.id, "char-1")
assert.equal(bootstrap.data.activeCharacter.name, "Mira")
assert.equal(bootstrap.data.characterVisual.canonicalPrompt, "waist-length black hair, red eyes")
assert.equal(bootstrap.data.permissions.wallpaper, false)

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
assert.equal(macroValue, "/api/v1/image-gen/results/image-1")
assert.match(completionToast, /Swarm Studio finished/)

const originalOutput = await request("download_swarm_output", {
  connectionId: "swarm-1",
  swarmPath: generated.data.record.swarmPath,
})
assert.equal(originalOutput.data.dataUrl, "data:image/png;base64,QUJD")
assert.equal(originalOutput.data.filename, "image-1.png")
assert.equal(downloadedSwarmUrl, "http://localhost:7801/Output/2026-07-19/image-1.png")

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

const createdFolders = await request("create_output_folder", { name: "Favorites" })
assert.equal(createdFolders.data[0].name, "Favorites")
const folderId = createdFolders.data[0].id

const movedFolders = await request("move_output_to_folder", {
  imageId: "image-1",
  folderId,
})
assert.deepEqual(movedFolders.data[0].imageIds, ["image-1"])

const library = await request("list_library_outputs")
assert.equal(library.data.outputs.length, 1)
assert.equal(library.data.folders[0].name, "Favorites")

const characterGallery = await request("list_character_gallery", { characterId: "char-1" })
assert.equal(characterGallery.data.characterId, "char-1")
assert.equal(characterGallery.data.outputs[0].id, "image-1")

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
assert.equal(appendedMessage.metadata.source_turn_id, "turn-42")
assert.equal(appendedMessage.metadata.generation.prompt, "ink style, portrait")
assert.deepEqual(appendedMessage.metadata.generation.presets, ["Cinematic"])

const avatar = await request("set_output_as_character_avatar", {
  dataUrl: "data:image/png;base64,QUJD",
  filename: "mira output.png",
})
assert.equal(avatar.data.characterId, "char-1")
assert.equal(avatar.data.characterName, "Mira")
assert.ok(avatarUpdate)

const palette = await request("apply_output_palette", { imageId: "image-1" })
assert.equal(palette.data.imageId, "image-1")
assert.deepEqual(appliedPalette, { accent: { h: 292, s: 63, l: 58 } })

const deleted = await request("bulk_delete_outputs", { imageIds: ["image-1"] })
assert.deepEqual(deleted.data.deletedIds, ["image-1"])
assert.deepEqual(deleted.data.failedIds, [])
assert.equal(deleted.data.outputs.length, 0)
assert.deepEqual(deleted.data.folders[0].imageIds, [])

console.log("backend contract: ok")
