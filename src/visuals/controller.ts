class ChatVisualsController {
  private readonly ctx: FrontendContext
  private readonly launcher: HTMLElement
  private readonly getCurrentStack: () => StackPresetItem[] | null
  private readonly openStudio: () => void
  private readonly openLibrary: () => void
  private readonly page: HTMLElement
  private readonly visualLore: VisualLorebookHostController
  private activeTab: "character" | "persona" | "lore" = "character"
  private data: ChatVisualsState | null = null
  private selectedPersonaPresetId = ""
  private selectedStackValue = ""
  private importedSourcePresetId = ""
  private importedCharacterSourcePresetId = ""
  private selectedLookId = "default"
  private lumiversePersonaPresets: LumiversePromptPreset[] = []
  private lumiverseCharacterPresets: LumiversePromptPreset[] = []
  private lumiversePresetLoadToken = 0

  constructor(
    ctx: FrontendContext,
    launcher: HTMLElement,
    getCurrentStack: () => StackPresetItem[] | null,
    openStudio: () => void,
    openLibrary: () => void,
  ) {
    this.ctx = ctx
    this.launcher = launcher
    this.getCurrentStack = getCurrentStack
    this.openStudio = openStudio
    this.openLibrary = openLibrary
    this.page = element("section", "ss-chat-visuals-page")
    this.page.hidden = true
    this.page.innerHTML = `
      <div class="ss-chat-visuals-head">
        <button class="ss-icon-button" data-action="visuals-back" title="Back to Swarm Studio" aria-label="Back">${BACK_ICON}</button>
        <div class="ss-chat-visuals-head-copy">
          <strong>Visuals</strong>
          <span class="ss-muted ss-tiny">Character, persona, and activated visual lore.</span>
        </div>
        <button class="ss-icon-button" data-action="visuals-refresh" title="Refresh active chat context" aria-label="Refresh">↻</button>
      </div>
      <nav class="ss-chat-visuals-tabs" role="tablist" aria-label="Visual identity sections">
        <button class="ss-chat-visuals-tab" data-action="visuals-tab" data-visual-tab="character" role="tab">Character</button>
        <button class="ss-chat-visuals-tab" data-action="visuals-tab" data-visual-tab="persona" role="tab">Persona</button>
        <button class="ss-chat-visuals-tab" data-action="visuals-tab" data-visual-tab="lore" role="tab">Lore</button>
      </nav>
      <div class="ss-chat-visuals-scroll">
        <div class="ss-chat-visuals-context" data-role="visuals-context"></div>

        <div class="ss-chat-visuals-panel" data-visual-panel="persona" hidden>
        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Persona</strong><span data-role="persona-caption">The active Lumiverse persona can own a reusable image identity.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="persona-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-persona-profile">Visual profile</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-persona-profile" class="ss-select" data-role="persona-visual-preset"></select>
              <button class="ss-icon-button" data-action="new-persona-visual" title="Create a persona visual profile" aria-label="Create persona visual profile">${PLUS_ICON}</button>
              <button class="ss-icon-button ss-button-danger" data-action="delete-persona-visual" title="Delete selected persona visual profile" aria-label="Delete persona visual profile">${TRASH_ICON}</button>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-lumi-preset">Lumiverse Image Gen persona preset</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-lumi-preset" class="ss-select" data-role="lumiverse-persona-preset"><option value="">Loading persona presets…</option></select>
              <button class="ss-button" data-action="import-persona-prompt">Use preset</button>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-persona-positive">Positive identity prompt</label>
            <textarea id="ss-chat-persona-positive" class="ss-textarea" data-role="persona-positive" placeholder="Visual traits for the active persona…"></textarea>
          </div>
          <div class="ss-chat-visuals-actions">
            <span class="ss-chat-visuals-binding-state" data-role="persona-binding-state" data-state="unbound">${BINDING_LINK_ICON}<span>Not bound</span></span>
            <button class="ss-button ss-button-primary" data-role="save-persona-visual" data-action="save-persona-visual">Save &amp; bind to active persona</button>
          </div>
        </section>
        </div>

        <div class="ss-chat-visuals-panel" data-visual-panel="character">
        <section class="ss-chat-visuals-section ss-look-editor-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Character looks</strong><span>Identity stays inherited; each look adds outfit, LoRAs, negatives, references, and optional checkpoint direction.</span></div>
            <span class="ss-chat-visuals-binding-state" data-role="look-active-state" data-state="bound">Active</span>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-character-look">Canonical look</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-character-look" class="ss-select" data-role="character-look"></select>
              <button class="ss-icon-button" data-action="new-character-look" title="Create look" aria-label="Create character look">${PLUS_ICON}</button>
              <button class="ss-icon-button ss-button-danger" data-action="delete-character-look" title="Delete look" aria-label="Delete character look">${TRASH_ICON}</button>
            </div>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Look name</span><input class="ss-input" data-role="look-name" placeholder="Formal" /></label>
            <label class="ss-chat-visuals-field"><span>Aliases / prose cues</span><input class="ss-input" data-role="look-aliases" placeholder="formalwear, gala, suit" /></label>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Outfit prompt</span><textarea class="ss-textarea" data-role="look-outfit" placeholder="black tailored suit, white dress shirt…"></textarea></label>
            <label class="ss-chat-visuals-field"><span>Additional negative</span><textarea class="ss-textarea" data-role="look-negative" placeholder="casual clothes, sleepwear…"></textarea></label>
          </div>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Optional checkpoint override</span><select class="ss-select" data-role="look-checkpoint"><option value="">Inherit character checkpoint</option></select></label>
            <label class="ss-chat-visuals-field"><span>Optional LoRA stack</span><select class="ss-select" data-role="look-stack"><option value="">No additional LoRAs</option></select></label>
          </div>
          <label class="ss-chat-visuals-field"><span>Trigger words</span><input class="ss-input" data-role="look-triggers" placeholder="formal outfit, tailored suit" /></label>
          <div class="ss-chat-visuals-grid">
            <label class="ss-chat-visuals-field"><span>Reference / init image URL</span><input class="ss-input" data-role="look-reference-url" placeholder="Lumiverse image URL" /></label>
            <label class="ss-chat-visuals-field"><span>Thumbnail URL</span><input class="ss-input" data-role="look-thumbnail-url" placeholder="Defaults to reference" /></label>
          </div>
          <label class="ss-chat-visuals-field"><span>Continuity notes</span><textarea class="ss-textarea" data-role="look-notes" placeholder="When this look applies, immutable details, seasonal variations…"></textarea></label>
          <div class="ss-chat-visuals-actions">
            <button class="ss-button" data-action="activate-character-look">Set active</button>
            <button class="ss-button ss-button-primary" data-action="save-character-look">Save &amp; activate look</button>
          </div>
        </section>

        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Character folder</strong><span data-role="character-folder-caption">Creates the Library folder and keeps these prompts synchronized with it.</span></div>
            <label class="ss-toggle-line"><input type="checkbox" data-role="character-visual-enabled" checked> Active</label>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-lumi-character-preset">Lumiverse Image Gen character preset</label>
            <div class="ss-chat-visuals-row">
              <select id="ss-chat-lumi-character-preset" class="ss-select" data-role="lumiverse-character-preset"><option value="">Loading character presets…</option></select>
              <button class="ss-button" data-action="import-character-prompt">Use preset</button>
            </div>
          </div>
          <div class="ss-chat-visuals-grid">
            <div class="ss-chat-visuals-field">
              <label for="ss-chat-character-positive">Positive base</label>
              <textarea id="ss-chat-character-positive" class="ss-textarea" data-role="character-positive" placeholder="Stable visual identity for the active character…"></textarea>
            </div>
            <div class="ss-chat-visuals-field">
              <label for="ss-chat-character-negative">Negative base</label>
              <textarea id="ss-chat-character-negative" class="ss-textarea" data-role="character-negative" placeholder="Things to consistently avoid…"></textarea>
            </div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-character-checkpoint">Checkpoint</label>
            <select id="ss-chat-character-checkpoint" class="ss-select" data-role="character-checkpoint"><option value="">Use current Studio checkpoint</option></select>
          </div>
        </section>

        <section class="ss-chat-visuals-section">
          <div class="ss-chat-visuals-section-head">
            <div><strong>Character LoRA stack</strong><span>Saved presets remain named; edited Studio state is stored as a real Custom snapshot.</span></div>
          </div>
          <div class="ss-chat-visuals-field">
            <label for="ss-chat-stack">Stack source</label>
            <select id="ss-chat-stack" class="ss-select" data-role="character-stack"></select>
          </div>
          <div class="ss-muted ss-tiny" data-role="character-stack-caption"></div>
          <div class="ss-chat-visuals-actions">
            <span class="ss-chat-visuals-binding-state" data-role="character-binding-state" data-state="unbound">${BINDING_LINK_ICON}<span>Not bound</span></span>
            <button class="ss-button ss-button-primary" data-role="save-character-visuals" data-action="save-character-visuals">Save character visuals</button>
          </div>
        </section>
        </div>

        <div class="ss-chat-visuals-panel" data-visual-panel="lore" hidden>
          <div class="ss-visual-lorebook-host" data-role="visual-lore-root"></div>
        </div>

        <div class="ss-chat-visuals-status" data-role="chat-visuals-status">Open a chat to configure its active character.</div>
      </div>
      <div class="ss-chat-visuals-footer">
        <button class="ss-button ss-button-primary" data-action="visuals-open-studio">Open Studio</button>
        <button class="ss-button" data-action="visuals-open-library">${LIBRARY_ICON} Library</button>
      </div>
    `
    launcher.appendChild(this.page)
    this.visualLore = new VisualLorebookHostController(ctx, this.get<HTMLElement>("visual-lore-root"))
    this.setVisualTab("character")
    this.page.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")
      const action = button?.dataset.action || ""
      if (action === "visuals-back") this.hide()
      if (action === "visuals-refresh") this.refresh()
      if (action === "visuals-tab") this.setVisualTab((button?.dataset.visualTab || "character") as "character" | "persona" | "lore")
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
      if (action === "visuals-open-studio") this.openStudio()
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

  show(): void {
    this.launcher.dataset.page = "visuals"
    this.page.hidden = false
    this.refresh()
  }

  hide(): void {
    this.launcher.dataset.page = "home"
    this.page.hidden = true
  }

  refresh(): void {
    this.setStatus("Reading the active chat, persona, Library folder, and Studio stack…")
    this.send("get_chat_visuals", { currentStack: this.getCurrentStack() })
    if (this.activeTab === "lore") this.visualLore.activate(true)
  }

  onMessage(payload: any): void {
    this.visualLore.onMessage(payload)
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
    this.visualLore.destroy()
    this.page.remove()
  }

  private setVisualTab(tab: "character" | "persona" | "lore"): void {
    this.activeTab = tab
    for (const button of this.page.querySelectorAll<HTMLButtonElement>("[data-visual-tab]")) {
      const active = button.dataset.visualTab === tab
      button.dataset.active = String(active)
      button.setAttribute("aria-selected", String(active))
    }
    for (const panel of this.page.querySelectorAll<HTMLElement>("[data-visual-panel]")) {
      panel.hidden = panel.dataset.visualPanel !== tab
    }
    this.get<HTMLElement>("chat-visuals-status").hidden = tab === "lore"
    if (tab === "lore") this.visualLore.activate()
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
  }

  private newCharacterLook(): void {
    this.selectedLookId = ""
    this.get<HTMLSelectElement>("character-look").value = ""
    for (const role of ["look-name", "look-aliases", "look-triggers", "look-reference-url", "look-thumbnail-url"] as const) {
      this.get<HTMLInputElement>(role).value = ""
    }
    for (const role of ["look-outfit", "look-negative", "look-notes"] as const) this.get<HTMLTextAreaElement>(role).value = ""
    this.get<HTMLSelectElement>("look-checkpoint").value = ""
    this.get<HTMLSelectElement>("look-stack").value = ""
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
    this.get<HTMLTextAreaElement>("persona-positive").value = preset?.positivePrompt || ""
    this.importedSourcePresetId = preset?.sourcePresetId || ""
    this.renderLumiversePersonaPresets()
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
    const blank = element("option", "", this.lumiverseCharacterPresets.length
      ? "Choose Image Gen character preset…"
      : "No Image Gen character presets")
    blank.value = ""
    select.appendChild(blank)
    for (const preset of this.lumiverseCharacterPresets) {
      const option = element("option", "", preset.name)
      option.value = preset.id
      select.appendChild(option)
    }
    select.value = this.lumiverseCharacterPresets.some((preset) => preset.id === this.importedCharacterSourcePresetId)
      ? this.importedCharacterSourcePresetId
      : ""
  }

  private async hydrateLumiversePresets(): Promise<void> {
    const token = ++this.lumiversePresetLoadToken
    try {
      const exportResponse = await fetch("/api/v1/image-gen/export", {
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
      const exported = await exportResponse.json().catch(() => ({}))
      if (!exportResponse.ok) {
        throw new Error(String(exported?.error || `Could not read Lumiverse Image Gen presets (${exportResponse.status}).`))
      }
      const exportedPresets = Array.isArray(exported?.presets) ? exported.presets : []
      const readPresets = (kind: "persona" | "character"): LumiversePromptPreset[] => exportedPresets
        .filter((preset: any) => String(preset?.kind || "main") === kind)
        .map((preset: any): LumiversePromptPreset => ({
          id: String(preset?.id || "").trim(),
          name: String(preset?.name || "").trim(),
          prompt: String(preset?.prompt || "").trim(),
          negativePrompt: String(preset?.negativePrompt || "").trim(),
        }))
        .filter((preset: LumiversePromptPreset) => preset.id && preset.name)
      const personaPresets = readPresets("persona")
      const characterPresets = readPresets("character")
      if (token !== this.lumiversePresetLoadToken) return
      this.lumiversePersonaPresets = personaPresets
      this.lumiverseCharacterPresets = characterPresets

      const readNativeBinding = async (kind: "persona" | "character", id: string): Promise<string> => {
        if (!id) return ""
        const response = await fetch(`/api/v1/image-gen/preset-bindings/${kind}/${encodeURIComponent(id)}`, {
          credentials: "include",
          headers: { "Accept": "application/json" },
        })
        if (!response.ok) return ""
        const binding = await response.json().catch(() => ({}))
        return String(binding?.preset_id || "")
      }
      const personaId = this.data?.activePersona?.id || ""
      const characterId = this.data?.activeChat?.characterId || ""
      const [nativePersonaBindingId, nativeCharacterBindingId] = await Promise.all([
        readNativeBinding("persona", personaId),
        readNativeBinding("character", characterId),
      ])
      if (token !== this.lumiversePresetLoadToken) return
      this.renderLumiversePersonaPresets()
      this.renderLumiverseCharacterPresets()
      if (
        !this.selectedPersonaPresetId
        && !this.importedSourcePresetId
        && personaPresets.some((preset) => preset.id === nativePersonaBindingId)
      ) {
        this.importedSourcePresetId = nativePersonaBindingId
        this.renderLumiversePersonaPresets()
        this.importPersonaPrompt(false)
      }
      if (
        !this.data?.characterFolder
        && !this.importedCharacterSourcePresetId
        && characterPresets.some((preset) => preset.id === nativeCharacterBindingId)
      ) {
        this.importedCharacterSourcePresetId = nativeCharacterBindingId
        this.renderLumiverseCharacterPresets()
        this.importCharacterPrompt(false)
      }
      this.refreshBindingIndicators()
    } catch (error) {
      if (token !== this.lumiversePresetLoadToken) return
      this.lumiversePersonaPresets = []
      this.lumiverseCharacterPresets = []
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
    const preset = this.lumiverseCharacterPresets.find((candidate) => candidate.id === presetId)
    if (!preset) {
      this.setStatus("Choose a Lumiverse character preset first.", true)
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
      && stackMatches,
    )
    const characterHasDraft = Boolean(
      this.get<HTMLTextAreaElement>("character-positive").value.trim()
      || this.get<HTMLTextAreaElement>("character-negative").value.trim()
      || this.get<HTMLSelectElement>("character-checkpoint").value
      || this.importedCharacterSourcePresetId
      || requestedStack.stackPresetId
      || requestedStack.stackSnapshot.length,
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
      currentStack: this.getCurrentStack(),
    })
    this.setStatus(this.data.characterFolder ? "Saving character visuals…" : "Creating and binding the character folder…")
  }
}
