import { motion } from "framer-motion";

import {
  feedback,
  resolveActionFeedback,
} from "../../../../shared/feedback";
import type { AdminRole } from "../../../../shared/types";
import { FeedbackBanner, Icon } from "../../../../shared/ui";
import { ROLE_OPTIONS } from "../../utils";

export function EditUserModal({
  editName,
  editEmail,
  editRole,
  error,
  isPending,
  onEditNameChange,
  onEditEmailChange,
  onEditRoleChange,
  onClose,
  onSubmit,
}: {
  editName: string;
  editEmail: string;
  editRole: AdminRole;
  error?: unknown;
  isPending: boolean;
  onEditNameChange: (value: string) => void;
  onEditEmailChange: (value: string) => void;
  onEditRoleChange: (role: AdminRole) => void;
  onClose: () => void;
  onSubmit: () => void;
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
      <motion.form
        className="note-modal users-note-modal"
        aria-label="Modifier utilisateur"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <header>
          <h2>Modifier utilisateur</h2>
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

        <label className="note-field">
          <span>Nom complet</span>
          <input
            value={editName}
            onChange={(event) => onEditNameChange(event.target.value)}
            placeholder="Nom complet"
            autoFocus
          />
        </label>

        <label className="note-field">
          <span>Email</span>
          <input
            value={editEmail}
            onChange={(event) => onEditEmailChange(event.target.value)}
            placeholder="name@company.com"
            type="email"
          />
        </label>

        <label className="note-field">
          <span>Rôle</span>
          <select
            value={editRole}
            onChange={(event) =>
              onEditRoleChange(event.target.value as AdminRole)
            }
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <FeedbackBanner
            feedback={resolveActionFeedback(
              error,
              feedback(
                "error",
                "Modification impossible",
                "Nous n’avons pas pu modifier cet utilisateur. Réessayez dans un moment.",
              ),
            )}
          />
        ) : null}

        <footer>
          <button className="button ghost" type="button" onClick={onClose}>
            Annuler
          </button>

          <button
            className="button primary notes-submit"
            type="submit"
            disabled={!editName.trim() || !editEmail.trim() || isPending}
          >
            {isPending ? "Modification..." : "Modifier"}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
}
