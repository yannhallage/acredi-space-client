import { useEffect, useState, type FormEvent } from "react";
import type { LocalGroupMessage } from "../utils/messageFormat";

interface GroupEditMessageModalProps {
  open: boolean;
  message: LocalGroupMessage | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (content: string) => void;
}
interface GroupMessageErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function GroupMessageErrorModal({
  open,
  message,
  onClose,
}: GroupMessageErrorModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dm-modal-backdrop" onClick={onClose}>
      <div
        className="dm-message-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dm-message-modal-header">
          <span className="dm-message-modal-icon danger">!</span>

          <div>
            <h3>Action impossible</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="dm-message-modal-actions">
          <button
            className="dm-modal-primary-button"
            type="button"
            onClick={onClose}
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
export function GroupEditMessageModal({
  open,
  message,
  submitting = false,
  onClose,
  onConfirm,
}: GroupEditMessageModalProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open && message) {
      setContent(message.content ?? "");
    }
  }, [open, message]);

  if (!open || !message) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = content.trim();

    if (!value) {
      return;
    }

    onConfirm(value);
  }

  return (
    <div className="dm-modal-backdrop" onClick={onClose}>
      <form
        className="dm-message-modal"
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dm-message-modal-header">
          <span className="dm-message-modal-icon">✎</span>

          <div>
            <h3>Modifier le message</h3>
            <p>Corrige ton message avant de l’enregistrer.</p>
          </div>
        </div>

        <textarea
          autoFocus
          value={content}
          rows={5}
          disabled={submitting}
          placeholder="Votre message..."
          onChange={(event) => setContent(event.target.value)}
        />

        <div className="dm-message-modal-actions">
          <button
            className="dm-modal-secondary-button"
            type="button"
            disabled={submitting}
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="dm-modal-primary-button"
            type="submit"
            disabled={submitting || !content.trim()}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface GroupDeleteMessageModalProps {
  open: boolean;
  message: LocalGroupMessage | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function GroupDeleteMessageModal({
  open,
  message,
  submitting = false,
  onClose,
  onConfirm,
}: GroupDeleteMessageModalProps) {
  if (!open || !message) {
    return null;
  }

  return (
    <div className="dm-modal-backdrop" onClick={onClose}>
      <div
        className="dm-message-modal dm-message-delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dm-message-modal-header">
          <span className="dm-message-modal-icon danger">🗑</span>

          <div>
            <h3>Supprimer ce message ?</h3>
            <p>
              Le message sera remplacé par une indication de suppression dans la
              discussion de groupe.
            </p>
          </div>
        </div>

        <div className="dm-delete-preview">
          {message.content?.trim() || "Message sans texte"}
        </div>

        <div className="dm-message-modal-actions">
          <button
            className="dm-modal-secondary-button"
            type="button"
            disabled={submitting}
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            className="dm-modal-danger-button"
            type="button"
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}