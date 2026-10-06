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
  const gallery=[]
  let avatarUploads=0,personaUploads=0
  await page.route('**/api/v1/personas/**',async route=>{
    assert.match(route.request().postData(),/name="original_avatar"/)
    personaUploads++
    await route.fulfill({contentType:'application/json',body:'{"id":"persona"}'})
  })
  await page.route('**/api/v1/characters/**',async route=>{
    const request=route.request(),url=request.url()
    if(url.endsWith('/gallery/link'))gallery.push({image_id:request.postDataJSON().image_id})
    if(url.endsWith('/avatar')) {
      assert.match(request.postData(),/name="original_avatar"/)
      avatarUploads++
    }
    await route.fulfill({contentType:'application/json',body:JSON.stringify(url.endsWith('/gallery')?gallery:{id:'char'})})
  })
  await page.route('**/api/v1/images/saved-*',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')}))
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
    window.testMessages=[]
    window.mobileController=new StudioController({sendToBackend(message){testMessages.push(message)}},{root:document.querySelector('#root')},()=>{},()=>{},defaultStudioBehavior(),()=>{})
  })
  const initialMobile = await page.evaluate(()=>({
    tab:document.querySelector('.ss-shell').dataset.mobileTab,
    panes:[...new Set([...document.querySelectorAll('[data-mobile-pane]')].filter(node=>node.checkVisibility()).map(node=>node.dataset.mobilePane))],
  }))
  assert.deepEqual(initialMobile.panes,[initialMobile.tab],'Fresh mobile mount restores exactly one pane')
  // Simulate the host's dialog reset: native UA margin defaults cannot be relied on.
  await page.addStyleTag({content:'dialog { margin: 0; }'})
  const assertCentered=async(selector)=>{
    const box=await page.locator(selector).boundingBox(), viewport=page.viewportSize()
    assert.ok(Math.abs(box.x+box.width/2-viewport.width/2)<2,`${selector} centered horizontally`)
    assert.ok(Math.abs(box.y+box.height/2-viewport.height/2)<2,`${selector} centered vertically`)
  }
  // Exercise the character actions using controlled host API fixtures, never personal character data.
  await page.evaluate(()=>{
    mobileController.state.permissions={characters:true,personas:true,images:true}
    mobileController.state.chatVisuals={activePersona:{id:'persona',name:'Fixture persona'}}
    mobileController.state.activeChat={id:'chat',character_id:'char'}
    mobileController.setCurrentImage({id:'saved-one',src:'/api/v1/images/saved-one',label:'Test output'})
    mobileController.openInspector()
  })
  const avatarGroup=await page.locator('.ss-set-as-group').evaluate(node=>{
    const group=node.getBoundingClientRect(), label=node.querySelector('.ss-set-as-label')
    return {width:group.width,parentWidth:node.parentElement.getBoundingClientRect().width,fontSize:parseFloat(getComputedStyle(label).fontSize),labelY:label.getBoundingClientRect().bottom,buttonY:node.querySelector('button').getBoundingClientRect().top}
  })
  assert.ok(avatarGroup.width>=avatarGroup.parentWidth-2,'Set as group spans the action grid')
  assert.ok(avatarGroup.fontSize>=14 && avatarGroup.labelY<avatarGroup.buttonY,'Readable label above both targets')
  await page.locator('[data-action="set-character-picture"]').click()
  await page.locator('[data-crop="apply"]').waitFor()
  await assertCentered('.ss-avatar-crop')
  await page.waitForFunction(()=>document.querySelector('[data-crop="apply"]')?.disabled === false)
  assert.equal(avatarUploads,0,'Opening the crop must not upload')
  await page.keyboard.press('Escape')
  await page.waitForFunction(()=>!mobileController.characterImageActionPending)
  assert.equal(avatarUploads,0,'Escape cancels without modifying the avatar')
  assert.equal(await page.locator('[data-action="set-character-picture"]').evaluate(node=>node===document.activeElement),true,'Cancel restores focus')
  assert.equal(await page.locator('[data-role="inspector"]').isVisible(),true)
  await page.locator('[data-action="set-character-picture"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-crop="apply"]')?.disabled === false)
  await page.locator('[data-crop="zoom"]').focus()
  await page.keyboard.press('ArrowRight')
  assert.ok(Number(await page.locator('[data-crop="zoom"]').inputValue())>1)
  const canvasBox=await page.locator('.ss-avatar-crop canvas').boundingBox()
  assert.ok(canvasBox.x>=0 && canvasBox.x+canvasBox.width<=360,'Mobile crop stays within viewport')
  await page.mouse.move(canvasBox.x+canvasBox.width/2,canvasBox.y+canvasBox.height/2)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x+canvasBox.width/2+30,canvasBox.y+canvasBox.height/2+20)
  await page.mouse.up()
  assert.notEqual(await page.locator('[data-crop="x"]').inputValue(),'0')
  await page.locator('[data-crop="apply"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-role="run-status"]').textContent==='Active character picture updated.')
  assert.equal(avatarUploads,1)
  await page.setViewportSize({width:1440,height:1000})
  await page.locator('[data-action="set-persona-picture"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-crop="apply"]')?.disabled === false)
  await assertCentered('.ss-avatar-crop')
  await page.locator('[data-crop="cancel"]').click()
  await page.waitForFunction(()=>!mobileController.characterImageActionPending)
  assert.equal(personaUploads,0)
  await page.locator('[data-action="set-persona-picture"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-crop="apply"]')?.disabled === false)
  await page.locator('[data-crop="apply"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-role="run-status"]').textContent==='Active persona picture updated.')
  assert.equal(personaUploads,1)
  await page.setViewportSize({width:360,height:850})
  await page.locator('[data-action="send-character-gallery"]').click()
  await page.waitForFunction(()=>document.querySelector('[data-role="run-status"]').textContent.includes('1 output(s) in the character gallery'))
  assert.deepEqual(gallery,[{image_id:'saved-one'}])
  await page.setViewportSize({width:1440,height:1000})
  assert.equal(await page.locator('[data-action="set-character-picture"]').isEnabled(),true)
  await page.locator('[data-action="send-character-gallery"]').click()
  await page.waitForFunction(()=>!mobileController.characterImageActionPending)
  assert.equal(gallery.length,1,'Desktop repeat send skips an existing gallery link')
  await page.setViewportSize({width:360,height:850})
  await page.evaluate(()=>{
    mobileController.closeInspector()
    mobileController.openOutputLibrary()
    mobileController.libraryFolderId=''
    mobileController.state.libraryOutputs=[{id:'saved-one',url:'/api/v1/images/saved-one'},{id:'saved-two',url:'/api/v1/images/saved-two'}]
    mobileController.renderOutputLibrary()
  })
  await page.locator('[data-action="toggle-library-selection"]').click()
  await page.locator('[data-action="select-library-page"]').click()
  await page.locator('[data-action="bulk-send-character-gallery"]').click()
  await page.waitForFunction(()=>!mobileController.characterImageActionPending)
  assert.deepEqual(gallery,[{image_id:'saved-one'},{image_id:'saved-two'}])
  assert.equal(await page.evaluate(()=>mobileController.librarySelection.size),0)
  await page.evaluate(()=>{
    mobileController.closeOutputLibrary()
    mobileController.state.activeChat=null
    mobileController.state.chatVisuals.activePersona=null
    mobileController.updateAppendControls()
    mobileController.openInspector()
  })
  assert.equal(await page.locator('[data-action="set-character-picture"]').isDisabled(),true)
  assert.equal(await page.locator('[data-action="send-character-gallery"]').isDisabled(),true)
  assert.equal(await page.locator('[data-action="set-persona-picture"]').isDisabled(),true)
  await page.evaluate(()=>mobileController.closeInspector())
  console.log('Character/persona crops: centered despite host reset, grouped targets, cancel focus, uploads and galleries: ok')
  // Reproduce saving Default while the active character folder is bound to Head.
  await page.setViewportSize({width:1440,height:1000})
  await page.evaluate(()=>{
    const item=(name,weight)=>({name,title:name,weight,enabled:true,useTrigger:false,sourceUrl:''})
    mobileController.state.stackPresets=[{id:'head',name:'Head',items:[item('head-lora',1)],updatedAt:0},{id:'default',name:'Default',items:[item('default-lora',0.6)],updatedAt:0}]
    mobileController.state.activeChat={id:'chat',character_id:'char'}
    mobileController.state.outputFolders=[{id:'visual-folder',name:'Character visuals',imageIds:[],updatedAt:0,binding:{type:'character',characterId:'char',enabled:true,stackPresetId:'head',stackSnapshot:[],checkpoint:'',positivePrompt:'',negativePrompt:'',looks:[],activeLookId:''}}]
    mobileController.hydratedVisualCharacterId=''
    mobileController.renderStackPresets()
    mobileController.hydrateActiveVisualStack()
    mobileController.setStudioView('styles')
  })
  assert.equal(await page.locator('[data-role="stack-preset"]').inputValue(),'head','Initial character hydration still loads its bound stack')
  await page.locator('[data-role="stack-preset"]').selectOption('default')
  await page.locator('[data-action="load-stack"]').click()
  for(let attempt=0;attempt<2;attempt++) {
    page.once('dialog',dialog=>dialog.accept('Default'))
    await page.locator('[data-action="save-stack"]').click()
    const saved=await page.evaluate(()=>{
      const message=testMessages.findLast(message=>message.type==='save_stack_preset')
      const updated=[{...mobileController.state.stackPresets.find(preset=>preset.id==='default'),...message.preset},...mobileController.state.stackPresets.filter(preset=>preset.id!=='default')]
      mobileController.onMessage({type:'stack_presets_result',requestId:message.requestId,data:updated})
      return {id:message.preset.id,name:message.preset.name,items:message.preset.items,selected:document.querySelector('[data-role="stack-preset"]').value,mobileSelected:document.querySelector('[data-role="mobile-stack-preset"]').value,stack:mobileController.state.stack.map(item=>({name:item.lora.name,weight:item.weight}))}
    })
    assert.equal(saved.id,'default','Save targets Default, never the bound Head preset')
    assert.equal(saved.name,'Default')
    assert.equal(saved.selected,'default','Save response must not reset selection to Head')
    assert.equal(saved.mobileSelected,'default','Both dropdowns preserve the saved selection')
    assert.deepEqual(saved.stack,[{name:'default-lora',weight:0.6}],'Save must not reload another stack')
  }
  await page.evaluate(()=>mobileController.hydrateActiveVisualStack())
  assert.equal(await page.locator('[data-role="stack-preset"]').inputValue(),'default','Repeated hydration must not overwrite a user selection')
  await page.evaluate(()=>mobileController.hydrateActiveVisualStack(true))
  assert.equal(await page.locator('[data-role="stack-preset"]').inputValue(),'head','Explicit profile hydration still loads Head')
  console.log('Stack saving: Default stays selected across two saves and repeated hydration; explicit character profile load still works: ok')

  await page.evaluate(()=>{
    window.confirm=()=>{throw new Error('Native confirmation is unavailable in this host')}
    mobileController.state.outputFolders=[{id:'test-folder',name:'Folder <b>with images</b>',imageIds:['saved-one','saved-two'],createdAt:0,updatedAt:0}]
    mobileController.openOutputLibrary()
    mobileController.libraryFolderId='test-folder'
    mobileController.renderOutputLibrary()
    testMessages.length=0
  })
  const deleteRequests=()=>page.evaluate(()=>testMessages.filter(message=>message.type==='delete_output_folder'))
  await page.locator('[data-action="delete-output-folder"]').click()
  await page.locator('.ss-confirm-folder').waitFor()
  await assertCentered('.ss-confirm-folder')
  assert.deepEqual(await deleteRequests(),[],'Opening confirmation does not delete')
  assert.equal(await page.locator('.ss-confirm-folder-name').textContent(),'Folder <b>with images</b>')
  assert.equal(await page.locator('.ss-confirm-folder-name b').count(),0,'Folder name is plain text')
  assert.equal(await page.locator('[data-confirm="cancel"]').evaluate(node=>node===document.activeElement),true,'Safe action gets initial focus')
  await page.keyboard.press('Escape')
  await page.waitForFunction(()=>!mobileController.folderDeleteAbort)
  assert.deepEqual(await deleteRequests(),[],'Escape does not delete')
  await page.locator('[data-action="delete-output-folder"]').click()
  await page.locator('[data-confirm="cancel"]').click()
  await page.waitForFunction(()=>!mobileController.folderDeleteAbort)
  assert.deepEqual(await deleteRequests(),[],'Cancel does not delete')
  await page.setViewportSize({width:1440,height:1000})
  await page.locator('[data-action="delete-output-folder"]').click()
  await assertCentered('.ss-confirm-folder')
  await page.locator('[data-confirm="delete"]').click()
  await page.waitForFunction(()=>testMessages.some(message=>message.type==='delete_output_folder'))
  const deletes=await deleteRequests()
  assert.equal(deletes.length,1,'Explicit confirmation sends one deletion')
  assert.equal(deletes[0].folderId,'test-folder')
  assert.equal(await page.evaluate(()=>mobileController.state.libraryOutputs.length),2,'Images remain intact')
  await page.evaluate(()=>mobileController.closeOutputLibrary())
  console.log('Folder deletion: visible native dialog, safe focus, Escape/Cancel preserve folder, confirm sends exact captured ID: ok')
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
