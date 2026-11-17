import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const controller = await readFile(new URL('../src/miniplayer/controller.ts', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
assert.match(controller, /mini\.dataset\.railLayout = this\.isMobileViewport\(\) \? "horizontal" : "vertical"/)
assert.match(controller, /const width = compact \? 64 : \(mobileRail \? Math\.min\(262, viewportWidth - 16\) : 54\)/)
assert.match(controller, /const height = compact \? 64 : \(mobileRail \? 48 : 294\)/)
assert.equal(styles.split('\n  .ss-mini-actions {').length - 1, 1, 'single authored rail declaration')
assert.equal(styles.split('.ss-miniplayer {').length - 1, 1, 'single miniplayer stylesheet')
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='vertical'\]\[data-collapsed='false'\] \{ flex-direction:column; align-items:center;/)
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='vertical'\]\[data-collapsed='false'\] \.ss-mini-actions \{ flex-direction:column; align-items:center;/)
assert.match(styles, /\.ss-miniplayer\[data-rail-layout='horizontal'\]\[data-collapsed='false'\] \.ss-mini-button/)
assert.match(controller, /this\.quickPanel = this\.root\.querySelector<HTMLElement>/)
assert.match(controller, /this\.root\.ownerDocument\.documentElement\.appendChild\(this\.quickPanel\)/)
console.log('v26 vertical toolkit/compact mobile rail + separate Quick Create contract: PASS')
