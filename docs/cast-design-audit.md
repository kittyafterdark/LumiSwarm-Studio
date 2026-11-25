# Cast design audit · alpha.7.4

The selected HTML references are not all identical to the earlier original Atelier screenshots. In particular, the retained scene captions had already lost several signature details. The scene redesign uses the user's original Rainbound, Memory, Afterglow and Postcard screenshots as art direction, not as a claim of pixel-perfect reconstruction.

The shared stage machinery (asset sizing, bottom anchoring, mirrored side placement, crop and authored ink) remains. The importer excludes the six superseded scene caption rules; `scripts/cast-scene-designs.css` owns their material, typography and layout under preset-ID selectors. The open-caption shadow rules remain shared as a paint-only accessibility layer. The two postcard variants intentionally use smoked stationery when the authored dialogue ink is bright: changing the authored color is not permitted. The removed postcard slogan stays removed.

The full catalogue now uses artwork-first cards and one composition description per group, with a dotted preview surface and compact selected title row. No presentation IDs, persistence, member preferences or packet semantics changed.

## Per-look review

All 50 named presets were rendered with the same character, scene where relevant and authored dialogue. Eight scene presets were changed in this pass; the other 42 were reviewed for visual identity and retained. Candidate notes are design observations, not implemented changes. The two legacy built-in presentations are not part of the 50 named Atelier renders and remain untouched.

| Preset | Review / disposition |
|---|---|
| Manga · Chapter Tab | Chapter header/footer with expression slug; preserve approved composition. |
| Moonlit Halo | Halo ornament and centered caption; metadata remains similar to other standees; candidate for follow-up. |
| Polaroid · Side Note | Instant print and side annotation; retain. |
| Editorial Square | Square portrait and typographic byline; retain. |
| Tech Messenger | Messaging pill with sender and timestamp treatment; retain. |
| Comic Stamp | Stamped avatar and comic speech box; retain. |
| Agency Lanyard | Physical badge with identification hierarchy; retain. |
| Evidence Tag | Chamfered evidence label and punched hole; retain. |
| 35mm Slide Mount | Slide frame and archival inscription; retain. |
| Persona Angular | Angular frame and separate portrait expression label; retain. |
| Cyber Comms | Communications frame and link status; visually related to Mecha HUD but intentionally different geometry; retain. |
| Manga Balloon | Rounded balloon and face composition; retain. |
| Cinematic Cutscene | Horizontal cutscene with side typography; retain. |
| 16-Bit RPG | Pixel-frame conversation window and bracketed mood; retain. |
| Editorial Magazine | Large editorial quotation and byline; typography overlaps with Luxury Lookbook; candidate for follow-up. |
| Manga SFX | Speech balloon with sound-effect ornament; retain. |
| Fighter Banner | Oversized fighter pose and uppercase horizontal banner; retain. |
| Anime OVA | Playback overlay and centered subtitle; retain. |
| Neon Horizon | Neon horizon grid and central caption; metadata remains similar to standees; candidate for follow-up. |
| Editorial Dissolve | Faded cutout and vertical-rule quote; candidate for follow-up to distinguish typography and remove redundant rule. |
| Gothic Folio | Oval portrait and ornate folio; retain. |
| Mecha HUD | Chamfered cockpit display and sync line; retain. |
| Manga Frame | White comic frame and horizontal caption rule; retain, candidate for stronger lettering later. |
| Terminal Console | Terminal chrome and command-line expression; retain. |
| Luxury Lookbook | Soft editorial panel and byline; candidate for follow-up with magazine family. |
| Open Horizon | Bare centered silhouette and caption; candidate for a distinct name treatment. |
| Cinematic Bleed | Cinematic fade and open side caption; retain, candidate for stronger title treatment. |
| Shonen Burst | Angled high-impact speech shape and graphic portrait; retain. |
| Tarot Arch | Arch and ornamental portrait; metadata similar to other standees; candidate for follow-up. |
| Washi Scrapbook | Taped paper note; retain. |
| Corner Pop-Out | Folded stationery, angled pose; preserve exact previous pixels. |
| Angled Cutout | Angular framing, cut label, separate speech shape; preserve exact previous pixels. |
| VN Hero Stage | REWORK: character tab, colored underline, quiet mood label on the existing VN script rail. |
| Afterglow Subtitle | REWORK: centered serif optical subtitle; uppercase speaker and italic mood with dot; no side rule. |
| Postcard From Here | REWORK: rotated writing paper, handwritten-style serif and parenthesized mood; no slogan. Pale for dark/automatic ink; smoked stationery for bright authored ink. |
| Rainbound Platform | REWORK: architectural glazing, metal sign rail, fasteners, sans-serif speaker and framed transit mood. |
| Memory Filmstrip | REWORK: perforations on both film edges, three exposures, horizontal film-leader caption, serif name and dashed uppercase mood tag. |
| Afterglow Subtitle · Letterbox | REWORK: centered sans-serif cinema subtitle, speaker slug and bracketed mood, letterbox retained. |
| Comic Establishing Shot · Redux | REWORK: retain monochrome scenery and burst silhouette; bold uppercase name and outlined expression label. |
| Postcard From Here · Postal Note | REWORK: folded letter with dashed writing rule and stamped expression; distinct from original postcard. |
| Materia Frosted Plaque | Frosted plaque and separated labels; retain. |
| Obsidian Lower-Third | Obsidian rail and name tab; retain. |
| Washi Tape Strip | Taped paper and serif note; retain. |
| Halftone Burst Notch | Halftone notch and comic name; retain. |
| Cyber Telemetry Plaque | Telemetry frame and signal metadata; retain. |
| Swiss Editorial Strip | Editorial horizontal rule and issue metadata; retain. |
| Pill Capsule Dock | Rounded capsule and initial emblem; retain. |
| Stamped Paper Scrap | Torn-paper silhouette and stamp; retain. |
| Origami Fold Ribbon | Folded ribbon and name tab; retain. |
| Subtitle Laser Beam | Open cinema beam with centered type; retain. |

## Verification

- `python scripts/build-cast-presets.py` regenerates the canonical TypeScript from the source references and design CSS.
- `python tests/cast-design-audit-browser.py` renders the eight family sheets and asserts eight distinct computed scene metadata signatures. Optional `--baseline path/to/previous/dist/frontend.js` checks pixel parity outside the scene scope; use a clean Chromium environment.
- Geometry: 450 layout cases. Curated blocking: 540 cases. Caption paint: 360 cases. Catalogue: desktop and 320/390/430 mobile.
- Build and strict typecheck passed. Live Lumiverse and all possible user theme/ink combinations have not been tested.
