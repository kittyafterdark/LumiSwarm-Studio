function isWorkflowCoreParameter(id: string): boolean {
  return WORKFLOW_CORE_PARAMETERS.has(String(id || "").toLowerCase().replace(/[^a-z0-9]+/g, ""))
}
