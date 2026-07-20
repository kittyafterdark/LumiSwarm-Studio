import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const {
  applyPresetPrompt,
  applyPresetStackPrompts,
  dimensionsForAspect,
  fitAspectWithin,
  inferModelFamily,
  modelSignalsCompatible,
} = await import("../dist/frontend.js")

assert.deepEqual(dimensionsForAspect("1:1", 1024), { width: 1024, height: 1024 })
assert.deepEqual(dimensionsForAspect("16:9", 1024), { width: 1344, height: 768 })
assert.equal(applyPresetPrompt("portrait", "cinematic, {value}"), "cinematic, portrait")
assert.equal(applyPresetPrompt("", "{value}, flat lighting"), "flat lighting")
assert.deepEqual(
  applyPresetStackPrompts(
    "portrait",
    "blurry",
    ["Cinematic", "Polish"],
    [
      { title: "Cinematic", paramMap: { prompt: "cinematic, {value}", negativeprompt: "{value}, flat" } },
      { title: "Polish", paramMap: { prompt: "{value}, detailed", negativeprompt: "messy, {value}" } },
    ],
  ),
  { prompt: "cinematic, portrait, detailed", negativePrompt: "messy, blurry, flat" },
)
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
assert.match(source, /data-action="reuse-parameters"/)
assert.match(source, /data-action="use-as-init"/)
assert.match(source, /data-action="delete-output"/)
assert.doesNotMatch(source, /data-action="open-swarm-folder"/)
assert.match(source, /data-action="open-output-library"/)
assert.match(source, /data-action="select-library-page"/)
assert.match(source, /data-action="bulk-move-outputs"/)
assert.match(source, /data-action="bulk-delete-outputs"/)
assert.match(source, /data-role="library-output-check"/)
assert.match(source, /ss-history-menu-toggle/)
assert.match(source, /data-role="preset-stack"/)
assert.match(source, /dataset\.action = "preset-up"/)
assert.match(source, /dataset\.action = "preset-down"/)
assert.match(source, /data-role="inspector-path"/)
assert.match(source, /libraryPageSize = 30/)
assert.match(source, /createOutputFolder/)
assert.match(source, /data-role="aspect"/)
assert.match(source, /data-role="size-slider"/)
assert.match(source, /data-role="link-size"/)
assert.match(source, /data-role="denoise"/)
assert.match(source, /<select class="ss-select" data-role="sampler"/)
assert.match(source, /<select class="ss-select" data-role="scheduler"/)
assert.match(source, /data-role="presets"/)
assert.match(source, /data-role="history-page"/)
assert.match(source, /data-role="output-library"/)
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
