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

// Import external packs without trusting archive paths or requiring a third-party
// CDN. ZIP supports stored/deflated PNG/JPEG/WebP entries; caps prevent oversized
// or malformed archives from exhausting the browser. The caller saves images to
// the normal Lumiverse image API, never to an arbitrary filesystem path.
async function unpackExpressionImages(files: File[]): Promise<File[]> {
  const collected: File[] = []
  for (const file of files) {
    if (!/\.zip$/i.test(file.name)) { collected.push(file); continue }
    if (file.size > 100 * 1024 * 1024) throw new Error("Expression ZIP exceeds 100 MB. Split the pack first.")
    const buffer=await file.arrayBuffer(), bytes=new Uint8Array(buffer), view=new DataView(buffer)
    let end=-1
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break}
    if(end<0)throw new Error("Expression ZIP has no valid central directory.")
    const count=view.getUint16(end+10,true), offset=view.getUint32(end+16,true)
    if(count>256||offset>=bytes.length)throw new Error("Expression ZIP has too many entries or an invalid directory.")
    let pos=offset,total=0
    for(let i=0;i<count;i++){
      if(pos+46>bytes.length||view.getUint32(pos,true)!==0x02014b50)throw new Error("Expression ZIP contains a broken directory entry.")
      const flags=view.getUint16(pos+8,true),method=view.getUint16(pos+10,true),packed=view.getUint32(pos+20,true),size=view.getUint32(pos+24,true)
      const nameLen=view.getUint16(pos+28,true),extraLen=view.getUint16(pos+30,true),commentLen=view.getUint16(pos+32,true),local=view.getUint32(pos+42,true)
      if(pos+46+nameLen+extraLen+commentLen>bytes.length)throw new Error("Expression ZIP contains an invalid filename.")
      const filename=new TextDecoder().decode(bytes.subarray(pos+46,pos+46+nameLen));pos+=46+nameLen+extraLen+commentLen
      const basename=filename.split(/[\\/]/).pop()||""
      if(!/\.(png|jpe?g|webp)$/i.test(basename)||filename.includes('__MACOSX'))continue
      if((flags&1)||![0,8].includes(method)||packed===0xffffffff||size===0xffffffff||size>15*1024*1024)throw new Error("Unsupported or oversized expression ZIP entry: "+basename)
      total+=size
      if(total>120*1024*1024||collected.length>=64)throw new Error("Expression pack exceeds 64 images or 120 MB uncompressed.")
      if(local+30>bytes.length||view.getUint32(local,true)!==0x04034b50)throw new Error("Expression ZIP contains an invalid image record.")
      const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true)
      if(start+packed>bytes.length)throw new Error("Expression ZIP image data extends beyond the archive.")
      const chunk=bytes.slice(start,start+packed)
      let extracted: Uint8Array
      if(method===0)extracted=chunk
      else {
        try{
          // Modern Chromium has native raw DEFLATE. A clear error is preferable
          // to silently dropping compressed members on an older webview.
          let expanded=0
          const limited=new TransformStream<Uint8Array,Uint8Array>({transform(piece,controller){
            expanded+=piece.byteLength
            if(expanded>size||expanded>15*1024*1024)throw new Error('Archive entry expands beyond its declared size')
            controller.enqueue(piece)
          }})
          const stream=new Blob([chunk]).stream().pipeThrough(new DecompressionStream('deflate-raw')).pipeThrough(limited)
          extracted=new Uint8Array(await new Response(stream).arrayBuffer())
        }catch(error){
          if(error instanceof Error && /expands beyond/.test(error.message))throw error
          throw new Error("This webview cannot unpack this ZIP. Unzip the pack and select its images instead.")
        }
      }
      if(extracted.byteLength!==size)throw new Error("Expression ZIP image length mismatch: "+basename)
      const mime=/\.png$/i.test(basename)?'image/png':/\.webp$/i.test(basename)?'image/webp':'image/jpeg'
      collected.push(new File([new Uint8Array(extracted).buffer],basename,{type:mime}))
    }
  }
  if(collected.length>64)throw new Error("Select no more than 64 images per pack.")
  return collected
}

const EXPRESSION_BG_MODEL = "birefnet.safetensors"
const EXPRESSION_BG_MODEL_URL = "https://huggingface.co/Comfy-Org/BiRefNet/resolve/main/background_removal/" + EXPRESSION_BG_MODEL

