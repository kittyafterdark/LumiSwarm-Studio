interface StudioInpaintEdit {
  sourceImageId: string
  source: string
  mask: string
  prompt: string
  denoise: number
  feather: number
  settings: "source" | "studio"
  width: number
  height: number
}

interface StudioInpaintSession {
  dialog: HTMLDialogElement
  progress: (message: string, preview?: string) => void
  finish: (message: string, result?: string, resultId?: string) => void
  stopFailed: (message: string) => void
}

function openStudioInpaint(
  root: HTMLElement,
  image: CurrentImage & { id: string },
  sourcePrompt: string,
  submit: (edit: StudioInpaintEdit) => boolean,
  stop: () => void,
  replace?: (imageId: string) => Promise<void>,
  acceptLabel?: string,
  initialSelection?: {width:number;height:number;mask:Uint8Array},
): StudioInpaintSession {
  const dialog = element("dialog", "ss-inpaint-dialog")
  const title = element("h2", "", "Edit region")
  title.id = "ss-inpaint-title"
  dialog.setAttribute("aria-labelledby", title.id)
  const button = (label: string, className = "ss-button") => {
    const control = element("button", className, label)
    control.type = "button"
    return control
  }
  const close = button("×", "ss-icon-button")
  close.setAttribute("aria-label", "Close region editor")
  close.addEventListener("click", () => dialog.close())
  const header = element("header", "ss-inpaint-header")
  const heading = element("div", "ss-inpaint-heading")
  heading.append(element("span", "ss-inpaint-eyebrow", "Studio / Image tools / Inpaint"), title)
  header.append(heading, close)

  const status = element("p", "ss-muted ss-tiny", "Loading image…")
  status.setAttribute("role", "status")
  const help = element("p", "ss-muted ss-tiny", "Paint over the area to change. With the canvas focused, use the arrow keys to move and Space to paint or erase.")
  help.id = "ss-inpaint-help"
  const stage = element("div", "ss-inpaint-stage")
  const viewport = element("div", "ss-inpaint-viewport")
  const surface = element("div", "ss-inpaint-surface")
  surface.hidden = true
  const photo = element("canvas")
  photo.setAttribute("aria-hidden", "true")
  const paint = element("canvas", "ss-inpaint-mask")
  paint.tabIndex = 0
  paint.setAttribute("aria-label", "Region mask")
  paint.setAttribute("aria-describedby", help.id)
  const cursor = element("span", "ss-inpaint-cursor")
  cursor.setAttribute("aria-hidden", "true")
  const outline = element("canvas", "ss-inpaint-outline")
  outline.setAttribute("aria-hidden", "true")
  surface.append(photo, paint, outline, cursor)
  viewport.append(surface)
  const resultPreview = element("img", "ss-inpaint-result")
  resultPreview.alt = "Region edit preview"
  resultPreview.hidden = true
  const stageHeading = element("div", "ss-inpaint-stage-label")
  stageHeading.append(element("strong", "", "Mask canvas"), element("span", "", "Paint only the region to change"))
  const stageFoot = element("div", "ss-inpaint-stage-foot")
  stageFoot.append(element("span", "", "Source image"), element("span", "", image.label))
  stage.append(stageHeading, viewport, resultPreview, stageFoot)
  const form = element("div", "ss-inpaint-controls")
  const panelScroll = element("div", "ss-inpaint-settings-scroll")
  const panelHead = element("div", "ss-inpaint-settings-head")
  panelHead.append(element("span", "ss-inpaint-eyebrow", "Image tools / Inpaint"), element("h3", "", "Edit region"), element("p", "", "Mask the area you want to regenerate."))
  const prompt = element("textarea", "ss-textarea")
  prompt.rows = 3
  prompt.value = sourcePrompt
  const promptLabel = element("label", "ss-field", "Edit prompt")
  promptLabel.append(prompt)

  const range = (name: string, min: string, max: string, step: string, value: string) => {
    const label = element("label", "ss-inpaint-range")
    const input = element("input")
    Object.assign(input, { type: "range", min, max, step, value })
    const readout = element("span", "ss-muted ss-tiny", value)
    readout.setAttribute("aria-hidden", "true")
    input.addEventListener("input", () => { readout.textContent = input.value })
    label.append(element("span", "", name), input, readout)
    return { label, input, readout }
  }
  const size = range("Brush size", "1", "25", "1", "5")
  const strength = range("Creativity", "0.05", "1", "0.05", "0.6")
  const feather = range("Feather (px)", "0", "64", "1", "4")
  const settings = element("select", "ss-select")
  for (const [value, label] of [["source", "Source image settings"], ["studio", "Current Studio settings"]]) {
    if (value === "source" && !image.details) continue
    const option = element("option", "", label)
    option.value = value
    settings.append(option)
  }
  const settingsLabel = element("label", "ss-field", "Generation settings")
  settingsLabel.append(settings)
  const settingsHelp = element("p", "ss-muted ss-tiny")
  const describeSettings = () => {
    settingsHelp.textContent = settings.value === "source"
      ? "Uses the source model, LoRAs and recorded sampling settings. Missing fields use current Studio values."
      : "Uses the current Tune model and sampling settings, and the enabled Studio LoRA stack."
  }
  settings.addEventListener("change", describeSettings)
  describeSettings()
  const iconButton = (name: string, path: string) => {
    const control = button("", "ss-icon-button")
    control.setAttribute("aria-label", name)
    control.title = name
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("aria-hidden", "true")
    const line = document.createElementNS(svg.namespaceURI, "path")
    line.setAttribute("d", path)
    line.setAttribute("fill", "none")
    line.setAttribute("stroke", "currentColor")
    line.setAttribute("stroke-width", "1.75")
    line.setAttribute("stroke-linecap", "round")
    svg.append(line)
    control.append(svg)
    return control
  }
  const zoomOut = iconButton("Zoom out", "M5 12h14")
  const zoomIn = iconButton("Zoom in", "M5 12h14m-7-7v14")
  const fit = iconButton("Fit image to canvas", "M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5")
  const zoomValue = element("span", "ss-inpaint-zoom-value ss-muted ss-tiny", "100%")
  const zoomTools = element("div", "ss-inpaint-tools")
  zoomTools.setAttribute("role", "group")
  zoomTools.setAttribute("aria-label", "Canvas zoom")
  const pan = iconButton("Pan image", "M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3")
  zoomTools.append(zoomOut, zoomValue, zoomIn, fit)
  const tools = element("div", "ss-inpaint-tools")
  tools.setAttribute("role", "group")
  tools.setAttribute("aria-label", "Mask tools")
  const brush = iconButton("Brush", "m14 6 4 4M9 15l-2-2L17 3l4 4-10 10m-2-2c-4-1-3 5-6 6 5 0 7-2 6-6Z")
  const eraser = iconButton("Erase", "m8 9 7 7m-1 4h7M4 13l9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-8 9H8l-4-4a2 2 0 0 1 0-3Z")
  const lasso = iconButton("Lasso", "M6 16c-3-1-4-3-4-5 0-4 5-7 10-7s10 3 10 7-5 7-10 7c-2 0-4-.4-6-2Zm0 0c-2 2-2 5 1 5 2 0 3-2 3-4")
  const undo = iconButton("Undo", "M4 11h10a5 5 0 0 1 0 10M4 11l5-5m-5 5 5 5")
  const clear = iconButton("Clear mask", "M4 6h16M9 6V3h6v3m3 0-1 15H7L6 6m4 4v7m4-7v7")
  const generate = button("Generate variant", "ss-button ss-button-primary")
  const maskVisibility = iconButton("Hide mask overlay", "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z")
  maskVisibility.setAttribute("aria-pressed", "true")
  tools.append(brush, eraser, lasso, undo, clear, pan, maskVisibility)
  const toolPanel = element("div", "ss-inpaint-tool-rail")
  toolPanel.append(tools)
  toolPanel.setAttribute("aria-label", "Canvas mask tools")
  const zoomDock = element("div", "ss-inpaint-zoom-dock")
  zoomDock.append(zoomTools)
  stage.append(toolPanel, zoomDock)
  const compare = button("Show masked source")
  compare.hidden = true
  const stopRender = button("Stop render", "ss-button ss-button-danger")
  stopRender.hidden = true
  const renderActions = element("div", "ss-inpaint-render-actions")
  const useInChat = button(acceptLabel || "Use variant in chat", "ss-button ss-button-primary")
  useInChat.hidden = true
  renderActions.append(compare, stopRender, generate, useInChat)
  const maskSettings = element("section", "ss-inpaint-settings-section")
  maskSettings.append(element("h4", "", "01 / Mask settings"), size.label, feather.label, help)
  const generationSettings = element("section", "ss-inpaint-settings-section")
  generationSettings.append(element("h4", "", "02 / Generation"), settingsLabel, settingsHelp, promptLabel, strength.label)
  panelScroll.append(panelHead, maskSettings, generationSettings)
  const settingsFoot = element("footer", "ss-inpaint-settings-foot")
  settingsFoot.append(renderActions, status)
  form.append(panelScroll, settingsFoot)
  const body = element("div", "ss-inpaint-body")
  body.append(stage, form)
  dialog.append(header, body)

  const photoContext = photo.getContext("2d")
  const maskContext = paint.getContext("2d", { willReadFrequently: true })
  const history: ImageData[] = []
  let editing = false
  let rendering = false
  let replacing = false
  let variantId = ""
  let masked = false
  let maskVisible = true
  let tool: "brush" | "erase" | "lasso" | "pan" = "brush"
  let zoom = 1
  let selection: Array<{ x: number; y: number }> = []
  let pointer: number | null = null
  let last = { x: 0, y: 0 }
  let keyboard = { x: 0, y: 0 }
  let drag = { x: 0, y: 0 }
  const radius = () => Math.max(1, Math.min(paint.width, paint.height) * Number(size.input.value) / 200)
  const positionCursor = (position = keyboard) => {
    cursor.style.left = `${position.x / paint.width * 100}%`
    cursor.style.top = `${position.y / paint.height * 100}%`
    cursor.style.width = `${radius() * 2 / paint.width * 100}%`
  }
  const refresh = () => {
    useInChat.disabled = replacing || rendering
    generate.disabled = rendering || replacing || !editing || pointer !== null || !masked || !prompt.value.trim()
    undo.disabled = rendering || !editing || !history.length || pointer !== null
    clear.disabled = rendering || !editing || !masked || pointer !== null
    brush.setAttribute("aria-pressed", String(tool === "brush"))
    eraser.setAttribute("aria-pressed", String(tool === "erase"))
    lasso.setAttribute("aria-pressed", String(tool === "lasso"))
    pan.setAttribute("aria-pressed", String(tool === "pan"))
    paint.dataset.tool = tool
    surface.dataset.maskVisible = String(maskVisible)
    maskVisibility.setAttribute("aria-pressed", String(maskVisible))
    maskVisibility.title = maskVisibility.getAttribute("aria-label") || "Toggle mask"
  }
  const remember = () => {
    if (!maskContext) return
    if (history.length === 8) history.shift()
    history.push(maskContext.getImageData(0, 0, paint.width, paint.height))
  }
  const refreshMask = () => {
    const pixels = maskContext?.getImageData(0, 0, paint.width, paint.height).data
    masked = Boolean(pixels?.some((value, index) => index % 4 === 3 && value > 0))
    refresh()
  }
  const mark = (from: typeof last, to: typeof last) => {
    if (!maskContext) return
    maskContext.globalCompositeOperation = tool === "erase" ? "destination-out" : "source-over"
    maskContext.strokeStyle = "#fff"
    maskContext.lineCap = "round"
    maskContext.lineWidth = radius() * 2
    maskContext.beginPath()
    maskContext.moveTo(from.x, from.y)
    maskContext.lineTo(to.x + (from.x === to.x && from.y === to.y ? 0.01 : 0), to.y)
    maskContext.stroke()
  }
  const trace = (context: CanvasRenderingContext2D) => {
    context.beginPath()
    for (const [index, point] of selection.entries()) {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    }
  }
  const showSelection = () => {
    const context = outline.getContext("2d")
    if (!context) return
    context.clearRect(0, 0, paint.width, paint.height)
    trace(context)
    context.strokeStyle = "#fff"
    context.lineWidth = Math.max(1, paint.width / 350)
    context.setLineDash([context.lineWidth * 3, context.lineWidth * 2])
    context.stroke()
  }
  const finishSelection = () => {
    if (selection.length >= 3 && maskContext) {
      remember()
      maskContext.globalCompositeOperation = "source-over"
      maskContext.fillStyle = "#fff"
      trace(maskContext)
      maskContext.closePath()
      maskContext.fill()
    }
    selection = []
    showSelection()
    refreshMask()
  }
  const changeZoom = (value: number) => {
    zoom = clamp(value, 1, 4)
    surface.style.setProperty("--ss-inpaint-zoom", String(zoom))
    zoomOut.disabled = zoom === 1
    zoomIn.disabled = zoom === 4
    zoomValue.textContent = `${Math.round(zoom * 100)}%`
  }
  zoomOut.addEventListener("click", () => changeZoom(zoom / 1.5))
  zoomIn.addEventListener("click", () => changeZoom(zoom * 1.5))
  fit.addEventListener("click", () => changeZoom(1))
  changeZoom(1)
  const point = (event: PointerEvent) => {
    const bounds = paint.getBoundingClientRect()
    return {
      x: (event.clientX - bounds.left) / bounds.width * paint.width,
      y: (event.clientY - bounds.top) / bounds.height * paint.height,
    }
  }
  const followPointer = (event: PointerEvent) => {
    if (!editing || rendering || (event.pointerType === "touch" && pointer === null)) return
    const position = point(event)
    const inside = position.x >= 0 && position.x <= paint.width && position.y >= 0 && position.y <= paint.height
    paint.dataset.pointerCursor = String(inside)
    if (inside) positionCursor(position)
  }
  paint.addEventListener("pointerenter", followPointer)
  paint.addEventListener("pointerleave", () => { delete paint.dataset.pointerCursor; positionCursor() })
  paint.addEventListener("pointerdown", event => {
    if (!editing || rendering || pointer !== null || event.button !== 0) return
    pointer = event.pointerId
    paint.setPointerCapture(pointer)
    followPointer(event)
    last = point(event)
    if (tool === "pan") drag = { x: event.clientX, y: event.clientY }
    else if (tool === "lasso") { maskVisible = true; selection = [last]; showSelection() }
    else { maskVisible = true; remember(); mark(last, last) }
    refresh()
  })
  paint.addEventListener("pointermove", event => {
    if (pointer === null || event.pointerId === pointer) followPointer(event)
    if (event.pointerId !== pointer) return
    if (tool === "pan") {
      viewport.scrollLeft += drag.x - event.clientX
      viewport.scrollTop += drag.y - event.clientY
      drag = { x: event.clientX, y: event.clientY }
      return
    }
    const next = point(event)
    if (tool === "lasso") { selection.push(next); showSelection() }
    else mark(last, next)
    last = next
  })
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    paint.addEventListener(type, event => {
      if ((event as PointerEvent).pointerId !== pointer) return
      pointer = null
      if ((event as PointerEvent).pointerType === "touch" || type === "pointercancel") {
        delete paint.dataset.pointerCursor
        positionCursor()
      }
      if (tool !== "lasso") refreshMask()
      else if (type === "pointerup") finishSelection()
      else { selection = []; showSelection(); refresh() }
    })
  }
  paint.addEventListener("keydown", event => {
    if (!editing || rendering || pointer !== null) return
    const delta: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const direction = delta[event.key]
    if (direction || event.code === "Space") {
      delete paint.dataset.pointerCursor
      positionCursor()
    }
    if (tool === "pan") {
      if (direction) {
        event.preventDefault()
        viewport.scrollBy(direction[0] * 32, direction[1] * 32)
      }
      return
    }
    if (direction) {
      event.preventDefault()
      keyboard = {
        x: clamp(keyboard.x + direction[0] * radius(), 0, paint.width - 1),
        y: clamp(keyboard.y + direction[1] * radius(), 0, paint.height - 1),
      }
      positionCursor()
    } else if (event.code === "Space") {
      event.preventDefault()
      if (tool === "lasso") {
        if (!event.repeat) selection.push(keyboard)
        showSelection()
      } else {
        if (!event.repeat) remember()
        mark(keyboard, keyboard)
        refreshMask()
      }
    } else if (event.key === "Enter" && tool === "lasso") {
      event.preventDefault()
      finishSelection()
    }
  })
  const chooseTool = (next: typeof tool) => {
    tool = next
    selection = []
    showSelection()
    help.textContent = next === "lasso"
      ? "Trace a closed region. With the canvas focused, use arrow keys to move, Space to add points, and Enter to fill."
      : next === "pan" ? "Drag the zoomed image or use the arrow keys to move around."
      : "Paint over the area to change. With the canvas focused, use the arrow keys to move and Space to paint or erase."
    refresh()
  }
  brush.addEventListener("click", () => chooseTool("brush"))
  eraser.addEventListener("click", () => chooseTool("erase"))
  lasso.addEventListener("click", () => chooseTool("lasso"))
  pan.addEventListener("click", () => chooseTool("pan"))
  undo.addEventListener("click", () => {
    const previous = history.pop()
    if (previous) maskContext?.putImageData(previous, 0, 0)
    refreshMask()
  })
  clear.addEventListener("click", () => {
    remember()
    maskContext?.clearRect(0, 0, paint.width, paint.height)
    refreshMask()
  })
  maskVisibility.addEventListener("click", () => {
    maskVisible = !maskVisible
    maskVisibility.setAttribute("aria-label", maskVisible ? "Hide mask overlay" : "Show mask overlay")
    refresh()
  })
  const displayBrushWidth = () => { size.readout.textContent = `${Math.round(radius() * 2)} px` }
  let brushPreviewTimer:number|undefined
  size.input.addEventListener("input", () => {
    const a=paint.getBoundingClientRect(),b=viewport.getBoundingClientRect()
    if((tool==="brush"||tool==="erase")&&a.width&&a.height){
      positionCursor({x:(Math.max(a.left,b.left)+Math.min(a.right,b.right)-2*a.left)/2*paint.width/a.width,y:(Math.max(a.top,b.top)+Math.min(a.bottom,b.bottom)-2*a.top)/2*paint.height/a.height})
      cursor.dataset.sizePreview="true";window.clearTimeout(brushPreviewTimer);brushPreviewTimer=window.setTimeout(()=>{delete cursor.dataset.sizePreview;positionCursor()},850)
    }
    displayBrushWidth()
  })
  prompt.addEventListener("input", refresh)
  const showResult = (show: boolean) => {
    stage.dataset.showResult = String(show)
    resultPreview.hidden = !show
    viewport.hidden = show
    compare.textContent = show ? "Show masked source" : "Show variant"
  }
  compare.addEventListener("click", () => showResult(resultPreview.hidden === true))
  stopRender.addEventListener("click", () => {
    stopRender.disabled = true
    status.textContent = "Stopping render…"
    stop()
  })
  const setRendering = (value: boolean) => {
    rendering = value
    delete paint.dataset.pointerCursor
    positionCursor()
    close.disabled = value
    prompt.disabled = value
    settings.disabled = value
    strength.input.disabled = value
    feather.input.disabled = value
    stopRender.hidden = !value
    stopRender.disabled = false
    refresh()
  }
  generate.addEventListener("click", () => {
    try {
      if (pointer !== null) return
      const mask = element("canvas")
      mask.width = paint.width
      mask.height = paint.height
      const output = mask.getContext("2d")
      if (!output) throw new Error("Could not encode the mask.")
      output.fillStyle = "#000"
      output.fillRect(0, 0, mask.width, mask.height)
      output.drawImage(paint, 0, 0)
      if (submit({
        sourceImageId: image.id, source: photo.toDataURL("image/png"),
        mask: mask.toDataURL("image/png"), prompt: prompt.value.trim(), denoise: Number(strength.input.value),
        width: mask.width, height: mask.height, feather: Number(feather.input.value),
        settings: settings.value === "source" ? "source" : "studio",
      })) {
        compare.hidden = true
        variantId = ""
        useInChat.hidden = true
        showResult(false)
        setRendering(true)
        status.textContent = "Preparing region edit…"
      } else status.textContent = "Wait for the active render to finish and check your SwarmUI connection."
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "Could not prepare the edit."
    }
  })

  useInChat.addEventListener("click", async () => {
    if (!replace || !variantId || rendering || replacing) return
    replacing = true
    close.disabled = true
    refresh()
    status.textContent = acceptLabel ? "Loading variant in Edit…" : "Replacing the chat image…"
    try {
      await replace(variantId)
      if (dialog.open) dialog.close()
    } catch (error) {
      if (!dialog.open) return
      status.textContent = error instanceof Error ? error.message : String(error)
      close.disabled = false
    } finally {
      replacing = false
      refresh()
    }
  })

  const returnFocus = document.activeElement as HTMLElement | null
  const loading = new AbortController()
  dialog.addEventListener("cancel", event => { if (rendering || replacing) event.preventDefault() })
  dialog.addEventListener("close", () => {
    loading.abort()
    dialog.remove()
    if (returnFocus?.isConnected && !returnFocus.closest("[hidden]")) returnFocus.focus()
  }, { once: true })
  root.appendChild(dialog)
  dialog.showModal()
  refresh()
  void (async () => {
    try {
      if (!photoContext || !maskContext) throw new Error("This browser cannot open the mask editor.")
      const response = await fetch(image.url || image.src, { credentials: "same-origin", signal: loading.signal })
      if (!response.ok) throw new Error("Could not load the source image.")
      const bitmap = await createImageBitmap(await response.blob())
      try {
        if (loading.signal.aborted) return
        const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height))
        photo.width = paint.width = outline.width = Math.max(64, Math.round(bitmap.width * scale / 8) * 8)
        photo.height = paint.height = outline.height = Math.max(64, Math.round(bitmap.height * scale / 8) * 8)
        photoContext.drawImage(bitmap, 0, 0, paint.width, paint.height)
      } finally {
        bitmap.close()
      }
      if(initialSelection && initialSelection.mask.length===initialSelection.width*initialSelection.height){
        const selectionCanvas=document.createElement("canvas");selectionCanvas.width=initialSelection.width;selectionCanvas.height=initialSelection.height
        const selectionContext=selectionCanvas.getContext("2d")!,data=selectionContext.createImageData(selectionCanvas.width,selectionCanvas.height)
        for(let i=0;i<initialSelection.mask.length;i++){data.data[i*4]=data.data[i*4+1]=data.data[i*4+2]=255;data.data[i*4+3]=initialSelection.mask[i]}
        selectionContext.putImageData(data,0,0);maskContext.drawImage(selectionCanvas,0,0,paint.width,paint.height);selectionCanvas.width=selectionCanvas.height=1;refreshMask()
      }
      surface.style.setProperty("--ss-inpaint-ratio", String(paint.width / paint.height))
      stageFoot.firstElementChild!.textContent = `${paint.width} × ${paint.height}`
      keyboard = { x: paint.width / 2, y: paint.height / 2 }
      positionCursor()
      surface.hidden = false
      displayBrushWidth()
      editing = true
      status.textContent = ""
      refresh()
    } catch (error) {
      if (!loading.signal.aborted) status.textContent = error instanceof Error ? error.message : "Could not load the source image."
    }
  })()
  return {
    dialog,
    progress(message, preview) {
      status.textContent = message
      if (preview) {
        resultPreview.src = preview
        showResult(true)
      }
    },
    stopFailed(message) {
      stopRender.disabled = false
      status.textContent = message
    },
    finish(message, result, resultId) {
      variantId = result ? resultId || "" : ""
      useInChat.hidden = !replace || !variantId
      setRendering(false)
      status.textContent = message
      if (result) {
        resultPreview.src = result
        compare.hidden = false
        showResult(true)
        const focus = useInChat.hidden ? compare : useInChat
        focus.focus({ preventScroll: true })
      } else {
        showResult(false)
        generate.focus({ preventScroll: true })
      }
    },
  }
}
