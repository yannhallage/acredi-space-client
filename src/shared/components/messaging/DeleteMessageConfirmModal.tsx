import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../../ui";

interface DeleteMessageConfirmModalProps {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteMessageConfirmModal({
  open,
  isPending = false,
  onClose,
  onConfirm,
}: DeleteMessageConfirmModalProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPending, onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="note-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={() => {
            if (!isPending) onClose();
          }}
        >
          <motion.div
            className="note-modal users-note-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Supprimer le message"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <h2>Supprimer le message</h2>
              <div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Fermer"
                  disabled={isPending}
                  onClick={onClose}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </header>

            <p>
              Voulez-vous vraiment supprimer ce message ? Cette action est
              irreversible.
            </p>

            <footer>
              <button
                className="button ghost"
                type="button"
                disabled={isPending}
                onClick={onClose}
              >
                Annuler
              </button>

              <button
                className="button primary notes-submit danger"
                type="button"
                disabled={isPending}
                onClick={onConfirm}
              >
                {isPending ? "Suppression..." : "Supprimer"}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
