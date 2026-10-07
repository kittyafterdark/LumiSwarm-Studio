// Foreground-only, bounded retries: suspension can lose events or leave the host
// transport reconnecting. Reuse one request ID so late acknowledgements stop retries.
class StudioRecoveryController {
  private timer: ReturnType<typeof setTimeout> | null = null
  private requestId = ""
  private attempts = 0
  private lastRecovery = 0
  private destroyed = false
  private readonly resume = () => {
    if (this.destroyed || document.visibilityState === "hidden") return
    if (this.requestId || Date.now() - this.lastRecovery < 2000) return
    this.requestId = createRequestId()
    this.attempts = 0
    this.timer = setTimeout(() => {
      this.timer = null
      if (this.destroyed || document.visibilityState === "hidden") { this.stop(); return }
      this.request()
    }, 150)
  }
  private readonly visibility = () => {
    if (document.visibilityState === "hidden") { this.stop(); this.lastRecovery = 0 }
    else this.resume()
  }
  private readonly restored = () => { this.lastRecovery = 0; this.resume() }
  constructor(private readonly ctx: FrontendContext, private readonly refresh: () => void) {
    document.addEventListener("visibilitychange", this.visibility)
    window.addEventListener("pageshow", this.restored)
    window.addEventListener("online", this.restored)
    window.addEventListener("focus", this.resume)
    window.addEventListener("pagehide", this.suspend)
    this.resume()
  }
  private readonly suspend = () => { this.stop(); this.lastRecovery = 0 }
  private request(): void {
    if (this.destroyed || document.visibilityState === "hidden" || !this.requestId) { this.stop(); return }
    this.attempts++
    // Install the retry before sending: mock or local transports may reply synchronously.
    this.timer = setTimeout(() => {
      this.timer = null
      if (this.attempts < 4) this.request()
      else this.stop()
    }, [1000, 2500, 5000, 10000][this.attempts - 1])
    try { this.ctx.sendToBackend({ type: "list_tagged_jobs", requestId: this.requestId }) }
    catch (error) { reportStudioError("Foreground image recovery", error) }
  }
  onMessage(payload: any): void {
    if (!this.destroyed && this.requestId && payload?.type === "tagged_image_jobs_result" && payload.requestId === this.requestId) {
      this.lastRecovery = Date.now()
      this.stop()
      try { this.refresh() } catch (error) { reportStudioError("Foreground Studio refresh", error) }
    }
  }
  private stop(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.requestId = ""
  }
  destroy(): void {
    this.destroyed = true
    this.stop()
    document.removeEventListener("visibilitychange", this.visibility)
    window.removeEventListener("pageshow", this.restored)
    window.removeEventListener("online", this.restored)
    window.removeEventListener("focus", this.resume)
    window.removeEventListener("pagehide", this.suspend)
  }
}
