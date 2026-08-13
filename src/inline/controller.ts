interface TaggedImageJobView {
  id: string
  key: string
  tagFingerprint?: string
  chatId: string
  messageId: string
  slot: string
  prompt: string
  negativePrompt: string
  aspect: string
  alt: string
  status: "requested" | "queued" | "generating" | "ready" | "failed" | "cancelled"
  clientJobId: string
  imageId: string
  imageUrl: string
  inserted: boolean
  error: string
}

function widgetEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function widgetKeyHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

class TaggedImageController {
  private readonly ctx: FrontendContext
  private readonly openStudioWithPrompt: (prompt: string, negativePrompt: string) => void
  private readonly openQuickCreateWithPrompt: (
    prompt: string,
    negativePrompt: string,
    onConfirm: (prompt: string, negativePrompt: string) => void,
  ) => boolean
  private readonly openLibrary: () => void
  private behavior: StudioBehavior
  private readonly jobs = new Map<string, TaggedImageJobView>()
  private readonly tagPayloads = new Map<string, any>()
  private readonly tagFingerprints = new Map<string, string>()
  private readonly settledTagLookups = new Set<string>()
  private readonly settledAttachmentRequests = new Set<string>()
  private readonly settledMessageTargets = new Map<string, string>()
  private readonly cleanups = new Map<string, () => void>()
  private readonly reconciliationQueues = new Map<string, Promise<void>>()
  private destroyed = false

  private eventClosest<T extends HTMLElement>(
    event: Event,
    selector: string,
  ): T | null {
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) continue

      if (node.matches(selector)) {
        return node as T
      }

