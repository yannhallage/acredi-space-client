import { useEffect } from "react";
import { motion } from "framer-motion";

import type { Feedback } from "../../../../shared/feedback";
import { FeedbackBanner, Icon } from "../../../../shared/ui";
import type { Team } from "../../types";

export function DeleteTeamConfirmModal({
  error,
  isDeleting,
  onClose,
  onConfirm,
  team,
}: {
  error: Feedback | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  team: Team;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDeleting, onClose]);

  return (
    <motion.div
      className="note-modal-overlay team-delete-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
    >
      <motion.section
        className="note-modal team-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="team-delete-title"
        aria-describedby="team-delete-description"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div className="team-delete-title">
            <span className="team-delete-icon">
              <Icon name="alert" size={18} />
            </span>
            <div>
              <h2 id="team-delete-title">Supprimer la team ?</h2>
              <small>{team.name}</small>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            disabled={isDeleting}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <p id="team-delete-description">
          Cette action supprimera definitivement la team et ses informations
          associees. Voulez-vous continuer ?
        </p>

        {error ? <FeedbackBanner feedback={error} /> : null}

        <footer>
          <button
            className="button ghost"
            type="button"
            disabled={isDeleting}
            onClick={onClose}
          >
            Non
          </button>
          <button
            className="button danger"
            type="button"
            disabled={isDeleting}
            onClick={() => {
              onConfirm().catch(() => undefined);
            }}
          >
            <Icon name="trash" size={14} />
            {isDeleting ? "Suppression..." : "Oui, supprimer"}
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}
