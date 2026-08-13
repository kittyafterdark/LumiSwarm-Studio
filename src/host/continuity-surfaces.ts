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
    return this.tab?.root?.querySelector<T>(`[data-role="${role}"]`) || null
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

class VisualLorebookHostController {
  private readonly ctx: FrontendContext
  private readonly root: HTMLElement
  private data: any = null
  private loaded = false
  private loading = false
  private search = ""

  constructor(ctx: FrontendContext, root: HTMLElement) {
    this.ctx = ctx
    this.root = root
    this.root.className = "ss-visual-lorebook-host"
    this.root.addEventListener("click", (event: Event) => this.onClick(event))
    this.root.addEventListener("change", (event: Event) => this.onChange(event))
    this.root.addEventListener("input", (event: Event) => this.onInput(event))
    this.renderState("Open Lore to read visual identities from your native lorebooks.")
  }

  activate(force = false): void {
    if (this.loading) return
    if (this.loaded && !force) {
      this.render()
      return
    }
    this.loading = true
    this.renderState("Loading visual lore…")
    this.request(this.data?.bookId || "", this.data?.entryId || "")
  }

  onMessage(payload: any): void {
    if (payload?.type === "visual_lore_result") {
      this.loading = false
      this.loaded = true
      this.data = payload.data
      this.render()
      return
    }
    if (payload?.type === "studio_error" && ["get_visual_lore", "save_visual_lore"].includes(String(payload.operation || ""))) {
      this.loading = false
      this.renderState(String(payload.error || "Visual Lore could not be loaded."), true)
    }
  }

  destroy(): void {
    this.root.replaceChildren()
  }

  private request(bookId: string, entryId: string): void {
    this.ctx.sendToBackend({ type: "get_visual_lore", requestId: createRequestId(), bookId, entryId })
  }

  private renderState(message: string, error = false): void {
    const state = element("div", "ss-visual-lore-state")
    state.dataset.error = String(error)
    state.innerHTML = `${FOLDER_TREE_ICON}<strong>${error ? "Visual Lore unavailable" : "Visual Lore"}</strong><span></span>`
    state.querySelector("span")!.textContent = message
    if (error) {
      const retry = element("button", "ss-button", "Try again")
      retry.dataset.action = "refresh-visual-lore"
      state.appendChild(retry)
    }
    this.root.replaceChildren(state)
  }

