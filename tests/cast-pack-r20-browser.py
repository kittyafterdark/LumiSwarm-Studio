"""Cast external expression pack import: stored/deflated ZIPs, add-only, persistence.
Run: python tests/cast-pack-r20-browser.py
"""
import asyncio, io, json, zipfile
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text(encoding='utf8')
PNG=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()

def pack(compression):
 buf=io.BytesIO()
 with zipfile.ZipFile(buf,'w',compression=compression) as z:
  z.writestr('Shoto-neutral.png',PNG)
  z.writestr('Shoto-amusement.png',PNG)
  z.writestr('Shoto-joy.png',PNG)
  z.writestr('ignore/readme.txt',b'hi')
 return buf.getvalue()

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  try:
   page=await browser.new_page()
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body></body></html>')
   await page.evaluate('''async source=>{
     const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
     window.api=await import(url);URL.revokeObjectURL(url);
     window.imports=[];window.saves=[];
     const lib=api.cleanCastLibrary({groups:[{id:'crew',name:'Crew'}],activeGroupId:'crew',members:[{id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',images:{joy:{id:'existing-joy'}}}]});
     window.member=lib.members[0];
     const root=document.createElement('main');document.body.append(root);
     api.openCharacterExpressions(root,{folder:{id:'crew',name:'Shoto'},family:'',model:'',workflows:[],inheritedRecipe:{},samplers:[],schedulers:[],deleteDrafts:false,
       cast:{member,save:async data=>{window.saves.push(structuredClone(data)); Object.assign(window.member,structuredClone(data))},publish:async()=>{}},
       pickImage:()=>{},request:async(type)=>type==='load_expression_bank'?[]:{},refresh:()=>{}});
     window.fetch=async(request,options)=>{if(String(request).startsWith('/api/v1/images')&&options?.method==='POST'){
        window.imports.push({name:options.body.get('image').name,type:options.body.get('image').type});
        return new Response(JSON.stringify({id:'upload-'+window.imports.length}),{status:200,headers:{'content-type':'application/json'}});
       }return new Response('{}',{status:200,headers:{'content-type':'application/json'}})};
   }''',JS)
   await page.locator('button[data-expression-focus=import-pack]').wait_for(timeout=8000)
   for compressed in [zipfile.ZIP_STORED,zipfile.ZIP_DEFLATED]:
    before=await page.evaluate('imports.length')
    async with page.expect_file_chooser() as chooser:
     await page.locator('button[data-expression-focus=import-pack]').click()
    await (await chooser.value).set_files({'name':'pack.zip','mimeType':'application/zip','buffer':pack(compressed)})
    await page.wait_for_function('document.querySelector(".ss-expression-footer")?.textContent?.includes("Pack import")',timeout=10000)
    info=await page.evaluate('''()=>({images:window.member.images,imports:window.imports,saves:window.saves.length,footer:document.querySelector('.ss-expression-footer').textContent})''')
    if compressed==zipfile.ZIP_STORED:
     assert len(info['imports'])==2,info
     assert 'neutral' in info['images'] and 'amusement' in info['images'] and info['images']['joy']['id']=='existing-joy',info
     assert info['saves']>0,info
    else:assert len(info['imports'])==before,('duplicate labels were overwritten',info)
   # Loose image batches are the same import action as ZIP packs.
   async with page.expect_file_chooser() as chooser:
    await page.locator('button[data-expression-focus=import-pack]').click()
   await (await chooser.value).set_files([
     {'name':'Shoto-suspicion.png','mimeType':'image/png','buffer':PNG},
     {'name':'Shoto-joy.png','mimeType':'image/png','buffer':PNG},
   ])
   await page.wait_for_function('window.member.images.suspicion?.id')
   assert await page.evaluate('member.images.joy.id')=='existing-joy'
   assert not errors,errors
   print('PASS: ZIP stored + deflate, loose image batch, existing labels skipped, new expressions uploaded and saved to member')
   await page.close()
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
