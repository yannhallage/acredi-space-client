import { motion } from "framer-motion";

import {
  feedback,
  resolveActionFeedback,
} from "../../../../shared/feedback";
import type { AdminRole } from "../../../../shared/types";
import { FeedbackBanner, Icon } from "../../../../shared/ui";
import { ROLE_OPTIONS } from "../../utils";

export function InviteUserModal({
  name,
  email,
  role,
  error,
  isPending,
  onNameChange,
  onEmailChange,
  onRoleChange,
  onClose,
  onSubmit,
}: {
  name: string;
  email: string;
  role: AdminRole;
  error?: unknown;
  isPending: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (role: AdminRole) => void;
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
        aria-label="Invite user"
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
          <h2>Invite user</h2>
          <div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close invite user"
              onClick={onClose}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </header>

        <label className="note-field">
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Full name"
            autoFocus
          />
        </label>

        <label className="note-field">
          <span>Email</span>
          <input
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="name@company.com"
            type="email"
          />
        </label>

        <label className="note-field">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => onRoleChange(event.target.value as AdminRole)}
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
                "Invitation impossible",
                "Nous n’avons pas pu inviter cet utilisateur. Réessayez dans un moment.",
              ),
            )}
          />
        ) : null}

        <footer>
          <button className="button ghost" type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="button primary notes-submit"
            type="submit"
            disabled={!name.trim() || !email.trim() || isPending}
          >
            {isPending ? "Invitation..." : "Invite"}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
}
