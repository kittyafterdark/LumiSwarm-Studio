# Visuals workspace (1.1.0-alpha.2.7)

Open **Studio → Visuals**, or use **Swarm drawer → Visuals → Open Visuals editor**. The drawer Visuals button opens a compact quick-access screen, not a separate identity editor. Lore is a sibling tab next to Cast; Styles remains the render-style and LoRA library workspace.

Character provides the active chat character’s base identity, preset import, checkpoint, Anima reference settings, LoRA binding and canonical looks. Wide surfaces display base identity/LoRAs and looks side by side. Narrow surfaces use an Identity & LoRAs / Looks switch, preserving both forms while moving between them. Persona provides the existing reusable profile editor and native binding controls. Refresh explicitly reloads active chat context; save before refreshing or closing Studio. Switching Studio tabs does not remount the editor.

The existing `ChatVisualsController` is mounted once per Studio modal; its backend messages still flow through Studio so the generation state and active identity indicators stay synchronized. Native character-editor integration is unchanged. The save operations and stored metadata are unchanged. No changes to automatic identity/lore injection or compiler dialects are included.

## Atelier navigation

Saved looks and persona profiles are selectable cards. A look uses its saved thumbnail or reference image when available, with a typographic fallback otherwise. The selected card is outlined; the active card is separately marked. Selection only opens an editor, not activation. Appearance and outfit prompts have dedicated writing space; import, checkpoint/reference, LoRA and recognition/continuity options remain available in expandable sections. Each editor has an independent scrolling body and a separate footer; the mobile Identity / Looks switch preserves the same editor instances. No stored fields or save payloads were removed. The original selection controls remain internal to the controller to retain the established selection event path.

### Persona directory

Persona has its own layout rather than inheriting the Character two-column editor. A narrow scrollable directory contains saved profile cards, the profile count, creation and deletion controls. The remaining width holds the selected profile’s identity editor, native preset import and save/bind footer. The title names the selected profile; the caption names the active Lumiverse persona that would receive the binding. Selection does not bind or save. New profile retains the existing create-and-bind behavior using the current identity draft. On narrow surfaces the directory becomes a compact horizontal profile rail and the editor fills the remaining height. Both list axes preserve selection visibility after rendering. No new fields or backend changes.

## Quick access in the drawer

The original decorative Studio entry card is the only visible surface on the drawer home screen. Its Visuals button opens a separate quick-access page with Back, Refresh and Open Visuals editor actions. The two views are mutually exclusive and share theme variables. Character and Persona use styled native disclosures with custom SVG chevrons, keyboard support and suppressed browser markers. Both start collapsed; their summaries show binding status and Character shows the assigned look/base render style or Studio inheritance. Opening or closing a disclosure does not affect the launcher, and returning home restores focus to its Visuals button. Disclosure state survives page changes.

The drawer reads confirmed saved bindings for the active character chat and persona. Bind an unconfigured character from its existing base tags, pause/resume the character or persona visual identity, choose a saved look or persona profile, and bind a saved LoRA stack or the current Studio stack. A named stack stays named when the current stack matches it; otherwise the binding stores a custom snapshot. Save and manage named LoRA presets in Styles; the drawer retains selection and binding only. Native Image Gen preset import, prompt editing, new looks and persona profile creation stay in Visuals.

Quick access has its own `get_quick_visuals`/`set_quick_visuals` request path. The backend reads the current stored binding and mutates only the chosen property, with explicit active chat/character/persona validation. It never sends quick reads to the workspace editor, nor does it request model inventory. It uses the live Studio draft if available, otherwise the miniplayer's captured draft or the saved generation profile. Confirmed server responses determine the selected values; on errors the previous confirmed state is restored, and on a missing response refresh is required. Refresh on drawer activation, chat/persona switch and Studio dismissal. No compiler or lore behavior has changed.

The Settings section offers the existing floating widget visibility preference, prompt composition (ensemble / POV), and the 100/75/50% inline image display presets. Widget and image size use the shared local behavior preferences and update Studio and the actual floating widget immediately. Prompt composition uses a narrow, request-correlated server update that preserves unrelated parser configuration, with confirmed selection and rollback on rejection. Studio settings changes reflect back into the drawer. Open current Cast opens the assigned album, or the Cast library if the chat has none. Open Styles / LoRAs lands in the existing Styles workspace. The SVG refresh button reloads the binding context.

## Verification

- `npm run build`, `npm run typecheck`, `npm test`.
- `python tests/quick-visuals-browser.py` exercises real compiled drawer controls at desktop and phone widths: bound/paused states, saved/current stacks, profile/look switching, settings synchronization, composition rejection and retry, stale response isolation, context changes and navigation to Visuals, Styles and the active Cast. Backend tests validate the actual persistence operations, field preservation, missing presets, duplicate names and stale context.
- `python tests/visuals-workspace-browser.py` exercises the compiled frontend with a stateful mock: drawer routing, duplicate prevention, wide/narrow layouts, readable controls, character and look navigation, draft retention across tabs, rejected and retried saves, actual save payloads for identity/looks/persona, viewport rotation, and reopening.
- `python tests/visual-lore-atelier-browser.py` checks that the existing Lore editor remains functional and reachable after the drawer relocation.

Browser tests use a mock Lumiverse host; live integration remains a separate check. Set `CHROMIUM_PATH` to override the Chromium executable.

## Generate binding indicators (alpha.2.8)

The character and persona prompt-context buttons expose their enabled state with `aria-pressed`. Enabled uses an accent-filled dot and accent surface; disabled uses a hollow dot, muted surface and dashed border. The Lore shortcut and preset label are not toggle buttons and are unchanged. The compiled-browser test toggles the persona binding and checks both the provider request and computed styles.
