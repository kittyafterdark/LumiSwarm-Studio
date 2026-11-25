# Alpha.14 validation

## Source compatibility

Inspected supplied Lumiverse staging commit `429fac455909a4ae3207d478714503f7cd13c391`:
- `frontend/src/lib/spindle/frontend-domain-api.ts`, `loader.ts`, `host-surfaces.ts`, `dom-helper.ts` (domain and host contracts).
- `frontend/src/hooks/useSwipeAction.ts`, `frontend/src/lib/commands.ts`, native composer bridge (authoritative generation and swipe actions).
- `frontend/src/types/ws-events.ts`, `frontend/src/ws/useWebSocket.ts`, `frontend/src/components/chat/MessageContent.tsx` (scoped token offsets, separate reasoning channel, stop reconciliation and native rendering).

No Lumiverse core patch or permission change. Backend dist remains byte-identical to Alpha.13.6.

## Tests executed

- Production build: PASS.
- Strict TypeScript with installed global compiler: PASS.
- `tests/theater-live-browser.py`: PASS at 1440x900, 390x844 and 320x640. Final 320px rerun isolated after combined runner timeout.
- Existing `tests/theater-browser.py`: PASS at 320px during development.
- Existing `tests/theater-density-browser.py`: PASS at 1440px during development.
- `frontend-contract.mjs`, `cast-island-pipeline-contract.mjs`, `cast-presentation-contract.mjs`, `safety-scan.mjs`, `v27-floating-toolkit-contract.mjs`: PASS.

The live fixture uses the compiled production bundle, real Cast presentation rendering, simulated native composer/command API, canonical rows and independently delayed DOM updates. It checks source-boundary scanning, quoted attributes, incomplete blocks/fences/comments, offsets/gaps, native draft and single send, cross-chat token rejection, inert separate reasoning, incomplete paragraph/packet/HTML withholding, progressive frames, late Cast hydration, text-transforming regex deferred to final rendering, delayed swipe navigation, regeneration, stopping, virtualization cache, deletion, teardown and viewport overflow. The native host itself and real provider/GPU execution were not run. The complete historical regression suite was not rerun.

## Reproduce

```sh
npm run build
npm run typecheck
npm run test:theater:live
```

Python Playwright and Chromium are required for browser fixtures. `THEATER_WIDTH=320|390|1440`, `CHROMIUM_PATH` and `THEATER_SCREENSHOTS` can select viewport, browser and screenshot directory.
