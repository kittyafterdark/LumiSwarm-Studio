"""Vendor selected source doctype layouts into the Cast preset library.
Run against the two approved source references in docs/cast-layout-sources/.
No content is downloaded; HTML is parsed only to extract static preset elements/CSS.
"""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import json, re, tinycss2, runpy
root=Path(__file__).resolve().parents[1]
source_dir=root/'docs/cast-layout-sources'
definitions=[
('basics',[('vn-hero','VN Hero Stage','overlap'),('corner-popout','Corner Pop-Out','overlap'),('angled-cutout','Angled Cutout','overlap'),('editorial-square','Editorial Square','face'),('tech-messenger','Tech Messenger','face'),('comic-stamp','Comic Stamp','face'),('agency-lanyard','Agency Lanyard','object'),('evidence-tag','Evidence Tag','object'),('slide-mount','35mm Slide Mount','object')]),
('vault',[('persona-comic','Persona Angular','panel'),('cyber-comms','Cyber Comms','panel'),('manga-balloon','Manga Balloon','face'),('cinematic-cutscene','Cinematic Cutscene','cinema'),('retro-rpg','16-Bit RPG','panel'),('editorial-magazine','Editorial Magazine','editorial'),('vn-standee','VN Standee','overlap'),('manga-sfx','Manga SFX','overlap'),('fighter-banner','Fighter Banner','panel'),('anime-ova','Anime OVA','cinema'),('neon-horizon','Neon Horizon','standee'),('editorial-dissolve','Editorial Dissolve','editorial'),('gothic-folio','Gothic Folio','panel'),('mecha-hud','Mecha HUD','panel'),('manga-frame','Manga Frame','panel'),('terminal-console','Terminal Console','panel'),('luxury-lookbook','Luxury Lookbook','editorial'),('open-horizon','Open Horizon','standee'),('cinematic-bleed','Cinematic Bleed','cinema'),('shonen-burst','Shonen Burst','overlap'),('tarot-arch','Tarot Arch','standee'),('washi-scrapbook','Washi Scrapbook','object')])]
quote_classes={
'basics':['overlap-vn-quote','overlap-popout-quote','overlap-angled-quote','square-editorial-quote','square-tech-quote','square-manga-text','tag-lanyard-quote','tag-chamfered-speech','tag-slide-mount-dialogue'],
'vault':['persona-dialogue','cyber-dialogue','manga-text','cinematic-subtext','retro-dialogue','editorial-quote-text','vn-glass-dialogue','manga-dialogue-bold','versus-voice-quote','vhs-yellow-sub','synth-quote','editorial-dissolve-quote','gothic-quote','cockpit-quote','manga-panel-quote','terminal-text-pane','lookbook-quote-text','open-horizon-dialogue','bleed-letterbox-sub','shonen-burst-text','tarot-speech','washi-scrap-quote']}
entries=[]; collected_classes=set(); css='';
for origin,items in definitions:
 soup=BeautifulSoup((source_dir/(origin+'.html')).read_text(encoding='utf-8'),'html.parser')
 sections=soup.select('section.style-showcase'); assert len(sections)==len(items),(origin,len(sections),len(items))
 for i,((key,name,comp),sec) in enumerate(zip(items,sections)):
  divs=[el for el in sec.find_all('div',recursive=False) if 'style-meta' not in el.get('class',[]) and 'mock-context' not in el.get('class',[])]
  assert divs,(key,'missing layout')
  q=sec.select_one('.'+quote_classes[origin][i]);assert q and any(q is d or q in d.descendants for d in divs),(key,'quote target')
  # Mark the existing speech node as the single trusted caption slot.
  q.clear();q['data-swarm-cast-dialogue']='true';q.append('%CAST_DIALOGUE%')
  for d in divs:
   # The original doctype root sometimes contains a hardcoded Shoto-blue
   # custom property. It must inherit the actual speaker's palette instead.
   d.attrs.pop('style',None)
   for img in d.select('img'):
    img['src']='%CAST_IMG%'; img['alt']='%CAST_ALT%';img['data-cast-asset']='true'
   for el in d.find_all(True):
    collected_classes.update(el.get('class',[]))
    if 'style' in el.attrs:del el['style']
   collected_classes.update(d.get('class',[]))
   for node in list(d.find_all(string=True)):
    if node is q.string:continue
    updated=str(node)
    updated=re.sub(r'(?i)Shoto Todoroki', '%CAST_NAME%', updated)
    updated=re.sub(r'(?i)\bShoto\b', '%CAST_NAME_SHORT%', updated)
    updated=re.sub(r'(?i)\bconfused\b', '%CAST_EXPRESSION%', updated)
    updated=re.sub(r'(?i)\bconfusion\b', '%CAST_EXPRESSION%', updated)
    if updated!=str(node):node.replace_with(NavigableString(updated))
  # Avoid multiple root elements in a single template by wrapping in the preset's own slot.
  markup=''.join(str(d) for d in divs)
  assert markup.count('data-swarm-cast-dialogue')==1,(key,'dialogue slots')
  assert markup.count('data-cast-asset')==1,(key,'images')
  entries.append((key,name,comp,origin,markup))
 # One stylesheet per source, not one copy per selected layout.
 css+='\n'+(soup.style.string or '')

