import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'

// A dependency-free regression fixture for the same validator used by the
// frontend's bank import and the backend's per-user JSON persistence.
const recipeSource = readFileSync('src/state/recipes.ts', 'utf8')
const expressionSource = readFileSync('src/state/expression-set.ts', 'utf8')
const validate = runInNewContext(stripTypeScriptTypes(recipeSource + '\n' + expressionSource, { mode: 'transform' }) + `
  ({ cleanStudioExpressionBank, cleanStudioExpressionSet, EXPRESSION_SPREAD, EXPRESSION_BASICS })`, {})
assert.equal(validate.EXPRESSION_SPREAD.length, 20)
assert.equal(validate.EXPRESSION_BASICS.length, 6)
const bank = validate.cleanStudioExpressionBank([
  { id: 'one', label: 'Stoic', direction: 'unreadable gaze' },
  { id: 'two', label: 'stoic', direction: 'duplicate' },
  { id: 'built-in', label: 'neutral', direction: 'must not override built-in name' },
  { id: 'invalid', label: '<b>oops</b>', direction: 'unsafe' },
  { id: 'three', label: 'Wistful', direction: 'soft distant eyes' },
])
assert.deepEqual(Array.from(bank, item => item.label), ['Stoic', 'Wistful'])
assert.equal(bank[0].direction, 'unreadable gaze')
const set = validate.cleanStudioExpressionSet({
  selected: ['neutral', 'stoic'],
  slots: [
    { label: 'Stoic', direction: 'revised', bankId: 'one' },
    { label: 'Wistful', direction: 'quiet', bankId: '../../../path' },
  ],
})
const stoic = set.slots.find(item => item.label === 'Stoic')
assert.equal(stoic.bankId, 'one')
assert.equal(set.slots.find(item => item.label === 'Wistful').bankId, undefined)
assert.equal(set.slots.length, 22)
assert.deepEqual(Array.from(set.selected), ['neutral', 'stoic'])
console.log('Expression V3 bank and set contracts: ok')
