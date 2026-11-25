import assert from 'node:assert/strict'
import { cleanCastLibrary, renderCastTags, castLiteralSource } from '../dist/frontend.js'

const base={activeGroupId:'crew',groups:[{id:'crew',name:'Characters'}],members:[
  {id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',presentation:'editorial-square',presentationSide:'left',defaultExpression:'neutral',images:{neutral:{id:'neutral'},approval:{id:'approval'}}},
  {id:'katsuki',groupId:'crew',name:'Katsuki',prefix:'Katsuki',presentation:'editorial-square',presentationSide:'right',defaultExpression:'03_angry_shout',images:{'03_angry_shout':{id:'shout'},'06_soft_smile':{id:'smile'}}}
]}
const clean=cleanCastLibrary(base)
assert.deepEqual(clean.members.map(m=>m.presentationSide),['left','right'],'Each member has one stage side')
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
for(const [key,side] of [['Shoto-neutral','left'],['Shoto-approval','left'],['Katsuki-03_angry_shout','right'],['Katsuki-06_soft_smile','right']]){
 const packet=`<swarm-cast=${key}>"Hello."</swarm-cast>`
 const html=renderCastTags(packet,clean,esc)
 assert.match(html,new RegExp(`data-cast-side="${side}"`))
 assert.match(html,/data-swarm-cast-dialogue="true"/)
 assert.equal(html.split('Hello.').length-1,1)
 assert.equal(renderCastTags(html,clean,esc),html,'Islands never recursively re-render')
}
const invalid=cleanCastLibrary({...base,members:[{...base.members[0],presentationSide:'up',expressionSides:{neutral:'right',approval:'left'}},base.members[1]]})
assert.equal(invalid.members[0].presentationSide,'auto','Mixed legacy expression directions cannot choose a member side')
const partial=cleanCastLibrary({...base,members:[{...base.members[0],presentationSide:undefined,expressionSides:{neutral:'right'}},base.members[1]]})
assert.equal(partial.members[0].presentationSide,'auto','Partial legacy directions remain Auto')
const unanimous=cleanCastLibrary({...base,members:[{...base.members[0],presentationSide:undefined,expressionSides:{neutral:'right',approval:'right'}},base.members[1]]})
assert.equal(unanimous.members[0].presentationSide,'right','Unanimous legacy directions migrate safely')
const reset=cleanCastLibrary({...clean,members:[{...clean.members[0],presentationSide:'auto'},clean.members[1]]})
assert.deepEqual(reset.members.map(m=>m.presentationSide),['auto','right'],'Auto resets only its member')
assert.equal('expressionSides' in reset.members[0],false,'Legacy per-expression map removed from canonical storage')
const story=cleanCastLibrary({...base,members:[{...base.members[0],presentation:'story'},base.members[1]]})
const packet='<swarm-cast=Shoto-neutral>"Hello."</swarm-cast>'
const nativeHtml=renderCastTags(packet,story,esc)
assert.match(nativeHtml,/data-cast-side="left"/)
assert.equal(castLiteralSource(nativeHtml),'<swarm-cast=Shoto-neutral>“Hello.”</swarm-cast>')
console.log('CAST MEMBER SIDE CONTRACT PASS: member-wide placement, independent members, legacy migration, auto reset, native/wardrobe and island preservation')
