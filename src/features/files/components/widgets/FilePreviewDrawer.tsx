import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import type { WorkspaceFile } from "../../../../shared/api/files";
import { Icon } from "../../../../shared/ui";

import { getFileExtension, type PreviewState } from "../../filePreview";
import { formatFileDate, formatFileSize } from "../../utils";
import { FilePreviewContent } from "./FilePreviewContent";

export function FilePreviewDrawer({
  actions,
  details,
  file,
  onClose,
  preview,
  subtitle,
}: {
  actions: ReactNode;
  details: Array<{ label: string; value: string }>;
  file: WorkspaceFile | null;
  onClose: () => void;
  preview: PreviewState;
  subtitle: string;
}) {
  return (
    <AnimatePresence>
      {file ? (
        <motion.aside
          className="files-preview-drawer"
          key={file.id}
          initial={{ opacity: 0, x: 360 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 360 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          aria-label={`Apercu ${file.name}`}
        >
          <header className="files-preview-header">
            <div>
              <span>{subtitle}</span>
              <h2>{file.name}</h2>
            </div>
            <button
              className="files-preview-close"
              type="button"
              aria-label="Fermer l'apercu"
              onClick={onClose}
            >
              <Icon name="x" size={15} />
            </button>
          </header>

          <div className="files-preview-surface">
            <FilePreviewContent file={file} preview={preview} />
          </div>

          <div className="files-preview-actions">{actions}</div>

          <dl className="files-preview-details">
            <div>
              <dt>Type</dt>
              <dd>{getFileExtension(file)}</dd>
            </div>
            <div>
              <dt>Taille</dt>
              <dd>{formatFileSize(file.size)}</dd>
            </div>
            <div>
              <dt>Modifie</dt>
              <dd>{formatFileDate(file.updatedAt)}</dd>
            </div>
            {details.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
