import { useCallback, useState } from "react";

import type { WorkspaceFile } from "../../../shared/api/files";

import type { PreviewState } from "../filePreview";
import {
  getCachedFilePreviewUrl,
  loadFilePreviewUrl,
  prefetchFilePreviewUrl,
} from "../filePreviewUrlCache";

const emptyPreview: PreviewState = {
  error: null,
  fileId: null,
  loading: false,
  url: null,
};

export function useFilePreviewLoader() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(emptyPreview);

  const openPreview = useCallback(async (file: WorkspaceFile) => {
    const cachedUrl = getCachedFilePreviewUrl(file.id);

    setSelectedFileId(file.id);
    setPreview({
      error: null,
      fileId: file.id,
      loading: !cachedUrl,
      url: cachedUrl,
    });

    try {
      const url = await loadFilePreviewUrl(file.id);

      setPreview((current) =>
        current.fileId === file.id
          ? {
              error: null,
              fileId: file.id,
              loading: false,
              url,
            }
          : current,
      );
    } catch (caughtError) {
      setPreview((current) =>
        current.fileId === file.id
          ? {
              error:
                caughtError instanceof Error
                  ? caughtError.message
                  : "Impossible de charger l'apercu.",
              fileId: file.id,
              loading: false,
              url: null,
            }
          : current,
      );
    }
  }, []);

  const closePreview = useCallback(() => {
    setSelectedFileId(null);
  }, []);

  const prefetchNeighbors = useCallback(
    (files: WorkspaceFile[], currentFileId: string) => {
      const index = files.findIndex((file) => file.id === currentFileId);

      if (index < 0) {
        return;
      }

      const previous = files[index - 1];
      const next = files[index + 1];

      if (previous) {
        prefetchFilePreviewUrl(previous.id);
      }

      if (next) {
        prefetchFilePreviewUrl(next.id);
      }
    },
    [],
  );

  return {
    closePreview,
    openPreview,
    prefetchNeighbors,
    preview,
    selectedFileId,
    setSelectedFileId,
  };
}
