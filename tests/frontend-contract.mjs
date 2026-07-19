import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const {
  inferModelFamily,
  modelSignalsCompatible,
} = await import("../dist/frontend.js")

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
assert.match(source, /data-action="toggle-fullscreen"/)
assert.match(source, /data-action="save-stack"/)
assert.match(source, /data-role="inspector-positive"/)
assert.match(source, /@media \(max-width: 720px\)/)

console.log("frontend behavior contract: ok")
