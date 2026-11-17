import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const mini = readFileSync(new URL('../src/miniplayer/controller.ts', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const dist = readFileSync(new URL('../dist/frontend.js', import.meta.url), 'utf8')
for (const action of ['mini-compose', 'mini-studio', 'mini-toggle-preview', 'mini-library', 'mini-append', 'mini-show-menu']) {
  assert.match(mini, new RegExp(`data-action="${action}"`), `${action} is in the toolkit`)
}
for (const action of ['easel-close', 'easel-compose', 'easel-gallery', 'easel-generate', 'easel-append']) {
  assert.match(mini, new RegExp(`data-action="${action}"`), `${action} is wired`)
}
assert.match(mini, /this\.root\.ownerDocument\.documentElement\.appendChild\(this\.quickPanel\)/, 'Quick Create lives outside native float hitbox')
assert.match(mini, /docRoot\.appendChild\(surface\)/, 'easel uses neutral portal')
assert.match(mini, /this\.previewPosition\.width = origin\.width \+ dx/, 'drag-resize operates on preview only')
assert.match(mini, /this\.previewSurface\?\.remove\(\)/, 'destroy removes easel')
assert.match(mini, /this\.quickPanel\?\.remove\(\)/, 'destroy removes Quick Create')
assert.match(mini, /renderPreview\(artwork, percentage, hasTotal\)/, 'preview shares real activity state')
assert.match(mini, /if \(this\.snapshotValue\.active\) this\.interrupt\(\)/, 'real Stop action preserved')
assert.match(mini, /if \(action === "mini-studio"\) this\.openStudio\(\)/)
assert.match(mini, /if \(action === "mini-library" \|\| action === "mini-menu-library"\) this\.openLibrary\(\)/)
assert.match(mini, /if \(this\.previewSurface\) this\.previewSurface\.hidden = !visible/)
assert.match(css, /\.ss-mini-easel \{ position:fixed/)
assert.match(css, /\.ss-mini-easel-stage img \{ width:100%; height:100%; object-fit:contain/)
assert.match(css, /\.ss-mini-quick \{ position:fixed/)
assert.match(css, /\.ss-mini-easel\[hidden\] \{ display:none !important; \}/)
assert.match(css, /prefers-reduced-motion:reduce/)
assert.equal((css.match(/  \.ss-miniplayer \{/g) || []).length, 1, 'no stacked miniplayer CSS')
assert.equal((css.match(/  \.ss-mini-easel \{/g) || []).length, 1, 'one authored easel CSS block')
assert.equal((mini.match(/class="ss-mini-quick" data-role="mini-quick"/g) || []).length, 1)
assert.ok(dist.includes('ss-mini-easel-stage') && dist.includes('mini-toggle-preview'), 'rebuilt runtime includes easel')
console.log('v26 real toolkit, separate Quick Create, shared-state easel, cleanup and CSS: PASS')
