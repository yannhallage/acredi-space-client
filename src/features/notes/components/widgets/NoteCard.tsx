import { ClipLoader } from "react-spinners";

import { PERMISSIONS, PermissionGate } from "../../../../shared/permissions";
import { Icon } from "../../../../shared/ui";
import type { NoteCardModel } from "../../utils";

type NoteCardProps = {
  isDeleting: boolean;
  note: NoteCardModel;
  onDelete: (id: string) => void;
  onEdit: (note: NoteCardModel) => void;
  onShare: (note: NoteCardModel) => void;
  onView: (note: NoteCardModel) => void;
};

export function NoteCard({
  isDeleting,
  note,
  onDelete,
  onEdit,
  onView,
}: NoteCardProps) {
  return (
    <article
      className="nb-grid-item nb-card"
      style={{ backgroundColor: note.displayColor }}
      onDoubleClick={() => onEdit(note)}
    >
      {note.formattedDate ? (
        <time className="nb-time">{note.formattedDate}</time>
      ) : null}

      <h2 className="nb-title">{note.title}</h2>

      <p className="nb-content">{note.content || "No content yet."}</p>

      <footer className="nb-footer">
        <PermissionGate permission={PERMISSIONS.VIEW_NOTES}>
          <button
            className="nb-action"
            type="button"
            aria-label={`Voir ${note.title}`}
            disabled={isDeleting}
            onClick={() => onView(note)}
          >
            <Icon name="eye" size={14} />
          </button>
        </PermissionGate>

        <PermissionGate permission={PERMISSIONS.DELETE_NOTES}>
          <button
            className="nb-action nb-action-danger"
            type="button"
            aria-label={`Supprimer ${note.title}`}
            disabled={isDeleting}
            onClick={() => onDelete(note.id)}
          >
            {isDeleting ? (
              <ClipLoader size={12} color="currentColor" />
            ) : (
              <Icon name="trash" size={14} />
            )}
          </button>
        </PermissionGate>
      </footer>
    </article>
  );
}