def scoped_rules(css):
 result=[]
 for r in tinycss2.parse_stylesheet(css,skip_comments=True,skip_whitespace=True):
  if r.type=='qualified-rule':
   sel=tinycss2.serialize(r.prelude).strip()
   classes=set(re.findall(r'\.([a-z][\w-]*)',sel,re.I))
   if not classes.intersection(collected_classes):continue
   selectors=[s.strip() for s in sel.split(',')]
   safe=[]
   for s in selectors:
    if not set(re.findall(r'\.([a-z][\w-]*)',s,re.I)).intersection(collected_classes):continue
    if re.search(r'(^|\s)(?:html|body|:root)(?=\b|\.)',s):continue
    safe.append('.ss-cast-design '+s)
   if safe:result.append(','.join(safe)+'{'+tinycss2.serialize(r.content).strip()+'}')
  elif r.type=='at-rule':
   at=tinycss2.serialize(r.prelude).strip()
   if r.lower_at_keyword=='media' and r.content is not None:
    inner=''.join(scoped_rules(tinycss2.serialize(r.content)))
    if inner:result.append('@media '+at+'{'+inner+'}')
   elif r.lower_at_keyword=='keyframes':
    result.append('@keyframes '+at+'{'+tinycss2.serialize(r.content)+'}')
 return result

# Approved looks from v3. No new reinterpretations.
locked=[
('chapter-tab','Manga · Chapter Tab','panel','approved','<div class="cast-look manga variant-chapter"><div class="head"><span>%CAST_NAME%</span><span class="panel-lines"><span></span><span></span><span></span></span></div><div class="manga-core"><div class="manga-photo"><div class="crop-frame"><img src="%CAST_IMG%" alt="%CAST_ALT%" data-cast-asset="true"></div></div><div class="manga-copy"><div class="quoted" data-swarm-cast-dialogue="true">%CAST_DIALOGUE%</div></div></div><div class="foot"><span class="mark">✧</span><span class="expression">%CAST_EXPRESSION%</span></div></div>'),
('moonlit-halo','Moonlit Halo','standee','approved','<div class="cast-look moonlit variant-original"><div class="moonlit-portrait"><span class="moonlight"></span><div class="mooncut"><img src="%CAST_IMG%" alt="%CAST_ALT%" data-cast-asset="true"></div></div><div class="moon-caption"><div class="quoted" data-swarm-cast-dialogue="true">%CAST_DIALOGUE%</div></div></div>'),
('polaroid-side','Polaroid · Side Note','object','approved','<div class="cast-look polaroid variant-side"><div class="instant"><div class="photo"><img src="%CAST_IMG%" alt="%CAST_ALT%" data-cast-asset="true"></div><div class="photo-name">%CAST_NAME_SHORT%</div></div><div class="polaroid-quote"><div class="quoted" data-swarm-cast-dialogue="true">%CAST_DIALOGUE%</div></div></div>')]
entries=locked+entries
# Material Edition: replace the actual DOM anatomy of repetitive donated panels.
# Canonical editable parts live in cast-material-redesign.json and .css.
redesigns=json.loads((root/'scripts/cast-material-redesign.json').read_text(encoding='utf-8'))
assert len(redesigns)==12 and set(redesigns).issubset({row[0] for row in entries})
assert not set(redesigns).intersection({row[0] for row in locked})
entries=[(key,name,comp,origin,redesigns.get(key,markup)) for key,name,comp,origin,markup in entries]
for key,markup in redesigns.items():
 assert markup.count('data-cast-asset')==1 and markup.count('data-swarm-cast-dialogue')==1,key
 assert markup.count('%CAST_DIALOGUE%')==1 and markup.count('%CAST_IMG%')==1,key
# Discard abandoned source classes so old panels don't carry dead CSS or require
# chains of increasingly specific style overrides.
collected_classes=set()
for key,name,comp,origin,markup in entries:
 for el in BeautifulSoup(markup,'html.parser').find_all(True):
  collected_classes.update(el.get('class',[]))
# Explicit per-preset width caps: the layout is an illustrated composition,
# not a responsive full-bleed chat bubble. Approved references and intentionally
# cinematic presets retain their original 560px stage. The gallery uses the
# exact same width, then uniformly scales it for the thumbnail.
CAST_STAGE_WIDTHS = {'agency-lanyard': 480, 'angled-cutout': 475, 'anime-ova': 560, 'chapter-tab': 560, 'cinematic-bleed': 550, 'cinematic-cutscene': 560, 'comic-stamp': 440, 'corner-popout': 475, 'cyber-comms': 500, 'editorial-dissolve': 500, 'editorial-magazine': 500, 'editorial-square': 460, 'evidence-tag': 460, 'fighter-banner': 550, 'gothic-folio': 500, 'luxury-lookbook': 500, 'manga-balloon': 440, 'manga-frame': 500, 'manga-sfx': 560, 'mecha-hud': 520, 'moonlit-halo': 560, 'neon-horizon': 480, 'open-horizon': 480, 'persona-comic': 520, 'polaroid-side': 560, 'retro-rpg': 480, 'shonen-burst': 680, 'slide-mount': 480, 'tarot-arch': 440, 'tech-messenger': 440, 'terminal-console': 500, 'vn-hero': 520, 'vn-standee': 520, 'washi-scrapbook': 500}
assert {entry[0] for entry in entries} == set(CAST_STAGE_WIDTHS), 'Stage geometry audit is incomplete'
# Extract approved layout CSS from #3 verbatim where relevant.
app=BeautifulSoup((source_dir/'atelier-03.html').read_text(encoding='utf-8'),'html.parser')
for origin_file,allowed in [(app,('manga','polaroid')),(BeautifulSoup((source_dir/'atelier-05.html').read_text(encoding='utf-8'),'html.parser'),('moonlit',))]:
 for r in tinycss2.parse_stylesheet(origin_file.style.string,skip_comments=True,skip_whitespace=True):
  if r.type=='qualified-rule':
   sel=tinycss2.serialize(r.prelude).strip()
   if not any(re.search(r'(^|[\s.])'+name+r'(?:\b|[-.])',sel) for name in allowed):continue
   css+='\n'+sel+'{'+tinycss2.serialize(r.content)+'}'
