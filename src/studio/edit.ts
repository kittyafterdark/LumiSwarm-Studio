// Studio Edit: native-resolution RGBA document. GPU actions are adapters over
// existing Studio services; never mutate the source image or Cast packet.
const EDIT_MAX_PIXELS = 16_777_216
const EDIT_MAX_SIDE = 8192
const EDIT_DATA_LIMIT = 7_500_000

type EditSelectionMode = "replace" | "add" | "subtract"
type EditTool = "hand" | "smart" | "wand" | "lasso" | "rectangle" | "brush" | "erase" | "liquify" | "crop" | "despill" | "inpaint" | "upscale" | "background"
interface EditImageTarget { label: string; memberId?: string; expression?: string; groupId?: string; backgroundKey?: string; sourceId: string; replace: (id: string, expectedId:string) => Promise<void> }
interface EditServices {
  pick: (choose: (image: StudioExpressionImage) => void) => void
  finalize?: (image:CurrentImage)=>void
  smartOptions?:()=>Promise<FinalizeCapabilities>
  smart?:(image:CurrentImage,point:{x:number;y:number},model:string,device:string,signal:AbortSignal,progress:(message:string)=>void)=>Promise<CurrentImage>
  save: (png: string, sourceId: string, label: string) => Promise<{id:string;url:string;record?:GenerationDetails}>
  background: (image: CurrentImage, progress: (message:string) => void, signal: AbortSignal) => Promise<CurrentImage>
  upscale: (image: CurrentImage, accept: (image: CurrentImage) => Promise<void>) => void
  inpaint: (image: CurrentImage, accept: (image: CurrentImage) => Promise<void>, selection?:{width:number;height:number;mask:Uint8Array}) => void
}

function editWand(pixels: Uint8ClampedArray, w: number, h: number, x: number, y: number, tolerance: number, contiguous: boolean): Uint8Array {
  const n=w*h, mask=new Uint8Array(n), start=y*w+x
  if(x<0||x>=w||y<0||y>=h||!pixels[start*4+3]) return mask
  const r=pixels[start*4],g=pixels[start*4+1],b=pixels[start*4+2],a=pixels[start*4+3]
  const threshold=Math.pow(Math.max(0,Math.min(100,tolerance))*2.55,2)*3
  const match=(i:number)=>{const k=i*4;return pixels[k+3]>0 && Math.pow(pixels[k]-r,2)+Math.pow(pixels[k+1]-g,2)+Math.pow(pixels[k+2]-b,2)<=threshold && Math.abs(pixels[k+3]-a)<=Math.max(32,tolerance*2.55)}
  if(!contiguous){for(let i=0;i<n;i++)if(match(i))mask[i]=255;return mask}
  const queue=new Int32Array(n);let read=0,write=0
  const visit=(i:number)=>{if(!mask[i]&&match(i)){mask[i]=255;queue[write++]=i}}
  visit(start)
  while(read<write){const i=queue[read++],col=i%w;if(col>0)visit(i-1);if(col<w-1)visit(i+1);if(i>=w)visit(i-w);if(i<n-w)visit(i+w)}
  return mask
}
function editCombineSelection(current: Uint8Array, next: Uint8Array, mode: EditSelectionMode): Uint8Array {
  if(mode==="replace")return next
  const out=new Uint8Array(current.length)
  for(let i=0;i<out.length;i++)out[i]=mode==="add"?Math.max(current[i],next[i]):Math.max(0,current[i]-next[i])
  return out
}
function editMorph(mask: Uint8Array,w:number,h:number,grow:boolean):Uint8Array {
  const out=new Uint8Array(mask.length)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x;let v=mask[i]
    for(const q of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<h-1?i+w:-1])v=grow?Math.max(v,q<0?0:mask[q]):Math.min(v,q<0?0:mask[q])
    out[i]=v
  }return out
}
function editFeather(mask: Uint8Array,w:number,h:number,radius:number):Uint8Array {
  const r=Math.max(0,Math.min(12,Math.round(radius)));if(!r)return mask.slice()
  const tmp=new Float32Array(mask.length),out=new Uint8Array(mask.length),span=2*r+1
  for(let y=0;y<h;y++){let sum=0;for(let x=0;x<=Math.min(r,w-1);x++)sum+=mask[y*w+x];for(let x=0;x<w;x++){tmp[y*w+x]=sum/span;if(x-r>=0)sum-=mask[y*w+x-r];if(x+r+1<w)sum+=mask[y*w+x+r+1]}}
  for(let x=0;x<w;x++){let sum=0;for(let y=0;y<=Math.min(r,h-1);y++)sum+=tmp[y*w+x];for(let y=0;y<h;y++){out[y*w+x]=Math.round(sum/span);if(y-r>=0)sum-=tmp[(y-r)*w+x];if(y+r+1<h)sum+=tmp[(y+r+1)*w+x]}}
  return out
}
function editClearPixels(pixels:Uint8ClampedArray,mask:Uint8Array):void {for(let i=0;i<mask.length;i++)pixels[i*4+3]=Math.round(pixels[i*4+3]*(255-mask[i])/255)}
function editDespill(pixels:Uint8ClampedArray,w:number,h:number,mask:Uint8Array,channel:"green"|"blue",strength:number):number {
  let changed=0
  const selected=mask.some(v=>v>0),c=channel==="green"?1:2,other=channel==="green"?2:1
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,k=i*4;if(!pixels[k+3]||(selected&&!mask[i]))continue
    // Without selection, restrict to the alpha boundary (including internal holes).
    if(!selected&&pixels[k+3]===255){let edge=false;for(let dy=-2;dy<=2&&!edge;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=h||pixels[(yy*w+xx)*4+3]<240){edge=true;break}}if(!edge)continue}
    const excess=Math.max(0,pixels[k+c]-Math.max(pixels[k],pixels[k+other]));const amount=Math.round(excess*strength*(selected?mask[i]/255:1));if(amount){pixels[k+c]-=amount;changed++}
  }
  return changed
}

