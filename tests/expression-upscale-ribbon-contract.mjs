import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = file => readFileSync(new URL(file, import.meta.url), 'utf8')
const ui=read('../src/studio/expressions.ts')
const health=read('../src/studio/workflow-health.ts')
const backend=read('../src/backend.ts')
const controller=read('../src/studio/controller.ts')
const css=read('../src/studio/styles.ts')
const compiled=read('../dist/frontend.js')
const server=read('../dist/backend.js')
for (const needle of [
  'ss-expression-upscale-check',
  'check_expression_upscale_model',
  'checkUpscaleModel',
  'Upscaler model',
  'Could not check the connected SwarmUI model list',
  'no single upscaler to check here',
]) assert.ok(ui.includes(needle), `frontend source is missing ${needle}`)
for (const needle of ['inspectExpressionUpscaleModel', 'case "check_expression_upscale_model"',
  'parseUpscaleModelOptions(params)', 'models.includes(settings.model)']) assert.ok(backend.includes(needle), `backend missing ${needle}`)
assert.ok(controller.includes('check_expression_upscale_model') && controller.includes('12_000'), 'request should use short preflight timeout')
for (const needle of ['.ss-expression-upscale-check', '.ss-expression-workflow-health', '--ss-accent', '--ss-outline']) assert.ok(css.includes(needle), `authored CSS missing ${needle}`)
assert.ok(health.includes('createStudioWorkflowHealthRibbon'), 'shared workflow health component exists')
assert.ok(compiled.includes('checkUpscaleModel') && server.includes('inspectExpressionUpscaleModel'), 'compiled entrypoints include the new check')
console.log('Expression Maker upscale model preflight ribbon and compiled backend: PASS')
