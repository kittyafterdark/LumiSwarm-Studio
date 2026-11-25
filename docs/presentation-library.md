# Cast Presentation Library

## Ownership

The library reached from Cast Album → Member → Presentation → Choose a presentation edits the **portable album member**. It is not the chat Member Atelier's user-preference editor. Personal preference diffs still take precedence in chat; they are neither imported nor cleared by this picker. Use Member Atelier to change or revert a personal override. The album-level "Make cast default" action remains in the surrounding member workspace.

## Navigation

- Desktop: all composition families with counts are in a dedicated scrolling sidebar; the gallery has its own scroll surface. A name search filters the selected composition without rebuilding the search field. Stage side remains accessible. Crop framing expands in place. Saved backgrounds can be previewed from the sidebar without changing the Cast default scene.
- Narrow view: a native composition selector and a magnifier replace the horizontal chip scroller. Tap the magnifier to search; closing it clears the search. Framing exposes stage and crop controls independently of the gallery. Scene preview stays in Looks. The layout switches using the dialog's actual available inline size (including host-scaled widths).
- The current album look and inheritance state remain at the top of the gallery. Use Cast default clears the member override. Choosing a look updates the active selection and saves it without dismissing the library. Done closes after the current save resolves. A rejected save leaves the current selection available to retry.
- Existing stage alignment and crop adjustments retain their album-wide member semantics. The same 52 options (50 named presentations plus the two original Cast looks) use the existing renderer and source assets. There are no changes to template design, generation, or per-card expression corrections.

## Validation

`python tests/cast-mobile-presentation-modal-browser.py` exercises the real compiled frontend with a minimal mocked host, including 320/390/430px and desktop geometry, search, composition switching, Framing, repeated selections, delayed saves returning to the original setting, failure/retry, default inheritance and viewport rotation. Existing Cast Worlds, Wardrobe R7 and Album Management browser suites cover the shared background selector, side preview, crop dragging and durable member settings. The full live Lumiverse host still needs integration testing.