      const closest = node.closest<T>(selector)
      if (closest) return closest
    }

    const target = event.target
    return target instanceof HTMLElement
      ? target.closest<T>(selector)
      : null
  }

  private readonly handleInlineClick = (event: MouseEvent) => {
    const action = this.eventClosest<HTMLElement>(
      event,
      '[data-swarm-studio-inline-action]',
    )
    if (!action) return

    const inline = this.inlineJobFromTarget(action)
    if (!inline) return

    event.preventDefault()
    event.stopImmediatePropagation()

    void this.showJobMenu(
      inline.job,
      event.clientX,
      event.clientY,
    )
  }

  private readonly handleInlineContextMenu = (event: MouseEvent) => {
    const figure = this.eventClosest<HTMLElement>(
      event,
      'figure[data-swarm-studio-image="true"][data-swarm-studio-job-id]',
    )
    if (!figure) return

    const inline = this.inlineJobFromTarget(figure)
    if (!inline) return

    event.preventDefault()
    event.stopImmediatePropagation()

    void this.showJobMenu(
      inline.job,
      event.clientX,
      event.clientY,
    )
  }

  private readonly handleInlineKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return

    const action = this.eventClosest<HTMLElement>(
      event,
      '[data-swarm-studio-inline-action]',
    )
    if (!action) return

    const inline = this.inlineJobFromTarget(action)
    if (!inline) return

    event.preventDefault()
    event.stopImmediatePropagation()

    void this.showJobMenu(
      inline.job,
      Math.round(window.innerWidth / 2),
      Math.round(window.innerHeight / 2),
    )
  }

  constructor(
    ctx: FrontendContext,
    behavior: StudioBehavior,
    openStudioWithPrompt: (prompt: string, negativePrompt: string) => void,
    openQuickCreateWithPrompt: (
      prompt: string,
      negativePrompt: string,
      onConfirm: (prompt: string, negativePrompt: string) => void,
    ) => boolean,
    openLibrary: () => void,
  ) {
    this.ctx = ctx
    this.behavior = { ...behavior }
    this.openStudioWithPrompt = openStudioWithPrompt
    this.openQuickCreateWithPrompt = openQuickCreateWithPrompt
    this.openLibrary = openLibrary
    window.addEventListener("click", this.handleInlineClick, true)
    window.addEventListener("contextmenu", this.handleInlineContextMenu, true)
    window.addEventListener("keydown", this.handleInlineKeyDown, true)
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
  }

  handleTag(payload: any): void {
    if (!payload?.chatId || !payload?.messageId || payload?.isUser) return
    const slot = String(payload?.attrs?.slot || `image-${widgetKeyHash(String(payload.fullMatch || payload.content)).slice(0, 6)}`)
      .replace(/[^a-z0-9_-]+/gi, "-")
      .slice(0, 80)
    const lookup = this.lookupKey(String(payload.chatId), String(payload.messageId), slot)
    this.tagPayloads.set(lookup, { ...payload, slot })
    const fingerprint = widgetKeyHash(String(payload.fullMatch || payload.content || ""))
    // The interceptor sees the same tag while the assistant is streaming and
    // again after Lumiverse commits the finished message. Generation may beat
    // that commit, so treat the non-streaming pass as the attachment boundary.
    if (payload.isStreaming !== true) {
      this.settledTagLookups.add(lookup)
      const content = String(payload.content || "").trim()
      const existing = [...this.jobs.values()].find((job) =>
        this.lookupKey(job.chatId, job.messageId, job.slot) === lookup,
      ) || [...this.jobs.values()].find((job) =>
        job.chatId === String(payload.chatId)
        && job.slot === slot
        && (job.tagFingerprint === fingerprint || job.prompt === content)
        && !job.inserted,
      )
      if (existing) {
        this.settledMessageTargets.set(existing.id, String(payload.messageId))
        this.retrySettledAttachment(existing)
      }
    }
    if (this.tagFingerprints.get(lookup) === fingerprint) return
    this.tagFingerprints.set(lookup, fingerprint)
    for (const [id, existing] of this.jobs) {
      if (this.lookupKey(existing.chatId, existing.messageId, existing.slot) !== lookup) continue
      this.remove(existing)
      this.jobs.delete(id)
    }
    const optimistic: TaggedImageJobView = {
      id: `pending-${widgetKeyHash(`${lookup}:${fingerprint}`)}`,
      key: lookup,
      chatId: String(payload.chatId),
      messageId: String(payload.messageId),
      slot,
      prompt: String(payload.content || "").trim(),
      negativePrompt: "",
      aspect: String(payload?.attrs?.aspect || ""),
      alt: String(payload?.attrs?.alt || ""),
      status: this.behavior.tagAutoGenerate ? "queued" : "requested",
      clientJobId: "",
      imageId: "",
      imageUrl: "",
      inserted: false,
      error: "",
    }
    this.jobs.set(optimistic.id, optimistic)
    if (this.shouldRenderPlaceholder(optimistic)) this.render(optimistic)
    this.ctx.sendToBackend({
      type: "tag_generate",
      requestId: createRequestId(),
      chatId: payload.chatId,
      messageId: payload.messageId,
      fullMatch: payload.fullMatch,
      attrs: payload.attrs,
      content: payload.content,
      isStreaming: payload.isStreaming === true,
    })
  }

  onMessage(payload: any): void {
    if (payload?.type === "tagged_image_removed") {
      this.reconcileMessage({ ...payload.data, removed: true })
      return
    }
    if (payload?.type === "tagged_message_reconciled") {
      this.reconcileMessage(payload.data)
      return
    }
    if (payload?.type === "tagged_image_jobs_result") {
      const jobs = Array.isArray(payload.data) ? payload.data as TaggedImageJobView[] : []
      for (const job of jobs) {
        if (!job?.id || !job?.messageId) continue
        this.jobs.set(job.id, job)
        this.retrySettledAttachment(job)
        if (!job.inserted && !this.inlineFigureForJob(job.id) && this.shouldRenderPlaceholder(job)) {
          this.render(job)
        } else {
          this.remove(job)
        }
      }
      return
    }
    if (payload?.type === "tagged_image_job") {
      const job = payload.data as TaggedImageJobView
      if (!job?.id || !job?.messageId) return
      for (const [id, candidate] of this.jobs) {
        if (id.startsWith("pending-") && this.lookupKey(candidate.chatId, candidate.messageId, candidate.slot) === this.lookupKey(job.chatId, job.messageId, job.slot)) {
          this.remove(candidate)
          this.jobs.delete(id)
        }
      }
      const previous = this.jobs.get(job.id)
      const next = { ...previous, ...job }
      this.jobs.set(job.id, next)
      if (next.inserted) {
        this.settledAttachmentRequests.delete(next.id)
        this.settledMessageTargets.delete(next.id)
      } else {
        this.retrySettledAttachment(next)
      }
      const inlineFigure = this.inlineFigureForJob(next.id)
      if (inlineFigure) {
        inlineFigure.dataset.state = next.inserted ? "ready" : next.status
        this.remove(next)
      } else if (this.shouldRenderPlaceholder(next)) {
        this.render(next)
      } else {
        this.remove(next)
      }
      return
    }
  }

  destroy(): void {
    this.destroyed = true
    window.removeEventListener("click", this.handleInlineClick, true)
    window.removeEventListener("contextmenu", this.handleInlineContextMenu, true)
    window.removeEventListener("keydown", this.handleInlineKeyDown, true)
    for (const cleanup of this.cleanups.values()) cleanup()
    this.cleanups.clear()
    this.jobs.clear()
    this.tagPayloads.clear()
    this.tagFingerprints.clear()
    this.settledTagLookups.clear()
    this.settledAttachmentRequests.clear()
    this.settledMessageTargets.clear()
    this.reconciliationQueues.clear()
  }

  private retrySettledAttachment(job: TaggedImageJobView): void {
    if (job.status !== "ready" || job.inserted || !job.id) return
    const messageId = this.settledMessageTargets.get(job.id) || job.messageId
    const lookup = this.lookupKey(job.chatId, messageId, job.slot)
    if (!this.settledTagLookups.has(lookup) || this.settledAttachmentRequests.has(job.id)) return
    this.settledAttachmentRequests.add(job.id)
    this.ctx.sendToBackend({
      type: "retry_tagged_attachment",
      requestId: createRequestId(),
      jobId: job.id,
      messageId,
    })
  }

  private lookupKey(chatId: string, messageId: string, slot: string): string {
    return `${chatId}:${messageId}:${slot}`
  }

  private widgetId(job: TaggedImageJobView): string {
    return `swarm-studio-image-${widgetKeyHash(this.lookupKey(job.chatId, job.messageId, job.slot))}`
  }

  private inlineFigureForJob(jobId: string): HTMLElement | null {
    for (const figure of document.querySelectorAll<HTMLElement>('figure[data-swarm-studio-image="true"]')) {
      if (figure.dataset.swarmStudioJobId === jobId) return figure
    }
    return null
  }

  private inlineJobFromTarget(target: HTMLElement | null): { figure: HTMLElement; job: TaggedImageJobView } | null {
    const figure = target?.closest<HTMLElement>('figure[data-swarm-studio-image="true"][data-swarm-studio-job-id]')
    const jobId = figure?.dataset.swarmStudioJobId || ""
    if (!figure || !jobId) return null
    const known = this.jobs.get(jobId)
    if (known) return { figure, job: known }
    return {
      figure,
      job: {
        id: jobId,
        key: "",
        chatId: "",
        messageId: "",
        slot: figure.dataset.swarmStudioSlot || "image",
        prompt: "",
        negativePrompt: "",
        aspect: "",
        alt: figure.querySelector<HTMLImageElement>("img")?.alt || "Generated illustration",
        status: "ready",
        clientJobId: "",
        imageId: "",
        imageUrl: figure.querySelector<HTMLImageElement>("img")?.src || "",
        inserted: true,
        error: "",
      },
    }
  }

  private remove(job: TaggedImageJobView): void {
    const id = this.widgetId(job)
    this.cleanups.get(id)?.()
    this.cleanups.delete(id)
  }

  private shouldRenderPlaceholder(job: TaggedImageJobView): boolean {
    return job.status === "requested"
      || job.status === "failed"
      || job.status === "cancelled"
      || (job.status === "ready" && !job.inserted)
  }

  private reconcileMessage(value: any): void {
    const jobId = String(value?.jobId || "")
    const chatId = String(value?.chatId || "")
    const messageId = String(value?.messageId || "")
    const hasContent = typeof value?.content === "string"
    const content = hasContent ? value.content : ""
    const removed = value?.removed === true
    if (!jobId || !chatId || !messageId || !hasContent) return

    const key = `${chatId}:${messageId}`
    const previous = this.reconciliationQueues.get(key) || Promise.resolve()
    const task = previous.catch(() => {}).then(async () => {
      if (this.destroyed) return
      const job = this.jobs.get(jobId)
      try {
        if (typeof this.ctx.chats?.updateMessage !== "function") {
          throw new Error("This Lumiverse build does not expose live message refresh.")
        }
        await this.ctx.chats.updateMessage(chatId, messageId, { content })
        if (this.destroyed) return
        if (removed) {
          if (job) this.remove(job)
          this.jobs.delete(jobId)
          this.settledAttachmentRequests.delete(jobId)
          this.settledMessageTargets.delete(jobId)
          return
        }
        if (job) {
          job.inserted = true
          job.error = ""
          this.remove(job)
        }
      } catch (error) {
        if (this.destroyed || !job) return
        if (removed) return
        job.inserted = false
        job.error = error instanceof Error
          ? `The image is saved, but this chat view could not refresh: ${error.message}`
          : "The image is saved, but this chat view could not refresh."
        this.render(job)
      }
    })
    this.reconciliationQueues.set(key, task)
    void task.finally(() => {
      if (this.reconciliationQueues.get(key) === task) this.reconciliationQueues.delete(key)
    }).catch(() => {})
  }

  private requestedAspect(job: TaggedImageJobView): string {
    const aspect = String(job.aspect || "").trim()
    return /^(?:1:1|2:3|3:2|3:4|4:3|4:5|5:4|9:16|16:9)$/.test(aspect)
      ? aspect.replace(":", " / ")
      : "4 / 3"
  }

  private render(job: TaggedImageJobView): void {
    if (!this.shouldRenderPlaceholder(job)) {
      this.remove(job)
      return
    }
    const widgetId = this.widgetId(job)
    this.cleanups.get(widgetId)?.()
    const labels: Record<TaggedImageJobView["status"], string> = {
      requested: "Illustration requested",
      queued: "Queued for SwarmUI",
      generating: "Rendering in SwarmUI",
      ready: "Illustration ready",
      failed: "Illustration unavailable",
      cancelled: "Illustration stopped",
    }
    const action = job.status === "requested"
      ? `<button data-action="generate">Generate image</button>`
      : job.status === "ready" && !job.inserted
        ? `<button data-action="attach">Attach image</button>`
      : job.status === "failed" || job.status === "cancelled"
        ? `<button data-action="retry">Retry</button>`
        : ""
    const error = job.error ? `<p class="error">${widgetEscape(job.error)}</p>` : ""
    const html = `
      <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; color: var(--lumiverse-text, #f5f5f7); background: transparent; }
        .card { position: relative; display: grid; place-items: center; width: 100%; min-height: 150px; aspect-ratio: ${this.requestedAspect(job)}; max-height: min(70vh, 680px); padding: 22px; border: 1px dashed color-mix(in srgb, var(--lumiverse-accent, #b994ff) 34%, var(--lumiverse-border, #35313f)); border-radius: var(--lumiverse-radius, 12px); background: color-mix(in srgb, var(--lumiverse-accent, #b994ff) 5%, var(--lumiverse-fill, #111116)); overflow: hidden; }
        .center { display: grid; justify-items: center; gap: 10px; max-width: 430px; text-align: center; }
        .emblem { display: grid; place-items: center; width: 48px; height: 48px; color: var(--lumiverse-accent, #b994ff); border: 1px solid var(--lumiverse-border, #35313f); border-radius: calc(var(--lumiverse-radius, 12px) * .72); background: var(--lumiverse-fill-subtle, #191820); }
        .emblem svg { width: 25px; height: 25px; fill: currentColor; }
        strong { display: block; font: 600 14px/1.2 Georgia, ui-serif, serif; letter-spacing: .01em; }
        p { margin: 0; color: var(--lumiverse-text-muted, #aaa6b1); font-size: 11px; line-height: 1.45; }
        .error { color: #ff9caa; }
        .actions { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px; }
        button { min-height: 30px; padding: 0 10px; border: 1px solid var(--lumiverse-border, #35313f); border-radius: calc(var(--lumiverse-radius, 12px) * .65); background: var(--lumiverse-fill-subtle, #191820); color: var(--lumiverse-text, #f5f5f7); font: 600 10px/1 system-ui, sans-serif; cursor: pointer; }
        button:hover { border-color: var(--lumiverse-accent, #b994ff); }
        .menu { width: 30px; padding: 0; font-size: 16px; }
        @media (max-width: 480px) { .card { min-height: 132px; padding: 15px; } .center { gap: 8px; } .emblem { width: 42px; height: 42px; } }
      </style>
      <div class="card" id="card">
        <div class="center">
          <div class="emblem">${FRAME_WALL_ICON}</div>
          <div><strong>${widgetEscape(labels[job.status])}</strong><p>${widgetEscape(job.alt || job.prompt || job.slot)}</p>${error}</div>
          <div class="actions">${action}<button class="menu" data-action="menu" aria-label="Illustration actions">⋯</button></div>
        </div>
      </div>
      <script>
        const send = (type) => window.spindleSandbox.postMessage({ type })
        document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => send(button.dataset.action)))
        const card = document.getElementById('card')
        card.addEventListener('contextmenu', (event) => { event.preventDefault(); send('menu') })
        let timer = null
        card.addEventListener('touchstart', () => { timer = setTimeout(() => send('menu'), 520) }, { passive: true })
        card.addEventListener('touchmove', () => { clearTimeout(timer); timer = null }, { passive: true })
        card.addEventListener('touchend', () => { clearTimeout(timer); timer = null })
      </script>`
    const cleanup = this.ctx.messages.renderWidget({ messageId: job.messageId, widgetId, html }, (message: any) => {
      void this.handleWidgetAction(job, String(message?.type || ""))
    })
    this.cleanups.set(widgetId, cleanup)
  }

  private async handleWidgetAction(job: TaggedImageJobView, action: string): Promise<void> {
    if (action === "generate" || action === "retry") {
      this.retry(job, "current")
      return
    }
    if (action === "attach") {
      job.error = ""
      this.render(job)
      this.ctx.sendToBackend({
        type: "retry_tagged_attachment",
        requestId: createRequestId(),
        jobId: job.id,
      })
      return
    }
    if (action !== "menu") return
    await this.showJobMenu(job, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2))
  }

  private async showJobMenu(job: TaggedImageJobView, x: number, y: number): Promise<void> {
    const result = await this.ctx.ui.showContextMenu({
      position: { x: Math.max(8, Math.round(x)), y: Math.max(8, Math.round(y)) },
      items: [
        { key: "retry-current", label: job.inserted ? "Regenerate with current Studio settings" : job.status === "requested" ? "Generate with current Studio settings" : "Retry with current Studio settings" },
        { key: "retry-original", label: "Retry with original settings", disabled: !job.clientJobId },
        { key: "edit", label: "Edit prompt in Quick Create", disabled: !job.prompt && !this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot)) },
        { key: "divider", label: "", type: "divider" },
        { key: "studio", label: "Open Swarm Studio" },
        { key: "library", label: "Open output library" },
        { key: "remove-divider", label: "", type: "divider" },
        { key: "remove-chat", label: "Remove from chat (keeps Library copy)", disabled: !job.inserted },
      ],
    })
    if (result.selectedKey === "retry-current") this.retry(job, "current")
    if (result.selectedKey === "retry-original") this.retry(job, "original")
    if (result.selectedKey === "edit") {
      const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot))
      const prompt = String(tag?.content || job.prompt)
      const opened = this.openQuickCreateWithPrompt(prompt, job.negativePrompt, (editedPrompt, editedNegative) => {
        this.retry(job, "current", {
          prompt: editedPrompt,
          negativePrompt: editedNegative,
        })
      })
      if (!opened) this.openStudioWithPrompt(prompt, job.negativePrompt)
    }
    if (result.selectedKey === "studio") this.openStudioWithPrompt("", "")
    if (result.selectedKey === "library") this.openLibrary()
    if (result.selectedKey === "remove-chat") {
      this.ctx.sendToBackend({
        type: "remove_tagged_image_from_chat",
        requestId: createRequestId(),
        jobId: job.id,
      })
    }
  }

  private retry(
    job: TaggedImageJobView,
    retryMode: "current" | "original",
    overrides?: { prompt: string; negativePrompt: string },
  ): void {
    const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot))
    job.status = "queued"
    job.error = ""
    const inlineFigure = this.inlineFigureForJob(job.id)
    if (inlineFigure) inlineFigure.dataset.state = "queued"
    this.remove(job)
    if (overrides) {
      this.ctx.sendToBackend({
        type: "retry_tagged_job",
        requestId: createRequestId(),
        jobId: job.id,
        retryMode,
        promptOverride: overrides.prompt,
        negativePromptOverride: overrides.negativePrompt,
      })
      return
    }
    if (tag) {
      this.ctx.sendToBackend({
        type: "tag_generate",
        requestId: createRequestId(),
        chatId: tag.chatId,
        messageId: tag.messageId,
        fullMatch: tag.fullMatch,
        attrs: tag.attrs,
        content: tag.content,
        force: true,
        retryMode,
      })
      return
    }
    this.ctx.sendToBackend({
      type: "retry_tagged_job",
      requestId: createRequestId(),
      jobId: job.id,
      retryMode,
    })
  }
}
