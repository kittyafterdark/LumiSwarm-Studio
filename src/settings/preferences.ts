function storedStudioTheme(): StudioTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (STUDIO_THEMES.some((theme) => theme.id === value)) return value as StudioTheme
  } catch {
    // Storage can be disabled in hardened browser contexts.
  }
  return "lumiverse"
}

function persistStudioTheme(theme: StudioTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The active session can still use the selected theme.
  }
}

function defaultStudioAppearance(): StudioAppearance {
  return {
    colors: {},
    radius: null,
    opacity: 96,
    blur: 12,
    customCss: "",
  }
}

function defaultStudioBehavior(): StudioBehavior {
  return {
    completionToast: false,
    widgetEnabled: true,
    mobileQuickCreate: false,
    tagAutoGenerate: false,
    tagPromptInjection: false,
    protocolPrompt: DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
    requestMode: "inline",
    parserConnectionId: "",
    parserModel: "",
    stripUserOnlyLoraStack: false,
    autoPrintCharacterPositive: false,
    inlineImageScale: 100,
    requiredImageMin: 0,
    requiredImageMax: 0,
    tagPromptMode: "multi",
    tagPromptFamily: "anima",
  }
}

function normalizeRequiredImageRange(
  minValue: unknown,
  maxValue: unknown,
): { min: number; max: number } {
  let min = Math.max(0, Math.min(6, Math.trunc(Number(minValue) || 0)))
  let max = Math.max(0, Math.min(6, Math.trunc(Number(maxValue) || 0)))
  if (min === 0 && max > 0) min = 1
  if (min > 0 && max === 0) max = min
  if (max > 0 && max < min) [min, max] = [max, min]
  return { min, max }
}

function storedStudioBehavior(): StudioBehavior {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BEHAVIOR_STORAGE_KEY) || "{}")
    const imageRange = normalizeRequiredImageRange(parsed?.requiredImageMin, parsed?.requiredImageMax)
    return {
      completionToast: parsed?.completionToast === true,
      widgetEnabled: parsed?.widgetEnabled !== false,
      mobileQuickCreate: parsed?.mobileQuickCreate === true,
      tagAutoGenerate: parsed?.tagAutoGenerate === true,
      tagPromptInjection: parsed?.tagPromptInjection === true,
      protocolPrompt: typeof parsed?.protocolPrompt === "string" && parsed.protocolPrompt.trim()
        ? parsed.protocolPrompt
        : DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
      requestMode: parsed?.requestMode === "parser" ? "parser" : "inline",
      parserConnectionId: typeof parsed?.parserConnectionId === "string" ? parsed.parserConnectionId : "",
      parserModel: typeof parsed?.parserModel === "string" ? parsed.parserModel : "",
      stripUserOnlyLoraStack: parsed?.stripUserOnlyLoraStack === true,
      autoPrintCharacterPositive: parsed?.autoPrintCharacterPositive === true,
      inlineImageScale: parsed?.inlineImageScale === 75 || parsed?.inlineImageScale === 50
        ? parsed.inlineImageScale
        : 100,
      requiredImageMin: imageRange.min,
      requiredImageMax: imageRange.max,
      tagPromptMode: parsed?.tagPromptMode === "pov" ? "pov" : "multi",
      tagPromptFamily: parsed?.tagPromptFamily === "illustrious" ? "illustrious" : "anima",
    }
  } catch {
    return defaultStudioBehavior()
  }
}

function persistStudioBehavior(behavior: StudioBehavior): void {
  try {
    window.localStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(behavior))
  } catch {
    // The active session can still use the selected behavior.
  }
}

function studioAppearanceIsCustom(appearance: StudioAppearance): boolean {
  return Object.keys(appearance.colors).length > 0
    || appearance.radius !== null
    || Math.round(appearance.opacity) !== 96
    || Math.round(appearance.blur) !== 12
    || Boolean(appearance.customCss.trim())
}

function normalizeHexColor(value: unknown): string | null {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color.slice(1).split("").map((part) => `${part}${part}`).join("")}`.toLowerCase()
  }
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (!rgb) return null
  return `#${rgb.slice(1, 4)
    .map((part) => clamp(Math.round(Number(part)), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`
}

function storedStudioAppearance(): StudioAppearance {
  const fallback = defaultStudioAppearance()
  try {
    const parsed = JSON.parse(window.localStorage.getItem(APPEARANCE_STORAGE_KEY) || "{}")
    const colors: StudioAppearance["colors"] = {}
    for (const { key } of APPEARANCE_COLORS) {
      const color = normalizeHexColor(parsed?.colors?.[key])
      if (color) colors[key] = color
    }
    return {
      colors,
      radius: Number.isFinite(parsed?.radius) ? clamp(Number(parsed.radius), 0, 28) : null,
      opacity: Number.isFinite(parsed?.opacity) ? clamp(Number(parsed.opacity), 45, 100) : fallback.opacity,
      blur: Number.isFinite(parsed?.blur) ? clamp(Number(parsed.blur), 0, 30) : fallback.blur,
      customCss: String(parsed?.customCss || "").slice(0, 32768),
    }
  } catch {
    return fallback
  }
}

function persistStudioAppearance(appearance: StudioAppearance): void {
  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance))
  } catch {
    // The appearance still applies for the active session.
  }
}

function cloneStudioAppearance(appearance: StudioAppearance): StudioAppearance {
  return {
    ...appearance,
    colors: { ...appearance.colors },
  }
}

function sanitizeCustomCss(value: unknown): string {
  return String(value || "")
    .slice(0, 32768)
    .replace(/@import\s+(?:url\()?[^;]+;?/gi, "/* @import removed by Swarm Studio */")
    .replace(/expression\s*\(/gi, "/* expression removed */(")
}

function applyAppearanceVariables(target: HTMLElement, appearance: StudioAppearance): void {
  for (const { key, cssProperty } of APPEARANCE_COLORS) {
    const color = appearance.colors[key]
    const properties = [
      cssProperty,
      ...(key === "canvas" ? ["--lumiverse-bg"] : []),
      ...(key === "panel" ? ["--lumiverse-fill"] : []),
      ...(key === "header" ? ["--lumiverse-fill-subtle"] : []),
      ...(key === "outline" ? ["--lumiverse-border"] : []),
    ]
    for (const property of properties) {
      if (color) target.style.setProperty(property, color)
      else target.style.removeProperty(property)
    }
  }
  target.style.setProperty("--ss-surface-opacity", `${clamp(appearance.opacity, 45, 100)}%`)
  target.style.setProperty("--ss-backdrop-blur", `${clamp(appearance.blur, 0, 30)}px`)
  if (appearance.radius === null) {
    target.style.removeProperty("--ss-control-radius")
    target.style.removeProperty("--ss-panel-radius")
    target.style.removeProperty("--ss-slider-radius")
  } else {
    const radius = clamp(appearance.radius, 0, 28)
    target.style.setProperty("--ss-control-radius", `${radius}px`)
    target.style.setProperty("--ss-panel-radius", `${Math.min(36, radius + 5)}px`)
    target.style.setProperty("--ss-slider-radius", `${radius}px`)
  }
}
