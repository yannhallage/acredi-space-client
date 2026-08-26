import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { Icon } from "../../../shared/ui";

type ChecklistTaskModalProps = {
  description: string;
  isDeleting?: boolean;
  isOpen: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  title: string;
};

export function ChecklistTaskModal({
  description,
  isDeleting = false,
  isOpen,
  isSaving,
  mode,
  onClose,
  onDelete,
  onDescriptionChange,
  onSubmit,
  onTitleChange,
  title,
}: ChecklistTaskModalProps) {
  const isBusy = isSaving || isDeleting;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(false);
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isBusy, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="cl-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isBusy) onClose();
          }}
        >
          <motion.form
            className="cl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cl-task-modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) {
                setError(true);
                return;
              }
              onSubmit();
            }}
          >
            <header className="cl-modal-head">
              <h2 id="cl-task-modal-title">
                {mode === "edit" ? "Modifier la tâche" : "Nouvelle tâche"}
              </h2>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isBusy}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="cl-modal-field">
              <span>Titre</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => {
                  setError(false);
                  onTitleChange(event.target.value);
                }}
                placeholder="Titre de la tâche"
                disabled={isBusy}
              />
              {error ? <em>Le titre est obligatoire.</em> : null}
            </label>

            <label className="cl-modal-field">
              <span>Description</span>
              <textarea
                rows={5}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Description"
                disabled={isBusy}
              />
            </label>

            <footer className="cl-modal-actions">
              {mode === "edit" && onDelete ? (
                <button
                  className="button danger"
                  type="button"
                  onClick={onDelete}
                  disabled={isBusy}
                >
                  {isDeleting ? (
                    <>
                      <ClipLoader size={14} color="currentColor" />
                      Suppression...
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </button>
              ) : null}
              <span className="cl-modal-actions-spacer" />
              <button
                className="button ghost"
                type="button"
                onClick={onClose}
                disabled={isBusy}
              >
                Annuler
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={!title.trim() || isBusy}
              >
                {isSaving ? (
                  <>
                    <ClipLoader size={14} color="#ffffff" />
                    {mode === "edit" ? "Enregistrement..." : "Ajout..."}
                  </>
                ) : mode === "edit" ? (
                  "Enregistrer"
                ) : (
                  "Ajouter"
                )}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
