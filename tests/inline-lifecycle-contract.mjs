import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { TaggedImageController, defaultStudioBehavior } from '../dist/frontend.js'

const dom = new JSDOM('<main></main>', { url: 'https://studio.test' })
for (const name of ['window', 'document', 'HTMLElement', 'MutationObserver']) globalThis[name] = dom.window[name]
const tagA = '<swarm-image request="generate" output="url" slot="quiet">harbor</swarm-image>'
const tagB = '<swarm-image request="generate" output="url" slot="harbor">harbor at dusk</swarm-image>'
let activeChatId = 'chat'
let message = { id: 'message', chat_id: 'chat', swipe_id: 0, swipes: [tagA, tagB], content: tagA }
const handlers = new Map(), widgets = new Map(), sent = []
let mounts = 0, writes = 0, menuResolve
const ctx = {
  getActiveChat: () => ({ chatId: activeChatId }),
  events: { on(name, handler) { handlers.set(name, handler); return () => handlers.delete(name) } },
  sendToBackend: value => sent.push(value),
  chats: { updateMessage() { writes++; throw Error('A completion must not save stale source') } },
  ui: { showContextMenu: () => new Promise(resolve => { menuResolve = resolve }) },
  messages: {
    getRecent: () => [message],
    getContent: id => id === message.id ? message.content : null,
    renderWidget(options, handler) {
      mounts++
      widgets.set(options.widgetId, { ...options, handler })
      return () => widgets.delete(options.widgetId)
    },
  },
}
const controller = new TaggedImageController(ctx, defaultStudioBehavior(), () => {}, () => false, () => {})
const a = { id: 'a', chatId: 'chat', messageId: 'message', slot: 'quiet', swipeId: 0, tagFingerprint: '1qjubnl', status: 'requested', output: 'url', inserted: false, error: '', clientJobId: '' }
const b = { ...a, id: 'b', slot: 'harbor', swipeId: 1, tagFingerprint: '4yds2d', alt: 'Dusk harbor' }
const state = job => controller.onMessage({ type: 'tagged_image_job', data: { ...job } })
const swipe = index => {
  message = { ...message, swipe_id: index, content: message.swipes[index] }
  handlers.get('MESSAGE_SWIPED')({ chatId: 'chat', message })
}

state(a)
assert.equal(widgets.size, 1)
const original = [...widgets.values()][0]
state(a)
controller.onMessage({ type: 'tagged_image_jobs_result', data: [a] })
assert.equal(mounts, 1, 'Unchanged snapshots preserve frame identity and keyboard focus')
assert.equal([...widgets.values()][0], original)
swipe(1)
assert.equal(widgets.size, 0, 'A strip never follows its message onto another swipe')
state(b)
assert.equal(widgets.size, 1)
state({ ...a, status: 'failed', clientJobId: 'old-attempt', error: 'Old swipe failed' })
assert.equal(widgets.size, 1, 'A late failure stays off the selected alternative')
assert.match([...widgets.values()][0].html, /Dusk harbor/)
swipe(0)
assert.equal(widgets.size, 1, 'Returning to a swipe restores only its own recovery control')
assert.match([...widgets.values()][0].html, /Old swipe failed/)

swipe(1)
controller.onMessage({ type: 'tagged_message_reconciled', data: { jobId: a.id, chatId: 'chat', messageId: 'message', clientJobId: 'old-attempt', content: 'STALE SWIPE A' } })
assert.equal(writes, 0)
assert.equal(message.content, tagB, 'Completion never overwrites the selected swipe or a newer edit')
assert.equal(widgets.size, 1)

// An obsolete iframe callback and an already-open menu cannot act after navigation.
const bWidget = [...widgets.values()][0]
bWidget.handler({ type: 'menu' })
assert.equal(typeof menuResolve, 'function')
activeChatId = 'other'
handlers.get('CHAT_SWITCHED')({ chatId: 'other' })
assert.equal(widgets.size, 0)
menuResolve({ selectedKey: 'retry-current' })
await Promise.resolve()
bWidget.handler({ type: 'generate' })
assert.equal(sent.length, 0, 'Late actions from an inactive chat do not start generation')
activeChatId = 'chat'
handlers.get('CHAT_SWITCHED')({ chatId: 'chat' })
assert.equal(widgets.size, 1)

controller.onMessage({ type: 'tagged_image_removed', data: { jobId: b.id, chatId: 'chat', messageId: 'message', content: '' } })
assert.equal(widgets.size, 0)
state(b)
controller.onMessage({ type: 'tagged_image_jobs_result', data: [a, b] })
assert.equal(widgets.size, 0, 'Removed jobs cannot be resurrected by late individual or list replies')
controller.destroy()
assert.equal(handlers.size, 0, 'Unload releases every host-event subscription')

