"""Layout sanity for side overrides at narrow/mobile viewport widths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0]+'\nwindow.t={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,CAST_PRESENTATION_ENTRIES,cleanCastLibrary,renderCastTags};'
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1200,'height':870});page.set_content('<div id="stage" style="background:#101017;overflow:visible;color:#eee"></div>');page.add_script_tag(content=code)
 result=page.evaluate('''()=>{
 const t=window.t,s=document.createElement('style');s.textContent=t.CAST_PRESENTATION_CSS+'\\n'+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(s);
 const errors=[];
 for(const width of [320,430,780])for(const preset of t.CAST_PRESENTATION_ENTRIES)for(const side of ['left','right']){
  const stage=document.querySelector('#stage');stage.style.width=width+'px';stage.innerHTML='';
  const l=t.cleanCastLibrary({groups:[{id:'crew',name:'Crew'}],activeGroupId:'crew',members:[{id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',presentation:preset.id,images:{neutral:{id:'shoto'}} ,presentationSide:side}]});
  stage.innerHTML=t.renderCastTags('<swarm-cast=Shoto-neutral>"My office did not request the overlap. Yours signed off on the corridor audit last Tuesday. This is a long quote to check wrapping."</swarm-cast>',l,text=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const design=stage.querySelector('.ss-cast-design'),quote=stage.querySelector('[data-swarm-cast-dialogue]');
  if(!quote||!design){errors.push([width,preset.id,side,'no quote']);continue}
  const r=quote.getBoundingClientRect(),s=stage.getBoundingClientRect();
  if(!quote.textContent.includes('corridor audit'))errors.push([width,preset.id,side,'lost quote']);
  if((r.right>s.right+10||r.left<s.left-10) && preset.composition!=='standee')errors.push([width,preset.id,side,'quote outside',r.left-s.left,r.right-s.right]);
 }
 return errors;
}''')
 print('side/mobile anomalies:',len(result));print('\n'.join(map(str,result[:30])))
 b.close()
