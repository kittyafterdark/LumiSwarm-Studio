from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/inline/cast-narrative.ts'
s=p.read_text(encoding='utf-8')
needle='''  private recoverMissingNarration(element: Element,view: StudioCastLiveView,source: string,plans: ReturnType<StudioCastNarrative["sourcePlans"]>,snapshotText:string):void {
    const parts=this.sourceNarration(source,plans)
    const seen=new Set<number>()
'''
replace='''  // Only a text-bearing response surface may own source-backed prose.
  // listMessageElements() may return the whole message shell (with a bubble,
  // toolbar and foreign widget), not the inner prose root. A source-position
  // estimate against that shell can otherwise mount inside a choice widget or
  // append missing narration *after* the chat bubble.
  private narrativeBody(element: Element, source: string, plans: ReturnType<StudioCastNarrative["sourcePlans"]>): {root: Element; paragraph: Element} | null {
    const parts = this.sourceNarration(source,plans)
      .filter(part=>this.recoverableProseOnly(part))
      .map(part=>{const fragment=document.createElement("template");fragment.innerHTML=castPacketInput(part);return this.normalize(fragment.content.textContent||"").trim()})
      .filter(part=>part.length>=24)
    if(!parts.length)return null
    for(const paragraph of element.querySelectorAll("p,li,blockquote")){
      if(paragraph.closest('[data-ss-cast-live],[data-ss-cast-recovered],button,nav,[role="toolbar"]'))continue
      const text=this.normalize(paragraph.textContent||"").trim()
      if(text.length<24)continue
      // A matching source excerpt, not just an arbitrary <p> in a widget,
      // proves this is where the host rendered the original narrative.
      const start=text.slice(0,Math.min(48,text.length))
      if(parts.some(part=>part.includes(start)))return {root:paragraph.parentElement||element,paragraph}
    }
    return null
  }
  private recoverMissingNarration(element: Element,view: StudioCastLiveView,source: string,plans: ReturnType<StudioCastNarrative["sourcePlans"]>,snapshotText:string):void {
    const parts=this.sourceNarration(source,plans)
    const surface=this.narrativeBody(element,source,plans)
    // Never fall through to element.append(): that element can be the entire
    // message shell, and a choice UI may be its final child. Missing prose
    // without a verified native narrative body is safer left untouched.
    if(!surface){for(const entry of view.recovered.values())entry.node.remove();view.recovered.clear();return}
    const owns=(slot:StudioCastLiveSlot|undefined):boolean=>{
      const wrapper=slot?.wrapper
      if(!wrapper?.isConnected||!surface.root.contains(wrapper))return false
      const paragraph=wrapper.closest('p,li,blockquote')
      return wrapper.parentElement===surface.root || paragraph?.parentElement===surface.root
    }
    const seen=new Set<number>()
'''
if s.count(needle)!=1: raise Exception('recover anchor count '+str(s.count(needle)))
s=s.replace(needle,replace)
needle='''      const next=i<plans.length?view.slots.get(`${plans[i].key.toLowerCase()}:${i}`):null
      const prev=i>0?view.slots.get(`${plans[i-1].key.toLowerCase()}:${i-1}`):null
      const before=next?.leading.isConnected?next.leading:next?.wrapper
      if(before?.isConnected){if(node.nextSibling!==before)before.before(node)}
      else if(prev?.wrapper.isConnected){if(prev.wrapper.nextSibling!==node)prev.wrapper.after(node)}
      else if(!node.isConnected)element.append(node)
'''
replace='''      const next=i<plans.length?view.slots.get(`${plans[i].key.toLowerCase()}:${i}`):undefined
      const prev=i>0?view.slots.get(`${plans[i-1].key.toLowerCase()}:${i-1}`):undefined
      const before=owns(next)?(next!.leading.isConnected?next!.leading:next!.wrapper):null
      if(before){if(node.nextSibling!==before)before.before(node)}
      else if(owns(prev)){if(prev!.wrapper.nextSibling!==node)prev!.wrapper.after(node)}
      else if(i===0 && surface.paragraph.isConnected){
        if(node.nextSibling!==surface.paragraph)surface.paragraph.before(node)
      }else if(i>0 && surface.paragraph.isConnected){
        // Only a verified source paragraph is a safe last-resort anchor. Keep
        // text inside its body and *before* any later widget siblings.
        if(surface.paragraph.nextSibling!==node)surface.paragraph.after(node)
      }else{node.remove();view.recovered.delete(i);seen.delete(i)}
'''
if s.count(needle)!=1: raise Exception('recovery placement count '+str(s.count(needle)))
s=s.replace(needle,replace)
needle='''    const sourcePlans = this.sourcePlans(source)
    const plans = sourcePlans.length ? sourcePlans : this.sourcePlans(snapshot.text)
    if (plans.length) view.source = sourcePlans.length ? source : snapshot.text
    for (const plan of plans) {
'''
replace='''    const sourcePlans = this.sourcePlans(source)
    const plans = sourcePlans.length ? sourcePlans : this.sourcePlans(snapshot.text)
    const narrative=this.narrativeBody(element,source,plans)
    if (plans.length) view.source = sourcePlans.length ? source : snapshot.text
    for (const plan of plans) {
'''
if s.count(needle)!=1: raise Exception('plans anchor '+str(s.count(needle)))
s=s.replace(needle,replace)
needle='''      const position = bodyOnly?undefined:snapshot.positions[anchor] || (anchor === snapshot.positions.length ? snapshot.positions.at(-1) : undefined)
      const anchorOffset = position ? (anchor === snapshot.positions.length ? position.offset+1 : position.offset) : 0
'''
replace='''      const position = bodyOnly?undefined:snapshot.positions[anchor] || (anchor === snapshot.positions.length ? snapshot.positions.at(-1) : undefined)
      const anchorOffset = position ? (anchor === snapshot.positions.length ? position.offset+1 : position.offset) : 0
      // A source-proportional guess can land on the title of an unrelated
      // widget, because the host's whole message shell includes that title.
      // If we cannot verify the actual packet or native quote, relocate the
      // decorative mount to the known prose block, never inside foreign UI.
      const unverified=exactStart<0&&tagStart<0&&quoteStart<0
      const nativeParagraph=position?.node.parentElement?.closest('p,li,blockquote')
      const foreignGuess=unverified&&narrative&&(
        !position || !narrative.root.contains(position.node) || nativeParagraph?.parentElement!==narrative.root
      )
      if(unverified&&!narrative&&snapshot.text.trim())continue
'''
if s.count(needle)!=1: raise Exception('position anchor '+str(s.count(needle)))
s=s.replace(needle,replace)
needle='''      const block = position && plan.standalone && tagStart < 0 && quoteStart < 0
        ? position.node.parentElement?.closest("p,li,blockquote") : null
      const blockMount = !!block && element.contains(block) && block !== element
      if (blockMount) {
        const insertAfter = side === "before" && anchorOffset > 0
        if (insertAfter) { if (block!.nextSibling !== slot.wrapper) block!.after(slot.wrapper) }
        else if (block!.previousSibling !== slot.wrapper) block!.before(slot.wrapper)
'''
replace='''      const block = foreignGuess ? narrative!.paragraph : position && plan.standalone && tagStart < 0 && quoteStart < 0
        ? position.node.parentElement?.closest("p,li,blockquote") : null
      const blockMount = !!block && element.contains(block) && block !== element
      if (blockMount) {
        // Preserve the source order when several stripped packets share the
        // same safe paragraph anchor. Never insert a later portrait ahead of
        // an earlier one, or onto a foreign widget's title text.
        const priorPlan=plans[ordinal-2]
        const priorSlot=priorPlan&&view.slots.get(`${priorPlan.key.toLowerCase()}:${ordinal-2}`)
        const afterPrior=foreignGuess && priorSlot?.wrapper.isConnected && priorSlot.wrapper.parentElement===block!.parentElement
        if(afterPrior){if(priorSlot!.wrapper.nextSibling!==slot.wrapper)priorSlot!.wrapper.after(slot.wrapper)}
        else {
          const insertAfter = foreignGuess || (side === "before" && anchorOffset > 0)
          if (insertAfter) { if (block!.nextSibling !== slot.wrapper) block!.after(slot.wrapper) }
          else if (block!.previousSibling !== slot.wrapper) block!.before(slot.wrapper)
        }
'''
if s.count(needle)!=1: raise Exception('block anchor '+str(s.count(needle)))
s=s.replace(needle,replace)
p.write_text(s,encoding='utf-8')
print('Patched',p)
