// Provider-side postproduction. All source reads are scoped to owned saved images.
// Short-lived account-local leases protect workspace source and candidates from Vacuum.
const finalizeLeases=new Map<string,Map<string,{ids:Set<string>;expires:number}>>()
function finalizeLease(userId:string|undefined,workspace:unknown,ids:unknown,release=false):void{
  const scope=userId||"",key=asString(workspace);if(!castKey(key)||key.length>100)return
  const now=Date.now();for(const [account,entries] of finalizeLeases){for(const [id,entry] of entries)if(entry.expires<=now)entries.delete(id);if(!entries.size)finalizeLeases.delete(account)}
  let entries=finalizeLeases.get(scope);if(release){entries?.delete(key);return}if(!entries){entries=new Map();finalizeLeases.set(scope,entries)}
  if(entries.size>=20&&!entries.has(key))return
  const entry=entries.get(key)||{ids:new Set<string>(),expires:now};if(Array.isArray(ids))for(const id of ids){if(entry.ids.size>=256)break;if(typeof id==="string"&&castKey(id))entry.ids.add(id)}entry.expires=now+30*60_000;entries.set(key,entry)
}
function finalizeProtected(userId?:string):Set<string>{const ids=new Set<string>();for(const entry of finalizeLeases.get(userId||"")?.values()||[])if(entry.expires>Date.now())for(const id of entry.ids)ids.add(id);return ids}

