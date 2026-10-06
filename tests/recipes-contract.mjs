import assert from 'node:assert/strict'
import { sanitizeGenerationRecipe, sanitizeStudioDefaults, sanitizeRenderStyles, resolveGenerationConfig, recipeParameters } from '../dist/frontend.js'
assert.deepEqual(sanitizeGenerationRecipe({ width: '1024', height: 832, cfg: 0, steps: Infinity, sampler: '', seed: 123 }), { height: 832, cfg: 0, sampler: '' })
assert.equal(sanitizeStudioDefaults(null), null)
assert.equal(sanitizeStudioDefaults([]), null)
assert.equal(sanitizeStudioDefaults({ version: 99 }), null)
assert.deepEqual(sanitizeStudioDefaults({ width: 1024, seed: 42, prompt: 'private', initImage: 'x' }), { version: 1, width: 1024 })
assert.deepEqual(sanitizeRenderStyles([null, {}, {id:'s', name:'Soft', loraStackId:'missing', recipe:{ steps:30, seed:42 } }]), [{id:'s', name:'Soft', loraStackId:'missing', recipe:{steps:30}}])
const names = ['provider', 'studioDefaults', 'liveProfile', 'style', 'characterBase', 'characterLook', 'job']
const layers = {}
for (const [index, name] of names.entries()) {
  const recipe = { width: 640 + index * 64, height: 768 + index * 64, steps: 20 + index, cfg: index, sampler: `sampler${index}`, scheduler: `scheduler${index}` }
  layers[name] = Object.freeze({ ...recipe, checkpoint: `model${index}` })
  const result = resolveGenerationConfig(layers)
  assert.deepEqual(result, { ...recipe, checkpoint: `model${index}` })
  assert.notEqual(result, layers[name])
}
assert.deepEqual(resolveGenerationConfig({ liveProfile: { width: 1024, seed: 123 }, style: null, characterBase: { generationRecipe: { cfg: 0 } }, characterLook: {} }), { width: 1024, cfg: 0 })
assert.deepEqual(recipeParameters({cfg:0, steps:25}), {steps:25, cfgScale:0})
console.log('recipe precedence and sanitization: ok')
