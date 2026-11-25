# Cast v1.0.40: phone presentation modal

A normal-size desktop gallery was forcing phone users to scroll past Stage position and every Crop Workshop slider before reaching the first presentation. The image composition itself did not require changes.

At viewport widths <= 680px, Studio Cast presentation selection is now a two-tab fitting room:

- **Looks (default):** composition filters, all 36 selectable presentations, and consistent artwork previews. Tabs and categories remain sticky within the dialog's scrolling content.
- **Adjust:** member-wide Auto/Left/Right stage placement and the existing crop editor with draggable preview and X/Y/zoom controls.

The dialog uses the app's interactive viewport and safe-top variables, avoiding viewport-height assumptions when mobile chrome is shown. It is not enlarged or shrunk by CSS zoom or transform. Desktop/tablet layouts are left intact. A new dialog instance resets to Looks; inside one instance, tab switches preserve scroll, and filter changes start the updated results at the top.

## Regression checks

`python tests/cast-mobile-presentation-modal-browser.py` drives the actual compiled StudioCastWorkspace on simulated 320, 390, 430, and 1024 CSS-pixel devices with a mock Cast library/backend and served image fixture. It verifies:

- A first selectable presentation is in the initial screen at all three phone widths and the modal stays within the screen.
- The controls are hidden from Looks, visible in Adjust, and the two tabs switch without losing changes.
- Crop Y and stage position persist via the existing targeted library save flow.
- Filtering results, selecting a presentation, closing and reopening, and desktop layout all function.

Existing album editing, Cast Island mounting, stage parity, side placement and canonical preset geometry tests were re-run.

This is a modal layout/UI release. It does not touch the live chat DOM renderer, Shadow DOM lifecycle, stream syntax, crop semantics or individual preset geometry.