async function postNode(connection:SwarmConnection,name:string,userId?:string):Promise<JsonObject>{
  if(!spindle.permissions.has("cors_proxy"))throw new Error("Grant CORS Proxy permission to discover Comfy nodes.")
  const token=await getMetadataToken(connection.id,userId)
  const response=await spindle.cors(normalizeBaseUrl(connection.api_url)+"/ComfyBackendDirect/object_info/"+encodeURIComponent(name),{method:"GET",headers:cookieHeaders(token)})
  if(Number(response?.status)!==200)throw new Error(`Cannot discover ${name} on this Comfy backend.`)
  return asRecord(parseResponseBody(response,"postproduction node discovery")[name])
}
function postFields(info:JsonObject):JsonObject{const input=asRecord(info.input);return {...asRecord(input.required),...asRecord(input.optional)}}
function postChoices(info:JsonObject,key:string):string[]{const field=postFields(info)[key];return Array.isArray(field)?stringList(Array.isArray(field[0])?field[0]:asRecord(field[1]).options,500):[]}
function postHas(info:JsonObject,fields:string[]):boolean{return fields.every(key=>Object.hasOwn(postFields(info),key))}
async function postCapabilities(connection:SwarmConnection,userId?:string){
  const names=["DownloadAndLoadSAM2Model","Sam2Segmentation","MaskToImage","AnimaRefAdapter","UltralyticsDetectorProvider","FaceDetailer"]
  const [nodes,upscale,bg]=await Promise.all([Promise.all(names.map(async name=>{try{return await boundedStudioRead(()=>postNode(connection,name,userId))}catch{return {}}})),boundedStudioRead(()=>loadStudioUpscaleOptions(connection,userId)).catch(()=>({models:[]})),boundedStudioRead(()=>inspectStudioBiRefNet(connection,userId)).catch(()=>"unknown")])
  const [sam,segment,mask,ref,det,detail]=nodes
  return {samModels:postHas(sam,["model","segmentor","device","precision"])&&postHas(segment,["image","sam2_model","coordinates_positive","keep_model_loaded"])&&postHas(mask,["mask"])?postChoices(sam,"model"):[],reference:postHas(ref,["model","vae","image","ref_guidance"]),referenceEnd:postHas(ref,["ref_end"]),detailFields:Object.keys(postFields(detail)),detectors:postHas(detail,["image","bbox_detector","model","clip","vae","positive","negative","denoise"])&&postHas(det,["model_name"])?postChoices(det,"model_name").filter(name=>/^(bbox|segm)[\\/]/i.test(name)||/face|eye|hand/i.test(name)):[],upscalers:stringList(asRecord(upscale).models,500),background:bg}
}
async function postSource(id:string,userId?:string){
  if(!castKey(id)||!spindle.permissions.has("images")||!spindle.permissions.has("image_gen"))throw new Error("Select an owned Studio image and grant Images / Image Generation permissions.")
  const image=await spindle.images.get(id,{onlyOwned:true,specificity:"full",userId})
  if(!image||typeof spindle.images.readBinary!=="function")throw new Error("The original image is not available.")
  const bytes:Uint8Array=await spindle.images.readBinary(id,userId),mime=visualReferenceMime(image.mime_type)||["image/png","image/jpeg","image/webp"].find(v=>encodedImageDimensions(bytes,v))||""
  const size=encodedImageDimensions(bytes,mime)
  if(!size||!bytes.length||size.width<1||size.height<1||Math.max(size.width,size.height)>4096||size.width*size.height>16_777_216||bytes.length>5_600_000)throw new Error("Use a readable PNG/JPEG/WebP up to 4096px per side and 5.6 MB for this operation.")
  let binary="";for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
  return {image,...size,reference:{data:btoa(binary),mimeType:mime}}
}
function postRenderConfig(raw:unknown,original:GenerationRecord|undefined,connection:SwarmConnection){
  const input=asRecord(raw),p=asRecord(input.parameters),op=asRecord(original?.parameters)
  const parameters:JsonObject={}
  for(const key of ["sampler","scheduler","vae","qwenModel","clipLModel","clipGModel","t5XXLModel"]){const value=asString(p[key]??op[key]);if(value)parameters[key]=value.slice(0,500)}
  const loras=Array.isArray(p.loras)?p.loras:op.loras,weights=Array.isArray(p.loraWeights)?p.loraWeights:op.loraWeights
  if(Array.isArray(loras)){parameters.loras=loras.slice(0,32).map(value=>asString(value).slice(0,500));parameters.loraWeights=(parameters.loras as string[]).map((_,i)=>finalizeNumber(Array.isArray(weights)?weights[i]:undefined,1,-4,4))}
  return {connection_id:connection.id,model:asString(input.model||original?.model||connection.model).slice(0,500),prompt:asString(input.prompt??original?.prompt).slice(0,12000),negativePrompt:asString(input.negativePrompt??original?.negativePrompt).slice(0,12000),parameters}
}
// Validate real node input names, not a guessed node-pack version. Newly required
// scalar defaults may be supplied by the provider, but required links must be explicit.
function postDetailInputs(info:JsonObject,provided:JsonObject):JsonObject{
  const required=asRecord(asRecord(info.input).required),all=postFields(info),result:JsonObject={}
  for(const [key,value] of Object.entries(provided))if(Object.hasOwn(all,key)){const choices=postChoices(info,key);if(choices.length&&typeof value==="string"&&!choices.includes(value))throw new Error(`The installed detailer does not support ${key}: ${value}.`);const meta=Array.isArray(all[key])?asRecord((all[key] as unknown[])[1]):{};if(typeof value==="number"&&((typeof meta.min==="number"&&value<meta.min)||(typeof meta.max==="number"&&value>meta.max)))throw new Error(`The installed detailer does not support ${key}: ${value}.`);result[key]=value}
  for(const [key,value] of Object.entries(required))if(!Object.hasOwn(result,key)){
    if(!Array.isArray(value))throw new Error(`Unsupported detailer field: ${key}`)
    const options=asRecord(value[1]);if(Object.hasOwn(options,"default"))result[key]=options.default
    else if(Array.isArray(value[0])&&value[0].length)result[key]=value[0][0]
    else throw new Error(`This detailer version requires an unsupported input: ${key}`)
  }
  return result
}
function postDetailGraph(info:JsonObject,stage:FinalizeStage,input:ReturnType<typeof postRenderConfig>,anima:boolean):JsonObject{
  const graph:JsonObject={};const node=(class_type:string,inputs:JsonObject):[string,number]=>{const id=String(Object.keys(graph).length+1);graph[id]={class_type,inputs};return [id,0]}
  const image=node("SwarmLoadImageB64",{image_base64:"${init_image}"})
  const p=input.parameters
  let model:[string,number],clip:[string,number],vae:[string,number]
  if(anima){model=node("UNETLoader",{unet_name:"${model}",weight_dtype:"default"});clip=node("CLIPLoader",{clip_name:asString(p.qwenModel)||"qwen_3_06b_base.safetensors",type:"stable_diffusion",device:"default"});vae=node("VAELoader",{vae_name:asString(p.vae)||"qwen_image_vae.safetensors"})}
  else{model=node("CheckpointLoaderSimple",{ckpt_name:"${model}"});clip=[model[0],1];vae=[model[0],2]}
  const loras=Array.isArray(p.loras)?p.loras:[],weights=Array.isArray(p.loraWeights)?p.loraWeights:[]
  for(let i=0;i<loras.length;i++){if(!loras[i])continue;const strength=finalizeNumber(weights[i],1,-4,4);model=node("LoraLoader",{model,clip,lora_name:loras[i],strength_model:strength,strength_clip:strength});clip=[model[0],1]}
  const positive=node("CLIPTextEncode",{clip,text:"${prompt}"}),negative=node("CLIPTextEncode",{clip,text:"${negative_prompt}"})
  const detector=node("UltralyticsDetectorProvider",{model_name:stage.detector})
  const sampler=asString(p.sampler)||"euler",scheduler=asString(p.scheduler)||"simple"
  const detail=node("FaceDetailer",postDetailInputs(info,{image,model,clip,vae,positive,negative,bbox_detector:detector,guide_size:stage.detailGuide,guide_size_for:true,max_size:stage.detailMax,seed:stage.seed,steps:stage.steps,cfg:stage.cfg,sampler_name:sampler,scheduler,denoise:stage.creativity,feather:stage.detailFeather,noise_mask:true,force_inpaint:true,bbox_threshold:stage.detailThreshold,bbox_dilation:stage.detailDilation,bbox_crop_factor:stage.detailCrop,sam_detection_hint:"none",sam_dilation:0,sam_threshold:.93,sam_bbox_expansion:0,sam_mask_hint_threshold:.7,sam_mask_hint_use_negative:"False",drop_size:10,wildcard:"",cycle:stage.detailCycles,inpaint_model:false,noise_mask_feather:stage.detailFeather,tiled_encode:false,tiled_decode:false}))
  node("SaveImage",{images:detail,filename_prefix:"${prefix}"});return graph
}
async function postSave(result:JsonObject,input:JsonObject,sourceId:string,label:string,started:number,userId?:string){
  const id=asString(result.imageId);if(!castKey(id)||id===sourceId)throw new Error("The provider did not return a new saved output.")
  const url=asString(result.imageUrl)||`/api/v1/images/${encodeURIComponent(id)}`
  const record=await saveGenerationRecord({...result,imageUrl:url},input,{workflow:label,initImageId:sourceId,initImageLabel:"Postproduction source"},{totalMs:Date.now()-started,prep:"",generation:"",source:"measured",resolvedPrompt:"",resolvedNegativePrompt:"",presets:[],swarmPath:"",swarmPathVerified:false,resolvedSeed:null},userId)
  return {id,url,record}
}
async function runFinalizeStage(payload:JsonObject,controller:AbortController,progress:(p:ImageGenerationProgress)=>void,userId?:string){
  const {signal}=controller,stage=finalizeStage(payload.stage),id=asString(payload.imageId),connection=await getConnection(asString(payload.connectionId),userId)
  signal.throwIfAborted();if(!stage.enabled||stage.kind==="despill")throw new Error("Disabled or local-only stage.")
  if(stage.kind==="upscale"||stage.kind==="cutout"){
    await awaitGenerationTask(signal,()=>postSource(id,userId))
    const cutout=stage.kind==="cutout";if(cutout&&await inspectStudioBiRefNet(connection,userId)!=="installed")throw new Error("BiRefNet is not confirmed installed on this backend.")
    if(!cutout&&(!stage.model||![2,3,4].includes(stage.scale)))throw new Error("Choose an installed upscaler and an integer 2–4× factor.")
    const output=await upscaleOutput(id,connection,userId,undefined,controller,normalizeStudioUpscaleSettings(cutout?{mode:"custom",graph:JSON.stringify(builtInBackgroundGraph())}:{mode:"model",model:stage.model,factor:stage.scale}),cutout?"remove-background":undefined,progress,"finalize");if(output.id===id)throw new Error("Provider returned the original instead of a derivative.");return output
  }
  const source=await awaitGenerationTask(signal,()=>postSource(id,userId)),original=(await loadGenerationRecords(userId)).find(r=>r.imageId===id),config=postRenderConfig(payload.config,original,connection)
  if(!config.model||!config.prompt.trim())throw new Error("Choose a checkpoint and describe the artwork before refining.")
  const width=Math.max(64,Math.round(source.width*stage.scale/8)*8),height=Math.max(64,Math.round(source.height*stage.scale/8)*8)
  if(stage.kind==="refine"&&(Math.max(width,height)>4096||width*height>16_777_216))throw new Error("Refinement dimensions exceed the 4096px / 16MP limit.")
  let input:JsonObject={...config,userId,owner_chat_id:source.image.owner_chat_id||undefined,owner_character_id:source.image.owner_character_id||undefined,studioSurface:"finalize",studioStage:stage.kind==="detail"?"detailer_result":"refinement_result",studioParentImageId:id,parameters:{...config.parameters,width:stage.kind==="detail"?source.width:width,height:stage.kind==="detail"?source.height:height,steps:stage.steps,cfgScale:stage.cfg,denoise:stage.creativity,seed:stage.seed,referenceImages:[source.reference]}}
  const started=Date.now()
  if(stage.kind==="detail"||stage.reference){
    const family=await resolveEffectiveCompiler("auto",config.model,connection,userId),anima=family.family.startsWith("anima")&&family.known
    if(stage.kind==="detail"){
      if(!anima&&!(family.known&&family.family==="illustrious"))throw new Error("Built-in detailer supports Anima and Illustrious checkpoints; use the existing custom workflow editor for other architectures.")
      const [det,detail]=await Promise.all([postNode(connection,"UltralyticsDetectorProvider",userId),postNode(connection,"FaceDetailer",userId)])
      if(!postChoices(det,"model_name").includes(stage.detector)||!postHas(detail,["image","bbox_detector","model","clip","vae","positive","negative","denoise"]))throw new Error("Install Impact Pack / Impact Subpack and choose an available detector.")
      if(stage.detailGuide>stage.detailMax)throw new Error("Detailer guide size cannot exceed its maximum crop size.")
      for(const [field,value,base] of [["guide_size",stage.detailGuide,512],["max_size",stage.detailMax,1024],["bbox_threshold",stage.detailThreshold,.5],["bbox_dilation",stage.detailDilation,10],["bbox_crop_factor",stage.detailCrop,2.5],["feather",stage.detailFeather,12],["cycle",stage.detailCycles,1]] as const)if(value!==base&&!postHas(detail,[field]))throw new Error(`The installed detailer does not expose ${field}.`)
      input.prompt=stage.detailPrompt.trim()||config.prompt;input.negativePrompt=stage.detailNegative.trim()||config.negativePrompt
      asRecord(input.parameters).rawRequestOverride=JSON.stringify({comfyworkflowraw:JSON.stringify(postDetailGraph(detail,stage,config,anima))})
    }else{
      if(!anima)throw new Error("Reference-assisted refinement requires a recognized Anima checkpoint.")
      const ref=await postNode(connection,"AnimaRefAdapter",userId)
      if(!postHas(ref,["model","vae","image","ref_guidance"])||(stage.end!==1&&!postHas(ref,["ref_end"])))throw new Error("The installed Anima reference adapter does not expose the requested controls.")
      Object.assign(asRecord(input.parameters),{animaRefGuidance:stage.guidance,animaRefEnd:stage.end,animaRefRefine:true})
      input=await withAnimaReference(input,{id,url:""},userId)
    }
  }
  signal.throwIfAborted()
  const result=await generateWithProgress(input,controller,await backendUuid(),userId,progress)
  // Save the effective recipe, not a generated graph or image payload.
  const recorded={...input,parameters:{...config.parameters,width:stage.kind==="detail"?source.width:width,height:stage.kind==="detail"?source.height:height,steps:stage.steps,cfgScale:stage.cfg,denoise:stage.creativity,seed:stage.seed,finalizeStage:stage}}
  return postSave(result,recorded,id,FINALIZE_LABELS[stage.kind],started,userId)
}
function postSamGraph(model:string,point:{x:number;y:number},device:string):JsonObject{return {
  "1":{class_type:"SwarmLoadImageB64",inputs:{image_base64:"${init_image}"}},
  "2":{class_type:"DownloadAndLoadSAM2Model",inputs:{model,segmentor:"single_image",device,precision:device==="cpu"?"fp32":"fp16"}},
  "3":{class_type:"Sam2Segmentation",inputs:{sam2_model:["2",0],image:["1",0],coordinates_positive:JSON.stringify([point]),keep_model_loaded:false}},
  "4":{class_type:"MaskToImage",inputs:{mask:["3",0]}},
  "5":{class_type:"SaveImage",inputs:{images:["4",0],filename_prefix:"${prefix}"}}
}}
async function runSmartSelection(payload:JsonObject,controller:AbortController,progress:(p:ImageGenerationProgress)=>void,userId?:string){
  const {signal}=controller,connection=await getConnection(asString(payload.connectionId),userId),id=asString(payload.imageId),source=await awaitGenerationTask(signal,()=>postSource(id,userId))
  const x=Number(payload.x),y=Number(payload.y),model=asString(payload.model),device=payload.device==="cpu"?"cpu":"cuda"
  if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=source.width||y>=source.height)throw new Error("The selection point is outside the source image.")
  const [loader,segment,mask]=await Promise.all([postNode(connection,"DownloadAndLoadSAM2Model",userId),postNode(connection,"Sam2Segmentation",userId),postNode(connection,"MaskToImage",userId)])
  if(!postChoices(loader,"model").includes(model)||!postChoices(loader,"device").includes(device)||!postHas(segment,["sam2_model","image","coordinates_positive","keep_model_loaded"])||!postHas(mask,["mask"]))throw new Error("Compatible Kijai SAM2 nodes are not available on this backend.")
  const input:JsonObject={connection_id:connection.id,model:connection.model,prompt:"",negativePrompt:"",userId,studioSurface:"edit",studioStage:"selection_mask",studioParentImageId:id,parameters:{width:source.width,height:source.height,referenceImages:[source.reference],rawRequestOverride:JSON.stringify({comfyworkflowraw:JSON.stringify(postSamGraph(model,{x,y},device))})}}
  const start=Date.now(),result=await generateWithProgress(input,controller,await backendUuid(),userId,progress)
  // The provider saves a mask. Keep it as an explicit derivative so Vacuum can audit it;
  // never attach it to a chat or replace the source image.
  return postSave(result,{...input,parameters:{width:source.width,height:source.height,samModel:model}},id,"Smart selection mask",start,userId)
}
