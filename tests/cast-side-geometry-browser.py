"""Compare actual artwork/quote geometry for auto/left/right on named presets."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0]+ '\nwindow.testApi={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,CAST_PRESENTATION_ENTRIES,cleanCastLibrary,renderCastTags};'
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1250,'height':850});page.set_content('<div id="stage"></div>');page.add_script_tag(content=code)
 rows=page.evaluate('''()=>{
  const t=testApi,s=document.createElement('style');s.textContent=t.CAST_PRESENTATION_CSS+'\\n'+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(s);
  const results=[];
  for(const ent of t.CAST_PRESENTATION_ENTRIES){
    const entry={id:ent.id,composition:ent.composition};
    for(const side of ['auto','left','right']){
      const lib=t.cleanCastLibrary({groups:[{id:'one',name:'A'}],activeGroupId:'one',members:[{id:'p',groupId:'one',prefix:'Shoto',name:'Shoto',presentation:ent.id,presentationSide:side,images:{neutral:{id:'image'}}}]});
      const doc=document.querySelector('#stage');doc.innerHTML=t.renderCastTags('<swarm-cast=Shoto-neutral>"This is an example of a moderately long quote, and it should wrap correctly."</swarm-cast>',lib,text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
      const image=doc.querySelector('[data-cast-asset]'),quote=doc.querySelector('[data-swarm-cast-dialogue]');
      if(!image||!quote){entry[side]='missing';continue}
      const a=image.getBoundingClientRect(),q=quote.getBoundingClientRect();
      const dx=(a.left+a.width/2)-(q.left+q.width/2);
      entry[side]=dx>20?'R':dx< -20?'L':'overlap';
    }
    results.push(entry);
  }
  return results;
}''')
 for r in rows:print(r['id'].ljust(24),r['auto'],r['left'],r['right'],r['composition'])
 b.close()
