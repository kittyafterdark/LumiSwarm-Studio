import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

// The save preset form is a compact two-column selection sheet. The full values
// belong to the save payload even when the readable preview is shortened.
const source = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const controller = readFileSync(new URL('../src/studio/controller.ts', import.meta.url), 'utf8')
const css = runInNewContext(source + '; STYLES + STUDIO_V3_STYLES')
const sheet = css.slice(css.indexOf('/* Swarm preset sheet'), css.indexOf('.ss-workflow-fields', css.indexOf('/* Swarm preset sheet')))
assert.ok(sheet.length > 1000, 'Save modal styles are authored next to the base workflow modal')
for (const selector of ['.ss-save-preset-fields', '.ss-save-preset-basics', '.ss-save-preset-toolbar', '.ss-save-param-list', '.ss-save-param', '.ss-save-param-line', '.ss-save-param-copy', '.ss-save-param-expand', '.ss-save-param-full', '.ss-preset-manager-list']) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  assert.equal([...sheet.matchAll(new RegExp(`^${escaped}\\s*\\{`, 'gm'))].length, 1, `Only one authored base for ${selector}`)
}
assert.match(sheet, /\.ss-save-param-list\s*\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s)
assert.match(sheet, /\.ss-save-param-list\s*\{[^}]*overflow-y:auto/s)
assert.match(sheet, /@media\(max-width:630px\)[\s\S]*?\.ss-save-param-list\s*\{\s*grid-template-columns:minmax\(0,1fr\)/)
assert.match(sheet, /\.ss-save-param-copy\s*>\s*span\s*\{[^}]*text-overflow:ellipsis/s)
assert.match(sheet, /\.ss-save-param-full\s*\{[^}]*overflow:auto/s)
assert.match(sheet, /var\(--ss-border-subtle\)/)
assert.match(controller, /data-role="save-preset-modal"/)
assert.match(controller, /data-role="save-preset-select-all"/)
assert.match(controller, /data-role="save-preset-clear"/)
assert.match(controller, /checkbox\.checked = normalized !== "seed"/)
assert.match(controller, /const fullValue = String\(value\)/)
assert.match(controller, /element\("pre", "ss-save-param-full", fullValue\)/)
assert.match(controller, /expand\.setAttribute\("aria-expanded"/)
assert.match(controller, /if \(input\.checked && id && this\.pendingPresetParamMap\[id\] !== undefined\)/)
console.log('Compact preset sheet: one authored base, responsive grid, exact values, disclosure, seed opt-out, bulk selection: ok')
