import assert from 'node:assert/strict'
import {cleanStageDirection,cleanStageDirectionStore,effectiveStageDirection,stageDirectionProtocol,stageDirectionState,stageDirectionInsert,stageCueProject,theaterCueParse,theaterLiveUnits,cleanCastLibrary,castPrompt} from '../dist/frontend.js'
const defaults=cleanStageDirection(null)
assert.equal(defaults.mode,'off');assert.equal(defaults.position,'before');assert.equal(defaults.role,'system');assert.equal(defaults.generate,false);assert.equal(defaults.continuity,false)
assert.equal(cleanStageDirection({depth:1e9}).depth,100);assert.equal(cleanStageDirection({depth:-4}).depth,0)
const auto=cleanStageDirection({mode:'auto',generate:true}),macro=cleanStageDirection({mode:'macro',position:'depth',role:'assistant',depth:2}),off=cleanStageDirection({mode:'off'})
const store=cleanStageDirectionStore({global:auto,casts:{g:macro},chats:{one:off}})
assert.deepEqual(effectiveStageDirection(store,'g','one'),off);assert.deepEqual(effectiveStageDirection(store,'g','two'),macro);assert.deepEqual(effectiveStageDirection(store,'other','two'),auto)
const lib=cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Test',inject:true,backgrounds:[{key:'kitchen',name:'Kitchen',id:'kitchen-img',aliases:['old-kitchen']}]}],members:[{id:'x',groupId:'g',name:'Actor',prefix:'actor',images:{joy:{id:'actor-joy'}}}]})
const protocol=stageDirectionProtocol(auto,lib.groups[0]);assert.match(protocol,/kitchen/);assert.match(protocol,/<swarm-background=g:new-scene-key>/);assert.match(protocol,/\[\[lighting:/);assert.match(protocol,/\[\[stage-fx:/);assert.doesNotMatch(protocol,/scene=|Date\(/)
assert.equal(stageDirectionProtocol(off,lib.groups[0]),'');assert.doesNotMatch(stageDirectionProtocol(cleanStageDirection({mode:'auto',scenery:false,lighting:false}),lib.groups[0]),/SCENERY:|LIGHTING:|<swarm-background=/)
assert.doesNotMatch(castPrompt({...lib,inject:true},[],auto),/For a background-stage look|omit or use atmosphere=none/)
const raw='[[scene: kitchen]]\n[[lighting: moonlight]]\n[[atmosphere: rain intensity=60]]\n\nThe room was quiet.\n\n[[stage-fx: sparkles]]\n\nHe smiled.'
assert.equal((stageCueProject(raw,'render').match(/data-ss-stage-cue=/g)||[]).length,4);assert.doesNotMatch(stageCueProject(raw,'prompt'),/\[\[/);assert.match(stageCueProject(raw,'prompt'),/The room was quiet/)
for(const protectedText of ['```xml\n[[scene: kitchen]]\n```','<div>\n[[lighting: moonlight]]\n</div>','<!--\n[[scene: kitchen]]\n-->','    [[scene: kitchen]]','> [[scene: kitchen]]','[[lighting: unknown]]','[[scene: https://evil.invalid/x]]','[[scene: kitchen onclick=x]]','<swarm-cast=actor-joy>\n[[lighting: moonlight]]\n</swarm-cast>'])assert.equal(stageCueProject(protectedText,'render'),protectedText)
assert.equal(theaterLiveUnits('[[scene: kitchen]]').length,0);assert.equal(theaterLiveUnits('[[scene: kitchen]]\n[[lighting: moon').length,1)
assert.equal(theaterCueParse('[[lighting: moonlight]]').effect,'moonlight');assert.equal(theaterCueParse('[[scene: none]]').kind,'scene')
const hist=[{role:'assistant',content:raw},{role:'user',content:'[[scene: forest]]'},{role:'assistant',content:'<swarm-cast=actor-joy>"Hello"</swarm-cast>'}]
assert.equal(stageDirectionState(hist),'scene=kitchen; lighting=moonlight; weather=rain');assert.equal(stageDirectionState([...hist,{role:'assistant',content:'[[scene: forest]]\n\nNew room.'}]),'scene=forest')
assert.equal(stageDirectionState([{role:'assistant',content:'    [[scene: kitchen]]'}]),'');
const base=[{role:'system',content:'preset'},{role:'user',content:'u',__isChatHistory:true},{role:'assistant',content:'a',__isChatHistory:true},{role:'system',content:'tail'}],stage={role:'system',content:protocol}
assert.equal(stageDirectionInsert(base,stage,'before').indexOf(stage),1);assert.equal(stageDirectionInsert(base,stage,'after').indexOf(stage),3);assert.equal(stageDirectionInsert(base,stage,'depth',1).indexOf(stage),2)
assert.deepEqual(stageDirectionInsert([...base.slice(0,-1),{role:'user',content:'next',__isChatHistory:true},base.at(-1)],stage,'before').slice(0,4),stageDirectionInsert(base,stage,'before').slice(0,4))
// Live reports: models use braille blanks in BOTH font markup and cue padding.
// The same canonical message must retain its packet, but not its directions in prompt context.
const liveRaw='<font⠀color="#599ce3">"Earlier dialogue."</font>\r\n\r\n⠀[[scene:⠀izakaya-booth]]\r\n[[lighting: golden-hour]]\r\n\r\n<swarm-cast=actor-joy>"Later dialogue."</swarm-cast>';
assert.equal((stageCueProject(liveRaw,'render').match(/data-ss-stage-cue=/g)||[]).length,2);
assert.doesNotMatch(stageCueProject(liveRaw,'prompt'),/\[\[/);
assert.ok(stageCueProject(liveRaw,'prompt').startsWith('<font⠀color="#599ce3">"Earlier dialogue."</font>'));
assert.ok(stageCueProject(liveRaw,'prompt').endsWith('<swarm-cast=actor-joy>"Later dialogue."</swarm-cast>'));
assert.equal(stageDirectionState([{role:'assistant',content:liveRaw}]),'scene=izakaya-booth; lighting=golden-hour');
for(const literal of ['<div⠀class="note">\n⠀[[scene: kitchen]]\n</div>','```xml\n⠀[[scene: kitchen]]\n```','    [[scene:⠀kitchen]]','<swarm-cast=actor-joy>\n⠀[[scene: kitchen]]\n</swarm-cast>'])assert.equal(stageCueProject(literal,'render'),literal);
console.log('Stage Direction shared contract PASS: scoped settings, cue safety, persistent state, placement, stable prefix')
