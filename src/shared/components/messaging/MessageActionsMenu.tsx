import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../../ui";

export type MessageAction = "copy" | "edit" | "share" | "delete";

export type MessageMenuAnchor = {
  x: number;
  y: number;
};

interface MessageActionsMenuProps {
  open: boolean;
  anchor: MessageMenuAnchor | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onAction: (action: MessageAction) => void;
}

const VIEWPORT_PADDING = 10;

function getPortalRoot() {
  return (
    document.querySelector(".theme-root") ??
    document.getElementById("root") ??
    document.body
  );
}

function clampMenuPosition(
  anchor: MessageMenuAnchor,
  width: number,
  height: number,
) {
  const maxLeft = Math.max(
    VIEWPORT_PADDING,
    window.innerWidth - width - VIEWPORT_PADDING,
  );
  const maxTop = Math.max(
    VIEWPORT_PADDING,
    window.innerHeight - height - VIEWPORT_PADDING,
  );

  let left = anchor.x;
  let top = anchor.y + 4;

  if (left + width > window.innerWidth - VIEWPORT_PADDING) {
    left = anchor.x - width;
  }

  if (top + height > window.innerHeight - VIEWPORT_PADDING) {
    top = anchor.y - height - 4;
  }

  return {
    left: Math.min(Math.max(left, VIEWPORT_PADDING), maxLeft),
    top: Math.min(Math.max(top, VIEWPORT_PADDING), maxTop),
  };
}

export function MessageActionsMenu({
  open,
  anchor,
  canEdit = true,
  canDelete = true,
  onClose,
  onAction,
}: MessageActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [portalRoot, setPortalRoot] = useState<Element | null>(null);

  useEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchor || !menuRef.current) {
      return;
    }

    const rect = menuRef.current.getBoundingClientRect();
    setCoords(clampMenuPosition(anchor, rect.width || 196, rect.height || 160));
  }, [anchor, open, canEdit, canDelete]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        menuRef.current &&
        menuRef.current.contains(event.target as Node)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleReposition = () => {
      if (!anchor || !menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      setCoords(
        clampMenuPosition(anchor, rect.width || 196, rect.height || 160),
      );
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [anchor, open, onClose]);

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && anchor ? (
        <motion.div
          ref={menuRef}
          className="message-actions-menu"
          role="menu"
          aria-label="Actions du message"
          style={{ left: coords.left, top: coords.top }}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <button
            type="button"
            className="message-actions-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onAction("copy");
            }}
          >
            <Icon name="copy" size={16} />
            <span>Copier</span>
          </button>

          {canEdit ? (
            <button
              type="button"
              className="message-actions-item"
              role="menuitem"
              onClick={() => {
                onClose();
                onAction("edit");
              }}
            >
              <Icon name="edit" size={16} />
              <span>Modifier</span>
            </button>
          ) : null}

          <button
            type="button"
            className="message-actions-item"
            role="menuitem"
            onClick={() => {
              onClose();
              onAction("share");
            }}
          >
            <Icon name="share" size={16} />
            <span>Partager</span>
          </button>

          {canDelete ? (
            <button
              type="button"
              className="message-actions-item danger"
              role="menuitem"
              onClick={() => {
                onClose();
                onAction("delete");
              }}
            >
              <Icon name="trash" size={16} />
              <span>Supprimer</span>
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    portalRoot,
  );
}
