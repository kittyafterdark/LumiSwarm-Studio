import assert from 'node:assert/strict'
import { readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { runInNewContext } from 'node:vm'
import { chromium } from 'playwright'

// Real Chromium layout/bitmap decoding; no SwarmUI or host connection is used.
const frontend = await readFile(new URL('../dist/frontend.js', import.meta.url))
const cssSource = await readFile(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const css = runInNewContext(cssSource + '; STYLES + STUDIO_V3_STYLES')
const server = createServer((req, res) => {
  if (req.url === '/frontend.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(frontend)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<!doctype html><html><head></head><body><div id="root" style="height:900px"></div></body></html>')
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
if (process.env.STUDIO_SCREENSHOT_DIR) await mkdir(process.env.STUDIO_SCREENSHOT_DIR, {recursive:true})
let browser
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://127.0.0.1:${server.address().port}`)
  await page.addStyleTag({ content: css })
  await page.evaluate(async () => {
    const { StudioController, defaultStudioBehavior } = await import('/frontend.js')
    const root = document.querySelector('#root')
    root.style.fontFamily = 'Arial, sans-serif'
    root.style.setProperty('--lumiverse-fill-subtle', 'transparent')
    for (const [name,value] of Object.entries({'--lumiverse-text':'#e8e9ef','--lumiverse-text-muted':'#a0a3b1','--lumiverse-text-dim':'#7b7f91','--lumiverse-border':'#30323a','--lumiverse-bg':'#101117','--lumiverse-accent':'#a4a2f8'})) root.style.setProperty(name,value)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 4
    const nativeDecode = HTMLImageElement.prototype.decode
    let release
    const gate = new Promise(resolve => { release = resolve })
    const diagnostic = window.diagnostic = { responses: 0, decoded: 0, disconnects: 0, renders: 0, release }
    HTMLImageElement.prototype.decode = async function () {
      await nativeDecode.call(this)
      diagnostic.decoded++
      await gate
    }
    let controller
    controller = new StudioController({ sendToBackend(message) {
      if (message.type !== 'preview') return
      canvas.getContext('2d').fillStyle = `hsl(${Number(message.name.split('-')[1]) * 6} 80% 50%)`
      canvas.getContext('2d').fillRect(0, 0, 4, 4)
      const bitmap = canvas.toDataURL()
      setTimeout(() => {
        controller.onMessage({ type: 'preview_result', requestId: message.requestId, name: message.name, dataUrl: bitmap })
        diagnostic.responses++
      }, 20 + Number(message.name.split('-')[1]) % 10 * 15)
    } }, { root }, () => {}, () => {}, defaultStudioBehavior(), () => {})
    controller.state.connection = { id: 'mock' }
    root.querySelector('[data-role="lora-filter"]').value = 'all'
    controller.state.loras = Array.from({ length: 60 }, (_, i) => ({ name: `model-${i}`, title: `LoRA ${i}`, previewRef: 'preview.png', tags: [], defaultWeight: 1, triggerPhrase: '', architecture: 'sdxl' }))
    controller.setStudioView('styles')
    const cards = [...root.querySelectorAll('.ss-lora-card')]
    diagnostic.cards = cards
    diagnostic.controller = controller
    diagnostic.observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.removedNodes) {
        diagnostic.disconnects += cards.filter(card => node === card || node.contains?.(card)).length
      }
    })
    diagnostic.observer.observe(root, { subtree: true, childList: true })
    const render = controller.renderLoras.bind(controller)
    controller.renderLoras = () => { diagnostic.renders++; render() }
    // Hydrate the whole initial page, including cards below the viewport.
    for (const lora of controller.state.loras) {
      controller.requestedPreviews.add(lora.name)
      controller.send('preview', { connectionId: 'mock', name: lora.name, previewRef: lora.previewRef })
    }
  })
  await page.waitForFunction(() => diagnostic.responses === 60 && diagnostic.decoded === 60)
  const before = await page.evaluate(() => ({
    count: diagnostic.cards.length,
    pending: diagnostic.cards.every(card => {
      const img = card.querySelector('img')
      return img.getAttribute('src') === null && getComputedStyle(img).opacity === '0'
        && getComputedStyle(card.querySelector('.ss-lora-placeholder')).visibility === 'visible'
    }),
    background: getComputedStyle(document.querySelector('.ss-lora-folder-sidebar')).backgroundColor,
    geometry: diagnostic.cards.map(card => { const r = card.getBoundingClientRect(); return [r.x,r.y,r.width,r.height] }),
  }))
  assert.equal(before.count, 60)
  assert.equal(before.pending, true, 'Placeholders remain visible until decode completes')
  assert.equal(before.background, 'rgb(20, 21, 26)', 'Transparent theme still has an opaque folder surface')
  await page.evaluate(() => diagnostic.release())
  await page.waitForFunction(() => diagnostic.cards.every(card => card.querySelector('img').dataset.loaded === 'true'))
  const after = await page.evaluate(() => ({
    disconnects: diagnostic.disconnects,
    renders: diagnostic.renders,
    identity: diagnostic.cards.every((card, i) => card.isConnected && document.querySelectorAll('.ss-lora-card')[i] === card),
    decoded: diagnostic.cards.every(card => { const img = card.querySelector('img'); return img.naturalWidth === 4 && getComputedStyle(img).opacity === '1' }),
    geometry: diagnostic.cards.map(card => { const r = card.getBoundingClientRect(); return [r.x,r.y,r.width,r.height] }),
  }))
  assert.equal(after.disconnects, 0)
  assert.equal(after.renders, 0, 'Preview responses must never call renderLoras')
  assert.equal(after.identity, true)
  assert.equal(after.decoded, true)
  assert.deepEqual(after.geometry, before.geometry, 'Thumbnail arrival must not shift card geometry')
  // The same mounted components compose six exclusive mobile screens.
  await page.evaluate(() => {
    diagnostic.prompt = document.querySelector('[data-role="positive"]')
    diagnostic.prompt.value = 'mobile draft'
    diagnostic.styleInput = document.querySelector('[data-role="style-name"]')
    diagnostic.styleInput.value = 'Unsaved mobile Style'
    diagnostic.controller.addLora(diagnostic.controller.state.loras[0])
    diagnostic.stackRow = document.querySelector('[data-role="stack-list"]').firstElementChild
    document.documentElement.style.setProperty('--app-interactive-safe-top','24px')
  })
  for (const width of [360, 430, 720]) {
    await page.setViewportSize({ width, height: 850 })
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.ss-view-nav')).display === 'none')
    for (const tab of ['create','generation','style','loras','stack','history','loras','style']) {
      await page.locator(`[data-tab="${tab}"]`).click()
      if (width === 430 && process.env.STUDIO_SCREENSHOT_DIR) await page.screenshot({path:join(process.env.STUDIO_SCREENSHOT_DIR, `${tab}.png`)})
      const state = await page.evaluate(() => {
        const visible = node => node.checkVisibility()
        const nav = document.querySelector('.ss-mobile-tabs')
        const panes = [...document.querySelectorAll('[data-mobile-pane]')].filter(visible).map(node=>node.dataset.mobilePane)
        return {
          panes: [...new Set(panes)],
          tabs: [...nav.querySelectorAll('button')].map(button=>button.textContent),
          singleRow: new Set([...nav.querySelectorAll('button')].map(button=>button.offsetTop)).size === 1,
          noOverflow: document.querySelector('.ss-shell').scrollWidth <= innerWidth,
          draft: diagnostic.styleInput.value,
          identity: diagnostic.cards.every(card=>card.isConnected) && diagnostic.prompt === document.querySelector('[data-role="positive"]') && diagnostic.stackRow === document.querySelector('[data-role="stack-list"]').firstElementChild,
          initVisible: visible(document.querySelector('.ss-init-panel')),
          top: document.querySelector('.ss-shell').getBoundingClientRect().top,
        }
      })
      assert.deepEqual(state.panes,[tab],`${width}px ${tab} shows only its pane`)
      assert.deepEqual(state.tabs,['Create','Tune','Style','LoRAs','Stack','History'])
      assert.equal(state.singleRow,true)
      assert.equal(state.noOverflow,true,`${width}px ${tab} has no horizontal page overflow`)
      assert.equal(state.draft,'Unsaved mobile Style')
      assert.equal(state.identity,true)
      assert.equal(state.initVisible,tab==='create')
      assert.equal(state.top,24)
    }
    await page.locator('[data-tab="style"]').click()
    assert.equal(await page.locator('[data-action="style-duplicate"]').isVisible(),false)
    await page.locator('.ss-style-more > summary').click()
    assert.equal(await page.locator('[data-action="style-duplicate"]').isVisible(),true)
    await page.locator('[data-tab="loras"]').click()
    const beforeScroll = await page.locator('.ss-mobile-tabs').boundingBox()
    await page.evaluate(()=>document.querySelector('.ss-styles-workspace').scrollTop=1000)
    assert.deepEqual(await page.locator('.ss-mobile-tabs').boundingBox(),beforeScroll,'Navigation stays beneath the header while content scrolls')
  }
  await page.setViewportSize({width:1440,height:1000})
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-style-column]')].every(node=>node.checkVisibility()))
  assert.equal(await page.locator('.ss-view-nav').isVisible(),true)
  assert.equal(await page.locator('[data-action="style-duplicate"]').isVisible(),true)
  assert.equal(await page.evaluate(()=>diagnostic.cards.every(card=>card.isConnected)),true)
  assert.equal(await page.evaluate(()=>diagnostic.disconnects),0,'Mobile switching must never detach library cards')
  console.log('Chromium mobile: six isolated panes at 360/430/720px, persistent drafts/cards/rows, pinned tabs, overflow actions and desktop restoration: ok')
  await page.setViewportSize({width:360,height:850})
  await page.reload()
  await page.addStyleTag({content:css})
  await page.evaluate(async()=>{
    const {StudioController,defaultStudioBehavior}=await import('/frontend.js')
    window.mobileController=new StudioController({sendToBackend(){}},{root:document.querySelector('#root')},()=>{},()=>{},defaultStudioBehavior(),()=>{})
  })
  const initialMobile = await page.evaluate(()=>({
    tab:document.querySelector('.ss-shell').dataset.mobileTab,
    panes:[...new Set([...document.querySelectorAll('[data-mobile-pane]')].filter(node=>node.checkVisibility()).map(node=>node.dataset.mobilePane))],
  }))
  assert.deepEqual(initialMobile.panes,[initialMobile.tab],'Fresh mobile mount restores exactly one pane')
  // Simulate safe insets and a shortened VisualViewport; this is geometry coverage, not iPhone hardware QA.
  for (const geometry of [
    {width:390,height:844,visible:844,offset:0,safe:59,bottom:34},
    {width:390,height:844,visible:414,offset:0,safe:59,bottom:34},
    {width:390,height:844,visible:360,offset:70,safe:59,bottom:34},
    {width:667,height:390,visible:390,offset:0,safe:0,bottom:21},
  ]) {
    await page.setViewportSize({width:geometry.width,height:geometry.height})
    const bounds=await page.evaluate(g=>{
      const viewport=new EventTarget()
      Object.assign(viewport,{height:g.visible,offsetTop:g.offset})
      Object.defineProperty(window,'visualViewport',{configurable:true,value:viewport})
      const shell=document.querySelector('.ss-shell')
      shell.style.setProperty('--studio-safe-top',`${g.safe}px`)
      shell.style.setProperty('--studio-safe-bottom',`${g.bottom}px`)
      mobileController.updatePresetViewport()
      const modal=document.querySelector('[data-role="save-preset-modal"]')
      modal.hidden=false
      const fields=modal.querySelector('.ss-save-preset-fields')
      if (!fields.querySelector('.diagnostic-fields')) {
        const extra=document.createElement('div');extra.className='diagnostic-fields';extra.style.height='1200px';fields.appendChild(extra)
      }
      document.querySelector('[data-role="save-preset-name"]').focus()
      const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}}
      return {card:rect(modal.querySelector('.ss-workflow-modal-card')),close:rect(modal.querySelector('[data-action="close-save-preset"]')),save:rect(modal.querySelector('[data-action="confirm-save-preset"]')),scrollable:fields.scrollHeight>fields.clientHeight}
    },geometry)
    assert.ok(bounds.card.top>=Math.max(geometry.safe,geometry.offset)+12)
    assert.ok(bounds.save.bottom<=geometry.offset+geometry.visible-12)
    assert.ok(bounds.close.top>=Math.max(geometry.safe,geometry.offset))
    assert.ok(bounds.card.right<=geometry.width-12)
    assert.ok(bounds.scrollable,'Preset fields scroll while close/save controls remain visible')
  }
  console.log('Preset modal simulated safe-area/keyboard/landscape geometry: ok (no physical iPhone test)')
  assert.deepEqual(errors, [])
  console.log('Chromium: 60 delayed decoded previews, zero card disconnects, zero library renders, stable geometry, opaque folders: ok')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
