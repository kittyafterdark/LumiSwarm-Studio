# Auto authoring and Anima composition (1.1.0-alpha.8.1)

## Two resolution points

Auto previously selected the concrete dialect at dispatch but intentionally gave the author model-neutral instructions. Since the serializer is not a full translation engine, this deprived a recognized Anima checkpoint of its tag vocabulary and count guidance.

The inline protocol, expanded macro and parser completion now resolve the known checkpoint with the same `resolveEffectiveCompiler` provider metadata cache used at dispatch. The known render recipe includes the Studio profile, provider/default checkpoint, named render style, enabled character binding, and active/default or explicitly requested look. Parser mode resolves character inclusion and explicit look per request; if several slots have different families, one sidecar call receives per-slot compiler guidance. A direct inline author cannot know a future explicit look, inferred look, or newly selected lore recipe before it authors the request. The compiler therefore resolves the actual final recipe again at dispatch. The authoring hint is not a lock.

Recognized provider architecture outranks filename recognition. Generic SDXL is not treated as proof of Illustrious. If no known dialect is available, the author receives neutral guidance, while the existing dispatch fallback to Anima is retained. Manual selection bypasses provider metadata lookup. Auto MOSS still selects Caption, not a layout mode.

New generated compiler blocks have begin/end markers; expanded protocol macros refresh that block without replacing surrounding user instructions. The previous shipped Auto guidance sentence also receives an upgrade. Custom protocols that omit the dynamic guidance macro deliberately remain custom. Parser placement instructions remain compact.

## Composition and syntax

Anima's dynamic instructions ask for explicit visible subject count tags, compact per-actor appearance tags, short action prose, unique spatial anchors and a camera framing all intended actors. Off-screen people should not be described as visible identities. The authoring example contains three separate actor headings and an exact count, rather than a generic people count. The copy-example for Auto is explicitly an Anima example, not an assertion that all Auto models use Anima.

For structured Anima plans the serializer converts explicit `2 men`/`1 woman` count categories to `2boys`/`1girl`, or derives a count from explicit man/boy/woman/girl headings when all subjects are classifiable. Ambiguous headings are not assigned genders from their names or traits. Non-Anima count formatting stays as before (the shared numeric-count validation also recognizes the word `subjects`). Flat literal name qualifiers in authored structured subject details receive the same escaping protection as saved identities. Existing escaped qualifiers, weighted groups such as `(red eyes:1.3)`, and angle-bracket directives are preserved. Raw unstructured prompts remain user-owned. Canonical franchise names are encouraged but not silently guessed or rewritten.

The compiler persists advisory composition warnings for count mismatch, a camera that explicitly prioritizes two actors when more are declared, and actors sharing a horizontal anchor. These can be intentional (e.g. depth composition); the extension does not reject the scene, delete people, force regions, or infer pixel positions. Native versus regional conditioning remains a manual choice. Diffusion-level identity bleeding is still possible even with a clean prompt.

## Regression inputs

`examples/izakaya-foreground.scene.txt` and `examples/izakaya-background.scene.txt` are reconstructed scene plans from the two user-reported final enhancement metadata records. They preserve the problematic three-person framing, overlapping side anchors and unescaped character qualifier. The exact original authored packets and draft images were unavailable, so these are not a forensic reconstruction of the base render. Tests check the real mocked provider dispatch, persisted warning diagnostics, count normalization, qualifier escaping, explicit weights, and no loss of intended subject traits. The Auto test also checks a renamed model, metadata cache, changed checkpoint after macro expansion, unknown fallback, manual override, Aesthetic guidance, and mixed per-slot parser dialects.

## Live checks

Use Auto and inspect a fresh request. The resolved authoring model should receive Anima guidance for AnimaYume. A scene of three visible people should declare `2boys, 1girl` when the headings explicitly identify them. Compare native and explicitly selected regional conditioning at the same seed with enhancement disabled before evaluating the enhancer. Keep the original drafts for the comparison. The existing Genesis operator-scoping error was not changed without an installed SDK contract for `generate.quiet`.
