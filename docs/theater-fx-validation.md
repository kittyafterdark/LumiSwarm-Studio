# Alpha.15 validation

Baseline: Alpha.14.2 cumulative archive. Built with Node 22.16.0. Strict TypeScript using the installed compiler. All tests use local production artifacts; browser hosts and artwork are fixtures, not a real Lumiverse/provider session.

| Check | Result |
|---|---|
| Production build | PASS |
| Strict TypeScript | PASS |
| New FX browser fixture 1440 / 390 / 320 | PASS / PASS / PASS |
| Existing Stagecraft 1440 | PASS during development |
| Interactive Theater 390, extended with streamed cue | PASS |
| Inspector chrome 320 | PASS after retaining prior rain density |
| Cast island pipeline, Cast presentation, frontend, safety scan, floating toolkit contracts | PASS (5) |
| Backend runtime compared with Alpha.14.2 | Byte-identical |

New fixture covers allowlist/clamping, malformed directives, source/DOM completion, cue-only withholding, cue attachment, weather inheritance and clearing, scene reset, rewind, replacement timeline, seeded node persistence, actor targeting, effect expiration, same-frame rerender, conservative automatic weather and lightning, HTML protection, all nine particle types, preview, motion toggle, OS reduced motion and no native chat mutation. Live fixture proves a partial cue cannot publish, a complete cue alone adds no screen, and completed prose receives the weather before generation ends.

Not tested: actual running host, every 50-card/theme combination, all viewport variants of all existing browser suites, full historical contract suite, device GPU profiling. Automatic detection is narrow English narration matching. Explicit directives require recognizable host-rendered content. Normal chat remains unchanged. One-shot FX are visual-only; no audio, physical weather simulation, or LLM-based event detection.
