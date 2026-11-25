# Pocket visual bridge

Pocket and Studio must both include this integration. No Lumiverse core patch is required.

Studio exposes a context-aware macro interceptor for `{{swarm_visual_request::<encoded request>}}`. The request is URI-encoded JSON containing `chatId`, `characterId`, `scene`, `purpose`, and optional `includeCharacterPositive`. Pocket resolves it through `spindle.macros.resolve` with the authenticated user and matching chat context, using `commit: false`. When `includeCharacterPositive` is supplied, it overrides Studio's character-positive auto-print behavior for that request only and never mutates Studio's saved automation setting.

The version 1 response is URI-encoded JSON containing `version`, `chatId`, `characterId`, `prompt`, `negativePrompt`, `connectionId`, `model`, and `parameters`. Studio resolves the current character binding, active or scene-matched look, render style, generation recipe, reference conditioning, and LoRA stack at request time. It never copies the last workspace prompt, prompt preset tokens, or workspace LoRA selection. Bound model/recipe choices inherit Studio defaults and its current connection where unspecified.

`scene` and `character` requests include the bound character layer. `message`, `contact`, and `draft` requests exclude that layer; `persona` requests resolve the active persona layer. This keeps sticker requests from inheriting the active roleplay character's identity. The supplied scene is always fresh. The resolver validates the character against the owned chat before composing a result, and performs no generation or profile writes.

Pocket dispatches resolved requests directly to the returned image connection. Explicit request overrides remain available; cached Studio macros and native Lumiverse character visuals are not mixed into a resolved Studio request. An unavailable or mismatched bridge reports an error when Studio integration is enabled rather than falling back to cached macros.
