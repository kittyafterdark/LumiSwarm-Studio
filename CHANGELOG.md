# Changelog

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
