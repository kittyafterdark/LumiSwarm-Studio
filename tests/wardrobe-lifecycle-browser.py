"""Exercise compiled wardrobe lifecycle UI with the same state helpers as the backend.
Run python tests/wardrobe-lifecycle-browser.py; no live Lumiverse needed."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={cleanCastLibrary,StudioCastWorkspace,castRegistryKey,castRegistryEntries,castRegistryReconcile,castRegistryAttach,castRegistryCopyOutfit,castWardrobeLifecycle,castActiveWardrobes,castWardrobeView,castWardrobes,STYLES,CAST_PRESENTATION_CSS};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
OUT=Path(os.environ.get('WARDROBE_LIFECYCLE_SCREENSHOTS','/tmp/alpha172-wardrobe'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [w for w in (1440,390,320) if not os.environ.get('WARDROBE_LIFECYCLE_WIDTH') or w==int(os.environ['WARDROBE_LIFECYCLE_WIDTH'])]:
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
        if(p.type==='save_cast_library'||p.type==='cast_registry_attach'||p.type==='cast_registry_copy_outfit'||p.type==='cast_wardrobe_lifecycle')if(p.baseSignature!==JSON.stringify(mock.library))throw new Error('Fixture stale write');
        if(p.type==='save_cast_library')mock.library=t.castRegistryReconcile(mock.library,t.cleanCastLibrary(p.library));
        else if(p.type==='cast_registry_attach'){let next=mock.library;for(const id of p.sourceIds)next=t.castRegistryAttach(next,id,p.groupId,'linked-'+(++mock.count),p.mode,p.targetId);mock.library=next}
        else if(p.type==='cast_registry_copy_outfit')mock.library=t.castRegistryCopyOutfit(mock.library,p.sourceId,p.sourceKey,p.targetId,p.name);
        else if(p.type==='cast_wardrobe_lifecycle')mock.library=t.castWardrobeLifecycle(mock.library,p.memberId,p.key,p.action,p.replacement);
        else if(p.type==='remove_cast_member'){mock.library=t.castRegistryReconcile(mock.library,{...mock.library,members:mock.library.members.filter(m=>m.id!==p.memberId)});reply({library:mock.library});return}
        reply(mock.library);emit({type:'cast_library_changed',library:mock.library,registryChanged:true});
      }catch(e){emit({type:'studio_error',requestId:p.requestId,error:e.message})}
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],cast=>{mock.opened=cast},()=>{});
    window.member=id=>mock.library.members.find(m=>m.id===id);
    window.linked=(group,key)=>mock.library.members.find(m=>m.groupId===group&&t.castRegistryKey(m)===key);
  }''')
  page.locator('.cast-card[data-id="broad"]').wait_for()
  page.evaluate('''()=>{mock.library=t.castRegistryAttach(mock.library,"k","third","linked-k","link");mock.library.members.find(m=>m.id==="linked-k").preferredWardrobe="recovery";mock.library=t.cleanCastLibrary(mock.library);for(const cb of mock.callbacks)cb({type:"cast_library_changed",registryChanged:true,library:mock.library})}''')
  page.locator('.cast-card[data-id="broad"]').click();page.locator('[data-cast-action="member"][data-id="k"]').click();page.locator('[data-wardrobe="recovery"]').click()
  page.locator('[data-cast-action="registry-prefer-wardrobe"]').click();page.wait_for_function('member("k").preferredWardrobe==="recovery"')
  manage=page.locator('[data-cast-action="wardrobe-manage"][data-outfit-key="recovery"]')
  manage.click();d=page.locator('#ss-cast-dialog');expect(d).to_be_visible();expect(d.get_by_text('Affects 2 linked casts: Epilogue, Recovery AU.')).to_be_visible();expect(d.get_by_role('button',name='Remove globally',exact=True)).to_be_disabled();expect(d.get_by_label('Replacement starting outfit')).to_have_value('default')
  assert d.locator('.dialog-footer').evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1}')
  assert d.locator('.cast-wardrobe-confirm').evaluate('e=>{const box=e.querySelector("input").getBoundingClientRect(),text=e.querySelector("span").getBoundingClientRect();return box.width===18&&text.width>100&&e.scrollWidth<=e.clientWidth+1}')
  page.screenshot(path=str(OUT/f'manage-{width}.png'))
  d.get_by_role('button',name='Hide in this cast',exact=True).click();expect(d).not_to_be_visible();page.wait_for_function('member("k").hiddenWardrobes?.includes("recovery")')
  assert page.evaluate('!member("linked-k").hiddenWardrobes && member("linked-k").preferredWardrobe==="recovery" && !member("k").preferredWardrobe')
  expect(page.get_by_role('heading',name='Hidden in this cast')).to_be_visible();expect(page.locator('[data-cast-action="wardrobe-select"][data-wardrobe="recovery"]')).to_have_count(0)
  page.locator('[data-cast-action="expressions"]').click();page.wait_for_function('mock.opened?.wardrobeChoices.length===1')
  page.screenshot(path=str(OUT/f'hidden-{width}.png'))
  manage.click();d.get_by_role('button',name='Show in this cast',exact=True).click();expect(d).not_to_be_visible();page.wait_for_function('!member("k").hiddenWardrobes');expect(page.locator('[data-wardrobe="recovery"][aria-pressed="true"]')).to_be_visible()
  # Hide again, then verify that a global archive/restore preserves the local hide.
  manage.click();d.get_by_role('button',name='Hide in this cast',exact=True).click();expect(d).not_to_be_visible()
  manage.click();d.get_by_role('button',name='Archive globally',exact=True).click();expect(d).not_to_be_visible();page.wait_for_function('member("k").wardrobes[1].archived===true && member("linked-k").wardrobes[1].archived===true')
  assert page.evaluate('member("k").images["recovery-neutral"].id')=='recovery-k';assert page.evaluate('!member("k").preferredWardrobe && !member("linked-k").preferredWardrobe')
  expect(page.locator('[data-cast-action="wardrobe-select"][data-wardrobe="recovery"]')).to_have_count(0);expect(page.get_by_text('Archived outfits')).to_be_visible();page.screenshot(path=str(OUT/f'archived-{width}.png'))
  page.locator('[data-cast-action="expressions"]').click();page.wait_for_function('mock.opened?.wardrobeChoices.length===1');assert page.evaluate('mock.opened.wardrobeChoices[0].key')=='default'
  manage.click();d.get_by_role('button',name='Restore globally',exact=True).click();expect(d).not_to_be_visible();page.wait_for_function('!member("k").wardrobes[1].archived');assert page.evaluate('member("k").hiddenWardrobes.includes("recovery") && !member("linked-k").hiddenWardrobes && !member("linked-k").wardrobes[1].archived');expect(page.get_by_role('heading',name='Hidden in this cast')).to_be_visible()
  manage.click();d.get_by_role('button',name='Show in this cast',exact=True).click();expect(d).not_to_be_visible();expect(page.locator('[data-wardrobe="recovery"][aria-pressed="true"]')).to_be_visible()
  # Confirmation must become invalid if another cast adds artwork while open.
  manage.click();d.get_by_role('checkbox').check();page.evaluate('''()=>{mock.library.members.find(m=>m.id==="k").name="Changed elsewhere";mock.library.members.find(m=>m.id==="linked-k").name="Changed elsewhere";for(const cb of mock.callbacks)cb({type:"cast_library_changed",registryChanged:true,library:mock.library})}''')
  d.get_by_role('button',name='Remove globally',exact=True).click();expect(d.get_by_role('alert')).to_contain_text('Reopen outfit management');assert page.evaluate('!!member("k").images["recovery-neutral"]');d.get_by_role('button',name='Cancel',exact=True).click()
  manage.click();d.get_by_role('checkbox').check();d.get_by_role('button',name='Remove globally',exact=True).click();expect(d).not_to_be_visible();page.wait_for_function('member("k").wardrobes.length===1 && member("linked-k").wardrobes.length===1')
  assert page.evaluate('member("k").images.neutral.id')=='casual-k';assert page.evaluate('member("existing").images.neutral.id')=='different-k';assert page.evaluate('!member("k").images["recovery-neutral"]');assert not errors,errors
  print(f'Wardrobe lifecycle {width}: local hide/show, linked isolation, global archive/restore, workshop exclusion, stale confirmation guard, permanent remove: PASS',flush=True)
  page.close()
 browser.close()
