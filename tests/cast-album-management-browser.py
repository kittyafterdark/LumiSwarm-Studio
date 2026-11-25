"""Real Chromium contract: Cast album edits, card avatars, gallery sides.

Run: python tests/cast-album-management-browser.py
Uses a minimal Lumiverse backend and the actual compiled frontend, without a
live server. A failing avatar deliberately exercises the fallback.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8')
CSS=(ROOT/'src/studio/styles.ts').read_text('utf8').split('const STYLES = `',1)[1].split('\n`\n\nconst STUDIO_V3_STYLES',1)[0]

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  try:
   page=await browser.new_page(viewport={'width':1120,'height':860})
   await page.route('**/avatar?size=sm', lambda route: route.fulfill(status=404, body=''))
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body>
   <div class="ss-shell" style="height:900px"><div class="ss-cast-workspace" id="test-cast" style="display:block;width:900px;height:840px;overflow:auto"></div></div></body></html>''')
   await page.add_style_tag(content=CSS)
   await page.evaluate('''async source=>{
    const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    window.api=await import(url);URL.revokeObjectURL(url);
    const style=document.createElement('style');style.textContent=api.CAST_PRESENTATION_CSS;document.head.append(style);
    window.mock={saved:api.cleanCastLibrary({groups:[{id:'crew',name:'Crew',defaultPresentation:'chapter-tab'}],activeGroupId:'crew',members:[
      {id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',images:{'01_stern_neutral':{id:'portrait-1'},'soft_smile':{id:'portrait-2'}},defaultExpression:'01_stern_neutral',presentation:'editorial-square',presentationSide:'auto',settings:{slots:[],selected:[]}},
      {id:'mina',groupId:'crew',name:'Mina',prefix:'Mina',images:{joy:{id:'mina-joy'}},defaultExpression:'joy'}
    ]}),listeners:new Set(),saves:0,requests:[]};
    const emit=payload=>{for(const fn of mock.listeners)fn(payload)};
    window.fetch=async(url)=>{
      mock.requests.push(String(url));
      if(String(url).includes('avatar?size=sm'))return new Response('',{status:404});
      if(String(url).includes('/characters/summary'))return new Response(JSON.stringify({data:[{id:'nora',name:'Nora Vale'},{id:'kai',name:'Kai Cole'}],total:2}),{status:200,headers:{'content-type':'application/json'}});
      if(String(url)==='/api/v1/characters/nora')return new Response(JSON.stringify({id:'nora',name:'Nora Vale'}),{status:200,headers:{'content-type':'application/json'}});
      if(String(url)==='/api/v1/characters/nora/expressions')return new Response(JSON.stringify({mappings:{joy:'nora-joy'}}),{status:200,headers:{'content-type':'application/json'}});
      if(String(url)==='/api/v1/characters/nora/expressions/groups')return new Response(JSON.stringify({}),{status:200,headers:{'content-type':'application/json'}});
      return new Response('{}',{status:200,headers:{'content-type':'application/json'}});
    };
    const ctx={onBackendMessage(fn){mock.listeners.add(fn);return()=>mock.listeners.delete(fn)},sendToBackend(data){queueMicrotask(()=>{
      if(data.type==='load_cast_library')emit({type:'cast_result',requestId:data.requestId,data:{...mock.saved,chatId:'chat1',characterId:''}});
      else if(data.type==='remove_cast_member'){
        mock.saved.members=mock.saved.members.filter(m=>m.id!==data.memberId);mock.saves++;
        emit({type:'cast_result',requestId:data.requestId,data:{library:mock.saved}});
      }
      else if(data.type==='save_cast_library'){
        mock.saved=api.cleanCastLibrary(data.library);mock.saves++;
        emit({type:'cast_result',requestId:data.requestId,data:mock.saved});
      }
    })}};
    window.mock.ctx=ctx;
    window.workspace=new api.StudioCastWorkspace(ctx,document.querySelector('#test-cast'),()=>[],()=>{},()=>{});
   }''',JS)
   page.set_default_timeout(7000)
   await page.locator('.cast-card[data-id=crew]').click()
   await page.locator('[data-cast-action=member][data-id=shoto]').click()
   assert await page.locator('.expression-tile').count()==2
   assert await page.locator('[data-cast-action=rename-expression]').count()==2
   # Mutate exact stored key, never the filename key's human display spelling.
   await page.locator('[data-cast-action=rename-expression][data-expression="01_stern_neutral"]').click()
   await page.locator('#ss-cast-expression-rename-form [name=expression]').fill('01_sunlit_smile')
   await page.locator('[form=ss-cast-expression-rename-form]').click()
   await page.wait_for_function("Boolean(mock.saved.members.find(m=>m.id==='shoto').images['01_sunlit_smile'])")
   result=await page.evaluate('''()=>{const m=mock.saved.members.find(m=>m.id==='shoto');return {images:m.images,defaultExpression:m.defaultExpression}}''')
   assert list(result['images'])==['01_sunlit_smile','soft_smile'],result
   assert result['images']['01_sunlit_smile']['id']=='portrait-1',result
   assert result['defaultExpression']=='01_sunlit_smile',result
   # Duplicate name must fail before any write.
   before=await page.evaluate('mock.saves')
   await page.locator('[data-cast-action=rename-expression][data-expression=soft_smile]').click()
   await page.locator('#ss-cast-expression-rename-form [name=expression]').fill('01_sunlit_smile')
   await page.locator('[form=ss-cast-expression-rename-form]').click()
   await page.locator('[data-cast-error]').wait_for()
   assert await page.evaluate('mock.saves')==before
   await page.locator('#ss-cast-dialog .dialog-header [data-cast-action=close-dialog]').click()
   # Remove the fallback, select another valid saved expression, keep the image asset.
   await page.locator('[data-cast-action=remove-expression][data-expression="01_sunlit_smile"]').click()
   await page.locator('[data-cast-action=confirm-remove-expression]').click()
   await page.wait_for_function("mock.saved.members.find(m=>m.id==='shoto').defaultExpression==='soft_smile'")
   result=await page.evaluate('''()=>{const m=mock.saved.members.find(m=>m.id==='shoto');return {images:m.images,defaultExpression:m.defaultExpression}}''')
   assert list(result['images'])==['soft_smile'] and result['defaultExpression']=='soft_smile',result
   assert await page.locator('#ss-cast-preview-expression').input_value()=='soft_smile'
   assert await page.locator('[data-cast-action=remove-member]').count()==0 # Identity tab owns whole-member deletion.
   # Full wardrobe gallery responds immediately, all 50 assets share member direction.
   await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click()
   await page.locator('[data-cast-action=open-presentation-modal]').click()
   modal=page.locator('#ss-cast-dialog')
   assert await modal.locator('.cast-preset-choice').count()==52
   for side in ['right','left','auto']:
    await modal.locator(f'.cast-gallery-stage [data-cast-action=presentation-side][data-side={side}]').click()
    assert await modal.locator('.ss-cast-design').count()>25
    bad=await modal.locator('.ss-cast-design').evaluate_all('(nodes,side)=>nodes.filter(n=>n.dataset.castSide!==side).length',side)
    assert not bad,(side,bad)
    await page.wait_for_function('(side)=>mock.saved.members.find(m=>m.id==="shoto").presentationSide===side',arg=side)
   await modal.locator('[data-cast-action=presentation-filter][data-group=face]').click()
   assert await modal.locator('.cast-preset-choice').count()>=2
   await modal.locator('.cast-gallery-stage [data-side=right]').click()
   assert await modal.locator('.ss-cast-design[data-cast-side=right]').count()>=2
   await modal.locator('.dialog-header [data-cast-action=close-dialog]').click()
   await page.locator('[data-cast-action=open-presentation-modal]').click()
   assert await modal.locator('.cast-gallery-stage [data-side=right]').get_attribute('aria-pressed')=='true'
   await modal.locator('.dialog-header [data-cast-action=close-dialog]').click()
   # Character imports use the host avatar endpoint and gracefully fall back to initials.
   await page.locator('[data-cast-action=new-member]').click()
   await modal.locator('[data-cast-action=import-character]').click()
   await page.locator('.character-choice').first.wait_for()
   assert await page.locator('.character-choice').count()==2
   assert await page.locator('.character-choice img[src="/api/v1/characters/nora/avatar?size=sm"]').count()==1
   await page.wait_for_function('document.querySelectorAll(".character-choice img[hidden]").length===2')
   assert await page.locator('.character-choice .cast-character-avatar-initial').all_text_contents()==['N','K']
   await page.locator('.character-choice').first.click()
   await page.locator('[data-cast-action=apply-character]').click()
   assert await modal.locator('#ss-cast-member-form [name=name]').input_value()=='Nora Vale'
   await modal.locator('[form=ss-cast-member-form]').click()
   await page.wait_for_function('mock.saved.members.some(m=>m.sourceCharacterId==="nora"&&m.images.joy?.id==="nora-joy")')
   # Whole-member deletion already exists under Identity and doesn't delete
   # the original character or its uploaded image bytes.
   await page.locator('[data-cast-action=member-tab][data-tab=identity]').click()
   assert await page.locator('[data-cast-action=remove-member]').count()==1
   await page.locator('[data-cast-action=remove-member]').click()
   await modal.locator('[data-cast-action=confirm-remove]').click()
   await page.wait_for_function('!mock.saved.members.some(m=>m.sourceCharacterId==="nora")')
   assert not any('DELETE' in request for request in await page.evaluate('mock.requests'))
   # Removing the only expression must give the member a harmless empty album.
   await page.locator('[data-cast-action=member][data-id=mina]').click()
   await page.locator('[data-cast-action=remove-expression][data-expression=joy]').click()
   await modal.locator('[data-cast-action=confirm-remove-expression]').click()
   await page.wait_for_function('Object.keys(mock.saved.members.find(m=>m.id==="mina").images).length===0')
   assert await page.locator('.empty-set').count()==1
   # Recreate the workspace from persisted storage, not its in-memory state.
   await page.evaluate('''() => {
     workspace.dispose();
     workspace = new api.StudioCastWorkspace(mock.ctx,document.querySelector('#test-cast'),()=>[],()=>{},()=>{});
   }''')
   await page.locator('.cast-card[data-id=crew]').click()
   await page.locator('[data-cast-action=member][data-id=shoto]').click()
   assert await page.locator('[data-cast-action=rename-expression]').count()==1
   assert await page.locator('.expression-tile img[src$="portrait-2"]').count()==1
   await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click()
   await page.locator('[data-cast-action=open-presentation-modal]').click()
   assert await page.locator('.cast-gallery-stage [data-side=right]').get_attribute('aria-pressed')=='true'
   assert not errors,errors
   print('CAST ALBUM MANAGEMENT BROWSER PASS: key rename, duplicate rejection, deletion/fallback including empty sets, 52 side-responsive previews, avatar fallback, card import and whole-member removal')
  finally:await browser.close()

if __name__=='__main__':asyncio.run(main())
