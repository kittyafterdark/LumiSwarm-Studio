class CharacterCanonHostController {
  private readonly ctx: FrontendContext
  private readonly tab: any | null
  private characterId = ""
  private data: any = null
  private selectedLookId = "default"
  private readonly disposers: Array<() => void> = []

  constructor(ctx: FrontendContext) {
    this.ctx = ctx
    this.tab = typeof ctx.ui?.registerCharacterEditorTab === "function"
      ? ctx.ui.registerCharacterEditorTab({ id: "visual-canon", title: "Visuals" })
      : null
    if (!this.tab?.root) return
    this.tab.root.className = "ss-host-visual-canon"
    this.tab.root.addEventListener("click", (event: Event) => this.onClick(event))
    const sync = () => this.syncCharacter()
    const unsubscribe = ctx.ui.characterEditor?.onChange?.(sync)
    if (typeof unsubscribe === "function") this.disposers.push(unsubscribe)
    this.tab.onActivate?.(sync)
    this.syncCharacter()
  }

  onMessage(payload: any): void {
    if (payload?.type !== "character_visual_canon_result") return
    const characterId = String(payload?.data?.character?.id || "")
    if (!characterId || characterId !== this.characterId) return
    this.data = payload.data
    this.selectedLookId = this.data.activeLookId || this.data.looks?.[0]?.id || "default"
    const count = Array.isArray(this.data.looks) ? this.data.looks.length : 0
    this.tab?.setTitle?.(count ? `Visuals · ${count}` : "Visuals")
    this.render()
  }

  destroy(): void {
    for (const dispose of this.disposers.splice(0)) dispose()
    this.tab?.destroy?.()
  }

  private syncCharacter(): void {
    if (!this.tab?.root) return
    const state = this.ctx.ui.characterEditor?.getState?.() || {}
    const characterId = state.open ? String(state.characterId || "") : ""
    if (!characterId) {
      this.characterId = ""
      this.tab.root.replaceChildren(element("div", "ss-empty", "Open a character to edit its visual canon."))
      return
    }
    if (characterId === this.characterId && this.data) return
    this.characterId = characterId
    this.data = null
    this.tab.root.replaceChildren(element("div", "ss-empty", "Loading visual canon…"))
    this.send("get_character_visual_canon", { characterId })
  }

  private send(type: string, data: Record<string, unknown>): void {
    this.ctx.sendToBackend({ type, requestId: createRequestId(), ...data })
  }

  private field<T extends HTMLElement>(role: string): T | null {
    return (this.tab?.root as HTMLElement | undefined)?.querySelector<T>(`[data-role="${role}"]`) || null
  }

  private render(): void {
    if (!this.tab?.root || !this.data) return
    const looks: CharacterVisualLook[] = Array.isArray(this.data.looks) ? this.data.looks : []
    const look = looks.find((candidate) => candidate.id === this.selectedLookId) || looks[0] || null
    if (look) this.selectedLookId = look.id
    const root = element("div", "ss-host-visual-canon-shell")
    const header = element("header", "ss-host-continuity-head")
    const title = element("div")
    title.append(
      element("strong", "", this.data.character?.name || "Character visual canon"),
      element("span", "ss-muted ss-tiny", this.data.badge || "Add visuals"),
    )
    const add = element("button", "ss-button", "New look")
    add.dataset.action = "host-new-look"
    header.append(title, add)
    const rail = element("div", "ss-host-look-rail")
    for (const item of looks) {
      const button = element("button", "ss-host-look-card")
      button.dataset.action = "host-select-look"
      button.dataset.lookId = item.id
      button.dataset.active = String(item.id === this.data.activeLookId)
      button.dataset.selected = String(item.id === this.selectedLookId)
      const previewUrl = item.thumbnailUrl || item.referenceImageUrl
      if (previewUrl) {
        const image = element("img")
        image.src = previewUrl
        image.alt = ""
        button.appendChild(image)
      } else {
        button.appendChild(element("span", "ss-host-look-placeholder", item.name.slice(0, 1).toUpperCase()))
      }
      button.append(element("strong", "", item.name), element("span", "ss-muted ss-tiny", item.id === this.data.activeLookId ? "Active" : "Saved"))
      rail.appendChild(button)
    }
    if (!looks.length) rail.appendChild(element("div", "ss-empty", "Create Default to begin this character's visual canon."))
    const form = element("div", "ss-host-look-form")
    form.innerHTML = `
      <div class="ss-chat-visuals-grid">
        <label class="ss-field"><span>Name</span><input class="ss-input" data-role="host-look-name"></label>
        <label class="ss-field"><span>Aliases / prose cues</span><input class="ss-input" data-role="host-look-aliases" placeholder="formalwear, gala"></label>
      </div>
      <div class="ss-chat-visuals-grid">
        <label class="ss-field"><span>Outfit prompt</span><textarea class="ss-textarea" data-role="host-look-outfit"></textarea></label>
        <label class="ss-field"><span>Additional negative</span><textarea class="ss-textarea" data-role="host-look-negative"></textarea></label>
      </div>
      <div class="ss-chat-visuals-grid">
        <label class="ss-field"><span>Checkpoint override</span><select class="ss-select" data-role="host-look-checkpoint"><option value="">Inherit identity checkpoint</option></select></label>
        <label class="ss-field"><span>Additional LoRA stack</span><select class="ss-select" data-role="host-look-stack"><option value="">None</option></select></label>
      </div>
      <label class="ss-field"><span>Trigger words</span><input class="ss-input" data-role="host-look-triggers"></label>
      <div class="ss-chat-visuals-grid">
        <label class="ss-field"><span>Reference / init URL</span><input class="ss-input" data-role="host-look-reference"></label>
        <label class="ss-field"><span>Thumbnail URL</span><input class="ss-input" data-role="host-look-thumbnail"></label>
      </div>
      <label class="ss-field"><span>Continuity notes</span><textarea class="ss-textarea" data-role="host-look-notes"></textarea></label>
      <div class="ss-host-continuity-actions">
        <button class="ss-button ss-button-danger" data-action="host-delete-look">Delete</button>
        <button class="ss-button" data-action="host-activate-look">Set active</button>
        <button class="ss-button ss-button-primary" data-action="host-save-look">Save &amp; activate</button>
      </div>
    `
    root.append(header, rail, form)
    this.tab.root.replaceChildren(root)
    this.field<HTMLInputElement>("host-look-name")!.value = look?.name || ""
    this.field<HTMLInputElement>("host-look-aliases")!.value = look?.aliases?.join(", ") || ""
    this.field<HTMLTextAreaElement>("host-look-outfit")!.value = look?.outfitPrompt || ""
    this.field<HTMLTextAreaElement>("host-look-negative")!.value = look?.negativePrompt || ""
    this.field<HTMLInputElement>("host-look-triggers")!.value = look?.triggerWords?.join(", ") || ""
    this.field<HTMLInputElement>("host-look-reference")!.value = look?.referenceImageUrl || ""
    this.field<HTMLInputElement>("host-look-thumbnail")!.value = look?.thumbnailUrl || ""
    this.field<HTMLTextAreaElement>("host-look-notes")!.value = look?.notes || ""
    const checkpoint = this.field<HTMLSelectElement>("host-look-checkpoint")!
    for (const model of this.data.models || []) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    if (look?.checkpoint && ![...checkpoint.options].some((option) => option.value === look.checkpoint)) {
      const option = element("option", "", `${look.checkpoint} · saved`)
      option.value = look.checkpoint
      checkpoint.appendChild(option)
    }
    checkpoint.value = look?.checkpoint || ""
    const stack = this.field<HTMLSelectElement>("host-look-stack")!
    for (const preset of this.data.stackPresets || []) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = preset.id
      stack.appendChild(option)
    }
    stack.value = look?.stackPresetId || ""
    root.querySelector<HTMLButtonElement>('[data-action="host-delete-look"]')!.disabled = !look || look.id === "default"
    root.querySelector<HTMLButtonElement>('[data-action="host-activate-look"]')!.disabled = !look || look.id === this.data.activeLookId
  }

  private currentPayload(): CharacterVisualLook | null {
    const name = this.field<HTMLInputElement>("host-look-name")?.value.trim() || ""
    if (!name) return null
    const existing = (this.data?.looks || []).find((look: CharacterVisualLook) => look.id === this.selectedLookId)
    const list = (value: string) => value.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean)
    return {
      id: existing?.id || "",
      name,
      aliases: list(this.field<HTMLInputElement>("host-look-aliases")?.value || ""),
      outfitPrompt: this.field<HTMLTextAreaElement>("host-look-outfit")?.value || "",
      negativePrompt: this.field<HTMLTextAreaElement>("host-look-negative")?.value || "",
      checkpoint: this.field<HTMLSelectElement>("host-look-checkpoint")?.value || "",
      stackPresetId: this.field<HTMLSelectElement>("host-look-stack")?.value || "",
      stackSnapshot: existing?.stackSnapshot || [],
      referenceImageId: existing?.referenceImageId || "",
      referenceImageUrl: this.field<HTMLInputElement>("host-look-reference")?.value.trim() || "",
      thumbnailImageId: existing?.thumbnailImageId || "",
      thumbnailUrl: this.field<HTMLInputElement>("host-look-thumbnail")?.value.trim() || "",
      triggerWords: list(this.field<HTMLInputElement>("host-look-triggers")?.value || ""),
      notes: this.field<HTMLTextAreaElement>("host-look-notes")?.value || "",
      updatedAt: Date.now(),
    }
  }

  private onClick(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
    const action = button?.dataset.action
    if (!action || !this.characterId) return
    if (action === "host-select-look") {
      this.selectedLookId = button!.dataset.lookId || "default"
      this.render()
    } else if (action === "host-new-look") {
      this.selectedLookId = ""
      this.render()
      this.field<HTMLInputElement>("host-look-name")?.focus()
    } else if (action === "host-save-look") {
      const look = this.currentPayload()
      if (look) this.send("save_character_look", { characterId: this.characterId, look, activate: true })
    } else if (action === "host-activate-look") {
      this.send("select_character_look", { characterId: this.characterId, lookId: this.selectedLookId })
    } else if (action === "host-delete-look" && window.confirm("Delete this canonical look?")) {
      this.send("delete_character_look", { characterId: this.characterId, lookId: this.selectedLookId })
    }
  }
}

