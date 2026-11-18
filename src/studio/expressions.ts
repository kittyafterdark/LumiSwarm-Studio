interface StudioExpressionImage { id: string; url: string }
type StudioExpressionProgress = (progress: { step: number; totalSteps: number; preview?: string }) => void

type StudioExpressionAction = "selected" | "all" | "failed" | "send" | StudioExpressionRow

interface StudioExpressionRow {
  label: string
  direction: string
  selected: boolean
  image: StudioExpressionImage | null
  drafts: Set<string>
  state?: "queued" | "working" | "failed"
}

const EXPRESSION_BG_MODEL = "birefnet.safetensors"
const EXPRESSION_BG_MODEL_URL = "https://huggingface.co/Comfy-Org/BiRefNet/resolve/main/background_removal/" + EXPRESSION_BG_MODEL

async function installExpressionBackgroundModel(directory: FileSystemDirectoryHandle, signal: AbortSignal): Promise<boolean> {
  const name = directory.name.toLowerCase()
  if (name !== "models" && name !== "background_removal") throw new Error("Choose ComfyUI’s models or background_removal folder.")
  const destination = name === "models" ? await directory.getDirectoryHandle("background_removal", { create: true }) : directory
  try {
    const existing = await (await destination.getFileHandle(EXPRESSION_BG_MODEL)).getFile()
    if (existing.size > 0) return false
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "NotFoundError")) throw error
  }
  const response = await fetch(EXPRESSION_BG_MODEL_URL, { signal })
  if (!response.ok || !response.body || /^text\/|application\/json/i.test(response.headers.get("content-type") || "")) {
    throw new Error("The BiRefNet download could not be opened.")
  }
  const file = await destination.getFileHandle(EXPRESSION_BG_MODEL, { create: true })
  await response.body.pipeTo(await file.createWritable(), { signal })
  return true
}

