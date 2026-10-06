interface NativeStudioPresetInput {
  kind: "main" | "character"
  characterId?: string
  lookId?: string
  name: string
  prompt: string
  negativePrompt: string
}

// Lumiverse owns validation, persistence and bindings. Reuse its public import
// API (ID-based upsert), as the existing read integration uses public export.
// Its preset schema has no renderer recipe: do not send Swarm parameters.
function studioNativePreset(input: NativeStudioPresetInput): Record<string, unknown> {
  if (!["main", "character"].includes(input.kind)) throw new Error("Unsupported native preset kind.")
  if (input.kind === "character" && !input.characterId?.trim()) throw new Error("Choose an active character first.")
  if (!input.name?.trim() || typeof input.prompt !== "string" || typeof input.negativePrompt !== "string") throw new Error("Invalid native prompt preset.")
  const suffix = input.kind === "main" ? "main" : `character:${encodeURIComponent(input.characterId!)}:${encodeURIComponent(input.lookId || "base")}`
  return { id: `lumiswarm-studio:${suffix}`, name: input.name.trim().slice(0, 100), kind: input.kind, mode: "custom", prompt: input.prompt.slice(0, 12000), negativePrompt: input.negativePrompt.slice(0, 12000) }
}

async function nativeImageGenAvailable(fetcher: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetcher("/api/v1/image-gen/export", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ include_presets: false, include_settings: false, include_connections: false, include_parameters: false }) })
    if (!response.ok) return false
    const data = await response.json()
    return data?.type === "lumiverse_image_gen_config" && data?.version === 1
  } catch { return false }
}

