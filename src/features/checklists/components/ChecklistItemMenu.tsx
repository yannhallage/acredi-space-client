import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../../../shared/ui";

type ChecklistItemMenuProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSetDeadline: () => void;
  trigger: HTMLElement | null;
};

function getPortalRoot() {
  return document.querySelector(".theme-root") ?? document.body;
}

export function ChecklistItemMenu({
  open,
  onClose,
  onDelete,
  onEdit,
  onSetDeadline,
  trigger,
}: ChecklistItemMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !trigger) {
      setCoords(null);
      return;
    }

    function update() {
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menu = menuRef.current?.getBoundingClientRect();
      const width = menu?.width ?? 168;
      const height = menu?.height ?? 128;
      const padding = 12;
      let left = rect.right - width;
      let top = rect.bottom + 6;

      if (left < padding) left = rect.left;
      if (left + width > window.innerWidth - padding) {
        left = Math.max(padding, window.innerWidth - width - padding);
      }
      if (top + height > window.innerHeight - padding) {
        top = rect.top - height - 6;
      }

      setCoords({ left, top });
    }

    update();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, trigger]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || trigger?.contains(target)) return;
      onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, trigger]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={menuRef}
          className="cl-menu cl-item-menu"
          role="menu"
          style={{
            left: coords?.left ?? 0,
            top: coords?.top ?? -9999,
            visibility: coords ? "visible" : "hidden",
          }}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: coords ? 1 : 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14 }}
        >
          <button
            type="button"
            role="menuitem"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
              window.requestAnimationFrame(onClose);
            }}
          >
            <Icon name="edit" size={16} strokeWidth={2} />
            Modifier
          </button>
          <button
            type="button"
            role="menuitem"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onSetDeadline();
              window.requestAnimationFrame(onClose);
            }}
          >
            <Icon name="calendar" size={16} strokeWidth={2} />
            Deadline
          </button>
          <button
            className="danger"
            type="button"
            role="menuitem"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
              window.requestAnimationFrame(onClose);
            }}
          >
            <Icon name="trash" size={16} strokeWidth={2} />
            Supprimer
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    getPortalRoot(),
  );
}
