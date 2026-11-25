interface StudioCastOpenOptions {
  member: StudioCastMember
  wardrobeKey?: string
  wardrobeName?: string
  wardrobeOutfit?: string
  wardrobeChoices?: {key:string;name:string;outfit:string;ready:number}[]
  switchWardrobe?: (key:string,create?:CastNewWardrobe)=>Promise<void>
  recipe?: CastRenderRecipe
  save: (member: StudioCastMember) => Promise<void>
  publish: (member: StudioCastMember, signal: AbortSignal) => Promise<void>
}
interface CastRecipeStudioContext {
  capture: CastRenderRecipe | undefined
  stacks: StackPreset[]
  checkpoints: CheckpointMetadata[]
  loras: LoraMetadata[]
  workflows: SwarmWorkflowSummary[]
  connectionId: string
  connections?: { id: string; name: string }[]
  inheritedRecipe?: GenerationRecipe
  samplers?: string[]
  schedulers?: string[]
  presets?: SwarmPreset[]
}
class StudioCastWorkspace {
  readonly render: () => void
  readonly openMember: (memberId:string) => void
  readonly openCurrent: () => void
  readonly dispose: () => void
  constructor(ctx: FrontendContext, root: HTMLElement, folders: () => OutputFolder[], open: (options: StudioCastOpenOptions) => void, pickImage: (initial: string, choose: (image: StudioExpressionImage) => void | Promise<void>, folderId?:string) => void, recipeContext?:()=>CastRecipeStudioContext, editArtwork?:(image:CurrentImage,target:{memberId?:string;expression?:string;groupId?:string;backgroundKey?:string})=>void) {
    const lifetime = new AbortController()
    let registryBaseline=cleanCastLibrary(null)
    let library = cleanCastLibrary(null), chatId = "", characterId = "", loading = true, loadFailed = false, unsaved = false, disposed = false
    let status = "Loading your Cast library…", savedSignature = "", authoritativeSignature = "", saveQueue = Promise.resolve(), toastTimer = 0, loadEpoch = 0
    let modalKind = "", focusBefore: HTMLElement | null = null, castDraft: any = null, memberDraft: any = null, useDraft: any = null
    let previewBackground = ""
    let backgroundSaving = false
    let backgroundDraftKey="", backgroundReviewBusy=false
    const backgroundJobs = new Map<string, any>()
    const genesisJobs = new Map<string, any>()
    const openedThisSession = new Map<string, number>()
    const selectedWardrobes = new Map<string,string>()
    const selectedWardrobe=(member:any):StudioCastWardrobe=>{const rows=castActiveWardrobes(member);return rows.find(row=>row.key===selectedWardrobes.get(member.id))||rows[0]}
    const selectWardrobe=(member:any,key:string)=>{selectedWardrobes.set(member.id,key);const row=selectedWardrobe(member);state.emotion=row.slots.joy?"joy":row.defaultExpression}
    function wardrobeBusy(member:any):boolean {const job=memberGenesisJob(member);return Boolean(job&&["queued","designing","review","rendering","processing"].includes(job.status))}
    function assertWardrobeMutable(member:any):void {if(wardrobeBusy(member))throw new Error("Finish the current Genesis production before reorganizing its expressions.")}

    const backgroundJobKey=(groupId:string,key:string)=>`${groupId}:${key}`
    function readBackgroundJobs(data:any):void {const previous=new Map(backgroundJobs);backgroundJobs.clear();for(const job of Array.isArray(data)?data:[]){const key=backgroundJobKey(job.groupId,job.key);backgroundJobs.set(key,{...job,preview:job.status==="generating"?previous.get(key)?.preview||"":""})}}
    let presentationMobileView: "looks" | "adjust" = "looks"
    let presentationQuery = "", presentationSearchOpen = false, presentationCropOpen = false, presentationGalleryScroll = 0
    const pending = new Map<string, { resolve: (data: any) => void; reject: (error: Error) => void; timer: number }>()
    let requestedMemberId="", expressionEditKey = "", requestedCurrent = false
    const state: any = { casts: [], castId: null, memberId: null, tab: "expressions", query: "", filter: "all", sort: "recent", activeCast: "", emotion: "neutral", menu: false }
    root.innerHTML = '<div class="cast-page" id="ss-cast-app"></div><dialog class="dialog" id="ss-cast-dialog" aria-labelledby="ss-cast-dialog-title"></dialog><div class="toast" id="ss-cast-toast" role="status" aria-live="polite" hidden></div>'
    const find = (selector: string): any => root.querySelector(selector.replace(/#(?!ss-cast-)([\w-]+)/g,"#ss-cast-$1"))
    const byId = (id: string): any => find(`#ss-cast-${id}`)
    const app = byId("app"), dialog = byId("dialog")
    const E = (value: unknown): string => widgetEscape(value)
    const currentCast = (): any => state.casts.find((cast: any) => cast.id === state.castId)
    const currentMember = (): any => currentCast()?.members.find((member: any) => member.id === state.memberId)
    const footer = (): string => ""
    const human = (key: string): string => key.replace(/[-_]/g, " ").replace(/^./, value => value.toUpperCase())
    const tagFor = (member: any, emotion = state.emotion): string => `<swarm-cast=${member.tag}-${castExpressionKey(emotion).toLowerCase()}${member.wardrobes?` wardrobe=${selectedWardrobe(member).key}`:""}>`
    const packetFor = (member: any, emotion = state.emotion, dialogue = '"Dialogue."'): string => `${tagFor(member, emotion)}${dialogue}</swarm-cast>`
    const rpc = (type: string, fields: Record<string, unknown> = {}): Promise<any> => new Promise((resolve, reject) => {
      if (disposed) { reject(new Error("Cast workspace closed.")); return }
      const requestId = createRequestId()
      const timer = window.setTimeout(() => { pending.delete(requestId); reject(new Error("Lumiverse did not respond. Your edits are still here; retry saving.")) }, 20000)
      pending.set(requestId, { resolve, reject, timer })
      try { ctx.sendToBackend({ ...fields, type, requestId }) } catch (error) { pending.delete(requestId); window.clearTimeout(timer); reject(error) }
    })
    const unsubscribe = ctx.onBackendMessage((payload: any) => {
      if(payload?.type==="cast_genesis_job"&&payload.data?.id){readGenesisActivity([payload.data]);refreshGenesisActivity();return}
      if (payload?.type === "cast_background_job") {
        const job=payload.data,key=backgroundJobKey(job.groupId,job.key)
        const previous=backgroundJobs.get(key)
        if(["ready","discarded"].includes(job.status))backgroundJobs.delete(key);else backgroundJobs.set(key,{...job,preview:job.status==="generating"?(job.preview||previous?.preview||""):""})
        if(job.status==="error")toast(job.error||"Background generation failed.")
        if(job.status==="ready")toast("Background saved to Cast and Background Assets.")
        if(modalKind==="background-generate"){refreshBackgroundGenerator();if(job.status==="review"&&previous?.status!=="review"&&currentCast()?.id===job.groupId&&backgroundDraftKey===job.key)dialog.querySelector(".dialog-body")?.scrollTo({top:0,behavior:"instant"})}
        if(modalKind==="backgrounds"&&!backgroundSaving){
          const list=dialog.querySelector("[data-background-jobs]")
          if(list)list.innerHTML=backgroundJobMarkup(currentCast()?.id)
        }
        return
      }
      if(payload?.type==="cast_library_changed"&&(payload.backgroundGenerated||payload.genesisGenerated||payload.editChanged||payload.registryChanged)){
        if(!unsaved&&!backgroundSaving){
          const oldCast=state.castId,oldMember=state.memberId,oldTab=state.tab
          adoptSavedLibrary(payload.library)
          if((payload.genesisGenerated||payload.editChanged)&&oldCast===state.castId&&oldMember===state.memberId&&oldTab===state.tab&&currentMember()&&app.querySelector(".member-profile"))refreshGenesisLibrary()
          else render()
          if(modalKind==="backgrounds")openBackgrounds()
          refreshGenesisActivity()
        }
        else toast("New Cast assets saved. Reload Cast if your current edit conflicts.")
        return
      }
      if (payload?.type === "cast_chat_changed") { void refreshContext().catch(report); return }
      const request = pending.get(String(payload?.requestId || ""))
      if (!request || !["cast_result", "studio_error", "upscale_workflow_result"].includes(payload?.type)) return
      pending.delete(payload.requestId); window.clearTimeout(request.timer)
      if (payload.type === "studio_error") request.reject(new Error(payload.error || "Cast request failed."))
      else request.resolve(payload.data)
    })
    function snapshot(): StudioCastLibrary {
      return cleanCastLibrary({ ...library, groups: state.casts.map((cast: any) => ({ id: cast.id, name: cast.name, description: cast.description, tone: cast.tone, defaultPresentation: cast.defaultStyle, backgrounds: cast.backgrounds, defaultBackground: cast.defaultBackground, atmosphere:cast.atmosphere, generateBackgrounds:cast.generateBackgrounds===true, genesis:cast.genesis, recipe:cast.recipe, inject: cast.prompt, openedAt: cast.openedAt })),
        members: state.casts.flatMap((cast: any) => cast.members.map((member: any) => ({ ...member, groupId: cast.id, prefix: member.tag, identityPrompt: member.notes,
          presentation: member.style || "inherit", defaultExpression: castExpressionKey(member.defaultExpression).toLowerCase() }))) })
    }
    function useLibrary(data: any): void {
      library = cleanCastLibrary(data)
      state.casts = library.groups.map(group => ({ ...group, defaultStyle: group.defaultPresentation, prompt: group.inject, mark: "✧", members: library.members.filter(member => member.groupId === group.id).map(member => viewMember(member)) }))
      state.activeCast = chatId ? castLibraryForChat(library, chatId).activeGroupId : ""
      if (requestedCurrent) {
        requestedCurrent = false
        selectCurrentCast()
      } else if (requestedMemberId) {
        const member=library.members.find(item=>item.id===requestedMemberId)
        if(member){state.castId=member.groupId;state.memberId=member.id;state.tab="presentation";state.emotion=member.defaultExpression;requestedMemberId=""}
      }
      if (!currentCast()) state.castId = null
      else if (!currentMember()) state.memberId = currentCast().members[0]?.id || null
    }
    function adoptSavedLibrary(data: unknown): void {
      useLibrary(data)
      registryBaseline=structuredClone(library)
      authoritativeSignature = JSON.stringify(library)
      savedSignature = JSON.stringify(snapshot())
    }
    function viewMember(member: StudioCastMember): any {
      const image = member.referenceImageId ? { id: member.referenceImageId, url: `/api/v1/images/${encodeURIComponent(member.referenceImageId)}` } : member.images[member.defaultExpression] || Object.values(member.images)[0]
      // Expression keys are identifiers, not display labels. In particular, a pack's
      // "01_stern_neutral" must not become "01-stern-neutral" on a render round-trip.
      return { ...structuredClone(member), tag: member.prefix, notes: member.identityPrompt, tone: "#8d7ba5", reference: image?.url || "", expressions: Object.keys(member.images),
        defaultExpression: member.defaultExpression, style: member.presentation === "inherit" ? null : member.presentation }
    }
    async function load(): Promise<void> {
      const epoch = ++loadEpoch
      loading = true; loadFailed = false; render()
      try {
        const data = await rpc("load_cast_library")
        if (disposed || epoch !== loadEpoch) return
        chatId = String(data.chatId || ""); characterId = String(data.characterId || "")
        readBackgroundJobs(data.backgroundJobs);readGenesisActivity(data.genesisJobs);adoptSavedLibrary(data); unsaved = false; status = ""
      } catch (error) { if (!disposed) { loadFailed = true; status = message(error) } }
      finally { if (!disposed && epoch === loadEpoch) { loading = false; render() } }
    }
    async function refreshContext(): Promise<void> {
      const data = await rpc("load_cast_library")
      if (disposed) return
      chatId = String(data.chatId || ""); characterId = String(data.characterId || "")
      state.activeCast = chatId ? castLibraryForChat(snapshot(), chatId).activeGroupId : ""
      render()
    }
    function persist(): Promise<void> {
      const raw=snapshot(),data=castRegistryReconcile(registryBaseline,raw),signature=JSON.stringify(data)
      // Propagate locally before enqueueing. A later queued snapshot must not
      // mistake an unchanged sibling for an edit that undoes the first save.
      for(const cast of state.casts)for(let i=0;i<cast.members.length;i++){
        const row=data.members.find(item=>item.id===cast.members[i].id),prior=raw.members.find(item=>item.id===cast.members[i].id)
        if(row&&prior&&JSON.stringify(row)!==JSON.stringify(prior))cast.members[i]=viewMember(row)
      }
      if(data.stash?.length)library.stash=structuredClone(data.stash);else delete library.stash
      registryBaseline=structuredClone(data)
      if (signature === savedSignature && !unsaved) return saveQueue
      unsaved = true; status = "Saving changes…"; syncStatus()
      const operation = saveQueue.catch(() => {}).then(async () => {
        if (signature !== savedSignature) {
          const saved = await rpc("save_cast_library", { library: data, baseSignature:authoritativeSignature })
          authoritativeSignature = JSON.stringify(cleanCastLibrary(saved))
        }
        if (disposed) return
        savedSignature = signature; unsaved = JSON.stringify(snapshot()) !== signature
        status = unsaved ? "Saving newer changes…" : "Saved to your Cast library."
        syncStatus()
      })
      saveQueue = operation
      return operation
    }
    function message(error: unknown): string { return error instanceof Error ? error.message : String(error) }
    function report(error: unknown): void {
      if (disposed) return
      status = message(error); syncStatus()
      const modal = dialog.open ? dialog : null
      if (!modal) { toast(status); return }
      if(modalKind==="presentation"){const note=dialog.querySelector("[data-cast-picker-status]");if(note)note.textContent=status;return}
      let note = modal.querySelector("[data-cast-error]")
      if (!note) { note = document.createElement("p"); note.className = "flash-note"; note.dataset.castError = "true"; note.setAttribute("role", "alert"); modal.querySelector(".dialog-body").prepend(note) }
      note.textContent = status
    }
    function toast(text: string): void {
      if (disposed) return
      window.clearTimeout(toastTimer)
      const node = byId("toast"); node.innerHTML = I("check") + `<span>${E(text)}</span>`; node.hidden = false
      toastTimer = window.setTimeout(() => { if (!disposed) node.hidden = true }, 4000)
    }
    function syncStatus(): void {
      if (disposed) return
      let node = byId("save-status")
      if (!node) { node = document.createElement("div"); node.id = "ss-cast-save-status"; app.append(node) }
      node.className = unsaved ? "cast-warning" : "cast-status"
      node.setAttribute("role", "status")
      const pickerStatus=dialog.querySelector("[data-cast-picker-status]")
      if(pickerStatus)pickerStatus.textContent=status||"Changes save to the Cast album."
      node.innerHTML = unsaved ? `<span>${E(status || "Saving changes…")}</span>${button("Retry saving", "retry-save", "small", "reset")}${status.includes("Cast changed while you were editing")?button("Reload Cast","reload-cast","small","reset"):""}` : E(status)
    }
    let registryDestination="",registryQuery="",registrySelection=new Set<string>(),registryBusy=false
    function registryRows(data=snapshot()):StudioCastMember[]{return castRegistryEntries(data).sort((a,b)=>a.name.localeCompare(b.name))}
    function registryCard(row:StudioCastMember,data:StudioCastLibrary):string{
      const members=data.members.filter(m=>castRegistryKey(m)===castRegistryKey(row)),target=members.find(m=>m.groupId===registryDestination),image=viewMember(row)
      const names=members.map(m=>data.groups.find(g=>g.id===m.groupId)?.name||"").filter(Boolean)
      const compatible=data.members.filter(m=>m.groupId===registryDestination&&m.id!==row.id&&castRegistryKey(m)!==castRegistryKey(row)&&!data.members.some(other=>other.id!==m.id&&castRegistryKey(other)===castRegistryKey(m))&&castRegistryCompatible(m,row))
      const canCopy=data.members.some(m=>m.groupId===registryDestination&&castRegistryKey(m)!==castRegistryKey(row))
      const linkAction=target?`<span class="cast-registry-linked" title="Already linked to the destination cast">${I("check")}<span>Linked</span></span>`:button("Link","registry-link","small","people",`data-id="${E(row.id)}" ${!registryDestination?"disabled":""}`)
      return `<article class="cast-registry-card" data-registry-search="${E(`${row.name} ${names.join(" ")} ${castWardrobes(row).map(w=>w.name).join(" ")}`.toLowerCase())}"><div class="cast-registry-person">${portrait(image)}<div class="grow"><strong>${E(row.name)}</strong><small>${castWardrobes(row).length} outfit${castWardrobes(row).length===1?"":"s"} · ${Object.keys(row.images).length} expression${Object.keys(row.images).length===1?"":"s"}</small><small>${E(names.join(" · ")||"Uncast · kept in library")}</small></div><label class="cast-registry-check"><input type="checkbox" aria-label="Select ${E(row.name)}" data-registry-id="${E(row.id)}" ${registrySelection.has(row.id)?"checked":""} ${target||!registryDestination?"disabled":""}></label></div>${!target&&compatible.length?`<div class="cast-registry-existing"><small>Link to a compatible existing member (keep its packet prefix and look)</small>${compatible.map(m=>button(`Link ${E(m.name)}`,"registry-existing","small","people",`data-id="${E(row.id)}" data-target="${E(m.id)}"`)).join("")}</div>`:""}<div class="cast-registry-actions">${linkAction}${button("Fork","registry-fork","small","copy",`data-id="${E(row.id)}" ${!registryDestination?"disabled":""}`)}${button("Copy outfit","registry-copy","small","shirt",`data-id="${E(row.id)}" ${!canCopy?'disabled title="No other destination member to copy an outfit to"':""}`)}</div></article>`
    }
    function refreshRegistryList():void{
      const list=(dialog as HTMLDialogElement).querySelector<HTMLElement>("[data-registry-list]");if(!list)return
      const data=snapshot();list.innerHTML=registryRows(data).map(row=>registryCard(row,data)).join("")||'<p class="hint">No characters yet. Add a member to any cast first.</p>'
      filterRegistry()
    }
    function filterRegistry():void{
      const query=registryQuery.trim().toLowerCase();for(const card of (dialog as HTMLDialogElement).querySelectorAll<HTMLElement>("[data-registry-search]"))card.hidden=!(card.dataset.registrySearch||"").includes(query)
      const count=dialog.querySelector("[data-registry-count]");if(count)count.textContent=`${registrySelection.size} selected`
      const link=(dialog as HTMLDialogElement).querySelector<HTMLButtonElement>('[data-cast-action="registry-batch"]');if(link)link.disabled=!registryDestination||!registrySelection.size||registryBusy
    }
    function openRegistry(destination=currentCast()?.id||"",reset=true):void{
      if(reset){registryQuery="";registrySelection.clear()}
      registryDestination=state.casts.some((c:any)=>c.id===destination)?destination:state.casts[0]?.id||""
      showModal("registry","Character library",`${registryRows().length} identities · Shared artwork, independent cast direction`,`<div class="cast-registry-toolbar"><label class="field">Destination cast<select id="ss-cast-registry-destination" ${!state.casts.length?"disabled":""}>${state.casts.map((c:any)=>`<option value="${E(c.id)}" ${c.id===registryDestination?"selected":""}>${E(c.name)}</option>`).join("")}</select></label><label class="field">Search characters<input id="ss-cast-registry-search" type="search" value="${E(registryQuery)}" placeholder="Name, outfit or cast"></label></div><p class="hint">Link to share future artwork and wardrobe edits. Fork for independent edits. Copy an outfit when two versions already have different expression packs. Removing a member keeps its identity in the library.</p><div class="cast-registry-grid" data-registry-list></div>`,`<p data-registry-count>0 selected</p><div class="actions">${button("Close","close-dialog","ghost")}${button("Link selected","registry-batch","primary","people",'disabled')}</div>`,true)
      refreshRegistryList()
    }
    function openRegistryCopy(sourceId:string):void{
      const data=snapshot(),source=[...data.members,...(data.stash||[])].find(m=>m.id===sourceId),targets=data.members.filter(m=>m.groupId===registryDestination&&source&&castRegistryKey(m)!==castRegistryKey(source))
      if(!source||!targets.length)throw new Error("Choose a different destination member.")
      const rows=castWardrobes(source).filter(row=>!row.archived)
      showModal("registry-copy","Copy an appearance set",`${source.name} · Artwork is referenced, never duplicated on disk.`,`<form id="ss-cast-registry-copy-form" data-source="${E(source.id)}" class="form-stack"><label class="field">Source outfit<select name="outfit">${rows.map(row=>`<option value="${E(row.key)}">${E(row.name)} · ${Object.keys(row.slots).length} expressions</option>`).join("")}</select></label><label class="field">Destination member<select name="target">${targets.map(row=>`<option value="${E(row.id)}">${E(row.name)}</option>`).join("")}</select></label><label class="field">New outfit name<input name="name" required maxlength="80" value="${E(rows[0].name)}"></label><p class="hint">The destination keeps all its existing expressions and packet keys. The copied outfit has its own settings and mappings; later edits are independent unless the destination is itself shared.</p></form>`,`<div class="actions">${button("Back","registry-back","ghost","back")}<button type="submit" class="button primary" form="ss-cast-registry-copy-form">Copy outfit</button></div>`)
    }
    async function registryAction(type:string,fields:Record<string,unknown>,notice:string):Promise<void>{
      if(registryBusy)return
      registryBusy=true
      const controls=Array.from((dialog as HTMLDialogElement).querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLSelectElement>("button,input,select")).filter(c=>!c.disabled);controls.forEach(c=>c.disabled=true)
      try{await persist();const saved=await rpc(type,{...fields,baseSignature:authoritativeSignature});if(disposed)return;adoptSavedLibrary(saved);unsaved=false;registrySelection.clear();render();if(type==="cast_registry_copy_outfit"){closeModal();if(registryDestination)openCast(registryDestination);const member=currentCast()?.members.find((m:any)=>m.id===fields.targetId);if(member){state.memberId=member.id;selectWardrobe(member,castExpressionKey(String(fields.name)).toLowerCase().slice(0,40));render()}}else openRegistry(registryDestination,false);toast(notice)}finally{registryBusy=false;controls.forEach(c=>{if(c.isConnected)c.disabled=false});filterRegistry()}
    }
    function render(): void {
      if (disposed) return
      if (state.castId && !currentCast()) state.castId = null
      app.innerHTML = state.castId ? renderWorkspace() : renderLibrary()
      if (!state.castId) renderLibraryResults()
      if (loadFailed) find("#library-results").insertAdjacentHTML("beforeend", `<p class="hint">${E(status)}</p>`)
      syncStatus()
      if (loading || loadFailed) for (const control of root.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>("button,input,select")) {
        if (control.dataset.castAction !== "retry") control.disabled = true
      }
    }
    function showModal(kind: string, title: string, subtitle: string, body: string, foot: string, wide = false): void {
      if (!dialog.open) focusBefore = document.activeElement as HTMLElement | null
      modalKind = kind; dialog.classList.toggle("wide", wide)
      dialog.dataset.castModal = kind
      dialog.dataset.castMobileView = presentationMobileView
      dialog.innerHTML = `<header class="dialog-header"><div><div class="eyebrow">${kind === "use" ? "Take them into the story" : "Cast album"}</div><h2 id="ss-cast-dialog-title">${title}</h2><p>${E(subtitle)}</p></div><button type="button" class="icon-button" data-cast-action="close-dialog" aria-label="Close dialog">${I("close")}</button></header><div class="dialog-body">${body}</div>${foot ? `<footer class="dialog-footer">${foot}</footer>` : ""}`
      if (!dialog.open) dialog.showModal()
    }
    function closeModal(): void { characterPickerEpoch++; dialog.close(); modalKind = ""; if (focusBefore?.isConnected) focusBefore.focus() }
    async function openPicker(callback: (image: StudioExpressionImage) => void | Promise<void>): Promise<void> { pickImage(memberDraft?.referenceImageId || currentMember()?.referenceImageId || "", callback) }
    async function editReference(draft: boolean): Promise<void> {
      await openPicker(async image => {
        const member = draft ? memberDraft : currentMember()
        member.referenceImageId = image.id; member.reference = `/api/v1/images/${encodeURIComponent(image.id)}`
        if(!draft&&member.wardrobes){const rows=castWardrobes(member);rows[0].referenceImageId=image.id;member.wardrobes=rows}
        if (draft) { byId("reference-state").textContent = "Reference selected · kept with this member"; dialog.querySelector(".identity-reference .portrait").innerHTML = art({ ...member, name: member.name || "?" }) }
        else { await persist(); render() }
      })
    }
    async function openExpressions(memberId=state.memberId): Promise<void> {
      await persist()
      const member = snapshot().members.find(item => item.id === memberId)
      if (!member) throw new Error("Choose a member first.")
      const wardrobe=selectedWardrobe(member), scoped=Boolean(member.wardrobes)
      const projected=scoped?castWardrobeView(member,wardrobe.key):structuredClone(member)
      const wardrobeSignature=(value:StudioCastMember)=>JSON.stringify({wardrobe:castWardrobes(value).find(row=>row.key===wardrobe.key),images:castWardrobeView(value,wardrobe.key).images})
      let expected=wardrobeSignature(member)
      open({ member: projected, wardrobeChoices:castActiveWardrobes(member).map(row=>({key:row.key,name:row.name,outfit:row.settings.workshop?.overrides.outfit??row.outfitPrompt,ready:Object.keys(row.slots).length})), switchWardrobe:async(key,create)=>{
        try{
          const latest=snapshot().members.find(item=>item.id===member.id);if(!latest)throw new Error("This member was removed.")
          if(create){assertWardrobeMutable(latest);const result=castCreateWardrobe(latest,wardrobe.key,create);const cast=state.casts.find((item:any)=>item.id===latest.groupId);const index=cast?.members.findIndex((item:any)=>item.id===latest.id);if(!cast||index<0)throw new Error("This member was removed.");cast.members[index]=viewMember(result.member);key=result.key;await persist()}
          else if(!castActiveWardrobes(latest).some(row=>row.key===key))throw new Error("This outfit is no longer available in this cast.")
          selectWardrobe(snapshot().members.find(item=>item.id===member.id)!,key);render();await openExpressions(member.id)
        }catch(error){report(error)}
      }, ...(scoped?{wardrobeKey:wardrobe.key,wardrobeName:wardrobe.name,wardrobeOutfit:wardrobe.key==="default"&&!wardrobe.outfitPrompt?undefined:wardrobe.outfitPrompt}:{}), recipe:cleanCastRenderRecipe(state.casts.find((item:any)=>item.id===member.groupId)?.recipe), save: async updated => {
        const cast = state.casts.find((item: any) => item.id === updated.groupId), index = cast?.members.findIndex((item: any) => item.id === updated.id)
        if (!cast || index < 0) throw new Error("This member was removed.")
        const latest=snapshot().members.find(item=>item.id===updated.id)!
        // Use the existing optimistic library save. A stale workshop must not
        // replace concurrent Genesis registrations or sibling outfit assets.
        if(wardrobeSignature(latest)!==expected||(!scoped&&latest.wardrobes))throw new Error("This wardrobe changed while the workshop was open. Reopen it before saving; other artwork is protected.")
        const next=castMergeWardrobe(latest,wardrobe.key,updated)
        cast.members[index] = viewMember(next)
        // If a network failure leaves a local draft, the normal optimistic
        // save path still protects it; allow the same workshop to retry it.
        // Compare against the same normalized representation used by snapshot()
        // and the backend, not transient generator URLs or extra image fields.
        expected=wardrobeSignature(snapshot().members.find(item=>item.id===updated.id)!)
        await persist(); render()
      }, publish: async (updated, signal) => {
        if(scoped){const latest=snapshot().members.find(item=>item.id===updated.id);if(!latest)throw new Error("This member was removed.");const row=castWardrobes(latest).find(item=>item.key===wardrobe.key);if(!row||!castWardrobeAvailable(latest,row))throw new Error("This outfit was removed, hidden or archived.");await publish({...latest,images:Object.fromEntries(Object.values(row.slots).map(asset=>[asset,latest.images[asset]]))},characterId,signal)}
        else await publish(updated, characterId, signal)
      } })
    }
    async function publish(member: StudioCastMember, target: string, signal = lifetime.signal): Promise<void> {
      if (!target) throw new Error("Choose a character destination first.")
      const mappings = Object.fromEntries(Object.entries(member.images).map(([label, image]) => [`${member.prefix}-${label}`, image.id]))
      if (!Object.keys(mappings).length) return
      const linked = await studioCharacterImageAction(target, Object.values(mappings), "gallery", fetch, signal)
      if (linked.failed.length) throw new Error(`Some ${member.name} images could not be linked. Saved assets remain in Cast; retry the export.`)
      const base = `/api/v1/characters/${encodeURIComponent(target)}/expressions`
      const response = await fetch(base + "/from-gallery", { method: "POST", credentials: "same-origin", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mappings }) })
      if (!response.ok) throw new Error(`Lumiverse could not save ${member.name} expressions (${response.status}). Retry the export; the original assets are retained.`)
      if (library.deployment !== "grouped") return
      const existing = await fetch(base + "/groups", { credentials: "same-origin", signal })
      if (!existing.ok) throw new Error("Prefixed expressions saved. This host could not load native expression groups.")
      const groups = await existing.json()
      if (!groups[member.prefix]) {
        const created = await fetch(base + "/groups", { method: "POST", credentials: "same-origin", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: member.prefix }) })
        if (!created.ok) throw new Error("Prefixed expressions saved, but native group creation failed. Retry the export.")
      }
      for (const [label, image] of Object.entries(member.images)) {
        const added = await fetch(`${base}/groups/${encodeURIComponent(member.prefix)}/labels`, { method: "POST", credentials: "same-origin", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label, imageId: image.id }) })
        if (!added.ok) throw new Error(`Native export stopped at ${member.prefix}-${label}. Saved expressions remain available; retry to finish.`)
      }
    }
    function openUseCast(): void { useDraft = { tab: "narrative", prompt: currentCast().prompt, format: library.deployment, target: characterId, persona: currentCast().members.find((m: any) => m.role === "persona")?.id || state.memberId || "" }; renderUseDialog() }
    function renderUseDialog(): void {
      const cast = currentCast(), d = useDraft
      const tabs = `<div class="use-tabs" role="tablist" aria-label="Use cast destination">${[["narrative", "In the narrative"], ["card", "Character card"], ["persona", "Persona"]].map(([key, label]) => `<button role="tab" aria-selected="${d.tab === key}" data-cast-action="use-tab" data-tab="${key}" tabindex="${d.tab === key ? 0 : -1}">${label}</button>`).join("")}</div>`
      const body = d.tab === "narrative" ? `<label class="option-card"><input type="checkbox" id="ss-cast-offer-prompt" ${d.prompt ? "checked" : ""}><span><strong>Let the story choose expressions</strong><small>Offer this cast’s saved expressions to the model, including persona members. Tags turn into expressions inside the narrative.</small></span></label><p class="hint">One cast is active per chat. Switching casts keeps every original member and expression.</p>`
        : d.tab === "card" ? `<p class="hint" style="margin-bottom:17px">An optional copy to Lumiverse. The original set stays in Cast.</p><label class="field">Destination<select id="ss-cast-export-target"><option value="">Choose a destination…</option>${characterId ? `<option value="${E(characterId)}" ${d.target === characterId ? "selected" : ""}>Current chat’s character card</option>` : ""}${folders().filter(folder => folder.binding && folder.binding.characterId !== characterId).map(folder => `<option value="${E(folder.binding!.characterId)}" ${d.target === folder.binding!.characterId ? "selected" : ""}>${E(folder.name)}</option>`).join("")}<option value="unlinked" ${d.target === "unlinked" ? "selected" : ""}>New asset folder · no card link</option></select></label><div style="margin-top:17px">${[["prefixed", "Prefixed expressions", "Shoto-joy, Mina-joy… one set, easy to recognize."], ["grouped", "Native cast groups", "A separate expression group for each member."]].map(([key, title, copy]) => `<label class="option-card"><input type="radio" name="export-format" value="${key}" ${d.format === key ? "checked" : ""}><span><strong>${title}</strong><small>${copy}</small></span></label>`).join("")}</div>`
        : `<label class="field">Expression set<select id="ss-cast-persona-member">${cast.members.map((member: any) => `<option value="${member.id}" ${member.id === d.persona ? "selected" : ""}>${E(member.name)} · ${member.expressions.length} expressions</option>`).join("")}</select></label><p class="independent-note">${I("spark")}Assigns the saved set to your active persona for Cast narrative tags. Native persona avatar switching is not exposed by this host.</p>`
      showModal("use", "Bring the cast along.", cast.name + " · optional destinations, one original library.", tabs + body, `<p>Saved images stay in your Cast library.</p><div class="actions">${button("Cancel", "close-dialog", "ghost")}${button(d.tab === "narrative" ? "Use in this chat" : d.tab === "card" ? "Send expressions" : "Assign to persona", "use-confirm", "primary", "arrow")}</div>`)
    }
    async function useCast(): Promise<void> {
      const cast = currentCast(), d = useDraft
      cast.prompt = d.prompt
      if (d.tab === "narrative") {
        if (!chatId) throw new Error("Open a Lumiverse chat to use this cast. Your library is available here anytime.")
        library.chatGroups[chatId] = cast.id; state.activeCast = cast.id; await persist(); closeModal(); render(); toast(`${cast.name} is ready in this chat.`); return
      }
      await persist()
      if (d.tab === "persona") {
        const result = await rpc("assign_cast_persona", { memberId: d.persona }); closeModal(); toast(`Expression set assigned to ${result.name}.`); return
      }
      if (!d.target) throw new Error("Choose a destination for this optional export.")
      library.deployment = d.format; await persist()
      let count = 0
      if (d.target === "unlinked") { const result = await rpc("export_cast_folder", { groupId: cast.id }); count = result.count }
      else for (const member of snapshot().members.filter(item => item.groupId === cast.id)) { await publish(member, d.target); count += Object.keys(member.images).length }
      closeModal(); toast(`Sent ${count} expressions. Originals remain in Cast.`)
    }
