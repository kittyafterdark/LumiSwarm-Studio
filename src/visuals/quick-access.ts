/** Drawer cockpit: persisted selections only; authoring stays in Visuals and Styles. */
class QuickVisualsController {
  private readonly root: HTMLElement
  private data: ChatVisualsState | null = null
  private pending: { id: string; mutation: boolean; action?: string } | null = null
  private refreshQueued = false
  private timer: ReturnType<typeof setTimeout> | null = null
  private disposed = false
  private behavior: StudioBehavior
  private compositionRequest: { id: string; timer: ReturnType<typeof setTimeout> } | null = null

  constructor(private ctx: FrontendContext, parent: HTMLElement, private getCurrentStack: () => StackPresetItem[] | null, openVisuals: () => void, goBack: () => void, openCast: () => void, openStyles: () => void, behavior: StudioBehavior, changeBehavior: (patch: Partial<StudioBehavior>) => void) {
    this.behavior = { ...behavior }
    this.root = element("section", "ss-quick-visuals")
    this.root.hidden = true
    const chevron = `<svg class="ss-quick-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>`
    this.root.innerHTML = `
      <header class="ss-quick-header">
        <button type="button" data-q="back" class="ss-quick-back" aria-label="Back to Swarm Studio"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14 6-6 6 6 6"/></svg><span>Back</span></button>
        <button type="button" data-q="refresh" class="ss-quick-refresh" title="Refresh active chat and persona" aria-label="Refresh active chat and persona"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11a8 8 0 0 0-14-5L3 9m0-6v6h6m-5 4a8 8 0 0 0 14 5l3-3m0 6v-6h-6"/></svg></button>
      </header>
      <div class="ss-quick-heading"><h2>Visuals</h2></div>
      <details class="ss-quick-card" data-q="character-card">
        <summary><span class="ss-quick-summary-copy"><span class="ss-quick-eyebrow">CHARACTER</span><strong data-q="character-name">Character</strong><span class="ss-quick-style" data-q="character-style"></span></span><span data-q="character-state" class="ss-quick-state"></span>${chevron}</summary>
        <div class="ss-quick-body">
          <button type="button" data-q="bind">Bind character visuals</button>
          <div class="ss-quick-fields" data-q="character-fields" hidden>
            <label class="ss-quick-toggle"><input type="checkbox" data-q="character-enabled"> Visual identity enabled</label>
            <label>Active look<select data-q="look"></select></label>
            <label>Character LoRA stack<select data-q="stack"></select></label>
          </div>
          <p class="ss-quick-empty" data-q="character-empty" hidden>No active character in this chat.</p>
        </div>
      </details>
      <details class="ss-quick-card" data-q="persona-card">
        <summary><span class="ss-quick-summary-copy"><span class="ss-quick-eyebrow">PERSONA</span><strong data-q="persona-name">Persona</strong></span><span data-q="persona-state" class="ss-quick-state"></span>${chevron}</summary>
        <div class="ss-quick-body">
          <label>Saved visual profile<select data-q="persona"></select></label>
          <label class="ss-quick-toggle"><input type="checkbox" data-q="persona-enabled"> Visual identity enabled</label>
        </div>
      </details>
      <p class="ss-quick-status" data-q="status" role="status" aria-live="polite"></p>
      <button type="button" data-q="edit" class="ss-quick-edit">${CHAT_VISUALS_ICON}<span>Open Visuals editor</span></button>
      <div class="ss-quick-heading"><h2>Settings</h2></div>
      <section class="ss-quick-card ss-quick-settings" aria-label="Quick settings">
        <label class="ss-settings-toggle ss-quick-widget"><span>Show floating widget</span><input type="checkbox" data-q="widget" role="switch"/><span class="ss-switch-track" aria-hidden="true"></span></label>
        <label>Prompt composition<select data-q="composition"><option value="multi">Multi-character / ensemble</option><option value="pov">Character-only / POV</option></select></label>
        <p class="ss-quick-status" data-q="settings-status" role="status" aria-live="polite"></p>
        <div class="ss-quick-scale"><span>Inline image size</span><div class="ss-image-scale-grid" role="group" aria-label="Inline image size">
          ${([100, 75, 50] as const).map(scale => `<button type="button" class="ss-image-scale-button" data-q-scale="${scale}" aria-pressed="false"><svg viewBox="0 0 64 44" aria-hidden="true"><rect x="2" y="2" width="60" height="40" rx="3" opacity=".25"/><rect x="${scale === 100 ? 2 : scale === 75 ? 10 : 17}" y="${scale === 100 ? 2 : scale === 75 ? 7 : 12}" width="${scale === 100 ? 60 : scale === 75 ? 44 : 30}" height="${scale === 100 ? 40 : scale === 75 ? 30 : 20}" rx="2"/></svg><span>${scale}% × ${scale}%</span></button>`).join("")}
        </div></div>
      </section>
      <div class="ss-quick-links"><button type="button" data-q="cast" class="ss-quick-edit"><span>Open current Cast</span></button><button type="button" data-q="styles" class="ss-quick-edit"><span>Open Styles / LoRAs</span></button></div>`
    parent.append(this.root)
    this.get<HTMLButtonElement>("back").onclick = goBack
    this.get<HTMLButtonElement>("refresh").onclick = () => this.refresh()
    this.get<HTMLButtonElement>("edit").onclick = openVisuals
    this.get<HTMLButtonElement>("bind").onclick = () => this.mutate("bind-character")
    this.get<HTMLInputElement>("character-enabled").onchange = event => this.mutate("character-enabled", { enabled: (event.target as HTMLInputElement).checked })
    this.get<HTMLSelectElement>("look").onchange = event => this.mutate("look", { lookId: (event.target as HTMLSelectElement).value })
    this.get<HTMLSelectElement>("stack").onchange = event => {
      const value = (event.target as HTMLSelectElement).value
      if (value === "__studio_current__") this.mutate("stack-current")
      else this.mutate("stack", { presetId: value })
    }
    this.get<HTMLSelectElement>("persona").onchange = event => this.mutate("persona", { presetId: (event.target as HTMLSelectElement).value, enabled: Boolean((event.target as HTMLSelectElement).value) })
    this.get<HTMLInputElement>("persona-enabled").onchange = event => this.mutate("persona", { presetId: this.data?.personaBinding?.presetId || "", enabled: (event.target as HTMLInputElement).checked })
    this.get<HTMLButtonElement>("cast").onclick = openCast
    this.get<HTMLButtonElement>("styles").onclick = openStyles
    this.get<HTMLInputElement>("widget").onchange = event => changeBehavior({ widgetEnabled: (event.target as HTMLInputElement).checked })
    this.get<HTMLSelectElement>("composition").onchange = event => this.saveComposition((event.target as HTMLSelectElement).value === "pov" ? "pov" : "multi")
    for (const button of this.root.querySelectorAll<HTMLButtonElement>("[data-q-scale]")) button.onclick = () => {
      const scale = Number(button.dataset.qScale)
      if (scale === 100 || scale === 75 || scale === 50) changeBehavior({ inlineImageScale: scale })
    }
    this.render()
    this.setBehavior(behavior)
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
    this.get<HTMLInputElement>("widget").checked = this.behavior.widgetEnabled
    if (!this.compositionRequest) this.get<HTMLSelectElement>("composition").value = this.behavior.tagPromptMode
    for (const button of this.root.querySelectorAll<HTMLButtonElement>("[data-q-scale]")) {
      const active = Number(button.dataset.qScale) === this.behavior.inlineImageScale
      button.dataset.active = String(active)
      button.setAttribute("aria-pressed", String(active))
    }
  }
  private saveComposition(mode: StudioBehavior["tagPromptMode"]): void {
    if (this.compositionRequest) return
    const id = createRequestId()
    const control = this.get<HTMLSelectElement>("composition")
    control.disabled = true
    const note = this.get("settings-status")
    note.textContent = "Saving…"; note.dataset.error = "false"
    const finish = (error?: string) => {
      if (this.compositionRequest?.id !== id) return
      clearTimeout(this.compositionRequest.timer); this.compositionRequest = null
      control.disabled = false; control.value = this.behavior.tagPromptMode
      note.textContent = error || ""; note.dataset.error = String(Boolean(error))
    }
    this.compositionRequest = { id, timer: setTimeout(() => finish("No confirmation. Check Studio settings before retrying."), 20000) }
    try { this.ctx.sendToBackend({ type: "set_tag_prompt_mode", requestId: id, promptMode: mode }) }
    catch (error) { finish(String(error)) }
  }
  private get<T extends HTMLElement>(role: string): T { return this.root.querySelector<T>(`[data-q="${role}"]`)! }
  private status(message: string, error = false): void {
    const status = this.get("status"); status.textContent = message; status.dataset.error = String(error)
  }
  private select(role: string, entries: Array<[string, string]>, value: string): void {
    const node = this.get<HTMLSelectElement>(role)
    node.replaceChildren(...entries.map(([id, label]) => { const option = element("option", "", label); option.value = id; return option }))
    node.value = value
  }
  private render(): void {
    const data = this.data, binding = data?.characterFolder?.binding
    const busy = Boolean(this.pending) || !data
    this.root.setAttribute("aria-busy", String(Boolean(this.pending)))
    this.get("character-name").textContent = data?.activeChat?.characterName || "Character"
    this.get("character-state").textContent = !data?.activeChat?.characterId ? "No chat" : !binding ? "Not bound" : binding.enabled === false ? "Paused" : "Bound"
    this.get("character-style").textContent = binding ? `Style: ${data?.characterStyleName || "Inherit Studio"}` : ""
    const bind = this.get<HTMLButtonElement>("bind"); bind.hidden = Boolean(binding) || !data?.activeChat?.characterId; bind.disabled = busy
    this.get("character-fields").hidden = !binding
    this.get("character-empty").hidden = Boolean(data?.activeChat?.characterId)
    const characterEnabled = this.get<HTMLInputElement>("character-enabled"); characterEnabled.checked = binding?.enabled !== false; characterEnabled.disabled = busy || !binding
    this.select("look", (binding?.looks || []).map(look => [look.id, look.name]), binding?.activeLookId || "default")
    this.get<HTMLSelectElement>("look").disabled = busy || !binding
    const stackOptions: Array<[string, string]> = [["", "No bound stack"], ...(data?.stackPresets || []).map((preset): [string,string] => [preset.id, preset.name])]
    if (data?.studioStack?.length) stackOptions.push(["__studio_current__", "Bind current Studio stack"])
    let stackValue = binding?.stackPresetId || ""
    if (!stackValue && binding?.stackSnapshot?.length) { stackValue = "__custom_snapshot__"; stackOptions.unshift([stackValue, "Custom snapshot"]); }
    if (stackValue && !stackOptions.some(([id]) => id === stackValue)) stackOptions.unshift([stackValue, "Missing saved stack"])
    this.select("stack", stackOptions, stackValue)
    this.get<HTMLSelectElement>("stack").disabled = busy || !binding
    const custom = this.get<HTMLSelectElement>("stack").querySelector<HTMLOptionElement>('option[value="__custom_snapshot__"]'); if (custom) custom.disabled = true
    this.get("persona-name").textContent = data?.activePersona?.name || "Persona"
    const personaId = data?.personaBinding?.presetId || ""
    this.get("persona-state").textContent = !data?.activePersona ? "No persona" : !personaId ? "Not bound" : data.personaBinding.enabled === false ? "Paused" : "Bound"
    const profiles: Array<[string,string]> = [["", "No profile"], ...(data?.personaPresets || []).map((preset): [string,string] => [preset.id, preset.name])]
    if (personaId && !profiles.some(([id]) => id === personaId)) profiles.push([personaId, "Missing profile"])
    this.select("persona", profiles, personaId)
    this.get<HTMLSelectElement>("persona").disabled = busy || !data?.activePersona
    const personaEnabled = this.get<HTMLInputElement>("persona-enabled"); personaEnabled.checked = Boolean(personaId) && data?.personaBinding?.enabled !== false; personaEnabled.disabled = busy || !data?.activePersona || !personaId
    this.get<HTMLButtonElement>("refresh").disabled = Boolean(this.pending)
    this.get<HTMLButtonElement>("edit").disabled = this.pending?.mutation === true
  }
  setVisible(visible: boolean): void {
    this.root.hidden = !visible
    if (visible) {
      this.get<HTMLButtonElement>("back").focus({ preventScroll: true })
      this.root.scrollIntoView({ block: "start", inline: "nearest" })
      this.refresh()
    }
  }
  refresh(): void {
    if (this.disposed) return
    if (this.pending) { this.refreshQueued = true; return }
    this.send(false, {})
  }
  contextChanged(): void {
    this.data = null; this.render(); this.refresh()
  }
  private mutate(action: string, fields: Record<string, unknown> = {}): void {
    if (!this.data || this.pending || fields.presetId === "__custom_snapshot__") return
    this.send(true, { action, chatId: this.data.activeChat?.id, characterId: this.data.activeChat?.characterId, personaId: this.data.activePersona?.id, ...fields })
  }
  private send(mutation: boolean, fields: Record<string, unknown>): void {
    const id = createRequestId()
    this.pending = { id, mutation, action: typeof fields.action === "string" ? fields.action : undefined }
    // Keep the requested selection visible while saving, but lock it and do
    // not publish any confirmed state until the matching backend response.
    if (mutation) {
      this.root.setAttribute("aria-busy", "true")
      for (const control of this.root.querySelectorAll<HTMLInputElement | HTMLButtonElement | HTMLSelectElement>(".ss-quick-card[data-q] :is(input,button,select), [data-q=refresh], [data-q=edit]")) control.disabled = true
    } else this.render()
    this.status(mutation ? "Saving…" : "Reading current chat…")
    this.timer = setTimeout(() => { if (this.pending?.id !== id) return; this.pending = null; this.refreshQueued = false; this.data = null; this.render(); this.status("No confirmation received. Refresh to check saved state.", true) }, 20000)
    try { this.ctx.sendToBackend({ type: mutation ? "set_quick_visuals" : "get_quick_visuals", requestId: id, currentStack: this.getCurrentStack(), ...fields }) }
    catch (error) { this.onMessage({ type: "studio_error", requestId: id, error: String(error) }) }
  }
  onMessage(payload: any): void {
    if (this.compositionRequest && this.compositionRequest.id === payload?.requestId && ["tag_automation_result", "studio_error"].includes(payload?.type)) {
      clearTimeout(this.compositionRequest.timer); this.compositionRequest = null
      const control = this.get<HTMLSelectElement>("composition"); control.disabled = false; control.value = this.behavior.tagPromptMode
      const note = this.get("settings-status"); const error = payload.type === "studio_error" ? String(payload.error || "Could not save composition.") : ""
      note.textContent = error; note.dataset.error = String(Boolean(error))
      return
    }
    if (!this.pending || payload?.requestId !== this.pending.id || !["quick_visuals_result", "studio_error"].includes(payload.type)) return
    const { mutation } = this.pending; this.pending = null
    if (this.timer !== null) clearTimeout(this.timer); this.timer = null
    const queued = this.refreshQueued; this.refreshQueued = false
    if (payload.type === "quick_visuals_result" && payload.data) {
      this.data = payload.data as ChatVisualsState
      this.status(mutation ? "Saved." : "")
    } else {
      this.status(String(payload.error || "Could not read quick visuals."), true)
    }
    this.render()
    if (queued) this.refresh()
  }
  destroy(): void { this.disposed = true; if (this.timer !== null) clearTimeout(this.timer); if (this.compositionRequest) clearTimeout(this.compositionRequest.timer); this.root.remove() }
}
