interface MessageActionMenuProps {
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

export function MessageActionMenu({
  open,
  x,
  y,
  canEdit,
  canDelete,
  onForward,
  onEdit,
  onDelete,
  onClose,
}: MessageActionMenuProps) {
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
        zIndex: 1000,
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          onForward();
          onClose();
        }}
      >
        Transférer
      </button>

      {canEdit ? (
        <button
          type="button"
          onClick={() => {
            onEdit();
            onClose();
          }}
        >
          Modifier
        </button>
      ) : null}

      {/* {canDelete ? (
        <button
          type="button"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          Supprimer
        </button>
      ) : null} */}

      {canDelete ? (
  <button
    type="button"
    onClick={(event) => {
      event.preventDefault();
      event.stopPropagation();

      console.log("CLIC SUPPRIMER DANS MENU");

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