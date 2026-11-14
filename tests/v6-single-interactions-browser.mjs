import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

// Offline fixture: exercises the real compiled extension under Lumiverse's
// body-zoom contract, plus shared LoRA state, grip reordering and catalog UI.
const browserPath = process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined))
const browser = await chromium.launch({...(browserPath ? {executablePath:browserPath} : {}),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']})
const markup = await readFile(resolve('tests/ui-harness.html'),'utf8')
const frontend = await readFile(resolve('dist/frontend.js'),'utf8')
const fixture = markup.replace('import { setup } from "../dist/frontend.js"',frontend.replaceAll('</script','<\\/script'))
const errors=[]
try {
  for (const scale of [.5,.75,1,1.25,1.5]) {
    const page = await browser.newPage({viewport:{width:1280,height:900}})
    page.on('pageerror',error=>errors.push(`${scale}x: ${error.message}`))
    await page.setContent(fixture)
    await page.locator('.ss-shell').waitFor()
    await page.addStyleTag({content:`:root { --lumiverse-ui-scale:${scale}; --app-scaled-viewport-width:calc(100vw / var(--lumiverse-ui-scale)); --app-scaled-viewport-height:calc(100dvh / var(--lumiverse-ui-scale)); --app-interactive-viewport-height:var(--app-scaled-viewport-height); } body { zoom:var(--lumiverse-ui-scale); width:var(--app-scaled-viewport-width); }`})
    // Host test fixture is intentionally less sophisticated than Spindle's
    // scale-clamped modal, so invoke the native button handler directly.
    await page.locator('[data-action="toggle-fullscreen"]').evaluate(button=>button.click())
    const box = await page.evaluate(()=>{
      const root=document.querySelector('.ss-fullscreen-root')
      const shell=root?.querySelector('.ss-shell')
      const a=root?.getBoundingClientRect(), b=shell?.getBoundingClientRect()
      return {parent:root?.parentElement?.tagName,root:{x:a?.x,y:a?.y,w:a?.width,h:a?.height},shell:{w:b?.width,h:b?.height}}
    })
    assert.equal(box.parent,'BODY')
    for (const [key,value] of Object.entries({x:0,y:0,w:1280,h:900})) assert.ok(Math.abs(box.root[key]-value)<1,`Zoom ${scale} ${key} should be ${value}, got ${box.root[key]}`)
    assert.ok(Math.abs(box.shell.w-1280)<1 && Math.abs(box.shell.h-900)<1)
    await page.locator('[data-action="toggle-fullscreen"]').evaluate(button=>button.click())
    assert.equal(await page.locator('.host-dialog .ss-shell').count(),1,'Fullscreen must restore host dialog ownership')
    await page.close()
  }

  const page = await browser.newPage({viewport:{width:1440,height:900}})
  page.on('pageerror',error=>errors.push(`desktop: ${error.message}`))
  await page.setContent(fixture)
  await page.locator('.ss-shell').waitFor()
  await page.locator('[data-action="studio-view"][data-view="styles"]').click()
  if (await page.locator('[data-role="lora-folder-sidebar"]').isVisible()) await page.locator('[data-role="lora-folder-toggle"]').click()
  for (let i=0;i<2;i++) await page.locator('.ss-lora-card .ss-add-button:enabled').first().click()
  const rows=page.locator('[data-role="stack-list"] .ss-stack-row')
  const before=await rows.evaluateAll(nodes=>nodes.map(node=>node.dataset.stackName))
  assert.ok(before.length>=2)
  assert.equal(await page.locator('.ss-stack-row [data-action="move-stack-up"], .ss-stack-row [data-action="move-stack-down"]').count(),0)
  const grip=rows.first().locator('.ss-stack-drag')
  await grip.focus();await grip.press('ArrowDown')
  const after=await rows.evaluateAll(nodes=>nodes.map(node=>node.dataset.stackName))
  assert.equal(after[1],before[0], 'Grip ArrowDown should reorder the actual stack')
  const card=page.locator('.ss-lora-card').first()
  const buttons=await card.evaluate(node=>({add:node.querySelector('.ss-add-button')?.getBoundingClientRect().height,more:node.querySelector('.ss-lora-more')?.getBoundingClientRect().height}))
  assert.equal(buttons.add,29);assert.equal(buttons.more,29)
  await card.locator('.ss-lora-more').click()
  assert.equal(await page.locator('[data-role="lora-meta-layer"]:not([hidden])').count(),1)
  await page.keyboard.press('Escape')
  assert.equal(await page.locator('[data-role="lora-meta-layer"]:not([hidden])').count(),0)
  assert.equal(await page.locator('details.ss-style-more').getAttribute('open'),null,'Style menu starts closed')
  const icon=await page.locator('[data-role="lora-folder-toggle"] svg').evaluate(svg=>({fill:getComputedStyle(svg).fill,stroke:getComputedStyle(svg).stroke}))
  assert.equal(icon.fill,'none','Outline icons should not turn into black-filled shapes')
  assert.notEqual(icon.stroke,'none')
  assert.equal(await page.locator('.ss-styles-resizer').count(),2,'Styles has both persistent dividers')
  await page.locator('[data-action="studio-view"][data-view="generate"]').click()
  const advancedGap=await page.evaluate(()=>document.querySelector('.ss-advanced').getBoundingClientRect().top-document.querySelector('.ss-init-group').getBoundingClientRect().bottom)
  assert.ok(advancedGap>=10,`Tune's Advanced gap was ${advancedGap}px`)
  await page.close()

  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true})
  mobile.on('pageerror',error=>errors.push(`mobile: ${error.message}`))
  await mobile.setContent(fixture)
  await mobile.locator('.ss-shell').waitFor()
  await mobile.locator('[data-action="mobile-tab"][data-tab="loras"]').click()
  if (await mobile.locator('[data-role="lora-folder-sidebar"]').isVisible()) await mobile.locator('[data-role="lora-folder-toggle"]').click()
  for (let i=0;i<2;i++) await mobile.locator('.ss-lora-card .ss-add-button:enabled').first().click()
  await mobile.locator('[data-action="mobile-tab"][data-tab="stack"]').click()
  const mobileRows=mobile.locator('[data-role="stack-list"] .ss-stack-row')
  const old=await mobileRows.evaluateAll(nodes=>nodes.map(node=>node.dataset.stackName))
  assert.ok(old.length>=2)
  const handle=await mobileRows.first().locator('.ss-stack-drag').boundingBox()
  const next=await mobileRows.nth(1).boundingBox()
  const x=handle.x+handle.width/2, start=handle.y+handle.height/2, end=next.y+next.height*.7
  const cdp=await mobile.context().newCDPSession(mobile)
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:start}]})
  for(let i=1;i<=9;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:start+(end-start)*i/9}]})
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  const current=await mobileRows.evaluateAll(nodes=>nodes.map(node=>node.dataset.stackName))
  assert.notEqual(current[0],old[0],'Touch drag must change stack ordering')
  assert.deepEqual([...current].sort(),[...old].sort(),'Touch drag must not duplicate/remove entries')
  await mobile.close()
  assert.deepEqual(errors,[],'No browser errors')
  console.log('Swarm Studio v6: host body zoom 50–150%, grip keyboard/touch drag, compact Add, metadata, SVG, and Tune spacing: ok')
} finally { await browser.close() }
