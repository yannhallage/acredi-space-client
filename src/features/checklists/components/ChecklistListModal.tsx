import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { Icon } from "../../../shared/ui";

type ChecklistListModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  mode?: "create" | "rename";
  onClose: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  title: string;
};

export function ChecklistListModal({
  isOpen,
  isSaving,
  mode = "create",
  onClose,
  onSubmit,
  onTitleChange,
  title,
}: ChecklistListModalProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(false);
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

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
            if (!isSaving) onClose();
          }}
        >
          <motion.form
            className="cl-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cl-list-modal-title"
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
              <h2 id="cl-list-modal-title">
                {mode === "rename" ? "Renommer la checklist" : "Nouvelle checklist"}
              </h2>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isSaving}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="cl-modal-field">
              <span>Nom de la checklist</span>
              <input
                autoFocus
                value={title}
                onChange={(event) => {
                  setError(false);
                  onTitleChange(event.target.value);
                }}
                placeholder="Ex. My Tasks"
                disabled={isSaving}
              />
              {error ? <em>Le nom est obligatoire.</em> : null}
            </label>

            <footer className="cl-modal-actions">
              <button
                className="button ghost"
                type="button"
                onClick={onClose}
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={!title.trim() || isSaving}
              >
                {isSaving ? (
                  <>
                    <ClipLoader size={14} color="#ffffff" />
                    {mode === "rename" ? "Enregistrement..." : "Création..."}
                  </>
                ) : mode === "rename" ? (
                  "Enregistrer"
                ) : (
                  "Créer"
                )}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
