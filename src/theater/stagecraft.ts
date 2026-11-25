// Stagecraft is a projection of captured history, not a second Cast database.
// Each frame owns a bounded roster snapshot; rewinding cannot see future expressions.
interface TheaterActor {id:string;name:string;expression:string;src:string;side:'left'|'right'|'auto';crop?:{x:number;y:number;zoom:number}}
interface TheaterActorState {actors:TheaterActor[];speaker:string}
function theaterActorFromFrame(frame:TheaterFrame):TheaterActor|null {
 if(frame.kind!=='cast')return null
 const card=frame.content.querySelector<HTMLElement>('[data-swarm-cast]');if(!card)return null
 const images=card.querySelectorAll<HTMLImageElement>('img');const image=card.querySelector<HTMLImageElement>('img[data-cast-asset]')||(images.length===1?images[0]:null)
 if(!image)return null
 const parts=image.alt.split(' · '),expression=parts.pop()||'',name=parts.join(' · ').trim(),src=theaterImageUrl(image.getAttribute('src')||'')
 if(!name||!expression||!src)return null
 const id=card.dataset.castMemberId?'member:'+card.dataset.castMemberId:'name:'+name.normalize('NFKC').toLowerCase()
 const side=card.dataset.castSide==='left'||card.dataset.castSide==='right'?card.dataset.castSide:'auto'
 const number=(k:string,d:number,lo:number,hi:number)=>{const n=parseFloat(card.style.getPropertyValue(k));return Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):d};const crop=card.dataset.castCropEnabled==='true'?{x:number('--cast-crop-x',50,0,100),y:number('--cast-crop-y',20,0,100),zoom:number('--cast-crop-scale',1,.1,5)}:undefined
 return {id,name,expression,src,side,crop}
}
function theaterActorTimeline(frames:TheaterFrame[],clears:ReadonlySet<string>=new Set()):TheaterActorState[]{
 const roster=new Map<string,TheaterActor>()
 return frames.map(frame=>{
  if(frame.sceneBoundary||clears.has(frame.key))roster.clear()
  const actor=theaterActorFromFrame(frame)
  if(actor){roster.delete(actor.id);roster.set(actor.id,actor);while(roster.size>4)roster.delete(roster.keys().next().value!)}
  return {actors:[...roster.values()],speaker:actor?.id||''}
 })
}
function theaterStageDefaults(art:TheaterArtSettings){
 const id=art.preset
 return {actors:art.actors??(['renai','reverie','ghost'].includes(id)),limit:art.actorLimit??2,saturation:art.actorSaturation??(id==='renai'?30:0),scale:art.actorScale??92,opacity:art.actorOpacity??100,actorBrightness:art.actorBrightness??75,motion:art.actorMotion!==false,scenery:art.scenery??({ghost:'crt',reverie:'celestial',velvet:'deco',ephemera:'manuscript','paper-riot':'halftone',critical:'halftone'} as Partial<Record<TheaterArtId,TheaterSceneryId>>)[id]??'none',placement:art.sceneryPlacement??'fallback',tint:art.sceneryTint||theaterArtPalette(art)[3],patternOpacity:art.sceneryOpacity??65,patternScale:art.sceneryScale??100,brightness:art.brightness??100,vignette:art.vignette??0}
}
// Positions are based on the latest observed side; opposing actors never share a slot.
// An explicit side wins for the most recent actor, then other actors take free slots.
function theaterActorSlots(actors:TheaterActor[]):Map<string,number>{
 const slots=new Map<string,number>(),used=new Set<number>(),n=actors.length
 const positions=n===1?[actors[0].side==='left'?35:actors[0].side==='right'?65:50]:n===2?[25,75]:n===3?[18,50,82]:[13,38,62,87]
 for(const actor of [...actors].reverse()){
  const available=positions.filter(x=>!used.has(x));const wanted=actor.side==='left'?0:actor.side==='right'?100:50
  const x=available.sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];if(x===undefined)continue;used.add(x);slots.set(actor.id,x)
 }
 return slots
}
function theaterStageActorLayer(layer:HTMLElement,state:TheaterActorState|undefined,frame:TheaterFrame|undefined,art:TheaterArtSettings,projection:HTMLElement|null,native=false){
 const cfg=theaterStageDefaults(art),speaker=state?.speaker||'',all=cfg.actors?(state?.actors||[]).slice(-cfg.limit):native?(state?.actors||[]).filter(a=>a.id===speaker):[]
 const world=projection?.shadowRoot?.querySelector<HTMLElement>('.atelier-curated .world')||null
 const codec=projection?.shadowRoot?.querySelector<HTMLElement>('.th-codec-monitor')||null
 const inactive=all.filter(a=>a.id!==speaker)
 // Keep original active card and its layout. Only world stages and Codec have an
 // explicit safe place for a secondary actor during dialogue; others retain them on narration.
 const worldMode=frame?.kind==='cast'&&!!world&&!!speaker&&inactive.length>0
 const visible=frame?.kind==='narration'?all:native&&frame?.kind==='cast'?all:worldMode?inactive:[]
 if(codec&&speaker&&inactive.length){const actor=inactive[inactive.length-1],portrait=document.createElement('div');portrait.className='th-codec-history';const image=document.createElement('img');image.src=actor.src;image.alt=actor.name+' · '+actor.expression;const label=document.createElement('small');label.textContent=actor.name+' / LAST SEEN';portrait.append(image,label);codec.replaceChildren(portrait)}
 layer.dataset.visible=String(visible.length>0);layer.dataset.mode=native?'native':worldMode?'world':'narration';layer.dataset.motion=String(cfg.motion);layer.dataset.actorCount=String(all.length);layer.style.setProperty('--actor-sat',String(cfg.saturation/100));layer.style.setProperty('--actor-scale',String(cfg.scale/100));layer.style.setProperty('--actor-opacity',String(cfg.opacity/100));layer.style.setProperty('--actor-brightness',String(cfg.actorBrightness/100))
 if(projection)projection.dataset.stageActors=String(worldMode)
 const worldBox=world?.getBoundingClientRect(),activeBox=world?.querySelector('[data-cast-asset]')?.getBoundingClientRect();const activeSide=worldBox&&activeBox&&worldBox.width?((activeBox.left+activeBox.width/2-worldBox.left)/worldBox.width<.5?'left':'right'):null
 const slots=theaterActorSlots(all.map(a=>a.id===speaker&&activeSide?{...a,side:activeSide}:a)),existing=new Map(Array.from(layer.children).map(el=>[(el as HTMLElement).dataset.actorId,el as HTMLElement]))
 // Keep nodes for the entire roster, including the active speaker (hidden while their card is displayed).
 // This avoids rebuilding inactive sprites between consecutive narration paragraphs.
 for(const actor of all){let node=existing.get(actor.id);existing.delete(actor.id)
  if(!node){node=document.createElement('figure');node.className='stage-actor-memory';node.dataset.actorId=actor.id;const img=document.createElement('img');img.decoding='async';img.draggable=false;node.append(img);const caption=document.createElement('figcaption');node.append(caption);layer.append(node)}
  const image=node.querySelector('img')!;if(image.getAttribute('src')!==actor.src)image.src=actor.src;image.alt=actor.name+' · '+actor.expression;const crop=native?actor.crop:undefined;image.style.objectPosition=crop?`${crop.x}% ${crop.y}%`:'';image.style.transform=crop?`scale(${crop.zoom})`:'';image.style.transformOrigin=crop?`${crop.x}% ${crop.y}%`:'';node.toggleAttribute('data-native-crop',!!crop);node.querySelector('figcaption')!.textContent=actor.name
  node.style.setProperty('--actor-x',(slots.get(actor.id)||50)+'%');node.dataset.visible=String(visible.some(x=>x.id===actor.id));node.dataset.expression=actor.expression;node.dataset.active=String(actor.id===speaker);node.setAttribute('aria-hidden','true')
 }
 for(const node of existing.values())node.remove()
 return {visible:visible.length,world:worldMode?world:null}
}
// All SVGs are generated locally from fixed geometry and validated hex colors.
// No user-supplied SVG, URLs, event handlers, external fonts, filters or network fetches.
type TheaterSceneryId='none'|'celestial'|'botanical'|'deco'|'halftone'|'crt'|'shoujo'|'glass'|'manuscript'|'ink'
const THEATER_SCENERY:{id:TheaterSceneryId;name:string;tag:string}[]=[
 {id:'none',name:'None',tag:'Original scenery'}, {id:'celestial',name:'Celestial Atlas',tag:'Astral chart'}, {id:'botanical',name:'Herbarium',tag:'Botanical silhouettes'}, {id:'deco',name:'Gilded Deco',tag:'Architectural fans'}, {id:'halftone',name:'Ink & Halftone',tag:'Comic print'}, {id:'crt',name:'Radar Grid',tag:'Codec telemetry'}, {id:'shoujo',name:'Shōjo Reverie',tag:'Stars & bubbles'}, {id:'glass',name:'Rose Window',tag:'Stained glass'}, {id:'manuscript',name:'Manuscript',tag:'Ruled vellum'}, {id:'ink',name:'Mountain Ink',tag:'Layered landscape'}]
