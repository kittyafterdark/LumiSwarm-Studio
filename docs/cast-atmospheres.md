# Cast Atmospheres (alpha.11)

Open a Cast album, then **Backgrounds → Atmospheres**. Choose a saved location to preview with the current member (or another member with expression artwork). The palette selector is a preview, not an album default. Enable atmospheres and save to expose the optional key to the Cast protocol.

```xml
<swarm-cast=shoto-neutral wardrobe=default background=katsuki-kitchen atmosphere=moonlight>"Come inside."</swarm-cast>
```

Supported keys: `none`, `dawn`, `golden-hour`, `moonlight`, `overcast`, `rose`, `dream`, `memory`, `tension`, `custom`. Unknown syntactically safe keys degrade to the original look. An omitted key or `none` leaves the card untouched; the model repeats an atmosphere key for each subsequent relevant card. No global mutable scene state is introduced. The protocol remains compatible with wardrobe, Genesis and generated backgrounds. Code blocks are not interpreted as packets.

## Art direction

Each palette resolves two transparent CSS gradients, a dedicated scenery filter (brightness, contrast and saturation), and a separate mild expression-art filter (brightness, saturation, sepia, hue and contrast). The scene lighting slider scales both the grade and the wash; the expression lighting slider independently adjusts the actor contribution. The grade never filters the enclosing stage or dialogue. The custom palette allows two user-selected hex colors for its scene wash; its actor filter is a neutral subdued preset, not arbitrary color replacement. Scene lighting intensity and expression lighting are independent percentages; the actor contribution is also scaled by the wash intensity. Original files are never modified. At intensity zero all atmosphere styles are removed. At expression lighting zero the actor receives identity filter values (the comic template retains its original monochrome treatment).

Only the eight background-stage presentations are styled, including their framed, filmstrip and comic variants. Existing decorative frames and speech typography keep their original styles. An explicit `background=none` can still receive a wash over the neutral stage. This is artistic color grading, not physical relighting or a new time-of-day image.

Both motion toggles default off. Transitions ease actor-filter changes (and initial mount in browsers supporting `@starting-style`). Animations add a single 220 ms actor reveal, with no repeated animation or per-frame scripting. `prefers-reduced-motion` disables both additions. Existing template-specific effects are not changed. No rain particles, animated noise, fullscreen effects or Theater in this release.

## Ownership and storage

The album stores an optional validated settings object (`enabled`, `intensity`, `actor`, `transitions`, `animations`, `colorA`, `colorB`). Untagged messages are unchanged; editing a saved album palette or its strengths also updates historical cards explicitly tagged with an atmosphere. The model only supplies a recognized key, never CSS. The backend updates only this album's settings under the existing Cast library lock, protecting concurrent expression registration. These settings require no new permissions or assets.

The DOM-free `castAtmosphereVisual` helper resolves trusted palette data into bounded CSS variables; the scene adapter consumes them independently of the chosen background image and character identity. This can be reused by another renderer in the future without moving chat-specific code into the compositor.

## Validation

Build and typecheck; `tests/cast-atmospheres-contract.mjs`; the existing backend contract with targeted settings mutation regression; `tests/cast-atmospheres-browser.py` runs the real compiled workspace and shadow-DOM hydration with a mocked scoped backend. The browser tests exercise preview changes, preservation of authored dialogue color, optional motion/reduced motion, settings save/reopen, mobile preview layout, and unchanged authored content. Live Lumiverse host integration is still a separate validation step.
