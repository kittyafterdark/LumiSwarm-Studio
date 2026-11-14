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
      const options=await page.locator('[data-role="appearance-surface"] option').allTextContents()
      assert.ok(options.some(s=>s.includes('Ink')),'Ink surface mode should be offered')
      await page.locator('[data-role="appearance-surface"]').selectOption('flat')
      const values=await page.evaluate(()=>{
        const shell=document.querySelector('.ss-shell');const css=selector=>getComputedStyle(document.querySelector(selector)).backgroundColor
        return {mode:shell.dataset.surfaceMode, canvas:css('.ss-shell'),card:css('.ss-tune-group'),field:css('.ss-shell .ss-tune-group .ss-select'),button:css('.ss-shell .ss-stack-row .ss-stack-actions button'),
          panel:css('.ss-generation-pane'),raised:css('.ss-tune-group'), header:css('.ss-shell .ss-topbar')}
      })
      assert.equal(values.mode,'flat')
      for(const key of ['card','field','panel','raised','header']) assert.equal(values[key],values.canvas,`Ink surface should flatten ${key}`)
      // Independent customization still works in Ink mode. Custom Raised color wins over the preset.
      await page.locator('[data-role="appearance-color"][data-color-key="raised"]').fill('#18252d')
      const custom=await page.evaluate(()=>getComputedStyle(document.querySelector('.ss-tune-group')).backgroundColor)
      assert.equal(custom,'rgb(24, 37, 45)')
      await page.screenshot({path:resolve(output,'v7-ink-settings.png')})
      await page.locator('[data-action="close-settings"]').last().click()
      await page.screenshot({path:resolve(output,'v7-ink-tune.png')})
      console.log('Theme:',values,'custom raised:',custom)
    }
    console.log(`v7 width=${width}:`,JSON.stringify({paneW:stack.paneW,grid:stack.grid,rows:stack.share.map(x=>Math.round(x.y))}))
    await page.close()
  }
  assert.deepEqual(errors,[],'Browser JS errors')
  console.log('v7: adaptive stack actions, SVG strokes, clipped hover, flat surface and overrides: PASS')
} finally { await browser.close() }