const LORE_ENTITY_TYPES = ["character", "location", "object", "creature", "outfit", "style"]

// Saved types win; explicit native labels/tags suggest a draft type.
function loreDisplayType(entry: any): string {
  const saved = String(entry?.identity?.entityType || entry?.entityType || "")
  if (LORE_ENTITY_TYPES.includes(saved)) return saved
  const prefix = String(entry?.comment || "").match(/^\s*(character|location|object|creature|outfit|style)\s*[|:]/i)?.[1]?.toLowerCase()
  if (prefix) return prefix
  const tags = [...new Set((Array.isArray(entry?.tags) ? entry.tags : []).map((tag: unknown) => String(tag).trim().toLowerCase()).filter((tag: string) => LORE_ENTITY_TYPES.includes(tag)))]
  return tags.length === 1 ? String(tags[0]) : ""
}

class VisualLorebookHostController {
  private readonly folderOpen = new Map<string, boolean>()
  private data: any = null
  private pending: { id: string; save: boolean } | null = null
  private search = ""
  private filter = "all"
  private detail = false
  private dirty = false
  private destroyed = false
  private notice = ""
  private readonly click = (event: Event) => this.onClick(event)
  private readonly change = (event: Event) => this.onChange(event)
  private readonly input = (event: Event) => this.onInput(event)

