"""Actual compiled inline menu with recovered, active and unattached job states."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parents[1]
js = (root/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ', 'function ')
js += '\nwindow.fixture={TaggedImageController,defaultStudioBehavior,STYLES};'
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    for width in (1440,390,320):
        page = browser.new_page(viewport={'width':width,'height':840})
        errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content('<main id="chat" style="width:270px;height:260px"></main>')
        page.add_script_tag(content=js)
        page.evaluate('''()=>{
          const style=document.createElement('style');style.textContent=fixture.STYLES;document.head.append(style);
          const html='<figure data-swarm-studio-image="true" data-swarm-studio-job-id="slot-a" style="position:relative;width:250px;height:230px;background:#444"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Artwork" style="width:100%;height:100%"><span tabindex="0" role="button" data-swarm-studio-inline-action="true" aria-label="Illustration actions for Artwork">↻</span></figure>';
          document.querySelector('#chat').innerHTML=html;
          window.actions=[];window.sends=[];window.handlers=new Map();
          window.message={id:'message',chat_id:'chat',swipe_id:0,content:html};
          const ctx={getActiveChat:()=>({chatId:'chat'}),messages:{getRecent:()=>[message],renderWidget:()=>()=>{}},events:{on(name,cb){handlers.set(name,cb);return()=>handlers.delete(name)}},sendToBackend:p=>sends.push(p)};
          window.controller=new fixture.TaggedImageController(ctx,fixture.defaultStudioBehavior(),()=>{},()=>false,()=>{},(action,target)=>actions.push({action,jobId:target.jobId,imageId:target.imageId}));
          window.job={id:'slot-a',chatId:'chat',messageId:'message',slot:'scene',swipeId:0,output:'inline',prompt:'portrait',sourcePrompt:'portrait',negativePrompt:'',clientJobId:'failed-attempt',imageId:'uncommitted',imageUrl:'/api/v1/images/uncommitted',status:'failed',inserted:false,error:'Provider stopped',updatedAt:1};
          window.emit=(overrides)=>controller.onMessage({type:'tagged_image_job',data:{...job,...overrides}});
          emit({});
        }''')
        trigger=page.get_by_role('button',name='Illustration actions for Artwork');menu=page.get_by_role('menu',name='Image actions')
        trigger.focus();trigger.press('Enter');menu.wait_for()
        assert menu.get_by_role('menuitem',name='Replace image…').count()==0
        page.keyboard.press('Escape')
        page.evaluate('''()=>controller.onMessage({type:'tagged_image_jobs_result',data:[{...job,status:'ready',inserted:true,imageId:'committed',imageUrl:'/api/v1/images/committed',updatedAt:2}]})''')
        trigger.press('Enter');menu.wait_for()
        for label in ['Open in Edit','Inpaint','Replace image…','Remove from chat']:
            assert menu.get_by_role('menuitem',name=label,exact=True).is_enabled(),label
        menu.get_by_role('menuitem',name='Replace image…').click()
        assert page.evaluate('actions')==[{'action':'replace','jobId':'slot-a','imageId':'committed'}]
        trigger.press('Enter');menu.get_by_role('menuitem',name='Inspect request & compiled prompt').click()
        assert page.get_by_text('Previous illustration retained. Last attempt: Provider stopped').is_visible()
        page.locator('.ss-inline-prompt-diagnostics footer button').click()
        page.evaluate('''()=>emit({status:'generating',clientJobId:'next-attempt',updatedAt:3})''')
        trigger.focus();trigger.press('Enter');menu.wait_for()
        assert menu.get_by_role('menuitem',name='Replace image…').count()==0
        assert menu.get_by_role('menuitem',name='Remove from chat').is_disabled()
        page.evaluate('''()=>{message.swipe_id=1;message.content='Another swipe';handlers.get('MESSAGE_SWIPED')({chatId:'chat',message})}''')
        assert not menu.is_visible()
        assert page.evaluate('sends.length')==0
        assert not errors,errors
        page.close();print(f'Inline attachment menu {width}px: PASS')
    browser.close()
