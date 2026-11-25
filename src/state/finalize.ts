// Shared, bounded recipe model. No embedded images, credentials, or raw provider overrides.
type FinalizeKind = "refine" | "upscale" | "detail" | "cutout" | "despill"
interface FinalizeStage { kind:FinalizeKind; enabled:boolean; creativity:number; steps:number; cfg:number; scale:number; seed:number; reference:boolean; guidance:number; end:number; model:string; detector:string; detailGuide:number; detailMax:number; detailThreshold:number; detailDilation:number; detailCrop:number; detailFeather:number; detailCycles:number; detailPrompt:string; detailNegative:string; channel:"green"|"blue"; strength:number }
interface FinalizeRecipe { name:string; stages:FinalizeStage[] }
const FINALIZE_LABELS:Record<FinalizeKind,string>={refine:"Refinement",upscale:"AI upscale",detail:"Detailer",cutout:"Background removal",despill:"Despill"}
function finalizeNumber(value:unknown,fallback:number,min:number,max:number):number {const n=typeof value==="number"?value:typeof value==="string"&&value.trim()?Number(value):NaN;return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback}
function finalizeStage(raw:unknown):FinalizeStage {
  const v=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{}
  if(!Object.hasOwn(FINALIZE_LABELS,String(v.kind)))throw new Error("Unknown processing stage.")
  return {kind:v.kind as FinalizeKind,enabled:v.enabled!==false,creativity:finalizeNumber(v.creativity,.25,.05,1),steps:Math.round(finalizeNumber(v.steps,40,1,150)),cfg:finalizeNumber(v.cfg,4.5,1,30),scale:finalizeNumber(v.scale,v.kind==="upscale"?2:1.5,1,4),seed:Math.round(finalizeNumber(v.seed,42,0,4294967295)),reference:v.reference===true,guidance:finalizeNumber(v.guidance,4.5,1,12),end:finalizeNumber(v.end,1,0,1),model:typeof v.model==="string"?v.model.slice(0,500):"",detector:typeof v.detector==="string"?v.detector.slice(0,500):"",detailGuide:Math.round(finalizeNumber(v.detailGuide,512,128,1024)),detailMax:Math.round(finalizeNumber(v.detailMax,1024,256,2048)),detailThreshold:finalizeNumber(v.detailThreshold,.5,.05,1),detailDilation:Math.round(finalizeNumber(v.detailDilation,10,-32,64)),detailCrop:finalizeNumber(v.detailCrop,2.5,1,5),detailFeather:Math.round(finalizeNumber(v.detailFeather,12,0,64)),detailCycles:Math.round(finalizeNumber(v.detailCycles,1,1,3)),detailPrompt:typeof v.detailPrompt==="string"?v.detailPrompt.slice(0,4000):"",detailNegative:typeof v.detailNegative==="string"?v.detailNegative.slice(0,4000):"",channel:v.channel==="blue"?"blue":"green",strength:finalizeNumber(v.strength,.7,0,1)}
}
function finalizeRecipe(raw:unknown):FinalizeRecipe {
  const v=raw&&typeof raw==="object"?raw as Record<string,unknown>:{}
  if(!Array.isArray(v.stages)||!v.stages.length||v.stages.length>8)throw new Error("Choose between one and eight stages.")
  return {name:typeof v.name==="string"?v.name.trim().slice(0,80)||"Untitled":"Untitled",stages:v.stages.map(finalizeStage)}
}
function finalizeComparison(stage:FinalizeStage,field:"creativity"|"guidance"|"end"|"steps"|"cfg",values:number[]):FinalizeStage[]{
  if(stage.kind!=="refine"||values.length<2||values.length>4||values.some(v=>!Number.isFinite(v)))throw new Error("Compare two to four refinement values.")
  if((field==="guidance"||field==="end")&&!stage.reference)throw new Error("Enable reference conditioning before comparing reference settings.")
  const results=values.map(value=>finalizeStage({...stage,[field]:value}));if(results.some((v,i)=>v[field]!==values[i])||new Set(results.map(v=>v[field])).size!==results.length)throw new Error("Comparison values must be distinct and within range.");return results
}