async function installExpressionBackgroundModel(directory: FileSystemDirectoryHandle, signal: AbortSignal): Promise<boolean> {
  // Stability Matrix keeps shared weights in Models/BackgroundRemoval, while a
  // native ComfyUI checkout uses models/background_removal. Both are valid.
  const name = directory.name.toLowerCase()
  let destination = directory
  if (name === "models") {
    const existing = async (child: string): Promise<FileSystemDirectoryHandle | null> => {
      try { return await directory.getDirectoryHandle(child) }
      catch (error) {
        if (error instanceof DOMException && error.name === "NotFoundError") return null
        throw error
      }
    }
    const comfyFolder = await existing("background_removal")
    const matrixFolder = await existing("BackgroundRemoval")
    if (comfyFolder && matrixFolder) {
      throw new Error("Both background_removal and BackgroundRemoval exist. Select the exact destination folder to avoid installing to the wrong backend.")
    }
    if (comfyFolder || matrixFolder) destination = (comfyFolder || matrixFolder)!
    else if (directory.name === "models") {
      // Preserve the ComfyUI convenience flow for a fresh checkout.
      destination = await directory.getDirectoryHandle("background_removal", { create: true })
    } else {
      // A fresh Stability Matrix shared root is capitalized Models. Don't
      // silently create a Comfy-specific folder it won't register.
      throw new Error("Select the BackgroundRemoval folder inside Stability Matrix's shared Models directory (or create that folder first).")
    }
  } else if (name !== "background_removal" && name !== "backgroundremoval") {
    throw new Error("Choose ComfyUI's models/background_removal or Stability Matrix's Models/BackgroundRemoval folder.")
  }
  signal.throwIfAborted()
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
    cast?: StudioCastOpenOptions
    folder: OutputFolder
    family: string
    model: string
    workflows: SwarmWorkflowSummary[]
    inheritedRecipe: GenerationRecipe
    samplers: string[]
    schedulers: string[]
    presets?: SwarmPreset[]
    checkpoints?: CheckpointMetadata[]
    loras?: LoraMetadata[]
    stacks?: StackPreset[]
    deleteDrafts: boolean
    pickImage: (kind: "reference" | "saved", initialId: string, choose: (image: StudioExpressionImage) => void) => void
    request: (type: string, fields: Record<string, unknown>, progress?: StudioExpressionProgress, signal?: AbortSignal) => Promise<any>
    refresh: () => void
  },
): HTMLDialogElement {
  const binding = options.folder.binding
  const look = binding?.looks.find(item => item.id === binding.activeLookId)
  const inheritedIdentity = options.cast?.member.identityPrompt?.trim() || binding?.positivePrompt || ""
  const inheritedOutfit = options.cast?.wardrobeOutfit ?? look?.outfitPrompt ?? ""
  const inheritedNegative = [binding?.negativePrompt, look?.negativePrompt].filter(Boolean).join(", ")
  const stackMap = new Map<string, CastRecipeStackItem>()
  const enrichStack = (items: StackPresetItem[]): CastRecipeStackItem[] => items.map(item => ({...item, sourceUrl: item.sourceUrl || "", trigger: (item as CastRecipeStackItem).trigger || options.loras?.find(lora => normalizeModelName(lora.name) === normalizeModelName(item.name))?.triggerPhrase || ""}))
  for (const item of options.cast?.recipe?.stack || []) stackMap.set(item.name, {...item})
  for (const layer of [binding, look]) if (layer) for (const item of enrichStack(options.stacks?.find(preset => preset.id === layer.stackPresetId)?.items || layer.stackSnapshot || [])) stackMap.set(item.name,item)
  const inheritedStack = [...stackMap.values()]
  // These controls are workshop-local; an explicit empty value replaces inheritance.
  let renderOverrides: StudioExpressionWorkshop["overrides"] = structuredClone(options.cast?.member.settings?.workshop?.overrides || {})
  const effectiveModel = () => renderOverrides.checkpoint || options.model
  const effectiveFamily = () => renderOverrides.checkpoint ? inferModelFamily(effectiveModel(),options.checkpoints?.find(item=>normalizeModelName(item.name)===normalizeModelName(effectiveModel()))?.architecture||"") : options.family
  const effectiveStack = () => renderOverrides.stack ?? inheritedStack
  if (!binding && !options.cast) throw new Error("Choose a character folder.")
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
  headerCopy.append(element("small", "", (options.cast ? "Cast  /  " : "Output library  /  ") + options.folder.name), heading)
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
  const quickActions = element("div", "ss-expression-quick-actions")
  quickActions.setAttribute("role", "group")
  quickActions.setAttribute("aria-label", "Gallery quick actions")
  quickActions.hidden = true
  dialog.append(header, steps, scroll, quickActions, footer)
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
  let reference: StudioExpressionImage | null = options.cast?.member.referenceImageId ? { id: options.cast.member.referenceImageId, url: `/api/v1/images/${encodeURIComponent(options.cast.member.referenceImageId)}` } : null
  const referenceField = element("div", "ss-field ss-expression-reference")
  const referencePicture = element("span", "ss-expression-reference-picture")
  const referenceLabel = element("strong")
  const chooseReference = action("Choose reference output", () => options.pickImage("reference", reference?.id || "", image => { setReference(image); saveSet() }))
  chooseReference.classList.add("ss-expression-reference-button")
  chooseReference.setAttribute("aria-haspopup", "dialog")
  const clearReference = action(options.cast ? "Clear reference" : "Use look reference", () => { setReference(null); saveSet(); chooseReference.focus() })
  const setReference = (image: StudioExpressionImage | null) => {
    reference = image
    referenceLabel.textContent = image ? "Library image selected" : options.cast ? "Member appearance notes" : "Active look or folder"
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
  setReference(reference)
  const method = select([])
  const syncMethods = (initial = false) => {
    const family = effectiveFamily(), previous=method.value
    const adapter = family === "anima" ? "Anima Ref Adapter" : family === "illustrious" ? "IPAdapter PLUS" : ""
    method.replaceChildren(...(adapter ? [new Option(adapter,family)] : []),new Option("Prompt only",""))
    method.value = initial && !options.cast?.recipe && adapter ? family : previous===family&&adapter ? previous : ""
  }
  syncMethods(true)
  const storedMethod=options.cast?.member.settings?.workshop?.method
  if(storedMethod!==undefined&&[...method.options].some(option=>option.value===storedMethod))method.value=storedMethod
  const enhanceFactor = select([["2", "2×"], ["3", "3×"], ["4", "4×"]])
  const enhanceFactorField = fields("Output scale", enhanceFactor)
  const sendPrefix = element("input", "ss-input")
  sendPrefix.type = "text"
  sendPrefix.placeholder = "shoto"
  sendPrefix.value = options.cast?.member.prefix || ""
  const sendPrefixField = fields("Expression name prefix (optional)", sendPrefix)
  const sendPrefixExample = element("small", "ss-muted", "For example, shoto sends joy as shoto-joy.")
  sendPrefixExample.id = "ss-expression-prefix-example"
  sendPrefix.setAttribute("aria-describedby", sendPrefixExample.id)
  sendPrefixField.append(sendPrefixExample)
  let enhanceMode: "model" | "saved" | "custom" | "" | null = null
  let loadingEnhance = false
  let enhanceLoadFailed = false
  const upscaleHealth = createStudioWorkflowHealthRibbon({
    title: "Upscaler model",
    initialMessage: "Checking your active AI Upscale setup…",
    className: "ss-expression-upscale-check",
    onCheck: () => void checkUpscaleModel(),
  })
  const upscaleSetup = upscaleHealth.root
  let upscaleChecking = false
  let upscaleChecked = false
  const checkUpscaleModel = async () => {
    if (upscaleChecking || disposed) return
    upscaleChecking = true
    upscaleChecked = true
    upscaleHealth.setChecking(true)
    upscaleHealth.update("checking", "Checking the connected SwarmUI upscale model list…")
    let result: { status?: string; mode?: string; model?: string; available?: number } = {}
    try { result = await options.request("check_expression_upscale_model", {}) || {} }
    catch { result = { status: "unavailable" } }
    upscaleChecking = false
    if (disposed) return
    upscaleHealth.setChecking(false)
    const name = typeof result.model === "string" ? result.model : ""
    const description: Record<string, string> = {
      installed: `${name} is available on the connected SwarmUI backend.`,
      missing: `${name} is configured but not present in SwarmUI's reported upscale models. Check model paths and refresh or restart the backend.`,
      empty: "SwarmUI reports no upscale models. Check the model folder mapping, refresh or restart the backend, then check again.",
      unconfigured: "No AI upscaler is configured for this connection. Open AI Upscale on a saved output, choose a model and remember it.",
      workflow: result.mode === "saved"
        ? "A saved SwarmUI workflow is configured. Its nodes select the model; there is no single upscaler to check here."
        : "A custom ComfyUI graph is configured. Its nodes select the model; there is no single upscaler to check here.",
      unavailable: "Could not check the connected SwarmUI model list. Check your connection and CORS Proxy permission, then retry.",
    }
    const state = (result.status || "unavailable") as StudioWorkflowHealthState
    upscaleHealth.update(state, description[result.status || ""] || description.unavailable)
  }
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
      if (!disposed && stage === 1) {
        render()
        if (!upscaleChecked && !enhanceLoadFailed) void checkUpscaleModel()
      }
    }
  }
  const backgroundMode = select([["builtin", "Built-in · BiRefNet"], ["custom", "Custom graph"], ["saved", "Saved SwarmUI workflow"]])
  const backgroundWorkflow = select([["", "Choose a saved workflow"], ...options.workflows.map(item => [item.name, item.name] as [string, string])])
  const imageInput = select([])
  const inheritedBackground=options.cast?.recipe?.background
  if(inheritedBackground?.mode==="saved"){
    backgroundMode.value="saved"
    if(![...backgroundWorkflow.options].some(option=>option.value===inheritedBackground.workflow)){const option=element("option","",inheritedBackground.workflow);option.value=inheritedBackground.workflow;backgroundWorkflow.append(option)}
    backgroundWorkflow.value=inheritedBackground.workflow
    const option=element("option","",inheritedBackground.imageParam);option.value=inheritedBackground.imageParam;imageInput.append(option)
  }
  const despill = element("input");despill.type="checkbox"
  const despillLabel=element("label","ss-expression-checkline");despillLabel.append(despill,element("span","","Despill after background removal"))
  const despillColor=select([["green","Green screen"],["blue","Blue screen"]])
  const despillField=fields("Spill color",despillColor);despillField.hidden=true
  despill.addEventListener("change",()=>{despillField.hidden=!despill.checked})
  const despillControls=element("div","ss-expression-despill-controls")
  despillControls.append(despillLabel,despillField,element("small","ss-muted","Optional local edge cleanup (70% strength). Preserves transparency and the original cutout."))
  const backgroundGraph = element("textarea", "ss-textarea")
  backgroundGraph.rows = 5
  backgroundGraph.maxLength = 128_000
  backgroundGraph.placeholder = "Paste ComfyUI API JSON"
  const backgroundGraphField = fields("ComfyUI API graph", backgroundGraph)
  backgroundGraphField.classList.add("ss-expression-background-graph")
  const directoryPicker = (window as Window & { showDirectoryPicker?: (options: { mode: "readwrite" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker
  const installModel = action("Install on this device…", () => void hydrateModel())
  installModel.hidden = !directoryPicker
  const downloadModel = element("a", "ss-button", "Download weights")
  downloadModel.href = EXPRESSION_BG_MODEL_URL
  downloadModel.target = "_blank"
  downloadModel.rel = "noopener noreferrer"
  const backgroundHealth = createStudioWorkflowHealthRibbon({
    title: "BiRefNet model",
    initialMessage: "BiRefNet uses birefnet.safetensors.",
    className: "ss-expression-background-check",
    onCheck: () => void checkModel(),
    actionsBefore: [installModel],
    actionsAfter: [downloadModel],
    helpText: "Model folder · ComfyUI/models/background_removal or Stability Matrix/Models/BackgroundRemoval. Install on this device writes to the browser device, not a remote backend.",
  })
  const modelSetup = backgroundHealth.root
  const modelStatus = backgroundHealth.status
  const modelDetails = backgroundHealth.details
  const recheckModel = backgroundHealth.checkButton
  let installTask: AbortController | null = null
  let checkingModel = false
  let modelChecked = false
  const checkModel = async (fallback = "") => {
    if (checkingModel) return
    modelChecked = true
    checkingModel = true
    backgroundHealth.setChecking(true)
    backgroundHealth.update("checking", "Checking the connected ComfyUI model list…")
    let state = "unknown"
    try { state = (await options.request("check_expression_background_model", {}))?.status || "unknown" }
    catch { /* Direct Comfy access is optional on SwarmUI installations. */ }
    checkingModel = false
    recheckModel.disabled = busy || closing || Boolean(installTask)
    const messages: Record<string, string> = {
      installed: "BiRefNet is ready on the connected backend.",
      missing: "The connected ComfyUI backend doesn't see birefnet.safetensors yet. Check the shared-folder mapping, then refresh or restart that backend and check again.",
      unsupported: "Update the connected ComfyUI to a version with native BiRefNet nodes.",
      unknown: "Could not verify the model on this connection.",
    }
    backgroundHealth.update(
      (state in messages ? state : "unknown") as StudioWorkflowHealthState,
      (fallback && state !== "installed" ? fallback + " " : "") + (messages[state] || messages.unknown),
    )
    // Keep Check model reachable on success, just like the Upscaler ribbon.
    // Only installation/download help collapses when the weights are ready.
    if (state === "installed" && modelDetails.contains(document.activeElement) && document.activeElement !== recheckModel) {
      recheckModel.focus({ preventScroll: true })
    }
    backgroundHealth.setExtrasVisible(state !== "installed")
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
      result = installed ? "Weights downloaded to the selected folder." : "The weights already exist in the selected folder."
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

  const getSettings = ():StudioExpressionSet => ({
    ...(options.cast?{workshop:cleanExpressionWorkshop({overrides:renderOverrides,method:method.value})}:{}),
    generation: { ...generation, recipe: { ...generation.recipe } },
    selected: rows.filter(row => row.selected).map(row => row.label.toLowerCase()),
    slots: rows.map(({ label, direction, bankId }) => ({ label, direction, ...(bankId ? { bankId } : {}) })),
  })
  const saveCastImages = () => {
    if (!options.cast) return
    const member = options.cast.member
    member.settings = getSettings()
    member.referenceImageId = reference?.id || ""
    member.images = Object.fromEntries(rows.filter(row => row.image).map(row => [castExpressionKey(row.label).toLowerCase(), row.image!]))
    const captured=structuredClone(member)
    saveTask = saveTask.then(() => options.cast!.save(captured)).catch(error => {
      saved = ""
      saveStatus.textContent = error instanceof Error ? error.message : "Could not save Cast images. Close to retry."
    })
  }
  const setSnapshot = (settings: StudioExpressionSet) => JSON.stringify({ settings, ...(options.cast && { images: options.cast.member.images, referenceImageId: reference?.id || "" }) })
  const saveSet = () => {
    if (!settingsAvailable) return
    const settings = getSettings()
    if (options.cast) {
      options.cast.member.referenceImageId = reference?.id || ""
      options.cast.member.images = Object.fromEntries(rows.filter(row => row.image).map(row => [castExpressionKey(row.label).toLowerCase(), row.image!]))
    }
    const snapshot = setSnapshot(settings)
    if (snapshot === saved) return
    saved = snapshot
    const captured=options.cast?structuredClone({...options.cast.member,settings}):null
    saveStatus.textContent = "Saving set…"
    saveTask = saveTask.then(async () => {
      try {
        if (options.cast && captured) { options.cast.member.settings = settings; await options.cast.save(captured) }
        else await options.request("save_expression_set", { settings })
        if (saved === snapshot) saveStatus.textContent = "Set saved to your account"
      } catch {
        if (saved === snapshot) {
          saved = ""
          saveStatus.textContent = "Set could not be saved. Edit the set or close to retry."
        }
      }
    })
  }
  let nextWardrobe: {key:string;create?:CastNewWardrobe}|null=null
  const closeDialog = async () => {
    if (busy || closing) return
    closing = true
    if (dialog.contains(document.activeElement) && document.activeElement instanceof HTMLElement) document.activeElement.blur()
    saveSet()
    render()
    await Promise.all([saveTask, bankSaveTask])
    if (!disposed && dialog.open) {
      if (((settingsAvailable && !saved) || (bankAvailable && !bankSnapshot)) && (nextWardrobe||close.textContent !== "Close without saving")) {
        nextWardrobe=null
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
  const openOverlay = (title: string, kicker: string, wide = false, settings = false) => {
    if (overlay.hidden) overlayFocus = dialog.ownerDocument.activeElement as HTMLElement | null
    overlay.hidden = false
    overlayPanel.classList.toggle("ss-expression-overlay-wide", wide)
    overlay.classList.toggle("ss-expression-overlay-settings", settings)
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
  let settingsPage = "Rendering"
  const renderSettings = () => {
    const section = (number:string, title:string, description:string) => {
      const node=element("section","ss-expression-settings-section")
      node.append(element("small","ss-expression-kicker",number),element("strong","",title),element("p","ss-muted",description))
      return node
    }
    const identity = section("01 / Character", "Appearance & outfit", "Edit the subject prompt for this workshop. Blank is an intentional override. For different clothes, create a new appearance set to preserve the original artwork.")
    const identityInputs:HTMLTextAreaElement[]=[]
    for (const [key,label,value] of [["identity","Character positive prompt",inheritedIdentity],["outfit","Outfit prompt",inheritedOutfit],["identityNegative","Character / outfit negative",inheritedNegative]] as const) {
      const input=element("textarea","ss-textarea"); input.rows=3;input.maxLength=EXPRESSION_PROMPT_LIMIT;input.value=renderOverrides[key]??value
      input.addEventListener("input",()=>{renderOverrides[key]=input.value})
      identityInputs.push(input);identity.append(fields(label,input))
    }
    identity.append(action("Restore inherited appearance",()=>{delete renderOverrides.identity;delete renderOverrides.outfit;delete renderOverrides.identityNegative;[inheritedIdentity,inheritedOutfit,inheritedNegative].forEach((value,index)=>identityInputs[index].value=value)}))
    const modelSection=section("02 / Rendering","Checkpoint & canvas","Choose the checkpoint for this workshop. Reference adapters follow the selected model family.")
    const checkpoint=select([["",options.model?`Inherit · ${options.model}`:"Inherit checkpoint"],...[...new Set([...(renderOverrides.checkpoint?[renderOverrides.checkpoint]:[]),...(options.checkpoints||[]).map(item=>item.name)])].map(name=>[name,options.checkpoints?.find(item=>item.name===name)?.title||name] as [string,string])]);checkpoint.value=renderOverrides.checkpoint||""
    checkpoint.addEventListener("change",()=>{if(checkpoint.value)renderOverrides.checkpoint=checkpoint.value;else delete renderOverrides.checkpoint;syncMethods()})
    modelSection.append(fields("Checkpoint",checkpoint))
    const loraSection=section("03 / LoRAs","Expression stack","Copy a saved stack, add installed LoRAs, or edit the inherited stack. Changes only affect this workshop.")
    const stackSource=select([["","Copy a saved stack…"],...(options.stacks||[]).map(item=>[item.id,item.name] as [string,string])]);
    const stackRows=element("div","ss-expression-lora-rows")
    const loraOptions=select([["","Add installed LoRA…"],...(options.loras||[]).map(item=>[item.name,item.title||item.name] as [string,string])]);
    const stackState=element("small","ss-muted")
    const editableStack=()=>renderOverrides.stack??(renderOverrides.stack=structuredClone(inheritedStack))
    const renderStack=()=>{
      stackState.textContent=`${renderOverrides.stack===undefined?"Inherited":"Workshop override"} · ${effectiveStack().filter(item=>item.enabled).length} enabled`
      stackRows.replaceChildren(...effectiveStack().map((item,index)=>{
        const row=element("div","ss-expression-lora-row"),head=element("div","ss-expression-lora-head")
        const enabled=element("input");enabled.type="checkbox";enabled.checked=item.enabled!==false;enabled.setAttribute("aria-label",`Enable ${item.name}`)
        enabled.addEventListener("change",()=>{editableStack()[index].enabled=enabled.checked;stackState.textContent=`Workshop override · ${effectiveStack().filter(item=>item.enabled).length} enabled`})
        const label=element("label","ss-expression-checkline");label.append(enabled,element("span","",item.title||item.name));head.append(label,action("Remove",()=>{editableStack().splice(index,1);renderStack()}))
        const weight=element("input","ss-input");weight.type="number";weight.min="-10";weight.max="10";weight.step="0.05";weight.value=String(item.weight)
        weight.addEventListener("change",()=>{if(Number.isFinite(weight.valueAsNumber)){editableStack()[index].weight=clamp(weight.valueAsNumber,-10,10);weight.value=String(editableStack()[index].weight)}else weight.value=String(effectiveStack()[index].weight);stackState.textContent="Workshop override"})
        const trigger=element("input","ss-input");trigger.value=item.trigger||"";trigger.maxLength=1000;trigger.placeholder="Optional trained trigger"
        trigger.addEventListener("input",()=>{editableStack()[index].trigger=trigger.value;stackState.textContent="Workshop override"})
        const use=element("input");use.type="checkbox";use.checked=item.useTrigger;use.addEventListener("change",()=>{editableStack()[index].useTrigger=use.checked;stackState.textContent="Workshop override"})
        const triggerLabel=element("label","ss-expression-checkline");triggerLabel.append(use,element("span","","Use trigger"))
        const values=element("div","ss-expression-lora-values");values.append(fields("Weight",weight),fields("Trigger text",trigger))
        row.append(head,values,triggerLabel);return row
      }))
      if(!effectiveStack().length)stackRows.append(element("p","ss-muted","No LoRAs selected."))
    }
    stackSource.addEventListener("change",()=>{const preset=options.stacks?.find(item=>item.id===stackSource.value);if(preset){renderOverrides.stack=enrichStack(preset.items);renderStack()}stackSource.value=""})
    loraOptions.addEventListener("change",()=>{const lora=options.loras?.find(item=>item.name===loraOptions.value);if(lora&&!effectiveStack().some(item=>normalizeModelName(item.name)===normalizeModelName(lora.name))&&effectiveStack().length<64){editableStack().push({name:lora.name,title:lora.title,weight:lora.defaultWeight??1,enabled:true,useTrigger:false,trigger:lora.triggerPhrase||"",sourceUrl:lora.sourceUrl||""});renderStack()}loraOptions.value=""})
    const stackActions=element("div","ss-expression-stack-actions");stackActions.append(action("Clear stack",()=>{renderOverrides.stack=[];renderStack()}),action("Restore inherited stack",()=>{delete renderOverrides.stack;renderStack()}))
    loraSection.append(fields("Saved stack",stackSource),fields("Installed LoRAs",loraOptions),stackState,stackRows,stackActions);renderStack()
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
      if (key === "prefix") mountExpressionPrefixPresets(input, options.presets || [], saveSet)
    }
    const renderFields = element("div", "ss-expression-render-fields")
    const promptSection=section("04 / Shared prompts","Framing & style","Applied to every expression, in addition to the character identity and individual expression direction.")
    promptSection.append(prompts)
    renderFields.append(parameters)
    // Keep canvas and sampling together while separating identity and stack.
    modelSection.append(renderCanvasSettings(),renderFields)
    const sections = [["Character",identity],["Rendering",modelSection],["LoRAs",loraSection],["Style",promptSection]] as const
    const navigation=element("nav","ss-expression-settings-nav")
    navigation.setAttribute("aria-label","Generation settings sections")
    const buttons=sections.map(([name])=>action(name,()=>{settingsPage=name;syncPage()}))
    const syncPage=()=>{sections.forEach(([name,node],index)=>{node.hidden=name!==settingsPage;buttons[index].setAttribute("aria-pressed",String(name===settingsPage))})}
    navigation.append(...buttons);syncPage()
    settingsFields.replaceChildren(navigation,...sections.map(([,node])=>node),
      element("p", "ss-muted", "Character, checkpoint and LoRA overrides are local to this workshop. Cast workshops remember them per appearance set; the album recipe, identity and linked folder remain unchanged."))
  }
  const created = new Set<string>()
  let stage = 0
  let busy = false
  let activeRun: { source: StudioExpressionAction; controller: AbortController } | null = null
  let disposed = false
  const names = ["Generate", "Enhance", "Remove background", options.cast ? "Save to cast member" : "Send to Lumiverse"]
  const setImage = (row: typeof rows[number], image: StudioExpressionImage) => {
    if (row.image && created.has(row.image.id)) row.drafts.add(row.image.id)
    created.add(image.id)
    row.image = image
    saveCastImages()
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
      if (!disposed) { const feedback = status.textContent; render(); if (feedback) status.textContent = feedback }
    }
  }
  const importExpressionPack = (): void => {
    if(busy||disposed||closing)return
    const input=document.createElement('input')
    input.type='file';input.multiple=true;input.accept='.zip,image/png,image/jpeg,image/webp';input.hidden=true
    dialog.append(input) // Top-layer dialogs make detached file inputs inert.
    input.addEventListener('cancel',()=>input.remove(),{once:true})
    input.addEventListener('change',()=>{
      const chosen=Array.from(input.files||[]);input.remove()
      if(!chosen.length)return
      void run(async signal=>{
        const files=await unpackExpressionImages(chosen)
        if(!files.length)throw new Error('No PNG, JPEG or WebP expressions found in this pack.')
        let imported=0,skipped=0,failed=0
        for(const file of files){
          if(signal.aborted)break
          const basename=file.name.split(/[\\/]/).pop()||''
          if(!/\.(png|jpe?g|webp)$/i.test(basename)||file.size>15*1024*1024||file.size===0){skipped++;continue}
          let name=basename.replace(/\.(png|jpe?g|webp)$/i,'')
          const prefix=options.cast?.member.prefix||sendPrefix.value.trim()
          if(prefix&&name.toLowerCase().startsWith(prefix.toLowerCase()+'-'))name=name.slice(prefix.length+1)
          const label=cleanExpressionLabel(name),key=castExpressionKey(label).toLowerCase()
          if(!label||!castKey(key)){skipped++;continue}
          let row=rows.find(item=>castExpressionKey(item.label).toLowerCase()===key)
          // Never replace an established expression from an external pack.
          if(row?.image){skipped++;continue}
          if(!row&&rows.length>=EXPRESSION_SPREAD.length+EXPRESSION_CUSTOM_LIMIT){skipped++;continue}
          const form=new FormData();form.append('image',file)
          try{
            const response=await fetch('/api/v1/images',{method:'POST',credentials:'same-origin',body:form,signal})
            const data=await response.json()
            if(!response.ok||!castKey(data.id))throw new Error(data.error||'Upload failed')
            if(!row){row=makeRow(label,'',true);rows.push(row)}
            row.image={id:data.id,url:'/api/v1/images/'+encodeURIComponent(data.id)}
            row.selected=true;created.add(data.id);imported++
            status.textContent=`Importing pack: ${imported} saved, ${skipped} skipped, ${failed} failed…`
          }catch(error){if(signal.aborted)break;failed++;status.textContent=`Couldn't upload ${basename}: ${error instanceof Error?error.message:String(error)}`}
        }
        if (imported) {
          galleryFilter = 'ready'
          if (options.cast) {
            // Uploading an image is NOT the same as attaching it to this Cast
            // member. Commit one atomic member snapshot and wait for the backend
            // acknowledgement before claiming the pack was imported.
            const member = options.cast.member
            member.images = Object.fromEntries(rows.filter(row => row.image).map(row => [castExpressionKey(row.label).toLowerCase(), row.image!]))
            member.settings = getSettings()
            member.referenceImageId = reference?.id || ''
            saveStatus.textContent = `Saving ${imported} uploaded expressions to Cast…`
            const operation = saveTask.catch(() => {}).then(() => options.cast!.save(structuredClone(member)))
            // Keep the general Studio close/save queue usable even if this
            // explicit import transaction fails. The importer itself observes
            // the unhandled operation below and reports the failed save.
            saveTask = operation.catch(() => {})
            try {
              await operation
              saved = setSnapshot(getSettings())
            } catch (error) {
              saved = ''
              const reason = error instanceof Error ? error.message : String(error)
              saveStatus.textContent = `${imported} files uploaded, but Cast could not save their assignments: ${reason}`
              throw new Error(`Images uploaded but NOT attached to this Cast member. ${reason} Close and retry saving before reimporting.`)
            }
          } else {
            saveSet()
            await saveTask
          }
        }
        const summary=`Pack import: ${imported} attached · ${skipped} skipped (duplicates / limit / invalid) · ${failed} failed.`
        saveStatus.textContent=summary;status.textContent=summary
      })
    },{once:true})
    input.click()
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
  // Reuse the local editor algorithm on the original, account-scoped cutout,
  // not a gallery thumbnail. Save a derivative only if a pixel actually changes.
  const finishDespill = async (image:StudioExpressionImage,label:string,channel:"green"|"blue",signal:AbortSignal):Promise<StudioExpressionImage> => {
    const response=await fetch(`/api/v1/images/${encodeURIComponent(image.id)}`,{credentials:"same-origin",redirect:"error",signal})
    if(!response.ok)throw new Error("Could not read the original cutout for despill.")
    const blob=await response.blob();signal.throwIfAborted()
    if(blob.size>50*1024*1024)throw new Error("Cutout exceeds the local editor's 50 MB input limit.")
    const bitmap=await createImageBitmap(blob)
    try{
      const w=bitmap.width,h=bitmap.height
      if(!w||!h||w*h>EDIT_MAX_PIXELS||Math.max(w,h)>EDIT_MAX_SIDE)throw new Error("Cutout exceeds the local editor's resolution limit.")
      const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h
      const ctx=canvas.getContext("2d",{willReadFrequently:true});if(!ctx)throw new Error("Could not initialize local despill.")
      ctx.drawImage(bitmap,0,0);const pixels=ctx.getImageData(0,0,w,h)
      if(!editDespill(pixels.data,w,h,new Uint8Array(w*h),channel,.7))return image
      ctx.putImageData(pixels,0,0);signal.throwIfAborted()
      const png=canvas.toDataURL("image/png");if(png.length>7_500_000)throw new Error("Despill output exceeds the upload limit; open the cutout in Edit to finish manually.")
      // An upload already dispatched may complete even after Stop. Preserve the
      // returned derivative instead of losing the saved result.
      return await options.request("save_local_edit",{png,sourceId:image.id,label:`${options.folder.name} ${label} despill`})
    }finally{bitmap.close()}
  }
  const process = (targets: StudioExpressionRow[], source: StudioExpressionAction) => {
    if (!targets.length || busy || closing) return
    saveSet()
    const previouslyFailed = new Set(targets.filter(row => row.state === "failed"))
    for (const row of targets) row.state = "queued"
    void run(async signal => {
      if (options.cast) await saveTask
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
                model: options.model, direction: row.direction, family: method.value, referenceId: method.value ? reference?.id || "" : "", generation, renderOverrides: structuredClone(renderOverrides),
              }, progress, signal)
            : await options.request("process_folder_expression", { imageId: row.image?.id,
                action: stage === 1 ? "enhance" : "remove-background",
                ...(stage === 1 && enhanceMode === "model" && { factor: Number(enhanceFactor.value) }),
                ...(stage === 2 && { backgroundMode: backgroundMode.value, graph: backgroundGraph.value,
                  workflow: backgroundWorkflow.value, imageParam: imageInput.value }) }, progress, signal)
          if(stage===2&&despill.checked){
            status.textContent=`Despill · ${row.label} · ${index+1} of ${targets.length}`
            const tile=progressTiles.get(row);if(tile)tile.caption.textContent="Cleaning color spill…"
            try{
              const cleaned=await finishDespill(image,row.label,despillColor.value==="blue"?"blue":"green",signal)
              if(cleaned.id!==image.id){created.add(image.id);row.drafts.add(image.id)}
              setImage(row,cleaned)
            }catch(error){
              // A failed optional local pass must never discard a usable cutout.
              setImage(row,image)
              throw new Error(`Cutout saved; despill ${signal.aborted?"stopped":"failed"}. ${signal.aborted?"":""+(error instanceof Error?error.message:String(error))}`)
            }
          }else setImage(row, image)
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
    if (options.cast) {
      if (prefix && !castKey(prefix)) throw new Error("Use a prefix with letters, numbers, underscores, or hyphens.")
      await saveTask
      Object.assign(options.cast.member, { settings: getSettings(), referenceImageId: reference?.id || "", prefix: prefix || options.cast.member.prefix, images: Object.fromEntries(rows.filter(row => row.image).map(row => [castExpressionKey(row.label).toLowerCase(), row.image!])) })
      await options.cast.save(structuredClone(options.cast.member))
      status.textContent = `Saved ${Object.keys(options.cast.member.images).length} expressions to ${options.cast.member.name}.`
      return
    }
    const mappings = Object.fromEntries(ready.map(row => [prefix ? prefix + "-" + row.label : row.label, row.image!.id]))
    status.textContent = "Sending selected expressions to Lumiverse…"
    const images = ready.map(row => row.image!.id)
    const linked = await studioCharacterImageAction(binding!.characterId, images, "gallery", fetch, signal)
    signal.throwIfAborted()
    if (linked.failed.length) throw new Error("Some outputs could not be linked to the gallery. Retry Send selected.")
    const response = await fetch(`/api/v1/characters/${encodeURIComponent(binding!.characterId)}/expressions/from-gallery`, {
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
    syncQuickActions()
  }

  const stepButtons = names.map((name, index) => {
    const button = action(name, () => changeStage(index))
    button.classList.add("ss-expression-step")
    const number = element("span", "ss-expression-step-number", String(index + 1))
    number.setAttribute("aria-hidden", "true")
    const full=element("span","ss-expression-stage-full",name)
    button.setAttribute("aria-label",name)
    button.replaceChildren(number,full)
    return button
  })
  steps.append(...stepButtons)
  const syncQuickActions = () => {
    // Show only once the original gallery actions are above the scrollport.
    const offscreen = galleryHead.getBoundingClientRect().bottom <= scroll.getBoundingClientRect().top + 1
    quickActions.hidden = loading || !dialog.open || !offscreen || !quickActions.childElementCount
  }
  scroll.addEventListener("scroll", syncQuickActions, { passive: true })
  const quickResize = typeof ResizeObserver === "function" ? new ResizeObserver(syncQuickActions) : null
  quickResize?.observe(scroll)
  quickResize?.observe(galleryHead)
  const openGenerationSettings = () => {
    renderSettings()
    const { body, bottom } = openOverlay("Generation settings", "Shared rendering", false, true)
    body.append(settingsFields)
    bottom.append(action("Done", () => { closeOverlay(); saveSet(); render() }, true))
  }
  const quickAction = (label: string, short: string, path: string, callback: () => void, disabled: boolean) => {
    const button = action(label, callback)
    button.setAttribute("aria-label", label)
    button.title = label
    button.dataset.expressionFocus = `quick-${short}`
    button.disabled = disabled
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
    button.append(element("span", "ss-expression-quick-label", short))
    return button
  }

  const switchSheet=(key:string,create?:CastNewWardrobe)=>{
    if(busy||closing||loading||!options.cast?.switchWardrobe)return
    if(inlineEdit)commitInlineEdit()
    nextWardrobe={key,create};void closeDialog()
  }
  const openWardrobeCreator=()=>{
    if(busy||closing||!options.cast?.switchWardrobe)return
    const {body,bottom}=openOverlay("New appearance set","Wardrobe")
    const name=element("input","ss-input");name.maxLength=80;name.placeholder="e.g. Sleepwear"
    const outfit=element("textarea","ss-textarea");outfit.rows=3;outfit.maxLength=4000;outfit.placeholder="Clothing, accessories…"
    const mode=select([["fresh","Fresh sheet · inherit expressions & Cast recipe"],["settings","Copy workshop settings · no artwork"],["copy","Duplicate sheet · keep artwork"]])
    const ref=element("input");ref.type="checkbox";const refLabel=element("label","ss-expression-checkline");refLabel.append(ref,element("span","","Inherit reference image (only if appropriate for the new outfit)"))
    mode.onchange=()=>{if(mode.value!=="fresh"&&!outfit.value)outfit.value=renderOverrides.outfit??inheritedOutfit}
    const note=element("p","ss-muted","New sets are independent. Existing artwork and the story's wardrobe packets remain unchanged.")
    body.append(fields("Outfit name",name),fields("Outfit prompt",outfit),fields("Starting point",mode),refLabel,note)
    bottom.append(action("Create appearance set",()=>{
      const key=castExpressionKey(name.value).toLowerCase().slice(0,40)
      if(!castKey(key)||options.cast!.wardrobeChoices?.some(row=>row.key===key)){note.textContent="Choose a unique outfit name.";name.focus();return}
      closeOverlay();switchSheet(key,{name:name.value,outfit:outfit.value,mode:mode.value as CastNewWardrobe["mode"],inheritReference:ref.checked})
    },true))
  }
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
    quickActions.replaceChildren()
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
    if(options.cast?.switchWardrobe&&options.cast.wardrobeChoices){
      const shelf=element("section","ss-expression-wardrobe-shelf"),copy=element("div","ss-expression-wardrobe-copy")
      copy.append(element("small","ss-expression-kicker","Appearance set"),element("strong","",options.cast.wardrobeName||"Original outfit"),element("p","ss-muted",`${ready} portraits · independent workshop`))
      const picker=select(options.cast.wardrobeChoices.map(row=>[row.key,`${row.name} · ${row.key===(options.cast!.wardrobeKey||"default")?ready:row.ready} ready`]))
      picker.setAttribute("aria-label","Appearance set");picker.value=options.cast.wardrobeKey||"default";picker.disabled=disabled;picker.onchange=()=>switchSheet(picker.value)
      const create=action("+ New set",openWardrobeCreator);create.disabled=disabled||options.cast.wardrobeChoices.length>=CAST_WARDROBE_LIMIT
      const row=element("div","ss-expression-wardrobe-actions");row.append(picker,create);shelf.append(copy,row);controls.append(shelf)
    }
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
      modelInfo.append(element("small", "", `${renderOverrides.stack!==undefined||renderOverrides.checkpoint?"Workshop override":options.cast?.recipe?"Cast Recipe":"Checkpoint"} · ${effectiveStack().filter(item=>item.enabled).length} LoRAs`), element("strong", "", effectiveModel() || "Current SwarmUI checkpoint"),
        element("span", "ss-muted", `${generation.recipe.width ?? options.inheritedRecipe.width ?? 768} × ${generation.recipe.height ?? options.inheritedRecipe.height ?? 768} · ${generation.recipe.steps ?? options.inheritedRecipe.steps ?? 24} steps`))
      config.append(modelInfo)
      const settings = action("Generation settings", openGenerationSettings)
      settings.disabled = disabled
      settings.classList.add("ss-expression-config-settings")
      config.append(settings)
    } else if (stage === 1) {
      const copy = element("div", "ss-expression-config-copy")
      copy.append(element("strong", "", "AI Upscale"), element("p", "ss-muted", loadingEnhance ? "Loading your enhancement setup…"
        : enhanceLoadFailed ? "Could not read upscale settings."
        : enhanceMode === "model" ? "Connected model enhancement" : enhanceMode ? "Resolution set by your saved workflow" : "Configure AI Upscale for this connection first."))
      config.append(copy, upscaleSetup)
      if (enhanceMode === "model") { enhanceFactor.disabled = disabled; config.append(enhanceFactorField) }
      if (enhanceLoadFailed) config.append(action("Retry", () => {
        enhanceMode = null
        upscaleChecked = false
        void loadEnhanceOptions()
      }))
    } else if (stage === 2) {
      config.append(fields("Background-removal workflow", backgroundMode))
      if (backgroundMode.value === "builtin") config.append(modelSetup)
      else if (backgroundMode.value === "custom") config.append(backgroundGraphField)
      else config.append(fields("Saved workflow", backgroundWorkflow), fields("Source image input", imageInput))
      config.append(despillControls)
    } else {
      const destination = element("div", "ss-expression-config-copy")
      destination.append(element("strong", "", options.cast ? "Cast member expressions" : "Lumiverse character expressions"), element("p", "ss-muted", options.folder.name))
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
    const setSelection = (value: boolean) => {
      if (busy || closing) return
      for (const row of selectable) row.selected = value
      saveSet()
      render()
    }
    const toggle = action(selected.length ? "Deselect all" : "Select all", () => setSelection(!selected.length))
    const quickCount = element("span", "ss-expression-quick-count", `${selected.length}/${selectable.length}`)
    quickCount.title = `${selected.length} selected of ${selectable.length} available`
    quickActions.append(quickCount,
      quickAction("Select all expressions", "Select all", '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>', () => setSelection(true), disabled || !selectable.length || selected.length === selectable.length),
      quickAction("Deselect all expressions", "Deselect all", '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m9 9 6 6m0-6-6 6"/>', () => setSelection(false), disabled || !selected.length))
    if (stage === 0) quickActions.append(
      quickAction("Add custom expression", "Custom", '<path d="M12 5v14M5 12h14"/>', openCustomSlot, disabled || !bankLoaded || rows.length >= EXPRESSION_SPREAD.length + EXPRESSION_CUSTOM_LIMIT),
      quickAction("Open generation settings", "Settings", '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="var(--ss-panel-bg)"/><circle cx="16" cy="17" r="3" fill="var(--ss-panel-bg)"/>', openGenerationSettings, disabled))
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
      const importButton=action("Import pack",importExpressionPack)
      importButton.disabled=disabled
      importButton.dataset.expressionFocus="import-pack"
      importButton.setAttribute("aria-label","Import expression pack ZIP or multiple images")
      importButton.title="Add PNG, JPEG or WebP images, or a ZIP pack. Existing labels are never overwritten."
      right.append(importButton)
      const bankButton = action(`Bank${bankLoaded ? ` · ${bank.length}` : ""}`, openBank)
      bankButton.disabled = disabled || !bankLoaded
      bankButton.dataset.expressionFocus = "bank"
      bankButton.setAttribute("aria-label", "Expression bank")
      right.append(bankButton)
    } else right.append(toggle)
    right.append(view)
    toolbar.append(left, right)
    galleryHead.append(toolbar)
    for (const control of [method, backgroundMode, backgroundWorkflow, imageInput, backgroundGraph, despill, despillColor, sendPrefix]) control.disabled = disabled
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
        if(options.cast?.switchWardrobe&&row.image){
          const alt=action("+ Alt",()=>{
            const label=expressionAlternateLabel(row.label,rows.map(item=>item.label));if(addCustomSlot(label,row.direction)){const added=rows.find(item=>item.label===label);if(added){beginInlineEdit(added);requestAnimationFrame(()=>cards.querySelector(`[data-expression-inline-editor="${label}"]`)?.scrollIntoView({block:"nearest"}))}}
          });alt.title="Create an independent alternate expression slot";alt.setAttribute("aria-label",`Add alternate for ${row.label}`);alt.disabled=disabled||rows.length>=EXPRESSION_SPREAD.length+EXPRESSION_CUSTOM_LIMIT;alt.classList.add("ss-expression-card-alt");cardActions.append(alt)
        }
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
      actions.append(runButton(options.cast ? "Save to cast member" : "Send selected", "send", publish, disabled || (options.cast ? !rows.some(row => row.image) : !selected.length), true))
    }
    status.textContent = `${selected.length} selected of ${rows.length} expressions · ${ready} ready`
    syncQuickActions()
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
    quickResize?.disconnect()
    installTask?.abort()
    activeRun?.controller.abort()
    dialog.remove()
    previousFocus?.focus({ preventScroll: true })
    options.refresh()
    if(nextWardrobe&&options.cast?.switchWardrobe){const next=nextWardrobe;nextWardrobe=null;void options.cast.switchWardrobe(next.key,next.create)}
  }, { once: true })
  render()
  root.append(dialog)
  dialog.showModal()
  const useSet = (value: unknown) => {
    if (disposed || !dialog.open) return
    const settings = cleanStudioExpressionSet(value)
    const selected = new Set(settings.selected)
    if (options.cast) for (const label of Object.keys(options.cast.member.images)) {
      if (!settings.slots.some(slot => castExpressionKey(slot.label).toLowerCase() === label)) settings.slots.push({ label, direction: "" })
    }
    for (const { label, direction, bankId } of settings.slots) {
      const row = makeRow(label, direction, selected.has(label.toLowerCase()))
      row.bankId = bankId
      row.originalDirection = direction
      row.image = options.cast?.member.images[castExpressionKey(label).toLowerCase()] || null
      rows.push(row)
    }
    generation = options.cast?.recipe&&!settings.workshop?{...castRecipeGeneration(options.cast.recipe),recipe:{...options.inheritedRecipe,...options.cast.recipe.generation.recipe}}:settings.generation
    saved = setSnapshot(getSettings())
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
  void (options.cast ? Promise.resolve(options.cast.member.settings) : options.request("load_expression_set", {})).then(value => {
    settingsAvailable = true
    useSet(value)
  }, () => {
    saveStatus.textContent = "Saved set unavailable. Changes apply to this session."
    useSet(null)
  })
  return dialog
}