  constructor(private readonly ctx: FrontendContext, private readonly root: HTMLElement, private readonly pickImage: (initial: string, choose: (image: StudioExpressionImage) => void) => void, private readonly manualSelection = new Map<string, ManualLoreSelection>(), private readonly onManualSelectionChange: () => void = () => {}) {
    root.classList.add("ss-lore-atelier")
    root.addEventListener("click", this.click)
    root.addEventListener("change", this.change)
    root.addEventListener("input", this.input)
    this.renderState("Loading your native lorebooks…")
  }

  activate(force = false): void {
    if (this.destroyed || this.pending || (this.data && !force)) return
    if (!this.canNavigate()) return
    this.request(this.data?.bookId || "", this.data?.entryId || "")
  }

  resume(): void { if (!this.dirty) this.activate(true) }

  onMessage(payload: any): boolean {
    if (this.destroyed || !this.pending || payload?.requestId !== this.pending.id) return false
    const success = payload.type === "visual_lore_result"
    if (!success && payload.type !== "studio_error") return false
    const saving = this.pending.save
    this.pending = null
    if (success) {
      this.data = payload.data
      // Refresh only entries from the book just read; preserve selections in other books.
      if (this.data?.available) {
        const book = (this.data.books || []).find((b: any) => b.id === this.data.bookId)
        for (const [key, item] of this.manualSelection) {
          if (!(this.data.books || []).some((b: any) => b.id === item.bookId)) { this.manualSelection.delete(key); continue }
          if (item.bookId !== this.data.bookId) continue
          const entry = (this.data.entries || []).find((e: any) => e.id === item.entryId)
          if (!entry?.hasVisualIdentity || !entry.visualEnabled) this.manualSelection.delete(key)
          else this.manualSelection.set(key, {...item, name: this.entryName(entry), bookName: String(book?.name || item.bookName), entityType: loreDisplayType(entry)})
        }
        this.onManualSelectionChange()
      }
      this.dirty = false
      this.notice = saving ? "Visual identity saved." : ""
      this.render()
    } else if (this.data?.available && this.root.querySelector('[data-role="visual-lore-directory"]')) {
      this.setBusy(false)
      this.renderManualSelection()
      this.status(String(payload.error || "Visual Lore request failed. Try again."), true)
      // Restore the authoritative book selection, without destroying unsaved fields.
      const book = this.root.querySelector<HTMLSelectElement>('[data-role="visual-lore-book"]')
      if (book) book.value = this.data.bookId || ""
    } else {
      this.renderState(String(payload.error || "Visual Lore could not be loaded."), true)
    }
    return true
  }

  destroy(): void {
    this.destroyed = true
    this.pending = null
    this.root.removeEventListener("click", this.click)
    this.root.removeEventListener("change", this.change)
    this.root.removeEventListener("input", this.input)
    this.root.replaceChildren()
  }

  private send(type: string, fields: any): void {
    if (this.pending || this.destroyed) return
    const id = createRequestId()
    this.pending = { id, save: type === "save_visual_lore" }
    this.setBusy(true)
    this.status(this.pending.save ? "Saving visual identity…" : "Loading lore…")
    try { this.ctx.sendToBackend({ type, requestId: id, ...fields }) }
    catch (error) { this.onMessage({ type: "studio_error", requestId: id, error: String(error) }) }
  }

  private request(bookId: string, entryId: string): void {
    this.send("get_visual_lore", { bookId, entryId })
  }

  private status(message: string, error = false): void {
    const status = this.root.querySelector<HTMLElement>('[data-role="visual-lore-status"]')
    if (status) { status.textContent = message; status.dataset.error = String(error) }
  }

  private canNavigate(): boolean {
    if (!this.dirty) return true
    this.status("Save or discard your edits before changing entries or refreshing.", true)
    return false
  }

