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
    surfaceMode: "host",
    radius: null,
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
    historyImageMarkers: "keep",
    protocolPrompt: DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
    requestMode: "inline",
    parserConnectionId: "",
    parserModel: "",
    stripUserOnlyLoraStack: false,
    autoPrintCharacterPositive: false,
    autoFinalizeInline: false,
    deleteExpressionDrafts: false,
    inlineImageScale: 100,
    requiredImageMin: 0,
    requiredImageMax: 0,
    tagPromptMode: "multi",
    tagPromptFamily: "anima",
    countStrength: 1.5,
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
      historyImageMarkers: parsed?.historyImageMarkers === "strip" ? "strip" : "keep",
      protocolPrompt: typeof parsed?.protocolPrompt === "string" && parsed.protocolPrompt.trim()
        ? upgradePromptProtocol(parsed.protocolPrompt)
        : DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
      requestMode: parsed?.requestMode === "parser" ? "parser" : "inline",
      parserConnectionId: typeof parsed?.parserConnectionId === "string" ? parsed.parserConnectionId : "",
      parserModel: typeof parsed?.parserModel === "string" ? parsed.parserModel : "",
      stripUserOnlyLoraStack: parsed?.stripUserOnlyLoraStack === true,
      autoPrintCharacterPositive: parsed?.autoPrintCharacterPositive === true,
      autoFinalizeInline: parsed?.autoFinalizeInline === true,
      deleteExpressionDrafts: parsed?.deleteExpressionDrafts === true,
      inlineImageScale: parsed?.inlineImageScale === 75 || parsed?.inlineImageScale === 50
        ? parsed.inlineImageScale
        : 100,
      requiredImageMin: imageRange.min,
      requiredImageMax: imageRange.max,
      tagPromptMode: parsed?.tagPromptMode === "pov" ? "pov" : "multi",
      tagPromptFamily: cleanPromptFamily(parsed?.tagPromptFamily),
      countStrength: cleanCountStrength(parsed?.countStrength),
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
    || appearance.surfaceMode !== "host"
    || appearance.radius !== null
    || Math.round(appearance.blur) !== 12
    || Boolean(appearance.customCss.trim())
}

function normalizeHexColor(value: unknown): string | null {
  const color = String(value || "").trim()
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color.slice(1).split("").map((part) => `${part}${part}`).join("")}`.toLowerCase()
  }
  // Browsers return color(srgb ...) for color-mix() results. Keep the native
  // swatch in sync with the actual surface instead of falling back to defaults.
  const srgb = color.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i)
  if (srgb) return `#${srgb.slice(1, 4)
    .map((part) => clamp(Math.round(Number(part) * 255), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`
  // Transparent backgrounds (tabs, bare labels) are not a usable swatch sample.
  if (/^transparent$/i.test(color) || (/^rgba?\(/i.test(color) && /[,/]\s*0(?:\.0+)?\s*\)$/.test(color))) return null
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
      surfaceMode: parsed?.surfaceMode === "neutral" || parsed?.surfaceMode === "flat"
        ? parsed.surfaceMode : "host",
      radius: Number.isFinite(parsed?.radius) ? clamp(Number(parsed.radius), 0, 28) : null,
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

// The Buttons and Accent swatches can be arbitrarily bright or dark. Keep
// captions/icons legible even when a user picks radically different colors.
function readableColorInk(hex: string): "#09090b" | "#ffffff" {
  const channels = [1, 3, 5].map(index => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
  const luminance = channels.reduce((sum, value, index) => {
    const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    return sum + linear * [0.2126, 0.7152, 0.0722][index]
  }, 0)
  return (1.05 / (luminance + 0.05)) >= ((luminance + 0.05) / 0.05) ? "#ffffff" : "#09090b"
}

function applyAppearanceVariables(target: HTMLElement, appearance: StudioAppearance): void {
  for (const { key, cssProperty } of APPEARANCE_COLORS) {
    const color = appearance.colors[key]
    const properties = [
      cssProperty,
      ...(key === "accent" ? ["--lumiverse-accent"] : []),
      ...(key === "canvas" ? ["--lumiverse-bg"] : []),
      ...(key === "surface" ? ["--ss-surface-raised", "--ss-surface-field-base"] : []),
      ...(key === "panel" ? ["--lumiverse-fill"] : []),
      ...(key === "header" ? ["--lumiverse-fill-subtle"] : []),
      ...(key === "outline" ? ["--lumiverse-border"] : []),
    ]
    for (const property of properties) {
      if (color) target.style.setProperty(property, color)
      else target.style.removeProperty(property)
    }
  }
  // A custom Buttons swatch overrides the primary action fill as well as
  // secondary controls, except Studio's Generate/Stop CTA, which follows Accent.
  // Without a Buttons swatch, primary actions continue to follow Accent.
  const primary = appearance.colors.button
  const accent = appearance.colors.accent
  for (const [property, value] of [
    ["--ss-primary-bg", primary],
    ["--ss-primary-ink", primary ? readableColorInk(primary) : null],
    ["--ss-button-ink", primary ? readableColorInk(primary) : null],
    ["--ss-accent-ink", accent ? readableColorInk(accent) : null],
  ] as Array<[string, string | null | undefined]>) {
    if (value) target.style.setProperty(property, value)
    else target.style.removeProperty(property)
  }
  target.dataset.surfaceMode = appearance.surfaceMode
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
