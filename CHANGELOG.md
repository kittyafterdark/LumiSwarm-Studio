## 1.1.0-alpha.17.16 - Draft attachment independence

- Start native draft attachment independently of character filing and Output Library refresh. Bound optional library publication to four seconds, preserve existing gallery data on failure, and retain a saved bitmap if generation-history persistence fails. Keep draft publication ahead of automatic upscale; retain a draft rather than racing deletion against unfinished filing.
- Accept ID-only terminal events using contiguous reserved stream text, with whole-reply verification on the backend. Allow harmless line-ending, outer-whitespace and equivalent tag-attribute normalization in terminal proof without relaxing message/swipe ownership.
- Recover delayed native rendering from committed job notifications even when a separate reconciliation notification is missing. Keep automatic status ribbons hidden and generation reservations unchanged.
- Add mocked backend regressions for blocked library reads, failed history/library storage, normalized saved swipe, draft-first automatic upscale and failed upscale retention; extend compiled-browser coverage for ID-only terminal events and missed reconciliation.

## 1.1.0-alpha.17.15 - Silent automatic inline generation

- Keep queued, generating and normally attaching inline images free of temporary chat status ribbons for both inline and URL-only output. Preserve manual Generate, Retry and failed-attachment recovery controls, actual image hydration, and Studio/Locket previews.
- Extend the compiled browser regression to check silent lifecycle events and snapshots in both output modes, while retaining manual approval and recovery controls. No backend or generation-authority changes.

## 1.1.0-alpha.17.14 - Inline request authority and preview handoff

- Reserve each generation/slot before provider work starts. Serialize admission across provisional and canonical message IDs without blocking independent renders. Recognize equivalent packet formatting without merging distinct slots or swipes; conflicting or ambiguous deliveries wait for verified ownership rather than creating another render.
- Preserve authored request receipts across regeneration, deduplicate explicit retry request IDs, and treat repeated tag deliveries as recovery, not permission to spend another GPU job. Attachment is idempotent and remains bound to the verified saved message/swipe.
- Restore active normal-inline status cards while preserving the no-transient-widget contract for URL-only output. Retain attempt-local previews in Studio and the Locket, including concurrent renders, repeated state notifications and late terminal results. Provider completion alone does not retire a tagged attempt before its backend state settles.
- Expand mocked backend and compiled Chromium regressions for mixed delivery, formatted packets, independent slots and swipes, explicit retry replay, duplicate mutation prevention, and preview handoff. No presentation or rendering-recipe changes.

## 1.1.0-alpha.17.13 - Inline streaming and attachment recovery

- Dispatch explicit complete inline generation tags from generation-scoped token events, independent of native interceptor timing. Deduplicate stream/interceptor replays and provisional/final message IDs; leave incomplete tags, code examples, reasoning and parser requests out of this path.
- Separate provider completion from canonical reply settlement. Retry delayed native saves, retain completed bitmaps through long text streams, attach only to a proved assistant message/swipe, and serialize concurrent job-store updates.
- Recheck late native hydration after confirmed attachment without rewriting stale frontend content. Theater accepts verified image-attachment transitions instead of waiting indefinitely for the original unmodified terminal text.
- Add backend races and a compiled Chromium regression at 1440, 390 and 320 px. No presentation, generation-profile or provider changes.

## 1.1.0-alpha.17.12 - OVA subtitle restoration

- Restore Anime OVA as bare outlined subtitles with no dialogue matte or decorative underline. Keep the readable speaker/expression nameplate and wider stage; adapt the subtitle outline to explicit dark ink. Other presets unchanged.
- Extend the overlap browser regression to verify the transparent subtitle surface and contrasting outline.
## 1.1.0-alpha.17.11 - Cast overlap refinement

- Widen Shonen Burst (520 to 680 px), Manga SFX (420 to 560 px) and Anime OVA (460 to 560 px). Give Shonen a content-sized graphic balloon with fixed-edge decorative geometry and narrow-screen portrait overlap; preserve Manga SFX stage alignment and give OVA a high-contrast subtitle/nameplate.
- Refine Cyber Telemetry, Pill Capsule, Origami Fold, Washi Tape and Stamped Paper with their own material/ornament construction rather than speaker-color washes. Keep authored dialogue ink, with contrasting light/dark materials. Capsule uses the active wardrobe default expression as a decorative face, preserving the one-actor/one-quote contract; Theater override retains it when available.
- Keep Materia, Obsidian, Halftone, Swiss and Laser Beam visual treatments intact. Add compiled Shadow DOM geometry and default-avatar regressions.

## 1.1.0-alpha.17.10 - Background Workshop

- Replace the manual Cast Backgrounds generator with a compact preview-and-settings workspace. Inherit the saved Studio renderer, or explicitly override checkpoint, steps, CFG, sampler, scheduler, aspect/exact dimensions, seed, negative prompt and a saved LoRA stack. Snapshot inherited settings and the explicit stack when the job is queued; no inherited character/persona assets, style stacks or references.
- Keep manual results pending review until accepted. Veto leaves the underlying image in Outputs without registering a scene or Background Assets reference. Accept validates candidate identity and owned image, rechecks the scene key, and registers the approved image in both libraries. Review actions are accessible after returning to Backgrounds. Manual candidates are session-local to the backend process; restart leaves the saved output available for manual reuse.
- Preserve the model-directed background job behavior and legacy manual RPC behavior. Separate pending review from active background progress; add backend and compiled browser regressions for settings, preview, veto/retry, approval, stable keys and hydration.

## 1.1.0-alpha.17.9 - Stage Direction projection repair

- Normalize braille blanks and nonbreaking spaces in cue/markup parsing without rewriting canonical messages or protected islands. Consecutive literal Markdown cue lines resolve as directions, not intertitles.
- Inherit standalone scenery and lighting in unmarked ordinary Cast cards, retaining original packet identities and explicit legacy card attributes. Rebuild direction on swipes, edits and library hydration; unknown directed locations do not substitute unrelated default scenery. Recover inherited stage metadata when earlier directing turns are virtualized.
- Preserve assistant cue cleanup for display and prompt history; keep user examples, protected code/HTML, packet bodies and saved messages intact. Add compiled Cast-to-Theater projection regressions at three widths.

## 1.1.0-alpha.17.8 - Stage Direction

- Add an independent Stage Direction category with global, Cast and conversation scopes, automatic or macro injection, position/depth/role, capability switches and direction frequency. Injection defaults to disabled; enabling it defaults to a stable system block before history, with the dynamic continuity reminder off.
- Add standalone scene and lighting cues to the existing protected cue protocol. Consecutive directives establish story scenery and persistent lighting without depending on dialogue card composition. Scene changes reset environmental state; unmarked cards retain the current Theater mood.
- Allow explicitly enabled narration-only requests for new Cast locations using the existing persisted assistant-message verification, generation limits and asset pipeline. Late artwork hydrates the existing stage. Preserve saved messages and remove valid cues from rendered chat and outgoing assistant history.
- Register the protocol, locations and state macros. Add compiled viewport tests and backend coverage for scope inheritance, stale saves, cache-stable insertion and generation authorization.

## 1.1.0-alpha.17.7 - Unified Cast and Theater atmosphere

- Reuse the Cast atmosphere palette and active cast preferences for native stage scenery, actors and compatible authored cards. Capture packet moods in the screen timeline, retain through narration, reset on scene boundaries or unmarked Cast packets, and rebuild during rewind/swipes.
- Add visual Follow Cast / manual mood selection with independent mood intensity and actor tint in Theater Lighting. Saved looks retain these overrides; manual moods do not modify Cast or weather preferences.
- Keep dialogue colors, CGs and protected HTML ungraded. Prevent duplicate world grading in authored world stages. Add compiled viewport regression covering mood projection and manual preview/Apply/Cancel.

## 1.1.0-alpha.17.6 - Theater quick controls

- Replace the dropdown-heavy playback settings panel with direct shortcuts to Scenery, Atmosphere, Actors, Lighting, Cast cards and Looks. Show the current effective scene configuration and keep the original Atelier draft/Apply/Cancel behavior.
- Expose scene-local background pinning and Return to story directly in quick controls, without changing saved looks or the narrative timeline.
- Use segmented text reveal and speed controls, an autoplay interval slider, and a collapsed Presentation defaults disclosure for infrequently changed baseline choices. No existing preferences are removed or migrated.
- Update compiled browser regressions for direct editor entry, draft cancellation, playback preferences, mobile geometry and scenery override controls.

## 1.1.0-alpha.17.5 - Cache-stable image history

- Replace the rolling six-caption prompt budget with a fixed account-level policy: keep compact captions indefinitely (default), or strip immediately for cache-first text context.
- Expose History image markers in Studio settings / Generation / Inline images. Both policies are independent of message age; switching modes may invalidate an existing cache once. Strip also avoids pending-to-generated caption changes.
- Preserve saved chat content, images, Theater playback, and non-history system prompt examples. Add append-prefix and request-to-result interceptor regressions.

## 1.1.0-alpha.17.4 - Scenic direction & scene index

- Browse active Cast locations and shared Background Assets from Theater Stagecraft, with image thumbnails, search, filters and refresh. Select a scene-local background or pin it for the session; clear it to follow the story again.
- Select image fit, focal position and zoom, or choose procedural scenery or no scenery. Manual overrides remain independent of saved looks, canonical story scenery, weather and actors.
- Group the scene index by original message and use native message author names where available. Jump to a message start or expand its individual screens.
- Restore safe local HTML disclosures (native details/summary and checkbox/radio controls), including same-screen refresh preservation. Host actions, arbitrary script execution, links and submissions remain blocked.
- Add a read-only scoped background RPC and compiled browser regressions. No new permissions or core modifications.

## 1.1.0-alpha.17.3 - Cast-local wardrobe visibility

- Hide or show additional outfits independently per cast membership, preserving historical packet resolution, shared artwork and settings.
- Separate local visibility from global archive/restore and permanent removal. Global restore preserves local hides; linking a new membership starts with all globally available outfits visible.
- Exclude hidden outfits from prompt choices, continuity, workshop selection and new card corrections; keep shared library outfit copying available. Preserve original outfit protection and optimistic lifecycle checks.
- Validate local visibility, global lifecycle interaction and linked-cast isolation with state, backend and compiled browser fixtures.

## 1.1.0-alpha.17.2 - Wardrobe lifecycle

- Archive populated additional outfits, keeping historical packet resolution, image references and workshop settings while excluding them from new prompt choices and Expression Studio. Restore from the archived section at any time.
- Permanently remove an additional outfit after explicit confirmation, with linked cast impact, expression counts and a replacement starting outfit for affected memberships. Never delete image files or managed output folders. The original outfit is protected.
- Use a dedicated lifecycle RPC under the existing Cast write lock and optimistic snapshot checks. Reject stale confirmations, and block changes during linked Genesis production. Preserve unrelated outfits and forked characters.
- Add state and compiled browser lifecycle contracts and extend the real backend contract. [Guide and limitations](docs/wardrobe-lifecycle.md).

## 1.1.0-alpha.17.1 - Registry layout polish

- Equal-height desktop registry cards, fixed search grid columns, and bottom-aligned three-slot action grids. Linked status and unavailable outfit copying retain their action positions.
- Theme-aware selection checkboxes and consistent mobile action targets. Preserve existing registry operations and backend storage.
- Extend compiled browser regressions with card and action geometry, filtering, disabled copy slots, and empty destination checks at 1440, 390 and 320px.

## 1.1.0-alpha.17 - Cast Registry

- Add a searchable reusable character library with explicit links across cast albums, batch casting, independent forks, compatible existing-member linking, and non-destructive outfit copying. Preserve existing membership IDs, packet prefixes, image IDs and wardrobe keys. Never merge by name.
- Reconcile linked identity, artwork and wardrobe workshop settings across member projections under the existing Cast storage lock. Keep stage position, presentation, crop, role and preferred starting wardrobe independent per membership. Conflicting edits fail before writes.
- Keep removed characters in the uncast stash when the final membership is removed, including when deleting a cast. Existing asset reference scanning includes the stash; no image files are copied or deleted. Restoring a stashed member creates a new membership.
- Keep incompatible existing expression packs independent; explicitly copy a named outfit and its mappings, settings and reference into a new destination wardrobe instead. Allocate non-overlapping packet prefixes for new memberships.
- Add registry state, browser and backend contracts. [Guide](docs/cast-registry.md) · [Validation](docs/cast-registry-validation.md).

## 1.1.0-alpha.16.2 - Wardrobe save reconciliation

- Compare the workshop's expected wardrobe signature against the normalized local Cast snapshot, rather than the raw generator result. Native generation-result URLs and gallery URLs for the same saved image no longer produce a false stale-workshop conflict on subsequent writes.
- Preserve the existing stale-wardrobe guard and backend optimistic library save. Concurrent changes to the selected wardrobe remain protected.
- Extend the compiled wardrobe browser fixture to reproduce the old false warning on a second save and verify a genuine external artwork change is still rejected at desktop and mobile widths.

## 1.1.0-alpha.16.1 - Member Atelier recovery

- Recover from transient active-chat preference load failures with bounded read-only retries. A valid card now opens a loading/error dialog rather than the legacy shared-look picker until saved preferences are available.
- Revalidate the source card, selected swipe and active chat before opening; ignore stale load responses and duplicate chat-change notifications. Existing backend authorization and save behavior are unchanged.
- Add a compiled Chromium regression for delayed preference loads, explicit errors, manual retry and chat isolation at 1440, 390 and 320px.

## 1.1.0-alpha.16 - Wardrobe Workshop & Cue Cleanup

- Create and switch independent wardrobe sheets inside Expression Studio. Fresh, copy settings and copy artwork modes; explicit reference inheritance, isolated rendering overrides, and save-before-switch protection.
- Add named alternate expression slots without replacing existing artwork. Preserve existing wardrobe-aware packet resolution and asset registrations; no random selection or automatic outfit activation.
- Capture queued workshop writes and merge only the selected wardrobe into the latest Cast member; reject stale wardrobe saves and lock switching during jobs.
- Project valid standalone Stage FX cues to invisible render markers, remove them from assistant prompt history, and keep canonical stored messages unchanged for playback. Shared completion gate protects code, HTML and incomplete cues.
- Add wardrobe contracts and compiled browser fixture. [Guide](docs/wardrobe-workshop.md) · [Validation](docs/wardrobe-workshop-validation.md).

## 1.1.0-alpha.15 - Atmosphere & Stage FX

- Replace repeating ambient presets with a bounded, scene-seeded procedural particle field. Nine distinct environmental effects, including fog, leaves, wind and fireflies, with individual motion profiles and same-scene node reuse.
- Add persistent weather and one-shot story directives to Theater's verified playback sequence. Reconstruct state on rewind and response replacement; incomplete cues do not publish. No extra playable cue screens or changes to normal chat.
- Add actor-targetable finite bursts, soft lightning, camera shake, impact, magic, sparkles, lighting and theme-specific emotional treatments. Honor reduced motion; no effect overlay intercepts input.
- Stagecraft Atmosphere now exposes fallback, manual/explicit/reactive direction, one-shot controls, current state and local effect previews. Automatic English narration matching is opt-in.
- Add production FX fixture at 1440/390/320 and streamed cue regression. No backend or core changes. [Guide](docs/theater-fx.md) · [Validation](docs/theater-fx-validation.md).

## 1.1.0-alpha.14.2 - Theater transport polish

- Distinguish recapture from response regeneration. Unboxed playback glyphs and filled play/pause/stop marks, one highlighted advance action, continuous progress, and shorter mobile header/footer.
- Reuse the live swipe controls in focus mode: bare arrows and counter, hover/focus on desktop and visible on touch; Stop remains available during generation. Recapture is accessible from settings on mobile.
- Touch/pen tap navigation on the stage: left quarter goes back, remaining area advances or reveals. No overlay intercepts text selection, vertical scrolling, or protected HTML islands.
- Enlarge docked overlap actors on phones; raise the baseline for graphic dialogue without disabling the explicit size slider. Move the cast advance hint away from the dialogue strip.
- Extend the live browser fixture to verify focus-mode native swipe dispatch, compact controls, mobile tap navigation and unique refresh/regenerate glyphs. No core or backend changes.

