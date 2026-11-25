# Visual Lore Atelier (1.1.0-alpha.5)

## Using the workspace

Open **Studio → Lore** beside Cast. The drawer Visuals screen links to the full Visuals editor; Lore remains a sibling workspace and Generate also has a shortcut. A single controller owns the editor for the lifetime of the Studio modal.

Select a native lorebook, search by entry name, native key, saved visual alias, folder or native tag, and filter by configuration, entity type, or currently active visual layers. Desktop uses independently scrolling library and editor panes. Narrow containers show the directory first, then a full-width editor with a back button and sticky save controls. Counts refer to the currently selected book, not every book in Lumiverse.

Select an entry to edit the existing visual identity metadata: type, aliases, positive/negative prompts, aspect, checkpoint, LoRA stack, reference image, notes, and visual enablement. Native keys are displayed for context, not edited here. Use **Choose from Library** to select an owned output through the same picker used by Cast; the chosen ID is a draft until saved. The fallback URL is used when no ID is set. An unavailable local image receives a placeholder rather than breaking the editor. Creating or editing native lore entries themselves remains the job of Lumiverse's lorebook editor.

## Native folders and entity types

Studio reads native `folder` on books and entries, and `tags` on entries. Books are grouped by folder in the selector. Within a foldered book, entries appear once in collapsible folder cards, including an Unfiled group; each header shows its matching entry count and active visual-layer count. Search and filters reveal matching folders without permanently changing the saved expansion preference. Folder expansion is scoped to the book for the lifetime of the workspace. Books without entry folders retain the existing Activated now / All other lore arrangement. No native folder assignments are created or edited here.

A saved visual identity type wins. An unsaved entry may suggest a type from an explicit comment prefix such as `location | high school library` or `character: Ritsu`, or a single recognized native type tag. Otherwise the editor shows Choose entity type, and the entry appears under Unclassified. The same resolver drives the directory and editor. Inferred types remain drafts until saved; changing a draft does not move the saved entry in the directory until the save succeeds. Saving a new identity requires a type. No text content is analyzed and no activation or compiler behavior is changed.

Native organization contract: [Lumiverse world-books service](https://github.com/prolix-oc/Lumiverse/blob/main/src/services/world-books.service.ts) (`rowToBook`, `rowToEntry`), and [Spindle world-books API](https://docs.lumiverse.chat/backend-api/world-books/) for pagination and user scope. Older hosts omitting organization fields retain the flat directory. Live SDK field exposure must be confirmed in the installed host.

## Activation is not editing

- **Active**: native lore is currently activated and its saved visual identity is enabled.
- **Native active**: the native entry is activated but its visual layer is disabled or unconfigured.
- **Ready**: an enabled identity exists but the native entry is not currently activated.
- **Disabled**: configured, but the visual layer is disabled.
- **New**: no saved visual identity.

These are eligibility indicators, not proof that a particular compiled request consumed an entry. The active count is the intersection of native activation and enabled saved identity. Refresh re-reads the selected book and active chat context; re-entering the workspace also refreshes when the editor is clean. Saving changes the visual layer only; it does not activate the native lore entry. Aliases are metadata, not new activation keys.

## Persistence and lifecycle

The existing `swarm_studio_visuals` native lore entry extension remains authoritative. No migration or duplicate library is required. Optional `modelPrompts` extends the existing identity; the original shared prompts remain the fallback. `get_visual_lore` returns additional directory summary fields (`entityType`, `aliases`, `visualEnabled`, `referenceImageId`) without changing the stored schema. `save_visual_lore` retains unrelated entry extensions. The editor preserves recipe and checkpoint-family metadata and the stack snapshot when the selected stack is unchanged, even if the saved stack is currently unavailable.

Requests carry unique IDs and only matching responses update the editor. While loading/saving, controls are disabled. A failed save preserves the draft and reports the error locally. A dirty editor survives switching Studio tabs; changing entries/books or refreshing requires saving or discarding edits first. Closing Studio discards unsaved edits, as before. Missing selected entries/books fall back to the first available item. Both native book and entry lists are now paginated through completion, with duplicate-page protection. The selected entry can be beyond the first 200 results.

## Compiler integration

Open **Model prompt overrides** to customize positive or negative prompts for any of the six concrete compiler families. Blank values inherit the corresponding shared prompt; Anima variants can inherit Anima base. These are optional overrides, not separate identities. Native activation and visual enablement make an entry eligible, but the scene plan must explicitly reference it before it contributes. Check **Inspect request & compiled prompt** on an inline image for selection and rejection diagnostics. See [scope, precedence and migration](prompt-compilers/visual-lore.md).

Manual generation selection is available through **Use in Generate** on a saved, enabled identity. The sticky selection tray spans books, shows the total, and provides Clear and Open Generate. Generate displays a book icon with a grouped provenance popover. See [Manual Lore](prompt-compilers/manual-lore.md). True subject-local LoRA conditioning and MOSS layout transport remain deferred.

## Verification

- `npm run build`, `npm run typecheck`, `npm test`.
- `python tests/visual-lore-atelier-browser.py` uses the actual compiled Studio frontend with a minimal mocked native lorebook backend and the existing Studio UI harness. It covers desktop, 390px and 320px phone layouts, folder disclosure and search across collapsed folders, inferred and unclassified types, native/visual state distinctions, empty books, draft retention, failed saves/retry, stale replies, reference picker selection and discard, drawer navigation, viewport changes and model prompt override save/retry. Set `CHROMIUM_PATH` if Chromium is not at `/usr/bin/chromium`.
- `tests/backend-contract.mjs` covers native extension persistence and round-trip summary fields, including disabled-but-native-active identities, preservation of unrelated extensions, folder/tag transport and a 206-entry / 205-book paginated provider.

Browser fixtures are synthetic. Live Lumiverse integration and model quality are separate verification steps.

## Required permission

The manifest declares `world_books`, required for listing native world books and entries, reading activated lore, and saving visual identity extension metadata. Existing installs may need to approve this added permission after upgrading to alpha.2.6. The backend continues to reject ungranted access; no permission bypass is used. The backend contract checks both the manifest declaration and denied/granted behavior.
