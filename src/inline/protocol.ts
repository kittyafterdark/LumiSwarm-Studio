const ANIMA_SWARM_IMAGE_PROTOCOL_EXAMPLE = `{{swarm_image_protocol}}

Example Anima output:
<swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="Two people sharing food at a city stall"
>
quality/meta: masterpiece, best quality, newest, safe
visible count: 1boy, 1girl
scene: A young man and woman share food at a city stall.
camera: medium two-shot, eye level
left man: The man on the left has short black hair, brown eyes, and a dark jacket. The man on the left smiles, holds a paper tray, and extends a bite toward the woman on the right.
right woman: The woman on the right has long blond hair, blue eyes, and a red coat. The woman on the right leans closer with an amused expression and looks toward the man on the left.
shared interaction: sharing food
spatial relation: standing side by side
environment: city street, food stall, evening lights</swarm-image>`

const ILLUSTRIOUS_SWARM_IMAGE_PROTOCOL_EXAMPLE = `{{swarm_image_protocol}}

Example Illustrious output:
<swarm-image
  request="generate"
  slot="instagram-photo"
  aspect="4:3"
  character="active"
  persona="active"
  alt="Two people sharing food at a city stall"
>
quality/meta: masterpiece, best quality, safe
visible count: 1boy, 1girl
camera: medium two-shot, eye level
left boy: short black hair, brown eyes, dark jacket, smiling, holding paper tray, extending food toward right girl
right girl: long blond hair, blue eyes, red coat, amused, leaning closer, looking toward left boy
shared interaction: sharing food
spatial relation: standing side by side
environment: city street, food stall, evening lights</swarm-image>`

function swarmImageProtocolExample(family: "anima" | "illustrious"): string {
  return family === "illustrious"
    ? ILLUSTRIOUS_SWARM_IMAGE_PROTOCOL_EXAMPLE
    : ANIMA_SWARM_IMAGE_PROTOCOL_EXAMPLE
}

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
Never use a chat character's or persona's display name as a diffusion token. A conversational name does not teach the checkpoint appearance. character="active" selects the active character card as an available visual identity source; it does not force that source to resolve to exactly one image subject. A multi-NPC card may contribute multiple distinct visible subjects when the scene calls for them. persona="active" independently selects the bound persona identity as a visible subject source. Follow the live identity guidance below for whether those tags are copied automatically or should be selected into the tag body. A canonical character/series tag is allowed only when explicitly supplied as a trained tag.

Resolve visible subjects from the current scene before compiling the prompt. Visible-subject count equals the number of resolved people the image must render, not the number of character cards, the persona state, or the POV state. When one card contains multiple NPC definitions, copy each selected NPC's concrete appearance and attire into that NPC's own visually anchored subject section; never flatten the card's combined identity text into one global subject. Keep automatic character-prompt printing off for multi-NPC cards so the relevant identity fragments can be selected per subject.

Treat the tag body as a small visual scene plan. Establish the exact visible-person count first, then camera, visually anchored subject sections, shared interaction, spatial relation, and environment. Each subject section owns its spatial anchor, identity/distinguishing appearance, attire, expression, pose, individual action, and gaze. Prefer image-space anchors such as left, right, foreground, background, nearest the camera, or farther from the camera; planner labels such as character 1 are not useful final diffusion phrasing.

Swarm Studio compiles eligible multi-subject scene plans into native SwarmUI <region:x,y,width,height,strength> conditioning with generous overlapping subject regions and a <region:background> environment. Do not invent coordinates or write <region:...> directives yourself. Keep shared interaction, camera, and spatial relationships in their dedicated global fields; subject-local appearance and action stay in each anchored subject field. Single-subject and ordinary POV plans remain unregionalized.

Every visible fact has exactly one owner. Subject-specific appearance, clothing, expression, pose, action, and gaze belong only to that subject. Physical contact or an action jointly performed by multiple visible subjects belongs only to shared interaction. Camera/framing facts belong only to camera. Lighting, location, furniture, weather, and background facts belong only to environment. Do not repeat one fact across sections. Keep a one-actor action on its actor and identify the recipient spatially; put a jointly performed action once in shared interaction.

persona="none" means the active persona is not visibly rendered or identity-conditioned. It does not prohibit an implied first-person observer/camera. When character="active" and persona="none", a POV scene normally contains one visible focal character; the viewer/camera is a reference point, not a second character slot. Express a focal subject's relation as looking at viewer, eye contact, leaning toward viewer, or reaching toward viewer. Do not render the viewer's face or full body unless explicitly requested; a scene-required first-person hand or arm does not add a second visible person.

character="none" means the active chat character must not be visible. Do not use character="none" merely because the scene is first-person or POV. To show the active character from the user's POV, use character="active" persona="none". When both are none, Swarm Studio keeps its scenery/no-character negative guard. Use persona="active" only when the active persona is visibly rendered. Normalize an unseen third party to looking off-screen or a direction-specific gaze instead of asking the checkpoint to render another character.

Do not emit contradictory counts such as solo with 2girls. Do not use BREAK, XML-like pseudo-scoping, or bracketed character identifiers as semantic separators. The current Studio negative prompt is applied automatically. Native SwarmUI preset syntax is <preset:exact saved preset name>; preserve it exactly. Supported aspects are 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, and 16:9. Default inline prose illustrations to 4:3 (or 3:4 for a materially better portrait); reserve phone/widescreen ratios for matching media layouts. Do not put Markdown fences around the tag.

{{swarm_dynamic_guidance}}`
