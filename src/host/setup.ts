let activeStudio: StudioController | null = null
let activeModal: any | null = null

function setup(ctx: FrontendContext): () => void {
  const removeStyle = ctx.dom.addStyle(`${STYLES}\n${STUDIO_V3_STYLES}`)
  let currentTheme = storedStudioTheme()
  let appearance = storedStudioAppearance()
  let behavior = storedStudioBehavior()
  appearance.customCss = sanitizeCustomCss(appearance.customCss)
  if (studioAppearanceIsCustom(appearance)) currentTheme = "custom"
  let launcher: HTMLElement | null = null
  let miniplayer: MiniPlayerController | null = null
  let taggedImages: TaggedImageController | null = null
  let chatVisuals: ChatVisualsController | null = null
  let characterCanonHost: CharacterCanonHostController | null = null
  let removeCustomStyle: (() => void) | null = appearance.customCss
    ? ctx.dom.addStyle(appearance.customCss)
    : null

  const setThemeState = (theme: StudioTheme) => {
    currentTheme = theme
    persistStudioTheme(theme)
    if (launcher) launcher.dataset.theme = theme
    activeStudio?.setTheme(theme)
  }

  const updateAppearance = (next: StudioAppearance) => {
    appearance = cloneStudioAppearance(next)
    appearance.customCss = sanitizeCustomCss(appearance.customCss)
    setThemeState(studioAppearanceIsCustom(appearance) ? "custom" : "lumiverse")
    persistStudioAppearance(appearance)
    if (launcher) applyAppearanceVariables(launcher, appearance)
    miniplayer?.setAppearance(appearance)
    activeStudio?.setAppearance(appearance)
    removeCustomStyle?.()
    removeCustomStyle = appearance.customCss ? ctx.dom.addStyle(appearance.customCss) : null
  }

  const selectTheme = (theme: StudioTheme) => {
    if (theme === "lumiverse") appearance = defaultStudioAppearance()
    setThemeState(theme)
    updateAppearance(appearance)
  }

  const applyBehaviorState = (next: StudioBehavior) => {
    behavior = { ...next }
    persistStudioBehavior(behavior)
    if (typeof document !== "undefined") {
      document.documentElement.dataset.swarmStudioInlineScale = String(behavior.inlineImageScale)
    }
    miniplayer?.setBehavior(behavior)
    activeStudio?.setBehavior(behavior)
    taggedImages?.setBehavior(behavior)
  }

  const behaviorFromServer = (value: any): StudioBehavior => {
    const range = normalizeRequiredImageRange(value?.requiredImageMin, value?.requiredImageMax)
    return {
      ...behavior,
      completionToast: value?.completionToast === true,
      tagAutoGenerate: value?.autoGenerate === true,
      tagPromptInjection: value?.injectProtocol === true,
      protocolPrompt: typeof value?.protocolPrompt === "string" && value.protocolPrompt.trim()
        ? value.protocolPrompt
        : DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT,
      requestMode: value?.requestMode === "parser" ? "parser" : "inline",
      parserConnectionId: typeof value?.parserConnectionId === "string" ? value.parserConnectionId : "",
      parserModel: typeof value?.parserModel === "string" ? value.parserModel : "",
      stripUserOnlyLoraStack: value?.stripUserOnlyLoraStack === true,
      autoPrintCharacterPositive: value?.autoPrintCharacterPositive === true,
      requiredImageMin: range.min,
      requiredImageMax: range.max,
      tagPromptMode: value?.promptMode === "pov" ? "pov" : "multi",
      tagPromptFamily: value?.promptFamily === "illustrious" ? "illustrious" : "anima",
    }
  }

  const updateBehavior = (next: StudioBehavior) => {
    applyBehaviorState(next)
    ctx.sendToBackend({
      type: "set_tag_automation",
      requestId: createRequestId(),
      config: {
        autoGenerate: behavior.tagAutoGenerate,
        injectProtocol: behavior.tagPromptInjection,
        completionToast: behavior.completionToast,
        protocolPrompt: behavior.protocolPrompt,
        requestMode: behavior.requestMode,
        parserConnectionId: behavior.parserConnectionId,
        parserModel: behavior.parserModel,
        stripUserOnlyLoraStack: behavior.stripUserOnlyLoraStack,
        autoPrintCharacterPositive: behavior.autoPrintCharacterPositive,
        requiredImageMin: behavior.requiredImageMin,
        requiredImageMax: behavior.requiredImageMax,
        promptMode: behavior.tagPromptMode,
        promptFamily: behavior.tagPromptFamily,
      },
    })
  }

  const openStudio = (initialView: "studio" | "library" = "studio") => {
    if (activeModal) {
      if (initialView === "library") activeStudio?.openLibrary()
      return
    }
    miniplayer?.setStudioOpen(true)
    let modal: any
    try {
      modal = ctx.ui.showModal({
        title: "Swarm Studio",
        width: 1440,
        maxHeight: 980,
        persistent: false,
      })
    } catch (error) {
      miniplayer?.setStudioOpen(false)
      throw error
    }
    activeModal = modal
    activeStudio = new StudioController(
      ctx,
      modal,
      selectTheme,
      updateAppearance,
      behavior,
      updateBehavior,
      miniplayer,
    )
    activeStudio.setAppearance(appearance)
    activeStudio.setTheme(currentTheme)
    activeStudio.setBehavior(behavior)
    if (initialView === "library") activeStudio.openLibrary()
    modal.onDismiss(() => {
      miniplayer?.captureDraft(activeStudio?.exportDraft() || null)
      activeStudio?.dispose()
      activeStudio = null
      activeModal = null
      miniplayer?.setStudioOpen(false)
      chatVisuals?.refresh()
    })
  }

  const openStudioWithTaggedPrompt = (prompt: string, negativePrompt: string) => {
    openStudio("studio")
    if (prompt) activeStudio?.loadTaggedPrompt(prompt, negativePrompt)
  }

  // Register the core surface before optional host integrations. Older
  // Lumiverse builds may not expose message tag interception yet, but users
  // should still be able to open the Studio and use its generation tools.
  const drawer = ctx.ui.registerDrawerTab({
    id: "swarm-studio",
    title: "Swarm Studio",
    shortName: "Swarm",
    headerTitle: "Swarm Studio",
    description: "Open the metadata-aware SwarmUI prompt and LoRA studio",
    keywords: ["image", "generation", "lora", "swarmui", "prompt", "studio"],
    iconSvg: FRAME_WALL_ICON,
  })

  taggedImages = new TaggedImageController(
    ctx,
    behavior,
    openStudioWithTaggedPrompt,
    (prompt, negativePrompt, onConfirm) =>
      miniplayer?.openTaggedPromptEditor(prompt, negativePrompt, onConfirm) === true,
    () => openStudio("library"),
  )
  let unregisterTagInterceptor = () => {}
  let unregisterParserTagInterceptor = () => {}
  const registerTagInterceptor = ctx.messages?.registerTagInterceptor
  if (typeof registerTagInterceptor === "function") {
    try {
      unregisterTagInterceptor = registerTagInterceptor.call(
        ctx.messages,
        { tagName: "swarm-image", attrs: { request: "generate" }, removeFromMessage: true },
        (payload: any) => taggedImages?.handleTag(payload),
      )
      unregisterParserTagInterceptor = registerTagInterceptor.call(
        ctx.messages,
        { tagName: "swarm-image", attrs: { request: "parse" }, removeFromMessage: true },
        () => {},
      )
    } catch (error) {
      console.warn("[Swarm Studio] Inline image tag interception is unavailable in this Lumiverse build.", error)
    }
  } else {
    console.warn("[Swarm Studio] Inline image tags require a newer Lumiverse build; Studio UI remains available.")
  }

  if (typeof document !== "undefined") {
    try {
      const mobile = (document.documentElement.clientWidth || window.innerWidth) <= 720
      // Prefer Lumiverse's own float-widget layer. It naturally sits below
      // drawers/modals and survives app tab transitions. The direct overlay is
      // only a compatibility fallback for hosts without createFloatWidget.
      const widget = (typeof ctx.ui.createFloatWidget === "function"
        ? ctx.ui.createFloatWidget({
            width: mobile ? 64 : 318,
            height: mobile ? 64 : 94,
            snapToEdge: true,
            tooltip: "Swarm Studio miniplayer",
            chromeless: true,
          })
        : null) || createOverlayMiniplayerWidget()
      if (!widget) throw new Error("No supported miniplayer surface")
      miniplayer = new MiniPlayerController(
        ctx,
        widget,
        () => openStudio("studio"),
        () => openStudio("library"),
        () => activeStudio?.exportDraft() || null,
        behavior,
        updateBehavior,
      )
      miniplayer.setAppearance(appearance)
    } catch {
      miniplayer = null
    }
  }

  launcher = element("div", "ss-launcher")
  launcher.dataset.page = "home"
  launcher.dataset.theme = currentTheme
  applyAppearanceVariables(launcher, appearance)
  for (const corner of ["tl", "tr", "br", "bl"]) {
    const ornament = element("span", "ss-launcher-corner")
    ornament.dataset.corner = corner
    launcher.appendChild(ornament)
  }
  const launcherCenter = element("div", "ss-launcher-center")
  const emblem = element("div", "ss-launcher-emblem")
  emblem.innerHTML = FRAME_WALL_ICON
  const wordmark = element("div", "ss-launcher-wordmark")
  wordmark.appendChild(document.createTextNode("Swarm Studio"))
  const sparkle = element("span")
  sparkle.innerHTML = SPARKLE_ICON
  wordmark.appendChild(sparkle)
  const launcherActions = element("div", "ss-launcher-actions")
  const launchButton = element("button", "ss-button ss-button-primary", "Open Studio")
  launchButton.addEventListener("click", () => openStudio("studio"))
  const libraryButton = element("button", "ss-button")
  libraryButton.innerHTML = `<span class="ss-launcher-action-content">${LIBRARY_ICON}<span>Library</span></span>`
  libraryButton.addEventListener("click", () => openStudio("library"))
  const visualsButton = element("button", "ss-button ss-launcher-visuals-button")
  visualsButton.innerHTML = `${CHAT_VISUALS_ICON}<span>Visuals</span>`
  visualsButton.addEventListener("click", () => chatVisuals?.show())
  launcherActions.append(launchButton, libraryButton, visualsButton)
  launcherCenter.append(emblem, wordmark, launcherActions)
  launcher.appendChild(launcherCenter)
  chatVisuals = new ChatVisualsController(
    ctx,
    launcher,
    () => activeStudio?.exportDraft()?.stack || miniplayer?.snapshot()?.draft?.stack || null,
    () => openStudio("studio"),
    () => openStudio("library"),
  )
  characterCanonHost = new CharacterCanonHostController(ctx)
  drawer.root.appendChild(launcher)

  const inputAction =
    typeof ctx.ui.registerInputBarAction === "function"
      ? ctx.ui.registerInputBarAction({
          id: "open-swarm-studio",
          label: "Open Swarm Studio",
          iconSvg: FRAME_WALL_ICON,
          enabled: true,
        })
      : null
  const removeActionClick =
    typeof inputAction?.onClick === "function" ? inputAction.onClick(() => openStudio("studio")) : () => {}
  const unsubscribeMessages = ctx.onBackendMessage((payload: any) => {
    const backendError =
      payload?.error
      || payload?.data?.error
      || payload?.data?.metadataError
      || payload?.data?.workflowError
      || ((/error|failed/i.test(String(payload?.type || ""))) ? payload?.message : "")
    if (backendError) {
      reportStudioError(`Backend ${String(payload?.type || "message")}`, backendError, payload)
    }
    if (payload?.type === "bootstrap_result" && payload?.data?.tagAutomation) {
      applyBehaviorState(behaviorFromServer(payload.data.tagAutomation))
    }
    if (payload?.type === "tag_automation_result") {
      applyBehaviorState(behaviorFromServer(payload.data))
    }
    miniplayer?.onMessage(payload)
    activeStudio?.onMessage(payload)
    taggedImages?.onMessage(payload)
    chatVisuals?.onMessage(payload)
    characterCanonHost?.onMessage(payload)
  })
  ctx.sendToBackend({
    type: "list_tagged_jobs",
    requestId: createRequestId(),
  })
  const subscribeToImageEvent = (eventName: string, handler: (payload: any) => void): (() => void) => {
    if (typeof ctx.events?.on !== "function") return () => {}
    try {
      const unsubscribe = ctx.events.on(eventName, handler)
      return typeof unsubscribe === "function" ? unsubscribe : () => {}
    } catch (error) {
      console.warn(`[Swarm Studio] Host event ${eventName} is unavailable.`, error)
      return () => {}
    }
  }
  const unsubscribeProgress = subscribeToImageEvent("IMAGE_GEN_PROGRESS", (payload: any) => {
    miniplayer?.onImageGenerationEvent("progress", payload)
    activeStudio?.onImageGenerationEvent("progress", payload)
  })
  const unsubscribeComplete = subscribeToImageEvent("IMAGE_GEN_COMPLETE", (payload: any) => {
    miniplayer?.onImageGenerationEvent("complete", payload)
    activeStudio?.onImageGenerationEvent("complete", payload)
  })
  const unsubscribeError = subscribeToImageEvent("IMAGE_GEN_ERROR", (payload: any) => {
    reportStudioError(
      "Image generation event",
      payload?.error || payload?.message || "Image generation failed.",
      payload,
    )
    miniplayer?.onImageGenerationEvent("error", payload)
    activeStudio?.onImageGenerationEvent("error", payload)
  })
  miniplayer?.bootstrap()

  return () => {
    activeStudio?.dispose()
    activeModal?.dismiss()
    activeStudio = null
    activeModal = null
    unsubscribeMessages()
    unsubscribeProgress()
    unsubscribeComplete()
    unsubscribeError()
    removeActionClick()
    inputAction?.destroy()
    drawer.destroy()
    unregisterTagInterceptor()
    unregisterParserTagInterceptor()
    taggedImages?.destroy()
    taggedImages = null
    chatVisuals?.destroy()
    chatVisuals = null
    characterCanonHost?.destroy()
    characterCanonHost = null
    miniplayer?.destroy()
    miniplayer = null
    delete document.documentElement.dataset.swarmStudioInlineScale
    removeCustomStyle?.()
    removeStyle()
  }
}
