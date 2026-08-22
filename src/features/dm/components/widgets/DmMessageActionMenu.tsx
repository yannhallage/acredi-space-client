interface DmMessageActionMenuProps {
  open: boolean;
  x: number;
  y: number;
  canEdit: boolean;
  canDelete: boolean;
  onForward: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function DmMessageActionMenu({
  open,
  x,
  y,
  canEdit,
  canDelete,
  onForward,
  onEdit,
  onDelete,
  onClose,
}: DmMessageActionMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="message-action-menu"
      style={{
        position: "fixed",
        top: y,
        left: x,
        zIndex: 99999,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          onForward();
          onClose();
        }}
      >
        Transférer
      </button>

      {canEdit ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onEdit();
            onClose();
          }}
        >
          Modifier
        </button>
      ) : null}

      {canDelete ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            onDelete();
            onClose();
          }}
        >
          Supprimer
        </button>
      ) : null}
    </div>
  );
}