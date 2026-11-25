type TheaterWeather='none'|'rain'|'snow'|'petals'|'embers'|'dust'|'fog'|'leaves'|'fireflies'|'wind'
// Declarative scene direction shared by prompt projection and Theater. Cues are declarative, bounded, and never execute model markup.
const THEATER_WEATHER_OPTIONS: [TheaterWeather,string][]=[['none','Off'],['rain','Rain'],['snow','Snow'],['petals','Petals'],['embers','Embers'],['dust','Dust motes'],['fog','Fog'],['leaves','Falling leaves'],['fireflies','Fireflies'],['wind','Wind']]
const THEATER_FX_OPTIONS=[['lightning','Lightning'],['shake','Camera shake'],['sparks','Sparks'],['impact','Impact'],['darkness','Sudden darkness'],['pulse','Light pulse'],['magic','Magic burst'],['sparkles','Sparkles'],['stress','Manga stress'],['spotlight','Spotlight'],['romance','Romantic beat'],['tension','Tension']] as const
type TheaterFxId=typeof THEATER_FX_OPTIONS[number][0]
type TheaterCue={kind:'scene';effect:string}|{kind:'lighting';effect:CastAtmosphereKey}|{kind:'weather';effect:TheaterWeather|'preset';intensity?:number}|{kind:'fx';effect:TheaterFxId;intensity?:number;duration?:number;target?:string}
interface TheaterFxState {weather?:Extract<TheaterCue,{kind:'weather'}>;autoWeather?:Extract<TheaterCue,{kind:'weather'}>;effects:Extract<TheaterCue,{kind:'fx'}>[];automatic:Extract<TheaterCue,{kind:'fx'}>[];seed:string}
function theaterCueText(c:TheaterCue):string{if(c.kind==='scene'||c.kind==='lighting')return `[[${c.kind}: ${c.effect}]]`;return `[[${c.kind==='weather'?'atmosphere':'stage-fx'}: ${c.effect}${c.intensity===undefined?'':` intensity=${c.intensity}`}${c.kind==='fx'&&c.duration!==undefined?` duration=${c.duration}`:''}${c.kind==='fx'&&c.target?` target="${c.target}"`:''}]]`}
function theaterCueParse(value:string):TheaterCue|null{
 if(value.length>300)return null
 const raw=castPacketInput(value).replace(/\u00a0/g," ").trim();const direction=raw.match(/^\[\[(scene|lighting):[ \t]*([\p{L}\p{N}][\p{L}\p{N}_-]{0,63})[ \t]*\]\]$/iu);if(direction){const key=direction[2].toLowerCase();if(direction[1].toLowerCase()==='scene')return {kind:'scene',effect:key};const mood=castAtmosphereKey(key);return mood?{kind:'lighting',effect:mood}:null}
 const bracket=raw.match(/^\[\[(atmosphere|stage-fx):\s*([a-z-]+)(.*?)\]\]$/i);const xml=raw.match(/^<(atmosphere|stage-fx)\s+([\s\S]*?)\s*\/>$/i)
 if(!bracket&&!xml)return null
 const kind=(bracket?.[1]||xml?.[1])?.toLowerCase()==='atmosphere'?'weather':'fx';const attrs:Record<string,string>=Object.create(null);let rest=bracket?bracket[3]:` ${xml![2]}`
 while(rest.trim()){const m=rest.match(/^\s+([a-z]+)\s*=\s*(?:"([^"\r\n]*)"|'([^'\r\n]*)'|([\w.-]+))/i);if(!m)return null;const k=m[1].toLowerCase();if(Object.hasOwn(attrs,k)||!['effect','intensity','duration','target'].includes(k))return null;attrs[k]=m[2]??m[3]??m[4];rest=rest.slice(m[0].length)}
 if(bracket&&attrs.effect)return null
 const effect=(bracket?.[2]||attrs.effect||'').toLowerCase();const number=(key:string,min:number,max:number)=>attrs[key]!==undefined&&/^\d{1,5}$/.test(attrs[key])?Math.min(max,Math.max(min,Number(attrs[key]))):undefined
 const intensity=number('intensity',0,100);if(attrs.intensity!==undefined&&intensity===undefined)return null
 if(kind==='weather'){if(attrs.duration!==undefined||attrs.target!==undefined||effect!=='preset'&&!THEATER_WEATHER_OPTIONS.some(x=>x[0]===effect))return null;return {kind,effect:effect as TheaterWeather|'preset',intensity}}
 const duration=number('duration',250,2500);if(attrs.duration!==undefined&&duration===undefined)return null
 const target=attrs.target?.trim();if(target!==undefined&&(!target||target.length>64||! /^[\p{L}\p{N} _.:’-]+$/u.test(target)))return null
 if(!THEATER_FX_OPTIONS.some(x=>x[0]===effect))return null
 return {kind,effect:effect as TheaterFxId,intensity,duration,target}
}
const THEATER_LIVE_VOID=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
const THEATER_LIVE_BLOCK=new Set(['article','aside','blockquote','details','div','figure','footer','form','h1','h2','h3','h4','h5','h6','header','main','nav','ol','p','pre','section','table','ul','swarm-cast','swarm-image','swarm-background','swarm-genesis','think','thinking','reasoning'])
// Scan source, not the browser's auto-balanced HTML tree. A complete top-level
// block or packet or a blank-line-delimited paragraph is a publish boundary.
// Unmatched tags, quoted attributes, comments and fenced code are held back.
function theaterLiveUnits(source:string):string[]{
 const units:string[]=[],stack:string[]=[];let start=0,i=0,fence='',inlineCode=0
 // Equal-length parsing view: Cast already accepts braille blanks in markup.
 // A missed <font⠀color> opener used to make the closing tag abort the entire cue scan.
 const markup=castPacketInput(source).replace(/\u00a0/g," ")
 const push=(end:number)=>{const value=source.slice(start,end);if(value.trim())units.push(value);start=end}
 while(i<source.length){
  if(i===0||source[i-1]==='\n'){
   const m=source.slice(i).match(/^ {0,3}(`{3,}|~{3,})[^\n]*(?:\n|$)/)
   if(m&&!stack.length&&!inlineCode){const marker=m[1];if(!fence){fence=marker;i+=m[0].length;continue}if(marker[0]===fence[0]&&marker.length>=fence.length&&/^[ \t]*$/.test(m[0].trimEnd().slice(m[0].indexOf(marker)+marker.length))){if(!m[0].endsWith('\n'))break;fence='';i+=m[0].length;push(i);continue}}
  }
  if(fence){i++;continue}
  // A complete standalone cue line is an independent boundary, including
  // consecutive cues without blank lines. Never split a protected HTML/code island.
  if(!stack.length&&!inlineCode&&(i===0||source[i-1]==='\n')){const end=source.indexOf('\n',i);if(end>=0){const line=source.slice(i,end).replace(/\r$/,'');if(!/^(?: {4,}|\t)/.test(line)&&theaterCueParse(line)){push(i);i=end+1;push(i);continue}}}
  if(source[i]==='`'&&(i===0||source[i-1]!=='\\')){let j=i;while(source[j]==='`')j++;const count=j-i;if(!inlineCode)inlineCode=count;else if(inlineCode===count)inlineCode=0;i=j;continue}
  if(inlineCode){i++;continue}
  if(source.startsWith('<!--',i)){const end=source.indexOf('-->',i+4);if(end<0)break;i=end+3;continue}
  if(source[i]==='<'&&source[i-1]!=='\\'){
   const head=markup.slice(i).match(/^<\s*(\/?)([a-z][a-z\d:_-]*)(?=[\s=/>]|$)/i)
   if(head){let j=i+head[0].length,quote='';for(;j<source.length;j++){const c=source[j];if(quote){if(c===quote)quote=''}else if(c==='"'||c==="'")quote=c;else if(c==='>')break}if(j===source.length)break
    const name=head[2].toLowerCase(),closing=!!head[1],self=/\/\s*>$/.test(source.slice(i,j+1))||THEATER_LIVE_VOID.has(name);i=j+1
    if(closing){if(stack.at(-1)!==name)break;stack.pop();if(!stack.length&&THEATER_LIVE_BLOCK.has(name))push(i)}
    else if(!self){stack.push(name);if(name==='script'||name==='style'){const re=new RegExp(`</${name}\\s*>`,'ig');re.lastIndex=i;const end=re.exec(source);if(!end)break;i=end.index+end[0].length;stack.pop()}}
    else if(!stack.length&&(name==='img'||name==='hr'||name==='atmosphere'||name==='stage-fx'||name.startsWith('swarm-')))push(i)
    continue
   }
   // A token may end halfway through an opening tag. Never publish through it.
   if(/^<\/?[a-z]*$/i.test(source.slice(i)))break
  }
  if(!stack.length&&source[i]==='\n'){const blank=source.slice(i).match(/^\n[\t \r]*\n+/);if(blank){i+=blank[0].length;push(i);continue}}
  i++
 }
 return units
}
// Use the same source completion boundaries as live Theater. A sentinel closes
// a final paragraph but never repairs incomplete code, comments, tags or packets.
// The raw message remains authoritative for swipes, export and historical FX.
function stageCueSpans(source:string):{start:number;end:number;cue:TheaterCue}[]{
  if(!/\[\[(?:scene|lighting|atmosphere|stage-fx):|<(?:atmosphere|stage-fx)\s/i.test(source))return []
  let scan=0;const spans:{start:number;end:number;cue:TheaterCue}[]=[]
  for(const unit of theaterLiveUnits(source+"\n\n")){
    const at=(source+"\n\n").indexOf(unit,scan);if(at<0||at>=source.length)break;scan=at+unit.length
    const original=source.slice(at,Math.min(source.length,at+unit.length)), trimmed=original.trim(), cue=theaterCueParse(trimmed)
    if(!cue)continue
    // Do not consume indented code or quoted instructions.
    const leading=original.slice(0,original.indexOf(trimmed));if(/(?:^|\n)(?: {4,}|\t)[^\n]*$/.test(leading))continue
    const pos=at+original.indexOf(trimmed)
    spans.push({start:pos,end:pos+trimmed.length,cue})
  }
  return spans
}
// Read only a complete group of standalone cues. Rendered Markdown combines
// consecutive source lines in one paragraph with <br> rather than separate nodes.
function stageCueLines(value:string):TheaterCue[]|null {
 const lines=value.split(/\r?\n/).filter(line=>castPacketInput(line).trim());if(!lines.length||lines.length>32)return null
 const cues=lines.map(line=>theaterCueParse(line));return cues.every((cue):cue is TheaterCue=>cue!==null)?cues:null
}
function stageCueDecode(encoded:string):TheaterCue|null {try{return theaterCueParse(decodeURIComponent(encoded))}catch{return null}}
function stageCueProject(source:string, mode:"render"|"prompt"):string {
  let cursor=0,result="";for(const {start,end,cue} of stageCueSpans(source)){result+=source.slice(cursor,start);if(mode==="render")result+=`<span data-no-island="true" data-ss-stage-cue="${encodeURIComponent(theaterCueText(cue))}" hidden aria-hidden="true" style="display:none"></span>`;cursor=end}
  return result+source.slice(cursor)
}


interface StageDirectionConfig {
 mode:'off'|'auto'|'macro'; position:'before'|'depth'|'after'; depth:number; role:'system'|'user'|'assistant';
 scenery:boolean; lighting:boolean; weather:boolean; fx:boolean; generate:boolean; continuity:boolean; frequency:'minimal'|'natural'|'expressive'
}
interface StageDirectionStore {global:StageDirectionConfig; casts:Record<string,StageDirectionConfig>; chats:Record<string,StageDirectionConfig>}
function cleanStageDirection(value:unknown):StageDirectionConfig {
 const v=recipeRecord(value);return {mode:v.mode==='auto'||v.mode==='macro'?v.mode:'off',position:v.position==='depth'||v.position==='after'?v.position:'before',depth:Math.max(0,Math.min(100,Math.trunc(Number(v.depth)||0))),role:v.role==='user'||v.role==='assistant'?v.role:'system',scenery:v.scenery!==false,lighting:v.lighting!==false,weather:v.weather!==false,fx:v.fx!==false,generate:v.generate===true,continuity:v.continuity===true,frequency:v.frequency==='minimal'||v.frequency==='expressive'?v.frequency:'natural'}
}
function cleanStageDirectionStore(value:unknown):StageDirectionStore {
 const v=recipeRecord(value),map=(raw:unknown)=>Object.fromEntries(Object.entries(recipeRecord(raw)).filter(([key])=>/^[\p{L}\p{N}_-]{1,180}$/u.test(key)&&!['__proto__','constructor','prototype'].includes(key)).slice(0,2000).map(([key,config])=>[key,cleanStageDirection(config)]));return {global:cleanStageDirection(v.global),casts:map(v.casts),chats:map(v.chats)}
}
function effectiveStageDirection(store:StageDirectionStore,groupId:string,chatId:string):StageDirectionConfig {
 return (Object.hasOwn(store.chats,chatId)?store.chats[chatId]:undefined)||(Object.hasOwn(store.casts,groupId)?store.casts[groupId]:undefined)||store.global
}
function stageDirectionLocations(group:StudioCastGroup|undefined):string {
 return group?.backgrounds.length?group.backgrounds.map(b=>b.key).join(', '):'No saved location keys.'
}
function stageDirectionProtocol(config:StageDirectionConfig,group:StudioCastGroup|undefined):string {
 if(config.mode==='off')return ''
 const parts:string[]=[]
 if(config.scenery)parts.push(`SCENERY: Before the opening narrative paragraph of a new location, emit [[scene: LOCATION-KEY]] using an exact saved key (${stageDirectionLocations(group)}). Use [[scene: none]] for no background. Do not invent saved keys. Locations persist across narration and all dialogue layouts; do not repeat unchanged keys.`)
 if(config.scenery&&config.generate&&group)parts.push(`For a genuinely new visible location, request at most one background per reply: <swarm-background=${group.id}:new-scene-key>Empty environment only: architecture, scenery, lighting, time and camera; no people.</swarm-background>. Then emit [[scene: new-scene-key]] before the relevant narrative. Reuse existing keys. Never put a request inside dialogue or HTML.`)
 if(config.lighting)parts.push(`LIGHTING: Establish time of day and significant mood changes with [[lighting: KEY]]. Valid keys: ${CAST_ATMOSPHERES.map(p=>p.key).join(', ')}. Use none to reset. Omission retains lighting; a new scene resets it.`)
 if(config.weather)parts.push(`ATMOSPHERE: Establish or change persistent environmental effects with [[atmosphere: EFFECT intensity=50]]. Valid effects: ${THEATER_WEATHER_OPTIONS.map(p=>p[0]).join(', ')}, preset. Use none to clear; new locations reset weather.`)
 if(config.fx)parts.push(`STAGE FX: Before a meaningful beat, optionally emit [[stage-fx: EFFECT intensity=50 duration=1000 target="NAME"]]. Valid effects: ${THEATER_FX_OPTIONS.map(p=>p[0]).join(', ')}. Intensity 0–100, duration 250–2500 ms, optional target is an observed actor name, active, left, right, or stage. Each effect plays once on the next screen.`)
 if(!parts.length)return ''
 const frequency=config.frequency==='minimal'?'Only establish necessary scene changes and essential effects.':config.frequency==='expressive'?'Use expressive visual direction for meaningful beats, without repeating unchanged state.':'Establish each scene and emphasize meaningful narrative changes.'
 return ['SWARM STUDIO STAGE DIRECTION', 'Emit standalone cue lines outside code, quotes, HTML and Cast packets, followed by a blank line and normal story prose. Consecutive cue lines are allowed. Direct the scene independently of dialogue card composition. Never describe cue syntax in narration. '+frequency,...parts,'END STAGE DIRECTION'].join('\n')
}
// Shared direction accumulator. Legacy packet attributes stay explicit and
// can override a directed scene; only standalone direction enables inheritance
// for ordinary chat cards that did not opt into the legacy packet attributes.
interface StageSceneState {scene:string;lighting:CastAtmosphereKey|'';weather:string;sceneDirected:boolean;lightingDirected:boolean}
function stageSceneState():StageSceneState{return {scene:'',lighting:'',weather:'',sceneDirected:false,lightingDirected:false}}
function stageSceneAdvance(state:StageSceneState,location='',mood:CastAtmosphereKey|''='',directedScene=false,directedLight=false){
 if(location&&location!==state.scene){state.scene=location;state.lighting='';state.weather='';state.lightingDirected=false}
 if(directedScene)state.sceneDirected=true
 if(mood){state.lightingDirected=directedLight||(mood===state.lighting&&state.lightingDirected);state.lighting=mood}
}
function stageSceneCue(state:StageSceneState,cue:TheaterCue){
 if(cue.kind==='scene')stageSceneAdvance(state,cue.effect,'',true)
 else if(cue.kind==='lighting')stageSceneAdvance(state,'',cue.effect,false,true)
 else if(cue.kind==='weather')state.weather=cue.effect
}
// Continuity comes from the supplied active history, not a mutable cursor.
function stageSceneHistory(state:StageSceneState,source:string){
 for(const unit of theaterLiveUnits(source+'\n\n')){const cue=stageCueSpans(unit)[0]?.cue;if(cue){stageSceneCue(state,cue);continue}
  const packet=[...castPacketInput(unit).matchAll(castEnvelopePattern())];if(packet.length===1&&castPacketInput(unit).trim().startsWith('<swarm-cast='))stageSceneAdvance(state,castPacketBackground(packet[0][2]),castPacketAtmosphere(packet[0][2]))
 }
}
function stageDirectionState(messages:unknown[]):string {
 const state=stageSceneState();for(const value of messages){const row=recipeRecord(value);if(row.role!=='assistant'&&!(row.role==null&&row.is_user===false)||typeof row.content!=='string')continue;stageSceneHistory(state,row.content)}
 const {scene,lighting,weather}=state;return [scene&&`scene=${scene}`,lighting&&`lighting=${lighting}`,weather&&`weather=${weather}`].filter(Boolean).join('; ')
}
function stageDirectionInsert(messages:any[],message:{role:string;content:string},position:StageDirectionConfig['position'],depth=0):any[]{
 const history=messages.flatMap((m,i)=>m?.__isChatHistory?[i]:[]);const index=history.length?(position==='before'?history[0]:position==='after'||depth===0?history.at(-1)!+1:history[Math.max(0,history.length-depth)]):messages.length
 return [...messages.slice(0,index),message,...messages.slice(index)]
}
