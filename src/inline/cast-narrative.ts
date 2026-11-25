// Cast Islands v2: slots are created *before* Lumiverse parses Markdown.
// This frontend never edits host narration, never splits text nodes and never
// computes an approximate source position. It only hydrates exact placeholders.
interface CastIslandMount { root: ShadowRoot; content: HTMLElement; signature: string }
let castIslandStyleSheet: CSSStyleSheet | null = null
const CAST_ISLAND_CSS = `:host{display:block!important;position:relative!important;max-width:100%!important;margin:10px auto!important;contain:layout style;line-height:normal;isolation:isolate;text-align:left!important;text-align-last:auto!important}*,*::before,*::after{box-sizing:border-box}.ss-cast-island-content{display:block;max-width:100%;text-align:left;text-align-last:auto}.ss-cast-design{ text-align:left; text-align-last:auto }.ss-cast-design [data-swarm-cast-dialogue]{text-align:inherit;text-align-last:auto}` + "\n" + CAST_PRESENTATION_CSS + "\n" + CAST_PRESENTATION_SIDE_CSS + `
@media(min-width:721px) and (pointer:fine){.ss-cast-island-content [data-ss-card-width]{width:var(--ss-card-width)!important;max-width:100%!important;}}
.ss-cast-island-content .ss-card-adjusted{overflow:clip;}
`
function castAttachIslandStyle(root: ShadowRoot): void {
  try {
    if (typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in root && typeof CSSStyleSheet.prototype.replaceSync === "function") {
      if (!castIslandStyleSheet) { castIslandStyleSheet = new CSSStyleSheet(); castIslandStyleSheet.replaceSync(CAST_ISLAND_CSS) }
      // A new StudioCastNarrative instance must reuse the existing island.
      // Reattaching its stylesheet on every remount causes unnecessary repaints.
      if (!root.adoptedStyleSheets.includes(castIslandStyleSheet)) root.adoptedStyleSheets = [castIslandStyleSheet]
      return
    }
  } catch { /* WebViews without constructable stylesheets get one local style. */ }
  if (root.querySelector('style[data-ss-cast-island-style="1"]')) return
  const css=document.createElement("style");css.dataset.ssCastIslandStyle="1";css.textContent=CAST_ISLAND_CSS;root.prepend(css)
}
// The Shadow Root belongs to the *slot*, not to a particular controller
// instance. A browser rerender/hot reload can discard the controller while
// leaving its DOM intact. Adopt the existing content instead of appending an
// identical presentation every time a new controller hydrates the same slot.
function castIslandContent(root: ShadowRoot): HTMLElement {
  const existing = [...root.childNodes].filter((node): node is HTMLElement => node instanceof HTMLElement && node.classList.contains("ss-cast-island-content"))
  const content = existing.shift() || document.createElement("span")
  if (!content.isConnected) {
    content.className="ss-cast-island-content"
    root.append(content)
  }
  // Repair duplicates left behind by earlier controller lifetimes. Never
  // remove an unrelated child of the Shadow Root.
  for (const duplicate of existing) duplicate.remove()
  return content
}
function castDecodeIsland(encoded: string): string {
  if (!/^[\w-]{1,22000}$/.test(encoded)) return ""
  try {
    const base64=encoded.replace(/-/g,"+").replace(/_/g,"/")
    const bytes=Uint8Array.from(atob(base64), c=>c.charCodeAt(0))
    return new TextDecoder("utf-8",{fatal:true}).decode(bytes)
  } catch { return "" }
}
function castEscapeIsland(text: string): string {
  return text.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))
}
class StudioCastNarrative {
  private library = cleanCastLibrary(null)
  private librarySignature = ""
  private libraryRevision = 0
  private chatId = ""
  private disposed = false
  private queued = false
  private frame = 0
  private observer: MutationObserver | null = null
  private loadId = ""
  private cleanups: (()=>void)[]=[]
  private mounts=new WeakMap<HTMLElement,CastIslandMount>()
  private stageDirections=new WeakMap<HTMLElement,StageSceneState>()
  // The original wardrobe quick picker is retained, but all post-render
  // reconciliation, source caches, and text mutation machinery are DELETED.
  private quickMenu:HTMLElement|null=null
  private quickMemberId=""
  private quickFilter="all"
  private quickSaving=""
  private quickSaveKind:"presentation"|"crop"|"side"|""=""
  private quickCropFlush:(()=>void)|null=null
  private cardOverrides:Record<string,CastCardOverride>=Object.create(null)
  private memberPreferences:Record<string,CastMemberPreference>=Object.create(null)
  private cardLoadId=""
  private cardLoaded=false
  private cardLoadTimer=0
  private cardLoadRetry=0
  private cardLoadError=""
  private cardLoadNotice: {status:HTMLElement;retry:HTMLButtonElement;ready:()=>void}|null=null
  private cardEditor:HTMLDialogElement|null=null
  private cardEditorCleanup:(()=>void)|null=null
  private cardSave:{requestId:string;chatId:string;key:string;memberId:string;scope:"member"|"card";dialog:HTMLDialogElement;timer:number;done:(error?:string)=>void}|null=null
  private cardIdentity(host:HTMLElement,messageId:string,swipe?:unknown):string {
    if(!castKey(messageId))return ""
    const index=host.dataset.ssCastIndex||"0"
    if(!/^\d{1,5}$/.test(index))return ""
    const selected=typeof swipe==="number"&&Number.isInteger(swipe)&&swipe>=0?String(swipe):"-"
    const packet=[host.dataset.ssCastKey,host.dataset.ssCastBackground,host.dataset.ssCastPacket,...(host.dataset.ssCastRequestedExpression?[host.dataset.ssCastRequestedExpression]:[]),...(host.dataset.ssCastWardrobe?["wardrobe="+host.dataset.ssCastWardrobe]:[]),...(host.dataset.ssCastAtmosphere?["atmosphere="+host.dataset.ssCastAtmosphere]:[])].join("|")
    return `${messageId}:${index}:${selected}:${widgetKeyHash(packet)}:${widgetKeyHash([...packet].reverse().join(""))}`
  }
  private cardMember(key:string,library:StudioCastLibrary,wardrobe=""):StudioCastMember|undefined {
    if(wardrobe)return castMembers(library).filter(m=>key===m.prefix.toLowerCase()||key.startsWith(m.prefix.toLowerCase()+"-")).sort((a,b)=>b.prefix.length-a.prefix.length)[0]
    // Prefer an exact expression match, not an ambiguous prefix.
    const matches=castMembers(library).filter(m=>key===m.prefix.toLowerCase()||Object.keys(m.images).some(label=>key===`${m.prefix}-${label}`.toLowerCase()))
    return matches.length===1?matches[0]:undefined
  }
  private preferredLibrary(library:StudioCastLibrary,memberId:string,pref?:CastMemberPreference):StudioCastLibrary {
    if(!pref)return library
    return {...library,members:library.members.map(item=>item.id===memberId?{...item,presentation:pref.presentation??item.presentation,presentationSide:pref.side??item.presentationSide,crop:pref.crop??item.crop}:item)}
  }
  private renderCard(host:HTMLElement,library:StudioCastLibrary,override?:CastCardOverride):string {
    const original=String(host.dataset.ssCastKey||"").toLowerCase(),body=castDecodeIsland(host.dataset.ssCastPacket||"")
    const direction=this.stageDirections.get(host)
    const requestedBackground=castKey(host.dataset.ssCastBackground)||""
    const directedBackground=direction?.sceneDirected?direction.scene:""
    const background=requestedBackground||directedBackground
    const wardrobe=castKey(host.dataset.ssCastWardrobe)||""
    const member=this.cardMember(original,library,wardrobe)
    const owned=member&&override?.memberId===member.id?override:undefined
    const label=owned?.expression&&member?.images[owned.expression]?owned.expression:""
    const requested=castKey(host.dataset.ssCastRequestedExpression).toLowerCase()
    const selected=label||(!wardrobe&&requested&&member?.images[requested]?requested:"")
    const key=selected&&member?`${member.prefix}-${selected}`:original
    let scoped=owned?.crop&&member?{...library,members:library.members.map(item=>item.id===member.id?{...item,crop:owned.crop!}:item)}:library
    const explicitMood=castAtmosphereKey(host.dataset.ssCastAtmosphere)
    const atmosphere=explicitMood||(direction?.lightingDirected?direction.lighting:"")
    const group=scoped.groups.find(item=>item.id===member?.groupId)
    // An unresolved directed location is pending, not permission to substitute
    // the Cast's unrelated default scenery. Late library hydration retries it.
    const effectiveBackground=!requestedBackground&&directedBackground&&directedBackground!=="none"&&!group?.backgrounds.some(bg=>bg.key===directedBackground||bg.aliases.includes(directedBackground))?"none":background
    // A standalone lighting cue is its own opt-in protocol. Do not change
    // the saved Cast flag or how legacy explicit packet moods are rendered.
    if(direction?.lightingDirected&&group)scoped={...scoped,groups:scoped.groups.map(item=>item.id===group.id?{...item,atmosphere:{...cleanCastAtmosphereSettings(item.atmosphere),enabled:true}}:item)}
    const packet=`<swarm-cast=${key}${wardrobe&&!selected?` wardrobe=${wardrobe}`:""}${effectiveBackground?` background=${effectiveBackground}`:""}${atmosphere?` atmosphere=${atmosphere}`:""}>${body}</swarm-cast>`
    const html=renderCastTags(packet,scoped,castEscapeIsland)
    return html===packet?"":html
  }
  private paintCardGeometry(content:HTMLElement,override?:CastCardOverride):void {
    const card=content.querySelector<HTMLElement>("[data-swarm-cast]")
    const actor=card?.querySelector<HTMLImageElement>("[data-cast-asset],img")
    if(!card||!actor)return
    if(override?.width!=null){card.dataset.ssCardWidth="1";card.style.setProperty("--ss-card-width",override.width+"%")}
    else{delete card.dataset.ssCardWidth;card.style.removeProperty("--ss-card-width")}
    const adjusted=!!override&&(override.scale!==1||override.x!==0||override.y!==0)
    card.classList.toggle("ss-card-adjusted",adjusted)
    if(adjusted&&override){
      const cropScale=card.dataset.castCropEnabled==="true"?Number(card.style.getPropertyValue("--cast-crop-scale"))||1:1
      actor.style.scale=String(override.scale*cropScale)
      actor.style.translate=`${override.x}% ${override.y}%`
    }else{actor.style.removeProperty("scale");actor.style.removeProperty("translate")}
  }
  private closeCardEditor():void {
    this.cardLoadNotice=null
    this.cardEditorCleanup?.();this.cardEditorCleanup=null
    const dialog=this.cardEditor;this.cardEditor=null
    if(dialog){if(dialog.open)dialog.close();dialog.remove()}
  }
  private openCardEditor(host:HTMLElement,member:StudioCastMember,library:StudioCastLibrary,expression:string,key:string):void {
    this.closeQuickMenu();this.closeCardEditor()
    const previous=this.cardOverrides[key]?.memberId===member.id?this.cardOverrides[key]:undefined
    let savedPref=this.memberPreferences[member.id], savedExpression=previous?.expression||""
    let draft:CastMemberPreference=cleanCastMemberPreference(savedPref), correction=savedExpression
    type Tool="looks"|"transform"|"crop"|"width"|"expression"
    let tool:Tool="looks"
    const dialog=document.createElement("dialog");dialog.className="ss-card-editor ss-member-atelier";dialog.setAttribute("aria-label",`Edit ${member.name} presentation`)
    applyAppearanceVariables(dialog,storedStudioAppearance())
    const head=element("header","ss-card-editor-head"),title=element("div")
    const eyebrow=element("small");eyebrow.textContent="CAST · MEMBER ATELIER"
    const name=element("strong");name.textContent=member.name;title.append(eyebrow,name)
    const makeButton=(text:string,icon?:string)=>{const b=element("button");b.type="button";if(icon)b.innerHTML=icon;if(text)b.append(document.createTextNode(text));return b}
    const close=makeButton("×");close.setAttribute("aria-label","Close card editor");close.onclick=()=>{if(!this.cardSave)this.closeCardEditor()};head.append(title,close)
    const svg=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`
    const toolSpecs:{id:Tool;name:string;icon:string}[]=[
      {id:"looks",name:"Presentation",icon:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M10 10v10"/>')},
      {id:"transform",name:"Size & position",icon:svg('<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>')},
      {id:"crop",name:"Crop framing",icon:svg('<path d="M6 3v15h15M3 6h15v15"/>')},
      {id:"width",name:"Card width",icon:svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 12h8M10 9l-3 3 3 3M14 9l3 3-3 3"/>')},
      {id:"expression",name:"Replace expression",icon:svg('<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 14q4 5 8 0"/>')},
    ]
    const body=element("div","ss-atelier-body"),rail=element("nav","ss-atelier-rail");rail.setAttribute("aria-label","Presentation tools")
    const memberTools=element("div","ss-atelier-tool-group"),cardTools=element("div","ss-atelier-tool-group")
    const memberLabel=element("small"),cardLabel=element("small");memberLabel.textContent="Member";cardLabel.textContent="This card";memberTools.append(memberLabel);cardTools.append(cardLabel)
    const buttons=new Map<Tool,HTMLButtonElement>()
    for(const spec of toolSpecs){const b=makeButton("",spec.icon);b.title=spec.name;b.setAttribute("aria-label",spec.name);b.dataset.atelierTool=spec.id;b.onclick=()=>choose(spec.id);buttons.set(spec.id,b);(spec.id==="expression"?cardTools:memberTools).append(b)}
    const openMember=makeButton("",FOLDER_ICON);openMember.title=`Open ${member.name} in Cast`;openMember.setAttribute("aria-label",openMember.title);openMember.className="ss-atelier-open-member";openMember.hidden=!this.openCastMember;openMember.onclick=()=>{if(this.cardSave)return;this.closeCardEditor();this.openCastMember?.(member.id)}
    rail.append(memberTools,cardTools,openMember)
    const drawer=element("section","ss-atelier-drawer"),drawerHeader=element("header","ss-atelier-drawer-head"),drawerTitle=element("strong"),drawerHint=element("p");drawerHeader.append(drawerTitle,drawerHint);drawer.append(drawerHeader)
    const controls=element("div","ss-card-editor-controls ss-atelier-controls");drawer.append(controls)
    const panels=new Map<Tool,HTMLElement>();for(const spec of toolSpecs){const panel=element("div","ss-card-editor-fields ss-atelier-fields");panels.set(spec.id,panel);controls.append(panel)}
    const looks=panels.get("looks")!,transform=panels.get("transform")!,cropPanel=panels.get("crop")!,widthPanel=panels.get("width")!,expressions=panels.get("expression")!
    const viewport=element("div","ss-card-editor-viewport ss-atelier-viewport"),stage=element("div","ss-card-editor-stage")
    const originalWidth=Math.max(1,host.getBoundingClientRect().width)
    const stageHost=element("div","ss-card-editor-render");const root=stageHost.attachShadow({mode:"open"});castAttachIslandStyle(root)
    const previewCSS=element("style");previewCSS.textContent=":host .ss-cast-island-content [data-swarm-cast][data-cast-side]{margin-left:auto!important;margin-right:auto!important;}";root.append(previewCSS)
    const content=castIslandContent(root);stage.append(stageHost);viewport.append(stage)
    const outline=element("div","ss-card-selection");outline.setAttribute("role","group");outline.setAttribute("aria-label","Selected layer")
    const resize=element("button","ss-card-selection-handle");resize.type="button";resize.setAttribute("aria-label","Drag to resize selected layer");resize.title="Drag to resize";outline.append(resize);stage.append(outline)
    const mobile=()=>window.matchMedia("(max-width:720px), (pointer:coarse)").matches
    const effectivePresentation=()=>draft.presentation??member.presentation
    const resolvedPresentation=()=>effectivePresentation()==="inherit"?library.groups.find(g=>g.id===member.groupId)?.defaultPresentation||"story":effectivePresentation()
    const effectiveSide=()=>draft.side??member.presentationSide
    const cropValue=()=>draft.crop??member.crop
    const draftGeometry=()=>castMemberCardGeometry(member.id,draft,correction)
    const presentationFilter=element("select");presentationFilter.setAttribute("aria-label","Presentation category")
    for(const item of [{id:"all",name:"All presentations"},{id:"legacy",name:"Original Cast"},...CAST_COMPOSITIONS]){const option=element("option");option.value=item.id;option.textContent=item.name;presentationFilter.append(option)}
    presentationFilter.value=CAST_PRESENTATION_INDEX.get(resolvedPresentation())?.composition||"legacy"
    const search=element("input");search.type="search";search.placeholder="Find a presentation…";search.setAttribute("aria-label","Find a presentation")
    const presentationList=element("div","ss-atelier-look-grid");looks.append(presentationFilter,search,presentationList)
    const lookEntries:{id:StudioCastMember["presentation"];name:string;composition:string}[]=[{id:"inherit",name:"Follow Cast default",composition:"legacy"},{id:"story",name:"Original story",composition:"legacy"},{id:"portrait",name:"Portrait",composition:"legacy"},{id:"sticker",name:"Sticker",composition:"legacy"},...CAST_PRESENTATION_ENTRIES]
    const populateLooks=()=>{
      presentationList.replaceChildren()
      for(const entry of lookEntries){if(entry.id!=="inherit"&&presentationFilter.value!=="all"&&entry.composition!==presentationFilter.value)continue;if(search.value&&!entry.name.toLowerCase().includes(search.value.toLowerCase()))continue
        const button=makeButton("");button.className="ss-atelier-look";button.dataset.atelierPresentation=entry.id;button.setAttribute("aria-label",entry.name)
        const thumb=element("span","ss-atelier-look-preview"),mount=element("span","ss-atelier-look-render"),shadow=mount.attachShadow({mode:"open"});castAttachIslandStyle(shadow)
        const css=element("style");css.textContent=":host .ss-cast-island-content [data-swarm-cast][data-cast-side]{margin-left:auto!important;margin-right:auto!important;}";shadow.append(css)
        const preview=castIslandContent(shadow);preview.innerHTML=this.renderCard(host,this.preferredLibrary(library,member.id,{...draft,presentation:entry.id}),castMemberCardGeometry(member.id,{...draft,width:undefined},correction));thumb.append(mount)
        const caption=element("span");caption.textContent=entry.name;button.append(thumb,caption);button.onclick=()=>{draft.presentation=entry.id;paint(true)};presentationList.append(button)
      }
      syncLooks()
    }
    const syncLooks=()=>{for(const b of presentationList.querySelectorAll<HTMLButtonElement>("[data-atelier-presentation]"))b.setAttribute("aria-pressed",String(b.dataset.atelierPresentation===effectivePresentation()))}
    presentationFilter.onchange=populateLooks;search.oninput=populateLooks
    const slider=(label:string,min:number,max:number,step:number,container:HTMLElement,read:()=>number,write:(v:number)=>void,format:(v:number)=>string)=>{
      const field=element("label"),top=element("span","ss-card-slider-label"),caption=element("span"),value=element("output")
      caption.textContent=label;top.append(caption,value);const input=element("input");input.type="range";input.min=String(min);input.max=String(max);input.step=String(step);input.setAttribute("aria-label",label)
      field.append(top,input);container.append(field)
      const sync=()=>{input.value=String(read());value.textContent=format(read())}
      input.oninput=()=>{write(Number(input.value));paint(false)};sync();return sync
    }
    const pct=(v:number)=>`${Math.round(v)}%`
    const sideLabel=element("small");sideLabel.textContent="Stage alignment";const sides=element("div","ss-atelier-side");transform.append(sideLabel,sides)
    for(const side of ["auto","left","right"] as const){const b=makeButton(side.charAt(0).toUpperCase()+side.slice(1));b.dataset.atelierSide=side;b.onclick=()=>{draft.side=side;paint(true)};sides.append(b)}
    const syncScale=slider("Expression size",.75,1.5,.01,transform,()=>draft.scale??1,v=>draft.scale=v,v=>pct(v*100))
    const syncX=slider("Horizontal position",-20,20,1,transform,()=>draft.x??0,v=>draft.x=v,pct)
    const syncY=slider("Vertical position",-15,15,1,transform,()=>draft.y??0,v=>draft.y=v,pct)
    const transformReset=makeButton("Reset size & position");transformReset.onclick=()=>{delete draft.scale;delete draft.x;delete draft.y;delete draft.side;paint(true)};transform.append(transformReset)
    const cropEnabledField=element("label","ss-card-editor-crop-toggle"),cropEnabled=element("input");cropEnabled.type="checkbox";cropEnabledField.append(cropEnabled,document.createTextNode("Enable crop framing"));cropPanel.append(cropEnabledField)
    const cropControls=element("div","ss-card-editor-fields ss-atelier-fields");cropPanel.append(cropControls)
    const cropUnsupported=element("p","ss-card-editor-crop-note");cropUnsupported.textContent="This presentation uses a full portrait. Adjust size and position instead.";cropPanel.append(cropUnsupported)
    const setCrop=(part:"x"|"y"|"zoom",value:number)=>{draft.crop={...cropValue(),enabled:true,[part]:value}}
    const syncCropX=slider("Crop horizontal",0,100,1,cropControls,()=>cropValue().x,v=>setCrop("x",v),pct)
    const syncCropY=slider("Crop vertical",0,100,1,cropControls,()=>cropValue().y,v=>setCrop("y",v),pct)
    const syncCropZoom=slider("Crop zoom",1,3,.05,cropControls,()=>cropValue().zoom,v=>setCrop("zoom",v),v=>v.toFixed(2)+"×")
    const cropReset=makeButton("Use base crop");cropReset.onclick=()=>{delete draft.crop;paint(true)};cropPanel.append(cropReset)
    cropEnabled.onchange=()=>{draft.crop={...cropValue(),enabled:cropEnabled.checked};paint(true)}
    const cardElement=()=>content.querySelector<HTMLElement>("[data-swarm-cast]")
    const actorElement=()=>cardElement()?.querySelector<HTMLImageElement>("[data-cast-asset],img")
    const defaultWidth=()=>Math.max(40,Math.min(100,Math.round((cardElement()?.getBoundingClientRect().width||1)/Math.max(stageHost.getBoundingClientRect().width,1)*100)))
    const widthControls=element("div","ss-card-editor-fields ss-atelier-fields");widthPanel.append(widthControls)
    const syncWidth=slider("Card width",40,100,1,widthControls,()=>draft.width??defaultWidth(),v=>draft.width=v,pct)
    const widthReset=makeButton("Use template width");widthReset.onclick=()=>{delete draft.width;paint(false)};widthControls.append(widthReset)
    const mobileNote=element("p");mobileNote.textContent="Card width follows the message on mobile.";widthPanel.append(mobileNote)
    const expressionHint=element("p");expressionHint.textContent="Correct the model’s expression choice without changing other cards.";expressions.append(expressionHint)
    const authoredWardrobe=host.dataset.ssCastWardrobe||castWardrobeForAsset(member,expression)?.wardrobe.key||"default",correctedWardrobe=castWardrobeForAsset(member,correction)?.wardrobe.key,wardrobes=castWardrobes(member).filter(row=>castWardrobeAvailable(member,row)||row.key===authoredWardrobe||row.key===correctedWardrobe)
    const wardrobeSelect=element("select");wardrobeSelect.setAttribute("aria-label","Card wardrobe")
    for(const row of wardrobes){const option=element("option");option.value=row.key;option.textContent=row.name+(row.archived?" · Archived":!castWardrobeAvailable(member,row)?" · Hidden here":"");wardrobeSelect.append(option)}
    wardrobeSelect.value=castWardrobeForAsset(member,correction)?.wardrobe.key||authoredWardrobe
    if(!wardrobeSelect.value)wardrobeSelect.value="default"
    if(member.wardrobes){const field=element("label","ss-field");field.append(element("span","","Wardrobe · this card"),wardrobeSelect);expressions.append(field)}
    const expressionList=element("div","ss-atelier-expression-grid");expressions.append(expressionList)
    const populateExpressions=()=>{
      expressionList.replaceChildren()
      const wardrobe=wardrobes.find(row=>row.key===wardrobeSelect.value)||wardrobes[0]
      const choices:[string,string][]=[["",`Original · ${castWardrobeForAsset(member,expression)?.label||expression||member.defaultExpression}`],...Object.entries(wardrobe.slots).filter(([,asset])=>castWardrobeAvailable(member,wardrobe)||asset===correction).sort(([a],[b])=>a.localeCompare(b)).map(([name,asset])=>[asset,name.replace(/[-_]/g," ")] as [string,string])]
      for(const [label,display] of choices){const b=makeButton("");b.className="ss-atelier-expression";b.dataset.atelierExpression=label;const img=element("img");const id=member.images[label||expression]?.id||(!label?member.images[member.defaultExpression]?.id:undefined);if(id)img.src=`/api/v1/images/${encodeURIComponent(id)}`;img.alt="";img.loading="lazy";const text=element("span");text.textContent=display;b.setAttribute("aria-label",display);b.append(img,text);b.onclick=()=>{correction=label;if(!label){wardrobeSelect.value=authoredWardrobe;populateExpressions()}paint(true)};expressionList.append(b)}
      if(!Object.keys(wardrobe.slots).length)expressionList.append(element("p","ss-muted","This outfit has no expressions yet."))
    }
    populateExpressions()
    wardrobeSelect.onchange=()=>{populateExpressions();const row=wardrobes.find(item=>item.key===wardrobeSelect.value)!;const label=castWardrobeForAsset(member,correction||expression)?.label||"neutral";const asset=row.slots[label]||row.slots.neutral;if(!castWardrobeAvailable(member,row))correction=row.key===authoredWardrobe?"":correction;else if(asset)correction=asset;paint(true)}
    const footer=element("footer","ss-card-editor-footer"),status=element("p");status.setAttribute("role","status")
    const resetBtn=makeButton("Revert member"),save=makeButton("Apply to member",CHECK_ICON);save.className="ss-card-editor-save"
    footer.append(status,resetBtn,save);body.append(rail,drawer,viewport);dialog.append(head,body,footer)
    const positionOutline=()=>{
      const card=cardElement(),selection=tool==="width"?"card":"actor",target=selection==="actor"?actorElement():card
      if(!target||!card||tool==="looks"||tool==="expression"||(tool==="width"&&mobile())||(tool==="crop"&&(resolvedPresentation()==="portrait"||resolvedPresentation()==="moonlit-halo"))){outline.hidden=true;return}
      const bounds=stage.getBoundingClientRect(),rect=target.getBoundingClientRect(),clip=card.getBoundingClientRect()
      const left=Math.max(rect.left,clip.left),top=Math.max(rect.top,clip.top),right=Math.min(rect.right,clip.right),bottom=Math.min(rect.bottom,clip.bottom)
      outline.hidden=right<=left||bottom<=top;outline.style.left=`${left-bounds.left}px`;outline.style.top=`${top-bounds.top}px`;outline.style.width=`${Math.max(0,right-left)}px`;outline.style.height=`${Math.max(0,bottom-top)}px`
      resize.hidden=tool==="crop";outline.dataset.selection=selection;outline.dataset.anchor="left"
    }
    const fit=()=>{
      const available=Math.max(1,viewport.clientWidth-32),height=Math.max(1,viewport.clientHeight-32),w=originalWidth
      stageHost.style.width=`${w}px`
      const naturalHeight=Math.max(1,stageHost.offsetHeight)
      const zoom=Math.min(1,available/w,Math.max(.40,height/naturalHeight))
      stage.style.width=`${w*zoom}px`;stageHost.style.zoom=String(zoom);positionOutline();syncWidth()
    }
    const dirtyMember=()=>JSON.stringify(castMemberPreferenceDiff(draft,member))!==JSON.stringify(savedPref||{})
    const dirtyCard=()=>correction!==savedExpression
    let message=""
    const sync=()=>{
      const canCrop=resolvedPresentation()!=="portrait"&&resolvedPresentation()!=="moonlit-halo",pending=!!this.cardSave
      for(const [id,panel] of panels)panel.hidden=id!==tool
      for(const [id,b] of buttons){b.setAttribute("aria-pressed",String(id===tool));b.disabled=pending;b.hidden=id==="width"&&mobile()}
      drawerTitle.textContent=toolSpecs.find(t=>t.id===tool)!.name;drawerHint.textContent=tool==="expression"?"Only this dialogue card":"All past and future cards for this member"
      for(const b of sides.querySelectorAll<HTMLButtonElement>("button"))b.setAttribute("aria-pressed",String(b.dataset.atelierSide===effectiveSide()))
      for(const b of expressionList.querySelectorAll<HTMLButtonElement>("button"))b.setAttribute("aria-pressed",String(b.dataset.atelierExpression===correction))
      cropEnabled.checked=cropValue().enabled;cropEnabledField.hidden=!canCrop;cropUnsupported.hidden=canCrop;cropControls.hidden=!canCrop;for(const input of cropControls.querySelectorAll<HTMLInputElement>('input[type="range"]'))input.disabled=!cropEnabled.checked
      syncLooks();syncScale();syncX();syncY();syncCropX();syncCropY();syncCropZoom();syncWidth();widthControls.hidden=mobile();mobileNote.hidden=!mobile();
      resetBtn.textContent=tool==="expression"?"Restore original":"Revert member";save.lastChild!.textContent=tool==="expression"?"Apply to card":"Apply to member"
      status.textContent=message||[dirtyMember()?"Member changes unsaved":"",dirtyCard()?"Expression correction unsaved":""].filter(Boolean).join(" · ")|| (savedPref===undefined&&previous?"Legacy geometry is kept until you apply member preferences.":tool==="expression"?"Only this card changes.":"Preferences apply to all cards for this member.")
      const actualWardrobe=castWardrobeForAsset(member,correction||expression)?.wardrobe.key||authoredWardrobe;const unselected=tool==="expression"&&wardrobeSelect.value!==actualWardrobe;if(unselected)status.textContent="Choose an available expression in this outfit before applying.";save.disabled=!this.cardLoaded||pending||unselected;resetBtn.disabled=pending;close.disabled=pending;openMember.disabled=pending
      controls.inert=pending;positionOutline()
    }
    const paint=(force:boolean)=>{
      message="";const signature=JSON.stringify([correction,draft.presentation,draft.side,draft.crop])
      if(force||content.dataset.cropSignature!==signature){content.innerHTML=this.renderCard(host,this.preferredLibrary(library,member.id,draft),draftGeometry());content.dataset.cropSignature=signature;for(const image of content.querySelectorAll<HTMLImageElement>("img")){image.loading="eager";image.addEventListener("load",fit,{once:true})}}
      this.paintCardGeometry(content,draftGeometry());fit();sync()
    }
    const scrollPositions=new Map<Tool,number>()
    const choose=(next:Tool)=>{if(this.cardSave||next==="width"&&mobile())return;scrollPositions.set(tool,controls.scrollTop);tool=next;message="";if(next==="looks")populateLooks();sync();controls.scrollTop=scrollPositions.get(next)||0}
    stageHost.addEventListener("click",event=>{const actor=actorElement();choose(actor&&event.composedPath().includes(actor)?"transform":"width")})
    resetBtn.onclick=()=>{if(tool==="expression"){correction="";wardrobeSelect.value=authoredWardrobe;populateExpressions()}else draft={};paint(true)}
    let drag:{id:number;startX:number;startY:number;w:number;h:number;scale:number;x:number;y:number;width:number;resize:boolean;crop:StudioCastMember["crop"]}|null=null
    outline.addEventListener("pointerdown",event=>{
      if(this.cardSave||tool==="width"&&(mobile()||event.target!==resize)||tool==="crop"&&!cropValue().enabled)return
      const rect=outline.getBoundingClientRect();drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,w:Math.max(1,rect.width),h:Math.max(1,rect.height),scale:draft.scale??1,x:draft.x??0,y:draft.y??0,width:draft.width??defaultWidth(),resize:event.target===resize,crop:{...cropValue()}}
      outline.setPointerCapture(event.pointerId);event.preventDefault()
    })
    outline.addEventListener("pointermove",event=>{
      if(!drag||drag.id!==event.pointerId||this.cardSave)return
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY
      if(tool==="width")draft.width=Math.max(40,Math.min(100,drag.width+2*dx*100/Math.max(1,stageHost.getBoundingClientRect().width)))
      else if(tool==="crop"){draft.crop={...drag.crop,x:Math.max(0,Math.min(100,drag.crop.x-dx*100/drag.w)),y:Math.max(0,Math.min(100,drag.crop.y-dy*100/drag.h))}}
      else if(drag.resize)draft.scale=Math.max(.75,Math.min(1.5,drag.scale+(dx/drag.w+dy/drag.h)*.5))
      else{draft.x=Math.max(-20,Math.min(20,drag.x+dx*100/drag.w));draft.y=Math.max(-15,Math.min(15,drag.y+dy*100/drag.h))}
      paint(false)
    })
    for(const event of ["pointerup","pointercancel","lostpointercapture"])outline.addEventListener(event,()=>{drag=null})
    save.onclick=()=>{
      if(!this.cardLoaded||this.cardSave||!host.isConnected||this.cardIdentity(host,String(this.ctx.dom.getMessageId?.(host)||""),this.currentCardSwipe(String(this.ctx.dom.getMessageId?.(host)||"")))!==key){message="The source card changed. Reopen its editor.";sync();return}
      const scope=tool==="expression"?"card":"member",requestId=createRequestId(),chatId=this.chatId
      const done=(error?:string)=>{if(!error){savedPref=this.memberPreferences[member.id];savedExpression=this.cardOverrides[key]?.expression||"";if(scope==="member")draft=cleanCastMemberPreference(savedPref);else correction=savedExpression}message=error|| (scope==="member"?"Member preferences saved.":"Expression correction saved.");sync()}
      const timer=window.setTimeout(()=>{if(this.cardSave?.requestId!==requestId)return;this.cardSave=null;done("Save was not confirmed. Reopen the chat to check before retrying.")},15000)
      this.cardSave={requestId,chatId,key,memberId:member.id,scope,dialog,timer,done};message="Saving…";sync()
      try{this.ctx.sendToBackend(scope==="member"?{type:"set_cast_member_preference",requestId,chatId,memberId:member.id,preference:castMemberPreferenceDiff(draft,member)}:{type:"set_cast_card_override",requestId,chatId,key,memberId:member.id,expressionOnly:true,override:correction?castMemberCardGeometry(member.id,{},correction):null})}catch{window.clearTimeout(timer);this.cardSave=null;done("Could not save. Try again.")}
    }
    const observer=new ResizeObserver(()=>fit());observer.observe(viewport);observer.observe(stage)
    const onResize=()=>{if(tool==="width"&&mobile())choose("transform");fit();sync()};window.addEventListener("resize",onResize)
    this.cardEditorCleanup=()=>{observer.disconnect();window.removeEventListener("resize",onResize)}
    dialog.addEventListener("cancel",event=>{event.preventDefault();if(!this.cardSave)this.closeCardEditor()})
    document.body.append(dialog);this.cardEditor=dialog;dialog.showModal();fit();populateLooks();paint(true)
  }
  private recentCardMessages():any[] {
    try{const recent=this.ctx.messages?.getRecent?.(200);return Array.isArray(recent)?recent:[]}catch{return []}
  }
  private currentCardSwipe(messageId:string):unknown {
    const recent=this.recentCardMessages()
    return Array.isArray(recent)?recent.find((m:any)=>m.id===messageId&&(!m.chat_id||m.chat_id===this.chatId))?.swipe_id:undefined
  }
  private readonly onQuickContext=(event:MouseEvent):void=>{
    const host=event.composedPath().find((node):node is HTMLElement=>node instanceof HTMLElement && node.hasAttribute("data-ss-cast-slot"))
    if (!host || this.disposed || !host.shadowRoot) return
    if (!this.ctx.dom.getMessageId?.(host)) return
    const key=String(host.dataset.ssCastKey||"").toLowerCase()
    const group=castLibraryForChat(this.library,this.chatId)
    const wardrobe=castKey(host.dataset.ssCastWardrobe)||""
    const member=this.cardMember(key,group,wardrobe)
    if(!member)return
    event.preventDefault();event.stopImmediatePropagation()
    const expression=wardrobe?castResolveWardrobe(group,key,wardrobe)?.assetKey||"":key.startsWith(member.prefix.toLowerCase()+"-")?key.slice(member.prefix.length+1):member.defaultExpression
    const messageId=String(this.ctx.dom.getMessageId?.(host)||"")
    const cardKey=this.cardIdentity(host,messageId,this.currentCardSwipe(messageId))
    // A failed or pending preference read is not a reason to silently fall
    // back to the old shared-library editor. Its writes have different scope.
    const active=String(this.ctx.getActiveChat?.()?.chatId||"")
    if(active!==this.chatId){this.reload();return}
    if(cardKey&&castKey(this.chatId)){
      if(this.cardLoaded)this.openCardEditor(host,member,group,expression,cardKey)
      else this.waitForCardEditor(host,member,cardKey)
    }else this.openQuickMenu(member,event.clientX,event.clientY,group,expression)
  }
  private waitForCardEditor(host:HTMLElement,member:StudioCastMember,key:string):void {
    this.closeQuickMenu();this.closeCardEditor()
    const chatId=this.chatId,dialog=element("dialog","ss-inline-prompt-diagnostics ss-atelier-loading")
    dialog.setAttribute("aria-label",`Load ${member.name} Member Atelier`)
    applyAppearanceVariables(dialog,storedStudioAppearance())
    const head=element("header","ss-diagnostic-heading"),title=element("h2"),close=element("button")
    title.textContent="Member Atelier";close.type="button";close.textContent="×";close.setAttribute("aria-label","Close Atelier loading");close.onclick=()=>this.closeCardEditor();head.append(title,close)
    const body=element("div","ss-diagnostic-body"),status=element("p");status.setAttribute("role","status");status.style.margin="0";body.append(status)
    const footer=element("footer"),retry=element("button");retry.type="button";retry.textContent="Retry";retry.onclick=()=>this.requestCardOverrides(0);footer.append(retry)
    dialog.append(head,body,footer)
    dialog.addEventListener("cancel",event=>{event.preventDefault();this.closeCardEditor()})
    const ready=()=>{
      if(this.cardEditor!==dialog)return
      const messageId=String(this.ctx.dom.getMessageId?.(host)||"")
      if(this.disposed||this.chatId!==chatId||String(this.ctx.getActiveChat?.()?.chatId||"")!==chatId||!host.isConnected||this.cardIdentity(host,messageId,this.currentCardSwipe(messageId))!==key){
        status.textContent="The source card changed. Close and reopen its Atelier.";retry.hidden=true;return
      }
      const group=castLibraryForChat(this.library,chatId),packet=String(host.dataset.ssCastKey||"").toLowerCase(),wardrobe=castKey(host.dataset.ssCastWardrobe)||"",current=this.cardMember(packet,group,wardrobe)
      if(!current||current.id!==member.id){status.textContent="The member changed. Close and reopen its Atelier.";retry.hidden=true;return}
      const expression=wardrobe?castResolveWardrobe(group,packet,wardrobe)?.assetKey||"":packet.startsWith(current.prefix.toLowerCase()+"-")?packet.slice(current.prefix.length+1):current.defaultExpression
      this.openCardEditor(host,current,group,expression,key)
    }
    document.body.append(dialog);this.cardEditor=dialog;this.cardLoadNotice={status,retry,ready};dialog.showModal()
    if(!this.cardLoadTimer&&!this.cardLoadRetry)this.requestCardOverrides(0)
    else this.paintCardLoadNotice()
  }
  private paintCardLoadNotice():void {
    const notice=this.cardLoadNotice;if(!notice)return
    const busy=!!(this.cardLoadTimer||this.cardLoadRetry)
    notice.status.textContent=busy?"Loading saved member and card preferences…":this.cardLoadError||"Atelier preferences are not available."
    notice.retry.disabled=busy
  }
  private clearCardLoad():void {
    if(this.cardLoadTimer)window.clearTimeout(this.cardLoadTimer)
    if(this.cardLoadRetry)window.clearTimeout(this.cardLoadRetry)
    this.cardLoadTimer=0;this.cardLoadRetry=0;this.cardLoadId=""
  }
  private requestCardOverrides(attempt:number):void {
    this.clearCardLoad();this.cardLoadError=""
    if(this.disposed||!castKey(this.chatId)||String(this.ctx.getActiveChat?.()?.chatId||"")!==this.chatId){this.cardLoadError="The active chat changed. Close and reopen its Atelier.";this.paintCardLoadNotice();return}
    const requestId=createRequestId(),chatId=this.chatId;this.cardLoadId=requestId
    this.cardLoadTimer=window.setTimeout(()=>{if(this.cardLoadId!==requestId)return;this.clearCardLoad();this.cardLoadError="Atelier preferences were not returned. Retry to load them.";this.paintCardLoadNotice()},5000)
    this.cardLoadAttempt=attempt;this.paintCardLoadNotice()
    try{this.ctx.sendToBackend({type:"load_cast_card_overrides",requestId,chatId})}catch(error){this.failCardLoad(String(error),attempt)}
  }
  private cardLoadAttempt=0
  private failCardLoad(error:string,attempt:number):void {
    this.clearCardLoad();this.cardLoadError=error||"Could not load Atelier preferences."
    // Host updates its local chat before the asynchronous activeChatId setting.
    // Only retry this read, never a write, and never switch the requested chat.
    const chatId=this.chatId
    if(/active chat changed/i.test(error)&&attempt<3&&!this.disposed&&String(this.ctx.getActiveChat?.()?.chatId||"")===chatId){
      this.cardLoadRetry=window.setTimeout(()=>{this.cardLoadRetry=0;if(this.chatId===chatId)this.requestCardOverrides(attempt+1)},[250,750,1500][attempt])
    }
    this.paintCardLoadNotice()
  }
  private readonly closeQuickOnPointer=(event:PointerEvent):void=>{if(this.quickMenu&&!this.quickMenu.contains(event.target as Node))this.closeQuickMenu()}
  private readonly closeQuickOnKey=(event:KeyboardEvent):void=>{if(event.key==="Escape"&&this.quickMenu){event.preventDefault();this.closeQuickMenu()}}
  private closeQuickMenu():void{this.quickMenu?.remove();this.quickMenu=null;this.quickMemberId="";this.quickSaving="";this.quickSaveKind="";this.quickCropFlush=null}
  private openQuickMenu(member: StudioCastMember, x:number, y:number, library:StudioCastLibrary, expression = ""): void {
    this.closeQuickMenu()
    this.quickMemberId=member.id
    const menu=document.createElement("section")
    menu.className="ss-cast-quick-picker"; menu.setAttribute("role","dialog");applyAppearanceVariables(menu,storedStudioAppearance())
    menu.setAttribute("aria-label","Cast presentation and crop quick picker")
    const header=document.createElement("header")
    const title=document.createElement("strong");title.textContent="Change " + member.name + "’s look"
    const close=document.createElement("button");close.type="button";close.className="ss-cast-quick-close";close.textContent="×";close.setAttribute("aria-label","Close Cast picker")
    close.addEventListener("click",()=>this.closeQuickMenu())
    header.append(title,close)
    const tabs=document.createElement("div");tabs.className="ss-cast-quick-tabs";tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Cast editor sections")
    const looksTab=document.createElement("button"),cropTab=document.createElement("button")
    for(const [tab,id,label] of [[looksTab,"looks","Looks"],[cropTab,"crop","Crop"]] as const){
      tab.type="button";tab.className="ss-cast-quick-tab";tab.dataset.castQuickTab=id;tab.id="ss-cast-quick-"+id
      tab.textContent=label;tab.setAttribute("role","tab");tab.setAttribute("aria-controls","ss-cast-quick-panel-"+id)
      tabs.append(tab)
    }
    const looks=document.createElement("div");looks.className="ss-cast-quick-panel ss-cast-quick-looks"
    looks.id="ss-cast-quick-panel-looks";looks.setAttribute("role","tabpanel");looks.setAttribute("aria-labelledby",looksTab.id)
    const hint=document.createElement("p");hint.textContent="All expressions · saved to Cast"
    const filter=document.createElement("select");filter.setAttribute("aria-label","Composition")
    const choices=[{id:"all",name:"All looks"},{id:"legacy",name:"Original Cast"},...CAST_COMPOSITIONS]
    for (const choice of choices) {const option=document.createElement("option");option.value=choice.id;option.textContent=choice.name;filter.append(option)}
    const search=document.createElement("input");search.type="search";search.placeholder="Find a look…";search.setAttribute("aria-label","Find a presentation");search.hidden=true
    const filterRow=document.createElement("div");filterRow.className="ss-cast-quick-filter-row"
    const searchToggle=document.createElement("button");searchToggle.type="button";searchToggle.className="ss-cast-quick-search-toggle";searchToggle.setAttribute("aria-label","Search looks");searchToggle.setAttribute("aria-expanded","false")
    searchToggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>'
    filterRow.append(filter,searchToggle)
    searchToggle.addEventListener("click",()=>{
      const open=search.hidden;search.hidden=!open;searchToggle.setAttribute("aria-expanded",String(open))
      if(open)search.focus({preventScroll:true});else{search.value="";populate()}
      place()
    })
    const list=document.createElement("div");list.className="ss-cast-quick-list";list.setAttribute("role","group");list.setAttribute("aria-label","Presentation choices")
    const position=document.createElement("div");position.className="ss-cast-quick-position";position.setAttribute("role","group");position.setAttribute("aria-label","Member stage position")
    const positionLabel=document.createElement("span");positionLabel.textContent="Stage position"
    const positionChoices=document.createElement("div");positionChoices.className="ss-cast-quick-position-choices"
    for(const [side,name] of [["auto","Auto"],["left","Left"],["right","Right"]] as const){
      const button=document.createElement("button");button.type="button";button.dataset.castQuickSide=side;button.textContent=name
      button.setAttribute("aria-pressed",String(member.presentationSide===side))
      button.addEventListener("click",()=>{
        if(this.quickSaving || button.getAttribute("aria-pressed")==="true")return
        this.quickSaveKind="side";this.quickSaving=createRequestId();footer.textContent="Saving stage position…"
        this.ctx.sendToBackend({type:"set_cast_side",requestId:this.quickSaving,memberId:member.id,side})
      })
      positionChoices.append(button)
    }
    position.append(positionLabel,positionChoices)
    looks.append(hint,filterRow,search,position,list)
    const cropPanel=document.createElement("div");cropPanel.className="ss-cast-quick-panel ss-cast-quick-crop"
    cropPanel.id="ss-cast-quick-panel-crop";cropPanel.setAttribute("role","tabpanel");cropPanel.setAttribute("aria-labelledby",cropTab.id)
    const crop={enabled:member.crop?.enabled===true,x:member.crop?.x??50,y:member.crop?.y??20,zoom:member.crop?.zoom??1}
    const saved={...crop}
    const assetNames=Object.keys(member.images).sort()
    let currentExpression=assetNames.includes(expression)?expression:assetNames.includes(member.defaultExpression)?member.defaultExpression:assetNames[0]||""
    const expressionSelect=document.createElement("select");expressionSelect.setAttribute("aria-label","Preview expression (shared crop only)")
    for(const label of assetNames){const option=document.createElement("option");option.value=label;option.textContent=label.replace(/[-_]/g," ");expressionSelect.append(option)}
    expressionSelect.value=currentExpression
    const label=document.createElement("label");label.className="ss-cast-quick-toggle"
    const toggle=document.createElement("input");toggle.type="checkbox";toggle.checked=crop.enabled;toggle.setAttribute("aria-label","Enable shared crop")
    const labelText=document.createElement("span");labelText.textContent="Enable shared crop";label.append(toggle,labelText)
    const well=document.createElement("div");well.className="ss-cast-quick-crop-well";well.setAttribute("aria-label","Drag to reposition expression")
    const image=document.createElement("img");image.alt="Expression crop preview";image.draggable=false
    const guide=document.createElement("small");guide.textContent="DRAG TO POSITION"
    well.append(image,guide)
    const fields=document.createElement("div");fields.className="ss-cast-quick-crop-fields"
    const controls=new Map<string,{input:HTMLInputElement;output:HTMLOutputElement}>()
    for(const [key,name,min,max,step] of [["x","Horizontal",0,100,1],["y","Vertical",0,100,1],["zoom","Zoom",1,3,.05]] as const){
      const row=document.createElement("label");row.className="ss-cast-quick-crop-field"
      const head=document.createElement("span"),text=document.createElement("span"),out=document.createElement("output")
      text.textContent=name;head.append(text,out)
      const input=document.createElement("input");input.type="range";input.min=String(min);input.max=String(max);input.step=String(step)
      input.setAttribute("aria-label",name+" crop");row.append(head,input);fields.append(row)
      controls.set(key,{input,output:out})
    }
    const actions=document.createElement("div");actions.className="ss-cast-quick-crop-actions"
    const reset=document.createElement("button");reset.type="button";reset.className="ss-cast-quick-reset";reset.textContent="Reset framing"
    actions.append(reset)
    const note=document.createElement("p");note.textContent="Shared with Studio · full transparent standees are unchanged."
    if(assetNames.length>1)cropPanel.append(expressionSelect)
    cropPanel.append(label,well,fields,actions,note)
    const footer=document.createElement("p");footer.className="ss-cast-quick-status";footer.setAttribute("role","status")
    const openMember=document.createElement("button");openMember.type="button";openMember.className="ss-cast-quick-open-member"
    openMember.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 7h7l2 3h9v10H3zM3 7V4h7l2 3"/><path d="m14 15 4-4m-4 0h4v4"/></svg>'
    openMember.append(document.createTextNode("Open "+member.name+" in Cast"))
    openMember.addEventListener("click",()=>{this.closeQuickMenu();this.openCastMember?.(member.id)})
    const bottom=document.createElement("div");bottom.className="ss-cast-quick-bottom";bottom.append(openMember,footer)
    const selected=member.presentation === "inherit" ? library.groups.find(g=>g.id===member.groupId)?.defaultPresentation||"story" : member.presentation
    const existing=CAST_PRESENTATION_INDEX.get(selected)
    this.quickFilter=existing?.composition || "all";filter.value=this.quickFilter
    const populate=()=>{
      list.replaceChildren()
      const all=[...(["sticker","portrait"] as const).map(id=>({id,name:id==="sticker"?"Sticker":"Portrait",composition:"legacy"})),
        ...CAST_PRESENTATION_ENTRIES.map(entry=>({id:entry.id,name:entry.name,composition:entry.composition}))]
      const matching=all.filter(entry=>(filter.value==="all" || entry.composition===filter.value) && entry.name.toLowerCase().includes(search.value.toLowerCase().trim()))
      const addRow=(name:string, style:string, chosen:boolean)=>{
        const button=document.createElement("button");button.type="button";button.className="ss-cast-quick-choice";button.dataset.castQuickStyle=style
        if(chosen)button.setAttribute("aria-current","true")
        const mark=document.createElement("span");mark.className="ss-cast-quick-check";mark.textContent=chosen?"✓":"·"
        const label=document.createElement("span");label.textContent=name
        button.append(mark,label);button.addEventListener("click",()=>{
          if(this.quickSaving)return
          this.quickSaveKind="presentation";this.quickSaving=createRequestId();footer.textContent="Saving presentation…"
          this.ctx.sendToBackend({type:"set_cast_presentation",requestId:this.quickSaving,memberId:member.id,presentation:style})
        });list.append(button)
      }
      if(!search.value.trim())addRow("Follow cast default","inherit",member.presentation==="inherit")
      for (const entry of matching) addRow(entry.name,entry.id,member.presentation===entry.id)
      if(!matching.length){const empty=document.createElement("p");empty.textContent="No matching looks";list.append(empty)}
    }
    const paintCrop=()=>{
      const item=member.images[currentExpression]
      const imageUrl=item?.url|| (item?.id?`/api/v1/images/${encodeURIComponent(item.id)}`:"")
      // Position changes must never reassign src and reload the art.
      if(image.getAttribute("src")!==imageUrl && imageUrl)image.setAttribute("src",imageUrl)
      if(!imageUrl)image.removeAttribute("src")
      image.hidden=!item
      guide.textContent=item?(crop.enabled?"DRAG TO POSITION":"ENABLE CROP TO DRAG"):"NO EXPRESSION ART SAVED"
      well.style.setProperty("--cast-quick-x",crop.x+"%")
      well.style.setProperty("--cast-quick-y",crop.y+"%")
      well.style.setProperty("--cast-quick-zoom",String(crop.enabled?crop.zoom:1))
      well.dataset.enabled=String(crop.enabled)
      for(const [key,{input,output}] of controls){
        const value=crop[key as "x"|"y"|"zoom"]
        input.value=String(value);input.disabled=!crop.enabled
        output.textContent=key==="zoom"?Number(value).toFixed(2)+"×":value+"%"
      }
      toggle.checked=crop.enabled
    }
    const saveCrop=()=>{
      if(!this.quickMenu || this.quickMemberId!==member.id)return
      if(this.quickSaving)return
      if(saved.enabled===crop.enabled&&saved.x===crop.x&&saved.y===crop.y&&saved.zoom===crop.zoom)return
      Object.assign(saved,crop)
      this.quickSaving=createRequestId();this.quickSaveKind="crop";footer.textContent="Saving crop…"
      this.ctx.sendToBackend({type:"set_cast_crop",requestId:this.quickSaving,memberId:member.id,crop:{...crop}})
    }
    this.quickCropFlush=saveCrop
    expressionSelect.addEventListener("change",()=>{currentExpression=expressionSelect.value;paintCrop()})
    toggle.addEventListener("change",()=>{crop.enabled=toggle.checked;paintCrop();saveCrop()})
    for(const [key,{input}] of controls){
      input.addEventListener("input",()=>{crop[key as "x"|"y"|"zoom"]=Number(input.value);paintCrop()})
      input.addEventListener("change",saveCrop)
      input.addEventListener("pointerup",saveCrop)
      input.addEventListener("blur",saveCrop)
    }
    reset.addEventListener("click",()=>{Object.assign(crop,{enabled:false,x:50,y:20,zoom:1});paintCrop();saveCrop()})
    let drag:{pointerId:number;x:number;y:number;cropX:number;cropY:number}|null=null
    well.addEventListener("pointerdown",event=>{
      if(!crop.enabled||!image.src)return
      drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY,cropX:crop.x,cropY:crop.y}
      well.setPointerCapture(event.pointerId);event.preventDefault()
    })
    well.addEventListener("pointermove",event=>{
      if(!drag||drag.pointerId!==event.pointerId)return
      const rect=well.getBoundingClientRect()
      crop.x=Math.max(0,Math.min(100,Math.round(drag.cropX-(event.clientX-drag.x)*100/Math.max(rect.width,1))))
      crop.y=Math.max(0,Math.min(100,Math.round(drag.cropY-(event.clientY-drag.y)*100/Math.max(rect.height,1))))
      paintCrop()
    })
    const endDrag=(event:PointerEvent)=>{if(!drag||drag.pointerId!==event.pointerId)return;drag=null;saveCrop()}
    well.addEventListener("pointerup",endDrag);well.addEventListener("pointercancel",endDrag)
    const place=()=>{
      if(!menu.isConnected)return
      const width=menu.offsetWidth,height=menu.offsetHeight
      menu.style.left=Math.max(8,Math.min(x,window.innerWidth-width-8))+"px"
      menu.style.top=Math.max(8,Math.min(y,window.innerHeight-height-8))+"px"
    }
    const activate=(tab:"looks"|"crop")=>{
      for(const [name,button,panel] of [["looks",looksTab,looks],["crop",cropTab,cropPanel]] as const){
        const active=name===tab;button.setAttribute("aria-selected",String(active));button.tabIndex=active?0:-1;panel.hidden=!active
      }
      if(tab==="crop")paintCrop()
      place() // Re-clamp if Crop grows taller than Looks near the viewport edge.
    }
    looksTab.addEventListener("click",()=>activate("looks"));cropTab.addEventListener("click",()=>activate("crop"))
    tabs.addEventListener("keydown",event=>{
      if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return
      event.preventDefault();const next=looksTab.getAttribute("aria-selected")==="true"?"crop":"looks"
      activate(next);(next==="looks"?looksTab:cropTab).focus({preventScroll:true})
    })
    filter.addEventListener("change",populate);search.addEventListener("input",populate)
    menu.append(header,tabs,looks,cropPanel,bottom)
    document.body.append(menu);this.quickMenu=menu
    activate("looks");populate();paintCrop()
    // The menu is a document-level overlay, never part of the narrative DOM.
    place()
    // Never summon the mobile keyboard until the magnifier is tapped.
  }

  constructor(private ctx:FrontendContext, private readonly openCastMember?: (memberId:string)=>void) {
    this.chatId=String(ctx.getActiveChat?.()?.chatId||"")
    if (typeof ctx.dom?.listMessageElements!=="function") return
    const off=ctx.onBackendMessage((payload:any)=>{
      if(this.cardLoadId&&payload?.requestId===this.cardLoadId){
        if(payload.type==="cast_card_overrides_result"&&payload.chatId===this.chatId){
          this.clearCardLoad();this.cardLoadError="";this.cardOverrides=cleanCastCardOverrides(payload.data);this.memberPreferences=cleanCastMemberPreferences(payload.preferences);this.cardLoaded=true;this.libraryRevision++;this.schedule()
          this.cardLoadNotice?.ready()
        }else if(payload.type==="studio_error")this.failCardLoad(String(payload.error||"Could not load Atelier preferences."),this.cardLoadAttempt)
      }
      if(this.cardSave&&payload?.requestId===this.cardSave.requestId){
        const pending=this.cardSave;window.clearTimeout(pending.timer);this.cardSave=null
        let confirmed=false
        if(this.chatId===pending.chatId&&payload.chatId===pending.chatId){
          if(pending.scope==="card"&&payload.type==="cast_card_override_result"&&payload.key===pending.key){
            const next=cleanCastCardOverride(payload.override)
            delete this.cardOverrides[pending.key]
            if(next)this.cardOverrides[pending.key]=next
            this.cardOverrides=cleanCastCardOverrides(this.cardOverrides);confirmed=true
          }else if(pending.scope==="member"&&payload.type==="cast_member_preference_result"&&payload.memberId===pending.memberId){
            this.memberPreferences[pending.memberId]=cleanCastMemberPreference(payload.preference);confirmed=true
          }
          if(confirmed){this.libraryRevision++;this.schedule()}
        }
        if(this.cardEditor===pending.dialog)pending.done(confirmed?undefined:String(payload.error||"Could not save settings"))

      }
      if(payload?.type==="cast_member_preference_changed"&&castKey(payload.memberId)){
        this.memberPreferences[payload.memberId]=cleanCastMemberPreference(payload.preference);this.libraryRevision++;this.schedule()
      }
      if(payload?.type==="cast_result"&&payload.requestId===this.loadId) this.setLibrary(payload.data)
      if(payload?.type==="cast_library_changed")this.setLibrary(payload.library)
      if(this.quickSaving&&payload?.requestId===this.quickSaving){
        const kind=this.quickSaveKind
        if(payload.type==="cast_result"){
          if(kind==="presentation")this.closeQuickMenu()
          else if(kind==="side"){
            this.quickSaving="";this.quickSaveKind=""
            const updated=cleanCastLibrary(payload.data).members.find(item=>item.id===this.quickMemberId)
            if(updated){
              const position=this.quickMenu?.querySelector<HTMLElement>(".ss-cast-quick-position")
              for(const button of position?.querySelectorAll<HTMLButtonElement>("[data-cast-quick-side]")||[])button.setAttribute("aria-pressed",String(button.dataset.castQuickSide===updated.presentationSide))
            }
            const status=this.quickMenu?.querySelector<HTMLElement>(".ss-cast-quick-status")
            if(status)status.textContent="Stage position saved"
          }
          else{
            this.quickSaving="";this.quickSaveKind=""
            const status=this.quickMenu?.querySelector<HTMLElement>(".ss-cast-quick-status")
            if(status)status.textContent="Crop saved to Cast"
            this.quickCropFlush?.()
          }
        } else if(payload.type==="studio_error"){
          this.quickSaving="";this.quickSaveKind=""
          const status=this.quickMenu?.querySelector<HTMLElement>(".ss-cast-quick-status")
          if(status)status.textContent=String(payload.error||"Could not save Cast settings")
        }
      }
      if(payload?.type==="cast_chat_changed"&&String(this.ctx.getActiveChat?.()?.chatId||"")!==this.chatId)this.reload()
    })
    if(typeof off==="function")this.cleanups.push(off)
    for(const name of ["CHAT_SWITCHED","MESSAGE_EDITED","MESSAGE_SWIPED","SWIPE_EDITED","CHARACTER_MESSAGE_RENDERED","GENERATION_STARTED","GENERATION_TOKEN","STREAM_TOKEN_RECEIVED","GENERATION_ENDED","GENERATION_STOPPED"]){
      const unsub=ctx.events?.on?.(name,(payload:any)=>{if(name==="STREAM_TOKEN_RECEIVED"&&(payload?.type==="reasoning"||payload?.chatId!==this.chatId))return;if(name==="CHAT_SWITCHED"){if(String(this.ctx.getActiveChat?.()?.chatId||"")!==this.chatId)this.reload()}else{if(["MESSAGE_EDITED","MESSAGE_SWIPED","SWIPE_EDITED"].includes(name))this.closeCardEditor();this.schedule()}})
      if(typeof unsub==="function")this.cleanups.push(unsub)
    }
    // React owns the source. Direction marker or slot changes can alter later
    // cards, even when the later cards' packet identities do not change.
    this.observer=new MutationObserver(records=>{
      const selector="[data-ss-cast-slot],[data-ss-stage-cue]"
      if(records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1 && ((node as Element).matches?.(selector) || (node as Element).querySelector?.(selector)))))this.schedule()
    })
    this.observer.observe(document.body,{subtree:true,childList:true})
    document.addEventListener("contextmenu",this.onQuickContext,true)
    document.addEventListener("pointerdown",this.closeQuickOnPointer,true)
    document.addEventListener("keydown",this.closeQuickOnKey,true)
    this.cleanups.push(()=>{
      document.removeEventListener("contextmenu",this.onQuickContext,true)
      document.removeEventListener("pointerdown",this.closeQuickOnPointer,true)
      document.removeEventListener("keydown",this.closeQuickOnKey,true)
    })
    this.reload()
  }
  private reload():void{
    this.closeQuickMenu();this.closeCardEditor()
    if(this.cardSave){window.clearTimeout(this.cardSave.timer);this.cardSave=null}
    this.clearCardLoad();this.cardLoadError="";this.cardLoaded=false;this.cardOverrides=Object.create(null);this.memberPreferences=Object.create(null)
    this.chatId=String(this.ctx.getActiveChat?.()?.chatId||"")
    this.library=cleanCastLibrary(null);this.librarySignature=""
    this.loadId=createRequestId()
    this.ctx.sendToBackend({type:"load_cast_library",requestId:this.loadId})
    if(castKey(this.chatId))this.requestCardOverrides(0)
    this.schedule()
  }
  theaterScene(chatId:string,key:string):{id:string;url:string;key:string;name:string}|undefined {
    const library=castLibraryForChat(this.library,chatId),bg=library.groups.find(g=>g.id===library.activeGroupId)?.backgrounds.find(b=>b.key===key||b.aliases.includes(key));return bg?{id:bg.id,key:bg.key,name:bg.name,url:`/api/v1/images/${encodeURIComponent(bg.id)}`}:undefined
  }
  theaterAtmosphere(chatId:string):CastAtmosphereSettings {
    const library=castLibraryForChat(this.library,chatId);return cleanCastAtmosphereSettings(library.groups.find(group=>group.id===library.activeGroupId)?.atmosphere)
  }
  private setLibrary(raw:unknown):void{
    const next=cleanCastLibrary(raw),sig=JSON.stringify(next)
    if(sig===this.librarySignature)return
    this.librarySignature=sig;this.library=next;this.libraryRevision++
    this.schedule()
  }
  private schedule=():void=>{
    if(this.disposed||this.queued)return
    this.queued=true
    this.frame=requestAnimationFrame(()=>{this.queued=false;this.frame=0;if(!this.disposed)this.hydrate()})
  }
  private hydrate():void{
    const group=castLibraryForChat(this.library,this.chatId)
    const recent=this.recentCardMessages()
    const localRecent=recent.filter((m:any)=>!m.chat_id||m.chat_id===this.chatId)
    const meta=new Map<string,any>(localRecent.map((m:any)=>[m.id,m]))
    const rows=(this.ctx.dom.listMessageElements() as {messageId:string;element:Element}[]).filter(r=>r.element.isConnected)
    const mounted=new Map(rows.map(r=>[r.messageId,r.element]))
    const ordered=this.ctx.messages?.listMessageIds?.()||[]
    const order=ordered.length?ordered:rows.map(r=>r.messageId)
    // Rebuild direction from the selected message order on every hydration.
    // A virtualized row may be recovered from available canonical history;
    // an unknown gap clears state rather than leaking a later scene backward.
    let direction=stageSceneState()
    for(const messageId of order){
      const message=meta.get(messageId),element=mounted.get(messageId)
      if(!element){if(message?.is_user===false&&typeof message.content==='string')stageSceneHistory(direction,message.content);else if(!message||message.is_user!==true)direction=stageSceneState();continue}
      const swipe=message?.swipe_id
      const source=theaterContentRoot(element)||element
      for(const host of source.querySelectorAll<HTMLElement>("[data-ss-cast-slot='1'],span[data-ss-stage-cue]")){
        if(host.hasAttribute('data-ss-stage-cue')){if(message?.is_user!==true&&!host.closest('pre,code,blockquote,[data-lumiverse-html-island]')){const cue=stageCueDecode(host.dataset.ssStageCue||'');if(cue)stageSceneCue(direction,cue)}continue}
        stageSceneAdvance(direction,castKey(host.dataset.ssCastBackground).toLowerCase(),castAtmosphereKey(host.dataset.ssCastAtmosphere))
        this.stageDirections.set(host,{...direction})
        const key=host.dataset.ssCastKey||"",data=host.dataset.ssCastPacket||""
        if(!/^[\p{L}\p{N}_-]{1,130}$/u.test(key)||!data)continue
        const body=castDecodeIsland(data)
        if(!body)continue
        const explicitBackground=castKey(host.dataset.ssCastBackground)||""
        const background=explicitBackground||(direction.sceneDirected?direction.scene:"")
        const identity=this.cardIdentity(host,messageId,swipe),candidate=this.cardOverrides[identity]
        const member=this.cardMember(key.toLowerCase(),group,castKey(host.dataset.ssCastWardrobe))
        const local=candidate?.memberId===member?.id?candidate:undefined
        const preference=member?this.memberPreferences[member.id]:undefined
        const override=member&&preference?castMemberCardGeometry(member.id,preference,local?.expression):local
        const scoped=member?this.preferredLibrary(group,member.id,preference):group
        const signature=key+"|"+data+"|"+background+"|"+(host.dataset.ssCastAtmosphere||"")+"|"+(direction.lightingDirected?direction.lighting:"")+"|"+direction.sceneDirected+"|"+this.libraryRevision+"|"+group.activeGroupId+"|"+identity
        const previous=this.mounts.get(host)
        if(previous?.signature===signature)continue
        const html=this.renderCard(host,scoped,override)
        // No image in library? Keep the native fallback quotation readable.
        if(!html){
          // If an outfit was removed after hydration, reveal the original
          // readable quote rather than leaving stale artwork in its Shadow DOM.
          if(host.shadowRoot){const content=castIslandContent(host.shadowRoot);if(content.innerHTML!=="<slot></slot>")content.replaceChildren(document.createElement("slot"));this.mounts.set(host,{root:host.shadowRoot,content,signature})}
          continue
        }
        const root=host.shadowRoot||host.attachShadow({mode:"open"})
        castAttachIslandStyle(root)
        const content=previous?.content?.isConnected ? previous.content : castIslandContent(root)
        if(content.innerHTML!==html)content.innerHTML=html
        this.paintCardGeometry(content,override)
        const hydratedCard=content.querySelector<HTMLElement>("[data-swarm-cast]")
        if(hydratedCard&&member){
          hydratedCard.dataset.castMemberId=member.id
          if(!host.dataset.ssCastAtmosphere&&direction.lightingDirected)hydratedCard.dataset.castStageInheritedMood=direction.lighting
          else delete hydratedCard.dataset.castStageInheritedMood
          if(!explicitBackground&&direction.sceneDirected)hydratedCard.dataset.castStageInheritedScene=direction.scene
          else delete hydratedCard.dataset.castStageInheritedScene
          // Explicit scenery survives even if the chosen card is not a scene template.
          if(background&&background!=="none"){const castGroup=scoped.groups.find(item=>item.id===member.groupId);const bg=castGroup?.backgrounds.find(item=>item.key===background||item.aliases.includes(background))||(explicitBackground?castGroup?.backgrounds.find(item=>item.key===castGroup.defaultBackground):undefined);if(bg){hydratedCard.dataset.castSceneId=bg.id;hydratedCard.dataset.castSceneUrl=`/api/v1/images/${encodeURIComponent(bg.id)}`}}
        }
        // Lazy image loading keeps a many-expression message inexpensive.
        for(const image of content.querySelectorAll<HTMLImageElement>("img")){image.loading="lazy";image.decoding="async"}
        this.mounts.set(host,{root,content,signature})
      }
    }
  }
  destroy():void{
    this.disposed=true;this.clearCardLoad();this.observer?.disconnect();this.observer=null
    if(this.frame)cancelAnimationFrame(this.frame)
    this.closeQuickMenu();this.closeCardEditor()
    if(this.cardSave){window.clearTimeout(this.cardSave.timer);this.cardSave=null}
    for(const fn of this.cleanups.splice(0))try{fn()}catch{}
    // Do not mutate source text or any other extension's DOM on teardown.
  }
}
