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
