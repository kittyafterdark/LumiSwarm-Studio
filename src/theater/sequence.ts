// Read-only projection of host-rendered message content. No original node is moved.
type TheaterKind = 'narration' | 'cast' | 'cg' | 'html'
interface TheaterFrame { key:string; messageId:string; kind:TheaterKind; content:DocumentFragment; text:string; image:string; scene:string; sheets:CSSStyleSheet[]; source?:Element; sceneBoundary?:boolean; sceneKey?:string; explicitScene?:string; inheritedScene?:string; inheritedMood?:CastAtmosphereKey; manualSceneName?:string; storySceneName?:string; sceneDirected?:boolean; explicitMood?:CastAtmosphereKey; mood?:CastAtmosphereKey; moodDirected?:boolean; htmlContext?:Record<string,string>; cueOnly?:TheaterCue; cues?:TheaterCue[]; fx?:TheaterFxState }
const THEATER_CAST='[data-ss-cast-slot="1"], [data-swarm-cast]'
const THEATER_SKIP='script,style,link,meta,template,noscript,button,input,select,textarea,iframe,object,embed,video,audio,canvas,[hidden],[aria-hidden="true"],[data-swarm-studio-inline-action],[data-regex-action], [data-spindle-mount], [data-long-message-toggle]'
const THEATER_INLINE=new Set(['a','abbr','b','br','cite','code','del','em','font','i','kbd','mark','q','s','small','span','strong','sub','sup','time','u','wbr'])
const THEATER_SVG=new Set(['svg','g','path','circle','ellipse','rect','line','polyline','polygon','defs','linearGradient','radialGradient','stop','clipPath','mask','text','tspan','title','desc'])
const THEATER_SVG_ATTRIBUTES=new Set(['class','style','id','viewBox','width','height','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','d','points','fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-linecap','stroke-linejoin','stroke-dasharray','stroke-opacity','opacity','transform','preserveAspectRatio','gradientUnits','gradientTransform','offset','stop-color','stop-opacity','clip-path','mask','font-size','font-weight','font-family','text-anchor','dominant-baseline'])
const THEATER_ELEMENTS=new Set([...THEATER_INLINE,'article','aside','blockquote','caption','col','colgroup','dd','details','div','dl','dt','fieldset','figcaption','figure','footer','h1','h2','h3','h4','h5','h6','header','hr','img','legend','li','main','nav','ol','p','pre','section','summary','table','tbody','td','tfoot','th','thead','tr','ul'])
function theaterImageUrl(value:string):string {
  if(!value)return ''
  try {const url=new URL(value,document.baseURI);return ['https:','http:','blob:'].includes(url.protocol)||/^data:image\/(?:png|jpeg|webp|gif|avif);base64,/i.test(value)?value:''}catch{return ''}
}
function theaterVisible(el:Element):boolean {
  if(el.matches('[hidden],[aria-hidden="true"]'))return false
  if(!el.isConnected)return true
  const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&s.visibility!=='collapse'
}
// Explicit allowlist; no live listeners, navigation, custom elements, active widgets,
// IDs outside our shadow boundary, or original data action attributes are projected.
// Inline typography only: never copy layout, external URLs or action attributes
// into narration. Legacy <font color> is normalized to a styled span.
const THEATER_TEXT_PROPERTIES=['color','background-color','font-style','font-weight','text-decoration-line','text-decoration-color','text-transform','letter-spacing'] as const
function theaterInlinePaint(source:Element,target:HTMLElement):void {
  const style=(source as HTMLElement).style
  for(const property of THEATER_TEXT_PROPERTIES){
    const value=style?.getPropertyValue(property).trim()||''
    if(value&&value.length<=120&&!/url\s*\(|var\s*\(|[;{}]/i.test(value)&&CSS.supports(property,value))target.style.setProperty(property,value)
  }
  if(source.localName==='font'&&!target.style.color){const color=source.getAttribute('color')?.trim()||'';if(color&&color.length<=80&&!/[;{}]/.test(color)&&!/url\s*\(|var\s*\(/i.test(color)&&CSS.supports('color',color))target.style.color=color}
}
function theaterInlineTag(tag:string):string{return tag==='a'||tag==='font'?'span':tag}
function theaterCopy(node:Node,styled:boolean):Node|null {
  if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent||'')
  if(!(node instanceof Element))return null
  const tag=node.localName.toLowerCase()
  if(tag==='style'&&styled){const style=document.createElement('style');style.textContent=(node.textContent||'').replace(/@import\b[^;]*;/gi,'');return style}
  if(styled&&node.namespaceURI==='http://www.w3.org/2000/svg'){
    if(!THEATER_SVG.has(node.localName))return null
    const svg=document.createElementNS(node.namespaceURI,node.localName);for(const attr of [...node.attributes])if(THEATER_SVG_ATTRIBUTES.has(attr.name))svg.setAttribute(attr.name,attr.value);for(const child of [...node.childNodes]){const copy=theaterCopy(child,true);if(copy)svg.appendChild(copy)}return svg
  }
  const staticButton=styled&&tag==='button'&&!node.hasAttribute('data-swarm-studio-inline-action')
  if((node.matches(THEATER_SKIP)&&!staticButton)||(!theaterVisible(node)&&!(styled&&node.getAttribute('aria-hidden')==='true'&&!node.hasAttribute('hidden')&&getComputedStyle(node).display!=='none')))return null
  const out=document.createElement(staticButton?'button':THEATER_ELEMENTS.has(tag)?theaterInlineTag(tag):'span')
  if(staticButton){out.setAttribute('type','button');out.setAttribute('tabindex','-1')}
  if(styled){for(const attr of [...node.attributes]){
    if(['class','style','id','title','dir','lang','colspan','rowspan','open','width','height'].includes(attr.name)||attr.name==='data-swarm-cast'||attr.name==='data-swarm-cast-dialogue'||attr.name.startsWith('data-cast-')||attr.name==='data-ss-card-width')out.setAttribute(attr.name,attr.value)
  }}
  theaterInlinePaint(node,out)
  if(tag==='img'){
    const src=theaterImageUrl((node as HTMLImageElement).currentSrc||node.getAttribute('src')||'');if(!src)return null
    out.setAttribute('src',src);out.setAttribute('alt',node.getAttribute('alt')||'Illustration');out.setAttribute('loading','eager');out.setAttribute('decoding','async');out.setAttribute('draggable','false')
  }
  if(tag==='details')out.setAttribute('open','')
  for(const child of [...node.childNodes]){const copy=theaterCopy(child,styled);if(copy)out.append(copy)}
  return out
}
// HTML islands are already host-rendered/sanitized. Preserve their visual DOM,
// only safe native disclosure behavior: no executable elements, handlers, navigation or action data.
const THEATER_HTML_TAGS=new Set([...THEATER_ELEMENTS,'a','font','form','label','button','input','textarea','select','option','optgroup','output','progress','meter','address','bdi','bdo','dfn','ruby','rt','rp','samp','var','picture','source','wbr'])
const THEATER_HTML_ATTRS=new Set(['class','style','id','title','dir','lang','colspan','rowspan','open','width','height','hidden','role','align','valign','color','face','size','for','placeholder','value','rows','cols','multiple','selected','checked','min','max','step','type','disabled','readonly','start','reversed','scope','datetime','data-state','data-theme','data-variant','data-side','data-size','data-active'])
const THEATER_HTML_SVG=new Set([...THEATER_SVG,'symbol','use','marker','pattern','filter','feGaussianBlur','feOffset','feBlend','feColorMatrix','feComposite','feFlood','feMerge','feMergeNode','feDropShadow','feComponentTransfer','feFuncR','feFuncG','feFuncB','feFuncA'])
const THEATER_HTML_SVG_ATTRS=new Set([...THEATER_SVG_ATTRIBUTES,'stroke-miterlimit','stroke-dashoffset','clip-rule','vector-effect','paint-order','filter','filterUnits','primitiveUnits','marker-start','marker-mid','marker-end','markerWidth','markerHeight','markerUnits','refX','refY','orient','patternUnits','patternContentUnits','patternTransform','pattern','spreadMethod','fx','fy','fr','in','in2','result','stdDeviation','dx','dy','mode','type','values','operator','k1','k2','k3','k4','flood-color','flood-opacity','slope','intercept','amplitude','exponent','tableValues'])
function theaterHtmlCopy(node:Node):Node|null {
  if(node.nodeType===Node.TEXT_NODE)return document.createTextNode(node.textContent||'')
  if(!(node instanceof Element))return null
  const tag=node.localName.toLowerCase()
  if(node.matches('[data-swarm-studio-inline-action],[data-spindle-mount],[data-long-message-toggle]'))return null
  if(tag==='style'){const style=document.createElement('style');style.textContent=(node.textContent||'').replace(/@import\b[^;]*;/gi,'');return style}
  if(node.namespaceURI==='http://www.w3.org/2000/svg'){
    if(!THEATER_HTML_SVG.has(node.localName))return null
    const svg=document.createElementNS(node.namespaceURI,node.localName)
    for(const attr of [...node.attributes]){
      if((attr.name==='href'||attr.name==='xlink:href')&&node.localName==='use'&&/^#[\w.:-]+$/.test(attr.value)){svg.setAttribute('href',attr.value);continue}
      if(!THEATER_HTML_SVG_ATTRS.has(attr.name)&&!attr.name.startsWith('aria-'))continue
      if(attr.name!=='style'&&/url\s*\(/i.test(attr.value)&&!/^url\(\s*['"]?#[\w.:-]+['"]?\s*\)$/i.test(attr.value))continue
      svg.setAttribute(attr.name,attr.value)
    }
    for(const child of [...node.childNodes]){const copy=theaterHtmlCopy(child);if(copy)svg.appendChild(copy)}return svg
  }
  if(!THEATER_HTML_TAGS.has(tag))return null
  const out=document.createElement(tag)
  for(const attr of [...node.attributes])if(THEATER_HTML_ATTRS.has(attr.name)||attr.name.startsWith('aria-'))out.setAttribute(attr.name,attr.value)
  if(tag==='img'){
    const src=theaterImageUrl((node as HTMLImageElement).currentSrc||node.getAttribute('src')||'');if(!src)return null
    out.setAttribute('src',src);out.setAttribute('alt',node.getAttribute('alt')||'Illustration');out.setAttribute('draggable','false')
  }
  if(node.hasAttribute('tabindex')&&!out.matches('a,button,input,textarea,select,summary,label,form'))out.tabIndex=node.getAttribute('tabindex')==='-1'?-1:0
  if(out instanceof HTMLButtonElement){out.type='button';out.inert=true}
  if(out instanceof HTMLInputElement){if(!['text','search','tel','url','email','password','number','range','checkbox','radio','color','date','time','button','submit','reset','hidden'].includes(out.type))out.type='text';out.value=(node as HTMLInputElement).value;out.checked=(node as HTMLInputElement).checked;const localToggle=['checkbox','radio'].includes(out.type)&&!node.matches('[data-regex-action],[data-lumiverse-regex-action],[data-swarm-studio-inline-action]');out.inert=!localToggle;if(localToggle&&out.type==='radio'&&node.hasAttribute('name'))out.name=node.getAttribute('name')||''}
  if(out instanceof HTMLTextAreaElement||out instanceof HTMLSelectElement)out.inert=true
  for(const child of [...node.childNodes]){const copy=theaterHtmlCopy(child);if(copy)out.appendChild(copy)}
  if(out instanceof HTMLTextAreaElement)out.value=(node as HTMLTextAreaElement).value
  if(out instanceof HTMLSelectElement)for(const [i,option] of [...out.options].entries())option.selected=!!(node as HTMLSelectElement).options[i]?.selected
  return out
}
function theaterHtmlContext(source:Element):Record<string,string>{
  const css=getComputedStyle(source),context:Record<string,string>={}
  for(const name of ['color','color-scheme','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align','direction','white-space','word-break','overflow-wrap','box-sizing']){const value=css.getPropertyValue(name);if(value)context[name]=value}
  // Preserve chat's inherited theme/custom properties rather than recoloring the
  // island with the Theater preset. Scope the values to the projection host.
  for(const name of Array.from(css))if(name.startsWith('--')){const value=css.getPropertyValue(name);if(value)context[name]=value}
  return context
}
function theaterContentRoot(bubble:Element):Element|null {
  // Explicit host markers first. CSS-module content is a compatibility fallback,
  // never the outer message card/header. Fail closed when multiple roots compete.
  const selectors=['[data-component="MessageContent"]','[data-message-content], [data-message-body], .message-content','[class*="MessageContent_content"], [class*="_content_"]']
  for(const selector of selectors){
    if(bubble.matches(selector))return bubble
    const candidates=[...bubble.querySelectorAll(selector)].filter(e=>!e.closest(THEATER_CAST)&&theaterVisible(e))
    const leaves=candidates.filter(e=>!candidates.some(other=>other!==e&&e.contains(other)))
    if(leaves.length===1)return leaves[0]
    if(leaves.length>1)return null
  }
  // Some SDK builds return the content element directly. Only accept a simple
  // content-only root, not a bubble containing toolbar/header chrome.
  if(!bubble.querySelector('button,header,nav,[role="toolbar"], [role="button"]')&&[...bubble.children].some(e=>e.matches('p,blockquote,pre,figure,'+THEATER_CAST)))return bubble
  return null
}
function theaterScene(card:Element):string {
  const style=(card as HTMLElement).style?.getPropertyValue('--cast-world')||''
  const value=style.match(/^\s*url\(["']?([^"')]+)["']?\)\s*$/i)?.[1]||''
  return theaterImageUrl(value||(card as HTMLElement).dataset.castSceneUrl||'')
}
function theaterSnapshot(messageId:string,root:Element,allowDirection=true):TheaterFrame[] {
  const frames:TheaterFrame[]=[];let buffer=document.createDocumentFragment()
  function push(kind:TheaterKind,content:DocumentFragment,text:string,image='',scene='',sheets:CSSStyleSheet[]=[],source?:Element){
    const ordinal=frames.length;const signature=widgetKeyHash(kind+'|'+text+'|'+image+'|'+(source?.getAttribute('data-ss-cast-key')||''))
    const card=kind==='cast'?content.querySelector<HTMLElement>('[data-swarm-cast]'):null
    const inheritedMood=castAtmosphereKey(card?.dataset.castStageInheritedMood)||undefined
    frames.push({key:`${messageId}:${ordinal}:${signature}`,messageId,kind,content,text,image,scene,sheets,source,explicitScene:kind==='cast'?source?.getAttribute('data-ss-cast-background')||'':undefined,explicitMood:kind==='cast'?(castAtmosphereKey(source?.getAttribute('data-ss-cast-atmosphere')||(inheritedMood?'':card?.dataset.castAtmosphere))||undefined):undefined,inheritedScene:castKey(card?.dataset.castStageInheritedScene)||undefined,inheritedMood})
  }
  function pushCue(cue:TheaterCue){const text=theaterCueText(cue),content=document.createDocumentFragment();content.append(document.createTextNode(text));push('narration',content,text);frames[frames.length-1].cueOnly=cue}
  function flush(){const text=buffer.textContent?.trim()||'';if(castPacketInput(text).trim()){
    // Host Markdown uses breaks:true. textContent would concatenate the two
    // cue lines and turn an entire directive group into a visible intertitle.
    const copy=buffer.cloneNode(true) as DocumentFragment;for(const br of copy.querySelectorAll('br'))br.replaceWith(document.createTextNode('\n'))
    const cues=allowDirection&&!buffer.querySelector('code,pre,q,blockquote')?stageCueLines(copy.textContent||''):null
    if(cues)for(const cue of cues)pushCue(cue);else push('narration',buffer,text)
  }buffer=document.createDocumentFragment()}
  function appendInline(node:Node,ancestors:Element[]){const copied=theaterCopy(node,false);if(!copied)return;let target:Node=buffer;for(const a of ancestors){const wrap=document.createElement(theaterInlineTag(a.localName));theaterInlinePaint(a,wrap);target.appendChild(wrap);target=wrap}target.appendChild(copied)}
  function special(el:Element,kind:TheaterKind){
    flush();const content=document.createDocumentFragment();let text='',image='',scene='',sheets:CSSStyleSheet[]=[];let htmlContext:Record<string,string>|undefined
    if(kind==='cast'){
      const shadow=el.shadowRoot;const card=shadow?.querySelector('[data-swarm-cast]')||(el.matches('[data-swarm-cast]')?el:null)
      if(card){const copy=theaterCopy(card,true);if(copy)content.append(copy);text=card.querySelector('[data-swarm-cast-dialogue]')?.textContent?.trim()||card.textContent?.trim()||'';scene=theaterScene(card)}
      else {const fallback=document.createElement('p');fallback.textContent=el.textContent?.trim()||'Expression artwork is not ready.';content.append(fallback);text=fallback.textContent}
    } else if(kind==='cg'){
      const img=el.matches('img')?el as HTMLImageElement:[...el.querySelectorAll<HTMLImageElement>('img')].find(theaterVisible)
      if(img){image=theaterImageUrl(img.currentSrc||img.getAttribute('src')||'');text=img.alt||'Event CG';const copy=theaterCopy(img,false);if(copy)content.append(copy)}
      if(!image){kind='html';text='Illustration is not ready.';content.append(document.createTextNode(text))}
    } else {
      const shadow=el.shadowRoot
      htmlContext=theaterHtmlContext(shadow?el:el.parentElement||el)
      if(shadow){sheets=[...shadow.adoptedStyleSheets];for(const child of [...shadow.childNodes]){const copy=theaterHtmlCopy(child);if(copy)content.append(copy)}}
      else {const copy=theaterHtmlCopy(el);if(copy)content.append(copy)}
      const readable=content.cloneNode(true) as DocumentFragment;for(const style of readable.querySelectorAll('style'))style.remove();text=readable.textContent?.trim().slice(0,180)||'HTML island'
    }
    push(kind,content,text,image,scene,sheets,el);if(htmlContext)frames[frames.length-1].htmlContext=htmlContext
  }
  function walk(node:Node,ancestors:Element[]=[]){
    if(node.nodeType===Node.TEXT_NODE){appendInline(node,ancestors);return}
    if(allowDirection&&node instanceof Element&&node.matches('span[data-ss-stage-cue]')){
      const cue=stageCueDecode(node.getAttribute('data-ss-stage-cue')||'');if(cue){flush();pushCue(cue);return}
    }
    if(!(node instanceof Element)||node.matches(THEATER_SKIP)||!theaterVisible(node))return
    if(allowDirection&&node.matches('atmosphere,stage-fx')&&!node.childNodes.length){const cue=theaterCueParse('<'+node.localName+' '+[...node.attributes].map(a=>a.name+'='+JSON.stringify(a.value)).join(' ')+' />');if(cue){flush();pushCue(cue);return}}
    if(node.matches(THEATER_CAST)){special(node,'cast');return}
    if(node.matches('figure[data-swarm-studio-image="true"],img')){special(node,'cg');return}
    if(node.shadowRoot||(node.localName==='details'&&!node.querySelector(THEATER_CAST+',figure[data-swarm-studio-image]'))||node.matches('[data-no-island],[data-html-island],[data-inline-card],[data-lumiverse-html-island],[data-lumiverse-inline-html-card]')||(['div','section','article','aside','figure','details','form'].includes(node.localName)&&node.querySelector(':scope > style'))||(['div','section','article','aside'].includes(node.localName)&&node.hasAttribute('style')&&node.querySelectorAll('[style]').length>=3&&!node.querySelector(THEATER_CAST+',figure[data-swarm-studio-image]'))){special(node,'html');return}
    if(node.localName==='figure'&&node.querySelector('img')&&!node.querySelector(THEATER_CAST)){special(node,'cg');return}
    if(node.matches('table,pre,ul,ol,blockquote')&&!node.querySelector(THEATER_CAST+',img')&&!Array.from(node.querySelectorAll('*')).some(e=>!!e.shadowRoot)){flush();const copy=theaterCopy(node,false);if(copy)buffer.append(copy);flush();return}
    const inline=THEATER_INLINE.has(node.localName)
    if(!inline)flush()
    if(node.localName==='br'||node.localName==='wbr')appendInline(node,ancestors)
    else for(const child of [...node.childNodes])walk(child,inline?[...ancestors,node]:[])
    if(!inline)flush()
  }
  for(const node of [...root.childNodes])walk(node)
  flush();return frames
}
interface TheaterRow {messageId:string;element:Element}
function theaterRows(ctx:FrontendContext):{rows:TheaterRow[];order:string[]} {
  const rows=(ctx.dom?.listMessageElements?.()||[]) as TheaterRow[]
  const order=(ctx.messages?.listMessageIds?.()||[]) as string[];const rank=new Map(order.map((id,i)=>[id,i]));const seen=new Set<string>()
  return {order,rows:[...rows].filter(r=>r.element?.isConnected&&r.messageId&&(!order.length||rank.has(r.messageId))).sort((a,b)=>order.length?rank.get(a.messageId)!-rank.get(b.messageId)!:(a.element.compareDocumentPosition(b.element)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1)).filter(r=>{if(seen.has(r.messageId))return false;seen.add(r.messageId);return true})}
}
// Assemble immutable raw snapshots. Cached frames must not retain a propagated
// scene from an old swipe: recompute continuity on every replacement.
type TheaterSceneResolver=(key:string)=>{id:string;url:string;key?:string;name?:string}|undefined
function theaterAssemble(order:string[],cache:ReadonlyMap<string,TheaterFrame[]>,resolveScene:TheaterSceneResolver=()=>undefined):TheaterFrame[]{
  let scene='',previousRank=-1,sceneKey='',boundary=true,mood:CastAtmosphereKey='none',moodDirected=false,sceneDirected=false,sceneName='';const frames:TheaterFrame[]=[];let pending:TheaterCue[]=[]
  for(const [n,id] of order.entries()){
    const group=cache.get(id);if(!group)continue
    if(previousRank>=0&&n!==previousRank+1){scene='';sceneKey='';boundary=true;pending=[];sceneDirected=false;moodDirected=false;mood='none';sceneName=''}previousRank=n
    for(const raw of group){if(raw.cueOnly){if(pending.length<32)pending.push(raw.cueOnly);continue}const frame={...raw,cues:pending};pending=[];const direction=frame.cues.findLast(c=>c.kind==='scene');const inherited:string=!direction&&!frame.explicitScene&&!sceneDirected?frame.inheritedScene||'':'';const directed:boolean=!!direction||!!inherited;const explicit=direction?.effect||frame.explicitScene||inherited||''
      const known=explicit&&explicit!=='none'?resolveScene(explicit):undefined
      const resolved=known?.key||(directed?explicit:known?.id||frame.content.querySelector<HTMLElement>('[data-swarm-cast]')?.dataset.castSceneId||explicit)
      if(explicit==='none'){if(scene||sceneKey!=='none')boundary=true;scene='';sceneKey='none';sceneDirected=directed;sceneName=''}
      else if(explicit&&resolved&&resolved!==sceneKey){if(sceneKey||scene)boundary=true;scene=known?.url||(!directed?frame.scene:'');sceneKey=resolved;sceneDirected=directed;sceneName=known?.name||(directed?explicit:'')}
      else if(explicit&&known){scene=known.url;sceneName=known.name||sceneName}
      if(directed)sceneDirected=true
      if(!directed&&explicit!=='none'&&frame.scene&&(!sceneDirected||!!explicit)){if(scene&&scene!==frame.scene&&!known||sceneKey==='none')boundary=true;if(!known)scene=frame.scene;if(sceneKey==='none')sceneKey=''}
      if(boundary){mood='none';moodDirected=false;if(direction){const i=frame.cues.lastIndexOf(direction);frame.cues=frame.cues.filter((c,n)=>n>=i||(c.kind!=='weather'&&c.kind!=='lighting'))}}if(frame.kind==='cast'&&frame.explicitMood){if(mood!==frame.explicitMood)moodDirected=false;mood=frame.explicitMood}const light=frame.cues.findLast(c=>c.kind==='lighting');if(light){mood=light.effect;moodDirected=true}else if(!frame.explicitMood&&!moodDirected&&mood==='none'&&frame.inheritedMood){mood=frame.inheritedMood;moodDirected=true}frame.mood=mood;frame.moodDirected=moodDirected;frame.sceneDirected=sceneDirected;frame.storySceneName=sceneName;frame.scene=scene;frame.sceneKey=sceneKey;frame.sceneBoundary=boundary;boundary=false;frames.push(frame)
    }
  }
  theaterFxTimeline(frames);return frames
}
function theaterSequence(ctx:FrontendContext,resolveScene?:TheaterSceneResolver):{frames:TheaterFrame[];mounted:number;total:number;skipped:number}{
  const {rows,order}=theaterRows(ctx);const cache=new Map<string,TheaterFrame[]>();let skipped=0
  const userRows=new Set(theaterLiveRecent(ctx).filter(m=>m.is_user).map(m=>m.id))
  for(const row of rows){const root=theaterContentRoot(row.element);if(!root){skipped++;continue}cache.set(row.messageId,theaterSnapshot(row.messageId,root,!userRows.has(row.messageId)))}
  return {frames:theaterAssemble(order.length?order:rows.map(r=>r.messageId),cache,resolveScene),mounted:rows.length,total:order.length||rows.length,skipped}
}