## 1.1.0-alpha.14.1 - Protected HTML islands

- Separate HTML projection from Cast styling. Preserve host typography, inherited variables, authored CSS, form-shaped layouts, visual control placeholders, and safe local SVG references.
- Enable native nested scrolling and text selection without enabling message actions, navigation or form submission. Clicks inside islands no longer advance playback; use the separate advance hint or transport.
- Retain nested scroll offsets when the same frame re-renders. Pause autoplay when interacting with an HTML scene. New desktop/mobile browser fixture exercises real wheel and touch input.
- No core or backend changes. See [HTML validation](docs/story-theater-html-validation.md).

## 1.1.0-alpha.14 - Interactive Theater

- Native composer bridge: draft synchronization, explicit send, end-of-window Reply and a jump-to-reply action. No separate chat store, prompt builder, provider connection or simulated native button clicks.
- Completion-gated progressive playback from `STREAM_TOKEN_RECEIVED`, with chat/generation scoping and exact per-channel offsets. Paragraphs, closed HTML and Cast packets are verified against the rendered host DOM; ambiguous text transformations defer to the saved response.
- Themed generation interludes, optional expandable provider reasoning (in-memory text only), wait-at-edge playback and late artwork hydration. Reading position stays stable as screens arrive.
- Native regenerate, stop and previous/next swipe commands through host surfaces. Selected-response replacement rebuilds the affected frames and downstream scenery/actor state. Delayed native reconciliation is handled conservatively.
- Session-local cache of visited messages, bounded reconciliation and read-only compatibility when host composer APIs are absent. New production-bundle browser tests at 1440/390/320px. [Interactive Theater guide](docs/story-theater-live.md) · [Validation](docs/story-theater-live-validation.md).

## 1.1.0-alpha.13.6 - Stage geometry and dialogue density

- Dock authored cards to the visible stage floor, including overlap canvas padding. Move the advance hint out of layout flow; native dialogue also anchors at the floor, with a full-width Celluloid fade.
- Independent scenic, graphic/expression and native dialogue sizes. Auto-compensate enlarged graphic text and caption padding without scaling down the actor or mutating the source card. Native subtitle sizing no longer inherits the scenic slider.
- Inactive actors are opaque by default, with independent brightness, saturation, size and opacity. Existing explicit opacity settings are respected. Localized Frosted Reverie card blur.
- Added compiled-browser geometry and density regression at 1440/390/320px, including focus mode, live controls and actual strip alignment. See [validation](docs/story-theater-density-validation.md).

## 1.1.0-alpha.13.5 - Native staging

- Automatic native staging for scenic Cast compositions, with explicit Native and Authored card choices. Native stages share the outer scenery and independent actor layer instead of nesting a second scene card. Authored cards can dock to the bottom; graphic compositions and Codec remain available.
- Viewport-anchored dialogue, independent actor focus, compact location labels and adjustable narration placement/material. Missing hydrated actor or dialogue data falls back to the authored card.
- Frosted Reverie replaces the Lucid Reverie display name, keeping the stable preset ID. Reduced default scenery dimming and localized 3px frost instead of heavy backdrop blur.
- Native-stage Chromium fixture passed at 1440/390/320px; see [validation](docs/story-theater-validation.md).

## 1.1.0-alpha.13.4 - Theater interface polish

- Decoupled Theater inspector chrome from story colors. Themed playback controls maintain readable foreground/background contrast even with hostile custom palettes; the stage itself retains the authored palette.
- Boxless show-controls affordance, with desktop corner hover and keyboard focus, visible on touch. Removed the native hover tooltip while keeping its accessible name and 44px target.
- Rebuilt inspector hierarchy: pinned headings/navigation, separate scrolling body, fixed Apply footer, grouped settings, labeled sliders, switch controls, hex swatches, and clear focus states. Backlog and gallery use the same readable shell.
- Cast overrides now use a searchable, paginated card browser with real rendered thumbnails and a selected-card preview; no changes to the underlying Cast templates or data.
- Stagecraft now has actor, scenery, weather and lighting previews, contextual help, clearer section boundaries and separated manual actor reset controls. Existing presentation settings and save scopes are retained.
- Chromium inspector regression at 1440, 390 and 320px; existing playback suite at all three widths. See [validation](docs/story-theater-validation.md).

## 1.1.0-alpha.13.3 - Stagecraft

- Persistent last-seen actor state within contiguous captured scenes; expression history is rebuilt on rewind. Stable member identity is attached to hydrated Cast projections. Scene changes, explicit `none` and mounted-window gaps reset continuity. Manual clear/undo boundaries are local to a playback session.
- Ren’ai, Lucid Reverie and Ghost Protocol enable actor persistence by default; all presentations can opt in. Inactive saturation, scale, opacity, motion and roster size (1–4) are adjustable. Compatible world cards retain inactive sprites during dialogue; Codec uses a last-seen portrait in the secondary bay. Other layouts preserve their card and retain sprites on narration. CGs/HTML hide the actor layer without forgetting it.
- Theater Atelier Stagecraft groups Actors, Scenery, Atmosphere and Lighting. Nine original local SVG patterns plus None, tint/opacity/scale, fallback/replacement/overlay modes, backdrop brightness and vignette. Existing weather controls migrate into Stagecraft without changing the particle engine.
- Global/per-chat and saved look storage includes the new sanitized tokens. No new dependencies, permissions, generation or backend changes.
- Compiled Stagecraft fixture exercises 1440/390/320px with real Cast templates, two actors, rewind, scene boundaries, all nine patterns, weather, lighting, Codec and zero backend calls. See [Stagecraft](docs/theater-stagecraft.md) and [validation](docs/story-theater-validation.md).

## 1.1.0-alpha.13.2 - Theater Art Direction

- Eight distinct art direction families plus Original Theater: Celluloid, Paper Riot, Velvet Requiem, Ghost Protocol, Ephemera, Lucid Reverie, Critical Hit and Ren’ai. Real Cast/narration/CG/HTML previews, theme-specific screen treatments and chrome.
- Theater Atelier with live draft preview, token controls, independent screen treatments, global or conversation-local apply, named local library and validated JSON import/export.
- Optional temporary Cast re-render using the selected theme's recommended Atelier card or any supported card; original member configuration and source DOM remain untouched. Missing data retains the original card.
- Compact scenic dialogue band, nameplate, state and scene label under viewport fit, independently adjustable dialogue/scene-label scale, and optional compatible seamless scene background.
- Independent CSS rain, snow, petals, embers and dust; intensity and motion controls, bounded particle count and reduced-motion behavior. No new generation or provider dependencies.
- Compiled Chromium playback and art-direction coverage at 1440/390/320px. See [Art direction](docs/theater-art-direction.md).

## 1.1.0-alpha.13.1 - Theater Polish

- Theater-specific viewport fitting for Cast presentations, preserving internal art direction and actor alignment while ignoring chat-only width limits in Fit to theater mode. Original chat size remains optional.
- Safe inline text styles and legacy font colors in narration, Cast captions and HTML islands; source markup remains read-only.
- Word-by-word, typewriter or instant reveal, adjustable speed, first-input completion, next-input advancement and auto-play delay after completion. Reduced motion disables reveal.
- Fading advance hint with animated diamond, transparent / glass / solid HTML island surrounds, brighter non-scene Cast scenery, and corrected hidden-chrome viewport geometry.
- Dedicated inert ambience layer reserved for future atmospheric effects; no weather particles or additional presets in this release.
- Updated compiled browser tests and Theater documentation.

## 1.1.0-alpha.13 - Story Theater

- Fullscreen read-only story playback from mounted Lumiverse messages: paragraph narration, real Cast presentations, event CGs, and isolated static HTML islands.
- Continuous scene art across contiguous mounted messages, three presentation presets, four transitions, CG frames, adjustable narration size, autoplay, backlog, gallery, hidden controls and local resume.
- Drawer and floating toolkit launchers; late Cast hydration, safe teardown on chat changes, and no new generation or backend operations.
- Virtualized history is not fetched in this release. Interactive HTML actions, live response streaming and composing are intentionally outside the initial playback scope.
- Compiled browser coverage at 1440/390/320px. See [Story Theater](docs/story-theater.md).

## 1.1.0-alpha.12 - Postproduction

- Finalize: reusable, ordered processing recipes with native and Anima-reference img2img, AI upscaling, detector detailers, background removal and local despill. Each stage creates a separate derivative with provenance, with original artwork retained.
- Render Lab: compare 2–4 refinement values on a fixed input and seed; accept a candidate and continue the chain. Before/after split preview, retry, skip, Stop, and mobile artwork-focus mode.
- Edit: discovered SAM2 point selection with add/subtract, existing mask history and inpaint transfer, without mutating pixels.
- Generate: independent Anima reference guidance and guidance end, manual saved reference A/B picker with a stitched left/right composite. Existing character binding remains the fallback.
- Capability discovery for provider nodes, model lists and supported detailer fields. Account-scoped source reads, saved recipes, and active workspace protection in the Vacuum snapshot.
- Actual compiled frontend browser fixtures at 1440/390/320px and scoped backend provider-graph mocks. See [Postproduction](docs/postproduction.md) for setup and limitations.

## 1.1.0-alpha.11.3 - Scene lighting and background gallery polish

- Shared theme-aware native sliders with transparent input surfaces and compact tracks/thumbs.
- Grade scene artwork independently with palette-specific brightness, contrast and saturation; retain the separate actor filter, original decorative filters, and untouched dialogue. Existing atmosphere intensity now controls the grade and wash together.
- Wider responsive background library, compact SVG actions with labels/tooltips, default-scene indicator, and a stable gallery with a persistent footer. Existing actions, references, and settings schemas remain unchanged.
- Browser coverage for six live backgrounds and all eight scenery layers, plus existing Edit, backgrounds and atmosphere regressions.

## 1.1.0-alpha.11.2 - SVG-first Edit properties

- Compact icon-only selection actions, selection state, edge refinement, inline feathering and clear-pixels action with Delete hint. Select all uses the existing independent selection history. No pixel algorithm or backend changes.

## 1.1.0-alpha.11.1 - Dialogue color continuity

- Instruct the RP model to use consistent speaker colors for all spoken dialogue, including ordinary prose, continuations after narration, and speakers without saved expressions. Preserve user-authored color rules.
- Apply the same instructions to empty Genesis albums; show a colored creation packet.
- Keep narration outside font wrappers; no extra Cast cards are needed just for color. Existing rendering and stored message behavior are unchanged.
- Contract coverage for protocol injection and byte-preserved inline colored speech.

## 1.1.0-alpha.11 - Atmospheres

- Album-scoped optional `atmosphere=KEY` on Cast packets. Original and untagged cards retain their existing art direction.
- Nine color washes (including a custom two-color mix) plus Original, independent expression lighting, and static defaults.
- Live scene preview in Cast → Backgrounds → Atmospheres, with pinned phone preview and separate controls scrolling.
- Separate optional short lighting transitions and actor reveal animations; reduced-motion overrides both. No continuous effects, image generation, asset duplication, or theater dependencies.
- Targeted locked settings persistence; existing art, wardrobes, recipes and source messages are unchanged.
- New CSS, backend and browser regression fixtures.

## 1.1.0-alpha.10.3 - Expression quick actions

- Replace the floating stage navigator with a responsive gallery action rail, including selection count, explicit Select all / Deselect all, Add custom and Generation settings. Keep the original top stage navigation and footer Next / Skip.
- Show the rail when the original gallery controls scroll out of view. Later stages offer selection controls only; preserve stage eligibility, existing filters and busy guards.
- Extend the compiled browser regression to exercise every quick action, scroll retention and stage transitions.

## 1.1.0-alpha.10.2 - Wardrobe move dialog polish

- Widen the Move expressions dialog, adapt thumbnail columns to available width, prevent gallery rows from shrinking, keep the header and footer visible, and show a live selection count. Existing wardrobe migration and asset semantics remain unchanged.

## 1.1.0-alpha.10.1 - Inline attachment recovery

- Failed or interrupted inline regenerations preserve the previously committed image when the message metadata and exact attachment agree. Legacy failed jobs recover their editable attachment on read without changing message content or starting another render.
- Restore image actions for verified committed images; refuse ambiguous, edited or stale targets. Keep the last attempt error visible in diagnostics and generation status. Unattached new jobs and active renders remain protected.
- Add backend and Chromium regression coverage for failed retries, recovery, replacement, ambiguity and menu states.

## 1.1.0-alpha.10 - Cast Wardrobes

- Add optional per-member wardrobe collections with stable packet keys, independent outfit descriptions, references, expression-set settings, and logical expression names. Existing members remain compatible through an implicit `default` collection. No automatic migration of outfit prefixes or duplicate characters.
- Move selected expressions between outfits and optionally strip a common prefix without renaming their physical asset keys or changing original image IDs. Keep old dialogue packets intact; explicit `wardrobe=KEY` packets resolve only within that outfit, using its Neutral on missing expressions or plain dialogue if no Neutral exists.
- Scope Expression Studio render, reference, processing and save operations to the selected wardrobe. Managed wardrobe folders file generated artwork; migration sync only changes known managed references, preserving original files, unrelated folders and unregistered drafts.
- Member Atelier expression correction now includes a wardrobe picker, with per-card persistence; member presentation settings are unchanged. Protocol lists outfit-specific keys and uses ordered assistant history as a continuity hint. Repeat the explicit attribute on each packet; no global mutable outfit state or historical source edits.
- Genesis continues to populate the original collection. Automatic creation of additional outfits is not introduced in this release.
- New contract and compiled-browser fixtures cover migration, fallback, independent reference dispatch, scoped workshop merge, folder references, and isolated historical card corrections.

## 1.1.0-alpha.9.4 - Character direction

- Genesis sidecar designs a single coherent outfit with specific garments, colors and accessories, and includes character-specific expressive temperament without locking a facial expression, emotion, gesture or pose. Existing JSON contract, saved identities and expression bank remain unchanged.
- Cast Recipe offers an optional Add example instructions action that appends outfit and temperament guidance without overwriting custom text, adding duplicates or truncating existing instructions.
- Regression checks cover sidecar guidance, separation from diffusion transport, example insertion and persistence.

## 1.1.0-alpha.9.3 - Expression Workshop

- Generation settings now include Character, Rendering, LoRAs and Style sections. Edit identity, outfit, negative prompts, checkpoint and the full LoRA stack without requiring a linked character folder. Copy saved stacks, select installed LoRAs and adjust weights/triggers. Explicit blank identity fields and empty stacks override inheritance. New character/model/stack overrides are workshop-session only; existing expression-set settings retain their normal persistence. Genesis and album recipes are unchanged.
- The four workflow stages become a centered floating pill while scrolling, with compact labels in narrow Studio containers. Stage navigation resets scroll and retains the active-stage indicator.
- Optional edge-only green/blue despill in Remove background uses the existing browser pixel algorithm at 70% strength, reads the original cutout and saves a new PNG only when pixels change. Original cutout is retained; a failed local pass keeps the usable cutout. This applies to manual workshop runs, not headless Genesis.
- Production-bundle browser checks cover independent member render overrides, drawer reopen, responsive navigation and native-resolution alpha-preserving despill. Backend contracts verify explicit overrides and inheritance.

## 1.1.0-alpha.9.2 - Brushwork & anchored Genesis

- Native Edit brush and eraser show the true brush diameter on the cursor and while dragging the size slider. Paint with a chosen solid color; existing region-mask brush/eraser also get slider previews. Independent bounded selection undo/redo for wand, lasso, rectangle and selection refinements; pixel undo stays separate.
- Liquify Push uses small local, alpha-aware inverse warps, adjustable diameter and strength, and one pixel-history step per drag. No AI call or resolution change.
- Genesis opt-in Anima Ref consistency: render Neutral from the identity prompt, then condition remaining expressions on its registered final image. Retain the anchor across Resume and protect it in pending-job reference scans. Legacy preferences and non-Anima families stay prompt-only. Custom graphs may produce external Swarm files even in final-only mode.
- Output inspector groups Edit as a workspace entry, with balanced SVG shortcuts for Inpaint, Upscale, Reuse and Use as init; responsive four-shortcut row on mobile. Dynamic upscale status preserves its icon.
- Tests cover local paint/erase, brush ring, selection history, warp and undo, inspector controls, and six-slot reference-conditioned Genesis with an unchanged neutral anchor.

