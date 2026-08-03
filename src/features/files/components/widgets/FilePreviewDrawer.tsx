import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

import type { WorkspaceFile } from "../../../../shared/api/files";
import { Icon } from "../../../../shared/ui";

import type { PreviewState } from "../../filePreview";
import { FilePreviewContent } from "./FilePreviewContent";

export function FilePreviewDrawer({
  actions,
  file,
  onClose,
  preview,
  subtitle,
}: {
  actions: ReactNode;
  details?: Array<{ label: string; value: string }>;
  file: WorkspaceFile | null;
  onClose: () => void;
  preview: PreviewState;
  subtitle: string;
}) {
  useEffect(() => {
    if (!file) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [file, onClose]);

  return (
    <AnimatePresence>
      {file ? (
        <motion.div
          className="files-preview-overlay"
          key={file.id}
          role="dialog"
          aria-modal="true"
          aria-label={`Apercu ${file.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <header
            className="files-preview-toolbar"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="files-preview-toolbar-title">
              <span>{subtitle}</span>
              <h2>{file.name}</h2>
            </div>

            <div className="files-preview-toolbar-actions">
              {actions}
              <button
                className="files-preview-close"
                type="button"
                aria-label="Fermer l'apercu"
                onClick={onClose}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          </header>

          <motion.div
            className="files-preview-stage"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 32,
              mass: 0.9,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="files-preview-surface">
              <FilePreviewContent file={file} preview={preview} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
