// Offline, read-only timing report. Supports UTF-8 and Windows PowerShell UTF-16LE.
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export function decodeTimingLog(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return bytes.subarray(2).toString('utf16le')
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return Buffer.from(bytes.subarray(2)).swap16().toString('utf16le')
  return bytes.toString('utf8').replace(/^\uFEFF/, '')
}
const seconds = n => Number.isFinite(n) ? Number((n / 1000).toFixed(3)) : null
const difference = (a,b) => Number.isFinite(a)&&Number.isFinite(b)&&b>=a ? seconds(b-a) : null
export function summarizeTiming(text) {
  const jobs = new Map(), attempts = new Map(), images = new Map(), memory = [], all = []
  let day=0, previousClock=-1, ignored=0, parsed=0
  for (const line of text.split(/\r?\n/)) {
    const clock = /^(\d{2}):(\d{2}):(\d{2})/.exec(line.trim())
    let fallback
    if (clock) {
      const t=(Number(clock[1])*3600+Number(clock[2])*60+Number(clock[3]))*1000
      if(previousClock-t>43200000)day+=86400000
      previousClock=t;fallback=day+t
    }
    if(line.includes('critical memory pressure'))memory.push(fallback)
    const marker=/\[Swarm Studio (timing|inline)\]\s+/.exec(line)
    if(!marker)continue
    let e
    try {e=JSON.parse(line.slice(marker.index+marker[0].length).trim());if(!e||typeof e.action!=='string')throw Error()}catch{ignored++;continue}
    parsed++;e.t=Number.isFinite(e.atMs)?e.atMs:fallback;all.push(e)
    // Never include arbitrary log fields in the report. IDs remain internal.
    if(marker[1]==='inline'&&e.jobId){
      if(!jobs.has(e.jobId))jobs.set(e.jobId,{events:[],attemptIds:new Set()})
      const j=jobs.get(e.jobId);j.events.push(e)
      if(e.attemptId)j.attemptIds.add(e.attemptId)
    }
    if(e.attemptId){if(!attempts.has(e.attemptId))attempts.set(e.attemptId,[]);attempts.get(e.attemptId).push(e)}
    if(e.action==='provider-summary'&&e.imageId)images.set(e.imageId,e.attemptId)
  }
  const rows=[], names=new Map(), jobNames=new Map();let manual=0, inline=0, derivatives=0, other=0
  const times=all.map(e=>e.t).filter(Number.isFinite)
  const mixedClock=all.some(e=>Number.isFinite(e.atMs))&&all.some(e=>!Number.isFinite(e.atMs)&&Number.isFinite(e.t))
  const origin=times.reduce((min,t)=>Math.min(min,t),Infinity)
  const offset=e=>mixedClock?null:difference(origin,e?.t)
  const terminals=all.filter(e=>e.action==='terminal-received')
  for(const [id,j] of jobs){if(!j.events.some(e=>['reserved','prepare-start','provider-returned','bitmap-saved','attached','prepare-complete'].includes(e.action)))continue;jobNames.set(id,`CG ${++inline}`)}
  const attemptToJob=new Map()
  for(const [id,j] of jobs)for(const attempt of j.attemptIds)attemptToJob.set(attempt,id)
  // Alias everything, including provider IDs. No prompt, slot or account identifiers are emitted.
  for(const [id,es] of attempts){
    if(!es.some(e=>['provider-dispatch','provider-summary','metadata-start','manual-prepare-start','provider-returned','prepare-complete'].includes(e.action)))continue
    const j=attemptToJob.get(id), stage=es.find(e=>e.stage)?.stage||''
    let label=jobNames.get(j)
    if(label){const siblings=[...names.values()].filter(n=>n===label||n.startsWith(label+' retry '));if(siblings.length)label+=` retry ${siblings.length}`}
    else if(stage.includes('upscale')||stage.includes('background_removed'))label=`Derivative ${++derivatives}`
    else if(es.some(e=>e.action==='manual-prepare-start'))label=`Manual ${++manual}`
    else label=`Other ${++other}`
    names.set(id,label)
  }
  for(const [id,es] of attempts){
    const label=names.get(id);if(!label)continue
    const get=a=>es.find(e=>e.action===a), end=get('provider-summary'), dispatch=get('provider-dispatch'), ready=get('provider-returned'), report=get('swarm-reported-timing'), job=jobs.get(attemptToJob.get(id)), stage=es.find(e=>e.stage)?.stage|| (job?'inline_illustration':'unknown')
    const parent=es.find(e=>e.parentImageId)?.parentImageId
    const derivativeStart=parent&&dispatch?all.filter(e=>e.action==='derivative-prepare-start'&&e.parentImageId===parent&&e.stage===stage&&e.t<=dispatch.t):[]
    const start=get('manual-prepare-start')||job?.events.find(e=>e.action==='reserved'||e.action==='prepare-start')||(derivativeStart.length===1?derivativeStart[0]:undefined)
    const generation=job?.events.find(e=>e.generationId)
    const terminal=generation&&terminals.find(e=>e.generationId===generation.generationId&&e.chatId===generation.chatId)
    const nearEnd=get('provider-near-end')
    const attached=es.find(e=>e.action==='attached'&&(!ready?.imageId||e.imageId===ready.imageId))
    const publication=get('manual-result-published')||attached
    rows.push({run:label,kind:stage==='inline_illustration'?'inline draft':stage.includes('upscale')?'upscale':stage.includes('background_removed')?'background removal':stage==='general_generation'?'manual':stage==='unknown'?'unknown':'other',parent:names.get(images.get(parent))||null, status:end?.outcome|| (ready?'returned (legacy log)':es.at(-1)?.action||'unknown'), start_offset_s:offset(start), dispatch_offset_s:offset(dispatch), first_progress_offset_s:offset(get('provider-first-progress')), near_end_offset_s:offset(nearEnd), result_offset_s:offset(ready||end), terminal_offset_s:offset(terminal), preparation_s:difference(start?.t,dispatch?.t), metadata_s:difference(get('metadata-start')?.t,get('metadata-ready')?.t), dispatch_to_first_event_s:seconds(end?.firstEventMs??get('provider-first-event')?.sinceDispatchMs), dispatch_to_first_progress_s:seconds(end?.firstProgressMs??get('provider-first-progress')?.sinceDispatchMs), provider_total_s:seconds(end?.sinceDispatchMs), reservation_to_result_s:difference(start?.t,(ready||end)?.t), last_progress_to_result_s:seconds(end?.lastProgressToResultMs), max_read_wait_s:seconds(end?.maxReadWaitMs), max_event_gap_s:seconds(end?.maxEventGapMs), max_forward_call_s:seconds(end?.maxForwardMs), last_step:end&&end.progressCount?`${end.lastStep}/${end.lastTotal}`:null, progress_updates:end?.progressCount??null, preview_events:end?.previewCount??null, swarm_prep_s:report?.source==='swarm'&&Number.isFinite(report.prepSeconds)?report.prepSeconds:null, swarm_generation_s:report?.source==='swarm'&&Number.isFinite(report.generationSeconds)?report.generationSeconds:null, result_to_publish_s:difference((ready||end)?.t,publication?.t)})
  }
  const reservationsWithoutAttempt=[...jobs].filter(([id,j])=>jobNames.has(id)&&!rows.some(r=>r.run===jobNames.get(id))&&j.events.some(e=>e.action==='reserved')).length
  rows.sort((a,b)=>(a.start_offset_s??a.dispatch_offset_s??a.result_offset_s??Infinity)-(b.start_offset_s??b.dispatch_offset_s??b.result_offset_s??Infinity))
  return {parsed_events:parsed, malformed_events:ignored, mixed_clock:mixedClock, memory_pressure_count:memory.length, reservations_without_reported_attempt:reservationsWithoutAttempt, runs:rows}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const path=process.argv[2]
  if(!path){console.error('Usage: bun scripts/summarize-provider-timing.mjs <console-log.txt>');process.exitCode=2}
  else {try {const result=summarizeTiming(decodeTimingLog(readFileSync(path)));console.log(JSON.stringify(result,null,2));if(!result.parsed_events)console.error('No Swarm Studio timing or inline events found. Confirm the console log and diagnostic build.')}catch(e){console.error(`Unable to read timing log: ${e.message}`);process.exitCode=1}}
}