const paths: Record<string,string>={imageEdit:'M13 4H4v16h16v-9M4 16l5-5 4 4M14 7l5-5 3 3-5 5-4 1 1-4Z',shirt:'M8 3l4 3 4-3 5 4-3 5-3-1v10H9V11l-3 1-3-5 5-4Z',layers:'m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',plus:'M12 5v14M5 12h14',arrow:'M5 12h14m-5-5 5 5-5 5',back:'m14 6-6 6 6 6',chevron:'m9 5 7 7-7 7',search:'m21 21-4.4-4.4M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',spark:'m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',folder:'M3 7h7l2-3h8v16H3V7Z',lock:'M6 10h12v10H6V10Zm3 0V6a3 3 0 0 1 6 0v4',check:'m5 12 4 4L19 6',close:'m6 6 12 12M6 18 18 6',copy:'M8 8h12v12H8V8ZM4 16V4h12',edit:'m15 4 5 5M4 20l1-6L17 2l5 5-12 12-6 1Z',more:'M5 12h.01M12 12h.01M19 12h.01',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 0a4 4 0 0 1 0 8',send:'m22 2-7 20-4-9L2 9 22 2Zm0 0L11 13',image:'M3 3h18v18H3V3Zm0 13 5-5 4 4 3-3 6 6M8 7h.01',smile:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',reset:'M3 11a9 9 0 1 1 2 7M3 4v7h7',alert:'m12 3 10 18H2L12 3Zm0 5v6m0 3h.01',book:'M12 5C8 2 3 3 3 3v17s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v17'};
const I=(name: any)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.spark}"/></svg>`;
const button=(label: any,action: any,kind='',icon='',extra='')=>`<button type="button" class="button ${kind}" data-cast-action="${action}" ${extra}>${icon?I(icon):''}${label}</button>`;
const styles: Record<string,{name:string;description:string}>={sticker:{name:'Sticker',description:'Small, playful, and tucked beside the words. A little extra personality.'},portrait:{name:'Portrait',description:'Give an expression its own moment. A larger, uncluttered image.'}};
const expressionCount=(c: any)=>c.members.reduce((n: any,m: any)=>n+m.expressions.length,0);
const portrait=(m: any,classes='')=>`<div class="portrait ${classes}">${art(m)}</div>`;
function art(m: any){return m.reference?`<img src="${E(m.reference)}" alt="${E(m.name)} reference sample">`:`<div class="initial-art" style="--tone:${E(m.tone)}">${E(m.name.slice(0,1))}</div>`}
function renderLibrary(){let active=state.casts.find((c: any)=>c.id===state.activeCast);return `<section aria-label="Cast library"><header class="page-head"><h1>The cast album</h1><div class="row wrap">${button('Character library','registry-open','','people')}${button('New cast','new-cast','primary','plus')}</div></header>${active&&!loading && !loadFailed?`<aside class="album-intro"><span class="intro-mark">${I('book')}</span><div class="grow"><strong>${E(active.name)} is in this chat</strong><p>${active.members.length} members · ${expressionCount(active)} expressions ready for the story</p></div>${button('Open cast','open-cast','small','arrow',`data-id="${active.id}"`)}</aside>`:''}<div class="toolbar"><label class="search">${I('search')}<span class="sr-only">Search casts or members</span><input id="ss-cast-cast-search" type="search" placeholder="Find a cast or a familiar face…" value="${E(state.query)}"></label><div class="chips" aria-label="Filter casts">${[['all','All casts'],['active','In this chat'],['persona','With persona']].map(([key,name]: any)=>`<button class="chip" data-cast-action="filter" data-filter="${key}" aria-pressed="${state.filter===key}">${name}</button>`).join('')}</div><label class="sr-only" for="ss-cast-cast-sort">Sort casts</label><select class="sort" id="ss-cast-cast-sort"><option value="recent" ${state.sort==='recent'?'selected':''}>Recently opened</option><option value="name" ${state.sort==='name'?'selected':''}>Name A–Z</option></select></div><div id="ss-cast-library-results" aria-live="polite"></div><p class="library-foot">${I('lock')}Yours from the start. No character card or linked folder required.</p></section>${footer()}`}
function renderLibraryResults(){const target=find('#library-results');if(!target)return;if(loading){target.innerHTML=`<div class="album-grid">${[1,2,3].map(()=>'<div class="skeleton" aria-hidden="true"><div></div></div>').join('')}</div><p class="loading-note" role="status">Finding your familiar faces…</p>`;return}if(loadFailed){target.innerHTML=`<div class="empty"><span class="empty-stamp">${I('alert')}</span><h2>Your cast is still yours.</h2><p>We couldn’t open the library just now. Try again when you’re ready.</p>${button('Try again','retry','primary','reset')}</div>`;return}if(!state.casts.length){target.innerHTML=`<div class="empty"><span class="empty-stamp">${I('people')}</span><h2>Every story starts with someone.</h2><p>Make a cast for a whole world, a favorite duo, or just you. Give them a place to call home.</p>${button('Create your first cast','new-cast','primary','plus')}</div>`;return}let list=state.casts.filter((c: any)=>(state.filter==='all'||state.filter==='active'&&c.id===state.activeCast||state.filter==='persona'&&c.members.some((m: any)=>m.role==='persona'))&&`${c.name} ${c.members.map((m: any)=>m.name).join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));if(state.sort==='name')list.sort((a: any,b: any)=>a.name.localeCompare(b.name));else list.sort((a:any,b:any)=>(openedThisSession.get(b.id)??Number(b.openedAt||0))-(openedThisSession.get(a.id)??Number(a.openedAt||0)));target.innerHTML=`<div class="album-grid">${list.map((c: any,index: any)=>`<button class="cast-card" data-cast-action="open-cast" data-id="${c.id}" aria-label="Open ${E(c.name)}"><div class="cover" style="--cover:${c.tone}"><span class="cover-number">vol. ${String(index+1).padStart(2,'0')}</span><span class="tape"></span>${c.members.slice(0,3).map((m: any)=>`<span class="photo" data-caption="${E(m.name.split(' ')[0])}">${art(m)}</span>`).join('')||`<span class="cover-mark" style="position:static;font-size:60px">${c.mark}</span>`}<span class="cover-mark">${c.mark}</span></div>${c.id===state.activeCast?'<span class="pill active-tag"><span class="dot"></span>In this chat</span>':''}<div class="cast-card-copy"><h3>${E(c.name)}</h3><p class="desc">${E(c.description||'A new story, waiting for its familiar faces.')}</p><div class="cast-card-foot"><span>${c.members.length} members · ${expressionCount(c)} expressions</span><span class="row">Open cast ${I('arrow')}</span></div></div></button>`).join('')}${list.length?`<button class="new-cast-card" data-cast-action="new-cast"><span class="plus-circle">${I('plus')}</span><strong>Room for one more.</strong></button>`:`<div class="empty no-results"><span class="empty-stamp">${I('search')}</span><h2>No familiar faces here.</h2><p>Try another name or look through all your casts.</p>${button('Clear search & filters','clear-search','','reset')}</div>`}</div>`}
function openCast(id: any){state.castId=id;openedThisSession.set(id,Date.now());state.memberId=currentCast().members[0]?.id||null;state.tab='expressions';const member=currentMember();if(member)selectWardrobe(member,selectedWardrobe(member).key);state.menu=false;render();root.scrollTo({top:0})}
function renderWorkspace(){const c=currentCast(),m=currentMember();return `<div class="breadcrumb"><button data-cast-action="home">All casts</button>${I('chevron')}<span>${E(c.name)}</span></div><header class="workspace-head"><span class="cast-symbol" style="--cast-cover:${c.tone}">${c.mark}</span><div class="grow"><h1>${E(c.name)}</h1><p>${c.members.length} members · ${expressionCount(c)} expressions · Shared character library</p></div><div class="view-menu"><button class="icon-button" data-cast-action="cast-menu" aria-label="Cast options" aria-expanded="${state.menu}">${I('more')}</button>${state.menu?`<div class="popover">${['Rename cast','Duplicate cast','Delete cast'].map((label: any,i: any)=>`<button data-cast-action="${['rename-cast','duplicate-cast','delete-cast'][i]}">${label}</button>`).join('')}</div>`:''}</div><div class="head-actions">${button(state.activeCast===c.id?'In this chat':'Use in this chat','activate',state.activeCast===c.id?'':'ghost',state.activeCast===c.id?'check':'book')}${button('Recipe','recipe',c.recipe?'':'ghost','layers')}${button('Backgrounds','backgrounds','','book')}${button(`Genesis <span data-genesis-count ${genesisActivityCount(c.id)?'':'hidden'}>${genesisActivityCount(c.id)}</span>`,'genesis','','spark')}${button('Use cast…','use-cast','','send')}</div></header><div class="workspace" data-workspace-tab="${state.tab}"><aside class="roster" aria-label="Cast members"><div class="roster-head"><span>Members</span><span>${c.members.length}</span></div><div class="roster-items">${c.members.map((member: any)=>`<button class="member-button" data-cast-action="member" data-id="${member.id}" aria-pressed="${m?.id===member.id}">${portrait(member)}<span class="grow"><strong>${E(member.name)}</strong><small>${member.role==='persona'?'<span class="persona-mark">✧ Your persona</span>':`${member.expressions.length} expressions`}</small></span></button>`).join('')}</div>${button('Add member','new-member','add-member','plus')}${button('Link from library','registry-open','add-member','people')}<p class="roster-note">${I('lock')}Character assets can be shared across casts.</p></aside>${m?`<section class="member-body" aria-label="${E(m.name)} workspace"><header class="member-profile">${portrait(m,'large')}<div class="grow"><h2>${E(m.name)}</h2><div class="row wrap"><span class="pill ${m.role==='persona'?'pink':''}">${m.role==='persona'?'✧ Your persona':'Cast member'}</span><span class="pill line">${snapshot().members.filter(row=>castRegistryKey(row)===castRegistryKey(m)).length>1?'Shared character':'Saved in library'}</span></div></div><button class="icon-button" data-cast-action="edit-member" aria-label="Edit member identity">${I('edit')}</button></header><div class="member-tabs" role="tablist" aria-label="Member workspace">${[['expressions','Expressions'],['identity','Identity'],['presentation','Presentation']].map(([key,name]: any)=>`<button role="tab" id="ss-cast-tab-${key}" data-cast-action="member-tab" data-tab="${key}" aria-selected="${state.tab===key}" aria-controls="ss-cast-member-content" tabindex="${state.tab===key?'0':'-1'}">${name}</button>`).join('')}</div><div id="ss-cast-member-content" role="tabpanel" aria-labelledby="ss-cast-tab-${state.tab}">${state.tab==='identity'?identityView(m):state.tab==='presentation'?presentationView(c,m):expressionsView(m)}</div></section>`:`<section class="empty workspace-empty"><span class="empty-stamp">${I('people')}</span><h2>Who’s joining the story?</h2><p>Add a character, a persona, or someone who exists only in your imagination. They don’t need a character card.</p>${button('Add your first member','new-member','primary','plus')}</section>`}</div>${footer()}`}
function memberGenesisJob(m:any):any {
  return [...genesisJobs.values()].filter(job=>job.groupId===m.groupId&&(job.memberId?job.memberId===m.id:String(job.key).toLowerCase()===String(m.tag).toLowerCase())).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))[0]
}
function genesisSlotKeys(job:any):string[] {
  if(!job)return []
  const keys=Array.isArray(job.slots)?job.slots:(job.settings?.pipeline==="full"?EXPRESSION_SPREAD:EXPRESSION_BASICS).map(([key])=>key)
  return [...new Set<string>(keys.filter((key:unknown):key is string=>typeof key==="string"&&Boolean(castKey(key))))].slice(0,64)
}
function memberGenesisSummary(m:any,job:any):string {
  if(!job)return ""
  const keys=genesisSlotKeys(job),total=Math.max(1,Number(job.total)||keys.length||1),done=Math.min(total,job.status==="ready"?Math.max(0,Number(job.completed)||0):keys.filter(key=>Boolean(m.images?.[key])).length)
  const active=["queued","designing","rendering","processing"].includes(job.status),review=job.status==="review",retry=["error","stopped","interrupted"].includes(job.status)
  const title=job.status==="ready"?"Production complete":review?"Awaiting design approval":retry?job.status==="error"?"Needs attention":job.status==="interrupted"?"Interrupted · safe to resume":"Production stopped":job.stage||"Queued"
  const actions=`${review?button("Review design","genesis","small","spark"):""}${active||review?button("Stop","genesis-control","small","close",`data-id="${E(job.id)}" data-job-action="stop"`):""}${retry?button("Resume","genesis-control","small primary","reset",`data-id="${E(job.id)}" data-job-action="retry"`):""}`
  return `<section class="cast-member-genesis" data-job-status="${E(job.status)}" aria-label="Genesis production"><div class="cast-member-genesis-head"><span class="cast-genesis-job-mark">${I(job.status==="ready"?"check":retry?"alert":"spark")}</span><div class="grow"><div class="eyebrow">Genesis · ${job.settings?.pipeline==="full"?"Full spread":"Basics"}</div><strong>${E(title)}</strong>${job.slot&&job.status!=="ready"?`<small>${E(human(job.slot))}</small>`:""}</div><span class="cast-genesis-job-count">${done}/${total}</span>${actions?`<div class="cast-genesis-job-actions">${actions}</div>`:""}</div><progress max="${total}" value="${done}" aria-label="Registered expressions"></progress>${job.error?`<p class="hint" role="status">${E(job.error)}</p>`:""}${job.warnings?.length?`<p class="hint">${Number(job.warnings.length)} cleanup warning(s) · see Genesis production desk.</p>`:""}</section>`
}
function pendingGenesisTile(key:string,job:any):string {
  const current=job.slot===key,active=["queued","designing","rendering","processing"].includes(job.status)
  const stage=current?(active?job.stage||"Preparing":job.status==="error"?"Needs attention":job.status==="interrupted"?"Interrupted":job.status==="stopped"?"Stopped":"Waiting"):job.status==="review"?"Awaiting approval":active?"Queued":"Waiting to resume"
  const total=Math.max(0,Number(job.totalSteps)||0),step=Math.min(total,Math.max(0,Number(job.step)||0))
  return `<figure class="expression-tile cast-genesis-slot" data-expression-slot="${E(key)}" data-slot-state="${current&&active?"active":current&&job.status==="error"?"error":"pending"}" style="margin:0"><div class="expression-portrait cast-genesis-placeholder"><span class="cast-genesis-slot-icon">${I(current&&job.status==="error"?"alert":current&&active?"spark":"image")}</span><span class="cast-genesis-slot-stage">${E(stage)}</span>${current&&active?(total?`<progress max="${total}" value="${step}" aria-label="Current pass progress"></progress><small>${step}/${total}</small>`:`<progress aria-label="Current pass progress"></progress>`):""}</div><figcaption class="caption">${E(human(key))}</figcaption></figure>`
}
function unavailableWardrobes(rows:StudioCastWardrobe[],title:string,description:string,status:string):string {
  return rows.length?`<div class="cast-wardrobe-archive"><h4>${E(title)} <small>${rows.length}</small></h4><p>${E(description)}</p><div class="cast-wardrobe-grid">${rows.map(row=>`<button type="button" class="cast-wardrobe-card" data-cast-action="wardrobe-manage" data-outfit-key="${E(row.key)}"><span class="cast-wardrobe-thumb">${I("shirt")}</span><span class="grow"><strong>${E(row.name)}</strong><small>${Object.keys(row.slots).length} expressions · ${E(status)}</small></span>${I("chevron")}</button>`).join("")}</div></div>`:""
}
function wardrobeMarkup(m:any):string {
  const rows=castActiveWardrobes(m),all=castWardrobes(m),archived=all.filter(row=>row.archived),hidden=all.filter(row=>!row.archived&&!castWardrobeAvailable(m,row)),active=selectedWardrobe(m)
  return `<section class="cast-wardrobe" data-cast-wardrobes aria-label="Member wardrobes"><header><div class="grow"><h3>${I("shirt")} Wardrobe</h3><p>One character, distinct expression sets.</p></div><div class="row wrap">${button("New outfit","wardrobe-new","small","plus")}${button("Outfit settings","wardrobe-edit","small","edit")}</div></header><div class="cast-wardrobe-grid">${rows.map(row=>{const id=m.images[row.slots.neutral||row.slots[row.defaultExpression]||Object.values(row.slots)[0]]?.id||row.referenceImageId;return `<button type="button" class="cast-wardrobe-card" data-cast-action="wardrobe-select" data-wardrobe="${E(row.key)}" aria-pressed="${active.key===row.key}"><span class="cast-wardrobe-thumb">${id?`<img src="/api/v1/images/${encodeURIComponent(id)}" alt="" loading="lazy">`:I("shirt")}</span><span class="grow"><strong>${E(row.name)}</strong><small>${Object.keys(row.slots).length} expressions${row.key==="default"?" · Original":""}</small></span>${active.key===row.key?I("check"):""}</button>`}).join("")}</div>${unavailableWardrobes(hidden,"Hidden in this cast","Only this cast excludes these outfits. Show to use them here again.","Hidden here")}${unavailableWardrobes(archived,"Archived outfits","Globally archived. Kept for historical dialogue.","Archived globally")}${rows.length>1?`<div class="cast-wardrobe-foot"><small>Packet key: <code>${E(active.key)}</code> · Separate outfit and reference</small>${rows.length>1&&Object.keys(active.slots).length?button("Move expressions…","wardrobe-move","small","arrow"):""}${button(m.preferredWardrobe===active.key?"Starting outfit ✓":"Use as starting outfit","registry-prefer-wardrobe","small","star")}${active.key!=="default"?button("Manage outfit","wardrobe-manage","small ghost","trash",`data-outfit-key="${E(active.key)}"`):""}</div>`:""}</section>`
}
function openWardrobeForm(create:boolean):void {
  const member=currentMember();if(!member)return
  assertWardrobeMutable(member)
  const rows=castWardrobes(member),row=create?null:selectedWardrobe(member)
  if(create&&rows.length>=CAST_WARDROBE_LIMIT)throw new Error(`A member can have up to ${CAST_WARDROBE_LIMIT} wardrobes.`)
  const ref=row?.referenceImageId||"",neutral=row?.slots.neutral?member.images[row.slots.neutral]?.id:""
  showModal("wardrobe",create?"A new outfit":"Outfit settings",`${E(member.name)} · Independent expression collection`,`<form id="ss-cast-wardrobe-form" data-member="${E(member.id)}" data-wardrobe="${E(row?.key||"")}" class="form-stack"><label class="field">Outfit name<input name="name" required maxlength="80" value="${E(row?.name||"")}" placeholder="e.g. Dynamight"></label>${create?`<label class="field">Packet key <span class="muted">· optional</span><input name="key" maxlength="40" pattern="[A-Za-z0-9_-]+" placeholder="From the outfit name"><small>Stable key for the wardrobe attribute.</small></label>`:`<p class="hint">Packet key: <code>${E(row!.key)}</code> (kept stable for old dialogue).</p>`}<label class="field">Outfit prompt<textarea name="outfit" maxlength="4000" rows="5" placeholder="Garments, colors, accessories…">${E(row?.settings.workshop?.overrides.outfit??row?.outfitPrompt??"")}</textarea><small>Shared character identity and Cast Recipe still apply. Keep outfit-specific clothing here.</small></label><input type="hidden" name="reference" value="${E(ref)}"><div class="identity-reference"><span class="cast-wardrobe-thumb" data-wardrobe-reference>${ref?`<img src="/api/v1/images/${encodeURIComponent(ref)}" alt="">`:I("image")}</span><div class="grow"><strong>Outfit reference</strong><p class="hint">Use an image of this exact outfit, not another wardrobe.</p>${button("Choose image","wardrobe-reference","small","image")}${neutral?button("Use Neutral","wardrobe-neutral","small","check",`data-id="${E(neutral)}"`):""}${button("Clear","wardrobe-clear-ref","small","close")}</div></div>${row&&row.key!=="default"?button("Manage outfit…","wardrobe-manage","danger ghost","trash",`data-outfit-key="${E(row.key)}"`):""}</form>`,`${button("Cancel","close-dialog","ghost")}<button class="button primary" type="submit" form="ss-cast-wardrobe-form">${create?"Create outfit":"Save outfit"}</button>`)
}
let wardrobeLifecycleSnapshot=""
function openWardrobeLifecycle(key:string):void{
  const member=currentMember();if(!member)return
  assertWardrobeMutable(member)
  const row=castWardrobes(member).find(item=>item.key===key)
  if(!row||row.key==="default")throw new Error("The original outfit cannot be hidden, removed or archived.")
  const data=snapshot();wardrobeLifecycleSnapshot=JSON.stringify(data);const linked=data.members.filter(item=>castRegistryKey(item)===castRegistryKey(member)),names=linked.map(item=>data.groups.find(group=>group.id===item.groupId)?.name||item.groupId),affected=linked.filter(item=>item.preferredWardrobe===key).length
  const alternatives=castActiveWardrobes(member).filter(item=>item.key!==key),hidden=member.hiddenWardrobes?.includes(key)===true,castName=data.groups.find(group=>group.id===member.groupId)?.name||member.groupId
  const localAction=hidden?"Show in this cast":"Hide in this cast"
  showModal("wardrobe-lifecycle",`Manage ${E(row.name)}`,`${member.name} · ${Object.keys(row.slots).length} saved ${Object.keys(row.slots).length===1?"expression":"expressions"}`,
    `<div class="cast-wardrobe-lifecycle form-stack" data-member="${E(member.id)}" data-wardrobe="${E(key)}"><section class="cast-wardrobe-local"><h3>This cast · ${E(castName)}</h3><p class="hint">${row.archived?"Globally archived. Restore globally before changing local availability.":hidden?"Hidden here. Show this outfit in this cast only; other casts stay unchanged.":"Hide this outfit from this cast's new expression choices, workshop and prompts. Keep the artwork available in other casts and historical cards."}</p>${row.archived?"":button(localAction,hidden?"wardrobe-unhide":"wardrobe-hide","primary","shirt")}</section>${affected?`<label class="field">Replacement starting outfit<select name="replacement">${alternatives.map(item=>`<option value="${E(item.key)}">${E(item.name)}</option>`).join("")}</select><small>Local hide changes only this cast's starting preference. Global archive or removal changes affected casts only; if the replacement is hidden there, use the original outfit.</small></label>`:""}<section><h3>Shared outfit · all linked casts</h3><p class="hint">Affects ${linked.length} ${linked.length===1?"cast":"linked casts"}: ${E(names.join(", "))}.</p><h3>${row.archived?"Restore globally":"Archive globally"}</h3><p class="hint">${row.archived?"Restore the shared outfit, preserving any cast-local hides and existing starting preferences.":"Hide from every linked cast's new expression choices and prompts. Keep every expression, reference and workshop setting for older cards."}</p>${button(row.archived?"Restore globally":"Archive globally",row.archived?"wardrobe-restore":"wardrobe-archive","small","shirt")}</section><section class="cast-wardrobe-destructive"><h3>Remove globally · permanent</h3><p class="hint">Remove ${Object.keys(row.slots).length} expression ${Object.keys(row.slots).length===1?"mapping":"mappings"}, plus aliases and workshop settings from all linked casts. Older dialogue using this outfit may lose its artwork. Reusing its packet key later may change those cards. Image files and output folders are not deleted.</p><label class="cast-wardrobe-confirm"><input type="checkbox" name="confirm"><span>I understand that older cards may lose their artwork.</span></label></section></div>`,`${button("Cancel","close-dialog","ghost")}${button("Remove globally","wardrobe-remove-confirm","danger","trash",'disabled')}`)
}
function setWardrobeReference(form:HTMLFormElement,id:string):void {
  ;(form.elements.namedItem("reference") as HTMLInputElement).value=id
  const box=form.querySelector<HTMLElement>("[data-wardrobe-reference]")!;box.innerHTML=id?`<img src="/api/v1/images/${encodeURIComponent(id)}" alt="">`:I("image")
}
function syncWardrobeMoveCount():void {
  const count=dialog.querySelector("[data-wardrobe-move-count]")
  if(count){const slots=dialog.querySelectorAll('input[name="slot"]');count.textContent=`${dialog.querySelectorAll('input[name="slot"]:checked').length} of ${slots.length} selected`}
}
function openWardrobeMove():void {
  const member=currentMember();assertWardrobeMutable(member)
  const from=selectedWardrobe(member),rows=castActiveWardrobes(member).filter(row=>row.key!==from.key)
  if(!rows.length||!Object.keys(from.slots).length)throw new Error("Create another outfit and select a nonempty wardrobe first.")
  showModal("wardrobe-move","Move expressions",`${E(from.name)} · Keep your original image files`, `<form id="ss-cast-wardrobe-move" class="form-stack" data-member="${E(member.id)}" data-source="${E(from.key)}"><div class="cast-wardrobe-move-fields"><label class="field">Destination<select name="destination">${rows.map(row=>`<option value="${E(row.key)}">${E(row.name)}</option>`).join("")}</select></label><label class="field">Optional prefix to strip<input name="strip" placeholder="e.g. patrol-" maxlength="40"><small>Turns patrol-confident into confident without changing its historical asset key.</small></label></div><div class="cast-wardrobe-move-toolbar"><span data-wardrobe-move-count role="status">0 of ${Object.keys(from.slots).length} selected</span><div class="row wrap">${button("Select all","wardrobe-move-all","small","check")}${button("Clear selection","wardrobe-move-none","small","close")}</div></div><div class="cast-wardrobe-move-grid" role="group" aria-label="Expressions to move">${Object.entries(from.slots).map(([label,asset])=>`<label class="cast-wardrobe-move-tile"><img src="/api/v1/images/${encodeURIComponent(member.images[asset].id)}" alt="" loading="lazy"><span><input type="checkbox" name="slot" value="${E(label)}">${E(human(label))}</span></label>`).join("")}</div><p class="hint">Legacy packets without a wardrobe keep their exact saved asset key. Explicit packets resolve only inside their named outfit.</p></form>`,`${button("Cancel","close-dialog","ghost")}<button type="submit" class="button primary" form="ss-cast-wardrobe-move">Move selected</button>`,true)
}
function expressionsView(m: any): string {
  // Never derive an image lookup key from human-readable expression text.
  const wardrobe=selectedWardrobe(m),fallback=wardrobe.defaultExpression
  const entries = Object.entries(wardrobe.slots).flatMap(([label,asset])=>m.images[asset]&&castKey(m.images[asset].id)?[[label,m.images[asset]] as [string,{id:string;url:string}]]:[])
  const images=new Map(entries),labels=entries.map(([key])=>key),job=wardrobe.key==="default"?memberGenesisJob(m):undefined
  const planned=genesisSlotKeys(job),order=[...new Set([...planned.filter(key=>job?.status!=="ready"||images.has(key)),...labels])]
  return `${wardrobeMarkup(m)}<div class="section-heading"><div><h3>${E(m.wardrobes?wardrobe.name+" expressions":"Expression set")}</h3><p>${labels.length} saved · ${m.wardrobes?`Default: ${E(human(fallback))} · Missing expressions: ${wardrobe.slots.neutral?"use Neutral":"dialogue only"}`:`${E(human(fallback))} is the fallback`}${currentCast()?.recipe?` · <button type="button" class="text-button" data-cast-action="recipe">Cast Recipe</button>`:""}</p></div>${button('Open expressions','expressions','primary','spark')}</div>
    <div data-member-genesis>${memberGenesisSummary(m,job)}</div>
    ${order.length ? `<div class="expression-grid" aria-label="Expression previews" data-cast-expression-grid>${order.map(key => {
      const image=images.get(key);if(!image)return pendingGenesisTile(key,job)
      const display = human(key)
      return `<figure class="expression-tile" data-expression-slot="${E(key)}" data-slot-state="ready" style="margin:0"><div class="expression-portrait"><img src="/api/v1/images/${encodeURIComponent(image.id)}" alt="${E(display)}" loading="lazy"><div class="cast-expression-actions">${editArtwork?`<button type="button" class="cast-expression-icon" data-cast-action="edit-expression-art" data-expression="${E(wardrobe.slots[key])}" aria-label="Edit ${E(display)} artwork" title="Edit artwork">${INPAINT_ICON}</button>`:""}<button type="button" class="cast-expression-icon" data-cast-action="rename-expression" data-expression="${E(wardrobe.slots[key])}" aria-label="Rename ${E(display)} expression" title="Rename expression">${I('edit')}</button><button type="button" class="cast-expression-icon danger" data-cast-action="remove-expression" data-expression="${E(wardrobe.slots[key])}" aria-label="Remove ${E(display)} expression" title="Remove expression">${I('close')}</button></div></div><figcaption class="caption">${E(display)}${key===fallback?I('star'):''}${job&&job.status!=="ready"?`<span class="cast-genesis-ready-mark" title="Saved in Cast">${I('check')}</span>`:""}</figcaption></figure>`
    }).join('')}</div>`:`<div class="empty empty-set"><span class="empty-stamp">${I('smile')}</span><h2>A little more expression.</h2><p>Create or attach expressions in the full expression studio. This member doesn't need a character card.</p>${button('Open expression studio','expressions','','spark')}</div>`}
    ${labels.length?`<p class="hint" style="margin-top:12px">Rename or remove individual expressions here. Open Expression Studio to import packs or edit directions. Original image files stay in Lumiverse.</p>
    <div class="cast-set-preferences"><label class="field">Packet expression<select id="ss-cast-preview-expression">${labels.map(key=>`<option value="${E(key)}" ${key===state.emotion?'selected':''}>${E(human(key))}</option>`).join('')}</select></label><label class="field">Fallback expression<select id="ss-cast-fallback-expression">${labels.map(key=>`<option value="${E(key)}" ${key===fallback?'selected':''}>${E(human(key))}</option>`).join('')}</select></label></div>`:""}
    <div class="use-tag"><div class="grow"><small>Bounded expression packet · replace the dialogue</small><code>${E(packetFor(m))}</code></div><button class="icon-button" data-cast-action="copy-tag" aria-label="Copy expression packet">${I('copy')}</button></div>`
}
// Reconcile by key, preserving completed image nodes and the existing grid.
function refreshMemberExpressions():void {
  const m=currentMember(),panel=byId("member-content") as HTMLElement|null
  if(!m||state.tab!=="expressions"||!panel)return
  const template=document.createElement("template");template.innerHTML=expressionsView(m);const next=template.content
  const oldGrid=panel.querySelector("[data-cast-expression-grid]"),newGrid=next.querySelector("[data-cast-expression-grid]")
  if(!oldGrid||!newGrid){if(panel.innerHTML!==template.innerHTML)panel.replaceChildren(next);return}
  const oldTiles=new Map(Array.from(oldGrid.children).map(tile=>[tile.getAttribute("data-expression-slot"),tile]))
  const desired=new Set<string|null>()
  Array.from(newGrid.children).forEach((tile,index)=>{
    const key=tile.getAttribute("data-expression-slot");desired.add(key)
    let node=oldTiles.get(key)
    if(node&&node.outerHTML!==tile.outerHTML){
      const oldImage=node.querySelector("img"),newImage=tile.querySelector("img")
      if(oldImage&&newImage&&oldImage.outerHTML===newImage.outerHTML){const oldCaption=node.querySelector("figcaption"),newCaption=tile.querySelector("figcaption");if(oldCaption&&newCaption&&oldCaption.innerHTML!==newCaption.innerHTML)oldCaption.innerHTML=newCaption.innerHTML}
      else{node.replaceWith(tile);node=tile}
    }
    if(!node)node=tile
    if(oldGrid.children[index]!==node)oldGrid.insertBefore(node,oldGrid.children[index]||null)
  })
  for(const [key,tile] of oldTiles)if(!desired.has(key))tile.remove()
  for(const selector of ["[data-cast-wardrobes]",".section-heading","[data-member-genesis]","p.hint",".cast-set-preferences",".use-tag"]){
    const old=Array.from(panel.children).find(el=>el.matches(selector)),fresh=Array.from(next.children).find(el=>el.matches(selector))
    if(old&&fresh){if(old.outerHTML!==fresh.outerHTML)old.replaceWith(fresh)}
    else if(old)old.remove()
    else if(fresh)panel.insertBefore(fresh,panel.querySelector(".use-tag"))
  }
}
function refreshGenesisLibrary():void {
  const template=document.createElement("template");template.innerHTML=renderWorkspace();const next=template.content
  for(const selector of [".workspace-head > .grow p",".roster-head",".roster-items",".member-profile .portrait"]){
    const old=app.querySelector(selector),fresh=next.querySelector(selector);if(old&&fresh&&old.outerHTML!==fresh.outerHTML)old.replaceWith(fresh)
  }
  refreshMemberExpressions();syncStatus()
}

function identitySource(m: any): string { return `<label class="field field-wide">Generation identity<select name="folderId"><option value="">Unbound · this member’s appearance notes</option>${folders().filter(folder=>folder.binding).map(folder=>`<option value="${E(folder.id)}" ${m.folderId===folder.id?'selected':''}>${E(folder.name)}</option>`).join('')}</select><small>Use a saved character folder’s visual identity, or keep this member independent. Expressions stay in Cast.</small></label>` }
function identityView(m: any){return `<div class="identity-reference">${portrait(m,'large')}<div class="grow"><h3>Reference image</h3><p>${m.reference?'Kept with this member, right here.':'Optional. A visual anchor for consistent expressions.'}</p><button class="text-button" data-cast-action="pick-reference">${m.reference?'Change reference':'Choose a reference'}</button></div></div><form id="ss-cast-identity-form" class="form-stack"><div class="field-grid">${identitySource(m)}<label class="field">Name<input name="name" required maxlength="60" value="${E(m.name)}"></label><label class="field">Expression prefix<input name="tag" required maxlength="40" pattern="[A-Za-z0-9_-]+" value="${E(m.tag)}"><small>For example, ${E(m.tag)}-joy.</small></label><label class="field field-wide">Their appearance<textarea name="notes" placeholder="The details that make them recognizable…" maxlength="2000">${E(m.notes)}</textarea><small>Used for expression generation. Independent of any character card.</small></label><label class="field field-wide">Member role<select name="role"><option value="cast">Cast member</option><option value="persona" ${m.role==='persona'?'selected':''}>Your persona</option></select></label></div><div class="field-actions"><button type="button" class="button ghost danger" data-cast-action="remove-member">Remove member</button><button type="submit" class="button primary">Save identity</button></div></form><p class="independent-note">${I('lock')}This member belongs to your cast. Sending expressions to a character card is an optional, separate step.</p>`}
function styleThumb(key: any,m: any){return key==='story'?`<div class="mini-story">${portrait(m)}<span class="mini-lines"><i></i><i></i><i></i></span></div>`:`<div class="mini-${key}">${portrait(m)}</div>`}
function styleName(style: string): string {return CAST_PRESENTATION_INDEX.get(style)?.name || styles[style]?.name || (style === "story" ? "Story card (legacy)" : "Portrait")}
function presentationView(c: any,m: any){
  const selected=m.style||c.defaultStyle, design=CAST_PRESENTATION_INDEX.get(selected)
  return `<div class="section-heading"><div><h3>How they appear</h3><p>Pick a composition, then a look. Every saved expression follows this setting.</p></div></div><button class="cast-open-picker" data-cast-action="open-presentation-modal" aria-label="Choose a presentation preset"><span class="cast-open-picker-thumb">${styleThumb(selected,m)}</span><span class="grow"><small>Current presentation ${m.style?'· Member override':'· Cast default'}</small><strong>${E(styleName(selected))}</strong><span>${E(design?CAST_COMPOSITIONS.find(entry=>entry.id===design.composition)?.name||'Custom look':'Original Cast presentation')}</span></span><span class="cast-open-picker-icon">${I('chevron')}</span></button><div class="cast-member-placement"><div><strong>Stage position</strong><p>One side for ${E(m.name.split(' ')[0])}'s entire expression set. Auto keeps each look’s original composition.</p></div><div class="cast-member-side" role="group" aria-label="Stage position for ${E(m.name)}">${[['auto','Auto'],['left','Left'],['right','Right']].map(([side,label])=>`<button type="button" class="cast-side-choice" data-cast-action="presentation-side" data-side="${side}" aria-pressed="${m.presentationSide===side}" title="${side==='auto'?'Use the preset’s natural layout':`Place ${E(m.name)} on the ${side}`}">${label}</button>`).join('')}</div></div><div class="style-action"><p>${m.style?`A custom look for ${E(m.name.split(' ')[0])}. Other members keep the cast default.`:`Following the cast default. Every member starts with ${E(styleName(c.defaultStyle).toLowerCase())}.`}</p>${button(selected===c.defaultStyle?'Use cast default':'Make cast default','style-default','small',selected===c.defaultStyle?'check':'star')}</div>${m.style?'<button class="text-button" data-cast-action="style-reset">Reset this member to the cast default</button>':''}`
}
let presetFilter = "all"
// Each thumbnail uses the exact same 560px component as chat. Fit that
// *whole* composition to the gallery viewport, with a single uniform scale.
// Never change portrait or quote sizes just to make the picker look tidy.
function fitPresentationPreviews():void {
  if(modalKind!=="presentation")return
  for(const stage of Array.from(dialog.querySelectorAll(".cast-preset-preview") as NodeListOf<HTMLElement>)){
    const content=stage.querySelector<HTMLElement>(".cast-preset-scale")
    if(!content||!stage.clientWidth||!stage.clientHeight)continue
    const update=()=>{
      if(!content.isConnected)return
      const availableWidth=Math.max(1,stage.clientWidth-14)
      const availableHeight=Math.max(1,stage.clientHeight-12)
      const naturalWidth=content.offsetWidth
      const naturalHeight=content.scrollHeight
      const scale=Math.min(1,availableWidth/naturalWidth,availableHeight/Math.max(1,naturalHeight))
      content.style.setProperty("--cast-preview-fit",String(scale))
      content.style.top=Math.max(4,(stage.clientHeight-naturalHeight*scale)/2)+"px"
    }
    update()
    for(const img of Array.from(content.querySelectorAll<HTMLImageElement>("img")))
      if(!img.complete)img.addEventListener("load",update,{once:true})
  }
}
function refreshPickerCrop():void {
 if(modalKind!=="presentation")return
 const member=currentMember(),crop=member?.crop
 if(!crop)return
 const enabled=Boolean(crop.enabled),x=Number(crop.x),y=Number(crop.y),zoom=Number(crop.zoom)
 const well=dialog.querySelector(".cast-crop-well") as HTMLElement | null
 if(well){well.style.setProperty("--cast-crop-x",x+"%");well.style.setProperty("--cast-crop-y",y+"%");well.style.setProperty("--cast-crop-scale",String(enabled?zoom:1));well.dataset.enabled=String(enabled)}
 for(const widget of Array.from(dialog.querySelectorAll(".ss-cast-design") as NodeListOf<HTMLElement>)){
   if(widget.dataset.castPreset==="moonlit-halo")continue
   widget.style.setProperty("--cast-crop-x",(enabled?x:50)+"%")
   widget.style.setProperty("--cast-crop-y",(enabled?y:20)+"%")
   widget.style.setProperty("--cast-crop-scale",String(enabled?zoom:1))
 }
 ;(dialog.querySelectorAll("[data-cast-picker-crop]") as NodeListOf<HTMLInputElement>).forEach(input=>{
   const property=input.dataset.castPickerCrop||""
   if(property==="enabled")input.checked=enabled
   else { input.value=String(crop[property]);input.disabled=!enabled }
 })
 ;(dialog.querySelectorAll("[data-cast-crop-output]") as NodeListOf<HTMLOutputElement>).forEach(output=>{
   const property=output.dataset.castCropOutput||""
   output.textContent=property==="zoom"?zoom.toFixed(2)+"×":(property==="x"?x:y)+"%"
 })
}
function pickerCropEditor(member:any,sourceMember:StudioCastMember|null,sampleLabel:string):string {
 const crop=member.crop||{enabled:false,x:50,y:20,zoom:1}
 const image=sampleLabel?sourceMember?.images[sampleLabel]:null
 const src=image?.url|| (image?.id?`/api/v1/images/${encodeURIComponent(image.id)}`:"")
 const slider=(key:string,label:string,min:number,max:number,step:number)=>`<label class="cast-crop-slider"><span>${label}<output data-cast-crop-output="${key}">${key==='zoom'?Number(crop[key]).toFixed(2)+'×':crop[key]+'%'}</output></span><input type="range" data-cast-picker-crop="${key}" min="${min}" max="${max}" step="${step}" value="${crop[key]}" ${crop.enabled?'':'disabled'}></label>`
 return `<section class="cast-picker-crop" aria-label="Member crop adjustment"><div class="cast-crop-info"><div class="cast-crop-kicker">Crop workshop · ${E(member.name)}</div><strong>Fit the expression, not the frame.</strong><p>Shared framing for this member's cropped looks. Drag the image or adjust position and zoom. Transparent full-body looks stay uncropped.</p><label class="cast-crop-toggle"><input type="checkbox" data-cast-picker-crop="enabled" ${crop.enabled?'checked':''}><span>Enable crop framing</span></label></div><div class="cast-crop-well" data-enabled="${Boolean(crop.enabled)}" style="--cast-crop-x:${crop.x}%;--cast-crop-y:${crop.y}%;--cast-crop-scale:${crop.enabled?crop.zoom:1}">${src?`<img src="${E(src)}" alt="Crop preview for ${E(member.name)}" draggable="false">`:'<span>Save an expression to preview the crop.</span>'}<small>DRAG TO POSITION</small></div><div class="cast-crop-sliders">${slider('x','Horizontal',0,100,1)}${slider('y','Vertical',0,100,1)}${slider('zoom','Zoom',1,3,.05)}</div></section>`
}
let pickerCropDrag:{x:number;y:number;cropX:number;cropY:number;pointerId:number}|null=null
function openPresentationModal():void {
  presetFilter="all"
  presentationMobileView="looks"
  presentationQuery=""
  presentationSearchOpen=false
  presentationCropOpen=false
  presentationGalleryScroll=0
  showModal("presentation","Presentation library",`${currentMember()?.name||"Member"} · Cast album defaults`,presentationModalBody(),`<p data-cast-picker-status role="status">Changes save to the Cast album.</p><div class="actions">${button('Done','close-dialog','primary','check')}</div>`,true)
  requestAnimationFrame(fitPresentationPreviews)
}
function presentationModalBody():string {
 const cast=currentCast(),member=currentMember(); if(!cast||!member)return ""
 const selected=member.style||cast.defaultStyle
 const all=[...Object.entries(styles).map(([id,record])=>({id,name:record.name,description:record.description,composition:'legacy',origin:'legacy'})),...CAST_PRESENTATION_ENTRIES.map(entry=>({...entry,description:CAST_COMPOSITIONS.find(c=>c.id===entry.composition)?.hint||"",origin:entry.origin}))]
 const categories=[{id:'all',name:'All presentations'},{id:'legacy',name:'Original Cast'},...CAST_COMPOSITIONS]
 const countFor=(id:string)=>id==='all'?all.length:all.filter(item=>item.composition===id).length
 const active=all.filter(item=>presetFilter==='all'||item.composition===presetFilter)
 const sourceMember=snapshot().members.find(item=>item.id===member.id)
 const sampleLabel=sourceMember?.images[castExpressionKey(state.emotion).toLowerCase()]?castExpressionKey(state.emotion).toLowerCase():Object.keys(sourceMember?.images||{})[0]
 const previewMarkup=(id:string)=>{
   if(!sampleLabel||!sourceMember)return '<span class="cast-preset-empty">Add a saved expression to preview this look.</span>'
   const candidate={...snapshot(),activeGroupId:cast.id,members:snapshot().members.map(item=>item.id===member.id?{...item,presentation:id}:item)}
   return renderCastTags(`<swarm-cast=${sourceMember.prefix}-${sampleLabel}${previewBackground?` background=${previewBackground}`:""}>“Why would I lie about trading the Shibuya shift? Kamui wanted the foot traffic near the crossing, and I wanted to see you before Friday.”</swarm-cast>`,candidate,E)
 }
 const visibleGroups=categories.slice(1).filter(group=>presetFilter==='all'||group.id===presetFilter)
 const cards=(items:typeof active)=>items.map(item=>`<button class="cast-preset-choice" data-cast-action="style" data-style="${E(item.id)}" aria-pressed="${selected===item.id}" title="${E(item.name)} · ${E(item.description)}"><span class="cast-preset-preview"><span class="cast-preset-scale" style="width:${castPresentationStageWidth(item.id)}px">${previewMarkup(item.id)}</span></span><span class="cast-preset-title"><strong>${E(item.name)}</strong>${selected===item.id?'<span class="cast-preset-selected">Selected</span>':''}</span></button>`).join('')
 return `<nav class="cast-mobile-picker-tabs" aria-label="Presentation library sections"><button type="button" data-cast-action="presentation-mobile-tab" data-mobile-tab="looks" aria-pressed="${presentationMobileView==='looks'}">${I('book')} Looks <span>${all.length}</span></button><button type="button" data-cast-action="presentation-mobile-tab" data-mobile-tab="adjust" aria-pressed="${presentationMobileView==='adjust'}">${I('edit')} Framing</button></nav><aside class="cast-catalogue-sidebar"><div class="cast-catalogue-browse" data-search-open="${presentationSearchOpen||Boolean(presentationQuery)}"><div class="cast-catalogue-heading">Compositions</div><label class="cast-catalogue-select field"><span>Composition</span><select id="ss-cast-presentation-category" aria-label="Composition">${categories.map(group=>`<option value="${E(group.id)}" ${presetFilter===group.id?'selected':''}>${E(group.name)} (${countFor(group.id)})</option>`).join('')}</select></label><button type="button" class="cast-catalogue-search-toggle" data-cast-action="presentation-search-toggle" aria-label="Search presentations" aria-expanded="${presentationSearchOpen||Boolean(presentationQuery)}" aria-controls="ss-cast-presentation-search">${I('search')}</button><nav class="cast-preset-filters" aria-label="Composition filters">${categories.map(group=>`<button type="button" data-cast-action="presentation-filter" data-group="${group.id}" aria-pressed="${presetFilter===group.id}"><span>${E(group.name)}</span><small>${countFor(group.id)}</small></button>`).join('')}</nav><label class="cast-catalogue-search search">${I('search')}<span class="sr-only">Find a presentation</span><input id="ss-cast-presentation-search" type="search" placeholder="Find a presentation…" value="${E(presentationQuery)}"></label>${cleanCastBackgrounds(cast.backgrounds).length?`<label class="field cast-background-preview"><span>Scene preview · not saved</span><select id="ss-cast-preview-background"><option value="" ${!previewBackground?"selected":""}>Cast default</option><option value="none" ${previewBackground==="none"?"selected":""}>No image</option>${cleanCastBackgrounds(cast.backgrounds).map(bg=>`<option value="${E(bg.key)}" ${previewBackground===bg.key?"selected":""}>${E(bg.name)}</option>`).join("")}</select></label>`:""}</div><div class="cast-catalogue-settings"><section class="cast-gallery-stage" aria-label="Stage position preview"><div class="cast-gallery-stage-copy"><strong>Stage position · ${E(member.name)}</strong></div><div class="cast-member-side" role="group" aria-label="Stage position preview for ${E(member.name)}">${[['auto','Auto'],['left','Left'],['right','Right']].map(([side,label])=>`<button type="button" class="cast-side-choice" data-cast-action="presentation-side" data-side="${side}" aria-pressed="${member.presentationSide===side}" title="Preview ${side} stage position">${label}</button>`).join('')}</div></section><button type="button" class="cast-catalogue-crop-toggle" data-cast-action="presentation-crop-toggle" aria-expanded="${presentationCropOpen}" aria-controls="ss-cast-catalogue-crop">${I('edit')} <span>Crop framing</span>${I('chevron')}</button><div id="ss-cast-catalogue-crop" class="cast-catalogue-crop" data-expanded="${presentationCropOpen}">${pickerCropEditor(member,sourceMember||null,sampleLabel||"")}</div></div></aside><div class="cast-picker-looks"><div class="cast-catalogue-current"><div><small>Current album presentation</small><strong data-cast-current-presentation>${E(styleName(selected))}</strong><span data-cast-current-scope>${member.style?'Member override':'Following Cast default'}</span></div>${button('Use Cast default','style-reset','small','reset',member.style?'':'disabled')}</div><div class="cast-preset-count" role="status" ${presentationQuery.trim()?'':'hidden'}>${active.length} presentations</div><div class="cast-catalogue-gallery">${visibleGroups.map(group=>{const items=active.filter(item=>item.composition===group.id);return items.length?`<section class="cast-preset-group"><div class="cast-preset-group-heading"><div><h3>${E(group.name)}</h3>${"hint" in group?`<p>${E(group.hint)}</p>`:""}</div><span>${items.length} looks</span></div><div class="cast-preset-grid">${cards(items)}</div></section>`:''}).join('')}<p class="cast-catalogue-no-results" hidden>No matching presentations in this composition.</p></div></div>`
}

function filterPresentationSearch():void {
 const query=presentationQuery.trim().toLowerCase();let count=0
 for(const group of (dialog as HTMLDialogElement).querySelectorAll<HTMLElement>(".cast-preset-group")){
   let visible=0
   for(const card of group.querySelectorAll<HTMLElement>(".cast-preset-choice")){
     card.hidden=!(card.querySelector(".cast-preset-title strong")?.textContent||"").toLowerCase().includes(query)
     if(!card.hidden){visible++;count++}
   }
   group.hidden=visible===0
   const groupCount=group.querySelector(".cast-preset-group-heading>span");if(groupCount)groupCount.textContent=`${visible} look${visible===1?'':'s'}`
 }
 const total=(dialog as HTMLDialogElement).querySelector<HTMLElement>(".cast-preset-count");if(total){total.textContent=`${count} presentation${count===1?'':'s'}`;total.hidden=!query}
 const empty=(dialog as HTMLDialogElement).querySelector<HTMLElement>(".cast-catalogue-no-results");if(empty)empty.hidden=count!==0
 requestAnimationFrame(fitPresentationPreviews)
}
function refreshPresentationCatalogue(reset=false,focusSelector=""):void {
 const body=(dialog as HTMLDialogElement).querySelector<HTMLElement>(".dialog-body");if(!body)return
 const gallery=body.querySelector<HTMLElement>(".cast-picker-looks"),sidebar=body.querySelector<HTMLElement>(".cast-catalogue-sidebar")
 const top=reset?0:(gallery?.scrollTop||0),sideTop=sidebar?.scrollTop||0
 body.innerHTML=presentationModalBody();filterPresentationSearch()
 const next=body.querySelector<HTMLElement>(".cast-picker-looks");if(next)next.scrollTop=top
 const nextSide=body.querySelector<HTMLElement>(".cast-catalogue-sidebar");if(nextSide)nextSide.scrollTop=sideTop
 if(reset)presentationGalleryScroll=0
 if(focusSelector)body.querySelector<HTMLElement>(focusSelector)?.focus({preventScroll:true})
}
function selectPresentationCategory(id:string,focusSelector=""):void {
 if(!["all","legacy",...CAST_COMPOSITIONS.map(group=>group.id)].includes(id))return
 presetFilter=id;refreshPresentationCatalogue(true,focusSelector)
}
function updatePresentationSelection():void {
 const cast=currentCast(),member=currentMember();if(!cast||!member)return
 const selected=member.style||cast.defaultStyle
 for(const card of (dialog as HTMLDialogElement).querySelectorAll<HTMLElement>(".cast-preset-choice")){
   const active=card.dataset.style===selected;card.setAttribute("aria-pressed",String(active))
   const marker=card.querySelector(".cast-preset-selected");if(marker&&!active)marker.remove()
   if(active&&!marker)card.querySelector(".cast-preset-title")?.insertAdjacentHTML("beforeend",'<span class="cast-preset-selected">Selected</span>')
 }
 const title=dialog.querySelector("[data-cast-current-presentation]");if(title)title.textContent=styleName(selected)
 const scope=dialog.querySelector("[data-cast-current-scope]");if(scope)scope.textContent=member.style?'Member override':'Following Cast default'
 const reset=(dialog as HTMLDialogElement).querySelector<HTMLButtonElement>('.cast-catalogue-current [data-cast-action="style-reset"]');if(reset)reset.disabled=!member.style
}
function openCreateCast(rename: any=false){const c=currentCast();castDraft={tone:rename?c.tone:'#513344',rename};const colors=[['#513344','Rose'],['#40354e','Lilac'],['#3b4842','Sage'],['#353b53','Blue'],['#514539','Honey']];showModal('cast',rename?'A new name, same familiar faces.':'Make a little ensemble.',rename?'Your members and expressions stay right where they are.':'A whole world, a favorite duo, or just you. Every cast gets a library of its own.',`<form id="ss-cast-cast-form" class="form-stack"><label class="field">Cast name<input name="name" required maxlength="55" placeholder="e.g. The night shift" value="${rename?E(c.name):''}" autofocus></label><label class="field">A little description <span class="muted">(optional)</span><textarea name="description" maxlength="160" placeholder="What brings these faces together?">${rename?E(c.description):''}</textarea></label><div class="field"><span>Album color</span><div class="accent-picker" aria-label="Album color">${colors.map(([tone,name]: any)=>`<button type="button" class="swatch" style="--swatch:${tone}" data-cast-action="accent" data-tone="${tone}" aria-label="${name}" aria-pressed="${tone===castDraft.tone}"></button>`).join('')}</div></div><div class="independent-note">${I('lock')}No character card, folder, or connection needed. Start here; link later if you want to.</div></form>`,`<p>Saved in your Cast library.</p><div class="actions">${button('Cancel','close-dialog','ghost')}<button class="button primary" type="submit" form="ss-cast-cast-form">${rename?'Save cast':'Create cast'} ${I('arrow')}</button></div>`)}
    let characterPickerEpoch = 0
    let characterImport: { character: any; config: any; groups: Record<string, unknown> } | null = null
    async function castRead(url: string): Promise<any> {
      const response = await fetch(url, { credentials: "same-origin", signal: lifetime.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Lumiverse could not load this character.")
      return data
    }
    async function chooseCharacter(query = "", offset = 0): Promise<void> {
      const epoch = ++characterPickerEpoch
      showModal("characters", "A familiar face.", "Copy a character’s mapped expressions into this cast. The originals stay with their character.", `<div class="form-stack"><label class="field">Find a character<input id="ss-cast-character-query" type="search" placeholder="Search characters…" value="${E(query)}"></label>${button("Search", "search-characters", "small")}<div id="ss-cast-character-results" role="status">Loading characters…</div></div>`, button("Start from scratch", "scratch-member", "ghost"))
      const page = await castRead(`/api/v1/characters/summary?limit=30&offset=${offset}&search=${encodeURIComponent(query)}`)
      if (disposed || modalKind !== "characters" || epoch !== characterPickerEpoch) return
      const results = byId("character-results")
      results.innerHTML = `<div class="form-stack">${(page.data || []).map((character: any) => { const id=String(character.id||""),name=String(character.name||"Unnamed character");return `<button type="button" class="button ghost character-choice" data-cast-action="select-character" data-id="${E(id)}"><span class="cast-character-avatar" aria-hidden="true"><span class="cast-character-avatar-initial">${E(name.slice(0,1).toUpperCase())}</span><img src="/api/v1/characters/${encodeURIComponent(id)}/avatar?size=sm" alt="" loading="lazy"></span><span class="cast-character-name">${E(name)}</span></button>` }).join("") || '<p class="hint">No matching characters.</p>'}</div><div class="actions" style="margin-top:16px">${offset ? button("Previous", "character-page", "small", "", `data-offset="${Math.max(0, offset - 30)}"`) : ""}${offset + 30 < Number(page.total) ? button("Next", "character-page", "small", "", `data-offset="${offset + 30}"`) : ""}</div>`
    }
    async function selectCharacter(id: string): Promise<void> {
      const epoch = ++characterPickerEpoch
      const base = `/api/v1/characters/${encodeURIComponent(id)}`
      const [character, config, groups] = await Promise.all([castRead(base), castRead(base + "/expressions"), castRead(base + "/expressions/groups")])
      if (disposed || modalKind !== "characters" || epoch !== characterPickerEpoch) return
      characterImport = { character, config, groups }
      showModal("character-set", "Bring their expressions along.", character.name, `<label class="field">Expression source<select id="ss-cast-character-set"><option value="">Character’s mapped expressions · ${Object.keys(config.mappings || {}).length}</option>${Object.entries(groups).map(([name, mappings])=>`<option value="${E(name)}">${E(name)} · ${Object.keys(recipeRecord(mappings)).length}</option>`).join("")}</select><small>A saved copy belongs to Cast. Choose a saved visual identity in the next step, or keep the member unbound.</small></label>`, `<div class="actions">${button("Back", "import-character", "ghost")}${button("Use character", "apply-character", "primary")}</div>`)
    }
    function applyCharacter(): void {
      if (!characterImport) return
      const { character, config, groups } = characterImport
      const group = byId("character-set").value
      const mappings = recipeRecord(group ? groups[group] : config.mappings)
      const images = Object.fromEntries(Object.entries(mappings).filter(([, id]) => castKey(id)).map(([label, id]) => [castExpressionKey(label).toLowerCase(), { id, url: `/api/v1/images/${encodeURIComponent(String(id))}` }]))
      const folder = folders().find(item => item.binding?.characterId === character.id)
      openNewMember()
      Object.assign(memberDraft, { sourceCharacterId: character.id, name: character.name, images, folderId: folder?.id || "", defaultExpression: castExpressionKey(config.defaultExpression || "neutral").toLowerCase() })
      memberDraft.referenceImageId = images[memberDraft.defaultExpression]?.id || Object.values(images)[0]?.id || ""
      memberDraft.reference = memberDraft.referenceImageId ? `/api/v1/images/${encodeURIComponent(memberDraft.referenceImageId)}` : ""
      renderMemberForm()
    }

function openNewMember(edit: any=false){const m=currentMember();memberDraft=edit?structuredClone(m):{name:'',tag:'',notes:'',reference:'',role:'cast',tone:'#907a9e'};memberDraft.edit=edit;renderMemberForm()}
function renderMemberForm(){const edit=memberDraft.edit;showModal('member',edit?'The details that make them, them.':'A new familiar face.',edit?'Keep their identity here, independent of any character card.':'A character, your persona, someone new. They all have a place here.',`<form id="ss-cast-member-form" class="form-stack">${!edit?`<div class="role-options">${button("Start from scratch","scratch-member","small")}${button("From Lumiverse character","import-character","small","people")}${button("Link from library","registry-open","small","people")}</div>`:""}${identitySource(memberDraft)}<label class="field">Name<input name="name" required maxlength="60" placeholder="e.g. Mina Ashido" value="${E(memberDraft.name)}" autofocus></label><div class="field"><span>Their place in the story</span><div class="role-options">${[['cast','people','Cast member'],['persona','spark','Your persona']].map(([role,icon,name]: any)=>`<button type="button" class="role-choice" data-cast-action="member-role" data-role="${role}" aria-pressed="${memberDraft.role===role}">${I(icon)}${name}</button>`).join('')}</div></div><div class="identity-reference" style="margin-bottom:0">${portrait({...memberDraft,name:memberDraft.name||'?'})}<div class="grow"><h3>Reference image <span class="muted">· optional</span></h3><p id="ss-cast-reference-state">${memberDraft.reference?'Reference selected':'Add a face now, or come back to it.'}</p><button class="text-button" type="button" data-cast-action="draft-reference">Choose image</button></div></div><label class="field">Appearance notes <span class="muted">(optional)</span><textarea name="notes" maxlength="2000" placeholder="Hair, eyes, clothes… the things that make them recognizable.">${E(memberDraft.notes)}</textarea></label><details class="advanced"><summary>Expression prefix</summary><label class="field" style="margin-top:12px">Prefix<input name="tag" maxlength="40" pattern="[A-Za-z0-9_-]+" placeholder="Automatically from their name" value="${E(memberDraft.tag)}"><small>Used in tags such as &lt;swarm-cast=Mina-joy&gt;.</small></label></details></form>`,`<p>They’ll be available in your shared character library.</p><div class="actions">${button('Cancel','close-dialog','ghost')}<button class="button primary" type="submit" form="ss-cast-member-form">${edit?'Save identity':'Add member'} ${I('plus')}</button></div>`);memberDraft.edit=edit}
function editExpression(key: string): void {
  const member=currentMember()
  if(!member || !Object.prototype.hasOwnProperty.call(member.images,key))throw new Error("That expression is no longer in this member's album.")
  expressionEditKey=key
  const displayKey=castWardrobeForAsset(member,key)?.label||key
  showModal("expression-rename","Rename expression",`${member.name} · ${human(key)}`,`<form id="ss-cast-expression-rename-form" class="form-stack"><label class="field">Expression key<input name="expression" required maxlength="64" value="${E(displayKey)}" autocomplete="off" autofocus><small>Spaces become hyphens. The name is used by future &lt;swarm-cast&gt; packets; existing chat messages keep their original text.</small></label><p class="hint">The picture is kept exactly as it is.</p></form>`,`<div class="actions">${button('Cancel','close-dialog','ghost')}<button class="button primary" type="submit" form="ss-cast-expression-rename-form">Save name</button></div>`)
}
function removeExpressionPrompt(key:string):void {
  const member=currentMember()
  if(!member || !Object.prototype.hasOwnProperty.call(member.images,key))throw new Error("That expression is no longer in this member's album.")
  expressionEditKey=key
  showModal("expression-delete",`Remove ${E(human(key))}?`,`${member.name} · Expression album`,`<p class="hint">This removes <strong>${E(key)}</strong> from this member's Cast expression set. It won't delete the original image file or alter the source character card. Existing chat packets are not rewritten.</p>`,`<div class="actions">${button('Keep it','close-dialog','ghost')}${button('Remove expression','confirm-remove-expression','danger','trash')}</div>`)
}
function updateExpressionKey(member:any,oldKey:string,newKey:string):void {
  if(!Object.prototype.hasOwnProperty.call(member.images,oldKey))throw new Error("The original expression no longer exists.")
  if(!castKey(newKey))throw new Error("Use letters, numbers, hyphens or underscores, starting with a letter or number.")
  if(member.wardrobes){
    assertWardrobeMutable(member)
    const rows=castWardrobes(member),row=rows.find(item=>Object.values(item.slots).includes(oldKey))!
    const label=Object.keys(row.slots).find(label=>row.slots[label]===oldKey)!
    if(newKey===label)return
    if(Object.hasOwn(row.slots,newKey)||Object.hasOwn(row.aliases,newKey))throw new Error("That name is already used in this wardrobe.")
    row.slots=Object.fromEntries(Object.entries(row.slots).map(([k,v])=>[k===label?newKey:k,v]));row.aliases[label]=oldKey
    if(row.defaultExpression===label)row.defaultExpression=newKey
    member.wardrobes=rows;if(state.emotion===label)state.emotion=newKey;return
  }
  if(newKey!==oldKey && Object.keys(member.images).some(key=>key.toLowerCase()===newKey.toLowerCase()))throw new Error("That expression name is already used by this member.")
  if(newKey===oldKey)return
  // Re-key the mapping, not the image asset. Preserve the album's order.
  member.images=Object.fromEntries(Object.entries(member.images).map(([key,image])=>[key===oldKey?newKey:key,image]))
  member.expressions=Object.keys(member.images)
  if(member.defaultExpression===oldKey)member.defaultExpression=newKey
  if(state.emotion===oldKey)state.emotion=newKey
  // Generation-direction slots are a separate reusable set; re-keying the
  // saved image must not invalidate their built-in/custom selection metadata.
}
function removeExpressionKey(member:any,key:string):void {
  if(!Object.prototype.hasOwnProperty.call(member.images,key))throw new Error("The expression has already been removed.")
  if(member.wardrobes)assertWardrobeMutable(member)
  delete member.images[key]
  if(member.wardrobes){member.wardrobes=castWardrobes(member);state.emotion=selectedWardrobe(member).defaultExpression}
  member.expressions=Object.keys(member.images)
  if(member.defaultExpression===key)member.defaultExpression=member.images.neutral?'neutral':member.expressions[0]||'neutral'
  if(state.emotion===key)state.emotion=member.wardrobes?selectedWardrobe(member).defaultExpression:member.defaultExpression
}
function confirmDelete(kind: any){const c=currentCast(),m=currentMember(),name=kind==='member'?m.name:c.name;showModal('confirm',`Remove ${E(name)}?`,'This affects your Cast library.',`<p class="hint">${kind==='member'?'The member will leave this cast.':'This album will be removed; its characters stay in your character library.'} Saved images and already deployed expressions are kept.</p>`,`<div class="actions">${button('Keep them','close-dialog','ghost')}${button('Remove','confirm-remove','danger','trash',`data-kind="${kind}"`)}</div>`)}
function slug(name: any){return name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').split(/\s+/)[0].replace(/[^A-Za-z0-9_-]/g,'').slice(0,40)||'Member'}

    // A scene is not saved until the backend acknowledges it. On rejection,
    // restore the previous references and keep the editor open for correction.
    async function saveBackgroundChange(cast: any, change: () => void): Promise<void> {
      if (backgroundSaving) return
      backgroundSaving = true
      const previous = { backgrounds: structuredClone(cast.backgrounds), defaultBackground: cast.defaultBackground,generateBackgrounds:cast.generateBackgrounds }
      const controls = Array.from((dialog as HTMLDialogElement).querySelectorAll<HTMLButtonElement | HTMLInputElement>("button,input"))
      const disabled = controls.map(control => control.disabled)
      const note = dialog.querySelector("[data-cast-error]"); note?.remove()
      controls.forEach(control => control.disabled = true)
      dialog.setAttribute("aria-busy", "true")
      try {
        change()
        await persist()
        if (!disposed && currentCast()?.id === cast.id && dialog.open) openBackgrounds()
      } catch (error) {
        const attempted = JSON.stringify(snapshot())
        // A response can be lost after a committed write. Re-read instead of
        // displaying either a false failure or an optimistic phantom scene.
        const authoritative = await rpc("load_cast_library").then(data => cleanCastLibrary(data)).catch(() => null)
        if (authoritative && JSON.stringify(authoritative) === attempted) {
          authoritativeSignature = JSON.stringify(authoritative)
          savedSignature = attempted
          saveQueue = Promise.resolve()
          unsaved = false; status = "Saved to your Cast library."; syncStatus()
          if (!disposed && currentCast()?.id === cast.id && dialog.open) openBackgrounds()
          return
        }
        Object.assign(cast, previous)
        // A failed queue must not poison a subsequent no-op save.
        saveQueue = Promise.resolve()
        unsaved = JSON.stringify(snapshot()) !== savedSignature
        throw error
      } finally {
        backgroundSaving = false
        dialog.removeAttribute("aria-busy")
        controls.forEach((control, index) => { if (control.isConnected) control.disabled = disabled[index] })
      }
    }
    function readGenesisActivity(data:any):void {for(const job of Array.isArray(data)?data:[])if(job?.id&&Number(job.updatedAt||0)>=Number(genesisJobs.get(job.id)?.updatedAt||0))genesisJobs.set(job.id,job)}
    function genesisActivityCount(groupId:string):number {return [...genesisJobs.values()].filter(job=>job.groupId===groupId&&["queued","designing","rendering","processing","review"].includes(job.status)).length}
    function genesisJobMarkup(groupId:string):string {
      const jobs=[...genesisJobs.values()].filter(job=>job.groupId===groupId).sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0))
      if(!jobs.length)return `<div class="cast-genesis-empty">${I("spark")}<div><strong>Every ensemble starts somewhere.</strong><p>Your first automatic character will appear here.</p></div></div>`
      return jobs.map(job=>{
        const active=["queued","designing","rendering","processing"].includes(job.status),review=job.status==="review",retry=["error","stopped","interrupted"].includes(job.status)&&(!job.memberId||currentCast()?.members.some((item:any)=>item.id===job.memberId))
        const total=Math.max(1,Number(job.total)||1),done=Math.max(0,Math.min(total,Number(job.completed)||0))
        const member=currentCast()?.members.find((item:any)=>item.id===job.memberId)
        const stage=review?"Review design":retry?job.status==="interrupted"?"Interrupted · safe to resume":job.status==="stopped"?"Stopped":"Needs attention":job.status==="ready"?"Expressions ready":job.stage||"Queued"
        const actions=`${member?button("Open member","genesis-member","small","arrow",`data-id="${E(member.id)}"`):""}${review?button("Approve design","genesis-control","small primary","check",`data-id="${E(job.id)}" data-job-action="approve"`):""}${active||review?button("Stop","genesis-control","small","close",`data-id="${E(job.id)}" data-job-action="stop"`):""}${retry?button("Resume","genesis-control","small primary","reset",`data-id="${E(job.id)}" data-job-action="retry"`):""}`
        return `<article class="cast-genesis-job" data-job-status="${E(job.status)}"><div class="cast-genesis-job-head">${member?portrait(member):`<span class="cast-genesis-job-mark">${I("people")}</span>`}<div class="grow"><strong>${E(job.name||job.key)}</strong><small>${E(stage)}${job.slot?` · ${E(job.slot)}`:""}</small></div><span class="cast-genesis-job-count">${done}/${total}</span></div><progress max="${total}" value="${done}" aria-label="Completed expressions"></progress>${active&&job.totalSteps?`<small class="hint">Current pass · ${Math.max(0,Number(job.step)||0)}/${Math.max(0,Number(job.totalSteps)||0)}</small>`:""}${review?`<div class="cast-genesis-review"><label class="field">Proposed appearance<textarea readonly rows="5">${E(job.prompt)}</textarea></label></div>`:""}${job.error?`<p class="hint" role="status">${E(job.error)}</p>`:""}${Array.isArray(job.warnings)&&job.warnings.length?`<p class="hint">${job.warnings.length} cleanup warning${job.warnings.length===1?"":"s"}. Intermediates may remain in Output Library.</p>`:""}${actions?`<div class="cast-genesis-job-actions">${actions}</div>`:""}</article>`
      }).join("")
    }
    function refreshGenesisActivity():void {
      const group=currentCast(),count=group?genesisActivityCount(group.id):0
      const indicator=app.querySelector("[data-genesis-count]") as HTMLElement|null
      if(indicator){indicator.hidden=!count;indicator.textContent=String(count)}
      if(modalKind==="genesis"){const activity=dialog.querySelector("[data-genesis-jobs]");if(activity)activity.innerHTML=genesisJobMarkup(group?.id||"")}
      if(currentMember()&&memberGenesisJob(currentMember()))refreshMemberExpressions()
    }
    const genesisTemperamentExample = "Choose one coherent outfit per character; describe garments, colors and accessories precisely. Include brief character-specific expressive temperament and body language (e.g. mild expressions, calm body language for a reserved character; bubbly expressions, expressive posing for an energetic character). Do not copy the current scene’s emotion, facial expression, gesture or pose into the reusable identity. The expression bank supplies those separately."
    let recipeDraft: CastRenderRecipe | undefined
    let recipeEnabled=true
    const recipeRatios = [["1:1",1],["3:4",3/4],["2:3",2/3],["9:16",9/16],["4:3",4/3],["16:9",16/9]] as const
    let recipeLinked=true, recipeRatio=0, recipeWorkflowEpoch=0
    function recipeSize(form:HTMLFormElement,axis:"width"|"height"):number {
      const input=form.elements.namedItem(axis) as HTMLInputElement
      return input.value&&input.validity.valid?input.valueAsNumber:Number(input.placeholder)||EXPRESSION_DEFAULT_RECIPE[axis]
    }
    function syncRecipeSize(form:HTMLFormElement):void {
      const w=recipeSize(form,"width"),h=recipeSize(form,"height")
      const inherited=["width","height"].every(axis=>!(form.elements.namedItem(axis) as HTMLInputElement).value)
      form.querySelector("[data-recipe-size]")!.textContent=`${w} × ${h}${inherited?" · inherited":""}`
      for(const axis of ["width","height"] as const){
        const slider=form.querySelector<HTMLInputElement>(`[data-recipe-axis="${axis}"]`)!
        slider.value=String(Math.round(recipeSize(form,axis)/64)*64)
        slider.setAttribute("aria-valuetext",`${recipeSize(form,axis)} pixels`)
      }
      form.querySelectorAll<HTMLButtonElement>("[data-cast-action=recipe-ratio]").forEach(b=>b.setAttribute("aria-pressed",String(Math.abs(w/h-Number(b.dataset.ratio))<.018)))
      const link=form.querySelector<HTMLButtonElement>("[data-cast-action=recipe-link]")!
      link.setAttribute("aria-pressed",String(recipeLinked));link.textContent=recipeLinked?"Linked":"Unlinked"
    }
    function setRecipeSize(form:HTMLFormElement,axis:"width"|"height",value:number):void {
      if(!Number.isFinite(value))return
      const other=axis==="width"?"height":"width",input=form.elements.namedItem(axis) as HTMLInputElement,otherInput=form.elements.namedItem(other) as HTMLInputElement
      const ratio=recipeRatio||recipeSize(form,"width")/recipeSize(form,"height")
      let changed=clamp(Math.round(value),64,4096)
      if(recipeLinked){
        const factor=axis==="width"?1/ratio:ratio
        changed=clamp(changed,Math.ceil(Math.max(64,64/factor)),Math.floor(Math.min(4096,4096/factor)))
        otherInput.value=String(clamp(Math.round(changed*factor/8)*8,64,4096))
      }
      input.value=String(changed)
      if(!recipeLinked)recipeRatio=recipeSize(form,"width")/recipeSize(form,"height")
      syncRecipeSize(form)
    }
    async function loadRecipeWorkflowInputs(form:HTMLFormElement, preserve:string):Promise<void>{
      const epoch=++recipeWorkflowEpoch, workflow=(form.elements.namedItem("workflow") as HTMLSelectElement).value
      const select=form.elements.namedItem("imageParam") as HTMLSelectElement, status=form.querySelector<HTMLElement>("[data-recipe-workflow-status]")!
      const connectionId=recipeDraft?.connectionId||recipeContext?.().connectionId||""
      const save=(dialog as HTMLDialogElement).querySelector<HTMLButtonElement>('[form="ss-cast-recipe-form"]')!
      const stillCurrent=()=>epoch===recipeWorkflowEpoch&&modalKind==="recipe"&&dialog.open&&form.isConnected
      const fallback=(message:string)=>{select.replaceChildren(new Option(preserve?"Saved input · unverified":"Select a workflow input",preserve));status.textContent=message;select.disabled=false;save.disabled=false}
      if(!workflow){fallback("Choose a workflow first.");return}
      if(!connectionId){fallback("Choose an image connection in Studio to load workflow inputs.");return}
      select.replaceChildren(new Option(preserve?"Loading saved input…":"Loading image inputs…",preserve));select.disabled=true;save.disabled=true;status.textContent="Loading workflow inputs…"
      try{
        const detail=await rpc("load_upscale_workflow",{connectionId,name:workflow})
        if(!stillCurrent())return
        const choices=(Array.isArray(detail?.parameters)?detail.parameters:[]).filter((item:SwarmWorkflowParameter)=>item.id&&(item.type==="image"||item.viewType==="image")) as SwarmWorkflowParameter[]
        select.replaceChildren(new Option("Choose image input",""),...choices.map(item=>new Option(item.name||"Image input",item.id)))
        if(preserve&&!choices.some(item=>item.id===preserve))select.append(new Option("Saved input · not advertised",preserve))
        select.value=preserve|| (choices.length===1?choices[0].id:"")
        status.textContent=choices.length?"Only image-compatible inputs are listed.":"This workflow does not advertise an image input."
        select.disabled=false;save.disabled=false
      }catch(error){if(stillCurrent())fallback(`Could not load workflow inputs. ${preserve?"Saved input retained.":"Choose another workflow or retry."}`)}
    }
    function readRecipeForm():void {
      const form=dialog.querySelector("#ss-cast-recipe-form") as HTMLFormElement|null
      if(!form||!recipeDraft)return
      const f=new FormData(form), recipe:Record<string,unknown>={}
      // A temporarily disabled workflow selector still owns its saved input.
      const sourceInput=form.elements.namedItem("imageParam") as HTMLSelectElement
      if(sourceInput)f.set("imageParam",sourceInput.value)
      for(const [key] of GENERATION_NUMBER_LIMITS){const value=String(f.get(key)||"");if(value!=="")recipe[key]=Number(value)}
      for(const key of ["sampler","scheduler"])if(f.get(key))recipe[key]=String(f.get(key))
      recipeEnabled=f.has("enabled")
      recipeDraft=cleanCastRenderRecipe({...recipeDraft,checkpoint:f.get("checkpoint"),family:f.get("family"),generation:{recipe,prefix:f.get("prefix"),negative:f.get("negative")},appearance:f.get("appearance"),sidecarInstructions:f.get("sidecarInstructions"),enhance:f.has("enhance"),background:{mode:f.get("backgroundMode"),workflow:f.get("workflow"),imageParam:f.get("imageParam")},stack:recipeDraft.stack.map((item,index)=>({...item,enabled:f.has(`lora-enabled-${index}`),weight:Number(f.get(`lora-weight-${index}`)),useTrigger:f.has(`lora-trigger-${index}`)}))})
    }
    function openRecipe(initial=true):void {
      const cast=currentCast();if(!cast)return
      const context=recipeContext?.(),capture=context?.capture
      if(initial){recipeDraft=cleanCastRenderRecipe(cast.recipe)||cleanCastRenderRecipe(capture)||cleanCastRenderRecipe({generation:{recipe:{width:768,height:1024,steps:24},prefix:"solo, cowboy shot, facing viewer, plain background"}});recipeEnabled=true;recipeLinked=true;recipeRatio=0}
      const r=recipeDraft!;const matchesConnection=!r.connectionId||r.connectionId===context?.connectionId
      const selectOption=(value:string,label:string,selected:string)=>`<option value="${E(value)}" ${selected===value?"selected":""}>${E(label)}</option>`
      const numberFields=GENERATION_NUMBER_LIMITS.slice(2).map(([key,min,max])=>`<label class="field">${key==="cfg"?"CFG":human(key)}<input type="number" name="${key}" min="${min}" max="${max}" step="${key==="cfg"?"any":"1"}" value="${E(r.generation.recipe[key]??"")}" placeholder="Inherit"></label>`).join("")
      const friendly=(v:string)=>v.replace(/[_-]+/g," ")
      const choiceList=(current:string,values:string[],inherited:string,formatter:(v:string)=>string=friendly)=>selectOption("",inherited?`Inherit · ${formatter(inherited)}`:"Inherit",current)+[...new Set([...values,...(current?[current]:[])])].map(value=>selectOption(value,formatter(value),current)).join("")
      const inherited=matchesConnection?context?.inheritedRecipe:undefined
      const samplerChoices=choiceList(r.generation.recipe.sampler||"",matchesConnection?context?.samplers||[]:[],inherited?.sampler||"")
      const schedulerChoices=choiceList(r.generation.recipe.scheduler||"",matchesConnection?context?.schedulers||[]:[],inherited?.scheduler||"")
      const connectionName=context?.connections?.find(item=>item.id===r.connectionId)?.name
      const workflowChoices=[...new Set([...(matchesConnection?context?.workflows.map(item=>item.name)||[]:[]),...(r.background.workflow?[r.background.workflow]:[])])]
      const canvas=`<div class="cast-recipe-canvas"><div class="cast-recipe-canvas-head"><strong>Canvas dimensions</strong><output data-recipe-size></output></div><div class="cast-recipe-ratios" role="group" aria-label="Aspect ratio presets">${recipeRatios.map(([label,ratio])=>`<button type="button" class="button" data-cast-action="recipe-ratio" data-ratio="${ratio}" aria-label="${label} aspect ratio" aria-pressed="false"><span class="cast-recipe-ratio-shape" style="width:${Math.round(Math.min(20,20*ratio))}px;height:${Math.round(Math.min(20,20/ratio))}px"></span>${label}</button>`).join("")}</div><div class="cast-recipe-canvas-axes">${(["width","height"] as const).map(axis=>`<div class="cast-recipe-axis"><label class="field">${human(axis)} · px<input type="number" name="${axis}" min="64" max="4096" step="1" value="${E(r.generation.recipe[axis]??"")}" placeholder="${E(inherited?.[axis]??EXPRESSION_DEFAULT_RECIPE[axis])}"></label><input type="range" min="64" max="4096" step="64" data-recipe-axis="${axis}" aria-label="${axis} slider"></div>`).join("")}</div><div class="cast-recipe-canvas-actions"><button type="button" class="button small" data-cast-action="recipe-link" aria-label="Toggle aspect ratio lock" aria-pressed="true">Linked</button>${button("Use inherited size","recipe-size-reset","small","reset")}</div><p class="hint">Sliders move in 64 px steps. Unlink to adjust freely; exact pixels are editable above.</p></div>`
      const canonical=(name:string)=>name.replace(/\\/g,"/").replace(/\.safetensors$/i,"").toLowerCase()
      const checkpoint=context?.checkpoints.find(item=>canonical(item.name)===canonical(r.checkpoint))
      const missing=matchesConnection&&context?.loras.length?r.stack.filter(item=>item.enabled&&!context.loras.some(lora=>canonical(lora.name)===canonical(item.name))):[]
      const incompatible=matchesConnection&&checkpoint?.compatClass? r.stack.filter(item=>item.enabled&&context?.loras.some(lora=>canonical(lora.name)===canonical(item.name)&&lora.compatClass&&lora.compatClass.toLowerCase()!==checkpoint.compatClass.toLowerCase())):[]
      const field=(name:string,label:string,value:string,placeholder:string)=>`<label class="field">${label}<textarea name="${name}" rows="3" maxlength="4000" placeholder="${E(placeholder)}">${E(value)}</textarea></label>`
      showModal("recipe","Cast Recipe",cast.name+" · a shared visual language",`<form id="ss-cast-recipe-form" class="cast-recipe-form"><section class="cast-genesis-hero"><div class="cast-genesis-emblem">${I("layers")}</div><div class="grow"><h3>House style.</h3><p>One rendering recipe for Genesis and member expressions. Existing artwork stays untouched.</p></div><label class="ss-settings-toggle cast-genesis-toggle" aria-label="Use Cast Recipe"><input type="checkbox" name="enabled" ${recipeEnabled?"checked":""}><span class="ss-switch-track"></span></label></section><div class="cast-recipe-capture">${button("Capture current Studio settings","recipe-capture","","copy",capture?"":"disabled")}<p class="hint">Copies checkpoint, sampling, explicit LoRAs and the selected named style. Never copies the current illustration prompt or character bindings. Edit framing below.</p></div><div class="cast-recipe-grid"><section class="form-stack"><div class="eyebrow">01 / Rendering</div><label class="field">Checkpoint<input name="checkpoint" value="${E(r.checkpoint)}" maxlength="500" placeholder="Studio default" list="ss-cast-recipe-models"></label><datalist id="ss-cast-recipe-models">${(context?.checkpoints||[]).map(item=>`<option value="${E(item.name)}"></option>`).join("")}</datalist><label class="field">Sidecar prompt family<select name="family">${PROMPT_FAMILIES.map(item=>selectOption(item.id,item.label,r.family)).join("")}</select></label><p class="hint">${r.connectionId?`Saved image connection: ${E(connectionName|| (matchesConnection?"Current Studio connection":"Unavailable connection"))}.`:"Inherits the current Studio connection."} ${matchesConnection?"":"Switch to this recipe's connection to inspect its installed models."}</p>${matchesConnection&&r.checkpoint&&context?.checkpoints.length&&!checkpoint?`<p class="hint" role="status">Checkpoint not found in the current model list.</p>`:""}<div class="cast-recipe-numbers">${numberFields}</div>${canvas}<label class="field">Sampler<select name="sampler">${samplerChoices}</select></label><label class="field">Scheduler<select name="scheduler">${schedulerChoices}</select></label></section><section class="form-stack"><div class="eyebrow">02 / LoRA stack</div><label class="field">Copy saved Studio stack<select name="stackChoice"><option value="">Keep snapshot · ${r.stack.length} LoRAs</option>${(context?.stacks||[]).map(item=>selectOption(item.id,item.name,"")).join("")}<option value="__clear__">No album LoRAs</option></select></label><div class="cast-recipe-stack">${r.stack.map((item,i)=>`<div class="cast-recipe-lora"><label><input type="checkbox" name="lora-enabled-${i}" ${item.enabled?"checked":""}><span>${E(item.title||item.name)}</span></label><label class="field">Weight<input type="number" name="lora-weight-${i}" min="-10" max="10" step="0.05" value="${E(item.weight)}"></label>${item.trigger?`<label class="cast-recipe-trigger"><input type="checkbox" name="lora-trigger-${i}" ${item.useTrigger?"checked":""}>Use trigger · ${E(item.trigger)}</label>`:""}</div>`).join("")||`<p class="hint">No LoRAs in this recipe yet. Capture the current stack or choose a saved one.</p>`}</div>${missing.length?`<p class="hint" role="status">Not found: ${E(missing.map(item=>item.name).join(", "))}</p>`:""}${incompatible.length?`<p class="hint" role="status">Potential architecture mismatch: ${E(incompatible.map(item=>item.name).join(", "))}</p>`:""}<p class="hint">Stacks are copied, not linked. Later Studio stack edits cannot alter a running Genesis job.</p></section><section class="form-stack"><div class="eyebrow">03 / Art direction</div>${field("prefix","Shared positive / framing",r.generation.prefix,"solo, cowboy shot, facing viewer, plain background")}${field("negative","Shared negative",r.generation.negative,"Unwanted rendering traits")}${field("appearance","Album appearance guidance",r.appearance,"Adult post-canon characters, consistent casual clothing…")}</section><section class="form-stack"><div class="eyebrow">04 / Genesis sidecar</div>${field("sidecarInstructions","Extra model instructions",r.sidecarInstructions,"Choose a single outfit; prefer canonical tags; keep the identity concise…")}<p class="hint">Example: mild expressions, calm body language (reserved); bubbly expressions, expressive posing (energetic). Give each character their own temperament, not a fixed smile or pose.</p>${button("Add example instructions","recipe-sidecar-example","small","copy")}<p class="hint">Only the character-design sidecar receives these instructions. The RP protocol and final diffusion prompt are not modified by this field. Existing saved identities are reused.</p><div class="eyebrow">05 / Processing</div><label><input type="checkbox" name="enhance" ${r.enhance?"checked":""}> Enhance Genesis expressions when configured</label><label class="field">Background removal<select name="backgroundMode">${selectOption("builtin","Built-in · BiRefNet",r.background.mode)}${selectOption("saved","Saved SwarmUI workflow",r.background.mode)}</select></label><div data-recipe-bg ${r.background.mode==="saved"?"":"hidden"}><label class="field">Workflow<select name="workflow">${selectOption("","Choose workflow",r.background.workflow)}${workflowChoices.map(name=>selectOption(name,name,r.background.workflow)).join("")}</select></label><label class="field">Source image input<select name="imageParam">${selectOption(r.background.imageParam,r.background.imageParam?"Saved input":"Choose image input",r.background.imageParam)}</select></label><p class="hint" data-recipe-workflow-status role="status"></p>${button("Reload inputs","recipe-workflow-reload","small","reset")}</div><p class="hint">Genesis uses its album consistency setting. Manual Expression Studio retains reference and per-run controls.</p></section></div></form>`,`${button("Cancel","close-dialog","ghost")}<button type="submit" form="ss-cast-recipe-form" class="button primary">Save recipe</button>`,true)
      const form=(dialog as HTMLDialogElement).querySelector<HTMLFormElement>("#ss-cast-recipe-form")!
      mountExpressionPrefixPresets(form.elements.namedItem("prefix") as HTMLTextAreaElement,matchesConnection?context?.presets||[]:[],()=>{});
      recipeRatio=recipeSize(form,"width")/recipeSize(form,"height");syncRecipeSize(form)
      if(r.background.mode==="saved")void loadRecipeWorkflowInputs(form,r.background.imageParam)
    }
    function openGenesis():void {
      const cast=currentCast();if(!cast)return
      const prefs=cleanCastGenesisSettings(cast.genesis),option=(value:string,label:string,selected:string)=>`<option value="${value}" ${selected===value?"selected":""}>${label}</option>`
      const mode=(value:string,label:string,count:number,desc:string)=>`<label class="cast-genesis-choice"><input type="radio" name="pipeline" value="${value}" ${prefs.pipeline===value?"checked":""}><span>${I(value==="basics"?"smile":"spark")}<strong>${label}</strong></span><b>${count}</b><small>${desc}</small></label>`
      showModal("genesis","Cast Genesis",cast.name+" · let the story grow its own ensemble",`<form id="ss-cast-genesis-form" class="cast-genesis-form"><div class="cast-genesis-hero"><div class="cast-genesis-emblem">${I("spark")}</div><div class="grow"><h3>Meet someone new.</h3><p>Design a character with your configured parser, then let the expression pipeline bring them to life.</p></div><label class="ss-settings-toggle cast-genesis-toggle" aria-label="Automatic Cast creation"><input name="enabled" type="checkbox" ${prefs.enabled?"checked":""}><span class="ss-switch-track"></span></label></div><div class="cast-genesis-settings"><section><div class="eyebrow">01 / Expression production</div><div class="cast-genesis-choices">${mode("basics","Basics",EXPRESSION_BASICS.length,"Essential expressions")}${mode("full","Full spread",EXPRESSION_SPREAD.length,"Complete built-in set")}</div></section><section class="form-stack"><div class="eyebrow">02 / Character design</div><label class="field">Approval<select name="approval">${option("auto","Automatic",prefs.approval)}${option("review","Review design first",prefs.approval)}</select></label><label class="field">Expression consistency<select name="reference">${option("prompt","Prompt only",prefs.reference)}${option("anima-neutral","Anima Ref · anchor to Neutral",prefs.reference)}</select></label><p class="hint">Neutral always renders from the saved identity alone. With Anima Ref, later expressions reference its registered final image. Requires the installed Anima Ref Adapter; non-Anima compilers use prompt only. Custom graphs may leave Swarm-side files even in Do not save mode.</p><p class="hint">Uses the parser connection and model configured in Protocol Prompt.</p></section><section class="form-stack"><div class="eyebrow">03 / Asset retention</div><label class="field">Save mode<select name="retention">${option("final","Do not save · final Lumi expressions",prefs.retention)}${option("normal","Normal Swarm retention",prefs.retention)}</select></label><p class="hint">Both modes keep registered final expressions. Native no-save skips Swarm drafts; custom processing workflows may still write Swarm originals.</p><label class="field">Maximum new members per reply<select name="limit">${[1,2,3].map(n=>option(String(n),`${n} member${n===1?"":"s"}`,String(prefs.limit))).join("")}</select></label></section><section class="cast-genesis-note"><div class="eyebrow">04 / Production recipe</div><p>${cast.recipe?'Uses the saved Cast Recipe, including its LoRA snapshot and sidecar instructions.':"Uses Studio's checkpoint and selected named render style, the saved expression set, configured enhancement and built-in BiRefNet background removal."} No additional RP model prompt is required.</p><code>&lt;swarm-cast=mina flag=create type=basics-pipeline&gt;…&lt;/swarm-cast&gt;</code><p class="hint">Genesis is opt-in for this album. Disabling it prevents further work; completed expressions stay in Cast.</p></section></div></form><section class="cast-genesis-activity"><div class="section-heading"><div><h3>Production desk</h3><p>Jobs continue while Studio is closed.</p></div>${button("Refresh","genesis-refresh","small","reset")}</div><div data-genesis-jobs>${genesisJobMarkup(cast.id)}</div></section>`,`${button("Done","close-dialog","ghost")}<button type="submit" form="ss-cast-genesis-form" class="button primary">Save Genesis settings</button>`,true)
    }

    function atmosphereFormSettings(form:HTMLFormElement):CastAtmosphereSettings {
      const data=new FormData(form)
      return cleanCastAtmosphereSettings({enabled:data.has("enabled"),intensity:Number(data.get("intensity")),actor:Number(data.get("actor")),transitions:data.has("transitions"),animations:data.has("animations"),colorA:data.get("colorA"),colorB:data.get("colorB")})
    }
    function syncAtmospherePreview(form:HTMLFormElement):void {
      const cast=currentCast();if(!cast)return
      const settings=atmosphereFormSettings(form),data=new FormData(form),key=castAtmosphereKey(data.get("palette"))||"none",background=cleanCastBackgrounds(cast.backgrounds).find(bg=>bg.key===data.get("scene"))
      const preview=form.querySelector<HTMLElement>("[data-atmosphere-preview]")!
      const member=snapshot().members.find(m=>m.id===currentMember()?.id&&Object.keys(m.images).length)||snapshot().members.find(m=>m.groupId===cast.id&&Object.keys(m.images).length)
      const image=member&&(member.images[member.defaultExpression]||Object.values(member.images)[0])
      const signature=JSON.stringify([background?.id,member?.id,image?.id])
      if(preview.dataset.previewSignature!==signature){
        preview.dataset.previewSignature=signature
        preview.innerHTML=castPresentationTemplate("vn-hero",{key:"atmosphere-preview",src:image?`/api/v1/images/${encodeURIComponent(image.id)}`:"",name:member?.name||"Scene",label:"preview",background,dialogue:"The light changes, but the scene stays the same.",color:"",crop:{enabled:false,x:50,y:50,zoom:1}},E)
        if(!image)preview.querySelector("img")?.remove()
      }
      const card=preview.querySelector<HTMLElement>("[data-swarm-cast]")!
      const visual=castAtmosphereVisual(key,{...settings,enabled:true})
      for(const property of ["--cast-atmosphere-wash","--cast-atmosphere-scene","--cast-atmosphere-actor"])card.style.removeProperty(property)
      if(visual){
        // Apply only the validated CSS variables to the existing preview node.
        const style=document.createElement("span").style;style.cssText=visual.css
        for(const property of ["--cast-atmosphere-wash","--cast-atmosphere-scene","--cast-atmosphere-actor"])card.style.setProperty(property,style.getPropertyValue(property))
        card.dataset.castAtmosphere=visual.key;card.dataset.castAtmosphereTransition=String(visual.transitions);card.dataset.castAtmosphereAnimation=String(visual.animations)
      }else{delete card.dataset.castAtmosphere;delete card.dataset.castAtmosphereTransition;delete card.dataset.castAtmosphereAnimation}
      form.querySelector<HTMLElement>("[data-atmosphere-custom]")!.hidden=key!=="custom"
      form.querySelector<HTMLElement>("[data-atmosphere-intensity]")!.textContent=settings.intensity+"%"
      form.querySelector<HTMLElement>("[data-atmosphere-actor]")!.textContent=settings.actor+"%"
      form.querySelector<HTMLElement>("[data-atmosphere-packet]")!.textContent=`atmosphere=${key}`
      const custom=form.querySelector<HTMLElement>("[data-atmosphere-swatch=custom]")!;custom.style.background=`linear-gradient(145deg,${settings.colorA},${settings.colorB})`
    }
    function openAtmospheres():void {
      const cast=currentCast();if(!cast)return
      const settings=cleanCastAtmosphereSettings(cast.atmosphere),backgrounds=cleanCastBackgrounds(cast.backgrounds),chosen=backgrounds.find(bg=>bg.key===cast.defaultBackground)?.key||backgrounds[0]?.key||""
      const choices=CAST_ATMOSPHERES.map(p=>`<label class="cast-atmosphere-choice"><input type="radio" name="palette" value="${p.key}" ${p.key==="golden-hour"?"checked":""}><span data-atmosphere-swatch="${p.key}" style="background:linear-gradient(145deg,${p.key==="custom"?settings.colorA:p.a},${p.key==="custom"?settings.colorB:p.b})"></span><strong>${E(p.name)}</strong></label>`).join("")
      showModal("atmosphere","Atmospheres",cast.name+" · reusable scene lighting",`<form id="ss-cast-atmosphere-form" class="cast-atmosphere-form"><section class="cast-atmosphere-stage"><label class="field">Preview location<select name="scene"><option value="">Neutral stage</option>${backgrounds.map(bg=>`<option value="${E(bg.key)}" ${chosen===bg.key?"selected":""}>${E(bg.name)}</option>`).join("")}</select></label><div data-atmosphere-preview class="cast-atmosphere-preview"></div><p class="hint">Preview only · <code data-atmosphere-packet></code> · no image generation.</p></section><section class="cast-atmosphere-controls"><label class="cast-atmosphere-toggle"><span><strong>Enable atmospheres</strong><small>Allow optional lighting keys in Cast dialogue.</small></span><input type="checkbox" name="enabled" ${settings.enabled?"checked":""}></label><div class="cast-atmosphere-palettes" role="group" aria-label="Atmosphere palette">${choices}</div><div data-atmosphere-custom class="cast-atmosphere-colors" hidden><label class="field">Light color<input type="color" name="colorA" value="${settings.colorA}"></label><label class="field">Shadow color<input type="color" name="colorB" value="${settings.colorB}"></label></div><label class="field"><span class="cast-atmosphere-range-label">Scene lighting <output data-atmosphere-intensity></output></span><input type="range" min="0" max="100" name="intensity" value="${settings.intensity}"><small class="hint">Color wash, brightness, contrast and saturation.</small></label><label class="field"><span class="cast-atmosphere-range-label">Expression lighting <output data-atmosphere-actor></output></span><input type="range" min="0" max="100" name="actor" value="${settings.actor}"></label><div class="cast-atmosphere-motion"><label class="cast-atmosphere-toggle"><span><strong>Transitions</strong><small>Brief changes to actor lighting.</small></span><input type="checkbox" name="transitions" ${settings.transitions?"checked":""}></label><label class="cast-atmosphere-toggle"><span><strong>Animations</strong><small>Short actor reveal, never a loop.</small></span><input type="checkbox" name="animations" ${settings.animations?"checked":""}></label><p class="hint">Off by default. System reduced-motion preferences always win.</p></div><p class="hint">Only packets with an explicit atmosphere key use these album-wide strengths. Existing dialogue colors and original image files stay untouched. Changes also update previously tagged cards.</p></section></form>`,`${button("Back","backgrounds","ghost")}<button class="button primary" type="submit" form="ss-cast-atmosphere-form">Save atmospheres</button>`,true)
      syncAtmospherePreview(dialog.querySelector("#ss-cast-atmosphere-form"))
    }

    function backgroundReviewActions(job:any,compact=false):string{
      const attrs=`data-key="${E(job.key)}" data-candidate="${E(job.candidateId)}"`
      return `<div class="cast-bg-review-actions">${button("Veto","background-veto","ghost","close",attrs)}${button(compact?"Accept":"Accept background","background-accept","primary","check",attrs+' aria-label="Accept background"')}</div>`
    }
    function backgroundStatus(job:any):string{return job.status==="error"?String(job.error||"Generation failed"):job.status==="queued"?"Queued":job.status==="review"?"Awaiting your approval":`Generating${job.totalSteps?` · ${job.step}/${job.totalSteps}`:"…"}`}
    function backgroundJobMarkup(groupId:string):string {return [...backgroundJobs.values()].filter(job=>job.groupId===groupId).map(job=>job.status==="review"?`<section class="cast-bg-review-card"><img src="/api/v1/images/${encodeURIComponent(job.imageId)}" alt="Candidate for ${E(job.name||job.key)}"><div><strong>${E(job.name||job.key)}</strong><p class="hint">Awaiting your approval · not in scene library</p>${backgroundReviewActions(job)}</div></section>`:`<p class="hint" role="status"><strong>${E(job.key)}</strong> · ${E(backgroundStatus(job))}</p>`).join("")}
    function refreshBackgroundGenerator():void{
      const form=dialog.querySelector("#ss-cast-background-generate") as HTMLFormElement|null,cast=currentCast();if(!form||!cast)return
      const job=backgroundJobs.get(backgroundJobKey(cast.id,backgroundDraftKey)),stage=form.querySelector<HTMLElement>("[data-bg-preview]")!,detail=form.querySelector<HTMLElement>("[data-bg-status]")!,actions=(dialog as HTMLDialogElement).querySelector<HTMLElement>("[data-bg-review]")!,submit=dialog.querySelector('[form="ss-cast-background-generate"]') as HTMLButtonElement|null
      const src=job?.status==="review"&&job.imageId?`/api/v1/images/${encodeURIComponent(job.imageId)}`:job?.status==="generating"&&/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(job.preview||"")?job.preview:""
      if(src){let image=stage.querySelector("img");if(!image){stage.replaceChildren();image=document.createElement("img");image.alt="Background candidate";stage.append(image)}if(image.getAttribute("src")!==src)image.src=src}else if(!stage.querySelector(".cast-bg-placeholder"))stage.innerHTML=`<div class="cast-bg-placeholder">${I("image")}<strong>Scene preview</strong><small>Render a candidate to see it here.</small></div>`
      detail.textContent=job?backgroundStatus(job):"Ready to render · only approved images enter the library."
      const review=job?.status==="review"
      if(review){if(actions.dataset.candidate!==job.candidateId){actions.dataset.candidate=job.candidateId;actions.innerHTML=backgroundReviewActions(job,true)}actions.hidden=false}else{actions.hidden=true;actions.dataset.candidate="";actions.replaceChildren()}
      const busy=Boolean(job&&["queued","generating","review"].includes(job.status))
      if(submit){submit.hidden=review;submit.disabled=busy||backgroundReviewBusy||submitting.has(form);submit.textContent=job?.status==="error"?"Retry render":"Render candidate"}
      for(const field of form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>("input,select,textarea"))field.disabled=busy
    }
    function openBackgroundGenerator():void{
      const cast=currentCast();if(!cast)return
      backgroundDraftKey=""
      const context=recipeContext?.(),choices=(name:string,values:string[])=>`<datalist id="ss-bg-${name}">${[...new Set(values.filter(Boolean))].map(value=>`<option value="${E(value)}"></option>`).join("")}</datalist>`
      const field=(name:string,label:string,values:string[])=>`<label class="field">${label}<input name="${name}" list="ss-bg-${name}" maxlength="500" placeholder="Inherit">${choices(name,values)}</label>`
      const number=(name:string,label:string,min:number,max:number,step:string="1")=>`<label class="field">${label}<input type="number" name="${name}" min="${min}" max="${max}" step="${step}" placeholder="Inherit"></label>`
      showModal("background-generate","Background workshop",cast.name+" · render, review, then save",`<form id="ss-cast-background-generate" class="cast-bg-workshop"><section class="cast-bg-main"><div class="eyebrow">01 / Scene preview</div><div class="cast-bg-stage" data-bg-preview></div><p class="hint" role="status" data-bg-status></p><div class="field-grid"><label class="field">Scene name<input name="name" maxlength="80" required placeholder="School library"></label><label class="field">Packet key<input name="key" maxlength="64" required placeholder="school-library" pattern="[A-Za-z0-9_-]+"></label></div><label class="field">Environment description<textarea name="prompt" maxlength="4000" rows="4" required placeholder="Tall wooden bookshelves, warm afternoon light, empty room…"></textarea></label><label class="field">Negative prompt <small>Optional · environment only</small><textarea name="negative" maxlength="4000" rows="2" placeholder="Avoid unwanted details"></textarea></label></section><aside class="cast-bg-settings"><div class="eyebrow">02 / Render settings</div><div class="cast-bg-inherit"><strong>Inherit Studio</strong><p class="hint" data-bg-inherited>Loading saved renderer…</p><button type="button" class="text-button" data-cast-action="background-reset-settings">Reset overrides</button></div>${field("checkpoint","Checkpoint",context?.checkpoints.map(model=>model.name)||[])}<div class="field-grid">${number("steps","Steps",1,150)}${number("cfg","CFG",0,30,"any")}${field("sampler","Sampler",context?.samplers||[])}${field("scheduler","Scheduler",context?.schedulers||[])}</div><label class="field">Aspect ratio<select name="aspect">${["16:9","3:2","4:3","1:1","2:3","9:16"].map(a=>`<option value="${a}">${a}${a==="16:9"?" · default":""}</option>`).join("")}</select></label><div class="field-grid">${number("width","Width · px",64,4096)}${number("height","Height · px",64,4096)}</div><p class="hint">Set both dimensions for an exact canvas, or leave blank to preserve inherited area at the selected aspect.</p><label class="field">Seed<input type="number" name="seed" min="-1" max="9007199254740991" step="1" placeholder="Random (-1)"></label><label class="field">LoRA stack<select name="stackId"><option value="">None · environment only</option>${(context?.stacks||[]).map(stack=>`<option value="${E(stack.id)}">${E(stack.name)}</option>`).join("")}</select></label><p class="hint">No character, persona, inherited LoRA or reference conditioning. Explicit stack selection only.</p></aside></form>`,`${button("Back","backgrounds","ghost")}<div data-bg-review hidden></div><button class="button primary" type="submit" form="ss-cast-background-generate">Render candidate</button>`,true)
      refreshBackgroundGenerator()
      const form=dialog.querySelector("#ss-cast-background-generate") as HTMLFormElement
      void rpc("load_cast_background_settings").then(data=>{if(!form.isConnected)return;const r=data.recipe||{};form.querySelector<HTMLElement>("[data-bg-inherited]")!.textContent=[data.model,data.connectionName,[r.width,r.height].every(Boolean)?`${r.width} × ${r.height}`:"",r.steps?`${r.steps} steps`:"",r.cfg!==undefined?`CFG ${r.cfg}`:""].filter(Boolean).join(" · ")||"Provider defaults";for(const key of ["checkpoint","steps","cfg","sampler","scheduler","width","height"]){const input=form.elements.namedItem(key) as HTMLInputElement;const value=key==="checkpoint"?data.model:r[key];if(value!==undefined&&value!=="")input.placeholder=String(value)}}).catch(()=>{if(form.isConnected)form.querySelector<HTMLElement>("[data-bg-inherited]")!.textContent="Inherits the saved Studio renderer when submitted."})
    }
    function openBackgrounds(): void {
      const cast=currentCast(); if(!cast)return
      const backgrounds=cleanCastBackgrounds(cast.backgrounds)
      const iconAction=(label:string,action:string,icon:string,extra="")=>button("",action,"cast-background-icon",icon,`aria-label="${E(label)}" title="${E(label)}" ${extra}`)
      const sceneActions=(bg:StudioCastBackground)=>{
        const key=`data-key="${E(bg.key)}"`,active=cast.defaultBackground===bg.key
        return `<div class="cast-background-actions" role="group" aria-label="Actions for ${E(bg.name)}">${iconAction(active?"Default scene":"Set default","background-default","star",`${key} aria-pressed="${active}" ${active?"disabled":""}`)}${editArtwork?iconAction("Edit artwork","background-edit-art","imageEdit",key):""}${iconAction("Rename","background-rename","edit",key)}${iconAction("Replace image","background-replace","reset",key)}${iconAction("Remove background","background-remove","trash",key)}</div>`
      }
      showModal("backgrounds","Backgrounds",cast.name+" · shared across all members and expressions",`
        <section class="cast-background-heading">
          <div class="cast-background-title"><div><h3>Scene library</h3><p>${backgrounds.length} saved ${backgrounds.length===1?"location":"locations"}</p></div><div class="cast-background-toolbar">${button("Atmospheres","atmosphere","small","spark")}${backgrounds.length?iconAction("Export folder","background-export","folder"):""}${folders().some(folder=>folder.id==="cast-background-assets"&&folder.imageIds.length)?iconAction("Reuse asset","background-reuse","book"):""}${button("Add","background-add","small","plus",'aria-label="Add background" title="Add background"')}${button("Generate","background-generate","primary","spark")}</div></div>
          <div class="cast-background-options"><div class="cast-background-default"><div><small>Default scene</small><strong>${E(backgrounds.find(bg=>bg.key===cast.defaultBackground)?.name||"None selected")}</strong></div>${cast.defaultBackground?iconAction("Clear default","background-clear","close"):""}</div><div class="cast-background-default"><div><small>Inline generation</small><strong>${cast.generateBackgrounds?"Enabled":"Disabled"}</strong></div>${button(cast.generateBackgrounds?"Turn off":"Enable","background-auto","small","check",`aria-pressed="${cast.generateBackgrounds===true}"`)}</div></div>
        </section>
        <div data-background-jobs>${backgroundJobMarkup(cast.id)}</div>
        ${backgrounds.length?`<div class="cast-background-grid">${backgrounds.map(bg=>`<figure class="cast-background-tile${cast.defaultBackground===bg.key?" is-default":""}"><img src="/api/v1/images/${encodeURIComponent(bg.id)}" alt="${E(bg.name)}" loading="lazy"><figcaption><div class="cast-background-caption"><strong>${E(bg.name)}</strong>${cast.defaultBackground===bg.key?`<span class="cast-background-tag">${I("star")}Default</span>`:""}</div><code>${E(bg.key)}</code>${sceneActions(bg)}</figcaption></figure>`).join("")}</div>`:`<p class="hint">No backgrounds yet. Scene stages use their own neutral backdrop until you select one.</p>`}
        <p class="cast-background-help">Use a scene key in a Cast packet, e.g. <code>background=sidewalk</code>, or opt out with <code>background=none</code>.</p>`,button("Done","close-dialog","primary"),true)
    }
    function editBackground(bg: StudioCastBackground | undefined, imageId: string): void {
      showModal("background-edit",bg?"Rename background":"Name your background","A Cast-owned scene, shared across expressions.",`<form id="ss-cast-background-form" class="form-stack" data-id="${E(imageId)}" data-old="${E(bg?.key||"")}"><label class="field">Scene name<input name="name" maxlength="80" required value="${E(bg?.name||"")}"></label><label class="field">Packet key<input name="key" maxlength="64" required value="${E(bg?.key||"")}" placeholder="sidewalk" autocomplete="off"><small>Letters, numbers, hyphens and underscores. Old keys remain valid aliases for existing packets.</small></label></form>`,`${button("Back","backgrounds","ghost") }<button class="button primary" type="submit" form="ss-cast-background-form">Save background</button>`)
    }
    async function handleAction(trigger: HTMLElement): Promise<void> {
      const action = trigger.dataset.castAction, cast = currentCast(), member = currentMember()
      if (backgroundSaving) return
      if (loading || loadFailed) { if (action === "retry") await load(); return }
      const before = JSON.stringify(snapshot())
      if (action === "home") { state.castId = null; state.menu = false; render(); root.scrollTo({top:0}) }
      else if(action==="registry-open"){openRegistry();return}
      else if(action==="registry-back"){openRegistry(registryDestination,false);return}
      else if(action==="registry-copy"){openRegistryCopy(trigger.dataset.id||"");return}
      else if(["registry-link","registry-fork","registry-existing","registry-batch"].includes(action||"")){
        const sourceIds=action==="registry-batch"?[...registrySelection]:[trigger.dataset.id||""]
        if(!registryDestination||!sourceIds.length)throw new Error("Select a cast and characters first.")
        await registryAction("cast_registry_attach",{sourceIds,groupId:registryDestination,mode:action==="registry-fork"?"fork":"link",targetId:trigger.dataset.target||""},action==="registry-fork"?"Independent character created.":"Character linked. Shared wardrobes and expressions are available.");return
      }
      else if(action==="registry-prefer-wardrobe"){
        const key=selectedWardrobe(member).key;if(member.preferredWardrobe===key)delete member.preferredWardrobe;else member.preferredWardrobe=key;await persist();render();return
      }
      else if (action === "new-cast") { if(state.casts.length>=40)throw new Error("Your library has reached its 40-cast limit."); openCreateCast() }
      else if (action === "open-cast") openCast(trigger.dataset.id)
      else if (action === "filter") { state.filter=trigger.dataset.filter; root.querySelectorAll<HTMLElement>('[data-cast-action="filter"]').forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.filter===state.filter)));renderLibraryResults() }
      else if (action === "clear-search") { state.query="";state.filter="all";render();byId("cast-search").focus() }
      else if (action === "member") { state.memberId=trigger.dataset.id;state.tab="expressions";const m=currentMember();if(m)selectWardrobe(m,selectedWardrobe(m).key);render() }
      else if(action==="wardrobe-select"){selectWardrobe(member,trigger.dataset.wardrobe||"default");render();return}
      else if(action==="wardrobe-new"||action==="wardrobe-edit"){openWardrobeForm(action==="wardrobe-new");return}
      else if(action==="wardrobe-move"){openWardrobeMove();return}
      else if(action==="wardrobe-move-all"||action==="wardrobe-move-none"){dialog.querySelectorAll('input[name="slot"]').forEach((input:HTMLInputElement)=>input.checked=action==="wardrobe-move-all");syncWardrobeMoveCount();return}
      else if(action==="wardrobe-reference"||action==="wardrobe-clear-ref"||action==="wardrobe-neutral"){
        const form=dialog.querySelector("#ss-cast-wardrobe-form") as HTMLFormElement|null;if(!form)return
        if(action==="wardrobe-reference")pickImage((form.elements.namedItem("reference") as HTMLInputElement).value,image=>{if(form.isConnected)setWardrobeReference(form,image.id)})
        else setWardrobeReference(form,action==="wardrobe-neutral"?trigger.dataset.id||"":"");return
      }
      else if(action==="wardrobe-manage"){openWardrobeLifecycle(trigger.dataset.outfitKey||"");return}
      else if(["wardrobe-archive","wardrobe-restore","wardrobe-remove-confirm","wardrobe-hide","wardrobe-unhide"].includes(action||"")){
        const panel=(dialog as HTMLDialogElement).querySelector<HTMLElement>(".cast-wardrobe-lifecycle");if(!panel||!member||member.id!==panel.dataset.member||registryBusy)return
        const operation=action==="wardrobe-archive"?"archive":action==="wardrobe-restore"?"restore":action==="wardrobe-hide"?"hide":action==="wardrobe-unhide"?"unhide":"remove"
        if(operation==="remove"&&!panel.querySelector<HTMLInputElement>('[name="confirm"]')?.checked)return
        assertWardrobeMutable(member)
        const confirmedSnapshot=wardrobeLifecycleSnapshot;if(JSON.stringify(snapshot())!==confirmedSnapshot)throw new Error("Cast changed while you were editing. Reopen outfit management to review the new state.")
        const key=panel.dataset.wardrobe||"",replacement=panel.querySelector<HTMLSelectElement>('[name="replacement"]')?.value||"default"
        const controls=Array.from((dialog as HTMLDialogElement).querySelectorAll<HTMLButtonElement|HTMLInputElement|HTMLSelectElement>("button,input,select")).filter(c=>!c.disabled);controls.forEach(c=>c.disabled=true);registryBusy=true
        try{await persist();if(JSON.stringify(snapshot())!==confirmedSnapshot)throw new Error("Cast changed while you were editing. Reopen outfit management to review the new state.");const saved=await rpc("cast_wardrobe_lifecycle",{memberId:member.id,key,action:operation,replacement,baseSignature:authoritativeSignature});if(disposed)return;adoptSavedLibrary(saved);unsaved=false;const latest=currentMember();if(latest)selectWardrobe(latest,operation==="restore"||operation==="unhide"?key:replacement);closeModal();render();toast(operation==="hide"?"Outfit hidden in this cast only.":operation==="unhide"?"Outfit shown in this cast only.":operation==="archive"?"Outfit archived globally. Historical artwork preserved.":operation==="restore"?"Outfit restored globally. Local visibility preserved.":"Outfit removed globally. Original image files retained.")}
        finally{registryBusy=false;controls.forEach(c=>{if(c.isConnected)c.disabled=false})}return
      }
      else if (action === "member-tab" || action === "show-presentation") { state.tab=action==="member-tab"?trigger.dataset.tab:"presentation";render();byId("tab-"+state.tab)?.focus({preventScroll:true}) }
      else if(action==="edit-expression-art"&&editArtwork){
        const key=trigger.dataset.expression||"",image=member?.images?.[key];if(!image?.id)return
        await persist();if(disposed)return;editArtwork({id:image.id,src:image.url,label:`${member.name} · ${human(key)}`},{memberId:member.id,expression:key});return
      }
      else if(action==="background-edit-art"&&editArtwork){
        const bg=cleanCastBackgrounds(cast?.backgrounds).find(item=>item.key===trigger.dataset.key);if(!bg)return
        await persist();if(disposed)return;closeModal();editArtwork({id:bg.id,src:`/api/v1/images/${encodeURIComponent(bg.id)}`,label:bg.name},{groupId:cast.id,backgroundKey:bg.key});return
      }
      else if(action==="recipe"){openRecipe();return}
      else if(action==="recipe-ratio"||action==="recipe-link"||action==="recipe-size-reset"||action==="recipe-workflow-reload"){
        const form=(dialog as HTMLDialogElement).querySelector<HTMLFormElement>("#ss-cast-recipe-form");if(!form)return
        if(action==="recipe-workflow-reload"){void loadRecipeWorkflowInputs(form,(form.elements.namedItem("imageParam") as HTMLSelectElement).value);return}
        if(action==="recipe-link"){recipeLinked=!recipeLinked;recipeRatio=recipeSize(form,"width")/recipeSize(form,"height")}
        else if(action==="recipe-size-reset"){for(const axis of ["width","height"])(form.elements.namedItem(axis) as HTMLInputElement).value="";recipeRatio=recipeSize(form,"width")/recipeSize(form,"height")}
        else{const ratio=Number(trigger.dataset.ratio);if(!Number.isFinite(ratio)||ratio<=0)return;const long=clamp(Math.round(Math.max(recipeSize(form,"width"),recipeSize(form,"height"))/64)*64,64,4096);recipeLinked=true;recipeRatio=ratio;setRecipeSize(form,ratio>=1?"width":"height",long)}
        syncRecipeSize(form);return
      }
      else if(action==="recipe-sidecar-example"){
        const field=(dialog as HTMLDialogElement).querySelector<HTMLTextAreaElement>('#ss-cast-recipe-form [name="sidecarInstructions"]');if(!field)return
        if(field.value.includes(genesisTemperamentExample)){toast("Example instructions already added.");return}
        const next=[field.value,genesisTemperamentExample].filter(Boolean).join("\n\n")
        if(next.length>field.maxLength){toast("Not enough space to add the example. Shorten your existing instructions first.");return}
        field.value=next;field.dispatchEvent(new Event("input",{bubbles:true}));toast("Example instructions added.");return
      }
      else if(action==="recipe-capture"){readRecipeForm();const capture=recipeContext?.().capture;if(!capture||!recipeDraft)return;recipeDraft={...capture,appearance:recipeDraft.appearance,sidecarInstructions:recipeDraft.sidecarInstructions,enhance:recipeDraft.enhance,background:recipeDraft.background};recipeEnabled=true;openRecipe(false);return}
      else if(action==="genesis"){openGenesis();const data=await rpc("list_cast_genesis_jobs");if(!disposed){readGenesisActivity(data);refreshGenesisActivity()}return}
      else if(action==="genesis-refresh"){readGenesisActivity(await rpc("list_cast_genesis_jobs"));refreshGenesisActivity();return}
      else if(action==="genesis-control"){(trigger as HTMLButtonElement).disabled=true;try{readGenesisActivity(await rpc("control_cast_genesis_job",{id:trigger.dataset.id,action:trigger.dataset.jobAction}));refreshGenesisActivity()}finally{if(trigger.isConnected)(trigger as HTMLButtonElement).disabled=false}return}
      else if(action==="genesis-member"){closeModal();state.memberId=trigger.dataset.id;state.tab="expressions";state.emotion=currentMember()?.defaultExpression||"neutral";render();return}
      else if (action === "atmosphere") openAtmospheres()
      else if (action === "backgrounds") openBackgrounds()
      else if(action==="background-auto"){await saveBackgroundChange(cast,()=>{cast.generateBackgrounds=!cast.generateBackgrounds});return}
      else if(action==="background-generate"){openBackgroundGenerator();return}
      else if(action==="background-reset-settings"){
        const form=dialog.querySelector("#ss-cast-background-generate") as HTMLFormElement|null;if(!form)return
        for(const name of ["checkpoint","steps","cfg","sampler","scheduler","width","height","seed","stackId"]){const field=form.elements.namedItem(name) as HTMLInputElement|HTMLSelectElement;if(!field.disabled)field.value=""}
        const aspect=form.elements.namedItem("aspect") as HTMLSelectElement;if(!aspect.disabled)aspect.value="16:9";return
      }
      else if(action==="background-accept"||action==="background-veto"){
        if(!cast||backgroundReviewBusy)return
        backgroundReviewBusy=true;const key=trigger.dataset.key||"",candidateId=trigger.dataset.candidate||"",accept=action==="background-accept"
        const buttons=Array.from((dialog as HTMLDialogElement).querySelectorAll<HTMLButtonElement>("[data-cast-action=background-accept],[data-cast-action=background-veto]"));buttons.forEach(b=>b.disabled=true)
        try{await persist();const result=await rpc("review_cast_background",{groupId:cast.id,key,candidateId,action:accept?"accept":"veto"});if(disposed)return;readBackgroundJobs(result.backgroundJobs);if(!unsaved){adoptSavedLibrary(result.library);render()}if(modalKind==="backgrounds")openBackgrounds();else if(modalKind==="background-generate"){if(accept)openBackgrounds();else refreshBackgroundGenerator()}toast(accept?"Background accepted.":"Candidate vetoed · original retained in Outputs.")}
        finally{backgroundReviewBusy=false;buttons.forEach(b=>{if(b.isConnected)b.disabled=false});if(modalKind==="background-generate")refreshBackgroundGenerator()}return
      }
      else if (action === "background-export") {await persist();const result=await rpc("export_cast_background_folder",{groupId:cast.id});toast(`${result.count} backgrounds added to the Output Library.`)}
      else if (action === "background-add" || action === "background-reuse") {
        if(!cast || cleanCastBackgrounds(cast.backgrounds).length>=100)throw new Error("This cast has reached its 100-background limit.")
        const groupId=cast.id;closeModal();pickImage("",image=>{if(!disposed&&currentCast()?.id===groupId)editBackground(undefined,image.id)},action==="background-reuse"?"cast-background-assets":undefined)
      }
      else if (action === "background-replace") {
        const groupId=cast.id,bg=cleanCastBackgrounds(cast.backgrounds).find(bg=>bg.key===trigger.dataset.key);if(!bg)return
        closeModal();pickImage(bg.id,image=>{if(!disposed&&currentCast()?.id===groupId)editBackground(bg,image.id)})
      }
      else if (action === "background-rename") {const bg=cleanCastBackgrounds(cast.backgrounds).find(bg=>bg.key===trigger.dataset.key);if(bg)editBackground(bg,bg.id)}
      else if (action === "background-default" || action === "background-clear") {await saveBackgroundChange(cast,()=>{cast.defaultBackground=action==="background-clear"?"":trigger.dataset.key});return}
      else if (action === "background-remove") {
        const key=trigger.dataset.key;const bg=cleanCastBackgrounds(cast.backgrounds).find(bg=>bg.key===key);if(!bg)return
        showModal("background-remove","Remove background?",bg.name,`<p class="hint">This removes the scene reference, not its original image. Existing packets will fall back to the cast default or neutral stage.</p>`,`${button("Keep","backgrounds","ghost")}${button("Remove","background-remove-confirm","danger","trash",`data-key="${E(bg.key)}"`)}`)
      }
      else if (action === "background-remove-confirm") {await saveBackgroundChange(cast,()=>{cast.backgrounds=cleanCastBackgrounds(cast.backgrounds).filter(bg=>bg.key!==trigger.dataset.key);if(cast.defaultBackground===trigger.dataset.key)cast.defaultBackground=""});return}
      else if (action === "open-presentation-modal") {previewBackground="";openPresentationModal()}
      else if (action === "presentation-mobile-tab") {
        if(modalKind!=="presentation")return
        const tab=trigger.dataset.mobileTab
        if(tab!=="looks"&&tab!=="adjust")return
        const gallery=(dialog as HTMLDialogElement).querySelector<HTMLElement>(".cast-picker-looks")
        if(presentationMobileView==="looks")presentationGalleryScroll=gallery?.scrollTop||0
        presentationMobileView=tab;dialog.dataset.castMobileView=tab
        ;(dialog.querySelectorAll('[data-cast-action="presentation-mobile-tab"]') as NodeListOf<HTMLElement>).forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mobileTab===tab)))
        if(tab==="looks"){if(gallery)gallery.scrollTop=presentationGalleryScroll;requestAnimationFrame(fitPresentationPreviews)}
      }
      else if (action === "presentation-search-toggle") {
        presentationSearchOpen=trigger.getAttribute("aria-expanded")!=="true"
        trigger.setAttribute("aria-expanded",String(presentationSearchOpen));const browse=trigger.closest<HTMLElement>(".cast-catalogue-browse");if(browse)browse.dataset.searchOpen=String(presentationSearchOpen)
        const input=byId("presentation-search");if(presentationSearchOpen)input?.focus();else{presentationQuery="";if(input)input.value="";filterPresentationSearch()}
      }
      else if (action === "presentation-crop-toggle") {
        presentationCropOpen=!presentationCropOpen;trigger.setAttribute("aria-expanded",String(presentationCropOpen))
        const panel=byId("catalogue-crop");if(panel)panel.dataset.expanded=String(presentationCropOpen)
      }
      else if (action === "presentation-filter") {const group=trigger.dataset.group||"all";selectPresentationCategory(group,`[data-cast-action="presentation-filter"][data-group="${group}"]`)}
      else if (action === "style") { member.style=trigger.dataset.style;if(modalKind==="presentation")updatePresentationSelection();render() }
      else if (action === "style-default") { cast.defaultStyle=member.style||cast.defaultStyle;member.style=null;render();toast(`${styleName(cast.defaultStyle)} is the cast default.`) }
      else if (action === "style-reset") { member.style=null;if(modalKind==="presentation")updatePresentationSelection();render() }
      else if (action === "new-member" || action === "edit-member") { if(action==="new-member"&&snapshot().members.length>=200)throw new Error("Your library has reached its 200-member limit.");openNewMember(action==="edit-member") }
      else if (action === "scratch-member") openNewMember()
      else if (action === "import-character") await chooseCharacter()
      else if (action === "search-characters" || action === "character-page") await chooseCharacter(byId("character-query").value, Number(trigger.dataset.offset) || 0)
      else if (action === "select-character") await selectCharacter(trigger.dataset.id!)
      else if (action === "apply-character") applyCharacter()
      else if (action === "close-dialog") {if(modalKind==="presentation"){await persist();if(modalKind!=="presentation")return;closeModal();render();root.querySelector<HTMLElement>('[data-cast-action="open-presentation-modal"]')?.focus({preventScroll:true})}else closeModal()}
      else if (action === "accent") { castDraft.tone=trigger.dataset.tone;dialog.querySelectorAll(".swatch").forEach((button:any)=>button.setAttribute("aria-pressed",String(button===trigger))) }
      else if (action === "member-role") { memberDraft.role=trigger.dataset.role;dialog.querySelectorAll(".role-choice").forEach((button:any)=>button.setAttribute("aria-pressed",String(button===trigger))) }
      else if (action === "draft-reference" || action === "pick-reference") await editReference(action==="draft-reference")
      
      else if (action === "presentation-side") {
        const side=trigger.dataset.side||"auto"
        if(!member || !["auto","left","right"].includes(side))throw new Error("Choose Auto, Left or Right for this Cast member.")
        member.presentationSide=side
        if(modalKind==="presentation"){
          refreshPresentationCatalogue(false,`.cast-gallery-stage [data-side="${side}"]`)
        }else render()
      }
      else if (action === "rename-expression") editExpression(String(trigger.dataset.expression||""))
      else if (action === "remove-expression") removeExpressionPrompt(String(trigger.dataset.expression||""))
      else if (action === "confirm-remove-expression") {
        if(modalKind!=="expression-delete")throw new Error("Open the expression removal dialog first.")
        removeExpressionKey(member,expressionEditKey)
        await persist();closeModal();render();toast("Expression removed from Cast. Original image preserved.")
      }
      else if (action === "expressions") await openExpressions()
      else if (action === "copy-tag") {
        try { await navigator.clipboard.writeText(packetFor(member));toast("Expression packet copied.") }
        catch { showModal("copy","A little feeling, ready to paste.","Replace the sample dialogue inside this bounded packet.",`<label class="field">Expression packet<input id="ss-cast-copy-value" readonly value="${E(packetFor(member))}"></label>`,button("Done","close-dialog","primary"));byId("copy-value").select() }
      }
      else if (action === "activate") {
        if(!chatId)throw new Error("Open a Lumiverse chat before activating a cast. The library remains available here.")
        state.activeCast=state.activeCast===cast.id?"":cast.id;library.chatGroups[chatId]=state.activeCast;render()
      }
      else if (action === "use-cast") openUseCast()
      else if (action === "use-tab") { useDraft.tab=trigger.dataset.tab;renderUseDialog();dialog.querySelector(`[data-cast-action="use-tab"][data-tab="${useDraft.tab}"]`).focus({preventScroll:true}) }
      else if (action === "use-confirm") await useCast()
      else if (action === "cast-menu") { state.menu=!state.menu;render();if(state.menu)find(".popover button").focus() }
      else if (action === "rename-cast") { state.menu=false;openCreateCast(true) }
      else if (action === "duplicate-cast") {
        if(state.casts.length>=40||snapshot().members.length+cast.members.length>200)throw new Error("There is not enough room in the Cast library to duplicate this cast.")
        const copy=structuredClone(cast);copy.id=createRequestId();copy.name=cast.name+" · copy";if(copy.genesis)copy.genesis={...copy.genesis,enabled:false};copy.members.forEach((member:any)=>{member.id=createRequestId();delete member.registryId});state.casts.push(copy);openCast(copy.id)
      }
      else if (action === "delete-cast") confirmDelete("cast")
      else if (action === "remove-member") confirmDelete("member")
      else if (action === "confirm-remove") {
        if(trigger.dataset.kind==="member"){
          // Remove just the selected member against current server state.
          await persist();(trigger as HTMLButtonElement).disabled=true
          try {const result=await rpc("remove_cast_member",{groupId:cast.id,memberId:member.id});if(disposed)return;adoptSavedLibrary(result.library);unsaved=false;state.tab="expressions";state.emotion=currentMember()?.defaultExpression||"neutral";status="Member removed from cast. Character kept in library.";closeModal();render()}
          finally{if(trigger.isConnected)(trigger as HTMLButtonElement).disabled=false}
          return
        }
        else{state.casts=state.casts.filter((item:any)=>item.id!==cast.id);for(const [id,groupId]of Object.entries(library.chatGroups))if(groupId===cast.id)library.chatGroups[id]="";if(library.activeGroupId===cast.id)library.activeGroupId="";if(state.activeCast===cast.id)state.activeCast="";state.castId=null}
        await persist();closeModal();render()
      }
      else if (action === "retry-save") await persist()
      else if(action==="reload-cast") {showModal("cast-reload","Reload saved Cast?","Reload the authoritative library to avoid overwriting a newly saved scene.",`<p class="hint">Any uncommitted changes in this workspace will be discarded. Your saved Cast and generated Background Assets are retained.</p>`,`${button("Keep editing","close-dialog","ghost")}${button("Reload saved Cast","reload-cast-confirm","primary","reset")}`);return}
      else if(action==="reload-cast-confirm"){closeModal();await saveQueue.catch(()=>{});saveQueue=Promise.resolve();await load();return}
      if (JSON.stringify(snapshot())!==before) await persist()
    }
    root.addEventListener("click", (event: MouseEvent) => {
      const trigger=(event.target as Element)?.closest<HTMLElement>("[data-cast-action]")
      if(!trigger||!root.contains(trigger)||(trigger as HTMLButtonElement).disabled)return
      void handleAction(trigger).catch(report)
    },{signal:lifetime.signal})
    root.addEventListener("error",(event: Event)=>{
      const image=event.target
      if(image instanceof HTMLImageElement && image.closest(".cast-character-avatar"))image.hidden=true
    },{capture:true,signal:lifetime.signal})
    root.addEventListener("input",(event: Event)=>{
      const input=event.target as HTMLInputElement
      if(typeof input.setCustomValidity==="function")input.setCustomValidity("")
      if(modalKind==="atmosphere"){const form=input.closest<HTMLFormElement>("#ss-cast-atmosphere-form");if(form){syncAtmospherePreview(form);return}}
      if(modalKind==="recipe"&&input.dataset.recipeAxis){const form=input.closest<HTMLFormElement>("form");if(form)setRecipeSize(form,input.dataset.recipeAxis as "width"|"height",input.valueAsNumber);return}
      if(input.dataset.castPickerCrop && modalKind==="presentation") {
        const property=input.dataset.castPickerCrop
        if(property!=="enabled"){
          const member=currentMember();member.crop[property]=Number(input.value)
          refreshPickerCrop()
        }
        return
      }
      if(input.id==="ss-cast-presentation-search"&&modalKind==="presentation"){presentationQuery=input.value;if(presentationQuery){presentationSearchOpen=true;const browse=input.closest<HTMLElement>(".cast-catalogue-browse");if(browse)browse.dataset.searchOpen="true";browse?.querySelector("[data-cast-action=presentation-search-toggle]")?.setAttribute("aria-expanded","true")}filterPresentationSearch();return}
      if(input.id==="ss-cast-registry-search"){registryQuery=input.value;filterRegistry();return}
      if(input.id==="ss-cast-cast-search"){state.query=input.value;renderLibraryResults()}
    },{signal:lifetime.signal})
    root.addEventListener("change",(event: Event)=>{
      const recipeInput=event.target as HTMLInputElement|HTMLSelectElement
      if(recipeInput.id==="ss-cast-registry-destination"){registryDestination=recipeInput.value;registrySelection.clear();refreshRegistryList();return}
      if(recipeInput.dataset.registryId){const input=recipeInput as HTMLInputElement;if(input.checked)registrySelection.add(input.dataset.registryId!);else registrySelection.delete(input.dataset.registryId!);filterRegistry();return}
      if(modalKind==="registry-copy"&&recipeInput.name==="outfit"){const form=recipeInput.closest<HTMLFormElement>("form")!,data=snapshot(),source=[...data.members,...(data.stash||[])].find(m=>m.id===form.dataset.source),row=source&&castWardrobes(source).find(row=>row.key===recipeInput.value);if(row)(form.elements.namedItem("name") as HTMLInputElement).value=row.name;return}
      if(modalKind==="atmosphere"){const form=recipeInput.closest<HTMLFormElement>("#ss-cast-atmosphere-form");if(form){syncAtmospherePreview(form);return}}
      if(modalKind==="wardrobe-lifecycle"&&recipeInput.name==="confirm"){const remove=(dialog as HTMLDialogElement).querySelector<HTMLButtonElement>('[data-cast-action="wardrobe-remove-confirm"]');if(remove)remove.disabled=!(recipeInput as HTMLInputElement).checked;return}
      if(modalKind==="wardrobe-move"&&recipeInput.name==="slot"){syncWardrobeMoveCount();return}
      if(modalKind==="recipe"&&recipeInput.closest("#ss-cast-recipe-form")){
        if(recipeInput.name==="stackChoice"){
          const id=recipeInput.value;readRecipeForm();const context=recipeContext?.(),preset=context?.stacks.find(item=>item.id===id)
          if(recipeDraft&&(preset||id==="__clear__")){const canonical=(s:string)=>s.replace(/\\/g,"/").replace(/\.safetensors$/i,"").toLowerCase();recipeDraft=cleanCastRenderRecipe({...recipeDraft,stack:(preset?.items||[]).map(item=>({...item,trigger:context?.loras.find(lora=>canonical(lora.name)===canonical(item.name))?.triggerPhrase||""}))});openRecipe(false)}
        }else if(recipeInput.name==="width"||recipeInput.name==="height"){
          const form=recipeInput.closest<HTMLFormElement>("form")!,input=recipeInput as HTMLInputElement
          if(input.value&&input.validity.valid)setRecipeSize(form,input.name as "width"|"height",input.valueAsNumber)
          else syncRecipeSize(form)
        }else if(recipeInput.name==="backgroundMode"){
          const bg=dialog.querySelector("[data-recipe-bg]") as HTMLElement|null,form=recipeInput.closest<HTMLFormElement>("form")!;if(bg)bg.hidden=recipeInput.value!=="saved"
          if(recipeInput.value==="saved")void loadRecipeWorkflowInputs(form,(form.elements.namedItem("imageParam") as HTMLSelectElement).value)
          else{recipeWorkflowEpoch++;(form.elements.namedItem("imageParam") as HTMLSelectElement).disabled=false;const save=(dialog as HTMLDialogElement).querySelector<HTMLButtonElement>('[form="ss-cast-recipe-form"]');if(save)save.disabled=false}
        }else if(recipeInput.name==="workflow")void loadRecipeWorkflowInputs(recipeInput.closest<HTMLFormElement>("form")!,"")
        return
      }
      const input=event.target as HTMLInputElement
      if(input.dataset.castPickerCrop && modalKind==="presentation") {
        const member=currentMember(),property=input.dataset.castPickerCrop
        if(property==="enabled")member.crop.enabled=input.checked
        else member.crop[property]=Number(input.value)
        refreshPickerCrop();void persist().catch(report)
        return
      }
      if(input.id==="ss-cast-preview-background" && modalKind==="presentation") {
        previewBackground=castKey(input.value)||"";refreshPresentationCatalogue(false,"#ss-cast-preview-background");return
      }
      if(input.id==="ss-cast-presentation-category"&&modalKind==="presentation"){selectPresentationCategory(input.value,"#ss-cast-presentation-category");return}
      if(input.id==="ss-cast-cast-sort"){state.sort=input.value;renderLibraryResults()}
      if(input.id==="ss-cast-preview-expression"){state.emotion=input.value;render()}
      if(input.id==="ss-cast-fallback-expression"){const member=currentMember();if(member.wardrobes){const rows=castWardrobes(member),row=rows.find(item=>item.key===selectedWardrobe(member).key)!;row.defaultExpression=input.value;member.wardrobes=rows;if(row.key==="default")member.defaultExpression=row.slots[input.value]}else member.defaultExpression=input.value;render();void persist().catch(report)}
      if(input.id==="ss-cast-offer-prompt")useDraft.prompt=input.checked
      if(input.id==="ss-cast-export-target")useDraft.target=input.value
      if(input.name==="export-format")useDraft.format=input.value
      if(input.id==="ss-cast-persona-member")useDraft.persona=input.value

    },{signal:lifetime.signal})
    const submitting = new WeakSet<HTMLFormElement>()
    root.addEventListener("submit",(event: Event)=>{
      const form=event.target as HTMLFormElement
      if(form.id==="ss-cast-registry-copy-form"){
        event.preventDefault();if(registryBusy)return;const values=new FormData(form);void registryAction("cast_registry_copy_outfit",{sourceId:form.dataset.source,sourceKey:String(values.get("outfit")||""),targetId:String(values.get("target")||""),name:String(values.get("name")||"")},"Outfit copied. Original artwork and packet keys preserved.").catch(report);return
      }
      if(form.id==="ss-cast-wardrobe-form"||form.id==="ss-cast-wardrobe-move"){
        event.preventDefault();if(submitting.has(form))return
        const member=currentMember();if(!member||member.id!==form.dataset.member)return
        submitting.add(form);const submit=dialog.querySelector(`[form="${form.id}"]`) as HTMLButtonElement|null;if(submit)submit.disabled=true
        void(async()=>{
          assertWardrobeMutable(member);const values=new FormData(form)
          if(form.id==="ss-cast-wardrobe-form"){
            const rows=castWardrobes(member),existing=rows.find(row=>row.key===form.dataset.wardrobe),name=String(values.get("name")||"").trim()
            if(form.dataset.wardrobe&&(!existing||!castWardrobeAvailable(member,existing)))throw new Error("This outfit is no longer available in this cast.")
            const key=existing?.key||castExpressionKey(String(values.get("key")||name)).toLowerCase()
            if(!name||!castKey(key)||key.length>40&&!existing||!existing&&(rows.length>=CAST_WARDROBE_LIMIT||rows.some(row=>row.key===key)))throw new Error("Choose a unique outfit name and packet key.")
            const row=existing||{key,name,outfitPrompt:"",referenceImageId:"",defaultExpression:"neutral",settings:cleanStudioExpressionSet(null),slots:{},aliases:{}}
            row.name=name;row.outfitPrompt=String(values.get("outfit")||"").slice(0,4000);if(row.settings.workshop)row.settings.workshop.overrides.outfit=row.outfitPrompt;row.referenceImageId=castKey(values.get("reference"));if(!existing)rows.push(row)
            member.wardrobes=rows;if(row.key==="default"){member.referenceImageId=row.referenceImageId;member.reference=row.referenceImageId?`/api/v1/images/${encodeURIComponent(row.referenceImageId)}`:member.reference}
            selectWardrobe(member,key)
          }else{
            const destination=String(values.get("destination")||""),strip=String(values.get("strip")||"").trim().toLowerCase(),moves=Object.create(null) as Record<string,string>
            for(const label of values.getAll("slot").map(String))moves[label]=strip&&label.startsWith(strip)?label.slice(strip.length):label
            member.wardrobes=castMoveWardrobeAssets(member,form.dataset.source||"",destination,moves);selectWardrobe(member,destination)
          }
          await persist();closeModal();render();toast("Wardrobe saved. Original image files preserved.")
        })().catch(report).finally(()=>{submitting.delete(form);if(submit?.isConnected)submit.disabled=false});return
      }
      if(form.id==="ss-cast-atmosphere-form"){
        event.preventDefault();if(submitting.has(form))return
        const cast=currentCast();if(!cast)return;const settings=atmosphereFormSettings(form)
        submitting.add(form);const submit=dialog.querySelector('[form="ss-cast-atmosphere-form"]') as HTMLButtonElement|null;if(submit)submit.disabled=true
        void(async()=>{await persist();const result=await rpc("set_cast_atmosphere",{groupId:cast.id,settings});if(disposed)return;adoptSavedLibrary(result.library);unsaved=false;render();if(modalKind==="atmosphere"&&currentCast()?.id===cast.id)openBackgrounds();toast("Atmospheres saved.")})().catch(report).finally(()=>{submitting.delete(form);if(submit?.isConnected)submit.disabled=false});return
      }
      if(form.id==="ss-cast-recipe-form"){
        event.preventDefault();if(submitting.has(form)||(form.elements.namedItem("imageParam") as HTMLSelectElement).disabled)return
        const cast=currentCast();if(!cast)return;readRecipeForm()
        if(recipeEnabled&&recipeDraft?.background.mode==="saved"&&(!recipeDraft.background.workflow||!recipeDraft.background.imageParam)){report(new Error("Specify the saved background workflow and its image input."));return}
        submitting.add(form);const submit=dialog.querySelector('[form="ss-cast-recipe-form"]') as HTMLButtonElement|null;if(submit)submit.disabled=true
        void(async()=>{await persist();const result=await rpc("set_cast_recipe",{groupId:cast.id,recipe:recipeEnabled?recipeDraft:null});if(disposed)return;adoptSavedLibrary(result.library);unsaved=false;render();if(modalKind==="recipe")closeModal();toast("Cast Recipe saved.")})().catch(report).finally(()=>{submitting.delete(form);if(submit?.isConnected)submit.disabled=false});return
      }
      if(form.id==="ss-cast-genesis-form"){
        event.preventDefault();if(submitting.has(form))return
        const cast=currentCast(),values=new FormData(form);if(!cast)return
        const settings=cleanCastGenesisSettings({enabled:values.has("enabled"),pipeline:values.get("pipeline"),retention:values.get("retention"),approval:values.get("approval"),reference:values.get("reference"),limit:Number(values.get("limit"))})
        submitting.add(form);const submit=dialog.querySelector('[form="ss-cast-genesis-form"]') as HTMLButtonElement|null;if(submit)submit.disabled=true
        void(async()=>{await persist();const result=await rpc("set_cast_genesis_settings",{groupId:cast.id,settings});if(disposed)return;adoptSavedLibrary(result.library);unsaved=false;render();if(modalKind==="genesis")openGenesis();toast("Genesis settings saved.")})().catch(report).finally(()=>{submitting.delete(form);if(submit?.isConnected)submit.disabled=false});return
      }
      if(form.id==="ss-cast-background-generate"){
        event.preventDefault();if(submitting.has(form))return
        const cast=currentCast(),values=new FormData(form),name=String(values.get("name")||"").trim(),key=castKey(String(values.get("key")||"").trim()).toLowerCase(),prompt=String(values.get("prompt")||"").trim()
        if(!cast||!name||!key||key==="none"||!prompt){report(new Error("Choose a valid name, key and environment description."));return}
        const recipe:Record<string,unknown>={};for(const field of ["steps","cfg","width","height"]){const value=values.get(field);if(value!==null&&value!=="")recipe[field]=Number(value)}for(const field of ["sampler","scheduler"]){const value=String(values.get(field)||"").trim();if(value)recipe[field]=value}
        if(Boolean(recipe.width)!==Boolean(recipe.height)){report(new Error("Set both canvas dimensions, or inherit both."));return}
        const settings={recipe,checkpoint:String(values.get("checkpoint")||"").trim(),aspect:String(values.get("aspect")||"16:9"),seed:values.get("seed")?Number(values.get("seed")):-1,negative:String(values.get("negative")||""),stackId:String(values.get("stackId")||"")}
        backgroundDraftKey=key;dialog.querySelector("[data-cast-error]")?.remove();submitting.add(form);refreshBackgroundGenerator();dialog.querySelector(".dialog-body")?.scrollTo({top:0,behavior:"instant"})
        void(async()=>{await persist();const result=await rpc("generate_cast_background",{groupId:cast.id,key,name,prompt,review:true,settings});readBackgroundJobs(result.backgroundJobs);if(!disposed&&currentCast()?.id===cast.id&&modalKind==="background-generate")refreshBackgroundGenerator();toast(result.status==="exists"?"That scene key is already saved.":result.status==="review"?"Review the existing candidate.":"Background generation queued.")})().catch(report).finally(()=>{submitting.delete(form);if(form.isConnected&&modalKind==="background-generate")refreshBackgroundGenerator()});return
      }
      if(form.id==="ss-cast-background-form") {
        event.preventDefault(); if(submitting.has(form))return
        const cast=currentCast(),values=new FormData(form),name=String(values.get("name")||"").trim(),key=castKey(String(values.get("key")||"").trim()).toLowerCase(),id=castKey(form.dataset.id),old=form.dataset.old||""
        const existing=cleanCastBackgrounds(cast?.backgrounds)
        if(!cast||!name||!key||key==="none"||!id||existing.some(bg=>bg.key!==old&&(bg.key===key||bg.aliases.includes(key)))){const field=form.elements.namedItem("key") as HTMLInputElement;field.setCustomValidity("Choose a unique valid scene key other than none.");field.reportValidity();return}
        if(!old&&existing.length>=100)return
        const previous=existing.find(bg=>bg.key===old)
        const aliases=previous?[...new Set([...previous.aliases,previous.key])].filter(alias=>alias!==key):[]
        if(aliases.length>32){const field=form.elements.namedItem("key") as HTMLInputElement;field.setCustomValidity("Too many historical aliases. Keep the existing key and change the name instead.");field.reportValidity();return}
        submitting.add(form)
        void saveBackgroundChange(cast,()=>{cast.backgrounds=[...existing.filter(bg=>bg.key!==old),{key,name,id,aliases}];if(old&&cast.defaultBackground===old)cast.defaultBackground=key}).catch(report).finally(()=>submitting.delete(form));return
      }
      if(!["ss-cast-cast-form","ss-cast-member-form","ss-cast-identity-form","ss-cast-expression-rename-form"].includes(form.id))return
      event.preventDefault()
      if (submitting.has(form)) return
      submitting.add(form)
      const submit = (root.querySelector(`[form="${form.id}"]`) || form.querySelector('[type="submit"]')) as HTMLButtonElement | null
      if (submit) submit.disabled = true
      void(async()=>{
        const values=new FormData(form)
        if(form.id==="ss-cast-expression-rename-form"){
          if(modalKind!=="expression-rename")throw new Error("Open an expression name editor first.")
          const member=currentMember(),value=String(values.get("expression")||"").trim()
          const newKey=castExpressionKey(value).toLowerCase()
          if(!value||!castKey(newKey))throw new Error("Enter an expression name beginning with a letter or number.")
          updateExpressionKey(member,expressionEditKey,newKey)
          await persist();closeModal();render();toast(`Expression renamed to ${newKey}.`)
          return
        }
        const name=String(values.get("name")||"").trim()
        if(!name)throw new Error("Give them a name first.")
        if(form.id==="ss-cast-cast-form"){
          const existing=castDraft.rename?currentCast():state.casts.find((item:any)=>item.id===castDraft.createdId)
          if(existing)Object.assign(existing,{name,description:String(values.get("description")||"").trim(),tone:castDraft.tone})
          else{const cast={id:createRequestId(),name,description:String(values.get("description")||"").trim(),tone:castDraft.tone,mark:"✧",defaultStyle:"chapter-tab",prompt:true,members:[]};state.casts.push(cast);castDraft.createdId=cast.id;state.castId=cast.id;state.memberId=null}
        }else{
          const cast=currentCast(),editing=form.id==="ss-cast-identity-form"||memberDraft.edit||Boolean(memberDraft.createdId),old=editing?(cast.members.find((item:any)=>item.id===memberDraft?.createdId)||currentMember()):null
          const prefix=castKey(String(values.get("tag")||"").trim()||slug(name))
          if(!prefix||cast.members.some((item:any)=>item.tag.toLowerCase()===prefix.toLowerCase()&&item.id!==old?.id)){
            (form.elements.namedItem("tag") as HTMLInputElement | null)?.focus();throw new Error("Choose a unique expression prefix using letters, numbers, underscores, or hyphens.")
          }
          const fields={name,folderId:String(values.get("folderId")||""),tag:prefix,notes:String(values.get("notes")||"").trim(),role:form.id==="ss-cast-identity-form"?String(values.get("role")):memberDraft.role}
          if(editing){Object.assign(old,fields);if(form.id==="ss-cast-member-form"){old.reference=memberDraft.reference;old.referenceImageId=memberDraft.referenceImageId||"";if(old.wardrobes){const rows=castWardrobes(old);rows[0].referenceImageId=old.referenceImageId;old.wardrobes=rows}}}
          else{const member={id:createRequestId(),...fields,reference:memberDraft.reference,referenceImageId:memberDraft.referenceImageId||"",tone:memberDraft.tone,sourceCharacterId:memberDraft.sourceCharacterId||"",images:memberDraft.images||{},settings:cleanStudioExpressionSet(null),expressions:Object.keys(memberDraft.images||{}),defaultExpression:memberDraft.defaultExpression||"neutral",style:null};cast.members.push(member);memberDraft.createdId=member.id;state.memberId=member.id;state.tab="expressions";state.emotion="neutral"}
        }
        await persist();if(dialog.open)closeModal();render();toast("Saved to your Cast library.")
      })().catch(report).finally(() => { submitting.delete(form); if(submit?.isConnected)submit.disabled=false })
    },{signal:lifetime.signal})
    root.addEventListener("pointerdown",(event: PointerEvent)=>{
      const well=(event.target as Element)?.closest<HTMLElement>(".cast-crop-well")
      if(!well||modalKind!=="presentation"||!currentMember()?.crop?.enabled)return
      pickerCropDrag={x:event.clientX,y:event.clientY,cropX:currentMember().crop.x,cropY:currentMember().crop.y,pointerId:event.pointerId}
      well.setPointerCapture(event.pointerId);event.preventDefault()
    },{signal:lifetime.signal})
    root.addEventListener("pointermove",(event: PointerEvent)=>{
      const active=pickerCropDrag,well=(event.target as Element)?.closest<HTMLElement>(".cast-crop-well")
      if(!active||!well||event.pointerId!==active.pointerId)return
      const member=currentMember(),rect=well.getBoundingClientRect()
      member.crop.x=Math.max(0,Math.min(100,Math.round(active.cropX-(event.clientX-active.x)*100/Math.max(rect.width,1))))
      member.crop.y=Math.max(0,Math.min(100,Math.round(active.cropY-(event.clientY-active.y)*100/Math.max(rect.height,1))))
      refreshPickerCrop()
    },{signal:lifetime.signal})
    root.addEventListener("pointerup",(event: PointerEvent)=>{
      if(!pickerCropDrag||event.pointerId!==pickerCropDrag.pointerId)return
      pickerCropDrag=null;void persist().catch(report)
    },{signal:lifetime.signal})
    root.addEventListener("pointercancel",()=>{pickerCropDrag=null},{signal:lifetime.signal})
    root.addEventListener("keydown",(event: KeyboardEvent)=>{
      const tab=(event.target as Element)?.closest('[role="tab"]')
      if(tab&&["ArrowLeft","ArrowRight","Home","End"].includes(event.key)){
        event.preventDefault();const tabs=Array.from(tab.closest('[role="tablist"]')!.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
        const index=event.key==="Home"?0:event.key==="End"?tabs.length-1:(tabs.indexOf(tab as HTMLButtonElement)+(event.key==="ArrowRight"?1:tabs.length-1))%tabs.length;tabs[index].click()
      }
      if(event.key==="Escape"&&state.menu&&!dialog.open){state.menu=false;render()}
    },{signal:lifetime.signal})
    for(const modal of[dialog])modal.addEventListener("click",(event: MouseEvent)=>{if(event.target!==modal)return;const rect=modal.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom){if(modal===dialog){if(modalKind==="presentation")void handleAction((dialog as HTMLDialogElement).querySelector<HTMLElement>('[data-cast-action="close-dialog"]')!).catch(report);else closeModal()}else dialog.close()}},{signal:lifetime.signal})
    dialog.addEventListener("cancel",(event: Event)=>{if(backgroundSaving||registryBusy)event.preventDefault();else if(modalKind==="presentation"){event.preventDefault();void handleAction((dialog as HTMLDialogElement).querySelector<HTMLElement>('[data-cast-action="close-dialog"]')!).catch(report)}},{signal:lifetime.signal})
    dialog.addEventListener("close",()=>{if(focusBefore?.isConnected)focusBefore.focus()},{signal:lifetime.signal})
    let compactLayout=root.clientWidth<=600
    const observer=typeof ResizeObserver==="function"?new ResizeObserver(()=>{const next=root.clientWidth<=600;if(next!==compactLayout){compactLayout=next;render()}}):null
    observer?.observe(root)
    const catalogueObserver=typeof ResizeObserver==="function"?new ResizeObserver(()=>{if(dialog.open&&modalKind==="presentation")fitPresentationPreviews()}):null
    catalogueObserver?.observe(dialog)
    this.render=()=>render()
    function selectCurrentCast(): void {
      const active = state.casts.find((cast:any) => cast.id === state.activeCast)
      state.castId = active?.id || null
      state.memberId = active?.members[0]?.id || null
      state.tab = "expressions"
      state.emotion = currentMember()?.defaultExpression || "neutral"
      state.menu = false
    }
    this.openCurrent=()=>{
      requestedMemberId = ""
      if (loading) { requestedCurrent = true; return }
      selectCurrentCast(); render(); root.scrollTo({top:0})
    }
    this.openMember=(memberId:string)=>{
      requestedCurrent = false
      requestedMemberId=memberId
      const entry=state.casts.flatMap((group:any)=>group.members.map((member:any)=>({group,member}))).find((entry:any)=>entry.member.id===memberId)
      if(entry){state.castId=entry.group.id;state.memberId=entry.member.id;state.tab="presentation";state.emotion=entry.member.defaultExpression||"neutral";requestedMemberId="";render()}
    }
    this.dispose=()=>{
      disposed=true;loadEpoch++;lifetime.abort();observer?.disconnect();catalogueObserver?.disconnect();if(typeof unsubscribe==="function")unsubscribe();window.clearTimeout(toastTimer)
      if(dialog.open)dialog.close()
      for(const request of pending.values()){window.clearTimeout(request.timer);request.reject(new Error("Cast workspace closed."))}pending.clear();void saveQueue.catch(()=>{});root.replaceChildren()
    }
    void load()

  }
}
