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
  private readonly stopPositionPersistence: () => void
  private readonly ctx: FrontendContext
  private readonly widget: any
  private readonly root: HTMLElement
  private readonly openStudio: () => void
  private readonly openLibrary: () => void
  private readonly openUpscale: (image: CurrentImage) => void
  private readonly getStudioDraft: () => StudioDraft | null
  private readonly onBehaviorChange: (behavior: StudioBehavior) => void
  private behavior: StudioBehavior
  private studioOpen = false
  private collapsed = true
  private expanded = false
  private quickView: "rail" | "composer" = "rail"
  private previewVisible = false
  private stripPinned = false
  private stripMenu: HTMLElement | null = null
  private quickSettingsView = false
  private quickOverrides: Record<string, number | string> = {}
  private quickPosition = { x: 0, y: 0 }
  private quickDetached = false
  private previewDetached = false
  private previewSurface: HTMLElement | null = null
  private quickPanel: HTMLElement | null = null
  private previewPosition = { x: 0, y: 0, width: 390, height: 550 }
  private quickDraftTouched = false
  private negativeExpanded = true
  private characterAvatarUrl = ""
  private expectedWidth = 318
  private expectedHeight = 94
  private sizeObserver: ResizeObserver | null = null
  private observedSizeTarget: HTMLElement | null = null
  private contextMenu: HTMLElement | null = null
  private longPressTimer: number | null = null
  private endPreviewGesture: (() => void) | null = null
  private suppressNextClick = false
  private readonly onDocumentPointerDown = (event: PointerEvent) => {
    const target = event.target as HTMLElement
    if (this.contextMenu && !this.contextMenu.hidden && !this.contextMenu.contains(target)) this.closeContextMenu()
    if (this.stripMenu && !this.stripMenu.hidden && !this.stripMenu.contains(target)
      && !target.closest('[data-action="mini-show-menu"]')) this.closeStripMenu()
  }
  private readonly onDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") { this.closeContextMenu(); this.closeStripMenu() }
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
    this.positionPreview()
    this.render()
  }
  private quickConnection: any | null = null
  private quickConnections: any[] = []
  private readonly quickModelLabels = new Map<string, string>()
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
    openUpscale: (image: CurrentImage) => void,
    getStudioDraft: () => StudioDraft | null,
    behavior: StudioBehavior,
    onBehaviorChange: (behavior: StudioBehavior) => void,
  ) {
    this.ctx = ctx
    this.widget = widget
    this.stopPositionPersistence = persistNativeMiniplayerPosition(widget)
    this.root = widget.root
    this.root.style.width = "100%"
    this.root.style.height = "100%"
    this.openStudio = openStudio
    this.openLibrary = openLibrary
    this.openUpscale = openUpscale
    this.getStudioDraft = getStudioDraft
    this.onBehaviorChange = onBehaviorChange
    this.behavior = { ...behavior }
    try {
      const stored = JSON.parse(window.localStorage.getItem(MINIPLAYER_STORAGE_KEY) || "{}")
      this.collapsed = this.isMobileViewport()
        ? true
        : stored.collapsed !== false
      this.expanded = !this.collapsed
      this.stripPinned = stored.stripPinned === true
    } catch {
      this.collapsed = true
      this.expanded = !this.collapsed
    }
    this.root.innerHTML = `
      <div class="ss-miniplayer" data-role="miniplayer" data-state="idle" data-collapsed="true" data-expanded="false" data-quick-view="rail" data-indeterminate="false">
        <div class="ss-mini-preview" data-action="mini-open" role="button" tabindex="0" title="Open toolkit" aria-label="Open toolkit">
          <span data-role="mini-placeholder">${FRAME_WALL_ICON}</span>
          <img data-role="mini-image" alt="Latest Swarm Studio preview" draggable="false" hidden />
          <span class="ss-mini-live-dot" aria-hidden="true"></span>
        </div>
        <button type="button" class="ss-mini-rail-pin" data-action="mini-toggle-pin" title="Pin toolkit open" aria-label="Pin toolkit open" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 3 5 5-3 1.4-2 5-3 3-6-6 3-3 5-2Z"/><path d="m10 14-7 7"/></svg></button>
        <span class="ss-mini-satellite" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/></svg></span>
        <div class="ss-mini-actions" aria-label="Studio toolkit">
          <button class="ss-mini-button ss-mini-compose-cta" data-action="mini-compose" title="Quick Create" aria-label="Quick Create"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button>
          <button class="ss-mini-button ss-mini-studio-cta" data-action="mini-studio" title="Open full Studio" aria-label="Open full Studio"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M2.5 9h19M8.5 9v11M8 6.5h.01M11 6.5h.01"/></svg></button>
          <button class="ss-mini-button ss-mini-preview-cta" data-action="mini-toggle-preview" title="Toggle artwork preview" aria-label="Toggle artwork preview" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.8"/></svg></button>
          <button class="ss-mini-button" data-action="mini-library" title="Recent images · open Gallery" aria-label="Recent images · open Gallery">${LIBRARY_ICON}</button>
          <span class="ss-mini-actions-divider" aria-hidden="true"></span>
          <button class="ss-mini-button" data-action="mini-append" title="Append latest artwork to chat" aria-label="Append latest artwork to chat" disabled>${APPEND_CHAT_ICON}</button>
          <button class="ss-mini-button" data-action="mini-show-menu" title="More toolkit options" aria-label="More toolkit options" aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></button>
        </div>
        <div class="ss-mini-quick" data-role="mini-quick">
          <div class="ss-mini-quick-head" data-role="mini-quick-drag">
            <span class="ss-mini-quick-grip" aria-hidden="true"><svg viewBox="0 0 12 18" fill="currentColor"><circle cx="3" cy="3" r="1"/><circle cx="9" cy="3" r="1"/><circle cx="3" cy="9" r="1"/><circle cx="9" cy="9" r="1"/><circle cx="3" cy="15" r="1"/><circle cx="9" cy="15" r="1"/></svg></span>
            <div><strong data-role="mini-quick-title">Quick Create</strong><span class="ss-mini-connection" data-role="mini-connection">Inherited Studio recipe</span></div>
            <div class="ss-mini-head-actions">
              <button class="ss-mini-button ss-mini-settings-toggle" data-action="mini-settings" title="Generation settings" aria-label="Generation settings" aria-pressed="false">${SETTINGS_ICON}</button>
              <button class="ss-mini-button" data-action="mini-close-compose" title="Back to action rail" aria-label="Back to action rail">×</button>
            </div>
          </div>
          <div class="ss-mini-quick-body">
            <div class="ss-mini-artwork" aria-label="Latest artwork preview">
              <span class="ss-mini-artwork-thumb"><span data-role="mini-compose-placeholder">${FRAME_WALL_ICON}</span><img data-role="mini-compose-image" alt="Latest illustration" hidden /></span>
              <div><strong>Latest artwork</strong><span>Live outputs appear in Preview</span></div>
            </div>
            <label class="ss-mini-field"><span>Positive prompt <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="positive" aria-label="Expand positive prompt">${EXPAND_ICON}</button></span><textarea class="ss-mini-prompt" data-role="mini-prompt" placeholder="Describe your illustration…" aria-label="Quick image prompt"></textarea></label>
            <button class="ss-mini-negative-toggle" data-action="mini-toggle-negative" aria-expanded="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg><span data-role="mini-negative-label">Hide negative prompt</span></button>
            <label class="ss-mini-field ss-mini-negative-field"><span>Negative prompt <button class="ss-mini-editor-button" data-action="mini-edit-prompt" data-prompt-role="negative" aria-label="Expand negative prompt">${EXPAND_ICON}</button></span><textarea class="ss-mini-negative" data-role="mini-negative" placeholder="What should not appear…" aria-label="Quick negative prompt"></textarea></label>
            <div class="ss-mini-quick-hint"><span class="ss-mini-recipe-dot"></span>Using current Studio recipe</div>
          </div>
          <div class="ss-mini-settings-screen" data-role="mini-settings-screen" hidden>
            <div class="ss-mini-settings-intro"><span class="ss-mini-settings-orbit">✧</span><div><strong>Render recipe</strong><span>Fine-tune this Quick Create session without changing your saved Studio preset.</span></div></div>
            <div class="ss-mini-settings-section"><span class="ss-mini-settings-eyebrow">CANVAS</span>
              <label class="ss-mini-settings-field">Aspect ratio<select data-quick-param="aspect"><option value="custom">Custom</option><option value="1:1">1:1 · Square</option><option value="2:3">2:3 · Portrait</option><option value="3:2">3:2 · Landscape</option><option value="3:4">3:4 · Portrait</option><option value="4:3">4:3 · Landscape</option><option value="9:16">9:16 · Tall</option><option value="16:9">16:9 · Wide</option></select></label>
              <div class="ss-mini-settings-pair"><label class="ss-mini-settings-field">Width<input type="number" inputmode="numeric" min="64" max="4096" step="64" data-quick-param="width"/></label><label class="ss-mini-settings-field">Height<input type="number" inputmode="numeric" min="64" max="4096" step="64" data-quick-param="height"/></label></div>
            </div>
            <div class="ss-mini-settings-section"><span class="ss-mini-settings-eyebrow">SAMPLING</span>
              <label class="ss-mini-settings-field">Sampler<input type="text" list="ss-mini-sampler-suggestions" data-quick-param="sampler" placeholder="Connection default" autocomplete="off"/><datalist id="ss-mini-sampler-suggestions"></datalist></label>
              <div class="ss-mini-settings-pair"><label class="ss-mini-settings-field">Steps<input type="number" inputmode="numeric" min="1" max="150" step="1" data-quick-param="steps"/></label><label class="ss-mini-settings-field">CFG scale<input type="number" inputmode="decimal" min="1" max="30" step="0.5" data-quick-param="cfgScale"/></label></div>
              <label class="ss-mini-settings-field">Seed<div class="ss-mini-settings-seed"><input type="number" step="1" data-quick-param="seed"/><button type="button" data-action="mini-random-seed" title="Random seed (-1)" aria-label="Use random seed">${RANDOM_SEED_ICON}</button></div></label>
            </div>
            <p class="ss-mini-settings-note" data-role="mini-settings-note">Settings are applied to the next Quick Create render.</p>
          </div>
          <div class="ss-mini-settings-actions" data-role="mini-settings-actions" hidden><button type="button" data-action="mini-reset-settings">Reset to recipe</button><button type="button" data-action="mini-save-settings">Done ${CHECK_ICON}</button></div>
          <div class="ss-mini-quick-actions">
            <button class="ss-mini-append-compose" data-action="mini-append" disabled>${APPEND_CHAT_ICON}<span>Append</span></button>
            <button class="ss-mini-generate" data-action="mini-generate" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/></svg><span data-role="mini-generate-label">Generate image</span></button>
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
      <div class="ss-mini-context-menu ss-mini-strip-menu" data-role="mini-strip-menu" role="menu" hidden>
        <div class="ss-mini-strip-menu-title">TOOLKIT <span>✧</span></div>
        <button class="ss-mini-context-action" data-action="mini-strip-quick" role="menuitem">${SPARKLE_ICON}<span>Quick Create</span></button>
        <button class="ss-mini-context-action" data-action="mini-strip-upscale" role="menuitem" disabled>${EXPAND_ICON}<span>AI Upscale latest</span></button>
        <button class="ss-mini-context-action" data-action="mini-strip-gallery" role="menuitem">${LIBRARY_ICON}<span>Recent images</span></button>
        <span class="ss-mini-context-separator" aria-hidden="true"></span>
        <button class="ss-mini-context-action" data-action="mini-strip-pin" role="menuitem"><span data-role="mini-strip-pin-icon">${SETTINGS_ICON}</span><span data-role="mini-strip-pin-label">Pin toolkit open</span></button>
        <button class="ss-mini-context-action" data-action="mini-strip-reset" role="menuitem">${MINIMIZE_ICON}<span>Reset floating panels</span></button>
        <button class="ss-mini-context-action" data-action="mini-strip-collapse" role="menuitem">${MINIMIZE_ICON}<span>Collapse to orb</span></button>
      </div>
    `
    this.createPreviewSurface()
    this.quickPanel = this.root.querySelector<HTMLElement>('[data-role="mini-quick"]')
    if (this.quickPanel) {
      this.quickPanel.remove()
      this.quickPanel.setAttribute("aria-label", "Quick Create")
      this.quickPanel.hidden = true
      this.root.ownerDocument.documentElement.appendChild(this.quickPanel)
    }
    this.stripMenu = this.root.querySelector<HTMLElement>('[data-role="mini-strip-menu"]')
    if (this.stripMenu) { this.stripMenu.remove(); this.root.ownerDocument.documentElement.appendChild(this.stripMenu) }
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
      if (action === "mini-toggle-pin" || action === "mini-strip-pin") this.toggleStripPin()
      if (action === "mini-strip-quick") this.openQuickCreate()
      if (action === "mini-strip-gallery") this.openLibrary()
      if (action === "mini-strip-upscale" && this.snapshotValue.latestImage?.id) this.openUpscale(this.snapshotValue.latestImage)
      if (action === "mini-strip-reset") this.resetFloatingPanels()
      if (action === "mini-strip-collapse") { this.stripPinned = false; this.setCollapsed(true) }
      if (action === "mini-settings") this.showQuickSettings(!this.quickSettingsView)
      if (action === "mini-save-settings") this.saveQuickSettings()
      if (action === "mini-reset-settings") { this.quickOverrides = {}; this.showQuickSettings(true) }
      if (action === "mini-random-seed") { const seed = this.queryMini<HTMLInputElement>('[data-quick-param="seed"]'); if (seed) seed.value = "-1" }
      if (action === "mini-append") this.appendLatestToChat()
      if (action === "mini-library" || action === "mini-menu-library") this.openLibrary()
      if (action === "mini-studio") this.openStudio()
      if (action === "mini-toggle-preview") this.setPreviewVisible(!this.previewVisible)
      if (action === "mini-collapse") this.setCollapsed(true)
      if (action === "mini-compose") this.openQuickCreate()
      if (action === "mini-close-compose") { if (this.quickSettingsView) this.showQuickSettings(false); else { this.quickView = "rail"; this.resizeWidget(); this.render() } }
      if (action === "mini-show-menu") {
        event.preventDefault()
        event.stopPropagation()
        if (this.stripMenu && !this.stripMenu.hidden) this.closeStripMenu()
        else { const rect = button.getBoundingClientRect(); this.showStripMenu(rect.right, rect.bottom + 5, rect.top) }
      }
      if (action === "mini-toggle-negative") {
        this.negativeExpanded = !this.negativeExpanded
        if (!this.collapsed && this.quickView === "composer") this.resizeWidget()
        this.render()
      }
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
      if (action?.startsWith("mini-strip-")) this.closeStripMenu()
    }
    this.root.addEventListener("click", handleAction)
    this.quickPanel?.addEventListener("click", handleAction)
    const markQuickDraftTouched = (event: Event) => {
      if ((event.target as HTMLElement).matches('[data-role="mini-prompt"], [data-role="mini-negative"]')) this.quickDraftTouched = true
    }
    this.root.addEventListener("input", markQuickDraftTouched)
    this.quickPanel?.addEventListener("input", markQuickDraftTouched)
    this.quickPanel?.addEventListener("pointerdown", (event) => event.stopPropagation())
    this.installQuickPanelDrag()
    this.contextMenu?.addEventListener("click", handleAction)
    this.stripMenu?.addEventListener("click", handleAction)
    this.quickPanel?.querySelector('[data-quick-param="aspect"]')?.addEventListener("change", () => this.changeQuickAspect())
    this.root.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return
      if (!(event.target as HTMLElement).closest('[data-action="mini-open"]')) return
      event.preventDefault()
      this.activateWidget()
    })
    this.root.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement
      const preview = target.closest('[data-action="mini-open"]')
      if (!this.collapsed && !preview && target.closest("button, input, textarea, select, a, [data-action]")) {
        // Lumi's float widget makes its entire chrome draggable. Stop the
        // bubbled pointerdown for controls. The preview also acts as a drag handle.
        event.stopPropagation()
      }
      if (event.button === 0 && (preview || (this.collapsed && target.closest('[data-role="miniplayer"]')))) {
        this.scheduleLongPress(event, this.collapsed)
      }
      if (event.button === 2 && !target.closest("input, textarea, select")) {
        event.preventDefault()
        event.stopPropagation()
        if (target.closest('.ss-mini-actions, .ss-mini-rail-pin')) this.showStripMenu(event.clientX, event.clientY)
        else this.showContextMenu(event.clientX, event.clientY)
      }
    })
    this.root.addEventListener("contextmenu", (event) => {
      if ((event.target as HTMLElement).closest("input, textarea, select")) return
      event.preventDefault()
      event.stopPropagation()
      if ((event.target as HTMLElement).closest('.ss-mini-actions, .ss-mini-rail-pin')) this.showStripMenu(event.clientX, event.clientY)
      else this.showContextMenu(event.clientX, event.clientY)
    }, true)
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
    if (this.stripMenu) applyAppearanceVariables(this.stripMenu, appearance)
    if (this.previewSurface) applyAppearanceVariables(this.previewSurface, appearance)
    if (this.quickPanel) applyAppearanceVariables(this.quickPanel, appearance)
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
    if (open) { this.closeContextMenu(); this.closeStripMenu() }
    this.syncVisibility()
  }

  snapshot(): StudioActivitySnapshot {
    return { ...this.snapshotValue }
  }

  captureDraft(draft: StudioDraft | null, syncPrompts = true): void {
    if (!draft) return
    this.snapshotValue.draft = draft
    if (syncPrompts) {
      const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      const negative = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
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
    this.quickView = "composer"
    this.resizeWidget()
    const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
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
    const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
    const negative = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
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
    this.snapshotValue.status = "Message illustration finished"
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
      // The bootstrap's chatVisuals payload already carries friendly model
      // labels. Reuse these instead of requesting the entire metadata catalog.
      const models = Array.isArray(data.chatVisuals?.models) ? data.chatVisuals.models : []
      this.quickModelLabels.clear()
      for (const item of models) {
        const id = String(item?.id || "").trim()
        const label = String(item?.label || "").trim()
        if (id && label && label !== id && !/\.safetensors$/i.test(label)) {
          this.quickModelLabels.set(id.toLowerCase(), label)
        }
      }
      this.quickCanAppend = Boolean(data.activeChat?.id && data.permissions?.chatMutation)
      const characterId = String(data.activeChat?.character_id || "").trim()
      this.characterAvatarUrl = characterId ? `/api/v1/characters/${encodeURIComponent(characterId)}/avatar?size=sm` : ""
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
      for (const job of jobs) {
        if (job?.status === "ready" || job?.status === "failed" || job?.status === "cancelled") {
          this.settleTaggedJob(String(job.clientJobId || ""), String(job.id || ""))
        }
      }
      if (this.currentActivitySource === "tagged" && this.snapshotValue.jobId
        && ![...this.activeTaggedAttempts.values()].includes(this.snapshotValue.jobId)) {
        this.settleTaggedJob(this.snapshotValue.jobId)
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
        ? this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
        : role === "negative"
          ? this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
          : null
      if (input && data.cancelled !== true) input.value = String(data.text || "")
      return
    }
    if (payload?.type === "generation_interrupt_requested" && payload.clientJobId === this.snapshotValue.jobId) {
      if (data.waitingStopped === true || data.interrupted === false) {
        this.fail(String(payload.clientJobId || ""), "Stopped waiting · SwarmUI stop not confirmed")
      } else {
        this.snapshotValue.status = "Interrupt requested…"
        this.render()
      }
      return
    }
    if (payload?.type === "generation_interrupted") {
      this.fail(String(payload.clientJobId || ""), "Generation wait stopped · SwarmUI stop not confirmed")
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
    this.stopPositionPersistence()
    this.cancelLongPress()
    this.endPreviewGesture?.()
    document.removeEventListener("pointerdown", this.onDocumentPointerDown)
    document.removeEventListener("keydown", this.onDocumentKeyDown)
    window.removeEventListener("resize", this.onWindowResize)
    this.sizeObserver?.disconnect()
    this.previewSurface?.remove()
    this.quickPanel?.remove()
    this.contextMenu?.remove()
    this.stripMenu?.remove()
    this.widget.destroy()
  }

  private syncVisibility(): void {
    const visible = this.behavior.widgetEnabled && !this.studioOpen
    if (!visible) { this.closeContextMenu(); this.closeStripMenu() }
    if (this.previewSurface) this.previewSurface.hidden = !visible || this.collapsed || !this.previewVisible
    if (this.quickPanel) this.quickPanel.hidden = !visible || this.collapsed || this.quickView !== "composer"
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
      ? this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      : role === "negative"
        ? this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
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
    if (!this.collapsed && this.stripPinned) return
    if (this.collapsed && this.isMobileViewport() && !this.behavior.mobileQuickCreate) {
      // Mobile Quick Create is opt-in, but the launcher must not become a dead button.
      this.openStudio()
    } else if (this.collapsed) this.setCollapsed(false)
    else this.setCollapsed(true)
  }

  private cancelLongPress(): void {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private scheduleLongPress(event: PointerEvent, allowMenu: boolean): void {
    this.endPreviewGesture?.()
    this.suppressNextClick = false
    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    const cancel = () => {
      this.endPreviewGesture = null
      this.cancelLongPress()
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
    }
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return
      if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > 7) {
        this.suppressNextClick = true
        this.cancelLongPress()
      }
    }
    const finish = (finishEvent: PointerEvent) => {
      if (finishEvent.pointerId === pointerId) cancel()
    }
    this.endPreviewGesture = cancel
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)
    if (allowMenu) this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = null
      this.suppressNextClick = true
      this.showContextMenu(startX, startY)
    }, 560)
  }

  private openQuickCreate(): void {
    this.quickView = "composer"
    this.resizeWidget()
    this.render()
  }

  private toggleStripPin(): void {
    this.stripPinned = !this.stripPinned
    this.persistStripState()
    this.render()
  }

  private persistStripState(): void {
    try { window.localStorage.setItem(MINIPLAYER_STORAGE_KEY, JSON.stringify({ collapsed: this.collapsed, stripPinned: this.stripPinned })) }
    catch { /* Optional layout preference. */ }
  }

  private showStripMenu(x: number, y: number, anchorTop = y): void {
    const menu = this.stripMenu
    if (!menu) return
    this.closeContextMenu()
    const upscale = menu.querySelector<HTMLButtonElement>('[data-action="mini-strip-upscale"]')
    if (upscale) { upscale.disabled = !this.snapshotValue.latestImage?.id; upscale.title = upscale.disabled ? "Generate an image first" : "Open AI upscale for the latest image" }
    const pinLabel = menu.querySelector<HTMLElement>('[data-role="mini-strip-pin-label"]')
    if (pinLabel) pinLabel.textContent = this.stripPinned ? "Unpin toolkit" : "Pin toolkit open"
    menu.hidden = false
    menu.style.left = "8px"; menu.style.top = "8px"
    const bounds = menu.getBoundingClientRect()
    const vw = this.root.ownerDocument.documentElement.clientWidth || window.innerWidth
    const vh = this.root.ownerDocument.documentElement.clientHeight || window.innerHeight
    menu.style.left = `${Math.round(clamp(x, 8, Math.max(8, vw - bounds.width - 8)))}px`
    // Keep the trigger hittable for a second click: open above when there is no room below.
    const menuTop = y + bounds.height <= vh - 8 ? y : anchorTop - bounds.height - 8
    menu.style.top = `${Math.round(clamp(menuTop, 8, Math.max(8, vh - bounds.height - 8)))}px`
    this.root.querySelector<HTMLButtonElement>('[data-action="mini-show-menu"]')?.setAttribute("aria-expanded", "true")
  }

  private closeStripMenu(): void {
    if (this.stripMenu) this.stripMenu.hidden = true
    this.root.querySelector<HTMLButtonElement>('[data-action="mini-show-menu"]')?.setAttribute("aria-expanded", "false")
  }

  private resetFloatingPanels(): void {
    this.previewDetached = false
    this.quickDetached = false
    this.quickPosition = { x: 0, y: 0 }
    this.previewPosition = { x: 0, y: 0, width: 390, height: 550 }
    this.savePreviewPosition()
    this.saveQuickPosition()
    this.positionQuickPanel()
    this.positionPreview()
  }

  private showContextMenu(clientX: number, clientY: number): void {
    const menu = this.contextMenu
    if (!menu) return
    this.closeStripMenu()
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
    for (const button of [...this.root.querySelectorAll<HTMLButtonElement>('[data-action="mini-show-menu"]'), ...this.quickPanel?.querySelectorAll<HTMLButtonElement>('[data-action="mini-show-menu"]') || []]) button.setAttribute("aria-expanded", "true")
    menu.style.left = "8px"
    menu.style.top = "8px"
    const bounds = menu.getBoundingClientRect()
    const viewport = this.root.ownerDocument.documentElement
    const left = clamp(clientX, 8, Math.max(8, viewport.clientWidth - bounds.width - 8))
    // Menu lives under document.documentElement, outside body zoom and .ss-shell. Avoid
    // --studio-safe-top here: the missing scoped variable invalidated the
    // entire top declaration and sent the menu to the top of the page.
    const safeInset = parseFloat(getComputedStyle(viewport).getPropertyValue("--app-interactive-safe-top")) || 0
    const top = clamp(clientY, safeInset + 8, Math.max(safeInset + 8, viewport.clientHeight - bounds.height - 8))
    menu.style.left = `${Math.round(left)}px`
    menu.style.top = `${Math.round(top)}px`
    menu.querySelector<HTMLButtonElement>("button:not([hidden]):not(:disabled)")?.focus()
  }

  private closeContextMenu(): void {
    const menu = this.contextMenu
    if (menu) menu.hidden = true
    for (const button of [...this.root.querySelectorAll<HTMLButtonElement>('[data-action="mini-show-menu"]'), ...this.quickPanel?.querySelectorAll<HTMLButtonElement>('[data-action="mini-show-menu"]') || []]) button.setAttribute("aria-expanded", "false")
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
    const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')?.value.trim() || ""
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
    const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')?.value.trim() || ""
    const negativePrompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')?.value.trim() || ""
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
    const parameters = { ...inheritQuickGenerationParameters(
      connection.default_parameters || {},
      draft?.details.parameters,
    ), ...this.quickOverrides }
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
    if (value) {
      this.previewVisible = false
      if (this.previewSurface) this.previewSurface.hidden = true
      if (this.quickPanel) this.quickPanel.hidden = true
    }
    this.quickView = "rail"
    this.quickSettingsView = false
    this.persistStripState()
    // Resize the host before exposing the larger inner layout. On a cold
    // extension mount, Lumi may otherwise keep the first 1:1 paint while the
    // Quick Create children overflow into its eventual footprint.
    this.resizeWidget()
    const mini = this.root.querySelector<HTMLElement>('[data-role="miniplayer"]')
    if (mini) {
      mini.dataset.collapsed = String(value)
      mini.dataset.expanded = String(this.expanded)
    mini.dataset.quickView = this.quickView
      void mini.offsetWidth
    }
    const toggle = this.root.querySelector<HTMLButtonElement>('[data-action="mini-collapse"]')
    if (toggle) {
      toggle.textContent = "−"
      toggle.title = "Minimize to image"
      toggle.setAttribute("aria-label", toggle.title)
    }
    if (!value) {
      const prompt = this.queryMini<HTMLTextAreaElement>('[data-role="mini-prompt"]')
      const negative = this.queryMini<HTMLTextAreaElement>('[data-role="mini-negative"]')
      // Orb/toolkit/Quick Create transitions never overwrite unsaved prompts.
      if (!prompt?.value && !negative?.value && !this.quickDraftTouched) {
        const liveDraft = this.getStudioDraft()
        if (liveDraft) this.captureDraft(liveDraft)
      }
    }
    // Commit every state-derived attribute together. Without this, an expand
    // could leave data-mobile-orb="true" beside data-expanded="true" until a
    // later drag or Studio round-trip happened to render the controller.
    this.render()
    this.positionQuickPanel()
    if (!value) this.positionPreview()
  }


  private createPreviewSurface(): void {
    const doc = this.root.ownerDocument
    const surface = doc.createElement("section")
    surface.className = "ss-mini-easel"
    surface.dataset.state = "idle"
    surface.setAttribute("aria-label", "Swarm Studio artwork preview")
    surface.hidden = true
    surface.innerHTML = `
      <header class="ss-mini-easel-head" data-role="mini-easel-drag">
        <span class="ss-mini-easel-accent" aria-hidden="true"></span>
        <span class="ss-mini-easel-identity"><strong>Artwork preview</strong><small data-role="mini-easel-model">Current Studio recipe</small></span>
        <button type="button" data-action="easel-compose" title="Quick Create" aria-label="Open Quick Create"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg></button>
        <button type="button" data-action="easel-close" title="Close artwork preview" aria-label="Close artwork preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button>
      </header>
      <div class="ss-mini-easel-stage">
        <div class="ss-mini-easel-empty" data-role="mini-easel-empty">${FRAME_WALL_ICON}<span>Waiting for artwork</span></div>
        <img data-role="mini-easel-image" alt="Latest Swarm Studio artwork" hidden />
        <div class="ss-mini-easel-tags"><span data-role="mini-easel-stage-label">LATEST RENDER</span><span data-role="mini-easel-progress-label">Ready</span></div>
        <div class="ss-mini-easel-stage-caption" data-role="mini-easel-stage-caption">Latest available image · waiting for a new generation</div>
      </div>
      <div class="ss-mini-easel-progress"><span data-role="mini-easel-progress-bar"></span></div>
      <footer class="ss-mini-easel-footer">
        <span class="ss-mini-easel-status" data-role="mini-easel-status">Ready when inspiration hits.</span>
        <button type="button" data-action="easel-append" disabled>${APPEND_CHAT_ICON}<span>Append</span></button>
        <button type="button" data-action="easel-gallery" title="Recent images">${LIBRARY_ICON}</button>
        <button type="button" data-action="easel-generate" class="ss-mini-easel-generate" disabled>${SPARKLE_ICON}<span data-role="mini-easel-generate-label">Generate</span></button>
      </footer>
      <span class="ss-mini-easel-resize" data-role="mini-easel-resize" aria-hidden="true"></span>
    `
    const docRoot = doc.documentElement
    docRoot.appendChild(surface)
    this.previewSurface = surface
    try {
      const saved = JSON.parse(window.localStorage.getItem("swarm-studio-easel-layout-v1") || "null")
      if (Number.isFinite(saved?.width) && Number.isFinite(saved?.height)) {
        this.previewPosition.width = saved.width
        this.previewPosition.height = saved.height
      }
      if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y) && saved.detached === true) {
        this.previewPosition.x = saved.x
        this.previewPosition.y = saved.y
        this.previewDetached = true
      }
    } catch { /* Preview layout is optional. */ }
    surface.addEventListener("click", (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")?.dataset.action
      if (action === "easel-close") this.setPreviewVisible(false)
      if (action === "easel-compose") { this.openQuickCreate(); this.positionPreview() }
      if (action === "easel-gallery") this.openLibrary()
      if (action === "easel-append") this.appendLatestToChat()
      if (action === "easel-generate") {
        if (this.snapshotValue.active) this.interrupt()
        else if (this.quickConfirm) { this.quickView = "composer"; this.resizeWidget(); this.render() }
        else this.quickGenerate()
      }
    })
    surface.addEventListener("pointerdown", (event) => {
      // The easel has its own drag/resize interactions, never Lumi's widget drag.
      event.stopPropagation()
      if (event.button !== 0) return
      const target = event.target as HTMLElement
      const resizing = !!target.closest('[data-role="mini-easel-resize"]')
      if (!resizing && (!target.closest('[data-role="mini-easel-drag"]') || target.closest("button"))) return
      event.preventDefault()
      const origin = { ...this.previewPosition }
      const startX = event.clientX
      const startY = event.clientY
      let moved = false
      const move = (next: PointerEvent) => {
        if (next.pointerId !== event.pointerId) return
        const dx = next.clientX - startX
        const dy = next.clientY - startY
        if (Math.hypot(dx, dy) < 3 && !moved) return
        moved = true
        if (resizing) {
          this.previewPosition.width = origin.width + dx
          this.previewPosition.height = origin.height + dy
        } else {
          this.previewPosition.x = origin.x + dx
          this.previewPosition.y = origin.y + dy
          this.previewDetached = true
        }
        this.positionPreview()
      }
      const stop = (next: PointerEvent) => {
        if (next.pointerId !== event.pointerId) return
        doc.removeEventListener("pointermove", move, true)
        doc.removeEventListener("pointerup", stop, true)
        doc.removeEventListener("pointercancel", stop, true)
        if (moved) this.savePreviewPosition()
      }
      doc.addEventListener("pointermove", move, true)
      doc.addEventListener("pointerup", stop, true)
      doc.addEventListener("pointercancel", stop, true)
    })
  }

  private setPreviewVisible(visible: boolean): void {
    if (!this.previewSurface || (visible && this.collapsed)) return
    this.previewVisible = visible
    this.previewSurface.hidden = !visible || this.studioOpen || !this.behavior.widgetEnabled
    if (visible) this.positionPreview()
    this.render()
  }

  private savePreviewPosition(): void {
    try {
      window.localStorage.setItem("swarm-studio-easel-layout-v1", JSON.stringify({
        ...this.previewPosition, detached: this.previewDetached,
      }))
    } catch { /* Persisting layout must not block image work. */ }
  }

  private positionPreview(): void {
    const surface = this.previewSurface
    if (!surface || !this.previewVisible) return
    const doc = this.root.ownerDocument
    const w = doc.documentElement.clientWidth || window.innerWidth
    const h = doc.documentElement.clientHeight || window.innerHeight
    const mobile = w <= 720
    const minWidth = mobile ? 240 : 286
    const minHeight = mobile ? 270 : 320
    const width = clamp(this.previewPosition.width, Math.min(minWidth, w - 16), Math.max(240, w - 16))
    const normalHeight = clamp(this.previewPosition.height, Math.min(minHeight, h - 16), Math.max(270, h - 16))
    const height = mobile && this.quickView === "composer" && this.quickPanel && !this.quickPanel.hidden
      ? Math.min(normalHeight, Math.max(185, h - this.quickPanel.getBoundingClientRect().height - 115))
      : normalHeight
    this.previewPosition.width = width
    if (!mobile || this.quickView !== "composer") this.previewPosition.height = normalHeight
    if (!this.previewDetached) {
      const rect = this.quickView === "composer" && this.quickPanel && !this.quickPanel.hidden
        ? this.quickPanel.getBoundingClientRect() : this.root.getBoundingClientRect()
      const targetRight = rect.right + 12
      const targetLeft = rect.left - width - 12
      const x = targetRight + width + 8 <= w ? targetRight : targetLeft >= 8 ? targetLeft : (w - width) / 2
      const y = mobile ? 8 : rect.top
      this.previewPosition.x = x
      this.previewPosition.y = y
    }
    this.previewPosition.x = clamp(this.previewPosition.x, 8, Math.max(8, w - width - 8))
    this.previewPosition.y = clamp(this.previewPosition.y, 8, Math.max(8, h - height - 8))
    surface.style.left = `${Math.round(this.previewPosition.x)}px`
    surface.style.top = `${Math.round(this.previewPosition.y)}px`
    surface.style.width = `${Math.round(width)}px`
    surface.style.height = `${Math.round(height)}px`
  }

  private renderPreview(artwork: string, percentage: number, hasTotal: boolean): void {
    const surface = this.previewSurface
    if (!surface) return
    surface.dataset.state = this.state
    const img = surface.querySelector<HTMLImageElement>('[data-role="mini-easel-image"]')
    const empty = surface.querySelector<HTMLElement>('[data-role="mini-easel-empty"]')
    if (img && empty) {
      if (!artwork || img.dataset.failedSrc === artwork) {
        img.hidden = true
        empty.hidden = false
      } else {
        if (img.getAttribute("src") !== artwork) { img.dataset.failedSrc = ""; img.src = artwork }
        img.hidden = false
        empty.hidden = true
        img.onerror = () => { img.dataset.failedSrc = artwork; img.hidden = true; empty.hidden = false }
      }
    }
    const stage = surface.querySelector<HTMLElement>('[data-role="mini-easel-stage-label"]')
    if (stage) stage.textContent = this.state === "running" ? "GENERATION IN PROGRESS" : "LATEST RENDER"
    const stageCaption = surface.querySelector<HTMLElement>('[data-role="mini-easel-stage-caption"]')
    if (stageCaption) stageCaption.textContent = this.state === "running"
      ? "Showing the latest preview received from SwarmUI"
      : this.snapshotValue.latestImage ? "Latest completed artwork" : "Awaiting a completed image"
    const progress = surface.querySelector<HTMLElement>('[data-role="mini-easel-progress-label"]')
    if (progress) progress.textContent = this.state === "running"
      ? (hasTotal ? `${percentage}%` : "Working…")
      : this.state === "error" ? "Stopped" : this.state === "done" ? "Complete" : "Ready"
    const bar = surface.querySelector<HTMLElement>('[data-role="mini-easel-progress-bar"]')
    if (bar) bar.style.width = `${this.state === "running" && hasTotal ? percentage : this.state === "done" ? 100 : 0}%`
    surface.dataset.indeterminate = String(this.state === "running" && !hasTotal)
    const status = surface.querySelector<HTMLElement>('[data-role="mini-easel-status"]')
    if (status) { status.textContent = this.snapshotValue.status; status.title = this.snapshotValue.status }
    const append = surface.querySelector<HTMLButtonElement>('[data-action="easel-append"]')
    if (append) append.disabled = !this.quickCanAppend || !this.snapshotValue.latestImage?.id
    const generate = surface.querySelector<HTMLButtonElement>('[data-action="easel-generate"]')
    if (generate) {
      generate.disabled = !this.quickConfirm && !this.snapshotValue.active && !this.quickConnection
      generate.dataset.running = String(this.snapshotValue.active)
      const label = generate.querySelector<HTMLElement>('[data-role="mini-easel-generate-label"]')
      if (label) label.textContent = this.snapshotValue.active ? "Stop" : this.quickConfirm ? "Review" : "Generate"
    }
  }

  private inheritedQuickParameters(): Record<string, unknown> {
    const draft = this.getStudioDraft() || this.snapshotValue.draft
    const connection = this.quickConnections.find(candidate => String(candidate?.id || "") === String(draft?.connectionId || "")) || this.quickConnection
    return inheritQuickGenerationParameters(connection?.default_parameters || {}, draft?.details.parameters)
  }

  private showQuickSettings(visible: boolean): void {
    this.quickSettingsView = visible
    if (visible) {
      const params = { ...this.inheritedQuickParameters(), ...this.quickOverrides }
      for (const name of ["width", "height", "sampler", "steps", "cfgScale", "seed"]) {
        const input = this.queryMini<HTMLInputElement>(`[data-quick-param="${name}"]`)
        if (input) input.value = String(params[name] ?? (name === "seed" ? -1 : ""))
      }
      const width = Number(params.width)
      const height = Number(params.height)
      const aspect = this.queryMini<HTMLSelectElement>('[data-quick-param="aspect"]')
      if (aspect) {
        const match = Object.entries(ASPECT_PRESETS).find(([,dimensions]) => Math.abs(dimensions.width / dimensions.height - width / height) < .03)
        aspect.value = match?.[0] || "custom"
      }
      const suggestions = this.queryMini<HTMLDataListElement>('#ss-mini-sampler-suggestions')
      if (suggestions) {
        suggestions.replaceChildren()
        for (const sampler of new Set([String(params.sampler || ""), String(this.quickConnection?.default_parameters?.sampler || "")].filter(Boolean))) {
          const option = document.createElement("option"); option.value = sampler; suggestions.appendChild(option)
        }
      }
    }
    this.render()
  }

  private changeQuickAspect(): void {
    const aspect = this.queryMini<HTMLSelectElement>('[data-quick-param="aspect"]')?.value || "custom"
    if (aspect === "custom") return
    const preset = ASPECT_PRESETS[aspect]
    if (!preset) return
    const width = this.queryMini<HTMLInputElement>('[data-quick-param="width"]')
    const height = this.queryMini<HTMLInputElement>('[data-quick-param="height"]')
    if (width) width.value = String(preset.width)
    if (height) height.value = String(preset.height)
  }

  private saveQuickSettings(): void {
    const read = (key: string) => this.queryMini<HTMLInputElement>(`[data-quick-param="${key}"]`)?.value.trim() || ""
    const numeric = (key: string, fallback: number, min: number, max: number, quantum = 0) => {
      const parsed = Number(read(key))
      const value = Number.isFinite(parsed) && read(key) !== "" ? clamp(parsed, min, max) : fallback
      return quantum > 0 ? Math.round(value / quantum) * quantum : value
    }
    const inherited = this.inheritedQuickParameters()
    const seedRaw = read("seed")
    const seed = /^-?\d+$/.test(seedRaw) && Number.isSafeInteger(Number(seedRaw)) ? Number(seedRaw) : -1
    this.quickOverrides = {
      width: numeric("width", Number(inherited.width) || 1024, 64, 4096, 64),
      height: numeric("height", Number(inherited.height) || 1024, 64, 4096, 64),
      steps: Math.round(numeric("steps", Number(inherited.steps) || 20, 1, 150)),
      cfgScale: numeric("cfgScale", Number(inherited.cfgScale) || 7, 1, 30),
      seed,
      sampler: read("sampler"),
    }
    this.quickSettingsView = false
    this.snapshotValue.status = "Quick Create settings updated for the next render."
    this.render()
  }

  private installQuickPanelDrag(): void {
    const panel = this.quickPanel
    if (!panel) return
    try {
      const saved = JSON.parse(window.localStorage.getItem("swarm-studio-quick-position-v1") || "null")
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && saved.detached === true) {
        this.quickPosition = { x: saved.x, y: saved.y }; this.quickDetached = true
      }
    } catch { /* Fine without persistence. */ }
    panel.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement
      if (event.button !== 0 || !target.closest('[data-role="mini-quick-drag"]') || target.closest('button, input, select, textarea')) return
      event.preventDefault(); event.stopPropagation()
      const doc = this.root.ownerDocument
      const origin = { ...this.quickPosition }
      const bounds = panel.getBoundingClientRect()
      if (!this.quickDetached) { origin.x = bounds.left; origin.y = bounds.top }
      const start = { x: event.clientX, y: event.clientY }
      let moved = false
      const move = (next: PointerEvent) => {
        if (next.pointerId !== event.pointerId) return
        if (Math.hypot(next.clientX - start.x, next.clientY - start.y) < 3 && !moved) return
        moved = true
        this.quickDetached = true
        this.quickPosition = { x: origin.x + next.clientX - start.x, y: origin.y + next.clientY - start.y }
        this.positionQuickPanel()
      }
      const stop = (next: PointerEvent) => {
        if (next.pointerId !== event.pointerId) return
        doc.removeEventListener("pointermove", move, true)
        doc.removeEventListener("pointerup", stop, true)
        doc.removeEventListener("pointercancel", stop, true)
        if (moved) this.saveQuickPosition()
      }
      doc.addEventListener("pointermove", move, true)
      doc.addEventListener("pointerup", stop, true)
      doc.addEventListener("pointercancel", stop, true)
    })
  }

  private saveQuickPosition(): void {
    try { window.localStorage.setItem("swarm-studio-quick-position-v1", JSON.stringify({ ...this.quickPosition, detached: this.quickDetached })) }
    catch { /* Optional drag persistence. */ }
  }

  private queryMini<T extends Element>(selector: string): T | null {
    return this.root.querySelector<T>(selector) || this.quickPanel?.querySelector<T>(selector) || null
  }

  private positionQuickPanel(): void {
    const panel = this.quickPanel
    if (!panel || panel.hidden) return
    const viewport = this.root.ownerDocument.documentElement
    const w = viewport.clientWidth || window.innerWidth
    const h = viewport.clientHeight || window.innerHeight
    const rail = this.root.getBoundingClientRect()
    const width = panel.getBoundingClientRect().width || Math.min(370, w - 24)
    const height = panel.getBoundingClientRect().height || 500
    const margin = 12
    const right = rail.right + margin
    const left = rail.left - width - margin
    const fitsLeft = left >= 8
    const fitsRight = right + width + 8 <= w
    const openOnLeft = fitsLeft && (!fitsRight || (w > 720 && rail.left >= w / 2))
    const anchoredX = openOnLeft ? left : fitsRight ? right : (w - width) / 2
    const x = this.quickDetached ? this.quickPosition.x : anchoredX
    const y = this.quickDetached ? this.quickPosition.y : w <= 720 ? Math.max(8, h - height - 86) : rail.top
    const finalX = clamp(x, 8, Math.max(8, w - width - 8))
    const finalY = clamp(y, 8, Math.max(8, h - height - 8))
    panel.style.left = `${Math.round(finalX)}px`
    panel.style.top = `${Math.round(finalY)}px`
    if (this.quickDetached) { this.quickPosition.x = finalX; this.quickPosition.y = finalY }
  }

  private resizeWidget(): void {
    const compact = this.collapsed
    const viewportWidth = this.root.ownerDocument.documentElement.clientWidth || window.innerWidth
    // The native float owns only the orb/toolkit. Quick Create and Preview are
    // separate portals so neither enlarges Lumi's draggable hitbox.
    const mobileRail = this.isMobileViewport()
    const width = compact ? 64 : (mobileRail ? Math.min(262, viewportWidth - 16) : 54)
    const viewportHeight = this.root.ownerDocument.documentElement.clientHeight || window.innerHeight
    // The detached Quick Create panel shrinks together with its disclosure.
    // The original orb/toolkit float remains the same size throughout.
    const expandedComposerHeight = Math.min(520, Math.max(300, viewportHeight - 86))
    const collapsedComposerHeight = Math.min(390, Math.max(300, expandedComposerHeight - 125))
    const height = compact ? 64 : (mobileRail ? 48 : 294)
    if (this.quickPanel) {
      this.quickPanel.style.width = `${Math.min(370, viewportWidth - 24)}px`
      const pairedMobilePreview = mobileRail && this.previewVisible && this.quickView === "composer"
      this.quickPanel.style.height = `${pairedMobilePreview ? Math.min(360, Math.max(275, viewportHeight * .43)) : this.negativeExpanded ? expandedComposerHeight : collapsedComposerHeight}px`
      this.quickPanel.hidden = compact || this.quickView !== "composer" || this.studioOpen || !this.behavior.widgetEnabled
    }
    this.expectedWidth = width
    this.expectedHeight = height
    this.applyWidgetSize(width, height)
    this.positionQuickPanel()
    this.positionPreview()
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
    mini.dataset.quickView = this.quickView
    mini.dataset.pinned = String(this.stripPinned)
    const pin = this.root.querySelector<HTMLButtonElement>('[data-action="mini-toggle-pin"]')
    if (pin) { pin.setAttribute("aria-pressed", String(this.stripPinned)); pin.title = this.stripPinned ? "Unpin toolkit" : "Pin toolkit open"; pin.setAttribute("aria-label", pin.title) }
    if (this.quickPanel) {
      this.quickPanel.dataset.screen = this.quickSettingsView ? "settings" : "compose"
      const settings = this.quickPanel.querySelector<HTMLElement>('[data-role="mini-settings-screen"]')
      const settingsActions = this.quickPanel.querySelector<HTMLElement>('[data-role="mini-settings-actions"]')
      if (settings) settings.hidden = !this.quickSettingsView
      if (settingsActions) settingsActions.hidden = !this.quickSettingsView
      const headerTitle = this.quickPanel.querySelector<HTMLElement>('[data-role="mini-quick-title"]')
      if (headerTitle) headerTitle.textContent = this.quickSettingsView ? "Render settings" : "Quick Create"
      const settingsButton = this.quickPanel.querySelector<HTMLButtonElement>('[data-action="mini-settings"]')
      if (settingsButton) { settingsButton.setAttribute("aria-pressed", String(this.quickSettingsView)); settingsButton.title = this.quickSettingsView ? "Back to prompt" : "Generation settings" }
      this.quickPanel.dataset.negativeOpen = String(this.negativeExpanded)
      this.quickPanel.hidden = this.collapsed || this.quickView !== "composer" || this.studioOpen || !this.behavior.widgetEnabled
    }
    if (this.previewSurface) this.previewSurface.hidden = this.collapsed || !this.previewVisible || this.studioOpen || !this.behavior.widgetEnabled
    mini.dataset.railLayout = this.isMobileViewport() ? "horizontal" : "vertical"
    this.root.querySelectorAll<HTMLButtonElement>('[data-action="mini-toggle-preview"]').forEach((button) => {
      button.setAttribute("aria-pressed", String(this.previewVisible))
      button.dataset.active = String(this.previewVisible)
    })
    if (this.collapsed) {
      mini.dataset.action = "mini-open"
      mini.setAttribute("role", "button")
      mini.tabIndex = 0
      mini.setAttribute("aria-label", "Open toolkit")
    } else {
      delete mini.dataset.action
      mini.removeAttribute("role")
      mini.removeAttribute("tabindex")
      mini.removeAttribute("aria-label")
    }
    mini.dataset.indeterminate = String(this.state === "running" && !hasTotal)
    mini.style.setProperty("--ss-mini-progress", `${percentage}%`)
    const labels = { idle: "Ready", running: "Live", done: "Done", error: "Stopped" }
    const stateLabel = this.root.querySelector<HTMLElement>('[data-role="mini-state"]')
    const statusLabel = this.root.querySelector<HTMLElement>('[data-role="mini-status"]')
    if (stateLabel) stateLabel.textContent = labels[this.state]
    if (statusLabel) statusLabel.textContent = this.snapshotValue.status
    const image = this.root.querySelector<HTMLImageElement>('[data-role="mini-image"]')!
    const placeholder = this.root.querySelector<HTMLElement>('[data-role="mini-placeholder"]')!
    const artwork = this.snapshotValue.preview || this.characterAvatarUrl
    const renderArtwork = (img: HTMLImageElement | null, fallback: HTMLElement | null) => {
      if (!img || !fallback) return
      if (!artwork || img.dataset.failedSrc === artwork) { img.hidden = true; fallback.hidden = false; return }
      if (img.getAttribute("src") !== artwork) { img.dataset.failedSrc = ""; img.src = artwork }
      img.hidden = false
      fallback.hidden = true
      img.onerror = () => { img.dataset.failedSrc = artwork; img.hidden = true; fallback.hidden = false }
    }
    renderArtwork(image, placeholder)
    renderArtwork(this.queryMini<HTMLImageElement>('[data-role="mini-compose-image"]'), this.queryMini<HTMLElement>('[data-role="mini-compose-placeholder"]'))
    this.renderPreview(artwork, percentage, hasTotal)
    mini.dataset.negativeOpen = String(this.negativeExpanded)
    const toggleNegative = this.queryMini<HTMLButtonElement>('[data-action="mini-toggle-negative"]')
    if (toggleNegative) toggleNegative.setAttribute("aria-expanded", String(this.negativeExpanded))
    const negativeLabel = this.queryMini<HTMLElement>('[data-role="mini-negative-label"]')
    if (negativeLabel) negativeLabel.textContent = this.negativeExpanded ? "Hide negative prompt" : "Negative prompt"
    for (const append of [...this.root.querySelectorAll<HTMLButtonElement>('[data-action="mini-append"]'), ...this.quickPanel?.querySelectorAll<HTMLButtonElement>('[data-action="mini-append"]') || []]) {
      append.disabled = !this.quickCanAppend || !this.snapshotValue.latestImage?.id
    }
    const quickButton = this.queryMini<HTMLButtonElement>('[data-action="mini-generate"]')
    if (quickButton) {
      quickButton.disabled = !this.quickConfirm && !this.snapshotValue.active && !this.quickConnection
      quickButton.dataset.running = String(this.snapshotValue.active)
      const text = quickButton.querySelector<HTMLElement>('[data-role="mini-generate-label"]')
      if (text) text.textContent = this.snapshotValue.active
        ? "Stop generation"
        : this.quickConfirm ? "Confirm" : "Generate image"
    }
    const connection = this.queryMini<HTMLElement>('[data-role="mini-connection"]')
    if (connection) {
      const activeConnection = this.quickConnections.find((candidate) =>
        String(candidate?.id || "") === String(this.snapshotValue.draft?.connectionId || ""),
      ) || this.quickConnection
      const modelId = String(this.snapshotValue.draft?.details.model || activeConnection?.model || "").trim()
      const friendlyModel = this.quickModelLabels.get(modelId.toLowerCase()) || ""
      connection.textContent = friendlyModel
        || (activeConnection ? String(activeConnection.name || "SwarmUI") : "No Lumiverse SwarmUI connection found")
      const modelLabel = this.previewSurface?.querySelector<HTMLElement>('[data-role="mini-easel-model"]')
      if (modelLabel) modelLabel.textContent = connection.textContent
    }
  }
}
