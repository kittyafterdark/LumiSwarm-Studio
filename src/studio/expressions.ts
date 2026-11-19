interface StudioExpressionImage { id: string; url: string }
type StudioExpressionProgress = (progress: { step: number; totalSteps: number; preview?: string }) => void

type StudioExpressionAction = "selected" | "all" | "failed" | "send" | StudioExpressionRow

interface StudioExpressionRow {
  label: string
  direction: string
  originalDirection?: string
  bankId?: string
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
  const headerCopy = element("div", "ss-expression-header-copy")
  headerCopy.append(element("small", "", "Output library  /  " + options.folder.name), heading)
  heading.textContent = "Expression Studio"
  const headerIdentity = element("div", "ss-expression-identity")
  const mark = element("span", "ss-expression-mark", "✦")
  mark.setAttribute("aria-hidden", "true")
  headerIdentity.append(mark, headerCopy)
  header.append(headerIdentity, close)
  const steps = element("nav", "ss-expression-steps")
  steps.setAttribute("aria-label", "Expression stages")
  const controls = element("div", "ss-expression-controls")
  const cards = element("div", "ss-expression-cards")
  const galleryHead = element("div", "ss-expression-gallery-head")
  const scroll = element("div", "ss-expression-scroll")
  scroll.append(controls, galleryHead, cards)
  const footer = element("footer", "ss-expression-footer")
  const status = element("p", "", "")
  status.setAttribute("role", "status")
  const footerIdentity = element("div", "ss-expression-footer-identity")
  const footerMark = element("span", "ss-expression-footer-mark", "◇")
  footerMark.setAttribute("aria-hidden", "true")
  const footerCopy = element("div", "ss-expression-footer-copy")
  footerIdentity.append(footerMark, footerCopy)
  footerCopy.append(status)
  const actions = element("div", "ss-expression-actions")
  footer.append(footerIdentity, actions)
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
  let loading = true
  let settingsAvailable = false
  let saved = ""
  let saveTask = Promise.resolve()
  let closing = false
  const saveStatus = element("span", "ss-muted")
  saveStatus.setAttribute("role", "status")
  const progressTiles = new Map<StudioExpressionRow, { bar: HTMLProgressElement; caption: HTMLElement; image: HTMLImageElement }>()
  const settingsFields = element("div", "ss-expression-settings-fields")
  footerCopy.append(saveStatus)

