// Model dialect selection is independent of generation recipes and subject count.
type ScenePromptFamily = "anima" | "anima-regional" | "anima-aesthetic" | "illustrious" | "moss" | "moss-bbox" | "moss-layout" | "krea" | "auto"
type ResolvedScenePromptFamily = Exclude<ScenePromptFamily, "auto">
interface ManualLoreSelection { bookId: string; entryId: string; bookName: string; name: string; entityType: string }
const MANUAL_LORE_LIMIT = 32
function manualLoreKey(bookId: string, entryId: string): string { return JSON.stringify([bookId, entryId]) }
const PROMPT_FAMILIES: ReadonlyArray<{id: ScenePromptFamily; label: string}> = [
  {id:"auto", label:"Auto (provider + checkpoint)"}, {id:"anima", label:"Anima"},
  {id:"anima-aesthetic", label:"Anima Aesthetic"}, {id:"anima-regional", label:"Anima · Regional"},
  {id:"illustrious", label:"Illustrious"}, {id:"moss", label:"MOSS · Caption"}, {id:"moss-bbox", label:"MOSS · Swarm BBox"}, {id:"moss-layout", label:"MOSS · Native JSON"}, {id:"krea", label:"Krea 2"},
]
function cleanPromptFamily(value: unknown): ScenePromptFamily {
  return PROMPT_FAMILIES.find(item => item.id === value)?.id || "anima"
}
function promptFamilyLabel(value: ScenePromptFamily): string {
  return PROMPT_FAMILIES.find(item => item.id === value)?.label || "Anima"
}
function isMossFamily(family: ScenePromptFamily): boolean { return family === "moss" || family === "moss-bbox" || family === "moss-layout" }
function isLayoutFamily(family: ScenePromptFamily): boolean { return family === "moss-bbox" || family === "moss-layout" }
function isCaptionFamily(family: ScenePromptFamily): boolean { return isMossFamily(family) || family === "krea" }
interface PromptModelMetadata { architecture?: string; compatClass?: string; className?: string }
function metadataPromptFamily(metadata?: PromptModelMetadata): ResolvedScenePromptFamily | undefined {
  for (const raw of [metadata?.architecture, metadata?.compatClass, metadata?.className]) {
    const id = (raw || "").trim().toLowerCase().replace(/_/g, "-").split("/")[0]
    if (id === "moss-image" || id === "moss image") return "moss"
    if (id === "krea-2" || id === "krea 2") return "krea"
    if (id === "anima" || id === "anima-preview") return "anima"
    if (id === "illustrious" || id === "illustrious-xl" || id === "noobai-xl") return "illustrious"
  }
  return undefined // SDXL alone is not proof of Illustrious training.
}
// Keep recognition separate from the legacy generation fallback. Authoring
// can be genuinely model-neutral when a checkpoint has no known dialect.
function recognizedPromptFamily(checkpoint: string, metadata?: PromptModelMetadata): ResolvedScenePromptFamily | undefined {
  const model = checkpoint.replace(/\\/g, "/").split("/").pop() || ""
  const detected = metadataPromptFamily(metadata)
  if (detected) return detected === "anima" && /aesthetic/i.test(model) ? "anima-aesthetic" : detected
  if (/anima.*aesthetic/i.test(model)) return "anima-aesthetic"
  if (/(?:^|[^a-z0-9])moss[-_ .]?image(?:[^a-z0-9]|$)|(?:^|[^a-z0-9])moss[-_ .]/i.test(model)) return "moss"
  if (/(?:^|[^a-z0-9])krea[-_ .]?2(?:[^a-z0-9]|$)/i.test(model)) return "krea"
  if (/illustrious|noob[-_ .]?ai/i.test(model)) return "illustrious"
  if (/anima/i.test(model)) return "anima"
  return undefined
}
// Explicit manual overrides win; ordinary Anima selection still recognizes Aesthetic.
export function resolvePromptFamily(mode: ScenePromptFamily, checkpoint: string, metadata?: PromptModelMetadata): ResolvedScenePromptFamily {
  const model = checkpoint.replace(/\\/g, "/").split("/").pop() || ""
  if (mode !== "auto") return mode === "anima" && /anima.*aesthetic/i.test(model) ? "anima-aesthetic" : mode
  return recognizedPromptFamily(checkpoint, metadata) || "anima"
}

// 0 disables explicit count conditioning; absent legacy preference defaults to 1.5.
function cleanCountStrength(value: unknown): number {
  if (value === undefined || value === null || value === "") return 1.5
  const n = Number(value)
  return n === 0 ? 0 : Number.isFinite(n) ? Math.round(Math.max(1, Math.min(2, n)) * 100) / 100 : 1.5
}
const COUNT_ATTRIBUTE_GUIDANCE = 'Optionally set count="2boys, 1girl" on the opening swarm-image tag, with double quotes and unweighted Booru tags only. Match the visible count in the body exactly; omit for unknown counts or scenery. Exclude off-screen characters. Studio owns count weighting.'

// Upgrade known shipped instruction sentences in saved protocol copies, not arbitrary custom syntax.
export function upgradePromptProtocol(value: string): string {
  return value
    .replace("A canonical character/series tag is allowed only when explicitly supplied as a trained tag.", "Use a verified canonical character/series tag for known franchise characters, or an explicitly supplied trained trigger. Preserve established tag name order (Japanese surname first where canonical); never invent a tag from a conversational name.")
    .replace("Swarm Studio compiles eligible multi-subject scene plans into native SwarmUI <region:x,y,width,height,strength> conditioning with generous overlapping subject regions and a <region:background> environment.", "Depending on the selected compiler, Swarm Studio may compile eligible multi-subject scene plans into native SwarmUI <region:x,y,width,height,strength> conditioning or use natural-language spatial binding. The compiler owns conditioning syntax.")
    .replace(/Treat the tag body as a small visual scene plan\.(?! Mark explicit identity ownership)/, "Treat the tag body as a small visual scene plan. Mark explicit identity ownership on subject headings: left man [character]: ..., right woman [persona]: ..., center person [other]: ... . The marker is internal, not a diffusion token. Use [character] only for one unambiguous saved identity; for multi-NPC cards use [other] and describe each NPC separately. Never mark an invisible viewer. An unmarked subject is not implicitly the persona. Include visible text: followed by the exact quoted lettering and its placement when needed.")
    .replace("Do not use BREAK, XML-like pseudo-scoping, or bracketed character identifiers as semantic separators.", "Do not use BREAK or XML-like pseudo-scoping. Only the documented [character], [persona], [other] heading markers are allowed; Studio removes them before diffusion.")
}