## 1.1.0-alpha.9.1 - Count recovery

- Recover malformed opted-in count attributes from exact visible-count fields with matching explicitly classified subject headings. Preserve parser opt-in, deliberate weights, conflicting valid counts and omitted attributes. Prefer focal shots over unnecessary ensembles; honor explicitly needed group scenes. Avoid duplicate-horizontal-anchor warnings when distinct depth anchors already resolve them.

## 1.1.0-alpha.9 - Studio Edit

- New Edit workspace after Lore, with a persistent native-resolution RGBA canvas, responsive tool rail, magic wand (contiguous or global), lasso/rectangle, eraser, crop/rotate/flip, selection refinement, green/blue despill, undo/redo, pan/zoom and preview backgrounds.
- Open saved artwork, upload local PNG/JPEG/WebP, or open directly from Cast expression/background, inline illustration or output inspector. Save a new extension-owned PNG or replace the specific Cast/chat reference with a stale-target guard; original files are retained.
- Reuse existing region inpaint and AI upscale dialogs, with the current document as source and selection transferred into the inpaint mask. Built-in BiRefNet results return to the canvas. Native pixel edits require no Swarm connection.
- Explicit native pixel and upload limits, no silent local resampling. Regression fixtures cover pixel algorithms, PNG upload scope, provenance, stale replacement, desktop/mobile workflow, selection mask handoff and enhancement result routing.

## 1.1.0-alpha.8.6.4 - Compact floating preview

- Container-aware compact preview at narrow or short sizes. Remove duplicate overlay status, condense progress into the footer, preserve accessible action labels, and use a distinct Stop glyph. Larger previews retain their full controls; touch targets remain larger.

## 1.1.0-alpha.8.6.3 - Expression style prefixes

- Insert exact native Swarm preset directives into editable Cast Recipe and manual expression prefixes. Preserve typed style tags, avoid duplicate insertions, and keep preset availability scoped to the selected connection. Existing generation transport and recipe persistence are unchanged.
- Browser regressions cover insertion, duplicate prevention, save/reopen, and responsive settings; provider mocks verify exact prefix transport in manual expressions and Genesis.

## 1.1.0-alpha.8.6.2 - Reference image access

- Manual expression, Look and Visual Lore references resolve account-visible host images through the user-scoped SDK. Native uploads need not carry an extension ownership tag. Relative and absolute Lumi image/result URLs resolve by image ID, independent of thumbnail query flags.
- Use original binary bytes, supported image MIME types and the existing 7.5M base64 character budget; preserve external and embedded reference support. No changes to extension-owned output listing, mutation, deletion or Vacuum authorization. Prompt-only ignores stored reference IDs.
- Backend regressions cover native uploads, both adapters, host URL variants, metadata fallback, inaccessible assets, invalid image formats, size limits, and existing external references.

## 1.1.0-alpha.8.6.1 - Expression settings drawer

- Compact generation-settings drawer bounded by the actual host dialog, aligned canvas and parameter fields, responsive ratio controls, visible slider tracks and fixed Done footer.
- Browser regression verifies desktop, mobile, narrow host width and retained settings on reopen. No backend changes.

## 1.1.0-alpha.8.6 - Cast Recipe controls

- Canvas aspect presets, linked width/height sliders, exact pixel inputs and inherited-size reset.
- Provider sampler/scheduler dropdowns with inherited and saved selections; named connection labels and saved-workflow image input discovery. Preserve unverified stored selections and ignore stale workflow responses.
- Responsive browser fixture covers dimensions, persistence and asynchronous workflow discovery. No backend or recipe schema change.

## 1.1.0-alpha.8.5 - Cast Recipe and safe member removal

- Optional album recipe with checkpoint/connection, sampling, copied LoRA stack and triggers, shared framing and negative prompt, appearance direction, extra sidecar instructions, and processing defaults. Capture current Studio settings without its authored scene prompt or bound identities.
- Genesis snapshots the album recipe when queued; manual Expression Studio opens with recipe defaults and retains per-run controls. Existing artwork and identities remain untouched.
- Separate authoritative storage signature from the local UI projection so interleaved member order does not produce false stale conflicts. Reload drains pending writes. Member removal updates only the chosen member under the backend library lock; assets remain in Output Library. Fresh completed creation requests may recreate explicitly removed members, but replay of the original request cannot.
- Mocked backend and responsive browser regressions cover recipe capture, scope, retry, concurrent writes, safe removal and live hydration.

## 1.1.0-alpha.8.4 - Live member production

- Live per-member Genesis progress, fixed expression slots, current pass stage and progress, Stop/Resume actions. Final artwork hydrates the corresponding tile as it is registered.
- Cast browsing is read-only; recently opened sorting tracks visits for the current workspace session. Keep actual stale-edit protection.
- Preserve selected workspace and identity form during generated expression registrations.

## 1.1.0-alpha.8.3 - Genesis processing recovery

- Genesis always uses prompt-only character rendering, including old jobs. Manual reference controls remain available.
- Resolve processing dimensions from actual owned PNG/JPEG/WebP headers when available, retaining the 4096px source safety cap. Report the processing stage and expression on failure.
- Resume keeps the saved identity, existing member and available draft rather than rerendering it. Regression coverage for metadata-free drafts and legacy reference preferences.

## 1.1.0-alpha.8.2 - Explicit count and Genesis scope

- Optional `count="2boys, 1girl"` on inline and parser requests, grouped weighting for Anima/Illustrious, plain count for caption models, configurable strength and skip diagnostics. Preserve authored weights and reject conflicts conservatively.
- Explicit authenticated `userId` in quiet-generation input for Genesis and parser, retain positional scope, and prefix Genesis sidecar failures for diagnosis. Installed worker SDK and live Resume still require verification.
- Regression coverage for trio provider dispatch, parser preservation, scope enforcement, and simulated sidecar failure/resume. See `docs/prompt-compilers/explicit-count.md`.

## 1.1.0-alpha.8.1 - Auto authoring and Anima composition

- Resolve the currently known recipe checkpoint before injecting inline or sidecar authoring instructions, using the same provider architecture cache and filename detection as generation. Unknown models receive neutral guidance; manual selection remains authoritative. Refresh only Studio's delimited compiler guidance in previously expanded macros. Parser batches can carry slot-specific guidance when recipes differ.
- Teach concise hybrid appearance tags, explicit visible counts, unique spatial anchors and appropriate framing. Anima normalizes explicit count categories and counts unambiguously typed subject headings; it never guesses from names. Escape flat literal qualifiers in authored subject details while preserving explicit weights and existing escaping. Warn about conflicting count/framing and repeated horizontal anchors; do not silently delete actors or enable regions.
- Add direct/mixed parser and real mocked dispatch regression fixtures based on the two reported izakaya CGs. Generation still resolves newly selected Lore/looks at dispatch. Genesis operator scoping and actual diffusion adherence require live verification.

## 1.1.0-alpha.8 - Cast Genesis

- Opt-in per album; completed assistant creation packets can populate an empty album or member. The RP model suggests a stable character key and optionally an expression/background; user preferences own production depth and retention.
- Reuse the configured parser sidecar for one compact JSON identity, eligible character Visual Lore, existing member identity, named render style and the saved expression bank. Native no-save retains Lumi finals; processing workflows retain their existing provider behavior.
- Headless serialized character production: render, optionally enhance, remove background, register and progressively hydrate. Durable receipts, approval, stop and explicit resume, ownership-checked intermediate cleanup, and pending Vacuum references.
- Cast-local production desk and nonblocking shared activity indicator. New mocked backend and Chromium regressions. See `docs/cast-genesis.md`.

## 1.1.0-alpha.7.5 - Presentation Library navigation

- Separate the portable Cast presentation gallery from its controls: desktop category directory and independent scrolling gallery, compact mobile category selector with on-demand search, dedicated Framing view, and collapsible desktop crop workshop.
- Keep the picker open after changing a presentation, expose the current album look and restore-to-default action, and display save status with explicit Done. Serialize rapid changes back to the last confirmed setting rather than dropping them.
- Keep the 52 catalogue options, preview renderer and Member Atelier preference precedence unchanged. See `docs/presentation-library.md`.

## 1.1.0-alpha.7.4 - Scene art direction

- Restore eight scene presentations with individual caption and metadata designs; preserve actor grounding, authored ink and the selected portrait overlap collection.
- Simplify the full presentation catalogue; audit all 50 named presets and add browser signature regression. See `docs/cast-design-audit.md`.

## 1.1.0-alpha.7.3 - Member Atelier

- Consolidate presentation, alignment, scale, position, crop and desktop width into one member-level user preference diff. Keep portable Cast settings intact and expression corrections card-specific. Preserve legacy geometry until member preference adoption; a reverted member uses the base configuration.
- Replace the card editor's broad tabs with a persistent centered canvas, SVG tool rail, contextual drawer, and actual visual presentation and expression pickers. Mobile uses a bottom rail and hides desktop width. The full Cast shortcut opens the member directly.
- Keep member and card drafts independent; save the selected scope without closing, support independent reverts, and refresh existing Cast islands. Add mocked backend and browser coverage. See `docs/member-atelier.md`.

## 1.1.0-alpha.7.2 - Card Atelier

- Follow Studio appearance and host backgrounds in the floating dock, Quick Create and prompt diagnostics; add an inspector icon and a responsive read-only dialog.
- Replace the Cast quick action entry with a live template editor, card-local expression, actor scale and placement, crop and desktop width. Preserve the existing shared Cast editor as a separate action.
- Persist bounded card overrides per user/chat without rewriting dialogue packets or changing shared Cast defaults. Validate active chat, member and expression on writes; add backend and Chromium regressions. See `docs/cast-card-editor.md`.

## 1.1.0-alpha.7.1 - Accent and tabs

- Extend the connected mobile workspace tabs to desktop, matching each active page's surface. Keep the existing desktop pane layout and mobile shared footer.
- Generate/Stop follows Accent rather than the custom Buttons swatch, with black/white contrast computed from the active accent in modern browsers (host contrast fallback on older engines). Other buttons retain their theme preferences and disabled controls remain disabled.

## 1.1.0-alpha.7 - Studio polish

- Fill the actual drawer panel rather than cap the decorative entrance at 920px; use distinct Studio mosaic and Library folder icons in the drawer and floating toolkit.
- Make mobile workspace navigation outlined tabs, with a single shared Generate/Styles tool footer above Generate/Stop. Keep all six tools available and put the footer in normal flex layout, outside the scrolling workspace. Synchronize pane visibility when entering via top tabs and programmatic shortcuts.
- Size Cast background dialogs against the host's scaled/interactive viewport. Keep independently scrolling content and stable header/footer.
- Surface queued, rendering, ready and error background jobs in a separate Generate preview strip and floating widget indicator. Hydrate the current queue on open; forward transient provider previews and the registered final image ID without replacing illustration state, prompts, Append targets or cancellation ownership.
- Replace the nine compiler buttons with a grouped select and contextual help. Preserve unsaved protocol edits when changing family; expand the editor, reorganize actions, and style macro/CSS/workflow/recipe disclosures without native markers.
- Add focused backend and Chromium regression coverage for queue progress, job isolation, stale snapshots, pane geometry, viewport scaling, draft preservation and disclosure behavior. See `docs/studio-polish.md` for scope and limitations.

## 1.1.0-alpha.6 - MOSS layout and provider architecture

- Add explicit Swarm BBox and native MOSS JSON compiler choices, with normalized subject/object/text box grammar, conservative spatial inference, and validation. Preserve subject ownership and scoped Lore through serialization.
- Delegate normalized object placement to Swarm where preset expansion is required. Native JSON finalizes centered YXYX coordinates from resolved generation dimensions and preserves exact text fields; reject incompatible directives and raw/workflow overrides. Auto remains caption-first for MOSS.
- Query DescribeModel for the resolved effective checkpoint in Auto, using exact path verification, connection/user-scoped caching, manual override precedence and filename fallback. Record compiler/transport evidence in the inline inspector.
- Cover model-facing inputs, layout fixtures, invalid geometry, preset conflicts, raw override boundaries, retries, lore ownership and renamed checkpoints in deterministic tests. See compiler documentation for live verification limits.

## 1.1.0-alpha.5 - Manual Lore selection and provenance

- Select enabled saved lore identities from the Lore editor footer, independently of native activation. Keep selections across books and tabs in one Studio session. The persistent Lore tray shows the total and provides Clear and Open Generate; selected entries have a directory indicator and filter.
- Replace the Generate Lore shortcut pill with a small SVG book and count. Its light-dismiss popover groups the selected entries by actual source book and entity type, with a link back to Lore.
- Send only source book/entry IDs for main manual generation. Re-read native entries with World Books permission, verify ownership by source book, deduplicate and reject stale or disabled selections. Resolve model-specific text and merge non-conflicting Lore LoRA weights into the outgoing request without changing the base profile. Explicit checkpoint, canvas, reference and other generation settings stay in control; custom workflows/raw overrides and structured JSON are rejected with a clear error when manual Lore is selected. Inline/Pocket/Cast/inpaint paths remain independent.
- Persist authoritative provenance and contribution notes with the generation record. Browser and backend fixtures cover cross-book selection, inactive entries, grouping, request transport, draft isolation, conflicts and rejection paths.

## 1.1.0-alpha.4 - Cast background generation and shared assets

- Add per-Cast, default-off inline background generation, a manual Generate form, queue status, and an explicit shared asset reuse picker in the background manager.
- Accept one closed background-only request from a verified completed assistant reply when it is used by a valid Cast packet. Recheck the chat's Cast and permissions before queueing and again before rendering. Serialize background jobs per user and deduplicate existing keys, aliases, pending jobs and replayed source requests.
- Render with the Studio checkpoint and basic sampling recipe, without automatic character/persona, workflow, preset, reference or LoRA layers. Optionally resolve one enabled, activated location lore marker with its model-specific prompt, checkpoint, aspect, stack and reference overrides.
- Save one owned image, archive its ID in the unbound Background Assets folder and attach that same ID to the original Cast. Preserve existing defaults and member edits; protect against stale full-library writes. If the Cast is deleted or the scene key is occupied during rendering, retain the generated image in Background Assets.
- Keep provenance stage `cast_background`; existing Cast/folder reference checks protect generated scenes in Vacuum. Rehydrate existing dialogue cards from the saved scene without modifying message/swipe source.
- Test real mocked provider dispatch, isolated parameters, opt-in, stale source, replay, location lore, concurrent edits, failures, shared assets, and browser behavior at 1440/390/320px. Background jobs do not resume automatically after extension restart; see the new documentation for recovery and live checks.

## 1.1.0-alpha.3 - Scoped Visual Lore compiler

- Native activation is eligibility, not permission to inject every active visual layer. Inline and local parser protocols receive a scoped catalog; explicit lore markers select visible subjects, outfits, locations, objects and scene style. Generation revalidates activation and strips markers before provider dispatch.
- Add optional model-family positive and negative overrides with independent fallback to shared prompts (Anima variants may inherit Anima base). Preserve existing native extension metadata and recipes.
- Apply selected positive fragments to their corresponding scene fields. Selected negative prompts, LoRAs, reference conditioning, checkpoint and aspect remain image-wide; reject conflicting lore overrides and respect existing recipe precedence.
- Persist selection, rejection, fallback and whole-image conditioning diagnostics in tagged jobs and expose them in the existing prompt inspector. Raw prompts no longer receive automatic activated lore layers.
- Test actual mocked tagged provider dispatch, activation refresh, absence, ownership, conflicting recipes, family resolution, diagnostic persistence, editor save/retry and responsive layouts.