  const getSettings = () => ({
    generation: { ...generation, recipe: { ...generation.recipe } },
    selected: rows.filter(row => row.selected).map(row => row.label.toLowerCase()),
    slots: rows.map(({ label, direction, bankId }) => ({ label, direction, ...(bankId ? { bankId } : {}) })),
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
    await Promise.all([saveTask, bankSaveTask])
    if (!disposed && dialog.open) {
      if (((settingsAvailable && !saved) || (bankAvailable && !bankSnapshot)) && close.textContent !== "Close without saving") {
        close.textContent = "Close without saving"
        status.textContent = "The expression set or bank could not be saved to your account."
      } else dialog.close()
    }
    closing = false
    if (!disposed && dialog.open) {
      render()
      close.focus({ preventScroll: true })
    }
  }
  // The reusable bank is intentionally account-backed, not tied to this character's slots.
  let bank: StudioExpressionBankEntry[] = []
  let bankLoaded = false
  let bankAvailable = false
  let bankSnapshot = ""
  let bankSaveTask = Promise.resolve()
  let bankSearch = ""
  let galleryFilter: "all" | "selected" | "ready" | "empty" = "all"
  let previewMode: "portrait" | "closeup" = "portrait"
  let linkedSize = true
  let currentRatio = 0
  // Only the active card edits its direction. Draft text is deliberately not persisted
  // until Save; Cancel and a stage change discard it without touching the saved set.
  let inlineEdit: { row: StudioExpressionRow; draft: string; bankId?: string; bankLabel?: string } | null = null
  let overlayFocus: HTMLElement | null = null
  const overlay = element("div", "ss-expression-overlay")
  overlay.hidden = true
  overlay.setAttribute("role", "dialog")
  overlay.setAttribute("aria-modal", "true")
  const overlayScrim = element("button", "ss-expression-overlay-scrim")
  overlayScrim.type = "button"
  overlayScrim.setAttribute("aria-label", "Close panel")
  const overlayPanel = element("div", "ss-expression-overlay-panel")
  overlay.append(overlayScrim, overlayPanel)
  dialog.append(overlay)
  const closeOverlay = () => {
    overlay.hidden = true
    overlayPanel.replaceChildren()
    overlayFocus?.focus({ preventScroll: true })
    overlayFocus = null
  }
  overlayScrim.addEventListener("click", closeOverlay)
  const openOverlay = (title: string, kicker: string, wide = false) => {
    if (overlay.hidden) overlayFocus = dialog.ownerDocument.activeElement as HTMLElement | null
    overlay.hidden = false
    overlayPanel.classList.toggle("ss-expression-overlay-wide", wide)
    const head = element("header", "ss-expression-overlay-head")
    const copy = element("div", "ss-expression-overlay-heading")
    copy.append(element("small", "ss-expression-kicker", kicker), element("h3", "", title))
    const exit = action("Close", closeOverlay)
    exit.classList.add("ss-expression-overlay-close")
    head.append(copy, exit)
    const body = element("div", "ss-expression-overlay-body")
    const bottom = element("footer", "ss-expression-overlay-bottom")
    overlayPanel.replaceChildren(head, body, bottom)
    exit.focus({ preventScroll: true })
    return { body, bottom }
  }
  const defaultDirection = (row: StudioExpressionRow) => {
    const builtin = EXPRESSION_SPREAD.find(([name]) => name === row.label.toLowerCase())
    if (builtin) return builtin[1] as string
    return bank.find(item => item.id === row.bankId)?.direction ?? row.originalDirection ?? row.direction
  }
  const saveBank = () => {
    if (!bankAvailable) return
    const snapshot = JSON.stringify(bank)
    if (bankSnapshot === snapshot) return
    bankSnapshot = snapshot
    bankSaveTask = bankSaveTask.then(async () => {
      try {
        await options.request("save_expression_bank", { templates: JSON.parse(snapshot) })
      } catch {
        if (bankSnapshot === snapshot) {
          bankSnapshot = ""
          status.textContent = "Could not save the custom expression bank. Retry by editing a template."
        }
      }
    })
  }
  const bankId = () => `bank-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  const upsertBank = (label: string, direction: string): StudioExpressionBankEntry | null => {
    if (!bankAvailable) return null
    if (EXPRESSION_SPREAD.some(([name]) => name === label.toLowerCase())) return null
    const entry = bank.find(item => item.label.toLowerCase() === label.toLowerCase())
    if (entry) entry.direction = direction.slice(0, EXPRESSION_DIRECTION_LIMIT)
    else {
      if (bank.length >= 150) return null
      bank.push({ id: bankId(), label, direction: direction.slice(0, EXPRESSION_DIRECTION_LIMIT) })
    }
    saveBank()
    return bank.find(item => item.label.toLowerCase() === label.toLowerCase()) ?? null
  }
  const addCustomSlot = (label: string, direction: string, template?: StudioExpressionBankEntry) => {
    const name = cleanExpressionLabel(label)
    if (!name || rows.some(row => row.label.toLowerCase() === name.toLowerCase()) || rows.length >= EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT) return false
    const row = makeRow(name, direction.slice(0, EXPRESSION_DIRECTION_LIMIT), true)
    row.bankId = template?.id
    row.originalDirection = row.direction
    rows.push(row)
    galleryFilter = "all"
    saveSet()
    render()
    return true
  }
  const openCustomSlot = () => {
    const { body, bottom } = openOverlay("New expression", "Custom slot")
    const name = element("input", "ss-input")
    name.placeholder = "e.g. Wistful"
    name.maxLength = 40
    const direction = element("textarea", "ss-textarea")
    direction.rows = 5
    direction.maxLength = EXPRESSION_DIRECTION_LIMIT
    direction.placeholder = "Describe the expression, gaze, and body language"
    const checkbox = element("input")
    checkbox.type = "checkbox"
    checkbox.checked = bankAvailable
    checkbox.disabled = !bankAvailable
    const persist = element("label", "ss-expression-checkline")
    persist.append(checkbox, element("span", "", "Also save as a reusable bank template"))
    body.append(fields("Expression name", name), fields("Direction", direction), persist)
    const create = action("Add expression", () => {
      const label = cleanExpressionLabel(name.value)
      if (!label) { name.setCustomValidity("Use a valid name up to 40 characters."); name.reportValidity(); name.setCustomValidity(""); return }
      if (rows.some(row => row.label.toLowerCase() === label.toLowerCase())) { status.textContent = "That expression already exists in this set."; name.focus(); return }
      if (checkbox.checked && bank.some(item => item.label.toLowerCase() === label.toLowerCase())) {
        status.textContent = "This name already exists in the bank. Use its existing template instead."
        return
      }
      const content = direction.value.trim() || label.toLowerCase()
      const template = checkbox.checked ? upsertBank(label, content) ?? undefined : undefined
      if (!addCustomSlot(label, content, template)) { status.textContent = "The custom slot limit has been reached."; return }
      closeOverlay()
    }, true)
    bottom.append(create)
  }
  const beginInlineEdit = (row: StudioExpressionRow) => {
    if (busy || closing || stage !== 0) return
    inlineEdit = { row, draft: row.direction, bankId: row.bankId }
    render()
    cards.querySelector<HTMLTextAreaElement>("[data-expression-inline-editor]")?.focus({ preventScroll: true })
  }
  const focusCardEditorButton = (row: StudioExpressionRow | undefined) => {
    if (!row) return
    const button = [...cards.querySelectorAll<HTMLElement>("[data-expression-focus]")]
      .find(item => item.dataset.expressionFocus === `edit-${row.label}`)
    button?.focus({ preventScroll: true })
  }
  const cancelInlineEdit = () => {
    const row = inlineEdit?.row
    inlineEdit = null
    render()
    focusCardEditorButton(row)
  }
  const commitInlineEdit = () => {
    if (!inlineEdit) return
    const { row, draft, bankId } = inlineEdit
    row.direction = draft.slice(0, EXPRESSION_DIRECTION_LIMIT)
    if (bankId) {
      row.bankId = bankId
      if (!EXPRESSION_SPREAD.some(([label]) => label === row.label.toLowerCase())) {
        row.originalDirection = bank.find(item => item.id === bankId)?.direction ?? row.originalDirection
      }
    }
    inlineEdit = null
    saveSet()
    render()
    focusCardEditorButton(row)
  }
  const saveInlineToBank = () => {
    if (!inlineEdit || !bankAvailable) return
    const { row, draft, bankId: pendingId } = inlineEdit
    const builtIn = EXPRESSION_SPREAD.some(([label]) => label === row.label.toLowerCase())
    let label = row.label
    if (builtIn) {
      // The bank validator deliberately reserves built-in labels. Store a uniquely
      // named variant so a stoic Neutral cannot silently overwrite the default.
      const existing = bank.find(item => item.id === pendingId)
      if (existing) label = existing.label
      else {
        let index = 1
        label = `${row.label} variant`
        while (bank.some(item => item.label.toLowerCase() === label.toLowerCase())) {
          index++
          label = `${row.label} variant ${index}`
        }
      }
    }
    const template = upsertBank(label, draft)
    if (!template) {
      status.textContent = "The expression bank is full or unavailable."
      return
    }
    inlineEdit.bankId = template.id
    inlineEdit.bankLabel = template.label
    render()
    cards.querySelector<HTMLTextAreaElement>("[data-expression-inline-editor]")?.focus({ preventScroll: true })
  }
  const openInspector = (row: StudioExpressionRow) => {
    if (!row.image) return
    const { body, bottom } = openOverlay(row.label, "Image inspector", true)
    const frame = element("div", "ss-expression-inspector-image")
    const image = element("img")
    image.src = row.image.url
    image.alt = `${row.label} expression, full image`
    frame.append(image)
    const info = element("div", "ss-expression-inspector-meta")
    info.append(element("strong", "", row.label), element("p", "", row.direction), element("small", "", `Output · ${row.image.id}`))
    body.append(frame, info)
    const available = rows.filter(item => item.image)
    const index = available.indexOf(row)
    for (const [label, offset] of [["Previous", -1], ["Next", 1]] as const) {
      const button = action(label, () => openInspector(available[(index + offset + available.length) % available.length]))
      button.disabled = available.length < 2
      bottom.append(button)
    }
    bottom.append(action("Choose saved image", () => options.pickImage("saved", row.image?.id || "", image => {
      setImage(row, image)
      closeOverlay()
      render()
    })))
  }
  const openBank = () => {
    const { body, bottom } = openOverlay("Expression bank", "Reusable directions", true)
    const search = element("input", "ss-input")
    search.type = "search"
    search.value = bankSearch
    search.placeholder = "Find a saved expression…"
    const list = element("div", "ss-expression-bank-list")
    const paint = () => {
      list.replaceChildren()
      if (!bankLoaded) { list.append(element("p", "ss-muted", "Loading your account bank…")); return }
      for (const entry of bank.filter(item => item.label.toLowerCase().includes(bankSearch.toLowerCase()))) {
        const item = element("div", "ss-expression-bank-item")
        const description = element("div")
        description.append(element("strong", "", entry.label), element("p", "", entry.direction))
        const use = action("Use", () => {
          if (!addCustomSlot(entry.label, entry.direction, entry)) { status.textContent = "This expression is already in the set or the custom slot limit is reached."; return }
          closeOverlay()
        }, true)
        const edit = action("Edit", () => {
          const { body: editBody, bottom: editBottom } = openOverlay(entry.label, "Bank template")
          const name = element("input", "ss-input")
          name.value = entry.label
          name.maxLength = 40
          const text = element("textarea", "ss-textarea")
          text.rows = 6
          text.maxLength = EXPRESSION_DIRECTION_LIMIT
          text.value = entry.direction
          editBody.append(fields("Template name", name), fields("Default direction", text))
          editBottom.append(action("Back to bank", openBank), action("Save template", () => {
            const label = cleanExpressionLabel(name.value)
            if (!label || EXPRESSION_SPREAD.some(([builtin]) => builtin === label.toLowerCase()) || bank.some(item => item !== entry && item.label.toLowerCase() === label.toLowerCase())) {
              status.textContent = "That bank name is invalid or already in use."
              return
            }
            entry.label = label
            entry.direction = text.value
            saveBank()
            openBank()
          }, true))
        })
        const drop = action("Delete", () => {
          if (!window.confirm(`Delete ${entry.label} from the reusable bank? Existing character slots will remain.`)) return
          bank = bank.filter(item => item !== entry)
          saveBank()
          paint()
        })
        drop.classList.add("ss-button-danger")
        item.append(description, use, edit, drop)
        list.append(item)
      }
      if (!list.childElementCount) list.append(element("p", "ss-muted", "No saved expressions found. Create one using New expression."))
    }
    search.addEventListener("input", () => { bankSearch = search.value; paint() })
    body.append(element("p", "ss-muted", "Save custom directions once, then reuse them across characters. Removing a slot never deletes its bank template."), search, list)
    paint()
    const reset = action("Reset built-in directions", () => {
      if (!window.confirm("Restore defaults for the 20 built-in expressions? Custom slots and images stay intact.")) return
      for (const row of rows) if (EXPRESSION_SPREAD.some(([label]) => label === row.label.toLowerCase())) row.direction = defaultDirection(row)
      saveSet()
      render()
      status.textContent = "Built-in directions restored to defaults."
    })
    const importFile = element("input")
    importFile.type = "file"
    importFile.accept = ".json,application/json"
    importFile.hidden = true
    importFile.addEventListener("change", () => {
      const file = importFile.files?.[0]
      if (!file) return
      if (file.size > 1024 * 1024) { status.textContent = "Bank import must be under 1 MB."; return }
      void file.text().then(text => {
        const parsed: unknown = JSON.parse(text)
        const record = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {}
        if (record.format !== "lumiswarm-expression-bank-v1" || !Array.isArray(record.expressions) || record.expressions.length > 150) throw new Error("Invalid expression bank format.")
        const entries = cleanStudioExpressionBank(record.expressions)
        if (entries.length !== record.expressions.length) throw new Error("One or more template names are invalid or duplicated.")
        if (bank.length + entries.filter(item => !bank.some(existing => existing.label.toLowerCase() === item.label.toLowerCase())).length > 150) throw new Error("Bank limit of 150 templates exceeded.")
        for (const item of entries) upsertBank(item.label, item.direction)
        saveBank()
        paint()
      }).catch(error => { status.textContent = `Import failed: ${error instanceof Error ? error.message : String(error)}` })
    })
    const importButton = action("Import JSON", () => importFile.click())
    const exportButton = action("Export JSON", () => {
      const blob = new Blob([JSON.stringify({ format: "lumiswarm-expression-bank-v1", expressions: bank }, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = element("a")
      link.href = url
      link.download = "lumiswarm-expression-bank.json"
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    })
    bottom.append(importFile, importButton, exportButton, reset, action("New expression", openCustomSlot, true))
  }

  const renderCanvasSettings = () => {
    const canvas = element("section", "ss-expression-canvas")
    const head = element("div", "ss-expression-canvas-head")
    const title = element("strong", "", "Canvas dimensions")
    const size = element("output", "ss-expression-canvas-size")
    head.append(title, size)
    const presets = element("div", "ss-expression-ratio-presets")
    presets.setAttribute("role", "group")
    presets.setAttribute("aria-label", "Aspect ratio presets")
    const axes = ["width", "height"] as const
    const getSize = (axis: typeof axes[number]) => Math.round(generation.recipe[axis] ?? options.inheritedRecipe[axis] ?? EXPRESSION_DEFAULT_RECIPE[axis])
    currentRatio = linkedSize && Number.isFinite(currentRatio) && currentRatio > 0 ? currentRatio : getSize("width") / getSize("height")
    const ratioChoices = [["1:1", 1], ["3:4", 3 / 4], ["2:3", 2 / 3], ["9:16", 9 / 16], ["4:3", 4 / 3], ["16:9", 16 / 9]] as const
    const ratioButtons: Array<{ ratio: number; button: HTMLButtonElement }> = []
    const dimensionFields = element("div", "ss-expression-dimension-fields")
    const sliders: Array<{ axis: "width" | "height"; slider: HTMLInputElement; exact: HTMLInputElement }> = []
    const nearest64 = (value: number) => clamp(Math.round(value / 64) * 64, 64, 4096)
    const sizeChange = (axis: "width" | "height", value: number, snap: boolean) => {
      if (!Number.isFinite(value)) return
      const changed = clamp(snap ? nearest64(value) : Math.round(value), 64, 4096)
      const other: "width" | "height" = axis === "width" ? "height" : "width"
      generation.recipe[axis] = changed
      if (linkedSize) generation.recipe[other] = clamp(Math.round((axis === "width" ? changed / currentRatio : changed * currentRatio) / 8) * 8, 64, 4096)
      else currentRatio = getSize("width") / getSize("height")
      sync()
      saveSet()
    }
    for (const axis of axes) {
      const field = element("div", "ss-expression-dimension-field")
      const label = element("label", "", axis === "width" ? "Width" : "Height")
      const exact = element("input", "ss-input")
      exact.type = "number"
      exact.min = "64"
      exact.max = "4096"
      exact.step = "1"
      exact.setAttribute("aria-label", `${axis} in pixels`)
      label.append(exact, element("span", "ss-expression-unit", "px"))
      const slider = element("input")
      slider.type = "range"
      slider.min = "64"
      slider.max = "4096"
      slider.step = "64"
      slider.setAttribute("aria-label", `${axis} slider`)
      slider.addEventListener("input", () => sizeChange(axis, slider.valueAsNumber, true))
      // Do not alter the exact field while typing. Commit once the number is complete.
      exact.addEventListener("change", () => {
        if (!exact.value || !exact.checkValidity()) {
          exact.reportValidity()
          exact.value = String(getSize(axis))
          return
        }
        sizeChange(axis, exact.valueAsNumber, false)
      })
      exact.addEventListener("keydown", event => {
        if (event.key === "Enter") { event.preventDefault(); exact.blur() }
      })
      const sliderWrap = element("div", "ss-expression-dimension-range")
      sliderWrap.append(slider)
      field.append(label, sliderWrap)
      dimensionFields.append(field)
      sliders.push({ axis, slider, exact })
    }
    const linked = action("", () => {
      linkedSize = !linkedSize
      currentRatio = getSize("width") / getSize("height")
      sync()
    })
    linked.classList.add("ss-expression-size-link")
    linked.setAttribute("title", "Toggle linked dimensions")
    linked.setAttribute("aria-label", "Keep width and height at the current aspect ratio")
    linked.setAttribute("aria-pressed", String(linkedSize))
    linked.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13.5 14 9.5m-7.5 7h-1a4.5 4.5 0 0 1 0-9h3m7 0h3a4.5 4.5 0 0 1 0 9h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`
    dimensionFields.insertBefore(linked, dimensionFields.children[1])
    const sync = (updateExact = true) => {
      const width = getSize("width"), height = getSize("height")
      size.textContent = `${width} × ${height}`
      for (const { axis, slider, exact } of sliders) {
        const value = getSize(axis)
        slider.value = String(nearest64(value))
        slider.setAttribute("aria-valuetext", `${value} pixels`)
        if (updateExact || document.activeElement !== exact) exact.value = String(value)
      }
      linked.setAttribute("aria-pressed", String(linkedSize))
      linked.setAttribute("aria-label", linkedSize ? "Unlink width and height" : "Link width and height")
      for (const { ratio, button } of ratioButtons) {
        const active = Math.abs(width / height - ratio) < 0.018
        button.setAttribute("aria-pressed", String(active))
      }
    }
    for (const [label, ratio] of ratioChoices) {
      const button = action("", () => {
        const long = nearest64(Math.max(getSize("width"), getSize("height")))
        linkedSize = true
        currentRatio = ratio
        generation.recipe.width = ratio >= 1 ? long : Math.max(64, Math.round(long * ratio / 8) * 8)
        generation.recipe.height = ratio <= 1 ? long : Math.max(64, Math.round(long / ratio / 8) * 8)
        sync()
        saveSet()
      })
      button.classList.add("ss-expression-ratio-button")
      button.setAttribute("aria-label", `${label} aspect ratio`)
      const graphic = element("span", "ss-expression-ratio-shape")
      graphic.style.width = `${Math.round(ratio >= 1 ? 19 : 19 * ratio)}px`
      graphic.style.height = `${Math.round(ratio <= 1 ? 19 : 19 / ratio)}px`
      button.append(graphic, element("span", "", label))
      presets.append(button)
      ratioButtons.push({ button, ratio })
    }
    const tip = element("p", "ss-muted", "64 px slider increments · Link preserves the selected ratio. Unlink to resize freely.")
    const reset = action("Use inherited size", () => {
      delete generation.recipe.width
      delete generation.recipe.height
      currentRatio = getSize("width") / getSize("height")
      sync()
      saveSet()
    })
    reset.classList.add("ss-expression-inherited-size")
    canvas.append(head, presets, dimensionFields, tip, reset)
    sync()
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
    inlineEdit = null
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

  const stageHeadings = [
    ["01 / Build your set", "Expression gallery", "Choose expressions, refine their directions, and render or attach a saved portrait."],
    ["02 / Enhance", "Refine your portraits", "Enhance selected outputs with the active AI Upscale setup."],
    ["03 / Background removal", "Prepare clean cutouts", "Remove backgrounds from finished portraits, or skip this step."],
    ["04 / Publish expressions", "Ready for your character", "Review your expression names and send selected portraits to Lumiverse."],
  ] as const
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
    galleryHead.replaceChildren()
    if (loading) {
      controls.append(element("p", "ss-muted", "Loading your expression set…"))
      return
    }
    const selectable = stage === 0 ? rows : rows.filter(row => row.image)
    const selected = selectable.filter(row => row.selected)
    const ready = rows.filter(row => row.image).length
    const overview = element("div", "ss-expression-overview")
    const headingText = element("div", "ss-expression-overview-copy")
    headingText.append(element("small", "ss-expression-kicker", stageHeadings[stage][0]),
      element("h3", "", stageHeadings[stage][1]), element("p", "ss-muted", stageHeadings[stage][2]))
    const count = element("span", "ss-expression-count", `${ready} / ${rows.length} portraits · ${selected.length} selected`)
    overview.append(headingText, count)
    controls.append(overview)
    const config = element("div", "ss-expression-config")
    if (stage === 0) {
      const methodField = fields("Reference method", method)
      methodField.classList.add("ss-expression-config-method")
      const syncReference = () => {
        chooseReference.disabled = disabled || !method.value
        clearReference.disabled = disabled || !method.value
      }
      method.onchange = syncReference
      syncReference()
      referenceField.classList.add("ss-expression-config-reference")
      config.append(methodField, element("span", "ss-expression-config-divider"), referenceField, element("span", "ss-expression-config-divider"))
      const modelInfo = element("div", "ss-expression-config-model")
      modelInfo.append(element("small", "", "Checkpoint"), element("strong", "", options.model || "Current SwarmUI checkpoint"),
        element("span", "ss-muted", `${generation.recipe.width ?? options.inheritedRecipe.width ?? 768} × ${generation.recipe.height ?? options.inheritedRecipe.height ?? 768} · ${generation.recipe.steps ?? options.inheritedRecipe.steps ?? 24} steps`))
      config.append(modelInfo)
      const settings = action("Generation settings", () => {
        renderSettings()
        const { body, bottom } = openOverlay("Generation settings", "Shared rendering", true)
        body.append(settingsFields)
        bottom.append(action("Done", () => { closeOverlay(); render() }, true))
      })
      settings.classList.add("ss-expression-config-settings")
      config.append(settings)
    } else if (stage === 1) {
      const copy = element("div", "ss-expression-config-copy")
      copy.append(element("strong", "", "AI Upscale"), element("p", "ss-muted", loadingEnhance ? "Loading your enhancement setup…"
        : enhanceLoadFailed ? "Could not read upscale settings."
        : enhanceMode === "model" ? "Connected model enhancement" : enhanceMode ? "Resolution set by your saved workflow" : "Configure AI Upscale for this connection first."))
      config.append(copy)
      if (enhanceMode === "model") { enhanceFactor.disabled = disabled; config.append(enhanceFactorField) }
      if (enhanceLoadFailed) config.append(action("Retry", () => { enhanceMode = null; void loadEnhanceOptions() }))
    } else if (stage === 2) {
      config.append(fields("Background-removal workflow", backgroundMode))
      if (backgroundMode.value === "builtin") config.append(modelSetup)
      else if (backgroundMode.value === "custom") config.append(backgroundGraphField)
      else config.append(fields("Saved workflow", backgroundWorkflow), fields("Source image input", imageInput))
    } else {
      const destination = element("div", "ss-expression-config-copy")
      destination.append(element("strong", "", "Lumiverse character expressions"), element("p", "ss-muted", options.folder.name))
      const mapping = element("div", "ss-expression-naming")
      const example = element("code", "", "joy")
      const update = () => {
        const prefix = sendPrefix.value.trim()
        example.textContent = prefix ? `${prefix}-joy` : "joy"
        for (const target of cards.querySelectorAll<HTMLElement>("[data-expression-map-name]")) {
          target.textContent = prefix ? `${prefix}-${target.dataset.expressionMapName}` : String(target.dataset.expressionMapName || "")
        }
      }
      sendPrefix.oninput = update
      update()
      const exampleWrap = element("div", "ss-expression-naming-example")
      exampleWrap.append(element("span", "", "Naming example"), example)
      mapping.append(sendPrefixField, exampleWrap)
      config.append(destination, mapping)
    }
    controls.append(config)
    const toolbar = element("div", "ss-expression-gallery-toolbar")
    const left = element("div", "ss-expression-gallery-left")
    if (stage === 0) {
      const presets = element("div", "ss-expression-presets")
      const builtins = rows.slice(0, EXPRESSION_SPREAD.length)
      for (const [label, pairs] of [["Basics", EXPRESSION_BASICS], ["Full spread", EXPRESSION_SPREAD]] as const) {
        const inclusion = new Set<string>(pairs.map(([name]) => name))
        const button = action(label, () => {
          for (const row of builtins) row.selected = inclusion.has(row.label.toLowerCase())
          saveSet()
          render()
        })
        button.disabled = disabled
        button.dataset.expressionFocus = label
        button.setAttribute("aria-pressed", String(builtins.every(row => row.selected === inclusion.has(row.label.toLowerCase()))))
        presets.append(button)
      }
      left.append(presets)
    }
    const filters = element("div", "ss-expression-filters")
    for (const [value, caption] of [["all", "All"], ["selected", "Selected"], ["ready", "Ready"], ["empty", "Empty"]] as const) {
      const filterButton = action(caption, () => { inlineEdit = null; galleryFilter = value; render() })
      filterButton.disabled = disabled
      filterButton.dataset.expressionFocus = `filter-${value}`
      filterButton.setAttribute("aria-pressed", String(galleryFilter === value))
      filters.append(filterButton)
    }
    left.append(filters)
    const toggle = action(selected.length ? "Deselect all" : "Select all", () => {
      const value = !selectable.some(row => row.selected)
      for (const row of selectable) row.selected = value
      saveSet()
      render()
    })
    toggle.disabled = disabled || !selectable.length
    toggle.dataset.expressionFocus = "toggle-selection"
    const right = element("div", "ss-expression-gallery-right")
    right.append(element("span", "ss-expression-toolbar-count", `${selected.length} selected · ${selectable.length} available`))
    const view = action(previewMode === "portrait" ? "Full portrait" : "Face close-up", () => {
      previewMode = previewMode === "portrait" ? "closeup" : "portrait"
      render()
    })
    view.setAttribute("aria-pressed", String(previewMode === "closeup"))
    view.dataset.expressionFocus = "preview-mode"
    if (stage === 0) {
      const addButton = action("+ Add custom", openCustomSlot)
      addButton.disabled = disabled || !bankLoaded || rows.length >= EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT
      right.append(toggle, addButton)
      const bankButton = action(`Bank${bankLoaded ? ` · ${bank.length}` : ""}`, openBank)
      bankButton.disabled = disabled || !bankLoaded
      bankButton.dataset.expressionFocus = "bank"
      bankButton.setAttribute("aria-label", "Expression bank")
      right.append(bankButton)
    } else right.append(toggle)
    right.append(view)
    toolbar.append(left, right)
    galleryHead.append(toolbar)
    for (const control of [method, backgroundMode, backgroundWorkflow, imageInput, backgroundGraph, sendPrefix]) control.disabled = disabled
    installModel.disabled = disabled || Boolean(installTask)
    recheckModel.disabled = disabled || checkingModel || Boolean(installTask)
    const filterRows = selectable.filter(row => galleryFilter === "all" ? true
      : galleryFilter === "selected" ? row.selected
        : galleryFilter === "ready" ? Boolean(row.image) : !row.image)
    progressTiles.clear()
    const tiles = filterRows.map(row => {
      const card = element("article", "ss-expression-card")
      const isEditing = stage === 0 && inlineEdit?.row === row
      card.classList.toggle("ss-expression-card-editing", isEditing)
      card.dataset.selected = String(row.selected)
      card.dataset.state = row.state || (row.image ? "ready" : "empty")
      const cardHead = element("div", "ss-expression-card-head")
      const checkbox = element("input")
      checkbox.type = "checkbox"
      checkbox.checked = row.selected
      checkbox.disabled = disabled
      checkbox.dataset.expressionFocus = `select-${row.label}`
      checkbox.setAttribute("aria-label", `Select ${row.label}`)
      checkbox.addEventListener("change", () => {
        row.selected = checkbox.checked
        saveSet()
        render()
      })
      const label = element("label", "ss-expression-select")
      label.title = `Select ${row.label}`
      label.append(checkbox, element("span", "", "Select"))
      const chip = element("span", "ss-expression-state-label", row.state === "working" ? "Working" : row.state === "queued" ? "Queued" : row.state === "failed" ? "Failed" : row.image ? "Ready" : "Empty")
      cardHead.append(label, chip)
      const art = element("div", "ss-expression-art")
      const preview = element("div", "ss-expression-preview")
      preview.dataset.view = previewMode
      const image = element("img")
      if (row.image || row.state === "working") {
        image.alt = `${row.label} expression`
        image.loading = row.state === "working" ? "eager" : "lazy"
        if (row.image) image.src = row.image.url
        else image.hidden = true
        preview.append(image)
      } else preview.append(element("span", "ss-expression-placeholder", "Awaiting portrait"))
      if (row.image) {
        preview.classList.add("ss-expression-inspectable")
        preview.tabIndex = 0
        preview.setAttribute("role", "button")
        preview.setAttribute("aria-label", `Inspect ${row.label} image`)
        preview.addEventListener("click", () => openInspector(row))
        preview.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openInspector(row) } })
      }
      if (row.state) {
        const feedback = element("div", "ss-expression-tile-feedback")
        const caption = element("span", "", row.state === "queued" ? "Queued" : row.state === "failed" ? "Failed" : stage === 0 ? "Rendering…" : `${names[stage]}…`)
        feedback.append(caption)
        if (row.state === "working") {
          const bar = element("progress")
          bar.setAttribute("aria-label", `${row.label} progress`)
          progressTiles.set(row, { bar, caption, image })
          feedback.append(bar)
        }
        preview.append(feedback)
      }
      art.append(preview, cardHead)
      const body = element("div", "ss-expression-card-info")
      const bodyTitle = element("div", "ss-expression-card-title")
      bodyTitle.append(element("strong", "", row.label))
      if (stage === 0 && row.originalDirection && row.direction !== row.originalDirection) bodyTitle.append(element("span", "ss-expression-edited-tag", "Edited"))
      if (row.bankId && !EXPRESSION_SPREAD.some(([label]) => label === row.label.toLowerCase())) bodyTitle.append(element("span", "ss-expression-edited-tag", "Custom"))
      if (isEditing && inlineEdit) {
        // Keep the card's normal geometry: the edit panel rises into the lower
        // portion of its artwork rather than stretching its grid row downward.
        const editPanel = element("div", "ss-expression-card-edit-panel")
        editPanel.append(bodyTitle)
        const field = element("textarea", "ss-textarea ss-expression-card-editarea")
        field.value = inlineEdit.draft
        field.rows = 4
        field.maxLength = EXPRESSION_DIRECTION_LIMIT
        field.dataset.expressionFocus = `direction-${row.label}`
        field.dataset.expressionInlineEditor = row.label
        field.setAttribute("aria-label", `Generation direction for ${row.label}`)
        const tools = element("div", "ss-expression-card-edit-tools")
        const bankButton = action(inlineEdit.bankLabel ? `Banked: ${inlineEdit.bankLabel}` : "Save to bank", saveInlineToBank)
        bankButton.classList.add("ss-expression-card-bank")
        bankButton.disabled = !bankAvailable
        bankButton.title = bankAvailable ? "Save the current draft as an account-wide reusable template" : "Expression bank is unavailable"
        const restore = action("Restore default", () => {
          if (!inlineEdit || inlineEdit.row !== row) return
          inlineEdit.draft = defaultDirection(row)
          field.value = inlineEdit.draft
          restore.disabled = field.value === defaultDirection(row)
          field.focus({ preventScroll: true })
        })
        restore.classList.add("ss-expression-card-restore")
        restore.title = "Restore default direction (draft only until saved)"
        restore.setAttribute("aria-label", `Restore default direction for ${row.label}`)
        restore.replaceChildren()
        restore.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2.9 6.65"/><path d="M3 4v7h7"/></svg>'
        restore.disabled = field.value === defaultDirection(row)
        field.addEventListener("input", () => {
          if (inlineEdit?.row === row) inlineEdit.draft = field.value
          restore.disabled = field.value === defaultDirection(row)
        })
        field.addEventListener("keydown", event => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            commitInlineEdit()
          }
        })
        tools.append(bankButton, restore)
        editPanel.append(field, tools)
        body.append(editPanel)
      } else {
        body.append(bodyTitle)
        body.append(element("p", "ss-muted", stage === 0 ? row.direction : row.image ? `Output · ${row.image.id}` : "No output"))
      }
      if (stage === 3) {
        const mapping = element("div", "ss-expression-card-mapping")
        const outputName = element("code", "", sendPrefix.value.trim() ? `${sendPrefix.value.trim()}-${row.label}` : row.label)
        outputName.dataset.expressionMapName = row.label
        mapping.append(element("span", "", "Maps as"), outputName)
        body.append(mapping)
      }
      const cardActions = element("div", "ss-expression-card-actions")
      if (stage === 0) {
        if (isEditing) {
          const save = action("Save", commitInlineEdit, true)
          save.classList.add("ss-expression-card-edit")
          save.dataset.expressionFocus = "save-" + row.label
          const cancel = action("Cancel", cancelInlineEdit)
          cancel.classList.add("ss-expression-card-render")
          cardActions.append(save, cancel)
        } else {
        const edit = action("Edit", () => beginInlineEdit(row))
        edit.classList.add("ss-expression-card-edit")
        edit.dataset.expressionFocus = "edit-" + row.label
        edit.disabled = disabled
        cardActions.append(edit)
        // The narrow portrait cards cannot fit "Regenerate" beside Edit and Attach.
        const generate = runButton(row.image ? "Redo" : "Render", row, () => process([row], row), disabled)
        if (row.image) {
          generate.title = `Regenerate ${row.label} portrait`
          generate.setAttribute("aria-label", `Regenerate ${row.label} portrait`)
        }
        generate.classList.add("ss-expression-card-render")
        cardActions.append(generate)
        const saved = action("Attach saved image", () => options.pickImage("saved", row.image?.id || "", image => {
          if (row.image?.id === image.id) return
          setImage(row, image)
          row.state = undefined
          render()
        }))
        saved.classList.add("ss-expression-card-attach")
        saved.replaceChildren()
        saved.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>'
        saved.title = `Attach saved image to ${row.label}`
        saved.setAttribute("aria-label", `Attach saved image to ${row.label}`)
        saved.dataset.expressionFocus = "saved-image-" + row.label
        saved.setAttribute("aria-haspopup", "dialog")
        saved.disabled = disabled
        cardActions.append(saved)
        }
      } else if (row.image) cardActions.append(action("Inspect image", () => openInspector(row)))
      card.append(art, body, cardActions)
      return card
    })
    cards.replaceChildren(...(tiles.length ? tiles : [element("p", "ss-expression-empty-gallery", "No expressions match this filter. Try All slots or select a different preset.")]))
    actions.replaceChildren()
    if (stage < 3) {
      const customBackground = stage === 2 && backgroundMode.value === "custom"
      const canProcess = stage === 1 ? Boolean(enhanceMode) : stage !== 2 || (backgroundMode.value === "builtin" ? !installTask
        : customBackground ? Boolean(backgroundGraph.value.trim()) : Boolean(backgroundWorkflow.value && imageInput.value))
      const runSelected = runButton(`${names[stage]} selected`, "selected", () => process(selected, "selected"), disabled || !selected.length || !canProcess, true)
      const runAll = runButton(`${names[stage]} all`, "all", () => process(selectable, "all"), disabled || !selectable.length || !canProcess)
      if (customBackground) {
        runSelected.dataset.backgroundAction = selected.length ? "ready" : "empty"
        runAll.dataset.backgroundAction = selectable.length ? "ready" : "empty"
      }
      const failed = selectable.filter(row => row.state === "failed")
      const retry = runButton("Retry failed", "failed", () => process(failed, "failed"), disabled || !canProcess || !failed.length)
      const next = action("Next / Skip", () => changeStage(stage + 1))
      next.disabled = disabled
      actions.append(runSelected, runAll)
      if (failed.length || activeRun?.source === "failed") actions.append(retry)
      actions.append(next)
    } else {
      actions.append(runButton("Send selected", "send", publish, disabled || !selected.length, true))
    }
    status.textContent = `${selected.length} selected of ${rows.length} expressions · ${ready} ready`
    if (key) [...dialog.querySelectorAll<HTMLElement>("[data-expression-focus]")].find(node => node.dataset.expressionFocus === key)?.focus({ preventScroll: true })
  }
  const previousFocus = document.activeElement as HTMLElement | null
  dialog.addEventListener("cancel", event => {
    event.preventDefault()
    if (!overlay.hidden) closeOverlay()
    else if (inlineEdit) cancelInlineEdit()
    else void closeDialog()
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
    for (const { label, direction, bankId } of settings.slots) {
      const row = makeRow(label, direction, selected.has(label.toLowerCase()))
      row.bankId = bankId
      row.originalDirection = direction
      rows.push(row)
    }
    generation = settings.generation
    saved = JSON.stringify(getSettings())
    loading = false
    renderSettings()
    render()
  }
  void options.request("load_expression_bank", {}).then(value => {
    bank = cleanStudioExpressionBank(value)
    bankLoaded = true
    bankAvailable = true
    bankSnapshot = JSON.stringify(bank)
    if (!disposed) render()
  }, () => {
    bankLoaded = true
    bankAvailable = false
    if (!disposed) status.textContent = "Expression bank is unavailable; templates cannot be saved this session."
  })
  void options.request("load_expression_set", {}).then(value => {
    settingsAvailable = true
    useSet(value)
  }, () => {
    saveStatus.textContent = "Saved set unavailable. Changes apply to this session."
    useSet(null)
  })
  return dialog
}
