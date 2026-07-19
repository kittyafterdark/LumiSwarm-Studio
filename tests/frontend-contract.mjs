import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const {
  fitAspectWithin,
  inferModelFamily,
  modelSignalsCompatible,
} = await import("../dist/frontend.js")

assert.deepEqual(fitAspectWithin(2, 1000, 300), { width: 600, height: 300 })
assert.deepEqual(fitAspectWithin(0.5, 200, 1000), { width: 200, height: 400 })

assert.equal(inferModelFamily("BSSANIRLANIMASemi_v10"), "anima")
assert.equal(inferModelFamily("Illustrious XL v1.5"), "illustrious")
assert.equal(inferModelFamily("stable-diffusion-v1"), "sd15")
assert.equal(inferModelFamily("Flux.1 Dev"), "flux")

assert.equal(
  modelSignalsCompatible("anima-v1", "anima-v1", [], []),
  true,
  "exact SwarmUI compatibility classes should match",
)
assert.equal(
  modelSignalsCompatible("anima-v1", "illustrious-v1", [], []),
  false,
  "Anima checkpoints must exclude Illustrious LoRAs",
)
assert.equal(
  modelSignalsCompatible("", "", ["Anima Semi"], ["Illustrious style"]),
  false,
  "fallback family inference must exclude explicit cross-family models",
)
assert.equal(
  modelSignalsCompatible("", "", ["Anima Semi"], ["unclassified utility"]),
  true,
  "unknown LoRAs stay visible so incomplete metadata is not destructive",
)
assert.equal(
  modelSignalsCompatible("chroma-v1", "flux-1", [], []),
  true,
  "SwarmUI's Chroma/Flux LoRA compatibility exception should be preserved",
)

const source = await readFile(new URL("../src/frontend.ts", import.meta.url), "utf8")
assert.match(source, /useTrigger:\s*false/)
assert.match(source, /data-tab="create"/)
assert.match(source, /data-tab="loras"/)
assert.match(source, /data-tab="history"/)
assert.doesNotMatch(source, /data-tab="prompt"/)
assert.match(source, /data-action="toggle-fullscreen"/)
assert.match(source, /data-action="save-stack"/)
assert.match(source, /data-role="mobile-stack-preset"/)
assert.match(source, /data-mobile-panel="create-output"/)
assert.match(source, /data-mobile-panel="create-prompt"/)
assert.match(source, /data-resize="generation"/)
assert.match(source, /data-resize="history"/)
assert.match(source, /data-resize="dock"/)
assert.match(source, /data-resize="lora-split"/)
assert.match(source, /data-resize="prompt"/)
assert.match(source, /fitPreviewToAspect/)
assert.match(source, /data-role="inspector-positive"/)
assert.match(source, /@media \(max-width: 720px\)/)

console.log("frontend behavior contract: ok")