## 1.1.0-alpha.2.8 - Native Lore folders and binding indicators

- Read native world-book and entry folders and entry tags; group book options and render collapsible, counted entry folders with an Unfiled group. Search reveals matching folders, and older flat books retain their existing grouping.
- Paginate native book and entry lists beyond the previous 200-item cap. Keep the same user scope and visual metadata write contract.
- Resolve directory and editor entity types consistently: saved types win, explicit native labels/tags suggest a draft type, and unknown entries remain unclassified until a type is chosen.
- Restore visible enabled/disabled character and persona prompt-context pills, including accessible pressed state and non-color status cues. Compiler and lore injection unchanged.
- Verify pagination, folder disclosure and type filters, and live computed pill styling with mocked native responses at 1440/390/320px.

## 1.1.0-alpha.2.7 - Persona profile directory

- Replace the constrained Persona panel with a scrollable profile directory and a wide, compact identity editor. On narrow surfaces use a horizontal profile rail above the editor.
- Keep profile creation and deletion in the directory, display the selected profile name separately from the active binding target, and prioritize the visual identity prompt over native preset import.
- Preserve existing profile creation, selection, saving, binding and import semantics. Verify a 12-profile library, selection visibility, creation, saving and viewport rotation at 1440/390/320px. No backend, compiler or drawer changes.

## 1.1.0-alpha.2.6 - Drawer settings shortcuts and Lore permission

- Preserve the decorative launcher. Organize the Visuals subpage into styled Visuals and Settings headings, SVG refresh, collapsed character/persona bindings with render style and binding status, and links to the full editor, current Cast and Styles / LoRAs.
- Move stack saving back to Styles; retain saved/current stack binding. Share floating widget visibility and the 100/75/50% inline image presets with existing Studio behavior. Save prompt composition with a narrow server update preserving parser configuration; restore the confirmed choice on failure.
- Declare the missing `world_books` manifest permission. Native Lore requires explicit host authorization to read books and entries and save visual identity metadata. Add a manifest regression and denied/granted backend coverage.
- Verify quick settings and binding synchronization, active Cast navigation, unchanged launcher geometry, and mobile drawer layout with the compiled frontend.

## 1.1.0-alpha.2.5 - Visuals drawer subpage

- Restore the full decorative entry card and its Visuals action. Show quick binding controls on an exclusive drawer subpage with Back and Refresh, keeping the full editor in Studio.
- Present Character, Persona and LoRA preset saving as native keyboard-accessible disclosures with theme-aware custom SVG chevrons, no browser markers, and separate styled headers and bodies. Character starts expanded; Persona and preset saving start collapsed. Preserve disclosure state during navigation.
- Verify mutually exclusive visibility, unchanged entry dimensions, keyboard disclosure controls, return focus, persisted quick operations and the full workspace routing at 1440/390/320px. Backend and compiler remain unchanged.

## 1.1.0-alpha.2.4 - Two-card drawer

- Restore the decorative Studio entry composition and separate Quick Visuals into its own themed sibling card. Keep the quick controls and binding contracts unchanged.
- Verify independent geometry, ornament isolation and unchanged entry height when preset controls expand at desktop and mobile widths.

## 1.1.0-alpha.2.3 - Quick visuals cockpit

- Restore quick access in the Swarm drawer: character bind/enable, active look, saved or current LoRA stack binding, saved persona profile and enable, and save the current Studio stack under a new name.
- Keep identity editing, native preset import, wardrobe authoring and advanced settings in the Visuals workspace; named preset management remains in Styles. Compact launcher branding makes room for everyday controls.
- Use separate request-correlated quick access reads and narrow persisted binding mutations, validating active chat/persona identity and preset existence. Reject duplicate preset names; preserve unrelated saved identity, recipe, reference and look fields. No changes to the compiler or visual lore injection.
- Refresh on drawer activation, chat/persona change and Studio close; disable controls during writes, restore confirmed selections on failure, and ignore stale results. Browser regression at 1440/390/320px and mocked backend coverage.

## 1.1.0-alpha.2.2 - Visuals atelier refinement

- Rename the Studio Visual Lore tab and workspace heading to Lore; retain its existing routes, storage and injection behavior.
- Replace look and persona profile dropdown navigation with selectable cards, saved thumbnail/reference previews and active markers. Keep the existing editor bindings and explicit save/activation behavior.
- Prioritize appearance and outfit prompts, group auxiliary model/reference/LoRA/import/continuity controls into native disclosures, and provide independent editor scrolling with non-overlapping save footers on wide and narrow surfaces.
- Extend mocked browser coverage for card selection, disclosure access, preview hydration and footer separation. No backend, compiler, Cast or lore schema changes.

## 1.1.0-alpha.2.1 - Visuals workspace / Drawer cleanup

- Move Character identity, LoRA bindings, looks and Persona profiles into the full-size Visuals Studio workspace. The existing drawer button opens that workspace directly; remove the old drawer editor and its redundant Visual Lore pill.
- Use two columns on wide surfaces and explicit Identity & LoRAs / Looks navigation on narrow surfaces, with legible fields and a compact mobile header. Hide unrelated mobile generation controls in Visuals.
- Preserve existing backend operations and metadata, reuse the existing editor, retain drafts while switching Studio tabs, and cancel pending native preset hydration when the workspace is destroyed.
- Add compiled-runtime browser coverage for navigation, draft retention, failed save/retry, character/Look/persona save payloads, and 1440/390/320px layouts. No prompt compiler or lore injection changes.

## 1.1.0-alpha.2 - Visual Lore Atelier

- Move Visual Lore from the Chat Visuals drawer into its own Studio tab beside Cast, with drawer and Generate shortcuts to the same workspace.
- Add searchable and filterable native lore library, reference thumbnails, current-book counts, separate native activation and visual enablement states, and a spacious theme-aware editor.
- Add a responsive library/detail layout with a persistent save footer, reuse the existing Output Library image picker, and protect unsaved edits across tab switches, failed saves and stale responses.
- Preserve the existing native entry extension schema and generation behavior, including hidden recipe metadata and unchanged stack snapshots. Directory responses expose summary fields only; ownership and manual-generation injection are intentionally deferred.
- Add real-browser coverage at 1440, 390 and 320px, plus backend native metadata round-trip tests. See [Visual Lore Atelier](docs/visual-lore-atelier.md).

## 1.1.0-alpha.1 - Model-aware inline prompting (foundation)

- Bind saved character/persona identity to unique semantic owner headings; remove positional and leftover identity injection in ensembles. Preserve legacy character-only and explicit Pocket portrait behavior.
- Add Anima native and opt-in regional modes, Aesthetic metadata handling, MOSS caption, Krea 2 and effective-checkpoint-name Auto. Preserve Illustrious regional rendering and existing generation recipes.
- Keep simple Swarm preset directives out of structured field parsing; preserve literal visible text and escaped base qualifiers.
- Save authored request and compiled prompt separately; add read-only inline diagnostics and use the authored input for edits/retries.
- Add mocked generation regressions and model-specific docs. MOSS layout transport, architecture metadata lookup, fine-grained lore ownership and live GPU verification remain open for the final 1.1 milestone.

## 1.0.53 - Cast Worlds / Caption readability

- Add restrained glyph-edge shadows to exposed and translucent curated captions, speaker metadata and exposed scene labels. Preserve authored colors, pale dark-ink caption materials, solid cards, scene geometry and portrait anchors.
- Add browser regression comparing before/after caption paint and geometry across curated looks.

## 1.0.52 - Cast Worlds / Grounded scenes

- Anchor all eight scene actors to their scenic lower edge, including letterbox, film and postcard frames. Keep their scale independent of caption length.
- Let captions grow into the existing stage before expanding it. Remove the postcard slogan and extend the photo to its lower border.
- Test actual lower-edge gaps and scale at three dialogue lengths, three widths and all stage positions.

## 1.0.51 - Cast Worlds / Stage blocking and scene library polish

- Added side-aware blocking to all twenty curated presentations, with stable scene actor anchors and a larger VN Hero portrait bay. Auto retains each natural composition; speech and artwork are not flipped.
- Scoped album-cover photo styles to their intended surface, restoring transparent art in the presentation gallery.
- Reworked the mobile background modal with grouped actions, a distinct default-scene row, and a scrollable body.
- Matched background ownership validation to the owned image picker; failed saves roll back and committed-but-unacknowledged writes are reconciled against persisted state.
- Added Chromium blocking, picker transparency and save recovery regressions.

## 1.0.50 — Cast Worlds / Curated Atelier

- Integrated the two approved Atelier collections: ten portrait/dialogue overlaps, two revised graphic panels and eight scene-backed stages. Fifty named looks plus two legacy gallery choices.
- Moved VN Hero Stage to the new scene family, Corner Pop-Out and Angled Cutout to graphic panels, and retired VN Standee (existing selections migrate to Obsidian Lower-Third).
- Added a group-owned background library, saved scene keys and aliases, default scene, image replacement, non-destructive removal, dedicated Output Library export, and scene preview selection.
- Added optional `background=key` and `background=none` Cast packet attributes with read-only chat rendering and safe fallback. No automatic scene generation in this release.
- Kept the post-Vacuum baseline and existing Cast references in the same persisted library; rebuilt both manifest runtime entries and aligned all package versions.

## 1.0.49

### Changed

- Rebuilt the **Portrait + dialogue overlap** family with distinct component anatomy instead of shared gradient-box speech plates.
  - **VN Hero Stage** is now a proscenium-style illustrated scene with a wide lacquer script strip.
  - **Corner Pop-Out** is now a pinned memo / folded note with a dog-ear, pin detail, and pasted-paper silhouette.
  - **Angled Cutout** is now a slanted poster-banner composition with a sash-like dialogue plate and backdrop swash.
  - **VN Standee** is now a scenic cutout paired with a rigid display placard and inset caption window.
- Updated the overlap-family side-placement handling so the rebuilt silhouettes keep their intended composition in Auto, Left, and Right positions.
- Added a fresh browser-generated contact sheet for the current Material Edition designs after the overlap-family redesign.

## 1.0.48

### Cast Material Edition: per-preset palette fitting

- Replaced the one-size-fits-all soft-surface recipe with **twelve independent speaker-tint palettes** in the canonical `scripts/cast-material-redesign.css`. VN lacquer, folded editorial note, angled panel, messenger thread, ID laminate, holographic comms, pixel RPG, scenic standee, aged folio, graphite HUD, phosphor terminal, and cinematic matte now have distinct ink/black base colors and different tint strengths. No extra global override layer.
- Tuned Tech Messenger and Mecha HUD separately after real-browser contrast checks identified under-4.5:1 worst-case combinations; kept VN Hero's nameplate bright and the lanyard/folio paper surfaces light. Exact authored quote colors remain untouched.
- Added `tests/cast-material-tint-v48-browser.py`: 72 browser cases across three speaker colors, twelve presets, and two message widths, measuring caption-color contrast against the defined surface endpoints. Worst sampled contrast was **4.84:1** (Mina-pink, Shoto-blue, Katsuki-orange tested).
- Preserved the original v1.0.46 contact sheet and added current and three-voice contact sheets, a per-preset tuning guide and contrast report. Cast packet, Shadow DOM, crop, album and workflow code are unchanged.

## 1.0.47

### Changed

- Rebalanced the **Cast Material Edition** soft-surface presets so speaker-color tint is mixed more strongly with black/ink instead of flooding the entire panel. This preserves the redesigned silhouettes while improving dialogue contrast on VN-style, messenger, standee, dossier, HUD, and cinematic soft backgrounds.
- Defined stronger neutral base values for shared material tokens (`--m-panel-*`, copy/ui colors, edge tint), so color blending now decorates the component instead of washing out readability.

## 1.0.46

### Cast Material Edition

- Rebuilt twelve donated Cast presentations at the HTML/CSS anatomy level. VN Hero, Corner Pop-Out, Angled Cutout and VN Standee now have distinct cutout and script geometry; Tech Messenger has a real asymmetric conversation bubble; Agency Lanyard becomes a laminated identity card; Cyber Comms, 16-Bit RPG, Mecha HUD and Terminal Console each have their own interface surface; Gothic Folio uses engraved vellum; Cinematic Bleed is a letterbox scene.
- Removed the repeated left-side colored-stripe treatment from these twelve. Materials now react visibly to speaker color without recoloring authored dialogue or forcing all characters into blue-black panels.
- Replaced abandoned HTML and removed source rules for the twelve retired layouts at the canonical preset generator. Changes are maintained in `scripts/cast-material-redesign.json` and `scripts/cast-material-redesign.css`. Preserved all 34 IDs, presentation groupings and the three approved Atelier references.
- Retained the Cast Islands Shadow DOM lifecycle and core parser untouched. Added 216 browser geometry/color scenarios and a full 12-look contact sheet, plus the existing 306-case catalog geometry regression. The old R6 pre-Islands browser entrypoint now invokes the modern Cast Islands and material regressions.

## 1.0.45

### Changed

- Re-audited the canonical Cast wardrobe palette after live/gallery previews revealed a persistent default navy tint. Neutralized donated blue-black panel surfaces in VN Hero, Corner Pop-Out, Angled Cutout, Agency Lanyard, Cyber Comms, 16-Bit RPG, Manga SFX, Fighter Banner, Mecha HUD, Terminal Console, Gothic Folio, Cinematic Bleed and related presets. All changes live in `scripts/build-cast-presets.py` and its regenerated `src/state/cast-presentations.ts`, not stacked CSS after the fact.
- Preserved individual visual silhouettes and speaker-color-driven ornamental accents. The dialogue caption still uses the exact authored `<font color>` when present. Approved Atelier references (Chapter Tab, Moonlit Halo, Polaroid Side Note) remain unchanged.
- Added `tests/cast-neutral-palette-browser.py`: 11 identified layouts in pink/blue speaker colors across 390px and 1100px host widths, checking neutral backgrounds, speaker-reactive borders, unchanged authored quote paint, content containment, and one image/caption per mount. A real Chromium composition screenshot is included for review.

## 1.0.44

### Changed

- Added a reusable Expression Studio **Workflow Health** component (`src/studio/workflow-health.ts`), compiled ahead of Expressions Studio. Both Upscaler and built-in BiRefNet now use its status announcement, theme-aware accent rail, action layout, and visual status states. Additional model checks can reuse it without copying markup or CSS.
- BiRefNet's **Check model** action now stays available even when the model is ready; only its extra installation/download links and directory hint collapse on success. They return when the backend reports a missing or unsupported model.
- Added a Chromium regression for both workflows at phone and desktop widths, including equal geometry, independent status transitions, and unchanged expression selection. Backend checks, model files, and Cast rendering are untouched.

## 1.0.43

### Changed

- Unified the **Expression Studio** model-check presentation for **AI Upscale** and built-in **BiRefNet**. Both status panels now use the same accented ribbon treatment, spacing, typography, and action sizing, while preserving their distinct model-check logic and workflow-specific actions.
- Built-in BiRefNet now reports its current check state on the shared ribbon styling as well, so installed, missing, and unavailable states read consistently beside the Upscaler model check.

## 2026-11-22 · Expressions Maker upscale model check ribbon (1.0.42)

- **Enhance preflight ribbon:** The Expressions Maker Enhance step now displays an Upscaler model panel, using Studio theme tokens, with a Check model button and accessible live status. It names the exact configured upscaler when available rather than merely saying “Connected model enhancement.”
- **Backend registry validation:** `check_expression_upscale_model` reads this SwarmUI connection’s saved AI Upscale configuration, then checks its selected model against the connected SwarmUI `/API/ListT2IParams` model list. It distinguishes installed, missing, empty model lists, unconfigured setup, and unavailable backend checks. A downloaded file alone does not qualify as installed.
- **Workflow transparency:** Saved workflows and custom Comfy graphs have their own neutral status explaining that their model choices live inside the graph and cannot be verified as one selected upscaler by this check. The ribbon does not change the saved settings or substitute an upscaler automatically.
- **Tests:** Backend contract cases cover correct/wrong model names, empty lists, failed discovery, unconfigured settings and saved/custom workflows. `python tests/expression-upscale-ribbon-browser.py` checks the compiled Expressions Maker at 390px and 1200px, including status refresh and unchanged expression selection. TypeScript and production build were checked with the globally available compiler. No Cast or conversation DOM changes.

