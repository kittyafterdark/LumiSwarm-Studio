"""Render every named look using the real generated renderer and shared fixture.
Use --baseline DIST_FRONTEND_JS to compare with the previous release.
The gallery contact sheets are generated from the same DOM as the chat cards.
"""
import argparse,base64,json,re
from pathlib import Path
from PIL import Image,ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'test-results'; OUT.mkdir(exist_ok=True)
ART='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()
WORLD=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text('utf8'))[1])
QUOTE='“He said the camera could not see us from here, but he never checked the east stairwell.”'
CHANGED={'afterglow-cinema','rainbound-platform','memory-filmstrip','postcard-original','afterglow-letterbox','postcard-rebellion','comic-establishing-redux','vn-hero'}

def setup(browser, source):
    page=browser.new_page(viewport={'width':1160,'height':900},device_scale_factor=1)
    page.route('**/api/v1/images/world1',lambda route:route.fulfill(content_type='image/jpeg',body=WORLD))
    page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#eee;font:14px system-ui"><main id="sheet"></main></body></html>')
    page.add_script_tag(content=source.read_text().rsplit('export {',1)[0].replace('export function ','function ')+'''\nwindow.t={CAST_PRESENTATION_ENTRIES,CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,castPresentationTemplate};''')
    page.evaluate('''()=>{let s=document.createElement('style');s.textContent=t.CAST_PRESENTATION_CSS+'\\n'+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(s);window.make=(e,art,quote,color,side='auto',world=true)=>t.castPresentationTemplate(e.id,{key:'shoto-amusement',src:art,name:'Shōto Todoroki',label:'amusement',dialogue:quote,color,side,background:world?{id:'world1',name:'Evening walkway'}:undefined,crop:{enabled:false,x:50,y:20,zoom:1}},s=>s)}''')
    return page

def render(page,entry,color,world=True):
    page.evaluate('''async ({entry,art,quote,color,world})=>{const sheet=document.querySelector('#sheet');sheet.innerHTML=`<div style="width:540px;display:flow-root">${make(entry,art,quote,color,'auto',world)}</div>`;await Promise.all([...sheet.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));}''',dict(entry=entry,art=ART,quote=QUOTE,color=color,world=world))
    return page.locator('#sheet>div').screenshot(animations='disabled')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--baseline',type=Path);args=parser.parse_args()
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=setup(browser,ROOT/'dist/frontend.js'); before=setup(browser,args.baseline) if args.baseline else None
        entries=page.evaluate('t.CAST_PRESENTATION_ENTRIES.map(({id,name,composition,origin})=>({id,name,composition,origin}))')
        assert len(entries)==50
        # Check that each scene has a separate speaker and expression slot and
        # a unique metadata treatment, not just a different background.
        signatures=page.evaluate("""async ({art,quote})=>{let rows=[];for(const e of t.CAST_PRESENTATION_ENTRIES.filter(e=>e.composition==='scene')){const sheet=document.querySelector('#sheet');sheet.innerHTML=`<div style="width:540px">${make(e,art,quote,'#72B9FF')}</div>`;const name=sheet.querySelector('.scene-speaker,.vn-name>span'),expr=sheet.querySelector('.scene-expression,.vn-name small');if(!name||!expr||name===expr||!name.textContent.includes('Shōto')||expr.textContent!=='amusement')throw Error('Missing metadata: '+e.id);const sample=el=>{const c=getComputedStyle(el);return [c.fontFamily,c.fontSize,c.fontStyle,c.fontWeight,c.textTransform,c.letterSpacing,c.borderTopStyle,c.borderBottomStyle,c.backgroundColor,c.transform]};rows.push([e.id,JSON.stringify([sample(name),sample(expr)])])}return rows}""",dict(art=ART,quote=QUOTE))
        assert len(signatures)==8 and len({row[1] for row in signatures})==8,signatures
        result=[]
        for e in entries:
            row=dict(e)
            if before:
                for color in ('','#72B9FF','#221122'):
                    import io
                    a=Image.open(io.BytesIO(render(before,e,color))).convert('RGB');b=Image.open(io.BytesIO(render(page,e,color))).convert('RGB')
                    same=a.size==b.size and ImageChops.difference(a,b).getbbox() is None
                    row['unchanged_'+(color or 'auto')]=same
            result.append(row)
        for family in sorted(set(e['composition'] for e in entries)):
            page.evaluate('''async ({family,art,quote})=>{const entries=t.CAST_PRESENTATION_ENTRIES.filter(e=>e.composition===family);document.querySelector('#sheet').innerHTML=`<h1 style="font:600 24px system-ui;margin:20px">${family} · real renderer</h1><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:16px;align-items:start">${entries.map(e=>`<section style="min-width:0;border:1px solid #49434e;background:#141218;padding:12px"><h2 style="font:600 16px system-ui;margin:0 0 8px">${e.name}</h2>${make(e,art,quote,'#72B9FF')}</section>`).join('')}</div>`;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));}''',dict(family=family,art=ART,quote=QUOTE))
            page.screenshot(path=str(OUT/f'design-audit-{family}.png'),full_page=True,animations='disabled')
        if before:
            unexpected=[r for r in result if r['id'] not in CHANGED and not all(v for k,v in r.items() if k.startswith('unchanged_'))]
            assert not unexpected,unexpected
        (OUT/'design-audit.json').write_text(json.dumps(result,indent=2,ensure_ascii=False))
        print(f'50 named looks rendered across eight families; {len(CHANGED)} scene looks in the approved change scope.')
        browser.close()
if __name__=='__main__':main()
