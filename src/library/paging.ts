function outputLibraryPageSize(viewportWidth: number): number {
  return viewportWidth <= 720 ? 15 : 30
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