// Bounded inverse warp with premultiplied bilinear sampling. Alpha is warped
// together with color, preventing dark halos at transparent edges.
function editPushPixels(pixels:Uint8ClampedArray,w:number,h:number,cx:number,cy:number,dx:number,dy:number,r:number,strength:number):void {
  if(r<=0||strength<=0||(!dx&&!dy))return
  const src=pixels.slice(),d=Math.hypot(dx,dy),factor=Math.min(1,r/3/d)*Math.min(1,strength)
  for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(h,Math.ceil(cy+r+1));y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(w,Math.ceil(cx+r+1));x++){
    const q=Math.hypot(x-cx,y-cy)/r;if(q>=1)continue
    const weight=(1-q*q)**2*factor,sx=Math.max(0,Math.min(w-1,x-dx*weight)),sy=Math.max(0,Math.min(h-1,y-dy*weight))
    const x0=Math.floor(sx),y0=Math.floor(sy),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),fx=sx-x0,fy=sy-y0
    const taps=[[(y0*w+x0)*4,(1-fx)*(1-fy)],[(y0*w+x1)*4,fx*(1-fy)],[(y1*w+x0)*4,(1-fx)*fy],[(y1*w+x1)*4,fx*fy]]
    const k=(y*w+x)*4;let a=0,rr=0,g=0,b=0
    for(const [i,v] of taps){const av=src[i+3]*v;a+=av;rr+=src[i]*av;g+=src[i+1]*av;b+=src[i+2]*av}
    pixels[k+3]=a;if(a){pixels[k]=rr/a;pixels[k+1]=g/a;pixels[k+2]=b/a}else{pixels[k]=pixels[k+1]=pixels[k+2]=0}
  }
}