// A permission/transport error before a persisted job exists must be recoverable,
// including when its reply arrives while another chat is selected.
activeChatId = 'chat'
message = { ...message, swipe_id: 0, content: tagA }
const transport = new TaggedImageController(ctx, defaultStudioBehavior(), () => {}, () => false, () => {})
transport.handleTag({ chatId: 'chat', messageId: 'message', fullMatch: tagA, content: 'harbor', attrs: { request: 'generate', slot: 'quiet', output: 'url' } })
const requestId = sent.at(-1).requestId
activeChatId = 'other'
handlers.get('CHAT_SWITCHED')({ chatId: 'other' })
transport.onMessage({ type: 'studio_error', requestId, error: 'Image Generation permission is required' })
assert.equal(widgets.size, 0)
activeChatId = 'chat'
handlers.get('CHAT_SWITCHED')({ chatId: 'chat' })
assert.match([...widgets.values()][0].html, /permission is required/)
assert.match([...widgets.values()][0].html, />Retry<\/button>/)
transport.destroy()
const broken = new TaggedImageController({ ...ctx, sendToBackend() { throw Error('Transport disconnected') } }, defaultStudioBehavior(), () => {}, () => false, () => {})
broken.handleTag({ chatId: 'chat', messageId: 'message', fullMatch: tagA, content: 'harbor', attrs: { request: 'generate', slot: 'quiet', output: 'url' } })
assert.match([...widgets.values()][0].html, /Transport disconnected/)
broken.destroy()

const snapshots = new TaggedImageController(ctx, defaultStudioBehavior(), () => {}, () => false, () => {})
snapshots.onMessage({ type: 'tagged_image_job', data: { ...a, updatedAt: 200 } })
snapshots.onMessage({ type: 'tagged_image_jobs_result', snapshotAt: 100, data: [] })
assert.equal(widgets.size, 1, 'A list read before a live event cannot erase its job')
snapshots.onMessage({ type: 'tagged_image_jobs_result', snapshotAt: 300, data: [] })
assert.equal(widgets.size, 0, 'A fresh authoritative removal still cleans the widget')
snapshots.destroy()

const replay = new TaggedImageController(ctx, defaultStudioBehavior(), () => {}, () => false, () => {})
message = { ...message, swipe_id: 0, content: '/api/v1/images/completed' }
replay.onMessage({ type: 'tagged_image_job', data: { ...a, clientJobId: 'attempt-one', status: 'ready', inserted: true, imageUrl: message.content, updatedAt: 10 } })
const replaySends = sent.length
replay.handleTag({ chatId: 'chat', messageId: 'message', fullMatch: tagA, content: 'harbor', attrs: { request: 'generate', slot: 'quiet', output: 'url' }, isStreaming: false })
assert.equal(sent.length, replaySends, 'A replay after its raw tag became a URL reuses the swipe-bound job')
message = { ...message, content: tagA }
replay.onMessage({ type: 'tagged_image_job', data: { ...a, clientJobId: 'attempt-two', status: 'generating', updatedAt: 11 } })
replay.onMessage({ type: 'tagged_image_job', data: { ...a, clientJobId: 'attempt-two', status: 'failed', error: 'Current attempt failed', updatedAt: 12 } })
replay.onMessage({ type: 'tagged_image_job', data: { ...a, clientJobId: 'attempt-one', status: 'ready', inserted: true, imageUrl: '/api/v1/images/old', updatedAt: 12 } })
assert.match([...widgets.values()][0].html, /Current attempt failed/, 'An old attempt cannot replace a newer failure at the same timestamp')
replay.destroy()

// Identical prompts in two real messages do not prove a transient-ID remap.
const firstMessage = { ...message, id: 'first-real', content: tagA, swipe_id: 0 }
const secondMessage = { ...message, id: 'second-real', content: tagA, swipe_id: 0 }
const messagePair = [firstMessage, secondMessage]
const pairSends = []
const pair = new TaggedImageController({ ...ctx, sendToBackend: value => pairSends.push(value), messages: { ...ctx.messages, getRecent: () => messagePair, getContent: id => messagePair.find(item => item.id === id)?.content ?? null } }, defaultStudioBehavior(), () => {}, () => false, () => {})
pair.onMessage({ type: 'tagged_image_job', data: { ...a, messageId: firstMessage.id, status: 'ready', inserted: false, imageUrl: '/api/v1/images/first' } })
pair.handleTag({ chatId: 'chat', messageId: secondMessage.id, fullMatch: tagA, content: 'harbor', attrs: { request: 'generate', slot: 'quiet', output: 'url' }, isStreaming: false })
assert.equal(pairSends.some(item => item.type === 'retry_tagged_attachment' && item.jobId === a.id), false, 'An earlier real message retains its image owner')
assert.equal(pairSends.filter(item => item.type === 'tag_generate').length, 1)
pair.destroy()

