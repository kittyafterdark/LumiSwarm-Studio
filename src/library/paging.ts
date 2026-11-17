function outputLibraryPageSize(viewportWidth: number, columns = 0, rows = 0): number {
  if (viewportWidth <= 720) return 15
  return columns > 0 && rows > 0 ? Math.max(30, columns * rows) : 30
}

function setOutputLibraryView(
  library: { dataset: Record<string, string | undefined> },
  landingSurface: { hidden: boolean | string },
  folderSurface: { hidden: boolean | string },
  view: "folders" | "folder",
): void {
  library.dataset.view = view
  landingSurface.hidden = view !== "folders"
  folderSurface.hidden = view !== "folder"
}
