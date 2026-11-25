# Alpha.16 validation

## Verified in this release

- Production frontend and backend build; strict TypeScript.
- New wardrobe workshop contract: legacy migration, fresh and settings-only creation, copying artwork references, independent keys, custom directions, reference isolation, alternate naming, cue projection and prompt cleanup protection.
- Compiled wardrobe workshop Chromium fixture: 1440px, 390px and 320px. Legacy-to-fresh sheet, inherited custom expressions, isolated artwork, wardrobe-specific job destination, render-time switch lock, independent alternate, roundtrip of artwork and outfit settings, settings-only copy, hidden cue ingestion.
- Existing wardrobe and Cast island contracts, plus targeted wardrobe revision, expression layout/bank/editor and backend contracts during development.
- Existing Atmosphere & FX and Interactive Theater Chromium regression at 390px after final build.

Run `npm run test:wardrobe` and `npm run test:wardrobe:ui` (Python Playwright with Chromium; `WARDROBE_WIDTH` selects one viewport, `CHROMIUM_EXECUTABLE` overrides browser path). Existing Theater runners accept `THEATER_WIDTH`.

## Boundaries

Browser runs use the actual compiled extension with mocked host transport and fixture artwork. No actual Swarm render or installed Lumiverse session was used. The full historical suite was not rerun. Actual native message processor/interceptor ordering and sanitizer preservation need live verification. No automatic alt selection, nested variant schema, immutable historical art snapshots, or new story wardrobe activation mechanism; named alternates are deliberate for compatibility with the existing picker and packet resolver. Raw message text retains cues; display and outgoing assistant history are projected separately. No new permissions, dependencies or core changes.
