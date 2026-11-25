# Manual Lore selection (1.1.0-alpha.5)

## Workflow

1. In Studio → Lore, choose a native lorebook and a saved, enabled visual identity. Save any new identity or edits before selecting it.
2. Use **Use in Generate** in the editor footer. Select more entries, even from other books. Use the **Selected for Generate** filter to review entries in the current book. The tray displays the total across books; the editor button toggles the current entry and Clear empties the selection.
3. **Open Generate** switches tabs; it does not start a job. The compact book icon beside existing visual binding indicators displays the selected count. Click or tap to read **Provenance**, organized by native source book and entity type. Escape or an outside click dismisses the popover. **Manage in Lore** returns to the library.
4. Write the desired prompt and generate normally. The selection is held for the lifetime of the Studio instance, across tabs and successive manual renders. Closing Studio clears it. It does not persist into the default generation profile, native lore activation or subsequent chats' inline instructions.

The selection is explicit: a saved, enabled identity need not be activated in the current chat. Disabled or unsaved identities cannot be newly selected. A book refresh removes missing/disabled entries from that book and removes selections from unavailable books. The selected count is a preflight view, not proof that a render succeeded or that the model depicted every entry.

## Backend contract and precedence

The frontend sends a maximum of 32 `{bookId, entryId}` pairs outside the normal `input` and `profileInput`. The backend re-reads the user's available books and the requested entries using `world_books`, verifies source membership and enablement, and deduplicates entries. It rejects unavailable, disabled, misfiled or unauthorized selections rather than silently producing an unrelated render. Native activation is not queried for manual selection. Frontend labels and prompt fragments are not trusted.

The existing compiler-family setting resolves against the explicitly selected generation model, with exact override → Anima family fallback → shared prompt. Text is appended to the manually composed prompt; tag-family positive qualifiers are escaped using the existing helper. This is image-wide prompt enrichment, **not** automatic subject placement. Explicit placement in the authored manual prompt is still the user's responsibility. Repeated identical fragments are not appended twice.

- Positive and negative fragments from selected identities are added, preserving the existing manual prompt and selected preset tokens.
- Enabled saved LoRA preset items (or their saved snapshot fallback) are added unless a Generate stack already specifies that adapter or selected Lore entries disagree on its weight. This is conflict handling, not a guarantee of architecture compatibility.
- The selected Generate checkpoint, canvas, sampler/recipe and reference settings win. Lore checkpoint, aspect, reference and recipe overrides are not automatically applied in manual generation. They remain available to the existing inline scene path.
- Standard generation only: raw request overrides/custom workflows and structured JSON prompts are rejected while manual Lore is selected, since arbitrary workflows may bypass the prompt or adapter channels and JSON cannot be safely appended to. Clear the selection for those paths. MOSS layout modes now exist for structured inline/Pocket requests; they do not remove this manual selection guard.
- Inpaint, inline/Pocket and Cast background jobs do not consume this manual selection.

The successful generation record stores server-resolved `manualLore` entries (source and type) and `manualLoreDiagnostics`, including conflict and override notes. The recorded prompt is the provider-facing enriched prompt, while `profileInput` remains the clean Studio configuration. The Generate popover describes the currently selected entries, not an immutable record of the previous image.

## Tests

- `node tests/backend-contract.mjs` exercises actual mocked provider dispatch, inactive explicit selection across books, MOSS override fallback, duplicate IDs, existing and conflicting weights, base-profile isolation, saved provenance, source membership, disabled and permission errors, JSON/raw override rejection and generation without selected Lore.
- `python tests/manual-lore-browser.py` exercises the actual compiled frontend at 1440, 390 and 320px using the existing native-lore and Studio harness. It checks selection across books, disabled entries, grouped popover, viewport bounds, Escape dismissal, outgoing request and clean profile, and clearing selection.
- `python tests/visual-lore-atelier-browser.py` covers the existing folder, save, override and editor flow.

The fixtures do not prove model quality or live host/provider interoperability. Verify a real render with multiple native books and check the enriched output metadata.
