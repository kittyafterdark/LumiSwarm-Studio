"""Exercise compiled registry UI with the same state helpers as the backend.
Run python tests/cast-registry-browser.py; no live Lumiverse needed."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={cleanCastLibrary,StudioCastWorkspace,castRegistryKey,castRegistryEntries,castRegistryReconcile,castRegistryAttach,castRegistryCopyOutfit,castWardrobeView,castWardrobes,STYLES,CAST_PRESENTATION_CSS};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
OUT=Path(os.environ.get('REGISTRY_SCREENSHOTS','/tmp/alpha17-registry'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [w for w in (1440,390,320) if not os.environ.get('REGISTRY_WIDTH') or w==int(os.environ['REGISTRY_WIDTH'])]:
  page=browser.new_page(viewport={'width':width,'height':860 if width>320 else 690});page.set_default_timeout(7000);errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell" style="--ss-canvas-bg:#14131a;--ss-panel-bg:#1c1923;--ss-panel-hi:#292532;--ss-text:#efe9f3;--ss-muted:#b4a9c2;--ss-accent:#c9aef5;--ss-accent-soft:#3d304c;--ss-accent-line:#8177b3;--ss-outline:#555064;--ss-border-subtle:#383441;--ss-field-bg:#282432;--ss-primary-bg:#c9aef5;--ss-primary-ink:#1c1624"><div class="ss-cast-workspace" id="cast" style="width:100%;height:calc(100dvh - 12px);overflow:auto"></div></div></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS;document.head.append(style);
    window.mock={library:t.cleanCastLibrary({groups:[{id:'broad',name:'Epilogue'},{id:'duo',name:'Shōto & Katsuki'},{id:'third',name:'Recovery AU'}],members:[{id:'k',groupId:'broad',name:'Katsuki',prefix:'katsuki',identityPrompt:'scar',referenceImageId:'ref-k',images:{neutral:{id:'casual-k'},'recovery-neutral':{id:'recovery-k'}},wardrobes:[{key:'default',name:'Everyday',slots:{neutral:'neutral'}},{key:'recovery',name:'Recovery',outfitPrompt:'compression sleeve',slots:{neutral:'recovery-neutral'}}]},{id:'s',groupId:'broad',name:'Shōto',prefix:'shoto',images:{neutral:{id:'shoto-ref'}}},{id:'mina',groupId:'broad',name:'Mina',prefix:'mina',images:{joy:{id:'mina-art'}}},{id:'existing',groupId:'duo',name:'Katsuki',prefix:'katsuki',presentation:'portrait',presentationSide:'right',images:{neutral:{id:'different-k'}}}],chatGroups:{chat:'broad'}}),callbacks:new Set(),count:0,calls:[],opened:null};
    const emit=p=>{for(const fn of [...mock.callbacks])fn(structuredClone(p))};
    window.ctx={onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(p){mock.calls.push(structuredClone(p));queueMicrotask(()=>{
      const reply=data=>emit({type:'cast_result',requestId:p.requestId,data});
      try{
        if(p.type==='load_cast_library'){reply({...mock.library,chatId:'chat'});return}
        if(p.type==='save_cast_library'||p.type==='cast_registry_attach'||p.type==='cast_registry_copy_outfit')if(p.baseSignature!==JSON.stringify(mock.library))throw new Error('Fixture stale write');
        if(p.type==='save_cast_library')mock.library=t.castRegistryReconcile(mock.library,t.cleanCastLibrary(p.library));
        else if(p.type==='cast_registry_attach'){let next=mock.library;for(const id of p.sourceIds)next=t.castRegistryAttach(next,id,p.groupId,'linked-'+(++mock.count),p.mode,p.targetId);mock.library=next}
        else if(p.type==='cast_registry_copy_outfit')mock.library=t.castRegistryCopyOutfit(mock.library,p.sourceId,p.sourceKey,p.targetId,p.name);
        else if(p.type==='remove_cast_member'){mock.library=t.castRegistryReconcile(mock.library,{...mock.library,members:mock.library.members.filter(m=>m.id!==p.memberId)});reply({library:mock.library});return}
        reply(mock.library);emit({type:'cast_library_changed',library:mock.library});
      }catch(e){emit({type:'studio_error',requestId:p.requestId,error:e.message})}
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],cast=>{mock.opened=cast},()=>{});
    window.member=id=>mock.library.members.find(m=>m.id===id);
    window.linked=(group,key)=>mock.library.members.find(m=>m.groupId===group&&t.castRegistryKey(m)===key);
  }''')
  page.get_by_role('button',name='Character library',exact=True).click()
  d=page.locator('#ss-cast-dialog');expect(d).to_be_visible()
  d.get_by_label('Destination cast').select_option('duo');d.get_by_label('Search characters').fill('recovery')
  expect(d.locator('.cast-registry-card:visible')).to_have_count(1)
  d.get_by_label('Search characters').fill('');expect(d.locator('.cast-registry-card:visible')).to_have_count(4)
  assert d.locator('[data-registry-list]').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
  assert d.locator('.dialog-footer').evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=window.innerHeight+1}')
  # Linked/unlinked cards keep the same three action slots, widths and footer alignment.
  def geometry():
   return d.locator('.cast-registry-card:visible').evaluate_all('''cards=>cards.map(c=>{const r=c.getBoundingClientRect(), a=c.querySelector('.cast-registry-actions'), ar=a.getBoundingClientRect();return {w:r.width,h:r.height,y:r.y,bottom:r.bottom-ar.bottom,actions:[...a.children].map(b=>{const q=b.getBoundingClientRect();return {x:q.x-r.x,y:q.y-r.y,w:q.width,h:q.height,fit:b.scrollWidth<=b.clientWidth+1}})}})''')
  def assert_geometry(rows):
   for r in rows:
    assert len(r['actions'])==3,r
    assert max(a['w'] for a in r['actions'])-min(a['w'] for a in r['actions'])<=1,r
    assert max(a['y'] for a in r['actions'])-min(a['y'] for a in r['actions'])<=1,r
    assert all(a['fit'] and a['h']>=44 for a in r['actions']),r
   assert max(r['bottom'] for r in rows)-min(r['bottom'] for r in rows)<=1,rows
   if width==1440:
    assert max(r['h'] for r in rows)-min(r['h'] for r in rows)<=1,rows
    assert max(r['actions'][0]['y'] for r in rows)-min(r['actions'][0]['y'] for r in rows)<=1,rows
  initial=geometry();assert_geometry(initial)
  assert d.locator('.cast-registry-linked').count()==1
  expect(d.locator('.cast-registry-card').filter(has=page.locator('[data-registry-id="existing"]')).get_by_role('button',name='Copy outfit')).to_be_disabled()
  d.get_by_label('Search characters').fill('recovery');single=geometry();assert len(single)==1 and abs(single[0]['w']-initial[0]['w'])<=1,single
  d.get_by_label('Search characters').fill('');assert_geometry(geometry())
  d.get_by_label('Destination cast').select_option('third');assert_geometry(geometry())
  assert d.locator('[data-cast-action="registry-copy"]:disabled').count()==4
  d.get_by_label('Destination cast').select_option('duo');assert_geometry(geometry())
  page.screenshot(path=str(OUT/f'library-{width}.png'))
  # Two independently created Katsukis: don't replace an established prefix.
  source=d.locator('.cast-registry-card').filter(has=page.locator('[data-registry-id="k"]'))
  expect(source.locator('[data-cast-action="registry-existing"]')).to_have_count(0)
  source.get_by_role('button',name='Copy outfit',exact=True).click()
  d.get_by_label('Source outfit').select_option('recovery');expect(d.get_by_label('New outfit name')).to_have_value('Recovery')
  d.get_by_role('button',name='Copy outfit',exact=True).click();expect(d).not_to_be_visible()
  page.wait_for_function('t.castWardrobeView(member("existing"),"recovery").images.neutral.id==="recovery-k"')
  assert page.evaluate('member("existing").images.neutral.id')=='different-k'
  expect(page.locator('[data-wardrobe="recovery"]')).to_have_attribute('aria-pressed','true')
  page.locator('[data-cast-action="registry-prefer-wardrobe"]').click();page.wait_for_function('member("existing").preferredWardrobe==="recovery"')
  # Link two characters with one operation to a new ensemble.
  page.locator('[data-cast-action="registry-open"]').click();d.get_by_label('Destination cast').select_option('third')
  d.locator('[data-registry-id="k"]').check();d.locator('[data-registry-id="s"]').check();d.get_by_role('button',name='Link selected',exact=True).click()
  page.wait_for_function('linked("third","k") && linked("third","s")');expect(d.locator('[data-registry-id="k"]')).to_be_disabled()
  # Source and linked copy share artwork; actual workshop save takes same path.
  d.get_by_role('button',name='Close',exact=True).last.click();page.locator('[data-cast-action="home"]').click();page.locator('.cast-card[data-id="third"]').click()
  lid=page.evaluate('linked("third","k").id');page.locator(f'[data-cast-action="member"][data-id="{lid}"]').click();page.locator('[data-cast-action="expressions"]').click()
  page.wait_for_function('mock.opened?.member.id===linked("third","k").id')
  page.evaluate('''async()=>{const o=mock.opened,m=structuredClone(o.member);m.images.joy={id:'shared-joy',url:'/api/v1/image-gen/results/shared-joy'};await o.save(m)}''')
  assert page.evaluate('t.castWardrobeView(member("k"),"default").images.joy.id')=='shared-joy'
  # Linked edit is visible locally without reloading, independent fork keeps earlier art.
  page.locator('[data-cast-action="home"]').click();page.locator('.cast-card[data-id="broad"]').click();page.locator('[data-cast-action="member"][data-id="k"]').click();expect(page.locator('[data-expression-slot="joy"]')).to_be_visible()
  page.locator('[data-cast-action="registry-open"]').click();d.get_by_label('Destination cast').select_option('third');source=d.locator('.cast-registry-card').filter(has=page.locator('[data-registry-id="k"]'));source.get_by_role('button',name='Fork',exact=True).click();page.wait_for_function('mock.library.members.filter(m=>m.groupId==="third"&&m.name==="Katsuki").length===2');assert page.evaluate('mock.library.members.find(m=>m.groupId==="third"&&m.name==="Katsuki"&&t.castRegistryKey(m)!=="k").prefix')=='katsuki_2'
  # Removing the last membership keeps the whole character in the stash.
  d.get_by_role('button',name='Close',exact=True).last.click();page.locator('[data-cast-action="member"][data-id="mina"]').click();page.locator('[data-cast-action="member-tab"][data-tab="identity"]').click();page.locator('[data-cast-action="remove-member"]').click();d.locator('[data-cast-action="confirm-remove"]').click();page.wait_for_function('mock.library.stash?.some(m=>m.id==="mina")');expect(d).not_to_be_visible()
  page.locator('[data-cast-action="registry-open"]').click();d.get_by_label('Destination cast').select_option('duo');expect(d.get_by_text('Uncast · kept in library')).to_be_visible();d.locator('.cast-registry-card').filter(has=page.locator('[data-registry-id="mina"]')).get_by_role('button',name='Link',exact=True).click();page.wait_for_function('linked("duo","mina") && !mock.library.stash?.length');assert page.evaluate('linked("duo","mina").images.joy.id')=='mina-art'
  assert not errors,errors
  print(f'Cast Registry {width}: equal card/action geometry, fixed search columns, disabled action slots, independent copy, multi-link, shared workshop save, fork, stash/relink: PASS',flush=True)
  page.close()
 browser.close()
