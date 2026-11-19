import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
const code = readFileSync(new URL('../src/studio/expressions.ts', import.meta.url), 'utf8')
const styles = runInNewContext(readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8') + '; STYLES')
const section = styles.slice(styles.indexOf('.ss-expression-dialog,.ss-expression-picker'), styles.indexOf('.ss-library-folder-view {',styles.indexOf('.ss-expression-dialog,.ss-expression-picker')))
const base = section.split('@media (max-width:1350px)')[0]
const rule = selector => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const m = [...base.matchAll(new RegExp('^' + escaped + '\\s*\\{([^}]*)\\}', 'gm'))]
  assert.equal(m.length, 1, 'One authored rule for ' + selector)
  return m[0][1]
}
assert.match(code, /const editPanel = element\("div", "ss-expression-card-edit-panel"\)/)
assert.match(code, /editPanel.append\(bodyTitle\)/)
assert.match(code, /editPanel.append\(field, tools\)/)
assert.match(code, /body.append\(editPanel\)/)
assert.match(rule('.ss-expression-card-editing .ss-expression-card-info'), /position:relative/)
assert.match(rule('.ss-expression-card-editing .ss-expression-card-info'), /height:72px/)
assert.match(rule('.ss-expression-card-edit-panel'), /position:absolute; inset:auto 0 0/)
assert.match(rule('.ss-expression-card-edit-panel'), /var\(--ss-panel-hi\)/)
assert.match(rule('.ss-expression-card-edit-panel'), /var\(--ss-accent-line\)/)
assert.match(rule('.ss-expression-card-editarea'), /height:112px;[^}]*resize:none/)
assert.match(section, /@media \(max-width:600px\)[\s\S]*?\.ss-expression-card-editing \.ss-expression-card-info \{ height:67px; \}/)
assert.match(code, /row.image \? "Redo" : "Render"/)
assert.match(code, /Regenerate \$\{row.label\} portrait/)
console.log('Expression V6 card overlap: anchored editor, normal row height, mobile sizing and accessible Redo: ok')
