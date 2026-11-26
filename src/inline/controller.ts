interface TaggedImageJobView {
  generationId?: string
  awaitingSource?: boolean
  draftImageId?: string
  finalImageId?: string
  swipeId?: number
  output?: "inline" | "url"
  id: string
  key: string
  tagFingerprint?: string
  packetFingerprint?: string
  chatId: string
  messageId: string
  slot: string
  prompt: string
  sourcePrompt?: string
  promptCompiler?: ResolvedScenePromptFamily
  compilerDiagnostics?: string[]
  loreDiagnostics?: string[]
  negativePrompt: string
  aspect: string
  alt: string
  status: "requested" | "queued" | "generating" | "ready" | "failed" | "cancelled"
  clientJobId: string
  imageId: string
  imageUrl: string
  inserted: boolean
  updatedAt?: number
  error: string
}

interface StudioInlineImageTarget {
  jobId: string
  imageId: string
  replace: (replacementId: string, expectedId?: string) => Promise<void>
  onExit?: () => void
}

interface InlineImageMenuItem {
  key: string
  label: string
  disabled?: boolean
  danger?: boolean
  type?: "divider"
}

const INLINE_IMAGE_ACTION_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 6l2.3-2.3M20 4v7h-7"/></svg>`

function widgetEscape(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function widgetKeyHash(value: string): string {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}

interface InlineTagStream {
  id: string; chatId: string; owner: string; target: string; swipeId?: number
  source: string; gap: boolean; stopped: boolean; background: boolean; seq?: number; seqGap?: boolean; settlementContent?: string
  aliases: Set<string>
  // A render callback may correct an ID-less terminal only when it matches
  // the complete ended stream and a newly observed saved message.
  initialMessageIds?: Set<string>
  initialSwipeText?: Map<string, string>
  initialTarget?: string
  terminalMessageId?: string
  terminalContent?: string
  requests: Map<string, { fullMatch: string; attrs: Record<string, string>; content: string }>
}

// Scan only completed explicit generation packets. The host interceptor is
// still responsible for legacy requests and display removal; parser packets
// deliberately remain completion-only.
function inlineStreamTags(source: string): Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> {
  const tags: Array<{ fullMatch: string; attrs: Record<string, string>; content: string }> = []
  // Examples in fenced/inline code, HTML comments, and hidden reasoning are
  // not authored image requests. Keep exact source offsets for attachment.
  const protectedRanges = [...source.matchAll(/(?:^|\n)[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:\n[ \t]{0,3}\1[ \t]*(?=\n|$)|$)|<!--(?:[\s\S]*?-->|[\s\S]*$)|<(think|thinking|reasoning|code|pre)\b[^>]*>[\s\S]*?(?:<\/\2\s*>|$)|(`+)[^\n]*?\3/gi)]
    .map(match => [match.index!, match.index! + match[0].length])
  for (const match of source.matchAll(/<swarm-image\b([^>]*)>((?:(?!<swarm-image\b)[\s\S])*?)<\/swarm-image\s*>/gi)) {
    if (protectedRanges.some(([start, end]) => match.index! >= start && match.index! < end)) continue
    const attrs: Record<string, string> = {}
    for (const attr of match[1].matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? ""
    if (attrs.request?.toLowerCase() === "generate" && match[2].trim() && match[0].length <= 24_000) tags.push({ fullMatch: match[0], attrs, content: match[2] })
    if (tags.length >= 6) break
  }
  return tags
}

function inlinePacketIdentity(tag: { attrs: Record<string, string>; content: string }): string {
  return JSON.stringify([Object.entries(tag.attrs).sort(([a], [b]) => a.localeCompare(b)), tag.content.replace(/\r\n/g, "\n").trim()])
}

function inlineRequestSlot(tag: { attrs: Record<string, string>; content: string }): string {
  return String(tag.attrs.slot || "").trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80)
    || `image-${widgetKeyHash(inlinePacketIdentity(tag)).slice(0, 6)}`
}

class TaggedImageController {
  private readonly ctx: FrontendContext
  private readonly openStudioWithPrompt: (prompt: string, negativePrompt: string) => void
  private readonly openQuickCreateWithPrompt: (
    prompt: string,
    negativePrompt: string,
    onConfirm: (prompt: string, negativePrompt: string) => void,
  ) => boolean
  private readonly openLibrary: () => void
  private behavior: StudioBehavior
  private readonly jobs = new Map<string, TaggedImageJobView>()
  private readonly tagPayloads = new Map<string, any>()
  private readonly tagFingerprints = new Map<string, string>()
  private readonly settledTagLookups = new Set<string>()
  private readonly settledAttachmentRequests = new Set<string>()
  private readonly settledMessageTargets = new Map<string, string>()
  private readonly cleanups = new Map<string, () => void>()
  private readonly removedJobs = new Set<string>()
  private readonly jobRequests = new Map<string, string>()
  private readonly variantRequests = new Map<string, string>()
  private readonly replacementRequests = new Map<string, { resolve: () => void; reject: (error: Error) => void; timer: number }>()
  private readonly retiredAttempts = new Map<string, Set<string>>()
  private readonly widgetHtml = new Map<string, string>()
  private readonly selectedMessages = new Map<string, any>()
  private sourceSnapshot: any[] | null = null
  private readonly selectionCleanups: Array<() => void> = []
  private selectedChatId: string | null | undefined
  private recoveredObserver: MutationObserver | null = null
  private readonly recoveredJobs = new Set<string>()
  private urlActionObserver: MutationObserver | null = null
  private readonly urlActionJobs = new Set<string>()
  private readonly urlActions = new Map<string, { image: HTMLImageElement; button: HTMLButtonElement; events: AbortController; resize?: ResizeObserver }>()
  private urlActionFrame = 0
  private closeImageMenu: (() => void) | null = null
  private readonly streams = new Map<string, InlineTagStream>()
  private readonly terminalStreams = new Map<string, InlineTagStream>()
  private hydrationTimers = new Map<string, number>()
  private destroyed = false
  private promptDiagnostics: HTMLDialogElement | null = null

  private eventClosest<T extends HTMLElement>(
    event: Event,
    selector: string,
  ): T | null {
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) continue

      if (node.matches(selector)) {
        return node as T
      }

      const closest = node.closest<T>(selector)
      if (closest) return closest
    }

    const target = event.target
    return target instanceof HTMLElement
      ? target.closest<T>(selector)
      : null
  }

  private readonly handleInlineClick = (event: MouseEvent) => {
    const action = this.eventClosest<HTMLElement>(
      event,
      '[data-swarm-studio-inline-action]',
    )
    if (!action) return

    const job = this.jobForAction(action)
    if (!job) return

    event.preventDefault()
    event.stopImmediatePropagation()
    void this.openAnchoredImageMenu(job, action)
  }

  private readonly handleInlineContextMenu = (event: MouseEvent) => {
    const figure = this.eventClosest<HTMLElement>(
      event,
      'figure[data-swarm-studio-image="true"][data-swarm-studio-job-id]',
    )
    const job = figure ? this.inlineJobFromTarget(figure)?.job : this.urlJobFromEvent(event)
    if (!job) return

    event.preventDefault()
    event.stopImmediatePropagation()

    void this.showJobMenu(job, event.clientX, event.clientY, { context: true })
  }

  private readonly handleInlineKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return

    const action = this.eventClosest<HTMLElement>(
      event,
      '[data-swarm-studio-inline-action]',
    )
    if (!action) return

    const job = this.jobForAction(action)
    if (!job) return

    event.preventDefault()
    event.stopImmediatePropagation()
    void this.openAnchoredImageMenu(job, action)
  }

  constructor(
    ctx: FrontendContext,
    behavior: StudioBehavior,
    openStudioWithPrompt: (prompt: string, negativePrompt: string) => void,
    openQuickCreateWithPrompt: (
      prompt: string,
      negativePrompt: string,
      onConfirm: (prompt: string, negativePrompt: string) => void,
    ) => boolean,
    openLibrary: () => void,
    private readonly editInlineImage?: (action: "inpaint" | "replace" | "artwork", target: StudioInlineImageTarget) => void,
  ) {
    this.ctx = ctx
    this.behavior = { ...behavior }
    this.openStudioWithPrompt = openStudioWithPrompt
    this.openQuickCreateWithPrompt = openQuickCreateWithPrompt
    this.openLibrary = openLibrary
    window.addEventListener("click", this.handleInlineClick, true)
    window.addEventListener("contextmenu", this.handleInlineContextMenu, true)
    window.addEventListener("keydown", this.handleInlineKeyDown, true)
    for (const name of ["MESSAGE_SWIPED", "SWIPE_EDITED", "MESSAGE_EDITED", "MESSAGE_DELETED", "CHAT_SWITCHED", "CHARACTER_MESSAGE_RENDERED"]) {
      try {
        const cleanup = this.ctx.events?.on?.(name, (payload: any) => this.onSelectionEvent(name, payload))
        if (typeof cleanup === "function") this.selectionCleanups.push(cleanup)
      } catch { /* Older hosts may not expose all selection events. */ }
    }
    for (const name of ["GENERATION_STARTED", "GENERATION_IN_PROGRESS", "STREAM_TOKEN_RECEIVED", "GENERATION_ENDED", "GENERATION_STOPPED"]) {
      try {
        const cleanup = this.ctx.events?.on?.(name, (payload: any) => this.onStreamEvent(name, payload))
        if (typeof cleanup === "function") this.selectionCleanups.push(cleanup)
      } catch { /* Interceptor remains the compatibility path. */ }
    }
  }

  private submitStreamTag(stream: InlineTagStream, tag: { fullMatch: string; attrs: Record<string, string>; content: string }): void {
    const slot = inlineRequestSlot(tag)
    if (stream.requests.has(slot) || stream.requests.size >= 6) return
    const legacy = [...this.tagPayloads.values()].filter(payload => payload.isStreaming === true && !payload.generationId
      && String(payload.chatId) === stream.chatId && payload.slot === slot
      && inlineStreamTags(String(payload.fullMatch || "")).some(t => inlinePacketIdentity(t) === inlinePacketIdentity(tag))
      && [...this.jobs.values()].some(job => job.chatId === stream.chatId && job.messageId === String(payload.messageId)
        && job.slot === slot && !job.inserted && (job.id.startsWith("pending-") || job.awaitingSource))
      && (!stream.target || String(payload.messageId) === stream.target || stream.aliases.has(String(payload.messageId))))
    if (legacy.length === 1 && !stream.requests.size) {
      stream.owner = String(legacy[0].messageId); stream.aliases.add(stream.owner)
    }
    // Stable generation identity bridges the provisional and committed IDs.
    // No optimistic widget is mounted against a synthetic message ID.
    stream.requests.set(slot, tag)
    try {
      this.ctx.sendToBackend({ type: "tag_generate", requestId: createRequestId(), chatId: stream.chatId,
        messageId: stream.owner, generationId: stream.id, swipeId: stream.swipeId, ...tag, isStreaming: true })
    } catch { stream.requests.delete(slot) }
  }

  private onStreamEvent(name: string, payload: any): void {
    if (this.destroyed) return
    const chatId = String(payload?.chatId || payload?.chat_id || "")
    const id = String(payload?.generationId || "")
    if (!id || !chatId || (chatId !== this.ctx.getActiveChat?.()?.chatId && !this.streams.has(id) && !this.terminalStreams.has(id))) return
    if (name === "GENERATION_STARTED" || name === "GENERATION_IN_PROGRESS") {
      if (this.terminalStreams.has(id)) return
      const target = String(payload.targetMessageId || "")
      const current = this.streams.get(id)
      if (current && current.chatId === chatId) {
        if (target) { current.target = target; current.aliases.add(target) }
        if (this.swipeIndex(payload.targetSwipeId) !== undefined) current.swipeId = payload.targetSwipeId
        return
      }
      // Background alternatives are valid image owners if their message and
      // swipe are known; quiet parser and impersonation streams are not.
      const background = /^(impersonate|quiet)/i.test(String(payload.generationType || "")) || payload.isUser === true
        || (!!payload.backgroundSwipe && (!target || this.swipeIndex(payload.targetSwipeId) === undefined))
      let initialMessageIds: Set<string> | undefined
      let initialSwipeText: Map<string, string> | undefined
      try {
        const recent = this.ctx.messages?.getRecent?.(200)
        if (Array.isArray(recent)) {
          initialMessageIds = new Set(recent.map((item: any) => String(item.id || "")))
          // Only the target reply may be reused for a new alternative; retain
          // its exact old source rather than using a lossy text fingerprint.
          const previous = recent.find((item: any) => String(item.id) === target)
          if (previous) {
            initialSwipeText = new Map()
            const active = this.swipeIndex(previous.swipe_id) ?? 0
            const swipes = Array.isArray(previous.swipes) && previous.swipes.length ? previous.swipes : [previous.content]
            swipes.forEach((value: unknown, index: number) => {
              const text = index === active ? previous.content : value
              if (typeof text === "string") initialSwipeText!.set(String(index), text.replace(/\r\n/g, "\n").trim())
            })
          }
        }
      } catch { /* Compatibility: no inferred owner without a baseline. */ }
      this.streams.set(id, { id, chatId, target, owner: target || `inline-stream:${id}`, swipeId: this.swipeIndex(payload.targetSwipeId),
        source: "", gap: false, stopped: false, background, initialMessageIds, initialSwipeText, initialTarget: target, aliases: new Set(target ? [target] : []), requests: new Map() })
      if (this.streams.size > 16) this.streams.delete(this.streams.keys().next().value!)
      return
    }
    const stream = this.streams.get(id) || this.terminalStreams.get(id)
    if (!stream || stream.chatId !== chatId || stream.background) return
    if (name === "STREAM_TOKEN_RECEIVED") {
      if (stream.stopped || stream.gap || typeof payload.token !== "string") return
      // Current hosts expose text offsets; older hosts expose a monotonic
      // sequence instead. Never concatenate replays or a known missing prefix.
      const seq = typeof payload.seq === "number" && Number.isSafeInteger(payload.seq) && payload.seq >= 0 ? payload.seq : undefined
      const replay = seq !== undefined && stream.seq !== undefined && seq <= stream.seq
      if (seq !== undefined && !replay) {
        if (stream.seq === undefined ? seq > 1 : seq !== stream.seq + 1) stream.seqGap = true
        stream.seq = seq
      }
      if (payload.type === "reasoning") return
      if (payload.offset === undefined && replay) return
      const offset = payload.offset !== undefined ? payload.offset : seq !== undefined && !stream.seqGap ? stream.source.length : undefined
      const previousLength = stream.source.length
      const next = theaterLiveAppend(stream.source, payload.token, offset)
      stream.source = next.value; stream.gap = next.gap
      // Do not rescan an ever-growing reply on every ordinary prose token.
      if (!next.gap && next.value.slice(previousLength).includes(">")) for (const tag of inlineStreamTags(stream.source)) this.submitStreamTag(stream, tag)
      return
    }
    if (name === "GENERATION_STOPPED") { stream.stopped = true; return }
    if (name !== "GENERATION_ENDED") return
    if (this.terminalStreams.has(id)) {
      // A corrected terminal event is evidence, not a new generation. The
      // backend decides which snapshot matches the persisted reply.
      const correctedId = String(payload.messageId || "")
      const correctedContent = typeof payload.content === "string" ? payload.content : ""
      if (correctedId) { stream.target = correctedId; stream.terminalMessageId = correctedId; stream.aliases.add(correctedId) }
      const correctedSwipe = this.swipeIndex(payload.swipeId ?? payload.targetSwipeId)
      if (correctedSwipe !== undefined) stream.swipeId = correctedSwipe
      if (correctedContent) { stream.terminalContent = correctedContent; this.submitStreamSettlement(stream, correctedContent) }
      else if (correctedId && stream.terminalContent) this.submitStreamSettlement(stream, stream.terminalContent)
      return
    }
    const wasStopped = stream.stopped
    stream.stopped = true
    stream.terminalMessageId = String(payload.messageId || "") || undefined
    stream.target = stream.terminalMessageId || stream.target || ""
    if (stream.target) stream.aliases.add(stream.target)
    const terminalSwipe = this.swipeIndex(payload.swipeId ?? payload.targetSwipeId)
    if (terminalSwipe !== undefined) stream.swipeId = terminalSwipe
    this.streams.delete(id); this.terminalStreams.set(id, stream)
    if (this.terminalStreams.size > 16) this.terminalStreams.delete(this.terminalStreams.keys().next().value!)
    // A separate settlement message does not queue behind the GPU request.
    // The backend also consumes its own terminal event and validates both
    // paths against the persisted assistant reply before writing anything.
    const suppliedContent = typeof payload.content === "string" ? payload.content : ""
    // A terminal ID-only event can use the contiguous stream as proof for
    // reserved jobs. The backend still verifies the entire saved reply.
    const finalContent = suppliedContent || (!wasStopped && !stream.gap && !stream.seqGap ? stream.source : "")
    stream.terminalContent = finalContent || undefined
    if (stream.target && finalContent) {
      // A missing token prefix is not a new owner. Recover only complete
      // terminal packets in this same generation and preserve reserved slots.
      if (!wasStopped && suppliedContent) for (const tag of inlineStreamTags(finalContent)) this.submitStreamTag(stream, tag)
      // A target from GENERATION_STARTED may still point at the previous
      // turn. Do not advertise it as terminal authority without an end ID.
      if (stream.terminalMessageId && stream.requests.size) this.submitStreamSettlement(stream, finalContent)
    }
  }

  private submitStreamSettlement(stream: InlineTagStream, content: string): void {
    const receipt = JSON.stringify([stream.target, stream.swipeId, content])
    if (!stream.target || !content || stream.settlementContent === receipt || !inlineStreamTags(content).some(tag => {
      const reserved = stream.requests.get(inlineRequestSlot(tag))
      return reserved && inlinePacketIdentity(reserved) === inlinePacketIdentity(tag)
    })) return
    try {
      this.ctx.sendToBackend({ type: "settle_tagged_generation", requestId: createRequestId(), chatId: stream.chatId,
        messageId: stream.target, generationId: stream.id, swipeId: stream.swipeId, content })
      stream.settlementContent = receipt
    } catch { /* Backend terminal event remains available. */ }
  }

  setBehavior(behavior: StudioBehavior): void {
    this.behavior = { ...behavior }
  }

  handleTag(payload: any): void {
    if (this.destroyed || !payload?.chatId || !payload?.messageId || payload?.isUser) return
    this.sourceSnapshot = null
    const match = String(payload.fullMatch || "")
    const chatId = String(payload.chatId), messageId = String(payload.messageId)
    const selected = this.selectedMessage(chatId, messageId)
    const explicitSwipe = this.swipeIndex(payload.swipeId ?? payload.targetSwipeId)
    const selectedSwipe = this.swipeIndex(selected?.swipe_id)
    const incomingSwipe = explicitSwipe ?? (payload.isStreaming !== true ? selectedSwipe : undefined)
    const tag = inlineStreamTags(match)[0]
    const explicitGeneration = String(payload.generationId || "")
    if (tag) {
      const slot = inlineRequestSlot(tag)
      const compatible = (stream: InlineTagStream) => stream.chatId === chatId && !stream.background
        && (incomingSwipe === undefined || stream.swipeId === undefined || incomingSwipe === stream.swipeId)
      const active = [...this.streams.values()].filter(stream => compatible(stream) && (explicitGeneration
        ? stream.id === explicitGeneration
        : stream.aliases.has(messageId) || stream.target === messageId || stream.owner === messageId
          || (!stream.target && (payload.isStreaming === true || stream.requests.has(slot)))
          || (stream.requests.has(slot) && inlinePacketIdentity(stream.requests.get(slot)!) === inlinePacketIdentity(tag))))
      if (active.length === 1) {
        const stream = active[0]
        stream.aliases.add(messageId)
        if (!stream.requests.size && !stream.target && payload.isStreaming === true) stream.owner = messageId
        if (!stream.stopped && (explicitGeneration || inlineStreamTags(stream.source).some(t => inlinePacketIdentity(t) === inlinePacketIdentity(tag)))) this.submitStreamTag(stream, tag)
        // Never use a render-time callback as proof that an in-flight stream
        // ended. The terminal event or a saved reply after it owns settlement.
        return
      }
      if (active.length > 1) return // defer ambiguous delivery to the terminal event
      const normalizeReply = (value: unknown) => typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : ""
      const fullTextMatches = (stream: InlineTagStream) => typeof selected?.content === "string" && !!stream.terminalContent
        && normalizeReply(selected.content) === normalizeReply(stream.terminalContent)
      const uniqueNewOwner = (stream: InlineTagStream) => {
        if (!stream.initialMessageIds || !fullTextMatches(stream)) return false
        // Whole-reply equality is evidence only if exactly one newly visible
        // assistant message/alternative matches. A known regeneration target
        // also qualifies when its explicitly named swipe changed since start.
        const recent = this.sourceSnapshot || []
        const matches = recent.filter(item => item && (!item.chat_id || item.chat_id === chatId) && !item.is_user && (!item.role || item.role === "assistant")).flatMap(item => {
          const id = String(item.id)
          const active = this.swipeIndex(item.swipe_id) ?? 0
          const swipes = Array.isArray(item.swipes) && item.swipes.length ? item.swipes : [item.content]
          return swipes.flatMap((value: unknown, index: number) => {
            const text = normalizeReply(index === active ? item.content : value)
            if (text !== normalizeReply(stream.terminalContent)) return []
            if (!stream.initialMessageIds!.has(id)) return [{ id, index }]
            if (id !== stream.initialTarget || id !== stream.target || stream.swipeId !== index || !stream.initialSwipeText) return []
            if (stream.initialSwipeText.get(String(index)) === text) return []
            return [{ id, index }]
          })
        })
        return matches.length === 1 && matches[0].id === messageId
          && (incomingSwipe === undefined || incomingSwipe === matches[0].index)
      }
      const terminals = [...this.terminalStreams.values()].filter(stream => compatible(stream)
        && (explicitGeneration ? stream.id === explicitGeneration : stream.aliases.has(messageId) || stream.target === messageId
          || (!stream.terminalMessageId && payload.isStreaming !== true && uniqueNewOwner(stream)))
        && stream.requests.has(slot)
        && (explicitGeneration || inlinePacketIdentity(stream.requests.get(slot)!) === inlinePacketIdentity(tag)))
      if (terminals.length === 1) {
        const terminal = terminals[0]
        if (payload.isStreaming !== true && typeof selected?.content === "string" && fullTextMatches(terminal)
            && (explicitSwipe === undefined || selectedSwipe === undefined || explicitSwipe === selectedSwipe)) {
          if (!terminal.terminalMessageId && uniqueNewOwner(terminal)) {
            terminal.target = messageId; terminal.terminalMessageId = messageId; terminal.aliases.add(messageId)
          }
          if (terminal.terminalMessageId === messageId) {
            if (incomingSwipe !== undefined) terminal.swipeId = incomingSwipe
            this.submitStreamSettlement(terminal, selected.content)
          }
        }
        return
      }
      if (terminals.length > 1) return
      // An interceptor can beat GENERATION_STARTED. Retain the host-provided
      // generation ID below; never silently downgrade it to a legacy owner.
    }
    const slot = tag ? inlineRequestSlot(tag) : String(payload?.attrs?.slot || `image-${widgetKeyHash(String(payload.fullMatch || payload.content)).slice(0, 6)}`)
      .replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80)
    const fingerprint = widgetKeyHash(String(payload.fullMatch || payload.content || ""))
    const packetFingerprint = tag ? widgetKeyHash(inlinePacketIdentity(tag)) : undefined
    const samePacket = (job: TaggedImageJobView) => job.tagFingerprint === fingerprint || (!!packetFingerprint && job.packetFingerprint === packetFingerprint)
    const selectedKnown = [...this.jobs.values()].find(job => job.chatId === chatId
      && job.messageId === messageId && samePacket(job) && this.isSelected(job)
      && (!explicitGeneration || !job.generationId || job.generationId === explicitGeneration))
    if (payload.isStreaming === true && selectedKnown?.inserted) return
    const swipeId = explicitSwipe ?? (payload.isStreaming !== true && (selectedKnown || String(selected?.content || "").includes(match))
      ? selectedSwipe : undefined)
    const lookup = this.lookupKey(String(payload.chatId), String(payload.messageId), slot, swipeId)
    this.tagPayloads.set(lookup, { ...payload, slot, swipeId })
    // The interceptor sees the same tag while the assistant is streaming and
    // again after Lumiverse commits the finished message. Generation may beat
    // that commit, so treat the non-streaming pass as the attachment boundary.
    if (payload.isStreaming !== true) {
      this.settledTagLookups.add(lookup)
      const candidates = [...this.jobs.values()].filter(job => !job.generationId && !job.inserted && job.chatId === chatId
        && job.slot === slot && samePacket(job) && (job.swipeId === undefined || job.swipeId === swipeId)
        && (job.messageId === messageId || !this.selectedMessage(job.chatId, job.messageId)?.content))
      if (candidates.length === 1 && !candidates[0].id.startsWith("pending-")) {
        const existing = candidates[0]
        // Backend verifies the owner and merges settlement into the latest
        // record. Do not optimistically change the selected swipe here.
        if (existing.awaitingSource && typeof selected?.content === "string" && selected.content.includes(match)) {
          const settlementKey = `${existing.id}:${messageId}:${swipeId ?? ""}`
          if (!this.settledAttachmentRequests.has(settlementKey)) {
            this.settledAttachmentRequests.add(settlementKey)
            this.ctx.sendToBackend({ type: "settle_tagged_generation", requestId: createRequestId(), chatId, messageId,
              swipeId, content: selected.content })
          }
        }
      }
    }
    if (payload.isStreaming !== true && explicitGeneration && tag) {
      // Even after controller remount, a host-supplied generation ID on a
      // final callback can carry canonical settlement independently of GPU
      // admission. Preserve background swipe ownership when the host exposes it.
      const alternatives = Array.isArray(selected?.swipes) && selected.swipes.length
        ? selected.swipes.map((value: unknown, index: number) => ({ swipeId: index, content: index === selectedSwipe ? selected.content : value }))
        : [{ swipeId: selectedSwipe ?? explicitSwipe, content: selected?.content }]
      const matches = alternatives.filter((item: {swipeId?: number; content: unknown}) => (explicitSwipe === undefined || explicitSwipe === item.swipeId)
        && typeof item.content === "string" && inlineStreamTags(item.content).filter(t => inlinePacketIdentity(t) === inlinePacketIdentity(tag)).length === 1)
      if (matches.length === 1) {
        const source = matches[0]
        const proofKey = `settle:${lookup}:${explicitGeneration}:${source.swipeId ?? ""}`
        const proofFingerprint = widgetKeyHash(String(source.content))
        if (this.tagFingerprints.get(proofKey) !== proofFingerprint) {
          try {
            this.ctx.sendToBackend({ type: "settle_tagged_generation", requestId: createRequestId(), chatId, messageId,
              generationId: explicitGeneration, swipeId: source.swipeId, content: source.content })
            this.tagFingerprints.set(proofKey, proofFingerprint)
          } catch { /* Host terminal event remains authoritative. */ }
        }
      }
    }
    const receipt = explicitGeneration ? `${lookup}:generation:${explicitGeneration}` : lookup
    if (this.tagFingerprints.get(receipt) === fingerprint) return
    this.tagFingerprints.set(receipt, fingerprint)
    const known = [...this.jobs.values()].find((job) =>
      this.lookupKey(job.chatId, job.messageId, job.slot, job.swipeId) === lookup
      && samePacket(job) && (!explicitGeneration || !job.generationId || job.generationId === explicitGeneration),
    )
    if (known) return
    for (const [id, existing] of this.jobs) {
      if (!id.startsWith("pending-") || this.lookupKey(existing.chatId, existing.messageId, existing.slot, existing.swipeId) !== lookup
        || (explicitGeneration && existing.generationId !== explicitGeneration)) continue
      this.remove(existing)
      this.jobs.delete(id)
    }
    const optimistic: TaggedImageJobView = {
      id: `pending-${widgetKeyHash(`${receipt}:${fingerprint}`)}`,
      key: lookup,
      swipeId,
      tagFingerprint: fingerprint, packetFingerprint, generationId: explicitGeneration || undefined,
      chatId: String(payload.chatId),
      messageId: String(payload.messageId),
      slot,
      prompt: String(payload.content || "").trim(),
      output: String(payload?.attrs?.output || "").trim().toLowerCase() === "url" ? "url" : "inline",
      negativePrompt: "",
      aspect: String(payload?.attrs?.aspect || ""),
      alt: String(payload?.attrs?.alt || ""),
      // The backend owns automation policy. A stale local preference must not
      // flash a manual Generate card before its authoritative reply arrives.
      status: "queued",
      clientJobId: "",
      imageId: "",
      imageUrl: "",
      inserted: false,
      error: "",
    }
    this.jobs.set(optimistic.id, optimistic)
    this.sendJobRequest(optimistic, {
      type: "tag_generate",
      requestId: createRequestId(),
      chatId: payload.chatId,
      messageId: payload.messageId,
      fullMatch: payload.fullMatch,
      generationId: explicitGeneration || undefined,
      swipeId,
      attrs: payload.attrs,
      content: payload.content,
      isStreaming: payload.isStreaming === true,
    })
  }

  onMessage(payload: any): void {
    if (this.destroyed) return
    this.sourceSnapshot = null
    if (payload?.type === "inline_variant_result" || payload?.type === "studio_error") {
      const requestId = String(payload.requestId)
      this.variantRequests.delete(requestId)
      const replacement = this.replacementRequests.get(requestId)
      if (replacement) {
        window.clearTimeout(replacement.timer)
        this.replacementRequests.delete(requestId)
        if (payload.type === "studio_error") replacement.reject(new Error(String(payload.error || "The chat image could not be replaced.")))
        else replacement.resolve()
      }
    }
    if (payload?.type === "tagged_request_deferred") {
      const requestId = String(payload.requestId || "")
      const id = this.jobRequests.get(requestId)
      if (id) {
        this.jobRequests.delete(requestId)
        const pending = this.jobs.get(id)
        if (pending && id.startsWith("pending-")) {
          this.remove(pending); this.jobs.delete(id)
          if (payload.data?.reason === "saved-source-not-proven") {
            const receipt = pending.generationId ? `${pending.key}:generation:${pending.generationId}` : pending.key
            this.tagFingerprints.delete(receipt)
          }
        }
      }
      return
    }
    if (payload?.type === "studio_error" && this.jobRequests.has(String(payload.requestId))) {
      const requestId = String(payload.requestId)
      const job = this.jobs.get(this.jobRequests.get(requestId)!)
      this.jobRequests.delete(requestId)
      if (job && !this.removedJobs.has(job.id)) {
        job.status = "failed"
        job.error = String(payload.error || "The image request could not be started.")
        this.refreshJobWidget(job)
      }
      return
    }
    if (payload?.type === "tagged_image_removed") {
      this.reconcileMessage({ ...payload.data, removed: true })
      return
    }
    if (payload?.type === "tagged_message_reconciled") {
      this.reconcileMessage(payload.data)
      return
    }
    if (payload?.type === "tagged_image_jobs_result") {
      const jobs = Array.isArray(payload.data) ? payload.data as TaggedImageJobView[] : []
      const savedIds = new Set(jobs.map(job => job.id))
      for (const [id, known] of this.jobs) {
        const predatesSnapshot = typeof payload.snapshotAt !== "number" || Number(known.updatedAt || 0) < payload.snapshotAt
        if (!id.startsWith("pending-") && !savedIds.has(id) && predatesSnapshot) {
          this.remove(known); this.jobs.delete(id); this.acknowledgeJob(id)
        }
      }
      for (const incoming of jobs) {
        if (!incoming?.id || !incoming?.messageId || this.removedJobs.has(incoming.id)) continue
        const job = this.latestJobState(incoming)
        for (const [id, candidate] of this.jobs) {
          if (id.startsWith("pending-") && candidate.chatId === job.chatId && candidate.messageId === job.messageId
            && candidate.slot === job.slot && (!candidate.generationId || candidate.generationId === job.generationId) && (candidate.swipeId === undefined || candidate.swipeId === job.swipeId)
            && (!candidate.tagFingerprint || !job.tagFingerprint || candidate.tagFingerprint === job.tagFingerprint || (!!candidate.packetFingerprint && candidate.packetFingerprint === job.packetFingerprint))) {
            this.remove(candidate); this.jobs.delete(id); this.acknowledgeJob(id)
          }
        }
        const previous = this.jobs.get(job.id)
        if (previous && previous.messageId !== job.messageId) this.remove(previous)
        this.jobs.set(job.id, job)
        this.acknowledgeJob(job.id)
        this.settledAttachmentRequests.delete(job.id)
        this.retrySettledAttachment(job)
        this.refreshJobWidget(job)
        if (job.inserted && job.status === "ready" && job.imageUrl && (!previous?.inserted || previous.imageUrl !== job.imageUrl || previous.messageId !== job.messageId)) this.scheduleHydration(job)
      }
      return
    }
    if (payload?.type === "tagged_image_job") {
      const job = payload.data as TaggedImageJobView
      if (!job?.id || !job?.messageId || this.removedJobs.has(job.id)) return
      for (const [id, candidate] of this.jobs) {
        if (id.startsWith("pending-") && candidate.chatId === job.chatId && candidate.messageId === job.messageId
            && candidate.slot === job.slot && (!candidate.generationId || candidate.generationId === job.generationId) && (candidate.swipeId === undefined || candidate.swipeId === job.swipeId)
            && (!candidate.tagFingerprint || !job.tagFingerprint || candidate.tagFingerprint === job.tagFingerprint || (!!candidate.packetFingerprint && candidate.packetFingerprint === job.packetFingerprint))) {
          this.remove(candidate)
          this.jobs.delete(id)
          this.acknowledgeJob(id)
        }
      }
      this.acknowledgeJob(job.id)
      const previous = this.jobs.get(job.id)
      if (Number(previous?.updatedAt || 0) > Number(job.updatedAt || 0)) return
      const next = { ...previous, ...this.latestJobState(job) }
      if (previous && previous.messageId !== next.messageId) this.remove(previous)
      this.jobs.set(job.id, next)
      if (next.inserted) {
        this.settledAttachmentRequests.delete(next.id)
        this.settledMessageTargets.delete(next.id)
      } else {
        this.retrySettledAttachment(next)
      }
      this.refreshJobWidget(next)
      // Recover even if the separate reconciliation notification is lost.
      if (next.inserted && next.status === "ready" && next.imageUrl && (!previous?.inserted || previous.imageUrl !== next.imageUrl || previous.messageId !== next.messageId)) this.scheduleHydration(next)
      return
    }
  }

  destroy(): void {
    this.destroyed = true
    this.streams.clear(); this.terminalStreams.clear()
    this.clearHydrationTimers()
    this.promptDiagnostics?.remove(); this.promptDiagnostics = null
    this.closeImageMenu?.()
    this.urlActionJobs.clear()
    for (const id of this.urlActions.keys()) this.removeUrlAction(id)
    this.stopUrlActionObserver()
    this.recoveredObserver?.disconnect()
    this.recoveredObserver = null
    this.recoveredJobs.clear()
    window.removeEventListener("click", this.handleInlineClick, true)
    window.removeEventListener("contextmenu", this.handleInlineContextMenu, true)
    window.removeEventListener("keydown", this.handleInlineKeyDown, true)
    for (const cleanup of this.cleanups.values()) cleanup()
    this.cleanups.clear()
    this.jobs.clear()
    this.tagPayloads.clear()
    this.tagFingerprints.clear()
    this.settledTagLookups.clear()
    this.settledAttachmentRequests.clear()
    this.settledMessageTargets.clear()
    for (const cleanup of this.selectionCleanups) cleanup()
    this.selectionCleanups.length = 0
    this.jobRequests.clear()
    this.variantRequests.clear()
    for (const request of this.replacementRequests.values()) {
      window.clearTimeout(request.timer)
      request.reject(new Error("Swarm Studio closed. Check the chat before retrying."))
    }
    this.replacementRequests.clear()
    this.widgetHtml.clear()
    this.selectedMessages.clear()
    this.removedJobs.clear()
    this.retiredAttempts.clear()
  }

  private retrySettledAttachment(job: TaggedImageJobView): void {
    if (job.generationId || job.status !== "ready" || job.inserted || !job.id) return
    const messageId = this.settledMessageTargets.get(job.id) || job.messageId
    const lookup = this.lookupKey(job.chatId, messageId, job.slot, job.swipeId)
    if (!this.settledTagLookups.has(lookup) || this.settledAttachmentRequests.has(job.id)) return
    this.settledAttachmentRequests.add(job.id)
    this.ctx.sendToBackend({
      type: "retry_tagged_attachment",
      requestId: createRequestId(),
      jobId: job.id,
      messageId,
      swipeId: job.swipeId,
    })
  }

  private lookupKey(chatId: string, messageId: string, slot: string, swipeId?: number): string {
    return `${chatId}:${messageId}:${slot}:${swipeId ?? ""}`
  }

  private widgetId(job: TaggedImageJobView): string {
    return `swarm-studio-image-${widgetKeyHash(`${job.chatId}:${job.messageId}:${job.id}`)}`
  }

  private inlineFigureForJob(jobId: string): HTMLElement | null {
    for (const figure of document.querySelectorAll<HTMLElement>('figure[data-swarm-studio-image="true"]')) {
      if (figure.dataset.swarmStudioJobId === jobId) return figure
    }
    return null
  }

  private inlineJobFromTarget(target: HTMLElement | null): { figure: HTMLElement; job: TaggedImageJobView } | null {
    const figure = target?.closest<HTMLElement>('figure[data-swarm-studio-image="true"][data-swarm-studio-job-id]')
    const jobId = figure?.dataset.swarmStudioJobId || ""
    if (!figure || !jobId) return null
    const known = this.jobs.get(jobId)
    if (known) return { figure, job: known }
    return {
      figure,
      job: {
        id: jobId,
        key: "",
        chatId: "",
        messageId: "",
        slot: figure.dataset.swarmStudioSlot || "image",
        prompt: "",
        negativePrompt: "",
        aspect: "",
        alt: figure.querySelector<HTMLImageElement>("img")?.alt || "Generated illustration",
        status: "ready",
        clientJobId: "",
        imageId: "",
        imageUrl: figure.querySelector<HTMLImageElement>("img")?.src || "",
        inserted: true,
        error: "",
      },
    }
  }

  private jobForAction(action: HTMLElement): TaggedImageJobView | undefined {
    const urlId = action.dataset.swarmStudioUrlAction
    return urlId ? this.jobs.get(urlId) : this.inlineJobFromTarget(action)?.job
  }

  private urlJobFromEvent(event: MouseEvent): TaggedImageJobView | undefined {
    const media = this.eventClosest<HTMLImageElement | HTMLAnchorElement>(event, "img[src], a[href]")
    const messageId = this.eventClosest<HTMLElement>(event, "[data-message-id]")?.dataset.messageId
    if (!media || !messageId) return
    const url = media.tagName === "IMG" ? (media as HTMLImageElement).src : (media as HTMLAnchorElement).href
    this.sourceSnapshot = null
    const matches = [...this.jobs.values()].filter(job => {
      if (job.output !== "url" || !job.inserted || !job.imageId || job.messageId !== messageId || !this.isSelected(job)) return false
      try { return new URL(job.imageUrl, window.location.href).href === url } catch { return false }
    })
    return matches.length === 1 ? matches[0] : undefined
  }

  private readonly scheduleUrlActions = () => {
    if (this.urlActionFrame || !this.urlActionJobs.size || !window.requestAnimationFrame) return
    this.urlActionFrame = window.requestAnimationFrame(() => {
      this.urlActionFrame = 0
      this.sourceSnapshot = null
      for (const id of this.urlActionJobs) {
        const job = this.jobs.get(id)
        if (job && this.isSelected(job)) this.renderUrlImageActions(job)
        else if (job) this.remove(job)
      }
    })
  }

  private stopUrlActionObserver(): void {
    this.urlActionObserver?.disconnect()
    this.urlActionObserver = null
    window.removeEventListener("lumiverse:message-content-layout", this.scheduleUrlActions)
    window.removeEventListener("resize", this.scheduleUrlActions)
    if (this.urlActionFrame) window.cancelAnimationFrame(this.urlActionFrame)
    this.urlActionFrame = 0
  }

  private removeUrlAction(id: string): void {
    const action = this.urlActions.get(id)
    action?.events.abort()
    action?.resize?.disconnect()
    action?.button.remove()
    this.urlActions.delete(id)
  }

  private mountUrlAction(job: TaggedImageJobView): boolean {
    if (!window.CSS?.escape) return false
    const selector = `[data-message-id="${window.CSS.escape(job.messageId)}"]`
    const matches = new Set<HTMLImageElement>()
    let expectedUrl: string
    try { expectedUrl = new URL(job.imageUrl, window.location.href).href } catch { return false }
    for (const message of document.querySelectorAll<HTMLElement>(selector)) {
      const roots = [message, ...Array.from(message.querySelectorAll("[data-lumiverse-html-island]"), island => island.shadowRoot)]
      for (const root of roots) {
        for (const image of root?.querySelectorAll<HTMLImageElement>("img[src]") || []) {
          if (image.src === expectedUrl && image.getClientRects().length) matches.add(image)
        }
      }
    }
    if (matches.size !== 1) return false
    const image = matches.values().next().value!
    const imageRoot = image.getRootNode()
    let host = (imageRoot instanceof window.ShadowRoot ? imageRoot.host : image).closest<HTMLElement>(selector)
    while (host && getComputedStyle(host).position === "static") host = host.parentElement?.closest<HTMLElement>(selector) ?? null
    if (!host?.offsetWidth) return false
    const bounds = image.getBoundingClientRect()
    if (bounds.width < 36 || bounds.height < 36) return false
    let action = this.urlActions.get(job.id)
    if (action?.image !== image || action.button.parentElement !== host) {
      this.removeUrlAction(job.id)
      const button = element("button", "ss-url-image-action")
      button.type = "button"
      button.dataset.swarmStudioInlineAction = "true"
      button.dataset.swarmStudioUrlAction = job.id
      button.setAttribute("aria-haspopup", "menu")
      button.innerHTML = INLINE_IMAGE_ACTION_ICON
      const events = new AbortController()
      const updateHover = (hovered: boolean) => button.toggleAttribute("data-image-hovered", hovered)
      image.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") updateHover(true) }, { signal: events.signal })
      image.addEventListener("pointerleave", () => updateHover(false), { signal: events.signal })
      updateHover(image.matches(":hover"))
      const resize = typeof ResizeObserver === "function" ? new ResizeObserver(this.scheduleUrlActions) : undefined
      resize?.observe(image)
      resize?.observe(host)
      host.append(button)
      action = { image, button, events, resize }
      this.urlActions.set(job.id, action)
    }
    const name = job.alt || job.slot || "Illustration"
    action.button.setAttribute("aria-label", `Illustration actions for ${name}`)
    action.button.title = "Image actions"
    const hostBounds = host.getBoundingClientRect()
    const scale = hostBounds.width / host.offsetWidth || 1
    action.button.style.left = `${(bounds.right - hostBounds.left) / scale - host.clientLeft + host.scrollLeft - 6}px`
    action.button.style.top = `${(bounds.top - hostBounds.top) / scale - host.clientTop + host.scrollTop + 6}px`
    return true
  }

  private renderUrlImageActions(job: TaggedImageJobView): void {
    if (!this.editInlineImage || !job.imageId) { this.remove(job); return }
    this.urlActionJobs.add(job.id)
    if (!this.urlActionObserver) {
      this.urlActionObserver = new MutationObserver(this.scheduleUrlActions)
      this.urlActionObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] })
      window.addEventListener("lumiverse:message-content-layout", this.scheduleUrlActions)
      window.addEventListener("resize", this.scheduleUrlActions)
    }
    if (this.mountUrlAction(job)) { this.removeWidget(job); return }
    this.removeUrlAction(job.id)
    const label = widgetEscape(job.alt || job.slot || "Illustration")
    const html = `<style>
      :root{color-scheme:dark;font-family:system-ui,sans-serif}
      body{margin:0;color:var(--lumiverse-text,#eee);background:transparent}
      button{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:4px 9px;border:1px solid var(--lumiverse-border,#454550);border-radius:8px;background:var(--lumiverse-fill-subtle,#191820);color:inherit;font:inherit;font-size:12px;cursor:pointer}
      button:hover,button:focus-visible{border-color:var(--lumiverse-accent,#b994ff)}
      svg{width:14px;height:14px}
    </style><button type="button" id="image-options" aria-haspopup="menu" aria-label="Illustration actions for ${label}">${INLINE_IMAGE_ACTION_ICON}<span>Image actions</span></button>
    <script>
      const button=document.getElementById('image-options')
      button.addEventListener('click',()=>{
        const {left,right,top,bottom}=button.getBoundingClientRect()
        window.spindleSandbox.postMessage({type:'menu',left,right,top,bottom})
      })
    </script>`
    this.upsertWidget(job, html, message => {
      const current = this.jobs.get(job.id) || job
      const frame = document.querySelector<HTMLIFrameElement>(`iframe[data-spindle-message-widget="${this.widgetId(job)}"]`)
      const bounds = frame?.getBoundingClientRect()
      if (frame && bounds?.width && message && [message.left, message.right, message.top, message.bottom].every(Number.isFinite)) {
        const scale = bounds.width / frame.offsetWidth || 1
        const anchor = new DOMRect(bounds.left + message.left * scale, bounds.top + message.top * scale,
          (message.right - message.left) * scale, (message.bottom - message.top) * scale)
        void this.showJobMenu(current, anchor.right, anchor.bottom, { rect: anchor })
      } else {
        void this.showJobMenu(current, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2))
      }
    })
  }

  private renderRecoveredImage(job: TaggedImageJobView): void {
    // A public message widget recovers the saved bitmap without writing stale
    // message content back to the server or starting another generation.
    if (!this.isSelected(job)) { this.remove(job); return }
    if (job.output === "url") { this.renderUrlImageActions(job); return }
    let url: URL
    try { url = new URL(job.imageUrl, window.location.href) } catch { return }
    if (!["http:", "https:"].includes(url.protocol)) return
    const html = `<style>:root{color-scheme:dark;font-family:system-ui,sans-serif}body{margin:0;background:transparent;color:var(--lumiverse-text,#eee)}button{min-height:40px;margin-top:8px;padding:8px 12px;border:1px solid var(--lumiverse-border,#454550);border-radius:8px;background:var(--lumiverse-fill-subtle,#191820);color:inherit;font:inherit}</style><div><img src="${widgetEscape(url.href)}" alt="${widgetEscape(job.alt || "Generated illustration")}" style="display:block;max-width:100%;height:auto;border-radius:8px"><button type="button" id="image-options">Image options</button></div><script>document.getElementById('image-options').addEventListener('click',()=>window.spindleSandbox.postMessage({type:'menu'}))</script>`
    this.upsertWidget(job, html, () => { void this.showJobMenu(this.jobs.get(job.id) || job, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2)) })
  }

  private watchNativeImage(job: TaggedImageJobView): void {
    this.recoveredJobs.add(job.id)
    if (!this.recoveredObserver) {
      this.recoveredObserver = new MutationObserver(() => {
        for (const id of [...this.recoveredJobs]) {
          const current = this.jobs.get(id)
          if (current && (this.inlineFigureForJob(id) || !this.isSelected(current))) this.remove(current)
        }
      })
      this.recoveredObserver.observe(document.body, { childList: true, subtree: true })
    }
  }

  private remove(job: TaggedImageJobView): void {
    if (this.urlActionJobs.delete(job.id)) {
      this.removeUrlAction(job.id)
      if (!this.urlActionJobs.size) this.stopUrlActionObserver()
    }
    this.recoveredJobs.delete(job.id)
    if (!this.recoveredJobs.size) { this.recoveredObserver?.disconnect(); this.recoveredObserver = null }
    this.removeWidget(job)
  }

  private removeWidget(job: TaggedImageJobView): void {
    const id = this.widgetId(job)
    this.cleanups.get(id)?.()
    this.cleanups.delete(id)
    this.widgetHtml.delete(id)
  }

  private latestJobState(incoming: TaggedImageJobView): TaggedImageJobView {
    const known = this.jobs.get(incoming.id)
    if (!known) return incoming
    if (Number(known.updatedAt || 0) > Number(incoming.updatedAt || 0)) return known
    if (incoming.clientJobId && this.retiredAttempts.get(incoming.id)?.has(incoming.clientJobId)) return known
    const sameAttempt = !incoming.clientJobId || incoming.clientJobId === known.clientJobId
    if (!sameAttempt && known.clientJobId) {
      const retired = this.retiredAttempts.get(incoming.id) || new Set<string>()
      retired.add(known.clientJobId)
      this.retiredAttempts.set(incoming.id, retired)
    }
    if (sameAttempt && ((known.inserted && !incoming.inserted)
      || (known.status === "ready" && ["requested", "queued", "generating"].includes(incoming.status)))) return known
    return incoming
  }

  private shouldRenderPlaceholder(job: TaggedImageJobView): boolean {
    if (job.inserted) return false
    // Automatic rendering and normal attachment are background activity.
    // Studio/Locket own live previews; only actionable recovery or manual
    // approval belongs in the conversation as a status widget.
    return job.status === "requested"
      || job.status === "failed"
      || job.status === "cancelled"
      || (job.status === "ready" && Boolean(job.error))
  }

  private reconcileMessage(value: any): void {
    const jobId = String(value?.jobId || "")
    const job = this.jobs.get(jobId)
    if (!jobId || this.destroyed) return
    if (value?.removed === true) {
      this.removedJobs.add(jobId)
      this.acknowledgeJob(jobId)
      if (job) this.remove(job)
      this.jobs.delete(jobId)
      this.settledAttachmentRequests.delete(jobId)
      this.settledMessageTargets.delete(jobId)
      return
    }
    if (!job || this.removedJobs.has(jobId)) return
    if (value?.clientJobId && value.clientJobId !== job.clientJobId) return
    // The backend has already committed the mutation. Lumiverse's native
    // MESSAGE_EDITED event refreshes the view; re-saving this snapshot here
    // could overwrite a newer swipe or a user edit.
    job.inserted = true
    job.error = ""
    if (value?.messageId && value?.chatId === job.chatId && value.messageId !== job.messageId) {
      this.remove(job)
      job.messageId = String(value.messageId)
    }
    if (this.swipeIndex(value?.swipeId) !== undefined) job.swipeId = value.swipeId
    this.refreshJobWidget(job)
    this.scheduleHydration(job)
  }

  private clearHydrationTimers(): void {
    for (const timer of this.hydrationTimers.values()) window.clearTimeout(timer)
    this.hydrationTimers.clear()
  }

  private scheduleHydration(job: TaggedImageJobView): void {
    const old = this.hydrationTimers.get(job.id)
    if (old !== undefined) window.clearTimeout(old)
    this.hydrationTimers.delete(job.id)
    const delays = [150, 450, 1000, 2000, 4000]
    // A native commit can precede the host's selected-source projection and
    // virtualized DOM. Recheck only the committed image; never re-save text
    // or re-render the GPU job to repair a stale view.
    const check = (index: number) => {
      this.hydrationTimers.delete(job.id)
      const current = this.jobs.get(job.id)
      if (this.destroyed || !current?.inserted || current.status !== "ready" || current.chatId !== this.ctx.getActiveChat?.()?.chatId) return
      this.sourceSnapshot = null
      this.refreshJobWidget(current)
      if (index < delays.length && !this.inlineFigureForJob(job.id)) this.hydrationTimers.set(job.id, window.setTimeout(() => check(index + 1), delays[index]))
    }
    this.hydrationTimers.set(job.id, window.setTimeout(() => check(1), delays[0]))
  }

  private acknowledgeJob(jobId: string): void {
    for (const [requestId, id] of this.jobRequests) if (id === jobId) this.jobRequests.delete(requestId)
  }

  private sendJobRequest(job: TaggedImageJobView, payload: any): void {
    const requestId = String(payload.requestId || createRequestId())
    this.jobRequests.set(requestId, job.id)
    try { this.ctx.sendToBackend({ ...payload, requestId }) }
    catch (error) {
      this.onMessage({ type: "studio_error", requestId, error: error instanceof Error ? error.message : String(error) })
    }
  }

  private swipeIndex(value: unknown): number | undefined {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined
  }

  private selectedMessage(chatId: string, messageId: string): any {
    const cached = this.selectedMessages.get(`${chatId}:${messageId}`)
    if (cached?.content === null) return cached
    if (this.sourceSnapshot === null) {
      const messages = this.ctx.messages?.getRecent?.(200)
      this.sourceSnapshot = Array.isArray(messages) ? messages : []
    }
    const message = this.sourceSnapshot.find((item: any) => item.id === messageId && (!item.chat_id || item.chat_id === chatId))
    if (message) return message
    if (typeof this.ctx.messages?.getContent === "function") return { content: this.ctx.messages.getContent(messageId) }
    return cached
  }

  private isSelected(job: TaggedImageJobView): boolean {
    if (this.destroyed || this.removedJobs.has(job.id) || (job.awaitingSource && job.messageId.startsWith("inline-stream:"))) return false
    const active = this.selectedChatId !== undefined ? this.selectedChatId : this.ctx.getActiveChat?.()?.chatId
    if (active !== undefined && active !== job.chatId) return false
    const message = this.selectedMessage(job.chatId, job.messageId)
    if (!message) return true // Compatibility with hosts without public source reads.
    if (job.swipeId !== undefined && this.swipeIndex(message.swipe_id) !== undefined && job.swipeId !== message.swipe_id) return false
    const source = typeof message.content === "string" ? message.content : ""
    if (source.includes(`data-swarm-studio-job-id="${job.id}"`)) return true
    if (job.output === "url" && job.inserted && job.imageUrl && source.includes(job.imageUrl)) return true
    for (const match of source.matchAll(/<swarm-image\b[^>]*>((?:(?!<swarm-image\b)[\s\S])*?)<\/swarm-image\s*>/gi)) {
      if (job.tagFingerprint && widgetKeyHash(match[0]) === job.tagFingerprint) return true
    }
    if (job.packetFingerprint && inlineStreamTags(source).some(tag => widgetKeyHash(inlinePacketIdentity(tag)) === job.packetFingerprint)) return true
    const stream = job.generationId ? this.streams.get(job.generationId) : undefined
    return !!(job.awaitingSource && stream && !stream.stopped && stream.target === job.messageId
      && stream.swipeId !== undefined && stream.swipeId === this.swipeIndex(message.swipe_id) && stream.requests.has(job.slot))
  }

  private onSelectionEvent(name: string, payload: any): void {
    if (this.destroyed) return
    this.sourceSnapshot = null
    if (name === "CHAT_SWITCHED" || name === "MESSAGE_SWIPED") this.closeImageMenu?.()
    if (name === "CHAT_SWITCHED") {
      this.selectedChatId = typeof payload?.chatId === "string" ? payload.chatId : null
      this.selectedMessages.clear()
      this.clearHydrationTimers()
    }
    const message = payload?.message
    const chatId = String(payload?.chatId || message?.chat_id || "")
    const messageId = String(message?.id || payload?.messageId || "")
    if (chatId && messageId) {
      if (name === "MESSAGE_DELETED") this.selectedMessages.set(`${chatId}:${messageId}`, { content: null })
      else if (message && typeof message.content === "string") this.selectedMessages.set(`${chatId}:${messageId}`, message)
      else this.selectedMessages.delete(`${chatId}:${messageId}`)
    }
    for (const job of this.jobs.values()) this.refreshJobWidget(job)
  }

  private refreshJobWidget(job: TaggedImageJobView): void {
    if (!this.isSelected(job)) { this.remove(job); return }
    const figure = this.inlineFigureForJob(job.id)
    if (figure) { figure.dataset.state = job.inserted ? "ready" : job.status; this.remove(job) }
    else if (job.inserted && job.status === "ready" && job.imageUrl) this.renderRecoveredImage(job)
    else if (this.shouldRenderPlaceholder(job)) this.render(job)
    else this.remove(job)
  }

  private upsertWidget(job: TaggedImageJobView, html: string, handler: (message: any) => void): void {
    const widgetId = this.widgetId(job)
    if (this.widgetHtml.get(widgetId) === html && this.cleanups.has(widgetId)) return
    this.cleanups.get(widgetId)?.()
    this.widgetHtml.set(widgetId, html)
    this.cleanups.set(widgetId, this.ctx.messages.renderWidget({ messageId: job.messageId, widgetId, html }, (message: any) => {
      if (!this.destroyed && !this.removedJobs.has(job.id) && this.isSelected(this.jobs.get(job.id) || job)) handler(message)
    }))
    if (job.output !== "url") this.watchNativeImage(job)
  }

  private render(job: TaggedImageJobView): void {
    if (!this.isSelected(job) || this.inlineFigureForJob(job.id) || !this.shouldRenderPlaceholder(job)) {
      this.remove(job)
      return
    }
    const widgetId = this.widgetId(job)
    const labels: Record<TaggedImageJobView["status"], string> = {
      requested: "Illustration requested",
      queued: "Queued for SwarmUI",
      generating: "Rendering in SwarmUI",
      ready: job.awaitingSource && !job.error ? "Illustration ready · waiting for reply" : "Illustration ready",
      failed: "Illustration unavailable",
      cancelled: "Illustration stopped",
    }
    const action = job.status === "requested"
      ? `<button class="primary" data-action="generate">Generate image</button>`
      : job.status === "ready" && !job.inserted && job.error
        ? `<button class="primary" data-action="attach">Attach image</button>`
      : job.status === "failed" || job.status === "cancelled"
        ? `<button class="primary" data-action="retry">Retry</button>`
        : ""
    const error = job.error ? `<p class="error">${widgetEscape(job.error)}</p>` : ""
    const html = `
      <style>
        :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        body { margin: 0; min-width: 0; color: var(--lumiverse-text, #f5f5f7); background: transparent; }
        .card { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 13px; width: 100%; min-height: 104px; padding: 13px 14px; border: 1px dashed color-mix(in srgb, var(--lumiverse-accent, #b994ff) 34%, var(--lumiverse-border, #35313f)); border-radius: var(--lumiverse-radius, 12px); background: color-mix(in srgb, var(--lumiverse-accent, #b994ff) 5%, var(--lumiverse-fill, #111116)); }
        .emblem { display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto; color: var(--lumiverse-accent, #b994ff); border: 1px solid var(--lumiverse-border, #35313f); border-radius: calc(var(--lumiverse-radius, 12px) * .72); background: var(--lumiverse-fill-subtle, #191820); }
        .emblem svg { width: 22px; height: 22px; fill: currentColor; }
        .copy { min-width: 0; display: grid; gap: 4px; text-align: left; }
        strong { display: block; font: 600 14px/1.2 Georgia, ui-serif, serif; letter-spacing: .01em; }
        p { margin: 0; color: var(--lumiverse-text-muted, #aaa6b1); font-size: 11px; line-height: 1.35; overflow-wrap: anywhere; }
        .description { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
        .error { color: #ff9caa; }
        .actions { display: flex; flex: 0 0 auto; justify-content: flex-end; align-items: center; gap: 6px; }
        button { min-height: 32px; padding: 0 11px; border: 1px solid var(--lumiverse-border, #35313f); border-radius: calc(var(--lumiverse-radius, 12px) * .65); background: var(--lumiverse-fill-subtle, #191820); color: var(--lumiverse-text, #f5f5f7); font: 650 10px/1 system-ui, sans-serif; white-space: nowrap; cursor: pointer; }
        button:hover { border-color: var(--lumiverse-accent, #b994ff); }
        button.primary { border-color: color-mix(in srgb, var(--lumiverse-accent, #b994ff) 54%, var(--lumiverse-border, #35313f)); background: color-mix(in srgb, var(--lumiverse-accent, #b994ff) 16%, var(--lumiverse-fill-subtle, #191820)); }
        .menu { width: 32px; padding: 0; font-size: 16px; }
        @media (max-width: 520px) { .card { grid-template-columns: auto minmax(0, 1fr); gap: 9px 11px; min-height: 112px; padding: 11px; } .emblem { width: 38px; height: 38px; grid-row: 1 / span 2; } .actions { grid-column: 2; justify-content: flex-start; } button { min-height: 29px; } }
      </style>
      <div class="card" id="card">
        <div class="emblem" aria-hidden="true">${FRAME_WALL_ICON}</div>
        <div class="copy"><strong>${widgetEscape(labels[job.status])}</strong><p class="description">${widgetEscape(job.alt || job.prompt || job.slot)}</p>${error}</div>
        <div class="actions">${action}<button class="menu" data-action="menu" aria-label="Illustration actions for ${widgetEscape(job.alt || job.slot)}">⋯</button></div>
      </div>
      <script>
        const send = (type) => window.spindleSandbox.postMessage({ type })
        const card = document.getElementById('card')
        let timer = null, menuAt = 0
        const cancel = () => { clearTimeout(timer); timer = null }
        const menu = () => { cancel(); if (Date.now() - menuAt < 700) return; menuAt = Date.now(); send('menu') }
        document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => { cancel(); button.dataset.action === 'menu' ? menu() : send(button.dataset.action) }))
        card.addEventListener('contextmenu', (event) => { event.preventDefault(); const button = event.target.closest('button'); if (!button || button.dataset.action === 'menu') menu() })
        card.addEventListener('touchstart', (event) => {
          cancel()
          if (event.touches.length !== 1 || event.target.closest('button')) return
          timer = setTimeout(menu, 520)
        }, { passive: true })
        card.addEventListener('touchmove', cancel, { passive: true })
        card.addEventListener('touchend', cancel)
        card.addEventListener('touchcancel', cancel)
        window.addEventListener('pagehide', cancel)
      </script>`
    this.upsertWidget(job, html, (message: any) => {
      void this.handleWidgetAction(this.jobs.get(job.id) || job, String(message?.type || ""))
    })
  }

  private async handleWidgetAction(job: TaggedImageJobView, action: string): Promise<void> {
    this.sourceSnapshot = null
    if (this.destroyed || !this.isSelected(job)) return
    if ((action === "generate" && job.status === "requested") || (action === "retry" && ["failed", "cancelled"].includes(job.status))) {
      this.retry(job, "current")
      return
    }
    if (action === "attach" && job.status === "ready" && !job.inserted && job.error) {
      job.error = ""
      this.render(job)
      this.sendJobRequest(job, {
        type: "retry_tagged_attachment",
        requestId: createRequestId(),
        jobId: job.id,
        messageId: job.messageId,
        swipeId: job.swipeId,
      })
      return
    }
    if (action !== "menu") return
    await this.showJobMenu(job, Math.round(window.innerWidth / 2), Math.round(window.innerHeight / 2))
  }

  private openAnchoredImageMenu(job: TaggedImageJobView, trigger: HTMLElement): Promise<void> {
    if (trigger.getAttribute("aria-expanded") === "true" && this.closeImageMenu) {
      this.closeImageMenu()
      return Promise.resolve()
    }
    const rect = trigger.getBoundingClientRect()
    return this.showJobMenu(job, rect.right, rect.bottom, { rect, trigger })
  }

  private showImageMenu(items: InlineImageMenuItem[], x: number, y: number, rect?: DOMRect, trigger?: HTMLElement): Promise<{ selectedKey: string | null }> {
    this.closeImageMenu?.()
    return new Promise(resolve => {
      const menu = element("div", "ss-inline-image-menu")
      menu.setAttribute("role", "menu")
      menu.setAttribute("aria-label", "Image actions")
      const title = element("div", "ss-inline-menu-title", "Image actions")
      title.setAttribute("aria-hidden", "true")
      menu.append(title)
      const cleanup = (selectedKey: string | null, restoreFocus = false) => {
        if (this.closeImageMenu !== close) return
        this.closeImageMenu = null
        menu.remove()
        window.removeEventListener("pointerdown", outside, true)
        window.removeEventListener("keydown", keydown, true)
        window.removeEventListener("resize", close)
        window.removeEventListener("scroll", scroll, true)
        trigger?.setAttribute("aria-expanded", "false")
        if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true })
        resolve({ selectedKey })
      }
      const close = () => cleanup(null)
      const outside = (event: Event) => {
        const path = event.composedPath()
        if (!path.includes(menu) && !(trigger && path.includes(trigger))) close()
      }
      const scroll = (event: Event) => {
        if (event.target !== menu) close()
      }
      const keydown = (event: KeyboardEvent) => {
        const buttons = [...menu.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")]
        if (event.key === "Tab") { close(); return }
        if (!["Escape", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return
        event.preventDefault()
        event.stopImmediatePropagation()
        if (event.key === "Escape") { cleanup(null, true); return }
        if (!buttons.length) return
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
        const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
          : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length
        buttons[next].focus()
      }
      this.closeImageMenu = close
      const icons: Record<string, string> = {
        artwork: SPARKLE_ICON, inpaint: INPAINT_ICON, replace: INIT_IMAGE_ICON, finalize: EXPAND_ICON, draft: INIT_IMAGE_ICON,
        final: INIT_IMAGE_ICON, "cancel-upscale": MINIMIZE_ICON, "retry-current": INLINE_IMAGE_ACTION_ICON,
        "retry-original": INLINE_IMAGE_ACTION_ICON, edit: SPARKLE_ICON, "prompt-diagnostics": PROMPT_DIAGNOSTICS_ICON, studio: FRAME_WALL_ICON,
        library: LIBRARY_ICON, "remove-chat": TRASH_ICON,
      }
      for (const item of items) {
        if (item.type === "divider") {
          const separator = element("div", "ss-inline-menu-separator")
          separator.setAttribute("role", "separator")
          menu.append(separator)
          continue
        }
        const button = element("button", "ss-inline-menu-action")
        button.type = "button"
        button.tabIndex = -1
        button.setAttribute("role", "menuitem")
        button.disabled = Boolean(item.disabled)
        if (item.danger) button.dataset.danger = "true"
        const icon = element("span", "ss-inline-menu-icon")
        icon.innerHTML = icons[item.key] || ""
        button.append(icon, element("span", "", item.label))
        button.addEventListener("click", () => cleanup(item.key, true))
        menu.append(button)
      }
      const viewport = document.documentElement
      viewport.append(menu)
      const bounds = menu.getBoundingClientRect()
      const safeTop = (parseFloat(getComputedStyle(viewport).getPropertyValue("--app-interactive-safe-top")) || 0) + 8
      const left = rect ? rect.right - bounds.width : x
      const below = y + 6
      const top = rect && below + bounds.height > viewport.clientHeight - 8 ? rect.top - bounds.height - 6 : below
      menu.style.left = `${clamp(left, 8, Math.max(8, viewport.clientWidth - bounds.width - 8))}px`
      menu.style.top = `${clamp(top, safeTop, Math.max(safeTop, viewport.clientHeight - bounds.height - 8))}px`
      trigger?.setAttribute("aria-expanded", "true")
      window.addEventListener("pointerdown", outside, true)
      window.addEventListener("keydown", keydown, true)
      window.addEventListener("resize", close)
      window.addEventListener("scroll", scroll, true)
      menu.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus({ preventScroll: true })
    })
  }

  private async showJobMenu(job: TaggedImageJobView, x: number, y: number, anchor?: { context?: boolean; rect?: DOMRect; trigger?: HTMLElement }): Promise<void> {
    if (this.destroyed || !this.isSelected(job)) return
    const expectedImageId = job.imageId
    const variantBusy = [...this.variantRequests.values()].includes(job.id)
    const hasImage = job.status === "ready" && job.inserted && Boolean(expectedImageId)
    const canFinalize = job.output !== "url" && hasImage
    const items: InlineImageMenuItem[] = [
      ...(this.editInlineImage && hasImage ? [
        { key: "artwork", label: "Open in Edit", disabled: variantBusy },
        { key: "inpaint", label: "Inpaint", disabled: variantBusy },
        { key: "replace", label: "Replace image…", disabled: variantBusy },
      ] : []),
      ...(canFinalize ? [job.finalImageId === expectedImageId
        ? { key: "draft", label: "Show draft", disabled: variantBusy }
        : job.finalImageId
          ? { key: "final", label: "Show final", disabled: variantBusy }
          : variantBusy ? { key: "cancel-upscale", label: "Cancel upscale" }
            : { key: "finalize", label: "Finalize · upscale 2×" }] : []),
      { key: "retry-current", label: job.inserted ? "Regenerate with Studio settings" : job.status === "requested" ? "Generate with current Studio settings" : "Retry with current Studio settings" },
      { key: "retry-original", label: "Retry with original settings", disabled: !job.clientJobId },
      { key: "edit", label: "Edit prompt in Quick Create", disabled: !job.prompt && !this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot, job.swipeId)) },
      { key: "prompt-diagnostics", label: "Inspect request & compiled prompt", disabled: !job.prompt },
      { key: "divider", label: "", type: "divider" },
      { key: "studio", label: "Open Swarm Studio" },
      { key: "library", label: "Open output library" },
      { key: "remove-divider", label: "", type: "divider" },
      { key: "remove-chat", label: "Remove from chat", danger: true, disabled: !job.inserted || variantBusy },
    ]
    const result = anchor && (anchor.rect?.width || anchor.context)
      ? await this.showImageMenu(items, x, y, anchor.rect, anchor.trigger)
      : await this.ctx.ui.showContextMenu({ position: { x: Math.max(8, Math.round(x)), y: Math.max(8, Math.round(y)) }, items })
    this.sourceSnapshot = null
    if (this.destroyed || !this.isSelected(job)) return
    job = this.jobs.get(job.id) || job
    if ((result.selectedKey === "inpaint" || result.selectedKey === "replace" || result.selectedKey === "artwork") &&
        hasImage && expectedImageId === job.imageId && ![...this.variantRequests.values()].includes(job.id)) {
      const jobId = job.id
      this.editInlineImage?.(result.selectedKey, {
        jobId, imageId: expectedImageId, replace: (id, expected = expectedImageId) => this.replaceInlineImage(jobId, expected, id),
      })
    }
    if (result.selectedKey === "cancel-upscale") {
      this.ctx.sendToBackend({ type: "cancel_inline_upscale", requestId: createRequestId(), jobId: job.id })
    }
    if (["finalize", "draft", "final"].includes(result.selectedKey) && expectedImageId === job.imageId &&
        ![...this.variantRequests.values()].includes(job.id)) {
      const requestId = createRequestId()
      this.variantRequests.set(requestId, job.id)
      try {
        this.ctx.sendToBackend({ type: "select_inline_variant", requestId, jobId: job.id, imageId: expectedImageId, action: result.selectedKey })
      } catch (error) {
        this.variantRequests.delete(requestId)
        throw error
      }
    }
    if (result.selectedKey === "retry-current") this.retry(job, "current")
    if (result.selectedKey === "retry-original") this.retry(job, "original")
    if (result.selectedKey === "edit") {
      const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot, job.swipeId))
      const prompt = String(job.sourcePrompt ?? tag?.content ?? job.prompt)
      const opened = this.openQuickCreateWithPrompt(prompt, job.negativePrompt, (editedPrompt, editedNegative) => {
        this.retry(job, "current", {
          prompt: editedPrompt,
          negativePrompt: editedNegative,
        })
      })
      if (!opened) this.openStudioWithPrompt(prompt, job.negativePrompt)
    }
    if (result.selectedKey === "prompt-diagnostics") this.showPromptDiagnostics(job)
    if (result.selectedKey === "studio") this.openStudioWithPrompt("", "")
    if (result.selectedKey === "library") this.openLibrary()
    if (result.selectedKey === "remove-chat") {
      this.ctx.sendToBackend({
        type: "remove_tagged_image_from_chat",
        requestId: createRequestId(),
        jobId: job.id,
      })
    }
  }

  private showPromptDiagnostics(job: TaggedImageJobView): void {
    this.promptDiagnostics?.remove()
    const dialog = document.createElement("dialog")
    dialog.className = "ss-inline-prompt-diagnostics"
    applyAppearanceVariables(dialog, storedStudioAppearance())
    const header = document.createElement("header"); header.className="ss-diagnostic-heading"
    const heading=document.createElement("h2");heading.textContent="Inline prompt diagnostics"
    const closeTop=document.createElement("button");closeTop.type="button";closeTop.textContent="×";closeTop.setAttribute("aria-label","Close diagnostics");closeTop.addEventListener("click",()=>dialog.close())
    header.append(heading,closeTop);dialog.append(header)
    const body=document.createElement("div");body.className="ss-diagnostic-body";dialog.append(body)
    const mode = document.createElement("p"); mode.textContent = job.promptCompiler ? `Compiler: ${promptFamilyLabel(job.promptCompiler)}` : "Compiler: not recorded (legacy or pending)"; body.append(mode)
    if (job.inserted && job.error) { const note = document.createElement("p"); note.textContent = `Previous illustration retained. Last attempt: ${job.error}`; body.append(note) }
    for (const line of job.compilerDiagnostics || []) { const note=document.createElement("p"); note.textContent=line; body.append(note) }
    for (const [label,value] of [["Authored request body",job.sourcePrompt ?? this.tagPayloads.get(this.lookupKey(job.chatId,job.messageId,job.slot,job.swipeId))?.content ?? "Not retained"],["Compiled positive prompt (sent to provider)",job.clientJobId ? job.prompt : "Not generated yet"],["Negative prompt",job.negativePrompt]]) {
      const caption=document.createElement("label"); caption.style.cssText="display:block;margin-top:10px;font-weight:600;"; caption.textContent=label
      const text=document.createElement("textarea");text.readOnly=true;text.value=value;text.rows=5;text.style.cssText="display:block;width:100%;box-sizing:border-box;resize:vertical;margin-top:4px;padding:8px;background:transparent;color:inherit;border:1px solid var(--lumiverse-border,#555);border-radius:6px;font:12px/1.5 monospace;";caption.append(text);body.append(caption)
    }
    const loreHeading=document.createElement("h3");loreHeading.textContent="Visual Lore contributions";loreHeading.style.marginTop="12px";body.append(loreHeading)
    if (job.loreDiagnostics?.length) {
      const list=document.createElement("ul");list.style.cssText="padding-inline-start:20px;overflow-wrap:anywhere;";
      for (const line of job.loreDiagnostics) { const row=document.createElement("li");row.textContent=line;list.append(row) }
      body.append(list)
    } else { const note=document.createElement("p");note.textContent=job.loreDiagnostics ? "No explicit visual lore contributions." : "Not recorded for this request.";body.append(note) }
    const close=document.createElement("button");close.type="button";close.textContent="Close";close.addEventListener("click",()=>dialog.close());const footer=document.createElement("footer");footer.append(close);dialog.append(footer)
    this.promptDiagnostics = dialog
    dialog.addEventListener("close",()=>{dialog.remove();if(this.promptDiagnostics===dialog)this.promptDiagnostics=null},{once:true});document.body.append(dialog);dialog.showModal()
  }

  private replaceInlineImage(jobId: string, imageId: string, replacementId: string): Promise<void> {
    this.sourceSnapshot = null
    const current = this.jobs.get(jobId)
    if (!current || !this.isSelected(current) || current.imageId !== imageId || !current.inserted || current.status !== "ready") {
      return Promise.reject(new Error("The original illustration is no longer selected. Reopen its image actions."))
    }
    if ([...this.variantRequests.values()].includes(jobId)) {
      return Promise.reject(new Error("An image action is already in progress for this illustration."))
    }
    return new Promise((resolve, reject) => {
      const requestId = createRequestId()
      const cleanup = () => {
        this.variantRequests.delete(requestId)
        this.replacementRequests.delete(requestId)
      }
      const timer = window.setTimeout(() => {
        cleanup()
        reject(new Error("Lumiverse did not confirm the replacement. Check the chat before retrying."))
      }, 15_000)
      this.variantRequests.set(requestId, jobId)
      this.replacementRequests.set(requestId, { resolve, reject, timer })
      try {
        this.ctx.sendToBackend({ type: "select_inline_variant", action: "replace", jobId, imageId, replacementId, requestId })
      } catch (error) {
        window.clearTimeout(timer)
        cleanup()
        reject(error)
      }
    })
  }

  private retry(
    job: TaggedImageJobView,
    retryMode: "current" | "original",
    overrides?: { prompt: string; negativePrompt: string },
  ): void {
    if (this.destroyed || !this.isSelected(job) || [...this.variantRequests.values()].includes(job.id) || ["queued", "generating"].includes(job.status)) return
    const tag = this.tagPayloads.get(this.lookupKey(job.chatId, job.messageId, job.slot, job.swipeId))
    job.status = "queued"
    job.error = ""
    const inlineFigure = this.inlineFigureForJob(job.id)
    if (inlineFigure) inlineFigure.dataset.state = "queued"
    this.remove(job)
    if (overrides) {
      this.sendJobRequest(job, {
        type: "retry_tagged_job",
        requestId: createRequestId(),
        jobId: job.id,
        retryMode,
        promptOverride: overrides.prompt,
        negativePromptOverride: overrides.negativePrompt,
      })
      return
    }
    if (tag && job.id.startsWith("pending-")) {
      this.sendJobRequest(job, {
        type: "tag_generate",
        requestId: createRequestId(),
        chatId: tag.chatId,
        messageId: tag.messageId,
        fullMatch: tag.fullMatch,
        swipeId: tag.swipeId,
        attrs: tag.attrs,
        content: tag.content,
        force: true,
        retryMode,
      })
      return
    }
    this.sendJobRequest(job, {
      type: "retry_tagged_job",
      requestId: createRequestId(),
      jobId: job.id,
      retryMode,
    })
  }
}
