# Changelog

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
