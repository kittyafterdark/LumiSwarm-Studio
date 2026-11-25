import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {createServer} from 'node:http'
import {join} from 'node:path'
import {runInNewContext} from 'node:vm'
import {chromium} from 'playwright'
const frontend=await readFile(new URL('../dist/frontend.js',import.meta.url))
const css=runInNewContext(await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')+';STYLES+STUDIO_V3_STYLES')
const fixtureImage=await readFile(new URL('./fixtures/studio-avatar.webp',import.meta.url))
const server=createServer((req,res)=>{
 if(req.url==='/frontend.js'){res.setHeader('Content-Type','text/javascript');res.end(frontend)}
 else if(req.url==='/api/v1/images'&&req.method==='POST'){req.resume();res.setHeader('Content-Type','application/json');res.end(JSON.stringify({id:'uploaded-reference'}))}
 else if(req.url.startsWith('/api/v1/characters/summary')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({data:[{id:'nora-character',name:'Nora Vale'}],total:1}))}
 else if(req.url==='/api/v1/characters/nora-character/expressions/groups'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({'Evening look':{calm:'nora-calm'}}))}
 else if(req.url==='/api/v1/characters/nora-character/expressions'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({defaultExpression:'neutral',mappings:{neutral:'nora-neutral',blushing:'nora-blush'}}))}
 else if(req.url==='/api/v1/characters/nora-character'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({id:'nora-character',name:'Nora Vale'}))}
 else if(req.url.startsWith('/api/v1/images/')){res.setHeader('Content-Type','image/webp');res.end(fixtureImage)}
 else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body style="margin:0;background:#15151c"><div id="root" style="height:100dvh"></div></body></html>')}
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const out=process.env.STUDIO_SCREENSHOT_DIR;if(out)await mkdir(out,{recursive:true})
let browser
try{
 browser=await chromium.launch({headless:true})
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.addStyleTag({content:css})
 await page.evaluate(async()=>{
  const{StudioController,defaultStudioBehavior,cleanCastLibrary}=await import('/frontend.js'),listeners=new Set(),calls=[]
  let library=cleanCastLibrary({version:1,activeGroupId:'crew',inject:true,groups:[{id:'crew',name:'BNHA',description:'After-class chaos & familiar faces.'},{id:'other',name:'Midnight tea club'}],members:[{id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',identityPrompt:'red and white hair, grey sweater',images:{neutral:{id:'saved-neutral'},joy:{id:'saved-joy'},anger:{id:'saved-anger'},calm:{id:'saved-calm'},blushing:{id:'saved-blush'}},presentation:'card'},{id:'mina',groupId:'crew',name:'Mina Ashido',prefix:'Mina',role:'cast',images:{}},{id:'you',groupId:'crew',name:'You',prefix:'You',role:'persona',images:{}}]})
  let bank=[]
  const fixtures={failSave:false,failLoad:false,chatId:'chat-1',personaCalls:0}
  const ctx={onBackendMessage(fn){listeners.add(fn);return()=>listeners.delete(fn)},sendToBackend(message){calls.push(message);queueMicrotask(()=>{
   let payload
   if(message.type==='load_cast_library')payload=fixtures.failLoad?{type:'studio_error',error:'Library temporarily unavailable'}:{type:'cast_result',data:{...library,chatId:fixtures.chatId,characterId:'char'}}
   if(message.type==='save_cast_library'){if(fixtures.failSave)payload={type:'studio_error',error:'Could not save right now'};else{library=cleanCastLibrary(message.library);payload={type:'cast_result',data:library}}}
   if(message.type==='list_library_outputs')payload={type:'library_outputs_result',data:{outputs:[{id:'saved-reference',url:'/api/v1/images/saved-reference',original_filename:'Reference portrait.webp'}],folders:controller.state.outputFolders,total:1,offset:0}}
   if(message.type==='export_cast_folder')payload={type:'cast_result',data:{count:3}}
   if(message.type==='assign_cast_persona'){fixtures.personaCalls++;payload={type:'cast_result',data:{name:'Current persona'}}}
   if(message.type==='render_folder_expression')payload={type:'folder_expression_result',data:{id:'saved-rendered',url:'/api/v1/images/saved-rendered'}}
   if(message.type==='load_expression_bank')payload={type:'expression_bank_result',data:bank}
   if(message.type==='save_expression_bank'){bank=structuredClone(message.templates);payload={type:'expression_bank_result'}}
   if(message.type==='load_expression_enhance_options')payload={type:'expression_enhance_options_result',data:{mode:'',factor:2}}
   if(payload){payload.requestId=message.requestId;controller.onMessage(payload);for(const fn of listeners)fn(payload)}
  })}}
  document.querySelector('#root').style.fontFamily='system-ui,sans-serif'
  const controller=new StudioController(ctx,{root:document.querySelector('#root')},()=>{},()=>{},defaultStudioBehavior(),()=>{})
  controller.state.outputFolders=[]
  controller.state.connection=null
  window.fixture={controller,calls,listeners,fixtures,get bank(){return bank},get library(){return library},emit(payload){for(const fn of listeners)fn(payload)}}
 })
 const action=name=>page.locator(`[data-cast-action="${name}"]`),dialog=page.locator('#ss-cast-dialog')
 await page.locator('[data-role=positive]').fill('Keep my unsaved Generate prompt')
 await page.locator('[data-view=cast]').click();await page.locator('.cast-card[data-id=crew]').waitFor()
 assert.equal(await page.getByRole('heading',{name:'The cast album',exact:true}).count(),1)
 assert.equal(await page.getByText('Keep your favorite',{exact:false}).count(),0)
 assert.equal(await page.getByText('A new world, a new pairing,',{exact:false}).count(),0)
 if(out)await page.screenshot({path:join(out,'album-desktop.png'),fullPage:true})
 const coverBefore=await page.locator('.cast-card[data-id=crew] .cover').evaluate(el=>getComputedStyle(el).backgroundColor)
 await page.evaluate(()=>{const shell=document.querySelector('.ss-shell');for(const[k,v]of Object.entries({'--ss-canvas-bg':'rgb(244, 248, 251)','--ss-panel-bg':'rgb(255, 255, 255)','--ss-panel-hi':'rgb(230, 240, 245)','--ss-header-bg':'rgb(235, 243, 248)','--ss-muted':'rgb(77, 96, 105)','--ss-field-bg':'rgb(250, 252, 255)','--ss-button-bg':'rgb(225, 239, 248)','--ss-outline':'rgb(125, 149, 158)','--ss-text':'rgb(23, 41, 47)','--ss-accent':'rgb(0, 113, 128)','--ss-primary-bg':'rgb(0, 113, 128)','--ss-primary-ink':'rgb(255, 255, 255)'}))shell.style.setProperty(k,v)})
 await page.mouse.move(0,0)
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.page-head .button.primary')).backgroundColor==='rgb(0, 113, 128)'&&getComputedStyle(document.querySelector('.cast-card')).borderTopColor==='rgb(125, 149, 158)')
 const themed=await page.locator('[data-studio-page=cast]').evaluate(el=>{const button=el.querySelector('.page-head .button.primary'),card=el.querySelector('.cast-card');return{background:getComputedStyle(el).backgroundColor,button:getComputedStyle(button).backgroundColor,ink:getComputedStyle(button).color,outline:getComputedStyle(card).borderTopColor}})
 assert.deepEqual(themed,{background:'rgb(244, 248, 251)',button:'rgb(0, 113, 128)',ink:'rgb(255, 255, 255)',outline:'rgb(125, 149, 158)'})
 assert.equal(await page.locator('.cast-card[data-id=crew] .cover').evaluate(el=>getComputedStyle(el).backgroundColor),coverBefore,'vol. card artwork keeps its own color')
 if(out)await page.screenshot({path:join(out,'album-themed-light.png'),fullPage:true})
 await page.evaluate(()=>{const shell=document.querySelector('.ss-shell');for(const k of ['--ss-canvas-bg','--ss-panel-bg','--ss-panel-hi','--ss-header-bg','--ss-muted','--ss-field-bg','--ss-button-bg','--ss-outline','--ss-text','--ss-accent','--ss-primary-bg','--ss-primary-ink'])shell.style.removeProperty(k)})

 await page.locator('.cast-card[data-id=crew]').click()
 assert.equal(await page.locator('.roster > [data-cast-action=new-member]').count(),1)
 assert.equal(await page.locator('select').filter({hasText:'Choose a character folder'}).count(),0)
 assert.equal(await page.locator('.preview-stage').innerText().then(s=>s.split('I saved you a seat.').length-1),1)
 assert.doesNotMatch(await page.locator('.preview-stage').innerText(),/““|””/)
 assert.equal(await page.locator('.expression-grid .expression-tile').count(),5,'Every saved expression is visible in the grid')
 await action('expressions').first().click();await page.locator('.ss-expression-dialog').waitFor()
 // Opening and browsing does not require a connection, character folder, or linked card.
 assert.equal(await page.locator('.ss-expression-dialog img[src$=saved-joy]').count(),1)
 if(out)await page.screenshot({path:join(out,"expressions-desktop.png"),fullPage:true})
 const modal=page.locator('.ss-expression-dialog')
 assert.equal(await modal.locator('.ss-expression-step').count(),4,'Cast uses the complete shared four-stage V6 modal')
 // The same four-stage editor saves to Cast here, without publishing a character.
 await page.locator('.ss-expression-step').nth(3).click()
 await modal.locator('[data-expression-focus=run-send]').click()
 await modal.locator('.ss-expression-footer [role=status]').filter({hasText:/Saved \d+ expressions to Shoto/}).waitFor()
 assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>c.type==='export_cast_folder').length),0)
 await page.locator('.ss-expression-step').first().click()

 const height=await modal.locator('.ss-expression-card').first().evaluate(el=>el.getBoundingClientRect().height)
 await modal.locator('[data-expression-focus=edit-neutral]').click()
 const editor=modal.locator('[data-expression-inline-editor=neutral]')
 await editor.fill('temporary cancelled direction')
 await modal.locator('.ss-expression-card-editing').getByRole('button',{name:'Cancel',exact:true}).click()
 await modal.locator('[data-expression-focus=edit-neutral]').click()
 assert.doesNotMatch(await editor.inputValue(),/temporary cancelled/)
 const edited=await modal.locator('.ss-expression-card-editing').boundingBox()
 if(out)await page.screenshot({path:join(out,'v6-inline-editor.png'),fullPage:true})
 assert.ok(edited.height<=height+1,'V6 editor does not add flow height to the card')
 assert.equal(await modal.locator('.ss-expression-card-editing .ss-expression-card-info').evaluate(el=>getComputedStyle(el).height),'72px')
 assert.equal(await modal.locator('.ss-expression-card-edit-panel').evaluate(el=>getComputedStyle(el).position),'absolute')
 await editor.fill('warm smile, relaxed brows, bank regression')
 await modal.getByRole('button',{name:'Save to bank',exact:true}).click()
 await page.waitForFunction(()=>fixture.bank.length===1)
 await modal.locator('[data-expression-focus=save-neutral]').click()
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').settings.slots.find(s=>s.label==='neutral').direction.includes('bank regression'))
 await modal.locator('[data-expression-focus=edit-neutral]').click()
 await modal.getByRole('button',{name:'Restore default direction for neutral'}).click()
 await modal.locator('.ss-expression-card-editing').getByRole('button',{name:'Cancel',exact:true}).click()
 await modal.locator('[data-expression-focus=edit-neutral]').click()
 assert.match(await editor.inputValue(),/bank regression/,'Restore remains draft-only until Save')
 await page.keyboard.press('Escape')
 await modal.locator('.ss-expression-preview').filter({has:page.locator('img[src$=saved-joy]')}).click()
 await modal.locator('.ss-expression-inspector-image img').waitFor()
 const inspector=await modal.locator('.ss-expression-inspector-image').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}))
 assert.ok(inspector.scroll<=inspector.height+1)
 await page.keyboard.press('Escape')
 for(const width of [1700,768,390,320]){await page.setViewportSize({width,height:900});const geometry=await modal.evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,top:el.getBoundingClientRect().top}));assert.ok(geometry.scroll<=geometry.width+1,JSON.stringify(geometry));assert.equal(geometry.top,0)}
 await modal.locator('[data-expression-focus=edit-neutral]').click()
 assert.equal(await modal.locator('.ss-expression-card-editing .ss-expression-card-info').evaluate(el=>getComputedStyle(el).height),'67px')
 if(out)await page.screenshot({path:join(out,'expressions-v6-320.png'),fullPage:true})
 await modal.locator('.ss-expression-card-editing').getByRole('button',{name:'Cancel',exact:true}).click();await modal.locator('[data-expression-inline-editor]').waitFor({state:'detached'});await page.setViewportSize({width:1440,height:1000})

 await page.locator('[data-expression-focus=run-slot-joy]').click()
 await page.locator('.ss-expression-footer [role=status]').filter({hasText:/Choose a SwarmUI connection/}).waitFor()
 assert.equal(await page.evaluate(()=>fixture.calls.filter(c=>c.type==='render_folder_expression').length),0)
 await page.locator('.ss-expression-dialog').getByRole('button',{name:'Close',exact:true}).click();await page.locator('.ss-expression-dialog').waitFor({state:'detached'})
 await page.evaluate(()=>{fixture.controller.state.connection={id:'conn',model:'test',default_parameters:{}}})
 await action('expressions').first().click();await page.locator('[data-expression-focus=run-slot-joy]').click()
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').images.joy.id==='saved-rendered')
 await page.locator('.ss-expression-dialog').getByRole('button',{name:'Close',exact:true}).click();await page.locator('.ss-expression-dialog').waitFor({state:'detached'})
 await action('expressions').first().click();assert.equal(await page.locator('.ss-expression-dialog img[src$=saved-rendered]').count(),1)
 await page.locator('.ss-expression-dialog').getByRole('button',{name:'Close',exact:true}).click();await page.locator('.ss-expression-dialog').waitFor({state:'detached'})
 await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click();await action('open-presentation-modal').click();assert.equal(await dialog.locator('.cast-preset-choice').count(),52);await dialog.locator('[data-style=sticker]').click();await dialog.locator('.dialog-footer [data-cast-action=close-dialog]').click()
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').presentation==='sticker')
 await page.locator('#ss-cast-square-crop').check()
 await page.locator('[data-cast-crop=x]').evaluate(input=>{input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))})
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').crop.x===0)
 assert.equal(await page.locator('.preview-stage [data-swarm-cast] img').evaluate(el=>el.style.objectFit),'cover')
 assert.ok(await page.locator('.preview-style-link strong').evaluate(el=>{const box=el.getBoundingClientRect(),icon=el.querySelector('svg').getBoundingClientRect();return Math.abs((box.top+box.bottom)/2-(icon.top+icon.bottom)/2)<2&&box.height<24}))
 await action('open-presentation-modal').click();await dialog.locator('[data-cast-action=presentation-filter][data-group=face]').click();assert.equal(await dialog.locator('.cast-preset-choice').count(),4);await dialog.locator('[data-style=editorial-square]').click();await dialog.locator('.dialog-footer [data-cast-action=close-dialog]').click();await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').presentation==='editorial-square');assert.equal(await page.locator('.preview-stage [data-cast-preset=editorial-square] img').count(),1);await action('open-presentation-modal').click();await dialog.locator('[data-style=sticker]').click();await dialog.locator('.dialog-footer [data-cast-action=close-dialog]').click()
 await action('style-default').click();await page.waitForFunction(()=>fixture.library.groups.find(g=>g.id==='crew').defaultPresentation==='sticker')
 await page.locator('[data-cast-action=member][data-id=mina]').click();await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click()
 assert.match(await page.locator('.preview-style-link').innerText(),/Sticker/)
 await page.locator('[data-cast-action=member][data-id=shoto]').click();await page.locator('#ss-cast-preview-expression').selectOption('Joy');await page.locator('#ss-cast-fallback-expression').selectOption('Joy')
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.id==='shoto').defaultExpression==='joy')
 if(out)await page.screenshot({path:join(out,'member-desktop.png'),fullPage:true})
 // Import real character mappings, including a custom label absent from the default set.
 await page.evaluate(()=>fixture.controller.state.outputFolders=[{id:'nora-visuals',name:'Nora · saved identity',imageIds:[],binding:{type:'character',characterId:'nora-character',positivePrompt:'short green hair',negativePrompt:'',checkpoint:'',stackPresetId:'',stackSnapshot:[],sourcePresetId:'',enabled:true,activeLookId:'',looks:[]},updatedAt:0}])
 await action('new-member').click();await action('import-character').click()
 await page.locator('#ss-cast-character-query').fill('Nora');await action('search-characters').click()
 await action('select-character').filter({hasText:'Nora Vale'}).click()
 await action('apply-character').click()
 assert.equal(await dialog.locator('[name=folderId]').inputValue(),'nora-visuals')
 await page.locator('[form=ss-cast-member-form]').click();await dialog.waitFor({state:'hidden'})
 await page.waitForFunction(()=>fixture.library.members.some(m=>m.sourceCharacterId==='nora-character'&&m.images.blushing?.id==='nora-blush'))
 await action('expressions').first().click()
 await page.locator('.ss-expression-dialog img[src$=nora-blush]').waitFor()
 await page.locator('.ss-expression-dialog').getByRole('button',{name:'Close',exact:true}).click();await page.locator('.ss-expression-dialog').waitFor({state:'detached'})
 assert.equal(await page.locator('[data-role=output-library]').evaluate(el=>el.hidden),true)
 await page.locator('[data-cast-action=member-tab][data-tab=identity]').click()
 await page.locator('#ss-cast-identity-form [name=folderId]').selectOption('');await page.locator('#ss-cast-identity-form [type=submit]').click()
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.sourceCharacterId==='nora-character').folderId==='')
 // Upload lives in the shared picker and returns to the member identity, not the library.
 await action('pick-reference').click()
 const [chooser]=await Promise.all([page.waitForEvent('filechooser',{timeout:10000}),page.locator('.ss-expression-picker [data-action=upload-library-image]').click()])
 await chooser.setFiles({name:'Nora reference.webp',mimeType:'image/webp',buffer:fixtureImage})
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.sourceCharacterId==='nora-character').referenceImageId==='uploaded-reference')
 assert.equal(await page.locator('.ss-expression-picker').count(),0)
 assert.equal(await page.locator('[data-role=output-library]').evaluate(el=>el.hidden),true)
 // Native expression groups are a distinct import source, not folder gallery guesses.
 await action('new-member').click();await action('import-character').click();await action('select-character').filter({hasText:'Nora Vale'}).click()
 await page.locator('#ss-cast-character-set').selectOption('Evening look');await action('apply-character').click()
 await dialog.locator('[name=name]').fill('Nora evening');await dialog.locator('details').evaluate(el=>el.open=true);await dialog.locator('[name=tag]').fill('NoraEvening')
 await page.locator('[form=ss-cast-member-form]').click();await dialog.waitFor({state:'hidden'})
 await page.waitForFunction(()=>fixture.library.members.some(m=>m.prefix==='NoraEvening'&&m.images.calm?.id==='nora-calm'&&!m.images.blushing))

 // The independent member form and its nested image picker persist real image IDs.
 await action('new-member').click();await dialog.locator('[name=name]').fill('Ada');await dialog.locator('[data-role=persona]').click();await dialog.locator('[data-cast-action=draft-reference]').click();await page.locator('.ss-expression-picker [data-action=library-back]').click();await page.locator('[data-role=library-folder-search]').fill('missing folder');assert.equal(await page.locator('.ss-library-folder-card').count(),0);await page.locator('[data-role=library-folder-search]').fill('');await page.locator('.ss-library-folder-card[data-folder-id=""]').click();await page.locator('.ss-expression-picker .ss-library-output').first().click();await page.locator('[data-action=confirm-library-pick]').click();await page.evaluate(()=>fixture.fixtures.failSave=true);await page.locator('[form=ss-cast-member-form]').click();await dialog.locator('[role=alert]').waitFor();await page.evaluate(()=>fixture.fixtures.failSave=false);await page.locator('[form=ss-cast-member-form]').click()
 await page.waitForFunction(()=>fixture.library.members.some(m=>m.name==='Ada'&&m.referenceImageId==='saved-reference'))
 assert.equal(await page.locator('.member-profile h2').innerText(),'Ada')
 assert.equal(await page.evaluate(()=>fixture.library.members.filter(m=>m.name==='Ada').length),1,'Retrying creation must not duplicate a member')
 await action('expressions').first().click();await page.locator('.ss-expression-dialog').waitFor();await page.locator('[data-expression-focus=run-slot-neutral]').click()
 await page.waitForFunction(()=>fixture.library.members.find(m=>m.name==='Ada').images.neutral?.id==='saved-rendered')
 const request=await page.evaluate(()=>fixture.calls.findLast(c=>c.type==='render_folder_expression'))
 assert.ok(request.castMemberId);assert.ok(request.folderId.startsWith('cast:'))
 await page.locator('.ss-expression-dialog').getByRole('button',{name:'Close',exact:true}).click();await page.locator('.ss-expression-dialog').waitFor({state:'detached'})
 // Saves can be retried without silently erasing the edited identity.
 await page.locator('[data-cast-action=member-tab][data-tab=identity]').click();await page.locator('#ss-cast-identity-form [name=name]').fill('Ada Moon')
 await page.evaluate(()=>fixture.fixtures.failSave=true);await page.locator('#ss-cast-identity-form [type=submit]').click();await action('retry-save').waitFor()
 await page.evaluate(()=>fixture.fixtures.failSave=false);await action('retry-save').click();await page.waitForFunction(()=>fixture.library.members.some(m=>m.name==='Ada Moon'))
 await page.locator('[data-cast-action=member][data-id=shoto]').click()
 await page.route('**/api/v1/characters/**',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"offline"}'}))
 await action('use-cast').click();await page.locator('[data-cast-action=use-tab][data-tab=card]').click();await action('use-confirm').click();await dialog.locator('[role=alert]').filter({hasText:/offline|could not|503/}).waitFor()
 assert.equal(await page.evaluate(()=>fixture.library.members.find(m=>m.id==='shoto').images.joy.id),'saved-rendered')
 await page.unroute('**/api/v1/characters/**');const deployed=[]
 await page.route('**/api/v1/characters/**',async route=>{const request=route.request(),url=request.url();deployed.push({url,method:request.method(),body:request.postDataJSON()});await route.fulfill({contentType:'application/json',body:JSON.stringify(url.endsWith('/gallery')?[]:url.endsWith('/groups')&&request.method()==='GET'?{Existing:{neutral:'keep'}}:{})})})
 await page.locator('[name=export-format][value=grouped]').check();await action('use-confirm').click();await dialog.waitFor({state:'hidden'})
 assert.ok(deployed.some(d=>d.url.endsWith('/Shoto/labels')));assert.ok(!deployed.some(d=>d.method==='PUT'))
 await action('use-cast').click();await page.locator('[data-cast-action=use-tab][data-tab=persona]').click();await action('use-confirm').click();await dialog.waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>fixture.fixtures.personaCalls),1)
 // Chat activation is scoped; browsing another cast does not activate it.
 await action('home').first().click();await page.locator('.cast-card[data-id=other]').click()
 assert.equal(await page.evaluate(()=>fixture.library.activeGroupId),'crew')
 await action('activate').click();await page.waitForFunction(()=>fixture.library.chatGroups['chat-1']==='other')
 await page.evaluate(()=>{fixture.fixtures.chatId='chat-2';fixture.emit({type:'cast_chat_changed'})});await page.waitForTimeout(20)
 await action('activate').click();await page.waitForFunction(()=>Object.prototype.hasOwnProperty.call(fixture.library.chatGroups,'chat-2'))
 assert.equal(await page.evaluate(()=>fixture.library.chatGroups['chat-1']),'other')
 await action('home').first().click();await action('new-cast').first().click();await dialog.locator('[name=name]').fill('An independent little world');await page.evaluate(()=>fixture.fixtures.failSave=true);await page.locator('[form=ss-cast-cast-form]').click();await dialog.locator('[role=alert]').waitFor();await page.evaluate(()=>fixture.fixtures.failSave=false);await page.locator('[form=ss-cast-cast-form]').click();await dialog.waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>fixture.library.groups.filter(g=>g.name==='An independent little world').length),1,'Retrying creation must not duplicate a cast')
 assert.ok(await page.getByRole('heading',{name:'Who’s joining the story?'}).isVisible())
 await page.locator('.breadcrumb [data-cast-action=home]').click();await page.locator('.cast-card[data-id=crew]').click()
 await page.locator('[data-view=generate]').click();assert.equal(await page.locator('[data-role=positive]').inputValue(),'Keep my unsaved Generate prompt')

 const longPrompt=('quality, '+('a long reusable value, '.repeat(60))).trim()
 await page.locator('[data-role=positive]').fill(longPrompt)
 await page.evaluate(()=>{const c=fixture.controller;c.state.canManagePresets=true;c.state.swarmParameters=['prompt','width','height','steps','cfgscale','seed'].map(id=>({id,name:id,type:'text'}));c.openSavePresetModal()})
 const preset=page.locator('[data-role=save-preset-modal]')
 assert.ok(await preset.isVisible())
 assert.equal(await preset.locator('[data-param-id=seed]').isChecked(),false)
 await preset.locator('[data-role=save-preset-clear]').click()
 await preset.locator('[data-param-id=prompt]').check()
 await preset.locator('.ss-save-param-expand').click()
 assert.equal(await preset.locator('.ss-save-param-full').innerText(),longPrompt)
 await page.locator('[data-role=save-preset-name]').fill('Full prompt regression')
 if(out)await page.screenshot({path:join(out,'preset-desktop.png'),fullPage:true})
 await page.setViewportSize({width:320,height:844})
 const sheet=await preset.locator('.ss-workflow-modal-card').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}))
 assert.ok(sheet.scroll<=sheet.width+1,JSON.stringify(sheet))
 if(out)await page.screenshot({path:join(out,'preset-320.png'),fullPage:true})
 await page.setViewportSize({width:1440,height:1000})
 await preset.locator('[data-action=confirm-save-preset]').click()
 const payload=await page.evaluate(()=>fixture.calls.findLast(c=>c.type==='add_swarm_preset'))
 assert.deepEqual(Object.keys(payload.paramMap),['prompt']);assert.equal(payload.paramMap.prompt,longPrompt)
 await page.locator('[data-role=positive]').fill('Keep my unsaved Generate prompt')
 await page.setViewportSize({width:390,height:844});await page.locator('[data-view=cast]').click()
 for(const width of[390,556,360]){await page.setViewportSize({width,height:883});const g=await page.locator('[data-studio-page=cast]').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));assert.ok(g.scroll<=g.width+1,JSON.stringify({width,...g}))}
 await page.setViewportSize({width:556,height:883});await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click();assert.equal(await page.locator('.member-body .preview-panel').count(),1)
 if(out)await page.screenshot({path:join(out,'presentation-556.png'),fullPage:true})
 await page.setViewportSize({width:390,height:844});if(out)await page.screenshot({path:join(out,'mobile.png'),fullPage:true})
 for(const width of[390,320]){await page.setViewportSize({width,height:844});await action('new-member').click();assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));assert.ok(await dialog.locator('.dialog-body').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await dialog.getByRole('button',{name:'Close dialog',exact:true}).click()}
 await page.evaluate(()=>fixture.controller.dispose());assert.equal(await page.evaluate(()=>fixture.listeners.size),0)
 assert.deepEqual(errors,[])
 console.log('Cast album browser PASS: migration, compact hierarchy, independent modal/generation, persistence/defaults, save retry, real export requests, per-chat activation, responsive layouts, Generate preservation and teardown')
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
