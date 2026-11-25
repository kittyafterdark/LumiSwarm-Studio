type StudioCastPresentation = "story" | "sticker" | "portrait" | (string & {})
interface StudioCastBackground { key: string; name: string; id: string; aliases: string[] }
interface CastGenesisSettings {
  enabled: boolean
  pipeline: "basics" | "full"
  retention: "normal" | "final"
  approval: "auto" | "review"
  reference: "prompt" | "anima-neutral"
  limit: number
}
function cleanCastGenesisSettings(value: unknown): CastGenesisSettings {
  const raw=recipeRecord(value)
  return {enabled:raw.enabled===true,pipeline:raw.pipeline==="full"?"full":"basics",retention:raw.retention==="normal"?"normal":"final",approval:raw.approval==="review"?"review":"auto",reference:raw.reference==="anima-neutral"?"anima-neutral":"prompt",limit:raw.limit===2||raw.limit===3?raw.limit:1}
}
// A portable album recipe deliberately excludes live scene prompts, seeds,
// arbitrary workflow overrides, chat references and character/persona bindings.
interface CastRecipeStackItem extends StackPresetItem { trigger?: string; sourceUrl: string }
interface CastRenderRecipe {
  version: 1
  connectionId: string
  checkpoint: string
  family: ScenePromptFamily
  generation: StudioExpressionGeneration
  stack: CastRecipeStackItem[]
  appearance: string
  sidecarInstructions: string
  enhance: boolean
  background: { mode: "builtin" | "saved"; workflow: string; imageParam: string }
}
function cleanCastRenderRecipe(value: unknown): CastRenderRecipe | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  const raw=recipeRecord(value), bg=recipeRecord(raw.background)
  if(raw.version!==undefined&&raw.version!==1)return undefined
  const text=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):""
  const stack=new Map<string,CastRecipeStackItem>()
  for(const item of (Array.isArray(raw.stack)?raw.stack:[]).slice(0,64)){
    const row=recipeRecord(item), name=text(row.name,500)
    if(!name||/[<>\r\n]/.test(name))continue
    const weight=typeof row.weight==="number"&&Number.isFinite(row.weight)?Math.max(-10,Math.min(10,row.weight)):1
    stack.set(name.replace(/\\/g,"/").toLowerCase(),{name,title:text(row.title,200),weight,enabled:row.enabled!==false,useTrigger:row.useTrigger===true,trigger:text(row.trigger,1000),sourceUrl:""})
  }
  return {version:1,connectionId:text(raw.connectionId,200),checkpoint:text(raw.checkpoint,500),family:raw.family===undefined?"auto":cleanPromptFamily(raw.family),generation:cleanExpressionGeneration(raw.generation),stack:[...stack.values()],appearance:text(raw.appearance,4000),sidecarInstructions:text(raw.sidecarInstructions,4000),enhance:raw.enhance!==false,background:{mode:bg.mode==="saved"?"saved":"builtin",workflow:text(bg.workflow,500),imageParam:text(bg.imageParam,200)}}
}
function castRecipeGeneration(recipe:CastRenderRecipe):StudioExpressionGeneration {
  return cleanExpressionGeneration(recipe.generation)
}
function castRecipeTriggers(recipe:CastRenderRecipe|undefined):string {
  return [...new Set((recipe?.stack||[]).filter(item=>item.enabled&&item.useTrigger&&item.trigger).map(item=>item.trigger!))].join(", ")
}
type CastAtmosphereKey = "none" | "dawn" | "golden-hour" | "moonlight" | "overcast" | "rose" | "dream" | "memory" | "tension" | "custom"
interface CastAtmosphereSettings { enabled:boolean; intensity:number; actor:number; transitions:boolean; animations:boolean; colorA:string; colorB:string }
interface CastAtmospherePalette { key:CastAtmosphereKey; name:string; a:string; b:string; brightness:number; sceneBrightness:number; contrast:number; saturation:number; sepia:number; hue:number }
const CAST_ATMOSPHERES:readonly CastAtmospherePalette[] = [
 {key:"none",name:"Original",a:"#ffffff",b:"#ffffff",brightness:1,sceneBrightness:1,contrast:1,saturation:1,sepia:0,hue:0},
 {key:"dawn",name:"First light",a:"#ffbd94",b:"#a087c9",brightness:1.08,sceneBrightness:1.18,contrast:1.04,saturation:.94,sepia:.16,hue:-6},
 {key:"golden-hour",name:"Golden hour",a:"#ef9e45",b:"#734152",brightness:.98,sceneBrightness:1.06,contrast:1.13,saturation:1.08,sepia:.28,hue:-8},
 {key:"moonlight",name:"Moonlight",a:"#5068bc",b:"#19253e",brightness:.72,sceneBrightness:0.49,contrast:1.23,saturation:.8,sepia:.04,hue:8},
 {key:"overcast",name:"Overcast",a:"#7799a8",b:"#3c4a63",brightness:.88,sceneBrightness:0.85,contrast:0.9,saturation:.72,sepia:0,hue:3},
 {key:"rose",name:"Rosy glow",a:"#ffb4cc",b:"#be7ba8",brightness:1.05,sceneBrightness:1.08,contrast:0.94,saturation:1.06,sepia:.08,hue:-9},
 {key:"dream",name:"Dreamscape",a:"#b4a0f2",b:"#5f9bb7",brightness:1.07,sceneBrightness:1.16,contrast:0.83,saturation:.82,sepia:.06,hue:6},
 {key:"memory",name:"Faded memory",a:"#d1b17e",b:"#705f52",brightness:.96,sceneBrightness:0.99,contrast:0.84,saturation:.65,sepia:.36,hue:0},
 {key:"tension",name:"Tension",a:"#783448",b:"#18182d",brightness:.72,sceneBrightness:0.54,contrast:1.3,saturation:.83,sepia:.06,hue:-5},
 {key:"custom",name:"Custom mix",a:"#b7a5ea",b:"#354768",brightness:.88,sceneBrightness:0.85,contrast:1.06,saturation:.9,sepia:.08,hue:0},
]
function cleanCastAtmosphereSettings(value:unknown):CastAtmosphereSettings {
 const raw=recipeRecord(value),pct=(v:unknown,fallback:number)=>typeof v==="number"&&Number.isFinite(v)?Math.round(Math.max(0,Math.min(100,v))):fallback
 const color=(v:unknown,fallback:string)=>typeof v==="string"&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():fallback
 return {enabled:raw.enabled===true,intensity:pct(raw.intensity,65),actor:pct(raw.actor,35),transitions:raw.transitions===true,animations:raw.animations===true,colorA:color(raw.colorA,"#b7a5ea"),colorB:color(raw.colorB,"#354768")}
}
function castAtmosphereKey(value:unknown):CastAtmosphereKey|"" {
 const key=typeof value==="string"?value.toLowerCase():""
 return CAST_ATMOSPHERES.find(item=>item.key===key)?.key||""
}
// A container-independent description: only trusted palette values, clamped
// percentages and numeric filter coefficients become CSS. No authored CSS.
function castAtmosphereVisual(key:unknown,settings:unknown):{key:CastAtmosphereKey;css:string;transitions:boolean;animations:boolean}|null {
 const prefs=cleanCastAtmosphereSettings(settings),palette=CAST_ATMOSPHERES.find(item=>item.key===castAtmosphereKey(key))
 if(!prefs.enabled||!palette||palette.key==="none"||prefs.intensity===0)return null
 const a=palette.key==="custom"?prefs.colorA:palette.a,b=palette.key==="custom"?prefs.colorB:palette.b
 const t=prefs.intensity/100,actor=t*prefs.actor/100,round=(n:number)=>Number(n.toFixed(4))
 const mix=(color:string,p:number)=>`color-mix(in srgb,${color} ${round(p*t)}%,transparent)`
 const css=`--cast-atmosphere-wash:linear-gradient(145deg,${mix(a,38)} 0%,${mix(a,10)} 48%,${mix(b,46)} 100%),linear-gradient(0deg,${mix(b,16)},${mix(a,8)});--cast-atmosphere-scene:brightness(${round(1+(palette.sceneBrightness-1)*t)}) contrast(${round(1+(palette.contrast-1)*t)}) saturate(${round(1+(palette.saturation-1)*t)});--cast-atmosphere-actor:brightness(${round(1+(palette.brightness-1)*actor)}) saturate(${round(1+(palette.saturation-1)*actor)}) sepia(${round(palette.sepia*actor)}) hue-rotate(${round(palette.hue*actor)}deg) contrast(${round(1+(palette.contrast-1)*actor*.65)});`
 return {key:palette.key,css,transitions:prefs.transitions,animations:prefs.animations}
}

