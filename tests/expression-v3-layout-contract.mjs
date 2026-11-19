import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

// Keep the shipped Studio renderer aligned with the approved standalone V3 shell.
// Structural checks deliberately reject moving selection/actions back into
// separate stacked rows or the old auto-fill seven-column gallery.
const expressions = readFileSync(new URL('../src/studio/expressions.ts', import.meta.url), 'utf8')
const styleSource = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const css = runInNewContext(styleSource + '; STYLES + STUDIO_V3_STYLES')
const styles = css.slice(css.indexOf('.ss-expression-dialog,.ss-expression-picker'), css.indexOf('.ss-library-folder-view {',css.indexOf('.ss-expression-dialog,.ss-expression-picker')))
const baseRules = styles.split('@media (max-width:1350px)')[0]
for (const selector of ['.ss-expression-cards','.ss-expression-art','.ss-expression-card-head','.ss-expression-preview','.ss-expression-filters','.ss-expression-card-actions','.ss-expression-footer-identity']) {
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
  assert.equal([...baseRules.matchAll(new RegExp(`^${escaped}\\s*\\{`, 'gm'))].length,1,`One authored base for ${selector}`)
}
assert.match(baseRules,/\.ss-expression-cards\s*\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/s)
assert.match(styles,/@media \(max-width:1350px\)[\s\S]*?\.ss-expression-cards\s*\{[^}]*repeat\(4,minmax\(0,1fr\)\)/)
assert.match(styles,/@media \(max-width:1000px\)[\s\S]*?\.ss-expression-cards\s*\{[^}]*repeat\(3,minmax\(0,1fr\)\)/)
assert.match(styles,/@media \(max-width:750px\)[\s\S]*?\.ss-expression-cards\s*\{[^}]*repeat\(2,minmax\(0,1fr\)\)/)
assert.match(baseRules,/\.ss-expression-art\s*\{[^}]*aspect-ratio:9\/16/s)
assert.match(baseRules,/\.ss-expression-card-head\s*\{[^}]*position:absolute/s)
assert.match(baseRules,/\.ss-expression-preview\s*\{[^}]*position:absolute/s)
assert.match(expressions,/art\.append\(preview, cardHead\)/)
assert.match(expressions,/card\.append\(art, body, cardActions\)/)
assert.match(expressions,/\.classList\.add\("ss-expression-card-attach"\)/)
assert.match(expressions,/filterButton\.setAttribute\("aria-pressed", String\(galleryFilter === value\)\)/)
assert.match(expressions,/openInspector\(row\)/)
assert.match(expressions,/openBank\)/)
assert.doesNotMatch(expressions,/const openEditor =/)
assert.doesNotMatch(expressions,/action\("Edit direction"/)
assert.match(expressions,/beginInlineEdit\(row\)/)
assert.match(expressions,/const isEditing = stage === 0 && inlineEdit\?\.row === row/)
assert.match(expressions,/inlineEdit\.draft = defaultDirection\(row\)/)
assert.match(expressions,/const cancel = action\("Cancel", cancelInlineEdit\)/)
assert.match(expressions,/const save = action\("Save", commitInlineEdit, true\)/)
assert.match(expressions,/const runSelected = runButton/)
assert.match(expressions,/const runAll = runButton/)
for(const token of ['--ss-outline','--ss-canvas-bg','--ss-panel-bg','--ss-accent','--ss-accent-soft']) {
 assert.ok(styles.includes(`var(${token})`),`Semantic Studio theme token ${token}`)
}
console.log('V3/V4 renderer and styling: centered 5/4/3/2 responsive gallery, picture overlays, themed controls, inspector and actions: ok')