async function upsertStudioNativePreset(input: NativeStudioPresetInput, fetcher: typeof fetch = fetch): Promise<{ id: string; warnings: string[] }> {
  const preset = studioNativePreset(input)
  const response = await fetcher("/api/v1/image-gen/import", {
    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
    body: JSON.stringify({ type: "lumiverse_image_gen_config", version: 1, presets: [preset] }),
  })
  const data = await response.json()
  if (!response.ok || data?.imported?.presets !== 1) throw new Error(String(data?.error || data?.errors?.join("; ") || "Lumiverse did not save the prompt preset."))
  if (input.kind === "character") {
    const binding = await fetcher(`/api/v1/image-gen/preset-bindings/character/${encodeURIComponent(input.characterId!)}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ preset_id: preset.id }),
    })
    if (!binding.ok) throw new Error("Prompt preset saved, but Lumiverse could not bind it to the character. Retry to repair the binding.")
  }
  return { id: String(preset.id), warnings: Array.isArray(data.errors) ? data.errors.map(String) : [] }
}

async function studioCharacterImageAction(characterId: string, imageIds: string[], action: "avatar" | "gallery", fetcher: typeof fetch = fetch): Promise<{ saved: string[]; failed: string[] }> {
  const ids = [...new Set(imageIds.filter(id => typeof id === "string" && id.trim()))]
  if (!characterId || !ids.length) throw new Error("Choose an active character and saved outputs first.")
  const base = `/api/v1/characters/${encodeURIComponent(characterId)}`
  const check = async (response: Response, fallback: string) => {
    if (response.ok) return
    const data = await response.json().catch(() => null)
    throw new Error(String(data?.error || fallback))
  }
  if (action === "avatar") {
    if (ids.length !== 1) throw new Error("Choose one output for the character picture.")
    const image = await fetcher(`/api/v1/images/${encodeURIComponent(ids[0])}`, { credentials: "same-origin" })
    await check(image, "Could not load the saved output.")
    const blob = await image.blob()
    if (!blob.type.startsWith("image/")) throw new Error("The saved output is not an image.")
    const form = new FormData()
    form.append("avatar", blob, `studio-output.${blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1] || "png"}`)
    const response = await fetcher(`${base}/avatar`, { method: "POST", credentials: "same-origin", body: form })
    await check(response, "Lumiverse could not set the character picture.")
    return { saved: ids, failed: [] }
  }
  const existing = await fetcher(`${base}/gallery`, { credentials: "same-origin" })
  await check(existing, "Character galleries are unavailable in this Lumiverse host.")
  const items = await existing.json()
  if (!Array.isArray(items)) throw new Error("Lumiverse returned an invalid gallery.")
  const linked = new Set(items.map(item => String(item.image_id)))
  const saved: string[] = [], failed: string[] = []
  for (const imageId of ids) {
    if (linked.has(imageId)) { saved.push(imageId); continue }
    try {
      const response = await fetcher(`${base}/gallery/link`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_id: imageId }) })
      await check(response, "Lumiverse could not add the output to the gallery.")
      saved.push(imageId)
    } catch { failed.push(imageId) }
  }
  return { saved, failed }
}


function studioAvatarCropRect(width: number, height: number, zoom: number, x: number, y: number) {
  const size = Math.min(width, height) / Math.max(1, zoom)
  return { x: (width - size) * (Math.max(-1, Math.min(1, x)) + 1) / 2, y: (height - size) * (Math.max(-1, Math.min(1, y)) + 1) / 2, size }
}

async function studioUploadAvatar(kind: "character" | "persona", id: string, crop: Blob, original: Blob, fetcher: typeof fetch = fetch): Promise<void> {
  if (!["character", "persona"].includes(kind) || !id || !crop.type.startsWith("image/") || !original.type.startsWith("image/")) throw new Error("Choose a valid avatar image and target.")
  const form = new FormData()
  form.append("avatar", crop, "studio-crop.png")
  form.append("original_avatar", original, `studio-original.${original.type === "image/jpeg" ? "jpg" : original.type.split("/")[1] || "png"}`)
  const response = await fetcher(`/api/v1/${kind === "character" ? "characters" : "personas"}/${encodeURIComponent(id)}/avatar`, { method: "POST", credentials: "same-origin", body: form })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(String(data?.error || `Lumiverse could not set the ${kind} picture.`))
  }
}

// A native modal traps focus and makes the underlying inspector inert. The source
// remains untouched; Lumiverse receives both the square crop and original bitmap.
function studioCropAvatar(root: HTMLElement, original: Blob, kind: string, signal: AbortSignal): Promise<Blob | null> {
  return new Promise((resolve, reject) => {
    const dialog = document.createElement("dialog")
    dialog.className = "ss-avatar-crop"
    dialog.setAttribute("aria-labelledby", "ss-avatar-crop-title")
    dialog.innerHTML = `<h2 id="ss-avatar-crop-title">Crop for ${kind} picture</h2><canvas width="512" height="512" aria-label="Square avatar preview"></canvas><p>Drag the image or use the sliders to position the crop.</p><label>Zoom<input data-crop="zoom" type="range" min="1" max="4" step="0.01" value="1"></label><label>Horizontal position<input data-crop="x" type="range" min="-1" max="1" step="0.01" value="0"></label><label>Vertical position<input data-crop="y" type="range" min="-1" max="1" step="0.01" value="0"></label><p data-crop="status" role="status">Loading image…</p><div class="ss-avatar-crop-actions"><button type="button" class="ss-button" data-crop="cancel">Cancel</button><button type="button" class="ss-button" data-crop="apply" disabled>Set picture</button></div>`
    const source = new Image(), url = URL.createObjectURL(original)
    const previousFocus = document.activeElement as HTMLElement | null
    const canvas = dialog.querySelector("canvas")!
    const context = canvas.getContext("2d")!
    const controls = [...dialog.querySelectorAll<HTMLInputElement>("input")]
    const apply = dialog.querySelector<HTMLButtonElement>('[data-crop="apply"]')!
    const status = dialog.querySelector<HTMLElement>('[data-crop="status"]')!
    let settled = false, ready = false
    const finish = (blob: Blob | null, error?: Error) => {
      if (settled) return
      settled = true
      signal.removeEventListener("abort", abort)
      dialog.close(); dialog.remove(); URL.revokeObjectURL(url)
      if (previousFocus?.isConnected) previousFocus.focus()
      if (error) reject(error); else resolve(blob)
    }
    const abort = () => finish(null)
    const draw = () => {
      if (!ready || settled) return
      const [zoom, x, y] = controls.map(control => Number(control.value))
      const rect = studioAvatarCropRect(source.naturalWidth, source.naturalHeight, zoom, x, y)
      context.clearRect(0, 0, 512, 512)
      context.drawImage(source, rect.x, rect.y, rect.size, rect.size, 0, 0, 512, 512)
    }
    controls.forEach(control => control.addEventListener("input", draw))
    let drag: { id: number; x: number; y: number; cropX: number; cropY: number } | null = null
    canvas.addEventListener("pointerdown", event => {
      if (!ready) return
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, cropX: Number(controls[1].value), cropY: Number(controls[2].value) }
      canvas.setPointerCapture(event.pointerId)
    })
    canvas.addEventListener("pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return
      const rect = studioAvatarCropRect(source.naturalWidth, source.naturalHeight, Number(controls[0].value), 0, 0)
      const scale = rect.size / canvas.getBoundingClientRect().width
      controls[1].value = String(drag.cropX - (event.clientX - drag.x) * scale * 2 / (source.naturalWidth - rect.size || 1))
      controls[2].value = String(drag.cropY - (event.clientY - drag.y) * scale * 2 / (source.naturalHeight - rect.size || 1))
      draw()
    })
    canvas.addEventListener("lostpointercapture", () => { drag = null })
    canvas.addEventListener("pointerup", () => { drag = null })
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish(null) })
    dialog.querySelector('[data-crop="cancel"]')!.addEventListener("click", () => finish(null))
    apply.addEventListener("click", () => {
      apply.disabled = true
      canvas.toBlob(blob => { if (blob) finish(blob); else finish(null, new Error("Could not create the avatar crop.")) }, "image/png")
    })
    root.append(dialog); dialog.showModal()
    signal.addEventListener("abort", abort, { once: true })
    if (signal.aborted) { abort(); return }
    source.src = url
    void source.decode().then(() => {
      if (settled) return
      ready = true; draw(); apply.disabled = false; status.textContent = "The original image will also be preserved."
    }).catch(() => finish(null, new Error("Could not decode this output for cropping.")))
  })
}