# Include selectors for approved styles (parse source and add them)
for key,name,comp,origin,markup in locked:
 frag=BeautifulSoup(markup,'html.parser')
 for el in frag.find_all(True):collected_classes.update(el.get('class',[]))
scoped='\n'.join(scoped_rules(css))
# Vendor the visual anatomy, not the sample character's hex palette. Native
# dialogue paint remains a separate channel; only ornament gets this accent.
scoped=re.sub(r'(?i)#599ce3\b','var(--cast-color)',scoped)
scoped=re.sub(r'rgba\(\s*89\s*,\s*156\s*,\s*227\s*,\s*(0?\.\d+|1(?:\.0+)?)\s*\)',
 lambda match:'color-mix(in srgb, var(--cast-color) '+str(round(float(match[1])*100,2))+'%, transparent)',scoped)
# VN Hero now owns a thematic nameplate in the material design source.

# Palette audit (v1.0.45): the donated doctypes used a blue-black default
# canvas even after the Shoto-blue accent was converted to --cast-color. That
# made Mina, Katsuki and everybody else inherit the same navy scene. Retain
# their *shapes* and contrast, but replace the donor-specific cool surfaces
# with neutral charcoal/ink with a restrained speaker tint. This deliberately
# does NOT alter the three approved Atelier references or the speaker's
# actual authored dialogue color (applied separately in the trusted caption).
# Keep this mapping here, never as late CSS overrides on rendered cards.
COOL_SURFACE_PALETTE = {
 '#08090d': '#131217',        # Gothic Folio dark gradient
 '#080c14': '#141219',        # Mecha HUD
 '#090d14': '#141218',        # Terminal Console
 '#0a0d14': '#17151a',        # Evidence Tag grommet
 '#0b1a2e': '#29232d',        # Manga name strip
 '#0c1017': '#19171d',        # Manga SFX ink
 '#0d121c': '#1d1a20',        # Angled Cutout / Agency Lanyard
 '#0d131f': '#1b1920',        # Fighter Banner
 '#0f172a': '#201b23',        # 16-Bit RPG
 '#101217': '#1c1920',        # Gothic Folio lighter ink
 '#111622': '#241f28',        # Terminal header
 '#1e293b': '#312b35',        # 16-Bit RPG portrait well
 '#e2f1ff': '#f2edf4',        # Cyber Comms light text, never authored dialogue
 '#e2e8f0': '#ebe6ee',        # Terminal Console fallback ink
 '#f1f5f9': '#f5eff5',        # Gothic Folio fallback ink
 'rgba(10, 18, 30, 0.85)': 'rgba(23, 20, 27, 0.85)',
 'rgba(12, 16, 24, 0.95)': 'rgba(20, 18, 24, 0.95)',
 'rgba(13, 18, 28, 0.94)': 'rgba(24, 21, 28, 0.94)',
 'rgba(20, 26, 38, 0.95)': 'rgba(32, 28, 36, 0.95)',
 'rgba(8, 12, 18, 0.95)': 'rgba(18, 16, 22, 0.95)',
}
for cool, neutral in COOL_SURFACE_PALETTE.items():
 count = scoped.count(cool)
 scoped = scoped.replace(cool, neutral)


# Fit source-accurate costumes to message-sized viewports without stacking
# late CSS overrides. Every rule below edits its one canonical declaration.
def tailor(selector: str, changes: dict[str, str]) -> None:
 global scoped
 rule=re.compile(r'(?P<before>(?:^|\n)'+re.escape('.ss-cast-design '+selector)+r'\{)(?P<body>[^{}]*)(?P<after>\})')
 matches=list(rule.finditer(scoped))
 assert len(matches)==1,(selector,len(matches))
 def update(match):
  body=match.group('body')
  for prop,value in changes.items():
   decl=re.compile(r'(?<![\w-])'+re.escape(prop)+r'\s*:\s*[^;]*;')
   if decl.search(body):body,n=decl.subn(prop+': '+value+';',body,count=1)
   else:body+='\n'+prop+': '+value+';'
  return match.group('before')+body+match.group('after')
 scoped=rule.sub(update,scoped,count=1)

