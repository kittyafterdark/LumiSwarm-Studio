"""Chromium regression: opt-in, manual queue, background asset reuse, and live Cast hydration.
Provider/storage are mocked; the production workspace, styles and narrative renderer are real.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, re, os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,castRenderIslands,cleanCastLibrary,StudioCastWorkspace,StudioCastNarrative,STYLES};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
WORLD=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text('utf8'))[1])
OUT=Path(os.environ.get('BACKGROUND_SCREENSHOTS',str(ROOT/'test-results')));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for width in [w for w in (1440,390,320) if not os.environ.get("BACKGROUND_WIDTH") or int(os.environ["BACKGROUND_WIDTH"])==w]:
  page=browser.new_page(viewport={'width':width,'height':860})
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/jpeg' if 'background' in route.request.url else 'image/png',body=WORLD if 'background' in route.request.url else ART))
  page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(1100px,100%);height:820px;overflow:auto"></div></div><main id="message" style="width:min(100%,640px);position:fixed;left:-10000px;top:0;pointer-events:none"></main></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(style);
    const library=t.cleanCastLibrary({activeGroupId:'crew',chatGroups:{chat:'crew'},groups:[{id:'crew',name:'Crew',defaultPresentation:'vn-hero',inject:true},{id:'another',name:'Another crew'}],members:[{id:'s',groupId:'crew',name:'Shoto',prefix:'shoto',images:{joy:{id:'portrait1'}}}]});
    window.mock={library,folders:[],callbacks:new Set(),jobs:[],sent:[],fail:false,picked:null,source:'Before <swarm-background=crew:library>Empty library at dusk</swarm-background> <swarm-cast=shoto-joy background=library>"First."</swarm-cast> after.'};
    const emit=p=>{for(const fn of [...mock.callbacks])fn(p)};mock.emit=emit;
    window.ctx={getActiveChat:()=>({chatId:'chat'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#message')}],getMessageId:()=> 'm1'},events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(data){mock.sent.push(structuredClone(data));queueMicrotask(()=>{
      if(data.type==='load_cast_library')emit({type:'cast_result',requestId:data.requestId,data:{...mock.library,chatId:'chat',characterId:'',backgroundJobs:mock.jobs}});
      else if(data.type==='load_cast_background_settings')emit({type:'cast_result',requestId:data.requestId,data:{model:'Anima',connectionName:'SwarmUI',recipe:{width:1344,height:768,steps:28,cfg:5,sampler:'euler',scheduler:'normal'}}});
      else if(data.type==='save_cast_library'){
        if(data.baseSignature!==JSON.stringify(mock.library)){emit({type:'studio_error',requestId:data.requestId,error:'Stale Cast'});return}
        mock.library=t.cleanCastLibrary(data.library);emit({type:'cast_library_changed',library:mock.library});emit({type:'cast_result',requestId:data.requestId,data:mock.library});
      }else if(data.type==='generate_cast_background'){
        if(mock.fail){mock.fail=false;emit({type:'studio_error',requestId:data.requestId,error:'Provider unavailable'});return}
        if(!data.review)throw new Error('Manual job must require review');mock.jobs=[{groupId:data.groupId,key:data.key,name:data.name,candidateId:'candidate-'+mock.sent.length,status:'queued',step:0,totalSteps:0}];emit({type:'cast_result',requestId:data.requestId,data:{status:'queued',backgroundJobs:mock.jobs}})
      }else if(data.type==='review_cast_background'){
        const job=mock.jobs.find(j=>j.key===data.key&&j.groupId===data.groupId&&j.candidateId===data.candidateId&&j.status==='review');if(!job)throw new Error('Missing review');mock.jobs=[];
        if(data.action==='accept'){mock.folders=[{id:'cast-background-assets',name:'Background Assets',imageIds:[job.imageId],binding:null}];mock.library.groups[0].backgrounds.push({key:job.key,name:job.name,id:job.imageId,aliases:[]});mock.library=t.cleanCastLibrary(mock.library);emit({type:'cast_library_changed',library:mock.library,backgroundGenerated:true})}
        emit({type:'cast_background_job',data:{...job,status:data.action==='accept'?'ready':'discarded'}});emit({type:'cast_result',requestId:data.requestId,data:{library:mock.library,backgroundJobs:mock.jobs}})
      }
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>mock.folders,()=>{},(initial,choose,folderId)=>{mock.picked=folderId;choose({id:'background-1',url:'/api/v1/images/background-1'})},()=>({checkpoints:[{name:'Anima'},{name:'Other checkpoint'}],samplers:['euler','dpmpp'],schedulers:['normal'],stacks:[{id:'scenic',name:'Scenic details'}],connectionId:'swarm'}),(image,target)=>{mock.edited={image,target}});
    document.querySelector('#message').innerHTML=t.castRenderIslands(mock.source);window.narrative=new t.StudioCastNarrative(ctx);
    mock.complete=()=>{const job={...mock.jobs[0],status:'review',imageId:'background-1'};mock.jobs=[job];emit({type:'cast_background_job',data:job})};
  }''')
  page.set_default_timeout(8000)
  page.locator('.cast-card[data-id=crew]').click()
  action=lambda key:page.locator(f'[data-cast-action="{key}"]')
  action('backgrounds').click()
  modal=page.locator('#ss-cast-dialog')
  assert action('background-auto').get_attribute('aria-pressed')=='false'
  action('background-auto').click();page.wait_for_function('mock.library.groups[0].generateBackgrounds===true')
  assert action('background-auto').get_attribute('aria-pressed')=='true'
  action('background-generate').click()
  page.locator('[name=name]').fill('Library at dusk');page.locator('[name=key]').fill('library');page.locator('[name=prompt]').fill('Empty library at dusk')
  page.wait_for_function("document.querySelector('[name=steps]').placeholder==='28'")
  page.locator('[name=steps]').fill('43');page.locator('[name=checkpoint]').fill('Other checkpoint');page.locator('[name=cfg]').fill('3.2');page.locator('[name=stackId]').select_option('scenic')
  page.screenshot(path=str(OUT/f'workshop-{width}.png'))
  page.evaluate('mock.fail=true');page.locator('[form=ss-cast-background-generate]').click()
  modal.locator('[data-cast-error]').wait_for();assert page.locator('[name=prompt]').input_value()=='Empty library at dusk'
  page.locator('[form=ss-cast-background-generate]').click()
  modal.get_by_text('Queued',exact=True).wait_for()
  assert page.evaluate("mock.sent.findLast(x=>x.type==='generate_cast_background').settings.recipe.steps") ==43
  assert page.evaluate("mock.sent.findLast(x=>x.type==='generate_cast_background').settings.stackId") =='scenic'
  page.evaluate("mock.emit({type:'cast_background_job',data:{...mock.jobs[0],status:'generating',step:4,totalSteps:8,preview:'data:image/png;base64,AQID'}})")
  modal.get_by_text('Generating · 4/8',exact=True).wait_for()
  assert modal.locator('[data-bg-preview] img').get_attribute('src')=='data:image/png;base64,AQID'
  assert page.locator('[name=prompt]').is_disabled()
  assert not page.locator('.cast-background-tile').count()
  page.evaluate('mock.complete()');modal.get_by_text('Awaiting your approval',exact=True).wait_for()
  assert page.evaluate('mock.library.groups[0].backgrounds.length')==0
  assert page.evaluate('mock.folders.length')==0
  assert modal.locator('[data-bg-preview] img').evaluate('(e)=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}')
  assert action('background-accept').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight')
  assert modal.locator('.dialog-footer').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
  page.screenshot(path=str(OUT/f'review-{width}.png'))
  action('background-veto').click();page.wait_for_function('mock.jobs.length===0');page.locator('[form=ss-cast-background-generate]').wait_for()
  assert page.locator('[name=prompt]').input_value()=='Empty library at dusk'
  assert page.locator('[name=steps]').input_value()=='43'
  action('background-reset-settings').click();assert page.locator('[name=steps]').input_value()==''
  assert page.locator('[name=stackId]').input_value()==''
  page.locator('[form=ss-cast-background-generate]').click();modal.get_by_text('Queued',exact=True).wait_for()
  page.evaluate('mock.complete()');modal.get_by_text('Awaiting your approval',exact=True).wait_for()
  # A candidate remains reviewable after returning to the scene library.
  modal.get_by_role('button',name='Back',exact=True).click();modal.locator('.cast-bg-review-card').wait_for()
  assert not page.locator('.cast-background-tile').count()
  action('background-accept').click();modal.locator('.cast-background-tile').wait_for()
  assert not modal.get_by_text('Generating · 4/8',exact=False).count()
  page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('.ss-cast-design')?.style.getPropertyValue('--cast-world').includes('background-1')")
  assert 'Empty library at dusk' not in page.locator('#message').inner_text()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  assert modal.evaluate('(m)=>m.scrollWidth<=m.clientWidth+2')
  if width==390:
   page.screenshot(path=str(OUT/'cast-background-jobs-mobile.png'))
  if width==1440:
   page.screenshot(path=str(OUT/'cast-background-jobs-desktop.png'))
  modal.locator('[data-cast-action=close-dialog]').first.click()
  action('home').click();page.locator('.cast-card[data-id=another]').click();action('backgrounds').click()
  action('background-reuse').click();assert page.evaluate('mock.picked')=='cast-background-assets'
  page.locator('[name=name]').fill('Reused library');page.locator('[name=key]').fill('shared-library')
  page.locator('[form=ss-cast-background-form]').click();page.wait_for_function("mock.library.groups[1].backgrounds[0]?.id==='background-1'")
  assert page.evaluate('mock.sent.filter(x=>x.type==="generate_cast_background").length===3') # failed submission, vetoed candidate, accepted retry; reuse did not generate
  # Multiple live registrations should remain a compact, stable gallery.
  page.evaluate("""()=>{const g=mock.library.groups[1];for(let i=0;i<5;i++)g.backgrounds.push({key:'scene-'+i,name:['Evening kitchen','Moonlit balcony','Izakaya booth','A very long background scene name for overflow','Agency entrance'][i],id:'background-'+(i+2)});g.defaultBackground='scene-0';mock.library=t.cleanCastLibrary(mock.library);mock.emit({type:'cast_library_changed',library:mock.library,backgroundGenerated:true})}""")
  page.wait_for_function('document.querySelectorAll(".cast-background-tile").length===6')
  assert modal.locator('.cast-background-tile.is-default').count()==1
  assert modal.locator('.cast-background-actions button').count()==30
  assert modal.locator('.cast-background-actions button svg').count()==30
  assert modal.locator('.cast-background-actions button').evaluate_all('(nodes)=>nodes.every(n=>n.title&&n.getAttribute("aria-label"))')
  assert modal.locator('.cast-background-grid').evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
  assert modal.locator('.dialog-footer').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight')
  assert modal.locator('.cast-background-tile').evaluate_all('(els)=>els.every(e=>e.querySelector(".cast-background-actions").scrollWidth<=e.querySelector(".cast-background-actions").clientWidth+2)')
  if width in (1440,390):page.screenshot(path=str(OUT/f'background-gallery-{width}.png'))
  action('background-default').and_(page.locator('[data-key=scene-2]')).click();page.wait_for_function('mock.library.groups[1].defaultBackground==="scene-2"')
  action('background-edit-art').and_(page.locator('[data-key=scene-2]')).click();page.wait_for_function('mock.edited?.target.backgroundKey==="scene-2" && mock.edited.image.id==="background-4"')
  assert not errors,errors
  print(f'Cast background jobs UI {width}px: PASS',flush=True)
  page.close()
 browser.close()