## 2026-11-22 · Stability Matrix background-removal paths (1.0.41)

- **Shared model folder support:** Studio’s on-device BiRefNet installer now accepts Stability Matrix’s `Models/BackgroundRemoval` as well as ComfyUI’s `models/background_removal`. Picking either final directory writes weights directly there.
- **Safe model-root selection:** Selecting `models` checks for existing `background_removal` or `BackgroundRemoval` subfolders and reuses the existing one. If both exist it refuses an ambiguous write. A new lowercase ComfyUI `models` root keeps its historical auto-create behavior, but an empty capitalized Stability Matrix `Models` root asks for the explicit shared category instead of silently creating the wrong directory.
- **Actual backend readiness:** Model verification still asks the ComfyUI `LoadBackgroundRemovalModel` node for its registered choices rather than assuming that a downloaded file is usable. Status text now calls out the required shared-folder mapping, backend refresh/restart, and local-browser-vs-remote-backend distinction.
- **Regression:** `node tests/expression-background-matrix-contract.mjs` exercises both folder naming conventions, existing-file reuse, root selection, and refusal of ambiguous paths with an in-memory File System Access API mock. No changes to Cast, packet rendering, or host DOM.

## 2026-11-22 · Mobile Cast presentation fitting room (1.0.40)

- **Phone-first wardrobe:** At 680px and below, the full presentation modal opens on a Looks tab with filters and design cards immediately available. Stage position and Crop Workshop live on a separate Adjust tab. The old combined layout stays in desktop/tablet view.
- **Mobile modal sizing:** The picker occupies the usable interactive viewport, respecting host safe top and viewport height, with an independently scrolling body and compact header. The mobile footer is omitted in favor of the existing accessible header close button. Filters and section tabs remain reachable during gallery scrolling.
- **State preservation:** Looks/Adjust retain their own scroll position; saved member side and crop survive gallery re-renders. Filtering still refreshes the preview and resets the gallery scroll so results are visible. Reopening the modal always returns to Looks.
- **Noninvasive scope:** No change to the Cast Islands renderer, packet parser, narration handling, saved presentation schema, artwork scaling or desktop picker layout. Existing native preset widths and side parity remain in place.
- **Browser fixture:** `python tests/cast-mobile-presentation-modal-browser.py` drives the actual bundled Studio workspace with a mock backend and image endpoint. Checked 320×640, 390×844, 430×932, and desktop 1024×850: mobile visibility, initial card placement, body scroll, tab and filter interactions, position/crop persistence, dialog close/save, and desktop parity.
- **Validation:** Production bundle build, strict TypeScript via available global TypeScript 5.8, Cast contracts, album management, 306-case geometry matrix, stage parity, Cast Island remount and new mobile browser regression passed. The full Node test chain reaches its known environment blocker, missing `jsdom`.

## 2026-11-22 · Cast live stage parity (1.0.39)

- **Manga SFX side-position geometry:** Stage Auto, Left and Right now keep the same internal portrait, speech plate, and decorative mark arrangement. Only the 420px composition's placement within the chat message changes. This prevents side controls from silently making the live design differ from its gallery preview.
- **No global scene restructuring:** The full-width Shadow DOM island remains a normal independent block within Lumiverse's message. A very wide chat bubble will still show open space alongside a compact left/right card. This release deliberately does not float text around illustrations, change message widths, or touch narration/streaming.
- **New actual-island regression:** `python tests/cast-live-stage-parity-browser.py` tests the real Cast CSS inside Shadow DOM hosts at 1160, 760, 420 and 320px, including independent paragraphs, stage alignment, and preservation of per-element positions. The existing 306-scenario geometry matrix now asserts Manga SFX internal parity across all side modes too.
- **Source hygiene:** Canonical side CSS lives in `scripts/cast-expression-sides.css` and is regenerated into `src/state/cast-presentations.ts` and both compiled runtimes. Approved Chapter Tab, Moonlit Halo, Polaroid, character keys, crop behavior, and Cast Islands are unchanged.

## 2026-11-22 · Cast stage geometry audit (1.0.38)

- **Preset-native composition widths:** The 34 named wardrobe designs now have explicitly audited widths; compact face/object/overlap cards no longer inherit a 560px full-width stage when their artwork needs less room. The approved Chapter Tab, Moonlit Halo and Polaroid Side Note keep their prior stage width and styling.
- **Gallery-to-chat parity:** Each thumbnail uses its own exact native stage width before scaling, rather than always shrinking an artificial 560px canvas. Stage position previews still use the member's saved Auto / Left / Right setting.
- **Manga SFX stays together:** Left and Right no longer separate the figure and speech plate across the stage. Its SFX decoration follows the figure, with quoted dialogue in a readable, bounded card.
- **Only stage layout changed:** Saved expression keys, image IDs, crop settings, Shadow DOM lifecycle, Cast Islands packet parsing, narration, and streaming logic were not modified.
- **Regression:** `python tests/cast-stage-geometry-browser.py` exercises 34 designs × three stage positions × 760/420/320px host widths, long mobile dialogue, preserved following paragraphs and bounded image/speech geometry. Cast album management, island remount and member-side browser regressions also pass. Full `npm test` stops at unavailable `jsdom` after passing the Cast and other core contracts.

## 2026-11-22 · Cast album management and gallery stage preview (1.0.37)

- **Rename saved expression keys:** Hover or focus an expression tile and choose the pencil. Rename rekeys the Cast image mapping without changing its image ID, updates the fallback/packet selection when appropriate, and rejects duplicate names before writing. The original Lumiverse image and character card remain untouched. Historical chat messages with the old packet key are not rewritten.
- **Remove individual expressions:** Each tile has a small X action (always visible on touch). Confirmation removes only the Cast mapping. If the deleted expression was the member's fallback, Cast selects `neutral` when available or the next saved expression. Deleting the last expression safely leaves an empty album. Member deletion remains at **Identity → Remove member**.
- **Lumiverse character avatars:** From Lumiverse character now displays thumbnail images from `/api/v1/characters/:id/avatar?size=sm`; unavailable avatars fall back to the character's initial. Import still copies mappings without editing the source card.
- **Stage position in the wardrobe gallery:** Auto / Left / Right now appears above the full presentation catalog. Switching it redraws every visible preset thumbnail with the saved per-member side, so asymmetric and center-based compositions can be evaluated in the picker itself. The composition filter and shared crop workshop remain intact.
- **Verification:** `python tests/cast-album-management-browser.py` exercises the compiled frontend and a minimal mock Lumiverse backend for key rename, duplicate rejection, fallback deletion, all preset previews, side save and filter persistence, avatar fallback and card import. TypeScript and Cast contracts pass. No Cast Islands/Shadow DOM/packet pipeline changes.

## 2026-11-22 · Cast quick-swap polish (1.0.36)

- **Text alignment belongs to Cast:** Shadow-root host and dialogue get a left-aligned baseline, preventing justified host MessageContent CSS from spreading word spacing across cards. Named presets can still apply their own intentional alignment.
- **Legacy Story Card retired from selection:** hidden in the quick swap and Studio wardrobe; historical saved Story Card selections still render. Newly created casts default to Manga Chapter Tab.
- **Mobile-safe quick swap:** the search field starts hidden and unfocused. A dedicated SVG magnifier beside the composition dropdown toggles it; the soft keyboard is only requested after a deliberate tap.
- **Per-member side in quick swap:** Auto / Left / Right saves only the current Cast member via `set_cast_side`. Other members, expressions and original messages are unchanged.
- **Direct navigation:** the quick menu's compact footer opens the clicked member directly at Cast → Presentation, including when the Studio library must be loaded asynchronously. The general Studio/Generate landing path is bypassed.
- **Crop controls decluttered:** removed the unpreviewable crop sliders from Member → Presentation. Both the full wardrobe modal crop workshop and the quick swap Crop tab remain available, sharing the same saved framing.
- **Tests:** added `tests/cast-quick-polish-browser.py` with a hostile justified host, mobile search, targeted side save, direct navigation, and preservation of the existing wardrobe. Backend storage isolation is covered in `backend-contract.mjs`.
- **Boundary:** Cast Islands' display-only source transform, Shadow DOM hydration/remount, and saved expression keys are unchanged. Rebuild both `dist` entrypoints when installing.

## 2026-11-22 · Per-member Cast stage positions (1.0.34)

- **Director-style character blocking:** one Auto / Left / Right stage position per Cast member, under **Member → Presentation**. All that member’s expressions share the direction; Shoto and Katsuki can choose opposite sides. Presets keep their own artwork geometry, authored colors and quote direction.
- **Cleaner expression gallery:** removed the redundant Auto / Left / Right controls from each image tile. Expression imports and the previously removed inline “In the story” preview are unchanged.
- **Storage migration:** replaces the legacy `expressionSides` map with one validated `presentationSide`. If every stored expression explicitly shared a side, that value migrates. Mixed or partial legacy maps default to Auto, avoiding a guessed choice for the entire member. No saved image IDs, packet keys or messages are modified.
- **Preservation:** the official Cast Islands pre-render slot pipeline, Shadow DOM, right-click Looks/Crop menu, 34 named wardrobe designs, crop framing and importer remain untouched. Only the side source is moved up to the member.
- **Regression:** `node tests/cast-expression-sides-contract.mjs`, `python tests/cast-expression-sides-browser.py`, `python tests/cast-side-geometry-browser.py`, and `python tests/cast-side-narrow-browser.py`. Browser validated both of one member’s expressions moving together, an independent second member, persistence and Auto reset, and 34 styles with narrow-screen bounds. Cast Islands and imported-pack roundtrip checks passed.

## 2026-11-22 · Cast per-expression sides and full-width member workspace (1.0.33)

- **Choose expression placement independently:** each saved expression tile now has Auto, Left, Right. The choice is keyed by its immutable expression ID, so `03_angry_shout` and `06_soft_smile` can take opposite sides using the same Cast member and the same presentation preset. Auto removes the override and preserves the preset's original layout.
- **Stage direction, not mirrored pixels:** horizontal presets place the artwork on the chosen side of the quote; layered/cinematic compositions move their own art bay; full silhouette designs dock toward the requested side while retaining their individual composition. No image flips or RTL dialogue glyphs. The look remains selected separately through the wardrobe modal.
- **No more redundant inline preview:** the member screen is now two columns (roster + flexible member content), without the “In the story” sidebar or mobile duplicate. The Presentation tab and full composition-based selection modal remain available. The old “Preview expression” control is now explicitly “Packet expression”, for choosing the copyable bounded packet.
- **Storage and preservation:** a sparse validated `expressionSides` map is saved with each Cast member. Legacy libraries default to Auto; invalid and nonexistent expression-side entries are rejected. The prompt, packet grammar, Shadow DOM source-order mounts, expression imports, crop controls and authored dialogue colors are unchanged.
- **Canonical source:** orientation CSS lives in `scripts/cast-expression-sides.css` and is embedded by `scripts/build-cast-presets.py`. Future wardrobe regenerations retain the feature. Both compiled entrypoints ship in the full cumulative overlay.
- **Regressions:** `node tests/cast-expression-sides-contract.mjs`, `python tests/cast-expression-sides-browser.py`, `python tests/cast-side-geometry-browser.py`, `python tests/cast-side-narrow-browser.py`. Chromium covered independent side persistence, true image/quote ordering, modal access, preserved native narration, auto reset, all 34 looks and 320/430/780px dialogue bounds. Cast Islands and import roundtrip regressions passed; combined TypeScript passed via global compiler. The full npm Studio DOM test still requires `jsdom` absent in this runtime.

## 2026-11-20 · Cast expression pack import and member reopening (1.0.32)

- **Fixed the `undefined.id` crash on imported expression sets.** Studio used prettified names to reconstruct image keys, turning `01_stern_neutral` into `01-stern-neutral` and then indexing a missing image. The Cast UI now uses exact saved keys for lookups and option values, and uses friendly names only for labels. This also protects preview/default selection and packet copy from key drift.
- **Save-acknowledged pack imports.** The importer now commits one Cast member snapshot and waits for the Cast storage save before reporting expressions as attached. If uploads succeeded but the Cast save failed, it clearly reports that distinction and retains the local assignment for retry without re-uploading.
- **Defensive image listing.** The Expression Studio opening path ignores invalid image entries rather than throwing from `image.id`.
- **Permanent browser regression** `tests/cast-pack-member-roundtrip-browser.py`: on v1.0.31 the imported-underscore member crashes, while v1.0.32 opens Mina's expressions, imports Katsuki's numbered keys, persists/reopens them, and verifies failed-save/retry semantics. Existing ZIP and normal Cast contracts remain green.
- No changes to Cast Islands, pre-render slot placement, dialogue handling, wardrobe styles, crop rules or Shadow DOM.

## 2026-11-20 · Cast Islands v2: replace post-render reconciliation (1.0.31)

- **Architectural replacement:** 88 KB old text-reconstruction/anchor-surgery renderer deleted. The new ~21 KB frontend hydrator never moves/splits/removes/recovers native prose. No `sourceAnchor`, `recoverMissingNarration`, `splitText`, stale source ledger, or post-render quote consumption.
- **Official Lumiverse display-only API:** the backend registers `spindle.registerMessageContentProcessor(..., 80)` for `origin === "render"` only. Each *complete* closed Cast packet becomes a valid `<span data-ss-cast-slot>` at its exact source offset *before* Markdown and the sanitizer. The unchanged original remains in stored chats, exports, and prompt history. Other extensions' control payloads remain untouched.
- During streaming, a trailing incomplete packet is hidden. When its closing tag arrives, the next host render projects a stable slot at that exact location. A plain-text dialogue fallback is in the slot until artwork can hydrate.
- The frontend reads only those official pre-render slots, attaches an open Shadow Root, uses a shared constructable stylesheet, and renders the existing wardrobe presentation with authored dialogue color, lazy image loading, and the member crop. Unrecognized/missing artwork leaves fallback speech visible. No old DOM surgery.
- Preserved the Studio wardrobe and Looks/Crop right-click picker (including targeted member saves), 34 named presets, member storage, expression imports, and original bracketed packet syntax.
- Added `tests/cast-island-pipeline-contract.mjs` and `tests/cast-island-api-browser.py`. The browser harness verifies two same-paragraph packets, narrative ordering, progressive complete/incomplete slots, Shadow DOM hydration, zero writes on unrelated host updates, and right-click picker. The supplied 13-packet braille scene was also tested locally: 13 slots, unchanged prose/foreign branch payload, zero literal raw Cast tags; the personal source is not bundled.
- Mocked backend contract verifies that `render` transforms content without mutating saved messages, swipes, or user-authored content. Full npm test chain reaches missing `jsdom` after affected contracts pass. Real Lumiverse host display-preprocess / sanitizer behavior still requires live testing.

## 2026-11-20 · Cast source-ordered narrative islands (1.0.30)

- Replaced independent source-progress portrait placement with **unique adjacent native-prose anchors** plus one deterministic source-order pass. Multiple sanitized Cast packets no longer compete for the same arbitrary paragraph, producing a long wall of disconnected expressions.
- Recovered narrative passages are interleaved with their own expression mounts before or after verified native paragraphs, in the saved packet order. Original native paragraphs are **not moved, split, cloned, or rewritten** by the new sequencing pass.
- Missing in-between prose may link two already-safe expression islands. Unrecognized foreign-widget payloads remain excluded from source-backed prose recovery; unrelated native quotations are not claimed as Cast captions.
- Standalone complete packets can still use an empty native paragraph sentinel. Short, uniquely matched source excerpts can establish safe prose anchors; ambiguous matches fail closed. Short missing prose is restored only when the entire native body is effectively empty.
- Added `tests/cast-r31-narrative-sequence-browser.py`: five packets with three missing connective paragraphs. This test **fails on 1.0.29 and passes on 1.0.30**, confirming the exact native/recovered/Cast order, all five quotations, unchanged native paragraphs, and zero idle DOM writes. An additional local probe using the user-supplied 13-packet scene also rendered all expressions without a wall of adjacent portraits; that private sample is not bundled.
- R29 settled-source, R28 nested bubble, R27 foreign-widget, R26 quote ownership/handoff, R25 real token streaming, R30 safe mid-word anchor, and current Cast contracts passed. Older R24 progressive and R4 fixtures still have stale event assumptions/timeouts; the full npm chain remains unverified without local `jsdom`.
- No changes to the Cast packet syntax, portrait layout CSS, theme mapping, crop editor, right-click picker, or foreign choice widgets. Actual Lumiverse livetesting remains required.

