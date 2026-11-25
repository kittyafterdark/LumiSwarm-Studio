"""Self-contained Playwright/Chromium regression for the composition gallery.
Requires Python playwright and a Chromium executable. The host is in-memory,
including an assistant message shape, so changes catch DOM and null-ref regressions.
"""
import asyncio, base64, re, json, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
FRONT=(ROOT/'dist/frontend.js').read_text()
SRC=(ROOT/'src/studio/styles.ts').read_text()
match=re.search(r'const STYLES = `(.*?)`\s*const STUDIO_V3_STYLES',SRC,re.S)
assert match,'Expected original Studio stylesheet'
CSS=match.group(1)
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
URI='data:image/png;base64,'+base64.b64encode(ART).decode()

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1230,'height':920})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  await page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#16151c;color:#f2eef3"><main id="case" style="width:620px;margin:30px auto"></main><div class="ss-shell"><div id="host" class="ss-cast-workspace" style="width:100%;height:880px;overflow:auto"></div></div></body></html>')
  await page.add_style_tag(content=CSS)
  await page.evaluate('''async source=>{
    const blob=new Blob([source],{type:'text/javascript'});
    const url=URL.createObjectURL(blob);
    window.castApi=await import(url);URL.revokeObjectURL(url);
  }''',FRONT)
  result=await page.evaluate('''({uri})=>{
    const {CAST_PRESENTATION_ENTRIES: entries,CAST_PRESENTATION_CSS:css,cleanCastLibrary,renderCastTags}=window.castApi;
    const style=document.createElement('style');style.textContent=css;document.head.append(style);
    const escape=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
    const cases=[];
    for(const preset of entries){
      const library=cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Test'}],members:[{id:'s',groupId:'g',name:'Shoto Todoroki',prefix:'Shoto',presentation:preset.id,images:{confusion:{id:'saved-image'}},crop:{enabled:true,x:45,y:10,zoom:1.15}}]});
      const markup=renderCastTags('First paragraph. <swarm-cast=Shoto-confusion> <font color="#599CE3">"The corridor is closed."</font></swarm-cast> Last paragraph.',library,escape).replaceAll('/api/v1/images/saved-image',uri);
      const container=document.querySelector('#case');container.innerHTML=markup;
      const mount=container.querySelector('[data-swarm-cast]');
      const quote=mount?.querySelectorAll('[data-swarm-cast-dialogue]');
      const image=mount?.querySelectorAll('img');
      const rect=mount?.getBoundingClientRect();
      const text=container.textContent||'';
      const proof={id:preset.id,group:preset.composition,images:image?.length||0,quotes:quote?.length||0,counts:text.split('The corridor is closed.').length-1,hasUnknownTag:container.innerHTML.includes('<swarm-cast'),width:rect?.width||0,crop:mount?.style.getPropertyValue('--cast-crop-scale'),captionColor:quote?.[0]&&getComputedStyle(quote[0]).color};
      cases.push(proof);
    }
    return cases;
  }''',{'uri':URI})
  assert len(result)==50,len(result)
  for item in result:
   assert item['images']==1,item
   assert item['quotes']==1,item
   assert item['counts']==1,item
   assert not item['hasUnknownTag'],item
   assert item['width']>0,item
   assert item['captionColor']=='rgb(89, 156, 227)',item
  print('PASS: 50 layouts, one image/quote, authored color, valid dimensions, stable source for all')
  stress=await page.evaluate('''({uri})=>{
    const {CAST_PRESENTATION_ENTRIES: entries,cleanCastLibrary,renderCastTags}=window.castApi;
    const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const body=('This is a deliberately long conversation about audit clearance, unexpected detours, missing documents, and why the temperature of the vending machine was never the actual issue. We are testing every shape for readable text after it expands. ').repeat(3);
    const failures=[];
    for(const width of [320,430,780]){
      const container=document.querySelector('#case');container.style.width=width+'px';
      for(const preset of entries){
        const library=cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Test'}],members:[{id:'s',groupId:'g',name:'Shoto Todoroki',prefix:'Shoto',presentation:preset.id,images:{confusion:{id:'saved-image'}},crop:{enabled:true,x:45,y:10,zoom:1.15}}]});
        container.innerHTML='<p>First paragraph before the expression.</p>'+renderCastTags('<swarm-cast=Shoto-confusion> "'+body+'"</swarm-cast>',library,esc).replaceAll('/api/v1/images/saved-image',uri)+'<p id="after">Following paragraph still belongs after the whole expression.</p>';
        const m=container.querySelector('[data-swarm-cast]');const quote=m?.querySelector('[data-swarm-cast-dialogue]');const after=container.querySelector('#after');
        const qr=quote?.getBoundingClientRect(),ar=after?.getBoundingClientRect(),mr=m?.getBoundingClientRect();
        const overflows=container.scrollWidth>container.clientWidth+2;
        const overlaps=!!qr&&!!ar&&qr.bottom>ar.top+2;
        if(overflows||overlaps)failures.push({id:preset.id,width,overflows,overlaps,quoteBottom:qr?.bottom,afterTop:ar?.top,mountBottom:mr?.bottom, scroll:container.scrollWidth,client:container.clientWidth});
      }
    }
    return failures;
  }''',{'uri':URI})
  assert not stress, f'Overflow or overlap: {stress[:25]}'
  print('PASS: 50 layouts × three widths × extra-long dialogue without overflow/overlap')

  # End-to-end modal mocked against the public Cast workspace frontend contract.
  await page.evaluate('''()=>{
    const api=window.castApi;
    const library=api.cleanCastLibrary({activeGroupId:'crew',inject:true,groups:[{id:'crew',name:'Crew'}],members:[{id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',images:{neutral:{id:'saved-image'}}}]});
    const listeners=new Set();window.lm={library,get() {return library}};
    const ctx={onBackendMessage(fn){listeners.add(fn);return()=>listeners.delete(fn)},sendToBackend(message){queueMicrotask(()=>{let response;if(message.type==='load_cast_library')response={type:'cast_result',data:{...window.lm.library,chatId:'chat-1',characterId:'char-1'}};if(message.type==='save_cast_library'){window.lm.library=api.cleanCastLibrary(message.library);response={type:'cast_result',data:window.lm.library}};if(response)for(const fn of listeners)fn({...response,requestId:message.requestId})})}};
    window.workspace=new api.StudioCastWorkspace(ctx,document.querySelector('#host'),()=>[],()=>{},()=>{});
  }''')
  await page.locator('.cast-card').first.wait_for()
  await page.locator('.cast-card').first.click()
  await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click()
  await page.locator('[data-cast-action=open-presentation-modal]').click()
  await page.locator('#ss-cast-dialog').wait_for(state='visible')
  assert await page.locator('#ss-cast-dialog .cast-preset-choice').count()==52
  await page.locator('#ss-cast-dialog [data-cast-action=presentation-filter][data-group=face]').click()
  assert await page.locator('#ss-cast-dialog .cast-preset-choice').count()==4
  await page.locator('#ss-cast-dialog [data-style=editorial-square]').click()
  await page.wait_for_function("window.lm.library.members.find(m=>m.id==='shoto').presentation==='editorial-square'")
  assert await page.locator('.preview-stage [data-cast-preset=editorial-square]').count()==1
  assert await page.locator('#ss-cast-dialog').is_visible()
  await page.locator('#ss-cast-dialog [data-cast-action=presentation-filter][data-group=standee]').click()
  assert await page.locator('#ss-cast-dialog .cast-preset-choice').count()==4
  await page.locator('#ss-cast-dialog [data-style=moonlit-halo]').click()
  await page.wait_for_function("window.lm.library.members.find(m=>m.id==='shoto').presentation==='moonlit-halo'")
  assert await page.locator('.preview-stage [data-cast-preset=moonlit-halo]').count()==1
  # Simulated small-screen preview; opening the modal must retain a valid visible viewport.
  await page.set_viewport_size({'width':390,'height':800})
  bounds=await page.locator('#ss-cast-dialog').evaluate('e=>({width:e.clientWidth,scroll:e.scrollWidth,visible:getComputedStyle(e).display!=="none"})')
  assert bounds['scroll']<=bounds['width']+2,bounds
  await page.set_viewport_size({'width':1240,'height':950})
  await page.locator('#ss-cast-dialog [data-cast-action=presentation-filter][data-group=all]').click()
  await page.screenshot(path=str(ROOT/'docs/screenshots/cast-preset-picker-preview.png'))
  print('PASS: modal, composition filters, save to storage, live preview, mobile bounds')
  assert not errors,errors
  await browser.close()

if __name__=='__main__':asyncio.run(main())
