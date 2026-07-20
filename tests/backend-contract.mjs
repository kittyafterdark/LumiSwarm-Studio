import assert from "node:assert/strict"

let frontendHandler
const sent = []
const secrets = new Map()
const userFiles = new Map()
const permissions = new Set(["image_gen", "cors_proxy", "images", "chats"])
let imageDeleted = false

globalThis.spindle = {
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
      assert.deepEqual(input.parameters.loras, ["styles/ink.safetensors"])
      assert.equal(input.parameters.referenceImages[0].mimeType, "image/png")
      assert.equal(input.parameters.denoise, 0.55)
      assert.equal(input.owner_chat_id, "chat-1")
      assert.equal(input.owner_character_id, "char-1")
      assert.equal(input.clientJobId, "studio-job-1")
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
            { id: "sampler", values: ["euler", "dpmpp_2m_sde_gpu"] },
            { id: "scheduler", values: ["normal", "beta57"] },
          ],
        }),
      }
    }
    if (url.endsWith("/API/GetMyUserData")) {
      return {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          presets: [{
            title: "Cinematic",
            description: "Film look",
            param_map: {
              prompt: "cinematic lighting, {value}",
              negativeprompt: "{value}, flat lighting",
            },
          }],
        }),
      }
    }
    if (url.endsWith("/API/ListImages")) {
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

const connection = await request("load_connection", { connectionId: "swarm-1" })
assert.equal(connection.data.loras.length, 1)
assert.equal(connection.data.loras[0].triggerPhrase, "ink style")
assert.equal(connection.data.loras[0].defaultWeight, 0.75)
assert.equal(connection.data.checkpoints[0].compatClass, "stable-diffusion-xl-v1")
assert.deepEqual(connection.data.swarmOptions.samplers, ["euler", "dpmpp_2m_sde_gpu"])
assert.deepEqual(connection.data.swarmOptions.schedulers, ["normal", "beta57"])
assert.equal(connection.data.swarmOptions.presets[0].title, "Cinematic")
assert.equal(connection.data.swarmOptions.presets[0].paramMap.prompt, "cinematic lighting, {value}")

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

const preview = await request("preview", {
  connectionId: "swarm-1",
  name: "styles/ink.safetensors",
  previewRef: "/ViewSpecial/LoRA/styles/ink.safetensors",
})
assert.equal(preview.dataUrl, "data:image/png;base64,QUJD")

const generated = await request("generate", {
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
    },
  },
  recordHints: {
    resolvedPrompt: "cinematic lighting, ink style, portrait",
    resolvedNegativePrompt: "blurry, flat lighting",
    presets: ["Cinematic"],
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
assert.equal(generated.data.record.timing.prep, "0.22 sec")
assert.equal(generated.data.record.timing.generation, "1.78 sec")
assert.equal(generated.data.record.timing.source, "swarm")
assert.equal(generated.data.record.swarmPath, "2026-07-19/image-1.png")
assert.equal(generated.data.record.initImageId, "image-source")
assert.equal(generated.data.record.initImageLabel, "source.png")
assert.equal(generated.data.record.parameters.seed, 987654321)
assert.equal("referenceImages" in generated.data.record.parameters, false)
assert.equal(generated.data.outputs[0].studioMetadata.imageId, "image-1")

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

const bulkMoved = await request("bulk_move_outputs", {
  imageIds: ["image-1"],
  folderId,
})
assert.deepEqual(bulkMoved.data[0].imageIds, ["image-1"])

const deleted = await request("bulk_delete_outputs", { imageIds: ["image-1"] })
assert.deepEqual(deleted.data.deletedIds, ["image-1"])
assert.deepEqual(deleted.data.failedIds, [])
assert.equal(deleted.data.outputs.length, 0)
assert.deepEqual(deleted.data.folders[0].imageIds, [])

console.log("backend contract: ok")
