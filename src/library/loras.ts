function presetListValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
  const text = String(value || "").trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean)
  } catch {
    // Older Swarm presets commonly use comma-separated lists.
  }
  return text.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean)
}

function lorasFromSwarmPreset(paramMap: Record<string, string>): Array<{ name: string; weight: number }> {
  const normalized = new Map(
    Object.entries(paramMap || {}).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]),
  )
  const names = presetListValue(normalized.get("loras"))
  const weights = presetListValue(normalized.get("loraweights")).map(Number)
  return names.slice(0, 64).map((name, index) => ({
    name,
    weight: Number.isFinite(weights[index]) ? clamp(weights[index], -10, 10) : 1,
  }))
}

function serializeSwarmPresetList(values: unknown[]): string {
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(",")
}

function labelFromName(name: string): string {
  const leaf = name.replace(/\\/g, "/").split("/").pop() || name
  return leaf.replace(/\.(safetensors|ckpt|pt)$/i, "")
}

function loraFolderPath(name: string): string {
  const parts = String(name || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part && part !== ".")
  parts.pop()
  return parts.join("/")
}

function normalizeModelName(value: string): string {
  return String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .pop()!
    .replace(/\.(safetensors|ckpt|pt)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

function normalizeCompat(value: string): string {
  return String(value || "").trim().toLowerCase().replace(/[\s_.]+/g, "-")
}

function inferModelFamily(...values: string[]): ModelFamily {
  const text = values.join(" ").toLowerCase().replace(/[_./\\-]+/g, " ")
  const compact = text.replace(/[^a-z0-9]+/g, "")
  if (/\banima\b|\banima1\b/.test(text) || (compact.includes("anima") && !compact.includes("animation"))) return "anima"
  if (/\billustrious\b|\bnoob\s*ai\b|\bwai\s*(?:nsfw|ani|illustrious)\b/.test(text)) return "illustrious"
  if (/\bpony\b|\bpdxl\b/.test(text)) return "pony"
  if (/\bflux\b/.test(text)) return "flux"
  if (/\bchroma\b/.test(text)) return "chroma"
  if (/\bstable diffusion 3\b|\bsd3\b/.test(text)) return "sd3"
  if (/\bqwen\b/.test(text)) return "qwen"
  if (/\bhunyuan\b/.test(text)) return "hunyuan"
  if (/\bsdxl\b|\bstable diffusion xl\b|\bxl 1\b/.test(text)) return "sdxl"
  if (/\bsd ?1[ ._-]?5\b|\bstable diffusion v?1\b/.test(text)) return "sd15"
  return "unknown"
}

function modelSignalsCompatible(
  checkpointCompatValue: string,
  loraCompatValue: string,
  checkpointSignals: string[],
  loraSignals: string[],
): boolean {
  const checkpointCompat = normalizeCompat(checkpointCompatValue)
  const loraCompat = normalizeCompat(loraCompatValue)
  if (checkpointCompat && loraCompat) {
    if (checkpointCompat === loraCompat) return true
    if (checkpointCompat.startsWith("stable-diffusion-v3") && loraCompat.startsWith("stable-diffusion-v3")) return true
    if (checkpointCompat.startsWith("chroma") && loraCompat.startsWith("flux-1")) return true
    return false
  }
  const checkpointFamily = inferModelFamily(...checkpointSignals)
  const loraFamily = inferModelFamily(...loraSignals)
  if (checkpointFamily === "unknown" || loraFamily === "unknown") return true
  return checkpointFamily === loraFamily
}

function familyLabel(family: ModelFamily): string {
  const labels: Record<ModelFamily, string> = {
    anima: "Anima",
    illustrious: "Illustrious",
    pony: "Pony",
    sdxl: "SDXL",
    sd15: "SD 1.5",
    flux: "Flux",
    sd3: "SD3",
    chroma: "Chroma",
    qwen: "Qwen",
    hunyuan: "Hunyuan",
    unknown: "Unknown family",
  }
  return labels[family]
}

function manualLora(name: string, title = "", sourceUrl = ""): LoraMetadata {
  return {
    name,
    title: title || labelFromName(name),
    author: "",
    description: "Manually added without SwarmUI metadata.",
    previewRef: null,
    architecture: "",
    className: "",
    compatClass: "",
    resolution: "",
    standardWidth: null,
    standardHeight: null,
    license: "",
    date: "",
    usageHint: "",
    triggerPhrase: "",
    tags: [],
    defaultWeight: 1,
    defaultConfinement: null,
    local: true,
    timeCreated: null,
    timeModified: null,
    hash: "",
    sourceUrl: safeHttpUrl(sourceUrl),
  }
}
