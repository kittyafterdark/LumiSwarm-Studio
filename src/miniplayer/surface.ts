function createOverlayMiniplayerWidget(): any | null {
  if (!document.documentElement) return null
  const surface = element("div", "ss-miniplayer-app-surface")
  // Own this surface directly. mountApp creates a separate 48px host widget;
  // portalling the visible player out of that host left an invisible draggable
  // square behind. Lumiverse's mobile body is 0px tall with overflow: clip, so
  // the viewport-sized document element is the only unclipped neutral parent.
  document.documentElement.appendChild(surface)
  let width = 318
  let height = 94
  let x = Math.max(8, window.innerWidth - width - 18)
  let y = Math.max(8, window.innerHeight - height - 92)
  try {
    const saved = JSON.parse(window.localStorage.getItem(MINIPLAYER_POSITION_STORAGE_KEY) || "{}")
    if (Number.isFinite(saved?.x)) x = Number(saved.x)
    if (Number.isFinite(saved?.y)) y = Number(saved.y)
  } catch {
    // Start near the lower-right corner when storage is unavailable.
  }
  const place = (persist = false) => {
    x = clamp(x, 8, Math.max(8, window.innerWidth - width - 8))
    y = clamp(y, 8, Math.max(8, window.innerHeight - height - 8))
    surface.style.left = `${Math.round(x)}px`
    surface.style.top = `${Math.round(y)}px`
    if (persist) {
      try {
        window.localStorage.setItem(MINIPLAYER_POSITION_STORAGE_KEY, JSON.stringify({ x, y }))
      } catch {
        // Position persistence is a convenience, not a runtime requirement.
      }
    }
  }
  const onResize = () => place()
  window.addEventListener("resize", onResize)
  surface.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (!target.closest(".ss-mini-preview, .ss-mini-title")) return
    const startX = event.clientX
    const startY = event.clientY
    const originX = x
    const originY = y
    let moved = false
    const move = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      if (!moved && Math.hypot(dx, dy) < 5) return
      moved = true
      moveEvent.preventDefault()
      x = originX + dx
      y = originY + dy
      place()
    }
    const stop = () => {
      document.removeEventListener("pointermove", move, true)
      document.removeEventListener("pointerup", stop, true)
      document.removeEventListener("pointercancel", stop, true)
      if (moved) {
        place(true)
        surface.addEventListener("click", (clickEvent) => {
          clickEvent.preventDefault()
          clickEvent.stopPropagation()
        }, { capture: true, once: true })
      }
    }
    document.addEventListener("pointermove", move, true)
    document.addEventListener("pointerup", stop, true)
    document.addEventListener("pointercancel", stop, true)
  })
  place()
  return {
    root: surface,
    setSize(nextWidth: number, nextHeight: number) {
      width = Math.max(40, Math.round(nextWidth))
      height = Math.max(40, Math.round(nextHeight))
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      place()
    },
    setVisible(visible: boolean) {
      surface.hidden = !visible
    },
    isVisible() {
      return !surface.hidden
    },
    destroy() {
      window.removeEventListener("resize", onResize)
      surface.remove()
    },
  }
}
