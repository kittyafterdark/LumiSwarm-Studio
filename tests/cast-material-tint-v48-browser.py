"""Cast Material tint audit: speaker-specific contrast and actual gallery visuals.

All 12 material designs must be visually distinct but keep their trusted caption
readable, even at small widths and with a long quote. No server dependency.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, json
ROOT = Path(__file__).resolve().parents[1]
FRONTEND = (ROOT/'dist/frontend.js').read_text('utf-8').rsplit('export {',1)[0]
API = FRONTEND + '\nwindow.__material={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,CAST_PRESENTATION_ENTRIES,castPresentationTemplate};'
ART = 'data:image/png;base64,' + base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode('ascii')
STYLES = ['tech-messenger','agency-lanyard','cyber-comms','retro-rpg','gothic-folio','mecha-hud','terminal-console','cinematic-bleed']
SPEAKERS = [('Mina','#ed7ca8'),('Shoto','#599ce3'),('Katsuki','#ffae35')]

def relative_luminance(rgb):
    linear = [c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4 for c in (v/255 for v in rgb)]
    return sum(v*w for v,w in zip(linear,(.2126,.7152,.0722)))

def contrast(a,b):
    x,y = sorted((relative_luminance(a), relative_luminance(b)),reverse=True)
    return (x+.05)/(y+.05)

with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1536,'height':860},device_scale_factor=1)
    page.set_content('''<!doctype html><html><body style="margin:0;background:#0b090f;color:#e9e3ec;font:12px system-ui"><main id="root"></main></body></html>''')
    failures=[]
    page.on('pageerror', lambda err:failures.append(str(err)))
    page.add_script_tag(content=API)
    page.evaluate('''()=>{const s=document.createElement('style');s.textContent=window.__material.CAST_PRESENTATION_CSS+'\\n'+window.__material.CAST_PRESENTATION_SIDE_CSS;document.head.append(s)}''')
    tests=[]
    for width in (760,320):
        for key in STYLES:
            for name,voice in SPEAKERS:
                r=page.evaluate('''({width,key,name,voice,art})=>{
                  const a=window.__material;
                  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
                  const words='There are three possible routes under the old overpass, and we should check the cameras before making a choice. ';
                  const quote='“'+(width===320?words.repeat(4):words)+'”';
                  document.querySelector('#root').innerHTML=`<section style="width:${width}px;max-width:100%;padding:8px;box-sizing:border-box"><p>Before the panel</p>${a.castPresentationTemplate(key,{key:name+'-neutral',name,label:'neutral',src:art,color:voice,dialogue:esc(quote),side:'auto',crop:{enabled:false,x:50,y:20,zoom:1}},esc)}<p id="after">After the panel</p></section>`;
                  const lane=document.querySelector('#root section'),root=lane.querySelector('.ss-cast-design'),container=root.querySelector('.ss-cast-preset-inner').firstElementChild;
                  const quoteEl=root.querySelector('[data-swarm-cast-dialogue]');
                  const colorCanvas=document.createElement('canvas');colorCanvas.width=colorCanvas.height=1;const ctx=colorCanvas.getContext('2d');
                  const rgba=css=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=css;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data].slice(0,3)};
                  const sample=name=>{const x=document.createElement('b');x.style.position='absolute';x.style.visibility='hidden';x.style.backgroundColor=`var(${name})`;container.append(x);const val=getComputedStyle(x).backgroundColor;const rgb=rgba(val);x.remove();return rgb};
                  const special=key==='agency-lanyard'||key==='gothic-folio';
                  const light=sample(special?'--m-quote-top':'--m-surface-top');
                  const dark=sample(special?'--m-quote-bottom':'--m-surface-bottom');
                  const voiceRgb=rgba(voice);
                  const rect=quoteEl.getBoundingClientRect(),rootRect=root.getBoundingClientRect(),after=lane.querySelector('#after').getBoundingClientRect();
                  return {width,key,name,voice,voiceRgb,light,dark,quoteColor:getComputedStyle(quoteEl).color,
                   quotes:root.querySelectorAll('[data-swarm-cast-dialogue]').length,images:root.querySelectorAll('[data-cast-asset]').length,
                   overflow:lane.scrollWidth>lane.clientWidth+2,visible:rect.height>7&&rect.width>30,
                   clipping:rect.left<rootRect.left-2||rect.right>rootRect.right+2||rect.bottom>rootRect.bottom+6,
                   after:after.top>=rootRect.bottom-2};
                }''', dict(width=width,key=key,name=name,voice=voice,art=ART))
                r['contrast_top']=round(contrast(r['voiceRgb'],r['light']),2)
                r['contrast_bottom']=round(contrast(r['voiceRgb'],r['dark']),2)
                tests.append(r)
    issues=[r for r in tests if min(r['contrast_top'],r['contrast_bottom'])<4.5 or r['quotes']!=1 or r['images']!=1 or r['overflow'] or r['clipping'] or not r['visible'] or not r['after']]
    assert not issues, 'Contrast or geometry failures: '+json.dumps(issues[:10],indent=2)
    assert len(tests)==48
    for key in STYLES:
        colors=[r['light'] for r in tests if r['width']==760 and r['key']==key]
        # A neutral foundation with *some* speaker response on every design.
        dist=sum(abs(x-y) for x,y in zip(colors[0],colors[1]))
        assert dist>=5,(key,dist,colors)
    # Physical media should retain characteristic light/dark surfaces.
    for key in ('agency-lanyard','gothic-folio'):
        assert all(relative_luminance(r['light'])<.13 for r in tests if r['key']==key)
    # Material colors are defined locally per preset. No late generic rail rules.
    css=(ROOT/'scripts/cast-material-redesign.css').read_text('utf-8')
    for key in STYLES:
        cls={'vn-hero':'r-vn-hero','corner-popout':'r-popout','angled-cutout':'r-angle','vn-standee':'r-standee','tech-messenger':'r-messenger','agency-lanyard':'r-badge','cyber-comms':'r-comms','retro-rpg':'r-rpg','gothic-folio':'r-folio','mecha-hud':'r-mecha','terminal-console':'r-terminal','cinematic-bleed':'r-cinema'}[key]
        fragment=css.split('.ss-cast-design .'+cls+'{',1)[1].split('}',1)[0]
        assert '--m-surface-top:' in fragment and '--m-surface-bottom:' in fragment, cls
    # Screenshot of each style under three voices at its real native stage width.
    page.set_viewport_size({'width':1510,'height':850})
    page.evaluate('''({styles,speakers,art})=>{
      const a=window.__material,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const labels=styles.map(k=>a.CAST_PRESENTATION_ENTRIES.find(x=>x.id===k).name);
      const cases=styles.map((key,index)=>speakers.map(([name,voice])=>`<article style="background:#100d14;padding:10px;border:1px solid #463b49;border-radius:9px;min-width:0"><header style="font-weight:700;font-size:12px;margin-bottom:9px;color:#d7cddc">${labels[index]} <span style="color:${voice};font-size:10px">/ ${name}</span></header>${a.castPresentationTemplate(key,{key:name+'-neutral',name,label:'neutral',src:art,color:voice,dialogue:esc('“We need to check the cameras before choosing a route. The bridge is still watched.”'),side:'auto',crop:{enabled:false,x:50,y:20,zoom:1}},esc)}</article>`).join('')).join('');
      document.querySelector('#root').innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:12px">${cases}</div>`;
    }''',dict(styles=STYLES,speakers=SPEAKERS,art=ART))
    page.wait_for_function('[...document.images].every(x=>x.complete)')
    destination=ROOT/'docs/screenshots/cast-material-three-voices-v48.png'
    destination.parent.mkdir(parents=True,exist_ok=True)
    page.screenshot(path=str(destination),full_page=True)
    assert not failures,failures
    browser.close()
    mins={key:round(min(min(r['contrast_top'],r['contrast_bottom']) for r in tests if r['key']==key),2) for key in STYLES}
    report={'cases':len(tests),'minimum_contrast_by_style':mins,'min_contrast':min(mins.values()),'image':'docs/screenshots/cast-material-three-voices-v48.png','speaker_colors':dict(SPEAKERS)}
    (ROOT/'docs/cast-material-tint-v48-report.json').write_text(json.dumps(report,indent=2)+'\n','utf-8')
    print(f"CAST MATERIAL TINT PASS: {len(tests)} cases, 8 independent surfaces, 3 voice colors, 320/760px; minimum contrast {report['min_contrast']}:1")
