function numberValue(input: HTMLInputElement, fallback: number): number {
  const value = Number(input.value)
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function safeHttpUrl(value: unknown): string {
  const candidate = String(value || "").trim()
  if (!candidate) return ""
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : ""
  } catch {
    return ""
  }
}

function downloadJson(value: unknown, filename: string): void {
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename.replace(/[^a-z0-9_.-]+/gi, "-").replace(/^-+|-+$/g, "") || "swarm-studio.json"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function fitAspectWithin(
  aspect: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const safeAspect = clamp(Number(aspect) || 1, 0.1, 10)
  let width = Math.max(1, maxWidth)
  let height = width / safeAspect
  if (height > maxHeight) {
    height = Math.max(1, maxHeight)
    width = height * safeAspect
  }
  return { width, height }
}

function matchesKeywordQuery(query: string, values: unknown[]): boolean {
  const keywords = (String(query || "").toLowerCase().match(/"[^"]+"|\S+/g) || [])
    .map((keyword) => keyword.replace(/^"|"$/g, "").trim())
    .filter(Boolean)
  if (!keywords.length) return true
  const haystack = values
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ")
  return keywords.every((keyword) => haystack.includes(keyword))
}