## 2026-11-20 · Cast block-safe islands, no mid-word anchor surgery (1.0.29)

- Fixed a destructive fallback in the live Cast reconciler: when a packet's original delimiters were sanitized away, it used a *guessed* source position to move a prefix out of a native text node. This could insert a portrait into the middle of a word, splitting e.g. “crowded the crime-scene tape” across two paragraphs.
- Only an exact verified complete packet boundary is allowed to split a host text node. When the delimiter is missing or partial, the existing Shadow DOM expression island is mounted **only at a verified narrative block boundary**, without cutting original host prose. If no safe narrative anchor exists, it doesn't mount.
- Recovered narration still obeys the verified message-body/foreign-widget boundary; stable-source and no-idle-rewrite protection stays intact. No change to closed-packet grammar, CSS, image crops, or the right-click picker.
- Added `tests/cast-r30-island-anchor-browser.py`, a Chromium red/green test that fails against v1.0.28 and passes on 1.0.29. The test asserts both original host paragraphs remain exactly unchanged and the portrait still mounts at a safe block. R29 stable-source (16 source flips/0 writes), R28 bubble, R27 route payload, R26 quote ownership, and R25 real token stream tests pass. The old R24 and Shadow R20 fixtures are stale and timed out.
- Build, affected Cast/Frontend contracts, and combined strict TypeScript pass using the locally available global compiler. Full npm suite not verified (missing local `jsdom` dependency). Real Lumiverse validation is still required.

## 2026-11-20 · Cast settled-source stability and no-idle-rewrite guard (1.0.28)

- Fixed repeat reconciliation against non-atomic Lumiverse source projections. `getContent()`, recent-message content and backend source data can alternate between complete and truncated versions of an unchanged message; once a complete packet is mounted, Cast now retains the first valid owned source until an actual edit, swipe, generation handoff or chat change.
- Made settled Cast mounts genuinely read-only when their source, native text, owned Shadow DOM hosts and presentation library have not changed. This stops source-position re-anchoring and repeated narration recovery from moving paintings on routine host commits. New streaming work in a *different* bubble never invalidates settled mounts.
- Explicit final generation content promotes the authoritative stream source after completion. Library updates have a revision check, and actual message edits/swipes clear the settled-source lock so changed quotes and outfits still update.
- Added `tests/cast-r29-stable-projections-browser.py`: the previous build made 160 DOM mutations during 16 alternating cached projections; v1.0.28 makes zero. It also tests a separate active generation, source-backed middle narration retained exactly once, real edit invalidation, and presentation change.
- No changes to packet grammar, Shadow DOM design/CSS, crop geometry, route widgets, or the reading text itself. Real installed Lumiverse remains the necessary validation; this regression mocks the host event/DOM contracts.

## 2026-11-20 · Cast prose stays inside the message bubble (1.0.27)

- Source-backed narration recovery now requires a verified native prose surface. It can no longer append recovered paragraphs to the outer message shell, where they appeared below the bubble and below the branching-choice widget.
- When the host still has original narrative text, use that specific narrative paragraph as the safe fallback anchor; never use labels or descriptions inside another extension's rendered widget to estimate Cast packet positions.
- Stripped packets that have no reliable in-bubble anchor fail closed rather than writing into foreign UI. Completely sanitized messages that retain only an invisible paragraph sentinel still recover their closed Cast captions and safe narration.
- Added `tests/cast-r28-bubble-recovery-browser.py`. Chromium reproduction fails against 1.0.26 when Cast inserts prose inside a route widget, and passes here with two packets, intact widget, zero leaked prose, and unknown-member cases. Existing streaming/final-handoff, braille, colors, Shadow DOM and no-duplicate tests passed.
- No changes to the bounded packet grammar, crop controls, wardrobe presets, right-click picker, or choice extension. Native installed Lumiverse remains the final validation.

## 2026-11-20 · Cast foreign-payload recovery guard (1.0.26)

- Do not use missing DOM text alone as proof that ordinary narration was deleted. When source material outside Cast packets contains another extension's control payload (HTML comments, custom elements, code fences or pipe-delimited branch records), Cast now refuses to reconstruct that segment. The owning extension's already-rendered widget remains authoritative.
- Fix the branch-choice interaction where a correctly rendered "4 POSSIBLE ROUTES" widget could be followed by its raw `1|@challenge|...` / `2|@tactical|...` source rows, incorrectly restored by Cast's `recoverMissingNarration()`.
- Preserve recovery of actual plain narration between two closed Cast packets and after a Cast packet when it is free of other extensions' structured data. Fail closed for mixed prose/control payload segments rather than duplicating hidden interface data.
- Add a Chromium regression that fails on 1.0.25 and passes on 1.0.26, covering both HTML-comment-wrapped and plain-text route records, native rendered widget, after-packet narration, and long missing inter-packet prose.
- Previous live token streaming, Shadow DOM, authored dialogue colors, right-click Looks/Crop, and no-scroll-repaint code remain unchanged. Full Lumiverse app validation is still required.

## 2026-11-20 · Cast real token streams and duplicate-dialogue ownership (1.0.25)

- Follow Lumiverse's actual `STREAM_TOKEN_RECEIVED` delta contract, not an already-written saved message. Track generation ID, sequence and accumulated text, and bind new streams to a matching provisional bubble (escaped literal tags or real unknown HTML elements) instead of guessing from stale recent-message records. Hide the provisional text of unfinished raw-HTML packets without masking surrounding narration. Closing tags still control whether an in-flight expression can mount.
- Fix duplicated Cast dialogue when Chromium parses the opening packet as an unknown HTML element and discards its literal closing delimiter. Remove exactly the quotation text owned by the verified unknown element or opening delimiter. Never remove unrelated narration or a second speaker's line.
- When the host has stripped all tag markers but left the quote, require substantial matching prose on both sides of the native quotation before consuming it. Otherwise leave the native quote alone and suppress the duplicate Shadow DOM caption until the host commits a safe state.
- Add a production-shaped browser regression with stale `getContent()` and real token events, plus a **red on 1.0.24, green on 1.0.25** browser test using Chromium's actual unknown-tag HTML parser, and a no-unowned-quote-consumption safety test. Correct an existing async browser fixture to wait for the quick-picker save acknowledgment.
- No edits to preset layouts, crop geometry, Studio settings, or the data format. Node build/typecheck, affected contracts, and targeted Chromium tests pass; real Lumiverse testing remains necessary.

## 2026-11-20 · Cast progressive closed packets, native prose recovery, and bounded zoom (1.0.24)

- Fixed unsafe native-quote/closing-tag matching: Cast now removes a visible packet only when its **entire closed envelope** is an exact match for that packet's own source dialogue. It cannot grab a later quotation, a different closing tag, or the intervening narrator's paragraph.
- Added conservative source-backed recovery for **missing outside narration**. Chromium parses `<swarm-cast=Shoto-...>` as an unknown HTML element, but `</swarm-cast>` is not its matching closing element; sanitizers can consequently delete prose nested between two packets. When a sufficiently long source passage is entirely absent in the host DOM, the renderer restores it as safe light-DOM prose. Surviving host prose is never replaced. The saved message remains unchanged.
- Native text moved for an insertion anchor is now kept in a **light-DOM sibling** rather than a Shadow DOM slot. Source-backed recovery is excluded from subsequent text snapshots, restored on teardown, and protected from duplicated body text on repeat reconciliations.
- Completed closed packets mount **progressively during token streaming**. The unfinished trailing packet is hidden from the reading view until it closes. A known generation ID is no longer overwritten by a stale `getRecent(1)` projection. Same-ID regeneration still clears old sources.
- Fixed crop scale leaking across chat: the canonical preset CSS clips zoomed art to its **actual image bay**, never the neighboring caption or paragraph. This applies to both native picker and Studio crop settings without changing the full-silhouette Moonlit default.
- Added/expanded permanent Chromium regressions: user's two adjacent braille-colored Shoto packets with a long intervening paragraph; real browser parsing and sanitizing unknown elements; active streaming incomplete → first closed → second closed → final handoff; Y focal-points and 2.65x zoom across Fighter, VN Hero, Tarot, Shonen and Open Horizon; zero idle scroll mutations.
- Closed-packet grammar and Shadow DOM wardrobe remain unchanged; legacy opening-only parsing stays intentionally disabled. Build, combined TypeScript, affected Node contracts and targeted Chromium tests passed. Real Lumiverse livetest is still required.

## 2026-11-20 · Cast strict closed packets and stream-final handoff (1.0.23)

- Removed both preview and live opening-only/adjacent-quote Cast parsers. Only fully closed `<swarm-cast=...>...</swarm-cast>` packets are eligible to mount; missing closing tags are inert. Studio sample/prompt already issue complete packets.
- Normalize U+2800 braille blanks only in the parser's working copy **before** detecting envelope delimiters and interpreting `<font color>` HTML. This handles `<font⠀color=...>` and braille-spaced dialogue while leaving chat history and native narration unmodified.
- Defer Cast decoration for the active streaming message until `GENERATION_ENDED` / `GENERATION_STOPPED`, avoiding host token-by-token DOM replacements fighting the reconciler. Preserve the R4 stable Shadow DOM mount once final.
- Clear cached source for same-ID streaming replacements so stopped/incomplete generations cannot recover and paint a stale expression. Other messages' mounted expressions remain untouched.
- Added `tests/cast-strict-r23-browser.py` with braille font colors, two speakers, sanitized host commits, no legacy fallback, final-handoff visibility, same-ID stale prevention and zero idle scroll writes. Updated permanent Cast/wardrobe/backend expectations to require closed packets. Full npm chain passed the affected contracts, then stopped at missing `jsdom`.
- No presentation CSS, crop controls, gallery, modal, or backend storage logic changed. Existing opening-only Cast messages intentionally stop mounting.

## 2026-11-20 · Cast crop focal-position precedence (1.0.22)

- Fixed a real live-presentation bug: contributed presets with more-specific hardcoded `object-position` rules ignored the saved horizontal/vertical crop values, even though Studio and the right-click picker persisted them correctly.
- When member crop is enabled, the named presentation now explicitly honors its shared X/Y focal point and zoom inside the Shadow DOM mount. When disabled, each preset keeps its original designed focal point, without forcing a common fallback across the wardrobe. Transparent Moonlit Halo remains un-cropped by design.
- Changed the canonical `scripts/build-cast-presets.py` source and regenerated both runtime entries. No quick-picker event handling, packet parsing, or Cast reconciliation changes.
- Added a Chromium browser regression for Tech Messenger, Editorial Square, and Chapter Tab: verifies CSS position and actual screenshot difference between Y=0 and Y=100, in both light DOM preview and Shadow DOM mount. Existing bounded packet, quick crop, typecheck and scroll lifecycle checks passed.

## 2026-11-20 · Cast Shadow Isolation, Fighter Fit, Expression Pack Import (1.0.20)

- Isolated every **live chat Cast expression** inside an open Shadow Root with a shared constructable stylesheet, preserving inherited Lumiverse palette tokens while shielding the actual layout, image, and dialogue from arbitrary theme selectors. The original message's positioning anchor and source remain in the host DOM. Fallback inserts one stylesheet for older browser runtimes.
- Adapted the R4 reconciler to query its own shadow content and retain image node reuse, source-backed caption recovery, editing isolation, native prose and scroll stability. The chat quick picker identifies shadow hosts through the composed event path so right-click still works.
- Tailored Fighter Banner in the canonical generator: wider (~97%) speech dock, smaller (~16px) dialogue, slightly shorter overlap, and a high-z-index character in front of the diagonal background. Other approved presets remain unchanged.
- Added **Import pack** to Expression Studio (Build Your Set): select PNG/JPEG/WebP files or ZIP archives; filename without extension (and optional character-prefix) becomes the expression label. Existing images are **skipped**, never overwritten. ZIP entries are validated and size-limited. Images go through the native `/api/v1/images` endpoint and save to the member's existing expression set.
- Added Chromium tests for destructive host-theme CSS, open-shadow right-click/crop/scroll, deflated and stored ZIP imports with collision safety, and Fighter Banner foreground geometry. Updated the legacy VN contrast browser test to inspect Shadow DOM explicitly. TypeScript/build and targeted Cast contracts passed. Full npm test still requires `jsdom` in this environment.

## 2026-11-20 · Closed Cast dialogue packets (1.0.21)

- Added `<swarm-cast=Member-expression><font color="#HEX">"Dialogue."</font></swarm-cast>` as the canonical generated model and Studio copy format; plain quoted dialogue inside is supported too.
- The live source planner uses an explicit closing boundary and no longer borrows adjacent narration or another character's quotation for new packets. Both delimiters are removed from native message prose when present.
- Legacy opening-only tags remain readable; escaped packets and multiple speakers in the same response are supported. Prevented a duplicate native quotation elsewhere in the paragraph from being incorrectly consumed when the opening tag is sanitized.
- Preserved Shadow DOM isolation, authored dialogue colors, stable image slots, quick picker, crop settings, and no scroll-triggered DOM writes. Added permanent Node and Chromium envelope regressions.

## 2026-11-20 · Cast Wardrobe quick crop and theme integration (1.0.19)

- Reworked chat’s right-click Cast picker into **Looks** and **Crop** tabs. Looks retains the existing composition filters and search; Crop provides a compact artwork well, per-expression preview selection, shared-crop toggle, X/Y/zoom sliders, direct dragging, and reset.
- Made the floating picker follow Lumiverse’s current surface, text, border, muted and accent tokens, with neutrally mixed fields rather than fixed dark-purple control colors. Reposition the menu on tab changes to prevent viewport-edge overflow on mobile.
- Added `set_cast_crop`, a validated and clamped member-specific server operation that loads the latest saved library rather than overwriting it with an outdated chat snapshot. Crop saves are serialized; intermediate drag frames never write to backend or reassign the preview image source.
- Used the same saved member crop schema as Studio’s workshop, retained source-authored dialogue colors, and left the live Cast source-packet rendering and no-scroll-repaint lifecycle untouched.
- Added Chromium dark/light/mobile, drag/persistence, multi-member isolation and quick-picker navigation regression coverage plus a source contract. Existing R4, R6, and R7 browser regressions remain green.

## 2026-11-20 · Cast Wardrobe silhouette polish and in-picker crop (1.0.18)

- Refined Shonen Burst, Tarot Arch, VN Standee, Manga SFX, Persona Angular, Fighter Banner and Anime OVA to respect bounded Cast mounts instead of their original full-page proportions. Restored visible character-to-caption relationships without clipping narration.
- Differentiated Neon Horizon's luminous floor grid from Open Horizon's minimal hairline composition; fixed the Tarot arch's misleading hardcoded title and removed story-specific editorial attributions.
- Kept approved Chapter Tab, Moonlit Halo and Polaroid Side Note intact. Regenerate contributed CSS with `python scripts/build-cast-presets.py`; geometry adjustments modify canonical generated rules instead of layering overrides.
- Cast's composition picker now inherits Studio palette tokens, including its modal backdrop and gallery backgrounds, and has a per-member crop workshop with draggable preview, enable toggle and X/Y/zoom controls.
- Crop updates flow through existing Cast persistence, without rewriting authored message text or touching the live rendering reconciler. Added Chromium tests for crop saving, theme changes, mobile/long quotes, and the old no-scroll-write lifecycle.

