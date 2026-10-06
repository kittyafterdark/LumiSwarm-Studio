interface GenerationRecipe {
  width?: number
  height?: number
  steps?: number
  cfg?: number
  sampler?: string
  scheduler?: string
}
interface StudioGenerationDefaults extends GenerationRecipe { version: 1; checkpoint?: string }
interface StudioRenderStyle {
  id: string
  name: string
  loraStackId?: string
  checkpoint?: string
  recipe?: GenerationRecipe
  positiveAppend?: string
  negativeAppend?: string
}
function recipeRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {}
}
function sanitizeGenerationRecipe(value: unknown): GenerationRecipe {
  const input = recipeRecord(value)
  const result: Record<string, any> = {}
  for (const [key, min, max] of [["width", 64, 4096], ["height", 64, 4096], ["steps", 1, 150], ["cfg", 0, 30]] as const) {
    const v = key === "cfg" ? input.cfg ?? input.cfgScale ?? input.cfg_scale : input[key]
    if (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max) result[key] = v
  }
  for (const key of ["sampler", "scheduler"]) {
    if (typeof input[key] === "string") result[key] = input[key].slice(0, 200)
  }
  return result
}
function sanitizeStudioDefaults(value: unknown): StudioGenerationDefaults | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const input = recipeRecord(value)
  if (input.version !== undefined && input.version !== 1) return null
  return { version: 1, ...sanitizeGenerationRecipe(input), ...(typeof input.checkpoint === "string" ? { checkpoint: input.checkpoint.slice(0, 500) } : {}) }
}
function sanitizeRenderStyles(value: unknown): StudioRenderStyle[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  return value.slice(0, 200).flatMap(raw => {
    const input = recipeRecord(raw)
    if (typeof input.id !== "string" || !input.id || seen.has(input.id) || typeof input.name !== "string" || !input.name.trim()) return []
    seen.add(input.id)
    const result: StudioRenderStyle = { id: input.id.slice(0, 200), name: input.name.trim().slice(0, 100), recipe: sanitizeGenerationRecipe(input.recipe) }
    for (const key of ["loraStackId", "checkpoint", "positiveAppend", "negativeAppend"] as const) {
      if (typeof input[key] === "string") result[key] = input[key].slice(0, key.endsWith("Append") ? 12000 : 500)
    }
    return [result]
  })
}
// Stable renderer precedence: provider < explicit defaults < live controls < style
// < character base < active look < explicit job. Seed/custom workflow data stays
// in the caller's live/job parameters; recipes never copy it into saved objects.
function resolveGenerationConfig(layers: {
  provider?: unknown; studioDefaults?: unknown; liveProfile?: unknown; style?: unknown
  characterBase?: unknown; characterLook?: unknown; job?: unknown
}): GenerationRecipe & { checkpoint?: string } {
  const result: GenerationRecipe & { checkpoint?: string } = {}
  for (const value of [layers.provider, layers.studioDefaults, layers.liveProfile, layers.style, layers.characterBase, layers.characterLook, layers.job]) {
    const layer = recipeRecord(value)
    Object.assign(result, sanitizeGenerationRecipe(layer.recipe ?? layer.generationRecipe ?? layer))
    if (typeof layer.checkpoint === "string" && layer.checkpoint) result.checkpoint = layer.checkpoint
  }
  return result
}
function recipeParameters(recipe: GenerationRecipe): Record<string, unknown> {
  const { cfg, ...rest } = sanitizeGenerationRecipe(recipe)
  return { ...rest, ...(cfg !== undefined ? { cfgScale: cfg } : {}) }
}
