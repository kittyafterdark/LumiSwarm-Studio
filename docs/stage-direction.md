# Stage Direction (Alpha.17.9)

## Enable it

Open Studio settings → Stage Direction. Select Global, This Cast or This chat. Choose Automatic, enable the desired capabilities, choose a frequency, then Save. Settings inherit in the order chat → Cast → global; Use inherited settings removes a scoped override. Unsaved changes are discarded when switching scope. Injection starts disabled to preserve existing configurations. Before history / System is the default for automatic injection. The change applies on the next generation. Theater's manual controls remain usable without injection.

- Scenery: use exact location keys from the active Cast's saved backgrounds, even for narration or graphic cards. Shared Background Assets remain available through the manual Theater scenery picker.
- Lighting: set the scene-level time of day or mood. Omitted lighting retains the previous treatment; a new scene or an explicit `none` resets it.
- Atmosphere: persistent weather/particles. For story cues to appear, Theater's Atmosphere direction mode must permit cues rather than manual-only effects.
- Stage FX: one-shot effects; still respects Theater's one-shot and reduced-motion settings.
- Generate missing backgrounds: opt-in, requires a saved active Cast. Uses the existing image generation pipeline and may consume image generations. It does not need a dialogue card or the legacy Cast injection switch.

## Cue syntax

Use standalone lines outside code, quotes, HTML and Cast packets, followed by a blank line and the relevant prose. Consecutive cues are supported. The actual location keys and mood/effect lists are included in the generated protocol.

```text
[[scene: kitchen]]
[[lighting: golden-hour]]
[[atmosphere: rain intensity=45]]

Rain whispered against the windows.

[[stage-fx: sparkles target="Shōto" intensity=65 duration=1000]]

He smiled.

[[lighting: moonlight]]

By midnight, the rain was gone.

[[atmosphere: none]]

Silence settled over the room.
```

Use the exact available lighting keys as supplied by the protocol; no custom CSS. `[[scene: none]]` clears the story background. Legacy Cast `background` and `atmosphere` attributes remain recognized; authored chat cards retain explicit packet attributes; unmarked scene cards inherit standalone scenery and lighting. Theater retains scene-level direction through narration. An explicitly directed scene is not replaced by a card's incidental background. Manual Theater scenery and mood overrides take precedence until cleared. The location catalogue is read from the active Cast. Unresolved locations show no new artwork until a matching saved background becomes available.

New locations, if enabled, use the existing request packet followed by a standalone scene cue in the same saved assistant reply. Replace `CAST-ID` with the actual Cast ID supplied in the protocol:

```text
<swarm-background=CAST-ID:rooftop>Empty rooftop at night, distant skyline, moonlight, no people.</swarm-background>
[[scene: rooftop]]

They reached the rooftop.
```

Only a complete saved assistant reply can authorize the new job. Existing request limits, permissions, replay receipts, destination ownership and job reconciliation remain in force. Existing Cast background request support is retained.

## Prompt integration and caching

Automatic placement: Before chat history, At depth (number of history messages from the end; 0 is after history), or After history. Send as System, User or Assistant. The static protocol uses enabled capabilities, frequency and the active Cast's saved catalogue, not changing scene state. An unchanged configuration/catalogue remains stable when messages are appended. Changes to configuration/catalogue may invalidate the prefix once. Other native prompt builders, lore and Cast directives may affect provider caching independently.

Macro mode suppresses automatic injection. Put the protocol where your preset requires it:

- `{{swarm_stage_protocol}}`: enabled instructions, including the location catalogue.
- `{{swarm_stage_locations}}`: saved location keys only.
- `{{swarm_stage_state}}`: current scene, lighting and weather inferred from available saved assistant history. Place late in context if using it.

The optional automatic continuity reminder is placed after history, never in the static protocol. It is disabled by default. It derives from available raw history, not manual Theater overrides or the viewport. Valid cues are hidden in regular chat and stripped from outgoing assistant history; raw saved messages retain them for replay/export. Existing prompt examples, protected markup and user text are not stripped by the history cleanup. The three macros use native context-aware expansion, and actual cache hits are provider-dependent.

## Validation

- Production frontend/backend build and strict TypeScript passed with the available compiler (not the package-pinned compiler).
- Shared Stage Direction contract and expanded full backend contract passed: scopes, stale writes, macro expansion, placement, append-prefix stability, protected markup and generation authorization, including a narration-only request.
- Compiled Stage Direction browser fixture passed at 1440, 390 and 320px: scope editing, depth/role, macro, standalone saved backgrounds, persistent mood, scene boundary reset, progressive source gate, late artwork and rewind. Uses a mocked host and saved fixture art.
- Existing mood, live playback and FX suites passed across three widths during development. Existing wardrobe and Cast atmosphere contracts passed. The complete historical suite was not rerun.

Run `npm run test:stage-direction`, `npm run test:stage-direction:ui`, and `node tests/backend-contract.mjs` after building. Live Lumiverse integration, actual Swarm background generation and provider cache-hit rates require live verification. No new permissions, dependencies or core changes.

## Alpha.17.9 live projection repair

The source scanner accepts the same braille spacing used by Cast packets, including earlier `<font>` attributes and cue padding. Consecutive literal cue lines rendered as a single Markdown paragraph with line breaks are consumed together in Theater. Ordinary chat uses the native render hook to hide cues; refresh rendered messages after reinstalling if the host still displays an earlier cached projection. Scene-compatible unmarked cards inherit the directed location and lighting. Unknown locations wait for a matching saved asset rather than substituting the default room. Explicit legacy card attributes are retained, and the underlying packet identity is unchanged. Previous turns outside the mounted window can contribute direction when their canonical recent messages are available. Unknown gaps are not guessed.

New regression: `npm run test:stage-direction:projection`. Three viewport runs passed, using compiled real Cast hydration with a staging-shaped mock SDK, including braille source, grouped cue paragraphs, pending art, swipes, virtualized history, and preserved user examples. Existing Stage Direction, mood, FX, live playback and Atelier browser regressions passed at all three widths; the mobile live runs were rerun in isolation. The full backend contract and strict TypeScript (available compiler) passed. The exact live message source was not supplied; verify against the reported chat after refreshing. Actual image generation and the full historical npm suite were not rerun.