  private render(): void {
    if (!this.data) return this.renderState("Select Lore to load native lore entries.")
    if (!this.data.available) {
      this.renderState("Grant World Books permission to add visual identity metadata to native lore entries.", true)
      return
    }
    const identity: VisualLoreIdentity | null = this.data.selected?.identity || null
    const root = element("div", "ss-visual-lore-shell")
    root.innerHTML = `
      <header class="ss-host-continuity-head"><div><strong>Visual Lore</strong><span class="ss-muted ss-tiny">World art direction layered onto native lorebook entries</span></div><button class="ss-icon-button" data-action="refresh-visual-lore" title="Refresh visual lore" aria-label="Refresh visual lore">↻</button></header>
      <div class="ss-visual-lore-toolbar">
        <label class="ss-field"><span>Lorebook</span><select class="ss-select" data-role="visual-lore-book"></select></label>
        <label class="ss-field"><span>Search lore</span><input class="ss-input" type="search" data-role="visual-lore-search" placeholder="Location, object, outfit…"></label>
      </div>
      <div class="ss-visual-lore-workspace">
        <div class="ss-visual-lore-directory" data-role="visual-lore-directory"></div>
        <div class="ss-visual-lore-form">
          <div class="ss-visual-lore-selection-head"><div><strong data-role="visual-lore-selected-name">Select a lore entry</strong><span class="ss-muted ss-tiny">Native lore activation decides when this layer applies.</span></div></div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-field"><span>Entity type</span><select class="ss-select" data-role="visual-lore-type">${["character", "location", "object", "creature", "outfit", "style"].map((type) => `<option value="${type}">${type[0].toUpperCase() + type.slice(1)}</option>`).join("")}</select></label>
            <label class="ss-field"><span>Visual aliases · metadata</span><input class="ss-input" data-role="visual-lore-aliases" placeholder="Victoria manor, the estate"><small>Saved as descriptive metadata; native lore keys control activation.</small></label>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-field"><span>Positive tags</span><textarea class="ss-textarea" data-role="visual-lore-positive"></textarea></label>
            <label class="ss-field"><span>Negative tags</span><textarea class="ss-textarea" data-role="visual-lore-negative"></textarea></label>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-field"><span>Preferred aspect</span><select class="ss-select" data-role="visual-lore-aspect"><option value="">Scene default</option>${["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9"].map((aspect) => `<option value="${aspect}">${aspect}</option>`).join("")}</select></label>
            <label class="ss-field"><span>Exact checkpoint override</span><input class="ss-input" data-role="visual-lore-checkpoint" list="ss-visual-lore-models" placeholder="Inherit scene checkpoint"><datalist id="ss-visual-lore-models"></datalist></label>
            <label class="ss-field"><span>LoRA stack</span><select class="ss-select" data-role="visual-lore-stack"><option value="">No lore-specific stack</option></select></label>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-field"><span>Reference / init image ID</span><input class="ss-input" data-role="visual-lore-reference-id" placeholder="Lumiverse image ID"><small>Applied to tagged generation as reference conditioning at 0.60 creativity.</small></label>
            <label class="ss-field"><span>Reference / init image URL</span><input class="ss-input" data-role="visual-lore-reference"><small>Used when no Lumiverse image ID is set; unresolved references do not block generation.</small></label>
          </div>
          <label class="ss-field"><span>Notes</span><textarea class="ss-textarea" data-role="visual-lore-notes"></textarea></label>
          <div class="ss-host-continuity-actions">
            <label class="ss-toggle-line"><input type="checkbox" data-role="visual-lore-enabled" checked> Active when lore entry activates</label>
            <button class="ss-button ss-button-primary" data-action="save-visual-lore">Save visual identity</button>
          </div>
          <div class="ss-chat-visuals-status" data-role="visual-lore-status"></div>
        </div>
      </div>
    `
    this.root.replaceChildren(root)
    const book = root.querySelector<HTMLSelectElement>('[data-role="visual-lore-book"]')!
    for (const item of this.data.books || []) {
      const option = element("option", "", item.name)
      option.value = item.id
      book.appendChild(option)
    }
    book.value = this.data.bookId || ""
    root.querySelector<HTMLInputElement>('[data-role="visual-lore-search"]')!.value = this.search
    this.renderDirectory()
    const set = (role: string, value: unknown) => {
      const input = root.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[data-role="${role}"]`)
      if (input) input.value = String(value || "")
    }
    set("visual-lore-type", identity?.entityType || "location")
    set("visual-lore-aliases", identity?.aliases?.join(", ") || this.data.selected?.keys?.join(", ") || "")
    set("visual-lore-positive", identity?.positivePrompt)
    set("visual-lore-negative", identity?.negativePrompt)
    set("visual-lore-aspect", identity?.preferredAspect)
    set("visual-lore-checkpoint", identity?.checkpoint)
    const stack = root.querySelector<HTMLSelectElement>('[data-role="visual-lore-stack"]')!
    for (const preset of this.data.stackPresets || []) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      stack.appendChild(option)
    }
    stack.value = identity?.stackPresetId || ""
    const modelList = root.querySelector<HTMLDataListElement>("#ss-visual-lore-models")!
    for (const model of this.data.models || []) {
      const option = document.createElement("option")
      option.value = model.id
      option.label = model.label
      modelList.appendChild(option)
    }
    set("visual-lore-reference-id", identity?.referenceImageId)
    set("visual-lore-reference", identity?.referenceImageUrl)
    set("visual-lore-notes", identity?.notes)
    root.querySelector<HTMLElement>('[data-role="visual-lore-selected-name"]')!.textContent = this.entryName(this.data.selected)
    root.querySelector<HTMLInputElement>('[data-role="visual-lore-enabled"]')!.checked = identity?.enabled !== false
  }

  private entryName(entry: any): string {
    return String(entry?.comment || entry?.keys?.[0] || "Untitled lore entry")
  }

  private renderDirectory(): void {
    const target = this.root.querySelector<HTMLElement>('[data-role="visual-lore-directory"]')
    if (!target) return
    target.replaceChildren()
    const query = this.search.trim().toLowerCase()
    const entries = (Array.isArray(this.data?.entries) ? this.data.entries : []).filter((entry: any) => {
      if (!query) return true
      return [entry.comment, ...(entry.keys || [])].some((value) => String(value || "").toLowerCase().includes(query))
    })
    const appendGroup = (label: string, items: any[]) => {
      if (!items.length) return
      const group = element("section", "ss-visual-lore-group")
      group.appendChild(element("strong", "ss-visual-lore-group-title", label))
      for (const entry of items) {
        const button = element("button", "ss-visual-lore-entry")
        button.dataset.action = "select-visual-lore-entry"
        button.dataset.entryId = String(entry.id || "")
        button.dataset.selected = String(entry.id === this.data.entryId)
        button.dataset.activated = String(entry.activated === true)
        const mark = element("span", "ss-visual-lore-mark", entry.hasVisualIdentity ? "◆" : "◇")
        const copy = element("span", "ss-visual-lore-entry-copy")
        copy.append(
          element("strong", "", this.entryName(entry)),
          element("span", "ss-muted ss-tiny", entry.hasVisualIdentity ? "Visual identity" : "No visual identity"),
        )
        button.append(mark, copy)
        group.appendChild(button)
      }
      target.appendChild(group)
    }
    const activated = entries.filter((entry: any) => entry.activated)
    appendGroup("Activated now", activated)
    appendGroup("All lore", entries.filter((entry: any) => !entry.activated))
    if (!entries.length) target.appendChild(element("div", "ss-empty", query ? "No lore entries match this search." : "This lorebook has no entries."))
  }

  private value<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(role: string): string {
    return this.root.querySelector<T>(`[data-role="${role}"]`)?.value || ""
  }

  private onChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    if (target.dataset.role === "visual-lore-book") {
      this.loading = true
      this.request(target.value, "")
    }
  }

  private onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    if (target.dataset.role !== "visual-lore-search") return
    this.search = target.value
    this.renderDirectory()
  }

  private onClick(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
    const action = button?.dataset.action || ""
    if (action === "refresh-visual-lore") return this.activate(true)
    if (action === "select-visual-lore-entry") {
      this.loading = true
      this.request(String(this.data?.bookId || ""), button?.dataset.entryId || "")
      return
    }
    if (action !== "save-visual-lore" || !this.data?.bookId || !this.data?.entryId) return
    const list = (value: string) => value.split(/[,|\n]+/).map((item) => item.trim()).filter(Boolean)
    const enabled = this.root.querySelector<HTMLInputElement>('[data-role="visual-lore-enabled"]')?.checked !== false
    const existing: VisualLoreIdentity | null = this.data.selected?.identity || null
    const status = this.root.querySelector<HTMLElement>('[data-role="visual-lore-status"]')
    if (status) status.textContent = "Saving visual identity…"
    this.ctx.sendToBackend({
      type: "save_visual_lore",
      requestId: createRequestId(),
      bookId: this.data.bookId,
      entryId: this.data.entryId,
      identity: {
        enabled,
        entityType: this.value<HTMLSelectElement>("visual-lore-type"),
        aliases: list(this.value<HTMLInputElement>("visual-lore-aliases")),
        positivePrompt: this.value<HTMLTextAreaElement>("visual-lore-positive"),
        negativePrompt: this.value<HTMLTextAreaElement>("visual-lore-negative"),
        checkpointFamily: existing?.checkpointFamily || "",
        checkpoint: this.value<HTMLInputElement>("visual-lore-checkpoint"),
        stackPresetId: this.value<HTMLSelectElement>("visual-lore-stack"),
        preferredAspect: this.value<HTMLSelectElement>("visual-lore-aspect"),
        referenceImageId: this.value<HTMLInputElement>("visual-lore-reference-id"),
        referenceImageUrl: this.value<HTMLInputElement>("visual-lore-reference"),
        recipe: existing?.recipe || {},
        notes: this.value<HTMLTextAreaElement>("visual-lore-notes"),
      },
    })
  }
}
