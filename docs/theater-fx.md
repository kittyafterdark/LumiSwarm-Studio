# Atmosphere & Stage FX (Alpha.15)

In Theater Atelier → Stagecraft → Atmosphere, choose a fallback effect, intensity, animation, direction source and one-shot enablement. The preview button demonstrates one-shot effects locally without modifying the story. All presentation settings retain the existing global/per-chat/named-look behavior.

## Environment vs. events

- Persistent environment: rain, snow, petals, embers, dust motes, fog, falling leaves, fireflies, wind, or off. A scene-seeded particle field has effect-specific trajectories, sizes, speeds, phase offsets and opacity. Same-scene screens reuse the field. A maximum of 72 elements per field; no JS render loop, external assets, or GPU generation.
- One-shot events: lightning, shake, sparks, impact, darkness, pulse, magic, sparkles, stress, spotlight, romance, tension. Effects expire; repeated rendering of a screen does not replay them. Navigating away and back can replay them. Romance and tension map to presentation-specific treatments. Camera shake shifts stage/scenery/actors briefly, not toolbar controls. Sparks have a falling trajectory. Lightning is a single soft pulse rather than a strobe.
- Explicit story cues take priority over inferred weather. Direction mode defaults to **Explicit story cues**. Manual/preset only ignores story cues; Cues + conservative narration adds opt-in English narration rules. A saved fallback override remains a fallback in the story-directed modes. Explicit `none` clears weather; `preset` restores the configured fallback and takes precedence over inference until another explicit cue or scene boundary.
- Automatic detection only examines narration, not Cast dialogue, CGs, HTML islands, code, or quotations. It recognizes narrow phrases (e.g. “Rain fell…”, “The rain stopped…”, “Lightning flashed…”). It is not semantic inference; ambiguous text is intentionally ignored.
- Reduced-motion settings or the local motion toggle suppress animation and one-shot effects; weather becomes a static field. One-shot effects do not cover HTML islands, CGs or generation interludes. The overlay never intercepts pointer events.

## Optional story direction syntax

Place directives in standalone paragraphs, before the story screen they should affect. Use blank lines between a cue and prose. The bracket syntax is recommended because ordinary host Markdown preserves it more reliably than unknown XML tags.

```text
[[atmosphere: rain intensity=65]]

Rain fell against the windows.

[[stage-fx: lightning intensity=45 duration=850]]

The glass briefly reflected the night sky.

[[stage-fx: sparkles target="Shōto" duration=1000]]

He smiled.

[[atmosphere: none]]

The rain stopped.
```

Environmental cue: `[[atmosphere: EFFECT intensity=0..100]]`. Allowed effects: `rain`, `snow`, `petals`, `embers`, `dust`, `fog`, `leaves`, `fireflies`, `wind`, `none`, `preset`.

One-shot cue: `[[stage-fx: EFFECT intensity=0..100 duration=250..2500 target="NAME"]]`. Optional duration is milliseconds. Target may be `stage` (default), `active` (current Cast speaker), `left`, `right`, an exact visible actor name, or stable Cast member ID. Unknown or unavailable actor targets are skipped rather than guessed. Quoted names with spaces or non-ASCII characters are supported. Up to three bursts per screen; no more than 32 pending directives. All values are allowlisted and clamped; there is no executable markup or arbitrary style insertion.

Equivalent self-closing XML (`<atmosphere effect="rain" intensity="65" />`, `<stage-fx effect="sparkles" target="active" />`) works **only if the native renderer preserves a recognizable empty element or literal text**. XML handling does not change host sanitization. The bracket form is safer for live streaming.

Cues are not separate playable screens. The next actual screen receives them. A trailing cue waits for the next captured screen, unless a capture gap invalidates it. Environmental state resets at established scene boundaries (including explicit no-scene transitions and gaps in the captured message window); a new cue on that boundary takes effect in the new scene. Rewind and swipe replacement reconstruct the state from captured frames, rather than mutating a forward-only global weather setting. A same-frame hydration refresh does not replay a burst. The current state is shown in the inspector.

## Prompt-ready optional instructions

No prompt is injected automatically. If you want the model to use explicit direction, add this to your own roleplay preset or lorebook:

```text
For Theater stage direction, emit an occasional standalone cue paragraph BEFORE the narrative paragraph, complete Cast packet, or other screen it affects. Separate cues and story content with blank lines. Use [[atmosphere: EFFECT intensity=NUMBER]] for persistent environmental changes (rain, snow, fog, wind, petals, embers, dust, leaves, fireflies, none, preset). Use [[stage-fx: EFFECT intensity=NUMBER duration=NUMBER target="NAME"]] for rare one-shot beats (lightning, shake, sparks, impact, darkness, pulse, magic, sparkles, stress, spotlight, romance, tension). Intensity is 0–100; duration is 250–2500 ms. Omit optional arguments if unnecessary. Target defaults to the stage; use active only when a speaker is present, or a known actor's exact name. Do not emit cues inside prose, dialogue packets, code blocks, or HTML islands. Do not repeat persistent effects every paragraph. Clear or replace them when conditions change. Continue the actual story normally; cues supplement the prose, never replace it.
```

## Integration boundary

Alpha.16 projects valid standalone cues to hidden data markers in the native display processor and removes them from assistant history in the outgoing prompt interceptor. Theater consumes the marker at the original boundary. Canonical saved messages and raw exports retain their directives for replay. Do not strip the cues or markers with a custom display regex: missing markers cannot be reconstructed from the rendered DOM. Host hook availability and permissions determine cleanup availability. No additional provider call or Lumiverse core patch; live host behavior needs verification.

The fixture tests the production bundle with a mock host: `npm run test:theater:fx`, optionally `THEATER_WIDTH=390`. The live fixture also exercises streamed cue completion. See [validation](theater-fx-validation.md).