const EDIT_ICONS:Record<string,string>={
  hand:'<path d="M8 13V5a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 5-4 7-8 7-3 0-5-2-7-5l-2-4a2 2 0 0 1 3-2l2 2Z"/>',
  smart:'<path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M12 7l2 3 3 2-3 2-2 3-2-3-3-2 3-2Z"/>',
  wand:'<path d="m3 21 14-14 4 4L7 25M15 9l4 4M5 3v6M2 6h6M17 2v4M15 4h4M21 17v4M19 19h4"/>',
  lasso:'<path d="M7 17C0 14 2 4 11 3s12 7 8 12c-3 4-11 5-13 2-2-3 3-4 4-1s-2 7-5 5"/>',
  rectangle:'<rect x="4" y="4" width="16" height="16" stroke-dasharray="3 2"/>',
  erase:'<path d="m3 13 10-10 8 8-10 10H7l-4-4a3 3 0 0 1 0-4ZM8 8l9 9M11 21h11"/>',
  brush:'<path d="m14 6 4 4M9 15l-2-2L17 3l4 4-10 10m-2-2c-4-1-3 5-6 6 5 0 7-2 6-6Z"/>',
  liquify:'<path d="M3 5c6-5 12 5 18 0M3 12c6-5 12 5 18 0M3 19c6-5 12 5 18 0"/>',
  crop:'<path d="M6 2v16h16M2 6h16v16"/>',
  despill:'<path d="M12 3C8 9 5 12 5 16a7 7 0 0 0 14 0c0-4-3-7-7-13Z M9 17l6-6"/>',
  inpaint:'<path d="m3 21 4-1L21 6l-3-3L4 17l-1 4ZM14 7l3 3"/>',
  upscale:'<path d="M14 3h7v7M21 3l-8 8M10 21H3v-7m0 7 8-8"/>',
  background:'<path d="M6 6a3 3 0 1 0 0 .1L20 20M6 18a3 3 0 1 0 0 .1L20 4M12 12l2-2"/>',
  undo:'<path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5m-5 5 5 5"/>',redo:'<path d="M20 10H10a6 6 0 0 0 0 12m10-12-5-5m5 5-5 5"/>',
  "select-all":'<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 2"/><path d="M8 12h8m-4-4v8"/>',
  invert:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M5 19 19 5v14Z" fill="currentColor" stroke="none"/>',
  deselect:'<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 2"/><path d="m9 9 6 6m0-6-6 6"/>',
  grow:'<rect x="8" y="8" width="8" height="8" rx="1" stroke-dasharray="2 2"/><path d="M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5"/>',
  shrink:'<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 3l5 5m-5 0h5V3m13 0-5 5m0-5v5h5M3 21l5-5m-5 0h5v5m13 0-5-5m0 5v-5h5"/>',
  rotate:'<path d="M4 11a8 8 0 1 1 4 8M4 11V3m0 8h8"/>',flip:'<path d="M12 2v20M8 6 2 18h6Zm8 0 6 12h-6Z"/>',
}
function editIcon(name:string):string{return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${EDIT_ICONS[name]||EDIT_ICONS.rectangle}</svg>`}
const EDIT_TOOLS: [EditTool,string][]=[["hand","Pan"],["wand","Magic wand"],["smart","Smart selection"],["lasso","Lasso"],["rectangle","Rectangle"],["brush","Brush"],["erase","Eraser"],["liquify","Liquify · Push"],["crop","Crop & transform"],["despill","Despill"],["inpaint","Inpaint"],["upscale","AI Upscale"],["background","Remove background"]]

class StudioEditWorkspace {
  private smartModels:string[]=[]
  private smartModel=""
  private smartDevice="cuda"
  private smartLoading=false
  private smartStatus="Discover compatible SAM2 nodes."
  private root:HTMLElement
  private services:EditServices
  private canvas:HTMLCanvasElement
  private overlay:HTMLCanvasElement
  private viewport:HTMLElement
  private surface:HTMLElement
  private controls:HTMLElement
  private status:HTMLElement
  private title:HTMLElement
  private meta:HTMLElement
  private mask:Uint8Array=new Uint8Array(0)
  private selectionPast:Uint8Array[]=[]
  private selectionFuture:Uint8Array[]=[]
  private cursor:HTMLElement
  private cursorTimer:number|undefined
  private paintColor="#ffffff"
  private warpStrength=45
  private brushTools(){return ["brush","erase","liquify"].includes(this.tool)}
  private hideCursor=()=>{window.clearTimeout(this.cursorTimer);this.cursor.hidden=true}
  private showCursor(p:{x:number;y:number}){
    if(!this.source||this.busy||!this.brushTools())return
    window.clearTimeout(this.cursorTimer)
    this.cursor.style.left=`${(p.x+.5)/this.canvas.width*100}%`;this.cursor.style.top=`${(p.y+.5)/this.canvas.height*100}%`
    this.cursor.style.width=`${this.brush/this.canvas.width*100}%`;this.cursor.hidden=false
  }
  private previewBrush(){
    const a=this.overlay.getBoundingClientRect(),b=this.viewport.getBoundingClientRect()
    if(!a.width||!a.height)return
    const x=(Math.max(a.left,b.left)+Math.min(a.right,b.right))/2,y=(Math.max(a.top,b.top)+Math.min(a.bottom,b.bottom))/2
    this.showCursor({x:(x-a.left)*this.canvas.width/a.width,y:(y-a.top)*this.canvas.height/a.height})
    this.cursorTimer=window.setTimeout(this.hideCursor,850)
  }
  private resetSelectionHistory(){this.selectionPast=[];this.selectionFuture=[]}
  private trimSelections(stack:Uint8Array[]){let bytes=stack.reduce((n,m)=>n+m.byteLength,0);while(stack.length>1&&(bytes>32*1024*1024||stack.length>12))bytes-=stack.shift()!.byteLength}
  private select(next:Uint8Array){if(next.every((v,i)=>v===this.mask[i]))return;this.selectionPast.push(this.mask);this.trimSelections(this.selectionPast);this.selectionFuture=[];this.mask=next}
  private selectionHistory(redo:boolean){const from=redo?this.selectionFuture:this.selectionPast,to=redo?this.selectionPast:this.selectionFuture;const mask=from.pop();if(!mask)return;to.push(this.mask);this.trimSelections(to);this.mask=mask;this.drawSelection();this.sync();this.say(redo?"Selection redone":"Selection undone")}

  private past:ImageData[]=[]
  private future:ImageData[]=[]
  private source:CurrentImage|null=null
  private target:EditImageTarget|null=null
  private tool:EditTool="wand"
  private mode:EditSelectionMode="replace"
  private tolerance=24
  private contiguous=true
  private feather=0
  private brush=24
  private zoom=1
  private fit=true
  private dirty=false
  private saved:CurrentImage|null=null
  private busy=false
  private abort:AbortController|null=null
  private epoch=0
  private revision=0
  private disposed=false
  private observer:ResizeObserver
  private pointer:{id:number;start:{x:number;y:number};last:{x:number;y:number};points:{x:number;y:number}[];scrollX:number;scrollY:number;clientX:number;clientY:number;mutated:boolean}|null=null
  constructor(root:HTMLElement,services:EditServices){
    this.root=root;this.services=services
    root.classList.add("ss-edit-workspace")
    root.innerHTML=`<header class="ss-edit-header"><span class="ss-edit-mark">${editIcon("wand")}</span><div class="ss-edit-heading"><strong data-edit="title">Image atelier</strong><small data-edit="meta">Local pixel tools · No GPU required</small></div><div class="ss-edit-header-actions"><button class="ss-button" data-edit="pick" aria-label="Choose library image" title="Library">${LIBRARY_ICON}<span>Library</span></button><button class="ss-button" data-edit="upload" aria-label="Upload image" title="Upload">${IMPORT_ICON}<span>Upload</span></button><input type="file" accept="image/png,image/jpeg,image/webp" data-edit="file" hidden><button class="ss-icon-button" data-edit="undo" title="Undo" aria-label="Undo">${editIcon("undo")}</button><button class="ss-icon-button" data-edit="redo" title="Redo" aria-label="Redo">${editIcon("redo")}</button></div></header><div class="ss-edit-body"><nav class="ss-edit-rail" aria-label="Editing tools">${EDIT_TOOLS.map(([key,label],i)=>`${key==="inpaint"?'<span class="ss-edit-separator"></span>':''}<button type="button" class="ss-icon-button" data-tool="${key}" title="${label}" aria-label="${label}" aria-pressed="${key===this.tool}">${editIcon(key)}</button>`).join("")}</nav><section class="ss-edit-center"><div class="ss-edit-viewport" data-background="checker"><div class="ss-edit-empty"><span>${editIcon("wand")}</span><h2>A little finishing touch.</h2><p>Open artwork from the library, upload an image, or edit an expression directly from Cast.</p><button class="ss-button ss-button-primary" data-edit="pick">${LIBRARY_ICON} Choose image</button></div><div class="ss-edit-surface" hidden><canvas data-edit="canvas" aria-label="Working image"></canvas><canvas data-edit="overlay" aria-label="Image selection and editing canvas" tabindex="0"></canvas><span class="ss-edit-brush-cursor" data-edit="brush-cursor" aria-hidden="true" hidden></span></div></div><div class="ss-edit-canvasbar"><button class="ss-button" data-edit="fit">Fit</button><button class="ss-icon-button" data-edit="zoom-out" aria-label="Zoom out">−</button><span data-edit="zoom">100%</span><button class="ss-icon-button" data-edit="zoom-in" aria-label="Zoom in">+</button><span class="ss-edit-spacer"></span><span class="ss-edit-swatch-label">Preview</span>${["checker","black","white"].map(key=>`<button class="ss-edit-swatch" data-bg="${key}" aria-label="${key} preview" aria-pressed="${key==="checker"}"></button>`).join("")}<input type="color" value="#805aaf" data-edit="custom-bg" aria-label="Custom preview background"></div></section><aside class="ss-edit-controls"></aside></div><footer class="ss-edit-footer"><div class="ss-edit-foot-text"><strong data-edit="status" role="status">Choose an image to begin.</strong><small data-edit="target">Original artwork stays untouched.</small></div><div class="ss-edit-footer-actions"><button class="ss-icon-button" data-edit="finalize" title="Send to Finalize" aria-label="Send to Finalize">${editIcon("wand")}</button><button class="ss-button" data-edit="download">${DOWNLOAD_ICON}<span>PNG</span></button><button class="ss-button ss-button-danger" data-edit="stop" hidden>Stop</button><button class="ss-button" data-edit="save">Save copy</button><button class="ss-button ss-button-primary" data-edit="replace" hidden>Replace</button></div></footer>`
    const get=<T extends HTMLElement>(key:string)=>root.querySelector<T>(`[data-edit="${key}"]`)!
    this.cursor=get<HTMLElement>("brush-cursor");this.canvas=get<HTMLCanvasElement>("canvas");this.overlay=get<HTMLCanvasElement>("overlay");this.viewport=root.querySelector(".ss-edit-viewport")!;this.surface=root.querySelector(".ss-edit-surface")!;this.controls=root.querySelector(".ss-edit-controls")!;this.status=get("status");this.title=get("title");this.meta=get("meta")
    this.observer=new ResizeObserver(()=>this.layout());this.observer.observe(this.viewport)
    root.addEventListener("click",this.click)
    root.addEventListener("change",this.change)
    root.addEventListener("input",this.input)
    this.overlay.addEventListener("pointerdown",this.down);this.overlay.addEventListener("pointermove",this.move);this.overlay.addEventListener("pointerup",this.up);this.overlay.addEventListener("pointercancel",this.cancelPointer);this.overlay.addEventListener("lostpointercapture",this.cancelPointer)
    this.overlay.addEventListener("pointerleave",this.hideCursor);this.viewport.addEventListener("scroll",this.hideCursor,{passive:true});
    root.addEventListener("keydown",this.keydown)
    this.renderControls();this.sync()
  }
  hasDocument():boolean{return Boolean(this.source)}
  canLeave():boolean{return this.busy?window.confirm("An edit operation is in progress. Leave this workspace? The result may still be saved in Library."):!this.dirty||window.confirm("Discard unsaved pixel edits?")}
  private ctx(){return this.canvas.getContext("2d",{willReadFrequently:true})!}
  private read(){return this.ctx().getImageData(0,0,this.canvas.width,this.canvas.height)}
  private say(message:string,error=false){this.status.textContent=message;this.status.dataset.error=String(error)}
  private report=(error:unknown)=>{if(!this.disposed)this.say(error instanceof Error?error.message:String(error),true)}
  private sync(){
    const loaded=Boolean(this.source),selected=this.mask.some(v=>v>0)
    this.root.querySelectorAll<HTMLButtonElement>("button[data-tool], [data-edit='undo'],[data-edit='redo'],[data-edit='download'],[data-edit='finalize'],[data-edit='save'],[data-edit='replace'],[data-edit='fit'],[data-edit='zoom-in'],[data-edit='zoom-out'],[data-op]").forEach(b=>{const k=b.dataset.edit,op=b.dataset.op;b.disabled=!loaded||this.busy||(b.dataset.tool==="smart"&&!this.services.smart)||(k==="finalize"&&!this.services.finalize)||(op==="selection-undo"&&!this.selectionPast.length)||(op==="selection-redo"&&!this.selectionFuture.length)||(k==="undo"&&!this.past.length)||(k==="redo"&&!this.future.length)||(op!==undefined&&["clear","invert","grow","shrink","feather","deselect","crop"].includes(op)&&!selected)})
    const selectionState=this.controls.querySelector<HTMLElement>("[data-selection-state]");if(selectionState)selectionState.textContent=selected?"Active":"None"
    this.root.querySelectorAll<HTMLButtonElement>('[data-edit="pick"],[data-edit="upload"]').forEach(b=>b.disabled=this.busy)
    this.root.querySelectorAll<HTMLElement>("button[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===this.tool)))
    const replace=this.root.querySelector<HTMLButtonElement>('[data-edit="replace"]')!;replace.hidden=!this.target;replace.textContent=this.target?.label||"Replace"
    this.root.querySelector<HTMLElement>('[data-edit="target"]')!.textContent=this.target?`${this.target.label} · original retained`:"Original artwork stays untouched."
    this.root.querySelector<HTMLButtonElement>('[data-edit="stop"]')!.hidden=!this.abort;this.root.dataset.editBusy=String(this.busy);this.root.dataset.editDirty=String(this.dirty)
    this.root.querySelector<HTMLElement>('[data-edit="zoom"]')!.textContent=`${Math.round(this.zoom*100)}%`
    if(loaded)this.meta.textContent=`${this.canvas.width} × ${this.canvas.height} · PNG · ${this.dirty?"Unsaved changes":"Alpha"}`
  }
  private async decode(image:CurrentImage):Promise<HTMLImageElement>{
    const src=image.id?`/api/v1/images/${encodeURIComponent(image.id)}`:image.url||image.src
    let url=src,object=""
    if(!/^(blob:|data:image\/)/.test(src)){const response=await fetch(src,{credentials:"same-origin",redirect:"error"});if(!response.ok)throw new Error("Could not read original artwork.");const blob=await response.blob();if(blob.size>50*1024*1024)throw new Error("Choose an image below 50 MB.");url=object=URL.createObjectURL(blob)}
    try{const bitmap=new Image();bitmap.src=url;await bitmap.decode();const w=bitmap.naturalWidth,h=bitmap.naturalHeight;if(!w||!h||w*h>EDIT_MAX_PIXELS||Math.max(w,h)>EDIT_MAX_SIDE)throw new Error("Local editor supports up to 16 megapixels and 8192px per side. The original was not resized.");return bitmap}finally{if(object)URL.revokeObjectURL(object)}
  }
  private setPixels(image:ImageData){this.canvas.width=image.width;this.canvas.height=image.height;this.overlay.width=image.width;this.overlay.height=image.height;this.ctx().putImageData(image,0,0);this.mask=new Uint8Array(image.width*image.height);this.resetSelectionHistory();this.layout();this.drawSelection()}
  async open(image:CurrentImage,target:EditImageTarget|null=null):Promise<void>{
    if(this.busy)return
    if(this.dirty&&!window.confirm("Discard unsaved pixel edits and open another image?"))return
    const epoch=++this.epoch;this.busy=true;this.say("Reading original artwork…");this.sync()
    try{const bitmap=await this.decode(image);if(this.disposed||epoch!==this.epoch)return;this.canvas.width=bitmap.naturalWidth;this.canvas.height=bitmap.naturalHeight;this.overlay.width=this.canvas.width;this.overlay.height=this.canvas.height;this.ctx().drawImage(bitmap,0,0);this.source=image;this.saved=image.id?image:null;this.target=target;this.mask=new Uint8Array(this.canvas.width*this.canvas.height);this.past=[];this.future=[];this.resetSelectionHistory();this.hideCursor();this.dirty=false;this.title.textContent=image.label;this.surface.hidden=false;this.root.querySelector<HTMLElement>(".ss-edit-empty")!.hidden=true;this.fit=true;this.layout();this.drawSelection();this.say("Ready · select a tool")}
    catch(error){this.report(error)}finally{if(!this.disposed&&epoch===this.epoch){this.busy=false;this.sync()}}
  }
  private layout(){if(!this.source)return;const w=this.canvas.width,h=this.canvas.height;if(this.fit){const vw=this.viewport.clientWidth,vh=this.viewport.clientHeight;if(vw>0&&vh>0)this.zoom=Math.min(1,Math.max(.02,Math.min((vw-28)/w,(vh-28)/h)))}this.surface.style.width=`${w*this.zoom}px`;this.surface.style.height=`${h*this.zoom}px`;this.root.querySelector<HTMLElement>('[data-edit="zoom"]')!.textContent=`${Math.round(this.zoom*100)}%`}
  private snapshot(){this.past.push(this.read());this.future=[];let bytes=this.past.reduce((n,i)=>n+i.data.byteLength,0);while(this.past.length>1&&(bytes>96*1024*1024||this.past.length>16))bytes-=this.past.shift()!.data.byteLength}
  private changed(){this.resetSelectionHistory();this.revision++;this.dirty=true;this.saved=null;this.drawSelection();this.sync()}
  private drawSelection(){const ctx=this.overlay.getContext("2d")!;ctx.clearRect(0,0,this.overlay.width,this.overlay.height);if(!this.mask.some(v=>v>0))return;const w=this.canvas.width,h=this.canvas.height,im=ctx.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!this.mask[i])continue;const p=i*4,edge=x===0||y===0||x===w-1||y===h-1||!this.mask[i-1]||!this.mask[i+1]||!this.mask[i-w]||!this.mask[i+w];if(edge){const c=(Math.floor((x+y)/4)%2)*255;im.data[p]=im.data[p+1]=im.data[p+2]=c;im.data[p+3]=255}else{im.data[p]=154;im.data[p+1]=145;im.data[p+2]=255;im.data[p+3]=Math.round(this.mask[i]*.16)}}ctx.putImageData(im,0,0)}
  private xy(e:PointerEvent){const r=this.overlay.getBoundingClientRect();return{x:Math.min(this.canvas.width-1,Math.max(0,Math.floor((e.clientX-r.left)*this.canvas.width/r.width))),y:Math.min(this.canvas.height-1,Math.max(0,Math.floor((e.clientY-r.top)*this.canvas.height/r.height)))}}
  private down=(e:PointerEvent)=>{if(!this.source||this.busy||this.pointer||e.button!==0||!["hand","wand","smart","lasso","rectangle","brush","erase","liquify","crop"].includes(this.tool))return;e.preventDefault();const p=this.xy(e);if(this.tool==="smart"){void this.smartSelect(p,e.shiftKey?"add":e.altKey?"subtract":this.mode);return}if(this.tool==="wand"){this.select(editCombineSelection(this.mask,editWand(this.read().data,this.canvas.width,this.canvas.height,p.x,p.y,this.tolerance,this.contiguous),e.shiftKey?"add":e.altKey?"subtract":this.mode));this.drawSelection();this.sync();this.say("Selection ready · clear, refine or crop");return}this.pointer={id:e.pointerId,start:p,last:p,points:[p],scrollX:this.viewport.scrollLeft,scrollY:this.viewport.scrollTop,clientX:e.clientX,clientY:e.clientY,mutated:false};this.overlay.setPointerCapture(e.pointerId);if(this.brushTools()){this.showCursor(p);if(this.tool!=="liquify"){this.snapshot();this.pointer.mutated=true;this.stroke(p,p)}} }
  private stroke(a:{x:number;y:number},b:{x:number;y:number}){const ctx=this.ctx();ctx.save();ctx.globalCompositeOperation=this.tool==="erase"?"destination-out":"source-over";ctx.strokeStyle=this.paintColor;ctx.lineWidth=this.brush;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x+.01,b.y+.01);ctx.stroke();ctx.restore()}
  private warp(a:{x:number;y:number},b:{x:number;y:number}){
    const r=Math.max(1,this.brush/2),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(!d)return
    // Limit each stamp and subdivide long pointer moves; local reads only.
    const steps=Math.min(64,Math.max(1,Math.ceil(d/Math.max(1,r/3))))
    const ctx=this.ctx(),w=this.canvas.width,h=this.canvas.height
    for(let i=1;i<=steps;i++){
      const x=a.x+dx*i/steps,y=a.y+dy*i/steps,margin=Math.ceil(r*1.5)+2
      const left=Math.max(0,Math.floor(x-margin)),top=Math.max(0,Math.floor(y-margin)),right=Math.min(w,Math.ceil(x+margin)),bottom=Math.min(h,Math.ceil(y+margin))
      if(right<=left||bottom<=top)continue
      const im=ctx.getImageData(left,top,right-left,bottom-top)
      editPushPixels(im.data,im.width,im.height,x-left,y-top,dx/steps,dy/steps,r,this.warpStrength/100)
      ctx.putImageData(im,left,top)
    }
  }
  private move=(e:PointerEvent)=>{if(!this.source||this.busy)return;const next=this.xy(e);if(this.brushTools())this.showCursor(next);const p=this.pointer;if(!p||p.id!==e.pointerId)return;if(this.tool==="hand"){this.viewport.scrollLeft=p.scrollX+p.clientX-e.clientX;this.viewport.scrollTop=p.scrollY+p.clientY-e.clientY;return}if(this.brushTools()){if(this.tool==="liquify"){if(next.x!==p.last.x||next.y!==p.last.y){if(!p.mutated){this.snapshot();p.mutated=true}this.warp(p.last,next)}}else this.stroke(p.last,next);p.last=next;return}p.points.push(next);p.last=next;this.drawSelection();const ctx=this.overlay.getContext("2d")!;ctx.save();ctx.strokeStyle="#fff";ctx.lineWidth=Math.max(1,1/this.zoom);ctx.setLineDash([5/this.zoom,4/this.zoom]);ctx.beginPath();if(this.tool==="lasso"){ctx.moveTo(p.start.x,p.start.y);for(const v of p.points)ctx.lineTo(v.x,v.y)}else ctx.rect(p.start.x,p.start.y,next.x-p.start.x,next.y-p.start.y);ctx.stroke();ctx.restore()}
  private up=(e:PointerEvent)=>{const p=this.pointer;if(!p||p.id!==e.pointerId)return;this.pointer=null;const end=this.xy(e);if(this.brushTools()){if(p.mutated)this.changed();if(e.pointerType==="touch")this.hideCursor();return}if(this.tool==="hand")return;const tmp=document.createElement("canvas");tmp.width=this.canvas.width;tmp.height=this.canvas.height;const c=tmp.getContext("2d")!;c.fillStyle="#fff";if(this.tool==="lasso"){c.beginPath();c.moveTo(p.start.x,p.start.y);for(const v of p.points)c.lineTo(v.x,v.y);c.lineTo(end.x,end.y);c.closePath();c.fill()}else c.fillRect(Math.min(p.start.x,end.x),Math.min(p.start.y,end.y),Math.abs(end.x-p.start.x)+1,Math.abs(end.y-p.start.y)+1);const data=c.getImageData(0,0,tmp.width,tmp.height).data,next=new Uint8Array(tmp.width*tmp.height);for(let i=0;i<next.length;i++)next[i]=data[i*4+3];this.select(editCombineSelection(this.mask,next,e.shiftKey?"add":e.altKey?"subtract":this.mode));tmp.width=tmp.height=1;this.drawSelection();this.sync()}
  private cancelPointer=(e:PointerEvent)=>{if(this.pointer?.id!==e.pointerId)return;const mutated=this.pointer.mutated;this.pointer=null;if(this.brushTools()&&mutated)this.changed();else this.drawSelection();this.hideCursor()}
  private range(label:string,key:string,value:number,min:number,max:number){return `<label class="ss-edit-range"><span>${label}<output data-value="${key}">${value}</output></span><input type="range" min="${min}" max="${max}" value="${value}" data-setting="${key}"></label>`}
  private op(key:string,label:string){return `<button type="button" class="ss-button" data-op="${key}">${label}</button>`}
  private iconOp(key:string,label:string,icon=key){return `<button type="button" class="ss-icon-button ss-edit-action-icon" data-op="${key}" title="${label}" aria-label="${label}">${editIcon(icon)}</button>`}
  private selectionControls(){return `<div class="ss-edit-divider"></div><section class="ss-edit-selection-tools" aria-label="Selection actions"><div class="ss-edit-section-head"><strong>Selection</strong><small data-selection-state>None</small></div><div class="ss-edit-selection-row">${this.iconOp("selection-undo","Undo selection","undo")}${this.iconOp("selection-redo","Redo selection","redo")}${this.iconOp("select-all","Select all")}${this.iconOp("invert","Invert selection")}${this.iconOp("deselect","Deselect")}</div><div class="ss-edit-edge-row"><span>Adjust edges</span>${this.iconOp("grow","Grow selection 1px")}${this.iconOp("shrink","Shrink selection 1px")}</div><div class="ss-edit-feather-row">${this.range("Feather (px)","feather",this.feather,0,12)}<button type="button" class="ss-button ss-edit-quiet-action" data-op="feather" aria-label="Apply feather" title="Apply feather">Apply</button></div><button type="button" class="ss-button ss-edit-clear-action" data-op="clear" title="Clear selected pixels to transparency (Delete)" aria-label="Clear to transparency">${editIcon("erase")}<span>Clear selected pixels</span><kbd>Del</kbd></button></section>`}
  private async refreshSmart(){if(!this.services.smartOptions||this.smartLoading)return;this.smartLoading=true;this.smartStatus="Discovering SAM2…";this.renderControls();try{const caps=await this.services.smartOptions();if(this.disposed)return;this.smartModels=caps.samModels;this.smartModel=this.smartModels.includes(this.smartModel)?this.smartModel:this.smartModels.find(v=>v.includes("2.1_hiera_small"))||this.smartModels[0]||"";this.smartStatus=this.smartModels.length?"Click an object to select it. First use may download model weights on Swarm's backend.":"Kijai SAM2 nodes unavailable. Install the node pack or use manual selection."}catch(e){this.smartModels=[];this.smartModel="";this.smartStatus=e instanceof Error?e.message:String(e)}finally{this.smartLoading=false;if(!this.disposed&&this.tool==="smart")this.renderControls()}}
  private async smartSelect(point:{x:number;y:number},mode:EditSelectionMode){if(!this.services.smart||!this.smartModel){this.say("Discover SAM2 and choose a model first.",true);return}const epoch=this.epoch,revision=this.revision,w=this.canvas.width,h=this.canvas.height;this.busy=true;const controller=this.abort=new AbortController();this.sync();try{const image=await this.ensureSaved();controller.signal.throwIfAborted();const result=await this.services.smart(image,point,this.smartModel,this.smartDevice,controller.signal,m=>this.say(m));controller.signal.throwIfAborted();const bitmap=await this.decode(result);if(this.disposed||epoch!==this.epoch||revision!==this.revision||controller.signal.aborted)return;if(bitmap.naturalWidth!==w||bitmap.naturalHeight!==h)throw new Error("SAM2 returned a mask with unexpected dimensions. Selection was not changed.");const temp=document.createElement("canvas");temp.width=w;temp.height=h;const ctx=temp.getContext("2d")!;ctx.drawImage(bitmap,0,0);const rgba=ctx.getImageData(0,0,w,h).data,mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++)mask[i]=Math.round((rgba[i*4]+rgba[i*4+1]+rgba[i*4+2])/3*rgba[i*4+3]/255);temp.width=temp.height=1;this.select(editCombineSelection(this.mask,mask,mode));this.drawSelection();this.say("Smart selection ready · refine, clear, crop or inpaint") }catch(e){this.report(controller.signal.aborted?"Selection stopped":e)}finally{this.busy=false;this.abort=null;if(!this.disposed)this.sync()}}
  private async sendFinalize(){if(!this.source||!this.services.finalize||this.busy)return;this.busy=true;this.sync();try{const image=await this.ensureSaved();if(!this.disposed)this.services.finalize(image)}catch(e){this.report(e)}finally{this.busy=false;if(!this.disposed)this.sync()}}
  private renderControls(){const name=EDIT_TOOLS.find(t=>t[0]===this.tool)?.[1]||"Edit";let html=`<div class="ss-edit-tool-head"><span class="ss-edit-mark">${editIcon(this.tool)}</span><div><small>TOOL PROPERTIES</small><h3>${name}</h3></div></div>`
    if(this.tool==="smart"){html+=`<p>${finalizeEscape(this.smartStatus)}</p><button class="ss-button" data-op="smart-discover" ${this.smartLoading?"disabled":""}>${editIcon("rotate")} Discover SAM2</button><label>Model<select class="ss-select" data-setting="smart-model"><option value="">Choose model</option>${this.smartModels.map(v=>`<option value="${finalizeEscape(v)}" ${v===this.smartModel?"selected":""}>${finalizeEscape(v)}</option>`).join("")}</select></label><label>Device<select class="ss-select" data-setting="smart-device"><option value="cuda" ${this.smartDevice==="cuda"?"selected":""}>CUDA</option><option value="cpu" ${this.smartDevice==="cpu"?"selected":""}>CPU</option></select></label><label>Selection mode<select data-setting="mode" class="ss-select">${["replace","add","subtract"].map(m=>`<option value="${m}" ${m===this.mode?"selected":""}>${m[0].toUpperCase()+m.slice(1)}</option>`).join("")}</select></label><small>Shift adds · Alt subtracts · selection undo available</small>`}
    else if(["wand","lasso","rectangle"].includes(this.tool)){html+=`<p>${this.tool==="wand"?"Click a color to select matching pixels.":"Draw around the area to select."}</p><label>Selection mode<select data-setting="mode" class="ss-select">${["replace","add","subtract"].map(m=>`<option value="${m}" ${m===this.mode?"selected":""}>${m[0].toUpperCase()+m.slice(1)}</option>`).join("")}</select></label>${this.tool==="wand"?this.range("Tolerance","tolerance",this.tolerance,0,100)+`<label class="ss-edit-check"><input type="checkbox" data-setting="contiguous" ${this.contiguous?"checked":""}> Connected pixels only</label>`:""}<small>Shift adds · Alt subtracts</small>`}
    else if(this.tool==="erase"||this.tool==="brush"||this.tool==="liquify")html+=`<p>${this.tool==="erase"?"Brush away unwanted pixels to transparency.":this.tool==="brush"?"Paint directly on the working artwork.":"Drag gently to push pixels. Small strokes give the best control."} Undo restores your previous image.</p>${this.range("Brush size (px)","brush",this.brush,1,200)}${this.tool==="brush"?`<label>Paint color<input type="color" data-setting="paintColor" value="${this.paintColor}"></label>`:this.tool==="liquify"?this.range("Strength %","warp",this.warpStrength,1,100):""}`
    else if(this.tool==="crop")html+=`<p>Drag a rectangle on the artwork, then crop to the selected bounds.</p>${this.op("crop","Crop to selection")}<div class="ss-edit-pair">${this.op("rotate","Rotate 90°")}${this.op("flip","Flip horizontal")}</div>`
    else if(this.tool==="despill")html+=`<p>Reduce green or blue color spill without deleting hair edges. A selection limits the repair; otherwise only alpha edges are affected.</p><label>Spill color<select class="ss-select" data-setting="channel"><option value="green">Green</option><option value="blue">Blue</option></select></label>${this.range("Strength %","spill",70,0,100)}${this.op("despill","Apply despill")}`
    else if(this.tool==="hand")html+="<p>Drag to pan the canvas when zoomed. Fit brings the entire artwork back into view.</p>"
    else html+=`<p>${this.tool==="inpaint"?"Open the existing region mask and generation controls.":this.tool==="upscale"?"Use your existing AI enhancement workflow.":"Run the built-in BiRefNet background-removal graph."} The current artwork is saved if necessary. Results return as editable copies.</p>${this.op("gpu",this.tool==="inpaint"?"Open region editor":this.tool==="upscale"?"Configure upscale":"Remove background")}`
    if(["smart","wand","lasso","rectangle","crop","erase","despill"].includes(this.tool))html+=this.selectionControls()
    this.controls.innerHTML=html;this.overlay.dataset.tool=this.tool;this.sync()
  }
  private input=(e:Event)=>{const el=e.target as HTMLInputElement,key=el.dataset.setting;if(key){const output=this.controls.querySelector<HTMLOutputElement>(`[data-value="${key}"]`);if(output)output.value=el.value;if(key==="tolerance")this.tolerance=Number(el.value);if(key==="brush"){this.brush=Number(el.value);this.previewBrush()}if(key==="paintColor")this.paintColor=el.value;if(key==="warp")this.warpStrength=Number(el.value);if(key==="feather")this.feather=Number(el.value)}if(el.dataset.edit==="custom-bg"){this.viewport.dataset.background="custom";this.viewport.style.setProperty("--ss-edit-custom",el.value);this.root.querySelectorAll("[data-bg]").forEach(b=>b.setAttribute("aria-pressed","false"))}}
  private change=(e:Event)=>{const el=e.target as HTMLInputElement;if(el.dataset.setting==="mode")this.mode=el.value as EditSelectionMode;if(el.dataset.setting==="smart-model")this.smartModel=el.value;if(el.dataset.setting==="smart-device")this.smartDevice=el.value;if(el.dataset.setting==="contiguous")this.contiguous=el.checked;if(el.dataset.edit==="file"){const file=el.files?.[0];el.value="";if(!file)return;if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>50*1024*1024){this.say("Choose PNG, JPEG or WebP below 50 MB.",true);return}const src=URL.createObjectURL(file);void this.open({src,label:file.name}).finally(()=>URL.revokeObjectURL(src))}}
  private click=(e:Event)=>{const b=(e.target as HTMLElement).closest<HTMLButtonElement>("button");if(!b||b.disabled)return;const tool=b.dataset.tool as EditTool;if(tool){if(this.pointer)return;this.hideCursor();this.tool=tool;this.renderControls();if(tool==="smart"&&!this.smartModels.length)void this.refreshSmart();return}if(b.dataset.bg){this.viewport.dataset.background=b.dataset.bg;this.root.querySelectorAll("[data-bg]").forEach(el=>el.setAttribute("aria-pressed",String(el===b)));return}if(b.dataset.op){void this.operation(b.dataset.op).catch(this.report);return}switch(b.dataset.edit){case"pick":this.services.pick(image=>void this.open({id:image.id,src:image.url,label:"Library artwork"}));break;case"upload":this.root.querySelector<HTMLInputElement>('[data-edit="file"]')!.click();break;case"fit":this.fit=true;this.layout();break;case"zoom-in":case"zoom-out":this.fit=false;this.zoom=Math.max(.02,Math.min(8,this.zoom*(b.dataset.edit==="zoom-in"?1.25:.8)));this.layout();break;case"undo":case"redo":this.history(b.dataset.edit);break;case"stop":this.abort?.abort();break;case"download":void this.download().catch(this.report);break;case"finalize":void this.sendFinalize();break;case"save":void this.save(false);break;case"replace":void this.save(true);break}}
  private keydown=(e:KeyboardEvent)=>{if(!this.source||this.busy||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLTextAreaElement)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();this.history(e.shiftKey?"redo":"undo")}else if(e.key==="Delete"||e.key==="Backspace"){if(this.mask.some(v=>v>0)){e.preventDefault();void this.operation("clear").catch(this.report)}}else if(e.key==="Escape"&&this.mask.some(v=>v>0)){e.stopPropagation();e.preventDefault();void this.operation("deselect")}}
  private history(which:string){const from=which==="undo"?this.past:this.future,to=which==="undo"?this.future:this.past,im=from.pop();if(!im)return;to.push(this.read());this.setPixels(im);this.changed();this.say(which==="undo"?"Undone":"Redone")}
  private async operation(op:string){if(!this.source||this.busy)return;const w=this.canvas.width,h=this.canvas.height
    if(op==="smart-discover"){await this.refreshSmart();return}
    if(op==="gpu"){await this.gpu();return}
    if(op==="selection-undo"||op==="selection-redo"){this.selectionHistory(op==="selection-redo");return}
    if(op==="select-all")this.select(new Uint8Array(this.mask.length).fill(255))
    else if(op==="deselect")this.select(new Uint8Array(this.mask.length))
    else if(op==="invert")this.select(this.mask.map(v=>255-v))
    else if(op==="grow"||op==="shrink")this.select(editMorph(this.mask,w,h,op==="grow"))
    else if(op==="feather")this.select(editFeather(this.mask,w,h,this.feather))
    else if(op==="clear"){if(!this.mask.some(v=>v>0))return;this.snapshot();const im=this.read();editClearPixels(im.data,this.mask);this.ctx().putImageData(im,0,0);this.mask.fill(0);this.changed();this.say("Selected pixels cleared to transparency")}
    else if(op==="despill"){this.snapshot();const im=this.read(),channel=this.controls.querySelector<HTMLSelectElement>('[data-setting="channel"]')?.value==="blue"?"blue":"green",strength=Number(this.controls.querySelector<HTMLInputElement>('[data-setting="spill"]')?.value||70)/100;editDespill(im.data,w,h,this.mask,channel,strength);this.ctx().putImageData(im,0,0);this.changed();this.say("Color spill reduced")}
    else if(op==="crop"||op==="rotate"||op==="flip"){const original=this.read();let x0=w,y0=h,x1=-1,y1=-1;if(op==="crop"){for(let i=0;i<this.mask.length;i++)if(this.mask[i]){const x=i%w,y=Math.floor(i/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}if(x1<0)return}this.snapshot();const tmp=document.createElement("canvas");tmp.width=w;tmp.height=h;tmp.getContext("2d")!.putImageData(original,0,0);const nw=op==="crop"?x1-x0+1:op==="rotate"?h:w,nh=op==="crop"?y1-y0+1:op==="rotate"?w:h;this.canvas.width=nw;this.canvas.height=nh;const ctx=this.ctx();if(op==="crop")ctx.drawImage(tmp,x0,y0,nw,nh,0,0,nw,nh);else if(op==="rotate"){ctx.translate(h,0);ctx.rotate(Math.PI/2);ctx.drawImage(tmp,0,0);ctx.resetTransform()}else{ctx.translate(w,0);ctx.scale(-1,1);ctx.drawImage(tmp,0,0);ctx.resetTransform()}tmp.width=tmp.height=1;this.overlay.width=nw;this.overlay.height=nh;this.mask=new Uint8Array(nw*nh);this.layout();this.changed();this.say("Canvas transformed")}
    this.drawSelection();this.sync()
  }
  private async download(){const blob=await new Promise<Blob>((resolve,reject)=>this.canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not encode PNG")),"image/png"));const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="studio-edit.png";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
  private async ensureSaved(forceCopy=false):Promise<CurrentImage>{if(this.saved?.id&&!forceCopy)return this.saved;const png=this.canvas.toDataURL("image/png");if(png.length>EDIT_DATA_LIMIT)throw new Error("PNG exceeds the current Studio upload transport limit. Download the full-resolution PNG instead.");const result=await this.services.save(png,this.saved?.id||this.source?.id||"",this.source?.label||"Artwork");this.saved={id:result.id,src:result.url,url:result.url,label:this.source?.label||"Edited artwork",details:result.record};this.dirty=false;return this.saved}
  private async save(replace:boolean){if(!this.source||this.busy)return;this.busy=true;this.sync();this.say("Saving original-resolution PNG…");try{const image=await this.ensureSaved(!replace&&this.saved?.id===this.source?.id&&!this.dirty);if(replace&&this.target){if(image.id===this.target.sourceId){this.say("No image changes to replace.");return}await this.target.replace(image.id!,this.target.sourceId);this.target.sourceId=image.id!;this.say("Replacement saved · original retained")}else this.say("Saved in Output Library")}catch(error){this.report(error)}finally{this.busy=false;this.sync()}}
  private async accept(image:CurrentImage){const bitmap=await this.decode(image);if(this.disposed)return;this.snapshot();this.canvas.width=bitmap.naturalWidth;this.canvas.height=bitmap.naturalHeight;this.overlay.width=this.canvas.width;this.overlay.height=this.canvas.height;this.ctx().drawImage(bitmap,0,0);this.mask=new Uint8Array(this.canvas.width*this.canvas.height);this.resetSelectionHistory();this.saved=image;this.revision++;this.dirty=false;this.layout();this.drawSelection();this.sync();this.say("Processed copy ready · Undo returns to previous artwork")}
  private async gpu(){if(!this.source||this.busy)return;this.busy=true;this.sync();try{const image=await this.ensureSaved();if(this.tool==="background"){this.abort=new AbortController();this.sync();this.say("Removing background…");const result=await this.services.background(image,message=>this.say(message),this.abort.signal);await this.accept(result)}else{const epoch=this.epoch,revision=this.revision;const accept=async(result:CurrentImage)=>{if(this.disposed||epoch!==this.epoch||revision!==this.revision)throw new Error("The editing document changed. The processed image is saved in Library.");this.busy=true;this.sync();try{await this.accept(result)}finally{this.busy=false;this.sync()}};if(this.tool==="inpaint")this.services.inpaint(image,accept,this.mask.some(v=>v>0)?{width:this.canvas.width,height:this.canvas.height,mask:this.mask.slice()}:undefined);else this.services.upscale(image,accept)}}catch(error){this.report(error)}finally{this.busy=false;this.abort=null;this.sync()}}
  dispose(){this.hideCursor();this.resetSelectionHistory();this.disposed=true;this.epoch++;this.abort?.abort();this.observer.disconnect();this.root.removeEventListener("click",this.click);this.root.removeEventListener("change",this.change);this.root.removeEventListener("input",this.input);this.root.removeEventListener("keydown",this.keydown);this.past=[];this.future=[];this.mask=new Uint8Array(0);this.canvas.width=this.canvas.height=this.overlay.width=this.overlay.height=1;this.root.replaceChildren()}
}
