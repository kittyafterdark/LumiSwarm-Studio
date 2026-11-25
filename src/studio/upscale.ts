// Image Studio | AI upscale workbench. One reusable dialog, not another inspector overlay.
interface StudioUpscaleSelection {
  mode: "model" | "saved" | "custom"
  factor: 2 | 3 | 4
  model: string
  workflow: string
  imageParam: string
  graph: string
}

interface StudioUpscaleSession {
  readonly dialog: HTMLDialogElement
  updateOptions(data: any): void
  updateWorkflow(data: any): void
  setBusy(busy: boolean, message?: string): void
  reportError(message: string): void
  close(): void
}

function openStudioUpscale(
  mount: HTMLElement,
  image: CurrentImage,
  onRun: (selection: StudioUpscaleSelection, remember: boolean) => void,
  onWorkflow: (name: string) => void,
  onClose: () => void,
): StudioUpscaleSession {
  const dialog = element("dialog", "ss-upscale-dialog")
  dialog.setAttribute("aria-label", "AI upscale")
  const shell = element("div", "ss-upscale-shell")
  shell.innerHTML = `
    <header class="ss-upscale-header">
      <div><span class="ss-inspector-eyebrow">Image Studio / Enhancement</span><h2>Upscale image</h2><p>Model-based detail restoration, not pixel interpolation.</p></div>
      <button type="button" class="ss-icon-button" data-upscale="close" aria-label="Close upscale workspace">×</button>
    </header>
    <main class="ss-upscale-body">
      <section class="ss-upscale-stage" aria-label="Source image preview">
        <div class="ss-upscale-stage-kicker"><span class="ss-upscale-image-badge">SOURCE</span><span data-upscale="dimensions">Saved Lumiverse output</span></div>
        <div class="ss-upscale-artwork"><img data-upscale="preview" alt="Source image to upscale" /></div>
        <p class="ss-upscale-stage-note">The original is preserved. Studio saves the enhanced version as a new Output Library image.</p>
      </section>
      <section class="ss-upscale-panel" aria-label="Upscale settings">
        <div class="ss-upscale-panel-scroll">
          <div class="ss-upscale-section-label"><span>01</span> Processing method</div>
          <div class="ss-upscale-mode-list" role="radiogroup" aria-label="Upscale method">
            <label class="ss-upscale-mode"><input type="radio" name="studio-upscale-mode" value="model" checked /><span><strong>AI upscaler</strong><small>Installed ESRGAN / UltraSharp models</small></span></label>
            <label class="ss-upscale-mode"><input type="radio" name="studio-upscale-mode" value="saved" /><span><strong>Saved workflow</strong><small>Use a SwarmUI Comfy workflow</small></span></label>
            <label class="ss-upscale-mode"><input type="radio" name="studio-upscale-mode" value="custom" /><span><strong>Custom graph</strong><small>Import ComfyUI API JSON</small></span></label>
          </div>
          <div data-upscale="model-panel" class="ss-upscale-fields">
            <label class="ss-field"><span>Upscaler model</span><select class="ss-select" data-upscale="model"><option value="">Discovering installed models…</option></select></label>
            <p class="ss-upscale-tip" data-upscale="model-hint">Uses the installed model’s real detail reconstruction. A 4× model can produce a crisp 2× final image.</p>
            <label class="ss-field"><span>Output size</span><select class="ss-select" data-upscale="factor"><option value="2">2× · Recommended</option><option value="3">3×</option><option value="4">4×</option></select></label>
          </div>
          <div data-upscale="saved-panel" class="ss-upscale-fields" hidden>
            <label class="ss-field"><span>SwarmUI workflow</span><select class="ss-select" data-upscale="workflow"><option value="">Choose saved workflow…</option></select></label>
            <label class="ss-field"><span>Image input</span><select class="ss-select" data-upscale="image-param"><option value="">Select a workflow first</option></select></label>
            <p class="ss-upscale-tip">The workflow must expose an image input in SwarmUI. Its own nodes determine final resolution and quality.</p>
          </div>
          <div data-upscale="custom-panel" class="ss-upscale-fields" hidden>
            <div class="ss-upscale-custom-title"><label for="ss-upscale-graph-field">ComfyUI API graph JSON</label><button class="ss-button" type="button" data-upscale="import">Import .json</button></div>
            <textarea id="ss-upscale-graph-field" class="ss-textarea ss-upscale-graph" spellcheck="false" data-upscale="graph" placeholder='{"1":{"class_type":"SwarmLoadImageB64","inputs":{"image_base64":"\${init_image}"}},…}'></textarea>
            <input type="file" data-upscale="file" accept=".json,application/json" hidden />
            <p class="ss-upscale-tip">Export API-format JSON, not ComfyUI’s UI-layout JSON. Include exactly one <code>SwarmLoadImageB64</code> and one <code>SaveImage</code>. Studio injects your selected source into the image loader. Custom nodes execute on your own SwarmUI backend.</p>
          </div>
          <div class="ss-upscale-help">
            <strong>First time?</strong><span>Put an AI upscale model in SwarmUI’s <code>Models/upscale_models</code> directory, refresh/restart its ComfyUI backend, then reopen this picker. No AI model means no AI upscale—not a silent Lanczos substitute.</span>
          </div>
          <label class="ss-upscale-remember"><input type="checkbox" data-upscale="remember" checked /> Remember this setup for this SwarmUI connection</label>
        </div>
        <footer class="ss-upscale-footer">
          <p class="ss-upscale-feedback" role="status" aria-live="polite" data-upscale="feedback">Checking SwarmUI…</p>
          <div><button type="button" class="ss-button" data-upscale="cancel">Cancel</button><button type="button" class="ss-button ss-button-primary" data-upscale="run" disabled>Enhance image</button></div>
        </footer>
      </section>
    </main>`
  dialog.append(shell)
  mount.append(dialog)
  const get = <T extends HTMLElement>(name: string): T => dialog.querySelector<T>(`[data-upscale="${name}"]`)!
  const preview = get<HTMLImageElement>("preview")
  preview.src = image.src || image.url || ""
  preview.addEventListener("load", () => { get<HTMLElement>("dimensions").textContent = `${preview.naturalWidth} × ${preview.naturalHeight} px` })
  const model = get<HTMLSelectElement>("model")
  const workflow = get<HTMLSelectElement>("workflow")
  const imageParam = get<HTMLSelectElement>("image-param")
  const factor = get<HTMLSelectElement>("factor")
  const graph = get<HTMLTextAreaElement>("graph")
  const feedback = get<HTMLElement>("feedback")
  const run = get<HTMLButtonElement>("run")
  const modes = [...dialog.querySelectorAll<HTMLInputElement>('input[name="studio-upscale-mode"]')]
  let installed: string[] = []
  let saved: string[] = []
  let busy = false
  let loading = true
  let preferredImageParam = ""
  const mode = (): StudioUpscaleSelection["mode"] => (modes.find(input => input.checked)?.value || "model") as StudioUpscaleSelection["mode"]
  const message = (value: string, bad = false) => { feedback.textContent = value; feedback.dataset.error = String(bad) }
  const setOptions = (select: HTMLSelectElement, entries: { value: string; label: string }[], placeholder: string): void => {
    select.replaceChildren()
    const opt = element("option", "", placeholder); opt.value = ""; select.append(opt)
    for (const item of entries) { const option = element("option", "", item.label); option.value = item.value; select.append(option) }
  }
  const update = () => {
    const active = mode()
    get<HTMLElement>("model-panel").hidden = active !== "model"
    get<HTMLElement>("saved-panel").hidden = active !== "saved"
    get<HTMLElement>("custom-panel").hidden = active !== "custom"
    for (const entry of modes) entry.closest<HTMLElement>(".ss-upscale-mode")!.dataset.selected = String(entry.checked)
    const isReady = !loading && !busy && (active === "model" ? installed.includes(model.value) && Boolean(model.value)
      : active === "saved" ? saved.includes(workflow.value) && Boolean(imageParam.value)
      : Boolean(graph.value.trim()))
    run.disabled = !isReady
    if (loading) message("Discovering installed upscalers and saved workflows…")
    else if (busy) message("Enhancing source image… This may require substantial VRAM.")
    else if (active === "model" && !installed.length) message("No installed AI upscaler found. Install a model on SwarmUI, then reopen this dialog.", true)
    else if (active === "model" && !model.value) message("Choose an installed AI model.", true)
    else if (active === "saved" && !saved.length) message("No saved Comfy workflows available on this connection.", true)
    else if (active === "saved" && !imageParam.value) message("Select a saved workflow and its exposed image input.")
    else if (active === "custom" && !graph.value.trim()) message("Paste or import Comfy API-format workflow JSON.")
    else message("Ready to create a new enhanced output.")
  }
  modes.forEach(input => input.addEventListener("change", update))
  model.addEventListener("change", update)
  factor.addEventListener("change", update)
  graph.addEventListener("input", update)
  imageParam.addEventListener("change", update)
  workflow.addEventListener("change", () => {
    setOptions(imageParam, [], "Loading image inputs…")
    if (workflow.value) onWorkflow(workflow.value)
    update()
  })
  get<HTMLButtonElement>("import").addEventListener("click", () => get<HTMLInputElement>("file").click())
  get<HTMLInputElement>("file").addEventListener("change", async () => {
    const selected = get<HTMLInputElement>("file").files?.[0]
    if (!selected) return
    if (selected.size > 128_000) { message("Graph is too large (128 KB limit).", true); return }
    graph.value = await selected.text()
    update()
  })
  const close = () => { if (!dialog.open || busy) return; dialog.close() }
  get<HTMLButtonElement>("close").addEventListener("click", close)
  get<HTMLButtonElement>("cancel").addEventListener("click", close)
  dialog.addEventListener("cancel", event => { if (busy) event.preventDefault() })
  dialog.addEventListener("close", () => { dialog.remove(); onClose() })
  run.addEventListener("click", () => {
    if (busy || loading || run.disabled) return
    const selection: StudioUpscaleSelection = { mode: mode(), factor: Number(factor.value) as 2 | 3 | 4,
      model: model.value, workflow: workflow.value, imageParam: imageParam.value, graph: graph.value }
    if (selection.mode === "custom") {
      try {
        const parsed = JSON.parse(selection.graph)
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Root must be an object.")
      } catch { message("Import valid ComfyUI API JSON before enhancing.", true); return }
    }
    busy = true; run.disabled = true
    get<HTMLButtonElement>("cancel").disabled = true
    get<HTMLButtonElement>("close").disabled = true
    message("Enhancing source image…")
    onRun(selection, get<HTMLInputElement>("remember").checked)
  })
  dialog.showModal()
  return {
    dialog,
    updateOptions(data: any) {
      loading = false
      const choices = Array.isArray(data?.models) ? data.models.filter((value: unknown) => typeof value === "string") : []
      installed = choices
      setOptions(model, choices.map((name: string) => ({ value: name, label: name })), "Choose installed model…")
      saved = (Array.isArray(data?.workflows) ? data.workflows : []).map((item: any) => String(item.name || "")).filter(Boolean)
      setOptions(workflow, saved.map(name => ({ value: name, label: name })), "Choose saved workflow…")
      const prefs = data?.settings || {}
      preferredImageParam = typeof prefs.imageParam === "string" ? prefs.imageParam : ""
      model.value = installed.includes(prefs.model) ? prefs.model : installed.includes(data?.recommended) ? data.recommended : installed[0] || ""
      workflow.value = saved.includes(prefs.workflow) ? prefs.workflow : ""
      factor.value = String([2, 3, 4].includes(Number(prefs.factor)) ? Number(prefs.factor) : 2)
      graph.value = typeof prefs.graph === "string" ? prefs.graph : ""
      const preferred = modes.find(input => input.value === prefs.mode)
      if (preferred) preferred.checked = true
      if (workflow.value) onWorkflow(workflow.value)
      get<HTMLElement>("model-hint").textContent = choices.length
        ? `Detected ${choices.length} AI model${choices.length === 1 ? "" : "s"} on SwarmUI. The selected model runs before exact-size output scaling.`
        : data?.modelError ? `Discovery failed: ${String(data.modelError).slice(0, 300)}` : "No AI models exposed by SwarmUI. Install one in upscale_models and refresh your backend."
      update()
    },
    updateWorkflow(data: any) {
      if (data?.name !== workflow.value) return
      const inputs = (Array.isArray(data?.parameters) ? data.parameters : []).filter((item: any) => item?.type === "image" || item?.viewType === "image")
      setOptions(imageParam, inputs.map((param: any) => ({ value: String(param.id), label: String(param.name || param.id) })), "Choose source image input…")
      imageParam.value = inputs.find((item: any) => item.id === preferredImageParam)?.id || (inputs.length === 1 ? String(inputs[0].id) : "")
      update()
    },
    setBusy(value: boolean, note?: string) {
      busy = value
      get<HTMLButtonElement>("cancel").disabled = value
      get<HTMLButtonElement>("close").disabled = value
      update()
      if (note) message(note, false)
    },
    reportError(value: string) { this.setBusy(false); message(value, true) },
    close() { busy = false; if (dialog.open) dialog.close() },
  }
}
