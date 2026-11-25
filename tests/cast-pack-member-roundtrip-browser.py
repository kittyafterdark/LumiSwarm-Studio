"""Regression: imported filename keys remain addressable after Cast reload.

Reproduces the original undefined.id failure when a human label was re-keyed.
Also runs the actual Cast member -> Expression Studio -> import -> save ->
reopen flow with a minimally viable in-memory backend and image upload API.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
ART = (ROOT/'tests/fixtures/cast-portrait.png').read_bytes()

async def setup(page, source):
    await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body>
    <div class="ss-shell"><div id="host" class="ss-cast-workspace"></div></div></body></html>''')
    await page.evaluate('''async source => {
      const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
      window.api=await import(url);URL.revokeObjectURL(url);
      const initial=api.cleanCastLibrary({groups:[{id:'crew',name:'Crew'}],activeGroupId:'crew',members:[
        {id:'mina',groupId:'crew',name:'Mina Ashido',prefix:'Mina',images:{'01_happy_smile':{id:'mina-1'},'02_gasping':{id:'mina-2'}}},
        {id:'katsuki',groupId:'crew',name:'Katsuki Bakugo',prefix:'Katsuki',images:{}}
      ]});
      window.host={saved:structuredClone(initial), callbacks:new Set(), saves:0, uploads:0, failedSaves:false};
      function emit(data){for(const fn of host.callbacks)fn(data)}
      const ctx={onBackendMessage(fn){host.callbacks.add(fn);return()=>host.callbacks.delete(fn)},
        sendToBackend(message){queueMicrotask(()=>{
          if(message.type==='load_cast_library') emit({type:'cast_result',requestId:message.requestId,data:{...host.saved,chatId:'test-chat',characterId:''}});
          else if(message.type==='save_cast_library') {
            if(host.failedSaves) emit({type:'studio_error',requestId:message.requestId,error:'Simulated storage failure'});
            else {host.saved=api.cleanCastLibrary(message.library);host.saves++;emit({type:'cast_result',requestId:message.requestId,data:host.saved})}
          }
        })}
      };
      window.fetch=async (url,options)=>{
        if(String(url)==='/api/v1/images'&&options?.method==='POST'){
          host.uploads++;
          return new Response(JSON.stringify({id:'uploaded-'+host.uploads}),{status:200,headers:{'content-type':'application/json'}});
        }
        return new Response('{}',{status:200,headers:{'content-type':'application/json'}});
      };
      const shell=document.querySelector('.ss-shell');
      const open=opts=>api.openCharacterExpressions(shell, {
        folder:{id:'cast:'+opts.member.id,name:opts.member.name,imageIds:[],binding:null},
        family:'',model:'',workflows:[],inheritedRecipe:{},samplers:[],schedulers:[],deleteDrafts:false,
        cast:opts,pickImage:()=>{},request:async type=>type==='load_expression_bank'?[]:{},refresh:()=>{}
      });
      window.workspace=new api.StudioCastWorkspace(ctx,document.querySelector('#host'),()=>[],open,()=>{});
    }''', source)

async def main():
    previous=ROOT.parent/'cast_islands_r32_work/dist/frontend.js'
    old=previous.read_text('utf8') if previous.is_file() else None
    now=(ROOT/'dist/frontend.js').read_text('utf8')
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        try:
            # The old full build is optional: in a distributed extension ZIP,
            # there is deliberately no second (obsolete) runtime alongside it.
            if (ROOT.parent/'cast_islands_r32_work/dist/frontend.js').is_file():
                page=await browser.new_page(viewport={'width':1180,'height':820})
                errors=[]
                page.on('pageerror',lambda error:errors.append(str(error)))
                await setup(page,old)
                await page.locator('.cast-card').first.wait_for()
                await page.locator('.cast-card').first.click()
                await page.wait_for_timeout(120)
                html=await page.locator('#host').inner_text()
                assert any("reading 'id'" in e for e in errors) or "reading 'id'" in html,f'Old renderer must reproduce crash: {errors}'
                print('RED: v1.0.31 crashes on underscore filenames')
                await page.close()

            page=await browser.new_page(viewport={'width':1180,'height':820})
            page.set_default_timeout(4000)
            errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            await setup(page,now)
            await page.locator('.cast-card').first.wait_for()
            await page.locator('.cast-card').first.click()
            await page.locator('.member-button[data-id=mina]').click()
            await page.locator('.expression-grid .expression-tile img').first.wait_for(state='attached')
            assert await page.locator('.expression-grid .expression-tile').count()==2
            attrs=await page.locator('.expression-grid img').evaluate_all('nodes=>nodes.map(n=>n.getAttribute("src"))')
            assert attrs==['/api/v1/images/mina-1','/api/v1/images/mina-2'],attrs
            await page.locator('[data-cast-action=expressions]').click()
            await page.locator('.ss-expression-dialog').wait_for()
            await page.locator('.ss-expression-header button').first.click()
            await page.locator('.ss-expression-dialog').wait_for(state='detached')
            await page.locator('.member-button[data-id=katsuki]').click()
            await page.locator('[data-cast-action=expressions]').last.click()
            await page.locator('button[data-expression-focus=import-pack]').wait_for()
            async with page.expect_file_chooser() as chooser:
                await page.locator('button[data-expression-focus=import-pack]').click()
            await (await chooser.value).set_files([
              {'name':'01_stern_neutral.png','mimeType':'image/png','buffer':ART},
              {'name':'02_cocky_grin.png','mimeType':'image/png','buffer':ART},
            ])
            await page.wait_for_function('document.querySelector(".ss-expression-footer")?.textContent?.includes("2 attached")',timeout=15000)
            saved=await page.evaluate('({images:host.saved.members.find(m=>m.id==="katsuki").images,saves:host.saves,uploads:host.uploads})')
            assert set(saved['images'])=={'01_stern_neutral','02_cocky_grin'},saved
            assert saved['saves']>=1 and saved['uploads']==2,saved
            await page.locator('.ss-expression-header button').first.click()
            await page.locator('.ss-expression-dialog').wait_for(state='detached')
            assert await page.locator('.expression-grid img').count()==2
            # Re-open without changing the member state.
            await page.locator('[data-cast-action=expressions]').click()
            await page.locator('.ss-expression-dialog').wait_for()
            assert await page.locator('.ss-expression-card').count()>=2
            # A successful file upload is not a successful Cast assignment.
            await page.evaluate('host.failedSaves=true')
            async with page.expect_file_chooser() as chooser:
                await page.locator('button[data-expression-focus=import-pack]').click()
            await (await chooser.value).set_files({'name':'03_angry_shout.png','mimeType':'image/png','buffer':ART})
            await page.wait_for_function('document.querySelector(".ss-expression-footer")?.textContent?.includes("NOT attached")',timeout=12000)
            failed=await page.evaluate('({saved:host.saved.members.find(m=>m.id==="katsuki").images,footer:document.querySelector(".ss-expression-footer").textContent})')
            assert '03_angry_shout' not in failed['saved'],failed
            assert 'NOT attached' in failed['footer'],failed
            # The generated asset stays in the local edit session so closing
            # after backend recovery retries assignment without re-upload.
            await page.evaluate('host.failedSaves=false')
            await page.locator('.ss-expression-header button').first.click()
            await page.locator('.ss-expression-dialog').wait_for(state='detached')
            await page.wait_for_function('Boolean(host.saved.members.find(m=>m.id==="katsuki").images["03_angry_shout"])')
            assert not errors,errors
            print('GREEN: Mina opens, Katsuki pack persists/reopens; failed save never claims attachment and retries safely')
            await page.close()
        finally:await browser.close()

if __name__=='__main__':asyncio.run(main())
