import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
const source = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const code = readFileSync(new URL('../src/studio/expressions.ts', import.meta.url), 'utf8')
const css = runInNewContext(source + '; STYLES')
const section = css.slice(css.indexOf('.ss-expression-dialog,.ss-expression-picker'), css.indexOf('.ss-library-folder-view {',css.indexOf('.ss-expression-dialog,.ss-expression-picker')))
const base = section.split('@media (max-width:1350px)')[0]
const rule = selector => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...base.matchAll(new RegExp(`^${escaped}\\s*\\{([^}]*)\\}`, 'gm'))]
  assert.equal(matches.length,1,`One authored rule required for ${selector}`)
  return matches[0][1]
}
const dialog = rule('.ss-expression-dialog,.ss-expression-picker')
assert.match(dialog,/position:fixed; inset:0;/)
assert.doesNotMatch(dialog,/app-interactive-safe-top/)
assert.match(dialog,/app-scaled-viewport-height/)
const gallery = rule('.ss-expression-cards')
assert.match(gallery,/repeat\(5,minmax\(0,1fr\)\)/)
assert.match(rule('.ss-expression-controls,.ss-expression-gallery-head,.ss-expression-cards'),/max-width:1280px; margin-inline:auto/)
const inspector = rule('.ss-expression-inspector-image')
assert.match(inspector,/position:relative/)
assert.match(inspector,/overflow:hidden/)
assert.match(rule('.ss-expression-inspector-image img'),/position:absolute; inset:0/)
assert.match(rule('.ss-expression-inspector-image img'),/object-fit:contain/)
assert.match(rule('.ss-expression-naming'),/grid-template-columns/)
assert.match(rule('.ss-expression-naming-example'),/display:grid/)
assert.match(code,/const exampleWrap = element\("div", "ss-expression-naming-example"\)/)
assert.match(code,/mapping\.append\(sendPrefixField, exampleWrap\)/)
assert.match(rule('.ss-expression-overview-copy h3'),/font-size:clamp\(19px,1\.65vw,23px\)/)
console.log('Expression V4 layout: full-screen top, centered gallery, bounded inspector, naming example and compact headers: ok')
