import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const controller = await readFile(new URL('../src/miniplayer/controller.ts', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
assert.match(controller, /mini\.dataset\.railLayout = this\.isMobileViewport\(\) \? "horizontal" : "vertical"/)
assert.match(controller, /this\.quickView === "rail" \? \(mobileRail \? 183 : 66\)/)
assert.match(controller, /this\.quickView === "rail" \? \(mobileRail \? 64 : 220\)/)
assert.doesNotMatch(controller, /this\.quickView === "rail" \? Math\.min\(244/)
assert.equal(styles.split('\n  .ss-mini-actions {').length - 1, 1, 'one original rail action declaration only')
assert.equal(styles.split('.ss-miniplayer {').length - 1, 1, 'one authored miniplayer stylesheet only')
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='vertical'\]\[data-quick-view='rail'\]\[data-collapsed='false'\] \{ flex-direction:column; align-items:center;/)
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='vertical'\]\[data-quick-view='rail'\]\[data-collapsed='false'\] \.ss-mini-actions \{ flex-direction:column; align-items:center;/)
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='horizontal'\]\[data-quick-view='rail'\]\[data-collapsed='false'\] \.ss-mini-button/)
console.log('v20 fully stacked desktop / snug horizontal mobile rail source contract: PASS')
