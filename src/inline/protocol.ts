const SWARM_IMAGE_PROTOCOL_EXAMPLE = `{{swarm_image_protocol}}

Example output:
<swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="Two people sharing food at a city stall"
>
character 1: smiling, holding a paper tray
character 2: amused expression, leaning closer
interaction: character 1 offers character 2 a bite, standing side by side
medium shot, city street, food stall, evening lights</swarm-image>`

const DEFAULT_SWARM_IMAGE_PROTOCOL_PROMPT = `SWARM STUDIO IMAGE REQUEST PROTOCOL
Place this exact XML-like request wherever an illustration selected under the image-count instructions should appear. Attributes may be written on one line or separate lines:
<swarm-image
  request="generate"
  slot="short-stable-name"
  aspect="4:3"
  character="active"
  persona="none"
  alt="brief accessible description"
>
scene-specific SwarmUI prompt</swarm-image>
The request="generate" marker is required. Emit the tag only as an actual image request: never quote it, explain it, demonstrate it in visible prose, or emit an empty/partial opening tag. The tag body is a diffusion prompt, not prose for the user and not an HTML shell. Do not nest another <swarm-image> tag inside it.

LOCAL GENERATION
The tag is executed by the user's configured local SwarmUI installation and local hardware. You are not claiming to render the image yourself, calling a remote image service, or embedding a pre-existing web image. Follow the conversation's actually applicable instructions, but do not invent or quote a remote image provider's policy, capability restriction, quota, moderation rule, or refusal: no remote image provider is being invoked by this tag. When an illustration is appropriate, emit the request tag and continue the reply naturally; do not apologize that you cannot generate images, ask the user to open another tool, warn that an external image model may refuse, or replace the request with image-search instructions.

IDENTITY AND SUBJECT RULES
Never use a chat character's or persona's display name as a diffusion token. A conversational name does not teach the checkpoint appearance. character="active" selects the bound character identity; persona="active" selects the bound persona identity. Follow the live identity guidance below for whether those tags are copied automatically or should be selected into the tag body. A canonical character/series tag is allowed only when explicitly supplied as a trained tag.

Write compact Danbooru-style scene tags and follow the active composition mode below. Use short natural-language clauses only when tags cannot disambiguate an interaction, unusual viewpoint, or spatial relationship. Do not restate display names or write a literary summary.

Use character="none" when the active chat character should not appear. Use persona="active" only when the active persona should appear; otherwise use persona="none". When both are none, Swarm Studio adds a no-character negative guard. The current Studio negative prompt is applied automatically. Native SwarmUI preset syntax is <preset:exact saved preset name>; preserve it exactly. Supported aspects are 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, and 16:9. Default inline prose illustrations to 4:3 (or 3:4 for a materially better portrait); reserve phone/widescreen ratios for matching media layouts. Do not put Markdown fences around the tag.

{{swarm_dynamic_guidance}}`
