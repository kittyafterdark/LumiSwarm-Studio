"""Remounting an extension controller may not append duplicate island content.

The source message has ONE packet. On v1.0.34 three controller lifetimes produce
THREE cards inside its surviving Shadow Root. On v1.0.35 there must be one.
"""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright

ROOT = Path(os.environ.get('CAST_TEST_ROOT', Path(__file__).resolve().parents[1]))
code = (ROOT / 'dist/frontend.js').read_text(encoding='utf8').rsplit('export {', 1)[0]
code += '\nwindow.__castTest={castRenderIslands,StudioCastNarrative};'
library = {
    'groups': [{'id':'bnha','name':'BNHA','defaultPresentation':'editorial-square','inject':True}],
    'activeGroupId':'bnha','members':[{'id':'shoto','groupId':'bnha','name':'Shoto',
    'prefix':'Shoto','presentation':'tech-messenger','presentationSide':'left',
    'defaultExpression':'joy','images':{'joy':{'id':'img1'}}}],
    'chatGroups':{'chat1':'bnha'},'inject':True
}
scene = '<p>Before <swarm-cast=Shoto-joy>"Which means your reputation is compromised."</swarm-cast> After.</p>'
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':960, 'height':780})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.set_content('<main id="message"></main>')
    page.add_script_tag(content=code)
    page.evaluate('''({library,scene}) => {
      const t=window.__castTest;
      window.__library=library;
      window.__message=document.getElementById('message');
      window.__message.innerHTML=t.castRenderIslands(scene);
      window.__listeners=new Set();
      window.__backendCallbacks=new Set();
      window.__context={
        getActiveChat:()=>({chatId:'chat1'}),
        dom:{listMessageElements:()=>[{messageId:'m1',element:window.__message}],getMessageId:()=> 'm1'},
        onBackendMessage(fn){window.__backendCallbacks.add(fn);return ()=>window.__backendCallbacks.delete(fn)},
        sendToBackend(payload){if(payload.type==='load_cast_library')queueMicrotask(()=>{
          for(const fn of [...window.__backendCallbacks])fn({type:'cast_result',requestId:payload.requestId,data:window.__library});
        })},
        events:{on(){return ()=>{}}}
      };
      window.__mount=()=>{window.__controller=new t.StudioCastNarrative(window.__context)};
      window.__unmount=()=>{window.__controller.destroy()};
      window.__mount();
    }''', {'library':library, 'scene':scene})
    page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('.ss-cast-island-content [data-cast-side]')")
    get_state = '''() => {
      const slot=document.querySelector('[data-ss-cast-slot]');
      const root=slot.shadowRoot;
      const contents=[...root.childNodes].filter(n=>n instanceof HTMLElement&&n.classList.contains('ss-cast-island-content'));
      return {slotCount:document.querySelectorAll('[data-ss-cast-slot]').length,
        contents:contents.length,cardCount:root.querySelectorAll('[data-swarm-cast]').length,
        quoteCount:root.querySelectorAll('[data-swarm-cast-dialogue]').length,
        side:root.querySelector('[data-cast-side]')?.getAttribute('data-cast-side'),
        prose:document.querySelector('#message').textContent};
    }'''
    before=page.evaluate(get_state)
    assert before['contents']==1 and before['cardCount']==1, before
    # Surviving message node & Shadow Root, but each extension restart makes
    # a *different* controller. Reuse rather than append a second copy.
    for _ in range(2):
        page.evaluate('''() => {window.__unmount();window.__mount()}''')
        page.wait_for_timeout(90)
    after=page.evaluate(get_state)
    assert after['slotCount']==1 and after['contents']==1 and after['cardCount']==1 and after['quoteCount']==1, after
    assert after['side']=='left' and 'Before' in after['prose'] and 'After.' in after['prose'],after
    # Existing installations may *already* have two extra hydration nodes.
    # The first subsequent hydrating controller must repair them.
    page.evaluate('''()=>{
      const root=document.querySelector('[data-ss-cast-slot]').shadowRoot;
      const node=root.querySelector('.ss-cast-island-content');
      root.append(node.cloneNode(true),node.cloneNode(true));
      window.__unmount();window.__mount();
    }''')
    page.wait_for_timeout(100)
    repaired=page.evaluate(get_state)
    assert repaired['contents']==1 and repaired['cardCount']==1 and repaired['quoteCount']==1, repaired
    # Changing the member side should rebuild existing content in place,
    # without inserting another card or dropping prose.
    page.evaluate('''()=>{
      window.__library={...window.__library,members:window.__library.members.map(m=>({...m,presentationSide:'right'}))};
      for(const fn of [...window.__backendCallbacks])fn({type:'cast_library_changed',library:window.__library});
    }''')
    page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('[data-cast-side=right]')")
    updated=page.evaluate(get_state)
    assert updated['cardCount']==1 and updated['quoteCount']==1 and updated['side']=='right', updated
    assert not errors, errors
    print('CAST ISLAND REMOUNT PASS: one packet, three controller lifetimes, old duplicate repair, side change, native prose')
    browser.close()
