import { motion } from "framer-motion";

import {
  feedback,
  resolveActionFeedback,
} from "../../../../shared/feedback";
import type { User } from "../../../../shared/types";
import { FeedbackBanner, Icon } from "../../../../shared/ui";

export function DeleteUserConfirmModal({
  user,
  error,
  isPending,
  onClose,
  onConfirm,
}: {
  user: User;
  error?: unknown;
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

        <FeedbackBanner
          feedback={feedback(
            "warning",
            "Action irréversible",
            "Cette suppression ne pourra pas être annulée.",
          )}
        />

        {error ? (
          <FeedbackBanner
            feedback={resolveActionFeedback(
              error,
              feedback(
                "error",
                "Suppression impossible",
                "Nous n’avons pas pu supprimer cet utilisateur. Réessayez dans un moment.",
              ),
            )}
          />
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
