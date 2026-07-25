# Changelog

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
