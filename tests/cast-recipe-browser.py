"""Real Cast workspace; strict optimistic save and scoped deletion transport."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={cleanCastLibrary,cleanCastRenderRecipe,StudioCastWorkspace,STYLES};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
(ROOT/'test-results').mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':860}); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(1200px,100%);height:820px;overflow:auto"></div></div></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES;document.head.append(style);
    const member=(id,group)=>({id,groupId:group,name:id,prefix:id,images:{neutral:{id:id+'-art'}}});
    // Deliberately interleave members from different groups, as Genesis appends them.
    window.mock={library:t.cleanCastLibrary({groups:[{id:'crew',name:'BNHA'},{id:'other',name:'Other'}],members:[member('shoto','crew'),member('other-id','other'),member('mina','crew')],chatGroups:{chat:'crew'}}),sent:[],callbacks:new Set(),opened:null};
    const emit=p=>{for(const fn of [...mock.callbacks])fn(structuredClone(p))};mock.emit=emit;
    const capture=t.cleanCastRenderRecipe({connectionId:'swarm',checkpoint:'AnimaYume',family:'auto',generation:{recipe:{width:640,height:960,steps:36,cfg:4},prefix:'solo, cowboy shot, plain background',negative:'no blur'},stack:[{name:'house.safetensors',title:'House style',weight:.85,useTrigger:true,trigger:'house style'},{name:'missing.safetensors',weight:.5,enabled:false}]});
    const context=()=>({capture,presets:[{title:"Alien Stage",description:"",paramMap:{}},{title:"negatives 2",description:"",paramMap:{}}],connectionId:'swarm',stacks:[{id:'saved',name:'Saved stack',items:[{name:'house.safetensors',weight:.7,enabled:true,useTrigger:true}]}],checkpoints:[{name:'AnimaYume',compatClass:'anima'}],loras:[{name:'house.safetensors',triggerPhrase:'house style',compatClass:'anima'}],workflows:[{name:'Remove background'},{name:'Alternate'}],samplers:['euler','dpmpp_2m_sde_gpu'],schedulers:['normal','beta57'],connections:[{id:'swarm',name:'My Swarm'}],inheritedRecipe:{width:768,height:1024,sampler:'euler',scheduler:'normal'}});
    window.ctx={onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(p){mock.sent.push(structuredClone(p));queueMicrotask(()=>{
      const reply=data=>emit({type:'cast_result',requestId:p.requestId,data});
      if(p.type==='load_cast_library')reply({...mock.library,chatId:'chat'});
      else if(p.type==='save_cast_library'){
        if(p.baseSignature!==JSON.stringify(mock.library)){emit({type:'studio_error',requestId:p.requestId,error:'Cast changed while you were editing. Reload before saving; newly generated assets are protected.'});return}
        mock.library=t.cleanCastLibrary(p.library);reply(mock.library);
      }else if(p.type==='load_upscale_workflow'){
        if(p.connectionId!=='swarm')throw new Error('wrong connection');
        const parameters=p.name==='Alternate'?[{id:'alt-in',name:'Alternate source',type:'image'}]:[{id:'actual-image-id',name:'Portrait source',type:'image'},{id:'mask-in',name:'Mask image',viewType:'image'},{id:'other',name:'Not an image',type:'text'}];
        setTimeout(()=>emit({type:'upscale_workflow_result',requestId:p.requestId,data:{parameters}}),p.name==='Alternate'?15:100);
      }else if(p.type==='set_cast_recipe'){
        const g=mock.library.groups.find(x=>x.id===p.groupId);if(p.recipe)g.recipe=t.cleanCastRenderRecipe(p.recipe);else delete g.recipe;
        mock.library=t.cleanCastLibrary(mock.library);reply({library:mock.library});
      }else if(p.type==='remove_cast_member'){
        // A concurrent Genesis registration lands before the server performs removal.
        mock.library.members.find(x=>x.id==='shoto').images.joy={id:'new-joy',url:'/api/v1/images/new-joy'};
        mock.library.members=mock.library.members.filter(x=>x.id!==p.memberId||x.groupId!==p.groupId);reply({library:mock.library});
      }
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],options=>mock.opened=options,()=>{},context);
  }''')
  page.set_default_timeout(7000)
  page.locator('.cast-card[data-id=crew]').click()
  action=lambda key:page.locator(f'[data-cast-action="{key}"]')
  modal=page.locator('#ss-cast-dialog')
  action('recipe').click();modal.locator('[name=appearance]').fill('Adult casual outfits');modal.locator('[name=sidecarInstructions]').fill('One fixed outfit; no actions.')
  instructions=modal.locator('[name=sidecarInstructions]')
  example=modal.locator('[data-cast-action=recipe-sidecar-example]')
  example.click();with_example=instructions.input_value()
  assert with_example.startswith('One fixed outfit; no actions.\n\n') and 'bubbly expressions, expressive posing' in with_example
  example.click();assert instructions.input_value()==with_example
  instructions.fill('x'*3990);example.click();assert instructions.input_value()=='x'*3990
  instructions.fill(with_example)
  modal.locator('[data-cast-action=recipe-capture]').click()
  assert modal.locator('[name=sidecarInstructions]').input_value()==with_example
  assert modal.locator('[name=appearance]').input_value()=='Adult casual outfits'
  assert modal.locator('[name=lora-weight-0]').input_value()=='0.85'
  prefix=modal.locator('[name=prefix]');prefix.fill(r'\(ALIEN STAGE\) @qmeng_ci @VIVINOS')
  picker=modal.get_by_role('combobox',name='Insert Swarm preset');picker.select_option('Alien Stage');picker.select_option('Alien Stage');picker.select_option('negatives 2')
  assert prefix.input_value()==r'\(ALIEN STAGE\) @qmeng_ci @VIVINOS, <preset:Alien Stage>, <preset:negatives 2>'
  modal.locator('[name=stackChoice]').select_option('saved');assert modal.locator('[name=lora-weight-0]').input_value()=='0.7'
  modal.locator('[name=lora-weight-0]').fill('0.95');modal.locator('[name=negative]').fill('no blur, bad hands')
  assert modal.locator('[name=sampler]').evaluate('(e)=>e.tagName')=='SELECT'
  assert modal.locator('[name=scheduler]').evaluate('(e)=>e.tagName')=='SELECT'
  modal.locator('[name=sampler]').select_option('dpmpp_2m_sde_gpu');modal.locator('[name=scheduler]').select_option('beta57')
  assert 'My Swarm' in modal.inner_text() and 'Saved image connection: swarm.' not in modal.inner_text()
  modal.get_by_role('button',name='Use inherited size').click()
  assert modal.locator('[name=width]').input_value()=='' and modal.locator('[name=height]').input_value()==''
  assert 'inherited' in modal.locator('[data-recipe-size]').inner_text()
  modal.get_by_role('button',name='2:3 aspect ratio',exact=True).click()
  assert abs(int(modal.locator('[name=width]').input_value())/int(modal.locator('[name=height]').input_value())-2/3)<.018
  modal.locator('[data-recipe-axis=height]').evaluate("e=>{e.value='1152';e.dispatchEvent(new Event('input',{bubbles:true}))}")
  assert modal.locator('[name=width]').input_value()=='768'
  modal.get_by_role('button',name='Toggle aspect ratio lock').click()
  modal.locator('[name=width]').fill('832');modal.locator('[name=width]').press('Tab')
  assert modal.locator('[name=height]').input_value()=='1152'
  modal.locator('[name=backgroundMode]').select_option('saved')
  modal.locator('[name=workflow]').select_option('Remove background')
  modal.locator('[name=workflow]').select_option('Alternate')
  page.wait_for_function("document.querySelector('[name=imageParam]').value==='alt-in'")
  page.wait_for_timeout(150)
  assert modal.locator('[name=imageParam]').input_value()=='alt-in'
  modal.locator('[name=workflow]').select_option('Remove background')
  modal.locator('[name=imageParam] option[value=actual-image-id]').wait_for(state='attached')
  assert modal.locator('[name=imageParam] option[value=other]').count()==0
  modal.locator('[name=imageParam]').select_option('actual-image-id')
  assert modal.locator('[name=imageParam] option:checked').inner_text()=='Portrait source'

  assert modal.evaluate('(m)=>m.scrollWidth<=m.clientWidth+2')
  assert modal.locator('.dialog-footer').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight+1')
  assert modal.locator('[name=lora-enabled-0]').evaluate('(e)=>e.getBoundingClientRect().width<=20')
  modal.locator('.dialog-body').evaluate('(e)=>e.scrollTop=0')
  if width in (1440,390):
   modal.locator('.cast-recipe-canvas').evaluate("e=>e.scrollIntoView({block:'start'})")
   page.screenshot(path=str(ROOT/f'test-results/cast-recipe-{width}.png'))
  modal.locator('[form=ss-cast-recipe-form]').click();page.wait_for_function("mock.library.groups[0].recipe?.stack[0].weight===.95")
  assert page.evaluate("mock.library.groups[0].recipe.generation.prefix.endsWith('<preset:Alien Stage>, <preset:negatives 2>')")
  assert page.evaluate("mock.library.groups[0].recipe.sidecarInstructions")==with_example
  assert page.evaluate("(()=>{const r=mock.library.groups[0].recipe;return r.generation.recipe.width===832&&r.generation.recipe.height===1152&&r.generation.recipe.sampler==='dpmpp_2m_sde_gpu'&&r.generation.recipe.scheduler==='beta57'&&r.background.imageParam==='actual-image-id'})()")
  action('recipe').first.click();page.wait_for_function("document.querySelector('[name=imageParam] option:checked')?.textContent==='Portrait source'")
  assert modal.locator('[name=sidecarInstructions]').input_value()==with_example
  assert modal.locator('[name=sampler]').input_value()=='dpmpp_2m_sde_gpu'
  modal.locator('[data-cast-action=close-dialog]').first.click()
  assert page.evaluate("!mock.sent.some(x=>x.type==='save_cast_library')")
  assert modal.locator('[name=prefix]').input_value()==r'\(ALIEN STAGE\) @qmeng_ci @VIVINOS, <preset:Alien Stage>, <preset:negatives 2>'
  # Manual workshop receives the same recipe.
  action('expressions').click();page.wait_for_function('mock.opened!==null');assert page.evaluate('mock.opened.recipe.stack[0].weight===.95')
  # Interleaved group order cannot cause a false stale conflict on identity saves.
  page.locator('[data-cast-action=member-tab][data-tab=identity]').click();form=page.locator('#ss-cast-identity-form')
  form.locator('[name=name]').fill('Shoto updated');form.locator('button[type=submit]').click();page.wait_for_function("mock.library.members.find(m=>m.id==='shoto').name==='Shoto updated'")
  assert page.locator('.cast-warning').count()==0
  # Genuine concurrent edit is still protected, then reload unblocks removal.
  page.evaluate("mock.library.members.find(m=>m.id==='other-id').name='External edit'")
  form.locator('[name=name]').fill('Unsaved stale name');form.locator('button[type=submit]').click();page.locator('.cast-warning').get_by_text('Cast changed while',exact=False).wait_for()
  action('reload-cast').click();modal.locator('[data-cast-action=reload-cast-confirm]').click();page.locator('.cast-warning').wait_for(state='detached')
  assert page.evaluate("mock.library.members.find(m=>m.id==='other-id').name==='External edit'")
  page.locator('[data-cast-action=member][data-id=mina]').click();page.locator('[data-cast-action=member-tab][data-tab=identity]').click()
  action('remove-member').click();modal.locator('[data-cast-action=confirm-remove]').click();page.wait_for_function("!mock.library.members.some(m=>m.id==='mina')")
  assert page.evaluate("mock.library.members.find(m=>m.id==='shoto').images.joy.id==='new-joy'")
  assert page.evaluate("mock.library.groups[0].recipe.stack[0].weight===.95")
  assert page.locator('.cast-warning').count()==0
  assert not errors,errors
  print(f'Cast Recipe / authoritative saves PASS at {width}px')
  page.close()
 browser.close()
