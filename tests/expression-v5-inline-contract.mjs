import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'

// Source contract for the actual V5 renderer, not a separate CSS mockup.
const code = readFileSync(new URL('../src/studio/expressions.ts', import.meta.url), 'utf8')
const cssSource = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const css = runInNewContext(cssSource + '; STYLES')
const state = readFileSync(new URL('../src/state/expression-set.ts', import.meta.url), 'utf8')
const recipes = readFileSync(new URL('../src/state/recipes.ts', import.meta.url), 'utf8')
const registry = runInNewContext(stripTypeScriptTypes(recipes + '\n' + state, { mode: 'transform' }) +
  '; ({ cleanStudioExpressionBank, cleanStudioExpressionSet })', {})

assert.doesNotMatch(code, /const openEditor\s*=/, 'Old direction drawer must not return')
assert.doesNotMatch(code, /action\("Edit direction"/, 'Inspector must not open the old editor')
assert.match(code, /const isEditing = stage === 0 && inlineEdit\?\.row === row/)
assert.match(code, /const field = element\("textarea", "ss-textarea ss-expression-card-editarea"\)/)
assert.match(code, /field\.dataset\.expressionInlineEditor = row\.label/)
assert.match(code, /cardActions\.append\(save, cancel\)/)
assert.match(code, /const save = action\("Save", commitInlineEdit, true\)/)
assert.match(code, /const cancel = action\("Cancel", cancelInlineEdit\)/)
assert.match(code, /field\.addEventListener\("input",/)
assert.match(code, /inlineEdit\.draft = field\.value/)
assert.match(code, /inlineEdit\.draft = defaultDirection\(row\)/)
assert.match(code, /row\.direction = draft\.slice\(0, EXPRESSION_DIRECTION_LIMIT\)/)
assert.match(code, /else if \(inlineEdit\) cancelInlineEdit\(\)/)
assert.match(code, /inlineEdit = null\s+stage = index/)
assert.match(code, /const saveInlineToBank = \(\) => \{/)
assert.match(code, /label = `\$\{row\.label\} variant`/)
assert.match(code, /while \(bank\.some\(item => item\.label\.toLowerCase\(\) === label\.toLowerCase\(\)\)\)/)
assert.match(code, /const bankButton = action\(inlineEdit\.bankLabel \?/, 'Active bank status must be visible')
assert.match(code, /restore\.replaceChildren\(\)/, 'Restore must be icon-only')

const style = css.slice(css.indexOf('.ss-expression-dialog,.ss-expression-picker'), css.indexOf('.ss-library-folder-view {', css.indexOf('.ss-expression-dialog,.ss-expression-picker')))
const base = style.split('@media (max-width:1350px)')[0]
for (const selector of ['.ss-expression-card-editing','.ss-expression-card-editarea','.ss-expression-card-edit-tools','.ss-expression-card-edit-tools .ss-expression-card-bank','.ss-expression-card-edit-tools .ss-expression-card-restore svg']) {
  const re = new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'gm')
  assert.equal([...base.matchAll(re)].length, 1, `Exactly one authored CSS rule for ${selector}`)
}
assert.match(base, /\.ss-expression-card-edit-tools \{[^}]*grid-template-columns:minmax\(0,1fr\) 32px;/s)
assert.match(base, /\.ss-expression-card-editing \{[^}]*var\(--ss-[\w-]+\)/s) // themed border

// Minimal shared-state fixture: the bank must never replace canonical built-ins.
const validated = registry.cleanStudioExpressionBank([
  { id: 'variant-1', label: 'Neutral variant', direction: 'unreadable expression' },
  { id: 'reserved', label: 'neutral', direction: 'wrong override' },
])
assert.equal(validated.length, 1)
assert.equal(validated[0].label, 'Neutral variant')
const set = registry.cleanStudioExpressionSet({
  slots: [{ label: 'neutral', direction: 'stoic gaze', bankId: 'variant-1' }],
  selected: ['neutral'],
})
assert.equal(set.slots[0].direction, 'stoic gaze')
assert.equal(set.slots[0].bankId, 'variant-1')
console.log('Expression V5 inline card contract: source, themed grid, draft safety, built-in bank variants: ok')
