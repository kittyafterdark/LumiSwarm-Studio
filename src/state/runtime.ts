let fallbackRequestIdCounter = 0

function createRequestId(cryptoApi: Crypto | null | undefined = globalThis.crypto): string {
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID()
  }

  if (typeof cryptoApi?.getRandomValues === "function") {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  fallbackRequestIdCounter += 1
  return `swarm-studio-${Date.now().toString(36)}-${fallbackRequestIdCounter.toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function reportStudioError(scope: string, error: unknown, details?: unknown): void {
  const label = `[Swarm Studio] ${String(scope || "Error").trim() || "Error"}`
  if (error instanceof Error) {
    console.error(label, error.message, error, details ?? "")
    return
  }
  const message = String(error || "Unknown error")
  console.error(label, message, details ?? error)
}

type ModelFamily =
  | "anima"
  | "illustrious"
  | "pony"
  | "sdxl"
  | "sd15"
  | "flux"
  | "sd3"
  | "chroma"
  | "qwen"
  | "hunyuan"
  | "unknown"