# Shonen: crop is confined to the character pane, never the dialogue polygon.
tailor('.shonen-burst-card',{'align-items': 'flex-end', 'gap': '0', 'max-width': '100%', 'padding': '10px 12px 16px', 'margin': '8px auto'})
tailor('.shonen-burst-figure',{'width': 'auto', 'height': '260px', 'flex-shrink': '0', 'mask-image': 'none', '-webkit-mask-image': 'none', 'overflow': 'visible', 'flex': '0 0 clamp(105px,28%,188px)', 'min-width': '0', 'position': 'relative', 'z-index': '1', 'justify-content': 'center'})
tailor('.shonen-burst-figure img',{'height':'100%','max-width':'100%','object-fit':'contain'})
tailor('.shonen-burst-balloon',{'padding': '21px 23px 23px', 'clip-path': 'none', 'margin-bottom': '22px', 'min-width': '0', 'flex': '1 1 0', 'position': 'relative', 'isolation': 'isolate', 'background': 'none', 'border': '0', 'box-shadow': 'none', 'margin': '0 0 14px -24px', 'z-index': '2'})
# Tarot: an arched crop well that never overlaps captions below it.
tailor('.tarot-arch-card',{'margin':'8px auto','padding':'12px 0 14px','max-width':'430px'})
tailor('.tarot-arch-frame',{'width':'min(240px,75%)','height':'270px','overflow':'hidden','isolation':'isolate'})
tailor('.tarot-arch-frame img',{'height':'100%','width':'auto','max-width':'100%','object-fit':'contain','object-position':'center bottom'})
tailor('.tarot-arch-frame::before',{'content':'\"\"','text-shadow':'none'})
tailor('.tarot-quote-dock',{'margin-top':'10px','position':'relative','padding':'0 10px','z-index':'2'})
# Two different horizons: synthwave has a luminous floor; Open is editorial,
# intentionally nearly borderless with a hairline under the figure.
tailor('.synth-stage',{'height':'260px','width':'min(100%,460px)','background':'linear-gradient(180deg,transparent 40%,color-mix(in srgb,var(--cast-color) 13%,transparent) 100%)','border-bottom':'1px solid color-mix(in srgb,var(--cast-color) 65%,transparent)','overflow':'hidden'})
tailor('.synth-stage::after',{'bottom':'0','left':'0','right':'0','height':'36px','background':'repeating-linear-gradient(100deg,transparent 0 27px,color-mix(in srgb,var(--cast-color) 28%,transparent) 28px 29px),repeating-linear-gradient(0deg,transparent 0 10px,color-mix(in srgb,var(--cast-color) 20%,transparent) 11px 12px)','box-shadow':'0 -6px 22px color-mix(in srgb,var(--cast-color) 15%,transparent)'})
tailor('.synth-dialogue-under',{'margin-top':'2px','padding':'9px 12px'})
tailor('.open-horizon-card',{'max-width':'480px','margin':'8px auto'})
tailor('.open-horizon-figure',{'height':'234px'})
tailor('.open-horizon-rule',{'width':'65%','height':'1px','background':'linear-gradient(90deg,transparent,color-mix(in srgb,var(--cast-color) 26%,transparent),transparent)','box-shadow':'none'})
tailor('.open-horizon-quote-pane',{'margin-top':'5px','padding':'3px 12px'})
# VN Standee has a scenic design in cast-material-redesign.css.
# Make the SFX caption share an edge with the cutout rather than floating a
# portrait-height below it. Its white box stays outside the image crop.
tailor('.manga-sfx-card',{'min-height': '0', 'display': 'flex', 'flex-direction': 'column', 'padding': '5px 9px 17px', 'margin': '8px auto', 'background': 'none'})
tailor('.manga-figure-center',{'height': '245px', 'width': 'min(100%,240px)', 'display': 'flex', 'justify-content': 'center', 'align-items': 'flex-end'})
tailor('.manga-figure-center img',{'height':'100%','width':'auto','max-width':'100%'})
tailor('.manga-floating-card',{'position': 'relative', 'right': 'auto', 'bottom': 'auto', 'margin': '-27px auto 0', 'max-width': '100%', 'padding': '15px 20px 17px', 'width': 'calc(100% - 8px)', 'text-align': 'left', 'box-shadow': '5px 6px 0 var(--cast-color)'})
# Preserve the angular skew with enough breathing room for all four corners.
tailor('.persona-card',{'margin':'8px auto','padding':'9px 12px','max-width':'min(100%,520px)'})
tailor('.persona-avatar-wrap',{'flex':'0 0 105px','border':'3px solid #fff','overflow':'hidden'})
tailor('.persona-bubble',{'padding':'13px 18px 13px 24px','border':'3px solid #fff'})
# Balance fighter art versus its banner and restore an actual character-led
# OVA subtitle with text overlapping the lower edge of the cutout.
tailor('.versus-select-card',{'max-width':'min(100%,550px)','margin':'8px auto'})
tailor('.versus-figure-stage',{'height':'300px','overflow':'visible','isolation':'isolate'})
tailor('.versus-figure-stage::before',{'z-index':'0','width':'150px','height':'100%','opacity':'.23'})
tailor('.versus-full-img',{'position':'relative','z-index':'3','height':'100%','max-width':'100%','object-fit':'contain'})
tailor('.versus-banner-dock',{'width':'97%','margin-top':'-18px','padding':'9px 15px','border-top':'3px solid var(--cast-color)','border-bottom':'2px solid #fff','z-index':'2'})
tailor('.versus-voice-quote',{'font-size':'0.96rem','font-weight':'700','letter-spacing':'.015em','line-height':'1.45'})
tailor('.vhs-sub-card',{'max-width': '100%', 'margin': '8px auto'})
tailor('.vhs-figure-pane',{'height':'265px','width':'100%'})
tailor('.vhs-sub-floating',{'margin-top': '-24px', 'padding': '10px 14px 12px', 'max-width': '100%', 'width': 'calc(100% - 24px)', 'background': 'transparent', 'border-block': '0'})
# Source attribution, not fabricated setting-specific text.
for idx,(key,name,comp,origin,markup) in enumerate(entries):
 if key=='editorial-magazine':
  assert 'District Patrol Log' in markup
  entries[idx]=(key,name,comp,origin,markup.replace('District Patrol Log','%CAST_EXPRESSION%'))
 if key=='editorial-square':
  assert 'Field Testimony' in markup
  entries[idx]=(key,name,comp,origin,markup.replace('Field Testimony','%CAST_EXPRESSION%'))
