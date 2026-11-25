class ChatVisualsController {
  private readonly ctx: FrontendContext
  private readonly getCurrentStack: () => StackPresetItem[] | null
  private readonly openLibrary: () => void
  private readonly page: HTMLElement
  private activeTab: "character" | "persona" = "character"
  private data: ChatVisualsState | null = null
  private selectedPersonaPresetId = ""
  private selectedStackValue = ""
  private importedSourcePresetId = ""
  private importedCharacterSourcePresetId = ""
  private selectedLookId = "default"
  private lumiversePersonaPresets: LumiversePromptPreset[] = []
  private lumiverseCharacterPresets: LumiversePromptPreset[] = []
  private lumiverseMainPresets: LumiversePromptPreset[] = []
  private lumiversePresetLoadToken = 0

  constructor(
    ctx: FrontendContext,
    root: HTMLElement,
    getCurrentStack: () => StackPresetItem[] | null,
    openLibrary: () => void,
  ) {
    this.ctx = ctx
    this.getCurrentStack = getCurrentStack
    this.openLibrary = openLibrary
    this.page = element("section", "ss-chat-visuals-page")
    this.page.innerHTML = `
      <div class="ss-chat-visuals-head">
        <div class="ss-chat-visuals-head-copy">
          <span class="ss-eyebrow">CHAT ART DIRECTION</span>
          <h1>Visuals</h1>
          <p>Manage the active character’s visual identity, looks and persona profiles.</p>
        </div>
        <nav class="ss-chat-visuals-tabs" role="tablist" aria-label="Visual identity sections">
          <button class="ss-chat-visuals-tab" data-action="visuals-tab" data-visual-tab="character" role="tab">Character</button>
          <button class="ss-chat-visuals-tab" data-action="visuals-tab" data-visual-tab="persona" role="tab">Persona</button>
        </nav>
        <div class="ss-visuals-head-actions">
          <button class="ss-button" data-action="visuals-open-library">${LIBRARY_ICON} Library</button>
          <button class="ss-button" data-action="visuals-refresh" title="Refresh active chat context">Refresh</button>
        </div>
      </div>
      <div class="ss-chat-visuals-scroll">
        <div class="ss-chat-visuals-context" data-role="visuals-context"></div>

        <div class="ss-chat-visuals-panel ss-persona-workspace" data-visual-panel="persona" hidden>
        <aside class="ss-persona-directory" aria-label="Persona profile directory">
          <div class="ss-persona-directory-head">
            <div><span class="ss-visual-kicker">PERSONA LIBRARY</span><h2>Profiles</h2><span class="ss-visual-helper" data-role="persona-profile-count"></span></div>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-persona-profile" class="ss-select ss-visual-fallback" data-role="persona-visual-preset" aria-label="Visual profile"></select>
              <button class="ss-icon-button ss-button-danger" data-action="delete-persona-visual" title="Delete selected persona visual profile" aria-label="Delete persona visual profile">${TRASH_ICON}</button>
            </div>
          </div>
          <button class="ss-button ss-persona-create" data-action="new-persona-visual" title="Create a profile from the current identity and bind it" aria-label="Create persona visual profile">${PLUS_ICON} New profile</button>
          <div class="ss-visual-card-rail ss-visual-profile-rail" data-role="persona-profile-cards" role="group" aria-label="Saved persona profiles"></div>
        </aside>
        <section class="ss-chat-visuals-section ss-persona-editor">
          <div class="ss-chat-visuals-section-head">
            <div><span class="ss-visual-kicker">PERSONA PROFILE</span><strong data-role="persona-title">Persona</strong><span data-role="persona-caption">The active Lumiverse persona can own a reusable image identity.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="persona-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-visual-editor-body" data-role="persona-editor-body">
          <div class="ss-chat-visuals-field ss-visual-writing">
            <label for="ss-chat-persona-positive">Visual identity</label>
            <textarea id="ss-chat-persona-positive" class="ss-textarea" data-role="persona-positive" placeholder="Visual traits for the active persona…"></textarea>
          </div>
          <details class="ss-visual-disclosure"><summary>Import a Lumiverse preset</summary>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-lumi-preset">Lumiverse Image Gen persona preset</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-lumi-preset" class="ss-select" data-role="lumiverse-persona-preset"><option value="">Loading persona presets…</option></select>
              <button class="ss-button" data-action="import-persona-prompt">Use preset</button>
            </div>
          </div></details>
          </div>
          <div class="ss-chat-visuals-actions">
            <span class="ss-chat-visuals-binding-state" data-role="persona-binding-state" data-state="unbound">${BINDING_LINK_ICON}<span>Not bound</span></span>
            <button class="ss-button ss-button-primary" data-role="save-persona-visual" data-action="save-persona-visual">Save &amp; bind to active persona</button>
          </div>
        </section>
        </div>

        <div class="ss-chat-visuals-panel" data-visual-panel="character" data-character-detail="identity">
        <div class="ss-visuals-character-nav" role="group" aria-label="Character editor section">
          <button class="ss-button" data-action="visuals-character-section" data-section="identity" aria-pressed="true">Identity &amp; LoRAs</button>
          <button class="ss-button" data-action="visuals-character-section" data-section="looks" aria-pressed="false">Looks</button>
        </div>
        <div class="ss-visuals-character-base">
        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><span class="ss-visual-kicker">BASE IDENTITY</span><strong data-role="character-title">Character</strong><span data-role="character-folder-caption">Creates the Library folder and keeps these prompts synchronized with it.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="character-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-visual-editor-body" data-role="character-editor-body">
          <div class="ss-visual-prompt-stack">
            <div class="ss-chat-visuals-field ss-visual-writing">
              <label for="ss-chat-character-positive">Appearance</label>
              <textarea id="ss-chat-character-positive" class="ss-textarea" data-role="character-positive" placeholder="Stable visual identity for the active character…"></textarea>
            </div>
            <div class="ss-chat-visuals-field ss-visual-negative">
              <label for="ss-chat-character-negative">Avoid</label>
              <textarea id="ss-chat-character-negative" class="ss-textarea" data-role="character-negative" placeholder="Things to consistently avoid…"></textarea>
            </div>
          </div>
          <details class="ss-visual-disclosure"><summary>Import a Lumiverse preset</summary>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-lumi-character-preset">Lumiverse Image Gen preset</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-lumi-character-preset" class="ss-select" data-role="lumiverse-character-preset"><option value="">Loading character presets…</option></select>
              <button class="ss-button" data-action="import-character-prompt">Use preset</button>
            </div>
          </div></details>
          <details class="ss-visual-disclosure"><summary>Model &amp; reference settings</summary>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-character-checkpoint">Checkpoint</label>
            <select id="ss-chat-character-checkpoint" class="ss-select" data-role="character-checkpoint"><option value="">Use current Studio checkpoint</option></select>
          </div>
          <div class="ss-anima-settings">
            <label class="ss-toggle-line ss-anima-toggle"><input type="checkbox" data-role="character-anima-reference"><span>Use Anima Reference Adapter</span></label>
            <label class="ss-chat-visuals-field"><span>Character reference image URL</span><input class="ss-input" data-role="character-anima-url" placeholder="Lumiverse image URL"></label>
            <div class="ss-anima-actions">
              <a class="ss-anima-setup" href="https://github.com/ArcAnima/ComfyUI-Anima-Ref-Adapter#quick-start" target="_blank" rel="noopener noreferrer">ComfyUI node setup</a>
            </div>
          </div></details>
          <details class="ss-visual-disclosure"><summary>Character LoRA stack <span data-role="visual-stack-summary"></span></summary>
          <p class="ss-visual-helper">Saved presets stay named; edited Studio state is captured as a Custom snapshot.</p>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-stack">Stack source</label>
            <select id="ss-chat-stack" class="ss-select" data-role="character-stack"></select>
          </div>
          <div class="ss-muted ss-tiny" data-role="character-stack-caption"></div>
          </details>
          </div>
          <div class="ss-chat-visuals-actions">
            <span class="ss-chat-visuals-binding-state" data-role="character-binding-state" data-state="unbound">${BINDING_LINK_ICON}<span>Not bound</span></span>
            <button class="ss-button ss-button-primary" data-role="save-character-visuals" data-action="save-character-visuals">Save character visuals</button>
          </div>
        </section>
        </div>
        <section class="ss-chat-visuals-section ss-look-editor-section">
          <div class="ss-chat-visuals-section-head">
            <div><span class="ss-visual-kicker">WARDROBE</span><strong>Character looks</strong><span>Choose an outfit. Base identity stays inherited.</span></div>
            <span class="ss-chat-visuals-binding-state" data-role="look-active-state" data-state="bound">Active</span>
          </div>
          <div class="ss-visual-editor-body" data-role="look-editor-body">
          <div class="ss-visual-shelf">
            <div class="ss-visual-shelf-head"><strong>Saved looks</strong><div class="ss-chat-visuals-row">
              <select id="ss-character-look" class="ss-select ss-visual-fallback" data-role="character-look" aria-label="Canonical look"></select>
              <button class="ss-icon-button" data-action="new-character-look" title="Create look" aria-label="Create character look">${PLUS_ICON}</button>
              <button class="ss-icon-button ss-button-danger" data-action="delete-character-look" title="Delete look" aria-label="Delete character look">${TRASH_ICON}</button>
            </div></div>
            <div class="ss-visual-card-rail" data-role="character-look-cards" role="group" aria-label="Saved character looks"></div>
          </div>
          <div class="ss-visual-look-title"><span class="ss-visual-kicker">EDITING LOOK</span>
            <label class="ss-chat-visuals-field"><span class="ss-visually-hidden">Look name</span><input class="ss-input" data-role="look-name" placeholder="Formal" /></label>
          </div>
          <div class="ss-visual-prompt-stack">
            <label class="ss-chat-visuals-field ss-visual-writing"><span>Outfit prompt</span><textarea class="ss-textarea" data-role="look-outfit" placeholder="black tailored suit, white dress shirt…"></textarea></label>
            <label class="ss-chat-visuals-field ss-visual-negative"><span>Additional negative</span><textarea class="ss-textarea" data-role="look-negative" placeholder="casual clothes, sleepwear…"></textarea></label>
          </div>
          <details class="ss-visual-disclosure"><summary>Generation overrides</summary>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Optional checkpoint override</span><select class="ss-select" data-role="look-checkpoint"><option value="">Inherit character checkpoint</option></select></label>
            <label class="ss-chat-visuals-field"><span>Optional LoRA stack</span><select class="ss-select" data-role="look-stack"><option value="">No additional LoRAs</option></select></label>
          </div>
          </details>
          <details class="ss-visual-disclosure"><summary>Reference images</summary>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Anima Reference Adapter</span><select class="ss-select" data-role="look-anima-reference"><option value="inherit">Inherit character setting</option><option value="on">Use Anima Reference Adapter</option><option value="off">Turn off for this look</option></select></label>
            <label class="ss-chat-visuals-field"><span>Reference / init image URL</span><input class="ss-input" data-role="look-reference-url" placeholder="Lumiverse image URL" /></label>
            <label class="ss-chat-visuals-field"><span>Thumbnail URL</span><input class="ss-input" data-role="look-thumbnail-url" placeholder="Defaults to reference" /></label>
          </div>
          </details>
          <details class="ss-visual-disclosure"><summary>Recognition &amp; continuity</summary>
          <label class="ss-chat-visuals-field"><span>Aliases / prose cues</span><input class="ss-input" data-role="look-aliases" placeholder="formalwear, gala, suit" /></label>
          <label class="ss-chat-visuals-field"><span>Trigger words</span><input class="ss-input" data-role="look-triggers" placeholder="formal outfit, tailored suit" /></label>
          <label class="ss-chat-visuals-field"><span>Continuity notes</span><textarea class="ss-textarea" data-role="look-notes" placeholder="When this look applies, immutable details, seasonal variations…"></textarea></label>
          </details>
          </div>
          <div class="ss-chat-visuals-actions">
            <button class="ss-button" data-action="activate-character-look">Set active</button>
            <button class="ss-button ss-button-primary" data-action="save-character-look">Save &amp; activate look</button>
          </div>
        </section>

        </div>

      </div>
      <div class="ss-chat-visuals-status" data-role="chat-visuals-status" role="status" aria-live="polite">Open a chat to configure its active character.</div>
    `
    root.appendChild(this.page)
    this.setVisualTab("character")
    this.page.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
      const action = button?.dataset.action || ""
      if (action === "visuals-refresh") this.refresh()
      if (action === "visuals-character-section") {
        const section = button?.dataset.section === "looks" ? "looks" : "identity"
        this.page.querySelector<HTMLElement>('[data-visual-panel="character"]')!.dataset.characterDetail = section
        for (const item of this.page.querySelectorAll<HTMLElement>('[data-action="visuals-character-section"]')) item.setAttribute("aria-pressed", String(item.dataset.section === section))
        this.page.querySelector<HTMLElement>(".ss-chat-visuals-scroll")!.scrollTop = 0
      }
      if (action === "visuals-tab") this.setVisualTab((button?.dataset.visualTab || "character") as "character" | "persona")
      if (action === "visual-select-look" || action === "visual-select-profile") {
        const select = this.get<HTMLSelectElement>(action === "visual-select-look" ? "character-look" : "persona-visual-preset")
        const id = button?.dataset.id || ""
        if (id !== select.value && [...select.options].some(option => option.value === id)) {
          select.value = id
          select.dispatchEvent(new Event("change", { bubbles: true }))
          const card = this.page.querySelector<HTMLButtonElement>(`[data-action="${action}"][aria-pressed="true"]`)
          card?.focus({ preventScroll: true })
        }
      }
      if (action === "new-persona-visual") this.createPersonaVisual()
      if (action === "delete-persona-visual") this.deletePersonaVisual()
      if (action === "import-persona-prompt") this.importPersonaPrompt()
      if (action === "import-character-prompt") this.importCharacterPrompt()
      if (action === "save-persona-visual") this.savePersonaVisual()
      if (action === "save-character-visuals") this.saveCharacterVisuals()
      if (action === "new-character-look") this.newCharacterLook()
      if (action === "delete-character-look") this.deleteCharacterLook()
      if (action === "activate-character-look") this.activateCharacterLook()
      if (action === "save-character-look") this.saveCharacterLook()
      if (action === "visuals-open-library") this.openLibrary()
    })
    this.page.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement
      if (target.dataset.role === "persona-visual-preset") {
        this.selectedPersonaPresetId = target.value
        this.renderPersonaEditor()
      }
      if (target.dataset.role === "lumiverse-persona-preset") {
        this.importedSourcePresetId = target.value
        this.importPersonaPrompt()
      }
      if (target.dataset.role === "lumiverse-character-preset") {
        this.importedCharacterSourcePresetId = target.value
        this.importCharacterPrompt()
      }
      if (target.dataset.role === "character-stack") {
        this.selectedStackValue = target.value
      }
      if (target.dataset.role === "character-look") {
        this.selectedLookId = target.value
        this.renderLookEditor()
      }
      this.refreshBindingIndicators()
    })
    this.page.addEventListener("input", () => this.refreshBindingIndicators())
  }

  refresh(): void {
    this.lumiversePresetLoadToken++
    this.setStatus("Reading the active chat, persona, Library folder, and Studio stack…")
    this.send("get_chat_visuals", { currentStack: this.getCurrentStack() })
  }

  onMessage(payload: any): void {
    if (payload?.type === "chat_visuals_result") {
      this.data = payload.data as ChatVisualsState
      this.selectedPersonaPresetId = this.data.personaBinding?.presetId
        || this.data.personaPresets?.[0]?.id
        || ""
      this.selectedStackValue = this.defaultStackSelection()
      this.importedCharacterSourcePresetId = this.data.characterFolder?.binding?.sourcePresetId || ""
      this.selectedLookId = this.data.characterFolder?.binding?.activeLookId || "default"
      this.render()
      this.setStatus("")
      void this.hydrateLumiversePresets()
      return
    }
    if (payload?.type === "character_visual_canon_result" && this.data?.activeChat?.characterId === payload?.data?.character?.id) {
      if (!this.data) return
      this.data.characterFolder = payload.data.folder || null
      this.selectedLookId = payload.data.activeLookId || "default"
      this.renderLookEditor()
      this.setStatus("")
      return
    }
    if (payload?.type === "studio_error" && [
      "get_chat_visuals",
      "save_persona_visual_preset",
      "delete_persona_visual_preset",
      "bind_persona_visual_preset",
      "save_chat_visuals",
      "save_character_look",
      "select_character_look",
      "delete_character_look",
    ].includes(String(payload.operation || ""))) {
      this.setStatus(String(payload.error || "Could not update Chat Visuals."), true)
    }
  }

  destroy(): void {
    this.lumiversePresetLoadToken++
    this.page.remove()
  }

  private setVisualTab(tab: "character" | "persona"): void {
    this.activeTab = tab
    for (const button of this.page.querySelectorAll<HTMLButtonElement>("[data-visual-tab]")) {
      const active = button.dataset.visualTab === tab
      button.dataset.active = String(active)
      button.setAttribute("aria-selected", String(active))
    }
    for (const panel of this.page.querySelectorAll<HTMLElement>("[data-visual-panel]")) {
      panel.hidden = panel.dataset.visualPanel !== tab
    }
  }

  private get<T extends HTMLElement>(role: string): T {
    const node = this.page.querySelector<T>(`[data-role="${role}"]`)
    if (!node) throw new Error(`Chat Visuals element missing: ${role}`)
    return node
  }

  private send(type: string, data: Record<string, unknown> = {}): void {
    this.ctx.sendToBackend({ type, requestId: createRequestId(), ...data })
  }

  private setStatus(message: string, error = false): void {
    if (error && message) reportStudioError("Chat Visuals", message)
    const status = this.get<HTMLElement>("chat-visuals-status")
    status.textContent = message
    status.dataset.error = String(error)
  }

  private render(): void {
    if (!this.data) return
    const context = this.get<HTMLElement>("visuals-context")
    context.replaceChildren()
    context.append(
      element("span", "ss-chat-visuals-chip", this.data.activeChat
        ? `Character · ${this.data.activeChat.characterName || this.data.activeChat.name || "active chat"}`
        : "No active character chat"),
      element("span", "ss-chat-visuals-chip", this.data.activePersona
        ? `Persona · ${this.data.activePersona.name}`
        : "No active persona"),
    )

    const personaSelect = this.get<HTMLSelectElement>("persona-visual-preset")
    personaSelect.replaceChildren()
    const noPersonaProfile = element("option", "", this.data.personaPresets.length
      ? "Choose a visual profile…"
      : "No persona visual profiles yet")
    noPersonaProfile.value = ""
    personaSelect.appendChild(noPersonaProfile)
    for (const preset of this.data.personaPresets) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      personaSelect.appendChild(option)
    }
    personaSelect.value = this.data.personaPresets.some((preset) => preset.id === this.selectedPersonaPresetId)
      ? this.selectedPersonaPresetId
      : ""
    this.get<HTMLInputElement>("persona-visual-enabled").checked = this.data.personaBinding?.enabled !== false
    this.get<HTMLInputElement>("persona-visual-enabled").disabled = !this.data.activePersona
    this.get<HTMLElement>("persona-caption").textContent = this.data.activePersona
      ? `Binding target: ${this.data.activePersona.name}`
      : "Select a Lumiverse persona to bind a visual identity."

    this.get<HTMLElement>("character-title").textContent = this.data.activeChat?.characterName || "Character"
    this.renderPersonaEditor()
    this.renderLumiversePersonaPresets()

    const folder = this.data.characterFolder
    this.get<HTMLElement>("character-folder-caption").textContent = folder
      ? `${folder.name} · synchronized with Output Library`
      : this.data.activeChat
        ? `No folder yet · saving creates “${this.data.activeChat.characterName || "Character"}”`
        : "Open a character chat to create a visual folder."
    this.get<HTMLTextAreaElement>("character-positive").value = folder?.binding?.positivePrompt || this.data.characterBasePrompt || ""
    this.get<HTMLTextAreaElement>("character-negative").value = folder?.binding?.negativePrompt || ""
    this.get<HTMLInputElement>("character-visual-enabled").checked = folder?.binding?.enabled !== false
    this.get<HTMLInputElement>("character-anima-reference").checked = folder?.binding?.animaReference === true
    this.get<HTMLInputElement>("character-anima-url").value = folder?.binding?.animaReferenceUrl || ""
    this.get<HTMLInputElement>("character-visual-enabled").disabled = !this.data.activeChat
    this.renderLumiverseCharacterPresets()
    const checkpoint = this.get<HTMLSelectElement>("character-checkpoint")
    checkpoint.replaceChildren()
    const currentModel = folder?.binding?.checkpoint || this.data.studioModel || ""
    const models = Array.isArray(this.data.models) ? this.data.models : []
    const current = element("option", "", currentModel ? "Use current Studio checkpoint" : "No checkpoint selected")
    current.value = ""
    checkpoint.appendChild(current)
    if (currentModel && !models.some((model) => model.id === currentModel)) {
      const retained = element("option", "", `${currentModel} · saved`)
      retained.value = currentModel
      checkpoint.appendChild(retained)
    }
    for (const model of models) {
      const option = element("option", "", model.label || model.id)
      option.value = model.id
      checkpoint.appendChild(option)
    }
    checkpoint.value = folder?.binding?.checkpoint || ""

    const stack = this.get<HTMLSelectElement>("character-stack")
    stack.replaceChildren()
    const none = element("option", "", "No bound stack")
    none.value = ""
    stack.appendChild(none)
    if (this.data.studioStack.length) {
      const current = element(
        "option",
        "",
        this.data.studioStackCustom
          ? `Current Studio · Custom · ${this.data.studioStack.length}`
          : `${this.data.stackPresets.find((preset) => preset.id === this.data?.studioStackPresetId)?.name || "Current Studio"} · ${this.data.studioStack.length}`,
      )
      current.value = "__studio__"
      stack.appendChild(current)
    }
    if (folder?.binding?.stackSnapshot?.length && !folder.binding.stackPresetId) {
      const bound = element("option", "", `Bound Custom snapshot · ${folder.binding.stackSnapshot.length}`)
      bound.value = "__bound_custom__"
      stack.appendChild(bound)
    }
    for (const preset of this.data.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = `preset:${preset.id}`
      stack.appendChild(option)
    }
    stack.value = [...stack.options].some((option) => option.value === this.selectedStackValue)
      ? this.selectedStackValue
      : ""
    this.get<HTMLElement>("character-stack-caption").textContent = stack.value === "__studio__"
      ? this.data.studioStackCustom
        ? "Saving will capture this edited Studio stack as Custom."
        : "Saving will bind the matching named stack."
      : stack.value === "__bound_custom__"
        ? "Keeping the custom snapshot already bound to this character."
        : stack.value.startsWith("preset:")
          ? "This named saved stack will load with the character."
          : "No character-specific LoRAs will be inherited."
    this.renderLookEditor()
    this.refreshBindingIndicators()
  }

  private renderVisualCards(role: string, entries: { id: string; name: string; description: string; image?: string }[], selected: string, active: string, action: string): void {
    const rail = this.get<HTMLElement>(role)
    const scrollLeft = rail.scrollLeft
    const scrollTop = rail.scrollTop
    rail.replaceChildren()
    for (const entry of entries) {
      const button = element("button", "ss-visual-card")
      button.type = "button"
      button.dataset.action = action
      button.dataset.id = entry.id
      button.setAttribute("aria-pressed", String(entry.id === selected))
      const art = element("span", "ss-visual-card-art")
      art.appendChild(element("span", "ss-visual-card-initial", entry.name.slice(0, 1).toUpperCase() || "?"))
      if (entry.image) {
        // Only resolve owned local image routes or explicitly stored HTTP(S) previews.
        try {
          const url = new URL(entry.image, document.baseURI)
          if (["http:", "https:"].includes(url.protocol)) {
            const img = element("img")
            img.alt = ""
            img.loading = "lazy"
            img.referrerPolicy = "no-referrer"
            img.addEventListener("error", () => img.remove(), { once: true })
            img.src = url.href
            art.appendChild(img)
          }
        } catch { /* Keep the typographic placeholder. */ }
      }
      const body = element("span", "ss-visual-card-body")
      body.append(element("strong", "", entry.name), element("span", "ss-visual-card-description", entry.description || "No prompt yet"))
      button.append(art, body)
      if (entry.id === active) button.appendChild(element("span", "ss-visual-card-active", "Active"))
      rail.appendChild(button)
    }
    if (!entries.length) rail.appendChild(element("p", "ss-visual-helper", "Nothing saved yet. Use + to create one."))
    rail.scrollLeft = scrollLeft
    rail.scrollTop = scrollTop
    const current = rail.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (current && rail.clientWidth) {
      const bounds = rail.getBoundingClientRect(), card = current.getBoundingClientRect()
      if (card.left < bounds.left) rail.scrollLeft -= bounds.left - card.left + 2
      else if (card.right > bounds.right) rail.scrollLeft += card.right - bounds.right + 2
      if (card.top < bounds.top) rail.scrollTop -= bounds.top - card.top + 2
      else if (card.bottom > bounds.bottom) rail.scrollTop += card.bottom - bounds.bottom + 2
    }
  }

  private renderLookCards(): void {
    const binding = this.data?.characterFolder?.binding
    const looks = binding?.looks || []
    const entries = looks.map(look => ({ id: look.id, name: look.name, description: look.outfitPrompt || "Inherits base identity", image: look.thumbnailUrl || (look.thumbnailImageId ? `/api/v1/images/${encodeURIComponent(look.thumbnailImageId)}` : "") || look.referenceImageUrl || (look.referenceImageId ? `/api/v1/images/${encodeURIComponent(look.referenceImageId)}` : "") }))
    if (!entries.length && this.selectedLookId === "default") entries.push({ id: "default", name: "Default", description: "Inherits base identity", image: "" })
    this.renderVisualCards("character-look-cards", entries, this.selectedLookId, binding?.activeLookId || "", "visual-select-look")
  }

  private currentLook(): CharacterVisualLook | null {
    return this.data?.characterFolder?.binding?.looks?.find((look) => look.id === this.selectedLookId) || null
  }

  private renderLookEditor(): void {
    if (!this.data) return
    const binding = this.data.characterFolder?.binding
    const looks = binding?.looks || []
    const select = this.get<HTMLSelectElement>("character-look")
    select.replaceChildren()
    if (!looks.length) {
      const option = element("option", "", "Default")
      option.value = "default"
      select.appendChild(option)
    }
    for (const look of looks) {
      const option = element("option", "", `${look.name}${look.id === binding?.activeLookId ? " · active" : ""}`)
      option.value = look.id
      select.appendChild(option)
    }
    if (![...select.options].some((option) => option.value === this.selectedLookId)) this.selectedLookId = looks[0]?.id || "default"
    select.value = this.selectedLookId
    const look = this.currentLook()
    this.get<HTMLInputElement>("look-name").value = look?.name || (this.selectedLookId === "default" ? "Default" : "")
    this.get<HTMLInputElement>("look-aliases").value = look?.aliases?.join(", ") || ""
    this.get<HTMLTextAreaElement>("look-outfit").value = look?.outfitPrompt || ""
    this.get<HTMLTextAreaElement>("look-negative").value = look?.negativePrompt || ""
    this.get<HTMLInputElement>("look-triggers").value = look?.triggerWords?.join(", ") || ""
    this.get<HTMLInputElement>("look-reference-url").value = look?.referenceImageUrl || ""
    this.get<HTMLSelectElement>("look-anima-reference").value = look?.animaReference || "inherit"
    this.get<HTMLInputElement>("look-thumbnail-url").value = look?.thumbnailUrl || ""
    this.get<HTMLTextAreaElement>("look-notes").value = look?.notes || ""
    const checkpoint = this.get<HTMLSelectElement>("look-checkpoint")
    checkpoint.replaceChildren()
    const inherited = element("option", "", "Inherit character checkpoint")
    inherited.value = ""
    checkpoint.appendChild(inherited)
    for (const model of this.data.models || []) {
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
    const stack = this.get<HTMLSelectElement>("look-stack")
    stack.replaceChildren()
    const none = element("option", "", "No additional LoRAs")
    none.value = ""
    stack.appendChild(none)
    if (this.data.studioStack.length) {
      const current = element("option", "", `Current Studio stack · ${this.data.studioStack.length}`)
      current.value = "__studio__"
      stack.appendChild(current)
    }
    for (const preset of this.data.stackPresets) {
      const option = element("option", "", `${preset.name} · ${preset.items.length}`)
      option.value = `preset:${preset.id}`
      stack.appendChild(option)
    }
    const stackValue = look?.stackPresetId
      ? `preset:${look.stackPresetId}`
      : look?.stackSnapshot?.length ? "__studio__" : ""
    stack.value = [...stack.options].some((option) => option.value === stackValue) ? stackValue : ""
    const active = Boolean(binding && binding.activeLookId === this.selectedLookId)
    const activeState = this.get<HTMLElement>("look-active-state")
    activeState.dataset.state = active ? "bound" : "unbound"
    activeState.textContent = active ? "Active" : "Saved"
    this.page.querySelector<HTMLButtonElement>('[data-action="delete-character-look"]')!.disabled = this.selectedLookId === "default" || !look
    this.page.querySelector<HTMLButtonElement>('[data-action="activate-character-look"]')!.disabled = active || !look
    this.renderLookCards()
  }

  private newCharacterLook(): void {
    this.selectedLookId = ""
    this.get<HTMLSelectElement>("character-look").value = ""
    for (const role of ["look-name", "look-aliases", "look-triggers", "look-reference-url", "look-thumbnail-url"] as const) {
      this.get<HTMLInputElement>(role).value = ""
    }
    for (const role of ["look-outfit", "look-negative", "look-notes"] as const) this.get<HTMLTextAreaElement>(role).value = ""
    this.get<HTMLSelectElement>("look-checkpoint").value = ""
    this.get<HTMLSelectElement>("look-anima-reference").value = "inherit"
    this.get<HTMLSelectElement>("look-stack").value = ""
    this.get<HTMLElement>("look-active-state").dataset.state = "unbound"
    this.get<HTMLElement>("look-active-state").textContent = "New look"
    this.page.querySelector<HTMLButtonElement>('[data-action="delete-character-look"]')!.disabled = true
    this.page.querySelector<HTMLButtonElement>('[data-action="activate-character-look"]')!.disabled = true
    this.renderLookCards()
    this.get<HTMLInputElement>("look-name").focus()
  }

  private lookPayload(): CharacterVisualLook {
    const existing = this.currentLook()
    const stackValue = this.get<HTMLSelectElement>("look-stack").value
    const presetId = stackValue.startsWith("preset:") ? stackValue.slice(7) : ""
    return {
      id: existing?.id || "",
      name: this.get<HTMLInputElement>("look-name").value.trim(),
      aliases: this.get<HTMLInputElement>("look-aliases").value.split(/[,|\n]+/).map((value) => value.trim()).filter(Boolean),
      outfitPrompt: this.get<HTMLTextAreaElement>("look-outfit").value,
      negativePrompt: this.get<HTMLTextAreaElement>("look-negative").value,
      checkpoint: this.get<HTMLSelectElement>("look-checkpoint").value,
      stackPresetId: presetId,
      stackSnapshot: stackValue === "__studio__" ? this.data?.studioStack || [] : [],
      animaReference: this.get<HTMLSelectElement>("look-anima-reference").value as CharacterVisualLook["animaReference"],
      referenceImageId: existing?.referenceImageId || "",
      referenceImageUrl: this.get<HTMLInputElement>("look-reference-url").value.trim(),
      thumbnailImageId: existing?.thumbnailImageId || "",
      thumbnailUrl: this.get<HTMLInputElement>("look-thumbnail-url").value.trim(),
      triggerWords: this.get<HTMLInputElement>("look-triggers").value.split(/[,|\n]+/).map((value) => value.trim()).filter(Boolean),
      notes: this.get<HTMLTextAreaElement>("look-notes").value,
      updatedAt: Date.now(),
    }
  }

  private saveCharacterLook(): void {
    const characterId = this.data?.activeChat?.characterId
    if (!characterId) return this.setStatus("Open a character chat first.", true)
    const look = this.lookPayload()
    if (!look.name) return this.setStatus("Give this look a name.", true)
    this.send("save_character_look", { characterId, look, activate: true })
    this.setStatus(`Saving and activating “${look.name}”…`)
  }

  private activateCharacterLook(): void {
    const characterId = this.data?.activeChat?.characterId
    const look = this.currentLook()
    if (!characterId || !look) return
    this.send("select_character_look", { characterId, lookId: look.id })
    this.setStatus(`Activating “${look.name}”…`)
  }

  private deleteCharacterLook(): void {
    const characterId = this.data?.activeChat?.characterId
    const look = this.currentLook()
    if (!characterId || !look || look.id === "default") return
    if (!window.confirm(`Delete the “${look.name}” look?`)) return
    this.send("delete_character_look", { characterId, lookId: look.id })
    this.setStatus(`Deleting “${look.name}”…`)
  }

  private renderPersonaEditor(): void {
    if (!this.data) return
    const preset = this.data.personaPresets.find((candidate) => candidate.id === this.selectedPersonaPresetId)
    this.get<HTMLElement>("persona-title").textContent = preset?.name || "New persona identity"
    const count = this.data.personaPresets.length
    this.get<HTMLElement>("persona-profile-count").textContent = `${count} saved ${count === 1 ? "profile" : "profiles"}`
    this.get<HTMLElement>("persona-profile-cards").closest(".ss-persona-directory")!.querySelector<HTMLButtonElement>('[data-action="delete-persona-visual"]')!.disabled = !preset
    this.get<HTMLTextAreaElement>("persona-positive").value = preset?.positivePrompt || ""
    this.importedSourcePresetId = preset?.sourcePresetId || ""
    this.renderLumiversePersonaPresets()
    this.renderVisualCards("persona-profile-cards", this.data.personaPresets.map(item => ({ id: item.id, name: item.name, description: item.positivePrompt })), this.selectedPersonaPresetId, this.data.personaBinding?.enabled !== false ? this.data.personaBinding?.presetId || "" : "", "visual-select-profile")
  }

  private renderLumiversePersonaPresets(): void {
    const select = this.get<HTMLSelectElement>("lumiverse-persona-preset")
    select.replaceChildren()
    const blank = element("option", "", this.lumiversePersonaPresets.length
      ? "Choose Image Gen persona preset…"
      : "No Image Gen persona presets")
    blank.value = ""
    select.appendChild(blank)
    for (const preset of this.lumiversePersonaPresets) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      select.appendChild(option)
    }
    select.value = this.lumiversePersonaPresets.some((preset) => preset.id === this.importedSourcePresetId)
      ? this.importedSourcePresetId
      : ""
  }

  private renderLumiverseCharacterPresets(): void {
    const select = this.get<HTMLSelectElement>("lumiverse-character-preset")
    select.replaceChildren()
    const groups = [
      { label: "Character presets", presets: this.lumiverseCharacterPresets },
      { label: "Main presets", presets: this.lumiverseMainPresets },
    ]
    const hasPresets = groups.some(group => group.presets.length)
    const blank = element("option", "", hasPresets ? "Choose an Image Gen preset…" : "No saved Character or Main presets")
    blank.value = ""
    select.appendChild(blank)
    for (const { label, presets } of groups) {
      if (!presets.length) continue
      const group = element("optgroup")
      group.label = label
      for (const preset of presets) {
        const option = element("option", "", preset.name)
        option.value = preset.id
        group.appendChild(option)
      }
      select.appendChild(group)
    }
    select.value = this.importedCharacterSourcePresetId
    if (select.selectedIndex < 0) select.value = ""
  }

  private async readLumiversePresets(): Promise<Record<"main" | "persona" | "character", LumiversePromptPreset[]>> {
    const response = await fetch("/api/v1/image-gen/export", {
      method: "POST",
      credentials: "include",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        include_settings: false,
        include_presets: true,
        include_connections: false,
        include_parameters: false,
      }),
    })
    const exported = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(String(exported?.error || `Could not read Lumiverse Image Gen presets (${response.status}).`))
    }
    if (!Array.isArray(exported?.presets)) {
      throw new Error("Lumiverse did not return an Image Gen preset list.")
    }

    const readPresets = (kind: "main" | "persona" | "character"): LumiversePromptPreset[] => exported.presets
      .filter((preset: any) => preset && (preset.kind ?? "main") === kind)
      .map((preset: any): LumiversePromptPreset => ({
        id: String(preset?.id || "").trim(),
        name: String(preset?.name || "").trim(),
        prompt: String(preset?.prompt || "").trim(),
        negativePrompt: String(preset?.negativePrompt || "").trim(),
      }))
      .filter((preset: LumiversePromptPreset) => preset.id && preset.name)
    return { main: readPresets("main"), persona: readPresets("persona"), character: readPresets("character") }
  }

  private async hydrateLumiversePresets(): Promise<void> {
    const token = ++this.lumiversePresetLoadToken
    try {
      const characterPositive = this.get<HTMLTextAreaElement>("character-positive")
      const characterNegative = this.get<HTMLTextAreaElement>("character-negative")
      const binding = this.data?.characterFolder?.binding
      const canHydrateCharacter = !binding?.positivePrompt && !binding?.negativePrompt
      const initialPositive = characterPositive.value
      const initialNegative = characterNegative.value

      let presets = await this.readLumiversePresets()
      if (token !== this.lumiversePresetLoadToken) return
      const renderPresets = () => {
        this.lumiversePersonaPresets = presets.persona
        this.lumiverseCharacterPresets = presets.character
        this.lumiverseMainPresets = presets.main
        this.renderLumiversePersonaPresets()
        this.renderLumiverseCharacterPresets()
      }
      renderPresets()

      const readNativeBinding = async (kind: "persona" | "character", id: string): Promise<string> => {
        if (!id) return ""
        const response = await fetch(`/api/v1/image-gen/preset-bindings/${kind}/${encodeURIComponent(id)}`, {
          cache: "no-store",
          credentials: "include",
          headers: { "Accept": "application/json" },
        })
        if (response.status === 404) return ""
        if (!response.ok) throw new Error(`Could not read the Lumiverse ${kind} preset binding (${response.status}).`)
        const binding = await response.json()
        return String(binding?.preset_id || "")
      }
      const personaId = this.data?.activePersona?.id || ""
      const characterId = this.data?.activeChat?.characterId || ""
      const [personaBinding, characterBinding] = await Promise.allSettled([
        readNativeBinding("persona", personaId),
        readNativeBinding("character", characterId),
      ])
      if (token !== this.lumiversePresetLoadToken) return
      const nativePersonaBindingId = personaBinding.status === "fulfilled" ? personaBinding.value : ""
      const nativeCharacterBindingId = characterBinding.status === "fulfilled" ? characterBinding.value : ""
      const missingBindingPreset = () =>
        (nativeCharacterBindingId && !presets.character.some(preset => preset.id === nativeCharacterBindingId))
        || (nativePersonaBindingId && !presets.persona.some(preset => preset.id === nativePersonaBindingId))
      if (missingBindingPreset()) {
        // Native Image Gen can write the binding before its debounced settings save.
        await new Promise(resolve => setTimeout(resolve, 1750))
        if (token !== this.lumiversePresetLoadToken) return
        presets = await this.readLumiversePresets().catch(() => presets)
        if (token !== this.lumiversePresetLoadToken) return
        renderPresets()
      }
      if (
        !this.selectedPersonaPresetId
        && !this.importedSourcePresetId
        && presets.persona.some((preset) => preset.id === nativePersonaBindingId)
      ) {
        this.importedSourcePresetId = nativePersonaBindingId
        this.renderLumiversePersonaPresets()
        this.importPersonaPrompt(false)
      }
      if (
        canHydrateCharacter
        && characterPositive.value === initialPositive
        && characterNegative.value === initialNegative
        && !this.importedCharacterSourcePresetId
        && presets.character.some((preset) => preset.id === nativeCharacterBindingId)
      ) {
        this.importedCharacterSourcePresetId = nativeCharacterBindingId
        this.renderLumiverseCharacterPresets()
        this.importCharacterPrompt(false)
      }
      this.refreshBindingIndicators()
      if (personaBinding.status === "rejected" || characterBinding.status === "rejected") {
        this.setStatus("Could not read all Lumiverse preset bindings. Available presets can still be imported manually.", true)
      } else if (missingBindingPreset()) {
        this.setStatus("A Lumiverse binding points to a preset missing from the export. Check the preset in Image Gen, then refresh Visuals.", true)
      }
    } catch (error) {
      if (token !== this.lumiversePresetLoadToken) return
      this.lumiversePersonaPresets = []
      this.lumiverseCharacterPresets = []
      this.lumiverseMainPresets = []
      this.renderLumiversePersonaPresets()
      this.renderLumiverseCharacterPresets()
      this.setStatus(error instanceof Error ? error.message : "Could not read Lumiverse Image Gen presets.", true)
    }
  }

  private defaultStackSelection(): string {
    if (!this.data) return ""
    const binding = this.data.characterFolder?.binding
    if (binding?.stackPresetId) return `preset:${binding.stackPresetId}`
    if (binding?.stackSnapshot?.length) return "__bound_custom__"
    if (this.data.studioStack.length) return "__studio__"
    return ""
  }

  private createPersonaVisual(): void {
    if (!this.data?.activePersona) {
      this.setStatus("Select a Lumiverse persona first.", true)
      return
    }
    const name = window.prompt("New persona visual profile", `${this.data.activePersona.name} visuals`)
    if (!name?.trim()) return
    this.send("save_persona_visual_preset", {
      preset: {
        name: name.trim(),
        positivePrompt: this.get<HTMLTextAreaElement>("persona-positive").value,
        sourcePresetId: this.importedSourcePresetId,
      },
      bind: true,
      bindingEnabled: this.get<HTMLInputElement>("persona-visual-enabled").checked,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Creating and binding “${name.trim()}”…`)
  }

  private savePersonaVisual(): void {
    if (!this.data?.activePersona) {
      this.setStatus("Select a Lumiverse persona first.", true)
      return
    }
    const selected = this.data.personaPresets.find((preset) => preset.id === this.selectedPersonaPresetId)
    if (!selected) {
      this.createPersonaVisual()
      return
    }
    this.send("save_persona_visual_preset", {
      preset: {
        ...selected,
        positivePrompt: this.get<HTMLTextAreaElement>("persona-positive").value,
        sourcePresetId: this.importedSourcePresetId || selected.sourcePresetId,
      },
      bind: true,
      bindingEnabled: this.get<HTMLInputElement>("persona-visual-enabled").checked,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Saving and binding “${selected.name}”…`)
  }

  private deletePersonaVisual(): void {
    const selected = this.data?.personaPresets.find((preset) => preset.id === this.selectedPersonaPresetId)
    if (!selected || !window.confirm(`Delete persona visual profile “${selected.name}”?`)) return
    this.send("delete_persona_visual_preset", {
      presetId: selected.id,
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(`Deleting “${selected.name}”…`)
  }

  private importPersonaPrompt(announce = true): void {
    const presetId = this.get<HTMLSelectElement>("lumiverse-persona-preset").value
      || this.importedSourcePresetId
    const preset = this.lumiversePersonaPresets.find((candidate) => candidate.id === presetId)
    if (!preset) {
      this.setStatus("Choose a Lumiverse preset first.", true)
      return
    }
    this.importedSourcePresetId = preset.id
    this.get<HTMLSelectElement>("lumiverse-persona-preset").value = preset.id
    this.get<HTMLTextAreaElement>("persona-positive").value = preset.prompt
    this.refreshBindingIndicators()
    if (announce) {
      this.setStatus(
        preset.prompt
          ? `Loaded “${preset.name}” from Lumiverse Image Gen. Review it, then save and bind.`
          : `“${preset.name}” has no positive prompt yet; enter the persona identity manually.`,
        !preset.prompt,
      )
    }
  }

  private importCharacterPrompt(announce = true): void {
    const presetId = this.get<HTMLSelectElement>("lumiverse-character-preset").value
      || this.importedCharacterSourcePresetId
    const preset = this.lumiverseCharacterPresets.find(candidate => candidate.id === presetId)
      || this.lumiverseMainPresets.find(candidate => candidate.id === presetId)
    if (!preset) {
      this.setStatus("Choose a Lumiverse Image Gen preset first.", true)
      return
    }
    this.importedCharacterSourcePresetId = preset.id
    this.get<HTMLSelectElement>("lumiverse-character-preset").value = preset.id
    this.get<HTMLTextAreaElement>("character-positive").value = preset.prompt
    this.get<HTMLTextAreaElement>("character-negative").value = preset.negativePrompt
    this.refreshBindingIndicators()
    if (announce) {
      this.setStatus(
        preset.prompt || preset.negativePrompt
          ? `Loaded “${preset.name}” from Lumiverse Image Gen. Review it, then save the character visuals.`
          : `“${preset.name}” has no prompt content yet; enter the character identity manually.`,
        !preset.prompt && !preset.negativePrompt,
      )
    }
  }

  private selectedCharacterStackBinding(): {
    stackPresetId: string
    stackSnapshot: StackPresetItem[]
  } {
    if (!this.data) return { stackPresetId: "", stackSnapshot: [] }
    const value = this.get<HTMLSelectElement>("character-stack").value
    if (value === "__studio__") {
      return {
        stackPresetId: this.data.studioStackCustom ? "" : this.data.studioStackPresetId,
        stackSnapshot: this.data.studioStack,
      }
    }
    if (value === "__bound_custom__") {
      return {
        stackPresetId: "",
        stackSnapshot: this.data.characterFolder?.binding?.stackSnapshot || [],
      }
    }
    if (value.startsWith("preset:")) {
      return {
        stackPresetId: value.slice("preset:".length),
        stackSnapshot: [],
      }
    }
    return { stackPresetId: "", stackSnapshot: [] }
  }

  private stackFingerprint(items: StackPresetItem[]): string {
    return JSON.stringify(items.map((item) => [
      item.name,
      item.title,
      Number(item.weight),
      item.enabled !== false,
      item.useTrigger === true,
      item.sourceUrl || "",
    ]))
  }

  private setBindingIndicator(
    role: "persona-binding-state" | "character-binding-state",
    state: "bound" | "dirty" | "unbound",
    label: string,
  ): void {
    const indicator = this.get<HTMLElement>(role)
    indicator.dataset.state = state
    const text = indicator.querySelector<HTMLSpanElement>("span")
    if (text) text.textContent = label
  }

  private refreshBindingIndicators(): void {
    if (!this.data) return

    const personaPreset = this.data.personaPresets.find((preset) => preset.id === this.selectedPersonaPresetId)
    const personaValuesMatch = Boolean(personaPreset)
      && this.get<HTMLTextAreaElement>("persona-positive").value.trim() === personaPreset!.positivePrompt.trim()
      && this.importedSourcePresetId === (personaPreset!.sourcePresetId || "")
      && this.get<HTMLInputElement>("persona-visual-enabled").checked === (this.data.personaBinding?.enabled !== false)
    const personaIsBound = Boolean(
      this.data.activePersona
      && personaPreset
      && this.data.personaBinding?.presetId === personaPreset.id
      && personaValuesMatch,
    )
    const personaHasDraft = Boolean(
      this.get<HTMLTextAreaElement>("persona-positive").value.trim()
      || this.importedSourcePresetId
      || personaPreset,
    )
    const personaIsDirty = Boolean(
      this.data.activePersona
      && !personaIsBound
      && (
        (personaPreset && !personaValuesMatch)
        || (!personaPreset && personaHasDraft)
        || this.data.personaBinding?.presetId === personaPreset?.id
      ),
    )
    this.setBindingIndicator(
      "persona-binding-state",
      personaIsBound ? "bound" : personaIsDirty ? "dirty" : "unbound",
      !this.data.activePersona
        ? "No active persona"
        : personaIsBound
          ? "Bound"
          : personaIsDirty
            ? "Unsaved changes"
            : "Not bound",
    )
    const personaButton = this.get<HTMLButtonElement>("save-persona-visual")
    personaButton.disabled = !this.data.activePersona || personaIsBound
    personaButton.textContent = personaIsBound
      ? "Bound to active persona"
      : personaPreset && !personaIsDirty
        ? "Bind selected profile"
        : "Save & bind to active persona"

    const folder = this.data.characterFolder
    const binding = folder?.binding
    const requestedStack = this.selectedCharacterStackBinding()
    const stack = this.get<HTMLSelectElement>("character-stack")
    this.get<HTMLElement>("visual-stack-summary").textContent = stack.selectedOptions[0]?.textContent || ""
    const stackMatches = Boolean(binding) && (
      requestedStack.stackPresetId
        ? requestedStack.stackPresetId === binding!.stackPresetId
        : !binding!.stackPresetId
          && this.stackFingerprint(requestedStack.stackSnapshot) === this.stackFingerprint(binding!.stackSnapshot)
    )
    const characterIsBound = Boolean(
      this.data.activeChat
      && binding
      && this.get<HTMLTextAreaElement>("character-positive").value.trim() === binding.positivePrompt.trim()
      && this.get<HTMLTextAreaElement>("character-negative").value.trim() === binding.negativePrompt.trim()
      && this.get<HTMLSelectElement>("character-checkpoint").value === binding.checkpoint
      && this.importedCharacterSourcePresetId === (binding.sourcePresetId || "")
      && this.get<HTMLInputElement>("character-visual-enabled").checked === (binding.enabled !== false)
      && this.get<HTMLInputElement>("character-anima-reference").checked === (binding.animaReference === true)
      && this.get<HTMLInputElement>("character-anima-url").value.trim() === (binding.animaReferenceUrl || "")
      && stackMatches,
    )
    const characterHasDraft = Boolean(
      this.get<HTMLTextAreaElement>("character-positive").value.trim()
      || this.get<HTMLTextAreaElement>("character-negative").value.trim()
      || this.get<HTMLSelectElement>("character-checkpoint").value
      || this.importedCharacterSourcePresetId
      || requestedStack.stackPresetId
      || requestedStack.stackSnapshot.length
      || this.get<HTMLInputElement>("character-anima-reference").checked
      || this.get<HTMLInputElement>("character-anima-url").value.trim(),
    )
    const characterIsDirty = Boolean(this.data.activeChat && !characterIsBound && (binding || characterHasDraft))
    this.setBindingIndicator(
      "character-binding-state",
      characterIsBound ? "bound" : characterIsDirty ? "dirty" : "unbound",
      !this.data.activeChat
        ? "No active character"
        : characterIsBound
          ? "Bound"
          : characterIsDirty
            ? "Unsaved changes"
            : "Not bound",
    )
    const characterButton = this.get<HTMLButtonElement>("save-character-visuals")
    characterButton.disabled = !this.data.activeChat || characterIsBound
    characterButton.textContent = characterIsBound
      ? "Character visuals bound"
      : "Save character visuals"
  }

  private saveCharacterVisuals(): void {
    if (!this.data?.activeChat) {
      this.setStatus("Open a character chat first.", true)
      return
    }
    const { stackPresetId, stackSnapshot } = this.selectedCharacterStackBinding()
    this.send("save_chat_visuals", {
      folderName: this.data.activeChat.characterName || "Character visuals",
      positivePrompt: this.get<HTMLTextAreaElement>("character-positive").value,
      negativePrompt: this.get<HTMLTextAreaElement>("character-negative").value,
      checkpoint: this.get<HTMLSelectElement>("character-checkpoint").value,
      sourcePresetId: this.importedCharacterSourcePresetId,
      stackPresetId,
      stackSnapshot,
      enabled: this.get<HTMLInputElement>("character-visual-enabled").checked,
      animaReference: this.get<HTMLInputElement>("character-anima-reference").checked,
      animaReferenceUrl: this.get<HTMLInputElement>("character-anima-url").value.trim(),
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(this.data.characterFolder ? "Saving character visuals…" : "Creating and binding the character folder…")
  }
}
