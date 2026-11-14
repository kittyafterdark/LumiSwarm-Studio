import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const src = await readFile(new URL('../src/miniplayer/controller.ts', import.meta.url), 'utf8')
assert.match(src, /this\.negativeExpanded = !this\.negativeExpanded\s+if \(!this\.collapsed && this\.quickView === "composer"\) this\.resizeWidget\(\)/)
assert.match(src, /const collapsedComposerHeight = Math\.min\(390, Math\.max\(300, expandedComposerHeight - 125\)\)/)
assert.match(src, /const models = Array\.isArray\(data\.chatVisuals\?\.models\)/)
assert.match(src, /this\.quickModelLabels\.get\(modelId\.toLowerCase\(\)\)/)
assert.match(src, /activeConnection \? String\(activeConnection\.name \|\| "SwarmUI"\)/)
assert.doesNotMatch(src, /this\.quickConnection\.model \|\| "connection default"/)
assert.match(src, /if \(this\.contextMenu && !this\.contextMenu\.hidden\) this\.closeContextMenu\(\)/)
assert.match(src, /!target\.closest\('\[data-action="mini-show-menu"\]'\)/)
console.log('v21 composer resize / friendly metadata / reversible ⋯ menu: PASS')
