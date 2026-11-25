import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {runInNewContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {chromium} from 'playwright';
const helper=stripTypeScriptTypes(await readFile(new URL('../src/host/reference-copies.ts',import.meta.url),'utf8'),{mode:'transform'}).replace('async function verifyStudioReferenceCopies','export async function verifyStudioReferenceCopies');
const frontend=await readFile(new URL('../dist/frontend.js',import.meta.url));
const css=runInNewContext(await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')+';STYLES + STUDIO_V3_STYLES');
const png=await readFile(new URL('./fixtures/cast-portrait.png',import.meta.url));
const width=png.readUInt32BE(16),height=png.readUInt32BE(20),length=png.length;
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const server=createServer((req,res)=>{
 if(req.url==='/helper.js'){res.setHeader('content-type','text/javascript');res.end(helper);}
 else if(req.url==='/frontend.js'){res.setHeader('content-type','text/javascript');res.end(frontend);}
 else if(req.url?.startsWith('/api/v1/images/')){if(req.url.endsWith(id(3))){res.writeHead(302,{location:'http://example.invalid/never-fetch'});res.end();}else{res.setHeader('content-type','image/png');res.end(req.url.endsWith(id(2))?Buffer.from('not-a-png'):png);}}
 else{res.setHeader('content-type','text/html');res.end(`<!doctype html><html><head><style>*{margin:0}dialog{margin:0}${css}</style></head><body style="margin:0;background:#16151d"><div id="root" class="ss-shell" style="height:100dvh"></div><script type="module">
 import {verifyStudioReferenceCopies} from '/helper.js';import {StudioController,defaultStudioBehavior} from '/frontend.js';window.Controller=StudioController;window.defaults=defaultStudioBehavior;
 window.verify=verifyStudioReferenceCopies;window.sent=[];let sequence=0;
 window.studio=Object.assign(Object.create(StudioController.prototype),{root:document.querySelector('#root'),ctx:{uuid:{v4:()=> '00000000-0000-4000-8000-'+String(++sequence).padStart(12,'0')},host:{capabilities:{'frontend-uuid-v1':1}},sendToBackend(message){sent.push(message);queueMicrotask(()=>studio.onMessage({type:'reference_link_result',requestId:message.requestId,data:{paired:message.action==='pair',receiver:'http://studio.fixture/__studio/lumi-bridge/push'}}));}},disposed:false,referenceLinkDialog:null,referenceLinkRequests:new Set()});
 studio.openReferenceLink();window.ready=true;
 </script></body></html>`);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({channel:'msedge',headless:true});await mkdir('test-results',{recursive:true});
 for(const viewport of [{width:782,height:893},{width:390,height:844},{width:320,height:640}]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>window.ready);
  const dialogBox=await page.locator('.ss-reference-dialog').boundingBox();
  assert.ok(Math.abs(dialogBox.x-(viewport.width-dialogBox.width)/2)<2,'dialog centered horizontally despite host margin reset');
  assert.ok(Math.abs(dialogBox.y-(viewport.height-dialogBox.height)/2)<2,'dialog centered vertically despite host margin reset');

  const snapshot={claims:[1,2,3,4].map(n=>({imageId:id(n),assetId:id(n),persisted:true,usableCopyVerified:false,copyCheck:{status:'readable-bytes',byteLength:n===4?length+1:n===2?9:length,width,height}}))};
  const result=await page.evaluate(snapshot=>verify(snapshot),snapshot);
  assert.equal(result.claims[0].usableCopyVerified,true);assert.ok(result.claims.slice(1).every(c=>!c.usableCopyVerified));
  const code={version:1,url:'http://studio.fixture/__studio/lumi-bridge/push',token:'a'.repeat(64),scope:'fixture',expiresAt:Date.now()+100000};
  await page.locator('[data-reference-code]').fill(JSON.stringify(code));
  assert.match(await page.locator('[role="status"]').textContent(),/studio.fixture/);
  await page.getByRole('button',{name:'Connect',exact:true}).click();
  assert.equal(await page.locator('[data-reference-code]').inputValue(),'');
  await page.waitForFunction(()=>sent.some(message=>message.action==='pair'));
  assert.match(await page.locator('[role="status"]').textContent(),/Paired/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`test-results/lumi-reference-link-${viewport.width}.png`,fullPage:true});
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached',timeout:5000});
  await page.evaluate(()=>{studio.ctx.uuid=null;studio.openReferenceLink();});assert.match(await page.locator('[role="status"]').textContent(),/frontend-uuid-v1/);
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  await page.evaluate(()=>{window.full=new Controller({sendToBackend:message=>sent.push(message),uuid:{v4:()=> '00000000-0000-4000-8000-000000000099'},host:{capabilities:{'frontend-uuid-v1':1}}},{root:document.querySelector('#root')},()=>{},()=>{},defaults(),()=>{});});
  assert.equal(await page.locator('.ss-history-pane [data-action="live-reference-link"]').count(),0);
  await page.locator('[data-action="toggle-config"]').click();await page.locator('[data-settings-tab="generation"]').click();
  await page.locator('.ss-settings-toggle:has([data-role="skip-swarm-save"])').click();assert.equal(await page.locator('[data-role="skip-swarm-save"]').isChecked(),true);
  assert.equal(await page.evaluate(()=>JSON.parse(full.buildRawOverride()).donotsave),true);
  await page.screenshot({path:`test-results/lumi-no-save-${viewport.width}.png`,fullPage:true});
  await page.locator('[data-role="skip-swarm-save"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-role="skip-swarm-save"]').isChecked(),false);
  assert.equal(await page.evaluate(()=>JSON.parse(full.buildRawOverride()||'{}').donotsave),undefined);
  await page.locator('[data-settings-tab="metadata"]').click();
  assert.equal(await page.locator('[data-settings-panel="metadata"] [data-action="live-reference-link"]').isVisible(),true);
  for(const key of ['references','metadata']) {
    const help=page.locator(`[data-help="${key}"]`), panel=page.locator(`#ss-help-${key}`);
    await help.click();await page.waitForFunction(key=>document.querySelector(`#ss-help-${key}`).matches(':popover-open'),key);
    assert.ok((await panel.textContent()).length>150);
    const box=await panel.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=viewport.width&&box.y>=0);
    await page.screenshot({path:`test-results/lumi-metadata-${key}-${viewport.width}.png`,fullPage:true});
    await page.keyboard.press('Escape');await page.waitForFunction(key=>!document.querySelector(`#ss-help-${key}`).matches(':popover-open'),key);
    await help.focus();await page.keyboard.press('Enter');await page.waitForFunction(key=>document.querySelector(`#ss-help-${key}`).matches(':popover-open'),key);
    await page.locator('[data-settings-tab="metadata"]').click();await page.waitForFunction(key=>!document.querySelector(`#ss-help-${key}`).matches(':popover-open'),key);
  }
  await page.locator('[data-settings-panel="metadata"] [data-action="live-reference-link"]').click();await page.locator('.ss-reference-dialog').waitFor({state:'visible'});
  await page.keyboard.press('Escape');await page.locator('.ss-reference-dialog').waitFor({state:'detached'});
  assert.deepEqual(errors,[]);await page.evaluate(()=>full.dispose());await context.close();
 }
 console.log('Original-copy decoding/corruption/redirect/byte mismatch and Lumi pairing dialog, UUID capability, Escape/mobile layout: PASS');
}finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
