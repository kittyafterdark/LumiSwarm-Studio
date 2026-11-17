import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const controller = readFileSync(new URL('../src/studio/controller.ts', import.meta.url), 'utf8')
const editor = readFileSync(new URL('../src/studio/inpaint.ts', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const dist = readFileSync(new URL('../dist/frontend.js', import.meta.url), 'utf8')
for (const pane of ['overview', 'prompt', 'details']) {
  assert.ok(controller.includes(`data-inspector-pane="${pane}"`), `${pane} tab has a dedicated pane`)
}
for (const name of ['inspector-tab', 'inspector-send-toggle', 'inspector-show-prompt', 'inspector-copy-prompt']) {
  assert.ok(controller.includes(`data-action="${name}"`), `${name} is wired`)
}
for (const action of ['edit-region', 'reuse-parameters', 'use-as-init', 'upscale-output', 'append-to-chat', 'send-character-gallery', 'set-character-picture', 'set-persona-picture', 'delete-output']) {
  assert.ok(controller.includes(`data-action="${action}"`), `existing ${action} action retained`)
}
assert.ok(controller.includes('image.details?.resolvedPrompt || image.details?.prompt'), 'region editor starts from rendered image prompt')
for (const cls of ['ss-inpaint-tool-rail', 'ss-inpaint-zoom-dock', 'ss-inpaint-settings-scroll', 'ss-inpaint-settings-foot']) {
  assert.ok(editor.includes(cls) && css.includes(`.${cls}`), `${cls} is part of its real component, not an appended overlay`)
}
assert.equal((css.match(/^\.ss-inpaint-dialog \{/gm) || []).length, 1, 'one canonical dialog CSS definition')
assert.equal((css.match(/^\.ss-inspector \{/gm) || []).length, 1, 'one canonical inspector CSS definition')
assert.ok(!css.includes('.ss-inpaint-tool-panel'), 'old control cards removed')
assert.ok(!css.includes('.ss-inspector-section'), 'old disclosure cards removed')
assert.ok(editor.includes('sourceImageId: image.id, source: photo.toDataURL("image/png")'), 'source mask generation preserved')
assert.ok(editor.includes('mask: mask.toDataURL("image/png")'), 'mask payload preserved')
assert.ok(dist.includes('ss-inpaint-tool-rail') && dist.includes('ss-inspector-tabs'), 'compiled runtime includes redesign')
console.log('Image Studio v23 source contract passed')
