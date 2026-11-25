// Expression Studio workflow preflights share a single component. Each caller
// supplies its backend check and optional workflow-specific actions; this
// factory owns the label, live status, action layout and themeable state.
type StudioWorkflowHealthState =
  | "idle" | "checking" | "installed" | "missing" | "empty"
  | "unconfigured" | "workflow" | "unsupported" | "unavailable" | "unknown"

interface StudioWorkflowHealthOptions {
  title: string
  initialMessage: string
  onCheck: () => void
  className?: string
  actionsBefore?: HTMLElement[]
  actionsAfter?: HTMLElement[]
  helpText?: string
}

interface StudioWorkflowHealthRibbon {
  root: HTMLDivElement
  status: HTMLParagraphElement
  details: HTMLDivElement
  checkButton: HTMLButtonElement
  update: (state: StudioWorkflowHealthState, message: string) => void
  setChecking: (checking: boolean) => void
  setExtrasVisible: (visible: boolean) => void
}

function createStudioWorkflowHealthRibbon(options: StudioWorkflowHealthOptions): StudioWorkflowHealthRibbon {
  const root = element("div", ["ss-expression-model-setup", "ss-expression-workflow-health", options.className || ""].filter(Boolean).join(" "))
  root.dataset.status = "idle"
  const title = element("strong", "", options.title)
  const status = element("p", "ss-muted", options.initialMessage)
  status.setAttribute("role", "status")
  const details = element("div", "ss-expression-model-details")
  const actions = element("div", "ss-expression-model-actions")
  const checkButton = element("button", "ss-button", "Check model")
  checkButton.type = "button"
  checkButton.addEventListener("click", options.onCheck)
  const extraActions = [...(options.actionsBefore || []), ...(options.actionsAfter || [])]
  const initiallyAvailable = new Map(extraActions.map(item => [item, !item.hidden]))
  actions.append(...(options.actionsBefore || []), checkButton, ...(options.actionsAfter || []))
  details.append(actions)
  const help = options.helpText ? element("p", "ss-muted", options.helpText) : null
  if (help) details.append(help)
  root.append(title, status, details)
  return {
    root,
    status,
    details,
    checkButton,
    update(state, message) {
      root.dataset.status = state
      status.textContent = message
    },
    setChecking(checking) {
      checkButton.disabled = checking
    },
    setExtrasVisible(visible) {
      for (const item of extraActions) item.hidden = !visible || !initiallyAvailable.get(item)
      if (help) help.hidden = !visible
    },
  }
}
