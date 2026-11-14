import { chromium } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { existsSync } from 'node:fs'
import assert from 'node:assert/strict'
// Offline UI fixture; use Playwright's installed browser or an explicit/system Chromium.
const browserPath = process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined))
const browser=await chromium.launch({...(browserPath ? {executablePath:browserPath} : {}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const outputDir=resolve(process.env.STUDIO_SCREENSHOT_DIR || 'artifacts/studio-v5-layout')
await mkdir(outputDir,{recursive:true})
const measurements=[]; const errors=[]
try{
  for (const width of [360,390,720,900,1280,1600]) {
    const page=await browser.newPage({viewport:{width,height:900}})
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`))
    const html=await readFile(resolve('tests/ui-harness.html'),'utf8')
    const compiled=await readFile(resolve('dist/frontend.js'),'utf8')
    const many = width===1600 ? html.replace('    const previewMap = {', '    loras.push(...Array.from({length:303},(_,i)=>({name:`anima/mock-model-${i}.safetensors`,title:`Test model ${i}`,author:`Creator ${i}`,description:`Long description ${i}`,previewRef:null,architecture:"anima-v1/lora",compatClass:"anima-v1",triggerPhrase:"",tags:["mock"],defaultWeight:.6,local:true})));\n    const previewMap = {') : html
    await page.setContent(many.replace('import { setup } from "../dist/frontend.js"',compiled.replaceAll('</script','<\\/script')),{waitUntil:'domcontentloaded'})
    await page.locator('.ss-shell').waitFor()
    await page.waitForTimeout(250)
    if(width<=720) { await page.locator('[data-action="mobile-tab"][data-tab="generation"]').click(); }
    await page.locator('.ss-tune-group[data-tune-group="sampling"] > summary').click()
    await page.locator('.ss-tune-group[data-tune-group="sampling"] > summary').click()
    let result=await page.evaluate(()=>{
      const css=sel=>{const n=document.querySelector(sel);if(!n)return null;const r=n.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth}}
      const shell=document.querySelector('.ss-shell')
      return {viewport:innerWidth,bodyScroll:document.body.scrollWidth,theme:getComputedStyle(shell).getPropertyValue('--ss-panel-bg').trim(),shell:css('.ss-shell'),bar:css('.ss-commandbar'),tune:css('.ss-generation-pane')}
    })
    if (width<=720) await page.screenshot({path:`/mnt/data/swarm_v5_preview/tune-${width}.png`})
    else if(width===1600) await page.screenshot({path:join(outputDir, 'generate-desktop.png')})
    if(width<=720){
      await page.locator('[data-action="mobile-tab"][data-tab="stack"]').click()
      result.stack=await page.evaluate(()=>{const card=document.querySelector('.ss-style-stack-column .ss-stack-row'), art=card?.querySelector('.ss-stack-preview'),name=card?.querySelector('.ss-stack-name'),actions=card?.querySelector('.ss-stack-actions');return {cardWidth:Math.round(card?.getBoundingClientRect().width||0),cardScrollWidth:card?.scrollWidth,previewW:Math.round(art?.getBoundingClientRect().width||0),nameW:Math.round(name?.getBoundingClientRect().width||0),actionsW:Math.round(actions?.getBoundingClientRect().width||0),name:card?.querySelector('.ss-stack-name span')?.textContent}})
      await page.screenshot({path:`/mnt/data/swarm_v5_preview/stack-${width}.png`})
      await page.locator('[data-action="mobile-tab"][data-tab="generation"]').click()
    }
    if(width===390){
      await page.locator('.ss-recipe-menu > summary').click()
      await page.screenshot({path:join(outputDir, 'recipe-mobile.png')})
    }
    // Fullscreen portal should escape a scaled host.
    if(width===1280){
      await page.evaluate(()=>document.querySelector('.host-dialog').style.transform='scale(.74)')
      await page.locator('[data-action="toggle-fullscreen"]').click()
      result.fullscreen=await page.evaluate(()=>({parent:document.querySelector('.ss-fullscreen-root')?.parentElement?.tagName, width:Math.round(document.querySelector('.ss-shell').getBoundingClientRect().width),vh:Math.round(document.querySelector('.ss-shell').getBoundingClientRect().height)}))
      await page.screenshot({path:join(outputDir, 'fullscreen-scaled.png')})
      await page.locator('[data-action="toggle-fullscreen"]').click()
      result.restored=await page.evaluate(()=>({parent:document.querySelector('.ss-modal-theme')?.parentElement?.className, anchor:!!document.createTreeWalker(document.body,NodeFilter.SHOW_COMMENT).nextNode()}))
    }
    if(width===900){
      await page.evaluate(()=>{
        const root=document.documentElement;
        Object.entries({'--lumiverse-bg':'#f8f7fb','--lumiverse-fill':'#ffffff','--lumiverse-fill-subtle':'#ecebf2','--lumiverse-border':'#cac8d3','--lumiverse-text':'#24212e','--lumiverse-text-muted':'#5e5869','--lumiverse-text-dim':'#78727e','--lumiverse-accent':'#5842a4','--lumiverse-primary':'#5842a4','--lumiverse-accent-text':'#ffffff'}).forEach(([k,v])=>root.style.setProperty(k,v))
      })
      result.light=await page.evaluate(()=>{
        const q=x=>getComputedStyle(document.querySelector(x));return {shell:q('.ss-shell').backgroundColor,tune:q('.ss-generation-pane').backgroundColor,controls:q('.ss-tune-group').backgroundColor,text:q('.ss-shell').color,header:q('.ss-topbar').backgroundColor}
      })
      await page.screenshot({path:join(outputDir, 'light-theme.png')})
    }
    if(width===1600){
      await page.locator('[data-action="studio-view"][data-view="styles"]').click()
      await page.waitForTimeout(250)
      await page.locator('[data-action="toggle-lora-folders"][data-role="lora-folder-toggle"]').click()
      const cards=page.locator('.ss-lora-card')
      const first=cards.first()
      result.library=await page.evaluate(()=>{
        const grid=document.querySelector('.ss-lora-grid'),card=grid?.querySelector('.ss-lora-card'),preview=card?.querySelector('.ss-lora-preview');const box=n=>Math.round(n?.getBoundingClientRect().height||0);
        return {count:grid?.children.length,gridClient:grid?.clientHeight,gridScroll:grid?.scrollHeight,cardH:box(card),previewH:box(preview),addVisible:!!card?.querySelector('.ss-add-button'),pagination:document.querySelector('[data-role="lora-page-status"]')?.textContent}
      })
      await page.screenshot({path:join(outputDir, 'styles-desktop.png')})
      if(await page.locator('[data-action="lora-page-next"]').isEnabled()) await page.locator('[data-action="lora-page-next"]').click()
      result.library.next=await page.locator('[data-role="lora-page-status"]').innerText()
      if(await page.locator('[data-action="lora-page-prev"]').isEnabled()) await page.locator('[data-action="lora-page-prev"]').click()
      result.library.return=await page.locator('[data-role="lora-page-status"]').innerText()
    }
    measurements.push(result)
    await page.close()
  }
  for(const sample of measurements) {
    assert.ok(sample.bodyScroll <= sample.viewport, `Page overflow at ${sample.viewport}px`);
    if(sample.stack) assert.ok(sample.stack.cardScrollWidth <= sample.stack.cardWidth, `Stack overflows at ${sample.viewport}px`);
    if(sample.fullscreen) { assert.equal(sample.fullscreen.parent,'BODY');assert.equal(sample.fullscreen.width,1280);assert.equal(sample.fullscreen.vh,900);assert.equal(sample.restored.parent,'host-dialog') }
    if(sample.library) { assert.equal(sample.library.count,60);assert.ok(sample.library.gridScroll > sample.library.gridClient);assert.ok(sample.library.addVisible);assert.match(sample.library.next,/61/); }
    if(sample.light) { assert.equal(sample.light.text,'rgb(36, 33, 46)');assert.equal(sample.light.tune,'rgb(255, 255, 255)'); }
  }
  assert.deepEqual(errors,[],`Unexpected Chromium errors: ${errors}`)
  console.log(JSON.stringify({measurements,errors},null,2))
  console.log('Offline Chromium layout v5: all assertions passed')
} finally{ await browser.close() }