  private setBusy(busy: boolean): void {
    this.root.setAttribute("aria-busy", String(busy))
    for (const control of this.root.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("button,input,textarea,select")) {
      control.disabled = busy || Boolean(control.closest('[data-role="visual-lore-editor"]') && !this.data?.selected)
    }
  }

  private renderState(message: string, error = false): void {
    const state = element("div", "ss-visual-lore-state")
    state.dataset.error = String(error)
    state.innerHTML = `${FOLDER_TREE_ICON}<strong>${error ? "Lore unavailable" : "Lore"}</strong><span></span>`
    state.querySelector("span")!.textContent = message
    if (error) {
      const retry = element("button", "ss-button", "Try again")
      retry.dataset.action = "refresh-visual-lore"
      state.appendChild(retry)
    }
    if (this.manualSelection.size) {
      const clear = element("button", "ss-button", "Clear manual Lore selection")
      clear.dataset.action = "lore-clear-manual"; state.append(clear)
    }
    this.root.replaceChildren(state)
  }

  private render(): void {
    if (!this.data?.available) return this.renderState("Grant World Books permission to manage visual identities on native lorebook entries.", true)
    const identity: VisualLoreIdentity | null = this.data.selected?.identity || null
    const entries = Array.isArray(this.data.entries) ? this.data.entries : []
    const root = element("div", "ss-visual-lore-shell")
    root.dataset.detail = String(this.detail)
    root.innerHTML = `
      <div class="ss-lore-overview"><header class="ss-lore-header"><div><span class="ss-eyebrow">WORLD ART DIRECTION</span><h1>Lore</h1><p>Give native lorebook entries a visual identity.</p></div><button class="ss-button" data-action="refresh-visual-lore">↻ Refresh</button></header>
      <div class="ss-lore-stats"><span><strong data-role="lore-count"></strong> entries</span><span><strong data-role="lore-configured"></strong> visual identities</span><span><strong data-role="lore-active"></strong> active visual layers</span></div></div>
      <div class="ss-visual-lore-workspace">
        <aside class="ss-lore-library">
          <div class="ss-lore-library-head"><h2>Lore library</h2><select class="ss-select" data-role="visual-lore-filter" aria-label="Filter lore entries"><option value="all">All entries</option><option value="active">Active visual layers</option><option value="selected">Selected for Generate</option><option value="configured">Has visual identity</option><option value="unconfigured">Needs visual identity</option><option value="unclassified">Unclassified type</option>${LORE_ENTITY_TYPES.map(type=>`<option value="${type}">${type[0].toUpperCase()+type.slice(1)}</option>`).join("")}</select></div>
          <div class="ss-visual-lore-toolbar">
            <label class="ss-field"><span>Lorebook</span><select class="ss-select" data-role="visual-lore-book"></select></label>
            <label class="ss-field"><span>Search lore</span><input class="ss-input" type="search" data-role="visual-lore-search" placeholder="Name, native key, alias…"></label>

          </div>
          <div class="ss-visual-lore-directory" data-role="visual-lore-directory"></div>
        </aside>
        <div class="ss-lore-editor" data-role="visual-lore-editor">
          <button class="ss-button ss-lore-back" data-action="lore-back">← Lore library</button>
          <div class="ss-lore-editor-empty" data-role="visual-lore-empty" hidden>${FOLDER_TREE_ICON}<h2>Select a lore entry</h2><p>Visual identities attach to existing native entries. Create new entries in Lumiverse's lorebook editor.</p></div>
          <div class="ss-visual-lore-form" data-role="visual-lore-form">
            <header class="ss-lore-selection"><div><span class="ss-eyebrow">VISUAL IDENTITY</span><h2 data-role="visual-lore-selected-name"></h2><div class="ss-lore-keyline" data-role="visual-lore-keys"></div></div><span class="ss-lore-badge" data-role="visual-lore-activation"></span></header>
            <section class="ss-lore-section"><h3>Identity</h3><div class="ss-lore-fields">
              <label class="ss-field"><span>Entity type</span><select class="ss-select" data-role="visual-lore-type"><option value="">Choose entity type</option>${LORE_ENTITY_TYPES.map(type => `<option value="${type}">${type[0].toUpperCase() + type.slice(1)}</option>`).join("")}</select></label>
              <label class="ss-field"><span>Visual aliases</span><input class="ss-input" data-role="visual-lore-aliases" placeholder="Victoria manor, the estate"><small>Aliases help the planner identify an eligible entry. Native keys still control eligibility.</small></label>
            </div></section>
            <section class="ss-lore-section"><h3>Prompt direction</h3><div class="ss-lore-fields ss-lore-prompt-fields">
              <label class="ss-field"><span>Positive prompt</span><textarea class="ss-textarea" data-role="visual-lore-positive" placeholder="Architecture, materials, lighting, distinctive details…"></textarea></label>
              <label class="ss-field"><span>Negative prompt</span><textarea class="ss-textarea" data-role="visual-lore-negative" placeholder="Details to avoid…"></textarea></label>
            </div></section>
            <section class="ss-lore-section"><details class="ss-visual-disclosure ss-lore-model-overrides" data-role="lore-model-overrides"><summary>Model prompt overrides<span data-role="lore-model-count"></span></summary><p>Blank fields inherit the shared prompt. Anima variants also inherit Anima overrides. Only explicitly selected, visible lore contributes.</p>
              ${PROMPT_FAMILIES.filter(item => item.id !== "auto").map(item => `<details class="ss-visual-disclosure ss-lore-model-override"><summary>${item.label}<span data-role="lore-model-status-${item.id}"></span></summary><div class="ss-lore-fields ss-lore-prompt-fields"><label class="ss-field"><span>Positive override</span><textarea class="ss-textarea" data-role="lore-positive-${item.id}" placeholder="Inherit shared prompt"></textarea></label><label class="ss-field"><span>Negative override</span><textarea class="ss-textarea" data-role="lore-negative-${item.id}" placeholder="Inherit shared prompt"></textarea></label></div></details>`).join("")}
            </details></section>
            <section class="ss-lore-section"><h3>Generation overrides</h3><p>These affect the whole image. Inline scenes may use them; manual Generate keeps its explicit checkpoint, canvas, recipe and reference. Non-conflicting LoRA weights can still be added.</p><div class="ss-lore-fields ss-lore-override-fields">
              <label class="ss-field"><span>Preferred aspect</span><select class="ss-select" data-role="visual-lore-aspect"><option value="">Scene default</option>${["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9"].map(aspect => `<option value="${aspect}">${aspect}</option>`).join("")}</select></label>
              <label class="ss-field"><span>Exact checkpoint override</span><input class="ss-input" data-role="visual-lore-checkpoint" list="ss-visual-lore-models" placeholder="Inherit scene checkpoint"><datalist id="ss-visual-lore-models"></datalist></label>
              <label class="ss-field"><span>LoRA stack</span><select class="ss-select" data-role="visual-lore-stack"><option value="">No lore-specific stack</option></select></label>
            </div></section>
            <section class="ss-lore-section"><h3>Reference image</h3><div class="ss-lore-reference"><div class="ss-lore-reference-preview" data-role="visual-lore-preview"></div><div class="ss-lore-reference-fields">
              <div class="ss-lore-reference-actions"><button class="ss-button" data-action="lore-pick-image">${LIBRARY_ICON} Choose from Library</button><button class="ss-button" data-action="lore-clear-image">Clear</button></div>
              <label class="ss-field"><span>Reference / init image ID</span><input class="ss-input" data-role="visual-lore-reference-id" placeholder="Lumiverse image ID"><small>For inline scenes, requested as whole-image reference conditioning at 0.60 creativity. Manual Generate keeps its own reference.</small></label>
              <label class="ss-field"><span>Fallback image URL</span><input class="ss-input" data-role="visual-lore-reference" placeholder="https://…"><small>Used when no image ID is set.</small></label>
            </div></div></section>
            <section class="ss-lore-section"><label class="ss-field"><span>Notes</span><textarea class="ss-textarea" data-role="visual-lore-notes" placeholder="Art direction notes for future reference…"></textarea></label></section>
            <footer class="ss-lore-savebar"><label class="ss-toggle-line"><input type="checkbox" data-role="visual-lore-enabled" checked> Eligible when native lore activates</label><div class="ss-lore-save-actions"><button class="ss-button ss-lore-use" data-action="lore-toggle-manual" aria-pressed="false">${LIBRARY_ICON}<span>Use in Generate</span></button><button class="ss-button" data-action="lore-discard">Discard edits</button><button class="ss-button ss-button-primary" data-action="save-visual-lore">Save visual identity</button></div></footer>
          </div>
        </div>
      </div>
      <div class="ss-lore-manual-tray"><div><strong data-role="lore-manual-count"></strong><small>Manual generation · saved prompts and non-conflicting LoRAs</small></div><button class="ss-button" data-action="lore-clear-manual">Clear</button><button class="ss-button ss-button-primary" data-action="lore-return-generate">Open Generate</button></div>
      <div class="ss-chat-visuals-status ss-lore-status" data-role="visual-lore-status" role="status" aria-live="polite"></div>`
    this.root.replaceChildren(root)
    const get = <T extends HTMLElement>(role: string) => root.querySelector<T>(`[data-role="${role}"]`)!
    get("lore-count").textContent = String(entries.length)
    get("lore-configured").textContent = String(entries.filter((e: any) => e.hasVisualIdentity).length)
    get("lore-active").textContent = String(entries.filter((e: any) => e.activated && e.visualEnabled).length)
    const book = get<HTMLSelectElement>("visual-lore-book")
    const bookGroups = new Map<string, HTMLOptGroupElement>()
    for (const item of this.data.books || []) {
      const option = element("option", "", item.name); option.value = item.id
      const folder = String(item.folder || "").trim()
      if (!folder) { book.append(option); continue }
      let group = bookGroups.get(folder)
      if (!group) { group = document.createElement("optgroup"); group.label = folder; bookGroups.set(folder, group); book.append(group) }
      group.append(option)
    }
    book.value = this.data.bookId || ""
    get<HTMLInputElement>("visual-lore-search").value = this.search
    get<HTMLSelectElement>("visual-lore-filter").value = this.filter
    get("visual-lore-form").hidden = !this.data.selected
    get("visual-lore-empty").hidden = Boolean(this.data.selected)
    const set = (role: string, value: unknown) => { get<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(role).value = String(value || "") }
    set("visual-lore-type", loreDisplayType(this.data.selected))
    set("visual-lore-aliases", identity?.aliases?.join(", ") ?? this.data.selected?.keys?.join(", ") ?? "")
    set("visual-lore-positive", identity?.positivePrompt)
    set("visual-lore-negative", identity?.negativePrompt)
    get("lore-model-count").textContent = Object.keys(identity?.modelPrompts || {}).length ? `${Object.keys(identity?.modelPrompts || {}).length} customized` : "Inherit shared"
    for (const {id} of PROMPT_FAMILIES) {
      if (id === "auto") continue
      const override = identity?.modelPrompts?.[id]
      set(`lore-positive-${id}`, override?.positivePrompt)
      set(`lore-negative-${id}`, override?.negativePrompt)
      get(`lore-model-status-${id}`).textContent = override?.positivePrompt || override?.negativePrompt ? "Customized" : "Inherited"
    }
    set("visual-lore-aspect", identity?.preferredAspect)
    set("visual-lore-checkpoint", identity?.checkpoint)
    const stack = get<HTMLSelectElement>("visual-lore-stack")
    for (const preset of this.data.stackPresets || []) { const option = element("option", "", preset.name); option.value = preset.id; stack.append(option) }
    if (identity?.stackPresetId && !Array.from(stack.options).some(o => o.value === identity.stackPresetId)) { const option = element("option", "", "Unavailable saved stack"); option.value = identity.stackPresetId; stack.append(option) }
    stack.value = identity?.stackPresetId || ""
    const modelList = root.querySelector<HTMLDataListElement>("#ss-visual-lore-models")!
    for (const model of this.data.models || []) { const option = document.createElement("option"); option.value = model.id; option.label = model.label; modelList.append(option) }
    set("visual-lore-reference-id", identity?.referenceImageId)
    set("visual-lore-reference", identity?.referenceImageUrl)
    set("visual-lore-notes", identity?.notes)
    get("visual-lore-selected-name").textContent = this.entryName(this.data.selected)
    get("visual-lore-keys").textContent = `Native keys: ${this.data.selected?.keys?.join(", ") || "None"}`
    const selected = entries.find((e: any) => e.id === this.data.entryId)
    get("visual-lore-activation").textContent = selected?.activated ? "Native lore active" : "Native lore inactive"
    get("visual-lore-activation").dataset.active = String(Boolean(selected?.activated))
    get<HTMLInputElement>("visual-lore-enabled").checked = identity?.enabled !== false
    this.renderDirectory()
    this.renderPreview()
    this.setBusy(false)
    this.renderManualSelection()
    this.status(this.notice)
  }

