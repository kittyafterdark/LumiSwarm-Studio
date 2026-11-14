import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const executable = process.env.STUDIO_CHROMIUM_PATH || (existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/chromium')
const browser = await chromium.launch({executablePath: executable, headless: true, args: ['--no-sandbox','--disable-dev-shm-usage']})
const fixture = (await readFile(resolve('tests/ui-harness.html'),'utf8'))
  .replace('Array.from({ length: 32 }', 'Array.from({ length: 1435 }')
  .replace('const number = 32 - index', 'const number = 1435 - index')
  .replace('import { setup } from "../dist/frontend.js"', (await readFile(resolve('dist/frontend.js'),'utf8')).replaceAll('</script','<\\/script'))
const screenshots = resolve('docs/screenshots')
await mkdir(screenshots,{recursive:true})
const errors=[]
const sizes=[{width:1600,height:900},{width:720,height:900},{width:390,height:844},{width:360,height:780}]
try {
  for (const size of sizes) {
    const page = await browser.newPage({viewport:size, deviceScaleFactor:1})
    page.on('pageerror',e=>errors.push(`${size.width}px: ${e.message}`))
    await page.setContent(fixture)
    await page.locator('.ss-shell').waitFor()
    await page.locator('[data-action="open-output-library"]').first().click()
    const library=page.locator('[data-role="output-library"]')
    await page.locator('.ss-library-folder-card').first().waitFor()
    await page.waitForFunction(()=>document.querySelector('[data-role="library-folder-grid"]')?.textContent?.includes('1435 images'))
    const landing=await page.evaluate(()=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}}
      const grid=document.querySelector('[data-role="library-folder-grid"]')
      const all=grid.querySelector('[data-folder-id=""]')
      const previews=[...all.querySelectorAll('img')]
      return {grid:rect(grid),all:rect(all),preview:rect(all.querySelector('.ss-library-folder-preview')),images:previews.map(rect),cardCount:grid.querySelectorAll('.ss-library-folder-card').length,bodyOverflow:document.documentElement.scrollWidth>innerWidth+1,visible:!document.querySelector('[data-role="output-library"]').hidden}
    })
    assert.equal(landing.cardCount,4,`Four expected folders at ${size.width}px`)
    assert.equal(landing.images.length,4)
    assert.ok(landing.all.h>=145 && landing.all.h<=260,`All outputs folder card must remain compact at ${size.width}px: ${JSON.stringify(landing.all)}`)
    assert.ok(landing.preview.h<=160 && landing.preview.h>=100)
    for (const img of landing.images) {
      assert.ok(img.h>25 && img.h<100,`Collage image must be cropped to cell, not full portrait: ${JSON.stringify(img)}`)
      assert.ok(img.w>20 && img.w<landing.preview.w, 'Collage image width must be constrained')
    }
    assert.equal(landing.bodyOverflow,false,'Library must not cause page-level horizontal overflow')
    if (size.width===1600) await page.screenshot({path:resolve(screenshots,'v10-library-folders-desktop.png')})
    if (size.width===390) await page.screenshot({path:resolve(screenshots,'v10-library-folders-mobile.png')})

    await page.locator('.ss-library-folder-card[data-folder-id=""]').click()
    await page.locator('.ss-library-output').first().waitFor()
    const pageSize=size.width<=720?15:30
    assert.equal(await page.locator('.ss-library-output').count(),pageSize,`Page size at ${size.width}px`)
    const collection=await page.evaluate(()=>{
      const grid=document.querySelector('[data-role="library-grid"]')
      const tile=grid.querySelector('.ss-library-output')
      const image=tile.querySelector('img')
      const r=e=>{const {x,y,width,height,right}=e.getBoundingClientRect();return {x,y,width,height,right}}
      return {grid:r(grid),tile:r(tile),image:r(image),scrollHeight:grid.scrollHeight,clientHeight:grid.clientHeight,bodyOverflow:document.documentElement.scrollWidth>innerWidth+1}
    })
    assert.ok(Math.abs(collection.image.width-collection.image.height)<=2,`Image tile must remain square at ${size.width}px: ${JSON.stringify(collection)}`)
    assert.ok(collection.tile.height<400,`Image tile must not expand to natural image height`)
    assert.equal(collection.bodyOverflow,false)
    if (size.width===1600) await page.screenshot({path:resolve(screenshots,'v10-library-grid-desktop.png')})
    if (size.width===390) await page.screenshot({path:resolve(screenshots,'v10-library-grid-mobile.png')})
    await page.evaluate(()=>document.querySelector('[data-role="library-grid"]').scrollTop=500)
    await page.locator('[data-action="library-next"]').click()
    await page.waitForFunction(()=>document.querySelector('[data-role="library-page"]')?.textContent?.startsWith('2 /'))
    const nextScroll=await page.locator('[data-role="library-grid"]').evaluate(el=>el.scrollTop)
    assert.equal(nextScroll,0,'New output-library page must begin at the first row')
    const nextImage=await page.locator('.ss-library-output img').first().getAttribute('alt')
    assert.equal(nextImage,`swarm-output-${1435-pageSize}.png`)
    await page.locator('[data-action="toggle-library-selection"]').click()
    await page.locator('[data-action="select-library-page"]').click()
    assert.ok((await page.locator('[data-role="library-selection-count"]').textContent()).includes(`${pageSize} selected`))
    await page.locator('[data-action="library-back"]').click()
    assert.equal(await page.locator('.ss-library-folder-card').count(),4)
    await page.locator('.ss-library-folder-card[data-folder-id="character:char-1"]').click()
    await page.locator('[data-action="open-visual-profile"]').click()
    assert.equal(await page.locator('[data-role="library-visual-profile"]').isVisible(),true)
    await page.locator('[data-action="close-visual-profile"]').first().click()
    assert.equal(await page.locator('[data-role="library-visual-profile"]').isVisible(),false)
    assert.equal(await library.isVisible(),true)
    await page.locator('[data-action="close-output-library"]').click()
    assert.equal(await library.isVisible(),false)
    console.log(`Library ${size.width}x${size.height}: folders=${landing.cardCount}, collage=${landing.images.length}, tile=${Math.round(collection.image.width)}px, page=${pageSize}, navigation/selection/dialogs PASS`)
    await page.close()
  }
  assert.deepEqual(errors,[],'No JavaScript errors from actual compiled extension')
  console.log('Output Library v10 real Chromium integration: PASS')
} finally { await browser.close() }