## 2026-11-20 · Cast Wardrobe quick switch and contrast (1.0.17)

- Right-click a live Cast expression to open a compact, composition-filtered picker. Updates only that member's saved presentation, preserves source messages, and closes on Escape/outside click.
- Make gallery previews scale complete 560px renderings uniformly into thumbnail frames, preserving portrait-to-caption proportions.
- Blend decorative accents with neutral mauve-gray via `color-mix()` while keeping authored dialogue colors unchanged.
- Make VN Hero's nameplate use Lumiverse surface and text theme variables for dark/light readability, with a single canonical generated CSS rule.
- Add targeted Chromium contrast and picker persistence checks plus a contract regression. Retain the R4 no-scroll-DOM-writes behavior.

## 2026-11-20 · Cast Presentation Wardrobe (1.0.16)

- Replaced the three-style inline selector with a composition-grouped, live-thumbnail preset modal in Cast → Member → Presentation, including member overrides, cast defaults, and existing crop controls.
- Added 34 source-preserved named presentations (3 approved Atelier references, 9 Basics layouts, and 22 Vault layouts), all saved through the existing Cast library schema without changing authored `<swarm-cast=...>` packets.
- Kept the approved Chapter Tab and unboxed Polaroid components from Atelier #3, the richer Moonlit atmosphere from Atelier #5, and their exact composition markup. The submitted HTML sources and a reproducible extraction script are included.
- Scoped contributed styles to Cast mounts, maintained one image plus one dialogue slot per preset, retained authored dialogue color and native HTML formatting, and protected the scroll/edit/sanitize behavior established by R4.
- Added multi-width, extra-long-dialogue Chromium layout checks, modal filter/persistence tests, catalog contract tests, and named-preset live lifecycle checks. Legacy Story / Sticker / Portrait rendering remains unchanged.

## Cast · scroll stability, handoff observer and font-color recovery (2026-11-20)

- Scrolling schedules at most one lightweight virtualized-bubble discovery per animation frame. It never reloads message roles or dirties settled Cast mounts on its own.
- Only changed role/source projections dirty affected message views; editor visibility transitions and relevant native DOM mutations still reconcile, while toolbar hover/style churn is ignored.
- Retarget the live mutation observer to the final message element after streaming handoff. Subsequent host commits update captions without a swipe or explicit edit event.
- Avoid copying inherited default text color into cloned dialogue fragments. When the host retains words but strips a `<font color>` wrapper, recover authored color from the saved packet.
- Keep fallback paint-check recovery, source-backed sanitizer handling, editor isolation, source-aware positioning and native prose preservation intact.
- Added permanent Node Playwright regressions for multi-colored Cast packets, stripped native font markup, scroll/layout stability and post-handoff mutations; Python Chromium harness verifies the built runtime without external network access.

## Cast · edit-mode isolation and source-aware placement (2026-11-20)

- Suspend expression mounts while the host response editor is visible; restore them after cancel/save. Observe the verified message owner when the editor is a sibling of the rendered body.
- Match surviving narrative against the saved packet's approximate source offset, not the first identical substring. This keeps expressions between the correct paragraphs when long prose contains repeated words.
- Mount standalone expressions between host paragraph blocks without moving native paragraph text into a caption wrapper.
- Added browser regressions for repeated prose, editing and reopening, whitespace variants, saved tag removal, sibling editor containers and duplicate prevention.

## Cast · sanitizer residue and source continuity (2026-11-20)

- Keep source-backed Cast expressions mounted when HTML commits leave zero-width sentinels, thought-summary text or other non-anchorable residue instead of an empty message body.
- Recover the last complete tagged packet when public message projections temporarily expose sanitized content; invalidate the cached packet on an actual message edit or swipe.
- Recognize HTML-escaped Cast tags in intermediate projections. Added live browser regressions for all spacing variants, residue, stale projections and editing away an expression.

## Cast · source-backed dialogue recovery (2026-11-20)

- Recover a Cast caption from the saved assistant packet when Lumiverse's final HTML sanitizer removes the native quote, while copying styled native dialogue whenever it still exists.
- Fall back to source-authored font color on sanitized replies. Mount tag-only messages into their message body when no text nodes survive, and anchor multi-paragraph replies by surviving prose after the missing quote.
- Preserve the existing paint check before consuming native dialogue, preventing duplicate or missing native prose.
- Preview now consumes safe `<font color>`-wrapped quotes as well as plain quotes. Regression coverage includes whitespace variants, stripped final DOM, and long narrative blocks.

## Cast · dialogue visibility repair (2026-11-19)

- Copy computed text appearance without inheriting host layout, animation or visibility classes.
- Hide native dialogue only after its complete replacement is mounted and painted; preserve the original when a caption cannot be displayed.
- Repair externally cleared captions even when their cached source signature is unchanged.
- Added visible-text and text-box regressions for Story card, Sticker and Portrait, including conditional host classes and hidden-caption recovery.

## Cast · stable streaming/final display and authored dialogue (2026-11-19)

- Reconciled stable expression slots instead of removing and recreating images on each bubble mutation.
- Added the public final message-body mount hook and source-based placement after unknown tag text is sanitized away. Streaming-to-final bubble handoff preserves image identity.
- Preserved processed font colors, inline emphasis and styling classes, including braille-separated source and normal-space direct edits.
- Added regression checks for repeated native HTML commits, delayed final mounting, authored colors, image identity, tag-only replies and previous-line dialogue.

## Cast · live presentation and shared editor integration (2026-11-19)

- Reused the shared searchable Output Library picker for Cast references, with upload and correct native-dialog visibility/focus restoration.
- Added independent character/expression-group imports, saved folder or unbound generation identities, and all saved expression previews.
- Kept the full V6 expression and preset editors; Cast’s last expression stage saves locally to its member, while character folders retain Lumiverse export.
- Added member-wide square crop framing, reduced desktop margins, and aligned the presentation chevron.
- Kept narrative tags as editable source and rendered expressions during streaming, manual display, and live presentation changes. Portraits are separate image/dialogue blocks with inherited chat font/color. Earlier generated Cast spans recover to tags with assistant/swipe/source checks.
- Added Chromium coverage for imports, upload, crop persistence, streaming placeholders, split dialogue, presentation swaps, mobile layout, and teardown.

## V6 · Expression direction editor contained within portrait cards

- Card direction edit panel rises over the lower portrait instead of increasing the card height or shifting sibling rows.
- The card maintains its original image/details/action footprint, with Studio-token colors and single authored CSS rules.
- Exact textarea drafts, restore, bank saves, keyboard shortcuts, Save and Cancel remain unchanged.
- Narrow cards show **Redo** instead of **Regenerate**, retaining an accessible full action name.

## Expression Studio V5 inline direction editing (2026-11-19)

- Removed the direction-editing side drawer and inspector edit shortcut. The active gallery card now contains a textarea plus Save to bank / Restore controls, while its usual Edit / Render buttons temporarily become Save / Cancel.
- Edits and default restores stay in a draft until Save; Cancel/Escape discards them. The account-backed expression bank remains independent, with uniquely named variants for built-in names to preserve canonical defaults.
- Kept the centered five-column portrait gallery, full-size inspector, responsive two-column mobile layout, Studio theme tokens, and original Swarm generation/backend contracts intact.
- Added inline editing regression coverage and Chromium mobile/desktop interaction checks. Rebuilt the frontend bundle.

## Expressions, image editing, and Studio polish (2026-11-17)

- **Character Expressions** — Generate with Basics, Full Spread, or reusable custom slots. Set canvas size, sampling, and shared prompts. Pick references and saved renders visually. Use IPAdapter PLUS on Illustrious or Anima Ref Adapter on Anima when configured.
- **Finish expression sets** — Track each tile's live preview and progress. Select or clear all, stop a batch, or retry just the failures. Enhance at 2×, 3×, or 4× with a model, or use your workflow. Remove backgrounds with built-in BiRefNet or your own workflow, then send the set to Lumiverse. Draft cleanup is optional.
- **Edit images in place** — Inpaint with brush, eraser, lasso, zoom, and feathering. See brush size under the cursor and review variants without leaving the editor. Inline images, including URL-only images, get a themed action menu for inpainting and swapping from the library. AI Upscale can finalize inline drafts.
- **Studio and library** — Mobile Studio opens fullscreen with compact controls and a sticky Generate action. Tune starts with Canvas & Size and Sampling & Quality open. The Output Library and pickers share a preview toggle beside Search for square, landscape, and portrait views.
- **Floating toolkit** — Compact, themed controls, a draggable portrait, and separate Quick Create and Artwork preview panels. Drag Quick Create to either side of the strip. Render settings stay in Quick Create.
- **Reliability** — Duplicate inline requests are deduplicated, and Braille spaces are normalized so SwarmUI can read affected prompts.

## v28 — Inline request idempotency and Gem Braille-space normalization (2026-11-14)

- Normalize U+2800 Braille-pattern blanks into regular U+0020 spaces in **both positive and negative** prompts before SwarmUI generation. The shared sink covers native streaming, legacy fallback, inline tags, retries, and other image jobs without changing saved authored prompt text.
- Normalize Gem/model-authored inline request text **before passing it to the parser model**, then normalize the parser response before parsing XML-like tags. The original chat message and source tag are retained for exact matching and safe image attachment. Stored tagged-job prompts use normalized spacing for later retries.
- Guard duplicate in-flight and completed frontend generation deliveries by user-scoped client job ID, serialize identical inline-tag callbacks to avoid concurrent job creation, and prevent replays of `GENERATION_ENDED` from re-invoking the text parser for the same message/swipe/request body. Explicit new job IDs and dedicated Retry/Regenerate remain supported.
- Added backend regression fixtures covering simulated streaming and legacy provider calls, **both prompt fields**, a Braille-spaced parser request/response, a late parser lifecycle replay, an in-flight/completed duplicate job, and simultaneous inline requests. Rebuilt `dist/backend.js`; frontend visuals and orb/toolkit styling were not changed.

## v27 — Floating toolkit refinement (2026-11-14)

- Kept the original satin Locket and its four-action right-click/long-press context menu unchanged. The full **toolkit strip** has its own refreshed `⋯` menu: Quick Create, AI Upscale latest (when an output exists), Recent Images, Pin/Unpin, Reset Floating Panels, and Collapse to Orb. The menu opens upward near the viewport edge so it never blocks its own toggle button.
- Added a small pin beside the Locket so the toolkit can remain expanded, independent of the orb click behavior. Stored the pin state with the existing widget preference.
- Replaced Quick Create's redundant `⋯` with a compact in-place Render Settings screen: aspect ratio, width, height, sampler, steps, CFG scale, and seed. Settings override the next generation request through the existing SwarmUI image-gen provider; they do not rewrite the saved Studio recipe.
- Quick Create can now be dragged by its dedicated header grip, with viewport clamping, position persistence, and reset. The full Studio action uses a legible, stroke-based SVG rather than a filled glyph hidden by the rail's CSS.
- Preview's Quick Create action opens the composer without closing the preview, including on mobile. Aligned Preview header actions in one consistent control row, and kept the easel independent of Studio's generation lifecycle.
- Added v27 source and Chromium tests, including real request-payload inspection with mocked SwarmUI (1344×768, 34 steps, CFG 5.5, Euler sampler, seed 2468) and AI Upscale workbench routing. Updated the earlier v21 menu regression to distinguish the orb and strip. Rebuilt the checked-in frontend runtime.

## v26 — Studio auto-finalize and floating toolkit (2026-11-14)

- Preserved the existing satin Locket and its context menu. Expanding it now shows Quick Create, Full Studio, independent Preview, Recent Images (the real Output Library), Append, and More.
- Quick Create opens as a separate, slender panel beside the always-visible toolkit. Prompt editing, negative disclosure, metadata labels, generate/interrupt, and draft inheritance use the existing generation contract.
- Added optional draggable/resizable artwork easel. Its contained stage displays actual SwarmUI preview frames and completed outputs from the same activity snapshot as Studio and the Locket, without simulated progress or additional image jobs.
- Portal surfaces leave the native float hitbox unchanged, inherit Lumiverse theme tokens, clamp to mobile viewports, clean up on teardown, and remember easel dimensions and position. Quick Create temporarily hides Preview on narrow mobile screens to prevent overlap.
- Updated older rail and Quick Create height assertions; added dedicated source and Chromium regressions for gallery/editor actions, independent preview, resizing, draft preservation, and mock generation sync. Rebuilt `dist/frontend.js`.

- Added a Studio behavior toggle to auto-finalize inline chat images with the remembered AI upscale recipe
- Inline finalize automation now swaps low-resolution chat drafts to the saved AI-enhanced result when a valid upscaler/workflow is configured
- Settings copy now makes it explicit that automatic finalization will not silently fall back to interpolation

## v25 — Model-based AI upscaler and custom workflow workbench (2026-11-14)

- Replaced the inspector's simple 2× Lanczos button with a responsive AI Upscale workbench: real installed-model discovery, preferred anime upscale model, 2× / 3× / 4× output, and a proper status/footer with recoverable errors.
- Added a genuine Comfy super-resolution pipeline (`UpscaleModelLoader` and `ImageUpscaleWithModel`) before an exact-size final resize. A missing model produces an actionable error; Studio never disguises interpolation as AI enhancement.
- Added **saved SwarmUI workflows**, with an explicitly selected exposed image input, and **importable ComfyUI API JSON graphs**, with strict single-image-input / output validation and source injection. Generation still goes through the existing Lumiverse provider.
- Remembers upscale preferences separately for each SwarmUI connection; preserves original images, stores a derivative with workflow metadata, and respects existing Output Library organization. Corrected metadata handling for arbitrary-dimension custom workflows.
- Existing inline chat image Finalize reuses a saved upscale recipe, while preserving legacy Lanczos only for users who have not configured one. Includes size/permission guards and no checkpoint auto-download.
- Added model/custom/saved backend mock contracts, v25 source contract, and real Chromium flows at 390px/1440px, including error-state recovery. Complete compiled runtime and setup instructions included.

## v24 — Persona / character crop editor (2026-11-14)

- Rebuilt the legacy unstyled square-crop dialog as a centered canvas-first native modal with a live square preview, title, crop settings, zoom/position readouts, reset, close/cancel controls, and pinned footer.
- Fixed the underlying theme inheritance: mount native crop and folder confirmation dialogs inside the Studio shell instead of outside it, so Lumiverse palette tokens and button styles resolve in the dialog top layer. Added one canonical, responsive stylesheet section rather than appended override layers.
- Preserved original + cropped avatar upload fields, drag, keyboard slider controls, focus restoration, Escape cancellation, and existing character/persona permission checks.
- Clarified that the current 2× upscaler performs a ComfyUI Lanczos resample, not an AI upscaler; no upscaler model is required, although SwarmUI Comfy workflow support is.
- Added v24 source contract and a real Chromium regression for both 390px and 1440px, exercising the actual persona action with a mocked Lumiverse avatar endpoint and a bundled raster fixture.

## v23 — Image inspector and inpaint workbench (2026-11-14)

- Replaced the old inspector's permanently stacked buttons and collapsible metadata cards with an artwork-first lightbox, a structured metadata sidebar, and separate Overview / Prompt / Details tabs.
- Preserved the real Studio actions for editing, reuse, image-to-image initialization, upscaling, downloads, favorites, Output Library, deletion, chat, gallery, and avatar assignment. The "Send image to…" menu uses the existing permission-aware action handlers.
- Rebuilt the inpaint screen around the existing paint canvas: vertical brush/erase/lasso/undo/clear/pan/mask-visibility rail, floating zoom bar, scrollable generation controls and an always-accessible footer. Source-mask encoding, submission, cancellation and preview comparison are unchanged.
- Open an edit with the recorded rendered prompt when available; empty optional inspector metadata stays hidden instead of creating placeholder cards. The brush readout now shows the actual stroke width in pixels.
- Replaced the component CSS in its original authored section and removed obsolete inspector disclosure selectors (no additional CSS override layer). Preserved CRLF in edited TypeScript source.
- Added a source contract and real Chromium mobile/desktop inpaint regression using a minimally viable raster mock for the existing Studio host harness. Full frontend rebuild included.

