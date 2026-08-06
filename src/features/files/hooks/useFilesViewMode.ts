import { useCallback, useState } from "react";

export type FilesViewMode = "grid" | "list";

const STORAGE_KEY = "acredi-files-view-mode";

function readStoredViewMode(): FilesViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "grid" || stored === "list") {
      return stored;
    }
  } catch {
    // Ignore storage access errors.
  }

  return "grid";
}

export function useFilesViewMode() {
  const [viewMode, setViewModeState] = useState<FilesViewMode>(readStoredViewMode);

  const setViewMode = useCallback((mode: FilesViewMode) => {
    setViewModeState(mode);

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  return { setViewMode, viewMode };
}
