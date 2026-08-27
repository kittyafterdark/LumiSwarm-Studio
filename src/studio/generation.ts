function quickGenerationParameters(defaults: Record<string, unknown> = {}): Record<string, unknown> {
  const numberDefault = (key: string, fallback: number): number => {
    const value = Number(defaults[key])
    return Number.isFinite(value) ? value : fallback
  }
  return {
    width: clamp(numberDefault("width", 1024), 64, 4096),
    height: clamp(numberDefault("height", 1024), 64, 4096),
    steps: clamp(numberDefault("steps", 20), 1, 150),
    cfgScale: clamp(numberDefault("cfgScale", numberDefault("cfg_scale", 7)), 1, 30),
    seed: -1,
    sampler: String(defaults.sampler || "") || undefined,
    scheduler: String(defaults.scheduler || "") || undefined,
    loras: [],
    loraWeights: [],
  }
}

function inheritQuickGenerationParameters(
  defaults: Record<string, unknown> = {},
  studioParameters?: Record<string, unknown> | null,
): Record<string, unknown> {
  return studioParameters ? { ...studioParameters } : quickGenerationParameters(defaults)
}

const ASPECT_PRESETS: Record<string, { label: string; width: number; height: number }> = {
  "1:1": { label: "Square · 1:1", width: 1024, height: 1024 },
  "2:3": { label: "Portrait · 2:3", width: 832, height: 1216 },
  "3:2": { label: "Landscape · 3:2", width: 1216, height: 832 },
  "3:4": { label: "Portrait · 3:4", width: 896, height: 1152 },
  "4:3": { label: "Landscape · 4:3", width: 1152, height: 896 },
  "4:5": { label: "Portrait · 4:5", width: 896, height: 1152 },
  "5:4": { label: "Landscape · 5:4", width: 1152, height: 896 },
  "9:16": { label: "Tall · 9:16", width: 768, height: 1344 },
  "16:9": { label: "Wide · 16:9", width: 1344, height: 768 },
}

function roundModelSize(value: number): number {
  return clamp(Math.round(value / 64) * 64, 64, 4096)
}

function dimensionsForAspect(
  aspect: string,
  scale: number,
): { width: number; height: number } {
  const preset = ASPECT_PRESETS[aspect] || ASPECT_PRESETS["1:1"]
  const factor = clamp(Number(scale) || 1024, 256, 2048) / 1024
  return {
    width: roundModelSize(preset.width * factor),
    height: roundModelSize(preset.height * factor),
  }
}

function applyPresetPrompt(base: string, update: string): string {
  const cleanUpdate = String(update || "").trim()
  if (!cleanUpdate) return base
  return cleanUpdate
}

function applyPresetStackPrompts(
  prompt: string,
  negativePrompt: string,
  titles: string[],
  presets: Array<{ title: string; paramMap: Record<string, string> }>,
): { prompt: string; negativePrompt: string } {
  let resolvedPrompt = prompt
  let resolvedNegative = negativePrompt
  for (const title of titles) {
    const preset = presets.find((item) => item.title === title)
    if (!preset) continue
    resolvedPrompt = applyPresetPrompt(resolvedPrompt, preset.paramMap.prompt || "")
    resolvedNegative = applyPresetPrompt(
      resolvedNegative,
      preset.paramMap.negativeprompt || preset.paramMap.negative_prompt || "",
    )
  }
  return { prompt: resolvedPrompt, negativePrompt: resolvedNegative }
}

function applySwarmPresetTokens(prompt: string, titles: string[]): string {
  const tokens = titles
    .map((title) => String(title || "").replace(/[<>\r\n]+/g, "").trim())
    .filter(Boolean)
    .map((title) => `<preset:${title}>`)
  const tokenList = tokens.join(", ")
  let resolved = String(prompt || "")
    .replace(/\{\{\s*swarm_preset\s*\}\}/gi, tokenList)
    .trim()
  const lower = resolved.toLowerCase()
  const missing = tokens.filter((token) => !lower.includes(token.toLowerCase()))
  if (missing.length) resolved = [missing.join(", "), resolved].filter(Boolean).join(", ")
  return resolved
    .replace(/(?:\s*,\s*){2,}/g, ", ")
    .replace(/^\s*,\s*|\s*,\s*$/g, "")
    .trim()
}