function theaterScenerySvg(id:TheaterSceneryId,tint:string):string{
 const c=/^#[0-9a-f]{6}$/i.test(tint)?tint:'#b6a0d9',series=(n:number,f:(i:number)=>string)=>Array.from({length:n},(_,i)=>f(i)).join('');let body=''
 switch(id){
  case 'celestial':body=`<g fill="none" stroke="${c}" stroke-width="1.2">${series(4,i=>`<circle cx="320" cy="200" r="${55+i*42}" opacity="${.9-i*.15}"/>`)}<ellipse cx="320" cy="200" rx="275" ry="94" transform="rotate(-27 320 200)"/><ellipse cx="320" cy="200" rx="250" ry="110" transform="rotate(31 320 200)" stroke-dasharray="2 8"/>${series(48,i=>`<path d="M320 7v${i%4===0?13:6}" transform="rotate(${i*7.5} 320 200)"/>`)}</g><g fill="${c}">${series(85,i=>`<circle cx="${(i*139+21)%640}" cy="${(i*83+17)%400}" r="${.5+i%4*.55}" opacity="${.3+i%5*.13}"/>`)}<path d="M320 137l12 50 50 13-50 12-12 51-12-51-50-12 50-13Z"/><circle cx="320" cy="200" r="18" fill="none" stroke="${c}"/></g>`;break
  case 'botanical':body=`<g fill="${c}" stroke="${c}">${series(12,i=>{const x=i*62-25,h=190+i%4*47;return `<g transform="translate(${x} 410) rotate(${i%2?12:-12})"><path d="M0 0Q-40 ${-h/2} 19 ${-h}" stroke-width="2" fill="none" opacity=".75"/>${series(7,j=>`<ellipse cx="${j%2?-13:13}" cy="${-25-j*h/8}" rx="${11+j%3*3}" ry="${22+j%2*9}" transform="rotate(${j%2?-45:45} ${j%2?-13:13} ${-25-j*h/8})" opacity="${.28+j*.065}"/>`)}</g>`})}</g><g fill="none" stroke="${c}" opacity=".4"><path d="M12 12H628V388H12Z"/><path d="M24 24H616V376H24Z"/></g>`;break
  case 'deco':body=`<g fill="none" stroke="${c}">${series(9,i=>`<path d="M${i*86-165} 400L${i*86-43} 35 ${i*86+79} 400M${i*86-120} 400L${i*86-43} 112 ${i*86+34} 400M${i*86-82} 400L${i*86-43} 215 ${i*86-4} 400" stroke-width="2" opacity=".8"/>`)}<rect x="14" y="14" width="612" height="372" stroke-width="3"/><rect x="25" y="25" width="590" height="350"/><path d="M0 70H640M0 78H640M0 330H640M0 338H640" opacity=".55"/><path d="M320 13l20 22-20 22-20-22Z" stroke-width="2"/></g>`;break
  case 'halftone':body=`<g fill="${c}">${series(32,i=>series(20,j=>`<circle cx="${i*20+10}" cy="${j*20+10}" r="${1+((i+j)%12)*.52}" opacity="${.23+(j%4)*.12}"/>`))}</g><g fill="${c}" opacity=".36"><path d="M0 0H285L0 145Z M640 400H350L640 270Z"/>${series(9,i=>`<path d="M0 ${i*24+130}L${220+i*35} 200 0 ${i*24+133}Z"/>`)}</g>`;break
  case 'crt':body=`<defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${c}" opacity=".27"/></pattern></defs><rect width="640" height="400" fill="url(#grid)"/><g stroke="${c}" fill="none">${series(5,i=>`<circle cx="320" cy="200" r="${30+i*36}" opacity=".6"/>`)}<path d="M0 200H640M320 0V400M320 200l120-107" stroke-dasharray="5 7"/><path d="M22 62V22H62M578 22H618V62M22 338V378H62M578 378H618V338" stroke-width="3"/></g><path d="M320 200L320 20A180 180 0 0 1 447 73Z" fill="${c}" opacity=".15"/><g fill="${c}" font-family="monospace" font-size="12"><text x="35" y="43">RX / STANDBY</text><text x="35" y="367">SECTOR 04 // GRID</text>${series(12,i=>`<rect x="${460+i*12}" y="350" width="8" height="${8+i%4*4}" opacity="${.3+i%5*.14}"/>`)}</g>`;break
  case 'shoujo':body=`<g fill="${c}">${series(42,i=>{const x=(i*137+27)%640,y=(i*83+13)%400,r=4+i%6*3;return `<circle cx="${x}" cy="${y}" r="${r*2}" opacity=".13"/><path d="M${x} ${y-r}l${r*.2} ${r*.8} ${r*.8} ${r*.2}-${r*.8} ${r*.2}-${r*.2} ${r*.8}-${r*.2}-${r*.8}-${r*.8}-${r*.2} ${r*.8}-${r*.2}Z" opacity=".7"/>`})}</g><g fill="none" stroke="${c}" opacity=".45">${series(6,i=>`<circle cx="${i*121}" cy="${(i%2)*400}" r="${65+i%3*24}" stroke-width="2"/>`)}</g>`;break
  case 'glass':body=`<g transform="translate(320 200)">${series(16,i=>`<g transform="rotate(${i*22.5})"><path d="M0 0L-30-130Q0-185 30-130Z" fill="${c}" fill-opacity="${.13+i%4*.14}" stroke="${c}" stroke-width="2"/><path d="M0-15L-50-150Q0-220 50-150Z" fill="none" stroke="${c}" opacity=".55"/></g>`)}<circle r="185" stroke="${c}" fill="none" stroke-width="4"/><circle r="170" stroke="${c}" fill="none"/><circle r="33" fill="${c}" fill-opacity=".35" stroke="${c}" stroke-width="3"/></g><path d="M0 0H640V400H0ZM12 12V388H628V12Z" fill="${c}" fill-rule="evenodd" opacity=".3"/>`;break
  case 'manuscript':body=`<g stroke="${c}" fill="none"><rect x="24" y="18" width="592" height="364" stroke-width="2" opacity=".75"/><rect x="32" y="26" width="576" height="348" opacity=".45"/>${series(18,i=>`<path d="M58 ${44+i*18}H582" opacity=".24"/>`)}<path d="M82 27V373M558 27V373" opacity=".6"/><path d="M34 34Q110 34 110 98Q110 47 58 47Q51 102 34 112M606 366Q530 366 530 302Q530 353 582 353Q589 298 606 288" stroke-width="3"/></g><g fill="${c}" opacity=".4">${series(6,i=>`<ellipse cx="${48+i*8}" cy="${45+i*9}" rx="5" ry="13" transform="rotate(-45 ${48+i*8} ${45+i*9})"/>`)}</g>`;break
  case 'ink':body=`<circle cx="484" cy="80" r="44" fill="${c}" opacity=".52"/><g fill="${c}"><path d="M0 400V235L70 180 125 210 207 89 285 212 348 137 431 236 520 127 640 215V400Z" opacity=".19"/><path d="M0 400V270L93 192 160 270 260 164 318 255 417 185 508 273 570 213 640 257V400Z" opacity=".33"/><path d="M0 400V325L84 272 140 313 224 252 283 331 392 264 510 324 640 278V400Z" opacity=".63"/></g><g fill="none" stroke="${c}" opacity=".4">${series(6,i=>`<path d="M${50+i*55} ${347+i%3*10}q80 -13 170 0"/>`)}</g>`;break
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">${body}</svg>`
}
function theaterSceneryUrl(id:TheaterSceneryId,tint:string){return `url("data:image/svg+xml,${encodeURIComponent(theaterScenerySvg(id,tint))}")`}
// Reuse Cast's validated palette and filter coefficients; never import authored CSS.
const THEATER_MOOD_VARS=['--cast-atmosphere-wash','--cast-atmosphere-scene','--cast-atmosphere-actor'] as const
function theaterMoodVisual(frame:TheaterFrame|undefined,art:TheaterArtSettings,settings:unknown){
 const prefs=cleanCastAtmosphereSettings(settings),manual=art.mood&&art.mood!=='follow';
 const key=manual?art.mood:frame?.mood||'none';
 return castAtmosphereVisual(key,{...prefs,enabled:manual||frame?.moodDirected?true:prefs.enabled,intensity:art.moodIntensity??prefs.intensity,actor:art.moodActor??prefs.actor})
}
function theaterMoodPaint(node:HTMLElement,visual:ReturnType<typeof castAtmosphereVisual>,card=false){
 const values=document.createElement('span').style;if(visual)values.cssText=visual.css;
 for(const prop of THEATER_MOOD_VARS){const value=values.getPropertyValue(prop);if(value)node.style.setProperty(prop,value);else node.style.removeProperty(prop)}
 if(card){delete node.dataset.castAtmosphere;delete node.dataset.castAtmosphereAnimation;delete node.dataset.castAtmosphereTransition;
  if(visual){node.dataset.castAtmosphere=visual.key;node.dataset.castAtmosphereTransition=String(visual.transitions);node.dataset.castAtmosphereAnimation='false'}
 }else {node.dataset.stageMood=visual?.key||'none';node.dataset.stageMoodTransition=String(!!visual?.transitions)}
}
function theaterStageScenery(shell:HTMLElement,frame:TheaterFrame|undefined,art:TheaterArtSettings){
 const cfg=theaterStageDefaults(art),scene=frame?.scene||'',pattern=cfg.scenery!=='none'&&(cfg.placement!=='fallback'||!scene),replacement=pattern&&cfg.placement==='replacement'
 shell.dataset.stagePattern=String(pattern);shell.dataset.stagePlacement=cfg.placement;shell.style.setProperty('--stage-brightness',String(cfg.brightness/100));shell.style.setProperty('--stage-vignette',String(cfg.vignette/100));shell.style.setProperty('--stage-pattern-opacity',String(cfg.patternOpacity/100));shell.style.setProperty('--stage-pattern-size',cfg.patternScale+'%')
 const scenery=shell.querySelector<HTMLElement>('.scenery')!,layer=shell.querySelector<HTMLElement>('.stagecraft-pattern')!;scenery.style.backgroundImage=scene&&!replacement?`url(${JSON.stringify(scene)})`:''
 const signature=pattern?cfg.scenery+':'+cfg.tint:'';if(layer.dataset.patternKey!==signature){layer.dataset.patternKey=signature;layer.style.backgroundImage=pattern?theaterSceneryUrl(cfg.scenery,cfg.tint):''}
 return {pattern,replacement}
}
const THEATER_STAGECRAFT_CSS=`
.stagecraft-pattern,.stagecraft-light,.stagecraft-actors{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.stagecraft-pattern{z-index:-1;background-position:center;background-repeat:repeat;background-size:var(--stage-pattern-size,100%) var(--stage-pattern-size,100%);opacity:var(--stage-pattern-opacity,.65);filter:brightness(var(--stage-brightness,1));}
.stagecraft-light{z-index:0;background:radial-gradient(ellipse at 50% 44%,transparent 35%,rgba(0,0,0,var(--stage-vignette,0)) 100%)}
.shell[data-art] .scenery{filter:brightness(var(--stage-brightness,1)) blur(var(--art-blur))}
.shell[data-art=paper-riot] .scenery{filter:brightness(var(--stage-brightness,1)) grayscale(1) contrast(1.2) blur(var(--art-blur))}
.shell[data-art=ghost] .scenery{filter:brightness(var(--stage-brightness,1)) grayscale(1)}
.shell[data-art=ephemera] .scenery{filter:brightness(var(--stage-brightness,1)) sepia(.5) blur(var(--art-blur))}
.stagecraft-actors{z-index:0;inset:auto;overflow:hidden;isolation:isolate}
.stage-actor-memory{position:absolute;bottom:0;left:var(--actor-x,50%);width:min(48%,580px);height:92%;margin:0;display:flex;align-items:flex-end;justify-content:center;opacity:0;transform:translateX(-50%) scale(var(--actor-scale,.92));transform-origin:center bottom;filter:saturate(var(--actor-sat,.15)) brightness(var(--actor-brightness,.75));transition:opacity .28s ease,filter .28s ease,transform .28s ease,left .28s ease;}
.stage-actor-memory[data-visible=true]{opacity:var(--actor-opacity,.76)}
.stage-actor-memory img{width:100%;height:100%;object-fit:contain;object-position:bottom center;display:block;filter:drop-shadow(0 8px 24px #0005)}
.stage-actor-memory figcaption{display:none}.stagecraft-actors[data-actor-count="3"] .stage-actor-memory,.stagecraft-actors[data-actor-count="4"] .stage-actor-memory{width:33%}
.stagecraft-actors[data-mode=world] .stage-actor-memory{height:92%;width:50%}
.shell[data-actors-visible=true][data-screen=narration] .frame[data-kind=narration]{margin-top:auto;margin-bottom:0;gap:8px;max-width:min(var(--art-width),100%)}
.shell[data-actors-visible=true][data-screen=narration] .prose{background:linear-gradient(0deg,color-mix(in srgb,var(--art-bg) 94%,transparent),color-mix(in srgb,var(--art-bg) 78%,transparent));text-shadow:0 2px 4px #0008;}
.shell[data-art=renai][data-actors-visible=true] .frame[data-kind=narration]{max-width:min(1100px,100%)}
.shell[data-art=ghost] .stage-actor-memory{height:54%;bottom:33%;width:min(40%,360px);border:1px solid var(--accent);background:radial-gradient(ellipse,#31553c,#07130b);overflow:hidden;filter:saturate(var(--actor-sat)) sepia(.5) hue-rotate(65deg) brightness(var(--actor-brightness,.75));}
.shell[data-art=ghost] .stage-actor-memory img{object-fit:cover;object-position:50% 14%}.shell[data-art=ghost] .stage-actor-memory::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,#05100955 0 1px,transparent 1px 3px)}
.shell[data-art=ephemera] .stage-actor-memory{bottom:26%;height:64%;padding:9px 9px 24px;background:var(--plate);border:1px solid var(--accent);box-shadow:0 4px 10px #0005;transform:translateX(-50%) rotate(-3deg) scale(var(--actor-scale))}.shell[data-art=ephemera] .stage-actor-memory:nth-child(even){transform:translateX(-50%) rotate(3deg) scale(var(--actor-scale))}.shell[data-art=ephemera] .stage-actor-memory figcaption{display:block;position:absolute;bottom:5px;color:var(--ink);font:italic 11px Georgia}
.shell[data-art=paper-riot] .stage-actor-memory{border:2px solid var(--ink);bottom:25%;height:70%;background:var(--plate);filter:grayscale(1) brightness(var(--actor-brightness,.75))}
.shell[data-art=velvet] .stage-actor-memory{filter:saturate(var(--actor-sat)) brightness(var(--actor-brightness,.75))}
.stagecraft-actors[data-motion=false] .stage-actor-memory{transition:none}
@starting-style{.stagecraft-actors[data-motion=true] .stage-actor-memory[data-visible=true]{opacity:0}}
.shell[data-art][data-stage-world-open=true] .scenery{opacity:.82}
.shell[data-art][data-stage-world-open=true] .scenery::after{background:linear-gradient(0deg,var(--art-bg),color-mix(in srgb,var(--art-bg) calc(var(--art-dim)*100%),transparent) 52%,transparent 95%)}
.stagecraft-actors[data-visible=false]{visibility:hidden}
.stagecraft-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.stagecraft-tabs button{font-size:11px;padding:8px 2px;white-space:nowrap}
.scenery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}:is(.scenery-tile,.mood-tile){display:grid;gap:4px;min-width:0;padding:5px!important;text-align:left}:is(.scenery-tile,.mood-tile) span{display:block;aspect-ratio:1.6;background-color:var(--art-bg);background-position:center;background-size:cover;border:1px solid color-mix(in srgb,var(--accent) 25%,transparent)}:is(.scenery-tile,.mood-tile) strong{font-size:11px;overflow-wrap:anywhere}:is(.scenery-tile,.mood-tile) small{font-size:9px;color:var(--muted)}
@media(max-width:600px){.stage-actor-memory{height:86%;width:58%}.stagecraft-actors[data-mode=world] .stage-actor-memory{height:90%;width:53%}.shell[data-actors-visible=true][data-screen=narration] .prose{padding:14px!important;font-size:clamp(16px,var(--text-size),24px);max-height:none}.shell[data-art=ghost] .stage-actor-memory{height:43%;bottom:45%;width:43%}:is(.scenery-tile,.mood-tile) small{display:none}.stagecraft-tabs button{font-size:10px}.shell[data-art=ephemera] .stage-actor-memory{height:53%;bottom:35%}}
/* Grade individual visual layers, never the UI, prose, CG or HTML. */
.shell[data-stage-mood]:not([data-stage-mood=none]) .scenery{filter:var(--cast-atmosphere-scene,brightness(1)) brightness(var(--stage-brightness,1)) blur(var(--art-blur))}
.shell[data-stage-mood]:not([data-stage-mood=none])[data-art=paper-riot] .scenery{filter:var(--cast-atmosphere-scene,brightness(1)) brightness(var(--stage-brightness,1)) grayscale(1) contrast(1.2) blur(var(--art-blur))}
.shell[data-stage-mood]:not([data-stage-mood=none])[data-art=ghost] .scenery{filter:var(--cast-atmosphere-scene,brightness(1)) brightness(var(--stage-brightness,1)) grayscale(1)}
.shell[data-stage-mood]:not([data-stage-mood=none])[data-art=ephemera] .scenery{filter:var(--cast-atmosphere-scene,brightness(1)) brightness(var(--stage-brightness,1)) sepia(.5) blur(var(--art-blur))}
.shell[data-stage-mood]:not([data-stage-mood=none]) .stagecraft-light{background:radial-gradient(ellipse at 50% 44%,transparent 35%,rgba(0,0,0,var(--stage-vignette,0)) 100%),var(--cast-atmosphere-wash)}
.shell[data-stage-mood]:not([data-stage-mood=none]) .stage-actor-memory img{filter:var(--cast-atmosphere-actor,brightness(1)) drop-shadow(0 8px 24px #0005)}
.shell[data-stage-mood-transition=true] .scenery,.shell[data-stage-mood-transition=true] .stage-actor-memory img{transition:filter .25s ease}
@media(prefers-reduced-motion:reduce){.stage-actor-memory,.shell[data-stage-mood-transition=true] .scenery,.shell[data-stage-mood-transition=true] .stage-actor-memory img{transition:none!important}}
`
const THEATER_STAGECRAFT_CARD_CSS=`
:host([data-stage-actors=true]) .ss-cast-design .atelier-curated .world{background:transparent!important;background-image:none!important;--world:none!important}
:host([data-stage-actors=true]) .ss-cast-design .atelier-curated .world .scene-shade{background:linear-gradient(0deg,#08081055,transparent 60%)!important}
:host([data-stage-lit=true]) .ss-cast-design .atelier-curated .world,:host([data-stage-pattern=true]) .ss-cast-design .atelier-curated .world{background:transparent!important;background-image:none!important;--world:none!important}
:host([data-stage-lit=true]) .ss-cast-design[data-cast-atmosphere] .atelier-curated .world::before,:host([data-stage-pattern=true]) .ss-cast-design[data-cast-atmosphere] .atelier-curated .world::before,:host([data-stage-actors=true]) .ss-cast-design[data-cast-atmosphere] .atelier-curated .world::before{background-image:none!important}
.ss-cast-design[data-cast-atmosphere] img[data-cast-asset]{filter:var(--cast-atmosphere-actor,none)}
.th-codec-history{position:relative;width:100%;height:100%;min-height:120px;overflow:hidden;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;background:radial-gradient(ellipse,#34543a,#0b190f)}.th-codec-history img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 15%;filter:grayscale(1) sepia(.5) hue-rotate(65deg) brightness(.75)}.th-codec-history::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,#0004 0 1px,transparent 1px 3px);pointer-events:none}.th-codec-history small{position:relative;z-index:1;background:#08150dd9;color:#d9f5ce!important;padding:5px;overflow-wrap:anywhere}
`
const THEATER_STAGECRAFT_INSPECTOR_CSS=`
.stagecraft-tabs[hidden]{display:none!important}.stagecraft-roster{display:flex;gap:8px;flex-wrap:wrap}.stagecraft-roster-item{display:grid;grid-template-columns:40px minmax(0,1fr);align-items:center;gap:6px;max-width:100%;padding:5px;border:1px solid var(--line);border-radius:5px}.stagecraft-roster-item img{width:40px;height:48px;object-fit:contain}.stagecraft-roster-item small{font-size:11px;overflow-wrap:anywhere}
`

// Native staging is a distinct projection, not an Atelier card with its frame hidden.
function theaterNativeCast(f:TheaterFrame,art:TheaterArtSettings,projection:HTMLElement):HTMLElement|null{
 if(f.kind!=='cast'||art.staging==='authored')return null
 const card=projection.shadowRoot?.querySelector<HTMLElement>('[data-swarm-cast]'),raw=f.content.querySelector<HTMLElement>('[data-swarm-cast]'),actor=theaterActorFromFrame(f),dialogue=card?.querySelector<HTMLElement>('[data-swarm-cast-dialogue]');if(!card||!raw||!actor||!dialogue)return null
 const composition=CAST_PRESENTATION_INDEX.get(card.dataset.castPreset||'')?.composition
 if(art.staging!=='native'&&composition!=='scene')return null
 const dock=document.createElement('section');dock.className='native-dialogue';dock.dataset.sourcePreset=card.dataset.castPreset||''
 const head=document.createElement('div');head.className='native-dialogue-head';const name=document.createElement('strong');name.textContent=actor.name;const mood=document.createElement('small');mood.textContent=actor.expression;head.append(name,mood)
 const text=document.createElement('div');text.className='native-quote';text.dataset.swarmCastDialogue='true';const voice=raw.style.getPropertyValue('--cast-voice').trim();if(voice&&voice.length<80&&!/[;{}]/.test(voice)&&!/url\s*\(|var\s*\(/i.test(voice)&&CSS.supports('color',voice)){text.style.color=voice;dock.style.setProperty('--native-voice',voice)}
 theaterInlinePaint(dialogue,text);for(const child of [...dialogue.childNodes]){const copy=theaterCopy(child,false);if(copy)text.append(copy)}
 if(!text.textContent?.trim())return null
 const scene=f.manualSceneName||f.storySceneName||raw.querySelector('.vn-top,.afterglow-kicker,.rain-number')?.textContent?.replace(/^SCENE\s*\/\/\s*/,'').replace(/\s*\/\/\s*TAKE.*$|\s*\/ LIVE FEED$/,'').trim();if(f.scene&&scene){const location=document.createElement('span');location.className='native-location';location.textContent=scene;head.append(location)}
 dock.append(head,text);return dock
}
