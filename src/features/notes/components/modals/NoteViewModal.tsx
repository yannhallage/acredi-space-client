import { useEffect } from "react";
import { motion } from "framer-motion";

import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";
import {
  getMutedTextColor,
  getTextColor,
  type NoteCardModel,
} from "../../utils";

type NoteViewModalProps = {
  note: NoteCardModel;
  onClose: () => void;
  onEdit: (note: NoteCardModel) => void;
};

export function NoteViewModal({ note, onClose, onEdit }: NoteViewModalProps) {
  const textColor = getTextColor(note.displayColor);
  const mutedTextColor = getMutedTextColor(textColor);
  const ownerInitial = note.ownerName.trim().charAt(0).toUpperCase() || "A";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="note-modal-overlay note-view-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onMouseDown={onClose}
    >
      <motion.section
        className="note-modal nb-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-view-title"
        initial={{ opacity: 0, y: 18, scale: 0.96, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 12, scale: 0.97, rotate: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
        style={{ backgroundColor: note.displayColor }}
      >
        <header className="nb-view-header">
          {note.formattedDate ? (
            <time className="nb-time">{note.formattedDate}</time>
          ) : null}

          <button
            className="nb-action"
            type="button"
            aria-label="Fermer la note"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <article className="nb-view-body">
          <h2 id="note-view-title" style={{ color: textColor }}>
            {note.title}
          </h2>
          <p style={{ color: mutedTextColor }}>
            {note.content || "No content yet."}
          </p>
        </article>

        <footer className="nb-view-footer">
          <span className="nb-view-owner">
            <i>{ownerInitial}</i>
            <strong style={{ color: textColor }}>{note.ownerName}</strong>
          </span>

          <div className="nb-view-actions">
            <PermissionGate permission={PERMISSIONS.UPDATE_NOTES}>
              <button
                className="button ghost mini nb-view-edit"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(note);
                }}
              >
                <Icon name="edit" size={14} />
                Modifier
              </button>
            </PermissionGate>
            <time style={{ color: mutedTextColor }}>{note.updatedLabel}</time>
          </div>
        </footer>
      </motion.section>
    </motion.div>
  );
}