scoped+='\n'+(root/'scripts/cast-material-redesign.css').read_text(encoding='utf-8')
scoped+='''\n.ss-cast-design{display:block;max-width:100%;width:min(100%,var(--cast-stage-width,560px));box-sizing:border-box;margin:12px auto;line-height:normal;--cast-voice:var(--lumiverse-prose-dialogue,#b9b2bf);--cast-color:color-mix(in srgb,var(--cast-voice) 30%,#b6afbb);--cast-border:color-mix(in srgb,var(--cast-color) 42%,transparent);--cast-subtle:color-mix(in srgb,var(--cast-color) 12%,transparent);--cast-glow:color-mix(in srgb,var(--cast-color) 26%,transparent);--bg-page:#15151b;--bg-card:#191820;--text-main:var(--lumiverse-text,#f6f1f7);--text-muted:#c8bfce;--text-paragraph:inherit;--speaker:var(--lumiverse-prose-dialogue,inherit);--quote-size:15px;--image-size:210px;--look-accent:var(--cast-color);overflow-wrap:anywhere;container-type:inline-size;}
.ss-cast-design *{box-sizing:border-box;min-width:0}
.ss-cast-design [data-cast-asset]{max-width:100%;}
/* Only an explicitly enabled crop overrides the source preset's focal point.
   The high-specificity, !important position wins original donated rules like
   .cyber-avatar-box img { object-position:25% 10% } without changing defaults. */
.ss-cast-design[data-cast-crop-enabled="true"] [data-cast-asset]{object-position:var(--cast-crop-x,50%) var(--cast-crop-y,20%)!important;scale:var(--cast-crop-scale,1);}
/* Crop belongs to the image bay, not the standee's full painted page. */
.ss-cast-design[data-cast-crop-enabled="true"] :has(> [data-cast-asset]){overflow:clip;}
.ss-cast-design [data-swarm-cast-dialogue]{overflow-wrap:anywhere;white-space:normal;min-width:0;font-size:var(--cast-dialogue-size,inherit);}
.ss-cast-design .cast-look{max-width:100%;margin:0 auto;}
.ss-cast-design .mooncut img{width:var(--image-size);height:auto;display:block;}
.ss-cast-design .manga .manga-photo img,.ss-cast-design .polaroid .photo img{width:100%;height:100%;object-fit:cover;}
.ss-cast-design [hidden]{display:none!important}
.ss-cast-design{overflow-x:clip}
.ss-cast-design .cinematic-cutscene{height:auto;min-height:140px;padding-top:14px;padding-bottom:14px}
.ss-cast-design .cinematic-content{padding-top:10px;padding-bottom:10px}
.ss-cast-design .manga .quoted{color:var(--speaker)}
.ss-cast-design .polaroid .quoted{color:var(--speaker)}
.ss-cast-design .moonlit .quoted{color:var(--speaker)}
.ss-cast-design :is(.overlap-vn-stage,.overlap-popout-card,.overlap-angled-card,.square-editorial-card,.square-tech-card,.square-manga-card,.tag-lanyard-card,.tag-chamfered-card,.tag-slide-mount-card,.persona-card,.cyber-hud-card,.manga-panel-card,.cinematic-cutscene,.retro-rpg-box,.editorial-quote-card,.vn-standee-card,.manga-sfx-card,.versus-select-card,.vhs-sub-card,.synth-stage,.editorial-dissolve-card,.gothic-card,.cockpit-hud-card,.manga-panel-box,.terminal-console-card,.lookbook-card,.open-horizon-card,.bleed-letterbox-card,.shonen-burst-card,.tarot-arch-card,.washi-scrap-card){margin:8px auto;}
@container (max-width:350px){.ss-cast-design .overlap-popout-card,.ss-cast-design .overlap-angled-card,.ss-cast-design .square-editorial-card,.ss-cast-design .square-tech-card,.ss-cast-design .square-manga-card,.ss-cast-design .tag-lanyard-body,.ss-cast-design .tag-chamfered-card,.ss-cast-design .tag-slide-mount-card,.ss-cast-design .persona-card,.ss-cast-design .cyber-hud-card,.ss-cast-design .manga-panel-card,.ss-cast-design .editorial-quote-card,.ss-cast-design .vn-standee-card,.ss-cast-design .editorial-dissolve-card,.ss-cast-design .gothic-card,.ss-cast-design .cockpit-hud-body,.ss-cast-design .manga-panel-box,.ss-cast-design .terminal-body,.ss-cast-design .lookbook-card,.ss-cast-design .bleed-letterbox-card,.ss-cast-design .shonen-burst-card,.ss-cast-design .washi-scrap-card{grid-template-columns:1fr;flex-direction:column;gap:10px;text-align:center;}
.ss-cast-design .manga .manga-core{grid-template-columns:100px minmax(0,1fr)}.ss-cast-design .polaroid{grid-template-columns:112px minmax(0,1fr);gap:12px}
.ss-cast-design .overlap-popout-body,.ss-cast-design .overlap-angled-banner{padding:12px 16px}.ss-cast-design .editorial-dissolve-figure,.ss-cast-design .gothic-figure-pane,.ss-cast-design .cockpit-avatar-pane{max-height:160px}}
'''
# The quick chat picker is a fixed overlay, deliberately separate from any
# message-body container, including the inline decorator's observation scope.
scoped+='''
.ss-cast-quick-picker{
  --cq-bg:var(--lumiverse-surface-raised,var(--lumiverse-surface,var(--lumiverse-fill,#1c1a22)));
  --cq-field:color-mix(in srgb,var(--cq-text) 6%,var(--cq-bg));
  --cq-text:var(--lumiverse-text,#f3edf3);
  --cq-muted:var(--lumiverse-text-muted,#afa6b3);
  --cq-border:var(--lumiverse-border,#59515d);
  --cq-accent:var(--lumiverse-accent,var(--lumiverse-primary,#b8a6c5));
  position:fixed;z-index:2147482000;display:flex;flex-direction:column;gap:0;
  width:min(306px,calc(100vw - 16px));max-height:min(445px,calc(100dvh - 16px));
  padding:12px;border:1px solid var(--cq-border);border-radius:12px;
  background:var(--cq-bg);color:var(--cq-text);box-shadow:0 18px 45px #0009;
  font:12px/1.5 system-ui,sans-serif;isolation:isolate;
}
.ss-cast-quick-picker *{box-sizing:border-box}
.ss-cast-quick-picker [hidden]{display:none!important}
.ss-cast-quick-picker header{display:flex;justify-content:space-between;align-items:center;gap:9px;margin:0;padding:0;color:var(--cq-text);background:none;border:0;position:static;min-height:0}
.ss-cast-quick-picker header strong{font:600 13px/1.3 system-ui,sans-serif}
.ss-cast-quick-close{border:1px solid var(--cq-border);border-radius:7px;background:var(--cq-field);color:var(--cq-text);cursor:pointer;font-size:19px;line-height:23px;height:27px;width:29px}
.ss-cast-quick-picker p{margin:4px 0 9px;font-size:10px;color:var(--cq-muted)}
.ss-cast-quick-tabs{display:grid;grid-template-columns:1fr 1fr;gap:3px;margin:10px 0;padding:3px;border-radius:9px;background:color-mix(in srgb,var(--cq-text) 5%,var(--cq-bg));border:1px solid var(--cq-border)}
.ss-cast-quick-tab{border:0;border-radius:6px;background:transparent;color:var(--cq-muted);padding:6px;font-weight:650;cursor:pointer}
.ss-cast-quick-tab[aria-selected=true]{background:color-mix(in srgb,var(--cq-accent) 15%,var(--cq-bg));color:var(--cq-text);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--cq-accent) 32%,var(--cq-border))}
.ss-cast-quick-panel{min-height:0;display:flex;flex-direction:column;overflow:hidden;flex:1 1 auto}
.ss-cast-quick-filter-row{display:flex;gap:6px;align-items:flex-start}
.ss-cast-quick-filter-row select{min-width:0;flex:1}
.ss-cast-quick-search-toggle{width:35px;height:33px;flex:0 0 35px;display:grid;place-items:center;border:1px solid var(--cq-border);background:var(--cq-field);border-radius:7px;color:var(--cq-text);cursor:pointer}
.ss-cast-quick-search-toggle[aria-expanded=true]{background:color-mix(in srgb,var(--cq-accent) 20%,var(--cq-bg))}
.ss-cast-quick-position{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:2px 0 8px;font-size:10px;color:var(--cq-muted)}
.ss-cast-quick-position-choices{display:flex;gap:2px;padding:2px;border-radius:8px;border:1px solid var(--cq-border);background:var(--cq-field)}
.ss-cast-quick-position-choices button{padding:5px 8px;border:0;background:transparent;color:var(--cq-muted);border-radius:5px;cursor:pointer;font-size:10px}
.ss-cast-quick-position-choices button[aria-pressed=true]{background:color-mix(in srgb,var(--cq-accent) 20%,var(--cq-bg));color:var(--cq-text)}
.ss-cast-quick-bottom{display:flex;flex-direction:column;gap:3px;border-top:1px solid var(--cq-border);margin-top:8px;padding-top:7px}
.ss-cast-quick-open-member{display:flex;align-items:center;justify-content:center;gap:7px;min-height:29px;border:1px solid var(--cq-border);border-radius:7px;background:var(--cq-field);color:var(--cq-text);font-size:11px;cursor:pointer}
.ss-cast-quick-open-member:hover{border-color:var(--cq-accent)}
.ss-cast-quick-picker select,.ss-cast-quick-picker input[type=search]{width:100%;border:1px solid var(--cq-border);background:var(--cq-field);color:var(--cq-text);border-radius:7px;padding:7px 9px;margin-bottom:7px;outline-offset:2px}
.ss-cast-quick-picker select:focus-visible,.ss-cast-quick-picker input:focus-visible,.ss-cast-quick-picker button:focus-visible{outline:2px solid var(--cq-accent);outline-offset:2px}
.ss-cast-quick-list{min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;display:flex;flex-direction:column;gap:2px;padding-right:2px}
.ss-cast-quick-choice{display:flex;gap:9px;align-items:center;min-height:32px;text-align:left;background:none;color:var(--cq-text);border:1px solid transparent;border-radius:7px;padding:5px 7px;cursor:pointer;font:12px/1.3 system-ui,sans-serif}
.ss-cast-quick-choice:hover,.ss-cast-quick-choice:focus-visible{background:color-mix(in srgb,var(--cq-accent) 9%,var(--cq-bg));border-color:color-mix(in srgb,var(--cq-accent) 28%,var(--cq-border))}
.ss-cast-quick-choice[aria-current=true]{background:color-mix(in srgb,var(--cq-accent) 15%,var(--cq-bg));color:var(--cq-text)}
.ss-cast-quick-check{display:grid;place-items:center;flex:0 0 17px;width:17px;height:17px;border-radius:5px;color:var(--cq-muted);background:var(--cq-field);border:1px solid var(--cq-border);font-size:12px}
.ss-cast-quick-choice[aria-current=true] .ss-cast-quick-check{background:color-mix(in srgb,var(--cq-accent) 30%,var(--cq-bg));color:var(--cq-text);border-color:var(--cq-accent)}
.ss-cast-quick-status{margin:7px 0 0!important;min-height:0;color:var(--cq-muted)!important}
.ss-cast-quick-crop{gap:7px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
.ss-cast-quick-toggle{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;cursor:pointer}
.ss-cast-quick-toggle input{accent-color:var(--cq-accent)}
.ss-cast-quick-crop-well{position:relative;width:100%;height:142px;flex:0 0 142px;overflow:hidden;border:1px solid var(--cq-border);border-radius:10px;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--cq-accent) 12%,transparent),transparent 72%),repeating-conic-gradient(color-mix(in srgb,var(--cq-text) 4%,transparent) 0 25%,transparent 0 50%) 50% / 16px 16px,var(--cq-field);touch-action:none;cursor:grab;user-select:none;isolation:isolate}
.ss-cast-quick-crop-well[data-enabled=false]{cursor:default}
.ss-cast-quick-crop-well:active[data-enabled=true]{cursor:grabbing}
.ss-cast-quick-crop-well img{display:block;width:100%;height:100%;object-fit:cover;object-position:var(--cast-quick-x,50%) var(--cast-quick-y,20%);transform:scale(var(--cast-quick-zoom,1));transform-origin:center center;pointer-events:none}
.ss-cast-quick-crop-well small{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);padding:3px 6px;border-radius:4px;background:#0008;color:#fff;font-size:9px;letter-spacing:.09em;white-space:nowrap;pointer-events:none}
.ss-cast-quick-crop-fields{display:grid;gap:6px}
.ss-cast-quick-crop-field{display:grid;gap:2px;font-size:10px;color:var(--cq-text)}
.ss-cast-quick-crop-field>span{display:flex;justify-content:space-between;gap:8px}
.ss-cast-quick-crop-field output{color:var(--cq-muted);font-variant-numeric:tabular-nums}
.ss-cast-quick-crop-field input{width:100%;margin:0;accent-color:var(--cq-accent)}
.ss-cast-quick-crop-field input:disabled{opacity:.42}
.ss-cast-quick-crop-actions{display:flex;justify-content:flex-end}
.ss-cast-quick-reset{border:1px solid var(--cq-border);color:var(--cq-text);background:var(--cq-field);padding:5px 9px;border-radius:7px;cursor:pointer;font-size:11px}
'''
# Import the user-selected source specimens after legacy styling is tailored.
curated, curated_widths, curated_css = runpy.run_path(str(root/'scripts/cast-curated.py'))['extract_curated'](source_dir)
replacements={row[0] for row in curated}
entries=[row for row in entries if row[0] not in replacements and row[0]!='vn-standee']+curated
CAST_STAGE_WIDTHS.pop('vn-standee')
CAST_STAGE_WIDTHS.update(curated_widths)
assert set(CAST_STAGE_WIDTHS)=={row[0] for row in entries}
scoped+='\n'+curated_css+'\n'+(root/'scripts/cast-curated.css').read_text(encoding='utf-8').replace('/* SCENE_ART_DIRECTION */',(root/'scripts/cast-scene-designs.css').read_text(encoding='utf-8'))+'\n'+(root/'scripts/cast-overlap-refinement.css').read_text(encoding='utf-8')
# Re-map class conflicts due to `.manga` in approved and `manga-panel` etc only scoped uniquely.
js='''// Generated by scripts/build-cast-presets.py from docs/cast-layout-sources.
// Preserves the submitted visual geometry; all runtime values are substituted as escaped text.
type CastComposition = "standee" | "overlap" | "face" | "object" | "panel" | "cinema" | "editorial" | "scene"
interface CastPresentationEntry { id: string; name: string; composition: CastComposition; origin: "approved" | "basics" | "vault" | "atelier"; markup: string }
const CAST_COMPOSITIONS: {id: CastComposition; name: string; hint: string}[] = [
 {id:"standee",name:"Transparent standees",hint:"Full cutouts and grounded character silhouettes"},
 {id:"overlap",name:"Portrait + dialogue overlap",hint:"Character artwork crossing a speech plate"},
 {id:"face",name:"Face crops + dialogue",hint:"Compact expressions beside readable text"},
 {id:"object",name:"Photos, tags + paper",hint:"Framed memorabilia and physical objects"},
 {id:"panel",name:"Graphic panels",hint:"Comic, game, terminal and dossier compositions"},
 {id:"scene",name:"Background stages",hint:"Reusable environments with expression art and dialogue"},
 {id:"cinema",name:"Cinematic strips",hint:"Letterboxing, subtitles and analog video"},
 {id:"editorial",name:"Editorial splits",hint:"Literary quotation and magazine layouts"},
]
const CAST_PRESENTATION_ENTRIES: CastPresentationEntry[] = [
'''
for key,name,comp,origin,markup in entries:
 js+=' {id:'+json.dumps(key)+',name:'+json.dumps(name,ensure_ascii=False)+',composition:'+json.dumps(comp)+',origin:'+json.dumps(origin)+',markup:'+json.dumps(markup,ensure_ascii=False)+'},\n'
