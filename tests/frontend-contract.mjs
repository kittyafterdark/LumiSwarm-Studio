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
  lorasFromSwarmPreset,
  matchesKeywordQuery,
  modelSignalsCompatible,
  outputLibraryPageSize,
  quickGenerationParameters,
  sanitizeCustomCss,
} = await import("../dist/frontend.js")

assert.deepEqual(dimensionsForAspect("1:1", 1024), { width: 1024, height: 1024 })
assert.deepEqual(dimensionsForAspect("4:3", 1024), { width: 1152, height: 896 })
assert.deepEqual(dimensionsForAspect("3:4", 1024), { width: 896, height: 1152 })
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
assert.deepEqual(
  lorasFromSwarmPreset({
    loras: "styles/ink.safetensors, characters/hero.safetensors",
    loraweights: "0.75,1.2",
  }),
  [
    { name: "styles/ink.safetensors", weight: 0.75 },
    { name: "characters/hero.safetensors", weight: 1.2 },
  ],
)
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
assert.match(source, /ss-top-actions[\s\S]*?data-action="open-output-library"[\s\S]*?data-action="toggle-config"/)
assert.match(source, /ss-mobile-prompt-tools[\s\S]*?data-action="use-current-init"[\s\S]*?data-action="toggle-seed-mode"[\s\S]*?data-action="append-to-chat"/)
assert.match(source, /data-role="workflow-select"/)
assert.match(source, /data-role="workflow-fields"/)
assert.match(source, /load_swarm_workflow/)
assert.match(source, /comfyuicustomworkflow/)
assert.match(source, /createWorkflowField/)
assert.match(source, /createFloatWidget/)
assert.doesNotMatch(source, /ctx\.ui\.mountApp/)
assert.match(source, /ss-miniplayer-app-surface/)
assert.match(source, /document\.documentElement\.appendChild\(surface\)/)
assert.doesNotMatch(source, /document\.body\.appendChild\(surface\)/)
assert.match(source, /\.ss-miniplayer-app-surface\s*\{[\s\S]*?z-index:\s*9978/)
assert.match(source, /class MiniPlayerController/)
assert.doesNotMatch(source, /data-action="mini-interrupt"/)
assert.doesNotMatch(source, /data-action="mini-expand"/)
assert.match(source, /data-action="mini-library"/)
assert.match(source, /data-action="mini-library"[^>]*>\$\{LIBRARY_ICON\}/)
assert.match(source, /ss-header-library[^>]*>\$\{LIBRARY_ICON\}/)
assert.match(source, /const LIBRARY_ICON = `[\s\S]*?ss-library-symbol/)
assert.match(source, /data-role="mini-context-menu"/)
assert.match(source, /data-action="mini-menu-toggle"/)
assert.match(source, /Minimize Quick Create/)
assert.match(source, /data-action="mini-menu-studio"/)
assert.match(source, /data-action="mini-menu-library"/)
assert.match(source, /data-action="mini-menu-hide"/)
assert.match(source, /scheduleLongPress/)
assert.match(source, /Math\.hypot[\s\S]*?this\.suppressNextClick = true[\s\S]*?450/)
assert.match(source, /data-action="mini-generate"/)
assert.match(source, /this\.snapshotValue\.active \? this\.interrupt\(\) : this\.quickGenerate\(\)/)
assert.match(source, /Stop generation/)
assert.match(source, /data-action="mini-edit-prompt"/)
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
assert.match(source, /data-mobile-panel="create-prompt"[\s\S]*?ss-negative-v3[\s\S]*?data-action="toggle-seed-mode"/)
assert.match(source, /"interrupt-generation"/)
assert.match(source, /data-action="add-swarm-preset"/)
assert.match(source, /data-action="open-preset-manager"/)
assert.match(source, /\.ss-preset-manage svg\s*\{[\s\S]*?fill:\s*none;[\s\S]*?stroke:\s*currentColor;/)
assert.match(source, /dataset\.action = "delete-swarm-preset"/)
assert.match(source, /delete_swarm_preset/)
assert.match(source, /data-role="preset-manager-modal"/)
assert.match(source, /data-action="save-stack"/)
assert.match(source, /data-action="export-stack"/)
assert.match(source, /data-action="apply-lumi-stack"/)
assert.match(source, /data-action="toggle-lora-download"/)
assert.match(source, /data-action="start-lora-download"/)
assert.match(source, /data-action="download-missing-loras"/)
assert.match(source, /WORKSPACE_STORAGE_KEY/)
assert.match(source, /private restoreWorkspaceState\(\)/)
assert.match(source, /private persistWorkspaceState\(\)/)
assert.doesNotMatch(source, /Add filename/)
assert.match(source, /\/api\/v1\/image-gen\/import/)
assert.doesNotMatch(source, /data-action="extract-preset-loras"/)
assert.match(source, /data-role="save-preset-modal"/)
assert.match(source, /dataset\.action = "preset-apply"/)
assert.match(source, /data-role="missing-lora-modal"/)
assert.match(source, /data-action="reuse-parameters"/)
assert.match(source, /data-action="use-as-init"/)
assert.match(source, /data-action="append-to-chat"/)
assert.match(source, /append_output_to_chat/)
assert.match(source, /data-action="delete-output"/)
assert.doesNotMatch(source, /data-action="open-swarm-folder"/)
assert.match(source, /data-action="open-output-library"/)
assert.match(source, /data-role="library-search"/)
assert.match(source, /Search prompts, model, LoRAs, presets/)
assert.match(source, /data-action="toggle-library-search"/)
assert.match(source, /data-action="toggle-library-selection"/)
assert.match(source, /data-action="select-library-page"/)
assert.match(source, /data-role="library-select-page"/)
assert.match(source, /private setLibrarySelection\(imageId: string, selected: boolean, extendRange: boolean\)/)
assert.match(source, /event\.shiftKey/)
assert.match(source, /allPageSelected \? "Clear page" : "Select page"/)
assert.match(source, /data-action="bulk-move-outputs"/)
assert.match(source, /data-role="move-folder-modal"/)
assert.doesNotMatch(source, /move\.dataset\.action = "move-library-output"/)
assert.doesNotMatch(source, /data-role="bulk-folder"/)
assert.match(source, /data-action="bulk-delete-outputs"/)
assert.match(source, /data-role="library-output-check"/)
assert.match(source, /data-role="new-folder-modal"/)
assert.match(source, /data-role="new-folder-type" value="chat"/)
assert.match(source, /create\.innerHTML = NEW_FOLDER_ICON/)
assert.match(source, /remove\.innerHTML = TRASH_ICON/)
assert.match(source, /ss-library-folder-delete/)
assert.match(source, /class="ss-library-selectbar"[\s\S]*?data-role="library-grid"[\s\S]*?class="ss-library-toolbar ss-library-currentbar"/)
assert.match(source, /data-role="library-visual-profile"/)
assert.match(source, /class="ss-library-visual-caret"[\s\S]*?>∨</)
assert.match(source, /data-role="visual-positive"/)
assert.match(source, /data-role="visual-negative"/)
assert.match(source, /data-role="visual-stack"/)
assert.match(source, /data-action="save-visual-profile"/)
assert.match(source, /data-role="active-visual-pill"/)
assert.match(source, /data-action="toggle-active-visual"/)
assert.match(source, /private effectiveStack\(\)/)
assert.match(source, /private hydrateActiveVisualStack\(force = false\)/)
assert.match(source, /private setStackPresetSelection\(presetId: string\)/)
assert.match(source, /this\.hydrateActiveVisualStack\(\)/)
assert.match(source, /this\.loadStackPreset\(preset\.id, false\)/)
assert.match(source, /private finalNegativePrompt\(\)/)
assert.match(source, /update_output_folder_profile/)
assert.match(source, /ss-history-menu-toggle/)
assert.match(source, /data-role="preset-stack"/)
assert.match(source, /dataset\.action = "preset-up"/)
assert.match(source, /dataset\.action = "preset-down"/)
assert.match(source, /data-role="inspector-path"/)
assert.match(source, /swarmPathVerified/)
assert.match(source, /currentLibraryPageSize/)
assert.match(source, /createOutputFolder/)
assert.match(source, /data-role="aspect"/)
assert.match(source, /data-role="size-slider"/)
assert.match(source, /data-role="link-size"/)
assert.match(source, /data-role="size-link"/)
assert.match(source, /data-role="generation-progress"/)
assert.match(source, /data-role="denoise"/)
assert.match(source, /\.ss-creativity-row\s*\{\s*grid-column:\s*1\s*\/\s*-1/)
assert.match(source, /this\.isMobileViewport\(\) \? 64 : 56/)
assert.match(source, /document\.documentElement\.appendChild\(surface\)/)
assert.match(source, /destroy\(\)\s*\{[\s\S]*?surface\.remove\(\)/)
assert.match(source, /const compact = this\.collapsed/)
assert.match(source, /this\.root\.ownerDocument\.documentElement\.clientWidth/)
assert.match(source, /return this\.isMobileViewport\(\) && this\.collapsed/)
assert.doesNotMatch(source, /this\.collapsed \|\| !this\.behavior\.mobileQuickCreate/)
assert.match(source, /this\.isMobileViewport\(\)[\s\S]*?\? true[\s\S]*?: stored\.collapsed === true/)
assert.match(source, /private activateWidget\(\): void \{\s*this\.openStudio\(\)/)
assert.match(source, /target\.style\.setProperty\("width"/)
assert.match(source, /new ResizeObserver/)
assert.match(source, /typeof ctx\.ui\.createFloatWidget === "function"[\s\S]*?\|\| createOverlayMiniplayerWidget\(\)/)
assert.match(source, /class="ss-mini-preview" data-action="mini-open" role="button"/)
assert.match(source, /this\.root\.ownerDocument\.documentElement\.appendChild\(this\.contextMenu\)/)
assert.match(source, /!this\.collapsed && target\.closest/)
assert.match(source, /mini\.dataset\.action = "mini-open"/)
assert.match(source, /private widgetSizeTargets\(\)/)
assert.match(source, /data-mobile-orb="true"[\s\S]*?this\.render\(\)/)
assert.match(source, /window\.addEventListener\("resize", this\.onWindowResize\)/)
assert.match(source, /window\.removeEventListener\("resize", this\.onWindowResize\)/)
assert.match(source, /setStudioOpen\(open: boolean\)/)
assert.match(source, /this\.behavior\.widgetEnabled && !this\.studioOpen/)
assert.match(source, /miniplayer\?\.setStudioOpen\(true\)[\s\S]*?ctx\.ui\.showModal/)
assert.match(source, /activeModal = null[\s\S]*?miniplayer\?\.setStudioOpen\(false\)/)
assert.match(source, /completionToast: false/)
assert.match(source, /tagAutoGenerate: false/)
assert.match(source, /tagPromptInjection: false/)
assert.match(source, /data-role="tag-auto-generate"/)
assert.match(source, /data-role="tag-prompt-injection"/)
assert.match(source, /data-action="copy-tag-protocol"/)
assert.match(source, /data-role="character-base-tags"/)
assert.match(source, /data-action="save-character-base-tags"/)
assert.match(source, /data-action="clear-character-base-tags"/)
assert.match(source, /case "character_base_tags_result"/)
assert.match(source, /request="generate"/)
assert.match(source, /aspect="4:3"/)
assert.match(source, /character="active"/)
assert.match(source, /Set <code>character="none"<\/code>/)
assert.match(source, /alt="A candid city-street photo"\s*\n>\s*\noutside, city street/)
assert.match(source, /Macro and preset guide/)
assert.match(source, /ss-macro-guide-grid/)
assert.match(source, /class TaggedImageController/)
assert.match(source, /tagFingerprints/)
assert.match(source, /this\.tagFingerprints\.get\(lookup\) === fingerprint/)
assert.match(source, /figure\[data-swarm-studio-image="true"\]/)
assert.match(source, /data-swarm-studio-inline-action/)
assert.match(source, /Regenerate with current Studio settings/)
assert.match(source, /type: "retry_tagged_job"/)
assert.match(source, /type: "list_tagged_jobs"/)
assert.match(source, /case "tagged_image_jobs_result"|payload\?\.type === "tagged_image_jobs_result"/)
assert.match(source, /registerTagInterceptor\(/)
assert.match(source, /tagName: "swarm-image", attrs: \{ request: "generate" \}, removeFromMessage: true/)
assert.match(source, /img\[data-swarm-studio-slot\][\s\S]*?object-fit: cover !important/)
assert.match(source, /messages\.renderWidget\(/)
assert.match(source, /type: "tag_generate"/)
assert.match(source, /Retry with current Studio settings/)
assert.match(source, /class="spinner" aria-label="Generating"/)
assert.match(source, /case "tagged_generation_result"/)
assert.match(source, /Output synced to Studio/)
assert.match(source, /swarm-studio-image-/)
assert.match(source, /widgetEnabled: true/)
assert.match(source, /mobileQuickCreate: false/)
assert.match(source, /data-role="widget-enabled"/)
assert.match(source, /data-role="mobile-quick-create"/)
assert.match(source, /data-action="edit-prompt"/)
assert.match(source, /open_text_editor/)
assert.match(source, /text_editor_result/)
assert.match(source, /window\.requestAnimationFrame/)
assert.match(source, /typeof this\.widget\.setVisible === "function"[\s\S]*?this\.root\.hidden = !visible/)
assert.doesNotMatch(source, /ss-mini-reopen/)
assert.match(source, /Lumi's float widget makes its entire chrome draggable[\s\S]*event\.stopPropagation\(\)/)
assert.match(source, /target\.closest\("button, input, textarea, select, a, \[data-action\]"\)/)
assert.match(source, /<select class="ss-select" data-role="sampler"/)
assert.match(source, /<select class="ss-select" data-role="scheduler"/)
assert.match(source, /data-role="presets"/)
assert.match(source, /data-role="history-page"/)
assert.match(source, /data-role="output-library"/)
assert.match(source, /private syncVisibleLibrarySelection\(\): void/)
assert.match(source, /this\.setLibrarySelection\([\s\S]*?this\.syncVisibleLibrarySelection\(\)/)
assert.match(source, /private toggleLibraryPageSelection\(\): void[\s\S]*?this\.syncVisibleLibrarySelection\(\)/)
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
assert.match(source, /\.ss-workflow-modal:is\(\[data-role="move-folder-modal"\],\s*\[data-role="new-folder-modal"\]\)\s*\{\s*z-index:\s*2147483200/)
assert.match(source, /loraMatchScore/)
assert.match(source, /@media \(max-width: 720px\)/)
assert.doesNotMatch(source, /\.ss-inspector-actions \[data-action="open-output-library"\]/)

console.log("frontend behavior contract: ok")
