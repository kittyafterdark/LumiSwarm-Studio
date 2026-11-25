"""Compiled Cast Album + Expression Studio with optimistic mocked native transport."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={cleanCastLibrary,StudioCastWorkspace,openCharacterExpressions,castWardrobeView,castWardrobes,castResolveWardrobe,stageCueProject,theaterSnapshot,theaterAssemble,theaterLiveVerified,STYLES,CAST_PRESENTATION_CSS};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
OUT=Path(os.environ.get('WARDROBE_SCREENSHOTS','/tmp/alpha16-wardrobe'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [w for w in (1440,390,320) if not os.environ.get('WARDROBE_WIDTH') or w==int(os.environ['WARDROBE_WIDTH'])]:
  page=browser.new_page(viewport={'width':width,'height':860 if width>320 else 690});page.set_default_timeout(7000);errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell" style="--ss-canvas-bg:#14131a;--ss-panel-bg:#1c1923;--ss-panel-hi:#292532;--ss-text:#efe9f3;--ss-muted:#b4a9c2;--ss-accent:#c9aef5;--ss-accent-soft:#3d304c;--ss-accent-line:#8177b3;--ss-outline:#555064;--ss-border-subtle:#383441;--ss-field-bg:#282432;--ss-primary-bg:#c9aef5;--ss-primary-ink:#1c1624"><div class="ss-cast-workspace" id="cast" style="width:100%;height:820px;overflow:auto"></div></div></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
   const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS;document.head.append(style);
   window.mock={library:t.cleanCastLibrary({groups:[{id:'crew',name:'BNHA',inject:true,recipe:{checkpoint:'base.safetensors',generation:{prefix:'solo, cowboy shot',recipe:{width:704,height:512,steps:45}}}}],members:[{id:'actor',groupId:'crew',name:'Katsuki',prefix:'katsuki',identityPrompt:'blond hair',referenceImageId:'casual-ref',images:{neutral:{id:'casual-neutral'},joy:{id:'casual-joy'}},settings:{slots:[{label:'smug',direction:'smirk'}]}}],chatGroups:{chat:'crew'}}),calls:[],callbacks:new Set(),opened:null,requests:[],openCount:0,renderNumber:0};
   const emit=p=>{for(const fn of [...mock.callbacks])fn(structuredClone(p))};
   window.ctx={getActiveChat:()=>({chatId:'chat'}),events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(p){mock.calls.push(structuredClone(p));queueMicrotask(()=>{
     const reply=data=>emit({type:'cast_result',requestId:p.requestId,data});
     if(p.type==='load_cast_library')reply({...mock.library,chatId:'chat'});
     else if(p.type==='save_cast_library'){
       if(p.baseSignature!==JSON.stringify(mock.library)){emit({type:'studio_error',requestId:p.requestId,error:'Fixture stale write'});return}
       mock.library=t.cleanCastLibrary(p.library);reply(mock.library);emit({type:'cast_library_changed',library:mock.library});
     }
   })}};
   window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],cast=>{
      mock.opened=cast;mock.openCount++;
      const folderId='cast:'+cast.member.id+(cast.wardrobeKey&&cast.wardrobeKey!=='default'?':'+cast.wardrobeKey:'');
      window.dialog=t.openCharacterExpressions(document.querySelector('.ss-shell'),{cast,folder:{id:folderId,name:cast.member.name+' · '+(cast.wardrobeName||'Original outfit'),binding:null,imageIds:Object.values(cast.member.images).map(i=>i.id),updatedAt:0},family:'anima',model:'base.safetensors',workflows:[],inheritedRecipe:{},samplers:[],schedulers:[],checkpoints:[],loras:[],stacks:[],deleteDrafts:false,pickImage:(kind,id,choose)=>choose({id:'chosen-ref',url:'/api/v1/images/chosen-ref'}),refresh:()=>{},request:async(type,fields)=>{
         mock.requests.push({type,fields:structuredClone(fields),wardrobeKey:cast.wardrobeKey||'default',folderId});
         if(type==='load_expression_bank')return [];
         if(type==='render_folder_expression'){await new Promise(resolve=>window.releaseRender=resolve);const id='render-'+(++mock.renderNumber);return {id,url:'/api/v1/images/'+id}}
         if(type==='process_folder_expression'){const id='cutout-'+(++mock.renderNumber);return {id,url:'/api/v1/images/'+id}}
         if(type==='load_expression_enhance_options')return {mode:'model',factor:2};return {};
      }});
   },()=>{});
   window.sheet=key=>t.castWardrobeView(mock.library.members[0],key);window.ward=key=>t.castWardrobes(mock.library.members[0]).find(w=>w.key===key);
  }''')
  page.locator('.cast-card[data-id=crew]').click();page.locator('[data-cast-action="expressions"]').click()
  d=page.locator('.ss-expression-dialog[open]');picker=d.get_by_label('Appearance set',exact=True)
  expect(picker).to_have_value('default');expect(d.locator('.ss-expression-card[data-state="ready"]')).to_have_count(2)
  count=d.locator('.ss-expression-card').count();assert count>=21
  d.get_by_role('button',name='+ New set',exact=True).click();overlay=d.locator('.ss-expression-overlay-panel');overlay.get_by_label('Outfit name').fill('Sleepwear');overlay.get_by_label('Outfit prompt').fill('blue pajamas');overlay.get_by_role('button',name='Create appearance set').click();expect(picker).to_have_value('sleepwear')
  expect(d.locator('.ss-expression-card[data-state="ready"]')).to_have_count(0);expect(d.locator('.ss-expression-card')).to_have_count(count)
  assert page.evaluate('sheet("default").images.neutral.id')=='casual-neutral';assert page.evaluate('sheet("sleepwear").referenceImageId')==''
  assert d.locator('.ss-expression-wardrobe-shelf').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  page.screenshot(path=str(OUT/f'fresh-{width}.png'))
  d.get_by_role('button',name='Generation settings',exact=True).click();overlay.get_by_role('button',name='Character',exact=True).click();expect(overlay.get_by_label('Outfit prompt',exact=True)).to_have_value('blue pajamas');overlay.get_by_label('Outfit prompt',exact=True).fill('blue pajama pants');overlay.get_by_role('button',name='Done',exact=True).click()
  d.locator('[data-expression-focus="run-slot-neutral"]').click();page.wait_for_function('typeof window.releaseRender==="function"');expect(picker).to_be_disabled();expect(d.get_by_role('button',name='+ New set',exact=True)).to_be_disabled();assert page.evaluate('mock.requests.filter(x=>x.type==="render_folder_expression").at(-1).folderId')=='cast:actor:sleepwear';assert page.evaluate('mock.requests.filter(x=>x.type==="render_folder_expression").at(-1).fields.renderOverrides.outfit')=='blue pajama pants';page.evaluate('releaseRender()');page.wait_for_function('sheet("sleepwear").images.neutral?.id==="render-1"');expect(picker).to_be_enabled()
  d.get_by_role('button',name='Add alternate for neutral',exact=True).click();expect(d.locator('[data-expression-inline-editor="neutral-alt-1"]')).to_be_visible();d.locator('[data-expression-focus="save-neutral-alt-1"]').click();d.locator('[data-expression-focus="run-slot-neutral-alt-1"]').click();page.wait_for_function('mock.requests.filter(x=>x.type==="render_folder_expression").length===2');page.evaluate('releaseRender()');page.wait_for_function('sheet("sleepwear").images["neutral-alt-1"]?.id==="render-2"');expect(picker).to_be_enabled();assert page.evaluate('sheet("sleepwear").images.neutral.id')=='render-1'
  picker.select_option('default');expect(picker).to_have_value('default');expect(d.locator('.ss-expression-card[data-state="ready"]')).to_have_count(2);assert page.evaluate('sheet("default").images.neutral.id')=='casual-neutral'
  picker.select_option('sleepwear');expect(picker).to_have_value('sleepwear');expect(d.locator('.ss-expression-card[data-state="ready"]')).to_have_count(2);d.get_by_role('button',name='Generation settings',exact=True).click();overlay.get_by_role('button',name='Character',exact=True).click();expect(overlay.get_by_label('Outfit prompt',exact=True)).to_have_value('blue pajama pants');overlay.get_by_role('button',name='Done',exact=True).click();page.screenshot(path=str(OUT/f'populated-{width}.png'))
  d.get_by_role('button',name='+ New set',exact=True).click();overlay.get_by_label('Outfit name').fill('Hero');overlay.get_by_label('Starting point').select_option('settings');overlay.get_by_label('Outfit prompt').fill('hero suit');overlay.get_by_role('button',name='Create appearance set').click();expect(picker).to_have_value('hero');expect(d.locator('.ss-expression-card[data-state="ready"]')).to_have_count(0);d.get_by_role('button',name='Generation settings',exact=True).click();overlay.get_by_role('button',name='Character',exact=True).click();expect(overlay.get_by_label('Outfit prompt',exact=True)).to_have_value('hero suit');overlay.get_by_role('button',name='Done',exact=True).click()
  # The native generator may return a result URL instead of the canonical
  # Cast image URL. A successful first save must not poison later writes.
  result=page.evaluate('''async()=>{
    const opened=mock.opened, edited=structuredClone(opened.member);
    edited.images.neutral={id:'native-result',url:'/api/v1/image-gen/results/native-result'};
    await opened.save(edited);
    const first=sheet('hero').images.neutral;
    edited.images.joy={id:'native-next',url:'/api/v1/image-gen/results/native-next'};
    let error='';try{await opened.save(edited)}catch(e){error=e.message}
    return {first,error,second:sheet('hero').images.joy?.id};
  }''')
  assert result['first']['url']=='/api/v1/images/native-result',result
  assert result['error']=='',result
  assert result['second']=='native-next',result
  # A real concurrent modification to the selected wardrobe must still fail.
  conflict=page.evaluate('''async()=>{
    const opened=mock.opened, edited=structuredClone(opened.member);
    const current=mock.library.members[0],row=ward('hero');
    current.images[row.slots.neutral]={id:'external-replacement',url:'/api/v1/images/external-replacement'};
    mock.library=t.cleanCastLibrary(mock.library);
    for(const cb of mock.callbacks)cb({type:'cast_library_changed',library:structuredClone(mock.library),editChanged:true});
    let error='';try{await opened.save(edited)}catch(e){error=e.message}
    return {error,id:sheet('hero').images.neutral.id};
  }''')
  assert 'wardrobe changed' in conflict['error'] and conflict['id']=='external-replacement',conflict
  # Capture the same invisible render marker the backend emits. Source gate must
  # preserve its sequence despite the marker being hidden in regular chat.
  assert page.evaluate('''()=>{const source='[[atmosphere: rain]]\\n\\nThe glass darkened.\\n\\n';const root=document.createElement('div');root.innerHTML=t.stageCueProject(source,'render').replace('The glass darkened.','<p>The glass darkened.</p>');document.body.append(root);const snap=t.theaterSnapshot('m1',root),full=t.theaterLiveVerified(snap,source),partial=t.theaterLiveVerified(snap,'[[atmosphere: rain');const result=t.theaterAssemble(['m1'],new Map([['m1',full]]));const marker=root.querySelector('[data-ss-stage-cue]');const ok=marker.hidden&&getComputedStyle(marker).display==='none'&&root.innerText.trim()==='The glass darkened.'&&partial.length===0&&result.length===1&&result[0].fx.weather.effect==='rain';root.remove();return ok}''')
  assert not errors,errors
  print(f'Wardrobe workshop {width}: fresh/custom sheet, no cross-outfit saves, locked render, alternate, roundtrip, copied settings and hidden cue: PASS',flush=True)
  page.close()
 browser.close()
