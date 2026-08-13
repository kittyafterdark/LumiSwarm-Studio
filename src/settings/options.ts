const STUDIO_THEMES: Array<{ id: StudioTheme; label: string; color: string }> = [
  { id: "lumiverse", label: "Lumiverse", color: "var(--lumiverse-primary, #7dd3fc)" },
  { id: "custom", label: "Custom", color: "var(--lumiverse-accent, #7dd3fc)" },
]
const APPEARANCE_COLORS: Array<{ key: AppearanceColorKey; label: string; cssProperty: string }> = [
  { key: "accent", label: "Accent", cssProperty: "--lumiverse-accent" },
  { key: "button", label: "Buttons", cssProperty: "--ss-button-bg" },
  { key: "header", label: "Headers", cssProperty: "--ss-header-bg" },
  { key: "panel", label: "Panels", cssProperty: "--ss-panel-bg" },
  { key: "outline", label: "Outlines", cssProperty: "--ss-outline" },
  { key: "canvas", label: "Background", cssProperty: "--ss-canvas-bg" },
  { key: "text", label: "Text", cssProperty: "--lumiverse-text" },
]
