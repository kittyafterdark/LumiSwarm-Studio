"""Real compiled Cast workspace and narrative renderer, mocked Spindle transport."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,castRenderIslands,cleanCastLibrary,cleanCastGenesisSettings,StudioCastWorkspace,StudioCastNarrative,CastBackgroundActivityTracker,STYLES};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
(ROOT/'test-results').mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':860})
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(1100px,100%);height:820px;overflow:auto"></div></div><main id="message" style="width:min(100%,640px);position:fixed;left:-10000px;top:0;pointer-events:none"></main></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(style);
    const library=t.cleanCastLibrary({activeGroupId:'crew',chatGroups:{chat:'crew'},groups:[{id:'crew',name:'Crew',defaultPresentation:'vn-hero',inject:true}],members:[]});
    window.mock={library,folders:[],callbacks:new Set(),jobs:[],sent:[],source:'Before <swarm-cast=mina flag=create type=basics-pipeline expression=joy><font color="pink">"Hello!"</font></swarm-cast> after.'};
    const emit=p=>{for(const fn of [...mock.callbacks])fn(p)};mock.emit=emit;
    window.ctx={getActiveChat:()=>({chatId:'chat'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#message')}],getMessageId:()=> 'm1'},events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(data){mock.sent.push(structuredClone(data));queueMicrotask(()=>{
      if(data.type==='load_cast_library')emit({type:'cast_result',requestId:data.requestId,data:{...mock.library,chatId:'chat',characterId:'',genesisJobs:mock.jobs}});
      else if(data.type==='save_cast_library'){mock.library=t.cleanCastLibrary(data.library);emit({type:'cast_result',requestId:data.requestId,data:mock.library});}
      else if(data.type==='set_cast_genesis_settings'){mock.library.groups[0].genesis=t.cleanCastGenesisSettings(data.settings);mock.library=t.cleanCastLibrary(mock.library);emit({type:'cast_library_changed',library:mock.library});emit({type:'cast_result',requestId:data.requestId,data:{library:mock.library}})}
      else if(data.type==='list_cast_genesis_jobs')emit({type:'cast_result',requestId:data.requestId,data:mock.jobs});
      else if(data.type==='control_cast_genesis_job'){mock.jobs[0].status='rendering';mock.jobs[0].stage='Rendering expression';emit({type:'cast_genesis_job',data:mock.jobs[0]});emit({type:'cast_result',requestId:data.requestId,data:mock.jobs});}
      else if(data.type==='load_cast_member_preferences'||data.type==='load_cast_card_overrides')emit({type:'cast_result',requestId:data.requestId,data:{}});
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>mock.folders,()=>{},()=>{});
    document.querySelector('#message').innerHTML=t.castRenderIslands(mock.source);window.narrative=new t.StudioCastNarrative(ctx);
    mock.review=()=>{mock.jobs=[{id:'j1',groupId:'crew',key:'mina',name:'Mina Ashido',status:'review',stage:'Awaiting design approval',completed:0,total:6,prompt:'pink hair, cream sweater',settings:{pipeline:'basics'},updatedAt:Date.now()}];emit({type:'cast_genesis_job',data:mock.jobs[0]})};
    mock.complete=(joy)=>{mock.library.members=[{id:'mina-id',groupId:'crew',name:'Mina Ashido',prefix:'mina',identityPrompt:'pink hair',images:{neutral:{id:'neutral-art'},...(joy?{joy:{id:'joy-art'},sadness:{id:'sadness-art'},anger:{id:'anger-art'},surprise:{id:'surprise-art'},fear:{id:'fear-art'}}:{})}}];mock.library=t.cleanCastLibrary(mock.library);mock.jobs[0]={...mock.jobs[0],memberId:'mina-id',status:joy?'ready':'processing',stage:joy?'Expressions ready':'Removing background',completed:joy?6:1};emit({type:'cast_library_changed',library:mock.library,genesisGenerated:true});emit({type:'cast_genesis_job',data:mock.jobs[0]})};
  }''')
  page.set_default_timeout(8000)
  page.locator('.cast-card[data-id=crew]').click()
  assert page.evaluate("!mock.sent.some(x=>x.type==='save_cast_library')")
  action=lambda key:page.locator(f'[data-cast-action="{key}"]')
  action('genesis').click();modal=page.locator('#ss-cast-dialog')
  assert not modal.locator('[name=enabled]').is_checked()
  assert modal.locator('[name=reference]').input_value()=='prompt'
  assert modal.get_by_text('Neutral always renders',exact=False).count()==1
  assert page.evaluate("t.cleanCastGenesisSettings({reference:'neutral'}).reference==='prompt'")
  modal.locator('.cast-genesis-toggle').click();modal.locator('[name=approval]').select_option('review');modal.locator('[name=limit]').select_option('2');modal.locator('[name=reference]').select_option('anima-neutral')
  modal.locator('[form=ss-cast-genesis-form]').click();page.wait_for_function('mock.library.groups[0].genesis?.enabled===true')
  assert modal.locator('[name=approval]').input_value()=='review'
  assert modal.locator('[name=limit]').input_value()=='2'
  assert modal.locator('[name=reference]').input_value()=='anima-neutral'
  assert page.evaluate("mock.library.groups[0].genesis.reference==='anima-neutral'")
  assert modal.evaluate('(m)=>m.scrollWidth<=m.clientWidth+2')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  if width in (1440,390):page.screenshot(path=str(ROOT/f'test-results/genesis-settings-{width}.png'))
  page.evaluate('mock.review()');modal.locator('[data-job-status=review]').wait_for();assert modal.locator('textarea').input_value()=='pink hair, cream sweater'
  modal.locator('[data-job-action=approve]').click();modal.locator('[data-job-status=rendering]').wait_for()
  assert page.evaluate('mock.sent.some(x=>x.type==="control_cast_genesis_job"&&x.action==="approve")')
  # Reserve the member before its first image, as the real worker does.
  page.evaluate("""()=>{mock.library.members=[{id:'mina-id',groupId:'crew',name:'Mina Ashido',prefix:'mina',identityPrompt:'pink hair',images:{}}];mock.library=t.cleanCastLibrary(mock.library);mock.jobs[0]={...mock.jobs[0],memberId:'mina-id',status:'rendering',stage:'Rendering expression',slot:'neutral',step:2,totalSteps:8,slots:['neutral','joy','sadness','anger','surprise','fear']};mock.emit({type:'cast_library_changed',library:mock.library,genesisGenerated:true});mock.emit({type:'cast_genesis_job',data:mock.jobs[0]})}""")
  modal.locator('[data-cast-action=genesis-member]').click()
  grid=page.locator('[data-cast-expression-grid]');slot=lambda key:grid.locator(f'[data-expression-slot="{key}"]')
  grid.wait_for();assert grid.locator('[data-expression-slot]').count()==6
  assert slot('neutral').get_attribute('data-slot-state')=='active'
  assert slot('neutral').get_by_text('Rendering expression').count()==1
  assert slot('neutral').locator('progress').get_attribute('value')=='2'
  assert slot('joy').get_by_text('Queued',exact=True).count()==1
  page.evaluate("window.initialGrid=document.querySelector('[data-cast-expression-grid]');window.initialJoy=document.querySelector('[data-expression-slot=joy]');window.savedWrites=mock.sent.filter(x=>x.type==='save_cast_library').length")
  page.evaluate("""()=>{mock.jobs[0]={...mock.jobs[0],status:'processing',stage:'Removing background',step:0,totalSteps:0};mock.emit({type:'cast_genesis_job',data:mock.jobs[0]})}""")
  slot('neutral').get_by_text('Removing background').wait_for()
  assert page.evaluate("document.querySelector('[data-cast-expression-grid]')===initialGrid&&document.querySelector('[data-expression-slot=joy]')===initialJoy")
  page.evaluate('mock.complete(false)');page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('img')?.src.includes('neutral-art')")
  slot('neutral').locator('img').wait_for();assert slot('neutral').get_attribute('data-slot-state')=='ready'
  assert page.locator('[data-member-genesis] .cast-genesis-job-count').inner_text()=='1/6'
  page.evaluate("window.neutralImage=document.querySelector('[data-expression-slot=neutral] img');mock.jobs[0]={...mock.jobs[0],slot:'joy',status:'rendering',stage:'Rendering expression',step:4,totalSteps:8};mock.emit({type:'cast_genesis_job',data:mock.jobs[0]})")
  slot('joy').get_by_text('Rendering expression').wait_for()
  assert page.evaluate("document.querySelector('[data-expression-slot=neutral] img')===neutralImage&&document.querySelector('[data-cast-expression-grid]')===initialGrid")
  assert page.evaluate("mock.sent.filter(x=>x.type==='save_cast_library').length===savedWrites")
  assert page.locator('.cast-warning').count()==0
  assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+2")
  if width in (1440,390):page.screenshot(path=str(ROOT/f'test-results/genesis-member-{width}.png'))
  # Failure and resume stay local to the member view and don't discard completed art.
  page.evaluate("mock.jobs[0]={...mock.jobs[0],status:'error',error:'Fixture failure'};mock.emit({type:'cast_genesis_job',data:mock.jobs[0]})")
  assert slot('joy').get_attribute('data-slot-state')=='error'
  page.locator('[data-member-genesis] [data-job-action=retry]').click()
  slot('joy').get_by_text('Rendering expression').wait_for()
  assert page.evaluate("document.querySelector('[data-expression-slot=neutral] img')===neutralImage")
  # Registration must not wipe an unrelated unsaved identity form.
  action('member-tab').filter(has_text='Identity').click()
  page.locator('#ss-cast-identity-form [name=notes]').fill('unsaved identity draft')
  page.evaluate("mock.emit({type:'cast_library_changed',library:mock.library,genesisGenerated:true})")
  assert page.locator('#ss-cast-identity-form [name=notes]').input_value()=='unsaved identity draft'
  action('member-tab').filter(has_text='Expressions').click()
  action('genesis').click()

  page.evaluate('mock.complete(true)');page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('img')?.src.includes('joy-art')")
  assert page.evaluate("document.querySelector('[data-ss-cast-slot]').shadowRoot.querySelector('[data-swarm-cast]').outerHTML.includes('#ffc0cb')")
  modal.locator('[data-job-status=ready]').wait_for();assert modal.get_by_text('6/6',exact=True).count()==1
  if width in (1440,390):
   modal.locator('[data-genesis-jobs]').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/f'test-results/genesis-ready-{width}.png'))
  # Shared nonblocking indicator tracks both categories; no ordinary image job is touched.
  assert page.evaluate('''()=>{const tracker=new t.CastBackgroundActivityTracker();tracker.accept({type:'cast_genesis_job',data:{groupId:'crew',key:'mina',name:'Mina',status:'processing',stage:'Removing background',completed:2,total:6}});const a=tracker.current();tracker.accept({type:'cast_background_job',data:{groupId:'crew',key:'mina',status:'generating',step:2,totalSteps:8}});const b=tracker.current();tracker.accept({type:'cast_genesis_job',data:{groupId:'crew',key:'mina',status:'ready',completed:6,total:6}});const c=tracker.current();return a.label==='Removing background'&&a.detail.includes('2/6')&&b.count===2&&c.count===1&&c.label==='Rendering background'}''')
  modal.locator('[data-cast-action=genesis-member]').click();page.locator('.member-profile').get_by_text('Mina Ashido').wait_for()
  assert not errors,errors
  print(f'Cast Genesis UI and historical hydration {width}px: PASS',flush=True)
  page.close()
 browser.close()