function openCharacterExpressions(
  root: HTMLElement,
  options: {
    folder: OutputFolder
    family: string
    model: string
    workflows: SwarmWorkflowSummary[]
    inheritedRecipe: GenerationRecipe
    samplers: string[]
    schedulers: string[]
    deleteDrafts: boolean
    pickImage: (kind: "reference" | "saved", initialId: string, choose: (image: StudioExpressionImage) => void) => void
    request: (type: string, fields: Record<string, unknown>, progress?: StudioExpressionProgress, signal?: AbortSignal) => Promise<any>
    refresh: () => void
  },
): HTMLDialogElement {
  const binding = options.folder.binding
  if (!binding) throw new Error("Choose a character folder.")
  const dialog = element("dialog", "ss-expression-dialog")
  const heading = element("h2", "", `${options.folder.name} · Expressions`)
  heading.id = "ss-expression-heading"
  dialog.setAttribute("aria-labelledby", heading.id)
  const action = (label: string, callback: () => void, primary = false) => {
    const button = element("button", primary ? "ss-button ss-button-primary" : "ss-button", label)
    button.type = "button"
    button.addEventListener("click", callback)
    return button
  }
  const close = action("Close", () => void closeDialog())
  const header = element("header", "ss-expression-header")
  header.append(heading, close)
  const steps = element("nav", "ss-expression-steps")
  steps.setAttribute("aria-label", "Expression stages")
  const controls = element("div", "ss-expression-controls")
  const cards = element("div", "ss-expression-cards")
  const scroll = element("div", "ss-expression-scroll")
  scroll.append(controls, cards)
  const footer = element("footer", "ss-expression-footer")
  const status = element("p", "", "")
  status.setAttribute("role", "status")
  const actions = element("div", "ss-expression-actions")
  footer.append(status, actions)
  dialog.append(header, steps, scroll, footer)
  const fields = (label: string, control: HTMLElement) => {
    const field = element("label", "ss-field")
    field.append(element("span", "", label), control)
    return field
  }
  const select = (items: Array<[string, string]>) => {
    const control = element("select", "ss-select")
    for (const [value, caption] of items) {
      const option = element("option", "", caption)
      option.value = value
      control.append(option)
    }
    return control
  }
  let reference: StudioExpressionImage | null = null
  const referenceField = element("div", "ss-field ss-expression-reference")
  const referencePicture = element("span", "ss-expression-reference-picture")
  const referenceLabel = element("strong")
  const chooseReference = action("Choose reference output", () => options.pickImage("reference", reference?.id || "", setReference))
  chooseReference.classList.add("ss-expression-reference-button")
  chooseReference.setAttribute("aria-haspopup", "dialog")
  const clearReference = action("Use look reference", () => { setReference(null); chooseReference.focus() })
  const setReference = (image: StudioExpressionImage | null) => {
    reference = image
    referenceLabel.textContent = image ? "Library image selected" : "Active look or folder"
    referencePicture.replaceChildren()
    if (image) {
      const thumbnail = element("img")
      thumbnail.src = image.url
      thumbnail.alt = ""
      referencePicture.append(thumbnail)
    } else {
      referencePicture.innerHTML = INIT_IMAGE_ICON
    }
    clearReference.hidden = !image
  }
  const referenceCopy = element("span", "ss-expression-reference-copy")
  referenceCopy.append(referenceLabel, element("small", "", "Browse folder images"))
  chooseReference.replaceChildren(referencePicture, referenceCopy)
  chooseReference.setAttribute("aria-label", "Choose reference output")
  referenceField.append(element("span", "", "Reference output"), chooseReference, clearReference)
  setReference(null)
  const adapter = options.family === "anima" ? "Anima Ref Adapter" : options.family === "illustrious" ? "IPAdapter PLUS" : ""
  const method = select(adapter ? [[options.family, adapter], ["", "Prompt only"]] : [["", "Prompt only"]])
  const enhanceFactor = select([["2", "2×"], ["3", "3×"], ["4", "4×"]])
  const enhanceFactorField = fields("Output scale", enhanceFactor)
  const sendPrefix = element("input", "ss-input")
  sendPrefix.type = "text"
  sendPrefix.placeholder = "shoto"
  const sendPrefixField = fields("Expression name prefix (optional)", sendPrefix)
  const sendPrefixExample = element("small", "ss-muted", "For example, shoto sends joy as shoto-joy.")
  sendPrefixExample.id = "ss-expression-prefix-example"
  sendPrefix.setAttribute("aria-describedby", sendPrefixExample.id)
  sendPrefixField.append(sendPrefixExample)
  let enhanceMode: "model" | "saved" | "custom" | "" | null = null
  let loadingEnhance = false
  let enhanceLoadFailed = false
  const loadEnhanceOptions = async () => {
    if (loadingEnhance || enhanceMode !== null) return
    loadingEnhance = true
    enhanceLoadFailed = false
    try {
      const optionsResult = await options.request("load_expression_enhance_options", {})
      enhanceMode = optionsResult.mode
      enhanceFactor.value = String(optionsResult.factor)
    } catch {
      enhanceLoadFailed = true
    } finally {
      loadingEnhance = false
      if (!disposed && stage === 1) render()
    }
  }
  const backgroundMode = select([["builtin", "Built-in · BiRefNet"], ["custom", "Custom graph"], ["saved", "Saved SwarmUI workflow"]])
  const backgroundWorkflow = select([["", "Choose a saved workflow"], ...options.workflows.map(item => [item.name, item.name] as [string, string])])
  const imageInput = select([])
  const backgroundGraph = element("textarea", "ss-textarea")
  backgroundGraph.rows = 5
  backgroundGraph.maxLength = 128_000
  backgroundGraph.placeholder = "Paste ComfyUI API JSON"
  const backgroundGraphField = fields("ComfyUI API graph", backgroundGraph)
  backgroundGraphField.classList.add("ss-expression-background-graph")
  const modelSetup = element("div", "ss-expression-model-setup")
  const modelStatus = element("p", "ss-muted", "BiRefNet uses birefnet.safetensors.")
  modelStatus.setAttribute("role", "status")
  const directoryPicker = (window as Window & { showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker
  const installModel = action("Install on this device…", () => void hydrateModel())
  installModel.hidden = !directoryPicker
  const recheckModel = action("Check model", () => void checkModel())
  const downloadModel = element("a", "ss-button", "Download weights")
  downloadModel.href = EXPRESSION_BG_MODEL_URL
  downloadModel.target = "_blank"
  downloadModel.rel = "noopener noreferrer"
  const modelActions = element("div", "ss-expression-model-actions")
  modelActions.append(installModel, recheckModel, downloadModel)
  const modelDetails = element("div", "ss-expression-model-details")
  modelDetails.append(modelActions, element("p", "ss-muted", "Model folder · ComfyUI/models/background_removal"))
  modelSetup.append(element("strong", "", "BiRefNet model"), modelStatus, modelDetails)
  let installTask: AbortController | null = null
  let checkingModel = false
  let modelChecked = false
  const checkModel = async (fallback = "") => {
    if (checkingModel) return
    modelChecked = true
    checkingModel = true
    recheckModel.disabled = true
    modelStatus.textContent = "Checking the connected ComfyUI model list…"
    let state = "unknown"
    try { state = (await options.request("check_expression_background_model", {}))?.status || "unknown" }
    catch { /* Direct Comfy access is optional on SwarmUI installations. */ }
    checkingModel = false
    recheckModel.disabled = busy || closing || Boolean(installTask)
    const messages: Record<string, string> = {
      installed: "BiRefNet is ready on the connected backend.",
      missing: "The connected backend does not list birefnet.safetensors yet.",
      unsupported: "Update the connected ComfyUI to a version with native BiRefNet nodes.",
      unknown: "Could not verify the model on this connection.",
    }
    modelStatus.textContent = (fallback && state !== "installed" ? fallback + " " : "") + (messages[state] || messages.unknown)
    if (state === "installed" && modelDetails.contains(document.activeElement)) backgroundMode.focus({ preventScroll: true })
    modelDetails.hidden = state === "installed"
  }
  const hydrateModel = async () => {
    if (!directoryPicker || installTask) return
    const task = new AbortController()
    installTask = task
    installModel.disabled = recheckModel.disabled = true
    render()
    let result = ""
    try {
      const directory = await directoryPicker.call(window, { mode: "readwrite" })
      task.signal.throwIfAborted()
      modelStatus.textContent = "Downloading BiRefNet (444 MB)…"
      const installed = await installExpressionBackgroundModel(directory, task.signal)
      result = installed ? "Weights installed in the selected folder." : "The model already exists in the selected folder."
    } catch (error) {
      if (!disposed && !task.signal.aborted) modelStatus.textContent =
        error instanceof Error && error.name === "AbortError" ? "Installation cancelled."
          : (error instanceof Error ? error.message : "Could not install the model.") + " You can download the weights manually."
    } finally {
      installTask = null
      installModel.disabled = false
      recheckModel.disabled = checkingModel
      if (!disposed) render()
    }
    if (result && !disposed) await checkModel(result)
  }
  const rows: StudioExpressionRow[] = []
  const makeRow = (label: string, direction: string, selected: boolean): StudioExpressionRow =>
    ({ label, direction, selected, image: null, drafts: new Set() })
  let generation = cleanExpressionGeneration(null)
  let showAll = false
  let loading = true
  let settingsAvailable = false
  let saved = ""
  let saveTask = Promise.resolve()
  let closing = false
  const saveStatus = element("span", "ss-muted")
  saveStatus.setAttribute("role", "status")
  const progressTiles = new Map<StudioExpressionRow, { bar: HTMLProgressElement; caption: HTMLElement; image: HTMLImageElement }>()
  const settingsPanel = element("details", "ss-expression-settings")
  settingsPanel.append(element("summary", "", "Set generation settings"))
  const settingsFields = element("div", "ss-expression-settings-fields")
  settingsPanel.append(settingsFields)
  const setToolbar = element("div", "ss-expression-toolbar")
  const custom = element("input", "ss-input")
  custom.placeholder = "e.g. Wistful"
  custom.maxLength = 40
  custom.required = true
  const customForm = element("form", "ss-expression-custom")
  const add = element("button", "ss-button", "Add custom slot")
  add.type = "submit"
  customForm.append(fields("Custom expression", custom), add)
  custom.addEventListener("input", () => custom.setCustomValidity(""))
  customForm.addEventListener("submit", event => {
    event.preventDefault()
    const label = cleanExpressionLabel(custom.value)
    if (!label || rows.some(row => row.label.toLowerCase() === label.toLowerCase())) {
      custom.setCustomValidity(label ? "That expression already exists." : "Enter a name using letters, numbers, spaces, or hyphens.")
      custom.reportValidity()
      return
    }
    if (rows.length >= EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT) return
    const row = makeRow(label, label.toLowerCase(), true)
    rows.push(row)
    custom.value = ""
    saveSet()
    render()
    directionInputs.get(row)?.focus()
  })

  const getSettings = () => ({
    generation: { ...generation, recipe: { ...generation.recipe } },
    selected: rows.filter(row => row.selected).map(row => row.label.toLowerCase()),
    slots: rows.map(({ label, direction }) => ({ label, direction })),
  })
  const saveSet = () => {
    if (!settingsAvailable) return
    const settings = getSettings()
    const snapshot = JSON.stringify(settings)
    if (snapshot === saved) return
    saved = snapshot
    saveStatus.textContent = "Saving set…"
    saveTask = saveTask.then(async () => {
      try {
        await options.request("save_expression_set", { settings })
        if (saved === snapshot) saveStatus.textContent = "Set saved to your account"
      } catch {
        if (saved === snapshot) {
          saved = ""
          saveStatus.textContent = "Set could not be saved. Edit the set or close to retry."
        }
      }
    })
  }
  const closeDialog = async () => {
    if (busy || closing) return
    closing = true
    if (dialog.contains(document.activeElement) && document.activeElement instanceof HTMLElement) document.activeElement.blur()
    saveSet()
    render()
    await saveTask
    if (!disposed && dialog.open) {
      if (settingsAvailable && !saved && close.textContent !== "Close without saving") {
        close.textContent = "Close without saving"
        status.textContent = "The set could not be saved to your account."
      } else dialog.close()
    }
    closing = false
    if (!disposed && dialog.open) {
      render()
      close.focus({ preventScroll: true })
    }
  }
  const directionInputs = new Map<StudioExpressionRow, HTMLTextAreaElement>()
  const renderCanvasSettings = () => {
    const canvas = element("section", "ss-expression-canvas")
    const shape = element("span", "ss-expression-canvas-shape")
    const size = element("output", "ss-expression-canvas-size")
    const preview = element("div", "ss-expression-canvas-preview")
    preview.append(shape, size)
    const controls = element("div", "ss-expression-canvas-controls")
    const presets = element("div", "ss-expression-presets")
    presets.setAttribute("role", "group")
    presets.setAttribute("aria-label", "Canvas aspect ratio")
    const orientations = element("div", "ss-expression-presets")
    orientations.setAttribute("role", "group")
    orientations.setAttribute("aria-label", "Canvas orientation")
    const toolbar = element("div", "ss-expression-canvas-toolbar")
    const axes = ["width", "height"] as const
    const getSize = (axis: typeof axes[number]) => Math.round(generation.recipe[axis] ?? options.inheritedRecipe[axis] ?? EXPRESSION_DEFAULT_RECIPE[axis])
    let preferVertical = getSize("height") > getSize("width")
    const sliders = axes.map((axis, index) => {
      const [, min, max] = GENERATION_NUMBER_LIMITS[index]
      const label = axis === "width" ? "Width" : "Height"
      const slider = element("input")
      slider.type = "range"
      slider.min = String(min)
      slider.max = String(max)
      slider.step = "any"
      slider.setAttribute("aria-label", label + " slider")
      const exact = element("input", "ss-input")
      exact.type = "number"
      exact.min = String(min)
      exact.max = String(max)
      exact.step = "1"
      exact.placeholder = String(options.inheritedRecipe[axis] ?? EXPRESSION_DEFAULT_RECIPE[axis])
      exact.setAttribute("aria-label", label)
      const row = element("div", "ss-expression-axis")
      row.append(element("span", "", label), slider, exact)
      slider.addEventListener("input", () => {
        generation.recipe[axis] = clamp(Math.round(slider.valueAsNumber / 8) * 8, min, max)
        syncCanvas()
      })
      slider.addEventListener("change", saveSet)
      slider.addEventListener("keydown", event => {
        const dir = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1
          : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0
        if (!dir) return
        event.preventDefault()
        generation.recipe[axis] = clamp(getSize(axis) + dir * 8, min, max)
        syncCanvas()
        saveSet()
      })
      exact.addEventListener("change", () => {
        if (!exact.checkValidity()) exact.reportValidity()
        else if (exact.value) generation.recipe[axis] = exact.valueAsNumber
        else delete generation.recipe[axis]
        syncCanvas()
        saveSet()
      })
      return { axis, slider, exact, row }
    })
    const aspectChoices = [["1:1", 1], ["4:3", 4 / 3], ["16:9", 16 / 9]] as const
    const setSize = (width: number, height: number) => {
      Object.assign(generation.recipe, { width, height })
      syncCanvas()
      saveSet()
    }
    const applyRatio = (ratio: number, vertical: boolean) => {
      const long = Math.max(getSize("width"), getSize("height"))
      const short = ratio === 1 ? long : Math.max(64, Math.round(long / ratio / 8) * 8)
      setSize(vertical ? short : long, vertical ? long : short)
    }
    const ratios = aspectChoices.map(([label, ratio]) => {
      const button = action(label, () => applyRatio(ratio, preferVertical))
      presets.append(button)
      return { button, ratio }
    })
    const directions = [false, true].map(vertical => {
      const button = action(vertical ? "Vertical" : "Horizontal", () => {
        const width = getSize("width")
        const height = getSize("height")
        if (width === height) applyRatio(4 / 3, vertical)
        else if ((height > width) !== vertical) setSize(height, width)
      })
      orientations.append(button)
      return button
    })
    const reset = action("Use inherited size", () => {
      delete generation.recipe.width
      delete generation.recipe.height
      syncCanvas()
      saveSet()
    })
    const syncCanvas = () => {
      const width = getSize("width")
      const height = getSize("height")
      const long = Math.max(width, height)
      const short = Math.min(width, height)
      if (width !== height) preferVertical = height > width
      for (const { axis, slider, exact } of sliders) {
        slider.value = String(getSize(axis))
        slider.setAttribute("aria-valuetext", getSize(axis) + " pixels")
        exact.value = String(generation.recipe[axis] ?? "")
      }
      for (const { button, ratio } of ratios) {
        button.setAttribute("aria-pressed", String(ratio === 1 ? width === height : Math.abs(short - long / ratio) <= 4))
      }
      directions[0].setAttribute("aria-pressed", String(width > height))
      directions[1].setAttribute("aria-pressed", String(height > width))
      shape.style.width = (width / long * 44) + "px"
      shape.style.height = (height / long * 44) + "px"
      size.textContent = width + " × " + height
    }
    syncCanvas()
    toolbar.append(presets, orientations, reset)
    controls.append(element("h3", "", "Canvas size"), toolbar, ...sliders.map(item => item.row))
    canvas.append(preview, controls)
    return canvas
  }

  const renderSettings = () => {
    const parameters = element("div", "ss-expression-parameters")
    for (const [key, min, max] of GENERATION_NUMBER_LIMITS.slice(2)) {
      const input = element("input", "ss-input")
      input.type = "number"
      input.min = String(min)
      input.max = String(max)
      input.step = key === "cfg" ? "any" : "1"
      input.value = String(generation.recipe[key] ?? "")
      input.placeholder = String(options.inheritedRecipe[key] ?? "Inherit")
      input.addEventListener("change", () => {
        if (!input.checkValidity()) {
          input.reportValidity()
          input.value = String(generation.recipe[key] ?? "")
          return
        }
        if (input.value === "") delete generation.recipe[key]
        else generation.recipe[key] = input.valueAsNumber
        saveSet()
      })
      parameters.append(fields(key === "cfg" ? "CFG" : key[0].toUpperCase() + key.slice(1), input))
    }
    for (const [key, choices] of [["sampler", options.samplers], ["scheduler", options.schedulers]] as const) {
      const inherited = options.inheritedRecipe[key]
      const current = generation.recipe[key]
      const values = [...new Set([...(current ? [current] : []), ...choices])]
      const input = select([["", inherited ? "Inherit · " + inherited : "Inherit"], ...values.map(value => [value, value] as [string, string])])
      input.value = current ?? ""
      input.addEventListener("change", () => {
        if (input.value) generation.recipe[key] = input.value
        else delete generation.recipe[key]
        saveSet()
      })
      parameters.append(fields(key === "sampler" ? "Sampler" : "Scheduler", input))
    }
    const prompts = element("div", "ss-expression-prompts")
    for (const [key, label, placeholder] of [
      ["prefix", "Shared prompt prefix", "Standing, looking at viewer"],
      ["negative", "Shared negative prompt", "What should never appear?"],
    ] as const) {
      const input = element("textarea", "ss-textarea")
      input.rows = 2
      input.maxLength = EXPRESSION_PROMPT_LIMIT
      input.placeholder = placeholder
      input.value = generation[key]
      input.addEventListener("input", () => { generation[key] = input.value })
      input.addEventListener("change", saveSet)
      prompts.append(fields(label, input))
    }
    const renderFields = element("div", "ss-expression-render-fields")
    renderFields.append(parameters, prompts)
    settingsFields.replaceChildren(renderCanvasSettings(), renderFields,
      element("p", "ss-muted", "Blank values inherit from the connection and character look. Shared prompts apply to every slot."))
  }
  const created = new Set<string>()
  let stage = 0
  let busy = false
  let activeRun: { source: StudioExpressionAction; controller: AbortController } | null = null
  let disposed = false
  const names = ["Generate", "Enhance", "Remove background", "Send to Lumiverse"]
  const setImage = (row: typeof rows[number], image: StudioExpressionImage) => {
    if (row.image && created.has(row.image.id)) row.drafts.add(row.image.id)
    created.add(image.id)
    row.image = image
  }
  const run = async (work: (signal: AbortSignal) => Promise<void>, source?: StudioExpressionAction) => {
    if (busy || disposed || closing) return
    const controller = new AbortController()
    activeRun = source ? { source, controller } : null
    busy = true
    render()
    try { await work(controller.signal) }
    catch (error) {
      status.textContent = controller.signal.aborted && error instanceof Error && error.name === "AbortError"
        ? "Stopped sending. Any linked images remain in the character gallery."
        : error instanceof Error ? error.message : String(error)
    } finally {
      activeRun = null
      busy = false
      if (!disposed) render()
    }
  }
  const runButton = (label: string, source: StudioExpressionAction, callback: () => void, disabled: boolean, primary = false) => {
    const run = activeRun?.source === source ? activeRun : null
    const button = action(run ? "Stop" : label, () => {
      if (!run) { callback(); return }
      if (run.controller.signal.aborted) return
      button.textContent = "Stopping…"
      button.setAttribute("aria-disabled", "true")
      status.textContent = "Stopping…"
      run.controller.abort()
    }, primary && !run)
    const name = typeof source === "string" ? label : label + " " + source.label
    button.setAttribute("aria-label", run ? "Stop " + name.toLowerCase() : name)
    button.dataset.expressionFocus = typeof source === "string" ? "run-" + source : "run-slot-" + source.label
    if (run) button.classList.add("ss-button-danger")
    button.disabled = !run && disabled
    return button
  }
  const process = (targets: StudioExpressionRow[], source: StudioExpressionAction) => {
    if (!targets.length || busy || closing) return
    saveSet()
    const previouslyFailed = new Set(targets.filter(row => row.state === "failed"))
    for (const row of targets) row.state = "queued"
    void run(async signal => {
      let completed = 0
      let failures = 0
      let lastError = ""
      let stopError = ""
      for (const [index, row] of targets.entries()) {
        if (disposed || signal.aborted) break
        status.textContent = `${names[stage]} · ${row.label} · ${index + 1} of ${targets.length}`
        row.state = "working"
        render()
        try {
          const progress: StudioExpressionProgress = ({ step, totalSteps, preview }) => {
            if (signal.aborted) return
            const tile = progressTiles.get(row)
            if (!tile) return
            if (typeof preview === "string" && preview && tile.image.getAttribute("src") !== preview) {
              tile.image.src = preview
              tile.image.alt = row.label + " live render preview"
              tile.image.hidden = false
            }
            if (!Number.isFinite(step) || !Number.isFinite(totalSteps) || totalSteps <= 0) return
            tile.bar.max = totalSteps
            tile.bar.value = Math.max(0, Math.min(step, totalSteps))
            tile.caption.textContent = `${stage === 0 ? "Rendering" : names[stage]} · ${tile.bar.value} / ${totalSteps}`
          }
          const image = stage === 0
            ? await options.request("render_folder_expression", {
                model: options.model, direction: row.direction, family: method.value, referenceId: method.value ? reference?.id || "" : "", generation,
              }, progress, signal)
            : await options.request("process_folder_expression", { imageId: row.image?.id,
                action: stage === 1 ? "enhance" : "remove-background",
                ...(stage === 1 && enhanceMode === "model" && { factor: Number(enhanceFactor.value) }),
                ...(stage === 2 && { backgroundMode: backgroundMode.value, graph: backgroundGraph.value,
                  workflow: backgroundWorkflow.value, imageParam: imageInput.value }) }, progress, signal)
          setImage(row, image)
          row.state = undefined
          completed++
        } catch (error) {
          if (signal.aborted) {
            if (!(error instanceof Error && error.name === "AbortError")) stopError = error instanceof Error ? error.message : String(error)
            break
          }
          row.state = "failed"
          failures++
          lastError = error instanceof Error ? error.message : String(error)
        }
      }
      for (const row of targets) {
        if (row.state === "queued" || row.state === "working") row.state = previouslyFailed.has(row) ? "failed" : undefined
      }
      status.textContent = signal.aborted ? `Stopped · ${completed} of ${targets.length} saved.${stopError ? " " + stopError : ""}`
        : failures ? `${failures} failed. ${lastError}` : `${targets.length} expression${targets.length === 1 ? "" : "s"} saved.`
    }, source)
  }
  const publish = () => void run(async signal => {
    const ready = rows.filter(row => row.selected && row.image)
    const prefix = sendPrefix.value.trim()
    const mappings = Object.fromEntries(ready.map(row => [prefix ? prefix + "-" + row.label : row.label, row.image!.id]))
    status.textContent = "Sending selected expressions to Lumiverse…"
    const images = ready.map(row => row.image!.id)
    const linked = await studioCharacterImageAction(binding.characterId, images, "gallery", fetch, signal)
    signal.throwIfAborted()
    if (linked.failed.length) throw new Error("Some outputs could not be linked to the gallery. Retry Send selected.")
    const response = await fetch(`/api/v1/characters/${encodeURIComponent(binding.characterId)}/expressions/from-gallery`, {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappings }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(String(data?.error || "This Lumiverse host could not accept expression mappings. Images are still saved in the character gallery."))
    }
    let cleanupFailed = 0
    if (options.deleteDrafts) {
      const keep = new Set(rows.map(row => row.image?.id))
      for (const row of ready) {
        if (signal.aborted) break
        for (const id of row.drafts) {
          if (signal.aborted) break
          if (keep.has(id)) continue
          try { await options.request("delete_output", { imageId: id }); row.drafts.delete(id) }
          catch { cleanupFailed++ }
        }
      }
    }
    status.textContent = `Sent ${ready.length} expression${ready.length === 1 ? "" : "s"} to Lumiverse.${signal.aborted && options.deleteDrafts ? " Draft cleanup stopped." : ""}${cleanupFailed ? ` ${cleanupFailed} drafts could not be removed.` : ""}`
  }, "send")
  backgroundWorkflow.addEventListener("change", () => {
    imageInput.replaceChildren()
    if (!backgroundWorkflow.value) return render()
    void run(async () => {
      const result = await options.request("load_upscale_workflow", { name: backgroundWorkflow.value })
      const parameters = Array.isArray(result.parameters) ? result.parameters : []
      const choices = parameters.filter((item: SwarmWorkflowParameter) => item.type === "image" || item.viewType === "image")
      for (const item of choices) {
        const option = element("option", "", item.name || item.id)
        option.value = item.id
        imageInput.append(option)
      }
      if (!choices.length) status.textContent = "This workflow exposes no image input."
    })
  })
  imageInput.addEventListener("change", () => render())
  backgroundMode.addEventListener("change", () => {
    if (backgroundMode.value === "builtin" && !modelChecked) void checkModel()
    render()
  })
  backgroundGraph.addEventListener("input", () => {
    for (const button of actions.querySelectorAll<HTMLButtonElement>("[data-background-action]")) {
      button.disabled = !backgroundGraph.value.trim() || button.dataset.backgroundAction === "empty"
    }
  })
  const changeStage = (index: number) => {
    stage = index
    if (stage === 1) void loadEnhanceOptions()
    if (stage === 2 && backgroundMode.value === "builtin" && !modelChecked) void checkModel()
    for (const row of rows) row.state = undefined
    status.textContent = ""
    render()
    scroll.scrollTop = 0
  }

  const stepButtons = names.map((name, index) => {
    const button = action(name, () => changeStage(index))
    button.classList.add("ss-expression-step")
    const number = element("span", "ss-expression-step-number", String(index + 1))
    number.setAttribute("aria-hidden", "true")
    button.replaceChildren(number, element("span", "", name))
    return button
  })
  steps.append(...stepButtons)

  const render = () => {
    const focused = dialog.ownerDocument.activeElement as HTMLElement | null
    const key = focused?.dataset.expressionFocus
    const disabled = busy || closing
    close.disabled = disabled
    stepButtons.forEach((button, index) => {
      button.disabled = disabled || loading
      if (index === stage) button.setAttribute("aria-current", "step")
      else button.removeAttribute("aria-current")
    })
    controls.replaceChildren()
    if (loading) {
      controls.append(element("p", "ss-muted", "Loading your expression set…"))
      return
    }
    const selectable = stage === 0 ? rows : rows.filter(row => row.image)
    const hasSelection = selectable.some(row => row.selected)
    const toggleSelection = action(hasSelection ? "Deselect all" : "Select all", () => {
      for (const row of selectable) row.selected = !hasSelection
      if (stage === 0 && hasSelection) showAll = true
      saveSet()
      render()
    })
    toggleSelection.disabled = disabled || !selectable.length
    toggleSelection.dataset.expressionFocus = "toggle-selection"
    if (stage === 0) {
      const presets = element("div", "ss-expression-presets")
      const builtIns = rows.slice(0, EXPRESSION_SPREAD.length)
      for (const [label, slots] of [["Basics", EXPRESSION_BASICS], ["Full spread", EXPRESSION_SPREAD]] as const) {
        const inclusion = new Set<string>(slots.map(([slot]) => slot))
        const preset = action(label, () => {
          for (const row of builtIns) row.selected = inclusion.has(row.label)
          saveSet()
          render()
        })
        preset.disabled = disabled
        preset.dataset.expressionFocus = label
        preset.setAttribute("aria-pressed", String(builtIns.every(row => row.selected === inclusion.has(row.label))))
        presets.append(preset)
      }
      const toggle = action(showAll ? "Show selected slots" : "Show all slots", () => { showAll = !showAll; render() })
      toggle.disabled = disabled
      toggle.dataset.expressionFocus = "show-slots"
      const count = element("span", "ss-muted", `${rows.filter(row => row.selected).length} selected · ${rows.length} slots`)
      setToolbar.replaceChildren(presets, toggle, toggleSelection, count, saveStatus)
      custom.disabled = disabled
      add.disabled = disabled || rows.length >= EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT
      for (const input of settingsFields.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement>("input, select, textarea, button")) input.disabled = disabled
      const sources = element("div", "ss-expression-sources")
      const syncReferenceAvailability = () => {
        chooseReference.disabled = disabled || !method.value
        clearReference.disabled = disabled || !method.value
      }
      method.onchange = syncReferenceAvailability
      syncReferenceAvailability()
      sources.append(fields("Reference method", method), referenceField,
        element("p", "ss-muted", options.model || "Current SwarmUI checkpoint"))
      controls.append(setToolbar, sources, settingsPanel, customForm)
    } else if (stage === 1) {
      if (enhanceMode === "model") {
        enhanceFactor.disabled = disabled
        controls.append(enhanceFactorField)
      } else {
        controls.append(element("p", "ss-muted", loadingEnhance ? "Loading upscale settings…"
          : enhanceLoadFailed ? "Could not load upscale settings."
          : enhanceMode ? "The configured workflow sets the output resolution."
          : "Save an AI Upscale setup for this connection to enhance expressions."))
        if (enhanceLoadFailed) controls.append(action("Retry loading settings", () => {
          void loadEnhanceOptions()
          render()
        }))
      }
    } else if (stage === 2) {
      controls.append(fields("Background-removal workflow", backgroundMode))
      if (backgroundMode.value === "builtin") controls.append(modelSetup)
      else if (backgroundMode.value === "custom") controls.append(backgroundGraphField)
      else controls.append(fields("Saved workflow", backgroundWorkflow), fields("Source image input", imageInput))
    } else {
      controls.append(sendPrefixField)
    }
    for (const control of [method, backgroundMode, backgroundWorkflow, imageInput, backgroundGraph, sendPrefix]) control.disabled = disabled
    installModel.disabled = disabled || Boolean(installTask)
    recheckModel.disabled = disabled || checkingModel || Boolean(installTask)
    if (stage !== 0 && selectable.length) {
      setToolbar.replaceChildren(toggleSelection)
      controls.append(setToolbar)
    }
    const all = stage === 0 && !showAll ? selectable.filter(row => row.selected) : selectable
    const selected = all.filter(row => row.selected)
    directionInputs.clear()
    progressTiles.clear()
    const tiles = all.map(row => {
      const card = element("article", "ss-expression-card")
      const checkbox = element("input")
      checkbox.type = "checkbox"
      checkbox.checked = row.selected
      checkbox.disabled = disabled
      checkbox.dataset.expressionFocus = `select-${row.label}`
      checkbox.addEventListener("change", () => {
        row.selected = checkbox.checked
        if (!showAll && stage === 0 && !row.selected) checkbox.dataset.expressionFocus = "show-slots"
        saveSet()
        render()
      })
      const label = element("label", "ss-expression-select")
      label.append(checkbox, element("span", "", row.label))
      const preview = element("div", "ss-expression-preview")
      const image = element("img")
      if (row.image || row.state === "working") {
        image.alt = row.label + " expression"
        image.loading = row.state === "working" ? "eager" : "lazy"
        if (row.image) image.src = row.image.url
        else image.hidden = true
        preview.append(image)
      } else if (!row.state) preview.append(element("span", "", "Awaiting render"))
      if (row.state) {
        const feedback = element("div", "ss-expression-tile-feedback")
        const caption = element("span", "", row.state === "queued" ? "Queued" :
          row.state === "failed" ? "Failed" : stage === 0 ? "Rendering…" : `${names[stage]}…`)
        feedback.append(caption)
        if (row.state === "working") {
          const bar = element("progress")
          bar.setAttribute("aria-label", `${row.label} progress`)
          progressTiles.set(row, { bar, caption, image })
          feedback.append(bar)
        }
        preview.append(feedback)
      }
      card.append(label, preview)
      if (stage === 0) {
        const input = element("textarea", "ss-textarea")
        input.value = row.direction
        input.disabled = disabled
        input.maxLength = EXPRESSION_DIRECTION_LIMIT
        input.addEventListener("input", () => { row.direction = input.value })
        input.addEventListener("change", saveSet)
        directionInputs.set(row, input)
        const generate = runButton(row.image ? "Regenerate" : "Render", row, () => process([row], row), disabled)
        input.setAttribute("aria-label", `Direction for ${row.label}`)
        const slotActions = element("div", "ss-expression-slot-actions")
        slotActions.append(generate)
        if (rows.indexOf(row) >= EXPRESSION_SPREAD.length) {
          const remove = action("Remove slot", () => {
            rows.splice(rows.indexOf(row), 1)
            saveSet()
            render()
            custom.focus()
          })
          remove.disabled = disabled
          remove.setAttribute("aria-label", `Remove ${row.label} custom slot`)
          slotActions.append(remove)
        }
        card.append(fields("Direction", input), slotActions)
        const useSaved = action("Choose saved image", () => options.pickImage("saved", row.image?.id || "", image => {
          if (row.image?.id === image.id) return
          if (row.image && created.has(row.image.id)) row.drafts.add(row.image.id)
          row.image = image
          row.state = undefined
          render()
        }))
        useSaved.dataset.expressionFocus = "saved-image-" + row.label
        useSaved.setAttribute("aria-label", "Choose saved image for " + row.label)
        useSaved.setAttribute("aria-haspopup", "dialog")
        useSaved.disabled = disabled
        card.append(useSaved)
      }
      return card
    })
    cards.replaceChildren(...(tiles.length ? tiles : [element("p", "ss-muted", stage === 0
      ? "Choose a preset or show all slots to make a selection."
      : "Render or choose a saved image in Generate to continue.")]))
    actions.replaceChildren()
    if (stage < 3) {
      const customBackground = stage === 2 && backgroundMode.value === "custom"
      const canProcess = stage === 1 ? Boolean(enhanceMode) : stage !== 2 || (backgroundMode.value === "builtin" ? !installTask
        : customBackground ? Boolean(backgroundGraph.value.trim()) : Boolean(backgroundWorkflow.value && imageInput.value))
      const runSelected = runButton(`${names[stage]} selected`, "selected", () => process(selected, "selected"), disabled || !selected.length || !canProcess, true)
      const runAll = runButton(`${names[stage]} all`, "all", () => process(all, "all"), disabled || !all.length || !canProcess)
      if (customBackground) {
        runSelected.dataset.backgroundAction = selected.length ? "ready" : "empty"
        runAll.dataset.backgroundAction = all.length ? "ready" : "empty"
      }
      const failed = selectable.filter(row => row.state === "failed")
      const retry = runButton("Retry failed", "failed", () => process(failed, "failed"), disabled || !canProcess)
      if (customBackground) retry.dataset.backgroundAction = "ready"
      const next = action("Next / Skip", () => changeStage(stage + 1))
      next.disabled = disabled
      actions.append(runSelected)
      if (stage !== 0 || showAll) actions.append(runAll)
      if (failed.length || activeRun?.source === "failed") actions.append(retry)
      actions.append(next)
    } else {
      actions.append(runButton("Send selected", "send", publish, disabled || !selected.length, true))
    }
    if (key) [...dialog.querySelectorAll<HTMLElement>("[data-expression-focus]")].find(node => node.dataset.expressionFocus === key)?.focus({ preventScroll: true })
  }
  const previousFocus = document.activeElement as HTMLElement | null
  dialog.addEventListener("cancel", event => {
    event.preventDefault()
    void closeDialog()
  })
  dialog.addEventListener("close", () => {
    disposed = true
    installTask?.abort()
    activeRun?.controller.abort()
    dialog.remove()
    previousFocus?.focus({ preventScroll: true })
    options.refresh()
  }, { once: true })
  render()
  root.append(dialog)
  dialog.showModal()
  const useSet = (value: unknown) => {
    if (disposed || !dialog.open) return
    const settings = cleanStudioExpressionSet(value)
    const selected = new Set(settings.selected)
    for (const { label, direction } of settings.slots) rows.push(makeRow(label, direction, selected.has(label.toLowerCase())))
    generation = settings.generation
    saved = JSON.stringify(getSettings())
    loading = false
    renderSettings()
    render()
  }
  void options.request("load_expression_set", {}).then(value => {
    settingsAvailable = true
    useSet(value)
  }, () => {
    saveStatus.textContent = "Saved set unavailable. Changes apply to this session."
    useSet(null)
  })
  return dialog
}
