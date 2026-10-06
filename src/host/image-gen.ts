interface NativeStudioPresetInput {
  kind: "main" | "character"
  characterId?: string
  lookId?: string
  name: string
  prompt: string
  negativePrompt: string
}

// Lumiverse owns validation, persistence and bindings. Reuse its public import
// API (ID-based upsert), as the existing read integration uses public export.
// Its preset schema has no renderer recipe: do not send Swarm parameters.
function studioNativePreset(input: NativeStudioPresetInput): Record<string, unknown> {
  if (!["main", "character"].includes(input.kind)) throw new Error("Unsupported native preset kind.")
  if (input.kind === "character" && !input.characterId?.trim()) throw new Error("Choose an active character first.")
  if (!input.name?.trim() || typeof input.prompt !== "string" || typeof input.negativePrompt !== "string") throw new Error("Invalid native prompt preset.")
  const suffix = input.kind === "main" ? "main" : `character:${encodeURIComponent(input.characterId!)}:${encodeURIComponent(input.lookId || "base")}`
  return { id: `lumiswarm-studio:${suffix}`, name: input.name.trim().slice(0, 100), kind: input.kind, mode: "custom", prompt: input.prompt.slice(0, 12000), negativePrompt: input.negativePrompt.slice(0, 12000) }
}

async function nativeImageGenAvailable(fetcher: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetcher("/api/v1/image-gen/export", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ include_presets: false, include_settings: false, include_connections: false, include_parameters: false }) })
    if (!response.ok) return false
    const data = await response.json()
    return data?.type === "lumiverse_image_gen_config" && data?.version === 1
  } catch { return false }
}

async function upsertStudioNativePreset(input: NativeStudioPresetInput, fetcher: typeof fetch = fetch): Promise<{ id: string; warnings: string[] }> {
  const preset = studioNativePreset(input)
  const response = await fetcher("/api/v1/image-gen/import", {
    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
    body: JSON.stringify({ type: "lumiverse_image_gen_config", version: 1, presets: [preset] }),
  })
  const data = await response.json()
  if (!response.ok || data?.imported?.presets !== 1) throw new Error(String(data?.error || data?.errors?.join("; ") || "Lumiverse did not save the prompt preset."))
  if (input.kind === "character") {
    const binding = await fetcher(`/api/v1/image-gen/preset-bindings/character/${encodeURIComponent(input.characterId!)}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ preset_id: preset.id }),
    })
    if (!binding.ok) throw new Error("Prompt preset saved, but Lumiverse could not bind it to the character. Retry to repair the binding.")
  }
  return { id: String(preset.id), warnings: Array.isArray(data.errors) ? data.errors.map(String) : [] }
}

async function studioCharacterImageAction(characterId: string, imageIds: string[], action: "avatar" | "gallery", fetcher: typeof fetch = fetch): Promise<{ saved: string[]; failed: string[] }> {
  const ids = [...new Set(imageIds.filter(id => typeof id === "string" && id.trim()))]
  if (!characterId || !ids.length) throw new Error("Choose an active character and saved outputs first.")
  const base = `/api/v1/characters/${encodeURIComponent(characterId)}`
  const check = async (response: Response, fallback: string) => {
    if (response.ok) return
    const data = await response.json().catch(() => null)
    throw new Error(String(data?.error || fallback))
  }
  if (action === "avatar") {
    if (ids.length !== 1) throw new Error("Choose one output for the character picture.")
    const image = await fetcher(`/api/v1/images/${encodeURIComponent(ids[0])}`, { credentials: "same-origin" })
    await check(image, "Could not load the saved output.")
    const blob = await image.blob()
    if (!blob.type.startsWith("image/")) throw new Error("The saved output is not an image.")
    const form = new FormData()
    form.append("avatar", blob, `studio-output.${blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1] || "png"}`)
    const response = await fetcher(`${base}/avatar`, { method: "POST", credentials: "same-origin", body: form })
    await check(response, "Lumiverse could not set the character picture.")
    return { saved: ids, failed: [] }
  }
  const existing = await fetcher(`${base}/gallery`, { credentials: "same-origin" })
  await check(existing, "Character galleries are unavailable in this Lumiverse host.")
  const items = await existing.json()
  if (!Array.isArray(items)) throw new Error("Lumiverse returned an invalid gallery.")
  const linked = new Set(items.map(item => String(item.image_id)))
  const saved: string[] = [], failed: string[] = []
  for (const imageId of ids) {
    if (linked.has(imageId)) { saved.push(imageId); continue }
    try {
      const response = await fetcher(`${base}/gallery/link`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_id: imageId }) })
      await check(response, "Lumiverse could not add the output to the gallery.")
      saved.push(imageId)
    } catch { failed.push(imageId) }
  }
  return { saved, failed }
}
