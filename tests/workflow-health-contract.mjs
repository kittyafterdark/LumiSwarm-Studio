import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const helper = read('../src/studio/workflow-health.ts')
const expressions = read('../src/studio/expressions.ts')
const styles = read('../src/studio/styles.ts')
const buildOrder = read('../scripts/frontend-sources.mjs')
const compiled = read('../dist/frontend.js')
assert.ok(buildOrder.indexOf('src/studio/workflow-health.ts') < buildOrder.indexOf('src/studio/expressions.ts'), 'helper must build before its consumers')
assert.equal((expressions.match(/createStudioWorkflowHealthRibbon\(/g) || []).length, 2, 'upscaler and background remover use same component')
assert.ok(helper.includes('role", "status"') && helper.includes('setChecking(checking)'), 'component owns accessibility and checking state')
assert.ok(helper.includes('root.dataset.status = state'), 'component owns visual status state')
assert.ok(helper.includes('options.actionsBefore') && helper.includes('options.actionsAfter'), 'future workflows can add distinct actions')
assert.ok(styles.includes('.ss-expression-workflow-health[data-status="missing"]'), 'warning styling shared for both workflows')
assert.ok(compiled.includes('createStudioWorkflowHealthRibbon'), 'compiled runtime uses shared helper')
for (const name of ['ss-expression-upscale-check', 'ss-expression-background-check', 'Upscaler model', 'BiRefNet model']) {
  assert.ok(expressions.includes(name), `missing named health consumer: ${name}`)
}
assert.ok(expressions.includes('backgroundHealth.update(') && expressions.includes('upscaleHealth.update('), 'both workflows use shared status updates')
console.log('Unified Expression Studio Workflow Health component: PASS')