// Execute the actual strip script with controlled timers and sandbox messages.
let clock = 10_000, timerId = 0
const timers = new Map(), actions = []
const frame = new JSDOM(original.html, {
  runScripts: 'dangerously',
  beforeParse(win) {
    win.spindleSandbox = { postMessage: value => actions.push(value.type) }
    win.setTimeout = fn => { const id = ++timerId; timers.set(id, fn); return id }
    win.clearTimeout = id => timers.delete(id)
    win.Date.now = () => clock
  },
})
const card = frame.window.document.querySelector('#card')
const copy = card.querySelector('.copy')
const touch = (node, type, count = 1) => {
  const event = new frame.window.Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: Array.from({ length: count }, () => ({})) })
  node.dispatchEvent(event)
}
for (const cancelEvent of ['touchmove', 'touchend', 'touchcancel']) {
  touch(copy, 'touchstart')
  assert.equal(timers.size, 1)
  touch(copy, cancelEvent)
  assert.equal(timers.size, 0, `${cancelEvent} cancels the pending long press`)
}
touch(copy, 'touchstart')
frame.window.dispatchEvent(new frame.window.Event('pagehide'))
assert.equal(timers.size, 0, 'Leaving a frame cancels a held gesture')
touch(copy, 'touchstart', 2)
assert.equal(timers.size, 0, 'Pinch/multi-touch does not open a menu')
const generate = card.querySelector('[data-action="generate"]')
touch(generate, 'touchstart')
assert.equal(timers.size, 0, 'Holding Generate never also opens the card menu')
generate.click()
assert.deepEqual(actions, ['generate'])
generate.dispatchEvent(new frame.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
assert.deepEqual(actions, ['generate'], 'Native long press on a primary button does not also open the card menu')
touch(copy, 'touchstart')
const [id, fire] = timers.entries().next().value
timers.delete(id); fire()
clock += 100
copy.dispatchEvent(new frame.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
assert.deepEqual(actions, ['generate', 'menu'], 'Native contextmenu and long press open one menu')
clock += 800
card.querySelector('[data-action="menu"]').click()
assert.deepEqual(actions, ['generate', 'menu', 'menu'])
frame.window.close()
// Diagnostics are read-only, source/compiled remain separate, and the dialog
// is disposed on extension unload. Drive the real menu action.
activeChatId='chat'
message={...message,id:'message',swipe_id:0,content:tagA}
const diagnostics=new TaggedImageController(ctx,defaultStudioBehavior(),()=>{},()=>false,()=>{})
const diagnosticJob={...a,sourcePrompt:'left man [character]: <script>literal</script>',prompt:'Left: man, black hair',negativePrompt:'blurry',promptCompiler:'anima',clientJobId:'diagnostic-attempt',status:'failed'}
diagnostics.onMessage({type:'tagged_image_job',data:diagnosticJob})
// JSDOM may not implement the native dialog top-layer APIs.
const dialogProto=dom.window.HTMLDialogElement.prototype
if (!dialogProto.showModal) dialogProto.showModal=function(){this.setAttribute('open','')}
if (!dialogProto.close) dialogProto.close=function(){this.removeAttribute('open');this.dispatchEvent(new dom.window.Event('close'))}
;[...widgets.values()][0].handler({type:'menu'})
menuResolve({selectedKey:'prompt-diagnostics'})
await Promise.resolve()
const diagnosticDialog=document.querySelector('.ss-inline-prompt-diagnostics')
assert.ok(diagnosticDialog)
assert.deepEqual([...diagnosticDialog.querySelectorAll('textarea')].map(e=>e.value),[diagnosticJob.sourcePrompt,diagnosticJob.prompt,diagnosticJob.negativePrompt])
assert.ok([...diagnosticDialog.querySelectorAll('textarea')].every(e=>e.readOnly))
assert.equal(diagnosticDialog.querySelector('script'),null)
assert.match(diagnosticDialog.textContent,/Compiler: Anima/)
diagnostics.destroy()
assert.equal(document.querySelector('.ss-inline-prompt-diagnostics'),null)
console.log('Prompt diagnostics: raw and compiled separation, safe text, readonly and disposal: PASS')
dom.window.close()
console.log('inline lifecycle: swipe/chat scope, stable frame identity, late actions/removal, no stale writes, and touch cancellation: ok')
