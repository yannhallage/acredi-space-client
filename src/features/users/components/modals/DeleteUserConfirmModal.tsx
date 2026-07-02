import { motion } from "framer-motion";

import type { User } from "../../../../shared/types";
import { Icon } from "../../../../shared/ui";

export function DeleteUserConfirmModal({
  user,
  errorMessage,
  isPending,
  onClose,
  onConfirm,
}: {
  user: User;
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="note-modal-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={onClose}
    >
      <motion.div
        className="note-modal users-note-modal"
        role="dialog"
        aria-label="Supprimer utilisateur"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2>Supprimer utilisateur</h2>
          <div>
            <button
              className="icon-button"
              type="button"
              aria-label="Fermer"
              onClick={onClose}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </header>

        <p>
          Voulez-vous vraiment supprimer <strong>{user.name}</strong> ?
        </p>

        <p className="auth-error text-red-500 text-sm">
          Cette action est irréversible.
        </p>

        {errorMessage ? (
          <p className="auth-error text-red-500 text-sm">{errorMessage}</p>
        ) : null}

        <footer>
          <button className="button ghost" type="button" onClick={onClose}>
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
  );
}
