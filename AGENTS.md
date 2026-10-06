# Lumiverse extension build exception

This repository is a Lumiverse extension, not the Lumiverse core checkout.

The live-environment PR protocol still applies to preserving repository state, scoped edits, newline conventions, validation, and commit/push authorization. Its generated-artifact exclusion applies to Lumiverse core PRs and incidental build/test output.

For extension repositories whose manifest loads committed build artifacts directly, those artifacts are required deliverables:

- Build the extension after changing its source, using the repository's build command.
- Validate the resulting runtime and review the generated diff.
- Commit and push the required compiled entry files together with the source changes when committing/pushing is authorized.
- Do not restore those required build artifacts merely because they are generated.
- Continue excluding incidental reports, screenshots, coverage, caches, and unrelated generated files.

For Swarm Studio, `spindle.json` loads `dist/frontend.js` and `dist/backend.js`. Run `npm run build` before completing a source change and include whichever of these entry files changed. A source-only push leaves installed extensions running the previous code.
