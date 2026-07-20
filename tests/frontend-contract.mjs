import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const {
  applyPresetPrompt,
  applyPresetStackPrompts,
  dimensionsForAspect,
  fitAspectWithin,
  inferModelFamily,
  inheritQuickGenerationParameters,
  isWorkflowCoreParameter,
  matchesKeywordQuery,
  modelSignalsCompatible,
  outputLibraryPageSize,
  quickGenerationParameters,
  sanitizeCustomCss,
} = await import("../dist/frontend.js")

assert.deepEqual(dimensionsForAspect("1:1", 1024), { width: 1024, height: 1024 })
assert.deepEqual(dimensionsForAspect("16:9", 1024), { width: 1344, height: 768 })
assert.equal(applyPresetPrompt("portrait", "cinematic masterpiece"), "cinematic masterpiece")
assert.equal(applyPresetPrompt("", "flat lighting"), "flat lighting")
assert.deepEqual(
  applyPresetStackPrompts(
    "portrait",
    "blurry",
    ["Cinematic", "Polish"],
    [
      { title: "Cinematic", paramMap: { prompt: "cinematic portrait", negativeprompt: "flat lighting" } },
      { title: "Polish", paramMap: { prompt: "polished anime portrait", negativeprompt: "messy anatomy" } },
    ],
  ),
  { prompt: "polished anime portrait", negativePrompt: "messy anatomy" },
)
assert.deepEqual(fitAspectWithin(2, 1000, 300), { width: 600, height: 300 })
assert.deepEqual(fitAspectWithin(0.5, 200, 1000), { width: 200, height: 400 })
assert.equal(matchesKeywordQuery("anima portrait", ["Anima model", "soft portrait"]), true)
assert.equal(matchesKeywordQuery('"soft portrait" anima', ["Anima model", "soft portrait"]), true)
assert.equal(matchesKeywordQuery("illustrious portrait", ["Anima model", "soft portrait"]), false)
assert.equal(outputLibraryPageSize(390), 15)
assert.equal(outputLibraryPageSize(720), 15)
assert.equal(outputLibraryPageSize(721), 30)
assert.deepEqual(
  quickGenerationParameters({ width: 576, height: 384, steps: 26, cfg_scale: 4, sampler: "euler", scheduler: "beta57" }),
  {
    width: 576,
    height: 384,
    steps: 26,
    cfgScale: 4,
    seed: -1,
    sampler: "euler",
    scheduler: "beta57",
    loras: [],
    loraWeights: [],
  },
)
assert.equal(quickGenerationParameters({ width: 9000 }).width, 4096)
assert.deepEqual(
  inheritQuickGenerationParameters(
    { sampler: "euler", scheduler: "normal" },
    {
      sampler: "dpmpp_2m_sde_gpu",
      scheduler: "beta57",
      rawRequestOverride: JSON.stringify({ presets: ["Cinematic", "Polish"] }),
      loras: ["styles/ink.safetensors"],
    },
  ),
  {
    sampler: "dpmpp_2m_sde_gpu",
    scheduler: "beta57",
    rawRequestOverride: JSON.stringify({ presets: ["Cinematic", "Polish"] }),
    loras: ["styles/ink.safetensors"],
  },
)
assert.equal(isWorkflowCoreParameter("negative_prompt"), true)
assert.equal(isWorkflowCoreParameter("comfyrawworkflowinputdecimaldenoiseb"), false)
assert.doesNotMatch(sanitizeCustomCss('@import "https://example.com/x.css"; .ss-shell { color: red; }'), /@import\s+"/)
assert.match(sanitizeCustomCss('@import "https://example.com/x.css"; .ss-shell { color: red; }'), /\.ss-shell/)

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
assert.match(source, /data-action="change-orientation"/)
assert.match(source, /data-action="toggle-seed-mode"/)
assert.match(source, /data-action="random-seed-mobile"/)
assert.match(source, /ss-mobile-prompt-tools[\s\S]*?data-action="open-output-library"[\s\S]*?data-action="random-seed-mobile"/)
assert.match(source, /data-role="workflow-select"/)
assert.match(source, /data-role="workflow-fields"/)
assert.match(source, /load_swarm_workflow/)
assert.match(source, /comfyuicustomworkflow/)
assert.match(source, /createWorkflowField/)
assert.match(source, /createFloatWidget/)
assert.match(source, /class MiniPlayerController/)
assert.match(source, /data-action="mini-interrupt"/)
assert.match(source, /data-action="mini-expand"/)
assert.match(source, /data-action="mini-generate"/)
assert.match(source, /Quick create/)
assert.match(source, /activitySnapshot\?\.latestImage/)
assert.match(source, /activitySnapshot\?\.draft/)
assert.match(source, /exportDraft\(\)/)
assert.match(source, /pendingDraftRestore/)
assert.match(source, /captureDraft\(activeStudio\?\.exportDraft\(\)/)
assert.match(source, /draft\?\.details\.presets/)
assert.match(source, /ss-miniplayer/)
assert.match(source, /data-role="workflow-modal"/)
assert.match(source, /data-action="open-workflow-setup"/)
assert.match(source, /data-action="use-standard-workflow"/)
assert.match(source, /EXPAND_ICON/)
assert.doesNotMatch(source, /data-action="open-workflow-setup"[^>]*>Setup</)
assert.match(source, /ss-mobile-prompt-tools/)
assert.match(source, /data-mobile-panel="create-prompt"[\s\S]*?ss-negative-v3[\s\S]*?data-action="random-seed-mobile"/)
assert.match(source, /"interrupt-generation"/)
assert.match(source, /data-action="add-swarm-preset"/)
assert.match(source, /data-action="save-stack"/)
assert.match(source, /data-action="reuse-parameters"/)
assert.match(source, /data-action="use-as-init"/)
assert.match(source, /data-action="append-to-chat"/)
assert.match(source, /append_output_to_chat/)
assert.match(source, /data-action="delete-output"/)
assert.doesNotMatch(source, /data-action="open-swarm-folder"/)
assert.match(source, /data-action="open-output-library"/)
assert.match(source, /data-role="library-search"/)
assert.match(source, /Search prompts, model, LoRAs, presets/)
assert.match(source, /data-action="select-library-page"/)
assert.match(source, /data-action="bulk-move-outputs"/)
assert.match(source, /data-action="bulk-delete-outputs"/)
assert.match(source, /data-role="library-output-check"/)
assert.match(source, /ss-history-menu-toggle/)
assert.match(source, /data-role="preset-stack"/)
assert.match(source, /dataset\.action = "preset-up"/)
assert.match(source, /dataset\.action = "preset-down"/)
assert.match(source, /data-role="inspector-path"/)
assert.match(source, /currentLibraryPageSize/)
assert.match(source, /createOutputFolder/)
assert.match(source, /data-role="aspect"/)
assert.match(source, /data-role="size-slider"/)
assert.match(source, /data-role="link-size"/)
assert.match(source, /data-role="size-link"/)
assert.match(source, /data-role="generation-progress"/)
assert.match(source, /data-role="denoise"/)
assert.match(source, /\.ss-creativity-row\s*\{\s*grid-column:\s*1\s*\/\s*-1/)
assert.match(source, /const size = window\.innerWidth <= 600 \? 40 : 56/)
assert.match(source, /ss-mini-reopen/)
assert.match(source, /collapsed player's open control[\s\S]*event\.stopPropagation\(\)/)
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
assert.match(source, /fitInspectorToSpace/)
assert.match(source, /data-role="inspector-positive"/)
assert.match(source, /data-role="inspector-presets"/)
assert.match(source, /ss-stack-preview/)
assert.match(source, /data-action="toggle-config"/)
assert.match(source, /data-action="set-theme"/)
assert.match(source, /type StudioTheme = "lumiverse" \| "custom"/)
assert.match(source, /studioAppearanceIsCustom/)
assert.match(source, /FRAME_WALL_ICON/)
assert.doesNotMatch(source, /STUDIO_ICON/)
assert.match(source, /SPARKLE_ICON/)
assert.match(source, /ss-launcher-corner/)
assert.match(source, /ss-launcher-emblem/)
assert.match(source, /ss-launcher-wordmark/)
assert.match(source, /"Open Studio"/)
assert.match(source, /"Open Library"/)
assert.doesNotMatch(source, /Moonbloom|Sakura|Verdant/)
assert.match(source, /data-role="appearance-color"/)
assert.match(source, /data-role="appearance-radius"/)
assert.match(source, /data-role="appearance-opacity"/)
assert.match(source, /data-role="appearance-blur"/)
assert.match(source, /data-role="custom-css"/)
assert.match(source, /data-action="apply-custom-css"/)
assert.match(source, /data-action="reset-appearance"/)
assert.match(source, /--lumiverse-primary/)
assert.match(source, /\.ss-topbar\s*\{[\s\S]*?z-index:\s*60/)
assert.match(source, /@media \(max-width: 720px\)/)

console.log("frontend behavior contract: ok")
