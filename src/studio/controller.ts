class StudioController {
  private readonly ctx: FrontendContext
  private readonly modal: any
  private readonly root: HTMLElement
  private readonly activity: MiniPlayerController | null
  private readonly onThemeChange: (theme: StudioTheme) => void
  private readonly onAppearanceChange: (appearance: StudioAppearance) => void
  private readonly onBehaviorChange: (behavior: StudioBehavior) => void
  private appearance = defaultStudioAppearance()
  private behavior: StudioBehavior
  private appearanceControlsInitialized = false
  private readonly state: StudioState
  private previewObserver: IntersectionObserver | null = null
  private readonly previewCache = new Map<string, string>()
  private readonly requestedPreviews = new Set<string>()
  private connectionRequestId = ""
  private workflowRequestId = ""
  private generating = false
  private currentJobId = ""
  private currentJobConnectionId = ""
  private currentJobSource: "manual" | "tagged" | "" = ""
  private readonly activeTaggedJobs = new Map<string, any>()
  private readonly activeTaggedAttempts = new Map<string, string>()
  private readonly settledGenerationJobIds = new Set<string>()
  private readonly settledTaggedJobIds = new Set<string>()
  private progressStep = 0
  private pendingDraftRestore: StudioDraft | null = null
  private pendingTaggedPrompt: { prompt: string; negativePrompt: string } | null = null
  private pendingWorkflowRestore: WorkflowDraft | null = null
  private workflowOpenOnLoad = true
  private readonly workflowValues = new Map<string, unknown>()
  private readonly workflowEnabled = new Set<string>()
  private readonly workflowImageValues = new Map<string, string>()
  private pendingGeneration: GenerationDetails | null = null
  private preGenerationImage: CurrentImage | null = null
  private imageScale = 1
  private previewAspect = 1
  private libraryFolderId = "__landing__"
  private libraryPage = 0
  private readonly librarySelection = new Set<string>()
  private librarySelectionAnchorId = ""
  private librarySearchOpen = false
  private librarySelectionMode = false
  private librarySelectOnlyNonStarred = false
  private libraryVisualMode: "profile" | "look" = "profile"
  private libraryLookId = ""
  private parserModelRequestId = ""
  private hydratedVisualCharacterId = ""
  private pendingCreatedFolder: { name: string; bindingType: "unbound" | "character" } | null = null
  private missingLoras: StackPresetItem[] = []
  private loraDownloadRequestId = ""
  private loraDownloadJobId = ""
  private loraDownloadActive = false
  private handledLoraDownloadJobId = ""
  private selectedLoraFolder: string | null = null
  private loraFoldersOpen = false
  private pendingPresetParamMap: Record<string, string> = {}
  private pendingMoveImageIds: string[] = []
  private outputMetadataRequestId = ""
  private pendingMetadataAction: "reuse" | "init" | "" = ""
  private outputResizeObserver: ResizeObserver | null = null
  private inspectorResizeObserver: ResizeObserver | null = null
  private stopActiveResize: (() => void) | null = null
  private profileSyncTimer: ReturnType<typeof setTimeout> | null = null
  private disposed = false
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    const loraSortMenu = this.root.querySelector<HTMLElement>('[data-role="lora-sort-menu"]')
    if (loraSortMenu && !loraSortMenu.hidden) {
      this.closeLoraSortMenu()
      event.stopPropagation()
      return
    }
    const loraFolderSidebar = this.root.querySelector<HTMLElement>('[data-role="lora-folder-sidebar"]')
    if (loraFolderSidebar && !loraFolderSidebar.hidden && window.matchMedia("(max-width: 720px)").matches) {
      this.toggleLoraFolders(false)
      event.stopPropagation()
      return
    }
    const config = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    if (config && !config.hidden) {
      this.closeConfigPopover()
      event.stopPropagation()
      return
    }
    const newFolder = this.root.querySelector<HTMLElement>('[data-role="new-folder-modal"]')
    if (newFolder && !newFolder.hidden) {
      this.closeNewFolderModal()
      event.stopPropagation()
      return
    }
    const inspector = this.root.querySelector<HTMLElement>('[data-role="inspector"]')
    const workflow = this.root.querySelector<HTMLElement>('[data-role="workflow-modal"]')
    if (workflow && !workflow.hidden) {
      this.closeWorkflowSetup()
      event.stopPropagation()
      return
    }
    const savePreset = this.root.querySelector<HTMLElement>('[data-role="save-preset-modal"]')
    if (savePreset && !savePreset.hidden) {
      this.closeSavePresetModal()
      event.stopPropagation()
      return
    }
    const presetManager = this.root.querySelector<HTMLElement>('[data-role="preset-manager-modal"]')
    if (presetManager && !presetManager.hidden) {
      this.closePresetManager()
      event.stopPropagation()
      return
    }
    const moveFolder = this.root.querySelector<HTMLElement>('[data-role="move-folder-modal"]')
    if (moveFolder && !moveFolder.hidden) {
      this.closeMoveFolderModal()
      event.stopPropagation()
      return
    }
    if (inspector && !inspector.hidden) {
      this.closeInspector()
      event.stopPropagation()
      return
    }
    const library = this.root.querySelector<HTMLElement>('[data-role="output-library"]')
    if (library && !library.hidden) {
      this.closeOutputLibrary()
      event.stopPropagation()
      return
    }
    const missingLoras = this.root.querySelector<HTMLElement>('[data-role="missing-lora-modal"]')
    if (missingLoras && !missingLoras.hidden) {
      this.closeMissingLoras()
      event.stopPropagation()
      return
    }
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell?.classList.contains("ss-fullscreen-layer")) {
      this.toggleFullscreen(false)
      event.stopPropagation()
    }
  }

  constructor(
    ctx: FrontendContext,
    modal: any,
    onThemeChange: (theme: StudioTheme) => void,
    onAppearanceChange: (appearance: StudioAppearance) => void,
    behavior: StudioBehavior,
    onBehaviorChange: (behavior: StudioBehavior) => void,
    activity: MiniPlayerController | null = null,
  ) {
    this.ctx = ctx
    this.modal = modal
    this.root = modal.root
    this.activity = activity
    this.onThemeChange = onThemeChange
    this.onAppearanceChange = onAppearanceChange
    this.behavior = { ...behavior }
    this.onBehaviorChange = onBehaviorChange
    this.state = {
      connections: [],
      parserConnections: [],
      parserModels: [],
      connection: null,
      models: [],
      checkpoints: [],
      loras: [],
      stack: [],
      stackPresets: [],
      swarmPresets: [],
      swarmParameters: [],
      swarmWorkflows: [],
      workflowError: "",
      selectedWorkflow: null,
      canManagePresets: false,
      selectedPresets: [],
      samplers: [],
      schedulers: [],
      outputs: [],
      outputTotal: 0,
      outputOffset: 0,
      outputLimit: 12,
      outputFolders: [],
      libraryOutputs: [],
      activeChat: null,
      permissions: {},
      hasMetadataToken: false,
      currentImage: null,
      initImage: null,
      characterBaseTags: {
        characterId: "",
        characterName: "",
        tags: "",
        source: "none",
      },
      chatVisuals: null,
    }
    this.buildV3()
    this.restoreWorkspaceState()
    this.bind()
    if (typeof ResizeObserver !== "undefined") {
      this.outputResizeObserver = new ResizeObserver(() => this.fitPreviewToAspect())
      this.outputResizeObserver.observe(this.get<HTMLElement>('[data-role="output-stage"]'))
      this.inspectorResizeObserver = new ResizeObserver(() => this.fitInspectorToSpace())
      this.inspectorResizeObserver.observe(this.get<HTMLElement>('[data-role="inspector-stage"]'))
    }
    document.addEventListener("keydown", this.handleKeyDown, true)
    this.setRunStatus("Loading Lumiverse connections…")
    const activitySnapshot = this.activity?.snapshot()
    this.pendingDraftRestore = activitySnapshot?.draft || null
    if (activitySnapshot?.latestImage) this.setCurrentImage(activitySnapshot.latestImage)
    if (activitySnapshot?.active) {
      this.generating = true
      this.currentJobId = activitySnapshot.jobId
      this.currentJobConnectionId = activitySnapshot.connectionId
      this.setGenerating(true)
      if (activitySnapshot.preview) {
        this.showLivePreview(activitySnapshot.preview, activitySnapshot.step, activitySnapshot.totalSteps)
      } else {
        this.updateGenerationProgress(activitySnapshot.step, activitySnapshot.totalSteps)
      }
    }
    this.send("bootstrap")
    this.send("get_lora_download_status")
  }

  dispose(): void {
    this.persistWorkspaceState()
    this.syncStudioProfile()
    this.disposed = true
    if (this.profileSyncTimer) clearTimeout(this.profileSyncTimer)
    this.profileSyncTimer = null
    this.previewObserver?.disconnect()
    this.previewObserver = null
    this.outputResizeObserver?.disconnect()
    this.outputResizeObserver = null
    this.inspectorResizeObserver?.disconnect()
    this.inspectorResizeObserver = null
    this.stopActiveResize?.()
    this.stopActiveResize = null
    document.removeEventListener("keydown", this.handleKeyDown, true)
  }

  setTheme(theme: StudioTheme): void {
    this.root.classList.add("ss-modal-theme")
    this.root.dataset.theme = theme
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell) shell.dataset.theme = theme
    for (const button of this.root.querySelectorAll<HTMLElement>('[data-action="set-theme"]')) {
      button.dataset.active = String(button.dataset.themeValue === theme)
    }
    this.syncAppearanceControls()
  }

  setAppearance(appearance: StudioAppearance): void {
    this.appearance = cloneStudioAppearance(appearance)
    applyAppearanceVariables(this.root, appearance)
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (shell) applyAppearanceVariables(shell, appearance)
    this.syncAppearanceControls()
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
    const toast = this.root.querySelector<HTMLInputElement>('[data-role="completion-toast"]')
    if (toast) toast.checked = this.behavior.completionToast
    const widgetEnabled = this.root.querySelector<HTMLInputElement>('[data-role="widget-enabled"]')
    if (widgetEnabled) widgetEnabled.checked = this.behavior.widgetEnabled
    const mobileQuickCreate = this.root.querySelector<HTMLInputElement>('[data-role="mobile-quick-create"]')
    if (mobileQuickCreate) mobileQuickCreate.checked = this.behavior.mobileQuickCreate
    const tagAutoGenerate = this.root.querySelector<HTMLInputElement>('[data-role="tag-auto-generate"]')
    if (tagAutoGenerate) tagAutoGenerate.checked = this.behavior.tagAutoGenerate
    const tagPromptInjection = this.root.querySelector<HTMLInputElement>('[data-role="tag-prompt-injection"]')
    if (tagPromptInjection) tagPromptInjection.checked = this.behavior.tagPromptInjection
    const protocolPrompt = this.root.querySelector<HTMLTextAreaElement>('[data-role="tag-protocol-prompt"]')
    if (protocolPrompt && document.activeElement !== protocolPrompt) {
      protocolPrompt.value = this.behavior.protocolPrompt || DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT
    }
    const parserConnection = this.root.querySelector<HTMLSelectElement>('[data-role="parser-connection"]')
    if (parserConnection) parserConnection.value = this.behavior.parserConnectionId
    const parserModel = this.root.querySelector<HTMLInputElement>('[data-role="parser-model"]')
    if (parserModel && document.activeElement !== parserModel) parserModel.value = this.behavior.parserModel
    for (const button of this.root.querySelectorAll<HTMLElement>('[data-action="set-request-mode"]')) {
      button.dataset.active = String(button.dataset.requestMode === this.behavior.requestMode)
    }
    const parserSettings = this.root.querySelector<HTMLElement>('[data-role="parser-settings"]')
    if (parserSettings) parserSettings.hidden = this.behavior.requestMode !== "parser"
    const stripUserOnlyLoraStack = this.root.querySelector<HTMLInputElement>('[data-role="strip-user-only-lora-stack"]')
    if (stripUserOnlyLoraStack) stripUserOnlyLoraStack.checked = this.behavior.stripUserOnlyLoraStack
    const autoPrintCharacterPositive = this.root.querySelector<HTMLInputElement>('[data-role="auto-print-character-positive"]')
    if (autoPrintCharacterPositive) autoPrintCharacterPositive.checked = this.behavior.autoPrintCharacterPositive
    for (const button of this.root.querySelectorAll<HTMLElement>('[data-action="set-inline-image-scale"]')) {
      button.dataset.active = String(Number(button.dataset.scale) === this.behavior.inlineImageScale)
    }
    const requiredImageMin = this.root.querySelector<HTMLInputElement>('[data-role="required-image-min"]')
    if (requiredImageMin) requiredImageMin.value = String(this.behavior.requiredImageMin)
    const requiredImageMax = this.root.querySelector<HTMLInputElement>('[data-role="required-image-max"]')
    if (requiredImageMax) requiredImageMax.value = String(this.behavior.requiredImageMax)
    const tagPromptMode = this.root.querySelector<HTMLSelectElement>('[data-role="tag-prompt-mode"]')
    if (tagPromptMode) tagPromptMode.value = this.behavior.tagPromptMode
  }

  private renderParserConnections(): void {
    const select = this.root.querySelector<HTMLSelectElement>('[data-role="parser-connection"]')
    const summary = this.root.querySelector<HTMLElement>('[data-role="parser-connection-summary"]')
    if (!select) return
    const current = this.behavior.parserConnectionId
    select.replaceChildren()
    const placeholder = document.createElement("option")
    placeholder.value = ""
    placeholder.textContent = this.state.permissions.generation
      ? "Use Lumiverse default connection"
      : "Generation permission required"
    select.appendChild(placeholder)
    for (const connection of this.state.parserConnections) {
      const option = document.createElement("option")
      option.value = String(connection?.id || "")
      const provider = String(connection?.provider || "").trim()
      option.textContent = [String(connection?.name || "Unnamed connection"), provider].filter(Boolean).join(" · ")
      select.appendChild(option)
    }
    select.disabled = !this.state.permissions.generation || !this.state.parserConnections.length
    select.value = this.state.parserConnections.some((connection) => String(connection?.id || "") === current)
      ? current
      : ""
    const selected = this.state.parserConnections.find((connection) =>
      String(connection?.id || "") === (select.value || current),
    ) || this.state.parserConnections.find((connection) => connection?.is_default) || this.state.parserConnections[0]
    if (summary) {
      summary.textContent = selected
        ? `Connection model: ${String(selected?.model || "not specified")}${selected?.is_default ? " · Lumiverse default" : ""}`
        : this.state.permissions.generation
          ? "No Lumiverse text connections are available."
          : "Grant Generation permission in Extensions, then restart Swarm Studio."
    }
    this.renderParserModels()
  }

  private selectedParserConnectionId(): string {
    const selected = this.state.parserConnections.find((connection) =>
      String(connection?.id || "") === this.behavior.parserConnectionId,
    ) || this.state.parserConnections.find((connection) => connection?.is_default) || this.state.parserConnections[0]
    return String(selected?.id || "")
  }

  private renderParserModels(): void {
    const list = this.root.querySelector<HTMLDataListElement>('[data-role="parser-model-options"]')
    if (!list) return
    list.replaceChildren()
    for (const model of this.state.parserModels) {
      const option = document.createElement("option")
      option.value = model.id
      option.label = model.label || model.id
      list.appendChild(option)
    }
  }

  private loadParserModels(): void {
    const connectionId = this.selectedParserConnectionId()
    this.state.parserModels = []
    this.renderParserModels()
    if (!connectionId || !this.state.permissions.generation) return
    this.parserModelRequestId = this.send("list_parser_models", { connectionId })
  }

  exportDraft(): StudioDraft | null {
    if (!this.state.connection) return this.pendingDraftRestore
    let rawRequestOverride: string | undefined
    try {
      rawRequestOverride = this.buildRawOverride()
    } catch {
      rawRequestOverride = this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value.trim() || undefined
    }
    const enabled = this.effectiveStack().filter((item) => item.enabled)
    const parameters = this.collectGenerationParameters(rawRequestOverride, enabled)
    const prompt = this.finalPrompt()
    const negativePrompt = this.finalNegativePrompt()
    const model = this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model
    const resolved = this.resolvedPrompts()
    return {
      connectionId: String(this.state.connection.id || ""),
      details: {
        prompt,
        negativePrompt,
        resolvedPrompt: resolved.prompt,
        resolvedNegativePrompt: resolved.negativePrompt,
        model,
        parameters,
        loras: enabled.map((item) => ({ name: item.lora.name, weight: item.weight })),
        presets: resolved.presets,
        workflow: this.state.selectedWorkflow?.name || "",
        initImageId: this.state.initImage?.imageId || "",
        initImageLabel: this.state.initImage?.label || "",
        createdAt: Date.now(),
      },
      stack: this.state.stack.map((item) => ({
        name: item.lora.name,
        title: item.lora.title,
        weight: item.weight,
        enabled: item.enabled,
        useTrigger: item.useTrigger,
      })),
      selectedPresets: this.state.selectedPresets.map((preset) => ({ ...preset })),
      workflow: this.state.selectedWorkflow ? {
        name: this.state.selectedWorkflow.name,
        values: Object.fromEntries(this.workflowValues),
        enabled: [...this.workflowEnabled],
        images: Object.fromEntries(this.workflowImageValues),
      } : null,
      initImage: this.state.initImage ? { ...this.state.initImage } : null,
    }
  }

  loadTaggedPrompt(prompt: string, negativePrompt = ""): void {
    this.pendingTaggedPrompt = { prompt, negativePrompt }
    this.applyPendingTaggedPrompt()
  }

  private applyPendingTaggedPrompt(): void {
    if (!this.pendingTaggedPrompt) return
    const { prompt, negativePrompt } = this.pendingTaggedPrompt
    const positive = this.root.querySelector<HTMLTextAreaElement>('[data-role="positive"]')
    const negative = this.root.querySelector<HTMLTextAreaElement>('[data-role="negative"]')
    if (positive) positive.value = prompt
    if (negative && negativePrompt) negative.value = negativePrompt
    if (this.state.connection) this.pendingTaggedPrompt = null
    this.scheduleStudioProfileSync()
    this.setRunStatus("Loaded the tagged scene into Studio.")
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
  }

  private scheduleStudioProfileSync(): void {
    if (this.disposed) return
    if (this.profileSyncTimer) clearTimeout(this.profileSyncTimer)
    this.profileSyncTimer = setTimeout(() => {
      this.profileSyncTimer = null
      this.syncStudioProfile()
    }, 450)
  }

  private syncStudioProfile(): void {
    const draft = this.exportDraft()
    if (!draft) return
    const parameters = this.baseStudioProfileParameters(
      typeof draft.details.parameters.rawRequestOverride === "string"
        ? draft.details.parameters.rawRequestOverride
        : undefined,
    )
    if (typeof parameters.rawRequestOverride === "string") {
      try {
        const override = JSON.parse(parameters.rawRequestOverride)
        for (const [key, value] of Object.entries(override)) {
          if (
            (typeof value === "string" && value.startsWith("data:image/"))
            || /(?:init|reference).*image|image.*(?:init|reference)/i.test(key)
          ) delete override[key]
        }
        parameters.rawRequestOverride = JSON.stringify(override)
      } catch {
        delete parameters.rawRequestOverride
      }
    }
    this.send("sync_studio_profile", {
      input: {
        prompt: this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim(),
        negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim(),
        connection_id: draft.connectionId,
        model: draft.details.model,
        parameters,
      },
      recordHints: {
        resolvedPrompt: draft.details.resolvedPrompt,
        resolvedNegativePrompt: draft.details.resolvedNegativePrompt,
        presets: draft.details.presets,
        workflow: draft.details.workflow,
        stack: draft.stack,
      },
    })
  }

  private syncAppearanceControls(): void {
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (!shell) return
    const panel = this.root.querySelector<HTMLElement>(".ss-generation-pane")
    const header = this.root.querySelector<HTMLElement>(".ss-pane-head")
    const button = this.root.querySelector<HTMLElement>(".ss-button:not(.ss-button-primary)")
    const fallbackColors: Record<AppearanceColorKey, string> = {
      accent: "#7dd3fc",
      canvas: "#090a0d",
      panel: "#14151a",
      header: "#1b1d24",
      outline: "#343640",
      button: "#191b21",
      text: "#f4f5f7",
    }
    const sampledColors: Record<AppearanceColorKey, string | null> = {
      accent: normalizeHexColor(getComputedStyle(shell).getPropertyValue("--lumiverse-accent")),
      canvas: normalizeHexColor(getComputedStyle(shell).backgroundColor),
      panel: panel ? normalizeHexColor(getComputedStyle(panel).backgroundColor) : null,
      header: header ? normalizeHexColor(getComputedStyle(header).backgroundColor) : null,
      outline: panel ? normalizeHexColor(getComputedStyle(panel).borderTopColor) : null,
      button: button ? normalizeHexColor(getComputedStyle(button).backgroundColor) : null,
      text: normalizeHexColor(getComputedStyle(shell).color),
    }
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="appearance-color"]')) {
      const key = input.dataset.colorKey as AppearanceColorKey
      input.value = this.appearance.colors[key] || sampledColors[key] || fallbackColors[key]
      input.dataset.overridden = String(Boolean(this.appearance.colors[key]))
      input.closest<HTMLElement>(".ss-color-control")!.title = this.appearance.colors[key]
        ? `${key} override · ${input.value}`
        : `${key} inherited from the active profile · ${input.value}`
    }

    const radius = this.get<HTMLInputElement>('[data-role="appearance-radius"]')
    const inheritedRadius = Number.parseFloat(getComputedStyle(button || shell).borderRadius) || 8
    radius.value = String(this.appearance.radius ?? clamp(inheritedRadius, 0, 28))
    this.get<HTMLOutputElement>('[data-role="appearance-radius-output"]').value =
      this.appearance.radius === null ? `${Math.round(inheritedRadius)}px*` : `${Math.round(this.appearance.radius)}px`
    const opacity = this.get<HTMLInputElement>('[data-role="appearance-opacity"]')
    opacity.value = String(this.appearance.opacity)
    this.get<HTMLOutputElement>('[data-role="appearance-opacity-output"]').value = `${Math.round(this.appearance.opacity)}%`
    const blur = this.get<HTMLInputElement>('[data-role="appearance-blur"]')
    blur.value = String(this.appearance.blur)
    this.get<HTMLOutputElement>('[data-role="appearance-blur-output"]').value = `${Math.round(this.appearance.blur)}px`
    if (!this.appearanceControlsInitialized) {
      this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = this.appearance.customCss
      this.appearanceControlsInitialized = true
    }
  }

  openLibrary(): void {
    this.openOutputLibrary()
  }

  private get<T extends HTMLElement>(selector: string): T {
    const found = this.root.querySelector(selector)
    if (!found) throw new Error(`Swarm Studio UI element missing: ${selector}`)
    return found as T
  }

  private build(): void {
    this.root.innerHTML = `
      <div class="ss-shell">
        <div class="ss-topbar">
          <div class="ss-connection-wrap">
            <select class="ss-select ss-connection" data-role="connection" aria-label="SwarmUI connection">
              <option value="">Loading SwarmUI connections…</option>
            </select>
          </div>
          <button class="ss-button" data-action="refresh-metadata" title="Rescan LoRAs and their metadata">Refresh metadata</button>
          <div class="ss-token-wrap">
            <button class="ss-button" data-action="toggle-token" aria-expanded="false">Metadata token</button>
            <div class="ss-token-popover" data-role="token-popover" hidden>
              <p>Lumiverse keeps the connection secret private from extensions. If SwarmUI authentication is enabled, save the same <code>swarm_token</code> here for metadata and preview requests only. It is stored in Lumiverse's encrypted enclave.</p>
              <div class="ss-token-row">
                <input class="ss-input" data-role="metadata-token" type="password" autocomplete="off" placeholder="swarm_token value" />
                <button class="ss-button ss-button-primary" data-action="save-token">Save</button>
                <button class="ss-button ss-button-danger" data-action="clear-token">Clear</button>
              </div>
              <div class="ss-field-help" data-role="token-status">No extension metadata token saved.</div>
            </div>
          </div>
        </div>

        <div class="ss-permission-banner" data-role="permission-banner"></div>

        <div class="ss-workspace">
          <div class="ss-editor">
            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>Prompt</strong><span class="ss-muted ss-tiny">Trigger phrases can be inherited from the LoRA stack</span></div>
              </div>
              <div class="ss-prompt-grid">
                <div class="ss-field">
                  <label for="ss-positive">Positive</label>
                  <textarea id="ss-positive" class="ss-textarea" data-role="positive" placeholder="Describe the image…"></textarea>
                  <div class="ss-field-help" data-role="trigger-summary">No inherited trigger phrases.</div>
                </div>
                <div class="ss-field">
                  <label for="ss-negative">Negative</label>
                  <textarea id="ss-negative" class="ss-textarea" data-role="negative" placeholder="What should not appear…"></textarea>
                  <div class="ss-field-help">Passed through Lumiverse's SwarmUI provider.</div>
                </div>
              </div>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>Generation</strong><span class="ss-muted ss-tiny">Connection defaults are loaded first</span></div>
              </div>
              <div class="ss-controls-grid">
                <div class="ss-field ss-model-field">
                  <label>Checkpoint</label>
                  <select class="ss-select" data-role="model"><option value="">Select a connection first</option></select>
                </div>
                <div class="ss-field">
                  <label>Width</label>
                  <input class="ss-input" data-role="width" type="number" min="64" max="4096" step="64" value="1024" />
                </div>
                <div class="ss-field">
                  <label>Height</label>
                  <input class="ss-input" data-role="height" type="number" min="64" max="4096" step="64" value="1024" />
                </div>
                <div class="ss-field">
                  <label>Steps</label>
                  <input class="ss-input" data-role="steps" type="number" min="1" max="150" step="1" value="20" />
                </div>
                <div class="ss-field">
                  <label>CFG</label>
                  <input class="ss-input" data-role="cfg" type="number" min="1" max="30" step="0.5" value="7" />
                </div>
                <div class="ss-field">
                  <label>Seed</label>
                  <input class="ss-input" data-role="seed" type="number" step="1" value="-1" title="-1 uses a random seed" />
                </div>
                <div class="ss-field ss-sampler-field">
                  <label>Sampler</label>
                  <input class="ss-input" data-role="sampler" list="ss-samplers" placeholder="Connection default" />
                  <datalist id="ss-samplers">
                    <option value="euler"></option><option value="euler_ancestral"></option>
                    <option value="dpmpp_2m"></option><option value="dpmpp_2m_sde"></option>
                    <option value="dpmpp_3m_sde"></option><option value="uni_pc"></option>
                  </datalist>
                </div>
                <div class="ss-field ss-scheduler-field">
                  <label>Scheduler</label>
                  <input class="ss-input" data-role="scheduler" list="ss-schedulers" placeholder="Connection default" />
                  <datalist id="ss-schedulers">
                    <option value="normal"></option><option value="karras"></option>
                    <option value="exponential"></option><option value="sgm_uniform"></option>
                    <option value="simple"></option><option value="ddim_uniform"></option>
                  </datalist>
                </div>
                <div class="ss-inline-actions">
                  <button class="ss-icon-button" data-action="swap-size" title="Swap width and height" aria-label="Swap width and height">↔</button>
                  <button class="ss-icon-button" data-action="random-seed" title="Use a random seed" aria-label="Use random seed">✦</button>
                </div>
              </div>
              <details class="ss-advanced">
                <summary>Advanced Swarm controls</summary>
                <div class="ss-advanced-grid">
                  <div class="ss-field">
                    <label>Swarm preset(s)</label>
                    <input class="ss-input" data-role="presets" placeholder="portrait, cinematic" />
                  </div>
                  <div class="ss-field">
                    <label>VAE override</label>
                    <input class="ss-input" data-role="vae" placeholder="Built-in/default" />
                  </div>
                  <div class="ss-field">
                    <label>UNet override</label>
                    <input class="ss-input" data-role="unet" placeholder="Use checkpoint" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-L</label>
                    <input class="ss-input" data-role="clip-l" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-G</label>
                    <input class="ss-input" data-role="clip-g" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field">
                    <label>T5-XXL</label>
                    <input class="ss-input" data-role="t5" placeholder="Optional text encoder" />
                  </div>
                  <div class="ss-field ss-wide">
                    <label>Raw request override (JSON)</label>
                    <textarea class="ss-textarea" data-role="raw-override" spellcheck="false" placeholder='{"refinerupscale": 1.25, "refinermethod": "PostApply"}'></textarea>
                    <div class="ss-field-help">Merged by Lumiverse after the controls above. Protected connection/model/auth fields remain protected.</div>
                  </div>
                </div>
              </details>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA library</strong><span class="ss-muted ss-tiny" data-role="lora-count">0 models</span></div>
              </div>
              <div class="ss-library-tools">
                <input class="ss-input" data-role="lora-search" type="search" placeholder="Search title, author, tag, trigger, architecture…" />
                <select class="ss-select" data-role="lora-sort" aria-label="Sort LoRAs">
                  <option value="title">Title</option>
                  <option value="name">Filename</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              <div class="ss-library-status" data-role="metadata-error" hidden></div>
              <div class="ss-lora-grid" data-role="lora-grid">
                <div class="ss-empty">Choose a SwarmUI connection to load its LoRA library.</div>
              </div>
            </section>

            <section class="ss-panel">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA stack</strong><span class="ss-muted ss-tiny" data-role="stack-count">0 enabled</span></div>
                <button class="ss-button ss-button-danger" data-action="clear-stack" disabled>Clear</button>
              </div>
              <div class="ss-stack-list" data-role="stack-list">
                <div class="ss-empty">Add LoRAs above. Their metadata default weight and trigger phrase are inherited automatically.</div>
              </div>
            </section>

            <div class="ss-generate-bar">
              <button class="ss-button ss-button-primary ss-generate" data-action="generate" disabled>Generate image</button>
              <div class="ss-run-status" data-role="run-status">Waiting for a SwarmUI connection.</div>
            </div>
          </div>

          <aside class="ss-output">
            <div class="ss-section-title"><strong>Output</strong><span class="ss-muted ss-tiny">Saved by Lumiverse</span></div>
            <div class="ss-current-preview" data-role="current-preview">
              <div class="ss-preview-empty" data-role="preview-empty"><strong>No output yet</strong>Generate an image or choose one from this extension's history.</div>
              <img data-role="preview-image" alt="Generated image preview" hidden />
              <div class="ss-preview-loading" data-role="preview-loading">
                <div class="ss-generation-progress" data-role="generation-progress" data-indeterminate="true">
                  <div class="ss-progress-track"><span class="ss-progress-fill" data-role="progress-fill"></span></div>
                  <div class="ss-progress-label" data-role="progress-label">Preparing…</div>
                </div>
              </div>
            </div>
            <div class="ss-output-label" data-role="output-label">Nothing selected</div>
            <div class="ss-output-actions">
              <button class="ss-button" data-action="download-output" disabled>Download</button>
              <button class="ss-button" data-action="copy-output" disabled>Copy URL</button>
            </div>
            <div class="ss-history-head">
              <div class="ss-section-title"><strong>History</strong><span class="ss-muted ss-tiny" data-role="output-count">0</span></div>
              <button class="ss-icon-button" data-action="refresh-outputs" title="Refresh output history" aria-label="Refresh output history">↻</button>
            </div>
            <div class="ss-history-grid" data-role="history-grid">
              <div class="ss-empty">Outputs created in this chat will appear here.</div>
            </div>
          </aside>
        </div>
      </div>
    `
  }

  private buildV3(): void {
    this.root.innerHTML = `
      <div class="ss-shell" data-mobile-tab="create">
        <div class="ss-topbar">
          <div class="ss-brand">${FRAME_WALL_ICON}<span>Swarm Studio</span></div>
          <div class="ss-connection-wrap">
            <select class="ss-select ss-connection" data-role="connection" aria-label="SwarmUI connection">
              <option value="">Loading SwarmUI connections…</option>
            </select>
          </div>
          <div class="ss-top-actions">
            <button class="ss-icon-button ss-header-library" data-action="open-output-library" title="Open output library" aria-label="Open output library">${LIBRARY_ICON}</button>
            <div class="ss-config-wrap">
              <button class="ss-icon-button ss-config-button" data-action="toggle-config" aria-expanded="false" title="Studio settings" aria-label="Studio settings">${SETTINGS_ICON}</button>
              <div class="ss-settings-layer" data-role="config-popover" hidden>
                <button class="ss-settings-backdrop" data-action="close-settings" aria-label="Close Studio settings"></button>
                <section class="ss-settings-dialog" role="dialog" aria-modal="true" aria-label="Swarm Studio settings">
                  <header class="ss-settings-header">
                    <div class="ss-settings-title"><strong>Studio settings</strong><span>Generation behavior, appearance, and Swarm metadata</span></div>
                    <button class="ss-icon-button" data-action="close-settings" title="Close settings" aria-label="Close settings">×</button>
                  </header>
                  <nav class="ss-settings-tabs" aria-label="Settings sections">
                    <button class="ss-settings-tab" data-action="settings-tab" data-settings-tab="general" data-active="true">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M10 14v6"/></svg><span>General</span>
                    </button>
                    <button class="ss-settings-tab" data-action="settings-tab" data-settings-tab="generation" data-active="false">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg><span>Generation</span>
                    </button>
                    <button class="ss-settings-tab" data-action="settings-tab" data-settings-tab="theme" data-active="false">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6h-.8a1.7 1.7 0 0 1 0-3.4H15a6 6 0 0 0 0-12h-3Z"/><path d="M7.5 9h.01M9.5 6.5h.01M6.5 13h.01"/></svg><span>Theme</span>
                    </button>
                    <button class="ss-settings-tab" data-action="settings-tab" data-settings-tab="metadata" data-active="false">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></svg><span>Metadata</span>
                    </button>
                  </nav>
                  <div class="ss-settings-content">
                    <div class="ss-settings-panel" data-settings-panel="general">
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Current behavior</strong><span>Notifications and floating widget</span></div>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Finished generation toast</strong><span>Show a Lumiverse notification after a generation is saved. Off by default.</span></span>
                          <input type="checkbox" data-role="completion-toast" ${this.behavior.completionToast ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Floating Studio widget</strong><span>Keep Quick Create available over chats. Right-click or long-press it for Studio, Library, and visibility actions.</span></span>
                          <input type="checkbox" data-role="widget-enabled" ${this.behavior.widgetEnabled ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Quick Create on mobile</strong><span>Allow the floating image widget to expand into the prompt editor on small screens.</span></span>
                          <input type="checkbox" data-role="mobile-quick-create" ${this.behavior.mobileQuickCreate ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                      </section>
                    </div>
                    <div class="ss-settings-panel" data-settings-panel="generation" hidden>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Request completion</strong><span>One-pass or dedicated parser</span></div>
                        <div class="ss-request-mode-grid" role="group" aria-label="Image request completion mode">
                          <button class="ss-request-mode-button" data-action="set-request-mode" data-request-mode="inline" data-active="${this.behavior.requestMode === "inline"}">
                            <span class="ss-request-mode-icon">${FRAME_WALL_ICON}</span>
                            <span><strong>Inline protocol</strong><small>The active chat model writes complete SwarmUI prompts directly in its reply.</small></span>
                          </button>
                          <button class="ss-request-mode-button" data-action="set-request-mode" data-request-mode="parser" data-active="${this.behavior.requestMode === "parser"}">
                            <span class="ss-request-mode-icon">${SPARKLE_ICON}</span>
                            <span><strong>Parser model</strong><small>The chat model places a brief request; a second Lumiverse text connection completes it after the reply.</small></span>
                          </button>
                        </div>
                        <div class="ss-parser-settings" data-role="parser-settings" ${this.behavior.requestMode === "parser" ? "" : "hidden"}>
                          <label class="ss-parser-field">
                            <span>Lumiverse connection</span>
                            <select class="ss-select" data-role="parser-connection">
                              <option value="">Use Lumiverse default connection</option>
                            </select>
                          </label>
                          <label class="ss-parser-field">
                            <span>Model override <small>optional</small></span>
                            <input class="ss-input" data-role="parser-model" list="ss-parser-model-options" value="${this.behavior.parserModel.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" placeholder="Use the connection's selected model" autocomplete="off" />
                            <datalist id="ss-parser-model-options" data-role="parser-model-options"></datalist>
                          </label>
                          <p class="ss-muted ss-tiny" data-role="parser-connection-summary">Loading Lumiverse text connections…</p>
                          <p class="ss-muted ss-tiny">The override changes only parser calls. Chat replies continue using the model selected by Lumiverse for the active conversation.</p>
                        </div>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Inline images</strong><span>Model requests and composition</span></div>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Automatically generate image tags</strong><span>Completed &lt;swarm-image&gt; requests start immediately. When off, they become lazy Generate placeholders.</span></span>
                          <input type="checkbox" data-role="tag-auto-generate" ${this.behavior.tagAutoGenerate ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Inject image protocol</strong><span>Teach the active model how to request local SwarmUI illustrations in its replies.</span></span>
                          <input type="checkbox" data-role="tag-prompt-injection" ${this.behavior.tagPromptInjection ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Strip LoRA stack from User-only composition</strong><span>When character="none" and only the active persona is requested, remove matching character-bound LoRAs. Off keeps the current Studio stack intact.</span></span>
                          <input type="checkbox" data-role="strip-user-only-lora-stack" ${this.behavior.stripUserOnlyLoraStack ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-settings-toggle">
                          <span class="ss-settings-toggle-copy"><strong>Auto-print current character positive prompt</strong><span>Always prepend the bound character identity to tagged generations. Off lets the model choose only the relevant identities from the protocol—useful for multi-NPC character cards.</span></span>
                          <input type="checkbox" data-role="auto-print-character-positive" ${this.behavior.autoPrintCharacterPositive ? "checked" : ""} /><span class="ss-switch-track" aria-hidden="true"></span>
                        </label>
                        <label class="ss-config-field">
                          <span>Prompt composition</span>
                          <select class="ss-select" data-role="tag-prompt-mode">
                            <option value="multi" ${this.behavior.tagPromptMode === "multi" ? "selected" : ""}>Multi-character / ensemble</option>
                            <option value="pov" ${this.behavior.tagPromptMode === "pov" ? "selected" : ""}>Character-only / POV</option>
                          </select>
                        </label>
                        <div class="ss-image-count-range">
                          <span>Required images per reply</span>
                          <input class="ss-input" type="number" min="0" max="6" step="1" inputmode="numeric" data-role="required-image-min" value="${this.behavior.requiredImageMin}" aria-label="Minimum required images" title="Minimum required images" />
                          <span class="ss-range-separator">to</span>
                          <input class="ss-input" type="number" min="0" max="6" step="1" inputmode="numeric" data-role="required-image-max" value="${this.behavior.requiredImageMax}" aria-label="Maximum required images" title="Maximum required images" />
                        </div>
                        <p class="ss-muted ss-tiny">0–0 lets the model decide. Any other range explicitly requires that many complete image requests in the reply.</p>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Protocol prompt</strong><span>Inline-mode system instruction</span></div>
                        <textarea class="ss-textarea ss-protocol-editor" data-role="tag-protocol-prompt" spellcheck="false"></textarea>
                        <p class="ss-muted ss-tiny"><code>{{swarm_dynamic_guidance}}</code> is replaced at runtime with the active image count, identities, composition mode, checkpoint guidance, and Swarm preset stack. Remove it only when your custom protocol deliberately replaces all dynamic guidance.</p>
                        <p class="ss-muted ss-tiny">Parser mode injects its own compact placement protocol and uses this fully resolved protocol privately when completing each request.</p>
                        <div class="ss-protocol-actions">
                          <button class="ss-button" data-action="copy-tag-protocol">Copy example</button>
                          <button class="ss-button" data-action="reset-tag-protocol">Reset</button>
                          <button class="ss-button ss-button-primary" data-action="save-tag-protocol">Save current</button>
                        </div>
                        <details class="ss-css-guide ss-macro-guide">
                          <summary>Macro reference</summary>
                          <div class="ss-macro-guide-grid">
                            <code>{{swarm_dynamic_guidance}}</code><span>Insertion point inside the editable protocol for live identity, composition, checkpoint, image-count, and preset guidance.</span>
                            <code>{{swarm_image_protocol}}</code><span>The fully resolved local-generation protocol used by prompt injection.</span>
                            <code>{{swarm_preset}}</code><span>Active preset titles as exact native directives: &lt;preset:name one&gt;, &lt;preset:name two&gt;.</span>
                            <code>{{swarm_negative}}</code><span>Current Studio negative prompt.</span>
                            <code>{{char_base}}</code><span>Active character visual tags. Include this explicitly when automatic character printing is off.</span>
                            <code>{{persona_base}}</code><span>Visual identity bound to the active persona in Chat Visuals.</span>
                            <code>{{char_profile}}</code><span>Active character avatar URL for HTML shells.</span>
                            <code>{{user_profile}}</code><span>Active persona avatar URL for HTML shells.</span>
                            <code>{{swarm_checkpoint}}</code><span>Current Studio checkpoint.</span>
                            <code>{{swarm_aspect}}</code><span>Closest named Studio aspect ratio.</span>
                            <code>{{last_genned}}</code><span>URL of the latest completed Swarm Studio image.</span>
                          </div>
                        </details>
                      </section>
                    </div>
                    <div class="ss-settings-panel" data-settings-panel="theme" hidden>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Profile</strong><span>Editing below activates Custom</span></div>
                        <div class="ss-config-theme-grid">
                          ${STUDIO_THEMES.map((theme) => `<button class="ss-button ss-config-theme" data-action="set-theme" data-theme-value="${theme.id}" style="--ss-swatch:${theme.color}">${theme.label}</button>`).join("")}
                        </div>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Inline image size</strong><span>Centered in its message container</span></div>
                        <div class="ss-image-scale-grid">
                          ${([100, 75, 50] as const).map((scale) => `<button class="ss-button ss-image-scale-button" data-action="set-inline-image-scale" data-scale="${scale}" data-active="${this.behavior.inlineImageScale === scale}">
                            <svg viewBox="0 0 64 44" aria-hidden="true"><rect x="2" y="2" width="60" height="40" rx="3" opacity=".25"/><rect x="${scale === 100 ? 2 : scale === 75 ? 10 : 17}" y="${scale === 100 ? 2 : scale === 75 ? 7 : 12}" width="${scale === 100 ? 60 : scale === 75 ? 44 : 30}" height="${scale === 100 ? 40 : scale === 75 ? 30 : 20}" rx="2"/></svg>
                            <span>${scale}% × ${scale}%</span>
                          </button>`).join("")}
                        </div>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Component colors</strong><button class="ss-button ss-tiny" data-action="reset-appearance">Reset overrides</button></div>
                        <div class="ss-appearance-colors">
                          ${APPEARANCE_COLORS.map((color) => `<label class="ss-color-control"><input type="color" data-role="appearance-color" data-color-key="${color.key}" value="#7dd3fc" /><span>${color.label}</span></label>`).join("")}
                        </div>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Shape and glass</strong><span>Applied across the modal</span></div>
                        <div class="ss-appearance-range">
                          <label for="ss-radius-control">Border radius</label>
                          <input id="ss-radius-control" data-role="appearance-radius" type="range" min="0" max="28" step="1" value="8" />
                          <output data-role="appearance-radius-output">8px</output>
                        </div>
                        <div class="ss-appearance-range">
                          <label for="ss-opacity-control">Surface opacity</label>
                          <input id="ss-opacity-control" data-role="appearance-opacity" type="range" min="45" max="100" step="1" value="96" />
                          <output data-role="appearance-opacity-output">96%</output>
                        </div>
                        <div class="ss-appearance-range">
                          <label for="ss-blur-control">Backdrop blur</label>
                          <input id="ss-blur-control" data-role="appearance-blur" type="range" min="0" max="30" step="1" value="12" />
                          <output data-role="appearance-blur-output">12px</output>
                        </div>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Custom CSS</strong><span>Persisted locally · apply when ready</span></div>
                        <textarea class="ss-textarea ss-css-override" data-role="custom-css" spellcheck="false" placeholder="/* Example */
.ss-current-preview { box-shadow: 0 0 28px color-mix(in srgb, var(--lumiverse-accent) 28%, transparent); }
.ss-stack-row { border-style: dashed; }"></textarea>
                        <div class="ss-config-actions">
                          <button class="ss-button ss-button-danger" data-action="clear-custom-css">Clear</button>
                          <button class="ss-button ss-button-primary" data-action="apply-custom-css">Apply CSS</button>
                        </div>
                        <details class="ss-css-guide">
                          <summary>Stylesheet guide</summary>
                          <pre>Useful roots
.ss-shell                 whole Studio
.ss-launcher              drawer composition
.ss-generation-pane       generation sidebar
.ss-output-stage          current image
.ss-prompt-panel          prompt editor
.ss-lora-dock             LoRA workspace
.ss-stack-row             stacked LoRA
.ss-history-card          history image
.ss-output-library        fullscreen library
.ss-inspector             image inspector

Theme variables
--lumiverse-accent        active accent
--ss-canvas-bg            modal background
--ss-panel-bg             panel surfaces
--ss-header-bg            section headers
--ss-outline              borders
--ss-button-bg            button surfaces
--ss-control-radius       controls
--ss-panel-radius         panels
--ss-surface-opacity      panel alpha
--ss-backdrop-blur        panel blur

Use .ss-shell before a selector to keep
an override inside Studio. @import rules
are removed when CSS is applied.</pre>
                        </details>
                      </section>
                    </div>
                    <div class="ss-settings-panel" data-settings-panel="metadata" hidden>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Swarm metadata</strong><span>Models, LoRAs, folders, and preview art</span></div>
                        <p class="ss-muted ss-tiny">Rescan the selected SwarmUI connection after adding or moving checkpoints and LoRAs.</p>
                        <button class="ss-button" data-action="refresh-metadata">Refresh metadata</button>
                      </section>
                      <section class="ss-config-section">
                        <div class="ss-config-section-head"><strong>Metadata token</strong><span data-role="token-status">No token saved</span></div>
                        <p class="ss-muted ss-tiny">Only needed when SwarmUI blocks anonymous metadata access. Lumiverse stores the token in its encrypted enclave.</p>
                        <div class="ss-token-row">
                          <input class="ss-input" data-role="metadata-token" type="password" autocomplete="off" placeholder="swarm_token value" />
                          <button class="ss-button ss-button-primary" data-action="save-token">Save</button>
                          <button class="ss-button ss-button-danger" data-action="clear-token">Clear</button>
                        </div>
                      </section>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            <button class="ss-icon-button" data-action="toggle-fullscreen" title="Toggle fullscreen studio" aria-label="Toggle fullscreen studio">⛶</button>
            <button class="ss-icon-button ss-close-studio" data-action="close-studio" title="Close studio" aria-label="Close studio">×</button>
          </div>
        </div>

        <div class="ss-permission-banner" data-role="permission-banner"></div>

        <nav class="ss-mobile-tabs" aria-label="Studio sections">
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="create" data-active="true">Create</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="generation" data-active="false">Tune</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="loras" data-active="false">LoRAs</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="stack" data-active="false">Stack</button>
          <button class="ss-button ss-mobile-tab" data-action="mobile-tab" data-tab="history" data-active="false">History</button>
        </nav>

        <div class="ss-workspace">
          <aside class="ss-generation-pane" data-mobile-panel="generation">
            <div class="ss-pane-head">
              <div class="ss-pane-title"><strong>Generation</strong><div class="ss-muted ss-tiny">Model and render controls</div></div>
              <button class="ss-icon-button ss-pane-toggle" data-action="toggle-generation" title="Collapse generation sidebar" aria-label="Collapse generation sidebar">‹</button>
            </div>
            <div class="ss-pane-body">
              <div class="ss-generation-controls">
                <section class="ss-workflow-panel">
                  <div class="ss-workflow-picker">
                    <div class="ss-field">
                      <label>Generation workflow</label>
                      <select class="ss-select" data-role="workflow-select" aria-label="Saved Swarm generation workflow">
                        <option value="">Standard Swarm generation</option>
                      </select>
                    </div>
                    <span class="ss-workflow-badge" data-role="workflow-badge" data-active="false">Native</span>
                    <button class="ss-icon-button ss-workflow-configure" data-action="open-workflow-setup" title="Open workflow setup" aria-label="Open workflow setup" disabled>${EXPAND_ICON}</button>
                  </div>
                  <div class="ss-workflow-description" data-role="workflow-description">Use Swarm’s normal parameter pipeline, or select a saved Comfy workflow exposed to its Generate tab.</div>
                </section>
                <div class="ss-field ss-wide">
                  <label>Checkpoint</label>
                  <select class="ss-select" data-role="model"><option value="">Select a connection first</option></select>
                </div>
                <div class="ss-aspect-controls">
                  <div class="ss-field">
                    <label>Aspect ratio</label>
                    <select class="ss-select" data-role="aspect">
                      ${Object.entries(ASPECT_PRESETS).map(([value, preset]) => `<option value="${value}">${preset.label}</option>`).join("")}
                      <option value="custom">Custom / unlink</option>
                    </select>
                  </div>
                  <div class="ss-field" data-role="size-scale-field">
                    <label>Image scale</label>
                    <div class="ss-size-slider-row">
                      <input data-role="size-slider" type="range" min="256" max="2048" step="64" value="1024" />
                      <span class="ss-size-readout" data-role="size-readout">1024 × 1024</span>
                    </div>
                  </div>
                  <div class="ss-custom-size" data-role="custom-size" hidden>
                    <div class="ss-field">
                      <label>Width</label>
                      <input class="ss-input" data-role="width" type="number" min="64" max="4096" step="64" value="1024" />
                    </div>
                    <button class="ss-icon-button ss-size-link" data-action="toggle-size-link" data-role="size-link" data-linked="true" aria-pressed="true" title="Width and height are linked">${LINK_SIZE_ICON}</button>
                    <div class="ss-field">
                      <label>Height</label>
                      <input class="ss-input" data-role="height" type="number" min="64" max="4096" step="64" value="1024" />
                    </div>
                    <input data-role="link-size" type="checkbox" checked hidden />
                  </div>
                </div>
                <div class="ss-field">
                  <label>Steps</label>
                  <input class="ss-input" data-role="steps" type="number" min="1" max="150" step="1" value="20" />
                </div>
                <div class="ss-field">
                  <label>CFG</label>
                  <input class="ss-input" data-role="cfg" type="number" min="1" max="30" step="0.5" value="7" />
                </div>
                <div class="ss-field ss-wide">
                  <label>Seed</label>
                  <input class="ss-input" data-role="seed" type="number" step="1" value="-1" title="-1 uses a random seed" />
                </div>
                <div class="ss-field ss-wide">
                  <label>Sampler</label>
                  <select class="ss-select" data-role="sampler"><option value="">Connection default</option></select>
                </div>
                <div class="ss-field ss-wide">
                  <label>Scheduler</label>
                  <select class="ss-select" data-role="scheduler"><option value="">Connection default</option></select>
                </div>
                <div class="ss-inline-actions ss-wide">
                  <button class="ss-button ss-context-button" data-action="change-orientation" data-role="orientation-action" title="Change image orientation">${PORTRAIT_ICON}<span>Portrait</span></button>
                  <button class="ss-button ss-context-button" data-action="toggle-seed-mode" data-role="seed-action" title="Reuse the current output seed">${CURRENT_SEED_ICON}<span>Current seed</span></button>
                </div>
                <div class="ss-init-panel">
                  <div class="ss-init-preview" data-role="init-preview">No init</div>
                  <div class="ss-init-content">
                    <div class="ss-init-head"><strong class="ss-tiny">Init image</strong><span class="ss-init-label" data-role="init-label">Text-to-image</span></div>
                    <div class="ss-init-actions">
                      <button class="ss-button" data-action="use-current-init" disabled>Use current</button>
                      <button class="ss-button" data-action="pick-init">Choose file</button>
                      <button class="ss-button ss-button-danger" data-action="clear-init" disabled>Clear</button>
                    </div>
                  </div>
                  <label class="ss-creativity-row"><span>Creativity</span><input data-role="denoise" type="range" min="0" max="1" step="0.05" value="0.6" /><span data-role="denoise-label">0.60</span></label>
                  <input data-role="init-file" type="file" accept="image/*" hidden />
                </div>
              </div>
              <details class="ss-advanced">
                <summary>Advanced Swarm controls</summary>
                <div class="ss-advanced-grid">
                  <div class="ss-field ss-wide">
                    <label>Swarm preset stack</label>
                    <div class="ss-preset-picker">
                      <select class="ss-select" data-role="presets"><option value="">Add a preset…</option></select>
                      <button class="ss-icon-button ss-preset-manage" data-action="open-preset-manager" data-role="manage-swarm-presets" title="Manage Swarm presets" aria-label="Manage Swarm presets" hidden>${SETTINGS_ICON}</button>
                      <button class="ss-button" data-action="add-swarm-preset" data-role="add-swarm-preset" hidden>Save current</button>
                    </div>
                    <div class="ss-preset-stack" data-role="preset-stack">
                      <div class="ss-empty ss-preset-empty">No presets selected.</div>
                    </div>
                    <div class="ss-field-help" data-role="preset-resolved">Enabled presets are applied from top to bottom.</div>
                  </div>
                  <div class="ss-field">
                    <label>VAE override</label>
                    <input class="ss-input" data-role="vae" placeholder="Built-in/default" />
                  </div>
                  <div class="ss-field">
                    <label>UNet override</label>
                    <input class="ss-input" data-role="unet" placeholder="Use checkpoint" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-L</label>
                    <input class="ss-input" data-role="clip-l" placeholder="Optional" />
                  </div>
                  <div class="ss-field">
                    <label>CLIP-G</label>
                    <input class="ss-input" data-role="clip-g" placeholder="Optional" />
                  </div>
                  <div class="ss-field">
                    <label>T5-XXL</label>
                    <input class="ss-input" data-role="t5" placeholder="Optional" />
                  </div>
                  <div class="ss-field ss-wide">
                    <label>Raw request override (JSON)</label>
                    <textarea class="ss-textarea" data-role="raw-override" spellcheck="false" placeholder='{"refinerupscale": 1.25}'></textarea>
                    <div class="ss-field-help">Merged after these controls. Protected connection, model, and authentication fields stay protected.</div>
                  </div>
                </div>
              </details>
            </div>
          </aside>

          <div class="ss-resize-handle ss-resize-generation" data-resize="generation" role="separator" aria-orientation="vertical" title="Drag to resize generation controls"></div>

          <main class="ss-center">
            <section class="ss-output-stage" data-role="output-stage" data-mobile-panel="create-output">
              <div class="ss-output-stage-head">
                <div class="ss-section-title"><strong>Current output</strong><span class="ss-muted ss-tiny">Saved by Lumiverse</span></div>
                <div class="ss-output-actions">
                  <button class="ss-button" data-action="download-output" disabled>Download</button>
                  <button class="ss-button" data-action="copy-output" disabled>Copy URL</button>
                  <button class="ss-button" data-action="append-to-chat" disabled>Append to chat</button>
                </div>
              </div>
              <div class="ss-current-preview" data-role="current-preview" data-action="inspect-output" title="Open full-size image and generation details">
                <button class="ss-icon-button ss-favorite-button ss-current-favorite" data-action="toggle-current-favorite" data-role="current-favorite" type="button" aria-label="Favorite current output" title="Add to Favorites" disabled>${STAR_ICON}</button>
                <div class="ss-preview-empty" data-role="preview-empty"><strong>No output yet</strong>Generate an image or open one from History.</div>
                <img data-role="preview-image" alt="Generated image preview" hidden />
                <div class="ss-preview-loading" data-role="preview-loading">
                  <div class="ss-generation-progress" data-role="generation-progress" data-indeterminate="true">
                    <div class="ss-progress-track"><span class="ss-progress-fill" data-role="progress-fill"></span></div>
                    <div class="ss-progress-label" data-role="progress-label">Preparing…</div>
                  </div>
                </div>
              </div>
              <div class="ss-output-meta">
                <div class="ss-output-label" data-role="output-label">Nothing selected</div>
                <span class="ss-zoom-hint">Click image for full size + prompts</span>
              </div>
            </section>

            <div class="ss-center-resizer" data-resize="prompt" role="separator" aria-orientation="horizontal" title="Drag to resize prompt area"></div>

            <section class="ss-prompt-panel" data-mobile-panel="create-prompt">
              <div class="ss-section-head ss-prompt-head">
                <div class="ss-section-title"><strong>Prompt</strong><span class="ss-muted ss-tiny">LoRA triggers are opt-in</span></div>
                <div class="ss-prompt-status" data-role="prompt-run-status">Waiting for SwarmUI.</div>
                <div class="ss-prompt-actions">
                  <label class="ss-mobile-stack-picker">
                    <span>Stack</span>
                    <select class="ss-select" data-role="mobile-stack-preset" aria-label="Load a saved LoRA stack">
                      <option value="">Saved stacks…</option>
                    </select>
                  </label>
                  <button class="ss-button ss-button-primary ss-generate ss-desktop-generate" data-action="generate" disabled>Generate image</button>
                </div>
              </div>
              <div class="ss-prompt-grid">
                <div class="ss-field">
                  <div class="ss-prompt-field-head">
                    <div class="ss-positive-label"><label for="ss-positive-v3">Positive</label><button class="ss-active-visual-pill" data-role="active-visual-pill" data-action="toggle-active-visual" type="button" hidden></button><button class="ss-active-visual-pill" data-role="active-persona-visual-pill" data-action="toggle-active-persona-visual" type="button" hidden></button><span class="ss-active-preset-pill" data-role="active-preset-pill" hidden></span></div>
                    <button class="ss-prompt-editor-button" data-action="edit-prompt" data-prompt-role="positive" title="Open positive prompt in Lumiverse editor" aria-label="Expand positive prompt">${EXPAND_ICON}</button>
                  </div>
                  <textarea id="ss-positive-v3" class="ss-textarea" data-role="positive" placeholder="Describe the image…"></textarea>
                  <div class="ss-field-help" data-role="trigger-summary">No inherited trigger phrases.</div>
                </div>
                <div class="ss-field">
                  <div class="ss-prompt-field-head">
                    <label for="ss-negative-v3">Negative</label>
                    <button class="ss-prompt-editor-button" data-action="edit-prompt" data-prompt-role="negative" title="Open negative prompt in Lumiverse editor" aria-label="Expand negative prompt">${EXPAND_ICON}</button>
                  </div>
                  <textarea id="ss-negative-v3" class="ss-textarea" data-role="negative" placeholder="What should not appear…"></textarea>
                  <div class="ss-field-help">Passed through Lumiverse's SwarmUI provider.</div>
                </div>
              </div>
              <div class="ss-mobile-prompt-tools">
                <button class="ss-button ss-mobile-prompt-tool" data-action="use-current-init" data-role="mobile-init-action" title="Use the current output as init image" disabled>${INIT_IMAGE_ICON}<span>Use as init</span></button>
                <button class="ss-button ss-mobile-prompt-tool" data-action="toggle-seed-mode" data-role="seed-action-mobile" title="Lock or randomize the next seed">${RANDOM_SEED_ICON}<span>Random seed</span></button>
                <button class="ss-button ss-mobile-prompt-tool" data-action="append-to-chat" title="Append current output to chat" disabled>${APPEND_CHAT_ICON}<span>Append</span></button>
              </div>
            </section>
          </main>

          <div class="ss-resize-handle ss-resize-history" data-resize="history" role="separator" aria-orientation="vertical" title="Drag to resize history"></div>

          <aside class="ss-history-pane" data-mobile-panel="history">
            <div class="ss-pane-head">
              <div class="ss-pane-title"><strong>History</strong><div class="ss-muted ss-tiny"><span data-role="output-count">0</span> saved outputs</div></div>
              <div>
                <button class="ss-icon-button ss-pane-toggle" data-action="refresh-outputs" title="Refresh output history" aria-label="Refresh output history">↻</button>
                <button class="ss-icon-button ss-pane-toggle" data-action="toggle-history" title="Collapse history sidebar" aria-label="Collapse history sidebar">›</button>
              </div>
            </div>
            <div class="ss-pane-body ss-history-grid" data-role="history-grid">
              <div class="ss-empty">Outputs created in this chat will appear here.</div>
            </div>
            <div class="ss-history-pagination">
              <button class="ss-button" data-action="history-prev" disabled>‹</button>
              <span class="ss-history-page-label" data-role="history-page">1 / 1</span>
              <button class="ss-button" data-action="history-next" disabled>›</button>
            </div>
          </aside>
        </div>

        <section class="ss-lora-dock">
          <div class="ss-dock-resizer" data-resize="dock" role="separator" aria-orientation="horizontal" title="Drag to resize LoRA workspace"></div>
          <div class="ss-dock-head">
            <div class="ss-section-title"><strong>LoRA workspace</strong><span class="ss-muted ss-tiny" data-role="dock-summary">0 models · 0 stacked</span></div>
            <button class="ss-icon-button ss-pane-toggle" data-action="toggle-loras" title="Collapse LoRA workspace" aria-label="Collapse LoRA workspace" aria-expanded="true">⌄</button>
          </div>
          <div class="ss-lora-dock-content">
            <section class="ss-lora-library">
              <div class="ss-lora-titlebar">
                <div class="ss-section-title"><strong>Select LoRAs</strong><span class="ss-muted ss-tiny" data-role="lora-count">0 models</span></div>
                <span class="ss-family-chip" data-role="family-chip">Waiting for checkpoint</span>
              </div>
              <div class="ss-library-tools">
                <div class="ss-lora-query">
                  <input class="ss-input" data-role="lora-search" type="search" placeholder="Search keywords, tags, triggers…" />
                  <div class="ss-lora-download-entry" data-role="lora-download-entry" hidden>
                    <input class="ss-input" data-role="lora-download-url" type="url" inputmode="url" placeholder="Paste or drop a Civitai / Hugging Face download URL…" />
                    <input class="ss-input" data-role="lora-download-name" placeholder="Optional save name" />
                    <button class="ss-button ss-button-primary" data-action="start-lora-download" title="Download into SwarmUI">${DOWNLOAD_ICON}<span>Start</span></button>
                    <button class="ss-button" data-action="cancel-lora-download" title="Close downloader">×</button>
                  </div>
                  <div class="ss-lora-download-status" data-role="lora-download-progress" hidden><i></i></div>
                </div>
                <button class="ss-button ss-lora-download-toggle" data-action="toggle-lora-download" title="Download a LoRA" aria-label="Download a LoRA">${DOWNLOAD_ICON}<span>Download</span></button>
                <select class="ss-select ss-lora-filter" data-role="lora-filter" aria-label="LoRA compatibility filter">
                  <option value="compatible">Compatible only</option>
                  <option value="all">All model families</option>
                </select>
                <div class="ss-lora-sort-wrap">
                  <button class="ss-icon-button ss-lora-tool-icon" data-action="toggle-lora-sort-menu" data-role="lora-sort-button" title="Sort LoRAs: Title" aria-label="Sort LoRAs: Title" aria-expanded="false">${SORT_ICON}</button>
                  <div class="ss-lora-sort-menu" data-role="lora-sort-menu" role="menu" hidden>
                    <button class="ss-lora-sort-choice" data-action="select-lora-sort" data-sort-value="title" data-selected="true" role="menuitem">Title</button>
                    <button class="ss-lora-sort-choice" data-action="select-lora-sort" data-sort-value="name" data-selected="false" role="menuitem">Filename</button>
                    <button class="ss-lora-sort-choice" data-action="select-lora-sort" data-sort-value="newest" data-selected="false" role="menuitem">Newest</button>
                  </div>
                  <select data-role="lora-sort" aria-label="Sort LoRAs" hidden>
                    <option value="title">Title</option>
                    <option value="name">Filename</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
                <button class="ss-icon-button ss-lora-tool-icon" data-action="toggle-lora-folders" data-role="lora-folder-toggle" data-active="false" title="Browse LoRA folders" aria-label="Browse LoRA folders" aria-expanded="false">${FOLDER_TREE_ICON}</button>
              </div>
              <div class="ss-library-status" data-role="metadata-error" hidden></div>
              <div class="ss-lora-browser" data-role="lora-browser" data-folders-open="false">
                <aside class="ss-lora-folder-sidebar" data-role="lora-folder-sidebar" aria-label="LoRA folders" hidden>
                  <div class="ss-lora-folder-head">
                    <strong>LoRA folders</strong>
                    <button class="ss-icon-button ss-lora-tool-icon" data-action="toggle-lora-folders" title="Close folder browser" aria-label="Close folder browser">${FOLDER_TREE_ICON}</button>
                  </div>
                  <div class="ss-lora-folder-tree" data-role="lora-folder-tree" role="tree"></div>
                </aside>
                <div class="ss-lora-grid" data-role="lora-grid">
                  <div class="ss-empty">Choose a SwarmUI connection to load its LoRA library.</div>
                </div>
              </div>
            </section>

            <div class="ss-lora-divider" data-resize="lora-split" role="separator" aria-orientation="vertical" title="Drag to resize LoRA library and stack"></div>

            <section class="ss-stack-pane">
              <div class="ss-section-head">
                <div class="ss-section-title"><strong>LoRA stack</strong><span class="ss-muted ss-tiny" data-role="stack-count">0 enabled</span></div>
              </div>
              <div class="ss-stack-head-tools">
                <select class="ss-select" data-role="stack-preset" aria-label="Saved LoRA stacks">
                  <option value="">Saved stacks…</option>
                </select>
                <button class="ss-button" data-action="load-stack" disabled>Load</button>
                <button class="ss-button ss-button-primary" data-action="save-stack">Save</button>
                <button class="ss-button ss-button-danger" data-action="delete-stack" disabled>Delete</button>
              </div>
              <div class="ss-stack-list" data-role="stack-list">
                <div class="ss-empty">Add LoRAs from the library. Metadata triggers stay off until you enable them.</div>
              </div>
              <div class="ss-stack-share-tools">
                <button class="ss-button" data-action="import-stack" title="Import a shared LoRA stack JSON file">${IMPORT_ICON}<span>Import</span></button>
                <button class="ss-button" data-action="export-stack" title="Export the current LoRA stack as shareable JSON">${EXPORT_ICON}<span>Export</span></button>
                <button class="ss-button" data-action="apply-lumi-stack" title="Merge this stack into Lumiverse Image Gen and activate it">${EXPORT_ICON}<span>Apply to Lumi</span></button>
                <button class="ss-button ss-button-danger ss-clear-stack" data-action="clear-stack" disabled>Clear</button>
                <input data-role="stack-import-file" type="file" accept="application/json,.json" hidden />
              </div>
            </section>
          </div>
        </section>

        <div class="ss-commandbar">
          <div class="ss-command-summary">
            <div class="ss-run-status" data-role="run-status">Waiting for a SwarmUI connection.</div>
            <div class="ss-stack-summary" data-role="command-stack-summary">No LoRAs enabled</div>
          </div>
          <button class="ss-button ss-button-primary ss-generate ss-mobile-generate" data-action="generate" disabled>Generate image</button>
        </div>

        <div class="ss-workflow-modal" data-role="workflow-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-workflow-modal-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title">
                <span class="ss-eyebrow">ComfyUI · Saved workflow</span>
                <strong id="ss-workflow-modal-title" data-role="workflow-modal-title">Workflow setup</strong>
              </div>
              <button class="ss-icon-button" data-action="close-workflow-setup" aria-label="Close workflow setup">×</button>
            </header>
            <div class="ss-workflow-modal-description" data-role="workflow-modal-description">Exposed workflow parameters appear here.</div>
            <div class="ss-workflow-fields" data-role="workflow-fields"></div>
            <footer class="ss-workflow-modal-actions">
              <button class="ss-button" data-action="use-standard-workflow">Use standard generation</button>
              <button class="ss-button ss-button-primary" data-action="close-workflow-setup">Done</button>
            </footer>
          </section>
        </div>

        <div class="ss-missing-lora-modal" data-role="missing-lora-modal" hidden>
          <section class="ss-missing-lora-card" role="dialog" aria-modal="true" aria-labelledby="ss-missing-lora-title">
            <header><div><span class="ss-eyebrow">SHARED STACK</span><h3 id="ss-missing-lora-title">Missing LoRAs</h3></div><button class="ss-icon-button" data-action="close-missing-loras" aria-label="Close missing LoRA popup">×</button></header>
            <p class="ss-muted">Choose LoRAs with direct Civitai or Hugging Face download links. SwarmUI handles credentials, paths, metadata, and duplicate protection.</p>
            <div class="ss-missing-lora-list" data-role="missing-lora-list"></div>
            <footer><span class="ss-muted ss-tiny" data-role="missing-lora-download-status"></span><button class="ss-button" data-action="copy-missing-loras">Copy list</button><button class="ss-button ss-button-primary" data-action="download-missing-loras">Download selected</button><button class="ss-button" data-action="close-missing-loras">Done</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="save-preset-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-save-preset-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">SWARM PRESET</span><strong id="ss-save-preset-title">Choose what to save</strong></div>
              <button class="ss-icon-button" data-action="close-save-preset" aria-label="Close save preset popup">×</button>
            </header>
            <div class="ss-save-preset-fields">
              <div class="ss-save-preset-basics">
                <label class="ss-field"><span>Name</span><input class="ss-input" data-role="save-preset-name" maxlength="120" placeholder="Preset name" /></label>
                <label class="ss-field"><span>Description</span><input class="ss-input" data-role="save-preset-description" maxlength="500" placeholder="Optional description" /></label>
              </div>
              <div class="ss-muted ss-tiny">Only checked values are written to SwarmUI. Seed starts unchecked so a reusable preset does not freeze one composition by accident.</div>
              <div class="ss-save-param-list" data-role="save-preset-fields"></div>
            </div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-save-preset">Cancel</button><button class="ss-button ss-button-primary" data-action="confirm-save-preset">Save preset</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="preset-manager-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-preset-manager-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">SWARM PRESETS</span><strong id="ss-preset-manager-title">Manage presets</strong></div>
              <button class="ss-icon-button" data-action="close-preset-manager" aria-label="Close preset manager">×</button>
            </header>
            <div class="ss-workflow-modal-description">These are stored by SwarmUI. Deleting one removes it from this Swarm account and from Studio’s active preset stack.</div>
            <div class="ss-preset-manager-list" data-role="preset-manager-list"></div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button ss-button-primary" data-action="close-preset-manager">Done</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="move-folder-modal" hidden>
          <section class="ss-workflow-modal-card" role="dialog" aria-modal="true" aria-labelledby="ss-move-folder-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">OUTPUT LIBRARY</span><strong id="ss-move-folder-title">Move outputs</strong></div>
              <button class="ss-icon-button" data-action="close-move-folder" aria-label="Close move popup">×</button>
            </header>
            <div class="ss-workflow-modal-description" data-role="move-folder-description">Choose a destination.</div>
            <div class="ss-move-folder-list" data-role="move-folder-list"></div>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-move-folder">Cancel</button></footer>
          </section>
        </div>

        <div class="ss-workflow-modal" data-role="new-folder-modal" hidden>
          <section class="ss-workflow-modal-card ss-new-folder-card" role="dialog" aria-modal="true" aria-labelledby="ss-new-folder-title">
            <header class="ss-workflow-modal-head">
              <div class="ss-workflow-modal-title"><span class="ss-eyebrow">OUTPUT LIBRARY</span><strong id="ss-new-folder-title">Create folder</strong></div>
              <button class="ss-icon-button" data-action="close-new-folder" aria-label="Close new folder popup">×</button>
            </header>
            <label class="ss-field"><span>Name</span><input class="ss-input" data-role="new-folder-name" maxlength="80" placeholder="Folder name" /></label>
            <div class="ss-new-folder-types">
              <label><input type="radio" name="ss-new-folder-type" data-role="new-folder-type" value="unbound" checked /><span><strong>Unbound</strong><small>A simple library folder.</small></span></label>
              <label><input type="radio" name="ss-new-folder-type" data-role="new-folder-type" value="character" /><span><strong>Character folder</strong><small>Reuse prompts and a LoRA stack anywhere this character is active.</small></span></label>
            </div>
            <p class="ss-muted ss-tiny" data-role="new-folder-chat-hint">Character folders follow the active character across conversations.</p>
            <footer class="ss-workflow-modal-actions"><button class="ss-button" data-action="close-new-folder">Cancel</button><button class="ss-button ss-button-primary" data-action="confirm-new-folder">Create folder</button></footer>
          </section>
        </div>

        <div class="ss-inspector" data-role="inspector" hidden>
          <div class="ss-inspector-stage" data-role="inspector-stage">
            <div class="ss-inspector-toolbar">
              <button class="ss-icon-button ss-favorite-button" data-action="toggle-current-favorite" data-role="inspector-favorite" aria-label="Favorite output" title="Add to Favorites">${STAR_ICON}</button>
              <button class="ss-icon-button" data-action="zoom-out" aria-label="Zoom out">−</button>
              <button class="ss-button" data-action="zoom-reset" data-role="zoom-label">100%</button>
              <button class="ss-icon-button" data-action="zoom-in" aria-label="Zoom in">+</button>
              <button class="ss-button" data-action="download-output">Download</button>
            </div>
            <img class="ss-inspector-image" data-role="inspector-image" alt="Full-size generated output" />
          </div>
          <aside class="ss-inspector-details">
            <div class="ss-inspector-details-head">
              <div>
                <h3 data-role="inspector-title">Generated output</h3>
                <div class="ss-muted ss-tiny">Full-size image and recorded generation settings</div>
              </div>
              <button class="ss-icon-button ss-inspector-close" data-action="close-inspector" aria-label="Close full-size image">×</button>
            </div>
            <div class="ss-inspector-facts" data-role="inspector-facts"></div>
            <div class="ss-inspector-actions">
              <button class="ss-button ss-button-primary" data-action="reuse-parameters">Reuse parameters</button>
              <button class="ss-button" data-action="use-as-init">Use as init image</button>
              <button class="ss-button" data-action="append-to-chat" disabled>Append to chat</button>
              <button class="ss-button" data-action="open-output-library">Output library</button>
              <button class="ss-button ss-button-danger" data-action="delete-output" disabled>Delete from Lumiverse</button>
            </div>
            <h4>Rendered positive prompt</h4>
            <p class="ss-inspector-copy" data-role="inspector-positive">Prompt metadata is unavailable for this older output.</p>
            <h4>Rendered negative prompt</h4>
            <p class="ss-inspector-copy" data-role="inspector-negative">No negative prompt recorded.</p>
            <h4>Used presets</h4>
            <p class="ss-inspector-copy" data-role="inspector-presets">No Swarm presets recorded.</p>
            <h4>LoRA stack</h4>
            <p class="ss-inspector-copy" data-role="inspector-loras">No LoRAs recorded.</p>
            <div class="ss-inspector-path" data-role="inspector-path" hidden>Saved by SwarmUI to <code data-role="inspector-path-value"></code></div>
          </aside>
        </div>

        <div class="ss-output-library" data-role="output-library" data-view="folders" data-selection-mode="false" hidden>
          <header class="ss-library-head">
            <div class="ss-library-head-copy">
              <strong>Output library</strong>
              <span class="ss-muted ss-tiny">Lumiverse-owned Swarm Studio images and virtual folders</span>
            </div>
            <label class="ss-library-folder-search">
              ${SEARCH_ICON}
              <input class="ss-input" data-role="library-folder-search" type="search" placeholder="Search folders…" aria-label="Search folders" />
            </label>
            <button class="ss-icon-button ss-library-close" data-action="close-output-library" data-role="library-close" aria-label="Close output library" title="Close output library">×</button>
          </header>
          <section class="ss-library-landing" data-role="library-folders">
            <div class="ss-library-landing-inner">
              <div class="ss-library-folder-grid" data-role="library-folder-grid">
                <div class="ss-empty">Loading folders…</div>
              </div>
              <p class="ss-library-folder-note ss-muted ss-tiny">Virtual folders organize outputs without moving the original Lumiverse images.</p>
            </div>
          </section>
          <main class="ss-library-folder-view" data-role="library-folder-view">
            <header class="ss-library-folder-header">
              <nav class="ss-library-breadcrumb" aria-label="Library location">
                <button class="ss-library-back" data-action="library-back">${BACK_ICON}<span>Folders</span></button>
                <span aria-hidden="true">/</span>
                <strong data-role="library-breadcrumb-title">All outputs</strong>
              </nav>
              <div class="ss-library-folder-heading">
                <div class="ss-library-folder-cover" data-role="library-folder-cover">${FOLDER_ICON}</div>
                <div class="ss-library-folder-title-copy">
                  <span class="ss-library-folder-kind" data-role="library-folder-kind" hidden>Character visuals</span>
                  <h2 data-role="library-title">All outputs</h2>
                  <span class="ss-muted" data-role="library-count">0 images</span>
                </div>
                <div class="ss-library-folder-actions">
                  <button class="ss-button" data-action="toggle-library-search">${SEARCH_ICON}<span>Search</span></button>
                  <button class="ss-button" data-action="toggle-library-selection">${CHECK_ICON}<span>Select</span></button>
                  <button class="ss-button ss-button-primary" data-action="open-visual-profile" data-role="library-visual-button" hidden>${SPARKLE_ICON}<span>Prompts &amp; visuals</span></button>
                  <button class="ss-icon-button ss-library-folder-delete" data-action="delete-output-folder" data-role="library-delete-folder" title="Delete folder" aria-label="Delete folder">${TRASH_ICON}</button>
                </div>
                <div class="ss-library-pagination">
                  <button class="ss-icon-button" data-action="library-prev" disabled aria-label="Previous page">‹</button>
                  <span class="ss-history-page-label" data-role="library-page">1 / 1</span>
                  <button class="ss-icon-button" data-action="library-next" disabled aria-label="Next page">›</button>
                </div>
              </div>
              <label class="ss-library-folder-query" data-role="library-search-wrap" hidden>
                ${SEARCH_ICON}
                <input class="ss-input" data-role="library-search" type="search" placeholder="Search prompts, model, LoRAs, presets…" aria-label="Search output metadata" />
              </label>
            </header>
            <div class="ss-library-selectbar" data-role="library-selectbar" hidden>
              <span class="ss-library-selection-count" data-role="library-selection-count">Select</span>
              <button class="ss-button ss-library-select-page" data-action="select-library-page" data-role="library-select-page" hidden>Select page</button>
              <label class="ss-library-nonstarred" data-role="library-nonstarred" hidden>
                <input type="checkbox" data-role="library-select-nonstarred" />
                <span>Select only non-starred</span>
              </label>
              <div class="ss-library-selection-actions" data-role="library-selection-actions" hidden>
                <button class="ss-button ss-library-favorite-selected" data-action="bulk-favorite-outputs">${STAR_ICON}<span>Favorite</span></button>
                <button class="ss-button" data-action="bulk-move-outputs">Move…</button>
                <button class="ss-button ss-button-danger" data-action="bulk-delete-outputs">Delete</button>
              </div>
            </div>
            <div class="ss-output-library-grid" data-role="library-grid">
              <div class="ss-empty">Loading outputs…</div>
            </div>
          </main>
          <div class="ss-library-modal-layer" data-role="library-visual-profile" hidden>
            <section class="ss-library-visual-dialog" role="dialog" aria-modal="true" aria-labelledby="ss-library-visual-title">
              <header class="ss-library-visual-head">
                <div>
                  <strong id="ss-library-visual-title" data-role="visual-profile-title">Character visuals</strong>
                  <span class="ss-muted ss-tiny" data-role="visual-profile-subtitle">Base generation profile and named continuity looks</span>
                </div>
                <button class="ss-icon-button" data-action="close-visual-profile" aria-label="Close prompts and visuals">×</button>
              </header>
              <div class="ss-library-visual-body" data-role="library-visual-profile-panel">
                <section class="ss-library-visual-section">
                  <div class="ss-library-visual-section-title">
                    <div><strong>Base generation profile</strong><span class="ss-muted ss-tiny">Inherited by every named Look</span></div>
                    <label class="ss-toggle-line"><input type="checkbox" data-role="visual-enabled" checked><span data-role="visual-profile-state">Active</span></label>
                  </div>
                  <div class="ss-library-visual-prompts">
                    <label class="ss-field"><span>Positive base</span><textarea class="ss-textarea" data-role="visual-positive" placeholder="Character identity and consistent visual tags…"></textarea></label>
                    <label class="ss-field"><span>Negative base</span><textarea class="ss-textarea" data-role="visual-negative" placeholder="Things to consistently avoid…"></textarea></label>
                  </div>
                  <div class="ss-library-visual-options">
                    <label class="ss-field"><span>Checkpoint</span><select class="ss-select" data-role="visual-checkpoint"><option value="">Use current Studio checkpoint</option></select></label>
                    <label class="ss-field"><span>Base LoRA stack</span><select class="ss-select" data-role="visual-stack"><option value="">No bound stack</option></select></label>
                  </div>
                </section>
                <section class="ss-library-visual-section ss-library-look-section">
                  <div class="ss-library-visual-section-title">
                    <div><strong>Named looks</strong><span class="ss-muted ss-tiny">Outfits and visual variants appended to the identity layer</span></div>
                    <div class="ss-library-look-heading-actions">
                      <span class="ss-library-look-count" data-role="library-look-count">0 looks</span>
                      <button class="ss-button" data-action="library-new-look">${PLUS_ICON}<span>Add look</span></button>
                    </div>
                  </div>
                  <div class="ss-library-look-grid" data-role="library-look-list"></div>
                </section>
              </div>
              <div class="ss-library-visual-body ss-library-look-editor" data-role="library-look-editor" hidden>
                <section class="ss-library-visual-section">
                  <div class="ss-library-look-editor-grid">
                    <label class="ss-field"><span>Look name</span><input class="ss-input" data-role="library-look-name" placeholder="Formal"></label>
                    <label class="ss-field"><span>Aliases / prose cues</span><input class="ss-input" data-role="library-look-aliases" placeholder="formalwear, gala, suit"></label>
                    <label class="ss-field"><span>Outfit prompt</span><textarea class="ss-textarea" data-role="library-look-outfit" placeholder="black tailored suit, white dress shirt…"></textarea></label>
                    <label class="ss-field"><span>Additional negative</span><textarea class="ss-textarea" data-role="library-look-negative" placeholder="casual clothes, sleepwear…"></textarea></label>
                    <label class="ss-field"><span>Optional checkpoint override</span><select class="ss-select" data-role="library-look-checkpoint"><option value="">Inherit character checkpoint</option></select></label>
                    <label class="ss-field"><span>Optional LoRA stack</span><select class="ss-select" data-role="library-look-stack"><option value="">No additional LoRAs</option></select></label>
                    <label class="ss-field ss-library-look-wide"><span>Trigger words</span><input class="ss-input" data-role="library-look-triggers" placeholder="formal outfit, tailored suit"></label>
                    <label class="ss-field"><span>Reference / init image URL</span><input class="ss-input" data-role="library-look-reference" placeholder="Lumiverse image URL"></label>
                    <label class="ss-field"><span>Thumbnail URL</span><input class="ss-input" data-role="library-look-thumbnail" placeholder="Defaults to reference"></label>
                    <label class="ss-field ss-library-look-wide"><span>Continuity notes</span><textarea class="ss-textarea" data-role="library-look-notes" placeholder="Immutable details, seasonal variations, scene constraints…"></textarea></label>
                  </div>
                </section>
              </div>
              <footer class="ss-library-visual-footer" data-role="library-profile-footer">
                <button class="ss-button" data-action="close-visual-profile">Cancel</button>
                <button class="ss-button ss-button-primary" data-action="save-visual-profile">Save visual binding</button>
              </footer>
              <footer class="ss-library-visual-footer" data-role="library-look-footer" hidden>
                <button class="ss-button ss-library-look-delete" data-action="library-delete-look">Delete</button>
                <button class="ss-button" data-action="library-visual-back">Back to profile</button>
                <button class="ss-button" data-action="library-set-active-look">Set active</button>
                <button class="ss-button ss-button-primary" data-action="library-save-look">Save &amp; activate look</button>
              </footer>
            </section>
          </div>
        </div>
      </div>
    `
    const settingsLayer = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (settingsLayer && shell) shell.appendChild(settingsLayer)
  }

  private bind(): void {
    this.get<HTMLSelectElement>('[data-role="connection"]').addEventListener("change", (event) => {
      const connectionId = (event.currentTarget as HTMLSelectElement).value
      if (connectionId) this.loadConnection(connectionId)
    })
    this.get<HTMLInputElement>('[data-role="lora-search"]').addEventListener("input", () => this.renderLoras())
    const downloadUrl = this.get<HTMLInputElement>('[data-role="lora-download-url"]')
    downloadUrl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault()
        this.startManualLoraDownload()
      }
    })
    downloadUrl.addEventListener("dragover", (event) => event.preventDefault())
    downloadUrl.addEventListener("drop", (event) => {
      event.preventDefault()
      const value = event.dataTransfer?.getData("text/uri-list") || event.dataTransfer?.getData("text/plain") || ""
      if (value.trim()) downloadUrl.value = value.trim().split(/\r?\n/)[0]
    })
    for (const details of this.root.querySelectorAll<HTMLDetailsElement>("details.ss-advanced")) {
      details.addEventListener("toggle", () => this.persistWorkspaceState())
    }
    this.get<HTMLInputElement>('[data-role="library-folder-search"]').addEventListener("input", () => {
      if (this.libraryFolderId === "__landing__") this.renderLibraryFolderLanding()
    })
    this.get<HTMLInputElement>('[data-role="library-search"]').addEventListener("input", () => {
      this.libraryPage = 0
      this.renderOutputLibrary()
    })
    this.get<HTMLInputElement>('[data-role="library-select-nonstarred"]').addEventListener("change", (event) => {
      this.librarySelectOnlyNonStarred = (event.currentTarget as HTMLInputElement).checked
      this.syncVisibleLibrarySelection()
    })
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="appearance-color"]')) {
      input.addEventListener("input", () => {
        const key = input.dataset.colorKey as AppearanceColorKey
        if (!APPEARANCE_COLORS.some((color) => color.key === key)) return
        const next = cloneStudioAppearance(this.appearance)
        next.colors[key] = input.value
        this.onAppearanceChange(next)
      })
    }
    this.get<HTMLInputElement>('[data-role="appearance-radius"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.radius = numberValue(event.currentTarget as HTMLInputElement, 8)
      this.onAppearanceChange(next)
    })
    this.get<HTMLInputElement>('[data-role="appearance-opacity"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.opacity = numberValue(event.currentTarget as HTMLInputElement, 96)
      this.onAppearanceChange(next)
    })
    this.get<HTMLInputElement>('[data-role="appearance-blur"]').addEventListener("input", (event) => {
      const next = cloneStudioAppearance(this.appearance)
      next.blur = numberValue(event.currentTarget as HTMLInputElement, 12)
      this.onAppearanceChange(next)
    })
    this.get<HTMLInputElement>('[data-role="completion-toast"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        completionToast: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="widget-enabled"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        widgetEnabled: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="mobile-quick-create"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        mobileQuickCreate: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="tag-auto-generate"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        tagAutoGenerate: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="tag-prompt-injection"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        tagPromptInjection: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLSelectElement>('[data-role="parser-connection"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        parserConnectionId: (event.currentTarget as HTMLSelectElement).value,
      })
      this.renderParserConnections()
      this.loadParserModels()
    })
    this.get<HTMLInputElement>('[data-role="parser-model"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        parserModel: (event.currentTarget as HTMLInputElement).value.trim(),
      })
    })
    this.get<HTMLInputElement>('[data-role="strip-user-only-lora-stack"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        stripUserOnlyLoraStack: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLInputElement>('[data-role="auto-print-character-positive"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        autoPrintCharacterPositive: (event.currentTarget as HTMLInputElement).checked,
      })
    })
    this.get<HTMLSelectElement>('[data-role="tag-prompt-mode"]').addEventListener("change", (event) => {
      this.onBehaviorChange({
        ...this.behavior,
        tagPromptMode: (event.currentTarget as HTMLSelectElement).value === "pov" ? "pov" : "multi",
      })
    })
    const updateRequiredImageRange = () => {
      const range = normalizeRequiredImageRange(
        this.get<HTMLInputElement>('[data-role="required-image-min"]').value,
        this.get<HTMLInputElement>('[data-role="required-image-max"]').value,
      )
      this.onBehaviorChange({
        ...this.behavior,
        requiredImageMin: range.min,
        requiredImageMax: range.max,
      })
    }
    this.get<HTMLInputElement>('[data-role="required-image-min"]').addEventListener("change", updateRequiredImageRange)
    this.get<HTMLInputElement>('[data-role="required-image-max"]').addEventListener("change", updateRequiredImageRange)
    this.get<HTMLSelectElement>('[data-role="lora-sort"]').addEventListener("change", () => this.renderLoras())
    this.get<HTMLSelectElement>('[data-role="lora-filter"]').addEventListener("change", () => this.renderLoras())
    this.get<HTMLSelectElement>('[data-role="model"]').addEventListener("change", () => {
      this.updateFamilyChip()
      this.renderLoras()
      this.renderStack()
    })
    this.get<HTMLSelectElement>('[data-role="stack-preset"]').addEventListener("change", () => this.updatePresetButtons())
    this.get<HTMLSelectElement>('[data-role="mobile-stack-preset"]').addEventListener("change", (event) => {
      const presetId = (event.currentTarget as HTMLSelectElement).value
      if (presetId) this.loadStackPreset(presetId)
    })
    this.get<HTMLSelectElement>('[data-role="aspect"]').addEventListener("change", () => this.applyAspectSelection())
    this.get<HTMLInputElement>('[data-role="size-slider"]').addEventListener("input", () => this.applyAspectScale())
    this.get<HTMLInputElement>('[data-role="link-size"]').addEventListener("change", () => {
      this.updateSizeLinkControl()
      this.applyAspectSelection()
    })
    this.get<HTMLInputElement>('[data-role="seed"]').addEventListener("input", () => this.updateContextControls())
    this.get<HTMLInputElement>('[data-role="denoise"]').addEventListener("input", (event) => {
      this.get<HTMLElement>('[data-role="denoise-label"]').textContent =
        Number((event.currentTarget as HTMLInputElement).value).toFixed(2)
    })
    this.get<HTMLSelectElement>('[data-role="presets"]').addEventListener("change", (event) => {
      const select = event.currentTarget as HTMLSelectElement
      if (select.value) this.addSelectedPreset(select.value)
      select.value = ""
    })
    this.get<HTMLSelectElement>('[data-role="workflow-select"]').addEventListener("change", (event) => {
      this.selectWorkflow((event.currentTarget as HTMLSelectElement).value)
    })
    const updateRequestedAspect = () => this.updatePreviewAspect(
      numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
      numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
    )
    this.get<HTMLInputElement>('[data-role="width"]').addEventListener("input", (event) => {
      this.updateLinkedCustomDimension("width", Number((event.currentTarget as HTMLInputElement).value))
      updateRequestedAspect()
      this.updateSizeReadout()
      this.updateContextControls()
    })
    this.get<HTMLInputElement>('[data-role="height"]').addEventListener("input", (event) => {
      this.updateLinkedCustomDimension("height", Number((event.currentTarget as HTMLInputElement).value))
      updateRequestedAspect()
      this.updateSizeReadout()
      this.updateContextControls()
    })
    this.get<HTMLInputElement>('[data-role="init-file"]').addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement
      const file = input.files?.[0]
      input.value = ""
      if (file) void this.setInitFromBlob(file, file.name, "")
    })
    this.get<HTMLInputElement>('[data-role="stack-import-file"]').addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement
      const file = input.files?.[0]
      input.value = ""
      if (file) void this.importStackFile(file)
    })

    this.root.addEventListener("change", (event) => {
      const target = event.target as HTMLElement
      const presetToggle = target.closest<HTMLInputElement>('[data-role="preset-enabled"]')
      if (presetToggle?.dataset.presetIndex) {
        const index = Number(presetToggle.dataset.presetIndex)
        if (this.state.selectedPresets[index]) {
          this.state.selectedPresets[index].enabled = presetToggle.checked
          this.updateResolvedPresetSummary()
        }
        return
      }
    })

    this.root.addEventListener("pointerdown", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.beginResize(handle.dataset.resize || "", event)
    })
    this.root.addEventListener("dblclick", (event) => {
      const handle = (event.target as HTMLElement).closest<HTMLElement>("[data-resize]")
      if (handle) this.resetResize(handle.dataset.resize || "")
    })

    const scheduleProfileFromControl = (event: Event) => {
      const target = event.target as HTMLElement
      const role = target.dataset.role || ""
      if (
        /search|appearance|metadata-token|custom-css|library-output-check/.test(role)
        || target.closest('[data-role="config-popover"]')
      ) return
      this.scheduleStudioProfileSync()
    }
    this.root.addEventListener("input", scheduleProfileFromControl)
    this.root.addEventListener("change", scheduleProfileFromControl)

    this.root.addEventListener("click", (event) => {
      const target = event.target as HTMLElement
      const libraryToggle = target.closest<HTMLInputElement>('[data-role="library-output-check"]')
      if (libraryToggle?.dataset.imageId) {
        this.setLibrarySelection(
          libraryToggle.dataset.imageId,
          libraryToggle.checked,
          event.shiftKey,
        )
        this.syncVisibleLibrarySelection()
        event.stopPropagation()
        return
      }
      if (!target.closest(".ss-config-wrap, .ss-settings-layer")) this.closeConfigPopover()
      if (!target.closest(".ss-history-card")) this.closeHistoryMenus()
      if (!target.closest(".ss-lora-sort-wrap")) this.closeLoraSortMenu()
      const button = target.closest<HTMLElement>("[data-action]")
      if (!button) return
      const action = button.dataset.action
      if (action === "refresh-metadata") this.refreshMetadata()
      if (action === "toggle-config") this.toggleConfigPopover(button)
      if (action === "close-settings") this.closeConfigPopover()
      if (action === "settings-tab") this.setSettingsTab(button.dataset.settingsTab || "general")
      if (action === "set-request-mode") {
        const requestMode = button.dataset.requestMode === "parser" ? "parser" : "inline"
        this.onBehaviorChange({ ...this.behavior, requestMode })
      }
      if (action === "copy-tag-protocol") void this.copyTagProtocol()
      if (action === "reset-tag-protocol") this.resetTagProtocol()
      if (action === "save-tag-protocol") this.saveTagProtocol()
      if (action === "set-inline-image-scale") {
        const scale = Number(button.dataset.scale)
        if (scale === 100 || scale === 75 || scale === 50) {
          this.onBehaviorChange({ ...this.behavior, inlineImageScale: scale })
        }
      }
      if (action === "save-character-base-tags") this.saveCharacterBaseTags()
      if (action === "clear-character-base-tags") this.clearCharacterBaseTags()
      if (action === "set-theme") {
        const theme = button.dataset.themeValue
        if (STUDIO_THEMES.some((item) => item.id === theme)) this.onThemeChange(theme as StudioTheme)
      }
      if (action === "reset-appearance") {
        const next = cloneStudioAppearance(this.appearance)
        next.colors = {}
        next.radius = null
        next.opacity = 96
        next.blur = 12
        this.onAppearanceChange(next)
      }
      if (action === "apply-custom-css") {
        const next = cloneStudioAppearance(this.appearance)
        next.customCss = sanitizeCustomCss(this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value)
        this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = next.customCss
        this.onAppearanceChange(next)
        this.setRunStatus("Custom Studio CSS applied.")
      }
      if (action === "clear-custom-css") {
        const next = cloneStudioAppearance(this.appearance)
        next.customCss = ""
        this.get<HTMLTextAreaElement>('[data-role="custom-css"]').value = ""
        this.onAppearanceChange(next)
        this.setRunStatus("Custom Studio CSS cleared.")
      }
      if (action === "save-token") this.saveToken()
      if (action === "clear-token") this.clearToken()
      if (action === "close-studio") this.modal.dismiss()
      if (action === "change-orientation") this.changeOrientation()
      if (action === "toggle-seed-mode") this.toggleSeedMode()
      if (action === "random-seed-mobile") this.useRandomSeed()
      if (action === "toggle-size-link") this.toggleSizeLink()
      if (action === "open-workflow-setup") this.openWorkflowSetup()
      if (action === "close-workflow-setup") this.closeWorkflowSetup()
      if (action === "use-standard-workflow") {
        this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
        this.selectWorkflow("")
      }
      if (action === "use-current-init" || action === "use-as-init") void this.useCurrentAsInit()
      if (action === "pick-init") this.get<HTMLInputElement>('[data-role="init-file"]').click()
      if (action === "clear-init") this.clearInitImage()
      if (action === "toggle-lora-download") this.toggleLoraDownloader()
      if (action === "start-lora-download") this.startManualLoraDownload()
      if (action === "cancel-lora-download") this.cancelLoraDownload()
      if (action === "toggle-lora-sort-menu") this.toggleLoraSortMenu()
      if (action === "select-lora-sort") this.selectLoraSort(button.dataset.sortValue || "title")
      if (action === "toggle-lora-folders") this.toggleLoraFolders()
      if (action === "select-lora-folder") this.selectLoraFolder(button.dataset.folderPath || "__all__")
      if (action === "toggle-generation") this.togglePane("generation")
      if (action === "toggle-history") this.togglePane("history")
      if (action === "toggle-loras") this.togglePane("loras")
      if (action === "toggle-fullscreen") this.toggleFullscreen()
      if (action === "mobile-tab") this.setMobileTab(button.dataset.tab || "create")
      if (action === "clear-stack") {
        this.state.stack = []
        this.renderStack()
        this.renderLoras()
      }
      if (action === "save-stack") this.saveStackPreset()
      if (action === "load-stack") this.loadStackPreset()
      if (action === "delete-stack") this.deleteStackPreset()
      if (action === "export-stack") this.exportStack()
      if (action === "import-stack") this.get<HTMLInputElement>('[data-role="stack-import-file"]').click()
      if (action === "apply-lumi-stack") void this.applyLumiverseStack()
      if (action === "close-missing-loras") this.closeMissingLoras()
      if (action === "copy-missing-loras") void this.copyMissingLoras()
      if (action === "download-missing-loras") this.downloadSelectedMissingLoras()
      if (action === "close-save-preset") this.closeSavePresetModal()
      if (action === "confirm-save-preset") this.confirmSavePreset()
      if (action === "open-preset-manager") this.openPresetManager()
      if (action === "close-preset-manager") this.closePresetManager()
      if (action === "delete-swarm-preset") this.deleteSwarmPreset(button.dataset.presetTitle || "")
      if (action === "close-move-folder") this.closeMoveFolderModal()
      if (action === "move-folder-choice") this.confirmMoveFolder(button.dataset.folderId || "")
      if (action === "edit-prompt") this.openPromptEditor(button.dataset.promptRole || "")
      if (action === "generate") this.generate()
      if (action === "interrupt-generation") this.interruptGeneration()
      if (action === "refresh-outputs") this.refreshOutputs()
      if (action === "history-prev") this.changeHistoryPage(-1)
      if (action === "history-next") this.changeHistoryPage(1)
      if (action === "download-output") this.downloadCurrent()
      if (action === "copy-output") void this.copyCurrentUrl()
      if (action === "append-to-chat") this.appendCurrentToChat()
      if (action === "inspect-output") this.openInspector()
      if (action === "close-inspector") this.closeInspector()
      if (action === "reuse-parameters") this.reuseCurrentParameters()
      if (action === "delete-output") this.deleteCurrentOutput()
      if (action === "open-output-library") this.openOutputLibrary()
      if (action === "close-output-library") this.closeOutputLibrary()
      if (action === "create-output-folder") this.openNewFolderModal()
      if (action === "close-new-folder") this.closeNewFolderModal()
      if (action === "confirm-new-folder") this.createOutputFolder()
      if (action === "delete-output-folder") this.deleteSelectedOutputFolder()
      if (action === "toggle-library-search") this.toggleLibrarySearch()
      if (action === "toggle-library-selection") this.toggleLibrarySelectionMode()
      if (action === "save-visual-profile") this.saveVisualProfile()
      if (action === "open-visual-profile") this.openVisualProfile()
      if (action === "close-visual-profile") this.closeVisualProfile()
      if (action === "library-edit-look") this.openLibraryLook(button.dataset.lookId || "")
      if (action === "library-new-look") this.openLibraryLook("")
      if (action === "library-visual-back") this.showLibraryVisualProfile()
      if (action === "library-save-look") this.saveLibraryLook()
      if (action === "library-set-active-look") this.activateLibraryLook(this.libraryLookId)
      if (action === "library-delete-look") this.deleteLibraryLook()
      if (action === "library-back") {
        this.closeVisualProfile()
        this.libraryFolderId = "__landing__"
        this.libraryPage = 0
        this.renderOutputLibrary()
      }
      if (action === "toggle-active-visual") this.toggleActiveVisualBinding()
      if (action === "toggle-active-persona-visual") this.toggleActivePersonaVisual()
      if (action === "library-prev") this.changeLibraryPage(-1)
      if (action === "library-next") this.changeLibraryPage(1)
      if (action === "select-library-page") this.toggleLibraryPageSelection()
      if (action === "bulk-move-outputs") this.bulkMoveOutputs()
      if (action === "bulk-favorite-outputs") this.bulkFavoriteOutputs()
      if (action === "bulk-delete-outputs") this.bulkDeleteOutputs()
      if (action === "toggle-current-favorite") this.toggleCurrentFavorite()
      if (action === "preset-up") this.moveSelectedPreset(Number(button.dataset.presetIndex), -1)
      if (action === "preset-down") this.moveSelectedPreset(Number(button.dataset.presetIndex), 1)
      if (action === "preset-apply") this.applySelectedPreset(Number(button.dataset.presetIndex))
      if (action === "preset-remove") this.removeSelectedPreset(Number(button.dataset.presetIndex))
      if (action === "add-swarm-preset") this.openSavePresetModal()
      if (action === "move-library-output" && button.dataset.imageId) this.openMoveFolderModal([button.dataset.imageId])
      if (action === "library-folder") {
        this.libraryFolderId = button.dataset.folderId || ""
        this.libraryPage = 0
        this.librarySelectionAnchorId = ""
        this.renderOutputLibrary()
      }
      if (action === "zoom-in") this.setInspectorZoom(this.imageScale + 0.25)
      if (action === "zoom-out") this.setInspectorZoom(this.imageScale - 0.25)
      if (action === "zoom-reset") {
        this.setInspectorZoom(1)
        this.fitInspectorToSpace()
      }
    })
  }

  private send(type: string, data: Record<string, unknown> = {}): string {
    const requestId = createRequestId()
    this.ctx.sendToBackend({ type, requestId, ...data })
    return requestId
  }

  private openPromptEditor(role: string): void {
    if (role !== "positive" && role !== "negative") return
    const input = this.get<HTMLTextAreaElement>(`[data-role="${role}"]`)
    this.send("open_text_editor", {
      editorId: `studio-${role}`,
      title: role === "positive" ? "Swarm Studio · Positive prompt" : "Swarm Studio · Negative prompt",
      value: input.value,
      placeholder: input.placeholder,
    })
  }

  private rememberSettledTaggedJob(jobId: string): void {
    if (!jobId) return
    this.rememberSettledGenerationJob(jobId)
    this.settledTaggedJobIds.add(jobId)
    if (this.settledTaggedJobIds.size > 64) {
      const oldest = this.settledTaggedJobIds.values().next().value
      if (oldest) this.settledTaggedJobIds.delete(oldest)
    }
  }

  private rememberSettledGenerationJob(jobId: string): void {
    if (!jobId) return
    this.settledGenerationJobIds.add(jobId)
    if (this.settledGenerationJobIds.size > 64) {
      const oldest = this.settledGenerationJobIds.values().next().value
      if (oldest) this.settledGenerationJobIds.delete(oldest)
    }
  }

  private adoptTaggedJob(job: any): void {
    const jobId = String(job?.clientJobId || "")
    const taggedJobId = String(job?.id || "")
    if (
      !jobId
      || this.settledGenerationJobIds.has(jobId)
      || this.settledTaggedJobIds.has(jobId)
    ) return
    if (taggedJobId) {
      const previousAttemptId = this.activeTaggedAttempts.get(taggedJobId)
      if (previousAttemptId && previousAttemptId !== jobId) {
        this.activeTaggedJobs.delete(previousAttemptId)
        if (this.currentJobSource === "tagged" && this.currentJobId === previousAttemptId) {
          this.currentJobId = jobId
        }
      }
      this.activeTaggedAttempts.set(taggedJobId, jobId)
    }
    this.activeTaggedJobs.set(jobId, job)
    if (this.generating && this.currentJobSource === "manual") return
    if (
      this.currentJobSource === "tagged"
      && this.currentJobId
      && this.activeTaggedJobs.has(this.currentJobId)
    ) return
    if (!this.generating) this.preGenerationImage = this.state.currentImage
    this.generating = true
    this.currentJobId = jobId
    this.currentJobConnectionId = ""
    this.currentJobSource = "tagged"
    this.setGenerating(true)
    this.updateGenerationProgress(0, 0)
    this.setRunStatus("Rendering a message illustration in SwarmUI…")
  }

  private settleTaggedJob(jobId: string, taggedJobId = ""): boolean {
    const mappedJobId = taggedJobId ? String(this.activeTaggedAttempts.get(taggedJobId) || "") : ""
    const terminalJobId = jobId || mappedJobId
    if (terminalJobId) this.rememberSettledTaggedJob(terminalJobId)
    if (mappedJobId && mappedJobId !== terminalJobId) this.rememberSettledTaggedJob(mappedJobId)
    if (taggedJobId) this.activeTaggedAttempts.delete(taggedJobId)
    if (terminalJobId) this.activeTaggedJobs.delete(terminalJobId)
    if (mappedJobId) this.activeTaggedJobs.delete(mappedJobId)
    if (this.currentJobSource !== "tagged") return false

    const activeAttemptIds = new Set(this.activeTaggedAttempts.values())
    const terminalMatchesCurrent = Boolean(
      this.currentJobId
      && (this.currentJobId === terminalJobId || this.currentJobId === mappedJobId),
    )
    const currentTaggedAttemptIsStale = Boolean(this.currentJobId)
      && !activeAttemptIds.has(this.currentJobId)
    if (
      this.currentJobId
      && !terminalMatchesCurrent
      && !currentTaggedAttemptIsStale
      && this.activeTaggedJobs.has(this.currentJobId)
    ) return false

    const next = this.activeTaggedJobs.values().next().value
    if (next) {
      this.currentJobId = ""
      this.adoptTaggedJob(next)
      return false
    }

    this.generating = false
    this.currentJobId = ""
    this.currentJobConnectionId = ""
    this.currentJobSource = ""
    this.setGenerating(false)
    return true
  }

  onMessage(payload: any): void {
    if (this.disposed) return
    const data = payload?.data || {}
    switch (payload?.type) {
      case "bootstrap_result":
        this.state.connections = Array.isArray(data.connections) ? data.connections : []
        this.state.parserConnections = Array.isArray(data.parserConnections) ? data.parserConnections : []
        this.acceptOutputPage(data)
        this.state.stackPresets = Array.isArray(data.stackPresets) ? data.stackPresets : []
        this.state.outputFolders = Array.isArray(data.outputFolders) ? data.outputFolders : []
        this.state.activeChat = data.activeChat || null
        this.state.permissions = data.permissions || {}
        this.state.chatVisuals = data.chatVisuals || null
        this.acceptCharacterBaseTags(data.characterBaseTags)
        this.renderPermissions()
        this.renderParserConnections()
        this.loadParserModels()
        this.populateConnections()
        this.renderOutputs()
        this.renderStackPresets()
        this.hydrateActiveVisualStack()
        this.updateActiveVisualPill()
        this.updateActivePersonaVisualPill()
        this.syncFavoriteControls()
        break
      case "parser_models_result":
        if (payload.requestId !== this.parserModelRequestId) break
        if (String(data.connectionId || "") !== this.selectedParserConnectionId()) break
        this.state.parserModels = Array.isArray(data.models)
          ? data.models
              .map((model: any) => ({
                id: String(model?.id || "").trim(),
                label: String(model?.label || model?.id || "").trim(),
              }))
              .filter((model: { id: string; label: string }) => model.id)
          : []
        this.renderParserModels()
        break
      case "chat_visuals_result":
        this.state.chatVisuals = data as ChatVisualsState
        this.state.outputFolders = data.characterFolder
          ? [
              ...this.state.outputFolders.filter((folder) => folder.id !== data.characterFolder.id),
              data.characterFolder,
            ]
          : this.state.outputFolders
        this.state.stackPresets = Array.isArray(data.stackPresets) ? data.stackPresets : this.state.stackPresets
        this.renderStackPresets()
        this.hydratedVisualCharacterId = ""
        this.hydrateActiveVisualStack(true)
        this.updateActiveVisualPill()
        this.updateActivePersonaVisualPill()
        this.updateTriggerSummary()
        break
      case "character_base_tags_result":
        this.acceptCharacterBaseTags(data)
        this.setRunStatus(
          this.state.characterBaseTags.source === "studio"
            ? `Saved base tags for ${this.state.characterBaseTags.characterName || "this character"}.`
            : this.state.characterBaseTags.source === "lumiverse"
              ? "Studio tags cleared; using Lumiverse's native base tags as a fallback."
              : "Character base tags cleared.",
        )
        break
      case "connection_result":
        if (payload.requestId !== this.connectionRequestId) return
        this.acceptConnectionData(data)
        this.send("get_lora_download_status")
        this.applyPendingTaggedPrompt()
        this.setRunStatus(data.metadataError ? "Ready — LoRA metadata needs attention." : "Ready.")
        this.scheduleStudioProfileSync()
        break
      case "metadata_result":
        this.state.loras = Array.isArray(data.loras) ? data.loras : []
        this.state.stack = this.state.stack.map((item) => ({
          ...item,
          lora: this.installedLora(item.lora.name) || item.lora,
        }))
        this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))
        this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : this.state.checkpoints
        this.acceptSwarmOptions(data.swarmOptions)
        this.showMetadataError(data.metadataError || "")
        this.updateFamilyChip()
        this.renderLoras()
        this.renderStack()
        if (!this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden) {
          if (this.missingLoras.length) this.showMissingLoras()
          else this.closeMissingLoras()
        }
        this.setRunStatus(`Metadata refreshed: ${this.state.loras.length} LoRAs.`)
        this.setConnectionStatus("ready")
        break
      case "lora_download_status": {
        const jobId = String(data.id || "")
        if (!jobId) break
        const status = String(data.status || "")
        const active = data.active === true
        const progress = Number.isFinite(Number(data.overallProgress)) ? Number(data.overallProgress) : 0
        const error = String(data.error || "")
        const message = [String(data.message || ""), error].filter(Boolean).join(" ")
        this.loraDownloadJobId = jobId
        this.loraDownloadActive = active
        if (active) this.toggleLoraDownloader(true, false)
        this.setLoraDownloadStatus(message, status === "failed", progress)
        if (status === "complete" && this.handledLoraDownloadJobId !== jobId) {
          this.get<HTMLInputElement>('[data-role="lora-download-url"]').value = ""
          this.get<HTMLInputElement>('[data-role="lora-download-name"]').value = ""
          if (this.state.connection?.id === String(data.connectionId || "")) {
            this.handledLoraDownloadJobId = jobId
            this.send("refresh_metadata", { connectionId: this.state.connection.id })
          }
        }
        break
      }
        break
      case "preview_result":
        if (payload?.name && payload?.dataUrl) {
          this.previewCache.set(payload.name, payload.dataUrl)
          this.updatePreviewImages(payload.name, payload.dataUrl)
        }
        break
      case "text_editor_result": {
        const editorId = String(data.editorId || "")
        if (!editorId.startsWith("studio-") || data.cancelled === true) break
        const role = editorId.slice(7)
        if (role !== "positive" && role !== "negative") break
        this.get<HTMLTextAreaElement>(`[data-role="${role}"]`).value = String(data.text || "")
        this.activity?.captureDraft(this.exportDraft())
        break
      }
      case "swarm_output_download": {
        const dataUrl = String(data.dataUrl || "")
        if (!dataUrl.startsWith("data:image/")) {
          this.setRunStatus("SwarmUI did not return a downloadable image.", true)
          break
        }
        const anchor = document.createElement("a")
        anchor.href = dataUrl
        anchor.download = String(data.filename || `swarm-output-${Date.now()}.png`)
          .replace(/[^a-z0-9_.-]+/gi, "-")
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        this.setRunStatus("Downloaded the original SwarmUI output with embedded metadata.")
        break
      }
      case "output_metadata_result": {
        if (payload.requestId !== this.outputMetadataRequestId) break
        this.outputMetadataRequestId = ""
        const image = this.state.currentImage
        if (!image || String(image.id || "") !== String(data.imageId || "")) {
          this.pendingMetadataAction = ""
          break
        }
        image.details = data.details as GenerationDetails
        const action = this.pendingMetadataAction
        this.pendingMetadataAction = ""
        if (!this.get<HTMLElement>('[data-role="inspector"]').hidden) this.openInspector()
        if (action === "reuse") this.reuseCurrentParameters()
        if (action === "init") void this.useCurrentAsInit()
        break
      }
      case "swarm_workflow_result":
        if (payload.requestId !== this.workflowRequestId) break
        this.workflowRequestId = ""
        this.state.selectedWorkflow = data as SwarmWorkflowDetails
        this.initializeWorkflowValues(this.state.selectedWorkflow)
        if (this.pendingWorkflowRestore?.name === this.state.selectedWorkflow.name) {
          for (const [key, value] of Object.entries(this.pendingWorkflowRestore.values)) {
            this.workflowValues.set(key, value)
          }
          this.workflowEnabled.clear()
          for (const key of this.pendingWorkflowRestore.enabled) this.workflowEnabled.add(key)
          this.workflowImageValues.clear()
          for (const [key, value] of Object.entries(this.pendingWorkflowRestore.images)) {
            this.workflowImageValues.set(key, value)
          }
        }
        this.pendingWorkflowRestore = null
        this.renderWorkflowControls()
        if (this.workflowOpenOnLoad) this.openWorkflowSetup()
        this.workflowOpenOnLoad = true
        this.setRunStatus(`Loaded workflow “${this.state.selectedWorkflow.name}”.`)
        break
      case "tagged_image_jobs_result": {
        const jobs = Array.isArray(data) ? data : []
        this.activeTaggedJobs.clear()
        this.activeTaggedAttempts.clear()
        for (const job of jobs) {
          const jobId = String(job?.clientJobId || "")
          const taggedJobId = String(job?.id || "")
          if (!jobId) continue
          if (job?.status === "queued" || job?.status === "generating") {
            if (
              !this.settledGenerationJobIds.has(jobId)
              && !this.settledTaggedJobIds.has(jobId)
            ) {
              this.activeTaggedJobs.set(jobId, job)
              if (taggedJobId) this.activeTaggedAttempts.set(taggedJobId, jobId)
            }
          } else if (job?.status === "ready" || job?.status === "failed" || job?.status === "cancelled") {
            this.rememberSettledTaggedJob(jobId)
          }
        }
        if (
          this.currentJobSource === "tagged"
          && this.currentJobId
          && !this.activeTaggedJobs.has(this.currentJobId)
        ) {
          this.settleTaggedJob(this.currentJobId)
        } else {
          const active = this.activeTaggedJobs.values().next().value
          if (active) this.adoptTaggedJob(active)
        }
        break
      }
      case "tagged_image_job": {
        const jobId = String(data.clientJobId || "")
        const taggedJobId = String(data.id || "")
        if ((data.status === "queued" || data.status === "generating") && jobId) {
          this.adoptTaggedJob(data)
        } else if (data.status === "ready") {
          this.settleTaggedJob(jobId, taggedJobId)
        } else if (data.status === "failed" || data.status === "cancelled") {
          const wasCurrent = this.currentJobSource === "tagged" && jobId === this.currentJobId
          const idle = this.settleTaggedJob(jobId, taggedJobId)
          if (wasCurrent && idle) {
            if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
            this.preGenerationImage = null
            this.setRunStatus(String(data.error || "Message illustration stopped."), data.status === "failed")
          }
        }
        break
      }
      case "generation_started": {
        const jobId = String(payload.clientJobId || "")
        if (jobId && this.settledGenerationJobIds.has(jobId)) break
        if (!this.currentJobId || payload.clientJobId === this.currentJobId) {
          const source = (
            this.currentJobSource === "tagged"
            || this.activeTaggedJobs.has(jobId)
            || [...this.activeTaggedAttempts.values()].includes(jobId)
          ) ? "tagged" : "manual"
          this.generating = true
          this.currentJobId = jobId || this.currentJobId
          this.currentJobConnectionId = String(data.connectionId || this.currentJobConnectionId)
          this.currentJobSource = source
          this.setGenerating(true)
        }
        break
      }
      case "token_saved":
      case "token_cleared":
        this.acceptConnectionData(data)
        this.get<HTMLInputElement>('[data-role="metadata-token"]').value = ""
        this.setRunStatus(payload.type === "token_saved" ? "Metadata token saved and library refreshed." : "Metadata token cleared.")
        break
      case "generation_result":
        this.rememberSettledGenerationJob(String(payload.clientJobId || this.currentJobId))
        this.generating = false
        this.currentJobId = ""
        this.currentJobConnectionId = ""
        this.currentJobSource = ""
        this.setGenerating(false)
        this.acceptOutputPage(data)
        if (Array.isArray(data.outputFolders)) this.state.outputFolders = data.outputFolders
        if (data.result?.imageDataUrl) {
          this.setCurrentImage({
            id: data.result.imageId || data.record?.imageId,
            src: data.result.imageDataUrl,
            url: data.result.imageUrl || data.result.imageDataUrl,
            label: `${data.result.model || "SwarmUI"} · just generated`,
            details: data.record || this.pendingGeneration,
          })
        }
        this.pendingGeneration = null
        this.preGenerationImage = null
        this.renderOutputs()
        this.updateActiveVisualPill()
        this.setRunStatus("Generation complete. Output saved to Lumiverse.")
        break
      case "tagged_generation_result": {
        const taggedJobId = String(data?.taggedJob?.clientJobId || "")
        const idle = this.settleTaggedJob(taggedJobId, String(data?.taggedJob?.id || ""))
        if (idle) this.preGenerationImage = null
        this.acceptOutputPage(data)
        if (Array.isArray(data.outputFolders)) this.state.outputFolders = data.outputFolders
        const imageSrc = String(data.result?.imageDataUrl || data.result?.imageUrl || data.record?.imageUrl || "")
        if (imageSrc) {
          this.setCurrentImage({
            id: data.result?.imageId || data.record?.imageId,
            src: imageSrc,
            url: data.result?.imageUrl || data.record?.imageUrl || imageSrc,
            label: `${data.result?.model || data.record?.model || "SwarmUI"} · message illustration`,
            details: data.record || null,
          })
        }
        this.renderOutputs()
        this.updateActiveVisualPill()
        this.setRunStatus(idle || this.currentJobSource !== "tagged"
          ? "Message illustration complete. Output synced to Studio."
          : "Message illustration complete. Rendering the remaining queued image…")
        break
      }
      case "generation_progress": {
        if (this.settledGenerationJobIds.has(String(payload.clientJobId || ""))) break
        if (!this.currentJobId || payload.clientJobId !== this.currentJobId) break
        const step = Number.isFinite(data.step) ? Number(data.step) : 0
        const totalSteps = Number.isFinite(data.totalSteps) ? Number(data.totalSteps) : 0
        if (typeof data.preview === "string" && data.preview) {
          this.showLivePreview(data.preview, step, totalSteps)
        }
        this.updateGenerationProgress(step, totalSteps)
        this.setRunStatus("Rendering in SwarmUI…")
        break
      }
      case "generation_interrupt_requested":
        if (payload.clientJobId === this.currentJobId) {
          this.setRunStatus("Interrupt requested — stopping SwarmUI…")
        }
        break
      case "generation_interrupted":
        if (!payload.clientJobId || payload.clientJobId === this.currentJobId) {
          this.rememberSettledGenerationJob(String(payload.clientJobId || this.currentJobId))
          this.generating = false
          this.currentJobId = ""
          this.currentJobConnectionId = ""
          this.currentJobSource = ""
          this.pendingGeneration = null
          this.setGenerating(false)
          if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
          else this.clearCurrentImage()
          this.preGenerationImage = null
          this.setRunStatus("Generation interrupted. Your previous output is still safe.")
        }
        break
      case "swarm_preset_added":
        this.acceptSwarmOptions(data.swarmOptions)
        this.addSelectedPreset(String(data.title || ""))
        this.setRunStatus(`Saved and selected Swarm preset “${data.title}”.`)
        break
      case "swarm_preset_deleted": {
        const title = String(data.title || "")
        this.state.selectedPresets = this.state.selectedPresets.filter((preset) => preset.title !== title)
        this.acceptSwarmOptions(data.swarmOptions)
        this.renderPresetManager()
        this.setRunStatus(`Deleted Swarm preset “${title}”.`)
        break
      }
      case "outputs_result":
        this.acceptOutputPage(data)
        this.renderOutputs()
        this.setRunStatus(`History refreshed: ${this.state.outputTotal} outputs.`)
        break
      case "character_visual_canon_result": {
        const folder = data.folder as OutputFolder | null
        if (folder?.id) {
          this.state.outputFolders = [
            folder,
            ...this.state.outputFolders.filter((candidate) => candidate.id !== folder.id),
          ]
          if (this.libraryVisualMode === "look") this.libraryLookId = String(data.activeLookId || folder.binding?.activeLookId || "")
          this.renderOutputLibrary()
          if (!this.get<HTMLElement>('[data-role="library-visual-profile"]').hidden) this.renderVisualProfile()
          this.updateActiveVisualPill()
          this.setRunStatus("Character look updated.")
        }
        break
      }
      case "library_outputs_result":
        this.state.libraryOutputs = Array.isArray(data.outputs) ? data.outputs : []
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        {
          const available = new Set(this.state.libraryOutputs.map((output) => String(output.id)))
          for (const imageId of this.librarySelection) {
            if (!available.has(imageId)) this.librarySelection.delete(imageId)
          }
        }
        this.updateActiveVisualPill()
        this.renderOutputLibrary()
        break
      case "output_folders_result":
        this.state.outputFolders = Array.isArray(data) ? data : []
        if (this.pendingCreatedFolder) {
          const pending = this.pendingCreatedFolder
          const created = pending.bindingType === "character"
            ? this.activeVisualFolder()
            : this.state.outputFolders.find((folder) => folder.name.toLowerCase() === pending.name.toLowerCase())
          if (created) this.libraryFolderId = created.id
          this.pendingCreatedFolder = null
        }
        this.librarySelection.clear()
        this.librarySelectionMode = false
        this.renderOutputLibrary()
        this.updateActiveVisualPill()
        this.syncFavoriteControls()
        this.setRunStatus("Output folders updated.")
        break
      case "output_favorites_result": {
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        const imageIds = Array.isArray(data.imageIds) ? data.imageIds.map(String) : []
        imageIds.forEach((imageId) => this.librarySelection.delete(imageId))
        if (!this.librarySelection.size) this.librarySelectionAnchorId = ""
        this.renderOutputLibrary()
        this.renderOutputs()
        this.syncFavoriteControls()
        this.setRunStatus(
          data.favorite
            ? `Added ${imageIds.length} output${imageIds.length === 1 ? "" : "s"} to Favorites.`
            : `Removed ${imageIds.length} output${imageIds.length === 1 ? "" : "s"} from Favorites.`,
        )
        break
      }
      case "output_appended_to_chat":
        this.setRunStatus(`Appended “${data.label || "output"}” to the active Lumiverse chat.`)
        break
      case "output_deleted":
        this.acceptOutputPage(data)
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        this.state.libraryOutputs = this.state.libraryOutputs.filter((output) => String(output.id) !== String(data.imageId))
        this.librarySelection.delete(String(data.imageId))
        if (this.state.currentImage?.id === data.imageId) this.clearCurrentImage()
        this.closeInspector()
        this.renderOutputs()
        this.renderOutputLibrary()
        this.setRunStatus("Output deleted from Lumiverse.")
        break
      case "outputs_bulk_deleted": {
        this.acceptOutputPage(data)
        const deleted = new Set(Array.isArray(data.deletedIds) ? data.deletedIds : [])
        this.state.outputFolders = Array.isArray(data.folders) ? data.folders : this.state.outputFolders
        this.state.libraryOutputs = this.state.libraryOutputs.filter((output) => !deleted.has(String(output.id)))
        this.librarySelection.clear()
        if (this.state.currentImage?.id && deleted.has(this.state.currentImage.id)) this.clearCurrentImage()
        this.closeInspector()
        this.renderOutputs()
        this.renderOutputLibrary()
        const failedCount = Array.isArray(data.failedIds) ? data.failedIds.length : 0
        this.setRunStatus(
          failedCount
            ? `Deleted ${deleted.size} outputs; ${failedCount} could not be deleted.`
            : `Deleted ${deleted.size} outputs from Lumiverse.`,
          failedCount > 0,
        )
        break
      }
      case "stack_presets_result":
        this.state.stackPresets = Array.isArray(data) ? data : []
        this.renderStackPresets()
        this.hydrateActiveVisualStack()
        if (!this.get<HTMLElement>('[data-role="output-library"]').hidden) this.renderOutputLibrary()
        this.updateActiveVisualPill()
        this.setRunStatus("Saved LoRA stacks updated.")
        break
      case "studio_error":
        if (payload.operation === "resolve_output_metadata" && this.outputMetadataRequestId) {
          const action = this.pendingMetadataAction
          this.outputMetadataRequestId = ""
          this.pendingMetadataAction = ""
          if (this.state.currentImage?.details) this.state.currentImage.details.metadataSource = "record-fallback"
          if (action === "reuse") this.reuseCurrentParameters()
          if (action === "init") void this.useCurrentAsInit()
          this.setRunStatus("Exact Swarm metadata was unavailable; used the saved Studio parameters instead.", true)
          break
        }
        if (payload.operation === "start_lora_download") {
          this.loraDownloadRequestId = ""
          this.loraDownloadActive = false
          this.setLoraDownloadStatus(payload.error || "SwarmUI could not start that download.", true)
        }
        if (payload.operation === "create_output_folder") this.pendingCreatedFolder = null
        if (payload.operation === "load_swarm_workflow") {
          this.workflowRequestId = ""
          this.state.selectedWorkflow = null
          this.workflowValues.clear()
          this.workflowEnabled.clear()
          this.workflowImageValues.clear()
          this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
          this.renderWorkflowControls()
        }
        if (payload.operation === "generate") {
          this.rememberSettledGenerationJob(String(payload.clientJobId || this.currentJobId))
          this.generating = false
          this.currentJobId = ""
          this.currentJobConnectionId = ""
          this.currentJobSource = ""
          this.pendingGeneration = null
          this.setGenerating(false)
          if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
          this.preGenerationImage = null
        }
        this.setConnectionStatus("error")
        this.setRunStatus(payload.error || "Swarm Studio request failed.", true)
        if (payload.operation === "preview" && payload.name) {
          this.requestedPreviews.delete(payload.name)
        }
        break
    }
  }

  onImageGenerationEvent(type: "progress" | "complete" | "error", payload: any): void {
    if (!this.currentJobId || payload?.assetId !== this.currentJobId) return
    if (payload?.extensionIdentifier && payload.extensionIdentifier !== "swarm_studio") return

    if (type === "progress") {
      const step = Number.isFinite(payload?.step) ? Number(payload.step) : 0
      const totalSteps = Number.isFinite(payload?.totalSteps) ? Number(payload.totalSteps) : 0
      if (typeof payload?.preview === "string" && payload.preview) {
        this.showLivePreview(payload.preview, step, totalSteps)
      }
      this.updateGenerationProgress(step, totalSteps)
      this.setRunStatus("Rendering in SwarmUI…")
      return
    }

    if (type === "complete") {
      const completedJobId = this.currentJobId
      const completedSource = this.currentJobSource
      this.rememberSettledGenerationJob(completedJobId)
      const imageId = String(payload?.imageId || "")
      const imageUrl = String(
        payload?.imageUrl
        || (imageId ? `/api/v1/image-gen/results/${encodeURIComponent(imageId)}` : ""),
      )
      let idle = true
      if (completedSource === "tagged") {
        idle = this.settleTaggedJob(completedJobId)
      } else {
        this.generating = false
        this.currentJobId = ""
        this.currentJobConnectionId = ""
        this.currentJobSource = ""
        this.setGenerating(false)
      }
      this.updateGenerationProgress(1, 1)
      if (imageUrl) {
        this.setCurrentImage({
          id: imageId || undefined,
          src: imageUrl,
          url: imageUrl,
          label: `${this.pendingGeneration?.model || "SwarmUI"} · just generated`,
          details: this.pendingGeneration,
        })
      }
      if (idle) this.preGenerationImage = null
      this.setRunStatus(idle
        ? "Generation complete. Final output saved by Lumiverse."
        : "Generation complete. Rendering the remaining queued image…")
      return
    }

    this.generating = false
    this.rememberSettledGenerationJob(String(payload?.assetId || this.currentJobId))
    this.currentJobId = ""
    this.currentJobConnectionId = ""
    this.currentJobSource = ""
    this.setGenerating(false)
    if (this.preGenerationImage) this.setCurrentImage(this.preGenerationImage)
    this.preGenerationImage = null
    this.setRunStatus(payload?.message || "Image generation failed.", true)
  }

  private renderPermissions(): void {
    const missing: string[] = []
    if (!this.state.permissions.imageGen) missing.push("Image Generation (required)")
    if (!this.state.permissions.metadata) missing.push("CORS Proxy (LoRA metadata/previews)")
    if (!this.state.permissions.images) missing.push("Images (output history)")
    if (!this.state.permissions.chats) missing.push("Chats (chat/character ownership)")
    if (!this.state.permissions.chatMutation) missing.push("Chat Mutation (append outputs to chat)")
    const banner = this.get<HTMLElement>('[data-role="permission-banner"]')
    banner.dataset.visible = String(missing.length > 0)
    banner.textContent = missing.length
      ? `Grant these extension permissions in Lumiverse for the complete studio: ${missing.join(", ")}.`
      : ""
    this.updateAppendControls()
  }

  private populateConnections(): void {
    const select = this.get<HTMLSelectElement>('[data-role="connection"]')
    select.replaceChildren()
    if (!this.state.connections.length) {
      const option = element("option", "", "No SwarmUI connections configured")
      option.value = ""
      select.appendChild(option)
      this.setConnectionStatus("error")
      this.setRunStatus("Create a SwarmUI image generation connection in Lumiverse first.", true)
      return
    }

    for (const connection of this.state.connections) {
      const option = element("option", "", `${connection.name}${connection.is_default ? " · default" : ""}`)
      option.value = connection.id
      select.appendChild(option)
    }
    const preferred = this.state.connections.find((item) => item.id === this.pendingDraftRestore?.connectionId)
      || this.state.connections.find((item) => item.is_default)
      || this.state.connections[0]
    select.value = preferred.id
    this.loadConnection(preferred.id)
  }

  private loadConnection(connectionId: string): void {
    const connection = this.state.connections.find((item) => item.id === connectionId) || null
    this.state.connection = connection
    this.state.models = []
    this.state.checkpoints = []
    this.state.loras = []
    this.state.swarmPresets = []
    this.state.swarmParameters = []
    this.state.swarmWorkflows = []
    this.state.workflowError = ""
    this.state.selectedWorkflow = null
    this.workflowRequestId = ""
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
    this.state.canManagePresets = false
    this.state.selectedPresets = []
    this.state.samplers = []
    this.state.schedulers = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.setConnectionStatus("loading")
    this.setRunStatus(`Loading ${connection?.name || "SwarmUI"} models and LoRA metadata…`)
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="generate"]')) {
      button.disabled = true
    }
    this.renderLoras()
    this.populateWorkflowSelect()
    this.renderWorkflowControls()
    this.connectionRequestId = this.send("load_connection", { connectionId })
  }

  private acceptConnectionData(data: any): void {
    this.state.connection = data.connection || this.state.connection
    this.state.models = Array.isArray(data.models) ? data.models : []
    this.state.checkpoints = Array.isArray(data.checkpoints) ? data.checkpoints : []
    this.state.loras = Array.isArray(data.loras) ? data.loras : []
    this.state.stack = this.state.stack.map((item) => ({
      ...item,
      lora: this.installedLora(item.lora.name) || item.lora,
    }))
    this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))
    this.state.hasMetadataToken = Boolean(data.hasMetadataToken)
    this.acceptSwarmOptions(data.swarmOptions)
    this.populateModels()
    this.applyConnectionDefaults()
    if (this.pendingDraftRestore && (!this.pendingDraftRestore.connectionId || this.pendingDraftRestore.connectionId === this.state.connection?.id)) {
      const draft = this.pendingDraftRestore
      this.pendingDraftRestore = null
      this.restoreDraft(draft)
    }
    this.hydrateActiveVisualStack(true)
    this.updateFamilyChip()
    this.showMetadataError(data.metadataError || "")
    this.renderLoras()
    this.renderStack()
    this.updateTokenStatus()
    this.setConnectionStatus(data.metadataError ? "warning" : "ready")
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="generate"]')) {
      button.disabled = !this.state.connection || !this.state.permissions.imageGen
    }
  }

  private acceptOutputPage(data: any): void {
    this.state.outputs = Array.isArray(data?.outputs)
      ? data.outputs
      : Array.isArray(data)
        ? data
        : []
    this.state.outputTotal = Math.max(this.state.outputs.length, Number(data?.total) || 0)
    this.state.outputOffset = Math.max(0, Number(data?.offset) || 0)
    this.state.outputLimit = Math.max(1, Number(data?.limit) || this.state.outputLimit || 12)
  }

  private acceptSwarmOptions(value: any): void {
    const previousSampler = this.root.querySelector<HTMLSelectElement>('[data-role="sampler"]')?.value || ""
    const previousScheduler = this.root.querySelector<HTMLSelectElement>('[data-role="scheduler"]')?.value || ""
    const fallbackSamplers = ["euler", "euler_ancestral", "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_3m_sde", "uni_pc"]
    const fallbackSchedulers = ["normal", "karras", "exponential", "sgm_uniform", "simple", "ddim_uniform"]
    this.state.samplers = Array.isArray(value?.samplers) && value.samplers.length
      ? value.samplers
      : fallbackSamplers
    this.state.schedulers = Array.isArray(value?.schedulers) && value.schedulers.length
      ? value.schedulers
      : fallbackSchedulers
    this.state.swarmPresets = Array.isArray(value?.presets) ? value.presets : []
    this.state.swarmParameters = Array.isArray(value?.parameters) ? value.parameters : []
    this.state.swarmWorkflows = Array.isArray(value?.workflows) ? value.workflows : []
    this.state.workflowError = String(value?.workflowError || "")
    this.state.canManagePresets = Boolean(value?.canManagePresets)
    this.populateSimpleSelect("sampler", "Connection default", this.state.samplers, previousSampler)
    this.populateSimpleSelect("scheduler", "Connection default", this.state.schedulers, previousScheduler)

    const presetSelect = this.get<HTMLSelectElement>('[data-role="presets"]')
    presetSelect.replaceChildren()
    const blank = element("option", "", "Add a preset…")
    blank.value = ""
    presetSelect.appendChild(blank)
    for (const preset of this.state.swarmPresets) {
      const option = element("option", "", preset.title)
      option.value = preset.title
      option.title = preset.description
      presetSelect.appendChild(option)
    }
    presetSelect.value = ""
    const addPreset = this.get<HTMLButtonElement>('[data-role="add-swarm-preset"]')
    addPreset.hidden = !this.state.canManagePresets || !this.state.swarmParameters.length
    addPreset.title = addPreset.hidden
      ? "SwarmUI did not expose preset-management permission and a usable parameter schema."
      : "Save the current prompts and render controls as a SwarmUI preset"
    const managePresets = this.get<HTMLButtonElement>('[data-role="manage-swarm-presets"]')
    managePresets.hidden = !this.state.canManagePresets
    managePresets.disabled = !this.state.swarmPresets.length
    managePresets.title = !this.state.canManagePresets
      ? "Your SwarmUI account cannot manage presets."
      : this.state.swarmPresets.length
        ? "Rename or delete SwarmUI presets"
        : "No SwarmUI presets to manage yet"
    this.populateWorkflowSelect()
    this.renderPresetStack()
  }

  private populateWorkflowSelect(): void {
    const select = this.get<HTMLSelectElement>('[data-role="workflow-select"]')
    const selectedName = this.state.selectedWorkflow?.name || ""
    select.replaceChildren()
    const standard = element("option", "", "Standard Swarm generation")
    standard.value = ""
    select.appendChild(standard)
    for (const workflow of this.state.swarmWorkflows) {
      const option = element("option", "", workflow.name)
      option.value = workflow.name
      option.title = workflow.description || "Saved Swarm Comfy workflow"
      select.appendChild(option)
    }
    if (selectedName && this.state.swarmWorkflows.some((workflow) => workflow.name === selectedName)) {
      select.value = selectedName
    } else {
      if (selectedName) {
        this.state.selectedWorkflow = null
        this.workflowValues.clear()
        this.workflowEnabled.clear()
        this.workflowImageValues.clear()
      }
      select.value = ""
    }
    this.renderWorkflowControls()
  }

  private selectWorkflow(name: string, openOnLoad = true, restore: WorkflowDraft | null = null): void {
    this.workflowRequestId = ""
    this.workflowOpenOnLoad = openOnLoad
    this.pendingWorkflowRestore = restore
    this.state.selectedWorkflow = null
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
    if (!name) {
      this.pendingWorkflowRestore = null
      this.workflowOpenOnLoad = true
      this.closeWorkflowSetup()
      this.renderWorkflowControls()
      this.setRunStatus("Using Swarm’s standard generation pipeline.")
      return
    }
    if (!this.state.connection || !this.state.swarmWorkflows.some((workflow) => workflow.name === name)) {
      this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
      this.renderWorkflowControls()
      return
    }
    const summary = this.state.swarmWorkflows.find((workflow) => workflow.name === name)!
    const badge = this.get<HTMLElement>('[data-role="workflow-badge"]')
    badge.dataset.active = "true"
    badge.textContent = "Loading…"
    this.get<HTMLElement>('[data-role="workflow-description"]').textContent = summary.description || "Loading workflow controls from SwarmUI…"
    this.get<HTMLElement>('[data-role="workflow-modal-title"]').textContent = summary.name
    this.get<HTMLElement>('[data-role="workflow-modal-description"]').textContent = summary.description || "Loading exposed workflow parameters from SwarmUI…"
    const fields = this.get<HTMLElement>('[data-role="workflow-fields"]')
    fields.replaceChildren(element("div", "ss-workflow-loading", "Reading exposed workflow parameters…"))
    this.workflowRequestId = this.send("load_swarm_workflow", {
      connectionId: this.state.connection.id,
      name,
    })
  }

  private initializeWorkflowValues(workflow: SwarmWorkflowDetails): void {
    this.workflowValues.clear()
    this.workflowEnabled.clear()
    this.workflowImageValues.clear()
    for (const parameter of workflow.parameters) {
      if (parameter.default !== undefined && parameter.default !== null) {
        this.workflowValues.set(parameter.id, parameter.default)
      }
      if (parameter.toggleable) this.workflowEnabled.add(parameter.id)
    }
  }

  private renderWorkflowControls(): void {
    const workflow = this.state.selectedWorkflow
    const badge = this.get<HTMLElement>('[data-role="workflow-badge"]')
    const description = this.get<HTMLElement>('[data-role="workflow-description"]')
    const configure = this.get<HTMLButtonElement>('[data-action="open-workflow-setup"]')
    const modalTitle = this.get<HTMLElement>('[data-role="workflow-modal-title"]')
    const modalDescription = this.get<HTMLElement>('[data-role="workflow-modal-description"]')
    const root = this.get<HTMLElement>('[data-role="workflow-fields"]')
    root.replaceChildren()
    if (!workflow) {
      configure.disabled = true
      modalTitle.textContent = "Workflow setup"
      modalDescription.textContent = "Select a saved SwarmUI workflow to edit the controls its author exposed."
      badge.dataset.active = "false"
      badge.textContent = "Native"
      description.textContent = this.state.workflowError
        ? `Standard generation. Saved workflows unavailable: ${this.state.workflowError}`
        : "Use Swarm’s normal parameter pipeline, or select a saved Comfy workflow exposed to its Generate tab."
      return
    }

    configure.disabled = false
    modalTitle.textContent = workflow.name
    badge.dataset.active = "true"
    const customParameters = workflow.parameters.filter((parameter) => parameter.visible && !isWorkflowCoreParameter(parameter.id))
    badge.textContent = `Comfy · ${customParameters.length} extra`
    description.textContent = workflow.description
      || "Studio’s normal controls feed the recognized workflow inputs; workflow-specific inputs appear below."
    modalDescription.textContent = workflow.description
      || "Studio’s normal controls feed recognized roles. Only workflow-specific controls are listed below."

    if (!customParameters.length) {
      root.appendChild(element("div", "ss-empty", "This workflow uses Studio’s existing prompt and generation controls."))
      return
    }

    const groups = new Map<string, { group: SwarmWorkflowGroup | null; parameters: SwarmWorkflowParameter[] }>()
    for (const parameter of customParameters) {
      const key = parameter.group?.id || (parameter.advanced ? "__advanced" : "__workflow")
      const current = groups.get(key) || { group: parameter.group, parameters: [] }
      current.parameters.push(parameter)
      groups.set(key, current)
    }
    for (const [key, entry] of groups) {
      const details = element("details", "ss-workflow-group")
      details.open = entry.group?.open === true || (!entry.group?.advanced && key !== "__advanced")
      const summary = element(
        "summary",
        "",
        entry.group?.name || (key === "__advanced" ? "Advanced workflow controls" : "Workflow controls"),
      )
      details.appendChild(summary)
      if (entry.group?.description) {
        details.appendChild(element("p", "ss-workflow-group-description", entry.group.description))
      }
      const grid = element("div", "ss-workflow-field-grid")
      for (const parameter of entry.parameters) grid.appendChild(this.createWorkflowField(parameter))
      details.appendChild(grid)
      root.appendChild(details)
    }
  }

  private openWorkflowSetup(): void {
    if (!this.state.selectedWorkflow) return
    const modal = this.get<HTMLElement>('[data-role="workflow-modal"]')
    modal.hidden = false
    requestAnimationFrame(() => modal.querySelector<HTMLButtonElement>('[data-action="close-workflow-setup"]')?.focus())
  }

  private closeWorkflowSetup(): void {
    const modal = this.root.querySelector<HTMLElement>('[data-role="workflow-modal"]')
    if (modal) modal.hidden = true
  }

  private createWorkflowField(parameter: SwarmWorkflowParameter): HTMLElement {
    const field = element("div", "ss-workflow-field")
    const wide = parameter.type === "image" || parameter.viewType === "prompt" || parameter.viewType === "big"
    field.dataset.wide = String(wide)
    field.dataset.enabled = String(!parameter.toggleable || this.workflowEnabled.has(parameter.id))
    const head = element("div", "ss-workflow-field-head")
    const label = element("label", "", parameter.name || parameter.id)
    label.title = parameter.description || parameter.id
    head.appendChild(label)
    if (parameter.toggleable) {
      const toggle = element("input", "ss-workflow-toggle")
      toggle.type = "checkbox"
      toggle.checked = this.workflowEnabled.has(parameter.id)
      toggle.title = `Include ${parameter.name || parameter.id}`
      toggle.setAttribute("aria-label", toggle.title)
      toggle.addEventListener("change", () => {
        if (toggle.checked) this.workflowEnabled.add(parameter.id)
        else this.workflowEnabled.delete(parameter.id)
        field.dataset.enabled = String(toggle.checked)
      })
      head.appendChild(toggle)
    }
    field.appendChild(head)

    const currentValue = this.workflowValues.get(parameter.id) ?? parameter.default ?? ""
    const type = parameter.type.toLowerCase()
    if (type === "image") {
      const input = element("input", "ss-input")
      input.type = "file"
      input.accept = "image/*"
      input.addEventListener("change", () => {
        const file = input.files?.[0]
        if (!file) {
          this.workflowImageValues.delete(parameter.id)
          return
        }
        if (!file.type.startsWith("image/") || file.size > 4_000_000) {
          input.value = ""
          this.workflowImageValues.delete(parameter.id)
          this.setRunStatus("Workflow images must be image files under 4 MB.", true)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          this.workflowImageValues.set(parameter.id, String(reader.result || ""))
          this.setRunStatus(`Workflow image ready · ${file.name}`)
        }
        reader.onerror = () => this.setRunStatus(`Could not read ${file.name}.`, true)
        reader.readAsDataURL(file)
      })
      field.appendChild(input)
    } else if ((type === "dropdown" || type === "model") && parameter.values.length) {
      const select = element("select", "ss-select")
      const choices = parameter.values.map((value) => String(Array.isArray(value) ? value[0] : value))
      const defaultString = String(currentValue)
      if (defaultString && !choices.includes(defaultString)) choices.unshift(defaultString)
      for (const choice of choices) {
        const option = element("option", "", choice)
        option.value = choice
        select.appendChild(option)
      }
      select.value = defaultString || choices[0] || ""
      this.workflowValues.set(parameter.id, select.value)
      select.addEventListener("change", () => this.workflowValues.set(parameter.id, select.value))
      field.appendChild(select)
    } else if (type === "boolean") {
      const input = element("input")
      input.type = "checkbox"
      input.checked = currentValue === true || String(currentValue).toLowerCase() === "true"
      this.workflowValues.set(parameter.id, input.checked)
      input.addEventListener("change", () => this.workflowValues.set(parameter.id, input.checked))
      field.appendChild(input)
    } else if (type === "integer" || type === "decimal") {
      const input = element("input", "ss-input")
      input.type = "number"
      if (parameter.min !== null) input.min = String(parameter.min)
      if (parameter.max !== null) input.max = String(parameter.max)
      input.step = String(parameter.step && parameter.step > 0 ? parameter.step : type === "integer" ? 1 : .01)
      input.value = Number.isFinite(Number(currentValue)) ? String(currentValue) : "0"
      this.workflowValues.set(parameter.id, Number(input.value))
      input.addEventListener("input", () => {
        const value = Number(input.value)
        if (Number.isFinite(value)) this.workflowValues.set(parameter.id, type === "integer" ? Math.trunc(value) : value)
      })
      field.appendChild(input)
    } else if (parameter.viewType === "prompt" || parameter.viewType === "big") {
      const input = element("textarea", "ss-textarea")
      input.value = String(currentValue)
      input.addEventListener("input", () => this.workflowValues.set(parameter.id, input.value))
      field.appendChild(input)
    } else {
      const input = element("input", "ss-input")
      input.value = String(currentValue)
      input.addEventListener("input", () => this.workflowValues.set(parameter.id, input.value))
      field.appendChild(input)
    }
    if (parameter.description) field.appendChild(element("div", "ss-field-help", parameter.description))
    return field
  }

  private workflowRawOverrides(): Record<string, unknown> {
    const workflow = this.state.selectedWorkflow
    if (!workflow) return {}
    const result: Record<string, unknown> = { comfyuicustomworkflow: workflow.name }
    for (const parameter of workflow.parameters) {
      if (!parameter.visible || isWorkflowCoreParameter(parameter.id)) continue
      if (parameter.toggleable && !this.workflowEnabled.has(parameter.id)) continue
      if (parameter.type === "image") {
        const imageValue = this.workflowImageValues.get(parameter.id)
        if (imageValue) result[parameter.id] = imageValue
        continue
      }
      let value = this.workflowValues.get(parameter.id)
      if (typeof value === "string") value = value.slice(0, 65_536)
      if (typeof value === "number") {
        if (!Number.isFinite(value)) continue
        if (parameter.min !== null) value = Math.max(parameter.min, value)
        if (parameter.max !== null) value = Math.min(parameter.max, value)
        if (parameter.type === "integer") value = Math.trunc(value)
      }
      if (value !== undefined && value !== null) result[parameter.id] = value
    }
    return result
  }

  private addSelectedPreset(title: string): void {
    if (!title || this.state.selectedPresets.some((preset) => preset.title === title)) return
    this.state.selectedPresets.push({ title, enabled: true })
    this.renderPresetStack()
  }

  private moveSelectedPreset(index: number, delta: number): void {
    if (!Number.isInteger(index)) return
    const target = index + delta
    if (index < 0 || target < 0 || index >= this.state.selectedPresets.length || target >= this.state.selectedPresets.length) return
    const [preset] = this.state.selectedPresets.splice(index, 1)
    this.state.selectedPresets.splice(target, 0, preset)
    this.renderPresetStack()
  }

  private removeSelectedPreset(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.state.selectedPresets.length) return
    this.state.selectedPresets.splice(index, 1)
    this.renderPresetStack()
  }

  private buildCurrentPresetParamMap(): Record<string, string> {
    const schemaIds = new Map(
      this.state.swarmParameters.map((parameter) => [parameter.id.toLowerCase(), parameter.id]),
    )
    const paramMap: Record<string, string> = {}
    const add = (id: string, value: unknown) => {
      const schemaId = schemaIds.get(id.toLowerCase())
      if (!schemaId || value === undefined || value === null || String(value).trim() === "") return
      paramMap[schemaId] = String(value)
    }
    add("prompt", this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim())
    add("negativeprompt", this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim())
    add("model", this.get<HTMLSelectElement>('[data-role="model"]').value)
    add("width", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)))
    add("height", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)))
    add("steps", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="steps"]'), 20)))
    add("cfgscale", numberValue(this.get<HTMLInputElement>('[data-role="cfg"]'), 7))
    add("seed", Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1)))
    add("sampler", this.get<HTMLSelectElement>('[data-role="sampler"]').value)
    add("scheduler", this.get<HTMLSelectElement>('[data-role="scheduler"]').value)
    add("vae", this.get<HTMLInputElement>('[data-role="vae"]').value)
    add("automaticvae", this.get<HTMLInputElement>('[data-role="vae"]').value)
    add("refinermodel", this.get<HTMLInputElement>('[data-role="unet"]').value)
    const enabledLoras = this.state.stack.filter((item) => item.enabled)
    if (enabledLoras.length) {
      add("loras", serializeSwarmPresetList(enabledLoras.map((item) => item.lora.name)))
      add(
        "loraweights",
        serializeSwarmPresetList(enabledLoras.map((item) => clamp(Number(item.weight) || 1, -10, 10))),
      )
    }
    if (this.state.selectedWorkflow) add("comfyuicustomworkflow", this.state.selectedWorkflow.name)
    return paramMap
  }

  private openSavePresetModal(): void {
    if (!this.state.connection || !this.state.canManagePresets || !this.state.swarmParameters.length) return
    this.pendingPresetParamMap = this.buildCurrentPresetParamMap()
    if (!Object.keys(this.pendingPresetParamMap).length) {
      this.setRunStatus("SwarmUI's schema did not expose any of Studio's current controls.", true)
      return
    }
    this.get<HTMLInputElement>('[data-role="save-preset-name"]').value = ""
    this.get<HTMLInputElement>('[data-role="save-preset-description"]').value = ""
    const fields = this.get<HTMLElement>('[data-role="save-preset-fields"]')
    fields.replaceChildren()
    const schemaById = new Map(this.state.swarmParameters.map((parameter) => [parameter.id, parameter]))
    for (const [id, value] of Object.entries(this.pendingPresetParamMap)) {
      const parameter = schemaById.get(id)
      const normalized = id.toLowerCase().replace(/[^a-z0-9]/g, "")
      const label = element("label", "ss-save-param")
      const checkbox = element("input")
      checkbox.type = "checkbox"
      checkbox.checked = normalized !== "seed"
      checkbox.dataset.role = "save-preset-param"
      checkbox.dataset.paramId = id
      const copy = element("span", "ss-save-param-copy")
      copy.append(
        element("strong", "", parameter?.name || id),
        element("span", "", String(value).length > 120 ? `${String(value).slice(0, 117)}…` : String(value)),
      )
      label.append(checkbox, copy)
      fields.appendChild(label)
    }
    this.get<HTMLElement>('[data-role="save-preset-modal"]').hidden = false
    this.get<HTMLInputElement>('[data-role="save-preset-name"]').focus()
  }

  private closeSavePresetModal(): void {
    this.get<HTMLElement>('[data-role="save-preset-modal"]').hidden = true
    this.pendingPresetParamMap = {}
  }

  private openPresetManager(): void {
    if (!this.state.connection || !this.state.canManagePresets) return
    this.renderPresetManager()
    this.get<HTMLElement>('[data-role="preset-manager-modal"]').hidden = false
  }

  private closePresetManager(): void {
    this.get<HTMLElement>('[data-role="preset-manager-modal"]').hidden = true
  }

  private renderPresetManager(): void {
    const list = this.get<HTMLElement>('[data-role="preset-manager-list"]')
    list.replaceChildren()
    if (!this.state.swarmPresets.length) {
      list.appendChild(element("div", "ss-empty", "No SwarmUI presets on this connection."))
      return
    }
    for (const preset of this.state.swarmPresets) {
      const row = element("div", "ss-preset-manager-row")
      const copy = element("div", "ss-preset-manager-copy")
      copy.append(
        element("strong", "", preset.title),
        element("span", "", preset.description || "No description"),
      )
      const remove = element("button", "ss-button ss-button-danger", "Delete")
      remove.dataset.action = "delete-swarm-preset"
      remove.dataset.presetTitle = preset.title
      remove.title = `Delete ${preset.title} from SwarmUI`
      row.append(copy, remove)
      list.appendChild(row)
    }
  }

  private deleteSwarmPreset(title: string): void {
    const preset = this.state.swarmPresets.find((candidate) => candidate.title === title)
    if (!preset || !this.state.connection || !this.state.canManagePresets) return
    if (!window.confirm(`Delete Swarm preset “${preset.title}”? This cannot be undone.`)) return
    this.send("delete_swarm_preset", {
      connectionId: this.state.connection.id,
      title: preset.title,
    })
    this.setRunStatus(`Deleting Swarm preset “${preset.title}”…`)
  }

  private confirmSavePreset(): void {
    if (!this.state.connection || !this.state.canManagePresets) return
    const title = this.get<HTMLInputElement>('[data-role="save-preset-name"]').value.trim()
    if (!title) {
      this.setRunStatus("Give the Swarm preset a name first.", true)
      return
    }
    const description = this.get<HTMLInputElement>('[data-role="save-preset-description"]').value.trim()
    const paramMap: Record<string, string> = {}
    for (const input of this.root.querySelectorAll<HTMLInputElement>('[data-role="save-preset-param"]')) {
      const id = input.dataset.paramId || ""
      if (input.checked && id && this.pendingPresetParamMap[id] !== undefined) paramMap[id] = this.pendingPresetParamMap[id]
    }
    if (!Object.keys(paramMap).length) {
      this.setRunStatus("Choose at least one value to save in the preset.", true)
      return
    }
    this.send("add_swarm_preset", {
      connectionId: this.state.connection.id,
      title,
      description,
      paramMap,
    })
    this.closeSavePresetModal()
    this.setRunStatus(`Saving SwarmUI preset “${title}”…`)
  }

  private applySelectedPreset(index: number): void {
    const selected = this.state.selectedPresets[index]
    const preset = selected && this.state.swarmPresets.find((candidate) => candidate.title === selected.title)
    if (!preset) return
    const normalized = new Map(
      Object.entries(preset.paramMap).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), { key, value }]),
    )
    const take = (...ids: string[]): string => {
      for (const id of ids) {
        const value = normalized.get(id.toLowerCase().replace(/[^a-z0-9]/g, ""))?.value
        if (value !== undefined) return String(value)
      }
      return ""
    }
    const setInput = (role: string, value: string) => {
      if (!value) return
      this.get<HTMLInputElement>(`[data-role="${role}"]`).value = value
    }
    const setSelect = (role: string, value: string) => {
      if (!value) return
      const select = this.get<HTMLSelectElement>(`[data-role="${role}"]`)
      if (![...select.options].some((option) => option.value === value)) {
        const option = element("option", "", `${value} · preset`)
        option.value = value
        select.appendChild(option)
      }
      select.value = value
    }
    setInput("positive", take("prompt"))
    setInput("negative", take("negativeprompt", "negative_prompt"))
    setSelect("model", take("model"))
    setInput("width", take("width"))
    setInput("height", take("height"))
    setInput("steps", take("steps"))
    setInput("cfg", take("cfgscale", "cfg"))
    setInput("seed", take("seed"))
    setSelect("sampler", take("sampler"))
    setSelect("scheduler", take("scheduler"))
    setInput("vae", take("vae", "automaticvae"))
    setInput("unet", take("refinermodel", "unet"))

    const extracted = lorasFromSwarmPreset(preset.paramMap)
    for (const candidate of extracted) {
      const installed = this.installedLora(candidate.name)
      const existing = this.state.stack.find((item) => this.sameLoraName(item.lora.name, candidate.name))
      if (existing) {
        if (installed) existing.lora = installed
        existing.weight = candidate.weight
        existing.enabled = true
      } else {
        const lora = installed || manualLora(candidate.name)
        this.state.stack.push({ lora, weight: candidate.weight, enabled: true, useTrigger: false })
      }
    }
    this.missingLoras = this.missingLoras.filter((item) => !this.installedLora(item.name))

    const handled = new Set([
      "prompt", "negativeprompt", "model", "width", "height", "steps", "cfgscale", "cfg", "seed",
      "sampler", "scheduler", "vae", "automaticvae", "refinermodel", "unet", "loras", "loraweights",
    ])
    let raw: Record<string, unknown> = {}
    try {
      raw = JSON.parse(this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value || "{}")
    } catch {
      raw = {}
    }
    for (const [key, value] of Object.entries(preset.paramMap)) {
      if (!handled.has(key.toLowerCase().replace(/[^a-z0-9]/g, ""))) raw[key] = value
    }
    this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value = Object.keys(raw).length ? JSON.stringify(raw, null, 2) : ""
    this.state.selectedPresets.splice(index, 1)
    this.get<HTMLSelectElement>('[data-role="aspect"]').value = "custom"
    this.renderPresetStack()
    this.renderStack()
    this.renderLoras()
    this.updatePreviewAspect(
      numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
      numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
    )
    this.updateContextControls()
    this.setRunStatus(`Applied “${preset.title}” to Studio and removed it from the preset stack${extracted.length ? ` · ${extracted.length} LoRA${extracted.length === 1 ? "" : "s"} moved into the LoRA stack` : ""}.`)
  }

  private renderPresetStack(): void {
    const root = this.get<HTMLElement>('[data-role="preset-stack"]')
    root.replaceChildren()
    if (!this.state.selectedPresets.length) {
      root.appendChild(element("div", "ss-empty ss-preset-empty", "No presets selected."))
      this.updateResolvedPresetSummary()
      return
    }
    this.state.selectedPresets.forEach((selected, index) => {
      const row = element("div", "ss-preset-row")
      const toggle = element("input")
      toggle.type = "checkbox"
      toggle.checked = selected.enabled
      toggle.dataset.role = "preset-enabled"
      toggle.dataset.presetIndex = String(index)
      toggle.setAttribute("aria-label", `Enable ${selected.title}`)
      const name = element("span", "ss-preset-name", selected.title)
      const metadata = this.state.swarmPresets.find((preset) => preset.title === selected.title)
      name.title = metadata?.description || selected.title
      const up = element("button", "ss-icon-button", "↑")
      up.dataset.action = "preset-up"
      up.dataset.presetIndex = String(index)
      up.disabled = index === 0
      up.title = "Apply earlier"
      const down = element("button", "ss-icon-button", "↓")
      down.dataset.action = "preset-down"
      down.dataset.presetIndex = String(index)
      down.disabled = index === this.state.selectedPresets.length - 1
      down.title = "Apply later"
      const apply = element("button", "ss-button ss-preset-apply", "Apply")
      apply.dataset.action = "preset-apply"
      apply.dataset.presetIndex = String(index)
      apply.disabled = !metadata
      apply.title = "Apply these values to Studio, then remove this preset to prevent duplicate LoRA weights"
      const remove = element("button", "ss-icon-button ss-button-danger", "×")
      remove.dataset.action = "preset-remove"
      remove.dataset.presetIndex = String(index)
      remove.title = "Remove preset"
      row.append(toggle, name, up, down, apply, remove)
      root.appendChild(row)
    })
    this.updateResolvedPresetSummary()
  }

  private populateSimpleSelect(
    role: string,
    blankLabel: string,
    values: string[],
    selected: string,
  ): void {
    const select = this.get<HTMLSelectElement>(`[data-role="${role}"]`)
    select.replaceChildren()
    const blank = element("option", "", blankLabel)
    blank.value = ""
    select.appendChild(blank)
    if (selected && !values.includes(selected)) {
      const current = element("option", "", `${selected} · connection`)
      current.value = selected
      select.appendChild(current)
    }
    for (const value of values) {
      const option = element("option", "", value)
      option.value = value
      select.appendChild(option)
    }
    select.value = selected
  }

  private populateModels(): void {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    select.replaceChildren()
    const connectionModel = String(this.state.connection?.model || "")
    const models = [...this.state.models]
    if (connectionModel && !models.some((model) => model.id === connectionModel)) {
      models.unshift({ id: connectionModel, label: `${connectionModel} · connection` })
    }
    if (!models.length) {
      const option = element("option", "", connectionModel || "No models returned")
      option.value = connectionModel
      select.appendChild(option)
      return
    }
    for (const model of models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      select.appendChild(option)
    }
    select.value = connectionModel || models[0].id
  }

  private applyConnectionDefaults(): void {
    const defaults = this.state.connection?.default_parameters || {}
    const assign = (role: string, key: string, fallback: unknown) => {
      const input = this.get<HTMLInputElement | HTMLSelectElement>(`[data-role="${role}"]`)
      const value = defaults[key] ?? fallback
      if (value !== undefined && value !== null) input.value = String(value)
    }
    assign("width", "width", 1024)
    assign("height", "height", 1024)
    assign("steps", "steps", 20)
    assign("cfg", "cfgScale", 7)
    assign("seed", "seed", -1)
    assign("sampler", "sampler", "")
    assign("scheduler", "scheduler", "")
    assign("vae", "vae", "")
    assign("unet", "unet", "")
    assign("clip-l", "clipLModel", "")
    assign("clip-g", "clipGModel", "")
    assign("t5", "t5XXLModel", "")
    assign("denoise", "denoise", .6)
    this.setDimensions(
      Number(defaults.width) || 1024,
      Number(defaults.height) || 1024,
    )
    this.get<HTMLElement>('[data-role="denoise-label"]').textContent =
      Number(this.get<HTMLInputElement>('[data-role="denoise"]').value || .6).toFixed(2)
    this.updateSizeLinkControl()
    this.updateContextControls()
  }

  private setDimensions(width: number, height: number): void {
    const safeWidth = roundModelSize(width)
    const safeHeight = roundModelSize(height)
    this.get<HTMLInputElement>('[data-role="width"]').value = String(safeWidth)
    this.get<HTMLInputElement>('[data-role="height"]').value = String(safeHeight)
    const ratio = safeWidth / safeHeight
    let best = ""
    let bestDistance = Number.POSITIVE_INFINITY
    for (const [key, preset] of Object.entries(ASPECT_PRESETS)) {
      const distance = Math.abs(ratio - preset.width / preset.height)
      if (distance < bestDistance) {
        best = key
        bestDistance = distance
      }
    }
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]')
    aspect.value = bestDistance <= .035 ? best : "custom"
    const preset = ASPECT_PRESETS[best]
    const scale = preset
      ? 1024 * (safeWidth >= safeHeight ? safeWidth / preset.width : safeHeight / preset.height)
      : Math.max(safeWidth, safeHeight)
    this.get<HTMLInputElement>('[data-role="size-slider"]').value = String(clamp(Math.round(scale), 256, 2048))
    this.get<HTMLElement>('[data-role="custom-size"]').hidden = aspect.value !== "custom"
    this.updateSizeReadout()
    this.updatePreviewAspect(safeWidth, safeHeight)
    this.updateContextControls()
  }

  private applyAspectSelection(): void {
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]').value
    const custom = aspect === "custom"
    this.get<HTMLElement>('[data-role="custom-size"]').hidden = !custom
    this.get<HTMLElement>('[data-role="size-scale-field"]').hidden =
      custom && !this.get<HTMLInputElement>('[data-role="link-size"]').checked
    if (!custom) this.applyAspectScale()
  }

  private toggleSizeLink(): void {
    const link = this.get<HTMLInputElement>('[data-role="link-size"]')
    link.checked = !link.checked
    this.updateSizeLinkControl()
    this.applyAspectSelection()
  }

  private updateSizeLinkControl(): void {
    const linked = this.get<HTMLInputElement>('[data-role="link-size"]').checked
    const button = this.get<HTMLButtonElement>('[data-role="size-link"]')
    button.dataset.linked = String(linked)
    button.setAttribute("aria-pressed", String(linked))
    button.title = linked
      ? "Width and height are linked; click to edit them independently"
      : "Width and height are independent; click to link them"
  }

  private applyAspectScale(): void {
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]').value
    const scale = numberValue(this.get<HTMLInputElement>('[data-role="size-slider"]'), 1024)
    if (aspect !== "custom") {
      const dimensions = dimensionsForAspect(aspect, scale)
      this.get<HTMLInputElement>('[data-role="width"]').value = String(dimensions.width)
      this.get<HTMLInputElement>('[data-role="height"]').value = String(dimensions.height)
      this.updatePreviewAspect(dimensions.width, dimensions.height)
    } else if (this.get<HTMLInputElement>('[data-role="link-size"]').checked) {
      const longest = Math.max(
        numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
        numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
      )
      const factor = longest > 0 ? scale / longest : 1
      const width = roundModelSize(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024) * factor)
      const height = roundModelSize(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024) * factor)
      this.get<HTMLInputElement>('[data-role="width"]').value = String(width)
      this.get<HTMLInputElement>('[data-role="height"]').value = String(height)
      this.updatePreviewAspect(width, height)
    }
    this.updateSizeReadout()
    this.updateContextControls()
  }

  private updateLinkedCustomDimension(axis: "width" | "height", value: number): void {
    if (
      this.get<HTMLSelectElement>('[data-role="aspect"]').value !== "custom"
      || !this.get<HTMLInputElement>('[data-role="link-size"]').checked
      || !Number.isFinite(value)
    ) return
    if (axis === "width") {
      this.get<HTMLInputElement>('[data-role="height"]').value =
        String(roundModelSize(value / this.previewAspect))
    } else {
      this.get<HTMLInputElement>('[data-role="width"]').value =
        String(roundModelSize(value * this.previewAspect))
    }
  }

  private updateSizeReadout(): void {
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    this.get<HTMLElement>('[data-role="size-readout"]').textContent = `${width} × ${height}`
  }

  private resolvedPrompts(): { prompt: string; negativePrompt: string; presets: string[] } {
    const presets = this.state.selectedPresets.filter((selected) => selected.enabled)
    const titles = presets.map((preset) => preset.title)
    return {
      prompt: this.finalPrompt(),
      negativePrompt: this.finalNegativePrompt(),
      presets: titles,
    }
  }

  private updateResolvedPresetSummary(): void {
    const status = this.get<HTMLElement>('[data-role="preset-resolved"]')
    const pill = this.get<HTMLElement>('[data-role="active-preset-pill"]')
    const enabled = this.state.selectedPresets.filter((preset) => preset.enabled)
    if (!enabled.length) {
      status.textContent = "No enabled Swarm presets; prompts pass through unchanged."
      pill.hidden = true
      pill.textContent = ""
      return
    }
    pill.hidden = false
    pill.textContent = enabled.length === 1 ? enabled[0].title : `${enabled.length} presets`
    pill.title = enabled.map((preset) => preset.title).join(" → ")
    status.textContent =
      `${enabled.length} preset${enabled.length === 1 ? "" : "s"} applied in order: ${enabled.map((preset) => preset.title).join(" → ")}. Studio sends native preset directives alongside the complete composed prompt so Swarm preserves both.`
  }

  private refreshMetadata(): void {
    if (!this.state.connection) return
    this.state.loras = []
    this.state.checkpoints = []
    this.previewObserver?.disconnect()
    this.requestedPreviews.clear()
    this.previewCache.clear()
    this.renderLoras()
    this.setConnectionStatus("loading")
    this.setRunStatus("Refreshing SwarmUI LoRA metadata…")
    this.send("refresh_metadata", { connectionId: this.state.connection.id })
  }

  private toggleConfigPopover(button: HTMLElement): void {
    const popover = this.get<HTMLElement>('[data-role="config-popover"]')
    popover.hidden = !popover.hidden
    button.setAttribute("aria-expanded", String(!popover.hidden))
    if (!popover.hidden) {
      this.setSettingsTab(
        this.root.querySelector<HTMLElement>('[data-action="settings-tab"][data-active="true"]')
          ?.dataset.settingsTab || "general",
      )
      window.setTimeout(() => {
        this.root.querySelector<HTMLElement>('[data-action="settings-tab"][data-active="true"]')?.focus()
      }, 0)
    }
  }

  private closeConfigPopover(): void {
    const popover = this.root.querySelector<HTMLElement>('[data-role="config-popover"]')
    if (!popover) return
    popover.hidden = true
    this.root.querySelector<HTMLElement>('[data-action="toggle-config"]')
      ?.setAttribute("aria-expanded", "false")
  }

  private setSettingsTab(tab: string): void {
    const selected = ["general", "generation", "theme", "metadata"].includes(tab) ? tab : "general"
    for (const button of this.root.querySelectorAll<HTMLElement>('[data-action="settings-tab"]')) {
      const active = button.dataset.settingsTab === selected
      button.dataset.active = String(active)
      button.setAttribute("aria-selected", String(active))
    }
    for (const panel of this.root.querySelectorAll<HTMLElement>("[data-settings-panel]")) {
      panel.hidden = panel.dataset.settingsPanel !== selected
    }
  }

  private resetTagProtocol(): void {
    const input = this.get<HTMLTextAreaElement>('[data-role="tag-protocol-prompt"]')
    input.value = DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT
    input.focus()
    this.setRunStatus("Protocol editor reset to the Studio default. Save current to apply it.")
  }

  private saveTagProtocol(): void {
    const input = this.get<HTMLTextAreaElement>('[data-role="tag-protocol-prompt"]')
    const protocolPrompt = input.value.trim() || DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT
    input.value = protocolPrompt
    this.onBehaviorChange({ ...this.behavior, protocolPrompt })
    this.setRunStatus("Inline image protocol saved.")
  }

  private async copyTagProtocol(): Promise<void> {
    try {
      await navigator.clipboard.writeText(SWARM_IMAGE_PROTOCOL_EXAMPLE)
      this.setRunStatus("Swarm image-tag protocol copied.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private acceptCharacterBaseTags(value: any): void {
    const source = value?.source === "studio" || value?.source === "lumiverse"
      ? value.source
      : "none"
    this.state.characterBaseTags = {
      characterId: String(value?.characterId || ""),
      characterName: String(value?.characterName || ""),
      tags: String(value?.tags || ""),
      source,
    }
    const editor = this.root.querySelector<HTMLElement>('[data-role="character-base-tags-editor"]')
    const input = this.root.querySelector<HTMLTextAreaElement>('[data-role="character-base-tags"]')
    const status = this.root.querySelector<HTMLElement>('[data-role="character-base-tags-status"]')
    const canEdit = Boolean(this.state.characterBaseTags.characterId && this.state.permissions?.characters !== false)
    if (editor) editor.setAttribute("aria-disabled", String(!canEdit))
    if (input) {
      input.disabled = !canEdit
      input.value = this.state.characterBaseTags.tags
    }
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(
      '[data-action="save-character-base-tags"], [data-action="clear-character-base-tags"]',
    )) button.disabled = !canEdit
    if (status) {
      status.textContent = !canEdit
        ? "Open a character chat"
        : this.state.characterBaseTags.source === "studio"
          ? `${this.state.characterBaseTags.characterName || "Character"} · Studio`
          : this.state.characterBaseTags.source === "lumiverse"
            ? `${this.state.characterBaseTags.characterName || "Character"} · Lumiverse fallback`
            : `${this.state.characterBaseTags.characterName || "Character"} · not set`
    }
  }

  private saveCharacterBaseTags(): void {
    const state = this.state.characterBaseTags
    if (!state.characterId) {
      this.setRunStatus("Open a character chat before saving base tags.", true)
      return
    }
    const tags = this.get<HTMLTextAreaElement>('[data-role="character-base-tags"]').value
    this.send("set_character_base_tags", { characterId: state.characterId, tags })
    this.setRunStatus(`Saving base tags for ${state.characterName || "this character"}…`)
  }

  private clearCharacterBaseTags(): void {
    const state = this.state.characterBaseTags
    if (!state.characterId) return
    this.get<HTMLTextAreaElement>('[data-role="character-base-tags"]').value = ""
    this.send("set_character_base_tags", { characterId: state.characterId, tags: "" })
    this.setRunStatus(`Clearing Studio base tags for ${state.characterName || "this character"}…`)
  }

  private saveToken(): void {
    if (!this.state.connection) return
    const token = this.get<HTMLInputElement>('[data-role="metadata-token"]').value.trim()
    if (!token) {
      this.setRunStatus("Enter the swarm_token value before saving.", true)
      return
    }
    this.setRunStatus("Saving encrypted metadata token and testing SwarmUI…")
    this.send("save_metadata_token", { connectionId: this.state.connection.id, token })
  }

  private clearToken(): void {
    if (!this.state.connection) return
    this.setRunStatus("Clearing metadata token and retrying anonymously…")
    this.send("clear_metadata_token", { connectionId: this.state.connection.id })
  }

  private updateTokenStatus(): void {
    this.get<HTMLElement>('[data-role="token-status"]').textContent = this.state.hasMetadataToken
      ? "Encrypted token saved"
      : "Anonymous metadata"
  }

  private showMetadataError(message: string): void {
    const status = this.get<HTMLElement>('[data-role="metadata-error"]')
    status.hidden = !message
    status.textContent = message
  }

  private selectedCheckpointMetadata(): CheckpointMetadata | null {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    const selected = normalizeModelName(select.value)
    if (!selected) return null
    return this.state.checkpoints.find((item) => normalizeModelName(item.name) === selected)
      || this.state.checkpoints.find((item) => {
        const candidate = normalizeModelName(item.name)
        return candidate.endsWith(selected) || selected.endsWith(candidate)
      })
      || null
  }

  private selectedModelFamily(): ModelFamily {
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    const option = select.selectedOptions[0]
    const checkpoint = this.selectedCheckpointMetadata()
    return inferModelFamily(
      checkpoint?.compatClass || "",
      checkpoint?.architecture || "",
      checkpoint?.title || "",
      checkpoint?.name || "",
      select.value,
      option?.textContent || "",
    )
  }

  private loraFamily(lora: LoraMetadata): ModelFamily {
    return inferModelFamily(
      lora.compatClass,
      lora.architecture,
      lora.name,
      lora.title,
      ...lora.tags,
    )
  }

  private isLoraCompatible(lora: LoraMetadata): boolean {
    const checkpoint = this.selectedCheckpointMetadata()
    const select = this.get<HTMLSelectElement>('[data-role="model"]')
    return modelSignalsCompatible(
      checkpoint?.compatClass || "",
      lora.compatClass,
      [
        checkpoint?.compatClass || "",
        checkpoint?.architecture || "",
        checkpoint?.title || "",
        checkpoint?.name || "",
        select.value,
        select.selectedOptions[0]?.textContent || "",
      ],
      [lora.compatClass, lora.architecture, lora.name, lora.title, ...lora.tags],
    )
  }

  private updateFamilyChip(): void {
    const checkpoint = this.selectedCheckpointMetadata()
    const family = this.selectedModelFamily()
    const exact = checkpoint?.compatClass || checkpoint?.architecture || ""
    this.get<HTMLElement>('[data-role="family-chip"]').textContent = exact
      ? `${familyLabel(family)} · ${exact}`
      : `${familyLabel(family)} · inferred`
  }

  private closeLoraSortMenu(): void {
    const menu = this.root.querySelector<HTMLElement>('[data-role="lora-sort-menu"]')
    const button = this.root.querySelector<HTMLButtonElement>('[data-role="lora-sort-button"]')
    if (menu) menu.hidden = true
    if (button) button.setAttribute("aria-expanded", "false")
  }

  private toggleLoraSortMenu(): void {
    const menu = this.get<HTMLElement>('[data-role="lora-sort-menu"]')
    const button = this.get<HTMLButtonElement>('[data-role="lora-sort-button"]')
    menu.hidden = !menu.hidden
    button.setAttribute("aria-expanded", String(!menu.hidden))
  }

  private selectLoraSort(value: string): void {
    const sort = value === "name" || value === "newest" ? value : "title"
    const select = this.get<HTMLSelectElement>('[data-role="lora-sort"]')
    select.value = sort
    const label = sort === "name" ? "Filename" : sort === "newest" ? "Newest" : "Title"
    const button = this.get<HTMLButtonElement>('[data-role="lora-sort-button"]')
    button.title = `Sort LoRAs: ${label}`
    button.setAttribute("aria-label", `Sort LoRAs: ${label}`)
    for (const choice of this.root.querySelectorAll<HTMLElement>('[data-action="select-lora-sort"]')) {
      choice.dataset.selected = String(choice.dataset.sortValue === sort)
    }
    this.closeLoraSortMenu()
    this.renderLoras()
    this.persistWorkspaceState()
  }

  private toggleLoraFolders(force?: boolean): void {
    this.loraFoldersOpen = force ?? !this.loraFoldersOpen
    const browser = this.get<HTMLElement>('[data-role="lora-browser"]')
    const sidebar = this.get<HTMLElement>('[data-role="lora-folder-sidebar"]')
    const toggle = this.get<HTMLButtonElement>('[data-role="lora-folder-toggle"]')
    browser.dataset.foldersOpen = String(this.loraFoldersOpen)
    sidebar.hidden = !this.loraFoldersOpen
    toggle.dataset.active = String(this.loraFoldersOpen)
    toggle.setAttribute("aria-expanded", String(this.loraFoldersOpen))
    if (this.loraFoldersOpen) this.renderLoraFolders()
    this.persistWorkspaceState()
  }

  private selectLoraFolder(value: string): void {
    this.selectedLoraFolder = value === "__all__" ? null : value === "__root__" ? "" : value
    if (window.matchMedia("(max-width: 720px)").matches) this.toggleLoraFolders(false)
    this.renderLoras()
    this.persistWorkspaceState()
  }

  private renderLoraFolders(): void {
    const tree = this.get<HTMLElement>('[data-role="lora-folder-tree"]')
    const counts = new Map<string, number>()
    let rootCount = 0
    for (const lora of this.state.loras) {
      const folder = loraFolderPath(lora.name)
      if (!folder) {
        rootCount += 1
        continue
      }
      const parts = folder.split("/")
      for (let index = 1; index <= parts.length; index += 1) {
        const path = parts.slice(0, index).join("/")
        counts.set(path, (counts.get(path) || 0) + 1)
      }
    }
    if (
      this.selectedLoraFolder !== null
      && this.selectedLoraFolder !== ""
      && !counts.has(this.selectedLoraFolder)
    ) this.selectedLoraFolder = null

    tree.replaceChildren()
    const addRow = (
      label: string,
      path: string | null,
      count: number,
      depth: number,
      kind: "all" | "root" | "folder",
    ) => {
      const button = element("button", "ss-lora-folder-row")
      button.type = "button"
      button.dataset.action = "select-lora-folder"
      button.dataset.folderPath = path === null ? "__all__" : path || "__root__"
      button.dataset.selected = String(this.selectedLoraFolder === path)
      button.dataset.kind = kind
      button.setAttribute("role", "treeitem")
      button.setAttribute("aria-selected", String(this.selectedLoraFolder === path))
      button.style.setProperty("--ss-folder-depth", String(depth))
      button.title = path === null ? "Show every LoRA" : path || "LoRAs stored at the model root"
      const icon = element("span")
      icon.innerHTML = kind === "all" ? FOLDER_TREE_ICON : FOLDER_ICON
      button.append(icon, element("span", "", label), element("small", "", String(count)))
      tree.appendChild(button)
    }

    addRow("All LoRAs", null, this.state.loras.length, 0, "all")
    if (rootCount || this.selectedLoraFolder === "") addRow("Root", "", rootCount, 0, "root")
    for (const [path, count] of [...counts].sort(([left], [right]) =>
      left.localeCompare(right, undefined, { sensitivity: "base", numeric: true })
    )) {
      const parts = path.split("/")
      addRow(parts.at(-1) || path, path, count, Math.max(0, parts.length - 1), "folder")
    }
  }

  private filteredLoras(): LoraMetadata[] {
    const query = this.get<HTMLInputElement>('[data-role="lora-search"]').value.trim().toLowerCase()
    const sort = this.get<HTMLSelectElement>('[data-role="lora-sort"]').value
    const compatibility = this.get<HTMLSelectElement>('[data-role="lora-filter"]').value
    const items = this.state.loras.filter((lora) => {
      if (this.selectedLoraFolder !== null) {
        const folder = loraFolderPath(lora.name)
        if (this.selectedLoraFolder === "") {
          if (folder) return false
        } else if (
          folder !== this.selectedLoraFolder
          && !folder.startsWith(`${this.selectedLoraFolder}/`)
        ) return false
      }
      if (compatibility === "compatible" && !this.isLoraCompatible(lora)) return false
      return matchesKeywordQuery(query, [
        lora.name,
        lora.title,
        lora.author,
        lora.description,
        lora.architecture,
        lora.className,
        lora.compatClass,
        lora.resolution,
        lora.license,
        lora.date,
        lora.usageHint,
        lora.triggerPhrase,
        lora.hash,
        this.loraFamily(lora),
        lora.local ? "local" : "remote",
        lora.tags,
      ])
    })
    return items.sort((a, b) => {
      if (sort === "newest") return (b.timeModified || b.timeCreated || 0) - (a.timeModified || a.timeCreated || 0)
      if (sort === "name") return a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      return a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    })
  }

  private renderLoras(): void {
    const grid = this.get<HTMLElement>('[data-role="lora-grid"]')
    this.previewObserver?.disconnect()
    grid.replaceChildren()
    this.renderLoraFolders()
    const items = this.filteredLoras()
    this.get<HTMLElement>('[data-role="lora-count"]').textContent =
      `${items.length}${items.length !== this.state.loras.length ? ` of ${this.state.loras.length}` : ""} model${items.length === 1 ? "" : "s"}`
    this.updateDockSummary()

    if (!this.state.connection) {
      grid.appendChild(element("div", "ss-empty", "Choose a SwarmUI connection to load its LoRA library."))
      return
    }
    if (!items.length) {
      const compatibleOnly = this.get<HTMLSelectElement>('[data-role="lora-filter"]').value === "compatible"
      const text = this.state.loras.length
        ? compatibleOnly
          ? `No compatible LoRAs match ${familyLabel(this.selectedModelFamily())}. Switch to “All model families” to inspect everything.`
          : "No LoRAs match this search."
        : "No LoRA metadata was returned. You can still add a model by filename."
      grid.appendChild(element("div", "ss-empty", text))
      return
    }

    this.previewObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const image = entry.target as HTMLImageElement
        this.previewObserver?.unobserve(image)
        const name = image.dataset.name || ""
        const previewRef = image.dataset.previewRef || ""
        if (!name || !previewRef || this.requestedPreviews.has(name)) continue
        this.requestedPreviews.add(name)
        this.send("preview", {
          connectionId: this.state.connection?.id,
          name,
          previewRef,
        })
      }
    }, { root: grid, rootMargin: "120px" })

    for (const lora of items) grid.appendChild(this.makeLoraCard(lora))
  }

  private makeLoraCard(lora: LoraMetadata): HTMLElement {
    const card = element("article", "ss-lora-card")
    card.title = [
      lora.name,
      lora.triggerPhrase ? `Trigger: ${lora.triggerPhrase}` : "",
      lora.compatClass || lora.architecture,
      lora.usageHint,
    ].filter(Boolean).join("\n")

    const preview = element("div", "ss-lora-preview")
    const cached = this.previewCache.get(lora.name)
    if (cached) {
      const image = element("img")
      image.src = cached
      image.alt = `${lora.title} preview`
      image.dataset.loraImage = lora.name
      preview.appendChild(image)
    } else if (lora.previewRef) {
      const image = element("img")
      image.alt = ""
      image.dataset.name = lora.name
      image.dataset.previewRef = lora.previewRef
      image.dataset.loraImage = lora.name
      preview.appendChild(image)
      this.previewObserver?.observe(image)
    } else {
      preview.appendChild(element("div", "ss-lora-placeholder", "◇"))
    }

    const body = element("div", "ss-lora-body")
    body.appendChild(element("div", "ss-lora-title", lora.title || labelFromName(lora.name)))
    body.appendChild(element("div", "ss-lora-author", lora.author || lora.name))
    body.appendChild(element("div", "ss-lora-desc", lora.description || lora.usageHint || lora.triggerPhrase || "No description in SwarmUI metadata."))

    const badges = element("div", "ss-badges")
    const badgeValues = [
      lora.compatClass || lora.architecture,
      lora.triggerPhrase ? `trigger: ${lora.triggerPhrase}` : "",
      ...lora.tags.slice(0, 1),
    ].filter(Boolean).slice(0, 3)
    for (const value of badgeValues) badges.appendChild(element("span", "ss-badge", value))
    if (!this.isLoraCompatible(lora)) {
      badges.appendChild(element("span", "ss-badge ss-badge-warning", "model mismatch"))
    }
    body.appendChild(badges)

    const footer = element("div", "ss-lora-footer")
    footer.appendChild(element("span", "ss-weight-label", `default ${lora.defaultWeight.toFixed(2)}`))
    const inStack = this.state.stack.some((item) => item.lora.name === lora.name)
    const add = element("button", `ss-button ss-add-button${inStack ? "" : " ss-button-primary"}`, inStack ? "Stacked" : "Add")
    add.disabled = inStack
    add.addEventListener("click", () => this.addLora(lora))
    footer.appendChild(add)
    body.appendChild(footer)

    card.append(preview, body)
    return card
  }

  private updatePreviewImages(name: string, dataUrl: string): void {
    for (const image of this.root.querySelectorAll<HTMLImageElement>("[data-lora-image]")) {
      if (image.dataset.loraImage === name) image.src = dataUrl
    }
  }

  private addLora(lora: LoraMetadata): void {
    if (this.state.stack.some((item) => item.lora.name === lora.name)) return
    this.state.stack.push({
      lora,
      weight: clamp(Number(lora.defaultWeight) || 1, -10, 10),
      enabled: true,
      useTrigger: false,
    })
    this.renderStack()
    this.renderLoras()
  }

  private toggleLoraDownloader(force?: boolean, focus = true): void {
    const search = this.get<HTMLInputElement>('[data-role="lora-search"]')
    const entry = this.get<HTMLElement>('[data-role="lora-download-entry"]')
    const shouldOpen = force ?? entry.hidden
    if (!shouldOpen && this.loraDownloadActive) {
      this.cancelLoraDownload()
      return
    }
    entry.hidden = !shouldOpen
    search.hidden = shouldOpen
    entry.closest(".ss-library-tools")?.classList.toggle("ss-download-open", shouldOpen)
    const toggle = this.get<HTMLButtonElement>('[data-action="toggle-lora-download"]')
    toggle.dataset.active = String(shouldOpen)
    toggle.querySelector("span")!.textContent = shouldOpen ? "Searching" : "Download"
    if (shouldOpen && focus) this.get<HTMLInputElement>('[data-role="lora-download-url"]').focus()
  }

  private startManualLoraDownload(): void {
    const url = this.get<HTMLInputElement>('[data-role="lora-download-url"]').value.trim()
    const name = this.get<HTMLInputElement>('[data-role="lora-download-name"]').value.trim()
    if (!url || !this.state.connection) {
      this.setLoraDownloadStatus(url ? "Choose a SwarmUI connection first." : "Paste a download URL first.", true)
      return
    }
    this.startLoraDownloadBatch([{ name, title: name, sourceUrl: url, weight: 1, enabled: true, useTrigger: false }])
  }

  private downloadSelectedMissingLoras(): void {
    const selected = [...this.root.querySelectorAll<HTMLInputElement>('[data-role="missing-lora-download"]:checked')]
      .map((input) => this.missingLoras[Number(input.dataset.index)])
      .filter((item): item is StackPresetItem => Boolean(item?.sourceUrl))
    if (!selected.length) {
      this.setLoraDownloadStatus("Select at least one LoRA with a source URL.", true)
      return
    }
    this.startLoraDownloadBatch(selected)
  }

  private startLoraDownloadBatch(items: StackPresetItem[]): void {
    if (!items.length || !this.state.connection) return
    if (this.loraDownloadActive) {
      this.setLoraDownloadStatus("A LoRA download is already running. Cancel it before starting another.", true)
      return
    }
    this.loraDownloadActive = true
    this.setLoraDownloadStatus(`Preparing ${items.length === 1 ? items[0].title || labelFromName(items[0].name) : `${items.length} LoRA downloads`}…`, false, 0)
    this.loraDownloadRequestId = this.send("start_lora_download", {
      connectionId: this.state.connection.id,
      items: items.map((item) => ({
        url: item.sourceUrl,
        name: item.name,
        title: item.title || labelFromName(item.name),
      })),
    })
  }

  private cancelLoraDownload(): void {
    this.loraDownloadRequestId = ""
    if (this.loraDownloadActive) this.send("cancel_lora_download", { jobId: this.loraDownloadJobId })
    this.loraDownloadActive = false
    this.setLoraDownloadStatus("", false)
    this.toggleLoraDownloader(false)
  }

  private setLoraDownloadStatus(message: string, error = false, progress = 0): void {
    const bar = this.get<HTMLElement>('[data-role="lora-download-progress"]')
    bar.hidden = !message
    bar.style.setProperty("--ss-download-progress", `${Math.round(clamp(progress, 0, 1) * 100)}%`)
    bar.title = message
    const modalStatus = this.root.querySelector<HTMLElement>('[data-role="missing-lora-download-status"]')
    if (modalStatus) {
      modalStatus.textContent = message
      modalStatus.style.color = error ? "#ff8b96" : ""
    }
    if (message) this.setRunStatus(message, error)
  }

  private renderStack(): void {
    const list = this.get<HTMLElement>('[data-role="stack-list"]')
    list.replaceChildren()
    if (!this.state.stack.length) {
      list.appendChild(element("div", "ss-empty", "Add LoRAs from the library. Metadata triggers stay off until you enable them."))
    } else {
      this.state.stack.forEach((item, index) => list.appendChild(this.makeStackRow(item, index)))
    }
    const enabled = this.state.stack.filter((item) => item.enabled).length
    this.get<HTMLElement>('[data-role="stack-count"]').textContent = `${enabled} enabled · ${this.state.stack.length} stacked`
    this.get<HTMLButtonElement>('[data-action="clear-stack"]').disabled = this.state.stack.length === 0
    this.get<HTMLElement>('[data-role="command-stack-summary"]').textContent = enabled
      ? `${enabled} LoRA${enabled === 1 ? "" : "s"} enabled`
      : "No LoRAs enabled"
    this.updateDockSummary()
    this.updateTriggerSummary()
  }

  private makeStackRow(item: StackItem, index: number): HTMLElement {
    const row = element("div", "ss-stack-row")
    const installed = Boolean(this.installedLora(item.lora.name))
    row.dataset.disabled = String(!item.enabled)
    row.dataset.missing = String(!installed)
    row.dataset.incompatible = String(installed && !this.isLoraCompatible(item.lora))

    const enabled = element("input") as HTMLInputElement
    enabled.type = "checkbox"
    enabled.checked = item.enabled
    enabled.title = "Enable LoRA"
    enabled.addEventListener("change", () => {
      item.enabled = enabled.checked
      this.renderStack()
    })

    const preview = element("div", "ss-stack-preview")
    const cachedPreview = this.previewCache.get(item.lora.name)
    if (cachedPreview || item.lora.previewRef) {
      const image = element("img")
      image.alt = cachedPreview ? `${item.lora.title || labelFromName(item.lora.name)} preview` : ""
      image.dataset.loraImage = item.lora.name
      if (cachedPreview) {
        image.src = cachedPreview
      } else if (item.lora.previewRef) {
        image.dataset.name = item.lora.name
        image.dataset.previewRef = item.lora.previewRef
        if (!this.requestedPreviews.has(item.lora.name)) {
          this.requestedPreviews.add(item.lora.name)
          this.send("preview", {
            connectionId: this.state.connection?.id,
            name: item.lora.name,
            previewRef: item.lora.previewRef,
          })
        }
      }
      preview.appendChild(image)
    } else {
      preview.textContent = "◇"
    }

    const name = element("div", "ss-stack-name")
    name.appendChild(element("strong", "", item.lora.title || labelFromName(item.lora.name)))
    name.appendChild(element("span", "", item.lora.name))

    const weight = element("input", "ss-input ss-stack-weight") as HTMLInputElement
    weight.type = "number"
    weight.min = "-10"
    weight.max = "10"
    weight.step = "0.05"
    weight.value = String(item.weight)
    weight.title = "LoRA weight"
    weight.addEventListener("change", () => {
      item.weight = clamp(numberValue(weight, item.weight), -10, 10)
      weight.value = String(item.weight)
    })

    const trigger = element("label", "ss-trigger-toggle")
    const triggerCheckbox = element("input") as HTMLInputElement
    triggerCheckbox.type = "checkbox"
    triggerCheckbox.checked = item.useTrigger
    triggerCheckbox.disabled = !item.lora.triggerPhrase
    triggerCheckbox.addEventListener("change", () => {
      item.useTrigger = triggerCheckbox.checked
      this.updateTriggerSummary()
    })
    trigger.append(triggerCheckbox, document.createTextNode("trigger"))
    trigger.title = item.lora.triggerPhrase || "No trigger phrase in metadata"

    const actions = element("div", "ss-stack-actions")
    const up = element("button", "ss-icon-button", "↑")
    up.disabled = index === 0
    up.title = "Move up"
    up.addEventListener("click", () => this.moveStack(index, -1))
    const down = element("button", "ss-icon-button", "↓")
    down.disabled = index === this.state.stack.length - 1
    down.title = "Move down"
    down.addEventListener("click", () => this.moveStack(index, 1))
    const remove = element("button", "ss-icon-button ss-button-danger", "×")
    remove.title = "Remove"
    remove.addEventListener("click", () => {
      this.state.stack.splice(index, 1)
      this.renderStack()
      this.renderLoras()
    })
    actions.append(up, down, remove)
    row.append(enabled, preview, name, weight, trigger, actions)
    return row
  }

  private moveStack(index: number, direction: number): void {
    const target = index + direction
    if (target < 0 || target >= this.state.stack.length) return
    const [item] = this.state.stack.splice(index, 1)
    this.state.stack.splice(target, 0, item)
    this.renderStack()
  }

  private updateDockSummary(): void {
    const target = this.root.querySelector<HTMLElement>('[data-role="dock-summary"]')
    if (!target) return
    target.textContent = `${this.state.loras.length} models · ${this.state.stack.length} stacked`
  }

  private renderStackPresets(): void {
    for (const select of this.root.querySelectorAll<HTMLSelectElement>(
      '[data-role="stack-preset"], [data-role="mobile-stack-preset"]',
    )) {
      const selected = select.value
      select.replaceChildren()
      const placeholder = element("option", "", this.state.stackPresets.length ? "Saved stacks…" : "No saved stacks")
      placeholder.value = ""
      select.appendChild(placeholder)
      for (const preset of this.state.stackPresets) {
        const option = element("option", "", `${preset.name} · ${preset.items.length}`)
        option.value = preset.id
        select.appendChild(option)
      }
      if (selected && this.state.stackPresets.some((preset) => preset.id === selected)) {
        select.value = selected
      }
    }
    this.updatePresetButtons()
  }

  private setStackPresetSelection(presetId: string): void {
    for (const select of this.root.querySelectorAll<HTMLSelectElement>(
      '[data-role="stack-preset"], [data-role="mobile-stack-preset"]',
    )) {
      select.value = [...select.options].some((option) => option.value === presetId) ? presetId : ""
    }
    this.updatePresetButtons()
  }

  private updatePresetButtons(): void {
    const selected = Boolean(this.get<HTMLSelectElement>('[data-role="stack-preset"]').value)
    this.get<HTMLButtonElement>('[data-action="load-stack"]').disabled = !selected
    this.get<HTMLButtonElement>('[data-action="delete-stack"]').disabled = !selected
  }

  private saveStackPreset(): void {
    if (!this.state.stack.length) {
      this.setRunStatus("Add at least one LoRA before saving a stack.", true)
      return
    }
    const select = this.get<HTMLSelectElement>('[data-role="stack-preset"]')
    const existing = this.state.stackPresets.find((preset) => preset.id === select.value)
    const name = window.prompt("Save LoRA stack as", existing?.name || "")
    if (!name?.trim()) return
    this.send("save_stack_preset", {
      preset: {
        id: existing?.id || "",
        name: name.trim(),
        items: this.state.stack.map((item) => ({
          name: item.lora.name,
          title: item.lora.title,
          weight: item.weight,
          enabled: item.enabled,
          useTrigger: item.useTrigger,
          sourceUrl: item.lora.sourceUrl,
        })),
      },
    })
    this.setRunStatus(`Saving LoRA stack “${name.trim()}”…`)
  }

  private loadStackPreset(requestedPresetId?: string, announce = true): void {
    const presetId = requestedPresetId || this.get<HTMLSelectElement>('[data-role="stack-preset"]').value
    const preset = this.state.stackPresets.find((item) => item.id === presetId)
    if (!preset) return
    this.state.stack = preset.items.map((item) => {
      const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
      return {
        lora,
        weight: clamp(Number(item.weight) || 1, -10, 10),
        enabled: item.enabled !== false,
        useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
      }
    })
    this.setStackPresetSelection(preset.id)
    this.renderStack()
    this.renderLoras()
    if (announce) this.setRunStatus(`Loaded LoRA stack “${preset.name}”.`)
  }

  private stackName(): string {
    const selectedId = this.get<HTMLSelectElement>('[data-role="stack-preset"]').value
    return this.state.stackPresets.find((preset) => preset.id === selectedId)?.name || "Swarm Studio stack"
  }

  private stackExportItems(): StackPresetItem[] {
    return this.state.stack.map((item) => ({
      name: item.lora.name,
      title: item.lora.title,
      weight: clamp(Number(item.weight) || 1, -10, 10),
      enabled: item.enabled,
      useTrigger: Boolean(item.useTrigger),
      sourceUrl: safeHttpUrl(item.lora.sourceUrl),
    }))
  }

  private exportStack(): void {
    if (!this.state.stack.length) {
      this.setRunStatus("Add at least one LoRA before exporting a stack.", true)
      return
    }
    const name = this.stackName()
    downloadJson({
      version: 1,
      type: "swarm_studio_lora_stack",
      exported_at: Math.floor(Date.now() / 1000),
      stack: { name, items: this.stackExportItems() },
    }, `${name}-swarm-studio.json`)
    this.setRunStatus(`Exported LoRA stack “${name}”.`)
  }

  private async applyLumiverseStack(): Promise<void> {
    const enabled = this.state.stack.filter((item) => item.enabled)
    if (!enabled.length) {
      this.setRunStatus("Enable at least one LoRA before applying this stack to Lumiverse Image Gen.", true)
      return
    }
    const name = this.stackName()
    const baseTags = enabled
      .filter((item) => item.useTrigger && item.lora.triggerPhrase)
      .map((item) => item.lora.triggerPhrase.trim())
      .filter(Boolean)
      .join(", ")
    const button = this.get<HTMLButtonElement>('[data-action="apply-lumi-stack"]')
    button.disabled = true
    this.setRunStatus(`Applying “${name}” to Lumiverse Image Gen…`)
    try {
      const exportResponse = await fetch("/api/v1/image-gen/export", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          include_settings: true,
          include_presets: false,
          include_connections: false,
          include_parameters: false,
        }),
      })
      const exported = await exportResponse.json().catch(() => ({}))
      if (!exportResponse.ok) throw new Error(String(exported?.error || `Could not read Lumiverse Image Gen settings (${exportResponse.status}).`))
      const existing = Array.isArray(exported?.settings?.loraPresets) ? exported.settings.loraPresets : []
      const sameName = existing.find((preset: any) => String(preset?.name || "").trim().toLowerCase() === name.trim().toLowerCase())
      const id = String(sameName?.id || `swarm-studio-${createRequestId()}`)
      const nextPreset = {
        id,
        name,
        loras: enabled.map((item) => ({
          lora_name: item.lora.name,
          weight_model: clamp(Number(item.weight) || 1, -10, 10),
          weight_clip: clamp(Number(item.weight) || 1, -10, 10),
        })),
        ...(baseTags ? { base_tags: baseTags } : {}),
      }
      const merged = existing.filter((preset: any) => String(preset?.id || "") !== id && String(preset?.name || "").trim().toLowerCase() !== name.trim().toLowerCase())
      merged.push(nextPreset)
      const importResponse = await fetch("/api/v1/image-gen/import", {
        method: "POST",
        credentials: "include",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          version: 1,
          type: "lumiverse_image_gen_config",
          exported_at: Math.floor(Date.now() / 1000),
          settings: { loraPresets: merged, activeLoraPresetId: id },
        }),
      })
      const imported = await importResponse.json().catch(() => ({}))
      if (!importResponse.ok) throw new Error(String(imported?.error || `Lumiverse rejected the stack (${importResponse.status}).`))
      this.setRunStatus(`Applied and activated “${name}” in Lumiverse Image Gen. Reopen the native tab if it was already open so it reloads the saved settings.`)
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : "Could not apply this stack to Lumiverse Image Gen.", true)
    } finally {
      button.disabled = false
    }
  }

  private importedStackPayload(payload: unknown): { name: string; items: StackPresetItem[] } {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("The selected file is not a JSON object.")
    }
    const record = payload as Record<string, any>
    let name = "Imported LoRA stack"
    let rawItems: any[] = []
    if (record.type === "swarm_studio_lora_stack") {
      const stack = record.stack && typeof record.stack === "object" ? record.stack : {}
      name = String(stack.name || name).trim().slice(0, 80) || name
      rawItems = Array.isArray(stack.items) ? stack.items : []
    } else {
      const settings = record.settings && typeof record.settings === "object" ? record.settings : record
      const presets = Array.isArray(settings.loraPresets)
        ? settings.loraPresets
        : Array.isArray(record.loraPresets)
          ? record.loraPresets
          : []
      const activeId = String(settings.activeLoraPresetId || record.activeLoraPresetId || "")
      const loraPreset = presets.find((preset: any) => String(preset?.id || "") === activeId) || presets[0]
        || (Array.isArray(record.loras) ? record : null)
      if (loraPreset) {
        name = String(loraPreset.name || name).trim().slice(0, 80) || name
        rawItems = Array.isArray(loraPreset.loras) ? loraPreset.loras : []
      } else if (Array.isArray(record.items)) {
        name = String(record.name || name).trim().slice(0, 80) || name
        rawItems = record.items
      }
    }
    if (!rawItems.length) throw new Error("No LoRAs were found in that stack or Lumiverse Image Gen config.")
    const items = rawItems.slice(0, 64).map((raw, index): StackPresetItem => {
      const nameValue = String(raw?.name || raw?.lora_name || "").trim().slice(0, 500)
      if (!nameValue) throw new Error(`LoRA entry ${index + 1} is missing its filename.`)
      const weightValue = Number(raw?.weight ?? raw?.weight_model)
      return {
        name: nameValue,
        title: String(raw?.title || "").trim().slice(0, 200),
        weight: Number.isFinite(weightValue) ? clamp(weightValue, -10, 10) : 1,
        enabled: raw?.enabled !== false,
        useTrigger: Boolean(raw?.useTrigger),
        sourceUrl: safeHttpUrl(raw?.sourceUrl || raw?.source_url || raw?.civitai_url),
      }
    })
    return { name, items }
  }

  private async importStackFile(file: File): Promise<void> {
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("Stack files must be 2 MB or smaller.")
      const imported = this.importedStackPayload(JSON.parse(await file.text()))
      this.state.stack = imported.items.map((item) => {
        const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
        return {
          lora,
          weight: item.weight,
          enabled: item.enabled,
          useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
        }
      })
      this.missingLoras = imported.items.filter((item) => !this.installedLora(item.name))
      this.renderStack()
      this.renderLoras()
      this.setRunStatus(`Imported “${imported.name}” with ${imported.items.length} LoRA${imported.items.length === 1 ? "" : "s"}.`)
      if (this.missingLoras.length) this.showMissingLoras()
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : "Could not import that LoRA stack.", true)
    }
  }

  private normalizedLoraName(name: string): string {
    return String(name || "")
      .trim()
      .replace(/^<lora:/i, "")
      .replace(/:[+-]?(?:\d+(?:\.\d*)?|\.\d+)>$/i, "")
      .replace(/>$/, "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .toLowerCase()
  }

  private loraNameParts(name: string): { full: string; stem: string; base: string; baseStem: string } {
    const full = this.normalizedLoraName(name)
    const stem = full.replace(/\.(?:safetensors|ckpt|pt|pth|bin)$/i, "")
    const base = full.split("/").pop() || full
    const baseStem = base.replace(/\.(?:safetensors|ckpt|pt|pth|bin)$/i, "")
    return { full, stem, base, baseStem }
  }

  private loraMatchScore(left: string, right: string): number {
    const a = this.loraNameParts(left)
    const b = this.loraNameParts(right)
    if (!a.full || !b.full) return 0
    if (a.full === b.full) return 100
    if (a.stem === b.stem) return 80
    if (a.base === b.base) return 60
    if (a.baseStem === b.baseStem) return 40
    return 0
  }

  private sameLoraName(left: string, right: string): boolean {
    return this.loraMatchScore(left, right) > 0
  }

  private installedLora(name: string): LoraMetadata | null {
    let bestScore = 0
    let best: LoraMetadata[] = []
    for (const item of this.state.loras) {
      const score = this.loraMatchScore(name, item.name)
      if (score > bestScore) {
        bestScore = score
        best = [item]
      } else if (score > 0 && score === bestScore) {
        best.push(item)
      }
    }
    return bestScore > 0 && best.length === 1 ? best[0] : null
  }

  private showMissingLoras(): void {
    const list = this.get<HTMLElement>('[data-role="missing-lora-list"]')
    list.replaceChildren()
    this.missingLoras.forEach((item, index) => {
      const row = element("div", "ss-missing-lora-row")
      const select = element("input") as HTMLInputElement
      select.type = "checkbox"
      select.dataset.role = "missing-lora-download"
      select.dataset.index = String(index)
      const details = element("div")
      details.append(element("strong", "", item.title || labelFromName(item.name)), element("span", "", item.name))
      const sourceUrl = safeHttpUrl(item.sourceUrl)
      select.checked = Boolean(sourceUrl)
      select.disabled = !sourceUrl
      row.append(select, details)
      if (sourceUrl) {
        const link = element("a", "", "Source ↗") as HTMLAnchorElement
        link.href = sourceUrl
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        row.appendChild(link)
      } else {
        row.appendChild(element("span", "", "No source URL"))
      }
      list.appendChild(row)
    })
    this.setLoraDownloadStatus("", false)
    this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden = false
  }

  private closeMissingLoras(): void {
    this.get<HTMLElement>('[data-role="missing-lora-modal"]').hidden = true
  }

  private async copyMissingLoras(): Promise<void> {
    if (!this.missingLoras.length) return
    const text = this.missingLoras
      .map((item) => `${item.name}${safeHttpUrl(item.sourceUrl) ? `\t${safeHttpUrl(item.sourceUrl)}` : ""}`)
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      this.setRunStatus("Missing LoRA filenames and source links copied for SwarmUI’s Model Downloader.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private deleteStackPreset(): void {
    const select = this.get<HTMLSelectElement>('[data-role="stack-preset"]')
    const preset = this.state.stackPresets.find((item) => item.id === select.value)
    if (!preset || !window.confirm(`Delete saved LoRA stack “${preset.name}”?`)) return
    this.send("delete_stack_preset", { presetId: preset.id })
    this.setRunStatus(`Deleting LoRA stack “${preset.name}”…`)
  }

  private restoreWorkspaceState(): void {
    let state: any = {}
    try { state = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) || "{}") } catch {}
    const shell = this.get<HTMLElement>(".ss-shell")
    shell.classList.toggle("ss-generation-collapsed", state?.collapsed?.generation === true)
    shell.classList.toggle("ss-history-collapsed", state?.collapsed?.history === true)
    shell.classList.toggle("ss-loras-collapsed", state?.collapsed?.loras === true)
    shell.classList.toggle("ss-fullscreen-layer", state?.fullscreen === true)
    const advanced = this.root.querySelector<HTMLDetailsElement>("details.ss-advanced")
    if (advanced) advanced.open = state?.details?.advanced === true
    const savedLoraFolder = state?.loraBrowser?.folder
    this.selectedLoraFolder = savedLoraFolder === null || typeof savedLoraFolder === "string"
      ? savedLoraFolder
      : null
    this.loraFoldersOpen = state?.loraBrowser?.open === true
      && !window.matchMedia("(max-width: 720px)").matches
    const loraBrowser = this.get<HTMLElement>('[data-role="lora-browser"]')
    const loraFolderSidebar = this.get<HTMLElement>('[data-role="lora-folder-sidebar"]')
    const loraFolderToggle = this.get<HTMLButtonElement>('[data-role="lora-folder-toggle"]')
    loraBrowser.dataset.foldersOpen = String(this.loraFoldersOpen)
    loraFolderSidebar.hidden = !this.loraFoldersOpen
    loraFolderToggle.dataset.active = String(this.loraFoldersOpen)
    loraFolderToggle.setAttribute("aria-expanded", String(this.loraFoldersOpen))
    const savedLoraSort = ["title", "name", "newest"].includes(state?.loraBrowser?.sort)
      ? state.loraBrowser.sort
      : "title"
    const loraSort = this.get<HTMLSelectElement>('[data-role="lora-sort"]')
    loraSort.value = savedLoraSort
    const sortLabel = savedLoraSort === "name" ? "Filename" : savedLoraSort === "newest" ? "Newest" : "Title"
    const loraSortButton = this.get<HTMLButtonElement>('[data-role="lora-sort-button"]')
    loraSortButton.title = `Sort LoRAs: ${sortLabel}`
    loraSortButton.setAttribute("aria-label", `Sort LoRAs: ${sortLabel}`)
    for (const choice of this.root.querySelectorAll<HTMLElement>('[data-action="select-lora-sort"]')) {
      choice.dataset.selected = String(choice.dataset.sortValue === savedLoraSort)
    }
    const sizes: Record<string, string> = {
      generationWidth: "--ss-generation-width",
      historyWidth: "--ss-history-width",
      dockHeight: "--ss-dock-height",
      libraryWidth: "--ss-library-width",
      promptHeight: "--ss-prompt-height",
    }
    for (const [key, property] of Object.entries(sizes)) {
      const value = Number(state?.sizes?.[key])
      if (Number.isFinite(value) && value >= 50 && value <= 2400) shell.style.setProperty(property, `${Math.round(value)}px`)
    }
    this.setMobileTab(typeof state?.mobileTab === "string" ? state.mobileTab : "create")
    this.updateWorkspaceButtons()
  }

  private persistWorkspaceState(): void {
    const shell = this.root.querySelector<HTMLElement>(".ss-shell")
    if (!shell) return
    const size = (property: string): number | null => {
      const value = Number.parseFloat(shell.style.getPropertyValue(property))
      return Number.isFinite(value) ? Math.round(value) : null
    }
    try {
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
        fullscreen: shell.classList.contains("ss-fullscreen-layer"),
        mobileTab: shell.dataset.mobileTab || "create",
        collapsed: {
          generation: shell.classList.contains("ss-generation-collapsed"),
          history: shell.classList.contains("ss-history-collapsed"),
          loras: shell.classList.contains("ss-loras-collapsed"),
        },
        details: {
          advanced: this.root.querySelector<HTMLDetailsElement>("details.ss-advanced")?.open === true,
        },
        loraBrowser: {
          open: this.loraFoldersOpen,
          folder: this.selectedLoraFolder,
          sort: this.get<HTMLSelectElement>('[data-role="lora-sort"]').value,
        },
        sizes: {
          generationWidth: size("--ss-generation-width"),
          historyWidth: size("--ss-history-width"),
          dockHeight: size("--ss-dock-height"),
          libraryWidth: size("--ss-library-width"),
          promptHeight: size("--ss-prompt-height"),
        },
      }))
    } catch {}
  }

  private updateWorkspaceButtons(): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const generation = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-generation"]')
    const history = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-history"]')
    const loras = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-loras"]')
    const fullscreen = this.root.querySelector<HTMLButtonElement>('[data-action="toggle-fullscreen"]')
    const generationCollapsed = shell.classList.contains("ss-generation-collapsed")
    const historyCollapsed = shell.classList.contains("ss-history-collapsed")
    const lorasCollapsed = shell.classList.contains("ss-loras-collapsed")
    const isFullscreen = shell.classList.contains("ss-fullscreen-layer")
    if (generation) { generation.textContent = generationCollapsed ? "›" : "‹"; generation.setAttribute("aria-expanded", String(!generationCollapsed)) }
    if (history) { history.textContent = historyCollapsed ? "‹" : "›"; history.setAttribute("aria-expanded", String(!historyCollapsed)) }
    if (loras) { loras.textContent = lorasCollapsed ? "⌃" : "⌄"; loras.setAttribute("aria-expanded", String(!lorasCollapsed)) }
    if (fullscreen) { fullscreen.textContent = isFullscreen ? "🗗" : "⛶"; fullscreen.title = isFullscreen ? "Exit fullscreen studio" : "Enter fullscreen studio" }
  }

  private togglePane(pane: "generation" | "history" | "loras"): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const className = `ss-${pane}-collapsed`
    const collapsed = shell.classList.toggle(className)
    void collapsed
    this.updateWorkspaceButtons()
    this.persistWorkspaceState()
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private beginResize(kind: string, event: PointerEvent): void {
    if (window.matchMedia("(max-width: 720px)").matches) return
    if (!["generation", "history", "dock", "lora-split", "prompt"].includes(kind)) return
    event.preventDefault()
    this.stopActiveResize?.()
    const shell = this.get<HTMLElement>(".ss-shell")
    const previousUserSelect = document.body.style.userSelect
    shell.classList.add("ss-is-resizing")
    document.body.style.userSelect = "none"

    const move = (moveEvent: PointerEvent) => {
      this.applyResize(kind, moveEvent.clientX, moveEvent.clientY)
    }
    const stop = () => {
      document.removeEventListener("pointermove", move, true)
      document.removeEventListener("pointerup", stop, true)
      document.removeEventListener("pointercancel", stop, true)
      document.body.style.userSelect = previousUserSelect
      shell.classList.remove("ss-is-resizing")
      this.stopActiveResize = null
      this.persistWorkspaceState()
    }
    this.stopActiveResize = stop
    document.addEventListener("pointermove", move, true)
    document.addEventListener("pointerup", stop, true)
    document.addEventListener("pointercancel", stop, true)
  }

  private applyResize(kind: string, clientX: number, clientY: number): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    if (kind === "generation" || kind === "history") {
      const bounds = this.get<HTMLElement>(".ss-workspace").getBoundingClientRect()
      const max = Math.max(220, Math.min(520, bounds.width * 0.46))
      const width = kind === "generation"
        ? clamp(clientX - bounds.left, 180, max)
        : clamp(bounds.right - clientX, 160, max)
      shell.style.setProperty(
        kind === "generation" ? "--ss-generation-width" : "--ss-history-width",
        `${Math.round(width)}px`,
      )
    }
    if (kind === "dock") {
      const bounds = shell.getBoundingClientRect()
      const max = Math.max(190, Math.min(540, bounds.height * 0.6))
      shell.style.setProperty("--ss-dock-height", `${Math.round(clamp(bounds.bottom - clientY, 118, max))}px`)
    }
    if (kind === "lora-split") {
      const bounds = this.get<HTMLElement>(".ss-lora-dock-content").getBoundingClientRect()
      const width = clamp(clientX - bounds.left, 220, Math.max(220, bounds.width - 250))
      shell.style.setProperty("--ss-library-width", `${Math.round(width)}px`)
    }
    if (kind === "prompt") {
      const bounds = this.get<HTMLElement>(".ss-center").getBoundingClientRect()
      const max = Math.max(130, bounds.height - 180)
      shell.style.setProperty("--ss-prompt-height", `${Math.round(clamp(bounds.bottom - clientY, 105, max))}px`)
    }
    this.fitPreviewToAspect()
  }

  private resetResize(kind: string): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const properties: Record<string, string> = {
      generation: "--ss-generation-width",
      history: "--ss-history-width",
      dock: "--ss-dock-height",
      "lora-split": "--ss-library-width",
      prompt: "--ss-prompt-height",
    }
    const property = properties[kind]
    if (property) shell.style.removeProperty(property)
    this.persistWorkspaceState()
    this.fitPreviewToAspect()
  }

  private toggleFullscreen(force?: boolean): void {
    const shell = this.get<HTMLElement>(".ss-shell")
    const shouldEnter = force ?? !shell.classList.contains("ss-fullscreen-layer")
    shell.classList.toggle("ss-fullscreen-layer", shouldEnter)
    this.updateWorkspaceButtons()
    this.persistWorkspaceState()
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private setMobileTab(tab: string): void {
    const allowed = new Set(["create", "generation", "loras", "stack", "history"])
    const selected = allowed.has(tab) ? tab : "create"
    const shell = this.get<HTMLElement>(".ss-shell")
    shell.dataset.mobileTab = selected
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".ss-mobile-tab")) {
      const active = button.dataset.tab === selected
      button.dataset.active = String(active)
      button.setAttribute("aria-current", active ? "page" : "false")
    }
    this.persistWorkspaceState()
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private openInspector(): void {
    const image = this.state.currentImage
    if (!image) return
    const inspector = this.get<HTMLElement>('[data-role="inspector"]')
    const inspectorImage = this.get<HTMLImageElement>('[data-role="inspector-image"]')
    inspectorImage.onload = () => this.fitInspectorToSpace()
    inspectorImage.src = image.url || image.src
    this.get<HTMLElement>('[data-role="inspector-title"]').textContent = image.label
    const details = image.details || null
    const parameters = details?.parameters || {}
    const facts = this.get<HTMLElement>('[data-role="inspector-facts"]')
    facts.replaceChildren()
    const factValues = [
      details?.model,
      parameters.width && parameters.height ? `${parameters.width} × ${parameters.height}` : "",
      parameters.steps ? `${parameters.steps} steps` : "",
      parameters.seed !== undefined ? `seed ${parameters.seed}` : "",
      parameters.sampler ? String(parameters.sampler) : "",
      parameters.scheduler ? String(parameters.scheduler) : "",
      details?.timing?.prep ? `${details.timing.prep} prep` : "",
      details?.timing?.generation ? `${details.timing.generation} gen` : "",
      !details?.timing?.prep && details?.timing?.totalMs
        ? `${(details.timing.totalMs / 1000).toFixed(2)} sec total`
        : "",
      details?.presets?.length ? `presets · ${details.presets.join(" → ")}` : "",
      details?.workflow ? `workflow · ${details.workflow}` : "",
      details?.initImageLabel ? `img2img · ${details.initImageLabel}` : "",
    ].filter(Boolean)
    for (const value of factValues) facts.appendChild(element("span", "ss-badge", String(value)))
    this.get<HTMLElement>('[data-role="inspector-positive"]').textContent =
      details?.resolvedPrompt || details?.prompt || "Prompt metadata is unavailable for this older output."
    this.get<HTMLElement>('[data-role="inspector-negative"]').textContent =
      details?.resolvedNegativePrompt || details?.negativePrompt || "No negative prompt recorded."
    this.get<HTMLElement>('[data-role="inspector-presets"]').textContent = details?.presets?.length
      ? details.presets.join("\n")
      : "No Swarm presets recorded."
    this.get<HTMLElement>('[data-role="inspector-loras"]').textContent = details?.loras?.length
      ? details.loras.map((lora) => `${lora.name} · ${lora.weight}`).join("\n")
      : "No LoRAs recorded."
    const path = details?.swarmPathVerified ? details.swarmPath || "" : ""
    this.get<HTMLElement>('[data-role="inspector-path"]').hidden = !path
    this.get<HTMLElement>('[data-role="inspector-path-value"]').textContent = path
    this.get<HTMLButtonElement>('[data-action="reuse-parameters"]').disabled = !details
    this.get<HTMLButtonElement>('[data-action="use-as-init"]').disabled = !image.src
    this.get<HTMLButtonElement>('[data-action="delete-output"]').disabled = !image.id
    this.updateAppendControls()
    this.syncFavoriteControls()
    inspector.hidden = false
    this.requestCurrentOutputMetadata("")
    this.setInspectorZoom(1)
    requestAnimationFrame(() => this.fitInspectorToSpace())
  }

  private closeInspector(): void {
    this.get<HTMLElement>('[data-role="inspector"]').hidden = true
  }

  private setInspectorZoom(value: number): void {
    this.imageScale = clamp(value, 0.5, 4)
    this.get<HTMLImageElement>('[data-role="inspector-image"]').style.setProperty("--ss-image-scale", String(this.imageScale))
    this.get<HTMLElement>('[data-role="zoom-label"]').textContent =
      this.imageScale === 1 ? "Fit" : `${Math.round(this.imageScale * 100)}%`
  }

  private fitInspectorToSpace(): void {
    const inspector = this.root.querySelector<HTMLElement>('[data-role="inspector"]')
    if (!inspector || inspector.hidden) return
    const stage = this.get<HTMLElement>('[data-role="inspector-stage"]')
    const image = this.get<HTMLImageElement>('[data-role="inspector-image"]')
    const recordedWidth = Number(this.state.currentImage?.details?.parameters?.width)
    const recordedHeight = Number(this.state.currentImage?.details?.parameters?.height)
    const naturalWidth = image.naturalWidth || recordedWidth
    const naturalHeight = image.naturalHeight || recordedHeight
    if (!naturalWidth || !naturalHeight || stage.clientWidth <= 0 || stage.clientHeight <= 0) return
    const fitted = fitAspectWithin(
      naturalWidth / naturalHeight,
      Math.max(80, stage.clientWidth - 48),
      Math.max(80, stage.clientHeight - 94),
    )
    image.style.width = `${Math.round(fitted.width)}px`
    image.style.height = `${Math.round(fitted.height)}px`
  }

  private restoreDraft(draft: StudioDraft): void {
    this.applyGenerationDetails(draft.details, draft, false)
    this.setRunStatus("Restored the previous Studio model, presets, LoRAs, workflow, sampler, scheduler, and render controls.")
  }

  private applyGenerationDetails(
    details: GenerationDetails,
    draft: StudioDraft | null = null,
    closeOverlays = true,
  ): void {
    const parameters = details.parameters || {}
    this.get<HTMLTextAreaElement>('[data-role="positive"]').value =
      details.resolvedPrompt || details.prompt || ""
    this.get<HTMLTextAreaElement>('[data-role="negative"]').value =
      details.resolvedNegativePrompt || details.negativePrompt || ""
    if (details.model) {
      const model = this.get<HTMLSelectElement>('[data-role="model"]')
      if (![...model.options].some((option) => option.value === details.model)) {
        const option = element("option", "", `${details.model} · reused`)
        option.value = details.model
        model.appendChild(option)
      }
      model.value = details.model
    }
    const assign = (role: string, value: unknown) => {
      if (value === undefined || value === null) return
      const control = this.get<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-role="${role}"]`)
      if (control instanceof HTMLSelectElement && value && ![...control.options].some((option) => option.value === String(value))) {
        const option = element("option", "", `${value} · reused`)
        option.value = String(value)
        control.appendChild(option)
      }
      control.value = String(value)
    }
    this.setDimensions(Number(parameters.width) || 1024, Number(parameters.height) || 1024)
    assign("steps", parameters.steps)
    assign("cfg", parameters.cfgScale)
    assign("seed", parameters.seed)
    assign("sampler", parameters.sampler)
    assign("scheduler", parameters.scheduler)
    assign("vae", parameters.vae)
    assign("unet", parameters.unet)
    assign("clip-l", parameters.clipLModel)
    assign("clip-g", parameters.clipGModel)
    assign("t5", parameters.t5XXLModel)
    assign("raw-override", parameters.rawRequestOverride)
    const workflowDraft = draft?.workflow || null
    const workflowName = workflowDraft?.name || details.workflow || ""
    if (workflowName && this.state.swarmWorkflows.some((workflow) => workflow.name === workflowName)) {
      const workflowSelect = this.get<HTMLSelectElement>('[data-role="workflow-select"]')
      workflowSelect.value = workflowName
      this.selectWorkflow(workflowName, closeOverlays, workflowDraft)
    } else {
      this.get<HTMLSelectElement>('[data-role="workflow-select"]').value = ""
      this.selectWorkflow("")
    }
    this.state.selectedPresets = draft
      ? draft.selectedPresets.map((preset) => ({ ...preset }))
      : (details.presets || []).map((title) => ({ title, enabled: true }))
    this.state.stack = draft
      ? draft.stack.map((saved) => {
          const lora = this.state.loras.find((item) => item.name === saved.name) || manualLora(saved.name, saved.title)
          return {
            lora,
            weight: clamp(Number(saved.weight) || 1, -10, 10),
            enabled: saved.enabled !== false,
            useTrigger: Boolean(saved.useTrigger && lora.triggerPhrase),
          }
        })
      : (details.loras || []).map((saved) => ({
          lora: this.state.loras.find((item) => item.name === saved.name) || manualLora(saved.name),
          weight: clamp(Number(saved.weight) || 1, -10, 10),
          enabled: true,
          useTrigger: false,
        }))
    if (draft) {
      this.state.initImage = draft.initImage ? { ...draft.initImage } : null
      this.renderInitImage()
    }
    this.renderStack()
    this.renderLoras()
    this.renderPresetStack()
    this.updateContextControls()
    if (closeOverlays) {
      this.closeInspector()
      this.closeOutputLibrary()
      if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    }
  }

  private reuseCurrentParameters(): void {
    const details = this.state.currentImage?.details
    if (!details) return
    if (this.requestCurrentOutputMetadata("reuse")) return
    this.applyGenerationDetails(details)
    const parameters = details.parameters || {}
    this.setRunStatus(`Reused prompts, locked seed ${parameters.seed ?? "as recorded"}, presets, render settings, and LoRA stack.`)
  }

  private deleteCurrentOutput(): void {
    const image = this.state.currentImage
    if (!image?.id) return
    if (!window.confirm(`Delete “${image.label}” from Lumiverse? This cannot be undone.`)) return
    this.send("delete_output", { imageId: image.id })
    this.setRunStatus(`Deleting “${image.label}”…`)
  }

  private appendCurrentToChat(): void {
    const image = this.state.currentImage
    if (!image?.id || !this.state.activeChat?.id) return
    this.setRunStatus(`Appending “${image.label}” to the active Lumiverse chat…`)
    this.send("append_output_to_chat", { imageId: image.id, label: image.label })
  }

  private async useCurrentAsInit(): Promise<void> {
    const image = this.state.currentImage
    if (!image?.src) return
    if (this.requestCurrentOutputMetadata("init")) return
    this.setRunStatus("Preparing the selected output for img2img…")
    try {
      if (image.details) this.applyGenerationDetails(image.details, null, false)
      const response = await fetch(image.url || image.src, { credentials: "same-origin" })
      if (!response.ok) throw new Error(`Image request failed (${response.status}).`)
      await this.setInitFromBlob(await response.blob(), image.label, image.id || "")
      this.closeInspector()
      this.closeOutputLibrary()
      if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("generation")
      this.setRunStatus(`Init image ready · creativity ${this.get<HTMLInputElement>('[data-role="denoise"]').value}.`)
    } catch (error) {
      this.setRunStatus(`Could not prepare init image: ${error instanceof Error ? error.message : String(error)}`, true)
    }
  }

  private requestCurrentOutputMetadata(action: "reuse" | "init" | ""): boolean {
    const image = this.state.currentImage
    const details = image?.details
    if (!image?.id || !details?.swarmPathVerified || !details.swarmPath || !this.state.connection?.id) return false
    if (details.metadataSource) return false
    if (action) this.pendingMetadataAction = action
    if (!this.outputMetadataRequestId) {
      this.outputMetadataRequestId = this.send("resolve_output_metadata", {
        imageId: image.id,
        connectionId: this.state.connection.id,
      })
      this.setRunStatus("Reading the exact SwarmUI output metadata…")
    }
    return Boolean(action)
  }

  private async setInitFromBlob(blob: Blob, label: string, imageId: string): Promise<void> {
    if (!blob.type.startsWith("image/")) throw new Error("Choose an image file.")
    let prepared = blob
    try {
      const bitmap = await createImageBitmap(blob)
      const maxDimension = 1536
      const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      const compressed = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", .88)
      )
      if (compressed) prepared = compressed
    } catch {
      // Browsers without createImageBitmap can still pass through modest files.
    }
    if (prepared.size > 2_700_000) {
      throw new Error("The prepared init image is still too large; choose an image under roughly 3 MB.")
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(reader.error || new Error("Could not read image."))
      reader.readAsDataURL(prepared)
    })
    const comma = dataUrl.indexOf(",")
    if (comma < 0) throw new Error("Could not encode the init image.")
    this.state.initImage = {
      data: dataUrl.slice(comma + 1),
      mimeType: prepared.type || blob.type || "image/png",
      src: dataUrl,
      label,
      imageId,
    }
    this.renderInitImage()
  }

  private clearInitImage(): void {
    this.state.initImage = null
    this.renderInitImage()
    this.setRunStatus("Init image cleared; generation is text-to-image again.")
  }

  private renderInitImage(): void {
    const preview = this.get<HTMLElement>('[data-role="init-preview"]')
    const label = this.get<HTMLElement>('[data-role="init-label"]')
    const clear = this.get<HTMLButtonElement>('[data-action="clear-init"]')
    preview.replaceChildren()
    if (!this.state.initImage) {
      preview.textContent = "No init"
      label.textContent = "Text-to-image"
      clear.disabled = true
      return
    }
    const image = element("img")
    image.src = this.state.initImage.src
    image.alt = this.state.initImage.label
    preview.appendChild(image)
    label.textContent = this.state.initImage.label
    clear.disabled = false
  }

  private openOutputLibrary(): void {
    this.closeInspector()
    this.libraryFolderId = "__landing__"
    this.get<HTMLElement>('[data-role="output-library"]').hidden = false
    window.requestAnimationFrame(() => {
      this.root.querySelector<HTMLButtonElement>('[data-role="library-close"]')?.focus({ preventScroll: true })
    })
    this.get<HTMLElement>('[data-role="library-grid"]').replaceChildren(
      element("div", "ss-empty", "Loading Lumiverse outputs…"),
    )
    this.send("list_library_outputs")
  }

  private closeOutputLibrary(): void {
    this.get<HTMLElement>('[data-role="output-library"]').hidden = true
    this.librarySelection.clear()
    this.librarySelectionMode = false
    this.closeNewFolderModal()
    this.closeVisualProfile()
  }

  private openVisualProfile(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) return
    this.libraryVisualMode = "profile"
    this.libraryLookId = ""
    this.renderVisualProfile()
    const layer = this.get<HTMLElement>('[data-role="library-visual-profile"]')
    layer.hidden = false
    window.requestAnimationFrame(() => {
      layer.querySelector<HTMLButtonElement>('[data-action="close-visual-profile"]')?.focus({ preventScroll: true })
    })
  }

  private closeVisualProfile(): void {
    const layer = this.root.querySelector<HTMLElement>('[data-role="library-visual-profile"]')
    if (layer) layer.hidden = true
    this.libraryVisualMode = "profile"
    this.libraryLookId = ""
  }

  private openNewFolderModal(): void {
    const name = this.get<HTMLInputElement>('[data-role="new-folder-name"]')
    name.value = ""
    const unbound = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"][value="unbound"]')
    if (unbound) unbound.checked = true
    const chat = this.state.activeChat
    const characterId = String(chat?.character_id || "")
    this.get<HTMLElement>('[data-role="new-folder-chat-hint"]').textContent = chat?.id
      ? "Character folder will follow the active character across every conversation and inherit their current base tags."
      : "Open a character chat before choosing Character folder."
    const characterOption = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"][value="character"]')
    if (characterOption) characterOption.disabled = !chat?.id || !characterId
    this.get<HTMLElement>('[data-role="new-folder-modal"]').hidden = false
    window.setTimeout(() => name.focus(), 0)
  }

  private closeNewFolderModal(): void {
    const modal = this.root.querySelector<HTMLElement>('[data-role="new-folder-modal"]')
    if (modal) modal.hidden = true
  }

  private createOutputFolder(): void {
    const name = this.get<HTMLInputElement>('[data-role="new-folder-name"]').value.trim()
    const bindingType = this.root.querySelector<HTMLInputElement>('[data-role="new-folder-type"]:checked')?.value === "character"
      ? "character"
      : "unbound"
    if (!name && bindingType === "unbound") {
      this.setRunStatus("Give the unbound folder a name.", true)
      return
    }
    this.pendingCreatedFolder = { name, bindingType }
    this.send("create_output_folder", { name, bindingType })
    this.closeNewFolderModal()
    this.setRunStatus(bindingType === "character" ? "Creating character visual folder…" : `Creating folder “${name}”…`)
  }

  private toggleLibrarySearch(): void {
    this.librarySearchOpen = !this.librarySearchOpen
    const wrap = this.get<HTMLElement>('[data-role="library-search-wrap"]')
    wrap.hidden = !this.librarySearchOpen
    const input = this.get<HTMLInputElement>('[data-role="library-search"]')
    if (this.librarySearchOpen) window.setTimeout(() => input.focus(), 0)
    else if (input.value) {
      input.value = ""
      this.libraryPage = 0
      this.renderOutputLibrary()
    }
  }

  private toggleLibrarySelectionMode(): void {
    this.librarySelectionMode = !this.librarySelectionMode
    this.librarySelectionAnchorId = ""
    if (!this.librarySelectionMode) {
      this.librarySelection.clear()
      this.librarySelectOnlyNonStarred = false
    }
    this.renderOutputLibrary()
  }

  private activeVisualFolder(): OutputFolder | null {
    const characterId = String(this.state.activeChat?.character_id || "")
    if (!characterId) return null
    return this.state.outputFolders.find((folder) =>
      folder.binding?.type === "character" && folder.binding.characterId === characterId,
    ) || null
  }

  private hydrateActiveVisualStack(force = false): boolean {
    const folder = this.activeVisualFolder()
    const binding = folder?.binding
    if (!folder || !binding?.enabled || this.pendingDraftRestore) return false
    if (!force && this.hydratedVisualCharacterId === binding.characterId) {
      this.setStackPresetSelection(binding.stackPresetId)
      return false
    }

    let checkpointLoaded = !binding.checkpoint
    if (binding.checkpoint) {
      const modelSelect = this.get<HTMLSelectElement>('[data-role="model"]')
      const normalized = normalizeModelName(binding.checkpoint)
      const matchingOption = [...modelSelect.options].find((option) => {
        const candidate = normalizeModelName(option.value)
        return candidate === normalized || candidate.endsWith(normalized) || normalized.endsWith(candidate)
      })
      if (matchingOption) {
        modelSelect.value = matchingOption.value
        checkpointLoaded = true
        this.updateFamilyChip()
        this.renderLoras()
        this.renderStack()
      }
    }

    const preset = this.state.stackPresets.find((candidate) => candidate.id === binding.stackPresetId)
    const items = preset?.items?.length ? preset.items : binding.stackSnapshot || []
    if (items.length) {
      this.state.stack = items.map((item) => {
        const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
        return {
          lora,
          weight: clamp(Number(item.weight) || 1, -10, 10),
          enabled: item.enabled !== false,
          useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
        }
      })
      this.setStackPresetSelection(preset?.id || "")
      this.renderStack()
      this.renderLoras()
    }

    if (!checkpointLoaded) {
      if (this.state.models.length) {
        this.setRunStatus(`“${binding.checkpoint}” from ${folder.name} is not available on this SwarmUI connection.`, true)
      }
      return items.length
    }

    this.hydratedVisualCharacterId = binding.characterId
    const loadedParts = [
      binding.checkpoint ? `checkpoint “${binding.checkpoint}”` : "",
      preset ? `stack “${preset.name}”` : items.length ? "Custom stack" : "",
    ].filter(Boolean)
    if (loadedParts.length) {
      this.setRunStatus(`Loaded ${loadedParts.join(" and ")} from ${folder.name} visuals.`)
    }
    return loadedParts.length > 0
  }

  private saveVisualProfile(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) return
    const selectedStackValue = this.get<HTMLSelectElement>('[data-role="visual-stack"]').value
    const selectedStackId = selectedStackValue === "__custom__" ? "" : selectedStackValue
    const selectedStack = this.state.stackPresets.find((preset) => preset.id === selectedStackId)
    const profile = {
      positivePrompt: this.get<HTMLTextAreaElement>('[data-role="visual-positive"]').value,
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="visual-negative"]').value,
      checkpoint: this.get<HTMLSelectElement>('[data-role="visual-checkpoint"]').value,
      stackPresetId: selectedStackId,
      stackSnapshot: selectedStack?.items || (selectedStackValue === "__custom__" ? folder.binding.stackSnapshot : []),
      enabled: this.get<HTMLInputElement>('[data-role="visual-enabled"]').checked,
    }
    folder.binding = { ...folder.binding, ...profile }
    this.send("update_output_folder_profile", { folderId: folder.id, profile })
    if (folder.binding.characterId === String(this.state.activeChat?.character_id || "")) {
      this.hydratedVisualCharacterId = ""
      this.hydrateActiveVisualStack(true)
    }
    this.updateActiveVisualPill()
    this.updateTriggerSummary()
    this.scheduleStudioProfileSync()
    this.closeVisualProfile()
    this.setRunStatus(`Saving visual binding for “${folder.name}”…`)
  }

  private activateLibraryLook(lookId: string): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding || !folder.binding.looks.some((look) => look.id === lookId)) return
    folder.binding = { ...folder.binding, activeLookId: lookId }
    this.send("select_character_look", { characterId: folder.binding.characterId, lookId })
    this.renderLibraryLookEditor()
    this.setRunStatus(`Activating ${folder.binding.looks.find((look) => look.id === lookId)?.name || "character look"}…`)
  }

  private showLibraryVisualProfile(): void {
    this.libraryVisualMode = "profile"
    this.libraryLookId = ""
    this.renderVisualProfile()
  }

  private openLibraryLook(lookId: string): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) return
    this.libraryVisualMode = "look"
    this.libraryLookId = folder.binding.looks.some((look) => look.id === lookId) ? lookId : ""
    this.renderLibraryLookEditor()
    window.requestAnimationFrame(() => this.get<HTMLInputElement>('[data-role="library-look-name"]').focus({ preventScroll: true }))
  }

  private currentLibraryLook(): CharacterVisualLook | null {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    return folder?.binding?.looks.find((look) => look.id === this.libraryLookId) || null
  }

  private renderLibraryLookEditor(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) return this.closeVisualProfile()
    const look = this.currentLibraryLook()
    this.libraryVisualMode = "look"
    this.get<HTMLElement>('[data-role="library-visual-profile-panel"]').hidden = true
    this.get<HTMLElement>('[data-role="library-profile-footer"]').hidden = true
    this.get<HTMLElement>('[data-role="library-look-editor"]').hidden = false
    this.get<HTMLElement>('[data-role="library-look-footer"]').hidden = false
    this.get<HTMLElement>('[data-role="visual-profile-title"]').textContent = look ? `Edit ${look.name}` : `Add a ${folder.name} look`
    this.get<HTMLElement>('[data-role="visual-profile-subtitle"]').textContent = "Outfit and continuity details layered onto the character identity"
    const set = (role: string, value: string) => {
      this.get<HTMLInputElement | HTMLTextAreaElement>(`[data-role="${role}"]`).value = value
    }
    set("library-look-name", look?.name || "")
    set("library-look-aliases", look?.aliases.join(", ") || "")
    set("library-look-outfit", look?.outfitPrompt || "")
    set("library-look-negative", look?.negativePrompt || "")
    set("library-look-triggers", look?.triggerWords.join(", ") || "")
    set("library-look-reference", look?.referenceImageUrl || "")
    set("library-look-thumbnail", look?.thumbnailUrl || "")
    set("library-look-notes", look?.notes || "")
    const checkpoint = this.get<HTMLSelectElement>('[data-role="library-look-checkpoint"]')
    checkpoint.replaceChildren()
    const inherited = element("option", "", "Inherit character checkpoint")
    inherited.value = ""
    checkpoint.appendChild(inherited)
    for (const model of this.state.models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    if (look?.checkpoint && ![...checkpoint.options].some((option) => option.value === look.checkpoint)) {
      const retained = element("option", "", `${look.checkpoint} · saved`)
      retained.value = look.checkpoint
      checkpoint.appendChild(retained)
    }
    checkpoint.value = look?.checkpoint || ""
    const stack = this.get<HTMLSelectElement>('[data-role="library-look-stack"]')
    stack.replaceChildren()
    const none = element("option", "", "No additional LoRAs")
    none.value = ""
    stack.appendChild(none)
    if (this.state.stack.length) {
      const current = element("option", "", `Current Studio stack · ${this.state.stack.length}`)
      current.value = "__studio__"
      stack.appendChild(current)
    }
    for (const preset of this.state.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = preset.id
      stack.appendChild(option)
    }
    stack.value = look?.stackPresetId || (look?.stackSnapshot.length ? "__studio__" : "")
    const remove = this.root.querySelector<HTMLButtonElement>('[data-action="library-delete-look"]')
    const activate = this.root.querySelector<HTMLButtonElement>('[data-action="library-set-active-look"]')
    if (remove) remove.disabled = !look || look.id === "default"
    if (activate) activate.disabled = !look || look.id === folder.binding.activeLookId
  }

  private libraryLookPayload(): CharacterVisualLook | null {
    const name = this.get<HTMLInputElement>('[data-role="library-look-name"]').value.trim()
    if (!name) {
      this.setRunStatus("Give this look a name.", true)
      return null
    }
    const existing = this.currentLibraryLook()
    const list = (value: string) => value.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean)
    const stackValue = this.get<HTMLSelectElement>('[data-role="library-look-stack"]').value
    return {
      id: existing?.id || "",
      name,
      aliases: list(this.get<HTMLInputElement>('[data-role="library-look-aliases"]').value),
      outfitPrompt: this.get<HTMLTextAreaElement>('[data-role="library-look-outfit"]').value,
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="library-look-negative"]').value,
      checkpoint: this.get<HTMLSelectElement>('[data-role="library-look-checkpoint"]').value,
      stackPresetId: stackValue === "__studio__" ? "" : stackValue,
      stackSnapshot: stackValue === "__studio__" ? this.stackExportItems() : [],
      referenceImageId: existing?.referenceImageId || "",
      referenceImageUrl: this.get<HTMLInputElement>('[data-role="library-look-reference"]').value.trim(),
      thumbnailImageId: existing?.thumbnailImageId || "",
      thumbnailUrl: this.get<HTMLInputElement>('[data-role="library-look-thumbnail"]').value.trim(),
      triggerWords: list(this.get<HTMLInputElement>('[data-role="library-look-triggers"]').value),
      notes: this.get<HTMLTextAreaElement>('[data-role="library-look-notes"]').value,
      updatedAt: Date.now(),
    }
  }

  private saveLibraryLook(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    const look = this.libraryLookPayload()
    if (!folder?.binding || !look) return
    this.send("save_character_look", { characterId: folder.binding.characterId, look, activate: true })
    this.setRunStatus(`Saving and activating “${look.name}”…`)
  }

  private deleteLibraryLook(): void {
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    const look = this.currentLibraryLook()
    if (!folder?.binding || !look || look.id === "default") return
    if (!window.confirm(`Delete the “${look.name}” look?`)) return
    this.send("delete_character_look", { characterId: folder.binding.characterId, lookId: look.id })
    this.libraryVisualMode = "profile"
    this.libraryLookId = ""
    this.setRunStatus(`Deleting “${look.name}”…`)
  }

  private toggleActiveVisualBinding(): void {
    const folder = this.activeVisualFolder()
    if (!folder?.binding) return
    const enabled = !folder.binding.enabled
    folder.binding = { ...folder.binding, enabled }
    this.send("update_output_folder_profile", {
      folderId: folder.id,
      profile: { ...folder.binding, enabled },
    })
    this.updateActiveVisualPill()
    this.updateTriggerSummary()
    this.scheduleStudioProfileSync()
    if (!this.get<HTMLElement>('[data-role="output-library"]').hidden) this.renderOutputLibrary()
    this.setRunStatus(`${folder.name} visuals ${enabled ? "enabled" : "disabled"}.`)
  }

  private updateActiveVisualPill(): void {
    const pill = this.root.querySelector<HTMLButtonElement>('[data-role="active-visual-pill"]')
    if (!pill) return
    const folder = this.activeVisualFolder()
    pill.hidden = !folder?.binding
    if (!folder?.binding) return
    pill.textContent = `Visuals: ${folder.name}`
    pill.dataset.enabled = String(folder.binding.enabled)
    pill.title = folder.binding.enabled
      ? `Using “${folder.name}” character visuals. Click to disable them for this character.`
      : `“${folder.name}” character visuals are disabled. Click to enable.`
  }

  private toggleActivePersonaVisual(): void {
    const visuals = this.state.chatVisuals
    const presetId = visuals?.personaBinding?.presetId || ""
    if (!visuals?.activePersona || !presetId) return
    const enabled = visuals.personaBinding.enabled === false
    visuals.personaBinding = { presetId, enabled }
    this.send("bind_persona_visual_preset", {
      binding: visuals.personaBinding,
      currentStack: this.stackExportItems(),
    })
    this.updateActivePersonaVisualPill()
    this.scheduleStudioProfileSync()
    this.setRunStatus(`${visuals.activePersona.name} persona visuals ${enabled ? "enabled" : "disabled"}.`)
  }

  private updateActivePersonaVisualPill(): void {
    const pill = this.root.querySelector<HTMLButtonElement>('[data-role="active-persona-visual-pill"]')
    if (!pill) return
    const visuals = this.state.chatVisuals
    const preset = visuals?.personaPresets?.find((candidate) =>
      candidate.id === visuals.personaBinding?.presetId,
    ) || null
    pill.hidden = !visuals?.activePersona || !preset
    if (!visuals?.activePersona || !preset) return
    pill.textContent = `Persona: ${visuals.activePersona.name}`
    pill.dataset.enabled = String(visuals.personaBinding.enabled !== false)
    pill.title = visuals.personaBinding.enabled !== false
      ? `Using persona visual profile “${preset.name}”. Click to disable it.`
      : `Persona visual profile “${preset.name}” is disabled. Click to enable.`
  }

  private renderVisualProfile(): void {
    const panel = this.get<HTMLElement>('[data-role="library-visual-profile"]')
    const folder = this.state.outputFolders.find((candidate) => candidate.id === this.libraryFolderId)
    if (!folder?.binding) {
      panel.hidden = true
      return
    }
    this.get<HTMLElement>('[data-role="library-visual-profile-panel"]').hidden = false
    this.get<HTMLElement>('[data-role="library-profile-footer"]').hidden = false
    this.get<HTMLElement>('[data-role="library-look-editor"]').hidden = true
    this.get<HTMLElement>('[data-role="library-look-footer"]').hidden = true
    this.get<HTMLElement>('[data-role="visual-profile-title"]').textContent = `${folder.name} visuals`
    this.get<HTMLElement>('[data-role="visual-profile-subtitle"]').textContent = "Base generation profile and named continuity looks"
    this.get<HTMLElement>('[data-role="visual-profile-state"]').textContent = folder.binding.enabled ? "Active" : "Disabled"
    this.get<HTMLInputElement>('[data-role="visual-enabled"]').checked = folder.binding.enabled
    this.get<HTMLTextAreaElement>('[data-role="visual-positive"]').value = folder.binding.positivePrompt
    this.get<HTMLTextAreaElement>('[data-role="visual-negative"]').value = folder.binding.negativePrompt
    const checkpoint = this.get<HTMLSelectElement>('[data-role="visual-checkpoint"]')
    checkpoint.replaceChildren()
    const current = element("option", "", "Use current Studio checkpoint")
    current.value = ""
    checkpoint.appendChild(current)
    if (folder.binding.checkpoint && !this.state.models.some((model) => model.id === folder.binding?.checkpoint)) {
      const retained = element("option", "", `${folder.binding.checkpoint} · saved`)
      retained.value = folder.binding.checkpoint
      checkpoint.appendChild(retained)
    }
    for (const model of this.state.models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    checkpoint.value = folder.binding.checkpoint || ""
    const stack = this.get<HTMLSelectElement>('[data-role="visual-stack"]')
    stack.replaceChildren()
    const none = element("option", "", "No bound stack")
    none.value = ""
    stack.appendChild(none)
    for (const preset of this.state.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = preset.id
      stack.appendChild(option)
    }
    if (folder.binding.stackSnapshot?.length && !folder.binding.stackPresetId) {
      const custom = element("option", "", `Custom snapshot · ${folder.binding.stackSnapshot.length}`)
      custom.value = "__custom__"
      stack.appendChild(custom)
    }
    stack.value = this.state.stackPresets.some((preset) => preset.id === folder.binding?.stackPresetId)
      ? folder.binding.stackPresetId
      : folder.binding.stackSnapshot?.length
        ? "__custom__"
      : ""
    const lookList = this.get<HTMLElement>('[data-role="library-look-list"]')
    lookList.replaceChildren()
    const looks = folder.binding.looks || []
    this.get<HTMLElement>('[data-role="library-look-count"]').textContent = `${looks.length} look${looks.length === 1 ? "" : "s"}`
    for (const look of looks) {
      const card = element("button", "ss-library-look-card")
      card.dataset.action = "library-edit-look"
      card.dataset.lookId = look.id
      card.dataset.active = String(look.id === folder.binding.activeLookId)
      card.type = "button"
      card.title = `Edit ${look.name}`
      const preview = element("span", "ss-library-look-preview")
      const thumbnail = look.thumbnailUrl || look.referenceImageUrl
      if (thumbnail) {
        const image = element("img")
        image.src = thumbnail
        image.alt = ""
        preview.appendChild(image)
      } else {
        preview.innerHTML = FOLDER_ICON
      }
      const copy = element("span", "ss-library-look-copy")
      copy.append(
        element("strong", "", look.name),
        element("span", "ss-muted ss-tiny", look.outfitPrompt || (look.id === "default" ? "Identity baseline" : "No outfit prompt yet")),
      )
      if (look.id === folder.binding.activeLookId) copy.appendChild(element("span", "ss-library-look-active", "Active"))
      card.append(preview, copy)
      lookList.appendChild(card)
    }
    if (this.libraryVisualMode === "look") this.renderLibraryLookEditor()
  }

  private deleteSelectedOutputFolder(): void {
    const folder = this.state.outputFolders.find((item) => item.id === this.libraryFolderId)
    if (folder?.id === FAVORITES_FOLDER_ID) {
      this.setRunStatus("Favorites is a built-in collection and cannot be deleted.", true)
      return
    }
    if (!folder || !window.confirm(`Delete folder “${folder.name}”? Its images stay in Lumiverse.`)) return
    this.send("delete_output_folder", { folderId: folder.id })
    this.libraryFolderId = "__landing__"
    this.libraryPage = 0
  }

  private changeLibraryPage(delta: number): void {
    const filtered = this.filteredLibraryOutputs()
    const pages = Math.max(1, Math.ceil(filtered.length / this.currentLibraryPageSize()))
    this.libraryPage = clamp(this.libraryPage + delta, 0, pages - 1)
    this.librarySelectionAnchorId = ""
    this.renderOutputLibrary()
  }

  private currentLibraryPageSize(): number {
    return outputLibraryPageSize(window.innerWidth)
  }

  private libraryPageOutputs(): any[] {
    const filtered = this.filteredLibraryOutputs()
    const pageSize = this.currentLibraryPageSize()
    return filtered.slice(
      this.libraryPage * pageSize,
      (this.libraryPage + 1) * pageSize,
    )
  }

  private librarySelectablePageOutputs(): any[] {
    const outputs = this.libraryPageOutputs()
    return this.librarySelectOnlyNonStarred
      ? outputs.filter((output) => !this.isOutputFavorite(String(output.id)))
      : outputs
  }

  private toggleLibraryPageSelection(): void {
    const ids = this.librarySelectablePageOutputs().map((output) => String(output.id))
    const allSelected = ids.length > 0 && ids.every((id) => this.librarySelection.has(id))
    for (const id of ids) {
      if (allSelected) this.librarySelection.delete(id)
      else this.librarySelection.add(id)
    }
    this.librarySelectionAnchorId = ids.at(-1) || ""
    this.syncVisibleLibrarySelection()
  }

  private setLibrarySelection(imageId: string, selected: boolean, extendRange: boolean): void {
    const pageIds = this.libraryPageOutputs().map((output) => String(output.id))
    const anchorIndex = pageIds.indexOf(this.librarySelectionAnchorId)
    const currentIndex = pageIds.indexOf(imageId)
    if (extendRange && anchorIndex >= 0 && currentIndex >= 0) {
      const start = Math.min(anchorIndex, currentIndex)
      const end = Math.max(anchorIndex, currentIndex)
      for (const id of pageIds.slice(start, end + 1)) {
        if (selected) this.librarySelection.add(id)
        else this.librarySelection.delete(id)
      }
    } else if (selected) {
      this.librarySelection.add(imageId)
    } else {
      this.librarySelection.delete(imageId)
    }
    this.librarySelectionAnchorId = imageId
  }

  private updateLibrarySelectionControls(): void {
    const selected = this.librarySelection.size
    const library = this.get<HTMLElement>('[data-role="output-library"]')
    library.dataset.selectionMode = String(this.librarySelectionMode)
    this.get<HTMLElement>('[data-role="library-selectbar"]').hidden = !this.librarySelectionMode
    this.get<HTMLElement>('[data-role="library-selection-count"]').textContent =
      this.librarySelectionMode ? `${selected} selected` : "Select"
    const pageIds = this.librarySelectablePageOutputs().map((output) => String(output.id))
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => this.librarySelection.has(id))
    const selectPage = this.get<HTMLButtonElement>('[data-role="library-select-page"]')
    selectPage.hidden = !this.librarySelectionMode
    selectPage.disabled = pageIds.length === 0
    selectPage.textContent = allPageSelected
      ? (this.librarySelectOnlyNonStarred ? "Clear non-starred" : "Clear page")
      : (this.librarySelectOnlyNonStarred ? "Select non-starred" : "Select page")
    const nonStarred = this.get<HTMLElement>('[data-role="library-nonstarred"]')
    nonStarred.hidden = !this.librarySelectionMode
    this.get<HTMLInputElement>('[data-role="library-select-nonstarred"]').checked = this.librarySelectOnlyNonStarred
    const favoriteButton = this.get<HTMLButtonElement>('[data-action="bulk-favorite-outputs"]')
    const selectedIds = [...this.librarySelection]
    const allFavorite = selectedIds.length > 0 && selectedIds.every((id) => this.isOutputFavorite(id))
    favoriteButton.dataset.active = String(allFavorite)
    favoriteButton.innerHTML = `${STAR_ICON}<span>${allFavorite ? "Unfavorite" : "Favorite"}</span>`
    this.get<HTMLElement>('[data-role="library-selection-actions"]').hidden = selected === 0
  }

  private syncVisibleLibrarySelection(): void {
    for (const check of this.root.querySelectorAll<HTMLInputElement>(
      '[data-role="library-output-check"]',
    )) {
      const imageId = check.dataset.imageId || ""
      const selected = this.librarySelection.has(imageId)
      check.checked = selected
      const card = check.closest<HTMLElement>(".ss-library-output")
      if (card) card.dataset.selected = String(selected)
    }
    this.updateLibrarySelectionControls()
  }

  private bulkMoveOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    this.openMoveFolderModal(imageIds)
  }

  private bulkFavoriteOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    const favorite = !imageIds.every((id) => this.isOutputFavorite(id))
    this.send("bulk_set_output_favorite", { imageIds, favorite })
    this.setRunStatus(
      `${favorite ? "Favoriting" : "Removing from Favorites"} ${imageIds.length} output${imageIds.length === 1 ? "" : "s"}…`,
    )
  }

  private openMoveFolderModal(imageIds: string[]): void {
    this.pendingMoveImageIds = [...new Set(imageIds.map(String).filter(Boolean))]
    if (!this.pendingMoveImageIds.length) return
    this.get<HTMLElement>('[data-role="move-folder-description"]').textContent =
      `Move ${this.pendingMoveImageIds.length} output${this.pendingMoveImageIds.length === 1 ? "" : "s"} to:`
    const list = this.get<HTMLElement>('[data-role="move-folder-list"]')
    list.replaceChildren()
    const addChoice = (folderId: string, label: string, count = "") => {
      const button = element("button", "ss-button ss-move-folder-choice")
      button.dataset.action = "move-folder-choice"
      button.dataset.folderId = folderId
      button.append(element("span", "", label), element("span", "ss-muted ss-tiny", count))
      list.appendChild(button)
    }
    addChoice("", "Unfiled")
    for (const folder of this.state.outputFolders) addChoice(folder.id, folder.name, `${folder.imageIds.length} images`)
    this.get<HTMLElement>('[data-role="move-folder-modal"]').hidden = false
  }

  private closeMoveFolderModal(): void {
    this.get<HTMLElement>('[data-role="move-folder-modal"]').hidden = true
    this.pendingMoveImageIds = []
  }

  private confirmMoveFolder(folderId: string): void {
    const imageIds = [...this.pendingMoveImageIds]
    if (!imageIds.length) return
    this.send("bulk_move_outputs", { imageIds, folderId })
    this.closeMoveFolderModal()
    this.setRunStatus(`Moving ${imageIds.length} output${imageIds.length === 1 ? "" : "s"}…`)
  }

  private bulkDeleteOutputs(): void {
    const imageIds = [...this.librarySelection]
    if (!imageIds.length) return
    if (!window.confirm(`Delete ${imageIds.length} selected Lumiverse output${imageIds.length === 1 ? "" : "s"}? This cannot be undone.`)) return
    this.send("bulk_delete_outputs", { imageIds })
    this.setRunStatus(`Deleting ${imageIds.length} selected output${imageIds.length === 1 ? "" : "s"}…`)
  }

  private filteredLibraryOutputs(): any[] {
    let outputs = this.state.libraryOutputs
    if (this.libraryFolderId) {
      const assigned = new Set(
        this.state.outputFolders
          .filter((folder) => folder.id !== FAVORITES_FOLDER_ID)
          .flatMap((folder) => folder.imageIds),
      )
      if (this.libraryFolderId === "__unfiled__") {
        outputs = outputs.filter((output) => !assigned.has(String(output.id)))
      } else {
        const folder = this.state.outputFolders.find((item) => item.id === this.libraryFolderId)
        const ids = new Set(folder?.imageIds || [])
        outputs = outputs.filter((output) => ids.has(String(output.id)))
      }
    }
    const query = this.root.querySelector<HTMLInputElement>('[data-role="library-search"]')?.value || ""
    if (!query.trim()) return outputs
    return outputs.filter((output) => {
      const details = output?.studioMetadata || {}
      const parameters = details?.parameters || {}
      return matchesKeywordQuery(query, [
        output?.original_filename,
        output?.id,
        details?.prompt,
        details?.negativePrompt,
        details?.model,
        details?.presets,
        details?.loras?.flatMap((lora: any) => [lora?.name, lora?.title, lora?.weight]),
        details?.initImageLabel,
        details?.swarmPath,
        parameters?.seed,
        parameters?.sampler,
        parameters?.scheduler,
        parameters?.width,
        parameters?.height,
        parameters?.steps,
        parameters?.cfg,
      ])
    })
  }

  private renderLibraryFolderLanding(): void {
    const grid = this.get<HTMLElement>('[data-role="library-folder-grid"]')
    grid.replaceChildren()
    const query = this.get<HTMLInputElement>('[data-role="library-folder-search"]').value.trim().toLowerCase()
    const create = element("button", "ss-library-new-folder-card")
    create.type = "button"
    create.dataset.action = "create-output-folder"
    create.title = "Create output folder"
    create.setAttribute("aria-label", "Create output folder")
    const createPreview = element("span", "ss-library-new-folder-icon")
    createPreview.innerHTML = NEW_FOLDER_ICON
    create.append(
      createPreview,
      element("strong", "", "New folder"),
      element("span", "ss-muted", "Create a virtual folder to organize your outputs"),
    )
    grid.appendChild(create)
    let matchCount = 0
    const appendFolder = (id: string, name: string, outputs: any[], badge = "") => {
      if (query && !`${name} ${badge}`.toLowerCase().includes(query)) return
      matchCount += 1
      const button = element("button", "ss-library-folder-card")
      button.type = "button"
      button.dataset.action = "library-folder"
      button.dataset.folderId = id
      const preview = element("span", "ss-library-folder-preview")
      const previewOutputs = id === "" ? outputs.slice(0, 4) : outputs.slice(0, 1)
      preview.dataset.collage = String(previewOutputs.length > 1)
      for (const output of previewOutputs) {
        if (!output?.url) continue
        const image = element("img")
        image.src = output.url
        image.alt = ""
        preview.appendChild(image)
      }
      if (!preview.childElementCount) preview.innerHTML = FOLDER_ICON
      if (badge) preview.appendChild(element("span", "ss-library-folder-badge", badge))
      const copy = element("span", "ss-library-folder-copy")
      copy.append(
        element("strong", "", name),
        element("span", "ss-muted", `${outputs.length} image${outputs.length === 1 ? "" : "s"}`),
      )
      button.append(preview, copy)
      grid.appendChild(button)
    }
    appendFolder("", "All outputs", this.state.libraryOutputs, "All")
    const assigned = new Set(
      this.state.outputFolders
        .filter((folder) => folder.id !== FAVORITES_FOLDER_ID)
        .flatMap((folder) => folder.imageIds),
    )
    appendFolder("__unfiled__", "Unfiled", this.state.libraryOutputs.filter((output) => !assigned.has(String(output.id))), "Unfiled")
    for (const folder of this.state.outputFolders) {
      const outputs = folder.imageIds.flatMap((id) => {
        const output = this.state.libraryOutputs.find((candidate) => String(candidate.id) === id)
        return output ? [output] : []
      })
      const badge = folder.id === FAVORITES_FOLDER_ID ? "★ Favorites" : folder.binding ? "Character visuals" : ""
      appendFolder(folder.id, folder.name, outputs, badge)
    }
    if (query && matchCount === 0) grid.appendChild(element("div", "ss-empty ss-library-folder-empty", `No folders match “${query}”.`))
  }

  private renderOutputLibrary(): void {
    const landing = this.libraryFolderId === "__landing__"
    const library = this.get<HTMLElement>('[data-role="output-library"]')
    const landingSurface = this.get<HTMLElement>('[data-role="library-folders"]')
    const folderSurface = this.get<HTMLElement>('[data-role="library-folder-view"]')
    setOutputLibraryView(library, landingSurface, folderSurface, landing ? "folders" : "folder")
    if (landing) {
      this.closeVisualProfile()
      this.renderLibraryFolderLanding()
      return
    }
    this.renderVisualProfile()
    library.dataset.selectionMode = String(this.librarySelectionMode)

    const filtered = this.filteredLibraryOutputs()
    const pages = Math.max(1, Math.ceil(filtered.length / this.currentLibraryPageSize()))
    this.libraryPage = clamp(this.libraryPage, 0, pages - 1)
    const selectedFolder = this.state.outputFolders.find((folder) => folder.id === this.libraryFolderId)
    const title = selectedFolder?.name || (this.libraryFolderId === "__unfiled__" ? "Unfiled" : "All outputs")
    const visualButton = this.get<HTMLButtonElement>('[data-role="library-visual-button"]')
    visualButton.hidden = !selectedFolder?.binding
    const deleteButton = this.get<HTMLButtonElement>('[data-role="library-delete-folder"]')
    deleteButton.hidden = !selectedFolder || selectedFolder.id === FAVORITES_FOLDER_ID
    deleteButton.title = selectedFolder ? `Delete ${selectedFolder.name}` : "Delete folder"
    deleteButton.setAttribute("aria-label", deleteButton.title)
    this.get<HTMLElement>('[data-role="library-title"]').textContent = title
    this.get<HTMLElement>('[data-role="library-breadcrumb-title"]').textContent = title
    this.get<HTMLElement>('[data-role="library-count"]').textContent = `${filtered.length} image${filtered.length === 1 ? "" : "s"}`
    const kind = this.get<HTMLElement>('[data-role="library-folder-kind"]')
    kind.hidden = !selectedFolder?.binding && selectedFolder?.id !== FAVORITES_FOLDER_ID
    kind.textContent = selectedFolder?.id === FAVORITES_FOLDER_ID ? "★ Favorites" : "Character visuals"
    const cover = this.get<HTMLElement>('[data-role="library-folder-cover"]')
    cover.replaceChildren()
    const coverOutput = selectedFolder
      ? selectedFolder.imageIds.map((id) => this.state.libraryOutputs.find((output) => String(output.id) === id)).find(Boolean)
      : filtered[0]
    if (coverOutput?.url) {
      const image = element("img")
      image.src = coverOutput.url
      image.alt = ""
      cover.appendChild(image)
    } else {
      cover.innerHTML = FOLDER_ICON
    }
    this.get<HTMLElement>('[data-role="library-page"]').textContent = `${this.libraryPage + 1} / ${pages}`
    this.get<HTMLButtonElement>('[data-action="library-prev"]').disabled = this.libraryPage <= 0
    this.get<HTMLButtonElement>('[data-action="library-next"]').disabled = this.libraryPage >= pages - 1
    const grid = this.get<HTMLElement>('[data-role="library-grid"]')
    grid.replaceChildren()
    const page = this.libraryPageOutputs()
    if (!page.length) {
      const query = this.get<HTMLInputElement>('[data-role="library-search"]').value.trim()
      grid.appendChild(element("div", "ss-empty", query ? "No outputs match those keywords." : "No outputs in this folder yet."))
      this.updateLibrarySelectionControls()
      return
    }
    for (const output of page) {
      const card = element("article", "ss-library-output")
      const imageId = String(output.id)
      const selected = this.librarySelection.has(imageId)
      card.dataset.selected = String(selected)
      const checkLabel = element("label", "ss-library-output-check")
      const check = element("input")
      check.type = "checkbox"
      check.checked = selected
      check.dataset.role = "library-output-check"
      check.dataset.imageId = imageId
      check.setAttribute("aria-label", `Select ${output.original_filename || `output ${imageId}`}`)
      checkLabel.appendChild(check)
      const open = element("button", "ss-library-output-button")
      const image = element("img")
      image.src = output.url
      image.alt = output.original_filename || "Generated output"
      open.appendChild(image)
      open.addEventListener("click", (event) => {
        if (this.librarySelectionMode) {
          this.setLibrarySelection(imageId, !this.librarySelection.has(imageId), event.shiftKey)
          this.syncVisibleLibrarySelection()
          return
        }
        this.setCurrentImage(this.outputToCurrentImage(output))
        this.openInspector()
      })
      card.append(checkLabel, open)
      if (this.isOutputFavorite(imageId)) {
        const favorite = element("span", "ss-library-output-star")
        favorite.title = "Favorite"
        favorite.setAttribute("aria-label", "Favorite")
        favorite.innerHTML = STAR_ICON
        card.appendChild(favorite)
      }
      grid.appendChild(card)
    }
    this.updateLibrarySelectionControls()
  }

  private inheritedTriggers(): string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const item of this.effectiveStack()) {
      const trigger = item.lora.triggerPhrase.trim()
      const key = trigger.toLowerCase()
      if (item.enabled && item.useTrigger && trigger && !seen.has(key)) {
        seen.add(key)
        result.push(trigger)
      }
    }
    return result
  }

  private effectiveStack(): StackItem[] {
    const folder = this.activeVisualFolder()
    const preset = folder?.binding?.enabled && folder.binding.stackPresetId
      ? this.state.stackPresets.find((candidate) => candidate.id === folder.binding?.stackPresetId)
      : null
    const merged = new Map<string, StackItem>()
    const boundItems = preset?.items?.length
      ? preset.items
      : folder?.binding?.enabled
        ? folder.binding.stackSnapshot || []
        : []
    for (const item of boundItems) {
      const lora = this.installedLora(item.name) || manualLora(item.name, item.title, item.sourceUrl)
      merged.set(normalizeModelName(item.name), {
        lora,
        weight: clamp(Number(item.weight) || 1, -10, 10),
        enabled: item.enabled !== false,
        useTrigger: Boolean(item.useTrigger && lora.triggerPhrase),
      })
    }
    for (const item of this.state.stack) merged.set(normalizeModelName(item.lora.name), item)
    return [...merged.values()]
  }

  private updateTriggerSummary(): void {
    const triggers = this.inheritedTriggers()
    this.get<HTMLElement>('[data-role="trigger-summary"]').textContent = triggers.length
      ? `${triggers.length} inherited: ${triggers.join(", ")}`
      : "No inherited trigger phrases."
  }

  private finalPrompt(): string {
    const prompt = this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim()
    const folder = this.activeVisualFolder()
    const visual = folder?.binding?.enabled ? folder.binding.positivePrompt.trim() : ""
    const chatVisuals = this.state.chatVisuals
    const personaPreset = chatVisuals?.personaBinding?.enabled !== false
      ? chatVisuals?.personaPresets?.find((candidate) => candidate.id === chatVisuals.personaBinding.presetId)
      : null
    const personaVisual = personaPreset?.positivePrompt.trim() || ""
    let layeredPrompt = prompt
    for (const layer of [visual, personaVisual]) {
      if (layer && !layeredPrompt.toLowerCase().includes(layer.toLowerCase())) {
        layeredPrompt = [layer, layeredPrompt].filter(Boolean).join(", ")
      }
    }
    const triggers = this.inheritedTriggers().filter((trigger) => !layeredPrompt.toLowerCase().includes(trigger.toLowerCase()))
    const composed = [triggers.join(", "), layeredPrompt].filter(Boolean).join(", ")
    const presets = this.state.selectedPresets
      .filter((preset) => preset.enabled)
      .map((preset) => preset.title)
    return applySwarmPresetTokens(composed, presets)
  }

  private finalNegativePrompt(): string {
    const prompt = this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim()
    const folder = this.activeVisualFolder()
    const visual = folder?.binding?.enabled ? folder.binding.negativePrompt.trim() : ""
    if (!visual || prompt.toLowerCase().includes(visual.toLowerCase())) return prompt
    return [visual, prompt].filter(Boolean).join(", ")
  }

  private buildRawOverride(): string | undefined {
    const raw = this.get<HTMLTextAreaElement>('[data-role="raw-override"]').value.trim()
    let parsed: Record<string, unknown> = {}
    if (raw) {
      const value = JSON.parse(raw)
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Raw request override must be a JSON object.")
      }
      parsed = value as Record<string, unknown>
    }
    Object.assign(parsed, this.workflowRawOverrides())
    for (const key of Object.keys(parsed)) {
      if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === "presets") delete parsed[key]
    }
    return Object.keys(parsed).length ? JSON.stringify(parsed) : undefined
  }

  private collectGenerationParameters(
    rawRequestOverride: string | undefined,
    enabled = this.effectiveStack().filter((item) => item.enabled),
  ): Record<string, unknown> {
    const optional = (role: string): string =>
      this.get<HTMLInputElement | HTMLSelectElement>(`[data-role="${role}"]`).value.trim()
    const parameters: Record<string, unknown> = {
      width: clamp(numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024), 64, 4096),
      height: clamp(numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024), 64, 4096),
      steps: clamp(numberValue(this.get<HTMLInputElement>('[data-role="steps"]'), 20), 1, 150),
      cfgScale: clamp(numberValue(this.get<HTMLInputElement>('[data-role="cfg"]'), 7), 1, 30),
      seed: Math.trunc(numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1)),
      sampler: optional("sampler") || undefined,
      scheduler: optional("scheduler") || undefined,
      vae: optional("vae") || undefined,
      unet: optional("unet") || undefined,
      clipLModel: optional("clip-l") || undefined,
      clipGModel: optional("clip-g") || undefined,
      t5XXLModel: optional("t5") || undefined,
      loras: enabled.map((item) => item.lora.name),
      loraWeights: enabled.map((item) => item.weight),
      rawRequestOverride,
    }
    if (this.state.initImage) {
      parameters.referenceImages = [{
        data: this.state.initImage.data,
        mimeType: this.state.initImage.mimeType,
      }]
      parameters.denoise = clamp(
        numberValue(this.get<HTMLInputElement>('[data-role="denoise"]'), .6),
        0,
        1,
      )
    }
    return parameters
  }

  private baseStudioProfileParameters(rawRequestOverride: string | undefined): Record<string, unknown> {
    const parameters = this.collectGenerationParameters(
      rawRequestOverride,
      this.state.stack.filter((item) => item.enabled),
    )
    delete parameters.referenceImages
    delete parameters.resolvedSourceImages
    delete parameters.resolvedReferenceImages
    delete parameters.denoise
    return parameters
  }

  private generate(): void {
    if (this.generating || !this.state.connection) return
    const selectedWorkflowName = this.get<HTMLSelectElement>('[data-role="workflow-select"]').value
    if (selectedWorkflowName && this.state.selectedWorkflow?.name !== selectedWorkflowName) {
      this.setRunStatus("Wait for the selected workflow controls to finish loading.", true)
      return
    }
    const prompt = this.finalPrompt()
    if (!prompt) {
      this.setRunStatus("Enter a prompt or enable a LoRA trigger phrase.", true)
      return
    }

    let rawRequestOverride: string | undefined
    try {
      rawRequestOverride = this.buildRawOverride()
    } catch (error) {
      this.setRunStatus(error instanceof Error ? error.message : String(error), true)
      return
    }

    const enabled = this.effectiveStack().filter((item) => item.enabled)
    const parameters = this.collectGenerationParameters(rawRequestOverride, enabled)

    const model = this.get<HTMLSelectElement>('[data-role="model"]').value || this.state.connection.model
    const clientJobId = createRequestId()
    const negativePrompt = this.finalNegativePrompt()
    const profileInput = {
      prompt: this.get<HTMLTextAreaElement>('[data-role="positive"]').value.trim(),
      negativePrompt: this.get<HTMLTextAreaElement>('[data-role="negative"]').value.trim(),
      connection_id: this.state.connection.id,
      model,
      parameters: this.baseStudioProfileParameters(rawRequestOverride),
    }
    const resolved = this.resolvedPrompts()
    this.pendingGeneration = {
      prompt,
      negativePrompt,
      resolvedPrompt: resolved.prompt,
      resolvedNegativePrompt: resolved.negativePrompt,
      model,
      parameters,
      loras: enabled.map((item) => ({ name: item.lora.name, weight: item.weight })),
      presets: resolved.presets,
      workflow: this.state.selectedWorkflow?.name || "",
      initImageId: this.state.initImage?.imageId || "",
      initImageLabel: this.state.initImage?.label || "",
      createdAt: Date.now(),
    }
    this.preGenerationImage = this.state.currentImage
    this.activity?.captureDraft(this.exportDraft())
    this.generating = true
    this.currentJobId = clientJobId
    this.currentJobConnectionId = this.state.connection.id
    this.currentJobSource = "manual"
    this.activity?.begin(
      clientJobId,
      this.state.connection.id,
      this.state.selectedWorkflow
        ? `Preparing workflow · ${this.state.selectedWorkflow.name}`
        : `Preparing ${model || "SwarmUI"}…`,
    )
    this.setGenerating(true)
    this.setRunStatus(this.state.selectedWorkflow
      ? `Running workflow “${this.state.selectedWorkflow.name}” with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`
      : `Generating with ${enabled.length} LoRA${enabled.length === 1 ? "" : "s"}…`)
    if (window.matchMedia("(max-width: 720px)").matches) this.setMobileTab("create")
    this.send("generate", {
      profileInput,
      input: {
        prompt,
        negativePrompt: negativePrompt || undefined,
        connection_id: this.state.connection.id,
        model,
        clientJobId,
        parameters,
      },
      recordHints: {
        resolvedPrompt: resolved.prompt,
        resolvedNegativePrompt: resolved.negativePrompt,
        presets: resolved.presets,
        workflow: this.state.selectedWorkflow?.name || "",
        initImageId: this.state.initImage?.imageId || "",
        initImageLabel: this.state.initImage?.label || "",
        stack: this.stackExportItems(),
      },
      showCompletionToast: this.behavior.completionToast,
    })
  }

  private updatePreviewAspect(width: number, height: number): void {
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      this.previewAspect = clamp(width / height, 0.1, 10)
    }
    this.get<HTMLElement>('[data-role="current-preview"]').style.setProperty(
      "--ss-preview-aspect",
      String(this.previewAspect),
    )
    requestAnimationFrame(() => this.fitPreviewToAspect())
  }

  private fitPreviewToAspect(): void {
    if (this.disposed) return
    const stage = this.root.querySelector<HTMLElement>('[data-role="output-stage"]')
    const preview = this.root.querySelector<HTMLElement>('[data-role="current-preview"]')
    if (!stage || !preview || stage.clientWidth <= 0) return
    const availableWidth = Math.max(120, stage.clientWidth - 18)
    let maximumHeight: number

    if (window.matchMedia("(max-width: 720px)").matches) {
      maximumHeight = Math.max(190, window.innerHeight * 0.52)
    } else {
      const head = stage.querySelector<HTMLElement>(".ss-output-stage-head")
      const meta = stage.querySelector<HTMLElement>(".ss-output-meta")
      maximumHeight = Math.max(
        150,
        stage.clientHeight - (head?.offsetHeight || 0) - (meta?.offsetHeight || 0) - 34,
      )
    }

    const fitted = fitAspectWithin(this.previewAspect, availableWidth, maximumHeight)
    preview.style.width = `${Math.round(fitted.width)}px`
    preview.style.height = `${Math.round(fitted.height)}px`
  }

  private setGenerating(value: boolean): void {
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(".ss-generate")) {
      button.disabled = !value && (!this.state.connection || !this.state.permissions.imageGen)
      button.dataset.action = value ? "interrupt-generation" : "generate"
      button.textContent = value ? "Interrupt generation" : "Generate image"
      button.classList.toggle("ss-button-danger", value)
      button.classList.toggle("ss-button-primary", !value)
      button.title = value ? "Stop the active SwarmUI generation" : "Generate image"
    }
    if (value) {
      this.progressStep = 0
      this.updatePreviewAspect(
        numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024),
        numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024),
      )
      this.updateGenerationProgress(0, 0)
    }
    this.get<HTMLElement>('[data-role="preview-loading"]').dataset.visible = String(value)
  }

  private updateGenerationProgress(step: number, totalSteps: number): void {
    const requestedSteps = Number(this.pendingGeneration?.parameters?.steps)
    const resolvedTotal = Number.isFinite(totalSteps) && totalSteps > 0
      ? totalSteps
      : Number.isFinite(requestedSteps) && requestedSteps > 0 ? requestedSteps : 0
    const hasTotal = resolvedTotal > 0
    const nextStep = Number.isFinite(step) ? Math.max(0, Number(step)) : 0
    if (this.generating && hasTotal) this.progressStep = Math.max(this.progressStep, Math.min(nextStep, resolvedTotal))
    else if (hasTotal) this.progressStep = Math.min(nextStep, resolvedTotal)
    const safeStep = hasTotal ? clamp(this.progressStep, 0, resolvedTotal) : 0
    const percentage = hasTotal ? clamp(Math.round((safeStep / resolvedTotal) * 100), 0, 100) : 0
    for (const progress of this.root.querySelectorAll<HTMLElement>('[data-role="generation-progress"]')) {
      progress.dataset.indeterminate = String(!hasTotal)
      progress.style.setProperty("--ss-progress", `${percentage}%`)
      const label = progress.querySelector<HTMLElement>('[data-role="progress-label"]')
      if (label) {
        label.textContent = hasTotal
          ? `${percentage}% · ${Math.round(safeStep)} / ${Math.round(resolvedTotal)}`
          : "Preparing generation…"
      }
    }
  }

  private interruptGeneration(): void {
    if (!this.generating || !this.currentJobId) return
    this.send("interrupt_generation", {
      clientJobId: this.currentJobId,
      connectionId: this.currentJobConnectionId || this.state.connection?.id || "",
    })
    this.setRunStatus("Interrupt requested — stopping SwarmUI…")
  }

  private showLivePreview(src: string, step: number, totalSteps: number): void {
    const label = totalSteps > 0
      ? `Live SwarmUI preview · ${step} / ${totalSteps}`
      : "Live SwarmUI preview"
    this.state.currentImage = {
      src,
      label,
      details: this.pendingGeneration,
    }
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.onload = () => {
      if (preview.naturalWidth && preview.naturalHeight) {
        this.updatePreviewAspect(preview.naturalWidth, preview.naturalHeight)
      }
    }
    preview.src = src
    preview.hidden = false
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.updateGenerationProgress(step, totalSteps)
    this.get<HTMLElement>('[data-role="output-label"]').textContent = label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
  }

  private renderOutputs(): void {
    const grid = this.get<HTMLElement>('[data-role="history-grid"]')
    grid.replaceChildren()
    this.get<HTMLElement>('[data-role="output-count"]').textContent = String(this.state.outputTotal)
    const pages = Math.max(1, Math.ceil(this.state.outputTotal / this.state.outputLimit))
    const page = Math.min(pages, Math.floor(this.state.outputOffset / this.state.outputLimit) + 1)
    this.get<HTMLElement>('[data-role="history-page"]').textContent = `${page} / ${pages}`
    this.get<HTMLButtonElement>('[data-action="history-prev"]').disabled = this.state.outputOffset <= 0
    this.get<HTMLButtonElement>('[data-action="history-next"]').disabled =
      this.state.outputOffset + this.state.outputLimit >= this.state.outputTotal
    if (!this.state.outputs.length) {
      grid.appendChild(element("div", "ss-empty", "Outputs created in this chat will appear here."))
      return
    }
    for (const output of this.state.outputs) {
      const current = this.outputToCurrentImage(output)
      const card = element("div", "ss-history-card")
      const button = element("button", "ss-history-item")
      button.title = output.original_filename || "Generated image"
      const image = element("img")
      image.src = output.url
      image.alt = output.original_filename || "Generated image"
      button.appendChild(image)
      button.addEventListener("click", () => {
        this.closeHistoryMenus()
        this.setCurrentImage(current)
        this.openInspector()
      })
      const menuToggle = element("button", "ss-history-menu-toggle", "⋮")
      menuToggle.type = "button"
      menuToggle.setAttribute("aria-label", `Actions for ${current.label}`)
      menuToggle.setAttribute("aria-expanded", "false")
      const menu = element("div", "ss-history-menu")
      menu.hidden = true
      const menuAction = (
        label: string,
        className: string,
        handler: () => void,
        disabled = false,
      ) => {
        const action = element("button", `ss-button ${className}`, label)
        action.type = "button"
        action.disabled = disabled
        action.addEventListener("click", (event) => {
          event.stopPropagation()
          this.closeHistoryMenus()
          this.setCurrentImage(current)
          handler()
        })
        menu.appendChild(action)
      }
      menuAction("Reuse", "", () => this.reuseCurrentParameters(), !current.details)
      menuAction("Use as init", "", () => void this.useCurrentAsInit(), !current.src)
      menuAction(
        "Append to chat",
        "",
        () => this.appendCurrentToChat(),
        !current.id || !this.state.activeChat?.id || !this.state.permissions.chatMutation,
      )
      menuAction("Delete", "ss-button-danger", () => this.deleteCurrentOutput(), !current.id)
      menuToggle.addEventListener("click", (event) => {
        event.stopPropagation()
        const shouldOpen = menu.hidden
        this.closeHistoryMenus()
        menu.hidden = !shouldOpen
        menuToggle.setAttribute("aria-expanded", String(shouldOpen))
      })
      card.append(button, menuToggle, menu)
      grid.appendChild(card)
    }
  }

  private closeHistoryMenus(): void {
    for (const menu of this.root.querySelectorAll<HTMLElement>(".ss-history-menu")) menu.hidden = true
    for (const toggle of this.root.querySelectorAll<HTMLElement>(".ss-history-menu-toggle")) {
      toggle.setAttribute("aria-expanded", "false")
    }
  }

  private refreshOutputs(offset = this.state.outputOffset): void {
    this.send("refresh_outputs", {
      offset,
      limit: this.state.outputLimit,
    })
  }

  private changeHistoryPage(delta: number): void {
    const next = Math.max(0, this.state.outputOffset + delta * this.state.outputLimit)
    if (next >= this.state.outputTotal && delta > 0) return
    this.refreshOutputs(next)
  }

  private outputToCurrentImage(output: any): CurrentImage {
    const fullUrl = typeof output.url === "string" ? output.url.replace(/\?.*$/, "") : output.url
    return {
      id: String(output.id || ""),
      src: output.url,
      url: fullUrl || output.url,
      label: output.original_filename || `Output ${output.id}`,
      details: output.studioMetadata || null,
    }
  }

  private favoritesFolder(): OutputFolder | null {
    return this.state.outputFolders.find((folder) => folder.id === FAVORITES_FOLDER_ID) || null
  }

  private isOutputFavorite(imageId: string): boolean {
    return Boolean(imageId && this.favoritesFolder()?.imageIds.includes(imageId))
  }

  private syncFavoriteControls(): void {
    const imageId = String(this.state.currentImage?.id || "")
    const active = this.isOutputFavorite(imageId)
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="toggle-current-favorite"]')) {
      button.disabled = !imageId
      button.dataset.active = String(active)
      button.setAttribute("aria-pressed", String(active))
      button.title = imageId
        ? (active ? "Remove from Favorites" : "Add to Favorites")
        : "Select a saved output to favorite it"
      button.setAttribute("aria-label", button.title)
    }
  }

  private toggleCurrentFavorite(): void {
    const imageId = String(this.state.currentImage?.id || "")
    if (!imageId) return
    const favorite = !this.isOutputFavorite(imageId)
    this.send("set_output_favorite", { imageId, favorite })
    this.setRunStatus(favorite ? "Adding output to Favorites…" : "Removing output from Favorites…")
  }

  private setCurrentImage(image: CurrentImage): void {
    this.state.currentImage = image
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    const width = Number(image.details?.parameters?.width)
    const height = Number(image.details?.parameters?.height)
    if (width > 0 && height > 0) this.updatePreviewAspect(width, height)
    preview.onload = () => {
      if (preview.naturalWidth && preview.naturalHeight) {
        this.updatePreviewAspect(preview.naturalWidth, preview.naturalHeight)
      }
    }
    preview.src = image.src
    preview.hidden = false
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="use-current-init"]')) {
      button.disabled = false
    }
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = true
    this.get<HTMLElement>('[data-role="output-label"]').textContent = image.label
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = false
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = !image.url
    this.updateAppendControls()
    this.updateContextControls()
    this.syncFavoriteControls()
  }

  private clearCurrentImage(): void {
    this.state.currentImage = null
    const preview = this.get<HTMLImageElement>('[data-role="preview-image"]')
    preview.removeAttribute("src")
    preview.hidden = true
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="use-current-init"]')) {
      button.disabled = true
    }
    this.get<HTMLElement>('[data-role="preview-empty"]').hidden = false
    this.get<HTMLElement>('[data-role="output-label"]').textContent = "Nothing selected"
    this.get<HTMLButtonElement>('[data-action="download-output"]').disabled = true
    this.get<HTMLButtonElement>('[data-action="copy-output"]').disabled = true
    this.updateAppendControls()
    this.updateContextControls()
    this.syncFavoriteControls()
  }

  private updateAppendControls(): void {
    const enabled = Boolean(
      this.state.currentImage?.id
      && this.state.activeChat?.id
      && this.state.permissions.chatMutation,
    )
    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="append-to-chat"]')) {
      button.disabled = !enabled
      button.title = enabled
        ? "Insert this Lumiverse-owned output into the active chat"
        : "Requires an active chat, a saved output, and Chat Mutation permission"
    }
  }

  private downloadCurrent(): void {
    if (!this.state.currentImage) return
    const details = this.state.currentImage.details
    const swarmPath = details?.swarmPathVerified ? details.swarmPath : ""
    if (swarmPath && this.state.connection?.id) {
      this.send("download_swarm_output", {
        connectionId: this.state.connection.id,
        swarmPath,
      })
      this.setRunStatus("Fetching the original SwarmUI output…")
      return
    }
    const anchor = document.createElement("a")
    anchor.href = this.state.currentImage.url || this.state.currentImage.src
    anchor.download = `swarm-studio-${Date.now()}.png`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  private async copyCurrentUrl(): Promise<void> {
    const url = this.state.currentImage?.url
    if (!url) return
    try {
      const absolute = url.startsWith("data:") ? url : new URL(url, window.location.href).href
      await navigator.clipboard.writeText(absolute)
      this.setRunStatus("Output URL copied.")
    } catch {
      this.setRunStatus("The browser blocked clipboard access.", true)
    }
  }

  private changeOrientation(): void {
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    const target: "portrait" | "landscape" = width >= height ? "portrait" : "landscape"
    const aspect = this.get<HTMLSelectElement>('[data-role="aspect"]')
    const reciprocal: Record<string, string> = {
      "2:3": "3:2",
      "3:2": "2:3",
      "3:4": "4:3",
      "4:3": "3:4",
      "4:5": "5:4",
      "5:4": "4:5",
      "9:16": "16:9",
      "16:9": "9:16",
    }
    if (aspect.value === "1:1") {
      aspect.value = target === "portrait" ? "2:3" : "3:2"
      this.applyAspectSelection()
      return
    }
    const swappedPreset = reciprocal[aspect.value]
    if (swappedPreset) {
      aspect.value = swappedPreset
      this.applyAspectSelection()
      return
    }
    if (
      (target === "portrait" && width >= height)
      || (target === "landscape" && height >= width)
    ) {
      this.setDimensions(height, width)
    }
  }

  private toggleSeedMode(): void {
    const seed = this.get<HTMLInputElement>('[data-role="seed"]')
    if (numberValue(seed, -1) === -1) {
      const recordedSeed = Number(this.state.currentImage?.details?.parameters?.seed)
      const fallback = crypto.getRandomValues(new Uint32Array(1))[0] & 0x7fffffff
      seed.value = String(Number.isFinite(recordedSeed) && recordedSeed >= 0 ? Math.trunc(recordedSeed) : fallback)
    } else {
      seed.value = "-1"
    }
    this.updateContextControls()
  }

  private useRandomSeed(): void {
    this.get<HTMLInputElement>('[data-role="seed"]').value = "-1"
    this.updateContextControls()
    this.setRunStatus("Random seed enabled for the next generation.")
  }

  private updateContextControls(): void {
    const orientationButton = this.root.querySelector<HTMLButtonElement>('[data-role="orientation-action"]')
    const seedButtons = this.root.querySelectorAll<HTMLButtonElement>('[data-role="seed-action"], [data-role="seed-action-mobile"]')
    if (!orientationButton || !seedButtons.length) return
    const width = numberValue(this.get<HTMLInputElement>('[data-role="width"]'), 1024)
    const height = numberValue(this.get<HTMLInputElement>('[data-role="height"]'), 1024)
    const makePortrait = width >= height
    orientationButton.innerHTML = `${makePortrait ? PORTRAIT_ICON : LANDSCAPE_ICON}<span>${makePortrait ? "Portrait" : "Landscape"}</span>`
    orientationButton.title = makePortrait
      ? "Flip the current aspect ratio to portrait"
      : "Flip the current aspect ratio to landscape"

    const random = numberValue(this.get<HTMLInputElement>('[data-role="seed"]'), -1) === -1
    for (const seedButton of seedButtons) {
      seedButton.innerHTML = `${random ? CURRENT_SEED_ICON : RANDOM_SEED_ICON}<span>${random ? "Current seed" : "Random seed"}</span>`
      seedButton.title = random
        ? "Lock to the current output's seed (or create a fixed seed if no output is selected)"
        : "Set seed to -1 for a random generation"
    }
  }

  private setConnectionStatus(status: "loading" | "ready" | "warning" | "error"): void {
    const colors = {
      loading: "#f59e0b",
      ready: "#4ade80",
      warning: "#e0a458",
      error: "#ef7777",
    }
    this.get<HTMLElement>(".ss-connection-wrap").style.setProperty("--ss-status-color", colors[status])
  }

  private setRunStatus(message: string, error = false): void {
    if (error && message) reportStudioError("Studio", message)
    for (const status of this.root.querySelectorAll<HTMLElement>(
      '[data-role="run-status"], [data-role="prompt-run-status"]',
    )) {
      status.textContent = message
      status.style.color = error ? "#ef7777" : ""
    }
  }
}
