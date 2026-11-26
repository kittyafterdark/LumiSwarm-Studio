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

// Background activity is intentionally separate from the cancellable image job.
interface CastBackgroundActivity { groupId: string; key: string; status: string; step: number; totalSteps: number; error: string; preview: string; imageId: string; kind?: "genesis"; name?: string; stage?: string; slot?: string; completed?: number; total?: number; genesisState?: string }
class CastBackgroundActivityTracker {
  private readonly jobs = new Map<string, CastBackgroundActivity>()
  private readonly seen = new Set<string>()
  private last: CastBackgroundActivity | null = null
  accept(payload: any): boolean {
    const genesis = ["cast_genesis_job", "cast_genesis_jobs_result"].includes(payload?.type)
    const snapshot = ["cast_background_jobs_result", "cast_genesis_jobs_result"].includes(payload?.type)
    if (!snapshot && !genesis && payload?.type !== "cast_background_job") return false
    for (const raw of snapshot ? (Array.isArray(payload.data) ? payload.data : []) : [payload.data]) {
      if (!raw) continue
      const value = genesis ? {...raw,kind:"genesis",genesisState:raw.status,status:raw.status==="ready"?"ready":["queued","review"].includes(raw.status)?"queued":["designing","rendering","processing"].includes(raw.status)?"generating":"error"} : raw
      if (!value || typeof value.groupId !== "string" || typeof value.key !== "string" || !["queued", "generating", "ready", "error", "review", "discarded"].includes(value.status)) continue
      const id = JSON.stringify([value.kind||"background", value.groupId, value.key])
      if (snapshot && this.seen.has(id)) continue
      if (!snapshot) { this.seen.add(id); if (this.seen.size > 512) this.seen.delete(this.seen.values().next().value!) }
      const previous = this.jobs.get(id)
      const job: CastBackgroundActivity = { groupId: value.groupId, key: value.key, status: value.status,
        step: Math.max(0, Number(value.step) || 0), totalSteps: Math.max(0, Number(value.totalSteps) || 0), error: String(value.error || ""),
        preview: value.status === "generating" ? (typeof value.preview === "string" && /^data:image\/(?:png|jpeg|webp);base64,/i.test(value.preview) ? value.preview : previous?.preview || "") : "",
        imageId: typeof value.imageId === "string" ? value.imageId : "", ...(value.kind==="genesis"?{kind:"genesis" as const,name:String(value.name||value.key),stage:String(value.stage||""),slot:String(value.slot||""),completed:Math.max(0,Number(value.completed)||0),total:Math.max(0,Number(value.total)||0),genesisState:String(value.genesisState||"")}: {}) }
      if (job.status === "queued" || job.status === "generating") this.jobs.set(id, job)
      else { this.jobs.delete(id); this.last = job.status === "discarded" ? null : job }
    }
    return true
  }
  snapshot(): CastBackgroundActivity[] { return [...(this.last ? [this.last] : []), ...this.jobs.values()].map(job => ({...job})) }
  current(): { job: CastBackgroundActivity | null; count: number; label: string; detail: string; progress: number | null } {
    const pending = [...this.jobs.values()]
    const job = pending.find(item => item.status === "generating") || pending[0] || this.last
    if (!job) return {job: null, count: 0, label: "", detail: "", progress: null}
    if(job.kind==="genesis"){
      const label=job.genesisState==="review"?"Review character design":job.status==="ready"?"Cast member ready":job.status==="error"?"Cast production paused":job.stage||"Cast production queued"
      const detail=`${job.name||job.key} · ${job.completed||0}/${job.total||0} expressions${job.slot?` · ${job.slot}`:""}${pending.length>1?` · ${pending.length} pending`:""}${job.error?` · ${job.error}`:""}`
      return {job,count:pending.length,label,detail,progress:job.total?Math.min(100,(job.completed||0)/job.total*100):null}
    }
    const label = job.status === "queued" ? "Background queued" : job.status === "generating" ? "Rendering background" : job.status === "ready" ? "Background saved" : job.status === "review" ? "Review background in Cast" : "Background failed"
    const detail = `${job.key}${job.status === "generating" && job.totalSteps ? ` · ${job.step}/${job.totalSteps}` : ""}${pending.length > 1 ? ` · ${pending.length} pending` : ""}${job.error ? ` · ${job.error}` : ""}`
    return { job, count: pending.length, label, detail, progress: job.status === "ready" ? 100 : job.status === "generating" && job.totalSteps > 0 ? Math.min(100, job.step / job.totalSteps * 100) : null }
  }
}

interface TaggedLivePreview { preview: string; step: number; totalSteps: number }
class TaggedLivePreviewCache {
  private readonly entries = new Map<string, TaggedLivePreview>()
  accept(id: string, data: any): TaggedLivePreview {
    const old = this.entries.get(id)
    const total = Number(data?.totalSteps) || old?.totalSteps || 0
    const step = Math.max(old?.step || 0, Number(data?.step) || 0)
    const next = { preview: typeof data?.preview === "string" && data.preview ? data.preview : old?.preview || "",
      step: total > 0 ? Math.min(step, total) : step, totalSteps: total }
    this.entries.delete(id); this.entries.set(id, next)
    while (this.entries.size > 16) this.entries.delete(this.entries.keys().next().value!)
    return next
  }
  get(id: string): TaggedLivePreview | undefined { return this.entries.get(id) }
  delete(id: string): void { this.entries.delete(id) }
  clear(): void { this.entries.clear() }
}