js+=']\nconst CAST_PRESENTATION_INDEX = new Map(CAST_PRESENTATION_ENTRIES.map(p => [p.id,p]))\n'
js+='const CAST_PRESENTATION_STAGE_WIDTHS: Record<string, number> = '+json.dumps(CAST_STAGE_WIDTHS)+'\n'
js+='function castPresentationStageWidth(id:string):number { return CAST_PRESENTATION_STAGE_WIDTHS[id] || 560 }\n'
js+='const CAST_PRESENTATION_CSS = '+json.dumps(scoped+'\n'+(root/'scripts/cast-atmospheres.css').read_text(encoding='utf-8'),ensure_ascii=False)+'\n'
js+='const CAST_PRESENTATION_SIDE_CSS = '+json.dumps((root/'scripts/cast-expression-sides.css').read_text(encoding='utf-8'),ensure_ascii=False)+'\n'
js+='''function castPresentationTemplate(style: string, options: {key:string; src:string; defaultSrc?:string; name:string; label:string; dialogue:string; color:string; background?:{id:string;name:string}; atmosphere?:ReturnType<typeof castAtmosphereVisual>; side?:"auto"|"left"|"right"; crop:{enabled:boolean;x:number;y:number;zoom:number}},escape:(v:string)=>string):string {
 const preset=CAST_PRESENTATION_INDEX.get(style)
 if(!preset)return ""
 const safe=escape
 const first=options.name.trim().split(/\\s+/)[0] || options.name
 const values:Record<string,string>={"%CAST_IMG%":safe(options.src),"%CAST_ALT%":safe(options.name+" · "+options.label),"%CAST_NAME%":safe(options.name),"%CAST_NAME_SHORT%":safe(first),"%CAST_EXPRESSION%":safe(options.label),"%CAST_DIALOGUE%":options.dialogue,"%CAST_INITIAL%":safe(first.charAt(0).toUpperCase()),"%CAST_BACKGROUND_NAME%":safe(options.background?.name||"UNTITLED SCENE")}
 const template=preset.markup.replace(/%CAST_(?:IMG|ALT|NAME_SHORT|NAME|EXPRESSION|DIALOGUE|INITIAL|BACKGROUND_NAME)%/g,key=>values[key]||"")
 const col= /^#[0-9a-fA-F]{3,8}$/.test(options.color)?options.color:preset.origin==="atelier"?"var(--lumiverse-prose-dialogue,#b9b2bf)":"var(--lumiverse-prose-dialogue,inherit)"
 const world=preset.composition==="scene" && options.background && /^[\\p{L}\\p{N}][\\p{L}\\p{N}_-]{0,63}$/u.test(options.background.id) ? `--cast-world:url(/api/v1/images/${encodeURIComponent(options.background.id)});` : ""
 // Use authored paint unchanged. Pick a compatible local material only for explicit RGB ink.
 const hex=options.color.replace(/^#/,"")
 const rgb=hex.length===3?hex.split("").map(c=>parseInt(c+c,16)):hex.length===6?hex.match(/.{2}/g)?.map(c=>parseInt(c,16)):null
 const lum=rgb&&rgb.every(Number.isFinite)?rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0):null
 const ink=(preset.origin==="atelier" || ['shonen-burst','manga-sfx','anime-ova'].includes(style)) && /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(options.color)&&lum!==null?(lum>=.179?"light":"dark"):"auto"
 const tinted=(preset.origin==="atelier" || ['shonen-burst','manga-sfx','anime-ova'].includes(style)) && !options.color ? template : template.replace('data-swarm-cast-dialogue="true"',`data-swarm-cast-dialogue="true" style="color:${col};"`)
 const atmosphere=preset.composition==="scene"?options.atmosphere:null
 const moodAttrs=atmosphere?` data-cast-atmosphere="${atmosphere.key}" data-cast-atmosphere-transition="${atmosphere.transitions}" data-cast-atmosphere-animation="${atmosphere.animations}"`:""
 const crop=options.crop.enabled && style!=="moonlit-halo" ? options.crop : {enabled:false,x:50,y:20,zoom:1}
 // A capsule avatar is decorative, never a second active actor. Only accept local asset paths.
 const defaultSrc=/^\\/api\\/v1\\/images\\/[\\w%-]+$/.test(options.defaultSrc||'')?options.defaultSrc!:''
 const badgeSrc=defaultSrc || (/^\\/api\\/v1\\/images\\/[\\w%-]+$/.test(options.src)||/^data:image\\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(options.src)?options.src:'')
 const badgeStyle=style==='overlap-capsule'&&badgeSrc?`--cast-badge-image:url(${JSON.stringify(badgeSrc)});`:''
 const badgeAttr=defaultSrc?` data-cast-default-image="${safe(defaultSrc)}"`:''
 // One owned static visual tree per expression; DOM reconciler updates only the caption after mounting.
 return `<span data-swarm-cast="${safe(options.key)}" data-cast-preset="${safe(style)}" data-cast-ink="${ink}" data-cast-side="${options.side||"auto"}" data-cast-crop-enabled="${crop.enabled}" class="ss-cast-design"${moodAttrs}${badgeAttr} style="${safe(badgeStyle)}${world}${atmosphere?.css||""}--cast-stage-width:${castPresentationStageWidth(style)}px;--cast-voice:${col};--cast-color:color-mix(in srgb,var(--cast-voice) 30%,#b6afbb);--speaker:${col};--cast-crop-x:${crop.x}%;--cast-crop-y:${crop.y}%;--cast-crop-scale:${crop.enabled?crop.zoom:1};"><span class="ss-cast-preset-inner">${tinted}</span></span>`
}
'''
(root/'src/state/cast-presentations.ts').write_text(js,encoding='utf-8')
print('generated',len(entries),'presets,',len(scoped),'css chars',len(js),'ts chars')
