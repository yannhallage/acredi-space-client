import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import type { WorkspaceFile } from "../../../../shared/api/files";
import { FileIcon, Icon } from "../../../../shared/ui";

import {
  canZoomPreview,
  getFileColor,
  getFileExtension,
  type PreviewState,
} from "../../filePreview";
import { prefetchFilePreviewUrl } from "../../filePreviewUrlCache";
import { FilePreviewContent } from "./FilePreviewContent";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1;
const EXPANDED_ZOOM = 1.75;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction === 0 ? 0 : direction * 80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction === 0 ? 0 : direction * -80,
    opacity: 0,
    scale: 0.98,
  }),
};

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

export function FilePreviewDrawer({
  actions,
  file,
  files = [],
  onClose,
  onNavigate,
  path,
  preview,
  subtitle,
}: {
  actions: ReactNode;
  details?: Array<{ label: string; value: string }>;
  file: WorkspaceFile | null;
  files?: WorkspaceFile[];
  onClose: () => void;
  onNavigate?: (file: WorkspaceFile) => void;
  path?: string;
  preview: PreviewState;
  subtitle: string;
}) {
  const [direction, setDirection] = useState(0);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const currentIndex = file
    ? files.findIndex((entry) => entry.id === file.id)
    : -1;
  const previousFile = currentIndex > 0 ? files[currentIndex - 1] : null;
  const nextFile =
    currentIndex >= 0 && currentIndex < files.length - 1
      ? files[currentIndex + 1]
      : null;
  const canZoom = Boolean(file && canZoomPreview(file));
  const zoomLabel = `${Math.round(zoom * 100)}%`;

  const goTo = useCallback(
    (target: WorkspaceFile | null, nextDirection: 1 | -1) => {
      if (!target || !onNavigate) {
        return;
      }

      setDirection(nextDirection);
      setZoom(DEFAULT_ZOOM);
      onNavigate(target);
    },
    [onNavigate],
  );

  const zoomBy = useCallback((step: number) => {
    setZoom((current) => clampZoom(current + step));
  }, []);

  function toggleZoom() {
    setZoom((current) =>
      current > DEFAULT_ZOOM ? DEFAULT_ZOOM : EXPANDED_ZOOM,
    );
  }

  useEffect(() => {
    if (!file) {
      setDirection(0);
      setZoom(DEFAULT_ZOOM);
      return;
    }

    if (previousFile) {
      prefetchFilePreviewUrl(previousFile.id);
    }

    if (nextFile) {
      prefetchFilePreviewUrl(nextFile.id);
    }
  }, [file, nextFile, previousFile]);

  useEffect(() => {
    if (!file) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(previousFile, -1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(nextFile, 1);
        return;
      }

      if (!canZoom) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(ZOOM_STEP);
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomBy(-ZOOM_STEP);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [canZoom, file, goTo, nextFile, onClose, previousFile, zoomBy]);

  return (
    <AnimatePresence>
      {file ? (
        <motion.div
          className="files-preview-overlay"
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
            <div className="files-preview-toolbar-start">
              <button
                className="files-preview-close"
                type="button"
                aria-label="Fermer l'apercu"
                onClick={onClose}
              >
                <Icon name="x" size={16} />
              </button>

              <div className="files-preview-toolbar-title">
                <span>{subtitle}</span>
                <h2>
                  <FileIcon
                    ext={getFileExtension(file)}
                    color={getFileColor(file)}
                    size={18}
                  />
                  {file.name}
                </h2>
              </div>
            </div>

            <div className="files-preview-toolbar-actions">
              {canZoom ? (
                <div className="files-preview-zoom" role="group" aria-label="Zoom">
                  <button
                    type="button"
                    aria-label="Zoom arriere"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={() => zoomBy(-ZOOM_STEP)}
                  >
                    <Icon name="minus" size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Reinitialiser le zoom"
                    onClick={() => setZoom(DEFAULT_ZOOM)}
                  >
                    <Icon name="search" size={13} />
                    {zoomLabel}
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom avant"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={() => zoomBy(ZOOM_STEP)}
                  >
                    <Icon name="plus" size={14} />
                  </button>
                </div>
              ) : null}

              {actions}
            </div>
          </header>

          <div className="files-preview-stage">
            {previousFile && onNavigate ? (
              <button
                className="files-preview-nav is-prev"
                type="button"
                aria-label={`Fichier precedent, ${previousFile.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(previousFile, -1);
                }}
              >
                <Icon name="chevLeft" size={22} />
              </button>
            ) : null}

            <div
              className="files-preview-stage-frame"
              onClick={(event) => event.stopPropagation()}
            >
              <AnimatePresence custom={direction} initial={false} mode="popLayout">
                <motion.div
                  className="files-preview-surface"
                  key={file.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FilePreviewContent
                    file={file}
                    onToggleZoom={canZoom ? toggleZoom : undefined}
                    preview={preview}
                    zoom={zoom}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {nextFile && onNavigate ? (
              <button
                className="files-preview-nav is-next"
                type="button"
                aria-label={`Fichier suivant, ${nextFile.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(nextFile, 1);
                }}
              >
                <Icon name="chevRight" size={22} />
              </button>
            ) : null}
          </div>

          {path ? (
            <footer
              className="files-preview-footer"
              onClick={(event) => event.stopPropagation()}
            >
              <span>{path}</span>
              <Icon name="chevRight" size={11} />
              <strong>{file.name}</strong>
            </footer>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