interface StudioCastGroup {
  atmosphere?: CastAtmosphereSettings
  recipe?: CastRenderRecipe
  genesis?: CastGenesisSettings
  backgrounds: StudioCastBackground[]
  defaultBackground: string
  generateBackgrounds?: boolean
  id: string
  name: string
  description: string
  tone: string
  defaultPresentation: StudioCastPresentation
  inject: boolean
  openedAt: number
}
// Asset keys are stable historical identifiers. Wardrobes only map human-facing
// expression slots to those keys, so a move never renames or copies artwork.
interface StudioCastWardrobe {
  archived?: boolean
  key: string
  name: string
  outfitPrompt: string
  referenceImageId: string
  defaultExpression: string
  settings: StudioExpressionSet
  slots: Record<string,string>
  aliases: Record<string,string>
}
const CAST_WARDROBE_LIMIT=12
const CAST_WARDROBE_ASSET_LIMIT=CAST_WARDROBE_LIMIT*64
interface StudioCastMember {
  // Membership IDs remain local to a cast; this optional key links shared identity.
  registryId?: string
  preferredWardrobe?: string
  // Local to this membership, not the shared registry identity.
  hiddenWardrobes?: string[]
  wardrobes?: StudioCastWardrobe[]
  id: string
  groupId: string
  name: string
  prefix: string
  folderId: string
  identityPrompt: string
  referenceImageId: string
  sourceCharacterId: string
  crop: { enabled: boolean; x: number; y: number; zoom: number }
  defaultExpression: string
  role: "cast" | "persona"
  presentation: StudioCastPresentation | "inherit"
  presentationSide: "auto" | "left" | "right"
  settings: StudioExpressionSet
  images: Record<string, { id: string; url: string }>
}
interface StudioCastLibrary {
  version: 2
  activeGroupId: string
  chatGroups: Record<string, string>
  inject: boolean
  deployment: "prefixed" | "grouped"
  groups: StudioCastGroup[]
  members: StudioCastMember[]
  stash?: StudioCastMember[]
}
interface CastCardOverride {
  memberId: string
  expression: string
  scale: number
  x: number
  y: number
  width: number | null
  crop: StudioCastMember["crop"] | null
}
function cleanCastCardOverride(value: unknown): CastCardOverride | null {
  const raw=recipeRecord(value), memberId=castKey(raw.memberId)
  if(!memberId)return null
  const limit=(v:unknown,min:number,max:number,fallback:number)=>typeof v==="number"&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback
  const crop=raw.crop&&typeof raw.crop==="object"?recipeRecord(raw.crop):null
  return {memberId,expression:castKey(raw.expression).toLowerCase(),scale:limit(raw.scale,.75,1.5,1),x:limit(raw.x,-20,20,0),y:limit(raw.y,-15,15,0),width:raw.width==null?null:limit(raw.width,40,100,100),crop:crop?{enabled:crop.enabled===true,x:limit(crop.x,0,100,50),y:limit(crop.y,0,100,50),zoom:limit(crop.zoom,1,3,1)}:null}
}
function cleanCastCardOverrides(value:unknown):Record<string,CastCardOverride>{
  const result=Object.create(null) as Record<string,CastCardOverride>
  for(const [key,raw] of Object.entries(recipeRecord(value)).slice(-1000)){
    if(!/^[\p{L}\p{N}_-]{1,64}:[\d]{1,5}:[\d-]{1,12}:[a-z0-9]{1,7}:[a-z0-9]{1,7}$/u.test(key))continue
    const item=cleanCastCardOverride(raw);if(item)result[key]=item
  }
  return result
}
// User-owned presentation differences; the presence of an empty record is a
// migration marker that suppresses legacy per-card geometry for this member.
interface CastMemberPreference {
  presentation?: StudioCastMember["presentation"]
  side?: StudioCastMember["presentationSide"]
  scale?: number
  x?: number
  y?: number
  width?: number
  crop?: StudioCastMember["crop"]
}
function cleanCastMemberPreference(value: unknown): CastMemberPreference {
  const raw=recipeRecord(value), out:CastMemberPreference={}
  if(raw.presentation==="inherit"||raw.presentation==="story"||raw.presentation==="portrait"||raw.presentation==="sticker"||typeof raw.presentation==="string"&&CAST_PRESENTATION_INDEX.has(raw.presentation))out.presentation=raw.presentation as StudioCastMember["presentation"]
  if(raw.side==="auto"||raw.side==="left"||raw.side==="right")out.side=raw.side
  const geo=cleanCastCardOverride({...raw,memberId:"member"})!
  if(geo.scale!==1)out.scale=geo.scale
  if(geo.x!==0)out.x=geo.x
  if(geo.y!==0)out.y=geo.y
  if(geo.width!==null)out.width=geo.width
  if(geo.crop)out.crop=geo.crop
  return out
}
function cleanCastMemberPreferences(value:unknown):Record<string,CastMemberPreference>{
  const out=Object.create(null) as Record<string,CastMemberPreference>
  for(const [id,raw] of Object.entries(recipeRecord(value)))if(castKey(id)&&raw&&typeof raw==="object"&&!Array.isArray(raw))out[id]=cleanCastMemberPreference(raw)
  return out
}
function castMemberPreferenceDiff(value:unknown,member:StudioCastMember):CastMemberPreference{
  const pref=cleanCastMemberPreference(value)
  if(pref.presentation===member.presentation)delete pref.presentation
  if(pref.side===member.presentationSide)delete pref.side
  if(pref.crop&&JSON.stringify(pref.crop)===JSON.stringify(member.crop))delete pref.crop
  return pref
}
function castMemberCardGeometry(memberId:string,pref:CastMemberPreference,expression=""):CastCardOverride{
  return cleanCastCardOverride({...pref,memberId,expression})!
}
function castExpressionKey(value: string): string { return value.trim().replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 64) }
function castKey(value: unknown): string {
  return typeof value === "string" && /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,63}$/u.test(value) ? value : ""
}
function castPresentation(value: unknown, fallback: StudioCastPresentation = "story"): StudioCastPresentation {
  if(value === "vn-standee") return "overlap-console" // retired: preserve a valid VN-style replacement
  return typeof value === "string" && CAST_PRESENTATION_INDEX.has(value) ? value : value === "portrait" ? "portrait" : value === "sticker" || value === "inline" ? "sticker" : value === "story" || value === "card" ? "story" : fallback
}
function cleanCastBackgrounds(value: unknown): StudioCastBackground[] {
  const result: StudioCastBackground[] = []
  const items = Array.isArray(value) ? value.slice(0, 100) : []
  for (const item of items) {
    const key=castKey(item?.key).toLowerCase(), id=castKey(item?.id)
    if (!key || key === "none" || !id || result.some(bg=>bg.key===key)) continue
    result.push({key,id,name:String(item.name||key).slice(0,80),aliases:[]})
  }
  const reserved=new Set(result.map(bg=>bg.key))
  for (const bg of result) {
    const item=items.find(item=>castKey(item?.key).toLowerCase()===bg.key && castKey(item?.id)===bg.id)
    for (const rawAlias of Array.isArray(item?.aliases)?item.aliases.slice(0,32):[]) {
      const alias=castKey(rawAlias).toLowerCase()
      if (!alias || alias==="none" || reserved.has(alias)) continue
      bg.aliases.push(alias);reserved.add(alias)
    }
  }
  return result
}
function cleanCastWardrobes(value:unknown, member:Pick<StudioCastMember,"images"|"settings"|"defaultExpression"|"referenceImageId">):StudioCastWardrobe[] {
  const rows:StudioCastWardrobe[]=[], used=new Set<string>()
  const raw=Array.isArray(value)?value:[]
  // The default collection is always present, even in an empty album.
  const ordered=[raw.find(item=>item?.key==="default")||{key:"default",name:"Original outfit",referenceImageId:member.referenceImageId,settings:member.settings,defaultExpression:member.defaultExpression},...raw.filter(item=>item?.key!=="default")].slice(0,CAST_WARDROBE_LIMIT)
  for(const item of ordered){
    const key=castKey(item?.key).toLowerCase()
    if(!key||rows.some(row=>row.key===key))continue
    const slots=Object.create(null) as Record<string,string>
    for(const [label,asset] of Object.entries(recipeRecord(item.slots)).slice(0,64)){
      const slot=castKey(label).toLowerCase(),id=castKey(asset).toLowerCase()
      if(slot&&id&&Object.hasOwn(member.images,id)&&!used.has(id)&&!Object.hasOwn(slots,slot)){slots[slot]=id;used.add(id)}
    }
    const aliases=Object.create(null) as Record<string,string>
    for(const [label,asset] of Object.entries(recipeRecord(item.aliases)).slice(0,128)){
      const slot=castKey(label).toLowerCase(),id=castKey(asset).toLowerCase()
      if(slot&&Object.values(slots).includes(id)&&!Object.hasOwn(slots,slot))aliases[slot]=id
    }
    rows.push({key,...(key!=="default"&&item.archived===true?{archived:true}:{}),name:typeof item.name==="string"&&item.name.trim()?item.name.trim().slice(0,80):key,outfitPrompt:typeof item.outfitPrompt==="string"?item.outfitPrompt.slice(0,4000):"",referenceImageId:castKey(item.referenceImageId),defaultExpression:castKey(item.defaultExpression).toLowerCase()||"neutral",settings:cleanStudioExpressionSet(item.settings),slots,aliases})
  }
  const base=rows[0]
  // Migration/older producers may register a flat asset without a mapping.
  // Never discard it. Keep all unmapped legacy keys in the original collection.
  for(const id of Object.keys(member.images))if(!used.has(id)){
    let label=id,n=1
    while(Object.hasOwn(base.slots,label))label=`${id.slice(0,56)}-${n++}`
    base.slots[label]=id
  }
  for(const row of rows){
    if(!row.slots[row.defaultExpression])row.defaultExpression=row.slots.neutral?"neutral":Object.keys(row.slots)[0]||"neutral"
  }
  return rows
}
function castWardrobes(member:StudioCastMember):StudioCastWardrobe[]{return cleanCastWardrobes(member.wardrobes,member)}
// Keep unavailable rows in storage and historical packet resolution, never in new selection.
function castWardrobeAvailable(member:StudioCastMember,row:StudioCastWardrobe):boolean {
  return !row.archived&&(row.key==="default"||!member.hiddenWardrobes?.includes(row.key))
}
function castActiveWardrobes(member:StudioCastMember):StudioCastWardrobe[]{return castWardrobes(member).filter(row=>castWardrobeAvailable(member,row))}
function castWardrobeForAsset(member:StudioCastMember,asset:string):{wardrobe:StudioCastWardrobe;label:string}|undefined{
  for(const wardrobe of castWardrobes(member))for(const [label,key] of Object.entries(wardrobe.slots))if(key===asset)return {wardrobe,label}
}
interface CastNewWardrobe {name:string;outfit:string;mode:"fresh"|"settings"|"copy";inheritReference:boolean}
function castCreateWardrobe(member:StudioCastMember,sourceKey:string,request:CastNewWardrobe):{member:StudioCastMember;key:string}{
  const rows=castWardrobes(member),source=rows.find(row=>row.key===sourceKey),name=request.name.trim().slice(0,80),key=castExpressionKey(name).toLowerCase().slice(0,40)
  if(!source||!castWardrobeAvailable(member,source)||!name||!castKey(key)||rows.length>=CAST_WARDROBE_LIMIT||rows.some(row=>row.key===key))throw new Error("Choose a unique outfit name within the wardrobe limit.")
  const settings=request.mode==="fresh"?cleanStudioExpressionSet({slots:source.settings.slots.filter(slot=>!/-alt-\d+$/i.test(slot.label)),selected:source.settings.selected.filter(label=>!/-alt-\d+$/i.test(label))}):structuredClone(source.settings)
  if(settings.workshop)delete settings.workshop.overrides.outfit
  const images={...member.images}, slots:Record<string,string>=Object.create(null)
  if(request.mode==="copy")for(const [label,asset] of Object.entries(source.slots)){
    const stem=`w-${key.slice(0,20)}-${label.slice(0,36)}`;let physical=stem,n=1
    while(Object.hasOwn(images,physical))physical=`${stem.slice(0,56)}-${n++}`
    images[physical]={...member.images[asset]};slots[label]=physical
  }
  rows.push({key,name,outfitPrompt:request.outfit.slice(0,4000),referenceImageId:request.inheritReference?source.referenceImageId:"",defaultExpression:slots[source.defaultExpression]?source.defaultExpression:"neutral",settings,slots,aliases:{}})
  return {member:{...member,wardrobes:rows,images},key}
}
function castWardrobeView(member:StudioCastMember,key:string):StudioCastMember {
  const wardrobe=castWardrobes(member).find(item=>item.key===key)
  if(!wardrobe)throw new Error("That wardrobe is no longer available.")
  const {wardrobes:_,...base}=member
  return {...base,images:Object.fromEntries(Object.entries(wardrobe.slots).map(([label,id])=>[label,member.images[id]])),referenceImageId:wardrobe.referenceImageId,defaultExpression:wardrobe.defaultExpression,settings:structuredClone(wardrobe.settings)}
}
// Merge one workshop projection back into the current authoritative member.
// Preserve every unrelated outfit and every physical key that is still used.
function castMergeWardrobe(member:StudioCastMember,key:string,updated:StudioCastMember):StudioCastMember {
  if(!member.wardrobes&&key==="default")return {...member,images:updated.images,settings:updated.settings,referenceImageId:updated.referenceImageId,prefix:updated.prefix}
  const wardrobes=castWardrobes(member),wardrobe=wardrobes.find(item=>item.key===key)
  if(!wardrobe||!castWardrobeAvailable(member,wardrobe))throw new Error("That wardrobe was removed, hidden or archived while the workshop was open.")
  const entries=Object.entries(updated.images)
  if(entries.length>64)throw new Error("A wardrobe can hold up to 64 expressions.")
  const images=Object.assign(Object.create(null),member.images) as StudioCastMember["images"]
  const slots=Object.create(null) as Record<string,string>
  // Allocate against all old keys (even removed ones) during this operation.
  const reserved=new Set(Object.keys(images))
  for(const [label,image] of entries){
    if(!castKey(label)||!castKey(image.id))throw new Error("Invalid expression asset.")
    let physical=wardrobe.slots[label]
    if(!physical){
      const stem=key==="default"?label:`w-${key.slice(0,20)}-${label.slice(0,36)}`
      physical=stem;let suffix=1
      while(reserved.has(physical))physical=`${stem.slice(0,56)}-${suffix++}`
      reserved.add(physical)
    }
    slots[label]=physical;images[physical]=image
  }
  for(const asset of Object.values(wardrobe.slots))if(!Object.values(slots).includes(asset))delete images[asset]
  wardrobe.slots=slots;wardrobe.settings=cleanStudioExpressionSet(updated.settings);wardrobe.referenceImageId=castKey(updated.referenceImageId)
  if(!slots[wardrobe.defaultExpression])wardrobe.defaultExpression=slots.neutral?"neutral":Object.keys(slots)[0]||"neutral"
  const fallback=wardrobes[0]
  return {...member,wardrobes,images,defaultExpression:images[member.defaultExpression]?member.defaultExpression:fallback.slots[fallback.defaultExpression]||"neutral",referenceImageId:fallback.referenceImageId,settings:fallback.settings}
}
function castMoveWardrobeAssets(member:StudioCastMember,source:string,dest:string,moves:Record<string,string>):StudioCastWardrobe[]{
  const rows=castWardrobes(member),from=rows.find(row=>row.key===source),to=rows.find(row=>row.key===dest)
  if(!from||!to||!castWardrobeAvailable(member,from)||!castWardrobeAvailable(member,to)||from===to)throw new Error("Choose a different wardrobe.")
  const entries=Object.entries(moves),names=new Set<string>()
  if(!entries.length||Object.keys(to.slots).length+entries.length>64)throw new Error("Select expressions within the destination's 64-slot limit.")
  for(const [label,newLabel] of entries){
    if(!from.slots[label]||!castKey(newLabel)||Object.hasOwn(to.slots,newLabel)||names.has(newLabel))throw new Error("Expression names must be unique in the destination wardrobe.")
    names.add(newLabel)
  }
  for(const [label,newLabel] of entries){
    to.slots[newLabel]=from.slots[label];delete from.slots[label]
    const sourceDirection=from.settings.slots.find(slot=>castExpressionKey(slot.label).toLowerCase()===label)
    if(sourceDirection){
      to.settings.slots=to.settings.slots.filter(slot=>castExpressionKey(slot.label).toLowerCase()!==newLabel)
      to.settings.slots.push({...sourceDirection,label:newLabel})
    }
    if(from.settings.selected.includes(label)&&!to.settings.selected.includes(newLabel))to.settings.selected.push(newLabel)
    from.settings.slots=from.settings.slots.filter(slot=>castExpressionKey(slot.label).toLowerCase()!==label)
    from.settings.selected=from.settings.selected.filter(slot=>slot!==label)
    for(const [alias,asset] of Object.entries(from.aliases))if(asset===to.slots[newLabel])delete from.aliases[alias]
  }
  from.settings=cleanStudioExpressionSet(from.settings);to.settings=cleanStudioExpressionSet(to.settings)
  for(const row of [from,to])if(!row.slots[row.defaultExpression])row.defaultExpression=row.slots.neutral?"neutral":Object.keys(row.slots)[0]||"neutral"
  return rows
}
function cleanCastLibrary(value: unknown): StudioCastLibrary {
  const raw = recipeRecord(value)
  const groups: StudioCastGroup[] = []
  for (const item of Array.isArray(raw.groups) ? raw.groups.slice(0, 40) : []) {
    if (castKey(item?.id) && !groups.some(group => group.id === item.id)) groups.push({ backgrounds: cleanCastBackgrounds(item.backgrounds), defaultBackground: castKey(item.defaultBackground).toLowerCase(), generateBackgrounds: item.generateBackgrounds === true, ...(item.atmosphere!==undefined?{atmosphere:cleanCastAtmosphereSettings(item.atmosphere)}:{}), ...(item.genesis!==undefined?{genesis:cleanCastGenesisSettings(item.genesis)}:{}), ...(cleanCastRenderRecipe(item.recipe)?{recipe:cleanCastRenderRecipe(item.recipe)}:{}), id: item.id, name: String(item.name || "Untitled cast").slice(0, 80),
      description: typeof item.description === "string" ? item.description.slice(0, 180) : "", tone: /^#[\da-f]{6}$/i.test(item.tone) ? item.tone : "#513344",
      defaultPresentation: castPresentation(item.defaultPresentation), inject: typeof item.inject === "boolean" ? item.inject : raw.inject === true, openedAt: Number.isFinite(item.openedAt) ? Math.max(0, Number(item.openedAt)) : 0 })
  }
  for (const group of groups) if (!group.backgrounds.some(bg=>bg.key===group.defaultBackground)) group.defaultBackground=""
  const members: StudioCastMember[] = [], stash: StudioCastMember[] = []
  const memberRows=[...(Array.isArray(raw.members)?raw.members.slice(0,200).map(item=>({item,detached:false})):[]),...(Array.isArray(raw.stash)?raw.stash.slice(0,200).map(item=>({item,detached:true})):[])]
  for (const {item,detached} of memberRows) {
    if (!castKey(item?.id) || [...members,...stash].some(member => member.id === item.id) || (!detached&&!groups.some(group => group.id === item.groupId))) continue
    const destination=detached?stash:members
    const prefix = castKey(item.prefix)
    if (!prefix || (!detached&&members.some(member => member.groupId === item.groupId && member.prefix.toLowerCase() === prefix.toLowerCase()))) continue
    const images = Object.create(null) as StudioCastMember["images"]
    for (const [label, image] of Object.entries(recipeRecord(item.images)).slice(0, Array.isArray(item.wardrobes)?CAST_WARDROBE_ASSET_LIMIT:64)) {
      const record = recipeRecord(image), key = castExpressionKey(label).toLowerCase()
      if (castKey(key) && castKey(record.id)) images[key] = { id: record.id, url: `/api/v1/images/${encodeURIComponent(record.id)}` }
    }
    // R34 stored independent expression-side overrides. Only migrate a legacy
    // member when *every* saved expression agreed on the same side. A partial
    // or mixed set is ambiguous, so keep the preset's Auto composition.
    const oldSides = recipeRecord(item.expressionSides)
    const imageKeys = Object.keys(images)
    const uniformLegacySide = imageKeys.length && imageKeys.every(key => oldSides[key] === oldSides[imageKeys[0]])
      ? oldSides[imageKeys[0]] : null
    const presentationSide: StudioCastMember["presentationSide"] =
      item.presentationSide === "left" || item.presentationSide === "right" ? item.presentationSide
      : item.presentationSide === "auto" ? "auto"
      : uniformLegacySide === "left" || uniformLegacySide === "right" ? uniformLegacySide : "auto"
    destination.push({ id: item.id, groupId: detached?"":item.groupId, ...(castKey(item.registryId)&&item.registryId!==item.id?{registryId:castKey(item.registryId)}:{}), ...(castKey(item.preferredWardrobe)?{preferredWardrobe:castKey(item.preferredWardrobe).toLowerCase()}:{}), name: String(item.name || prefix).slice(0, 80), prefix,
      identityPrompt: typeof item.identityPrompt === "string" ? item.identityPrompt.slice(0, 4000) : "",
      folderId: typeof item.folderId === "string" ? item.folderId.slice(0, 120) : "", referenceImageId: castKey(item.referenceImageId), sourceCharacterId: castKey(item.sourceCharacterId),
      crop: { enabled: item.crop?.enabled === true, x: Number.isFinite(item.crop?.x) ? Math.min(100, Math.max(0, item.crop.x)) : 50, y: Number.isFinite(item.crop?.y) ? Math.min(100, Math.max(0, item.crop.y)) : 50, zoom: Math.min(3, Math.max(1, Number(item.crop?.zoom) || 1)) },
      defaultExpression: castKey(item.defaultExpression).toLowerCase() || "neutral", role: item.role === "persona" ? "persona" : "cast",
      presentation: item.presentation === "inherit" || !item.presentation ? "inherit" : castPresentation(item.presentation), presentationSide, settings: cleanStudioExpressionSet(item.settings), images })
    if(Array.isArray(item.wardrobes)){
      const member=destination[destination.length-1];member.wardrobes=cleanCastWardrobes(item.wardrobes,member)
      // Base member fields remain the legacy/default generation path.
      member.settings=member.wardrobes[0].settings;member.referenceImageId=member.wardrobes[0].referenceImageId
    }
    const member=destination[destination.length-1]
    // Normalize in wardrobe order and retain local hides even while globally archived.
    // Uncast identities have no local production preferences.
    if(!detached&&Array.isArray(item.hiddenWardrobes)&&member.wardrobes){
      const hidden=member.wardrobes.filter(row=>row.key!=="default"&&item.hiddenWardrobes.includes(row.key)).map(row=>row.key)
      if(hidden.length)member.hiddenWardrobes=hidden
    }
    if(member.preferredWardrobe&&!castActiveWardrobes(member).some(row=>row.key===member.preferredWardrobe))delete member.preferredWardrobe
  }
  const chatGroups = Object.create(null) as Record<string, string>
  for (const [chatId, groupId] of Object.entries(recipeRecord(raw.chatGroups)).slice(0, 2000)) {
    if (castKey(chatId) && (groupId === "" || groups.some(group => group.id === groupId))) chatGroups[chatId] = String(groupId)
  }
  return { version: 2, groups, members, ...(stash.length?{stash}:{}), chatGroups, deployment: raw.deployment === "grouped" ? "grouped" : "prefixed", activeGroupId: groups.some(group => group.id === raw.activeGroupId) ? raw.activeGroupId : "", inject: raw.inject === true }
}
// Materialized member projections retain the historical per-cast IDs and packet
// prefixes. All shared fields are reconciled under the library write lock.
function castRegistryKey(member:StudioCastMember):string {return member.registryId||member.id}
function castRegistryShared(member:StudioCastMember) {
  return {name:member.name,identityPrompt:member.identityPrompt,folderId:member.folderId,referenceImageId:member.referenceImageId,sourceCharacterId:member.sourceCharacterId,defaultExpression:member.defaultExpression,settings:member.settings,images:member.images,wardrobes:member.wardrobes}
}
function castRegistrySignature(member:StudioCastMember):string {return JSON.stringify(castRegistryShared(member))}
function castRegistryApply(member:StudioCastMember,source:StudioCastMember):StudioCastMember {
  const result={...member,...structuredClone(castRegistryShared(source))}
  if(!result.wardrobes)delete result.wardrobes
  if(result.preferredWardrobe&&!castActiveWardrobes(result).some(row=>row.key===result.preferredWardrobe))delete result.preferredWardrobe
  return result
}
function castRegistryEntries(library:StudioCastLibrary):StudioCastMember[]{
  const rows=new Map<string,StudioCastMember>()
  for(const member of [...library.members,...(library.stash||[])])if(!rows.has(castRegistryKey(member)))rows.set(castRegistryKey(member),member)
  return [...rows.values()]
}
function castRegistryReconcile(previous:StudioCastLibrary,next:StudioCastLibrary):StudioCastLibrary {
  const result=structuredClone(next),oldRows=[...previous.members,...(previous.stash||[])],oldById=new Map(oldRows.map(row=>[row.id,row]))
  const identities=new Map<string,StudioCastMember[]>()
  for(const member of result.members){const key=castRegistryKey(member),rows=identities.get(key)||[];if(rows.some(row=>row.groupId===member.groupId))throw new Error("A character can only be linked once in each cast.");rows.push(member);identities.set(key,rows)}
  for(const [key,rows] of identities){
    const old=oldRows.find(row=>castRegistryKey(row)===key)
    const changed=rows.filter(row=>{const prior=oldById.get(row.id);return prior&&castRegistryKey(prior)===key&&castRegistrySignature(prior)!==castRegistrySignature(row)})
    if(new Set(changed.map(castRegistrySignature)).size>1)throw new Error("Conflicting edits to a shared character. Reload Cast before saving.")
    const canonical=changed[0]||old||rows[0]
    // New memberships must be exact projections, not a covert overwrite of a
    // shared character. Explicit attach/merge constructs them server-side.
    for(const row of rows){const prior=oldById.get(row.id);if((!prior||castRegistryKey(prior)!==key)&&castRegistrySignature(row)!==castRegistrySignature(canonical))throw new Error("Shared character changed. Reload the library before linking.")}
    for(const row of rows)result.members[result.members.findIndex(member=>member.id===row.id)]=castRegistryApply(row,canonical)
  }
  // Removing an ensemble membership never destroys the last copy of its
  // identity. The uncast stash is deliberately excluded from prompt/render lookup.
  const stashed=new Map<string,StudioCastMember>()
  for(const row of [...(result.stash||[]),...oldRows]){
    const key=castRegistryKey(row)
    if(identities.has(key)||stashed.has(key)||result.members.some(member=>member.id===row.id))continue
    stashed.set(key,{...structuredClone(row),groupId:""})
  }
  if(stashed.size>200)throw new Error("The uncast character library is full. No characters were removed.")
  if(stashed.size)result.stash=[...stashed.values()];else delete result.stash
  return cleanCastLibrary(result)
}
// Existing memberships may only adopt an identity when every historical
// physical key and explicit wardrobe label/alias still resolves identically.
function castRegistryCompatible(target:StudioCastMember,source:StudioCastMember):boolean{
  if(Object.entries(target.images).some(([key,image])=>source.images[key]?.id!==image.id))return false
  if(target.images[target.defaultExpression]&&source.defaultExpression!==target.defaultExpression)return false
  const sourceRows=castWardrobes(source)
  return castWardrobes(target).every(row=>{const other=sourceRows.find(item=>item.key===row.key);return !!other&&Object.entries({...row.slots,...row.aliases}).every(([label,asset])=>source.images[other.slots[label]||other.aliases[label]]?.id===target.images[asset]?.id)&&(!row.slots[row.defaultExpression]||source.images[other.slots[other.defaultExpression]]?.id===target.images[row.slots[row.defaultExpression]]?.id)})
}
function castRegistryAttach(library:StudioCastLibrary,sourceId:string,groupId:string,id:string,mode:"link"|"fork",targetId=""):StudioCastLibrary{
  const next=structuredClone(library),source=[...next.members,...(next.stash||[])].find(row=>row.id===sourceId)
  if(!source||!next.groups.some(group=>group.id===groupId))throw new Error("Choose an available character and destination cast.")
  if(mode==="link"&&next.members.some(row=>row.groupId===groupId&&castRegistryKey(row)===castRegistryKey(source)))throw new Error("This character is already linked to that cast.")
  if(targetId){
    const target=next.members.find(row=>row.id===targetId&&row.groupId===groupId)
    if(mode!=="link"||!target||target.id===source.id||next.members.some(row=>row.id!==target.id&&castRegistryKey(row)===castRegistryKey(target))||!castRegistryCompatible(target,source))throw new Error("These characters have different historical expression mappings. Copy an outfit instead, or link as a separate member.")
    const replacement=castRegistryApply({...target,registryId:castRegistryKey(source)},source)
    next.members[next.members.indexOf(target)]=replacement
    return castRegistryReconcile(library,next)
  }
  if(next.members.length>=200||!castKey(id)||[...next.members,...(next.stash||[])].some(row=>row.id===id))throw new Error("The cast membership limit was reached or the new ID is unavailable.")
  const reserved=next.members.filter(row=>row.groupId===groupId).map(row=>row.prefix.toLowerCase())
  // A hyphen-suffixed duplicate could steal a historical expression packet
  // from the original member via the longest-prefix resolver.
  const overlaps=(prefix:string)=>reserved.some(key=>{const p=prefix.toLowerCase();return key===p||key.startsWith(p+"-")||p.startsWith(key+"-")})
  const stem=source.prefix.replace(/-/g,"_").slice(0,55)
  let prefix=source.prefix,n=2
  while(overlaps(prefix))prefix=`${stem}_${n++}`
  const member={...structuredClone(source),id,groupId,prefix,presentation:"inherit" as const,presentationSide:"auto" as const,crop:{enabled:false,x:50,y:50,zoom:1}}
  if(mode==="link")member.registryId=castRegistryKey(source);else delete member.registryId
  delete member.preferredWardrobe
  delete member.hiddenWardrobes
  next.members.push(member)
  return castRegistryReconcile(library,next)
}
function castRegistryCopyOutfit(library:StudioCastLibrary,sourceId:string,sourceKey:string,targetId:string,name:string):StudioCastLibrary{
  const next=structuredClone(library),source=[...next.members,...(next.stash||[])].find(row=>row.id===sourceId),target=next.members.find(row=>row.id===targetId)
  if(!source||!target||castRegistryKey(source)===castRegistryKey(target))throw new Error("Choose a different character to copy an outfit to.")
  const row=castWardrobes(source).find(row=>row.key===sourceKey),rows=castWardrobes(target),key=castExpressionKey(name).toLowerCase().slice(0,40)
  if(!row||row.archived||!castKey(key)||!name.trim()||rows.length>=CAST_WARDROBE_LIMIT||rows.some(row=>row.key===key))throw new Error("Choose a unique outfit name within the wardrobe limit.")
  const assets=new Map<string,string>(),slots:Record<string,string>=Object.create(null),aliases:Record<string,string>=Object.create(null)
  for(const [label,asset] of Object.entries(row.slots)){
    const stem=`w-${key.slice(0,20)}-${label.slice(0,36)}`;let physical=stem,n=1
    while(Object.hasOwn(target.images,physical))physical=`${stem.slice(0,56)}-${n++}`
    target.images[physical]=structuredClone(source.images[asset]);slots[label]=physical;assets.set(asset,physical)
  }
  for(const [alias,asset] of Object.entries(row.aliases)){const copied=assets.get(asset);if(copied)aliases[alias]=copied}
  target.wardrobes=[...rows,{...structuredClone(row),key,name:name.trim().slice(0,80),slots,aliases}]
  return castRegistryReconcile(library,next)
}
// Atomic lifecycle operation: hide/show changes one membership; archive/restore/remove changes shared fields.
// All historical keys survive archive/restore. Permanent removal removes only
// the selected row's physical asset mappings, never the underlying image files.
function castWardrobeLifecycle(library:StudioCastLibrary,memberId:string,key:string,action:string,replacement="default"):StudioCastLibrary{
  const next=structuredClone(library),member=next.members.find(row=>row.id===memberId)
  if(!member||key==="default"||!["archive","restore","remove","hide","unhide"].includes(action))throw new Error("Choose an additional outfit and a valid action.")
  const rows=castWardrobes(member),row=rows.find(item=>item.key===key)
  if(!row)throw new Error("This outfit no longer exists.")
  if(action==="hide"||action==="unhide"){
    const hidden=new Set(member.hiddenWardrobes||[])
    if(row.archived||hidden.has(key)===(action==="hide"))throw new Error("This outfit's visibility changed. Reopen its settings.")
    if(action==="hide"){
      if(!castActiveWardrobes(member).some(item=>item.key===replacement&&item.key!==key))throw new Error("Choose an available replacement starting outfit.")
      hidden.add(key)
      if(member.preferredWardrobe===key){if(replacement==="default")delete member.preferredWardrobe;else member.preferredWardrobe=replacement}
    }else hidden.delete(key)
    member.hiddenWardrobes=[...hidden]
    return castRegistryReconcile(library,next)
  }
  if(action==="archive"&&row.archived||action==="restore"&&!row.archived)throw new Error("This outfit's archive status changed. Reopen its settings.")
  if(action!=="restore"&&!rows.some(item=>item.key===replacement&&item.key!==key&&!item.archived))throw new Error("Choose an available replacement starting outfit.")
  if(action==="archive")row.archived=true
  else if(action==="restore")delete row.archived
  else {
    for(const asset of Object.values(row.slots))delete member.images[asset]
    if(!member.images[member.defaultExpression])member.defaultExpression=rows[0].slots[rows[0].defaultExpression]||"neutral"
  }
  member.wardrobes=action==="remove"?rows.filter(item=>item!==row):rows
  // Clear only starting hints that refer to this outfit, including siblings.
  if(action!=="restore")for(const sibling of next.members)if(castRegistryKey(sibling)===castRegistryKey(member)&&sibling.preferredWardrobe===key){
    if(replacement==="default"||sibling.hiddenWardrobes?.includes(replacement))delete sibling.preferredWardrobe;else sibling.preferredWardrobe=replacement
  }
  return castRegistryReconcile(library,next)
}
function castLibraryForChat(library: StudioCastLibrary, chatId: string): StudioCastLibrary {
  const activeGroupId = Object.prototype.hasOwnProperty.call(library.chatGroups, chatId) ? library.chatGroups[chatId] : library.activeGroupId
  const group = library.groups.find(item => item.id === activeGroupId)
  return { ...library, activeGroupId, inject: group?.inject ?? library.inject }
}
function castMembers(library: StudioCastLibrary): StudioCastMember[] { return library.members.filter(member => member.groupId === library.activeGroupId) }
// Use only explicit, completed assistant packets in the prompt's ordered active
// history. This is a continuity hint, not mutable render state; old cards and
// alternate swipes always resolve from their own authored wardrobe attribute.
function castWardrobeContinuity(library:StudioCastLibrary,messages:unknown[]):string {
  const active=new Map<string,string>()
  for(const value of messages.slice(-200)){
    const message=recipeRecord(value)
    if(message.role!=="assistant"||typeof message.content!=="string")continue
    for(const [index,part] of message.content.split(/(```[\s\S]*?(?:```|$)|`[^`\n]*`|<!--[\s\S]*?(?:-->|$)|<payload>[\s\S]*?(?:<\/payload>|$))/gi).entries()){
      if(index%2)continue
      for(const match of castPacketInput(part).matchAll(castEnvelopePattern())){
        const key=castPacketWardrobe(match[2]);if(!key||castGenesisPacket(match))continue
        const prefix=match[1].toLowerCase(),member=castMembers(library).filter(item=>prefix===item.prefix.toLowerCase()||prefix.startsWith(item.prefix.toLowerCase()+"-")).sort((a,b)=>b.prefix.length-a.prefix.length)[0]
        if(member?.wardrobes){if(castActiveWardrobes(member).some(row=>row.key===key))active.set(member.id,key);else active.delete(member.id)}
      }
    }
  }
  return active.size?` Most recently established outfits in the supplied dialogue history: ${castMembers(library).filter(member=>active.has(member.id)).map(member=>`${member.prefix} wardrobe=${active.get(member.id)}`).join(", ")}. Keep these outfits unless the scene explicitly changes them.`:""
}
function castPrompt(library: StudioCastLibrary,messages:unknown[]=[],stage?:{scenery:boolean;lighting:boolean;generate:boolean}): string {
  if (!library.inject) return ""
  const entries = castMembers(library).flatMap(member => member.wardrobes?castActiveWardrobes(member).flatMap(wardrobe=>Object.keys(wardrobe.slots).map(label=>`${member.prefix}-${label} wardrobe=${wardrobe.key}${member.role === "persona" ? " (user persona)" : ""}`)):Object.keys(member.images).map(label => `${member.prefix}-${label}${member.role === "persona" ? " (user persona)" : ""}`))
  const example=entries[0]?.replace(/ \(user persona\)$/,"")||""
  const wardrobeMembers=castMembers(library).filter(member=>member.wardrobes)
  const wardrobeStarts=wardrobeMembers.filter(member=>member.preferredWardrobe&&castActiveWardrobes(member).some(row=>row.key===member.preferredWardrobe&&Object.keys(row.slots).length)).map(member=>`${member.prefix} wardrobe=${member.preferredWardrobe}`).join(", ")
  const wardrobeInstruction=wardrobeMembers.length?` Wardrobe-enabled characters have outfit-specific expression keys listed with wardrobe=KEY. Include that exact attribute on EVERY packet for those characters; repeat the established outfit until the story explicitly changes clothing. Choose expressions only from the selected wardrobe. Do not switch outfits to obtain a different emotion. Do not invent wardrobes. Only outfits in the directory are available for new packets; if an older outfit is no longer listed, choose an available outfit instead. Outfit directory: ${wardrobeMembers.map(member=>`${member.prefix}: ${castActiveWardrobes(member).filter(row=>Object.keys(row.slots).length).map(row=>`${row.key} (${row.name})`).join(", ")}`).join("; ")}.${wardrobeStarts?` Preferred starting outfits (only if the story has not already established clothing): ${wardrobeStarts}.`:""}${castWardrobeContinuity(library,messages)}`:""
  const modes = castMembers(library).filter(member => Object.keys(member.images).length).map(member => `${member.prefix}: ${member.presentation === "inherit" ? library.groups.find(group => group.id === member.groupId)?.defaultPresentation || "story" : member.presentation}`).join(", ")
  const backgrounds=library.groups.find(g=>g.id===library.activeGroupId)?.backgrounds||[]
  const group=library.groups.find(g=>g.id===library.activeGroupId)
  const atmosphereInstruction=stage?.lighting?` Theater lighting is scene-level; follow the independent Stage Direction protocol. Legacy atmosphere attributes are supported; omit them to retain lighting.`:group?.atmosphere?.enabled?` Optionally add atmosphere=KEY to a Cast background-stage packet for a subtle scene color wash. Available keys: ${CAST_ATMOSPHERES.map(item=>item.key).join(", ")}. Repeat the chosen key for authored chat cards while the mood remains appropriate. Use atmosphere=none to reset Theater lighting; omission retains the previous Theater mood. Never emit CSS.`:""
  const genesis=cleanCastGenesisSettings(group?.genesis)
  const genesisInstruction=genesis.enabled ? ` For a new speaking character with no available expression, use <swarm-cast=new-character flag=create type=${genesis.pipeline}-pipeline><font color="#599CE3">"Their exact dialogue."</font></swarm-cast>. Use a unique stable character key (letters, numbers, hyphens, underscores); reuse it for the same character. Up to ${genesis.limit} new characters per reply. You can add expression=joy or background=scene-key. Do not write image prompts, biographies or generation instructions. Studio handles their design and expressions.${castMembers(library).filter(member=>!Object.keys(member.images).length&&member.role!=="persona").length?` Empty member keys (reuse these): ${castMembers(library).filter(member=>!Object.keys(member.images).length&&member.role!=="persona").map(member=>member.prefix).join(", ")}.`:""}` : ""
  const generationInstruction=stage?.scenery?"":group?.generateBackgrounds ? ` For a genuinely new visible location, emit at most ONE separate closed request before its first dialogue packet: <swarm-background=${group.id}:new-scene-key>Empty environment only: describe architecture, scenery, lighting, time and camera; no people.</swarm-background>. Replace new-scene-key with a unique short key, then use background=that-key on the Cast dialogue packets. Reuse saved keys instead of requesting them again. Include this exact new background key in at least one complete Cast packet in the same reply. Never put the request inside dialogue. Only request a background when a visible new setting is needed. Optional: use one eligible location lore marker in the description; never use character, outfit or persona markers.` : ""
  const sceneInstruction=stage?.scenery?` Establish locations using the independent Stage Direction protocol, regardless of card composition; only use explicit background attributes when intentionally changing the scene.`:backgrounds.length ? ` For a background-stage look, optionally add background=${backgrounds[0].key} to the opening Cast tag, e.g. <swarm-cast=${example||"new-character flag=create"} background=${backgrounds[0].key}>. Available saved scene keys: ${backgrounds.map(bg=>bg.key).join(", ")}.${backgrounds.some(bg=>bg.aliases.length)?` Historical aliases: ${backgrounds.filter(bg=>bg.aliases.length).map(bg=>`${bg.key} (${bg.aliases.join(", ")})`).join("; ")}.`:""} Use background=none for no scene; never invent saved keys.` : " Use background=none for no scene."
  const dialogueColorInstruction = `Color all spoken dialogue consistently by speaker, both inside and outside Cast packets. Follow the speaker's established color from the story or user instructions; the hex color below is only an example, not a universal color. If none is established, choose a readable color for that speaker and reuse it. Use a closed <font color="#599CE3">"Spoken dialogue."</font> wrapper for each spoken segment, including ordinary inline dialogue, speakers without artwork, and continuation after a narration beat. Keep narration and dialogue attribution outside the font wrapper and outside Cast packets. Color does not require a Cast packet. Follow any explicit user dialogue-color rules.`
  if(!entries.length) return genesis.enabled ? `SWARM STUDIO CAST\nWrite ordinary narration outside complete Cast packets. Put only exact spoken dialogue inside each packet. ${dialogueColorInstruction}${genesisInstruction}${sceneInstruction}${atmosphereInstruction}${generationInstruction}` : ""
  return `SWARM STUDIO CAST\nWhen a listed character speaks, emit one self-contained expression packet at that point in the narrative: <swarm-cast=${example}><font color="#599CE3">"Their exact spoken dialogue."</font></swarm-cast>. Put ONLY that speaker’s dialogue inside the packet, with no narration or other characters’ lines. ${dialogueColorInstruction} For example: <swarm-cast=${example}><font color="#599CE3">"No,"</font></swarm-cast> he said quietly. <font color="#599CE3">"I was waiting for you."</font> Keep the same speaker color in the continuation; do not create an extra card just to color it. The closing </swarm-cast> is ALWAYS mandatory. Never output opening-only Cast tags, even during streaming. Write normal narration outside packets; keep dialogue from anyone who does not have a matching expression as colored inline prose${genesis.enabled?", except a new character creation packet described below":""}. The simple dialogue font wrappers are allowed both inside and outside packets. Do not emit other Cast-related HTML, CSS, image URLs or layout markup, except the separate background request when explicitly permitted below. Use only these available keys: ${entries.join(", ")}. Current presentation modes: ${modes}. Do not invent existing expression keys or image URLs. Persona expressions describe the user only when supported by their actions. A packet with only a listed member prefix uses that member’s default expression. Ordinary expression packets are saved assets, not image generation requests.${wardrobeInstruction}${sceneInstruction}${atmosphereInstruction}${generationInstruction}${genesisInstruction}`
}
function castDialogue(value: string): string {
  let text = value.trim()
  for (let i = 0; i < 4; i++) {
    const first = text[0], last = text.at(-1)
    if ((first === '"' && last === '"') || (first === "“" && last === "”") || (first === "‘" && last === "’")) text = text.slice(1, -1).trim()
    else break
  }
  return text ? `“${text}”` : ""
}
// U+2800 is used as a model-side spacer, not recognized as HTML whitespace.
// Normalize a parsing copy BEFORE finding tags or reading <font color>. Never
// mutate the saved chat source or the host's original prose.
function castPacketInput(value: string): string { return value.replace(/\u2800/g, " ") }
// Only fully closed packets own dialogue; incomplete streaming tags are inert.
function castEnvelopePattern(): RegExp {
  return /(?:<|&lt;)swarm-cast=([\p{L}\p{N}_-]{1,130})((?:\s+(?:background=(?:"[\p{L}\p{N}_-]{1,64}"|'[\p{L}\p{N}_-]{1,64}'|[\p{L}\p{N}_-]{1,64})|wardrobe=(?:"[\p{L}\p{N}_-]{1,64}"|'[\p{L}\p{N}_-]{1,64}'|[\p{L}\p{N}_-]{1,64})|atmosphere=(?:"[\p{L}\p{N}_-]{1,64}"|'[\p{L}\p{N}_-]{1,64}'|[\p{L}\p{N}_-]{1,64})|flag=create|type=(?:basics|full)-pipeline|expression=[\p{L}\p{N}_-]{1,64}))*)\s*(?:>|&gt;)((?:(?!(?:<|&lt;)swarm-cast=)[\s\S])*?)(?:<|&lt;)\/swarm-cast\s*(?:>|&gt;)/giu
}
function castPacketAtmosphere(attrs:string):CastAtmosphereKey|"" {
 return castAtmosphereKey(castBackgroundKey(attrs.match(/(?:^|\s)atmosphere=("[\p{L}\p{N}_-]+"|'[\p{L}\p{N}_-]+'|[\p{L}\p{N}_-]+)/iu)?.[1]))
}
function castPacketWardrobe(attrs:string):string {
  return castBackgroundKey(attrs.match(/(?:^|\s)wardrobe=("[\p{L}\p{N}_-]+"|'[\p{L}\p{N}_-]+'|[\p{L}\p{N}_-]+)/iu)?.[1])
}
function castResolveWardrobe(library:StudioCastLibrary,key:string,wardrobeKey:string):{member:StudioCastMember;image:{id:string;url:string};label:string;assetKey:string}|undefined {
  const matches=castMembers(library).filter(member=>key===member.prefix.toLowerCase()||key.startsWith(member.prefix.toLowerCase()+"-"))
  // A shorter prefix must never steal a longer member's explicit packet.
  matches.sort((a,b)=>b.prefix.length-a.prefix.length)
  const member=matches[0];if(!member||!wardrobeKey)return undefined
  const wardrobe=castWardrobes(member).find(item=>item.key===wardrobeKey)
  if(!wardrobe)return undefined
  const requested=key===member.prefix.toLowerCase()?wardrobe.defaultExpression:key.slice(member.prefix.length+1)
  const assetKey=wardrobe.slots[requested]||wardrobe.aliases[requested]||wardrobe.slots.neutral
  const image=member.images[assetKey];if(!image)return undefined
  const label=Object.keys(wardrobe.slots).find(label=>wardrobe.slots[label]===assetKey)||requested
  return {member,image,label,assetKey}
}
function castPacketBackground(attrs:string):string {
  return castBackgroundKey(attrs.match(/(?:^|\s)background=("[\p{L}\p{N}_-]+"|'[\p{L}\p{N}_-]+'|[\p{L}\p{N}_-]+)/iu)?.[1])
}
function castGenesisPacket(match: RegExpMatchArray): {key:string;expression:string}|null {
  const attrs=match[2].trim().split(/\s+/).filter(Boolean)
  const keys=attrs.map(item=>item.split("=")[0].toLowerCase())
  if(new Set(keys).size!==keys.length||keys.includes("wardrobe")||!attrs.some(item=>item.toLowerCase()==="flag=create"))return null
  const key=castKey(match[1]).toLowerCase()
  if(!key||!match[3].trim()||match[3].length>16000)return null
  const expression=castKey(attrs.find(item=>item.toLowerCase().startsWith("expression="))?.split("=")[1]).toLowerCase()
  return {key,expression}
}
function castGenesisRequests(content:string):{key:string;expression:string}[]{
  const found=new Map<string,{key:string;expression:string}>()
  for(const [index,part] of content.split(/(```[\s\S]*?(?:```|$)|`[^`\n]*`|<!--[\s\S]*?(?:-->|$)|<payload>[\s\S]*?(?:<\/payload>|$))/gi).entries()){
    if(index%2)continue
    for(const match of castPacketInput(part).matchAll(castEnvelopePattern())){
      if(!match[0].startsWith("<")||part[(match.index||0)-1]==="\\")continue
      const item=castGenesisPacket(match)
      if(item&&!found.has(item.key))found.set(item.key,item)
      if(found.size>=12)return [...found.values()]
    }
  }
  return [...found.values()]
}
function castBackgroundKey(value: string | undefined): string { return (value||"").replace(/^["']|["']$/g,"").toLowerCase() }
function castPreviewQuote(value: string): { dialogue: string; color: string } {
  const raw = value.trim().replace(/^<font\s+color\s*=\s*(?:"pink"|'pink'|pink)\s*>/i, '<font color="#ffc0cb">')
  const font = raw.match(/^<font\s+color\s*=\s*(?:"(#[\da-f]{3,8})"|'(#[\da-f]{3,8})'|(#[\da-f]{3,8}))\s*>([\s\S]*?)<\/font>$/iu)
  return font ? { dialogue: font[4], color: font[1] || font[2] || font[3] } : { dialogue: raw, color: "" }
}
// Canonical pre-render, display-only Cast transform. It MUST never touch the
// saved message or rewrite the surrounding prose. A browser-native <span> owns
// each exact source location; Shadow DOM hydration fills it later.
function castBackgroundRequestPattern(): RegExp {
  return /<swarm-background=([\p{L}\p{N}_-]{1,64}):([\p{L}\p{N}_-]{1,64})\s*>([^<>]{1,4000})<\/swarm-background\s*>/giu
}
function castBackgroundRequests(content: string): {groupId:string; key:string; prompt:string}[] {
  const result: {groupId:string; key:string; prompt:string}[] = []
  for (const [index, part] of content.split(/(```[\s\S]*?```|`[^`\n]*`|<!--[\s\S]*?-->|<payload>[\s\S]*?<\/payload>|<swarm-cast=[\s\S]*?<\/swarm-cast>)/gi).entries()) {
    if (index % 2) continue
    for (const match of castPacketInput(part).matchAll(castBackgroundRequestPattern())) {
      const groupId=castKey(match[1]),key=castKey(match[2]).toLowerCase(),prompt=match[3].trim()
      if(groupId && key && key!=="none" && prompt) result.push({groupId,key,prompt})
    }
  }
  return result
}
function stripCastBackgroundRequests(content:string, hideIncomplete=false):string {
  return content.split(/(```[\s\S]*?```|`[^`\n]*`|<!--[\s\S]*?-->|<payload>[\s\S]*?<\/payload>|<swarm-cast=[\s\S]*?<\/swarm-cast>)/gi).map((part,index)=>{
    if(index%2)return part
    let cursor=0,result=""
    for(const match of castPacketInput(part).matchAll(castBackgroundRequestPattern())){const at=match.index??0;result+=part.slice(cursor,at);cursor=at+match[0].length}
    const tail=part.slice(cursor)
    const unfinished=hideIncomplete?castPacketInput(tail).match(/<swarm-background=[\p{L}\p{N}_-]{1,64}:[\p{L}\p{N}_-]{0,64}(?:\s*>[^<>]*)?$/iu):null
    return result+(unfinished?tail.slice(0,unfinished.index):tail)
  }).join("")
}
function castRenderIslands(content: string): string {
  content = stripCastBackgroundRequests(content,true)
  if (!content || !/<(?:swarm-cast|\/swarm-cast)/i.test(content)) return content
  const escape = (text: string): string => text.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))
  let count = 0
  return content.split(/(```[\s\S]*?```|`[^`\n]*`|<!--[\s\S]*?-->|<payload>[\s\S]*?<\/payload>)/g).map((part, index) => {
    if (index % 2) return part
    // Braille blanks are normalized only in this equal-length matching view.
    // Native prose is reconstructed from the ORIGINAL source offsets.
    const normalized = castPacketInput(part)
    let cursor = 0, result = ""
    for (const match of normalized.matchAll(castEnvelopePattern())) {
      if (count >= 96) break
      const at = match.index ?? 0, end = at + match[0].length
      if (at < cursor || match[3].length > 16000) continue
      const key = match[1]
      const body = match[3], background=castPacketBackground(match[2]), wardrobe=castPacketWardrobe(match[2]), atmosphere=castPacketAtmosphere(match[2]), genesis=castGenesisPacket(match)
      const readable = castPreviewQuote(body).dialogue.replace(/<[^>]*>/g, "")
      const encoded = btoa(Array.from(new TextEncoder().encode(body), byte => String.fromCharCode(byte)).join(""))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
      result += part.slice(cursor, at)
      result += `<span data-ss-cast-slot="1" data-ss-cast-key="${escape(key)}" ${genesis?.expression ? `data-ss-cast-requested-expression="${escape(genesis.expression)}" ` : ""}${background ? `data-ss-cast-background="${escape(background)}" ` : ""}${wardrobe ? `data-ss-cast-wardrobe="${escape(wardrobe)}" ` : ""}${atmosphere ? `data-ss-cast-atmosphere="${escape(atmosphere)}" ` : ""}data-ss-cast-packet="${encoded}" data-ss-cast-index="${count++}">${escape(readable)}</span>`
      cursor = end
    }
    // Hide only a trailing incomplete packet while streaming. It may be
    // continued on a future render, but isn't valid HTML in its current form.
    const tail = normalized.slice(cursor)
    const pending = tail.toLowerCase().lastIndexOf("<swarm-cast")
    const closed = tail.toLowerCase().lastIndexOf("</swarm-cast>")
    if (pending >= 0 && pending > closed) return result + part.slice(cursor, cursor + pending)
    return result + part.slice(cursor)
  }).join("")
}

// Recover only Studio's earlier generated span shape. This lets existing replies
// regain live presentation settings without touching unrelated HTML or images.
function castLiteralSource(content: string): string {
  return content.split(/(```[\s\S]*?```|`[^`\n]*`)/g).map((part, index) => index % 2 ? part : castLiteralPart(part)).join("")
}
function castLiteralPart(content: string): string {
  const marker = /<span data-swarm-cast="([\p{L}\p{N}_-]{1,130})"(?: data-cast-side="(?:auto|left|right)")? style="display:(?:inline-flex|inline-block|block);/gu
  let result = "", cursor = 0
  for (let match; (match = marker.exec(content));) {
    if (match.index < cursor) continue
    const spans = /<\/?span\b[^>]*>/gu
    spans.lastIndex = match.index
    let depth = 0, end = -1
    for (let span; (span = spans.exec(content));) {
      depth += span[0].startsWith("</") ? -1 : 1
      if (depth === 0) { end = spans.lastIndex; break }
    }
    if (end < 0) continue
    const own = content.slice(match.index, end)
    if (!/<img src="\/api\/v1\/images\/[\w%-]+"/.test(own)) continue
    const quote = own.match(/<span(?: data-swarm-cast-dialogue)? style="font-style:italic;[^">]*">([^<>]*)<\/span>/u)?.[1] || ""
    const decoded = quote.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[entity]!)
    result += content.slice(cursor, match.index) + `<swarm-cast=${match[1]}>${decoded}</swarm-cast>`
    cursor = end; marker.lastIndex = end
  }
  return result + content.slice(cursor)
}

function renderCastTags(content: string, library: StudioCastLibrary, escape: (value: string) => string): string {
  const assets = new Map<string, { member: StudioCastMember; image: { id: string }; label: string }>()
  const ambiguous = new Set<string>()
  for (const member of castMembers(library)) for (const [label, image] of Object.entries(member.images)) {
    const key = `${member.prefix}-${label}`.toLowerCase()
    if (assets.has(key) || ambiguous.has(key)) { assets.delete(key); ambiguous.add(key) } else assets.set(key, { member, image, label })
  }
  for (const member of castMembers(library)) {
    const base=member.wardrobes?castWardrobes(member)[0]:undefined
    const defaultKey=base?base.slots[base.defaultExpression]:member.defaultExpression
    const image = base?member.images[defaultKey]:member.images[defaultKey] || member.images.neutral || Object.values(member.images)[0]
    const key = member.prefix.toLowerCase()
    if (!image) continue
    if (assets.has(key) || ambiguous.has(key)) { assets.delete(key); ambiguous.add(key) }
    else assets.set(key, { member, image, label: defaultKey })
  }
  const renderOne = (key: string, sourceQuote: string, backgroundKey = "", prefix = "", wardrobeKey = "", atmosphereKey = ""): string | null => {
    const asset = wardrobeKey?castResolveWardrobe(library,key.toLowerCase(),wardrobeKey):assets.get(key.toLowerCase())
    if (!asset) return null
    const { member, image } = asset
    const label = wardrobeKey||!member.wardrobes?asset.label:castWardrobeForAsset(member,asset.label)?.label||asset.label
    const captured = castPreviewQuote(sourceQuote)
    const authoredColor = captured.color || "var(--lumiverse-prose-dialogue,inherit)"
    const style = member.presentation === "inherit" ? library.groups.find(item => item.id === member.groupId)?.defaultPresentation || "story" : member.presentation
    const caption = escape(`${member.name} · ${label}`), src = `/api/v1/images/${encodeURIComponent(image.id)}`
    const side = member.presentationSide
    const group=library.groups.find(item=>item.id===member.groupId)
    const background=backgroundKey==="none" ? undefined : group?.backgrounds.find(bg=>bg.key===backgroundKey||bg.aliases.includes(backgroundKey)) || group?.backgrounds.find(bg=>bg.key===group.defaultBackground)
    const outfit=member.wardrobes?(wardrobeKey?castWardrobes(member).find(row=>row.key===wardrobeKey):castWardrobeForAsset(member,asset.label)?.wardrobe||castWardrobes(member)[0]):undefined
    const defaultImage=outfit?member.images[outfit.slots[outfit.defaultExpression]]:member.images[member.defaultExpression]||member.images.neutral
    const defaultSrc=defaultImage?`/api/v1/images/${encodeURIComponent(defaultImage.id)}`:src
    const named = castPresentationTemplate(style, {key, src, defaultSrc, background, name:member.name, label, side, atmosphere:castAtmosphereVisual(atmosphereKey,group?.atmosphere), dialogue:captured.dialogue?escape(castDialogue(captured.dialogue)):"", color:captured.color, crop:member.crop},escape)
    if(named) return prefix + named
    const cropped = style !== "portrait" && member.crop.enabled
    const imageMarkup = `<img src="${src}" alt="${caption}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:${cropped ? "cover" : "contain"};${cropped ? `object-position:${member.crop.x}% ${member.crop.y}%;transform-origin:${member.crop.x}% ${member.crop.y}%;transform:scale(${member.crop.zoom});` : ""}">`
    let markup: string
    if (style === "portrait") {
      markup = `<span data-swarm-cast="${escape(key)}" data-cast-side="${side}" style="display:block;max-width:100%;width:240px;margin:${side === "right" ? "14px 0 14px auto" : side === "left" ? "14px auto 14px 0" : "14px auto"};line-height:normal;color:inherit;font:inherit;"><img src="${src}" alt="${caption}" loading="lazy" style="display:block;max-width:100%;max-height:320px;width:auto;height:auto;object-fit:contain;margin:0 auto;">${captured.dialogue ? `<span data-swarm-cast-dialogue style="display:block;margin-top:10px;text-align:center;color:${authoredColor};font:inherit;line-height:1.6;overflow-wrap:anywhere;">${escape(castDialogue(captured.dialogue))}</span>` : ""}</span>`
      return prefix + markup
    }
    const quote = captured.dialogue ? `<span data-swarm-cast-dialogue style="font-style:italic;line-height:1.7;color:${authoredColor};overflow-wrap:anywhere;">${escape(castDialogue(captured.dialogue))}</span>` : ""
    const portraitStyle = style === "sticker" ? "width:82px;height:82px;border-radius:50%;border:2px solid currentColor;" : `width:${cropped ? 82 : 72}px;height:${cropped ? 82 : 96}px;border-radius:8px;`
    markup = `<span data-swarm-cast="${escape(key)}" data-cast-side="${side}" style="display:inline-flex;flex-direction:${side === "right" ? "row-reverse" : "row"};vertical-align:middle;align-items:center;gap:12px;max-width:100%;box-sizing:border-box;margin:8px 0;${style === "story" ? "width:360px;padding:10px;border:1px solid currentColor;border-radius:12px;" : ""}"><span style="display:block;flex:none;overflow:hidden;${portraitStyle}">${imageMarkup}</span>${quote || `<span style="font-size:.8em;">${caption}</span>`}</span>`
    // If dialogue exists on both sides, preserve the preceding line and move only the following one.
    return prefix + markup
  }
  // No opening-only matcher. A fragment is literal until </swarm-cast>
  // arrives, so streamed partial tags cannot trigger a half-painted card.
  return content.split(/(```[\s\S]*?```|`[^`\n]*`)/g).map((part, index) => {
    if (index % 2) return part
    const normalized = castPacketInput(part)
    let result = "", cursor = 0
    for (const match of normalized.matchAll(castEnvelopePattern())) {
      const start = match.index || 0
      result += part.slice(cursor, start)
      const genesis=castGenesisPacket(match)
      const requested=genesis?.expression?renderOne(`${match[1]}-${genesis.expression}`,match[3],castPacketBackground(match[2]), "", "", castPacketAtmosphere(match[2])):null
      result += requested || renderOne(match[1], match[3], castPacketBackground(match[2]), "", castPacketWardrobe(match[2]), castPacketAtmosphere(match[2])) || part.slice(start, start + match[0].length)
      cursor = start + match[0].length
    }
    return result + part.slice(cursor)
  }).join("")
}