## v22 — Satin Locket finish (2026-11-14)

- Replaced the idle Orb's heavy metallic gradient/halo with one subtle, thin theme-aware satin rim, matching the understated Action Rail.
- Kept the lower-right sparkle badge with a gentler matte finish and preserved the approved Locket → Rail → Composer interactions.
- During generation only, the existing progress percentage drives a thin ring; indeterminate generation rotates only the ring, respecting reduced-motion preferences.
- Added a compiled-UI Chromium regression for idle/running visuals, mobile opt-in, menu, and Composer, plus a source contract. No backend, metadata or saved content changes.

## v21 — Quick Create Composer polish (2026-11-14)

- Negative disclosure now truly resizes the native floating Composer (520px expanded / 390px collapsed in normal-height viewports), preserving drafts and footer access.
- Quick Create subtitle uses the existing image-gen metadata model label, falling back to the connection name rather than showing a raw `.safetensors` filename.
- The rail / Composer `⋯` toggles the shared context menu closed as well as open. See `LIVE_CHECK_V21.md` for tests and limitations.

## v20 — Fully stacked desktop Quick Create rail (2026-11-14)

- Corrected v19's interpretation of “vertical”: the portrait is now ABOVE Compose, Append and ⋯, not beside the buttons.
- Reduced desktop footprint to 66 × 220px and restored the subtle separator between Compose and secondary actions.
- Kept the mobile horizontal rail at 183 × 64px, the lower-right Locket, composer, prompt drafts and context-menu behavior unchanged.
- Updated the source and browser rail contracts, and captured real compiled desktop/mobile previews. See `LIVE_CHECK_V20.md`.

## v19 — Compact responsive Quick Create rail (2026-11-14)

- Restored the desktop vertical tool strip next to the Locket portrait, eliminating the old 244px horizontal capsule's unused width.
- Kept mobile's horizontal rail, now sized to its visible controls; preserved composer, right-click/⋯ menu, drafts, and widget behavior.
- Added desktop/mobile regression coverage, validated with Chromium at 320–1440px and body zoom. See `LIVE_CHECK_V19.md`.

## v18 — Locket / rail / menu contract correction (2026-11-14)

- Restored the approved Orb → horizontal Action Rail → artwork-first Composer and lower-right Satellite Locket, keeping generation handlers and prompts intact.
- Repaired orb right-click / long-press and Quick Create ⋯ menus: missing scoped CSS variable invalidated menu positioning; numeric viewport bounds and a single shared menu now work under host zoom.
- Added browser/source regressions for menu actions, portrait fallback, collapse flow, mobile, and drafts. See `LIVE_CHECK_V18.md`.

## v17 — Locket Quick Create & Character Lookbook (2026-11-14)

- Rebuilt Quick Create around the approved **lower-right Satellite Locket → Action Rail → Composer** sequence, including a detached sparkle badge and theme-aware frame.
- Kept generation, interruption, appending, inherited Studio recipes, edit-in-Lumiverse actions, right-click/long-press menu, and mobile opt-in connected to their existing handlers. With opt-in disabled, tapping the mobile orb opens Studio.
- Fixed unsaved prompt overwrites when minimizing and reopening Quick Create.
- Replaced the Character Visuals modal form layout with a persistent **Base Identity / Named Looks** navigation rail and a focused editor; mobile uses a horizontally scrollable navigation strip.
- Kept identity prompts, render recipes, checkpoint/LoRA stack inheritance, look activation, and backend saving on their original data contracts.
- Added source and Chromium integration regression tests for mobile bounds, data binding, navigation and Quick Create draft preservation. No stored outputs or folder data was migrated.

# Changelog

## v10 Output Library restoration

- Rebuilt the Output Library's missing folder-preview, collage, thumbnail, selection and character-visual styles in the original Studio stylesheet, using the earlier working library as a behavior reference and v9 theme tokens for appearance.
- Restored bounded 2×2 folder collages, square image thumbnails, paginated scrolling, visible selection/favorite decorations, and responsive mobile grids without changing any persisted image or folder records.
- Reset the thumbnail grid to the first row after changing pages.
- Added an offline Chromium regression fixture with 1,435 simulated outputs, character folders, Favorites, pagination, selection, and mobile viewports.


## v9 theme contract repair

- Made Accent control the real Studio highlight/focus/selection token and accurately sample Lumiverse inheritance.
- Made Buttons also cover Generate, Save, Add and other primary actions while preserving distinct Accent and Button colors.
- Removed stale lavender declarations and a conflicting accent reset in place; primary/button text now adapts to bright/dark swatch choices.
- Added Chromium color-contract tests and preserved the separate Output Library workstream.

## v8 theme swatches and inline image size

- Replaced the surface-mode dropdown with an inherited Surface color swatch, made all color pickers circular, and removed nonfunctional surface-opacity controls.
- Restored three side-by-side image-size choices and preserved the existing profile, color override, and reset workflow.
- Updated browser coverage at narrow widths and refreshed CSS color sampling.


## v7 visual polish

- Made Ink/Neutral surface treatments affect controls and raised cards, with separate persisted Cards and Inputs colors.
- Clipped Tune disclosure highlights to their rounded borders and repaired stroke-only SVGs across the folder and stack actions.
- Used stack-width container queries for two-row preset controls and a proper 2×2 share-action grid.
- Fixed the LoRA metadata viewer to render its terms **and** values, and extended browser regression coverage.


## 1.0.16

### Added

- Generation protocol settings now include an explicit Anima/Illustrious
  prompt-family switch with family-specific subject serialization and matching
  copyable examples.
- Tagged prompts can use an internal scene-plan shape that binds character and
  persona identity text to visually anchored subject sections.
- Multi-subject scene plans now compile to deterministic, overlapping native
  SwarmUI regions with subject-local conditioning and a background region.
  Illustrious uses full regional strength; Anima uses a conservative
  experimental strength. Single-subject and ordinary POV scenes remain on the
  standard serializer.
- Named Character Looks inherit the existing visual identity and add outfit,
  negative, checkpoint, LoRA, reference, thumbnail, trigger, and note layers.
  Inline requests can select a Look explicitly or infer it from saved aliases.
- A native Character editor Visuals tab integrates with Lumiverse's PR #268
  character surface; Visual Lore now shares the main Visuals page instead of
  claiming a second drawer tab.
- Activated lore entries can persist visual identities for characters,
  locations, objects, creatures, outfits, and styles and merge those layers
  into tagged generation.
- Output Library now opens on folder preview cards and exposes character canon
  through a focused Prompts & visuals modal inside each bound folder.
- Output Library landing cards and opened-folder contents now use isolated,
  mutually exclusive surfaces, with folder controls above the image grid and a
  responsive sibling modal for base prompts and named Looks.
- The Library visual modal can create and fully edit character Looks in place,
  and its folder-toolbar icons share a consistent horizontal baseline.
- Visuals now has Character, Persona, and Lore tabs. Lore loads lazily after the
  backend listener exists, renders loading/permission/error shells, and puts
  entries activated in the current chat first.
- Character Look and Visual Lore reference images now resolve into the same
  bounded reference-conditioning payload used by Studio img2img, with a 0.60
  creativity default and graceful text-to-image fallback when resolution fails.

### Changed

- Multi-character guidance now enforces exact visible counts, spatial subject
  anchors, one-fact/one-owner rules, and separate shared interaction, camera,
  and environment layers. A character card is treated as an identity source
  that can resolve to multiple visible NPC subjects rather than a fixed count
  of one. POV guidance now distinguishes an invisible persona/viewer from
  `character="none"` scenery semantics.
- Illustration fallback cards use a compact horizontal strip so Generate,
  Retry, and Attach actions remain visible in narrow chat placeholders.
- Inspector reuse and init-image actions resolve exact embedded generation
  metadata using the verified Swarm output path before applying parameters.

### Fixed

- Programmatic LoRA-stack changes now resync Studio's saved generation profile.
  Character visual hydration, saved-stack loading, imports, clear-stack, and
  reused generation details can no longer leave the backend profile carrying a
  stale LoRA list that gets merged with the freshly resolved character stack.

## 1.0.15

### Added

- The parser-model override now offers connection-aware model suggestions. Studio
  asks the selected Lumiverse text connection for its model list when that host
  capability is available, then falls back to the connection's active model and
  cached model metadata without inventing provider-specific entries. Free-form
  overrides remain supported.
- Extension backend failures now print a scoped message, details, and stack trace
  through Lumiverse's terminal logger, with `console.error` as a fallback. Browser
  errors continue to surface normally.
- Outputs can now be starred from the current-output stage and the full-size
  inspector. Starred generations appear in a permanent **Favorites** collection
  while retaining their ordinary or character-folder membership.
- Library selection mode now supports **Non-starred only**, so **Select page** can
  safely target disposable outputs without selecting favorites.
- Bulk-selected outputs can be favorited or unfavorited in one action. Moving
  outputs to **Favorites** also stars them automatically.

### Changed

- Favorites behaves as a protected label-like collection rather than an exclusive
  destination: starring never removes an output from its existing folder, and
  the Favorites collection itself cannot be deleted.

## 1.0.14

### Added

- Studio settings now have a dedicated **Generation** tab for inline-image
  behavior, composition, image-count requirements, and the editable protocol
  prompt.
- Image requests can use either the existing one-pass **Inline protocol** or a
  new two-stage **Parser model** flow. Parser mode lets the chat model place a
  lightweight visual request in its reply, then expands that request in place
  through a selected Lumiverse text connection before SwarmUI generation.
- Parser mode hydrates Lumiverse's saved text connections, follows its default
  connection when no explicit choice is stored, and accepts an optional
  per-parser model override without changing the model used by the active chat.
- Parser failures are reported to both the browser console and Studio's normal
  backend error channel instead of leaving a silent unfinished request.

### Changed

- The `{{swarm_image_protocol}}` macro and automatic prompt injection now switch
  between the complete inline protocol and the compact parser-placement
  protocol according to the selected Generation mode.
- Swarm Studio requests Lumiverse's **Generation** permission only for parser
  connection discovery, generation lifecycle handling, and quiet parser calls.
  Existing inline-protocol behavior remains the default.

## 1.0.13

### Added

- Finished in-chat illustrations now offer **Remove from chat (keeps Library
  copy)** in their image-actions menu. Removal updates the saved chat message,
  clears its inline attachment metadata and retired job state, and deliberately
  preserves the generated Lumiverse Library output.

### Fixed

- `persona="active"` no longer falls back to the active persona's full
  biographical description when no explicit Studio visual profile is bound.
  Only the positive identity prompt from an enabled, bound persona visual
  profile is submitted to SwarmUI; otherwise the persona identity layer stays
  empty.
- Live message reconciliation now accepts an empty message body, allowing an
  image-only assistant message to be cleanly removed without requiring a page
  refresh.

## 1.0.12

### Fixed

- Inline-image regeneration now tracks the stable tagged-image job ID separately
  from the fresh per-attempt generation ID used for every random-seed retry.
  Replacing an old attempt no longer leaves Studio or Quick Create waiting for a
  terminal event under the superseded ID.
- Regeneration with current Studio settings, original settings, and a prompt
  edited through Quick Create now share the same terminal ownership cleanup.
  When the final image is attached to chat, both Studio and the floating player
  retire their progress, preview, and Stop/Interrupt controls together.
- Generic generation-start events preserve an already identified tagged-image
  source instead of reclassifying the retry as a manual Studio generation.
- Concurrent inline illustrations still hand the shared preview surface to the
  next active attempt after one completes.

## 1.0.11

### Fixed

- Lumiverse's shared `IMAGE_GEN_COMPLETE` event is now an authoritative
  completion fallback for Studio and Quick Create. Because that event already
  contains the saved image ID and URL, both surfaces immediately retire their
  progress and interrupt controls and display the final output even when the
  extension-specific result message is delayed or never delivered.
- The fallback preserves normal result hydration when it arrives later and
  continues to hand off correctly between multiple queued message images.
- Settled job IDs are now remembered across Studio, Quick Create, tagged jobs,
  host progress, and interruption/error paths. Late `generation_started` or
  progress messages can no longer resurrect a completed generation's controls.

## 1.0.10

### Fixed

- Completed message illustrations now emit an explicit terminal `ready` event
  before their full result payload. Studio and Quick Create retire their progress
  UI from either terminal event, so a delayed result can no longer leave
  “Preparing generation” and “Interrupt generation” stuck over a finished image.
- Tagged generation state now tracks concurrent message illustrations separately
  from manual Studio generations. A finished job hands the preview to the next
  genuinely active tagged job, while late queued/progress messages for settled
  jobs are ignored instead of resurrecting the spinner.

## 1.0.9

### Added

- Replaced the crowded gear popover with a responsive Studio settings modal:
  desktop uses a left navigation rail, while mobile uses a horizontally scrolling
  top tab strip. General, Theme, and Metadata now have independent pages.
- The complete inline-image protocol is editable in General settings, with
  explicit save/reset controls and a collapsible macro reference. The
  `{{swarm_dynamic_guidance}}` insertion point keeps image-count, identity,
  composition, checkpoint, LoRA, and preset guidance live inside a custom
  protocol.
- Added default-off controls to strip a character-bound LoRA stack from
  persona-only requests and to automatically prepend the active character
  positive prompt. Leaving automatic character printing off lets the model
  select only the relevant concrete identity tags from multi-NPC visual blocks.
- Added centered inline-image scale controls for full, 75%, and 50% display.

### Fixed

- Chat-tagged generations now register as the active shared generation in both
  Studio and the floating Quick Create player. Swarm stream preview frames and
  step progress are therefore visible again without restoring the removed
  in-message loading strip.
- The settings layer is mounted at the Studio shell instead of inside the
  transformed header controls, preventing clipping and stacking-context bugs on
  desktop and mobile.

## 1.0.8

### Fixed

- Inline image attachment recovery now identifies a completed tag by its
  immutable tag fingerprint instead of comparing the raw scene text with the
  fully layered generation prompt.
- The backend now scans the persisted chat for the matching tag and remaps a
  transient streaming message ID to the final saved assistant message before
  mutation. Recovery no longer depends entirely on the browser observing a
  second, non-streaming render pass.
- Remapped jobs acquire their mutation lock using the final message ID, keeping
  multiple images completing in the same message serialized without one
  attachment overwriting another.
- This failure was unrelated to IPv4 or remote mobile access; the same race
  could occur locally whenever character/persona layers or preset directives
  changed the submitted prompt.

## 1.0.7

### Fixed

- Enabled Swarm prompt presets now use native `<preset:exact saved name>`
  directives inside Studio's complete composed positive prompt. This preserves
  the user's scene prompt, character/persona visual layers, inherited LoRA
  triggers, and selected preset behavior in the same Swarm request.
- Studio strips the conflicting raw `presets` override from manual generation,
  including stale overrides restored from older saved Studio state. This
  prevents Swarm from replacing the submitted prompt after Lumiverse builds the
  request.
- Existing native preset directives are detected case-insensitively and are not
  duplicated. The `{{swarm_preset}}` macro expands to the enabled directive
  list in manual generation just as it does for tagged chat illustrations.

## 1.0.6

### Fixed

- Saved Swarm presets now serialize `loras` and `loraweights` using SwarmUI's
  native comma-separated parameter format instead of JSON-array strings.
- Preset application continues to accept legacy Studio-created JSON-array
  values, allowing their LoRA contents to be recovered into the editable stack.

### Diagnostics

- Every backend `studio_error`, image-generation error event, Studio error
  status, Quick Create failure, and Chat Visuals failure now prints its complete
  message to the browser console.
- Backend request failures also print the original `Error` object and stack to
  the Lumiverse server console before the sanitized frontend error is emitted.
- Browser error logs retain the complete backend payload as an expandable
  object, avoiding truncation by compact status bars and mobile layouts.

## 1.0.5

- Restored Extension UI registration on plain-HTTP remote sessions.
- Made inline tag interception optional on older Lumiverse builds.
- Registered the core drawer before optional host integrations.
