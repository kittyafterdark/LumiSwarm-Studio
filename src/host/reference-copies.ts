// Read original authenticated image routes, never thumbnails or arbitrary remote URLs.
async function verifyStudioReferenceCopies(snapshot: any, outerSignal?: AbortSignal): Promise<any> {
  const result = { ...snapshot, claims: (snapshot?.claims || []).map((claim: any) => ({ ...claim })) }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  const abort = () => controller.abort()
  outerSignal?.addEventListener("abort", abort, { once: true })
  if (outerSignal?.aborted) controller.abort()
  let checked = 0, totalBytes = 0
  try {
    for (const claim of result.claims) {
      if (controller.signal.aborted || checked >= 12 || totalBytes >= 96 * 1024 * 1024) break
      if (!claim.persisted || claim.copyCheck?.status !== "readable-bytes") continue
      const id = String(claim.imageId || "")
      if (!/^[a-f0-9-]{36}$/i.test(id)) continue
      checked++
      let objectUrl = ""
      try {
        const response = await fetch(`/api/v1/images/${encodeURIComponent(id)}`, { credentials: "same-origin", cache: "no-store", signal: controller.signal, redirect: "error" })
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/") || !response.body) throw new Error("Original unavailable")
        const reader = response.body.getReader(), chunks: Uint8Array<ArrayBuffer>[] = []
        let size = 0
        try {
          while (true) {
            const next = await reader.read(); if (next.done) break
            size += next.value.byteLength
            if (size > 50 * 1024 * 1024 || totalBytes + size > 96 * 1024 * 1024) throw new Error("Copy verification budget exceeded")
            chunks.push(new Uint8Array(next.value))
          }
        } finally { await reader.cancel().catch(() => {}) }
        totalBytes += size
        if (size !== claim.copyCheck.byteLength || size <= 0) throw new Error("Original changed during verification")
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: response.headers.get("content-type") || "" }))
        const image = new Image(); image.src = objectUrl
        await Promise.race([image.decode(), new Promise((_, reject) => { if (controller.signal.aborted) reject(new Error("Aborted")); else controller.signal.addEventListener("abort", () => reject(new Error("Aborted")), { once: true }) })])
        const width = image.naturalWidth, height = image.naturalHeight
        if (width < 1 || height < 1 || width * height > 36_000_000
          || (claim.copyCheck.width > 0 && width !== claim.copyCheck.width) || (claim.copyCheck.height > 0 && height !== claim.copyCheck.height)) throw new Error("Original dimensions do not match")
        claim.usableCopyVerified = true
        claim.copyCheck = { ...claim.copyCheck, status: "decoded-original", width, height, verifiedAt: Date.now() }
      } catch { claim.usableCopyVerified = false; claim.copyCheck = { ...claim.copyCheck, status: "decode-failed-or-unavailable" } }
      finally { if (objectUrl) URL.revokeObjectURL(objectUrl) }
    }
  } finally { clearTimeout(timer); outerSignal?.removeEventListener("abort", abort) }
  return result
}
