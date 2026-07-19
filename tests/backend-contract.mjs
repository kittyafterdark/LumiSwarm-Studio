import assert from "node:assert/strict"

let frontendHandler
const sent = []
const secrets = new Map()
const permissions = new Set(["image_gen", "cors_proxy", "images", "chats"])

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
          api_url: "http://127.0.0.1:7801",
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
        api_url: "http://127.0.0.1:7801",
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
      assert.equal(options.chatId, "chat-1")
      return {
        data: [{ id: "image-1", url: "/api/v1/images/image-1?size=sm", original_filename: "image.png" }],
        total: 1,
      }
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
  async cors(url, options) {
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
      assert.equal(body.subtype, "LoRA")
      assert.equal(body.dataImages, false)
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
  log: { info() {} },
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

const connection = await request("load_connection", { connectionId: "swarm-1" })
assert.equal(connection.data.loras.length, 1)
assert.equal(connection.data.loras[0].triggerPhrase, "ink style")
assert.equal(connection.data.loras[0].defaultWeight, 0.75)

const preview = await request("preview", {
  connectionId: "swarm-1",
  name: "styles/ink.safetensors",
  previewRef: "/ViewSpecial/LoRA/styles/ink.safetensors",
})
assert.equal(preview.dataUrl, "data:image/png;base64,QUJD")

const generated = await request("generate", {
  input: {
    prompt: "ink style, portrait",
    connection_id: "swarm-1",
    model: "base.safetensors",
    clientJobId: "studio-job-1",
    parameters: {
      loras: ["styles/ink.safetensors"],
      loraWeights: [0.75],
    },
  },
})
assert.equal(generated.data.result.provider, "swarmui")
assert.equal(generated.data.outputs.length, 1)

console.log("backend contract: ok")
