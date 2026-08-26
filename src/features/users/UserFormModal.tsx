import { useState } from "react";

import {
  feedback,
  resolveActionFeedback,
  type Feedback,
} from "../../shared/feedback";
import { FeedbackBanner } from "../../shared/ui";
import type { InviteUserRequest, RoleName } from "./users.types";

interface UserFormModalProps {
  onClose: () => void;
  onInvite: (payload: InviteUserRequest) => Promise<void>;
}

export function UserFormModal({ onClose, onInvite }: UserFormModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState<RoleName>("COLLABORATOR");
  const [message, setMessage] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage(null);

      await onInvite({
        firstName,
        lastName,
        email,
        roleName,
      });

      onClose();
    } catch (error: unknown) {
      setMessage(
        resolveActionFeedback(
          error,
          feedback(
            "error",
            "Invitation impossible",
            "Nous n’avons pas pu inviter cet utilisateur. Réessayez dans un moment.",
          ),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-setting-overlay">
      <form className="modal-setting-panel users-note-modal" onSubmit={handleSubmit}>
        <button type="button" className="modal-setting-close" onClick={onClose}>
          ×
        </button>

        <header>
          <h2>Invite user</h2>
          <p>Un lien d’invitation sera envoyé par email.</p>
        </header>

        <label className="note-field">
          First name
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Grace"
          />
        </label>

        <label className="note-field">
          Last name
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Yeo"
          />
        </label>

        <label className="note-field">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </label>

        <label className="note-field">
          Role
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value as RoleName)}
          >
            <option value="COLLABORATOR">Collaborator</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        {message ? <FeedbackBanner feedback={message} /> : null}

        <div className="button-row">
          <button type="button" className="button ghost" onClick={onClose}>
            Cancel
          </button>

          <button type="submit" className="button primary" disabled={submitting}>
            {submitting ? "Inviting..." : "Invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