  private renderManualSelection(): void {
    const selected = this.data?.selected
    const key = manualLoreKey(String(this.data?.bookId || ""), String(selected?.id || ""))
    const added = this.manualSelection.has(key)
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="lore-toggle-manual"]')
    if (button) {
      button.setAttribute("aria-pressed", String(added))
      button.disabled = Boolean(this.pending) || (!added && (this.dirty || !selected?.identity?.enabled || this.manualSelection.size >= MANUAL_LORE_LIMIT))
      button.title = this.dirty && !added ? "Save the identity first" : !selected?.identity?.enabled && !added ? "Save and enable a visual identity first" : "Select this saved identity for manual generation"
      button.querySelector("span")!.textContent = added ? "Remove from Generate" : "Use in Generate"
    }
    const count = this.root.querySelector<HTMLElement>('[data-role="lore-manual-count"]')
    if (count) count.textContent = `${this.manualSelection.size} selected for Generate`
    const clear = this.root.querySelector<HTMLButtonElement>('[data-action="lore-clear-manual"]')
    if (clear) clear.disabled = Boolean(this.pending) || !this.manualSelection.size
  }

  private entryName(entry: any): string { return String(entry?.comment || entry?.keys?.[0] || "Untitled lore entry") }

  private renderDirectory(): void {
    const target = this.root.querySelector<HTMLElement>('[data-role="visual-lore-directory"]')
    if (!target) return
    target.replaceChildren()
    const query = this.search.trim().toLowerCase()
    const allEntries: any[] = Array.isArray(this.data?.entries) ? this.data.entries : []
    const entries = allEntries.filter((entry: any) => {
      const type = loreDisplayType(entry)
      const match = !query || [entry.comment, entry.folder, ...(entry.tags || []), ...(entry.keys || []), ...(entry.aliases || [])].some(value => String(value || "").toLowerCase().includes(query))
      const filter = this.filter === "all" || (this.filter === "active" ? entry.activated && entry.visualEnabled : this.filter === "selected" ? this.manualSelection.has(manualLoreKey(String(this.data.bookId), String(entry.id))) : this.filter === "configured" ? entry.hasVisualIdentity : this.filter === "unconfigured" ? !entry.hasVisualIdentity : this.filter === "unclassified" ? !type : type === this.filter)
      return match && filter
    })
    const appendGroup = (label: string, items: any[], folder?: string) => {
      if (!items.length) return
      const group = element("section", "ss-visual-lore-group")
      let body: HTMLElement = group
      if (folder !== undefined) {
        group.classList.add("ss-lore-folder")
        const key = JSON.stringify([this.data.bookId, folder])
        const open = Boolean(query || this.filter !== "all") || (this.folderOpen.get(key) ?? items.some(e => e.id === this.data.entryId))
        const toggle = element("button", "ss-lore-folder-toggle")
        toggle.type = "button"
        toggle.dataset.action = "toggle-lore-folder"
        toggle.dataset.folderKey = key
        toggle.setAttribute("aria-expanded", String(open))
        toggle.innerHTML = `${FOLDER_ICON}<strong></strong><span class="ss-lore-folder-count"></span><svg class="ss-lore-folder-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`
        toggle.querySelector("strong")!.textContent = label
        toggle.querySelector(".ss-lore-folder-count")!.textContent = String(items.length)
        const active = items.filter(e => e.activated && e.visualEnabled).length
        if (active) { const badge = element("span", "ss-lore-badge", `${active} active`); badge.dataset.active = "true"; toggle.insertBefore(badge, toggle.lastElementChild) }
        body = element("div", "ss-lore-folder-entries")
        body.hidden = !open
        group.append(toggle, body)
      } else group.appendChild(element("strong", "ss-visual-lore-group-title", label))
      for (const entry of items) {
        const button = element("button", "ss-visual-lore-entry")
        button.dataset.action = "select-visual-lore-entry"
        button.dataset.entryId = String(entry.id || "")
        button.dataset.selected = String(entry.id === this.data.entryId)
        button.dataset.activated = String(entry.activated === true)
        button.setAttribute("aria-pressed", button.dataset.selected)
        const thumb = element("span", "ss-lore-thumb")
        const type = loreDisplayType(entry)
        thumb.textContent = type ? type.slice(0, 1).toUpperCase() : "◇"
        if (entry.referenceImageId) {
          const img = document.createElement("img"); img.alt = ""; img.loading = "lazy"; img.src = `/api/v1/images/${encodeURIComponent(entry.referenceImageId)}`; img.addEventListener("error", () => img.remove(), { once: true }); thumb.append(img)
        }
        const copy = element("span", "ss-visual-lore-entry-copy")
        copy.append(element("strong", "", this.entryName(entry)), element("span", "ss-muted", type ? `${type} · ${entry.hasVisualIdentity ? "Visual identity" : "Unconfigured"}` : "Unclassified · New"))
        const state = element("span", "ss-lore-badge", entry.activated && entry.visualEnabled ? "Active" : entry.activated ? "Native active" : entry.hasVisualIdentity ? entry.visualEnabled ? "Ready" : "Disabled" : "New")
        state.dataset.active = String(Boolean(entry.activated && entry.visualEnabled))
        if (this.manualSelection.has(manualLoreKey(String(this.data.bookId), String(entry.id)))) {
          const selected = element("span", "ss-lore-manual-mark", "✓")
          selected.title = "Selected for manual generation"; selected.setAttribute("aria-label", selected.title)
          copy.append(selected)
        }
        button.append(thumb, copy, state)
        body.append(button)
      }
      target.append(group)
    }
    if (allEntries.some(e => String(e.folder || "").trim())) {
      const folders = new Map<string, any[]>()
      for (const entry of entries) {
        const name = String(entry.folder || "").trim()
        if (!folders.has(name)) folders.set(name, [])
        folders.get(name)!.push(entry)
      }
      for (const [name, items] of folders) appendGroup(name || "Unfiled", items, name)
    } else {
      appendGroup("Activated now", entries.filter((e: any) => e.activated))
      appendGroup("All other lore", entries.filter((e: any) => !e.activated))
    }
    if (!entries.length) target.append(element("div", "ss-empty", query || this.filter !== "all" ? "No lore entries match this filter." : "This lorebook has no entries."))
  }

  private value(role: string): string { return this.root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-role="${role}"]`)?.value || "" }
  private markDirty(): void { this.dirty = true; this.renderManualSelection(); this.status("Unsaved edits") }
  private showDetail(detail: boolean): void {
    this.detail = detail
    const shell = this.root.querySelector<HTMLElement>(".ss-visual-lore-shell")
    if (shell) shell.dataset.detail = String(detail)
    this.root.querySelector<HTMLElement>(detail ? ".ss-lore-editor" : ".ss-lore-library")?.scrollTo(0, 0)
  }
  private renderPreview(): void {
    const target = this.root.querySelector<HTMLElement>('[data-role="visual-lore-preview"]')
    if (!target) return
    target.replaceChildren(element("span", "ss-muted", "No reference image"))
    const id = this.value("visual-lore-reference-id").trim()
    const url = this.value("visual-lore-reference").trim()
    if (!id && !/^https?:\/\//i.test(url)) return
    const image = document.createElement("img")
    image.alt = "Visual lore reference"
    image.referrerPolicy = "no-referrer"
    image.addEventListener("error", () => { if (target.contains(image)) target.replaceChildren(element("span", "ss-muted", "Reference unavailable")) }, { once: true })
    image.src = id ? `/api/v1/images/${encodeURIComponent(id)}` : url
    target.replaceChildren(image)
  }
  private onChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    if (this.pending) return
    if (target.dataset.role === "visual-lore-book") {
      if (!this.canNavigate()) { target.value = this.data.bookId; return }
      this.detail = false; this.request(target.value, "")
    } else if (target.dataset.role === "visual-lore-filter") { this.filter = target.value; this.renderDirectory() }
    else if (target.closest('[data-role="visual-lore-form"]')) { this.markDirty(); if (target.dataset.role?.startsWith("visual-lore-reference")) this.renderPreview() }
  }
  private onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    if (this.pending) return
    if (target.dataset.role === "visual-lore-search") { this.search = target.value; this.renderDirectory() }
    else if (target.closest('[data-role="visual-lore-form"]')) this.markDirty()
  }
  private onClick(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
    const action = button?.dataset.action || ""
    if (this.pending || this.destroyed) return
    if (action === "toggle-lore-folder" && button) {
      const open = button.getAttribute("aria-expanded") !== "true"
      this.folderOpen.set(button.dataset.folderKey || "", open)
      button.setAttribute("aria-expanded", String(open))
      const body = button.nextElementSibling as HTMLElement | null
      if (body) body.hidden = !open
      return
    }
    if (action === "lore-clear-manual") {
      this.manualSelection.clear(); this.onManualSelectionChange(); this.renderManualSelection(); this.renderDirectory()
      if (!this.data?.available) button?.remove()
      return
    }
    if (action === "lore-toggle-manual") {
      const entry = this.data?.selected
      if (!entry) return
      const bookId = String(this.data.bookId), entryId = String(entry.id), key = manualLoreKey(bookId, entryId)
      if (this.manualSelection.has(key)) this.manualSelection.delete(key)
      else {
        if (this.dirty || !entry.identity?.enabled || this.manualSelection.size >= MANUAL_LORE_LIMIT) return
        const book = (this.data.books || []).find((b: any) => b.id === bookId)
        this.manualSelection.set(key, {bookId, entryId, bookName: String(book?.name || "Lorebook"), name: this.entryName(entry), entityType: loreDisplayType(entry)})
      }
      this.onManualSelectionChange(); this.renderManualSelection(); this.renderDirectory(); return
    }
    if (action === "refresh-visual-lore") return this.activate(true)
    if (action === "lore-back") { if (this.canNavigate()) this.showDetail(false); return }
    if (action === "lore-discard") { this.dirty = false; this.notice = "Edits discarded."; this.render(); return }
    if (action === "select-visual-lore-entry") {
      if (button?.dataset.entryId === this.data?.entryId) { this.showDetail(true); return }
      if (!this.canNavigate()) return
      this.detail = true; this.request(String(this.data?.bookId || ""), button?.dataset.entryId || ""); return
    }
    if (!this.data?.selected) return
    if (action === "lore-pick-image") {
      const entryId = this.data.entryId
      this.pickImage(this.value("visual-lore-reference-id"), image => {
        if (this.destroyed || this.pending || this.data.entryId !== entryId) return
        this.root.querySelector<HTMLInputElement>('[data-role="visual-lore-reference-id"]')!.value = image.id
        this.markDirty(); this.renderPreview()
      }); return
    }
    if (action === "lore-clear-image") {
      for (const role of ["visual-lore-reference-id", "visual-lore-reference"]) this.root.querySelector<HTMLInputElement>(`[data-role="${role}"]`)!.value = ""
      this.markDirty(); this.renderPreview(); return
    }
    if (action !== "save-visual-lore") return
    if (!LORE_ENTITY_TYPES.includes(this.value("visual-lore-type"))) {
      this.status("Choose an entity type before saving the visual identity.", true)
      return
    }
    const existing: VisualLoreIdentity | null = this.data.selected?.identity || null
    const stackPresetId = this.value("visual-lore-stack")
    this.send("save_visual_lore", { bookId: this.data.bookId, entryId: this.data.entryId, identity: {
      ...existing,
      enabled: this.root.querySelector<HTMLInputElement>('[data-role="visual-lore-enabled"]')?.checked !== false,
      entityType: this.value("visual-lore-type"),
      aliases: this.value("visual-lore-aliases").split(/[,|\n]+/).map(item => item.trim()).filter(Boolean),
      positivePrompt: this.value("visual-lore-positive"), negativePrompt: this.value("visual-lore-negative"),
      modelPrompts: Object.fromEntries(PROMPT_FAMILIES.filter(item => item.id !== "auto").flatMap(({id}) => {
        const positivePrompt = this.value(`lore-positive-${id}`).trim(), negativePrompt = this.value(`lore-negative-${id}`).trim()
        return positivePrompt || negativePrompt ? [[id, {positivePrompt, negativePrompt}]] : []
      })),
      checkpointFamily: existing?.checkpointFamily || "", checkpoint: this.value("visual-lore-checkpoint"),
      stackPresetId, stackSnapshot: stackPresetId === existing?.stackPresetId ? existing?.stackSnapshot || [] : [],
      preferredAspect: this.value("visual-lore-aspect"), referenceImageId: this.value("visual-lore-reference-id"), referenceImageUrl: this.value("visual-lore-reference"),
      recipe: existing?.recipe || {}, notes: this.value("visual-lore-notes"),
    } })
  }
}
