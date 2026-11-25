"""Import static, selected Atelier designs. Demo chrome, JS, and images never enter runtime."""
from bs4 import BeautifulSoup, Comment
from pathlib import Path
import tinycss2, re

def extract_curated(source_dir):
    entries=[]; widths={}; css=[]
    # The retained selected doctype already contains a simplified version of
    # several captions. Restore their individual art direction in cast-scene-designs.css.
    redesigned_captions={'afterglow-caption','afterglow-caption-letterbox','postcard-note','postcard-note-rebellion','rain-sign','film-caption'}
    for file, family in [('curated-cards','curated'), ('portrait-overlap','overlap')]:
        soup=BeautifulSoup((source_dir/(file+'.html')).read_text(encoding='utf8'),'html.parser')
        scope='.ss-cast-design .atelier-'+family
        for card in soup.select('article'):
            if family=='curated':
                key=card['data-look']; comp='panel' if key in ('corner-popout','angled-cutout') else 'scene'
                node=card.select_one('.stage-window').find(True,recursive=False)
                name_nodes=node.select('[data-name]'); expr_nodes=node.select('[data-expression]'); q=node.select_one('[data-quote]')
            else:
                key='overlap-'+card['data-spec'].split('-',1)[1]; comp='overlap'; node=card.select_one('.stage-canvas')
                node.select_one('.stage-ambient-glow').decompose() # scene-free, transparent canvas
                name_nodes=node.select('[data-bind="speaker"]');expr_nodes=node.select('[data-bind="expression"]');q=node.select_one('[data-bind="quote"]')
                for el in node.select('#avatar-initial'):
                    el.attrs.pop('id');el.clear();el['aria-hidden']='true'
            assert q and len(node.select('img'))==1,key
            for el in name_nodes:el.clear();el.append('%CAST_NAME_SHORT%')
            for el in expr_nodes:el.clear();el.append('%CAST_EXPRESSION%')
            q.clear();q.append('%CAST_DIALOGUE%');q['data-swarm-cast-dialogue']='true'
            for el in node.find_all(True):
                for attr in ('data-name','data-expression','data-quote','data-bind','data-art','data-sprite'):el.attrs.pop(attr,None)
                # The sample filters are part of the specimen's artwork treatment, not layout logic.
                if el.name=='img':el['src']='%CAST_IMG%';el['alt']='%CAST_ALT%';el['data-cast-asset']='true'
            for comment in node.find_all(string=lambda t:isinstance(t,Comment)):comment.extract()
            # Scene labels are decorative, not claims about the actual location or time.
            if key=='postcard-original':node.select_one('.postcard-date').decompose()
            if key=='vn-hero':node.select_one('.vn-top').string='SCENE // %CAST_BACKGROUND_NAME%'
            if key=='afterglow-cinema':node.select_one('.afterglow-kicker').string='%CAST_BACKGROUND_NAME% // TAKE 01'
            if key=='rainbound-platform':node.select_one('.rain-number').string='%CAST_BACKGROUND_NAME% / LIVE FEED'
            if family=='curated' and comp=='scene' and key!='vn-hero':
                for el in name_nodes:el['class']=el.get('class',[])+['scene-speaker']
                for el in expr_nodes:el['class']=el.get('class',[])+['scene-expression']
                # Remove only the common literal slash. Keep its semantic slots.
                for el in node.select('.meta-name'):
                    for text in list(el.find_all(string=True,recursive=False)):
                        if str(text).strip()=='/':text.extract()
            # Add distinct, static decorative anatomy without introducing another actor/quote.
            if key=='overlap-cyber':
                panel=node.select_one('.strip-cyber');rail=soup.new_tag('div',attrs={'class':'cyber-rail','aria-hidden':'true'});rail.append('▂ ▅ ▃ ▇ ▂ ▆ ▃');panel.append(rail)
            if key=='overlap-origami':
                crest=node.select_one('.origami-crest');crest.append(' / ');crest.append('%CAST_EXPRESSION%')
            markup=f'<div class="atelier-{family}">{node}</div>'
            entries.append((key,card.select_one('h3').get_text(strip=True),comp,'atelier',markup));widths[key]=520 if family=='curated' else 480
        source=soup.style.string
        if family=='curated':
            # Source ranges deliberately exclude the entire gallery interface.
            source=source[source.index('.photo, .art {'):source.index('/* LONG DIALOGUE') if '/* LONG DIALOGUE' in source else source.index('.is-long .corner-cinematic')]
        else:
            source=source[source.index('.stage-canvas {'):source.index('/* LONGER TEXT HANDLING')]
        classes=set()
        for _,_,_,_,markup in entries:
            if f'atelier-{family}' in markup:
                for el in BeautifulSoup(markup,'html.parser').find_all(True):classes.update(el.get('class',[]))
        def rules(text):
            out=[]
            for r in tinycss2.parse_stylesheet(text,skip_comments=True,skip_whitespace=True):
                if r.type=='qualified-rule':
                    sels=[s.strip() for s in tinycss2.serialize(r.prelude).split(',')]
                    sels=[s for s in sels if set(re.findall(r'\.([\w-]+)',s))&classes and not re.search(r'\.(?:is-long|is-monochrome|card|overlap-card|stage-window|stage-ambient-glow)\b',s)]
                    if family=='curated':
                        sels=[s for s in sels if not (set(re.findall(r'\.([\w-]+)',s)) & redesigned_captions)]
                    if sels:out.append(','.join(scope+' '+s for s in sels)+'{'+tinycss2.serialize(r.content).strip()+'}')
                elif r.type=='at-rule' and r.lower_at_keyword=='container':
                    out.append('@container '+tinycss2.serialize(r.prelude)+'{'+''.join(rules(tinycss2.serialize(r.content)))+'}')
                elif r.type=='at-rule' and r.lower_at_keyword=='keyframes':
                    out.append('@keyframes cast-atelier-pulse{'+tinycss2.serialize(r.content)+'}')
            return out
        css.extend(rules(source))
    return entries,widths,'\n'.join(css).replace('var(--voice-accent)','var(--atelier-voice)').replace('var(--voice)','var(--atelier-voice)').replace('var(--voice-glow)','var(--cast-glow)').replace('pulse-dot','cast-atelier-pulse')
