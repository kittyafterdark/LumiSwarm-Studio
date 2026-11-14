import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const executable = process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/chromium')
const browser = await chromium.launch({executablePath: executable, headless:true, args:['--no-sandbox','--disable-dev-shm-usage']})
const html = await readFile(resolve('tests/ui-harness.html'),'utf8')
const js = await readFile(resolve('dist/frontend.js'),'utf8')
const fixture = html.replace('import { setup } from "../dist/frontend.js"',js.replaceAll('</script','<\\/script'))
const output = resolve('docs/screenshots')
await mkdir(output,{recursive:true})
const errors=[]
try {
  for (const width of [360,390,1440]) {
    const page = await browser.newPage({viewport:{width,height:900}})
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`))
    await page.setContent(fixture)
    await page.locator('.ss-shell').waitFor()
    if(width<=720) await page.locator('[data-action="mobile-tab"][data-tab="stack"]').click()
    else await page.locator('[data-action="studio-view"][data-view="styles"]').click()

    const stack = await page.evaluate(()=>{
      const tools=[...document.querySelectorAll('.ss-style-stack-column .ss-stack-share-tools .ss-button')]
      const head=[...document.querySelectorAll('.ss-style-stack-column .ss-stack-head-tools > *')]
      const boxes=nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})
      return {share:boxes(tools),head:boxes(head),paneW:document.querySelector('.ss-stack-pane')?.getBoundingClientRect().width, grid:getComputedStyle(document.querySelector('.ss-stack-share-tools')).gridTemplateColumns,
        shareIcon: (()=>{const svg=tools[0].querySelector('svg');const css=getComputedStyle(svg);return {fill:css.fill,stroke:css.stroke}})(),
        folderIcon:(()=>{const svg=document.querySelector('.ss-lora-folder-row svg');const css=getComputedStyle(svg);return {fill:css.fill,stroke:css.stroke}})()
      }
    })
    assert.equal(stack.shareIcon.fill,'none','Import icons should be stroked, not black-filled')
    assert.notEqual(stack.shareIcon.stroke,'none')
    assert.equal(stack.folderIcon.fill,'none','Folder icons should be stroked')
    assert.notEqual(stack.folderIcon.stroke,'none')
    if(stack.paneW<425){
      assert.ok(Math.abs(stack.share[0].y-stack.share[1].y)<1,'Import and Export must share first row')
      assert.ok(stack.share[2].y>stack.share[0].y+10,'Apply and Clear must occupy second row')
      assert.ok(Math.abs(stack.share[2].y-stack.share[3].y)<1,'Apply and Clear should align')
      assert.ok(stack.share.every(x=>x.w>65),'Each button needs an accessible width')
      assert.ok(stack.head[1].y>stack.head[0].y,'Preset buttons must start below the full-width picker')
      assert.ok(Math.abs(stack.head[1].y-stack.head[3].y)<1,'Load, Save, Delete must align')
    }
    // Metadata viewer must render both labels and values (appendChild only accepts one node).
    await page.locator('.ss-style-stack-column .ss-stack-row .ss-stack-actions .ss-icon-button').first().click()
    const metadata=await page.locator('.ss-lora-meta-dialog').evaluate(node=>({dt:node.querySelectorAll('dt').length,dd:node.querySelectorAll('dd').length}))
    assert.ok(metadata.dt>=3 && metadata.dt===metadata.dd,'Metadata terms and values must both render')
    await page.keyboard.press('Escape')
    await page.screenshot({path:resolve(output,`v7-stack-${width}.png`)})
    if(width<=390){
      await page.locator('[data-action="toggle-config"]').click()
      await page.locator('[data-action="settings-tab"][data-settings-tab="theme"]').click()
      await page.locator('.ss-image-scale-grid').scrollIntoViewIfNeeded()
      const mobileSize=await page.locator('.ss-image-scale-grid').evaluate(grid=>{
        const outer=grid.getBoundingClientRect()
        const items=[...grid.querySelectorAll('.ss-image-scale-button')].map(item=>{const r=item.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,right:r.right}})
        return {outer:{x:outer.x,right:outer.right},items,scrollWidth:grid.scrollWidth,clientWidth:grid.clientWidth}
      })
      assert.equal(mobileSize.items.length,3)
      assert.ok(mobileSize.items.every(b=>Math.abs(b.y-mobileSize.items[0].y)<1),'Mobile image sizes must share one row')
      assert.ok(mobileSize.items[2].right<=mobileSize.outer.right+1,'Third size may not escape its container')
      assert.ok(mobileSize.items.every(b=>b.w>=60),'All sizes need usable widths')
      assert.ok(mobileSize.scrollWidth<=mobileSize.clientWidth+1,'Three-column grid cannot overflow horizontally')
      await page.screenshot({path:resolve(output,`v8-image-size-${width}.png`)})
      await page.locator('[data-action="close-settings"]').last().click()
      console.log('Mobile image size:',width,mobileSize)
    }
    if(width===1440){
      await page.locator('[data-action="studio-view"][data-view="generate"]').click()
      await page.locator('.ss-tune-group[data-tune-group="model"] > summary').hover()
      const tune = await page.evaluate(()=>{
        const parent=document.querySelector('.ss-tune-group'), summary=parent.querySelector('summary');const css=getComputedStyle(parent);const header=getComputedStyle(summary)
        return {clip:css.overflowX,round:css.borderTopLeftRadius,headerRound:header.borderTopLeftRadius}
      })
      assert.equal(tune.clip,'clip','Hover fills must be clipped by the card squircle')
      assert.notEqual(tune.headerRound,'0px')
      await page.screenshot({path:resolve(output,'v7-tune-hover.png')})
      await page.locator('[data-action="toggle-config"]').click()
      await page.locator('[data-action="settings-tab"][data-settings-tab="theme"]').click()
      assert.equal(await page.locator('[data-role="appearance-surface"]').count(),0,'Surface dropdown must be replaced')
      assert.equal(await page.locator('[data-role="appearance-opacity"]').count(),0,'Inert opacity must not be offered')
      assert.equal(await page.locator('[data-role="appearance-color"]').count(),10,'All ten settings must have color swatches')
      console.log('Swatch samples:',await page.locator('[data-role="appearance-color"]').evaluateAll(inputs=>inputs.map(el=>({key:el.dataset.colorKey,value:el.value}))))
      const swatches=await page.locator('[data-role="appearance-color"]').evaluateAll(nodes=>nodes.map(input=>({radius:getComputedStyle(input).borderRadius,inner:getComputedStyle(input,'::-webkit-color-swatch').borderRadius})))
      assert.ok(swatches.every(s=>s.radius==='50%' && s.inner==='50%'),'Native color chips must be circular')
      const size=await page.locator('.ss-image-scale-button').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,right:r.right}}))
      assert.equal(size.length,3)
      assert.ok(size.every(x=>Math.abs(x.y-size[0].y)<1),'Inline image sizes must share one three-column row')
      assert.ok(size[0].x < size[1].x && size[1].x < size[2].x,'Sizes should read left to right')
      const before=await page.evaluate(()=>({panel:getComputedStyle(document.querySelector('.ss-generation-pane')).backgroundColor,card:getComputedStyle(document.querySelector('.ss-tune-group')).backgroundColor,field:getComputedStyle(document.querySelector('.ss-tune-group .ss-select')).backgroundColor}))
      await page.locator('[data-role="appearance-color"][data-color-key="surface"]').fill('#17191b')
      const values=await page.evaluate(()=>{
        const shell=document.querySelector('.ss-shell');const css=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor
        return {mode:shell.dataset.surfaceMode,panel:css('.ss-generation-pane'),card:css('.ss-tune-group'),field:css('.ss-tune-group .ss-select'),header:css('.ss-shell .ss-topbar')}
      })
      assert.equal(values.mode,'host','Swatch should replace any legacy neutral/ink mode')
      assert.equal(values.panel,'rgb(23, 25, 27)','The Surface swatch must drive the base panel fill')
      for(const key of ['card','field']) assert.notEqual(values[key],before[key],`Surface should affect ${key}`)
      // A specific component color remains authoritative, even when the base surface changes.
      await page.locator('[data-role="appearance-color"][data-color-key="raised"]').fill('#18252d')
      await page.locator('[data-role="appearance-color"][data-color-key="surface"]').fill('#303038')
      const custom=await page.evaluate(()=>({card:getComputedStyle(document.querySelector('.ss-tune-group')).backgroundColor,panel:getComputedStyle(document.querySelector('.ss-generation-pane')).backgroundColor}))
      assert.equal(custom.card,'rgb(24, 37, 45)')
      assert.equal(custom.panel,'rgb(48, 48, 56)')
      await page.screenshot({path:resolve(output,'v8-circular-swatches.png')})
      await page.locator('[data-action="close-settings"]').last().click()
      await page.screenshot({path:resolve(output,'v8-surface-tune.png')})
      console.log('Theme surface:',values,'override:',custom,'size buttons:',size)
    }
    console.log(`v7 width=${width}:`,JSON.stringify({paneW:stack.paneW,grid:stack.grid,rows:stack.share.map(x=>Math.round(x.y))}))
    await page.close()
  }
  assert.deepEqual(errors,[],'Browser JS errors')
  console.log('v8: stack actions, SVG strokes, clipped hover, circular swatches and three inline sizes: PASS')
} finally { await browser.close() }
