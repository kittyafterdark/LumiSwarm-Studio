interface StudioActivitySnapshot {
  active: boolean
  jobId: string
  connectionId: string
  preview: string
  latestImage: CurrentImage | null
  draft: StudioDraft | null
  step: number
  totalSteps: number
  status: string
}

class MiniPlayerController {
  private readonly ctx: FrontendContext
  private readonly widget: any
  private readonly root: HTMLElement
  private readonly openStudio: () => void
  private readonly openLibrary: () => void
  private readonly getStudioDraft: () => StudioDraft | null
  private readonly onBehaviorChange: (behavior: StudioBehavior) => void
  private behavior: StudioBehavior
  private studioOpen = false
  private collapsed = false
  private expanded = true
  private expectedWidth = 318
  private expectedHeight = 94
  private sizeObserver: ResizeObserver | null = null
  private observedSizeTarget: HTMLElement | null = null
  private contextMenu: HTMLElement | null = null
  private longPressTimer: number | null = null
  private suppressNextClick = false
  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    const menu = this.contextMenu
    if (menu && !menu.hidden && !menu.contains(event.target as Node)) this.closeContextMenu()
  }
  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") this.closeContextMenu()
  }
  private readonly onWindowResize = () => {
    // Responsive transitions can cross the mobile breakpoint after startup
    // (rotation, split-screen, browser chrome, desktop emulation). Keep the
    // controller state and its host box in lockstep with the visual orb.
    if (this.isMobileViewport() && !this.behavior.mobileQuickCreate && !this.collapsed) {
      this.setCollapsed(true)
      return
    }
    this.resizeWidget()
    this.render()
  }
  private quickConnection: any | null = null
  private quickConnections: any[] = []
  private quickCanAppend = false
  private quickPending: GenerationDetails | null = null
  private quickConfirm: ((prompt: string, negativePrompt: string) => void) | null = null
  private readonly bootstrapRequestId = createRequestId()
  private readonly settledGenerationJobIds = new Set<string>()
  private readonly settledTaggedJobIds = new Set<string>()
  private readonly activeTaggedAttempts = new Map<string, string>()
  private currentActivitySource: "manual" | "tagged" | "" = ""
  private state: "idle" | "running" | "done" | "error" = "idle"
  private snapshotValue: StudioActivitySnapshot = {
    active: false,
    jobId: "",
    connectionId: "",
    preview: "",
    latestImage: null,
    draft: null,
    step: 0,
    totalSteps: 0,
    status: "Ready when inspiration hits.",
  }

  constructor(
    ctx: FrontendContext,
    widget: any,
    openStudio: () => void,
    openLibrary: () => void,
    getStudioDraft: () => StudioDraft | null,
    behavior: StudioBehavior,
    onBehaviorChange: (behavior: StudioBehavior) => void,
  ) {
    this.ctx = ctx
    this.widget = widget
    this.root = widget.root
    this.root.style.width = "100%"
    this.root.style.height = "100%"
    this.openStudio = openStudio
    this.openLibrary = openLibrary
    this.getStudioDraft = getStudioDraft
    this.onBehaviorChange = onBehaviorChange
    this.behavior = { ...behavior }
    try {
      const stored = JSON.parse(window.localStorage.getItem(MINIPLAYER_STORAGE_KEY) || "{}")
      this.collapsed = this.isMobileViewport()
        ? true
        : stored.collapsed === true
      this.expanded = !this.collapsed
    } catch {
      this.collapsed = this.isMobileViewport()
      this.expanded = !this.collapsed
    }
    this.root.innerHTML = `
      <div class="ss-miniplayer" data-role="miniplayer" data-state="idle" data-collapsed="false" data-expanded="true" data-indeterminate="false">
        <div class="ss-mini-preview" data-action="mini-open" role="button" tabindex="0" title="Open Swarm Studio" aria-label="Open Swarm Studio">
          <span data-role="mini-placeholder">${FRAME_WALL_ICON}</span>
          <img data-role="mini-image" alt="Latest Swarm Studio preview" hidden />
          <span class="ss-mini-live-dot" aria-hidden="true"></span>
        </div>
        <div class="ss-mini-copy">
          <div class="ss-mini-title"><span>Swarm Studio</span><span class="ss-mini-state" data-role="mini-state">Ready</span></div>
          <div class="ss-mini-status" data-role="mini-status">Ready when inspiration hits.</div>
          <div class="ss-mini-track"><span class="ss-mini-fill"></span></div>
        </div>
        <div class="ss-mini-actions">
          <button class="ss-mini-button" data-action="mini-append" title="Append latest output to chat" aria-label="Append latest output to chat" disabled>${APPEND_CHAT_ICON}</button>
          <button class="ss-mini-button" data-action="mini-open" title="Open Swarm Studio" aria-label="Open Swarm Studio">↗</button>
          <button class="ss-mini-button" data-action="mini-library" title="Open output library" aria-label="Open output library">${LIBRARY_ICON}</button>
          <button class="ss-mini-button" data-action="mini-collapse" title="Minimize to image" aria-label="Minimize to image">−</button>
        </div>
        <div class="ss-mini-quick" data-role="mini-quick">
          <div class="ss-mini-quick-head">
            <strong>Quick create</strong>
            <div class="ss-mini-editor-actions" aria-label="Expanded prompt editors">
              <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="positive" title="Open positive prompt in Lumiverse editor" aria-label="Expand positive prompt"><span class="ss-mini-editor-key">P</span>${EXPAND_ICON}</button>
              <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="negative" title="Open negative prompt in Lumiverse editor" aria-label="Expand negative prompt"><span class="ss-mini-editor-key">N</span>${EXPAND_ICON}</button>
            </div>
          </div>
          <textarea class="ss-mini-prompt" data-role="mini-prompt" placeholder="Describe a quick image…" aria-label="Quick image prompt"></textarea>
          <input class="ss-mini-negative" data-role="mini-negative" placeholder="Negative prompt (optional)" aria-label="Quick negative prompt" />
          <div class="ss-mini-quick-actions">
            <span class="ss-mini-connection" data-role="mini-connection">Finding Lumiverse’s SwarmUI connection…</span>
            <button class="ss-mini-generate" data-action="mini-generate" disabled>Generate quick image</button>
          </div>
        </div>
      </div>
      <div class="ss-mini-context-menu" data-role="mini-context-menu" role="menu" hidden>
        <button class="ss-mini-context-action" data-action="mini-menu-toggle" role="menuitem"><span data-role="mini-menu-size-icon">${EXPAND_ICON}</span><span data-role="mini-menu-size-label">Expand Quick Create</span></button>
        <button class="ss-mini-context-action" data-action="mini-menu-studio" role="menuitem">${FRAME_WALL_ICON}<span>Open Swarm Studio</span></button>
        <button class="ss-mini-context-action" data-action="mini-menu-library" role="menuitem">${LIBRARY_ICON}<span>Open Library</span></button>
        <span class="ss-mini-context-separator" aria-hidden="true"></span>
        <button class="ss-mini-context-action" data-action="mini-menu-hide" role="menuitem"><span aria-hidden="true">×</span><span>Hide widget</span></button>
      </div>
    `
    this.contextMenu = this.root.querySelector<HTMLElement>('[data-role="mini-context-menu"]')
    if (this.contextMenu) {
      // Lumi's native float wrapper is intentionally only as large as the
      // widget chrome. Portal the menu so a minimized 1:1 host cannot clip or
      // swallow its actions.
      this.contextMenu.remove()
      this.root.ownerDocument.documentElement.appendChild(this.contextMenu)
    }
    const handleAction = (event: Event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (this.suppressNextClick && action === "mini-open") {
        this.suppressNextClick = false
        event.preventDefault()
        event.stopPropagation()
        return
      }
      this.suppressNextClick = false
      if (action === "mini-open") this.activateWidget()
      if (action === "mini-append") this.appendLatestToChat()
      if (action === "mini-library" || action === "mini-menu-library") this.openLibrary()
      if (action === "mini-collapse") this.setCollapsed(true)
      if (action === "mini-menu-toggle") this.setCollapsed(!this.collapsed)
      if (action === "mini-menu-studio") this.openStudio()
      if (action === "mini-menu-hide") this.onBehaviorChange({ ...this.behavior, widgetEnabled: false })
      if (action === "mini-generate") {
        if (this.snapshotValue.active) this.interrupt()
        else if (this.quickConfirm) this.confirmTaggedPromptEdit()
        else this.quickGenerate()
      }
      if (action === "mini-edit-prompt") this.openPromptEditor(button.dataset.promptRole || "")
      if (action?.startsWith("mini-menu-")) this.closeContextMenu()
    }
    this.root.addEventListener("click", handleAction)
    this.contextMenu?.addEventListener("click", handleAction)
    this.root.addEventListener("keydown", (event) => {
      if (!this.collapsed || (event.key !== "Enter" && event.key !== " ")) return
      if (!(event.target as HTMLElement).closest('[data-action="mini-open"]')) return
      event.preventDefault()
      this.activateWidget()
    })
    this.root.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement
      if (!this.collapsed && target.closest("button, input, textarea, select, a, [data-action]")) {
        // Lumi's float widget makes its entire chrome draggable. Stop the
        // bubbled pointerdown for expanded controls. The collapsed preview is
        // deliberately allowed through so the only visible surface can drag.
        event.stopPropagation()
      }
      if (event.button === 0 && target.closest('[data-action="mini-open"]')) {
        this.scheduleLongPress(event)
      }
    })
    this.root.addEventListener("contextmenu", (event) => {
      if ((event.target as HTMLElement).closest("input, textarea, select")) return
      event.preventDefault()
      event.stopPropagation()
      this.showContextMenu(event.clientX, event.clientY)
    })
    document.addEventListener("pointerdown", this.onDocumentPointerDown)
    document.addEventListener("keydown", this.onDocumentKeyDown)
    window.addEventListener("resize", this.onWindowResize)
    if (typeof ResizeObserver === "function") {
      this.sizeObserver = new ResizeObserver(() => {
        if (this.studioOpen || !this.behavior.widgetEnabled) return
        const targets = this.widgetSizeTargets()
        this.observeSizeTarget(targets[targets.length - 1] || this.root)
        const mismatched = targets.some((target) => {
          const { width, height } = target.getBoundingClientRect()
          return width > 0 && height > 0
            && (Math.abs(width - this.expectedWidth) > 2 || Math.abs(height - this.expectedHeight) > 2)
        })
        if (mismatched) {
          this.applyWidgetSize(this.expectedWidth, this.expectedHeight)
        }
      })
      this.observeSizeTarget(this.root)
    }
    this.setCollapsed(this.collapsed)
    this.setBehavior(this.behavior)
    this.render()
  }

  setAppearance(appearance: StudioAppearance): void {
    applyAppearanceVariables(this.root, appearance)
    if (this.contextMenu) applyAppearanceVariables(this.contextMenu, appearance)
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
    if (this.isMobileViewport()) {
      if (!this.behavior.mobileQuickCreate && !this.collapsed) this.setCollapsed(true)
    }
    this.syncVisibility()
    this.render()
  }

  setStudioOpen(open: boolean): void {
    this.studioOpen = open
    if (open) this.closeContextMenu()
    this.syncVisibility()
  }

  snapshot(): StudioActivitySnapshot {
    return { ...this.snapshotValue }
  }

  captureDraft(draft: StudioDraft | null, syncPrompts = true): void {
    if (!draft) return
    this.snapshotValue.draft = draft
    if (syncPrompts) {
      const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
      if (prompt) prompt.value = draft.details.prompt || ""
      if (negative) negative.value = draft.details.negativePrompt || ""
    }
    this.render()
  }

  openTaggedPromptEditor(
    promptValue: string,
    negativePromptValue: string,
    onConfirm: (prompt: string, negativePrompt: string) => void,
  ): boolean {
    if (!this.behavior.widgetEnabled) return false
    if (this.isMobileViewport() && !this.behavior.mobileQuickCreate) return false
    this.setCollapsed(false)
    if (this.collapsed) return false
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
    if (!prompt || !negative) return false
    prompt.value = promptValue
    negative.value = negativePromptValue
    this.quickConfirm = onConfirm
    if (!this.snapshotValue.active) this.state = "idle"
    this.snapshotValue.status = "Review the inline prompt, then Confirm to regenerate."
    this.syncVisibility()
    this.render()
    window.requestAnimationFrame(() => {
      prompt.focus()
      prompt.setSelectionRange(prompt.value.length, prompt.value.length)
    })
    return true
  }

  bootstrap(): void {
    this.ctx.sendToBackend({ type: "bootstrap", requestId: this.bootstrapRequestId })
  }

  begin(
    jobId: string,
    connectionId: string,
    label = "Preparing SwarmUI generation…",
    source: "manual" | "tagged" = "manual",
  ): void {
    this.state = "running"
    this.currentActivitySource = source
    this.snapshotValue = {
      ...this.snapshotValue,
      active: true,
      jobId,
      connectionId,
      step: 0,
      totalSteps: 0,
      status: label,
    }
    this.render()
  }

  progress(jobId: string, preview: string, step: number, totalSteps: number): void {
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    this.state = "running"
    const requestedSteps = Number(this.quickPending?.parameters?.steps || this.snapshotValue.draft?.details.parameters?.steps)
    const resolvedTotal = Number.isFinite(totalSteps) && totalSteps > 0
      ? totalSteps
      : Number.isFinite(requestedSteps) && requestedSteps > 0 ? requestedSteps : 0
    const hasTotal = resolvedTotal > 0
    const nextStep = Number.isFinite(step) ? Math.max(0, step) : 0
    const safeStep = jobId && jobId === this.snapshotValue.jobId
      ? Math.max(this.snapshotValue.step, nextStep)
      : nextStep
    this.snapshotValue = {
      ...this.snapshotValue,
      active: true,
      jobId: jobId || this.snapshotValue.jobId,
      preview: preview || this.snapshotValue.preview,
      step: hasTotal ? Math.min(safeStep, resolvedTotal) : safeStep,
      totalSteps: resolvedTotal,
      status: hasTotal
        ? `Rendering · ${Math.round(Math.min(safeStep, resolvedTotal))} / ${Math.round(resolvedTotal)}`
        : "Preparing workflow…",
    }
    this.render()
  }

  complete(jobId: string, data: any): void {
    this.rememberSettledGenerationJob(jobId)
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    const imageSrc = String(data?.result?.imageDataUrl || data?.result?.imageUrl || "")
    const details = (data?.record || this.quickPending || null) as GenerationDetails | null
    const latestImage: CurrentImage | null = imageSrc ? {
      id: String(data?.result?.imageId || data?.record?.imageId || "") || undefined,
      src: imageSrc,
      url: String(data?.result?.imageUrl || imageSrc),
      label: `${String(data?.result?.model || details?.model || "SwarmUI")} · just generated`,
      details,
    } : this.snapshotValue.latestImage
    this.state = "done"
    this.currentActivitySource = ""
    this.snapshotValue = {
      ...this.snapshotValue,
      active: false,
      jobId: "",
      connectionId: "",
      preview: imageSrc || this.snapshotValue.preview,
      latestImage,
      step: 1,
      totalSteps: 1,
      status: "Generation complete · saved by Lumiverse",
    }
    if (latestImage?.details && this.snapshotValue.draft) {
      this.snapshotValue.draft = {
        ...this.snapshotValue.draft,
        details: latestImage.details,
      }
    }
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
    if (prompt && !prompt.value.trim() && details?.prompt) prompt.value = details.prompt
    if (negative && !negative.value.trim() && details?.negativePrompt) negative.value = details.negativePrompt
    this.quickPending = null
    this.render()
  }

  private syncTaggedOutput(data: any): void {
    const imageSrc = String(data?.result?.imageDataUrl || data?.result?.imageUrl || "")
    if (!imageSrc) return
    const details = (data?.record || null) as GenerationDetails | null
    const latestImage: CurrentImage = {
      id: String(data?.result?.imageId || data?.record?.imageId || "") || undefined,
      src: imageSrc,
      url: String(data?.result?.imageUrl || imageSrc),
      label: `${String(data?.result?.model || details?.model || "SwarmUI")} · message illustration`,
      details,
    }
    this.snapshotValue = {
      ...this.snapshotValue,
      preview: imageSrc,
      latestImage,
      status: this.snapshotValue.active
        ? this.snapshotValue.status
        : "Message illustration complete · synced to Studio",
    }
    if (!this.snapshotValue.active) this.state = "done"
    this.render()
  }

  fail(jobId: string, message: string): void {
    this.rememberSettledGenerationJob(jobId)
    if (this.snapshotValue.jobId && jobId && this.snapshotValue.jobId !== jobId) return
    reportStudioError("Quick Create generation", message || "Generation stopped.")
    this.state = "error"
    this.currentActivitySource = ""
    this.snapshotValue = {
      ...this.snapshotValue,
      active: false,
      jobId: "",
      connectionId: "",
      step: 0,
      totalSteps: 0,
      status: message || "Generation stopped.",
    }
    this.quickPending = null
    this.render()
  }

  private rememberSettledGenerationJob(jobId: string): void {
    if (!jobId) return
    this.settledGenerationJobIds.add(jobId)
    if (this.settledGenerationJobIds.size > 64) {
      const oldest = this.settledGenerationJobIds.values().next().value
      if (oldest) this.settledGenerationJobIds.delete(oldest)
    }
  }

  private settleTaggedJob(jobId: string, taggedJobId = ""): void {
    const mappedJobId = taggedJobId ? String(this.activeTaggedAttempts.get(taggedJobId) || "") : ""
    const terminalJobId = jobId || mappedJobId
    if (terminalJobId) {
      this.rememberSettledGenerationJob(terminalJobId)
      this.settledTaggedJobIds.add(terminalJobId)
    }
    if (mappedJobId && mappedJobId !== terminalJobId) {
      this.rememberSettledGenerationJob(mappedJobId)
      this.settledTaggedJobIds.add(mappedJobId)
    }
    if (this.settledTaggedJobIds.size > 64) {
      const oldest = this.settledTaggedJobIds.values().next().value
      if (oldest) this.settledTaggedJobIds.delete(oldest)
    }
    if (taggedJobId) this.activeTaggedAttempts.delete(taggedJobId)

    const activeAttemptIds = new Set(this.activeTaggedAttempts.values())
    const currentJobId = this.snapshotValue.jobId
    const terminalMatchesCurrent = Boolean(
      currentJobId
      && (currentJobId === terminalJobId || currentJobId === mappedJobId),
    )
    const currentTaggedAttemptIsStale = this.currentActivitySource === "tagged"
      && Boolean(currentJobId)
      && !activeAttemptIds.has(currentJobId)
    if (!terminalMatchesCurrent && !currentTaggedAttemptIsStale) return

    const nextJobId = this.activeTaggedAttempts.values().next().value
    if (nextJobId) {
      this.begin(nextJobId, "", "Rendering another message illustration in SwarmUI…", "tagged")
      return
    }

    this.currentActivitySource = ""
    this.snapshotValue.active = false
    this.snapshotValue.jobId = ""
    this.snapshotValue.connectionId = ""
    this.snapshotValue.status = "Finalizing message illustration…"
    this.state = "done"
    this.render()
  }

  onMessage(payload: any): void {
    const data = payload?.data || {}
    if (payload?.type === "bootstrap_result") {
      const connections = Array.isArray(data.connections) ? data.connections : []
      const swarmConnections = connections.filter((connection: any) => String(connection?.provider || "").toLowerCase() === "swarmui")
      this.quickConnections = swarmConnections
      this.quickConnection = swarmConnections.find((connection: any) => connection?.is_default) || swarmConnections[0] || null
      this.quickCanAppend = Boolean(data.activeChat?.id && data.permissions?.chatMutation)
      this.render()
      return
    }
    if (payload?.type === "generation_started") {
      const jobId = String(payload.clientJobId || "")
      if (jobId && this.settledGenerationJobIds.has(jobId)) return
      const source = (
        this.currentActivitySource === "tagged"
        || [...this.activeTaggedAttempts.values()].includes(jobId)
      ) ? "tagged" : "manual"
      this.begin(
        jobId,
        String(data.connectionId || ""),
        `Preparing ${String(data.model || "SwarmUI")}…`,
        source,
      )
      return
    }
    if (payload?.type === "tagged_image_jobs_result") {
      this.activeTaggedAttempts.clear()
      const jobs = Array.isArray(data) ? data : []
      for (const job of jobs) {
        const taggedJobId = String(job?.id || "")
        const jobId = String(job?.clientJobId || "")
        if (
          taggedJobId
          && jobId
          && (job?.status === "queued" || job?.status === "generating")
          && !this.settledGenerationJobIds.has(jobId)
          && !this.settledTaggedJobIds.has(jobId)
        ) {
          this.activeTaggedAttempts.set(taggedJobId, jobId)
        }
      }
      const active = jobs.find((job: any) =>
        (job?.status === "queued" || job?.status === "generating")
        && String(job?.clientJobId || "")
        && !this.settledGenerationJobIds.has(String(job.clientJobId))
        && !this.settledTaggedJobIds.has(String(job.clientJobId)),
      )
      if (active && (!this.snapshotValue.active || this.snapshotValue.jobId === String(active.clientJobId))) {
        this.begin(
          String(active.clientJobId),
          "",
          `Rendering message illustration · ${String(active.alt || active.slot || "SwarmUI")}`,
          "tagged",
        )
      }
      return
    }
    if (payload?.type === "tagged_image_job") {
      const job = data || {}
      const jobId = String(job.clientJobId || "")
      const taggedJobId = String(job.id || "")
      if ((job.status === "queued" || job.status === "generating") && jobId) {
        if (this.settledGenerationJobIds.has(jobId)) return
        if (this.settledTaggedJobIds.has(jobId)) return
        if (taggedJobId) this.activeTaggedAttempts.set(taggedJobId, jobId)
        if (!this.snapshotValue.active || this.snapshotValue.jobId === jobId) {
          this.begin(
            jobId,
            "",
            `Rendering message illustration · ${String(job.alt || job.slot || "SwarmUI")}`,
            "tagged",
          )
        }
      } else if (job.status === "ready") {
        this.settleTaggedJob(jobId, taggedJobId)
      } else if (job.status === "failed" || job.status === "cancelled") {
        this.settleTaggedJob(jobId, taggedJobId)
        if (jobId === this.snapshotValue.jobId || !this.snapshotValue.active) {
          this.fail(jobId, String(job.error || (job.status === "cancelled" ? "Message illustration stopped." : "Message illustration failed.")))
        }
      }
      return
    }
    if (payload?.type === "generation_progress") {
      const jobId = String(payload.clientJobId || "")
      if (jobId && this.settledGenerationJobIds.has(jobId)) return
      if (!this.snapshotValue.active || !this.snapshotValue.jobId || jobId !== this.snapshotValue.jobId) return
      this.progress(
        jobId,
        typeof data.preview === "string" ? data.preview : "",
        Number(data.step) || 0,
        Number(data.totalSteps) || 0,
      )
      return
    }
    if (payload?.type === "generation_result") {
      this.complete(String(payload.clientJobId || ""), data)
      return
    }
    if (payload?.type === "tagged_generation_result") {
      const taggedJobId = String(data?.taggedJob?.clientJobId || "")
      this.settleTaggedJob(taggedJobId, String(data?.taggedJob?.id || ""))
      this.syncTaggedOutput(data)
      return
    }
    if (payload?.type === "output_appended_to_chat") {
      this.snapshotValue.status = `Appended ${String(data.label || "output")} to chat`
      this.render()
      return
    }
    if (payload?.type === "text_editor_result" && String(data.editorId || "").startsWith("mini-")) {
      const role = String(data.editorId).slice(5)
      const input = role === "positive"
        ? this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
        : role === "negative"
          ? this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
          : null
      if (input && data.cancelled !== true) input.value = String(data.text || "")
      return
    }
    if (payload?.type === "generation_interrupt_requested" && payload.clientJobId === this.snapshotValue.jobId) {
      this.snapshotValue.status = "Interrupt requested…"
      this.render()
      return
    }
    if (payload?.type === "generation_interrupted") {
      this.fail(String(payload.clientJobId || ""), "Generation interrupted · previous output kept")
      return
    }
    if (payload?.type === "studio_error" && payload.operation === "generate") {
      this.fail(String(payload.clientJobId || ""), String(payload.error || "Generation failed."))
      return
    }
    if (payload?.type === "studio_error" && payload.operation === "open_text_editor") {
      this.snapshotValue.status = String(payload.error || "Could not open Lumiverse’s text editor.")
      this.render()
    }
  }

  onImageGenerationEvent(type: "progress" | "complete" | "error", payload: any): void {
    if (payload?.extensionIdentifier && payload.extensionIdentifier !== "swarm_studio") return
    const jobId = String(payload?.assetId || "")
    if (!this.snapshotValue.active || !this.snapshotValue.jobId) return
    if (this.snapshotValue.jobId && jobId && jobId !== this.snapshotValue.jobId) return
    if (type === "progress") {
      this.progress(
        jobId,
        typeof payload?.preview === "string" ? payload.preview : "",
        Number(payload?.step) || 0,
        Number(payload?.totalSteps) || 0,
      )
    } else if (type === "complete") {
      const imageId = String(payload?.imageId || "")
      const imageUrl = String(
        payload?.imageUrl
        || (imageId ? `/api/v1/image-gen/results/${encodeURIComponent(imageId)}` : ""),
      )
      if (imageUrl) {
        this.complete(jobId, {
          result: {
            imageId,
            imageUrl,
            model: this.quickPending?.model || "SwarmUI",
          },
          record: this.quickPending,
        })
      } else {
        this.state = "done"
        this.snapshotValue = {
          ...this.snapshotValue,
          active: false,
          jobId: "",
          connectionId: "",
          step: 1,
          totalSteps: 1,
          status: "Generation complete · final output saved",
        }
        this.render()
      }
    } else {
      this.fail(jobId, String(payload?.message || "Generation failed."))
    }
  }

  destroy(): void {
    this.cancelLongPress()
    document.removeEventListener("pointerdown", this.onDocumentPointerDown)
    document.removeEventListener("keydown", this.onDocumentKeyDown)
    window.removeEventListener("resize", this.onWindowResize)
    this.sizeObserver?.disconnect()
    this.contextMenu?.remove()
    this.widget.destroy()
  }

  private syncVisibility(): void {
    const visible = this.behavior.widgetEnabled && !this.studioOpen
    if (!visible) this.closeContextMenu()
    if (typeof this.widget.setVisible === "function") this.widget.setVisible(visible)
    else this.root.hidden = !visible
  }

  private interrupt(): void {
    if (!this.snapshotValue.active || !this.snapshotValue.jobId) return
    this.ctx.sendToBackend({
      type: "interrupt_generation",
      requestId: createRequestId(),
      clientJobId: this.snapshotValue.jobId,
      connectionId: this.snapshotValue.connectionId,
    })
    this.snapshotValue.status = "Interrupt requested…"
    this.render()
  }

  private openPromptEditor(role: string): void {
    const positive = role === "positive"
    const input = positive
      ? this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      : role === "negative"
        ? this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')
        : null
    if (!input) return
    this.ctx.sendToBackend({
      type: "open_text_editor",
      requestId: createRequestId(),
      editorId: `mini-${role}`,
      title: positive ? "Swarm Studio · Positive prompt" : "Swarm Studio · Negative prompt",
      value: input.value,
      placeholder: input.placeholder,
    })
  }

  private isMobileViewport(): boolean {
    // Spindle extensions can execute in a host realm whose window dimensions
    // differ from the visible Lumiverse document. Read the document that owns
    // the widget so this exactly matches the CSS @media breakpoint.
    return (this.root.ownerDocument.documentElement.clientWidth || window.innerWidth) <= 720
  }

  private isMobileOrb(): boolean {
    return this.isMobileViewport() && this.collapsed
  }

  private activateWidget(): void {
    this.openStudio()
  }

  private cancelLongPress(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private scheduleLongPress(event: PointerEvent): void {
    this.cancelLongPress()
    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    let dragged = false
    const cancel = () => {
      this.cancelLongPress()
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
    }
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 7) {
        dragged = true
        this.suppressNextClick = true
        cancel()
        window.setTimeout(() => {
          if (dragged) this.suppressNextClick = false
        }, 450)
      }
    }
    const finish = (finishEvent: PointerEvent) => {
      if (finishEvent.pointerId === pointerId) cancel()
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)
    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = null
      this.suppressNextClick = true
      this.showContextMenu(startX, startY)
    }, 560)
  }

  private showContextMenu(clientX: number, clientY: number): void {
    const menu = this.contextMenu
    if (!menu) return
    const toggle = menu.querySelector<HTMLButtonElement>('[data-action="mini-menu-toggle"]')
    if (toggle) {
      const blockedOnMobile = this.collapsed && this.isMobileViewport() && !this.behavior.mobileQuickCreate
      toggle.disabled = blockedOnMobile
      toggle.title = blockedOnMobile ? "Enable Quick Create on mobile in Studio settings" : ""
      const label = toggle.querySelector<HTMLElement>('[data-role="mini-menu-size-label"]')
      const icon = toggle.querySelector<HTMLElement>('[data-role="mini-menu-size-icon"]')
      if (label) label.textContent = this.collapsed ? "Expand Quick Create" : "Minimize Quick Create"
      if (icon) icon.innerHTML = this.collapsed ? EXPAND_ICON : MINIMIZE_ICON
    }
    menu.hidden = false
    menu.style.left = "8px"
    menu.style.top = "8px"
    const bounds = menu.getBoundingClientRect()
    const viewport = this.root.ownerDocument.documentElement
    const left = clamp(clientX, 8, Math.max(8, viewport.clientWidth - bounds.width - 8))
    const top = clamp(clientY, 8, Math.max(8, viewport.clientHeight - bounds.height - 8))
    menu.style.left = `${Math.round(left)}px`
    menu.style.top = `${Math.round(top)}px`
    menu.querySelector<HTMLButtonElement>("button:not([hidden]):not(:disabled)")?.focus()
  }

  private closeContextMenu(): void {
    const menu = this.contextMenu
    if (menu) menu.hidden = true
  }

  private appendLatestToChat(): void {
    const image = this.snapshotValue.latestImage
    if (!image?.id || !this.quickCanAppend) return
    this.ctx.sendToBackend({
      type: "append_output_to_chat",
      requestId: createRequestId(),
      imageId: image.id,
      label: image.label,
    })
    this.snapshotValue.status = "Appending output to active chat…"
    this.render()
  }

  private confirmTaggedPromptEdit(): void {
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')?.value.trim() || ""
    if (!prompt) {
      this.state = "error"
      this.snapshotValue.status = "Give the inline illustration a prompt first."
      this.render()
      return
    }
    const confirm = this.quickConfirm
    if (!confirm) return
    this.quickConfirm = null
    this.state = "idle"
    this.snapshotValue.status = "Inline regeneration queued with a random seed…"
    confirm(prompt, negativePrompt)
    this.render()
  }

  private quickGenerate(): void {
    if (this.snapshotValue.active) return
    const liveDraft = this.getStudioDraft()
    if (liveDraft) this.captureDraft(liveDraft, false)
    const draft = liveDraft || this.snapshotValue.draft
    const connection = (draft?.connectionId
      ? this.quickConnections.find((candidate) => String(candidate.id) === draft.connectionId)
      : null) || this.quickConnection
    const prompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.root.querySelector<HTMLInputElement>('[data-role="mini-negative"]')?.value.trim() || ""
    if (!connection) {
      this.state = "error"
      this.snapshotValue.status = "No Lumiverse SwarmUI connection is available."
      this.render()
      return
    }
    if (!prompt) {
      this.state = "error"
      this.snapshotValue.status = "Give Quick create a prompt first."
      this.render()
      return
    }
    const parameters = inheritQuickGenerationParameters(
      connection.default_parameters || {},
      draft?.details.parameters,
    )
    const model = String(draft?.details.model || connection.model || "")
    const loras = Array.isArray(parameters.loras)
      ? parameters.loras.map((name) => String(name))
      : (draft?.details.loras || []).map((lora) => lora.name)
    const loraWeights = Array.isArray(parameters.loraWeights)
      ? parameters.loraWeights.map(Number)
      : (draft?.details.loras || []).map((lora) => lora.weight)
    parameters.loras = loras
    parameters.loraWeights = loraWeights
    const clientJobId = createRequestId()
    this.quickPending = {
      prompt,
      negativePrompt,
      resolvedPrompt: prompt,
      resolvedNegativePrompt: negativePrompt,
      model,
      parameters,
      loras: loras.map((name, index) => ({ name, weight: Number.isFinite(loraWeights[index]) ? loraWeights[index] : 1 })),
      presets: draft?.details.presets || [],
      workflow: draft?.details.workflow || "",
      initImageId: draft?.details.initImageId || "",
      initImageLabel: draft?.details.initImageLabel || "",
      createdAt: Date.now(),
    }
    this.snapshotValue.draft = draft ? {
      ...draft,
      details: this.quickPending,
    } : {
      connectionId: String(connection.id || ""),
      details: this.quickPending,
      stack: [],
      selectedPresets: [],
      workflow: null,
      initImage: null,
    }
    this.begin(clientJobId, String(connection.id || ""), `Preparing quick image · ${model || "SwarmUI"}`)
    this.ctx.sendToBackend({
      type: "generate",
      requestId: createRequestId(),
      input: {
        prompt,
        negativePrompt: negativePrompt || undefined,
        connection_id: connection.id,
        model,
        clientJobId,
        parameters,
      },
      recordHints: {
        resolvedPrompt: prompt,
        resolvedNegativePrompt: negativePrompt,
        presets: draft?.details.presets || [],
        workflow: draft?.details.workflow || "",
        initImageId: draft?.details.initImageId || "",
        initImageLabel: draft?.details.initImageLabel || "",
        stack: draft?.stack || [],
        source: "miniplayer",
      },
      showCompletionToast: this.behavior.completionToast,
    })
  }

  private setCollapsed(value: boolean): void {
    if (!value && this.isMobileViewport() && !this.behavior.mobileQuickCreate) return
    this.collapsed = value
    this.expanded = !value
    try {
      window.localStorage.setItem(MINIPLAYER_STORAGE_KEY, JSON.stringify({ collapsed: value }))
    } catch {
      // The active session can still use the chosen miniplayer size.
    }
    // Resize the host before exposing the larger inner layout. On a cold
    // extension mount, Lumi may otherwise keep the first 1:1 paint while the
    // Quick Create children overflow into its eventual footprint.
    this.resizeWidget()
    const mini = this.root.querySelector<HTMLElement>('[data-role="miniplayer"]')
    if (mini) {
      mini.dataset.collapsed = String(value)
      mini.dataset.expanded = String(this.expanded)
      void mini.offsetWidth
    }
    const toggle = this.root.querySelector<HTMLButtonElement>('[data-action="mini-collapse"]')
    if (toggle) {
      toggle.textContent = "−"
      toggle.title = "Minimize to image"
      toggle.setAttribute("aria-label", toggle.title)
    }
    if (!value) {
      const liveDraft = this.getStudioDraft()
      if (liveDraft) this.captureDraft(liveDraft)
    }
    // Commit every state-derived attribute together. Without this, an expand
    // could leave data-mobile-orb="true" beside data-expanded="true" until a
    // later drag or Studio round-trip happened to render the controller.
    this.render()
  }

  private resizeWidget(): void {
    const compact = this.collapsed
    const viewportWidth = this.root.ownerDocument.documentElement.clientWidth || window.innerWidth
    const width = compact
      ? this.isMobileViewport() ? 64 : 56
      : Math.min(430, viewportWidth - 24)
    const height = compact
      ? width
      : this.isMobileViewport() ? 304 : 270
    this.expectedWidth = width
    this.expectedHeight = height
    this.applyWidgetSize(width, height)
    const expectedCompact = compact
    window.requestAnimationFrame(() => {
      if (this.collapsed !== expectedCompact) return
      this.applyWidgetSize(width, height)
    })
  }

  private applyWidgetSize(width: number, height: number): void {
    this.widget.setSize?.(width, height)
    const targets = this.widgetSizeTargets()
    for (const target of targets) {
      target.style.setProperty("width", `${width}px`, "important")
      target.style.setProperty("height", `${height}px`, "important")
    }
    this.observeSizeTarget(targets[targets.length - 1] || this.root)
  }

  private widgetSizeTargets(): HTMLElement[] {
    const targets: HTMLElement[] = [this.root]
    if (this.root.classList.contains("ss-miniplayer-app-surface")) return targets
    let current = this.root.parentElement as HTMLElement | null
    while (current && current !== this.root.ownerDocument.body && current !== this.root.ownerDocument.documentElement) {
      targets.push(current)
      if (getComputedStyle(current).position === "fixed") break
      current = current.parentElement as HTMLElement | null
    }
    return targets
  }

  private observeSizeTarget(target: HTMLElement): void {
    if (!this.sizeObserver || this.observedSizeTarget === target) return
    this.sizeObserver.disconnect()
    this.sizeObserver.observe(target)
    this.observedSizeTarget = target
  }

  private render(): void {
    const mini = this.root.querySelector<HTMLElement>('[data-role="miniplayer"]')
    if (!mini) return
    const hasTotal = this.snapshotValue.totalSteps > 0
    const percentage = hasTotal
      ? clamp(Math.round((this.snapshotValue.step / this.snapshotValue.totalSteps) * 100), 0, 100)
      : this.state === "done" ? 100 : 0
    mini.dataset.state = this.state
    const mobileOrb = this.isMobileOrb()
    mini.dataset.mobileOrb = String(mobileOrb)
    mini.dataset.collapsed = String(this.collapsed)
    mini.dataset.expanded = String(this.expanded)
    if (this.collapsed) {
      mini.dataset.action = "mini-open"
      mini.setAttribute("role", "button")
      mini.tabIndex = 0
      mini.setAttribute("aria-label", "Open Swarm Studio")
    } else {
      delete mini.dataset.action
      mini.removeAttribute("role")
      mini.removeAttribute("tabindex")
      mini.removeAttribute("aria-label")
    }
    mini.dataset.indeterminate = String(this.state === "running" && !hasTotal)
    mini.style.setProperty("--ss-mini-progress", `${percentage}%`)
    const labels = { idle: "Ready", running: "Live", done: "Done", error: "Stopped" }
    this.root.querySelector<HTMLElement>('[data-role="mini-state"]')!.textContent = labels[this.state]
    this.root.querySelector<HTMLElement>('[data-role="mini-status"]')!.textContent = this.snapshotValue.status
    const image = this.root.querySelector<HTMLImageElement>('[data-role="mini-image"]')!
    const placeholder = this.root.querySelector<HTMLElement>('[data-role="mini-placeholder"]')!
    if (this.snapshotValue.preview) {
      image.src = this.snapshotValue.preview
      image.hidden = false
      placeholder.hidden = true
    } else {
      image.hidden = true
      placeholder.hidden = false
    }
    const append = this.root.querySelector<HTMLButtonElement>('[data-action="mini-append"]')
    if (append) append.disabled = !this.quickCanAppend || !this.snapshotValue.latestImage?.id
    const quickButton = this.root.querySelector<HTMLButtonElement>('[data-action="mini-generate"]')
    if (quickButton) {
      quickButton.disabled = !this.quickConfirm && !this.snapshotValue.active && !this.quickConnection
      quickButton.dataset.running = String(this.snapshotValue.active)
      quickButton.textContent = this.snapshotValue.active
        ? "Stop generation"
        : this.quickConfirm ? "Confirm" : "Generate quick image"
    }
    const connection = this.root.querySelector<HTMLElement>('[data-role="mini-connection"]')
    if (connection) {
      connection.textContent = this.quickConnection
        ? `${String(this.quickConnection.name || "SwarmUI")} · ${String(this.quickConnection.model || "connection default")}`
        : "No Lumiverse SwarmUI connection found"
    }
  }
}
