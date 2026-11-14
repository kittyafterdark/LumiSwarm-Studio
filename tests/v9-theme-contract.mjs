import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Guard the public theme semantics at their source, not by compensating with a
// late-added stylesheet layer.
const styles=readFileSync('src/studio/styles.ts','utf8')
const prefs=readFileSync('src/settings/preferences.ts','utf8')
const options=readFileSync('src/settings/options.ts','utf8')
const controller=readFileSync('src/studio/controller.ts','utf8')
assert.match(options,/key: "accent", label: "Accent", cssProperty: "--ss-accent"/)
assert.match(controller,/accent: normalizeHexColor\(getComputedStyle\(shell\)\.getPropertyValue\("--ss-accent"\)\)/)
assert.match(prefs,/key === "accent" \? \["--lumiverse-accent"\]/)
assert.match(prefs,/\["--ss-primary-bg", primary\]/)
assert.match(prefs,/\["--ss-primary-ink", primary \? readableColorInk\(primary\) : null\]/)
assert.match(styles,/\.ss-shell \.ss-button-primary \{ background: var\(--ss-primary-bg\)/)
assert.match(styles,/--ss-primary-bg: var\(--ss-accent\)/)
for (const old of ['#a691dd','#bba8ea','#bdaaf2']) assert.ok(!styles.includes(old),`Legacy lavender ${old} should not be hardcoded in the inspector`)
assert.doesNotMatch(styles,/\[data-theme="custom"\]\s*\{\s*--lumiverse-accent:/)
console.log('v9 source theme contract: accent/Buttons separation, semantic colors, no competing reset rule: PASS')
