# Upstream references

Reviewed 2026-11-24. These are living documents; confirm the installed model/provider version before assuming compatibility.

- [Anima model card](https://huggingface.co/circlestone-labs/Anima): tags, prose, quality metadata, variants, artist syntax and datasets.
- [OpenMOSS user guide](https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md): caption/tag/layout modes and model-facing coordinate format.
- [OpenMOSS compile_prompt.py](https://github.com/OpenMOSS/MOSS-Image/blob/main/skills/moss-image-prompt-enhancer/scripts/compile_prompt.py): editable layout conversion reference.
- [Krea 2 prompting](https://github.com/krea-ai/krea-2/blob/main/docs/prompting.md) and [prompt expansion](https://github.com/krea-ai/krea-2/blob/main/docs/expansion.txt): natural-language guidance.
- [SwarmUI prompt syntax](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/docs/Features/Prompt%20Syntax.md) and [model support](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/docs/Model%20Support.md): provider-specific directives and support.

Studio's owned plan syntax, native Anima heading labels, region placement algorithm, filename detection, and identity rules are implementation choices. They are not mandatory upstream model conventions. No real model-quality benchmark is claimed by this prerelease.

## Alpha.6 transport and architecture

- [Swarm bbox converter](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/src/Text2Image/T2IBoundingBoxFormat.cs) and [prompt processing](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/src/Text2Image/T2IPromptHandling.cs): normalized object directives, final-canvas conversion; not a full native text-layout envelope.
- [Models API](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/docs/APIRoutes/ModelsAPI.md) and [model class registry](https://github.com/mcmonkeyprojects/SwarmUI/blob/master/src/Text2Image/T2IModelClassSorter.cs): DescribeModel and recognized architecture identifiers. Studio cache, fallback, and manual precedence are implementation decisions. Live installed-provider compatibility remains to be tested.
